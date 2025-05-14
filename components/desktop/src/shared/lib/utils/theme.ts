import { LocalStorage } from 'quasar';
import { Dark } from 'quasar';

const THEME_KEY = 'theme-mode';

export function saveThemeToStorage(isDark: boolean) {
  if (process.env.CLIENT) {
    LocalStorage.set(THEME_KEY, isDark ? 'dark' : 'light');
  }
}

export function getThemeFromStorage(): 'dark' | 'light' | null {
  if (process.env.CLIENT) {
    const saved = LocalStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return null;
  }
  return null;
}

export function applyThemeFromStorage() {
  if (process.env.CLIENT) {
    const saved = getThemeFromStorage();
    if (saved === 'dark') {
      Dark.set(true);
    } else if (saved === 'light') {
      Dark.set(false);
    }
  }
}
