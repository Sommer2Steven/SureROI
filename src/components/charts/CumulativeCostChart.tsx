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
  Area,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts';
import type { ScenarioResults } from '../../types';
import type { CumulativeDataPoint } from '../../hooks/useChartData';
import { ChartTooltip } from './ChartTooltip';
import { formatYAxisK } from '../../constants/formatting';

interface CumulativeCostChartProps {
  data: CumulativeDataPoint[];
  results: ScenarioResults[];
}

export function CumulativeCostChart({ data, results }: CumulativeCostChartProps) {
  if (data.length === 0) return null;

  const primaryResult = results[0];
  const breakEvenMonth = primaryResult?.breakEvenMonth;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-3 px-1">
        Cumulative Cost Over Time
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
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
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 10, fontSize: 13 }}
          />

          {/* Status quo line */}
          <Line
            type="monotone"
            dataKey="statusQuo"
            name="Status Quo"
            stroke="#DC2626"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />

          {/* New tool lines for each scenario */}
          {results.map((r) => (
            <Line
              key={r.scenarioId}
              type="monotone"
              dataKey={`newTool_${r.scenarioId}`}
              name={results.length > 1 ? r.scenarioName : 'With New Tool'}
              stroke={r.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}

          {/* Break-even reference line */}
          {breakEvenMonth && (
            <ReferenceLine
              x={`M${breakEvenMonth}`}
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="6 4"
              label={{
                value: `Break-even: M${breakEvenMonth}`,
                position: 'top',
                fill: '#F59E0B',
                fontSize: 12,
                fontWeight: 600,
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
