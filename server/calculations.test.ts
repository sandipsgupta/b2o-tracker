import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateAttendanceStats,
  getWorkingDaysInRange,
  localDateToString,
  getDayOfWeek,
} from "../shared/attendance";

describe("Attendance Calculations with Holiday/Time-Off", () => {
  describe("Working days calculation excluding holidays and time-off", () => {
    it("should calculate correct working days for April 2026 (22 working days)", () => {
      // April 2026: 22 working days (Mon-Fri, excluding weekends)
      const records: Array<{ date: string; status: 'office' | 'wfh' | 'planned' | 'holiday' | 'time-off' }> = [];
      const startDate = "2026-04-01";
      const endDate = "2026-04-30";
      const workingDays = "1,2,3,4,5"; // Mon-Fri

      const result = calculateAttendanceStats(records, { start: startDate, end: endDate }, workingDays, 60);
      expect(result.totalWorkingDays).toBe(22);
    });

    it("should reduce working days when holidays are marked", () => {
      // April 2026 with 1 holiday
      const records = [
        { date: "2026-04-06", status: "holiday" as const },
      ];
      const startDate = "2026-04-01";
      const endDate = "2026-04-30";
      const workingDays = "1,2,3,4,5";

      const result = calculateAttendanceStats(
        records,
        { start: startDate, end: endDate },
        workingDays,
        60
      );

      // 22 working days - 1 holiday = 21 adjusted working days
      expect(result.adjustedWorkingDays).toBe(21);
      expect(result.holidayDays).toBe(1);
      expect(result.timeOffDays).toBe(0);
    });

    it("should reduce working days for both holidays and time-off", () => {
      const records = [
        { date: "2026-04-06", status: "holiday" as const },
        { date: "2026-04-07", status: "time-off" as const },
      ];
      const startDate = "2026-04-01";
      const endDate = "2026-04-30";
      const workingDays = "1,2,3,4,5";

      const result = calculateAttendanceStats(
        records,
        { start: startDate, end: endDate },
        workingDays,
        60
      );

      // 22 working days - 1 holiday - 1 time-off = 20 adjusted working days
      expect(result.adjustedWorkingDays).toBe(20);
      expect(result.holidayDays).toBe(1);
      expect(result.timeOffDays).toBe(1);
    });
  });

  describe("60% target calculation with adjusted working days", () => {
    it("should calculate 60% target on adjusted working days (no holidays)", () => {
      const records = [
        { date: "2026-04-06", status: "office" as const },
        { date: "2026-04-08", status: "office" as const },
        { date: "2026-04-10", status: "office" as const },
      ];
      const startDate = "2026-04-01";
      const endDate = "2026-04-30";
      const workingDays = "1,2,3,4,5";

      const result = calculateAttendanceStats(
        records,
        { start: startDate, end: endDate },
        workingDays,
        60
      );

      // 22 working days, 60% = 13.2 ≈ 14 days needed (Math.ceil)
      expect(result.adjustedWorkingDays).toBe(22);
      const expectedTarget = Math.ceil((60 / 100) * 22);
      expect(expectedTarget).toBe(14);
    });

    it("should calculate 60% target on adjusted working days (with 1 holiday)", () => {
      const records = [
        { date: "2026-04-06", status: "office" as const },
        { date: "2026-04-08", status: "office" as const },
        { date: "2026-04-10", status: "office" as const },
        { date: "2026-04-13", status: "holiday" as const },
      ];
      const startDate = "2026-04-01";
      const endDate = "2026-04-30";
      const workingDays = "1,2,3,4,5";

      const result = calculateAttendanceStats(
        records,
        { start: startDate, end: endDate },
        workingDays,
        60
      );

      // 22 - 1 = 21 adjusted working days, 60% of 21 = 12.6 ≈ 13 days needed
      const targetDays = Math.ceil((60 / 100) * 21);
      expect(targetDays).toBe(13);
      expect(result.adjustedWorkingDays).toBe(21);
      expect(result.officeAttendedDays).toBe(3);
      expect(result.remainingDaysNeeded).toBe(10); // 13 - 3 = 10
    });

    it("should calculate 60% target on adjusted working days (with 2 holidays)", () => {
      const records = [
        { date: "2026-04-06", status: "office" as const },
        { date: "2026-04-08", status: "office" as const },
        { date: "2026-04-10", status: "office" as const },
        { date: "2026-04-13", status: "holiday" as const },
        { date: "2026-04-14", status: "time-off" as const },
      ];
      const startDate = "2026-04-01";
      const endDate = "2026-04-30";
      const workingDays = "1,2,3,4,5";

      const result = calculateAttendanceStats(
        records,
        { start: startDate, end: endDate },
        workingDays,
        60
      );

      // 22 - 1 - 1 = 20 adjusted working days, 60% of 20 = 12 days needed
      const targetDays2 = Math.ceil((60 / 100) * 20);
      expect(targetDays2).toBe(12);
      expect(result.adjustedWorkingDays).toBe(20);
      expect(result.officeAttendedDays).toBe(3);
      expect(result.remainingDaysNeeded).toBe(9); // 12 - 3 = 9
    });
  });

  describe("Attendance percentage calculation", () => {
    it("should calculate percentage on adjusted working days", () => {
      const records = [
        { date: "2026-04-06", status: "office" as const },
        { date: "2026-04-08", status: "office" as const },
        { date: "2026-04-10", status: "office" as const },
        { date: "2026-04-13", status: "holiday" as const },
      ];
      const startDate = "2026-04-01";
      const endDate = "2026-04-30";
      const workingDays = "1,2,3,4,5";

      const result = calculateAttendanceStats(
        records,
        { start: startDate, end: endDate },
        workingDays,
        60
      );

      // 3 attended / 21 adjusted = 14.3%
      expect(result.attendancePercentage).toBeCloseTo(14, 0);
    });

    it("should show 0% when no office days attended", () => {
      const records = [
        { date: "2026-04-13", status: "holiday" as const },
      ];
      const startDate = "2026-04-01";
      const endDate = "2026-04-30";
      const workingDays = "1,2,3,4,5";

      const result = calculateAttendanceStats(
        records,
        { start: startDate, end: endDate },
        workingDays,
        60
      );

      expect(result.attendancePercentage).toBe(0);
      expect(result.officeAttendedDays).toBe(0);
    });
  });

  describe("Timezone-aware date handling", () => {
    it("should correctly identify day of week regardless of timezone", () => {
      // April 6, 2026 is a Monday
      const day = getDayOfWeek("2026-04-06");
      expect(day).toBe(1); // 1 = Monday
    });

    it("should correctly identify day of week for Friday", () => {
      // April 10, 2026 is a Friday
      const day = getDayOfWeek("2026-04-10");
      expect(day).toBe(5); // 5 = Friday
    });

    it("should correctly identify day of week for Saturday (non-working day)", () => {
      // April 11, 2026 is a Saturday
      const day = getDayOfWeek("2026-04-11");
      expect(day).toBe(6); // 6 = Saturday
    });
  });

  describe("Edge cases", () => {
    it("should handle all working days marked as holidays", () => {
      const workingDayDates = [
        "2026-04-01", "2026-04-02", "2026-04-03",
        "2026-04-06", "2026-04-07", "2026-04-08", "2026-04-09", "2026-04-10",
        "2026-04-13", "2026-04-14", "2026-04-15", "2026-04-16", "2026-04-17",
        "2026-04-20", "2026-04-21", "2026-04-22", "2026-04-23", "2026-04-24",
        "2026-04-27", "2026-04-28", "2026-04-29", "2026-04-30",
      ];
      const records = workingDayDates.map(date => ({
        date,
        status: "holiday" as const,
      }));
      const startDate = "2026-04-01";
      const endDate = "2026-04-30";
      const workingDays = "1,2,3,4,5";

      const result = calculateAttendanceStats(
        records,
        { start: startDate, end: endDate },
        workingDays,
        60
      );

      expect(result.adjustedWorkingDays).toBe(0);
      expect(result.attendancePercentage).toBe(0);
    });

    it("should handle mixed office/wfh/holiday/time-off correctly", () => {
      const records = [
        { date: "2026-04-06", status: "office" as const },
        { date: "2026-04-07", status: "wfh" as const },
        { date: "2026-04-08", status: "office" as const },
        { date: "2026-04-09", status: "holiday" as const },
        { date: "2026-04-10", status: "time-off" as const },
        { date: "2026-04-13", status: "office" as const },
      ];
      const startDate = "2026-04-01";
      const endDate = "2026-04-30";
      const workingDays = "1,2,3,4,5";

      const result = calculateAttendanceStats(
        records,
        { start: startDate, end: endDate },
        workingDays,
        60
      );

      // 22 - 1 holiday - 1 time-off = 20 adjusted working days
      expect(result.adjustedWorkingDays).toBe(20);
      // Only office days count: 3 office days
      expect(result.officeAttendedDays).toBe(3);
      // WFH doesn't count toward target
      expect(result.attendancePercentage).toBeCloseTo(15, 0); // 3/20 = 15%
    });
  });
});
