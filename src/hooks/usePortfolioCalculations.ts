/**
 * hooks/usePortfolioCalculations.ts
 *
 * Computes ROI results for each portfolio entry with unit-based scaling,
 * tool count investment multiplier, cost exclusions, and overtime premium.
 * Then builds monthly timeline data for stacked bar charts.
 */

import { useMemo } from 'react';
import type { PortfolioEntry, ScenarioResults, ScenarioInputs } from '../types';
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
  scaledTotalSavings: number;
  scaledTotalValue: number;
  scaledTotalInvestment: number;
  hasOvertime: boolean;
  overtimePremium: number;
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

      // Scale factor: actual units / reference units (floor at 1 since input is hidden)
      const referenceUnits = Math.max(1, entry.baselineSavings.referenceUnits);
      let scaleFactor = entry.actualUnits / referenceUnits;

      // Overtime premium for time-based scenarios
      let hasOvertime = false;
      let overtimePremium = 1;
      if (entry.scenario.savings.mode === 'time-based' && durationMonths > 0) {
        const weeksInDuration = durationMonths * 4.33;
        const currentCrewSize = entry.scenario.savings.currentCrewSize;
        if (currentCrewSize > 0 && weeksInDuration > 0) {
          const weeklyHours = (entry.actualUnits * entry.scenario.savings.currentTimePerUnit / 60)
            / weeksInDuration * durationMonths;
          // Normalize to per-week
          const weeklyHoursPerWorker = weeklyHours / currentCrewSize / durationMonths;
          if (weeklyHoursPerWorker > 40) {
            hasOvertime = true;
            const effectiveHours = 40 + (weeklyHoursPerWorker - 40) * 1.5;
            overtimePremium = effectiveHours / weeklyHoursPerWorker;
            scaleFactor *= overtimePremium;
          }
        }
      }

      // Build modified scenario with cost exclusions and tool count
      const inv = { ...entry.scenario.investment };

      // Exclusions
      if (entry.excludeDesignControls) {
        inv.designCost = 0;
        inv.controlsCost = 0;
      }
      if (entry.excludeTraining) {
        inv.trainingCost = 0;
      }

      // Tool count multiplies per-tool costs only.
      // Design & controls are one-time development costs — they do NOT scale with tool count.
      inv.assemblyCost *= entry.toolCount;
      inv.trainingCost *= entry.toolCount;
      inv.deploymentCost *= entry.toolCount;
      inv.monthlyRecurringCost *= entry.toolCount;

      const modifiedScenario: ScenarioInputs = {
        ...entry.scenario,
        investment: inv,
      };

      const results = computeScenario(modifiedScenario, entry.analysisPeriod);

      // Savings scale with unit ratio; investment does NOT (already adjusted for toolCount)
      const lastBreakdown = results.monthlyBreakdowns[results.monthlyBreakdowns.length - 1];
      const baseCumulativeSavings = lastBreakdown?.cumulativeSavings ?? 0;
      const scaledTotalSavings = baseCumulativeSavings * scaleFactor;
      const scaledTotalInvestment = results.totalInvestment;
      const scaledTotalValue = scaledTotalSavings - scaledTotalInvestment;

      return {
        entry,
        results,
        durationMonths,
        scaleFactor,
        scaledTotalSavings,
        scaledTotalValue,
        scaledTotalInvestment,
        hasOvertime,
        overtimePremium,
      };
    });

    // Aggregates using scaled values (exclude hidden entries)
    const visibleResults = entryResults.filter((er) => !er.entry.hidden);
    const totalValueCreated = visibleResults.reduce(
      (sum, er) => sum + er.scaledTotalValue,
      0,
    );
    const totalInvestment = visibleResults.reduce(
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
      (er) => er.durationMonths > 0 && er.scaleFactor > 0 && !er.entry.hidden,
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
            // Savings scale with unit ratio; investment does not
            const scaledCumSavings = er.results.monthlyBreakdowns[idx].cumulativeSavings * er.scaleFactor;
            const cumInvestment = er.results.monthlyBreakdowns[idx].cumulativeInvestment;
            point[er.entry.id] = scaledCumSavings - cumInvestment;
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
