import { BakePlan } from '../dough/bake-schedule';
import { DoughMethod } from '../dough/dough.model';
import { Translations } from '../i18n/translations';
import { formatHours, formatWeekdayTime } from '../shared/format';
import { formatTemperature } from '../units/unit-format';
import { UnitSystem } from '../units/unit-system.service';

export interface ScheduleStep {
  id: string;
  time: string;
  label: string;
}

export function buildScheduleSteps(
  method: DoughMethod,
  plan: BakePlan,
  t: Translations,
  unitSystem: UnitSystem,
): ScheduleStep[] {
  const format = (date: Date): string => formatWeekdayTime(date, t.locale);
  const steps: ScheduleStep[] = [];
  if (plan.preDoughStartsAt) {
    steps.push({
      id: 'pre-dough',
      time: format(plan.preDoughStartsAt),
      label: t.bakeSchedule.steps.preDough(t.methods.options[method].label),
    });
  }
  steps.push({ id: 'mix', time: format(plan.mixAt), label: t.bakeSchedule.steps.mix });
  plan.phases.slice(1).forEach((phase, index) => {
    const details = t.timeline.hoursAt(
      formatHours(phase.hours, t.locale),
      formatTemperature(phase.temperatureC, unitSystem, t.locale),
    );
    steps.push({
      id: phase.id,
      time: format(phase.startsAt),
      label: t.bakeSchedule.steps.phase(index + 2, details),
    });
  });
  steps.push({ id: 'bake', time: format(plan.bakeAt), label: t.bakeSchedule.steps.bake });
  return steps;
}

export function formatScheduleStep(step: ScheduleStep): string {
  return `${step.time} – ${step.label}`;
}
