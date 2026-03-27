import { useParams, useSearchParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Heart, Users, ChefHat, X, Check, Share2, Copy, ChevronRight } from 'lucide-react';
import { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { useJsonLd } from '../hooks/useJsonLd';
import { getSlug } from '../lib/slug';
import { canonicalUrl, buildRecipeJsonLd, buildBreadcrumbJsonLd, categoryLabel } from '../lib/seo';
import RecipeCard from '../components/RecipeCard';
import RecipeComments from '../components/RecipeComments';
import { getSafeImageSrc, handleMediaImageError, isRecipeImageMissing } from '../lib/imageFallback';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ownerMacros, ingredientScale } from '../lib/household';
import { getMealTypeFromHour, getCurrentDayId } from '../utils/dashboardPlanning';

const ALLOWED_MEAL_MULTIPLIERS = new Set([0.5, 1, 1.5, 2]);

function normalizeMealMultiplier(value) {
  const num = Number(value);
  return ALLOWED_MEAL_MULTIPLIERS.has(num) ? num : 1;
}

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

const TIMER_ALERT_SOUND_SRC = '/sound/universfield-simple-notification-152054.mp3';

/** Glisser le bouton vers la droite pour arrêter l’alarme sonore (mode cuisine). */
function TimerSlideToDismiss({ onDismiss }) {
  const trackRef = useRef(null);
  const [maxOffset, setMaxOffset] = useState(0);
  const maxOffsetRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const offsetRef = useRef(0);
  const onDismissRef = useRef(onDismiss);

  const KNOB = 44;
  const PAD = 6;

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    const next = Math.max(0, w - KNOB - PAD * 2);
    maxOffsetRef.current = next;
    setMaxOffset(next);
  }, []);

  useLayoutEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    setOffset((o) => Math.min(o, maxOffsetRef.current));
  }, [maxOffset]);

  const activeListenersRef = useRef(null);

  useEffect(
    () => () => {
      const L = activeListenersRef.current;
      if (L) {
        window.removeEventListener('pointermove', L.onMove);
        window.removeEventListener('pointerup', L.onEnd);
        window.removeEventListener('pointercancel', L.onEnd);
        activeListenersRef.current = null;
      }
      dragStart.current = null;
    },
    []
  );

  const onPointerDown = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (dragStart.current) return;

    const pointerId = e.pointerId;
    dragStart.current = { x: e.clientX, off: offsetRef.current };
    setDragging(true);

    const onMove = (ev) => {
      if (ev.pointerId !== pointerId || !dragStart.current) return;
      const dx = ev.clientX - dragStart.current.x;
      const max = maxOffsetRef.current;
      const next = Math.min(max, Math.max(0, dragStart.current.off + dx));
      offsetRef.current = next;
      setOffset(next);
    };

    const onEnd = (ev) => {
      if (ev.pointerId !== pointerId) return;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      activeListenersRef.current = null;
      dragStart.current = null;
      setDragging(false);

      const o = offsetRef.current;
      const max = maxOffsetRef.current;
      const thr = max > 0 ? Math.max(max * 0.72, max - 14) : 0;
      if (max > 0 && o >= thr) {
        offsetRef.current = 0;
        setOffset(0);
        onDismissRef.current();
      } else {
        offsetRef.current = 0;
        setOffset(0);
      }
    };

    activeListenersRef.current = { onMove, onEnd };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
  }, []);

  return (
    <div
      ref={trackRef}
      className="relative h-12 w-full rounded-full border border-white/15 bg-white/[0.07] overflow-hidden touch-none select-none"
      role="presentation"
    >
      <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-[11px] font-medium text-white/35 px-14">
        Glisser pour arrêter l&apos;alarme
      </p>
      <button
        type="button"
        aria-label="Glisser vers la droite pour arrêter l’alarme du minuteur"
        className={`absolute top-1 left-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg z-10 touch-none cursor-grab active:cursor-grabbing ${
          dragging ? '' : 'transition-[transform] duration-200 ease-out'
        }`}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
      >
        <ChevronRight size={22} strokeWidth={2.5} className="pointer-events-none opacity-95" />
      </button>
    </div>
  );
}

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

