#!/usr/bin/env node
/**
 * SEO Fix 6 — mamie-vege.fr — 03/04/2026
 * Enrichissement éditorial batch 2 — 19 recettes
 * IDs : 1, 2, 3, 11, 17, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34
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
    id: 1,
    data: {
      meta_title: 'Porridge protéiné aux fruits rouges | Mamie Végé',
      meta_description: 'Porridge végétarien protéiné aux fruits rouges : 45 g de protéines, 10 min. Petit-déjeuner sportif complet avoine, pois et beurre de cacahuète.',
      intro: "Le porridge est le petit-déjeuner des sportifs végétariens par excellence : glucides complexes pour l'énergie, protéines pour démarrer la récupération musculaire, fibres pour la satiété. Cette version associe 80 g de flocons d'avoine — 13 à 14 g de protéines pour 100 g selon la table Ciqual de l'ANSES — à 30 g de protéine de pois vanille pour atteindre 45 g de protéines par bol. Les fruits rouges apportent des anthocyanes aux propriétés antioxydantes, utiles pour réduire l'inflammation post-effort. Le beurre de cacahuète ajoute des graisses insaturées et prolonge la satiété jusqu'à la séance. Les graines de chia complètent avec des oméga-3 ALA et un effet gélifiant qui améliore la texture.",
      image_alt: "Bol de porridge protéiné aux fruits rouges avec beurre de cacahuète et graines de chia — petit-déjeuner végétarien sportif",
      sport_timing: "Idéal 2 à 3 heures avant une séance de musculation ou de crossfit. Ou en récupération après une séance matinale, dans l'heure qui suit.",
      conservation: "Cuire l'avoine la veille, réfrigérer sans la protéine en poudre. Le matin, réchauffer et incorporer la poudre hors du feu. Fruits rouges frais ou décongelés directement.",
      variants: [
        { title: "Version overnight oats (sans cuisson)", description: "Mélanger à froid les flocons avec le lait d'amande + graines de chia la veille. Ajouter la protéine le matin. Zéro cuisson, prêt en 2 minutes." },
        { title: "Version sans protéine en poudre", description: "Remplacer la protéine de pois par 150 g de yaourt de soja protéiné. Apport passe à environ 28-30 g de protéines. Texture plus crémeuse." },
        { title: "Version prise de masse", description: "Augmenter à 100 g de flocons d'avoine + 2 c. à s. de beurre de cacahuète + 1 banane écrasée. Apport passe à ~900 kcal et ~50 g de protéines." }
      ],
      nutrition_per_serving: { calories: 751, proteins_g: 45, carbs_g: 77, fat_g: 27, fiber_g: 8, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Petit-déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "porridge protéiné végétarien, petit déjeuner sportif végé, porridge fruits rouges protéines végétales" },
      faq_recette: [
        { question: "Ce porridge convient-il avant une séance de sport ?", answer: "Oui. Consommé 2 à 3 heures avant l'entraînement, les glucides complexes de l'avoine fournissent une énergie progressive sur toute la séance. Les protéines limitent le catabolisme musculaire. Éviter de le manger moins d'une heure avant — la digestion de l'avoine est un peu longue." },
        { question: "Peut-on remplacer la protéine de pois par une autre poudre ?", answer: "Oui. La protéine de riz fonctionne bien. Si tu évites les poudres, 150 g de yaourt de soja protéiné donne un résultat crémeux avec environ 12-15 g de protéines supplémentaires. Dans ce cas, réduire légèrement le lait d'amande." },
        { question: "Peut-on utiliser des flocons d'avoine sans gluten ?", answer: "Oui. Les flocons d'avoine étiquetés sans gluten ont subi un processus d'isolation pour éviter la contamination croisée. Ils ont les mêmes valeurs nutritionnelles que les flocons classiques. Disponibles en magasins bio." }
      ],
      related_article_ids: [1, 6, 22],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 2,
    data: {
      meta_title: 'Bowl Buddha quinoa et edamame végétarien | Mamie Végé',
      meta_description: 'Bowl Buddha végétarien quinoa et edamame : 39 g de protéines complètes. Recette colorée sans gluten, idéale en déjeuner sportif ou repas de récupération.',
      intro: "Le bowl Buddha végétarien est le déjeuner le plus complet pour les sportifs actifs. Le quinoa apporte tous les acides aminés essentiels — c'est la seule pseudo-céréale avec un profil protéique complet selon la table Ciqual de l'ANSES. L'edamame (soja vert décortiqué) est l'une des meilleures sources de protéines végétales avec environ 11 g pour 100 g. L'avocat ajoute des graisses mono-insaturées cardioprotectrices et une satiété durable. La sauce soja-sésame-citron apporte du sodium utile après un effort et des acides gras via l'huile de sésame. Ce bowl se prépare en 25 minutes et s'assemble à la demande depuis des composants préparés en batch cooking.",
      image_alt: "Bowl Buddha coloré avec quinoa, edamame, avocat et carottes en rondelles — déjeuner végétarien protéiné sans gluten",
      sport_timing: "Idéal en déjeuner 2 à 3 heures avant une séance de l'après-midi. Ou en repas de récupération post-effort avec une portion d'edamame supplémentaire.",
      conservation: "Composants séparés : quinoa cuit 4-5 jours au frigo, edamame 3 jours. L'avocat se prépare au service. Sauce vinaigrette à conserver à part pour éviter que la salade ne devienne molle.",
      variants: [
        { title: "Version tofu grillé (sans edamame)", description: "Remplacer l'edamame par 150 g de tofu ferme mariné et grillé à la poêle. Même apport protéique, texture plus consistante." },
        { title: "Version d'hiver (légumes rôtis)", description: "Remplacer les crudités fraîches par des légumes rôtis au four (potimarron, betterave, carottes). Même valeur nutritionnelle, plat plus chaud et réconfortant." },
        { title: "Version budget (pois chiches)", description: "Remplacer l'edamame par des pois chiches en boîte rincés (~0,30 € de moins par portion). Apport protéique légèrement inférieur mais très économique." }
      ],
      nutrition_per_serving: { calories: 418, proteins_g: 20, carbs_g: 32, fat_g: 23, fiber_g: 8, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "bowl buddha végétarien quinoa edamame, bowl protéiné végé déjeuner, recette quinoa sportif sans gluten" },
      faq_recette: [
        { question: "L'edamame est-il vraiment une bonne source de protéines végétales ?", answer: "Oui, c'est l'une des meilleures. L'edamame (soja vert cuit) apporte environ 11 g de protéines pour 100 g avec un profil en acides aminés complet — le soja est la seule légumineuse à contenir tous les acides aminés essentiels. En plus des protéines, il apporte du fer, du calcium et de l'acide folique." },
        { question: "Peut-on préparer ce bowl à l'avance pour le midi au bureau ?", answer: "Oui, c'est son point fort. Préparer tous les composants le dimanche (quinoa cuit, edamame cuit, légumes découpés, sauce en petit pot), stocker séparément. Assembler le matin en 3 minutes dans un contenant à compartiments. L'avocat : ajouter au service." },
        { question: "Le quinoa est-il naturellement sans gluten ?", answer: "Oui, le quinoa est naturellement sans gluten. C'est une pseudo-céréale botaniquement apparentée à la betterave et aux épinards. Attention aux contaminations croisées en usine — choisir du quinoa certifié sans gluten si tu es cœliaque." }
      ],
      related_article_ids: [1, 7, 10],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 3,
    data: {
      meta_title: 'Curry de lentilles corail et épinards | Mamie Végé',
      meta_description: 'Curry de lentilles corail aux épinards et lait de coco : recette végétarienne express 30 min, riche en fer. Repas récupération végé savoureux et économique.',
      slug: 'curry-de-lentilles-corail-epinards',
      intro: "Ce curry de lentilles corail aux épinards est une version plus végétale et nutritive du dhal classique. Les épinards apportent 3,6 mg de fer pour 100 g cuits (table Ciqual ANSES) — associés au citron servi à côté, l'absorption du fer végétal est multipliée par 3 à 4. Les lentilles corail cuisent sans trempage en 20 minutes et fondent dans le lait de coco, créant une texture crémeuse naturelle. Le curcuma et la pâte de curry apportent des propriétés anti-inflammatoires intéressantes pour la récupération sportive. Un repas complet à moins de 1,50 € par portion, idéal pour le batch cooking de la semaine.",
      image_alt: "Curry de lentilles corail orange avec épinards et coriandre fraîche dans une cocotte — recette végétarienne express économique",
      sport_timing: "Repas de récupération post-entraînement le soir. Riche en fer et protéines végétales. Éviter avant une séance de sport — les fibres des lentilles peuvent provoquer des inconforts digestifs.",
      conservation: "Se conserve 5 jours au réfrigérateur. Se congèle 3 mois en portions individuelles. Les épices s'intensifient le lendemain. Ajouter les épinards frais au réchauffage si on préfère une texture moins cuite.",
      variants: [
        { title: "Version tofu (+ protéines)", description: "Émietter 150 g de tofu ferme dans le curry dès le début. L'apport protéique passe de 8 g à environ 16-18 g par portion." },
        { title: "Version patate douce (+ glucides récup)", description: "Ajouter 200 g de patate douce en dés en début de cuisson. Apport en glucides et potassium augmenté — idéal après une longue sortie running ou vélo." },
        { title: "Version sans lait de coco (plus légère)", description: "Remplacer par 200 ml de lait de soja non sucré + 1 c. à s. de purée d'amande. Moins de graisses saturées, apport protéique légèrement augmenté." }
      ],
      nutrition_per_serving: { calories: 305, proteins_g: 8, carbs_g: 21, fat_g: 20, fiber_g: 7, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "curry lentilles corail épinards végétarien, curry végé fer récupération, recette lentilles corail lait de coco" },
      faq_recette: [
        { question: "Faut-il faire tremper les lentilles corail avant la cuisson ?", answer: "Non — c'est leur principal avantage. Les lentilles corail cuisent directement sans trempage en 18 à 20 minutes. Elles sont décortiquées et se dissolvent naturellement dans la sauce, donnant une texture crémeuse sans mixeur. Un rinçage à l'eau froide avant cuisson suffit." },
        { question: "Peut-on ajouter d'autres légumes dans ce curry ?", answer: "Oui, ce curry est très adaptable. Chou-fleur, poivron, courgette ou carotte fonctionnent très bien. Ajouter en même temps que les lentilles pour qu'ils cuisent ensemble. Les épinards se mettent toujours en fin de cuisson (2 dernières minutes) pour garder leur couleur et leurs nutriments." },
        { question: "Comment optimiser l'absorption du fer de ce curry ?", answer: "Servir avec un filet de jus de citron frais et un poivron cru en accompagnement. La vitamine C du citron multiplie l'absorption du fer non héminique des lentilles et des épinards par 3 à 4 selon les données de l'ANSES. Éviter le thé ou le café dans l'heure qui suit." }
      ],
      related_article_ids: [1, 2, 12],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 11,
    data: {
      meta_title: 'Pâtes complètes pesto et tempeh végétarien | Mamie Végé',
      meta_description: 'Pâtes complètes au pesto et tempeh : 30 g de protéines, recette végétarienne express 20 min. Le dîner muscu végé par excellence avec glucides et protéines.',
      intro: "Le tempeh est l'une des meilleures sources de protéines végétales pour les sportifs : 18 à 20 g de protéines pour 100 g, avec une digestibilité supérieure au tofu grâce au processus de fermentation. Ces pâtes au pesto et tempeh combinent des glucides complexes pour reconstituer les réserves de glycogène et des protéines complètes pour la récupération musculaire. Le pesto au basilic apporte des graisses insaturées et des herbes fraîches riches en antioxydants. Les pignons de pin ajoutent du magnésium et du zinc — deux minéraux essentiels pour la contraction musculaire. Un repas de récupération complet préparé en 20 minutes.",
      image_alt: "Assiette de pâtes complètes au pesto vert avec dés de tempeh dorés et roquette — dîner végétarien protéiné",
      sport_timing: "Excellent repas post-entraînement le soir ou en déjeuner 3 heures avant une séance de l'après-midi. Les glucides des pâtes rechargent efficacement le glycogène après un effort.",
      conservation: "Le plat assemblé se conserve 3 jours au réfrigérateur. Le pesto s'oxyde — ajouter un filet d'huile d'olive sur le dessus pour limiter le noircissement. Réchauffer à la poêle avec un peu d'eau plutôt qu'au micro-ondes.",
      variants: [
        { title: "Version sans gluten (pâtes de légumineuses)", description: "Remplacer les pâtes complètes par des pâtes de lentilles corail ou de pois chiches. Apport protéique encore plus élevé, sans gluten." },
        { title: "Version pesto maison", description: "Mixer 50 g de basilic + 30 g de pignons + 40 g de parmesan (ou levure maltée pour version végane) + 80 ml d'huile d'olive + ail + sel. Plus frais et moins salé que le commerce." },
        { title: "Version légère (sèche ou récup légère)", description: "Réduire les pâtes à 80 g, augmenter la roquette et ajouter des tomates cerises. Apport glucidique réduit, protéines maintenues grâce au tempeh." }
      ],
      nutrition_per_serving: { calories: 736, proteins_g: 30, carbs_g: 76, fat_g: 31, fiber_g: 9, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "pâtes tempeh végétarien protéiné, pesto tempeh recette sportive, pâtes complètes végé musculation" },
      faq_recette: [
        { question: "Qu'est-ce que le tempeh et comment le cuisiner ?", answer: "Le tempeh est un aliment fermenté à base de graines de soja. Sa fermentation lui confère une meilleure digestibilité que le tofu et un goût plus prononcé, légèrement noiseté. Pour le cuisiner : couper en dés, mariner 15 minutes dans sauce soja + ail, puis saisir à la poêle à feu vif 3-4 minutes de chaque côté jusqu'à coloration dorée." },
        { question: "Les pâtes complètes sont-elles meilleures que les pâtes blanches pour un sportif ?", answer: "Pour les sportifs végétariens, oui. Les pâtes complètes ont un index glycémique plus bas (45-50 vs 65-70 pour les blanches), apportent plus de fibres, de magnésium et de vitamines B. La recharge en glycogène est plus progressive et durable. En revanche, juste avant une compétition, certains sportifs préfèrent les pâtes blanches plus faciles à digérer." },
        { question: "Le tempeh convient-il aux personnes allergiques au soja ?", answer: "Non — le tempeh est à base de soja. En cas d'allergie au soja confirmée, remplacer par du seitan (protéines de blé) ou des pois chiches rôtis pour une texture croquante similaire." }
      ],
      related_article_ids: [1, 18, 7],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 17,
    data: {
      meta_title: 'Barres énergétiques maison végétariennes | Mamie Végé',
      meta_description: 'Barres énergétiques maison végétariennes : alternative aux gels industriels. Dattes, avoine, chocolat noir — sans cuisson, prêtes en 20 min.',
      intro: "Les barres énergétiques maison sont l'alternative végétale aux gels industriels — moins chères, sans additifs et tout aussi efficaces à l'effort. Les dattes apportent des glucides naturels à index glycémique modéré (45-55 selon les tables internationales), plus stables que les sirops industriels. Les flocons d'avoine ajoutent des glucides complexes (13-14 g de protéines pour 100 g sec selon Ciqual ANSES) pour une énergie progressive. Le beurre de cacahuète complète avec des protéines (26 g/100 g) et des graisses insaturées. Les pépites de chocolat noir apportent du magnésium (228 mg/100 g de cacao selon Ciqual ANSES) — un minéral perdu par transpiration. Une barre maison revient à 0,30-0,50 € contre 1,50-3 € pour les équivalents du commerce.",
      image_alt: "Barres énergétiques maison au chocolat et dattes découpées sur une planche — collation végétarienne pour sportifs",
      sport_timing: "2 à 3 barres, 45 à 60 minutes avant une séance ou pendant un effort de plus de 90 minutes (1 barre toutes les 45 minutes). Transportables dans une poche de maillot ou un sac de sport.",
      conservation: "Se conservent 7 à 10 jours au réfrigérateur dans une boîte hermétique. Congélation possible 2 mois. Envelopper individuellement dans du film alimentaire pour le transport.",
      variants: [
        { title: "Version plus protéinée", description: "Ajouter 20 g de protéine de pois chocolat dans la préparation. Apport protéique passe de 4 g à environ 10-12 g par barre." },
        { title: "Version sans allergie aux arachides", description: "Remplacer le beurre de cacahuète par de la purée de graines de tournesol ou de sésame (tahini). Profil nutritionnel similaire." },
        { title: "Version fruitée (sans chocolat)", description: "Remplacer les pépites de chocolat par 30 g de cranberries séchées et 1 c. à c. de cannelle. Version plus sucrée, idéale pour les sportifs qui ne digèrent pas bien le cacao à l'effort." }
      ],
      nutrition_per_serving: { calories: 187, proteins_g: 4, carbs_g: 26, fat_g: 7, fiber_g: 3, iron_mg: 2 },
      schema_recipe: { recipeCategory: "Collation sportive", recipeCuisine: "Végétarienne", keywords: "barres énergétiques maison végétariennes, barres sport végé dattes avoine, alternative gels sportifs végétalienne" },
      faq_recette: [
        { question: "Ces barres maison sont-elles vraiment aussi efficaces que les gels industriels pendant le sport ?", answer: "Oui. Le profil glucidique dattes + avoine fournit des sucres rapides (dattes, IG 45-55) et des glucides complexes (avoine, IG 55). Pendant un effort de plus de 90 minutes, l'objectif est de 30 à 60 g de glucides par heure — 2 à 3 barres couvrent cet apport." },
        { question: "Peut-on faire ces barres sans mixeur ?", answer: "Oui si les dattes sont très molles (variété Medjool). Écraser à la fourchette, ajouter les autres ingrédients et pétrir à la main 3 à 4 minutes. Former des rectangles, filmer et réfrigérer 1 heure pour que ça prenne." },
        { question: "Comment éviter que les barres ne soient trop collantes ?", answer: "Ajouter des flocons d'avoine cuillère par cuillère si la pâte est trop collante. Humidifier légèrement les mains avant de former les barres. Les réfrigérer au moins 1 heure avant de les manipuler. Enrober dans de la noix de coco râpée ou du cacao en poudre pour réduire le côté collant." }
      ],
      related_article_ids: [6, 10, 24],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 21,
    data: {
      meta_title: 'Bowl lentilles, quinoa et tofu mariné | Mamie Végé',
      meta_description: 'Bowl lentilles, quinoa et tofu mariné végétarien : 52 g de protéines pour 2 portions. Le repas de récupération musculaire végé le plus dense du blog.',
      intro: "Ce bowl est la recette la plus dense en protéines végétales du blog avec 52 g pour 2 portions. Il combine les trois meilleures sources protéiques végétales : les lentilles vertes (9 g de protéines et 3,3 mg de fer pour 100 g cuit selon Ciqual ANSES), le quinoa (profil en acides aminés complet) et le tofu mariné grillé (12-15 g de protéines pour 100 g). La marinade soja-paprika fumé-ail caramélise le tofu à la poêle et développe une saveur umami intense. Le yaourt végétal en sauce apporte de la fraîcheur et des protéines supplémentaires. Les graines de courge complètent avec du zinc et du magnésium — deux minéraux essentiels à la contraction musculaire souvent déficitaires chez les sportifs végétariens.",
      image_alt: "Bowl végétarien complet avec lentilles vertes, quinoa, cubes de tofu mariné grillé et légumes colorés — repas récupération musculaire protéiné",
      sport_timing: "Repas post-musculation dans l'heure qui suit la séance. Ou en déjeuner complet 2 à 3 heures avant une séance de force. La densité protéique en fait le repas de récupération végétarien par excellence.",
      conservation: "Composants séparés : lentilles et quinoa cuits 4-5 jours au frigo, tofu grillé 3-4 jours. Assembler à la demande. Idéal en batch cooking du dimanche pour toute la semaine.",
      variants: [
        { title: "Version tempeh (encore + protéines)", description: "Remplacer le tofu par 150 g de tempeh grillé. Apport protéique total monte à environ 60 g pour 2 portions. Le tempeh a un goût plus prononcé et une meilleure digestibilité." },
        { title: "Version froide (salade composée)", description: "Assembler tous les composants refroidis avec une vinaigrette citron-moutarde-ail. Excellent en salade de déjeuner transportable. Se tient 24 heures dans un contenant hermétique." },
        { title: "Version sans quinoa (+ riz complet)", description: "Remplacer le quinoa par du riz complet pour un profil glucidique plus dense. Idéal après les séances d'endurance longue." }
      ],
      nutrition_per_serving: { calories: 418, proteins_g: 26, carbs_g: 49, fat_g: 13, fiber_g: 9, iron_mg: 5 },
      schema_recipe: { recipeCategory: "Déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "bowl lentilles quinoa tofu végétarien, bowl protéiné musculation végé, repas récupération musculaire végétarien" },
      faq_recette: [
        { question: "Comment mariner le tofu pour ce bowl ?", answer: "Presser le tofu 15 minutes dans un torchon avec un objet lourd. Couper en dés. Mélanger sauce soja (2 c. à s.) + paprika fumé + ail râpé. Enrober et laisser mariner 30 minutes minimum. Cuire à la poêle à feu vif 8-10 minutes en retournant, ou au four à 200°C 25 minutes." },
        { question: "Ce bowl couvre-t-il tous les acides aminés essentiels ?", answer: "Oui. La combinaison lentilles + quinoa + tofu couvre l'ensemble des acides aminés essentiels. Le quinoa est la seule pseudo-céréale avec un profil complet. Le tofu (soja) apporte tous les acides aminés essentiels. Les lentilles complémentent avec de la lysine. Ensemble, c'est un profil optimal pour la synthèse protéique musculaire." },
        { question: "Peut-on préparer ce bowl à l'avance pour le midi au bureau ?", answer: "Oui, c'est même l'idéal. Cuire le quinoa et les lentilles le dimanche en grande quantité. Mariner et cuire le tofu. Conserver séparément au frigo 4-5 jours. Assembler en 5 minutes chaque soir ou le matin." }
      ],
      related_article_ids: [1, 14, 7],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 22,
    data: {
      meta_title: 'Curry pois chiches au lait de coco végé | Mamie Végé',
      meta_description: 'Curry pois chiches léger au lait de coco : 19 g de protéines, végétarien express 25 min. Riche en fibres et épices anti-inflammatoires pour sportifs.',
      intro: "Ce curry de pois chiches léger est conçu pour les sportifs qui veulent un plat protéiné sans être trop lourd après une séance. Les pois chiches apportent environ 8-9 g de protéines et 6,5 g de fibres pour 100 g cuits (table Ciqual ANSES). La version « légère » réduit la quantité de lait de coco par rapport à un curry classique — moins de graisses saturées, même satiété grâce aux fibres des pois chiches. Le curcuma et le cumin ont des propriétés anti-inflammatoires intéressantes pour la récupération sportive. Servi sur du riz basmati, ce plat apporte glucides, protéines et minéraux pour une récupération complète en 25 minutes de préparation.",
      image_alt: "Bol de curry de pois chiches doré avec du riz basmati et de la coriandre fraîche — dîner végétarien léger post-sport",
      sport_timing: "Repas de récupération post-entraînement idéal. Légèrement moins riche que le curry classique, plus digeste le soir. Accompagner de riz basmati ou complet pour les glucides de récupération.",
      conservation: "Se conserve 5 jours au réfrigérateur. Congélation 3 mois. Le curry s'améliore le lendemain — les épices s'infusent davantage. Ajouter la coriandre fraîche uniquement au service.",
      variants: [
        { title: "Version plus protéinée (+ lentilles corail)", description: "Ajouter 100 g de lentilles corail rincées avec les pois chiches. Cuire 5 minutes supplémentaires. Apport protéique passe à environ 26-28 g par portion." },
        { title: "Version légumes verts (+ fer et magnésium)", description: "Ajouter 200 g d'épinards frais ou de haricots verts en fin de cuisson (3 dernières minutes). Apport en fer et magnésium significativement augmenté." },
        { title: "Version tomates fraîches (été)", description: "Remplacer les tomates concassées en boîte par 4 tomates fraîches émondées et coupées. Saveur plus fraîche, moins de sodium." }
      ],
      nutrition_per_serving: { calories: 512, proteins_g: 19, carbs_g: 55, fat_g: 24, fiber_g: 11, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "curry pois chiches léger végétarien, curry végé lait de coco sportif, curry pois chiches anti-inflammatoire" },
      faq_recette: [
        { question: "Pourquoi ce curry est-il qualifié de léger ?", answer: "La quantité de lait de coco est réduite de moitié environ par rapport à un curry classique. Cela diminue les graisses saturées et les calories tout en maintenant la satiété grâce aux fibres des pois chiches. Le terme léger ne signifie pas sans saveur — les épices compensent." },
        { question: "Le curcuma dans ce curry aide-t-il vraiment à la récupération sportive ?", answer: "Certaines études suggèrent que la curcumine (principe actif du curcuma) a des effets anti-inflammatoires. Sa biodisponibilité seule est faible — ajouter une bonne pincée de poivre noir dans ce curry l'augmente significativement (la pipérine du poivre noir améliore l'absorption de la curcumine)." },
        { question: "Peut-on utiliser des pois chiches secs plutôt qu'en boîte ?", answer: "Oui. Les pois chiches secs doivent être trempés 12 heures dans l'eau froide, puis cuits 1 à 1h30. La valeur nutritionnelle est identique à la boîte. Pour ce curry express, les boîtes sont plus pratiques. Pour le batch cooking, les secs sont 3 fois moins chers." }
      ],
      related_article_ids: [1, 2, 18],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 23,
    data: {
      meta_title: 'Galettes haricots blancs et avoine végé | Mamie Végé',
      meta_description: "Galettes végétariennes haricots blancs et flocons d'avoine : 9 g de protéines par galette, recette express 25 min. Alternative végé aux steaks pour sportifs.",
      intro: "Les galettes haricots blancs et flocons d'avoine sont l'alternative végétarienne aux steaks hachés industriels — sans additifs, préparées en 25 minutes et bien plus économiques. Les haricots blancs apportent environ 7-8 g de protéines et 8 g de fibres pour 100 g cuits (table Ciqual ANSES). Les flocons d'avoine servent de liant naturel et ajoutent des glucides complexes. La farine de pois chiche renforce la cohésion et apporte 20 g de protéines pour 100 g — le double de la farine de blé. Le paprika fumé et le cumin développent des saveurs proches d'un steak végétalien. Ces galettes se préparent en batch cooking et se réchauffent en 3 minutes à la poêle — parfaites pour les repas de semaine express.",
      image_alt: "Galettes dorées de haricots blancs et flocons d'avoine dans une poêle avec de la roquette — alternative végétarienne aux steaks pour sportifs",
      sport_timing: "En déjeuner ou dîner 2 à 3 heures avant une séance, ou en repas de récupération. Servir avec une salade et une sauce yaourt végétal pour un repas complet.",
      conservation: "Se conservent 4 jours au réfrigérateur. Congélation possible 2 mois (séparer avec du papier cuisson). Réchauffage : 3 minutes à la poêle antiadhésive — éviter le micro-ondes qui ramollit la texture.",
      variants: [
        { title: "Version épicée", description: "Ajouter 1 c. à c. de cumin + ½ c. à c. de paprika fumé + ½ c. à c. de coriandre moulue dans la préparation. Saveur nettement plus intense." },
        { title: "Version avec fromage (ovo-lacto)", description: "Incorporer 50 g de feta émiettée dans la pâte. Apport en protéines et en calcium augmenté, saveur méditerranéenne." },
        { title: "Version mini-galettes apéritif", description: "Former des galettes de 2 cm de diamètre. Cuire 2-3 minutes par face. Parfaites en apéritif avec une sauce yaourt-herbes pour un apéritif végétarien protéiné." }
      ],
      nutrition_per_serving: { calories: 186, proteins_g: 9, carbs_g: 27, fat_g: 2, fiber_g: 7, iron_mg: 3 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "galettes haricots blancs végétariennes, steaks végé maison avoine, galettes végé batch cooking sportif" },
      faq_recette: [
        { question: "Comment empêcher les galettes de s'effondrer à la cuisson ?", answer: "Trois points clés : bien égoutter les haricots blancs (l'humidité est l'ennemi de la cohésion), ajouter 1 à 2 c. à s. de fécule de maïs si la pâte est trop molle, et ne pas retourner les galettes avant que la première face soit bien dorée (4 minutes à feu moyen)." },
        { question: "Peut-on congeler ces galettes ?", answer: "Oui. Les disposer en une seule couche sur une plaque, congeler 2 heures puis transférer dans un sac de congélation. Se conservent 2 mois. Décongeler au frigo puis réchauffer 3-4 minutes à la poêle pour retrouver le croustillant." },
        { question: "Ces galettes sont-elles adaptées aux enfants ?", answer: "Oui, c'est une excellente façon de leur faire manger des légumineuses. Réduire les épices, ajouter du fromage râpé dans la pâte pour le goût. Servir avec une sauce au yaourt ou du ketchup maison. La texture proche d'un steak est généralement bien acceptée." }
      ],
      related_article_ids: [1, 7, 16],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 24,
    data: {
      meta_title: 'Pâtes sauce lentilles corail végétariennes | Mamie Végé',
      meta_description: 'Pâtes complètes sauce lentilles corail végétariennes : 15 g de protéines, 25 min. La bolognaise végé express pour sportifs — riche en glucides de récupération.',
      intro: "Les pâtes à la sauce lentilles corail sont la bolognaise végétarienne par excellence. Les lentilles corail fondent dans la sauce tomate en créant une texture proche de la viande hachée, sans aucune ressemblance gustative avec les lentilles cuites nature. Cette sauce apporte environ 9 g de protéines et 3,3 mg de fer pour 100 g de lentilles cuites (table Ciqual ANSES). Les pâtes complètes ajoutent des glucides complexes à index glycémique modéré pour une énergie progressive. La carotte et les herbes de Provence enrichissent les saveurs naturellement. Un repas post-entraînement dense en glucides prêt en 25 minutes, idéal pour reconstituer les réserves de glycogène après une longue sortie.",
      image_alt: "Assiette de pâtes complètes avec sauce lentilles corail rouge style bolognaise végé — dîner végétarien récupération sportive",
      sport_timing: "Excellent repas post-entraînement le soir, notamment après les séances d'endurance (running, vélo). Les pâtes rechargent le glycogène rapidement. Aussi en déjeuner 3 heures avant une séance.",
      conservation: "La sauce se conserve 5 jours au réfrigérateur et 3 mois au congélateur. Cuire les pâtes à la demande et réchauffer la sauce. Préparer la sauce en grande quantité le dimanche.",
      variants: [
        { title: "Version arrabbiata végé (pimentée)", description: "Ajouter 1 c. à c. de piment de Cayenne ou 2 piments séchés dans la sauce. Version épicée idéale pour les sportifs qui tolèrent bien le piment." },
        { title: "Version sans gluten (pâtes de légumineuses)", description: "Remplacer les pâtes complètes par des pâtes de lentilles corail ou de pois chiches. Apport protéique total augmente, sans gluten." },
        { title: "Version mijotée (+ riche)", description: "Laisser mijoter la sauce 45 minutes à feu très doux. Les lentilles se décomposent davantage et la sauce est plus concentrée. Encore meilleure réchauffée le lendemain." }
      ],
      nutrition_per_serving: { calories: 427, proteins_g: 15, carbs_g: 68, fat_g: 8, fiber_g: 9, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "pâtes lentilles corail végétariennes, bolognaise végé lentilles, pâtes sauce végétalienne récupération sportive" },
      faq_recette: [
        { question: "Est-ce que les lentilles remplacent vraiment la viande dans cette sauce ?", answer: "Pas gustativement — la saveur est différente. Mais texturalement et nutritionnellement, oui. Les lentilles corail fondues dans la sauce tomate créent une consistance proche de la viande hachée. Avec suffisamment d'épices et d'herbes, le résultat est savoureux et rassasiant — souvent le premier plat végétarien qui convainc les omnivores." },
        { question: "Comment éviter que la sauce ne soit trop liquide ?", answer: "Deux techniques : réduire à feu vif les 5 dernières minutes en remuant, ou ajouter 1 c. à s. de concentré de tomate en début de cuisson. Les lentilles corail absorbent naturellement beaucoup de liquide — la sauce épaissit en refroidissant." },
        { question: "Peut-on utiliser des lentilles vertes à la place des lentilles corail ?", answer: "Oui mais le résultat est différent. Les lentilles vertes restent entières et donnent une sauce plus rustique avec des lentilles visibles. Pour une texture proche de la bolognaise, les lentilles corail sont clairement meilleures — elles se décomposent complètement." }
      ],
      related_article_ids: [1, 2, 6],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 25,
    data: {
      meta_title: 'Bowl riz complet, pois chiches et légumes | Mamie Végé',
      meta_description: "Bowl végétarien riz complet, pois chiches et légumes : 19 g de protéines et 98 g de glucides. Le bowl batch cooking idéal pour les sportifs d'endurance.",
      intro: "Le bowl riz complet et pois chiches est le repas de batch cooking végétarien le plus simple et le plus efficace pour les sportifs d'endurance. Le riz complet apporte des glucides complexes à index glycémique modéré (IG 50-55) pour une énergie durable. Les pois chiches complètent avec environ 8-9 g de protéines et 2,9 mg de fer pour 100 g cuits (table Ciqual ANSES). La combinaison riz + pois chiches est classique en nutrition végétarienne : le riz apporte la méthionine, les pois chiches la lysine — ensemble, ils couvrent tous les acides aminés essentiels. Les légumes colorés (carottes, courgette, poivron) apportent vitamines, minéraux et antioxydants. Ce bowl se prépare en 5 minutes si le riz et les pois chiches sont déjà cuits.",
      image_alt: "Bowl végétarien coloré avec riz complet, pois chiches, carottes et poivron avec de l'huile d'olive — déjeuner sportif batch cooking",
      sport_timing: "Repas du midi ou de récupération post-entraînement. Dense en glucides — idéal pour les sportifs d'endurance. Plus de riz pour les sorties longues, plus de pois chiches pour la récupération musculaire.",
      conservation: "Composants séparés : riz complet cuit 4-5 jours, pois chiches en boîte 3 jours au frigo. Préparer le riz le dimanche en grande quantité pour assembler le bowl en 5 minutes chaque jour.",
      variants: [
        { title: "Version sauce tahini-citron", description: "Mélanger 2 c. à s. de tahini + 1 citron + ail râpé + 3 c. à s. d'eau. Verser sur le bowl. Apport en protéines et calcium du sésame augmentés (tahini : 17 g de protéines/100 g)." },
        { title: "Version tofu grillé (+ protéines)", description: "Ajouter 100 g de tofu ferme grillé. L'apport protéique passe à environ 28-30 g par portion." },
        { title: "Version froide (déjeuner bureau)", description: "Servir le bowl froid avec des légumes crus (tomates, concombre, roquette) et une vinaigrette citron-herbes. Parfait en déjeuner estival transportable." }
      ],
      nutrition_per_serving: { calories: 661, proteins_g: 19, carbs_g: 98, fat_g: 21, fiber_g: 11, iron_mg: 5 },
      schema_recipe: { recipeCategory: "Déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "bowl riz complet pois chiches légumes végétarien, bowl batch cooking végé endurance, déjeuner riz pois chiches sportif" },
      faq_recette: [
        { question: "Pourquoi utiliser du riz complet plutôt que du riz blanc dans ce bowl ?", answer: "Le riz complet a un index glycémique plus bas (50-55 vs 70 pour le riz blanc), plus de fibres, de magnésium et de vitamines B. Pour les sportifs, la recharge en glycogène est plus progressive et durable. La cuisson est plus longue (35-40 min) — le batch cooking du dimanche résout ce problème." },
        { question: "L'association riz + pois chiches est-elle vraiment intéressante pour les protéines ?", answer: "Oui. Les légumineuses (pois chiches) sont riches en lysine mais pauvres en méthionine. Les céréales (riz) sont riches en méthionine mais pauvres en lysine. Leur association couvre tous les acides aminés essentiels — c'est le principe de la complémentarité végétale." },
        { question: "Comment rendre ce bowl plus savoureux en 2 minutes ?", answer: "Trois astuces : un filet d'huile de sésame sur le dessus pour le goût, une sauce tahini-citron (tahini + citron + eau + ail), et des épices rôties (paprika fumé, cumin, coriandre). Ces éléments transforment un bowl basique en quelque chose de vraiment savoureux." }
      ],
      related_article_ids: [1, 12, 6],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 26,
    data: {
      meta_title: 'Bowl quinoa, tofu et crudités végétarien | Mamie Végé',
      meta_description: 'Bowl végétarien quinoa, tofu et crudités : 30 g de protéines, frais et coloré. Déjeuner sportif végé prêt en 20 min, idéal avant ou après une séance.',
      intro: "Le bowl quinoa-tofu-crudités est le déjeuner végétarien frais et protéiné par excellence. Le quinoa apporte tous les acides aminés essentiels en une seule source — pseudo-céréale à profil complet selon la table Ciqual de l'ANSES. Le tofu mariné et grillé ajoute 12 à 15 g de protéines pour 100 g. La betterave cuite est riche en nitrates naturels associés à l'amélioration des performances en endurance dans plusieurs études. La sauce soja-huile de sésame développe des saveurs umami qui rendent ce bowl très satisfaisant. Ce repas se transporte facilement pour le déjeuner au bureau ou au club.",
      image_alt: "Bowl végétarien avec quinoa, tofu grillé, betterave, carottes et sésame — déjeuner sportif frais et protéiné",
      sport_timing: "Idéal en déjeuner 2 à 3 heures avant une séance de l'après-midi. Ou en récupération post-effort avec du tofu supplémentaire pour les protéines.",
      conservation: "Composants séparés : 3-4 jours au réfrigérateur. Assembler à la demande. Le quinoa cuit se conserve 4-5 jours. Le tofu grillé 3-4 jours.",
      variants: [
        { title: "Version chaud (poêlée wok)", description: "Faire sauter le tofu et les légumes à la poêle wok à feu vif 5 minutes avec sauce soja et ail. Servir sur le quinoa chaud." },
        { title: "Version houmous (sans cuisson)", description: "Remplacer le tofu grillé par 150 g de houmous maison. Tartiné sur la base, avec les crudités par-dessus. Version zéro cuisson." },
        { title: "Version avocat-mangue (estivale)", description: "Ajouter ½ mangue coupée en dés et ½ avocat. Remplacer la vinaigrette par du jus de citron vert. Saveur fraîche et exotique idéale en été." }
      ],
      nutrition_per_serving: { calories: 505, proteins_g: 30, carbs_g: 44, fat_g: 23, fiber_g: 7, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "bowl quinoa tofu crudités végétarien, bowl végé sportif frais, déjeuner quinoa tofu protéiné" },
      faq_recette: [
        { question: "Comment griller le tofu pour ce bowl ?", answer: "Presser le tofu 15 minutes, couper en cubes. Mélanger sauce soja + huile de sésame + ail râpé. Mariner 30 minutes. Cuire à la poêle antiadhésive à feu vif 3-4 minutes par face jusqu'à coloration dorée. Ne pas bouger les cubes pendant les premières minutes — laisser la face se dorer complètement." },
        { question: "La betterave dans ce bowl est-elle utile pour les sportifs ?", answer: "Oui. La betterave est riche en nitrates naturels qui, dans l'organisme, se convertissent en oxyde nitrique — une molécule qui améliore la circulation sanguine et l'oxygénation musculaire. Plusieurs études montrent une amélioration des performances en endurance avec une consommation régulière de betterave ou de jus de betterave." },
        { question: "Peut-on remplacer le tofu par du tempeh dans ce bowl ?", answer: "Oui, et c'est une excellente option. Le tempeh apporte 18-20 g de protéines pour 100 g (contre 12-15 g pour le tofu), avec une meilleure digestibilité grâce à la fermentation. Le goût est plus prononcé. La technique de cuisson est identique." }
      ],
      related_article_ids: [1, 13, 7],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 27,
    data: {
      meta_title: 'Bowl lentilles, patate douce et tofu récup | Mamie Végé',
      meta_description: 'Bowl végétarien lentilles, patate douce et tofu : 44 g de protéines, riche en potassium et fer. Le plat de récupération post-endurance végé le plus complet.',
      intro: "Ce bowl est le repas de récupération post-endurance le plus complet du blog. Il combine trois sources protéiques végétales complémentaires : les lentilles vertes (9 g de protéines et 3,3 mg de fer pour 100 g cuit, Ciqual ANSES), le tofu ferme (12-15 g de protéines/100 g) et le brocoli (protéines végétales + vitamines C pour l'absorption du fer). La patate douce apporte 540 mg de potassium pour 100 g cuite — le minéral le plus perdu par transpiration pendant l'effort, essentiel pour la contraction musculaire. Elle fournit aussi 20 g de glucides complexes pour recharger le glycogène. La marinade soja-paprika pour le tofu développe des saveurs umami qui rendent ce bowl aussi savoureux que nutritif.",
      image_alt: "Bowl végétarien récupération avec lentilles vertes, cubes de patate douce rôtis et tofu mariné grillé — repas post-endurance protéiné",
      sport_timing: "Le repas de récupération post-sport végétarien le plus complet. À consommer dans l'heure après une séance de running, vélo ou trail pour maximiser la fenêtre de récupération musculaire.",
      conservation: "Composants séparés : 4-5 jours au réfrigérateur. La patate douce rôtie et les lentilles cuites se conservent très bien. Assembler à la demande.",
      variants: [
        { title: "Version sans tofu (+ œufs pour ovo-végétariens)", description: "Remplacer le tofu par 2 œufs durs ou pochés. Apport protéique similaire avec un profil en acides aminés différent." },
        { title: "Version courge butternut (automne-hiver)", description: "Remplacer la patate douce par de la courge butternut rôtie. Profil nutritionnel très proche, saveur différente." },
        { title: "Version dressing tahini-curcuma", description: "Mélanger 2 c. à s. tahini + ½ c. à c. curcuma + jus de citron + eau. Verser sur le bowl. Le curcuma ajoute des propriétés anti-inflammatoires." }
      ],
      nutrition_per_serving: { calories: 509, proteins_g: 44, carbs_g: 55, fat_g: 13, fiber_g: 11, iron_mg: 6 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "bowl lentilles patate douce tofu végétarien, repas récupération endurance végé, bowl potassium fer récupération sportive" },
      faq_recette: [
        { question: "Pourquoi la patate douce est-elle recommandée pour la récupération sportive ?", answer: "La patate douce apporte 540 mg de potassium pour 100 g cuite (Ciqual ANSES), un minéral essentiel pour la contraction musculaire fortement perdu par transpiration. Elle apporte aussi 20 g de glucides complexes pour recharger le glycogène et du bêta-carotène antioxydant. C'est une des meilleures sources végétales de glucides + minéraux pour la récupération post-endurance." },
        { question: "Les lentilles vertes et le tofu couvrent-ils tous les acides aminés essentiels ?", answer: "Ensemble, oui. Les lentilles sont riches en lysine. Le tofu (soja) contient tous les acides aminés essentiels. L'association lentilles + tofu donne un profil complet et supérieur à chacun des deux seuls." },
        { question: "Peut-on manger ce bowl froid en salade de déjeuner ?", answer: "Oui. Assembler les composants refroidis avec une vinaigrette citron-moutarde-ail. Excellent en salade de déjeuner transportable. La salade tient bien 24 heures dans un contenant hermétique. Ajouter les herbes fraîches au moment de manger." }
      ],
      related_article_ids: [12, 19, 20],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 28,
    data: {
      meta_title: 'Pâtes complètes sauce pois chiches végé | Mamie Végé',
      meta_description: 'Pâtes complètes sauce pois chiches végétarienne : 26 g de protéines, 102 g de glucides. Le plat de récupération endurance végétarien dense en énergie.',
      intro: "Les pâtes complètes à la sauce pois chiches sont le repas de récupération végétarien idéal après une séance d'endurance longue. La densité glucidique des pâtes complètes (102 g de glucides par portion) relance efficacement la resynthèse du glycogène après un effort soutenu. Les pois chiches apportent environ 8-9 g de protéines et 2,9 mg de fer pour 100 g cuits (table Ciqual ANSES). Les légumes méditerranéens (courgette, poivron, aubergine) ajoutent des antioxydants et de la vitamine C — qui optimise l'absorption du fer végétal des pois chiches. La sauce concentrée peut être mixée pour une texture crémeuse ou laissée rustique avec les légumes en morceaux. Un repas post-vélo, post-trail ou post-match parfait.",
      image_alt: "Assiette de pâtes complètes avec sauce aux pois chiches et légumes méditerranéens — plat de récupération végétarien endurance",
      sport_timing: "Repas de récupération idéal après une longue séance d'endurance (>2h running, vélo, trail). La densité glucidique est optimale pour la resynthèse du glycogène. Aussi en veille de compétition (pasta party végé).",
      conservation: "La sauce se conserve 5 jours au réfrigérateur, 3 mois au congélateur. Cuire les pâtes à la demande. Préparer la sauce en grande quantité le week-end.",
      variants: [
        { title: "Version crémeuse (+ tahini)", description: "Ajouter 2 c. à s. de tahini et 100 ml de lait végétal dans la sauce en fin de cuisson. Texture très crémeuse, calcium du sésame en bonus." },
        { title: "Version épinards (+ fer)", description: "Ajouter 150 g d'épinards frais dans la sauce les 2 dernières minutes. Apport en fer et magnésium augmenté — important pour les coureurs végétariens." },
        { title: "Version pâtes de légumineuses (sans gluten)", description: "Remplacer les pâtes complètes par des pâtes de pois chiches ou de lentilles corail. Apport protéique total passe à environ 35-38 g, sans gluten." }
      ],
      nutrition_per_serving: { calories: 627, proteins_g: 26, carbs_g: 102, fat_g: 11, fiber_g: 13, iron_mg: 6 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "pâtes pois chiches végétariennes, pâtes sauce végétalienne récupération endurance, pasta party végé sportif" },
      faq_recette: [
        { question: "Quelle quantité de pâtes cuire pour une récupération optimale après une longue sortie ?", answer: "Pour un sportif de 65-75 kg après 2h de course ou de vélo : 100-130 g de pâtes complètes sèches (300-400 g cuites). Cela apporte 70-90 g de glucides. Accompagner de la sauce pois chiches pour les protéines (viser 25-35 g au total). Si la séance a duré plus de 3h, augmenter à 150 g sèches." },
        { question: "Peut-on mixer la sauce pois chiches pour une texture plus lisse ?", answer: "Oui. Après cuisson, mixer la moitié ou la totalité de la sauce avec un mixeur plongeant. La sauce devient crémeuse et enrobe parfaitement les pâtes. Les pois chiches entiers restants dans la sauce non mixée apportent de la texture." },
        { question: "Cette recette convient-elle comme pasta party végé la veille d'une compétition ?", answer: "Oui, c'est même une excellente version végétarienne de la pasta party. Favoriser les pâtes blanches plutôt que complètes la veille (digestion plus rapide, moins de fibres). Réduire la quantité de légumes (moins de fibres, moins de risque de ballonnements) et augmenter la quantité de pâtes." }
      ],
      related_article_ids: [1, 12, 6],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 29,
    data: {
      meta_title: 'Soupe légumes aux lentilles corail végé | Mamie Végé',
      meta_description: 'Soupe de légumes aux lentilles corail végétarienne : réconfortante et protéinée. Repas de récupération doux post-entraînement, riche en fer et en fibres.',
      intro: "La soupe de légumes aux lentilles corail est la soupe sportive végétarienne la plus complète : légumineuses pour les protéines et le fer, légumes variés pour les vitamines et antioxydants, bouillon pour la réhydratation post-effort. Les lentilles corail cuisent sans trempage et s'intègrent naturellement dans le bouillon, épaississant la soupe progressivement sans mixeur nécessaire. Selon la table Ciqual de l'ANSES, les lentilles corail cuites apportent environ 9 g de protéines et 3,3 mg de fer pour 100 g. Le poireau et les pommes de terre ajoutent des glucides complexes et du potassium. Un bol de soupe avec une tranche de pain complet est un repas de récupération complet — protéines, glucides et minéraux réunis.",
      image_alt: "Grande assiette de soupe végétarienne orange aux lentilles corail et légumes avec du persil frais — repas de récupération sportif doux",
      sport_timing: "Repas de récupération doux post-entraînement, idéal le soir ou après une sortie de running froide. Servir avec du pain complet pour les glucides supplémentaires.",
      conservation: "Se conserve 5 jours au réfrigérateur. Se congèle 3 mois en portions individuelles. La soupe épaissit en refroidissant — ajouter un peu d'eau au réchauffage.",
      variants: [
        { title: "Version veloutée", description: "Mixer la totalité de la soupe avec un mixeur plongeant en fin de cuisson. Texture veloutée et crémeuse. Ajouter 100 ml de crème végane pour une version encore plus onctueuse." },
        { title: "Version thaï (lait de coco + gingembre)", description: "Ajouter 200 ml de lait de coco, 1 c. à s. de gingembre râpé et 1 c. à c. de pâte de curry rouge. Saveur exotique et propriétés anti-inflammatoires." },
        { title: "Version hivernale (potimarron)", description: "Ajouter 200 g de potimarron en dés en même temps que les légumes. Glucides et bêta-carotène augmentés, saveur légèrement sucrée." }
      ],
      nutrition_per_serving: { calories: 234, proteins_g: 8, carbs_g: 21, fat_g: 13, fiber_g: 6, iron_mg: 3 },
      schema_recipe: { recipeCategory: "Soupe", recipeCuisine: "Végétarienne", keywords: "soupe légumes lentilles corail végétarienne, soupe végé sportif récupération, potage lentilles végétalien" },
      faq_recette: [
        { question: "Comment optimiser l'absorption du fer dans cette soupe ?", answer: "Ajouter un filet de jus de citron frais à la soupe au service. La vitamine C du citron multiplie l'absorption du fer non héminique des lentilles par 3 à 4 selon les données de l'ANSES (avis alimentation végétarienne 2021). Éviter de boire du thé ou du café dans l'heure qui suit." },
        { question: "Cette soupe peut-elle remplacer un repas complet après le sport ?", answer: "Oui, à condition d'ajouter une source de glucides (2 tranches de pain complet) et une source de graisses (un filet d'huile d'olive ou des graines). La soupe seule manque de glucides pour la récupération optimale du glycogène." },
        { question: "Peut-on ajouter des protéines supplémentaires à cette soupe ?", answer: "Oui. Ajouter des dés de tofu ferme avec les légumes en début de cuisson (150 g pour 30 g de protéines supplémentaires). Ou stirrer une cuillère de tahini dans le bol juste avant de servir (17 g de protéines pour 100 g de tahini)." }
      ],
      related_article_ids: [1, 15, 12],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 30,
    data: {
      meta_title: 'Porridge boost endurance running et vélo | Mamie Végé',
      meta_description: 'Porridge boost endurance végétarien : 63 g de glucides, prêt en 10 min. Le petit-déjeuner végé idéal avant une longue sortie running, vélo ou trail.',
      intro: "Le porridge boost endurance est le petit-déjeuner spécialement formulé pour les longues sorties de running, de vélo ou de trail. À la différence d'un porridge classique axé protéines, celui-ci maximise les glucides : flocons d'avoine denses (60 g de glucides pour 100 g sec, Ciqual ANSES), banane (23 g de glucides/100 g, IG 55), raisins secs et graines de chia. L'objectif est de charger les réserves de glycogène musculaire avant l'effort. La banane apporte aussi 422 mg de potassium — le minéral le plus perdu par transpiration. Les graines de chia absorbent de l'eau et peuvent améliorer l'hydratation de départ. La cannelle a un index glycémique bas et ralentit légèrement l'absorption des glucides pour une énergie encore plus progressive.",
      image_alt: "Grand bol de porridge épais avec banane, raisins secs et graines de chia — petit-déjeuner endurance végétarien avant longue sortie",
      sport_timing: "2 à 3 heures avant une longue sortie de running (>1h30), de vélo ou de trail. La fenêtre de 2-3h permet la digestion complète tout en maintenant les réserves de glycogène maximales.",
      conservation: "Préparer la base flocons + lait végétal la veille. Le matin, réchauffer et ajouter la banane fraîche et les raisins. Ne pas ajouter les graines de chia la veille si on veut éviter une texture trop gélatineuse.",
      variants: [
        { title: "Version ultra-endurance (avant marathon ou triathlon)", description: "Ajouter 50 g de riz soufflé ou de flocons de maïs sur le dessus. Apport glucidique passe à environ 90-100 g. Pour les ultra-efforts de 4h+." },
        { title: "Version légère (avant footing 45-60 min)", description: "Réduire à 60 g de flocons et supprimer les raisins secs. Apport glucidique réduit à environ 45 g — suffisant pour une heure de footing léger." },
        { title: "Version fruits de saison", description: "Remplacer la banane par des poires en automne, des fraises au printemps, de la mangue en été. Même apport glucidique avec des saveurs variées selon les saisons." }
      ],
      nutrition_per_serving: { calories: 569, proteins_g: 20, carbs_g: 63, fat_g: 23, fiber_g: 8, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Petit-déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "porridge endurance végétarien, petit déjeuner avant running vélo végé, porridge glucides longue sortie sportif" },
      faq_recette: [
        { question: "Pourquoi ce porridge est-il moins riche en protéines que le porridge classique ?", answer: "C'est intentionnel. Avant un effort d'endurance long, l'objectif est de maximiser les réserves de glycogène (glucides), pas d'apporter des protéines en grande quantité. Les protéines ralentissent la digestion et peuvent créer un inconfort digestif pendant l'effort. 12-15 g de protéines dans ce porridge sont suffisants." },
        { question: "Peut-on manger ce porridge seulement 1 heure avant la sortie ?", answer: "Possible mais risqué — la digestion de l'avoine prend environ 2 heures. Si tu dois manger 1 heure avant, réduire la portion à 50 g de flocons, supprimer les graines de chia (fibres gélatineuses) et remplacer les fruits par une banane seule (digestion rapide). Tester à l'entraînement avant une compétition." },
        { question: "Les graines de chia sont-elles vraiment utiles avant une sortie sportive ?", answer: "Les graines de chia absorbent jusqu'à 10 fois leur poids en eau, ce qui peut améliorer la rétention d'eau et l'hydratation de départ. Elles apportent aussi des oméga-3 ALA. Certaines personnes ont des inconforts digestifs avec les graines de chia — tester à l'entraînement avant une compétition." }
      ],
      related_article_ids: [6, 12, 4],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 31,
    data: {
      meta_title: 'Riz complet, patate douce et lentilles végé | Mamie Végé',
      meta_description: 'Bowl riz complet, patate douce et lentilles végé : 20 g de protéines, 85 g de glucides. Repas récupération post-endurance végétarien en 3 ingrédients.',
      intro: "Ce bowl de trois ingrédients est le repas de récupération post-endurance végétarien le plus complet par rapport à son effort de préparation. Le riz complet apporte des glucides complexes à index glycémique modéré pour recharger progressivement le glycogène. La patate douce fournit 540 mg de potassium pour 100 g cuite (table Ciqual ANSES) — le minéral le plus perdu par transpiration — et du bêta-carotène antioxydant. Les lentilles vertes complètent avec 9 g de protéines et 3,3 mg de fer pour 100 g cuit. L'association de ces trois ingrédients couvre simultanément les besoins en glucides de récupération, en protéines pour la réparation musculaire, et en minéraux (potassium, fer, magnésium). Tout cela avec un minimum de préparation si les ingrédients sont déjà cuits en batch cooking.",
      image_alt: "Bowl végétarien avec riz complet, rondelles de patate douce rôtie et lentilles vertes avec du persil — repas récupération post-endurance",
      sport_timing: "Repas de récupération idéal après une longue sortie de running, de vélo ou de trail. À consommer dans les 2 heures après l'effort pour maximiser la resynthèse du glycogène.",
      conservation: "Chaque composant se conserve séparément 4-5 jours au réfrigérateur. Préparer en batch cooking le dimanche. Assembler en 5 minutes à la demande.",
      variants: [
        { title: "Version protéinée (+ tofu ou œuf)", description: "Ajouter 100 g de tofu ferme grillé ou 2 œufs durs. L'apport protéique passe à environ 30-32 g par portion." },
        { title: "Version épicée (ras el hanout)", description: "Assaisonner la patate douce avec 1 c. à c. de ras el hanout avant rôtissage. La saveur marocaine se marie parfaitement avec les lentilles et le riz complet." },
        { title: "Version brocoli vapeur (+ vitamine C)", description: "Remplacer ou compléter les lentilles avec 150 g de brocoli vapeur. Le brocoli est riche en vitamine C (89 mg/100 g) qui optimise l'absorption du fer des lentilles." }
      ],
      nutrition_per_serving: { calories: 599, proteins_g: 20, carbs_g: 85, fat_g: 17, fiber_g: 11, iron_mg: 5 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "riz complet patate douce lentilles végétarien, bowl récupération endurance végé, repas potassium fer sportif végétarien" },
      faq_recette: [
        { question: "Quel est le meilleur moment pour manger ce bowl après un entraînement ?", answer: "Dans les 30 à 60 minutes idéalement (fenêtre de récupération optimale), et en tout cas dans les 2 heures. Les muscles sont alors particulièrement réceptifs aux glucides pour la resynthèse du glycogène et aux protéines pour la réparation musculaire." },
        { question: "Peut-on préparer la patate douce au four à l'avance ?", answer: "Oui, c'est même recommandé. Cuire en grande quantité au four 200°C pendant 25-30 minutes le dimanche. Elle se conserve 4-5 jours au réfrigérateur et se récupère en 2 minutes de micro-ondes. Couper en dés ou rondelles avant rôtissage pour une cuisson plus uniforme." },
        { question: "Pourquoi associer riz complet + lentilles pour les acides aminés ?", answer: "Le riz est riche en méthionine mais pauvre en lysine. Les lentilles sont riches en lysine mais pauvres en méthionine. Leur association couvre tous les acides aminés essentiels — c'est le principe de la complémentarité végétale classique, pratiquée dans toutes les cuisines végétariennes du monde." }
      ],
      related_article_ids: [12, 6, 20],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 32,
    data: {
      meta_title: 'Gnocchis patate douce, épinards et tofu | Mamie Végé',
      meta_description: 'Gnocchis végétariens patate douce, épinards et tofu : 31 g de protéines, plat réconfortant 35 min. Récupération post-marathon végétarienne par excellence.',
      intro: "Les gnocchis à la patate douce sont le plat de récupération réconfortant après une séance longue ou une compétition. La patate douce remplace la pomme de terre classique en apportant plus de bêta-carotène et de potassium (540 mg/100 g selon Ciqual ANSES). Le tofu ferme apporte 12-15 g de protéines pour 100 g avec tous les acides aminés essentiels. Les épinards complètent avec du magnésium et du fer végétal (3,6 mg/100 g cuit, Ciqual ANSES). La farine de blé complète lie les gnocchis tout en apportant des glucides complexes et des vitamines B. Ce plat post-compétition végétarien est aussi satisfaisant qu'un plat de pâtes classique post-marathon, avec une meilleure densité en micronutriments.",
      image_alt: "Gnocchis de patate douce orange avec épinards et cubes de tofu dans un plat — dîner végétarien réconfortant récupération marathon",
      sport_timing: "Repas de récupération réconfortant après une compétition ou une séance très longue. La densité glucidique et protéique est idéale pour la récupération profonde.",
      conservation: "Les gnocchis crus (non cuits) se conservent 24 heures au réfrigérateur sur une plaque farinée. Les gnocchis cuits se conservent 2 jours au réfrigérateur. Ne pas congeler (la texture change à la décongélation).",
      variants: [
        { title: "Version sauce tomate (plus légère)", description: "Remplacer le tofu et les épinards par une sauce tomate-basilic maison. Plus légère, excellent rapport protéines/glucides pour la récupération post-course." },
        { title: "Version gnocchis maison simplifiés", description: "Cuire 2 patates douces au four, écraser la chair, ajouter 120 g de farine complète + sel. Pétrir, former des boudins, couper en gnocchis. Plus long mais saveur supérieure." },
        { title: "Version sans gluten", description: "Remplacer la farine de blé par de la farine de riz ou de la fécule de pomme de terre. Ajouter 1 c. à s. de psyllium pour lier la pâte. Tester avec une petite quantité avant de former tous les gnocchis." }
      ],
      nutrition_per_serving: { calories: 472, proteins_g: 31, carbs_g: 49, fat_g: 15, fiber_g: 8, iron_mg: 5 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "gnocchis patate douce tofu végétarien, gnocchis végétaliens sportif, gnocchis épinards récupération marathon" },
      faq_recette: [
        { question: "Comment obtenir des gnocchis de patate douce qui ne s'effondrent pas à la cuisson ?", answer: "La règle d'or : bien déssécher la purée de patate douce avant d'ajouter la farine. Cuire la patate douce au four (pas à la vapeur — trop d'humidité) et laisser refroidir complètement. Ajouter la farine petit à petit jusqu'à obtenir une pâte qui ne colle pas aux mains. Ne pas trop travailler la pâte." },
        { question: "Peut-on faire ces gnocchis à l'avance ?", answer: "Oui. Préparer les gnocchis crus (non cuits) et les disposer en une seule couche sur une plaque farinée. Réfrigérer jusqu'à 24 heures. Cuire directement dans l'eau bouillante sans décongeler. Cette organisation permet de préparer le plat en 10 minutes le soir venu." },
        { question: "Le tofu peut-il se remplacer dans cette recette ?", answer: "Oui. Le tempeh grillé apporte encore plus de protéines (18-20 g/100 g) et un goût plus prononcé. Les pois chiches rôtis au four (200°C, 25 min avec paprika) donnent un résultat croustillant et protéiné. La feta émiettée (version ovo-lacto) apporte du calcium et de la saveur." }
      ],
      related_article_ids: [12, 19, 7],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 33,
    data: {
      meta_title: 'Fajitas végé quinoa et haricots rouges | Mamie Végé',
      meta_description: 'Fajitas végétariennes quinoa et haricots rouges : 12 g de protéines, prêtes en 20 min. Repas convivial végé pour les soirs de semaine sportifs.',
      intro: "Les fajitas végétariennes quinoa-haricots rouges sont le repas convivial par excellence pour les sportifs végétariens. Le quinoa apporte tous les acides aminés essentiels en une seule source (pseudo-céréale à profil complet). Les haricots rouges complètent avec des glucides rapides et des protéines végétales supplémentaires (8-9 g/100 g cuits, Ciqual ANSES). L'avocat en garniture ajoute des graisses mono-insaturées cardioprotectrices et de la satiété. Les wraps complets apportent des glucides complexes. La coriandre fraîche et le citron ajoutent de la vitamine C — qui optimise l'absorption du fer des haricots rouges. Un repas festif prêt en 20 minutes.",
      image_alt: "Fajitas végétariennes garnies de quinoa, haricots rouges, avocat et maïs avec de la coriandre — repas convivial végé express",
      sport_timing: "Repas post-entraînement du soir ou déjeuner sportif. L'association quinoa + haricots rouges + tortilla apporte glucides rapides et protéines pour la récupération. Ajouter du tofu pour plus de protéines si la séance était intense.",
      conservation: "Garniture (quinoa + haricots) : 4 jours au réfrigérateur. Accompagnements (avocat, coriandre) : préparer au moment. Tortillas dans leur emballage d'origine.",
      variants: [
        { title: "Version protéinée (+ tempeh émietté)", description: "Émietter 150 g de tempeh dans la poêle avec le quinoa et les épices. Apport protéique passe à environ 22-25 g par portion." },
        { title: "Version bowl (sans tortilla)", description: "Servir la garniture sur un lit de riz complet ou de salade de roquette. Réduit les glucides raffinés, augmente les fibres." },
        { title: "Version piment et fromage végane", description: "Ajouter 1 c. à c. de piment chipotle en poudre dans la garniture + 50 g de fromage végane râpé sur le dessus. Saveur tex-mex plus prononcée." }
      ],
      nutrition_per_serving: { calories: 352, proteins_g: 12, carbs_g: 67, fat_g: 3, fiber_g: 9, iron_mg: 3 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "fajitas végétariennes quinoa haricots rouges, fajitas sans viande végé convivial, fajitas végétalien sportif" },
      faq_recette: [
        { question: "Comment assembler des fajitas végétariennes sans qu'elles soient sèches ?", answer: "La clé est l'humidité de la garniture et la qualité de la tortilla. Chauffer les tortillas 30 secondes dans une poêle sèche. La garniture doit avoir un peu de sauce (salsa ou jus de citron). Ajouter du guacamole ou de la crème végane pour le côté crémeux." },
        { question: "Peut-on préparer la garniture à l'avance ?", answer: "Oui. La garniture quinoa + haricots rouges + épices se prépare jusqu'à 4 jours à l'avance. Les épices ont le temps de se développer. Réchauffer à la poêle ou au micro-ondes. L'avocat et la salsa se préparent au moment." },
        { question: "Peut-on remplacer le quinoa par du riz dans ces fajitas ?", answer: "Oui. Le riz complet fonctionne très bien. Le quinoa est préférable nutritionnellement car il apporte tous les acides aminés essentiels (profil complet) — le riz ne couvre pas la lysine seul. Mais l'association riz + haricots rouges compense en couvrant ensemble tous les acides aminés." }
      ],
      related_article_ids: [1, 12, 9],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 34,
    data: {
      meta_title: 'Soupe potimarron et lentilles corail végé | Mamie Végé',
      meta_description: 'Soupe veloutée potimarron et lentilles corail végétarienne : riche en fer et en bêta-carotène. Repas de récupération hivernal réconfortant pour sportifs.',
      intro: "La soupe potimarron-lentilles corail est la soupe de récupération hivernale végétarienne par excellence. Le potimarron apporte du bêta-carotène (précurseur de la vitamine A antioxydante) et une douceur naturelle qui équilibre les épices du curry. Les lentilles corail fondent dans le bouillon, épaississant naturellement la soupe — 9 g de protéines et 3,3 mg de fer pour 100 g cuit (table Ciqual ANSES). Le pain complet en accompagnement ajoute des glucides complexes pour compléter le repas. Le houmous servi à côté apporte des protéines supplémentaires et des graisses de qualité. Un bol réconfortant et nutritionnellement complet pour les soirs d'entraînement d'automne-hiver.",
      image_alt: "Soupe veloutée orange de potimarron et lentilles corail dans un bol avec une touche de crème végane — repas hivernal végétarien réconfortant",
      sport_timing: "Repas de récupération doux post-entraînement, idéal le soir en automne-hiver. La soupe réhydrate, les lentilles apportent les protéines et le pain complet les glucides de récupération.",
      conservation: "Se conserve 5 jours au réfrigérateur. Se congèle 3 mois en portions individuelles. Ajouter un filet de citron et une touche de crème végane au service.",
      variants: [
        { title: "Version épicée (curry + gingembre)", description: "Ajouter 1 c. à c. de curry en poudre + ½ c. à c. de gingembre râpé en début de cuisson. La saveur épicée équilibre la douceur du potimarron." },
        { title: "Version courge butternut", description: "Remplacer le potimarron par de la courge butternut (profil nutritionnel très proche, texture légèrement plus fluide)." },
        { title: "Version lait de coco (+ onctuosité)", description: "Remplacer 200 ml de bouillon par 200 ml de lait de coco. Soupe plus crémeuse et onctueuse, légèrement plus calorique." }
      ],
      nutrition_per_serving: { calories: 192, proteins_g: 6, carbs_g: 17, fat_g: 11, fiber_g: 5, iron_mg: 3 },
      schema_recipe: { recipeCategory: "Soupe", recipeCuisine: "Végétarienne", keywords: "soupe potimarron lentilles corail végétarienne, soupe végé hiver sportif, velouté potimarron végétalien" },
      faq_recette: [
        { question: "Faut-il éplucher le potimarron ?", answer: "Non, c'est un des avantages du potimarron. Sa peau est fine et entièrement comestible après cuisson, contrairement à la butternut. Simplement frotter la peau sous l'eau froide avant de couper. Garder la peau apporte plus de fibres et de nutriments." },
        { question: "Peut-on faire cette soupe sans mixeur ?", answer: "Oui. Si on laisse cuire les lentilles corail assez longtemps (25-30 minutes), elles se décomposent complètement. Le potimarron s'écrase facilement à la fourchette si coupé finement au départ. La soupe sera moins lisse mais reste excellente." },
        { question: "Le houmous mentionné dans les ingrédients sert-il à la cuisson ou à l'accompagnement ?", answer: "Le houmous dans cette recette sert d'accompagnement — tartiné sur le pain complet servi à côté de la soupe. Il apporte des protéines supplémentaires (environ 8 g/100 g selon Ciqual ANSES) et des graisses de qualité pour compléter nutritionnellement ce repas de récupération." }
      ],
      related_article_ids: [12, 15, 1],
      updated_date: '2026-04-02'
    }
  }
];

async function run() {
  console.log('🚀 Enrichissement batch 2 — 19 recettes\n');

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

  const ids = updates.map(u => u.id);

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

  const { data: allTitles } = await supabase
    .from('recipes')
    .select('id, meta_title');

  const tooLong = (allTitles || []).filter(r => (r.meta_title || '').length > 60);
  console.log(`\n3. meta_title > 60 chars dans toute la table : ${tooLong.length === 0 ? '✅ 0' : '❌ ' + tooLong.length}`);
  for (const r of tooLong) {
    console.log(`   ❌ ID ${r.id} — ${(r.meta_title || '').length} chars — ${r.meta_title}`);
  }

  console.log('\n✨ Terminé');
}

run().catch(e => { console.error(e); process.exit(1); });
