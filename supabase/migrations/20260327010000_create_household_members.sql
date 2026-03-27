-- Membres du foyer — chaque utilisateur définit ses convives
-- avec un appétit par défaut (petit / moyen / grand).
-- Utilisé par le planning pour calculer les macros par convive
-- et le total d'ingrédients à préparer.

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  gender text check (gender in ('homme', 'femme', 'autre')),
  appetite text not null default 'moyen'
    check (appetite in ('petit', 'moyen', 'grand')),
  size_factor numeric not null default 1.0
    check (size_factor in (0.7, 1.0, 1.4)),
  is_owner boolean not null default false,
  position integer not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_household_members_user on public.household_members(user_id);


alter table public.household_members enable row level security;

drop policy if exists "Users can manage own household" on public.household_members;
create policy "Users can manage own household"
  on public.household_members for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
