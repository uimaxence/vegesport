import RecipeCard from '../RecipeCard';
import PlanningCTA from './PlanningCTA';

function Heading({ level = 2, children }) {
  const Tag = level === 1 ? 'h1' : level === 3 ? 'h3' : 'h2';
  const className =
    level === 1
      ? 'font-display text-3xl sm:text-4xl text-text leading-tight'
      : level === 3
        ? 'font-display text-xl text-text mt-8 mb-2'
        : 'font-display text-2xl text-text mt-10 mb-3';

  return <Tag className={className}>{children}</Tag>;
}

function Paragraph({ children }) {
  return <p className="text-text-light leading-relaxed whitespace-pre-line">{children}</p>;
}

function List({ items = [] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-text-light leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-sm bg-primary/40 mt-2 flex-shrink-0" />
          <span className="whitespace-pre-line">{it}</span>
        </li>
      ))}
    </ul>
  );
}

function RecipesGrid({ recipeIds = [], recipes = [] }) {
  const picked = recipeIds
    .map((id) => recipes.find((r) => r.id === id))
    .filter(Boolean);

  if (picked.length === 0) return null;

  return (
    <div className="my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {picked.map((r) => (
          <RecipeCard key={r.id} recipe={r} layout="compact" />
        ))}
      </div>
    </div>
  );
}

export default function ArticleBlocks({ blocks, recipes }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  return (
    <div className="space-y-4">
      {blocks.map((b, idx) => {
        if (!b || typeof b !== 'object') return null;

        switch (b.type) {
          case 'heading':
            return <Heading key={idx} level={b.level}>{b.text}</Heading>;
          case 'paragraph':
            return <Paragraph key={idx}>{b.text}</Paragraph>;
          case 'list':
            return <List key={idx} items={b.items} />;
          case 'recipes':
            return <RecipesGrid key={idx} recipeIds={b.recipeIds} recipes={recipes} />;
          case 'cta_planning':
            return <PlanningCTA key={idx} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

