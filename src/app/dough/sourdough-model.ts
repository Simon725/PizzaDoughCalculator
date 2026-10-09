import { FermentationPhase } from './dough.model';
import { equivalentHours } from './fermentation-time';
import { LeaveningClamp } from './yeast-model';

export const SOURDOUGH_MODEL = {
  referenceTemperatureC: 22,
  temperatureDoublingStepC: 8,
  calibrationHours: 8,
  calibrationStarterPercent: 20,
  exponent: -2.25,
  minStarterPercent: 2,
  maxStarterPercent: 30,
} as const;

export interface StarterEstimate {
  percent: number;
  clamp: LeaveningClamp;
}

export interface StarterComposition {
  flour: number;
  water: number;
}

export function equivalentHoursAt22C(phases: readonly FermentationPhase[]): number {
  return equivalentHours(phases, SOURDOUGH_MODEL);
}

export function starterPercentFor(equivalentHours: number): StarterEstimate {
  if (!(equivalentHours > 0)) {
    return { percent: SOURDOUGH_MODEL.maxStarterPercent, clamp: 'high' };
  }
  const rawPercent =
    SOURDOUGH_MODEL.calibrationStarterPercent *
    Math.pow(equivalentHours / SOURDOUGH_MODEL.calibrationHours, SOURDOUGH_MODEL.exponent);
  if (rawPercent < SOURDOUGH_MODEL.minStarterPercent) {
    return { percent: SOURDOUGH_MODEL.minStarterPercent, clamp: 'low' };
  }
  if (rawPercent > SOURDOUGH_MODEL.maxStarterPercent) {
    return { percent: SOURDOUGH_MODEL.maxStarterPercent, clamp: 'high' };
  }
  return { percent: rawPercent, clamp: 'none' };
}

export function starterComposition(
  starterAmount: number,
  hydrationPercent: number,
): StarterComposition {
  const waterPerFlour = Math.max(0, hydrationPercent) / 100;
  const flour = Math.max(0, starterAmount) / (1 + waterPerFlour);
  return { flour, water: flour * waterPerFlour };
}
