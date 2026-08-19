import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { canonicalUrl } from '../lib/seo';
import RecipeCard from '../components/RecipeCard';

/**
 * Page Ravitaillement — hub du cluster « ravito fait maison » (avant / pendant / après).
 * Registre visuel « Route & données » : voir design-system.md §0 et §23.
 */

const PHASES = [
  {
    id: 'avant',
    label: 'Avant la sortie',
    title: 'Charger les batteries',
    repere: '1–4 g de glucides / kg · 1 à 4 h avant le départ',
    description:
      "Un repas digeste, riche en glucides complexes, pauvre en fibres brutes juste avant l'effort. Le petit déjeuner d'avant sortie longue se prépare la veille si besoin.",
    filter: (r) => (r.tags || []).includes('#AvantEffort'),
    fallback: (r) =>
      (r.objective || []).includes('endurance') &&
      (r.category === 'petit-dejeuner' || r.category === 'dejeuner') &&
      !(r.tags || []).includes('#PostEntraînement'),
  },
  {
    id: 'pendant',
    label: 'Pendant l’effort',
    title: 'Le ravito de la musette',
    repere: '30–90 g de glucides / heure selon l’intensité et la durée',
    description:
      'Barres, bouchées et boissons maison : moins chères que les gels industriels, des ingrédients qu’on reconnaît, et un goût qui donne envie de sortir la musette.',
    filter: (r) => (r.tags || []).includes('#PendantEffort'),
    fallback: (r) => r.category === 'collation',
  },
  {
    id: 'apres',
    label: 'Après la sortie',
    title: 'Récupérer et reconstruire',
    repere: '~20–30 g de protéines + glucides dans les 2 h qui suivent',
    description:
      'La fenêtre de récupération : reconstituer le glycogène et apporter les protéines dont les muscles ont besoin — 100 % végétal.',
    filter: (r) => (r.tags || []).includes('#PostEntraînement'),
  },
];

export default function Ravito() {
  usePageMeta({
    title: 'Ravitaillement vélo fait maison : barres, boissons et gels végétaux',
    description:
      'Recettes de ravitaillement maison pour le vélo et les sports d’endurance : barres énergétiques, boisson isotonique, collations et récupération — 100 % végétal, avec les macros par portion.',
    canonical: canonicalUrl('/ravitaillement'),
  });

  const { recipes, loading, error } = useData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-light">Chargement…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-red-600">Erreur : {error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 lg:px-8 pt-12 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 max-w-2xl">
            <p className="recipe-section-title">Ravitaillement</p>
            <div className="deco-route mb-3" />
            <h1 className="font-display text-3xl sm:text-4xl text-text leading-tight">
              Le ravito végétal fait maison
            </h1>
            <p className="mt-3 text-base text-text-light leading-relaxed">
              Avant, pendant et après la sortie : des recettes pensées pour l&rsquo;endurance
              — vélo, trail, running — avec les macros par portion. Moins chères et
              meilleures que les gels industriels.
            </p>
            <p className="recipe-annotation mt-2">
              Le ravito de mamie vaut tous les gels du commerce.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline avant / pendant / après — une recette n'apparaît que dans une seule phase */}
      {(() => {
        const usedIds = new Set();
        return PHASES.map((phase, idx) => {
        const primary = recipes.filter((r) => !usedIds.has(r.id) && phase.filter(r));
        const extra = phase.fallback
          ? recipes.filter((r) => !usedIds.has(r.id) && !phase.filter(r) && phase.fallback(r))
          : [];
        const phaseRecipes = [...primary, ...extra].slice(0, 3);
        phaseRecipes.forEach((r) => usedIds.add(r.id));
        return (
          <section
            key={phase.id}
            className={`px-6 lg:px-8 py-14 ${idx % 2 === 1 ? 'bg-bg-warm' : ''}`}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="ravito-phase-label mb-2">
                    {String(idx + 1).padStart(2, '0')} — {phase.label}
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl text-text">
                    {phase.title}
                  </h2>
                  <p className="mt-2 font-accent text-sm text-text-light tabular-nums">
                    {phase.repere}
                  </p>
                  <p className="mt-2 text-sm text-text-light leading-relaxed max-w-xl">
                    {phase.description}
                  </p>
                </div>
              </div>
              {phaseRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {phaseRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-light">
                  Les recettes de cette phase arrivent bientôt —{' '}
                  <Link to="/recettes" className="text-primary hover:underline">
                    voir toutes les recettes
                  </Link>
                  .
                </p>
              )}
            </div>
          </section>
        );
        });
      })()}

      {/* CTA */}
      <section className="px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-text">
            Planifie ta semaine d&rsquo;entraînement
          </h2>
          <p className="mt-3 text-sm text-text-light leading-relaxed max-w-xl mx-auto">
            Objectif endurance, régime végétarien ou végétalien : génère ton planning
            de repas avec les macros calculées et la liste de courses.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/planning"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
            >
              Créer mon planning
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/recettes"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white border border-border text-sm font-medium rounded-full text-text hover:border-text transition-colors shadow-sm"
            >
              Toutes les recettes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
