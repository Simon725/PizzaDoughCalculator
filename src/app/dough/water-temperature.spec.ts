import { PRE_DOUGH_DEFAULTS } from './pizza-styles';
import {
  WATER_TEMPERATURE_DEFAULTS,
  WaterTemperatureInput,
  waterTemperatureFor,
} from './water-temperature';

function waterInput(overrides: Partial<WaterTemperatureInput> = {}): WaterTemperatureInput {
  return {
    method: 'direct',
    preDough: PRE_DOUGH_DEFAULTS.poolish,
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

  it('uses the pre-ferment fermentation temperature as a fourth factor', () => {
    const poolish = waterInput({ method: 'poolish' });

    expect(waterTemperatureFor(poolish).temperatureC).toBe(4 * 24 - 22 - 22 - 18 - 2);
  });

  it('uses the biga fermentation temperature', () => {
    const biga = waterInput({ method: 'biga', preDough: PRE_DOUGH_DEFAULTS.biga });

    expect(waterTemperatureFor(biga).temperatureC).toBe(4 * 24 - 22 - 22 - 17 - 2);
  });

  it('assumes the sourdough starter is at room temperature', () => {
    const sourdough = withSettings({ roomC: 20 }, { method: 'sourdough' });

    expect(waterTemperatureFor(sourdough).temperatureC).toBe(4 * 24 - 20 - 22 - 20 - 2);
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
