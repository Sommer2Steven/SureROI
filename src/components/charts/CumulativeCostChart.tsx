/**
 * CumulativeCostChart.tsx
 *
 * Plots cumulative savings vs cumulative investment over time for each scenario.
 * Each scenario gets a solid line for savings and a dashed line for investment.
 * Break-even reference lines are color-matched per scenario.
 */

import React from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts';
import type { ScenarioResults } from '../../types';

/** Inline type — useChartData was removed; this file is dead code kept for reference */
interface CumulativeDataPoint { month: number; label: string; [key: string]: number | string; }
import { ChartTooltip } from './ChartTooltip';
import { QualitativeBadges } from './QualitativeBadges';
import { formatYAxisK } from '../../constants/formatting';

interface CumulativeCostChartProps {
  data: CumulativeDataPoint[];
  results: ScenarioResults[];
  darkMode: boolean;
}

export function CumulativeCostChart({ data, results, darkMode }: CumulativeCostChartProps) {
  if (data.length === 0) return null;

  const gridColor = darkMode ? '#334155' : '#e2e8f0';
  const axisColor = darkMode ? '#9ca3af' : '#64748b';

  return (
    <div>
      <h3 className="text-base font-semibold text-ink-secondary mb-3 px-1">
        Cumulative Savings vs Investment
      </h3>
      <QualitativeBadges results={results} />
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 44, right: 30, left: 10, bottom: 5 }}>
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
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 10, fontSize: 14 }} />

          {/* Per-scenario savings and investment lines */}
          {results.map((r) => (
            <React.Fragment key={r.scenarioId}>
              <Line
                type="monotone"
                dataKey={`savings_${r.scenarioId}`}
                name={results.length > 1 ? `${r.scenarioName} Savings` : 'Cumulative Savings'}
                stroke={r.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey={`investment_${r.scenarioId}`}
                name={results.length > 1 ? `${r.scenarioName} Investment` : 'Cumulative Investment'}
                stroke="#DC2626"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </React.Fragment>
          ))}

          {/* Per-scenario break-even lines */}
          {results.map((r) =>
            r.breakEvenMonth ? (
              <ReferenceLine
                key={`be-${r.scenarioId}`}
                x={`M${r.breakEvenMonth}`}
                stroke={r.color}
                strokeWidth={2}
                strokeDasharray="6 4"
                label={{
                  value: `BE: M${r.breakEvenMonth}${results.length > 1 ? ` (${r.scenarioName})` : ''}`,
                  position: 'insideTop',
                  fill: r.color,
                  fontSize: 12,
                  fontWeight: 600,
                  dy: -24,
                }}
              />
            ) : null
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
