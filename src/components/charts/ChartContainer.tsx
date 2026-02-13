/**
 * ChartContainer.tsx
 *
 * Top-level wrapper for the chart section of the SureROI dashboard.
 * Renders a row of tab buttons (Cumulative / Monthly / Compare) and
 * conditionally mounts the corresponding chart component based on the
 * currently selected `chartView`. State changes are dispatched through
 * the app-level reducer via the `dispatch` prop.
 */

import React from 'react';
import type { ChartView, ScenarioResults, AppAction } from '../../types';
import type { CumulativeDataPoint, MonthlySavingsDataPoint, CompareDataPoint } from '../../hooks/useChartData';
import { CumulativeCostChart } from './CumulativeCostChart';
import { MonthlySavingsChart } from './MonthlySavingsChart';
import { ScenarioComparison } from './ScenarioComparison';

interface ChartContainerProps {
  chartView: ChartView;
  dispatch: React.Dispatch<AppAction>;
  results: ScenarioResults[];
  cumulativeData: CumulativeDataPoint[];
  monthlySavingsData: MonthlySavingsDataPoint[];
  compareData: CompareDataPoint[];
  darkMode: boolean;
}

/** Static tab definitions that drive the tab bar rendering below. */
const VIEW_TABS: { key: ChartView; label: string }[] = [
  { key: 'cumulative', label: 'Cumulative' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'compare', label: 'Compare' },
];

export function ChartContainer({
  chartView,
  dispatch,
  results,
  cumulativeData,
  monthlySavingsData,
  compareData,
  darkMode,
}: ChartContainerProps) {
  return (
    <div>
      {/* Tab bar: switches between the three chart views */}
      <div className="flex items-center gap-1 mb-4">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => dispatch({ type: 'SET_CHART_VIEW', view: tab.key })}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${
                chartView === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-card text-ink-muted hover:text-ink-secondary hover:bg-hovered'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active chart panel: only the selected view is mounted at a time */}
      <div className="bg-card rounded-lg p-4 border border-edge">
        {chartView === 'cumulative' && (
          <CumulativeCostChart data={cumulativeData} results={results} darkMode={darkMode} />
        )}
        {chartView === 'monthly' && (
          <MonthlySavingsChart data={monthlySavingsData} results={results} darkMode={darkMode} />
        )}
        {chartView === 'compare' && (
          <ScenarioComparison data={compareData} results={results} darkMode={darkMode} />
        )}
      </div>
    </div>
  );
}
