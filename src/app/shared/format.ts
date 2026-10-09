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
