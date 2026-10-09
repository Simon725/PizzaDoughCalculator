export interface NumberLimit {
  min: number;
  max: number;
  step: number;
}

export const DOUGH_LIMITS = {
  ballCount: { min: 1, max: 50, step: 1 },
  ballWeightGrams: { min: 120, max: 600, step: 5 },
  hydrationPercent: { min: 50, max: 85, step: 1 },
  oilPercent: { min: 0, max: 6, step: 0.5 },
  sugarPercent: { min: 0, max: 5, step: 0.5 },
  preDoughFlourPercent: { min: 10, max: 100, step: 1 },
  preDoughHydrationPercent: { min: 40, max: 120, step: 1 },
  hours: { min: 0, max: 120, step: 0.5 },
  temperatureC: { min: 0, max: 35, step: 1 },
} as const satisfies Record<string, NumberLimit>;

export function clampToLimit(value: number, limit: NumberLimit): number {
  if (!Number.isFinite(value)) {
    return limit.min;
  }
  const snapped = Math.round((value - limit.min) / limit.step) * limit.step + limit.min;
  const rounded = Number(snapped.toFixed(4));
  return Math.min(limit.max, Math.max(limit.min, rounded));
}

export function isWithinLimit(value: unknown, limit: NumberLimit): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= limit.min &&
    value <= limit.max
  );
}
