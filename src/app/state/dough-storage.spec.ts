import { SOURDOUGH_DEFAULTS } from '../dough/pizza-styles';
import { WATER_TEMPERATURE_DEFAULTS } from '../dough/water-temperature';
import { createDefaultInput } from './dough-defaults';
import {
  DOUGH_STORAGE_KEY,
  isDoughInput,
  loadDoughInput,
  saveDoughInput,
  withBakeScheduleDefaults,
  withSourdoughDefaults,
  withWaterTemperatureDefaults,
} from './dough-storage';

function legacyInput(): Record<string, unknown> {
  const {
    sourdough: _sourdough,
    oilPercent: _oil,
    sugarPercent: _sugar,
    waterTemperature: _waterTemperature,
    bakeSchedule: _bakeSchedule,
    ...legacy
  } = createDefaultInput();
  return legacy;
}

describe('dough storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a sourdough input', () => {
    const input = {
      ...createDefaultInput(),
      method: 'sourdough' as const,
      sourdough: {
        starterHydrationPercent: 65,
        starterMode: 'manual' as const,
        manualStarterPercent: 7.5,
      },
    };

    saveDoughInput(input);

    expect(loadDoughInput()).toEqual(input);
  });

  it('loads input saved before oil, sugar and sourdough existed', () => {
    localStorage.setItem(DOUGH_STORAGE_KEY, JSON.stringify(legacyInput()));

    const loaded = loadDoughInput();

    expect(loaded?.sourdough).toEqual(SOURDOUGH_DEFAULTS);
    expect(loaded?.oilPercent).toBe(0);
    expect(loaded?.sugarPercent).toBe(0);
    expect(loaded?.waterTemperature).toEqual(WATER_TEMPERATURE_DEFAULTS);
  });

  it('loads input saved before the water temperature existed', () => {
    const { waterTemperature: _waterTemperature, ...saved } = {
      ...createDefaultInput(),
      method: 'biga' as const,
      ballCount: 6,
    };
    localStorage.setItem(DOUGH_STORAGE_KEY, JSON.stringify(saved));

    const loaded = loadDoughInput();

    expect(loaded?.ballCount).toBe(6);
    expect(loaded?.waterTemperature).toEqual(WATER_TEMPERATURE_DEFAULTS);
  });

  it('round-trips water temperature settings', () => {
    const input = {
      ...createDefaultInput(),
      waterTemperature: { targetDoughC: 26, roomC: 18, flourC: 16, mixing: 'stand-mixer' as const },
    };

    saveDoughInput(input);

    expect(loadDoughInput()).toEqual(input);
  });

  it('round-trips a set pre-ferment temperature', () => {
    const input = {
      ...createDefaultInput(),
      method: 'poolish' as const,
      waterTemperature: { ...WATER_TEMPERATURE_DEFAULTS, preFermentC: 12.5 },
    };

    saveDoughInput(input);

    expect(loadDoughInput()).toEqual(input);
  });

  it('loads water temperature settings saved before the pre-ferment temperature existed', () => {
    const saved = {
      ...createDefaultInput(),
      waterTemperature: { targetDoughC: 25, roomC: 19, flourC: 18, mixing: 'hand' },
    };
    localStorage.setItem(DOUGH_STORAGE_KEY, JSON.stringify(saved));

    const loaded = loadDoughInput();

    expect(loaded?.waterTemperature).toEqual(saved.waterTemperature);
    expect(loaded?.waterTemperature.preFermentC).toBeUndefined();
  });

  it('adds water temperature defaults only when they are missing', () => {
    const custom = { waterTemperature: { ...WATER_TEMPERATURE_DEFAULTS, roomC: 30 } };
    const filled = withWaterTemperatureDefaults({}) as { waterTemperature: unknown };

    expect(withWaterTemperatureDefaults(custom)).toBe(custom);
    expect(filled).toEqual({ waterTemperature: WATER_TEMPERATURE_DEFAULTS });
    expect(filled.waterTemperature).not.toBe(WATER_TEMPERATURE_DEFAULTS);
    expect(withWaterTemperatureDefaults(null)).toBeNull();
  });

  it.each([
    ['not an object', 24],
    ['below the target limit', { ...WATER_TEMPERATURE_DEFAULTS, targetDoughC: 10 }],
    ['above the room limit', { ...WATER_TEMPERATURE_DEFAULTS, roomC: 50 }],
    ['not a number', { ...WATER_TEMPERATURE_DEFAULTS, flourC: '22' }],
    ['an unknown mixing type', { ...WATER_TEMPERATURE_DEFAULTS, mixing: 'spoon' }],
    ['above the pre-ferment limit', { ...WATER_TEMPERATURE_DEFAULTS, preFermentC: 36 }],
    ['a null pre-ferment', { ...WATER_TEMPERATURE_DEFAULTS, preFermentC: null }],
  ])('rejects water temperature settings that are %s', (_label, waterTemperature) => {
    expect(isDoughInput({ ...createDefaultInput(), waterTemperature })).toBe(false);
  });

  it('adds sourdough defaults only when they are missing', () => {
    const custom = {
      sourdough: { starterHydrationPercent: 70, starterMode: 'manual', manualStarterPercent: 4 },
    };

    expect(withSourdoughDefaults(custom)).toEqual(custom);
    expect(withSourdoughDefaults({})).toEqual({ sourdough: SOURDOUGH_DEFAULTS });
    expect(withSourdoughDefaults(null)).toBeNull();
  });

  it('loads sourdough settings saved before the manual starter existed', () => {
    const saved = {
      ...createDefaultInput(),
      method: 'sourdough',
      sourdough: { starterHydrationPercent: 80 },
    };
    localStorage.setItem(DOUGH_STORAGE_KEY, JSON.stringify(saved));

    const loaded = loadDoughInput();

    expect(loaded?.method).toBe('sourdough');
    expect(loaded?.sourdough).toEqual({ ...SOURDOUGH_DEFAULTS, starterHydrationPercent: 80 });
    expect(loaded?.sourdough.starterMode).toBe('calculated');
  });

  it('does not share the default sourdough object', () => {
    const filled = withSourdoughDefaults({}) as { sourdough: unknown };

    expect(filled.sourdough).not.toBe(SOURDOUGH_DEFAULTS);
  });

  it.each([
    ['missing', undefined],
    ['not an object', 100],
    ['below the limit', { starterHydrationPercent: 40 }],
    ['above the limit', { starterHydrationPercent: 250 }],
    ['not a number', { starterHydrationPercent: '100' }],
    ['in an unknown starter mode', { ...SOURDOUGH_DEFAULTS, starterMode: 'auto' }],
    ['below the manual limit', { ...SOURDOUGH_DEFAULTS, manualStarterPercent: 1 }],
    ['above the manual limit', { ...SOURDOUGH_DEFAULTS, manualStarterPercent: 31 }],
  ])('rejects sourdough settings that are %s', (_label, sourdough) => {
    expect(isDoughInput({ ...createDefaultInput(), sourdough })).toBe(false);
  });

  it('accepts all four methods', () => {
    for (const method of ['direct', 'poolish', 'biga', 'sourdough']) {
      expect(isDoughInput({ ...createDefaultInput(), method })).toBe(true);
    }
  });

  it('loads input saved before the bake schedule existed', () => {
    const { bakeSchedule: _bakeSchedule, ...saved } = { ...createDefaultInput(), ballCount: 7 };
    localStorage.setItem(DOUGH_STORAGE_KEY, JSON.stringify(saved));

    const loaded = loadDoughInput();

    expect(loaded?.ballCount).toBe(7);
    expect(loaded?.bakeSchedule.enabled).toBe(false);
    expect(Number.isNaN(Date.parse(loaded?.bakeSchedule.bakeAt ?? ''))).toBe(false);
  });

  it('keeps a stored bake time that lies in the past', () => {
    const input = {
      ...createDefaultInput(),
      bakeSchedule: { enabled: true, bakeAt: '2020-01-03T18:00:00.000Z' },
    };

    saveDoughInput(input);

    expect(loadDoughInput()).toEqual(input);
  });

  it('adds bake schedule defaults only when they are missing', () => {
    const custom = { bakeSchedule: { enabled: true, bakeAt: '2026-10-10T17:00:00.000Z' } };

    expect(withBakeScheduleDefaults(custom)).toBe(custom);
    expect(withBakeScheduleDefaults(null)).toBeNull();
  });

  it.each([
    ['missing', undefined],
    ['not an object', true],
    ['without a boolean flag', { enabled: 'yes', bakeAt: '2026-10-10T17:00:00.000Z' }],
    ['without a valid time', { enabled: true, bakeAt: 'saturday' }],
  ])('rejects bake schedule settings that are %s', (_label, bakeSchedule) => {
    expect(isDoughInput({ ...createDefaultInput(), bakeSchedule })).toBe(false);
  });
});
