/**
 * Import automatique des recettes et articles depuis les dossiers content/.
 *
 * Usage :
 *   node scripts/import-content.mjs [--ciqual ciqual.csv] [--dry-run] [--no-image]
 *
 * Le script :
 *   1. Scanne content/recettes/*.json et content/articles/*.json
 *   2. Importe les recettes EN PREMIER (pour que les IDs existent pour les articles)
 *   3. Génère une image via Google Imagen, détoure le fond, convertit en WebP
 *   4. Upload l'image dans le bucket Supabase "recipes" et lie à la recette
 *   5. Importe les articles (qui référencent les recettes via recipeIds)
 *   6. Déplace les fichiers traités dans content/recettes/done/ et content/articles/done/
 *
 * Chaque fichier JSON peut contenir :
 *   - Un seul objet : { "title": "...", ... }
 *   - Un tableau : [{ "title": "..." }, { "title": "..." }]
 *
 * Nécessite dans .env (ou .env.local) :
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - GEMINI_API_KEY (pour la génération d'images)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync, readdirSync, mkdirSync, renameSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality } from '@google/genai';

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
let ciqualPath = null;
let dryRun = false;
let noImage = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ciqual' && args[i + 1]) ciqualPath = args[++i];
  if (args[i] === '--dry-run') dryRun = true;
  if (args[i] === '--no-image') noImage = true;
}

/* ── Gemini (génération d'images) ─────────────────────── */

const geminiApiKey = process.env.GEMINI_API_KEY;
const canGenerateImages = !noImage && !!geminiApiKey;

let genai = null;
if (canGenerateImages) {
  genai = new GoogleGenAI({ apiKey: geminiApiKey });
} else if (!noImage && !geminiApiKey) {
  console.warn('⚠️  GEMINI_API_KEY manquante → génération d\'images désactivée (ajoute --no-image pour supprimer cet avertissement)\n');
}

/* ── Dossiers ─────────────────────────────────────────── */

const CONTENT_DIR = join(root, 'content');
const RECETTES_DIR = join(CONTENT_DIR, 'recettes');
const ARTICLES_DIR = join(CONTENT_DIR, 'articles');

function getJsonFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('.'))
    .map((f) => join(dir, f))
    .sort();
}

function parseJsonFile(filePath) {
  const raw = JSON.parse(readFileSync(filePath, 'utf8'));
  return Array.isArray(raw) ? raw : [raw];
}

function moveToProcessed(filePath) {
  const dir = dirname(filePath);
  const doneDir = join(dir, 'done');
  mkdirSync(doneDir, { recursive: true });
  const baseName = filePath.split('/').pop();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const destName = `${timestamp}_${baseName}`;
  renameSync(filePath, join(doneDir, destName));
}

/* ── Normalisation du format JSON ─────────────────────── */

const CATEGORY_MAP = {
  'petit-déjeuner': 'petit-dejeuner',
  'petit-dejeuner': 'petit-dejeuner',
  'déjeuner': 'dejeuner',
  'dejeuner': 'dejeuner',
  'dîner': 'diner',
  'diner': 'diner',
  'snack': 'snack',
  'dessert': 'dessert',
  'goûter': 'snack',
};

const DIFFICULTY_MAP = {
  'très facile': 'Facile',
  'facile': 'Facile',
  'moyen': 'Moyen',
  'moyenne': 'Moyen',
  'difficile': 'Difficile',
};

/**
 * Parse une quantité string ("80 g", "2 c. à s. (30 g)", "1 (120 g)", "½ citron")
 * en { quantity: number|null, unit: string|null, cleanName: string|null }
 */
