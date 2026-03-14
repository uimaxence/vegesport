import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Flame } from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePageMeta } from '../hooks/usePageMeta';
import RecipeCard from '../components/RecipeCard';
import { getSlug } from '../lib/slug';
import vuePlanning from '../assets/vue planning.png';

function HeroRecipeCard({ recipe }) {
  return (
    <Link
      to={`/recettes/${getSlug(recipe.title)}`}
      className="group flex-shrink-0 w-[200px] block bg-white rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-[3/4] overflow-hidden bg-bg-warm">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-2.5">
        <h3 className="font-display text-xs text-text leading-snug line-clamp-2">
          {recipe.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-text-light font-accent">
          <span className="flex items-center gap-0.5">
            <Clock size={9} />
            {recipe.time} min
          </span>
          <span className="flex items-center gap-0.5">
            <Flame size={9} className="text-primary" />
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
  usePageMeta('et si mamie était végé ? — Recettes végétariennes', 'Recettes végétariennes et végétaliennes riches en protéines pour sportifs. Planning repas hebdomadaire, liste de courses et conseils nutrition sportive végétale.', true);
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

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-20 pb-12 lg:pt-28 lg:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-warm via-bg to-primary/5 animate-[hero-gradient_8s_ease-in-out_infinite]" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-[hero-float_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-[hero-float_7s_ease-in-out_infinite_0.5s]" />

        {/* Titre centré — padding symétrique */}
        <div className="relative px-10 lg:px-24">
          <div className="max-w-7xl mx-auto text-center mb-12 lg:mb-16">
            <p className="font-accent text-xs uppercase tracking-[0.2em] text-primary mb-5 animate-[hero-text-in_0.6s_ease-out]">
              Nutrition végétale pour sportifs
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text leading-[1.1] tracking-tight animate-[hero-text-in_0.6s_ease-out_0.1s_both]">
              Tes repas végétariens protéinés,{' '}
              <span className="font-accent italic text-primary">planifiés en 2 clics</span>
            </h1>
          </div>
        </div>

        {/* Bas : padding gauche uniquement pour que les cartes débordent à droite */}
        <div className="relative flex flex-col lg:flex-row items-start gap-10 lg:gap-16 pl-10 lg:pl-24">
          {/* Gauche : description + boutons — prend plus de place */}
          <div className="flex-shrink-0 w-full lg:w-[440px] pr-10 lg:pr-0 animate-[hero-text-in_0.6s_ease-out_0.2s_both]">
            <p className="text-base text-text-light leading-relaxed">
              Recettes végétariennes et végétaliennes optimisées pour la performance sportive.
              Planning hebdomadaire personnalisé, liste de courses automatique et suivi des macronutriments.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                to="/planning"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-sm font-medium rounded-sm hover:bg-primary-dark transition-colors"
              >
                Créer mon planning
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/recettes"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-sm font-medium rounded-sm text-text hover:border-text transition-colors"
              >
                Découvrir les recettes
              </Link>
            </div>
          </div>

          {/* Droite : carousel — s'étend jusqu'au bord droit du viewport */}
          <div className="flex-1 min-w-0 overflow-hidden animate-[hero-text-in_0.6s_ease-out_0.35s_both]">
            <div
              className="flex gap-4 overflow-x-auto pb-3"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {heroRecipes.map((recipe) => (
                <HeroRecipeCard key={recipe.id} recipe={recipe} />
              ))}
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
              <Link key={article.id} to={`/blog/${article.id}`} className="group">
                <div className="aspect-[3/2] rounded-sm overflow-hidden bg-bg-warm">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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
