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
import type { MonthlySavingsDataPoint } from '../../hooks/useChartData';
import { formatYAxisK, formatCurrencyK } from '../../constants/formatting';

interface MonthlySavingsChartProps {
  data: MonthlySavingsDataPoint[];
  results: ScenarioResults[];
}

function SavingsTooltip({ active, payload, label }: any) {
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
          <span className="text-white font-medium">
            {formatCurrencyK(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MonthlySavingsChart({ data, results }: MonthlySavingsChartProps) {
  if (data.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-3 px-1">
        Monthly Savings
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
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
          <Tooltip content={<SavingsTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 10, fontSize: 13 }} />
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
