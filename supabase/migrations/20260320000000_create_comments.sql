-- Migration : création de la table comments avec RLS
-- Commentaires liés aux recettes, visibles par tous, écriture/suppression réservée à l'auteur connecté

create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  recipe_id  integer not null references public.recipes(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  user_name  text not null,
  content    text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

-- Lecture publique (commentaires visibles par tous)
create policy "comments_select" on public.comments
  for select using (true);

-- Insertion : uniquement pour l'utilisateur connecté sur son propre user_id
create policy "comments_insert" on public.comments
  for insert with check (auth.uid() = user_id);

-- Suppression : uniquement l'auteur du commentaire
create policy "comments_delete" on public.comments
  for delete using (auth.uid() = user_id);

-- Index pour accélérer les requêtes par recette
create index comments_recipe_id_idx on public.comments(recipe_id);
create index comments_created_at_idx on public.comments(created_at desc);
