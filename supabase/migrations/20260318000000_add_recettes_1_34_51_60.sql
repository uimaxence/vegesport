-- Migration : ajout des recettes 1-34 et 51-60
-- Les recettes 35-44 existent déjà (migrations précédentes)
-- Images : NULL (à ajouter manuellement via Supabase Storage)

do $$
begin

  -- =====================================================================
  -- PETIT-DÉJEUNER
  -- =====================================================================

  if not exists (select 1 from public.recipes where id = 1) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (1, 'Porridge Protéiné aux Fruits Rouges', 'petit-dejeuner', 10, 420, 28, 52, 12, 1, 'Facile',
      '["PostEntraînement","RicheEnProtéines","Budget"]'::jsonb,
      '["masse","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["automne","hiver"]'::jsonb,
      'Flocons d''avoine', null,
      '["80g flocons d''avoine","200ml lait d''amande","30g protéine de pois vanille","1 c.à.s graines de chia","100g fruits rouges mélangés","1 c.à.s beurre de cacahuète","1 c.à.c miel ou sirop d''érable"]'::jsonb,
      '["Faire chauffer le lait d''amande avec les flocons d''avoine 3-4 min à feu moyen en remuant régulièrement.","Hors du feu, incorporer la protéine en poudre et les graines de chia. Mélanger vigoureusement pour éviter les grumeaux.","Verser dans un bol, déposer le beurre de cacahuète, les fruits rouges et un filet de miel ou sirop d''érable. Déguster immédiatement."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 4) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (4, 'Smoothie Vert Protéiné', 'petit-dejeuner', 5, 320, 25, 38, 8, 1, 'Facile',
      '["SansCuisson","PostEntraînement","RicheEnProtéines"]'::jsonb,
      '["seche","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["printemps","ete"]'::jsonb,
      'Épinards', null,
      '["2 poignées d''épinards frais","1 banane congelée","30g protéine de pois vanille","200ml lait d''amande","1 c.à.s beurre d''amande","1 c.à.c spiruline (optionnel)","Quelques glaçons"]'::jsonb,
      '["Placer tous les ingrédients dans le blender : épinards, banane congelée, protéine en poudre, lait d''amande, beurre d''amande et glaçons.","Mixer à pleine puissance 60 secondes jusqu''à obtenir une texture parfaitement lisse.","Ajouter la spiruline si souhaité, remixer 15 sec. Servir immédiatement dans un grand verre."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 7) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (7, 'Galettes Protéinées au Sarrasin', 'petit-dejeuner', 15, 380, 26, 48, 10, 2, 'Facile',
      '["RicheEnProtéines","PostEntraînement"]'::jsonb,
      '["masse","endurance"]'::jsonb,
      '["vegetarien","sans-gluten"]'::jsonb,
      '["automne","hiver"]'::jsonb,
      'Farine de sarrasin', null,
      '["120g farine de sarrasin","30g protéine en poudre vanille","1 banane mûre écrasée","200ml lait végétal","1 œuf (ou substitut végétal)","1 c.à.c levure chimique","Myrtilles et sirop d''érable pour servir"]'::jsonb,
      '["Écraser la banane à la fourchette. Mélanger avec la farine de sarrasin, la protéine en poudre, la levure, le lait végétal et l''œuf jusqu''à pâte homogène.","Laisser reposer la pâte 2 min. Faire chauffer une poêle antiadhésive légèrement huilée à feu moyen.","Verser des louches de pâte, cuire 2-3 min par côté jusqu''à bien dorées. Servir avec les myrtilles et un filet de sirop d''érable."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 10) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (10, 'Bol Açaï Protéiné', 'petit-dejeuner', 10, 400, 22, 55, 14, 1, 'Facile',
      '["SansCuisson","PostEntraînement","RicheEnProtéines"]'::jsonb,
      '["endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete"]'::jsonb,
      'Açaï', null,
      '["100g pulpe d''açaï surgelée","1 banane congelée","30g protéine de pois","100ml lait de coco","Garniture : granola, fruits frais, noix de coco râpée, graines de chia"]'::jsonb,
      '["Laisser légèrement décongeler la pulpe d''açaï 5 min. Placer dans le blender avec la banane congelée, la protéine et le lait de coco.","Mixer à puissance maximale jusqu''à obtenir une texture épaisse et lisse (plus dense qu''un smoothie).","Verser dans un bol, garnir de granola, fruits frais de saison, noix de coco râpée et graines de chia. Servir immédiatement."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 19) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (19, 'Porridge de Nuit Version Tropicale', 'petit-dejeuner', 5, 380, 20, 52, 12, 1, 'Facile',
      '["SansCuisson","PréparationRepas","Budget"]'::jsonb,
      '["endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["printemps","ete"]'::jsonb,
      'Flocons d''avoine', null,
      '["80g flocons d''avoine","200ml lait de coco","25g protéine de pois vanille","1 c.à.s graines de chia","1/2 mangue","1 fruit de la passion","Noix de coco râpée"]'::jsonb,
      '["Mélanger dans un bocal hermétique : flocons d''avoine, lait de coco, protéine en poudre et graines de chia. Bien remuer.","Couvrir et réfrigérer toute la nuit (minimum 6 heures).","Au matin, sortir le porridge, garnir de dés de mangue, pulpe de fruit de la passion et noix de coco râpée. Servir frais."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 30) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (30, 'Porridge Boost Endurance', 'petit-dejeuner', 10, 480, 12, 88, 8, 1, 'Facile',
      '["PostEntraînement","Budget","PréparationRepas"]'::jsonb,
      '["endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Flocons d''avoine', null,
      '["80g flocons d''avoine","200ml boisson végétale","1 banane","20g raisins secs","1 c.à.s graines de chia","1 pincée de cannelle (optionnel)"]'::jsonb,
      '["Porter la boisson végétale à frémissement dans une casserole. Verser les flocons d''avoine et cuire 4-5 min à feu doux en remuant.","Couper la banane en rondelles. Retirer la casserole du feu.","Verser le porridge dans un bol, garnir de rondelles de banane, raisins secs et graines de chia. Saupoudrer de cannelle si désiré."]'::jsonb);
  end if;

  -- =====================================================================
  -- DÉJEUNER
  -- =====================================================================

  if not exists (select 1 from public.recipes where id = 2) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (2, 'Bol Buddha Quinoa et Edamame', 'dejeuner', 25, 580, 32, 65, 18, 2, 'Facile',
      '["RicheEnFer","PostEntraînement","PréparationRepas"]'::jsonb,
      '["masse","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete"]'::jsonb,
      'Quinoa', null,
      '["200g quinoa","150g edamame décortiqués","1 avocat","1 carotte râpée","100g chou rouge émincé","50g graines de sésame","2 c.à.s sauce soja","1 c.à.s huile de sésame","Jus d''1 citron vert"]'::jsonb,
      '["Cuire le quinoa 12 min dans de l''eau salée (ratio 1:2). Rincer à l''eau froide et laisser refroidir.","Décongeler les edamames à la vapeur ou 3 min dans de l''eau bouillante. Égoutter.","Préparer la sauce : mélanger sauce soja, huile de sésame et jus de citron vert.","Monter les bols : quinoa, edamame, avocat en tranches, carotte râpée et chou rouge. Arroser de sauce, parsemer de sésame."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 5) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (5, 'Wrap au Tofu Grillé & Houmous', 'dejeuner', 20, 490, 28, 45, 22, 2, 'Facile',
      '["RicheEnProtéines","Budget"]'::jsonb,
      '["masse","endurance"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["printemps","ete"]'::jsonb,
      'Tofu', null,
      '["200g tofu ferme","2 tortillas complètes","4 c.à.s houmous","1 concombre","1 tomate","Quelques feuilles de laitue","2 c.à.s sauce tahini","1 c.à.s sauce soja","Paprika fumé"]'::jsonb,
      '["Couper le tofu en tranches, mariner dans la sauce soja + paprika fumé 5 min. Griller 4 min par côté dans une poêle chaude sans matière grasse.","Tiédir les tortillas 1 min à la poêle sèche. Tartiner généreusement de houmous.","Disposer la laitue, le concombre et la tomate en rondelles et le tofu grillé. Arroser de sauce tahini.","Rouler fermement en serrant bien. Couper en biais et servir."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 9) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (9, 'Galettes de Quinoa aux Légumes', 'dejeuner', 30, 340, 18, 42, 12, 4, 'Moyen',
      '["PréparationRepas","Budget","RicheEnProtéines"]'::jsonb,
      '["seche","sante"]'::jsonb,
      '["vegetarien","sans-gluten"]'::jsonb,
      '["printemps","ete"]'::jsonb,
      'Quinoa', null,
      '["200g quinoa cuit","1 courgette râpée","1 carotte râpée","2 œufs","50g farine de pois chiche","1 oignon finement haché","Cumin, sel, poivre","Huile d''olive"]'::jsonb,
      '["Râper la courgette et la carotte, presser dans un torchon pour éliminer l''excès d''eau.","Mélanger le quinoa, les légumes, l''oignon haché, les œufs, la farine de pois chiche, le cumin, sel et poivre.","Former des galettes compactes avec les mains mouillées. Chauffer l''huile dans une poêle antiadhésive à feu moyen.","Cuire 4-5 min par côté jusqu''à bien dorées. Servir avec une salade verte ou un yaourt aux herbes."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 11) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (11, 'Pâtes Complètes Pesto & Tempeh', 'dejeuner', 20, 520, 30, 58, 20, 2, 'Facile',
      '["RicheEnProtéines","PostEntraînement"]'::jsonb,
      '["masse","endurance"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Tempeh', null,
      '["200g pâtes complètes","150g tempeh","4 c.à.s pesto au basilic","100g tomates cerises","50g roquette","2 c.à.s pignons de pin","Huile d''olive, sel, poivre"]'::jsonb,
      '["Cuire les pâtes al dente selon les instructions. Couper le tempeh en cubes et le poêler dans un filet d''huile 5-6 min jusqu''à doré.","Égoutter les pâtes en conservant une louche d''eau de cuisson. Mélanger les pâtes avec le pesto, allonger avec un peu d''eau de cuisson si nécessaire.","Ajouter le tempeh, les tomates cerises coupées en deux et la roquette. Mélanger délicatement, poivrer et parsemer de pignons de pin."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 15) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (15, 'Salade de Pois Chiches Méditerranéenne', 'dejeuner', 15, 380, 18, 40, 16, 2, 'Facile',
      '["SansCuisson","Budget","RicheEnFer"]'::jsonb,
      '["seche","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete"]'::jsonb,
      'Pois chiches', null,
      '["400g pois chiches cuits","200g concombre","150g tomates cerises","50g olives Kalamata","1/2 oignon rouge","Persil frais","3 c.à.s huile d''olive","Jus d''1 citron","Origan, sel, poivre"]'::jsonb,
      '["Rincer et égoutter les pois chiches. Couper le concombre en dés, les tomates cerises en deux, émincer finement l''oignon rouge.","Mélanger dans un grand saladier : pois chiches, légumes, olives et persil haché.","Préparer la vinaigrette : huile d''olive, jus de citron, origan, sel et poivre. Verser sur la salade et mélanger.","Laisser mariner 10 min à température ambiante avant de servir pour développer les saveurs."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 20) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (20, 'Tacos aux Haricots Noirs & Avocat', 'dejeuner', 20, 450, 20, 52, 18, 2, 'Facile',
      '["Budget","RicheEnFer"]'::jsonb,
      '["masse","endurance"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["printemps","ete"]'::jsonb,
      'Haricots noirs', null,
      '["400g haricots noirs cuits","4 tortillas de maïs","1 avocat","100g maïs","1 tomate","1/2 oignon rouge","Jus d''1 citron vert","Coriandre, cumin, piment"]'::jsonb,
      '["Chauffer les haricots noirs avec le cumin et une pincée de sel dans une poêle 3-4 min. Écraser légèrement à la fourchette pour une texture crémeuse.","Chauffer les tortillas de maïs 30 sec par côté dans une poêle sèche bien chaude.","Écraser l''avocat avec le jus de citron vert, sel, poivre et piment. Couper la tomate en dés, émincer l''oignon rouge.","Garnir chaque tortilla de haricots, guacamole, tomate, maïs, oignon rouge et coriandre fraîche."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 21) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (21, 'Bowl Lentilles, Quinoa & Tofu Mariné', 'dejeuner', 30, 620, 38, 70, 20, 2, 'Facile',
      '["PostEntraînement","RicheEnProtéines","PréparationRepas"]'::jsonb,
      '["masse","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Lentilles', null,
      '["160g lentilles vertes (poids sec) ou 400g cuites","140g quinoa (poids sec)","250g tofu ferme","2 c.à.s sauce soja","1 gousse d''ail","1 c.à.s jus de citron","1 c.à.s huile d''olive","1 c.à.c paprika fumé","2 poignées d''épinards","2 carottes râpées","2 c.à.s graines de courge","4 c.à.s yaourt végétal nature","Sel, poivre, herbes (persil ou ciboulette)"]'::jsonb,
      '["Cuire les lentilles 20 min à l''eau bouillante salée. Cuire le quinoa 12 min dans de l''eau salée (ratio 1:2). Égoutter et réserver.","Couper le tofu en cubes. Préparer la marinade : sauce soja, ail écrasé, jus de citron, huile d''olive et paprika fumé. Mariner le tofu 10 min.","Poêler le tofu mariné à feu vif 7-8 min jusqu''à doré sur toutes les faces. Réserver.","Monter les bols : lentilles, quinoa, tofu, épinards frais, carottes râpées et graines de courge. Ajouter une cuillère de yaourt végétal et garnir d''herbes fraîches."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 23) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (23, 'Galettes Haricots Blancs & Flocons d''Avoine', 'dejeuner', 20, 360, 20, 44, 10, 4, 'Facile',
      '["Budget","RicheEnProtéines","PréparationRepas"]'::jsonb,
      '["seche","sante","masse"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Haricots blancs', null,
      '["480g haricots blancs cuits (égouttés)","60g flocons d''avoine","1 oignon","1 gousse d''ail","2 c.à.s persil ou ciboulette","1 c.à.c paprika fumé","1/2 c.à.c cumin","2 c.à.s farine (blé ou pois chiche)","Sel, poivre","Huile d''olive"]'::jsonb,
      '["Écraser les haricots blancs à la fourchette ou au mixeur pulsé (texture grumeleuse, pas trop fine). Hacher finement l''oignon et l''ail.","Mélanger haricots, flocons d''avoine, oignon, ail, herbes, paprika, cumin et farine. Assaisonner. La pâte doit être malléable.","Former 8 galettes avec les mains légèrement huilées. Chauffer l''huile dans une poêle antiadhésive à feu moyen.","Cuire 3-4 min par côté jusqu''à bien dorées. Servir avec une salade verte ou une sauce yaourt-citron-herbes."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 25) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (25, 'Bowl Riz Complet, Pois Chiches & Légumes', 'dejeuner', 35, 520, 20, 78, 12, 2, 'Facile',
      '["PostEntraînement","Budget","PréparationRepas"]'::jsonb,
      '["endurance","sante","masse"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Riz complet', null,
      '["160g riz complet","300g pois chiches cuits","2 carottes","1 courgette","1 poivron","1 oignon","2 c.à.s huile d''olive","Sel, poivre, herbes (persil ou coriandre)"]'::jsonb,
      '["Cuire le riz complet 30 min à l''eau salée selon les instructions. Couper les légumes en dés réguliers.","Faire revenir l''oignon 3 min dans l''huile. Ajouter carotte, poivron et courgette, sauter 8-10 min à feu moyen-vif.","Incorporer les pois chiches, chauffer 3 min. Assaisonner avec sel, poivre et herbes.","Disposer les légumes et pois chiches sur le riz. Garnir de persil ou coriandre fraîche. Arroser d''un filet d''huile d''olive."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 26) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (26, 'Bowl Quinoa, Tofu & Crudités', 'dejeuner', 30, 480, 28, 52, 18, 2, 'Facile',
      '["PostEntraînement","RicheEnProtéines","PréparationRepas"]'::jsonb,
      '["masse","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Quinoa', null,
      '["140g quinoa","250g tofu ferme","2 carottes","1 concombre","1 betterave cuite (optionnel)","Quelques feuilles de salade","2 c.à.s sauce soja","1 c.à.s huile de sésame","Graines de sésame ou de courge"]'::jsonb,
      '["Cuire le quinoa 12 min dans de l''eau salée. Rincer à l''eau froide pour refroidir rapidement.","Couper le tofu en cubes, mariner dans la sauce soja + huile de sésame 5 min. Poêler à feu vif 6-8 min jusqu''à dorés sur toutes les faces.","Râper les carottes, couper le concombre en rondelles et la betterave en dés.","Monter les bols : quinoa, tofu, crudités et feuilles de salade. Arroser du reste de marinade, parsemer de graines de sésame."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 33) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (33, 'Fajitas Végé Quinoa & Haricots Rouges', 'dejeuner', 30, 520, 22, 78, 12, 2, 'Facile',
      '["PostEntraînement","Budget","PréparationRepas"]'::jsonb,
      '["endurance","masse","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Quinoa', null,
      '["80g quinoa (poids sec)","100g haricots rouges cuits","80g maïs","2-3 wraps complets","1 avocat","1/2 oignon rouge","Cumin, paprika, coriandre fraîche","Jus de citron vert"]'::jsonb,
      '["Cuire le quinoa 12 min dans de l''eau salée. Chauffer les haricots rouges avec cumin, paprika et une pincée de sel dans une poêle 3 min.","Écraser l''avocat avec le jus de citron vert, la coriandre, sel et poivre pour un guacamole express. Émincer l''oignon rouge.","Tiédir les wraps 30 sec à la poêle sèche. Garnir de quinoa, haricots, maïs, oignon rouge et guacamole.","Rouler les fajitas fermement. Couper en biais et servir avec de la coriandre fraîche supplémentaire."]'::jsonb);
  end if;

  -- =====================================================================
  -- DÎNER
  -- =====================================================================

  if not exists (select 1 from public.recipes where id = 3) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (3, 'Curry de Lentilles Corail', 'diner', 30, 450, 24, 58, 14, 4, 'Facile',
      '["RicheEnFer","Budget","PréparationRepas"]'::jsonb,
      '["endurance","sante","seche"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["automne","hiver"]'::jsonb,
      'Lentilles corail', null,
      '["300g lentilles corail","400ml lait de coco","2 tomates concassées","1 oignon","3 gousses d''ail","2 c.à.s pâte de curry rouge","200g épinards frais","1 c.à.c curcuma","Sel, poivre, coriandre fraîche"]'::jsonb,
      '["Émincer l''oignon et l''ail. Faire revenir dans un filet d''huile à feu moyen 4 min jusqu''à translucides.","Ajouter la pâte de curry et le curcuma, mélanger 1 min pour torréfier les épices.","Incorporer les lentilles rincées, les tomates concassées et le lait de coco. Couvrir et cuire 22-25 min à feu doux en remuant régulièrement.","Ajouter les épinards en fin de cuisson, mélanger jusqu''à ce qu''ils fondent. Assaisonner et garnir de coriandre fraîche."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 8) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (8, 'Soupe de Lentilles & Patate Douce', 'diner', 35, 380, 20, 52, 8, 4, 'Facile',
      '["RicheEnFer","Budget","PréparationRepas"]'::jsonb,
      '["seche","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["automne","hiver"]'::jsonb,
      'Lentilles', null,
      '["200g lentilles vertes","2 patates douces moyennes","1 oignon","2 gousses d''ail","1L bouillon de légumes","1 c.à.c cumin","1 c.à.c paprika","Sel, poivre, persil frais"]'::jsonb,
      '["Éplucher et couper les patates douces en dés de 2 cm. Émincer l''oignon et l''ail.","Faire revenir l''oignon dans un filet d''huile 3 min. Ajouter l''ail, le cumin et le paprika, cuire 1 min en remuant.","Ajouter les lentilles rincées, les patates douces et le bouillon chaud. Porter à ébullition puis mijoter 25 min à feu doux.","Mixer partiellement (ou entièrement pour une soupe veloutée). Assaisonner, garnir de persil frais."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 13) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (13, 'Chili Végétarien', 'diner', 40, 420, 22, 55, 12, 4, 'Facile',
      '["RicheEnFer","Budget","PréparationRepas"]'::jsonb,
      '["masse","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["automne","hiver"]'::jsonb,
      'Haricots rouges', null,
      '["400g haricots rouges cuits","200g maïs","400g tomates concassées","1 poivron rouge","1 oignon","2 gousses d''ail","2 c.à.c cumin","1 c.à.c chili en poudre","Coriandre fraîche, avocat"]'::jsonb,
      '["Émincer l''oignon, l''ail et couper le poivron en dés. Faire revenir à l''huile d''olive 5 min jusqu''à tendres.","Ajouter le cumin et le chili en poudre, mélanger 1 min pour faire ressortir les arômes.","Incorporer les tomates concassées, les haricots rouges égouttés et le maïs. Couvrir et mijoter 25-30 min à feu doux.","Ajuster l''assaisonnement. Servir avec de la coriandre fraîche et des tranches d''avocat."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 16) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (16, 'Risotto aux Champignons & Noix', 'diner', 35, 480, 16, 62, 18, 3, 'Moyen',
      '["Budget"]'::jsonb,
      '["endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["automne","hiver"]'::jsonb,
      'Riz arborio', null,
      '["300g riz arborio","300g champignons mélangés","1 oignon","2 gousses d''ail","150ml vin blanc","800ml bouillon de légumes chaud","50g noix concassées","Levure nutritionnelle, thym"]'::jsonb,
      '["Émincer l''oignon et l''ail. Nettoyer et trancher les champignons. Faire revenir oignon et ail dans l''huile 3 min. Ajouter les champignons, cuire 5 min, réserver.","Ajouter le riz arborio dans la casserole, nacrer 2 min en remuant. Déglacer avec le vin blanc, laisser absorber.","Verser le bouillon chaud louche par louche en remuant constamment, en attendant l''absorption avant d''en ajouter. Poursuivre 18-20 min jusqu''à texture crémeuse.","Incorporer les champignons, les noix concassées, la levure nutritionnelle et le thym. Assaisonner et servir immédiatement."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 18) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (18, 'Dhal de Lentilles Corail au Lait de Coco', 'diner', 25, 400, 22, 48, 14, 4, 'Facile',
      '["Budget","PréparationRepas","RicheEnFer"]'::jsonb,
      '["seche","sante","endurance"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["automne","hiver"]'::jsonb,
      'Lentilles corail', null,
      '["250g lentilles corail","400ml lait de coco","2 tomates","1 oignon","2cm gingembre frais","1 c.à.c garam masala","1 c.à.c curcuma","Coriandre, riz basmati"]'::jsonb,
      '["Éplucher et râper finement le gingembre. Émincer l''oignon et couper les tomates en dés.","Faire revenir l''oignon dans l''huile 3-4 min. Ajouter le gingembre, le garam masala et le curcuma, mélanger 1 min.","Incorporer les lentilles rincées, les tomates et le lait de coco. Cuire à feu doux 20 min en remuant régulièrement jusqu''à consistance épaisse.","Assaisonner, garnir de coriandre fraîche et servir avec du riz basmati cuit."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 22) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (22, 'Curry de Pois Chiches au Lait de Coco Léger', 'diner', 25, 520, 22, 68, 18, 3, 'Facile',
      '["Budget","PréparationRepas","RicheEnProtéines"]'::jsonb,
      '["endurance","sante","masse"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["automne","hiver","printemps"]'::jsonb,
      'Pois chiches', null,
      '["500g pois chiches cuits","400g tomates concassées","200ml lait de coco léger","1 oignon","2 gousses d''ail","1 c.à.s curry en poudre","1 c.à.c cumin","1 c.à.c curcuma","1 c.à.s huile d''olive","Sel, poivre","Coriandre (optionnel)","Riz basmati ou complet pour servir"]'::jsonb,
      '["Émincer l''oignon et l''ail. Faire revenir dans l''huile d''olive 4 min à feu moyen.","Ajouter le curry, le cumin et le curcuma, mélanger 1 min pour torréfier. Incorporer les tomates concassées et cuire 3 min.","Ajouter les pois chiches égouttés et le lait de coco. Mijoter 15-18 min à feu moyen-doux.","Assaisonner, garnir de coriandre et servir sur riz cuit selon les instructions."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 24) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (24, 'Pâtes Complètes Sauce Lentilles Corail', 'diner', 25, 560, 26, 86, 12, 3, 'Facile',
      '["PostEntraînement","Budget","RicheEnProtéines"]'::jsonb,
      '["endurance","masse","sante"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["automne","hiver","printemps","ete"]'::jsonb,
      'Lentilles corail', null,
      '["240g pâtes complètes","180g lentilles corail","400g coulis de tomate","1 oignon","1 carotte","2 gousses d''ail","1 c.à.s huile d''olive","1 c.à.c herbes de Provence","Sel, poivre","Graines de tournesol ou levure maltée (option)"]'::jsonb,
      '["Émincer l''oignon, l''ail et couper la carotte en petits dés. Faire revenir dans l''huile 5 min.","Ajouter les lentilles corail rincées, le coulis de tomate, les herbes de Provence et 200ml d''eau. Mijoter 20 min à feu doux.","Cuire les pâtes al dente dans de l''eau bouillante salée. Égoutter.","Mélanger les pâtes avec la sauce lentilles. Parsemer de graines de tournesol ou de levure maltée. Servir chaud."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 27) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (27, 'Bowl Lentilles, Patate Douce & Tofu', 'diner', 40, 580, 32, 72, 16, 2, 'Facile',
      '["PostEntraînement","RicheEnProtéines","PréparationRepas"]'::jsonb,
      '["masse","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["automne","hiver","printemps"]'::jsonb,
      'Lentilles', null,
      '["160g lentilles vertes ou brunes (poids sec)","2 patates douces moyennes","250g tofu ferme","200g brocoli ou haricots verts","2 c.à.s sauce soja","1 c.à.c paprika fumé","Huile d''olive","Sel, poivre"]'::jsonb,
      '["Cuire les lentilles 20-25 min à l''eau bouillante salée. Couper les patates douces en dés et rôtir au four 20 min à 200°C avec un filet d''huile et du sel.","Couper le tofu en cubes, mariner dans sauce soja + paprika fumé 10 min. Poêler à feu vif 8 min jusqu''à bien dorés sur toutes les faces.","Cuire le brocoli (ou haricots verts) à la vapeur 5-6 min, ils doivent rester légèrement croquants.","Monter les bols et arroser du reste de marinade. Assaisonner et servir chaud."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 28) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (28, 'Pâtes Complètes Sauce Pois Chiches', 'diner', 25, 540, 24, 82, 12, 3, 'Facile',
      '["PostEntraînement","Budget","RicheEnProtéines"]'::jsonb,
      '["endurance","masse","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Pois chiches', null,
      '["280g pâtes complètes","400g pois chiches cuits","400g coulis de tomate","1 oignon","2 gousses d''ail","1 c.à.s huile d''olive","1 c.à.c herbes de Provence","Poivrons, aubergine, courgette (au four ou poêlés)","Sel, poivre"]'::jsonb,
      '["Couper les légumes (poivron, aubergine, courgette) en dés et les rôtir 15 min au four à 200°C ou les poêler 10 min dans l''huile.","Faire revenir l''oignon et l''ail 4 min dans l''huile. Ajouter le coulis de tomate, les pois chiches, les herbes et les légumes rôtis. Mijoter 15 min.","Cuire les pâtes al dente. Égoutter en gardant un peu d''eau de cuisson.","Mélanger pâtes et sauce, allonger avec un peu d''eau de cuisson si nécessaire. Servir avec un filet d''huile d''olive."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 29) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (29, 'Soupe de Légumes aux Lentilles Corail', 'diner', 35, 320, 18, 48, 6, 4, 'Facile',
      '["Budget","PréparationRepas","RicheEnProtéines"]'::jsonb,
      '["seche","sante","endurance"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["automne","hiver"]'::jsonb,
      'Lentilles corail', null,
      '["150g lentilles corail","2 carottes","1 poireau","2 pommes de terre","1 courgette","1,2 L bouillon de légumes","1 oignon","2 gousses d''ail","1 c.à.s huile d''olive","Sel, poivre, persil"]'::jsonb,
      '["Éplucher et couper en morceaux : carottes, poireau, pommes de terre et courgette. Émincer l''oignon et l''ail.","Faire revenir l''oignon et l''ail dans l''huile 3 min. Ajouter tous les légumes et les lentilles corail rincées.","Verser le bouillon chaud. Porter à ébullition puis mijoter 25 min à feu doux jusqu''à ce que tout soit tendre.","Mixer partiellement pour un velouté avec des morceaux, ou entièrement pour une texture lisse. Assaisonner et servir avec du persil frais."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 31) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (31, 'Riz Complet, Patate Douce & Lentilles', 'diner', 45, 520, 20, 92, 8, 2, 'Facile',
      '["PostEntraînement","Budget","RicheEnProtéines"]'::jsonb,
      '["endurance","sante","masse"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["automne","hiver","printemps"]'::jsonb,
      'Riz complet', null,
      '["100g riz complet (poids sec)","200g patate douce","100g lentilles vertes (poids sec)","200g brocoli","2 c.à.s huile d''olive","Sel, poivre, herbes"]'::jsonb,
      '["Mettre le riz complet à cuire 30-35 min à l''eau salée. Cuire les lentilles séparément 20-22 min.","Éplucher la patate douce, couper en dés. Cuire à la vapeur 15 min ou rôtir au four 20 min à 200°C.","Couper le brocoli en bouquets, faire sauter dans l''huile d''olive 5-6 min pour conserver le croquant.","Assembler les bols : riz complet, lentilles, patate douce et brocoli. Arroser d''huile d''olive, assaisonner avec sel, poivre et herbes."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 32) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (32, 'Gnocchis Patate Douce, Épinards & Tofu', 'diner', 50, 480, 24, 62, 14, 2, 'Moyen',
      '["PostEntraînement","RicheEnProtéines"]'::jsonb,
      '["endurance","masse","sante"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["automne","hiver"]'::jsonb,
      'Patate douce', null,
      '["400g patates douces","80g farine (blé ou complète)","150g tofu fumé","150g épinards frais","1 gousse d''ail","Huile d''olive, noix de muscade, sel, poivre"]'::jsonb,
      '["Cuire les patates douces entières au four 40 min à 200°C. Laisser tiédir, peler et écraser finement à la fourchette.","Mélanger la purée avec la farine, la noix de muscade et du sel pour obtenir une pâte souple. Rouler en boudins et couper en tronçons (gnocchis).","Cuire les gnocchis dans une grande casserole d''eau bouillante salée jusqu''à ce qu''ils remontent à la surface. Égoutter.","Poêler l''ail dans l''huile 1 min, ajouter les épinards 2 min, puis le tofu fumé en dés 3 min. Incorporer les gnocchis, mélanger délicatement, assaisonner et servir."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 34) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (34, 'Soupe Potimarron & Lentilles Corail', 'diner', 35, 280, 14, 48, 4, 3, 'Facile',
      '["Budget","PréparationRepas","RicheEnProtéines"]'::jsonb,
      '["endurance","sante","seche"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["automne","hiver"]'::jsonb,
      'Potimarron', null,
      '["300g potimarron (sans peau, en dés)","80g lentilles corail","1 oignon","1 c.à.s huile d''olive","700ml bouillon de légumes","Curry ou curcuma, sel, poivre","Pain complet et houmous pour servir"]'::jsonb,
      '["Éplucher le potimarron et couper en dés. Émincer l''oignon.","Faire revenir l''oignon dans l''huile 3 min. Ajouter le curry (ou curcuma) et mélanger 1 min.","Incorporer le potimarron, les lentilles corail rincées et le bouillon. Porter à ébullition, mijoter 25 min.","Mixer finement jusqu''à obtenir un velouté lisse. Assaisonner et servir avec du pain complet et du houmous."]'::jsonb);
  end if;

  -- =====================================================================
  -- COLLATIONS
  -- =====================================================================

  if not exists (select 1 from public.recipes where id = 6) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (6, 'Boules Énergie Chocolat et Dattes', 'collation', 15, 180, 8, 22, 9, 12, 'Facile',
      '["SansCuisson","Budget","PréparationRepas"]'::jsonb,
      '["endurance","masse","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Dattes', null,
      '["200g dattes Medjool dénoyautées","100g flocons d''avoine","3 c.à.s cacao en poudre","2 c.à.s beurre de cacahuète","30g protéine de pois chocolat","2 c.à.s graines de lin moulues","1 c.à.s sirop d''érable"]'::jsonb,
      '["Mixer les dattes dénoyautées au robot jusqu''à obtenir une pâte collante. Ajouter le cacao, la protéine et les graines de lin, mixer à nouveau.","Incorporer les flocons d''avoine, le beurre de cacahuète et le sirop d''érable. Mixer jusqu''à ce que la masse soit homogène et se tienne bien.","Former des boules de la taille d''une noix (environ 12 pièces) avec les mains légèrement humides.","Réfrigérer 1h avant de déguster. Se conserve 2 semaines au réfrigérateur dans un contenant hermétique."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 12) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (12, 'Houmous Protéiné Maison', 'collation', 10, 220, 12, 24, 10, 6, 'Facile',
      '["SansCuisson","Budget","PréparationRepas"]'::jsonb,
      '["masse","sante","seche"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Pois chiches', null,
      '["400g pois chiches cuits","3 c.à.s tahini","2 gousses d''ail","Jus de 2 citrons","2 c.à.s huile d''olive","1 c.à.c cumin","Sel, paprika fumé","Eau glacée pour la texture"]'::jsonb,
      '["Égoutter et rincer les pois chiches. Pour un houmous plus lisse, retirer les peaux en les frottant entre les mains.","Mixer pois chiches, tahini, ail, jus de citron, cumin et sel en ajoutant l''eau glacée cuillère par cuillère pour obtenir une texture crémeuse.","Goûter et ajuster sel/citron. Verser dans un bol, creuser un puits au centre. Arroser d''huile d''olive et saupoudrer de paprika fumé.","Servir avec des crudités ou du pain pita. Se conserve 5 jours au réfrigérateur."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 14) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (14, 'Shake Récupération Banane & Beurre de Cacahuète', 'collation', 5, 380, 30, 42, 14, 1, 'Facile',
      '["PostEntraînement","SansCuisson","RicheEnProtéines"]'::jsonb,
      '["masse","endurance"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Banane', null,
      '["1 banane mûre","30g protéine de pois chocolat","2 c.à.s beurre de cacahuète","250ml lait d''avoine","1 c.à.c cacao en poudre","Quelques glaçons"]'::jsonb,
      '["Placer tous les ingrédients dans le blender : banane coupée en tronçons, protéine en poudre, beurre de cacahuète, lait d''avoine, cacao et glaçons.","Mixer 45-60 secondes à pleine puissance jusqu''à obtenir une texture parfaitement onctueuse.","Déguster immédiatement, idéalement dans les 30 minutes qui suivent l''entraînement pour optimiser la récupération musculaire."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 17) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (17, 'Barres Énergétiques Maison', 'collation', 20, 220, 10, 28, 10, 8, 'Facile',
      '["SansCuisson","PréparationRepas","Budget"]'::jsonb,
      '["endurance","masse"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Flocons d''avoine', null,
      '["150g flocons d''avoine","100g dattes","50g amandes","3 c.à.s beurre de cacahuète","2 c.à.s miel ou sirop d''érable","30g pépites de chocolat noir","1 c.à.s graines de tournesol"]'::jsonb,
      '["Mixer les dattes jusqu''à former une pâte collante. Concasser grossièrement les amandes au couteau.","Mélanger dans un grand bol : flocons d''avoine, pâte de dattes, amandes, beurre de cacahuète, miel/sirop d''érable et graines de tournesol.","Incorporer les pépites de chocolat. Tasser le mélange fermement dans un moule carré (15x15cm) chemisé de papier cuisson.","Réfrigérer 2h minimum. Démouler et couper en 8 barres. Conserver au réfrigérateur jusqu''à 2 semaines."]'::jsonb);
  end if;

  -- =====================================================================
  -- RECETTES 51-60 (nouveau lot)
  -- =====================================================================

  if not exists (select 1 from public.recipes where id = 51) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (51, 'Salade Tiède Lentilles Feta', 'dejeuner', 20, 430, 22, 40, 16, 2, 'Facile',
      '["Budget","RicheEnProtéines"]'::jsonb,
      '["sante","masse"]'::jsonb,
      '["vegetarien"]'::jsonb,
      '["printemps","ete","automne"]'::jsonb,
      'Lentilles', null,
      '["200g lentilles vertes cuites","60g feta (ou tofu fumé pour version végane)","1 carotte râpée","1/2 oignon rouge","1 c.à.s huile d''olive","1 c.à.s vinaigre balsamique","Persil","Sel, poivre"]'::jsonb,
      '["Rincer et égoutter les lentilles cuites (ou cuire 20 min si sèches dans de l''eau non salée).","Râper la carotte, émincer finement l''oignon rouge. Ciseler le persil.","Faire tiédir les lentilles dans une poêle avec l''huile d''olive 2-3 min. Ajouter la carotte et l''oignon rouge, mélanger.","Émietter la feta (ou le tofu fumé en dés). Assaisonner avec le vinaigre balsamique, sel, poivre et parsemer de persil."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 52) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (52, 'Omelette Pois Chiches et Légumes', 'petit-dejeuner', 15, 380, 20, 30, 18, 1, 'Facile',
      '["SansGluten","RicheEnProtéines"]'::jsonb,
      '["endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete","automne"]'::jsonb,
      'Farine de pois chiches', null,
      '["80g farine de pois chiches","160ml eau","1/2 poivron","1/2 oignon","1 poignée d''épinards","1 c.à.s huile d''olive","Curcuma, sel, poivre"]'::jsonb,
      '["Fouetter la farine de pois chiches avec l''eau jusqu''à pâte lisse sans grumeaux. Assaisonner avec curcuma, sel et poivre. Laisser reposer 5 min.","Émincer le poivron et l''oignon. Faire revenir dans l''huile 3 min à feu moyen, ajouter les épinards et cuire encore 1 min.","Verser la pâte directement sur les légumes dans la poêle. Cuire à feu moyen 4-5 min jusqu''à bords bien dorés et centre pris.","Retourner délicatement et cuire 2 min de l''autre côté. Servir immédiatement avec une salade ou du pain complet."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 53) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (53, 'Salade Riz & Pois Chiches (version végé)', 'dejeuner', 15, 460, 20, 70, 10, 2, 'Facile',
      '["PréparationRepas","Budget"]'::jsonb,
      '["endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["printemps","ete"]'::jsonb,
      'Riz', null,
      '["160g riz cuit","200g pois chiches cuits","1 carotte","1/2 concombre","1 c.à.s huile d''olive","Jus de citron","Ciboulette, sel, poivre"]'::jsonb,
      '["Cuire le riz selon les instructions et laisser refroidir complètement (idéalement préparer la veille).","Couper la carotte en petits dés, le concombre en demi-rondelles.","Mélanger le riz froid, les pois chiches égouttés et les légumes dans un saladier.","Assaisonner avec l''huile d''olive, le jus de citron, la ciboulette, sel et poivre. Mélanger et servir frais."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 54) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (54, 'Poêlée Pois Chiches-Épinards Express', 'diner', 15, 390, 18, 38, 14, 2, 'Facile',
      '["Rapide","Budget"]'::jsonb,
      '["seche","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Pois chiches', null,
      '["300g pois chiches cuits","200g épinards frais ou surgelés","1 oignon","1 gousse d''ail","1 c.à.s huile d''olive","1 c.à.c paprika","Sel, poivre"]'::jsonb,
      '["Émincer l''oignon et l''ail. Faire revenir dans l''huile d''olive à feu moyen 3 min.","Ajouter les pois chiches égouttés et le paprika. Faire sauter 4-5 min en remuant pour les dorer légèrement.","Incorporer les épinards (frais ou surgelés). Mélanger jusqu''à complète réduction, environ 2-3 min.","Assaisonner avec sel et poivre. Servir immédiatement avec du pain complet ou en accompagnement d''un plat."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 55) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (55, 'Pizza Tortilla Haricots Rouges', 'dejeuner', 15, 450, 18, 55, 14, 2, 'Facile',
      '["Confort","Rapide"]'::jsonb,
      '["masse","sante"]'::jsonb,
      '["vegetarien"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Tortilla', null,
      '["2 tortillas de blé complètes","200g haricots rouges cuits","4 c.à.s coulis de tomate","50g fromage râpé (ou râpé végétal)","1/2 poivron","Origan, sel, poivre"]'::jsonb,
      '["Préchauffer le four à 200°C (ou utiliser une grande poêle à couvercle). Placer les tortillas sur une plaque recouverte de papier cuisson.","Tartiner chaque tortilla de coulis de tomate. Écraser légèrement les haricots rouges à la fourchette et les répartir.","Couper le poivron en fines lamelles. Disposer sur les tortillas. Saupoudrer de fromage râpé et d''origan.","Cuire 8-10 min jusqu''à ce que les bords soient dorés et le fromage fondu. Servir immédiatement découpé en parts."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 56) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (56, 'Muesli Croustillant Maison', 'petit-dejeuner', 10, 420, 14, 55, 16, 2, 'Facile',
      '["SansCuisson","PréparationRepas"]'::jsonb,
      '["endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Flocons d''avoine', null,
      '["120g flocons d''avoine","20g noix","20g amandes","1 c.à.s graines de tournesol","1 c.à.s huile neutre","2 c.à.s miel ou sirop d''érable","200ml lait végétal pour servir"]'::jsonb,
      '["Préchauffer le four à 180°C. Mélanger flocons d''avoine, noix, amandes et graines de tournesol dans un grand bol.","Ajouter l''huile et le miel (ou sirop d''érable), bien mélanger pour enrober uniformément tous les ingrédients.","Étaler en couche fine sur une plaque recouverte de papier cuisson. Cuire 12-15 min en remuant à mi-cuisson jusqu''à dorure.","Laisser refroidir complètement sur la plaque (le muesli croustit en refroidissant). Servir avec du lait végétal. Conserver en bocal hermétique 2 semaines."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 57) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (57, 'Salade Boulgour Pois Chiches Citron', 'dejeuner', 20, 440, 16, 64, 12, 2, 'Facile',
      '["PréparationRepas","Budget"]'::jsonb,
      '["endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["printemps","ete"]'::jsonb,
      'Boulgour', null,
      '["160g boulgour cuit","200g pois chiches cuits","150g tomates cerises","1/2 concombre","2 c.à.s huile d''olive","Jus de 1 citron","Menthe ou persil","Sel, poivre"]'::jsonb,
      '["Cuire le boulgour : verser de l''eau bouillante salée à hauteur + 1cm, couvrir et laisser gonfler 10 min hors du feu. Égrainer à la fourchette.","Couper les tomates cerises en deux, le concombre en petits dés. Ciseler finement la menthe ou le persil.","Mélanger le boulgour tiède ou froid avec les pois chiches égouttés, les légumes et les herbes.","Assaisonner avec l''huile d''olive, le jus de citron, sel et poivre. Laisser mariner 10 min avant de servir."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 58) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (58, 'Poêlée de Légumes et Tofu Façon Wok', 'diner', 20, 420, 24, 35, 16, 2, 'Facile',
      '["PostEntraînement","Rapide"]'::jsonb,
      '["masse","endurance"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["printemps","ete","automne"]'::jsonb,
      'Tofu', null,
      '["200g tofu ferme","1 carotte","1 poivron","1 courgette","2 c.à.s sauce soja","1 c.à.s huile de sésame ou tournesol","1 gousse d''ail","80g nouilles de blé ou riz cuites"]'::jsonb,
      '["Couper le tofu en cubes, la carotte en julienne, le poivron et la courgette en lamelles fines. Émincer l''ail.","Chauffer l''huile à feu vif dans un wok ou grande poêle. Faire dorer le tofu 5 min sans remuer pour obtenir une croûte.","Ajouter les légumes et l''ail, sauter à feu vif 5-6 min en remuant constamment. Les légumes doivent rester croquants.","Incorporer les nouilles cuites et la sauce soja. Mélanger 2 min. Servir immédiatement avec un filet d''huile de sésame."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 59) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (59, 'Crème Dessert Chocolat Tofu Soyeux', 'collation', 10, 260, 12, 22, 14, 2, 'Facile',
      '["SansCuisson","Confort"]'::jsonb,
      '["sante","masse"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Tofu soyeux', null,
      '["200g tofu soyeux","2 c.à.s cacao en poudre","2 c.à.s sirop d''érable","1 c.à.c extrait de vanille","1 pincée de sel"]'::jsonb,
      '["Égoutter légèrement le tofu soyeux en l''enveloppant dans du papier absorbant 5 min.","Placer dans le blender avec le cacao, le sirop d''érable, la vanille et la pincée de sel.","Mixer 60-90 secondes à puissance maximale jusqu''à obtenir une texture parfaitement lisse et crémeuse.","Verser dans des ramequins et réfrigérer au moins 1h avant de déguster. Se conserve 3 jours au réfrigérateur."]'::jsonb);
  end if;

  if not exists (select 1 from public.recipes where id = 60) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (60, 'Soupe Tomate-Lentilles Simple', 'diner', 25, 320, 16, 42, 6, 3, 'Facile',
      '["Budget","PréparationRepas"]'::jsonb,
      '["endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete","automne"]'::jsonb,
      'Tomates', null,
      '["400g tomates concassées","120g lentilles corail","1 oignon","1 gousse d''ail","800ml bouillon de légumes","1 c.à.s huile d''olive","Basilic, sel, poivre"]'::jsonb,
      '["Émincer l''oignon et l''ail. Faire revenir dans l''huile d''olive à feu moyen 3 min jusqu''à translucides.","Ajouter les tomates concassées, mélanger 2 min. Incorporer les lentilles corail rincées et le bouillon de légumes.","Porter à ébullition puis mijoter à feu doux 20 min jusqu''à ce que les lentilles soient fondantes.","Mixer partiellement pour une texture mi-veloutée avec des morceaux. Assaisonner et garnir de basilic frais ciselé."]'::jsonb);
  end if;

end $$;
