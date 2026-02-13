/**
 * PortfolioView.tsx
 *
 * Main container for portfolio mode. Uses AppLayout shell with:
 * - Sidebar: department salary input + "Add Project Entry" button + entry list
 * - Main: PortfolioChart on top, scrollable entry cards below
 */

import React, { useState, useCallback } from 'react';
import type { PortfolioAction, PortfolioEntry, PortfolioChartView } from '../../types';
import type { PortfolioEntryResult, PortfolioAggregates, PortfolioTimelinePoint } from '../../hooks/usePortfolioCalculations';
import { SCENARIO_COLORS } from '../../constants/defaults';
import { AppLayout } from '../layout/AppLayout';
import { InputField } from '../inputs/InputField';
import { PortfolioMetrics } from './PortfolioMetrics';
import { PortfolioChart } from './PortfolioChart';
import { PortfolioEntryRow } from './PortfolioEntryRow';
import { ScenarioPickerModal } from './ScenarioPickerModal';
import { PortfolioBreakdown } from './PortfolioBreakdown';

interface PortfolioViewProps {
  entries: PortfolioEntry[];
  departmentAnnualSalary: number;
  entryResults: PortfolioEntryResult[];
  aggregates: PortfolioAggregates;
  monthlySavingsTimeline: PortfolioTimelinePoint[];
  netPositionTimeline: PortfolioTimelinePoint[];
  dispatch: React.Dispatch<PortfolioAction>;
  sidebarCollapsed: boolean;
  darkMode: boolean;
}

export function PortfolioView({
  entries,
  departmentAnnualSalary,
  entryResults,
  aggregates,
  monthlySavingsTimeline,
  netPositionTimeline,
  dispatch,
  sidebarCollapsed,
  darkMode,
}: PortfolioViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [chartView, setChartView] = useState<PortfolioChartView>('monthly-savings');

  const handleAddEntry = useCallback((entry: PortfolioEntry) => {
    dispatch({ type: 'ADD_ENTRY', entry });
  }, [dispatch]);

  return (
    <>
      <PortfolioMetrics aggregates={aggregates} entryCount={entries.length} />

      <AppLayout
        sidebarCollapsed={sidebarCollapsed}
        sidebar={
          <div className="px-3 py-3">
            <InputField
              label="Dept. Annual Salary"
              value={departmentAnnualSalary}
              onChange={(v) => dispatch({ type: 'SET_DEPARTMENT_SALARY', salary: v })}
              prefix="$"
            />

            <div className="mt-4">
              <button
                onClick={() => setModalOpen(true)}
                className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                + Add Project Entry
              </button>
            </div>

            <p className="text-xs text-ink-muted mt-3 text-center">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        }
        main={
          <div className="space-y-6">
            <PortfolioChart
              entryResults={entryResults}
              monthlySavingsTimeline={monthlySavingsTimeline}
              netPositionTimeline={netPositionTimeline}
              departmentAnnualSalary={departmentAnnualSalary}
              darkMode={darkMode}
              chartView={chartView}
              onChartViewChange={setChartView}
            />

            {entryResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-ink-secondary px-1">
                  Project Entries
                </h3>
                {entryResults.map((er, idx) => (
                  <PortfolioEntryRow
                    key={er.entry.id}
                    entryResult={er}
                    color={SCENARIO_COLORS[idx % SCENARIO_COLORS.length]}
                    dispatch={dispatch}
                  />
                ))}
              </div>
            )}
          </div>
        }
        bottom={
          <PortfolioBreakdown
            entryResults={entryResults}
            aggregates={aggregates}
            departmentAnnualSalary={departmentAnnualSalary}
          />
        }
      />

      <ScenarioPickerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleAddEntry}
      />
    </>
  );
}
