import {
  DoughInput,
  FermentationPhase,
  PreDoughMethod,
  PreDoughSettings,
  SourdoughSettings,
  WaterTemperatureSettings,
} from '../dough/dough.model';
import { PIZZA_STYLES, PRE_DOUGH_DEFAULTS, SOURDOUGH_DEFAULTS } from '../dough/pizza-styles';
import { WATER_TEMPERATURE_DEFAULTS } from '../dough/water-temperature';

export function createPhase(hours: number, temperatureC: number): FermentationPhase {
  return { id: createPhaseId(), hours, temperatureC };
}

let phaseIdCounter = 0;

function createPhaseId(): string {
  phaseIdCounter += 1;
  return `phase-${Date.now().toString(36)}-${phaseIdCounter}`;
}

export function createPreDoughDefaults(method: PreDoughMethod): PreDoughSettings {
  const defaults = PRE_DOUGH_DEFAULTS[method];
  return { ...defaults, fermentation: { ...defaults.fermentation } };
}

export function createSourdoughDefaults(): SourdoughSettings {
  return { ...SOURDOUGH_DEFAULTS };
}

export function createWaterTemperatureDefaults(): WaterTemperatureSettings {
  return { ...WATER_TEMPERATURE_DEFAULTS };
}

export function createDefaultInput(): DoughInput {
  const style = PIZZA_STYLES.neapolitan;
  return {
    method: 'direct',
    style: style.id,
    ballCount: 4,
    ballWeightGrams: style.defaultBallWeightGrams,
    hydrationPercent: style.defaultHydrationPercent,
    oilPercent: style.defaultOilPercent,
    sugarPercent: style.defaultSugarPercent,
    yeastType: 'fresh',
    preDough: createPreDoughDefaults('poolish'),
    sourdough: createSourdoughDefaults(),
    waterTemperature: createWaterTemperatureDefaults(),
    phases: [createPhase(2, 22), createPhase(24, 4), createPhase(4, 22)],
  };
}
