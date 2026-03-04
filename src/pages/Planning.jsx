import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Download, Pin, RefreshCw, ShoppingCart, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { recipes } from '../data/recipes';
import { defaultPlannings, days, mealTypes } from '../data/plannings';
import { objectives, regimes } from '../data/recipes';

export default function Planning({ user, savePlanning }) {
  usePageMeta('Planning repas', 'Crée ton planning hebdomadaire de repas végétariens. Choisis ton objectif (prise de masse, sèche, endurance), génère et sauvegarde ton planning.');
  const [objective, setObjective] = useState('masse');
  const [regime, setRegime] = useState('vegetarien');
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [planning, setPlanning] = useState(defaultPlannings.masse.meals);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [pinnedMeals, setPinnedMeals] = useState({});
  const [generated, setGenerated] = useState(false);

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
    const ingredients = {};
    days.forEach(day => {
      const activeMealTypes = mealTypes.slice(0, mealsPerDay);
      activeMealTypes.forEach(mt => {
        const recipeId = planning[day]?.[mt.id];
        const recipe = getRecipe(recipeId);
        if (recipe) {
          recipe.ingredients.forEach(ing => {
            const cat = categorizeIngredient(ing);
            if (!ingredients[cat]) ingredients[cat] = new Set();
            ingredients[cat].add(ing);
          });
        }
      });
    });
    const result = {};
    Object.entries(ingredients).forEach(([cat, items]) => {
      result[cat] = Array.from(items);
    });
    return result;
  }, [planning, mealsPerDay]);

  const activeMealTypes = mealTypes.slice(0, mealsPerDay);

  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Programme alimentaire végétarien</p>
          <h1 className="font-display text-3xl sm:text-4xl text-text">
            Ton planning repas végétarien de la semaine
          </h1>
          <p className="mt-3 text-sm text-text-light leading-relaxed">
            Définis ton objectif sportif et ton régime alimentaire. On génère automatiquement tes menus
            végétariens riches en protéines pour 7 jours, avec la liste de courses complète à exporter.
          </p>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-text-light mb-2 block">
              Objectif
            </label>
            <div className="relative">
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full appearance-none bg-bg-warm border border-border rounded-sm px-4 py-3 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {objectives.map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-text-light mb-2 block">
              Régime
            </label>
            <div className="relative">
              <select
                value={regime}
                onChange={(e) => setRegime(e.target.value)}
                className="w-full appearance-none bg-bg-warm border border-border rounded-sm px-4 py-3 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {regimes.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-text-light mb-2 block">
              Repas / jour
            </label>
            <div className="flex gap-2">
              {[3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setMealsPerDay(n)}
                  className={`flex-1 py-3 rounded-sm text-sm font-medium transition-colors ${
                    mealsPerDay === n
                      ? 'bg-primary text-white'
                      : 'bg-bg-warm text-text-light hover:text-text'
                  }`}
                >
                  {n} repas
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={generatePlanning}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-medium rounded-sm hover:bg-primary-dark transition-colors mb-10"
        >
          <RefreshCw size={16} />
          {generated ? 'Regénérer' : 'Générer mon planning'}
        </button>

        {/* Planning Table */}
        <div className="overflow-x-auto -mx-6 px-6">
          <div className="min-w-[800px]">
            {/* Header row */}
            <div className="grid gap-2" style={{ gridTemplateColumns: `100px repeat(${days.length}, 1fr)` }}>
              <div />
              {days.map(day => (
                <div key={day} className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-text-light capitalize">
                    {day}
                  </p>
                </div>
              ))}
            </div>

            {/* Meal rows */}
            {activeMealTypes.map(mt => (
              <div
                key={mt.id}
                className="grid gap-2 mt-2"
                style={{ gridTemplateColumns: `100px repeat(${days.length}, 1fr)` }}
              >
                <div className="flex items-center">
                  <p className="text-xs font-medium text-text-light">{mt.label}</p>
                </div>
                {days.map(day => {
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
                      className={`planning-cell bg-bg-warm rounded-sm p-2.5 min-h-[100px] flex flex-col border border-transparent ${
                        isPinned ? 'ring-1 ring-primary/30' : ''
                      } ${recipe ? 'cursor-grab active:cursor-grabbing' : ''} ${
                        isDragSource ? 'is-drag-source' : ''
                      } ${isDropTarget ? 'is-drop-target' : ''} ${isLanded ? 'just-landed' : ''}`}
                    >
                      {recipe && !isDragSource ? (
                        <>
                          <Link to={`/recettes/${recipe.id}`} className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                            <p className="text-xs font-medium text-text leading-snug hover:text-primary transition-colors line-clamp-2">
                              {recipe.title}
                            </p>
                            <p className="text-[10px] text-text-light mt-1">
                              {recipe.protein} g protéines · {recipe.calories} kcal
                            </p>
                          </Link>
                          <div className="flex gap-1 mt-2 pt-2 border-t border-border">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); togglePin(day, mt.id); }}
                              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-sm text-[10px] font-medium transition-colors ${
                                isPinned
                                  ? 'bg-primary/15 text-primary border border-primary/40'
                                  : 'bg-white/80 text-text-light hover:text-text border border-border'
                              }`}
                              title={isPinned ? 'Désépingler' : 'Garder ce plat'}
                            >
                              <Pin size={10} className={isPinned ? 'fill-primary' : ''} />
                              {isPinned ? 'Gardé' : 'Garder'}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); replaceRecipe(day, mt.id); }}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-sm text-[10px] font-medium bg-white/80 text-text-light hover:text-text border border-border transition-colors"
                              title="Changer le plat"
                            >
                              <RefreshCw size={10} />
                              Changer
                            </button>
                          </div>
                        </>
                      ) : isDragSource ? (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-primary/40 rounded-sm bg-primary/5 text-primary/70">
                          <p className="text-[10px] font-medium">Glissez vers un autre jour</p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-text-light/50">—</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => setShowGroceryList(!showGroceryList)}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-sm rounded-sm hover:border-text transition-colors"
          >
            <ShoppingCart size={16} />
            {showGroceryList ? 'Masquer' : 'Liste de courses'}
          </button>
          <button
            onClick={() => {
              if (savePlanning) {
                savePlanning({
                  date: new Date().toLocaleDateString('fr-FR'),
                  objective,
                  meals: { ...planning }
                });
                alert('Planning sauvegardé !');
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-sm rounded-sm hover:border-text transition-colors"
          >
            <Check size={16} />
            Sauvegarder
          </button>
          <button
            onClick={() => exportGroceryList(groceryList)}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-sm rounded-sm hover:border-text transition-colors"
          >
            <Download size={16} />
            Télécharger la liste
          </button>
        </div>

        {/* Grocery List */}
        {showGroceryList && (
          <div className="mt-8 bg-bg-warm rounded-sm p-6">
            <h3 className="text-xs uppercase tracking-[0.2em] text-primary mb-6">Liste de courses</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groceryList).map(([category, items]) => (
                <div key={category}>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-2">{category}</p>
                  <ul className="space-y-1.5">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-light">
                        <span className="w-3.5 h-3.5 rounded border border-border flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
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

function exportGroceryList(groceryList) {
  let text = "=== LISTE DE COURSES VÉGÉSPORT ===\n\n";
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
  a.download = 'liste-courses-vegesport.txt';
  a.click();
  URL.revokeObjectURL(url);
}
