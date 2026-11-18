/**
 * Recettes fusionnées : les doublons qui se cannibalisaient dans Google pointent
 * vers une seule fiche. Les lignes restent en base (rien n'est supprimé) mais ne
 * sont plus listées, pré-rendues ni présentes dans le sitemap ; leur ancienne URL
 * redirige (301 dans vercel.json, redirection client dans RecipeDetail).
 */
export const MERGED_RECIPE_IDS = {"3":69,"13":36,"17":71,"35":21,"39":23,"41":5,"42":71};

/** ancien slug → slug de la fiche conservée */
export const MERGED_RECIPE_SLUGS = {
  "curry-de-lentilles-corail": "curry-express-lentilles-corail-et-tomates-moins-de-2-la-portion",
  "chili-vegetarien": "chili-sin-carne-proteine-pour-coureurs-et-cyclistes",
  "barres-energetiques-maison": "barres-energetiques-maison-avoine-dattes-et-amandes",
  "bowl-lentilles-quinoa-tofu-proteine-pour-sportifs-vege": "bowl-lentilles-quinoa-tofu-marine",
  "galettes-haricots-blancs-proteinees-pour-sportifs-presses": "galettes-haricots-blancs-flocons-d-avoine",
  "wraps-houmous-tofu-pour-midi-sportif-rapide": "wrap-au-tofu-grille-houmous",
  "barres-energetiques-vege-pour-l-entrainement": "barres-energetiques-maison-avoine-dattes-et-amandes"
};
