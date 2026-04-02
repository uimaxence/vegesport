#!/usr/bin/env node
/**
 * SEO Fix 3 — mamie-vege.fr — 02/04/2026
 * Enrichissement des 3 recettes sous-optimisées :
 *   - bol-acai-proteine
 *   - shake-recuperation-banane-beurre-de-cacahuete
 *   - houmous-proteine-maison
 *
 * Colonnes inexistantes en BDD (supprimées du rapport) :
 *   total_time, related_article_ids, updated_date
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

async function updateRecipe(titleSearch, data) {
  const { data: found } = await supabase
    .from('recipes')
    .select('id, title, slug')
    .ilike('title', `%${titleSearch}%`)
    .limit(1);

  if (!found?.length) {
    console.log(`   ⚠️  Non trouvée: "${titleSearch}"`);
    return;
  }

  const { error } = await supabase
    .from('recipes')
    .update(data)
    .eq('id', found[0].id);

  if (error) console.log(`   ❌ ${found[0].title}:`, error.message);
  else console.log(`   ✅ ${found[0].title} (id=${found[0].id})`);
}

async function main() {
  console.log('🔧 SEO Fix 3 — mamie-vege.fr\n');

  // ── TÂCHE 1 — Vérification des fixes précédents ─────────────────────────
  console.log('1️⃣  Vérification fixes rapports 1 et 2...');

  // Vérifier porridge meta_title
  const { data: porridge } = await supabase
    .from('recipes')
    .select('slug, meta_title')
    .eq('slug', 'porridge-proteine-aux-fruits-rouges')
    .limit(1);

  if (porridge?.length) {
    const mt = porridge[0].meta_title || '';
    if (mt.length <= 60) {
      console.log(`   ✅ Porridge meta_title OK (${mt.length} chars): "${mt}"`);
    } else {
      console.log(`   ⚠️  Porridge meta_title trop long (${mt.length} chars), correction...`);
      await supabase
        .from('recipes')
        .update({ meta_title: 'Porridge protéiné aux fruits rouges | Mamie Végé' })
        .eq('slug', 'porridge-proteine-aux-fruits-rouges');
    }
  }

  // Note: /blog, /recettes, /planning meta titles are hardcoded in React components, not in DB.
  // Already verified: Blog.jsx (51 chars), Recipes.jsx (60 chars), PlanningFunnel.jsx (47 chars). ✅

  // ── TÂCHE 2 — Enrichir bol-acai-proteine ─────────────────────────────────
  console.log('\n2️⃣  Enrichir bol-acai-proteine...');
  await updateRecipe('acai', {
    slug: 'bol-acai-proteine',
    meta_title: 'Bowl açaï protéiné pour sportif végétarien | Mamie Végé',
    meta_description: 'Bowl açaï protéiné végétarien : 27 g de protéines, riche en antioxydants et oméga-9. Petit-déjeuner ou récupération post-sport en 10 minutes.',
    intro: "L'açaï est souvent présenté comme un superaliment protéiné — mais la vérité nutritionnelle est plus nuancée. La pulpe d'açaï apporte en réalité seulement 1,1 g de protéines pour 100 g (données producteur Nossa, référencées dans OpenFoodFacts sur base Ciqual), mais elle est exceptionnellement riche en anthocyanes, des antioxydants qui réduisent le stress oxydatif post-effort, et en acides gras mono-insaturés (oméga-9, similaires à l'huile d'olive). Ce bowl devient protéiné grâce à l'ajout de protéine de pois vanille (20 à 22 g de protéines par dose de 25 g) ou de yaourt de soja protéiné. L'açaï joue son rôle d'antioxydant et de goût — les protéines viennent des toppings. La banane apporte 28 g de glucides à IG modéré (55) et 422 mg de potassium pour récupérer des pertes par transpiration. Le résultat est un bowl post-effort complet, coloré et savoureux : 27 g de protéines, des antioxydants pour la récupération et des glucides pour recharger le glycogène.",
    sport_timing: "Idéal en petit-déjeuner avant une séance légère (2 à 3 heures avant) ou en récupération dans l'heure après un entraînement. Les glucides naturels de la banane et du granola relancent la resynthèse du glycogène ; les protéines démarrent la réparation musculaire.",
    conservation: "Le bowl açaï s'assemble juste avant de manger — il ne se conserve pas assemblé (le granola ramollit et les fruits s'oxydent). La pulpe açaï congelée se conserve 6 mois au congélateur. Préparer les toppings à l'avance (granola maison, fruits découpés) pour assembler en 3 minutes.",
    variants: [
      { title: 'Version sans protéine en poudre', description: "Remplacer la protéine de pois par 200 g de yaourt de soja protéiné (type Alpro Protein : 10 g de protéines/125 g) mixé avec la pulpe açaï. Apport protéique réduit à ~14-16 g par bowl, mais texture plus crémeuse et zéro poudre." },
      { title: 'Version budget', description: "La pulpe d'açaï congelée coûte 3 à 5 € pour 4 portions (soit 0,75 à 1,25 € par bowl). Pour réduire encore le coût, utiliser 50 g de purée d'açaï + 50 g de myrtilles surgelées (effets antioxydants similaires, coût divisé par 2). Les myrtilles contiennent également des anthocyanes, les mêmes molécules antioxydantes." },
      { title: 'Version énergie extra avant sortie longue', description: "Doubler la portion de granola (60 g au lieu de 30 g) et ajouter 1 c. à s. de beurre d'amande. Apport glucidique passe à ~80 g — suffisant pour une sortie longue de 2h+. Consommer 2 à 3 heures avant l'effort." },
    ],
    nutrition_per_serving: { calories: 430, proteins_g: 27, carbs_g: 64, fat_g: 12, fiber_g: 6, iron_mg: 3 },
    schema_recipe: { recipeCategory: 'Petit-déjeuner sportif', recipeCuisine: 'Végétarienne', keywords: 'bowl açaï protéiné végétarien, acai bowl sportif, petit déjeuner açaï protéines végétales, bowl récupération végé' },
    faq_recette: [
      { question: "L'açaï est-il vraiment riche en protéines ?", answer: "Non — c'est l'idée reçue la plus répandue sur l'açaï. La pulpe d'açaï ne contient que 1,1 g de protéines pour 100 g. Ce bowl est protéiné grâce à l'ajout de protéine de pois ou de yaourt de soja protéiné. L'açaï apporte en revanche des antioxydants (anthocyanes) et des acides gras mono-insaturés bénéfiques pour la récupération et la santé cardiovasculaire." },
      { question: "Où trouver de la pulpe d'açaï en France ?", answer: "La pulpe d'açaï congelée se trouve dans la plupart des magasins bio (Biocoop, La Vie Claire, Naturalia) et de plus en plus en grandes surfaces (rayon surgelés ou produits exotiques). En ligne, les marques Nossa et Ögonblick sont bien distribuées. La poudre d'açaï lyophilisée, disponible en pharmacie et sur Amazon, est une alternative pratique et plus économique à l'usage ponctuel." },
      { question: 'Peut-on préparer ce bowl la veille ?', answer: "Pas le bowl assemblé — le granola ramollit et les fruits s'oxydent. En revanche, tu peux préparer la base açaï la veille (pulpe mixée avec la protéine et le lait végétal) et la conserver au congélateur dans un moule à glaçons. Le matin, sortir, laisser décongeler 5 minutes et assembler les toppings frais en 3 minutes." },
    ],
    image_alt: 'Bowl açaï protéiné violet avec granola, banane et fruits rouges — petit-déjeuner végétarien sportif',
  });

  // ── TÂCHE 3 — Enrichir shake-recuperation-banane-beurre-de-cacahuete ─────
  console.log('\n3️⃣  Enrichir shake-recuperation-banane-beurre-de-cacahuete...');
  await updateRecipe('shake%recuperation%banane', {
    slug: 'shake-recuperation-banane-beurre-de-cacahuete',
    meta_title: 'Shake récupération banane beurre cacahuète végé | Mamie Végé',
    meta_description: "Shake de récupération végétarien banane et beurre de cacahuète : 30 g de protéines, prêt en 3 minutes. Idéal dans les 30 minutes après l'entraînement.",
    intro: "Dans les 30 minutes après une séance de sport, ton corps est particulièrement réceptif aux protéines et aux glucides. C'est la fenêtre de récupération : la synthèse protéique musculaire est à son pic, et les réserves de glycogène absorbent les glucides avec une efficacité maximale. Ce shake réunit les deux en 3 minutes. La banane apporte 28 g de glucides à IG modéré (55) et 422 mg de potassium pour compenser les pertes minérales par transpiration. La protéine de pois (absorption rapide, profil en leucine de 8 g pour 100 g de protéine) déclenche la synthèse protéique musculaire. Le beurre de cacahuète complète avec 5 à 6 g de protéines supplémentaires et des graisses insaturées (oméga-9) qui prolongent la satiété sans ralentir l'absorption des protéines à cette faible quantité. Le lait d'avoine ajoute des glucides supplémentaires et fluidifie la texture. Résultat : 30 g de protéines et 51 g de glucides — la collation post-effort la plus efficace du blog, avec seulement 3 ingrédients principaux.",
    sport_timing: "Dans les 30 minutes après la fin de l'entraînement — c'est le moment optimal. Si le repas suivant est prévu dans moins de 2 heures, ce shake peut remplacer la collation post-sport. Si le repas est dans plus de 2 heures, boire le shake dans les 30 minutes puis manger normalement à l'heure prévue.",
    conservation: "À consommer immédiatement après préparation. Le shake peut être conservé 4 heures au réfrigérateur dans un contenant hermétique — secouer avant de boire car les ingrédients se séparent. Ne pas congeler (la banane noircit et la texture change). Préparer les ingrédients à l'avance (banane épluchée congelée, beurre de cacahuète en pot) pour assembler en 2 minutes dès la sortie de la salle.",
    variants: [
      { title: 'Version sans protéine en poudre', description: "Remplacer la protéine de pois par 200 g de yaourt de soja protéiné (10 g de protéines/125 g). Apport protéique passe de 30 g à ~17-18 g. Texture plus épaisse et crémeuse, zéro poudre. Idéal pour ceux qui préfèrent éviter les suppléments." },
      { title: 'Version prise de masse (+ calories)', description: "Doubler la portion de beurre de cacahuète (3 c. à s. au lieu de 1,5) et ajouter 30 g de flocons d'avoine. Apport passe à ~38 g de protéines et ~75 g de glucides, soit ~620 kcal. Parfait en phase de prise de masse musculaire après une séance de force intensive." },
      { title: 'Version sans mixer (shaker de sport)', description: "Si tu n'as pas de mixeur à portée : écraser la banane mûre à la fourchette dans le shaker, ajouter la protéine en poudre, le beurre de cacahuète et le lait. Fermer et secouer 20 fois vigoureusement. La texture sera moins lisse mais tous les nutriments sont présents." },
    ],
    nutrition_per_serving: { calories: 430, proteins_g: 30, carbs_g: 51, fat_g: 12, fiber_g: 4, iron_mg: 2 },
    schema_recipe: { recipeCategory: 'Collation sportive', recipeCuisine: 'Végétarienne', keywords: 'shake récupération végétarien banane, shake protéiné post-sport végé, smoothie récupération musculaire végétarien, shake banane beurre cacahuète sportif' },
    faq_recette: [
      { question: 'Combien de temps après le sport faut-il boire ce shake ?', answer: "Dans les 30 minutes après la fin de la séance. C'est la fenêtre de récupération optimale : les muscles sont alors particulièrement réceptifs aux protéines (pour la réparation musculaire) et aux glucides (pour la resynthèse du glycogène). Si tu n'as pas de mixeur accessible immédiatement, une banane seule mangée dans les 15 minutes après l'effort est déjà bénéfique en attendant un repas complet." },
      { question: "Peut-on utiliser du beurre d'amande ou d'autres purées d'oléagineux à la place du beurre de cacahuète ?", answer: "Oui. Le beurre d'amande apporte des profils nutritionnels similaires : 21 g de protéines/100 g, bonnes graisses mono-insaturées et calcium végétal (270 mg/100 g selon Ciqual ANSES). Le beurre de noix de cajou est plus doux en goût. Dans tous les cas, choisir une version avec un seul ingrédient (purée 100% oléagineux, sans sucre ni huile de palme ajoutés) pour maximiser la qualité nutritionnelle." },
      { question: 'Ce shake est-il adapté avant le sport aussi ?', answer: "Oui, mais avec un timing différent. Avant une séance, consommer ce shake 90 à 120 minutes avant l'effort (pas moins, car les graisses du beurre de cacahuète ralentissent la digestion). La quantité de beurre de cacahuète peut être réduite à 1 c. à s. pour alléger la digestion. L'objectif pré-sport est d'arriver avec l'estomac confortable et les réserves de glycogène bien chargées." },
    ],
    image_alt: 'Shake de récupération banane et beurre de cacahuète dans un verre — collation post-sport végétarienne',
  });

  // ── TÂCHE 4 — Enrichir houmous-proteine-maison ───────────────────────────
  console.log('\n4️⃣  Enrichir houmous-proteine-maison...');
  await updateRecipe('houmous%maison', {
    slug: 'houmous-proteine-maison',
    meta_title: 'Houmous protéiné maison pour sportifs végétariens | Mamie Végé',
    meta_description: 'Houmous protéiné maison : 8 g de protéines pour 100 g, riche en fibres et calcium végétal. Collation végétarienne idéale avant ou après le sport en 10 minutes.',
    intro: "Le houmous maison n'est pas une recette sophistiquée — c'est la collation végétarienne la plus simple et la plus complète pour les sportifs. 10 minutes, 5 ingrédients, et tu obtiens une source de protéines végétales prête pour toute la semaine. La combinaison pois chiches + tahini est particulièrement intéressante nutritionnellement : les pois chiches sont riches en lysine (un acide aminé essentiel souvent déficitaire dans les céréales), le tahini (purée de sésame) apporte la méthionine. Ensemble, ils forment un profil d'acides aminés plus complet que l'un ou l'autre pris séparément. Le houmous maison apporte environ 7,9 à 8 g de protéines pour 100 g (données Ciqual ANSES), 6 g de fibres pour une satiété durable, et un index glycémique extrêmement bas (6 à 10) — ce qui en fait une collation idéale entre les repas pour maintenir l'énergie sans pic insulinique. Le tahini ajoute 420 mg de calcium pour 100 g (Ciqual ANSES) — le calcium végétal le mieux concentré avec les amandes. Et le citron du houmous, présent dans toutes les recettes traditionnelles, amplifie l'absorption du fer des pois chiches par 3 à 4 selon l'ANSES.",
    sport_timing: "Collation à n'importe quel moment de la journée sportive : à emporter avec des crudités ou du pain complet comme snack pré-séance (1 à 2 heures avant), ou en collation post-sport avec des pitas pour les glucides. Le houmous ne se mange pas seul — associe-le à des glucides (pain complet, galettes de riz, crudités) pour un repas complet.",
    conservation: "Se conserve 5 à 7 jours au réfrigérateur dans un contenant hermétique. Verser un filet d'huile d'olive sur le dessus prolonge la conservation et évite le dessèchement. Ne pas congeler (la texture devient granuleuse à la décongélation). Préparer 400 à 500 g en une fois le dimanche — tient toute la semaine pour les collations quotidiennes.",
    variants: [
      { title: 'Version encore plus protéinée (avec tofu soyeux)', description: "Remplacer 100 g de pois chiches par 100 g de tofu soyeux mixé. La texture devient plus crémeuse et l'apport protéique passe de 8 g à environ 11-12 g pour 100 g. Le goût reste identique — le tofu soyeux est indétectable dans le houmous. Idéal pour les sportifs en phase de musculation." },
      { title: 'Version pimentée (récupération anti-inflammatoire)', description: "Ajouter 1 c. à c. de curcuma + ½ c. à c. de poivre noir dans le mixeur. Le curcuma a des propriétés anti-inflammatoires documentées, le poivre noir (pipérine) augmente son absorption de 2000% selon les données disponibles. Cette version est particulièrement pertinente en récupération après une séance intense." },
      { title: 'Version betterave (fer + antioxydants)', description: "Ajouter 100 g de betterave cuite dans le mixeur. La betterave apporte 0,8 mg de fer supplémentaire pour 100 g et des nitrates naturels associés à l'amélioration de la performance en endurance dans les études récentes. Le houmous prend une couleur rose vive et un goût légèrement sucré." },
    ],
    nutrition_per_serving: { calories: 170, proteins_g: 8, carbs_g: 14, fat_g: 9, fiber_g: 6, iron_mg: 3 },
    schema_recipe: { recipeCategory: 'Collation sportive', recipeCuisine: 'Végétarienne', keywords: 'houmous maison protéiné végétarien, houmous sportif fait maison, recette houmous pois chiches sportif, houmous végétalien protéines' },
    faq_recette: [
      { question: 'Le houmous maison est-il vraiment plus nutritif que celui du commerce ?', answer: "Le houmous maison bien préparé (70-75% pois chiches, 12-15% tahini) est nutritionnellement supérieur à la plupart des houmous industriels, qui contiennent en moyenne seulement 52% de pois chiches selon une analyse de Test Achats. Plus de pois chiches = plus de protéines et de fibres. Il est aussi moins salé et sans conservateurs ni additifs. Le coût est 2 à 3 fois inférieur pour une qualité nutritionnelle supérieure." },
      { question: 'Faut-il utiliser des pois chiches secs ou en boîte pour le houmous ?', answer: "Les deux fonctionnent. Les pois chiches en boîte (déjà cuits) sont plus pratiques : rincer, égoutter, mixer directement. Les secs (trempés 12h + cuits 1h30) donnent une texture plus onctueuse et un goût légèrement plus prononcé. Nutritionnellement, la teneur en protéines et en fibres est identique après cuisson. Pour un houmous quotidien pratique, la boîte est imbattable." },
      { question: "Quel est l'index glycémique du houmous ?", answer: "L'index glycémique du houmous est extrêmement bas, estimé entre 6 et 10 selon les données disponibles — l'un des plus bas parmi tous les aliments. Cela signifie que le houmous n'entraîne pratiquement pas de réponse insulinique et fournit une énergie très stable sur la durée. C'est particulièrement utile comme collation pré-sport pour maintenir la glycémie stable jusqu'à la séance, ou entre les repas pour éviter les fringales." },
    ],
    image_alt: "Houmous protéiné maison dans un bol avec un filet d'huile d'olive et du paprika — recette végétarienne sportive",
  });

  // ── TÂCHE 5 — Vérifications ──────────────────────────────────────────────
  console.log('\n5️⃣  Vérifications post-update...');

  const { data: verif } = await supabase
    .from('recipes')
    .select('slug, title, meta_title, intro, faq_recette, variants, nutrition_per_serving, sport_timing, conservation, image_alt, schema_recipe')
    .in('slug', [
      'bol-acai-proteine',
      'shake-recuperation-banane-beurre-de-cacahuete',
      'houmous-proteine-maison',
    ]);

  for (const r of verif || []) {
    const introWords = r.intro ? r.intro.split(/\s+/).length : 0;
    const faqCount = r.faq_recette?.length || 0;
    const varCount = r.variants?.length || 0;
    const mtLen = r.meta_title?.length || 0;
    const hasSport = !!r.sport_timing;
    const hasConserv = !!r.conservation;
    const hasAlt = !!r.image_alt;
    const hasSchema = !!r.schema_recipe;
    const hasNutrition = !!r.nutrition_per_serving;
    console.log(`   ${r.slug}:`);
    console.log(`     intro=${introWords}w, faq=${faqCount}, variants=${varCount}, meta_title=${mtLen}ch`);
    console.log(`     sport_timing=${hasSport}, conservation=${hasConserv}, image_alt=${hasAlt}, schema=${hasSchema}, nutrition=${hasNutrition}`);
  }

  // Vérifier qu'aucun meta_title ne dépasse 60 chars
  const { data: longTitles } = await supabase
    .from('recipes')
    .select('slug, meta_title');

  const tooLong = (longTitles || []).filter((r) => r.meta_title && r.meta_title.length > 60);
  if (tooLong.length > 0) {
    console.log(`\n   ⚠️  ${tooLong.length} recette(s) avec meta_title > 60 chars:`);
    for (const r of tooLong) {
      console.log(`     ${r.slug}: ${r.meta_title.length}ch → "${r.meta_title}"`);
    }
  } else {
    console.log('\n   ✅ Tous les meta_title sont ≤ 60 chars');
  }

  // Compter les recettes sans intro
  const { data: allRecipes } = await supabase
    .from('recipes')
    .select('slug, intro');

  const noIntro = (allRecipes || []).filter((r) => !r.intro || r.intro.length < 50);
  console.log(`\n   📊 Recettes encore sans intro (< 50 chars): ${noIntro.length}`);
  for (const r of noIntro) {
    console.log(`     - ${r.slug}`);
  }

  console.log('\n✅ SEO Fix 3 terminé !');
}

main().catch((e) => { console.error('❌', e); process.exit(1); });
