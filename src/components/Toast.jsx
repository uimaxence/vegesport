import { useEffect } from 'react';

/**
 * Toast réutilisable : fixe en haut du viewport, avec flou de fond et barre de progression.
 * @param {boolean} open - Affiche ou cache le toast
 * @param {() => void} onClose - Appelé à la fin de la durée (ou quand l'utilisateur ferme)
 * @param {number} duration - Durée d'affichage en ms (défaut 6000)
 * @param {React.ReactNode} children - Contenu du toast (texte, lien, etc.)
 * @param {React.ReactNode} [icon] - Icône optionnelle à gauche
 * @param {string} [variant] - 'success' (défaut) | 'info' pour le style
 */
export default function Toast({ open, onClose, duration = 6000, children, icon, variant = 'success' }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  const isSuccess = variant === 'success';

  return (
    <div
      className="fixed left-0 right-0 top-20 z-[60] px-4 flex justify-center pointer-events-none"
      aria-live="polite"
      role="status"
    >
      <div
        className={`
          w-full max-w-md rounded-xl shadow-lg overflow-hidden
          animate-action-success backdrop-blur-md
          pointer-events-auto
          ${isSuccess
            ? 'bg-secondary/10 border border-secondary/20 text-text'
            : 'bg-white/95 border border-border text-text'
          }
        `}
      >
          <div className="flex items-center gap-3 px-4 py-3">
            {icon && (
              <span
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center animate-action-check ${
                  isSuccess ? 'bg-secondary/20' : 'bg-black/5'
                }`}
              >
                {icon}
              </span>
            )}
            <div className="flex-1 min-w-0 text-sm font-medium">
              {children}
            </div>
          </div>
          {/* Barre de progression = temps restant */}
          <div className="h-1 bg-secondary/30 overflow-hidden rounded-b-xl">
            <div
              className="h-full bg-secondary rounded-b-xl origin-left toast-progress"
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        </div>
    </div>
  );
}
