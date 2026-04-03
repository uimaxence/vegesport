#!/usr/bin/env node
/**
 * SEO Fix 7 — mamie-vege.fr — 03/04/2026
 * Enrichissement batch 3a — 19 recettes
 * IDs : 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 51, 52, 53
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
    id: 35,
    data: {
      meta_title: "Bowl lentilles-quinoa-tofu pour sportifs | Mamie Végé",
      meta_description: "Bowl lentilles, quinoa et tofu végétarien : 36 g de protéines. Le repas de récupération musculaire végé complet pour musculation et crossfit.",
      intro: "Ce bowl est spécialement formulé pour la récupération musculaire post-entraînement. Il combine les trois meilleures sources de protéines végétales : lentilles vertes (9 g de protéines et 3,3 mg de fer pour 100 g cuit, Ciqual ANSES), quinoa (profil en acides aminés complet) et tofu mariné au gingembre-sauce soja (12-15 g/100 g). La marinade gingembre-sauce soja caramélise le tofu à la poêle et développe des saveurs umami intenses. Les épinards cuits apportent du magnésium essentiel à la contraction musculaire. Les carottes ajoutent du bêta-carotène antioxydant. Avec 36 g de protéines par portion, ce bowl couvre environ 30 % des besoins journaliers d'un sportif de 70 kg visant 1,8 g/kg/j.",
      image_alt: "Bowl végétarien avec lentilles vertes, quinoa, cubes de tofu mariné et épinards — repas récupération musculaire sportif protéiné",
      sport_timing: "Dans l'heure après une séance de musculation, crossfit ou sport intense. Optimal pendant la fenêtre anabolique post-effort pour maximiser la synthèse protéique musculaire.",
      conservation: "Composants séparés : 4-5 jours au réfrigérateur. Idéal en batch cooking du dimanche. Assembler en 5 minutes.",
      variants: [
        { title: "Version 50g protéines (+ edamame)", description: "Ajouter 100 g d'edamame décortiqué (11 g de protéines/100 g). L'apport protéique total monte à environ 48-50 g." },
        { title: "Version froide (salade composée)", description: "Assembler tous les composants refroidis avec une vinaigrette citron-moutarde-ail. Excellent en salade de déjeuner transportable." },
        { title: "Version tempeh (+ digestibilité)", description: "Remplacer le tofu par 200 g de tempeh grillé. Apport protéique augmenté, meilleure digestibilité grâce à la fermentation." }
      ],
      nutrition_per_serving: { calories: 647, proteins_g: 36, carbs_g: 63, fat_g: 27, fiber_g: 11, iron_mg: 6 },
      schema_recipe: { recipeCategory: "Déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "bowl lentilles quinoa tofu végétarien sportif, repas récupération musculaire végé, bowl protéiné musculation végétarien" },
      faq_recette: [
        { question: "Comment accélérer la préparation de ce bowl en semaine ?", answer: "Batch cooking du dimanche : cuire 500 g de quinoa + 400 g de lentilles + 400 g de tofu mariné et grillé en une heure. Conserver au frigo séparément. En semaine, assembler en 5 minutes." },
        { question: "Ce bowl est-il suffisant pour la récupération après une séance de musculation intense ?", answer: "Oui, avec 36 g de protéines et des glucides complexes, ce bowl couvre les besoins post-musculation pour la plupart des sportifs. Pour des séances très intenses ou un objectif de prise de masse importante, ajouter une source de glucides rapides (banane) dans les 30 minutes suivant la séance." },
        { question: "Peut-on remplacer le tofu par du tempeh ?", answer: "Oui, et c'est une excellente option. Le tempeh apporte 18-20 g de protéines pour 100 g (contre 12-15 g pour le tofu), avec une meilleure digestibilité grâce à la fermentation. La technique de cuisson est identique." }
      ],
      related_article_ids: [1, 14, 7],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 36,
    data: {
      meta_title: "Chili sin carne pour coureurs et cyclistes | Mamie Végé",
      meta_description: "Chili sin carne végétarien pour coureurs et cyclistes : 16 g de protéines et 95 g de glucides. Batch cooking idéal pour sportifs d'endurance végétariens.",
      intro: "Ce chili sin carne est spécifiquement formulé pour les sportifs d'endurance végétariens — coureurs, cyclistes, triathlètes. La combinaison haricots rouges + maïs + riz complet est particulièrement dense en glucides (95 g par portion) pour recharger le glycogène musculaire après les longues sorties. Les haricots rouges apportent 8-9 g de protéines et 2,9 mg de fer pour 100 g cuits (Ciqual ANSES). Les tomates de la sauce apportent de la vitamine C qui multiplie l'absorption du fer végétal par 3 à 4 — crucial pour les coureurs végétariens exposés à l'hémolyse mécanique des foulées. Préparer en grande quantité le dimanche couvre les dîners de récupération de toute la semaine.",
      image_alt: "Bol de chili sin carne végétarien avec haricots rouges, maïs et riz complet — repas batch cooking endurance végétarien",
      sport_timing: "Repas de récupération post-sortie longue (running, vélo). Servir avec du riz complet pour les glucides supplémentaires. Idéal le soir après une sortie longue du week-end.",
      conservation: "Se conserve 5 jours au réfrigérateur. Congélation 3 mois en portions individuelles. Le chili s'améliore après 24-48 heures — les épices développent leur saveur.",
      variants: [
        { title: "Version lentilles (+ fer)", description: "Ajouter 150 g de lentilles vertes rincées à mi-cuisson. Apport en fer augmenté de 3,3 mg/100 g (lentilles cuites, Ciqual ANSES)." },
        { title: "Version mole végé (chocolat noir)", description: "Ajouter 20 g de chocolat noir 70% en fin de cuisson. La saveur se complexifie et l'amertume équilibre les épices. Apport en magnésium augmenté." },
        { title: "Version tacos (garniture)", description: "Servir la garniture dans des tortillas de maïs avec de l'avocat, de la crème végane et de la coriandre fraîche. Version festive post-compétition." }
      ],
      nutrition_per_serving: { calories: 470, proteins_g: 16, carbs_g: 95, fat_g: 3, fiber_g: 14, iron_mg: 5 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "chili sin carne végétarien coureurs cyclistes, chili végé endurance sportif, chili haricots rouges récupération running" },
      faq_recette: [
        { question: "Pourquoi ce chili est-il recommandé pour les coureurs végétariens ?", answer: "Les coureurs végétariens sont exposés à deux risques : la carence en fer (hémolyse mécanique des foulées + fer non héminique moins absorbé) et la fatigue glucidique. Ce chili répond aux deux : haricots rouges + tomates (fer végétal + vitamine C qui triple l'absorption) et riz complet (glucides de récupération)." },
        { question: "Ce chili convient-il avant une compétition de running ?", answer: "Pas la veille ni le jour J — les fibres des haricots sont trop importantes pour l'avant-compétition. Consommer plutôt 2 à 3 jours avant pour reconstituer le glycogène musculaire. La veille, préférer des glucides moins fibreux (pâtes, riz blanc)." },
        { question: "Peut-on utiliser des haricots rouges secs plutôt qu'en boîte ?", answer: "Oui. Les haricots rouges secs doivent être trempés 12 heures (ils contiennent des lectines neutralisées par la cuisson). Cuire 45-60 minutes à ébullition après trempage. Pour le batch cooking, cuire 500 g de haricots secs en une fois le dimanche." }
      ],
      related_article_ids: [12, 20, 6],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 37,
    data: {
      meta_title: "Porridge pré-sortie running et vélo végé | Mamie Végé",
      meta_description: "Porridge protéiné pré-sortie running ou vélo : 17 g de protéines et 52 g de glucides. Le petit-déjeuner végétarien calibré pour les sorties de 1 à 2 heures.",
      intro: "Ce porridge est la version équilibrée entre le porridge classique (trop protéiné avant l'effort) et le porridge boost endurance (trop chargé en glucides pour une sortie modérée). Calibré pour une sortie de 1 à 2 heures : 52 g de glucides pour alimenter l'effort, 17 g de protéines pour limiter le catabolisme musculaire. Les flocons d'avoine apportent des glucides complexes à libération progressive (IG ~55, tables internationales). La banane ajoute 23 g de glucides rapides (IG 55) et 422 mg de potassium. La purée d'amande prolonge la satiété avec des graisses insaturées. La cannelle a un IG bas et ralentit légèrement l'absorption des glucides pour une énergie encore plus stable.",
      image_alt: "Bol de porridge avec banane, raisins secs et purée d'amande — petit-déjeuner végétarien pré-sortie running ou vélo",
      sport_timing: "2 à 2h30 avant une sortie de running ou de vélo de 1 à 2 heures. Moins de glucides que le porridge boost endurance — calibré pour les sorties modérées, pas les longues sorties.",
      conservation: "Préparer la base flocons + lait végétal la veille. Ajouter la banane fraîche le matin. Les raisins secs peuvent être ajoutés à l'avance.",
      variants: [
        { title: "Version allégée (avant footing léger <1h)", description: "Réduire à 50 g de flocons et supprimer les raisins secs. Apport glucidique réduit à ~40 g — suffisant pour 45-60 minutes de footing léger." },
        { title: "Version trail (+ dense)", description: "Ajouter 30 g de raisins secs supplémentaires et 1 c. à s. de beurre de cacahuète. Apport passe à 80 g de glucides — version sortie longue trail." },
        { title: "Version sans purée d'amande (plus digeste)", description: "Supprimer la purée d'amande et remplacer par 1 yaourt de soja. Moins de graisses avant l'effort, protéines maintenues, digestion légèrement facilitée." }
      ],
      nutrition_per_serving: { calories: 474, proteins_g: 17, carbs_g: 52, fat_g: 18, fiber_g: 7, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Petit-déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "porridge pré-sortie running végétarien, petit déjeuner avant vélo végé, porridge avant sport endurance modérée" },
      faq_recette: [
        { question: "Quelle est la différence entre ce porridge et le porridge boost endurance ?", answer: "Le porridge boost endurance (id 30) est optimisé pour les longues sorties de 2h+ : plus de glucides (63 g), moins de protéines. Ce porridge pré-sortie est plus équilibré (52 g glucides, 17 g protéines) pour les sorties de 1 à 2 heures. Pour un footing de 45 minutes, même ce porridge peut être légèrement réduit." },
        { question: "Peut-on manger ce porridge 1 heure seulement avant la sortie ?", answer: "Possible mais risqué — la digestion de l'avoine prend environ 2 heures. Si tu dois manger 1 heure avant, réduire la portion à 50 g de flocons et supprimer la purée d'amande (graisses = digestion plus longue). Tester à l'entraînement avant une compétition." },
        { question: "Les raisins secs sont-ils utiles avant la sortie ?", answer: "Oui, ils apportent des glucides rapides (75 g/100 g, IG 65) qui complètent les glucides complexes de l'avoine. 20 g de raisins secs = 15 g de glucides supplémentaires rapidement disponibles. Pour les sorties de moins d'une heure, ils sont optionnels." }
      ],
      related_article_ids: [6, 12, 30],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 38,
    data: {
      meta_title: "Curry pois chiches rapide prise de muscle | Mamie Végé",
      meta_description: "Curry pois chiches et brocoli pour prise de masse végétarienne : 19 g de protéines, 80 g de glucides. Recette express 25 min pour sportifs végétariens.",
      intro: "Ce curry de pois chiches est calibré pour la prise de masse musculaire végétarienne. La prise de masse nécessite un surplus calorique avec une densité protéique suffisante. Les pois chiches apportent simultanément des protéines (8-9 g/100 g cuit, Ciqual ANSES) et des glucides complexes (22 g/100 g cuit) — deux macros essentiels pour la prise de masse. Le brocoli ajoute 89 mg de vitamine C pour 100 g — qui optimise l'absorption du fer des pois chiches — et du chrome utile pour la gestion de la glycémie. Le riz basmati complète avec 80 g de glucides totaux par portion pour soutenir le surplus calorique. Prêt en 25 minutes, ce plat est compatible avec les contraintes de temps des sportifs actifs.",
      image_alt: "Bol de curry de pois chiches avec brocoli et riz basmati — dîner végétarien protéiné pour prise de masse musculaire",
      sport_timing: "Repas post-musculation dans l'heure suivant la séance. Ou en déjeuner dense 2-3 heures avant une séance lourde. La densité glucidique soutient le surplus calorique nécessaire à la prise de masse.",
      conservation: "Se conserve 5 jours au réfrigérateur. Congélation 3 mois. La sauce s'améliore avec le temps — préparer en grande quantité.",
      variants: [
        { title: "Version prise de masse (+ caloric)", description: "Ajouter 2 c. à s. de beurre de cacahuète dans le curry en fin de cuisson (dissoudre avec un peu de lait végétal). Apport calorique et en protéines augmentés." },
        { title: "Version tofu (+ protéines)", description: "Ajouter 150 g de tofu ferme grillé en dés dans le curry. Apport protéique passe à environ 30-32 g par portion." },
        { title: "Version épinards (+ fer et magnésium)", description: "Remplacer le brocoli par 200 g d'épinards frais en fin de cuisson. Apport en fer et magnésium augmenté — important pour la récupération musculaire." }
      ],
      nutrition_per_serving: { calories: 560, proteins_g: 19, carbs_g: 80, fat_g: 18, fiber_g: 12, iron_mg: 5 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "curry pois chiches prise de masse végétarien, curry végé muscu protéiné, curry express sportif végétarien" },
      faq_recette: [
        { question: "Ce curry est-il vraiment suffisant pour la prise de masse végétarienne ?", answer: "En un repas, il contribue significativement. La prise de masse nécessite un surplus calorique total et 1,8-2 g de protéines/kg/jour. Ce curry (19 g de protéines + 80 g de glucides) est un solide repas dans cette stratégie. L'ensemble de la journée doit être planifié avec un suivi des macros." },
        { question: "La pâte de curry en boîte est-elle aussi bonne que le curry maison ?", answer: "En goût, le curry maison (cumin + coriandre + curcuma + gingembre + piment) est plus frais et plus personnalisable. En rapidité, la pâte de curry en boîte est imbattable : 1 c. à s. = 5 épices à doser. Pour un plat express de semaine, la pâte du commerce est un excellent compromis." },
        { question: "Peut-on préparer ce curry en grande quantité pour la semaine ?", answer: "Oui, c'est même recommandé. Quadrupler les quantités donne 4 portions pour 4 dîners. Se conserve 5 jours au frigo et 3 mois au congélateur. La sauce s'intensifie après 24-48 heures — meilleur réchauffé que le jour même." }
      ],
      related_article_ids: [1, 14, 7],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 39,
    data: {
      meta_title: "Galettes haricots blancs protéinées express | Mamie Végé",
      meta_description: "Galettes haricots blancs protéinées végétariennes : 12 g de protéines, collation sportive express 20 min. Alternative végé aux steaks pour sportifs pressés.",
      intro: "Ces galettes haricots blancs sont la collation sportive végétarienne polyvalente : chaudes, froides, en repas ou en collation, à la maison ou transportées. Les haricots blancs apportent environ 7-8 g de protéines et 8 g de fibres pour 100 g cuits (table Ciqual ANSES). Associés aux flocons d'avoine comme liant, ils donnent une texture proche d'un steak végétalien sans les additifs des versions industrielles. Le persil frais apporte de la vitamine C qui optimise l'absorption du fer des haricots blancs. Préparées en batch cooking en 20 minutes, elles se réchauffent en 3 minutes à la poêle — la définition de la collation sportive express.",
      image_alt: "Galettes végétariennes haricots blancs et flocons d'avoine dorées avec de la roquette et du houmous — collation sportive express",
      sport_timing: "Collation 2 heures avant une séance de musculation ou de sport collectif. Ou en repas léger post-entraînement avec une salade. Transportable dans un contenant hermétique.",
      conservation: "Se conservent 4 jours au réfrigérateur. Congélation 2 mois. Réchauffage : 3 minutes à la poêle antiadhésive (éviter le micro-ondes pour le croustillant).",
      variants: [
        { title: "Version épicée (cumin + paprika)", description: "Ajouter 1 c. à c. de cumin + ½ c. à c. de paprika fumé dans la préparation. Saveur nettement plus intense." },
        { title: "Version fromage végane", description: "Incorporer 50 g de fromage végane râpé dans la pâte. Version plus festive et plus calorique." },
        { title: "Version mini-galettes apéritif", description: "Former des galettes de 2 cm de diamètre. Cuire 2-3 minutes par face. Parfaites en apéritif végétarien protéiné avec une sauce yaourt-herbes." }
      ],
      nutrition_per_serving: { calories: 254, proteins_g: 12, carbs_g: 38, fat_g: 3, fiber_g: 8, iron_mg: 3 },
      schema_recipe: { recipeCategory: "Collation sportive", recipeCuisine: "Végétarienne", keywords: "galettes haricots blancs protéinées végétariennes, collation végé sportive express, steaks végétariens maison haricots" },
      faq_recette: [
        { question: "Comment empêcher les galettes de s'effondrer à la cuisson ?", answer: "Trois points : bien égoutter les haricots blancs, ajouter 1 à 2 c. à s. de fécule de maïs si la pâte est trop molle, et ne pas retourner les galettes avant que la première face soit bien dorée (4 minutes à feu moyen). Une poêle antiadhésive légèrement huilée est indispensable." },
        { question: "Ces galettes sont-elles adaptées aux enfants ?", answer: "Oui, c'est une excellente façon de leur faire manger des légumineuses. Réduire les épices, ajouter du fromage râpé dans la pâte. Servir avec une sauce au yaourt ou du ketchup maison. La texture proche d'un steak est généralement bien acceptée." },
        { question: "Peut-on utiliser d'autres légumineuses pour ces galettes ?", answer: "Oui. Les pois chiches donnent une texture légèrement plus ferme. Les lentilles vertes cuites fonctionnent aussi. Les haricots noirs donnent une couleur foncée spectaculaire. Dans tous les cas, bien égoutter et sécher avant de mixer." }
      ],
      related_article_ids: [1, 7, 16],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 40,
    data: {
      meta_title: "Bol petit-déj avoine-tofu soyeux sportif | Mamie Végé",
      meta_description: "Bol petit-déjeuner avoine et tofu soyeux végétarien : 22 g de protéines sans protéine en poudre. Petit-déjeuner sportif original et crémeux prêt en 10 min.",
      intro: "Ce bol de petit-déjeuner salé-sucré est une alternative originale au porridge classique. Le tofu soyeux mixé avec la boisson végétale crée une base crémeuse qui remplace le yaourt ou la crème — 5-6 g de protéines pour 100 g et une texture proche de la panna cotta. Les flocons d'avoine maintiennent les glucides complexes (13-14 g de protéines pour 100 g sec, Ciqual ANSES). La banane apporte les glucides rapides et 422 mg de potassium. Les amandes effilées ajoutent du magnésium et des graisses insaturées. Sans protéine en poudre, ce bol atteint 22 g de protéines en combinant intelligemment les sources végétales. Un petit-déjeuner qui réconcilie les sportifs végétariens avec le soja.",
      image_alt: "Bol petit-déjeuner végétarien avec flocons d'avoine, tofu soyeux crémeux, banane et amandes effilées — démarrage sportif protéiné",
      sport_timing: "Petit-déjeuner 2 à 3 heures avant une séance. Le tofu soyeux est très digeste — moins de risque d'inconfort digestif que les légumineuses classiques avant l'effort.",
      conservation: "Le bol assemblé se consomme immédiatement. La base tofu soyeux + flocons peut être préparée la veille (overnight). Ajouter les fruits et graines au service.",
      variants: [
        { title: "Version cacao (petit-déj chocolat)", description: "Ajouter 1 c. à s. de cacao non sucré dans le tofu soyeux mixé. Riche en magnésium (228 mg/100 g cacao, Ciqual ANSES), saveur chocolat sans sucre ajouté." },
        { title: "Version matcha (+ antioxydants)", description: "Incorporer 1 c. à c. de poudre de matcha dans le tofu soyeux. Apport en antioxydants (EGCG) et légère stimulation naturelle par la L-théanine du thé vert." },
        { title: "Version beurre d'amande (+ satiété)", description: "Ajouter 1 c. à s. de beurre d'amande sur le dessus. Apport en graisses insaturées et calcium végétal augmentés, satiété prolongée." }
      ],
      nutrition_per_serving: { calories: 481, proteins_g: 22, carbs_g: 47, fat_g: 21, fiber_g: 6, iron_mg: 3 },
      schema_recipe: { recipeCategory: "Petit-déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "bol petit déjeuner tofu soyeux avoine végétarien sportif, petit déjeuner végé protéiné sans poudre, bowl avoine tofu sportif" },
      faq_recette: [
        { question: "Qu'est-ce que le tofu soyeux et où le trouver ?", answer: "Le tofu soyeux (silken tofu) est une version très douce et crémeuse du tofu, non pressée. Sa texture ressemble à du yaourt grec ferme. Il se trouve en supermarché au rayon cuisine asiatique ou produits biologiques, souvent en Tetra Pak longue conservation. Ne pas confondre avec le tofu ferme — le tofu soyeux ne se cuit pas à la poêle." },
        { question: "Le tofu soyeux a-t-il un goût prononcé dans ce bol ?", answer: "Non, le tofu soyeux nature est très neutre. Mixé avec la banane et la boisson végétale, il est totalement indétectable. Il apporte de l'onctuosité et des protéines sans saveur propre. Même les personnes qui n'apprécient pas le goût du soja acceptent souvent bien le tofu soyeux dans des préparations sucrées." },
        { question: "Peut-on remplacer le tofu soyeux par du yaourt de soja ?", answer: "Oui, c'est la substitution la plus simple. Texture légèrement plus acide et moins crémeuse, apport protéique similaire (4-6 g/100 g selon les marques). Choisir un yaourt de soja nature sans sucre ajouté pour le meilleur profil nutritionnel." }
      ],
      related_article_ids: [1, 22, 6],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 41,
    data: {
      meta_title: "Wraps houmous et tofu pour midi sportif | Mamie Végé",
      meta_description: "Wraps végétariens houmous et tofu : 22 g de protéines, prêts en 15 min. Le déjeuner sportif végé transportable par excellence pour le midi au bureau.",
      intro: "Le wrap houmous-tofu est le déjeuner transportable des sportifs végétariens actifs. Le houmous apporte environ 8 g de protéines pour 100 g (Ciqual ANSES) avec un index glycémique très bas (6-10) — pas de pic insulinique, énergie stable toute l'après-midi. Le tofu ferme ajoute 12-15 g de protéines pour 100 g. Les légumes crus (carottes, concombre, salade) apportent vitamines et fraîcheur sans aucune cuisson. Un wrap complet enveloppe le tout avec des glucides complexes. Ce déjeuner prêt en 15 minutes se transporte dans n'importe quel sac — idéal pour les sportifs qui mangent souvent hors de chez eux.",
      image_alt: "Wrap végétarien au houmous et tofu grillé coupé en deux avec des crudités colorées — déjeuner sportif végé transportable",
      sport_timing: "Déjeuner 2 à 3 heures avant une séance de l'après-midi. Ou en repas post-entraînement du midi. Le wrap se mange facilement pendant une pause courte.",
      conservation: "Assemblé : se conserve 24 heures au réfrigérateur dans du film alimentaire. Pour une meilleure conservation, garder les ingrédients séparés et assembler juste avant de manger.",
      variants: [
        { title: "Version légumes grillés (escalivade)", description: "Remplacer les légumes crus par des poivrons et courgettes grillés au four (200°C, 20 min). Saveur plus profonde et méditerranéenne." },
        { title: "Version tempeh (+ protéines)", description: "Remplacer le tofu grillé par du tempeh grillé (18-20 g de protéines/100 g). Apport protéique total passe à environ 28-30 g par wrap." },
        { title: "Version pois chiches rôtis (sans cuisson tofu)", description: "Remplacer le tofu grillé par 100 g de pois chiches en boîte rincés + paprika fumé + jus de citron. Zéro cuisson, préparation en 3 minutes." }
      ],
      nutrition_per_serving: { calories: 338, proteins_g: 22, carbs_g: 28, fat_g: 24, fiber_g: 7, iron_mg: 3 },
      schema_recipe: { recipeCategory: "Déjeuner sportif", recipeCuisine: "Végétarienne", keywords: "wrap houmous tofu végétarien, wrap végé sportif transportable, déjeuner midi végétarien bureau" },
      faq_recette: [
        { question: "Comment éviter que le wrap ne soit détrempé si préparé à l'avance ?", answer: "Étaler le houmous jusqu'aux bords de la tortilla pour créer une barrière. Ne pas utiliser de légumes trop juteux. Emballer très serré dans du film alimentaire. Pour une conservation parfaite : garder les composants séparés et assembler à midi." },
        { question: "Quel houmous choisir — maison ou commerce ?", answer: "Le houmous maison (pois chiches + tahini + citron + ail + huile d'olive) est plus riche en pois chiches et sans additifs. Le houmous du commerce est pratique — vérifier que les pois chiches sont en premier dans la liste d'ingrédients (> 50%) et éviter les versions avec amidon de maïs." },
        { question: "Ce wrap convient-il en pré-compétition ?", answer: "Oui, 2 à 3 heures avant. Éviter les légumes très fibreux (chou, brocoli). Préférer roquette, concombre et carottes râpées pour leur légèreté digestive. La tortilla apporte les glucides, le houmous et le tofu les protéines sans surcharger la digestion." }
      ],
      related_article_ids: [1, 13, 7],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 42,
    data: {
      meta_title: "Barres énergétiques végé pour l'entraînement | Mamie Végé",
      meta_description: "Barres énergétiques végétariennes pour l'entraînement : 31 g de glucides, sans cuisson. Alternative végé aux barres industrielles — dattes, avoine, cannelle.",
      intro: "Ces barres énergétiques végé sont conçues pour être consommées pendant l'effort ou juste avant — un format différent des barres de récupération post-sport. Les dattes fournissent des glucides naturels rapidement disponibles (IG 45-55 selon les tables internationales). L'avoine apporte des glucides complexes à libération progressive (IG ~55, 13-14 g de protéines pour 100 g sec, Ciqual ANSES). Le beurre de cacahuète ajoute des protéines (26 g/100 g) et des graisses insaturées qui prolongent l'énergie pendant l'effort. Les graines de tournesol complètent avec du magnésium (227 mg/100 g, Ciqual ANSES) — le minéral le plus perdu par transpiration. Préparées sans cuisson en 20 minutes, elles se transportent dans n'importe quel sac de sport.",
      image_alt: "Barres énergétiques végétariennes aux dattes et avoine empilées sur une planche — collation pendant l'entraînement végé sans cuisson",
      sport_timing: "45 à 60 minutes avant une séance ou pendant un effort de plus de 90 minutes (1 barre toutes les 45 minutes). À différencier des barres de récupération (après le sport).",
      conservation: "Se conservent 10 jours au réfrigérateur. Congélation 2 mois. Pour le transport sportif, emballer individuellement dans du papier cuisson.",
      variants: [
        { title: "Version protéinée (+ poudre de pois)", description: "Ajouter 20 g de protéine de pois dans la préparation. Apport protéique passe de 5 g à environ 12 g par barre." },
        { title: "Version noix de coco (tropical)", description: "Remplacer les graines de tournesol par 30 g de noix de coco râpée. Saveur exotique, légèrement plus calorique." },
        { title: "Version café (+ stimulation)", description: "Ajouter 1 c. à c. de café soluble dans la préparation. La caféine améliore la performance sportive de 3-5% selon les études — une dose modérée dans une barre." }
      ],
      nutrition_per_serving: { calories: 220, proteins_g: 5, carbs_g: 31, fat_g: 8, fiber_g: 4, iron_mg: 2 },
      schema_recipe: { recipeCategory: "Collation sportive", recipeCuisine: "Végétarienne", keywords: "barres énergétiques végé entraînement, barres sport végétariennes maison, collation pendant entraînement végé dattes" },
      faq_recette: [
        { question: "Ces barres sont-elles à manger avant ou pendant le sport ?", answer: "Les deux. Avant l'effort (45-60 min avant) : 1 barre apporte les glucides de démarrage. Pendant l'effort (toutes les 45 min après 90 min d'effort) : 1 barre maintient l'énergie. Pour la récupération post-sport, les barres plus riches en protéines sont plus adaptées." },
        { question: "Quelle est la quantité de glucides dans ces barres ?", answer: "Environ 31 g de glucides par barre (dattes ~70 g/100 g, avoine ~60 g/100 g sec). Pour un effort de 90 minutes, l'objectif est de 30-60 g de glucides par heure — 1 à 2 barres par heure selon leur taille." },
        { question: "Comment conserver ces barres pour les emmener en compétition ?", answer: "Envelopper chaque barre dans du papier cuisson ou du film alimentaire. Placer dans une petite boîte rigide. À température ambiante, elles tiennent 3-4 heures sans problème. Pour les ultra-trails, les réfrigérer dans un cooler bag avec un pain de glace." }
      ],
      related_article_ids: [6, 12, 24],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 43,
    data: {
      meta_title: "Hachis parmentier végétarien façon mamie | Mamie Végé",
      meta_description: "Hachis parmentier végétarien aux lentilles : 18 g de protéines, plat réconfortant maison. La version végé du classique familial pour les sportifs et la famille.",
      intro: "Le hachis parmentier végétarien est la démonstration qu'on peut satisfaire toute la table sans viande. Les lentilles vertes remplacent avantageusement la viande hachée — 9 g de protéines et 3,3 mg de fer pour 100 g cuit (Ciqual ANSES) — avec une texture proche de la farce classique grâce au concentré de tomate et aux épices. La purée de pommes de terre apporte des glucides complexes et du potassium pour la récupération musculaire. La muscade et la noix de muscade développent les arômes de la purée traditionnelle. Ce plat est particulièrement intéressant pour les familles en transition végétarienne : la présentation est identique à l'original, les enfants et les adultes omnivores l'acceptent généralement sans résistance.",
      image_alt: "Hachis parmentier végétarien gratiné aux lentilles avec croûte dorée dans un plat familial — plat réconfortant végé façon mamie",
      sport_timing: "Repas du soir post-entraînement ou repas dominical de récupération. La densité glucidique des pommes de terre et les protéines des lentilles en font un plat de récupération familial complet.",
      conservation: "Se conserve 4 jours au réfrigérateur. Congélation possible 3 mois. Réchauffer au four 20 minutes à 180°C pour retrouver le croustillant du dessus.",
      variants: [
        { title: "Version patate douce (+ bêta-carotène)", description: "Remplacer la moitié des pommes de terre par de la patate douce. Apport en bêta-carotène et potassium augmenté, saveur légèrement sucrée qui contraste bien avec les lentilles." },
        { title: "Version gratinée (fromage végane)", description: "Parsemer 50 g de fromage végane râpé sur le dessus avant de passer au four. Version plus festive et plus riche." },
        { title: "Version épicée (cumin + paprika fumé)", description: "Ajouter 1 c. à c. de cumin et ½ c. à c. de paprika fumé dans la farce aux lentilles. Saveur plus complexe, moins 'classique' mais très savoureuse." }
      ],
      nutrition_per_serving: { calories: 441, proteins_g: 18, carbs_g: 50, fat_g: 18, fiber_g: 9, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Plat principal", recipeCuisine: "Végétarienne", keywords: "hachis parmentier végétarien lentilles, hachis végé façon mamie familial, gratin végétarien lentilles sportif" },
      faq_recette: [
        { question: "Comment reproduire la texture de viande hachée avec des lentilles ?", answer: "Plusieurs techniques combinées : cuire les lentilles vertes légèrement plus longtemps pour les rendre fondantes, ajouter 2 c. à c. de concentré de tomate pour la couleur et l'umami, et 1 c. à c. de sauce soja pour la profondeur de goût. Les protéines de soja texturées (PST) réhydratées peuvent aussi être mélangées aux lentilles pour une texture encore plus proche." },
        { question: "Ce hachis végétarien convient-il aux enfants ?", answer: "Oui — c'est l'un des plats végétariens les mieux acceptés par les enfants. La présentation est identique à l'original. Le goût est légèrement différent mais familier. La texture de la purée et le croustillant du dessus restent les mêmes." },
        { question: "Peut-on utiliser des lentilles en boîte pour gagner du temps ?", answer: "Oui. Les lentilles vertes en boîte économisent 25 minutes de cuisson. Les rincer abondamment, les égoutter puis les incorporer directement dans la sauce. Le résultat est légèrement moins savoureux que les lentilles cuites maison avec du bouillon, mais acceptable pour un plat de semaine express." }
      ],
      related_article_ids: [1, 2, 9],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 44,
    data: {
      meta_title: "Smoothie protéiné du soir récup musculaire | Mamie Végé",
      meta_description: "Smoothie protéiné soir végétarien : 21 g de protéines pour la récupération musculaire nocturne. Graines de chanvre et cacao pour les sportifs végétariens.",
      intro: "Le smoothie du soir pour la récupération musculaire répond à une logique différente du smoothie post-sport immédiat. La nuit est le moment principal de la synthèse protéique musculaire (hormone de croissance sécrétée pendant le sommeil). Un apport protéique avant le coucher prolonge la disponibilité des acides aminés pendant plusieurs heures. Ce smoothie utilise des protéines à digestion modérée : yaourt végétal et graines de chanvre décortiquées (30 g de protéines pour 100 g, profil en acides aminés complet, Ciqual ANSES). La banane apporte les glucides qui facilitent l'entrée du tryptophane dans le cerveau et favorisent la production de sérotonine — utile pour la qualité du sommeil. Le cacao apporte 228 mg de magnésium pour 100 g (Ciqual ANSES) — un minéral qui favorise la relaxation musculaire.",
      image_alt: "Smoothie végétarien brun au cacao dans un verre avec des graines de chanvre — collation du soir récupération musculaire nocturne",
      sport_timing: "À consommer 30 à 60 minutes avant le coucher les soirs où tu as eu une séance intense. Les protéines à digestion modérée libèrent des acides aminés progressivement pendant la nuit.",
      conservation: "À consommer immédiatement après préparation. Ne se conserve pas (le smoothie se sépare). Préparer tous les ingrédients à l'avance pour mixer en 2 minutes juste avant de dormir.",
      variants: [
        { title: "Version caséine végane (+ tofu soyeux)", description: "Ajouter 100 g de tofu soyeux dans le mixeur. Texture plus épaisse, protéines supplémentaires à digestion plus lente — version proche du shake caséine nocturne de la musculation." },
        { title: "Version légère (avant coucher tardif)", description: "Réduire à 1 c. à s. de graines de chanvre et 150 ml de boisson végétale. Version plus légère si le smoothie est pris très près du coucher." },
        { title: "Version sans banane (plus faible en glucides)", description: "Remplacer la banane par 80 g de yaourt de soja supplémentaire. Moins de glucides, mêmes protéines — version séchage ou contrôle calorique." }
      ],
      nutrition_per_serving: { calories: 313, proteins_g: 21, carbs_g: 11, fat_g: 21, fiber_g: 4, iron_mg: 3 },
      schema_recipe: { recipeCategory: "Collation sportive", recipeCuisine: "Végétarienne", keywords: "smoothie protéiné soir végétarien récupération, smoothie avant coucher sportif végé, collation nocturne muscles végétarienne" },
      faq_recette: [
        { question: "Est-ce vraiment utile de manger des protéines avant de dormir ?", answer: "Oui, des études montrent qu'un apport de 20-40 g de protéines avant le coucher améliore la récupération musculaire nocturne en fournissant des acides aminés pendant la nuit, quand la synthèse protéique est active. Des protéines à digestion modérée (yaourt végétal, graines de chanvre) sont préférables aux protéines rapides avant le coucher." },
        { question: "Les graines de chanvre sont-elles vraiment riches en protéines ?", answer: "Oui. Les graines de chanvre décortiquées contiennent environ 30 g de protéines pour 100 g avec un profil en acides aminés complet — le seul végétal à contenir à la fois l'acide linoléique (oméga-6) et l'ALA (oméga-3) dans un ratio idéal. 2 c. à s. (30 g) apportent environ 9 g de protéines facilement disponibles." },
        { question: "Ce smoothie peut-il remplacer une collation post-sport immédiate ?", answer: "Pas idéalement pour l'immédiat post-sport (les protéines à digestion rapide comme la protéine de pois sont plus efficaces dans les 30 minutes). Ce smoothie est optimisé pour le soir avant le coucher — une heure ou plus après la séance. Pour l'immédiat post-sport, préférer un smoothie avec de la protéine de pois ou du tofu." }
      ],
      related_article_ids: [1, 14, 19],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 51,
    data: {
      meta_title: "Salade tiède lentilles et feta végétarienne | Mamie Végé",
      meta_description: "Salade tiède lentilles vertes et feta végétarienne : 29 g de protéines, prête en 25 min. Déjeuner végé riche en fer et calcium, transportable pour le bureau.",
      intro: "La salade tiède de lentilles à la feta combine les protéines des lentilles (9 g/100 g cuit, 3,3 mg de fer, Ciqual ANSES) et le calcium de la feta pour un déjeuner nutritionnellement complet. Servir les lentilles tièdes n'est pas anodin : elles absorbent mieux la vinaigrette et révèlent des arômes plus intenses que froides. La carotte et l'oignon rouge apportent de la douceur et de la vitamine C — qui optimise l'absorption du fer des lentilles par 3 à 4. Le vinaigre balsamique développe une saveur acidulée qui équilibre la richesse de la feta. Cette salade se transporte dans n'importe quel contenant et reste excellente servie froide au bureau.",
      image_alt: "Salade tiède de lentilles vertes avec feta émiettée, carottes et oignon rouge avec vinaigrette balsamique — déjeuner végétarien protéiné",
      sport_timing: "Idéale en déjeuner 2 à 3 heures avant une séance de l'après-midi. Ou en récupération post-entraînement : les lentilles + feta couvrent protéines et fer.",
      conservation: "Se conserve 3 jours au réfrigérateur. La vinaigrette à part pour éviter que la salade ne devienne molle. Réchauffer les lentilles rapidement au micro-ondes avant assemblage.",
      variants: [
        { title: "Version végane (tofu fumé à la place de la feta)", description: "Remplacer la feta par 100 g de tofu fumé en dés. Même apport protéique, zéro lactose." },
        { title: "Version quinoa (+ acides aminés complets)", description: "Remplacer la moitié des lentilles par du quinoa cuit. Le quinoa complète le profil en acides aminés des lentilles pour un profil plus complet." },
        { title: "Version grenade et noix (festive)", description: "Ajouter des grains de grenade et quelques noix concassées. Antioxydants augmentés, texture croquante." }
      ],
      nutrition_per_serving: { calories: 509, proteins_g: 29, carbs_g: 62, fat_g: 15, fiber_g: 12, iron_mg: 6 },
      schema_recipe: { recipeCategory: "Déjeuner", recipeCuisine: "Végétarienne", keywords: "salade tiède lentilles feta végétarienne, salade lentilles chaude sportif, déjeuner végé lentilles feta" },
      faq_recette: [
        { question: "Pourquoi servir les lentilles tièdes plutôt que froides ?", answer: "Les lentilles tièdes absorbent mieux la vinaigrette et révèlent des arômes plus intenses. La chaleur modérée facilite aussi légèrement la digestion des fibres. Si le repas est pris au bureau sans moyen de réchauffer, la version froide reste excellente." },
        { question: "La feta peut-elle être remplacée par un fromage végane ?", answer: "Oui. Le fromage végane à base de noix de cajou ou de soja émietté remplace bien la feta. Pour une version sans fromage, ajouter des graines de courge (protéines + zinc + magnésium) et un filet de tahini dans la vinaigrette pour la richesse et les protéines." },
        { question: "Les lentilles vertes et la feta couvrent-elles tous les acides aminés essentiels ?", answer: "Ensemble, oui. Les lentilles sont riches en lysine. La feta (produit laitier) apporte tous les acides aminés essentiels avec un bon profil en leucine, idéal pour la synthèse protéique musculaire." }
      ],
      related_article_ids: [1, 15, 20],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 52,
    data: {
      meta_title: "Omelette pois chiches et légumes végétalienne | Mamie Végé",
      meta_description: "Omelette végétalienne aux pois chiches et légumes : 30 g de protéines par portion sans œuf. La socca végétalienne express pour le petit-déjeuner sportif.",
      intro: "L'omelette à la farine de pois chiches (socca ou chickpea omelette) est la révolution végétalienne du petit-déjeuner protéiné : zéro œuf, 30 g de protéines par portion, et une texture étonnamment proche de l'omelette classique. La farine de pois chiches contient environ 20 g de protéines pour 100 g — le double de la farine de blé — avec un profil en acides aminés riche en lysine (Ciqual ANSES). Elle lie et forme une galette à la cuisson grâce à ses protéines végétales qui coagulent à la chaleur. Le curcuma donne une couleur dorée naturelle. Les légumes (oignon, poivron, épinards) apportent vitamines, minéraux et antioxydants. Un petit-déjeuner qui réconcilie les végétaliens avec les œufs.",
      image_alt: "Omelette végétalienne dorée à la farine de pois chiches avec épinards et poivron dans une poêle — petit-déjeuner végétalien protéiné",
      sport_timing: "Petit-déjeuner 2 à 3 heures avant une séance de musculation ou de sport intense. Riche en protéines pour préserver la masse musculaire pendant l'effort.",
      conservation: "Se conserve 2 jours au réfrigérateur. Réchauffer 2 minutes à la poêle. Peut aussi être mangé froid en sandwich dans du pain complet.",
      variants: [
        { title: "Version épinards-champignons", description: "Remplacer le poivron par 100 g d'épinards frais + 80 g de champignons sautés. Plus légère, riche en magnésium et fer." },
        { title: "Version épicée (curcuma + piment)", description: "Ajouter ½ c. à c. de curcuma + ¼ c. à c. de piment dans la pâte. Couleur dorée intense, propriétés anti-inflammatoires du curcuma." },
        { title: "Version fromage végane fondu", description: "Parsemer 30 g de fromage végane râpé sur l'omelette, couvrir 1 minute pour faire fondre. Version plus gourmande." }
      ],
      nutrition_per_serving: { calories: 534, proteins_g: 30, carbs_g: 20, fat_g: 37, fiber_g: 6, iron_mg: 4 },
      schema_recipe: { recipeCategory: "Petit-déjeuner sportif", recipeCuisine: "Végétalienne", keywords: "omelette végane pois chiches légumes, socca végétalienne sportif, omelette farine pois chiches sans œuf" },
      faq_recette: [
        { question: "L'omelette à la farine de pois chiches a-t-elle vraiment le goût d'une omelette classique ?", answer: "La texture est très proche — souple, légèrement moelleuse. Le goût est légèrement différent : moins neutre que l'œuf, avec une note légumineuse discrète. Avec du curcuma, du cumin et des légumes sautés, la différence est à peine perceptible. C'est souvent la recette qui convainc les sceptiques du petit-déjeuner végane protéiné." },
        { question: "Peut-on préparer la pâte à l'avance ?", answer: "Oui. La pâte de farine de pois chiches + eau + épices se prépare jusqu'à 24 heures à l'avance au réfrigérateur. Elle épaissit légèrement — ajouter un peu d'eau et mélanger avant cuisson. Gain de temps important le matin." },
        { question: "Pourquoi la farine de pois chiches est-elle si riche en protéines ?", answer: "La farine de pois chiches est simplement des pois chiches séchés et moulus. Les pois chiches contiennent environ 20 g de protéines pour 100 g de farine — contre 10-12 g pour la farine de blé complète. Disponible dans la plupart des supermarchés, des épiceries orientales et des magasins bio." }
      ],
      related_article_ids: [1, 14, 7],
      updated_date: '2026-04-02'
    }
  },
  {
    id: 53,
    data: {
      meta_title: "Salade riz et pois chiches végétarienne | Mamie Végé",
      meta_description: "Salade riz et pois chiches végétarienne : 10 g de protéines, fraîche et transportable. Déjeuner végé express et économique, parfait pour le bureau ou le club.",
      intro: "La salade de riz et pois chiches est le déjeuner végétarien le plus simple, le plus économique et le plus transportable. Elle ne nécessite qu'un peu de riz cuit d'avance et des pois chiches en boîte. La combinaison riz + pois chiches est nutritionnellement complémentaire : le riz apporte la méthionine, les pois chiches apportent la lysine — ensemble, ils couvrent tous les acides aminés essentiels. Les légumes crus (carotte, concombre) ajoutent de la vitamines et de la vitamine C qui optimise l'absorption du fer des pois chiches (2,9 mg/100 g cuit, Ciqual ANSES). La ciboulette apporte des notes fraîches sans calories. Un déjeuner complet pour moins de 1,50 € la portion.",
      image_alt: "Salade riz et pois chiches avec carottes, concombre et ciboulette dans un bol — déjeuner végétarien frais transportable économique",
      sport_timing: "Déjeuner léger 2 à 3 heures avant une séance modérée. Ou en repas de midi au bureau. Pour une récupération post-entraînement, augmenter les pois chiches et ajouter du tofu grillé.",
      conservation: "Se conserve 3 jours au réfrigérateur (vinaigrette à part). Le riz cuit en batch cooking dure 4-5 jours au frigo. Préparer en grande quantité le dimanche.",
      variants: [
        { title: "Version protéinée (+ tofu ou feta)", description: "Ajouter 100 g de tofu fumé en dés ou 80 g de feta émiettée. L'apport protéique passe à environ 20-22 g par portion." },
        { title: "Version herbes fraîches (taboulé végé)", description: "Ajouter une grande quantité de persil plat haché + menthe + jus de citron. Version proche d'un taboulé, très rafraîchissante en été." },
        { title: "Version épicée (vinaigrette cumin-citron)", description: "Vinaigrette : 2 c. à s. d'huile d'olive + 1 citron + 1 c. à c. de cumin + paprika + ail râpé. Saveur plus intense et méditerranéenne." }
      ],
      nutrition_per_serving: { calories: 301, proteins_g: 10, carbs_g: 43, fat_g: 10, fiber_g: 7, iron_mg: 3 },
      schema_recipe: { recipeCategory: "Déjeuner", recipeCuisine: "Végétarienne", keywords: "salade riz pois chiches végétarienne, salade végé transportable bureau, déjeuner riz pois chiches économique" },
      faq_recette: [
        { question: "Quel type de riz utiliser pour cette salade ?", answer: "Le riz basmati ou le riz long grain restent les plus fermes une fois refroidis — idéaux pour une salade. Le riz complet donne plus de fibres et de magnésium mais une texture plus rustique. Éviter le riz rond à risotto (trop collant froid)." },
        { question: "Comment rendre cette salade plus nutritive rapidement ?", answer: "Trois ajouts rapides : un filet de jus de citron (vitamine C → absorption du fer des pois chiches × 3-4), une poignée de graines de courge (magnésium, zinc, protéines), et un filet d'huile d'olive vierge extra (oméga-9, vitamine E). Ces trois ajouts prennent 30 secondes." },
        { question: "Les restes de riz peuvent-ils être utilisés directement ?", answer: "Oui, c'est même l'usage principal de cette recette. Tout reste de riz cuit du repas précédent peut être recyclé en salade en 5 minutes. Conserver le riz cuit au réfrigérateur dans un contenant hermétique jusqu'à 4 jours. Ne réchauffer du riz que si nécessaire." }
      ],
      related_article_ids: [1, 2, 25],
      updated_date: '2026-04-02'
    }
  }
];

async function run() {
  console.log('🚀 Enrichissement batch 3a — 13 recettes (IDs 35-44, 51-53)\n');

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
