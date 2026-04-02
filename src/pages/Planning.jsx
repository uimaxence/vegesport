import { useState, useMemo, useEffect, useLayoutEffect, useRef } from 'react';

/* ─── Confetti canvas (zéro dépendance) ──────────────────────────────────── */
function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const W = (canvas.width = window.innerWidth);
  const H = (canvas.height = window.innerHeight);
  const cx = W / 2;

  const COLORS = ['#E8450E', '#FF6B3D', '#F4A261', '#C13A0A', '#ffffff', '#FFD6C4', '#2D6A4F'];

  // Deux salves : centre + légèrement décalé gauche/droite
  const origins = [cx - W * 0.18, cx, cx + W * 0.18];
  const particles = origins.flatMap((ox) =>
    Array.from({ length: 55 }, () => {
      const angle = Math.PI * 0.12 + Math.random() * Math.PI * 0.76; // arc vers le haut
      const speed = 7 + Math.random() * 16;
      return {
        x: ox,
        y: H + 6,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
        vy: -Math.sin(angle) * speed,
        w: 7 + Math.random() * 8,
        h: 4 + Math.random() * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.22,
        opacity: 1,
      };
    })
  );

  let rafId;
  const DURATION = 4000;
  const FADE_START = DURATION * 0.52;
  const start = performance.now();

  function draw(now) {
    const t = now - start;
    ctx.clearRect(0, 0, W, H);

    let alive = false;
    for (const p of particles) {
      p.vy += 0.28; // gravité
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      if (t > FADE_START) p.opacity = Math.max(0, p.opacity - 0.02);

      if (p.opacity > 0 && p.y < H + 40) alive = true;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (alive && t < DURATION) {
      rafId = requestAnimationFrame(draw);
    } else {
      canvas.remove();
    }
  }

  rafId = requestAnimationFrame(draw);
  return () => {
    cancelAnimationFrame(rafId);
    canvas.remove();
  };
}
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Download, Lock, LockOpen, RefreshCw, ShoppingCart, ChevronDown, ChevronRight, Check, Copy, MoreVertical, X, Clock, Flame, Beef, Users, ExternalLink, Trash2, RotateCcw, Pencil, Plus, Loader2, Calendar } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { canonicalUrl } from '../lib/seo';
import Toast from '../components/Toast';
import { getSlug } from '../lib/slug';
import { defaultPlannings, days, mealTypes } from '../data/plannings';
import { objectives, regimes } from '../data/recipes';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { totalFactor as calcTotalFactor, ownerMacros, getOwner, appetiteToFactor } from '../lib/household';
import HouseholdEditor from '../components/HouseholdEditor';
import { getCarrefourDriveUrl, getCoursesUDriveUrl, hasCarrefourAffiliate } from '../lib/driveLinks';
import { buildPlanningIcs, downloadPlanningIcs } from '../lib/calendarExport';
import { addToGoogleCalendar, hasGoogleCalendarConfig } from '../lib/googleCalendar';

const MEAL_SIZE_OPTIONS = [
  { mult: 0.5, label: '½',     title: 'Demi-portion' },
  { mult: 1,   label: '×1',    title: 'Portion normale' },
  { mult: 1.5, label: '×1.5',  title: 'Portion et demie' },
  { mult: 2,   label: 'Double', title: 'Double portion' },
];
const SESSION_PLANNING_PREVIEW_KEY = 'planning_preview_v1';
const SESSION_PLANNING_PREVIEW_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24h

function getTodayStr() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/** Retourne true si le jour (lundi..dimanche) est avant aujourd'hui pour la semaine weekStart (YYYY-MM-DD). */
function isDayPast(day, weekStart) {
  if (!weekStart) return false;
  const idx = days.indexOf(day);
  if (idx < 0) return false;
  const dateOfDay = new Date(weekStart);
  dateOfDay.setDate(dateOfDay.getDate() + idx);
  dateOfDay.setHours(0, 0, 0, 0);
  return dateOfDay.getTime() < getTodayStr();
}

