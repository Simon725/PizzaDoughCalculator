const formatters = new Map<number, Intl.NumberFormat>();

export function formatNumber(value: number, decimals = 0): string {
  return getFormatter(decimals).format(value);
}

export function formatHours(hours: number): string {
  return formatNumber(hours, Number.isInteger(hours) ? 0 : 1);
}

function getFormatter(decimals: number): Intl.NumberFormat {
  const cached = formatters.get(decimals);
  if (cached) {
    return cached;
  }
  const formatter = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  formatters.set(decimals, formatter);
  return formatter;
}
