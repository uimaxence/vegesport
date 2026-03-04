import { supabase, isSupabaseConfigured } from './supabase';
import { recipes as localRecipes } from '../data/recipes';
import { articles as localArticles } from '../data/blog';

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
    category: row.category,
    date: row.date,
    readTime: row.read_time,
    image: row.image,
    author: row.author,
    content: row.content,
  };
}

export async function fetchRecipes() {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapRecipeRow);
  }
  return [...localRecipes];
}

export async function fetchArticles() {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapArticleRow);
  }
  return [...localArticles];
}
