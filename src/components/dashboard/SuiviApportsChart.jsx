import { useMemo, useState } from 'react';
import {
  computeWeekDataForChart,
  computeWeekDataDone,
  getDailyTargetsFromObjective,
} from '../../utils/dashboardPlanning';

const SERIES_CONFIG = [
  { id: 'calories', label: 'Calories', unit: 'kcal', color: '#E8450E' },
  { id: 'protein',  label: 'Protéines', unit: 'g',   color: '#2D6A4F' },
  { id: 'carbs',    label: 'Glucides',  unit: 'g',   color: '#F4A261' },
  { id: 'fat',      label: 'Lipides',   unit: 'g',   color: '#8B5CF6' },
];

const W = 520;
const H = 220;
const PAD = { top: 20, right: 12, bottom: 28, left: 8 };
const innerW = W - PAD.left - PAD.right;
const innerH = H - PAD.top - PAD.bottom;

function catmullRom(points) {
  if (points.length < 2) return points.map(([x, y]) => `M ${x} ${y}`).join(' ');
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/**
 * mealsDoneMap : { "lundi-dejeuner": true, ... } — facultatif.
 * Si fourni, affiche deux courbes : planifié (pointillé) + réalisé (plein).
 * Si absent, affiche uniquement le planifié.
 */
export default function SuiviApportsChart({ planning, getRecipe, portions = 2, mealsDoneMap }) {
  const hasDoneTracking = Boolean(mealsDoneMap);
  const [activeSeries, setActiveSeries] = useState(SERIES_CONFIG.map((s) => s.id));

  const weekPlanned = useMemo(
    () => computeWeekDataForChart(planning, getRecipe, portions),
    [planning, getRecipe, portions]
  );

  const weekDone = useMemo(
    () =>
      hasDoneTracking
        ? computeWeekDataDone(planning, getRecipe, mealsDoneMap, portions)
        : null,
    [planning, getRecipe, mealsDoneMap, portions, hasDoneTracking]
  );

  const targets = useMemo(
    () => getDailyTargetsFromObjective(planning?.objective || 'masse', 70, 'amateur'),
    [planning?.objective]
  );

  const toggleSeries = (id) =>
    setActiveSeries((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((s) => s !== id) : prev) : [...prev, id]
    );

  const xStep = innerW / Math.max(1, weekPlanned.length - 1);
  const toXY = (i, pct) => [PAD.left + i * xStep, PAD.top + innerH - (pct / yMax) * innerH];

  const seriesData = useMemo(() => {
    return SERIES_CONFIG.map((cfg) => {
      const target = targets[cfg.id] || 1;
      const plannedPcts = weekPlanned.map((d) => ((d[cfg.id] ?? 0) / target) * 100);
      const donePcts = weekDone
        ? weekDone.map((d) => ((d[cfg.id] ?? 0) / target) * 100)
        : null;
      return { ...cfg, plannedPcts, donePcts, target };
    });
  }, [weekPlanned, weekDone, targets]);

  const yMax = useMemo(() => {
    let m = 120;
    seriesData
      .filter((s) => activeSeries.includes(s.id))
      .forEach((s) => {
        s.plannedPcts.forEach((v) => { if (v > m) m = v; });
        s.donePcts?.forEach((v) => { if (v > m) m = v; });
      });
    return Math.ceil(m / 20) * 20;
  }, [seriesData, activeSeries]);

  const gridLines = [0, 50, 100].map((pct) => ({
    pct,
    y: PAD.top + innerH - (pct / yMax) * innerH,
  }));

  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  // Totaux du jour
  const todayPlanned = weekPlanned[todayIdx];
  const todayDone = weekDone?.[todayIdx];

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Suivi des apports
          </p>
          <p className="text-[15px] text-text-light mt-0.5">
            {hasDoneTracking
              ? 'Ligne pleine = réalisé · Pointillé = planifié · — = objectif'
              : 'Apports planifiés · — = objectif 100 %'}
          </p>
        </div>
        {hasDoneTracking && (
          <div className="flex items-center gap-3 text-[15px] text-text-light">
            <span className="flex items-center gap-1">
              <span className="inline-block w-5 h-0.5" style={{ background: '#2D6A4F' }} />
              Réalisé
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-5 h-0.5"
                style={{ background: '#2D6A4F', opacity: 0.35, borderTop: '2px dashed #2D6A4F', height: 0 }}
              />
              Planifié
            </span>
          </div>
        )}
      </div>

      {/* Légende / filtres */}
      <div className="flex flex-wrap gap-2 px-5 pt-4 pb-1">
        {seriesData.map((s) => {
          const active = activeSeries.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggleSeries(s.id)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[15px] font-medium border transition-all"
              style={{
                backgroundColor: active ? s.color : undefined,
                borderColor: active ? s.color : undefined,
                color: active ? '#fff' : '#6B6B6B',
              }}
            >
              {s.label}
              <span style={{ opacity: active ? 0.7 : 0.5, fontSize: 10 }}>
                {s.target}{s.unit !== 'kcal' ? 'g' : 'kcal'}
              </span>
            </button>
          );
        })}
      </div>

      {/* SVG */}
      <div className="px-5 pb-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ overflow: 'visible' }}>
          {/* Grilles */}
          {gridLines.map(({ pct, y }) => (
            <g key={pct}>
              <line
                x1={PAD.left} y1={y}
                x2={W - PAD.right} y2={y}
                stroke={pct === 100 ? '#E8450E' : '#E8E4DF'}
                strokeWidth={pct === 100 ? 1.5 : 0.8}
                strokeDasharray={pct === 100 ? '5 4' : undefined}
                opacity={pct === 100 ? 0.6 : 0.5}
              />
              <text x={PAD.left - 2} y={y + 4} textAnchor="end" fontSize={9} fill="#6B6B6B" style={{ fontFamily: 'system-ui' }}>
                {pct}%
              </text>
            </g>
          ))}

          {/* Zone d'aujourd'hui */}
          <rect
            x={PAD.left + todayIdx * xStep - xStep * 0.4}
            y={PAD.top}
            width={xStep * 0.8}
            height={innerH}
            fill="#E8450E"
            opacity={0.05}
            rx={4}
          />

          {/* Courbes */}
          {seriesData.map((s) => {
            if (!activeSeries.includes(s.id)) return null;
            const ptsPlan = weekPlanned.map((_, i) => toXY(i, s.plannedPcts[i]));
            const ptsDone = s.donePcts ? weekDone.map((_, i) => toXY(i, s.donePcts[i])) : null;

            return (
              <g key={s.id}>
                {/* Planifié : toujours affiché en pointillé plus léger */}
                <path
                  d={catmullRom(ptsPlan)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={hasDoneTracking ? 1.5 : 2.5}
                  strokeDasharray={hasDoneTracking ? '4 3' : undefined}
                  strokeLinecap="round"
                  opacity={hasDoneTracking ? 0.35 : 0.9}
                />

                {/* Réalisé : plein et épais */}
                {ptsDone && (
                  <path
                    d={catmullRom(ptsDone)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    opacity={0.95}
                  />
                )}

                {/* Points sur la courbe réalisée (ou planifiée si pas de tracking) */}
                {(ptsDone || ptsPlan).map(([cx, cy], i) => {
                  const val = ptsDone ? (weekDone[i]?.[s.id] ?? 0) : (weekPlanned[i]?.[s.id] ?? 0);
                  return (
                    <circle
                      key={i}
                      cx={cx} cy={cy}
                      r={val > 0 ? 3.5 : 2}
                      fill={val > 0 ? s.color : '#fff'}
                      stroke={s.color}
                      strokeWidth={1.5}
                      opacity={val > 0 ? 1 : 0.35}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Labels axe X */}
          {weekPlanned.map((d, i) => (
            <text
              key={d.dayId}
              x={PAD.left + i * xStep}
              y={H - 4}
              textAnchor="middle"
              fontSize={10}
              fill={i === todayIdx ? '#E8450E' : '#6B6B6B'}
              fontWeight={i === todayIdx ? '600' : '400'}
              style={{ fontFamily: 'system-ui' }}
            >
              {d.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Totaux du jour */}
      {todayPlanned && (
        <div className="px-5 pb-5 border-t border-border pt-3">
          <p className="text-[15px] text-text-light mb-2 uppercase tracking-wider">
            Aujourd'hui{hasDoneTracking ? ' — réalisé / planifié' : ' — planifié'}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {seriesData.map((s) => {
              const planVal = todayPlanned[s.id] ?? 0;
              const doneVal = hasDoneTracking ? (todayDone?.[s.id] ?? 0) : null;
              const pct = Math.round(((doneVal ?? planVal) / s.target) * 100);
              const unit = s.unit === 'kcal' ? 'kcal' : 'g';
              return (
                <div key={s.id} className="text-center">
                  {hasDoneTracking ? (
                    <>
                      <p className="text-sm font-bold" style={{ color: s.color }}>
                        {doneVal}{unit}
                      </p>
                      <p className="text-[13px] text-text-light/60">/ {planVal}{unit}</p>
                    </>
                  ) : (
                    <p className="text-sm font-bold" style={{ color: s.color }}>
                      {planVal}{unit}
                    </p>
                  )}
                  <p className="text-[13px] text-text-light mt-0.5">{s.label}</p>
                  <p className="text-[13px] font-medium" style={{ color: pct >= 80 ? s.color : '#6B6B6B' }}>
                    {pct}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
