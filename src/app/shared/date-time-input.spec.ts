import { fromDateAndTimeInputs, toDateInputValue, toTimeInputValue } from './date-time-input';
import { formatWeekdayDateTime } from './format';

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

describe('formatWeekdayDateTime', () => {
  const fridayEvening = new Date(2026, 9, 9, 18, 30);

  it('uses the German short weekday, day.month. and 24 h time', () => {
    expect(formatWeekdayDateTime(fridayEvening, 'de-DE')).toBe('Fr 09.10. 18:30');
  });

  it('uses the English short weekday, month/day and 24 h time', () => {
    expect(formatWeekdayDateTime(fridayEvening, 'en-US')).toBe('Fri 10/09 18:30');
  });

  it('pads early hours', () => {
    expect(formatWeekdayDateTime(new Date(2026, 9, 10, 7, 0), 'en-US')).toBe('Sat 10/10 07:00');
  });

  it('tells apart the same weekday one week later', () => {
    const nextFriday = new Date(2026, 9, 16, 18, 30);

    expect(formatWeekdayDateTime(nextFriday, 'de-DE')).not.toBe(
      formatWeekdayDateTime(fridayEvening, 'de-DE'),
    );
    expect(formatWeekdayDateTime(nextFriday, 'de-DE')).toBe('Fr 16.10. 18:30');
  });

  it('pads midnight as 00 instead of 24', () => {
    expect(formatWeekdayDateTime(new Date(2026, 11, 31, 0, 5), 'de-DE')).toBe('Do 31.12. 00:05');
  });
});
