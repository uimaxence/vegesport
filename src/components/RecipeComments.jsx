import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, Trash2, Loader2, Star } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function Avatar({ name, size = 32 }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className="rounded-full bg-primary/10 text-primary flex items-center justify-center font-accent font-medium flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

/** Affiche N étoiles pleines + le reste vides */
function StarDisplay({ value, max = 5, size = 14 }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < value ? 'fill-primary text-primary' : 'fill-none text-text-light/30'}
        />
      ))}
    </span>
  );
}

/** Picker interactif d'étoiles */
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const active = star <= (hovered || value);
        return (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(value === star ? 0 : star)}
            className="p-0.5 transition-transform hover:scale-110"
            title={`${star} étoile${star > 1 ? 's' : ''}`}
          >
            <Star
              size={22}
              className={active ? 'fill-primary text-primary' : 'fill-none text-text-light/30'}
            />
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-1 text-xs text-text-light font-accent">
          {value}/5
        </span>
      )}
    </div>
  );
}

/** Résumé de la note moyenne en haut */
function RatingSummary({ comments }) {
  const rated = comments.filter(c => c.rating != null && c.rating > 0);
  if (rated.length === 0) return null;
  const avg = rated.reduce((sum, c) => sum + c.rating, 0) / rated.length;
  const rounded = Math.round(avg * 10) / 10;

  return (
    <div className="flex items-center gap-4 mb-8 px-5 py-4 bg-bg-warm rounded-xl border border-border">
      <div className="text-center flex-shrink-0">
        <p className="font-display text-4xl text-text leading-none">{rounded.toFixed(1)}</p>
        <p className="text-xs text-text-light/60 font-accent mt-1">/ 5</p>
      </div>
      <div>
        <StarDisplay value={Math.round(avg)} size={18} />
        <p className="text-xs text-text-light mt-1.5 font-accent">
          {rated.length} avis{rated.length > 1 ? '' : ''}
        </p>
      </div>
    </div>
  );
}

export default function RecipeComments({ recipeId, user }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase
      .from('comments')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false });
    if (!err) setComments(data ?? []);
    setLoading(false);
  }, [recipeId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting || !user || !supabase) return;
    setSubmitting(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('comments')
      .insert({
        recipe_id: recipeId,
        user_id: user.id,
        user_name: user.name,
        content: text.trim(),
        rating: rating > 0 ? rating : null,
      })
      .select()
      .single();
    if (err) {
      setError('Une erreur est survenue. Réessaie.');
    } else {
      setComments(prev => [data, ...prev]);
      setText('');
      setRating(0);
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId) => {
    if (!supabase || deletingId) return;
    setDeletingId(commentId);
    const { error: err } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    if (!err) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
    setDeletingId(null);
  };

  return (
    <section className="mt-16 pt-12 border-t border-border">
      {/* En-tête */}
      <div className="flex items-center gap-2 mb-8">
        <MessageCircle size={20} className="text-text-light" />
        <h2 className="font-display text-2xl text-text">Avis & commentaires</h2>
        {!loading && (
          <span className="font-accent text-sm text-text-light tabular-nums">
            {comments.length}
          </span>
        )}
      </div>

      {/* Résumé de la note moyenne */}
      {!loading && <RatingSummary comments={comments} />}

      {/* Formulaire */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex gap-3">
            <Avatar name={user.name} />
            <div className="flex-1">
              {/* Picker d'étoiles */}
              <div className="mb-3">
                <p className="text-xs text-text-light mb-1.5 font-accent">Ta note (optionnelle)</p>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Partage ton avis sur cette recette…"
                maxLength={1000}
                rows={3}
                className="w-full px-4 py-3 text-sm text-text bg-bg-warm border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-text-light/50 transition-all"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-text-light/50 font-accent">
                  {text.length}/1000
                </span>
                <button
                  type="submit"
                  disabled={!text.trim() || submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Publier
                </button>
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-500">{error}</p>
              )}
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 px-5 py-4 bg-bg-warm border border-border rounded-xl flex items-center gap-3">
          <Star size={18} className="text-text-light flex-shrink-0" />
          <p className="text-sm text-text-light">
            <Link to="/connexion" className="text-primary font-medium hover:underline">
              Connecte-toi
            </Link>{' '}
            pour laisser un avis ou un commentaire.
          </p>
        </div>
      )}

      {/* Liste des commentaires */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={24} className="animate-spin text-text-light" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-text-light text-center py-10">
          Sois le premier à donner ton avis sur cette recette !
        </p>
      ) : (
        <ul className="space-y-6">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3 group">
              <Avatar name={comment.user_name} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
                  <span className="text-sm font-medium text-text">
                    {comment.user_name}
                  </span>
                  {comment.rating > 0 && (
                    <StarDisplay value={comment.rating} size={12} />
                  )}
                  <span className="text-xs text-text-light/60 font-accent">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-text-light leading-relaxed whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
              {user && comment.user_id === user.id && (
                <button
                  type="button"
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  className="flex-shrink-0 p-1.5 text-text-light/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50 disabled:cursor-not-allowed"
                  title="Supprimer mon commentaire"
                >
                  {deletingId === comment.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
