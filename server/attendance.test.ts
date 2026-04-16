import { describe, it, expect } from "vitest";
import { calculateAttendanceStats, getMonthRange, getCurrentWeekRange } from "../shared/attendance";

describe("Attendance Calculations", () => {
  describe("calculateAttendanceStats", () => {
    it("should calculate stats for empty records", () => {
      const monthRange = getMonthRange(2026, 4);
      const stats = calculateAttendanceStats([], monthRange, "1,2,3,4,5", 60);

      expect(stats.officeAttendedDays).toBe(0);
      expect(stats.wfhDays).toBe(0);
      expect(stats.attendancePercentage).toBe(0);
      expect(stats.remainingDaysNeeded).toBeGreaterThan(0);
      expect(stats.totalWorkingDays).toBeGreaterThan(0);
    });

    it("should calculate stats with mixed records", () => {
      const monthRange = getMonthRange(2026, 4);
      const records = [
        { date: "2026-04-01", status: "office" as const },
        { date: "2026-04-02", status: "wfh" as const },
        { date: "2026-04-03", status: "office" as const },
      ];

      const stats = calculateAttendanceStats(records, monthRange, "1,2,3,4,5", 60);

      expect(stats.officeAttendedDays).toBe(2);
      expect(stats.wfhDays).toBe(1);
      expect(stats.attendancePercentage).toBeGreaterThan(0);
      expect(stats.targetPercentage).toBe(60);
    });

    it("should calculate stats with enough office days to meet target", () => {
      const monthRange = getMonthRange(2026, 4);
      // April 2026 has 22 working days (Mon-Fri)
      // Need 60% = 13 days
      const workingDates = [
        "2026-04-01", "2026-04-02", "2026-04-03", "2026-04-06",
        "2026-04-07", "2026-04-08", "2026-04-09", "2026-04-10",
        "2026-04-13", "2026-04-14", "2026-04-15", "2026-04-16",
        "2026-04-17", "2026-04-20",
      ];
      const records = workingDates.map(date => ({
        date,
        status: "office" as const,
      }));

      const stats = calculateAttendanceStats(records, monthRange, "1,2,3,4,5", 60);

      expect(stats.targetPercentage).toBe(60);
      expect(stats.attendancePercentage).toBeGreaterThanOrEqual(60);
      expect(stats.remainingDaysNeeded).toBeLessThanOrEqual(0);
    });

    it("should calculate remaining days needed correctly", () => {
      const monthRange = getMonthRange(2026, 4);
      const records = [
        { date: "2026-04-01", status: "office" as const },
      ];

      const stats = calculateAttendanceStats(records, monthRange, "1,2,3,4,5", 60);

      expect(stats.remainingDaysNeeded).toBeGreaterThan(0);
      expect(stats.remainingDaysNeeded).toBeLessThanOrEqual(stats.totalWorkingDays);
      expect(stats.officeAttendedDays + stats.remainingDaysNeeded).toBeGreaterThanOrEqual(
        Math.ceil((60 / 100) * stats.totalWorkingDays)
      );
    });

    it("should respect custom target percentage", () => {
      const monthRange = getMonthRange(2026, 4);
      const records = [];

      const stats = calculateAttendanceStats(records, monthRange, "1,2,3,4,5", 80);

      expect(stats.targetPercentage).toBe(80);
      const expectedTargetDays = Math.ceil((80 / 100) * stats.totalWorkingDays);
      expect(stats.remainingDaysNeeded).toBe(expectedTargetDays);
    });
  });

  describe("Date range helpers", () => {
    it("should return correct month range for April 2026", () => {
      const range = getMonthRange(2026, 4);

      expect(range.start).toBe("2026-04-01");
      expect(range.end).toBe("2026-04-30");
    });

    it("should return correct week range", () => {
      const range = getCurrentWeekRange();

      expect(range.start).toBeDefined();
      expect(range.end).toBeDefined();
      expect(typeof range.start).toBe("string");
      expect(typeof range.end).toBe("string");
      // Week should be in YYYY-MM-DD format
      expect(range.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(range.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
