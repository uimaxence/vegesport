import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { deleteRecipe } from '../../lib/admin';

export default function AdminRecipes() {
  const { recipes, loading, error, refetchRecipes } = useData();
  const [deletingId, setDeletingId] = useState(null);
  const [listError, setListError] = useState(null);

  useEffect(() => {
    refetchRecipes();
  }, [refetchRecipes]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Supprimer la recette « ${title} » ?`)) return;
    setDeletingId(id);
    setListError(null);
    try {
      await deleteRecipe(id);
      refetchRecipes();
    } catch (e) {
      setListError(e?.message || 'Erreur suppression');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="font-display text-2xl sm:text-3xl text-text">Admin · Recettes</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/ingredients"
              className="inline-flex items-center gap-2 text-sm text-text-light hover:text-text px-3 py-2 rounded-lg border border-border hover:border-black/20"
            >
              <Package size={18} />
              Ingrédients
            </Link>
            <Link
              to="/admin/recettes/nouvelle"
              className="inline-flex items-center gap-2 text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
            >
              <Plus size={18} />
              Ajouter une recette
            </Link>
          </div>
        </div>

        {listError && (
          <p className="text-red-600 text-sm mb-4">{listError}</p>
        )}

        {loading && (
          <p className="text-text-light">Chargement des recettes…</p>
        )}
        {error && (
          <p className="text-red-600">Erreur : {error}</p>
        )}
        {!loading && !error && recipes.length === 0 && (
          <p className="text-text-light">Aucune recette.</p>
        )}
        {!loading && !error && recipes.length > 0 && (
          <ul className="space-y-2">
            {recipes.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-black/[0.04] border border-transparent hover:border-black/10"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-text block truncate">{r.title}</span>
                  <span className="text-xs text-text-light">
                    {r.category} · {r.time} min
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/admin/recettes/${r.id}/edit`}
                    className="p-2 text-text-light hover:text-primary rounded-lg hover:bg-primary/10"
                    aria-label="Modifier"
                  >
                    <Pencil size={18} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id, r.title)}
                    disabled={deletingId === r.id}
                    className="p-2 text-text-light hover:text-red-600 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
