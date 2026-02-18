/**
 * constants/defaults.ts
 *
 * Default values, color palette, and factory function for creating new scenarios.
 * All defaults are zeroed so the user starts from a blank slate.
 */

import type { SavingsInputs, InvestmentInputs, QualitativeFlags, ScenarioInputs } from '../types';

export const SCENARIO_COLORS = ['#2563EB', '#F97316', '#8B5CF6', '#10B981', '#EC4899', '#F59E0B'] as const;
export const MAX_SCENARIOS = 6;

// ── All defaults zeroed ─────────────────────────────────────────────────
export const DEFAULT_SAVINGS: SavingsInputs = {
  mode: 'direct',
  unitName: 'unit',
  referenceUnits: 1,
  directSavingsPerUnit: 0,
  currentCrewSize: 0,
  proposedCrewSize: 0,
  currentTimePerUnit: 0,
  proposedTimePerUnit: 0,
  hourlyRate: 0,
  additionalSavingsPerUnit: 0,
  utilizationPercent: 1,
  adoptionRampMonths: 6,
};

export const DEFAULT_INVESTMENT: InvestmentInputs = {
  assemblyCost: 0,
  designCost: 0,
  controlsCost: 0,
  monthlyRecurringCost: 0,
  trainingCost: 0,
  deploymentCost: 0,
  toolLifespanMonths: 0,
};

export const DEFAULT_QUALITATIVE: QualitativeFlags = {
  safetyCritical: false,
  qualityCritical: false,
  operationsCritical: false,
};

export const DEFAULT_ANALYSIS_PERIOD = 36;

let scenarioCounter = 0;

/**
 * Factory function: creates a new ScenarioInputs object with zeroed defaults.
 * @param index — position in the scenario list (for color assignment and naming)
 */
export function createDefaultScenario(index: number = 0): ScenarioInputs {
  scenarioCounter++;
  return {
    id: `scenario-${Date.now()}-${scenarioCounter}`,
    name: index === 0 ? 'Scenario 1' : `Scenario ${index + 1}`,
    color: SCENARIO_COLORS[index % SCENARIO_COLORS.length],
    savings: { ...DEFAULT_SAVINGS },
    investment: { ...DEFAULT_INVESTMENT },
    qualitative: { ...DEFAULT_QUALITATIVE },
    costBreakdownLocked: false,
  };
}
