-- Synchronise les champs structurés de l'article 1 à partir de content_json
-- (FAQ, sources, metadata SEO, updated_at).

update public.blog_articles
set
  title = 'Protéines végétales pour sportifs : comment couvrir ses besoins sans viande',
  excerpt = 'Guide complet des meilleures sources de protéines végétales pour la musculation et l''endurance. Quantités, combinaisons et exemples de repas détaillés.',
  meta_title = 'Protéines végétales pour sportifs : sources, quantités et exemples | Et si mamie était végé ?',
  meta_description = 'Comment couvrir ses besoins en protéines avec une alimentation végétale quand on fait du sport ? Sources, quantités et exemples concrets pour la musculation et l''endurance.',
  date = '2026-03-20',
  read_time = 9,
  author = 'Maxence',
  schema_type = 'Article',
  faq_json = coalesce(
    (
      select b->'items'
      from jsonb_array_elements(coalesce(public.blog_articles.content_json, '[]'::jsonb)) as b
      where b->>'type' = 'faq'
      limit 1
    ),
    '[]'::jsonb
  ),
  sources_json = coalesce(
    (
      with from_sources_list as (
        select
          i->>'label' as label,
          i->>'url' as url
        from jsonb_array_elements(coalesce(public.blog_articles.content_json, '[]'::jsonb)) as b
        cross join lateral jsonb_array_elements(
          case
            when b->>'type' = 'sources_list' then coalesce(b->'items', '[]'::jsonb)
            else '[]'::jsonb
          end
        ) as i
      ),
      from_source_block as (
        select
          b->>'label' as label,
          b->>'url' as url
        from jsonb_array_elements(coalesce(public.blog_articles.content_json, '[]'::jsonb)) as b
        where b->>'type' = 'source'
      ),
      all_sources as (
        select label, url from from_sources_list
        union all
        select label, url from from_source_block
      )
      select jsonb_agg(
        jsonb_build_object(
          'label', coalesce(label, url),
          'url', url
        )
      )
      from all_sources
      where coalesce(label, url) is not null
    ),
    '[]'::jsonb
  ),
  updated_at = now()
where id = 1;
