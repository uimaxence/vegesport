import { days, mealTypes } from '../data/plannings';

/**
 * Moteur de planification : source unique pour la génération de planning,
 * le remplacement de recette et le calcul auto des portions.
 * Utilisé par PlanningSetup (funnel), Planning (éditeur) et AddToPlanning (fiche recette).
 */

export const MEAL_SIZE_OPTIONS = [
  { mult: 0.5, label: '½',      title: 'Demi-portion' },
  { mult: 1,   label: '×1',     title: 'Portion normale' },
  { mult: 1.5, label: '×1.5',   title: 'Portion et demie' },
  { mult: 2,   label: 'Double', title: 'Double portion' },
];

/** Lundi (YYYY-MM-DD) de la semaine contenant `date`. */
export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** Lundi de la semaine suivante. */
export function getNextWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() + (7 - ((d.getDay() + 6) % 7)));
  return d.toISOString().slice(0, 10);
}

/** Score une recette selon l'objectif sportif (plus haut = plus adapté). */
export function scoreRecipeForObjective(recipe, objective) {
  const protein = Number(recipe?.protein) || 0;
  const carbs = Number(recipe?.carbs) || 0;
  const fat = Number(recipe?.fat) || 0;
  const calories = Number(recipe?.calories) || 0;

  // Densité protéique (g / 100 kcal) : robuste même si calories approx.
  const protDensity = calories > 0 ? (protein / calories) * 100 : 0;
  const carbShare = calories > 0 ? (carbs * 4) / calories : 0;
  const fatShare = calories > 0 ? (fat * 9) / calories : 0;

  switch (objective) {
    case 'masse':
      // Protéines + calories suffisantes (sans favoriser uniquement les bombes caloriques).
      return protein * 2 + calories * 0.15 + protDensity * 6 - fatShare * 10;
    case 'seche':
      // Densité protéines + calories plus basses.
      return protDensity * 20 + protein * 1.2 - calories * 0.08 - fatShare * 12;
    case 'endurance':
      // Glucides + énergie, protéines ok.
      return carbs * 1.8 + calories * 0.08 + protein * 0.6 + carbShare * 10 - fatShare * 6;
    case 'sante':
    default:
      // Équilibre global : protéines correctes, ni trop gras, ni trop extrême.
      return protein * 1.1 + carbs * 0.7 + protDensity * 8 - Math.abs(fatShare - 0.25) * 40;
  }
}

/** Part des calories de la journée attribuée à chaque repas. */
const MEAL_CALORIE_SHARE = {
  3: { 'petit-dejeuner': 0.28, dejeuner: 0.38, diner: 0.34 },
  4: { 'petit-dejeuner': 0.25, dejeuner: 0.33, diner: 0.30, collation: 0.12 },
};

function calorieShares(mealsPerDay) {
  return MEAL_CALORIE_SHARE[Number(mealsPerDay) === 3 ? 3 : 4];
}

/** Multiplicateur (½, ×1, ×1.5, double) qui rapproche le plus un plat de son budget calorique. */
function bestMultiplierFor(kcal, budget) {
  let best = 1;
  let bestDiff = Infinity;
  for (const { mult } of MEAL_SIZE_OPTIONS) {
    const diff = Math.abs(kcal * mult - budget);
    if (diff < bestDiff) {
      best = mult;
      bestDiff = diff;
    }
  }
  return best;
}

/** Un plat « rentre » dans le budget si une des tailles de portion tombe à ±25 % de la cible. */
function fitsBudget(recipe, budget) {
  const kcal = Number(recipe?.calories) || 0;
  if (!kcal || !budget) return true;
  const served = kcal * bestMultiplierFor(kcal, budget);
  return Math.abs(served - budget) / budget <= 0.25;
}

/** Pool de recettes pour un créneau : catégorie + régime, fallback catégorie seule. */
function poolForMealType(recipes, mealTypeId, regime, excludeIds = null) {
  const matches = (r) => {
    if (r.category !== mealTypeId) return false;
    if (excludeIds && excludeIds.has(r.id)) return false;
    return true;
  };
  let pool = recipes.filter((r) => {
    if (!matches(r)) return false;
    if (regime && regime !== 'vegetarien' && !(r.regime || []).includes(regime)) return false;
    return true;
  });
  if (pool.length === 0) pool = recipes.filter(matches);
  return pool;
}

