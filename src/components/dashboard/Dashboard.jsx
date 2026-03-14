import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPlanningForCurrentWeek } from '../../utils/dashboardPlanning';
import RepasDuMoment from './RepasDuMoment';
import SuiviApportsChart from './SuiviApportsChart';

export default function Dashboard({ recipes }) {
  const { user, savedPlannings, loading: authLoading } = useAuth();

  // Pendant le chargement de l'auth, on attend
  if (authLoading) {
    return (
      <section className="px-6 lg:px-8 py-10 border-b border-border bg-bg-warm/50">
        <div className="max-w-5xl mx-auto flex items-center gap-3 text-text-light text-sm">
          <Loader2 size={16} className="animate-spin" />
          Chargement du dashboard…
        </div>
      </section>
    );
  }

  // Pas connecté → pas de dashboard
  if (!user) return null;

  const currentPlanning = getPlanningForCurrentWeek(savedPlannings);

  // Connecté mais aucun planning cette semaine → invitation à en créer un
  if (!currentPlanning) {
    return (
      <section className="px-6 lg:px-8 py-10 border-b border-border bg-bg-warm/50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="recipe-section-title">Ton dashboard</p>
            <h2 className="font-display text-2xl text-text mt-1">
              Aucun planning pour cette semaine
            </h2>
            <p className="text-sm text-text-light mt-1">
              Crée ton planning pour voir ici le repas du moment et le suivi de tes apports.
            </p>
          </div>
          <Link
            to="/planning"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-sm hover:bg-primary-dark transition-colors"
          >
            Créer mon planning
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    );
  }

  const getRecipe = (id) => recipes.find((r) => r.id === id);

  return (
    <section className="px-6 lg:px-8 py-12 lg:py-16 border-b border-border bg-bg-warm/50">
      <div className="max-w-5xl mx-auto">
        <p className="recipe-section-title">Ton dashboard</p>
        <div className="deco-wave mb-2" />
        <h2 className="font-display text-3xl sm:text-4xl text-text mb-2">
          Ta semaine en cours
        </h2>
        <p className="text-text-light text-sm mb-8">
          Planning du{' '}
          {currentPlanning.weekStart
            ? new Date(currentPlanning.weekStart + 'T12:00:00').toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })
            : '—'}.
          {' '}
          <Link to={currentPlanning.id ? `/planning?edit=${currentPlanning.id}` : '/planning'} className="text-primary hover:text-primary-dark font-medium">
            Modifier le planning
          </Link>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <RepasDuMoment planning={currentPlanning} getRecipe={getRecipe} />
          </div>
          <div className="lg:col-span-3">
            <SuiviApportsChart
              planning={currentPlanning}
              getRecipe={getRecipe}
              portions={2}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            to={currentPlanning.id ? `/planning?edit=${currentPlanning.id}` : '/planning'}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
          >
            Voir tout le planning
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
