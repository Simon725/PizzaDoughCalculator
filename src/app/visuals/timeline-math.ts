export const COLD_THRESHOLD_C = 10;
export const MIN_SEGMENT_PERCENT = 8;

export interface TimelinePhase {
  id: string;
  label: string;
  hours: number;
  temperatureC: number;
  isPreDough: boolean;
}

export interface TimelineSegment extends TimelinePhase {
  widthPercent: number;
  color: string;
  isCold: boolean;
}

type Rgb = readonly [number, number, number];

const COLOR_STOPS: readonly (readonly [number, Rgb])[] = [
  [0, [111, 184, 255]],
  [8, [166, 220, 240]],
  [15, [255, 211, 138]],
  [22, [255, 169, 77]],
  [30, [255, 106, 43]],
  [35, [226, 64, 31]],
];

export function buildTimeline(phases: readonly TimelinePhase[]): TimelineSegment[] {
  const widths = timelineWidths(phases.map((phase) => phase.hours));
  return phases.map((phase, index) => ({
    ...phase,
    widthPercent: widths[index],
    color: temperatureColor(phase.temperatureC),
    isCold: isColdPhase(phase.temperatureC),
  }));
}

export function isColdPhase(temperatureC: number): boolean {
  return temperatureC < COLD_THRESHOLD_C;
}

export function timelineWidths(
  hours: readonly number[],
  minPercent = MIN_SEGMENT_PERCENT,
): number[] {
  const count = hours.length;
  const weights = hours.map((value) => Math.sqrt(Math.max(0, value)));
  if (count === 0) {
    return [];
  }
  if (minPercent * count >= 100 || sum(weights) === 0) {
    return weights.map(() => 100 / count);
  }
  const pinned = new Set<number>();
  for (;;) {
    const widths = distribute(weights, pinned, minPercent);
    const tooNarrow = widths.flatMap((width, index) =>
      !pinned.has(index) && width < minPercent ? [index] : [],
    );
    if (tooNarrow.length === 0) {
      return widths;
    }
    tooNarrow.forEach((index) => pinned.add(index));
  }
}

export function temperatureColor(temperatureC: number): string {
  const [r, g, b] = interpolateStops(temperatureC);
  return `rgb(${r}, ${g}, ${b})`;
}

function distribute(weights: readonly number[], pinned: ReadonlySet<number>, minPercent: number): number[] {
  const freePercent = 100 - pinned.size * minPercent;
  const freeWeight = sum(weights.filter((_, index) => !pinned.has(index)));
  return weights.map((weight, index) =>
    pinned.has(index) ? minPercent : (weight / freeWeight) * freePercent,
  );
}

function interpolateStops(temperatureC: number): Rgb {
  const first = COLOR_STOPS[0];
  const last = COLOR_STOPS[COLOR_STOPS.length - 1];
  if (!(temperatureC > first[0])) {
    return first[1];
  }
  if (temperatureC >= last[0]) {
    return last[1];
  }
  const upperIndex = COLOR_STOPS.findIndex(([stop]) => stop >= temperatureC);
  const [lowerTemp, lowerColor] = COLOR_STOPS[upperIndex - 1];
  const [upperTemp, upperColor] = COLOR_STOPS[upperIndex];
  const progress = (temperatureC - lowerTemp) / (upperTemp - lowerTemp);
  const mix = (channel: 0 | 1 | 2): number =>
    Math.round(lowerColor[channel] + (upperColor[channel] - lowerColor[channel]) * progress);
  return [mix(0), mix(1), mix(2)];
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
