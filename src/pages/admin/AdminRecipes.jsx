import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Package, FileText, FileJson } from 'lucide-react';
import { deleteRecipe, fetchAdminRecipes, createRecipe } from '../../lib/admin';
import JsonImportPanel from '../../components/admin/JsonImportPanel';

const PAGE_SIZE = 50;

export default function AdminRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [listError, setListError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showImport, setShowImport] = useState(false);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    setListError(null);
    setPage(0);
    setHasMore(true);
    try {
      const data = await fetchAdminRecipes({ page: 0, pageSize: PAGE_SIZE });
      setRecipes(Array.isArray(data) ? data : []);
      setHasMore(Array.isArray(data) && data.length === PAGE_SIZE);
    } catch (e) {
      setError(e?.message || 'Erreur chargement');
      setRecipes([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    setListError(null);
    const nextPage = page + 1;
    try {
      const data = await fetchAdminRecipes({ page: nextPage, pageSize: PAGE_SIZE });
      setRecipes((prev) => [...(Array.isArray(prev) ? prev : []), ...(Array.isArray(data) ? data : [])]);
      setPage(nextPage);
      setHasMore(Array.isArray(data) && data.length === PAGE_SIZE);
    } catch (e) {
      setListError(e?.message || 'Erreur chargement');
      setHasMore(false);
    }
  }, [hasMore, page]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Supprimer la recette « ${title} » ?`)) return;
    setDeletingId(id);
    setListError(null);
    try {
      await deleteRecipe(id);
      await loadFirstPage();
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
              to="/admin/articles"
              className="inline-flex items-center gap-2 text-sm text-text-light hover:text-text px-3 py-2 rounded-lg border border-border hover:border-black/20"
            >
              <FileText size={18} />
              Articles
            </Link>
            <Link
              to="/admin/ingredients"
              className="inline-flex items-center gap-2 text-sm text-text-light hover:text-text px-3 py-2 rounded-lg border border-border hover:border-black/20"
            >
              <Package size={18} />
              Ingrédients
            </Link>
            <button
              type="button"
              onClick={() => setShowImport((v) => !v)}
              className="inline-flex items-center gap-2 text-sm text-text-light hover:text-text px-3 py-2 rounded-lg border border-border hover:border-black/20"
            >
              <FileJson size={18} />
              Importer JSON
            </button>
            <Link
              to="/admin/recettes/nouvelle"
              className="inline-flex items-center gap-2 text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
            >
              <Plus size={18} />
              Ajouter une recette
            </Link>
          </div>
        </div>

        {showImport && (
          <div className="mb-8">
            <JsonImportPanel
              type="recipe"
              onImport={async (data) => {
                await createRecipe(data);
                await loadFirstPage();
              }}
              onClose={() => setShowImport(false)}
            />
          </div>
        )}

        {listError && (
          <p className="text-red-600 text-sm mb-4">{listError}</p>
        )}

        {loading && (
          <div className="flex items-center gap-3 text-text-light">
            <svg className="animate-spin h-4 w-4 text-primary flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Chargement des recettes…</span>
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-red-700 text-sm font-medium mb-1">Impossible de charger les recettes</p>
            <p className="text-red-600 text-sm mb-3">{error}</p>
            <button
              type="button"
              onClick={loadFirstPage}
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}
        {!loading && !error && recipes.length === 0 && (
          <p className="text-text-light">Aucune recette.</p>
        )}
        {!loading && !error && recipes.length > 0 && (
          <>
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

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  className="px-4 py-2 rounded-lg border border-black/15 text-sm text-text hover:bg-black/[0.04]"
                >
                  Charger plus
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
