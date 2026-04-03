#!/usr/bin/env node
/**
 * SEO Fix 8 — mamie-vege.fr — 03/04/2026
 * Enrichissement batch 3b — 13 recettes
 * IDs : 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66
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
    id: 54,
    data: {
      meta_title: "Poêlée pois chiches épinards express végé | Mamie Végé",
      meta_description: "Poêlée pois chiches et épinards express végétarienne : 17 g de protéines, prête en 15 min. Dîner végé riche en fer et magnésium pour sportifs pressés.",
      intro: "La poêlée pois chiches-épinards est le dîner végétarien express le plus nutritionnellement dense. Les épinards cuits apportent 3,6 mg de fer pour 100 g (Ciqual ANSES). Les pois chiches complètent avec 8-9 g de protéines et 2,9 mg de fer pour 100 g cuit. Les deux sources de fer végétal se complètent — et la vitamine C du citron pressé au service multiplie leur absorption par 3 à 4 selon les données de l'ANSES. Le paprika fumé développe une saveur grillée sans aucune cuisson complexe. Ce repas anti-fatigue martiale pour les sportifs végétariens se prépare en 15 minutes avec des ingrédients de placard.",
      image_alt: "Poêlée de pois chiches dorés et épinards frais avec paprika fumé dans une grande poêle — dîner végétarien express anti-fatigue",
      sport_timing: "Dîner post-entraînement rapide en semaine. Léger mais nutritionnellement dense. Accompagner de riz complet ou de pain complet pour les glucides de récupération.",
      conservation: "Se conserve 3 jours au réfrigérateur. Réchauffer à la poêle 3-4 minutes. Les épinards peuvent être ajoutés frais au réchauffage pour une texture moins cuite.",
      variants: [
        { title: "Version tofu grillé (+ protéines)", description: "Saisir 150 g de tofu ferme en dés avant les pois chiches. L'apport protéique passe à environ 28-30 g par portion." },
        { title: "Version épices indiennes (palak chole)", description: "Ajouter 1 c. à c. de garam masala + ½ c. à c. de curcuma + ½ c. à c. de gingembre. Version palak chole, servir avec du riz basmati." },
        { title: "Version œuf poché (ovo-végétarien)", description: "Pocher 1 à 2 œufs directement dans la poêlée les 3 dernières minutes. Apport protéique +12-14 g, version encore plus copieuse." }
      ],
      nutrition_per_serving: { calories: 344, proteins_g: 17, carbs_g: 46, fat_g: 12, fiber_g: 11, iron_mg: 6 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "poêlée pois chiches épinards végétarienne express, recette fer végétarien sportif, dîner végé express 15 minutes" },
      faq_recette: [
        { question: "Les épinards cuits sont-ils vraiment riches en fer malgré l'acide oxalique ?", answer: "Les épinards contiennent 3,6 mg de fer pour 100 g cuits (Ciqual ANSES). L'acide oxalique réduit effectivement l'absorption, mais associés à la vitamine C (citron au service), l'absorption est multipliée par 3 à 4. Ne pas consommer avec du thé ou du calcium dans la même heure (inhibiteurs). En net, les épinards cuits restent une bonne source de fer végétal." },
        { question: "Faut-il utiliser des épinards frais ou surgelés ?", answer: "Les deux fonctionnent. Les épinards surgelés sont déjà blanchis, moins chers (3x moins chers que frais), et fondent directement dans la poêle en 3-4 minutes. La valeur nutritionnelle est comparable aux frais. Les épinards frais ont un meilleur goût mais réduisent considérablement au volume." },
        { question: "Comment rendre les pois chiches plus croustillants dans cette poêlée ?", answer: "Bien égoutter et sécher les pois chiches en boîte avant cuisson. Cuire à feu vif sans couvercle dans une poêle chaude pendant 5-7 minutes en remuant régulièrement. Ajouter une légère couche de fécule de maïs avant de les mettre en poêle pour absorber l'humidité résiduelle." }
      ],
      related_article_ids: [1, 15, 20],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 55,
    data: {
      meta_title: "Pizza tortilla haricots rouges végétarienne | Mamie Végé",
      meta_description: "Pizza tortilla végétarienne aux haricots rouges : 12 g de protéines, prête en 10 min. Déjeuner végé express économique pour sportifs pressés.",
      intro: "La pizza tortilla aux haricots rouges est la solution ultime pour les sportifs végétariens qui manquent de temps le midi. Une tortilla complète comme base, sauce tomate maison ou du commerce, haricots rouges en boîte et légumes — sous le gril du four pendant 5 minutes. Les haricots rouges apportent environ 8-9 g de protéines et 2,9 mg de fer pour 100 g cuits (Ciqual ANSES). Le poivron en garniture est l'une des meilleures sources de vitamine C (190 mg/100 g) — qui multiplie l'absorption du fer des haricots par 3 à 4. Ce format ultra-rapide (10 minutes) respecte l'objectif budget sportif sans sacrifier la nutrition. Le fromage râpé gratine et ajoute du calcium et des protéines supplémentaires.",
      image_alt: "Pizza tortilla végétarienne avec sauce tomate, haricots rouges, poivron et fromage râpé gratinés — déjeuner express végé 10 minutes",
      sport_timing: "Déjeuner rapide 2 à 3 heures avant une séance de l'après-midi. Ou repas express post-entraînement du midi. La tortilla apporte des glucides rapides, les haricots les protéines.",
      conservation: "À consommer immédiatement (la tortilla ramollit rapidement). La garniture (sauce + haricots + légumes) peut être préparée à l'avance et conservée 3 jours.",
      variants: [
        { title: "Version fromage végane fondu", description: "Parsemer 40 g de fromage végane râpé avant de passer sous le gril. Version végétalienne complète." },
        { title: "Version œuf au plat (ovo-végétarien)", description: "Casser 1 œuf au centre de la pizza avant d'enfourner. L'œuf cuit avec les autres ingrédients. +6 g de protéines, version plus rassasiante." },
        { title: "Version tortilla de maïs (sans gluten)", description: "Utiliser une tortilla de maïs (plus petite, 15 cm). Naturellement sans gluten, IG plus modéré. Nécessite 2-3 tortillas par personne." }
      ],
      nutrition_per_serving: { calories: 181, proteins_g: 12, carbs_g: 25, fat_g: 4, fiber_g: 7, iron_mg: 3 },
      schema_recipe: { recipeCategory: "Déjeuner", recipeCuisine: "Végétarienne", keywords: "pizza tortilla végétarienne haricots rouges, pizza végé express 10 minutes, tortilla garnie végétalienne" },
      faq_recette: [
        { question: "Comment éviter que la tortilla soit détrempée sous le gril ?", answer: "Préchauffer la tortilla à sec dans une poêle 1 minute avant d'ajouter la garniture. Ne pas surcharger en sauce — une fine couche suffit. Enfourner sous le gril chaud (position haute) seulement 4-5 minutes. La tortilla doit rester légèrement croustillante sur les bords." },
        { question: "Peut-on faire cette pizza tortilla sans four ?", answer: "Oui, dans une poêle couverte à feu moyen : assembler la pizza, couvrir avec un couvercle et cuire 3-4 minutes. La vapeur fait fondre le fromage. La tortilla sera moins croustillante mais le résultat est très correct — idéal pour les étudiants sans four." },
        { question: "Les haricots rouges en boîte sont-ils sains ?", answer: "Oui. Les haricots rouges en conserve sont cuits à haute température, ce qui neutralise les lectines (toxines présentes dans les haricots crus). La valeur nutritionnelle est identique aux haricots cuits maison. Rincer avant utilisation réduit le sodium de 40%." }
      ],
      related_article_ids: [1, 2, 13],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 56,
    data: {
      meta_title: "Muesli croustillant maison végétarien | Mamie Végé",
      meta_description: "Muesli croustillant maison végétarien : 11 g de protéines, sans sucre ajouté. Granola végé pour sportifs prêt en 20 min, à préparer le dimanche pour la semaine.",
      intro: "Le muesli croustillant maison (granola) est la solution pour les sportifs végétariens qui veulent un petit-déjeuner rapide sans les additifs et sucres ajoutés des versions industrielles. Cette recette utilise 120 g de flocons d'avoine (13-14 g de protéines pour 100 g, Ciqual ANSES) avec des noix, des graines de tournesol et du sirop d'érable comme seul sucrant naturel. Le lait d'amande et l'huile neutre permettent au muesli de former des amas croustillants lors du refroidissement — le secret de la texture parfaite. Préparé en 20 minutes le dimanche, il se conserve 3 semaines dans un bocal et offre 15 petits-déjeuners rapides avec du lait végétal ou du yaourt de soja.",
      image_alt: "Bocal de muesli croustillant maison végétarien avec avoine, noix et graines de tournesol — granola végé sans sucre ajouté fait maison",
      sport_timing: "Petit-déjeuner 2 à 3 heures avant une séance du matin. Ou en collation post-sport avec du yaourt de soja protéiné. Également excellent en topping sur les bowls açaï ou yaourt.",
      conservation: "Se conserve 3 semaines dans un bocal hermétique à température ambiante (loin de l'humidité). Congélation non recommandée (perd le croustillant).",
      variants: [
        { title: "Version cacao et noisettes", description: "Ajouter 2 c. à s. de cacao non sucré et remplacer les noix par des noisettes. Saveur chocolat-noisette, riche en magnésium (cacao : 228 mg/100 g, Ciqual ANSES)." },
        { title: "Version tropical (coco-mangue)", description: "Ajouter 30 g de noix de coco râpée pendant les 5 dernières minutes + 30 g de mangue séchée après refroidissement. Ne pas cuire la mangue (brûle rapidement)." },
        { title: "Version sucre de dattes", description: "Remplacer le sirop d'érable par 40 g de dattes mixées avec 2 c. à s. d'eau. Glucides naturels à IG modéré, saveur caramel, sans sucre raffiné." }
      ],
      nutrition_per_serving: { calories: 534, proteins_g: 11, carbs_g: 50, fat_g: 30, fiber_g: 7, iron_mg: 3 },
      schema_recipe: { recipeCategory: "Petit-déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "muesli croustillant maison végétarien, granola végé sans sucre ajouté, granola sportif avoine noix" },
      faq_recette: [
        { question: "Comment obtenir un muesli vraiment croustillant ?", answer: "Trois règles : four à 160-170°C maximum (pas 180°C — ça brûle), ne pas remuer pendant les 15 premières minutes pour que les amas se forment, et laisser refroidir complètement sur la plaque avant de transférer dans un bocal. Le croustillant se forme en refroidissant — il sera décevant si transféré chaud." },
        { question: "Quelle est la différence entre muesli et granola ?", answer: "Le muesli est cru (flocons non cuits), le granola est cuit au four avec un sucrant et un corps gras qui le rend croustillant. Cette recette est donc un granola. Les deux se mangent avec du lait végétal, du yaourt ou directement en collation." },
        { question: "Ce muesli convient-il pour la randonnée ou le trail ?", answer: "Oui, c'est une excellente collation de plein air. Dense en énergie (environ 450-500 kcal pour 100 g), léger, résistant aux chocs. Conditionner dans un sac à fermeture zip pour le transport. 50-70 g de granola = collation de 225-350 kcal facile à emporter." }
      ],
      related_article_ids: [6, 22, 1],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 57,
    data: {
      meta_title: "Salade boulgour pois chiches citron végé | Mamie Végé",
      meta_description: "Salade boulgour, pois chiches et citron végétarienne : 12 g de protéines, fraîche et transportable. La version protéinée du taboulé végé pour sportifs.",
      intro: "La salade de boulgour aux pois chiches et citron est la version protéinée du taboulé végétarien. Le boulgour (blé dur précuit) se prépare en 10 minutes sans cuisson sur le feu — il suffit de le réhydrater dans l'eau bouillante. Il apporte des glucides complexes et 3 g de protéines pour 100 g cuit. Les pois chiches complètent avec 8-9 g de protéines et 2,9 mg de fer pour 100 g cuit (Ciqual ANSES). Le citron pressé est à la fois l'assaisonnement principal et un allié nutritionnel : sa vitamine C multiplie l'absorption du fer des pois chiches par 3 à 4. La menthe fraîche apporte des propriétés digestives appréciées avant un entraînement. Cette salade se bonifie au réfrigérateur en absorbant les arômes.",
      image_alt: "Salade boulgour aux pois chiches avec tomates cerises, concombre, menthe fraîche et vinaigrette citron — déjeuner végétarien taboulé",
      sport_timing: "Déjeuner frais 2 à 3 heures avant une séance de l'après-midi. Légère et facile à digérer. Transportable pour les sportifs qui s'entraînent le soir et mangent sur le trajet.",
      conservation: "Se conserve 3 à 4 jours au réfrigérateur. La salade s'améliore avec le temps. Ajouter les tomates fraîches au service pour éviter qu'elles rendent de l'eau.",
      variants: [
        { title: "Version quinoa (sans gluten)", description: "Remplacer le boulgour par du quinoa cuit (sans gluten, profil en acides aminés complet). Saveur et texture légèrement différentes, profil nutritionnel amélioré." },
        { title: "Version feta (+ calcium)", description: "Émietter 80 g de feta sur la salade. Apport en protéines +8 g et en calcium augmenté. Version plus rassasiante." },
        { title: "Version pastèque-menthe (été)", description: "Ajouter des dés de pastèque et plus de menthe fraîche. Très rafraîchissant en été, contraste sucré-salé excellent." }
      ],
      nutrition_per_serving: { calories: 379, proteins_g: 12, carbs_g: 45, fat_g: 18, fiber_g: 9, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Déjeuner", recipeCuisine: "Végétarienne", keywords: "salade boulgour pois chiches citron végétarienne, taboulé végé protéiné, salade boulgour sportif" },
      faq_recette: [
        { question: "Comment cuire le boulgour rapidement ?", answer: "Le boulgour est précuit — c'est sa grande force. Verser 160 g de boulgour dans un bol, recouvrir d'eau bouillante à hauteur, couvrir d'un torchon et laisser gonfler 10-12 minutes. Égoutter si nécessaire. Aucune cuisson sur le feu nécessaire. C'est la céréale la plus rapide à préparer après les flocons d'avoine." },
        { question: "Peut-on remplacer le boulgour par de la semoule (couscous) ?", answer: "Oui. La semoule se prépare de la même façon (eau bouillante + gonflage) et donne une texture plus légère et moins ferme. La valeur nutritionnelle est similaire mais le boulgour a plus de fibres car moins raffiné." },
        { question: "Cette salade convient-elle avant une compétition sportive ?", answer: "Oui, 2 à 3 heures avant. Le boulgour et les pois chiches apportent des glucides complexes sans excès de fibres agressives. Réduire la quantité de crudités si tu es sensible aux fibres avant l'effort." }
      ],
      related_article_ids: [1, 2, 15],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 58,
    data: {
      meta_title: "Poêlée tofu et légumes façon wok végétarienne | Mamie Végé",
      meta_description: "Poêlée de légumes et tofu façon wok végétarienne : 18 g de protéines, prête en 20 min. Dîner végé coloré express avec nouilles de sarrasin et légumes de saison.",
      intro: "La poêlée de légumes et tofu façon wok est le dîner végétarien express qui ne ressemble pas à un repas de régime. La cuisson wok à haute température caramélise les légumes et dore le tofu — deux réactions de Maillard qui développent les saveurs sans excès de graisses. Le tofu ferme apporte 12-15 g de protéines pour 100 g (Ciqual ANSES). Les légumes variés (carotte, courgette, poivron) apportent un spectre complet de vitamines et d'antioxydants. Les nouilles de sarrasin ajoutent des glucides complexes et, si utilisées entièrement (farine de sarrasin), sont naturellement sans gluten. La sauce soja-huile de sésame transforme ce wok en plat savoureux en quelques secondes.",
      image_alt: "Poêlée colorée de légumes variés et tofu façon wok avec nouilles de sarrasin dans une grande poêle — dîner végétarien express savoureux",
      sport_timing: "Dîner post-entraînement léger et digeste. Les légumes en abondance apportent les micronutriments de récupération, le tofu les protéines. Servir avec du riz complet pour les glucides.",
      conservation: "Se conserve 3 jours au réfrigérateur. Réchauffer à la poêle 3-4 minutes à feu vif. Éviter le micro-ondes qui ramollit les légumes et le tofu.",
      variants: [
        { title: "Version tempeh (+ protéines)", description: "Remplacer le tofu par du tempeh en dés sautés à feu vif. Apport protéique augmenté, texture plus dense." },
        { title: "Version lait de coco (+ onctueux)", description: "Ajouter 100 ml de lait de coco et 1 c. à s. de pâte de curry rouge en fin de cuisson. Sauce crémeuse style thaï." },
        { title: "Version nouilles soba (+ protéines)", description: "Utiliser des nouilles soba 100% sarrasin (naturellement sans gluten, 13 g de protéines/100 g sec). Le sarrasin complète le profil protéique du tofu." }
      ],
      nutrition_per_serving: { calories: 285, proteins_g: 18, carbs_g: 11, fat_g: 19, fiber_g: 5, iron_mg: 3 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "poêlée tofu légumes wok végétarienne, wok végé express protéiné, dîner tofu légumes sauté asiatique" },
      faq_recette: [
        { question: "Comment éviter que le tofu soit trop mou dans le wok ?", answer: "Quatre étapes : (1) choisir du tofu ferme, (2) le presser 15 minutes pour éliminer l'excès d'eau, (3) cuire en premier à feu très vif dans la poêle chaude avant d'ajouter les légumes, (4) ne pas remuer trop souvent — laisser chaque face se dorer 2 minutes avant de retourner." },
        { question: "Dans quel ordre ajouter les légumes dans le wok ?", answer: "Ordre de cuisson : légumes durs en premier (carotte, oignon — 4-5 min), légumes mi-durs ensuite (courgette, poivron — 2-3 min), légumes tendres et sauce en dernier (épinards, sauce soja-sésame — 1 min). Ajouter le tofu déjà doré avec les légumes mi-durs." },
        { question: "Peut-on faire ce wok sans wok (avec une poêle classique) ?", answer: "Oui. Utiliser la plus grande poêle antiadhésive disponible à feu le plus vif possible. La différence : les légumes rendent plus de jus au lieu de rôtir. Compenser en cuisinant par petites quantités successives plutôt que tout ensemble." }
      ],
      related_article_ids: [1, 13, 14],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 59,
    data: {
      meta_title: "Crème dessert chocolat tofu soyeux végane | Mamie Végé",
      meta_description: "Crème dessert chocolat au tofu soyeux végétalienne : 8 g de protéines, sans lactose, prête en 5 min. La collation sportive végane gourmande et légère.",
      intro: "La crème dessert chocolat au tofu soyeux est la collation sportive végétalienne la plus gourmande du blog. Le tofu soyeux mixé avec le cacao donne une consistance très proche de la mousse au chocolat ou de la panna cotta — sans gélatine, sans crème, sans sucre ajouté. Le cacao non sucré apporte 228 mg de magnésium pour 100 g (Ciqual ANSES) — le minéral essentiel à la contraction musculaire souvent déficitaire chez les sportifs. Le tofu soyeux apporte 5-6 g de protéines pour 100 g. Le sirop d'érable sucre naturellement sans pic insulinique. Cette crème se prépare en 5 minutes avec un mixeur, sans cuisson, et se conserve 3 jours — idéale en collation du soir pour la récupération musculaire nocturne.",
      image_alt: "Crème dessert végétalienne au chocolat dans un pot avec du tofu soyeux et du cacao — collation sportive végane sans lactose",
      sport_timing: "Collation post-sport dans l'heure suivant la séance. Ou en dessert du soir pour un apport protéique léger avant le coucher. Bien toléré avant le sommeil.",
      conservation: "Se conserve 3 jours au réfrigérateur dans un pot hermétique. La texture s'affermit légèrement en refroidissant. Ajouter les toppings au service.",
      variants: [
        { title: "Version plus protéinée (+ poudre de pois)", description: "Ajouter 15 g de protéine de pois chocolat. L'apport protéique passe de 8 g à environ 20 g par portion." },
        { title: "Version caramel (sans cacao)", description: "Remplacer le cacao par 2 c. à s. de beurre de cacahuète + 1 c. à c. de sirop d'érable. Saveur caramel-cacahuète." },
        { title: "Version framboise", description: "Mixer 50 g de framboises avec le tofu soyeux + 1 c. à s. de cacao. Crème bicolore chocolat-framboise, plus fraîche." }
      ],
      nutrition_per_serving: { calories: 158, proteins_g: 8, carbs_g: 13, fat_g: 6, fiber_g: 3, iron_mg: 2 },
      schema_recipe: { recipeCategory: "Collation sportive", recipeCuisine: "Végétalienne", keywords: "crème dessert chocolat tofu soyeux végane, mousse chocolat végétalienne sportif, dessert végé sans lactose protéiné" },
      faq_recette: [
        { question: "Le tofu soyeux se sent-il dans cette crème ?", answer: "Non — c'est le secret de cette recette. Le tofu soyeux nature est totalement neutre en goût. Le cacao et le sirop d'érable masquent complètement la saveur du soja. La texture est lisse et crémeuse, sans aucun signe révélateur. Même les personnes qui n'aiment pas le tofu sont souvent surprises." },
        { question: "Quel tofu soyeux choisir ?", answer: "Le tofu soyeux ferme donne la texture la plus proche de la panna cotta. Le tofu soyeux doux donne une texture plus liquide. Les marques Mori-Nu (longue conservation) ou les marques bio en épicerie asiatique sont les plus courantes." },
        { question: "Cette crème peut-elle remplacer la mousse au chocolat classique ?", answer: "Oui, comme alternative végane. La texture est différente (pas de bulles d'air comme dans la vraie mousse), mais la saveur est très proche. Elle est même plus stable (ne s'affaisse pas au frigo). Pour une texture plus aérée, ajouter 100 ml de crème de coco fouettée au dernier moment." }
      ],
      related_article_ids: [1, 6, 7],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 60,
    data: {
      meta_title: "Tartines beurre d'amande, banane et graines | Mamie Végé",
      meta_description: "Tartines express beurre d'amande, banane et graines de chanvre : 11 g de protéines, 5 min. Le pré-entraînement végé le plus rapide du blog — zéro cuisson.",
      intro: "Les tartines express beurre d'amande-banane sont le pré-entraînement le plus rapide du blog : 5 minutes, zéro cuisson. Le pain complet apporte des glucides complexes à index glycémique modéré. Le beurre d'amande fournit des protéines (21 g/100 g) et des graisses mono-insaturées qui prolongent la satiété. La banane mûre ajoute 23 g de glucides rapides (IG 55) et 422 mg de potassium (Ciqual ANSES) — le minéral le plus perdu par transpiration. Les graines de chanvre décortiquées complètent avec 30 g de protéines pour 100 g et un profil en acides aminés complet. Le miel apporte une touche sucrée naturelle et des glucides rapidement disponibles. Simple, économique, prêt en 5 minutes.",
      image_alt: "Tartines de pain complet avec beurre d'amande, rondelles de banane mûre et graines de chanvre — petit-déjeuner végé pré-entraînement express",
      sport_timing: "45 à 60 minutes avant une séance de sport légère à modérée. Pas trop lourd pour une digestion rapide. Pour une séance intense, préférer 90 minutes minimum avec ce format (le beurre d'amande ralentit la digestion).",
      conservation: "À préparer et consommer immédiatement. La banane s'oxyde. Le beurre d'amande se conserve 3 à 6 mois à température ambiante (bocal fermé).",
      variants: [
        { title: "Version beurre de cacahuète", description: "Remplacer le beurre d'amande par du beurre de cacahuète. Profil nutritionnel très proche, saveur plus familière, généralement moins cher." },
        { title: "Version pain de seigle", description: "Utiliser du pain de seigle dense (Wasa ou pain noir nordique). Index glycémique encore plus bas, texture croquante." },
        { title: "Version fraises (été)", description: "Remplacer la banane par des fraises fraîches tranchées. Moins glucidique, plus de vitamine C (90 mg/100 g), saveur plus fraîche en été." }
      ],
      nutrition_per_serving: { calories: 436, proteins_g: 11, carbs_g: 57, fat_g: 17, fiber_g: 6, iron_mg: 3 },
      schema_recipe: { recipeCategory: "Petit-déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "tartines beurre amande banane graines végé, petit déjeuner pré-sport express végétarien, tartines sportif végé 5 minutes" },
      faq_recette: [
        { question: "Peut-on manger ces tartines 30 minutes avant le sport ?", answer: "Possible pour une séance légère. Pour une séance intense (HIIT, crossfit, musculation lourde), préférer 90 minutes minimum. Le beurre d'amande contient des graisses qui ralentissent la digestion. Si tu n'as que 20-30 minutes, prendre juste la banane et une poignée de dattes." },
        { question: "Le beurre d'amande est-il plus nutritif que le beurre de cacahuète ?", answer: "Différent plutôt que meilleur. Le beurre d'amande est plus riche en calcium végétal (270 mg/100 g) et en vitamine E. Le beurre de cacahuète est plus riche en protéines (25-28 g vs 21 g/100 g) et généralement moins cher. Les deux sont excellents." },
        { question: "Ces tartines conviennent-elles en repas de récupération post-sport ?", answer: "Elles peuvent dépanner mais ne sont pas optimales. Pour le post-sport, l'objectif est 25-35 g de protéines — ces tartines n'en apportent que 11 g. Compléter avec un yaourt de soja protéiné ou un verre de lait végétal enrichi." }
      ],
      related_article_ids: [1, 6, 16],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 61,
    data: {
      meta_title: "Riz sauté express lentilles et carottes | Mamie Végé",
      meta_description: "Riz sauté express lentilles et carottes végétarien : moins de 1 € la portion, 9 g de protéines, 20 min. Le plat budget végé pour sportifs étudiants.",
      intro: "Le riz sauté aux lentilles et carottes est le repas végétarien le plus économique du blog : moins de 1 € par portion avec des ingrédients de base disponibles partout. Le riz complet cuit (idéalement préparé en batch cooking la veille) fournit les glucides complexes. Les lentilles vertes en boîte complètent avec 9 g de protéines et 3,3 mg de fer pour 100 g (Ciqual ANSES) — sans aucune cuisson supplémentaire. La carotte ajoute du bêta-carotène et de la douceur naturelle. Le cumin et la sauce soja transforment ce plat basique en quelque chose de savoureux. L'ail et l'oignon développent une base aromatique qui élève le tout. Un plat anti-gaspi complet prêt en 20 minutes avec des restes.",
      image_alt: "Riz sauté végétarien aux lentilles vertes et carottes dans une poêle avec de la sauce soja — plat budget végé express pour étudiants sportifs",
      sport_timing: "Repas de midi ou de récupération post-entraînement le soir. Léger mais rassasiant. Pour augmenter l'apport protéique, ajouter un œuf brouillé ou des pois chiches.",
      conservation: "Se conserve 3 jours au réfrigérateur. Réchauffer à la poêle 3-4 minutes avec un filet d'eau pour éviter que le riz ne sèche.",
      variants: [
        { title: "Version avec œuf brouillé (ovo-végétarien)", description: "Faire revenir 1 à 2 œufs battus dans la poêle avant d'ajouter le riz. Apport protéique passe à environ 20-22 g." },
        { title: "Version épicée (curcuma + paprika)", description: "Ajouter 1 c. à c. de curcuma + ½ c. à c. de paprika fumé avec l'ail. Saveur plus complexe, propriétés anti-inflammatoires." },
        { title: "Version anti-gaspi (légumes du frigo)", description: "Utiliser n'importe quel légume disponible (courgette, poivron, épinards). Ce plat est anti-gaspi par définition — idéal pour vider le bac à légumes en fin de semaine." }
      ],
      nutrition_per_serving: { calories: 323, proteins_g: 9, carbs_g: 45, fat_g: 11, fiber_g: 7, iron_mg: 3 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "riz sauté lentilles carottes végétarien, riz sauté végé budget étudiant, riz poêlé express lentilles économique" },
      faq_recette: [
        { question: "Pourquoi utiliser du riz cuit d'avance pour ce plat ?", answer: "Le riz froid (réfrigéré au moins 12h) est idéal pour le riz sauté : les grains sont bien séparés et ne s'agglomèrent pas dans la poêle. Le riz chaud fraîchement cuit colle et forme des blocs. Si tu n'as pas de riz cuit d'avance, cuire normalement et laisser refroidir 30 minutes à l'air libre." },
        { question: "Comment rendre ce plat plus savoureux avec peu d'ingrédients ?", answer: "Trois astuces économiques : faire revenir l'ail et l'oignon jusqu'à légère coloration (caramélisation = umami naturel), ajouter une c. à s. de sauce soja en fin de cuisson, et un filet d'huile de sésame grillé juste avant de servir. Ces trois astuces transforment un plat banal en quelque chose de savoureux sans coût supplémentaire significatif." },
        { question: "Les lentilles en boîte sont-elles aussi nutritives que les sèches cuites maison ?", answer: "Oui. Les lentilles en conserve ont la même valeur nutritionnelle que les lentilles cuites maison. Rincer abondamment réduit le sodium de 40%. Pour le batch cooking du dimanche, les sèches sont 3 fois moins chères." }
      ],
      related_article_ids: [1, 2, 21],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 62,
    data: {
      meta_title: "Bowl récupération express pois chiches et riz | Mamie Végé",
      meta_description: "Bowl récupération express pois chiches, riz et épinards : prêt en 15 min avec des bases déjà cuites. Le repas post-sport végé le plus rapide du blog.",
      intro: "Ce bowl de récupération express est conçu pour les soirs d'entraînement où tu n'as pas envie de cuisiner. Si le riz complet et les pois chiches sont déjà cuits (batch cooking du dimanche), il s'assemble en 5 minutes. Les pois chiches apportent 8-9 g de protéines et 2,9 mg de fer pour 100 g (Ciqual ANSES). Le riz complet fournit les glucides complexes pour recharger le glycogène. Les épinards frais flétrissent sous la chaleur des autres ingrédients sans cuisson supplémentaire. La sauce tahini-citron ail apporte du calcium (420 mg/100 g pour le tahini) et enrichit les protéines totales. Les graines de courge ajoutent du zinc et du magnésium — deux minéraux essentiels à la récupération musculaire.",
      image_alt: "Bowl végétarien express de récupération avec riz complet, pois chiches, épinards et sauce tahini-citron — repas post-sport rapide 15 min",
      sport_timing: "Dans l'heure après l'entraînement pour maximiser la fenêtre de récupération. Le format bowl express est idéal pour les sportifs qui s'entraînent le soir et veulent manger vite.",
      conservation: "Assembler à la demande. Le riz et les pois chiches se conservent séparément 4-5 jours au réfrigérateur. Les épinards frais 3 jours.",
      variants: [
        { title: "Version sauce tahini (+ saveur et protéines)", description: "Mélanger 2 c. à s. de tahini + 1 citron + ail râpé + eau. Verser sur le bowl. Apport en calcium du sésame et saveur nettement améliorés." },
        { title: "Version tofu fumé (+ protéines rapides)", description: "Ajouter 100 g de tofu fumé en dés directement (pas de cuisson). Apport protéique passe à environ 18-20 g par portion." },
        { title: "Version piment-citron (express épicé)", description: "Arroser d'un filet d'huile d'olive + piment en flocons + jus de citron + sel. Assaisonnement en 30 secondes." }
      ],
      nutrition_per_serving: { calories: 282, proteins_g: 14, carbs_g: 57, fat_g: 3, fiber_g: 9, iron_mg: 5 },
      schema_recipe: { recipeCategory: "Déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "bowl récupération express végétarien pois chiches riz, repas post-sport végé rapide, bowl tahini épinards récupération" },
      faq_recette: [
        { question: "Comment rendre ce bowl plus protéiné sans cuisson ?", answer: "Quatre ajouts sans cuisson : tofu fumé en dés (100 g = +12 g de protéines), graines de chanvre décortiquées (30 g = +10 g), houmous en garniture (50 g = +4 g), yaourt de soja protéiné en sauce (100 g = +8 g). Ces ajouts transforment le bowl de 14 g à 20-26 g de protéines en quelques secondes." },
        { question: "Quelle est la fenêtre de récupération optimale pour manger ce bowl ?", answer: "Dans les 30 à 60 minutes après la fin de la séance. Les muscles absorbent le mieux le glucose (pour le glycogène) et les protéines (pour la réparation musculaire) dans cette fenêtre. Si tu ne peux pas manger dans cette fenêtre, une banane immédiatement après suffit en attendant un repas complet dans les 2 heures." },
        { question: "Peut-on manger ce bowl froid directement du frigo ?", answer: "Oui, c'est une option valide les soirs de grande fatigue. Le riz complet froid peut être légèrement moins digeste que chaud, mais la différence est mineure. Si tu manges froid, ajouter un peu plus de sauce tahini pour faciliter la déglutition et améliorer la texture globale." }
      ],
      related_article_ids: [1, 12, 25],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 63,
    data: {
      meta_title: "Pancakes végétariens protéinés farine complète | Mamie Végé",
      meta_description: "Pancakes végétariens protéinés à la farine complète et pois chiches : 18 g de protéines par portion, sans œuf. Petit-déjeuner végé du week-end sportif.",
      intro: "Ces pancakes végétariens protéinés prouvent qu'un petit-déjeuner gourmand peut être nutritionnellement sérieux. La farine de pois chiches mélangée à la farine complète apporte 20 g de protéines pour 100 g sans œuf ni poudre de protéines. La banane écrasée remplace l'œuf comme agent liant naturel et sucre la pâte. Le lait d'avoine lie la préparation et ajoute des glucides complexes. La levure chimique et le bicarbonate donnent le moelleux caractéristique des pancakes américains. Résultat : 18 g de protéines par portion, des glucides complexes, sans poudre de protéines industrielle. Le petit-déjeuner végétarien du week-end qui fait consensus à table.",
      image_alt: "Stack de pancakes végétariens dorés à la farine complète et pois chiches avec sirop d'érable et fruits — petit-déjeuner sportif végé week-end",
      sport_timing: "Petit-déjeuner 2 à 3 heures avant une séance ou repas de récupération matinal. Les pancakes sont plus denses que le porridge — prévoir suffisamment de temps de digestion.",
      conservation: "Se conservent 2 jours au réfrigérateur. Congélation 1 mois (séparer avec du papier cuisson). Réchauffer 2 minutes au grille-pain ou dans une poêle sèche pour retrouver le croustillant.",
      variants: [
        { title: "Version myrtilles (antioxydants)", description: "Incorporer 80 g de myrtilles fraîches ou congelées dans la pâte. Anthocyanes antioxydantes bénéfiques pour la récupération sportive." },
        { title: "Version banane-cannelle", description: "Écraser 1 banane mûre supplémentaire dans la pâte + ½ c. à c. de cannelle. Texture plus moelleuse, saveur caramélisée à la cuisson." },
        { title: "Version salée (herbes + légumes)", description: "Supprimer le sirop, ajouter du persil haché + sel + poivre + 50 g de fromage de chèvre émietté dans la pâte. Pancakes salés pour un déjeuner protéiné original." }
      ],
      nutrition_per_serving: { calories: 320, proteins_g: 18, carbs_g: 33, fat_g: 11, fiber_g: 6, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Petit-déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "pancakes végétariens protéinés farine complète, pancakes sans œuf pois chiches végé, pancakes végé sportif week-end" },
      faq_recette: [
        { question: "Comment obtenir des pancakes moelleux sans œufs ?", answer: "Le liant de ces pancakes est la farine de pois chiches (protéines qui coagulent à la chaleur comme les œufs) + la banane écrasée. Pour un résultat optimal : laisser reposer la pâte 5 minutes avant cuisson, cuire à feu moyen (pas vif), et ne retourner qu'une seule fois quand les bulles apparaissent à la surface." },
        { question: "La farine de pois chiches modifie-t-elle vraiment le goût ?", answer: "Légèrement — avec du sirop d'érable, de la vanille et des fruits, le goût légumeux est totalement masqué. En version sucrée avec des fruits, personne ne devinerait que ces pancakes contiennent de la farine de pois chiches." },
        { question: "Peut-on utiliser uniquement de la farine de pois chiches ?", answer: "Oui. La pâte 100% farine de pois chiches donne des pancakes très protéinés mais plus denses. La combinaison farine complète + farine de pois chiches donne un meilleur équilibre texture légère/apport protéique." }
      ],
      related_article_ids: [1, 6, 22],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 64,
    data: {
      meta_title: "Salade lentilles, poivron rouge et citron | Mamie Végé",
      meta_description: "Salade lentilles vertes, poivron rouge et citron : 26 g de protéines et fer optimisé. La salade récupération fer + vitamine C pour coureurs végétariens.",
      intro: "Cette salade est spécialement conçue pour les sportifs végétariens qui surveillent leur bilan en fer — notamment les coureurs exposés à l'hémolyse mécanique. Les lentilles vertes apportent 9 g de protéines et 3,3 mg de fer pour 100 g cuites (table Ciqual ANSES). Le poivron rouge est l'une des sources les plus concentrées en vitamine C des légumes courants : environ 190 mg pour 100 g. Le citron en vinaigrette complète cet apport. L'association lentilles + poivron rouge + citron crée une synergie nutritionnelle : la vitamine C multiplie l'absorption du fer végétal par 3 à 4 selon les données de l'ANSES (avis alimentation végétarienne 2021). Une salade anti-anémie par excellence, savoureuse et transportable.",
      image_alt: "Salade de lentilles vertes avec poivron rouge cru, persil frais et vinaigrette citron-moutarde — salade végétarienne fer vitamine C post-running",
      sport_timing: "Déjeuner ou dîner de récupération. Particulièrement recommandée les jours après une longue sortie de running ou de vélo (besoin accru en fer). Aussi en déjeuner transportable au bureau.",
      conservation: "Se conserve 4 jours au réfrigérateur (les lentilles vertes tiennent bien). La vinaigrette à part de préférence. Ajouter les herbes fraîches au service.",
      variants: [
        { title: "Version feta (+ calcium et protéines)", description: "Émietter 80 g de feta sur la salade. +8 g de protéines, apport en calcium augmenté. La combinaison lentilles + feta est classique en cuisine méditerranéenne." },
        { title: "Version betterave (+ nitrates)", description: "Ajouter 100 g de betterave cuite en dés. Les nitrates naturels de la betterave sont associés à l'amélioration des performances en endurance." },
        { title: "Version tahini (sauce crémeuse)", description: "Ajouter 2 c. à s. de tahini dans la vinaigrette. Sauce plus crémeuse, calcium du sésame en bonus (420 mg/100 g)." }
      ],
      nutrition_per_serving: { calories: 523, proteins_g: 26, carbs_g: 65, fat_g: 17, fiber_g: 13, iron_mg: 7 },
      schema_recipe: { recipeCategory: "Déjeuner", recipeCuisine: "Végétarienne", keywords: "salade lentilles poivron rouge citron végétarienne, salade fer vitamine C végé sportif, salade lentilles récupération running" },
      faq_recette: [
        { question: "Pourquoi associer spécifiquement le poivron rouge aux lentilles ?", answer: "Le poivron rouge apporte environ 190 mg de vitamine C pour 100 g — parmi les meilleures sources végétales (bien au-dessus de l'orange à 60 mg). La vitamine C est le meilleur activateur de l'absorption du fer non héminique (végétal). L'association lentilles + poivron rouge + citron triple ou quadruple l'absorption du fer des lentilles." },
        { question: "Cette salade aide-t-elle vraiment à prévenir l'anémie sportive ?", answer: "Elle y contribue significativement, mais ne remplace pas un suivi médical. Les sportifs végétariens sont plus exposés au déficit en fer (hémolyse mécanique + absence de fer héminique). Un bilan ferritine annuel est recommandé. Cette salade maximise l'apport en fer végétal et son absorption via la vitamine C." },
        { question: "Les lentilles vertes se cuisinent-elles différemment des lentilles corail ?", answer: "Oui. Les lentilles vertes tiennent à la cuisson et restent fermes (cuisson 25-30 min sans trempage). Les lentilles corail fondent en 15-20 min. Pour une salade, toujours utiliser des lentilles vertes — les corail se défont complètement et donnent une texture de purée." }
      ],
      related_article_ids: [1, 9, 20],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 65,
    data: {
      meta_title: "Bowl express 5 min pois chiches et avocat | Mamie Végé",
      meta_description: "Bowl express 5 minutes pois chiches et avocat végétarien : sans cuisson, zéro préparation. Le déjeuner ou la collation végé la plus rapide du blog.",
      intro: "Ce bowl est la définition du repas végétarien sans effort : une boîte de pois chiches, un demi-avocat, des graines, du citron. Zéro cuisson, 5 minutes maximum. Les pois chiches en boîte (directement rincés et égouttés) apportent 8-9 g de protéines et 2,9 mg de fer pour 100 g (table Ciqual ANSES) — pas de cuisson nécessaire car ils sont déjà cuits dans la boîte. L'avocat fournit des graisses mono-insaturées cardioprotectrices et une satiété durable. Le paprika fumé et le citron transforment des ingrédients basiques en quelque chose de savoureux en 30 secondes. Les graines de courge et de tournesol ajoutent du croquant, du zinc et du magnésium. Ce bowl est la solution pour les jours sans énergie pour cuisiner.",
      image_alt: "Bowl express végétarien 5 minutes avec pois chiches épicés, avocat en dés et graines mélangées — déjeuner végé sans cuisson rapide",
      sport_timing: "Collation pré-sport 1 à 2 heures avant une séance légère. Ou déjeuner express entre deux activités. Pour la récupération post-sport, compléter avec du riz complet ou du pain.",
      conservation: "À consommer immédiatement (l'avocat s'oxyde). Les pois chiches en boîte non utilisés se conservent 2-3 jours au réfrigérateur dans l'eau de trempage ou de l'eau froide.",
      variants: [
        { title: "Version épicée (harissa + citron)", description: "Ajouter ½ c. à c. de harissa + paprika fumé + beaucoup de citron. Saveur nord-africaine intense, zéro calories supplémentaires." },
        { title: "Version protéinée (+ tofu fumé)", description: "Ajouter 80 g de tofu fumé en dés. Zéro cuisson (le tofu fumé se mange directement). L'apport protéique monte à environ 20-22 g par portion." },
        { title: "Version houmous (sauce crémeuse)", description: "Ajouter 2 c. à s. de houmous directement dans le bowl. Protéines supplémentaires, texture crémeuse, saveur tahini-citron." }
      ],
      nutrition_per_serving: { calories: 350, proteins_g: 16, carbs_g: 28, fat_g: 21, fiber_g: 10, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Déjeuner", recipeCuisine: "Végétarienne", keywords: "bowl express 5 minutes pois chiches avocat végétarien, déjeuner sans cuisson végé rapide, bowl pois chiches express sportif" },
      faq_recette: [
        { question: "Les pois chiches en boîte peuvent-ils se manger sans cuisson ?", answer: "Oui, absolument. Les pois chiches en conserve sont déjà cuits (stérilisés à haute température pendant la mise en boîte). Il suffit de les rincer à l'eau froide pour éliminer l'excès de sodium. Directement prêts à manger, chauds ou froids." },
        { question: "Comment choisir un avocat mûr ?", answer: "L'avocat doit céder légèrement à la pression du pouce (sans être mou). La peau doit être sombre (vert foncé à presque noir pour l'Hass). Si l'avocat est encore ferme, le laisser mûrir à température ambiante 1 à 2 jours. Un avocat mûr peut être conservé 2 jours au frigo." },
        { question: "Ce bowl est-il suffisant comme repas principal ?", answer: "Pour une collation ou un déjeuner léger, oui. Pour un repas post-entraînement complet, compléter avec du riz complet (150 g cuit) ou du pain complet. Ce bowl apporte environ 16 g de protéines et des graisses saines — les glucides sont en revanche limités sans féculents en accompagnement." }
      ],
      related_article_ids: [1, 2, 15],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 66,
    data: {
      meta_title: "Overnight oats protéinés à préparer la veille | Mamie Végé",
      meta_description: "Overnight oats végétariens protéinés : 16 g de protéines, prêts en 5 min la veille. Le petit-déjeuner sportif express sans cuisson pour sportifs matinaux.",
      intro: "Les overnight oats sont la solution pour les sportifs végétariens qui sautent le petit-déjeuner faute de temps le matin. Préparer en 5 minutes la veille au soir : flocons d'avoine + yaourt de soja protéiné + lait végétal + graines de chia + fruits. Laisser au réfrigérateur une nuit. Le matin : sortir, manger. Zéro cuisson, zéro vaisselle supplémentaire. Les flocons d'avoine apportent 13-14 g de protéines pour 100 g sec (table Ciqual ANSES) et des glucides complexes. Le yaourt de soja protéiné double l'apport en protéines. Les graines de chia gélifient la préparation pendant la nuit — absorbant jusqu'à 10 fois leur poids en eau — et apportent des oméga-3 ALA. Un petit-déjeuner de 16 g de protéines prêt en 0 minute le matin.",
      image_alt: "Bocal de overnight oats végétarien avec couches de flocons d'avoine, yaourt de soja, graines de chia et fruits — petit-déjeuner express préparé la veille",
      sport_timing: "Petit-déjeuner 2 à 3 heures avant une séance du matin, ou après une séance matinale en récupération. Sortir du réfrigérateur 10 minutes avant de manger si on préfère à température ambiante.",
      conservation: "Préparer jusqu'à 4-5 bocaux à l'avance pour toute la semaine. Fruits frais à ajouter le matin (ne pas mélanger la veille). Conservation 4-5 jours au réfrigérateur.",
      variants: [
        { title: "Version protéine en poudre (+ protéines)", description: "Ajouter 15 g de protéine de pois vanille dans le bocal avec les flocons. L'apport protéique passe de 16 g à environ 28-30 g." },
        { title: "Version matcha (+ antioxydants)", description: "Incorporer 1 c. à c. de poudre de matcha dans le yaourt de soja. Antioxydants (EGCG) et légère stimulation naturelle par la L-théanine." },
        { title: "Version pomme-cannelle (automne)", description: "Mixer ½ pomme râpée + 1 c. à c. de cannelle dans les flocons la veille. La pomme dégage son eau pendant la nuit et parfume les flocons." }
      ],
      nutrition_per_serving: { calories: 546, proteins_g: 16, carbs_g: 55, fat_g: 26, fiber_g: 9, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Petit-déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "overnight oats protéinés végétarien, oats nuit express végé sportif, petit déjeuner préparé veille végétarien" },
      faq_recette: [
        { question: "Quelle est la proportion idéale pour une texture parfaite ?", answer: "La proportion classique : 70 g de flocons pour 125 g de yaourt de soja + 50-60 ml de lait végétal. Pour une texture plus épaisse, réduire le lait. Pour plus liquide, augmenter. Après une nuit, les flocons absorbent tout le liquide — la texture est toujours plus épaisse le matin que la veille." },
        { question: "Peut-on utiliser des flocons d'avoine instantanés ?", answer: "Oui, mais la texture sera plus lisse et moins consistante. Les flocons roulés classiques (non instantanés) gardent une texture plus ferme après la nuit de trempage. Les deux fonctionnent selon les préférences." },
        { question: "Ces overnight oats conviennent-ils aux intolérants au lactose ?", answer: "Oui, si on utilise du yaourt et du lait végétaux (soja, amande, avoine, coco). Ces recettes sont naturellement sans produits laitiers dans leur version végétarienne." }
      ],
      related_article_ids: [1, 22, 6],
      updated_date: '2026-04-02'
    }
  }
];

async function run() {
  console.log('🚀 Enrichissement batch 3b — 13 recettes (IDs 54-66)\n');

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
