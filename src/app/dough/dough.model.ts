export type DoughMethod = 'direct' | 'poolish' | 'biga';

export type PizzaStyleId = 'neapolitan' | 'new-york' | 'roman';

export type YeastType = 'fresh' | 'instant';

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
  | 'no-fermentation';

export interface DoughWarning {
  code: DoughWarningCode;
}

export interface DoughResult {
  totals: IngredientAmounts;
  preDough: IngredientAmounts | null;
  mainDough: IngredientAmounts;
  yeastType: YeastType;
  freshYeastPercent: number;
  saltPercent: number;
  equivalentHoursAt20C: number;
  bowlLossGrams: number;
  diameterCm: number;
  warnings: DoughWarning[];
}
