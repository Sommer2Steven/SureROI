/**
 * AppLayout.tsx
 *
 * Top-level layout shell with collapsible sidebar.
 */

import React from 'react';

interface AppLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  bottom: React.ReactNode;
  sidebarCollapsed: boolean;
}

export function AppLayout({ sidebar, main, bottom, sidebarCollapsed }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex flex-1 min-h-0">
        {/* Sidebar: animates between w-80 and w-0 */}
        <aside
          className={`shrink-0 bg-surface border-r border-edge overflow-y-auto overflow-x-hidden transition-all duration-300 print:hidden ${
            sidebarCollapsed ? 'w-0' : 'w-80'
          }`}
        >
          {sidebar}
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {main}
        </main>
      </div>

      <div className="shrink-0">{bottom}</div>
    </div>
  );
}
