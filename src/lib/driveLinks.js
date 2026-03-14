/**
 * Liens vers les drives pour la liste de courses.
 * - Carrefour : utilise le lien affilié si défini (VITE_CARREFOUR_DRIVE_URL), sinon lien direct.
 * - Courses U (Super U) : lien direct (pas d’affiliation publique).
 */

const CARREFOUR_DRIVE_DEFAULT = 'https://www.carrefour.fr/drive';
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
  return Boolean(
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_CARREFOUR_DRIVE_URL
  );
}
