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
          <tr className="text-gray-400 border-b border-gray-700">
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
                  border-b border-gray-800 transition-colors
                  ${isBreakEven ? 'bg-amber-900/20' : 'hover:bg-gray-800/50'}
                `}
              >
                <td className="py-1.5 px-2 text-gray-300 font-medium">
                  {isBreakEven && (
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
                  )}
                  M{b.month}
                </td>
                <td className="text-right py-1.5 px-2 text-gray-400">
                  {formatPercent(b.adoptionRate)}
                </td>
                <td className="text-right py-1.5 px-2 text-red-400">
                  {formatCurrency(b.currentTotal)}
                </td>
                <td className="text-right py-1.5 px-2 text-blue-400">
                  {formatCurrency(b.newTotal)}
                </td>
                <td className={`text-right py-1.5 px-2 font-medium ${b.monthlySavings > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(b.monthlySavings)}
                </td>
                <td className="text-right py-1.5 px-2 text-red-300">
                  {formatCurrency(b.cumulativeStatusQuo)}
                </td>
                <td className="text-right py-1.5 px-2 text-blue-300">
                  {formatCurrency(b.cumulativeNewTool)}
                </td>
                <td className={`text-right py-1.5 px-2 font-semibold ${b.netPosition > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
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
