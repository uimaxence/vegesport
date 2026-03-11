-- Article : Régime végétarien et performance sportive : que dit la science ?
alter table public.blog_articles
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists content_json jsonb;

do $$
begin
  if not exists (select 1 from public.blog_articles where title = 'Régime végétarien et performance sportive : que dit la science ?') then
    insert into public.blog_articles (id, title, excerpt, meta_title, meta_description, category, date, read_time, image, author, content, content_json)
    overriding system value
    values (
      11,
      'Régime végétarien et performance sportive : que dit la science ?',
      'Régime végétarien et performance sportive : décryptage des études récentes. Avantages, limites et vraies infos pour booster tes séances en mode végé.',
      'Régime végétarien et performance sportive : que dit la science ? | Et si mamie était végé ?',
      'Régime végétarien et performance sportive : décryptage des études récentes. Avantages, limites et vraies infos pour booster tes séances en mode végé.',
      'Nutrition',
      '2026-03-14'::date,
      8,
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      'Maxence',
      '',
      '[
        {"type":"heading","level":1,"text":"Régime végétarien et performance sportive : que dit la science ?"},
        {"type":"paragraph","text":"Tu fais du sport et tu manges végétarien. Tu te demandes si ça impacte vraiment tes perfs, ta récup ou ton énergie. Bonne nouvelle : les études se multiplient, et les résultats sont globalement encourageants. Cet article décortique ce que disent les recherches récentes (surtout françaises et européennes), sans jargon inutile, pour que tu saches à quoi t''attendre."},
        {"type":"heading","level":2,"text":"Les bases : végétarien = déficit de perfs ? Pas du tout"},
        {"type":"paragraph","text":"Contrairement à certains mythes, un régime végétarien bien construit ne limite pas la performance sportive. Au contraire, plusieurs études montrent des résultats similaires – voire meilleurs – chez les athlètes végétariens comparés aux omnivores, surtout en endurance. Une étude récente européenne compare les performances d''athlètes végé et omnivores, et conclut à une équivalence, avec même des marqueurs inflammatoires plus bas chez les végétariens."},
        {"type":"paragraph","text":"En France, des synthèses sur l''alimentation durable et le sport confirment que les protéines végétales couvrent les besoins si on varie les sources (légumineuses, céréales, soja, graines). L''étude Magicfit 2026 sur la nutrition végétalienne va plus loin : pas de perte de force ou d''endurance, et une meilleure récupération chez certains."},
        {"type":"heading","level":2,"text":"Endurance : les végétariens excellent souvent"},
        {"type":"paragraph","text":"Pour les sports d''endurance (course, vélo, triathlon), les chiffres parlent :"},
        {"type":"list","items":["VO2 max (capacité à utiliser l''oxygène) : équivalente ou supérieure chez les végétariens. Une étude note une meilleure efficacité énergétique grâce à une alimentation riche en glucides végétaux.","Récupération : moins d''inflammation post-effort. Le régime végétarien réduit les marqueurs inflammatoires, ce qui aide à récupérer plus vite.","Exemple concret : des coureurs végétariens tiennent aussi bien les marathons que les omnivores, avec des apports en glucides naturels (fruits, céréales complètes) qui matchent parfaitement les besoins."]},
        {"type":"heading","level":2,"text":"Force et musculation : ça marche aussi"},
        {"type":"paragraph","text":"En musculation ou force : croissance musculaire sans différence significative si les protéines végétales sont suffisantes (1,6–2 g/kg/j). Les légumineuses + quinoa/tofu complètent les acides aminés essentiels. Force max : une étude européenne observe des athlètes végé qui progressent autant qu''un groupe omnivore sur plusieurs mois."},
        {"type":"paragraph","text":"Le truc ? Varier et viser un poil plus (10–20 % au-dessus des recos omnivores) pour compenser la digestibilité des protéines végé."},
        {"type":"heading","level":2,"text":"Avantages santé bonus pour les sportifs végé"},
        {"type":"list","items":["Santé cardiaque : moins de cholestérol LDL, meilleur profil lipidique. Utile pour les sports intenses qui stressent le cœur.","Inflammation et blessures : antioxydants végétaux (fruits, légumes) réduisent les risques. Des chercheurs français notent moins de courbatures chroniques.","Énergie durable : fibres et glucides complexes stabilisent la glycémie, parfait pour les longues séances."]},
        {"type":"paragraph","text":"À Paris ou en Île-de-France, où on trouve tout en supermarché (lentilles bio, tofu local, quinoa), c''est hyper accessible."},
        {"type":"heading","level":2,"text":"Limites et pièges à éviter (selon la science)"},
        {"type":"list","items":["Carences potentielles : B12, fer, oméga-3 (DHA). Les études insistent : surveille et complète si besoin (B12 obligatoire en végé strict).","Protéines : si tu manges monotone (trop de pain blanc sans légumineuses), tu risques le déficit. Vise variété sur la journée.","Débutants : adaptation de 2–4 semaines possible (moins d''énergie au départ si mal planifié)."]},
        {"type":"heading","level":2,"text":"Ce que disent les Français et Européens en chiffres"},
        {"type":"list","items":["Magicfit 2026 — Performance végan : Équivalence force/endurance + récup'' améliorée.","AFSSA rapport protéines — Besoins sportifs : 1,2–2 g/kg/j ok en végé avec variété.","Étude endurance végé — Récupération : Moins d''inflammation post-effort.","Comparaison athlètes — Force/perfs : Pas de différence vs omnivores.","Cerin alimentation durable — Équilibre global : Végé viable pour tous sports."]},
        {"type":"heading","level":2,"text":"En pratique pour ton quotidien"},
        {"type":"list","items":["Combine : lentilles + riz, pois chiches + quinoa.","Teste : suis ton énergie et tes perfs sur 1 mois.","Adapte : plus de glucides avant longue sortie, protéines après muscu (comme dans nos articles 1–4)."]},
        {"type":"paragraph","text":"La science est claire : végétarien = perfs au top si bien fait. Pas besoin de viande pour battre tes records personnels."},
        {"type":"cta_planning"}
      ]'::jsonb
    );
  end if;
end $$;
