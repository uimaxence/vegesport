/**
 * Génère les images manquantes pour les recettes sans image.
 *
 * Usage :
 *   node scripts/generate-missing-images.mjs [--ids 60,61,62]
 *
 * Nécessite GEMINI_API_KEY et SUPABASE_SERVICE_ROLE_KEY dans .env.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
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
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!url || !serviceRoleKey) {
  console.error('❌ VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis');
  process.exit(1);
}
if (!geminiApiKey) {
  console.error('❌ GEMINI_API_KEY requis dans .env');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
const genai = new GoogleGenAI({ apiKey: geminiApiKey });

const STORAGE_BUCKET = 'recipes';
const STORAGE_BASE_URL = `${url}/storage/v1/object/public/${STORAGE_BUCKET}/`;

/* ── Args ─────────────────────────────────────────────── */
const args = process.argv.slice(2);
let filterIds = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ids' && args[i + 1]) {
    filterIds = args[++i].split(',').map(Number);
  }
}

/* ── Image generation ─────────────────────────────────── */

async function generateImage(recipe) {
  const recipeContext = JSON.stringify({
    title: recipe.title,
    category: recipe.category,
    ingredients: recipe.ingredients || [],
    steps: recipe.steps || [],
  }, null, 2);

  const prompt = `En te basant sur le JSON suivant, génère une image du plat décrit. Photo simple, lumière naturelle, fond sobre et uni. Il faut IMPERATIVEMENT que le plat soit photographié du dessus et qu'il y ait bien que 1 plat au centre de l'image.\n\nJSON:\n${recipeContext}`;

  const response = await genai.models.generateContent({
    model: 'imagen-4.0-generate-001',
    contents: prompt,
    config: {
      responseModalities: [Modality.IMAGE],
      numberOfImages: 1,
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return Buffer.from(part.inlineData.data, 'base64');
    }
  }
  return null;
}

async function removeBackgroundAndConvertWebp(imageBuffer) {
  const sharp = (await import('sharp')).default;

  const metadata = await sharp(imageBuffer).metadata();
  const w = metadata.width;
  const h = metadata.height;

  // Détecter la couleur de fond depuis les 4 coins
  const corners = [
    { left: 0, top: 0 },
    { left: Math.max(0, w - 10), top: 0 },
    { left: 0, top: Math.max(0, h - 10) },
    { left: Math.max(0, w - 10), top: Math.max(0, h - 10) },
  ];

  let rSum = 0, gSum = 0, bSum = 0, totalPixels = 0;
  for (const corner of corners) {
    const { data, info } = await sharp(imageBuffer)
      .extract({ left: corner.left, top: corner.top, width: Math.min(10, w), height: Math.min(10, h) })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const ch = info.channels;
    for (let i = 0; i < data.length; i += ch) {
      rSum += data[i];
      gSum += data[i + 1];
      bSum += data[i + 2];
      totalPixels++;
    }
  }
  const bgR = Math.round(rSum / totalPixels);
  const bgG = Math.round(gSum / totalPixels);
  const bgB = Math.round(bSum / totalPixels);

  // Rendre le fond transparent
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

async function uploadToStorage(recipeId, webpBuffer) {
  const filePath = `${recipeId}.webp`;
  await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, webpBuffer, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw new Error(`Upload échoué : ${error.message}`);
  return `${STORAGE_BASE_URL}${filePath}`;
}

/* ── Main ─────────────────────────────────────────────── */

async function main() {
  console.log('━━━ GÉNÉRATION DES IMAGES MANQUANTES ━━━\n');

  // Charger les recettes sans image
  let query = supabase.from('recipes').select('id, title, category, ingredients, steps').is('image', null).order('id');
  if (filterIds) {
    query = supabase.from('recipes').select('id, title, category, ingredients, steps').in('id', filterIds).order('id');
  }

  const { data: recipes, error } = await query;
  if (error) {
    console.error('❌ Erreur chargement recettes :', error.message);
    process.exit(1);
  }

  if (recipes.length === 0) {
    console.log('✅ Toutes les recettes ont déjà une image !');
    return;
  }

  console.log(`📸 ${recipes.length} recette(s) sans image :\n`);

  let success = 0;
  let failed = 0;

  for (const recipe of recipes) {
    console.log(`  #${recipe.id} ${recipe.title}`);

    try {
      // 1. Générer l'image
      console.log('     🎨 Génération via Gemini...');
      const rawImage = await generateImage(recipe);
      if (!rawImage) {
        console.log('     ⚠️  Pas d\'image retournée, skip');
        failed++;
        continue;
      }
      console.log(`     📐 Image brute : ${(rawImage.length / 1024).toFixed(0)} Ko`);

      // 2. Détourer + WebP
      console.log('     ✂️  Détourage fond + conversion WebP...');
      const webpImage = await removeBackgroundAndConvertWebp(rawImage);
      console.log(`     📦 WebP final : ${(webpImage.length / 1024).toFixed(0)} Ko`);

      // 3. Upload
      console.log('     ☁️  Upload vers Supabase Storage...');
      const imageUrl = await uploadToStorage(recipe.id, webpImage);

      // 4. Mettre à jour la recette
      await supabase.from('recipes').update({ image: imageUrl }).eq('id', recipe.id);
      console.log(`     ✅ ${recipe.id}.webp uploadé et lié\n`);
      success++;

      // Rate limiting Gemini
      if (recipes.indexOf(recipe) < recipes.length - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (e) {
      console.error(`     ❌ Erreur : ${e.message}\n`);
      failed++;
    }
  }

  console.log('\n━━━ RAPPORT ━━━\n');
  console.log(`  ✅ ${success} image(s) générée(s)`);
  if (failed > 0) console.log(`  ❌ ${failed} échec(s)`);
  console.log('');
}

main().catch((e) => {
  console.error('❌ Erreur fatale :', e);
  process.exit(1);
});