export default function Planning({ user, savePlanning }) {
  usePageMeta({
    title: 'Planning repas végétarien hebdomadaire',
    description: 'Crée ton planning hebdomadaire de repas végétariens personnalisé. Choisis ton objectif sportif (prise de masse, sèche, endurance), génère ta liste de courses et sauvegarde ton planning.',
    canonical: canonicalUrl('/planning'),
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    savedPlannings,
    updatePlanning,
    loading: authLoading,
    planningPreferences,
    savePlanningPreferences,
    householdMembers,
  } = useAuth();
  const { recipes: recipesList, ingredientRayons } = useData();

  const editId = searchParams.get('edit');
  const mineMode = searchParams.get('mine') === '1';
  const loadFromState = location.state?.loadPlanning;
  const setupPreviewInit = location.state?.setupPreview;

  const [objective, setObjective] = useState(() => setupPreviewInit?.objective ?? 'masse');
  const [regime, setRegime] = useState(() => setupPreviewInit?.regime ?? 'vegetarien');
  const [niveau, setNiveau] = useState(() => setupPreviewInit?.niveau ?? 'amateur');
  const [poids, setPoids] = useState(() =>
    setupPreviewInit ? String(setupPreviewInit.poids ?? 70) : ''
  );
  const [mealsPerDay, setMealsPerDay] = useState(
    () => Number(setupPreviewInit?.mealsPerDay ?? setupPreviewInit?.meals_per_day) || 4
  );
  const [portions, setPortions] = useState(() => Number(setupPreviewInit?.portions) || 2);
  const [planning, setPlanning] = useState(
    () => setupPreviewInit?.planning ?? defaultPlannings.masse.meals
  );
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [groceryListStep, setGroceryListStep] = useState('loading');
  const [pantryChecked, setPantryChecked] = useState(() => new Set());
  const [groceryChecked, setGroceryChecked] = useState(() => new Set());
  const [pinnedMeals, setPinnedMeals] = useState({});
  const [generated, setGenerated] = useState(() => Boolean(setupPreviewInit));
  const [previewRecipe, setPreviewRecipe] = useState(null);
  const [contextMenu, setContextMenu] = useState({ day: null, mealType: null });
  const [addingToGoogle, setAddingToGoogle] = useState(false);
  const [googleCalendarCount, setGoogleCalendarCount] = useState(0);
  const [googleCalendarError, setGoogleCalendarError] = useState('');
  const [dupPanel, setDupPanel] = useState({ day: null, mealType: null, selectedDays: [] });
  const [skippedDays, setSkippedDays] = useState({});
  const [expandedDay, setExpandedDay] = useState(() => days[0]);
  const [mealNotes, setMealNotes] = useState({});
  const [editingNote, setEditingNote] = useState(null);
  const [mealMultipliers, setMealMultipliers] = useState(
    () => setupPreviewInit?.mealMultipliers ?? {}
  );
  const [actionFeedback, setActionFeedback] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSavedPlanning, setHasSavedPlanning] = useState(false);
  const [editingPlanningId, setEditingPlanningId] = useState(null);
  const [editWeekStart, setEditWeekStart] = useState(null);
  const [editInitDone, setEditInitDone] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(
    () => (user ? 'preview' : setupPreviewInit ? 'preview' : 'preferences')
  );
  const [cameFromSetupFunnel] = useState(() => Boolean(setupPreviewInit));
  const setupPreviewClearedRef = useRef(false);
  const autoPortionsSetRef = useRef(false);
  const confettiFiredRef = useRef(false);
  const intentHandledRef = useRef(false);

  // Foyer : depuis AuthContext (user connecté) ou depuis setupPreview (onboarding guest)
  const setupHousehold = setupPreviewInit?.household;
  const effectiveHousehold = useMemo(
    () => (householdMembers?.length > 0 ? householdMembers : setupHousehold ?? []),
    [householdMembers, setupHousehold],
  );
  const hasHousehold = effectiveHousehold.length > 0;
  const householdFactor = useMemo(
    () => (hasHousehold ? calcTotalFactor(effectiveHousehold) : null),
    [hasHousehold, effectiveHousehold],
  );

  // Facteur de l'owner seul (pour le résumé macros journalier = macros de l'utilisateur uniquement)
  const ownerFactor = useMemo(() => {
    if (!hasHousehold) return null;
    const owner = getOwner(effectiveHousehold);
    return owner ? (owner.size_factor ?? appetiteToFactor(owner.appetite ?? 'moyen')) : 1;
  }, [hasHousehold, effectiveHousehold]);

  const isFunnelPlanningPreview =
    cameFromSetupFunnel || Boolean(location.state?.setupPreview);

  const currentStepIndex = useMemo(() => {
    if (onboardingStep === 'preferences') return 1;
    if (!user) return 2;
    return 3;
  }, [onboardingStep, user]);

  const getCurrentPreferencesPayload = () => ({
    objective,
    niveau,
    poids: Number(poids) || 70,
    regime,
    meals_per_day: mealsPerDay,
    portions,
  });

  const buildPlanningClaimIntent = () => ({
    type: 'claim_planning',
    preferences: getCurrentPreferencesPayload(),
    planning,
    mealMultipliers,
    objective,
  });

  const requireAuthForAction = (intent) => {
    if (user) return false;
    const planningIntent = intent === 'claim_planning' ? buildPlanningClaimIntent() : intent;
    const from = isFunnelPlanningPreview ? '/profil' : `${location.pathname}${location.search}` || '/planning';
    navigate('/connexion', { state: { from, planningIntent } });
    return true;
  };

  const removeMeal = (day, mealType) => {
    const key = `${day}-${mealType}`;
    setPlanning(prev => ({
      ...prev,
      [day]: { ...prev[day], [mealType]: null }
    }));
    setPinnedMeals(prev => { const n = { ...prev }; delete n[key]; return n; });
    setMealMultipliers(prev => { const n = { ...prev }; delete n[key]; return n; });
    setContextMenu({ day: null, mealType: null });
  };

  const getMealMultiplier = (day, mealType) => mealMultipliers[`${day}-${mealType}`] ?? 1;

  const getRecipeLinkState = (day, mealType) => ({
    source: 'planning',
    day,
    mealType,
    planningId: editingPlanningId || null,
    weekStart: editWeekStart || weekStartForCalendar,
    multiplier: getMealMultiplier(day, mealType),
    household: effectiveHousehold,
  });

  /** URL vers la fiche recette, contextualisée au planning si un ID existe. */
  const getRecipeUrl = (recipe, day, mealType) => {
    const slug = getSlug(recipe.title);
    if (editingPlanningId) {
      const params = new URLSearchParams({ day, meal: mealType });
      return `/planning/${editingPlanningId}/recette/${slug}?${params}`;
    }
    return `/recettes/${slug}`;
  };

  const setMealMultiplier = (day, mealType, multiplier) => {
    const key = `${day}-${mealType}`;
    setMealMultipliers((prev) => {
      if (multiplier === 1) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: multiplier };
    });
  };

  const startEditNote = (day, mealType) => {
    setEditingNote(`${day}-${mealType}`);
    setContextMenu({ day: null, mealType: null });
  };

  const saveNote = (day, mealType, text) => {
    const key = `${day}-${mealType}`;
    setMealNotes(prev => ({ ...prev, [key]: text.trim() }));
    setEditingNote(null);
  };

  const clearNote = (day, mealType) => {
    const key = `${day}-${mealType}`;
    setMealNotes(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const toggleSkipDay = (day) => {
    setSkippedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  function scoreRecipeForObjective(recipe, obj) {
    const protein = Number(recipe?.protein) || 0;
    const carbs = Number(recipe?.carbs) || 0;
    const fat = Number(recipe?.fat) || 0;
    const calories = Number(recipe?.calories) || 0;

    // Densité protéique (g / 100 kcal) : robuste même si calories approx.
    const protDensity = calories > 0 ? (protein / calories) * 100 : 0;
    const carbShare = calories > 0 ? (carbs * 4) / calories : 0;
    const fatShare = calories > 0 ? (fat * 9) / calories : 0;

    switch (obj) {
      case 'masse':
        // Protéines + calories suffisantes (mais on évite de favoriser uniquement les bombes caloriques).
        return protein * 2 + calories * 0.15 + protDensity * 6 - fatShare * 10;
      case 'seche':
        // Densité protéines + calories plus basses.
        return protDensity * 20 + protein * 1.2 - calories * 0.08 - fatShare * 12;
      case 'endurance':
        // Glucides + énergie, protéines ok.
        return carbs * 1.8 + calories * 0.08 + protein * 0.6 + carbShare * 10 - fatShare * 6;
      case 'sante':
      default:
        // Équilibre global: protéines correctes, ni trop gras, ni trop extrême.
        return protein * 1.1 + carbs * 0.7 + protDensity * 8 - Math.abs(fatShare - 0.25) * 40;
    }
  }

  const generatePlanning = () => {
    setIsGenerating(true);

    // Petit délai pour le spinner + éviter le freeze UI
    setTimeout(() => {
      // Pool de recettes déjà choisies sur cette génération pour limiter les doublons
      const usedIds = new Set(
        Object.values(pinnedMeals).length > 0
          ? Object.entries(pinnedMeals)
              .filter(([, pinned]) => pinned)
              .map(([key]) => {
                const [day, mt] = key.split('-');
                return planning[day]?.[mt];
              })
              .filter(Boolean)
          : []
      );

      const newPlanning = {};

      days.forEach(day => {
        newPlanning[day] = {};
        mealTypes.forEach(mt => {
          const key = `${day}-${mt.id}`;

          // Repas verrouillé → on le conserve tel quel
          if (pinnedMeals[key]) {
            newPlanning[day][mt.id] = planning[day]?.[mt.id];
            return;
          }

          // Pool: catégorie + régime (l'objectif influence le tri/reco, pas l'exclusion)
          let pool = (recipesList || []).filter(r => {
            if (r.category !== mt.id) return false;
            if (regime !== 'vegetarien' && !r.regime.includes(regime)) return false;
            return true;
          });

          // Fallback ultime : catégorie seule
          if (pool.length === 0) {
            pool = (recipesList || []).filter(r => r.category === mt.id);
          }

          if (pool.length === 0) {
            newPlanning[day][mt.id] = null;
            return;
          }

          // Préférer les recettes pas encore utilisées dans ce planning
          const fresh = pool.filter(r => !usedIds.has(r.id));
          const candidates = (fresh.length > 0 ? fresh : pool)
            .map((r) => ({ r, score: scoreRecipeForObjective(r, objective) }))
            .sort((a, b) => b.score - a.score)
            .map((x) => x.r);

          const topN = Math.min(8, candidates.length);
          const picked = candidates[Math.floor(Math.random() * topN)];
          newPlanning[day][mt.id] = picked.id;
          usedIds.add(picked.id);
        });
      });

      setPlanning(newPlanning);

      // Auto-calcul : tester toutes les combinaisons portions × multiplier
      // pour trouver celle qui atteint le mieux l'objectif protéines
      const activeTypes = mealTypes.slice(0, mealsPerDay);
      let rawTotalProtein = 0;
      let rawCountedDays = 0;
      days.forEach(day => {
        let dayProt = 0;
        activeTypes.forEach(mt => {
          const r = (recipesList || []).find(rx => rx.id === newPlanning[day]?.[mt.id]);
          if (r) dayProt += (r.protein ?? 0);
        });
        if (dayProt > 0) { rawCountedDays++; rawTotalProtein += dayProt; }
      });
      if (rawCountedDays > 0 && DAILY_TARGETS?.protein) {
        const avgProtPerDay = rawTotalProtein / rawCountedDays;
        const target = DAILY_TARGETS.protein;
        const mults = MEAL_SIZE_OPTIONS.map(o => o.mult);
        let bestCombo = { portions: 1, mult: 1, diff: Infinity };
        for (let p = 1; p <= 4; p++) {
          for (const m of mults) {
            const achieved = avgProtPerDay * p * m;
            const diff = Math.abs(achieved - target);
            if (diff < bestCombo.diff) {
              bestCombo = { portions: p, mult: m, diff };
            }
          }
        }
        setPortions(bestCombo.portions);
        if (bestCombo.mult !== 1) {
          const newMultipliers = {};
          days.forEach(day => {
            activeTypes.forEach(mt => {
              if (newPlanning[day]?.[mt.id]) {
                newMultipliers[`${day}-${mt.id}`] = bestCombo.mult;
              }
            });
          });
          setMealMultipliers(newMultipliers);
        } else {
          setMealMultipliers({});
        }
      }

      setGenerated(true);
      setIsGenerating(false);
    }, 500);
  };

  const handleGenerateFromPreferences = () => {
    setOnboardingStep('preview');
    generatePlanning();
  };

  const replaceRecipe = (day, mealType) => {
    const currentId = planning[day]?.[mealType];
    const basePool = (recipesList || []).filter((r) => {
      if (r.category !== mealType) return false;
      if (r.id === currentId) return false;
      if (regime !== 'vegetarien' && !r.regime.includes(regime)) return false;
      return true;
    });
    const eligible = basePool.length > 0 ? basePool : (recipesList || []).filter((r) => r.category === mealType && r.id !== currentId);
    if (eligible.length === 0) {
      const fallback = (recipesList || []).filter(r => r.category === mealType && r.id !== currentId);
      if (fallback.length > 0) {
        const random = fallback[Math.floor(Math.random() * fallback.length)];
        setPlanning(prev => ({
          ...prev,
          [day]: { ...prev[day], [mealType]: random.id }
        }));
      }
      return;
    }
    const ranked = eligible
      .map((r) => ({ r, score: scoreRecipeForObjective(r, objective) }))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.r);
    const topN = Math.min(8, ranked.length);
    const random = ranked[Math.floor(Math.random() * topN)];
    setPlanning(prev => ({
      ...prev,
      [day]: { ...prev[day], [mealType]: random.id }
    }));
  };

  const openDuplicatePanel = (day, mealType) => {
    setContextMenu({ day: null, mealType: null });
    setDupPanel({ day, mealType, selectedDays: [] });
  };

  const toggleDupDay = (d) => {
    setDupPanel(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(d)
        ? prev.selectedDays.filter(x => x !== d)
        : [...prev.selectedDays, d]
    }));
  };

  const confirmDuplicate = () => {
    const { day, mealType, selectedDays } = dupPanel;
    const recipeId = planning[day]?.[mealType];
    const sourceMultiplier = getMealMultiplier(day, mealType);
    if (!recipeId || selectedDays.length === 0) return;
    setPlanning(prev => {
      const next = { ...prev };
      selectedDays.forEach(d => {
        next[d] = { ...next[d], [mealType]: recipeId };
      });
      return next;
    });
    setMealMultipliers(prev => {
      const next = { ...prev };
      selectedDays.forEach(d => {
        const targetKey = `${d}-${mealType}`;
        if (sourceMultiplier === 1) delete next[targetKey];
        else next[targetKey] = sourceMultiplier;
      });
      return next;
    });
    setDupPanel({ day: null, mealType: null, selectedDays: [] });
  };

  const closeAllMenus = () => {
    setContextMenu({ day: null, mealType: null });
    setDupPanel({ day: null, mealType: null, selectedDays: [] });
  };

  const togglePin = (day, mealType) => {
    const key = `${day}-${mealType}`;
    setPinnedMeals(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const swapMeals = (fromDay, toDay, mealType) => {
    if (fromDay === toDay) return;
    const fromId = planning[fromDay]?.[mealType];
    const toId = planning[toDay]?.[mealType];
    setPlanning(prev => ({
      ...prev,
      [fromDay]: { ...prev[fromDay], [mealType]: toId ?? prev[fromDay]?.[mealType] },
      [toDay]: { ...prev[toDay], [mealType]: fromId ?? prev[toDay]?.[mealType] },
    }));
    const fromKey = `${fromDay}-${mealType}`;
    const toKey = `${toDay}-${mealType}`;
    setPinnedMeals(prev => {
      const a = !!prev[fromKey];
      const b = !!prev[toKey];
      const next = { ...prev };
      if (a !== b) {
        next[fromKey] = b;
        next[toKey] = a;
      }
      return next;
    });
    setMealMultipliers(prev => {
      const fromMult = prev[fromKey] ?? 1;
      const toMult = prev[toKey] ?? 1;
      const next = { ...prev };
      if (toMult === 1) delete next[fromKey];
      else next[fromKey] = toMult;
      if (fromMult === 1) delete next[toKey];
      else next[toKey] = fromMult;
      return next;
    });
  };

  const getRecipe = (id) => (recipesList || []).find(r => r.id === id);

  const [dragState, setDragState] = useState({ day: null, mealType: null });
  const [hoverDrop, setHoverDrop] = useState({ day: null, mealType: null });
  const [recentlySwapped, setRecentlySwapped] = useState({ fromDay: null, toDay: null, mealType: null });

  const handleDragStart = (e, day, mealType) => {
    setDragState({ day, mealType });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${day}-${mealType}`);
  };

  const handleDragEnd = () => {
    setDragState({ day: null, mealType: null });
    setHoverDrop({ day: null, mealType: null });
  };

  const handleDragOver = (e, day, mealType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragState.day !== day && dragState.mealType === mealType) {
      setHoverDrop({ day, mealType });
    }
  };

  const handleDrop = (e, toDay, mealType) => {
    e.preventDefault();
    if (editingPlanningId && isDayPast(toDay, editWeekStart)) {
      setDragState({ day: null, mealType: null });
      setHoverDrop({ day: null, mealType: null });
      return;
    }
    const fromDay = dragState.day;
    if (fromDay && fromDay !== toDay && dragState.mealType === mealType) {
      swapMeals(fromDay, toDay, mealType);
      setRecentlySwapped({ fromDay, toDay, mealType });
      setTimeout(() => setRecentlySwapped({ fromDay: null, toDay: null, mealType: null }), 450);
    }
    setDragState({ day: null, mealType: null });
    setHoverDrop({ day: null, mealType: null });
  };

  const isInRecentlySwapped = (day, mealType) =>
    recentlySwapped.mealType === mealType && (recentlySwapped.fromDay === day || recentlySwapped.toDay === day);

  // Lookup nom→rayon depuis la table ingredients (DB)
  const rayonLookup = useMemo(() => {
    const map = new Map();
    for (const { name, rayon } of ingredientRayons) {
      map.set(name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim(), rayon);
    }
    return map;
  }, [ingredientRayons]);

  const groceryList = useMemo(() => {
    // Catégorise via le rayon DB, fallback sur le regex
    function catIngredient(ing) {
      if (rayonLookup.size === 0) return categorizeIngredient(ing);
      const parsed = parseIngredient(ing);
      const raw = (parsed.name || parsed.nameOnly || ing).toLowerCase()
        .normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
      if (rayonLookup.has(raw)) return rayonLookup.get(raw);
      // Sans modifiers
      const stripped = raw.replace(MODIFIERS_REG, '').replace(/\s+/g, ' ').trim();
      if (stripped && rayonLookup.has(stripped)) return rayonLookup.get(stripped);
      const sing = stripped.replace(/s$/, '');
      if (sing && rayonLookup.has(sing)) return rayonLookup.get(sing);
      // Contenu partiel
      for (const [key, rayon] of rayonLookup) {
        if (key.length > 3 && (raw.includes(key) || key.includes(raw))) return rayon;
      }
      return categorizeIngredient(ing);
    }

    const rawByCategory = {};
    days.forEach(day => {
      if (skippedDays[day]) return;
      const activeMealTypes = mealTypes.slice(0, mealsPerDay);
      activeMealTypes.forEach(mt => {
        const recipeId = planning[day]?.[mt.id];
        const recipe = getRecipe(recipeId);
        if (recipe) {
          const mealMultiplier = getMealMultiplier(day, mt.id);
          const effectivePortions = householdFactor ?? portions;
          const scale = (effectivePortions * mealMultiplier) / (recipe.servings || 1);
          recipe.ingredients.forEach(ing => {
            const cat = catIngredient(ing);
            if (!rawByCategory[cat]) rawByCategory[cat] = [];
            rawByCategory[cat].push({ raw: ing, scale });
          });
        }
      });
    });
    return aggregateIngredientsByCategory(rawByCategory);
  }, [planning, mealsPerDay, portions, householdFactor, skippedDays, mealMultipliers, rayonLookup]);

  useEffect(() => {
    if (!showGroceryList) {
      setGroceryListStep('loading');
      return;
    }
    setGroceryListStep('loading');
    setPantryChecked(new Set());
    setGroceryChecked(new Set());
    const t = setTimeout(() => setGroceryListStep('pantry'), 550);
    return () => clearTimeout(t);
  }, [showGroceryList]);

  const groceryFlat = useMemo(() => {
    const flat = [];
    Object.entries(groceryList).forEach(([category, items]) => {
      items.forEach(name => flat.push({ category, name }));
    });
    return flat;
  }, [groceryList]);

  const isCommonPantry = (name) => {
    const lower = name.toLowerCase();
    const common = [
      'sel', 'poivre', 'pâtes', 'pates', 'riz', 'oignon', 'oignons', 'ail', 'huile', 'farine',
      'sucre', 'vinaigre', 'moutarde', 'paprika', 'curry', 'cumin', 'curcuma', 'origan',
      'basilic', 'persil', 'thym', 'laurier', 'piment', 'cannelle', 'muscade', 'levure',
      'bicarbonate', 'maïzena', 'cornichon', 'câpres', 'olive', 'tomate séchée', 'confiture',
      'miel', 'sirop', 'sauce soja', 'tahini', 'bouillon', 'lait', 'crème', 'beurre',
      'œuf', 'oeuf', 'pain', 'tortilla', 'quinoa', 'avoine', 'lentille', 'pois chiche',
      'haricot', 'noix', 'amande', 'cacahuète', 'cacao', 'chocolat'
    ];
    return common.some(term => lower.includes(term));
  };

  const pantryItems = useMemo(() => groceryFlat.filter(({ name }) => isCommonPantry(name)), [groceryFlat]);
  const restItems = useMemo(() => groceryFlat.filter(({ name }) => !isCommonPantry(name)), [groceryFlat]);

  const togglePantryItem = (name) => {
    setPantryChecked(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleGroceryItem = (category, item) => {
    const key = `${category}-${item}`;
    setGroceryChecked(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toBuyByCategory = useMemo(() => {
    const toBuy = [
      ...pantryItems.filter(({ name }) => !pantryChecked.has(name)),
      ...restItems
    ];
    const byCat = {};
    toBuy.forEach(({ category, name }) => {
      if (!byCat[category]) byCat[category] = [];
      byCat[category].push(name);
    });
    return byCat;
  }, [pantryItems, restItems, pantryChecked]);

  const toBuyByCategoryOrdered = useMemo(() => {
    const entries = Object.entries(toBuyByCategory);
    return entries.sort(([a], [b]) => {
      const ia = RAYON_ORDER.indexOf(a);
      const ib = RAYON_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b, 'fr');
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [toBuyByCategory]);

  const activeMealTypes = mealTypes.slice(0, mealsPerDay);

  const handleGroceryClick = () => {
    if (requireAuthForAction('grocery')) return;
    setShowGroceryList(!showGroceryList);
    if (!showGroceryList) setActionFeedback('grocery');
  };

  const handleDownloadClick = () => {
    if (requireAuthForAction('download')) return;
    exportGroceryList(groceryList);
    setActionFeedback('download');
  };

  /** Lundi de la semaine courante (YYYY-MM-DD) si pas de semaine en édition. */
  const weekStartForCalendar = editWeekStart || (() => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    return monday.toISOString().slice(0, 10);
  })();

  const handleAddToCalendar = () => {
    if (requireAuthForAction('claim_planning')) return;
    const ics = buildPlanningIcs(planning, weekStartForCalendar, getRecipe, mealTypes, days, mealsPerDay);
    downloadPlanningIcs(ics);
    setActionFeedback('calendar');
  };

  const handleAddToGoogleCalendar = async () => {
    if (requireAuthForAction('claim_planning')) return;
    setAddingToGoogle(true);
    try {
      const result = await addToGoogleCalendar(planning, weekStartForCalendar, getRecipe, mealTypes, days, mealsPerDay);
      if (result.success) {
        setActionFeedback(result.count > 0 ? 'google_calendar' : 'google_calendar_empty');
        setGoogleCalendarCount(result.count);
      } else {
        setActionFeedback('google_calendar_error');
        setGoogleCalendarError(result.error || 'Erreur inconnue');
      }
    } catch (e) {
      setActionFeedback('google_calendar_error');
      setGoogleCalendarError(e?.message || 'Erreur');
    } finally {
      setAddingToGoogle(false);
    }
  };

  const doSavePlanning = () => {
    if (requireAuthForAction('claim_planning')) return;
    const today = new Date();
    const dateLabel = today.toLocaleDateString('fr-FR');
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    const weekStart = setupPreviewInit?.targetWeekStart || monday.toISOString().slice(0, 10);

    if (editingPlanningId && updatePlanning) {
      savePlanningPreferences?.(getCurrentPreferencesPayload());
      updatePlanning(editingPlanningId, {
        meals: { ...planning },
        meal_multipliers: { ...mealMultipliers },
        label: dateLabel,
        objective,
        week_start: weekStart,
      });
      setActionFeedback('updated');
      return;
    }
    if (savePlanning) {
      savePlanningPreferences?.(getCurrentPreferencesPayload());
      savePlanning({
        date: dateLabel,
        objective,
        meals: { ...planning },
        mealMultipliers: { ...mealMultipliers },
        weekStart,
      });
      setHasSavedPlanning(true);
      setActionFeedback('save');
    }
  };

  useLayoutEffect(() => {
    if (!location.state?.setupPreview || setupPreviewClearedRef.current) return;
    setupPreviewClearedRef.current = true;
    navigate(`${location.pathname}${location.search || ''}`, { replace: true, state: {} });
  }, [location.state, location.pathname, location.search, navigate]);

  // Restaurer un planning guest généré (session) si l'utilisateur revient sur /planning
  useEffect(() => {
    if (user) return;
    if (!editInitDone) return;
    if (mineMode || editId || loadFromState || setupPreviewInit) return;
    if (generated) return;

    const raw = sessionStorage.getItem(SESSION_PLANNING_PREVIEW_KEY);
    if (!raw) return;
    const saved = safeJsonParse(raw);
    if (!saved || typeof saved !== 'object') return;

    const ts = Number(saved.ts) || 0;
    if (!ts || Date.now() - ts > SESSION_PLANNING_PREVIEW_MAX_AGE_MS) {
      sessionStorage.removeItem(SESSION_PLANNING_PREVIEW_KEY);
      return;
    }

    const nextPlanning = saved.planning;
    if (!nextPlanning || typeof nextPlanning !== 'object') return;
    // validation minimale: doit contenir au moins une clé de jour connue
    const hasKnownDay = days.some((d) => Object.prototype.hasOwnProperty.call(nextPlanning, d));
    if (!hasKnownDay) return;

    setObjective(saved.objective || 'masse');
    setNiveau(saved.niveau || 'amateur');
    setPoids(saved.poids != null ? String(saved.poids) : '');
    setRegime(saved.regime || 'vegetarien');
    setMealsPerDay(Number(saved.mealsPerDay) || 4);
    setPortions(Math.min(4, Math.max(1, Number(saved.portions) || 2)));
    setPlanning(nextPlanning);
    setMealMultipliers(saved.mealMultipliers && typeof saved.mealMultipliers === 'object' ? saved.mealMultipliers : {});
    setPinnedMeals(saved.pinnedMeals && typeof saved.pinnedMeals === 'object' ? saved.pinnedMeals : {});
    setSkippedDays(saved.skippedDays && typeof saved.skippedDays === 'object' ? saved.skippedDays : {});
    setGenerated(true);
    setOnboardingStep('preview');
  }, [user, editInitDone, mineMode, editId, loadFromState, setupPreviewInit, generated]);

  // Persister le planning guest en session pour éviter de le regénérer après navigation
  useEffect(() => {
    if (user) {
      sessionStorage.removeItem(SESSION_PLANNING_PREVIEW_KEY);
      return;
    }
    if (!editInitDone) return;
    if (mineMode || editId || loadFromState || setupPreviewInit) return;
    if (onboardingStep !== 'preview' || !generated) return;

    const payload = {
      ts: Date.now(),
      objective,
      regime,
      niveau,
      poids: Number(poids) || 70,
      mealsPerDay,
      portions,
      planning,
      mealMultipliers,
      pinnedMeals,
      skippedDays,
    };
    sessionStorage.setItem(SESSION_PLANNING_PREVIEW_KEY, JSON.stringify(payload));
  }, [
    user,
    editInitDone,
    mineMode,
    editId,
    loadFromState,
    setupPreviewInit,
    onboardingStep,
    generated,
    objective,
    regime,
    niveau,
    poids,
    mealsPerDay,
    portions,
    planning,
    mealMultipliers,
    pinnedMeals,
    skippedDays,
  ]);

  useEffect(() => {
    if (!user) return;
    const intent = location.state?.planningIntent;
    if (!intent || intentHandledRef.current) return;
    intentHandledRef.current = true;
    if (intent === 'grocery') {
      handleGroceryClick();
    } else if (intent === 'save') {
      doSavePlanning();
    } else if (intent === 'download') {
      handleDownloadClick();
    } else if (intent?.type === 'claim_planning') {
      const pref = intent.preferences || {};
      const restoredPlanning = intent.planning || defaultPlannings[pref.objective || 'masse']?.meals || defaultPlannings.masse.meals;
      const restoredMultipliers = intent.mealMultipliers || {};
      setObjective(pref.objective || 'masse');
      setNiveau(pref.niveau || 'amateur');
      setPoids(String(pref.poids ?? 70));
      setRegime(pref.regime || 'vegetarien');
      setMealsPerDay(pref.meals_per_day || 4);
      setPortions(Math.min(4, Math.max(1, pref.portions || 2)));
      setPlanning(restoredPlanning);
      setMealMultipliers(restoredMultipliers);
      setOnboardingStep('preview');
      savePlanningPreferences?.(pref);
      savePlanning?.({
        date: new Date().toLocaleDateString('fr-FR'),
        objective: pref.objective || objective,
        meals: restoredPlanning,
        mealMultipliers: restoredMultipliers,
      });
      setHasSavedPlanning(true);
      setActionFeedback('save');
    }
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [user, location.state, navigate]);

  useEffect(() => {
    if (!user || editingPlanningId || !planningPreferences) return;
    setObjective(planningPreferences.objective || 'masse');
    setNiveau(planningPreferences.niveau || 'amateur');
    setPoids(String(planningPreferences.poids ?? 70));
    setRegime(planningPreferences.regime || 'vegetarien');
    setMealsPerDay(planningPreferences.meals_per_day || 4);
    setPortions(Math.min(4, Math.max(1, planningPreferences.portions || 2)));
    setOnboardingStep('preview');
  }, [user, planningPreferences, editingPlanningId]);

  // Charger un planning sauvegardé en mode édition (?edit=id ou state.loadPlanning)
  useEffect(() => {
    if (editInitDone) return;
    if (loadFromState && typeof loadFromState.meals === 'object') {
      setPlanning(loadFromState.meals || defaultPlannings.masse.meals);
      setMealMultipliers(loadFromState.mealMultipliers || {});
      setObjective(loadFromState.objective || 'masse');
      setGenerated(true);
      const ws = loadFromState.weekStart || null;
      setEditWeekStart(ws);
      setEditingPlanningId(loadFromState.id || null);
      setEditInitDone(true);
      return;
    }
    if (editId && !authLoading) {
      if (savedPlannings?.length > 0) {
        const found = savedPlannings.find((p) => p.id === editId);
        if (found) {
          setPlanning(found.meals || defaultPlannings.masse.meals);
          setMealMultipliers(found.mealMultipliers || {});
          setObjective(found.objective || 'masse');
          setGenerated(true);
          const ws = found.weekStart || null;
          setEditWeekStart(ws);
          setEditingPlanningId(found.id);
        }
      }
      setEditInitDone(true);
      return;
    }
    if (!editId && !loadFromState) {
      setEditInitDone(true);
    }
  }, [editId, loadFromState, savedPlannings, editInitDone, authLoading]);

  // Confettis — une seule fois à l'arrivée depuis le funnel
  useEffect(() => {
    if (confettiFiredRef.current) return;
    const pending = sessionStorage.getItem('planning_confetti_pending');
    if (!pending && !cameFromSetupFunnel) return;
    confettiFiredRef.current = true;
    sessionStorage.removeItem('planning_confetti_pending');
    const t = setTimeout(() => launchConfetti(), 350);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-portions au montage pour les plannings venus du funnel PlanningSetup
  useEffect(() => {
    if (autoPortionsSetRef.current) return;
    if (!setupPreviewInit?.planning || !recipesList?.length) return;
    autoPortionsSetRef.current = true;
    const activeTypes = mealTypes.slice(0, mealsPerDay);
    let rawTotalProtein = 0;
    let rawCountedDays = 0;
    days.forEach(day => {
      let dayProt = 0;
      activeTypes.forEach(mt => {
        const r = recipesList.find(rx => rx.id === setupPreviewInit.planning[day]?.[mt.id]);
        if (r) dayProt += (r.protein ?? 0);
      });
      if (dayProt > 0) { rawCountedDays++; rawTotalProtein += dayProt; }
    });
    if (rawCountedDays === 0) return;
    const avgProtPerDay = rawTotalProtein / rawCountedDays;
    const kg = Math.max(40, Math.min(150, Number(setupPreviewInit.poids ?? poids) || 70));
    const obj = setupPreviewInit.objective ?? objective;
    const niv = setupPreviewInit.niveau ?? niveau;
    const proteinRefs = {
      masse:     { debutant: 1.7, amateur: 1.9, confirme: 2.1 },
      seche:     { debutant: 1.9, amateur: 2.1, confirme: 2.35 },
      endurance: { debutant: 1.3, amateur: 1.5, confirme: 1.7 },
      sante:     { debutant: 1.3, amateur: 1.5, confirme: 1.7 },
    };
    const protPerKg = (proteinRefs[obj] ?? proteinRefs.masse)[niv] ?? 1.9;
    const target = Math.round(protPerKg * kg);
    // Tester toutes les combinaisons portions × multiplier
    const mults = MEAL_SIZE_OPTIONS.map(o => o.mult);
    let bestCombo = { portions: 1, mult: 1, diff: Infinity };
    for (let p = 1; p <= 4; p++) {
      for (const m of mults) {
        const achieved = avgProtPerDay * p * m;
        const diff = Math.abs(achieved - target);
        if (diff < bestCombo.diff) {
          bestCombo = { portions: p, mult: m, diff };
        }
      }
    }
    setPortions(bestCombo.portions);
    if (bestCombo.mult !== 1) {
      const activeTypes = mealTypes.slice(0, mealsPerDay);
      const newMultipliers = {};
      days.forEach(day => {
        activeTypes.forEach(mt => {
          if (setupPreviewInit.planning[day]?.[mt.id]) {
            newMultipliers[`${day}-${mt.id}`] = bestCombo.mult;
          }
        });
      });
      setMealMultipliers(newMultipliers);
    }
  }, [recipesList]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mineMode || !user || authLoading || editId) return;
    if (!savedPlannings?.length) return;
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    const currentWeekStart = monday.toISOString().slice(0, 10);
    const mine = savedPlannings.find((p) => p.weekStart === currentWeekStart) || savedPlannings[0];
    if (!mine) return;
    setPlanning(mine.meals || defaultPlannings.masse.meals);
    setMealMultipliers(mine.mealMultipliers || {});
    setObjective(mine.objective || objective);
    setEditWeekStart(mine.weekStart || null);
    setEditingPlanningId(mine.id || null);
    setOnboardingStep('preview');
    setGenerated(true);
  }, [mineMode, user, authLoading, editId, savedPlannings]);


  /* Niveaux d'activité pour le filtre */
  const niveaux = [
    { id: 'debutant', label: 'Débutant' },
    { id: 'amateur', label: 'Amateur' },
    { id: 'confirme', label: 'Confirmé' },
  ];

  const normalizedWeight = useMemo(
    () => Math.max(40, Math.min(150, Number(poids) || 70)),
    [poids]
  );

  /*
   * Références en g/kg et tendance calorique (vs maintien ~30 kcal/kg),
   * d'après recommandations sportives (6dsportsnutrition, athleticlab, rippedbody, etc.)
   */
  const DAILY_TARGETS = useMemo(() => {
    const kg = normalizedWeight;
    const MAINTENANCE_KCAL_PER_KG = 30;

    const targetsByObjectiveLevel = {
      masse: {
        debutant: { proteinPerKg: 1.7, carbsPerKg: 4.5, fatPerKg: 0.9, calMult: 1.08 },
        amateur:  { proteinPerKg: 1.9, carbsPerKg: 5,   fatPerKg: 0.9, calMult: 1.10 },
        confirme: { proteinPerKg: 2.1, carbsPerKg: 6,   fatPerKg: 0.85, calMult: 1.10 },
      },
      endurance: {
        debutant: { proteinPerKg: 1.3, carbsPerKg: 4.5, fatPerKg: 0.9, calMult: 1.0 },
        amateur:  { proteinPerKg: 1.5, carbsPerKg: 6,   fatPerKg: 0.9, calMult: 1.0 },
        confirme: { proteinPerKg: 1.7, carbsPerKg: 7,   fatPerKg: 0.9, calMult: 1.05 },
      },
      sante: {
        debutant: { proteinPerKg: 1.3, carbsPerKg: 3.5, fatPerKg: 0.9, calMult: 1.0 },
        amateur:  { proteinPerKg: 1.5, carbsPerKg: 4,   fatPerKg: 0.9, calMult: 1.0 },
        confirme: { proteinPerKg: 1.7, carbsPerKg: 5,   fatPerKg: 0.9, calMult: 1.0 },
      },
      seche: {
        debutant: { proteinPerKg: 1.9, carbsPerKg: 2.5, fatPerKg: 0.7, calMult: 0.875 },
        amateur:  { proteinPerKg: 2.1, carbsPerKg: 2.75, fatPerKg: 0.65, calMult: 0.825 },
        confirme: { proteinPerKg: 2.35, carbsPerKg: 2.25, fatPerKg: 0.6, calMult: 0.85 },
      },
    };

    const obj = targetsByObjectiveLevel[objective] || targetsByObjectiveLevel.masse;
    const ref = obj[niveau] || obj.amateur;
    return {
      protein: Math.round(ref.proteinPerKg * kg),
      carbs:   Math.round(ref.carbsPerKg * kg),
      fat:    Math.round(ref.fatPerKg * kg),
      calories: Math.round(MAINTENANCE_KCAL_PER_KG * kg * ref.calMult),
    };
  }, [objective, niveau, normalizedWeight]);

  const dailyNutrition = useMemo(() => {
    const activeDays = days.filter(d => !skippedDays[d]);
    if (activeDays.length === 0) return null;
    let totalProtein = 0;
    let totalCalories = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let daysWithMeals = 0;
    activeDays.forEach(day => {
      let dayProtein = 0;
      let dayCalories = 0;
      let dayCarbs = 0;
      let dayFat = 0;
      activeMealTypes.forEach(mt => {
        const recipe = getRecipe(planning[day]?.[mt.id]);
        if (recipe) {
          const mealMultiplier = getMealMultiplier(day, mt.id);
          // Macros de l'utilisateur seul (owner factor), pas du foyer entier
          const effectivePortions = ownerFactor ?? portions;
          const ratio = effectivePortions * mealMultiplier;
          dayProtein += (recipe.protein ?? 0) * ratio;
          dayCalories += (recipe.calories ?? 0) * ratio;
          dayCarbs += (recipe.carbs ?? 0) * ratio;
          dayFat += (recipe.fat ?? 0) * ratio;
        }
      });
      if (dayProtein > 0 || dayCalories > 0) {
        daysWithMeals += 1;
        totalProtein += dayProtein;
        totalCalories += dayCalories;
        totalCarbs += dayCarbs;
        totalFat += dayFat;
      }
    });
    if (daysWithMeals === 0) return null;
    return {
      protein: Math.round(totalProtein / daysWithMeals),
      calories: Math.round(totalCalories / daysWithMeals),
      carbs: Math.round(totalCarbs / daysWithMeals),
      fat: Math.round(totalFat / daysWithMeals),
      daysCount: daysWithMeals,
    };
  }, [planning, portions, ownerFactor, skippedDays, activeMealTypes, mealMultipliers]);

  const nutritionBars = useMemo(() => {
    if (!dailyNutrition) return null;
    const { protein, calories, carbs, fat } = dailyNutrition;
    const t = DAILY_TARGETS;
    return {
      protein: { value: protein, target: t.protein, pct: Math.min(100, Math.round((protein / t.protein) * 100)) },
      calories: { value: calories, target: t.calories, pct: Math.min(120, Math.round((calories / t.calories) * 100)) },
      carbs: { value: carbs, target: t.carbs, pct: Math.min(100, Math.round((carbs / t.carbs) * 100)) },
      fat: { value: fat, target: t.fat, pct: Math.min(100, Math.round((fat / t.fat) * 100)) },
    };
  }, [dailyNutrition, DAILY_TARGETS]);

  const nutritionWarnings = useMemo(() => {
    if (!nutritionBars) return [];
    const warnings = [];
    if (nutritionBars.protein.pct < 80) warnings.push('protein');
    if (nutritionBars.calories.pct < 80) warnings.push('calories');
    if (nutritionBars.carbs.pct < 75) warnings.push('carbs');
    return warnings;
  }, [nutritionBars]);

  const planningWhy = useMemo(() => {
    if (!dailyNutrition || !nutritionBars) return null;

    const objectiveLabel = objectives.find((o) => o.id === objective)?.label ?? objective;
    const niveauLabel = niveaux.find((n) => n.id === niveau)?.label ?? niveau;
    const t = DAILY_TARGETS;

    let best = null;
    days.forEach((day) => {
      if (skippedDays?.[day]) return;
      activeMealTypes.forEach((mt) => {
        const recipeId = planning?.[day]?.[mt.id];
        if (!recipeId) return;
        const recipe = getRecipe(recipeId);
        if (!recipe) return;
        const mult = getMealMultiplier(day, mt.id);
        const effectiveP = householdFactor ?? (Number(portions) || 1);
        const ratio = effectiveP * (Number(mult) || 1);
        const prot = Math.round((recipe.protein ?? 0) * ratio);
        if (!best || prot > best.protein) {
          best = { day, mealLabel: mt.label, recipeTitle: recipe.title, protein: prot };
        }
      });
    });

    const proteinLine = t?.protein
      ? `En moyenne, tu es à ${nutritionBars.protein.pct}% de ton objectif protéines (${nutritionBars.protein.value}g / ${t.protein}g).`
      : `En moyenne, tu es à ${nutritionBars.protein.value}g de protéines par jour.`;

    const exampleLine = best
      ? `Exemple : ${best.mealLabel} (${best.day}) te donne ~${best.protein}g de protéines.`
      : null;

    return { objectiveLabel, niveauLabel, proteinLine, exampleLine };
  }, [
    DAILY_TARGETS,
    activeMealTypes,
    dailyNutrition,
    getMealMultiplier,
    getRecipe,
    nutritionBars,
    objective,
    niveau,
    planning,
    portions,
    skippedDays,
  ]);

  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <Toast
          open={!!actionFeedback}
          onClose={() => setActionFeedback(null)}
          duration={6000}
          variant="success"
          icon={<Check size={22} className="text-secondary" strokeWidth={2.5} />}
        >
          {actionFeedback === 'grocery' && (
            <p>Ta liste de courses est affichée ci-dessous.</p>
          )}
          {actionFeedback === 'save' && (
            <p>
              Ton planning a été sauvegardé.{' '}
              <Link to="/profil" className="text-secondary font-medium hover:underline inline-flex items-center gap-1">
                Voir ton planning dans ton espace
                <ChevronRight size={14} />
              </Link>
            </p>
          )}
          {actionFeedback === 'download' && (
            <p>Ta liste de courses a été téléchargée.</p>
          )}
          {actionFeedback === 'copy' && (
            <p>Liste copiée dans le presse-papier. Colle-la dans ton drive.</p>
          )}
          {actionFeedback === 'calendar' && (
            <p>Planning exporté en .ics. Ouvre le fichier pour l'ajouter à Apple Calendar ou Outlook.</p>
          )}
          {actionFeedback === 'google_calendar' && (
            <p>{googleCalendarCount} repas ajoutés à ton Google Calendar.</p>
          )}
          {actionFeedback === 'google_calendar_empty' && (
            <p>Aucun repas à ajouter (planning vide pour cette semaine).</p>
          )}
          {actionFeedback === 'google_calendar_error' && (
            <p>Erreur : {googleCalendarError}</p>
          )}
          {actionFeedback === 'updated' && (
            <p>
              Modifications enregistrées.{' '}
              <Link to="/profil" className="text-secondary font-medium hover:underline inline-flex items-center gap-1">
                Voir ton planning
                <ChevronRight size={14} />
              </Link>
            </p>
          )}
        </Toast>

        {/* Header : étape préférences (pleine largeur) ou aperçu (titre centré, plus compact) */}
        {onboardingStep === 'preferences' ? (
          <div className="mb-16 flex flex-col lg:flex-row lg:items-start lg:gap-8 px-[10%] lg:px-[10%]">
            <div className="lg:max-w-md shrink-0">
              <p className="text-xs uppercase tracking-[0.2em] text-text-light mb-3">Programme alimentaire végétarien</p>
              <h1 className="font-display text-3xl sm:text-4xl text-text">
                Ton planning repas végétarien de la semaine
              </h1>
              {editingPlanningId && (
                <p className="mt-3 text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 max-w-xl">
                  Tu modifies un planning sauvegardé. Les jours déjà passés ne sont pas modifiables.
                </p>
              )}
            </div>
            <p className="mt-4 lg:mt-9 lg:flex-1 lg:min-w-0 text-base sm:text-lg text-text-light leading-relaxed">
              Dis-nous ton objectif et ton profil : on te prépare un premier planning personnalisé en quelques secondes.
            </p>
          </div>
        ) : (
          <div className="mb-8 text-center max-w-2xl mx-auto px-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-light mb-2">Programme alimentaire végétarien</p>
            <h1 className="font-display text-3xl sm:text-4xl text-text">Découvre ton planning de la semaine</h1>
            <p className="mt-3 text-sm sm:text-base text-text-light leading-relaxed">
              Modifie comme tu souhaites ton planning et enregistre-le pour commencer à cuisiner.
            </p>
            {editingPlanningId && (
              <p className="mt-4 text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 inline-block">
                Tu modifies un planning sauvegardé — les jours passés ne sont plus modifiables.
              </p>
            )}
          </div>
        )}

        {!isFunnelPlanningPreview && onboardingStep === 'preferences' && (
        <section className="mb-10 rounded-2xl border border-border bg-white p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <aside className="lg:col-span-3">
              <p className="text-xs uppercase tracking-[0.15em] text-text-light mb-3">
                Etape {currentStepIndex} sur 3
              </p>
              <div className="space-y-2">
                {[
                  { id: 1, label: 'Tes infos sportives' },
                  { id: 2, label: 'Ton planning personalise' },
                  { id: 3, label: 'Sauvegarde sur ton compte' },
                ].map((step) => {
                  const isDone = currentStepIndex > step.id;
                  const isActive = currentStepIndex === step.id;
                  return (
                    <div
                      key={step.id}
                      className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'border-primary/40 bg-primary/10 text-primary font-medium'
                          : isDone
                            ? 'border-secondary/30 bg-secondary/10 text-secondary'
                            : 'border-border bg-bg-warm text-text-light'
                      }`}
                    >
                      {isDone ? '✓ ' : `${step.id}. `}
                      {step.label}
                    </div>
                  );
                })}
              </div>
            </aside>

            <div className="lg:col-span-9">
              {/* Settings — style segmented / champs neutres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="planning-filter-label">
                    Objectif
                  </label>
                  <div className="relative">
                    <select
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      className="planning-filter-input w-full appearance-none bg-[rgb(0,0,0,0.04)] border border-transparent rounded-[10px] px-4 py-3 text-text pr-10 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
                    >
                      {objectives.map(o => (
                        <option key={o.id} value={o.id}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="planning-filter-label">
                    Régime
                  </label>
                  <div className="relative">
                    <select
                      value={regime}
                      onChange={(e) => setRegime(e.target.value)}
                      className="planning-filter-input w-full appearance-none bg-[rgb(0,0,0,0.04)] border border-transparent rounded-[10px] px-4 py-3 text-text pr-10 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
                    >
                      {regimes.map(r => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="planning-filter-label">
                    Niveau
                  </label>
                  <div className="relative">
                    <select
                      value={niveau}
                      onChange={(e) => setNiveau(e.target.value)}
                      className="planning-filter-input w-full appearance-none bg-[rgb(0,0,0,0.04)] border border-transparent rounded-[10px] px-4 py-3 text-text pr-10 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
                    >
                      {niveaux.map(n => (
                        <option key={n.id} value={n.id}>{n.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="planning-filter-label">
                    Poids (kg)
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={150}
                    value={poids}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setPoids(e.target.value)}
                    className="planning-filter-input w-full bg-[rgb(0,0,0,0.04)] border border-transparent rounded-[10px] px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
                    placeholder="70"
                  />
                </div>
                <div>
                  <label className="planning-filter-label">
                    Repas / jour
                  </label>
                  <div className="segment-group segment-group--compact">
                    {[3, 4].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setMealsPerDay(n)}
                        className={`segment-item ${mealsPerDay === n ? 'is-selected' : ''}`}
                      >
                        {n} repas
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  {hasHousehold ? (
                    <HouseholdEditor compact />
                  ) : (
                    <>
                      <label className="planning-filter-label">
                        Personnes
                      </label>
                      <div className="segment-group segment-group--compact">
                        {[
                          { n: 1, label: 'Moi' },
                          { n: 2, label: '2 pers.' },
                          { n: 3, label: '3 pers.' },
                          { n: 4, label: '4 pers.' },
                        ].map(({ n, label }) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setPortions(n)}
                            className={`segment-item ${portions === n ? 'is-selected' : ''}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {onboardingStep === 'preferences' && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm text-text mb-3">
                    Renseigne tes infos puis genere ton planning personnalise.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateFromPreferences}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-primary text-white text-sm font-medium rounded-[10px] hover:bg-primary-dark transition-colors"
                  >
                    Voir mon planning personnalise
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

            </div>
          </div>
        </section>
        )}

        {/* Macro cards */}
        {onboardingStep === 'preview' && nutritionBars && (
          <div className="mb-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { key: 'protein',  label: 'Protéines', unit: 'g',    icon: Beef },
                { key: 'calories', label: 'Calories',  unit: 'kcal', icon: Flame },
                { key: 'carbs',    label: 'Glucides',  unit: 'g',    icon: null },
                { key: 'fat',      label: 'Lipides',   unit: 'g',    icon: null },
              ].map(({ key, label, unit, icon: Icon }) => {
                const bar = nutritionBars[key];
                const isOk  = bar.pct >= 85;
                const isLow = bar.pct < 70;
                return (
                  <div key={key} className="bg-white rounded-xl p-4 sm:p-5 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon size={15} className="text-text-light" />}
                        <span className="text-xs font-accent uppercase tracking-wider text-text-light">{label}</span>
                      </div>
                      <span className={`text-xs font-semibold ${isOk ? 'text-secondary' : isLow ? 'text-red-500' : 'text-primary'}`}>
                        {bar.pct}%
                      </span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-display font-medium text-text tabular-nums leading-none">
                      {bar.value}
                      <span className="text-sm font-sans font-normal text-text-light ml-1.5">/ {bar.target} {unit}</span>
                    </p>
                    <div className="mt-3 h-2 bg-border/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isOk ? 'bg-secondary' : isLow ? 'bg-red-400' : 'bg-primary/70'}`}
                        style={{ width: `${Math.min(100, bar.pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-text-light text-right font-accent">
              {portions === 1 ? 'Juste moi' : `${portions} pers.`} · {objectives.find(o => o.id === objective)?.label ?? objective} · {niveaux.find(n => n.id === niveau)?.label ?? niveau} · {normalizedWeight} kg
            </p>
          </div>
        )}



        {onboardingStep === 'preview' && (
        <>
        {/* Barre d'actions fixe en bas (mobile) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border px-4 py-3 safe-bottom">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleGroceryClick}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-[10px] bg-black/[0.04] text-text hover:bg-black/[0.08] border border-transparent"
            >
              <ShoppingCart size={14} />
              {showGroceryList ? 'Masquer' : 'Courses'}
            </button>
            <button
              type="button"
              onClick={doSavePlanning}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-[10px] bg-primary text-white hover:bg-primary-dark shadow-sm shadow-primary/20"
            >
              <Check size={14} />
              {editingPlanningId ? 'Enregistrer' : hasSavedPlanning ? 'Sauvé' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Barre d'actions horizontale — desktop */}
        <div className="hidden lg:flex items-center justify-between gap-2 mb-6">
          <button
            type="button"
            onClick={doSavePlanning}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-[10px] hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20"
          >
            <Check size={15} />
            {editingPlanningId ? 'Enregistrer les modifications' : hasSavedPlanning ? 'Sauvegardé ✓' : 'Sauvegarder mon planning'}
          </button>
          <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGroceryClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black/[0.04] text-text text-sm font-medium rounded-[10px] hover:bg-black/[0.08] transition-colors border border-transparent"
          >
            <ShoppingCart size={15} />
            {showGroceryList ? 'Masquer liste' : 'Liste de courses'}
          </button>
          <button
            type="button"
            onClick={handleDownloadClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black/[0.04] text-text text-sm font-medium rounded-[10px] hover:bg-black/[0.08] transition-colors border border-transparent"
          >
            <Download size={15} />
            Télécharger
          </button>
          {hasGoogleCalendarConfig() ? (
            <>
              <button
                type="button"
                onClick={handleAddToGoogleCalendar}
                disabled={addingToGoogle}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-black/[0.04] text-text text-sm font-medium rounded-[10px] hover:bg-black/[0.08] transition-colors border border-transparent disabled:opacity-60"
              >
                {addingToGoogle ? <Loader2 size={15} className="animate-spin" /> : <Calendar size={15} />}
                {addingToGoogle ? 'Connexion…' : 'Google Calendar'}
              </button>
              <button
                type="button"
                onClick={handleAddToCalendar}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-black/[0.04] text-text text-sm font-medium rounded-[10px] hover:bg-black/[0.08] transition-colors border border-transparent"
              >
                <Download size={15} />
                .ics (Apple, Outlook)
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleAddToCalendar}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black/[0.04] text-text text-sm font-medium rounded-[10px] hover:bg-black/[0.08] transition-colors border border-transparent"
            >
              <Calendar size={15} />
              Calendrier
            </button>
          )}
          </div>
        </div>

        <div className="space-y-6">
        {/* ===== DESKTOP Planning Table (hidden on mobile) ===== */}
        <div className="hidden lg:block overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0">
          <div className="min-w-[800px]">
            <div className="grid gap-2" style={{ gridTemplateColumns: `100px repeat(${days.length}, 1fr)` }}>
              <div />
              {days.map(day => {
                const dayIsPast = editingPlanningId && isDayPast(day, editWeekStart);
                return (
                  <div key={day} className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <p className={`text-sm font-medium uppercase tracking-wider capitalize ${skippedDays[day] ? 'text-text-light/40 line-through' : 'text-text-light'} ${dayIsPast ? 'opacity-80' : ''}`}>
                        {day}
                      </p>
                      {!dayIsPast && (
                        <button
                          type="button"
                          onClick={() => toggleSkipDay(day)}
                          className={`p-0.5 rounded transition-colors ${skippedDays[day] ? 'text-primary hover:text-primary-dark' : 'text-text-light/40 hover:text-text-light'}`}
                          title={skippedDays[day] ? 'Réactiver ce jour' : 'Désactiver ce jour'}
                        >
                          {skippedDays[day] ? <RotateCcw size={11} /> : <X size={11} />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {activeMealTypes.map(mt => (
              <div
                key={mt.id}
                className="grid gap-2 mt-2"
                style={{ gridTemplateColumns: `100px repeat(${days.length}, 1fr)` }}
              >
                <div className="flex items-center">
                  <p className="text-sm font-medium text-text-light">{mt.label}</p>
                </div>
                {days.map(day => {
                  if (skippedDays[day]) {
                    return (
                      <div key={day} className="bg-black/[0.02] rounded-xl p-3 min-h-[120px] flex items-center justify-center border border-dashed border-black/10">
                        <p className="text-xs text-text-light/40 italic">Jour off</p>
                      </div>
                    );
                  }
                  const recipeId = planning[day]?.[mt.id];
                  const recipe = getRecipe(recipeId);
                  const isPinned = pinnedMeals[`${day}-${mt.id}`];
                  const isPast = editingPlanningId && isDayPast(day, editWeekStart);
                  const isDragSource = dragState.day === day && dragState.mealType === mt.id;
                  const isDropTarget = !isPast && hoverDrop.day === day && hoverDrop.mealType === mt.id && !isDragSource;
                  const isLanded = isInRecentlySwapped(day, mt.id);

                  return (
                    <div
                      key={day}
                      draggable={!!recipe && !isPast}
                      onDragStart={(e) => !isPast && recipe && handleDragStart(e, day, mt.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => !isPast && handleDragOver(e, day, mt.id)}
                      onDrop={(e) => handleDrop(e, day, mt.id)}
                      className={`planning-cell bg-white rounded-xl p-3 min-h-[120px] flex flex-col border border-[rgb(0,0,0,0.08)] ${!isPast && recipe ? 'cursor-grab active:cursor-grabbing' : ''} ${isPast ? 'opacity-90 bg-black/[0.02]' : ''} ${
                        isDragSource ? 'is-drag-source' : ''
                      } ${isDropTarget ? 'is-drop-target' : ''} ${isLanded ? 'just-landed' : ''} ${
                        isPinned ? 'ring-1 ring-black/20' : ''
                      }`}
                    >
                      {recipe && !isDragSource ? (
                        <>
                          {/* Photo recette — format horizontal, saigne jusqu'aux bords */}
                          <div className="-mx-3 -mt-3 mb-2 overflow-hidden rounded-t-xl flex-shrink-0">
                            <div className="w-full aspect-[16/9] bg-bg-warm flex items-center justify-center">
                              <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          {!isPast && (
                            <div className="flex items-center justify-end gap-0.5 mb-1">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openDuplicatePanel(day, mt.id); }}
                                className="p-1 rounded-sm text-text-light hover:text-text hover:bg-black/5 transition-colors"
                                title="Dupliquer vers d'autres jours"
                              >
                                <Copy size={12} />
                              </button>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDupPanel({ day: null, mealType: null, selectedDays: [] });
                                    setContextMenu(prev =>
                                      prev.day === day && prev.mealType === mt.id
                                        ? { day: null, mealType: null }
                                        : { day, mealType: mt.id }
                                    );
                                  }}
                                  className="p-1 rounded-sm text-text-light hover:text-text hover:bg-black/5 transition-colors"
                                >
                                  <MoreVertical size={14} />
                                </button>
                                {contextMenu.day === day && contextMenu.mealType === mt.id && (
                                  <>
                                    <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-white border border-border rounded-sm shadow-lg overflow-hidden">
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); togglePin(day, mt.id); setContextMenu({ day: null, mealType: null }); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text hover:bg-black/5 transition-colors"
                                      >
                                        {isPinned ? <Lock size={12} /> : <LockOpen size={12} />}
                                        {isPinned ? 'Déverrouiller' : 'Garder ce plat'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); replaceRecipe(day, mt.id); setContextMenu({ day: null, mealType: null }); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text hover:bg-black/5 transition-colors"
                                      >
                                        <RefreshCw size={12} />
                                        Remplacer
                                      </button>
                                      <Link
                                        to={getRecipeUrl(recipe, day, mt.id)}
                                        state={getRecipeLinkState(day, mt.id)}
                                        onClick={(e) => { e.stopPropagation(); setContextMenu({ day: null, mealType: null }); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text hover:bg-black/5 transition-colors"
                                      >
                                        <ExternalLink size={12} />
                                        Ouvrir en détail
                                      </Link>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); startEditNote(day, mt.id); removeMeal(day, mt.id); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text hover:bg-black/5 transition-colors"
                                      >
                                        <Pencil size={12} />
                                        Écrire ma recette
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeMeal(day, mt.id); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                                      >
                                        <Trash2 size={12} />
                                        Supprimer
                                      </button>
                                    </div>
                                    <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); closeAllMenus(); }} />
                                  </>
                                )}
                              {dupPanel.day === day && dupPanel.mealType === mt.id && (
                                <>
                                  <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-white border border-border rounded-sm shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                    <p className="px-3 pt-2.5 pb-1 text-[13px] font-medium uppercase tracking-wider text-text-light">
                                      Dupliquer vers
                                    </p>
                                    <div className="px-2 py-1 space-y-0.5">
                                      {days.filter(d => d !== day && !(editingPlanningId && isDayPast(d, editWeekStart))).map(d => (
                                        <label
                                          key={d}
                                          className="flex items-center gap-2 px-1.5 py-1.5 rounded-sm hover:bg-black/5 cursor-pointer transition-colors"
                                          onClick={(e) => { e.preventDefault(); toggleDupDay(d); }}
                                        >
                                          <span className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors ${
                                            dupPanel.selectedDays.includes(d) ? 'bg-black border-black' : 'border-border'
                                          }`}>
                                            {dupPanel.selectedDays.includes(d) && <Check size={10} className="text-white" />}
                                          </span>
                                          <span className="text-xs text-text capitalize">{d}</span>
                                        </label>
                                      ))}
                                    </div>
                                    <div className="px-2 pb-2 pt-1 flex gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setDupPanel(prev => ({ ...prev, selectedDays: days.filter(d => d !== day && !(editingPlanningId && isDayPast(d, editWeekStart))) }))}
                                        className="flex-1 text-[13px] py-1.5 text-text-light hover:text-text border border-border rounded-sm transition-colors"
                                      >
                                        Tous
                                      </button>
                                      <button
                                        type="button"
                                        onClick={confirmDuplicate}
                                        disabled={dupPanel.selectedDays.length === 0}
                                        className="flex-1 text-[13px] py-1.5 font-medium bg-primary text-white rounded-sm hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                      >
                                        Valider
                                      </button>
                                    </div>
                                  </div>
                                  <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); closeAllMenus(); }} />
                                </>
                              )}
                            </div>
                            </div>
                          )}
                          <div className="w-full text-left flex-1 min-w-0">
                            {isPast ? (
                              <Link
                                to={getRecipeUrl(recipe, day, mt.id)}
                                state={getRecipeLinkState(day, mt.id)}
                                className="block"
                              >
                                <p className="text-sm font-medium text-text leading-snug hover:underline transition-colors line-clamp-2">
                                  {recipe.title}
                                </p>
                                <p className="text-xs text-text-light mt-1.5">
                                  {recipe.protein}g prot · {recipe.calories} kcal · <span className="italic">jour passé</span>
                                </p>
                              </Link>
                            ) : (
                              <button
                                type="button"
                                className="w-full text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewRecipe({ ...recipe, __planningContext: getRecipeLinkState(day, mt.id) });
                                }}
                              >
                                <p className="text-sm font-medium text-text leading-snug hover:underline transition-colors line-clamp-2">
                                  {recipe.title}
                                </p>
                                {(() => {
                                  if (hasHousehold) {
                                    const om = ownerMacros(recipe, effectiveHousehold);
                                    return om ? (
                                      <p className="text-xs text-text-light mt-1.5">{om.protein}g prot · {om.calories} kcal</p>
                                    ) : null;
                                  }
                                  return (
                                    <p className="text-xs text-text-light mt-1.5">
                                      {Math.round(recipe.protein * portions * getMealMultiplier(day, mt.id))}g prot · {Math.round(recipe.calories * portions * getMealMultiplier(day, mt.id))} kcal
                                    </p>
                                  );
                                })()}
                              </button>
                            )}
                            {!isPast && (
                              <MealPortionControl
                                day={day}
                                mealType={mt.id}
                                value={getMealMultiplier(day, mt.id)}
                                onChange={setMealMultiplier}
                              />
                            )}
                          </div>
                        </>
                      ) : isDragSource ? (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg bg-black/5 text-text-light">
                          <p className="text-xs font-medium">Glissez vers un autre jour</p>
                        </div>
                      ) : isPast ? (
                        <div className="flex-1 flex items-center justify-center text-text-light/40 text-xs italic">
                          Jour passé
                        </div>
                      ) : (
                        <EmptyMealSlot cellKey={`${day}-${mt.id}`} day={day} mealType={mt.id} mealNotes={mealNotes} editingNote={editingNote} startEditNote={startEditNote} saveNote={saveNote} clearNote={clearNote} setEditingNote={setEditingNote} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
        </div>
        </div>

        {/* ===== MOBILE Planning (accordion by day, visible < lg) ===== */}
        <div className="lg:hidden space-y-2">
          {days.map(day => {
            const isExpanded = expandedDay === day;
            const isSkipped = skippedDays[day];
            const dayIsPast = editingPlanningId && isDayPast(day, editWeekStart);
            return (
              <div key={day} className={`rounded-xl border overflow-hidden transition-colors ${isSkipped ? 'border-dashed border-black/10 bg-black/[0.02]' : 'border-black/8 bg-white'}`}>
                {/* Day header */}
                <button
                  type="button"
                  onClick={() => !isSkipped && setExpandedDay(isExpanded ? null : day)}
                  className={`w-full flex items-center justify-between px-4 py-3 ${isSkipped ? 'cursor-default' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    {!isSkipped && (
                      <ChevronRight size={16} className={`text-text-light transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    )}
                    <span className={`text-sm font-medium capitalize ${isSkipped ? 'text-text-light/40 line-through' : 'text-text'} ${dayIsPast ? 'opacity-80' : ''}`}>
                      {day}
                    </span>
                    {!isSkipped && !isExpanded && (
                      <span className="text-xs text-text-light ml-1">
                        {activeMealTypes.filter(mt => getRecipe(planning[day]?.[mt.id])).length} repas
                      </span>
                    )}
                    {isSkipped && (
                      <span className="text-xs text-text-light/40 italic ml-1">Jour off</span>
                    )}
                  </div>
                  {!dayIsPast && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleSkipDay(day); }}
                      className={`p-1.5 rounded-lg transition-colors ${isSkipped ? 'text-primary hover:bg-primary/10' : 'text-text-light/40 hover:text-red-500 hover:bg-red-50'}`}
                      title={isSkipped ? 'Réactiver ce jour' : 'Désactiver ce jour'}
                    >
                      {isSkipped ? <RotateCcw size={14} /> : <Trash2 size={14} />}
                    </button>
                  )}
                </button>

                {/* Meals (expanded) */}
                {isExpanded && !isSkipped && (
                  <div className="px-4 pb-4 space-y-2">
                    {activeMealTypes.map(mt => {
                      const recipeId = planning[day]?.[mt.id];
                      const recipe = getRecipe(recipeId);
                      const isPinned = pinnedMeals[`${day}-${mt.id}`];
                      const cellKey = `${day}-${mt.id}`;
                      if (!recipe) return (
                        <div key={mt.id} className="rounded-lg bg-black/[0.02] border border-dashed border-black/8 p-3">
                          <span className="text-xs font-medium text-text-light/50 uppercase tracking-wider">{mt.label}</span>
                          {dayIsPast ? (
                            <p className="text-xs text-text-light/40 italic mt-1">Jour passé</p>
                          ) : (
                            <EmptyMealSlot cellKey={cellKey} day={day} mealType={mt.id} mealNotes={mealNotes} editingNote={editingNote} startEditNote={startEditNote} saveNote={saveNote} clearNote={clearNote} setEditingNote={setEditingNote} />
                          )}
                        </div>
                      );
                      return (
                        <div key={mt.id} className={`rounded-lg bg-black/[0.02] border border-black/8 overflow-hidden ${isPinned ? 'ring-1 ring-black/20' : ''} ${dayIsPast ? 'opacity-90' : ''}`}>
                          {/* Photo recette mobile — format horizontal */}
                          <div className="overflow-hidden">
                            <div className="w-full aspect-[16/9] bg-bg-warm flex items-center justify-center">
                              <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="p-3.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-text-light uppercase tracking-wider">{mt.label}</span>
                            {!dayIsPast && (
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => openDuplicatePanel(day, mt.id)}
                                className="p-1 rounded text-text-light hover:text-text hover:bg-black/5 transition-colors"
                                title="Dupliquer"
                              >
                                <Copy size={12} />
                              </button>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDupPanel({ day: null, mealType: null, selectedDays: [] });
                                    setContextMenu(prev =>
                                      prev.day === day && prev.mealType === mt.id
                                        ? { day: null, mealType: null }
                                        : { day, mealType: mt.id }
                                    );
                                  }}
                                  className="p-1 rounded text-text-light hover:text-text hover:bg-black/5 transition-colors"
                                >
                                  <MoreVertical size={14} />
                                </button>
                                {contextMenu.day === day && contextMenu.mealType === mt.id && (
                                  <>
                                    <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-white border border-border rounded-lg shadow-lg overflow-hidden">
                                      <button
                                        type="button"
                                        onClick={() => { togglePin(day, mt.id); setContextMenu({ day: null, mealType: null }); }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-text hover:bg-black/5 transition-colors"
                                      >
                                        {isPinned ? <Lock size={12} /> : <LockOpen size={12} />}
                                        {isPinned ? 'Déverrouiller' : 'Garder ce plat'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => { replaceRecipe(day, mt.id); setContextMenu({ day: null, mealType: null }); }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-text hover:bg-black/5 transition-colors"
                                      >
                                        <RefreshCw size={12} />
                                        Remplacer
                                      </button>
                                      <Link
                                        to={getRecipeUrl(recipe, day, mt.id)}
                                        state={getRecipeLinkState(day, mt.id)}
                                        onClick={() => setContextMenu({ day: null, mealType: null })}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-text hover:bg-black/5 transition-colors"
                                      >
                                        <ExternalLink size={12} />
                                        Ouvrir en détail
                                      </Link>
                                      <button
                                        type="button"
                                        onClick={() => { startEditNote(day, mt.id); removeMeal(day, mt.id); }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-text hover:bg-black/5 transition-colors"
                                      >
                                        <Pencil size={12} />
                                        Écrire ma recette
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeMeal(day, mt.id)}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
                                      >
                                        <Trash2 size={12} />
                                        Supprimer
                                      </button>
                                    </div>
                                    <div className="fixed inset-0 z-20" onClick={closeAllMenus} />
                                  </>
                                )}
                                {dupPanel.day === day && dupPanel.mealType === mt.id && (
                                  <>
                                    <div className="absolute right-0 top-full mt-1 z-30 w-52 bg-white border border-border rounded-lg shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                      <p className="px-3 pt-2.5 pb-1 text-[13px] font-medium uppercase tracking-wider text-text-light">
                                        Dupliquer vers
                                      </p>
                                      <div className="px-2 py-1 space-y-0.5">
                                        {days.filter(d => d !== day && !(editingPlanningId && isDayPast(d, editWeekStart))).map(d => (
                                          <label
                                            key={d}
                                            className="flex items-center gap-2 px-1.5 py-1.5 rounded hover:bg-black/5 cursor-pointer transition-colors"
                                            onClick={(e) => { e.preventDefault(); toggleDupDay(d); }}
                                          >
                                            <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                              dupPanel.selectedDays.includes(d) ? 'bg-black border-black' : 'border-border'
                                            }`}>
                                              {dupPanel.selectedDays.includes(d) && <Check size={10} className="text-white" />}
                                            </span>
                                            <span className="text-xs text-text capitalize">{d}</span>
                                          </label>
                                        ))}
                                      </div>
                                      <div className="px-2 pb-2 pt-1 flex gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => setDupPanel(prev => ({ ...prev, selectedDays: days.filter(d => d !== day && !(editingPlanningId && isDayPast(d, editWeekStart))) }))}
                                          className="flex-1 text-[13px] py-1.5 text-text-light hover:text-text border border-border rounded transition-colors"
                                        >
                                          Tous
                                        </button>
                                        <button
                                          type="button"
                                          onClick={confirmDuplicate}
                                          disabled={dupPanel.selectedDays.length === 0}
                                          className="flex-1 text-[13px] py-1.5 font-medium bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                          Valider
                                        </button>
                                      </div>
                                    </div>
                                    <div className="fixed inset-0 z-20" onClick={closeAllMenus} />
                                  </>
                                )}
                              </div>
                            </div>
                            )}
                          </div>
                          {dayIsPast ? (
                            <Link
                              to={getRecipeUrl(recipe, day, mt.id)}
                              state={getRecipeLinkState(day, mt.id)}
                              className="w-full text-left block"
                            >
                              <p className="text-sm font-medium text-text leading-snug hover:underline line-clamp-2">{recipe.title}</p>
                              <p className="text-xs text-text-light mt-1">{recipe.protein}g prot · {recipe.calories} kcal · <span className="italic">jour passé</span></p>
                            </Link>
                          ) : (
                          <button
                            type="button"
                            className="w-full text-left"
                            onClick={() => setPreviewRecipe({ ...recipe, __planningContext: getRecipeLinkState(day, mt.id) })}
                          >
                            <p className="text-base font-medium text-text leading-snug">
                              {recipe.title}
                            </p>
                            {(() => {
                              if (hasHousehold) {
                                const om = ownerMacros(recipe, effectiveHousehold);
                                return om ? (
                                  <p className="text-sm text-text-light mt-0.5">{om.protein}g prot · {om.calories} kcal</p>
                                ) : null;
                              }
                              return (
                                <p className="text-sm text-text-light mt-0.5">
                                  {Math.round(recipe.protein * portions * getMealMultiplier(day, mt.id))}g prot · {Math.round(recipe.calories * portions * getMealMultiplier(day, mt.id))} kcal
                                </p>
                              );
                            })()}
                          </button>
                          )}
                          {!dayIsPast && (
                            <MealPortionControl
                              day={day}
                              mealType={mt.id}
                              value={getMealMultiplier(day, mt.id)}
                              onChange={setMealMultiplier}
                            />
                          )}
                          </div>{/* /p-3.5 */}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Grocery List */}
        {/* Modal détail recette (au clic sur une carte) */}
        {previewRecipe && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            onClick={() => setPreviewRecipe(null)}
          >
            <div
              className="bg-white border border-black/10 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end p-2 border-b border-black/8">
                <button
                  type="button"
                  onClick={() => setPreviewRecipe(null)}
                  className="p-2 text-text-light hover:text-text rounded-sm transition-colors"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4">
                <div className="aspect-[16/9] rounded-lg overflow-hidden bg-black/[0.04] mb-4">
                  <img
                    src={previewRecipe.image}
                    alt={previewRecipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-display text-2xl text-text">{previewRecipe.title}</h3>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 text-sm text-text-light">
                    <Clock size={16} className="text-text-light" />
                    <span>{previewRecipe.time} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-light">
                    <Flame size={16} className="text-text-light" />
                    <span>{previewRecipe.calories} kcal</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-light">
                    <Beef size={16} className="text-text-light" />
                    <span>{previewRecipe.protein} g protéines</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-light">
                    <Users size={16} className="text-text-light" />
                    <span>{previewRecipe.servings} part{previewRecipe.servings > 1 ? 's' : ''}</span>
                  </div>
                </div>
                {previewRecipe.carbs != null && (
                  <p className="mt-2 text-xs text-text-light">
                    Glucides {previewRecipe.carbs} g · Lipides {previewRecipe.fat} g
                  </p>
                )}
                <p className="mt-2 text-xs font-medium text-text-light">{previewRecipe.difficulty}</p>
                {previewRecipe.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {previewRecipe.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="text-[13px] px-2 py-0.5 rounded-sm bg-black/5 text-text border border-border">
                        {tag.replace('#', '')}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  to={
                    previewRecipe?.__planningContext
                      ? getRecipeUrl(previewRecipe, previewRecipe.__planningContext.day, previewRecipe.__planningContext.mealType)
                      : `/recettes/${getSlug(previewRecipe.title)}`
                  }
                  state={
                    previewRecipe?.__planningContext
                      ? previewRecipe.__planningContext
                      : undefined
                  }
                  onClick={() => setPreviewRecipe(null)}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-primary text-white text-base font-medium rounded-sm hover:bg-primary-dark transition-colors"
                >
                  Voir la recette complète
                </Link>
              </div>
            </div>
          </div>
        )}

        {onboardingStep === 'preview' && showGroceryList && (
          <div className="mt-8 bg-white border border-black/[0.08] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold text-text">
                Liste de courses {portions > 1 ? `(pour ${portions} personnes)` : ''}
              </h3>
              <p className="text-sm text-text-light max-w-xl">
                Organisée par rayon pour faciliter vos achats.
              </p>
            </div>

            {groceryListStep === 'loading' && (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-sm font-medium text-text-light">Chargement de la liste…</p>
              </div>
            )}

            {groceryListStep === 'pantry' && pantryItems.length > 0 && (
              <>
                <p className="text-sm text-text-light mb-4 max-w-xl">
                  Cochez ce que vous avez déjà dans vos placards pour ne pas le racheter.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
                  {pantryItems.map(({ name }) => (
                    <li key={name}>
                      <button
                        type="button"
                        onClick={() => togglePantryItem(name)}
                        title={name}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-black/[0.02] transition-colors min-w-0"
                      >
                        <span className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${pantryChecked.has(name) ? 'bg-primary border-primary' : 'border-border'}`}>
                          {pantryChecked.has(name) && <Check size={14} className="text-white" />}
                        </span>
                        <span className={`text-sm font-medium truncate min-w-0 ${pantryChecked.has(name) ? 'text-text-light line-through' : 'text-text'}`}>
                          {name}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setGroceryListStep('rest')}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white text-base font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
                >
                  Voir les ingrédients à acheter (par rayon)
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {groceryListStep === 'pantry' && pantryItems.length === 0 && (
              <>
                <p className="text-sm text-text-light mb-6">Aucun ingrédient courant dans cette liste. Passez directement au détail.</p>
                <button
                  type="button"
                  onClick={() => setGroceryListStep('rest')}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white text-base font-medium rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Voir tous les ingrédients
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {groceryListStep === 'rest' && (
              <>
                <p className="text-sm text-text-light mb-6">
                  À acheter pour la semaine. Cochez au fur et à mesure de vos courses.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                  {toBuyByCategoryOrdered.map(([category, items]) => (
                    <div key={category} className="rounded-xl border border-black/[0.08] bg-black/[0.02] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-light mb-3 pb-2 border-b border-black/[0.08]">
                        {category}
                      </p>
                      <ul className="space-y-1">
                        {items.map((item) => {
                          const key = `${category}-${item}`;
                          const checked = groceryChecked.has(key);
                          return (
                            <li key={key}>
                              <button
                                type="button"
                                onClick={() => toggleGroceryItem(category, item)}
                                className="flex items-center gap-3 w-full text-left py-2 px-2 -mx-2 rounded-lg hover:bg-white transition-colors min-w-0"
                              >
                                <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checked ? 'bg-primary border-primary' : 'border-border'}`}>
                                  {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                                </span>
                                <span className={`text-sm truncate min-w-0 ${checked ? 'text-text-light line-through' : 'text-text'}`}>
                                  {item}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <button
                    type="button"
                    onClick={() => setGroceryListStep('pantry')}
                    className="text-sm text-text-light hover:text-text transition-colors"
                  >
                    ← Revoir les ingrédients du placard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const lines = [];
                      toBuyByCategoryOrdered.forEach(([category, items]) => {
                        lines.push(`${category.toUpperCase()}`);
                        items.forEach(item => lines.push(`☐ ${item}`));
                        lines.push('');
                      });
                      const text = lines.length ? lines.join('\n') : '';
                      if (text) {
                        navigator.clipboard.writeText(text).then(() => setActionFeedback('copy'));
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border text-text hover:bg-black/[0.03] transition-colors text-sm font-medium"
                  >
                    <Copy size={16} /> Copier la liste
                  </button>
                </div>
                <p className="text-xs text-text-light mt-4 mb-2">Passer commande sur un drive</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={getCarrefourDriveUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#004E9A] text-white text-sm font-medium hover:bg-[#003d7a] transition-colors"
                  >
                    <ExternalLink size={16} /> Carrefour Drive
                  </a>
                  <a
                    href={getCoursesUDriveUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border text-text text-sm font-medium hover:bg-black/[0.03] transition-colors"
                  >
                    <ExternalLink size={16} /> Courses U (Super U)
                  </a>
                </div>
                {hasCarrefourAffiliate() && (
                  <p className="text-[11px] text-text-light mt-2">
                    Le lien Carrefour est un lien partenaire : on peut toucher une petite commission si tu commandes, sans changement de prix pour toi.
                  </p>
                )}
              </>
            )}
          </div>
        )}
        </div>

        {/* Spacer pour le contenu ne soit pas sous la barre fixe */}
        <div className="lg:hidden h-20" />

        </>
        )}
      </div>
    </div>
  );
}

function MealPortionControl({ day, mealType, value, onChange }) {
  return (
    <div className="mt-2.5">
      <p className="text-[11px] uppercase tracking-wider text-text-light mb-1">Taille du repas</p>
      <div className="flex flex-wrap gap-1">
        {MEAL_SIZE_OPTIONS.map(({ mult, label, title }) => {
          const active = value === mult;
          return (
            <button
              key={mult}
              type="button"
              title={title}
              onClick={(e) => {
                e.stopPropagation();
                onChange(day, mealType, mult);
              }}
              className={`px-2 py-1 rounded-md text-xs border transition-colors ${
                active
                  ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                  : 'bg-white border-border text-text-light hover:border-text/30 hover:text-text'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyMealSlot({ cellKey, day, mealType, mealNotes, editingNote, startEditNote, saveNote, clearNote, setEditingNote }) {
  const note = mealNotes[cellKey];
  const isEditing = editingNote === cellKey;

  if (isEditing) {
    return (
      <div className="flex-1 flex flex-col mt-1">
        <textarea
          autoFocus
          defaultValue={note || ''}
          placeholder="Ex : Pasta maison, Resto japonais…"
          className="w-full text-xs text-text bg-transparent border border-black/10 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-black/20 placeholder:text-text-light/40"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveNote(day, mealType, e.target.value); }
            if (e.key === 'Escape') setEditingNote(null);
          }}
          onBlur={(e) => saveNote(day, mealType, e.target.value)}
        />
      </div>
    );
  }

  if (note) {
    return (
      <div className="flex-1 flex flex-col mt-1 group/note">
        <p className="text-xs text-text italic leading-snug line-clamp-3">{note}</p>
        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover/note:opacity-100 transition-opacity">
          <button type="button" onClick={() => startEditNote(day, mealType)} className="p-0.5 text-text-light hover:text-text transition-colors" title="Modifier"><Pencil size={10} /></button>
          <button type="button" onClick={() => clearNote(day, mealType)} className="p-0.5 text-text-light hover:text-red-500 transition-colors" title="Supprimer la note"><X size={10} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center mt-1">
      <button
        type="button"
        onClick={() => startEditNote(day, mealType)}
        className="flex items-center gap-1 text-xs text-text-light/50 hover:text-text-light transition-colors py-1.5"
      >
        <Plus size={10} />
        <span>Note perso</span>
      </button>
    </div>
  );
}

/** Rayons supermarché : ordre d'affichage (parcours type en magasin). */
const RAYON_ORDER = [
  'Fruits et légumes',
  'Épicerie',
  'Pâtes, riz et céréales',
  'Boissons',
  'Frais et protéines végétales',
  'Surgelés',
  'Condiments et épices',
  'Graines et oléagineux',
];

function categorizeIngredient(ingredient) {
  const lower = ingredient.toLowerCase();
  if (/tofu|tempeh|seitan|protéine|edamame/.test(lower)) return 'Frais et protéines végétales';
  if (/lentille|pois chiche|haricot|quinoa|pois\s+(cassé|sec)/.test(lower)) return 'Pâtes, riz et céréales';
  if (/avoine|farine|sarrasin|riz|pâte|tortilla|pain|flocon|granola/.test(lower)) return 'Épicerie';
  if (/\blait\s+(d'|de\s+)|crème\s+(végétale|de\s+coco)|yaourt\s+végétal|boisson\s+végétale/.test(lower)) return 'Boissons';
  if (/surgelé|congelé/.test(lower)) return 'Surgelés';
  if (/beurre de|tahini|huile|sauce\s+soja|sauce|miel|sirop|cacao|chocolat\s+noir|levure|spiruline|curry|cumin|curcuma|paprika|garam|chili|origan|piment|sel|poivre|confiture|moutarde|vinaigre/.test(lower)) return 'Condiments et épices';
  if (/graine|noix|amande|cacahuète|sésame|pin|tournesol|chia|lin|chanvre|noix de coco râpée/.test(lower)) return 'Graines et oléagineux';
  if (/banane|mangue|myrtille|fruit|açaï|datte|citron|passion|olive|pomme|poire|pêche|abricot|kiwi|ananas/.test(lower)) return 'Fruits et légumes';
  return 'Fruits et légumes';
}

const UNIT_REG = /^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|L|cl|cm|c\.à\.s|c\.à\.c|c\.à\.s\.|c\.à\.c\.|pincée|pincées|sachet|sachets|tranche|tranches)?\s+(.+)$/i;

function parseIngredient(str) {
  const m = str.trim().match(UNIT_REG);
  if (!m) return { nameOnly: str.trim() };
  const qty = parseFloat(m[1].replace(',', '.'));
  const unit = (m[2] || '').toLowerCase().replace(/\.$/, '');
  const name = m[3].trim();
  return { qty, unit, name };
}

const BOTTLE_ML = 100;

/** Modificateurs à retirer pour regrouper (oignon finement haché = oignon). */
const MODIFIERS_REG = /\s+(finement haché|émincé|râpé|décortiqués|concassées|moulues|surgelée|congelée|frais|fraîche|mûre|mûr|en poudre|moyennes?|moyen(?:ne)?s?|rouges?|verts?|optionnel|\(optionnel\)|dénoyautées?|cuits?|cuites?|complètes?|mélangés?|pour servir|pour la texture|écrasée|ferme)$/gi;

/** Singularisation courante pour regrouper (citrons → citron). */
const PLURALS = [
  [/^citrons?$/i, 'citron'],
  [/^oignons?$/i, 'oignon'],
  [/^tomates?$/i, 'tomate'],
  [/^carottes?$/i, 'carotte'],
  [/^œufs?$/i, 'œuf'],
  [/^avocats?$/i, 'avocat'],
  [/^concombres?$/i, 'concombre'],
  [/^poivrons?$/i, 'poivron'],
  [/^gousses?\s+d'ail$/i, 'ail'],
  [/^patates?\s+douces?$/i, 'patate douce'],
];

/** Clé de regroupement : même ingrédient = même clé (sans quantité ni modificateur). */
function keyForGrouping(name) {
  let s = name.toLowerCase().trim().replace(/\s+/g, ' ');
  if (!s) return s;
  // Jus de citron : "jus d'1 citron", "jus de 2 citrons" → "jus de citron"
  s = s.replace(/\bjus\s+d'?\d*\s*(citrons?)\s*(vert)?/gi, (_, _c, vert) => `jus de citron ${vert || ''}`.trim());
  s = s.replace(/\bjus\s+de\s+\d+\s+citrons?\s*(vert)?/gi, (_, vert) => `jus de citron ${vert || ''}`.trim());
  s = s.replace(MODIFIERS_REG, '');
  s = s.replace(/\s+/g, ' ').trim();
  for (const [re, singular] of PLURALS) {
    s = s.replace(re, singular);
  }
  return s;
}

/** Affiche un libellé propre (première lettre en majuscule). */
function displayLabel(name) {
  const n = name.trim();
  return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
}

/** Liste simplifiée : une ligne par ingrédient, sans quantités (sauf bouteilles). Dédoublonnage et découpage des listes (Cumin, sel, poivre → 3 lignes). */
function aggregateIngredientsByCategory(rawByCategory) {
  const result = {};

  Object.entries(rawByCategory).forEach(([cat, entries]) => {
    const byName = {};
    function addEntry(key, displayName, isLiquid = false, totalMl = 0) {
      const k = keyForGrouping(key);
      if (!k) return;
      if (!byName[k]) byName[k] = { displayName: displayLabel(displayName), isLiquid, totalMl: 0 };
      if (isLiquid) byName[k].totalMl += totalMl;
      // Garder le libellé le plus court pour l'affichage
      if (displayName.length < byName[k].displayName.length) byName[k].displayName = displayLabel(displayName);
    }

    entries.forEach(({ raw, scale }) => {
      const parsed = parseIngredient(raw);
      if (parsed.nameOnly) {
        const rawName = parsed.nameOnly;
        if (/,|et\s+/.test(rawName)) {
          rawName.split(/[,&]|\bet\b/).forEach(part => {
            const p = part.trim();
            if (p) addEntry(p, p);
          });
          return;
        }
        addEntry(rawName, rawName);
        return;
      }
      const name = parsed.name;
      const key = keyForGrouping(name);
      const isLiquid = (parsed.unit === 'ml' || parsed.unit === 'L') && /lait|crème|yaourt/.test(name.toLowerCase());
      if (!byName[key]) {
        byName[key] = {
          displayName: displayLabel(name),
          isLiquid,
          totalMl: 0,
        };
      }
      const entry = byName[key];
      if (isLiquid) {
        const ml = parsed.unit === 'L' ? parsed.qty * 1000 : parsed.qty;
        entry.totalMl += ml * scale;
      }
    });

    const lines = [];
    Object.values(byName).forEach(v => {
      if (v.totalMl != null && v.totalMl > 0) {
        const bottles = Math.ceil(v.totalMl / BOTTLE_ML);
        const label = bottles <= 1 ? '1 bouteille' : `${bottles} bouteilles`;
        lines.push(`${label} de ${v.displayName}`);
      } else {
        lines.push(v.displayName);
      }
    });
    result[cat] = lines.sort((a, b) => a.localeCompare(b, 'fr'));
  });
  return result;
}

function exportGroceryList(groceryList) {
  const entries = Object.entries(groceryList).sort(([a], [b]) => {
    const ia = RAYON_ORDER.indexOf(a);
    const ib = RAYON_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b, 'fr');
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  let text = "=== LISTE DE COURSES — et si mamie était végé ? ===\n\n";
  entries.forEach(([category, items]) => {
    text += `--- ${category.toUpperCase()} ---\n`;
    items.forEach(item => {
      text += `☐ ${item}\n`;
    });
    text += "\n";
  });

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'liste-courses-mamie-vege.txt';
  a.click();
  URL.revokeObjectURL(url);
}
