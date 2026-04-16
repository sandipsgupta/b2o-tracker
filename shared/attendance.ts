/**
 * Shared attendance calculation utilities
 */

/**
 * Get day of week (1 = Monday, 7 = Sunday)
 */
export function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00Z');
  const day = date.getUTCDay();
  return day === 0 ? 7 : day; // Convert Sunday (0) to 7
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
  // Get all dates in range
  const allDates: string[] = [];
  const current = new Date(dateRange.start + 'T00:00:00Z');
  const end = new Date(dateRange.end + 'T00:00:00Z');

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    allDates.push(dateStr);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  // Filter to working days only
  const workingDaysInRange = allDates.filter(d => isWorkingDay(d, workingDays));

  // Count attendance
  const recordMap = new Map(records.map(r => [r.date, r.status]));
  const officeAttendedDays = workingDaysInRange.filter(d => recordMap.get(d) === 'office').length;
  const wfhDays = workingDaysInRange.filter(d => recordMap.get(d) === 'wfh').length;
  const plannedDays = workingDaysInRange.filter(d => recordMap.get(d) === 'planned').length;

  const totalWorkingDays = workingDaysInRange.length;
  const attendancePercentage = totalWorkingDays > 0 ? Math.round((officeAttendedDays / totalWorkingDays) * 100) : 0;

  // Calculate remaining days needed
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
 */
export function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(now);
  monday.setUTCDate(monday.getUTCDate() - daysToMonday);

  const sunday = new Date(monday);
  sunday.setUTCDate(sunday.getUTCDate() + 6);

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

/**
 * Get date range for current month
 */
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0));

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Get date range for a specific month
 */
export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Get last N weeks of data for trend analysis
 */
export function getLastNWeeksRanges(n: number): Array<{ start: string; end: string; week: number }> {
  const ranges = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setUTCDate(weekStart.getUTCDate() - (7 * i));

    const dayOfWeek = weekStart.getUTCDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setUTCDate(weekStart.getUTCDate() - daysToMonday);

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

    ranges.push({
      start: weekStart.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0],
      week: n - i,
    });
  }

  return ranges;
}
