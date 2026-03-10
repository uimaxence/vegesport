import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [savedPlannings, setSavedPlannings] = useState([]);
  const [loading, setLoading] = useState(!!isSupabaseConfigured());

  const loadFavorites = useCallback(async (userId) => {
    if (!supabase || !userId) return [];
    const { data } = await supabase
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return (data || []).map((r) => r.recipe_id);
  }, []);

  const loadPlannings = useCallback(async (userId) => {
    if (!supabase || !userId) return [];
    const { data } = await supabase
      .from('plannings')
      .select('id, label, objective, meals, created_at, week_start')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return (data || []).map((p) => ({
      id: p.id,
      date: p.label || new Date(p.created_at).toLocaleDateString('fr-FR'),
      objective: p.objective || '',
      meals: p.meals || {},
      weekStart: p.week_start || null,
    }));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user?.id) {
          loadFavorites(session.user.id).then(setFavorites);
          loadPlannings(session.user.id).then(setSavedPlannings);
        }
        setLoading(false);
      })
      .catch(() => {
        // Réseau inaccessible (ex. Failed to fetch auth.supabase.io) : on laisse l'app utilisable sans auth
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        try {
          const favs = await loadFavorites(session.user.id);
          const plans = await loadPlannings(session.user.id);
          setFavorites(favs);
          setSavedPlannings(plans);
        } catch {
          setFavorites([]);
          setSavedPlannings([]);
        }
      } else {
        setFavorites([]);
        setSavedPlannings([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadFavorites, loadPlannings]);

  const toggleFavorite = useCallback(
    async (recipeId) => {
      if (!user?.id) {
        setFavorites((prev) =>
          prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
        );
        return;
      }
      if (!supabase) return;
      const isFav = favorites.includes(recipeId);
      if (isFav) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('recipe_id', recipeId);
        setFavorites((prev) => prev.filter((id) => id !== recipeId));
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, recipe_id: recipeId });
        setFavorites((prev) => [...prev, recipeId]);
      }
    },
    [user?.id, favorites]
  );

  /** Retourne le lundi (YYYY-MM-DD) de la semaine d'une date */
  const getWeekStart = useCallback((d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return date.toISOString().slice(0, 10);
  }, []);

  const savePlanning = useCallback(
    async (planning) => {
      const weekStart = planning.weekStart || getWeekStart(new Date());
      const entry = {
        label: planning.date,
        objective: planning.objective,
        meals: planning.meals || {},
        week_start: weekStart,
      };
      setSavedPlannings((prev) => [
        { id: null, date: planning.date, objective: planning.objective, meals: planning.meals, weekStart },
        ...prev,
      ]);
      if (user?.id && supabase) {
        const { data } = await supabase.from('plannings').insert({ ...entry, user_id: user.id }).select('id, created_at').single();
        if (data) {
          setSavedPlannings((prev) =>
            prev.map((p) =>
              !p.id && p.date === planning.date ? { ...p, id: data.id } : p
            )
          );
        }
      }
    },
    [user?.id, getWeekStart]
  );

  const updatePlanning = useCallback(
    async (planningId, payload) => {
      const { meals, label, objective, week_start } = payload;
      const updates = {};
      if (meals !== undefined) updates.meals = meals;
      if (label !== undefined) updates.label = label;
      if (objective !== undefined) updates.objective = objective;
      if (week_start !== undefined) updates.week_start = week_start;
      if (Object.keys(updates).length === 0) return;
      setSavedPlannings((prev) =>
        prev.map((p) =>
          p.id === planningId ? { ...p, ...updates, date: updates.label ?? p.date, weekStart: updates.week_start ?? p.weekStart } : p
        )
      );
      if (user?.id && supabase) {
        await supabase.from('plannings').update(updates).eq('id', planningId).eq('user_id', user.id);
      }
    },
    [user?.id]
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setFavorites([]);
    setSavedPlannings([]);
  }, []);

  const setUserLocal = useCallback((u) => {
    if (!isSupabaseConfigured()) setUser(u);
  }, []);

  const value = {
    user: user
      ? {
          id: user.id || 'local',
          email: user.email,
          name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.name ?? user.email?.split('@')[0] ?? 'Utilisateur',
          avatar: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
          provider: user.app_metadata?.provider ?? 'email',
        }
      : null,
    favorites,
    savedPlannings,
    loading,
    toggleFavorite,
    savePlanning,
    updatePlanning,
    signOut,
    setUserLocal: isSupabaseConfigured() ? undefined : setUserLocal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
