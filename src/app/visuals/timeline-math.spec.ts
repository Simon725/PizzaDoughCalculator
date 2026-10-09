import { buildTimeline, isColdPhase, temperatureColor, timelineWidths } from './timeline-math';

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function channels(color: string): number[] {
  return (color.match(/\d+/g) ?? []).map(Number);
}

describe('timeline math', () => {
  describe('timelineWidths', () => {
    it('returns nothing for no phases', () => {
      expect(timelineWidths([])).toEqual([]);
    });

    it('uses a square root scale', () => {
      const [short, long] = timelineWidths([1, 16], 0);
      expect(long / short).toBeCloseTo(4);
    });

    it('always sums to 100 percent', () => {
      expect(sum(timelineWidths([2, 24, 4]))).toBeCloseTo(100);
      expect(sum(timelineWidths([0.5, 72, 0, 3, 1]))).toBeCloseTo(100);
    });

    it('keeps short phases visible with a minimum width', () => {
      const widths = timelineWidths([0.5, 120, 0], 10);
      expect(widths[0]).toBeCloseTo(10);
      expect(widths[2]).toBeCloseTo(10);
      expect(widths[1]).toBeCloseTo(80);
    });

    it('splits evenly when all phases are empty or too many', () => {
      expect(timelineWidths([0, 0])).toEqual([50, 50]);
      expect(timelineWidths([1, 2, 3, 4], 30)).toEqual([25, 25, 25, 25]);
    });
  });

  describe('temperatureColor', () => {
    it('is icy blue when cold', () => {
      const [red, , blue] = channels(temperatureColor(4));
      expect(blue).toBeGreaterThan(red);
    });

    it('is warm amber at room temperature', () => {
      const [red, green, blue] = channels(temperatureColor(20));
      expect(red).toBe(255);
      expect(green).toBeGreaterThan(blue);
    });

    it('turns into ember when hot', () => {
      const [, warmGreen] = channels(temperatureColor(20));
      const [red, hotGreen] = channels(temperatureColor(32));
      expect(red).toBeGreaterThan(200);
      expect(hotGreen).toBeLessThan(warmGreen);
    });

    it('clamps outside the colour range', () => {
      expect(temperatureColor(-5)).toBe(temperatureColor(0));
      expect(temperatureColor(50)).toBe(temperatureColor(35));
    });
  });

  it('marks fridge phases below 10 °C as cold', () => {
    expect(isColdPhase(4)).toBe(true);
    expect(isColdPhase(10)).toBe(false);
  });

  it('builds segments with width, colour and cold flag', () => {
    const segments = buildTimeline([
      { id: 'a', label: 'Vorteig', hours: 16, temperatureC: 18, isPreDough: true },
      { id: 'b', label: 'Phase 1', hours: 24, temperatureC: 4, isPreDough: false },
    ]);
    expect(segments.map((segment) => segment.isCold)).toEqual([false, true]);
    expect(sum(segments.map((segment) => segment.widthPercent))).toBeCloseTo(100);
    expect(segments[1].color).toBe(temperatureColor(4));
  });
});
