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

  it('keeps the 9 °C doubling step down to 12 °C', () => {
    expect(equivalentHoursAt20C([{ id: 'a', hours: 10, temperatureC: 12 }])).toBeCloseTo(
      10 * Math.pow(2, -8 / 9),
      10,
    );
  });

  it('halves the speed every 3.5 °C below 12 °C', () => {
    const at12 = equivalentHoursAt20C([{ id: 'a', hours: 10, temperatureC: 12 }]);
    const at8 = equivalentHoursAt20C([{ id: 'b', hours: 10, temperatureC: 8.5 }]);
    expect(at8).toBeCloseTo(at12 / 2, 10);
  });

  it('counts a 4 °C fridge at about a tenth of 20 °C', () => {
    const fridgeHours = equivalentHoursAt20C([{ id: 'fridge', hours: 48, temperatureC: 4 }]);
    expect(fridgeHours).toBeCloseTo(48 * Math.pow(2, -8 / 9) * Math.pow(2, -8 / 3.5), 10);
    expect(fridgeHours).toBeGreaterThan(4);
    expect(fridgeHours).toBeLessThan(6);
  });

  it('sums several phases', () => {
    const hours = equivalentHoursAt20C([
      { id: 'bulk', hours: 2, temperatureC: 20 },
      { id: 'fridge', hours: 24, temperatureC: 4 },
      { id: 'balls', hours: 4, temperatureC: 20 },
    ]);
    expect(hours).toBeCloseTo(6 + 24 * Math.pow(2, -8 / 9) * Math.pow(2, -8 / 3.5), 10);
  });

  it('suggests 0.3–0.4 % fresh yeast for 1 h + 23 h at 5 °C + 4 h at 22 °C', () => {
    const phases = [
      { id: 'bulk', hours: 1, temperatureC: 18 },
      { id: 'fridge', hours: 23, temperatureC: 5 },
      { id: 'balls', hours: 4, temperatureC: 22 },
    ];
    const freshPercent = freshYeastPercentFor(equivalentHoursAt20C(phases)).percent;
    expect(freshPercent).toBeGreaterThan(0.3);
    expect(freshPercent).toBeLessThan(0.4);
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
