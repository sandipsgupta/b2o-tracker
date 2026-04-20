import { describe, it, expect } from "vitest";

describe("Auto-WFH Assignment Logic", () => {
  it("should calculate days until next Sunday correctly", () => {
    // Test Monday (day 1)
    const monday = new Date(2026, 3, 20); // April 20, 2026 is a Monday
    monday.setHours(12, 0, 0, 0);
    const dayOfWeek = monday.getDay(); // Should be 1

    expect(dayOfWeek).toBe(1);
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    expect(daysUntilSunday).toBe(6); // 6 days until Sunday
  });

  it("should calculate days until next Sunday from Sunday", () => {
    // Test Sunday (day 0)
    const sunday = new Date(2026, 3, 26); // April 26, 2026 is a Sunday
    sunday.setHours(12, 0, 0, 0);
    const dayOfWeek = sunday.getDay(); // Should be 0

    expect(dayOfWeek).toBe(0);
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    expect(daysUntilSunday).toBe(7); // Next Sunday is 7 days away
  });

  it("should convert day of week to 1-based format correctly", () => {
    // JavaScript: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Our format: 1 = Monday, 2 = Tuesday, ..., 5 = Friday, 6 = Saturday, 7 = Sunday

    const testCases = [
      { jsDay: 0, expected: 7 }, // Sunday
      { jsDay: 1, expected: 1 }, // Monday
      { jsDay: 2, expected: 2 }, // Tuesday
      { jsDay: 3, expected: 3 }, // Wednesday
      { jsDay: 4, expected: 4 }, // Thursday
      { jsDay: 5, expected: 5 }, // Friday
      { jsDay: 6, expected: 6 }, // Saturday
    ];

    testCases.forEach(({ jsDay, expected }) => {
      const dayNum1Based = jsDay === 0 ? 7 : jsDay;
      expect(dayNum1Based).toBe(expected);
    });
  });

  it("should parse working days string correctly", () => {
    const workingDaysStr = "1,2,3,4,5";
    const workingDays = workingDaysStr.split(",").map(d => parseInt(d, 10));

    expect(workingDays).toEqual([1, 2, 3, 4, 5]);
    expect(workingDays.includes(1)).toBe(true); // Monday
    expect(workingDays.includes(6)).toBe(false); // Saturday
    expect(workingDays.includes(7)).toBe(false); // Sunday
  });

  it("should identify working days in a week", () => {
    const workingDays = [1, 2, 3, 4, 5]; // Mon-Fri

    // Week starting Monday April 20, 2026
    const weekDays = [
      { date: new Date(2026, 3, 20), jsDay: 1, expected: true }, // Monday
      { date: new Date(2026, 3, 21), jsDay: 2, expected: true }, // Tuesday
      { date: new Date(2026, 3, 22), jsDay: 3, expected: true }, // Wednesday
      { date: new Date(2026, 3, 23), jsDay: 4, expected: true }, // Thursday
      { date: new Date(2026, 3, 24), jsDay: 5, expected: true }, // Friday
      { date: new Date(2026, 3, 25), jsDay: 6, expected: false }, // Saturday
      { date: new Date(2026, 3, 26), jsDay: 0, expected: false }, // Sunday
    ];

    weekDays.forEach(({ date, jsDay, expected }) => {
      const dayNum1Based = jsDay === 0 ? 7 : jsDay;
      const isWorkingDay = workingDays.includes(dayNum1Based);
      expect(isWorkingDay).toBe(expected);
    });
  });

  it("should handle custom working days (including Saturday)", () => {
    const workingDays = [1, 2, 3, 4, 5, 6]; // Mon-Sat (no Sunday)

    expect(workingDays.includes(1)).toBe(true); // Monday
    expect(workingDays.includes(6)).toBe(true); // Saturday
    expect(workingDays.includes(7)).toBe(false); // Sunday
  });

  it("should calculate week date range correctly", () => {
    // Monday April 20, 2026
    const monday = new Date(2026, 3, 20);
    const dayOfWeek = monday.getDay(); // 1 = Monday

    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 days (already Monday)
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() - daysToMonday);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    expect(weekStart.getDate()).toBe(20); // Monday
    expect(weekEnd.getDate()).toBe(26); // Sunday
  });

  it("should generate correct date strings for week", () => {
    const dates: string[] = [];
    const monday = new Date(2026, 3, 20);

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
    }

    expect(dates).toEqual([
      "2026-04-20", // Monday
      "2026-04-21", // Tuesday
      "2026-04-22", // Wednesday
      "2026-04-23", // Thursday
      "2026-04-24", // Friday
      "2026-04-25", // Saturday
      "2026-04-26", // Sunday
    ]);
  });

  it("should filter working days from week dates", () => {
    const workingDays = [1, 2, 3, 4, 5]; // Mon-Fri
    const allWeekDates = [
      "2026-04-20", // Monday
      "2026-04-21", // Tuesday
      "2026-04-22", // Wednesday
      "2026-04-23", // Thursday
      "2026-04-24", // Friday
      "2026-04-25", // Saturday
      "2026-04-26", // Sunday
    ];

    const weekDateDays = [1, 2, 3, 4, 5, 6, 0]; // Corresponding JS day numbers
    const workingDateStrings = allWeekDates.filter((_, idx) => {
      const jsDay = weekDateDays[idx];
      const dayNum1Based = jsDay === 0 ? 7 : jsDay;
      return workingDays.includes(dayNum1Based);
    });

    expect(workingDateStrings).toEqual([
      "2026-04-20",
      "2026-04-21",
      "2026-04-22",
      "2026-04-23",
      "2026-04-24",
    ]);
  });
});
