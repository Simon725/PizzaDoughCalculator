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
const timeFormatters = new Map<string, Intl.DateTimeFormat>();

export function formatWeekdayTime(date: Date, locale: string): string {
  const weekday = cachedDateFormatter(weekdayFormatters, locale, { weekday: 'short' });
  const time = cachedDateFormatter(timeFormatters, locale, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  return `${weekday.format(date)} ${time.format(date)}`;
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
