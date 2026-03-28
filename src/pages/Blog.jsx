import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { canonicalUrl } from '../lib/seo';
import { getSlug } from '../lib/slug';
import { blogCategories } from '../data/blogCategories';
import BlogSkeleton from '../components/skeleton/BlogSkeleton';
import { getSafeImageSrc, handleMediaImageError, getOptimizedImageUrl } from '../lib/imageFallback';

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function Blog() {
  usePageMeta({
    title: 'Blog nutrition végétale & performance sportive',
    description: 'Conseils nutrition sportive végétale, guides meal prep végétarien, témoignages et comparatifs pour sportifs végétariens et végétaliens.',
    canonical: canonicalUrl('/blog'),
  });
  const { articles, loading, error } = useData();
  const [activeCategory, setActiveCategory] = useState('tous');

  const filtered = activeCategory === 'tous'
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  const featured = articles[0];
  const rest = filtered.filter((a) => a.id !== featured?.id);

  // Compte par catégorie
  const countByCategory = blogCategories.reduce((acc, cat) => {
    acc[cat.id] = cat.id === 'tous' ? articles.length : articles.filter((a) => a.category === cat.id).length;
    return acc;
  }, {});

  if (loading) return <BlogSkeleton />;
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-red-600">Erreur : {error}</p>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen size={16} className="text-primary" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Blog</p>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-text leading-tight">
            Nutrition vegetale & performance sportive
          </h1>
          <p className="mt-3 text-sm text-text-light leading-relaxed">
            Conseils, guides et retours d&apos;experience pour optimiser ta nutrition vegetale en tant que sportif.
          </p>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
          {blogCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activeCategory === cat.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-text-light border border-border hover:border-primary/30 hover:text-text'
              }`}
            >
              {cat.label}
              <span className={`text-[11px] tabular-nums ${
                activeCategory === cat.id ? 'text-white/70' : 'text-text-light/50'
              }`}>
                {countByCategory[cat.id] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Featured */}
        {activeCategory === 'tous' && featured && (
          <Link
            to={`/blog/${featured.id}/${getSlug(featured.title)}`}
            className="block group mb-14"
          >
            <div className="rounded-2xl overflow-hidden border border-border bg-white shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="aspect-[3/2] lg:aspect-auto lg:min-h-[320px] overflow-hidden bg-bg-warm relative">
                  <img
                    src={getOptimizedImageUrl(getSafeImageSrc(featured.image), 600)}
                    alt={featured.title}
                    onError={handleMediaImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    width="600"
                    height="400"
                    decoding="async"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-primary shadow-sm">
                      {featured.category}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-6 lg:p-10">
                  <p className="text-xs text-text-light mb-3">{formatDate(featured.date)}</p>
                  <h2 className="font-display text-2xl sm:text-3xl text-text group-hover:text-primary transition-colors leading-tight">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-sm text-text-light leading-relaxed line-clamp-3">
                    {featured.excerpt}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-text-light">
                      {featured.author && <span className="font-medium text-text">{featured.author}</span>}
                      <span className="flex items-center gap-1"><Clock size={12} /> {featured.readTime} min de lecture</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Lire <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Grid */}
        {rest.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {rest.map(article => (
              <Link
                key={article.id}
                to={`/blog/${article.id}/${getSlug(article.title)}`}
                className="group rounded-2xl overflow-hidden border border-border bg-white shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-[3/2] overflow-hidden bg-bg-warm relative">
                  <img
                    src={getOptimizedImageUrl(getSafeImageSrc(article.image), 400)}
                    alt={article.title}
                    onError={handleMediaImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="267"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-primary">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-text-light mb-2">{formatDate(article.date)}</p>
                  <h3 className="text-[15px] font-medium text-text group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-xs text-text-light leading-relaxed line-clamp-2 flex-1">
                    {article.excerpt}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-text-light">
                    <div className="flex items-center gap-3">
                      {article.author && <span className="font-medium text-text">{article.author}</span>}
                      <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime} min</span>
                    </div>
                    <ArrowRight size={14} className="text-text-light/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen size={32} className="text-text-light/30 mx-auto mb-3" />
            <p className="text-sm text-text-light">Aucun article dans cette categorie pour le moment.</p>
            <button
              onClick={() => setActiveCategory('tous')}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Voir tous les articles
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
