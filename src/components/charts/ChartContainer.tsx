/**
 * ChartContainer.tsx
 *
 * Unit Economics Panel — a bar chart comparing savings per unit across
 * scenarios, plus per-scenario cards for investment breakdown and break-even.
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ScenarioResults, ScenarioInputs } from '../../types';
import { formatCurrency, formatCurrencyDecimals, formatCurrencyK, formatNumber, formatYAxisK } from '../../constants/formatting';
import { QualitativeBadges } from './QualitativeBadges';

interface ChartContainerProps {
  results: ScenarioResults[];
  scenarios: ScenarioInputs[];
  darkMode: boolean;
}

function SavingsTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-edge rounded px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-ink mb-1">{d.name}</div>
      <div className="text-ink-secondary">
        {formatCurrencyDecimals(d.value)}<span className="text-ink-muted"> / {d.unitName}</span>
      </div>
    </div>
  );
}

export function ChartContainer({ results, scenarios, darkMode }: ChartContainerProps) {
  const barData = results.map((r) => {
    const scenario = scenarios.find((s) => s.id === r.scenarioId);
    return {
      name: r.scenarioName,
      value: r.savingsPerUnit,
      color: r.color,
      unitName: scenario?.savings.unitName || 'unit',
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <QualitativeBadges results={results} />

      {/* Bar chart: savings per unit comparison */}
      <div className="bg-card border border-edge rounded-lg p-4">
        <h3 className="text-sm font-semibold text-ink mb-3">Savings per Unit</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 4, right: 12, bottom: 4, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: darkMode ? '#94a3b8' : '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxisK}
              tick={{ fontSize: 11, fill: darkMode ? '#94a3b8' : '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<SavingsTooltip />} cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={64}>
              {barData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cards: unit economics per scenario */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {results.map((r) => {
          const scenario = scenarios.find((s) => s.id === r.scenarioId);
          const unitName = scenario?.savings.unitName || 'unit';
          const assemblyCost = scenario?.investment.assemblyCost ?? 0;
          const developmentCost = (scenario?.investment.designCost ?? 0) + (scenario?.investment.controlsCost ?? 0);
          const breakEvenUnits =
            r.savingsPerUnit > 0 ? r.totalInvestment / r.savingsPerUnit : null;

          return (
            <div
              key={r.scenarioId}
              className="bg-card border border-edge rounded-lg p-4 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: r.color }}
                />
                <h3 className="text-sm font-semibold text-ink truncate">
                  {r.scenarioName}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {/* Savings per Unit */}
                <div>
                  <div className="text-xs text-ink-muted uppercase tracking-wide mb-1">
                    Savings / Unit
                  </div>
                  <div className="text-lg font-bold text-ink">
                    {formatCurrencyDecimals(r.savingsPerUnit)}
                    <span className="text-xs font-normal text-ink-muted ml-1">/ {unitName}</span>
                  </div>
                </div>

                {/* Break-Even Units */}
                <div>
                  <div className="text-xs text-ink-muted uppercase tracking-wide mb-1">
                    Break-Even Units
                  </div>
                  <div className="text-lg font-bold text-ink">
                    {breakEvenUnits !== null ? formatNumber(breakEvenUnits) : 'N/A'}
                    {breakEvenUnits !== null && (
                      <span className="text-xs font-normal text-ink-muted ml-1">
                        {unitName}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Assembly Cost */}
                <div>
                  <div className="text-xs text-ink-muted uppercase tracking-wide mb-1">
                    Assembly Cost
                  </div>
                  <div className="text-lg font-bold text-ink">
                    {formatCurrency(assemblyCost)}
                  </div>
                </div>

                {/* Development Cost (Design + Controls) */}
                <div>
                  <div className="text-xs text-ink-muted uppercase tracking-wide mb-1">
                    Development Cost
                  </div>
                  <div className="text-lg font-bold text-ink">
                    {formatCurrency(developmentCost)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
