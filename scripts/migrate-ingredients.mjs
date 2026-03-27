/**
 * Migration one-shot : parse les ingrédients JSONB de chaque recette,
 * crée les entrées manquantes dans `ingredients`, et remplit `recipe_ingredients`.
 *
 * Usage : node scripts/migrate-ingredients.mjs
 *
 * Idempotent (ON CONFLICT DO NOTHING) — peut être relancé sans risque.
 * Nécessite SUPABASE_SERVICE_ROLE_KEY dans .env (ou .env.local).
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

/* ── Env ─────────────────────────────────────────────── */
function loadEnv() {
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
}
loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  console.error('VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

/* ── Parsing ingrédients ─────────────────────────────── */

const QTY_RE = /^(\d+(?:[.,/]\d+)?)\s*(g|kg|ml|L|cl|c\.à\.s|c\.à\.c|sachets?|pincées?|tranches?|feuilles?|cm|gousses?|poignées?|bouteilles?)?\s*/i;

function parseIngredientString(raw) {
  let str = raw.trim();

  // Préfixes à retirer
  str = str.replace(/^(Option|Garniture)\s*:\s*/i, '');

  // Suffixes à retirer
  str = str.replace(/\s+pour\s+(servir|la\s+(?:cuisson|texture))$/i, '');

  // "Jus d'1 citron vert" → qty "1", name "jus de citron vert"
  const juiceMatch = str.match(/^Jus\s+d[e']\s*(\d+)\s+(.+)$/i);
  if (juiceMatch) {
    return [{ qty: juiceMatch[1], name: `Jus de ${juiceMatch[2].trim()}` }];
  }

  // "Quelques feuilles de laitue" → qty "Quelques", name "feuilles de laitue"
  const quelquesMatch = str.match(/^Quelques\s+(.+)$/i);
  if (quelquesMatch) {
    return [{ qty: 'Quelques', name: quelquesMatch[1].trim() }];
  }

  // Quantité standard
  const m = str.match(QTY_RE);
  if (m && m[0].trim()) {
    const qty = m[0].trim();
    const name = str.slice(m[0].length).trim();
    if (name) {
      // Si le nom contient des virgules → splitter (ex: "cumin, paprika, piment (option)")
      if (name.includes(',')) {
        const parts = name.split(/\s*,\s*/).map((p) => p.trim()).filter(Boolean);
        // Première partie garde la quantité, les autres sont sans
        return parts.map((p, i) => ({ qty: i === 0 ? qty : '', name: cleanName(p) }));
      }
      return [{ qty, name: cleanName(name) }];
    }
  }

  // Pas de quantité — potentiellement une liste "Sel, poivre, coriandre"
  if (str.includes(',') || /\bet\b/.test(str)) {
    const parts = str.split(/\s*[,&]\s*|\s+et\s+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      return parts.map((p) => ({ qty: '', name: cleanName(p) }));
    }
  }

  return [{ qty: '', name: cleanName(str) }];
}

function cleanName(name) {
  return name
    .replace(/\s*\(optionnel\)\s*/gi, '')
    .replace(/\s*\(option\)\s*/gi, '')
    .trim();
}

/* ── Normalisation pour matching ─────────────────────── */

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/['']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tente de trouver un ingrédient existant dans le lookup.
 * Essaie : exact → sans modifiers → singulier → contenu.
 */
function findMatch(name, lookup) {
  const n = normalize(name);

  // Exact
  if (lookup.has(n)) return lookup.get(n);

  // Sans modifiers courants
  const stripped = n
    .replace(/\s+(finement hache|emince|rape|decortiques?|concassees?|moulues?|surgelee?s?|congelee?s?|frais|fraiche|mure?s?|en poudre|moyen(?:ne)?s?|rouge|vert|verte|noir|blanc|complet|complete|nature|ferme|fume|seches?|cuits?|cuites?|cru|crue|melange|melanges)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped && lookup.has(stripped)) return lookup.get(stripped);

  // Singulier (-s final)
  const sing = stripped.replace(/s$/, '');
  if (sing && lookup.has(sing)) return lookup.get(sing);

  // L'un contient l'autre
  for (const [key, val] of lookup) {
    if (key.length > 3 && (n.includes(key) || key.includes(n))) return val;
    if (sing.length > 3 && (sing.includes(key) || key.includes(sing))) return val;
  }

  return null;
}

/* ── Classification rayon ────────────────────────────── */

function guessRayon(name) {
  const lower = name.toLowerCase();
  if (/tofu|tempeh|seitan|edamame|yaourt végétal/.test(lower)) return 'Frais et protéines végétales';
  if (/lentille|pois chiche|haricot|quinoa|riz|pâte|flocon|farine|maïs|tortilla|wrap|gnocchi|sarrasin/.test(lower)) return 'Pâtes riz et céréales';
  if (/lait|boisson végétale|bouillon|jus/.test(lower)) return 'Boissons';
  if (/huile|beurre d|purée d|graine|noix|amande|cacahuète|pignon|sésame|tahini|lin|chanvre|tournesol|coco râpée/.test(lower)) return 'Graines et oléagineux';
  if (/sel|poivre|sauce|pesto|cumin|curry|paprika|curcuma|cannelle|origan|persil|coriandre|muscade|herbe|gingembre|piment|chili|garam|thym|ciboulette|vinaigre|moutarde|miel|sirop|confiture/.test(lower)) return 'Condiments et épices';
  if (/surgelé|congelé|açaï/.test(lower)) return 'Surgelés';
  if (/protéine|cacao|chocolat|granola|raisin|datte|levure|spiruline|coulis/.test(lower)) return 'Épicerie';
  return 'Fruits et légumes';
}

/* ── Main ────────────────────────────────────────────── */

// 1. Fetch recipes
const { data: recipes, error: errRecipes } = await supabase
  .from('recipes')
  .select('id, title, ingredients')
  .order('id');
if (errRecipes) { console.error('Erreur fetch recettes:', errRecipes.message); process.exit(1); }
console.log(`${recipes.length} recettes chargées.`);

// 2. Fetch existing ingredients
const { data: existingIngredients, error: errIng } = await supabase
  .from('ingredients')
  .select('id, name, rayon');
if (errIng) { console.error('Erreur fetch ingrédients:', errIng.message); process.exit(1); }

// Build lookup : normalized_name → { id, name, rayon }
const lookup = new Map();
for (const ing of existingIngredients) {
  lookup.set(normalize(ing.name), ing);
}
console.log(`${existingIngredients.length} ingrédients existants en base.`);

// 3. Parse all recipes, collect all unique ingredient names
const allParsed = []; // { recipeId, qty, name, normalizedName }
const uniqueNames = new Map(); // normalizedName → displayName

for (const recipe of recipes) {
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  for (const raw of ingredients) {
    const entries = parseIngredientString(raw);
    for (const { qty, name } of entries) {
      if (!name || name.length < 2) continue;
      // Skip obvious non-ingredients
      if (/^eau\s/i.test(name) || /glaçon/i.test(name)) continue;
      const n = normalize(name);
      if (!uniqueNames.has(n)) {
        uniqueNames.set(n, name.charAt(0).toUpperCase() + name.slice(1));
      }
      allParsed.push({ recipeId: recipe.id, qty, name, normalizedName: n });
    }
  }
}
console.log(`${uniqueNames.size} ingrédients uniques parsés depuis les recettes.`);

// 4. Determine which ingredients are new
const toCreate = []; // { name, rayon }
const matchResults = new Map(); // normalizedName → ingredientId

for (const [normalizedName, displayName] of uniqueNames) {
  const match = findMatch(displayName, lookup);
  if (match) {
    matchResults.set(normalizedName, match.id);
  } else {
    const rayon = guessRayon(displayName);
    toCreate.push({ name: displayName, rayon });
    // Placeholder — will be filled after insert
    matchResults.set(normalizedName, null);
  }
}

console.log(`${uniqueNames.size - toCreate.length} ingrédients matchés, ${toCreate.length} à créer.`);

// 5. Create new ingredients
if (toCreate.length > 0) {
  console.log('\nNouveaux ingrédients à créer :');
  for (const { name, rayon } of toCreate) {
    console.log(`  + ${name} → ${rayon}`);
  }

  // Batch insert (ON CONFLICT DO NOTHING via upsert)
  for (const item of toCreate) {
    const { data, error } = await supabase
      .from('ingredients')
      .upsert({ name: item.name, rayon: item.rayon }, { onConflict: 'name' })
      .select('id, name')
      .single();
    if (error) {
      console.warn(`  ⚠ Erreur création "${item.name}":`, error.message);
      continue;
    }
    const n = normalize(item.name);
    matchResults.set(n, data.id);
    lookup.set(n, { id: data.id, name: data.name, rayon: item.rayon });
  }

  console.log(`${toCreate.length} ingrédients créés.\n`);
}

// 6. Build recipe_ingredients entries
const riEntries = [];
const seen = new Set(); // "recipeId-ingredientId" to avoid duplicates

for (const { recipeId, qty, normalizedName } of allParsed) {
  const ingredientId = matchResults.get(normalizedName);
  if (!ingredientId) continue;
  const key = `${recipeId}-${ingredientId}`;
  if (seen.has(key)) continue;
  seen.add(key);
  riEntries.push({ recipe_id: recipeId, ingredient_id: ingredientId, quantity_text: qty });
}

console.log(`${riEntries.length} liens recipe_ingredients à insérer.`);

// 7. Insert recipe_ingredients (batch, skip conflicts)
const BATCH_SIZE = 100;
let inserted = 0;
let skipped = 0;

for (let i = 0; i < riEntries.length; i += BATCH_SIZE) {
  const batch = riEntries.slice(i, i + BATCH_SIZE);
  const { error, count } = await supabase
    .from('recipe_ingredients')
    .upsert(batch, { onConflict: 'recipe_id,ingredient_id', ignoreDuplicates: true });
  if (error) {
    console.warn(`  ⚠ Batch ${i / BATCH_SIZE + 1} erreur:`, error.message);
    skipped += batch.length;
  } else {
    inserted += batch.length;
  }
}

console.log(`\n✓ Migration terminée :`);
console.log(`  ${recipes.length} recettes traitées`);
console.log(`  ${lookup.size} ingrédients en base (${toCreate.length} nouveaux)`);
console.log(`  ${inserted} recipe_ingredients insérés (${skipped} erreurs)`);
