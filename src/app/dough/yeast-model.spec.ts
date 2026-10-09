import { equivalentHoursAt20C, freshYeastPercentFor, YEAST_MODEL } from './yeast-model';

describe('yeast model', () => {
  it('matches the calibration points', () => {
    expect(freshYeastPercentFor(24).percent).toBeCloseTo(0.1, 2);
    expect(freshYeastPercentFor(6).percent).toBeCloseTo(0.6, 2);
  });

  it('counts hours at 20 °C one to one', () => {
    expect(equivalentHoursAt20C([{ id: 'a', hours: 10, temperatureC: 20 }])).toBeCloseTo(10, 10);
  });

  it('doubles the speed every 9 °C', () => {
    expect(equivalentHoursAt20C([{ id: 'a', hours: 10, temperatureC: 29 }])).toBeCloseTo(20, 10);
  });

  it('counts a 4 °C fridge much less', () => {
    const fridgeHours = equivalentHoursAt20C([{ id: 'fridge', hours: 48, temperatureC: 4 }]);
    expect(fridgeHours).toBeCloseTo(48 * Math.pow(2, -16 / 9), 10);
    expect(fridgeHours).toBeLessThan(15);
  });

  it('sums several phases', () => {
    const hours = equivalentHoursAt20C([
      { id: 'bulk', hours: 2, temperatureC: 20 },
      { id: 'fridge', hours: 24, temperatureC: 4 },
      { id: 'balls', hours: 4, temperatureC: 20 },
    ]);
    expect(hours).toBeCloseTo(6 + 24 * Math.pow(2, -16 / 9), 10);
  });

  it('ignores negative or invalid hours', () => {
    expect(
      equivalentHoursAt20C([
        { id: 'a', hours: -5, temperatureC: 20 },
        { id: 'b', hours: Number.NaN, temperatureC: 20 },
      ]),
    ).toBe(0);
  });

  it('clamps very long fermentation to the minimum', () => {
    expect(freshYeastPercentFor(10_000)).toEqual({
      percent: YEAST_MODEL.minFreshYeastPercent,
      clamp: 'low',
    });
  });

  it('clamps very short fermentation to the maximum', () => {
    expect(freshYeastPercentFor(0.5)).toEqual({
      percent: YEAST_MODEL.maxFreshYeastPercent,
      clamp: 'high',
    });
  });

  it('uses the maximum without fermentation', () => {
    expect(freshYeastPercentFor(0).percent).toBe(YEAST_MODEL.maxFreshYeastPercent);
  });
});
