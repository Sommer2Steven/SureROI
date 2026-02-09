import { useMemo } from 'react';
import type { ScenarioResults } from '../types';

export interface CumulativeDataPoint {
  month: number;
  label: string;
  statusQuo: number;
  [key: string]: number | string; // dynamic scenario keys
}

export interface MonthlySavingsDataPoint {
  month: number;
  label: string;
  [key: string]: number | string;
}

export interface CompareDataPoint {
  month: number;
  label: string;
  [key: string]: number | string;
}

export function useChartData(results: ScenarioResults[]) {
  const cumulativeData = useMemo(() => {
    if (results.length === 0) return [];
    const months = results[0].monthlyBreakdowns.length;
    const data: CumulativeDataPoint[] = [];

    for (let i = 0; i < months; i++) {
      const point: CumulativeDataPoint = {
        month: i + 1,
        label: `M${i + 1}`,
        statusQuo: results[0].monthlyBreakdowns[i].cumulativeStatusQuo,
      };
      results.forEach((r) => {
        point[`newTool_${r.scenarioId}`] = r.monthlyBreakdowns[i].cumulativeNewTool;
      });
      data.push(point);
    }
    return data;
  }, [results]);

  const monthlySavingsData = useMemo(() => {
    if (results.length === 0) return [];
    const months = results[0].monthlyBreakdowns.length;
    const data: MonthlySavingsDataPoint[] = [];

    for (let i = 0; i < months; i++) {
      const point: MonthlySavingsDataPoint = {
        month: i + 1,
        label: `M${i + 1}`,
      };
      results.forEach((r) => {
        point[`savings_${r.scenarioId}`] = r.monthlyBreakdowns[i].monthlySavings;
      });
      data.push(point);
    }
    return data;
  }, [results]);

  const compareData = useMemo(() => {
    if (results.length === 0) return [];
    const months = results[0].monthlyBreakdowns.length;
    const data: CompareDataPoint[] = [];

    for (let i = 0; i < months; i++) {
      const point: CompareDataPoint = {
        month: i + 1,
        label: `M${i + 1}`,
      };
      results.forEach((r) => {
        point[`net_${r.scenarioId}`] = r.monthlyBreakdowns[i].netPosition;
      });
      data.push(point);
    }
    return data;
  }, [results]);

  return { cumulativeData, monthlySavingsData, compareData };
}
