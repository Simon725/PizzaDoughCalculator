import { SOURDOUGH_DEFAULTS } from '../dough/pizza-styles';
import { createDefaultInput } from './dough-defaults';
import {
  DOUGH_STORAGE_KEY,
  isDoughInput,
  loadDoughInput,
  saveDoughInput,
  withSourdoughDefaults,
} from './dough-storage';

function legacyInput(): Record<string, unknown> {
  const {
    sourdough: _sourdough,
    oilPercent: _oil,
    sugarPercent: _sugar,
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
      sourdough: { starterHydrationPercent: 65 },
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
  });

  it('adds sourdough defaults only when they are missing', () => {
    const custom = { sourdough: { starterHydrationPercent: 70 } };

    expect(withSourdoughDefaults(custom)).toBe(custom);
    expect(withSourdoughDefaults({})).toEqual({ sourdough: SOURDOUGH_DEFAULTS });
    expect(withSourdoughDefaults(null)).toBeNull();
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
  ])('rejects sourdough settings that are %s', (_label, sourdough) => {
    expect(isDoughInput({ ...createDefaultInput(), sourdough })).toBe(false);
  });

  it('accepts all four methods', () => {
    for (const method of ['direct', 'poolish', 'biga', 'sourdough']) {
      expect(isDoughInput({ ...createDefaultInput(), method })).toBe(true);
    }
  });
});
