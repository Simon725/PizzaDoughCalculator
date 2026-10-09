import { formatNumber } from '../shared/format';
import {
  celsiusToFahrenheit,
  centimetersToInches,
  gramsToOunces,
  roundTo,
} from './unit-conversion';
import { UnitSystem } from './unit-system.service';

export interface DisplayAmount {
  value: number;
  decimals: number;
  unit: string;
}

const OUNCE_DECIMALS = 1;

export function weightAmount(grams: number, unitSystem: UnitSystem): DisplayAmount {
  if (unitSystem === 'metric') {
    return gramAmount(grams);
  }
  return {
    value: roundTo(gramsToOunces(grams), OUNCE_DECIMALS),
    decimals: OUNCE_DECIMALS,
    unit: 'oz',
  };
}

export function gramAmount(grams: number, decimals = 0): DisplayAmount {
  return { value: roundTo(grams, decimals), decimals, unit: 'g' };
}

export function temperatureAmount(celsius: number, unitSystem: UnitSystem): DisplayAmount {
  if (unitSystem === 'metric') {
    return { value: Math.round(celsius), decimals: 0, unit: '°C' };
  }
  return { value: Math.round(celsiusToFahrenheit(celsius)), decimals: 0, unit: '°F' };
}

export function lengthAmount(centimeters: number, unitSystem: UnitSystem): DisplayAmount {
  if (unitSystem === 'metric') {
    return { value: Math.round(centimeters), decimals: 0, unit: 'cm' };
  }
  return { value: Math.round(centimetersToInches(centimeters)), decimals: 0, unit: 'in' };
}

export function formatAmount(amount: DisplayAmount, locale: string): string {
  return `${formatNumber(amount.value, locale, amount.decimals)} ${amount.unit}`;
}

export function formatWeight(grams: number, unitSystem: UnitSystem, locale: string): string {
  return formatAmount(weightAmount(grams, unitSystem), locale);
}

export function formatTemperature(celsius: number, unitSystem: UnitSystem, locale: string): string {
  return formatAmount(temperatureAmount(celsius, unitSystem), locale);
}

export function formatLength(centimeters: number, unitSystem: UnitSystem, locale: string): string {
  return formatAmount(lengthAmount(centimeters, unitSystem), locale);
}
