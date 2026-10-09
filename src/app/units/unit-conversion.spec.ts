import {
  celsiusToFahrenheit,
  centimetersToInches,
  fahrenheitToCelsius,
  gramsToOunces,
  inchesToCentimeters,
  ouncesToGrams,
  roundTo,
} from './unit-conversion';

describe('unit conversion', () => {
  it('converts grams and ounces', () => {
    expect(gramsToOunces(28.349523125)).toBeCloseTo(1, 10);
    expect(gramsToOunces(250)).toBeCloseTo(8.818, 3);
    expect(ouncesToGrams(16)).toBeCloseTo(453.592, 3);
    expect(ouncesToGrams(gramsToOunces(373))).toBeCloseTo(373, 10);
  });

  it('converts Celsius and Fahrenheit', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(celsiusToFahrenheit(-40)).toBe(-40);
    expect(fahrenheitToCelsius(95)).toBe(35);
    expect(fahrenheitToCelsius(celsiusToFahrenheit(21.7))).toBeCloseTo(21.7, 10);
  });

  it('converts centimeters and inches', () => {
    expect(centimetersToInches(30.48)).toBeCloseTo(12, 10);
    expect(inchesToCentimeters(14)).toBeCloseTo(35.56, 10);
  });

  it('rounds to a number of decimals', () => {
    expect(roundTo(8.818, 1)).toBe(8.8);
    expect(roundTo(71.5, 0)).toBe(72);
    expect(roundTo(21.666, 1)).toBe(21.7);
  });
});
