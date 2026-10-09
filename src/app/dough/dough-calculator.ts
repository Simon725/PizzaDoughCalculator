import {
  DoughInput,
  DoughResult,
  DoughWarning,
  DoughWarningCode,
  IngredientAmounts,
  PreDoughSettings,
  SourdoughSettings,
  StarterResult,
  isPreDoughMethod,
} from './dough.model';
import { pizzaDiameterCm } from './diameter';
import { totalHours } from './fermentation-time';
import { PIZZA_STYLES, YEAST_TYPE_FACTORS } from './pizza-styles';
import {
  SOURDOUGH_MODEL,
  StarterComposition,
  StarterEstimate,
  equivalentHoursAt22C,
  starterComposition,
  starterPercentFor,
} from './sourdough-model';
import {
  WaterTemperatureClamp,
  WaterTemperatureEstimate,
  isValidWaterTemperatureSettings,
  waterTemperatureFor,
} from './water-temperature';
import {
  LeaveningClamp,
  YEAST_MODEL,
  equivalentHoursAt20C,
  freshYeastPercentFor,
} from './yeast-model';

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

type CommonResult = Pick<
  DoughResult,
  'yeastType' | 'saltPercent' | 'bowlLossGrams' | 'diameterCm' | 'waterTemperatureC'
>;

interface ClampWarnings {
  low: DoughWarningCode;
  high: DoughWarningCode;
}

interface Fractions {
  hydration: number;
  salt: number;
  yeast: number;
  oil: number;
  sugar: number;
}

const YEAST_CLAMP_WARNINGS: ClampWarnings = {
  low: 'yeast-clamped-low',
  high: 'yeast-clamped-high',
};

const STARTER_CLAMP_WARNINGS: ClampWarnings = {
  low: 'starter-clamped-low',
  high: 'starter-clamped-high',
};

const WATER_TEMPERATURE_WARNINGS: Record<WaterTemperatureClamp, DoughWarningCode | null> = {
  none: null,
  low: 'water-temperature-low',
  high: 'water-temperature-high',
};

export function calculateDough(input: DoughInput): DoughResult {
  if (!isValidInput(input)) {
    return emptyResult(input);
  }

  const style = PIZZA_STYLES[input.style];
  const targetGrams = input.ballCount * input.ballWeightGrams;
  const bowlLossGrams = targetGrams * BOWL_LOSS_FRACTION;
  const doughGrams = targetGrams + bowlLossGrams;
  const waterTemperature = waterTemperatureFor(input);
  const common: CommonResult = {
    yeastType: input.yeastType,
    saltPercent: style.saltPercent,
    bowlLossGrams,
    diameterCm: pizzaDiameterCm(input.ballWeightGrams, style.thicknessFactorGramsPerCm2),
    waterTemperatureC: waterTemperature.temperatureC,
  };

  const result =
    input.method === 'sourdough'
      ? sourdoughResult(input, doughGrams, common)
      : yeastResult(input, doughGrams, common);
  return withWaterTemperatureWarning(result, waterTemperature);
}

function withWaterTemperatureWarning(
  result: DoughResult,
  waterTemperature: WaterTemperatureEstimate,
): DoughResult {
  const code = WATER_TEMPERATURE_WARNINGS[waterTemperature.clamp];
  if (code === null) {
    return result;
  }
  return { ...result, warnings: [...result.warnings, warning(code)] };
}

function yeastResult(input: DoughInput, doughGrams: number, common: CommonResult): DoughResult {
  const yeastTypeFactor = YEAST_TYPE_FACTORS[input.yeastType];
  const mainEquivalentHours = equivalentHoursAt20C(input.phases);
  const mainYeast = freshYeastPercentFor(mainEquivalentHours);
  const fractions = doughFractions(input, (mainYeast.percent / 100) * yeastTypeFactor);

  const split = isPreDoughMethod(input.method)
    ? preDoughSplit(doughGrams, fractions, input.preDough, yeastTypeFactor)
    : directSplit(doughGrams, fractions);

  const warnings = clampWarnings(totalHours(input.phases), mainYeast.clamp, YEAST_CLAMP_WARNINGS);
  if (split.mainWaterClamped) {
    warnings.push(warning('main-water-negative'));
  }

  return {
    ...common,
    totals: split.totals,
    preDough: split.preDough,
    starter: null,
    mainDough: split.mainDough,
    freshYeastPercent: mainYeast.percent,
    equivalentHours: mainEquivalentHours,
    referenceTemperatureC: YEAST_MODEL.referenceTemperatureC,
    warnings,
  };
}

