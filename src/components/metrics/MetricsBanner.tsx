/**
 * MetricsBanner.tsx
 *
 * Top-level KPI summary strip. Only shows metrics for proposed scenarios
 * (results.slice(1)), since results[0] is the current solution baseline.
 */

import React from 'react';
import type { ScenarioResults } from '../../types';
import { MetricCard } from './MetricCard';
import { formatCurrencyK } from '../../constants/formatting';

interface MetricsBannerProps {
  results: ScenarioResults[];
}

export function MetricsBanner({ results }: MetricsBannerProps) {
  // results[0] = current solution, skip it for KPI display
  const proposedResults = results.slice(1);

  if (proposedResults.length === 0) {
    return (
      <div className="flex items-center justify-center px-4 py-3 bg-surface border-b border-edge">
        <p className="text-sm text-ink-muted">Add a proposed scenario to see KPIs</p>
      </div>
    );
  }

  // --- Single proposed scenario: horizontal card strip ---
  if (proposedResults.length === 1) {
    const r = proposedResults[0];
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 bg-surface border-b border-edge">
        <MetricCard
          label="Break-even"
          value={r.breakEvenMonth ? `Month ${r.breakEvenMonth}` : 'N/A'}
          highlight
        />
        <MetricCard
          label="Year 1 ROI"
          value={`${r.year1ROI.toFixed(0)}%`}
          highlight={r.year1ROI > 0}
        />
        <MetricCard
          label={`${r.monthlyBreakdowns.length}-Mo Net Savings`}
          value={formatCurrencyK(r.threeYearNetSavings)}
          highlight={r.threeYearNetSavings > 0}
        />
        <MetricCard
          label="Total Investment"
          value={formatCurrencyK(r.totalInvestment)}
        />
        <MetricCard
          label="Monthly Savings"
          value={formatCurrencyK(r.monthlySavingsAtFullAdoption)}
          subtext="at full adoption"
        />
      </div>
    );
  }

  // --- Multiple proposed scenarios: comparison table ---
  return (
    <div className="px-4 py-3 bg-surface border-b border-edge">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-ink-muted">
              <th className="text-left py-1 pr-4 font-medium text-xs uppercase tracking-wider">Scenario</th>
              <th className="text-center py-1 px-3 font-medium text-xs uppercase tracking-wider">Break-even</th>
              <th className="text-center py-1 px-3 font-medium text-xs uppercase tracking-wider">Year 1 ROI</th>
              <th className="text-center py-1 px-3 font-medium text-xs uppercase tracking-wider">Net Savings</th>
              <th className="text-center py-1 px-3 font-medium text-xs uppercase tracking-wider">Investment</th>
              <th className="text-center py-1 px-3 font-medium text-xs uppercase tracking-wider">Mo. Savings</th>
            </tr>
          </thead>
          <tbody>
            {proposedResults.map((r) => (
              <tr key={r.scenarioId} className="border-t border-edge">
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: r.color }}
                    />
                    <span className="text-ink font-medium">{r.scenarioName}</span>
                  </div>
                </td>
                <td className="text-center py-2 px-3 text-ink font-semibold">
                  {r.breakEvenMonth ? `Month ${r.breakEvenMonth}` : 'N/A'}
                </td>
                <td className="text-center py-2 px-3 text-ink font-semibold">
                  {r.year1ROI.toFixed(0)}%
                </td>
                <td className={`text-center py-2 px-3 font-semibold ${r.threeYearNetSavings > 0 ? 'text-ink-positive' : 'text-ink-negative'}`}>
                  {formatCurrencyK(r.threeYearNetSavings)}
                </td>
                <td className="text-center py-2 px-3 text-ink-secondary">
                  {formatCurrencyK(r.totalInvestment)}
                </td>
                <td className="text-center py-2 px-3 text-ink-secondary">
                  {formatCurrencyK(r.monthlySavingsAtFullAdoption)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
