/**
 * QualitativeBadges.tsx
 *
 * Renders a row of colored pills per scenario showing which
 * qualitative flags are active. Displayed under chart titles.
 */

import React from 'react';
import type { ScenarioResults } from '../../types';

const FLAG_ICONS: { key: 'safetyCritical' | 'qualityCritical' | 'operationsCritical'; icon: string; label: string }[] = [
  { key: 'safetyCritical', icon: '\u26A0', label: 'Safety' },
  { key: 'qualityCritical', icon: '\u2605', label: 'Quality' },
  { key: 'operationsCritical', icon: '\u2699', label: 'Ops' },
];

interface QualitativeBadgesProps {
  results: ScenarioResults[];
}

export function QualitativeBadges({ results }: QualitativeBadgesProps) {
  // Check if any scenario has any flag active
  const hasAnyFlag = results.some((r) =>
    FLAG_ICONS.some((f) => r.qualitative[f.key])
  );

  if (!hasAnyFlag) return null;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 mb-2">
      {results.map((r) => {
        const activeFlags = FLAG_ICONS.filter((f) => r.qualitative[f.key]);
        if (activeFlags.length === 0) return null;

        return (
          <div key={r.scenarioId} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: r.color }}
            />
            <span className="text-xs text-ink-muted mr-0.5">
              {results.length > 1 ? r.scenarioName : ''}
            </span>
            {activeFlags.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-field text-ink-secondary"
                title={`${f.label}-Critical`}
              >
                <span>{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
