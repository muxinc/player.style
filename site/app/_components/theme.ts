export const THEME_KEY = 'vjs-site-theme';

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

/**
 * Page background per resolved theme, written to the `theme-color` meta tag for browser chrome. The pre-paint script
 * runs before the stylesheet is available, so these cannot be read from CSS; keep them in step with `globals.css`.
 */
export const THEME_COLORS = { light: '#ebe4c1', dark: '#1e1d1d' } as const;

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value);
}

export function readThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_KEY);

    return isThemePreference(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

/** Resolve a preference to the `.dark` class and the `theme-color` meta, the same way the pre-paint script does. */
export function applyThemePreference(preference: ThemePreference) {
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const dark = preference === 'dark' || (preference === 'system' && systemDark);

  document.documentElement.classList.toggle('dark', dark);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? THEME_COLORS.dark : THEME_COLORS.light);
}

const CHANGE_EVENT = 'vjs-site-theme-change';

export function writeThemePreference(preference: ThemePreference) {
  try {
    localStorage.setItem(THEME_KEY, preference);
  } catch {
    // Private mode or blocked storage: the choice still applies for this page.
  }

  applyThemePreference(preference);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Subscribe to preference changes from this tab (the picker) and other tabs (the `storage` event). */
export function subscribeThemePreference(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);

  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}
