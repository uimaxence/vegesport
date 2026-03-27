import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, FileJson, ArrowLeft } from 'lucide-react';
import { fetchAdminArticles, deleteArticle, createArticleFromJson } from '../../lib/admin';
import JsonImportPanel from '../../components/admin/JsonImportPanel';

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listError, setListError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setListError(null);
    try {
      const data = await fetchAdminArticles();
      setArticles(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Erreur chargement');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Supprimer l'article « ${title} » ?`)) return;
    setDeletingId(id);
    setListError(null);
    try {
      await deleteArticle(id);
      await load();
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
          <h1 className="font-display text-2xl sm:text-3xl text-text">Admin · Articles</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-sm text-text-light hover:text-text px-3 py-2 rounded-lg border border-border hover:border-black/20"
            >
              <ArrowLeft size={18} />
              Recettes
            </Link>
            <button
              type="button"
              onClick={() => setShowImport((v) => !v)}
              className="inline-flex items-center gap-2 text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
            >
              <FileJson size={18} />
              Importer JSON
            </button>
          </div>
        </div>

        {showImport && (
          <div className="mb-8">
            <JsonImportPanel
              type="article"
              onImport={async (data) => {
                await createArticleFromJson(data);
                await load();
              }}
              onClose={() => setShowImport(false)}
            />
          </div>
        )}

        {listError && <p className="text-red-600 text-sm mb-4">{listError}</p>}

        {loading && (
          <div className="flex items-center gap-3 text-text-light">
            <svg className="animate-spin h-4 w-4 text-primary flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Chargement des articles…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-red-700 text-sm font-medium mb-1">Impossible de charger les articles</p>
            <p className="text-red-600 text-sm mb-3">{error}</p>
            <button type="button" onClick={load} className="text-sm font-medium text-primary hover:text-primary-dark">
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <p className="text-text-light">Aucun article.</p>
        )}

        {!loading && !error && articles.length > 0 && (
          <ul className="space-y-2">
            {articles.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-black/[0.04] border border-transparent hover:border-black/10"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-text block truncate">{a.title}</span>
                  <span className="text-xs text-text-light">
                    {a.category} · {a.date}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(a.id, a.title)}
                  disabled={deletingId === a.id}
                  className="p-2 text-text-light hover:text-red-600 rounded-lg hover:bg-red-500/10 disabled:opacity-50 flex-shrink-0"
                  aria-label="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
