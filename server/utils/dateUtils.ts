/**
 * Server-side date utilities
 * Handles date operations for server jobs and procedures
 */

/**
 * Convert Date to YYYY-MM-DD string format (local timezone)
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as YYYY-MM-DD string (local timezone)
 */
export function getTodayString(): string {
  return formatDateToString(new Date());
}

/**
 * Get the start of the current week (Monday) as a Date
 */
export function getWeekStart(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  
  return monday;
}

/**
 * Get the end of the current week (Sunday) as a Date
 */
export function getWeekEnd(): Date {
  const monday = getWeekStart();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return sunday;
}

/**
 * Get all dates for the current week as YYYY-MM-DD strings
 */
export function getWeekDates(): string[] {
  const monday = getWeekStart();
  const dates: string[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(formatDateToString(date));
  }
  
  return dates;
}

/**
 * Convert working days string (e.g., "1,2,3,4,5") to array of numbers
 * Format: 1 = Monday, 2 = Tuesday, ..., 5 = Friday, 6 = Saturday, 7 = Sunday
 */
export function parseWorkingDays(workingDaysStr: string): number[] {
  return workingDaysStr.split(",").map(d => parseInt(d.trim(), 10)).filter(d => !isNaN(d));
}

/**
 * Get working day number (1-7) for a given date
 * 1 = Monday, 2 = Tuesday, ..., 5 = Friday, 6 = Saturday, 7 = Sunday
 */
export function getWorkingDayNumber(date: Date): number {
  const jsDay = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Get working days for the current week that match the user's working days config
 * Returns array of YYYY-MM-DD strings
 */
export function getWorkingDatesForWeek(workingDaysStr: string): string[] {
  const workingDays = parseWorkingDays(workingDaysStr);
  const weekDates = getWeekDates();
  const monday = getWeekStart();
  
  const workingDates: string[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dayNum = getWorkingDayNumber(date);
    
    if (workingDays.includes(dayNum)) {
      workingDates.push(weekDates[i]);
    }
  }
  
  return workingDates;
}

/**
 * Calculate milliseconds until next Sunday 11:59 PM
 */
export function msUntilNextSunday11Pm(): number {
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  let daysUntilSunday = 0;
  if (dayOfWeek === 0) {
    // Today is Sunday
    daysUntilSunday = 7; // Next Sunday
  } else {
    daysUntilSunday = 7 - dayOfWeek;
  }
  
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(23, 59, 0, 0);
  
  return Math.max(0, nextSunday.getTime() - now.getTime());
}

/**
 * Get next Sunday 11:59 PM as a Date
 */
export function getNextSunday11Pm(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  let daysUntilSunday = 0;
  if (dayOfWeek === 0) {
    // Today is Sunday
    daysUntilSunday = 7; // Next Sunday
  } else {
    daysUntilSunday = 7 - dayOfWeek;
  }
  
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(23, 59, 0, 0);
  
  return nextSunday;
}
