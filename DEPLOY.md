# Mise en production — et si mamie était végé ?

## Sécurité

- **`.env`** : ne doit **jamais** être commité (il est dans `.gitignore`). Il contient `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` et éventuellement `SUPABASE_SERVICE_ROLE_KEY` (uniquement pour le script `npm run seed` en local).
- **Clé anon** : exposée côté client, c’est normal. Les accès aux données sont limités par les **RLS** Supabase (favoris/plannings par utilisateur, recettes/blog en lecture seule).
- **Clé service_role** : à utiliser **uniquement** pour le seed en local, jamais dans le code front ni en prod.
- **Headers** : `vercel.json` (Vercel) et `netlify.toml` (Netlify) ajoutent des en-têtes de sécurité (X-Content-Type-Options, X-Frame-Options, etc.).

## SEO

- **Titre et meta description** : définis par page via le hook `usePageMeta` (titre + description pour chaque route).
- **Open Graph** : balises par défaut dans `index.html` (og:title, og:description, og:locale). En prod, tu peux ajouter `og:image` (1200×630) et `og:url` (URL canonique).
- **robots.txt** : généré au build avec `Sitemap: <ton-domaine>/sitemap.xml`.
- **sitemap.xml** : généré au build à partir des routes statiques + IDs des recettes et articles (données locales au moment du build).

## Avant le premier déploiement

1. **Variables d’environnement** (sur Vercel/Netlify) :
   - `VITE_SUPABASE_URL` = ton URL projet Supabase
   - `VITE_SUPABASE_ANON_KEY` = ta clé anon (publique)
   - **Optionnel pour le SEO** : `VITE_PUBLIC_SITE_URL` ou `SITE_URL` = ton URL de prod (ex. `https://vegesport.fr`) pour que le sitemap et `robots.txt` utilisent les bonnes URLs.

2. **Build** :
   ```bash
   npm run build
   ```
   Cela génère `public/sitemap.xml` et `public/robots.txt` (avec ton `SITE_URL` si défini dans `.env`).

3. **Hébergement** :
   - **Vercel** : connecte le repo, les rewrites et headers sont dans `vercel.json`.
   - **Netlify** : idem avec `netlify.toml` (redirect SPA + headers).

## Checklist rapide

- [ ] `.env` absent du repo (vérifier avec `git status`)
- [ ] Variables d’env configurées sur la plateforme de déploiement
- [ ] `SITE_URL` / `VITE_PUBLIC_SITE_URL` défini pour la prod (sitemap)
- [ ] Schéma Supabase exécuté (tables + RLS)
- [ ] Seed exécuté une fois si besoin (`npm run seed` en local avec `SUPABASE_SERVICE_ROLE_KEY`)
