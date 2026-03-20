/**
 * Importe un article JSON (format fourni) vers Supabase.
 *
 * Usage:
 *   node scripts/import-article-json.mjs /chemin/article.json
 *
 * Le script:
 * - mappe snake_case/camelCase
 * - garde content_json tel quel (blocs UI)
 * - extrait faq_json et sources_json automatiquement depuis content_json
 * - upsert dans public.blog_articles sur id
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnv(envPath) {
  if (!existsSync(envPath)) return false;
  const content = readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const i = trimmed.indexOf('=');
    if (i <= 0) return;
    const key = trimmed.slice(0, i).trim();
    const val = trimmed.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  });
  return true;
}

loadEnv(join(root, '.env')) ||
  loadEnv(join(root, '.env.example')) ||
  loadEnv(join(process.cwd(), '.env')) ||
  loadEnv(join(process.cwd(), '.env.example'));

const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis.');
  process.exit(1);
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/import-article-json.mjs /chemin/article.json');
  process.exit(1);
}

const absoluteInput = resolve(process.cwd(), inputPath);
if (!existsSync(absoluteInput)) {
  console.error('Fichier introuvable:', absoluteInput);
  process.exit(1);
}

function normalizeBlocks(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function extractFaqAndSourcesFromBlocks(blocks) {
  const faq = [];
  const sources = [];
  for (const b of blocks) {
    const type = String(b?.type || '').toLowerCase();
    if (type === 'faq' && Array.isArray(b?.items)) {
      for (const item of b.items) {
        const question = item?.question ?? item?.name;
        const answer = item?.answer ?? item?.acceptedAnswer?.text ?? item?.acceptedAnswer;
        if (question && answer) faq.push({ question, answer });
      }
    }
    if (type === 'source') {
      const label = b?.label ?? b?.name;
      const url = b?.url ?? b?.href;
      if (label || url) sources.push({ label: label || url, url });
    }
    if (type === 'sources_list' && Array.isArray(b?.items)) {
      for (const item of b.items) {
        const label = item?.label ?? item?.name;
        const url = item?.url ?? item?.href;
        if (label || url) sources.push({ label: label || url, url });
      }
    }
  }
  return { faq, sources };
}

function toArticleRow(input) {
  const contentJson = normalizeBlocks(input.content_json ?? input.contentJson);
  const extracted = extractFaqAndSourcesFromBlocks(contentJson);
  const baseStorageUrl = `${String(url).replace(/\/$/, '')}/storage/v1/object/public/blog/`;
  const defaultImage = input.id ? `${baseStorageUrl}${input.id}.webp` : null;
  return {
    id: input.id,
    title: input.title,
    excerpt: input.excerpt ?? null,
    meta_title: input.meta_title ?? input.metaTitle ?? input.title,
    meta_description: input.meta_description ?? input.metaDescription ?? input.excerpt ?? '',
    category: input.category,
    date: input.date,
    read_time: input.read_time ?? input.readTime ?? 5,
    image: input.image ?? defaultImage,
    author: input.author ?? null,
    content: input.content ?? '',
    content_json: contentJson,
    faq_json: Array.isArray(input.faq_json) ? input.faq_json : (Array.isArray(input.faqJson) ? input.faqJson : extracted.faq),
    sources_json: Array.isArray(input.sources_json) ? input.sources_json : (Array.isArray(input.sourcesJson) ? input.sourcesJson : extracted.sources),
    schema_type: input.schema_type ?? input.schemaType ?? 'Article',
    updated_at: new Date().toISOString(),
  };
}

const raw = JSON.parse(readFileSync(absoluteInput, 'utf8'));
const row = toArticleRow(raw);

if (!row.id || !row.title || !row.category || !row.date) {
  console.error('JSON invalide: id, title, category et date sont requis.');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

const { error } = await supabase.from('blog_articles').upsert(row, { onConflict: 'id' });
if (error) {
  console.error('Erreur import article:', error.message);
  process.exit(1);
}

console.log(`Article ${row.id} importé avec succès.`);
