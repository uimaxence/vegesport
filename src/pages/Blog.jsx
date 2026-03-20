import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { canonicalUrl } from '../lib/seo';
import { getSlug } from '../lib/slug';
import { blogCategories } from '../data/blogCategories';
import BlogSkeleton from '../components/skeleton/BlogSkeleton';
import { getSafeImageSrc, handleMediaImageError } from '../lib/imageFallback';

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

  if (loading) return <BlogSkeleton />;
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <p className="text-red-600">Erreur : {error}</p>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Blog</p>
          <h1 className="font-display text-3xl sm:text-4xl text-text">Nutrition végétale & performance sportive</h1>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
          {blogCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-sm px-4 py-2 rounded-sm whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-bg-warm text-text-light hover:text-text'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured */}
        {activeCategory === 'tous' && featured && (
          <Link to={`/blog/${featured.id}/${getSlug(featured.title)}`} className="block group mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
              <div className="aspect-[3/2] rounded-sm overflow-hidden bg-bg-warm">
                <img
                  src={getSafeImageSrc(featured.image)}
                  alt={featured.title}
                  onError={handleMediaImageError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs text-primary font-medium mb-2">{featured.category}</p>
                <h2 className="font-display text-2xl sm:text-3xl text-text group-hover:text-primary transition-colors leading-tight">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm text-text-light leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-text-light">
                  <span>{featured.author}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {featured.readTime} min</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {rest.map(article => (
            <Link key={article.id} to={`/blog/${article.id}/${getSlug(article.title)}`} className="group">
              <div className="aspect-[3/2] rounded-sm overflow-hidden bg-bg-warm">
                <img
                  src={getSafeImageSrc(article.image)}
                  alt={article.title}
                  onError={handleMediaImageError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="mt-3">
                <p className="text-xs text-primary font-medium">{article.category}</p>
                <h3 className="mt-1 text-sm font-medium text-text group-hover:text-primary transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="mt-1.5 text-xs text-text-light line-clamp-2">{article.excerpt}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-text-light">
                  <span>{article.author}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
