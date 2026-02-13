/**
 * ChartTooltip.tsx
 *
 * Custom Recharts tooltip for the Cumulative Cost chart.
 * Handles single "statusQuo" key and "newTool_{id}" keys per proposed scenario.
 */

import React from 'react';
import { formatCurrencyK } from '../../constants/formatting';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const statusQuoEntry = payload.find((p) => p.dataKey === 'statusQuo');
  const toolEntries = payload.filter((p) => (p.dataKey as string).startsWith('newTool'));

  return (
    <div className="bg-card border border-edge rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-ink-muted mb-1.5 font-medium">{label}</p>

      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-ink-secondary">{entry.name}</span>
          </div>
          <span className="text-ink font-medium">
            {formatCurrencyK(entry.value)}
          </span>
        </div>
      ))}

      {/* Show savings delta for each proposed scenario vs the single status quo */}
      {statusQuoEntry && toolEntries.length > 0 && (
        <div className="border-t border-edge mt-1.5 pt-1.5">
          {toolEntries.map((entry, i) => {
            const delta = statusQuoEntry.value - entry.value;
            return (
              <div key={i} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-ink-muted">
                  {toolEntries.length > 1 ? `Savings (${entry.name})` : 'Savings'}
                </span>
                <span
                  className={`font-medium ${delta > 0 ? 'text-ink-positive' : 'text-ink-negative'}`}
                >
                  {formatCurrencyK(delta)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
