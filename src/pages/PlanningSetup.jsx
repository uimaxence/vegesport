import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Check, ChevronRight, ChevronLeft, Flame, Heart, Loader2, Lock, LockOpen, Plus, Sparkles, Trash2, TrendingUp, Users } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { canonicalUrl } from '../lib/seo';
import { defaultPlannings, days, mealTypes } from '../data/plannings';
import { objectives, regimes } from '../data/recipes';
import { APPETITE_OPTIONS, appetiteToFactor, totalFactor } from '../lib/household';
import HouseholdEditor from '../components/HouseholdEditor';

const MAMIE_CUISINE_SVG_SRC = '/images/mamie%20cuisine.svg';

/* ─── Stepper horizontal ──────────────────────────────────────────────────── */
function StepIndicator({ step, previewUnlocked }) {
  const effective = previewUnlocked ? 4 : step;
  const steps = ['Ton profil', 'Ton foyer', 'Génération'];

  return (
    <nav className="flex items-start mb-5" aria-label="Étapes">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = effective > n;
        const active = effective === n;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-300 ${
                  done
                    ? 'bg-secondary border-secondary text-white'
                    : active
                      ? 'bg-primary border-primary text-white shadow-md shadow-primary/25'
                      : 'bg-bg border-border text-text-light'
                }`}
              >
                {done ? <Check size={14} strokeWidth={2.5} /> : n}
              </div>
              <span
                className={`text-[11px] font-accent tracking-wide whitespace-nowrap transition-colors ${
                  active ? 'text-text font-semibold' : done ? 'text-secondary' : 'text-text-light'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 mt-[-20px] rounded-full transition-colors duration-500 ${
                  effective > n ? 'bg-secondary/50' : effective === n ? 'bg-primary/20' : 'bg-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

/* ─── Profile recap (sidebar step 2) ─────────────────────────────────────── */
function ProfileRecap({ objective, regime, niveau, poids, mealsPerDay, household }) {
  const objLabel = objectives.find((o) => o.id === objective)?.label ?? objective;
  const regLabel = regimes.find((r) => r.id === regime)?.label ?? regime;
  const niveauLabel = { debutant: 'Débutant', amateur: 'Amateur', confirme: 'Confirmé' }[niveau] ?? niveau;
  const foyerLabel = household.length === 1
    ? 'Juste toi'
    : `${household.length} pers.`;

  const rows = [
    { label: 'Objectif', value: objLabel },
    { label: 'Régime', value: regLabel },
    { label: 'Niveau', value: niveauLabel },
    { label: 'Poids', value: `${poids} kg` },
    { label: 'Repas / jour', value: mealsPerDay },
    { label: 'Foyer', value: foyerLabel },
  ];

  return (
    <div className="rounded-xl bg-bg-warm border border-border p-5">
      <p className="text-xs font-accent uppercase tracking-[0.15em] text-text-light mb-3">Ton profil</p>
      <ul className="space-y-2">
        {rows.map(({ label, value }) => (
          <li key={label} className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-light">{label}</span>
            <span className="text-xs font-medium text-text">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RequiredHint({ show }) {
  if (!show) return null;
  return (
    <p className="mt-3 text-xs text-red-500 flex items-center gap-1.5">
      <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
      Renseigne les champs obligatoires pour continuer.
    </p>
  );
}

/* ─── Objective cards (UX #1) ─────────────────────────────────────────────── */
const OBJECTIVE_OPTIONS = [
  { id: 'masse',     label: 'Prise de masse', icon: TrendingUp, hint: 'Surplus calorique, gain musculaire' },
  { id: 'seche',     label: 'Sèche',          icon: Flame,      hint: 'Déficit calorique, maintien musculaire' },
  { id: 'endurance', label: 'Endurance',      icon: Activity,   hint: 'Carburant long effort, récupération' },
  { id: 'sante',     label: 'Santé',          icon: Heart,      hint: 'Alimentation équilibrée au quotidien' },
];

function ObjectiveCards({ value, onChange, showValidation }) {
  const invalid = showValidation && !value;
  return (
    <div className="sm:col-span-2">
      <label className="planning-filter-label">Objectif *</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {OBJECTIVE_OPTIONS.map(({ id, label, icon: Icon, hint }) => {
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`relative flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                selected
                  ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                  : invalid
                    ? 'border-red-200 bg-red-50/20 hover:border-primary/30 hover:bg-white'
                    : 'border-border bg-bg-warm hover:border-primary/30 hover:bg-white'
              }`}
            >
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                selected ? 'bg-primary text-white' : 'bg-border/60 text-text-light'
              }`}>
                <Icon size={17} />
              </span>
              <span className={`text-sm font-medium leading-snug ${selected ? 'text-primary' : 'text-text'}`}>
                {label}
              </span>
              <span className="text-[11px] text-text-light leading-snug">{hint}</span>
              {selected && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                  <Check size={9} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {invalid && (
        <p className="mt-1.5 text-xs text-red-500">Choisis un objectif pour continuer.</p>
      )}
    </div>
  );
}

export default function PlanningSetup() {
  usePageMeta({
    title: 'Configurer mon planning — en 2 minutes',
    description: 'Configure ton planning (objectif, niveau, poids, régime), puis génère une semaine de repas personnalisés.',
    canonical: canonicalUrl('/planning/setup'),
    noindex: true,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const targetWeekStart = location.state?.targetWeekStart || null;
  const { recipes: recipesList } = useData();
  const { user, householdMembers: dbHousehold } = useAuth();

  const [step, setStep] = useState(1);

  // Inputs vides au début (obligatoire)
  const [objective, setObjective] = useState('');
  const [regime, setRegime] = useState('');
  const [niveau, setNiveau] = useState('');
  const [poids, setPoids] = useState('');
  const [mealsPerDay, setMealsPerDay] = useState('');
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAppetite, setNewMemberAppetite] = useState('moyen');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const showValidation = step === 1 && hasAttemptedSubmit;

  const [planning, setPlanning] = useState(defaultPlannings.masse.meals);
  const [mealMultipliers, setMealMultipliers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0); // 0..2
  const [generationProgress, setGenerationProgress] = useState(0); // 0..100
  const [generationDotsIndex, setGenerationDotsIndex] = useState(0); // 0..3
  const [previewUnlocked, setPreviewUnlocked] = useState(false);
  const generationRunIdRef = useRef(0);
  const generationIntervalRef = useRef(null);
  const generationTimeoutRef = useRef(null);
  const step2AutoGenStartedRef = useRef(false);

  const cancelGenerationTimers = useCallback(() => {
    if (generationIntervalRef.current != null) {
      window.clearInterval(generationIntervalRef.current);
      generationIntervalRef.current = null;
    }
    if (generationTimeoutRef.current != null) {
      window.clearTimeout(generationTimeoutRef.current);
      generationTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    cancelGenerationTimers();
    generationRunIdRef.current += 1;
  }, [cancelGenerationTimers]);

  // Construit le foyer complet :
  // – connecté → foyer depuis la BDD (inclut déjà l'owner)
  // – guest   → owner implicite + membres locaux
  const fullHousehold = useMemo(() => {
    if (user && dbHousehold?.length > 0) return dbHousehold;
    const owner = {
      name: 'Moi',
      appetite: 'moyen',
      size_factor: 1.0,
      is_owner: true,
    };
    return [owner, ...householdMembers];
  }, [user, dbHousehold, householdMembers]);

  const addMember = useCallback(() => {
    const name = newMemberName.trim();
    if (!name) return;
    setHouseholdMembers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        appetite: newMemberAppetite,
        size_factor: appetiteToFactor(newMemberAppetite),
        is_owner: false,
      },
    ]);
    setNewMemberName('');
    setNewMemberAppetite('moyen');
  }, [newMemberName, newMemberAppetite]);

  const removeMember = useCallback((id) => {
    setHouseholdMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const isProfileValid = useMemo(() => {
    const w = Number(poids);
    const mpd = Number(mealsPerDay);
    return (
      !!objective &&
      !!regime &&
      !!niveau &&
      Number.isFinite(w) &&
      w >= 40 &&
      w <= 170 &&
      Number.isFinite(mpd) &&
      (mpd === 3 || mpd === 4)
    );
  }, [objective, regime, niveau, poids, mealsPerDay]);

  const preferencesPayload = useMemo(() => ({
    objective,
    niveau,
    poids: Number(poids) || 70,
    regime,
    meals_per_day: Number(mealsPerDay) || 4,
    portions: Math.round(totalFactor(fullHousehold)),
  }), [objective, niveau, poids, regime, mealsPerDay, fullHousehold]);

  const generatePlanning = useCallback(() => {
    cancelGenerationTimers();
    const runId = ++generationRunIdRef.current;

    setPreviewUnlocked(false);
    setIsGenerating(true);
    setGenerationStage(0);
    setGenerationProgress(0);
    setGenerationDotsIndex(0);

    const DURATION_MS = 4500;
    const STAGE_1_MS = 1500;
    const STAGE_2_MS = 3000;

    const startedAt = Date.now();
    generationIntervalRef.current = window.setInterval(() => {
      if (generationRunIdRef.current !== runId) return;
      const elapsed = Date.now() - startedAt;
      const progress = Math.max(0, Math.min(100, Math.round((elapsed / DURATION_MS) * 100)));
      setGenerationProgress(progress);

      if (elapsed < STAGE_1_MS) setGenerationStage(0);
      else if (elapsed < STAGE_2_MS) setGenerationStage(1);
      else setGenerationStage(2);

      setGenerationDotsIndex(Math.floor(elapsed / 450) % 4);
    }, 120);

    generationTimeoutRef.current = window.setTimeout(() => {
      if (generationRunIdRef.current !== runId) return;
      cancelGenerationTimers();

      const list = recipesList || [];
      const usedIds = new Set();
      const newPlanning = {};
      days.forEach((day) => {
        newPlanning[day] = {};
        mealTypes.forEach((mt) => {
          let pool = list.filter((r) => {
            if (r.category !== mt.id) return false;
            if (!r.objective?.includes(objective)) return false;
            if (regime !== 'vegetarien' && !r.regime?.includes(regime)) return false;
            return true;
          });
          if (pool.length === 0) pool = list.filter((r) => r.category === mt.id && r.objective?.includes(objective));
          if (pool.length === 0) pool = list.filter((r) => r.category === mt.id);
          if (pool.length === 0) {
            newPlanning[day][mt.id] = null;
            return;
          }
          const fresh = pool.filter((r) => !usedIds.has(r.id));
          const candidates = fresh.length > 0 ? fresh : pool;
          const picked = candidates[Math.floor(Math.random() * candidates.length)];
          newPlanning[day][mt.id] = picked.id;
          usedIds.add(picked.id);
        });
      });
      setPlanning(newPlanning);
      setMealMultipliers({});
      setIsGenerating(false);
      setGenerationProgress(100);
      setPreviewUnlocked(true);
    }, DURATION_MS);
  }, [objective, regime, recipesList, cancelGenerationTimers]);

  useEffect(() => {
    if (step !== 3) {
      step2AutoGenStartedRef.current = false;
      return;
    }
    if (step2AutoGenStartedRef.current) return;
    step2AutoGenStartedRef.current = true;
    const t = window.setTimeout(() => {
      generatePlanning();
    }, 0);
    return () => window.clearTimeout(t);
  }, [step, generatePlanning]);

  const goNext = () => {
    if (step === 1) {
      setHasAttemptedSubmit(true);
      if (!isProfileValid) return;
      setStep(2);
    } else if (step === 2) {
      setPreviewUnlocked(false);
      setStep(3);
    }
  };

  const openPlanningPreview = () => {
    if (!previewUnlocked || isGenerating) return;
    sessionStorage.setItem('planning_confetti_pending', '1');
    navigate('/planning', {
      state: {
        setupPreview: {
          planning: { ...planning },
          mealMultipliers: { ...mealMultipliers },
          objective,
          niveau,
          regime,
          poids: preferencesPayload.poids,
          mealsPerDay: preferencesPayload.meals_per_day,
          portions: preferencesPayload.portions,
          household: fullHousehold,
          targetWeekStart,
        },
      },
    });
  };

  const goPrev = () => {
    if (step === 3) {
      generationRunIdRef.current += 1;
      cancelGenerationTimers();
      setIsGenerating(false);
      setGenerationStage(0);
      setGenerationProgress(0);
      setGenerationDotsIndex(0);
      setPreviewUnlocked(false);
    }
    setStep((s) => Math.max(1, s - 1));
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="flex-1 px-6 lg:px-8 py-6 lg:py-10">
        <div className="max-w-6xl mx-auto">

          {/* ─── Top bar ─────────────────────────────────────────────── */}
          <div className="mb-10">
            <Link
              to="/planning"
              className="inline-flex items-center gap-1.5 text-sm text-text-light hover:text-text transition-colors"
            >
              <ChevronLeft size={15} />
              Retour
            </Link>
            <p className="text-xs font-accent uppercase tracking-[0.2em] text-text-light text-center mt-4">
              Planning en 2 minutes
            </p>
          </div>

          {/* ─── Main card ───────────────────────────────────────────── */}
          <section className="rounded-[2rem] border border-border bg-white p-5 sm:p-7 lg:p-8 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:items-start">

              {/* ── Sidebar ─────────────────────────────────────────── */}
              <aside className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-24">
                {step === 1 && (
                  <div className="rounded-xl bg-bg-warm border border-border p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Sparkles size={11} />
                      </span>
                      <p className="text-xs font-accent font-semibold text-text">Astuce</p>
                    </div>
                    <p className="text-xs text-text-light leading-relaxed">
                      Après la génération, ouvre l'aperçu complet. Pour sauvegarder ton planning, crée ton compte — tu seras redirigé directement vers ton profil.
                    </p>
                  </div>
                )}
                {(step === 2 || step === 3) && (
                  <ProfileRecap
                    objective={objective}
                    regime={regime}
                    niveau={niveau}
                    poids={poids}
                    mealsPerDay={mealsPerDay}
                    household={fullHousehold}
                  />
                )}
              </aside>

              {/* ── Content ─────────────────────────────────────────── */}
              <div className="lg:col-span-9 flex flex-col min-h-0">

                {/* Stepper */}
                <StepIndicator step={step} previewUnlocked={previewUnlocked} />

                {/* ── Step 1 : Profil ─────────────────────────────── */}
                {step === 1 && (
                  <>
                    <div className="mb-4">
                      <h1 className="font-display text-xl sm:text-2xl text-text mb-1.5">
                        On commence par ton profil
                      </h1>
                      <p className="text-sm text-text-light">
                        Renseigne tes infos : on adapte les macros et la génération à ton objectif.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      <ObjectiveCards value={objective} onChange={setObjective} showValidation={showValidation} />
                      <FieldSelect label="Régime" value={regime} onChange={setRegime} required showValidation={showValidation}>
                        <option value="" disabled>Choisir…</option>
                        <option value="vegetarien">Végétarien (toutes recettes)</option>
                        {regimes.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                      </FieldSelect>
                      <FieldSelect label="Niveau sportif" value={niveau} onChange={setNiveau} required showValidation={showValidation}>
                        <option value="" disabled>Choisir…</option>
                        <option value="debutant">Débutant</option>
                        <option value="amateur">Amateur</option>
                        <option value="confirme">Confirmé</option>
                      </FieldSelect>
                      <FieldNumber label="Poids (kg)" value={poids} onChange={setPoids} required showValidation={showValidation} placeholder="ex : 70" />
                      <FieldSegment
                        label="Repas par jour"
                        value={mealsPerDay}
                        onChange={setMealsPerDay}
                        options={[
                          { value: 3, label: '3 repas' },
                          { value: 4, label: '4 repas' },
                        ]}
                        required
                        showValidation={showValidation}
                      />
                    </div>
                    <RequiredHint show={showValidation && !isProfileValid} />
                  </>
                )}

                {/* ── Step 2 : Ton foyer ─────────────────────────── */}
                {step === 2 && (
                  <>
                    <div className="mb-8">
                      <h2 className="font-display text-xl sm:text-2xl text-text mb-3">
                        Tu cuisines pour d'autres personnes ?
                      </h2>
                      <p className="text-sm text-text-light leading-relaxed">
                        Tes macros et quantités sont déjà calculées pour <strong className="text-text">toi</strong> grâce à ton profil.
                      </p>
                      <p className="text-sm text-text-light leading-relaxed mt-2">
                        Si tu cuisines aussi pour d'autres personnes, ajoute-les ici : les quantités d'ingrédients seront adaptées pour tout le foyer.
                      </p>
                    </div>

                    {user ? (
                      /* ── Connecté : foyer BDD via HouseholdEditor ── */
                      <HouseholdEditor compact />
                    ) : (
                      /* ── Guest : formulaire local ── */
                      <>
                        {householdMembers.length > 0 && (
                          <ul className="space-y-2.5 mb-5">
                            {householdMembers.map((m) => (
                              <li key={m.id} className="flex items-center gap-3 rounded-xl border border-border bg-bg-warm px-4 py-3">
                                <span className="text-sm font-medium text-text flex-1 truncate">{m.name}</span>
                                <span className="text-xs text-text-light px-2 py-0.5 rounded-md bg-white border border-border capitalize">{m.appetite}</span>
                                <button
                                  type="button"
                                  onClick={() => removeMember(m.id)}
                                  className="p-1 text-text-light hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="rounded-xl border border-border bg-bg-warm/50 p-5 space-y-4">
                          <p className="text-xs font-accent font-medium text-text flex items-center gap-1.5">
                            <Users size={13} className="text-text-light" />
                            Ajouter une personne
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newMemberName}
                              onChange={(e) => setNewMemberName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && addMember()}
                              placeholder="Prénom"
                              className="flex-1 min-w-0 text-sm bg-white border border-border rounded-[10px] px-3 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                            />
                            <select
                              value={newMemberAppetite}
                              onChange={(e) => setNewMemberAppetite(e.target.value)}
                              className="text-sm bg-white border border-border rounded-[10px] px-2 py-2.5 text-text"
                            >
                              {APPETITE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label} mangeur</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={addMember}
                              disabled={!newMemberName.trim()}
                              className="p-2.5 rounded-[10px] bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-40"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <p className="text-[11px] text-text-light">
                            Petit = 70 % · Moyen = 100 % · Grand = 140 % des quantités d'ingrédients.
                          </p>
                        </div>

                        {householdMembers.length === 0 && (
                          <p className="mt-4 text-xs text-text-light italic">
                            Aucun membre ajouté — les quantités seront calculées pour toi seul.
                            Tu peux passer cette étape.
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* ── Step 3 : Génération ─────────────────────────── */}
                {step === 3 && (
                  <div className="flex-1 flex flex-col items-center justify-center py-8 gap-6">
                    {/* Mascot */}
                    <div className="w-20 h-20 rounded-2xl bg-bg-warm border border-border overflow-hidden flex items-center justify-center">
                      <img
                        src={MAMIE_CUISINE_SVG_SRC}
                        alt=""
                        className="w-16 h-16 object-contain"
                        aria-hidden="true"
                      />
                    </div>

                    {/* Single animated sentence */}
                    <p className="text-base font-medium text-text text-center min-h-[1.5rem]">
                      {previewUnlocked
                        ? 'Ton planning est prêt !'
                        : [
                            'Mamie chauffe les fours',
                            'On sélectionne tes recettes',
                            'On finalise ta semaine',
                          ][generationStage]
                      }
                      {!previewUnlocked && (
                        <span className="inline-block tabular-nums text-primary w-5 text-left">
                          {'.'.repeat(generationDotsIndex)}
                        </span>
                      )}
                    </p>

                    {/* Progress bar */}
                    <div className="w-full max-w-xs">
                      <div className="h-1.5 rounded-full bg-border/50 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-[width] duration-200 ease-out"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-text-light text-center mt-2">{generationProgress}%</p>
                    </div>
                  </div>
                )}

                {/* ── Navigation ──────────────────────────────────── */}
                <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-border/60">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={step === 1}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border text-sm text-text-light hover:text-text hover:border-text/30 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ChevronLeft size={16} />
                    Retour
                  </button>
                  {(step === 1 || step === 2) && (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={step === 1 && !isProfileValid}
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-75 disabled:cursor-not-allowed disabled:pointer-events-none shadow-sm shadow-primary/20"
                    >
                      {step === 2 ? 'Générer mon planning' : 'Continuer'}
                      <ChevronRight size={16} />
                    </button>
                  )}
                  {step === 3 && (
                    <button
                      type="button"
                      onClick={openPlanningPreview}
                      disabled={isGenerating || !previewUnlocked}
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-75 disabled:cursor-not-allowed disabled:pointer-events-none shadow-sm shadow-primary/20"
                    >
                      {isGenerating ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : previewUnlocked ? (
                        <LockOpen size={16} />
                      ) : (
                        <Lock size={16} />
                      )}
                      {isGenerating ? 'On prépare…' : previewUnlocked ? 'Voir mon planning' : 'Patience…'}
                      {!isGenerating && <ChevronRight size={16} />}
                    </button>
                  )}
                </div>

              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="px-6 lg:px-8 pb-8">
        <p className="text-xs text-text-light text-center">
          En continuant, tu acceptes nos{' '}
          <Link to="/mentions-legales" className="text-primary hover:underline">mentions légales</Link>.
        </p>
      </div>
    </div>
  );
}

/* ─── Field components ────────────────────────────────────────────────────── */

function FieldSelect({ label, value, onChange, required, showValidation, children }) {
  const invalid = required && showValidation && !value;
  return (
    <div>
      <label className="planning-filter-label">{label}{required ? ' *' : ''}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`planning-filter-input w-full appearance-none bg-[rgb(0,0,0,0.04)] border rounded-[10px] px-4 py-2.5 text-text pr-10 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-colors ${
            invalid ? 'border-red-300 bg-red-50/30' : 'border-transparent'
          }`}
        >
          {children}
        </select>
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-light pointer-events-none text-xs">▾</span>
      </div>
    </div>
  );
}

function FieldNumber({ label, value, onChange, required, showValidation, placeholder }) {
  const invalid = required && showValidation && !value;
  return (
    <div>
      <label className="planning-filter-label">{label}{required ? ' *' : ''}</label>
      <input
        type="number"
        min={40}
        max={170}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`planning-filter-input w-full bg-[rgb(0,0,0,0.04)] border rounded-[10px] px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-colors ${
          invalid ? 'border-red-300 bg-red-50/30' : 'border-transparent'
        }`}
      />
    </div>
  );
}

function FieldSegment({ label, value, onChange, options, required, showValidation }) {
  const invalid = required && showValidation && !value;
  return (
    <div>
      <label className="planning-filter-label">{label}{required ? ' *' : ''}</label>
      <div className={`segment-group segment-group--compact ${invalid ? 'ring-2 ring-red-200' : ''}`}>
        {options.map((opt) => {
          const v = typeof opt === 'object' ? opt.value : opt;
          const l = typeof opt === 'object' ? opt.label : opt;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(String(v))}
              className={`segment-item ${String(value) === String(v) ? 'is-selected' : ''}`}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}
