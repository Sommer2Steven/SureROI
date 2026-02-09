import type { ScenarioInputs } from '../types';

export const SCENARIO_COLORS = ['#2563EB', '#F97316', '#8B5CF6'] as const;
export const SCENARIO_NAMES = ['Scenario 1', 'Scenario 2', 'Scenario 3'] as const;
export const MAX_SCENARIOS = 3;

export const DEFAULT_CURRENT_STATE = {
  workers: 50,
  hourlyRate: 45,
  hoursPerWeek: 10,
  errorRate: 0.12,
  monthlyOperationalCosts: 5000,
} as const;

export const DEFAULT_INVESTMENT = {
  upfrontCost: 150000,
  monthlyRecurringCost: 3000,
  trainingCost: 25000,
  deploymentCost: 15000,
} as const;

export const DEFAULT_EFFICIENCY = {
  timeSavings: 0.30,
  errorReduction: 0.50,
  adoptionRampMonths: 6,
  additionalMonthlyRevenue: 0,
} as const;

export const DEFAULT_ANALYSIS_PERIOD = 36;

let scenarioCounter = 0;

export function createDefaultScenario(index: number = 0): ScenarioInputs {
  scenarioCounter++;
  return {
    id: `scenario-${Date.now()}-${scenarioCounter}`,
    name: SCENARIO_NAMES[index] ?? `Scenario ${index + 1}`,
    color: SCENARIO_COLORS[index % SCENARIO_COLORS.length],
    investment: { ...DEFAULT_INVESTMENT },
    efficiency: { ...DEFAULT_EFFICIENCY },
  };
}

export const PRESET_BUILD_VS_BUY = {
  build: {
    name: 'Build (Custom)',
    investment: {
      upfrontCost: 250000,
      monthlyRecurringCost: 2000,
      trainingCost: 15000,
      deploymentCost: 25000,
    },
    efficiency: {
      timeSavings: 0.35,
      errorReduction: 0.60,
      adoptionRampMonths: 9,
      additionalMonthlyRevenue: 0,
    },
  },
  buy: {
    name: 'Buy (SaaS)',
    investment: {
      upfrontCost: 50000,
      monthlyRecurringCost: 5000,
      trainingCost: 25000,
      deploymentCost: 10000,
    },
    efficiency: {
      timeSavings: 0.25,
      errorReduction: 0.45,
      adoptionRampMonths: 4,
      additionalMonthlyRevenue: 0,
    },
  },
} as const;