function parseQuantityString(qtyStr, ingredientName) {
  if (!qtyStr || typeof qtyStr !== 'string') return { quantity: null, unit: null, cleanName: null };

  const str = qtyStr.trim();

  // Extraire le grammage entre parenthèses s'il existe : "2 c. à s. (30 g)" → 30g
  const parenMatch = str.match(/\((\d+(?:[.,]\d+)?)\s*(g|ml|kg|cl|L)\)/);
  if (parenMatch) {
    return {
      quantity: parseFloat(parenMatch[1].replace(',', '.')),
      unit: parenMatch[2],
      cleanName: null,
    };
  }

  // Pattern standard : "80 g", "200 ml", "120 g"
  const stdMatch = str.match(/^(\d+(?:[.,]\d+)?)\s*(g|ml|kg|cl|L)$/);
  if (stdMatch) {
    return {
      quantity: parseFloat(stdMatch[1].replace(',', '.')),
      unit: stdMatch[2],
      cleanName: null,
    };
  }

  // Cuillères : "2 c. à s.", "1 c. à c.", "½ c. à c."
  const spoonMatch = str.match(/^(\d+(?:[.,]\d+)?|½|¼|¾)\s*c\.\s*à\s*(s|c)\.?/);
  if (spoonMatch) {
    let qty = spoonMatch[1] === '½' ? 0.5 : spoonMatch[1] === '¼' ? 0.25 : spoonMatch[1] === '¾' ? 0.75 : parseFloat(spoonMatch[1].replace(',', '.'));
    return {
      quantity: qty,
      unit: spoonMatch[2] === 's' ? 'c.à.s' : 'c.à.c',
      cleanName: null,
    };
  }

  // Juste un nombre : "1", "2", "½"
  const numMatch = str.match(/^(\d+(?:[.,]\d+)?|½|¼|¾)$/);
  if (numMatch) {
    let qty = numMatch[1] === '½' ? 0.5 : numMatch[1] === '¼' ? 0.25 : numMatch[1] === '¾' ? 0.75 : parseFloat(numMatch[1].replace(',', '.'));
    return { quantity: qty, unit: 'pièce', cleanName: null };
  }

  // "1 citron entier", "2 moyennes (200 g)" → pièce
  const pieceMatch = str.match(/^(\d+(?:[.,]\d+)?|½|¼|¾)\s+/);
  if (pieceMatch) {
    let qty = pieceMatch[1] === '½' ? 0.5 : pieceMatch[1] === '¼' ? 0.25 : pieceMatch[1] === '¾' ? 0.75 : parseFloat(pieceMatch[1].replace(',', '.'));
    return { quantity: qty, unit: 'pièce', cleanName: null };
  }

  // "à goût" → pas de quantité
  if (/à goût/i.test(str)) {
    return { quantity: null, unit: null, cleanName: null };
  }

  return { quantity: null, unit: null, cleanName: null };
}

/**
 * Nettoie le nom d'un ingrédient en retirant les parenthèses descriptives
 * "Pain complet (2 tranches)" → "Pain complet"
 * "Beurre d'amande (ou cacahuète)" → "Beurre d'amande"
 * "Pois chiches en boîte (égouttés et rincés)" → "Pois chiches en boîte"
 * Mais garde les infos utiles
 */
