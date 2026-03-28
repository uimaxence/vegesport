/**
 * Import d'une recette depuis un fichier JSON avec résolution automatique
 * des ingrédients et enrichissement nutritionnel.
 *
 * Usage :
 *   node scripts/import-recipe.mjs recette.json [--ciqual ciqual.csv]
 *
 * Le script :
 *   1. Lit le JSON de la recette
 *   2. Pour chaque ingrédient :
 *      - Cherche s'il existe déjà en BDD (case-insensitive)
 *      - Le crée si absent (avec son rayon)
 *      - Vérifie s'il a des macros nutritionnelles
 *      - Sinon → tente CIQUAL (si CSV fourni), puis Open Food Facts
 *      - Alerte si aucune source n'a fonctionné (à enrichir manuellement)
 *   3. Crée la recette en BDD avec les liens recipe_ingredients
 *   4. Calcule les macros par portion depuis les ingrédients
 *   5. Synchronise le champ JSONB legacy
 *   6. Affiche un rapport complet
 *
 * Nécessite SUPABASE_SERVICE_ROLE_KEY dans .env (ou .env.local).
 *
 * Format JSON attendu :
 * {
 *   "title": "Nom de la recette",
 *   "category": "petit-dejeuner | dejeuner | diner | snack | dessert",
 *   "time": 15,
 *   "servings": 2,
 *   "difficulty": "Facile | Moyen | Difficile",
 *   "tags": ["#RicheEnProtéines"],
 *   "objective": ["masse", "endurance", "sante", "seche"],
 *   "regime": ["vegetarien", "vegetalien", "sans-gluten"],
 *   "season": ["printemps", "ete", "automne", "hiver"],
 *   "mainIngredient": "Ingrédient principal",
 *   "steps": ["Étape 1…", "Étape 2…"],
 *   "recipeIngredients": [
 *     { "name": "Flocons d'avoine", "quantity": 80, "unit": "g", "rayon": "Épicerie" },
 *     { "name": "Lait de soja", "quantity": 200, "unit": "ml", "preparation": "tiède" }
 *   ]
 * }
 *
 * Rayons valides : Fruits et légumes, Épicerie, Pâtes riz et céréales,
 *   Boissons, Frais et protéines végétales, Surgelés, Condiments et épices,
 *   Graines et oléagineux
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

/* ── Env ──────────────────────────────────────────────── */

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
  console.error('❌ VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

/* ── Arguments CLI ────────────────────────────────────── */

const args = process.argv.slice(2);
let jsonPath = null;
let ciqualPath = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ciqual' && args[i + 1]) {
    ciqualPath = args[++i];
  } else if (!jsonPath) {
    jsonPath = args[i];
  }
}

if (!jsonPath || !existsSync(jsonPath)) {
  console.error('Usage : node scripts/import-recipe.mjs recette.json [--ciqual ciqual.csv]');
  process.exit(1);
}

/* ── Validation ───────────────────────────────────────── */

const VALID_CATEGORIES = new Set(['petit-dejeuner', 'dejeuner', 'diner', 'snack', 'dessert']);

function validateRecipe(data) {
  const errors = [];
  if (!data || typeof data !== 'object') return ['Le JSON doit être un objet'];
  if (!data.title) errors.push('Champ requis manquant : title');
  if (!data.category) errors.push('Champ requis manquant : category');
  if (data.category && !VALID_CATEGORIES.has(data.category)) {
    errors.push(`category invalide : "${data.category}" (valides : ${[...VALID_CATEGORIES].join(', ')})`);
  }
  for (const f of ['time', 'servings']) {
    if (data[f] != null && (typeof data[f] !== 'number' || isNaN(data[f]))) {
      errors.push(`${f} doit être un nombre`);
    }
  }
  if (!Array.isArray(data.steps) || data.steps.length === 0) {
    errors.push('steps doit être un tableau non vide');
  }
  if (!Array.isArray(data.recipeIngredients) || data.recipeIngredients.length === 0) {
    errors.push('recipeIngredients doit être un tableau non vide');
  }
  if (Array.isArray(data.recipeIngredients)) {
    data.recipeIngredients.forEach((ri, i) => {
      if (!ri.name?.trim()) errors.push(`recipeIngredients[${i}] : name requis`);
    });
  }
  return errors;
}

