import { format, isValid, parseISO } from 'date-fns';

/**
 * Parse Firestore ISO strings, timestamps, or Date values safely.
 */
export function toValidDate(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    const d = value.toDate();
    return isValid(d) ? d : null;
  }
  const parsed = typeof value === 'string' ? parseISO(value) : new Date(value);
  return isValid(parsed) ? parsed : null;
}

/**
 * Format a date for display; returns fallback when missing or invalid.
 */
export function formatDisplayDate(value, pattern = 'MMM d, yyyy', fallback = '—') {
  const date = toValidDate(value);
  if (!date) return fallback;
  try {
    return format(date, pattern);
  } catch {
    return fallback;
  }
}
