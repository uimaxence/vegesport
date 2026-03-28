-- ============================================================================
-- Migration: Nettoyage complet des ingrédients
-- ============================================================================
-- Objectif : supprimer les doublons, fragments cassés, alternatives ("ou"),
--            qualificatifs dans les noms (fraîche, cuit, etc.) et corriger
--            les rayons erronés. Resync du JSONB legacy à la fin.
-- ============================================================================

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- PHASE 1 : Supprimer les fragments cassés de recipe_ingredients
-- ────────────────────────────────────────────────────────────────────────────
-- [132] "En dés)" est un fragment de "Potimarron (sans peau, en dés)" dans recette #34
-- [162] "Petits morceaux)" est un fragment de "PST (..., petits morceaux)" dans recette #62

-- Transférer la préparation sur l'ingrédient parent avant suppression
UPDATE recipe_ingredients SET preparation = 'sans peau, en dés'
WHERE recipe_id = 34 AND ingredient_id = 131 AND preparation IS NULL;

UPDATE recipe_ingredients SET preparation = 'petits morceaux'
WHERE recipe_id = 62 AND ingredient_id = 161 AND preparation IS NULL;

-- Supprimer les lignes fragments
DELETE FROM recipe_ingredients WHERE ingredient_id = 132;
DELETE FROM recipe_ingredients WHERE ingredient_id = 162;

-- Supprimer les ingrédients fragments
DELETE FROM ingredients WHERE id IN (132, 162);


-- ────────────────────────────────────────────────────────────────────────────
-- PHASE 2 : Fusionner les doublons (mise à jour FK recipe_ingredients)
-- ────────────────────────────────────────────────────────────────────────────
-- Syntaxe : UPDATE recipe_ingredients SET ingredient_id = <canonical>
--           WHERE ingredient_id = <doublon>;
--           DELETE FROM ingredients WHERE id = <doublon>;

-- [112] "D'épinards" → [5] "Épinards frais"
UPDATE recipe_ingredients SET ingredient_id = 5 WHERE ingredient_id = 112;
DELETE FROM ingredients WHERE id = 112;

-- [93] "Pulpe d'açaï surgelée" → [73] "Açaï (pulpe surgelée)"
UPDATE recipe_ingredients SET ingredient_id = 73, preparation = 'pulpe surgelée'
WHERE ingredient_id = 93 AND preparation IS NULL;
UPDATE recipe_ingredients SET ingredient_id = 73 WHERE ingredient_id = 93;
DELETE FROM ingredients WHERE id = 93;

-- [90] "Patates douces moyennes" → [127] "Patate douce"
UPDATE recipe_ingredients SET ingredient_id = 127 WHERE ingredient_id = 90;
DELETE FROM ingredients WHERE id = 90;

-- [129] "Patates douces" → [127] "Patate douce"
UPDATE recipe_ingredients SET ingredient_id = 127 WHERE ingredient_id = 129;
DELETE FROM ingredients WHERE id = 129;

-- [103] "Noix concassées" → [153] "Noix" (garder prep="concassées")
UPDATE recipe_ingredients SET ingredient_id = 153, preparation = 'concassées'
WHERE ingredient_id = 103 AND preparation IS NULL;
UPDATE recipe_ingredients SET ingredient_id = 153 WHERE ingredient_id = 103;
DELETE FROM ingredients WHERE id = 103;

-- [81] "Dattes Medjool dénoyautées" → [33] "Dattes dénoyautées"
UPDATE recipe_ingredients SET ingredient_id = 33, preparation = 'Medjool, dénoyautées'
WHERE ingredient_id = 81 AND preparation IS NULL;
UPDATE recipe_ingredients SET ingredient_id = 33 WHERE ingredient_id = 81;
DELETE FROM ingredients WHERE id = 81;

-- [136] "Maïs en boîte" → [32] "Maïs en conserve"
UPDATE recipe_ingredients SET ingredient_id = 32 WHERE ingredient_id = 136;
DELETE FROM ingredients WHERE id = 136;

-- [143] "Graines tournesol" → [107] "Graines de tournesol"
UPDATE recipe_ingredients SET ingredient_id = 107 WHERE ingredient_id = 143;
DELETE FROM ingredients WHERE id = 143;

-- [102] "Bouillon de légumes chaud" → [91] "Bouillon de légumes"
UPDATE recipe_ingredients SET ingredient_id = 91 WHERE ingredient_id = 102;
DELETE FROM ingredients WHERE id = 102;

