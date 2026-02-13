/**
 * CumulativeCostChart.tsx
 *
 * Plots cumulative cost over time.
 * ONE red Status Quo line (from current solution) + colored lines per proposed scenario.
 * Each proposed scenario gets its own color-matched break-even reference line.
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
import type { CumulativeDataPoint } from '../../hooks/useChartData';
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

  const proposedResults = results.slice(1);
  const gridColor = darkMode ? '#334155' : '#e2e8f0';
  const axisColor = darkMode ? '#9ca3af' : '#64748b';

  return (
    <div>
      <h3 className="text-base font-semibold text-ink-secondary mb-3 px-1">
        Cumulative Cost Over Time
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

          {/* Single red Status Quo line from current solution */}
          <Line
            type="monotone"
            dataKey="statusQuo"
            name="Status Quo"
            stroke="#DC2626"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />

          {/* Proposed scenario lines */}
          {proposedResults.map((r) => (
            <Line
              key={r.scenarioId}
              type="monotone"
              dataKey={`newTool_${r.scenarioId}`}
              name={proposedResults.length > 1 ? r.scenarioName : 'With New Tool'}
              stroke={r.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}

          {/* Per-scenario break-even lines, color-matched */}
          {proposedResults.map((r) =>
            r.breakEvenMonth ? (
              <ReferenceLine
                key={`be-${r.scenarioId}`}
                x={`M${r.breakEvenMonth}`}
                stroke={r.color}
                strokeWidth={2}
                strokeDasharray="6 4"
                label={{
                  value: `BE: M${r.breakEvenMonth}${proposedResults.length > 1 ? ` (${r.scenarioName})` : ''}`,
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
