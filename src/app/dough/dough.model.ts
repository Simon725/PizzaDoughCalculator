export type PreDoughMethod = 'poolish' | 'biga';

export type DoughMethod = 'direct' | PreDoughMethod | 'sourdough';

export type PizzaStyleId = 'neapolitan' | 'new-york' | 'roman';

export type YeastType = 'fresh' | 'instant';

export type MixingType = 'hand' | 'stand-mixer';

export interface FermentationPhase {
  id: string;
  hours: number;
  temperatureC: number;
}

export interface PreDoughSettings {
  flourPercent: number;
  hydrationPercent: number;
  fermentation: FermentationPhase;
}

export interface SourdoughSettings {
  starterHydrationPercent: number;
}

export interface WaterTemperatureSettings {
  targetDoughC: number;
  roomC: number;
  flourC: number;
  mixing: MixingType;
}

export interface DoughInput {
  method: DoughMethod;
  style: PizzaStyleId;
  ballCount: number;
  ballWeightGrams: number;
  hydrationPercent: number;
  oilPercent: number;
  sugarPercent: number;
  yeastType: YeastType;
  preDough: PreDoughSettings;
  sourdough: SourdoughSettings;
  waterTemperature: WaterTemperatureSettings;
  phases: FermentationPhase[];
}

export interface IngredientAmounts {
  flour: number;
  water: number;
  salt: number;
  yeast: number;
  oil: number;
  sugar: number;
  total: number;
}

export type DoughWarningCode =
  | 'main-water-negative'
  | 'yeast-clamped-low'
  | 'yeast-clamped-high'
  | 'starter-water-too-high'
  | 'starter-clamped-low'
  | 'starter-clamped-high'
  | 'no-fermentation'
  | 'water-temperature-low'
  | 'water-temperature-high';

export interface DoughWarning {
  code: DoughWarningCode;
}

export interface StarterResult {
  amounts: IngredientAmounts;
  inoculationPercent: number;
  hydrationPercent: number;
}

export interface DoughResult {
  totals: IngredientAmounts;
  preDough: IngredientAmounts | null;
  starter: StarterResult | null;
  mainDough: IngredientAmounts;
  yeastType: YeastType;
  freshYeastPercent: number;
  saltPercent: number;
  equivalentHours: number;
  referenceTemperatureC: number;
  bowlLossGrams: number;
  diameterCm: number;
  waterTemperatureC: number | null;
  warnings: DoughWarning[];
}

const PRE_DOUGH_METHODS: readonly DoughMethod[] = ['poolish', 'biga'];

export function isPreDoughMethod(method: DoughMethod): method is PreDoughMethod {
  return PRE_DOUGH_METHODS.includes(method);
}
