/**
 * ScenarioPanel.tsx
 *
 * The input form for a scenario.
 * Two savings modes: Direct Rate and Time-Based.
 * Investment section is unchanged (per-tool costs).
 * Qualitative flags are available on all scenarios.
 */

import React from 'react';
import type { ScenarioInputs, AppAction, SavingsMode } from '../../types';
import { computeSavingsPerUnit } from '../../calculations/engine';
import { InputSection } from './InputSection';
import { InputField } from './InputField';
import { CheckboxField } from './CheckboxField';
import { formatCurrency, formatCurrencyDecimals } from '../../constants/formatting';

interface ScenarioPanelProps {
  scenario: ScenarioInputs;
  dispatch: React.Dispatch<AppAction>;
}

export function ScenarioPanel({ scenario, dispatch }: ScenarioPanelProps) {
  const { id, savings, investment, qualitative } = scenario;

  const totalUpfront = investment.assemblyCost + investment.designCost + investment.controlsCost;
  const perUnitRate = computeSavingsPerUnit(savings);

  const setMode = (mode: SavingsMode) => {
    dispatch({ type: 'UPDATE_SAVINGS', id, updates: { mode } });
  };

  return (
    <div className="space-y-0">
      {/* --- Savings section --- */}
      <InputSection title="Savings">
        {/* Mode toggle */}
        <div className="flex rounded-lg border border-edge overflow-hidden mb-2">
          <button
            onClick={() => setMode('direct')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
              savings.mode === 'direct'
                ? 'bg-blue-600 text-white'
                : 'bg-field text-ink-secondary hover:bg-hovered'
            }`}
          >
            Direct Rate
          </button>
          <button
            onClick={() => setMode('time-based')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
              savings.mode === 'time-based'
                ? 'bg-blue-600 text-white'
                : 'bg-field text-ink-secondary hover:bg-hovered'
            }`}
          >
            Time-Based
          </button>
        </div>

        {/* Common fields */}
        <InputField
          label="Unit Name"
          value={savings.unitName}
          onChange={(v) =>
            dispatch({ type: 'UPDATE_SAVINGS', id, updates: { unitName: v } })
          }
          isText
        />

        {savings.mode === 'direct' ? (
          /* Direct Rate mode */
          <>
            <InputField
              label="Savings/Unit/Mo"
              value={savings.directSavingsPerUnit}
              onChange={(v) =>
                dispatch({ type: 'UPDATE_SAVINGS', id, updates: { directSavingsPerUnit: v } })
              }
              prefix="$"
              min={0}
            />
            <InputField
              label="Add'l Savings/Unit"
              value={savings.additionalSavingsPerUnit}
              onChange={(v) =>
                dispatch({ type: 'UPDATE_SAVINGS', id, updates: { additionalSavingsPerUnit: v } })
              }
              prefix="$"
              min={0}
            />
          </>
        ) : (
          /* Time-Based mode */
          <>
            <InputField
              label="Hourly Rate"
              value={savings.hourlyRate}
              onChange={(v) =>
                dispatch({ type: 'UPDATE_SAVINGS', id, updates: { hourlyRate: v } })
              }
              prefix="$"
              min={0}
            />

            {/* Current section */}
            <div className="border-t border-edge mt-2 pt-2">
              <p className="text-xs text-ink-muted uppercase tracking-wider font-medium mb-1">Current</p>
              <InputField
                label="Crew Size"
                value={savings.currentCrewSize}
                onChange={(v) =>
                  dispatch({ type: 'UPDATE_SAVINGS', id, updates: { currentCrewSize: v } })
                }
                min={0}
                step={1}
              />
              <InputField
                label="Time/Unit"
                value={savings.currentTimePerUnit}
                onChange={(v) =>
                  dispatch({ type: 'UPDATE_SAVINGS', id, updates: { currentTimePerUnit: v } })
                }
                suffix="min"
                min={0}
              />
            </div>

            {/* Proposed section */}
            <div className="border-t border-edge mt-2 pt-2">
              <p className="text-xs text-ink-muted uppercase tracking-wider font-medium mb-1">Proposed</p>
              <InputField
                label="Crew Size"
                value={savings.proposedCrewSize}
                onChange={(v) =>
                  dispatch({ type: 'UPDATE_SAVINGS', id, updates: { proposedCrewSize: v } })
                }
                min={0}
                step={1}
              />
              <InputField
                label="Time/Unit"
                value={savings.proposedTimePerUnit}
                onChange={(v) =>
                  dispatch({ type: 'UPDATE_SAVINGS', id, updates: { proposedTimePerUnit: v } })
                }
                suffix="min"
                min={0}
              />
            </div>

            {/* Derived read-only values */}
            <div className="border-t border-edge mt-2 pt-2">
              <p className="text-xs text-ink-muted uppercase tracking-wider font-medium mb-1">Derived</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between py-1">
                  <span className="text-ink-secondary">Savings/{savings.unitName}</span>
                  <span className="font-semibold text-ink-positive">
                    {formatCurrencyDecimals(perUnitRate)}/{savings.unitName}
                  </span>
                </div>
                {savings.currentTimePerUnit > 0 && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-ink-secondary">Time Savings</span>
                    <span className="font-semibold text-ink">
                      {Math.max(0, Math.round((1 - savings.proposedTimePerUnit / savings.currentTimePerUnit) * 100))}%
                    </span>
                  </div>
                )}
                {savings.currentCrewSize > savings.proposedCrewSize && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-ink-secondary">Crew Reduction</span>
                    <span className="font-semibold text-ink">
                      {savings.currentCrewSize - savings.proposedCrewSize} worker(s)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <InputField
              label="Add'l Savings/Unit"
              value={savings.additionalSavingsPerUnit}
              onChange={(v) =>
                dispatch({ type: 'UPDATE_SAVINGS', id, updates: { additionalSavingsPerUnit: v } })
              }
              prefix="$"
              min={0}
            />
          </>
        )}

      </InputSection>

      {/* --- Investment cost inputs --- */}
      <InputSection title="Investment">
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

        {/* Collapsible cost breakdown */}
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

      {/* --- Qualitative flags --- */}
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
    </div>
  );
}
