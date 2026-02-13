/**
 * InputField.tsx
 *
 * A reusable numeric input component with optional prefix/suffix adornments
 * (e.g., "$" prefix for currency, "mo" suffix for months). Used throughout
 * the input panels wherever the user needs to enter a raw number.
 *
 * The component renders a label on the left and a styled numeric input on
 * the right, keeping the layout consistent across all input rows.
 */

import React, { useState, useEffect } from 'react';

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Text shown before the input value, e.g. "$" */
  prefix?: string;
  /** Text shown after the input value, e.g. "mo" */
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min = 0,
  max,
  step = 1,
}: InputFieldProps) {
  // Local string state lets the user type freely (e.g. "1" on the way to "12")
  // without the value getting clamped mid-keystroke.
  const [localValue, setLocalValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);

  // Sync from parent when not actively editing
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(String(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalValue(raw);

    // Propagate valid numbers immediately (unclamped) so charts update live
    if (raw === '') {
      onChange(0);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);

    // On blur, clamp to min/max and commit the final value
    let final = parseFloat(localValue);
    if (isNaN(final)) final = 0;
    if (min != null) final = Math.max(min, final);
    if (max != null) final = Math.min(max, final);
    setLocalValue(String(final));
    onChange(final);
  };

  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <label className="text-sm text-ink-secondary shrink-0">{label}</label>
      <div className="flex items-center gap-1 bg-field rounded-md px-2 py-1.5 w-32">
        {prefix && <span className="text-ink-muted text-sm">{prefix}</span>}
        <input
          type="number"
          value={isFocused ? localValue : value}
          onChange={handleChange}
          onFocus={(e) => {
            setIsFocused(true);
            setLocalValue(String(value));
            e.target.select();
          }}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          // The long className hides the browser-native spinner arrows on
          // both WebKit (Chrome/Safari) and Firefox so the input stays minimal.
          className="w-full bg-transparent text-ink text-sm text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="text-ink-muted text-sm">{suffix}</span>}
      </div>
    </div>
  );
}