-- [142] "Purée cacahuète" → [50] "Beurre de cacahuète"
UPDATE recipe_ingredients SET ingredient_id = 50 WHERE ingredient_id = 142;
DELETE FROM ingredients WHERE id = 142;

-- [141] "Salade feuilles" → [122] "Feuilles de salade"
UPDATE recipe_ingredients SET ingredient_id = 122 WHERE ingredient_id = 141;
DELETE FROM ingredients WHERE id = 141;

-- [144] "Graines chanvre (ou 20g poudre protéine végé)" → [54] "Graines de chanvre"
UPDATE recipe_ingredients SET ingredient_id = 54 WHERE ingredient_id = 144;
DELETE FROM ingredients WHERE id = 144;

-- [145] "Cacao brut" → [82] "Cacao en poudre"
UPDATE recipe_ingredients SET ingredient_id = 82 WHERE ingredient_id = 145;
DELETE FROM ingredients WHERE id = 145;

-- Herbes génériques → [66] "Persil frais" (sera renommé "Persil")
-- [114] "Herbes (persil ou ciboulette)"
UPDATE recipe_ingredients SET ingredient_id = 66 WHERE ingredient_id = 114;
DELETE FROM ingredients WHERE id = 114;

-- [115] "Persil ou ciboulette"
UPDATE recipe_ingredients SET ingredient_id = 66 WHERE ingredient_id = 115;
DELETE FROM ingredients WHERE id = 115;

-- [120] "Herbes (persil ou coriandre)"
UPDATE recipe_ingredients SET ingredient_id = 66 WHERE ingredient_id = 120;
DELETE FROM ingredients WHERE id = 120;

-- [140] "Herbes (persil ou thym)"
UPDATE recipe_ingredients SET ingredient_id = 66 WHERE ingredient_id = 140;
DELETE FROM ingredients WHERE id = 140;

-- [128] "Herbes"
UPDATE recipe_ingredients SET ingredient_id = 66 WHERE ingredient_id = 128;
DELETE FROM ingredients WHERE id = 128;

-- Alternatives "ou" → choisir un ingrédient existant
-- [133] "Curry ou curcuma" → [61] "Curry (mélange)"
UPDATE recipe_ingredients SET ingredient_id = 61 WHERE ingredient_id = 133;
DELETE FROM ingredients WHERE id = 133;

-- [118] "Graines de tournesol ou levure maltée" → [107] "Graines de tournesol"
UPDATE recipe_ingredients SET ingredient_id = 107 WHERE ingredient_id = 118;
DELETE FROM ingredients WHERE id = 118;

-- [137] "Raisins secs ou amandes" → [126] "Raisins secs"
UPDATE recipe_ingredients SET ingredient_id = 126 WHERE ingredient_id = 137;
DELETE FROM ingredients WHERE id = 137;

-- [135] "Gingembre (frais ou poudre)" → [108] "Gingembre frais"
UPDATE recipe_ingredients SET ingredient_id = 108 WHERE ingredient_id = 135;
DELETE FROM ingredients WHERE id = 135;

-- [167] "Gingembre frais râpé (ou 1/2 c.à.c gingembre en poudre)" → [108]
UPDATE recipe_ingredients SET ingredient_id = 108, preparation = 'râpé'
WHERE ingredient_id = 167 AND preparation IS NULL;
UPDATE recipe_ingredients SET ingredient_id = 108 WHERE ingredient_id = 167;
DELETE FROM ingredients WHERE id = 167;

-- [116] "Farine (blé ou pois chiche)" → [35] "Farine de pois chiche"
UPDATE recipe_ingredients SET ingredient_id = 35 WHERE ingredient_id = 116;
DELETE FROM ingredients WHERE id = 116;

-- [139] "Pâte curry (ou épices curry)" → [62] "Pâte de curry"
UPDATE recipe_ingredients SET ingredient_id = 62 WHERE ingredient_id = 139;
DELETE FROM ingredients WHERE id = 139;

-- [76] "Miel ou sirop d'érable" → [84] "Sirop d'érable"
UPDATE recipe_ingredients SET ingredient_id = 84 WHERE ingredient_id = 76;
DELETE FROM ingredients WHERE id = 76;

-- [36] "Tortillas complètes" → [151] "Tortillas de blé complètes"
UPDATE recipe_ingredients SET ingredient_id = 151 WHERE ingredient_id = 36;
DELETE FROM ingredients WHERE id = 36;