function cleanIngredientName(name) {
  if (!name) return name;
  // Retirer les parenthèses et leur contenu
  return name
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Détecte un rayon de supermarché à partir du nom d'ingrédient
 */
function guessRayon(name) {
  const n = name.toLowerCase();
  if (/tofu|tempeh|seitan|yaourt de soja|lait de soja|lait d'avoine|lait d'amande|lait végétal/.test(n)) return 'Frais et protéines végétales';
  if (/épinard|carotte|oignon|ail|poivron|avocat|banane|citron|persil|gingembre|roquette|salade|tomate/.test(n)) return 'Fruits et légumes';
  if (/riz|pâte|quinoa|semoule|lentille|pois chiche|haricot/.test(n)) return 'Pâtes riz et céréales';
  if (/farine|avoine|flocon|levure|bicarbonate|fécule|maïzena|sucre|miel|sirop|chocolat|cacao|vanille|datte/.test(n)) return 'Épicerie';
  if (/huile|vinaigre|sauce soja|moutarde|sel|poivre|cumin|curry|curcuma|paprika|cannelle/.test(n)) return 'Condiments et épices';
  if (/graine|amande|noix|cacahuète|sésame|tahini|beurre d'amande|beurre de cacahuète|tournesol|courge|chanvre|chia|coco/.test(n)) return 'Graines et oléagineux';
  if (/surgelé/.test(n)) return 'Surgelés';
  if (/lait|jus|boisson/.test(n)) return 'Boissons';
  return 'Épicerie';
}

/**
 * Normalise une recette du format JSON utilisateur vers le format attendu par le script
 */
function normalizeRecipe(raw) {
  const recipe = { ...raw };

  // Category : "Petit-déjeuner" → "petit-dejeuner"
  if (recipe.category) {
    const key = recipe.category.toLowerCase().trim();
    recipe.category = CATEGORY_MAP[key] || recipe.category;
  }

  // Difficulty : "Très facile" → "Facile"
  if (recipe.difficulty) {
    const key = recipe.difficulty.toLowerCase().trim();
    recipe.difficulty = DIFFICULTY_MAP[key] || recipe.difficulty;
  }

  // Time : prep_time + cook_time → time
  if (recipe.time == null && (recipe.prep_time != null || recipe.cook_time != null)) {
    recipe.time = (Number(recipe.prep_time) || 0) + (Number(recipe.cook_time) || 0);
  }

  // Ingredients : format string → format structuré
  if (Array.isArray(recipe.ingredients) && !recipe.recipeIngredients) {
    recipe.recipeIngredients = recipe.ingredients.map((ing) => {
      const rawName = ing.name || '';
      const cleanedName = cleanIngredientName(rawName);
      const parsed = parseQuantityString(ing.quantity, rawName);
      return {
        name: cleanedName,
        quantity: parsed.quantity,
        unit: parsed.unit,
        rayon: guessRayon(cleanedName),
        preparation: null,
      };
    });
  }

  // Map description → notes si pas déjà défini
  if (!recipe.notes && recipe.description) {
    recipe.notes = recipe.description;
  }

  // Ajouter nutrition_notes et tip aux notes
  const extras = [];
  if (recipe.nutrition_notes) extras.push(recipe.nutrition_notes);
  if (recipe.tip) extras.push(`Astuce : ${recipe.tip}`);
  if (extras.length > 0) {
    recipe.notes = [recipe.notes, ...extras].filter(Boolean).join('\n\n');
  }

  // Tags : normaliser comme le format attendu (avec #)
  if (Array.isArray(recipe.tags)) {
    recipe.tags = recipe.tags.map((t) => t.startsWith('#') ? t : `#${t}`);
  }

  return recipe;
}

/* ── Validation recette ───────────────────────────────── */

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

/* ── Validation article ───────────────────────────────── */

function validateArticle(data) {
  const errors = [];
  if (!data || typeof data !== 'object') return ['Le JSON doit être un objet'];
  if (!data.id) errors.push('Champ requis manquant : id');
  if (!data.title) errors.push('Champ requis manquant : title');
  if (!data.category) errors.push('Champ requis manquant : category');
  if (!data.date) errors.push('Champ requis manquant : date');
  return errors;
}

/* ── CIQUAL ───────────────────────────────────────────── */

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

/* ── Open Food Facts ──────────────────────────────────── */

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

/* ── Génération d'image, détourage et upload ──────────── */

const STORAGE_BUCKET = 'recipes';
const STORAGE_BASE_URL = `${url}/storage/v1/object/public/${STORAGE_BUCKET}/`;

async function generateRecipeImage(recipe) {
  if (!genai) return null;

  const recipeJson = JSON.stringify({
    title: recipe.title,
    category: recipe.category,
    ingredients: recipe.recipeIngredients?.map((i) => i.name) || recipe.ingredients || [],
    steps: recipe.steps,
  }, null, 2);

  const prompt = `En te basant sur le JSON suivant, génère une image du plat décrit. Photo simple, lumière naturelle, fond sobre et uni. Il faut IMPERATIVEMENT que le plat soit photographié du dessus et qu'il y ait bien que 1 plat au centre de l'image.\n\nJSON:\n${recipeJson}`;

  try {
    const response = await genai.models.generateContent({
      model: 'imagen-4.0-generate-001',
      contents: prompt,
      config: {
        responseModalities: [Modality.IMAGE],
        numberOfImages: 1,
      },
    });

    // Extraire l'image de la réponse
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return Buffer.from(part.inlineData.data, 'base64');
      }
    }

    console.warn('     ⚠️  Gemini n\'a pas retourné d\'image');
    return null;
  } catch (e) {
    console.error(`     ❌ Génération image échouée : ${e.message}`);
    return null;
  }
}

