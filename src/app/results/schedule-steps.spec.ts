import { planBakeSchedule } from '../dough/bake-schedule';
import { PRE_DOUGH_DEFAULTS } from '../dough/pizza-styles';
import { TRANSLATIONS } from '../i18n/translations';
import { buildScheduleSteps, formatScheduleStep } from './schedule-steps';

const BAKE_AT = new Date(2026, 9, 10, 19, 0);
const PHASES = [
  { id: 'bulk', hours: 2, temperatureC: 22 },
  { id: 'fridge', hours: 24, temperatureC: 4 },
  { id: 'balls', hours: 4, temperatureC: 22 },
];

describe('buildScheduleSteps', () => {
  it('lists pre-dough, mixing, later phases and baking in German', () => {
    const preDough = {
      ...PRE_DOUGH_DEFAULTS.poolish,
      fermentation: { id: 'pre-dough', hours: 16, temperatureC: 18 },
    };
    const plan = planBakeSchedule({ method: 'poolish', preDough, phases: PHASES }, BAKE_AT);

    const lines = buildScheduleSteps('poolish', plan, TRANSLATIONS.de).map(formatScheduleStep);

    expect(lines).toEqual([
      'Do 21:00 – Poolish ansetzen',
      'Fr 13:00 – Teig kneten',
      'Fr 15:00 – Phase 2 beginnt (24 h bei 4 °C)',
      'Sa 15:00 – Phase 3 beginnt (4 h bei 22 °C)',
      'Sa 19:00 – Backen',
    ]);
  });

  it('has no pre-dough step for sourdough in English', () => {
    const plan = planBakeSchedule(
      { method: 'sourdough', preDough: PRE_DOUGH_DEFAULTS.poolish, phases: PHASES.slice(0, 1) },
      BAKE_AT,
    );

    const lines = buildScheduleSteps('sourdough', plan, TRANSLATIONS.en).map(formatScheduleStep);

    expect(lines).toEqual(['Sat 17:00 – Mix dough', 'Sat 19:00 – Bake']);
  });

  it('names biga in the English pre-dough step', () => {
    const plan = planBakeSchedule(
      { method: 'biga', preDough: PRE_DOUGH_DEFAULTS.biga, phases: PHASES },
      BAKE_AT,
    );

    const [first] = buildScheduleSteps('biga', plan, TRANSLATIONS.en);

    expect(first.label).toBe('Make biga');
  });
});
