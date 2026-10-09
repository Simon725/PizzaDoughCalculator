import { DoughInput, DoughResult } from '../dough/dough.model';
import { PIZZA_STYLES } from '../dough/pizza-styles';
import { formatHours, formatNumber } from '../shared/format';
import { METHOD_LABELS } from '../shared/labels';
import { RecipeSection, buildRecipeSections, roundGrams } from './recipe-sections';

export function describeDough(input: DoughInput): string {
  return [
    `${input.ballCount} × ${input.ballWeightGrams} g`,
    `${input.hydrationPercent} % Hydration`,
    METHOD_LABELS[input.method],
  ].join(' · ');
}

export function formatRecipeText(input: DoughInput, result: DoughResult): string {
  const lines = [
    `Pizzateig – ${PIZZA_STYLES[input.style].name}`,
    describeDough(input),
    '',
    ...buildRecipeSections(input, result).flatMap(formatSection),
    `inkl. ${formatNumber(roundGrams(result.bowlLossGrams))} g Schüsselverlust (2 %)`,
    `Durchmesser: ca. ${formatNumber(Math.round(result.diameterCm))} cm pro Pizza`,
    '',
    'Gare',
    ...input.phases.map(
      (phase, index) => `  ${index + 1}. ${formatHours(phase.hours)} h bei ${phase.temperatureC} °C`,
    ),
  ];
  return lines.join('\n');
}

function formatSection(section: RecipeSection): string[] {
  const heading = section.note ? `${section.title} (${section.note})` : section.title;
  const rows = section.rows.map(
    (row) => `  ${row.label}: ${formatNumber(row.grams, row.decimals)} g`,
  );
  return [heading, ...rows, ''];
}
