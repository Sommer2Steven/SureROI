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

  // Calculate savings delta if we have status quo and at least one new tool
  const statusQuo = payload.find((p) => p.dataKey === 'statusQuo');
  const others = payload.filter((p) => p.dataKey !== 'statusQuo');

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1.5 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300">{entry.name}</span>
          </div>
          <span className="text-white font-medium">
            {formatCurrencyK(entry.value)}
          </span>
        </div>
      ))}
      {statusQuo && others.length > 0 && (
        <div className="border-t border-gray-600 mt-1.5 pt-1.5">
          {others.map((entry, i) => {
            const delta = statusQuo.value - entry.value;
            return (
              <div key={i} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-gray-400">Savings</span>
                <span
                  className={`font-medium ${delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}
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
