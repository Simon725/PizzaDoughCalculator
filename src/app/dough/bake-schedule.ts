import {
  BakeScheduleSettings,
  DoughInput,
  FermentationPhase,
  isPreDoughMethod,
} from './dough.model';

export const MS_PER_HOUR = 3_600_000;
export const DEFAULT_BAKE_HOUR = 19;
export const SHORTENED_HOURS_STEP = 0.5;
export const BAKE_TIME_ROUNDING_MINUTES = 15;

export type BakeScheduleInput = Pick<DoughInput, 'method' | 'preDough' | 'phases'>;

export type FermentationTimes = Pick<DoughInput, 'preDough' | 'phases'>;

export interface ScheduledPhase {
  id: string;
  hours: number;
  temperatureC: number;
  startsAt: Date;
}

export interface BakePlan {
  preDoughStartsAt: Date | null;
  mixAt: Date;
  phases: ScheduledPhase[];
  bakeAt: Date;
}

export function planBakeSchedule(input: BakeScheduleInput, bakeAt: Date): BakePlan {
  const phases = scheduleBackwards(input.phases, bakeAt.getTime());
  const mixAt = phases[0]?.startsAt ?? new Date(bakeAt.getTime());
  return {
    preDoughStartsAt: preDoughStart(input, mixAt),
    mixAt,
    phases,
    bakeAt: new Date(bakeAt.getTime()),
  };
}

export function firstStartOf(plan: BakePlan): Date {
  return plan.preDoughStartsAt ?? plan.mixAt;
}

export function hasStartPassed(plan: BakePlan, now: Date): boolean {
  return firstStartOf(plan).getTime() < now.getTime();
}

export function shortenToFit(
  input: BakeScheduleInput,
  bakeAt: Date,
  now: Date,
): FermentationTimes | null {
  const availableHours = (bakeAt.getTime() - now.getTime()) / MS_PER_HOUR;
  const fermentations = scheduledFermentations(input);
  const plannedHours = sumHours(fermentations);
  if (availableHours <= 0 || plannedHours <= 0) {
    return null;
  }
  const targetHours = Math.min(plannedHours, availableHours);
  const hours = distributeInSteps(
    fermentations.map((phase) => (phase.hours * targetHours) / plannedHours),
    SHORTENED_HOURS_STEP,
  );
  const shortened = fermentations.map((phase, index) => ({ ...phase, hours: hours[index] }));
  if (!isPreDoughMethod(input.method)) {
    return { preDough: input.preDough, phases: shortened };
  }
  const [preDoughFermentation, ...phases] = shortened;
  return { preDough: { ...input.preDough, fermentation: preDoughFermentation }, phases };
}

export function earliestBakeTime(input: BakeScheduleInput, now: Date): Date {
  const earliestMs = now.getTime() + scheduledHours(input) * MS_PER_HOUR;
  const roundingMs = BAKE_TIME_ROUNDING_MINUTES * 60_000;
  return new Date(Math.ceil(earliestMs / roundingMs) * roundingMs);
}

export function defaultBakeTime(now: Date): Date {
  const bakeAt = new Date(now.getTime());
  bakeAt.setDate(bakeAt.getDate() + 1);
  bakeAt.setHours(DEFAULT_BAKE_HOUR, 0, 0, 0);
  return bakeAt;
}

export function createBakeScheduleDefaults(now = new Date()): BakeScheduleSettings {
  return { enabled: false, bakeAt: defaultBakeTime(now).toISOString() };
}

export function parseBakeTime(value: unknown): Date | null {
  if (typeof value !== 'string') {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function scheduleBackwards(phases: readonly FermentationPhase[], endMs: number): ScheduledPhase[] {
  const scheduled: ScheduledPhase[] = [];
  let phaseEndMs = endMs;
  for (const phase of [...phases].reverse()) {
    const startMs = phaseEndMs - phase.hours * MS_PER_HOUR;
    scheduled.unshift({ ...phase, startsAt: new Date(startMs) });
    phaseEndMs = startMs;
  }
  return scheduled;
}

function scheduledHours(input: BakeScheduleInput): number {
  return sumHours(scheduledFermentations(input));
}

function scheduledFermentations(input: BakeScheduleInput): FermentationPhase[] {
  return isPreDoughMethod(input.method)
    ? [input.preDough.fermentation, ...input.phases]
    : [...input.phases];
}

function sumHours(phases: readonly FermentationPhase[]): number {
  return phases.reduce((sum, phase) => sum + phase.hours, 0);
}

function distributeInSteps(exactHours: readonly number[], step: number): number[] {
  const steps = exactHours.map((hours) => Math.floor(hours / step));
  const totalSteps = Math.floor(exactHours.reduce((sum, hours) => sum + hours, 0) / step);
  const byPriority = exactHours
    .map((hours, index) => ({
      index,
      isEmpty: steps[index] === 0 && hours > 0,
      rest: hours / step - steps[index],
    }))
    .sort((a, b) => Number(b.isEmpty) - Number(a.isEmpty) || b.rest - a.rest);
  const missingSteps = totalSteps - steps.reduce((sum, count) => sum + count, 0);
  byPriority.slice(0, missingSteps).forEach(({ index }) => (steps[index] += 1));
  return steps.map((count) => count * step);
}

function preDoughStart(input: BakeScheduleInput, mixAt: Date): Date | null {
  if (!isPreDoughMethod(input.method)) {
    return null;
  }
  return new Date(mixAt.getTime() - input.preDough.fermentation.hours * MS_PER_HOUR);
}
