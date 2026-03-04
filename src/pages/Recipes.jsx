import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { categories, objectives, regimes, tags } from '../data/recipes';
import RecipeCard from '../components/RecipeCard';

export default function Recipes({ favorites, toggleFavorite }) {
  usePageMeta('Recettes', 'Toutes nos recettes végétariennes et végétaliennes pour sportifs. Filtres par objectif, régime et temps de préparation.');
  const { recipes, loading, error } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = searchParams.get('search') || '';
  const activeCategory = searchParams.get('categorie') || 'tous';
  const activeObjective = searchParams.get('objectif') || '';
  const activeRegime = searchParams.get('regime') || '';
  const activeTag = searchParams.get('tag') || '';
  const activeTime = searchParams.get('temps') || '';

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = activeCategory !== 'tous' || activeObjective || activeRegime || activeTag || activeTime || searchQuery;

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          recipe.title.toLowerCase().includes(q) ||
          recipe.mainIngredient.toLowerCase().includes(q) ||
          recipe.ingredients.some(i => i.toLowerCase().includes(q)) ||
          recipe.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }
      if (activeCategory !== 'tous' && recipe.category !== activeCategory) return false;
      if (activeObjective && !recipe.objective.includes(activeObjective)) return false;
      if (activeRegime && !recipe.regime.includes(activeRegime)) return false;
      if (activeTag && !recipe.tags.includes(activeTag)) return false;
      if (activeTime === '15' && recipe.time > 15) return false;
      if (activeTime === '30' && recipe.time > 30) return false;
      return true;
    });
  }, [recipes, searchQuery, activeCategory, activeObjective, activeRegime, activeTag, activeTime]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-text-light">Chargement des recettes…</p>
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

  const categoriesWithCount = [
    { id: 'tous', label: 'Tous', count: recipes.length },
    ...categories.filter((c) => c.id !== 'tous').map((c) => ({ ...c, count: recipes.filter((r) => r.category === c.id).length })),
  ];

  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="sticky top-24">
              {/* Search */}
              <div className="relative mb-8">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Tofu, lentilles, quinoa..."
                  className="w-full pl-9 pr-3 py-2.5 bg-bg-warm border-0 rounded-sm text-sm placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Categories */}
              <div className="mb-8">
                {categoriesWithCount.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter('categorie', cat.id === 'tous' ? '' : cat.id)}
                    className={`flex items-center gap-2 w-full text-left py-1.5 text-sm transition-colors ${
                      (activeCategory === cat.id) || (cat.id === 'tous' && !activeCategory)
                        ? 'text-primary font-medium'
                        : 'text-text-light hover:text-text'
                    }`}
                  >
                    {cat.label}
                    <span className="text-[10px] text-text-light/60">{cat.count}</span>
                  </button>
                ))}
              </div>

              {/* Objectives */}
              <div className="mb-8">
                <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-3">Objectif</p>
                {objectives.map(obj => (
                  <button
                    key={obj.id}
                    onClick={() => updateFilter('objectif', activeObjective === obj.id ? '' : obj.id)}
                    className={`block w-full text-left py-1.5 text-sm transition-colors ${
                      activeObjective === obj.id
                        ? 'text-primary font-medium'
                        : 'text-text-light hover:text-text'
                    }`}
                  >
                    {obj.label}
                  </button>
                ))}
              </div>

              {/* Regime */}
              <div className="mb-8">
                <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-3">Régime</p>
                {regimes.map(reg => (
                  <button
                    key={reg.id}
                    onClick={() => updateFilter('regime', activeRegime === reg.id ? '' : reg.id)}
                    className={`block w-full text-left py-1.5 text-sm transition-colors ${
                      activeRegime === reg.id
                        ? 'text-primary font-medium'
                        : 'text-text-light hover:text-text'
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>

              {/* Time */}
              <div className="mb-8">
                <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-3">Temps</p>
                {[{ id: '15', label: '< 15 min' }, { id: '30', label: '< 30 min' }].map(t => (
                  <button
                    key={t.id}
                    onClick={() => updateFilter('temps', activeTime === t.id ? '' : t.id)}
                    className={`block w-full text-left py-1.5 text-sm transition-colors ${
                      activeTime === t.id
                        ? 'text-primary font-medium'
                        : 'text-text-light hover:text-text'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tags */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-3">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => updateFilter('tag', activeTag === tag ? '' : tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-sm border transition-colors ${
                        activeTag === tag
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-text-light hover:border-text-light'
                      }`}
                    >
                      {tag.replace('#', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl text-text">Recettes végétariennes pour sportifs</h1>
                <p className="text-sm text-text-light mt-1">{filteredRecipes.length} recette{filteredRecipes.length > 1 ? 's' : ''} disponible{filteredRecipes.length > 1 ? 's' : ''}</p>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-text-light hover:text-primary transition-colors"
                >
                  <X size={14} /> Effacer les filtres
                </button>
              )}
            </div>

            {filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredRecipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isFavorite={favorites.includes(recipe.id)}
                    toggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-text-light">Aucune recette trouvée avec ces filtres.</p>
                <button
                  onClick={clearFilters}
                  className="mt-3 text-sm text-primary hover:text-primary-dark transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
