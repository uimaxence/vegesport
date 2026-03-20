import { ExternalLink } from 'lucide-react';
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
  return <p className="text-[18px] text-text-light leading-relaxed whitespace-pre-line">{children}</p>;
}

function List({ items = [] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 text-[18px] text-text-light leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-sm bg-primary/40 mt-2 flex-shrink-0" />
          <span className="whitespace-pre-line">{it}</span>
        </li>
      ))}
    </ul>
  );
}

function RecipesGrid({ recipeIds = [], recipes = [] }) {
  const picked = recipeIds
    .map((id) => recipes.find((r) => String(r.id) === String(id)))
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

function SourceBlock({ label, url }) {
  if (!label && !url) return null;
  return (
    <aside className="my-4 flex items-start gap-3 rounded-lg border border-border bg-bg-warm/50 px-4 py-3">
      <span className="text-xs uppercase tracking-[0.15em] text-primary font-medium flex-shrink-0">Source</span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[18px] text-text-light hover:text-primary transition-colors flex items-center gap-1.5 break-all"
        >
          {label || url}
          <ExternalLink size={12} className="flex-shrink-0 opacity-60" aria-hidden />
        </a>
      ) : (
        <span className="text-[18px] text-text-light">{label}</span>
      )}
    </aside>
  );
}

function TableBlock({ headers = [], rows = [] }) {
  if (!headers.length || !rows.length) return null;
  return (
    <div className="my-8 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[400px] text-[18px]">
        <thead>
          <tr className="border-b border-border bg-bg-warm">
            {headers.map((h, i) => (
              <th key={i} scope="col" className="px-4 py-3 text-left font-medium text-text">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border last:border-b-0 hover:bg-bg-warm/30 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-text-light">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FAQBlock({ items = [] }) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return null;
  return (
    <section className="my-10" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="sr-only">
        Questions fréquentes
      </h2>
      <div className="space-y-4">
        {list.map((item, i) => {
          const q = item?.question ?? item?.name ?? '';
          const a = item?.answer ?? item?.acceptedAnswer?.text ?? item?.acceptedAnswer ?? '';
          if (!q) return null;
          return (
            <article key={i} className="rounded-lg border border-border bg-bg-warm/50 p-4 sm:p-5">
              <h3 className="font-display text-base font-medium text-text mb-2">
                {q}
              </h3>
              <p className="text-[18px] text-text-light leading-relaxed">
                {typeof a === 'string' ? a : ''}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SourcesListBlock({ items = [] }) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return null;
  return (
    <ul className="my-6 space-y-2" role="list">
      {list.map((item, i) => {
        const label = item?.label ?? item?.name ?? '';
        const url = item?.url ?? item?.href ?? '';
        return (
          <li key={i}>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[18px] text-text-light hover:text-primary transition-colors flex items-center gap-1.5"
              >
                {label || url}
                <ExternalLink size={12} className="flex-shrink-0 opacity-60" aria-hidden />
              </a>
            ) : (
              <span className="text-[18px] text-text-light">{label}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function ArticleBlocks({ blocks, recipes }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  return (
    <div className="space-y-4">
      {blocks.map((b, idx) => {
        if (!b || typeof b !== 'object') return null;

        const blockType = String(b.type || '').toLowerCase();
        switch (blockType) {
          case 'heading':
            return <Heading key={idx} level={b.level}>{b.text}</Heading>;
          case 'paragraph':
            return <Paragraph key={idx}>{b.text}</Paragraph>;
          case 'list':
            return <List key={idx} items={b.items} />;
          case 'source':
            return <SourceBlock key={idx} label={b.label} url={b.url} />;
          case 'table':
            return <TableBlock key={idx} headers={b.headers} rows={b.rows} />;
          case 'faq':
            return <FAQBlock key={idx} items={b.items ?? b.mainEntity ?? []} />;
          case 'sources_list':
            return <SourcesListBlock key={idx} items={b.items ?? []} />;
          case 'recipes':
            return <RecipesGrid key={idx} recipeIds={b.recipeIds ?? b.recipe_ids ?? []} recipes={recipes} />;
          case 'cta_planning':
            return <PlanningCTA key={idx} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

