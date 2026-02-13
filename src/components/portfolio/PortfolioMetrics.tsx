/**
 * PortfolioMetrics.tsx
 *
 * Summary metrics banner for portfolio mode.
 * Shows total value, department cost, net profit, and department ROI.
 */

import React from 'react';
import type { PortfolioAggregates } from '../../hooks/usePortfolioCalculations';
import { MetricCard } from '../metrics/MetricCard';
import { formatCurrencyK } from '../../constants/formatting';

interface PortfolioMetricsProps {
  aggregates: PortfolioAggregates;
  entryCount: number;
}

export function PortfolioMetrics({ aggregates, entryCount }: PortfolioMetricsProps) {
  if (entryCount === 0) {
    return (
      <div className="flex items-center justify-center px-4 py-3 bg-surface border-b border-edge">
        <p className="text-sm text-ink-muted">Add project entries to see portfolio metrics</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 bg-surface border-b border-edge">
      <MetricCard
        label="Total Value Created"
        value={formatCurrencyK(aggregates.totalValueCreated)}
        highlight={aggregates.totalValueCreated > 0}
      />
      <MetricCard
        label="Department Cost"
        value={formatCurrencyK(aggregates.departmentCost)}
      />
      <MetricCard
        label="Net Profit"
        value={formatCurrencyK(aggregates.netProfit)}
        highlight={aggregates.netProfit > 0}
      />
      <MetricCard
        label="Department ROI"
        value={`${aggregates.departmentROI.toFixed(0)}%`}
        highlight={aggregates.departmentROI > 0}
      />
    </div>
  );
}
