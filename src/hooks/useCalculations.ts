/**
 * hooks/useCalculations.ts
 *
 * Memoized hook that runs the ROI calculation engine for every scenario.
 *
 * scenarios[0] is always the current solution (baseline).
 * scenarios[1..n] are proposed — the baseline's currentState is passed separately
 * so the engine uses it for status quo costs while the proposed scenario's own
 * currentState drives the "new tool" cost calculation.
 *
 * Returns: [currentSolutionResult, ...proposedResults]
 */

import { useMemo } from 'react';
import type { ScenarioInputs, ScenarioResults } from '../types';
import { computeScenario } from '../calculations/engine';

export function useCalculations(scenarios: ScenarioInputs[], analysisPeriod: number): ScenarioResults[] {
  return useMemo(() => {
    if (scenarios.length === 0) return [];

    const currentSolution = scenarios[0];
    const currentResult = computeScenario(currentSolution, analysisPeriod);

    const proposedResults = scenarios.slice(1).map((s) =>
      computeScenario(s, analysisPeriod, currentSolution.currentState)
    );

    return [currentResult, ...proposedResults];
  }, [scenarios, analysisPeriod]);
}
