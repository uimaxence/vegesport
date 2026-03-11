-- Ajout de l'article "Combien de protéines par jour quand on est sportif végétarien ?"
-- S'assure que les colonnes SEO/blocs existent (au cas où la migration 20260311000000 n'a pas été exécutée)
alter table public.blog_articles
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists content_json jsonb;

do $$
begin
  if not exists (
    select 1 from public.blog_articles
    where title = 'Combien de protéines par jour quand on est sportif végétarien ?'
  ) then
    insert into public.blog_articles (
      id, title, excerpt, meta_title, meta_description,
      category, date, read_time, image, author, content, content_json
    )
    overriding system value
    values (
      8,
      'Combien de protéines par jour quand on est sportif végétarien ?',
      'Des repères clairs pour savoir combien de protéines viser en tant que sportif végétarien, avec des exemples chiffrés et une journée type.',
      'Combien de protéines par jour pour un sportif végétarien ? | Et si mamie était végé ?',
      'Découvre combien de protéines viser quand tu es sportif végétarien, avec des repères simples et des exemples concrets pour ta journée.',
      'Nutrition',
      '2026-03-11'::date,
      10,
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop',
      'Maxence',
      '',
      jsonb_build_array(
        jsonb_build_object('type','heading','level',1,'text','Combien de protéines par jour quand on est sportif végétarien ?'),
        jsonb_build_object('type','paragraph','text','Quand on fait du sport et qu’on mange végétarien, la question des protéines revient en boucle. On entend tout et son contraire, entre « tu n’en auras jamais assez » et « tu n’as pas besoin de plus que les autres ». L’idée de cet article, c’est de poser des repères clairs, basés sur les recommandations utilisées en France et en Europe, puis de les traduire en assiettes concrètes.'),
        jsonb_build_object('type','heading','level',2,'text','Les repères de base : combien viser par kilo de poids de corps ?'),
        jsonb_build_object('type','paragraph','text','Pour la population générale, on tourne autour de 0,8 g de protéines par kilo de poids de corps et par jour. Chez le sportif, les besoins montent, parce que l’organisme a plus de travail de réparation musculaire et d’adaptation à l’entraînement.'),
        jsonb_build_object('type','paragraph','text','Les rapports et synthèses utilisés en France pour les sportifs d’endurance situent souvent les besoins entre environ 1,2 et 1,6 g de protéines par kilo de poids de corps et par jour, en fonction du volume et de l’intensité de l’entraînement. Pour les sports de force ou la musculation, on se rapproche fréquemment de plages allant approximativement de 1,6 à 2 g/kg/j pour optimiser la prise de masse musculaire et la récupération.'),
        jsonb_build_object('type','paragraph','text','Dit autrement :'),
        jsonb_build_object('type','list','items',jsonb_build_array(
          'Sportif d’endurance « classique » (course à pied, vélo, etc.) : souvent autour de 1,2–1,6 g/kg/j.',
          'Sportif de force / musculation : souvent autour de 1,6–2 g/kg/j.'
        )),
        jsonb_build_object('type','paragraph','text','Ces ordres de grandeur servent de base de travail à adapter à ton profil, ton volume d’entraînement, ton historique alimentaire et ton objectif (perte de poids, maintien, prise de masse).'),
        jsonb_build_object('type','heading','level',2,'text','Exemples chiffrés : 55 kg, 65 kg, 75 kg'),
        jsonb_build_object('type','paragraph','text','Pour rendre ça concret, voilà quelques exemples d’objectifs journaliers, simplement pour te donner une idée d’échelle (on prend un ordre de grandeur « intermédiaire » dans les plages ci‑dessus) :'),
        jsonb_build_object('type','list','items',jsonb_build_array(
          'Sportif/ve 55 kg, plutôt endurance : autour de 70–85 g de protéines par jour.',
          'Sportif/ve 65 kg, mix endurance / renfo : autour de 80–100 g par jour.',
          'Sportif/ve 75 kg, plutôt force/muscu : autour de 110–130 g par jour.'
        )),
        jsonb_build_object('type','paragraph','text','Ce ne sont pas des chiffres « magiques », mais des fourchettes réalistes pour la plupart des pratiquants réguliers. L’idée n’est pas de peser ton assiette au gramme près, mais de savoir si tu es complètement à côté de la plaque… ou globalement dans les clous.'),
        jsonb_build_object('type','heading','level',2,'text','Sportif végétarien : faut-il viser plus de protéines ?'),
        jsonb_build_object('type','paragraph','text','Quand on parle de protéines végétales, deux sujets reviennent souvent : le profil en acides aminés (certains aliments végétaux sont un peu moins « complets » pris isolément) et la digestibilité (une partie des protéines peut être un peu moins bien absorbée que celles d’origine animale).'),
        jsonb_build_object('type','paragraph','text','C’est pour ça que certains experts conseillent aux sportifs végétariens de viser plutôt le haut de la fourchette de recommandations, ou d’augmenter légèrement la quantité totale de protéines par rapport à un omnivore, tout en misant sur la variété des sources.'),
        jsonb_build_object('type','paragraph','text','En pratique, ça donne quelque chose comme :'),
        jsonb_build_object('type','list','items',jsonb_build_array(
          'Si la reco pour ton sport est autour de 1,2–1,6 g/kg/j, en mode végé tu peux viser plutôt la zone 1,4–1,8 g/kg/j.',
          'Si tu es en musculation et que tu vises 1,6–2 g/kg/j, rester proche de 1,8–2 g/kg/j peut être intéressant.'
        )),
        jsonb_build_object('type','paragraph','text','Ce qui compte autant que la quantité, c’est la variété : associer légumineuses, céréales, soja, oléagineux sur la journée permet d’avoir un profil d’acides aminés très correct.'),
        jsonb_build_object('type','heading','level',2,'text','Comment atteindre ces apports en mode végé ?'),
        jsonb_build_object('type','paragraph','text','Passer de « g de protéines » à « vraie assiette » change tout. Quelques ordres d’idée approximatifs pour te repérer (les chiffres varient selon les marques et recettes, mais ça donne une échelle) :'),
        jsonb_build_object('type','list','items',jsonb_build_array(
          '100 g de lentilles cuites : autour d’une bonne dizaine de grammes de protéines.',
          '100 g de pois chiches ou de haricots rouges cuits : ordre de grandeur proche.',
          '100 g de tofu : souvent autour de 12–15 g de protéines (voire plus selon les produits).',
          '2 cuillères à soupe de graines (courge, chanvre, etc.) : quelques grammes de protéines.',
          '30 g d’oléagineux (amandes, noix, etc.) : une poignée de grammes de plus.',
          '60–70 g de flocons d’avoine : là aussi, plusieurs grammes de protéines.'
        )),
        jsonb_build_object('type','paragraph','text','En combinant 2 ou 3 de ces sources à chaque repas et collation, on arrive assez vite aux 70–100–120 g de protéines selon ton poids et ton sport, sans forcément sortir la poudre à chaque repas.'),
        jsonb_build_object('type','heading','level',2,'text','Exemple de journée type à environ 90–100 g de protéines'),
        jsonb_build_object('type','paragraph','text','Imaginons une personne d’environ 65–70 kg, avec un entraînement régulier, qui vise autour de 90–100 g de protéines. Voici une journée type (les chiffres sont indicatifs et arrondis, l’idée est de te donner un ordre de grandeur) :'),
        jsonb_build_object('type','list','items',jsonb_build_array(
          'Petit-déjeuner : flocons d’avoine (60–70 g) + boisson végétale enrichie en protéines, 1 yaourt végétal (protéiné si possible), 1 poignée de noix ou d’amandes.',
          'Déjeuner : bol lentilles + quinoa + tofu mariné, légumes (crus ou cuits), 1 cuillère à soupe de graines de courge ou de chanvre.',
          'Collation : 1 fruit + 1 petite poignée d’amandes ou une tartine de pain complet avec purée de cacahuète.',
          'Dîner : chili sin carne (haricots rouges + maïs + tomate) avec riz complet, salade verte ou légumes rôtis.'
        )),
        jsonb_build_object('type','paragraph','text','Avec ce type de structure, tu dépasses facilement les 80–90 g de protéines, sans te forcer à avaler des plats énormes. En ajustant les portions (plus de lentilles, un peu plus de tofu, etc.), tu peux monter ou descendre le total.'),
        jsonb_build_object('type','heading','level',2,'text','Faut-il absolument des protéines en poudre ?'),
        jsonb_build_object('type','paragraph','text','Non, tu n’es pas obligé d’en prendre. Les protéines en poudre sont surtout une question de praticité : utiles si tu as un gros volume d’entraînement et peu de temps pour cuisiner, ou si tu as du mal à atteindre tes besoins en mangeant normalement.'),
        jsonb_build_object('type','paragraph','text','Si ta journée ressemble à celle qu’on vient de décrire, avec des légumineuses, des céréales complètes, du soja, des graines, des oléagineux et quelques produits enrichis, tu peux très bien couvrir tes besoins sans shaker. Si tu es souvent en déplacement, que tu sautes des repas ou que tu n’aimes pas trop les grosses portions, un petit shaker après la séance peut par contre être une solution simple pour ajouter 20–25 g de protéines sans te bourrer et améliorer la répartition des apports sur la journée.'),
        jsonb_build_object('type','heading','level',2,'text','Comment adapter ces repères à ton cas ?'),
        jsonb_build_object('type','paragraph','text','Quelques questions à te poser pour ajuster :'),
        jsonb_build_object('type','list','items',jsonb_build_array(
          'Tu fais quoi comme sport, et combien de fois par semaine ?',
          'Tu cherches surtout la performance, la prise de muscle, la perte de poids, ou juste la forme ?',
          'Tu te sens souvent fatigué(e), courbaturé(e) longtemps, ou plutôt en forme ?'
        )),
        jsonb_build_object('type','paragraph','text','Si tu es débutant, rester au milieu de la fourchette (par exemple 1,4–1,6 g/kg/j) est souvent largement suffisant. Si tu as déjà un bon niveau, beaucoup de volume d’entraînement, et que tu vises la performance ou la prise de masse, tu peux te rapprocher du haut des fourchettes, en faisant attention à la qualité globale de ton alimentation, à ton sommeil et à ta récupération.'),
        jsonb_build_object('type','paragraph','text','Dans tous les cas, ce sont des repères, pas des ordonnances. Si tu as des pathologies spécifiques, un historique médical particulier ou des objectifs très ambitieux, l’idéal reste de faire le point avec un professionnel de santé ou un diététicien du sport.')
      )
    );
  end if;
end $$;

