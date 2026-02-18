/**
 * MonthlyTable.tsx
 *
 * Renders a month-by-month breakdown table showing adoption rates, savings,
 * investment costs, and cumulative net position over the analysis period.
 * The break-even month row is visually highlighted.
 */

import React from 'react';
import type { MonthlyBreakdown } from '../../types';
import { formatCurrency, formatPercent } from '../../constants/formatting';

interface MonthlyTableProps {
  breakdowns: MonthlyBreakdown[];
  breakEvenMonth: number | null;
}

export function MonthlyTable({ breakdowns, breakEvenMonth }: MonthlyTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-ink-muted border-b border-edge">
            <th className="text-left py-2 px-2 font-medium">Month</th>
            <th className="text-right py-2 px-2 font-medium">Adoption</th>
            <th className="text-right py-2 px-2 font-medium">Mo. Savings</th>
            <th className="text-right py-2 px-2 font-medium">Mo. Investment</th>
            <th className="text-right py-2 px-2 font-medium">Cum. Savings</th>
            <th className="text-right py-2 px-2 font-medium">Cum. Investment</th>
            <th className="text-right py-2 px-2 font-medium">Net Position</th>
          </tr>
        </thead>
        <tbody>
          {breakdowns.map((b) => {
            const isBreakEven = b.month === breakEvenMonth;
            return (
              <tr
                key={b.month}
                className={`
                  border-b border-edge transition-colors
                  ${isBreakEven ? 'bg-amber-900/20' : 'hover:bg-hovered'}
                `}
              >
                <td className="py-1.5 px-2 text-ink-secondary font-medium">
                  {isBreakEven && (
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
                  )}
                  M{b.month}
                </td>

                <td className="text-right py-1.5 px-2 text-ink-muted">
                  {formatPercent(b.adoptionRate)}
                </td>

                <td className={`text-right py-1.5 px-2 font-medium ${b.monthlySavings > 0 ? 'text-ink-positive' : 'text-ink-negative'}`}>
                  {formatCurrency(b.monthlySavings)}
                </td>

                <td className="text-right py-1.5 px-2 text-ink-accent">
                  {formatCurrency(b.monthlyInvestmentCost)}
                </td>

                <td className="text-right py-1.5 px-2 text-ink-positive">
                  {formatCurrency(b.cumulativeSavings)}
                </td>

                <td className="text-right py-1.5 px-2 text-ink-negative">
                  {formatCurrency(b.cumulativeInvestment)}
                </td>

                <td className={`text-right py-1.5 px-2 font-semibold ${b.netPosition > 0 ? 'text-ink-positive' : 'text-ink-negative'}`}>
                  {formatCurrency(b.netPosition)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
