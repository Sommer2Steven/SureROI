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
}

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
}: ChartContainerProps) {
  return (
    <div>
      {/* View tabs */}
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
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-gray-850 rounded-lg p-4 border border-gray-700/50">
        {chartView === 'cumulative' && (
          <CumulativeCostChart data={cumulativeData} results={results} />
        )}
        {chartView === 'monthly' && (
          <MonthlySavingsChart data={monthlySavingsData} results={results} />
        )}
        {chartView === 'compare' && (
          <ScenarioComparison data={compareData} results={results} />
        )}
      </div>
    </div>
  );
}
