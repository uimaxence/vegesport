import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function Login() {
  usePageMeta({
    title: 'Connexion',
    description: 'Connecte-toi à ton compte et si mamie était végé ? pour sauvegarder tes favoris et tes plannings.',
    noindex: true,
  });
  const { user, setUserLocal } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptCgu, setAcceptCgu] = useState(false);
  const [consentNewsletter, setConsentNewsletter] = useState(false);
  const [consentAds, setConsentAds] = useState(false);
  const [consentPartenaires, setConsentPartenaires] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state && location.state.from) || '/profil';
  const planningIntent = location.state && location.state.planningIntent;
  const sessionExpired = new URLSearchParams(location.search).get('expired') === '1';

  useEffect(() => {
    if (user) {
      navigate(from, {
        replace: true,
        state: planningIntent ? { planningIntent } : undefined,
      });
    }
  }, [user, navigate, from, planningIntent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSupabaseConfigured() && supabase) {
      try {
        if (isLogin) {
          const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
          if (err) throw err;
          if (data?.session) {
            navigate(from, {
              replace: true,
              state: planningIntent ? { planningIntent } : undefined,
            });
            return;
          }
        } else {
          if (!acceptCgu) {
            setError('Tu dois accepter les conditions d\'utilisation et la politique de confidentialité pour t\'inscrire.');
            setLoading(false);
            return;
          }
          const { data, error: err } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name || email.split('@')[0],
                consent_newsletter: consentNewsletter,
                consent_ads_personnalisation: consentAds,
                consent_partage_partenaires: consentPartenaires,
              },
            },
          });
          if (err) throw err;
          if (data?.session) {
            navigate(from, {
              replace: true,
              state: planningIntent ? { planningIntent } : undefined,
            });
            return;
          }
          if (data?.user && !data.session) {
            setError('Vérifie ta boîte mail pour confirmer ton compte.');
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        setError(err.message || 'Erreur de connexion.');
        setLoading(false);
        return;
      }
    } else {
      setUserLocal?.({
        name: isLogin ? email.split('@')[0] : name,
        email,
      });
      navigate(from, {
        replace: true,
        state: planningIntent ? { planningIntent } : undefined,
      });
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setError('Connexion Google indisponible : vérifie que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont bien définis (ex. dans .env ou sur Vercel).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (err) throw err;
    } catch (err) {
      setError(err.message || 'Erreur de connexion avec Google.');
      setLoading(false);
    }
  };

  return (
    <div className="px-6 lg:px-8 py-20">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-10">
          <Link to="/" aria-label="et si mamie était végé ?">
            <img src="/logo.svg" alt="et si mamie était végé ?" className="h-12 w-auto mx-auto" />
          </Link>
          <p className="mt-2 text-sm text-text-light">
            {isLogin ? 'Content de te revoir' : 'Rejoins la communauté'}
          </p>
        </div>

        {sessionExpired && !error && (
          <p className="mb-4 text-sm text-amber-700 bg-amber-50 rounded-sm px-3 py-2">
            Ta session a expiré après inactivité. Reconnecte-toi pour continuer.
          </p>
        )}

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-sm px-3 py-2">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-text-light mb-1.5 block">
                Prénom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-bg-warm border-0 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ton prénom"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-text-light mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-bg-warm border-0 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="ton@email.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-text-light mb-1.5 block">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-bg-warm border-0 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div className="space-y-3 text-sm">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptCgu}
                  onChange={(e) => setAcceptCgu(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-text-light">
                  J&apos;accepte les{' '}
                  <Link to="/mentions-legales" className="text-primary hover:underline">conditions d&apos;utilisation</Link>
                  {' '}et la{' '}
                  <Link to="/donnees-personnelles" className="text-primary hover:underline">politique de confidentialité</Link>.
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentNewsletter}
                  onChange={(e) => setConsentNewsletter(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-text-light">Newsletter : recevoir les actualités du site (recettes, articles).</span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAds}
                  onChange={(e) => setConsentAds(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-text-light">Publicité personnalisée (ex. Google Ads) selon mes centres d&apos;intérêt.</span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentPartenaires}
                  onChange={(e) => setConsentPartenaires(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-text-light">Partage de mon email avec des partenaires pour offres et mailing ciblés (nutrition, sport, etc.).</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white text-sm font-medium rounded-sm hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {loading ? 'Chargement…' : isLogin ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-text-light hover:text-primary transition-colors"
          >
            {isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
          </button>
        </div>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-bg px-3 text-xs text-text-light">ou</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-3 border border-border text-sm rounded-sm hover:border-text transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>
        </div>
      </div>
    </div>
  );
}
