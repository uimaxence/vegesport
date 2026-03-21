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

const RECIPE_STEP_NAME_MAX = 80;

function recipeStepHowToName(stepText, index) {
  const raw = (stepText || '').replace(/\s+/g, ' ').trim();
  if (!raw) return `Étape ${index + 1}`;
  if (raw.length <= RECIPE_STEP_NAME_MAX) return raw;
  return `${raw.slice(0, RECIPE_STEP_NAME_MAX - 1)}…`;
}

/**
 * @param {object} recipe
 * @param {string} url — URL canonique de la fiche recette
 * @param {{ aggregateRating?: { ratingValue: number, ratingCount: number, bestRating?: number, worstRating?: number }, videoUrl?: string }} [extras]
 */
export function buildRecipeJsonLd(recipe, url, extras = {}) {
  if (!recipe) return null;
  const totalMin = recipe.time || 0;
  const description = recipe.steps?.[0]
    ? recipe.steps[0].slice(0, 200)
    : `Recette végétarienne ${recipe.title} — ${recipe.calories} kcal, ${recipe.protein}g de protéines.`;
  const heroImage = recipe.image || null;
  const videoUrl = extras.videoUrl ?? recipe.video_url ?? recipe.videoUrl;

  const recipeInstructions = (recipe.steps || []).map((step, i) => {
    const stepObj = {
      '@type': 'HowToStep',
      position: i + 1,
      name: recipeStepHowToName(step, i),
      url: `${url}#etape-${i + 1}`,
      text: step,
    };
    if (heroImage) stepObj.image = heroImage;
    return stepObj;
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    image: heroImage ? [heroImage] : [],
    author: { '@type': 'Person', name: SITE_AUTHOR },
    datePublished: recipe.created_at?.slice?.(0, 10) || new Date().toISOString().slice(0, 10),
    description,
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
    recipeInstructions,
    url,
  };

  const agg = extras.aggregateRating;
  if (agg && agg.ratingCount >= 1 && agg.ratingValue != null) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: agg.ratingValue,
      ratingCount: agg.ratingCount,
      bestRating: agg.bestRating ?? 5,
      worstRating: agg.worstRating ?? 1,
    };
  }

  if (videoUrl) {
    jsonLd.video = {
      '@type': 'VideoObject',
      name: recipe.title,
      description,
      contentUrl: videoUrl,
      ...(heroImage ? { thumbnailUrl: heroImage } : {}),
    };
  }

  return jsonLd;
}

export function buildArticleJsonLd(article, url) {
  if (!article) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt || '',
    image: article.image ? [article.image] : [],
    author: {
      '@type': 'Person',
      name: article.author || SITE_AUTHOR,
      ...(article.authorInfo?.titre && { jobTitle: article.authorInfo.titre }),
    },
    datePublished: article.date || new Date().toISOString().slice(0, 10),
    dateModified: article.updatedAt?.slice?.(0, 10) || article.date || new Date().toISOString().slice(0, 10),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  };
}

export function buildFAQPageJsonLd(faqJson, articleTitle, url) {
  if (!Array.isArray(faqJson) || faqJson.length === 0) return null;
  const mainEntity = faqJson
    .filter((q) => q.question && q.answer)
    .map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    }));
  if (mainEntity.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: articleTitle,
    mainEntity,
    url,
  };
}

export function buildHowToJsonLd(article, url) {
  if (article.schemaType !== 'HowTo' || !Array.isArray(article.contentJson)) return null;
  const steps = article.contentJson
    .reduce((acc, b) => {
      if (b.type === 'heading' && b.level === 3 && b.text) {
        acc.push({ name: b.text, text: '' });
      } else if (b.type === 'paragraph' && b.text && acc.length > 0) {
        acc[acc.length - 1].text = (acc[acc.length - 1].text + ' ' + b.text).trim();
      }
      return acc;
    }, [])
    .filter((s) => s.name)
    .map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    }));
  if (steps.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt || '',
    step: steps,
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
