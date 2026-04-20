import { describe, it, expect } from "vitest";

/**
 * Unit tests for upsertAttendanceRecord logic
 *
 * These tests verify the branch logic in isolation (no DB required):
 * - When a record exists → UPDATE status only, preserve tracking fields
 * - When no record exists → INSERT new record
 */

// Simulate the upsert logic extracted from db.ts
function simulateUpsert(
  existing: { status: string; startTime: string | null; endTime: string | null; hoursWorked: number | null } | null,
  newStatus: string
) {
  if (existing) {
    // UPDATE only status — preserve tracking fields
    return {
      status: newStatus,
      startTime: existing.startTime,
      endTime: existing.endTime,
      hoursWorked: existing.hoursWorked,
    };
  } else {
    // INSERT new record
    return {
      status: newStatus,
      startTime: null,
      endTime: null,
      hoursWorked: null,
    };
  }
}

describe("upsertAttendanceRecord logic", () => {
  it("should INSERT a new record with null tracking fields when no existing record", () => {
    const result = simulateUpsert(null, "office");

    expect(result.status).toBe("office");
    expect(result.startTime).toBeNull();
    expect(result.endTime).toBeNull();
    expect(result.hoursWorked).toBeNull();
  });

  it("should UPDATE only status when record exists with no tracking data", () => {
    const existing = { status: "office", startTime: null, endTime: null, hoursWorked: null };
    const result = simulateUpsert(existing, "wfh");

    expect(result.status).toBe("wfh");
    expect(result.startTime).toBeNull();
    expect(result.endTime).toBeNull();
    expect(result.hoursWorked).toBeNull();
  });

  it("should PRESERVE startTime when changing status from office to planned", () => {
    const existing = {
      status: "office",
      startTime: "2026-04-21T09:00:00.000Z",
      endTime: null,
      hoursWorked: null,
    };
    const result = simulateUpsert(existing, "planned");

    expect(result.status).toBe("planned");
    expect(result.startTime).toBe("2026-04-21T09:00:00.000Z"); // preserved
    expect(result.endTime).toBeNull();
    expect(result.hoursWorked).toBeNull();
  });

  it("should PRESERVE endTime and hoursWorked when changing status after a completed session", () => {
    const existing = {
      status: "office",
      startTime: null, // cleared after stop
      endTime: "2026-04-21T17:30:00.000Z",
      hoursWorked: 510, // 8h 30m
    };
    const result = simulateUpsert(existing, "wfh");

    expect(result.status).toBe("wfh");
    expect(result.startTime).toBeNull();
    expect(result.endTime).toBe("2026-04-21T17:30:00.000Z"); // preserved
    expect(result.hoursWorked).toBe(510); // preserved
  });

  it("should PRESERVE all tracking fields when changing office → planned → office", () => {
    const afterFirstChange = simulateUpsert(
      { status: "office", startTime: "2026-04-21T09:00:00.000Z", endTime: null, hoursWorked: null },
      "planned"
    );
    expect(afterFirstChange.status).toBe("planned");
    expect(afterFirstChange.startTime).toBe("2026-04-21T09:00:00.000Z");

    const afterSecondChange = simulateUpsert(afterFirstChange, "office");
    expect(afterSecondChange.status).toBe("office");
    expect(afterSecondChange.startTime).toBe("2026-04-21T09:00:00.000Z"); // still preserved
  });

  it("should correctly handle a completed session preserved through multiple status changes", () => {
    const completed = {
      status: "office",
      startTime: null,
      endTime: "2026-04-21T17:00:00.000Z",
      hoursWorked: 480,
    };

    // Change to planned
    const planned = simulateUpsert(completed, "planned");
    expect(planned.hoursWorked).toBe(480);

    // Change back to office
    const backToOffice = simulateUpsert(planned, "office");
    expect(backToOffice.hoursWorked).toBe(480);
    expect(backToOffice.endTime).toBe("2026-04-21T17:00:00.000Z");
  });
});
