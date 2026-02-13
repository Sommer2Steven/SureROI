/**
 * hooks/usePortfolioCalculations.ts
 *
 * Computes ROI results for each portfolio entry with calendar-based scaling,
 * then builds monthly timeline data for stacked bar charts.
 */

import { useMemo } from 'react';
import type { PortfolioEntry, ScenarioResults } from '../types';
import { computeScenario } from '../calculations/engine';
import {
  monthsBetween,
  generateMonthRange,
  formatMonthLabel,
} from '../utils/calendarUtils';

export interface PortfolioEntryResult {
  entry: PortfolioEntry;
  results: ScenarioResults;
  durationMonths: number;
  scaleFactor: number;
  scaledTotalValue: number;
  scaledTotalInvestment: number;
}

export interface PortfolioAggregates {
  totalValueCreated: number;
  totalInvestment: number;
  departmentCost: number;
  netProfit: number;
  departmentROI: number;
}

export interface PortfolioTimelinePoint {
  monthKey: string;
  label: string;
  [entryId: string]: string | number;
}

const WEEKS_PER_MONTH = 4.33;

export function usePortfolioCalculations(
  entries: PortfolioEntry[],
  departmentAnnualSalary: number,
) {
  return useMemo(() => {
    // Per-entry computation
    const entryResults: PortfolioEntryResult[] = entries.map((entry) => {
      const durationMonths = Math.min(
        monthsBetween(entry.startMonth, entry.endMonth),
        entry.analysisPeriod,
      );

      // Scale factor: (estimatedHours / durationMonths) / baseline monthly hours
      const baseMonthlyHours =
        entry.baselineCurrentState.workers *
        entry.baselineCurrentState.hoursPerWeek *
        WEEKS_PER_MONTH;

      let scaleFactor = 0;
      if (durationMonths > 0 && baseMonthlyHours > 0) {
        scaleFactor = (entry.estimatedHours / durationMonths) / baseMonthlyHours;
      }

      // Apply excludeDesignControls
      let scenario = entry.scenario;
      if (entry.excludeDesignControls) {
        scenario = {
          ...scenario,
          investment: {
            ...scenario.investment,
            designCost: 0,
            controlsCost: 0,
          },
        };
      }

      const results = computeScenario(
        scenario,
        entry.analysisPeriod,
        entry.baselineCurrentState,
      );

      const scaledTotalValue = results.threeYearNetSavings * scaleFactor;
      const scaledTotalInvestment = results.totalInvestment * scaleFactor;

      return {
        entry,
        results,
        durationMonths,
        scaleFactor,
        scaledTotalValue,
        scaledTotalInvestment,
      };
    });

    // Aggregates using scaled values
    const totalValueCreated = entryResults.reduce(
      (sum, er) => sum + er.scaledTotalValue,
      0,
    );
    const totalInvestment = entryResults.reduce(
      (sum, er) => sum + er.scaledTotalInvestment,
      0,
    );
    const netProfit = totalValueCreated - departmentAnnualSalary;
    const departmentROI =
      departmentAnnualSalary > 0
        ? ((totalValueCreated - departmentAnnualSalary) / departmentAnnualSalary) * 100
        : 0;

    const aggregates: PortfolioAggregates = {
      totalValueCreated,
      totalInvestment,
      departmentCost: departmentAnnualSalary,
      netProfit,
      departmentROI,
    };

    // Timeline data generation
    let monthlySavingsTimeline: PortfolioTimelinePoint[] = [];
    let netPositionTimeline: PortfolioTimelinePoint[] = [];

    const validEntries = entryResults.filter(
      (er) => er.durationMonths > 0 && er.scaleFactor > 0,
    );

    if (validEntries.length > 0) {
      // Find global min start / max end
      const allStarts = validEntries.map((er) => er.entry.startMonth);
      const allEnds = validEntries.map((er) => er.entry.endMonth);
      allStarts.sort();
      allEnds.sort();
      const globalStart = allStarts[0];
      const globalEnd = allEnds[allEnds.length - 1];

      const monthRange = generateMonthRange(globalStart, globalEnd);

      monthlySavingsTimeline = monthRange.map((monthKey) => {
        const point: PortfolioTimelinePoint = {
          monthKey,
          label: formatMonthLabel(monthKey),
        };

        for (const er of validEntries) {
          const entryRange = generateMonthRange(
            er.entry.startMonth,
            er.entry.endMonth,
          );
          const idx = entryRange.indexOf(monthKey);
          if (idx >= 0 && idx < er.results.monthlyBreakdowns.length) {
            point[er.entry.id] =
              er.results.monthlyBreakdowns[idx].monthlySavings * er.scaleFactor;
          } else {
            point[er.entry.id] = 0;
          }
        }

        return point;
      });

      netPositionTimeline = monthRange.map((monthKey) => {
        const point: PortfolioTimelinePoint = {
          monthKey,
          label: formatMonthLabel(monthKey),
        };

        for (const er of validEntries) {
          const entryRange = generateMonthRange(
            er.entry.startMonth,
            er.entry.endMonth,
          );
          const idx = entryRange.indexOf(monthKey);
          if (idx >= 0 && idx < er.results.monthlyBreakdowns.length) {
            point[er.entry.id] =
              er.results.monthlyBreakdowns[idx].netPosition * er.scaleFactor;
          } else {
            point[er.entry.id] = 0;
          }
        }

        return point;
      });
    }

    return {
      entryResults,
      aggregates,
      monthlySavingsTimeline,
      netPositionTimeline,
    };
  }, [entries, departmentAnnualSalary]);
}
