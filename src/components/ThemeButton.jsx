import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';
const CHANGE_EVENT = 'themechange';

// Returns the system dark-mode query, or null where the browser has no matchMedia.
function systemQuery() {
  return typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null;
}

// Tells React when the theme may have changed: the visitor pressed the button or the system setting moved.
function subscribe(onChange) {
  const query = systemQuery();
  query?.addEventListener?.('change', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    query?.removeEventListener?.('change', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

// Reads the theme that is showing: the chosen one on <html>, else the system setting.
function readIsDark() {
  const chosen = document.documentElement.getAttribute('data-theme');
  return chosen ? chosen === 'dark' : Boolean(systemQuery()?.matches);
}

/**
 * The header's light and dark switch. It follows the visitor's system setting until they press
 * it, then remembers the choice in their own browser (localStorage, key "theme", the value light
 * or dark). public/theme-init.js applies the saved value before first paint; this button keeps
 * <html data-theme> in step afterwards. Every storage access is guarded, because a private window
 * or blocked site data can refuse it; the choice then lasts for this visit only. Nothing here
 * reads the browser during render, so the server markup and the first client render match.
 */
export default function ThemeButton() {
  const isDark = useSyncExternalStore(subscribe, readIsDark, () => false);

  // Flips between light and dark, applies it to <html> and saves it when storage allows.
  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage refused: the choice lasts for this visit.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label="Dark theme"
      title="Dark theme"
      className="inline-grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-line bg-surface p-0 text-ink hover:border-line-strong tab:h-9 tab:w-9"
    >
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
        <circle cx="10" cy="10" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 2.8a7.2 7.2 0 0 1 0 14.4z" fill="currentColor" />
      </svg>
    </button>
  );
}
