import React from 'react';
import type { ScenarioInputs, AppAction } from '../../types';
import { InputSection } from './InputSection';
import { InputField } from './InputField';
import { SliderInput } from './SliderInput';

interface ScenarioPanelProps {
  scenario: ScenarioInputs;
  dispatch: React.Dispatch<AppAction>;
}

export function ScenarioPanel({ scenario, dispatch }: ScenarioPanelProps) {
  const { id, investment, efficiency } = scenario;

  return (
    <div className="space-y-0">
      <InputSection title="New Tool Investment">
        <InputField
          label="Upfront Cost"
          value={investment.upfrontCost}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_INVESTMENT', id, updates: { upfrontCost: v } })
          }
          prefix="$"
          step={5000}
        />
        <InputField
          label="Monthly Recurring"
          value={investment.monthlyRecurringCost}
          onChange={(v) =>
            dispatch({
              type: 'UPDATE_INVESTMENT',
              id,
              updates: { monthlyRecurringCost: v },
            })
          }
          prefix="$"
          step={500}
        />
        <InputField
          label="Training Cost"
          value={investment.trainingCost}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_INVESTMENT', id, updates: { trainingCost: v } })
          }
          prefix="$"
          step={5000}
        />
        <InputField
          label="Deployment Cost"
          value={investment.deploymentCost}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_INVESTMENT', id, updates: { deploymentCost: v } })
          }
          prefix="$"
          step={5000}
        />
      </InputSection>

      <InputSection title="Efficiency Gains">
        <SliderInput
          label="Time Savings"
          value={efficiency.timeSavings}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_EFFICIENCY', id, updates: { timeSavings: v } })
          }
          max={0.8}
          step={0.01}
        />
        <SliderInput
          label="Error Reduction"
          value={efficiency.errorReduction}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_EFFICIENCY', id, updates: { errorReduction: v } })
          }
          max={1}
          step={0.01}
        />
        <InputField
          label="Adoption Ramp"
          value={efficiency.adoptionRampMonths}
          onChange={(v) =>
            dispatch({
              type: 'UPDATE_EFFICIENCY',
              id,
              updates: { adoptionRampMonths: v },
            })
          }
          suffix="mo"
          min={1}
          max={24}
          step={1}
        />
        <InputField
          label="Add'l Revenue/mo"
          value={efficiency.additionalMonthlyRevenue}
          onChange={(v) =>
            dispatch({
              type: 'UPDATE_EFFICIENCY',
              id,
              updates: { additionalMonthlyRevenue: v },
            })
          }
          prefix="$"
          step={1000}
        />
      </InputSection>
    </div>
  );
}
