import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { ArrowLeft, Clock, Share2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { useJsonLd } from '../hooks/useJsonLd';
import { getSlug } from '../lib/slug';
import {
  canonicalUrl,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFAQPageJsonLd,
  buildHowToJsonLd,
} from '../lib/seo';
import ArticleBlocks from '../components/article/ArticleBlocks';
import { getSafeImageSrc, handleMediaImageError } from '../lib/imageFallback';

export default function BlogArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { articles, recipes, loading, error } = useData();
  const article = articles.find((a) => getSlug(a.title) === slug);
  const canonicalSlug = article ? getSlug(article.title) : '';
  const articleUrl = article && canonicalSlug
    ? canonicalUrl(`/blog/${canonicalSlug}`)
    : '';

  // Rediriger vers l'URL canonique si le slug ne correspond pas exactement
  useEffect(() => {
    if (!article || !canonicalSlug) return;
    if (slug !== canonicalSlug) {
      navigate(`/blog/${canonicalSlug}`, { replace: true });
    }
  }, [article, slug, canonicalSlug, navigate]);

  const metaReady = Boolean(article && articleUrl);

  usePageMeta(
    metaReady
      ? {
          title: article.metaTitle || article.title,
          description: article.metaDescription || article.excerpt || (article.content ? article.content.slice(0, 155) + '…' : undefined),
          fullTitle: Boolean(article.metaTitle),
          canonical: articleUrl,
          image: article.image,
          type: 'article',
        }
      : {}
  );

  const jsonLdData = useMemo(() => {
    if (!article || !articleUrl) return null;
    const jsonLdSchemas = [
      buildArticleJsonLd(article, articleUrl),
      buildBreadcrumbJsonLd([
        { name: 'Accueil', url: canonicalUrl('/') },
        { name: 'Blog', url: canonicalUrl('/blog') },
        { name: article.title, url: articleUrl },
      ]),
    ];
    const faqSchema = buildFAQPageJsonLd(article.faqJson, article.title, articleUrl);
    if (faqSchema) jsonLdSchemas.push(faqSchema);
    const howToSchema = buildHowToJsonLd(article, articleUrl);
    if (howToSchema) jsonLdSchemas.push(howToSchema);
    return jsonLdSchemas.filter(Boolean);
  }, [article, articleUrl]);

  useJsonLd(jsonLdData);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-text-light">Chargement…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <p className="text-red-600">Erreur : {error}</p>
      </div>
    );
  }
  if (!article) {
    return (
      <div className="px-6 lg:px-8 py-20 text-center">
        <p className="text-text-light">Article introuvable.</p>
        <Link to="/blog" className="text-primary text-sm mt-2 inline-block">Retour au blog</Link>
      </div>
    );
  }

  const otherArticles = articles.filter(a => a.id !== article.id).slice(0, 3);
  const shareUrl = encodeURIComponent(articleUrl);
  const shareTitle = encodeURIComponent(article.title);

  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm text-text-light mb-8 flex-wrap">
          <Link to="/" className="hover:text-text transition-colors">Accueil</Link>
          <span className="text-text-light/40">/</span>
          <Link to="/blog" className="hover:text-text transition-colors">Blog</Link>
          <span className="text-text-light/40">/</span>
          <span className="text-text truncate max-w-[250px]">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-10 lg:gap-12">
          <article>
            <p className="text-xs text-primary font-medium mb-3">{article.category}</p>
            <h1 className="font-display text-3xl sm:text-4xl text-text leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-4 text-sm text-text-light">
              <div>
                <span className="font-medium text-text">{article.author}</span>
                {article.authorInfo?.titre && (
                  <span className="text-text-light"> · {article.authorInfo.titre}</span>
                )}
              </div>
              <span>{new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {article.readTime} min</span>
            </div>
            {article.authorInfo?.bio && (
              <p className="mt-3 text-sm text-text-light leading-relaxed max-w-xl">
                {article.authorInfo.bio}
              </p>
            )}

            <div className="mt-8 aspect-[2/1] rounded-sm overflow-hidden bg-bg-warm">
              <img
                src={getSafeImageSrc(article.image)}
                alt={article.title}
                onError={handleMediaImageError}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-10">
              {Array.isArray(article.contentJson) && article.contentJson.length > 0 ? (
                <ArticleBlocks blocks={article.contentJson} recipes={recipes} />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-[18px] text-text-light leading-relaxed whitespace-pre-line">
                    {article.content}
                  </p>
                </div>
              )}
            </div>

            {/* Comments placeholder */}
            <div className="mt-16 pt-8 border-t border-border">
              <h2 className="text-xs uppercase tracking-[0.2em] text-primary mb-6">Commentaires</h2>
              <div className="bg-bg-warm rounded-sm p-6 text-center">
                <p className="text-sm text-text-light">
                  Les commentaires seront disponibles prochainement.
                </p>
                <p className="text-xs text-text-light/60 mt-1">
                  Connecte-toi pour être notifié de l'ouverture.
                </p>
              </div>
            </div>
          </article>

          <aside className="lg:pt-14">
            <div className="lg:sticky lg:top-24 space-y-8">
              <section className="rounded-sm border border-border p-4">
                <h2 className="text-xs uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                  <Share2 size={14} /> Partager
                </h2>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs rounded-sm bg-bg-warm hover:bg-bg-warm/80 text-text-light transition-colors"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs rounded-sm bg-bg-warm hover:bg-bg-warm/80 text-text-light transition-colors"
                  >
                    X / Twitter
                  </a>
                  <a
                    href={`mailto:?subject=${shareTitle}&body=${shareUrl}`}
                    className="px-3 py-1.5 text-xs rounded-sm bg-bg-warm hover:bg-bg-warm/80 text-text-light transition-colors"
                  >
                    Email
                  </a>
                </div>
              </section>

              {otherArticles.length > 0 && (
                <section>
                  <h2 className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Articles liés</h2>
                  <div className="space-y-4">
                    {otherArticles.map(a => (
                      <Link key={a.id} to={`/blog/${getSlug(a.title)}`} className="group block">
                        <div className="aspect-[3/2] rounded-sm overflow-hidden bg-bg-warm">
                          <img
                            src={getSafeImageSrc(a.image)}
                            alt={a.title}
                            onError={handleMediaImageError}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-text group-hover:text-primary transition-colors leading-snug">
                          {a.title}
                        </h3>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
