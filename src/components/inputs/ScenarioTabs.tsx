/**
 * ScenarioTabs.tsx
 *
 * Horizontal tab bar for switching between scenarios.
 * Each scenario gets its own color dot.
 * Double-click a tab name to rename; Enter or blur saves.
 */

import React, { useState, useRef, useEffect } from 'react';
import type { ScenarioInputs, AppAction } from '../../types';
import { MAX_SCENARIOS } from '../../constants/defaults';

interface ScenarioTabsProps {
  scenarios: ScenarioInputs[];
  activeId: string;
  dispatch: React.Dispatch<AppAction>;
}

export function ScenarioTabs({ scenarios, activeId, dispatch }: ScenarioTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  function startRename(scenario: ScenarioInputs) {
    setEditingId(scenario.id);
    setEditValue(scenario.name);
  }

  function commitRename() {
    if (editingId && editValue.trim()) {
      dispatch({ type: 'RENAME_SCENARIO', id: editingId, name: editValue.trim() });
    }
    setEditingId(null);
  }

  return (
    <div className="flex items-center gap-1 px-2 pt-3 pb-2 border-b border-edge flex-wrap">
      {scenarios.map((s) => {
        const dotColor = s.color;
        return (
          <div
            key={s.id}
            role="tab"
            tabIndex={0}
            onClick={() => dispatch({ type: 'SET_ACTIVE', id: s.id })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dispatch({ type: 'SET_ACTIVE', id: s.id });
              }
            }}
            className={`
              relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer
              ${
                s.id === activeId
                  ? 'bg-selected text-ink'
                  : 'text-ink-muted hover:text-ink hover:bg-hovered'
              }
            `}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: dotColor }}
            />
            {editingId === s.id ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-field text-ink text-sm px-1 py-0 rounded w-24 outline-none"
              />
            ) : (
              <span
                className="truncate max-w-[120px]"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startRename(s);
                }}
                title="Double-click to rename"
              >
                {s.name}
              </span>
            )}
            {scenarios.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'REMOVE_SCENARIO', id: s.id });
                }}
                className="ml-1 text-ink-muted hover:text-ink-negative transition-colors"
                title="Remove scenario"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        );
      })}

      {scenarios.length < MAX_SCENARIOS && (
        <button
          onClick={() => dispatch({ type: 'ADD_SCENARIO' })}
          className="flex items-center gap-1 px-2 py-1.5 text-sm text-ink-muted hover:text-ink hover:bg-hovered rounded-md transition-colors"
          title="Add scenario"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add</span>
        </button>
      )}

      {/* Duplicate button — available for any active scenario */}
      {scenarios.length < MAX_SCENARIOS && (
        <button
          onClick={() => dispatch({ type: 'DUPLICATE_SCENARIO', id: activeId })}
          className="flex items-center gap-1 px-2 py-1.5 text-sm text-ink-muted hover:text-ink hover:bg-hovered rounded-md transition-colors"
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
