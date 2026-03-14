-- Migration : ajout des images uploadées dans le bucket "recipes"
-- URL de base : https://wffoftjdjbmypxxdamho.supabase.co/storage/v1/object/public/recipes/
-- Fichiers nommés par ID de recette (ex: 1.png, 2.png ...)

do $$
declare
  base_url text := 'https://wffoftjdjbmypxxdamho.supabase.co/storage/v1/object/public/recipes/';
  ext      text := '.webp';
begin

  -- Recettes 1-34
  update public.recipes set image = base_url || '27'  || ext where id = 27;
  update public.recipes set image = base_url || '28'  || ext where id = 28;
  update public.recipes set image = base_url || '29'  || ext where id = 29;
  update public.recipes set image = base_url || '30'  || ext where id = 30;
  update public.recipes set image = base_url || '31'  || ext where id = 31;
  update public.recipes set image = base_url || '32'  || ext where id = 32;
  update public.recipes set image = base_url || '33'  || ext where id = 33;
  update public.recipes set image = base_url || '34'  || ext where id = 34;
  update public.recipes set image = base_url || '35'  || ext where id = 35;
  

end $$;
