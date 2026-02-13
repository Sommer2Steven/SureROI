/**
 * PortfolioEntryRow.tsx
 *
 * Compact card for a single portfolio entry.
 * Shows project/scenario info, editable start/end months, hours, and computed values.
 */

import React from 'react';
import type { PortfolioAction } from '../../types';
import type { PortfolioEntryResult } from '../../hooks/usePortfolioCalculations';
import { InputField } from '../inputs/InputField';
import { CheckboxField } from '../inputs/CheckboxField';
import { formatCurrencyK } from '../../constants/formatting';
import { formatMonthLabel, monthsBetween } from '../../utils/calendarUtils';

interface PortfolioEntryRowProps {
  entryResult: PortfolioEntryResult;
  color: string;
  dispatch: React.Dispatch<PortfolioAction>;
}

export function PortfolioEntryRow({ entryResult, color, dispatch }: PortfolioEntryRowProps) {
  const { entry, results, durationMonths, scaleFactor, scaledTotalValue } = entryResult;

  const duration = monthsBetween(entry.startMonth, entry.endMonth);

  return (
    <div className="bg-card border border-edge rounded-lg px-4 py-3">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium text-ink truncate">
            {entry.projectName}
          </span>
          <span className="text-xs text-ink-muted">&middot;</span>
          <span className="text-xs text-ink-secondary truncate">
            {entry.scenarioName}
          </span>
        </div>
        <button
          onClick={() => dispatch({ type: 'REMOVE_ENTRY', id: entry.id })}
          className="p-1 rounded-md text-ink-muted hover:text-ink-negative hover:bg-hovered transition-colors shrink-0"
          title="Remove entry"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Date range + source info */}
      <p className="text-xs text-ink-muted mb-2 truncate">
        {formatMonthLabel(entry.startMonth)} &ndash; {formatMonthLabel(entry.endMonth)} ({duration} mo)
        {' '}&middot; Source: {entry.sourceFileName}
        {scaleFactor > 0 && (
          <> &middot; Scale: {(scaleFactor * 100).toFixed(1)}%</>
        )}
      </p>

      {/* Controls — 2-column grid */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-ink-secondary mb-1">Start Month</label>
          <input
            type="month"
            value={entry.startMonth}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_ENTRY', id: entry.id, updates: { startMonth: e.target.value } })
            }
            className="w-full px-2 py-1 rounded-md border border-edge bg-field text-sm text-ink focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-secondary mb-1">End Month</label>
          <input
            type="month"
            value={entry.endMonth}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_ENTRY', id: entry.id, updates: { endMonth: e.target.value } })
            }
            className="w-full px-2 py-1 rounded-md border border-edge bg-field text-sm text-ink focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <InputField
            label="Est. Hours"
            value={entry.estimatedHours}
            onChange={(v) =>
              dispatch({ type: 'UPDATE_ENTRY', id: entry.id, updates: { estimatedHours: v } })
            }
            suffix="hrs"
          />
        </div>
        <CheckboxField
          label="Exclude Design & Controls"
          checked={entry.excludeDesignControls}
          onChange={(checked) =>
            dispatch({ type: 'UPDATE_ENTRY', id: entry.id, updates: { excludeDesignControls: checked } })
          }
        />
      </div>

      {/* Computed values */}
      <div className="flex items-center gap-4 mt-2 text-xs">
        <span className="text-ink-muted">
          Scaled Value: <span className={`font-medium ${scaledTotalValue > 0 ? 'text-ink-positive' : 'text-ink-negative'}`}>
            {formatCurrencyK(scaledTotalValue)}
          </span>
        </span>
        <span className="text-ink-muted">
          Base Value: <span className="text-ink font-medium">{formatCurrencyK(results.threeYearNetSavings)}</span>
        </span>
        <span className="text-ink-muted">
          ROI: <span className="text-ink font-medium">{results.year1ROI.toFixed(0)}%</span>
        </span>
      </div>
    </div>
  );
}
