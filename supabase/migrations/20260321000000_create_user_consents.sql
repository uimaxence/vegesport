-- Table des consentements utilisateur (RGPD, newsletter, publicité, partage partenaires)
create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Newsletter (et si mamie était végé ?)
  newsletter boolean not null default false,
  -- Publicité personnalisée (ex. Google Ads, ciblage)
  ads_personnalisation boolean not null default false,
  -- Partage email / données avec partenaires pour offres et mailing ciblés
  partage_partenaires boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table public.user_consents enable row level security;

drop policy if exists "Users can manage own consents" on public.user_consents;
create policy "Users can manage own consents"
  on public.user_consents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_user_consents_user_id on public.user_consents(user_id);

-- Pour export partenaires : liste des emails ayant consenti au partage (à exécuter côté backend/admin)
-- select email from auth.users u join public.user_consents c on c.user_id = u.id where c.partage_partenaires = true;
