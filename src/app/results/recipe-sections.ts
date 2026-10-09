import {
  DoughInput,
  DoughResult,
  IngredientAmounts,
  StarterResult,
  YeastType,
} from '../dough/dough.model';
import { Translations } from '../i18n/translations';
import { formatHours, formatNumber } from '../shared/format';

export type RecipeSectionId = 'pre-dough' | 'starter' | 'main-dough' | 'total';

export interface RecipeRow {
  label: string;
  grams: number;
  decimals: number;
  temperatureC?: number;
}

export interface RecipeSection {
  id: RecipeSectionId;
  title: string;
  note: string;
  rows: RecipeRow[];
}

const YEAST_DECIMALS = 1;

export function buildRecipeSections(
  input: DoughInput,
  result: DoughResult,
  t: Translations,
): RecipeSection[] {
  if (result.starter) {
    return sourdoughSections(result, result.starter, t);
  }
  return yeastSections(input, result, t);
}

export function roundGrams(grams: number): number {
  return Math.round(grams);
}

export function roundYeastGrams(grams: number): number {
  return Math.round(grams * 10) / 10;
}

function yeastSections(input: DoughInput, result: DoughResult, t: Translations): RecipeSection[] {
  const sections: RecipeSection[] = [];
  if (result.preDough) {
    const { hours, temperatureC } = input.preDough.fermentation;
    sections.push({
      id: 'pre-dough',
      title: t.recipe.preDough,
      note: t.timeline.hoursAt(formatHours(hours, t.locale), temperatureC),
      rows: buildRows(result.preDough, yeastRow(result.preDough, result.yeastType, t), t),
    });
  }
  sections.push(
    {
      id: 'main-dough',
      title: t.recipe.mainDough,
      note: '',
      rows: buildRows(
        result.mainDough,
        yeastRow(result.mainDough, result.yeastType, t),
        t,
        result.waterTemperatureC,
      ),
    },
    totalSection(result, yeastRow(result.totals, result.yeastType, t), t),
  );
  return sections;
}

function sourdoughSections(
  result: DoughResult,
  starter: StarterResult,
  t: Translations,
): RecipeSection[] {
  return [
    {
      id: 'starter',
      title: t.recipe.starter,
      note: t.recipe.starterNote(
        formatNumber(starter.inoculationPercent, t.locale, 1),
        starter.hydrationPercent,
      ),
      rows: [
        { label: t.recipe.flour, grams: roundGrams(starter.amounts.flour), decimals: 0 },
        { label: t.recipe.water, grams: roundGrams(starter.amounts.water), decimals: 0 },
      ],
    },
    {
      id: 'main-dough',
      title: t.recipe.mainDough,
      note: '',
      rows: buildRows(result.mainDough, starterRow(starter, t), t, result.waterTemperatureC),
    },
    totalSection(result, null, t),
  ];
}

function totalSection(
  result: DoughResult,
  leaveningRow: RecipeRow | null,
  t: Translations,
): RecipeSection {
  return {
    id: 'total',
    title: t.recipe.total,
    note: t.recipe.doughGrams(formatNumber(roundGrams(result.totals.total), t.locale)),
    rows: buildRows(result.totals, leaveningRow, t),
  };
}

function buildRows(
  amounts: IngredientAmounts,
  leaveningRow: RecipeRow | null,
  t: Translations,
  waterTemperatureC: number | null = null,
): RecipeRow[] {
  const leavening = leaveningRow ? [leaveningRow] : [];
  return [
    ...baseRows(amounts, waterTemperatureC, t),
    ...leavening,
    ...enrichmentRows(amounts, t),
  ];
}

function baseRows(
  amounts: IngredientAmounts,
  waterTemperatureC: number | null,
  t: Translations,
): RecipeRow[] {
  return [
    { label: t.recipe.flour, grams: roundGrams(amounts.flour), decimals: 0 },
    waterRow(amounts, waterTemperatureC, t),
    { label: t.recipe.salt, grams: roundGrams(amounts.salt), decimals: 0 },
  ];
}

function waterRow(
  amounts: IngredientAmounts,
  waterTemperatureC: number | null,
  t: Translations,
): RecipeRow {
  const row: RecipeRow = { label: t.recipe.water, grams: roundGrams(amounts.water), decimals: 0 };
  if (waterTemperatureC === null) {
    return row;
  }
  return { ...row, temperatureC: Math.round(waterTemperatureC) };
}

function yeastRow(amounts: IngredientAmounts, yeastType: YeastType, t: Translations): RecipeRow {
  return {
    label: t.recipe.yeast(t.yeastTypes[yeastType]),
    grams: roundYeastGrams(amounts.yeast),
    decimals: YEAST_DECIMALS,
  };
}

function starterRow(starter: StarterResult, t: Translations): RecipeRow {
  return { label: t.recipe.starter, grams: roundGrams(starter.amounts.total), decimals: 0 };
}

function enrichmentRows(amounts: IngredientAmounts, t: Translations): RecipeRow[] {
  const rows: RecipeRow[] = [
    { label: t.recipe.oil, grams: roundGrams(amounts.oil), decimals: 0 },
    { label: t.recipe.sugar, grams: roundGrams(amounts.sugar), decimals: 0 },
  ];
  return rows.filter((row) => row.grams > 0);
}
