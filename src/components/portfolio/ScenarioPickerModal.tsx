/**
 * ScenarioPickerModal.tsx
 *
 * Multi-step modal for adding a project entry to the portfolio:
 * 1. Load a project file via file picker
 * 2. Select a scenario from the project
 * 3. Fill in deployment details (name, dates, actual units, tool count, exclusions)
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { ProjectFile, PortfolioEntry } from '../../types';
import { isValidProjectFile, loadAndMigrateProject } from '../../utils/projectFileValidation';
import { currentMonthKey, addMonths, monthsBetween, formatMonthLabel } from '../../utils/calendarUtils';

interface ScenarioPickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (entry: PortfolioEntry) => void;
}

let entryCounter = 0;

export function ScenarioPickerModal({ open, onClose, onConfirm }: ScenarioPickerModalProps) {
  const [project, setProject] = useState<ProjectFile | null>(null);
  const [fileName, setFileName] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Deployment details
  const [projectName, setProjectName] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [actualUnits, setActualUnits] = useState(0);
  const [toolCount, setToolCount] = useState(1);
  const [excludeDesignControls, setExcludeDesignControls] = useState(false);
  const [excludeTraining, setExcludeTraining] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setProject(null);
      setFileName('');
      setSelectedId(null);
      setProjectName('');
      setStartMonth('');
      setEndMonth('');
      setActualUnits(0);
      setToolCount(1);
      setExcludeDesignControls(false);
      setExcludeTraining(false);
    }
  }, [open]);

  // When scenario is selected, set deployment defaults
  useEffect(() => {
    if (!project || !selectedId) return;
    setProjectName(project.projectTitle || 'Untitled Project');
    const start = currentMonthKey();
    setStartMonth(start);
    setEndMonth(addMonths(start, Math.max(0, project.analysisPeriod - 1)));

    // Default actual units from the scenario's reference units
    const scenario = project.scenarios.find((s) => s.id === selectedId);
    if (scenario) {
      setActualUnits(scenario.savings.referenceUnits);
    }
    setToolCount(1);
    setExcludeDesignControls(false);
    setExcludeTraining(false);
  }, [project, selectedId]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleLoadFile = useCallback(() => {
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

          const migrated = loadAndMigrateProject(parsed);
          setProject(migrated);
          setFileName(file.name);
          setSelectedId(null);
        } catch {
          alert('Failed to parse the project file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }, []);

  const isValid = Boolean(
    project &&
    selectedId &&
    projectName.trim() &&
    startMonth &&
    endMonth &&
    monthsBetween(startMonth, endMonth) > 0 &&
    actualUnits >= 0 &&
    toolCount >= 1,
  );

  const handleConfirm = useCallback(() => {
    if (!project || !selectedId || !isValid) return;

    const scenario = project.scenarios.find((s) => s.id === selectedId);
    if (!scenario) return;

    entryCounter++;
    const entry: PortfolioEntry = {
      id: `portfolio-entry-${Date.now()}-${entryCounter}`,
      projectName: projectName.trim(),
      scenarioName: scenario.name,
      actualUnits,
      toolCount,
      excludeDesignControls,
      excludeTraining,
      startMonth,
      endMonth,
      scenario,
      baselineSavings: scenario.savings,
      analysisPeriod: project.analysisPeriod,
      sourceFileName: fileName,
    };

    onConfirm(entry);
    onClose();
  }, [project, selectedId, projectName, actualUnits, toolCount, excludeDesignControls, excludeTraining, startMonth, endMonth, fileName, isValid, onConfirm, onClose]);

  if (!open) return null;

  const duration = startMonth && endMonth ? monthsBetween(startMonth, endMonth) : 0;
  const selectedScenario = project?.scenarios.find((s) => s.id === selectedId);
  const unitName = selectedScenario?.savings.unitName ?? 'unit';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface rounded-xl border border-edge shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
          <h2 className="text-lg font-semibold text-ink">Add Project Entry</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-hovered transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto flex-1">
          {!project ? (
            // Step 1: Load file
            <div className="text-center py-8">
              <p className="text-sm text-ink-secondary mb-4">
                Select a SureROI project file to import a scenario.
              </p>
              <button
                onClick={handleLoadFile}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Load Project File
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <p className="text-sm text-ink-muted">
                  Source: <span className="text-ink font-medium">{fileName}</span>
                </p>
                <p className="text-sm text-ink-muted mt-1">
                  Project: <span className="text-ink font-medium">{project.projectTitle || 'Untitled'}</span>
                  {' '}&middot; {project.analysisPeriod} months
                </p>
              </div>

              {/* Scenario list */}
              {project.scenarios.length === 0 ? (
                <p className="text-sm text-ink-muted text-center py-4">
                  This project has no scenarios.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">
                    Select a scenario
                  </p>
                  {project.scenarios.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedId(s.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                        selectedId === s.id
                          ? 'border-blue-500 bg-highlight'
                          : 'border-edge bg-card hover:bg-hovered'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-sm text-ink font-medium">{s.name}</span>
                        <span className="text-xs text-ink-muted ml-auto">
                          {s.savings.mode === 'direct' ? 'Direct' : 'Time-Based'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Deployment Details */}
              {selectedId && (
                <div className="mt-4 pt-4 border-t border-edge">
                  <p className="text-xs text-ink-muted uppercase tracking-wider font-medium mb-3">
                    Deployment Details
                  </p>

                  <div className="space-y-3">
                    {/* Project Name */}
                    <div>
                      <label className="block text-xs font-medium text-ink-secondary mb-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md border border-edge bg-field text-sm text-ink focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Start / End Month */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-ink-secondary mb-1">
                          Start Month
                        </label>
                        <input
                          type="month"
                          value={startMonth}
                          onChange={(e) => setStartMonth(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-edge bg-field text-sm text-ink focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-secondary mb-1">
                          End Month
                        </label>
                        <input
                          type="month"
                          value={endMonth}
                          onChange={(e) => setEndMonth(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-edge bg-field text-sm text-ink focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {duration > 0 && (
                      <p className="text-xs text-ink-muted">
                        {formatMonthLabel(startMonth)} &ndash; {formatMonthLabel(endMonth)} ({duration} mo)
                      </p>
                    )}
                    {startMonth && endMonth && duration <= 0 && (
                      <p className="text-xs text-red-400">
                        End month must be on or after start month
                      </p>
                    )}

                    {/* Actual Units */}
                    <div>
                      <label className="block text-xs font-medium text-ink-secondary mb-1">
                        Actual {unitName}s
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={actualUnits}
                        onChange={(e) => setActualUnits(Math.max(0, Number(e.target.value) || 0))}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-1.5 rounded-md border border-edge bg-field text-sm text-ink focus:border-blue-500 focus:outline-none"
                      />
                      <p className="text-xs text-ink-muted mt-0.5">
                        How many {unitName}s does this deployment affect?
                      </p>
                    </div>

                    {/* Tool Count */}
                    <div>
                      <label className="block text-xs font-medium text-ink-secondary mb-1">
                        Tool Count
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={toolCount}
                        onChange={(e) => setToolCount(Math.max(1, Number(e.target.value) || 1))}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-1.5 rounded-md border border-edge bg-field text-sm text-ink focus:border-blue-500 focus:outline-none"
                      />
                      <p className="text-xs text-ink-muted mt-0.5">
                        How many tool instances to buy?
                      </p>
                    </div>

                    {/* Exclusion checkboxes */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={excludeDesignControls}
                          onChange={(e) => setExcludeDesignControls(e.target.checked)}
                          className="rounded border-edge"
                        />
                        <span className="text-sm text-ink-secondary">Exclude Design & Controls</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={excludeTraining}
                          onChange={(e) => setExcludeTraining(e.target.checked)}
                          className="rounded border-edge"
                        />
                        <span className="text-sm text-ink-secondary">Exclude Training</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Change file button */}
              <button
                onClick={handleLoadFile}
                className="mt-3 text-xs text-ink-muted hover:text-ink underline"
              >
                Load a different file
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {project && (
          <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-edge">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-sm text-ink-secondary hover:bg-hovered transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className="px-4 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
