import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { canonicalUrl } from '../lib/seo';
import { FileText } from 'lucide-react';

export default function MentionsLegales() {
  usePageMeta({
    title: 'Mentions légales',
    description: 'Conditions d\'utilisation et mentions légales du site et si mamie était végé ?',
    canonical: canonicalUrl('/mentions-legales'),
  });

  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-primary mb-2">
          <FileText size={20} />
          <span className="text-xs uppercase tracking-wider font-medium">Mentions légales</span>
        </div>
        <h1 className="font-display text-3xl text-text mb-6">
          Conditions d&apos;utilisation
        </h1>

        <section className="prose prose-sm text-text-light space-y-4 mb-10">
          <p>
            <strong>Éditeur du site</strong> — et si mamie était végé ? — [À compléter : raison sociale, adresse, contact]
          </p>
          <p>
            <strong>Hébergement</strong> — [À compléter : hébergeur, adresse]
          </p>
          <p>
            L&apos;utilisation du site implique l&apos;acceptation des présentes conditions. Les recettes et contenus sont proposés à titre informatif. 
            Pour toute question sur tes données personnelles et tes droits, consulte la page{' '}
            <Link to="/donnees-personnelles" className="text-primary hover:underline">Données personnelles</Link>.
          </p>
        </section>

        <p className="text-center">
          <Link to="/" className="text-sm text-primary hover:underline">Retour à l&apos;accueil</Link>
        </p>
      </div>
    </div>
  );
}
