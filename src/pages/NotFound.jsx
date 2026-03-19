import { Link } from 'react-router-dom';
import { Home, Search, BookOpen, Calendar } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export default function NotFound() {
  usePageMeta({
    title: 'Page introuvable (404)',
    description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
    noindex: true,
  });

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-8xl font-display text-primary/20 mb-4 select-none">404</p>
        <h1 className="font-display text-2xl sm:text-3xl text-text mb-3">
          Page introuvable
        </h1>
        <p className="text-text-light mb-8 leading-relaxed">
          Cette page n&apos;existe pas ou a été déplacée. Pas de panique, il y a plein de recettes à découvrir !
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          <Link
            to="/"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-border hover:border-primary hover:shadow-sm transition-all text-sm font-medium text-text"
          >
            <Home size={20} className="text-primary" />
            Accueil
          </Link>
          <Link
            to="/recettes"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-border hover:border-primary hover:shadow-sm transition-all text-sm font-medium text-text"
          >
            <BookOpen size={20} className="text-primary" />
            Recettes
          </Link>
          <Link
            to="/planning"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-border hover:border-primary hover:shadow-sm transition-all text-sm font-medium text-text"
          >
            <Calendar size={20} className="text-primary" />
            Planning
          </Link>
          <Link
            to="/blog"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-border hover:border-primary hover:shadow-sm transition-all text-sm font-medium text-text"
          >
            <Search size={20} className="text-primary" />
            Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
