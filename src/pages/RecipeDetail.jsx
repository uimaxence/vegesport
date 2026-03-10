import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Flame, Heart, Users, ChefHat, X, Check } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { getSlug } from '../lib/slug';
import RecipeCard from '../components/RecipeCard';

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
  const { recipes, loading, error } = useData();
  const recipe = recipes.find(
    (r) => getSlug(r.title) === slug || String(r.id) === slug
  );
  const [servings, setServings] = useState(recipe?.servings || 1);
  const [activeStep, setActiveStep] = useState(null);
  const [cookingMode, setCookingMode] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState([]);

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

  usePageMeta(recipe.title, (recipe.steps && recipe.steps[0]) ? recipe.steps[0].slice(0, 155) + '…' : undefined);

  const isFavorite = favorites.includes(recipe.id);
  const ratio = servings / recipe.servings;

  const similar = recipes
    .filter(r => r.id !== recipe.id && r.objective.some(o => recipe.objective.includes(o)))
    .slice(0, 3);

  const totalSteps = 1 + recipe.steps.length;

  if (cookingMode) {
    const stepIndex = typeof activeStep === 'number' ? activeStep : 0;
    const isIngredientsStep = stepIndex === 0;
    const instructionIndex = stepIndex - 1;
    const currentStepText = isIngredientsStep ? '' : (recipe.steps[instructionIndex] ?? recipe.steps[0]);

    const checked = checkedIngredients.length === recipe.ingredients.length
      ? checkedIngredients
      : recipe.ingredients.map(() => false);

    const toggleCheck = (i) => {
      setCheckedIngredients(prev => {
        const next = prev.length === recipe.ingredients.length ? [...prev] : recipe.ingredients.map(() => false);
        next[i] = !next[i];
        return next;
      });
    };

    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1a1a]">
        <div className="flex justify-end p-4">
          <button
            onClick={() => { setCookingMode(false); setActiveStep(null); setCheckedIngredients([]); }}
            className="text-white/70 hover:text-white text-base flex items-center gap-2 py-2"
          >
            <X size={20} /> Quitter le mode cuisine
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col items-center justify-center">
          <p className="text-sm uppercase tracking-[0.2em] text-primary-light mb-6">
            {isIngredientsStep ? 'Préparation' : `Étape ${stepIndex} sur ${totalSteps}`}
          </p>

          {isIngredientsStep ? (
            <>
              <p className="font-display text-2xl sm:text-3xl text-center text-white max-w-xl leading-relaxed mb-8">
                Vérifiez que vous avez tous les ingrédients
              </p>
              <div className="w-full max-w-lg rounded-lg bg-white/10 border border-white/20 p-5 sm:p-6">
                <p className="text-sm uppercase tracking-wider text-white/60 mb-4">Ingrédients</p>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => toggleCheck(i)}
                        className={`flex-shrink-0 w-8 h-8 rounded-md border-2 flex items-center justify-center transition-colors ${
                          checked[i]
                            ? 'bg-primary border-primary'
                            : 'border-white/40 hover:border-white/60'
                        }`}
                      >
                        {checked[i] && <Check size={18} className="text-white" />}
                      </button>
                      <span className={`text-base sm:text-lg font-medium leading-snug ${checked[i] ? 'text-white/50 line-through' : 'text-white'}`}>
                        {scaleIngredient(ing, ratio)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <StepWithQuantities stepText={currentStepText} ingredients={recipe.ingredients.map((ing) => scaleIngredient(ing, ratio))} />
          )}
        </div>

        <div className="flex-shrink-0 border-t border-white/10 bg-[#252525] px-4 py-5 sm:py-6">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setActiveStep(Math.max(0, stepIndex - 1))}
              disabled={stepIndex === 0}
              className="flex-shrink-0 px-5 py-3.5 rounded-lg text-base font-medium text-white/90 hover:text-white disabled:opacity-30 disabled:pointer-events-none border border-white/20 hover:border-white/40 transition-colors"
            >
              ← Précédent
            </button>
            <p className="flex-1 text-center text-base sm:text-lg text-white/95 line-clamp-3 min-w-0 px-3 leading-snug">
              {isIngredientsStep ? 'Préparez les ingrédients' : currentStepText}
            </p>
            <button
              type="button"
              onClick={() => {
                if (stepIndex >= totalSteps - 1) {
                  setCookingMode(false);
                  setActiveStep(null);
                  setCheckedIngredients([]);
                } else {
                  setActiveStep(stepIndex + 1);
                }
              }}
              className="flex-shrink-0 px-6 py-3.5 rounded-lg text-base font-medium bg-primary text-white hover:bg-primary-light transition-colors"
            >
              {stepIndex >= totalSteps - 1 ? 'Terminer' : 'Suivant →'}
            </button>
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
              <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {recipe.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] font-medium px-2.5 py-0.5 rounded-sm border border-border text-text-light">
                  {tag.replace('#', '')}
                </span>
              ))}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-text leading-tight">
              {recipe.title}
            </h1>
            <p className="recipe-script-note mt-2 text-base">
              {recipe.time <= 15 ? 'Rapide à faire !' : recipe.time <= 30 ? 'Parfait pour le soir' : 'À prévoir à l\'avance'}
            </p>

            <div className="flex items-center gap-4 mt-4 text-sm text-text-light">
              <span className="flex items-center gap-1.5"><Clock size={15} /> {recipe.time} min</span>
              <span className="flex items-center gap-1.5"><Flame size={15} /> {Math.round(recipe.calories * ratio)} kcal</span>
              <span className="flex items-center gap-1.5"><ChefHat size={15} /> {recipe.difficulty}</span>
            </div>

            {/* Macros */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="bg-bg-warm rounded-sm p-3 text-center">
                <p className="text-lg font-medium text-primary">{Math.round(recipe.protein * ratio)}g</p>
                <p className="text-[10px] uppercase tracking-wider text-text-light mt-0.5">Protéines</p>
              </div>
              <div className="bg-bg-warm rounded-sm p-3 text-center">
                <p className="text-lg font-medium text-text">{Math.round(recipe.carbs * ratio)}g</p>
                <p className="text-[10px] uppercase tracking-wider text-text-light mt-0.5">Glucides</p>
              </div>
              <div className="bg-bg-warm rounded-sm p-3 text-center">
                <p className="text-lg font-medium text-text">{Math.round(recipe.fat * ratio)}g</p>
                <p className="text-[10px] uppercase tracking-wider text-text-light mt-0.5">Lipides</p>
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
            <div className="mt-6 flex gap-2">
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
                onClick={() => { setCookingMode(true); setActiveStep(0); setCheckedIngredients(recipe.ingredients.map(() => false)); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                <ChefHat size={14} />
                Mode cuisine
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
              {recipe.ingredients.map((ingredient, i) => (
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
              {recipe.steps.map((step, i) => (
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
