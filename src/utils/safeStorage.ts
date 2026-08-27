/**
 * Safe localStorage wrapper with QuotaExceededError handling and automatic cleanup
 */

export function safeLocalStorageSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014 ||
      (typeof err?.message === 'string' && err.message.toLowerCase().includes('quota'));

    if (isQuota) {
      console.warn(`[SafeStorage] localStorage quota reached on key "${key}". Performing graceful cleanup...`);

      // List of non-critical / heavy temporary cache keys to purge
      const nonCriticalKeys = [
        'azed_collapsed_images_list',
        'azed_collapsed_img',
        'azed_banner_img',
        'temp_upload_preview',
        'azed_force_reload_student',
        'azed_media_icons_data_v3',
        'azed_media_icons_data_v2'
      ];

      for (const k of nonCriticalKeys) {
        if (k !== key) {
          try {
            localStorage.removeItem(k);
          } catch {
            // ignore
          }
        }
      }

      // Retry setting item after clearing cache
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.warn(`[SafeStorage] Unable to persist key "${key}" to localStorage. Falling back to in-memory state.`);
        return false;
      }
    }

    console.warn(`[SafeStorage] Failed to set localStorage key "${key}":`, err);
    return false;
  }
}

export function safeLocalStorageGetItem(key: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[SafeStorage] Error reading key "${key}":`, err);
    return null;
  }
}

export function safeLocalStorageRemoveItem(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
