import { NumberLimit } from '../state/dough-limits';
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  gramsToOunces,
  ouncesToGrams,
  roundTo,
} from './unit-conversion';
import { UnitSystem } from './unit-system.service';

export interface UnitField {
  unit: string;
  limit: NumberLimit;
  toDisplay: (metricValue: number) => number;
  toMetric: (displayValue: number) => number;
}

const IMPERIAL_WEIGHT_STEP = 0.5;
const IMPERIAL_WEIGHT_DECIMALS = 1;
const IMPERIAL_TEMPERATURE_STEP = 1;
const LIMIT_TOLERANCE = 1e-9;
const LIMIT_DECIMALS = 4;

export function weightField(limit: NumberLimit, unitSystem: UnitSystem): UnitField {
  if (unitSystem === 'metric') {
    return metricField(limit, 'g');
  }
  return {
    unit: 'oz',
    limit: convertLimit(limit, gramsToOunces, IMPERIAL_WEIGHT_STEP),
    toDisplay: (grams) => roundTo(gramsToOunces(grams), IMPERIAL_WEIGHT_DECIMALS),
    toMetric: ouncesToGrams,
  };
}

export function temperatureField(limit: NumberLimit, unitSystem: UnitSystem): UnitField {
  if (unitSystem === 'metric') {
    return metricField(limit, '°C');
  }
  return {
    unit: '°F',
    limit: convertLimit(limit, celsiusToFahrenheit, IMPERIAL_TEMPERATURE_STEP),
    toDisplay: (celsius) => Math.round(celsiusToFahrenheit(celsius)),
    toMetric: fahrenheitToCelsius,
  };
}

export function convertLimit(
  limit: NumberLimit,
  convert: (value: number) => number,
  step: number,
): NumberLimit {
  const min = Math.ceil(convert(limit.min) / step - LIMIT_TOLERANCE) * step;
  const max = Math.floor(convert(limit.max) / step + LIMIT_TOLERANCE) * step;
  return { min: roundTo(min, LIMIT_DECIMALS), max: roundTo(max, LIMIT_DECIMALS), step };
}

function metricField(limit: NumberLimit, unit: string): UnitField {
  return { unit, limit, toDisplay: (value) => Math.round(value), toMetric: (value) => value };
}
