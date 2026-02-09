import React from 'react';
import type { ScenarioInputs, AppAction } from '../../types';
import { STATUS_QUO_ID } from '../../types';
import { MAX_SCENARIOS } from '../../constants/defaults';

interface ScenarioTabsProps {
  scenarios: ScenarioInputs[];
  activeId: string;
  dispatch: React.Dispatch<AppAction>;
}

export function ScenarioTabs({ scenarios, activeId, dispatch }: ScenarioTabsProps) {
  const isStatusQuoActive = activeId === STATUS_QUO_ID;

  return (
    <div className="flex items-center gap-1 px-2 pt-3 pb-2 border-b border-gray-700 flex-wrap">
      {/* Permanent Status Quo tab */}
      <button
        onClick={() => dispatch({ type: 'SET_ACTIVE', id: STATUS_QUO_ID })}
        className={`
          relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
          ${
            isStatusQuoActive
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }
        `}
      >
        <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-red-600" />
        <span>Status Quo</span>
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-700 mx-1" />

      {/* Scenario tabs */}
      {scenarios.map((s) => (
        <button
          key={s.id}
          onClick={() => dispatch({ type: 'SET_ACTIVE', id: s.id })}
          className={`
            relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${
              s.id === activeId
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }
          `}
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: s.color }}
          />
          <span className="truncate max-w-[80px]">{s.name}</span>
          {scenarios.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'REMOVE_SCENARIO', id: s.id });
              }}
              className="ml-1 text-gray-500 hover:text-red-400 transition-colors"
              title="Remove scenario"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </button>
      ))}

      {/* Add / Duplicate buttons */}
      {scenarios.length < MAX_SCENARIOS && (
        <button
          onClick={() => dispatch({ type: 'ADD_SCENARIO' })}
          className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          title="Add scenario"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add</span>
        </button>
      )}
      {scenarios.length > 0 && !isStatusQuoActive && (
        <button
          onClick={() =>
            dispatch({ type: 'DUPLICATE_SCENARIO', id: activeId })
          }
          className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          title="Duplicate active scenario"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      )}
    </div>
  );
}
