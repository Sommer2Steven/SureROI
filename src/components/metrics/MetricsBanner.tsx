import React from 'react';
import type { ScenarioResults } from '../../types';
import { MetricCard } from './MetricCard';
import { formatCurrencyK } from '../../constants/formatting';

interface MetricsBannerProps {
  results: ScenarioResults[];
}

export function MetricsBanner({ results }: MetricsBannerProps) {
  if (results.length === 0) return null;

  // Show the active (first) scenario's metrics
  // If multiple scenarios, show comparison
  if (results.length === 1) {
    const r = results[0];
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 bg-gray-900/50 border-b border-gray-700/50">
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

  // Comparison mode
  return (
    <div className="px-4 py-3 bg-gray-900/50 border-b border-gray-700/50">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400">
              <th className="text-left py-1 pr-4 font-medium text-xs uppercase tracking-wider">Scenario</th>
              <th className="text-center py-1 px-3 font-medium text-xs uppercase tracking-wider">Break-even</th>
              <th className="text-center py-1 px-3 font-medium text-xs uppercase tracking-wider">Year 1 ROI</th>
              <th className="text-center py-1 px-3 font-medium text-xs uppercase tracking-wider">Net Savings</th>
              <th className="text-center py-1 px-3 font-medium text-xs uppercase tracking-wider">Investment</th>
              <th className="text-center py-1 px-3 font-medium text-xs uppercase tracking-wider">Mo. Savings</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.scenarioId} className="border-t border-gray-800">
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: r.color }}
                    />
                    <span className="text-white font-medium">{r.scenarioName}</span>
                  </div>
                </td>
                <td className="text-center py-2 px-3 text-white font-semibold">
                  {r.breakEvenMonth ? `Month ${r.breakEvenMonth}` : 'N/A'}
                </td>
                <td className="text-center py-2 px-3 text-white font-semibold">
                  {r.year1ROI.toFixed(0)}%
                </td>
                <td className={`text-center py-2 px-3 font-semibold ${r.threeYearNetSavings > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrencyK(r.threeYearNetSavings)}
                </td>
                <td className="text-center py-2 px-3 text-gray-300">
                  {formatCurrencyK(r.totalInvestment)}
                </td>
                <td className="text-center py-2 px-3 text-gray-300">
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
