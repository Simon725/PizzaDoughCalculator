import { createSeededRandom, randomPointInDisc, scatterInDisc } from './seeded-random';

function take(random: () => number, count: number): number[] {
  return Array.from({ length: count }, () => random());
}

describe('seeded random', () => {
  it('returns the same sequence for the same seed', () => {
    expect(take(createSeededRandom(42), 5)).toEqual(take(createSeededRandom(42), 5));
  });

  it('returns different sequences for different seeds', () => {
    expect(take(createSeededRandom(1), 5)).not.toEqual(take(createSeededRandom(2), 5));
  });

  it('stays within [0, 1)', () => {
    const values = take(createSeededRandom(7), 1000);
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
  });

  it('places points inside the disc', () => {
    const random = createSeededRandom(3);
    const points = Array.from({ length: 200 }, () => randomPointInDisc(random, 5));
    expect(points.every((point) => Math.hypot(point.x, point.y) <= 5)).toBe(true);
  });

  it('scatters points with a minimum distance', () => {
    const points = scatterInDisc(createSeededRandom(9), 10, 8, 2.5);
    expect(points.length).toBe(10);
    for (const [index, a] of points.entries()) {
      for (const b of points.slice(index + 1)) {
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(2.5);
      }
    }
  });

  it('gives up instead of looping forever when the disc is too crowded', () => {
    expect(scatterInDisc(createSeededRandom(9), 50, 1, 2).length).toBeLessThan(50);
  });
});
