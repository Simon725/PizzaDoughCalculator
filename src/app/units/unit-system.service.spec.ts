import { TestBed } from '@angular/core/testing';
import { LANGUAGE_STORAGE_KEY, LanguageService } from '../i18n/language.service';
import { UNIT_SYSTEM_STORAGE_KEY, UnitSystemService, isUnitSystem } from './unit-system.service';

function createService(): UnitSystemService {
  TestBed.resetTestingModule();
  return TestBed.inject(UnitSystemService);
}

describe('UnitSystemService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses metric units by default', () => {
    expect(createService().unitSystem()).toBe('metric');
  });

  it('switches units and remembers the choice', () => {
    const service = createService();
    service.setUnitSystem('imperial');

    expect(service.unitSystem()).toBe('imperial');
    expect(localStorage.getItem(UNIT_SYSTEM_STORAGE_KEY)).toBe('imperial');
  });

  it('restores the stored choice on start', () => {
    localStorage.setItem(UNIT_SYSTEM_STORAGE_KEY, 'imperial');
    expect(createService().unitSystem()).toBe('imperial');
  });

  it('ignores invalid stored values', () => {
    localStorage.setItem(UNIT_SYSTEM_STORAGE_KEY, 'nautical');
    expect(createService().unitSystem()).toBe('metric');
  });

  it('is independent of the language', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    const units = createService();
    const language = TestBed.inject(LanguageService);
    expect(units.unitSystem()).toBe('metric');

    units.setUnitSystem('imperial');
    language.setLanguage('de');

    expect(units.unitSystem()).toBe('imperial');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('de');
    expect(localStorage.getItem(UNIT_SYSTEM_STORAGE_KEY)).toBe('imperial');
  });

  it('keeps working when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const service = createService();

    expect(service.unitSystem()).toBe('metric');
    expect(() => service.setUnitSystem('imperial')).not.toThrow();
    expect(service.unitSystem()).toBe('imperial');
  });

  it('recognises valid unit systems', () => {
    expect(isUnitSystem('imperial')).toBe(true);
    expect(isUnitSystem('us')).toBe(false);
    expect(isUnitSystem(null)).toBe(false);
  });
});
