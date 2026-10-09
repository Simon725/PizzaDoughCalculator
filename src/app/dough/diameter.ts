export function pizzaDiameterCm(ballWeightGrams: number, thicknessFactorGramsPerCm2: number): number {
  if (!(ballWeightGrams > 0) || !(thicknessFactorGramsPerCm2 > 0)) {
    return 0;
  }
  return 2 * Math.sqrt(ballWeightGrams / (Math.PI * thicknessFactorGramsPerCm2));
}
