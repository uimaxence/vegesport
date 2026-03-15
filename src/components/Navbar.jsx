import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User, Shield } from 'lucide-react';
import { isAdminUser } from '../lib/admin';

export default function Navbar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const showAdmin = isAdminUser(user);

  const links = [
    { path: '/', label: 'Accueil' },
    { path: '/recettes', label: 'Recettes' },
    { path: '/planning', label: 'Planning' },
    { path: '/blog', label: 'Blog' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" aria-label="et si mamie était végé ?">
            <img src="/logo.svg" alt="et si mamie était végé ?" className="h-9 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm tracking-wide transition-colors ${
                  isActive(link.path)
                    ? 'text-primary font-medium'
                    : 'text-text-light hover:text-text'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {showAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm text-text-light hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
              >
                <Shield size={18} />
                Admin
              </Link>
            )}
            <Link to="/recettes" className="p-2 text-text-light hover:text-text transition-colors">
              <Search size={18} />
            </Link>
            <Link
              to={user ? '/profil' : '/connexion'}
              className={`flex items-center gap-2 text-sm transition-colors rounded-lg px-3 py-2 ${
                user
                  ? 'bg-secondary/10 text-secondary font-medium hover:bg-secondary/15 border border-secondary/20'
                  : 'text-text-light hover:text-text'
              }`}
            >
              <User size={18} />
              <span>{user ? (user.name ? `${user.name} · Mon profil` : 'Mon profil') : 'Connexion'}</span>
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-text-light"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-bg">
          <div className="px-6 py-4 space-y-3">
            {links.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-sm ${
                  isActive(link.path) ? 'text-primary font-medium' : 'text-text-light'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {showAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block py-2 text-sm text-text-light"
              >
                Admin
              </Link>
            )}
            <Link
              to={user ? '/profil' : '/connexion'}
              onClick={() => setIsOpen(false)}
              className={`block py-2 text-sm ${user ? 'text-secondary font-medium' : 'text-text-light'}`}
            >
              {user ? (user.name ? `${user.name} · Mon profil` : 'Mon profil') : 'Connexion'}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
