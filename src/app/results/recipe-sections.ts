import { DoughInput, DoughResult, IngredientAmounts, YeastType } from '../dough/dough.model';
import { formatHours, formatNumber } from '../shared/format';
import { YEAST_TYPE_LABELS } from '../shared/labels';

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

export function buildRecipeSections(input: DoughInput, result: DoughResult): RecipeSection[] {
  const sections: RecipeSection[] = [];
  if (result.preDough) {
    const { hours, temperatureC } = input.preDough.fermentation;
    sections.push({
      id: 'pre-dough',
      title: 'Vorteig',
      note: `${formatHours(hours)} h bei ${temperatureC} °C`,
      rows: buildRows(result.preDough, result.yeastType),
    });
  }
  sections.push(
    { id: 'main-dough', title: 'Hauptteig', note: '', rows: buildRows(result.mainDough, result.yeastType) },
    {
      id: 'total',
      title: 'Gesamt',
      note: `${formatNumber(roundGrams(result.totals.total))} g Teig`,
      rows: buildRows(result.totals, result.yeastType),
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

function buildRows(amounts: IngredientAmounts, yeastType: YeastType): RecipeRow[] {
  return [
    { label: 'Mehl', grams: roundGrams(amounts.flour), decimals: 0 },
    { label: 'Wasser', grams: roundGrams(amounts.water), decimals: 0 },
    { label: 'Salz', grams: roundGrams(amounts.salt), decimals: 0 },
    {
      label: `Hefe (${YEAST_TYPE_LABELS[yeastType]})`,
      grams: roundYeastGrams(amounts.yeast),
      decimals: YEAST_DECIMALS,
    },
  ];
}
