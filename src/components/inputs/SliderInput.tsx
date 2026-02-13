/**
 * SliderInput.tsx
 *
 * A horizontal range-slider input with a label and an editable numeric display.
 * Bidirectional sync: dragging the slider updates the text, typing updates the slider.
 * Uses the local-state-on-blur pattern from InputField.tsx to avoid clamping mid-type.
 */

import React, { useState, useEffect } from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Custom formatter for the displayed value; defaults to percentage display */
  formatDisplay?: (value: number) => string;
}

export function SliderInput({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  // Default: convert a 0-1 decimal to a rounded whole-number percentage string
  formatDisplay = (v) => `${Math.round(v * 100)}%`,
}: SliderInputProps) {
  // Local text state for the editable number input
  const [localText, setLocalText] = useState(String(Math.round(value * 100)));
  const [isFocused, setIsFocused] = useState(false);

  // Sync from parent when not actively editing the text field
  useEffect(() => {
    if (!isFocused) {
      setLocalText(String(Math.round(value * 100)));
    }
  }, [value, isFocused]);

  // Handle slider drag — update parent + local text immediately
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseFloat(e.target.value);
    onChange(newVal);
    setLocalText(String(Math.round(newVal * 100)));
  };

  // Handle text input typing
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalText(raw);

    // Propagate valid numbers immediately so charts update live
    if (raw === '') {
      onChange(0);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      // Convert from display percentage (0-100) to internal (0-1)
      onChange(parsed / 100);
    }
  };

  // On blur: clamp to min/max range, commit final value
  const handleTextBlur = () => {
    setIsFocused(false);

    let parsed = parseFloat(localText);
    if (isNaN(parsed)) parsed = 0;

    // Clamp to the display range (min/max converted to 0-100 scale)
    const minDisplay = Math.round(min * 100);
    const maxDisplay = Math.round(max * 100);
    parsed = Math.max(minDisplay, Math.min(maxDisplay, parsed));

    setLocalText(String(parsed));
    onChange(parsed / 100);
  };

  return (
    <div className="py-1.5">
      {/* Header row: label on the left, editable value on the right */}
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm text-ink-secondary">{label}</label>
        <div className="flex items-center gap-0.5">
          <input
            type="number"
            value={isFocused ? localText : Math.round(value * 100)}
            onChange={handleTextChange}
            onFocus={(e) => {
              setIsFocused(true);
              setLocalText(String(Math.round(value * 100)));
              e.target.select();
            }}
            onBlur={handleTextBlur}
            className="w-10 bg-field rounded px-1 py-0.5 text-sm font-medium text-ink text-right outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-sm font-medium text-ink-muted">%</span>
        </div>
      </div>
      <input
        type="range"
        value={value}
        onChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
        className="w-full h-1.5 bg-field rounded-full appearance-none cursor-pointer accent-blue-500
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
      />
    </div>
  );
}
