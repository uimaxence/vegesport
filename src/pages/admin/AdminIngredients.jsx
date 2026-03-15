import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { fetchIngredients, createIngredient } from '../../lib/admin';

const RAYONS = [
  'Fruits et légumes',
  'Épicerie',
  'Pâtes riz et céréales',
  'Boissons',
  'Frais et protéines végétales',
  'Surgelés',
  'Condiments et épices',
  'Graines et oléagineux',
];

export default function AdminIngredients() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [rayon, setRayon] = useState(RAYONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIngredients();
      setIngredients(data);
    } catch (e) {
      setError(e?.message || 'Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const { created } = await createIngredient(trimmed, rayon);
      setMessage(created ? 'Ingrédient ajouté.' : 'Cet ingrédient existait déjà.');
      setName('');
      if (created) load();
    } catch (e) {
      setMessage(e?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/admin"
            className="p-2 text-text-light hover:text-text rounded-lg hover:bg-black/5"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl text-text">Répertoire des ingrédients</h1>
        </div>

        <form onSubmit={handleAdd} className="mb-8 p-4 rounded-xl bg-black/[0.04] border border-black/5">
          <p className="text-sm font-medium text-text mb-2">Ajouter un ingrédient</p>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom (ex. Flocons d'avoine)"
              className="flex-1 min-w-[180px] px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <select
              value={rayon}
              onChange={(e) => setRayon(e.target.value)}
              className="px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {RAYONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark disabled:opacity-50"
            >
              <Plus size={18} />
              Ajouter
            </button>
          </div>
          {message && (
            <p className={`text-sm mt-2 ${message.startsWith('Erreur') ? 'text-red-600' : 'text-text-light'}`}>
              {message}
            </p>
          )}
        </form>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {loading && <p className="text-text-light">Chargement…</p>}
        {!loading && ingredients.length === 0 && (
          <p className="text-text-light">Aucun ingrédient. Ajoute-en pour les utiliser dans les recettes.</p>
        )}
        {!loading && ingredients.length > 0 && (
          <ul className="space-y-2">
            {ingredients.map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/[0.03]"
              >
                <span className="font-medium text-text">{i.name}</span>
                <span className="text-xs text-text-light">{i.rayon}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
