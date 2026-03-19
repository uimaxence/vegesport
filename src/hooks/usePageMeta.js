import { useEffect } from 'react';

const SITE_NAME = 'et si mamie était végé ?';
const DEFAULT_TITLE = `${SITE_NAME} — Recettes végétariennes`;
const DEFAULT_DESCRIPTION =
  'Recettes végétariennes et végétaliennes riches en protéines pour sportifs. Planning repas hebdomadaire, liste de courses et conseils nutrition sportive végétale.';

function upsertMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (content != null) {
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  } else if (el) {
    el.remove();
  }
}

function upsertLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (href) {
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  } else if (el) {
    el.remove();
  }
}

/**
 * Sets page title + meta description + canonical + OG + Twitter Cards.
 *
 * @param {Object} opts
 * @param {string}  [opts.title]       — page title (suffixed with site name unless fullTitle)
 * @param {string}  [opts.description] — meta description
 * @param {boolean} [opts.fullTitle]   — if true, title is used as-is
 * @param {string}  [opts.canonical]   — full canonical URL
 * @param {string}  [opts.image]       — OG / Twitter image URL
 * @param {string}  [opts.type]        — og:type (default "website")
 * @param {boolean} [opts.noindex]     — add robots noindex,nofollow
 */
export function usePageMeta({
  title,
  description,
  fullTitle = false,
  canonical,
  image,
  type = 'website',
  noindex = false,
} = {}) {
  useEffect(() => {
    const prev = {
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.getAttribute('content'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    };

    const pageTitle = title
      ? fullTitle ? title : `${title} | ${SITE_NAME}`
      : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;

    document.title = pageTitle;

    upsertMeta('name', 'description', desc);
    upsertLink('canonical', canonical || null);

    if (noindex) {
      upsertMeta('name', 'robots', 'noindex, nofollow');
    } else {
      const existing = document.querySelector('meta[name="robots"]');
      if (existing) existing.remove();
    }

    upsertMeta('property', 'og:title', pageTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'fr_FR');
    if (canonical) upsertMeta('property', 'og:url', canonical);
    if (image) upsertMeta('property', 'og:image', image);

    upsertMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    upsertMeta('name', 'twitter:title', pageTitle);
    upsertMeta('name', 'twitter:description', desc);
    if (image) upsertMeta('name', 'twitter:image', image);

    return () => {
      document.title = prev.title;
      if (prev.desc) upsertMeta('name', 'description', prev.desc);
      if (prev.canonical) upsertLink('canonical', prev.canonical);
    };
  }, [title, description, fullTitle, canonical, image, type, noindex]);
}

export { DEFAULT_TITLE, DEFAULT_DESCRIPTION };
