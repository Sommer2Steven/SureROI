/**
 * App.tsx
 *
 * Root component that wires together all the pieces of SureROI.
 * One shared baseline (Current Solution) vs. proposed scenarios.
 */

import React from 'react';
import { useScenarios } from './hooks/useScenarios';
import { useCalculations } from './hooks/useCalculations';
import { useExportPDF } from './hooks/useExportPDF';
import { useSaveLoad } from './hooks/useSaveLoad';
import { usePortfolio } from './hooks/usePortfolio';
import { usePortfolioCalculations } from './hooks/usePortfolioCalculations';
import { usePortfolioSaveLoad } from './hooks/usePortfolioSaveLoad';
import { AppHeader } from './components/layout/AppHeader';
import { AppLayout } from './components/layout/AppLayout';
import { ScenarioTabs } from './components/inputs/ScenarioTabs';
import { ScenarioPanel } from './components/inputs/ScenarioPanel';
import { InputField } from './components/inputs/InputField';
import { ChartContainer } from './components/charts/ChartContainer';
import { CalculationBreakdown } from './components/breakdown/CalculationBreakdown';
import { PortfolioView } from './components/portfolio/PortfolioView';

export default function App() {
  const { state, dispatch } = useScenarios();

  // Run ROI calculations — returns [currentSolutionResult, ...proposedResults]
  const results = useCalculations(state.scenarios, state.analysisPeriod);

  const { saveProject, loadProject } = useSaveLoad({ state, dispatch });

  const { exportPDF, isExporting } = useExportPDF({
    projectTitle: state.projectTitle,
    projectDescription: state.projectDescription,
    scenarios: state.scenarios,
    results,
    analysisPeriod: state.analysisPeriod,
  });

  // Portfolio hooks
  const { portfolioState, portfolioDispatch } = usePortfolio();
  const { entryResults, aggregates, monthlySavingsTimeline, netPositionTimeline } = usePortfolioCalculations(
    portfolioState.entries,
    portfolioState.departmentAnnualSalary,
  );
  const { savePortfolio, loadPortfolio } = usePortfolioSaveLoad({
    portfolioState,
    portfolioDispatch,
  });

  const activeScenario = state.scenarios.find((s) => s.id === state.activeScenarioId);
  const activeResults = results.find((r) => r.scenarioId === state.activeScenarioId);

  const breakdownScenario = activeScenario ?? state.scenarios[0];
  const breakdownResults = activeResults ?? results[0];

  return (
    <div className={`h-screen flex flex-col bg-page text-ink ${state.darkMode ? 'dark' : ''}`}>
      <AppHeader
        projectTitle={state.projectTitle}
        projectDescription={state.projectDescription}
        sidebarCollapsed={state.sidebarCollapsed}
        darkMode={state.darkMode}
        dispatch={dispatch}
        onExportPDF={exportPDF}
        isExporting={isExporting}
        onSave={saveProject}
        onLoad={loadProject}
        appMode={state.appMode}
        portfolioName={portfolioState.portfolioName}
        portfolioDescription={portfolioState.portfolioDescription}
        portfolioDispatch={portfolioDispatch}
        onPortfolioSave={savePortfolio}
        onPortfolioLoad={loadPortfolio}
      />

      {state.appMode === 'project' ? (
        <>
          <AppLayout
            sidebarCollapsed={state.sidebarCollapsed}
            sidebar={
              <>
                <div className="px-3 pt-3 pb-1 border-b border-edge">
                  <div className="flex items-center justify-between mb-1">
                    <InputField
                      label="Analysis Period"
                      value={state.analysisPeriod}
                      onChange={(v) => dispatch({ type: 'UPDATE_ANALYSIS_PERIOD', period: v })}
                      min={6}
                      max={60}
                      step={6}
                      suffix="mo"
                    />
                    <button
                      onClick={() => {
                        if (window.confirm('Reset all inputs to defaults?')) {
                          dispatch({ type: 'RESET_PROJECT' });
                        }
                      }}
                      className="shrink-0 ml-2 px-2 py-1 text-xs text-ink-muted hover:text-ink-negative hover:bg-hovered rounded transition-colors"
                      title="Reset all inputs to defaults"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <ScenarioTabs
                  scenarios={state.scenarios}
                  activeId={state.activeScenarioId}
                  dispatch={dispatch}
                />
                <div className="px-3 py-2">
                  {activeScenario ? (
                    <ScenarioPanel
                      scenario={activeScenario}
                      dispatch={dispatch}
                    />
                  ) : null}
                </div>
              </>
            }
            main={
              <ChartContainer
                results={results}
                scenarios={state.scenarios}
                darkMode={state.darkMode}
              />
            }
            bottom={
              breakdownScenario && breakdownResults ? (
                <CalculationBreakdown
                  scenario={breakdownScenario}
                  analysisPeriod={state.analysisPeriod}
                  results={breakdownResults}
                  showBreakdown={state.showBreakdown}
                  showMonthlyTable={state.showMonthlyTable}
                  dispatch={dispatch}
                />
              ) : null
            }
          />
        </>
      ) : (
        <PortfolioView
          entries={portfolioState.entries}
          departmentAnnualSalary={portfolioState.departmentAnnualSalary}
          entryResults={entryResults}
          aggregates={aggregates}
          monthlySavingsTimeline={monthlySavingsTimeline}
          netPositionTimeline={netPositionTimeline}
          dispatch={portfolioDispatch}
          sidebarCollapsed={state.sidebarCollapsed}
          darkMode={state.darkMode}
        />
      )}
    </div>
  );
}
