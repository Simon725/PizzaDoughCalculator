export const REFERENCE_BALL_WEIGHT_GRAMS = 250;
export const MAX_VISIBLE_BALLS = 12;

export interface BallRow {
  visible: number;
  hidden: number;
}

export function ballScale(weightGrams: number): number {
  if (!(weightGrams > 0)) {
    return 0;
  }
  return Math.cbrt(weightGrams / REFERENCE_BALL_WEIGHT_GRAMS);
}

export function ballRow(count: number, maxVisible = MAX_VISIBLE_BALLS): BallRow {
  const safeCount = Math.max(0, Math.floor(count));
  const visible = Math.min(safeCount, maxVisible);
  return { visible, hidden: safeCount - visible };
}
