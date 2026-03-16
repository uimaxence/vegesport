import { supabase, isSupabaseConfigured } from './supabase';

const ADMIN_EMAIL = 'maxencecailleau.pro@gmail.com';
// Délai plus large pour éviter les erreurs "timeout" trop agressives sur /admin
const FETCH_TIMEOUT_MS = 15000;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

export function isAdminUser(user) {
  return !!user?.email && user.email === ADMIN_EMAIL;
}

/** Liste des recettes pour l'admin (toujours depuis la BDD). */
export async function fetchAdminRecipes() {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await withTimeout(
    supabase
      .from('recipes')
      .select('id, title, category, time')
      .order('id', { ascending: true }),
    FETCH_TIMEOUT_MS
  );
  if (error) throw error;
  return data || [];
}

/** Liste tous les ingrédients (admin ou lecture publique). */
export async function fetchIngredients() {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await withTimeout(
    supabase
      .from('ingredients')
      .select('id, name, rayon, created_at')
      .order('name', { ascending: true }),
    FETCH_TIMEOUT_MS
  );
  if (error) throw error;
  return data || [];
}

/** Crée un ingrédient s'il n'existe pas. Retourne { id, created } (created = true si insert). */
export async function createIngredient(name, rayon = 'Fruits et légumes') {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');
  const trimmed = (name || '').trim();
  if (!trimmed) throw new Error('Nom d\'ingrédient requis');

  const { data: existing } = await supabase
    .from('ingredients')
    .select('id')
    .ilike('name', trimmed)
    .limit(1)
    .single();

  if (existing) return { id: existing.id, created: false };

  const { data: inserted, error } = await supabase
    .from('ingredients')
    .insert({ name: trimmed, rayon: (rayon || 'Fruits et légumes').trim() })
    .select('id')
    .single();
  if (error) throw error;
  return { id: inserted.id, created: true };
}

/** Retourne l'id d'un ingrédient par nom (insensible à la casse), ou null. */
export async function getIngredientIdByName(name) {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data } = await supabase
    .from('ingredients')
    .select('id')
    .ilike('name', (name || '').trim())
    .limit(1)
    .single();
  return data?.id ?? null;
}

/** Upload une image dans le bucket recipes. Retourne l'URL publique. */
export async function uploadRecipeImage(recipeId, file) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');
  if (!file) throw new Error('Fichier requis');

  const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const path = `${recipeId}.${ext}`;

  const { error } = await supabase.storage
    .from('recipes')
    .upload(path, file, { upsert: true });
  if (error) throw error;

  const { data: urlData } = supabase.storage.from('recipes').getPublicUrl(path);
  return urlData?.publicUrl ?? null;
}

/** Construit le payload recipes pour insert/update (colonnes snake_case). */
function recipeToRow(payload) {
  return {
    title: payload.title,
    category: payload.category,
    time: Number(payload.time) || 0,
    calories: Number(payload.calories) || 0,
    protein: Number(payload.protein) || 0,
    carbs: Number(payload.carbs) || 0,
    fat: Number(payload.fat) || 0,
    servings: Number(payload.servings) || 1,
    difficulty: payload.difficulty || 'Facile',
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    objective: Array.isArray(payload.objective) ? payload.objective : [],
    regime: Array.isArray(payload.regime) ? payload.regime : [],
    season: Array.isArray(payload.season) ? payload.season : [],
    main_ingredient: payload.mainIngredient ?? payload.main_ingredient ?? null,
    image: payload.image ?? null,
    ingredients: payload.ingredients ?? [], // sera recalculé après recipe_ingredients
    steps: Array.isArray(payload.steps) ? payload.steps : [],
  };
}

/** Résout chaque entrée en ingredient_id (création si besoin) et retourne [{ ingredient_id, quantity_text }]. */
async function resolveRecipeIngredients(entries) {
  const resolved = [];
  for (const entry of entries || []) {
    const qty = (entry.quantityText ?? entry.quantity_text ?? '').trim();
    let ingredientId = entry.ingredientId ?? entry.ingredient_id;
    if (ingredientId == null && (entry.name || entry.ingredientName)) {
      const name = (entry.name ?? entry.ingredientName ?? '').trim();
      const rayon = (entry.rayon ?? 'Fruits et légumes').trim();
      const { id } = await createIngredient(name, rayon);
      ingredientId = id;
    }
    if (ingredientId != null) {
      resolved.push({ ingredient_id: ingredientId, quantity_text: qty });
    }
  }
  return resolved;
}

