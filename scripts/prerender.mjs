/**
 * Post-build prerendering — génère un fichier HTML par route publique
 * avec les bons <title>, meta, Open Graph, Twitter Cards, JSON-LD
 * et un contenu body minimal pour le SEO.
 *
 * Exécuté après `vite build` :
 *   node scripts/prerender.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { MERGED_RECIPE_IDS } from '../src/data/mergedRecipes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'dist');

const SITE_URL = 'https://www.mamie-vege.fr';
const SITE_NAME = 'et si mamie était végé ?';
const SHORT_BRAND = 'Mamie Végé';
const AUTHOR = 'Maxence';

/** Retire un suffixe de marque déjà présent dans un meta_title (« … | Mamie Végé »). */
function stripBrand(title) {
  return String(title || '')
    .replace(/\s*[|–—-]\s*(mamie\s+v[ée]g[ée]|et si mamie [ée]tait v[ée]g[ée]\s*\??)\s*$/i, '')
    .trim();
}

/* ── Env ─────────────────────────────────────────────── */
function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    const p = join(root, name);
    if (!existsSync(p)) continue;
    readFileSync(p, 'utf8').split('\n').forEach((line) => {
      const i = line.indexOf('=');
      if (i <= 0) return;
      const key = line.slice(0, i).trim();
      const val = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key]) process.env[key] = val;
    });
  }
}
loadEnv();

/* ── Helpers ─────────────────────────────────────────── */
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getSlug(title) {
  if (!title || typeof title !== 'string') return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Slug figé en base si présent, sinon dérivé du titre. */
function slugOf(item) {
  return item?.slug || getSlug(item?.title);
}

const CAT = {
  'petit-dejeuner': 'Petit-déjeuner',
  dejeuner: 'Déjeuner',
  diner: 'Dîner',
  snack: 'Collation',
  dessert: 'Dessert',
};

/* ── Template ────────────────────────────────────────── */
const tpl = readFileSync(join(distDir, 'index.html'), 'utf8');

function replaceMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta ${attr}="${key}"\\s+content=")[^"]*(")`);
  if (re.test(html)) return html.replace(re, `$1${esc(value)}$2`);
  // Also try content before attr (Vite may reorder)
  const re2 = new RegExp(`(<meta content=")[^"]*("\\s+${attr}="${key}")`);
  if (re2.test(html)) return html.replace(re2, `$1${esc(value)}$2`);
  // Tag absent → inject before </head>
  return html.replace('</head>', `    <meta ${attr}="${key}" content="${esc(value)}" />\n  </head>`);
}

function render({ title, description, canonical, ogType = 'website', image, keywords, jsonLd, bodyHtml, robots = 'index, follow' }) {
  let h = tpl;
  // Une seule mention de marque, courte, pour rester sous ~60 caractères.
  const fullTitle = title.includes(SITE_NAME) ? title : `${stripBrand(title)} | ${SHORT_BRAND}`;

  // <title>
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(fullTitle)}</title>`);

  // canonical
  if (canonical) {
    h = h.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${canonical}"`);
  } else {
    h = h.replace(/\s*<link rel="canonical" href="[^"]*"\s*\/?>/, '');
  }

  // meta
  h = replaceMeta(h, 'name', 'description', description);
  if (keywords) h = replaceMeta(h, 'name', 'keywords', keywords);
  h = replaceMeta(h, 'name', 'robots', robots);

  // Open Graph
  h = replaceMeta(h, 'property', 'og:type', ogType);
  h = replaceMeta(h, 'property', 'og:title', fullTitle);
  h = replaceMeta(h, 'property', 'og:description', description);
  if (canonical) h = replaceMeta(h, 'property', 'og:url', canonical);
  if (image) h = replaceMeta(h, 'property', 'og:image', image);

  // Twitter Cards
  h = replaceMeta(h, 'name', 'twitter:card', image ? 'summary_large_image' : 'summary');
  h = replaceMeta(h, 'name', 'twitter:title', fullTitle);
  h = replaceMeta(h, 'name', 'twitter:description', description);
  if (image) h = replaceMeta(h, 'name', 'twitter:image', image);

  // JSON-LD
  const items = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean) : [];
  if (items.length) {
    const scripts = items
      .map((ld) => `<script type="application/ld+json">${JSON.stringify(ld)}</script>`)
      .join('\n    ');
    h = h.replace('</head>', `    ${scripts}\n  </head>`);
  }

  // Body content (React remplacera au mount)
  if (bodyHtml) {
    h = h.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
  }

  return h;
}

