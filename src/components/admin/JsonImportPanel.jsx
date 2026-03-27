import { useState, useCallback } from 'react';
import { Copy, Upload, X, Check, AlertTriangle } from 'lucide-react';

/* ── Schemas attendus ────────────────────────────────── */

const RECIPE_SCHEMA = `{
  "title": "Nom de la recette",
  "category": "petit-dejeuner | dejeuner | diner | snack | dessert",
  "time": 15,
  "calories": 400,
  "protein": 25,
  "carbs": 50,
  "fat": 10,
  "servings": 2,
  "difficulty": "Facile | Moyen | Difficile",
  "tags": ["#RicheEnProtéines", "#PostEntraînement", "#Budget", "#RicheEnFer", "#PréparationRepas"],
  "objective": ["masse", "endurance", "sante", "seche"],
  "regime": ["vegetarien", "vegetalien", "sans-gluten"],
  "season": ["printemps", "ete", "automne", "hiver"],
  "mainIngredient": "Ingrédient principal",
  "steps": ["Étape 1…", "Étape 2…"],
  "recipeIngredients": [
    { "name": "Flocons d'avoine", "quantityText": "80g", "rayon": "Épicerie" }
  ]
}`;

const ARTICLE_SCHEMA = `{
  "title": "Titre de l'article",
  "excerpt": "Résumé court",
  "meta_title": "Titre SEO (optionnel, défaut = title)",
  "meta_description": "Description SEO (optionnel)",
  "category": "nutrition | recettes | sport | temoignage",
  "date": "2026-03-26",
  "read_time": 5,
  "image": "URL image (optionnel)",
  "author": "Nom auteur",
  "content": "Contenu texte brut pour le SEO",
  "content_json": [
    { "type": "heading", "level": 2, "text": "Titre section" },
    { "type": "paragraph", "text": "…" },
    { "type": "list", "items": ["item 1", "item 2"] },
    { "type": "image", "src": "url", "alt": "description" },
    { "type": "faq", "items": [{ "question": "Q ?", "answer": "Réponse." }] }
  ],
  "schema_type": "Article | HowTo"
}`;

const RECIPE_CATEGORIES = new Set(['petit-dejeuner', 'dejeuner', 'diner', 'snack', 'dessert']);

/* ── Validation ──────────────────────────────────────── */

function validateRecipe(data) {
  const errors = [];
  if (!data || typeof data !== 'object') return ['Le JSON doit être un objet'];
  if (!data.title) errors.push('Champ requis manquant : title');
  if (!data.category) errors.push('Champ requis manquant : category');
  if (data.category && !RECIPE_CATEGORIES.has(data.category)) {
    errors.push(`category invalide : "${data.category}" (attendu : ${[...RECIPE_CATEGORIES].join(', ')})`);
  }
  for (const f of ['time', 'calories', 'protein', 'carbs', 'fat', 'servings']) {
    if (data[f] != null && (typeof data[f] !== 'number' || isNaN(data[f]))) {
      errors.push(`${f} doit être un nombre`);
    }
  }
  if (data.steps != null && !Array.isArray(data.steps)) errors.push('steps doit être un tableau de strings');
  if (data.recipeIngredients != null && !Array.isArray(data.recipeIngredients)) {
    errors.push('recipeIngredients doit être un tableau');
  }
  return errors;
}

function validateArticle(data) {
  const errors = [];
  if (!data || typeof data !== 'object') return ['Le JSON doit être un objet'];
  if (!data.title) errors.push('Champ requis manquant : title');
  if (!data.category) errors.push('Champ requis manquant : category');
  if (!data.date) errors.push('Champ requis manquant : date');
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.push('date doit être au format YYYY-MM-DD');
  }
  if (data.content_json != null && !Array.isArray(data.content_json)) {
    errors.push('content_json doit être un tableau de blocs');
  }
  return errors;
}

/* ── Component ───────────────────────────────────────── */

export default function JsonImportPanel({ type, onImport, onClose }) {
  const [json, setJson] = useState('');
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const isRecipe = type === 'recipe';
  const schema = isRecipe ? RECIPE_SCHEMA : ARTICLE_SCHEMA;
  const validate = isRecipe ? validateRecipe : validateArticle;

  const handleImport = useCallback(async () => {
    setErrors([]);
    setSuccess(false);

    let data;
    try {
      data = JSON.parse(json);
    } catch (e) {
      setErrors([`JSON invalide : ${e.message}`]);
      return;
    }

    const errs = validate(data);
    if (errs.length > 0) { setErrors(errs); return; }

    setImporting(true);
    try {
      await onImport(data);
      setSuccess(true);
      setJson('');
    } catch (e) {
      setErrors([e?.message || "Erreur lors de l'import"]);
    } finally {
      setImporting(false);
    }
  }, [json, validate, onImport]);

  const copyReformatPrompt = useCallback(() => {
    const label = isRecipe ? 'une recette végétarienne' : 'un article de blog';
    const rayons = isRecipe
      ? '\nRayons possibles pour recipeIngredients.rayon : Fruits et légumes, Épicerie, Boulangerie, Produits laitiers, Surgelés, Boissons, Conserves, Condiments, Boucherie/Poissonnerie\n'
      : '';
    const prompt = `Reformate ce JSON pour qu'il corresponde exactement au format attendu pour importer ${label} sur mamie-vege.fr.\n\nFORMAT ATTENDU :\n${schema}\n${rayons}\nJSON À REFORMATER :\n${json}\n\nRéponds uniquement avec le JSON reformaté, sans explication.`;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [json, schema, isRecipe]);

  return (
    <div className="rounded-xl border border-border bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-text">
          Importer {isRecipe ? 'une recette' : 'un article'} via JSON
        </h3>
        <button type="button" onClick={onClose} className="p-1 text-text-light hover:text-text">
          <X size={20} />
        </button>
      </div>

      <textarea
        value={json}
        onChange={(e) => { setJson(e.target.value); setErrors([]); setSuccess(false); }}
        placeholder={`Colle ton JSON ici…`}
        rows={14}
        className="w-full rounded-lg border border-border bg-black/[0.02] p-3 font-mono text-sm text-text placeholder:text-text-light/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
      />

      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              {errors.map((err, i) => (
                <p key={i} className="text-red-700 text-sm">{err}</p>
              ))}
            </div>
          </div>
          {json.trim() && (
            <button
              type="button"
              onClick={copyReformatPrompt}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Prompt copié !' : 'Copier le prompt pour reformater'}
            </button>
          )}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2">
          <Check size={18} className="text-green-600" />
          <p className="text-green-700 text-sm font-medium">
            {isRecipe ? 'Recette importée' : 'Article importé'} avec succès !
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleImport}
          disabled={importing || !json.trim()}
          className="inline-flex items-center gap-2 text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={16} />
          {importing ? 'Import en cours…' : 'Importer'}
        </button>
        <button type="button" onClick={onClose} className="text-sm text-text-light hover:text-text px-3 py-2">
          Annuler
        </button>
      </div>
    </div>
  );
}
