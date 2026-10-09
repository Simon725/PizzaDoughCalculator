import {
  DoughInput,
  DoughResult,
  DoughWarning,
  DoughWarningCode,
  IngredientAmounts,
  PreDoughSettings,
} from './dough.model';
import { pizzaDiameterCm } from './diameter';
import { PIZZA_STYLES, YEAST_TYPE_FACTORS } from './pizza-styles';
import { equivalentHoursAt20C, freshYeastPercentFor, totalHours } from './yeast-model';

export const BOWL_LOSS_FRACTION = 0.02;

const EMPTY_AMOUNTS: IngredientAmounts = {
  flour: 0,
  water: 0,
  salt: 0,
  yeast: 0,
  oil: 0,
  sugar: 0,
  total: 0,
};

type Ingredients = Omit<IngredientAmounts, 'total'>;

interface Fractions {
  hydration: number;
  salt: number;
  yeast: number;
  oil: number;
  sugar: number;
}

export function calculateDough(input: DoughInput): DoughResult {
  if (!isValidInput(input)) {
    return emptyResult(input);
  }

  const style = PIZZA_STYLES[input.style];
  const targetGrams = input.ballCount * input.ballWeightGrams;
  const bowlLossGrams = targetGrams * BOWL_LOSS_FRACTION;
  const doughGrams = targetGrams + bowlLossGrams;
  const yeastTypeFactor = YEAST_TYPE_FACTORS[input.yeastType];

  const mainEquivalentHours = equivalentHoursAt20C(input.phases);
  const mainYeast = freshYeastPercentFor(mainEquivalentHours);
  const warnings = yeastWarnings(totalHours(input.phases), mainYeast.clamp);

  const fractions: Fractions = {
    hydration: input.hydrationPercent / 100,
    salt: style.saltPercent / 100,
    yeast: (mainYeast.percent / 100) * yeastTypeFactor,
    oil: input.oilPercent / 100,
    sugar: input.sugarPercent / 100,
  };

  const split =
    input.method === 'direct'
      ? directSplit(doughGrams, fractions)
      : preDoughSplit(doughGrams, fractions, input.preDough, yeastTypeFactor);

  if (split.mainWaterClamped) {
    warnings.push(warning('main-water-negative'));
  }

  return {
    totals: split.totals,
    preDough: split.preDough,
    mainDough: split.mainDough,
    yeastType: input.yeastType,
    freshYeastPercent: mainYeast.percent,
    saltPercent: style.saltPercent,
    equivalentHoursAt20C: mainEquivalentHours,
    bowlLossGrams,
    diameterCm: pizzaDiameterCm(input.ballWeightGrams, style.thicknessFactorGramsPerCm2),
    warnings,
  };
}

interface DoughSplit {
  totals: IngredientAmounts;
  preDough: IngredientAmounts | null;
  mainDough: IngredientAmounts;
  mainWaterClamped: boolean;
}

function directSplit(doughGrams: number, fractions: Fractions): DoughSplit {
  const flour =
    doughGrams /
    (1 + fractions.hydration + fractions.salt + fractions.yeast + enrichmentFraction(fractions));
  const totals = amounts({
    flour,
    water: flour * fractions.hydration,
    salt: flour * fractions.salt,
    yeast: flour * fractions.yeast,
    oil: flour * fractions.oil,
    sugar: flour * fractions.sugar,
  });
  return { totals, preDough: null, mainDough: totals, mainWaterClamped: false };
}

function preDoughSplit(
  doughGrams: number,
  fractions: Fractions,
  settings: PreDoughSettings,
  yeastTypeFactor: number,
): DoughSplit {
  const flourShare = clampPercent(settings.flourPercent) / 100;
  const preDoughHydration = nonNegative(settings.hydrationPercent) / 100;
  const preDoughYeastPercent = freshYeastPercentFor(
    equivalentHoursAt20C([settings.fermentation]),
  ).percent;

  const preDoughWaterPerFlour = flourShare * preDoughHydration;
  const preDoughYeastPerFlour = flourShare * (preDoughYeastPercent / 100) * yeastTypeFactor;
  const totalWaterPerFlour = Math.max(fractions.hydration, preDoughWaterPerFlour);
  const totalYeastPerFlour = Math.max(fractions.yeast, preDoughYeastPerFlour);

  const totalFlour =
    doughGrams /
    (1 + totalWaterPerFlour + fractions.salt + totalYeastPerFlour + enrichmentFraction(fractions));

  const preDough = amounts({
    flour: totalFlour * flourShare,
    water: totalFlour * preDoughWaterPerFlour,
    salt: 0,
    yeast: totalFlour * preDoughYeastPerFlour,
    oil: 0,
    sugar: 0,
  });
  const mainDough = amounts({
    flour: totalFlour - preDough.flour,
    water: totalFlour * (totalWaterPerFlour - preDoughWaterPerFlour),
    salt: totalFlour * fractions.salt,
    yeast: totalFlour * (totalYeastPerFlour - preDoughYeastPerFlour),
    oil: totalFlour * fractions.oil,
    sugar: totalFlour * fractions.sugar,
  });

  return {
    totals: sumAmounts(preDough, mainDough),
    preDough,
    mainDough,
    mainWaterClamped: preDoughWaterPerFlour > fractions.hydration,
  };
}

function enrichmentFraction(fractions: Fractions): number {
  return fractions.oil + fractions.sugar;
}

function amounts(ingredients: Ingredients): IngredientAmounts {
  const { flour, water, salt, yeast, oil, sugar } = ingredients;
  return { ...ingredients, total: flour + water + salt + yeast + oil + sugar };
}

function sumAmounts(first: IngredientAmounts, second: IngredientAmounts): IngredientAmounts {
  return amounts({
    flour: first.flour + second.flour,
    water: first.water + second.water,
    salt: first.salt + second.salt,
    yeast: first.yeast + second.yeast,
    oil: first.oil + second.oil,
    sugar: first.sugar + second.sugar,
  });
}

function yeastWarnings(mainHours: number, clamp: 'none' | 'low' | 'high'): DoughWarning[] {
  if (mainHours === 0) {
    return [warning('no-fermentation')];
  }
  if (clamp === 'low') {
    return [warning('yeast-clamped-low')];
  }
  if (clamp === 'high') {
    return [warning('yeast-clamped-high')];
  }
  return [];
}

function warning(code: DoughWarningCode): DoughWarning {
  return { code };
}

function isValidInput(input: DoughInput): boolean {
  return (
    isPositive(input.ballCount) &&
    isPositive(input.ballWeightGrams) &&
    isNonNegative(input.hydrationPercent) &&
    isNonNegative(input.oilPercent) &&
    isNonNegative(input.sugarPercent) &&
    input.style in PIZZA_STYLES &&
    input.yeastType in YEAST_TYPE_FACTORS
  );
}

function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function isNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function clampPercent(value: number): number {
  return Math.min(100, nonNegative(value));
}

function emptyResult(input: DoughInput): DoughResult {
  return {
    totals: { ...EMPTY_AMOUNTS },
    preDough: input.method === 'direct' ? null : { ...EMPTY_AMOUNTS },
    mainDough: { ...EMPTY_AMOUNTS },
    yeastType: input.yeastType,
    freshYeastPercent: 0,
    saltPercent: PIZZA_STYLES[input.style]?.saltPercent ?? 0,
    equivalentHoursAt20C: 0,
    bowlLossGrams: 0,
    diameterCm: 0,
    warnings: [],
  };
}
