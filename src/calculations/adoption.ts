/**
 * Linear adoption ramp: reaches 100% at adoptionPeriod months.
 */
export function linearAdoption(month: number, adoptionPeriod: number): number {
  if (adoptionPeriod <= 0) return 1;
  return Math.min(1, month / adoptionPeriod);
}

/**
 * S-curve adoption (logistic). Reaches ~95% at adoptionPeriod.
 * Midpoint is at adoptionPeriod / 2.
 */
export function sCurveAdoption(month: number, adoptionPeriod: number): number {
  if (adoptionPeriod <= 0) return 1;
  const midpoint = adoptionPeriod / 2;
  const steepness = 6 / adoptionPeriod; // tuned so ~95% at adoptionPeriod
  return 1 / (1 + Math.exp(-steepness * (month - midpoint)));
}
