import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
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

export default function BlogArticle() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const { articles, recipes, loading, error } = useData();
  const article = articles.find((a) => a.id === parseInt(id, 10));
  const canonicalSlug = article ? getSlug(article.title) : '';

  // Rediriger vers l'URL canonique avec le slug si absent ou incorrect
  useEffect(() => {
    if (!article || !canonicalSlug) return;
    if (slug !== canonicalSlug) {
      navigate(`/blog/${id}/${canonicalSlug}`, { replace: true });
    }
  }, [article, id, slug, canonicalSlug, navigate]);

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

  const articleUrl = canonicalUrl(`/blog/${article.id}/${canonicalSlug}`);

  usePageMeta({
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt || (article.content ? article.content.slice(0, 155) + '…' : undefined),
    fullTitle: Boolean(article.metaTitle),
    canonical: articleUrl,
    image: article.image,
    type: 'article',
  });

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
  useJsonLd(jsonLdSchemas.filter(Boolean));

  const otherArticles = articles.filter(a => a.id !== article.id).slice(0, 3);

  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm text-text-light mb-8 flex-wrap">
          <Link to="/" className="hover:text-text transition-colors">Accueil</Link>
          <span className="text-text-light/40">/</span>
          <Link to="/blog" className="hover:text-text transition-colors">Blog</Link>
          <span className="text-text-light/40">/</span>
          <span className="text-text truncate max-w-[250px]">{article.title}</span>
        </nav>

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
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        </div>

        <div className="mt-10">
          {Array.isArray(article.contentJson) && article.contentJson.length > 0 ? (
            <ArticleBlocks blocks={article.contentJson} recipes={recipes} />
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className="text-text-light leading-relaxed whitespace-pre-line">
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

        {/* More articles */}
        {otherArticles.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl text-text mb-8">À lire aussi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {otherArticles.map(a => (
                <Link key={a.id} to={`/blog/${a.id}/${getSlug(a.title)}`} className="group">
                  <div className="aspect-[3/2] rounded-sm overflow-hidden bg-bg-warm">
                    <img
                      src={a.image}
                      alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-text group-hover:text-primary transition-colors">
                    {a.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
