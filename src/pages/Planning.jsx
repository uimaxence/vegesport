import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Download, Lock, LockOpen, RefreshCw, ShoppingCart, ChevronDown, ChevronRight, Check, Copy, MoreVertical, X, Clock, Flame, Beef, Users, ExternalLink, Trash2, RotateCcw, Pencil, Plus } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { getSlug } from '../lib/slug';
import { recipes } from '../data/recipes';
import { defaultPlannings, days, mealTypes } from '../data/plannings';
import { objectives, regimes } from '../data/recipes';

export default function Planning({ user, savePlanning }) {
  usePageMeta('Planning repas', 'Crée ton planning hebdomadaire de repas végétariens. Choisis ton objectif (prise de masse, sèche, endurance), génère et sauvegarde ton planning.');
  const [objective, setObjective] = useState('masse');
  const [regime, setRegime] = useState('vegetarien');
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [portions, setPortions] = useState(2);
  const [planning, setPlanning] = useState(defaultPlannings.masse.meals);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [pinnedMeals, setPinnedMeals] = useState({});
  const [generated, setGenerated] = useState(false);
  const [previewRecipe, setPreviewRecipe] = useState(null);
  const [contextMenu, setContextMenu] = useState({ day: null, mealType: null });
  const [dupPanel, setDupPanel] = useState({ day: null, mealType: null, selectedDays: [] });
  const [skippedDays, setSkippedDays] = useState({});
  const [expandedDay, setExpandedDay] = useState(null);
  const [mealNotes, setMealNotes] = useState({});
  const [editingNote, setEditingNote] = useState(null);

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

  const activeMealTypes = mealTypes.slice(0, mealsPerDay);

  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-light mb-3">Programme alimentaire végétarien</p>
          <h1 className="font-display text-4xl sm:text-5xl text-text">
            Ton planning repas végétarien de la semaine
          </h1>
          <p className="mt-4 text-base sm:text-lg text-text-light leading-relaxed max-w-xl">
            Définis ton objectif sportif et ton régime alimentaire. On génère automatiquement tes menus
            végétariens riches en protéines pour 7 jours, avec la liste de courses complète à exporter.
          </p>
        </div>

        {/* Settings — style segmented / champs neutres */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-medium rounded-sm hover:bg-primary-dark transition-colors mb-10"
        >
          <RefreshCw size={16} />
          {generated ? 'Regénérer' : 'Générer mon planning'}
        </button>

        {/* ===== DESKTOP Planning Table (hidden on mobile) ===== */}
        <div className="hidden lg:block overflow-x-auto -mx-6 px-6">
          <div className="min-w-[800px]">
            <div className="grid gap-2" style={{ gridTemplateColumns: `100px repeat(${days.length}, 1fr)` }}>
              <div />
              {days.map(day => (
                <div key={day} className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <p className={`text-xs font-medium uppercase tracking-wider capitalize ${skippedDays[day] ? 'text-text-light/40 line-through' : 'text-text-light'}`}>
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
                  <p className="text-xs font-medium text-text-light">{mt.label}</p>
                </div>
                {days.map(day => {
                  if (skippedDays[day]) {
                    return (
                      <div key={day} className="bg-black/[0.02] rounded-[10px] p-2.5 min-h-[100px] flex items-center justify-center border border-dashed border-black/10">
                        <p className="text-[10px] text-text-light/40 italic">Jour off</p>
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
                      className={`planning-cell bg-white rounded-[10px] p-2.5 min-h-[100px] flex flex-col border border-[rgb(0,0,0,0.08)] ${recipe ? 'cursor-grab active:cursor-grabbing' : ''} ${
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
                            <p className="text-xs font-medium text-text leading-snug hover:underline transition-colors line-clamp-2">
                              {recipe.title}
                            </p>
                            <p className="text-[10px] text-text-light mt-1">
                              {recipe.protein}g prot · {recipe.calories} kcal
                            </p>
                          </button>
                        </>
                      ) : isDragSource ? (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-sm bg-black/5 text-text-light">
                          <p className="text-[10px] font-medium">Glissez vers un autre jour</p>
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
                      <span className="text-[10px] text-text-light ml-1">
                        {activeMealTypes.filter(mt => getRecipe(planning[day]?.[mt.id])).length} repas
                      </span>
                    )}
                    {isSkipped && (
                      <span className="text-[10px] text-text-light/40 italic ml-1">Jour off</span>
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
                          <span className="text-[10px] font-medium text-text-light/50 uppercase tracking-wider">{mt.label}</span>
                          <EmptyMealSlot cellKey={cellKey} day={day} mealType={mt.id} mealNotes={mealNotes} editingNote={editingNote} startEditNote={startEditNote} saveNote={saveNote} clearNote={clearNote} setEditingNote={setEditingNote} />
                        </div>
                      );
                      return (
                        <div key={mt.id} className={`rounded-lg bg-black/[0.02] border border-black/8 p-3 ${isPinned ? 'ring-1 ring-black/20' : ''}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-medium text-text-light uppercase tracking-wider">{mt.label}</span>
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
                            <p className="text-sm font-medium text-text leading-snug">
                              {recipe.title}
                            </p>
                            <p className="text-xs text-text-light mt-0.5">
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
        <div className="mt-8 flex flex-wrap gap-2">
          <button
            onClick={() => setShowGroceryList(!showGroceryList)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black/[0.04] text-text text-sm font-medium rounded-[10px] hover:bg-black/[0.08] transition-colors border border-transparent"
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
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black/[0.04] text-text text-sm font-medium rounded-[10px] hover:bg-black/[0.08] transition-colors border border-transparent"
          >
            <Check size={16} />
            Sauvegarder
          </button>
          <button
            onClick={() => exportGroceryList(groceryList)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black/[0.04] text-text text-sm font-medium rounded-[10px] hover:bg-black/[0.08] transition-colors border border-transparent"
          >
            <Download size={16} />
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
                <h3 className="font-display text-xl text-text">{previewRecipe.title}</h3>
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
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-sm hover:bg-primary-dark transition-colors"
                >
                  Voir la recette complète
                </Link>
              </div>
            </div>
          </div>
        )}

        {showGroceryList && (
          <div className="mt-8 bg-white border border-black/[0.08] rounded-xl p-6 shadow-sm">
            <h3 className="text-xs uppercase tracking-[0.2em] text-text-light mb-6">Liste de courses {portions > 1 ? `(pour ${portions} portions)` : ''}</h3>
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
        className="flex items-center gap-1 text-[10px] text-text-light/50 hover:text-text-light transition-colors py-1"
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
