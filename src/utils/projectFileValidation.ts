/**
 * utils/projectFileValidation.ts
 *
 * Shared validation functions for project file JSON schema.
 * Supports v1 (old hour-based model) and v2 (new rate-based model).
 * v1 files are automatically migrated to v2 on load.
 */

import type { ScenarioInputs, ProjectFile, SavingsInputs } from '../types';
import { DEFAULT_SAVINGS } from '../constants/defaults';

// ── V1 types (for migration only) ──────────────────────────────────────

interface V1CurrentStateInputs {
  workers: number;
  hourlyRate: number;
  hoursPerWeek: number;
  errorRate: number;
  monthlyOperationalCosts: number;
}

interface V1EfficiencyInputs {
  timeSavings: number;
  errorReduction: number;
  utilizationPercent: number;
  adoptionRampMonths: number;
  additionalMonthlyRevenue: number;
}

interface V1ScenarioInputs {
  id: string;
  name: string;
  color: string;
  currentState: V1CurrentStateInputs;
  investment: {
    assemblyCost: number;
    designCost: number;
    controlsCost: number;
    monthlyRecurringCost: number;
    trainingCost: number;
    deploymentCost: number;
    toolLifespanMonths: number;
  };
  efficiency: V1EfficiencyInputs;
  qualitative: {
    safetyCritical: boolean;
    qualityCritical: boolean;
    operationsCritical: boolean;
  };
  costBreakdownLocked?: boolean;
}

// ── V1 → V2 migration ─────────────────────────────────────────────────

function migrateV1Scenario(old: V1ScenarioInputs): ScenarioInputs {
  const cs = old.currentState;
  const eff = old.efficiency;

  // Derive time-based savings inputs from the old hour-based model
  const savings: SavingsInputs = {
    mode: 'time-based',
    unitName: 'hour-block',
    referenceUnits: cs.workers,
    directSavingsPerUnit: 0,
    currentCrewSize: cs.workers,
    proposedCrewSize: cs.workers,
    currentTimePerUnit: (cs.hoursPerWeek / 5) * 60, // daily hours → minutes
    proposedTimePerUnit: (cs.hoursPerWeek / 5) * 60 * (1 - eff.timeSavings),
    hourlyRate: cs.hourlyRate,
    additionalSavingsPerUnit: cs.workers > 0
      ? eff.additionalMonthlyRevenue / cs.workers
      : 0,
    utilizationPercent: eff.utilizationPercent,
    adoptionRampMonths: eff.adoptionRampMonths,
  };

  return {
    id: old.id,
    name: old.name,
    color: old.color,
    savings,
    investment: old.investment,
    qualitative: old.qualitative,
    costBreakdownLocked: old.costBreakdownLocked ?? false,
  };
}

function migrateV1Project(data: Record<string, unknown>): ProjectFile {
  const scenarios = (data.scenarios as V1ScenarioInputs[]).map(migrateV1Scenario);
  return {
    version: 2,
    projectTitle: data.projectTitle as string,
    projectDescription: data.projectDescription as string,
    analysisPeriod: data.analysisPeriod as number,
    darkMode: data.darkMode as boolean,
    scenarios,
  };
}

// ── V2 validation ──────────────────────────────────────────────────────

/** Validate a v2 scenario has the required shape */
function isValidV2Scenario(s: unknown): s is ScenarioInputs {
  if (typeof s !== 'object' || s === null) return false;
  const obj = s as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.color === 'string' &&
    typeof obj.savings === 'object' && obj.savings !== null &&
    typeof obj.investment === 'object' && obj.investment !== null &&
    typeof obj.qualitative === 'object' && obj.qualitative !== null
  );
}

/** Validate a v1 scenario (for migration) */
function isValidV1Scenario(s: unknown): boolean {
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

/** Re-export for portfolio save/load */
export function isValidScenario(s: unknown): s is ScenarioInputs {
  return isValidV2Scenario(s);
}

/** Validates that parsed JSON matches the ProjectFile schema (v1 or v2) */
export function isValidProjectFile(data: unknown): data is ProjectFile {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.projectTitle !== 'string') return false;
  if (typeof obj.projectDescription !== 'string') return false;
  if (typeof obj.analysisPeriod !== 'number') return false;
  if (typeof obj.darkMode !== 'boolean') return false;
  if (!Array.isArray(obj.scenarios) || obj.scenarios.length === 0) return false;

  if (obj.version === 2) {
    return obj.scenarios.every(isValidV2Scenario);
  }

  if (obj.version === 1) {
    return obj.scenarios.every(isValidV1Scenario);
  }

  return false;
}

/**
 * Load and migrate a project file. Returns a v2 ProjectFile.
 * Must be called after isValidProjectFile returns true.
 */
export function loadAndMigrateProject(data: unknown): ProjectFile {
  const obj = data as Record<string, unknown>;

  if (obj.version === 1) {
    return migrateV1Project(obj);
  }

  // v2 — backfill costBreakdownLocked
  const parsed = data as ProjectFile;
  const scenarios = parsed.scenarios.map((s) => ({
    ...s,
    costBreakdownLocked: s.costBreakdownLocked ?? false,
    savings: { ...DEFAULT_SAVINGS, ...s.savings },
  }));

  return { ...parsed, version: 2, scenarios };
}
