import { DoughInput, DoughMethod, FermentationPhase, PreDoughSettings } from '../dough/dough.model';
import { PIZZA_STYLES, PRE_DOUGH_DEFAULTS } from '../dough/pizza-styles';

export function createPhase(hours: number, temperatureC: number): FermentationPhase {
  return { id: crypto.randomUUID(), hours, temperatureC };
}

export function createPreDoughDefaults(method: Exclude<DoughMethod, 'direct'>): PreDoughSettings {
  const defaults = PRE_DOUGH_DEFAULTS[method];
  return { ...defaults, fermentation: { ...defaults.fermentation } };
}

export function createDefaultInput(): DoughInput {
  const style = PIZZA_STYLES.neapolitan;
  return {
    method: 'direct',
    style: style.id,
    ballCount: 4,
    ballWeightGrams: style.defaultBallWeightGrams,
    hydrationPercent: style.defaultHydrationPercent,
    yeastType: 'fresh',
    preDough: createPreDoughDefaults('poolish'),
    phases: [createPhase(2, 22), createPhase(24, 4), createPhase(4, 22)],
  };
}
