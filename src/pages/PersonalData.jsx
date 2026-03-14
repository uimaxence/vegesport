import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Shield, Download, Trash2, ChevronRight } from 'lucide-react';

export default function PersonalData() {
  usePageMeta('Données personnelles', 'Gestion de tes données personnelles, consentements et droits RGPD — et si mamie était végé ?');
  const { user, consents, updateConsents } = useAuth();
  const [exportStatus, setExportStatus] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleConsentChange = (key, value) => {
    if (updateConsents) updateConsents({ [key]: value });
  };

  const handleExport = async () => {
    if (!user) return;
    setExportStatus('Préparation…');
    try {
      const { data: favs } = supabase ? await supabase.from('favorites').select('recipe_id').eq('user_id', user.id) : { data: [] };
      const { data: plans } = supabase ? await supabase.from('plannings').select('*').eq('user_id', user.id) : { data: [] };
      const exportData = {
        export_date: new Date().toISOString(),
        email: user.email,
        name: user.name,
        consentements: consents,
        favoris: favs || [],
        plannings: plans || [],
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vegeprot-donnees-${user.email.replace(/@.*/, '')}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus('Téléchargement lancé.');
    } catch (e) {
      setExportStatus('Erreur : ' + (e?.message || 'export impossible'));
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm !== 'SUPPRIMER' || !user?.id) return;
    setDeleteError('');
    // Suppression côté app (favoris, plannings, consentements) ; auth.users reste à supprimer côté admin / support
    if (supabase && isSupabaseConfigured()) {
      Promise.all([
        supabase.from('favorites').delete().eq('user_id', user.id),
        supabase.from('plannings').delete().eq('user_id', user.id),
        supabase.from('user_consents').delete().eq('user_id', user.id),
      ]).then(() => supabase.auth.signOut()).then(() => { setDeleteConfirm(''); window.location.href = '/'; }).catch((e) => setDeleteError(e?.message || 'Erreur. Contacte-nous.'));
    } else {
      setDeleteError('Pour supprimer ton compte, contacte-nous par email.');
    }
  };

  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Shield size={20} />
          <span className="text-xs uppercase tracking-wider font-medium">Données personnelles</span>
        </div>
        <h1 className="font-display text-3xl text-text mb-6">
          Politique de confidentialité &amp; gestion des données
        </h1>

        {/* Texte de politique (basique) */}
        <section className="prose prose-sm text-text-light mb-10">
          <p>
            Nous collectons les données nécessaires au fonctionnement du compte (email, prénom), à la sauvegarde de tes favoris et plannings, 
            et aux consentements que tu donnes à l&apos;inscription. Nous pouvons utiliser des cookies et des outils de mesure d&apos;audience. 
            En cas de publicité (ex. Google Ads) ou de partenariats mailing, nous ne ferons usage de ton email qu&apos;avec ton consentement explicite.
          </p>
          <p>
            Tu peux à tout moment modifier tes préférences ci-dessous, exporter tes données ou demander la suppression de ton compte.
          </p>
        </section>

        {!user ? (
          <div className="bg-bg-warm rounded-sm p-6 text-center">
            <p className="text-sm text-text-light mb-4">
              Connecte-toi pour gérer tes données et tes préférences de consentement.
            </p>
            <Link
              to="/connexion"
              className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
            >
              Se connecter
              <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            {/* Données affichées */}
            <section className="mb-10">
              <h2 className="text-xs uppercase tracking-wider text-primary mb-3">Données du compte</h2>
              <div className="bg-bg-warm rounded-sm p-4 space-y-2 text-sm">
                <p><span className="text-text-light">Email :</span> {user.email}</p>
                <p><span className="text-text-light">Prénom :</span> {user.name}</p>
              </div>
            </section>

            {/* Consentements */}
            <section className="mb-10">
              <h2 className="text-xs uppercase tracking-wider text-primary mb-3">Préférences de communication</h2>
              <div className="space-y-3 text-sm">
                <label className="flex items-center justify-between gap-4 p-3 bg-bg-warm rounded-sm cursor-pointer">
                  <span className="text-text">Newsletter (actualités du site)</span>
                  <input
                    type="checkbox"
                    checked={consents.newsletter ?? false}
                    onChange={(e) => handleConsentChange('newsletter', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                </label>
                <label className="flex items-center justify-between gap-4 p-3 bg-bg-warm rounded-sm cursor-pointer">
                  <span className="text-text">Publicité personnalisée (ex. Google Ads)</span>
                  <input
                    type="checkbox"
                    checked={consents.ads_personnalisation ?? false}
                    onChange={(e) => handleConsentChange('ads_personnalisation', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                </label>
                <label className="flex items-center justify-between gap-4 p-3 bg-bg-warm rounded-sm cursor-pointer">
                  <span className="text-text">Partage email avec partenaires (offres / mailing ciblés)</span>
                  <input
                    type="checkbox"
                    checked={consents.partage_partenaires ?? false}
                    onChange={(e) => handleConsentChange('partage_partenaires', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                </label>
              </div>
            </section>

            {/* Export */}
            <section className="mb-10">
              <h2 className="text-xs uppercase tracking-wider text-primary mb-3">Export des données</h2>
              <p className="text-sm text-text-light mb-3">
                Télécharge une copie de tes données (compte, consentements, favoris, plannings) au format JSON.
              </p>
              <button
                type="button"
                onClick={handleExport}
                disabled={!!exportStatus && exportStatus !== 'Téléchargement lancé.'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-bg-warm border border-border rounded-sm text-sm font-medium hover:border-text transition-colors disabled:opacity-60"
              >
                <Download size={16} />
                Exporter mes données
              </button>
              {exportStatus && <p className="text-xs text-text-light mt-2">{exportStatus}</p>}
            </section>

            {/* Suppression compte */}
            <section className="border-t border-border pt-10">
              <h2 className="text-xs uppercase tracking-wider text-red-600 mb-3">Suppression du compte</h2>
              <p className="text-sm text-text-light mb-3">
                La suppression de ton compte effacera définitivement tes données (favoris, plannings, consentements). 
                Cette action est irréversible.
              </p>
              <p className="text-xs text-text-light mb-2">
                Pour confirmer, saisis <strong>SUPPRIMER</strong> ci-dessous puis valide.
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full max-w-xs bg-bg-warm border border-border rounded-sm px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <br />
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'SUPPRIMER'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-sm text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />
                Supprimer mon compte
              </button>
              {deleteError && <p className="text-sm text-red-600 mt-2">{deleteError}</p>}
              <p className="text-xs text-text-light mt-3">
                Les données liées à ton compte (favoris, plannings, consentements) seront supprimées. Pour une suppression complète du compte (y compris authentification), contacte-nous par email.
              </p>
            </section>
          </>
        )}

        <p className="mt-10 text-center">
          <Link to="/" className="text-sm text-primary hover:underline">Retour à l&apos;accueil</Link>
        </p>
      </div>
    </div>
  );
}
