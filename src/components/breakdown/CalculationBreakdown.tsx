import React from 'react';
import type { CurrentStateInputs, ScenarioInputs, ScenarioResults, AppAction } from '../../types';
import { getFormulaDisplays } from '../../calculations/engine';
import { FormulaRow } from './FormulaRow';
import { MonthlyTable } from './MonthlyTable';

interface CalculationBreakdownProps {
  currentState: CurrentStateInputs;
  scenario: ScenarioInputs;
  results: ScenarioResults;
  showBreakdown: boolean;
  showMonthlyTable: boolean;
  dispatch: React.Dispatch<AppAction>;
}

export function CalculationBreakdown({
  currentState,
  scenario,
  results,
  showBreakdown,
  showMonthlyTable,
  dispatch,
}: CalculationBreakdownProps) {
  const formulas = getFormulaDisplays(currentState, scenario);

  return (
    <div className="border-t border-gray-700/50">
      {/* Toggle button */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_BREAKDOWN' })}
        className="w-full flex items-center gap-2 px-6 py-4 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
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
          {/* Formula cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
            {formulas.map((f) => (
              <FormulaRow key={f.id} formula={f} />
            ))}
          </div>

          {/* Monthly table toggle */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_MONTHLY_TABLE' })}
            className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
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
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
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
