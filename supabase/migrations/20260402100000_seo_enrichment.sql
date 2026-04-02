-- Migration SEO — mamie-vege.fr — 02/04/2026
-- Ajoute les colonnes nécessaires pour l'enrichissement SEO des recettes et articles

-- ── Table blog_articles : slug, image_alt, updated_date ─────────────────────
ALTER TABLE blog_articles
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS image_alt TEXT,
  ADD COLUMN IF NOT EXISTS updated_date DATE;

-- ── Table recipes : colonnes SEO et contenu enrichi ─────────────────────────
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS intro TEXT,
  ADD COLUMN IF NOT EXISTS image_alt TEXT,
  ADD COLUMN IF NOT EXISTS sport_timing TEXT,
  ADD COLUMN IF NOT EXISTS conservation TEXT,
  ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS nutrition_per_serving JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS schema_recipe JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS faq_recette JSONB DEFAULT '[]'::jsonb;
