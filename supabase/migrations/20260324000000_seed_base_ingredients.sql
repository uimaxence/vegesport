-- Migration : ingrédients de base pour l'autocomplétion
-- À exécuter après la création de public.ingredients

insert into public.ingredients (name, rayon)
values
  -- Fruits et légumes
  ('Banane', 'Fruits et légumes'),
  ('Fruits rouges mélangés', 'Fruits et légumes'),
  ('Mangue', 'Fruits et légumes'),
  ('Fruit de la passion', 'Fruits et légumes'),
  ('Épinards frais', 'Fruits et légumes'),
  ('Épinards surgelés', 'Fruits et légumes'),
  ('Carotte', 'Fruits et légumes'),
  ('Courgette', 'Fruits et légumes'),
  ('Chou rouge', 'Fruits et légumes'),
  ('Oignon', 'Fruits et légumes'),
  ('Oignon rouge', 'Fruits et légumes'),
  ('Ail', 'Fruits et légumes'),
  ('Brocoli', 'Fruits et légumes'),
  ('Concombre', 'Fruits et légumes'),
  ('Tomate', 'Fruits et légumes'),
  ('Tomates cerises', 'Fruits et légumes'),
  ('Pommes de terre', 'Fruits et légumes'),
  ('Salade verte', 'Fruits et légumes'),
  ('Laitue', 'Fruits et légumes'),
  ('Citron', 'Fruits et légumes'),
  ('Citron vert', 'Fruits et légumes'),

  -- Épicerie / céréales / légumineuses
  ('Flocons d''avoine', 'Pâtes riz et céréales'),
  ('Quinoa', 'Pâtes riz et céréales'),
  ('Riz complet', 'Pâtes riz et céréales'),
  ('Riz basmati', 'Pâtes riz et céréales'),
  ('Pâtes complètes', 'Pâtes riz et céréales'),
  ('Lentilles vertes', 'Épicerie'),
  ('Pois chiches', 'Épicerie'),
  ('Haricots rouges', 'Épicerie'),
  ('Haricots blancs', 'Épicerie'),
  ('Haricots noirs', 'Épicerie'),
  ('Maïs en conserve', 'Épicerie'),
  ('Dattes dénoyautées', 'Épicerie'),
  ('Farine de sarrasin', 'Épicerie'),
  ('Farine de pois chiche', 'Épicerie'),
  ('Tortillas complètes', 'Épicerie'),
  ('Wraps complets', 'Épicerie'),

  -- Protéines végétales / frais
  ('Tofu ferme', 'Frais et protéines végétales'),
  ('Tofu soyeux', 'Frais et protéines végétales'),
  ('Tempeh', 'Frais et protéines végétales'),
  ('Yaourt végétal', 'Frais et protéines végétales'),
  ('Houmous', 'Frais et protéines végétales'),

  -- Boissons / laits végétaux
  ('Lait d''amande', 'Boissons'),
  ('Boisson végétale soja', 'Boissons'),
  ('Boisson végétale', 'Boissons'),
  ('Lait de coco', 'Boissons'),

  -- Huiles / matières grasses / graines / oléagineux
  ('Huile d''olive', 'Graines et oléagineux'),
  ('Huile de sésame', 'Graines et oléagineux'),
  ('Purée de cacahuète', 'Graines et oléagineux'),
  ('Beurre de cacahuète', 'Graines et oléagineux'),
  ('Beurre d''amande', 'Graines et oléagineux'),
  ('Graines de chia', 'Graines et oléagineux'),
  ('Graines de sésame', 'Graines et oléagineux'),
  ('Graines de chanvre', 'Graines et oléagineux'),
  ('Amandes effilées', 'Graines et oléagineux'),
  ('Pignons de pin', 'Graines et oléagineux'),

  -- Condiments / épices / sauces
  ('Sauce soja', 'Condiments et épices'),
  ('Sauce tahini', 'Condiments et épices'),
  ('Pesto au basilic', 'Condiments et épices'),
  ('Paprika fumé', 'Condiments et épices'),
  ('Curry (mélange)', 'Condiments et épices'),
  ('Pâte de curry', 'Condiments et épices'),
  ('Cumin', 'Condiments et épices'),
  ('Cannelle', 'Condiments et épices'),
  ('Origan', 'Condiments et épices'),
  ('Persil frais', 'Condiments et épices'),
  ('Coriandre fraîche', 'Condiments et épices'),
  ('Muscade', 'Condiments et épices'),
  ('Sel', 'Condiments et épices'),
  ('Poivre', 'Condiments et épices'),

  -- Divers
  ('Protéine de pois', 'Épicerie'),
  ('Protéine de pois vanille', 'Épicerie'),
  ('Açaï (pulpe surgelée)', 'Surgelés'),
  ('Granola', 'Épicerie'),
  ('Olives Kalamata', 'Épicerie')
on conflict (name) do nothing;

