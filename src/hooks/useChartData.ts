/**
 * hooks/useChartData.ts
 *
 * Transforms the raw ScenarioResults into the specific data shapes that
 * Recharts needs for each chart type.
 *
 * results[0] is always the current solution (baseline).
 * results[1..n] are proposed scenarios.
 *
 * The cumulative chart uses a single "statusQuo" key from results[0]
 * and "newTool_{id}" keys for each proposed scenario.
 * Monthly savings and compare charts include proposed scenarios only.
 */

import { useMemo } from 'react';
import type { ScenarioResults } from '../types';

/** One data point for the cumulative cost chart (one per month) */
export interface CumulativeDataPoint {
  month: number;
  label: string;
  statusQuo: number;
  [key: string]: number | string;
}

/** One data point for the monthly savings bar chart */
export interface MonthlySavingsDataPoint {
  month: number;
  label: string;
  [key: string]: number | string;
}

/** One data point for the scenario comparison net position chart */
export interface CompareDataPoint {
  month: number;
  label: string;
  [key: string]: number | string;
}

export function useChartData(results: ScenarioResults[]) {

  const currentResult = results[0];
  const proposedResults = results.slice(1);

  // ── Cumulative cost data ────────────────────────────────────────────
  const cumulativeData = useMemo(() => {
    if (!currentResult) return [];
    const months = currentResult.monthlyBreakdowns.length;
    const data: CumulativeDataPoint[] = [];

    for (let i = 0; i < months; i++) {
      const point: CumulativeDataPoint = {
        month: i + 1,
        label: `M${i + 1}`,
        statusQuo: currentResult.monthlyBreakdowns[i].cumulativeStatusQuo,
      };
      proposedResults.forEach((r) => {
        if (r.monthlyBreakdowns[i]) {
          point[`newTool_${r.scenarioId}`] = r.monthlyBreakdowns[i].cumulativeNewTool;
        }
      });
      data.push(point);
    }
    return data;
  }, [currentResult, proposedResults]);

  // ── Monthly savings data (proposed only) ─────────────────────────────
  const monthlySavingsData = useMemo(() => {
    if (proposedResults.length === 0) return [];
    const months = currentResult?.monthlyBreakdowns.length ?? 0;
    const data: MonthlySavingsDataPoint[] = [];

    for (let i = 0; i < months; i++) {
      const point: MonthlySavingsDataPoint = {
        month: i + 1,
        label: `M${i + 1}`,
      };
      proposedResults.forEach((r) => {
        if (r.monthlyBreakdowns[i]) {
          point[`savings_${r.scenarioId}`] = r.monthlyBreakdowns[i].monthlySavings;
        }
      });
      data.push(point);
    }
    return data;
  }, [currentResult, proposedResults]);

  // ── Comparison data (proposed only) ──────────────────────────────────
  const compareData = useMemo(() => {
    if (proposedResults.length === 0) return [];
    const months = currentResult?.monthlyBreakdowns.length ?? 0;
    const data: CompareDataPoint[] = [];

    for (let i = 0; i < months; i++) {
      const point: CompareDataPoint = {
        month: i + 1,
        label: `M${i + 1}`,
      };
      proposedResults.forEach((r) => {
        if (r.monthlyBreakdowns[i]) {
          point[`net_${r.scenarioId}`] = r.monthlyBreakdowns[i].netPosition;
        }
      });
      data.push(point);
    }
    return data;
  }, [currentResult, proposedResults]);

  return { cumulativeData, monthlySavingsData, compareData };
}
