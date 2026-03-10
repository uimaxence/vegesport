-- Optionnel : permet de savoir quels jours sont passés pour bloquer l'édition
alter table public.plannings
  add column if not exists week_start date;

comment on column public.plannings.week_start is 'Lundi de la semaine concernée (YYYY-MM-DD)';
