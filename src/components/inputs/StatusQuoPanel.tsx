import React from 'react';
import type { CurrentStateInputs, AppAction } from '../../types';
import { InputSection } from './InputSection';
import { InputField } from './InputField';
import { SliderInput } from './SliderInput';

interface StatusQuoPanelProps {
  currentState: CurrentStateInputs;
  analysisPeriod: number;
  dispatch: React.Dispatch<AppAction>;
}

export function StatusQuoPanel({ currentState, analysisPeriod, dispatch }: StatusQuoPanelProps) {
  return (
    <div className="space-y-0">
      <InputSection title="Current State">
        <InputField
          label="Field Workers"
          value={currentState.workers}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_CURRENT_STATE', updates: { workers: v } })
          }
          min={1}
          step={1}
        />
        <InputField
          label="Hourly Rate"
          value={currentState.hourlyRate}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_CURRENT_STATE', updates: { hourlyRate: v } })
          }
          prefix="$"
          min={1}
        />
        <InputField
          label="Hours/Week"
          value={currentState.hoursPerWeek}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_CURRENT_STATE', updates: { hoursPerWeek: v } })
          }
          min={1}
          max={40}
        />
        <SliderInput
          label="Error/Rework Rate"
          value={currentState.errorRate}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_CURRENT_STATE', updates: { errorRate: v } })
          }
          max={0.5}
          step={0.01}
        />
        <InputField
          label="Monthly Ops Costs"
          value={currentState.monthlyOperationalCosts}
          onChange={(v) =>
            dispatch({
              type: 'UPDATE_CURRENT_STATE',
              updates: { monthlyOperationalCosts: v },
            })
          }
          prefix="$"
          step={500}
        />
      </InputSection>

      <InputSection title="Analysis Period">
        <InputField
          label="Months"
          value={analysisPeriod}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_ANALYSIS_PERIOD', period: Math.max(6, v) })
          }
          min={6}
          max={60}
          step={6}
        />
      </InputSection>

      <div className="px-1 pt-3">
        <p className="text-xs text-gray-500 leading-relaxed">
          These values define the shared baseline across all scenarios. Changing them updates every scenario's comparison.
        </p>
      </div>
    </div>
  );
}
