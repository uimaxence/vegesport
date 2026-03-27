import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { fetchHouseholdMembers } from '../lib/household';

const AuthContext = createContext(null);

// ─── localStorage helpers ────────────────────────────────────────────────────
const LS_PLANNINGS_PREFIX = 'vegeprot_plannings_';
const LS_HOUSEHOLD_PREFIX = 'vegeprot_household_';

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

function loadHouseholdFromLS(userId) {
  try {
    const raw = localStorage.getItem(`${LS_HOUSEHOLD_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHouseholdToLS(userId, members) {
  try {
    if (members && members.length > 0) {
      localStorage.setItem(`${LS_HOUSEHOLD_PREFIX}${userId}`, JSON.stringify(members));
    }
  } catch {}
}
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CONSENTS = { newsletter: false, ads_personnalisation: false, partage_partenaires: false };
const DEFAULT_PLANNING_PREFERENCES = {
  objective: 'masse',
  niveau: 'amateur',
  poids: 70,
  regime: 'vegetarien',
  meals_per_day: 4,
  portions: 2,
};
const PROTECTED_PATH_PREFIXES = ['/profil', '/donnees-personnelles', '/admin'];

function isSessionError(error) {
  const message = String(error?.message || error || '').toLowerCase();
  return (
    message.includes('jwt') ||
    message.includes('token') ||
    message.includes('session') ||
    message.includes('refresh') ||
    message.includes('auth')
  );
}

function shouldRedirectToLogin() {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname || '/';
  return PROTECTED_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [consents, setConsents] = useState(DEFAULT_CONSENTS);
  const [planningPreferences, setPlanningPreferences] = useState(DEFAULT_PLANNING_PREFERENCES);
  const [householdMembers, setHouseholdMembers] = useState([]);
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

  const clearAuthState = useCallback(() => {
    setUser(null);
    setFavorites([]);
    setHouseholdMembers([]);
    setConsents(DEFAULT_CONSENTS);
    setPlanningPreferences(DEFAULT_PLANNING_PREFERENCES);
    setSavedPlannings(loadPlanningsFromLS('guest'));
  }, []);

  const handleExpiredSession = useCallback(async () => {
    // Nettoie d'abord l'état local pour éviter les écrans cassés.
    clearAuthState();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore: la session est probablement déjà invalide côté Supabase.
      }
    }
    if (shouldRedirectToLogin()) {
      const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const params = new URLSearchParams({ expired: '1' });
      if (next && next !== '/connexion') params.set('next', next);
      window.location.replace(`/connexion?${params.toString()}`);
    }
  }, [clearAuthState]);

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
      .select('id, label, objective, meals, meal_multipliers, created_at, week_start')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return (data || []).map((p) => ({
      id: p.id,
      date: p.label || new Date(p.created_at).toLocaleDateString('fr-FR'),
      objective: p.objective || '',
      meals: p.meals || {},
      mealMultipliers: p.meal_multipliers || {},
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

  const loadPlanningPreferences = useCallback(async (userId) => {
    if (!supabase || !userId) return DEFAULT_PLANNING_PREFERENCES;
    try {
      const { data } = await supabase
        .from('user_planning_preferences')
        .select('objective, niveau, poids, regime, meals_per_day, portions')
        .eq('user_id', userId)
        .maybeSingle();
      if (!data) return DEFAULT_PLANNING_PREFERENCES;
      return {
        objective: data.objective || 'masse',
        niveau: data.niveau || 'amateur',
        poids: Number(data.poids) || 70,
        regime: data.regime || 'vegetarien',
        meals_per_day: Number(data.meals_per_day) || 4,
        portions: Number(data.portions) || 2,
      };
    } catch {
      return DEFAULT_PLANNING_PREFERENCES;
    }
  }, []);

  const savePlanningPreferences = useCallback(async (userId, updates) => {
    if (!supabase || !userId || !updates) return;
    const next = {
      objective: updates.objective || 'masse',
      niveau: updates.niveau || 'amateur',
      poids: Number(updates.poids) || 70,
      regime: updates.regime || 'vegetarien',
      meals_per_day: Number(updates.meals_per_day) || 4,
      portions: Number(updates.portions) || 2,
    };
    setPlanningPreferences(next);
    await supabase.from('user_planning_preferences').upsert(
      {
        user_id: userId,
        ...next,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
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

  // ── Effet 1 : auth state uniquement ──────────────────────────────────────
  // onAuthStateChange ne fait que mettre à jour `user`.
  // Aucune requête DB ici → pas de deadlock avec le verrou interne Supabase.
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearAuthState();
        return;
      }
      setUser(session?.user ?? null);
    });

    // Timeout de sécurité
    const timeoutId = setTimeout(() => setLoading(false), 5000);

    const refreshOnFocus = async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.refreshSession();
      if (error && isSessionError(error)) await handleExpiredSession();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshOnFocus();
    };
    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [clearAuthState, handleExpiredSession]);

  // ── Effet 2 : chargement des données quand user.id change ─────────────
  // Tourne dans un cycle React séparé → le client Supabase a fini son init.
  useEffect(() => {
    const userId = user?.id;
    if (!userId || !supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    // Cache localStorage immédiat
    const cachedPlannings = loadPlanningsFromLS(userId);
    if (cachedPlannings.length > 0) setSavedPlannings(cachedPlannings);
    const cachedHousehold = loadHouseholdFromLS(userId);
    if (cachedHousehold.length > 0) setHouseholdMembers(cachedHousehold);

    async function loadAllUserData() {
      const [favs, plans, userConsents, prefs, household] = await Promise.all([
        loadFavorites(userId).catch(() => []),
        loadPlannings(userId).catch(() => []),
        loadConsents(userId, user).catch(() => DEFAULT_CONSENTS),
        loadPlanningPreferences(userId).catch(() => DEFAULT_PLANNING_PREFERENCES),
        fetchHouseholdMembers(userId).catch(() => []),
      ]);
      if (cancelled) return;

      setFavorites(favs);
      setConsents(userConsents);
      setPlanningPreferences(prefs);

      if (household.length > 0) {
        setHouseholdMembers(household);
        saveHouseholdToLS(userId, household);
      }
      if (plans.length > 0) {
        savePlanningsToLS(userId, plans);
        setSavedPlannings(plans);
      }
    }

    loadAllUserData()
      .catch((err) => {
        if (isSessionError(err)) handleExpiredSession();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user?.id, loadFavorites, loadPlannings, loadConsents, loadPlanningPreferences, handleExpiredSession]);

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
        mealMultipliers: planning.mealMultipliers || {},
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
            meal_multipliers: planning.mealMultipliers || {},
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
            meal_multipliers: planning.mealMultipliers || {},
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
      const { meals, meal_multipliers, label, objective, week_start } = payload;
      const updates = {};
      if (meals !== undefined) updates.meals = meals;
      if (meal_multipliers !== undefined) updates.meal_multipliers = meal_multipliers;
      if (label !== undefined) updates.label = label;
      if (objective !== undefined) updates.objective = objective;
      if (week_start !== undefined) updates.week_start = week_start;
      if (Object.keys(updates).length === 0) return;
      setPlannings((prev) =>
        prev.map((p) =>
          p.id === planningId
            ? {
                ...p,
                meals: updates.meals ?? p.meals,
                mealMultipliers: updates.meal_multipliers ?? p.mealMultipliers,
                objective: updates.objective ?? p.objective,
                date: updates.label ?? p.date,
                weekStart: updates.week_start ?? p.weekStart,
              }
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
    // 1. Nettoyer le localStorage EN PREMIER (synchrone) pour que le reload ne retrouve pas de session
    Object.keys(localStorage).forEach((k) => {
      if (
        k === 'supabase.auth.token' ||
        k.startsWith('supabase.auth.token') ||
        (k.startsWith('sb-') && k.includes('-auth-token')) ||
        k.startsWith(LS_HOUSEHOLD_PREFIX)
      ) {
        localStorage.removeItem(k);
      }
    });

    clearAuthState();

    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Déjà déconnecté côté storage, on ignore
      }
    }
  }, [clearAuthState]);

  const setUserLocal = useCallback((u) => {
    if (!isSupabaseConfigured()) setUser(u);
  }, []);

  const refreshHousehold = useCallback(async () => {
    if (user?.id) {
      const members = await fetchHouseholdMembers(user.id);
      if (members.length > 0) {
        setHouseholdMembers(members);
        saveHouseholdToLS(user.id, members);
      }
    }
  }, [user?.id]);

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
    householdMembers,
    refreshHousehold,
    loading,
    toggleFavorite,
    savePlanning,
    updatePlanning,
    planningPreferences,
    savePlanningPreferences: user?.id ? (updates) => savePlanningPreferences(user.id, updates) : undefined,
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
