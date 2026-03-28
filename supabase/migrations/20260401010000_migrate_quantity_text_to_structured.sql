-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration des données : parse quantity_text → quantity + unit structurés
-- ═══════════════════════════════════════════════════════════════════════════════

-- Parse "80g" → qty=80, unit="g"
-- Parse "200ml" → qty=200, unit="ml"
-- Parse "1 c.à.s" → qty=1, unit="c.à.s"
-- Parse "2" → qty=2, unit="pièce"

UPDATE public.recipe_ingredients
SET
  quantity = CAST(
    replace(
      (regexp_match(quantity_text, '^(\d+(?:[.,]\d+)?)'))[1],
      ',', '.'
    ) AS float
  ),
  unit = COALESCE(
    (regexp_match(quantity_text, '^\d+(?:[.,]\d+)?\s*(g|kg|ml|cl|L)\M'))[1],
    CASE
      WHEN quantity_text ~* '^\d+(?:[.,]\d+)?\s+c\.à\.s' THEN 'c.à.s'
      WHEN quantity_text ~* '^\d+(?:[.,]\d+)?\s+c\.à\.c' THEN 'c.à.c'
      WHEN quantity_text ~* '^\d+(?:[.,]\d+)?\s+pincée' THEN 'pincée'
      WHEN quantity_text ~* '^\d+(?:[.,]\d+)?\s+sachet' THEN 'sachet'
      WHEN quantity_text ~* '^\d+(?:[.,]\d+)?\s+tranche' THEN 'tranche'
      WHEN quantity_text ~ '^\d+(?:[.,]\d+)?\s*$' THEN 'pièce'
      ELSE 'pièce'
    END
  )
WHERE quantity IS NULL
  AND quantity_text IS NOT NULL
  AND quantity_text != ''
  AND quantity_text ~ '^\d';

-- Remplir display_order selon l'ordre actuel des lignes par recette
WITH ordered AS (
  SELECT recipe_id, ingredient_id,
    ROW_NUMBER() OVER (PARTITION BY recipe_id ORDER BY ingredient_id) - 1 AS pos
  FROM public.recipe_ingredients
)
UPDATE public.recipe_ingredients ri
SET display_order = o.pos
FROM ordered o
WHERE ri.recipe_id = o.recipe_id
  AND ri.ingredient_id = o.ingredient_id
  AND ri.display_order = 0;
