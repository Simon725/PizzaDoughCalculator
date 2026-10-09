import { FermentationPhase } from '../dough/dough.model';

export type ScheduleTemplateId = 'same-day' | 'fridge-24' | 'fridge-48' | 'fridge-72';

export type ScheduleTemplatePhase = Omit<FermentationPhase, 'id'>;

export interface ScheduleTemplate {
  id: ScheduleTemplateId;
  phases: readonly ScheduleTemplatePhase[];
}

const ROOM_TEMPERATURE_C = 22;
const FRIDGE_TEMPERATURE_C = 4;

function fridgeSchedule(id: ScheduleTemplateId, fridgeHours: number): ScheduleTemplate {
  return {
    id,
    phases: [
      { hours: 2, temperatureC: ROOM_TEMPERATURE_C },
      { hours: fridgeHours, temperatureC: FRIDGE_TEMPERATURE_C },
      { hours: 4, temperatureC: ROOM_TEMPERATURE_C },
    ],
  };
}

export const SCHEDULE_TEMPLATES: readonly ScheduleTemplate[] = [
  { id: 'same-day', phases: [{ hours: 8, temperatureC: ROOM_TEMPERATURE_C }] },
  fridgeSchedule('fridge-24', 24),
  fridgeSchedule('fridge-48', 48),
  fridgeSchedule('fridge-72', 72),
];

export function findScheduleTemplate(id: ScheduleTemplateId): ScheduleTemplate {
  return SCHEDULE_TEMPLATES.find((template) => template.id === id) ?? SCHEDULE_TEMPLATES[0];
}

export function matchesScheduleTemplate(
  phases: readonly ScheduleTemplatePhase[],
  template: ScheduleTemplate,
): boolean {
  if (phases.length !== template.phases.length) {
    return false;
  }
  return template.phases.every(
    (templatePhase, index) =>
      phases[index].hours === templatePhase.hours &&
      phases[index].temperatureC === templatePhase.temperatureC,
  );
}
