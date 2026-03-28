import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Search, CheckCircle, Circle, Loader2, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchIngredients, createIngredient, enrichIngredientFromOFF, updateIngredientMacros } from '../../lib/admin';

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

const FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'no_macros', label: 'Sans macros' },
  { value: 'unverified', label: 'Non vérifiés' },
  { value: 'verified', label: 'Vérifiés' },
];

function MacroBadge({ label, value, unit = '' }) {
  if (value == null) return null;
  return (
    <span className="text-[11px] text-text-light bg-black/[0.04] px-1.5 py-0.5 rounded">
      {label} {value}{unit}
    </span>
  );
}

function IngredientRow({ ingredient, onEnrich, onSaveMacros, enriching }) {
  const [expanded, setExpanded] = useState(false);
  const [editMacros, setEditMacros] = useState(false);
  const [macroForm, setMacroForm] = useState({
    calories_per_100: ingredient.calories_per_100 ?? '',
    protein_per_100: ingredient.protein_per_100 ?? '',
    carbs_per_100: ingredient.carbs_per_100 ?? '',
    fat_per_100: ingredient.fat_per_100 ?? '',
  });

  const hasMacros = ingredient.calories_per_100 != null && ingredient.calories_per_100 > 0;

  const handleSaveMacros = async () => {
    await onSaveMacros(ingredient.id, {
      calories_per_100: macroForm.calories_per_100 !== '' ? Number(macroForm.calories_per_100) : null,
      protein_per_100: macroForm.protein_per_100 !== '' ? Number(macroForm.protein_per_100) : null,
      carbs_per_100: macroForm.carbs_per_100 !== '' ? Number(macroForm.carbs_per_100) : null,
      fat_per_100: macroForm.fat_per_100 !== '' ? Number(macroForm.fat_per_100) : null,
    });
    setEditMacros(false);
  };

  return (
    <li className="rounded-lg bg-black/[0.03] overflow-hidden">
      <div className="flex items-center justify-between py-2.5 px-3 gap-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          {ingredient.is_verified ? (
            <CheckCircle size={15} className="text-secondary flex-shrink-0" />
          ) : (
            <Circle size={15} className="text-text-light/40 flex-shrink-0" />
          )}
          <span className="font-medium text-text truncate">{ingredient.name}</span>
          {expanded ? <ChevronUp size={14} className="text-text-light flex-shrink-0" /> : <ChevronDown size={14} className="text-text-light flex-shrink-0" />}
        </button>

        <div className="flex items-center gap-2 flex-shrink-0">
          {hasMacros && (
            <div className="hidden sm:flex items-center gap-1">
              <MacroBadge label="P" value={ingredient.protein_per_100} unit="g" />
              <MacroBadge label="G" value={ingredient.carbs_per_100} unit="g" />
              <MacroBadge label="L" value={ingredient.fat_per_100} unit="g" />
              <MacroBadge label="" value={ingredient.calories_per_100} unit="kcal" />
            </div>
          )}
          <span className="text-[11px] text-text-light hidden sm:inline">{ingredient.rayon}</span>
          {!hasMacros && (
            <button
              type="button"
              onClick={() => onEnrich(ingredient.id)}
              disabled={enriching}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50"
              title="Enrichir via Open Food Facts"
            >
              {enriching ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
              OFF
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-black/5 pt-2 space-y-2">
          <div className="flex flex-wrap gap-2 text-xs text-text-light">
            <span>Rayon : {ingredient.rayon}</span>
            {ingredient.category && <span>Catégorie : {ingredient.category}</span>}
            {ingredient.ciqual_id && <span>Ciqual : {ingredient.ciqual_id}</span>}
            {ingredient.off_id && <span>OFF : {ingredient.off_id}</span>}
          </div>

          {hasMacros && !editMacros && (
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white rounded p-2 text-center">
                <p className="text-sm font-medium">{ingredient.protein_per_100}g</p>
                <p className="text-[10px] text-text-light">Prot / 100g</p>
              </div>
              <div className="bg-white rounded p-2 text-center">
                <p className="text-sm font-medium">{ingredient.carbs_per_100}g</p>
                <p className="text-[10px] text-text-light">Gluc / 100g</p>
              </div>
              <div className="bg-white rounded p-2 text-center">
                <p className="text-sm font-medium">{ingredient.fat_per_100}g</p>
                <p className="text-[10px] text-text-light">Lip / 100g</p>
              </div>
              <div className="bg-white rounded p-2 text-center">
                <p className="text-sm font-medium">{ingredient.calories_per_100}</p>
                <p className="text-[10px] text-text-light">kcal / 100g</p>
              </div>
            </div>
          )}

          {editMacros ? (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'calories_per_100', label: 'kcal' },
                  { key: 'protein_per_100', label: 'Prot (g)' },
                  { key: 'carbs_per_100', label: 'Gluc (g)' },
                  { key: 'fat_per_100', label: 'Lip (g)' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-[10px] text-text-light">{label} / 100g</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={macroForm[key]}
                      onChange={(e) => setMacroForm((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-2 py-1 border border-black/10 rounded text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleSaveMacros} className="text-xs px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark">
                  Enregistrer
                </button>
                <button type="button" onClick={() => setEditMacros(false)} className="text-xs px-3 py-1 border border-black/10 rounded text-text-light hover:bg-black/5">
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMacroForm({
                  calories_per_100: ingredient.calories_per_100 ?? '',
                  protein_per_100: ingredient.protein_per_100 ?? '',
                  carbs_per_100: ingredient.carbs_per_100 ?? '',
                  fat_per_100: ingredient.fat_per_100 ?? '',
                });
                setEditMacros(true);
              }}
              className="text-xs text-primary hover:underline"
            >
              {hasMacros ? 'Modifier les macros' : 'Saisir les macros manuellement'}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

export default function AdminIngredients() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [rayon, setRayon] = useState(RAYONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [enrichingId, setEnrichingId] = useState(null);
  const [batchEnriching, setBatchEnriching] = useState(false);
  const [batchProgress, setBatchProgress] = useState(null);

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

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const total = ingredients.length;
    const verified = ingredients.filter((i) => i.is_verified).length;
    const noMacros = ingredients.filter((i) => !i.calories_per_100 || i.calories_per_100 === 0).length;
    return { total, verified, unverified: total - verified, noMacros };
  }, [ingredients]);

  const filtered = useMemo(() => {
    let list = ingredients;
    if (filter === 'verified') list = list.filter((i) => i.is_verified);
    if (filter === 'unverified') list = list.filter((i) => !i.is_verified);
    if (filter === 'no_macros') list = list.filter((i) => !i.calories_per_100 || i.calories_per_100 === 0);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((i) => (i.name || '').toLowerCase().includes(q));
    }
    return list;
  }, [ingredients, filter, search]);

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

  const handleEnrich = async (ingredientId) => {
    setEnrichingId(ingredientId);
    try {
      await enrichIngredientFromOFF(ingredientId);
      await load();
    } catch (e) {
      setError(e?.message || 'Erreur enrichissement');
    } finally {
      setEnrichingId(null);
    }
  };

  const handleSaveMacros = async (ingredientId, macros) => {
    try {
      await updateIngredientMacros(ingredientId, macros);
      await load();
    } catch (e) {
      setError(e?.message || 'Erreur enregistrement macros');
    }
  };

  const handleBatchEnrich = async () => {
    const toEnrich = ingredients.filter((i) => !i.calories_per_100 || i.calories_per_100 === 0);
    if (toEnrich.length === 0) return;
    setBatchEnriching(true);
    setBatchProgress({ done: 0, total: toEnrich.length, errors: 0 });
    let done = 0;
    let errors = 0;
    for (const ing of toEnrich) {
      try {
        await enrichIngredientFromOFF(ing.id);
      } catch {
        errors++;
      }
      done++;
      setBatchProgress({ done, total: toEnrich.length, errors });
      // Petite pause pour éviter le rate limiting OFF
      await new Promise((r) => setTimeout(r, 1200));
    }
    setBatchEnriching(false);
    setBatchProgress(null);
    await load();
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

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-black/[0.03] rounded-lg p-3 text-center">
            <p className="text-xl font-medium text-text">{stats.total}</p>
            <p className="text-xs text-text-light">Total</p>
          </div>
          <div className="bg-secondary/5 rounded-lg p-3 text-center">
            <p className="text-xl font-medium text-secondary">{stats.verified}</p>
            <p className="text-xs text-text-light">Vérifiés</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <p className="text-xl font-medium text-primary">{stats.unverified}</p>
            <p className="text-xs text-text-light">Non vérifiés</p>
          </div>
          <div className={`rounded-lg p-3 text-center ${stats.noMacros > 0 ? 'bg-amber-50' : 'bg-secondary/5'}`}>
            <p className={`text-xl font-medium ${stats.noMacros > 0 ? 'text-amber-600' : 'text-secondary'}`}>{stats.noMacros}</p>
            <p className="text-xs text-text-light">Sans macros</p>
          </div>
        </div>

        {/* Formulaire ajout */}
        <form onSubmit={handleAdd} className="mb-6 p-4 rounded-xl bg-black/[0.04] border border-black/5">
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

        {/* Barre de recherche + filtres + batch */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un ingrédient…"
              className="w-full pl-9 pr-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  filter === f.value
                    ? 'bg-primary/15 border-primary text-primary'
                    : 'border-black/10 text-text-light hover:border-black/20'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {stats.noMacros > 0 && (
            <button
              type="button"
              onClick={handleBatchEnrich}
              disabled={batchEnriching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {batchEnriching ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              {batchEnriching
                ? `${batchProgress?.done || 0}/${batchProgress?.total || 0}${batchProgress?.errors ? ` (${batchProgress.errors} err.)` : ''}`
                : `Enrichir tout (${stats.noMacros})`
              }
            </button>
          )}
        </div>

        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
        {loading && <p className="text-text-light">Chargement…</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-text-light">Aucun ingrédient trouvé.</p>
        )}
        {!loading && filtered.length > 0 && (
          <ul className="space-y-1.5">
            {filtered.map((i) => (
              <IngredientRow
                key={i.id}
                ingredient={i}
                onEnrich={handleEnrich}
                onSaveMacros={handleSaveMacros}
                enriching={enrichingId === i.id}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
