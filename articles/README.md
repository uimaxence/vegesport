Depose ici les JSON d'articles a importer en BDD.

Format attendu: meme structure que les exemples fournis (id, title, excerpt, category, date, read_time/readTime, meta_title/metaTitle, content_json, etc.).

Commande d'import:

`npm run import:article -- articles/article-x.json`

Notes:
- Les blocs UI sont lus depuis `content_json`.
- `faq_json` et `sources_json` sont extraits automatiquement depuis `content_json` si absents.
- Les blocs `recipes` affichent les cards selon `recipeIds`.
- Image article: si `image` est absente du JSON, l'import utilise automatiquement `blog/{id}.webp` dans le bucket Supabase `blog`.
