-- Recettes 40 à 44 : bol avoine-tofu, wraps houmous-tofu, barres énergétiques, hachis parmentier lentilles, smoothie protéiné soir
do $$
begin
  if not exists (select 1 from public.recipes where id = 40) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (40, 'Bol petit-déj protéiné avoine-tofu pour démarrer fort', 'petit-dejeuner', 15, 410, 20, 60, 10, 1, 'Facile',
      '["#PostEntraînement","#RicheEnProtéines","#Budget"]'::jsonb, '["masse","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["printemps","ete","automne","hiver"]'::jsonb, 'Flocons d''avoine et tofu soyeux',
      null,
      '["60g flocons d''avoine","100g tofu soyeux (ou yaourt végétal)","200ml boisson végétale soja","1 banane","20g amandes effilées","1 c.à.c cannelle"]'::jsonb,
      '["Cuire avoine + boisson végétale 5 min en remuant.","Mixer tofu soyeux + banane écrasée.","Mélanger tout, ajouter amandes et cannelle.","Laisser reposer 2 min. Manger tiède."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 41) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (41, 'Wraps houmous-tofu pour midi sportif rapide', 'dejeuner', 15, 394, 22, 45, 14, 2, 'Facile',
      '["#PostEntraînement","#PréparationRepas","#SansCuisson"]'::jsonb, '["masse","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb, '["printemps","ete","automne","hiver"]'::jsonb, 'Houmous et tofu',
      null,
      '["4 wraps complets (ou tortillas)","200g tofu nature","150g houmous (maison ou pot)","2 carottes râpées","1 concombre","Salade feuilles"]'::jsonb,
      '["Étaler houmous sur wraps.","Couper tofu en bâtonnets, ajouter avec carottes, concombre et salade.","Rouler serré, couper en deux.","Emporter ou manger direct."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 42) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (42, 'Barres énergétiques végé pour l''entraînement', 'collation', 20, 262, 8, 35, 10, 6, 'Facile',
      '["#PostEntraînement","#Budget","#PréparationRepas"]'::jsonb, '["endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["printemps","ete","automne","hiver"]'::jsonb, 'Dattes et flocons d''avoine',
      null,
      '["150g dattes dénoyautées","100g flocons d''avoine","50g purée cacahuète","30g graines tournesol","1 c.à.c cannelle"]'::jsonb,
      '["Mixer dattes + purée cacahuète en pâte.","Ajouter avoine, graines, cannelle. Mélanger.","Étaler dans un plat (1 cm épais), presser.","Réfrigérer 1 h, couper en 6 barres. Se conserve 1 semaine."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 43) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (43, 'Hachis parmentier végétarien façon mamie', 'diner', 40, 408, 25, 50, 12, 4, 'Moyen',
      '["#PostEntraînement","#RicheEnProtéines","#PréparationRepas"]'::jsonb, '["masse","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["automne","hiver"]'::jsonb, 'Lentilles et pommes de terre',
      null,
      '["200g lentilles vertes sèches (cuites)","800g pommes de terre","1 oignon","2 carottes","100ml boisson végétale","Muscade, sel, poivre","Huile d''olive"]'::jsonb,
      '["Cuire lentilles 20 min. Hacher oignon et carottes, faire revenir 5 min. Mélanger avec lentilles.","Éplucher et cuire pommes de terre 20 min à l''eau. Écraser en purée avec boisson végétale + muscade.","Dans un plat, étaler lentilles, couvrir de purée.","Gratiner 15 min au four 200°C. Laisser reposer 5 min."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 44) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (44, 'Smoothie protéiné soir pour récup musculaire', 'collation', 5, 304, 18, 40, 8, 1, 'Facile',
      '["#PostEntraînement","#RicheEnProtéines","#SansCuisson"]'::jsonb, '["masse","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["printemps","ete","automne","hiver"]'::jsonb, 'Graines de chanvre et banane',
      null,
      '["1 banane congelée","200ml boisson végétale soja","2 c.à.s graines chanvre (ou 20g poudre protéine végé)","100g yaourt végétal","1 c.à.c cacao brut"]'::jsonb,
      '["Mixer tous les ingrédients 1 min jusqu''à crémeux.","Verser dans un verre. Boire lentement.","Option : ajouter une pincée de cannelle pour la digestion."]'::jsonb);
  end if;
end $$;
