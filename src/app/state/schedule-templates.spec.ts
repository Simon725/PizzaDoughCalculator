import {
  SCHEDULE_TEMPLATES,
  findScheduleTemplate,
  matchesScheduleTemplate,
} from './schedule-templates';

describe('schedule templates', () => {
  it('provides unique template ids', () => {
    const ids = SCHEDULE_TEMPLATES.map((template) => template.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('matches phases with the same hours and temperatures in order', () => {
    const template = findScheduleTemplate('fridge-24');

    expect(
      matchesScheduleTemplate(
        [
          { hours: 2, temperatureC: 22 },
          { hours: 24, temperatureC: 4 },
          { hours: 4, temperatureC: 22 },
        ],
        template,
      ),
    ).toBe(true);
  });

  it('does not match phases that differ in length, order or values', () => {
    const template = findScheduleTemplate('fridge-24');

    expect(matchesScheduleTemplate([{ hours: 8, temperatureC: 22 }], template)).toBe(false);
    expect(
      matchesScheduleTemplate(
        [
          { hours: 24, temperatureC: 4 },
          { hours: 2, temperatureC: 22 },
          { hours: 4, temperatureC: 22 },
        ],
        template,
      ),
    ).toBe(false);
    expect(
      matchesScheduleTemplate(
        [
          { hours: 2, temperatureC: 22 },
          { hours: 25, temperatureC: 4 },
          { hours: 4, temperatureC: 22 },
        ],
        template,
      ),
    ).toBe(false);
  });
});
