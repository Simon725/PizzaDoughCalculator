import { DoughMethod, PizzaStyleId, PreDoughSettings } from './dough.model';

export interface PizzaStyle {
  id: PizzaStyleId;
  saltPercent: number;
  defaultHydrationPercent: number;
  defaultBallWeightGrams: number;
  thicknessFactorGramsPerCm2: number;
}

export const PIZZA_STYLES: Record<PizzaStyleId, PizzaStyle> = {
  neapolitan: {
    id: 'neapolitan',
    saltPercent: 2.8,
    defaultHydrationPercent: 62,
    defaultBallWeightGrams: 250,
    thicknessFactorGramsPerCm2: 0.354,
  },
  'new-york': {
    id: 'new-york',
    saltPercent: 2.5,
    defaultHydrationPercent: 63,
    defaultBallWeightGrams: 450,
    thicknessFactorGramsPerCm2: 0.32,
  },
  roman: {
    id: 'roman',
    saltPercent: 2.5,
    defaultHydrationPercent: 60,
    defaultBallWeightGrams: 180,
    thicknessFactorGramsPerCm2: 0.22,
  },
};

export const PRE_DOUGH_DEFAULTS: Record<Exclude<DoughMethod, 'direct'>, PreDoughSettings> = {
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

export const YEAST_TYPE_FACTORS = {
  fresh: 1,
  instant: 1 / 3,
} as const;
