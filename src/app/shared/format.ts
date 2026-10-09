const formatters = new Map<string, Intl.NumberFormat>();

export function formatNumber(value: number, locale: string, decimals = 0): string {
  return getFormatter(locale, decimals).format(value);
}

export function formatHours(hours: number, locale: string): string {
  return formatNumber(hours, locale, Number.isInteger(hours) ? 0 : 1);
}

function getFormatter(locale: string, decimals: number): Intl.NumberFormat {
  const key = `${locale}:${decimals}`;
  const cached = formatters.get(key);
  if (cached) {
    return cached;
  }
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  formatters.set(key, formatter);
  return formatter;
}

const weekdayFormatters = new Map<string, Intl.DateTimeFormat>();
const dayMonthFormatters = new Map<string, Intl.DateTimeFormat>();
const timeFormatters = new Map<string, Intl.DateTimeFormat>();

export function formatWeekdayDateTime(date: Date, locale: string): string {
  return [weekdayOf(date, locale), dayMonthOf(date, locale), timeOf(date, locale)].join(' ');
}

function weekdayOf(date: Date, locale: string): string {
  const formatter = cachedDateFormatter(weekdayFormatters, locale, { weekday: 'short' });
  return partValue(formatter.formatToParts(date), 'weekday');
}

function dayMonthOf(date: Date, locale: string): string {
  const formatter = cachedDateFormatter(dayMonthFormatters, locale, {
    day: '2-digit',
    month: '2-digit',
  });
  return formatter
    .formatToParts(date)
    .map((part) => part.value.trim())
    .join('');
}

function timeOf(date: Date, locale: string): string {
  const formatter = cachedDateFormatter(timeFormatters, locale, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(date);
  return `${partValue(parts, 'hour')}:${partValue(parts, 'minute')}`;
}

function partValue(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((part) => part.type === type)?.value ?? '';
}

function cachedDateFormatter(
  cache: Map<string, Intl.DateTimeFormat>,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const cached = cache.get(locale);
  if (cached) {
    return cached;
  }
  const formatter = new Intl.DateTimeFormat(locale, options);
  cache.set(locale, formatter);
  return formatter;
}
