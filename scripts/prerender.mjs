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

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'dist');

const SITE_URL = 'https://www.mamie-vege.fr';
const SITE_NAME = 'et si mamie était végé ?';
const AUTHOR = 'Maxence';

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

function render({ title, description, canonical, ogType = 'website', image, keywords, jsonLd, bodyHtml }) {
  let h = tpl;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  // <title>
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(fullTitle)}</title>`);

  // canonical
  h = h.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${canonical}"`);

  // meta
  h = replaceMeta(h, 'name', 'description', description);
  if (keywords) h = replaceMeta(h, 'name', 'keywords', keywords);
  h = replaceMeta(h, 'name', 'robots', 'index, follow');

  // Open Graph
  h = replaceMeta(h, 'property', 'og:type', ogType);
  h = replaceMeta(h, 'property', 'og:title', fullTitle);
  h = replaceMeta(h, 'property', 'og:description', description);
  h = replaceMeta(h, 'property', 'og:url', canonical);
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
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: r.title,
    image: r.image ? [r.image] : [],
    author: { '@type': 'Person', name: AUTHOR },
    datePublished: r.created_at?.slice?.(0, 10) || new Date().toISOString().slice(0, 10),
    description: `Recette végétarienne : ${r.title}. ${r.calories} kcal, ${r.protein}g de protéines.`,
    prepTime: `PT${Math.max(5, Math.round(t * 0.4))}M`,
    cookTime: `PT${Math.max(5, t - Math.round(t * 0.4))}M`,
    totalTime: `PT${t}M`,
    recipeYield: `${r.servings || 1} portion${(r.servings || 1) > 1 ? 's' : ''}`,
    recipeCategory: CAT[r.category] || r.category,
    recipeCuisine: 'Végétarienne',
    keywords: [
      'végétarien',
      'protéines végétales',
      ...(r.tags || []).map((tag) => tag.replace('#', '')),
      ...(r.regime || []),
      ...(r.season || []),
    ].join(', '),
    nutrition: {
      '@type': 'NutritionInformation',
      calories: `${r.calories} kcal`,
      proteinContent: `${r.protein}g`,
      carbohydrateContent: `${r.carbs}g`,
      fatContent: `${r.fat}g`,
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
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  };
}

/* ── Data sources ────────────────────────────────────── */
let recipes = [];
try {
  recipes = (await import('../src/data/recipes.js')).recipes || [];
} catch (e) {
  console.warn('⚠ Recettes non chargées:', e.message);
}

let articles = [];
try {
  const supaUrl = String(process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const anonKey = String(process.env.VITE_SUPABASE_ANON_KEY || '');
  if (supaUrl && anonKey) {
    const res = await fetch(
      `${supaUrl}/rest/v1/blog_articles?select=id,title,excerpt,meta_title,meta_description,image,date,author&order=date.desc`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } },
    );
    if (res.ok) articles = await res.json();
  }
} catch (e) {
  console.warn('⚠ Articles non chargés:', e.message);
}

/* ── Pages statiques ─────────────────────────────────── */
let count = 0;

const statics = [
  {
    path: '/',
    title: `${SITE_NAME} — Recettes végétariennes protéinées`,
    description:
      'Recettes végétariennes et végétaliennes riches en protéines pour sportifs. Planning repas hebdomadaire personnalisé, liste de courses automatique et conseils nutrition sportive végétale.',
    keywords:
      'recettes végétariennes, protéines végétales, meal prep végétarien, nutrition végétale sportive, planning repas végétarien',
    jsonLd: webSiteJsonLd(),
    bodyHtml: `<h1>et si mamie était végé ?</h1><p>Recettes végétariennes riches en protéines pour sportifs. Planning repas, liste de courses et conseils nutrition.</p>`,
  },
  {
    path: '/recettes',
    title: 'Recettes végétariennes protéinées pour sportifs',
    description:
      'Découvrez toutes nos recettes végétariennes et végétaliennes riches en protéines. Filtrez par catégorie, régime alimentaire, tags et temps de préparation.',
    keywords: 'recettes végétariennes, protéines végétales, recettes sportifs, filtrer recettes',
    bodyHtml: `<h1>Recettes végétariennes protéinées</h1><p>Toutes nos recettes végétariennes riches en protéines pour sportifs.</p>`,
  },
  {
    path: '/planning',
    title: 'Planning repas végétarien sportif en 2 minutes',
    description:
      'Crée ton planning végétarien sportif en 2 minutes. Ajuste les portions, suis tes macros, génère ta liste de courses et exporte vers ton calendrier.',
    keywords: 'planning repas végétarien, meal prep, liste de courses, macros végétarien',
    bodyHtml: `<h1>Planning repas végétarien sportif</h1><p>Crée ton planning personnalisé en 2 minutes. Portions, macros, liste de courses.</p>`,
  },
  {
    path: '/blog',
    title: 'Blog nutrition végétale & performance sportive',
    description:
      'Conseils nutrition sportive végétale, guides meal prep végétarien, témoignages et comparatifs pour sportifs végétariens et végétaliens.',
    keywords: 'blog nutrition végétale, sportif végétarien, meal prep, protéines végétales',
    bodyHtml: `<h1>Blog nutrition végétale</h1><p>Conseils, guides et témoignages pour sportifs végétariens et végétaliens.</p>`,
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
  const slug = getSlug(r.title);
  if (!slug) continue;
  const path = `/recettes/${slug}`;
  const url = `${SITE_URL}${path}`;
  const cat = CAT[r.category] || r.category;

  const ingHtml = (r.ingredients || []).map((i) => `<li>${esc(i)}</li>`).join('');
  const stepsHtml = (r.steps || []).map((s) => `<li>${esc(s)}</li>`).join('');

  writePage(
    path,
    render({
      title: r.title,
      description: `Recette végétarienne : ${r.title}. ${r.calories} kcal, ${r.protein}g de protéines. Prête en ${r.time} min.`,
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
      ],
      bodyHtml: `<article><h1>${esc(r.title)}</h1><p>${esc(cat)} · ${r.time} min · ${r.calories} kcal · ${r.protein}g protéines</p><h2>Ingrédients</h2><ul>${ingHtml}</ul><h2>Instructions</h2><ol>${stepsHtml}</ol></article>`,
    }),
  );
  count++;
}

/* ── Pages articles blog ─────────────────────────────── */
for (const a of articles) {
  const slug = getSlug(a.title);
  if (!slug || a.id == null) continue;
  const path = `/blog/${a.id}/${slug}`;
  const url = `${SITE_URL}${path}`;

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
      ],
      bodyHtml: `<article><h1>${esc(a.title)}</h1>${a.excerpt ? `<p>${esc(a.excerpt)}</p>` : ''}</article>`,
    }),
  );
  count++;
}

console.log(`✓ ${count} pages pré-rendues dans dist/`);
