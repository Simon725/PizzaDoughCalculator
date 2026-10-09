import {
  BakeScheduleInput,
  createBakeScheduleDefaults,
  defaultBakeTime,
  firstStartOf,
  hasStartPassed,
  parseBakeTime,
  planBakeSchedule,
} from './bake-schedule';
import { PRE_DOUGH_DEFAULTS } from './pizza-styles';

const BAKE_AT = new Date('2026-10-10T17:00:00.000Z');

function scheduleInput(overrides: Partial<BakeScheduleInput> = {}): BakeScheduleInput {
  return {
    method: 'direct',
    preDough: PRE_DOUGH_DEFAULTS.poolish,
    phases: [
      { id: 'bulk', hours: 2, temperatureC: 22 },
      { id: 'fridge', hours: 24, temperatureC: 4 },
      { id: 'balls', hours: 4, temperatureC: 22 },
    ],
    ...overrides,
  };
}

function isoStarts(input: BakeScheduleInput, bakeAt = BAKE_AT): string[] {
  return planBakeSchedule(input, bakeAt).phases.map((phase) => phase.startsAt.toISOString());
}

describe('planBakeSchedule', () => {
  it('ends the last phase at the bake time and works backwards', () => {
    expect(isoStarts(scheduleInput())).toEqual([
      '2026-10-09T11:00:00.000Z',
      '2026-10-09T13:00:00.000Z',
      '2026-10-10T13:00:00.000Z',
    ]);
  });

  it('mixes the dough when the first phase starts', () => {
    const plan = planBakeSchedule(scheduleInput(), BAKE_AT);

    expect(plan.mixAt.toISOString()).toBe('2026-10-09T11:00:00.000Z');
    expect(plan.bakeAt.toISOString()).toBe(BAKE_AT.toISOString());
  });

  it('has no pre-dough step for direct and sourdough doughs', () => {
    expect(planBakeSchedule(scheduleInput(), BAKE_AT).preDoughStartsAt).toBeNull();
    expect(
      planBakeSchedule(scheduleInput({ method: 'sourdough' }), BAKE_AT).preDoughStartsAt,
    ).toBeNull();
  });

  it('starts the pre-dough its fermentation time before mixing', () => {
    const plan = planBakeSchedule(
      scheduleInput({ method: 'poolish', preDough: PRE_DOUGH_DEFAULTS.poolish }),
      BAKE_AT,
    );
    const preDoughHours = PRE_DOUGH_DEFAULTS.poolish.fermentation.hours;

    expect(plan.preDoughStartsAt?.getTime()).toBe(plan.mixAt.getTime() - preDoughHours * 3_600_000);
    expect(firstStartOf(plan)).toEqual(plan.preDoughStartsAt);
  });

  it('supports half hours', () => {
    const input = scheduleInput({ phases: [{ id: 'a', hours: 1.5, temperatureC: 22 }] });

    expect(isoStarts(input)).toEqual(['2026-10-10T15:30:00.000Z']);
  });

  it('mixes at the bake time when there is no phase', () => {
    const plan = planBakeSchedule(scheduleInput({ phases: [] }), BAKE_AT);

    expect(plan.phases).toEqual([]);
    expect(plan.mixAt.toISOString()).toBe(BAKE_AT.toISOString());
  });

  it('counts elapsed hours across a daylight saving change', () => {
    const bakeAfterDstEnd = new Date('2026-10-25T18:00:00.000Z');
    const input = scheduleInput({ phases: [{ id: 'a', hours: 24, temperatureC: 4 }] });

    expect(isoStarts(input, bakeAfterDstEnd)).toEqual(['2026-10-24T18:00:00.000Z']);
  });

  it('does not change the given bake time', () => {
    const bakeAt = new Date(BAKE_AT.getTime());

    planBakeSchedule(scheduleInput(), bakeAt).bakeAt.setFullYear(2000);

    expect(bakeAt.toISOString()).toBe(BAKE_AT.toISOString());
  });
});

describe('hasStartPassed', () => {
  const plan = planBakeSchedule(scheduleInput(), BAKE_AT);

  it('is false before the first step', () => {
    expect(hasStartPassed(plan, new Date('2026-10-09T10:59:00.000Z'))).toBe(false);
  });

  it('is true after the first step', () => {
    expect(hasStartPassed(plan, new Date('2026-10-09T11:01:00.000Z'))).toBe(true);
  });
});

describe('defaultBakeTime', () => {
  it('is 19:00 local time on the next day', () => {
    expect(defaultBakeTime(new Date(2026, 9, 9, 22, 15))).toEqual(new Date(2026, 9, 10, 19, 0));
  });

  it('rolls over to the next month', () => {
    expect(defaultBakeTime(new Date(2026, 9, 31, 8, 0))).toEqual(new Date(2026, 10, 1, 19, 0));
  });

  it('creates disabled defaults with an ISO bake time', () => {
    const defaults = createBakeScheduleDefaults(new Date(2026, 9, 9, 12, 0));

    expect(defaults.enabled).toBe(false);
    expect(new Date(defaults.bakeAt)).toEqual(new Date(2026, 9, 10, 19, 0));
  });
});

describe('parseBakeTime', () => {
  it('parses ISO strings', () => {
    expect(parseBakeTime('2026-10-10T17:00:00.000Z')).toEqual(BAKE_AT);
  });

  it('rejects invalid values', () => {
    expect(parseBakeTime('tomorrow')).toBeNull();
    expect(parseBakeTime(42)).toBeNull();
  });
});
