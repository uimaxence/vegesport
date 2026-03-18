import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Flame, Heart, Users, ChefHat, X, Check, Share2, Copy } from 'lucide-react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { getSlug } from '../lib/slug';
import RecipeCard from '../components/RecipeCard';
import RecipeComments from '../components/RecipeComments';

function parseIngredient(ing) {
  const s = ing.trim();
  const parts = s.split(/\s+/);
  if (parts.length === 0) return { qty: '', name: s };
  let i = 0;
  let qty = '';
  if (parts[0].match(/^\d/)) {
    qty = parts[0];
    i = 1;
    if (parts[1] === 'c.à.s' || parts[1] === 'c.à.c') {
      qty += ' ' + parts[1];
      i = 2;
    } else if (parts[1] === 'g' || parts[1] === 'ml' || parts[1] === 'cl') {
      qty += parts[1];
      i = 2;
    }
  }
  const name = parts.slice(i).join(' ').trim();
  return { qty, name: name || s };
}

/** Met à l'échelle la quantité d'un ingrédient (ex. "80g flocons" -> "160g flocons" pour ratio 2). */
function scaleIngredient(ing, ratio) {
  if (ratio === 1) return ing;
  const parsed = parseIngredient(ing);
  if (!parsed.qty) return ing;
  const match = parsed.qty.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return ing;
  const num = parseFloat(match[1].replace(',', '.'));
  const unit = match[2].trim();
  const scaled = num * ratio;
  const formatted = scaled % 1 === 0 ? String(Math.round(scaled)) : scaled.toFixed(1).replace('.', ',');
  const newQty = unit ? `${formatted} ${unit}` : formatted;
  return (newQty + ' ' + parsed.name).trim();
}

/** Ingrédients qu'on a souvent dans le placard / frigo (sel, poivre, épices, huile…). */
function isCommonPantry(ingredientName) {
  const lower = (ingredientName || '').toLowerCase();
  const common = [
    'sel', 'poivre', 'pâtes', 'pates', 'riz', 'oignon', 'oignons', 'ail', 'huile', 'farine',
    'sucre', 'vinaigre', 'moutarde', 'paprika', 'curry', 'cumin', 'curcuma', 'origan',
    'basilic', 'persil', 'thym', 'laurier', 'piment', 'cannelle', 'muscade', 'levure',
    'bicarbonate', 'maïzena', 'cornichon', 'câpres', 'olive', 'tomate séchée', 'confiture',
    'miel', 'sirop', 'sauce soja', 'tahini', 'bouillon', 'lait', 'crème', 'beurre',
    'œuf', 'oeuf', 'pain', 'tortilla', 'quinoa', 'avoine', 'lentille', 'pois chiche',
    'haricot', 'noix', 'amande', 'cacahuète', 'cacao', 'chocolat', 'coriandre'
  ];
  return common.some(term => lower.includes(term));
}

// ─── Timer ───────────────────────────────────────────────────────────────────

function detectTimerFromStep(text) {
  if (!text) return null;
  const m = text.match(/(\d+)\s*(?:[-\u2013\u00e0]\s*\d+\s*)?(secondes?|sec\b|minutes?|mins?\b|mn\b|heures?|h\b)/i);
  if (!m) return null;
  const value = parseInt(m[1], 10);
  const unit = m[2].toLowerCase().trim();
  let seconds;
  if (/^sec|^s/.test(unit)) seconds = value;
  else if (/^(min|mn)/.test(unit)) seconds = value * 60;
  else if (/^h/.test(unit)) seconds = value * 3600;
  else return null;
  if (seconds < 10 || seconds > 10800) return null;
  const unitLabel = /^h/.test(unit) ? 'h' : /^sec|^s/.test(unit) ? 's' : 'min';
  return { seconds, label: `${value}\u202f${unitLabel}` };
}

