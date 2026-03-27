import { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  APPETITE_OPTIONS,
  addHouseholdMember,
  updateHouseholdMember,
  removeHouseholdMember,
  ensureOwner,
} from '../lib/household';

export default function HouseholdEditor({ compact = false, showIntro = false }) {
  const { user, householdMembers, refreshHousehold } = useAuth();
  const [newName, setNewName] = useState('');
  const [newAppetite, setNewAppetite] = useState('moyen');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const ensureOwnerCalledRef = useRef(false);

  // Auto-crée le owner au premier affichage si absent (avec guard anti-doublon)
  useEffect(() => {
    if (!user?.id) return;
    if (ensureOwnerCalledRef.current) return;
    const hasOwner = householdMembers.some((m) => m.is_owner);
    if (hasOwner) return;
    ensureOwnerCalledRef.current = true;
    let cancelled = false;
    (async () => {
      try {
        await ensureOwner(user.id, user.name || 'Moi');
        if (!cancelled) await refreshHousehold();
      } catch (e) {
        console.warn('ensureOwner:', e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = useCallback(async () => {
    const name = newName.trim();
    if (!name || !user?.id) return;
    setBusy(true);
    setError(null);
    try {
      await addHouseholdMember(user.id, { name, appetite: newAppetite });
      await refreshHousehold();
      setNewName('');
      setNewAppetite('moyen');
    } catch (e) {
      setError(e?.message || 'Erreur ajout');
    } finally {
      setBusy(false);
    }
  }, [newName, newAppetite, user?.id, refreshHousehold]);

  const handleAppetiteChange = useCallback(async (id, appetite) => {
    setBusy(true);
    try {
      await updateHouseholdMember(id, { appetite });
      await refreshHousehold();
    } catch (e) {
      console.error('Erreur update membre:', e.message);
    } finally {
      setBusy(false);
    }
  }, [refreshHousehold]);

  const handleRemove = useCallback(async (id) => {
    setBusy(true);
    try {
      await removeHouseholdMember(id);
      await refreshHousehold();
    } catch (e) {
      console.error('Erreur suppression membre:', e.message);
    } finally {
      setBusy(false);
    }
  }, [refreshHousehold]);

  if (!user) return null;

  return (
    <div className={compact ? '' : 'rounded-xl border border-border bg-white p-4 space-y-3'}>
      <div className="flex items-center gap-2 text-sm font-medium text-text">
        <Users size={16} className="text-text-light" />
        <span>Mon foyer</span>
      </div>

      {showIntro && (
        <p className="text-xs text-text-light leading-relaxed">
          Les personnes de ton foyer permettent d'adapter automatiquement les quantités des recettes dans ton planning.
          Si tu prépares un repas pour deux, mais que l'un est un gros mangeur, les ingrédients sont ajustés en conséquence.
          Tes macros affichées dans le planning restent toujours les tiennes.
        </p>
      )}

      {householdMembers.length > 0 && (
        <ul className="space-y-2">
          {householdMembers.map((m) => (
            <li key={m.id} className="flex items-center gap-2">
              <span className="text-sm text-text flex-1 min-w-0 truncate">
                {m.name}
                {m.is_owner && (
                  <span className="ml-1.5 text-[10px] uppercase tracking-wider text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
                    Toi
                  </span>
                )}
              </span>
              {m.is_owner ? (
                <span className="text-[11px] text-text-light italic whitespace-nowrap">
                  Basé sur ton profil
                </span>
              ) : (
                <>
                  <div className="flex gap-1">
                    {APPETITE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleAppetiteChange(m.id, opt.value)}
                        disabled={busy}
                        className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                          m.appetite === opt.value
                            ? 'bg-primary text-white border-primary'
                            : 'border-border text-text-light hover:border-text'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(m.id)}
                    disabled={busy}
                    className="p-1 text-text-light hover:text-red-500 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Ajouter un membre"
          className="flex-1 min-w-0 text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <select
          value={newAppetite}
          onChange={(e) => setNewAppetite(e.target.value)}
          className="text-sm border border-border rounded-lg px-2 py-1.5 bg-white"
        >
          {APPETITE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy || !newName.trim()}
          className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