/** Tire une recette parmi les mieux notées (top 8) pour garder de la variété. */
function pickScored(pool, objective) {
  const ranked = pool
    .map((r) => ({ r, score: scoreRecipeForObjective(r, objective) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.r);
  const topN = Math.min(8, ranked.length);
  return ranked[Math.floor(Math.random() * topN)];
}

/**
 * Génère une semaine complète de repas.
 * Retourne { lundi: { 'petit-dejeuner': id, ... }, ... }.
 */
export function generateWeekPlanning({ recipes, objective, regime, targetCalories, targetProtein, mealsPerDay }) {
  const list = recipes || [];
  const usedIds = new Set();
  const planning = {};
  const shares = calorieShares(mealsPerDay);
  days.forEach((day) => {
    planning[day] = {};
    mealTypes.forEach((mt) => {
      let pool = poolForMealType(list, mt.id, regime);
      if (pool.length === 0) {
        planning[day][mt.id] = null;
        return;
      }
      // Si on connaît la cible calorique, on écarte les plats qu'aucune taille de portion ne peut y faire rentrer.
      const budget = targetCalories && shares[mt.id] ? targetCalories * shares[mt.id] : null;
      if (budget) {
        const fitting = pool.filter((r) => fitsBudget(r, budget));
        if (fitting.length >= 3) pool = fitting;
      }
      const fresh = pool.filter((r) => !usedIds.has(r.id));
      const picked = pickScored(fresh.length > 0 ? fresh : pool, objective);
      planning[day][mt.id] = picked.id;
      usedIds.add(picked.id);
    });
  });
  if (targetCalories && targetProtein) {
    boostProtein({ planning, list, regime, shares, targetCalories, targetProtein });
  }
  return planning;
}

/** Protéines réellement servies une fois le plat dimensionné sur son budget calorique. */
function servedProtein(recipe, budget) {
  const kcal = Number(recipe?.calories) || 0;
  const mult = kcal && budget ? bestMultiplierFor(kcal, budget) : 1;
  return (Number(recipe?.protein) || 0) * mult;
}

/**
 * Rattrapage protéines : tant qu'une journée est sous la cible, on remplace le repas
 * qui offre le plus gros gain par un plat plus protéiné du même créneau, à calories
 * équivalentes. Un même plat revient au maximum 2 fois dans la semaine.
 */
function boostProtein({ planning, list, regime, shares, targetCalories, targetProtein }) {
  const byId = new Map(list.map((r) => [r.id, r]));
  const slots = Object.keys(shares);
  const useCount = new Map();
  days.forEach((day) => slots.forEach((mtId) => {
    const id = planning[day]?.[mtId];
    if (id != null) useCount.set(id, (useCount.get(id) || 0) + 1);
  }));
  const pools = Object.fromEntries(slots.map((mtId) => [mtId, poolForMealType(list, mtId, regime)]));

  days.forEach((day) => {
    for (let pass = 0; pass < slots.length; pass++) {
      const dayProtein = slots.reduce(
        (sum, mtId) => sum + servedProtein(byId.get(planning[day][mtId]), targetCalories * shares[mtId]),
        0,
      );
      if (dayProtein >= targetProtein * 0.95) break;

      let best = null;
      slots.forEach((mtId) => {
        const budget = targetCalories * shares[mtId];
        const currentId = planning[day][mtId];
        const currentProtein = servedProtein(byId.get(currentId), budget);
        pools[mtId].forEach((r) => {
          if (r.id === currentId || (useCount.get(r.id) || 0) >= 2) return;
          if (slots.some((other) => planning[day][other] === r.id)) return;
          if (!fitsBudget(r, budget)) return;
          const gain = servedProtein(r, budget) - currentProtein;
          if (gain > 3 && (!best || gain > best.gain)) best = { mtId, recipe: r, gain };
        });
      });
      if (!best) break;

      const previousId = planning[day][best.mtId];
      if (previousId != null) useCount.set(previousId, Math.max(0, (useCount.get(previousId) || 1) - 1));
      planning[day][best.mtId] = best.recipe.id;
      useCount.set(best.recipe.id, (useCount.get(best.recipe.id) || 0) + 1);
    }
  });
}

/** Choisit une recette de remplacement pour un créneau (différente de l'actuelle). */
export function pickReplacement({ recipes, objective, regime, mealTypeId, excludeId }) {
  const list = recipes || [];
  const exclude = excludeId != null ? new Set([excludeId]) : null;
  const pool = poolForMealType(list, mealTypeId, regime, exclude);
  if (pool.length === 0) return null;
  return pickScored(pool, objective);
}

/**
 * Taille de chaque repas (½, ×1, ×1.5, double) pour que la journée colle à la cible
 * calorique de la personne. Les macros des recettes sont exprimées par portion.
 * Retourne { 'lundi-dejeuner': 1.5, ... } (seulement les repas ≠ ×1).
 */
export function computeMealMultipliers({ planning, recipes, mealsPerDay, targetCalories }) {
  if (!targetCalories) return {};
  const byId = new Map((recipes || []).map((r) => [r.id, r]));
  const shares = calorieShares(mealsPerDay);
  const mealMultipliers = {};
  days.forEach((day) => {
    Object.entries(shares).forEach(([mealTypeId, share]) => {
      const kcal = Number(byId.get(planning?.[day]?.[mealTypeId])?.calories) || 0;
      if (!kcal) return;
      const mult = bestMultiplierFor(kcal, targetCalories * share);
      if (mult !== 1) mealMultipliers[`${day}-${mealTypeId}`] = mult;
    });
  });
  return mealMultipliers;
}

/** Ingrédients qu'on a souvent déjà dans le placard / frigo. */
const COMMON_PANTRY_TERMS = [
  'sel', 'poivre', 'pâtes', 'pates', 'riz', 'oignon', 'oignons', 'ail', 'huile', 'farine',
  'sucre', 'vinaigre', 'moutarde', 'paprika', 'curry', 'cumin', 'curcuma', 'origan',
  'basilic', 'persil', 'thym', 'laurier', 'piment', 'cannelle', 'muscade', 'levure',
  'bicarbonate', 'maïzena', 'cornichon', 'câpres', 'olive', 'tomate séchée', 'confiture',
  'miel', 'sirop', 'sauce soja', 'tahini', 'bouillon', 'lait', 'crème', 'beurre',
  'œuf', 'oeuf', 'pain', 'tortilla', 'quinoa', 'avoine', 'lentille', 'pois chiche',
  'haricot', 'noix', 'amande', 'cacahuète', 'cacao', 'chocolat', 'coriandre',
];

export function isCommonPantry(name) {
  const lower = (name || '').toLowerCase();
  return COMMON_PANTRY_TERMS.some((term) => lower.includes(term));
}