async function removeBackgroundAndConvertWebp(imageBuffer) {
  const sharp = (await import('sharp')).default;

  // 1. Identifier la couleur dominante des coins (= fond)
  const metadata = await sharp(imageBuffer).metadata();
  const w = metadata.width;
  const h = metadata.height;

  // Extraire les pixels pour détecter la couleur de fond (coin supérieur gauche, 10x10)
  const cornerRaw = await sharp(imageBuffer)
    .extract({ left: 0, top: 0, width: Math.min(10, w), height: Math.min(10, h) })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = cornerRaw;
  const channels = info.channels;
  let rSum = 0, gSum = 0, bSum = 0;
  const pixelCount = data.length / channels;
  for (let i = 0; i < data.length; i += channels) {
    rSum += data[i];
    gSum += data[i + 1];
    bSum += data[i + 2];
  }
  const bgR = Math.round(rSum / pixelCount);
  const bgG = Math.round(gSum / pixelCount);
  const bgB = Math.round(bSum / pixelCount);

  // 2. Rendre le fond transparent (tolérance de ±35 par canal)
  const tolerance = 35;
  const rawBuffer = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = rawBuffer.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const dr = Math.abs(pixels[i] - bgR);
    const dg = Math.abs(pixels[i + 1] - bgG);
    const db = Math.abs(pixels[i + 2] - bgB);
    if (dr <= tolerance && dg <= tolerance && db <= tolerance) {
      pixels[i + 3] = 0; // alpha = transparent
    }
  }

  // 3. Trim les bords transparents + redimensionner + convertir en WebP
  const trimmed = await sharp(pixels, {
    raw: { width: rawBuffer.info.width, height: rawBuffer.info.height, channels: 4 },
  })
    .trim()
    .toBuffer({ resolveWithObject: true });

  return sharp(trimmed.data, {
    raw: { width: trimmed.info.width, height: trimmed.info.height, channels: 4 },
  })
    .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
    .extend({
      top: 20, bottom: 20, left: 20, right: 20,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 85 })
    .toBuffer();
}

async function uploadImageToStorage(recipeId, webpBuffer) {
  const filePath = `${recipeId}.webp`;

  // Supprimer l'ancien fichier s'il existe
  await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, webpBuffer, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error(`     ❌ Upload image échoué : ${error.message}`);
    return null;
  }

  return `${STORAGE_BASE_URL}${filePath}`;
}

async function generateAndUploadImage(recipeId, recipe) {
  if (!canGenerateImages) return null;
  if (dryRun) {
    console.log('     🔍 DRY-RUN — image non générée');
    return null;
  }

  console.log('     🎨 Génération de l\'image via Gemini...');
  const rawImage = await generateRecipeImage(recipe);
  if (!rawImage) return null;

  console.log('     ✂️  Détourage du fond et conversion WebP...');
  const webpImage = await removeBackgroundAndConvertWebp(rawImage);

  console.log('     ☁️  Upload vers Supabase Storage...');
  const imageUrl = await uploadImageToStorage(recipeId, webpImage);

  if (imageUrl) {
    // Mettre à jour le champ image de la recette
    await supabase.from('recipes').update({ image: imageUrl }).eq('id', recipeId);
    console.log(`     🖼️  Image liée : ${recipeId}.webp`);
  }

  return imageUrl;
}

/* ── Import recette ───────────────────────────────────── */

