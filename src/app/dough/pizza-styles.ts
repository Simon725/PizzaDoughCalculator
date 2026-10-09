import { DoughMethod, PizzaStyleId, PreDoughSettings } from './dough.model';

export interface PizzaStyle {
  id: PizzaStyleId;
  name: string;
  description: string;
  saltPercent: number;
  defaultHydrationPercent: number;
  defaultBallWeightGrams: number;
  thicknessFactorGramsPerCm2: number;
}

export const PIZZA_STYLES: Record<PizzaStyleId, PizzaStyle> = {
  neapolitan: {
    id: 'neapolitan',
    name: 'Neapolitanisch',
    description: 'Dünne Mitte, luftiger Rand, 60–90 Sekunden bei 450 °C.',
    saltPercent: 2.8,
    defaultHydrationPercent: 62,
    defaultBallWeightGrams: 250,
    thicknessFactorGramsPerCm2: 0.354,
  },
  'new-york': {
    id: 'new-york',
    name: 'New York',
    description: 'Groß, dünn und faltbar. Gebacken im Haushaltsofen auf Stein oder Stahl.',
    saltPercent: 2.5,
    defaultHydrationPercent: 63,
    defaultBallWeightGrams: 450,
    thicknessFactorGramsPerCm2: 0.32,
  },
  roman: {
    id: 'roman',
    name: 'Römisch (tonda)',
    description: 'Hauchdünn und knusprig, flach ausgerollt.',
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
