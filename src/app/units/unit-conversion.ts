export const GRAMS_PER_OUNCE = 28.349523125;
export const CENTIMETERS_PER_INCH = 2.54;

export function gramsToOunces(grams: number): number {
  return grams / GRAMS_PER_OUNCE;
}

export function ouncesToGrams(ounces: number): number {
  return ounces * GRAMS_PER_OUNCE;
}

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

export function centimetersToInches(centimeters: number): number {
  return centimeters / CENTIMETERS_PER_INCH;
}

export function inchesToCentimeters(inches: number): number {
  return inches * CENTIMETERS_PER_INCH;
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
