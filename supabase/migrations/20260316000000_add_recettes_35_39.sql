-- Recettes 35 à 39 : bowl lentilles-quinoa-tofu, chili sin carne, porridge pré-sortie, curry pois chiches, galettes haricots blancs
do $$
begin
  if not exists (select 1 from public.recipes where id = 35) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (35, 'Bowl lentilles-quinoa-tofu protéiné pour sportifs végé', 'dejeuner', 25, 408, 25, 50, 12, 2, 'Facile',
      '["#PostEntraînement","#RicheEnProtéines","#PréparationRepas"]'::jsonb, '["masse","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["printemps","ete","automne","hiver"]'::jsonb, 'Lentilles et quinoa',
      null,
      '["100g lentilles vertes sèches (ou 250g cuites)","100g quinoa cru","200g tofu ferme","2 carottes","100g épinards frais (ou surgelés)","2 c.à.s huile d''olive","Sauce soja, ail, gingembre (frais ou poudre)","Sel, poivre"]'::jsonb,
      '["Rincer quinoa et lentilles. Cuire 15 min à l''eau bouillante salée (ou utiliser précuites).","Couper tofu en cubes, mariner 10 min (sauce soja + ail + gingembre). Poêler 8 min dans 1 c.à.s huile.","Râper carottes, faire sauter épinards 3 min avec ail.","Mélanger tout dans un bol, assaisonner huile d''olive + sel/poivre. Servir tiède."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 36) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (36, 'Chili sin carne protéiné pour coureurs et cyclistes', 'diner', 30, 438, 22, 65, 10, 4, 'Facile',
      '["#PostEntraînement","#Budget","#PréparationRepas"]'::jsonb, '["endurance","sante","masse"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["automne","hiver"]'::jsonb, 'Haricots rouges',
      null,
      '["400g haricots rouges en boîte (rincés)","200g maïs en boîte","400g tomates concassées en boîte","1 oignon","2 gousses d''ail","1 c.à.c cumin, paprika, piment (option)","150g riz complet (cru)","Coriandre fraîche (option)"]'::jsonb,
      '["Hacher oignon et ail, faire suer 5 min dans huile d''olive.","Ajouter épices 1 min, puis tomates, haricots, maïs. Couvrir, mijoter 20 min.","Cuire riz à part (15 min).","Servir chili sur riz, coriandre dessus. Se conserve 4 jours au frigo."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 37) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (37, 'Porridge protéiné pré-sortie running ou vélo', 'petit-dejeuner', 10, 400, 12, 70, 8, 1, 'Facile',
      '["#PostEntraînement","#Budget"]'::jsonb, '["endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["printemps","ete","automne","hiver"]'::jsonb, 'Flocons d''avoine',
      null,
      '["70g flocons d''avoine","200ml boisson végétale (soja ou avoine)","1 banane mûre","20g raisins secs ou amandes","1 c.à.c cannelle","Option : 1 c.à.s purée d''amande"]'::jsonb,
      '["Dans une casserole, chauffer avoine + boisson végétale 5 min en remuant.","Écraser banane, ajouter avec raisins et cannelle. Cuire 2 min.","Verser dans un bol, ajouter purée d''amande dessus. Manger tiède."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 38) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (38, 'Curry pois chiches rapide pour prise de muscle végé', 'diner', 20, 435, 20, 55, 15, 3, 'Facile',
      '["#PostEntraînement","#Budget","#PréparationRepas"]'::jsonb, '["masse","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["hiver"]'::jsonb, 'Pois chiches',
      null,
      '["400g pois chiches en boîte (rincés)","200ml lait de coco léger","1 oignon","2 c.à.s pâte curry (ou épices curry)","150g riz basmati","200g brocoli (frais ou surgelé)","Coriandre (option)"]'::jsonb,
      '["Cuire riz 10 min. Faire suer oignon 5 min.","Ajouter pâte curry, pois chiches, lait de coco, brocoli. Mijoter 10 min.","Servir sur riz chaud, coriandre fraîche."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 39) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (39, 'Galettes haricots blancs protéinées pour sportifs pressés', 'collation', 20, 273, 18, 30, 9, 2, 'Moyen',
      '["#PostEntraînement","#RicheEnProtéines","#PréparationRepas"]'::jsonb, '["masse","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb, '["printemps","ete","automne","hiver"]'::jsonb, 'Haricots blancs',
      null,
      '["400g haricots blancs en boîte (rincés et égouttés)","50g flocons d''avoine","1 petit oignon","1 gousse d''ail","Herbes (persil ou thym), sel, poivre","Huile d''olive pour la cuisson"]'::jsonb,
      '["Mixer haricots, flocons, oignon haché, ail, herbes. Assaisonner.","Former 4 galettes.","Cuire 4 min chaque côté dans une poêle huilée.","Servir avec salade ou yaourt végétal."]'::jsonb);
  end if;
end $$;
