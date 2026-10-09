import { calculateDough } from './dough-calculator';
import { DoughInput, IngredientAmounts } from './dough.model';
import { PRE_DOUGH_DEFAULTS, SOURDOUGH_DEFAULTS } from './pizza-styles';
import { WATER_TEMPERATURE_DEFAULTS } from './water-temperature';

function neapolitanInput(overrides: Partial<DoughInput> = {}): DoughInput {
  return {
    method: 'direct',
    style: 'neapolitan',
    ballCount: 4,
    ballWeightGrams: 250,
    hydrationPercent: 62,
    oilPercent: 0,
    sugarPercent: 0,
    yeastType: 'fresh',
    preDough: PRE_DOUGH_DEFAULTS.poolish,
    sourdough: SOURDOUGH_DEFAULTS,
    waterTemperature: WATER_TEMPERATURE_DEFAULTS,
    bakeSchedule: { enabled: false, bakeAt: '2026-10-10T17:00:00.000Z' },
    phases: [{ id: 'bulk', hours: 24, temperatureC: 20 }],
    ...overrides,
  };
}

function partSum(part: IngredientAmounts): number {
  return part.flour + part.water + part.salt + part.yeast + part.oil + part.sugar;
}

function warningCodes(input: DoughInput): string[] {
  return calculateDough(input).warnings.map((warning) => warning.code);
}

