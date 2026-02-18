/**
 * hooks/useCalculations.ts
 *
 * Memoized hook that runs the ROI calculation engine for every scenario.
 * Each scenario is self-contained — no baseline pass-through needed.
 */

import { useMemo } from 'react';
import type { ScenarioInputs, ScenarioResults } from '../types';
import { computeScenario } from '../calculations/engine';

export function useCalculations(scenarios: ScenarioInputs[], analysisPeriod: number): ScenarioResults[] {
  return useMemo(() => {
    return scenarios.map((s) => computeScenario(s, analysisPeriod));
  }, [scenarios, analysisPeriod]);
}
