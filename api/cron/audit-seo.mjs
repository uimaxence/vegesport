/**
 * Audit SEO quotidien — mamie-vege.fr
 * Vercel Cron Function : crawl le site, analyse le maillage interne,
 * détecte les problèmes, génère un rapport via Claude API et l'envoie par email (Brevo SMTP).
 *
 * Cron : tous les jours à 7h00 UTC (voir vercel.json)
 * Variables d'environnement requises :
 *   CRON_SECRET, ANTHROPIC_API_KEY,
 *   BREVO_SMTP_USER, BREVO_SMTP_PASS,
 *   EMAIL_FROM, EMAIL_TO
 */

// ── CONFIG ──────────────────────────────────────────────────────────────────────
const SITE_URL = "https://www.mamie-vege.fr";

const MIN_INTERNAL_LINKS = 2;
const MIN_WORD_COUNT = 300;    // recette
const MIN_ARTICLE_WORDS = 800; // article
const MAX_PAGES = 500;
const CRAWL_DELAY_MS = 200;    // politesse entre requêtes
const REQUEST_TIMEOUT_MS = 10_000;
// ────────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Vérification du secret cron (Vercel envoie ce header)
  if (req.headers["authorization"] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log(`🕷️ Crawl de ${SITE_URL}...`);
    const pages = await crawlSite(SITE_URL);
    console.log(`   ${Object.keys(pages).length} pages crawlées`);

    console.log("🔍 Analyse...");
    const analysis = analysePages(pages);

    console.log("🤖 Génération du rapport via Claude...");
    const prompt = buildPrompt(analysis);
    const report = await generateReport(prompt);

    // Log local du rapport (visible dans Vercel logs)
    console.log("── RAPPORT ──\n" + report);

    // Envoi par email (skip si pas configuré)
    if (process.env.EMAIL_FROM && process.env.EMAIL_TO) {
      console.log("📧 Envoi par email via Brevo...");
      await sendEmail(report, analysis.stats);
    } else {
      console.log("⚠️ EMAIL_FROM/EMAIL_TO non configurés — rapport loggé uniquement");
    }

    return res.status(200).json({
      ok: true,
      stats: analysis.stats,
      issuesSummary: Object.fromEntries(
        Object.entries(analysis.issues).map(([k, v]) => [k, v.length])
      ),
    });
  } catch (err) {
    console.error("❌ Audit échoué:", err);
    return res.status(500).json({ error: err.message });
  }
}

// ── CRAWL ───────────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function cleanUrl(raw, baseHost) {
  try {
    const u = new URL(raw);
    if (u.hostname !== baseHost) return null;
    // Supprimer hash et query strings parasites, garder le path propre
    u.hash = "";
    u.search = "";
    let path = u.pathname.replace(/\/+$/, "") || "/";
    return `${u.origin}${path}`;
  } catch {
    return null;
  }
}

function detectPageType(url) {
  const path = new URL(url).pathname.toLowerCase();
  if (/\/recette/.test(path)) return "recette";
  if (/\/(article|blog|nutrition|sport)/.test(path)) return "article";
  return "autre";
}