function writeFile(name, html) {
  writeFileSync(join(distDir, name), html, 'utf8');
}

function writePage(routePath, html) {
  if (routePath === '/') {
    writeFileSync(join(distDir, 'index.html'), html, 'utf8');
    return;
  }
  const dir = join(distDir, routePath.replace(/^\//, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
}

/* ── JSON-LD builders ────────────────────────────────── */
function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Recettes végétariennes riches en protéines pour sportifs. Planning repas hebdomadaire et conseils nutrition.',
    inLanguage: 'fr-FR',
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
}

function recipeJsonLd(r, url) {
  const t = r.time || 0;
  const schema = r.schema_recipe || {};
  const nps = r.nutrition_per_serving || {};
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: r.title,
    image: r.image ? [r.image] : [],
    author: { '@type': 'Person', name: AUTHOR },
    datePublished: r.created_at?.slice?.(0, 10) || new Date().toISOString().slice(0, 10),
    description: r.meta_description || `Recette végétarienne : ${r.title}. ${r.calories} kcal, ${r.protein}g de protéines.`,
    prepTime: `PT${Math.max(5, Math.round(t * 0.4))}M`,
    cookTime: `PT${Math.max(5, t - Math.round(t * 0.4))}M`,
    totalTime: `PT${t}M`,
    recipeYield: `${r.servings || 1} portion${(r.servings || 1) > 1 ? 's' : ''}`,
    recipeCategory: schema.recipeCategory || CAT[r.category] || r.category,
    recipeCuisine: schema.recipeCuisine || 'Végétarienne',
    keywords: schema.keywords || [
      'végétarien',
      'protéines végétales',
      ...(r.tags || []).map((tag) => tag.replace('#', '')),
      ...(r.regime || []),
      ...(r.season || []),
    ].join(', '),
    nutrition: {
      '@type': 'NutritionInformation',
      calories: `${nps.calories || r.calories} kcal`,
      proteinContent: `${nps.proteins_g || r.protein}g`,
      carbohydrateContent: `${nps.carbs_g || r.carbs}g`,
      fatContent: `${nps.fat_g || r.fat}g`,
      ...(nps.fiber_g ? { fiberContent: `${nps.fiber_g}g` } : {}),
    },
    recipeIngredient: r.ingredients || [],
    recipeInstructions: (r.steps || []).map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: step,
    })),
    url,
  };
}

