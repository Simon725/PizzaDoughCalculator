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
  starterHydrationPercent: { min: 50, max: 200, step: 5 },
  starterPercent: { min: 2, max: 30, step: 0.5 },
  hours: { min: 0, max: 120, step: 0.5 },
  temperatureC: { min: 0, max: 35, step: 1 },
  targetDoughTemperatureC: { min: 18, max: 30, step: 1 },
  roomTemperatureC: { min: 10, max: 35, step: 1 },
  flourTemperatureC: { min: 0, max: 35, step: 1 },
  preFermentTemperatureC: { min: 0, max: 35, step: 1 },
} as const satisfies Record<string, NumberLimit>;

const STORED_WEIGHT_STEP_GRAMS = 1;
const STORED_TEMPERATURE_STEP_C = 0.1;

export const STORED_LIMITS = {
  ballWeightGrams: { ...DOUGH_LIMITS.ballWeightGrams, step: STORED_WEIGHT_STEP_GRAMS },
  temperatureC: { ...DOUGH_LIMITS.temperatureC, step: STORED_TEMPERATURE_STEP_C },
  targetDoughTemperatureC: {
    ...DOUGH_LIMITS.targetDoughTemperatureC,
    step: STORED_TEMPERATURE_STEP_C,
  },
  roomTemperatureC: { ...DOUGH_LIMITS.roomTemperatureC, step: STORED_TEMPERATURE_STEP_C },
  flourTemperatureC: { ...DOUGH_LIMITS.flourTemperatureC, step: STORED_TEMPERATURE_STEP_C },
  preFermentTemperatureC: {
    ...DOUGH_LIMITS.preFermentTemperatureC,
    step: STORED_TEMPERATURE_STEP_C,
  },
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
    typeof value === 'number' && Number.isFinite(value) && value >= limit.min && value <= limit.max
  );
}
