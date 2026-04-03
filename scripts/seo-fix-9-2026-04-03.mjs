#!/usr/bin/env node
/**
 * SEO Fix 9 — mamie-vege.fr — 03/04/2026
 * Enrichissement batch 3c (final) — 2 recettes
 * IDs : 67, 68
 * Sources nutritionnelles : Ciqual ANSES 2021
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

for (const f of ['.env.local', '.env']) {
  try {
    const content = readFileSync(f, 'utf8');
    for (const line of content.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq > 0 && !process.env[t.slice(0, eq)]) {
        process.env[t.slice(0, eq)] = t.slice(eq + 1);
      }
    }
  } catch {}
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const updates = [
  {
    id: 67,
    data: {
      meta_title: "Tofu croustillant au four 5 ingrédients | Mamie Végé",
      meta_description: "Tofu croustillant au four 5 ingrédients pour débutants végétariens : technique infaillible, 30 min. La base protéinée végé pour tous les bowls.",
      intro: "Ce tofu croustillant au four est la recette qui réconcilie les débutants végétariens avec le tofu. La fécule de maïs est le secret : elle absorbe l'humidité résiduelle du tofu et crée une fine croûte croustillante à la cuisson sans friture. 400 g de tofu ferme apportent environ 52 g de protéines totales selon la table Ciqual de l'ANSES. La marinade sauce soja-huile de sésame-ail en poudre développe des saveurs umami intenses pendant la cuisson. Cette méthode au four est plus saine que la friture et ne nécessite aucune surveillance — mettre au four, timer 30 minutes, sortir. Le tofu croustillant ainsi obtenu peut garnir n'importe quel bowl, wok, wrap ou salade de la semaine.",
      image_alt: "Cubes de tofu croustillants et dorés uniformément sur une plaque de four avec la fécule de maïs — technique végétarienne infaillible pour débutants",
      sport_timing: "Base protéique polyvalente à intégrer dans n'importe quel repas. Préparer en grande quantité le dimanche et utiliser dans les bowls, woks et wraps de la semaine.",
      conservation: "Se conserve 4-5 jours au réfrigérateur dans un contenant hermétique. Réchauffer à la poêle à feu vif 2 minutes pour retrouver le croustillant. Éviter le micro-ondes (ramollit).",
      variants: [
        { title: "Version teriyaki", description: "Mariner le tofu dans 3 c. à s. de sauce teriyaki (sauce soja + mirin + sucre) 30 minutes avant la cuisson au four. Saveur douce-salée caramélisée." },
        { title: "Version épicée (sriracha + ail)", description: "Marinade : 1 c. à s. de sriracha + 1 c. à s. de sauce soja + ail râpé. Version pimentée avec des saveurs fortes." },
        { title: "Version curry indien", description: "Marinade : curry en poudre + curcuma + yaourt de soja + jus de citron. Saveur tikka masala végane, excellent dans un bowl de lentilles." }
      ],
      nutrition_per_serving: { calories: 113, proteins_g: 13, carbs_g: 2, fat_g: 8, fiber_g: 0, iron_mg: 1 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "tofu croustillant four débutant végétarien, tofu croustillant fécule maïs, recette tofu simple sportif végé" },
      faq_recette: [
        { question: "Pourquoi mon tofu n'est pas croustillant au four ?", answer: "Causes fréquentes : (1) tofu pas assez pressé — presser au moins 15 minutes pour éliminer l'eau, (2) pas assez de fécule de maïs, (3) température du four trop basse (moins de 200°C), (4) cubes trop gros (>3 cm — préférer 2 cm), (5) pas assez de temps (moins de 25 minutes). Le tofu doit être doré et légèrement rétréci." },
        { question: "Quelle est la différence entre tofu ferme et extra-ferme ?", answer: "Le tofu extra-ferme contient moins d'eau — il nécessite moins de pressage et devient plus croustillant plus rapidement au four. Le tofu ferme est plus courant en France et fonctionne très bien avec 15-20 minutes de pressage. Éviter le tofu soyeux (beaucoup trop mou pour cette technique)." },
        { question: "Peut-on faire cette recette à la poêle ?", answer: "Oui, plus rapide (10 minutes vs 30 minutes) mais nécessite plus de surveillance. Chauffer une poêle antiadhésive à feu vif avec un peu d'huile. Cuire les dés 3-4 minutes par face sans les bouger — le contact constant avec la chaleur crée la croûte." }
      ],
      related_article_ids: [1, 13, 14],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 68,
    data: {
      meta_title: "Energy balls pois chiches et cacao sans cuisson | Mamie Végé",
      meta_description: "Energy balls pois chiches et cacao végétaliens : 10 min sans cuisson. Collation crossfit végé, pois chiches indétectables, riches en magnésium.",
      intro: "Les energy balls pois chiches-cacao sont la collation crossfit végétarienne par excellence : 10 minutes de préparation, pas de four, et les pois chiches sont totalement indétectables sous le cacao et les dattes. Les pois chiches (240 g en boîte) apportent des protéines et des glucides complexes. Les dattes Medjool fournissent des glucides naturels à index glycémique modéré (45-55 selon les tables internationales). Le cacao non sucré est particulièrement intéressant pour les sportifs : 228 mg de magnésium pour 100 g (table Ciqual ANSES) — le minéral le plus souvent déficitaire en endurance. Le beurre de cacahuète complète avec des protéines (26 g/100 g) et des graisses insaturées qui prolongent l'énergie. 3 balls = collation pré-crossfit idéale.",
      image_alt: "Energy balls végétaliens pois chiches et cacao roulés dans des pépites de chocolat noir dans un bol — collation crossfit végé sans cuisson",
      sport_timing: "45 à 60 minutes avant une séance de crossfit, HIIT ou musculation. Ou en récupération rapide post-séance. Transportables dans n'importe quel sac de sport.",
      conservation: "Se conservent 7 jours au réfrigérateur dans un contenant hermétique. Congélation 2 mois. Préparer une double quantité (20 balls) le dimanche pour toute la semaine.",
      variants: [
        { title: "Version protéinée (+ poudre de pois)", description: "Ajouter 20 g de protéine de pois chocolat dans le mixeur. Apport protéique passe à environ 10-12 g pour 3 balls." },
        { title: "Version pistache-citron (sans cacao)", description: "Remplacer le cacao par 30 g de pistaches moulues + zeste de citron. Saveur fraîche et originale." },
        { title: "Version noix de coco", description: "Rouler les balls dans de la noix de coco râpée à la place des pépites de chocolat. Saveur exotique, texture plus sèche et plus facile à manipuler." }
      ],
      nutrition_per_serving: { calories: 129, proteins_g: 4, carbs_g: 9, fat_g: 8, fiber_g: 3, iron_mg: 1 },
      schema_recipe: { recipeCategory: "Collation sportive", recipeCuisine: "Végétalienne", keywords: "energy balls pois chiches cacao végétaliens, balls crossfit végétarien sans cuisson, boules énergie pois chiches chocolat" },
      faq_recette: [
        { question: "Les pois chiches se sentent-ils dans ces balls ?", answer: "Non — c'est la surprise la plus agréable de cette recette. Le cacao, les dattes et le beurre de cacahuète masquent complètement la saveur des pois chiches. Leurs protéines et leur texture permettent la cohésion de la ball sans laisser de trace gustative. Des adultes qui n'aiment pas les pois chiches les mangent sans s'en rendre compte." },
        { question: "Peut-on utiliser des pois chiches cuits maison ?", answer: "Oui, et ils fonctionnent mieux (moins d'eau résiduelle, texture plus sèche qui facilite la cohésion). Cuire 200 g de pois chiches secs (trempés 12h, cuits 1h), bien égoutter et sécher à l'air avant de mixer. Si les balls sont trop molles avec la boîte, ajouter des flocons d'avoine supplémentaires." },
        { question: "Comment conserver ces balls pour les emmener en compétition ?", answer: "Sortir du réfrigérateur la veille ou le matin, emballer chaque ball dans du papier cuisson. Placer dans une boîte rigide dans le sac de sport. À température ambiante, les balls tiennent 4-5 heures. Pour les ultra-trails, les congeler la veille et laisser décongeler naturellement." }
      ],
      related_article_ids: [1, 12, 24],
      updated_date: '2026-04-02'
    }
  }
];

async function run() {
  console.log('🚀 Enrichissement batch 3c (final) — 2 recettes (IDs 67-68)\n');

  for (const { id, data } of updates) {
    const { error } = await supabase
      .from('recipes')
      .update(data)
      .eq('id', id);

    if (error) {
      console.log(`   ❌ ID ${id} — ${error.message}`);
    } else {
      console.log(`   ✅ ID ${id} — OK (${data.meta_title})`);
    }
  }

  console.log('\n── Vérifications ──────────────────────────────────────\n');

  // Vérif IDs 67-68
  const ids = [67, 68];
  const { data: titles } = await supabase
    .from('recipes')
    .select('id, meta_title')
    .in('id', ids)
    .order('id');

  console.log('1. meta_title lengths (≤ 60 chars) :');
  for (const r of titles || []) {
    const len = (r.meta_title || '').length;
    const ok = len <= 60 ? '✅' : '❌';
    console.log(`   ${ok} ID ${r.id} — ${len} chars — ${r.meta_title}`);
  }

  const { data: enriched } = await supabase
    .from('recipes')
    .select('id, intro, faq_recette, variants, nutrition_per_serving, related_article_ids')
    .in('id', ids)
    .order('id');

  console.log('\n2. Enrichissement (intro ≥ 80 mots, 3 FAQ, 3 variants, proteins > 0, 3 articles liés) :');
  for (const r of enriched || []) {
    const mots = (r.intro || '').trim().split(/\s+/).length;
    const faq = (r.faq_recette || []).length;
    const vars = (r.variants || []).length;
    const prot = r.nutrition_per_serving?.proteins_g || 0;
    const arts = (r.related_article_ids || []).length;
    const ok = mots >= 80 && faq === 3 && vars === 3 && prot > 0 && arts === 3;
    console.log(`   ${ok ? '✅' : '❌'} ID ${r.id} — ${mots} mots, ${faq} FAQ, ${vars} variants, ${prot}g prot, ${arts} articles`);
  }

  // Vérif globale
  const { data: allTitles } = await supabase
    .from('recipes')
    .select('id, meta_title');

  const tooLong = (allTitles || []).filter(r => (r.meta_title || '').length > 60);
  console.log(`\n3. meta_title > 60 chars dans toute la table : ${tooLong.length === 0 ? '✅ 0' : '❌ ' + tooLong.length}`);
  for (const r of tooLong) {
    console.log(`   ❌ ID ${r.id} — ${(r.meta_title || '').length} chars — ${r.meta_title}`);
  }

  // Vérif enrichissement total
  const { data: allEnriched } = await supabase
    .from('recipes')
    .select('id, intro, faq_recette')
    .not('intro', 'is', null);

  const enrichedTotal = (allEnriched || []).filter(r =>
    (r.intro || '').length > 50 && (r.faq_recette || []).length >= 3
  ).length;
  console.log(`\n4. Total recettes enrichies (intro > 50 chars + 3 FAQ) : ${enrichedTotal}`);

  console.log('\n✨ Batch final terminé');
}

run().catch(e => { console.error(e); process.exit(1); });
