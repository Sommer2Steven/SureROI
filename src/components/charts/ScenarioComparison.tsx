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
import type { CompareDataPoint } from '../../hooks/useChartData';
import { formatYAxisK, formatCurrencyK } from '../../constants/formatting';

interface ScenarioComparisonProps {
  data: CompareDataPoint[];
  results: ScenarioResults[];
}

function CompareTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1.5 font-medium">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300">{entry.name}</span>
          </div>
          <span
            className={`font-medium ${entry.value > 0 ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {formatCurrencyK(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ScenarioComparison({ data, results }: ScenarioComparisonProps) {
  if (data.length === 0 || results.length < 2) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        <p>Add at least 2 scenarios to see comparison</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-3 px-1">
        Scenario Comparison — Net Position Over Time
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="label"
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            interval={Math.max(0, Math.floor(data.length / 12) - 1)}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            tickFormatter={formatYAxisK}
          />
          <Tooltip content={<CompareTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 10, fontSize: 13 }} />
          <ReferenceLine
            y={0}
            stroke="#F59E0B"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            label={{
              value: 'Break-even',
              position: 'right',
              fill: '#F59E0B',
              fontSize: 11,
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
    </div>
  );
}
