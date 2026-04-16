/**
 * Shared attendance calculation utilities
 * CRITICAL: All date operations use local timezone (NOT UTC) to match user input
 */

/**
 * Parse a date string (YYYY-MM-DD) as a local date
 * Returns day of week: 1 = Monday, 7 = Sunday
 */
export function getDayOfWeek(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Create date in local timezone (NOT UTC)
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 ? 7 : dayOfWeek; // Convert Sunday (0) to 7
}

/**
 * Check if a date is a working day based on working days config
 * workingDays format: "1,2,3,4,5" (1=Mon, 5=Fri)
 */
export function isWorkingDay(dateStr: string, workingDays: string): boolean {
  const dayOfWeek = getDayOfWeek(dateStr);
  const workingDaysList = workingDays.split(',').map(d => parseInt(d, 10));
  return workingDaysList.includes(dayOfWeek);
}

/**
 * Calculate attendance statistics for a date range
 * CRITICAL: Uses local timezone for all date calculations
 */
export interface AttendanceStats {
  totalWorkingDays: number;
  officeAttendedDays: number;
  wfhDays: number;
  plannedDays: number;
  attendancePercentage: number;
  remainingDaysNeeded: number;
  targetPercentage: number;
}

export function calculateAttendanceStats(
  records: Array<{ date: string; status: 'office' | 'wfh' | 'planned' }>,
  dateRange: { start: string; end: string },
  workingDays: string,
  targetPercentage: number
): AttendanceStats {
  // Parse start and end dates as local dates (NOT UTC)
  const [startYear, startMonth, startDay] = dateRange.start.split('-').map(Number);
  const [endYear, endMonth, endDay] = dateRange.end.split('-').map(Number);
  
  const startDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonth - 1, endDay);

  // Generate all dates in range (local timezone)
  const allDates: string[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    allDates.push(dateStr);
    current.setDate(current.getDate() + 1);
  }

  // Filter to working days only
  const workingDaysInRange = allDates.filter(d => isWorkingDay(d, workingDays));

  // Count attendance by status
  const recordMap = new Map(records.map(r => [r.date, r.status]));
  const officeAttendedDays = workingDaysInRange.filter(d => recordMap.get(d) === 'office').length;
  const wfhDays = workingDaysInRange.filter(d => recordMap.get(d) === 'wfh').length;
  const plannedDays = workingDaysInRange.filter(d => recordMap.get(d) === 'planned').length;

  const totalWorkingDays = workingDaysInRange.length;
  const attendancePercentage = totalWorkingDays > 0 ? Math.round((officeAttendedDays / totalWorkingDays) * 100) : 0;

  // Calculate remaining days needed to reach target
  const targetDays = Math.ceil((targetPercentage / 100) * totalWorkingDays);
  const remainingDaysNeeded = Math.max(0, targetDays - officeAttendedDays);

  return {
    totalWorkingDays,
    officeAttendedDays,
    wfhDays,
    plannedDays,
    attendancePercentage,
    remainingDaysNeeded,
    targetPercentage,
  };
}

/**
 * Get date range for current week (Monday to Sunday)
 * Uses local timezone
 */
export function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(now);
  monday.setDate(monday.getDate() - daysToMonday);

  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  return {
    start: formatDateToString(monday),
    end: formatDateToString(sunday),
  };
}

/**
 * Get date range for current month
 * Uses local timezone
 */
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  return {
    start: formatDateToString(start),
    end: formatDateToString(end),
  };
}

/**
 * Get date range for a specific month
 * month is 1-indexed (1 = January, 12 = December)
 */
export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  return {
    start: formatDateToString(start),
    end: formatDateToString(end),
  };
}

/**
 * Get last N weeks of data for trend analysis
 * Uses local timezone
 */
export function getLastNWeeksRanges(n: number): Array<{ start: string; end: string; week: number }> {
  const ranges = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (7 * i));

    const dayOfWeek = weekStart.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setDate(weekStart.getDate() - daysToMonday);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    ranges.push({
      start: formatDateToString(weekStart),
      end: formatDateToString(weekEnd),
      week: n - i,
    });
  }

  return ranges;
}

/**
 * Format a Date object to YYYY-MM-DD string (local timezone)
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
