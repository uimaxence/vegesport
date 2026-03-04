import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePageMeta } from '../hooks/usePageMeta';
import RecipeCard from '../components/RecipeCard';

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
      {/* Hero avec animation */}
      <section className="relative px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-warm via-bg to-primary/5 animate-[hero-gradient_8s_ease-in-out_infinite]" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-[hero-float_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-[hero-float_7s_ease-in-out_infinite_0.5s]" />
        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-primary mb-6 animate-[hero-text-in_0.6s_ease-out]">
              Nutrition végétale pour sportifs
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text leading-[1.1] tracking-tight animate-[hero-text-in_0.6s_ease-out_0.1s_both]">
              Tes repas végétariens protéinés,{' '}
              <span className="italic text-primary">planifiés en 2 clics</span>
            </h1>
            <p className="mt-6 text-lg text-text-light leading-relaxed max-w-xl animate-[hero-text-in_0.6s_ease-out_0.2s_both]">
              Recettes végétariennes et végétaliennes optimisées pour la performance sportive.
              Planning hebdomadaire personnalisé, liste de courses automatique et suivi des macronutriments.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-[hero-text-in_0.6s_ease-out_0.3s_both]">
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
                  <span className="text-sm font-medium text-primary tabular-nums">
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
      <section className="px-6 lg:px-8 py-20 bg-text text-white">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-light mb-6">Planning repas végétarien</p>
          <h2 className="font-display text-3xl sm:text-4xl leading-tight">
            Ton programme alimentaire végétarien sur mesure, semaine par semaine
          </h2>
          <p className="mt-4 text-white/60 leading-relaxed">
            Prise de masse, sèche ou endurance : choisis ton objectif sportif et ton régime alimentaire.
            On génère 7 jours de menus végétariens équilibrés avec la liste de courses complète.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/planning"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-sm font-medium rounded-sm hover:bg-primary-light transition-colors"
            >
              Créer mon planning
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="font-display text-3xl text-primary-light">7</p>
              <p className="text-xs text-white/50 mt-1">jours de menus équilibrés</p>
            </div>
            <div>
              <p className="font-display text-3xl text-primary-light">28</p>
              <p className="text-xs text-white/50 mt-1">repas riches en protéines</p>
            </div>
            <div>
              <p className="font-display text-3xl text-primary-light">1</p>
              <p className="text-xs text-white/50 mt-1">liste de courses générée</p>
            </div>
          </div>
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
