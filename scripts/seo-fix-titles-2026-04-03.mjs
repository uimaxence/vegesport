#!/usr/bin/env node
/**
 * SEO Fix — Raccourcir les <title> > 60 chars
 *
 * Le suffix est " | et si mamie était végé ?" (28 chars).
 * → meta_title doit faire ≤ 32 chars pour que le <title> total ≤ 60.
 *
 * Corrige aussi les meta_title qui contiennent déjà "| Mamie Végé"
 * (double suffix dans le rendu final).
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env', 'utf8');
for (const line of envContent.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq > 0) process.env[t.slice(0, eq)] = t.slice(eq + 1);
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SITE_NAME = 'et si mamie était végé ?';
const SUFFIX = ` | ${SITE_NAME}`; // 28 chars
const MAX_FULL = 60;
const MAX_META = MAX_FULL - SUFFIX.length; // 32 chars

// Mapping slug → short meta_title (≤ 32 chars)
const SHORT_TITLES = {
  // ── Doubles suffixes à corriger (avaient "| Mamie Végé") ──
  'shake-recuperation-banane-beurre-de-cacahuete': 'Shake récup banane cacahuète',
  'houmous-proteine-maison': 'Houmous protéiné maison',
  'bol-acai-proteine': 'Bowl açaï protéiné sportif',
  'soupe-de-lentilles-a-la-patate-douce': 'Soupe lentilles patate douce',
  'wrap-au-tofu-grille-houmous': 'Wrap tofu grillé houmous',
  'boules-denergie-chocolat-et-dattes': 'Boules énergie chocolat dattes',
  'curry-de-lentilles-corail': 'Curry lentilles corail végé',
  'porridge-proteine-aux-fruits-rouges': 'Porridge protéiné fruits rouges',
  'smoothie-vert-proteine': 'Smoothie vert protéiné',
  'galettes-proteinees-au-sarrasin': 'Galettes protéinées sarrasin',
  'galettes-de-quinoa-aux-legumes': 'Galettes quinoa aux légumes',

  // ── Titres longs sans meta_title ──
  'bowl-express-5-minutes-pois-chiches-en-boite-avocat-et-graines': 'Bowl express pois chiches 5 min',
  'salade-lentilles-vertes-poivron-rouge-et-citron-post-running': 'Salade lentilles post-running',
  'galettes-haricots-blancs-proteinees-pour-sportifs-presses': 'Galettes haricots blancs',
  'tofu-croustillant-au-four-5-ingredients-pour-debutants': 'Tofu croustillant au four',
  'bowl-recuperation-express-pois-chiches-riz-et-epinards': 'Bowl récup pois chiches riz',
  'bowl-lentilles-quinoa-tofu-proteine-pour-sportifs-vege': 'Bowl lentilles quinoa tofu',
  'energy-balls-pois-chiches-cacao-10-min-sans-cuisson': 'Energy balls pois chiches cacao',
  'bol-petit-dej-proteine-avoine-tofu-pour-demarrer-fort': 'Bol petit-déj protéiné avoine',
  'chili-sin-carne-proteine-pour-coureurs-et-cyclistes': 'Chili sin carne protéiné végé',
  'curry-pois-chiches-rapide-pour-prise-de-muscle-vege': 'Curry pois chiches rapide végé',
  'tartines-express-beurre-d-amande-banane-et-graines': 'Tartines beurre amande banane',
  'pancakes-vegetariens-proteines-a-la-farine-complete': 'Pancakes protéinés végétariens',
  'overnight-oats-proteines-a-preparer-la-veille': 'Overnight oats protéinés',
  'porridge-proteine-pre-sortie-running-ou-velo': 'Porridge protéiné pré-running',
  'barres-energetiques-vege-pour-l-entrainement': 'Barres énergétiques végé',
  'smoothie-proteine-soir-pour-recup-musculaire': 'Smoothie protéiné récup soir',
  'curry-de-pois-chiches-au-lait-de-coco-leger': 'Curry pois chiches coco léger',
  'galettes-haricots-blancs-flocons-d-avoine': 'Galettes haricots blancs avoine',
  'wraps-houmous-tofu-pour-midi-sportif-rapide': 'Wraps houmous tofu express',
  'riz-saute-express-aux-lentilles-et-carottes': 'Riz sauté lentilles carottes',
  'salade-riz-pois-chiches-version-vege': 'Salade riz pois chiches végé',
  'hachis-parmentier-vegetarien-facon-mamie': 'Hachis parmentier végétarien',
  'dhal-de-lentilles-corail-au-lait-de-coco': 'Dhal lentilles corail coco',
  'bowl-riz-complet-pois-chiches-legumes': 'Bowl riz pois chiches légumes',
  'salade-de-pois-chiches-mediterraneenne': 'Salade pois chiches méditerranée',
  'pates-completes-sauce-lentilles-corail': 'Pâtes sauce lentilles corail',
  'gnocchis-patate-douce-epinards-tofu': 'Gnocchis patate douce tofu',
  'soupe-de-legumes-aux-lentilles-corail': 'Soupe légumes lentilles corail',
  'riz-complet-patate-douce-lentilles': 'Riz patate douce lentilles',
  'fajitas-vege-quinoa-haricots-rouges': 'Fajitas végé quinoa haricots',
  'poelee-pois-chiches-epinards-express': 'Poêlée pois chiches épinards',
  'bowl-lentilles-quinoa-tofu-marine': 'Bowl lentilles quinoa mariné',
  'soupe-potimarron-lentilles-corail': 'Soupe potimarron lentilles',
  'bowl-lentilles-patate-douce-tofu': 'Bowl lentilles patate douce',
  'poelee-de-legumes-et-tofu-facon-wok': 'Poêlée légumes tofu wok',
  'salade-boulgour-pois-chiches-citron': 'Salade boulgour pois chiches',
  'porridge-de-nuit-version-tropicale': 'Porridge de nuit tropical',
  'pates-completes-sauce-pois-chiches': 'Pâtes sauce pois chiches',
  'creme-dessert-chocolat-tofu-soyeux': 'Crème chocolat tofu soyeux',
};

async function main() {
  console.log('🔧 SEO Fix — Raccourcir les <title> > 60 chars\n');

  // Vérification : tous les meta_title ≤ 32 chars ?
  let hasError = false;
  for (const [slug, mt] of Object.entries(SHORT_TITLES)) {
    const fullLen = (mt + SUFFIX).length;
    if (fullLen > MAX_FULL) {
      console.log(`   ❌ TROP LONG: ${slug} → "${mt}" (${mt.length}ch, full=${fullLen}ch)`);
      hasError = true;
    }
  }
  if (hasError) {
    console.log('\n❌ Des meta_title dépassent la limite. Corrige-les avant d\'exécuter.');
    process.exit(1);
  }

  // Vérifier l'état actuel en base
  console.log('── État actuel en base ──\n');
  const { data: recipes } = await supabase
    .from('recipes')
    .select('slug, title, meta_title');

  const slugMap = Object.fromEntries(recipes.map(r => [r.slug, r]));
  let missing = 0;

  for (const slug of Object.keys(SHORT_TITLES)) {
    const r = slugMap[slug];
    if (!r) {
      console.log(`   ⚠️  Slug introuvable: ${slug}`);
      missing++;
      continue;
    }
    const current = r.meta_title || '(null → title: ' + r.title + ')';
    console.log(`   ${slug}: ${current}`);
  }

  if (missing > 0) {
    console.log(`\n⚠️  ${missing} slug(s) introuvable(s). Vérifie les slugs.`);
  }

  // Exécuter les mises à jour
  console.log('\n── Mise à jour ──\n');
  let ok = 0, fail = 0;

  for (const [slug, newTitle] of Object.entries(SHORT_TITLES)) {
    if (!slugMap[slug]) continue;

    const { error } = await supabase
      .from('recipes')
      .update({ meta_title: newTitle })
      .eq('slug', slug);

    if (error) {
      console.log(`   ❌ ${slug}: ${error.message}`);
      fail++;
    } else {
      const fullLen = (newTitle + SUFFIX).length;
      console.log(`   ✅ ${slug} → "${newTitle}" (${fullLen}ch)`);
      ok++;
    }
  }

  // Vérification finale
  console.log('\n── Vérification finale ──\n');
  const { data: all } = await supabase
    .from('recipes')
    .select('slug, title, meta_title');

  const stillLong = all.filter(r => {
    const base = r.meta_title || r.title;
    const full = base.includes(SITE_NAME) ? base : base + SUFFIX;
    return full.length > MAX_FULL;
  });

  if (stillLong.length === 0) {
    console.log('   ✅ Tous les <title> sont ≤ 60 chars');
  } else {
    console.log(`   ⚠️  ${stillLong.length} recette(s) encore > 60 chars:`);
    for (const r of stillLong) {
      const base = r.meta_title || r.title;
      const full = base + SUFFIX;
      console.log(`     ${full.length}ch | ${r.slug} | ${base}`);
    }
  }

  console.log(`\n✅ Terminé: ${ok} mises à jour, ${fail} erreur(s)`);
}

main().catch(console.error);
