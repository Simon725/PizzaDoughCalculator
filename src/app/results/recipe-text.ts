import { BakePlan } from '../dough/bake-schedule';
import { DoughInput, DoughResult } from '../dough/dough.model';
import { Translations } from '../i18n/translations';
import { formatHours } from '../shared/format';
import { formatAmount, formatLength, formatTemperature, formatWeight } from '../units/unit-format';
import { UnitSystem } from '../units/unit-system.service';
import { RecipeRow, RecipeSection, buildRecipeSections } from './recipe-sections';
import { buildScheduleSteps, formatScheduleStep } from './schedule-steps';

export function describeDough(input: DoughInput, t: Translations, unitSystem: UnitSystem): string {
  return [
    `${input.ballCount} × ${formatWeight(input.ballWeightGrams, unitSystem, t.locale)}`,
    t.recipe.hydration(input.hydrationPercent),
    t.methods.options[input.method].label,
  ].join(' · ');
}

export function formatRecipeText(
  input: DoughInput,
  result: DoughResult,
  t: Translations,
  unitSystem: UnitSystem,
  bakePlan: BakePlan | null = null,
): string {
  const lines = [
    t.recipe.textTitle(t.styles.options[input.style].name),
    describeDough(input, t, unitSystem),
    '',
    ...buildRecipeSections(input, result, t, unitSystem).flatMap((section) =>
      formatSection(section, t),
    ),
    t.recipe.textBowlLoss(formatWeight(result.bowlLossGrams, unitSystem, t.locale)),
    t.recipe.textDiameter(formatLength(result.diameterCm, unitSystem, t.locale)),
    '',
    t.recipe.textFermentation,
    ...input.phases.map(
      (phase, index) =>
        `  ${index + 1}. ${t.timeline.hoursAt(
          formatHours(phase.hours, t.locale),
          formatTemperature(phase.temperatureC, unitSystem, t.locale),
        )}`,
    ),
    ...formatSchedule(input, bakePlan, t, unitSystem),
  ];
  return lines.join('\n');
}

function formatSchedule(
  input: DoughInput,
  bakePlan: BakePlan | null,
  t: Translations,
  unitSystem: UnitSystem,
): string[] {
  if (!bakePlan) {
    return [];
  }
  const steps = buildScheduleSteps(input.method, bakePlan, t, unitSystem);
  return ['', t.bakeSchedule.title, ...steps.map((step) => `  ${formatScheduleStep(step)}`)];
}

function formatSection(section: RecipeSection, t: Translations): string[] {
  const heading = section.note ? `${section.title} (${section.note})` : section.title;
  const rows = section.rows.map((row) => formatRow(row, t));
  return [heading, ...rows, ''];
}

function formatRow(row: RecipeRow, t: Translations): string {
  return `  ${row.label}: ${formatAmount(row.amount, t.locale)}`;
}
