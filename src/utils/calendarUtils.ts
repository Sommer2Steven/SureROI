/**
 * utils/calendarUtils.ts
 *
 * Pure calendar month math utilities. No external dependencies.
 * Month keys use "YYYY-MM" format (e.g. "2026-01" for January 2026).
 */

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/** Parse a "YYYY-MM" key into year and month (1-based). */
export function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split('-');
  return { year: parseInt(y, 10), month: parseInt(m, 10) };
}

/** Convert year + month (1-based) to "YYYY-MM" key. */
export function toMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

/** Inclusive count of months between two keys. Returns 0 if start > end. */
export function monthsBetween(start: string, end: string): number {
  const s = parseMonthKey(start);
  const e = parseMonthKey(end);
  const diff = (e.year - s.year) * 12 + (e.month - s.month) + 1;
  return Math.max(0, diff);
}

/** Shift a month key forward (or backward) by n months. */
export function addMonths(key: string, n: number): string {
  const { year, month } = parseMonthKey(key);
  const total = (year * 12 + (month - 1)) + n;
  const newYear = Math.floor(total / 12);
  const newMonth = (total % 12) + 1;
  return toMonthKey(newYear, newMonth);
}

/** Generate an ordered array of all month keys from start to end (inclusive). */
export function generateMonthRange(start: string, end: string): string[] {
  const count = monthsBetween(start, end);
  if (count <= 0) return [];
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(addMonths(start, i));
  }
  return result;
}

/** Format "2026-01" as "Jan 2026". */
export function formatMonthLabel(key: string): string {
  const { year, month } = parseMonthKey(key);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** Get the current month as "YYYY-MM". */
export function currentMonthKey(): string {
  const now = new Date();
  return toMonthKey(now.getFullYear(), now.getMonth() + 1);
}
