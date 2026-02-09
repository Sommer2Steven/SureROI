import React from 'react';

export function AppHeader() {
  return (
    <header className="bg-gray-900 border-b border-gray-700/50 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">SureROI</h1>
            <p className="text-xs text-gray-400">Interactive ROI Calculator for Field Worker Tools</p>
          </div>
        </div>
      </div>
    </header>
  );
}
