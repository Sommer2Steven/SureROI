/**
 * PortfolioChart.tsx
 *
 * Stacked bar chart showing calendar-month timeline of portfolio entries.
 * Supports "Monthly Savings" and "Net Position" views with a view toggle.
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { PortfolioChartView } from '../../types';
import type { PortfolioEntryResult, PortfolioTimelinePoint } from '../../hooks/usePortfolioCalculations';
import { SCENARIO_COLORS } from '../../constants/defaults';
import { formatYAxisK, formatCurrencyK } from '../../constants/formatting';

interface PortfolioChartProps {
  entryResults: PortfolioEntryResult[];
  monthlySavingsTimeline: PortfolioTimelinePoint[];
  netPositionTimeline: PortfolioTimelinePoint[];
  departmentAnnualSalary: number;
  darkMode: boolean;
  chartView: PortfolioChartView;
  onChartViewChange: (view: PortfolioChartView) => void;
}

function PortfolioTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const total = payload.reduce(
    (sum: number, entry: any) => sum + (typeof entry.value === 'number' ? entry.value : 0),
    0,
  );

  return (
    <div className="bg-card border border-edge rounded-lg px-3 py-2 shadow-xl max-w-xs">
      <p className="text-xs text-ink-muted mb-1.5 font-medium">{label}</p>
      {payload.map((entry: any, i: number) => (
        entry.value !== 0 && (
          <div key={i} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-ink-secondary truncate">{entry.name}</span>
            </div>
            <span className={`font-medium shrink-0 ${entry.value > 0 ? 'text-ink-positive' : 'text-ink-negative'}`}>
              {formatCurrencyK(entry.value)}
            </span>
          </div>
        )
      ))}
      <div className="mt-1 pt-1 border-t border-edge flex items-center justify-between text-sm">
        <span className="text-ink-secondary font-medium">Total</span>
        <span className={`font-semibold ${total > 0 ? 'text-ink-positive' : 'text-ink-negative'}`}>
          {formatCurrencyK(total)}
        </span>
      </div>
    </div>
  );
}

export function PortfolioChart({
  entryResults,
  monthlySavingsTimeline,
  netPositionTimeline,
  departmentAnnualSalary,
  darkMode,
  chartView,
  onChartViewChange,
}: PortfolioChartProps) {
  const data = chartView === 'monthly-savings' ? monthlySavingsTimeline : netPositionTimeline;

  // Entries that contribute to the chart (visible, with valid data)
  const activeEntries = entryResults.filter(
    (er) => er.durationMonths > 0 && er.scaleFactor > 0 && !er.entry.hidden,
  );

  if (activeEntries.length === 0 || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-ink-muted">
        <p>Add project entries with estimated hours to see the timeline chart</p>
      </div>
    );
  }

  const gridColor = darkMode ? '#334155' : '#e2e8f0';
  const axisColor = darkMode ? '#9ca3af' : '#64748b';
  const deptMonthlyCost = departmentAnnualSalary / 12;

  // Helper: sum entry values at a timeline point
  const sumAtPoint = (pt: PortfolioTimelinePoint) =>
    activeEntries.reduce((sum, er) => {
      const v = pt[er.entry.id];
      return sum + (typeof v === 'number' ? v : 0);
    }, 0);

  // Breakeven with 0: first month where total net position > 0
  const breakEvenZero = (() => {
    for (let i = 0; i < netPositionTimeline.length; i++) {
      if (sumAtPoint(netPositionTimeline[i]) > 0) {
        return { label: netPositionTimeline[i].label, month: i + 1 };
      }
    }
    return null;
  })();



  // Ensure Y-axis domain includes the department monthly cost line
  const allValues = data.flatMap((pt) =>
    activeEntries.map((er) => {
      const v = pt[er.entry.id];
      return typeof v === 'number' ? v : 0;
    }),
  );
  // For stacked bars, sum the positive values per point
  const stackedMaxes = data.map((pt) =>
    activeEntries.reduce((sum, er) => {
      const v = pt[er.entry.id];
      return sum + (typeof v === 'number' && v > 0 ? v : 0);
    }, 0),
  );
  const dataMax = Math.max(...stackedMaxes, 0);
  const dataMin = Math.min(...allValues, 0);
  const yDomainMax = deptMonthlyCost > 0 ? Math.max(dataMax, deptMonthlyCost) * 1.1 : undefined;
  const yDomainMin = dataMin < 0 ? dataMin * 1.1 : 0;

  // Auto-calculate tick interval for readability
  const tickInterval = data.length > 24 ? 2 : data.length > 12 ? 1 : 0;

  return (
    <div>
      {/* View toggle tabs */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-base font-semibold text-ink-secondary">
          Portfolio Timeline
        </h3>
        <div className="flex rounded-lg border border-edge overflow-hidden text-sm">
          <button
            onClick={() => onChartViewChange('monthly-savings')}
            className={`px-3 py-1 transition-colors ${
              chartView === 'monthly-savings'
                ? 'bg-blue-600 text-white'
                : 'bg-card text-ink-secondary hover:bg-hovered'
            }`}
          >
            Monthly Savings
          </button>
          <button
            onClick={() => onChartViewChange('net-position')}
            className={`px-3 py-1 transition-colors ${
              chartView === 'net-position'
                ? 'bg-blue-600 text-white'
                : 'bg-card text-ink-secondary hover:bg-hovered'
            }`}
          >
            Net Position
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          stackOffset="sign"
          margin={{ top: 10, right: 30, left: 10, bottom: data.length > 12 ? 60 : 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="label"
            stroke={axisColor}
            tick={{ fontSize: 11 }}
            interval={tickInterval}
            angle={data.length > 12 ? -45 : 0}
            textAnchor={data.length > 12 ? 'end' : 'middle'}
          />
          <YAxis
            stroke={axisColor}
            tick={{ fontSize: 14 }}
            tickFormatter={formatYAxisK}
            domain={[yDomainMin, yDomainMax ?? 'auto']}
          />
          <Tooltip content={<PortfolioTooltip />} />

          {/* Zero reference line for net-position view */}
          {chartView === 'net-position' && (
            <ReferenceLine y={0} stroke={axisColor} strokeWidth={1} />
          )}

          {/* Department monthly cost reference line */}
          {deptMonthlyCost > 0 && (
            <ReferenceLine
              y={deptMonthlyCost}
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="6 4"
              label={{
                value: 'Dept Monthly Cost',
                position: 'right',
                fill: '#F59E0B',
                fontSize: 12,
              }}
            />
          )}

          {/* Breakeven with $0 — net-position view only */}
          {chartView === 'net-position' && breakEvenZero && (
            <ReferenceLine
              x={breakEvenZero.label}
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="6 4"
              label={{
                value: `Break-even (Mo ${breakEvenZero.month})`,
                position: 'top',
                fill: '#10B981',
                fontSize: 11,
              }}
            />
          )}

          {/* Stacked bars — one per active entry */}
          {activeEntries.map((er, idx) => (
            <Bar
              key={er.entry.id}
              dataKey={er.entry.id}
              name={er.entry.projectName}
              stackId="portfolio"
              fill={SCENARIO_COLORS[idx % SCENARIO_COLORS.length]}
              radius={idx === activeEntries.length - 1 ? [2, 2, 0, 0] : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 mt-3 text-sm">
        {activeEntries.map((er, idx) => (
          <div key={er.entry.id} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ backgroundColor: SCENARIO_COLORS[idx % SCENARIO_COLORS.length] }}
            />
            <span className="text-ink-secondary">{er.entry.projectName}</span>
          </div>
        ))}
        {deptMonthlyCost > 0 && (
          <div className="flex items-center gap-1.5">
            <svg width="20" height="4" className="shrink-0">
              <line
                x1="0" y1="2" x2="20" y2="2"
                stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3"
              />
            </svg>
            <span className="text-amber-400 font-medium">Dept Monthly Cost</span>
          </div>
        )}
        {chartView === 'net-position' && breakEvenZero && (
          <div className="flex items-center gap-1.5">
            <svg width="20" height="4" className="shrink-0">
              <line
                x1="0" y1="2" x2="20" y2="2"
                stroke="#10B981" strokeWidth="2" strokeDasharray="4 3"
              />
            </svg>
            <span className="text-emerald-400 font-medium">Break-even (Mo {breakEvenZero.month})</span>
          </div>
        )}
      </div>
    </div>
  );
}
