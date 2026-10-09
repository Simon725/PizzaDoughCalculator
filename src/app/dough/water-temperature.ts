import { DoughInput, WaterTemperatureSettings, isPreDoughMethod } from './dough.model';

export const WATER_TEMPERATURE_MODEL = {
  frictionRiseC: {
    hand: 2,
    'stand-mixer': 12,
  },
  minWaterC: 0,
  maxWaterC: 45,
} as const;

export const WATER_TEMPERATURE_DEFAULTS: WaterTemperatureSettings = {
  targetDoughC: 24,
  roomC: 22,
  flourC: 22,
  mixing: 'hand',
};

export type WaterTemperatureClamp = 'none' | 'low' | 'high';

export interface WaterTemperatureEstimate {
  temperatureC: number;
  clamp: WaterTemperatureClamp;
}

export type WaterTemperatureInput = Pick<DoughInput, 'method' | 'preDough' | 'waterTemperature'>;

export function waterTemperatureFor(input: WaterTemperatureInput): WaterTemperatureEstimate {
  const settings = input.waterTemperature;
  const knownTemperaturesC = [settings.roomC, settings.flourC, ...preFermentTemperaturesC(input)];
  const factorCount = knownTemperaturesC.length + 1;
  const rawTemperatureC =
    factorCount * settings.targetDoughC -
    sum(knownTemperaturesC) -
    WATER_TEMPERATURE_MODEL.frictionRiseC[settings.mixing];
  return clampWaterTemperature(rawTemperatureC);
}

export function isValidWaterTemperatureSettings(settings: WaterTemperatureSettings): boolean {
  return (
    Number.isFinite(settings.targetDoughC) &&
    Number.isFinite(settings.roomC) &&
    Number.isFinite(settings.flourC) &&
    settings.mixing in WATER_TEMPERATURE_MODEL.frictionRiseC
  );
}

function preFermentTemperaturesC(input: WaterTemperatureInput): number[] {
  if (isPreDoughMethod(input.method)) {
    return [input.preDough.fermentation.temperatureC];
  }
  if (input.method === 'sourdough') {
    return [input.waterTemperature.roomC];
  }
  return [];
}

function clampWaterTemperature(temperatureC: number): WaterTemperatureEstimate {
  if (temperatureC < WATER_TEMPERATURE_MODEL.minWaterC) {
    return { temperatureC: WATER_TEMPERATURE_MODEL.minWaterC, clamp: 'low' };
  }
  if (temperatureC > WATER_TEMPERATURE_MODEL.maxWaterC) {
    return { temperatureC: WATER_TEMPERATURE_MODEL.maxWaterC, clamp: 'high' };
  }
  return { temperatureC, clamp: 'none' };
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
