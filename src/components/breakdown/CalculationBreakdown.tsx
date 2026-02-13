/**
 * CalculationBreakdown.tsx
 *
 * Collapsible panel that provides full transparency into the ROI calculations.
 * For proposed scenarios, merges the current solution's baseline into the inputs
 * before generating formula displays.
 */

import React from 'react';
import type { ScenarioInputs, ScenarioResults, AppAction } from '../../types';
import { getFormulaDisplays } from '../../calculations/engine';
import { FormulaRow } from './FormulaRow';
import { MonthlyTable } from './MonthlyTable';

interface CalculationBreakdownProps {
  scenario: ScenarioInputs;
  currentSolution: ScenarioInputs | undefined;
  analysisPeriod: number;
  results: ScenarioResults;
  showBreakdown: boolean;
  showMonthlyTable: boolean;
  dispatch: React.Dispatch<AppAction>;
}

export function CalculationBreakdown({
  scenario,
  currentSolution,
  analysisPeriod,
  results,
  showBreakdown,
  showMonthlyTable,
  dispatch,
}: CalculationBreakdownProps) {
  // For proposed scenarios, pass the baseline's currentState separately
  const isBaseline = currentSolution && scenario.id === currentSolution.id;
  const baselineState = !isBaseline && currentSolution
    ? currentSolution.currentState
    : undefined;

  const formulas = getFormulaDisplays(scenario, analysisPeriod, baselineState, scenario.costBreakdownLocked);

  return (
    <div className="border-t border-edge">
      <button
        onClick={() => dispatch({ type: 'TOGGLE_BREAKDOWN' })}
        className="w-full flex items-center gap-2 px-6 py-4 text-sm font-semibold text-ink-secondary hover:text-ink hover:bg-hovered transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${showBreakdown ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Show the Math — {scenario.name}
      </button>

      {showBreakdown && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
            {formulas.map((f) => (
              <FormulaRow key={f.id} formula={f} />
            ))}
          </div>

          <button
            onClick={() => dispatch({ type: 'TOGGLE_MONTHLY_TABLE' })}
            className="flex items-center gap-2 mb-3 text-sm font-semibold text-ink-secondary hover:text-ink transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showMonthlyTable ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Monthly Detail Table
          </button>

          {showMonthlyTable && (
            <div className="bg-card rounded-lg p-4 border border-edge">
              <MonthlyTable
                breakdowns={results.monthlyBreakdowns}
                breakEvenMonth={results.breakEvenMonth}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
