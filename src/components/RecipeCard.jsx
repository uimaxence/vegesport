import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { getSlug } from '../lib/slug';

export default function RecipeCard({ recipe, isFavorite, toggleFavorite, layout = 'grid' }) {
  if (layout === 'compact') {
    return (
      <Link to={`/recettes/${getSlug(recipe.title)}`} className="group flex items-center gap-4 py-3 rounded-xl hover:bg-black/[0.03] transition-colors -mx-1 px-1">
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-black/5">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-text truncate group-hover:text-black transition-colors">
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
    <div className="group overflow-hidden recipe-card-frame relative rounded-xl">
      <Link to={`/recettes/${getSlug(recipe.title)}`} className="block">
        <div className="aspect-[4/3] relative bg-[rgb(0,0,0,0.04)] overflow-hidden rounded-t-xl">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {toggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(recipe.id);
              }}
              className="absolute top-3 right-3 p-2 rounded-lg bg-white/95 hover:bg-white transition-colors shadow-sm border border-black/5"
            >
              <Heart
                size={16}
                className={isFavorite ? 'fill-primary text-primary' : 'text-text-light'}
              />
            </button>
          )}
        </div>
        <div className="p-4 relative">
          <h3 className="font-display text-lg text-text leading-snug">
            {recipe.title}
          </h3>
          <p className="mt-1 text-sm font-medium text-text-light">
            {recipe.time} min · {recipe.calories} kcal
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {recipe.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-[15px] font-medium px-2.5 py-1 rounded-lg bg-[rgb(0,0,0,0.05)] border border-black/8 text-text"
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
