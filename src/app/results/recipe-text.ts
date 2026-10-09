import { DoughInput, DoughResult } from '../dough/dough.model';
import { Translations } from '../i18n/translations';
import { formatHours, formatNumber } from '../shared/format';
import { RecipeRow, RecipeSection, buildRecipeSections, roundGrams } from './recipe-sections';

export function describeDough(input: DoughInput, t: Translations): string {
  return [
    `${input.ballCount} × ${input.ballWeightGrams} g`,
    t.recipe.hydration(input.hydrationPercent),
    t.methods.options[input.method].label,
  ].join(' · ');
}

export function formatRecipeText(input: DoughInput, result: DoughResult, t: Translations): string {
  const lines = [
    t.recipe.textTitle(t.styles.options[input.style].name),
    describeDough(input, t),
    '',
    ...buildRecipeSections(input, result, t).flatMap((section) => formatSection(section, t)),
    t.recipe.textBowlLoss(formatNumber(roundGrams(result.bowlLossGrams), t.locale)),
    t.recipe.textDiameter(formatNumber(Math.round(result.diameterCm), t.locale)),
    '',
    t.recipe.textFermentation,
    ...input.phases.map(
      (phase, index) =>
        `  ${index + 1}. ${t.timeline.hoursAt(formatHours(phase.hours, t.locale), phase.temperatureC)}`,
    ),
  ];
  return lines.join('\n');
}

function formatSection(section: RecipeSection, t: Translations): string[] {
  const heading = section.note ? `${section.title} (${section.note})` : section.title;
  const rows = section.rows.map((row) => formatRow(row, t));
  return [heading, ...rows, ''];
}

function formatRow(row: RecipeRow, t: Translations): string {
  const amount = `  ${row.label}: ${formatNumber(row.grams, t.locale, row.decimals)} g`;
  if (row.temperatureC === undefined) {
    return amount;
  }
  return `${amount} (${t.recipe.temperature(formatNumber(row.temperatureC, t.locale))})`;
}
