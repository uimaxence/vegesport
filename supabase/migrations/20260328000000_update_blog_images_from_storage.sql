-- Associe les images des articles au bucket storage "blog"
-- Convention de nommage: {id}.webp

do $$
declare
  base_url text := 'https://wffoftjdjbmypxxdamho.supabase.co/storage/v1/object/public/blog/';
  ext text := '.webp';
begin
  update public.blog_articles
  set image = base_url || id::text || ext
  where id is not null;
end $$;
