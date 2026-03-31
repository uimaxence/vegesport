/**
 * Génère public/sitemap.xml + public/robots.txt.
 * Exécuté automatiquement avant chaque build (npm run build).
 *
 * La variable VITE_SITE_URL (ou SITE_URL) définit le domaine.
 * Défaut : https://www.mamie-vege.fr
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');

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

const baseUrl = (
  process.env.VITE_SITE_URL ||
  process.env.SITE_URL ||
  process.env.VITE_PUBLIC_SITE_URL ||
  'https://www.mamie-vege.fr'
).replace(/\/$/, '');

function getSlug(title) {
  if (!title || typeof title !== 'string') return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const staticRoutes = [
  { path: '/',         priority: '1.0', changefreq: 'weekly' },
  { path: '/recettes', priority: '0.9', changefreq: 'daily' },
  { path: '/planning', priority: '0.9', changefreq: 'weekly' },
  { path: '/blog',     priority: '0.9', changefreq: 'weekly' },
  { path: '/mentions-legales', priority: '0.3', changefreq: 'yearly' },
];

let recipeSlugs = [];
let articleEntries = [];

try {
  const { recipes } = await import('../src/data/recipes.js');
  recipeSlugs = (recipes || []).map((r) => getSlug(r.title)).filter(Boolean);
} catch { /* Supabase-only en prod */ }

async function fetchArticlesFromSupabase() {
  const supabaseUrl = String(process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const anonKey = String(process.env.VITE_SUPABASE_ANON_KEY || '');
  if (!supabaseUrl || !anonKey) return null;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/blog_articles?select=id,title&order=date.desc`,
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

try {
  const data = await fetchArticlesFromSupabase();
  if (Array.isArray(data)) {
    articleEntries = data
      .map((a) => ({
        id: a.id,
        slug: getSlug(a.title),
      }))
      .filter((a) => a.id != null && a.slug);
  } else {
    throw new Error('Supabase non configuré pour les articles du sitemap');
  }
} catch (e) {
  console.error('Impossible de charger les articles depuis Supabase pour le sitemap:', e?.message || e);
  articleEntries = [];
}

const urls = [
  ...staticRoutes.map((r) => ({
    loc: `${baseUrl}${r.path}`,
    priority: r.priority,
    changefreq: r.changefreq,
  })),
  ...recipeSlugs.map((slug) => ({
    loc: `${baseUrl}/recettes/${slug}`,
    priority: '0.8',
    changefreq: 'monthly',
  })),
  ...articleEntries.map(({ slug }) => ({
    loc: `${baseUrl}/blog/${slug}`,
    priority: '0.7',
    changefreq: 'monthly',
  })),
];

const lastmod = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync(join(publicDir, 'sitemap.xml'), sitemap, 'utf8');

const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /profil
Disallow: /donnees-personnelles
Disallow: /auth/callback
Disallow: /connexion

# Crawlers IA autorisés
User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

writeFileSync(join(publicDir, 'robots.txt'), robotsTxt, 'utf8');

console.log(`✓ sitemap.xml (${urls.length} URLs) + robots.txt générés (base: ${baseUrl})`);
if (baseUrl === 'https://example.com') {
  console.warn('⚠ Définis VITE_SITE_URL dans .env (ex. https://www.mamie-vege.fr)');
}
