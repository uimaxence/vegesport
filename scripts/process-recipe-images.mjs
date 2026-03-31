/**
 * Traite les images de recettes : détourage IA + conversion WebP + upload Supabase.
 *
 * Usage :
 *   node scripts/process-recipe-images.mjs
 *
 * Dépose tes fichiers PNG nommés par ID de recette dans content/images/
 *   Exemple : 60.png, 61.png, 62.png
 *
 * Le script :
 *   1. Scanne content/images/*.png
 *   2. Détoure le fond via @imgly/background-removal-node (modèle IA)
 *   3. Trim les bords transparents, redimensionne, convertit en WebP
 *   4. Upload dans le bucket Supabase "recipes" sous {id}.webp
 *   5. Met à jour le champ image de la recette en base
 *   6. Déplace le PNG traité dans content/images/done/
 *
 * Nécessite SUPABASE_SERVICE_ROLE_KEY dans .env (ou .env.local).
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync, readdirSync, mkdirSync, renameSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { removeBackground } from '@imgly/background-removal-node';

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
  console.error('❌ VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

const STORAGE_BUCKET = 'recipes';
const STORAGE_BASE_URL = `${url}/storage/v1/object/public/${STORAGE_BUCKET}/`;
const IMAGES_DIR = join(root, 'content', 'images');

/* ── Détourage IA + WebP ──────────────────────────────── */

async function processImage(inputPath) {
  const sharp = (await import('sharp')).default;
  const imageBuffer = readFileSync(inputPath);

  // 1. Détourage IA via @imgly/background-removal-node
  console.log('     🤖 Détourage IA en cours...');
  const inputBlob = new Blob([imageBuffer], { type: 'image/png' });
  const blob = await removeBackground(inputBlob, {
    output: { format: 'image/png' },
  });

  const arrayBuffer = await blob.arrayBuffer();
  const pngBuffer = Buffer.from(arrayBuffer);
  console.log(`     ✅ Détourage terminé (${(pngBuffer.length / 1024).toFixed(0)} Ko)`);

  // 2. Trim les bords transparents
  const trimmed = await sharp(pngBuffer)
    .trim()
    .toBuffer({ resolveWithObject: true });

  console.log(`     📐 Après trim : ${trimmed.info.width}×${trimmed.info.height}`);

  // 3. Redimensionner + padding léger + WebP
  return sharp(trimmed.data)
    .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
    .extend({
      top: 20, bottom: 20, left: 20, right: 20,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 85 })
    .toBuffer();
}

/* ── Upload + DB ──────────────────────────────────────── */

async function uploadAndLink(recipeId, webpBuffer) {
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

  const imageUrl = `${STORAGE_BASE_URL}${filePath}`;
  await supabase.from('recipes').update({ image: imageUrl }).eq('id', recipeId);
  return imageUrl;
}

function moveToProcessed(filePath) {
  const doneDir = join(IMAGES_DIR, 'done');
  mkdirSync(doneDir, { recursive: true });
  const baseName = filePath.split('/').pop();
  renameSync(filePath, join(doneDir, baseName));
}

/* ── Main ─────────────────────────────────────────────── */

async function main() {
  console.log('━━━ TRAITEMENT DES IMAGES RECETTES ━━━\n');

  if (!existsSync(IMAGES_DIR)) {
    mkdirSync(IMAGES_DIR, { recursive: true });
    console.log('📭 Dossier content/images/ créé. Dépose tes PNG dedans et relance.');
    return;
  }

  const pngFiles = readdirSync(IMAGES_DIR)
    .filter((f) => /^\d+\.png$/i.test(f))
    .sort((a, b) => parseInt(a) - parseInt(b));

  if (pngFiles.length === 0) {
    console.log('📭 Aucun fichier PNG trouvé dans content/images/');
    console.log('   Format attendu : 60.png, 61.png, 62.png (nommé par ID de recette)');
    return;
  }

  console.log(`📸 ${pngFiles.length} image(s) à traiter :\n`);

  let success = 0;
  let failed = 0;

  for (const file of pngFiles) {
    const recipeId = parseInt(file);
    const filePath = join(IMAGES_DIR, file);
    const fileSize = readFileSync(filePath).length;

    console.log(`  #${recipeId} — ${file} (${(fileSize / 1024).toFixed(0)} Ko)`);

    // Vérifier que la recette existe
    const { data: recipe } = await supabase
      .from('recipes')
      .select('id, title')
      .eq('id', recipeId)
      .single();

    if (!recipe) {
      console.log(`     ⚠️  Recette #${recipeId} introuvable en base, skip\n`);
      failed++;
      continue;
    }

    console.log(`     📝 ${recipe.title}`);

    try {
      // 1. Détourage IA + trim + WebP
      const webpBuffer = await processImage(filePath);
      console.log(`     📦 WebP final : ${(webpBuffer.length / 1024).toFixed(0)} Ko`);

      // 2. Upload + lier
      console.log('     ☁️  Upload vers Supabase Storage...');
      await uploadAndLink(recipeId, webpBuffer);
      console.log(`     ✅ Lié → ${recipeId}.webp\n`);

      // 3. Déplacer dans done/
      moveToProcessed(filePath);
      success++;
    } catch (e) {
      console.error(`     ❌ Erreur : ${e.message}\n`);
      failed++;
    }
  }

  console.log('━━━ RAPPORT ━━━\n');
  console.log(`  ✅ ${success} image(s) traitée(s)`);
  if (failed > 0) console.log(`  ❌ ${failed} échec(s)`);
  console.log('');
}

main().catch((e) => {
  console.error('❌ Erreur fatale :', e);
  process.exit(1);
});
