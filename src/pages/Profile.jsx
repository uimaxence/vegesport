import { useState, useEffect, useMemo, useRef } from 'react';
import { Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Calendar, Award, LogOut, ChevronDown, ChevronUp, Check, Pencil, Flame, Beef, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { objectives } from '../data/recipes';
import { days, mealTypes, defaultPlannings } from '../data/plannings';
import RecipeCard from '../components/RecipeCard';
import HouseholdEditor from '../components/HouseholdEditor';
import { getPlanningForCurrentWeek } from '../utils/dashboardPlanning';

const MEALS_DONE_KEY = 'vegeprot_meals_done';

function getMealsDoneStorageKey(userId) {
  return `${MEALS_DONE_KEY}_${userId || 'anon'}`;
}

function loadMealsDoneFromStorage(userId) {
  try {
    const raw = localStorage.getItem(getMealsDoneStorageKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMealsDoneToStorage(userId, data) {
  try {
    localStorage.setItem(getMealsDoneStorageKey(userId), JSON.stringify(data));
  } catch {
    /* ignore quota / private mode */
  }
}

export default function Profile({ user, favorites, savedPlannings }) {
  usePageMeta({
    title: 'Mon profil',
    description: 'Tes recettes favorites, plannings sauvegardés et badges et si mamie était végé ?.',
    noindex: true,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, savePlanning, savePlanningPreferences } = useAuth();
  const claimHandledRef = useRef(false);

  const handleSignOut = () => {
    signOut(); // nettoyage synchrone (localStorage + state), pas d’await pour ne pas bloquer
    window.location.href = '/';
  };
  const { recipes } = useData();
  const [expandedPlanningId, setExpandedPlanningId] = useState(null);
  const [mealsDone, setMealsDone] = useState(() => loadMealsDoneFromStorage(user?.id));

  const currentPlanning = getPlanningForCurrentWeek(savedPlannings);
  const getRecipe = (id) => recipes.find((r) => r.id === id);

  useEffect(() => {
    if (!user?.id) return;
    setMealsDone(loadMealsDoneFromStorage(user.id));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !savePlanning || !savePlanningPreferences) return;
    const intent = location.state?.planningIntent;
    if (!intent || intent.type !== 'claim_planning' || claimHandledRef.current) return;
    claimHandledRef.current = true;
    const pref = intent.preferences || {};
    const restoredPlanning =
      intent.planning ||
      defaultPlannings[pref.objective || 'masse']?.meals ||
      defaultPlannings.masse.meals;
    const restoredMultipliers = intent.mealMultipliers || {};
    (async () => {
      try {
        await savePlanningPreferences(pref);
        await savePlanning({
          date: new Date().toLocaleDateString('fr-FR'),
          objective: pref.objective || intent.objective || 'masse',
          meals: restoredPlanning,
          mealMultipliers: restoredMultipliers,
        });
      } finally {
        navigate('/profil', { replace: true, state: {} });
      }
    })();
  }, [user?.id, location.state, navigate, savePlanning, savePlanningPreferences]);

  const persistMealsDone = (next) => {
    setMealsDone(next);
    if (user?.id) saveMealsDoneToStorage(user.id, next);
  };

  const toggleMealDone = (planningId, day, mealType) => {
    const key = `${day}-${mealType}`;
    persistMealsDone({
      ...mealsDone,
      [planningId]: {
        ...(mealsDone[planningId] || {}),
        [key]: !mealsDone[planningId]?.[key],
      },
    });
  };

  const totalMealsDone = useMemo(() => {
    let n = 0;
    savedPlannings.forEach((p) => {
      const id = p.id ?? `local-${p.date}`;
      const done = mealsDone[id];
      if (done) n += Object.values(done).filter(Boolean).length;
    });
    return n;
  }, [savedPlannings, mealsDone]);

  if (!user) {
    return <Navigate to="/connexion" />;
  }

  const favoriteRecipes = recipes.filter((r) => favorites.includes(r.id));

  const badges = [
    { label: 'Inscrit', earned: true },
    { label: '5 recettes vues', earned: favorites.length >= 5 },
    { label: '10 recettes testées', earned: false },
    { label: '1 mois d\'utilisation', earned: false },
    { label: 'As de la préparation repas', earned: savedPlannings.length >= 1 },
  ];

  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-12">
          <div className="flex items-center gap-4 min-w-0">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display text-xl">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-primary mb-1">Mon profil</p>
              <h1 className="font-display text-3xl sm:text-4xl text-text">
                Salut, {user.name}
              </h1>
              <p className="text-sm text-text-light mt-1 break-all">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              to="/donnees-personnelles"
              className="flex items-center gap-1.5 text-sm text-text-light hover:text-primary transition-colors"
            >
              <Shield size={16} />
              Données personnelles
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-text-light hover:text-primary transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Lien vers le planning */}
        <div className="mb-12 rounded-xl border border-border bg-bg-warm/50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium text-text">
                {currentPlanning ? 'Tu as un planning cette semaine' : 'Aucun planning pour cette semaine'}
              </p>
              <p className="text-xs text-text-light mt-0.5">
                {currentPlanning
                  ? 'Consulte ton planning, coche tes repas et suis tes apports.'
                  : 'Crée ton planning pour suivre tes repas et tes apports.'}
              </p>
            </div>
          </div>
          <Link
            to="/planning?mine=1"
            className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
          >
            {currentPlanning ? 'Mon planning' : 'Créer mon planning'}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <div className="bg-bg-warm rounded-lg p-4 text-center">
            <p className="font-display text-2xl text-primary">{favorites.length}</p>
            <p className="text-xs text-text-light mt-1">Favoris</p>
          </div>
          <div className="bg-bg-warm rounded-lg p-4 text-center">
            <p className="font-display text-2xl text-primary">{savedPlannings.length}</p>
            <p className="text-xs text-text-light mt-1">Plannings</p>
          </div>
          <div className="bg-bg-warm rounded-lg p-4 text-center">
            <p className="font-display text-2xl text-primary">{totalMealsDone}</p>
            <p className="text-xs text-text-light mt-1">Repas réalisés</p>
          </div>
          <div className="bg-bg-warm rounded-lg p-4 text-center">
            <p className="font-display text-2xl text-primary">{badges.filter(b => b.earned).length}</p>
            <p className="text-xs text-text-light mt-1">Badges</p>
          </div>
        </div>

        {/* Badges */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${
                  badge.earned
                    ? 'bg-primary/10 text-primary'
                    : 'bg-bg-warm text-text-light/40'
                }`}
              >
                <Award size={12} />
                {badge.label}
              </div>
            ))}
          </div>
        </div>

        {/* Favorites */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-[0.2em] text-primary mb-4">
            Mes recettes favorites
          </h2>
          {favoriteRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="bg-bg-warm rounded-lg p-6 text-center">
              <Heart size={24} className="mx-auto text-text-light/30 mb-2" />
              <p className="text-sm text-text-light">Aucune recette en favori pour l'instant.</p>
              <Link to="/recettes" className="text-xs text-primary hover:text-primary-dark mt-1 inline-block">
                Découvrir les recettes
              </Link>
            </div>
          )}
        </div>

        {/* Mon foyer */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-[0.2em] text-primary mb-4">
            Mon foyer
          </h2>
          <HouseholdEditor showIntro />
        </div>

        {/* Saved Plannings */}
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-primary mb-4">
            Mes plannings sauvegardés
          </h2>
          {savedPlannings.length > 0 ? (
            <div className="space-y-3">
              {savedPlannings.map((p) => {
                const id = p.id ?? `local-${p.date}`;
                const expanded = expandedPlanningId === id;
                const planningMealsDone = mealsDone[id] || {};
                let totalProtein = 0;
                let totalCalories = 0;
                let doneCount = 0;
                days.forEach((day) => {
                  mealTypes.forEach((mt) => {
                    const recipeId = p.meals?.[day]?.[mt.id];
                    const recipe = recipeId ? getRecipe(recipeId) : null;
                    const key = `${day}-${mt.id}`;
                    const done = !!planningMealsDone[key];
                    if (done && recipe) {
                      totalProtein += recipe.protein ?? 0;
                      totalCalories += recipe.calories ?? 0;
                      doneCount += 1;
                    }
                  });
                });
                return (
                  <div key={id} className="bg-bg-warm rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedPlanningId((prev) => (prev === id ? null : id))}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-black/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-primary shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-text">Planning du {p.date}</p>
                          <p className="text-xs text-text-light mt-0.5">
                            Objectif : {objectives.find((o) => o.id === p.objective)?.label ?? p.objective}
                          </p>
                        </div>
                      </div>
                      {expanded ? (
                        <ChevronUp size={18} className="text-text-light shrink-0" />
                      ) : (
                        <ChevronDown size={18} className="text-text-light shrink-0" />
                      )}
                    </button>
                    {expanded && (
                      <div className="border-t border-black/5 px-4 pb-4 pt-3">
                        <p className="text-xs text-text-light mb-3">
                          Coche les repas que tu as réalisés pour mettre à jour ton suivi d&apos;apports.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Link
                            to={p.id ? `/planning?mine=1&edit=${p.id}` : '/planning?mine=1'}
                            state={p.id ? undefined : { loadPlanning: p }}
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark font-medium"
                          >
                            <Pencil size={12} />
                            Modifier ce planning
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          {days.map((day) => (
                            <div key={day} className="bg-white/60 rounded-lg p-3 border border-black/5">
                              <p className="text-xs font-medium text-primary capitalize mb-2">{day}</p>
                              <ul className="space-y-1.5">
                                {mealTypes.map((mt) => {
                                  const recipeId = p.meals?.[day]?.[mt.id];
                                  const recipe = recipeId ? getRecipe(recipeId) : null;
                                  const key = `${day}-${mt.id}`;
                                  const done = !!planningMealsDone[key];
                                  return (
                                    <li key={mt.id} className="flex items-center gap-2 text-sm">
                                      <button
                                        type="button"
                                        onClick={() => toggleMealDone(id, day, mt.id)}
                                        className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                          done
                                            ? 'bg-primary border-primary text-white'
                                            : 'border-text-light/40 text-transparent hover:border-primary/50'
                                        }`}
                                        title={done ? 'Marquer comme non fait' : 'Marquer comme fait'}
                                      >
                                        {done && <Check size={12} strokeWidth={3} />}
                                      </button>
                                      <span className={done ? 'text-text-light line-through' : 'text-text'}>
                                        {recipe ? recipe.title : mt.label}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>
                        {(totalProtein > 0 || totalCalories > 0) && (
                          <div className="flex flex-wrap gap-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                            <span className="flex items-center gap-1.5 text-sm text-text">
                              <Beef size={14} className="text-primary" />
                              <strong>{totalProtein} g</strong> protéines (repas faits)
                            </span>
                            <span className="flex items-center gap-1.5 text-sm text-text">
                              <Flame size={14} className="text-primary" />
                              <strong>{totalCalories} kcal</strong> (repas faits)
                            </span>
                            <span className="text-xs text-text-light">
                              {doneCount} repas marqués comme faits
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-bg-warm rounded-lg p-6 text-center">
              <Calendar size={24} className="mx-auto text-text-light/30 mb-2" />
              <p className="text-sm text-text-light">Aucun planning sauvegardé.</p>
              <Link to="/planning?mine=1" className="text-xs text-primary hover:text-primary-dark mt-1 inline-block">
                Créer un planning
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