/** Extrait un court libellé "cuisson X" depuis le texte de l'étape (ex. "Cuire le quinoa 8 min" → "quinoa"). */
function getCookingSubject(stepText) {
  if (!stepText || typeof stepText !== 'string') return null;
  const t = stepText.trim();
  const m = t.match(/(?:cuire|faire cuire|mijoter|faire revenir|laisser cuire)\s+(?:le |la |les |l')?([a-zàâäéèêëïîôùûüçA-Z0-9\s]+?)(?:\s+\d|\s+à|\s*$)/i)
    || t.match(/(?:cuisson|cuire)\s+(?:du |de la |des )?([a-zàâäéèêëïîôùûüç]+)/i);
  if (m) {
    const word = m[1].trim().split(/\s+/)[0];
    if (word.length >= 2) return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  const known = ['quinoa', 'riz', 'pâtes', 'lentilles', 'pois chiches', 'semoule', 'boulgour', 'oignons', 'ail', 'sauce', 'légumes'];
  const lower = t.toLowerCase();
  for (const w of known) {
    if (lower.includes(w)) return w.charAt(0).toUpperCase() + w.slice(1);
  }
  return null;
}

function CookingTimerIsland({ timer, expanded, setExpanded, onStop, onAdd, onRemove }) {
  const alarmAudioRef = useRef(null);

  useEffect(() => {
    if (timer?.done) setExpanded(true);
  }, [timer?.done, setExpanded]);

  useEffect(() => {
    if (!timer?.done) {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current.currentTime = 0;
        alarmAudioRef.current = null;
      }
      return undefined;
    }
    const audio = new Audio(TIMER_ALERT_SOUND_SRC);
    audio.loop = true;
    audio.volume = 0.88;
    alarmAudioRef.current = audio;
    const play = audio.play();
    if (play !== undefined) {
      play.catch(() => {
        /* autoplay bloqué : l’utilisateur a toujours le retour visuel + vibration */
      });
    }
    return () => {
      audio.pause();
      audio.src = '';
      audio.load();
      if (alarmAudioRef.current === audio) alarmAudioRef.current = null;
    };
  }, [timer?.done]);

  if (!timer) return null;

  const timeStr = formatTimer(timer.remainingSeconds);
  const totalStr = formatTimer(timer.totalSeconds);
  const halfStr = formatTimer(Math.round(timer.totalSeconds / 2));
  // elapsed fraction 0→1 as timer counts down (bar fills left to right)
  const elapsed = timer.totalSeconds > 0
    ? Math.max(0, Math.min(1, 1 - timer.remainingSeconds / timer.totalSeconds))
    : 1;
  const elapsedPct = elapsed * 100;
  const isDone = timer.done;
  const startedAtStr = timer.startedAt
    ? timer.startedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';
  const subject = getCookingSubject(timer.label);
  const cookingLabel = subject ? `Cuisson ${subject}` : 'En cuisson…';

  return (
    <div
      className="bg-[#0f0f0f] border border-white/[0.1] shadow-2xl overflow-hidden select-none"
      style={{
        width: expanded ? '280px' : '120px',
        borderRadius: expanded ? '20px' : '100px',
        transition: 'width 400ms cubic-bezier(0.4,0,0.2,1), border-radius 400ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* ── Compact pill (visible when collapsed) ── */}
      <div
        className="cursor-pointer"
        style={{
          opacity: expanded ? 0 : 1,
          maxHeight: expanded ? 0 : '48px',
          overflow: 'hidden',
          transition: 'opacity 180ms, max-height 400ms cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: expanded ? 'none' : 'auto',
        }}
        onClick={() => setExpanded(true)}
      >
        <div className="relative h-12 w-full">
          {/* Base: fond sombre (pas orange) */}
          <div className="absolute inset-0 rounded-full" style={{ background: '#1a1a1a' }} />
          {/* Remplissage orange = temps écoulé */}
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${elapsedPct}%`,
              background: isDone ? '#ef4444' : '#f97316',
              boxShadow: isDone ? '0 0 24px rgba(239,68,68,0.28)' : '0 0 28px rgba(249,115,22,0.38)',
              transition: 'width 1s linear',
            }}
          />
          {/* Chrono centré dans toute la pastille */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className={`text-sm font-mono font-semibold tabular-nums ${isDone ? 'text-red-200' : 'text-white'}`}>
              {isDone ? 'Prêt !' : timeStr}
            </span>
          </div>
        </div>
      </div>

      {/* ── Expanded card (click card body to close) ── */}
      <div
        style={{
          opacity: expanded ? 1 : 0,
          maxHeight: expanded ? '420px' : 0,
          overflow: 'hidden',
          transition: 'opacity 250ms 60ms, max-height 400ms cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: expanded ? 'auto' : 'none',
        }}
      >
        {/* Body: click to close */}
        <div className="p-5 cursor-pointer" onClick={() => setExpanded(false)}>
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.16em] mb-3">
            ⏱ {cookingLabel}
          </p>

          {/* Time */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-[2.5rem] leading-none font-mono font-bold tabular-nums ${isDone ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {isDone ? '0:00' : timeStr}
            </span>
            <span className="text-white/22 text-sm tabular-nums">• {totalStr}</span>
          </div>

          {startedAtStr && (
            <p className="text-white/28 text-[11px] mb-5 tabular-nums">depuis {startedAtStr}</p>
          )}
          {!startedAtStr && <div className="mb-5" />}

          {/* Scale labels */}
          <div className="flex justify-between text-[10px] text-white/22 mb-1.5 tabular-nums px-0.5">
            <span>0:00</span>
            <span>{halfStr}</span>
            <span>{totalStr}</span>
          </div>

          {/* Progress bar — fond sombre, remplissage orange */}
          <div
            className="h-9 rounded-2xl overflow-hidden mb-5"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div style={{
              width: `${elapsedPct}%`,
              height: '100%',
              borderRadius: 'inherit',
              background: isDone ? '#ef4444' : '#f97316',
              boxShadow: isDone
                ? '0 0 28px 10px rgba(239,68,68,0.35)'
                : '0 0 32px 12px rgba(249,115,22,0.45)',
              transition: 'width 1s linear',
            }} />
          </div>

          {/* Controls — stop propagation so they don't close the card */}
          <div onClick={(e) => e.stopPropagation()}>
            {!isDone ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onRemove(60)}
                  className="flex-1 py-2.5 rounded-xl text-white/55 text-sm font-medium transition-colors hover:text-white/80"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  −1 min
                </button>
                <button
                  type="button"
                  onClick={() => { onStop(); setExpanded(false); }}
                  className="flex-1 py-2.5 rounded-xl text-red-400 text-sm font-semibold transition-colors hover:text-red-300"
                  style={{ background: 'rgba(239,68,68,0.12)' }}
                >
                  Arrêter
                </button>
                <button
                  type="button"
                  onClick={() => onAdd(60)}
                  className="flex-1 py-2.5 rounded-xl text-white/55 text-sm font-medium transition-colors hover:text-white/80"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  +1 min
                </button>
              </div>
            ) : (
              <TimerSlideToDismiss
                onDismiss={() => {
                  if (alarmAudioRef.current) {
                    alarmAudioRef.current.pause();
                    alarmAudioRef.current = null;
                  }
                  onStop();
                  setExpanded(false);
                }}
              />
            )}
          </div>
        </div>
      </div>
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
  const { slug, planningId: urlPlanningId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { recipes, articles, loading, error, getRecipe } = useData();
  const { user, householdMembers: authHousehold, savedPlannings } = useAuth();
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

  const [commentRatingAgg, setCommentRatingAgg] = useState(null);

  // Contexte planning : depuis l'URL (/planning/:id/recette/:slug) ou depuis location.state
  const urlPlanningContext = useMemo(() => {
    if (!urlPlanningId || !savedPlannings?.length) return null;
    const found = savedPlannings.find((p) => {
      if (p.id === urlPlanningId) return true;
      const localKey = `local-${(p.weekStart || p.date || '').replace(/\//g, '-')}`;
      return localKey === urlPlanningId;
    });
    if (!found) return null;
    const day = searchParams.get('day');
    const meal = searchParams.get('meal');
    const key = day && meal ? `${day}-${meal}` : null;
    const multiplier = key && found.mealMultipliers ? (found.mealMultipliers[key] ?? 1) : 1;
    return { source: 'planning', planningId: urlPlanningId, day, mealType: meal, multiplier, weekStart: found.weekStart };
  }, [urlPlanningId, savedPlannings, searchParams]);

  const planningContext = urlPlanningContext || (location.state?.source === 'planning' ? location.state : null);
  const planningMultiplier = useMemo(
    () => normalizeMealMultiplier(planningContext?.multiplier),
    [planningContext?.multiplier]
  );
  // Foyer : depuis AuthContext (connecté) ou depuis location.state (onboarding/preview)
  const allHouseholdMembers = useMemo(
    () => (authHousehold?.length > 0 ? authHousehold : planningContext?.household ?? []),
    [authHousehold, planningContext?.household],
  );

  // Exclusions temporaires de membres pour cette recette
  const [excludedMemberIds, setExcludedMemberIds] = useState(new Set());
  const householdMembers = useMemo(
    () => allHouseholdMembers.filter((m) => !excludedMemberIds.has(m.id)),
    [allHouseholdMembers, excludedMemberIds],
  );
  const toggleMemberExclusion = useCallback((memberId) => {
    setExcludedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  }, []);

  // Détection "c'est l'heure" : jour et tranche horaire correspondent au planning
  const isCurrentMealTime = useMemo(() => {
    if (!planningContext?.day || !planningContext?.mealType) return false;
    const currentDay = getCurrentDayId();
    const currentMeal = getMealTypeFromHour(new Date().getHours());
    return planningContext.day === currentDay && planningContext.mealType === currentMeal;
  }, [planningContext?.day, planningContext?.mealType]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!recipe?.id || !isSupabaseConfigured()) {
        setCommentRatingAgg(null);
        return;
      }
      const { data, error } = await supabase
        .from('comments')
        .select('rating')
        .eq('recipe_id', recipe.id)
        .not('rating', 'is', null)
        .gt('rating', 0);
      if (cancelled) return;
      if (error || !data?.length) {
        setCommentRatingAgg(null);
        return;
      }
      const sum = data.reduce((s, row) => s + Number(row.rating), 0);
      const ratingValue = Math.round((sum / data.length) * 10) / 10;
      setCommentRatingAgg({ ratingValue, ratingCount: data.length });
    })();
    return () => { cancelled = true; };
  }, [recipe?.id]);

  // Tous les hooks doivent rester au-dessus des early returns : sinon au passage
  // loading true → false (refresh direct sur /recettes/…), React signale « more hooks » et l’ErrorBoundary s’affiche.
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
            const baseServings = full.servings || 1;
            setServings(Math.max(1, Math.round(baseServings * planningMultiplier)));
          }
        } catch {
          // on garde le summary; l'UI reste fonctionnelle
        }
      } else {
        // Si on a déjà un full (ex. dev/local), on synchronise les servings.
        const baseServings = recipe.servings || 1;
        setServings(Math.max(1, Math.round(baseServings * planningMultiplier)));
      }
    }
    loadFull();
    return () => { cancelled = true; };
  }, [recipe?.id, recipe?.steps, recipe?.servings, getRecipe, planningMultiplier]);

  const steps = effectiveRecipe?.steps ?? [];
  const ingredients = effectiveRecipe?.ingredients ?? [];
  const tags = effectiveRecipe?.tags ?? [];
  const objective = effectiveRecipe?.objective ?? [];
  const recipeNotes = effectiveRecipe?.notes ?? recipe?.notes ?? '';

  const recipeTitle = effectiveRecipe?.title || recipe?.title || '';
  const recipeSlug = recipeTitle ? getSlug(recipeTitle) : slug;
  const recipeUrl = recipeSlug ? canonicalUrl(`/recettes/${recipeSlug}`) : '';
  const recipeDesc = recipeTitle && steps[0]
    ? `${recipeTitle} — ${steps[0].slice(0, 120)}…`
    : recipeTitle
      ? `Recette végétarienne ${recipeTitle} : ${effectiveRecipe?.calories ?? recipe?.calories ?? ''} kcal, ${effectiveRecipe?.protein ?? recipe?.protein ?? ''}g de protéines. Facile et rapide.`
      : '';

  const metaReady = Boolean(recipe && recipeTitle && recipeUrl);

  usePageMeta(
    metaReady
      ? {
          title: `${recipeTitle} — Recette végétarienne protéinée`,
          description: recipeDesc,
          canonical: recipeUrl,
          image: effectiveRecipe?.image || recipe?.image,
          type: 'article',
        }
      : {}
  );

  useJsonLd(
    metaReady
      ? [
          buildRecipeJsonLd(effectiveRecipe || recipe, recipeUrl, {
            aggregateRating: commentRatingAgg || undefined,
          }),
          buildBreadcrumbJsonLd([
            { name: 'Accueil', url: canonicalUrl('/') },
            { name: 'Recettes', url: canonicalUrl('/recettes') },
            { name: recipeTitle, url: recipeUrl },
          ]),
        ]
      : null
  );

  const [shareStatus, setShareStatus] = useState(null); // null | 'copied' | 'shared'

  const handleShare = useCallback(async () => {
    const title = effectiveRecipe?.title || recipe?.title;
    if (!title) return;
    const url = window.location.href;
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
  }, [effectiveRecipe?.title, recipe?.title]);

  const relatedArticles = useMemo(() => {
    const list = Array.isArray(articles) ? articles : [];
    if (list.length === 0) return [];

    const objectiveSeed = Array.isArray(objective) && objective.length ? String(objective[0]) : '';
    const kwByObjective = {
      masse: ['prise de masse', 'muscle', 'hypertrophie', 'protéine', 'protéines', 'récupération'],
      seche: ['sèche', 'déficit', 'perte de gras', 'composition corporelle', 'protéine', 'satiété'],
      endurance: ['endurance', 'carburant', 'glucides', 'glycogène', 'hydratation'],
      sante: ['santé', 'équilibre', 'micronutriments', 'fibres', 'habitudes'],
    };
    const base = kwByObjective[objectiveSeed] || ['protéine', 'protéines', 'macros', 'glucides', 'lipides'];
    const needle = base.map((s) => s.toLowerCase());

    const scored = list
      .filter((a) => a?.id && a?.title && (a?.category === 'Nutrition' || a?.category === 'Organisation'))
      .map((a) => {
        const hay = `${a.title || ''} ${a.excerpt || ''}`.toLowerCase();
        let score = 0;
        needle.forEach((k) => { if (hay.includes(k)) score += 2; });
        if (a.category === 'Nutrition') score += 1;
        return { a, score };
      })
      .sort((x, y) => y.score - x.score);

    const picked = scored.filter((x) => x.score > 0).slice(0, 3).map((x) => x.a);
    if (picked.length >= 2) return picked;

    // fallback: 3 derniers articles Nutrition
    return list.filter((a) => a?.category === 'Nutrition').slice(0, 3);
  }, [articles, objective]);

  const isPlanningMode = Boolean(planningContext);
  const hasHousehold = isPlanningMode && householdMembers && householdMembers.length > 0;

  // Mode vitrine : ratio classique slider. Mode planning avec foyer : ratio foyer.
  const ratio = hasHousehold
    ? ingredientScale(householdMembers, (effectiveRecipe?.servings || recipe?.servings) || 1)
    : servings / ((effectiveRecipe?.servings || recipe?.servings) || 1);

  // Macros de l'owner en mode planning
  const planningOwnerMacros = useMemo(() => {
    if (!hasHousehold) return null;
    return ownerMacros(effectiveRecipe ?? recipe, householdMembers);
  }, [hasHousehold, effectiveRecipe, recipe, householdMembers]);

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

  const isFavorite = favorites?.includes(effectiveRecipe?.id ?? recipe.id) ?? false;
  const similar = (recipes ?? []).filter(
    (r) => r.id !== (effectiveRecipe?.id ?? recipe.id) && (r.objective ?? []).some((o) => objective.includes(o))
  ).slice(0, 3);

  const totalSteps = 1 + steps.length;

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
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm text-text-light mb-8 flex-wrap">
          <Link to="/" className="hover:text-text transition-colors">Accueil</Link>
          <span className="text-text-light/40">/</span>
          {planningContext ? (
            <>
              <Link to="/planning?mine=1" className="hover:text-text transition-colors">Mon planning</Link>
            </>
          ) : (
            <>
              <Link to="/recettes" className="hover:text-text transition-colors">Recettes</Link>
              {(effectiveRecipe?.category || recipe.category) && (
                <>
                  <span className="text-text-light/40">/</span>
                  <Link
                    to={`/recettes?categorie=${effectiveRecipe?.category || recipe.category}`}
                    className="hover:text-text transition-colors"
                  >
                    {categoryLabel(effectiveRecipe?.category || recipe.category)}
                  </Link>
                </>
              )}
            </>
          )}
          <span className="text-text-light/40">/</span>
          <span className="text-text truncate max-w-[200px]">{effectiveRecipe?.title || recipe.title}</span>
        </nav>

        {/* Header : image à gauche, infos à droite */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Image */}
          <div className="lg:w-[42%] flex-shrink-0">
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-bg-warm flex items-center justify-center">
              <img
                src={getSafeImageSrc(effectiveRecipe?.image || recipe.image)}
                alt={effectiveRecipe?.title || recipe.title}
                onError={handleMediaImageError}
                className={
                  isRecipeImageMissing(effectiveRecipe?.image || recipe.image)
                    ? 'max-h-44 w-full object-contain recipe-image-placeholder'
                    : 'w-full h-full object-contain'
                }
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>

          {/* Infos */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {tags.slice(0, 3).map(tag => (
                <Link key={tag} to={`/recettes?tag=${encodeURIComponent(tag)}`} className="text-[13px] font-medium px-2.5 py-0.5 rounded-sm border border-border text-text-light hover:border-primary hover:text-primary transition-colors">
                  {tag.replace('#', '')}
                </Link>
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
              <span className="flex items-center gap-1.5"><ChefHat size={15} /> {effectiveRecipe?.difficulty ?? recipe.difficulty}</span>
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
          </div>
        </div>

        {/* Bandeau "C'est l'heure !" */}
        {isPlanningMode && isCurrentMealTime && (
          <div className="mt-8 rounded-xl border border-secondary/30 bg-secondary/5 px-5 py-4">
            <p className="text-secondary font-medium text-sm">
              C&apos;est l&apos;heure ! Cuisinez bien et bon appetit !
            </p>
          </div>
        )}

        {/* Macros */}
        <div className={isPlanningMode && isCurrentMealTime ? 'mt-6' : 'mt-10'}>
          {hasHousehold && planningOwnerMacros ? (
            <>
              <p className="text-[11px] uppercase tracking-[0.15em] text-text-light font-accent">Tes macros pour ce plat</p>
              <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-bg-warm rounded-sm p-3 text-center">
                  <p className="text-lg font-medium text-primary">{planningOwnerMacros.protein}g</p>
                  <p className="text-[13px] uppercase tracking-wider text-text-light mt-0.5">Protéines</p>
                </div>
                <div className="bg-bg-warm rounded-sm p-3 text-center">
                  <p className="text-lg font-medium text-text">{planningOwnerMacros.carbs}g</p>
                  <p className="text-[13px] uppercase tracking-wider text-text-light mt-0.5">Glucides</p>
                </div>
                <div className="bg-bg-warm rounded-sm p-3 text-center">
                  <p className="text-lg font-medium text-text">{planningOwnerMacros.fat}g</p>
                  <p className="text-[13px] uppercase tracking-wider text-text-light mt-0.5">Lipides</p>
                </div>
                <div className="bg-bg-warm rounded-sm p-3 text-center">
                  <p className="text-lg font-medium text-text">{planningOwnerMacros.calories}</p>
                  <p className="text-[13px] uppercase tracking-wider text-text-light mt-0.5">kcal</p>
                </div>
              </div>

              {/* Toggle membres du foyer pour cette recette */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-text-light mr-1">Mangent ce repas :</span>
                {allHouseholdMembers.map((m) => {
                  const excluded = excludedMemberIds.has(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => !m.is_owner && toggleMemberExclusion(m.id)}
                      disabled={m.is_owner}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        excluded
                          ? 'border-border text-text-light/40 line-through bg-white'
                          : 'border-secondary/40 bg-secondary/8 text-secondary'
                      } ${m.is_owner ? 'cursor-default' : 'cursor-pointer hover:border-secondary'}`}
                      title={m.is_owner ? 'Toi (toujours inclus)' : excluded ? `Réajouter ${m.name}` : `Retirer ${m.name} pour ce repas`}
                    >
                      {m.name}{m.is_owner ? ' (toi)' : ''}
                    </button>
                  );
                })}
              </div>
              {excludedMemberIds.size > 0 && (
                <p className="mt-2 text-xs text-text-light/60 italic">
                  Quantites ajustees pour {householdMembers.length} personne{householdMembers.length > 1 ? 's' : ''}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-[11px] uppercase tracking-[0.15em] text-text-light font-accent">Par portion</p>
              <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-bg-warm rounded-sm p-3 text-center">
                  <p className="text-lg font-medium text-primary">{effectiveRecipe?.protein ?? recipe.protein}g</p>
                  <p className="text-[13px] uppercase tracking-wider text-text-light mt-0.5">Protéines</p>
                </div>
                <div className="bg-bg-warm rounded-sm p-3 text-center">
                  <p className="text-lg font-medium text-text">{effectiveRecipe?.carbs ?? recipe.carbs}g</p>
                  <p className="text-[13px] uppercase tracking-wider text-text-light mt-0.5">Glucides</p>
                </div>
                <div className="bg-bg-warm rounded-sm p-3 text-center">
                  <p className="text-lg font-medium text-text">{effectiveRecipe?.fat ?? recipe.fat}g</p>
                  <p className="text-[13px] uppercase tracking-wider text-text-light mt-0.5">Lipides</p>
                </div>
                <div className="bg-bg-warm rounded-sm p-3 text-center">
                  <p className="text-lg font-medium text-text">{effectiveRecipe?.calories ?? recipe.calories}</p>
                  <p className="text-[13px] uppercase tracking-wider text-text-light mt-0.5">kcal</p>
                </div>
              </div>

              {/* Slider portions — mode vitrine uniquement */}
              <div className="mt-6 flex items-center gap-3">
                <Users size={16} className="text-text-light flex-shrink-0" />
                <span className="recipe-annotation">Portions</span>
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
            </>
          )}
        </div>

        {/* Ingredients & Steps */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <h2 className="recipe-section-title">Ingrédients</h2>
            <p className="text-xs text-text-light mb-3">Quantités pour {servings} personne{servings > 1 ? 's' : ''}</p>
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
                <li key={i} id={`etape-${i + 1}`} className="flex gap-4 scroll-mt-24">
                  <span className="flex-shrink-0 w-6 h-6 rounded-sm bg-bg-warm text-xs flex items-center justify-center text-text-light font-medium">
                    {i + 1}
                  </span>
                  <p className="text-sm text-text-light leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
            {recipeNotes ? (
              <div className="mt-8 rounded-xl border border-border bg-bg-warm/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-primary mb-2">Conseils & infos</p>
                <p className="text-sm text-text-light leading-relaxed whitespace-pre-wrap">{recipeNotes}</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Pour aller plus loin (blog) */}
        {relatedArticles.length > 0 && (
          <div className="mt-16">
            <p className="recipe-section-title">Pour aller plus loin</p>
            <div className="deco-wave mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedArticles.map((a) => (
                <Link
                  key={a.id}
                  to={`/blog/${a.id}/${getSlug(a.title)}`}
                  className="group rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-300"
                >
                  <div className="aspect-[16/10] bg-bg-warm overflow-hidden">
                    <img
                      src={getSafeImageSrc(a.image)}
                      alt={a.title}
                      onError={handleMediaImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-primary font-medium">{a.category}</p>
                    <p className="mt-1 text-sm font-medium text-text group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {a.title}
                    </p>
                    {a.excerpt && (
                      <p className="mt-1.5 text-xs text-text-light line-clamp-2">
                        {a.excerpt}
                      </p>
                    )}
                    {a.readTime && (
                      <p className="mt-2 text-xs text-text-light font-accent">
                        {a.readTime} min de lecture
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

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
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
              <Link
                to={`/recettes?categorie=${effectiveRecipe?.category || recipe.category}`}
                className="text-primary hover:underline font-medium"
              >
                Toutes les recettes {categoryLabel(effectiveRecipe?.category || recipe.category).toLowerCase()} →
              </Link>
              <Link to="/recettes" className="text-text-light hover:text-text transition-colors">
                Voir toutes les recettes
              </Link>
            </div>
          </div>
        )}

        {/* CTA Planning */}
        <div className="mt-16 p-6 bg-bg-warm rounded-xl text-center">
          <h2 className="font-display text-xl text-text mb-2">Envie d&apos;intégrer cette recette dans ton planning ?</h2>
          <p className="text-sm text-text-light mb-4">Génère un planning personnalisé avec tes objectifs et ton régime.</p>
          <Link to="/planning" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
            Créer mon planning →
          </Link>
        </div>
      </div>
    </div>
  );
}
