/**
 * hooks/usePortfolioSaveLoad.ts
 *
 * Save/load portfolio state to/from JSON files.
 * Same Blob download / FileReader pattern as useSaveLoad.ts.
 */

import { useCallback } from 'react';
import type { PortfolioState, PortfolioAction, PortfolioFile } from '../types';
import { isValidScenario } from '../utils/projectFileValidation';
import { currentMonthKey, addMonths } from '../utils/calendarUtils';

const MONTH_KEY_RE = /^\d{4}-\d{2}$/;

interface UsePortfolioSaveLoadParams {
  portfolioState: PortfolioState;
  portfolioDispatch: React.Dispatch<PortfolioAction>;
}

function isValidPortfolioEntry(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) return false;
  const obj = e as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.projectName === 'string' &&
    typeof obj.scenarioName === 'string' &&
    typeof obj.estimatedHours === 'number' &&
    typeof obj.excludeDesignControls === 'boolean' &&
    typeof obj.analysisPeriod === 'number' &&
    typeof obj.sourceFileName === 'string' &&
    isValidScenario(obj.scenario) &&
    typeof obj.baselineCurrentState === 'object' && obj.baselineCurrentState !== null &&
    // startMonth/endMonth are optional for backcompat — validated below
    (obj.startMonth === undefined || (typeof obj.startMonth === 'string' && MONTH_KEY_RE.test(obj.startMonth))) &&
    (obj.endMonth === undefined || (typeof obj.endMonth === 'string' && MONTH_KEY_RE.test(obj.endMonth)))
  );
}

/** Backfill old entries missing startMonth/endMonth with sensible defaults. */
function backfillEntry(entry: Record<string, unknown>): void {
  if (!entry.startMonth || typeof entry.startMonth !== 'string') {
    entry.startMonth = currentMonthKey();
  }
  if (!entry.endMonth || typeof entry.endMonth !== 'string') {
    const period = typeof entry.analysisPeriod === 'number' ? entry.analysisPeriod : 36;
    entry.endMonth = addMonths(entry.startMonth as string, Math.max(0, period - 1));
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

          // Backfill startMonth/endMonth for entries saved before calendar timeline feature
          for (const entry of parsed.entries) {
            backfillEntry(entry as unknown as Record<string, unknown>);
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
