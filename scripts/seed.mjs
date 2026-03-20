/**
 * Seed Supabase avec les recettes du projet.
 * Utilise la clé service_role (contourne RLS) si définie, sinon la clé anon (peut échouer sur les tables avec RLS).
 * Prérequis : supabase/schema.sql exécuté, .env avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.
 * Pour le seed : ajoute SUPABASE_SERVICE_ROLE_KEY dans .env (Dashboard Supabase > Settings > API > service_role).
 * Exécution : npm run seed
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { recipes } from '../src/data/recipes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnv(envPath) {
  if (!existsSync(envPath)) return false;
  const content = readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const i = trimmed.indexOf('=');
    if (i <= 0) return;
    const key = trimmed.slice(0, i).trim();
    const val = trimmed.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  });
  return true;
}

// Charger .env ou .env.example depuis la racine du projet ou le cwd
const loaded =
  loadEnv(join(root, '.env')) ||
  loadEnv(join(root, '.env.example')) ||
  loadEnv(join(process.cwd(), '.env')) ||
  loadEnv(join(process.cwd(), '.env.example'));
if (!loaded) {
  console.warn('Aucun fichier .env ou .env.example trouvé.');
}

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  console.error('VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définis.');
  process.exit(1);
}

// La clé service_role contourne RLS : obligatoire pour insérer dans recipes depuis le seed
if (!serviceRoleKey) {
  console.error('Pour le seed, ajoute SUPABASE_SERVICE_ROLE_KEY dans ton .env');
  console.error('(Dashboard Supabase > Settings > API > service_role - à ne jamais exposer côté front).');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

function toRecipeRow(r) {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    time: r.time,
    calories: r.calories,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat,
    servings: r.servings,
    difficulty: r.difficulty,
    tags: r.tags,
    objective: r.objective,
    regime: r.regime,
    season: r.season,
    main_ingredient: r.mainIngredient,
    image: r.image,
    ingredients: r.ingredients,
    steps: r.steps,
  };
}

async function main() {
  console.log('Insertion des recettes…');
  for (const r of recipes) {
    const row = toRecipeRow(r);
    const { error } = await supabase.from('recipes').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('Erreur recette', r.id, error.message);
    }
  }
  console.log(recipes.length, 'recettes traitées.');

  console.log('Seed recettes terminé.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
