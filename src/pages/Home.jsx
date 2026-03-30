import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Flame } from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { useJsonLd } from '../hooks/useJsonLd';
import { canonicalUrl, buildWebSiteJsonLd } from '../lib/seo';
import RecipeCard from '../components/RecipeCard';
import { getSlug } from '../lib/slug';
import vuePlanning from '../assets/vue-planning.webp';
import { getSafeImageSrc, handleMediaImageError, getOptimizedImageUrl } from '../lib/imageFallback';

function HeroRecipeCard({ recipe }) {
  return (
    <Link
      to={`/recettes/${getSlug(recipe.title)}`}
      className="group flex-shrink-0 w-[220px] snap-start block rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 relative"
    >
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={getOptimizedImageUrl(getSafeImageSrc(recipe.image), 400)}
          alt={recipe.title}
          onError={handleMediaImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
          decoding="async"
          width="400"
          height="533"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-12">
        <h3 className="font-display text-sm text-white leading-snug line-clamp-2">
          {recipe.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/75 font-accent">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {recipe.time} min
          </span>
          <span className="flex items-center gap-1">
            <Flame size={10} className="text-primary-light" />
            {recipe.calories} kcal
          </span>
        </div>
      </div>
    </Link>
  );
}

const categoryShowcase = [
  { label: "Riches en protéines", objective: "masse" },
  { label: "Énergie rapide", objective: "endurance" },
  { label: "Récupération musculaire", objective: "masse" },
  { label: "100 % végétal", objective: "sante" },
  { label: "Sans cuisson", tag: "#SansCuisson" },
  { label: "Léger et détox", objective: "seche" },
  { label: "Encas sains", category: "collation" },
];

export default function Home() {
  usePageMeta({
    title: 'et si mamie était végé ? — Recettes végétariennes protéinées',
    description: 'Recettes végétariennes et végétaliennes riches en protéines pour sportifs. Planning repas hebdomadaire personnalisé, liste de courses automatique et conseils nutrition sportive végétale.',
    fullTitle: true,
    canonical: canonicalUrl('/'),
    type: 'website',
  });
  useJsonLd(buildWebSiteJsonLd());
  const { recipes, articles, loading, error } = useData();

  function getCategoryCount(cat) {
    if (cat.objective) return recipes.filter(r => r.objective.includes(cat.objective)).length;
    if (cat.tag) return recipes.filter(r => r.tags.includes(cat.tag)).length;
    if (cat.category) return recipes.filter(r => r.category === cat.category).length;
    return 0;
  }

  const heroRecipes = recipes.slice(0, 4);
  const featuredRecipes = recipes.slice(0, 3);
  const latestArticles = articles.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-light">Chargement…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-red-600">Erreur : {error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-warm via-bg to-bg" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.06] rounded-full blur-[100px] animate-[hero-float_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-secondary/[0.06] rounded-full blur-[80px] animate-[hero-float_7s_ease-in-out_infinite_0.5s]" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          {/* Top: text content centered */}
          <div className="max-w-3xl mx-auto text-center mb-14 lg:mb-20">
            <p className="font-accent text-xs uppercase tracking-[0.25em] text-primary mb-6 animate-[hero-text-in_0.6s_ease-out]">
              Nutrition végétale pour sportifs
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-text leading-[1.08] tracking-tight animate-[hero-text-in_0.6s_ease-out_0.1s_both]">
              Tes repas végétariens protéinés,{' '}
              <span className="font-accent italic text-primary">planifiés en 2 clics</span>
            </h1>
            <p className="mt-6 text-base lg:text-lg text-text-light leading-relaxed max-w-xl mx-auto animate-[hero-text-in_0.6s_ease-out_0.2s_both]">
              Recettes optimisées pour la performance sportive. Planning personnalisé, liste de courses automatique et suivi des macros.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center animate-[hero-text-in_0.6s_ease-out_0.3s_both]">
              <Link
                to="/planning"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
              >
                Créer mon planning
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/recettes"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white border border-border text-sm font-medium rounded-full text-text hover:border-text transition-colors shadow-sm"
              >
                Découvrir les recettes
              </Link>
            </div>
          </div>

          {/* Bottom: recipe cards carousel */}
          <div className="animate-[hero-text-in_0.6s_ease-out_0.4s_both]">
            <div
              className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 snap-x snap-mandatory lg:justify-center"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {heroRecipes.map((recipe) => (
                <HeroRecipeCard key={recipe.id} recipe={recipe} />
              ))}
              <Link
                to="/recettes"
                className="flex-shrink-0 w-[220px] snap-start flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 aspect-[3/4]"
              >
                <span className="font-display text-sm text-text text-center px-4">Voir toutes les recettes</span>
                <ArrowRight size={20} className="text-primary" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Catégories centrées avec effectifs */}
      <section className="px-6 lg:px-8 py-20 bg-bg-warm relative">
        <div className="max-w-3xl mx-auto text-center">
          <p className="recipe-section-title">Catégories</p>
          <div className="deco-wave mx-auto mb-12" />
          <div className="space-y-3">
            {categoryShowcase.map((cat, i) => {
              const count = getCategoryCount(cat);
              const href = cat.objective
                ? `/recettes?objectif=${cat.objective}`
                : cat.tag
                  ? `/recettes?tag=${cat.tag}`
                  : `/recettes?categorie=${cat.category}`;
              return (
                <Link
                  key={i}
                  to={href}
                  className="flex items-center justify-center gap-3 group"
                >
                  <span className="font-display text-3xl sm:text-4xl lg:text-5xl text-text group-hover:text-primary transition-colors duration-300 leading-tight">
                    {cat.label}
                  </span>
                  <span className="font-accent text-sm font-medium text-primary tabular-nums">
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="recipe-section-title">Sélection</p>
              <div className="deco-wave mb-2" />
              <h2 className="font-display text-3xl sm:text-4xl text-text">Nos meilleures recettes végétariennes</h2>
              <p className="recipe-annotation mt-1">Comme dans un carnet de recettes de grand-mère</p>
            </div>
            <Link to="/recettes" className="hidden sm:flex items-center gap-1 text-sm text-text-light hover:text-primary transition-colors">
              Toutes les recettes <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          <Link to="/recettes" className="sm:hidden flex items-center gap-1 text-sm text-text-light hover:text-primary transition-colors mt-6">
            Voir toutes nos recettes végétariennes <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Planning CTA */}
      <section className="bg-text text-white pt-24 pb-0 overflow-hidden">
        {/* Contenu centré */}
        <div className="px-6 lg:px-8 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-[11px] font-accent tracking-widest uppercase text-white/50 mb-8">
            Planning repas végétarien
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
            Ton programme alimentaire végétarien{' '}
            <span className="text-primary-light">sur mesure</span>,{' '}
            semaine par semaine
          </h2>
          <p className="mt-6 text-white/55 text-base leading-relaxed max-w-xl mx-auto">
            Prise de masse, sèche ou endurance : choisis ton objectif sportif et ton régime.
            On génère 7 jours de menus équilibrés avec la liste de courses complète.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/planning"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-light transition-colors"
            >
              Créer mon planning
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/recettes"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/20 text-white/80 text-sm font-medium rounded-full hover:border-white/50 hover:text-white transition-colors"
            >
              Voir les recettes
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
            {[
              'Planning 7 jours personnalisé',
              'Liste de courses automatique',
              'Macros calculées en temps réel',
            ].map((feat) => (
              <span key={feat} className="flex items-center gap-2 text-sm text-white/45 font-accent">
                <span className="w-1 h-1 rounded-full bg-primary-light flex-shrink-0" />
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Screenshot du planning — flotte en bas de la section */}
        <div className="relative mt-16 px-6 lg:px-16 max-w-6xl mx-auto">
          <div className="rounded-t-2xl overflow-hidden shadow-[0_-8px_60px_rgba(0,0,0,0.5)] border border-white/10 border-b-0">
            <img
              src={vuePlanning}
              alt="Vue du planning hebdomadaire"
              className="w-full block"
              width="1200"
              height="545"
              loading="lazy"
              decoding="async"
            />
          </div>
          {/* Dégradé de fin de section */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-transparent to-[#1A1A1A] pointer-events-none" />
        </div>
      </section>

      {/* Blog */}
      <section className="px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="recipe-section-title">Blog</p>
              <div className="deco-wave mb-2" />
              <h2 className="font-display text-3xl sm:text-4xl text-text">Conseils nutrition sportive végétale</h2>
            </div>
            <Link to="/blog" className="hidden sm:flex items-center gap-1 text-sm text-text-light hover:text-primary transition-colors">
              Tous les articles <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {latestArticles.map(article => (
              <Link key={article.id} to={`/blog/${article.id}/${getSlug(article.title)}`} className="group">
                <div className="aspect-[3/2] rounded-sm overflow-hidden bg-bg-warm">
                  <img
                    src={getOptimizedImageUrl(getSafeImageSrc(article.image), 300)}
                    srcSet={`${getOptimizedImageUrl(getSafeImageSrc(article.image), 300)} 300w, ${getOptimizedImageUrl(getSafeImageSrc(article.image), 400)} 400w`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    alt={article.title}
                    onError={handleMediaImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="267"
                  />
                </div>
                <div className="mt-3">
                  <p className="text-xs text-primary font-medium">{article.category}</p>
                  <h3 className="mt-1 text-sm font-medium text-text group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-text-light">{article.readTime} min de lecture</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
