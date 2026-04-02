#!/usr/bin/env node
/**
 * SEO Fix 2 — mamie-vege.fr — 02/04/2026
 * Enrichissement des recettes sous-optimisées + porridge meta_title
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
  console.log('🔧 SEO Fix 2 — mamie-vege.fr\n');

  // ── Porridge meta_title ────────────────────────────────────────────────────
  console.log('1️⃣  Porridge meta_title...');
  await updateRecipe('Porridge Protéiné aux Fruits Rouges', {
    meta_title: 'Porridge protéiné aux fruits rouges | Mamie Végé',
    meta_description: 'Porridge protéiné aux fruits rouges végétarien. Petit-déjeuner sportif complet, prêt en 10 min, riche en fibres et protéines végétales.',
  });

  // ── 4 recettes existantes (enrichir intro + faq) ──────────────────────────
  console.log('\n2️⃣  Enrichissement des 4 recettes sous 300 mots...');

  await updateRecipe('Smoothie Vert', {
    intro: "Après une séance de sport, ton corps a besoin de deux choses dans les 30 minutes qui suivent : des protéines pour réparer les fibres musculaires endommagées, et des glucides pour relancer la resynthèse du glycogène. Ce smoothie vert les réunit en 5 minutes. Les épinards apportent du magnésium (utile pour la contraction musculaire) et du fer végétal — à associer avec le citron présent dans la recette pour en optimiser l'absorption. La banane mûre fournit 23 g de glucides à IG modéré (55 selon les tables internationales de référence), idéal pour une recharge progressive post-effort. La protéine de pois complète avec 25 g de protéines directement disponibles, un profil en leucine de 8 g pour 100 g de protéine — comparable à la whey selon les études récentes sur la protéine de pois isolée.",
    faq_recette: [
      { question: "Ce smoothie convient-il aux végétaliens ?", answer: "Oui, à condition d'utiliser une protéine de pois ou de riz (pas de whey). Le lait d'amande est végétalien par défaut. Vérifier l'étiquette de la protéine en poudre : certaines formules ajoutent de la leucine ou des acides aminés d'origine animale." },
      { question: "Peut-on remplacer la protéine en poudre par du yaourt de soja ?", answer: "Oui. 125 g de yaourt de soja protéiné (type Alpro Protein) apporte 8 à 10 g de protéines au lieu de 25 g. Le smoothie sera moins dense en protéines mais plus accessible. Ajouter une cuillère à soupe de beurre d'amande compense partiellement." },
      { question: "Pourquoi mettre des épinards dans un smoothie sucré ?", answer: "Les épinards crus ont un goût très discret masqué par la banane et la protéine aromatisée. Ils apportent 3,6 mg de fer pour 100 g (données Ciqual ANSES), du magnésium et des antioxydants. En pratique, aucune différence de goût n'est perceptible dans ce smoothie." },
    ],
  });

  await updateRecipe('Soupe de Lentilles%Patate Douce', {
    intro: "La soupe lentilles-patate douce est la recette de récupération végétarienne la plus complète pour l'hiver. Les lentilles corail cuisent sans trempage en 15 à 20 minutes et fondent naturellement dans le bouillon — aucun mixeur nécessaire si on les laisse cuire jusqu'à dissolution. Elles apportent environ 9 g de protéines et 3,3 mg de fer pour 100 g cuites selon la table Ciqual de l'ANSES. La patate douce fournit 20 g de glucides complexes et 540 mg de potassium pour 100 g — un minéral clé pour la récupération musculaire après un effort d'endurance. Pour les coureurs végétariens exposés à l'anémie ferriprive (hémolyse mécanique liée à l'impact des foulées), cette soupe est particulièrement pertinente : servie avec un filet de jus de citron frais, la vitamine C du citron multiplie l'absorption du fer végétal par 3 à 4 selon l'avis de l'ANSES sur l'alimentation végétarienne (2021). Une soupe complète, anti-inflammatoire et économique : moins de 1,50 € par portion.",
    faq_recette: [
      { question: "Peut-on préparer cette soupe à l'avance ?", answer: "Oui, c'est même recommandé. Elle se conserve 5 jours au réfrigérateur et se congèle 3 mois en portions individuelles. Les lentilles corail absorbent le bouillon en refroidissant — ajouter un peu d'eau ou de bouillon au réchauffage. Ajouter le citron frais uniquement au service." },
      { question: "Peut-on remplacer la patate douce par une autre féculente ?", answer: "Oui. La courge butternut (disponible en automne-hiver) est l'alternative la plus proche : IG modéré, richesse en bêta-carotène, goût légèrement sucré compatible avec les épices. La pomme de terre est une alternative plus neutre mais moins riche en micronutriments." },
      { question: "Cette soupe convient-elle avant une compétition ?", answer: "Pas le matin d'une compétition : la richesse en fibres des lentilles peut provoquer des inconforts digestifs pendant l'effort. Idéale en repas de récupération le soir ou 2 jours avant. Pour la veille de course, préférer des glucides moins fibreux : pâtes complètes, riz avec une sauce légère." },
    ],
  });

  await updateRecipe('Boules%nergie chocolat', {
    intro: "Les boules d'énergie sont la collation sportive végétalienne la plus efficace rapport temps/coût/nutrition : aucune cuisson, 10 minutes de préparation, une semaine de conservation au frigo. Cette version chocolat-dattes est calibrée pour les sportifs végétariens : les dattes apportent environ 70 g de glucides pour 100 g à index glycémique modéré (45-55 selon les tables internationales) — une source d'énergie naturelle qui évite le pic insulinique des sucres raffinés. Les flocons d'avoine ajoutent des glucides complexes (60 g/100 g sec selon Ciqual ANSES) et 13 à 14 g de protéines. Le cacao non sucré est particulièrement intéressant pour les sportifs : il contient 228 mg de magnésium pour 100 g (données Ciqual ANSES), le minéral le plus souvent déficitaire chez les sportifs d'endurance en raison des pertes par transpiration. Le beurre de cacahuète complète avec des protéines (26 g/100 g) et des graisses insaturées pour une énergie durable. 3 boules = environ 220 kcal, 28 g de glucides, 8 g de protéines : la collation pré-sport idéale 45 à 60 minutes avant une séance.",
    nutrition_per_serving: { calories: 220, proteins_g: 8, carbs_g: 28, fat_g: 9, fiber_g: 4, iron_mg: 2 },
    faq_recette: [
      { question: "Combien de boules manger avant le sport ?", answer: "2 à 3 boules, 45 à 60 minutes avant la séance. Elles apportent 20 à 30 g de glucides naturels selon la taille — suffisant pour une collation pré-entraînement de 60 à 90 minutes. Pour une séance de plus de 2 heures, préférer un repas complet 2 à 3 heures avant et garder les boules pour pendant l'effort." },
      { question: "Peut-on faire ces boules sans mixeur ?", answer: "Oui, si les dattes sont très molles (variété Medjool de préférence). Les écraser à la fourchette avec les autres ingrédients en pétrissant à la main 3 à 4 minutes. La texture sera moins homogène mais les boules tiennent bien si la pâte est suffisamment compressée lors du roulage." },
      { question: "Ces boules contiennent-elles du gluten ?", answer: "Les flocons d'avoine peuvent contenir des traces de gluten par contamination croisée en usine. Pour une version certifiée sans gluten, utiliser des flocons d'avoine labellisés sans gluten (disponibles en magasins bio). Dans ce cas, la recette est naturellement sans gluten." },
    ],
  });

  await updateRecipe('Galettes de Quinoa', {
    intro: "Le quinoa est une des rares pseudo-céréales à contenir tous les acides aminés essentiels dans des proportions utilisables — c'est pourquoi la table Ciqual de l'ANSES classe ses protéines parmi les meilleures du règne végétal. Ces galettes utilisent le quinoa comme base protéique (14 g de protéines pour 100 g sec selon Ciqual ANSES) et le combinent avec des légumes de saison pour un résultat compact, facile à transporter et facilement réchauffable. Elles se préparent en 30 minutes et s'adaptent au meal prep : préparer 8 à 10 galettes le dimanche, les conserver au frigo 4 jours. Le soir d'entraînement, 3 minutes à la poêle suffisent à les remettre à température. L'index glycémique du quinoa cuit (53 selon les tables de référence) est modéré — il fournit de l'énergie progressive sur plusieurs heures, sans pic insulinique. Associées à une salade de légumineuses, ces galettes couvrent à la fois les besoins en protéines complètes et en glucides complexes d'un repas post-sport.",
    faq_recette: [
      { question: "Peut-on remplacer le quinoa par du sarrasin dans ces galettes ?", answer: "Oui, le sarrasin est une excellente alternative : sans gluten, 13 g de protéines pour 100 g sec (données Ciqual ANSES), et un profil en acides aminés particulièrement riche en lysine (3 fois plus que le blé). Le sarrasin cuit a une texture plus granuleuse — les galettes seront légèrement moins compactes mais tout aussi savoureuses." },
      { question: "Ces galettes conviennent-elles avant ou après le sport ?", answer: "Les deux. Avant une séance (2 à 3 heures avant) : 2 galettes avec une salade légère. Après une séance : 3 galettes avec une portion de légumineuses pour compléter l'apport en protéines et recharger le glycogène. Éviter juste avant une séance intense." },
      { question: "Comment empêcher les galettes de s'effondrer à la cuisson ?", answer: "Bien égoutter le quinoa cuit, ajouter 1 à 2 cuillères à soupe de fécule de maïs comme liant, et ne pas retourner avant que la première face soit bien dorée — compter 4 minutes à feu moyen. Une poêle antiadhésive bien chaude légèrement huilée est indispensable." },
    ],
  });

  // ── 2 nouvelles recettes ───────────────────────────────────────────────────
  console.log('\n3️⃣  Enrichissement des 2 nouvelles recettes...');

  await updateRecipe('Wrap%Tofu%Houmous', {
    meta_title: 'Wrap tofu grillé et houmous végétarien | Mamie Végé',
    meta_description: 'Wrap végétarien tofu grillé et houmous : 24 g de protéines, prêt en 20 minutes. Repas transportable idéal pour le déjeuner au bureau avant ou après le sport.',
    intro: "Le wrap est le repas végétarien sportif idéal à emporter : compact, riche en protéines et prêt en 20 minutes. La combinaison tofu grillé + houmous est particulièrement intéressante : le tofu ferme apporte 12 à 15 g de protéines pour 100 g selon la table Ciqual de l'ANSES, avec un profil en acides aminés complet (le soja est la seule légumineuse à contenir tous les acides aminés essentiels). Le houmous, à base de pois chiches et de tahini, ajoute des protéines supplémentaires (environ 8 g pour 100 g) et du calcium végétal issu du sésame. La tortilla complète fournit les glucides complexes nécessaires pour l'énergie, avec une digestion plus progressive que le pain blanc. Ce wrap est le repas de midi type d'un sportif végétarien actif : 24 g de protéines, des glucides modérés, des fibres et de bonnes graisses. Il se prépare la veille en 20 minutes et se transporte facilement.",
    sport_timing: "Idéal en déjeuner 2 à 3 heures avant une séance de sport ou en repas post-entraînement. Transportable pour les sportifs qui s'entraînent le midi ou en soirée après le bureau.",
    conservation: "Le wrap assemblé se conserve 24 heures au réfrigérateur emballé dans du film alimentaire. Pour une meilleure conservation, garder les ingrédients séparés et assembler juste avant de manger. Le tofu grillé seul se conserve 4 jours au frigo.",
    variants: [
      { title: 'Version sans gluten', description: "Remplacer la tortilla de blé complet par une galette de sarrasin ou de riz. Le sarrasin apporte 13 g de protéines pour 100 g sec. Réchauffer légèrement avant d'assembler pour plus de souplesse." },
      { title: 'Version plus protéinée', description: "Ajouter 80 g de pois chiches rôtis dans le wrap (four à 200°C avec huile + paprika fumé pendant 25 minutes). Apport protéique passe de 24 g à environ 32 g par portion." },
      { title: 'Version houmous maison', description: "Préparer le houmous maison (200 g pois chiches + 2 c. à s. tahini + 1 citron + ail + huile d'olive + eau). 10 minutes au mixeur, se conserve 5 jours au frigo." },
    ],
    nutrition_per_serving: { calories: 390, proteins_g: 24, carbs_g: 38, fat_g: 12, fiber_g: 6, iron_mg: 4 },
    schema_recipe: { recipeCategory: 'Déjeuner transportable', recipeCuisine: 'Végétarienne', keywords: 'wrap tofu grillé houmous végétarien, wrap protéiné végé sportif, repas midi sportif végétarien' },
    faq_recette: [
      { question: "Peut-on manger ce wrap froid ?", answer: "Oui, c'est même l'usage principal — c'est un repas conçu pour être emporté. Le tofu grillé refroidi a une texture légèrement plus ferme mais reste savoureux." },
      { question: "Le houmous du commerce convient-il ?", answer: "Les deux fonctionnent. Le houmous du commerce est pratique mais souvent plus salé et moins concentré en tahini. Vérifier que les ingrédients se limitent à pois chiches, tahini, citron, ail et huile d'olive." },
      { question: "Comment griller le tofu pour qu'il reste bien ferme ?", answer: "Presser le tofu 15 minutes (torchon + objet lourd) pour éliminer l'humidité, puis mariner 30 minutes (sauce soja + ail + huile de sésame). Cuire à feu vif 3 à 4 minutes par face dans une poêle antiadhésive jusqu'à coloration dorée." },
    ],
    image_alt: 'Wrap végétarien au tofu grillé et houmous sur une planche — repas protéiné sportif à emporter',
  });

  await updateRecipe('Galettes%sarrasin', {
    meta_title: 'Galettes protéinées au sarrasin | Mamie Végé',
    meta_description: 'Galettes protéinées au sarrasin : sans gluten, riches en lysine. 18 g de protéines par portion, 30 minutes, idéales en meal prep pour sportifs.',
    intro: "Le sarrasin est souvent comparé au quinoa dans la famille des pseudo-céréales : sans gluten, riche en acides aminés essentiels, et particulièrement bien pourvu en lysine — un acide aminé souvent déficitaire dans les céréales classiques (le sarrasin en contient 3 fois plus que le blé selon les données de composition disponibles). Sa farine apporte environ 11 à 13 g de protéines pour 100 g (données Ciqual ANSES 2021), avec un index glycémique autour de 55 — modéré et stable. Ces galettes utilisent la farine de sarrasin comme base, enrichie avec des œufs (ou du tofu soyeux pour une version végétalienne) pour atteindre 18 g de protéines par portion. Elles se distinguent des galettes bretonnes classiques par l'ajout délibéré d'ingrédients protéiques : fromage blanc végétal ou tofu soyeux dans la pâte, graines dans la garniture. Le résultat est une galette plus épaisse, plus nourrissante, pensée pour couvrir les besoins protéiques d'un repas post-entraînement. Se prépare en 30 minutes, se conserve 4 jours, se réchauffe en 3 minutes à la poêle.",
    sport_timing: "En déjeuner ou dîner 2 à 3 heures avant une séance de sport, ou en repas de récupération dans l'heure suivant l'effort. Éviter juste avant un entraînement intense — la richesse en fibres du sarrasin peut ralentir la digestion.",
    conservation: "Se conservent 4 jours au réfrigérateur dans un contenant hermétique. Réchauffage : 2 à 3 minutes à la poêle antiadhésive. Congélation possible 2 mois : séparer les galettes avec du papier cuisson.",
    variants: [
      { title: 'Version végétalienne (sans œuf)', description: "Remplacer chaque œuf par 80 g de tofu soyeux mixé ou 1 cuillère à soupe de graines de lin moulues + 3 cuillères à soupe d'eau (laisser reposer 10 minutes pour gélification). La texture sera légèrement moins aérée mais la tenue est correcte." },
      { title: 'Version encore plus protéinée', description: "Ajouter 20 g de protéine de pois neutre ou 50 g de fromage blanc végétal dans la pâte. L'apport protéique passe de 18 g à environ 24 g par portion." },
      { title: 'Garniture sportive recommandée', description: "Garnir avec 100 g de champignons poêlés + 2 cuillères à soupe de houmous + graines de courge. Cette garniture ajoute 8 g de protéines supplémentaires et 2,5 mg de fer." },
    ],
    nutrition_per_serving: { calories: 280, proteins_g: 18, carbs_g: 32, fat_g: 8, fiber_g: 5, iron_mg: 3 },
    schema_recipe: { recipeCategory: 'Plat principal', recipeCuisine: 'Végétarienne', keywords: 'galettes sarrasin protéinées végétariennes, galettes sans gluten sportif, recette sarrasin protéines' },
    faq_recette: [
      { question: "Le sarrasin est-il vraiment sans gluten ?", answer: "Oui, le sarrasin ne contient pas de gluten — c'est une pseudo-céréale. Attention cependant : si tu es cœliaque, vérifier que la farine achetée est certifiée sans gluten, car des contaminations croisées peuvent survenir en usine." },
      { question: "Peut-on utiliser du sarrasin en grains plutôt qu'en farine ?", answer: "Le sarrasin en grains cuits peut être incorporé dans la pâte pour une texture plus rustique. Cuire 200 g de sarrasin 15 minutes dans l'eau bouillante, égoutter et intégrer dans la pâte avec moins de farine." },
      { question: "Quelle différence nutritionnelle entre sarrasin et blé complet ?", answer: "Le sarrasin apporte plus de lysine (un acide aminé essentiel souvent déficitaire dans les céréales), un profil antioxydant plus élevé et l'absence de gluten. Les apports en protéines sont proches (11-13 g/100 g pour les deux selon Ciqual ANSES 2021)." },
    ],
    image_alt: 'Galettes protéinées au sarrasin garnies de légumes — recette végétarienne sans gluten',
  });

  // ── Vérification ───────────────────────────────────────────────────────────
  console.log('\n4️⃣  Vérification...');
  const { data: verif } = await supabase
    .from('recipes')
    .select('slug, title, meta_title, intro, faq_recette, variants')
    .in('slug', [
      'smoothie-vert-proteine',
      'soupe-de-lentilles-a-la-patate-douce',
      'boules-denergie-chocolat-et-dattes',
      'galettes-de-quinoa-aux-legumes',
      'wrap-au-tofu-grille-houmous',
      'galettes-proteinees-au-sarrasin',
      'porridge-proteine-aux-fruits-rouges',
    ]);

  for (const r of verif || []) {
    const introWords = r.intro ? r.intro.split(/\s+/).length : 0;
    const faqCount = r.faq_recette?.length || 0;
    const varCount = r.variants?.length || 0;
    const mtLen = r.meta_title?.length || 0;
    console.log(`   ${r.slug}: intro=${introWords}w, faq=${faqCount}, variants=${varCount}, meta_title=${mtLen}ch`);
  }

  console.log('\n✅ SEO Fix 2 terminé !');
}

main().catch(e => { console.error('❌', e); process.exit(1); });
