/**
 * constants/defaults.ts
 *
 * Default values, color palette, and factory function for creating new scenarios.
 * All defaults are zeroed so the user starts from a blank slate.
 */

import type { CurrentStateInputs, InvestmentInputs, EfficiencyInputs, QualitativeFlags, ScenarioInputs } from '../types';

export const SCENARIO_COLORS = ['#2563EB', '#F97316', '#8B5CF6', '#10B981', '#EC4899', '#F59E0B'] as const;
export const MAX_SCENARIOS = 6;

// ── All defaults zeroed ─────────────────────────────────────────────────
export const DEFAULT_CURRENT_STATE: CurrentStateInputs = {
  workers: 0,
  hourlyRate: 0,
  hoursPerWeek: 0,
  errorRate: 0,
  monthlyOperationalCosts: 0,
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

export const DEFAULT_EFFICIENCY: EfficiencyInputs = {
  timeSavings: 0,
  errorReduction: 0,
  utilizationPercent: 1,
  adoptionRampMonths: 6,
  additionalMonthlyRevenue: 0,
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
    name: index === 0 ? 'Current Solution' : `Scenario ${index + 1}`,
    color: SCENARIO_COLORS[index % SCENARIO_COLORS.length],
    currentState: { ...DEFAULT_CURRENT_STATE },
    investment: { ...DEFAULT_INVESTMENT },
    efficiency: { ...DEFAULT_EFFICIENCY },
    qualitative: { ...DEFAULT_QUALITATIVE },
    costBreakdownLocked: false,
  };
}
