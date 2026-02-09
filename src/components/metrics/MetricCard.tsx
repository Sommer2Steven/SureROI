import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}

export function MetricCard({ label, value, subtext, highlight }: MetricCardProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center px-4 py-3 rounded-lg min-w-[140px]
        ${highlight ? 'bg-blue-900/40 border border-blue-500/30' : 'bg-gray-800/60 border border-gray-700/50'}
      `}
    >
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </span>
      <span
        className={`text-xl font-bold ${
          highlight ? 'text-blue-300' : 'text-white'
        }`}
      >
        {value}
      </span>
      {subtext && (
        <span className="text-xs text-gray-500 mt-0.5">{subtext}</span>
      )}
    </div>
  );
}
