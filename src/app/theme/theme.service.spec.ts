import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService, isThemePreference } from './theme.service';

function createService(): ThemeService {
  TestBed.resetTestingModule();
  return TestBed.inject(ThemeService);
}

function themeAttribute(): string | null {
  return document.documentElement.getAttribute('data-theme');
}

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('data-theme');
  });

  it('follows the system by default', () => {
    const service = createService();
    expect(service.preference()).toBe('system');
    expect(themeAttribute()).toBeNull();
  });

  it('sets data-theme and remembers the choice', () => {
    const service = createService();
    service.setPreference('dark');

    expect(service.preference()).toBe('dark');
    expect(themeAttribute()).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('removes data-theme when switching back to system', () => {
    const service = createService();
    service.setPreference('light');
    service.setPreference('system');

    expect(themeAttribute()).toBeNull();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
  });

  it('restores the stored choice on start', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    const service = createService();

    expect(service.preference()).toBe('light');
    expect(themeAttribute()).toBe('light');
  });

  it('ignores invalid stored values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'neon');
    expect(createService().preference()).toBe('system');
  });

  it('keeps working when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const service = createService();

    expect(service.preference()).toBe('system');
    expect(() => service.setPreference('dark')).not.toThrow();
    expect(themeAttribute()).toBe('dark');
  });

  it('recognises valid preferences', () => {
    expect(isThemePreference('dark')).toBe(true);
    expect(isThemePreference('blue')).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });
});
