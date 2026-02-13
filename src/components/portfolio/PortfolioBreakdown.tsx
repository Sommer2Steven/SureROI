/**
 * PortfolioBreakdown.tsx
 *
 * Collapsible "Show the Math" panel for portfolio mode.
 * Explains how scale factors, scaled values, and aggregate metrics are derived.
 * Per-entry formulas are shown grouped by project, followed by portfolio-level aggregates.
 */

import React, { useState } from 'react';
import type { FormulaDisplay } from '../../types';
import type { PortfolioEntryResult, PortfolioAggregates } from '../../hooks/usePortfolioCalculations';
import { SCENARIO_COLORS } from '../../constants/defaults';
import { formatCurrency, formatCurrencyK, formatNumber } from '../../constants/formatting';
import { formatMonthLabel, monthsBetween } from '../../utils/calendarUtils';
import { FormulaRow } from '../breakdown/FormulaRow';

const WEEKS_PER_MONTH = 4.33;

interface PortfolioBreakdownProps {
  entryResults: PortfolioEntryResult[];
  aggregates: PortfolioAggregates;
  departmentAnnualSalary: number;
}

/** Build formula cards for a single portfolio entry. */
function getEntryFormulas(er: PortfolioEntryResult): FormulaDisplay[] {
  const { entry, results, durationMonths, scaleFactor, scaledTotalValue, scaledTotalInvestment } = er;
  const baseline = entry.baselineCurrentState;
  const baseMonthlyHours = baseline.workers * baseline.hoursPerWeek * WEEKS_PER_MONTH;
  const hoursPerMonth = durationMonths > 0 ? entry.estimatedHours / durationMonths : 0;
  const duration = monthsBetween(entry.startMonth, entry.endMonth);

  const formulas: FormulaDisplay[] = [
    {
      id: `${entry.id}-duration`,
      label: 'Duration',
      formula: 'months_between(start, end)',
      substituted: `months_between(${formatMonthLabel(entry.startMonth)}, ${formatMonthLabel(entry.endMonth)})`,
      result: `${duration} months${duration !== durationMonths ? ` (capped to ${durationMonths} by analysis period)` : ''}`,
    },
    {
      id: `${entry.id}-base-monthly-hours`,
      label: 'Baseline Monthly Hours',
      formula: 'workers × hours_per_week × 4.33',
      substituted: `${baseline.workers} × ${baseline.hoursPerWeek} × 4.33`,
      result: `${formatNumber(baseMonthlyHours)} hrs/mo`,
    },
    {
      id: `${entry.id}-hours-per-month`,
      label: 'Est. Hours per Month',
      formula: 'estimated_hours / duration',
      substituted: durationMonths > 0
        ? `${formatNumber(entry.estimatedHours)} / ${durationMonths}`
        : `${formatNumber(entry.estimatedHours)} / 0`,
      result: `${formatNumber(hoursPerMonth)} hrs/mo`,
    },
    {
      id: `${entry.id}-scale-factor`,
      label: 'Scale Factor',
      formula: '(est_hours / duration) / baseline_monthly_hours',
      substituted: baseMonthlyHours > 0 && durationMonths > 0
        ? `(${formatNumber(entry.estimatedHours)} / ${durationMonths}) / ${formatNumber(baseMonthlyHours)}`
        : 'N/A (zero baseline hours or zero duration)',
      result: `${(scaleFactor * 100).toFixed(2)}%`,
    },
    {
      id: `${entry.id}-base-value`,
      label: 'Base Net Savings (unscaled)',
      formula: 'computeScenario(scenario, period, baseline).netSavings',
      substituted: `Full ${entry.analysisPeriod}-month simulation → net position at end`,
      result: formatCurrency(results.threeYearNetSavings),
    },
    {
      id: `${entry.id}-scaled-value`,
      label: 'Scaled Net Value',
      formula: 'base_net_savings × scale_factor',
      substituted: `${formatCurrency(results.threeYearNetSavings)} × ${(scaleFactor * 100).toFixed(2)}%`,
      result: formatCurrency(scaledTotalValue),
    },
    {
      id: `${entry.id}-base-investment`,
      label: 'Base Total Investment (unscaled)',
      formula: 'computeScenario(scenario, period, baseline).totalInvestment',
      substituted: `Cumulative investment over ${entry.analysisPeriod} months`,
      result: formatCurrency(results.totalInvestment),
    },
    {
      id: `${entry.id}-scaled-investment`,
      label: 'Scaled Total Investment',
      formula: 'base_investment × scale_factor',
      substituted: `${formatCurrency(results.totalInvestment)} × ${(scaleFactor * 100).toFixed(2)}%`,
      result: formatCurrency(scaledTotalInvestment),
    },
  ];

  if (entry.excludeDesignControls) {
    formulas.push({
      id: `${entry.id}-exclude-dc`,
      label: 'Exclude Design & Controls',
      formula: 'designCost = 0, controlsCost = 0',
      substituted: `Original design: ${formatCurrency(entry.scenario.investment.designCost)}, controls: ${formatCurrency(entry.scenario.investment.controlsCost)}`,
      result: 'Both zeroed before computation',
    });
  }

  return formulas;
}