async function crawlSite(baseUrl) {
  const baseHost = new URL(baseUrl).hostname;
  const visited = new Set();
  const toVisit = new Set([cleanUrl(baseUrl, baseHost)]);
  const pages = {};

  // Seed depuis le sitemap (essentiel pour les SPA)
  const sitemapUrls = await fetchSitemap(baseUrl);
  for (const u of sitemapUrls) {
    const clean = cleanUrl(u, baseHost);
    if (clean) toVisit.add(clean);
  }
  console.log(`   ${toVisit.size} URLs seedées depuis sitemap + homepage`);

  // Respecter robots.txt
  const disallowed = await fetchRobotsTxt(baseUrl);

  while (toVisit.size > 0 && Object.keys(pages).length < MAX_PAGES) {
    const url = toVisit.values().next().value;
    toVisit.delete(url);
    if (visited.has(url)) continue;
    visited.add(url);

    // Vérifier robots.txt
    const path = new URL(url).pathname;
    if (disallowed.some((rule) => path.startsWith(rule))) {
      continue;
    }

    await sleep(CRAWL_DELAY_MS);

    const startTime = Date.now();
    let resp;
    try {
      resp = await fetch(url, {
        headers: { "User-Agent": "MamieVegeAuditBot/2.0" },
        redirect: "follow",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (err) {
      pages[url] = { url, error: err.message, status: 0, ttfb: 0 };
      continue;
    }
    const ttfb = Date.now() - startTime;

    const pageData = {
      url,
      status: resp.status,
      ttfb,
      redirected: resp.redirected,
      finalUrl: resp.url,
      internalLinks: [],
      title: null,
      metaDescription: null,
      canonical: null,
      h1: null,
      ogTitle: null,
      ogImage: null,
      wordCount: 0,
      imagesWithoutAlt: 0,
      pageType: detectPageType(url),
    };

    if (resp.status !== 200) {
      pages[url] = pageData;
      continue;
    }

    const html = await resp.text();

    // Parse HTML manuellement (pas de dépendance lourde)
    pageData.title = extractTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    pageData.metaDescription = extractMeta(html, "description");
    pageData.canonical = extractLink(html, "canonical");
    pageData.h1 = extractTag(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
    pageData.ogTitle = extractMetaProperty(html, "og:title");
    pageData.ogImage = extractMetaProperty(html, "og:image");

    // Contenu texte (approximation : supprimer les tags)
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
      || html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    const contentHtml = mainMatch ? mainMatch[1] : html;
    const text = contentHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    pageData.wordCount = text.split(/\s+/).filter(Boolean).length;

    // Images sans alt
    const imgMatches = html.matchAll(/<img\b([^>]*)>/gi);
    for (const m of imgMatches) {
      const attrs = m[1];
      if (!/alt\s*=\s*["'][^"']+["']/i.test(attrs)) {
        pageData.imagesWithoutAlt++;
      }
    }

    // Liens internes
    const linkMatches = html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>/gi);
    for (const m of linkMatches) {
      const href = m[1].trim();
      let full;
      try {
        full = new URL(href, baseUrl).href;
      } catch {
        continue;
      }
      const clean = cleanUrl(full, baseHost);
      if (!clean) continue;
      pageData.internalLinks.push(clean);
      if (!visited.has(clean)) toVisit.add(clean);
    }

    pages[url] = pageData;
  }

  return pages;
}

async function fetchRobotsTxt(baseUrl) {
  const disallowed = [];
  try {
    const resp = await fetch(`${baseUrl}/robots.txt`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return disallowed;
    const text = await resp.text();
    let relevant = false;
    for (const line of text.split("\n")) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.startsWith("user-agent:")) {
        relevant = trimmed.includes("*") || trimmed.includes("mamievegeauditbot");
      }
      if (relevant && trimmed.startsWith("disallow:")) {
        const path = trimmed.replace("disallow:", "").trim();
        if (path) disallowed.push(path);
      }
    }
  } catch { /* ignore */ }
  return disallowed;
}

async function fetchSitemap(baseUrl) {
  const urls = [];
  try {
    const resp = await fetch(`${baseUrl}/sitemap.xml`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return urls;
    const xml = await resp.text();
    const matches = xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gi);
    for (const m of matches) {
      urls.push(m[1].trim());
    }
  } catch { /* ignore */ }
  return urls;
}

// ── HTML HELPERS (sans dépendance) ──────────────────────────────────────────────

function extractTag(html, regex) {
  const m = html.match(regex);
  return m ? m[1].replace(/<[^>]+>/g, "").trim() : null;
}

function extractMeta(html, name) {
  const re = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, "i");
  const m = html.match(re);
  if (m) return m[1];
  // Ordre inversé (content avant name)
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, "i");
  const m2 = html.match(re2);
  return m2 ? m2[1] : null;
}

function extractMetaProperty(html, property) {
  const re = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, "i");
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, "i");
  const m2 = html.match(re2);
  return m2 ? m2[1] : null;
}

function extractLink(html, rel) {
  const re = new RegExp(`<link[^>]*rel=["']${rel}["'][^>]*href=["']([^"']*)["']`, "i");
  const m = html.match(re);
  return m ? m[1] : null;
}

// ── ANALYSE ─────────────────────────────────────────────────────────────────────

