/**
 * FormulaRow.tsx
 *
 * Renders a single formula card within the calculation breakdown section.
 * Displays a formula in three layers: the symbolic formula, the substituted
 * values, and the computed result — giving users full transparency into
 * how each ROI metric is derived.
 */

import React from 'react';
import type { FormulaDisplay } from '../../types';

interface FormulaRowProps {
  formula: FormulaDisplay;
}

export function FormulaRow({ formula }: FormulaRowProps) {
  return (
    <div className="bg-card rounded-lg p-4 border border-edge">
      {/* Formula label, e.g. "Monthly Savings" or "Break-Even Month" */}
      <h4 className="text-sm font-semibold text-ink-secondary mb-2">{formula.label}</h4>

      <div className="space-y-1.5">
        {/* Symbolic formula template, e.g. "savings = (old - new) * workers" */}
        <div className="text-xs text-ink-muted font-mono">
          {formula.formula}
        </div>

        {/* Formula with actual values substituted in */}
        <div className="text-sm text-ink-accent font-mono">
          = {formula.substituted}
        </div>

        {/* Final computed result displayed prominently */}
        <div className="text-lg font-bold text-ink">
          = {formula.result}
        </div>
      </div>
    </div>
  );
}
