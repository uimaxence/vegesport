import { generateWeekPlanning, computeMealMultipliers } from './planningEngine';
import { getDailyTargetsFromObjective } from '../utils/dashboardPlanning';

/** Profil par défaut : permet de générer une semaine sans poser la moindre question. */
export const DEFAULT_PROFILE = {
  regime: 'vegetarien',
  niveau: 'amateur',
  poids: 70,
  mealsPerDay: 4,
};

export const OBJECTIVE_CHOICES = [
  { id: 'masse', label: 'Prise de masse', hint: 'Plus de calories et de protéines' },
  { id: 'seche', label: 'Sèche', hint: 'Protéiné, calories maîtrisées' },
  { id: 'endurance', label: 'Endurance', hint: 'Glucides pour les longues sorties' },
  { id: 'sante', label: 'Santé', hint: 'Équilibré au quotidien' },
];

/** Planning invité : conservé 7 jours dans le navigateur (plus besoin de compte pour le retrouver). */
export const GUEST_PLANNING_KEY = 'planning_preview_v1';
export const GUEST_PLANNING_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

export function readGuestPlanning() {
  try {
    const raw = localStorage.getItem(GUEST_PLANNING_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    const ts = Number(saved?.ts) || 0;
    if (!ts || Date.now() - ts > GUEST_PLANNING_MAX_AGE_MS) {
      localStorage.removeItem(GUEST_PLANNING_KEY);
      return null;
    }
    return saved && typeof saved === 'object' ? saved : null;
  } catch {
    return null;
  }
}

export function writeGuestPlanning(payload) {
  try {
    localStorage.setItem(GUEST_PLANNING_KEY, JSON.stringify({ ...payload, ts: Date.now() }));
  } catch { /* stockage indisponible (navigation privée) : le planning reste en mémoire */ }
}

export function clearGuestPlanning() {
  try { localStorage.removeItem(GUEST_PLANNING_KEY); } catch { /* noop */ }
}

/**
 * Génère une semaine complète, chaque repas étant dimensionné (½ → double)
 * pour coller à la cible calorique de la personne.
 * Retourne l'objet attendu par l'éditeur (`location.state.setupPreview`).
 */
export function buildWeekPreview({
  recipes,
  objective,
  regime = DEFAULT_PROFILE.regime,
  niveau = DEFAULT_PROFILE.niveau,
  poids = DEFAULT_PROFILE.poids,
  mealsPerDay = DEFAULT_PROFILE.mealsPerDay,
  household,
  targetWeekStart = null,
}) {
  const weight = Number(poids) || DEFAULT_PROFILE.poids;
  const meals = Number(mealsPerDay) || DEFAULT_PROFILE.mealsPerDay;
  const targets = getDailyTargetsFromObjective(objective, weight, niveau);
  const planning = generateWeekPlanning({
    recipes,
    objective,
    regime,
    targetCalories: targets.calories,
    targetProtein: targets.protein,
    mealsPerDay: meals,
  });
  const mealMultipliers = computeMealMultipliers({
    planning,
    recipes,
    mealsPerDay: meals,
    targetCalories: targets.calories,
  });
  return {
    planning,
    mealMultipliers,
    objective,
    niveau,
    regime,
    poids: weight,
    mealsPerDay: meals,
    // Nombre de personnes à table (quantités de la liste de courses). Les macros restent par personne.
    portions: 1,
    household,
    targetWeekStart,
  };
}
