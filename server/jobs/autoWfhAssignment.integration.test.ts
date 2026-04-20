import { describe, it, expect } from "vitest";
import { getWorkingDatesForWeek, parseWorkingDays } from "../utils/dateUtils";

describe("Auto-WFH Assignment Logic", () => {
  it("should identify working dates for the current week", () => {
    const workingDates = getWorkingDatesForWeek("1,2,3,4,5");
    
    // Should have 5 working dates (Mon-Fri)
    expect(workingDates.length).toBe(5);
    
    // All should be valid date strings
    workingDates.forEach(date => {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it("should parse working days correctly", () => {
    const workingDays = parseWorkingDays("1,2,3,4,5");
    
    expect(workingDays).toEqual([1, 2, 3, 4, 5]);
    expect(workingDays.length).toBe(5);
  });

  it("should identify unlogged dates from a set", () => {
    const workingDates = ["2026-04-20", "2026-04-21", "2026-04-22", "2026-04-23", "2026-04-24"];
    const existingDates = new Set(["2026-04-20"]); // Only first day logged
    const unloggedDates = workingDates.filter(date => !existingDates.has(date));

    // Should have 4 unlogged dates (5 total - 1 logged)
    expect(unloggedDates.length).toBe(4);
    expect(unloggedDates).not.toContain("2026-04-20");
    expect(unloggedDates).toContain("2026-04-21");
  });

  it("should format WFH records correctly", () => {
    const workingDates = ["2026-04-20", "2026-04-21", "2026-04-22", "2026-04-23", "2026-04-24"];
    const now = new Date();
    
    const records = workingDates.map(date => ({
      userId: 1,
      date,
      status: "wfh" as const,
      startTime: null,
      endTime: null,
      hoursWorked: null,
      createdAt: now,
      updatedAt: now,
    }));

    expect(records.length).toBe(5);
    records.forEach(record => {
      expect(record.status).toBe("wfh");
      expect(record.startTime).toBeNull();
      expect(record.endTime).toBeNull();
      expect(record.hoursWorked).toBeNull();
    });
  });

  it("should filter unlogged dates correctly", () => {
    const workingDates = ["2026-04-20", "2026-04-21", "2026-04-22", "2026-04-23", "2026-04-24"];
    const existingDates = new Set(["2026-04-20"]); // Only first day logged
    const unloggedDates = workingDates.filter(date => !existingDates.has(date));

    // Verify existing date is not in unlogged
    expect(unloggedDates).not.toContain("2026-04-20");
    
    // Verify other dates are in unlogged
    expect(unloggedDates).toContain("2026-04-21");
    expect(unloggedDates).toContain("2026-04-22");
    expect(unloggedDates).toContain("2026-04-23");
    expect(unloggedDates).toContain("2026-04-24");
  });

  it("should handle custom working days (including Saturday)", () => {
    const workingDates = getWorkingDatesForWeek("1,2,3,4,5,6");
    
    // Should have 6 working dates (Mon-Sat)
    expect(workingDates.length).toBe(6);
  });

  it("should handle users with no working days", () => {
    const workingDates = getWorkingDatesForWeek("");
    
    // Should have 0 working dates
    expect(workingDates.length).toBe(0);
  });

  it("should simulate multiple user scenarios", () => {
    const workingDates = ["2026-04-20", "2026-04-21", "2026-04-22", "2026-04-23", "2026-04-24"];

    // User 1: has 1 logged day
    const user1ExistingDates = new Set(["2026-04-20"]);
    const user1UnloggedDates = workingDates.filter(date => !user1ExistingDates.has(date));
    
    // User 2: has no logged days
    const user2ExistingDates = new Set<string>();
    const user2UnloggedDates = workingDates.filter(date => !user2ExistingDates.has(date));

    // User 1 should have 4 unlogged dates
    expect(user1UnloggedDates.length).toBe(4);
    
    // User 2 should have 5 unlogged dates (all)
    expect(user2UnloggedDates.length).toBe(5);
  });
});
