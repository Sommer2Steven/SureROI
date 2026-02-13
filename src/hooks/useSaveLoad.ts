/**
 * hooks/useSaveLoad.ts
 *
 * Save current project state to a .json file and load it back via file picker.
 * Validates the JSON schema before dispatching to prevent corrupted state.
 */

import { useCallback } from 'react';
import type { AppState, AppAction, ProjectFile } from '../types';
import { isValidProjectFile } from '../utils/projectFileValidation';

interface UseSaveLoadParams {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export function useSaveLoad({ state, dispatch }: UseSaveLoadParams) {
  const saveProject = useCallback(() => {
    const projectFile: ProjectFile = {
      version: 1,
      projectTitle: state.projectTitle,
      projectDescription: state.projectDescription,
      analysisPeriod: state.analysisPeriod,
      darkMode: state.darkMode,
      scenarios: state.scenarios,
    };

    const json = JSON.stringify(projectFile, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.projectTitle.trim() || 'SureROI-Project'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state]);

  const loadProject = useCallback(() => {
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

          if (!isValidProjectFile(parsed)) {
            alert('Invalid project file. Please select a valid SureROI .json file.');
            return;
          }

          // Backfill costBreakdownLocked for files saved before this field existed
          const scenarios = parsed.scenarios.map((s) => ({
            ...s,
            costBreakdownLocked: s.costBreakdownLocked ?? false,
          }));

          dispatch({ type: 'LOAD_PROJECT', project: { ...parsed, scenarios } });
        } catch {
          alert('Failed to parse the project file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }, [dispatch]);

  return { saveProject, loadProject };
}
