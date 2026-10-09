import {
  DoughInput,
  DoughResult,
  IngredientAmounts,
  StarterResult,
  YeastType,
} from '../dough/dough.model';
import { Translations } from '../i18n/translations';
import { formatHours, formatNumber } from '../shared/format';
import {
  DisplayAmount,
  formatTemperature,
  formatWeight,
  gramAmount,
  weightAmount,
} from '../units/unit-format';
import { UnitSystem } from '../units/unit-system.service';

export type RecipeSectionId = 'pre-dough' | 'starter' | 'main-dough' | 'total';

export interface RecipeRow {
  label: string;
  amount: DisplayAmount;
  temperature?: string;
}

export interface RecipeSection {
  id: RecipeSectionId;
  title: string;
  note: string;
  rows: RecipeRow[];
}

interface RecipeContext {
  t: Translations;
  unitSystem: UnitSystem;
}

const YEAST_DECIMALS = 1;

export function buildRecipeSections(
  input: DoughInput,
  result: DoughResult,
  t: Translations,
  unitSystem: UnitSystem,
): RecipeSection[] {
  const context: RecipeContext = { t, unitSystem };
  if (result.starter) {
    return sourdoughSections(result, result.starter, context);
  }
  return yeastSections(input, result, context);
}

function yeastSections(
  input: DoughInput,
  result: DoughResult,
  context: RecipeContext,
): RecipeSection[] {
  const { t, unitSystem } = context;
  const sections: RecipeSection[] = [];
  if (result.preDough) {
    const { hours, temperatureC } = input.preDough.fermentation;
    sections.push({
      id: 'pre-dough',
      title: t.recipe.preDough,
      note: t.timeline.hoursAt(
        formatHours(hours, t.locale),
        formatTemperature(temperatureC, unitSystem, t.locale),
      ),
      rows: buildRows(result.preDough, yeastRow(result.preDough, result.yeastType, t), context),
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
        context,
        result.waterTemperatureC,
      ),
    },
    totalSection(result, yeastRow(result.totals, result.yeastType, t), context),
  );
  return sections;
}

function sourdoughSections(
  result: DoughResult,
  starter: StarterResult,
  context: RecipeContext,
): RecipeSection[] {
  const { t, unitSystem } = context;
  return [
    {
      id: 'starter',
      title: t.recipe.starter,
      note: t.recipe.starterNote(
        formatNumber(starter.inoculationPercent, t.locale, 1),
        starter.hydrationPercent,
      ),
      rows: [
        { label: t.recipe.flour, amount: weightAmount(starter.amounts.flour, unitSystem) },
        { label: t.recipe.water, amount: weightAmount(starter.amounts.water, unitSystem) },
      ],
    },
    {
      id: 'main-dough',
      title: t.recipe.mainDough,
      note: '',
      rows: buildRows(
        result.mainDough,
        starterRow(starter, context),
        context,
        result.waterTemperatureC,
      ),
    },
    totalSection(result, null, context),
  ];
}

function totalSection(
  result: DoughResult,
  leaveningRow: RecipeRow | null,
  context: RecipeContext,
): RecipeSection {
  const { t, unitSystem } = context;
  return {
    id: 'total',
    title: t.recipe.total,
    note: t.recipe.doughWeight(formatWeight(result.totals.total, unitSystem, t.locale)),
    rows: buildRows(result.totals, leaveningRow, context),
  };
}

function buildRows(
  amounts: IngredientAmounts,
  leaveningRow: RecipeRow | null,
  context: RecipeContext,
  waterTemperatureC: number | null = null,
): RecipeRow[] {
  const leavening = leaveningRow ? [leaveningRow] : [];
  return [
    ...baseRows(amounts, waterTemperatureC, context),
    ...leavening,
    ...enrichmentRows(amounts, context.t),
  ];
}

function baseRows(
  amounts: IngredientAmounts,
  waterTemperatureC: number | null,
  context: RecipeContext,
): RecipeRow[] {
  const { t, unitSystem } = context;
  return [
    { label: t.recipe.flour, amount: weightAmount(amounts.flour, unitSystem) },
    waterRow(amounts, waterTemperatureC, context),
    { label: t.recipe.salt, amount: gramAmount(amounts.salt) },
  ];
}

function waterRow(
  amounts: IngredientAmounts,
  waterTemperatureC: number | null,
  context: RecipeContext,
): RecipeRow {
  const { t, unitSystem } = context;
  const row: RecipeRow = { label: t.recipe.water, amount: weightAmount(amounts.water, unitSystem) };
  if (waterTemperatureC === null) {
    return row;
  }
  return { ...row, temperature: formatTemperature(waterTemperatureC, unitSystem, t.locale) };
}

function yeastRow(amounts: IngredientAmounts, yeastType: YeastType, t: Translations): RecipeRow {
  return {
    label: t.recipe.yeast(t.yeastTypes[yeastType]),
    amount: gramAmount(amounts.yeast, YEAST_DECIMALS),
  };
}

function starterRow(starter: StarterResult, context: RecipeContext): RecipeRow {
  return {
    label: context.t.recipe.starter,
    amount: weightAmount(starter.amounts.total, context.unitSystem),
  };
}

function enrichmentRows(amounts: IngredientAmounts, t: Translations): RecipeRow[] {
  const rows: RecipeRow[] = [
    { label: t.recipe.oil, amount: gramAmount(amounts.oil) },
    { label: t.recipe.sugar, amount: gramAmount(amounts.sugar) },
  ];
  return rows.filter((row) => row.amount.value > 0);
}
