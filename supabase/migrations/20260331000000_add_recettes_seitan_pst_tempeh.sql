-- Recettes 61–63 : seitan, PST, tempeh (+ colonne notes)
alter table public.recipes add column if not exists notes text;

do $$
begin

  if not exists (select 1 from public.recipes where id = 61) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps, notes)
    overriding system value
    values (61, 'Seitan poêlé façon steak, riz complet et légumes', 'dejeuner', 25, 480, 38, 52, 12, 2, 'Facile',
      $r61tags$["#PostEntraînement","#RicheEnProtéines","#PréparationRepas"]$r61tags$::jsonb,
      $r61obj$["masse","endurance","sante"]$r61obj$::jsonb,
      $r61reg$["vegetarien","vegetalien"]$r61reg$::jsonb,
      $r61sea$["printemps","ete","automne","hiver"]$r61sea$::jsonb,
      'Seitan',
      null,
      $r61ing$["300g seitan (nature ou acheté en magasin bio)","160g riz complet","2 carottes","200g haricots verts (frais ou surgelés)","2 c.à.s sauce soja","1 c.à.s huile d'olive","1 c.à.c paprika fumé","1/2 c.à.c ail en poudre","Sel, poivre","Persil ou ciboulette pour servir"]$r61ing$::jsonb,
      $r61stp$["Fais cuire le riz complet selon les instructions du paquet (environ 25 min à l'eau bouillante salée).","Coupe le seitan en tranches épaisses (1 cm). Dans un bol, mélange sauce soja, paprika fumé et ail en poudre. Badigeonne les tranches de cette marinade.","Fais cuire les carottes (en bâtonnets) et les haricots verts à la vapeur ou à l'eau 6-8 min. Ils doivent rester légèrement croquants.","Chauffe l'huile dans une poêle à feu moyen-vif. Fais dorer le seitan 3-4 min de chaque côté jusqu'à ce qu'une croûte dorée se forme.","Sers le seitan avec le riz et les légumes, arrosé du jus de cuisson de la poêle. Parsème de persil ou ciboulette."]$r61stp$::jsonb,
      'Le seitan s''achète en magasin bio (marques Soy, Lima, Wheaty) ou en épicerie spécialisée. Il contient du gluten et n''est pas adapté aux intolérants. Pour encore plus de goût, laisse mariner les tranches 15 min avant cuisson. Se conserve 3 jours au frigo, idéal pour le meal prep.');
  end if;

  if not exists (select 1 from public.recipes where id = 62) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps, notes)
    overriding system value
    values (62, 'Pâtes bolognaise aux protéines de soja texturées (PST)', 'diner', 35, 520, 32, 72, 10, 4, 'Facile',
      $r62tags$["#Budget","#PréparationRepas","#PostEntraînement"]$r62tags$::jsonb,
      $r62obj$["masse","endurance","sante"]$r62obj$::jsonb,
      $r62reg$["vegetarien","vegetalien","sans-gluten"]$r62reg$::jsonb,
      $r62sea$["printemps","ete","automne","hiver"]$r62sea$::jsonb,
      'Protéines de soja texturées (PST)',
      null,
      $r62ing$["100g PST (protéines de soja texturées, petits morceaux)","300ml eau bouillante pour réhydrater","2 c.à.s sauce soja (tamari pour version sans gluten)","320g spaghettis complets (ou pâtes sans gluten)","400g tomates concassées en boîte","200g coulis de tomate","1 oignon","2 gousses d'ail","2 carottes","1 branche de céleri (optionnel)","1 c.à.s huile d'olive","1 c.à.c origan séché","1 c.à.c paprika fumé","Sel, poivre","Basilic frais ou levure maltée pour servir"]$r62ing$::jsonb,
      $r62stp$["Réhydrate les PST : verse l'eau bouillante et la sauce soja sur les PST dans un bol, couvre et laisse gonfler 15 min. Les PST triplent de volume. Égoutter ensuite.","Émince finement l'oignon, l'ail, les carottes et le céleri. Fais-les revenir dans l'huile d'olive à feu moyen 5-7 min jusqu'à ce qu'ils soient tendres.","Ajoute les PST égouttées dans la poêle avec l'origan et le paprika. Fais revenir 3-4 min en remuant pour les faire légèrement dorer.","Verse les tomates concassées et le coulis. Ajoute 100ml d'eau. Laisse mijoter à feu doux 15-20 min à couvert, puis 5 min sans couvercle pour épaissir.","Fais cuire les pâtes selon les instructions. Sers la sauce sur les pâtes, parsème de basilic frais ou de levure maltée."]$r62stp$::jsonb,
      'Les PST se trouvent en vrac en magasin bio (Biocoop, La Vie Claire) ou en ligne. Elles se conservent plusieurs mois dans un placard, comme des pâtes sèches. La sauce se congèle très bien : prépares-en le double et congèle la moitié en portions. Variante : utilise cette sauce pour des lasagnes végétariennes ou pour farcir des conchiglies.');
  end if;

  if not exists (select 1 from public.recipes where id = 63) then
    insert into public.recipes (id, title, category, time, calories, protein, carbs, fat, servings, difficulty, tags, objective, regime, season, main_ingredient, image, ingredients, steps, notes)
    overriding system value
    values (63, 'Bowl tempeh mariné soja-érable, riz complet et légumes verts', 'diner', 30, 540, 30, 62, 18, 2, 'Facile',
      $r63tags$["#PostEntraînement","#RicheEnProtéines","#PréparationRepas"]$r63tags$::jsonb,
      $r63obj$["masse","endurance","sante"]$r63obj$::jsonb,
      $r63reg$["vegetarien","vegetalien","sans-gluten"]$r63reg$::jsonb,
      $r63sea$["printemps","ete","automne","hiver"]$r63sea$::jsonb,
      'Tempeh',
      null,
      $r63ing$["200g tempeh","160g riz complet","200g brocoli (frais ou surgelé)","100g épinards frais","2 c.à.s sauce soja (ou tamari)","1 c.à.s sirop d'érable","1 c.à.s huile de sésame","1 c.à.c vinaigre de riz","1 gousse d'ail râpée","1 c.à.c gingembre frais râpé (ou 1/2 c.à.c gingembre en poudre)","Graines de sésame pour servir","Oignons verts ou coriandre (optionnel)"]$r63ing$::jsonb,
      $r63stp$["Prépare la marinade : mélange sauce soja, sirop d'érable, huile de sésame, vinaigre de riz, ail et gingembre dans un bol.","Coupe le tempeh en tranches ou en cubes. Plonge-le dans la marinade et laisse reposer au moins 20 min (ou toute la nuit au frigo pour plus de goût).","Fais cuire le riz complet à l'eau bouillante salée selon les instructions du paquet.","Fais cuire le brocoli à la vapeur 5-6 min. Ajoute les épinards en fin de cuisson 1-2 min pour les faire juste tomber.","Chauffe une poêle à feu moyen-vif. Fais dorer le tempeh avec sa marinade 4-5 min de chaque côté jusqu'à caramélisation. Verse le reste de marinade en fin de cuisson pour enrober.","Dresse les bols : riz complet, légumes verts, tranches de tempeh. Parsème de graines de sésame et d'oignons verts."]$r63stp$::jsonb,
      'Le tempeh se trouve au rayon frais des magasins bio (marques Soy, Lima). Plus facile à digérer que le tofu grâce à sa fermentation. Pour une version encore plus savoureuse, fais quelques entailles superficielles dans le tempeh avant de le mariner : les arômes pénètrent mieux. Se conserve 3-4 jours au frigo. Ajoute un filet de jus de citron sur les légumes en fin de cuisson pour favoriser l''absorption du fer.');
  end if;

end $$;
