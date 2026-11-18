/**
 * Source unique des valeurs nutritionnelles : recipe_ingredients × ingredients (/100 g),
 * avec le même calcul que la fiche recette (src/lib/nutrition.js).
 * Réécrit, par portion, les colonnes calories/protein/carbs/fat et nutrition_per_serving
 * (cartes, planning, données structurées Google) pour que tout affiche le même chiffre.
 *
 *   node scripts/sync-recipe-nutrition.mjs            # écrit en base
 *   node scripts/sync-recipe-nutrition.mjs --dry-run  # affiche seulement les écarts
 *
 * À relancer après toute modification d'ingrédients ou de quantités.
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { calculateRecipeMacros, macrosPerServing } from '../src/lib/nutrition.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
for (const name of ['.env.local', '.env']) {
  const p = join(root, name);
  if (!existsSync(p)) continue;
  readFileSync(p, 'utf8').split('\n').forEach((line) => {
    const i = line.indexOf('=');
    if (i <= 0) return;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  });
}

const base = String(process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) {
  console.error('VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.');
  process.exit(1);
}
const dryRun = process.argv.includes('--dry-run');
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

async function get(path) {
  const res = await fetch(`${base}/rest/v1/${path}`, { headers });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.json();
}

const [recipes, ris] = await Promise.all([
  get('recipes?select=id,title,servings,calories,protein,carbs,fat,nutrition_per_serving&order=id.asc'),
  get('recipe_ingredients?select=recipe_id,quantity,unit,ingredients(name,calories_per_100,protein_per_100,carbs_per_100,fat_per_100)&limit=10000'),
]);

let changed = 0;
for (const r of recipes) {
  const rows = ris.filter((x) => x.recipe_id === r.id);
  if (rows.length === 0) continue; // pas d'ingrédients structurés : on ne touche à rien
  const m = macrosPerServing(calculateRecipeMacros(rows), r.servings || 1);
  if (!m.calories) continue;

  const nps = { ...(r.nutrition_per_serving || {}), calories: m.calories, proteins_g: m.protein, carbs_g: m.carbs, fat_g: m.fat };
  const same =
    r.calories === m.calories && r.protein === m.protein && r.carbs === m.carbs && r.fat === m.fat &&
    JSON.stringify(r.nutrition_per_serving || {}) === JSON.stringify(nps);
  if (same) continue;

  changed++;
  console.log(`#${r.id} ${r.title.slice(0, 50)} : ${r.calories} kcal / ${r.protein} g → ${m.calories} kcal / ${m.protein} g`);
  if (dryRun) continue;
  const res = await fetch(`${base}/rest/v1/recipes?id=eq.${r.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat, nutrition_per_serving: nps }),
  });
  if (!res.ok) console.error(`  ✗ HTTP ${res.status} ${await res.text()}`);
}
console.log(`${dryRun ? '[dry-run] ' : ''}${changed} recette(s) ${dryRun ? 'à mettre' : 'mises'} à jour sur ${recipes.length}.`);