async function importRecipe(rawRecipe, ciqual) {
  const recipe = normalizeRecipe(rawRecipe);
  const errors = validateRecipe(recipe);
  if (errors.length > 0) {
    console.error(`  ❌ Validation échouée pour "${recipe.title || '???'}" :`);
    errors.forEach((e) => console.error(`     • ${e}`));
    return { success: false, title: recipe.title || '???', errors };
  }

  console.log(`\n  📝 ${recipe.title}`);
  console.log(`     Catégorie : ${recipe.category} | Portions : ${recipe.servings || 1} | Ingrédients : ${recipe.recipeIngredients.length}`);

  if (dryRun) {
    console.log(`     🔍 DRY-RUN — pas d'écriture en BDD`);
    return { success: true, title: recipe.title, id: null, dryRun: true };
  }

  // Résoudre les ingrédients
  const resolvedIngredients = [];
  const report = { existing: 0, created: 0, enrichedCiqual: 0, enrichedOFF: 0, needManual: [] };

  for (let i = 0; i < recipe.recipeIngredients.length; i++) {
    const entry = recipe.recipeIngredients[i];
    const name = (entry.name || '').trim();
    const rayon = (entry.rayon || 'Fruits et légumes').trim();
    const quantity = entry.quantity != null && entry.quantity !== '' ? Number(entry.quantity) : null;
    const unit = (entry.unit || '').trim() || null;
    const preparation = (entry.preparation || '').trim() || null;

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
      report.existing++;
    } else {
      const { data: inserted, error: errIns } = await supabase
        .from('ingredients')
        .insert({ name, rayon })
        .select('id')
        .single();
      if (errIns) {
        console.error(`     ❌ Création ingrédient échouée : "${name}" — ${errIns.message}`);
        continue;
      }
      ingredientId = inserted.id;
      hasMacros = false;
      report.created++;
    }

    // Enrichir si pas de macros
    if (!hasMacros) {
      let enriched = false;

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
          if (!updErr) { enriched = true; report.enrichedCiqual++; }
        }
      }

      if (!enriched) {
        try {
          await delay(500);
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
                is_verified: false,
              })
              .eq('id', ingredientId);
            if (!updErr) { enriched = true; report.enrichedOFF++; }
          }
        } catch { /* OFF indispo */ }
      }

      if (!enriched) {
        report.needManual.push({ name, id: ingredientId });
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

  // Créer la recette
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

  // Si un id est fourni, on l'utilise (utile pour le mapping articles → recettes)
  if (recipe.id != null) row.id = recipe.id;

  const { data: inserted, error: errRecipe } = await supabase
    .from('recipes')
    .upsert(row, { onConflict: 'id' })
    .select('id')
    .single();

  if (errRecipe) {
    console.error(`     ❌ Création recette échouée : ${errRecipe.message}`);
    return { success: false, title: recipe.title, errors: [errRecipe.message] };
  }

  const recipeId = inserted.id;

  // Supprimer les anciens recipe_ingredients si upsert
  if (recipe.id != null) {
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);
  }

  // Insérer les recipe_ingredients
  if (resolvedIngredients.length > 0) {
    const { error: errRi } = await supabase
      .from('recipe_ingredients')
      .insert(resolvedIngredients.map((r) => ({ recipe_id: recipeId, ...r })));
    if (errRi) {
      console.error(`     ❌ Insertion recipe_ingredients : ${errRi.message}`);
    }
  }

  // Calculer les macros
  const { data: riWithMacros } = await supabase
    .from('recipe_ingredients')
    .select('quantity, unit, ingredients(calories_per_100, protein_per_100, carbs_per_100, fat_per_100)')
    .eq('recipe_id', recipeId);

  let totalCal = 0, totalProt = 0, totalCarbs = 0, totalFat = 0;
  let withMacros = 0;

  for (const ri of riWithMacros || []) {
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

  await supabase.from('recipes').update(macros).eq('id', recipeId);

  // Synchroniser JSONB legacy
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

  console.log(`     ✅ Recette #${recipeId} — ${macros.calories} kcal, P=${macros.protein}g, G=${macros.carbs}g, L=${macros.fat}g`);
  console.log(`     📦 Ingrédients : ${report.existing} existants, ${report.created} créés, ${report.enrichedCiqual + report.enrichedOFF} enrichis`);

  if (report.needManual.length > 0) {
    console.log(`     ⚠️  À enrichir manuellement : ${report.needManual.map((m) => m.name).join(', ')}`);
  }

  // Générer et uploader l'image si pas déjà définie
  if (!recipe.image) {
    await generateAndUploadImage(recipeId, recipe);
  }

  return { success: true, title: recipe.title, id: recipeId };
}

/* ── Import article ───────────────────────────────────── */

function normalizeBlocks(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
  return [];
}

