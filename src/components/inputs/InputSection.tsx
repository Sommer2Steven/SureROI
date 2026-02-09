import React, { useState } from 'react';

interface InputSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function InputSection({ title, children, defaultOpen = true }: InputSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-700 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2.5 px-1 text-sm font-semibold text-gray-200 hover:text-white transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="pb-3 px-1">{children}</div>}
    </div>
  );
}
