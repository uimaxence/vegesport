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
  const data = await restGet('ingredients?select=id,name,rayon,created_at&order=name.asc');
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
    restGet(`recipe_ingredients?recipe_id=eq.${id}&select=ingredient_id,quantity_text,ingredients(id,name,rayon)`),
  ]);

  const recipe = Array.isArray(recipeArr) ? recipeArr[0] : null;
  if (!recipe) return null;

  const recipeIngredients = (Array.isArray(riArr) ? riArr : []).map((r) => ({
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
