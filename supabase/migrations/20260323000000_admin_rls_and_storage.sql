-- Admin : écriture réservée à maxencecailleau.pro@gmail.com (recettes, ingrédients, storage)
-- Lecture reste publique pour recettes et ingrédients.

-- Recettes : INSERT / UPDATE / DELETE admin uniquement
create policy "Admin can insert recipes"
  on public.recipes for insert
  with check ((auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com');

create policy "Admin can update recipes"
  on public.recipes for update
  using ((auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com');

create policy "Admin can delete recipes"
  on public.recipes for delete
  using ((auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com');

-- Ingrédients : INSERT / UPDATE / DELETE admin uniquement
create policy "Admin can insert ingredients"
  on public.ingredients for insert
  with check ((auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com');

create policy "Admin can update ingredients"
  on public.ingredients for update
  using ((auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com');

create policy "Admin can delete ingredients"
  on public.ingredients for delete
  using ((auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com');

-- Recipe_ingredients : INSERT / UPDATE / DELETE admin uniquement
create policy "Admin can insert recipe_ingredients"
  on public.recipe_ingredients for insert
  with check ((auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com');

create policy "Admin can update recipe_ingredients"
  on public.recipe_ingredients for update
  using ((auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com');

create policy "Admin can delete recipe_ingredients"
  on public.recipe_ingredients for delete
  using ((auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com');

-- Storage bucket "recipes" : upload / update / delete réservés à l'admin
-- La lecture publique du bucket reste gérée par la config du bucket (public).
create policy "Admin can insert recipe images"
  on storage.objects for insert
  with check (
    bucket_id = 'recipes'
    and (auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com'
  );

create policy "Admin can update recipe images"
  on storage.objects for update
  using (
    bucket_id = 'recipes'
    and (auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com'
  )
  with check (
    bucket_id = 'recipes'
    and (auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com'
  );

create policy "Admin can delete recipe images"
  on storage.objects for delete
  using (
    bucket_id = 'recipes'
    and (auth.jwt() ->> 'email') = 'maxencecailleau.pro@gmail.com'
  );
