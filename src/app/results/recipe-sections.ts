import { DoughInput, DoughResult, IngredientAmounts, YeastType } from '../dough/dough.model';
import { Translations } from '../i18n/translations';
import { formatHours, formatNumber } from '../shared/format';

export type RecipeSectionId = 'pre-dough' | 'main-dough' | 'total';

export interface RecipeRow {
  label: string;
  grams: number;
  decimals: number;
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
  const sections: RecipeSection[] = [];
  if (result.preDough) {
    const { hours, temperatureC } = input.preDough.fermentation;
    sections.push({
      id: 'pre-dough',
      title: t.recipe.preDough,
      note: t.timeline.hoursAt(formatHours(hours, t.locale), temperatureC),
      rows: buildRows(result.preDough, result.yeastType, t),
    });
  }
  sections.push(
    {
      id: 'main-dough',
      title: t.recipe.mainDough,
      note: '',
      rows: buildRows(result.mainDough, result.yeastType, t),
    },
    {
      id: 'total',
      title: t.recipe.total,
      note: t.recipe.doughGrams(formatNumber(roundGrams(result.totals.total), t.locale)),
      rows: buildRows(result.totals, result.yeastType, t),
    },
  );
  return sections;
}

export function roundGrams(grams: number): number {
  return Math.round(grams);
}

export function roundYeastGrams(grams: number): number {
  return Math.round(grams * 10) / 10;
}

function buildRows(amounts: IngredientAmounts, yeastType: YeastType, t: Translations): RecipeRow[] {
  return [...baseRows(amounts, yeastType, t), ...enrichmentRows(amounts, t)];
}

function baseRows(amounts: IngredientAmounts, yeastType: YeastType, t: Translations): RecipeRow[] {
  return [
    { label: t.recipe.flour, grams: roundGrams(amounts.flour), decimals: 0 },
    { label: t.recipe.water, grams: roundGrams(amounts.water), decimals: 0 },
    { label: t.recipe.salt, grams: roundGrams(amounts.salt), decimals: 0 },
    {
      label: t.recipe.yeast(t.yeastTypes[yeastType]),
      grams: roundYeastGrams(amounts.yeast),
      decimals: YEAST_DECIMALS,
    },
  ];
}

function enrichmentRows(amounts: IngredientAmounts, t: Translations): RecipeRow[] {
  const rows: RecipeRow[] = [
    { label: t.recipe.oil, grams: roundGrams(amounts.oil), decimals: 0 },
    { label: t.recipe.sugar, grams: roundGrams(amounts.sugar), decimals: 0 },
  ];
  return rows.filter((row) => row.grams > 0);
}
