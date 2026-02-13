/**
 * calculations/adoption.ts
 *
 * Adoption curve functions that model how quickly field workers start using
 * the new tool. The adoption rate (0 to 1) is multiplied against the
 * efficiency gains in the main engine — so at 50% adoption, you only get
 * 50% of the promised time savings and error reduction.
 *
 * Currently the app uses linearAdoption. The sCurveAdoption function is
 * available as an alternative for more realistic modeling (slow start,
 * rapid middle, plateau at the end).
 */

/**
 * Linear adoption ramp: adoption grows at a constant rate and reaches
 * 100% exactly at `adoptionPeriod` months.
 *
 * Example with adoptionPeriod = 6:
 *   Month 1 -> 16.7%, Month 3 -> 50%, Month 6 -> 100%, Month 7+ -> 100%
 *
 * @param month - The current month (1-based)
 * @param adoptionPeriod - How many months until full adoption
 * @returns Adoption rate between 0 and 1
 */
export function linearAdoption(month: number, adoptionPeriod: number): number {
  if (adoptionPeriod <= 0) return 1;       // Edge case: instant adoption
  return Math.min(1, month / adoptionPeriod);
}

/**
 * S-curve (logistic) adoption: models realistic adoption behavior where
 * early adopters are slow, the majority adopts quickly in the middle,
 * and laggards taper off at the end. Reaches ~95% at `adoptionPeriod`.
 *
 * @param month - The current month (1-based)
 * @param adoptionPeriod - Target month for ~95% adoption
 * @returns Adoption rate between 0 and 1
 */
export function sCurveAdoption(month: number, adoptionPeriod: number): number {
  if (adoptionPeriod <= 0) return 1;       // Edge case: instant adoption
  const midpoint = adoptionPeriod / 2;     // Inflection point (fastest adoption here)
  const steepness = 6 / adoptionPeriod;    // Tuned so the curve reaches ~95% at adoptionPeriod
  return 1 / (1 + Math.exp(-steepness * (month - midpoint)));
}