function formatTimer(s) {
  if (s <= 0) return '0:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function CookingTimerIsland({ timer, expanded, setExpanded, onStop, onAdd, onRemove }) {
  useEffect(() => {
    if (timer?.done) setExpanded(true);
  }, [timer?.done, setExpanded]);

  if (!timer) return null;

  const timeStr = formatTimer(timer.remainingSeconds);
  const progress = timer.totalSeconds > 0 ? timer.remainingSeconds / timer.totalSeconds : 0;
  const rSm = 12;
  const circSm = 2 * Math.PI * rSm;
  const offSm = circSm * (1 - progress);
  const rLg = 46;
  const circLg = 2 * Math.PI * rLg;
  const offLg = circLg * (1 - progress);
  const startedAtStr = timer.startedAt
    ? timer.startedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';
  const accentColor = timer.done ? '#ef4444' : '#f97316';

  return (
    <div
      className={`bg-[#111] border shadow-2xl transition-all duration-300 ease-in-out overflow-hidden select-none ${
        expanded
          ? 'rounded-2xl border-white/25 w-72 sm:w-80'
          : 'rounded-full border-white/20 cursor-pointer'
      }`}
      onClick={() => !expanded && setExpanded(true)}
    >
      {!expanded ? (
        /* ── Compact pill ── */
        <div className="flex items-center gap-2 px-3 py-1.5">
          <svg width="30" height="30" className="-rotate-90 flex-shrink-0">
            <circle cx="15" cy="15" r={rSm} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
            <circle
              cx="15" cy="15" r={rSm} fill="none"
              stroke={accentColor}
              strokeWidth="2.5"
              strokeDasharray={circSm}
              strokeDashoffset={offSm}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className={`text-sm font-mono font-semibold tabular-nums pr-1 ${timer.done ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {timer.done ? 'Pret !' : timeStr}
          </span>
        </div>
      ) : (
        /* ── Expanded island ── */
        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Minuteur</p>
              {timer.label && (
                <p className="text-xs text-white/55 mt-0.5 max-w-[180px] line-clamp-2 leading-tight">{timer.label}</p>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
              className="text-white/30 hover:text-white/70 transition-colors w-7 h-7 flex items-center justify-center text-lg leading-none -mt-1 -mr-1"
            >
              ×
            </button>
          </div>

          {/* Ring */}
          <div className="flex items-center justify-center my-3">
            <div className="relative" style={{ width: 108, height: 108 }}>
              <svg width="108" height="108" className="-rotate-90">
                <circle cx="54" cy="54" r={rLg} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
                <circle
                  cx="54" cy="54" r={rLg} fill="none"
                  stroke={accentColor}
                  strokeWidth="6"
                  strokeDasharray={circLg}
                  strokeDashoffset={offLg}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                <span className={`text-[1.75rem] font-mono font-bold tabular-nums leading-none ${timer.done ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {timer.done ? '0:00' : timeStr}
                </span>
                {startedAtStr && (
                  <span className="text-[10px] text-white/35 tabular-nums">depuis {startedAtStr}</span>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          {!timer.done ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(60); }}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 text-sm font-medium transition-colors"
              >
                −1 min
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onStop(); setExpanded(false); }}
                className="flex-1 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-semibold transition-colors"
              >
                Arreter
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAdd(60); }}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 text-sm font-medium transition-colors"
              >
                +1 min
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onStop(); setExpanded(false); }}
              className="w-full py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-semibold transition-colors"
            >
              Fermer le minuteur
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StepWithQuantities({ stepText, ingredients }) {
  const segments = useMemo(() => {
    const parsed = ingredients.map(ing => parseIngredient(ing)).filter(p => p.name.length > 0);
    parsed.sort((a, b) => b.name.length - a.name.length);
    const result = [];
    let remaining = stepText;
    while (remaining.length > 0) {
      let best = { index: -1, name: '', qty: '', len: 0 };
      for (const { name, qty } of parsed) {
        const idx = remaining.toLowerCase().indexOf(name.toLowerCase());
        if (idx !== -1 && (best.index === -1 || idx < best.index)) {
          best = { index: idx, name, qty, len: name.length };
        }
      }
      if (best.index === -1) {
        result.push({ type: 'text', value: remaining });
        break;
      }
      if (best.index > 0) {
        result.push({ type: 'text', value: remaining.slice(0, best.index) });
      }
      const matchedText = remaining.slice(best.index, best.index + best.len);
      result.push({ type: 'ingredient', name: matchedText, qty: best.qty });
      remaining = remaining.slice(best.index + best.len);
    }
    return result;
  }, [stepText, ingredients]);

  return (
    <p className="font-display text-2xl sm:text-3xl lg:text-4xl text-center text-white max-w-2xl leading-relaxed">
      {segments.map((seg, i) =>
        seg.type === 'text' ? (
          <span key={i}>{seg.value}</span>
        ) : (
          <span key={i}>
            {seg.name}
            {seg.qty && (
              <span className="text-primary text-sm font-sans align-baseline ml-0.5 tabular-nums">
                {' '}{seg.qty}
              </span>
            )}
          </span>
        )
      )}
    </p>
  );
}

export default function RecipeDetail({ favorites, toggleFavorite }) {
  const { slug } = useParams();
  const { recipes, loading, error, getRecipe } = useData();
  const { user } = useAuth();
  const recipe = recipes.find(
    (r) => getSlug(r.title) === slug || String(r.id) === slug
  );
  const [fullRecipe, setFullRecipe] = useState(null);
  const effectiveRecipe = fullRecipe || recipe;
  const [servings, setServings] = useState(effectiveRecipe?.servings || 1);
  const [activeStep, setActiveStep] = useState(null);
  const [cookingMode, setCookingMode] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [ingredientsStepPhase, setIngredientsStepPhase] = useState('pantry'); // 'pantry' | 'rest'
  const [pantryChecked, setPantryChecked] = useState(() => new Set());

  // Timer state (hooks avant tout early return)
  const [timer, setTimer] = useState(null);
  const [timerIslandExpanded, setTimerIslandExpanded] = useState(false);

  const startTimer = useCallback((seconds, label) => {
    setTimer({ totalSeconds: seconds, remainingSeconds: seconds, startedAt: new Date(), label, running: true, done: false });
    setTimerIslandExpanded(false);
  }, []);

  const stopTimer = useCallback(() => {
    setTimer(null);
    setTimerIslandExpanded(false);
  }, []);

  const addTimerTime = useCallback((secs) => {
    setTimer((prev) => prev ? { ...prev, remainingSeconds: prev.remainingSeconds + secs, totalSeconds: prev.totalSeconds + secs } : prev);
  }, []);

  const removeTimerTime = useCallback((secs) => {
    setTimer((prev) => prev ? { ...prev, remainingSeconds: Math.max(0, prev.remainingSeconds - secs) } : prev);
  }, []);

  useEffect(() => {
    if (!timer?.running) return;
    const id = setInterval(() => {
      setTimer((prev) => {
        if (!prev?.running) return prev;
        const remaining = prev.remainingSeconds - 1;
        if (remaining <= 0) {
          try { window.navigator?.vibrate?.([300, 100, 300, 100, 300]); } catch {}
          return { ...prev, remainingSeconds: 0, running: false, done: true };
        }
        return { ...prev, remainingSeconds: remaining };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timer?.running]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-text-light">Chargement…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <p className="text-red-600">Erreur : {error}</p>
      </div>
    );
  }
  if (!recipe) {
    return (
      <div className="px-6 lg:px-8 py-20 text-center">
        <p className="text-text-light">Recette introuvable.</p>
        <Link to="/recettes" className="text-primary text-sm mt-2 inline-block">Retour aux recettes</Link>
      </div>
    );
  }

  useEffect(() => {
    let cancelled = false;
    async function loadFull() {
      if (!recipe?.id) return;
      // En prod, la liste charge un "summary" (steps = null) → on charge le détail ici.
      if (recipe.steps == null) {
        try {
          const full = await getRecipe?.(recipe.id);
          if (!cancelled && full) {
            setFullRecipe(full);
            setServings(full.servings || 1);
          }
        } catch {
          // on garde le summary; l'UI reste fonctionnelle
        }
      } else {
        // Si on a déjà un full (ex. dev/local), on synchronise les servings.
        setServings(recipe.servings || 1);
      }
    }
    loadFull();
    return () => { cancelled = true; };
  }, [recipe?.id, recipe?.steps, recipe?.servings, getRecipe]);

  const steps = effectiveRecipe?.steps ?? [];
  const ingredients = effectiveRecipe?.ingredients ?? [];
  const tags = effectiveRecipe?.tags ?? [];
  const objective = effectiveRecipe?.objective ?? [];

  usePageMeta(effectiveRecipe?.title || recipe.title, steps[0] ? steps[0].slice(0, 155) + '…' : undefined);

  const isFavorite = favorites?.includes(effectiveRecipe?.id ?? recipe.id) ?? false;
  const ratio = servings / ((effectiveRecipe?.servings || recipe.servings) || 1);

  const [shareStatus, setShareStatus] = useState(null); // null | 'copied' | 'shared'

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const title = effectiveRecipe?.title || recipe.title;
    const text = `${title} — recette végétarienne protéinée sur et si mamie était végé ?`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        setShareStatus('shared');
      } catch { /* annulé par l'utilisateur */ }
    } else {
      await navigator.clipboard.writeText(url);
      setShareStatus('copied');
    }
    setTimeout(() => setShareStatus(null), 2500);
  }, [effectiveRecipe?.title, recipe.title]);

  const similar = (recipes ?? []).filter(
    (r) => r.id !== (effectiveRecipe?.id ?? recipe.id) && (r.objective ?? []).some((o) => objective.includes(o))
  ).slice(0, 3);

  const totalSteps = 1 + steps.length;

  // Séparation placard (basiques) / reste (à préparer) pour le mode cuisine
  const { pantryList, restList } = useMemo(() => {
    const pantry = [];
    const rest = [];
    ingredients.forEach((ing, i) => {
      const parsed = parseIngredient(ing);
      const name = parsed.name || ing;
      if (isCommonPantry(name)) {
        pantry.push({ index: i, text: scaleIngredient(ing, ratio) });
      } else {
        rest.push({ index: i, text: scaleIngredient(ing, ratio) });
      }
    });
    return { pantryList: pantry, restList: rest };
  }, [ingredients, ratio]);

  if (cookingMode) {
    const stepIndex = typeof activeStep === 'number' ? activeStep : 0;
    const isIngredientsStep = stepIndex === 0;
    const isPantryPhase = isIngredientsStep && ingredientsStepPhase === 'pantry' && pantryList.length > 0;
    const isRestPhase = isIngredientsStep && (ingredientsStepPhase === 'rest' || pantryList.length === 0);
    const instructionIndex = stepIndex - 1;
    const currentStepText = isIngredientsStep ? '' : (steps[instructionIndex] ?? steps[0]);

    const checked = checkedIngredients.length === ingredients.length
      ? checkedIngredients
      : ingredients.map(() => false);

    const toggleCheck = (i) => {
      setCheckedIngredients(prev => {
        const next = prev.length === ingredients.length ? [...prev] : ingredients.map(() => false);
        next[i] = !next[i];
        return next;
      });
    };

    const togglePantry = (index) => {
      setPantryChecked(prev => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
    };

    const handlePrev = () => {
      if (isRestPhase && pantryList.length > 0) {
        setIngredientsStepPhase('pantry');
      } else if (stepIndex > 0) {
        setActiveStep(stepIndex - 1);
      }
    };

    const handleNext = () => {
      if (isPantryPhase) {
        setIngredientsStepPhase('rest');
      } else if (isRestPhase) {
        setActiveStep(1);
      } else if (stepIndex >= totalSteps - 1) {
        setCookingMode(false);
        setActiveStep(null);
        setCheckedIngredients([]);
        setPantryChecked(new Set());
      } else {
        setActiveStep(stepIndex + 1);
      }
    };

    const stepLabel = isPantryPhase
      ? '1 — Placard'
      : isRestPhase
        ? '2 — À préparer'
        : isIngredientsStep
          ? 'Préparation'
          : `Étape ${stepIndex + 1} sur ${totalSteps}`;
    const bottomCaption = isPantryPhase
      ? 'Cochez ce que vous avez déjà'
      : isRestPhase
        ? 'Préparez et cochez au fur et à mesure'
        : isIngredientsStep
          ? 'Préparez les ingrédients'
          : currentStepText;

    const timerInfo = detectTimerFromStep(currentStepText);

    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1a1a]">
        {/* Top bar: exit + timer island */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 pt-3 pb-2 gap-3">
          <div className="w-8 flex-shrink-0" />
          {/* Dynamic Island (centre) */}
          <div className="flex-1 flex justify-center">
            <CookingTimerIsland
              timer={timer}
              expanded={timerIslandExpanded}
              setExpanded={setTimerIslandExpanded}
              onStop={stopTimer}
              onAdd={addTimerTime}
              onRemove={removeTimerTime}
            />
          </div>
          <button
            onClick={() => { setCookingMode(false); setActiveStep(null); setCheckedIngredients([]); setPantryChecked(new Set()); }}
            className="flex-shrink-0 text-white/60 hover:text-white text-sm flex items-center gap-1.5 py-1.5"
          >
            <X size={16} /> <span className="hidden sm:inline">Quitter</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col items-center justify-center">
          <p className="text-sm uppercase tracking-[0.2em] text-primary-light mb-6">
            {stepLabel}
          </p>

          {isPantryPhase && (
            <>
              <p className="font-display text-2xl sm:text-3xl text-center text-white max-w-xl leading-relaxed mb-2">
                Vous avez déjà ces basiques ?
              </p>
              <p className="text-white/70 text-center text-sm mb-8 max-w-md">
                Sel, poivre, épices, huile… Cochez ce que vous avez dans vos placards.
              </p>
              <div className="w-full max-w-md rounded-xl bg-white/10 border border-white/20 p-3 sm:p-4">
                <ul className="space-y-1.5">
                  {pantryList.map(({ index, text }) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => togglePantry(index)}
                        className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
                      >
                        <span className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                          pantryChecked.has(index) ? 'bg-primary border-primary' : 'border-white/40'
                        }`}>
                          {pantryChecked.has(index) && <Check size={13} className="text-white" />}
                        </span>
                        <span className={`text-sm font-medium leading-snug ${pantryChecked.has(index) ? 'text-white/50 line-through' : 'text-white'}`}>
                          {text}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-white/50 text-center">
                  Pas besoin de tout cocher — on vous redemandera seulement ce qu’il faut acheter.
                </p>
              </div>
            </>
          )}

          {isRestPhase && (
            <>
              <p className="font-display text-2xl sm:text-3xl text-center text-white max-w-xl leading-relaxed mb-2">
                Ingrédients à préparer
              </p>
              <p className="text-white/70 text-center text-sm mb-8 max-w-md">
                {restList.length === 0
                  ? 'Vous avez tout dans vos basiques — on peut commencer.'
                  : 'Sortez-les, pesez, préparez et cochez au fur et à mesure.'}
              </p>
              <div className="w-full max-w-md rounded-xl bg-white/10 border border-white/20 p-3 sm:p-4">
                {restList.length === 0 ? (
                  <p className="text-center text-white/60 text-sm py-4">Aucun autre ingrédient à lister.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {restList.map(({ index, text }) => (
                      <li key={index}>
                        <button
                          type="button"
                          onClick={() => toggleCheck(index)}
                          className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
                        >
                          <span className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                            checked[index] ? 'bg-primary border-primary' : 'border-white/40'
                          }`}>
                            {checked[index] && <Check size={13} className="text-white" />}
                          </span>
                          <span className={`text-sm font-medium leading-snug ${checked[index] ? 'text-white/50 line-through' : 'text-white'}`}>
                            {text}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {!isIngredientsStep && (
            <>
              <StepWithQuantities stepText={currentStepText} ingredients={ingredients.map((ing) => scaleIngredient(ing, ratio))} />
              {timerInfo && (
                <button
                  type="button"
                  onClick={() => !timer && startTimer(timerInfo.seconds, currentStepText.slice(0, 60) + (currentStepText.length > 60 ? '…' : ''))}
                  className={`mt-6 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    timer && !timer.done
                      ? 'border-white/15 text-white/35 cursor-default'
                      : 'border-primary/50 text-primary hover:bg-primary/10 hover:border-primary active:scale-95'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {timer && !timer.done ? 'Minuteur actif' : `Lancer ${timerInfo.label}`}
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-white/10 bg-[#252525] px-4 py-3 sm:py-4">
          <div className="max-w-3xl mx-auto">
            {bottomCaption && !isIngredientsStep && (
              <p className="text-center text-xs sm:text-sm text-white/60 line-clamp-2 mb-2.5 leading-snug px-2">
                {bottomCaption}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={stepIndex === 0 && !(isRestPhase && pantryList.length > 0)}
                className="flex-shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg text-sm sm:text-base font-medium text-white/80 hover:text-white disabled:opacity-25 disabled:pointer-events-none border border-white/20 hover:border-white/40 transition-colors whitespace-nowrap"
              >
                ← <span className="hidden sm:inline">Précédent</span><span className="sm:hidden">Préc.</span>
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={handleNext}
                className="flex-shrink-0 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-semibold bg-primary text-white hover:bg-primary-light transition-colors whitespace-nowrap"
              >
                {isPantryPhase
                  ? <><span className="hidden sm:inline">J&apos;ai tout, continuer</span><span className="sm:hidden">J&apos;ai tout</span> →</>
                  : isRestPhase
                    ? <><span className="hidden sm:inline">Commencer la recette</span><span className="sm:hidden">Commencer</span> →</>
                    : stepIndex >= totalSteps - 1
                      ? 'Terminer ✓'
                      : 'Suivant →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link
          to="/recettes"
          className="inline-flex items-center gap-1.5 text-sm text-text-light hover:text-text transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Retour
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-1/2">
            <div className="aspect-[4/3] rounded-sm overflow-hidden bg-bg-warm">
              <img
                src={effectiveRecipe?.image || recipe.image}
                alt={effectiveRecipe?.title || recipe.title}
                className="w-full h-full object-cover"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[13px] font-medium px-2.5 py-0.5 rounded-sm border border-border text-text-light">
                  {tag.replace('#', '')}
                </span>
              ))}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-text leading-tight">
              {effectiveRecipe?.title || recipe.title}
            </h1>
            <p className="recipe-script-note mt-2 text-base">
              {(effectiveRecipe?.time ?? recipe.time) <= 15 ? 'Rapide à faire !' : (effectiveRecipe?.time ?? recipe.time) <= 30 ? 'Parfait pour le soir' : 'À prévoir à l\'avance'}
            </p>

            <div className="flex items-center gap-4 mt-4 text-sm text-text-light">
              <span className="flex items-center gap-1.5"><Clock size={15} /> {effectiveRecipe?.time ?? recipe.time} min</span>
              <span className="flex items-center gap-1.5"><Flame size={15} /> {Math.round((effectiveRecipe?.calories ?? recipe.calories) * ratio)} kcal</span>
              <span className="flex items-center gap-1.5"><ChefHat size={15} /> {effectiveRecipe?.difficulty ?? recipe.difficulty}</span>
            </div>

            {/* Macros */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="bg-bg-warm rounded-sm p-3 text-center">
                <p className="text-lg font-medium text-primary">{Math.round((effectiveRecipe?.protein ?? recipe.protein) * ratio)}g</p>
                <p className="text-[13px] uppercase tracking-wider text-text-light mt-0.5">Protéines</p>
              </div>
              <div className="bg-bg-warm rounded-sm p-3 text-center">
                <p className="text-lg font-medium text-text">{Math.round((effectiveRecipe?.carbs ?? recipe.carbs) * ratio)}g</p>
                <p className="text-[13px] uppercase tracking-wider text-text-light mt-0.5">Glucides</p>
              </div>
              <div className="bg-bg-warm rounded-sm p-3 text-center">
                <p className="text-lg font-medium text-text">{Math.round((effectiveRecipe?.fat ?? recipe.fat) * ratio)}g</p>
                <p className="text-[13px] uppercase tracking-wider text-text-light mt-0.5">Lipides</p>
              </div>
            </div>

            {/* Servings */}
            <div className="mt-6 flex items-center gap-3">
              <Users size={16} className="text-text-light flex-shrink-0" />
              <span className="recipe-annotation">Pour {servings} personne{servings > 1 ? 's' : ''}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-8 h-8 rounded-sm border border-border flex items-center justify-center text-sm hover:border-text transition-colors"
                >
                  -
                </button>
                <span className="text-sm font-medium w-6 text-center">{servings}</span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="w-8 h-8 rounded-sm border border-border flex items-center justify-center text-sm hover:border-text transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => toggleFavorite(recipe.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm border transition-colors ${
                  isFavorite
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-text-light hover:border-text'
                }`}
              >
                <Heart size={14} className={isFavorite ? 'fill-primary' : ''} />
                {isFavorite ? 'Favori' : 'Ajouter'}
              </button>
              <button
                onClick={() => {
                setCookingMode(true);
                setActiveStep(0);
                setCheckedIngredients(ingredients.map(() => false));
                const hasPantry = ingredients.some(ing => isCommonPantry(parseIngredient(ing).name || ing));
                setIngredientsStepPhase(hasPantry ? 'pantry' : 'rest');
                setPantryChecked(new Set());
              }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                <ChefHat size={14} />
                Mode cuisine
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm border border-border text-text-light hover:border-text transition-colors"
              >
                {shareStatus === 'copied' ? (
                  <><Copy size={14} className="text-secondary" /> Lien copié !</>
                ) : shareStatus === 'shared' ? (
                  <><Check size={14} className="text-secondary" /> Partagé !</>
                ) : (
                  <><Share2 size={14} /> Partager</>
                )}
              </button>
            </div>
            <p className="recipe-script-note mt-2 text-sm">Suis les étapes comme sur un carnet</p>
          </div>
        </div>

        {/* Ingredients & Steps */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <h2 className="recipe-section-title">Ingrédients</h2>
            <div className="deco-wave mb-4" />
            <ul className="space-y-2.5">
              {ingredients.map((ingredient, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-light">
                  <span className="w-1.5 h-1.5 rounded-sm bg-primary/40 mt-1.5 flex-shrink-0" />
                  {scaleIngredient(ingredient, ratio)}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="recipe-section-title">Préparation</h2>
            <div className="deco-wave mb-4" />
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-sm bg-bg-warm text-xs flex items-center justify-center text-text-light font-medium">
                    {i + 1}
                  </span>
                  <p className="text-sm text-text-light leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Commentaires */}
        <RecipeComments recipeId={recipe.id} user={user} />

        {/* Similar */}
        {similar.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl text-text mb-8">Recettes végétariennes similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map(r => (
                <RecipeCard key={r.id} recipe={r} isFavorite={favorites.includes(r.id)} toggleFavorite={toggleFavorite} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
