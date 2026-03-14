/**
 * Export du planning repas en fichier .ics (compatible Google Calendar, Apple Calendar, Outlook).
 */

import { getSlug } from './slug';

export const MEAL_TIMES = {
  'petit-dejeuner': { hour: 8, minute: 0, durationMinutes: 30 },
  'dejeuner': { hour: 12, minute: 30, durationMinutes: 60 },
  'collation': { hour: 16, minute: 0, durationMinutes: 30 },
  'diner': { hour: 19, minute: 30, durationMinutes: 60 },
};

function escapeIcsText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function formatIcsDate(date, hour, minute) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(hour).padStart(2, '0');
  const min = String(minute).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}00`;
}

/**
 * Retourne la liste des événements du planning (pour .ics ou Google Calendar).
 * Chaque événement a: summary, description, recipeUrl, startISO, endISO (RFC3339 Europe/Paris).
 */
export function getPlanningEvents(planning, weekStart, getRecipe, mealTypes, days, mealsPerDay = 4) {
  const activeMealTypes = mealTypes.slice(0, mealsPerDay);
  const weekStartDate = new Date(weekStart + 'T12:00:00');
  const tz = 'Europe/Paris';
  const events = [];

  days.forEach((dayName, dayIndex) => {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + dayIndex);

    activeMealTypes.forEach((mt) => {
      const recipeId = planning[dayName]?.[mt.id];
      const recipe = recipeId && getRecipe ? getRecipe(recipeId) : null;
      if (!recipe?.title) return;

      const times = MEAL_TIMES[mt.id] || { hour: 12, minute: 0, durationMinutes: 60 };
      const start = new Date(date);
      start.setHours(times.hour, times.minute, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + times.durationMinutes);

      const summary = `${mt.label} — ${recipe.title}`;
      const recipeUrl = `https://www.mamie-vege.fr/recettes/${getSlug(recipe.title)}`;
      const description = `Recette : ${recipe.title}\n${recipeUrl}`;

      events.push({
        summary,
        description,
        startISO: toLocalISO(start, tz),
        endISO: toLocalISO(end, tz),
      });
    });
  });

  return events;
}

/** Format date en ISO local pour l'API Google (YYYY-MM-DDTHH:mm:ss) + timeZone. */
function toLocalISO(date, timeZone) {
  const s = date.toLocaleString('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return s.replace(', ', 'T').replace(/\//g, '-');
}

/**
 * Génère le contenu .ics pour un planning hebdomadaire.
 */
export function buildPlanningIcs(planning, weekStart, getRecipe, mealTypes, days, mealsPerDay = 4) {
  const events = getPlanningEvents(planning, weekStart, getRecipe, mealTypes, days, mealsPerDay);
  const weekStartDate = new Date(weekStart + 'T12:00:00');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//et si mamie était végé ?//Planning repas//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach((ev, i) => {
    const startStr = ev.startISO.replace(/[-:]/g, '').replace('T', 'T');
    const endStr = ev.endISO.replace(/[-:]/g, '').replace('T', 'T');
    const uid = `mamie-vege-${weekStart}-${i}@mamie-vege`;
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTART:${startStr}`);
    lines.push(`DTEND:${endStr}`);
    lines.push(`SUMMARY:${escapeIcsText(ev.summary)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(ev.description)}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Télécharge le planning en fichier .ics
 */
export function downloadPlanningIcs(icsContent, filename = 'planning-repas-mamie-vege.ics') {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
