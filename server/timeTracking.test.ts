import { describe, it, expect } from "vitest";

describe("Time Tracking Logic", () => {
  it("should calculate elapsed minutes correctly from startTime", () => {
    const now = new Date();
    const startTime = new Date(now.getTime() - 30 * 60 * 1000).toISOString(); // 30 minutes ago

    const start = new Date(startTime).getTime();
    const currentTime = new Date().getTime();
    const elapsedMinutes = Math.round((currentTime - start) / (1000 * 60));

    expect(elapsedMinutes).toBeGreaterThanOrEqual(29);
    expect(elapsedMinutes).toBeLessThanOrEqual(31);
  });

  it("should cap hoursWorked at 480 minutes (8 hours)", () => {
    const now = new Date();
    const startTime = new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(); // 10 hours ago
    const endTime = now.toISOString();

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const minutesWorked = Math.round((end - start) / (1000 * 60));
    const hoursWorked = Math.min(minutesWorked, 480);

    expect(hoursWorked).toBe(480);
    expect(hoursWorked).toBeLessThanOrEqual(480);
  });

  it("should calculate hours display correctly", () => {
    const hoursWorked = 125; // 2 hours 5 minutes
    const hours = Math.floor(hoursWorked / 60);
    const mins = hoursWorked % 60;
    const display = `${hours}h ${mins}m`;

    expect(display).toBe("2h 5m");
  });

  it("should handle edge case: exactly 8 hours", () => {
    const hoursWorked = 480; // exactly 8 hours
    const hours = Math.floor(hoursWorked / 60);
    const mins = hoursWorked % 60;
    const display = `${hours}h ${mins}m`;

    expect(display).toBe("8h 0m");
  });

  it("should handle edge case: less than 1 minute", () => {
    const hoursWorked = 0;
    const hours = Math.floor(hoursWorked / 60);
    const mins = hoursWorked % 60;
    const display = `${hours}h ${mins}m`;

    expect(display).toBe("0h 0m");
  });

  it("should handle edge case: 1 hour 30 minutes", () => {
    const hoursWorked = 90; // 1 hour 30 minutes
    const hours = Math.floor(hoursWorked / 60);
    const mins = hoursWorked % 60;
    const display = `${hours}h ${mins}m`;

    expect(display).toBe("1h 30m");
  });

  it("should track isTracking state correctly", () => {
    const startTime = new Date().toISOString();
    const endTime = null;

    const isTracking = startTime && !endTime;
    expect(isTracking).toBe(true);
  });

  it("should track isTracking as false when endTime is set", () => {
    const startTime = new Date(new Date().getTime() - 60 * 60 * 1000).toISOString();
    const endTime = new Date().toISOString();

    const isTracking = startTime && !endTime;
    expect(isTracking).toBe(false);
  });

  it("should handle zero elapsed time", () => {
    const now = new Date();
    const startTime = now.toISOString();
    const endTime = now.toISOString();

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const minutesWorked = Math.round((end - start) / (1000 * 60));

    expect(minutesWorked).toBe(0);
  });

  it("should round elapsed minutes correctly", () => {
    const now = new Date();
    // 30.4 seconds should round to 1 minute
    const startTime = new Date(now.getTime() - 30400).toISOString();
    const endTime = now.toISOString();

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const minutesWorked = Math.round((end - start) / (1000 * 60));

    expect(minutesWorked).toBe(1);
  });
});
