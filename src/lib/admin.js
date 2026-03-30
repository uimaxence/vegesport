import { supabase, isSupabaseConfigured } from './supabase';

const ADMIN_EMAIL = 'maxencecailleau.pro@gmail.com';

// ─── REST direct (contourne supabase-js + son init auth) ─────────────────────
// supabase-js attend que la session auth soit initialisée avant d'envoyer les
// requêtes REST. En attendant, les appels peuvent geler plusieurs secondes.
// fetch() direct avec apikey + Authorization: Bearer anonKey ne passe pas par
// ce mécanisme et répond immédiatement.

const REST_TIMEOUT_MS = 10000;

function getRestBase() {
  return String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
}

function getAnonKey() {
  return String(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
}

async function restGet(path) {
  const base = getRestBase();
  const key = getAnonKey();
  if (!base || !key) throw new Error('Supabase non configure (variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes)');

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), REST_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}/rest/v1/${path}`, {
      signal: controller.signal,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Supabase HTTP ${res.status}: ${body || res.statusText}`);
    }
    return await res.json();
  } catch (e) {
    if (e?.name === 'AbortError') {
      throw new Error(
        `Supabase ne répond pas après ${REST_TIMEOUT_MS / 1000}s. ` +
        `Le projet est peut-être en veille (plan gratuit) — réessaie dans quelques secondes.`
      );
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export function isAdminUser(user) {
  return !!user?.email && user.email === ADMIN_EMAIL;
}

/** Liste des recettes pour l'admin (lecture directe REST, pas de supabase-js). */
export async function fetchAdminRecipes({ page = 0, pageSize = 50 } = {}) {
  if (!isSupabaseConfigured()) return [];
  const offset = Math.max(0, page) * Math.max(1, pageSize);
  const limit = Math.max(1, pageSize);
  const data = await restGet(
    `recipes?select=id,title,category,time&order=id.desc&offset=${offset}&limit=${limit}`
  );
  return Array.isArray(data) ? data : [];
}

/** Liste tous les ingrédients (lecture directe REST). */
export async function fetchIngredients() {
  if (!isSupabaseConfigured()) return [];
  const data = await restGet('ingredients?select=id,name,rayon,unit_default,category,is_verified,calories_per_100,protein_per_100,carbs_per_100,fat_per_100,created_at&order=name.asc');
  return Array.isArray(data) ? data : [];
}

/** Crée un ingrédient s'il n'existe pas. Retourne { id, created }. */
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

/**
 * Enrichit un ingrédient via l'API Open Food Facts.
 * Cherche le nom, prend le premier résultat pertinent, met à jour les macros.
 * @returns {{ calories_per_100, protein_per_100, carbs_per_100, fat_per_100, off_id }}
 */
export async function enrichIngredientFromOFF(ingredientId) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');

  const { data: ing } = await supabase
    .from('ingredients')
    .select('name')
    .eq('id', ingredientId)
    .single();
  if (!ing) throw new Error('Ingrédient introuvable');

  const params = new URLSearchParams({
    search_terms: ing.name,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '5',
    fields: 'product_name,code,nutriments',
  });
  const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params}`);
  if (!res.ok) throw new Error(`Erreur API Open Food Facts (HTTP ${res.status})`);
  const data = await res.json();

  // Prend le premier produit avec des nutriments exploitables
  const product = (data.products || []).find(
    (p) => p.nutriments && (p.nutriments['energy-kcal_100g'] != null || p.nutriments['energy-kcal'] != null)
  );
  if (!product) throw new Error(`Aucun résultat nutritionnel pour « ${ing.name} »`);

  const n = product.nutriments;
  const update = {
    calories_per_100: Math.round(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0),
    protein_per_100: Math.round((n['proteins_100g'] ?? 0) * 10) / 10,
    carbs_per_100: Math.round((n['carbohydrates_100g'] ?? 0) * 10) / 10,
    fat_per_100: Math.round((n['fat_100g'] ?? 0) * 10) / 10,
    off_id: product.code || null,
    is_verified: true,
  };

  const { error } = await supabase
    .from('ingredients')
    .update(update)
    .eq('id', ingredientId);
  if (error) throw error;

  return update;
}

/** Met à jour manuellement les macros d'un ingrédient. */
export async function updateIngredientMacros(ingredientId, macros) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');
  const { error } = await supabase
    .from('ingredients')
    .update({
      calories_per_100: macros.calories_per_100 ?? null,
      protein_per_100: macros.protein_per_100 ?? null,
      carbs_per_100: macros.carbs_per_100 ?? null,
      fat_per_100: macros.fat_per_100 ?? null,
      is_verified: true,
    })
    .eq('id', ingredientId);
  if (error) throw error;
}

/** Upload une image dans le bucket recipes. Retourne l'URL publique. */
export async function uploadRecipeImage(recipeId, file) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');
  if (!file) throw new Error('Fichier requis');

  const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const path = `${recipeId}.${ext}`;

  // Supprimer l'ancien fichier s'il existe (ignore l'erreur si inexistant)
  await supabase.storage.from('recipes').remove([path]);

  const { error } = await supabase.storage
    .from('recipes')
    .upload(path, file, {
      contentType: file.type || 'image/webp',
      cacheControl: '3600',
      upsert: true,
    });
  if (error) throw new Error(`Upload image échoué : ${error.message}`);

  const { data: urlData } = supabase.storage.from('recipes').getPublicUrl(path);
  return urlData?.publicUrl ?? null;
}

/** Met à jour uniquement le champ image d'une recette. */
export async function updateRecipeImageUrl(recipeId, imageUrl) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');
  const { error } = await supabase.from('recipes').update({ image: imageUrl }).eq('id', recipeId);
  if (error) throw new Error(`Sauvegarde URL image échouée : ${error.message}`);
}

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
    ingredients: payload.ingredients ?? [],
    steps: Array.isArray(payload.steps) ? payload.steps : [],
    notes: payload.notes ?? null,
  };
}

/** Unités sans espace après le nombre (80g, 200ml). */
const NO_SPACE_UNITS = new Set(['g', 'kg', 'ml', 'cl', 'L']);

/** Construit la chaîne quantity_text à partir des champs structurés (pour le JSONB legacy). */
function buildQuantityText(quantity, unit) {
  if (quantity == null) return '';
  const qStr = quantity % 1 === 0 ? String(Math.round(quantity)) : String(quantity);
  if (!unit || unit === 'pièce') return qStr;
  return NO_SPACE_UNITS.has(unit) ? `${qStr}${unit}` : `${qStr} ${unit}`;
}

async function resolveRecipeIngredients(entries) {
  const resolved = [];
  for (let i = 0; i < (entries || []).length; i++) {
    const entry = entries[i];
    let ingredientId = entry.ingredientId ?? entry.ingredient_id;
    if (ingredientId == null && (entry.name || entry.ingredientName)) {
      const name = (entry.name ?? entry.ingredientName ?? '').trim();
      const rayon = (entry.rayon ?? 'Fruits et légumes').trim();
      const { id } = await createIngredient(name, rayon);
      ingredientId = id;
    }
    if (ingredientId != null) {
      const quantity = entry.quantity != null && entry.quantity !== '' ? Number(entry.quantity) : null;
      const unit = (entry.unit ?? '').trim() || null;
      const preparation = (entry.preparation ?? '').trim() || null;
      const quantityText = buildQuantityText(quantity, unit);
      resolved.push({
        ingredient_id: ingredientId,
        quantity,
        unit,
        preparation,
        display_order: i,
        quantity_text: quantityText,
      });
    }
  }
  return resolved;
}

async function syncRecipeIngredientsJsonb(recipeId) {
  if (!supabase) return;
  const { data: rows } = await supabase
    .from('recipe_ingredients')
    .select('quantity, unit, preparation, quantity_text, ingredients(name)')
    .eq('recipe_id', recipeId)
    .order('display_order');

  const arr = (rows || []).map((r) => {
    const name = r.ingredients?.name ?? '';
    let prefix = '';
    if (r.quantity != null) {
      prefix = buildQuantityText(r.quantity, r.unit);
    } else if (r.quantity_text) {
      prefix = r.quantity_text.trim();
    }
    const prep = r.preparation ? ` ${r.preparation}` : '';
    return prefix ? `${prefix} ${name}${prep}`.trim() : `${name}${prep}`.trim();
  }).filter(Boolean);

  await supabase.from('recipes').update({ ingredients: arr }).eq('id', recipeId);
}

export async function createRecipe(payload) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');

  const row = recipeToRow(payload);
  row.ingredients = [];

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

export async function updateRecipe(id, payload) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');

  const row = recipeToRow(payload);
  delete row.ingredients;

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

export async function deleteRecipe(id) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw error;
}

/* ── Articles ─────────────────────────────────────────── */

/** Liste des articles pour l'admin (lecture directe REST). */
export async function fetchAdminArticles() {
  if (!isSupabaseConfigured()) return [];
  const data = await restGet('blog_articles?select=id,title,category,date&order=date.desc');
  return Array.isArray(data) ? data : [];
}

function normalizeBlocks(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw || '[]'); } catch { return []; }
  }
  return [];
}

function extractFaqAndSources(blocks) {
  const faq = [];
  const sources = [];
  for (const b of blocks) {
    const type = String(b?.type || '').toLowerCase();
    if (type === 'faq' && Array.isArray(b?.items)) {
      for (const item of b.items) {
        const q = item?.question ?? item?.name;
        const a = item?.answer ?? item?.acceptedAnswer?.text ?? item?.acceptedAnswer;
        if (q && a) faq.push({ question: q, answer: a });
      }
    }
    if (type === 'sources_list' && Array.isArray(b?.items)) {
      for (const item of b.items) {
        const label = item?.label ?? item?.name;
        const url = item?.url ?? item?.href;
        if (label || url) sources.push({ label: label || url, url });
      }
    }
    if (type === 'source') {
      const label = b?.label ?? b?.name;
      const url = b?.url ?? b?.href;
      if (label || url) sources.push({ label: label || url, url });
    }
  }
  return { faq, sources };
}

/** Crée ou met à jour un article depuis un objet JSON. Retourne l'id. */
export async function createArticleFromJson(input) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');

  const contentJson = normalizeBlocks(input.content_json ?? input.contentJson);
  const { faq, sources } = extractFaqAndSources(contentJson);

  const row = {
    title: input.title,
    excerpt: input.excerpt ?? null,
    meta_title: input.meta_title ?? input.metaTitle ?? input.title,
    meta_description: input.meta_description ?? input.metaDescription ?? input.excerpt ?? '',
    category: input.category,
    date: input.date,
    read_time: Number(input.read_time ?? input.readTime ?? 5),
    image: input.image ?? null,
    author: input.author ?? null,
    content: input.content ?? '',
    content_json: contentJson,
    faq_json: Array.isArray(input.faq_json ?? input.faqJson) ? (input.faq_json ?? input.faqJson) : faq,
    sources_json: Array.isArray(input.sources_json ?? input.sourcesJson) ? (input.sources_json ?? input.sourcesJson) : sources,
    schema_type: input.schema_type ?? input.schemaType ?? 'Article',
  };

  if (input.id != null) {
    row.id = input.id;
    const { error } = await supabase.from('blog_articles').upsert(row, { onConflict: 'id' });
    if (error) throw error;
    return row.id;
  }
  const { data, error } = await supabase.from('blog_articles').insert(row).select('id').single();
  if (error) throw error;
  return data.id;
}

/** Supprime un article. */
export async function deleteArticle(id) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase non configuré');
  const { error } = await supabase.from('blog_articles').delete().eq('id', id);
  if (error) throw error;
}

/** Récupère une recette complète avec ses recipe_ingredients (pour édition). */
export async function fetchRecipeForEdit(id) {
  if (!isSupabaseConfigured()) return null;

  const [recipeArr, riArr] = await Promise.all([
    restGet(`recipes?id=eq.${id}&select=*&limit=1`),
    restGet(`recipe_ingredients?recipe_id=eq.${id}&select=ingredient_id,quantity,unit,preparation,display_order,quantity_text,ingredients(id,name,rayon,unit_default)&order=display_order.asc`),
  ]);

  const recipe = Array.isArray(recipeArr) ? recipeArr[0] : null;
  if (!recipe) return null;

  const recipeIngredients = (Array.isArray(riArr) ? riArr : []).map((r) => ({
    ingredientId: r.ingredient_id,
    ingredient_id: r.ingredient_id,
    quantity: r.quantity ?? '',
    unit: r.unit || r.ingredients?.unit_default || 'g',
    preparation: r.preparation || '',
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
