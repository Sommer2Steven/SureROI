/**
 * MetricCard.tsx
 *
 * A compact, reusable card for displaying a single KPI metric.
 * Used within MetricsBanner to show values like break-even month,
 * Year 1 ROI, net savings, etc. Supports an optional highlight state
 * (blue accent) to draw attention to key metrics and an optional
 * subtext line for additional context.
 */

import React from 'react';

interface MetricCardProps {
  /** Display label shown above the value, e.g. "Break-even" */
  label: string;
  /** Formatted metric value, e.g. "$42K" or "Month 8" */
  value: string;
  /** Optional helper text displayed below the value, e.g. "at full adoption" */
  subtext?: string;
  /** When true, applies a blue accent background/border instead of the default gray */
  highlight?: boolean;
}

export function MetricCard({ label, value, subtext, highlight }: MetricCardProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center px-4 py-3 rounded-lg min-w-[140px]
        ${highlight ? 'bg-highlight border border-edge-highlight' : 'bg-card border border-edge'}
      `}
    >
      {/* Uppercase label */}
      <span className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-1">
        {label}
      </span>

      {/* Primary value — highlighted cards use blue text */}
      <span
        className={`text-xl font-bold ${
          highlight ? 'text-ink-accent' : 'text-ink'
        }`}
      >
        {value}
      </span>

      {/* Optional subtext for contextual details */}
      {subtext && (
        <span className="text-xs text-ink-muted mt-0.5">{subtext}</span>
      )}
    </div>
  );
}
