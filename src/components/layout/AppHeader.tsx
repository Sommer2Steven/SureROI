/**
 * AppHeader.tsx
 *
 * Application header bar with:
 *   - Sidebar toggle (hamburger)
 *   - Editable project title + description
 *   - Dark/light mode toggle
 *   - PDF export button
 */

import React from 'react';
import type { AppAction, AppMode, PortfolioAction } from '../../types';

interface AppHeaderProps {
  projectTitle: string;
  projectDescription: string;
  sidebarCollapsed: boolean;
  darkMode: boolean;
  dispatch: React.Dispatch<AppAction>;
  onExportPDF?: () => void;
  isExporting?: boolean;
  onSave?: () => void;
  onLoad?: () => void;
  appMode: AppMode;
  portfolioName?: string;
  portfolioDescription?: string;
  portfolioDispatch?: React.Dispatch<PortfolioAction>;
  onPortfolioSave?: () => void;
  onPortfolioLoad?: () => void;
}

export function AppHeader({
  projectTitle,
  projectDescription,
  sidebarCollapsed,
  darkMode,
  dispatch,
  onExportPDF,
  isExporting,
  onSave,
  onLoad,
  appMode,
  portfolioName,
  portfolioDescription,
  portfolioDispatch,
  onPortfolioSave,
  onPortfolioLoad,
}: AppHeaderProps) {
  return (
    <header className="bg-surface border-b border-edge px-4 py-3 print:hidden">
      <div className="flex items-center justify-between gap-4">
        {/* Left: hamburger + brand + project fields */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Sidebar toggle */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-hovered transition-colors shrink-0"
            title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Brand icon */}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>

          {/* Brand title */}
          <h1 className="text-lg font-bold text-ink tracking-tight shrink-0">SureROI</h1>

          {/* Project / Portfolio toggle */}
          <div className="flex items-center bg-field rounded-lg p-0.5 shrink-0 ml-2">
            <button
              onClick={() => dispatch({ type: 'SET_APP_MODE', mode: 'project' })}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                appMode === 'project'
                  ? 'bg-blue-600 text-white'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Project
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_APP_MODE', mode: 'portfolio' })}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                appMode === 'portfolio'
                  ? 'bg-blue-600 text-white'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Portfolio
            </button>
          </div>

          {/* Editable title + description — contextual per mode */}
          <div className="flex items-center gap-3 flex-1 min-w-0 ml-3">
            {appMode === 'project' ? (
              <>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => dispatch({ type: 'SET_PROJECT_TITLE', title: e.target.value })}
                  placeholder="Project Title"
                  className="bg-transparent border-b border-edge text-ink text-sm font-medium px-1 py-0.5 outline-none focus:border-blue-500 transition-colors w-48 placeholder:text-ink-muted"
                />
                <input
                  type="text"
                  value={projectDescription}
                  onChange={(e) => dispatch({ type: 'SET_PROJECT_DESCRIPTION', description: e.target.value })}
                  placeholder="Description"
                  className="bg-transparent border-b border-edge text-ink-secondary text-xs px-1 py-0.5 outline-none focus:border-blue-500 transition-colors flex-1 min-w-0 placeholder:text-ink-muted"
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={portfolioName ?? ''}
                  onChange={(e) => portfolioDispatch?.({ type: 'SET_PORTFOLIO_NAME', name: e.target.value })}
                  placeholder="Portfolio Name"
                  className="bg-transparent border-b border-edge text-ink text-sm font-medium px-1 py-0.5 outline-none focus:border-blue-500 transition-colors w-48 placeholder:text-ink-muted"
                />
                <input
                  type="text"
                  value={portfolioDescription ?? ''}
                  onChange={(e) => portfolioDispatch?.({ type: 'SET_PORTFOLIO_DESCRIPTION', description: e.target.value })}
                  placeholder="Description"
                  className="bg-transparent border-b border-edge text-ink-secondary text-xs px-1 py-0.5 outline-none focus:border-blue-500 transition-colors flex-1 min-w-0 placeholder:text-ink-muted"
                />
              </>
            )}
          </div>
        </div>

        {/* Right: theme toggle + PDF export */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dark/Light toggle */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
            className="p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-hovered transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              // Sun icon — clicking switches to light mode
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              // Moon icon — clicking switches to dark mode
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Save */}
          <button
            onClick={appMode === 'project' ? onSave : onPortfolioSave}
            className="p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-hovered transition-colors"
            title={appMode === 'project' ? 'Save project' : 'Save portfolio'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          {/* Load */}
          <button
            onClick={appMode === 'project' ? onLoad : onPortfolioLoad}
            className="p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-hovered transition-colors"
            title={appMode === 'project' ? 'Load project' : 'Load portfolio'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>

          {/* PDF Export — project mode only */}
          {appMode === 'project' && (
            <button
              onClick={onExportPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export as PDF"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isExporting ? 'Exporting...' : 'PDF'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
