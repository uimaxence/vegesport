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
export function generateWeekPlanning({ recipes, objective, regime }) {
  const list = recipes || [];
  const usedIds = new Set();
  const planning = {};
  days.forEach((day) => {
    planning[day] = {};
    mealTypes.forEach((mt) => {
      const pool = poolForMealType(list, mt.id, regime);
      if (pool.length === 0) {
        planning[day][mt.id] = null;
        return;
      }
      const fresh = pool.filter((r) => !usedIds.has(r.id));
      const picked = pickScored(fresh.length > 0 ? fresh : pool, objective);
      planning[day][mt.id] = picked.id;
      usedIds.add(picked.id);
    });
  });
  return planning;
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
 * Trouve la combinaison portions (1..4) × multiplicateur de repas qui approche
 * le mieux l'objectif protéines journalier.
 * Retourne { portions, mealMultipliers } ou null si le planning est vide.
 */
export function computeAutoPortions({ planning, recipes, mealsPerDay, targetProtein }) {
  if (!targetProtein) return null;
  const list = recipes || [];
  const activeTypes = mealTypes.slice(0, mealsPerDay || 4);

  let totalProtein = 0;
  let countedDays = 0;
  days.forEach((day) => {
    let dayProt = 0;
    activeTypes.forEach((mt) => {
      const r = list.find((rx) => rx.id === planning?.[day]?.[mt.id]);
      if (r) dayProt += r.protein ?? 0;
    });
    if (dayProt > 0) {
      countedDays += 1;
      totalProtein += dayProt;
    }
  });
  if (countedDays === 0) return null;

  const avgProtPerDay = totalProtein / countedDays;
  const mults = MEAL_SIZE_OPTIONS.map((o) => o.mult);
  let best = { portions: 1, mult: 1, diff: Infinity };
  for (let p = 1; p <= 4; p++) {
    for (const m of mults) {
      const diff = Math.abs(avgProtPerDay * p * m - targetProtein);
      if (diff < best.diff) best = { portions: p, mult: m, diff };
    }
  }

  const mealMultipliers = {};
  if (best.mult !== 1) {
    days.forEach((day) => {
      activeTypes.forEach((mt) => {
        if (planning?.[day]?.[mt.id]) mealMultipliers[`${day}-${mt.id}`] = best.mult;
      });
    });
  }
  return { portions: best.portions, mealMultipliers };
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
