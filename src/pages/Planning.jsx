import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Download, Lock, LockOpen, RefreshCw, ShoppingCart, ChevronDown, ChevronRight, Check, Copy, MoreVertical, X, Clock, Flame, Beef, Users, ExternalLink, Trash2, RotateCcw, Pencil, Plus, Loader2 } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import Toast from '../components/Toast';
import { getSlug } from '../lib/slug';
import { recipes } from '../data/recipes';
import { defaultPlannings, days, mealTypes } from '../data/plannings';
import { objectives, regimes } from '../data/recipes';

export default function Planning({ user, savePlanning }) {
  usePageMeta('Planning repas', 'Crée ton planning hebdomadaire de repas végétariens. Choisis ton objectif (prise de masse, sèche, endurance), génère et sauvegarde ton planning.');
  const [objective, setObjective] = useState('masse');
  const [regime, setRegime] = useState('vegetarien');
  const [niveau, setNiveau] = useState('amateur');
  const [poids, setPoids] = useState(70);
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [portions, setPortions] = useState(2);
  const [planning, setPlanning] = useState(defaultPlannings.masse.meals);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [groceryListStep, setGroceryListStep] = useState('loading');
  const [pantryChecked, setPantryChecked] = useState(() => new Set());
  const [pinnedMeals, setPinnedMeals] = useState({});
  const [generated, setGenerated] = useState(false);
  const [previewRecipe, setPreviewRecipe] = useState(null);
  const [contextMenu, setContextMenu] = useState({ day: null, mealType: null });
  const [dupPanel, setDupPanel] = useState({ day: null, mealType: null, selectedDays: [] });
  const [skippedDays, setSkippedDays] = useState({});
  const [expandedDay, setExpandedDay] = useState(null);
  const [mealNotes, setMealNotes] = useState({});
  const [editingNote, setEditingNote] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [hasSavedPlanning, setHasSavedPlanning] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuthForAction = (intent) => {
    if (user) return false;
    navigate('/connexion', { state: { from: '/planning', planningIntent: intent } });
    return true;
  };

  const removeMeal = (day, mealType) => {
    setPlanning(prev => ({
      ...prev,
      [day]: { ...prev[day], [mealType]: null }
    }));
    setPinnedMeals(prev => { const n = { ...prev }; delete n[`${day}-${mealType}`]; return n; });
    setContextMenu({ day: null, mealType: null });
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

  const generatePlanning = () => {
    const base = defaultPlannings[objective]?.meals || defaultPlannings.masse.meals;
    const newPlanning = {};

    days.forEach(day => {
      newPlanning[day] = {};
      mealTypes.forEach(mt => {
        if (pinnedMeals[`${day}-${mt.id}`]) {
          newPlanning[day][mt.id] = planning[day]?.[mt.id];
        } else {
          newPlanning[day][mt.id] = base[day]?.[mt.id];
        }
      });
    });

    setPlanning(newPlanning);
    setGenerated(true);
  };

  const replaceRecipe = (day, mealType) => {
    const currentId = planning[day]?.[mealType];
    const eligible = recipes.filter(r =>
      r.category === mealType &&
      r.objective.includes(objective) &&
      r.id !== currentId
    );
    if (eligible.length === 0) {
      const fallback = recipes.filter(r => r.category === mealType && r.id !== currentId);
      if (fallback.length > 0) {
        const random = fallback[Math.floor(Math.random() * fallback.length)];
        setPlanning(prev => ({
          ...prev,
          [day]: { ...prev[day], [mealType]: random.id }
        }));
      }
      return;
    }
    const random = eligible[Math.floor(Math.random() * eligible.length)];
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
    if (!recipeId || selectedDays.length === 0) return;
    setPlanning(prev => {
      const next = { ...prev };
      selectedDays.forEach(d => {
        next[d] = { ...next[d], [mealType]: recipeId };
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
  };

  const getRecipe = (id) => recipes.find(r => r.id === id);

  const [dragState, setDragState] = useState({ day: null, mealType: null });
  const [hoverDrop, setHoverDrop] = useState({ day: null, mealType: null });
  const [recentlySwapped, setRecentlySwapped] = useState({ fromDay: null, toDay: null, mealType: null });

  const handleDragStart = (e, day, mealType) => {
    setDragState({ day, mealType });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${day}-${mealType}`);
  };

  const handleDragEnd = (e) => {
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

  const groceryList = useMemo(() => {
    const rawByCategory = {};
    days.forEach(day => {
      if (skippedDays[day]) return;
      const activeMealTypes = mealTypes.slice(0, mealsPerDay);
      activeMealTypes.forEach(mt => {
        const recipeId = planning[day]?.[mt.id];
        const recipe = getRecipe(recipeId);
        if (recipe) {
          const scale = portions / (recipe.servings || 1);
          recipe.ingredients.forEach(ing => {
            const cat = categorizeIngredient(ing);
            if (!rawByCategory[cat]) rawByCategory[cat] = [];
            rawByCategory[cat].push({ raw: ing, scale });
          });
        }
      });
    });
    return aggregateIngredientsByCategory(rawByCategory);
  }, [planning, mealsPerDay, portions, skippedDays]);

  useEffect(() => {
    if (!showGroceryList) {
      setGroceryListStep('loading');
      return;
    }
    setGroceryListStep('loading');
    setPantryChecked(new Set());
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

  const doSavePlanning = () => {
    if (requireAuthForAction('save')) return;
    if (savePlanning) {
      savePlanning({
        date: new Date().toLocaleDateString('fr-FR'),
        objective,
        meals: { ...planning }
      });
      setHasSavedPlanning(true);
      setActionFeedback('save');
    }
  };

  useEffect(() => {
    if (!user) return;
    const intent = location.state?.planningIntent;
    if (!intent) return;
    if (intent === 'grocery') {
      handleGroceryClick();
    } else if (intent === 'save') {
      doSavePlanning();
    } else if (intent === 'download') {
      handleDownloadClick();
    }
    navigate('/planning', { replace: true, state: undefined });
  }, [user, location.state, navigate]);


  /* Niveaux d'activité pour le filtre */
  const niveaux = [
    { id: 'debutant', label: 'Débutant' },
    { id: 'amateur', label: 'Amateur' },
    { id: 'confirme', label: 'Confirmé' },
  ];

  /*
   * Références en g/kg et tendance calorique (vs maintien ~30 kcal/kg),
   * d’après recommandations sportives (6dsportsnutrition, athleticlab, rippedbody, etc.)
   */
  const DAILY_TARGETS = useMemo(() => {
    const kg = Math.max(40, Math.min(150, Number(poids) || 70));
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
  }, [objective, niveau, poids]);

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
          const ratio = portions / (recipe.servings || 1);
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
  }, [planning, portions, skippedDays, activeMealTypes]);

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
        </Toast>

        {/* Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-text-light mb-3">Programme alimentaire végétarien</p>
          <h1 className="font-display text-4xl sm:text-5xl text-text">
            Ton planning repas végétarien de la semaine
          </h1>
          <p className="mt-4 text-base sm:text-lg text-text-light leading-relaxed max-w-xl">
            Définis ton objectif sportif et ton régime alimentaire. On génère automatiquement tes menus
            végétariens riches en protéines pour 7 jours, avec la liste de courses complète à exporter.
          </p>
        </div>

        {/* Settings — style segmented / champs neutres */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
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
              onChange={(e) => setPoids(Number(e.target.value) || 70)}
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
            <label className="planning-filter-label">
              Portions
            </label>
            <div className="segment-group segment-group--compact">
              {[1, 2, 4, 6].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPortions(n)}
                  className={`segment-item ${portions === n ? 'is-selected' : ''}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={generatePlanning}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white text-base font-medium rounded-sm hover:bg-primary-dark transition-colors mb-10"
        >
          <RefreshCw size={18} />
          {generated ? 'Regénérer' : 'Générer mon planning'}
        </button>

        {/* Moyennes nutritionnelles vs besoins sportif */}
        {nutritionBars && (
          <div className="mb-10 p-5 sm:p-6 bg-bg-warm border border-border rounded-xl">
            <h3 className="text-sm font-medium uppercase tracking-wider text-text-light mb-1">Équilibre moyen par jour</h3>
            <p className="text-xs text-text-light mb-4">
              Moyenne sur {dailyNutrition.daysCount} jour{dailyNutrition.daysCount > 1 ? 's' : ''} planifié{dailyNutrition.daysCount > 1 ? 's' : ''} — objectifs en g/kg adaptés à votre profil ({objectives.find(o => o.id === objective)?.label ?? objective}, {niveaux.find(n => n.id === niveau)?.label ?? niveau}, {Math.max(40, Math.min(150, poids))} kg)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'protein', label: 'Protéines', unit: 'g', icon: Beef },
                { key: 'calories', label: 'Calories', unit: 'kcal', icon: Flame },
                { key: 'carbs', label: 'Glucides', unit: 'g', icon: null },
                { key: 'fat', label: 'Lipides', unit: 'g', icon: null },
              ].map(({ key, label, unit, icon: Icon }) => {
                const bar = nutritionBars[key];
                const isOk = bar.pct >= 85;
                const isLow = bar.pct < 70;
                return (
                  <div key={key} className="bg-white rounded-lg p-3 border border-black/[0.06]">
                    <div className="flex items-center justify-between mb-1.5">
                      {Icon && <Icon size={16} className="text-text-light" />}
                      <span className="text-xs font-medium text-text-light">{label}</span>
                    </div>
                    <p className="text-lg font-display font-medium text-text tabular-nums">
                      {bar.value} <span className="text-sm font-sans font-normal text-text-light">/ {bar.target} {unit}</span>
                    </p>
                    <div className="mt-2 h-2 bg-black/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isLow ? 'bg-red-400' : isOk ? 'bg-secondary' : 'bg-primary/70'}`}
                        style={{ width: `${Math.min(100, bar.pct)}%` }}
                      />
                    </div>
                    <p className={`mt-1 text-xs font-medium ${isLow ? 'text-red-600' : isOk ? 'text-secondary' : 'text-primary'}`}>
                      {bar.pct} % de l&apos;objectif
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== DESKTOP Planning Table (hidden on mobile) ===== */}
        <div className="hidden lg:block overflow-x-auto -mx-6 px-6">
          <div className="min-w-[800px]">
            <div className="grid gap-2" style={{ gridTemplateColumns: `100px repeat(${days.length}, 1fr)` }}>
              <div />
              {days.map(day => (
                <div key={day} className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <p className={`text-sm font-medium uppercase tracking-wider capitalize ${skippedDays[day] ? 'text-text-light/40 line-through' : 'text-text-light'}`}>
                      {day}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleSkipDay(day)}
                      className={`p-0.5 rounded transition-colors ${skippedDays[day] ? 'text-primary hover:text-primary-dark' : 'text-text-light/40 hover:text-text-light'}`}
                      title={skippedDays[day] ? 'Réactiver ce jour' : 'Désactiver ce jour'}
                    >
                      {skippedDays[day] ? <RotateCcw size={11} /> : <X size={11} />}
                    </button>
                  </div>
                </div>
              ))}
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
                  const isDragSource = dragState.day === day && dragState.mealType === mt.id;
                  const isDropTarget = hoverDrop.day === day && hoverDrop.mealType === mt.id && !isDragSource;
                  const isLanded = isInRecentlySwapped(day, mt.id);

                  return (
                    <div
                      key={day}
                      draggable={!!recipe}
                      onDragStart={(e) => recipe && handleDragStart(e, day, mt.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, day, mt.id)}
                      onDrop={(e) => handleDrop(e, day, mt.id)}
                      className={`planning-cell bg-white rounded-xl p-3 min-h-[120px] flex flex-col border border-[rgb(0,0,0,0.08)] ${recipe ? 'cursor-grab active:cursor-grabbing' : ''} ${
                        isDragSource ? 'is-drag-source' : ''
                      } ${isDropTarget ? 'is-drop-target' : ''} ${isLanded ? 'just-landed' : ''} ${
                        isPinned ? 'ring-1 ring-black/20' : ''
                      }`}
                    >
                      {recipe && !isDragSource ? (
                        <>
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
                                      to={`/recettes/${getSlug(recipe.title)}`}
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
                                    <p className="px-3 pt-2.5 pb-1 text-[10px] font-medium uppercase tracking-wider text-text-light">
                                      Dupliquer vers
                                    </p>
                                    <div className="px-2 py-1 space-y-0.5">
                                      {days.filter(d => d !== day).map(d => (
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
                                        onClick={() => setDupPanel(prev => ({ ...prev, selectedDays: days.filter(d => d !== day) }))}
                                        className="flex-1 text-[10px] py-1.5 text-text-light hover:text-text border border-border rounded-sm transition-colors"
                                      >
                                        Tous
                                      </button>
                                      <button
                                        type="button"
                                        onClick={confirmDuplicate}
                                        disabled={dupPanel.selectedDays.length === 0}
                                        className="flex-1 text-[10px] py-1.5 font-medium bg-primary text-white rounded-sm hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                          <button
                            type="button"
                            className="w-full text-left flex-1 min-w-0"
                            onClick={(e) => { e.stopPropagation(); setPreviewRecipe(recipe); }}
                          >
                            <p className="text-sm font-medium text-text leading-snug hover:underline transition-colors line-clamp-2">
                              {recipe.title}
                            </p>
                            <p className="text-xs text-text-light mt-1.5">
                              {recipe.protein}g prot · {recipe.calories} kcal
                            </p>
                          </button>
                        </>
                      ) : isDragSource ? (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg bg-black/5 text-text-light">
                          <p className="text-xs font-medium">Glissez vers un autre jour</p>
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
                    <span className={`text-sm font-medium capitalize ${isSkipped ? 'text-text-light/40 line-through' : 'text-text'}`}>
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
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleSkipDay(day); }}
                    className={`p-1.5 rounded-lg transition-colors ${isSkipped ? 'text-primary hover:bg-primary/10' : 'text-text-light/40 hover:text-red-500 hover:bg-red-50'}`}
                    title={isSkipped ? 'Réactiver ce jour' : 'Désactiver ce jour'}
                  >
                    {isSkipped ? <RotateCcw size={14} /> : <Trash2 size={14} />}
                  </button>
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
                          <EmptyMealSlot cellKey={cellKey} day={day} mealType={mt.id} mealNotes={mealNotes} editingNote={editingNote} startEditNote={startEditNote} saveNote={saveNote} clearNote={clearNote} setEditingNote={setEditingNote} />
                        </div>
                      );
                      return (
                        <div key={mt.id} className={`rounded-lg bg-black/[0.02] border border-black/8 p-3.5 ${isPinned ? 'ring-1 ring-black/20' : ''}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-text-light uppercase tracking-wider">{mt.label}</span>
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
                                        to={`/recettes/${getSlug(recipe.title)}`}
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
                                      <p className="px-3 pt-2.5 pb-1 text-[10px] font-medium uppercase tracking-wider text-text-light">
                                        Dupliquer vers
                                      </p>
                                      <div className="px-2 py-1 space-y-0.5">
                                        {days.filter(d => d !== day).map(d => (
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
                                          onClick={() => setDupPanel(prev => ({ ...prev, selectedDays: days.filter(d => d !== day) }))}
                                          className="flex-1 text-[10px] py-1.5 text-text-light hover:text-text border border-border rounded transition-colors"
                                        >
                                          Tous
                                        </button>
                                        <button
                                          type="button"
                                          onClick={confirmDuplicate}
                                          disabled={dupPanel.selectedDays.length === 0}
                                          className="flex-1 text-[10px] py-1.5 font-medium bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                          </div>
                          <button
                            type="button"
                            className="w-full text-left"
                            onClick={() => setPreviewRecipe(recipe)}
                          >
                            <p className="text-base font-medium text-text leading-snug">
                              {recipe.title}
                            </p>
                            <p className="text-sm text-text-light mt-0.5">
                              {recipe.protein}g prot · {recipe.calories} kcal
                            </p>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={handleGroceryClick}
            className="inline-flex items-center gap-2 px-5 py-3 bg-black/[0.04] text-text text-base font-medium rounded-[10px] hover:bg-black/[0.08] transition-colors border border-transparent"
          >
            <ShoppingCart size={18} />
            {showGroceryList ? 'Masquer' : 'Liste de courses'}
          </button>
          <button
            onClick={doSavePlanning}
            className="inline-flex items-center gap-2 px-5 py-3 bg-black/[0.04] text-text text-base font-medium rounded-[10px] hover:bg-black/[0.08] transition-colors border border-transparent"
          >
            <Check size={18} />
            {hasSavedPlanning ? 'Sauvegardé (voir sur mon profil)' : 'Sauvegarder'}
          </button>
          <button
            onClick={handleDownloadClick}
            className="inline-flex items-center gap-2 px-5 py-3 bg-black/[0.04] text-text text-base font-medium rounded-[10px] hover:bg-black/[0.08] transition-colors border border-transparent"
          >
            <Download size={18} />
            Télécharger la liste
          </button>

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
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black/[0.04] mb-4">
                  <img src={previewRecipe.image} alt={previewRecipe.title} className="w-full h-full object-cover" />
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
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-sm bg-black/5 text-text border border-border">
                        {tag.replace('#', '')}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  to={`/recettes/${getSlug(previewRecipe.title)}`}
                  onClick={() => setPreviewRecipe(null)}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-primary text-white text-base font-medium rounded-sm hover:bg-primary-dark transition-colors"
                >
                  Voir la recette complète
                </Link>
              </div>
            </div>
          </div>
        )}

        {showGroceryList && (
          <div className="mt-8 bg-white border border-black/[0.08] rounded-xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-xs uppercase tracking-[0.2em] text-text-light mb-6">
              Liste de courses {portions > 1 ? `(pour ${portions} portions)` : ''}
            </h3>

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
                <ul className="space-y-2 mb-8">
                  {pantryItems.map(({ name }) => (
                    <li key={name}>
                      <button
                        type="button"
                        onClick={() => togglePantryItem(name)}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-black/[0.02] transition-colors"
                      >
                        <span className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${pantryChecked.has(name) ? 'bg-primary border-primary' : 'border-border'}`}>
                          {pantryChecked.has(name) && <Check size={14} className="text-white" />}
                        </span>
                        <span className={`text-base font-medium ${pantryChecked.has(name) ? 'text-text-light line-through' : 'text-text'}`}>
                          {name}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setGroceryListStep('rest')}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white text-base font-medium rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Voir le reste des ingrédients
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {Object.entries(toBuyByCategory).map(([category, items]) => (
                    <div key={category}>
                      <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-2">{category}</p>
                      <ul className="space-y-1.5">
                        {items.map((item, i) => (
                          <li key={`${category}-${item}-${i}`} className="flex items-start gap-2 text-sm text-text-light">
                            <span className="w-3.5 h-3.5 rounded border border-border flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
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
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white text-base font-medium rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Passer commande
                  </button>
                </div>
              </>
            )}
          </div>
        )}
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

function categorizeIngredient(ingredient) {
  const lower = ingredient.toLowerCase();
  if (/tofu|tempeh|seitan|protéine|edamame/.test(lower)) return 'Protéines végétales';
  if (/lentille|pois chiche|haricot|quinoa|pois/.test(lower)) return 'Légumineuses et céréales';
  if (/avoine|farine|sarrasin|riz|pâte|tortilla|pain/.test(lower)) return 'Épicerie';
  if (/lait|crème|yaourt|coco/.test(lower)) return 'Boissons végétales';
  if (/beurre de|tahini|huile|soja|sauce|miel|sirop|cacao|chocolat|levure|spiruline|curry|cumin|curcuma|paprika|garam|chili|origan|piment|sel|poivre/.test(lower)) return 'Condiments et épices';
  if (/graine|noix|amande|cacahuète|sésame|pin|tournesol|chia|lin|chanvre/.test(lower)) return 'Graines et oléagineux';
  if (/banane|mangue|myrtille|fruit|açaï|datte|citron|passion|olive/.test(lower)) return 'Fruits';
  return 'Légumes et herbes';
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
      // Garder le libellé le plus court pour l’affichage
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
  let text = "=== LISTE DE COURSES — et si mamie était végé ? ===\n\n";
  Object.entries(groceryList).forEach(([category, items]) => {
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
