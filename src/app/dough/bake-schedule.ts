import {
  BakeScheduleSettings,
  DoughInput,
  FermentationPhase,
  isPreDoughMethod,
} from './dough.model';

export const MS_PER_HOUR = 3_600_000;
export const DEFAULT_BAKE_HOUR = 19;

export type BakeScheduleInput = Pick<DoughInput, 'method' | 'preDough' | 'phases'>;

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

function preDoughStart(input: BakeScheduleInput, mixAt: Date): Date | null {
  if (!isPreDoughMethod(input.method)) {
    return null;
  }
  return new Date(mixAt.getTime() - input.preDough.fermentation.hours * MS_PER_HOUR);
}
