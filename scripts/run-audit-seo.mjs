#!/usr/bin/env node
/**
 * Wrapper CLI pour lancer l'audit SEO localement.
 * Importe et exécute les fonctions du cron handler sans serveur Vercel.
 */

import { readFileSync } from 'fs';

// Charger les env vars
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

// Le handler attend CRON_SECRET — on le fournit
if (!process.env.CRON_SECRET) process.env.CRON_SECRET = 'local-dev';

// Import dynamique du handler
const mod = await import('../api/cron/audit-seo.mjs');
const handler = mod.default;

// Simuler req/res
const fakeReq = {
  headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
};

let statusCode = 200;
const fakeRes = {
  status(code) { statusCode = code; return this; },
  json(data) {
    console.log(`\n── Résultat (HTTP ${statusCode}) ──`);
    console.log(JSON.stringify(data, null, 2));
  },
};

await handler(fakeReq, fakeRes);
