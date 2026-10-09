import { TestBed } from '@angular/core/testing';
import { LANGUAGE_STORAGE_KEY, LanguageService, isLanguage } from './language.service';
import { TRANSLATIONS } from './translations';

function createService(): LanguageService {
  TestBed.resetTestingModule();
  const service = TestBed.inject(LanguageService);
  TestBed.tick();
  return service;
}

describe('LanguageService', () => {
  beforeEach(() => localStorage.clear());

  afterEach(() => vi.restoreAllMocks());

  it('uses English for an English browser', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB');
    expect(createService().language()).toBe('en');
  });

  it('falls back to German for other browser languages', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR');
    expect(createService().language()).toBe('de');
  });

  it('prefers the stored language', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'de');
    expect(createService().language()).toBe('de');
  });

  it('switches, stores and applies the language', () => {
    const service = createService();

    service.setLanguage('en');
    TestBed.tick();

    expect(service.t()).toBe(TRANSLATIONS.en);
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe('Pizza Dough Calculator');
  });

  it('recognises only supported languages', () => {
    expect(isLanguage('de')).toBe(true);
    expect(isLanguage('fr')).toBe(false);
    expect(isLanguage(null)).toBe(false);
  });
});
