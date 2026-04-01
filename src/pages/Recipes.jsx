import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { canonicalUrl } from '../lib/seo';
import { categories, regimes, seasons, tags } from '../data/recipes';
import RecipeCard from '../components/RecipeCard';
import RecipesSkeleton from '../components/skeleton/RecipesSkeleton';

export default function Recipes({ favorites, toggleFavorite }) {
  usePageMeta({
    title: 'Recettes végétariennes protéinées pour sportifs',
    description: 'Découvrez toutes nos recettes végétariennes et végétaliennes riches en protéines. Filtrez par catégorie, régime alimentaire, tags et temps de préparation.',
    canonical: canonicalUrl('/recettes'),
  });
  const { recipes, loading, error } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = searchParams.get('search') || '';
  const activeCategory = searchParams.get('categorie') || 'tous';
  const activeRegime = searchParams.get('regime') || '';
  const activeTag = searchParams.get('tag') || '';
  const activeTime = searchParams.get('temps') || '';
  const activeSeason = searchParams.get('saison') || '';
  const activeFiltre = searchParams.get('filtre') || '';

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

  const hasActiveFilters = activeCategory !== 'tous' || activeRegime || activeTag || activeTime || activeSeason || activeFiltre || searchQuery;

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
      if (activeRegime && !recipe.regime.includes(activeRegime)) return false;
      if (activeTag && !recipe.tags.includes(activeTag)) return false;
      if (activeTime === '15' && recipe.time > 15) return false;
      if (activeTime === '30' && recipe.time > 30) return false;
      if (activeSeason && !recipe.season?.includes(activeSeason)) return false;
      if (activeFiltre === 'proteines' && recipe.protein < 25) return false;
      if (activeFiltre === 'leger' && recipe.calories >= 400) return false;
      return true;
    });
  }, [recipes, searchQuery, activeCategory, activeRegime, activeTag, activeTime, activeSeason, activeFiltre]);

  if (loading) return <RecipesSkeleton />;
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
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block lg:w-56 flex-shrink-0">
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
              {/* Search */}
              <div className="relative mb-8">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Tofu, lentilles, quinoa..."
                  className="w-full pl-9 pr-3 py-2.5 bg-black/[0.04] border border-transparent rounded-[10px] text-sm text-text placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
                />
              </div>

              {/* Categories */}
              <div className="mb-8 p-1 rounded-[10px] bg-black/[0.04]">
                <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-2 px-1">Catégorie</p>
                {categoriesWithCount.map(cat => {
                  const isActive = (activeCategory === cat.id) || (cat.id === 'tous' && !activeCategory);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter('categorie', cat.id === 'tous' ? '' : cat.id)}
                      className={`flex items-center justify-between gap-2 w-full text-left py-2 px-2.5 rounded-lg text-sm transition-colors ${
                        isActive ? 'bg-white text-text font-medium shadow-sm' : 'text-text-light hover:text-text'
                      }`}
                    >
                      {cat.label}
                      <span className="text-[13px] text-text-light/70">{cat.count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Regime */}
              <div className="mb-8 p-1 rounded-[10px] bg-black/[0.04]">
                <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-2 px-1">Régime</p>
                {regimes.map(reg => (
                  <button
                    key={reg.id}
                    onClick={() => updateFilter('regime', activeRegime === reg.id ? '' : reg.id)}
                    className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm transition-colors ${
                      activeRegime === reg.id ? 'bg-white text-text font-medium shadow-sm' : 'text-text-light hover:text-text'
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>

              {/* Time */}
              <div className="mb-8 p-1 rounded-[10px] bg-black/[0.04]">
                <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-2 px-1">Temps</p>
                {[{ id: '15', label: '< 15 min' }, { id: '30', label: '< 30 min' }].map(t => (
                  <button
                    key={t.id}
                    onClick={() => updateFilter('temps', activeTime === t.id ? '' : t.id)}
                    className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm transition-colors ${
                      activeTime === t.id ? 'bg-white text-text font-medium shadow-sm' : 'text-text-light hover:text-text'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Season */}
              <div className="mb-8 p-1 rounded-[10px] bg-black/[0.04]">
                <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-2 px-1">Saison</p>
                {seasons.map(s => (
                  <button
                    key={s.id}
                    onClick={() => updateFilter('saison', activeSeason === s.id ? '' : s.id)}
                    className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm transition-colors ${
                      activeSeason === s.id ? 'bg-white text-text font-medium shadow-sm' : 'text-text-light hover:text-text'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Filtres macros */}
              <div className="mb-8 p-1 rounded-[10px] bg-black/[0.04]">
                <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-2 px-1">Nutrition</p>
                {[{ id: 'proteines', label: 'Riche en protéines (≥ 25g)' }, { id: 'leger', label: 'Léger (< 400 kcal)' }].map(f => (
                  <button
                    key={f.id}
                    onClick={() => updateFilter('filtre', activeFiltre === f.id ? '' : f.id)}
                    className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm transition-colors ${
                      activeFiltre === f.id ? 'bg-white text-text font-medium shadow-sm' : 'text-text-light hover:text-text'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Tags */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => {
                    const isActive = activeTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => updateFilter('tag', isActive ? '' : tag)}
                        className={`text-[15px] px-2.5 py-1.5 rounded-lg border transition-colors ${
                          isActive
                            ? 'bg-white border-black/10 text-text font-medium shadow-sm'
                            : 'bg-black/[0.04] border-transparent text-text-light hover:text-text hover:bg-black/[0.06]'
                        }`}
                      >
                        {tag.replace('#', '')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Bottom sheet filtres — mobile only */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowFilters(false)}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <div
                className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl bg-white shadow-2xl overflow-y-auto animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Handle bar */}
                <div className="sticky top-0 bg-white z-10 pt-3 pb-2 px-6 border-b border-black/5">
                  <div className="w-10 h-1 rounded-full bg-black/15 mx-auto mb-3" />
                  <div className="flex items-center justify-between">
                    <p className="font-display text-lg text-text">Filtres</p>
                    <button onClick={() => setShowFilters(false)} className="p-1.5 text-text-light hover:text-text transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => updateFilter('search', e.target.value)}
                      placeholder="Tofu, lentilles, quinoa..."
                      className="w-full pl-9 pr-3 py-2.5 bg-black/[0.04] border border-transparent rounded-[10px] text-sm text-text placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
                    />
                  </div>

                  {/* Categories */}
                  <div className="p-1 rounded-[10px] bg-black/[0.04]">
                    <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-2 px-1">Catégorie</p>
                    {categoriesWithCount.map(cat => {
                      const isActive = (activeCategory === cat.id) || (cat.id === 'tous' && !activeCategory);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => updateFilter('categorie', cat.id === 'tous' ? '' : cat.id)}
                          className={`flex items-center justify-between gap-2 w-full text-left py-2 px-2.5 rounded-lg text-sm transition-colors ${
                            isActive ? 'bg-white text-text font-medium shadow-sm' : 'text-text-light hover:text-text'
                          }`}
                        >
                          {cat.label}
                          <span className="text-[13px] text-text-light/70">{cat.count}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Regime */}
                  <div className="p-1 rounded-[10px] bg-black/[0.04]">
                    <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-2 px-1">Régime</p>
                    {regimes.map(reg => (
                      <button
                        key={reg.id}
                        onClick={() => updateFilter('regime', activeRegime === reg.id ? '' : reg.id)}
                        className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm transition-colors ${
                          activeRegime === reg.id ? 'bg-white text-text font-medium shadow-sm' : 'text-text-light hover:text-text'
                        }`}
                      >
                        {reg.label}
                      </button>
                    ))}
                  </div>

                  {/* Time */}
                  <div className="p-1 rounded-[10px] bg-black/[0.04]">
                    <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-2 px-1">Temps</p>
                    {[{ id: '15', label: '< 15 min' }, { id: '30', label: '< 30 min' }].map(t => (
                      <button
                        key={t.id}
                        onClick={() => updateFilter('temps', activeTime === t.id ? '' : t.id)}
                        className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm transition-colors ${
                          activeTime === t.id ? 'bg-white text-text font-medium shadow-sm' : 'text-text-light hover:text-text'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Season */}
                  <div className="p-1 rounded-[10px] bg-black/[0.04]">
                    <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-2 px-1">Saison</p>
                    {seasons.map(s => (
                      <button
                        key={s.id}
                        onClick={() => updateFilter('saison', activeSeason === s.id ? '' : s.id)}
                        className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm transition-colors ${
                          activeSeason === s.id ? 'bg-white text-text font-medium shadow-sm' : 'text-text-light hover:text-text'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Nutrition */}
                  <div className="p-1 rounded-[10px] bg-black/[0.04]">
                    <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-2 px-1">Nutrition</p>
                    {[{ id: 'proteines', label: 'Riche en protéines (≥ 25g)' }, { id: 'leger', label: 'Léger (< 400 kcal)' }].map(f => (
                      <button
                        key={f.id}
                        onClick={() => updateFilter('filtre', activeFiltre === f.id ? '' : f.id)}
                        className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm transition-colors ${
                          activeFiltre === f.id ? 'bg-white text-text font-medium shadow-sm' : 'text-text-light hover:text-text'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Tags */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-text-light mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(tag => {
                        const isActive = activeTag === tag;
                        return (
                          <button
                            key={tag}
                            onClick={() => updateFilter('tag', isActive ? '' : tag)}
                            className={`text-[15px] px-2.5 py-1.5 rounded-lg border transition-colors ${
                              isActive
                                ? 'bg-white border-black/10 text-text font-medium shadow-sm'
                                : 'bg-black/[0.04] border-transparent text-text-light hover:text-text hover:bg-black/[0.06]'
                            }`}
                          >
                            {tag.replace('#', '')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sticky footer */}
                <div className="sticky bottom-0 bg-white border-t border-black/5 p-4 flex gap-3">
                  {hasActiveFilters && (
                    <button
                      onClick={() => { clearFilters(); setShowFilters(false); }}
                      className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-text-light hover:text-text transition-colors"
                    >
                      Effacer
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                  >
                    Voir {filteredRecipes.length} recette{filteredRecipes.length > 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl text-text">Recettes végétariennes pour sportifs</h1>
                <p className="text-sm text-text-light mt-1">{filteredRecipes.length} recette{filteredRecipes.length > 1 ? 's' : ''} disponible{filteredRecipes.length > 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Bouton filtres mobile */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-text hover:border-text/30 transition-colors"
                >
                  <SlidersHorizontal size={14} />
                  Filtres
                  {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="hidden lg:flex items-center gap-1 text-xs text-text-light hover:text-text transition-colors"
                  >
                    <X size={14} /> Effacer les filtres
                  </button>
                )}
              </div>
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