function extractFaqAndSourcesFromBlocks(blocks) {
  const faq = [];
  const sources = [];
  for (const b of blocks) {
    const type = String(b?.type || '').toLowerCase();
    if (type === 'faq' && Array.isArray(b?.items)) {
      for (const item of b.items) {
        const question = item?.question ?? item?.name;
        const answer = item?.answer ?? item?.acceptedAnswer?.text ?? item?.acceptedAnswer;
        if (question && answer) faq.push({ question, answer });
      }
    }
    if (type === 'source') {
      const label = b?.label ?? b?.name;
      const bUrl = b?.url ?? b?.href;
      if (label || bUrl) sources.push({ label: label || bUrl, url: bUrl });
    }
    if (type === 'sources_list' && Array.isArray(b?.items)) {
      for (const item of b.items) {
        const label = item?.label ?? item?.name;
        const iUrl = item?.url ?? item?.href;
        if (label || iUrl) sources.push({ label: label || iUrl, url: iUrl });
      }
    }
  }
  return { faq, sources };
}

function toArticleRow(input) {
  const contentJson = normalizeBlocks(input.content_json ?? input.contentJson);
  const extracted = extractFaqAndSourcesFromBlocks(contentJson);
  const baseStorageUrl = `${String(url).replace(/\/$/, '')}/storage/v1/object/public/blog/`;
  const defaultImage = input.id ? `${baseStorageUrl}${input.id}.webp` : null;
  return {
    id: input.id,
    title: input.title,
    excerpt: input.excerpt ?? null,
    meta_title: input.meta_title ?? input.metaTitle ?? input.title,
    meta_description: input.meta_description ?? input.metaDescription ?? input.excerpt ?? '',
    category: input.category,
    date: input.date,
    read_time: input.read_time ?? input.readTime ?? 5,
    image: input.image ?? defaultImage,
    author: input.author ?? null,
    content: input.content ?? '',
    content_json: contentJson,
    faq_json: Array.isArray(input.faq_json) ? input.faq_json : (Array.isArray(input.faqJson) ? input.faqJson : extracted.faq),
    sources_json: Array.isArray(input.sources_json) ? input.sources_json : (Array.isArray(input.sourcesJson) ? input.sourcesJson : extracted.sources),
    schema_type: input.schema_type ?? input.schemaType ?? 'Article',
    updated_at: new Date().toISOString(),
  };
}

async function importArticle(article) {
  const errors = validateArticle(article);
  if (errors.length > 0) {
    console.error(`  ❌ Validation échouée pour "${article.title || '???'}" :`);
    errors.forEach((e) => console.error(`     • ${e}`));
    return { success: false, title: article.title || '???', errors };
  }

  const row = toArticleRow(article);

  // Vérifier que les recettes référencées existent
  const recipeBlocks = (row.content_json || []).filter((b) => b.type === 'recipes');
  const referencedIds = recipeBlocks.flatMap((b) => b.recipeIds || []);

  if (referencedIds.length > 0) {
    const { data: existingRecipes } = await supabase
      .from('recipes')
      .select('id')
      .in('id', referencedIds);

    const existingIds = new Set((existingRecipes || []).map((r) => r.id));
    const missing = referencedIds.filter((id) => !existingIds.has(id));

    if (missing.length > 0) {
      console.warn(`  ⚠️  Article "${row.title}" référence des recettes inexistantes : [${missing.join(', ')}]`);
    }
  }

  console.log(`\n  📝 Article #${row.id} : ${row.title}`);
  console.log(`     Catégorie : ${row.category} | Date : ${row.date} | Recettes liées : ${referencedIds.length}`);

  if (dryRun) {
    console.log(`     🔍 DRY-RUN — pas d'écriture en BDD`);
    return { success: true, title: row.title, id: row.id, dryRun: true };
  }

  const { error } = await supabase.from('blog_articles').upsert(row, { onConflict: 'id' });
  if (error) {
    console.error(`     ❌ Import échoué : ${error.message}`);
    return { success: false, title: row.title, errors: [error.message] };
  }

  console.log(`     ✅ Article #${row.id} importé`);
  return { success: true, title: row.title, id: row.id };
}

