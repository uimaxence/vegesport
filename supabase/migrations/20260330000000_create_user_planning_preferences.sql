create table if not exists public.user_planning_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  objective text not null default 'masse',
  niveau text not null default 'amateur',
  poids numeric not null default 70,
  regime text not null default 'vegetarien',
  meals_per_day integer not null default 4,
  portions integer not null default 2,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table public.user_planning_preferences enable row level security;

drop policy if exists "Users can manage own planning preferences" on public.user_planning_preferences;
create policy "Users can manage own planning preferences"
  on public.user_planning_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_user_planning_preferences_user_id on public.user_planning_preferences(user_id);
