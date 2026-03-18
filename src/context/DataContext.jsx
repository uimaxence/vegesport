import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchRecipes, fetchArticles, fetchRecipeById } from '../lib/data';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recipeById, setRecipeById] = useState(() => new Map());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchRecipes(), fetchArticles()])
      .then(([r, a]) => {
        if (!cancelled) {
          setRecipes(Array.isArray(r) ? r : []);
          setArticles(Array.isArray(a) ? a : []);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message || 'Erreur chargement données');
          setRecipes((prev) => (Array.isArray(prev) ? prev : []));
          setArticles((prev) => (Array.isArray(prev) ? prev : []));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const refetchRecipes = useCallback(() => {
    fetchRecipes().then((r) => setRecipes(Array.isArray(r) ? r : [])).catch(() => {});
  }, []);

  const getRecipe = useCallback(async (id) => {
    if (id == null) return null;
    const key = String(id);
    const existing = recipeById.get(key);
    if (existing) return existing;
    const full = await fetchRecipeById(id);
    if (full) {
      setRecipeById((prev) => {
        const next = new Map(prev);
        next.set(key, full);
        return next;
      });
    }
    return full;
  }, [recipeById]);

  const value = {
    recipes: recipes ?? [],
    articles: articles ?? [],
    loading,
    error,
    refetchRecipes,
    getRecipe,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
