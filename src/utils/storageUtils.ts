/**
 * Safe localStorage wrapper that handles quota limits, prevents crashes,
 * and recovers gracefully if storage is tight.
 */

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(`[Threadline Storage] Quota exceeded or write error for key "${key}":`, err);

    // If quota exceeded, clean up legacy duplicate keys to free space
    try {
      const legacyKeys = [
        'threadline_snapshots',
        'threadline_ai_logs',
        'threadline_continuity',
        'threadline_revision_passes',
        'threadline_cutting_room',
        'threadline_notes'
      ];
      for (const lk of legacyKeys) {
        if (lk !== key) {
          localStorage.removeItem(lk);
        }
      }

      // Retry once after cleanup
      localStorage.setItem(key, value);
      return true;
    } catch (retryErr) {
      console.error(`[Threadline Storage] Critical: Unable to persist key "${key}" even after cleanup:`, retryErr);
      return false;
    }
  }
}

export function safeGetItem(key: string, fallback: string | null = null): string | null {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch (err) {
    console.warn(`[Threadline Storage] Error reading key "${key}":`, err);
    return fallback;
  }
}

export function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch (err) {
    console.warn('[Threadline Storage] Error parsing JSON data, using fallback:', err);
    return fallback;
  }
}
