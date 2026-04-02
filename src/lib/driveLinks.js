/**
 * Liens vers les drives pour la liste de courses.
 * - Carrefour : utilise le lien affilié si défini (VITE_CARREFOUR_DRIVE_URL), sinon lien direct.
 * - Courses U (Super U) : lien direct (pas d’affiliation publique).
 */

const CARREFOUR_DRIVE_DEFAULT = 'https://action.metaffiliation.com/trk.php?mclic=P51378758A50B2131&redir=https%3A%2F%2Fwww.carrefour.fr%2Fservices%2Fdrive';
const COURSES_U_DRIVE = 'https://www.coursesu.com/drive/home';

export function getCarrefourDriveUrl() {
  return typeof import.meta !== 'undefined' && import.meta.env?.VITE_CARREFOUR_DRIVE_URL
    ? import.meta.env.VITE_CARREFOUR_DRIVE_URL
    : CARREFOUR_DRIVE_DEFAULT;
}

export function getCoursesUDriveUrl() {
  return COURSES_U_DRIVE;
}

export function hasCarrefourAffiliate() {
  return true;
}
