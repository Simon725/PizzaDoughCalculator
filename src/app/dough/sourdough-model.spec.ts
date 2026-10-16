import { FermentationPhase } from './dough.model';
import {
  SOURDOUGH_MODEL,
  equivalentHoursAt22C,
  starterComposition,
  starterPercentFor,
} from './sourdough-model';
import { equivalentHoursAt20C, freshYeastPercentFor } from './yeast-model';

function coldSchedule(fridgeHours: number): FermentationPhase[] {
  return [
    { id: 'bulk', hours: 2, temperatureC: 22 },
    { id: 'fridge', hours: fridgeHours, temperatureC: 4 },
    { id: 'balls', hours: 4, temperatureC: 22 },
  ];
}

function starterPercentForSchedule(phases: FermentationPhase[]): number {
  return starterPercentFor(equivalentHoursAt22C(phases)).percent;
}

describe('sourdough model', () => {
  it('uses 20 % starter for 8 h at 22 °C', () => {
    expect(starterPercentForSchedule([{ id: 'a', hours: 8, temperatureC: 22 }])).toBeCloseTo(
      20,
      10,
    );
  });

  it('uses about 8 % starter for 12 h at 22 °C', () => {
    expect(starterPercentForSchedule([{ id: 'a', hours: 12, temperatureC: 22 }])).toBeCloseTo(
      8.0,
      1,
    );
  });

  it.each([
    [24, 19.6],
    [48, 11.7],
    [72, 7.7],
  ])('uses less starter for %i h in the fridge', (fridgeHours, expectedPercent) => {
    expect(starterPercentForSchedule(coldSchedule(fridgeHours))).toBeCloseTo(expectedPercent, 1);
  });

  it('keeps 24 h cold fermentation within 15–20 % starter', () => {
    const percent = starterPercentForSchedule(coldSchedule(24));

    expect(percent).toBeGreaterThan(15);
    expect(percent).toBeLessThan(20);
  });

  it('halves the speed every 3.5 °C below 12 °C', () => {
    const at12 = equivalentHoursAt22C([{ id: 'a', hours: 10, temperatureC: 12 }]);
    const at8 = equivalentHoursAt22C([{ id: 'b', hours: 10, temperatureC: 8.5 }]);

    expect(at12).toBeCloseTo(10 * Math.pow(2, -10 / 8), 10);
    expect(at8).toBeCloseTo(at12 / 2, 10);
  });

  it('counts a 4 °C fridge at about a twelfth of 22 °C', () => {
    const fridgeHours = equivalentHoursAt22C([{ id: 'fridge', hours: 24, temperatureC: 4 }]);

    expect(fridgeHours).toBeCloseTo(24 * Math.pow(2, -10 / 8) * Math.pow(2, -8 / 3.5), 10);
    expect(fridgeHours).toBeGreaterThan(1.8);
    expect(fridgeHours).toBeLessThan(2.2);
  });

  it('counts hours at 22 °C one to one', () => {
    expect(equivalentHoursAt22C([{ id: 'a', hours: 10, temperatureC: 22 }])).toBeCloseTo(10, 10);
  });

  it('doubles the speed every 8 °C', () => {
    expect(equivalentHoursAt22C([{ id: 'a', hours: 10, temperatureC: 30 }])).toBeCloseTo(20, 10);
    expect(equivalentHoursAt22C([{ id: 'a', hours: 10, temperatureC: 14 }])).toBeCloseTo(5, 10);
  });

  it('slows down more than yeast does above 12 °C', () => {
    const cool = [{ id: 'cool', hours: 24, temperatureC: 14 }];
    const room = [{ id: 'room', hours: 24, temperatureC: 22 }];

    const sourdoughRatio = equivalentHoursAt22C(cool) / equivalentHoursAt22C(room);
    const yeastRatio = equivalentHoursAt20C(cool) / equivalentHoursAt20C(room);

    expect(sourdoughRatio).toBeLessThan(yeastRatio);
  });

  it('slows down at least as much as yeast in the fridge', () => {
    const fridge = [{ id: 'fridge', hours: 24, temperatureC: 4 }];
    const room = [{ id: 'room', hours: 24, temperatureC: 22 }];

    const sourdoughRatio = equivalentHoursAt22C(fridge) / equivalentHoursAt22C(room);
    const yeastRatio = equivalentHoursAt20C(fridge) / equivalentHoursAt20C(room);

    expect(sourdoughRatio).toBeLessThanOrEqual(yeastRatio);
  });

  it('needs far more starter than fresh yeast for the same schedule', () => {
    const phases = [{ id: 'a', hours: 8, temperatureC: 22 }];

    expect(starterPercentForSchedule(phases)).toBeGreaterThan(
      freshYeastPercentFor(equivalentHoursAt20C(phases)).percent * 10,
    );
  });

  it('decreases the starter with longer fermentation', () => {
    const percents = [7, 8, 10, 14, 18].map((hours) => starterPercentFor(hours).percent);

    percents.slice(1).forEach((percent, index) => expect(percent).toBeLessThan(percents[index]));
  });

  it('ignores negative or invalid hours', () => {
    expect(
      equivalentHoursAt22C([
        { id: 'a', hours: -5, temperatureC: 22 },
        { id: 'b', hours: Number.NaN, temperatureC: 22 },
      ]),
    ).toBe(0);
  });

  it('clamps very long fermentation to the minimum', () => {
    expect(starterPercentFor(200)).toEqual({
      percent: SOURDOUGH_MODEL.minStarterPercent,
      clamp: 'low',
    });
  });

  it('clamps very short fermentation to the maximum', () => {
    expect(starterPercentFor(2)).toEqual({
      percent: SOURDOUGH_MODEL.maxStarterPercent,
      clamp: 'high',
    });
  });

  it('uses the maximum without fermentation', () => {
    expect(starterPercentFor(0)).toEqual({
      percent: SOURDOUGH_MODEL.maxStarterPercent,
      clamp: 'high',
    });
  });

  describe('starter composition', () => {
    it('splits a 100 % starter into equal flour and water', () => {
      expect(starterComposition(200, 100)).toEqual({ flour: 100, water: 100 });
    });

    it('splits a stiff 50 % starter', () => {
      const { flour, water } = starterComposition(150, 50);

      expect(flour).toBeCloseTo(100, 10);
      expect(water).toBeCloseTo(50, 10);
    });

    it('treats negative values as 0', () => {
      expect(starterComposition(-10, 100)).toEqual({ flour: 0, water: 0 });
      expect(starterComposition(100, -50)).toEqual({ flour: 100, water: 0 });
    });
  });
});
