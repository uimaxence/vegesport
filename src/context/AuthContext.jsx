import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

// ─── localStorage helpers ────────────────────────────────────────────────────
const LS_PLANNINGS_PREFIX = 'vegeprot_plannings_';

function lsKey(userId) {
  return `${LS_PLANNINGS_PREFIX}${userId || 'guest'}`;
}

function loadPlanningsFromLS(userId) {
  try {
    const raw = localStorage.getItem(lsKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePlanningsToLS(userId, plannings) {
  try {
    localStorage.setItem(lsKey(userId), JSON.stringify(plannings));
  } catch {}
}
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CONSENTS = { newsletter: false, ads_personnalisation: false, partage_partenaires: false };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [consents, setConsents] = useState(DEFAULT_CONSENTS);
  // Initialise depuis localStorage guest pour affichage immédiat
  const [savedPlannings, setSavedPlannings] = useState(() => loadPlanningsFromLS('guest'));
  const [loading, setLoading] = useState(!!isSupabaseConfigured());

  // Wrapper : met à jour le state ET localStorage en même temps
  const setPlannings = useCallback((updaterOrValue, userId) => {
    setSavedPlannings((prev) => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      savePlanningsToLS(userId || 'guest', next);
      return next;
    });
  }, []);

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

  const loadConsents = useCallback(async (userId, rawUser) => {
    if (!supabase || !userId) return DEFAULT_CONSENTS;
    try {
      const meta = rawUser?.user_metadata || {};
      const fromMeta = {
        newsletter: !!meta.consent_newsletter,
        ads_personnalisation: !!meta.consent_ads_personnalisation,
        partage_partenaires: !!meta.consent_partage_partenaires,
      };
      const hasMeta = fromMeta.newsletter || fromMeta.ads_personnalisation || fromMeta.partage_partenaires;
      if (hasMeta) {
        await supabase.from('user_consents').upsert(
          {
            user_id: userId,
            newsletter: fromMeta.newsletter,
            ads_personnalisation: fromMeta.ads_personnalisation,
            partage_partenaires: fromMeta.partage_partenaires,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      }
      const { data } = await supabase.from('user_consents').select('newsletter, ads_personnalisation, partage_partenaires').eq('user_id', userId).maybeSingle();
      if (data) return data;
      return hasMeta ? fromMeta : DEFAULT_CONSENTS;
    } catch {
      return DEFAULT_CONSENTS;
    }
  }, []);

  const updateConsents = useCallback(async (userId, updates) => {
    if (!supabase || !userId) return;
    setConsents((prev) => {
      const next = { ...prev, ...updates };
      supabase.from('user_consents').upsert(
        {
          user_id: userId,
          newsletter: next.newsletter,
          ads_personnalisation: next.ads_personnalisation,
          partage_partenaires: next.partage_partenaires,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      ).then(({ error }) => { if (error) setConsents(prev); });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u?.id) {
          // Pré-charge depuis localStorage pour affichage immédiat
          const cached = loadPlanningsFromLS(u.id);
          if (cached.length > 0) setSavedPlannings(cached);
          // Puis synchronise avec Supabase
          const [favs, plans, userConsents] = await Promise.all([
            loadFavorites(u.id),
            loadPlannings(u.id),
            loadConsents(u.id, u),
          ]);
          setFavorites(favs);
          setConsents(userConsents);
          // Supabase fait autorité : on écrase le cache et le LS
          if (plans.length > 0) {
            savePlanningsToLS(u.id, plans);
            setSavedPlannings(plans);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u?.id) {
        try {
          // Pré-charge depuis localStorage
          const cached = loadPlanningsFromLS(u.id);
          if (cached.length > 0) setSavedPlannings(cached);
          const [favs, plans, userConsents] = await Promise.all([
            loadFavorites(u.id),
            loadPlannings(u.id),
            loadConsents(u.id, u),
          ]);
          setFavorites(favs);
          setConsents(userConsents);
          if (plans.length > 0) {
            savePlanningsToLS(u.id, plans);
            setSavedPlannings(plans);
          }
        } catch {
          setFavorites([]);
        }
      } else {
        setFavorites([]);
        setConsents(DEFAULT_CONSENTS);
        // Garde les plannings guest depuis LS
        setSavedPlannings(loadPlanningsFromLS('guest'));
      }
    });

    return () => subscription.unsubscribe();
  }, [loadFavorites, loadPlannings, loadConsents]);

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

      // Mise à jour optimiste : réponse immédiate de l'UI
      setFavorites((prev) =>
        isFav ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
      );

      try {
        if (isFav) {
          const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('recipe_id', recipeId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('favorites').insert({ user_id: user.id, recipe_id: recipeId });
          if (error) throw error;
        }
      } catch (e) {
        console.error('toggleFavorite error:', e?.message);
        // Annule la mise à jour optimiste en cas d'échec
        setFavorites((prev) =>
          isFav ? [...prev, recipeId] : prev.filter((id) => id !== recipeId)
        );
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
      const newEntry = {
        id: null,
        date: planning.date,
        objective: planning.objective,
        meals: planning.meals || {},
        weekStart,
      };
      // Remplace le planning de la même semaine s'il existe déjà, sinon prepend
      setPlannings((prev) => {
        const filtered = prev.filter((p) => p.weekStart !== weekStart);
        return [newEntry, ...filtered];
      }, user?.id);

      if (user?.id && supabase) {
        // Vérifie s'il existe déjà un planning pour cette semaine en BDD
        const { data: existing } = await supabase
          .from('plannings')
          .select('id')
          .eq('user_id', user.id)
          .eq('week_start', weekStart)
          .maybeSingle();

        if (existing?.id) {
          // Mise à jour
          await supabase.from('plannings').update({
            label: planning.date,
            objective: planning.objective,
            meals: planning.meals || {},
          }).eq('id', existing.id).eq('user_id', user.id);
          setPlannings((prev) =>
            prev.map((p) => p.weekStart === weekStart ? { ...p, id: existing.id } : p),
            user.id
          );
        } else {
          // Création
          const { data } = await supabase.from('plannings').insert({
            user_id: user.id,
            label: planning.date,
            objective: planning.objective,
            meals: planning.meals || {},
            week_start: weekStart,
          }).select('id').single();
          if (data?.id) {
            setPlannings((prev) =>
              prev.map((p) => p.weekStart === weekStart && !p.id ? { ...p, id: data.id } : p),
              user.id
            );
          }
        }
      }
    },
    [user?.id, getWeekStart, setPlannings]
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
      setPlannings((prev) =>
        prev.map((p) =>
          p.id === planningId
            ? { ...p, ...updates, date: updates.label ?? p.date, weekStart: updates.week_start ?? p.weekStart }
            : p
        ),
        user?.id
      );
      if (user?.id && supabase) {
        await supabase.from('plannings').update(updates).eq('id', planningId).eq('user_id', user.id);
      }
    },
    [user?.id, setPlannings]
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setFavorites([]);
    // Conserve les plannings guest depuis LS
    setSavedPlannings(loadPlanningsFromLS('guest'));
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
    consents,
    loading,
    toggleFavorite,
    savePlanning,
    updatePlanning,
    updateConsents: user?.id ? (updates) => updateConsents(user.id, updates) : undefined,
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
