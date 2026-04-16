import { AttendanceRecord } from "../drizzle/schema";
import { AttendanceStats } from "../shared/attendance";

/**
 * Generate weekly report data
 */
export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  stats: AttendanceStats;
  records: AttendanceRecord[];
}

export function generateWeeklyReport(
  records: AttendanceRecord[],
  stats: AttendanceStats,
  weekStart: string,
  weekEnd: string
): WeeklyReport {
  return {
    weekStart,
    weekEnd,
    stats,
    records,
  };
}

/**
 * Generate monthly report data
 */
export interface MonthlyReport {
  month: string;
  year: number;
  stats: AttendanceStats;
  records: AttendanceRecord[];
  weeklyBreakdown: Array<{
    week: number;
    officeAttended: number;
    wfhDays: number;
    percentage: number;
  }>;
}

export function generateMonthlyReport(
  records: AttendanceRecord[],
  stats: AttendanceStats,
  month: number,
  year: number
): MonthlyReport {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Group records by week
  const weeklyBreakdown = new Map<number, { office: number; wfh: number; total: number }>();

  records.forEach(record => {
    const date = new Date(record.date + "T00:00:00Z");
    const weekNumber = Math.ceil((date.getUTCDate()) / 7);

    if (!weeklyBreakdown.has(weekNumber)) {
      weeklyBreakdown.set(weekNumber, { office: 0, wfh: 0, total: 0 });
    }

    const week = weeklyBreakdown.get(weekNumber)!;
    week.total++;

    if (record.status === "office") {
      week.office++;
    } else if (record.status === "wfh") {
      week.wfh++;
    }
  });

  const breakdown = Array.from(weeklyBreakdown.entries())
    .map(([week, data]) => ({
      week,
      officeAttended: data.office,
      wfhDays: data.wfh,
      percentage: data.total > 0 ? Math.round((data.office / data.total) * 100) : 0,
    }))
    .sort((a, b) => a.week - b.week);

  return {
    month: monthNames[month - 1],
    year,
    stats,
    records,
    weeklyBreakdown: breakdown,
  };
}

/**
 * Convert report to CSV format
 */
export function reportToCSV(
  report: WeeklyReport | MonthlyReport,
  userName: string,
  userEmail: string
): string {
  const lines: string[] = [];

  // Header
  lines.push("B2O Tracker - Attendance Report");
  lines.push("");

  // User info
  lines.push(`User: ${userName}`);
  lines.push(`Email: ${userEmail}`);
  lines.push("");

  // Report period
  if ("month" in report) {
    lines.push(`Period: ${report.month} ${report.year}`);
  } else {
    lines.push(`Period: ${report.weekStart} to ${report.weekEnd}`);
  }

  lines.push("");

  // Statistics
  lines.push("Statistics");
  lines.push(`Total Working Days,${report.stats.totalWorkingDays}`);
  lines.push(`Office Days Attended,${report.stats.officeAttendedDays}`);
  lines.push(`WFH Days,${report.stats.wfhDays}`);
  lines.push(`Attendance Percentage,${report.stats.attendancePercentage}%`);
  lines.push(`Target Percentage,${report.stats.targetPercentage}%`);
  lines.push(`Days Remaining to Target,${report.stats.remainingDaysNeeded}`);
  lines.push("");

  // Detailed records
  lines.push("Daily Records");
  lines.push("Date,Status");
  report.records.forEach(record => {
    const status = record.status === "office" ? "Office Day" : record.status === "wfh" ? "WFH" : "Planned";
    lines.push(`${record.date},${status}`);
  });

  // Weekly breakdown for monthly reports
  if ("weeklyBreakdown" in report) {
    lines.push("");
    lines.push("Weekly Breakdown");
    lines.push("Week,Office Days,WFH Days,Percentage");
    report.weeklyBreakdown.forEach(week => {
      lines.push(`${week.week},${week.officeAttended},${week.wfhDays},${week.percentage}%`);
    });
  }

  return lines.join("\n");
}

/**
 * Convert report to JSON format (for API responses)
 */
export function reportToJSON(report: WeeklyReport | MonthlyReport): Record<string, unknown> {
  return {
    period: "month" in report
      ? { month: report.month, year: report.year }
      : { start: report.weekStart, end: report.weekEnd },
    statistics: {
      totalWorkingDays: report.stats.totalWorkingDays,
      officeAttended: report.stats.officeAttendedDays,
      wfhDays: report.stats.wfhDays,
      attendancePercentage: report.stats.attendancePercentage,
      targetPercentage: report.stats.targetPercentage,
      remainingDaysNeeded: report.stats.remainingDaysNeeded,
    },
    records: report.records.map(r => ({
      date: r.date,
      status: r.status,
    })),
    ...(("weeklyBreakdown" in report) && {
      weeklyBreakdown: report.weeklyBreakdown,
    }),
  };
}
