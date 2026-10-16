import { FermentationPhase } from './dough.model';

export interface TemperatureModel {
  referenceTemperatureC: number;
  temperatureDoublingStepC: number;
  cold?: ColdTemperatureModel;
}

export interface ColdTemperatureModel {
  thresholdC: number;
  doublingStepC: number;
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
  return hours * activityFactor(phase.temperatureC, model);
}

function activityFactor(temperatureC: number, model: TemperatureModel): number {
  const { cold } = model;
  if (!cold || temperatureC >= cold.thresholdC) {
    return doublingFactor(
      temperatureC,
      model.referenceTemperatureC,
      model.temperatureDoublingStepC,
    );
  }
  return (
    doublingFactor(cold.thresholdC, model.referenceTemperatureC, model.temperatureDoublingStepC) *
    doublingFactor(temperatureC, cold.thresholdC, cold.doublingStepC)
  );
}

function doublingFactor(temperatureC: number, baseC: number, doublingStepC: number): number {
  return Math.pow(2, (temperatureC - baseC) / doublingStepC);
}

function validHours(hours: number): number {
  return Number.isFinite(hours) && hours > 0 ? hours : 0;
}
