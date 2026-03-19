const raw = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL;
export const SITE_URL = (raw || 'https://www.mamie-vege.fr').replace(/\/$/, '');
export const SITE_NAME = 'et si mamie était végé ?';
export const SITE_AUTHOR = 'Maxence';

export function canonicalUrl(path = '/') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

const categoryLabels = {
  'petit-dejeuner': 'Petit-déjeuner',
  'dejeuner': 'Déjeuner',
  'diner': 'Dîner',
  'snack': 'Collation',
  'dessert': 'Dessert',
};

export function categoryLabel(slug) {
  return categoryLabels[slug] || slug;
}

export function buildRecipeJsonLd(recipe, url) {
  if (!recipe) return null;
  const totalMin = recipe.time || 0;
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    image: recipe.image ? [recipe.image] : [],
    author: { '@type': 'Person', name: SITE_AUTHOR },
    datePublished: recipe.created_at?.slice?.(0, 10) || new Date().toISOString().slice(0, 10),
    description: recipe.steps?.[0]
      ? recipe.steps[0].slice(0, 200)
      : `Recette végétarienne ${recipe.title} — ${recipe.calories} kcal, ${recipe.protein}g de protéines.`,
    prepTime: `PT${Math.max(5, Math.round(totalMin * 0.4))}M`,
    cookTime: `PT${Math.max(5, totalMin - Math.round(totalMin * 0.4))}M`,
    totalTime: `PT${totalMin}M`,
    recipeYield: `${recipe.servings || 1} portion${(recipe.servings || 1) > 1 ? 's' : ''}`,
    recipeCategory: categoryLabel(recipe.category),
    recipeCuisine: 'Végétarienne',
    keywords: [
      'végétarien', 'protéines végétales',
      ...(recipe.tags || []).map(t => t.replace('#', '')),
      ...(recipe.regime || []),
      ...(recipe.season || []),
    ].join(', '),
    nutrition: {
      '@type': 'NutritionInformation',
      calories: `${recipe.calories} kcal`,
      proteinContent: `${recipe.protein}g`,
      carbohydrateContent: `${recipe.carbs}g`,
      fatContent: `${recipe.fat}g`,
    },
    recipeIngredient: recipe.ingredients || [],
    recipeInstructions: (recipe.steps || []).map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: step,
    })),
    url,
  };
}

export function buildArticleJsonLd(article, url) {
  if (!article) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt || '',
    image: article.image ? [article.image] : [],
    author: { '@type': 'Person', name: article.author || SITE_AUTHOR },
    datePublished: article.date || new Date().toISOString().slice(0, 10),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  };
}

export function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Recettes végétariennes et végétaliennes riches en protéines pour sportifs. Planning repas hebdomadaire, liste de courses et conseils nutrition sportive végétale.',
    inLanguage: 'fr-FR',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
