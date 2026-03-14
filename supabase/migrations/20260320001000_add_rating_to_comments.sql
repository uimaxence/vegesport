-- Migration : ajout d'une note (1-5 étoiles) optionnelle aux commentaires
-- Un utilisateur peut commenter sans noter, ou noter en commentant

alter table public.comments
  add column rating smallint check (rating between 1 and 5);
