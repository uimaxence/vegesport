import { useEffect } from 'react';

const DEFAULT_TITLE = 'et si mamie était végé ? — Recettes végétariennes';
const DEFAULT_DESCRIPTION =
  'Recettes végétariennes et végétaliennes riches en protéines pour sportifs. Planning repas hebdomadaire, liste de courses et conseils nutrition sportive végétale.';

/**
 * Met à jour le titre et la meta description de la page (SEO).
 * @param {string} [title] - Titre de la page (suffixe ou titre complet)
 * @param {string} [description] - Meta description
 * @param {boolean} [fullTitle=false] - Si true, title est le titre complet ; sinon on fait "title | et si mamie était végé ?"
 */
export function usePageMeta(title, description, fullTitle = false) {
  useEffect(() => {
    const previousTitle = document.title;
    const prevMeta = document.querySelector('meta[name="description"]');
    const prevContent = prevMeta?.getAttribute('content');

    if (title) {
      document.title = fullTitle ? title : `${title} | et si mamie était végé ?`;
    }
    if (description) {
      let el = document.querySelector('meta[name="description"]');
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', 'description');
        document.head.appendChild(el);
      }
      el.setAttribute('content', description);
    }

    return () => {
      document.title = previousTitle;
      if (prevMeta && prevContent) prevMeta.setAttribute('content', prevContent);
    };
  }, [title, description, fullTitle]);
}

export { DEFAULT_TITLE, DEFAULT_DESCRIPTION };
