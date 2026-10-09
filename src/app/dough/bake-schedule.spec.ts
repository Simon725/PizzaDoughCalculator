import {
  BakeScheduleInput,
  createBakeScheduleDefaults,
  defaultBakeTime,
  earliestBakeTime,
  firstStartOf,
  hasStartPassed,
  parseBakeTime,
  planBakeSchedule,
  shortenToFit,
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

describe('shortenToFit', () => {
  const hoursAfter = (hours: number) => new Date(BAKE_AT.getTime() - hours * 3_600_000);

  it('shortens all phases evenly so the plan starts now', () => {
    const shortened = shortenToFit(scheduleInput(), BAKE_AT, hoursAfter(15));

    expect(shortened?.phases.map((phase) => phase.hours)).toEqual([1, 12, 2]);
  });

  it('uses half hours and never starts the plan in the past', () => {
    const shortened = shortenToFit(scheduleInput(), BAKE_AT, hoursAfter(20.2));

    expect(shortened?.phases.map((phase) => phase.hours)).toEqual([1.5, 16, 2.5]);
  });

  it('keeps a short phase instead of rounding it to 0', () => {
    const input = scheduleInput({
      phases: [
        { id: 'warm', hours: 0.5, temperatureC: 24 },
        { id: 'fridge', hours: 24, temperatureC: 4 },
        { id: 'balls', hours: 4, temperatureC: 22 },
      ],
    });

    const shortened = shortenToFit(input, BAKE_AT, hoursAfter(10));

    expect(shortened?.phases.map((phase) => phase.hours)).toEqual([0.5, 8.5, 1]);
  });

  it('shortens the pre-dough as well', () => {
    const input = scheduleInput({
      method: 'poolish',
      preDough: {
        ...PRE_DOUGH_DEFAULTS.poolish,
        fermentation: { id: 'pre-dough', hours: 10, temperatureC: 18 },
      },
      phases: [{ id: 'bulk', hours: 10, temperatureC: 22 }],
    });

    const shortened = shortenToFit(input, BAKE_AT, hoursAfter(10));

    expect(shortened?.preDough.fermentation.hours).toBe(5);
    expect(shortened?.phases[0].hours).toBe(5);
  });

  it('keeps the pre-dough unchanged without a pre-dough method', () => {
    const input = scheduleInput();

    expect(shortenToFit(input, BAKE_AT, hoursAfter(15))?.preDough).toBe(input.preDough);
  });

  it('never makes phases longer', () => {
    const shortened = shortenToFit(scheduleInput(), BAKE_AT, hoursAfter(60));

    expect(shortened?.phases.map((phase) => phase.hours)).toEqual([2, 24, 4]);
  });

  it('returns null when the bake time has passed or there are no phases', () => {
    expect(shortenToFit(scheduleInput(), BAKE_AT, hoursAfter(0))).toBeNull();
    expect(shortenToFit(scheduleInput({ phases: [] }), BAKE_AT, hoursAfter(5))).toBeNull();
  });
});

describe('earliestBakeTime', () => {
  it('adds all fermentation time to now and rounds up to a quarter hour', () => {
    const now = new Date('2026-10-09T10:07:00.000Z');

    expect(earliestBakeTime(scheduleInput(), now).toISOString()).toBe('2026-10-10T16:15:00.000Z');
  });

  it('includes the pre-dough time', () => {
    const now = new Date('2026-10-09T10:00:00.000Z');
    const input = scheduleInput({ method: 'biga', preDough: PRE_DOUGH_DEFAULTS.biga });
    const expectedHours = 30 + PRE_DOUGH_DEFAULTS.biga.fermentation.hours;

    expect(earliestBakeTime(input, now).getTime()).toBe(now.getTime() + expectedHours * 3_600_000);
  });
});
