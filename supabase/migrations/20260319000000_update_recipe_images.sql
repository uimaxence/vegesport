-- Migration : ajout des images uploadées dans le bucket "recipes"
-- URL de base : https://wffoftjdjbmypxxdamho.supabase.co/storage/v1/object/public/recipes/
-- Fichiers nommés par ID de recette (ex: 1.png, 2.png ...)

do $$
declare
  base_url text := 'https://wffoftjdjbmypxxdamho.supabase.co/storage/v1/object/public/recipes/';
  ext      text := '.png';
begin

  -- Recettes 1-34
  update public.recipes set image = base_url || '1'  || ext where id = 1;
  update public.recipes set image = base_url || '2'  || ext where id = 2;
  update public.recipes set image = base_url || '3'  || ext where id = 3;
  update public.recipes set image = base_url || '4'  || ext where id = 4;
  update public.recipes set image = base_url || '5'  || ext where id = 5;
  update public.recipes set image = base_url || '6'  || ext where id = 6;
  update public.recipes set image = base_url || '7'  || ext where id = 7;
  update public.recipes set image = base_url || '8'  || ext where id = 8;
  update public.recipes set image = base_url || '9'  || ext where id = 9;
  update public.recipes set image = base_url || '10' || ext where id = 10;
  update public.recipes set image = base_url || '11' || ext where id = 11;
  update public.recipes set image = base_url || '12' || ext where id = 12;
  update public.recipes set image = base_url || '13' || ext where id = 13;
  update public.recipes set image = base_url || '14' || ext where id = 14;
  update public.recipes set image = base_url || '15' || ext where id = 15;
  update public.recipes set image = base_url || '16' || ext where id = 16;
  update public.recipes set image = base_url || '17' || ext where id = 17;
  update public.recipes set image = base_url || '18' || ext where id = 18;
  update public.recipes set image = base_url || '19' || ext where id = 19;
  update public.recipes set image = base_url || '20' || ext where id = 20;
  update public.recipes set image = base_url || '21' || ext where id = 21;
  update public.recipes set image = base_url || '22' || ext where id = 22;
  update public.recipes set image = base_url || '23' || ext where id = 23;
  update public.recipes set image = base_url || '24' || ext where id = 24;
  update public.recipes set image = base_url || '25' || ext where id = 25;
  update public.recipes set image = base_url || '26' || ext where id = 26;
  update public.recipes set image = base_url || '27' || ext where id = 27;
  update public.recipes set image = base_url || '28' || ext where id = 28;
  update public.recipes set image = base_url || '29' || ext where id = 29;
  update public.recipes set image = base_url || '30' || ext where id = 30;
  update public.recipes set image = base_url || '31' || ext where id = 31;
  update public.recipes set image = base_url || '32' || ext where id = 32;
  update public.recipes set image = base_url || '33' || ext where id = 33;
  update public.recipes set image = base_url || '34' || ext where id = 34;

  -- Recettes 35-44
  update public.recipes set image = base_url || '35' || ext where id = 35;
  update public.recipes set image = base_url || '36' || ext where id = 36;
  update public.recipes set image = base_url || '37' || ext where id = 37;
  update public.recipes set image = base_url || '38' || ext where id = 38;
  update public.recipes set image = base_url || '39' || ext where id = 39;
  update public.recipes set image = base_url || '40' || ext where id = 40;
  update public.recipes set image = base_url || '41' || ext where id = 41;
  update public.recipes set image = base_url || '42' || ext where id = 42;
  update public.recipes set image = base_url || '43' || ext where id = 43;
  update public.recipes set image = base_url || '44' || ext where id = 44;

  -- Recettes 51-60
  update public.recipes set image = base_url || '51' || ext where id = 51;
  update public.recipes set image = base_url || '52' || ext where id = 52;
  update public.recipes set image = base_url || '53' || ext where id = 53;
  update public.recipes set image = base_url || '54' || ext where id = 54;
  update public.recipes set image = base_url || '55' || ext where id = 55;
  update public.recipes set image = base_url || '56' || ext where id = 56;
  update public.recipes set image = base_url || '57' || ext where id = 57;
  update public.recipes set image = base_url || '58' || ext where id = 58;
  update public.recipes set image = base_url || '59' || ext where id = 59;
  update public.recipes set image = base_url || '60' || ext where id = 60;

end $$;
