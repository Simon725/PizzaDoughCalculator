import { FermentationPhase } from './dough.model';

export const YEAST_MODEL = {
  referenceTemperatureC: 20,
  temperatureDoublingStepC: 9,
  coefficient: 6.03,
  exponent: -1.29,
  minFreshYeastPercent: 0.02,
  maxFreshYeastPercent: 3,
} as const;

export type YeastClamp = 'none' | 'low' | 'high';

export interface FreshYeastEstimate {
  percent: number;
  clamp: YeastClamp;
}

export function equivalentHoursAt20C(phases: readonly FermentationPhase[]): number {
  return phases.reduce((sum, phase) => sum + phaseEquivalentHours(phase), 0);
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

export function totalHours(phases: readonly FermentationPhase[]): number {
  return phases.reduce((sum, phase) => sum + validHours(phase.hours), 0);
}

function phaseEquivalentHours(phase: FermentationPhase): number {
  const hours = validHours(phase.hours);
  if (hours === 0 || !Number.isFinite(phase.temperatureC)) {
    return 0;
  }
  const exponent =
    (phase.temperatureC - YEAST_MODEL.referenceTemperatureC) / YEAST_MODEL.temperatureDoublingStepC;
  return hours * Math.pow(2, exponent);
}

function validHours(hours: number): number {
  return Number.isFinite(hours) && hours > 0 ? hours : 0;
}
