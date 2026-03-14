import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Page de retour OAuth : Supabase redirige ici avec #access_token=... ou ?code=...
 * On laisse le client traiter l'URL (detectSessionInUrl), puis on redirige vers /profil.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      navigate('/connexion', { replace: true });
      return;
    }

    const run = async () => {
      const hash = window.location.hash?.slice(1) || '';
      const params = new URLSearchParams(hash || window.location.search);

      if (params.get('error_description') || params.get('error')) {
        setError(params.get('error_description') || params.get('error') || 'Erreur de connexion');
        return;
      }

      const code = params.get('code');
      if (code) {
        try {
          const { error: err } = await supabase.auth.exchangeCodeForSession(code);
          if (err) throw err;
        } catch (e) {
          setError(e?.message || 'Échec de la connexion');
          return;
        }
      }

      let { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/profil', { replace: true });
        return;
      }

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        try {
          const { error: err } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!err) {
            navigate('/profil', { replace: true });
            return;
          }
        } catch {
          // ignore, fallback below
        }
      }

      setTimeout(async () => {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s) navigate('/profil', { replace: true });
        else setError('Session introuvable. Réessaie de te connecter.');
      }, 800);
    };

    run();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-6">
        <p className="text-red-500 text-center mb-4">{error}</p>
        <a href="/connexion" className="text-primary font-medium hover:underline">
          Retour à la connexion
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-6">
      <Loader2 size={32} className="animate-spin text-primary mb-4" />
      <p className="text-text-light">Connexion en cours…</p>
    </div>
  );
}