/** Build portfolio-level aggregate formula cards. */
function getAggregateFormulas(
  entryResults: PortfolioEntryResult[],
  aggregates: PortfolioAggregates,
  departmentAnnualSalary: number,
): FormulaDisplay[] {
  const entryValueTerms = entryResults.map((er) => formatCurrency(er.scaledTotalValue)).join(' + ');
  const entryInvestTerms = entryResults.map((er) => formatCurrency(er.scaledTotalInvestment)).join(' + ');

  const formulas: FormulaDisplay[] = [
    {
      id: 'agg-total-value',
      label: 'Total Value Created',
      formula: 'Σ scaled_net_value (all entries)',
      substituted: entryResults.length > 0 ? entryValueTerms : '(no entries)',
      result: formatCurrency(aggregates.totalValueCreated),
    },
    {
      id: 'agg-total-investment',
      label: 'Total Scaled Investment',
      formula: 'Σ scaled_investment (all entries)',
      substituted: entryResults.length > 0 ? entryInvestTerms : '(no entries)',
      result: formatCurrency(aggregates.totalInvestment),
    },
    {
      id: 'agg-dept-cost',
      label: 'Department Cost',
      formula: 'department_annual_salary',
      substituted: `${formatCurrency(departmentAnnualSalary)}`,
      result: formatCurrency(aggregates.departmentCost),
    },
    {
      id: 'agg-net-profit',
      label: 'Net Profit',
      formula: 'total_value − department_cost',
      substituted: `${formatCurrency(aggregates.totalValueCreated)} − ${formatCurrency(departmentAnnualSalary)}`,
      result: formatCurrency(aggregates.netProfit),
    },
    {
      id: 'agg-dept-roi',
      label: 'Department ROI',
      formula: '((total_value − dept_cost) / dept_cost) × 100',
      substituted: departmentAnnualSalary > 0
        ? `((${formatCurrency(aggregates.totalValueCreated)} − ${formatCurrency(departmentAnnualSalary)}) / ${formatCurrency(departmentAnnualSalary)}) × 100`
        : 'N/A (department cost is $0)',
      result: `${aggregates.departmentROI.toFixed(1)}%`,
    },
  ];

  // Timeline explanation
  formulas.push({
    id: 'agg-timeline',
    label: 'Monthly Timeline Values',
    formula: 'For each calendar month: Σ (monthly_breakdown[i] × scale_factor) per entry',
    substituted: 'Each entry\'s month-by-month breakdown is indexed into its calendar range and scaled',
    result: 'Stacked per entry in chart',
  });

  return formulas;
}

export function PortfolioBreakdown({
  entryResults,
  aggregates,
  departmentAnnualSalary,
}: PortfolioBreakdownProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  if (entryResults.length === 0) return null;

  const toggleEntry = (id: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const aggregateFormulas = getAggregateFormulas(entryResults, aggregates, departmentAnnualSalary);

  return (
    <div className="border-t border-edge">
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="w-full flex items-center gap-2 px-6 py-4 text-sm font-semibold text-ink-secondary hover:text-ink hover:bg-hovered transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${showBreakdown ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Show the Math — Portfolio
      </button>

      {showBreakdown && (
        <div className="px-6 pb-6">
          {/* Aggregate formulas */}
          <h4 className="text-sm font-semibold text-ink-secondary mb-3">
            Portfolio Aggregates
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
            {aggregateFormulas.map((f) => (
              <FormulaRow key={f.id} formula={f} />
            ))}
          </div>

          {/* Per-entry formulas */}
          <h4 className="text-sm font-semibold text-ink-secondary mb-3">
            Per-Entry Calculations
          </h4>
          <div className="space-y-3">
            {entryResults.map((er, idx) => {
              const isExpanded = expandedEntries.has(er.entry.id);
              const entryFormulas = isExpanded ? getEntryFormulas(er) : [];

              return (
                <div key={er.entry.id} className="border border-edge rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleEntry(er.entry.id)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-ink hover:bg-hovered transition-colors"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: SCENARIO_COLORS[idx % SCENARIO_COLORS.length] }}
                    />
                    <span className="truncate">{er.entry.projectName}</span>
                    <span className="text-xs text-ink-muted ml-1">
                      ({er.entry.scenarioName})
                    </span>
                    <span className="ml-auto text-xs text-ink-muted shrink-0">
                      Scale: {(er.scaleFactor * 100).toFixed(1)}% &middot; Value: {formatCurrencyK(er.scaledTotalValue)}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {entryFormulas.map((f) => (
                          <FormulaRow key={f.id} formula={f} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
