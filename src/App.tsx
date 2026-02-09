import React from 'react';
import { STATUS_QUO_ID } from './types';
import { useScenarios } from './hooks/useScenarios';
import { useCalculations } from './hooks/useCalculations';
import { useChartData } from './hooks/useChartData';
import { AppHeader } from './components/layout/AppHeader';
import { AppLayout } from './components/layout/AppLayout';
import { MetricsBanner } from './components/metrics/MetricsBanner';
import { ScenarioTabs } from './components/inputs/ScenarioTabs';
import { ScenarioPanel } from './components/inputs/ScenarioPanel';
import { StatusQuoPanel } from './components/inputs/StatusQuoPanel';
import { ChartContainer } from './components/charts/ChartContainer';
import { CalculationBreakdown } from './components/breakdown/CalculationBreakdown';

export default function App() {
  const { state, dispatch } = useScenarios();
  const results = useCalculations(state.currentState, state.scenarios, state.analysisPeriod);
  const { cumulativeData, monthlySavingsData, compareData } = useChartData(results);

  const isStatusQuoActive = state.activeScenarioId === STATUS_QUO_ID;
  const activeScenario = state.scenarios.find((s) => s.id === state.activeScenarioId);
  const activeResults = results.find((r) => r.scenarioId === state.activeScenarioId);

  // For breakdown, default to first scenario if Status Quo tab is active
  const breakdownScenario = activeScenario ?? state.scenarios[0];
  const breakdownResults = activeResults ?? results[0];

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      <AppHeader />
      <MetricsBanner results={results} />
      <AppLayout
        sidebar={
          <>
            <ScenarioTabs
              scenarios={state.scenarios}
              activeId={state.activeScenarioId}
              dispatch={dispatch}
            />
            <div className="px-3 py-2">
              {isStatusQuoActive ? (
                <StatusQuoPanel
                  currentState={state.currentState}
                  analysisPeriod={state.analysisPeriod}
                  dispatch={dispatch}
                />
              ) : activeScenario ? (
                <ScenarioPanel scenario={activeScenario} dispatch={dispatch} />
              ) : null}
            </div>
          </>
        }
        main={
          <ChartContainer
            chartView={state.chartView}
            dispatch={dispatch}
            results={results}
            cumulativeData={cumulativeData}
            monthlySavingsData={monthlySavingsData}
            compareData={compareData}
          />
        }
        bottom={
          breakdownScenario && breakdownResults ? (
            <CalculationBreakdown
              currentState={state.currentState}
              scenario={breakdownScenario}
              results={breakdownResults}
              showBreakdown={state.showBreakdown}
              showMonthlyTable={state.showMonthlyTable}
              dispatch={dispatch}
            />
          ) : null
        }
      />
    </div>
  );
}
