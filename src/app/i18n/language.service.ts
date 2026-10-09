import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import { LANGUAGES, Language, TRANSLATIONS } from './translations';

export const LANGUAGE_STORAGE_KEY = 'pizza-dough-calculator:language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly state = signal<Language>(loadLanguage());

  readonly language = this.state.asReadonly();
  readonly t = computed(() => TRANSLATIONS[this.state()]);

  constructor() {
    effect(() => {
      const root = this.document.documentElement;
      root.lang = this.state();
      this.document.title = this.t().app.title;
    });
  }

  setLanguage(language: Language): void {
    this.state.set(language);
    saveLanguage(language);
  }
}

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

function loadLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(stored) ? stored : browserLanguage();
  } catch {
    return browserLanguage();
  }
}

function browserLanguage(): Language {
  const preferred = typeof navigator === 'undefined' ? '' : navigator.language;
  return preferred.toLowerCase().startsWith('en') ? 'en' : 'de';
}

function saveLanguage(language: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    return;
  }
}
