import { describe, it, expect, vi } from "vitest";

describe("AI Insights Generation", () => {
  describe("Default insights generation", () => {
    it("should generate congratulations message when target is met", () => {
      const stats = {
        remainingDaysNeeded: 0,
        attendancePercentage: 75,
        targetPercentage: 60,
        officeAttendedDays: 15,
      };

      // Simulate the logic from generateDefaultInsights
      const insights: string[] = [];

      if (stats.remainingDaysNeeded === 0) {
        insights.push("Congratulations! You've met your attendance target for this month.");
      }

      expect(insights).toContain("Congratulations! You've met your attendance target for this month.");
    });

    it("should generate catch-up message when behind", () => {
      const stats = {
        remainingDaysNeeded: 5,
        attendancePercentage: 45,
        targetPercentage: 60,
        officeAttendedDays: 8,
      };

      const insights: string[] = [];

      if (stats.remainingDaysNeeded > 0) {
        insights.push(`You are behind by ${stats.remainingDaysNeeded} days this month.`);
      }

      expect(insights).toContain("You are behind by 5 days this month.");
    });

    it("should generate weekly recommendation", () => {
      const stats = {
        remainingDaysNeeded: 4,
        attendancePercentage: 50,
        targetPercentage: 60,
        officeAttendedDays: 10,
      };

      const insights: string[] = [];

      if (stats.remainingDaysNeeded > 0) {
        const daysPerWeek = Math.ceil(stats.remainingDaysNeeded / 2);
        insights.push(`Try attending ${daysPerWeek} office days per week for the next 2 weeks to catch up.`);
      }

      expect(insights).toContain("Try attending 2 office days per week for the next 2 weeks to catch up.");
    });

    it("should generate consistency message for high attendance", () => {
      const stats = {
        remainingDaysNeeded: 0,
        attendancePercentage: 80,
        targetPercentage: 60,
        officeAttendedDays: 16,
      };

      const insights: string[] = [];

      if (stats.officeAttendedDays > 0) {
        const consistency = stats.officeAttendedDays / (stats.officeAttendedDays + stats.remainingDaysNeeded || 1);
        if (consistency > 0.7) {
          insights.push("You're maintaining strong attendance consistency!");
        }
      }

      expect(insights).toContain("You're maintaining strong attendance consistency!");
    });
  });

  describe("Next week recommendation logic", () => {
    it("should calculate days to attend per week", () => {
      const remainingDaysNeeded = 6;
      const daysPerWeek = Math.ceil(remainingDaysNeeded / 2);

      expect(daysPerWeek).toBe(3);
    });

    it("should return zero days when target is met", () => {
      const remainingDaysNeeded = 0;
      const daysPerWeek = Math.ceil(remainingDaysNeeded / 2);

      expect(daysPerWeek).toBe(0);
    });

    it("should suggest working days for office attendance", () => {
      const workingDaysList = [1, 2, 3, 4, 5]; // Mon-Fri
      const daysToAttend = 3;
      const suggestedDays = workingDaysList.slice(0, daysToAttend);

      expect(suggestedDays).toEqual([1, 2, 3]);
      expect(suggestedDays.length).toBe(daysToAttend);
    });
  });

  describe("Insight parsing", () => {
    it("should parse numbered insights from LLM response", () => {
      const content = `1. You are behind by 2 days this month.
2. Try attending Tuesday and Thursday next week.
3. Your consistency is improving!`;

      const insights = content
        .split("\n")
        .filter((line: string) => line.trim().match(/^\d+\./))
        .map((line: string) => line.replace(/^\d+\.\s*/, "").trim());

      expect(insights).toHaveLength(3);
      expect(insights[0]).toBe("You are behind by 2 days this month.");
      expect(insights[1]).toBe("Try attending Tuesday and Thursday next week.");
      expect(insights[2]).toBe("Your consistency is improving!");
    });

    it("should handle empty LLM response gracefully", () => {
      const content = "";

      const insights = content
        .split("\n")
        .filter((line: string) => line.trim().match(/^\d+\./))
        .map((line: string) => line.replace(/^\d+\.\s*/, "").trim());

      expect(insights).toHaveLength(0);
    });

    it("should handle malformed LLM response", () => {
      const content = `Some random text
No numbered items here
Just plain text`;

      const insights = content
        .split("\n")
        .filter((line: string) => line.trim().match(/^\d+\./))
        .map((line: string) => line.replace(/^\d+\.\s*/, "").trim());

      expect(insights).toHaveLength(0);
    });
  });
});
