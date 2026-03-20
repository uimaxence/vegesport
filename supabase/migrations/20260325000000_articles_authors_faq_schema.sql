-- Articles : nouveaux champs SEO/schema, FAQ, sources, auteurs
-- + meta_title/meta_description obligatoires

-- 1. Table authors (bio, titre, liens pro)
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text not null,
  bio text,
  titre text,
  links_pro jsonb not null default '[]',
  created_at timestamptz default now()
);

alter table public.authors enable row level security;
create policy "Authors lecture publique"
  on public.authors for select using (true);

comment on table public.authors is 'Auteurs des articles avec bio et expertise';
comment on column public.authors.links_pro is 'Tableau de liens (ex: LinkedIn, site perso)';

-- 2. Nouveaux champs sur blog_articles
alter table public.blog_articles
  add column if not exists faq_json jsonb default '[]',
  add column if not exists schema_type text default 'Article',
  add column if not exists sources_json jsonb default '[]',
  add column if not exists updated_at timestamptz default now(),
  add column if not exists author_id uuid references public.authors(id) on delete set null;

comment on column public.blog_articles.faq_json is 'Tableau [{question, answer}] pour FAQPage schema';
comment on column public.blog_articles.schema_type is 'Article | HowTo | FAQPage';
comment on column public.blog_articles.sources_json is 'Tableau de liens vers études/sources';
comment on column public.blog_articles.updated_at is 'Date de dernière mise à jour';

alter table public.blog_articles
  add constraint blog_articles_schema_type_check
  check (schema_type in ('Article', 'HowTo', 'FAQPage'));

-- 3. Remplir meta_title/meta_description si NULL, puis les rendre NOT NULL
update public.blog_articles
set meta_title = coalesce(meta_title, title),
    meta_description = coalesce(meta_description, excerpt, '')
where meta_title is null or meta_description is null;

alter table public.blog_articles
  alter column meta_title set not null,
  alter column meta_description set not null;

-- 4. Seed auteurs (Maxence + autres du blog.js)
insert into public.authors (name, display_name, bio, titre, links_pro)
values
  (
    'maxence',
    'Maxence',
    'Fondateur d''Et si mamie était végé ?, sportif végétarien passionné par la nutrition et la performance. Combine alimentation végétale et entraînement depuis plusieurs années.',
    'Expert nutrition sportive végétale',
    '[]'::jsonb
  ),
  (
    'sophie-laurent',
    'Sophie Laurent',
    'Diététicienne spécialisée en nutrition sportive et alimentation végétale.',
    'Diététicienne nutrition sportive',
    '[]'::jsonb
  ),
  (
    'marc-dubois',
    'Marc Dubois',
    'Coach sportif et passionné de meal prep végétarien.',
    'Coach sportif',
    '[]'::jsonb
  ),
  (
    'dr-claire-martin',
    'Dr. Claire Martin',
    'Médecin du sport et nutritionniste.',
    'Médecin du sport',
    '[]'::jsonb
  ),
  (
    'lucas-moreau',
    'Lucas Moreau',
    'Sportif végétalien, marathonien.',
    'Marathonien végétalien',
    '[]'::jsonb
  )
on conflict (name) do nothing;

-- 5. Lier les articles existants à Maxence (auteur par défaut pour les 6 articles sans auteur détaillé)
update public.blog_articles
set author_id = (select id from public.authors where name = 'maxence' limit 1)
where author in ('Maxence', 'maxence') or author is null;

-- Lier les autres auteurs par nom
update public.blog_articles set author_id = (select id from public.authors where name = 'sophie-laurent' limit 1)
where author in ('Sophie Laurent', 'sophie-laurent');
update public.blog_articles set author_id = (select id from public.authors where name = 'marc-dubois' limit 1)
where author in ('Marc Dubois', 'marc-dubois');
update public.blog_articles set author_id = (select id from public.authors where name = 'dr-claire-martin' limit 1)
where author in ('Dr. Claire Martin', 'dr-claire-martin');
update public.blog_articles set author_id = (select id from public.authors where name = 'lucas-moreau' limit 1)
where author in ('Lucas Moreau', 'lucas-moreau');

-- Index pour jointures
create index if not exists idx_blog_articles_author_id on public.blog_articles(author_id);

-- Trigger pour mettre à jour updated_at automatiquement
create or replace function public.set_blog_articles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists blog_articles_updated_at on public.blog_articles;
create trigger blog_articles_updated_at
  before update on public.blog_articles
  for each row execute function public.set_blog_articles_updated_at();