-- ────────────────────────────────────────────────────────────────────────────
-- PHASE 3 : Renommer les ingrédients (supprimer qualificatifs / parenthèses)
-- ────────────────────────────────────────────────────────────────────────────

UPDATE ingredients SET name = 'Épinards'           WHERE id = 5;
UPDATE ingredients SET name = 'Dattes'             WHERE id = 33;
UPDATE ingredients SET name = 'Amandes'            WHERE id = 55;
UPDATE ingredients SET name = 'Curry'              WHERE id = 61;
UPDATE ingredients SET name = 'Persil'             WHERE id = 66;
UPDATE ingredients SET name = 'Coriandre'          WHERE id = 67;
UPDATE ingredients SET name = 'Açaï'               WHERE id = 73;
UPDATE ingredients SET name = 'Edamame'            WHERE id = 77;
UPDATE ingredients SET name = 'Graines de lin'     WHERE id = 83;
UPDATE ingredients SET name = 'Œuf'                WHERE id = 87;
UPDATE ingredients SET name = 'Noix de coco'       WHERE id = 94;
UPDATE ingredients SET name = 'Champignons'        WHERE id = 100;
UPDATE ingredients SET name = 'Gingembre'          WHERE id = 108;
UPDATE ingredients SET name = 'Betterave'          WHERE id = 121;
UPDATE ingredients SET name = 'Potimarron'         WHERE id = 131;
UPDATE ingredients SET name = 'Feta'               WHERE id = 146;
UPDATE ingredients SET name = 'Riz'                WHERE id = 149;
UPDATE ingredients SET name = 'Fromage râpé'       WHERE id = 152;
UPDATE ingredients SET name = 'Boulgour'           WHERE id = 155;
UPDATE ingredients SET name = 'Menthe'             WHERE id = 156;
UPDATE ingredients SET name = 'Seitan'             WHERE id = 159;
UPDATE ingredients SET name = 'Haricots verts'     WHERE id = 160;
UPDATE ingredients SET name = 'Protéines de soja texturées' WHERE id = 161;
UPDATE ingredients SET name = 'Spaghettis complets'         WHERE id = 163;
UPDATE ingredients SET name = 'Céleri'             WHERE id = 164;
UPDATE ingredients SET name = 'Basilic'            WHERE id = 165;
UPDATE ingredients SET name = 'Farine de blé'      WHERE id = 130;
UPDATE ingredients SET name = 'Nouilles'           WHERE id = 157;
UPDATE ingredients SET name = 'Maïs'               WHERE id = 32;
UPDATE ingredients SET name = 'Salade'             WHERE id = 122;


-- ────────────────────────────────────────────────────────────────────────────
-- PHASE 4 : Mettre à jour les préparations (qualificatifs déplacés du nom)
-- ────────────────────────────────────────────────────────────────────────────
-- Seulement si la préparation est actuellement NULL

-- Amandes effilées → preparation = 'effilées'
UPDATE recipe_ingredients SET preparation = 'effilées'
WHERE ingredient_id = 55 AND preparation IS NULL;

-- Betterave cuite → preparation = 'cuite'
UPDATE recipe_ingredients SET preparation = 'cuite'
WHERE ingredient_id = 121 AND preparation IS NULL;

-- Graines de lin moulues → preparation = 'moulues'
UPDATE recipe_ingredients SET preparation = 'moulues'
WHERE ingredient_id = 83 AND preparation IS NULL;

-- Noix de coco râpée → preparation = 'râpée'
UPDATE recipe_ingredients SET preparation = 'râpée'
WHERE ingredient_id = 94 AND preparation IS NULL;

-- Dattes dénoyautées → preparation = 'dénoyautées'
UPDATE recipe_ingredients SET preparation = 'dénoyautées'
WHERE ingredient_id = 33 AND preparation IS NULL;

-- Edamame décortiqués → preparation = 'décortiqués'
UPDATE recipe_ingredients SET preparation = 'décortiqués'
WHERE ingredient_id = 77 AND preparation IS NULL;

-- Boulgour cuit → preparation = 'cuit'
UPDATE recipe_ingredients SET preparation = 'cuit'
WHERE ingredient_id = 155 AND preparation IS NULL;

-- Riz cuit → preparation = 'cuit'
UPDATE recipe_ingredients SET preparation = 'cuit'
WHERE ingredient_id = 149 AND preparation IS NULL;


-- ────────────────────────────────────────────────────────────────────────────
-- PHASE 5 : Corriger les rayons erronés
-- ────────────────────────────────────────────────────────────────────────────

