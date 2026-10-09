import { PizzaStyleId, PreDoughMethod, PreDoughSettings, SourdoughSettings } from './dough.model';

export interface PizzaStyle {
  id: PizzaStyleId;
  saltPercent: number;
  defaultHydrationPercent: number;
  defaultOilPercent: number;
  defaultSugarPercent: number;
  defaultBallWeightGrams: number;
  thicknessFactorGramsPerCm2: number;
}

export const PIZZA_STYLES: Record<PizzaStyleId, PizzaStyle> = {
  neapolitan: {
    id: 'neapolitan',
    saltPercent: 2.8,
    defaultHydrationPercent: 62,
    defaultOilPercent: 0,
    defaultSugarPercent: 0,
    defaultBallWeightGrams: 250,
    thicknessFactorGramsPerCm2: 0.354,
  },
  'new-york': {
    id: 'new-york',
    saltPercent: 2.5,
    defaultHydrationPercent: 63,
    defaultOilPercent: 2.5,
    defaultSugarPercent: 1.5,
    defaultBallWeightGrams: 450,
    thicknessFactorGramsPerCm2: 0.32,
  },
  roman: {
    id: 'roman',
    saltPercent: 2.5,
    defaultHydrationPercent: 60,
    defaultOilPercent: 0,
    defaultSugarPercent: 0,
    defaultBallWeightGrams: 180,
    thicknessFactorGramsPerCm2: 0.22,
  },
};

export const PRE_DOUGH_DEFAULTS: Record<PreDoughMethod, PreDoughSettings> = {
  poolish: {
    flourPercent: 30,
    hydrationPercent: 100,
    fermentation: { id: 'pre-dough', hours: 16, temperatureC: 18 },
  },
  biga: {
    flourPercent: 50,
    hydrationPercent: 50,
    fermentation: { id: 'pre-dough', hours: 18, temperatureC: 17 },
  },
};

export const SOURDOUGH_DEFAULTS: SourdoughSettings = {
  starterHydrationPercent: 100,
  starterMode: 'calculated',
  manualStarterPercent: 10,
};

export const YEAST_TYPE_FACTORS = {
  fresh: 1,
  instant: 1 / 3,
} as const;
