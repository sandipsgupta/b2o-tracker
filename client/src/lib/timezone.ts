/**
 * Timezone utilities for handling local time in the app
 */

/**
 * Get the user's timezone offset in minutes
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

/**
 * Get the user's timezone identifier (e.g., "America/Chicago")
 */
export function getTimezoneIdentifier(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

/**
 * Convert a UTC date string to local date string
 * @param utcDateStr - Date string in YYYY-MM-DD format (UTC)
 * @returns Date string in YYYY-MM-DD format (local timezone)
 */
export function utcToLocalDateString(utcDateStr: string): string {
  const [year, month, day] = utcDateStr.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return localDateToString(utcDate);
}

/**
 * Convert a local date to local date string
 * @param date - JavaScript Date object
 * @returns Date string in YYYY-MM-DD format (local timezone)
 */
export function localDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date in local timezone as YYYY-MM-DD string
 */
export function getTodayLocalDateString(): string {
  return localDateToString(new Date());
}

/**
 * Parse a YYYY-MM-DD date string as local date
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns JavaScript Date object (local timezone)
 */
export function parseLocalDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Compare two date strings (YYYY-MM-DD format)
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDateStrings(date1: string, date2: string): number {
  if (date1 < date2) return -1;
  if (date1 > date2) return 1;
  return 0;
}

/**
 * Check if a date string is in the past (before today)
 */
export function isPastDate(dateStr: string): boolean {
  const today = getTodayLocalDateString();
  return dateStr < today;
}

/**
 * Check if a date string is in the future (after today)
 */
export function isFutureDate(dateStr: string): boolean {
  const today = getTodayLocalDateString();
  return dateStr > today;
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr: string): boolean {
  const today = getTodayLocalDateString();
  return dateStr === today;
}