/* ── CIQUAL matching (optionnel) ──────────────────────── */

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNumber(val) {
  if (!val || val === '-' || val === '' || /traces/i.test(val)) return null;
  const cleaned = val.replace(',', '.').replace(/^</, '').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function detectDelimiter(firstLine) {
  const tabs = (firstLine.match(/\t/g) || []).length;
  const semis = (firstLine.match(/;/g) || []).length;
  return tabs > semis ? '\t' : ';';
}

function loadCiqual(filePath) {
  if (!filePath || !existsSync(filePath)) return null;
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return null;

  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0].split(delimiter).map((h) => h.replace(/^"|"$/g, '').trim());

  const findCol = (...keywords) =>
    headers.findIndex((h) => {
      const hl = h.toLowerCase();
      return keywords.every((kw) => hl.includes(kw.toLowerCase()));
    });

  const iName = findCol('alim_nom') !== -1 ? findCol('alim_nom') : findCol('nom');
  const iCode = findCol('alim_code') !== -1 ? findCol('alim_code') : findCol('code');
  const iKcal = findCol('kcal');
  const iProt = findCol('protéine') !== -1 ? findCol('protéine') : findCol('proteine');
  const iGluc = findCol('glucide');
  const iLip = findCol('lipide');

  if (iName === -1 || iKcal === -1) return null;

  const entries = [];
  for (let r = 1; r < lines.length; r++) {
    const cols = lines[r].split(delimiter).map((c) => c.replace(/^"|"$/g, '').trim());
    const name = cols[iName];
    const kcal = parseNumber(cols[iKcal]);
    if (!name || kcal == null) continue;
    entries.push({
      name,
      nameNorm: normalize(name),
      code: iCode >= 0 ? cols[iCode] || null : null,
      kcal,
      protein: iProt >= 0 ? parseNumber(cols[iProt]) : null,
      carbs: iGluc >= 0 ? parseNumber(cols[iGluc]) : null,
      fat: iLip >= 0 ? parseNumber(cols[iLip]) : null,
    });
  }

  console.log(`📊 CIQUAL : ${entries.length} aliments chargés.\n`);
  return entries;
}

