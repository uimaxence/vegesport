import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, UtensilsCrossed, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { getSlug } from '../../lib/slug';
import { getMealTypeFromHour, getCurrentDayId, mealTypes } from '../../utils/dashboardPlanning';
import { days } from '../../data/plannings';

const MEAL_LABELS = {
  'petit-dejeuner': 'Petit-déjeuner',
  dejeuner: 'Déjeuner',
  collation: 'Collation',
  diner: 'Dîner',
};

const MEAL_HOURS = {
  'petit-dejeuner': '7h – 10h',
  dejeuner: '12h – 14h',
  collation: '16h – 18h',
  diner: '19h – 21h',
};

const DAY_LABELS = {
  lundi: 'Lundi', mardi: 'Mardi', mercredi: 'Mercredi',
  jeudi: 'Jeudi', vendredi: 'Vendredi', samedi: 'Samedi', dimanche: 'Dimanche',
};

/**
 * planningId : string — ID du planning (pour les liens contextualisés)
 * mealsDoneMap : { "lundi-dejeuner": true, ... } — facultatif
 * onToggleDone(day, mealTypeId) — facultatif, affiche les cases à cocher (jour courant uniquement)
 */
export default function RepasDuMoment({ planning, getRecipe, planningId, mealsDoneMap, onToggleDone }) {
  const hour = new Date().getHours();
  const currentMealTypeId = getMealTypeFromHour(hour);
  const currentDay = getCurrentDayId();
  const currentDayIndex = days.indexOf(currentDay);

  const [dayOffset, setDayOffset] = useState(0);
  const viewedDayIndex = currentDayIndex + dayOffset;
  const viewedDay = days[viewedDayIndex] ?? currentDay;
  const isToday = dayOffset === 0;

  const canPrev = viewedDayIndex > 0;
  const canNext = viewedDayIndex < days.length - 1;

  const dayMeals = planning?.meals?.[viewedDay] || {};
  const hasTracking = isToday && Boolean(mealsDoneMap && onToggleDone);

  const viewedMeals = mealTypes.map((mt) => {
    const recipeId = dayMeals[mt.id];
    const recipe = recipeId ? getRecipe(recipeId) : null;
    const isCurrent = isToday && mt.id === currentMealTypeId;
    const doneKey = `${viewedDay}-${mt.id}`;
    const isDone = hasTracking ? Boolean(mealsDoneMap[doneKey]) : false;
    return { ...mt, recipe, isCurrent, isDone, doneKey };
  });

  const hasMeals = viewedMeals.some((m) => m.recipe);

  // Calcul des apports réalisés (aujourd'hui seulement)
  const todayDoneStats = hasTracking
    ? viewedMeals.reduce(
        (acc, m) => {
          if (m.isDone && m.recipe) {
            acc.protein += m.recipe.protein ?? 0;
            acc.calories += m.recipe.calories ?? 0;
            acc.count += 1;
          }
          return acc;
        },
        { protein: 0, calories: 0, count: 0 }
      )
    : null;

  const getRecipeLink = (recipe, mealTypeId) => {
    if (planningId) {
      const params = new URLSearchParams({ day: viewedDay, meal: mealTypeId });
      return `/planning/${planningId}/recette/${getSlug(recipe.title)}?${params}`;
    }
    return `/recettes/${getSlug(recipe.title)}`;
  };

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      {/* Header avec navigation */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <button
          type="button"
          onClick={() => setDayOffset((d) => d - 1)}
          disabled={!canPrev}
          className="p-1 rounded-md text-text-light hover:text-primary hover:bg-primary/5 disabled:opacity-20 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-primary" />
          <span className="text-xs font-medium uppercase tracking-wider text-primary">
            {isToday ? 'Aujourd\'hui' : DAY_LABELS[viewedDay] || viewedDay}
            {isToday && ` — ${DAY_LABELS[currentDay]}`}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setDayOffset((d) => d + 1)}
          disabled={!canNext}
          className="p-1 rounded-md text-text-light hover:text-primary hover:bg-primary/5 disabled:opacity-20 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Badge repas en cours (aujourd'hui seulement) */}
      {isToday && currentMealTypeId && (
        <div className="px-5 py-1.5 border-b border-border bg-primary/3 flex justify-center">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {MEAL_LABELS[currentMealTypeId]}
          </span>
        </div>
      )}

      {/* Compteur de réalisé */}
      {todayDoneStats && todayDoneStats.count > 0 && (
        <div className="px-5 py-2 bg-secondary/5 border-b border-border flex items-center gap-4 text-xs text-secondary">
          <span className="font-medium">{todayDoneStats.count} repas réalisé{todayDoneStats.count > 1 ? 's' : ''}</span>
          <span>{todayDoneStats.protein}g prot · {todayDoneStats.calories} kcal</span>
        </div>
      )}

      {!hasMeals ? (
        <div className="px-5 py-8 text-center">
          <UtensilsCrossed size={28} className="text-text-light/40 mx-auto mb-3" />
          <p className="text-sm text-text-light">Aucun repas planifié {isToday ? 'aujourd\'hui' : DAY_LABELS[viewedDay]?.toLowerCase()}.</p>
          <Link to="/planning" className="text-xs text-primary mt-2 inline-block hover:underline">
            Modifier le planning →
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {viewedMeals.map(({ id, recipe, isCurrent, isDone }) => (
            <li
              key={id}
              className={`relative transition-colors ${
                isDone
                  ? 'bg-secondary/4'
                  : isCurrent
                  ? 'bg-primary/4'
                  : 'hover:bg-bg-warm/60'
              }`}
            >
              {/* Indicateur latéral */}
              {(isCurrent || isDone) && (
                <span
                  className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
                  style={{ backgroundColor: isDone ? '#2D6A4F' : '#E8450E' }}
                />
              )}

              <div className="flex items-center gap-3 px-5 py-3">
                {/* Case à cocher (jour courant uniquement) */}
                {hasTracking && recipe && (
                  <button
                    type="button"
                    onClick={() => onToggleDone(currentDay, id)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-secondary border-secondary'
                        : 'border-text-light/40 hover:border-secondary/60'
                    }`}
                    title={isDone ? 'Marquer comme non fait' : 'Marquer comme fait'}
                  >
                    {isDone && <Check size={11} className="text-white" strokeWidth={3} />}
                  </button>
                )}

                {recipe ? (
                  <Link
                    to={getRecipeLink(recipe, id)}
                    className="flex items-center gap-3 flex-1 min-w-0 group"
                  >
                    <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-bg-warm flex items-center justify-center">
                      <img
                        src={recipe.image}
                        alt=""
                        className={`w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform ${isDone ? 'opacity-60' : ''}`}
                        style={{ objectPosition: 'center' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium mb-0.5 ${isDone ? 'text-secondary' : isCurrent ? 'text-primary' : 'text-text-light'}`}>
                        {MEAL_LABELS[id]}
                        <span className="ml-1.5 font-normal opacity-60">{MEAL_HOURS[id]}</span>
                      </p>
                      <p className={`text-sm leading-snug truncate ${isDone ? 'text-text-light line-through' : isCurrent ? 'text-text font-medium' : 'text-text-light'}`}>
                        {recipe.title}
                      </p>
                      <p className="text-[11px] text-text-light/70 mt-0.5">
                        {recipe.protein}g prot · {recipe.calories} kcal
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-text-light/40 flex-shrink-0 group-hover:text-primary transition-colors" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-lg flex-shrink-0 bg-bg-warm/60 border border-dashed border-border flex items-center justify-center">
                      <UtensilsCrossed size={14} className="text-text-light/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-light/60 mb-0.5">
                        {MEAL_LABELS[id]}
                        <span className="ml-1.5">{MEAL_HOURS[id]}</span>
                      </p>
                      <p className="text-sm text-text-light/40 italic">Non planifié</p>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
