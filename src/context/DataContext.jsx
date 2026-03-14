import { createContext, useContext, useState, useEffect } from 'react';
import { fetchRecipes, fetchArticles } from '../lib/data';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const value = {
    recipes: recipes ?? [],
    articles: articles ?? [],
    loading,
    error,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
