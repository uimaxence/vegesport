-- Article 5 : Recettes végétariennes pré et post entraînement + 5 nouvelles recettes
alter table public.blog_articles
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists content_json jsonb;

-- Recettes 25 à 29
do $$
begin
  if not exists (select 1 from public.recipes where id = 25) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (25, 'Bowl Riz Complet, Pois Chiches & Légumes', 'dejeuner', 35, 520, 20, 78, 12, 2, 'Facile',
      '["#PostEntraînement","#Budget","#PréparationRepas"]'::jsonb, '["endurance","sante","masse"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["printemps","ete","automne","hiver"]'::jsonb, 'Riz complet',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
      '["160g riz complet","300g pois chiches cuits","2 carottes","1 courgette","1 poivron","1 oignon","2 c.à.s huile d''olive","Sel, poivre, herbes (persil ou coriandre)"]'::jsonb,
      '["Faites cuire le riz complet selon les instructions du paquet.","Pelez et coupez les carottes, courgette et poivron en dés. Faites revenir l''oignon dans l''huile, ajoutez les légumes et faites rôtir 12-15 min.","Réchauffez les pois chiches (ou ajoutez-les en fin de cuisson des légumes).","Répartissez le riz dans les bols, ajoutez légumes et pois chiches. Arrosez d''un filet d''huile d''olive, salez, poivrez et parsemez d''herbes."]'::jsonb);
  end if;
  if not exists (select 1 from public.recipes where id = 26) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (26, 'Bowl Quinoa, Tofu & Crudités', 'dejeuner', 30, 480, 28, 52, 18, 2, 'Facile',
      '["#PostEntraînement","#RicheEnProtéines","#PréparationRepas"]'::jsonb, '["masse","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["printemps","ete","automne","hiver"]'::jsonb, 'Quinoa',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
      '["140g quinoa","250g tofu ferme","2 carottes","1 concombre","1 betterave cuite (optionnel)","Quelques feuilles de salade","2 c.à.s sauce soja","1 c.à.s huile de sésame","Graines de sésame ou de courge"]'::jsonb,
      '["Cuisez le quinoa à l''eau. Égouttez et laissez refroidir un peu.","Coupez le tofu en dés, faites-le mariner 5 min dans la sauce soja puis poêlez 6-8 min.","Râpez carottes et betterave, coupez le concombre en bâtonnets, ciselez la salade.","Dans les bols, déposez le quinoa, le tofu, les crudités. Arrosez d''huile de sésame et parsemez de graines."]'::jsonb);
  end if;
  if not exists (select 1 from public.recipes where id = 27) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (27, 'Bowl Lentilles, Patate Douce & Tofu', 'diner', 40, 580, 32, 72, 16, 2, 'Facile',
      '["#PostEntraînement","#RicheEnProtéines","#PréparationRepas"]'::jsonb, '["masse","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["automne","hiver","printemps"]'::jsonb, 'Lentilles',
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop',
      '["160g lentilles vertes ou brunes (poids sec)","2 patates douces moyennes","250g tofu ferme","200g brocoli ou haricots verts","2 c.à.s sauce soja","1 c.à.c paprika fumé","Huile d''olive","Sel, poivre"]'::jsonb,
      '["Faites cuire les lentilles à l''eau. Préchauffez le four à 200°C.","Coupez les patates douces en dés, arrosez d''huile, enfournez 25-30 min.","Coupez le tofu en dés, marinez 5 min (sauce soja + paprika), poêlez 6-8 min.","Faites cuire le brocoli ou les haricots verts à la vapeur ou à l''eau.","Répartissez lentilles, patate douce, tofu et légumes verts dans les bols. Salez, poivrez."]'::jsonb);
  end if;
  if not exists (select 1 from public.recipes where id = 28) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (28, 'Pâtes Complètes Sauce Pois Chiches', 'diner', 25, 540, 24, 82, 12, 3, 'Facile',
      '["#PostEntraînement","#Budget","#RicheEnProtéines"]'::jsonb, '["endurance","masse","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["printemps","ete","automne","hiver"]'::jsonb, 'Pois chiches',
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop',
      '["280g pâtes complètes","400g pois chiches cuits","400g coulis de tomate","1 oignon","2 gousses d''ail","1 c.à.s huile d''olive","1 c.à.c herbes de Provence","Poivrons, aubergine, courgette (au four ou poêlés)","Sel, poivre"]'::jsonb,
      '["Faites revenir l''oignon et l''ail dans l''huile. Ajoutez le coulis de tomate, les pois chiches (écrasés à la fourchette pour une texture onctueuse) et les herbes.","Laissez mijoter 10-12 min. Salez, poivrez.","Faites cuire les pâtes, égouttez. Servez avec la sauce et des légumes rôtis (poivrons, aubergine, courgette) à côté."]'::jsonb);
  end if;
  if not exists (select 1 from public.recipes where id = 29) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (29, 'Soupe de Légumes aux Lentilles Corail', 'diner', 35, 320, 18, 48, 6, 4, 'Facile',
      '["#Budget","#PréparationRepas","#RicheEnProtéines"]'::jsonb, '["seche","sante","endurance"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["automne","hiver"]'::jsonb, 'Lentilles corail',
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop',
      '["150g lentilles corail","2 carottes","1 poireau","2 pommes de terre","1 courgette","1,2 L bouillon de légumes","1 oignon","2 gousses d''ail","1 c.à.s huile d''olive","Sel, poivre, persil"]'::jsonb,
      '["Faites revenir l''oignon et l''ail dans l''huile. Ajoutez les légumes coupés en dés (carottes, poireau, pommes de terre, courgette).","Versez le bouillon et les lentilles corail rincées. Portez à ébullition puis laissez mijoter 20-25 min.","Mixez partiellement pour une texture épaisse ou laissez tel quel. Salez, poivrez, parsemez de persil.","Servez avec du pain complet et du houmous ou une tartinade de pois chiches."]'::jsonb);
  end if;

  if not exists (select 1 from public.blog_articles where title = 'Recettes végétariennes pré et post entraînement pour sportifs') then
    insert into public.blog_articles (id, title, excerpt, meta_title, meta_description, category, date, read_time, image, author, content, content_json)
    overriding system value
    values (
      10,
      'Recettes végétariennes pré et post entraînement pour sportifs',
      'Des idées de repas et collations végétariennes avant et après l''entraînement, pour l''énergie et la récupération, sans prise de tête.',
      'Recettes végétariennes pré et post entraînement (simples et efficaces) | Et si mamie était végé ?',
      'Des idées de repas et collations végétariennes avant et après l''entraînement, pour l''énergie et la récupération, sans prise de tête.',
      'Nutrition', '2026-03-13'::date, 11,
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop',
      'Maxence', '',
      '[
        {"type":"heading","level":1,"text":"Recettes végétariennes pré et post entraînement pour sportifs"},
        {"type":"paragraph","text":"Manger végétarien quand on fait du sport, ce n''est pas seulement « remplacer la viande ». Avant et après l''entraînement, ton assiette a un vrai impact sur ton énergie, ta récupération, tes courbatures et ton envie de revenir t''entraîner. Cet article te propose des repères simples et des idées de recettes concrètes, version « Et si mamie était végé ? »."},
        {"type":"paragraph","text":"Les besoins précis varient selon ton sport, ton niveau, ton poids et ton objectif. Les idées ci‑dessous sont des bases à adapter."},
        {"type":"heading","level":2,"text":"Que manger avant l''entraînement en mode végétarien ?"},
        {"type":"paragraph","text":"Avant l''entraînement, on cherche surtout :"},
        {"type":"list","items":["De l''énergie facilement utilisable (glucides).","Une digestion confortable (éviter les plats trop gras ou trop lourds).","Un peu de protéines, surtout si le repas est loin dans le temps."]},
        {"type":"heading","level":2,"text":"Repas 2–3 heures avant la séance"},
        {"type":"paragraph","text":"Idéal si tu manges « vrai repas » avant de bouger."},
        {"type":"heading","level":3,"text":"Idée 1 – Bol riz complet, pois chiches et légumes"},
        {"type":"paragraph","text":"Riz complet, pois chiches (ou lentilles), légumes cuits (carottes, courgettes, poivrons), un filet d''huile d''olive. Tu as des glucides pour l''énergie, des protéines végétales et un peu de graisses, sans être trop lourd."},
        {"type":"recipes","recipeIds":[25]},
        {"type":"heading","level":3,"text":"Idée 2 – Pâtes complètes aux lentilles corail"},
        {"type":"paragraph","text":"Pâtes complètes, sauce tomate avec lentilles corail, oignon, carotte, herbes. Salade verte à côté. Les pâtes complètes et les lentilles corail sont faciles à intégrer, surtout avant une séance d''endurance ou de renfo."},
        {"type":"recipes","recipeIds":[24]},
        {"type":"heading","level":3,"text":"Idée 3 – Bowl quinoa, tofu et crudités"},
        {"type":"paragraph","text":"Quinoa, tofu mariné poêlé, crudités (carottes râpées, concombre, salade, betterave), graines de sésame ou de courge. Un repas complet, bon pour une séance fin de matinée ou fin de journée."},
        {"type":"recipes","recipeIds":[26]},
        {"type":"heading","level":2,"text":"Collations 30–60 minutes avant la séance"},
        {"type":"paragraph","text":"Si ton dernier repas remonte un peu, une petite collation riche en glucides, modérément fibreuse, peut aider."},
        {"type":"list","items":["1 banane ou 1 pomme.","1 compote sans sucres ajoutés.","1 tartine de pain complet avec un peu de purée de fruits ou de purée d''oléagineux (fine couche).","1 petite poignée de fruits secs (raisins, dattes, figues) si tu les digères bien."]},
        {"type":"paragraph","text":"Évite les grosses quantités de graisses juste avant l''effort (trop de fromage, beaucoup d''oléagineux, plats frits), qui peuvent ralentir la digestion."},
        {"type":"heading","level":2,"text":"Que manger après l''entraînement en végétarien ?"},
        {"type":"paragraph","text":"Après l''effort, la priorité : apporter des protéines pour la réparation musculaire, recharger les réserves de glycogène (glucides), réhydrater et apporter des minéraux (sodium, potassium, magnésium…)."},
        {"type":"heading","level":2,"text":"Collation post-entraînement (dans l''heure qui suit)"},
        {"type":"paragraph","text":"Pas obligatoire, mais souvent pratique, surtout si le repas suivant est loin."},
        {"type":"heading","level":3,"text":"Idée 1 – Yaourt végétal + fruit + poignée d''oléagineux"},
        {"type":"paragraph","text":"1 yaourt végétal (soja par exemple), 1 fruit (banane, pomme, poire…), 1 petite poignée d''amandes ou de noix."},
        {"type":"heading","level":3,"text":"Idée 2 – Smoothie de récup''"},
        {"type":"paragraph","text":"Boisson végétale, 1 banane, quelques fruits rouges (frais ou surgelés), une cuillère à soupe de flocons d''avoine ou de graines (chanvre, chia)."},
        {"type":"recipes","recipeIds":[4]},
        {"type":"heading","level":3,"text":"Idée 3 – Tartines express"},
        {"type":"paragraph","text":"Pain complet, houmous ou autre tartinade de légumineuses, quelques rondelles de tomate ou concombre. Si tu utilises une poudre de protéines végétales, tu peux l''ajouter dans le smoothie ou la boire avec un fruit."},
        {"type":"recipes","recipeIds":[12]},
        {"type":"heading","level":2,"text":"5 idées de repas végétariens après le sport"},
        {"type":"heading","level":3,"text":"1. Chili sin carne complet"},
        {"type":"paragraph","text":"Haricots rouges, maïs, tomates, oignon, ail, épices (cumin, paprika, chili). Servi avec du riz complet ou du quinoa. Salade verte ou crudités en accompagnement. Bon combo protéines + glucides + fibres, idéal après une séance de musculation ou une sortie longue."},
        {"type":"recipes","recipeIds":[13]},
        {"type":"heading","level":3,"text":"2. Curry de pois chiches au lait de coco léger"},
        {"type":"paragraph","text":"Pois chiches, lait de coco léger + tomates + oignon + épices curry. Riz basmati ou complet. Coriandre fraîche si tu aimes. Plat réconfortant, parfait pour un dîner de récup après un entraînement du soir."},
        {"type":"recipes","recipeIds":[22]},
        {"type":"heading","level":3,"text":"3. Bowl lentilles, patate douce et tofu"},
        {"type":"paragraph","text":"Lentilles (vertes ou brunes), patate douce rôtie (ou pommes de terre), tofu mariné et grillé, légumes verts (brocoli, épinards, haricots verts). C''est un bowl « full récup » : protéines, glucides, fibres, minéraux."},
        {"type":"recipes","recipeIds":[27]},
        {"type":"heading","level":3,"text":"4. Pâtes complètes « boost récup »"},
        {"type":"paragraph","text":"Pâtes complètes, sauce tomate maison avec pois chiches ou haricots blancs, légumes au four (poivrons, aubergines, courgettes). Très bon après une séance d''endurance ou un match."},
        {"type":"recipes","recipeIds":[28]},
        {"type":"heading","level":3,"text":"5. Soupe de légumes épaissie aux légumineuses"},
        {"type":"paragraph","text":"Base : soupe de légumes (carottes, poireaux, pommes de terre, courgettes…). Ajout de lentilles corail ou de pois cassés pour les protéines. Pain complet et houmous ou tartinade de pois chiches à côté. Pratique en hiver après une séance, réconfortant et nourrissant."},
        {"type":"recipes","recipeIds":[29]},
        {"type":"cta_planning"},
        {"type":"heading","level":2,"text":"Idées de snacks végétariens à emporter pour le sport"},
        {"type":"list","items":["Mélange maison : fruits secs + oléagineux (amandes, noix, raisins secs, cranberries…).","Petites barres maison à base de flocons d''avoine, purée de cacahuète, fruits secs.","Bâtonnets de légumes (carottes, concombre) + petit pot de houmous.","Crackers complets + tartinade de lentilles ou de pois chiches."]},
        {"type":"paragraph","text":"À adapter selon ta tolérance digestive et ton sport (en course à pied, certains supportent moins bien les fibres juste avant ou pendant)."},
        {"type":"heading","level":2,"text":"Comment adapter ces recettes à ton sport ?"},
        {"type":"list","items":["Sports d''endurance (running, vélo, trail…) : avant un peu plus de glucides si séance longue ; après glucides + protéines, et bien penser à boire.","Sports de force / musculation : veille à avoir assez de protéines sur la journée ; après la séance, un repas ou une collation protéinée avec glucides.","Sports collectifs (foot, basket, hand…) : l''avant ressemble à l''endurance (énergie, digestion OK) ; l''après ressemble à un mix endurance/force (récup + réparation)."]},
        {"type":"paragraph","text":"Tu peux piocher dans les recettes de cet article pour composer ta routine : par exemple, un bowl lentilles/quinoa/tofu le midi, une collation banane + yaourt végétal après l''entraînement, puis un chili sin carne ou un curry de pois chiches le soir."}
      ]'::jsonb
    );
  end if;
end $$;
