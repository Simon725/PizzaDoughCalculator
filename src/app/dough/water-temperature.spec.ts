import {
  WATER_TEMPERATURE_DEFAULTS,
  WaterTemperatureInput,
  isValidWaterTemperatureSettings,
  preFermentTemperatureC,
  usesPreFerment,
  waterTemperatureFor,
} from './water-temperature';

function waterInput(overrides: Partial<WaterTemperatureInput> = {}): WaterTemperatureInput {
  return {
    method: 'direct',
    waterTemperature: WATER_TEMPERATURE_DEFAULTS,
    ...overrides,
  };
}

function withSettings(
  settings: Partial<WaterTemperatureInput['waterTemperature']>,
  overrides: Partial<WaterTemperatureInput> = {},
): WaterTemperatureInput {
  return waterInput({
    ...overrides,
    waterTemperature: { ...WATER_TEMPERATURE_DEFAULTS, ...settings },
  });
}

describe('waterTemperatureFor', () => {
  it('uses three factors for the direct method', () => {
    expect(waterTemperatureFor(waterInput())).toEqual({ temperatureC: 26, clamp: 'none' });
  });

  it('subtracts the stand mixer friction rise', () => {
    const estimate = waterTemperatureFor(withSettings({ mixing: 'stand-mixer' }));

    expect(estimate).toEqual({ temperatureC: 16, clamp: 'none' });
  });

  it.each(['poolish', 'biga', 'sourdough'] as const)(
    'uses the room temperature as pre-ferment temperature for %s by default',
    (method) => {
      const input = withSettings({ roomC: 20 }, { method });

      expect(waterTemperatureFor(input).temperatureC).toBe(4 * 24 - 20 - 22 - 20 - 2);
    },
  );

  it.each(['poolish', 'biga', 'sourdough'] as const)(
    'uses the set pre-ferment temperature for %s',
    (method) => {
      const input = withSettings({ preFermentC: 18 }, { method });

      expect(waterTemperatureFor(input).temperatureC).toBe(4 * 24 - 22 - 22 - 18 - 2);
    },
  );

  it('ignores the pre-ferment temperature for the direct method', () => {
    const direct = withSettings({ preFermentC: 4 });

    expect(waterTemperatureFor(direct)).toEqual({ temperatureC: 26, clamp: 'none' });
  });

  it('clamps to ice water when the result is below 0 °C', () => {
    const hotKitchen = withSettings({
      targetDoughC: 20,
      roomC: 30,
      flourC: 30,
      mixing: 'stand-mixer',
    });

    expect(waterTemperatureFor(hotKitchen)).toEqual({ temperatureC: 0, clamp: 'low' });
  });

  it('clamps to 45 °C when the result would be too hot', () => {
    const coldKitchen = withSettings({ targetDoughC: 28, roomC: 12, flourC: 10 });

    expect(waterTemperatureFor(coldKitchen)).toEqual({ temperatureC: 45, clamp: 'high' });
  });

  it('keeps the boundaries unclamped', () => {
    const atZero = withSettings({ targetDoughC: 20, roomC: 24, flourC: 24, mixing: 'stand-mixer' });

    expect(waterTemperatureFor(atZero)).toEqual({ temperatureC: 0, clamp: 'none' });
  });
});

describe('preFermentTemperatureC', () => {
  it('follows the room temperature until it is set', () => {
    expect(preFermentTemperatureC({ ...WATER_TEMPERATURE_DEFAULTS, roomC: 19 })).toBe(19);
    expect(preFermentTemperatureC({ ...WATER_TEMPERATURE_DEFAULTS, preFermentC: 0 })).toBe(0);
  });
});

describe('usesPreFerment', () => {
  it('is true for poolish, biga and sourdough only', () => {
    expect(usesPreFerment('direct')).toBe(false);
    expect(usesPreFerment('poolish')).toBe(true);
    expect(usesPreFerment('biga')).toBe(true);
    expect(usesPreFerment('sourdough')).toBe(true);
  });
});

describe('isValidWaterTemperatureSettings', () => {
  it('accepts a missing pre-ferment temperature and rejects a non-finite one', () => {
    expect(isValidWaterTemperatureSettings(WATER_TEMPERATURE_DEFAULTS)).toBe(true);
    expect(
      isValidWaterTemperatureSettings({ ...WATER_TEMPERATURE_DEFAULTS, preFermentC: NaN }),
    ).toBe(false);
  });
});
