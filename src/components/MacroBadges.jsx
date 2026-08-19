/**
 * Rangée de données nutritionnelles par portion — registre « Route & données ».
 * La protéine est la donnée héros (secondary). Voir design-system.md §23.
 */
export default function MacroBadges({ recipe, className = '' }) {
  const items = [
    recipe.protein != null && { value: recipe.protein, unit: 'g', label: 'prot', hero: true },
    recipe.carbs != null && { value: recipe.carbs, unit: 'g', label: 'gluc' },
    recipe.calories != null && { value: recipe.calories, unit: '', label: 'kcal' },
  ].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <span className={`inline-flex items-center gap-2.5 font-accent text-xs tabular-nums ${className}`}>
      {items.map((it, i) => (
        <span key={it.label} className="inline-flex items-center gap-1 text-text-light">
          {i > 0 && <span aria-hidden="true" className="text-border">·</span>}
          <span className={`font-medium ${it.hero ? 'text-secondary' : 'text-text'}`}>
            {it.value}{it.unit && ` ${it.unit}`}
          </span>
          {it.label}
        </span>
      ))}
    </span>
  );
}
