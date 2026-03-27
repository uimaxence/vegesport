import { supabase, isSupabaseConfigured } from './supabase';

export const APPETITE_OPTIONS = [
  { value: 'petit', label: 'Petit', factor: 0.7 },
  { value: 'moyen', label: 'Moyen', factor: 1.0 },
  { value: 'grand', label: 'Grand', factor: 1.4 },
];

export const GENDER_OPTIONS = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'autre', label: 'Autre' },
];

export function appetiteToFactor(appetite) {
  return APPETITE_OPTIONS.find((o) => o.value === appetite)?.factor ?? 1.0;
}

export function totalFactor(members) {
  if (!members || members.length === 0) return 1;
  return members.reduce((sum, m) => sum + (m.size_factor ?? appetiteToFactor(m.appetite)), 0);
}

export function getOwner(members) {
  return members?.find((m) => m.is_owner) ?? null;
}

/** Macros pour un membre = macros_per_serving × appetite_factor */
export function memberMacros(recipe, member) {
  const f = member.size_factor ?? appetiteToFactor(member.appetite);
  return {
    calories: Math.round((recipe.calories ?? 0) * f),
    protein: Math.round((recipe.protein ?? 0) * f),
    carbs: Math.round((recipe.carbs ?? 0) * f),
    fat: Math.round((recipe.fat ?? 0) * f),
  };
}

/** Macros de l'owner (utilisateur connecté) */
export function ownerMacros(recipe, members) {
  const owner = getOwner(members);
  if (!owner) return null;
  return memberMacros(recipe, owner);
}

/** Facteur de scaling pour les ingrédients = total_factor / servings_base */
export function ingredientScale(members, recipeServings) {
  return totalFactor(members) / (recipeServings || 1);
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function fetchHouseholdMembers(userId) {
  if (!isSupabaseConfigured() || !supabase || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('household_members')
      .select('*')
      .eq('user_id', userId)
      .order('position');
    if (error) return [];
    if (!data) return [];
    // Déduplique les owners (bug historique de race condition)
    let seenOwner = false;
    const deduped = [];
    for (const row of data) {
      if (row.is_owner) {
        if (seenOwner) continue;
        seenOwner = true;
      }
      deduped.push(row);
    }
    return deduped;
  } catch (err) {
    console.error('[household] fetch crashed:', err);
    return [];
  }
}

/** Crée le membre owner si il n'existe pas encore. Nettoie les doublons éventuels. */
export async function ensureOwner(userId, name) {
  if (!isSupabaseConfigured() || !supabase) return null;
  // Récupère TOUS les owners (il peut y avoir des doublons)
  const { data: owners } = await supabase
    .from('household_members')
    .select('*')
    .eq('user_id', userId)
    .eq('is_owner', true)
    .order('created_at', { ascending: true });

  if (owners && owners.length > 1) {
    // Supprime les doublons, garde le plus ancien
    const duplicateIds = owners.slice(1).map((o) => o.id);
    await supabase.from('household_members').delete().in('id', duplicateIds);
    return owners[0];
  }
  if (owners && owners.length === 1) return owners[0];

  const { data, error } = await supabase
    .from('household_members')
    .insert({ user_id: userId, name: name || 'Moi', appetite: 'moyen', size_factor: 1.0, is_owner: true, position: 0 })
    .select()
    .single();
  if (error) { console.warn('ensureOwner:', error.message); return null; }
  return data;
}

export async function addHouseholdMember(userId, { name, appetite = 'moyen', gender = null }) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');
  const factor = appetiteToFactor(appetite);
  const { data, error } = await supabase
    .from('household_members')
    .insert({ user_id: userId, name, appetite, size_factor: factor, gender, is_owner: false })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateHouseholdMember(id, updates) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');
  const row = {};
  if (updates.name != null) row.name = updates.name;
  if (updates.gender !== undefined) row.gender = updates.gender || null;
  if (updates.appetite != null) {
    row.appetite = updates.appetite;
    row.size_factor = appetiteToFactor(updates.appetite);
  }
  const { data, error } = await supabase
    .from('household_members')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeHouseholdMember(id) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');
  const { error } = await supabase.from('household_members').delete().eq('id', id);
  if (error) throw error;
}
