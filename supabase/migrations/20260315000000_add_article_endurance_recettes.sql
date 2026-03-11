-- Article : Recettes végétariennes pour sports d'endurance + 5 nouvelles recettes
alter table public.blog_articles
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists content_json jsonb;

do $$
begin
  -- Recette 30 : Porridge Boost Endurance
  if not exists (select 1 from public.recipes where id = 30) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (30, 'Porridge Boost Endurance', 'petit-dejeuner', 10, 480, 12, 88, 8, 1, 'Facile',
      '["#PostEntraînement","#Budget","#PréparationRepas"]'::jsonb, '["endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["printemps","ete","automne","hiver"]'::jsonb, 'Flocons d''avoine',
      'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&h=400&fit=crop',
      '["80g flocons d''avoine","200ml boisson végétale","1 banane","20g raisins secs","1 c.à.s graines de chia","1 pincée de cannelle (optionnel)"]'::jsonb,
      '["Faites chauffer la boisson végétale dans une casserole, ajoutez les flocons d''avoine et les graines de chia. Remuez 4-5 min à feu doux.","Écrasez la banane à la fourchette et incorporez-la avec les raisins secs. Laissez épaissir 1 min.","Versez dans un bol. Idéal 2-3 h avant une sortie longue (running, vélo, trail)."]'::jsonb);
  end if;
  -- Recette 31 : Riz Complet, Patate Douce & Lentilles
  if not exists (select 1 from public.recipes where id = 31) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (31, 'Riz Complet, Patate Douce & Lentilles', 'diner', 45, 520, 20, 92, 8, 2, 'Facile',
      '["#PostEntraînement","#Budget","#RicheEnProtéines"]'::jsonb, '["endurance","sante","masse"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["automne","hiver","printemps"]'::jsonb, 'Riz complet',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
      '["100g riz complet (poids sec)","200g patate douce","100g lentilles vertes (poids sec)","200g brocoli","2 c.à.s huile d''olive","Sel, poivre, herbes"]'::jsonb,
      '["Faites cuire le riz et les lentilles séparément selon les instructions. Préchauffez le four à 200°C.","Coupez la patate douce en dés, arrosez d''huile, enfournez 25-30 min.","Faites cuire le brocoli à la vapeur 5-6 min.","Répartissez riz, lentilles, patate douce et brocoli dans les assiettes. Arrosez d''huile d''olive, salez, poivrez. Parfait après une sortie longue."]'::jsonb);
  end if;
  -- Recette 32 : Gnocchis Patate Douce, Épinards & Tofu
  if not exists (select 1 from public.recipes where id = 32) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (32, 'Gnocchis Patate Douce, Épinards & Tofu', 'diner', 50, 480, 24, 62, 14, 2, 'Moyen',
      '["#PostEntraînement","#RicheEnProtéines"]'::jsonb, '["endurance","masse","sante"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb, '["automne","hiver"]'::jsonb, 'Patate douce',
      'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop',
      '["400g patates douces","80g farine (blé ou complète)","150g tofu fumé","150g épinards frais","1 gousse d''ail","Huile d''olive, noix de muscade, sel, poivre"]'::jsonb,
      '["Cuisez les patates douces à l''eau ou au four, épluchez et écrasez en purée. Laissez refroidir, ajoutez la farine et pétrissez. Formez des gnocchis (petits boudins coupés au couteau).","Plongez les gnocchis 2-3 min dans l''eau bouillante salée. Ils remontent quand c''est cuit. Égouttez.","Émiettez le tofu, faites revenir à la poêle avec l''ail. Ajoutez les épinards et les gnocchis, salez, poivrez, noix de muscade. Réconfortant post-marathon."]'::jsonb);
  end if;
  -- Recette 33 : Fajitas Végé Quinoa & Haricots Rouges
  if not exists (select 1 from public.recipes where id = 33) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (33, 'Fajitas Végé Quinoa & Haricots Rouges', 'dejeuner', 30, 520, 22, 78, 12, 2, 'Facile',
      '["#PostEntraînement","#Budget","#PréparationRepas"]'::jsonb, '["endurance","masse","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["printemps","ete","automne","hiver"]'::jsonb, 'Quinoa',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop',
      '["80g quinoa (poids sec)","100g haricots rouges cuits","80g maïs","2-3 wraps complets","1 avocat","1/2 oignon rouge","Cumin, paprika, coriandre fraîche","Jus de citron vert"]'::jsonb,
      '["Cuisez le quinoa à l''eau. Réchauffez haricots rouges et maïs avec cumin et paprika.","Chauffez les wraps à sec dans une poêle. Préparez la garniture : avocat en tranches, oignon émincé, coriandre, citron vert.","Garnissez les wraps de quinoa, haricots, maïs et avocat. Glucides rapides + protéines, idéal après vélo ou trail."]'::jsonb);
  end if;
  -- Recette 34 : Soupe Potimarron & Lentilles Corail
  if not exists (select 1 from public.recipes where id = 34) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps)
    overriding system value
    values (34, 'Soupe Potimarron & Lentilles Corail', 'diner', 35, 280, 14, 48, 4, 3, 'Facile',
      '["#Budget","#PréparationRepas","#RicheEnProtéines"]'::jsonb, '["endurance","sante","seche"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb, '["automne","hiver"]'::jsonb, 'Potimarron',
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop',
      '["300g potimarron (sans peau, en dés)","80g lentilles corail","1 oignon","1 c.à.s huile d''olive","700ml bouillon de légumes","Curry ou curcuma, sel, poivre","Pain complet et houmous pour servir"]'::jsonb,
      '["Faites revenir l''oignon dans l''huile. Ajoutez le potimarron, les lentilles corail rincées et le bouillon. Portez à ébullition puis laissez mijoter 20-25 min.","Mixez en soupe lisse ou laissez rustique. Assaisonnez (curry, curcuma, sel, poivre).","Servez avec du pain complet et du houmous. Récup douce en hiver après une sortie."]'::jsonb);
  end if;

  if not exists (select 1 from public.blog_articles where title = 'Recettes végétariennes pour sports d''endurance (running, vélo, trail…)') then
    insert into public.blog_articles (id, title, excerpt, meta_title, meta_description, category, date, read_time, image, author, content, content_json)
    overriding system value
    values (
      12,
      'Recettes végétariennes pour sports d''endurance (running, vélo, trail…)',
      'Recettes végétariennes riches en glucides pour running, vélo, trail : énergie durable et récupération. Idées simples pour tes sorties longues.',
      'Recettes végétariennes pour sports d''endurance (running, vélo…) | Et si mamie était végé ?',
      'Recettes végétariennes riches en glucides pour running, vélo, trail : énergie durable et récupération. Idées simples pour tes sorties longues.',
      'Nutrition', '2026-03-15'::date, 10,
      'https://images.unsplash.com/photo-1571008887538-b36bb32f8531?w=600&h=400&fit=crop',
      'Maxence', '',
      '[
        {"type":"heading","level":1,"text":"Recettes végétariennes pour sports d''endurance (running, vélo, trail…)"},
        {"type":"paragraph","text":"Pour les sports d''endurance, l''énergie vient surtout des glucides. En végétarien, c''est même un avantage : fruits, céréales complètes, légumineuses et légumes te donnent une énergie stable sans pics de glycémie. Cet article te propose des recettes et idées pensées pour avant, pendant et après tes sorties running, vélo ou trail, avec des ingrédients faciles à trouver en France."},
        {"type":"heading","level":2,"text":"Pourquoi le végétarien marche bien en endurance ?"},
        {"type":"paragraph","text":"Les études montrent que les végétariens excellent souvent en endurance : meilleure VO2 max, moins d''inflammation, énergie durable grâce aux glucides végétaux. Une étude française note une récupération accélérée grâce aux antioxydants. L''étude Magicfit 2026 confirme : pas de perte de perf, récup améliorée. Besoins type endurance : 6–10 g glucides/kg/jour + 1,2–1,6 g protéines/kg selon l''AFSSA."},
        {"type":"heading","level":2,"text":"Avant la sortie longue : charge en glucides"},
        {"type":"heading","level":3,"text":"Petit-déj 2–3 h avant (400–600 kcal)"},
        {"type":"paragraph","text":"Porridge boost endurance : 80 g flocons d''avoine + boisson végétale, banane écrasée + raisins secs (20 g), 1 c. à s. graines de chia. Environ 70 g glucides, 12 g protéines."},
        {"type":"recipes","recipeIds":[30]},
        {"type":"heading","level":3,"text":"Collation 1 h avant"},
        {"type":"paragraph","text":"2 tranches pain complet + miel ou confiture. 1 banane. Eau + pincée de sel (sodium pré-effort)."},
        {"type":"heading","level":2,"text":"Pendant l''effort : énergie portable"},
        {"type":"paragraph","text":"Maison et végé (vs gels industriels) : barres énergétiques maison (flocons avoine + dattes + purée cacahuète), compote banane-datte, fruits secs (figues/raisins 30 g ≈ 20 g glucides), pain d''épices végé. Boissons : eau + jus citron + miel + pincée de sel ; thé vert froid + maltodextrine si tu en as."},
        {"type":"recipes","recipeIds":[17]},
        {"type":"heading","level":2,"text":"5 recettes post-sortie longue (récup glucides + protéines)"},
        {"type":"heading","level":3,"text":"1. Riz complet, patate douce, lentilles"},
        {"type":"paragraph","text":"Riz complet, patate douce rôtie, lentilles vertes, brocoli vapeur + huile d''olive. Environ 90 g glucides, 20 g protéines."},
        {"type":"recipes","recipeIds":[31]},
        {"type":"heading","level":3,"text":"2. Pâtes complètes sauce pois chiches-tomate"},
        {"type":"paragraph","text":"Pâtes complètes, sauce tomate avec pois chiches, oignon, basilic. Salade roquette. Parfait après 2 h+ vélo ou trail."},
        {"type":"recipes","recipeIds":[28]},
        {"type":"heading","level":3,"text":"3. Gnocchis patate douce, épinards, tofu"},
        {"type":"paragraph","text":"Gnocchis maison (patate douce + farine), tofu fumé émietté, épinards frais. Réconfortant post-marathon."},
        {"type":"recipes","recipeIds":[32]},
        {"type":"heading","level":3,"text":"4. Quinoa, maïs, haricots rouges (fajitas végé)"},
        {"type":"paragraph","text":"Quinoa, haricots rouges + maïs, wraps complets + avocat. Glucides rapides + protéines."},
        {"type":"recipes","recipeIds":[33]},
        {"type":"heading","level":3,"text":"5. Soupe potimarron-lentilles corail"},
        {"type":"paragraph","text":"Potimarron + lentilles corail. Pain complet + houmous. Hiver, récup douce."},
        {"type":"recipes","recipeIds":[34,12]},
        {"type":"cta_planning"},
        {"type":"heading","level":2,"text":"Exemple journée coureur 70 kg (prépa semi-marathon)"},
        {"type":"list","items":["Veille course longue : PDJ porridge banane-raisins, déj pâtes lentilles + légumes, collation pain miel + noix, dîner riz patate douce lentilles.","Jour J 20 km : 2 h avant porridge light + banane ; pendant 2 barres maison + boisson ; après pâtes pois chiches dans l''heure."]},
        {"type":"heading","level":2,"text":"Astuces endurance végé France"},
        {"type":"list","items":["Saison : patate douce/betterave en automne, quinoa bio en supermarché.","Batch cooking : cuire 500 g riz + 400 g légumineuses le dimanche.","Supermarché : pois chiches, tofu, flocons bio faciles à trouver.","Carences à surveiller : fer (lentilles + vitamine C), magnésium (graines). Test sanguin annuel recommandé."]}
      ]'::jsonb
    );
  end if;
end $$;