UPDATE ingredients SET rayon = 'Boissons'                     WHERE id = 148 AND name = 'Eau';
UPDATE ingredients SET rayon = 'Pâtes riz et céréales'        WHERE id = 155; -- Boulgour
UPDATE ingredients SET rayon = 'Fruits et légumes'            WHERE id = 100; -- Champignons
UPDATE ingredients SET rayon = 'Boissons'                     WHERE id = 101; -- Vin blanc
UPDATE ingredients SET rayon = 'Épicerie'                     WHERE id = 158; -- Extrait de vanille
UPDATE ingredients SET rayon = 'Frais et protéines végétales' WHERE id = 87;  -- Œuf
UPDATE ingredients SET rayon = 'Frais et protéines végétales' WHERE id = 92;  -- Œufs
UPDATE ingredients SET rayon = 'Pâtes riz et céréales'        WHERE id = 134; -- Pain complet
UPDATE ingredients SET rayon = 'Épicerie'                     WHERE id = 91;  -- Bouillon de légumes
UPDATE ingredients SET rayon = 'Fruits et légumes'            WHERE id = 160; -- Haricots verts
UPDATE ingredients SET rayon = 'Condiments et épices'         WHERE id = 166; -- Vinaigre de riz


-- ────────────────────────────────────────────────────────────────────────────
-- PHASE 6 : Mettre à jour les étapes de recettes
-- ────────────────────────────────────────────────────────────────────────────
-- Recette #17 "Barres Énergétiques Maison" :
-- étape 1 mentionne "le miel" → on a changé l'ingrédient en "Sirop d'érable"
UPDATE recipes
SET steps = jsonb_set(
  steps,
  '{0}',
  to_jsonb('Mixez les dattes avec le beurre de cacahuète et le sirop d''érable (ou miel).'::text)
)
WHERE id = 17;


-- ────────────────────────────────────────────────────────────────────────────
-- PHASE 7 : Supprimer les ingrédients orphelins / non utilisés
-- ────────────────────────────────────────────────────────────────────────────

DELETE FROM ingredients WHERE id IN (
  6,   -- Épinards surgelés (doublon de Épinards)
  18,  -- Salade verte (non utilisé)
  21,  -- Citron vert (non utilisé)
  31,  -- Haricots noirs (non utilisé)
  49   -- Purée de cacahuète (non utilisé, doublon Beurre de cacahuète)
);


-- ────────────────────────────────────────────────────────────────────────────
-- PHASE 8 : Resync du JSONB legacy recipes.ingredients
-- ────────────────────────────────────────────────────────────────────────────
-- Fonction temporaire pour reconstruire le champ JSONB à partir de recipe_ingredients

CREATE OR REPLACE FUNCTION _tmp_rebuild_jsonb(p_rid bigint) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE recipes
  SET ingredients = (
    SELECT COALESCE(
      jsonb_agg(to_jsonb(
        TRIM(
          COALESCE(
            CASE WHEN ri.quantity IS NOT NULL THEN
              CASE WHEN ri.quantity = FLOOR(ri.quantity)
                   THEN (ri.quantity::int)::text
                   ELSE ri.quantity::text
              END
              || CASE
                   WHEN ri.unit IN ('g','kg','ml','cl','L') THEN ri.unit
                   WHEN ri.unit IS NOT NULL AND ri.unit != 'pièce' THEN ' ' || ri.unit
                   ELSE ''
                 END
            END, ''
          )
          || CASE WHEN ri.quantity IS NOT NULL THEN ' ' ELSE '' END
          || i.name
          || COALESCE(' ' || ri.preparation, '')
        )
      ) ORDER BY ri.display_order),
      '[]'::jsonb
    )
    FROM recipe_ingredients ri
    JOIN ingredients i ON i.id = ri.ingredient_id
    WHERE ri.recipe_id = p_rid
  )
  WHERE id = p_rid;
END;
$$;

-- Resync toutes les recettes qui ont des recipe_ingredients
DO $$
DECLARE
  rid bigint;
BEGIN
  FOR rid IN SELECT DISTINCT recipe_id FROM recipe_ingredients ORDER BY recipe_id
  LOOP
    PERFORM _tmp_rebuild_jsonb(rid);
  END LOOP;
END;
$$;

-- Nettoyage
DROP FUNCTION IF EXISTS _tmp_rebuild_jsonb(bigint);


COMMIT;
