# Scripts Vegeprot

## Import de contenu

### `npm run import`
Importe les recettes et articles depuis `content/recettes/` et `content/articles/`.
- Lit les fichiers JSON (objet unique ou tableau)
- Recettes d'abord, puis articles (pour que les IDs existent pour les liens)
- Enrichit les ingrédients via CIQUAL et Open Food Facts
- Fichiers traités deplacees dans `done/`

```bash
npm run import                                          # import standard
npm run import -- --ciqual src/assets/ingredients_vegetariens_nutritionnel.csv  # avec CIQUAL
npm run import -- --no-image                            # sans generation d'images
npm run import:dry                                      # dry-run (aucune ecriture)
```

### `npm run images`
Detoure, convertit en WebP et uploade les images de recettes.
- Depose des PNG nommes par ID dans `content/images/` (ex: `60.png`)
- Detourage IA via `@imgly/background-removal-node`
- Trim + resize 800x600 + WebP 85%
- Upload dans le bucket Supabase `recipes` + liaison en base

```bash
npm run images
```

## SEO / Build

### `npm run build`
Enchaine : sitemap -> vite build -> prerender.
```
node scripts/generate-sitemap.mjs && vite build && node scripts/prerender.mjs
```

### `generate-sitemap.mjs`
Genere `public/sitemap.xml` + `public/robots.txt` depuis Supabase (recettes + articles).

### `prerender.mjs`
Genere un HTML statique par recette et article avec meta tags, JSON-LD Recipe/Article, Open Graph.

## Utilitaires

### `generate-missing-images.mjs`
Genere les images manquantes via Google Imagen (necessite `GEMINI_API_KEY` + disponibilite geo).
```bash
node scripts/generate-missing-images.mjs              # toutes les recettes sans image
node scripts/generate-missing-images.mjs --ids 60,61  # recettes specifiques
```

### `import-recipe.mjs`
Import d'une seule recette avec enrichissement nutritionnel.
```bash
node scripts/import-recipe.mjs recette.json [--ciqual ciqual.csv]
```

### `import-article-json.mjs`
Import d'un seul article.
```bash
node scripts/import-article-json.mjs article.json
```

### `seed.mjs`
Seed initial des recettes depuis `src/data/recipes.js`.

### `import-ciqual.mjs`
Enrichit les ingredients en base avec les donnees CIQUAL.
```bash
node scripts/import-ciqual.mjs chemin/vers/ciqual.csv
```

## Structure des dossiers content/

```
content/
├── recettes/     <- JSON de recettes (objet ou tableau)
│   └── done/     <- fichiers traites (gitignored)
├── articles/     <- JSON d'articles (objet ou tableau)
│   └── done/
└── images/       <- PNG nommes par ID de recette (ex: 60.png)
    └── done/
```

## Variables d'environnement requises

| Variable | Usage |
|----------|-------|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Cle anonyme (sitemap, prerender) |
| `SUPABASE_SERVICE_ROLE_KEY` | Cle admin (import, upload images) |
| `GEMINI_API_KEY` | Google Imagen (optionnel) |
