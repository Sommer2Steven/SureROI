/**
 * ScenarioPanel.tsx
 *
 * The input form for a scenario.
 * - Baseline (first scenario): Current State, Current Tool Investment, Utilization
 * - Proposed (all others): Current State, New Tool Investment,
 *   Utilization + Efficiency Gains, Qualitative Flags
 *
 * Analysis Period is now global (rendered in App.tsx above the tabs).
 */

import React from 'react';
import type { ScenarioInputs, AppAction } from '../../types';
import { InputSection } from './InputSection';
import { InputField } from './InputField';
import { SliderInput } from './SliderInput';
import { CheckboxField } from './CheckboxField';
import { formatCurrency } from '../../constants/formatting';

interface ScenarioPanelProps {
  scenario: ScenarioInputs;
  isBaseline: boolean;
  dispatch: React.Dispatch<AppAction>;
}

export function ScenarioPanel({ scenario, isBaseline, dispatch }: ScenarioPanelProps) {
  const { id, currentState, investment, efficiency, qualitative } = scenario;

  const totalUpfront = investment.assemblyCost + investment.designCost + investment.controlsCost;

  return (
    <div className="space-y-0">
      {/* --- Baseline operational metrics --- */}
      <InputSection title="Current State">
        <InputField
          label="Field Workers"
          value={currentState.workers}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_CURRENT_STATE', id, updates: { workers: v } })
          }
          min={0}
          step={1}
        />
        <InputField
          label="Hourly Rate"
          value={currentState.hourlyRate}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_CURRENT_STATE', id, updates: { hourlyRate: v } })
          }
          prefix="$"
          min={0}
        />
        <InputField
          label="Hours/Week"
          value={currentState.hoursPerWeek}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_CURRENT_STATE', id, updates: { hoursPerWeek: v } })
          }
          min={0}
          max={40}
        />
        <SliderInput
          label="Error/Rework Rate"
          value={currentState.errorRate}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_CURRENT_STATE', id, updates: { errorRate: v } })
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
              id,
              updates: { monthlyOperationalCosts: v },
            })
          }
          prefix="$"
          step={500}
        />
      </InputSection>

      {/* --- Investment cost inputs --- */}
      <InputSection title={isBaseline ? 'Current Tool Investment' : 'New Tool Investment'}>
        {/* Read-only total upfront display + lock toggle */}
        <div className="flex items-center justify-between py-1.5 text-sm">
          <span className="text-ink-muted">Total Upfront</span>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-ink-secondary">{formatCurrency(totalUpfront)}</span>
            <button
              onClick={() =>
                dispatch({
                  type: 'UPDATE_SCENARIO',
                  id,
                  updates: { costBreakdownLocked: !scenario.costBreakdownLocked },
                })
              }
              className="p-1 rounded text-ink-muted hover:text-ink hover:bg-hovered transition-colors"
              title={scenario.costBreakdownLocked ? 'Unlock cost breakdown' : 'Lock cost breakdown'}
            >
              {scenario.costBreakdownLocked ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible cost breakdown — masked when locked */}
        <InputSection title="Cost Breakdown" defaultOpen={false}>
          {scenario.costBreakdownLocked ? (
            <div className="space-y-1.5 py-1">
              {['Assembly Cost', 'Design Cost', 'Controls Cost'].map((label) => (
                <div key={label} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-ink-secondary">{label}</span>
                  <span className="text-ink-muted font-medium tracking-widest">* * *</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <InputField
                label="Assembly Cost"
                value={investment.assemblyCost}
                onChange={(v) =>
                  dispatch({ type: 'UPDATE_INVESTMENT', id, updates: { assemblyCost: v } })
                }
                prefix="$"
                step={5000}
              />
              <InputField
                label="Design Cost"
                value={investment.designCost}
                onChange={(v) =>
                  dispatch({ type: 'UPDATE_INVESTMENT', id, updates: { designCost: v } })
                }
                prefix="$"
                step={5000}
              />
              <InputField
                label="Controls Cost"
                value={investment.controlsCost}
                onChange={(v) =>
                  dispatch({ type: 'UPDATE_INVESTMENT', id, updates: { controlsCost: v } })
                }
                prefix="$"
                step={5000}
              />
            </>
          )}
        </InputSection>

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
        <InputField
          label="Tool Lifespan"
          value={investment.toolLifespanMonths}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_INVESTMENT', id, updates: { toolLifespanMonths: v } })
          }
          suffix="mo"
          min={0}
          max={60}
          step={6}
        />
      </InputSection>

      {/* --- Utilization (both) + Efficiency Gains (proposed only) --- */}
      <InputSection title={isBaseline ? 'Utilization' : 'Efficiency Gains'}>
        <SliderInput
          label="Utilization"
          value={efficiency.utilizationPercent}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_EFFICIENCY', id, updates: { utilizationPercent: v } })
          }
          max={1}
          step={0.01}
        />
        {!isBaseline && (
          <>
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
          </>
        )}
      </InputSection>

      {/* --- Qualitative: proposed scenarios only --- */}
      {!isBaseline && (
        <InputSection title="Qualitative Flags">
          <CheckboxField
            label="Safety-Critical"
            checked={qualitative.safetyCritical}
            onChange={(v) =>
              dispatch({ type: 'UPDATE_QUALITATIVE', id, updates: { safetyCritical: v } })
            }
          />
          <CheckboxField
            label="Quality-Critical"
            checked={qualitative.qualityCritical}
            onChange={(v) =>
              dispatch({ type: 'UPDATE_QUALITATIVE', id, updates: { qualityCritical: v } })
            }
          />
          <CheckboxField
            label="Operations-Critical"
            checked={qualitative.operationsCritical}
            onChange={(v) =>
              dispatch({ type: 'UPDATE_QUALITATIVE', id, updates: { operationsCritical: v } })
            }
          />
        </InputSection>
      )}
    </div>
  );
}
