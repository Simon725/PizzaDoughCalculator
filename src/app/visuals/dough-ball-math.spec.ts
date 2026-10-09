import { REFERENCE_BALL_WEIGHT_GRAMS, ballRow, ballScale } from './dough-ball-math';

describe('dough ball math', () => {
  it('scales with the cube root of the weight', () => {
    expect(ballScale(REFERENCE_BALL_WEIGHT_GRAMS)).toBe(1);
    expect(ballScale(REFERENCE_BALL_WEIGHT_GRAMS * 8)).toBeCloseTo(2);
    expect(ballScale(REFERENCE_BALL_WEIGHT_GRAMS / 8)).toBeCloseTo(0.5);
  });

  it('returns 0 for invalid weights', () => {
    expect(ballScale(0)).toBe(0);
    expect(ballScale(Number.NaN)).toBe(0);
  });

  it('shows all balls up to the limit', () => {
    expect(ballRow(4)).toEqual({ visible: 4, hidden: 0 });
    expect(ballRow(12)).toEqual({ visible: 12, hidden: 0 });
  });

  it('moves the rest into the overflow chip', () => {
    expect(ballRow(20)).toEqual({ visible: 12, hidden: 8 });
    expect(ballRow(5, 3)).toEqual({ visible: 3, hidden: 2 });
  });
});
