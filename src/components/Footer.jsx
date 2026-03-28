import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="inline-block">
              <img src="/logo.svg" alt="et si mamie était végé ?" className="h-10 w-auto" width="119" height="40" />
            </Link>
            <p className="mt-3 text-sm text-text-light leading-relaxed">
              Recettes végétariennes et végétaliennes riches en protéines, conçues pour les sportifs.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-text-light mb-4">Navigation</h4>
            <div className="space-y-2">
              <Link to="/recettes" className="block text-sm text-text-light hover:text-text transition-colors">Recettes</Link>
              <Link to="/planning" className="block text-sm text-text-light hover:text-text transition-colors">Planning</Link>
              <Link to="/blog" className="block text-sm text-text-light hover:text-text transition-colors">Blog</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-text-light mb-4">Par objectif</h4>
            <div className="space-y-2">
              <Link to="/recettes?objectif=masse" className="block text-sm text-text-light hover:text-text transition-colors">Recettes prise de masse</Link>
              <Link to="/recettes?objectif=seche" className="block text-sm text-text-light hover:text-text transition-colors">Recettes sèche</Link>
              <Link to="/recettes?objectif=endurance" className="block text-sm text-text-light hover:text-text transition-colors">Recettes endurance</Link>
              <Link to="/recettes?objectif=sante" className="block text-sm text-text-light hover:text-text transition-colors">Recettes santé</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-text-light mb-4">Soutenir</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-text-light hover:text-text transition-colors">Ko-fi</a>
              <a href="#" className="block text-sm text-text-light hover:text-text transition-colors">PayPal</a>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center recipe-annotation text-text-light/80 text-lg">
          Recettes de grand-mère, version sportive et 100 % végétale.
        </p>
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-light">
            &copy; {new Date().getFullYear()} et si mamie était végé ? — Recettes végétariennes.
          </p>
          <div className="flex items-center gap-4 text-xs text-text-light">
            <Link to="/mentions-legales" className="hover:text-text transition-colors">Mentions légales</Link>
            <Link to="/donnees-personnelles" className="hover:text-text transition-colors">Données personnelles</Link>
            <span>by M+&copy;</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