describe('calculateDough', () => {
  describe('direct method', () => {
    const result = calculateDough(neapolitanInput());

    it('adds 2 % bowl loss to the target weight', () => {
      expect(result.bowlLossGrams).toBeCloseTo(20, 10);
      expect(result.totals.total).toBeCloseTo(1020, 10);
    });

    it('computes 4 × 250 g Neapolitan at 62 %', () => {
      const expectedFlour = 1020 / (1 + 0.62 + 0.028 + result.freshYeastPercent / 100);
      expect(result.totals.flour).toBeCloseTo(expectedFlour, 10);
      expect(result.totals.flour).toBeCloseTo(618.6, 1);
      expect(result.totals.water).toBeCloseTo(expectedFlour * 0.62, 10);
      expect(result.totals.salt).toBeCloseTo(expectedFlour * 0.028, 10);
      expect(result.totals.yeast).toBeCloseTo(0.62, 2);
    });

    it('uses the main dough as totals and has no pre-dough', () => {
      expect(result.preDough).toBeNull();
      expect(result.mainDough).toEqual(result.totals);
    });

    it('reports style salt, equivalent hours and diameter', () => {
      expect(result.saltPercent).toBe(2.8);
      expect(result.equivalentHours).toBeCloseTo(24, 10);
      expect(result.referenceTemperatureC).toBe(20);
      expect(result.freshYeastPercent).toBeCloseTo(0.1, 2);
      expect(result.diameterCm).toBeCloseTo(30, 0);
      expect(result.warnings).toEqual([]);
    });

    it('converts fresh yeast to instant yeast with factor 1/3', () => {
      const fresh = calculateDough(neapolitanInput());
      const instant = calculateDough(neapolitanInput({ yeastType: 'instant' }));
      expect(instant.yeastType).toBe('instant');
      expect(instant.freshYeastPercent).toBeCloseTo(fresh.freshYeastPercent, 10);
      expect(instant.totals.yeast / instant.totals.flour).toBeCloseTo(
        fresh.totals.yeast / fresh.totals.flour / 3,
        10,
      );
      expect(instant.totals.total).toBeCloseTo(1020, 10);
    });
  });

  describe('yeast warnings', () => {
    it('warns when yeast is clamped low', () => {
      expect(
        warningCodes(neapolitanInput({ phases: [{ id: 'a', hours: 2000, temperatureC: 20 }] })),
      ).toEqual(['yeast-clamped-low']);
    });

    it('warns when yeast is clamped high', () => {
      expect(
        warningCodes(neapolitanInput({ phases: [{ id: 'a', hours: 0.5, temperatureC: 20 }] })),
      ).toEqual(['yeast-clamped-high']);
    });

    it('warns without fermentation and uses 3 %', () => {
      const result = calculateDough(neapolitanInput({ phases: [] }));
      expect(result.warnings.map((warning) => warning.code)).toEqual(['no-fermentation']);
      expect(result.freshYeastPercent).toBe(3);
    });

    it('treats phases with 0 hours as no fermentation', () => {
      expect(
        warningCodes(neapolitanInput({ phases: [{ id: 'a', hours: 0, temperatureC: 20 }] })),
      ).toEqual(['no-fermentation']);
    });
  });

  describe.each(['poolish', 'biga'] as const)('%s method', (method) => {
    const input = neapolitanInput({ method, preDough: PRE_DOUGH_DEFAULTS[method] });
    const result = calculateDough(input);
    const preDough = result.preDough!;

    it('splits the flour by the pre-dough share', () => {
      expect(preDough.flour).toBeCloseTo(
        (result.totals.flour * PRE_DOUGH_DEFAULTS[method].flourPercent) / 100,
        10,
      );
      expect(preDough.water).toBeCloseTo(
        (preDough.flour * PRE_DOUGH_DEFAULTS[method].hydrationPercent) / 100,
        10,
      );
      expect(preDough.salt).toBe(0);
    });

    it('keeps all parts summing to their totals', () => {
      expect(partSum(preDough)).toBeCloseTo(preDough.total, 10);
      expect(partSum(result.mainDough)).toBeCloseTo(result.mainDough.total, 10);
      expect(partSum(result.totals)).toBeCloseTo(result.totals.total, 10);
      expect(preDough.total + result.mainDough.total).toBeCloseTo(result.totals.total, 10);
      expect(result.totals.total).toBeCloseTo(1020, 10);
    });

    it('splits flour, water and yeast between the parts', () => {
      expect(preDough.flour + result.mainDough.flour).toBeCloseTo(result.totals.flour, 10);
      expect(preDough.water + result.mainDough.water).toBeCloseTo(result.totals.water, 10);
      expect(preDough.yeast + result.mainDough.yeast).toBeCloseTo(result.totals.yeast, 10);
      expect(result.mainDough.salt).toBeCloseTo(result.totals.salt, 10);
      expect(result.totals.water / result.totals.flour).toBeCloseTo(0.62, 10);
    });

    it('takes the main yeast from the main schedule on the total flour', () => {
      expect(result.totals.yeast / result.totals.flour).toBeCloseTo(
        result.freshYeastPercent / 100,
        10,
      );
      expect(result.mainDough.yeast).toBeGreaterThan(0);
    });
  });

  describe('pre-dough edge cases', () => {
    it('drops main yeast to 0 when the pre-dough needs more yeast', () => {
      const result = calculateDough(
        neapolitanInput({
          method: 'biga',
          preDough: {
            ...PRE_DOUGH_DEFAULTS.biga,
            fermentation: { id: 'pre-dough', hours: 1, temperatureC: 20 },
          },
        }),
      );
      expect(result.mainDough.yeast).toBe(0);
      expect(result.totals.yeast).toBeCloseTo(result.preDough!.yeast, 10);
      expect(result.preDough!.yeast / result.preDough!.flour).toBeCloseTo(0.03, 10);
      expect(result.totals.total).toBeCloseTo(1020, 10);
    });

    it('clamps negative main water to 0 and warns', () => {
      const result = calculateDough(
        neapolitanInput({
          method: 'poolish',
          hydrationPercent: 25,
          preDough: PRE_DOUGH_DEFAULTS.poolish,
        }),
      );
      expect(result.mainDough.water).toBe(0);
      expect(result.totals.water).toBeCloseTo(result.preDough!.water, 10);
      expect(result.totals.total).toBeCloseTo(1020, 10);
      expect(result.warnings.map((warning) => warning.code)).toContain('main-water-negative');
    });

    it('instant yeast in the pre-dough is a third of fresh', () => {
      const fresh = calculateDough(neapolitanInput({ method: 'poolish' }));
      const instant = calculateDough(neapolitanInput({ method: 'poolish', yeastType: 'instant' }));
      expect(instant.preDough!.yeast / instant.preDough!.flour).toBeCloseTo(
        fresh.preDough!.yeast / fresh.preDough!.flour / 3,
        10,
      );
    });
  });

  describe('sourdough method', () => {
    const sameDay = [{ id: 'bulk', hours: 8, temperatureC: 22 }];
    const input = neapolitanInput({ method: 'sourdough', phases: sameDay });
    const result = calculateDough(input);
    const starter = result.starter!;

    it('uses the starter instead of yeast and has no pre-dough', () => {
      expect(result.preDough).toBeNull();
      expect(result.freshYeastPercent).toBe(0);
      expect(result.totals.yeast).toBe(0);
      expect(result.mainDough.yeast).toBe(0);
      expect(starter.amounts.yeast).toBe(0);
      expect(result.warnings).toEqual([]);
    });

    it('derives the inoculation from the schedule at 22 °C', () => {
      expect(starter.inoculationPercent).toBeCloseTo(20, 10);
      expect(starter.amounts.total / result.totals.flour).toBeCloseTo(0.2, 10);
      expect(result.equivalentHours).toBeCloseTo(8, 10);
      expect(result.referenceTemperatureC).toBe(22);
    });

    it('splits the starter by its hydration', () => {
      expect(starter.hydrationPercent).toBe(100);
      expect(starter.amounts.flour).toBeCloseTo(starter.amounts.water, 10);
      expect(starter.amounts.salt).toBe(0);
    });

    it('counts starter flour and water toward the totals', () => {
      expect(starter.amounts.flour + result.mainDough.flour).toBeCloseTo(result.totals.flour, 10);
      expect(starter.amounts.water + result.mainDough.water).toBeCloseTo(result.totals.water, 10);
      expect(result.totals.water / result.totals.flour).toBeCloseTo(0.62, 10);
      expect(result.totals.salt / result.totals.flour).toBeCloseTo(0.028, 10);
    });

    it('keeps all parts summing to the dough weight', () => {
      expect(partSum(starter.amounts)).toBeCloseTo(starter.amounts.total, 10);
      expect(partSum(result.mainDough)).toBeCloseTo(result.mainDough.total, 10);
      expect(starter.amounts.total + result.mainDough.total).toBeCloseTo(result.totals.total, 10);
      expect(result.totals.total).toBeCloseTo(1020, 10);
    });

    it('computes 4 × 250 g Neapolitan with a 100 % starter', () => {
      expect(result.totals.flour).toBeCloseTo(1020 / 1.648, 10);
      expect(starter.amounts.total).toBeCloseTo(123.8, 1);
      expect(result.mainDough.flour).toBeCloseTo(557.0, 1);
      expect(result.mainDough.water).toBeCloseTo(322, 0);
    });

    it('uses less starter for a longer cold fermentation', () => {
      const cold = calculateDough(
        neapolitanInput({
          method: 'sourdough',
          phases: [
            { id: 'bulk', hours: 2, temperatureC: 22 },
            { id: 'fridge', hours: 24, temperatureC: 4 },
            { id: 'balls', hours: 4, temperatureC: 22 },
          ],
        }),
      );

      expect(cold.starter!.inoculationPercent).toBeGreaterThan(5);
      expect(cold.starter!.inoculationPercent).toBeLessThan(10);
    });

    it('uses the starter hydration for the flour and water split', () => {
      const stiff = calculateDough({ ...input, sourdough: { starterHydrationPercent: 50 } });
      const stiffStarter = stiff.starter!.amounts;

      expect(stiffStarter.water / stiffStarter.flour).toBeCloseTo(0.5, 10);
      expect(stiffStarter.total / stiff.totals.flour).toBeCloseTo(0.2, 10);
      expect(stiff.totals.water / stiff.totals.flour).toBeCloseTo(0.62, 10);
    });

    it('ignores the yeast type', () => {
      const instant = calculateDough({ ...input, yeastType: 'instant' });

      expect(instant.totals).toEqual(result.totals);
      expect(instant.starter).toEqual(result.starter);
    });

    it('puts oil and sugar into the main dough', () => {
      const enriched = calculateDough({
        ...input,
        style: 'new-york',
        oilPercent: 2.5,
        sugarPercent: 1.5,
      });

      expect(enriched.starter!.amounts.oil).toBe(0);
      expect(enriched.mainDough.oil).toBeCloseTo(enriched.totals.flour * 0.025, 10);
      expect(enriched.mainDough.sugar).toBeCloseTo(enriched.totals.flour * 0.015, 10);
      expect(enriched.totals.total).toBeCloseTo(1020, 10);
    });

    it('clamps negative main water to 0 and warns', () => {
      const wet = calculateDough({
        ...input,
        hydrationPercent: 5,
        sourdough: { starterHydrationPercent: 200 },
      });

      expect(wet.mainDough.water).toBe(0);
      expect(wet.totals.water).toBeCloseTo(wet.starter!.amounts.water, 10);
      expect(wet.totals.total).toBeCloseTo(1020, 10);
      expect(wet.warnings.map((warning) => warning.code)).toContain('starter-water-too-high');
    });

    it.each([
      ['low', 200, 'starter-clamped-low'],
      ['high', 2, 'starter-clamped-high'],
    ])('warns when the starter is clamped %s', (_label, hours, code) => {
      expect(warningCodes({ ...input, phases: [{ id: 'a', hours, temperatureC: 22 }] })).toEqual([
        code,
      ]);
    });

    it('warns without fermentation and uses the maximum starter', () => {
      const none = calculateDough({ ...input, phases: [] });

      expect(none.warnings.map((warning) => warning.code)).toEqual(['no-fermentation']);
      expect(none.starter!.inoculationPercent).toBe(30);
    });

    it('returns a zero starter for invalid input', () => {
      const invalid = calculateDough({ ...input, ballCount: 0 });

      expect(invalid.preDough).toBeNull();
      expect(invalid.starter!.amounts.total).toBe(0);
      expect(invalid.totals.total).toBe(0);
    });
  });

  describe('oil and sugar', () => {
    const enriched = { style: 'new-york', oilPercent: 2.5, sugarPercent: 1.5 } as const;

    it('adds no oil or sugar when the percentages are 0', () => {
      const result = calculateDough(neapolitanInput());

      expect(result.totals.oil).toBe(0);
      expect(result.totals.sugar).toBe(0);
    });

    it('computes oil and sugar relative to the flour in a direct dough', () => {
      const { flour, oil, sugar, total } = calculateDough(neapolitanInput(enriched)).totals;

      expect(oil / flour).toBeCloseTo(0.025, 10);
      expect(sugar / flour).toBeCloseTo(0.015, 10);
      expect(total).toBeCloseTo(1020, 10);
    });

    it('lowers the flour to make room for oil and sugar', () => {
      const plain = calculateDough(neapolitanInput({ style: 'new-york' }));
      const result = calculateDough(neapolitanInput(enriched));

      expect(result.totals.flour).toBeLessThan(plain.totals.flour);
      expect(partSum(result.totals)).toBeCloseTo(result.totals.total, 10);
    });

    it.each(['poolish', 'biga'] as const)('puts oil and sugar into the %s main dough', (method) => {
      const result = calculateDough(
        neapolitanInput({ ...enriched, method, preDough: PRE_DOUGH_DEFAULTS[method] }),
      );
      const preDough = result.preDough!;

      expect(preDough.oil).toBe(0);
      expect(preDough.sugar).toBe(0);
      expect(result.mainDough.oil).toBeCloseTo(result.totals.flour * 0.025, 10);
      expect(result.mainDough.sugar).toBeCloseTo(result.totals.flour * 0.015, 10);
      expect(preDough.total + result.mainDough.total).toBeCloseTo(result.totals.total, 10);
      expect(result.totals.total).toBeCloseTo(1020, 10);
    });
  });

  describe('water temperature', () => {
    it('reports the water temperature for the main dough', () => {
      expect(calculateDough(neapolitanInput()).waterTemperatureC).toBe(26);
      expect(calculateDough(neapolitanInput({ method: 'poolish' })).waterTemperatureC).toBe(32);
      expect(calculateDough(neapolitanInput({ method: 'sourdough' })).waterTemperatureC).toBe(28);
    });

    it('warns when ice water is needed', () => {
      const input = neapolitanInput({
        waterTemperature: { targetDoughC: 20, roomC: 30, flourC: 30, mixing: 'stand-mixer' },
      });

      expect(calculateDough(input).waterTemperatureC).toBe(0);
      expect(warningCodes(input)).toEqual(['water-temperature-low']);
    });

    it('warns when the water would be too hot', () => {
      const input = neapolitanInput({
        waterTemperature: { targetDoughC: 28, roomC: 12, flourC: 10, mixing: 'hand' },
      });

      expect(calculateDough(input).waterTemperatureC).toBe(45);
      expect(warningCodes(input)).toEqual(['water-temperature-high']);
    });

    it('keeps other warnings', () => {
      const input = neapolitanInput({
        phases: [],
        waterTemperature: { targetDoughC: 28, roomC: 12, flourC: 10, mixing: 'hand' },
      });

      expect(warningCodes(input)).toEqual(['no-fermentation', 'water-temperature-high']);
    });
  });

  describe('invalid input', () => {
    const zero = { flour: 0, water: 0, salt: 0, yeast: 0, oil: 0, sugar: 0, total: 0 };

    it.each([
      ['ball count 0', { ballCount: 0 }],
      ['negative ball count', { ballCount: -2 }],
      ['ball weight 0', { ballWeightGrams: 0 }],
      ['NaN ball weight', { ballWeightGrams: Number.NaN }],
      ['NaN hydration', { hydrationPercent: Number.NaN }],
      ['negative oil', { oilPercent: -1 }],
      ['NaN sugar', { sugarPercent: Number.NaN }],
    ] as const)('returns zeros for %s', (_label, overrides) => {
      const result = calculateDough(neapolitanInput(overrides));
      expect(result.totals).toEqual(zero);
      expect(result.mainDough).toEqual(zero);
      expect(result.bowlLossGrams).toBe(0);
      expect(result.diameterCm).toBe(0);
      expect(result.waterTemperatureC).toBeNull();
    });

    it('returns zeros for an unknown mixing type', () => {
      const waterTemperature = { ...WATER_TEMPERATURE_DEFAULTS, mixing: 'spoon' as never };

      expect(calculateDough(neapolitanInput({ waterTemperature })).totals).toEqual(zero);
    });

    it('returns a zero pre-dough for pre-dough methods', () => {
      const result = calculateDough(neapolitanInput({ method: 'biga', ballCount: 0 }));
      expect(result.preDough).toEqual(zero);
    });
  });
});
