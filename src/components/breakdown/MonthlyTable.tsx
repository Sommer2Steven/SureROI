/**
 * MonthlyTable.tsx
 *
 * Renders a month-by-month breakdown table showing adoption rates, costs,
 * savings, and cumulative net position over the analysis period. The
 * break-even month row is visually highlighted so users can quickly
 * identify when the new tool starts paying for itself.
 */

import React from 'react';
import type { MonthlyBreakdown } from '../../types';
import { formatCurrency, formatPercent } from '../../constants/formatting';

interface MonthlyTableProps {
  breakdowns: MonthlyBreakdown[];
  /** The month number at which cumulative savings exceed cumulative costs, or null if never reached */
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
            <th className="text-right py-2 px-2 font-medium">Current Total</th>
            <th className="text-right py-2 px-2 font-medium">New Total</th>
            <th className="text-right py-2 px-2 font-medium">Mo. Savings</th>
            <th className="text-right py-2 px-2 font-medium">Cum. Status Quo</th>
            <th className="text-right py-2 px-2 font-medium">Cum. New Tool</th>
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
                {/* Month label — break-even row gets an amber dot indicator */}
                <td className="py-1.5 px-2 text-ink-secondary font-medium">
                  {isBreakEven && (
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
                  )}
                  M{b.month}
                </td>

                {/* Adoption rate as a percentage (ramps up over time) */}
                <td className="text-right py-1.5 px-2 text-ink-muted">
                  {formatPercent(b.adoptionRate)}
                </td>

                {/* Monthly cost under the current (status-quo) approach */}
                <td className="text-right py-1.5 px-2 text-ink-negative">
                  {formatCurrency(b.currentTotal)}
                </td>

                {/* Monthly cost under the new tool */}
                <td className="text-right py-1.5 px-2 text-ink-accent">
                  {formatCurrency(b.newTotal)}
                </td>

                {/* Monthly savings: green if positive, red if negative */}
                <td className={`text-right py-1.5 px-2 font-medium ${b.monthlySavings > 0 ? 'text-ink-positive' : 'text-ink-negative'}`}>
                  {formatCurrency(b.monthlySavings)}
                </td>

                {/* Cumulative spend under the status quo */}
                <td className="text-right py-1.5 px-2 text-ink-negative">
                  {formatCurrency(b.cumulativeStatusQuo)}
                </td>

                {/* Cumulative spend under the new tool (includes implementation costs) */}
                <td className="text-right py-1.5 px-2 text-ink-accent">
                  {formatCurrency(b.cumulativeNewTool)}
                </td>

                {/* Net position: cumulative status-quo cost minus cumulative new-tool cost.
                    Positive means the new tool has saved money overall. */}
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
