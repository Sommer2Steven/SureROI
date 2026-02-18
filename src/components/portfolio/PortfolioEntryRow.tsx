/**
 * PortfolioEntryRow.tsx
 *
 * Compact card for a single portfolio entry.
 * Shows project/scenario info, editable fields, and computed values.
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
  const { entry, results, scaleFactor, scaledTotalValue, hasOvertime, overtimePremium } = entryResult;

  const duration = monthsBetween(entry.startMonth, entry.endMonth);
  const unitName = entry.scenario.savings.unitName;

  return (
    <div className={`bg-card border border-edge rounded-lg px-4 py-3 transition-opacity ${entry.hidden ? 'opacity-40' : ''}`}>
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
          {entry.scenario.savings.mode === 'time-based' && (
            <span className="text-xs text-ink-muted px-1.5 py-0.5 rounded bg-field">Time</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => dispatch({ type: 'UPDATE_ENTRY', id: entry.id, updates: { hidden: !entry.hidden } })}
            className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-hovered transition-colors"
            title={entry.hidden ? 'Show in chart' : 'Hide from chart'}
          >
            {entry.hidden ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => dispatch({ type: 'REMOVE_ENTRY', id: entry.id })}
            className="p-1 rounded-md text-ink-muted hover:text-ink-negative hover:bg-hovered transition-colors"
            title="Remove entry"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Date range + source info */}
      <p className="text-xs text-ink-muted mb-2 truncate">
        {formatMonthLabel(entry.startMonth)} &ndash; {formatMonthLabel(entry.endMonth)} ({duration} mo)
        {' '}&middot; Source: {entry.sourceFileName}
        {scaleFactor > 0 && (
          <> &middot; Scale: {(scaleFactor * 100).toFixed(1)}%</>
        )}
        {hasOvertime && (
          <> &middot; <span className="text-amber-400">OT: {((overtimePremium - 1) * 100).toFixed(0)}% premium</span></>
        )}
      </p>

      {/* Controls — grid */}
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
            label={`${unitName}s`}
            value={entry.actualUnits}
            onChange={(v) =>
              dispatch({ type: 'UPDATE_ENTRY', id: entry.id, updates: { actualUnits: v } })
            }
          />
        </div>
        <div>
          <InputField
            label="Tools"
            value={entry.toolCount}
            onChange={(v) =>
              dispatch({ type: 'UPDATE_ENTRY', id: entry.id, updates: { toolCount: Math.max(1, v) } })
            }
            min={1}
            step={1}
          />
        </div>
        <CheckboxField
          label="Excl. Design & Controls"
          checked={entry.excludeDesignControls}
          onChange={(checked) =>
            dispatch({ type: 'UPDATE_ENTRY', id: entry.id, updates: { excludeDesignControls: checked } })
          }
        />
        <CheckboxField
          label="Excl. Training"
          checked={entry.excludeTraining}
          onChange={(checked) =>
            dispatch({ type: 'UPDATE_ENTRY', id: entry.id, updates: { excludeTraining: checked } })
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
