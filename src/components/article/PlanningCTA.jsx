import { Link } from 'react-router-dom';
import { CalendarDays, ArrowRight } from 'lucide-react';

export default function PlanningCTA() {
  return (
    <div className="my-10 rounded-xl border border-border bg-bg-warm p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <CalendarDays size={18} />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
            Planning de repas
          </p>
          <h3 className="font-display text-xl text-text mt-2">
            Génère ta semaine de repas riche en protéines
          </h3>
          <p className="text-sm text-text-light mt-2 leading-relaxed">
            En 2 minutes, tu obtiens un planning + une liste de courses à partir de recettes végétariennes adaptées au sport.
          </p>
          <Link
            to="/planning"
            className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors px-7 py-3.5 rounded-full shadow-lg shadow-primary/20"
          >
            Ouvrir le planning <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-text-light/70 mt-2">
            Astuce : vise \(25–35g\) de protéines par repas, et ajuste selon ta séance.
          </p>
        </div>
      </div>
    </div>
  );
}

