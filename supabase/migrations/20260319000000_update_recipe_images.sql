-- Migration : ajout des images uploadées dans le bucket "recipes"
-- URL de base : https://wffoftjdjbmypxxdamho.supabase.co/storage/v1/object/public/recipes/
-- Fichiers nommés par ID de recette (ex: 1.png, 2.png ...)

do $$
declare
  base_url text := 'https://wffoftjdjbmypxxdamho.supabase.co/storage/v1/object/public/recipes/';
  ext      text := '.webp';
begin

  -- Recettes 1-34
  update public.recipes set image = base_url || '52'  || ext where id = 52;
  update public.recipes set image = base_url || '53'  || ext where id = 53;
  update public.recipes set image = base_url || '54'  || ext where id = 54;
  update public.recipes set image = base_url || '55'  || ext where id = 55;
  update public.recipes set image = base_url || '56'  || ext where id = 56;
  update public.recipes set image = base_url || '57'  || ext where id = 57;
  update public.recipes set image = base_url || '58'  || ext where id = 58;
  update public.recipes set image = base_url || '59'  || ext where id = 59;
  update public.recipes set image = base_url || '60'  || ext where id = 60;
end $$;
