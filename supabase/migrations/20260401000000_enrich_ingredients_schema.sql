-- ═══════════════════════════════════════════════════════════════════════════════
-- Enrichissement du schéma ingrédients : données nutritionnelles + structuration
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1) Table ingredients : ajout colonnes nutritionnelles et références externes
ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS name_plural text,
  ADD COLUMN IF NOT EXISTS unit_default varchar DEFAULT 'g',
  ADD COLUMN IF NOT EXISTS category varchar,
  ADD COLUMN IF NOT EXISTS calories_per_100 float,
  ADD COLUMN IF NOT EXISTS protein_per_100 float,
  ADD COLUMN IF NOT EXISTS carbs_per_100 float,
  ADD COLUMN IF NOT EXISTS fat_per_100 float,
  ADD COLUMN IF NOT EXISTS ciqual_id varchar,
  ADD COLUMN IF NOT EXISTS off_id varchar,
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

COMMENT ON COLUMN public.ingredients.category IS 'Famille alimentaire (légumineuses, céréales, légumes, fruits, oléagineux, protéines végétales, etc.)';
COMMENT ON COLUMN public.ingredients.unit_default IS 'Unité par défaut pour cet ingrédient (g, ml, pièce, c.à.s, c.à.c)';
COMMENT ON COLUMN public.ingredients.ciqual_id IS 'Identifiant Ciqual (ANSES) si trouvé';
COMMENT ON COLUMN public.ingredients.off_id IS 'Identifiant Open Food Facts si trouvé';
COMMENT ON COLUMN public.ingredients.is_verified IS 'true si les données nutritionnelles ont été vérifiées (Ciqual ou OFF)';

-- 2) Table recipe_ingredients : champs structurés (quantité, unité, préparation, ordre)
ALTER TABLE public.recipe_ingredients
  ADD COLUMN IF NOT EXISTS quantity float,
  ADD COLUMN IF NOT EXISTS unit varchar,
  ADD COLUMN IF NOT EXISTS preparation varchar,
  ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

COMMENT ON COLUMN public.recipe_ingredients.quantity IS 'Quantité numérique pour servings_base de la recette';
COMMENT ON COLUMN public.recipe_ingredients.unit IS 'Unité (g, ml, cl, L, kg, c.à.s, c.à.c, pièce, pincée, sachet, tranche)';
COMMENT ON COLUMN public.recipe_ingredients.preparation IS 'Mode de préparation optionnel (émincé, râpé, cuit, etc.)';
COMMENT ON COLUMN public.recipe_ingredients.display_order IS 'Ordre d''affichage dans la recette';

-- 3) Table recipes : flag macros calculées depuis les ingrédients
ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS macros_from_ingredients boolean DEFAULT false;

COMMENT ON COLUMN public.recipes.macros_from_ingredients IS 'true si les macros sont calculées depuis les données nutritionnelles des ingrédients';
