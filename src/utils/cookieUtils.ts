/**
 * Cookie and First-time Tour Persistence Utilities
 * Provides resilient storage using both HTTP Cookies and localStorage
 * to ensure consistency across web browsers, Tauri desktop DMG/EXE apps, and iframes.
 */

const TOUR_COOKIE_KEY = 'threadline_tour_completed';

/**
 * Read a cookie by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

/**
 * Set a cookie with expiration in days
 */
export function setCookie(name: string, value: string, days: number = 365): void {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value || '')}${expires}; path=/; SameSite=Lax`;
}

/**
 * Check if the user has already completed the first-time app tour
 */
export function hasCompletedTour(): boolean {
  try {
    // Check cookie first
    const cookieVal = getCookie(TOUR_COOKIE_KEY);
    if (cookieVal === 'true') return true;

    // Fallback to localStorage (especially useful in desktop Tauri containers)
    if (typeof localStorage !== 'undefined') {
      const localVal = localStorage.getItem(TOUR_COOKIE_KEY);
      if (localVal === 'true') {
        // Synchronize back to cookie if missing
        setCookie(TOUR_COOKIE_KEY, 'true', 365);
        return true;
      }
    }
  } catch (e) {
    console.warn('Error reading tour cookie status:', e);
  }
  return false;
}

/**
 * Mark the first-time tour as completed
 */
export function markTourCompleted(): void {
  try {
    setCookie(TOUR_COOKIE_KEY, 'true', 365);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOUR_COOKIE_KEY, 'true');
    }
  } catch (e) {
    console.warn('Error saving tour cookie status:', e);
  }
}

/**
 * Reset tour status (allows user to re-take the tour from Settings)
 */
export function resetTourStatus(): void {
  try {
    if (typeof document !== 'undefined') {
      document.cookie = `${TOUR_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOUR_COOKIE_KEY);
    }
  } catch (e) {
    console.warn('Error resetting tour status:', e);
  }
}