function faqJsonLd(faqItems) {
  if (!faqItems || faqItems.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

function breadcrumbJsonLd(items) {
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

function articleJsonLd(a, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: a.meta_title || a.title,
    description: a.meta_description || a.excerpt || '',
    image: a.image ? [a.image] : [],
    author: { '@type': 'Person', name: a.author || AUTHOR },
    datePublished: a.date || new Date().toISOString().slice(0, 10),
    dateModified: a.updated_at?.slice?.(0, 10) || a.date || new Date().toISOString().slice(0, 10),
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  };
}

/* ── Data sources ────────────────────────────────────── */
const supaUrl = String(process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = String(process.env.VITE_SUPABASE_ANON_KEY || '');

async function fetchFromSupabase(table, select) {
  if (!supaUrl || !anonKey) return null;
  const res = await fetch(
    `${supaUrl}/rest/v1/${table}?select=${select}&order=id.asc`,
    { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// Recettes : Supabase en priorité, fallback fichier local
let recipes = [];
try {
  const data = await fetchFromSupabase('recipes', 'id,title,category,time,calories,protein,carbs,fat,servings,tags,regime,season,objective,image,ingredients,steps,created_at,slug,meta_title,meta_description,intro,image_alt,sport_timing,conservation,variants,nutrition_per_serving,schema_recipe,faq_recette');
  if (data && data.length > 0) {
    recipes = data.filter((r) => !(r.id in MERGED_RECIPE_IDS));
    console.log(`  Recettes depuis Supabase : ${recipes.length}`);
  } else {
    throw new Error('Aucune recette en base');
  }
} catch (e) {
  console.warn(`  ⚠ Supabase recettes indisponible (${e?.message}), fallback local…`);
  try {
    recipes = (await import('../src/data/recipes.js')).recipes || [];
    console.log(`  Recettes depuis fichier local : ${recipes.length}`);
  } catch { /* pas de données */ }
}

// Articles : Supabase uniquement
let articles = [];
try {
  const data = await fetchFromSupabase('blog_articles', 'id,title,slug,excerpt,meta_title,meta_description,image,date,updated_at,author,category,content_json,faq_json');
  articles = data || [];
  console.log(`  Articles depuis Supabase : ${articles.length}`);
} catch (e) {
  console.warn(`  ⚠ Articles non chargés : ${e?.message}`);
}

/* ── Maillage interne : helpers ──────────────────────── */
const recipeById = new Map(recipes.map((r) => [r.id, r]));
// Un article qui cite encore un doublon pointe vers la fiche conservée.
for (const [dup, keep] of Object.entries(MERGED_RECIPE_IDS)) {
  if (recipeById.has(keep)) recipeById.set(Number(dup), recipeById.get(keep));
}

/** Rend les blocs content_json en HTML avec liens internes */
function renderContentBlocks(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return '';
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'paragraph':
          return `<p>${esc(b.text)}</p>`;
        case 'heading':
          return `<h${b.level || 2}>${esc(b.text)}</h${b.level || 2}>`;
        case 'list':
          return `<ul>${(b.items || []).map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
        case 'recipes': {
          const links = (b.recipeIds || [])
            .map((id) => recipeById.get(id))
            .filter(Boolean)
            .map((r) => `<li><a href="/recettes/${slugOf(r)}">${esc(r.title)} — ${r.calories} kcal, ${r.protein}g protéines</a></li>`);
          return links.length ? `<ul>${links.join('')}</ul>` : '';
        }
        case 'faq':
          return (b.items || [])
            .map((q) => `<h3>${esc(q.question)}</h3><p>${esc(q.answer)}</p>`)
            .join('');
        case 'table': {
          const hd = (b.headers || []).map((h) => `<th>${esc(h)}</th>`).join('');
          const rows = (b.rows || [])
            .map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
            .join('');
          return `<table>${hd ? `<thead><tr>${hd}</tr></thead>` : ''}<tbody>${rows}</tbody></table>`;
        }
        case 'source':
          return b.url ? `<p><a href="${esc(b.url)}" rel="noopener">${esc(b.label || b.url)}</a></p>` : '';
        case 'sources_list':
          return `<ul>${(b.items || []).map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.label || s.url)}</a></li>`).join('')}</ul>`;
        case 'cta_planning':
          return `<p><a href="/planning">Créer mon planning repas végétarien</a></p>`;
        default:
          return '';
      }
    })
    .join('');
}

/** Recettes similaires (même catégorie ou mêmes objectifs, max N) */
function getSimilarRecipes(recipe, limit = 3) {
  const obj = recipe.objective || [];
  return recipes
    .filter((r) => r.id !== recipe.id)
    .map((r) => {
      let score = 0;
      if (r.category === recipe.category) score += 2;
      if (obj.length && r.objective?.some((o) => obj.includes(o))) score += 1;
      return { r, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.r);
}

/** Index inversé : recipeId → articles qui la mentionnent */
const articlesByRecipeId = new Map();
for (const a of articles) {
  const blocks = a.content_json || [];
  for (const b of blocks) {
    if (b.type === 'recipes') {
      for (const id of b.recipeIds || []) {
        if (!articlesByRecipeId.has(id)) articlesByRecipeId.set(id, []);
        articlesByRecipeId.get(id).push(a);
      }
    }
  }
}

/** FAQ d'un article : colonne faq_json, sinon blocs `faq` du contenu. */
function articleFaq(a) {
  if (Array.isArray(a.faq_json) && a.faq_json.length) {
    return a.faq_json.filter((q) => q?.question && q?.answer);
  }
  const out = [];
  for (const b of Array.isArray(a.content_json) ? a.content_json : []) {
    if (b?.type === 'faq') {
      for (const q of b.items || []) {
        if (q?.question && q?.answer) out.push({ question: q.question, answer: q.answer });
      }
    }
  }
  return out;
}

/** Articles liés : même catégorie d'abord, puis les plus récents (hors article courant). */
function getRelatedArticles(article, limit = 4) {
  const others = articles.filter((o) => o.id !== article.id && slugOf(o));
  const byDateDesc = (x, y) => String(y.date || '').localeCompare(String(x.date || ''));
  const same = others.filter((o) => o.category === article.category).sort(byDateDesc);
  const rest = others.filter((o) => o.category !== article.category).sort(byDateDesc);
  return [...same, ...rest].slice(0, limit);
}

/** Liens HTML pour une liste de recettes */
function recipeLinksHtml(list) {
  return list.map((r) => `<li><a href="/recettes/${slugOf(r)}">${esc(r.title)}</a></li>`).join('');
}

/** Liens HTML pour une liste d'articles */
function articleLinksHtml(list) {
  return list.map((a) => `<li><a href="/blog/${slugOf(a)}">${esc(a.title)}</a></li>`).join('');
}

/* ── Pages statiques ─────────────────────────────────── */
let count = 0;

// Liens pour les pages listing
const allRecipeLinks = recipes.filter((r) => slugOf(r)).map((r) => `<li><a href="/recettes/${slugOf(r)}">${esc(r.title)} — ${esc(CAT[r.category] || r.category)}, ${r.calories} kcal, ${r.protein}g protéines</a></li>`).join('');
const allArticleLinks = articles.filter((a) => slugOf(a)).map((a) => `<li><a href="/blog/${slugOf(a)}">${esc(a.title)}</a></li>`).join('');

const statics = [
  {
    path: '/',
    title: `${SITE_NAME} — Recettes végétariennes protéinées`,
    description:
      'Recettes végétariennes et végétaliennes riches en protéines pour sportifs. Planning repas hebdomadaire personnalisé, liste de courses automatique et conseils nutrition sportive végétale.',
    keywords:
      'recettes végétariennes, protéines végétales, meal prep végétarien, nutrition végétale sportive, planning repas végétarien',
    jsonLd: webSiteJsonLd(),
    bodyHtml: `<h1>et si mamie était végé ?</h1><p>Recettes végétariennes riches en protéines pour sportifs. Planning repas, liste de courses et conseils nutrition.</p><nav><h2>Nos recettes végétariennes</h2><ul>${allRecipeLinks}</ul></nav><nav><h2>Nos articles</h2><ul>${allArticleLinks}</ul></nav><p><a href="/planning">Créer mon planning repas</a></p>`,
  },
  {
    path: '/recettes',
    title: `Recettes végétariennes protéinées : ${recipes.length} idées pour sportifs`,
    description:
      `${recipes.length} recettes végétariennes riches en protéines, avec les macros par portion : petit-déjeuner, déjeuner, dîner, collation. Rapides, pas chères, pensées pour le sport.`,
    keywords: 'recettes végétariennes, protéines végétales, recettes sportifs, filtrer recettes',
    bodyHtml: `<h1>Recettes végétariennes protéinées</h1><p>Toutes nos recettes végétariennes riches en protéines pour sportifs, avec les macros par portion.</p><ul>${allRecipeLinks}</ul>`,
  },
  {
    path: '/ravitaillement',
    title: 'Ravitaillement vélo fait maison : barres, boissons et gels végétaux',
    description:
      'Recettes de ravitaillement maison pour le vélo et les sports d’endurance : barres énergétiques, boisson isotonique, collations et récupération — 100 % végétal, avec les macros par portion.',
    keywords:
      'ravitaillement vélo, barre énergétique maison, boisson isotonique maison, gel énergétique maison, nutrition cyclisme, recette ravito',
    bodyHtml: `<h1>Le ravito végétal fait maison</h1>
<p>Avant, pendant et après la sortie : des recettes pensées pour l'endurance — vélo, trail, running — avec les macros par portion. Moins chères et meilleures que les gels industriels.</p>
<h2>Avant la sortie — charger les batteries</h2>
<p>1 à 4 g de glucides par kilo, 1 à 4 heures avant le départ : un repas digeste, riche en glucides complexes.</p>
<h2>Pendant l'effort — le ravito de la musette</h2>
<p>30 à 90 g de glucides par heure selon l'intensité : barres, bouchées et boissons maison, avec des ingrédients qu'on reconnaît.</p>
<h2>Après la sortie — récupérer et reconstruire</h2>
<p>20 à 30 g de protéines et des glucides dans les 2 heures : reconstituer le glycogène et reconstruire le muscle, 100 % végétal.</p>
<nav><h2>Nos recettes</h2><ul>${allRecipeLinks}</ul></nav>`,
  },
  {
    path: '/planning',
    title: 'Menu végétarien de la semaine : générateur gratuit',
    description:
      'Choisis ton objectif et obtiens en un clic un menu végétarien protéiné pour 7 jours, avec macros et liste de courses par rayon. Gratuit, sans inscription.',
    keywords: 'planning repas végétarien, meal prep, liste de courses, macros végétarien',
    bodyHtml: `<h1>Ton menu végétarien de la semaine, en un clic</h1><p>Choisis ton objectif (prise de masse, sèche, endurance, santé) : on génère 7 jours de repas végétariens protéinés, avec les macros et la liste de courses par rayon. Gratuit, sans inscription.</p><nav><h2>Découvrir nos recettes</h2><ul>${allRecipeLinks}</ul></nav>`,
  },
  {
    path: '/blog',
    title: 'Blog nutrition végétale et sport',
    description:
      'Nutrition végétarienne pour sportifs : protéines, glucides, fer, meal prep et recettes. Articles sourcés ANSES et INSEP pour courir, se muscler et récupérer sans viande.',
    keywords: 'blog nutrition végétale, sportif végétarien, meal prep, protéines végétales, ANSES, nutrition sportive',
    bodyHtml: `<h1>Blog nutrition végétale et performance sportive</h1>
<p>Manger végétarien et faire du sport : deux choix qui se complètent mieux qu'on ne le croit. Ce blog est né d'une question simple — est-ce qu'on peut courir, se muscler et récupérer efficacement sans viande ? La réponse que j'ai trouvée, et que chaque article ici documente : oui, mais ça demande de savoir quoi manger, combien, et quand.</p>
<p>Je suis Maxence. Je ne suis pas diététicien ni coach. Je suis un sportif amateur en transition végétarienne, qui a cherché des réponses concrètes et s'est retrouvé face à des contenus soit trop généraux, soit déconnectés du sport réel. Ce blog, c'est ce que j'aurais voulu trouver quand j'ai commencé.</p>
<p>Chaque article s'appuie sur les recommandations de l'ANSES, de l'INSEP et de Santé Publique France. Pas de discours bien-être. Pas de superlatifs non sourcés. Des chiffres, des recettes, des repères pratiques.</p>
<h2>Protéines végétales et musculation</h2>
<p>La question qui revient le plus souvent : « Est-ce qu'on peut vraiment prendre de la masse sans viande ? ». Les données disponibles répondent clairement oui, à condition de couvrir 1,6 à 2 g de protéines par kilo de poids corporel par jour avec des sources variées. Les articles de cette catégorie couvrent les meilleures sources végétales par sport (lentilles, tofu, tempeh, quinoa, graines de chanvre), le timing des apports autour des séances, la place de la créatine végane et les recettes les plus denses en protéines du blog.</p>
<p>Les repères chiffrés que tu trouveras ici sont tirés de la table Ciqual de l'ANSES — pas de valeurs approximatives ou marketing. Si une lentille cuite apporte 9 g de protéines pour 100 g selon Ciqual, c'est ce qui est écrit.</p>
<h2>Glucides, énergie et endurance</h2>
<p>Pour les coureurs, cyclistes et traileurs végétariens, les glucides végétaux sont souvent un avantage plutôt qu'un inconvénient. Les céréales complètes, les légumineuses et les fruits offrent une énergie progressive, stable, sans les pics glycémiques des glucides raffinés.</p>
<p>Les articles de cette catégorie couvrent les besoins glucidiques par volume d'entraînement (de 3 à 10 g/kg/j selon l'INSEP), le timing autour des sorties longues, les recettes de récupération post-effort et les alternatives végétales aux gels industriels.</p>
<h2>Compléments alimentaires végétariens</h2>
<p>Vitamine B12, fer, oméga-3 DHA, vitamine D, créatine, zinc : ce sont les six micronutriments et compléments qui méritent une attention particulière dans un profil sportif végétarien. Aucun n'est recommandé ici sans bilan sanguin préalable — c'est la règle que j'applique, et elle est cohérente avec les recommandations de l'ANSES et d'Ameli.</p>
<p>La vitamine B12 est le seul complément obligatoire pour les végétaliens — absente de toutes les sources végétales fiables. Le fer est à surveiller par bilan ferritine, surtout pour les coureurs (hémolyse mécanique). Les articles expliquent comment optimiser l'absorption du fer végétal (association avec la vitamine C), quelles formes de compléments sont mieux tolérées, et pourquoi la créatine monohydrate est particulièrement pertinente pour les végétariens pratiquant la musculation.</p>
<h2>Meal prep et organisation</h2>
<p>Tenir une alimentation végétarienne sportive sur la durée, ça se prépare. Le batch cooking du dimanche, les listes de courses à 30–40 euros, les menus sur 5 ou 7 jours avec les macros calculés : cette catégorie est la plus pratique du blog.</p>
<p>L'idée centrale : avec 1h30 de préparation le dimanche (lentilles cuites, riz complet, houmous, curry ou chili en grande quantité), les repas de la semaine s'assemblent en 5 à 15 minutes chaque soir. C'est cette organisation qui permet de tenir sans se retrouver à commander une pizza après la séance.</p>
<h2>Recettes végétariennes pour sportifs</h2>
<p>Plus de 60 recettes testées, avec les macros par portion, le coût estimé et le timing sportif recommandé. Chaque recette indique si elle est adaptée avant ou après l'entraînement, combien de protéines elle apporte, et si elle est compatible avec un budget étudiant.</p>
<p>Les recettes phares du blog : le bowl lentilles-quinoa-tofu mariné (38 g de protéines), le curry de lentilles corail express (22 g, moins de 25 minutes), les barres énergétiques maison aux dattes et à l'avoine (alternative végétale aux gels industriels), et le smoothie vert protéiné post-effort.</p>
<h2>Catégorie Étudiant / Petit budget</h2>
<p>Manger végétarien et sportif n'implique pas de budget élevé. Les légumineuses sèches, les flocons d'avoine, le riz complet et les épinards surgelés sont parmi les sources de protéines et de micronutriments les moins chères du marché. Les articles de cette catégorie montrent comment construire un menu sportif complet pour 30 à 40 euros par semaine, avec des listes de courses détaillées et des prix indicatifs.</p>
<h2>Nos articles</h2>
<ul>${allArticleLinks}</ul>`,
  },
  {
    path: '/mentions-legales',
    title: 'Mentions légales',
    description: "Conditions d'utilisation et mentions légales du site et si mamie était végé.",
    bodyHtml: `<h1>Mentions légales</h1>`,
  },
];

for (const p of statics) {
  writePage(
    p.path,
    render({ ...p, canonical: `${SITE_URL}${p.path === '/' ? '/' : p.path}` }),
  );
  count++;
}

/* ── Pages recettes ──────────────────────────────────── */
for (const r of recipes) {
  const slug = slugOf(r);
  if (!slug) continue;
  const path = `/recettes/${slug}`;
  const url = `${SITE_URL}${path}`;
  const cat = CAT[r.category] || r.category;

  const ingHtml = (r.ingredients || []).map((i) => `<li>${esc(i)}</li>`).join('');
  const stepsHtml = (r.steps || []).map((s) => `<li>${esc(s)}</li>`).join('');

  // Maillage interne : recettes similaires + articles liés
  const similar = getSimilarRecipes(r, 3);
  const relatedArticles = articlesByRecipeId.get(r.id) || [];
  // Aussi ajouter des articles de la même catégorie si pas assez
  const otherArticles = relatedArticles.length < 3
    ? articles.filter((a) => !relatedArticles.includes(a)).slice(0, 3 - relatedArticles.length)
    : [];
  const allRelArticles = [...relatedArticles, ...otherArticles];

  let relHtml = '';
  if (similar.length) relHtml += `<nav><h2>Recettes végétariennes similaires</h2><ul>${recipeLinksHtml(similar)}</ul></nav>`;
  if (allRelArticles.length) relHtml += `<nav><h2>Articles liés</h2><ul>${articleLinksHtml(allRelArticles)}</ul></nav>`;
  relHtml += `<p><a href="/recettes">Toutes nos recettes végétariennes</a></p>`;

  // Contenu enrichi SEO
  const introHtml = r.intro ? `<p>${esc(r.intro)}</p>` : '';
  const conservHtml = r.conservation ? `<h2>Conservation</h2><p>${esc(r.conservation)}</p>` : '';
  const sportHtml = r.sport_timing ? `<h2>Quand consommer</h2><p>${esc(r.sport_timing)}</p>` : '';
  const variantsHtml = (r.variants || []).length > 0
    ? `<h2>Variantes</h2><ul>${r.variants.map((v) => `<li><strong>${esc(v.title)}</strong> — ${esc(v.description)}</li>`).join('')}</ul>`
    : '';
  const faqHtml = (r.faq_recette || []).length > 0
    ? `<section><h2>Questions fréquentes</h2>${r.faq_recette.map((f) => `<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`).join('')}</section>`
    : '';

  writePage(
    path,
    render({
      title: r.meta_title || r.title,
      description: r.meta_description || `Recette végétarienne : ${r.title}. ${r.calories} kcal, ${r.protein}g de protéines. Prête en ${r.time} min.`,
      canonical: url,
      image: r.image,
      keywords: `${r.title}, recette végétarienne, ${cat}, ${r.protein}g protéines, ${(r.tags || []).map((t) => t.replace('#', '')).join(', ')}`,
      jsonLd: [
        recipeJsonLd(r, url),
        breadcrumbJsonLd([
          { name: 'Accueil', url: SITE_URL },
          { name: 'Recettes', url: `${SITE_URL}/recettes` },
          { name: r.title, url },
        ]),
        faqJsonLd(r.faq_recette),
      ].filter(Boolean),
      bodyHtml: `<article><h1>${esc(r.title)}</h1><p>${esc(cat)} · ${r.time} min · ${r.calories} kcal · ${r.protein}g protéines</p>${introHtml}<h2>Ingrédients</h2><ul>${ingHtml}</ul><h2>Instructions</h2><ol>${stepsHtml}</ol>${conservHtml}${sportHtml}${variantsHtml}</article>${faqHtml}${relHtml}`,
    }),
  );
  count++;
}

/* ── Pages articles blog ─────────────────────────────── */
for (const a of articles) {
  const slug = slugOf(a);
  if (!slug) continue;
  const path = `/blog/${slug}`;
  const url = `${SITE_URL}${path}`;

  // Contenu complet des blocs
  const contentHtml = renderContentBlocks(a.content_json);

  // Maillage interne : autres articles
  const otherArt = getRelatedArticles(a, 4);
  let relArtHtml = '';
  if (otherArt.length) relArtHtml += `<nav><h2>Articles liés</h2><ul>${articleLinksHtml(otherArt)}</ul></nav>`;
  relArtHtml += `<p><a href="/blog">Tous nos articles</a></p>`;

  writePage(
    path,
    render({
      title: a.meta_title || a.title,
      description: a.meta_description || a.excerpt || '',
      canonical: url,
      ogType: 'article',
      image: a.image,
      jsonLd: [
        articleJsonLd(a, url),
        breadcrumbJsonLd([
          { name: 'Accueil', url: SITE_URL },
          { name: 'Blog', url: `${SITE_URL}/blog` },
          { name: a.title, url },
        ]),
        faqJsonLd(articleFaq(a)),
      ].filter(Boolean),
      bodyHtml: `<article><h1>${esc(a.title)}</h1>${a.excerpt ? `<p>${esc(a.excerpt)}</p>` : ''}${contentHtml}</article>${relArtHtml}`,
    }),
  );
  count++;
}

/* ── Coquille SPA + 404 ───────────────────────────────
 * app.html : servie par les rewrites de vercel.json pour les routes purement
 * applicatives (connexion, profil, admin…) et pour les fiches pas encore
 * pré-rendues. noindex par défaut : React repasse en « index, follow » sur
 * les pages publiques valides.
 * 404.html : servie par Vercel avec un vrai statut 404 pour toute URL inconnue
 * (avant : la page d'accueil en 200 → soft 404 indexés).
 */
const shell = {
  description: 'Recettes végétariennes riches en protéines pour sportifs.',
  canonical: null,
  robots: 'noindex, follow',
};
writeFile('app.html', render({ ...shell, title: SITE_NAME }));
writeFile('404.html', render({ ...shell, title: 'Page introuvable (404)' }));

console.log(`✓ ${count} pages pré-rendues dans dist/ (+ app.html, 404.html)`);
