import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

export type ThemePreference = 'system' | 'dark' | 'light';

export const THEME_STORAGE_KEY = 'pizza-dough-calculator:theme';

const THEME_PREFERENCES: readonly string[] = ['system', 'dark', 'light'];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly state = signal<ThemePreference>(loadThemePreference());

  readonly preference = this.state.asReadonly();

  constructor() {
    this.applyTheme(this.state());
  }

  setPreference(preference: ThemePreference): void {
    this.state.set(preference);
    this.applyTheme(preference);
    saveThemePreference(preference);
  }

  private applyTheme(preference: ThemePreference): void {
    const root = this.document.documentElement;
    if (preference === 'system') {
      root.removeAttribute('data-theme');
      return;
    }
    root.setAttribute('data-theme', preference);
  }
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && THEME_PREFERENCES.includes(value);
}

function loadThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

function saveThemePreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    return;
  }
}
