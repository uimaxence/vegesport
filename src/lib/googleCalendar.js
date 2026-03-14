/**
 * Ajout direct du planning à Google Calendar via OAuth2 + API Calendar.
 * Nécessite VITE_GOOGLE_CALENDAR_CLIENT_ID (Google Cloud Console).
 */

import { getPlanningEvents } from './calendarExport';

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const TIMEZONE = 'Europe/Paris';

function loadGoogleScript() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

/**
 * Ouvre le flux OAuth Google et retourne l'access_token (ou null).
 */
function requestGoogleToken(clientId) {
  return new Promise((resolve) => {
    if (!window.google?.accounts?.oauth2?.initTokenClient) {
      resolve(null);
      return;
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: CALENDAR_SCOPE,
      callback: (response) => {
        if (response?.access_token) resolve(response.access_token);
        else resolve(null);
      },
    });
    client.requestAccessToken();
  });
}

/**
 * Insère un événement dans Google Calendar.
 */
async function insertEvent(accessToken, event) {
  const body = {
    summary: event.summary,
    description: event.description,
    start: { dateTime: event.startISO, timeZone: TIMEZONE },
    end: { dateTime: event.endISO, timeZone: TIMEZONE },
  };
  const res = await fetch(CALENDAR_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  return res.json();
}

/**
 * Ajoute le planning à Google Calendar (OAuth + création des événements).
 * @returns {Promise<{ success: boolean, count: number, error?: string }>}
 */
export async function addToGoogleCalendar(planning, weekStart, getRecipe, mealTypes, days, mealsPerDay) {
  const clientId = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CALENDAR_CLIENT_ID;
  if (!clientId) {
    return { success: false, count: 0, error: 'Google Calendar non configuré (VITE_GOOGLE_CALENDAR_CLIENT_ID)' };
  }

  await loadGoogleScript();
  const accessToken = await requestGoogleToken(clientId);
  if (!accessToken) {
    return { success: false, count: 0, error: 'Connexion Google annulée ou refusée' };
  }

  const events = getPlanningEvents(planning, weekStart, getRecipe, mealTypes, days, mealsPerDay);
  let created = 0;
  for (const event of events) {
    try {
      await insertEvent(accessToken, event);
      created++;
    } catch (e) {
      return { success: false, count: created, error: e?.message || 'Erreur lors de l\'ajout d\'un événement' };
    }
  }
  return { success: true, count: created };
}

export function hasGoogleCalendarConfig() {
  return Boolean(typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CALENDAR_CLIENT_ID);
}
