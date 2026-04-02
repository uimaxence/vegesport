#!/usr/bin/env node
/**
 * SEO Fix — mamie-vege.fr — 02/04/2026
 * Migrations BDD + enrichissement des 5 recettes prioritaires + slugs + meta_title articles
 *
 * Usage: node scripts/seo-fix-2026-04-02.mjs
 * Requires: VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// ── Load .env ───────────────────────────────────────────────────────────────────
const envContent = readFileSync('.env', 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq > 0) process.env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Helper : exécuter du SQL via rpc (nécessite une fonction pg) ou via rest ────
// On utilise l'API REST de Supabase pour les opérations CRUD

function getSlug(title) {
  if (!title || typeof title !== 'string') return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🔧 SEO Fix — mamie-vege.fr — 02/04/2026\n');

  // ── ÉTAPE 1 : Vérifier les tables actuelles ────────────────────────────────
  console.log('1️⃣  Vérification des tables...');

  const { data: recipeSample, error: recipeErr } = await supabase
    .from('recipes')
    .select('id, title, notes, time, calories, protein')
    .limit(1);
  if (recipeErr) { console.error('❌ Erreur lecture recipes:', recipeErr.message); process.exit(1); }
  console.log('   ✅ Table recipes accessible');

  const { data: articleSample, error: articleErr } = await supabase
    .from('blog_articles')
    .select('id, title, meta_title, meta_description')
    .limit(1);
  if (articleErr) { console.error('❌ Erreur lecture blog_articles:', articleErr.message); process.exit(1); }
  console.log('   ✅ Table blog_articles accessible');

  // ── ÉTAPE 2 : Tester si les nouvelles colonnes existent déjà ───────────────
  console.log('\n2️⃣  Vérification des colonnes (test lecture)...');

  // Test si 'intro' existe sur recipes
  const { error: colTestErr } = await supabase
    .from('recipes')
    .select('intro')
    .limit(1);

  if (colTestErr) {
    console.log('   ⚠️  Colonnes manquantes sur recipes — tu dois exécuter la migration SQL.');
    console.log('   📋 Copie et exécute ce SQL dans Supabase SQL Editor :\n');
    printMigrationSQL();
    process.exit(1);
  }
  console.log('   ✅ Colonnes recipes OK (intro existe)');

  // Test blog_articles colonnes
  const { error: blogColErr } = await supabase
    .from('blog_articles')
    .select('slug')
    .limit(1);

  if (blogColErr) {
    console.log('   ⚠️  Colonne slug manquante sur blog_articles — exécute la migration SQL.');
    printMigrationSQL();
    process.exit(1);
  }
  console.log('   ✅ Colonnes blog_articles OK');

  // ── ÉTAPE 3 : Mettre à jour les 5 recettes ────────────────────────────────
  console.log('\n3️⃣  Mise à jour des 5 recettes prioritaires...');

  const recipeUpdates = getRecipeUpdates();

  for (const upd of recipeUpdates) {
    // Trouver la recette par titre (ILIKE)
    const { data: found } = await supabase
      .from('recipes')
      .select('id, title')
      .ilike('title', `%${upd.titleSearch}%`)
      .limit(1);

    if (!found || found.length === 0) {
      console.log(`   ⚠️  Recette non trouvée: "${upd.titleSearch}" — skip`);
      continue;
    }

    const recipeId = found[0].id;
    const { error: updErr } = await supabase
      .from('recipes')
      .update(upd.data)
      .eq('id', recipeId);

    if (updErr) {
      console.log(`   ❌ Erreur update "${found[0].title}":`, updErr.message);
    } else {
      console.log(`   ✅ ${found[0].title} (id=${recipeId})`);
    }
  }

  // ── ÉTAPE 4 : Générer les slugs pour toutes les recettes ───────────────────
  console.log('\n4️⃣  Génération des slugs recettes...');

  const { data: allRecipes } = await supabase
    .from('recipes')
    .select('id, title, slug');

  let slugCount = 0;
  for (const r of allRecipes) {
    if (r.slug) continue; // déjà un slug
    const slug = getSlug(r.title);
    if (!slug) continue;

    const { error: slugErr } = await supabase
      .from('recipes')
      .update({ slug })
      .eq('id', r.id);

    if (!slugErr) slugCount++;
  }
  console.log(`   ✅ ${slugCount} slugs générés pour les recettes`);

  // ── ÉTAPE 5 : Générer les slugs pour tous les articles ─────────────────────
  console.log('\n5️⃣  Génération des slugs articles...');

  const { data: allArticles } = await supabase
    .from('blog_articles')
    .select('id, title, slug');

  let artSlugCount = 0;
  for (const a of allArticles) {
    if (a.slug) continue;
    const slug = getSlug(a.title);
    if (!slug) continue;

    const { error: slugErr } = await supabase
      .from('blog_articles')
      .update({ slug })
      .eq('id', a.id);

    if (!slugErr) artSlugCount++;
  }
  console.log(`   ✅ ${artSlugCount} slugs générés pour les articles`);

  // ── ÉTAPE 6 : Corriger les meta_title articles trop longs ──────────────────
  console.log('\n6️⃣  Correction meta_title articles trop longs (>60 chars)...');

  const { data: longTitles } = await supabase
    .from('blog_articles')
    .select('id, title, meta_title');

  let fixedTitles = 0;
  for (const a of longTitles) {
    const mt = a.meta_title || '';
    if (mt.length <= 60) continue;

    // Générer un meta_title court : tronquer intelligemment + " | Mamie Végé"
    const suffix = ' | Mamie Végé';
    const maxBase = 60 - suffix.length; // 47 chars pour le titre
    let shortTitle = a.title;
    if (shortTitle.length > maxBase) {
      // Couper au dernier mot complet
      shortTitle = shortTitle.slice(0, maxBase);
      const lastSpace = shortTitle.lastIndexOf(' ');
      if (lastSpace > 20) shortTitle = shortTitle.slice(0, lastSpace);
    }
    const newMeta = shortTitle + suffix;

    const { error: fixErr } = await supabase
      .from('blog_articles')
      .update({ meta_title: newMeta })
      .eq('id', a.id);

    if (!fixErr) {
      console.log(`   ✅ [${a.id}] "${mt.slice(0, 40)}..." → "${newMeta}" (${newMeta.length} chars)`);
      fixedTitles++;
    }
  }
  if (fixedTitles === 0) console.log('   ✅ Aucun meta_title à corriger');

  // ── ÉTAPE 7 : Vérification finale ─────────────────────────────────────────
  console.log('\n7️⃣  Vérification finale...');

  const { data: verif } = await supabase
    .from('recipes')
    .select('slug, title, meta_title, intro')
    .in('slug', [
      'smoothie-vert-proteine',
      'galettes-de-quinoa-aux-legumes',
      'soupe-de-lentilles-a-la-patate-douce',
      'boules-denergie-chocolat-et-dattes',
      'curry-de-lentilles-corail',
    ]);

  if (verif && verif.length > 0) {
    for (const r of verif) {
      const introWords = r.intro ? r.intro.split(/\s+/).length : 0;
      const mtLen = r.meta_title ? r.meta_title.length : 0;
      console.log(`   ${r.slug}: intro=${introWords} mots, meta_title=${mtLen} chars`);
    }
  }

  console.log('\n✅ SEO Fix terminé !');
}

function getRecipeUpdates() {
  return [
    {
      titleSearch: 'smoothie vert',
      data: {
        slug: 'smoothie-vert-proteine',
        meta_title: 'Smoothie vert protéiné pour sportif | Mamie Végé',
        meta_description: 'Smoothie vert végétarien à 25 g de protéines : épinards, banane, protéine de pois. Prêt en 5 minutes, idéal après le sport.',
        intro: "Après une séance de sport, ton corps a besoin de protéines rapidement disponibles et de glucides pour relancer la récupération. Ce smoothie vert les réunit tous en 5 minutes : épinards pour les antioxydants et le magnésium, banane pour le potassium et les glucides rapides, protéine de pois pour les acides aminés. Le tout sans lactose, sans gluten, et avec un goût bien moins \"épinards\" qu'on ne l'imagine.",
        sport_timing: "Dans les 30 minutes après l'entraînement pour une récupération optimale. Peut aussi se consommer le matin avant une séance légère.",
        conservation: "À consommer immédiatement ou dans les 4 heures au frigo dans un contenant hermétique. Ne se congèle pas (la banane noircit).",
        variants: [
          { title: 'Version sans protéine en poudre', description: 'Remplacer la poudre de protéines par 125 g de yaourt de soja protéiné. Apport : ~15 g de protéines au lieu de 25 g.' },
          { title: 'Version tropical', description: "Remplacer la banane par 100 g de mangue congelée + 50 g d'ananas. Même apport en glucides, goût plus sucré." },
          { title: 'Version budget', description: 'Épinards surgelés (3x moins chers que frais) + banane mûre congelée à l\'avance. Résultat identique, coût divisé par 2.' },
        ],
        nutrition_per_serving: { calories: 320, proteins_g: 25, carbs_g: 38, fat_g: 6, fiber_g: 4, iron_mg: 3 },
        schema_recipe: { recipeCategory: 'Collation sportive', recipeCuisine: 'Végétarienne', keywords: 'smoothie vert protéiné, smoothie végétarien sportif, shake récupération végétalien' },
        faq_recette: [
          { question: 'Ce smoothie convient-il aux végétaliens ?', answer: "Oui, à condition d'utiliser une protéine de pois ou de chanvre (pas de whey) et un lait d'amande ou d'avoine." },
          { question: 'Peut-on préparer ce smoothie la veille ?', answer: "Pas idéalement — la banane oxyde et les épinards perdent leurs antioxydants rapidement. Préparer les ingrédients congelés en portions individuelles et mixer le matin en 2 minutes." },
          { question: 'Quelle protéine en poudre utiliser ?', answer: "La protéine de pois vanille ou neutre est la plus polyvalente : goût discret, absorption rapide, profil d'acides aminés proche de la whey." },
        ],
        image_alt: 'Smoothie vert protéiné dans un grand verre avec des épinards et une banane — recette végétarienne post-sport',
      },
    },
    {
      titleSearch: 'galette%quinoa',
      data: {
        slug: 'galettes-de-quinoa-aux-legumes',
        meta_title: 'Galettes de quinoa aux légumes | Mamie Végé',
        meta_description: 'Galettes de quinoa végétariennes riches en protéines complètes. 18 g de protéines par portion, 30 minutes, parfaites en meal prep.',
        intro: "Le quinoa est une des rares céréales à contenir tous les acides aminés essentiels — ce qui en fait une base protéique idéale pour les sportifs végétariens. Ces galettes combinent le quinoa avec des légumes de saison et des épices pour un résultat nourrissant, facilement transportable et parfait pour le repas du midi après la salle ou avant une séance en soirée. Elles se préparent en 30 minutes et se conservent 4 jours au frigo.",
        sport_timing: "Idéales en déjeuner 2 à 3 heures avant une séance de sport ou en repas post-entraînement avec une salade de légumineuses.",
        conservation: "Se conservent 4 jours au réfrigérateur dans une boîte hermétique. Se réchauffent en 3 minutes à la poêle. Congélation possible 2 mois.",
        variants: [
          { title: 'Version sans gluten', description: "Naturellement sans gluten si tu utilises de la farine de riz ou de la fécule de maïs. Vérifier que le quinoa est certifié sans gluten." },
          { title: 'Version plus protéinée', description: "Ajouter 100 g de tofu émietté dans la préparation. Apport protéique passe de 18 g à environ 26 g par portion." },
          { title: 'Version budget', description: "Remplacer le quinoa par 50% quinoa / 50% millet (deux fois moins cher). L'association avec des légumineuses compense." },
        ],
        nutrition_per_serving: { calories: 310, proteins_g: 18, carbs_g: 42, fat_g: 8, fiber_g: 5, iron_mg: 4 },
        schema_recipe: { recipeCategory: 'Plat principal', recipeCuisine: 'Végétarienne', keywords: 'galettes quinoa végétariennes, galettes protéinées sans viande, recette quinoa sportif' },
        faq_recette: [
          { question: 'Peut-on congeler les galettes de quinoa ?', answer: "Oui. Disposer en une seule couche sur une plaque, congeler 2 heures, puis transférer dans un sac congélation. Conservation 2 mois." },
          { question: 'Comment éviter que les galettes se défassent ?', answer: "Bien cuire le quinoa (légèrement collant), utiliser 1 à 2 c. à s. de fécule de maïs, et ne pas retourner avant que la première face soit bien dorée (~4 min)." },
        ],
        image_alt: 'Galettes de quinoa dorées aux légumes dans une poêle — recette végétarienne protéinée',
      },
    },
    {
      titleSearch: 'soupe%lentilles%patate',
      data: {
        slug: 'soupe-de-lentilles-a-la-patate-douce',
        meta_title: 'Soupe lentilles patate douce végétarienne | Mamie Végé',
        meta_description: 'Soupe végétarienne lentilles et patate douce : 18 g de protéines, riche en fer et bêta-carotène. Recette express 30 min.',
        intro: "La soupe de lentilles à la patate douce est le plat de récupération hivernal par excellence. Les lentilles corail cuisent sans trempage en 20 minutes et fondent dans la sauce. La patate douce fournit des glucides complexes et du potassium, deux nutriments essentiels après une séance d'endurance. Pour les coureurs végétariens, cette soupe est particulièrement intéressante : un filet de citron au moment de servir multiplie l'absorption du fer végétal par 3 à 4.",
        sport_timing: "Idéale en dîner de récupération après une séance de sport ou une longue sortie. Réconfortante et facile à digérer le soir.",
        conservation: "Se conserve 5 jours au réfrigérateur. Congélation possible 3 mois en portions individuelles. Ajouter un filet de citron frais au réchauffage.",
        variants: [
          { title: 'Version plus protéinée', description: "Ajouter 100 g de tofu soyeux mixé en fin de cuisson. Apport protéique monte à ~24 g par portion." },
          { title: 'Version épicée', description: "Ajouter 1 c. à c. de harissa ou de piment de Cayenne. Parfait pour les soirées froides." },
          { title: 'Version budget', description: "Remplacer la patate douce par de la courge butternut en saison (3x moins chère). Valeurs nutritionnelles proches." },
        ],
        nutrition_per_serving: { calories: 290, proteins_g: 18, carbs_g: 48, fat_g: 4, fiber_g: 8, iron_mg: 5 },
        schema_recipe: { recipeCategory: 'Soupe', recipeCuisine: 'Végétarienne', keywords: 'soupe lentilles patate douce végétarienne, soupe protéinée végé, recette lentilles corail sportif' },
        faq_recette: [
          { question: 'Les lentilles corail ont-elles besoin de tremper ?', answer: "Non — elles cuisent directement en 15 à 20 minutes sans trempage. Elles fondent dans la soupe pour une texture veloutée naturelle." },
          { question: "Comment maximiser l'absorption du fer ?", answer: "Ajouter un filet de jus de citron frais au service. La vitamine C multiplie l'absorption du fer non héminique par 3 à 4. Éviter thé ou café dans l'heure qui suit." },
        ],
        image_alt: 'Soupe de lentilles corail et patate douce dans un bol avec un filet de citron — recette végétarienne',
      },
    },
    {
      titleSearch: 'boule%nergie%chocolat',
      data: {
        slug: 'boules-denergie-chocolat-et-dattes',
        meta_title: 'Boules énergie chocolat dattes maison | Mamie Végé',
        meta_description: 'Boules énergie maison chocolat et dattes : collation sportive végétarienne sans cuisson, prête en 15 min. 220 kcal et 8 g de protéines.',
        intro: "Les boules d'énergie (energy balls) sont la collation sportive idéale pour les végétariens : aucune cuisson, ingrédients simples, se transportent partout et se préparent en batch pour toute la semaine. Cette version chocolat-dattes combine les sucres naturels des dattes, les flocons d'avoine, le cacao non sucré et le beurre de cacahuète. À consommer avant le sport pour l'énergie, ou après pour la récupération.",
        sport_timing: "Avant l'entraînement : 2 à 3 balls, 30 à 60 minutes avant la séance. Après l'entraînement : 3 balls avec un yaourt de soja pour compléter l'apport protéique.",
        conservation: "Se conservent 7 jours au réfrigérateur dans une boîte hermétique. Congélation possible 2 mois — sortir 30 minutes avant consommation.",
        variants: [
          { title: 'Version sans noix (allergie)', description: 'Remplacer le beurre de cacahuète par de la purée de graines de tournesol ou du tahini.' },
          { title: 'Version plus protéinée', description: "Ajouter 20 g de protéine de pois chocolat. Apport passe de 8 g à environ 15 g de protéines pour 3 balls." },
          { title: 'Version pois chiches', description: "Ajouter 100 g de pois chiches rincés dans le mixeur. Indétectables au goût, ils doublent l'apport protéique et en fibres." },
        ],
        nutrition_per_serving: { calories: 220, proteins_g: 8, carbs_g: 28, fat_g: 9, fiber_g: 4, iron_mg: 2 },
        schema_recipe: { recipeCategory: 'Collation sportive', recipeCuisine: 'Végétarienne', keywords: 'boules énergie maison, energy balls végétariens, collation sport végé, balls chocolat dattes' },
        faq_recette: [
          { question: 'Les boules énergie conviennent-elles avant le crossfit ?', answer: "Oui — 2 à 3 balls, 45 à 60 minutes avant la séance. Elles apportent 20 à 30 g de glucides naturels sans surcharger l'estomac." },
          { question: 'Peut-on faire ces boules énergie sans mixeur ?', answer: "Oui si les dattes sont très molles (variété Medjool). Les écraser à la fourchette et bien pétrir à la main 3 à 4 minutes." },
        ],
        image_alt: "Boules énergie chocolat et dattes maison sur une assiette — collation végétarienne pour sportifs",
      },
    },
    {
      titleSearch: 'curry%lentilles%corail',
      data: {
        slug: 'curry-de-lentilles-corail',
        meta_title: 'Curry de lentilles corail végétarien | Mamie Végé',
        meta_description: 'Curry de lentilles corail végétarien : 22 g de protéines, 25 min, moins de 2 € par portion. La recette protéinée végé ultime.',
        intro: "Le curry de lentilles corail (aussi appelé dhal) est probablement la recette végétarienne protéinée la plus efficace rapport temps/coût/nutrition. Les lentilles corail cuisent sans trempage en 15 à 20 minutes et fondent dans la sauce, créant une texture crémeuse naturellement. Associer ce curry avec du riz complet donne un profil d'acides aminés complet — tout ce dont un sportif végétarien a besoin dans un seul plat.",
        sport_timing: "Excellent repas post-entraînement le soir : riches en protéines et glucides pour la récupération. Peut aussi être préparé la veille pour le déjeuner du lendemain.",
        conservation: "Se conserve 5 jours au réfrigérateur. Congélation possible 3 mois en portions individuelles. Se bonifie avec le temps — les épices s'infusent davantage le lendemain.",
        variants: [
          { title: 'Version plus riche en protéines', description: "Ajouter 150 g de tofu ferme émietté en début de cuisson. Apport protéique passe de 22 g à environ 32 g par portion." },
          { title: 'Version sans lait de coco', description: 'Remplacer par la même quantité de lait de soja non sucré. Moins de graisses saturées.' },
          { title: 'Version légumes du marché', description: 'Ajouter des épinards, du chou-fleur ou des petits pois en fin de cuisson (5 dernières minutes).' },
        ],
        nutrition_per_serving: { calories: 380, proteins_g: 22, carbs_g: 52, fat_g: 8, fiber_g: 10, iron_mg: 6 },
        schema_recipe: { recipeCategory: 'Plat principal', recipeCuisine: 'Végétarienne', keywords: 'curry lentilles corail végétarien, dhal végétarien protéiné, recette lentilles corail sportif' },
        faq_recette: [
          { question: 'Peut-on préparer ce curry en grande quantité pour la semaine ?', answer: "C'est recommandé. Multiplier les quantités × 3 ou × 4. Le curry se conserve 5 jours au frigo et se congèle parfaitement en portions individuelles." },
          { question: 'Le curry de lentilles convient-il avant une compétition ?', answer: "Pas idéalement la veille — les lentilles sont riches en fibres et peuvent provoquer des ballonnements. Préférer des glucides moins fibreux la veille d'une compétition." },
        ],
        image_alt: 'Curry de lentilles corail dans un bol avec du riz complet — recette végétarienne protéinée',
      },
    },
  ];
}

function printMigrationSQL() {
  console.log(`
-- ═══════════════════════════════════════════════════════════════════
-- Migration SEO — mamie-vege.fr — 02/04/2026
-- Exécuter dans Supabase SQL Editor (https://supabase.com/dashboard)
-- ═══════════════════════════════════════════════════════════════════

-- Migration 1 — Table blog_articles (ajouter 3 colonnes)
ALTER TABLE blog_articles
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS image_alt TEXT,
  ADD COLUMN IF NOT EXISTS updated_date DATE;

-- Migration 2 — Table recipes (ajouter 10 colonnes)
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS intro TEXT,
  ADD COLUMN IF NOT EXISTS image_alt TEXT,
  ADD COLUMN IF NOT EXISTS sport_timing TEXT,
  ADD COLUMN IF NOT EXISTS conservation TEXT,
  ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS nutrition_per_serving JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS schema_recipe JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS faq_recette JSONB DEFAULT '[]'::jsonb;

-- ═══════════════════════════════════════════════════════════════════
-- Après avoir exécuté ce SQL, relance le script :
--   node scripts/seo-fix-2026-04-02.mjs
-- ═══════════════════════════════════════════════════════════════════
`);
}

main().catch((err) => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});
