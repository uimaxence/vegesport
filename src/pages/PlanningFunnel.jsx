import { useLayoutEffect, useMemo, useState } from 'react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Eye, Flame, Leaf, Pencil, ShoppingCart, Target, TrendingUp, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Planning from './Planning';
import RepasDuMoment from '../components/dashboard/RepasDuMoment';
import SuiviApportsChart from '../components/dashboard/SuiviApportsChart';
import { getPlanningForCurrentWeek } from '../utils/dashboardPlanning';
import { usePageMeta } from '../hooks/usePageMeta';
import { canonicalUrl } from '../lib/seo';
import { getSafeImageSrc, handleMediaImageError } from '../lib/imageFallback';

const PREVIEW_MEALS = [
  { slot: 'Petit-déjeuner' },
  { slot: 'Déjeuner' },
  { slot: 'Collation' },
  { slot: 'Dîner' },
];

/* ─── Mini aperçu planning (hero droit) ───────────────────────────────────── */
function PlanningPreview({ recipes }) {
  const preview = PREVIEW_MEALS.map((meal, i) => ({
    ...meal,
    recipe: recipes[i] || null,
  }));

  const totalProt = preview.reduce((s, m) => s + (m.recipe?.protein || 0), 0);
  const totalCal = preview.reduce((s, m) => s + (m.recipe?.calories || 0), 0);

  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-md select-none" aria-hidden="true">
      {/* Shadow card behind for depth */}
      <div className="absolute -inset-3 rounded-3xl bg-primary/5 blur-sm" />

      <div className="relative rounded-2xl border border-border bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-bg-warm border-b border-border flex items-center justify-between">
          <div>
            <p className="text-[10px] font-accent uppercase tracking-[0.15em] text-text-light">Lundi</p>
            <p className="text-sm font-display text-text">Ton planning du jour</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-accent text-text-light">
            <span className="flex items-center gap-1">
              <Flame size={12} className="text-primary" />
              {totalCal} kcal
            </span>
            <span className="flex items-center gap-1 text-secondary font-medium">
              {totalProt}g prot
            </span>
          </div>
        </div>

        {/* Meal rows */}
        <div className="divide-y divide-border">
          {preview.map((meal) => (
            <div key={meal.slot} className="px-5 py-3 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/70 flex-shrink-0" />
              {meal.recipe ? (
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-accent uppercase tracking-[0.15em] text-text-light">
                    {meal.slot}
                  </p>
                  <p className="text-sm font-medium text-text truncate">{meal.recipe.title}</p>
                  <div className="flex items-center gap-2.5 mt-0.5 text-[11px] text-text-light font-accent">
                    <span className="flex items-center gap-0.5">
                      <Clock size={10} />
                      {meal.recipe.time} min
                    </span>
                    <span>{meal.recipe.protein}g prot</span>
                    <span>{meal.recipe.calories} kcal</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="h-3.5 bg-border/50 rounded w-3/4" />
                  <div className="h-2.5 bg-border/30 rounded w-1/2 mt-1.5" />
                </div>
              )}
              {meal.recipe && (
                <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-bg-warm">
                  <img
                    src={getSafeImageSrc(meal.recipe.image)}
                    alt=""
                    onError={handleMediaImageError}
                    className="w-full h-full object-contain scale-90"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer with macro bar */}
        <div className="px-5 py-3 bg-bg-warm border-t border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-accent uppercase tracking-wider text-text-light">Protéines du jour</span>
            <span className="text-[11px] font-accent font-medium text-secondary">{totalProt}g / 140g</span>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-secondary to-secondary-light transition-all"
              style={{ width: `${Math.min(100, Math.round((totalProt / 140) * 100))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature card ────────────────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, children }) {
  return (
    <div className="group rounded-2xl border border-border bg-white p-6 hover:shadow-md hover:border-primary/20 transition-all duration-300">
      <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        <Icon size={20} />
      </span>
      <h3 className="font-display text-lg text-text mb-1.5">{title}</h3>
      <p className="text-sm text-text-light leading-relaxed">{children}</p>
    </div>
  );
}

/* ─── Step card ───────────────────────────────────────────────────────────── */
function StepCard({ number, title, children }) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white font-display text-xl mb-5 shadow-lg shadow-primary/20">
        {number}
      </span>
      <h3 className="font-display text-xl text-text mb-2">{title}</h3>
      <p className="text-sm text-text-light leading-relaxed max-w-xs">{children}</p>
    </div>
  );
}

/** Retourne le lundi (YYYY-MM-DD) de la semaine contenant `date`. */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** Retourne le lundi de la semaine suivante. */
function getNextWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() + (7 - ((d.getDay() + 6) % 7)));
  return d.toISOString().slice(0, 10);
}

/** Formatte un lundi YYYY-MM-DD en libellé « Semaine du 31 mars » */
function formatWeekLabel(ws) {
  const d = new Date(ws + 'T00:00:00');
  return `Semaine du ${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
}

/* ─── Modal : planning déjà existant ──────────────────────────────────────── */
function ExistingPlanningModal({ weekLabel, onView, onCreateNext, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-text-light hover:text-text transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Calendar size={20} />
          </span>
          <h2 className="font-display text-lg text-text">Planning déjà existant</h2>
        </div>

        <p className="text-sm text-text-light leading-relaxed mb-6">
          Tu as déjà un planning pour la <strong className="text-text">{weekLabel}</strong>.
          Tu peux le consulter pour le modifier, ou créer un nouveau planning pour la semaine suivante.
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
          >
            <Eye size={16} />
            Voir / modifier mon planning
          </button>
          <button
            type="button"
            onClick={onCreateNext}
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full bg-white border border-border text-sm font-medium text-text hover:border-text transition-colors shadow-sm"
          >
            <ArrowRight size={16} />
            Créer pour la semaine prochaine
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlanningFunnel() {
  usePageMeta({
    title: 'Planning repas végétarien sportif en 2 minutes',
    description: 'Crée ton planning végétarien sportif en 2 minutes. Ajuste les portions, suis tes macros, génère ta liste de courses et exporte vers ton calendrier.',
    canonical: canonicalUrl('/planning'),
  });

  const { user, savePlanning, savedPlannings, loading: authLoading } = useAuth();
  const { recipes } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [showExistingModal, setShowExistingModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const currentPlanning = useMemo(() => getPlanningForCurrentWeek(savedPlannings), [savedPlannings]);
  const getRecipe = (id) => recipes.find((r) => r.id === id);

  // Meals done tracking (localStorage)
  const mealsDoneKey = `vegeprot_meals_done_${user?.id || 'anon'}`;
  const [mealsDone, setMealsDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(mealsDoneKey) || '{}'); } catch { return {}; }
  });
  const currentPlanningId = currentPlanning?.id ?? (currentPlanning ? `local-${(currentPlanning.weekStart || currentPlanning.date || '').replace(/\//g, '-')}` : null);
  const mealsDoneMap = currentPlanningId ? (mealsDone[currentPlanningId] || {}) : {};
  const toggleMealDone = (day, mealTypeId) => {
    const key = `${day}-${mealTypeId}`;
    const next = {
      ...mealsDone,
      [currentPlanningId]: { ...(mealsDone[currentPlanningId] || {}), [key]: !mealsDone[currentPlanningId]?.[key] },
    };
    setMealsDone(next);
    try { localStorage.setItem(mealsDoneKey, JSON.stringify(next)); } catch {}
  };

  const currentWeekStart = useMemo(() => getWeekStart(new Date()), []);
  const hasCurrentWeekPlanning = useMemo(
    () => savedPlannings?.some((p) => p.weekStart === currentWeekStart),
    [savedPlannings, currentWeekStart],
  );

  const handleCreateClick = (e) => {
    if (hasCurrentWeekPlanning) {
      e.preventDefault();
      setShowExistingModal(true);
    }
    // sinon, laisse le <Link> naviguer normalement
  };

  const [showPlanningEditor, setShowPlanningEditor] = useState(() => {
    if (location.state?.setupPreview) return true;
    // Restaurer le planning guest depuis la session (après refresh)
    // Ne pas restaurer pour un user connecté (il a ses plannings en BDD)
    if (user) return false;
    try {
      const raw = sessionStorage.getItem('planning_preview_v1');
      if (raw) {
        const saved = JSON.parse(raw);
        const ts = Number(saved?.ts) || 0;
        if (ts && Date.now() - ts < 1000 * 60 * 60 * 24) return true;
      }
    } catch {}
    return false;
  });
  const [searchParams] = useSearchParams();
  const mineMode = searchParams.get('mine') === '1';

  useLayoutEffect(() => {
    if (location.state?.setupPreview) setShowPlanningEditor(true);
  }, [location.state?.setupPreview]);

  // Attendre le chargement des plannings avant de décider quoi afficher
  if (mineMode && user && authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (mineMode && user && currentPlanning && !showEditor) {
    return (
      <div className="px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 gap-4">
            <h1 className="text-xs uppercase tracking-[0.2em] text-primary inline-flex items-center gap-2 whitespace-nowrap">
              <Calendar size={13} className="flex-shrink-0" />
              Semaine en cours
            </h1>
            <button
              type="button"
              onClick={() => setShowEditor(true)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-primary hover:text-primary-dark font-medium transition-colors whitespace-nowrap"
            >
              <Pencil size={13} className="flex-shrink-0" />
              Modifier le planning
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-2">
              <RepasDuMoment
                planning={currentPlanning}
                getRecipe={getRecipe}
                planningId={currentPlanningId}
                mealsDoneMap={mealsDoneMap}
                onToggleDone={toggleMealDone}
              />
            </div>
            <div className="lg:col-span-3">
              <SuiviApportsChart
                planning={currentPlanning}
                getRecipe={getRecipe}
                portions={2}
                mealsDoneMap={mealsDoneMap}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  // User connecté en mineMode mais sans planning → rediriger vers la création
  if (mineMode && user && !currentPlanning && !showEditor) {
    return (
      <div className="px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto text-center">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-5">
            <Calendar size={24} />
          </span>
          <h1 className="font-display text-2xl text-text mb-2">Pas encore de planning</h1>
          <p className="text-sm text-text-light mb-6">
            Crée ton premier planning personnalisé en quelques minutes.
          </p>
          <Link
            to="/planning/setup"
            onClick={handleCreateClick}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
          >
            Créer mon planning
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }
  if (showEditor) {
    return <Planning user={user} savePlanning={savePlanning} />;
  }
  if (showPlanningEditor) {
    return <Planning user={user} savePlanning={savePlanning} />;
  }

  const previewRecipes = recipes.filter((r) => r.image && r.protein > 0).slice(0, 4);

  return (
    <div className="overflow-x-hidden">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-warm via-bg to-primary/5" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/6 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left : Copy */}
            <div className="max-w-xl">
              <p className="font-accent text-xs uppercase tracking-[0.2em] text-primary mb-4">
                Programme alimentaire végétarien
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-text leading-[1.08] tracking-tight">
                Mange végé,{' '}
                <span className="text-primary">performe</span>{' '}
                mieux.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-text-light leading-relaxed">
                Des repas végétariens gourmands, calculés pour tes macros, prêts en un clic.
                Génère ton planning personnalisé en 2 minutes et cuisine sans stress.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/planning/setup"
                  onClick={handleCreateClick}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                >
                  Créer mon planning
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/recettes"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white border border-border text-sm font-medium rounded-full text-text hover:border-text transition-colors shadow-sm"
                >
                  Voir les recettes
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {['Personnalisé', '100 % gratuit', 'En 2 minutes'].map((tag) => (
                  <span key={tag} className="flex items-center gap-2 text-xs text-text-light font-accent">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right : Planning preview card */}
            <PlanningPreview recipes={previewRecipes} />
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES / AVANTAGES ═══════════════ */}
      <section className="relative py-20 lg:py-28 bg-bg-warm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="recipe-section-title">Avantages</p>
            <div className="deco-wave mx-auto mb-5" />
            <h2 className="font-display text-3xl sm:text-4xl text-text">
              Tout ce dont tu as besoin, rien de superflu
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard icon={Target} title="Macros sur mesure">
              Chaque repas est calibré selon ton objectif : prise de masse, sèche ou maintien. Tu vois les protéines, glucides et lipides en un coup d'œil.
            </FeatureCard>
            <FeatureCard icon={Clock} title="Gain de temps">
              Plus besoin de chercher quoi manger. Ton planning est prêt en 2 minutes, avec des recettes simples et rapides à préparer.
            </FeatureCard>
            <FeatureCard icon={ShoppingCart} title="Liste de courses auto">
              Fini les oublis au supermarché. Ta liste est générée automatiquement, organisée par rayon, prête à suivre.
            </FeatureCard>
            <FeatureCard icon={TrendingUp} title="Objectifs atteints">
              Ajuste les portions par repas (×0.5 à ×2) pour coller parfaitement à tes besoins. Tu gardes le contrôle.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* ═══════════════ COMMENT ÇA MARCHE ═══════════════ */}
      <section className="relative py-20 lg:py-28">
        {/* Subtle decorative blobs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="recipe-section-title">Comment ça marche</p>
            <div className="deco-wave mx-auto mb-5" />
            <h2 className="font-display text-3xl sm:text-4xl text-text">
              3 étapes, 2 minutes, 0 prise de tête
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 relative">
            {/* Connector lines (desktop) */}
            <div className="hidden md:block absolute top-7 left-1/6 right-1/6 h-px bg-border" aria-hidden="true" />

            <StepCard number="1" title="Dis-nous tout">
              Objectif sportif, régime alimentaire, poids, nombre de repas…
              On te pose les bonnes questions pour personnaliser ton planning.
            </StepCard>
            <StepCard number="2" title="On génère, tu ajustes">
              Mamie te prépare une semaine complète de recettes.
              Tu peux modifier les portions, échanger des plats, tout adapter.
            </StepCard>
            <StepCard number="3" title="Tu cuisines sans stress">
              Chaque repas est détaillé : ingrédients, étapes, macros.
              Ta liste de courses est prête. Tu n'as plus qu'à enfiler ton tablier.
            </StepCard>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA FINAL ═══════════════ */}
      <section className="relative bg-text text-white py-24 lg:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 mb-6">
            <Leaf size={18} className="text-secondary-light" />
            <span className="font-accent text-xs uppercase tracking-[0.2em] text-white/50">
              Prêt à passer à table ?
            </span>
          </span>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
            Ton programme végétarien{' '}
            <span className="text-primary-light">sur mesure</span>{' '}
            t'attend
          </h2>

          <p className="mt-6 text-base text-white/55 leading-relaxed max-w-xl mx-auto">
            Prise de masse, sèche ou endurance, peu importe ton objectif, on a les recettes.
            Crée ton planning en quelques clics et commence dès cette semaine.
          </p>

          <div className="mt-10">
            <Link
              to="/planning/setup"
              onClick={handleCreateClick}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white text-base font-medium rounded-full hover:bg-primary-light transition-colors shadow-lg shadow-primary/30"
            >
              Créer mon planning gratuitement
              <ArrowRight size={18} />
            </Link>
          </div>

          <p className="mt-4 text-sm text-white/35 font-accent">
            Sans engagement · Gratuit · Tes données restent privées
          </p>
        </div>
      </section>

      {/* ═══════════════ MODAL PLANNING EXISTANT ═══════════════ */}
      {showExistingModal && (
        <ExistingPlanningModal
          weekLabel={formatWeekLabel(currentWeekStart)}
          onView={() => {
            setShowExistingModal(false);
            navigate('/planning?mine=1');
          }}
          onCreateNext={() => {
            setShowExistingModal(false);
            navigate('/planning/setup', { state: { targetWeekStart: getNextWeekStart() } });
          }}
          onClose={() => setShowExistingModal(false)}
        />
      )}
    </div>
  );
}
