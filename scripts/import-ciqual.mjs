/**
 * Import one-shot de la table Ciqual (ANSES) pour enrichir les ingrédients.
 *
 * 1. Télécharger le fichier CSV depuis https://ciqual.anses.fr/ (bouton « Télécharger »)
 *    → convertir en CSV (séparateur point-virgule ou tabulation) si format Excel.
 * 2. Lancer :  node scripts/import-ciqual.mjs chemin/vers/ciqual.csv
 *
 * Le script :
 *   - Lit tous les ingrédients de la BDD
 *   - Pour chacun, cherche la meilleure correspondance dans le fichier Ciqual
 *   - Met à jour les macros + ciqual_id + is_verified = true si match trouvé
 *   - Affiche un rapport avec les matchs et les ingrédients non trouvés
 *
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
  console.error('❌ VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

/* ── Argument fichier CSV ────────────────────────────── */
const csvPath = process.argv[2];
if (!csvPath || !existsSync(csvPath)) {
  console.error('Usage : node scripts/import-ciqual.mjs chemin/vers/ciqual.csv');
  process.exit(1);
}

/* ── Parsing CSV Ciqual ──────────────────────────────── */

function detectDelimiter(firstLine) {
  const tabs = (firstLine.match(/\t/g) || []).length;
  const semis = (firstLine.match(/;/g) || []).length;
  return tabs > semis ? '\t' : ';';
}

function parseNumber(val) {
  if (!val || val === '-' || val === '' || /traces/i.test(val)) return null;
  const cleaned = val.replace(',', '.').replace(/^</, '').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadCiqual(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('Fichier CSV vide ou invalide');

  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0].split(delimiter).map((h) => h.replace(/^"|"$/g, '').trim());

  // Trouver les index des colonnes par recherche dans les headers
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
  const iGroup = findCol('alim_grp_nom') !== -1 ? findCol('alim_grp_nom') : findCol('groupe');

  if (iName === -1) {
    console.error('❌ Colonne "nom" introuvable. Headers détectés :', headers.slice(0, 15).join(' | '));
    process.exit(1);
  }
  if (iKcal === -1) {
    console.error('❌ Colonne "kcal" introuvable. Headers détectés :', headers.slice(0, 15).join(' | '));
    process.exit(1);
  }

  console.log(`📊 Colonnes détectées :`);
  console.log(`   Nom     → col ${iName} (${headers[iName]})`);
  console.log(`   Code    → col ${iCode} (${iCode >= 0 ? headers[iCode] : '–'})`);
  console.log(`   kcal    → col ${iKcal} (${headers[iKcal]})`);
  console.log(`   Prot    → col ${iProt} (${iProt >= 0 ? headers[iProt] : '–'})`);
  console.log(`   Gluc    → col ${iGluc} (${iGluc >= 0 ? headers[iGluc] : '–'})`);
  console.log(`   Lip     → col ${iLip} (${iLip >= 0 ? headers[iLip] : '–'})`);
  console.log('');

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
      group: iGroup >= 0 ? cols[iGroup] || null : null,
      kcal,
      protein: iProt >= 0 ? parseNumber(cols[iProt]) : null,
      carbs: iGluc >= 0 ? parseNumber(cols[iGluc]) : null,
      fat: iLip >= 0 ? parseNumber(cols[iLip]) : null,
    });
  }

  console.log(`✅ ${entries.length} aliments Ciqual chargés.\n`);
  return entries;
}

/* ── Matching ────────────────────────────────────────── */

function wordOverlap(a, b) {
  const wordsA = new Set(a.split(' ').filter((w) => w.length > 2));
  const wordsB = new Set(b.split(' ').filter((w) => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let matched = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) matched++;
  }
  return matched / Math.max(wordsA.size, wordsB.size);
}

function findBestMatch(ingredientName, ciqual) {
  const norm = normalize(ingredientName);
  let best = null;
  let bestScore = 0;

  for (const entry of ciqual) {
    // Match exact (normalisé)
    if (entry.nameNorm === norm) return { entry, score: 1.0 };

    // Containment
    let score = 0;
    if (entry.nameNorm.includes(norm)) {
      score = 0.7 + 0.3 * (norm.length / entry.nameNorm.length);
    } else if (norm.includes(entry.nameNorm)) {
      score = 0.5 + 0.3 * (entry.nameNorm.length / norm.length);
    } else {
      score = wordOverlap(norm, entry.nameNorm);
    }

    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  // Seuil de confiance minimum
  if (bestScore < 0.4) return null;
  return { entry: best, score: bestScore };
}

/* ── Main ────────────────────────────────────────────── */

async function main() {
  const ciqual = loadCiqual(csvPath);

  // Charger les ingrédients de la BDD
  const { data: dbIngredients, error } = await supabase
    .from('ingredients')
    .select('id, name, is_verified, ciqual_id')
    .order('name');

  if (error) {
    console.error('❌ Erreur lecture BDD :', error.message);
    process.exit(1);
  }

  console.log(`🔍 ${dbIngredients.length} ingrédients en BDD à matcher.\n`);

  const matched = [];
  const notFound = [];
  const alreadyVerified = [];

  for (const ing of dbIngredients) {
    if (ing.is_verified && ing.ciqual_id) {
      alreadyVerified.push(ing);
      continue;
    }

    const match = findBestMatch(ing.name, ciqual);
    if (match) {
      matched.push({ ing, ...match });
    } else {
      notFound.push(ing);
    }
  }

  // Afficher les matchs pour vérification
  console.log(`\n━━━ MATCHS TROUVÉS (${matched.length}) ━━━\n`);
  for (const m of matched) {
    const conf = m.score >= 0.7 ? '✅' : '⚠️';
    console.log(`${conf} ${m.ing.name}`);
    console.log(`   → ${m.entry.name} (score ${(m.score * 100).toFixed(0)}%)`);
    console.log(`   kcal=${m.entry.kcal} P=${m.entry.protein}g G=${m.entry.carbs}g L=${m.entry.fat}g`);
    console.log('');
  }

  console.log(`\n━━━ NON TROUVÉS (${notFound.length}) ━━━\n`);
  for (const ing of notFound) {
    console.log(`  ✕ ${ing.name}`);
  }

  if (alreadyVerified.length > 0) {
    console.log(`\n━━━ DÉJÀ VÉRIFIÉS : ${alreadyVerified.length} (ignorés) ━━━\n`);
  }

  // Appliquer les matchs avec score >= 0.5
  const toUpdate = matched.filter((m) => m.score >= 0.5);
  if (toUpdate.length === 0) {
    console.log('\n⏭ Aucun match suffisamment fiable à appliquer.');
    return;
  }

  console.log(`\n🔄 Application de ${toUpdate.length} matchs (score >= 50%)…\n`);

  let updated = 0;
  let errors = 0;
  for (const m of toUpdate) {
    const { error: updErr } = await supabase
      .from('ingredients')
      .update({
        calories_per_100: m.entry.kcal,
        protein_per_100: m.entry.protein,
        carbs_per_100: m.entry.carbs,
        fat_per_100: m.entry.fat,
        ciqual_id: m.entry.code,
        category: m.entry.group || null,
        is_verified: true,
      })
      .eq('id', m.ing.id);

    if (updErr) {
      console.error(`  ❌ ${m.ing.name}: ${updErr.message}`);
      errors++;
    } else {
      updated++;
    }
  }

  console.log(`\n✅ Terminé : ${updated} mis à jour, ${errors} erreur(s), ${notFound.length} non trouvé(s).`);
}

main().catch((e) => {
  console.error('❌ Erreur fatale :', e);
  process.exit(1);
});
