import {
  formatLength,
  formatTemperature,
  formatWeight,
  gramAmount,
  lengthAmount,
  temperatureAmount,
  weightAmount,
} from './unit-format';

describe('unit format', () => {
  it('shows weights in whole grams or ounces with one decimal', () => {
    expect(weightAmount(249.6, 'metric')).toEqual({ value: 250, decimals: 0, unit: 'g' });
    expect(weightAmount(250, 'imperial')).toEqual({ value: 8.8, decimals: 1, unit: 'oz' });
    expect(formatWeight(1010.5, 'metric', 'de-DE')).toBe('1.011 g');
    expect(formatWeight(1010.5, 'imperial', 'en-US')).toBe('35.6 oz');
    expect(formatWeight(1010.5, 'imperial', 'de-DE')).toBe('35,6 oz');
  });

  it('keeps small amounts in grams', () => {
    expect(gramAmount(1.234, 1)).toEqual({ value: 1.2, decimals: 1, unit: 'g' });
    expect(gramAmount(17.15)).toEqual({ value: 17, decimals: 0, unit: 'g' });
  });

  it('shows temperatures in whole degrees', () => {
    expect(temperatureAmount(21.4, 'metric')).toEqual({ value: 21, decimals: 0, unit: '°C' });
    expect(temperatureAmount(4, 'imperial')).toEqual({ value: 39, decimals: 0, unit: '°F' });
    expect(formatTemperature(22, 'imperial', 'en-US')).toBe('72 °F');
    expect(formatTemperature(450, 'imperial', 'en-US')).toBe('842 °F');
  });

  it('shows lengths in whole centimeters or inches', () => {
    expect(lengthAmount(29.4, 'metric')).toEqual({ value: 29, decimals: 0, unit: 'cm' });
    expect(lengthAmount(29.4, 'imperial')).toEqual({ value: 12, decimals: 0, unit: 'in' });
    expect(formatLength(35.5, 'imperial', 'en-US')).toBe('14 in');
  });
});
