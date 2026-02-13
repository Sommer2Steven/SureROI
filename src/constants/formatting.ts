/**
 * constants/formatting.ts
 *
 * Number and currency formatting utilities used throughout the UI.
 * All formatters use the Intl.NumberFormat API for locale-aware output.
 * These are used in chart axes, tooltips, metric cards, formula displays, etc.
 */

// Formats as "$97,425" — whole dollars, no cents (used for most displays)
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// Formats as "$97,425.00" — includes cents (used where precision matters)
const currencyFormatterDecimals = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Formats plain numbers with up to 1 decimal place and comma separators
const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

/** Format a number as whole-dollar currency: $97,425 */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** Format a number as currency with cents: $97,425.00 */
export function formatCurrencyDecimals(value: number): string {
  return currencyFormatterDecimals.format(value);
}

/**
 * Format currency in abbreviated form for executive-friendly display.
 * Converts large numbers to K (thousands) or M (millions).
 * Examples: $1,500,000 -> "$1.5M", $485,000 -> "$485.0K", $750 -> "$750"
 */
export function formatCurrencyK(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(value);
}

/** Format a decimal as a whole percentage: 0.12 -> "12%" */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

/** Format a decimal as a percentage with one decimal: 0.125 -> "12.5%" */
export function formatPercentDecimal(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/** Format a number with commas and up to 1 decimal: 1234.5 -> "1,234.5" */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Format a month number as a concise label: 14 -> "M14" */
export function formatMonth(month: number): string {
  return `M${month}`;
}

/**
 * Formatter specifically for chart Y-axis tick labels.
 * Similar to formatCurrencyK but uses whole K values (no decimal)
 * to keep axis labels compact. Examples: 150000 -> "$150K", 2000000 -> "$2.0M"
 */
export function formatYAxisK(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value}`;
}