function sourdoughResult(input: DoughInput, doughGrams: number, common: CommonResult): DoughResult {
  const equivalentHours = equivalentHoursAt22C(input.phases);
  const calculatedStarter = starterPercentFor(equivalentHours);
  const inoculationPercent = inoculationPercentFor(input.sourdough, calculatedStarter);
  const hydrationPercent = input.sourdough.starterHydrationPercent;
  const split = starterSplit(
    doughGrams,
    doughFractions(input, 0),
    starterComposition(inoculationPercent / 100, hydrationPercent),
  );

  const warnings = starterWarnings(input, calculatedStarter);
  if (split.mainWaterClamped) {
    warnings.push(warning('starter-water-too-high'));
  }

  return {
    ...common,
    totals: split.totals,
    preDough: null,
    starter: {
      amounts: split.starter,
      inoculationPercent,
      calculatedInoculationPercent: calculatedStarter.percent,
      hydrationPercent,
    },
    mainDough: split.mainDough,
    freshYeastPercent: 0,
    equivalentHours,
    referenceTemperatureC: SOURDOUGH_MODEL.referenceTemperatureC,
    warnings,
  };
}

function inoculationPercentFor(
  settings: SourdoughSettings,
  calculatedStarter: StarterEstimate,
): number {
  return settings.starterMode === 'manual'
    ? settings.manualStarterPercent
    : calculatedStarter.percent;
}

function starterWarnings(input: DoughInput, calculatedStarter: StarterEstimate): DoughWarning[] {
  if (input.sourdough.starterMode === 'manual') {
    return [];
  }
  return clampWarnings(totalHours(input.phases), calculatedStarter.clamp, STARTER_CLAMP_WARNINGS);
}

function doughFractions(input: DoughInput, yeastFraction: number): Fractions {
  return {
    hydration: input.hydrationPercent / 100,
    salt: PIZZA_STYLES[input.style].saltPercent / 100,
    yeast: yeastFraction,
    oil: input.oilPercent / 100,
    sugar: input.sugarPercent / 100,
  };
}

interface DoughSplit {
  totals: IngredientAmounts;
  preDough: IngredientAmounts | null;
  mainDough: IngredientAmounts;
  mainWaterClamped: boolean;
}

interface StarterSplit {
  totals: IngredientAmounts;
  starter: IngredientAmounts;
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

function starterSplit(
  doughGrams: number,
  fractions: Fractions,
  starterPerFlour: StarterComposition,
): StarterSplit {
  const totalWaterPerFlour = Math.max(fractions.hydration, starterPerFlour.water);
  const totalFlour =
    doughGrams / (1 + totalWaterPerFlour + fractions.salt + enrichmentFraction(fractions));

  const starter = amounts({
    flour: totalFlour * starterPerFlour.flour,
    water: totalFlour * starterPerFlour.water,
    salt: 0,
    yeast: 0,
    oil: 0,
    sugar: 0,
  });
  const mainDough = amounts({
    flour: totalFlour - starter.flour,
    water: totalFlour * (totalWaterPerFlour - starterPerFlour.water),
    salt: totalFlour * fractions.salt,
    yeast: 0,
    oil: totalFlour * fractions.oil,
    sugar: totalFlour * fractions.sugar,
  });

  return {
    totals: sumAmounts(starter, mainDough),
    starter,
    mainDough,
    mainWaterClamped: starterPerFlour.water > fractions.hydration,
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

function clampWarnings(
  mainHours: number,
  clamp: LeaveningClamp,
  codes: ClampWarnings,
): DoughWarning[] {
  if (mainHours === 0) {
    return [warning('no-fermentation')];
  }
  if (clamp === 'low') {
    return [warning(codes.low)];
  }
  if (clamp === 'high') {
    return [warning(codes.high)];
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
    isNonNegative(input.sourdough.starterHydrationPercent) &&
    isNonNegative(input.sourdough.manualStarterPercent) &&
    isValidWaterTemperatureSettings(input.waterTemperature) &&
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
  const isSourdough = input.method === 'sourdough';
  return {
    totals: { ...EMPTY_AMOUNTS },
    preDough: isPreDoughMethod(input.method) ? { ...EMPTY_AMOUNTS } : null,
    starter: isSourdough ? emptyStarter(input.sourdough.starterHydrationPercent) : null,
    mainDough: { ...EMPTY_AMOUNTS },
    yeastType: input.yeastType,
    freshYeastPercent: 0,
    saltPercent: PIZZA_STYLES[input.style]?.saltPercent ?? 0,
    equivalentHours: 0,
    referenceTemperatureC: isSourdough
      ? SOURDOUGH_MODEL.referenceTemperatureC
      : YEAST_MODEL.referenceTemperatureC,
    bowlLossGrams: 0,
    diameterCm: 0,
    waterTemperatureC: null,
    warnings: [],
  };
}

function emptyStarter(hydrationPercent: number): StarterResult {
  return {
    amounts: { ...EMPTY_AMOUNTS },
    inoculationPercent: 0,
    calculatedInoculationPercent: 0,
    hydrationPercent,
  };
}