function analysePages(pages) {
  const issues = {
    brokenPages: [],
    missingMeta: [],
    missingH1: [],
    weakMaillage: [],
    thinContent: [],
    imagesNoAlt: [],
    titleTooLong: [],
    titleTooShort: [],
    missingCanonical: [],
    missingOg: [],
    slowPages: [],
    redirected: [],
  };
  const stats = {
    totalPages: Object.keys(pages).length,
    articles: 0,
    recettes: 0,
    errors: 0,
    avgInternalLinks: 0,
    avgTtfb: 0,
  };

  let totalLinks = 0;
  let contentPages = 0;
  let totalTtfb = 0;
  let ttfbCount = 0;

  for (const [url, data] of Object.entries(pages)) {
    if (data.error || data.status !== 200) {
      issues.brokenPages.push({ url, status: data.status || 0, error: data.error });
      stats.errors++;
      continue;
    }

    const ptype = data.pageType;
    if (ptype === "article") stats.articles++;
    else if (ptype === "recette") stats.recettes++;

    // TTFB
    if (data.ttfb) {
      totalTtfb += data.ttfb;
      ttfbCount++;
      if (data.ttfb > 2000) {
        issues.slowPages.push({ url, ttfb: data.ttfb });
      }
    }

    // Redirections
    if (data.redirected) {
      issues.redirected.push({ url, finalUrl: data.finalUrl });
    }

    // Meta description
    if (!data.metaDescription) issues.missingMeta.push(url);

    // H1
    if (!data.h1) issues.missingH1.push(url);

    // Canonical
    if (!data.canonical && ptype !== "autre") {
      issues.missingCanonical.push(url);
    }

    // Open Graph
    if (!data.ogTitle && ptype !== "autre") {
      issues.missingOg.push(url);
    }

    // Title
    const title = data.title || "";
    if (title.length > 60) {
      issues.titleTooLong.push({ url, length: title.length, title: title.slice(0, 70) });
    } else if (title && title.length < 20) {
      issues.titleTooShort.push({ url, length: title.length, title });
    }

    // Maillage interne
    const uniqueLinks = new Set(data.internalLinks || []);
    const nLinks = uniqueLinks.size;
    if (ptype !== "autre" && nLinks < MIN_INTERNAL_LINKS) {
      issues.weakMaillage.push({ url, type: ptype, internalLinks: nLinks });
    }

    // Contenu mince
    const wc = data.wordCount || 0;
    const threshold = ptype === "article" ? MIN_ARTICLE_WORDS : MIN_WORD_COUNT;
    if (ptype !== "autre" && wc < threshold) {
      issues.thinContent.push({ url, type: ptype, wordCount: wc, threshold });
    }

    // Images sans alt
    if (data.imagesWithoutAlt > 0) {
      issues.imagesNoAlt.push({ url, count: data.imagesWithoutAlt });
    }

    if (ptype !== "autre") {
      totalLinks += nLinks;
      contentPages++;
    }
  }

  stats.avgInternalLinks = contentPages > 0 ? Math.round((totalLinks / contentPages) * 10) / 10 : 0;
  stats.avgTtfb = ttfbCount > 0 ? Math.round(totalTtfb / ttfbCount) : 0;

  return { issues, stats };
}

// ── PROMPT & CLAUDE ─────────────────────────────────────────────────────────────

