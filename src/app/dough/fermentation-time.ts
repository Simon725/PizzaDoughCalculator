import { FermentationPhase } from './dough.model';

export interface TemperatureModel {
  referenceTemperatureC: number;
  temperatureDoublingStepC: number;
}

export function equivalentHours(
  phases: readonly FermentationPhase[],
  model: TemperatureModel,
): number {
  return phases.reduce((sum, phase) => sum + phaseEquivalentHours(phase, model), 0);
}

export function totalHours(phases: readonly FermentationPhase[]): number {
  return phases.reduce((sum, phase) => sum + validHours(phase.hours), 0);
}

function phaseEquivalentHours(phase: FermentationPhase, model: TemperatureModel): number {
  const hours = validHours(phase.hours);
  if (hours === 0 || !Number.isFinite(phase.temperatureC)) {
    return 0;
  }
  const exponent =
    (phase.temperatureC - model.referenceTemperatureC) / model.temperatureDoublingStepC;
  return hours * Math.pow(2, exponent);
}

function validHours(hours: number): number {
  return Number.isFinite(hours) && hours > 0 ? hours : 0;
}
