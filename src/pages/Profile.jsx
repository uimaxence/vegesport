import { Navigate, Link } from 'react-router-dom';
import { Heart, Calendar, Award, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { objectives } from '../data/recipes';
import RecipeCard from '../components/RecipeCard';

export default function Profile({ user, favorites, savedPlannings }) {
  usePageMeta('Mon profil', 'Tes recettes favorites, plannings sauvegardés et badges et si mamie était végé ?.');
  const { signOut } = useAuth();
  const { recipes, loading, error } = useData();
  if (!user) {
    return <Navigate to="/connexion" />;
  }

  const favoriteRecipes = recipes.filter((r) => favorites.includes(r.id));

  const badges = [
    { label: 'Inscrit', earned: true },
    { label: '5 recettes vues', earned: favorites.length >= 5 },
    { label: '10 recettes testées', earned: false },
    { label: '1 mois d\'utilisation', earned: false },
    { label: 'As de la préparation repas', earned: savedPlannings.length >= 1 },
  ];

  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display text-xl">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary mb-1">Mon profil</p>
              <h1 className="font-display text-3xl sm:text-4xl text-text">
                Salut, {user.name}
              </h1>
              <p className="text-sm text-text-light mt-1">{user.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-sm text-text-light hover:text-primary transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-bg-warm rounded-sm p-4 text-center">
            <p className="font-display text-2xl text-primary">{favorites.length}</p>
            <p className="text-xs text-text-light mt-1">Favoris</p>
          </div>
          <div className="bg-bg-warm rounded-sm p-4 text-center">
            <p className="font-display text-2xl text-primary">{savedPlannings.length}</p>
            <p className="text-xs text-text-light mt-1">Plannings</p>
          </div>
          <div className="bg-bg-warm rounded-sm p-4 text-center">
            <p className="font-display text-2xl text-primary">{badges.filter(b => b.earned).length}</p>
            <p className="text-xs text-text-light mt-1">Badges</p>
          </div>
        </div>

        {/* Badges */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs ${
                  badge.earned
                    ? 'bg-primary/10 text-primary'
                    : 'bg-bg-warm text-text-light/40'
                }`}
              >
                <Award size={12} />
                {badge.label}
              </div>
            ))}
          </div>
        </div>

        {/* Favorites */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-[0.2em] text-primary mb-4">
            Mes recettes favorites
          </h2>
          {favoriteRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="bg-bg-warm rounded-sm p-6 text-center">
              <Heart size={24} className="mx-auto text-text-light/30 mb-2" />
              <p className="text-sm text-text-light">Aucune recette en favori pour l'instant.</p>
              <Link to="/recettes" className="text-xs text-primary hover:text-primary-dark mt-1 inline-block">
                Découvrir les recettes
              </Link>
            </div>
          )}
        </div>

        {/* Saved Plannings */}
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-primary mb-4">
            Mes plannings sauvegardés
          </h2>
          {savedPlannings.length > 0 ? (
            <div className="space-y-2">
              {savedPlannings.map((p, i) => (
                <div key={i} className="bg-bg-warm rounded-sm p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">Planning du {p.date}</p>
                    <p className="text-xs text-text-light mt-0.5">
                      Objectif : {objectives.find(o => o.id === p.objective)?.label ?? p.objective}
                    </p>
                  </div>
                  <Calendar size={16} className="text-text-light" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-bg-warm rounded-sm p-6 text-center">
              <Calendar size={24} className="mx-auto text-text-light/30 mb-2" />
              <p className="text-sm text-text-light">Aucun planning sauvegardé.</p>
              <Link to="/planning" className="text-xs text-primary hover:text-primary-dark mt-1 inline-block">
                Créer un planning
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
