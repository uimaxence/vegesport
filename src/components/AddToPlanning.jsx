import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarPlus, Check, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { days, mealTypes } from '../data/plannings';
import { getWeekStart } from '../lib/planningEngine';
import { getCurrentDayId } from '../utils/dashboardPlanning';

const DAY_LABELS = {
  lundi: 'Lun',
  mardi: 'Mar',
  mercredi: 'Mer',
  jeudi: 'Jeu',
  vendredi: 'Ven',
  samedi: 'Sam',
  dimanche: 'Dim',
};

/**
 * Carte « Ajouter ce plat à mon planning » sur les fiches recettes.
 * Ajoute la recette au planning de la semaine en cours (créé s'il n'existe pas).
 */
export default function AddToPlanning({ recipe }) {
  const { user, savedPlannings, savePlanning, updatePlanning, planningPreferences } = useAuth();
  const { recipes } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const defaultMeal = mealTypes.some((mt) => mt.id === recipe.category)
    ? recipe.category
    : 'collation';
  const [selectedDay, setSelectedDay] = useState(() => getCurrentDayId());
  const [selectedMeal, setSelectedMeal] = useState(defaultMeal);
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState(false);

  const weekStart = getWeekStart();
  const currentPlanning = useMemo(
    () => savedPlannings?.find((p) => p.weekStart === weekStart) || null,
    [savedPlannings, weekStart],
  );

  // Recette déjà présente sur le créneau choisi (sera remplacée)
  const existingRecipe = useMemo(() => {
    const existingId = currentPlanning?.meals?.[selectedDay]?.[selectedMeal];
    if (!existingId || existingId === recipe.id) return null;
    return recipes.find((r) => r.id === existingId) || null;
  }, [currentPlanning, selectedDay, selectedMeal, recipe.id, recipes]);

  const handleAdd = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const meals = {
        ...(currentPlanning?.meals || {}),
        [selectedDay]: {
          ...(currentPlanning?.meals?.[selectedDay] || {}),
          [selectedMeal]: recipe.id,
        },
      };
      if (currentPlanning?.id) {
        await updatePlanning(currentPlanning.id, { meals });
      } else {
        await savePlanning({
          date: new Date().toLocaleDateString('fr-FR'),
          objective: currentPlanning?.objective || recipe.objective?.[0] || planningPreferences?.objective || 'sante',
          meals,
          mealMultipliers: currentPlanning?.mealMultipliers || {},
          weekStart,
        });
      }
      setAdded(true);
    } finally {
      setSaving(false);
    }
  };

  // Invité : on présente l'option, la connexion (ou le funnel) fait le reste.
  if (!user) {
    return (
      <section className="mt-10 rounded-2xl border border-border bg-bg-warm/50 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <CalendarPlus size={16} className="text-primary" />
          <h2 className="font-display text-lg text-text">Ajoute ce plat à ton planning</h2>
        </div>
        <p className="text-sm text-text-light leading-relaxed mb-4">
          Planifie tes repas de la semaine, suis tes macros et génère ta liste de courses automatiquement.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/planning/setup"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20"
          >
            Créer mon planning
            <ArrowRight size={14} />
          </Link>
          <button
            type="button"
            onClick={() => navigate('/connexion', { state: { from: location.pathname } })}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-border text-sm font-medium rounded-full text-text hover:border-text transition-colors"
          >
            J&apos;ai déjà un compte
          </button>
        </div>
      </section>
    );
  }

  if (added) {
    return (
      <section className="mt-10 rounded-2xl border border-secondary/30 bg-secondary/5 p-5 sm:p-6">
        <p className="flex items-center gap-2 text-sm font-medium text-secondary">
          <Check size={16} strokeWidth={2.5} />
          Ajouté au {selectedMeal === 'petit-dejeuner' ? 'petit-déjeuner' : selectedMeal === 'dejeuner' ? 'déjeuner' : selectedMeal === 'diner' ? 'dîner' : 'créneau collation'} de {selectedDay} !
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <Link
            to="/planning?mine=1"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Voir mon planning
            <ChevronRight size={14} />
          </Link>
          <button
            type="button"
            onClick={() => setAdded(false)}
            className="text-sm text-text-light hover:text-text transition-colors"
          >
            Ajouter à un autre jour
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-2xl border border-border bg-bg-warm/50 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1.5">
        <CalendarPlus size={16} className="text-primary" />
        <h2 className="font-display text-lg text-text">Ajouter ce plat à mon planning</h2>
      </div>
      <p className="text-sm text-text-light mb-4">
        {currentPlanning
          ? 'Choisis le jour et le repas : on met ton planning de la semaine à jour.'
          : 'Pas encore de planning cette semaine ? On le crée avec ce plat pour commencer.'}
      </p>

      <div className="space-y-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-text-light mb-1.5">Jour</p>
          <div className="flex flex-wrap gap-1.5">
            {days.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  selectedDay === d
                    ? 'bg-primary/10 border-primary/40 text-primary font-medium'
                    : 'bg-white border-border text-text-light hover:border-text/30 hover:text-text'
                }`}
              >
                {DAY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-text-light mb-1.5">Repas</p>
          <div className="flex flex-wrap gap-1.5">
            {mealTypes.map((mt) => (
              <button
                key={mt.id}
                type="button"
                onClick={() => setSelectedMeal(mt.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  selectedMeal === mt.id
                    ? 'bg-primary/10 border-primary/40 text-primary font-medium'
                    : 'bg-white border-border text-text-light hover:border-text/30 hover:text-text'
                }`}
              >
                {mt.label}
              </button>
            ))}
          </div>
        </div>

        {existingRecipe && (
          <p className="text-xs text-text-light italic">
            Ce créneau contient déjà « {existingRecipe.title} » — il sera remplacé.
          </p>
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20 disabled:opacity-60"
        >
          <CalendarPlus size={15} />
          {saving ? 'Ajout…' : 'Ajouter à mon planning'}
        </button>
      </div>
    </section>
  );
}
