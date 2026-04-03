#!/usr/bin/env node
/**
 * SEO Fix 5 — mamie-vege.fr — 03/04/2026
 * Enrichissement éditorial complet des 6 recettes prioritaires (rapport audit)
 * IDs : 13, 15, 16, 18, 19, 20
 * Sources nutritionnelles : Ciqual ANSES 2021
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// ── Charger .env.local ──────────────────────────────────────────────────────
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

// ── Recettes à enrichir ─────────────────────────────────────────────────────
const updates = [
  {
    id: 13,
    data: {
      meta_title: 'Chili végétarien aux haricots rouges | Mamie Végé',
      meta_description: 'Chili végétarien haricots rouges et maïs : 13 g de protéines, riche en fer, batch cooking idéal. Recette végé express 30 min pour sportifs.',
      intro: "Le chili sin carne est le plat batch cooking par excellence du sportif végétarien. Les haricots rouges apportent environ 8 à 9 g de protéines et 2,9 mg de fer pour 100 g cuits selon la table Ciqual de l'ANSES. Associés aux tomates concassées, riches en vitamine C, l'absorption du fer végétal est multipliée par 3 à 4 — une synergie nutritionnelle particulièrement utile pour les coureurs végétariens. Ce chili se prépare en 30 minutes et se bonifie avec le temps : les épices (cumin, chili) s'infusent davantage le lendemain, les arômes se développent. Préparer 6 à 8 portions le dimanche couvre les dîners de récupération de toute la semaine. Le poivron rouge ajoute de la vitamine C supplémentaire, tandis que l'avocat en garniture apporte des graisses mono-insaturées cardioprotectrices.",
      image_alt: "Bol de chili végétarien aux haricots rouges et maïs avec de l'avocat et de la coriandre — recette végétarienne batch cooking",
      sport_timing: "Excellent repas de récupération post-entraînement le soir. Les haricots rouges + riz complet en accompagnement donnent glucides et protéines pour reconstituer le glycogène. Éviter les 2 heures avant une séance : les fibres des haricots peuvent provoquer des inconforts digestifs.",
      conservation: "Se conserve 5 jours au réfrigérateur dans un contenant hermétique. Congélation possible 3 mois en portions individuelles. Le chili s'améliore après 24-48 heures — les épices développent leur saveur. Ajouter l'avocat frais uniquement au service.",
      variants: [
        { title: "Version prise de masse (+ lentilles)", description: "Ajouter 150 g de lentilles vertes rincées à mi-cuisson (25 minutes). L'apport protéique passe à environ 18-20 g par portion avec un profil en fer renforcé." },
        { title: "Version légère (sans maïs)", description: "Supprimer le maïs et doubler les poivrons. Apport glucidique réduit de ~15 g par portion, fibres augmentées. Idéal en phase de sèche ou pour alléger la digestion avant une compétition." },
        { title: "Version express (pois chiches en boîte)", description: "Remplacer les haricots rouges par 2 boîtes de pois chiches égouttés. Cuisson réduite à 20 minutes. Profil nutritionnel similaire : 8-9 g P et 2,9 mg fer pour 100 g (Ciqual ANSES)." }
      ],
      nutrition_per_serving: { calories: 348, proteins_g: 13, carbs_g: 69, fat_g: 2, fiber_g: 12, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "chili végétarien haricots rouges, chili sin carne végé sportif, chili végétalien batch cooking" },
      faq_recette: [
        { question: "Peut-on faire ce chili végétarien en grande quantité pour toute la semaine ?", answer: "Oui, c'est même son mode d'utilisation principal. Doubler ou tripler les quantités. Le chili se conserve 5 jours au frigo et 3 mois au congélateur. C'est la base idéale du batch cooking végétarien du dimanche pour couvrir les repas de la semaine." },
        { question: "Avec quoi servir ce chili végétarien pour un repas de récupération sportive complet ?", answer: "Servir avec 100 à 150 g de riz complet cuit pour les glucides de récupération, ou des tortillas complètes. L'association haricots rouges + riz donne un profil d'acides aminés complet. Ajouter un filet de jus de citron pour optimiser l'absorption du fer." },
        { question: "Ce chili végétarien convient-il avant une compétition sportive ?", answer: "Pas la veille ni le matin d'une compétition. Les haricots rouges sont riches en fibres et FODMAP qui peuvent provoquer des ballonnements pendant l'effort. Réserver ce plat aux jours d'entraînement ordinaires ou en récupération. La veille d'une compétition, préférer pâtes ou riz avec une sauce légère." }
      ],
      related_article_ids: [1, 2, 9],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 15,
    data: {
      meta_title: 'Salade pois chiches méditerranéenne végé | Mamie Végé',
      meta_description: 'Salade de pois chiches méditerranéenne végétarienne : 19 g de protéines, riche en fer et en fibres. Déjeuner frais, transportable et sans cuisson.',
      intro: "La salade méditerranéenne aux pois chiches est le déjeuner transportable idéal pour les sportifs végétariens. Les pois chiches apportent environ 8 à 9 g de protéines et 2,9 mg de fer pour 100 g cuits selon la table Ciqual de l'ANSES. La combinaison citron + pois chiches est stratégique pour les végétariens : la vitamine C du citron multiplie l'absorption du fer non héminique par 3 à 4 selon les données de l'ANSES (avis alimentation végétarienne 2021). Les olives Kalamata apportent des graisses mono-insaturées comparables à celles de l'huile d'olive — cardioprotectrices et rassasiantes. Cette salade ne nécessite aucune cuisson, se prépare en 10 minutes avec des pois chiches en boîte, et se transporte facilement dans n'importe quel contenant hermétique. Elle se bonifie au réfrigérateur en absorbant la vinaigrette.",
      image_alt: "Salade de pois chiches méditerranéenne colorée avec olives Kalamata, concombre et tomates cerises — déjeuner végétarien sans cuisson",
      sport_timing: "Idéale en déjeuner 2 à 3 heures avant une séance de l'après-midi. Légère et digeste. Ou en repas post-effort froid, transportable pour les sportifs qui s'entraînent loin de chez eux.",
      conservation: "Se conserve 3 à 4 jours au réfrigérateur. Garder la vinaigrette à part pour éviter que la salade ne devienne molle. Ajouter les herbes fraîches au service. Idéale préparée en grande quantité le dimanche.",
      variants: [
        { title: "Version feta (+ calcium et protéines)", description: "Émietter 80 g de feta sur la salade. Apport : +8 g de protéines et calcium augmenté. La feta complète le profil en acides aminés des pois chiches." },
        { title: "Version quinoa (repas complet post-sport)", description: "Ajouter 150 g de quinoa cuit. Glucides et protéines augmentés — la salade devient un bowl complet pour la récupération. Le quinoa apporte tous les acides aminés essentiels." },
        { title: "Version piment rouge (anti-inflammatoire)", description: "Ajouter ½ poivron rouge cru en lamelles et 1 c. à c. de paprika fumé. Le poivron rouge apporte 190 mg de vitamine C pour 100 g — encore plus d'absorption du fer des pois chiches." }
      ],
      nutrition_per_serving: { calories: 597, proteins_g: 19, carbs_g: 62, fat_g: 32, fiber_g: 10, iron_mg: 5 },
      schema_recipe: { recipeCategory: "Déjeuner", recipeCuisine: "Végétarienne", keywords: "salade pois chiches végétarienne méditerranéenne, salade végé transportable sportif, salade pois chiches fer vitamine C" },
      faq_recette: [
        { question: "Les pois chiches en boîte sont-ils aussi nutritifs que les secs cuits maison ?", answer: "Oui, la teneur en protéines, fibres et minéraux est identique après cuisson. Rincer abondamment à l'eau froide réduit la teneur en sodium de 40% environ. Pour le batch cooking, les pois chiches secs sont 3 fois moins chers." },
        { question: "Peut-on préparer cette salade à l'avance pour le bureau ?", answer: "Oui. Préparer la base (pois chiches + légumes) jusqu'à 3 jours à l'avance, garder la vinaigrette à part. Ajouter les herbes fraîches au service — elles perdent leur goût et leur couleur après 24h." },
        { question: "Comment rendre cette salade encore plus protéinée pour après une séance de musculation ?", answer: "Ajouter 100 g de tofu fumé en dés (12-15 g de protéines/100 g selon Ciqual ANSES) ou 80 g de feta émiettée (+8 g de protéines). Pour une version végane, doubler la portion de pois chiches et ajouter 2 c. à s. de graines de chanvre (30 g de protéines/100 g)." }
      ],
      related_article_ids: [1, 7, 20],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 16,
    data: {
      meta_title: 'Risotto champignons et noix végétarien | Mamie Végé',
      meta_description: 'Risotto végétarien aux champignons et noix : plat réconfortant riche en magnésium et glucides de récupération. Recette végé 35 min pour sportifs.',
      intro: "Le risotto aux champignons et noix est le plat de récupération réconfortant pour les jours d'entraînement intense. Le riz arborio apporte des glucides à digestion rapide pour reconstituer les réserves de glycogène. Les champignons sont une source naturelle de vitamine D — surtout lorsqu'ils ont été exposés à la lumière UV avant séchage — et de potassium utile après la transpiration. Les noix concassées sont la meilleure source végétale d'acide alpha-linolénique (ALA, oméga-3), avec environ 2,5 g d'ALA pour 30 g selon la table Ciqual de l'ANSES. La levure nutritionnelle apporte des protéines végétales supplémentaires et, si elle est enrichie, de la vitamine B12 — le complément obligatoire pour les végétaliens. Ce risotto prend 35 minutes et n'est meilleur que fraîchement préparé.",
      image_alt: "Risotto crémeux aux champignons avec noix concassées et levure nutritionnelle dans un plat — dîner végétarien réconfortant post-sport",
      sport_timing: "Repas post-entraînement du soir par excellence. Les glucides du riz arborio rechargent rapidement le glycogène après un effort intense. Éviter avant une séance : la préparation est trop longue à digérer.",
      conservation: "Se conserve 2 à 3 jours au réfrigérateur. Le risotto durcit en refroidissant — ajouter quelques cuillerées d'eau ou de bouillon et réchauffer à feu doux en remuant vigoureusement 2 minutes pour retrouver la texture crémeuse. Éviter la congélation (texture granuleuse à la décongélation).",
      variants: [
        { title: "Version protéinée (+ tempeh grillé)", description: "Faire griller 150 g de tempeh en dés et incorporer en fin de cuisson. L'apport protéique par portion passe à environ 18-20 g. Le tempeh apporte 18-20 g de protéines/100 g avec une meilleure digestibilité grâce à la fermentation." },
        { title: "Version végane (sans parmesan)", description: "Remplacer le parmesan par 3 c. à s. de levure nutritionnelle + 1 c. à s. de miso blanc. Apport en umami équivalent, version 100% végétalienne. Si la levure est enrichie en B12, c'est aussi un apport de vitamine B12." },
        { title: "Version champignons séchés intensifiés", description: "Faire tremper 20 g de cèpes séchés dans 200 ml d'eau chaude 15 minutes. Utiliser l'eau de trempage filtrée à la place d'une partie du bouillon. Goût très intensifié." }
      ],
      nutrition_per_serving: { calories: 331, proteins_g: 9, carbs_g: 37, fat_g: 15, fiber_g: 4, iron_mg: 2 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "risotto champignons noix végétarien, risotto végé récupération sportif, risotto protéiné sans viande" },
      faq_recette: [
        { question: "La levure nutritionnelle est-elle vraiment riche en protéines ?", answer: "Oui. La levure nutritionnelle sèche contient environ 45-50 g de protéines pour 100 g avec un profil en acides aminés très complet. 2 à 3 cuillères à soupe (15-20 g) apportent environ 7-10 g de protéines supplémentaires. Si elle est enrichie en B12, elle couvre aussi en partie les besoins des végétaliens en vitamine B12." },
        { question: "Peut-on faire ce risotto sans vin blanc ?", answer: "Oui. Remplacer le vin blanc par la même quantité de bouillon de légumes supplémentaire avec une cuillère à soupe de vinaigre de cidre ou de jus de citron. L'acidité du vin blanc aide à équilibrer le goût — l'acide remplace cet apport. Le résultat est légèrement différent mais tout à fait savoureux." },
        { question: "Les noix dans le risotto apportent-elles vraiment des oméga-3 utiles pour le sport ?", answer: "Oui. Les noix sont la meilleure source végétale d'ALA (acide alpha-linolénique). 30 g de noix apportent environ 2,5 g d'ALA selon Ciqual ANSES. L'ALA doit être converti en DHA et EPA actifs — conversion partielle (5-10%). Les végétariens sans poisson peuvent envisager un complément d'huile d'algues (DHA directement disponible)." }
      ],
      related_article_ids: [1, 18, 11],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 18,
    data: {
      meta_title: 'Dhal de lentilles corail au lait de coco | Mamie Végé',
      meta_description: 'Dhal végétarien de lentilles corail au lait de coco : recette indienne express 30 min, riche en fer et en protéines végétales. Budget maîtrisé.',
      intro: "Le dhal est la base de l'alimentation végétarienne dans toute l'Asie du Sud depuis des millénaires — et ce n'est pas un hasard. Les lentilles corail apportent protéines, fer et glucides complexes en un seul ingrédient, sans trempage, en cuisinant en 18 à 20 minutes. Elles fondent naturellement dans le lait de coco, créant une texture crémeuse sans mixeur. Selon la table Ciqual de l'ANSES, les lentilles corail cuites apportent environ 9 g de protéines et 3,3 mg de fer pour 100 g. Associées au citron frais au service, l'absorption du fer végétal est multipliée par 3 à 4. Le curcuma et le gingembre de cette recette ont des propriétés anti-inflammatoires documentées — le garam masala renforce leur effet. Un plat complet, économique (moins de 1,50 € par portion) et prêt en 30 minutes.",
      image_alt: "Dhal de lentilles corail orangé dans un bol avec de la coriandre fraîche et du riz basmati — recette végétarienne indienne économique",
      sport_timing: "Repas de récupération post-entraînement idéal le soir. Les protéines des lentilles soutiennent la réparation musculaire. Éviter avant un entraînement intense — la richesse en fibres peut ralentir la digestion et provoquer des inconforts.",
      conservation: "Se conserve 5 jours au réfrigérateur. Se congèle 3 mois en portions individuelles — l'un des plats végétariens qui se congèle le mieux. Le dhal épaissit en refroidissant — ajouter un peu d'eau au réchauffage. Les épices s'intensifient le lendemain.",
      variants: [
        { title: "Version plus riche en protéines (+ tofu émietté)", description: "Émietter 150 g de tofu ferme dans le dhal dès le début de la cuisson. L'apport protéique par portion passe à environ 14-16 g. Le tofu ferme apporte 12-15 g de protéines/100 g selon Ciqual ANSES." },
        { title: "Version légumes verts (+ fer et magnésium)", description: "Ajouter 200 g d'épinards frais ou 150 g de chou-fleur en bouquets à mi-cuisson. Les épinards apportent 3,6 mg de fer/100 g cuit (Ciqual ANSES). Associés au citron servi avec le dhal, l'absorption du fer est maximisée." },
        { title: "Version sans lait de coco (plus légère)", description: "Remplacer le lait de coco par 300 ml de bouillon de légumes + 2 c. à s. de purée de noix de cajou. Moins de graisses saturées, même onctuosité. Idéal en phase de sèche ou perte de poids." }
      ],
      nutrition_per_serving: { calories: 276, proteins_g: 6, carbs_g: 17, fat_g: 20, fiber_g: 6, iron_mg: 3 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "dhal lentilles corail végétarien, dal végé lait de coco, recette indienne végétarienne sportif budget" },
      faq_recette: [
        { question: "Faut-il faire tremper les lentilles corail avant la cuisson ?", answer: "Non — c'est leur principal avantage. Les lentilles corail sont décortiquées et cuisent sans trempage en 18 à 20 minutes. Elles dissolvent naturellement dans la sauce, donnant une texture crémeuse sans mixeur. Un simple rinçage à l'eau froide avant cuisson suffit." },
        { question: "Ce dhal est-il vraiment riche en fer malgré l'absence de viande ?", answer: "Oui. Les lentilles corail cuites apportent 3,3 mg de fer pour 100 g selon Ciqual ANSES. C'est du fer non héminique (végétal), moins bien absorbé que le fer animal seul — mais associé à un filet de jus de citron (vitamine C), l'absorption est multipliée par 3 à 4 selon les données de l'ANSES. Éviter le thé et le café dans l'heure qui suit le repas." },
        { question: "Peut-on utiliser d'autres lentilles que les corail dans ce dhal ?", answer: "Oui. Les lentilles vertes donnent un résultat plus rustique avec des lentilles entières (cuisson 25-30 min). Les lentilles beluga (noires) tiennent parfaitement à la cuisson et donnent un aspect spectaculaire. Dans tous les cas, le profil nutritionnel est similaire." }
      ],
      related_article_ids: [1, 2, 12],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 19,
    data: {
      meta_title: 'Overnight oats tropical végétarien | Mamie Végé',
      meta_description: "Porridge de nuit tropical végétarien : 35 g de protéines, zéro cuisson, prêt la veille en 5 min. Petit-déjeuner sportif mangue et fruit de la passion.",
      intro: "Le porridge de nuit (overnight oats) est la solution pour les sportifs végétariens qui n'ont pas le temps de cuisiner le matin. Préparer le soir en 5 minutes, sortir du frigo le lendemain : le petit-déjeuner est prêt. Cette version tropicale associe 80 g de flocons d'avoine — 13 à 14 g de protéines pour 100 g selon la table Ciqual de l'ANSES — à 25 g de protéine de pois vanille et au lait de coco riche en triglycérides à chaîne moyenne. La mangue apporte 37 mg de vitamine C pour 100 g et du bêta-carotène antioxydant. Le fruit de la passion ajoute une acidité naturelle et de la vitamine C supplémentaire. Les graines de chia absorbent jusqu'à 10 fois leur poids en eau, gélifient la préparation pendant la nuit et apportent des oméga-3 ALA. Un petit-déjeuner de 35 g de protéines sans cuisson ni stress matinal.",
      image_alt: "Overnight oats tropical dans un bocal avec des dés de mangue, fruit de la passion et noix de coco râpée — petit-déjeuner végétarien préparé la veille",
      sport_timing: "Petit-déjeuner 2 à 3 heures avant une séance du matin ou une longue sortie running ou vélo. Parfait pour les coureurs ou cyclistes avec une sortie longue le week-end. Sortir du frigo 10 minutes avant de manger si on préfère à température ambiante.",
      conservation: "Préparer jusqu'à 4 jours à l'avance dans des bocaux hermétiques au réfrigérateur — idéal pour préparer toute la semaine le dimanche. Les fruits frais (mangue, fruit de la passion) s'ajoutent le matin pour éviter l'oxydation. Ne pas congeler.",
      variants: [
        { title: "Version sans lait de coco (plus légère)", description: "Remplacer le lait de coco par 200 ml de lait d'avoine ou d'amande. Calories réduites à environ 600 kcal, moins de graisses saturées. Idéal en phase de sèche ou pour un petit-déjeuner moins dense." },
        { title: "Version batch 5 bocaux (semaine entière)", description: "Préparer 5 bocaux le dimanche en 15 minutes : même base avoine + lait de coco + protéine + chia. Varier les fruits : mangue lundi, ananas mardi, framboises mercredi, banane jeudi, kiwi vendredi. Même base, 5 petits-déjeuners différents." },
        { title: "Version endurance (+ glucides avant longue sortie)", description: "Doubler à 160 g de flocons d'avoine et ajouter 30 g de raisins secs. Apport glucidique passe de 62 g à environ 110 g — suffisant pour charger le glycogène avant une sortie longue de 2h+." }
      ],
      nutrition_per_serving: { calories: 859, proteins_g: 35, carbs_g: 62, fat_g: 51, fiber_g: 9, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Petit-déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "overnight oats tropical végétarien, porridge de nuit exotique, petit déjeuner végé mangue protéiné" },
      faq_recette: [
        { question: "Combien de temps à l'avance peut-on préparer ce porridge de nuit ?", answer: "Idéalement la veille au soir (8 à 12 heures minimum pour que les flocons s'hydratent bien). On peut aller jusqu'à 4 jours à l'avance — les flocons continuent à s'hydrater et la texture devient plus crémeuse. Les fruits frais s'ajoutent le matin pour éviter qu'ils ramollissent et s'oxydent." },
        { question: "Peut-on manger ce porridge chaud le matin ?", answer: "Oui. Verser le contenu dans une casserole et chauffer 3-4 minutes à feu doux en remuant. Ou 1 minute au micro-ondes. Ajouter un peu de lait végétal si la texture est trop épaisse. La version chaude est appréciée en hiver, la froide en été." },
        { question: "Les graines de chia sont-elles vraiment utiles dans ce porridge de nuit ?", answer: "Oui. Elles absorbent jusqu'à 10 fois leur poids en eau, créant le gel caractéristique du porridge de nuit. Elles apportent aussi des oméga-3 ALA et 4-5 g de fibres pour une cuillère à soupe. Si tu as des inconforts digestifs avec les graines de chia, les remplacer par des graines de lin moulues (effet gélifiant similaire)." }
      ],
      related_article_ids: [6, 22, 12],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 20,
    data: {
      meta_title: 'Tacos Haricots Noirs & Avocat | Mamie Végé',
      meta_description: 'Tacos végétariens aux haricots noirs et avocat : 20 g de protéines, prêts en 15 minutes. Repas sportif convivial riche en fer et en bons acides gras.',
      intro: "Les tacos aux haricots noirs et avocat sont le repas végétarien convivial par excellence. Les haricots noirs apportent environ 8-9 g de protéines et 2,7 mg de fer pour 100 g cuits (table Ciqual ANSES). La salsa aux tomates fraîches apporte de la vitamine C qui optimise l'absorption du fer végétal. L'avocat fournit des graisses mono-insaturées (acide oléique) cardioprotectrices et une satiété durable. Les tortillas de maïs sont naturellement sans gluten et ont un index glycémique modéré — plus stable que les tortillas de blé. Ce repas express prêt en 15 minutes avec des ingrédients de base est parfait pour les soirs de semaine après l'entraînement.",
      image_alt: "Tacos végétariens garnies de haricots noirs épicés, avocat, maïs et salsa — repas convivial végé express post-entraînement",
      sport_timing: "Repas du soir post-entraînement ou déjeuner rapide 2 à 3 heures avant une séance. Les glucides des tortillas + haricots rechargent le glycogène. Ajouter du riz complet en accompagnement pour les séances longues du lendemain.",
      conservation: "La garniture haricots épicés se conserve 4 jours au réfrigérateur. La salsa fraîche 2 jours maximum. L'avocat se prépare au moment pour éviter l'oxydation. Les tortillas se conservent dans leur emballage d'origine à température ambiante.",
      variants: [
        { title: "Version + protéinée (tofu émietté)", description: "Émietter 150 g de tofu ferme dans la poêle avec les haricots noirs et les épices. L'apport protéique passe à 28-30 g pour 2 tacos. Le tofu ferme apporte 12-15 g de protéines/100 g selon Ciqual ANSES." },
        { title: "Version bowl (sans tortilla)", description: "Servir les mêmes ingrédients sur un lit de riz complet ou de quinoa au lieu des tortillas. Plus glucidique et plus nutritif, idéal en repas de récupération post-longue sortie running ou vélo." },
        { title: "Version tex-mex complète", description: "Ajouter du fromage végane râpé, de la crème végane et de la sauce piquante. Version plus festive et calorique, parfaite après une séance intense de musculation ou de crossfit." }
      ],
      nutrition_per_serving: { calories: 435, proteins_g: 20, carbs_g: 86, fat_g: 8, fiber_g: 11, iron_mg: 5 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "tacos végétariens haricots noirs avocat, tacos sans viande protéinés, tacos végé express sportif" },
      faq_recette: [
        { question: "Quelle tortilla choisir pour une version plus nutritive ?", answer: "Les tortillas de maïs (corn tortillas) sont naturellement sans gluten avec un IG modéré. Les tortillas complètes (farine complète ou multigraine) ont plus de fibres et un IG plus bas que les tortillas de farine blanche. Chercher des versions avec une liste courte d'ingrédients, sans sirop de glucose ni huile de palme." },
        { question: "Peut-on préparer les haricots épicés à l'avance ?", answer: "Oui — c'est même recommandé. La garniture haricots noirs épicés se prépare jusqu'à 4 jours à l'avance. Les épices s'intensifient avec le temps. Assembler les tacos au dernier moment pour éviter que les tortillas ne ramollissent." },
        { question: "Les haricots noirs sont-ils une bonne source de protéines végétales pour le sport ?", answer: "Oui. Les haricots noirs apportent environ 8-9 g de protéines et 2,7 mg de fer pour 100 g cuits. Pour un repas végétarien complet, associer les haricots noirs à une source de céréales (tortilla de maïs, riz) donne un profil d'acides aminés complet — lysine du haricot + méthionine des céréales." }
      ],
      related_article_ids: [1, 17, 9],
      updated_date: '2026-04-02'
    }
  }
];

// ── Exécution ───────────────────────────────────────────────────────────────
async function run() {
  console.log('🚀 Enrichissement éditorial — 6 recettes\n');

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

  // ── Vérifications ───────────────────────────────────────────────────────
  console.log('\n── Vérifications ──────────────────────────────────────\n');

  // 1. meta_title lengths
  const { data: titles } = await supabase
    .from('recipes')
    .select('id, meta_title')
    .in('id', [13, 15, 16, 18, 19, 20])
    .order('id');

  console.log('1. meta_title lengths (≤ 60 chars) :');
  for (const r of titles || []) {
    const len = (r.meta_title || '').length;
    const ok = len <= 60 ? '✅' : '❌';
    console.log(`   ${ok} ID ${r.id} — ${len} chars — ${r.meta_title}`);
  }

  // 2. Enrichissement check
  const { data: enriched } = await supabase
    .from('recipes')
    .select('id, intro, faq_recette, variants, nutrition_per_serving, related_article_ids')
    .in('id', [13, 15, 16, 18, 19, 20])
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

  // 3. meta_title > 60 dans toute la table
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
