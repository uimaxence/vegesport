import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { getSlug } from '../lib/slug';

export default function RecipeCard({ recipe, isFavorite, toggleFavorite, layout = 'grid' }) {
  if (layout === 'compact') {
    return (
      <Link to={`/recettes/${getSlug(recipe.title)}`} className="group flex items-center gap-4 py-3">
        <div className="w-16 h-16 rounded-sm overflow-hidden flex-shrink-0 bg-[#F5F0EB]">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-primary truncate group-hover:text-primary-dark transition-colors">
            {recipe.title}
          </h3>
          <p className="text-xs text-text-light mt-0.5">
            {recipe.time} min · {recipe.calories} kcal
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div className="group bg-[#F8F6F3] rounded-sm overflow-hidden border border-[#E8E4DF] hover:border-primary/30 transition-colors">
      <Link to={`/recettes/${getSlug(recipe.title)}`} className="block">
        {/* Image : environ 2/3 de la carte */}
        <div className="aspect-[4/3] relative bg-white overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {toggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(recipe.id);
              }}
              className="absolute top-3 right-3 p-2 rounded-sm bg-white/90 hover:bg-white transition-colors shadow-sm"
            >
              <Heart
                size={16}
                className={isFavorite ? 'fill-primary text-primary' : 'text-text-light'}
              />
            </button>
          )}
        </div>
        {/* Contenu : titre, infos, tags */}
        <div className="p-4">
          <h3 className="font-semibold text-primary text-base leading-snug">
            {recipe.title}
          </h3>
          <p className="mt-1 text-sm font-semibold text-primary/90">
            {recipe.time} min · {recipe.calories} kcal
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {recipe.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2.5 py-1 rounded-sm bg-white border border-primary/40 text-primary"
              >
                {tag.replace('#', '')}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}
