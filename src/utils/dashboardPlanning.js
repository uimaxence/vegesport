import { days, mealTypes } from '../data/plannings';

/** Lundi de la semaine au format YYYY-MM-DD */
export function getCurrentWeekMonday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

/**
 * Retourne le planning le plus pertinent pour la semaine en cours.
 * Priorité : planning dont weekStart = lundi courant.
 * Fallback : planning le plus récent (pour dev/test, ou si weekStart manquant).
 */
export function getPlanningForCurrentWeek(savedPlannings) {
  if (!savedPlannings?.length) return null;
  const thisMonday = getCurrentWeekMonday();
  // 1. Correspondance exacte de semaine
  const exact = savedPlannings.find((p) => p.weekStart === thisMonday);
  if (exact) return exact;
  // 2. Planning sans weekStart ou le plus récent disponible (fallback)
  return savedPlannings[0] || null;
}

/**
 * Retourne le type de repas selon l'heure (id: petit-dejeuner | dejeuner | diner | collation).
 * 6-10h petit-dej, 11-14h déjeuner, 15-17h collation, 18-22h dîner.
 */
export function getMealTypeFromHour(hour) {
  if (hour >= 6 && hour < 11) return 'petit-dejeuner';
  if (hour >= 11 && hour < 15) return 'dejeuner';
  if (hour >= 15 && hour < 18) return 'collation';
  if (hour >= 18 && hour < 22) return 'diner';
  return null;
}

/** Jour actuel au format "lundi" | "mardi" | ... */
export function getCurrentDayId() {
  const d = new Date();
  const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
  return days[dayIndex];
}

/** Objectifs journaliers (protein, carbs, fat, calories) selon objectif + défauts poids 70, niveau amateur */
const TARGETS_BY_OBJECTIVE = {
  masse: {
    debutant: { proteinPerKg: 1.7, carbsPerKg: 4.5, fatPerKg: 0.9, calMult: 1.08 },
    amateur: { proteinPerKg: 1.9, carbsPerKg: 5, fatPerKg: 0.9, calMult: 1.1 },
    confirme: { proteinPerKg: 2.1, carbsPerKg: 6, fatPerKg: 0.85, calMult: 1.1 },
  },
  endurance: {
    debutant: { proteinPerKg: 1.3, carbsPerKg: 4.5, fatPerKg: 0.9, calMult: 1.0 },
    amateur: { proteinPerKg: 1.5, carbsPerKg: 6, fatPerKg: 0.9, calMult: 1.0 },
    confirme: { proteinPerKg: 1.7, carbsPerKg: 7, fatPerKg: 0.9, calMult: 1.05 },
  },
  sante: {
    debutant: { proteinPerKg: 1.3, carbsPerKg: 3.5, fatPerKg: 0.9, calMult: 1.0 },
    amateur: { proteinPerKg: 1.5, carbsPerKg: 4, fatPerKg: 0.9, calMult: 1.0 },
    confirme: { proteinPerKg: 1.7, carbsPerKg: 5, fatPerKg: 0.9, calMult: 1.0 },
  },
  seche: {
    debutant: { proteinPerKg: 1.9, carbsPerKg: 2.5, fatPerKg: 0.7, calMult: 0.875 },
    amateur: { proteinPerKg: 2.1, carbsPerKg: 2.75, fatPerKg: 0.65, calMult: 0.825 },
    confirme: { proteinPerKg: 2.35, carbsPerKg: 2.25, fatPerKg: 0.6, calMult: 0.85 },
  },
};

const MAINTENANCE_KCAL_PER_KG = 30;

export function getDailyTargetsFromObjective(objective = 'masse', poidsKg = 70, niveau = 'amateur') {
  const kg = Math.max(40, Math.min(150, Number(poidsKg) || 70));
  const byObj = TARGETS_BY_OBJECTIVE[objective] || TARGETS_BY_OBJECTIVE.masse;
  const ref = byObj[niveau] || byObj.amateur;
  return {
    protein: Math.round(ref.proteinPerKg * kg),
    carbs: Math.round(ref.carbsPerKg * kg),
    fat: Math.round(ref.fatPerKg * kg),
    calories: Math.round(MAINTENANCE_KCAL_PER_KG * kg * ref.calMult),
  };
}

/** Pour un jour donné, calcule les totaux du planning (portions = 2 par défaut) */
export function computeDayTotals(mealsForDay, getRecipe, portions = 2) {
  let protein = 0, carbs = 0, fat = 0, calories = 0;
  mealTypes.forEach((mt) => {
    const recipeId = mealsForDay?.[mt.id];
    const recipe = recipeId ? getRecipe(recipeId) : null;
    if (recipe) {
      const ratio = portions / (recipe.servings || 1);
      protein += (recipe.protein ?? 0) * ratio;
      carbs += (recipe.carbs ?? 0) * ratio;
      fat += (recipe.fat ?? 0) * ratio;
      calories += (recipe.calories ?? 0) * ratio;
    }
  });
  return { protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat), calories: Math.round(calories) };
}

/** Données planifiées par jour pour le graphique */
export function computeWeekDataForChart(planning, getRecipe, portions = 2) {
  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  return days.map((dayId, i) => {
    const totals = computeDayTotals(planning.meals?.[dayId], getRecipe, portions);
    return { dayId, label: dayLabels[i], ...totals };
  });
}

/**
 * Données RÉALISÉES par jour.
 * mealsDoneMap = { "lundi-dejeuner": true, "mardi-collation": true, ... }
 * Seuls les repas cochés sont comptabilisés.
 */
export function computeWeekDataDone(planning, getRecipe, mealsDoneMap = {}, portions = 2) {
  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  return days.map((dayId, i) => {
    let protein = 0, carbs = 0, fat = 0, calories = 0;
    mealTypes.forEach((mt) => {
      const key = `${dayId}-${mt.id}`;
      if (!mealsDoneMap[key]) return;
      const recipeId = planning.meals?.[dayId]?.[mt.id];
      const recipe = recipeId ? getRecipe(recipeId) : null;
      if (!recipe) return;
      const ratio = portions / (recipe.servings || 1);
      protein += (recipe.protein ?? 0) * ratio;
      carbs += (recipe.carbs ?? 0) * ratio;
      fat += (recipe.fat ?? 0) * ratio;
      calories += (recipe.calories ?? 0) * ratio;
    });
    return {
      dayId,
      label: dayLabels[i],
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      calories: Math.round(calories),
    };
  });
}

export { days, mealTypes };
