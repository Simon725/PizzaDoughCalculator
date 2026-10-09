import { FermentationPhase } from './dough.model';
import { equivalentHours } from './fermentation-time';

export const YEAST_MODEL = {
  referenceTemperatureC: 20,
  temperatureDoublingStepC: 9,
  coefficient: 6.03,
  exponent: -1.29,
  minFreshYeastPercent: 0.02,
  maxFreshYeastPercent: 3,
} as const;

export type LeaveningClamp = 'none' | 'low' | 'high';

export interface FreshYeastEstimate {
  percent: number;
  clamp: LeaveningClamp;
}

export function equivalentHoursAt20C(phases: readonly FermentationPhase[]): number {
  return equivalentHours(phases, YEAST_MODEL);
}

export function freshYeastPercentFor(equivalentHours: number): FreshYeastEstimate {
  if (!(equivalentHours > 0)) {
    return { percent: YEAST_MODEL.maxFreshYeastPercent, clamp: 'high' };
  }
  const rawPercent = YEAST_MODEL.coefficient * Math.pow(equivalentHours, YEAST_MODEL.exponent);
  if (rawPercent < YEAST_MODEL.minFreshYeastPercent) {
    return { percent: YEAST_MODEL.minFreshYeastPercent, clamp: 'low' };
  }
  if (rawPercent > YEAST_MODEL.maxFreshYeastPercent) {
    return { percent: YEAST_MODEL.maxFreshYeastPercent, clamp: 'high' };
  }
  return { percent: rawPercent, clamp: 'none' };
}