/* ── Main ─────────────────────────────────────────────── */

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  IMPORT AUTOMATIQUE CONTENU VEGEPROT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (dryRun) console.log('  🔍 MODE DRY-RUN (aucune écriture)\n');

  const recipeFiles = getJsonFiles(RECETTES_DIR);
  const articleFiles = getJsonFiles(ARTICLES_DIR);

  if (recipeFiles.length === 0 && articleFiles.length === 0) {
    console.log('\n📭 Aucun fichier JSON trouvé dans content/recettes/ ni content/articles/');
    console.log('   Dépose tes fichiers JSON et relance le script.\n');
    return;
  }

  console.log(`\n📂 Fichiers trouvés :`);
  console.log(`   Recettes : ${recipeFiles.length} fichier(s)`);
  console.log(`   Articles : ${articleFiles.length} fichier(s)`);

  // Charger CIQUAL si fourni
  const ciqual = ciqualPath ? loadCiqual(ciqualPath) : null;

  const results = { recipes: [], articles: [] };

  // ── ÉTAPE 1 : Importer les recettes d'abord ──
  if (recipeFiles.length > 0) {
    console.log('\n\n━━━ IMPORT DES RECETTES ━━━');

    for (const file of recipeFiles) {
      const fileName = file.split('/').pop();
      console.log(`\n📄 ${fileName}`);

      let items;
      try {
        items = parseJsonFile(file);
      } catch (e) {
        console.error(`  ❌ JSON invalide : ${e.message}`);
        results.recipes.push({ success: false, file: fileName, errors: [e.message] });
        continue;
      }

      console.log(`   ${items.length} recette(s) dans ce fichier`);

      let allSuccess = true;
      for (const recipe of items) {
        const result = await importRecipe(recipe, ciqual);
        results.recipes.push({ ...result, file: fileName });
        if (!result.success) allSuccess = false;
      }

      // Déplacer le fichier traité
      if (!dryRun && allSuccess) {
        moveToProcessed(file);
        console.log(`   📁 → Déplacé dans done/`);
      }
    }
  }

  // ── ÉTAPE 2 : Importer les articles ──
  if (articleFiles.length > 0) {
    console.log('\n\n━━━ IMPORT DES ARTICLES ━━━');

    for (const file of articleFiles) {
      const fileName = file.split('/').pop();
      console.log(`\n📄 ${fileName}`);

      let items;
      try {
        items = parseJsonFile(file);
      } catch (e) {
        console.error(`  ❌ JSON invalide : ${e.message}`);
        results.articles.push({ success: false, file: fileName, errors: [e.message] });
        continue;
      }

      console.log(`   ${items.length} article(s) dans ce fichier`);

      let allSuccess = true;
      for (const article of items) {
        const result = await importArticle(article);
        results.articles.push({ ...result, file: fileName });
        if (!result.success) allSuccess = false;
      }

      if (!dryRun && allSuccess) {
        moveToProcessed(file);
        console.log(`   📁 → Déplacé dans done/`);
      }
    }
  }

  // ── RAPPORT FINAL ──
  console.log('\n\n━━━ RAPPORT FINAL ━━━\n');

  const okRecipes = results.recipes.filter((r) => r.success);
  const koRecipes = results.recipes.filter((r) => !r.success);
  const okArticles = results.articles.filter((r) => r.success);
  const koArticles = results.articles.filter((r) => !r.success);

  console.log(`Recettes  : ${okRecipes.length} ✅  ${koRecipes.length} ❌`);
  for (const r of okRecipes) console.log(`   ✅ #${r.id ?? '?'} ${r.title}`);
  for (const r of koRecipes) console.log(`   ❌ ${r.title} — ${(r.errors || []).join(', ')}`);

  console.log(`Articles  : ${okArticles.length} ✅  ${koArticles.length} ❌`);
  for (const r of okArticles) console.log(`   ✅ #${r.id ?? '?'} ${r.title}`);
  for (const r of koArticles) console.log(`   ❌ ${r.title} — ${(r.errors || []).join(', ')}`);

  console.log('');

  if (koRecipes.length > 0 || koArticles.length > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('❌ Erreur fatale :', e);
  process.exit(1);
});
