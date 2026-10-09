import { DoughInput, DoughResult, IngredientAmounts } from './dough.model';
import { PIZZA_STYLES } from './pizza-styles';

const EMPTY_AMOUNTS: IngredientAmounts = { flour: 0, water: 0, salt: 0, yeast: 0, total: 0 };

export function calculateDough(input: DoughInput): DoughResult {
  return {
    totals: EMPTY_AMOUNTS,
    preDough: input.method === 'direct' ? null : EMPTY_AMOUNTS,
    mainDough: EMPTY_AMOUNTS,
    yeastType: input.yeastType,
    freshYeastPercent: 0,
    saltPercent: PIZZA_STYLES[input.style].saltPercent,
    equivalentHoursAt20C: 0,
    bowlLossGrams: 0,
    diameterCm: 0,
    warnings: [],
  };
}
