import { isSupabaseConfigured } from './supabase';

const FETCH_TIMEOUT_MS = 10000;

/**
 * Mode données locales (opt-in).
 * Par défaut, même en dev, on préfère Supabase si configuré (sinon les URLs locales peuvent diverger, ex. .png vs .webp).
 */
const useLocalDataOnly = () =>
  String(import.meta.env?.VITE_USE_LOCAL_DATA || '').toLowerCase() === 'true';

// ─── Données locales en import dynamique ─────────────────────────────────────
// Pas d'import statique : ces modules (~110KB) n'entrent plus dans le bundle prod.
// Ils sont chargés à la demande (dev ou fallback en cas de panne Supabase).
let _localRecipes = null;

function normalizeContentBlocks(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function extractFaqAndSourcesFromBlocks(blocks) {
  const faq = [];
  const sources = [];

  for (const block of Array.isArray(blocks) ? blocks : []) {
    const type = String(block?.type || '').toLowerCase();
    if (type === 'faq' && Array.isArray(block?.items)) {
      for (const item of block.items) {
        const question = item?.question ?? item?.name;
        const answer = item?.answer ?? item?.acceptedAnswer?.text ?? item?.acceptedAnswer;
        if (question && answer) faq.push({ question, answer });
      }
    }
    if (type === 'sources_list' && Array.isArray(block?.items)) {
      for (const item of block.items) {
        const label = item?.label ?? item?.name;
        const url = item?.url ?? item?.href;
        if (label || url) sources.push({ label: label || url, url });
      }
    }
    if (type === 'source') {
      const label = block?.label ?? block?.name;
      const url = block?.url ?? block?.href;
      if (label || url) sources.push({ label: label || url, url });
    }
  }

  return { faq, sources };
}

async function getLocalRecipes() {
  if (_localRecipes) return _localRecipes;
  const mod = await import('../data/recipes');
  _localRecipes = mod.recipes || [];
  return _localRecipes;
}

// ─── Appel REST direct (contourne supabase-js + son init auth) ───────────────
function getRestBase() {
  return String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
}

function getAnonKey() {
  return String(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
}

async function restGet(path, timeoutMs = FETCH_TIMEOUT_MS) {
  const base = getRestBase();
  const key = getAnonKey();
  if (!base || !key) return null;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
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
      throw new Error(`HTTP ${res.status}: ${body || res.statusText}`);
    }
    return await res.json();
  } catch (e) {
    if (e?.name === 'AbortError') throw new Error('timeout');
    throw e;
  } finally {
    clearTimeout(t);
  }
}

// ─── Mappers ─────────────────────────────────────────────────────────────────
function mapRecipeRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    time: row.time,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    servings: row.servings,
    difficulty: row.difficulty,
    tags: row.tags || [],
    objective: row.objective || [],
    regime: row.regime || [],
    season: row.season || [],
    mainIngredient: row.main_ingredient,
    image: row.image,
    ingredients: row.ingredients || [],
    steps: row.steps || [],
    notes: row.notes ?? null,
  };
}

function mapRecipeSummaryRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    time: row.time,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    servings: row.servings,
    difficulty: row.difficulty,
    tags: row.tags || [],
    objective: row.objective || [],
    regime: row.regime || [],
    season: row.season || [],
    mainIngredient: row.main_ingredient,
    image: row.image,
    ingredients: row.ingredients || [],
    steps: null,
  };
}

function mapArticleRow(row) {
  if (!row) return null;
  const authorRow = row.authors || row.author;
  const contentJson = normalizeContentBlocks(row.content_json);
  const extracted = extractFaqAndSourcesFromBlocks(contentJson);
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    category: row.category,
    date: row.date,
    readTime: row.read_time,
    image: row.image,
    author: row.author || authorRow?.display_name || authorRow?.name,
    authorInfo: authorRow ? {
      displayName: authorRow.display_name || authorRow.name,
      titre: authorRow.titre,
      bio: authorRow.bio,
      linksPro: authorRow.links_pro || [],
    } : null,
    content: row.content,
    contentJson,
    faqJson: Array.isArray(row.faq_json) && row.faq_json.length ? row.faq_json : extracted.faq,
    schemaType: row.schema_type || 'Article',
    sourcesJson: Array.isArray(row.sources_json) && row.sources_json.length ? row.sources_json : extracted.sources,
    updatedAt: row.updated_at,
  };
}

// ─── Exports ─────────────────────────────────────────────────────────────────
export async function fetchRecipes() {
  if (useLocalDataOnly()) return [...(await getLocalRecipes())];
  if (isSupabaseConfigured()) {
    try {
      const cols = 'id,title,category,time,calories,protein,carbs,fat,servings,difficulty,tags,objective,regime,season,main_ingredient,image,ingredients';
      const data = await restGet(`recipes?select=${cols}&order=id.asc`);
      if (Array.isArray(data)) return data.map(mapRecipeSummaryRow).filter(Boolean);
    } catch (e) {
      console.warn('fetchRecipes: fallback local', e?.message);
    }
  }
  return [...(await getLocalRecipes())];
}

export async function fetchRecipeById(id) {
  if (useLocalDataOnly()) {
    const list = await getLocalRecipes();
    const found = list.find((r) => String(r.id) === String(id));
    return found ? { ...found } : null;
  }
  if (isSupabaseConfigured()) {
    try {
      const data = await restGet(`recipes?id=eq.${id}&select=*&limit=1`);
      if (Array.isArray(data) && data[0]) return mapRecipeRow(data[0]);
    } catch (e) {
      console.warn('fetchRecipeById: fallback local', e?.message);
    }
  }
  const list = await getLocalRecipes();
  const found = list.find((r) => String(r.id) === String(id));
  return found ? { ...found } : null;
}

/**
 * Retourne la map nom→rayon depuis la table ingredients.
 * Utilisé par la liste de courses pour catégoriser sans regex.
 */
export async function fetchIngredientRayons() {
  if (!isSupabaseConfigured()) return [];
  try {
    const data = await restGet('ingredients?select=name,rayon&order=name.asc');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchArticles() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase non configuré: les articles doivent être lus depuis la BDD.');
  }
  try {
    const data = await restGet(
      'blog_articles?select=*,authors(display_name,name,titre,bio,links_pro)&order=date.desc'
    );
    if (Array.isArray(data)) return data.map(mapArticleRow).filter(Boolean);
    return [];
  } catch (e) {
    throw new Error(`Impossible de charger les articles depuis la BDD: ${e?.message || 'erreur inconnue'}`);
  }
}
