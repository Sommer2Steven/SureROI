/**
 * MonthlySavingsChart.tsx
 *
 * Bar chart showing month-by-month savings for all scenarios.
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { ScenarioResults } from '../../types';

/** Inline type — useChartData was removed; this file is dead code kept for reference */
interface MonthlySavingsDataPoint { month: number; label: string; [key: string]: number | string; }
import { QualitativeBadges } from './QualitativeBadges';
import { formatYAxisK, formatCurrencyK } from '../../constants/formatting';

interface MonthlySavingsChartProps {
  data: MonthlySavingsDataPoint[];
  results: ScenarioResults[];
  darkMode: boolean;
}

function SavingsTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-edge rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-ink-muted mb-1.5 font-medium">{label}</p>
      {payload.map((entry: any, i: number) => (
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
    </div>
  );
}

export function MonthlySavingsChart({ data, results, darkMode }: MonthlySavingsChartProps) {
  if (data.length === 0 || results.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-ink-muted">
        <p>Add a scenario to see monthly savings</p>
      </div>
    );
  }

  const gridColor = darkMode ? '#334155' : '#e2e8f0';
  const axisColor = darkMode ? '#9ca3af' : '#64748b';

  return (
    <div>
      <h3 className="text-base font-semibold text-ink-secondary mb-3 px-1">
        Monthly Savings
      </h3>
      <QualitativeBadges results={results} />
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="label"
            stroke={axisColor}
            tick={{ fontSize: 14 }}
            interval={Math.max(0, Math.floor(data.length / 12) - 1)}
          />
          <YAxis
            stroke={axisColor}
            tick={{ fontSize: 14 }}
            tickFormatter={formatYAxisK}
          />
          <Tooltip content={<SavingsTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 10, fontSize: 14 }} />

          <ReferenceLine y={0} stroke="#6B7280" />

          {results.map((r) => (
            <Bar
              key={r.scenarioId}
              dataKey={`savings_${r.scenarioId}`}
              name={results.length > 1 ? r.scenarioName : 'Monthly Savings'}
              fill={r.color}
              opacity={0.85}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
