import { createBakeScheduleDefaults, parseBakeTime } from '../dough/bake-schedule';
import {
  BakeScheduleSettings,
  DoughInput,
  FermentationPhase,
  PizzaStyleId,
  PreDoughSettings,
  SourdoughSettings,
  WaterTemperatureSettings,
} from '../dough/dough.model';
import { PIZZA_STYLES, SOURDOUGH_DEFAULTS } from '../dough/pizza-styles';
import { WATER_TEMPERATURE_DEFAULTS } from '../dough/water-temperature';
import { DOUGH_LIMITS, isWithinLimit } from './dough-limits';

export const DOUGH_STORAGE_KEY = 'pizza-dough-calculator:v1';

const METHODS: readonly string[] = ['direct', 'poolish', 'biga', 'sourdough'];
const YEAST_TYPES: readonly string[] = ['fresh', 'instant'];
const MIXING_TYPES: readonly string[] = ['hand', 'stand-mixer'];

export function loadDoughInput(): DoughInput | null {
  try {
    const raw = localStorage.getItem(DOUGH_STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed = withBakeScheduleDefaults(
      withWaterTemperatureDefaults(
        withSourdoughDefaults(withStyleIngredientDefaults(JSON.parse(raw))),
      ),
    );
    return isDoughInput(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveDoughInput(input: DoughInput): void {
  try {
    localStorage.setItem(DOUGH_STORAGE_KEY, JSON.stringify(input));
  } catch {
    return;
  }
}

export function withStyleIngredientDefaults(value: unknown): unknown {
  if (!isRecord(value) || !isStyleId(value['style'])) {
    return value;
  }
  const style = PIZZA_STYLES[value['style']];
  return {
    oilPercent: style.defaultOilPercent,
    sugarPercent: style.defaultSugarPercent,
    ...value,
  };
}

export function withSourdoughDefaults(value: unknown): unknown {
  if (!isRecord(value) || 'sourdough' in value) {
    return value;
  }
  return { ...value, sourdough: { ...SOURDOUGH_DEFAULTS } };
}

export function withWaterTemperatureDefaults(value: unknown): unknown {
  if (!isRecord(value) || 'waterTemperature' in value) {
    return value;
  }
  return { ...value, waterTemperature: { ...WATER_TEMPERATURE_DEFAULTS } };
}

export function withBakeScheduleDefaults(value: unknown): unknown {
  if (!isRecord(value) || 'bakeSchedule' in value) {
    return value;
  }
  return { ...value, bakeSchedule: createBakeScheduleDefaults() };
}

export function isDoughInput(value: unknown): value is DoughInput {
  if (!isRecord(value)) {
    return false;
  }
  return (
    isOneOf(value['method'], METHODS) &&
    isStyleId(value['style']) &&
    isOneOf(value['yeastType'], YEAST_TYPES) &&
    Number.isInteger(value['ballCount']) &&
    isWithinLimit(value['ballCount'], DOUGH_LIMITS.ballCount) &&
    isWithinLimit(value['ballWeightGrams'], DOUGH_LIMITS.ballWeightGrams) &&
    isWithinLimit(value['hydrationPercent'], DOUGH_LIMITS.hydrationPercent) &&
    isWithinLimit(value['oilPercent'], DOUGH_LIMITS.oilPercent) &&
    isWithinLimit(value['sugarPercent'], DOUGH_LIMITS.sugarPercent) &&
    isPreDoughSettings(value['preDough']) &&
    isSourdoughSettings(value['sourdough']) &&
    isWaterTemperatureSettings(value['waterTemperature']) &&
    isBakeScheduleSettings(value['bakeSchedule']) &&
    Array.isArray(value['phases']) &&
    value['phases'].every(isFermentationPhase)
  );
}

function isPreDoughSettings(value: unknown): value is PreDoughSettings {
  if (!isRecord(value)) {
    return false;
  }
  return (
    isWithinLimit(value['flourPercent'], DOUGH_LIMITS.preDoughFlourPercent) &&
    isWithinLimit(value['hydrationPercent'], DOUGH_LIMITS.preDoughHydrationPercent) &&
    isFermentationPhase(value['fermentation'])
  );
}

function isSourdoughSettings(value: unknown): value is SourdoughSettings {
  return (
    isRecord(value) &&
    isWithinLimit(value['starterHydrationPercent'], DOUGH_LIMITS.starterHydrationPercent)
  );
}

function isWaterTemperatureSettings(value: unknown): value is WaterTemperatureSettings {
  if (!isRecord(value)) {
    return false;
  }
  return (
    isWithinLimit(value['targetDoughC'], DOUGH_LIMITS.targetDoughTemperatureC) &&
    isWithinLimit(value['roomC'], DOUGH_LIMITS.roomTemperatureC) &&
    isWithinLimit(value['flourC'], DOUGH_LIMITS.flourTemperatureC) &&
    isOneOf(value['mixing'], MIXING_TYPES)
  );
}

function isBakeScheduleSettings(value: unknown): value is BakeScheduleSettings {
  return (
    isRecord(value) &&
    typeof value['enabled'] === 'boolean' &&
    parseBakeTime(value['bakeAt']) !== null
  );
}

function isFermentationPhase(value: unknown): value is FermentationPhase {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value['id'] === 'string' &&
    value['id'].length > 0 &&
    isWithinLimit(value['hours'], DOUGH_LIMITS.hours) &&
    isWithinLimit(value['temperatureC'], DOUGH_LIMITS.temperatureC)
  );
}

function isStyleId(value: unknown): value is PizzaStyleId {
  return isOneOf(value, Object.keys(PIZZA_STYLES));
}

function isOneOf(value: unknown, allowed: readonly string[]): value is string {
  return typeof value === 'string' && allowed.includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
