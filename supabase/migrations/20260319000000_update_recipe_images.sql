-- Migration : ajout des images uploadées dans le bucket "recipes"
-- URL de base : https://wffoftjdjbmypxxdamho.supabase.co/storage/v1/object/public/recipes/
-- Fichiers nommés par ID de recette (ex: 1.png, 2.png ...)

do $$
declare
  base_url text := 'https://wffoftjdjbmypxxdamho.supabase.co/storage/v1/object/public/recipes/';
  ext      text := '.webp';
begin

  -- Recettes 1-34
  update public.recipes set image = base_url || '40'  || ext where id = 41;
  update public.recipes set image = base_url || '41'  || ext where id = 42;
  update public.recipes set image = base_url || '42'  || ext where id = 43;
  update public.recipes set image = base_url || '43'  || ext where id = 44;
  update public.recipes set image = base_url || '44'  || ext where id = 51;
end $$;