function wordOverlap(a, b) {
  const wordsA = new Set(a.split(' ').filter((w) => w.length > 2));
  const wordsB = new Set(b.split(' ').filter((w) => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let matched = 0;
  for (const w of wordsA) if (wordsB.has(w)) matched++;
  return matched / Math.max(wordsA.size, wordsB.size);
}

function findCiqualMatch(ingredientName, ciqual) {
  if (!ciqual) return null;
  const norm = normalize(ingredientName);
  let best = null;
  let bestScore = 0;

  for (const entry of ciqual) {
    if (entry.nameNorm === norm) return { entry, score: 1.0 };
    let score = 0;
    if (entry.nameNorm.includes(norm)) {
      score = 0.7 + 0.3 * (norm.length / entry.nameNorm.length);
    } else if (norm.includes(entry.nameNorm)) {
      score = 0.5 + 0.3 * (entry.nameNorm.length / norm.length);
    } else {
      score = wordOverlap(norm, entry.nameNorm);
    }
    if (score > bestScore) { bestScore = score; best = entry; }
  }

  if (bestScore < 0.5) return null;
  return { entry: best, score: bestScore };
}

/* ── Open Food Facts enrichment ───────────────────────── */

async function enrichFromOFF(ingredientName) {
  const params = new URLSearchParams({
    search_terms: ingredientName,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '5',
    fields: 'product_name,code,nutriments',
  });

  const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params}`);
  if (!res.ok) return null;
  const data = await res.json();

  const product = (data.products || []).find(
    (p) => p.nutriments && (p.nutriments['energy-kcal_100g'] != null || p.nutriments['energy-kcal'] != null)
  );
  if (!product) return null;

  const n = product.nutriments;
  return {
    calories_per_100: Math.round(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0),
    protein_per_100: Math.round((n['proteins_100g'] ?? 0) * 10) / 10,
    carbs_per_100: Math.round((n['carbohydrates_100g'] ?? 0) * 10) / 10,
    fat_per_100: Math.round((n['fat_100g'] ?? 0) * 10) / 10,
    off_id: product.code || null,
    off_name: product.product_name || null,
  };
}

/* ── Helpers ──────────────────────────────────────────── */

const NO_SPACE_UNITS = new Set(['g', 'kg', 'ml', 'cl', 'L']);

function buildQuantityText(quantity, unit) {
  if (quantity == null) return '';
  const qStr = quantity % 1 === 0 ? String(Math.round(quantity)) : String(quantity);
  if (!unit || unit === 'pièce') return qStr;
  return NO_SPACE_UNITS.has(unit) ? `${qStr}${unit}` : `${qStr} ${unit}`;
}

function quantityInGrams(quantity, unit) {
  if (quantity == null) return null;
  switch (unit) {
    case 'g': return quantity;
    case 'kg': return quantity * 1000;
    case 'ml': return quantity;
    case 'cl': return quantity * 10;
    case 'L': return quantity * 1000;
    case 'c.à.s': return quantity * 15;
    case 'c.à.c': return quantity * 5;
    case 'pincée': return quantity * 0.5;
    default: return null;
  }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ── Main ─────────────────────────────────────────────── */

async function main() {
  // 1. Lire et valider le JSON
  console.log('━━━ IMPORT RECETTE ━━━\n');

  let recipe;
  try {
    recipe = JSON.parse(readFileSync(resolve(jsonPath), 'utf8'));
  } catch (e) {
    console.error(`❌ JSON invalide : ${e.message}`);
    process.exit(1);
  }

  const errors = validateRecipe(recipe);
  if (errors.length > 0) {
    console.error('❌ Validation échouée :');
    errors.forEach((e) => console.error(`   • ${e}`));
    process.exit(1);
  }

  console.log(`📝 Recette : ${recipe.title}`);
  console.log(`   Catégorie : ${recipe.category}`);
  console.log(`   Portions  : ${recipe.servings || 1}`);
  console.log(`   Ingrédients : ${recipe.recipeIngredients.length}`);
  console.log(`   Étapes : ${recipe.steps.length}\n`);

  // 2. Charger CIQUAL si fourni
  const ciqual = ciqualPath ? loadCiqual(ciqualPath) : null;

  // 3. Résoudre et enrichir les ingrédients
  console.log('━━━ RÉSOLUTION DES INGRÉDIENTS ━━━\n');

  const resolvedIngredients = [];
  const report = { existing: [], created: [], enrichedCiqual: [], enrichedOFF: [], needManual: [] };

  for (let i = 0; i < recipe.recipeIngredients.length; i++) {
    const entry = recipe.recipeIngredients[i];
    const name = (entry.name || '').trim();
    const rayon = (entry.rayon || 'Fruits et légumes').trim();
    const quantity = entry.quantity != null && entry.quantity !== '' ? Number(entry.quantity) : null;
    const unit = (entry.unit || '').trim() || null;
    const preparation = (entry.preparation || '').trim() || null;

    // Chercher l'ingrédient existant
    const { data: existing } = await supabase
      .from('ingredients')
      .select('id, name, calories_per_100, protein_per_100, carbs_per_100, fat_per_100, is_verified')
      .ilike('name', name)
      .limit(1)
      .single();

    let ingredientId;
    let hasMacros;

    if (existing) {
      ingredientId = existing.id;
      hasMacros = existing.calories_per_100 != null && existing.calories_per_100 > 0;
      report.existing.push({ name: existing.name, id: ingredientId, hasMacros });
      console.log(`  ✓ ${name} → trouvé en BDD (id=${ingredientId}${hasMacros ? ', macros OK' : ', SANS macros'})`);
    } else {
      // Créer l'ingrédient
      const { data: inserted, error: errIns } = await supabase
        .from('ingredients')
        .insert({ name, rayon })
        .select('id')
        .single();
      if (errIns) {
        console.error(`  ❌ Création échouée pour "${name}" : ${errIns.message}`);
        continue;
      }
      ingredientId = inserted.id;
      hasMacros = false;
      report.created.push({ name, id: ingredientId, rayon });
      console.log(`  + ${name} → créé (id=${ingredientId}, rayon="${rayon}")`);
    }

    // Enrichir si pas de macros
    if (!hasMacros) {
      let enriched = false;

      // Tentative CIQUAL
      if (ciqual) {
        const match = findCiqualMatch(name, ciqual);
        if (match && match.score >= 0.5) {
          const { error: updErr } = await supabase
            .from('ingredients')
            .update({
              calories_per_100: match.entry.kcal,
              protein_per_100: match.entry.protein,
              carbs_per_100: match.entry.carbs,
              fat_per_100: match.entry.fat,
              ciqual_id: match.entry.code,
              is_verified: true,
            })
            .eq('id', ingredientId);

          if (!updErr) {
            enriched = true;
            report.enrichedCiqual.push({
              name, ciqualName: match.entry.name, score: match.score,
              kcal: match.entry.kcal, protein: match.entry.protein,
              carbs: match.entry.carbs, fat: match.entry.fat,
            });
            console.log(`    📊 CIQUAL → "${match.entry.name}" (${(match.score * 100).toFixed(0)}%) : ${match.entry.kcal} kcal, P=${match.entry.protein}g, G=${match.entry.carbs}g, L=${match.entry.fat}g`);
          }
        }
      }

      // Tentative Open Food Facts
      if (!enriched) {
        try {
          await delay(500); // rate limiting
          const off = await enrichFromOFF(name);
          if (off && off.calories_per_100 > 0) {
            const { error: updErr } = await supabase
              .from('ingredients')
              .update({
                calories_per_100: off.calories_per_100,
                protein_per_100: off.protein_per_100,
                carbs_per_100: off.carbs_per_100,
                fat_per_100: off.fat_per_100,
                off_id: off.off_id,
                is_verified: false, // OFF = non vérifié, à confirmer
              })
              .eq('id', ingredientId);

            if (!updErr) {
              enriched = true;
              report.enrichedOFF.push({
                name, offName: off.off_name,
                kcal: off.calories_per_100, protein: off.protein_per_100,
                carbs: off.carbs_per_100, fat: off.fat_per_100,
              });
              console.log(`    🌐 OFF → "${off.off_name}" : ${off.calories_per_100} kcal, P=${off.protein_per_100}g, G=${off.carbs_per_100}g, L=${off.fat_per_100}g`);
              console.log(`    ⚠️  Vérifie ce match — OFF n'est pas toujours fiable pour les noms génériques`);
            }
          }
        } catch {
          // OFF API indispo, on continue
        }
      }

      if (!enriched) {
        report.needManual.push({ name, id: ingredientId });
        console.log(`    ⚠️  AUCUNE source → à enrichir manuellement (Admin > Ingrédients > id=${ingredientId})`);
      }
    }

    resolvedIngredients.push({
      ingredient_id: ingredientId,
      quantity,
      unit,
      preparation,
      display_order: i,
      quantity_text: buildQuantityText(quantity, unit),
    });
  }

  // 4. Créer la recette
  console.log('\n━━━ CRÉATION DE LA RECETTE ━━━\n');

  const row = {
    title: recipe.title,
    category: recipe.category,
    time: Number(recipe.time) || 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    servings: Number(recipe.servings) || 1,
    difficulty: recipe.difficulty || 'Facile',
    tags: Array.isArray(recipe.tags) ? recipe.tags : [],
    objective: Array.isArray(recipe.objective) ? recipe.objective : [],
    regime: Array.isArray(recipe.regime) ? recipe.regime : [],
    season: Array.isArray(recipe.season) ? recipe.season : [],
    main_ingredient: recipe.mainIngredient ?? recipe.main_ingredient ?? null,
    image: recipe.image ?? null,
    ingredients: [],
    steps: Array.isArray(recipe.steps) ? recipe.steps : [],
    notes: recipe.notes ?? null,
  };

  const { data: inserted, error: errRecipe } = await supabase
    .from('recipes')
    .insert(row)
    .select('id')
    .single();

  if (errRecipe) {
    console.error(`❌ Création recette échouée : ${errRecipe.message}`);
    process.exit(1);
  }

  const recipeId = inserted.id;
  console.log(`✅ Recette créée (id=${recipeId})`);

  // 5. Insérer les recipe_ingredients
  if (resolvedIngredients.length > 0) {
    const { error: errRi } = await supabase
      .from('recipe_ingredients')
      .insert(resolvedIngredients.map((r) => ({ recipe_id: recipeId, ...r })));

    if (errRi) {
      console.error(`❌ Insertion recipe_ingredients échouée : ${errRi.message}`);
    } else {
      console.log(`✅ ${resolvedIngredients.length} ingrédients liés`);
    }
  }

  // 6. Calculer les macros depuis les ingrédients
  const { data: riWithMacros } = await supabase
    .from('recipe_ingredients')
    .select('quantity, unit, ingredients(calories_per_100, protein_per_100, carbs_per_100, fat_per_100)')
    .eq('recipe_id', recipeId);

  let totalCal = 0, totalProt = 0, totalCarbs = 0, totalFat = 0;
  let withMacros = 0, total = 0;

  for (const ri of riWithMacros || []) {
    total++;
    const ing = ri.ingredients;
    if (!ing || ing.calories_per_100 == null) continue;
    const grams = quantityInGrams(ri.quantity, ri.unit);
    if (grams == null) continue;
    withMacros++;
    const factor = grams / 100;
    totalCal += (ing.calories_per_100 || 0) * factor;
    totalProt += (ing.protein_per_100 || 0) * factor;
    totalCarbs += (ing.carbs_per_100 || 0) * factor;
    totalFat += (ing.fat_per_100 || 0) * factor;
  }

  const servings = Number(recipe.servings) || 1;
  const macros = {
    calories: Math.round(totalCal / servings),
    protein: Math.round(totalProt / servings),
    carbs: Math.round(totalCarbs / servings),
    fat: Math.round(totalFat / servings),
  };

  // Mettre à jour les macros de la recette (valeurs cached pour les listes)
  await supabase.from('recipes').update(macros).eq('id', recipeId);

  console.log(`\n📊 Macros par portion (${servings} portion${servings > 1 ? 's' : ''}) :`);
  console.log(`   Calories  : ${macros.calories} kcal`);
  console.log(`   Protéines : ${macros.protein}g`);
  console.log(`   Glucides  : ${macros.carbs}g`);
  console.log(`   Lipides   : ${macros.fat}g`);
  if (withMacros < total) {
    console.log(`   ⚠️  Couverture : ${withMacros}/${total} ingrédients (certains sans macros ou unité non convertible)`);
  }

  // 7. Synchroniser le JSONB legacy
  const { data: rows } = await supabase
    .from('recipe_ingredients')
    .select('quantity, unit, preparation, quantity_text, ingredients(name)')
    .eq('recipe_id', recipeId)
    .order('display_order');

  const jsonbArr = (rows || []).map((r) => {
    const ingName = r.ingredients?.name ?? '';
    let prefix = '';
    if (r.quantity != null) {
      prefix = buildQuantityText(r.quantity, r.unit);
    } else if (r.quantity_text) {
      prefix = r.quantity_text.trim();
    }
    const prep = r.preparation ? ` ${r.preparation}` : '';
    return prefix ? `${prefix} ${ingName}${prep}`.trim() : `${ingName}${prep}`.trim();
  }).filter(Boolean);

  await supabase.from('recipes').update({ ingredients: jsonbArr }).eq('id', recipeId);
  console.log(`✅ JSONB legacy synchronisé`);

  // 8. Rapport final
  console.log('\n━━━ RAPPORT ━━━\n');
  console.log(`Recette #${recipeId} : ${recipe.title}`);
  console.log(`  Ingrédients existants : ${report.existing.length}`);
  console.log(`  Ingrédients créés     : ${report.created.length}`);
  console.log(`  Enrichis via CIQUAL   : ${report.enrichedCiqual.length}`);
  console.log(`  Enrichis via OFF      : ${report.enrichedOFF.length}`);

  if (report.enrichedOFF.length > 0) {
    console.log(`\n⚠️  VÉRIFICATION REQUISE (matchs Open Food Facts) :`);
    for (const m of report.enrichedOFF) {
      console.log(`   • ${m.name} → "${m.offName}" (${m.kcal} kcal, P=${m.protein}g, G=${m.carbs}g, L=${m.fat}g)`);
    }
  }

  if (report.needManual.length > 0) {
    console.log(`\n🔴 À ENRICHIR MANUELLEMENT (${report.needManual.length}) :`);
    for (const m of report.needManual) {
      console.log(`   • ${m.name} (id=${m.id}) → Admin > Ingrédients > bouton OFF ou saisie manuelle`);
    }
  }

  if (report.needManual.length === 0 && report.enrichedOFF.length === 0) {
    console.log(`\n✅ Tous les ingrédients ont des macros vérifiées !`);
  }

  console.log('');
}

main().catch((e) => {
  console.error('❌ Erreur fatale :', e);
  process.exit(1);
});
