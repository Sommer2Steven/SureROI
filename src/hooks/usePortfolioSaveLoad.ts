/**
 * hooks/usePortfolioSaveLoad.ts
 *
 * Save/load portfolio state to/from JSON files.
 * Handles backward compatibility with v1 portfolio entries
 * (estimatedHours → actualUnits, baselineCurrentState → baselineSavings).
 */

import { useCallback } from 'react';
import type { PortfolioState, PortfolioAction, PortfolioFile, SavingsInputs } from '../types';
import { isValidScenario } from '../utils/projectFileValidation';
import { DEFAULT_SAVINGS } from '../constants/defaults';
import { currentMonthKey, addMonths } from '../utils/calendarUtils';

const MONTH_KEY_RE = /^\d{4}-\d{2}$/;

interface UsePortfolioSaveLoadParams {
  portfolioState: PortfolioState;
  portfolioDispatch: React.Dispatch<PortfolioAction>;
}

function isValidPortfolioEntry(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) return false;
  const obj = e as Record<string, unknown>;

  // Required fields
  if (typeof obj.id !== 'string') return false;
  if (typeof obj.projectName !== 'string') return false;
  if (typeof obj.scenarioName !== 'string') return false;
  if (typeof obj.analysisPeriod !== 'number') return false;
  if (typeof obj.sourceFileName !== 'string') return false;
  if (!isValidScenario(obj.scenario)) return false;

  // v2 fields (optional for backcompat — will be migrated)
  // actualUnits, toolCount, excludeDesignControls, excludeTraining, baselineSavings

  // Start/end month validation
  if (obj.startMonth !== undefined && (typeof obj.startMonth !== 'string' || !MONTH_KEY_RE.test(obj.startMonth))) return false;
  if (obj.endMonth !== undefined && (typeof obj.endMonth !== 'string' || !MONTH_KEY_RE.test(obj.endMonth))) return false;

  return true;
}

/** Migrate old v1 entries to v2 format. */
function migrateEntry(entry: Record<string, unknown>): void {
  // Backfill startMonth/endMonth
  if (!entry.startMonth || typeof entry.startMonth !== 'string') {
    entry.startMonth = currentMonthKey();
  }
  if (!entry.endMonth || typeof entry.endMonth !== 'string') {
    const period = typeof entry.analysisPeriod === 'number' ? entry.analysisPeriod : 36;
    entry.endMonth = addMonths(entry.startMonth as string, Math.max(0, period - 1));
  }

  // Migrate estimatedHours → actualUnits + toolCount
  if (typeof entry.estimatedHours === 'number' && entry.actualUnits === undefined) {
    entry.actualUnits = entry.estimatedHours;
    entry.toolCount = 1;
    delete entry.estimatedHours;
  }

  // Default actualUnits and toolCount
  if (typeof entry.actualUnits !== 'number') entry.actualUnits = 0;
  if (typeof entry.toolCount !== 'number') entry.toolCount = 1;

  // Default excludeDesignControls and excludeTraining
  if (typeof entry.excludeDesignControls !== 'boolean') entry.excludeDesignControls = false;
  if (typeof entry.excludeTraining !== 'boolean') entry.excludeTraining = false;

  // Migrate baselineCurrentState → baselineSavings
  if (entry.baselineCurrentState !== undefined && entry.baselineSavings === undefined) {
    const baseline = entry.baselineCurrentState as Record<string, unknown>;
    // Convert old baseline to savings format
    const savings: SavingsInputs = {
      ...DEFAULT_SAVINGS,
      mode: 'time-based',
      unitName: 'hour-block',
      referenceUnits: (baseline.workers as number) || 0,
      currentCrewSize: (baseline.workers as number) || 0,
      proposedCrewSize: (baseline.workers as number) || 0,
      currentTimePerUnit: ((baseline.hoursPerWeek as number) || 0) / 5 * 60,
      proposedTimePerUnit: ((baseline.hoursPerWeek as number) || 0) / 5 * 60,
      hourlyRate: (baseline.hourlyRate as number) || 0,
    };
    entry.baselineSavings = savings;
    delete entry.baselineCurrentState;
  }

  // Default baselineSavings from scenario
  if (!entry.baselineSavings && entry.scenario) {
    const scenario = entry.scenario as Record<string, unknown>;
    if (scenario.savings) {
      entry.baselineSavings = scenario.savings;
    } else {
      entry.baselineSavings = { ...DEFAULT_SAVINGS };
    }
  }
}

function isValidPortfolioFile(data: unknown): data is PortfolioFile {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;

  if (obj.version !== 1) return false;
  if (typeof obj.portfolioName !== 'string') return false;
  if (typeof obj.portfolioDescription !== 'string') return false;
  if (typeof obj.departmentAnnualSalary !== 'number') return false;
  if (!Array.isArray(obj.entries)) return false;

  return obj.entries.every(isValidPortfolioEntry);
}

export function usePortfolioSaveLoad({
  portfolioState,
  portfolioDispatch,
}: UsePortfolioSaveLoadParams) {
  const savePortfolio = useCallback(() => {
    const file: PortfolioFile = {
      version: 1,
      portfolioName: portfolioState.portfolioName,
      portfolioDescription: portfolioState.portfolioDescription,
      departmentAnnualSalary: portfolioState.departmentAnnualSalary,
      entries: portfolioState.entries,
    };

    const json = JSON.stringify(file, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${portfolioState.portfolioName.trim() || 'SureROI-Portfolio'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [portfolioState]);

  const loadPortfolio = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const text = ev.target?.result;
          if (typeof text !== 'string') return;

          const parsed: unknown = JSON.parse(text);

          if (!isValidPortfolioFile(parsed)) {
            alert('Invalid portfolio file. Please select a valid SureROI portfolio .json file.');
            return;
          }

          // Migrate entries to v2 format
          for (const entry of parsed.entries) {
            migrateEntry(entry as unknown as Record<string, unknown>);
          }

          portfolioDispatch({ type: 'LOAD_PORTFOLIO', portfolio: parsed });
        } catch {
          alert('Failed to parse the portfolio file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }, [portfolioDispatch]);

  return { savePortfolio, loadPortfolio };
}
