import { fromDateAndTimeInputs, toDateInputValue, toTimeInputValue } from './date-time-input';
import { formatWeekdayTime } from './format';

describe('date and time inputs', () => {
  const saturdayEvening = new Date(2026, 9, 10, 19, 5);

  it('formats local date and time input values', () => {
    expect(toDateInputValue(saturdayEvening)).toBe('2026-10-10');
    expect(toTimeInputValue(saturdayEvening)).toBe('19:05');
  });

  it('combines date and time input values into a local date', () => {
    expect(fromDateAndTimeInputs('2026-10-10', '19:05')).toEqual(saturdayEvening);
  });

  it('accepts times with seconds', () => {
    expect(fromDateAndTimeInputs('2026-10-10', '19:05:00')).toEqual(saturdayEvening);
  });

  it('rejects empty or malformed values', () => {
    expect(fromDateAndTimeInputs('', '19:00')).toBeNull();
    expect(fromDateAndTimeInputs('2026-10-10', '')).toBeNull();
    expect(fromDateAndTimeInputs('10.10.2026', '19:00')).toBeNull();
  });
});

describe('formatWeekdayTime', () => {
  const fridayEvening = new Date(2026, 9, 9, 18, 30);

  it('uses the German short weekday and 24 h time', () => {
    expect(formatWeekdayTime(fridayEvening, 'de-DE')).toBe('Fr 18:30');
  });

  it('uses the English short weekday and 24 h time', () => {
    expect(formatWeekdayTime(fridayEvening, 'en-US')).toBe('Fri 18:30');
  });

  it('pads early hours', () => {
    expect(formatWeekdayTime(new Date(2026, 9, 10, 7, 0), 'en-US')).toBe('Sat 07:00');
  });
});
