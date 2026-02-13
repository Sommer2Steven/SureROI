/**
 * utils/projectFileValidation.ts
 *
 * Shared validation functions for project file JSON schema.
 * Used by useSaveLoad (project mode) and ScenarioPickerModal (portfolio mode).
 */

import type { ScenarioInputs, ProjectFile } from '../types';

/** Minimal validation that a scenario has the required shape */
export function isValidScenario(s: unknown): s is ScenarioInputs {
  if (typeof s !== 'object' || s === null) return false;
  const obj = s as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.color === 'string' &&
    typeof obj.currentState === 'object' && obj.currentState !== null &&
    typeof obj.investment === 'object' && obj.investment !== null &&
    typeof obj.efficiency === 'object' && obj.efficiency !== null &&
    typeof obj.qualitative === 'object' && obj.qualitative !== null
  );
}

/** Validates that parsed JSON matches the ProjectFile schema */
export function isValidProjectFile(data: unknown): data is ProjectFile {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;

  if (obj.version !== 1) return false;
  if (typeof obj.projectTitle !== 'string') return false;
  if (typeof obj.projectDescription !== 'string') return false;
  if (typeof obj.analysisPeriod !== 'number') return false;
  if (typeof obj.darkMode !== 'boolean') return false;
  if (!Array.isArray(obj.scenarios) || obj.scenarios.length === 0) return false;

  return obj.scenarios.every(isValidScenario);
}
