/**
 * PortfolioBreakdown.tsx
 *
 * Collapsible "Show the Math" panel for portfolio mode.
 * Shows unit-based scaling, tool count multiplier, cost exclusions,
 * overtime premium, and aggregate metrics.
 */

import React, { useState } from 'react';
import type { FormulaDisplay } from '../../types';
import type { PortfolioEntryResult, PortfolioAggregates } from '../../hooks/usePortfolioCalculations';
import { SCENARIO_COLORS } from '../../constants/defaults';
import { formatCurrency, formatCurrencyK, formatNumber } from '../../constants/formatting';
import { formatMonthLabel, monthsBetween } from '../../utils/calendarUtils';
import { FormulaRow } from '../breakdown/FormulaRow';

interface PortfolioBreakdownProps {
  entryResults: PortfolioEntryResult[];
  aggregates: PortfolioAggregates;
  departmentAnnualSalary: number;
}

/** Build formula cards for a single portfolio entry. */
function getEntryFormulas(er: PortfolioEntryResult): FormulaDisplay[] {
  const { entry, results, durationMonths, scaleFactor, scaledTotalSavings, scaledTotalValue, scaledTotalInvestment, hasOvertime, overtimePremium } = er;
  const refUnits = entry.baselineSavings.referenceUnits;
  const duration = monthsBetween(entry.startMonth, entry.endMonth);
  const unitName = entry.scenario.savings.unitName;
  const lastBreakdown = results.monthlyBreakdowns[results.monthlyBreakdowns.length - 1];
  const baseCumulativeSavings = lastBreakdown?.cumulativeSavings ?? 0;

  const formulas: FormulaDisplay[] = [
    {
      id: `${entry.id}-duration`,
      label: 'Duration',
      formula: 'months_between(start, end)',
      substituted: `months_between(${formatMonthLabel(entry.startMonth)}, ${formatMonthLabel(entry.endMonth)})`,
      result: `${duration} months${duration !== durationMonths ? ` (capped to ${durationMonths} by analysis period)` : ''}`,
    },
    {
      id: `${entry.id}-scale-factor`,
      label: 'Scale Factor',
      formula: `actual_${unitName}s / reference_${unitName}s`,
      substituted: refUnits > 0
        ? `${formatNumber(entry.actualUnits)} / ${formatNumber(refUnits)}`
        : `N/A (zero reference ${unitName}s)`,
      result: `${(scaleFactor * 100).toFixed(2)}%${hasOvertime ? ` (incl. ${((overtimePremium - 1) * 100).toFixed(0)}% OT premium)` : ''}`,
    },
    {
      id: `${entry.id}-tool-count`,
      label: 'Tool Count',
      formula: 'assembly, training, deployment, recurring x tool_count (design & controls are one-time)',
      substituted: `Per-tool costs x ${entry.toolCount}; design & controls unchanged`,
      result: `${entry.toolCount} tool(s)`,
    },
    {
      id: `${entry.id}-base-savings`,
      label: 'Base Cumulative Savings (unscaled)',
      formula: 'cumulative savings over period (1 reference unit)',
      substituted: `Full ${entry.analysisPeriod}-month simulation`,
      result: formatCurrency(baseCumulativeSavings),
    },
    {
      id: `${entry.id}-scaled-savings`,
      label: 'Scaled Cumulative Savings',
      formula: 'base_cumulative_savings x scale_factor',
      substituted: `${formatCurrency(baseCumulativeSavings)} x ${(scaleFactor * 100).toFixed(2)}%`,
      result: formatCurrency(scaledTotalSavings),
    },
    {
      id: `${entry.id}-investment`,
      label: 'Total Investment (tool-count adjusted)',
      formula: 'cumulative investment over period (adjusted for tool count, not unit ratio)',
      substituted: `Tool count: ${entry.toolCount}; investment does not scale with unit ratio`,
      result: formatCurrency(scaledTotalInvestment),
    },
    {
      id: `${entry.id}-scaled-value`,
      label: 'Scaled Net Value',
      formula: 'scaled_cumulative_savings - total_investment',
      substituted: `${formatCurrency(scaledTotalSavings)} - ${formatCurrency(scaledTotalInvestment)}`,
      result: formatCurrency(scaledTotalValue),
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

  if (entry.excludeTraining) {
    formulas.push({
      id: `${entry.id}-exclude-training`,
      label: 'Exclude Training',
      formula: 'trainingCost = 0',
      substituted: `Original training: ${formatCurrency(entry.scenario.investment.trainingCost)}`,
      result: 'Zeroed before computation',
    });
  }

  if (hasOvertime) {
    formulas.push({
      id: `${entry.id}-overtime`,
      label: 'Overtime Premium',
      formula: '(40 + (weekly_hours - 40) x 1.5) / weekly_hours',
      substituted: `Premium factor: ${overtimePremium.toFixed(3)}`,
      result: `${((overtimePremium - 1) * 100).toFixed(1)}% additional cost`,
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
      formula: 'sum scaled_net_value (all entries)',
      substituted: entryResults.length > 0 ? entryValueTerms : '(no entries)',
      result: formatCurrency(aggregates.totalValueCreated),
    },
    {
      id: 'agg-total-investment',
      label: 'Total Investment',
      formula: 'sum investment (all entries, tool-count adjusted, not unit-scaled)',
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
      formula: 'total_value - department_cost',
      substituted: `${formatCurrency(aggregates.totalValueCreated)} - ${formatCurrency(departmentAnnualSalary)}`,
      result: formatCurrency(aggregates.netProfit),
    },
    {
      id: 'agg-dept-roi',
      label: 'Department ROI',
      formula: '((total_value - dept_cost) / dept_cost) x 100',
      substituted: departmentAnnualSalary > 0
        ? `((${formatCurrency(aggregates.totalValueCreated)} - ${formatCurrency(departmentAnnualSalary)}) / ${formatCurrency(departmentAnnualSalary)}) x 100`
        : 'N/A (department cost is $0)',
      result: `${aggregates.departmentROI.toFixed(1)}%`,
    },
    {
      id: 'agg-timeline',
      label: 'Monthly Timeline Values',
      formula: 'For each calendar month: sum (monthly_breakdown[i] x scale_factor) per entry',
      substituted: 'Each entry\'s month-by-month breakdown is indexed into its calendar range and scaled',
      result: 'Stacked per entry in chart',
    },
  ];

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
                <div key={er.entry.id} className="border border-edge rounded-lg overflow-hidden bg-card">
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