function buildPrompt(analysis) {
  const { issues, stats } = analysis;
  const today = new Date().toLocaleDateString("fr-FR");

  return `Tu es un expert SEO. Voici les données d'audit quotidien du blog mamie-vege.fr en date du ${today}.

## Statistiques générales
- Pages totales crawlées : ${stats.totalPages}
- Articles : ${stats.articles}
- Recettes : ${stats.recettes}
- Pages en erreur : ${stats.errors}
- Moyenne liens internes par page de contenu : ${stats.avgInternalLinks}
- TTFB moyen : ${stats.avgTtfb}ms

## Problèmes détectés

### Pages en erreur (${issues.brokenPages.length})
${JSON.stringify(issues.brokenPages.slice(0, 10), null, 2)}

### Redirections (${issues.redirected.length})
${JSON.stringify(issues.redirected.slice(0, 5), null, 2)}

### Pages lentes TTFB > 2s (${issues.slowPages.length})
${JSON.stringify(issues.slowPages.slice(0, 5), null, 2)}

### Meta descriptions manquantes (${issues.missingMeta.length})
${JSON.stringify(issues.missingMeta.slice(0, 10), null, 2)}

### H1 manquants (${issues.missingH1.length})
${JSON.stringify(issues.missingH1.slice(0, 10), null, 2)}

### Canonical manquants (${issues.missingCanonical.length})
${JSON.stringify(issues.missingCanonical.slice(0, 10), null, 2)}

### Open Graph manquants (${issues.missingOg.length})
${JSON.stringify(issues.missingOg.slice(0, 10), null, 2)}

### Maillage interne faible < ${MIN_INTERNAL_LINKS} liens (${issues.weakMaillage.length})
${JSON.stringify(issues.weakMaillage.slice(0, 15), null, 2)}

### Contenu trop court (${issues.thinContent.length})
${JSON.stringify(issues.thinContent.slice(0, 10), null, 2)}

### Images sans attribut alt (${issues.imagesNoAlt.length})
${JSON.stringify(issues.imagesNoAlt.slice(0, 10), null, 2)}

### Titres trop longs >60 chars (${issues.titleTooLong.length})
${JSON.stringify(issues.titleTooLong.slice(0, 5), null, 2)}

---

Génère un rapport d'audit en français, structuré ainsi :

1. **Résumé en 3 lignes** — état général du site aujourd'hui
2. **Score de santé SEO** — note sur 10 avec justification courte
3. **🔴 Priorité immédiate** — max 3 actions urgentes avec l'URL exacte concernée
4. **🟠 À traiter cette semaine** — max 5 actions importantes
5. **🟢 Optimisations à planifier** — max 3 améliorations de fond
6. **Tendance** — comparé à un site végé/sport sain, où en est-on ?

Sois direct, concret, sans jargon. Chaque action doit mentionner l'URL précise et ce qu'il faut faire exactement. Maximum 400 mots au total.`;
}

async function generateReport(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY manquante");

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Claude API ${resp.status}: ${body}`);
  }

  const data = await resp.json();
  return data.content[0].text;
}

// ── EMAIL (Brevo SMTP via fetch — pas de nodemailer nécessaire) ─────────────────

async function sendEmail(report, stats) {
  const apiKey = process.env.BREVO_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const emailTo = process.env.EMAIL_TO;

  if (!emailFrom || !emailTo) throw new Error("EMAIL_FROM ou EMAIL_TO manquant");

  const today = new Date().toLocaleDateString("fr-FR");

  // Convertir markdown basique en HTML
  const reportHtml = report
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

  const htmlBody = `
<html><body style="font-family: -apple-system, sans-serif; max-width: 680px; margin: 0 auto; color: #1a1a18;">
<div style="background: #EAF3DE; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
  <h2 style="margin:0; color: #27500A;">🌱 Audit SEO quotidien — ${today}</h2>
  <p style="margin: 6px 0 0; color: #3B6D11; font-size: 14px;">
    ${stats.totalPages} pages · ${stats.articles} articles · ${stats.recettes} recettes · ${stats.errors} erreurs · TTFB moy. ${stats.avgTtfb}ms
  </p>
</div>
<div style="line-height: 1.6; font-size: 14px;">
${reportHtml}
</div>
<hr style="margin: 24px 0; border: none; border-top: 1px solid #e0ddd4;">
<p style="font-size: 12px; color: #888;">Rapport généré automatiquement — mamie-vege.fr audit agent v2</p>
</body></html>`;

  if (apiKey) {
    // Brevo Transactional Email API (recommandé, pas besoin de SMTP)
    const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { email: emailFrom, name: "Audit SEO mamie-vege" },
        to: [{ email: emailTo }],
        subject: `🌱 Audit SEO mamie-vege.fr — ${today}`,
        htmlContent: htmlBody,
        textContent: report, // version texte brut = le rapport markdown
      }),
    });

    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Brevo API ${resp.status}: ${body}`);
    }
  } else {
    // Fallback : log le rapport si pas de config email
    console.warn("⚠️ BREVO_API_KEY non configurée — rapport loggé uniquement");
  }

  console.log(`✅ Rapport envoyé à ${emailTo}`);
}
