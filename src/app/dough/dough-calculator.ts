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

const WARNING_MESSAGES: Record<DoughWarningCode, string> = {
  'main-water-negative':
    'Der Vorteig enthält mehr Wasser als der Gesamtteig erlaubt. Erhöhe die Hydration oder senke den Vorteig-Anteil.',
  'yeast-clamped-low':
    'Die Gärzeit ist sehr lang. Die Hefemenge wurde auf das Minimum begrenzt.',
  'yeast-clamped-high':
    'Die Gärzeit ist sehr kurz. Die Hefemenge wurde auf das Maximum begrenzt.',
  'no-fermentation': 'Keine Gärzeit angegeben. Es wird die maximale Hefemenge verwendet.',
};

const EMPTY_AMOUNTS: IngredientAmounts = { flour: 0, water: 0, salt: 0, yeast: 0, total: 0 };

interface Fractions {
  hydration: number;
  salt: number;
  yeast: number;
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
  const flour = doughGrams / (1 + fractions.hydration + fractions.salt + fractions.yeast);
  const totals = amounts(
    flour,
    flour * fractions.hydration,
    flour * fractions.salt,
    flour * fractions.yeast,
  );
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
    doughGrams / (1 + totalWaterPerFlour + fractions.salt + totalYeastPerFlour);

  const preDough = amounts(
    totalFlour * flourShare,
    totalFlour * preDoughWaterPerFlour,
    0,
    totalFlour * preDoughYeastPerFlour,
  );
  const mainDough = amounts(
    totalFlour - preDough.flour,
    totalFlour * (totalWaterPerFlour - preDoughWaterPerFlour),
    totalFlour * fractions.salt,
    totalFlour * (totalYeastPerFlour - preDoughYeastPerFlour),
  );

  return {
    totals: sumAmounts(preDough, mainDough),
    preDough,
    mainDough,
    mainWaterClamped: preDoughWaterPerFlour > fractions.hydration,
  };
}

function amounts(flour: number, water: number, salt: number, yeast: number): IngredientAmounts {
  return { flour, water, salt, yeast, total: flour + water + salt + yeast };
}

function sumAmounts(first: IngredientAmounts, second: IngredientAmounts): IngredientAmounts {
  return amounts(
    first.flour + second.flour,
    first.water + second.water,
    first.salt + second.salt,
    first.yeast + second.yeast,
  );
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
  return { code, message: WARNING_MESSAGES[code] };
}

function isValidInput(input: DoughInput): boolean {
  return (
    isPositive(input.ballCount) &&
    isPositive(input.ballWeightGrams) &&
    Number.isFinite(input.hydrationPercent) &&
    input.hydrationPercent >= 0 &&
    input.style in PIZZA_STYLES &&
    input.yeastType in YEAST_TYPE_FACTORS
  );
}

function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
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
