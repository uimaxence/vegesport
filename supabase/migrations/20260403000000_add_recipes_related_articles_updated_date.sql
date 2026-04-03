-- Migration — mamie-vege.fr — 03/04/2026
-- Ajoute related_article_ids et updated_date sur recipes
-- (déjà présent sur blog_articles, manquant sur recipes)

ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS related_article_ids INTEGER[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_date DATE;
