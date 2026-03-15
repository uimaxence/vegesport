import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import {
  fetchRecipeForEdit,
  fetchIngredients,
  createRecipe,
  updateRecipe,
  uploadRecipeImage,
} from '../../lib/admin';
import { categories, objectives, regimes, tags } from '../../data/recipes';

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

const SEASONS = [
  { id: 'printemps', label: 'Printemps' },
  { id: 'ete', label: 'Été' },
  { id: 'automne', label: 'Automne' },
  { id: 'hiver', label: 'Hiver' },
];

const DIFFICULTIES = ['Facile', 'Moyen'];

export default function AdminRecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === undefined || id === 'nouvelle';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [ingredientsList, setIngredientsList] = useState([]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('petit-dejeuner');
  const [time, setTime] = useState(15);
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [servings, setServings] = useState(1);
  const [difficulty, setDifficulty] = useState('Facile');
  const [tagsVal, setTagsVal] = useState([]);
  const [objective, setObjective] = useState([]);
  const [regime, setRegime] = useState([]);
  const [season, setSeason] = useState([]);
  const [mainIngredient, setMainIngredient] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // URL existante ou object URL
  const [steps, setSteps] = useState(['']);
  const [recipeIngredients, setRecipeIngredients] = useState([{ ingredientId: '', name: '', rayon: RAYONS[0], quantityText: '' }]);

  useEffect(() => {
    fetchIngredients().then(setIngredientsList).catch(() => setIngredientsList([]));
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      setLoading(true);
      fetchRecipeForEdit(id)
        .then((r) => {
          if (!r) {
            setError('Recette introuvable');
            return;
          }
          setTitle(r.title || '');
          setCategory(r.category || 'petit-dejeuner');
          setTime(r.time ?? 15);
          setCalories(r.calories ?? 0);
          setProtein(r.protein ?? 0);
          setCarbs(r.carbs ?? 0);
          setFat(r.fat ?? 0);
          setServings(r.servings ?? 1);
          setDifficulty(r.difficulty || 'Facile');
          setTagsVal(Array.isArray(r.tags) ? r.tags : []);
          setObjective(Array.isArray(r.objective) ? r.objective : []);
          setRegime(Array.isArray(r.regime) ? r.regime : []);
          setSeason(Array.isArray(r.season) ? r.season : []);
          setMainIngredient(r.mainIngredient ?? r.main_ingredient ?? '');
          setImagePreview(r.image ?? null);
          setSteps(Array.isArray(r.steps) && r.steps.length ? r.steps : ['']);
          const ri = Array.isArray(r.recipeIngredients) && r.recipeIngredients.length
            ? r.recipeIngredients.map((x) => ({
                ingredientId: x.ingredientId ?? x.ingredient_id ?? '',
                name: x.name ?? '',
                rayon: x.rayon ?? RAYONS[0],
                quantityText: x.quantityText ?? x.quantity_text ?? '',
              }))
            : [{ ingredientId: '', name: '', rayon: RAYONS[0], quantityText: '' }];
          setRecipeIngredients(ri);
        })
        .catch((e) => setError(e?.message || 'Erreur chargement'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const toggleMulti = (arr, setter, value) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  const addStep = () => setSteps((prev) => [...prev, '']);
  const removeStep = (i) => setSteps((prev) => prev.filter((_, idx) => idx !== i));
  const setStep = (i, v) => setSteps((prev) => prev.map((s, idx) => (idx === i ? v : s)));

  const addIngredientRow = () => {
    setRecipeIngredients((prev) => [...prev, { ingredientId: '', name: '', rayon: RAYONS[0], quantityText: '' }]);
  };
  const removeIngredientRow = (i) => {
    setRecipeIngredients((prev) => prev.filter((_, idx) => idx !== i));
  };
  const setIngredientRow = (i, field, value) => {
    setRecipeIngredients((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row))
    );
  };

  const buildPayload = () => {
    const stepsFiltered = steps.map((s) => s.trim()).filter(Boolean);
    const ri = recipeIngredients
      .filter((row) => {
        const hasIng = row.ingredientId || (row.name && row.name.trim());
        return hasIng;
      })
      .map((row) => {
        if (row.ingredientId) {
          return { ingredientId: row.ingredientId, quantityText: row.quantityText };
        }
        return { name: row.name.trim(), rayon: row.rayon, quantityText: row.quantityText };
      });

    return {
      title: title.trim(),
      category,
      time: Number(time) || 0,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      servings: Number(servings) || 1,
      difficulty,
      tags: tagsVal,
      objective,
      regime,
      season,
      mainIngredient: mainIngredient.trim() || null,
      image: imagePreview || null,
      steps: stepsFiltered,
      recipeIngredients: ri,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Titre requis');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload();
      if (isNew) {
        const newPayload = { ...payload, image: null };
        const newId = await createRecipe(newPayload);
        if (imageFile) {
          const url = await uploadRecipeImage(newId, imageFile);
          await updateRecipe(newId, { ...payload, image: url });
        }
        navigate('/admin');
      } else {
        let imageUrl = imagePreview;
        if (imageFile) {
          imageUrl = await uploadRecipeImage(id, imageFile);
        }
        await updateRecipe(Number(id), { ...payload, image: imageUrl });
        navigate('/admin');
      }
    } catch (err) {
      setError(err?.message || 'Erreur enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-12 flex justify-center">
        <p className="text-text-light">Chargement…</p>
      </div>
    );
  }

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
          <h1 className="font-display text-2xl sm:text-3xl text-text">
            {isNew ? 'Nouvelle recette' : 'Modifier la recette'}
          </h1>
        </div>

        {error && (
          <p className="text-red-600 mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Titre *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {categories.filter((c) => c.id !== 'tous').map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Temps (min)</label>
              <input
                type="number"
                min="0"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Calories</label>
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-3 py-2 border border-black/10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Protéines (g)</label>
              <input
                type="number"
                min="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full px-3 py-2 border border-black/10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Glucides (g)</label>
              <input
                type="number"
                min="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full px-3 py-2 border border-black/10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Lipides (g)</label>
              <input
                type="number"
                min="0"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full px-3 py-2 border border-black/10 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Parts</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="w-full px-3 py-2 border border-black/10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Difficulté</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-black/10 rounded-lg"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Ingrédient principal</label>
            <input
              type="text"
              value={mainIngredient}
              onChange={(e) => setMainIngredient(e.target.value)}
              className="w-full px-3 py-2 border border-black/10 rounded-lg"
              placeholder="ex. Lentilles corail"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Objectifs</label>
            <div className="flex flex-wrap gap-2">
              {objectives.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => toggleMulti(objective, setObjective, o.id)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    objective.includes(o.id)
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'border-black/15 text-text-light hover:border-black/30'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">Régimes</label>
            <div className="flex flex-wrap gap-2">
              {regimes.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleMulti(regime, setRegime, r.id)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    regime.includes(r.id)
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'border-black/15 text-text-light hover:border-black/30'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">Saisons</label>
            <div className="flex flex-wrap gap-2">
              {SEASONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleMulti(season, setSeason, s.id)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    season.includes(s.id)
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'border-black/15 text-text-light hover:border-black/30'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleMulti(tagsVal, setTagsVal, t)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    tagsVal.includes(t)
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'border-black/15 text-text-light hover:border-black/30'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Photo</label>
            {imagePreview && (
              <div className="mb-2">
                <img src={imagePreview} alt="" className="h-24 object-cover rounded-lg border border-black/10" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setImageFile(f || null);
                if (f) setImagePreview(URL.createObjectURL(f));
              }}
              className="w-full text-sm text-text-light"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Étapes</label>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-text-light text-sm mt-2 w-6">{i + 1}.</span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => setStep(i, e.target.value)}
                    className="flex-1 px-3 py-2 border border-black/10 rounded-lg text-sm"
                    placeholder="Décrire l'étape"
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="p-2 text-text-light hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addStep}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Plus size={16} /> Ajouter une étape
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Ingrédients (avec quantités)</label>
            <p className="text-xs text-text-light mb-2">
              Choisis un ingrédient existant ou saisis un nouveau nom + rayon.
            </p>
            <div className="space-y-3">
              {recipeIngredients.map((row, i) => (
                <div key={i} className="flex flex-wrap items-start gap-2 p-3 rounded-lg bg-black/[0.04] border border-black/5">
                  <select
                    value={row.ingredientId}
                    onChange={(e) => {
                      const v = e.target.value;
                      const ing = v ? ingredientsList.find((x) => String(x.id) === v) : null;
                      setRecipeIngredients((prev) =>
                        prev.map((r, idx) =>
                          idx === i
                            ? {
                                ...r,
                                ingredientId: v,
                                name: ing?.name ?? '',
                                rayon: ing?.rayon ?? RAYONS[0],
                              }
                            : r
                        )
                      );
                    }}
                    className="flex-1 min-w-[140px] px-2 py-1.5 border border-black/10 rounded text-sm"
                  >
                    <option value="">— Nouveau —</option>
                    {ingredientsList.map((ing) => (
                      <option key={ing.id} value={ing.id}>{ing.name}</option>
                    ))}
                  </select>
                  {!row.ingredientId && (
                    <>
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => setIngredientRow(i, 'name', e.target.value)}
                        placeholder="Nom ingrédient"
                        className="min-w-[120px] px-2 py-1.5 border border-black/10 rounded text-sm flex-1"
                      />
                      <select
                        value={row.rayon}
                        onChange={(e) => setIngredientRow(i, 'rayon', e.target.value)}
                        className="px-2 py-1.5 border border-black/10 rounded text-sm"
                      >
                        {RAYONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </>
                  )}
                  <input
                    type="text"
                    value={row.quantityText}
                    onChange={(e) => setIngredientRow(i, 'quantityText', e.target.value)}
                    placeholder="80g, 1 c.à.s..."
                    className="w-24 px-2 py-1.5 border border-black/10 rounded text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredientRow(i)}
                    className="p-1.5 text-text-light hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredientRow}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Plus size={16} /> Ajouter un ingrédient
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? 'Enregistrement…' : isNew ? 'Créer la recette' : 'Enregistrer'}
            </button>
            <Link
              to="/admin"
              className="px-6 py-2.5 border border-black/15 rounded-lg text-text hover:bg-black/5"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
