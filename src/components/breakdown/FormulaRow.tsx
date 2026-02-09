import React from 'react';
import type { FormulaDisplay } from '../../types';

interface FormulaRowProps {
  formula: FormulaDisplay;
}

export function FormulaRow({ formula }: FormulaRowProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700/50">
      <h4 className="text-sm font-semibold text-gray-200 mb-2">{formula.label}</h4>
      <div className="space-y-1.5">
        <div className="text-xs text-gray-400 font-mono">
          {formula.formula}
        </div>
        <div className="text-sm text-blue-300 font-mono">
          = {formula.substituted}
        </div>
        <div className="text-lg font-bold text-white">
          = {formula.result}
        </div>
      </div>
    </div>
  );
}
