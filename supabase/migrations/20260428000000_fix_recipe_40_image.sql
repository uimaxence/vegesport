-- Renseigne l'image manquante de la recette 40 (bol avoine-tofu).
-- Cause : insertion initiale avec image=null (cf. 20260317000000_add_recettes_40_44.sql),
-- ce qui produisait "image":[] dans le JSON-LD Recipe pré-rendu et l'erreur
-- Google Search Console "Missing field 'image'".

update public.recipes
set image = 'https://wffoftjdjbmypxxdamho.supabase.co/storage/v1/object/public/recipes/40.webp'
where id = 40 and image is null;
