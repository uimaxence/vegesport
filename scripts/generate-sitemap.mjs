/**
 * Génère public/sitemap.xml à partir des routes et des données locales.
 * À lancer avant le build (npm run build le fait automatiquement).
 * Variable optionnelle : SITE_URL (ex. https://vegesport.fr) pour les URLs absolues.
 */

import { writeFileSync, existsSync } from 'fs';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');

const SITE_URL = process.env.SITE_URL || process.env.VITE_PUBLIC_SITE_URL || 'https://example.com';

function loadEnv() {
  const path = join(root, '.env');
  if (!existsSync(path)) return;
  readFileSync(path, 'utf8').split('\n').forEach((line) => {
    const i = line.indexOf('=');
    if (i <= 0) return;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  });
}
loadEnv();
const baseUrl = (process.env.SITE_URL || process.env.VITE_PUBLIC_SITE_URL || SITE_URL).replace(/\/$/, '');

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
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: '/recettes', priority: '0.9', changefreq: 'weekly' },
  { path: '/planning', priority: '0.9', changefreq: 'weekly' },
  { path: '/blog', priority: '0.9', changefreq: 'weekly' },
  { path: '/connexion', priority: '0.5', changefreq: 'monthly' },
];

let recipeSlugs = [];
let articleIds = [];
try {
  const { recipes } = await import('../src/data/recipes.js');
  recipeSlugs = (recipes || []).map((r) => getSlug(r.title)).filter(Boolean);
} catch {
  // données peut être chargées depuis Supabase en prod, on garde les routes statiques
}
try {
  const { articles } = await import('../src/data/blog.js');
  articleIds = (articles || []).map((a) => a.id);
} catch {}

const urls = [
  ...staticRoutes.map((r) => ({ loc: `${baseUrl}${r.path || '/'}`, priority: r.priority, changefreq: r.changefreq })),
  ...recipeSlugs.map((slug) => ({ loc: `${baseUrl}/recettes/${slug}`, priority: '0.8', changefreq: 'monthly' })),
  ...articleIds.map((id) => ({ loc: `${baseUrl}/blog/${id}`, priority: '0.7', changefreq: 'monthly' })),
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

Sitemap: ${baseUrl}/sitemap.xml
`;
writeFileSync(join(publicDir, 'robots.txt'), robotsTxt, 'utf8');

console.log('sitemap.xml et robots.txt générés avec', urls.length, 'URLs (base:', baseUrl, ')');
if (baseUrl === 'https://example.com') {
  console.warn('En prod, définis SITE_URL ou VITE_PUBLIC_SITE_URL dans .env (ex. https://vegesport.fr)');
}
