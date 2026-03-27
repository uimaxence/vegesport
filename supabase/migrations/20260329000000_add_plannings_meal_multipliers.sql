alter table public.plannings
add column if not exists meal_multipliers jsonb not null default '{}'::jsonb;

comment on column public.plannings.meal_multipliers is
'Multiplicateurs de portions par repas (clé: "jour-repas", valeur: 0.5, 1, 1.5, 2).';