/** Met à jour recipes.ingredients (jsonb) à partir de recipe_ingredients pour une recette. */
async function syncRecipeIngredientsJsonb(recipeId) {
  if (!supabase) return;
  const { data: rows } = await supabase
    .from('recipe_ingredients')
    .select('quantity_text, ingredients(name)')
    .eq('recipe_id', recipeId);

  const arr = (rows || []).map((r) => {
    const name = r.ingredients?.name ?? '';
    const qty = (r.quantity_text || '').trim();
    return qty ? `${qty} ${name}`.trim() : name;
  }).filter(Boolean);

  await supabase
    .from('recipes')
    .update({ ingredients: arr })
    .eq('id', recipeId);
}

/**
 * Crée une recette + ses recipe_ingredients et synchronise ingredients (jsonb).
 * payload: title, category, time, calories, protein, carbs, fat, servings, difficulty,
 * tags, objective, regime, season, mainIngredient, image, steps, recipeIngredients: [{ ingredientId?, name?, rayon?, quantityText }]
 */
export async function createRecipe(payload) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');

  const row = recipeToRow(payload);
  row.ingredients = []; // sera mis à jour après

  const { data: recipe, error: errRecipe } = await supabase
    .from('recipes')
    .insert(row)
    .select('id')
    .single();
  if (errRecipe) throw errRecipe;
  const recipeId = recipe.id;

  const resolved = await resolveRecipeIngredients(payload.recipeIngredients);
  if (resolved.length > 0) {
    const { error: errRi } = await supabase
      .from('recipe_ingredients')
      .insert(resolved.map((r) => ({ recipe_id: recipeId, ...r })));
    if (errRi) throw errRi;
  }

  await syncRecipeIngredientsJsonb(recipeId);
  return recipeId;
}

/**
 * Met à jour une recette, remplace les recipe_ingredients et synchronise ingredients (jsonb).
 */
export async function updateRecipe(id, payload) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');

  const row = recipeToRow(payload);
  delete row.ingredients; // on le recalcule

  const { error: errRecipe } = await supabase
    .from('recipes')
    .update(row)
    .eq('id', id);
  if (errRecipe) throw errRecipe;

  await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);

  const resolved = await resolveRecipeIngredients(payload.recipeIngredients);
  if (resolved.length > 0) {
    const { error: errRi } = await supabase
      .from('recipe_ingredients')
      .insert(resolved.map((r) => ({ recipe_id: id, ...r })));
    if (errRi) throw errRi;
  }

  await syncRecipeIngredientsJsonb(id);
}

/**
 * Supprime une recette (cascade supprime recipe_ingredients).
 */
export async function deleteRecipe(id) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw error;
}

/** Récupère une recette avec ses recipe_ingredients (pour édition). */
export async function fetchRecipeForEdit(id) {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data: recipe, error: e1 } = await withTimeout(
    supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single(),
    FETCH_TIMEOUT_MS
  );
  if (e1 || !recipe) return null;

  const { data: ri } = await withTimeout(
    supabase
      .from('recipe_ingredients')
      .select('ingredient_id, quantity_text, ingredients(id, name, rayon)')
      .eq('recipe_id', id),
    FETCH_TIMEOUT_MS
  );

  const recipeIngredients = (ri || []).map((r) => ({
    ingredientId: r.ingredient_id,
    ingredient_id: r.ingredient_id,
    quantityText: r.quantity_text,
    quantity_text: r.quantity_text,
    name: r.ingredients?.name,
    rayon: r.ingredients?.rayon,
  }));

  return {
    id: recipe.id,
    title: recipe.title,
    category: recipe.category,
    time: recipe.time,
    calories: recipe.calories,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    tags: recipe.tags || [],
    objective: recipe.objective || [],
    regime: recipe.regime || [],
    season: recipe.season || [],
    mainIngredient: recipe.main_ingredient,
    main_ingredient: recipe.main_ingredient,
    image: recipe.image,
    steps: recipe.steps || [],
    recipeIngredients,
  };
}
