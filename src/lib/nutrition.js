/**
 * Utilitaires de calcul nutritionnel.
 * Toutes les fonctions sont pures — aucun effet de bord, aucun appel réseau.
 */

/**
 * Poids moyen (g) d'une « pièce » par ingrédient : sans lui, bananes, œufs, oignons,
 * tortillas… étaient ignorés du calcul et les macros sous-estimées.
 * Clés en minuscules sans accents ; la première clé contenue dans le nom gagne.
 */
const PIECE_WEIGHTS = [
  ['ail', 5], ['avocat', 150], ['banane', 120], ['betterave', 150], ['carotte', 100],
  ['jus de citron', 40], ['citron', 50], ['concombre', 300], ['courgette', 200],
  ['fruit de la passion', 20], ['gingembre', 5], ['mangue', 200], ['oignon', 110],
  ['patate douce', 250], ['poireau', 150], ['poivron', 150], ['pommes de terre', 150],
  ['pomme de terre', 150], ['tomate', 120], ['tortillas de mais', 30], ['tortilla', 60],
  ['wrap', 60], ['epinard', 30], ['oeuf', 55], ['cumin', 2], ['sel', 1],
];

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function pieceWeight(ingredientName) {
  const n = normalizeName(ingredientName);
  const hit = PIECE_WEIGHTS.find(([key]) => n.includes(key));
  return hit ? hit[1] : null;
}

/** Conversion approximative d'une quantité en grammes pour le calcul nutritionnel. */
export function quantityInGrams(quantity, unit, ingredientName) {
  if (quantity == null) return null;
  switch (unit) {
    case 'g': return quantity;
    case 'kg': return quantity * 1000;
    case 'ml': return quantity;       // approximation densité ≈ 1
    case 'cl': return quantity * 10;
    case 'L': return quantity * 1000;
    case 'c.à.s': return quantity * 15;
    case 'c.à.c': return quantity * 5;
    case 'pincée': return quantity * 0.5;
    case 'pièce': {
      const w = pieceWeight(ingredientName);
      return w == null ? null : quantity * w;
    }
    default: return null;             // sachet, tranche, « à volonté » → non convertible
  }
}

/**
 * Calcule les macros totales d'une recette depuis ses ingrédients structurés.
 *
 * @param {Array} recipeIngredients — chaque élément doit avoir :
 *   { quantity, unit, ingredients: { calories_per_100, protein_per_100, carbs_per_100, fat_per_100 } }
 * @returns {{ calories, protein, carbs, fat, complete, coverage }}
 *   complete = true si TOUS les ingrédients ont des macros
 *   coverage = nombre d'ingrédients avec macros / total
 */
export function calculateRecipeMacros(recipeIngredients) {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let withMacros = 0;
  let total = 0;

  for (const ri of recipeIngredients || []) {
    total++;
    const ing = ri.ingredients;
    if (!ing || ing.calories_per_100 == null) continue;

    const grams = quantityInGrams(ri.quantity, ri.unit, ing.name);
    if (grams == null) continue;

    withMacros++;
    const factor = grams / 100;
    calories += (ing.calories_per_100 || 0) * factor;
    protein += (ing.protein_per_100 || 0) * factor;
    carbs += (ing.carbs_per_100 || 0) * factor;
    fat += (ing.fat_per_100 || 0) * factor;
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    complete: total > 0 && withMacros === total,
    coverage: total > 0 ? withMacros / total : 0,
  };
}

/**
 * Macros par portion.
 * @param {object} totals — résultat de calculateRecipeMacros
 * @param {number} servings — nombre de portions de la recette
 */
export function macrosPerServing(totals, servings) {
  const s = servings || 1;
  return {
    calories: Math.round(totals.calories / s),
    protein: Math.round(totals.protein / s),
    carbs: Math.round(totals.carbs / s),
    fat: Math.round(totals.fat / s),
  };
}
