import { useMemo } from 'react';
import type { CurrentStateInputs, ScenarioInputs, ScenarioResults } from '../types';
import { computeScenario } from '../calculations/engine';

export function useCalculations(
  currentState: CurrentStateInputs,
  scenarios: ScenarioInputs[],
  analysisPeriod: number
): ScenarioResults[] {
  return useMemo(
    () => scenarios.map((s) => computeScenario(currentState, s, analysisPeriod)),
    [currentState, scenarios, analysisPeriod]
  );
}
