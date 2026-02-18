/**
 * ScenarioComparison.tsx
 *
 * Line chart overlaying net position of all scenarios.
 * Requires at least 2 scenarios.
 */

import React from 'react';
import {
  LineChart,
  Line,
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
interface CompareDataPoint { month: number; label: string; [key: string]: number | string; }
import { QualitativeBadges } from './QualitativeBadges';
import { formatYAxisK, formatCurrencyK } from '../../constants/formatting';

interface ScenarioComparisonProps {
  data: CompareDataPoint[];
  results: ScenarioResults[];
  darkMode: boolean;
}

function CompareTooltip({ active, payload, label }: any) {
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
          <span
            className={`font-medium ${entry.value > 0 ? 'text-ink-positive' : 'text-ink-negative'}`}
          >
            {formatCurrencyK(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ScenarioComparison({ data, results, darkMode }: ScenarioComparisonProps) {
  if (data.length === 0 || results.length < 2) {
    return (
      <div className="flex items-center justify-center h-[400px] text-ink-muted">
        <p>Add at least 2 scenarios to see comparison</p>
      </div>
    );
  }

  const gridColor = darkMode ? '#334155' : '#e2e8f0';
  const axisColor = darkMode ? '#9ca3af' : '#64748b';

  return (
    <div>
      <h3 className="text-base font-semibold text-ink-secondary mb-3 px-1">
        Scenario Comparison &mdash; Net Position Over Time
      </h3>
      <QualitativeBadges results={results} />
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
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
          <Tooltip content={<CompareTooltip />} />
          <Legend content={() => null} />

          <ReferenceLine
            y={0}
            stroke="#F59E0B"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            label={{
              value: 'Break-even',
              position: 'right',
              fill: '#F59E0B',
              fontSize: 14,
            }}
          />

          {results.map((r) => (
            <Line
              key={r.scenarioId}
              type="monotone"
              dataKey={`net_${r.scenarioId}`}
              name={r.scenarioName}
              stroke={r.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Custom legend row */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 mt-3 text-sm">
        {results.map((r) => (
          <div key={r.scenarioId} className="flex items-center gap-1.5">
            <span
              className="w-4 h-0.5 rounded-full inline-block"
              style={{ backgroundColor: r.color }}
            />
            <span className="text-ink-secondary">{r.scenarioName}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <svg width="20" height="4" className="shrink-0">
            <line
              x1="0" y1="2" x2="20" y2="2"
              stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3"
            />
          </svg>
          <span className="text-amber-400 font-medium">Break-even Line</span>
        </div>
      </div>
    </div>
  );
}
