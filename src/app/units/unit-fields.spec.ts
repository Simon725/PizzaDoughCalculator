import { DOUGH_LIMITS, STORED_LIMITS, clampToLimit } from '../state/dough-limits';
import { temperatureField, weightField } from './unit-fields';

describe('unit fields', () => {
  it('keeps metric values and limits unchanged', () => {
    const field = weightField(DOUGH_LIMITS.ballWeightGrams, 'metric');

    expect(field.unit).toBe('g');
    expect(field.limit).toBe(DOUGH_LIMITS.ballWeightGrams);
    expect(field.toDisplay(265)).toBe(265);
    expect(field.toMetric(265)).toBe(265);
  });

  it('shows metric values as whole numbers without changing the entered value', () => {
    const temperature = temperatureField(DOUGH_LIMITS.temperatureC, 'metric');
    const weight = weightField(DOUGH_LIMITS.ballWeightGrams, 'metric');

    expect(temperature.toDisplay(21.7)).toBe(22);
    expect(temperature.toDisplay(21.1)).toBe(21);
    expect(temperature.toMetric(23)).toBe(23);
    expect(weight.toDisplay(354)).toBe(354);
  });

  it('shows the original imperial value after a metric display round trip', () => {
    const imperial = temperatureField(DOUGH_LIMITS.temperatureC, 'imperial');
    const metric = temperatureField(DOUGH_LIMITS.temperatureC, 'metric');
    const stored = clampToLimit(imperial.toMetric(71), STORED_LIMITS.temperatureC);

    expect(metric.toDisplay(stored)).toBe(22);
    expect(imperial.toDisplay(stored)).toBe(71);
  });

  it('converts the ball weight to ounces within the metric range', () => {
    const field = weightField(DOUGH_LIMITS.ballWeightGrams, 'imperial');

    expect(field.unit).toBe('oz');
    expect(field.limit).toEqual({ min: 4.5, max: 21, step: 0.5 });
    expect(field.toDisplay(250)).toBe(8.8);
    expect(field.toMetric(12.5)).toBeCloseTo(354.37, 2);
  });

  it('converts temperatures to whole Fahrenheit within the metric range', () => {
    expect(temperatureField(DOUGH_LIMITS.temperatureC, 'imperial').limit).toEqual({
      min: 32,
      max: 95,
      step: 1,
    });
    expect(temperatureField(DOUGH_LIMITS.targetDoughTemperatureC, 'imperial').limit).toEqual({
      min: 65,
      max: 86,
      step: 1,
    });
    const field = temperatureField(DOUGH_LIMITS.temperatureC, 'imperial');
    expect(field.unit).toBe('°F');
    expect(field.toDisplay(4)).toBe(39);
    expect(field.toMetric(212)).toBe(100);
  });

  it('shows every imperial ball weight unchanged after storing it', () => {
    const field = weightField(DOUGH_LIMITS.ballWeightGrams, 'imperial');
    for (let ounces = field.limit.min; ounces <= field.limit.max; ounces += field.limit.step) {
      const stored = clampToLimit(field.toMetric(ounces), STORED_LIMITS.ballWeightGrams);
      expect(field.toDisplay(stored)).toBe(ounces);
    }
  });

  it('shows every imperial temperature unchanged after storing it', () => {
    const field = temperatureField(DOUGH_LIMITS.temperatureC, 'imperial');
    for (let fahrenheit = field.limit.min; fahrenheit <= field.limit.max; fahrenheit += 1) {
      const stored = clampToLimit(field.toMetric(fahrenheit), STORED_LIMITS.temperatureC);
      expect(field.toDisplay(stored)).toBe(fahrenheit);
    }
  });
});
