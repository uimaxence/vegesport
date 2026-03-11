import { supabase, isSupabaseConfigured } from './supabase';
import { recipes as localRecipes } from '../data/recipes';
import { articles as localArticles } from '../data/blog';

const FETCH_TIMEOUT_MS = 4000;

/** En développement (localhost), on utilise les données locales pour un chargement instantané. */
const useLocalDataOnly = () =>
  typeof import.meta !== 'undefined' && import.meta.env?.DEV === true;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ]);
}

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
  };
}

function mapArticleRow(row) {
  if (!row) return null;
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
    author: row.author,
    content: row.content,
    contentJson: row.content_json,
  };
}

export async function fetchRecipes() {
  if (useLocalDataOnly()) return [...localRecipes];
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('recipes').select('*').order('id', { ascending: true }),
        FETCH_TIMEOUT_MS
      );
      if (error) throw error;
      return (data || []).map(mapRecipeRow).filter(Boolean);
    } catch (e) {
      console.warn('fetchRecipes: fallback local', e?.message);
      return [...localRecipes];
    }
  }
  return [...localRecipes];
}

export async function fetchArticles() {
  if (useLocalDataOnly()) return [...localArticles];
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('blog_articles').select('*').order('date', { ascending: false }),
        FETCH_TIMEOUT_MS
      );
      if (error) throw error;
      return (data || []).map(mapArticleRow).filter(Boolean);
    } catch (e) {
      console.warn('fetchArticles: fallback local', e?.message);
      return [...localArticles];
    }
  }
  return [...localArticles];
}
