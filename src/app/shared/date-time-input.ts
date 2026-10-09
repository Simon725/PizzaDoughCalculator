const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_INPUT_PATTERN = /^(\d{2}):(\d{2})/;

export function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
}

export function toTimeInputValue(date: Date): string {
  return `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
}

export function fromDateAndTimeInputs(dateValue: string, timeValue: string): Date | null {
  const dateMatch = DATE_INPUT_PATTERN.exec(dateValue);
  const timeMatch = TIME_INPUT_PATTERN.exec(timeValue);
  if (!dateMatch || !timeMatch) {
    return null;
  }
  const [, year, month, day] = dateMatch.map(Number);
  const [, hours, minutes] = timeMatch.map(Number);
  const date = new Date(year, month - 1, day, hours, minutes);
  return Number.isNaN(date.getTime()) ? null : date;
}

function twoDigits(value: number): string {
  return String(value).padStart(2, '0');
}
