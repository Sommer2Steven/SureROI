/**
 * InputSection.tsx
 *
 * A collapsible accordion section used to group related input fields under
 * a shared heading (e.g., "New Tool Investment", "Efficiency Gains").
 * Clicking the header toggles visibility of the child content, letting
 * users focus on one group at a time without scrolling.
 */

import React, { useState } from 'react';

interface InputSectionProps {
  title: string;
  children: React.ReactNode;
  /** Whether the section starts expanded; defaults to true */
  defaultOpen?: boolean;
}

export function InputSection({ title, children, defaultOpen = true }: InputSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    // Bottom border separates sections; `last:border-b-0` removes the
    // trailing border on the final section in a list.
    <div className="border-b border-edge last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2.5 px-1 text-sm font-semibold text-ink-secondary hover:text-ink transition-colors"
      >
        <span>{title}</span>
        {/* Chevron icon rotates 180 degrees when the section is open */}
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* Conditionally render children only when the section is expanded */}
      {open && <div className="pb-3 px-1">{children}</div>}
    </div>
  );
}
