-- Ajoute des champs SEO et un contenu structuré (blocs) pour les articles
alter table public.blog_articles
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists content_json jsonb;

comment on column public.blog_articles.meta_title is 'Meta title SEO (optionnel)';
comment on column public.blog_articles.meta_description is 'Meta description SEO (optionnel)';
comment on column public.blog_articles.content_json is 'Contenu structuré (blocs) pour rendu côté front (optionnel)';

-- Insert article + recettes associées (id stables pour pouvoir les référencer depuis content_json)
do $$
begin
  -- Recettes (si elles n'existent pas déjà)
  if not exists (select 1 from public.recipes where title = 'Bowl Lentilles, Quinoa & Tofu Mariné') then
    insert into public.recipes (
      id, title, category, time, calories, protein, carbs, fat, servings, difficulty,
      tags, objective, regime, season, main_ingredient, image, ingredients, steps
    )
    overriding system value
    values (
      21,
      'Bowl Lentilles, Quinoa & Tofu Mariné',
      'dejeuner',
      30, 620, 38, 70, 20,
      2,
      'Facile',
      '["#PostEntraînement","#RicheEnProtéines","#PréparationRepas"]'::jsonb,
      '["masse","endurance","sante"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Lentilles',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop',
      '["160g lentilles vertes (poids sec) ou 400g cuites","140g quinoa (poids sec)","250g tofu ferme","2 c.à.s sauce soja","1 gousse d''ail","1 c.à.s jus de citron","1 c.à.s huile d''olive","1 c.à.c paprika fumé","2 poignées d''épinards","2 carottes râpées","2 c.à.s graines de courge","4 c.à.s yaourt végétal nature","Sel, poivre, herbes (persil ou ciboulette)"]'::jsonb,
      '["Faites cuire le quinoa et les lentilles (ou rincez/égouttez si déjà cuits).","Coupez le tofu en dés. Mélangez sauce soja, ail râpé, citron, paprika et un filet d''huile, puis faites mariner 10 minutes.","Faites dorer le tofu à la poêle 6-8 minutes.","Dans deux bols, répartissez quinoa + lentilles, ajoutez carottes râpées et épinards.","Préparez une sauce express : yaourt végétal + herbes + sel/poivre + un trait de citron.","Ajoutez le tofu et parsemez de graines de courge. Servez tiède ou froid (meal prep)."]'::jsonb
    );
  end if;

  if not exists (select 1 from public.recipes where title = 'Curry de Pois Chiches au Lait de Coco Léger') then
    insert into public.recipes (
      id, title, category, time, calories, protein, carbs, fat, servings, difficulty,
      tags, objective, regime, season, main_ingredient, image, ingredients, steps
    )
    overriding system value
    values (
      22,
      'Curry de Pois Chiches au Lait de Coco Léger',
      'diner',
      25, 520, 22, 68, 18,
      3,
      'Facile',
      '["#Budget","#PréparationRepas","#RicheEnProtéines"]'::jsonb,
      '["endurance","sante","masse"]'::jsonb,
      '["vegetarien","vegetalien","sans-gluten"]'::jsonb,
      '["automne","hiver","printemps"]'::jsonb,
      'Pois chiches',
      'https://images.unsplash.com/photo-1604908176997-125f25cc500f?w=600&h=400&fit=crop',
      '["500g pois chiches cuits","400g tomates concassées","200ml lait de coco léger","1 oignon","2 gousses d''ail","1 c.à.s curry en poudre","1 c.à.c cumin","1 c.à.c curcuma","1 c.à.s huile d''olive","Sel, poivre","Coriandre (optionnel)","Riz basmati ou complet pour servir"]'::jsonb,
      '["Faites revenir l''oignon émincé et l''ail dans l''huile 2-3 minutes.","Ajoutez curry, cumin et curcuma, mélangez 30 secondes.","Ajoutez tomates concassées, pois chiches et lait de coco léger.","Laissez mijoter 12-15 minutes à feu doux, salez et poivrez.","Servez avec du riz et un peu de coriandre ou graines de sésame."]'::jsonb
    );
  end if;

  if not exists (select 1 from public.recipes where title = 'Galettes Haricots Blancs & Flocons d’Avoine') then
    insert into public.recipes (
      id, title, category, time, calories, protein, carbs, fat, servings, difficulty,
      tags, objective, regime, season, main_ingredient, image, ingredients, steps
    )
    overriding system value
    values (
      23,
      'Galettes Haricots Blancs & Flocons d’Avoine',
      'dejeuner',
      20, 360, 20, 44, 10,
      4,
      'Facile',
      '["#Budget","#RicheEnProtéines","#PréparationRepas"]'::jsonb,
      '["seche","sante","masse"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["printemps","ete","automne","hiver"]'::jsonb,
      'Haricots blancs',
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop',
      '["480g haricots blancs cuits (égouttés)","60g flocons d''avoine","1 oignon","1 gousse d''ail","2 c.à.s persil ou ciboulette","1 c.à.c paprika fumé","1/2 c.à.c cumin","2 c.à.s farine (blé ou pois chiche)","Sel, poivre","Huile d''olive"]'::jsonb,
      '["Écrasez les haricots blancs à la fourchette (texture rustique).","Ajoutez oignon finement haché, ail, herbes, épices, flocons d''avoine et farine. Salez/poivrez.","Formez 4 galettes bien tassées. Si c''est trop humide, ajoutez 1 c.à.s de farine.","Faites dorer à la poêle dans un filet d''huile 4 minutes de chaque côté.","Servez en burger, avec une salade, ou avec du houmous et des crudités."]'::jsonb
    );
  end if;

  if not exists (select 1 from public.recipes where title = 'Pâtes Complètes Sauce Lentilles Corail') then
    insert into public.recipes (
      id, title, category, time, calories, protein, carbs, fat, servings, difficulty,
      tags, objective, regime, season, main_ingredient, image, ingredients, steps
    )
    overriding system value
    values (
      24,
      'Pâtes Complètes Sauce Lentilles Corail',
      'diner',
      25, 560, 26, 86, 12,
      3,
      'Facile',
      '["#PostEntraînement","#Budget","#RicheEnProtéines"]'::jsonb,
      '["endurance","masse","sante"]'::jsonb,
      '["vegetarien","vegetalien"]'::jsonb,
      '["automne","hiver","printemps","ete"]'::jsonb,
      'Lentilles corail',
      'https://images.unsplash.com/photo-1521389508051-d7ffb5dc8b8a?w=600&h=400&fit=crop',
      '["240g pâtes complètes","180g lentilles corail","400g coulis de tomate","1 oignon","1 carotte","2 gousses d''ail","1 c.à.s huile d''olive","1 c.à.c herbes de Provence","Sel, poivre","Graines de tournesol ou levure maltée (option)"]'::jsonb,
      '["Faites revenir l''oignon, l''ail et la carotte en petits dés dans l''huile 4 minutes.","Ajoutez les lentilles corail rincées, le coulis de tomate et les herbes.","Ajoutez 300ml d''eau, laissez mijoter 12-15 minutes (les lentilles doivent fondre).","Faites cuire les pâtes, égouttez et mélangez avec la sauce.","Servez avec un topping de graines ou de levure maltée pour un côté “parmesan”."]'::jsonb
    );
  end if;

  -- Article
  if not exists (select 1 from public.blog_articles where title = 'Recettes végétariennes riches en protéines pour booster tes séances') then
    insert into public.blog_articles (
      id, title, excerpt, meta_title, meta_description,
      category, date, read_time, image, author, content, content_json
    )
    overriding system value
    values (
      7,
      'Recettes végétariennes riches en protéines pour booster tes séances',
      'Des recettes végétariennes riches en protéines, simples et rassasiantes, pour soutenir tes entraînements sans viande ni prise de tête.',
      'Recettes végétariennes riches en protéines pour sportifs | Et si mamie était végé ?',
      'Des recettes végétariennes riches en protéines, simples et rassasiantes, pour soutenir tes entraînements sans viande ni prise de tête.',
      'Nutrition',
      '2026-03-11'::date,
      9,
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop',
      'Maxence',
      '',
      jsonb_build_array(
        jsonb_build_object('type','paragraph','text','Quand on fait du sport et qu’on mange végétarien, la grande question revient toujours : « Est-ce que je mange assez de protéines ? ». L’idée ici, c’est de te montrer qu’on peut très bien nourrir ses muscles sans viande, avec des recettes simples, familiales et efficaces.'),
        jsonb_build_object('type','heading','level',2,'text','Les besoins en protéines quand on est sportif végétarien'),
        jsonb_build_object('type','paragraph','text','Pour un sportif, la plupart des recommandations tournent autour de 1,2 à 2 g de protéines par kilo de poids de corps et par jour selon le type de sport et l’intensité de l’entraînement. Dans les faits, ça couvre la performance et la récupération musculaire.'),
        jsonb_build_object('type','paragraph','text','Concrètement, si tu pèses 70 kg et que tu t’entraînes régulièrement, viser entre 90 et 120 g de protéines par jour est souvent un bon ordre de grandeur à adapter à ton cas. L’intérêt des sources végétales, c’est qu’elles apportent aussi des fibres, des glucides complexes et des micronutriments utiles au quotidien.'),
        jsonb_build_object('type','heading','level',2,'text','Les meilleures sources de protéines végétales pour le sport'),
        jsonb_build_object('type','paragraph','text','Avant de parler recettes, quelques bases sur les aliments à mettre souvent dans l’assiette.'),
        jsonb_build_object('type','list','items',jsonb_build_array(
          'Légumineuses : lentilles, pois chiches, haricots rouges, pois cassés, soja. Parfaites pour ragoûts, dhal, houmous, salades complètes.',
          'Produits à base de soja : tofu, tempeh, protéines de soja texturées. Riches en protéines et faciles à intégrer dans des plats “façon viande”.',
          'Céréales complètes : quinoa, avoine, pâtes complètes, riz complet. Elles complètent bien les légumineuses (meilleur profil d’acides aminés).',
          'Oléagineux et graines : amandes, noix, graines de courge, de chanvre ou de tournesol. Pratiques en snack ou pour enrichir un plat.'
        )),
        jsonb_build_object('type','paragraph','text','L’idée est de combiner plusieurs de ces sources dans la journée plutôt que de chercher une seule “star” protéinée. Une alimentation végétale bien planifiée peut couvrir les besoins et soutenir la performance.'),
        jsonb_build_object('type','heading','level',2,'text','7 idées de repas végétariens protéinés après le sport'),
        jsonb_build_object('type','paragraph','text','Ces idées sont pensées pour être réalistes en France (ingrédients trouvables en supermarché), rassasiantes et adaptées à la récupération.'),
        jsonb_build_object('type','heading','level',3,'text','1) Bowl lentilles, quinoa et tofu mariné'),
        jsonb_build_object('type','paragraph','text','Un plat complet : protéines, glucides complexes, fibres et bonnes graisses. Idéal après une séance de musculation ou de cardio.'),
        jsonb_build_object('type','recipes','recipeIds',jsonb_build_array(21)),
        jsonb_build_object('type','heading','level',3,'text','2) Chili sin carne aux haricots rouges et maïs'),
        jsonb_build_object('type','paragraph','text','Les haricots rouges apportent une bonne dose de protéines, et le riz ou le quinoa aide à recharger le glycogène après l’effort.'),
        jsonb_build_object('type','recipes','recipeIds',jsonb_build_array(13)),
        jsonb_build_object('type','heading','level',3,'text','3) Curry de pois chiches au lait de coco léger'),
        jsonb_build_object('type','paragraph','text','Les pois chiches sont très appréciés dans les menus de sportifs végétariens : ils apportent à la fois protéines et glucides.'),
        jsonb_build_object('type','recipes','recipeIds',jsonb_build_array(22)),
        jsonb_build_object('type','heading','level',3,'text','4) Galettes de haricots blancs et flocons d’avoine'),
        jsonb_build_object('type','paragraph','text','Une alternative “façon steak” qui fonctionne en burger, ou en assiette avec des légumes rôtis et une sauce rapide.'),
        jsonb_build_object('type','recipes','recipeIds',jsonb_build_array(23,12)),
        jsonb_build_object('type','heading','level',3,'text','5) Pâtes complètes aux lentilles corail et légumes'),
        jsonb_build_object('type','paragraph','text','Les lentilles corail cuisent vite : parfait pour une soirée post-entraînement quand tu veux un plat réconfortant.'),
        jsonb_build_object('type','recipes','recipeIds',jsonb_build_array(24)),
        jsonb_build_object('type','heading','level',3,'text','6) Wraps tofu croustillant, houmous et crudités'),
        jsonb_build_object('type','paragraph','text','Un repas rapide (ou à emporter) : ajoute une poignée de graines pour booster légèrement les protéines.'),
        jsonb_build_object('type','recipes','recipeIds',jsonb_build_array(5)),
        jsonb_build_object('type','heading','level',3,'text','7) Bol petit-déjeuner protéiné (idéal après séance matinale)'),
        jsonb_build_object('type','paragraph','text','Combine flocons d’avoine + boisson végétale + yaourt/protéines + fruits + purée d’oléagineux : simple, efficace, et top pour récupérer.'),
        jsonb_build_object('type','recipes','recipeIds',jsonb_build_array(1)),
        jsonb_build_object('type','cta_planning'),
        jsonb_build_object('type','heading','level',2,'text','Exemple de journée végétarienne sportive riche en protéines'),
        jsonb_build_object('type','list','items',jsonb_build_array(
          'Petit-déjeuner : bol avoine + boisson végétale + fruits + poignée d’oléagineux.',
          'Déjeuner : bowl lentilles/quinoa/tofu + légumes + graines.',
          'Collation : fruit + poignée d’amandes ou barre maison à base de flocons et de noix.',
          'Dîner : chili sin carne ou curry de pois chiches + riz complet + salade verte.'
        )),
        jsonb_build_object('type','paragraph','text','En combinant ces types de repas, tu peux atteindre les apports recommandés tout en gardant une alimentation végétarienne simple et “sans prise de tête”.'),
        jsonb_build_object('type','heading','level',2,'text','Faut-il des protéines en poudre quand on est sportif végétarien ?'),
        jsonb_build_object('type','paragraph','text','Les protéines en poudre (pois, riz, chanvre…) peuvent être un coup de pouce pratique quand tu as un gros volume d’entraînement ou peu de temps pour cuisiner. Mais la base doit rester une alimentation variée : les compléments viennent seulement en support si tu as du mal à couvrir tes besoins.'),
        jsonb_build_object('type','paragraph','text','Si tu places déjà des légumineuses, des céréales complètes, du soja et des oléagineux dans ta journée, tu peux très bien t’en passer. Si tu es souvent “juste”, un shaker après l’entraînement peut simplement t’aider à atteindre ton quota plus facilement.')
      )
    );
  end if;
end $$;

