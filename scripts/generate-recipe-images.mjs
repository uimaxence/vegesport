/**
 * Génère les images manquantes des recettes via Google Imagen,
 * avec le même pipeline que l'import : génération → détourage → WebP → upload Supabase.
 *
 * Usage :
 *   node scripts/generate-recipe-images.mjs            # toutes les recettes sans image
 *   node scripts/generate-recipe-images.mjs 70 71 72   # ids spécifiques
 *
 * Nécessite dans .env (ou .env.local) :
 *   - VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *   - GEMINI_API_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality } from '@google/genai';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

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
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!url || !serviceRoleKey) {
  console.error('❌ VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env');
  process.exit(1);
}
if (!geminiApiKey) {
  console.error('❌ GEMINI_API_KEY manquante dans .env — clé gratuite sur https://aistudio.google.com');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
const genai = new GoogleGenAI({ apiKey: geminiApiKey });

const STORAGE_BUCKET = 'recipes';
const STORAGE_BASE_URL = `${url}/storage/v1/object/public/${STORAGE_BUCKET}/`;

// Modèle d'image : surchargeable via IMAGE_MODEL dans .env
// (imagen-* n'est pas disponible sur les clés AI Studio standard)
const IMAGE_MODEL = process.env.IMAGE_MODEL || 'gemini-3.1-flash-image';

async function generateRecipeImage(recipe) {
  const recipeJson = JSON.stringify({
    title: recipe.title,
    category: recipe.category,
    ingredients: recipe.ingredientNames,
    steps: recipe.steps,
  }, null, 2);

  const prompt = `En te basant sur le JSON suivant, génère une image du plat décrit. Photo simple, lumière naturelle, fond sobre et uni. Il faut IMPERATIVEMENT que le plat soit photographié du dessus et qu'il y ait bien que 1 plat au centre de l'image.\n\nJSON:\n${recipeJson}`;

  const response = await genai.models.generateContent({
    model: IMAGE_MODEL,
    contents: prompt,
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return Buffer.from(part.inlineData.data, 'base64');
  }
  return null;
}

async function removeBackgroundAndConvertWebp(imageBuffer) {
  const sharp = (await import('sharp')).default;

  const metadata = await sharp(imageBuffer).metadata();
  const w = metadata.width;
  const h = metadata.height;

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
      pixels[i + 3] = 0;
    }
  }

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
  await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, webpBuffer, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: true,
    });
  if (error) {
    console.error(`     ❌ Upload échoué : ${error.message}`);
    return null;
  }
  return `${STORAGE_BASE_URL}${filePath}`;
}

/* ── Main ─────────────────────────────────────────────── */

const wantedIds = process.argv.slice(2).map(Number).filter((n) => !isNaN(n));

let query = supabase.from('recipes').select('id, title, category, steps').order('id');
if (wantedIds.length > 0) {
  query = query.in('id', wantedIds);
} else {
  query = query.is('image', null);
}
const { data: recipes, error } = await query;
if (error) { console.error('❌', error.message); process.exit(1); }
if (!recipes?.length) { console.log('✅ Aucune recette sans image.'); process.exit(0); }

console.log(`🎨 ${recipes.length} image(s) à générer\n`);
let ok = 0;
for (const r of recipes) {
  console.log(`  📝 #${r.id} ${r.title}`);
  const { data: ri } = await supabase
    .from('recipe_ingredients')
    .select('ingredients(name)')
    .eq('recipe_id', r.id);
  r.ingredientNames = (ri || []).map((x) => x.ingredients?.name).filter(Boolean);

  try {
    const raw = await generateRecipeImage(r);
    if (!raw) { console.warn('     ⚠️  Pas d\'image retournée'); continue; }
    console.log('     ✂️  Détourage + WebP...');
    const webp = await removeBackgroundAndConvertWebp(raw);
    const imageUrl = await uploadImageToStorage(r.id, webp);
    if (imageUrl) {
      await supabase.from('recipes').update({ image: imageUrl }).eq('id', r.id);
      console.log(`     🖼️  ${r.id}.webp lié`);
      ok++;
    }
  } catch (e) {
    console.error(`     ❌ ${e.message}`);
  }
}
console.log(`\n✅ ${ok}/${recipes.length} image(s) générée(s)`);
