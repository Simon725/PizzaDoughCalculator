import { pizzaDiameterCm } from './diameter';
import { PIZZA_STYLES } from './pizza-styles';

describe('pizzaDiameterCm', () => {
  it('gives about 30 cm for a 250 g Neapolitan ball', () => {
    expect(pizzaDiameterCm(250, PIZZA_STYLES.neapolitan.thicknessFactorGramsPerCm2)).toBeCloseTo(
      30,
      0,
    );
  });

  it('returns 0 for invalid weights', () => {
    expect(pizzaDiameterCm(0, 0.354)).toBe(0);
    expect(pizzaDiameterCm(Number.NaN, 0.354)).toBe(0);
  });
});
