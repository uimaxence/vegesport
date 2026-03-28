/**
 * Utilitaires de calcul nutritionnel.
 * Toutes les fonctions sont pures — aucun effet de bord, aucun appel réseau.
 */

/** Conversion approximative d'une quantité en grammes pour le calcul nutritionnel. */
export function quantityInGrams(quantity, unit) {
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
    default: return null;             // pièce, sachet, tranche → non convertible
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

    const grams = quantityInGrams(ri.quantity, ri.unit);
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
