import React from 'react';

interface AppLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  bottom: React.ReactNode;
}

export function AppLayout({ sidebar, main, bottom }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-80 shrink-0 bg-gray-900/80 border-r border-gray-700/50 overflow-y-auto">
          {sidebar}
        </aside>

        {/* Main chart area */}
        <main className="flex-1 overflow-y-auto p-6">
          {main}
        </main>
      </div>

      {/* Bottom panel */}
      <div className="shrink-0">{bottom}</div>
    </div>
  );
}
