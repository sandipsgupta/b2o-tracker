import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getAttendanceRecords, getUserSettings } from "../db";
import { calculateAttendanceStats, getCurrentMonthRange, getLastNWeeksRanges } from "../../shared/attendance";
import { invokeLLM } from "../_core/llm";

export const aiRouter = router({
  /**
   * Generate AI insights for current month
   */
  generateInsights: protectedProcedure.query(async ({ ctx }) => {
    const settings = await getUserSettings(ctx.user.id);
    if (!settings) return null;

    const monthRange = getCurrentMonthRange();
    const records = await getAttendanceRecords(ctx.user.id, monthRange.start, monthRange.end);
    const monthlyStats = calculateAttendanceStats(
      records,
      monthRange,
      settings.workingDays,
      settings.targetPercentage
    );

    // Get trend data for context
    const weekRanges = getLastNWeeksRanges(4);
    const trendData = [];

    for (const range of weekRanges) {
      const weekRecords = await getAttendanceRecords(ctx.user.id, range.start, range.end);
      const weekStats = calculateAttendanceStats(
        weekRecords,
        range,
        settings.workingDays,
        settings.targetPercentage
      );
      trendData.push({
        week: range.week,
        percentage: weekStats.attendancePercentage,
      });
    }

    // Build prompt for LLM
    const prompt = `You are a helpful assistant providing personalized attendance insights. Based on the following attendance data, provide 2-3 actionable, specific recommendations to help the user meet their attendance target.

Current Month Statistics:
- Attendance Percentage: ${monthlyStats.attendancePercentage}%
- Target Percentage: ${monthlyStats.targetPercentage}%
- Office Days Attended: ${monthlyStats.officeAttendedDays} of ${monthlyStats.totalWorkingDays} working days
- Days Remaining to Target: ${monthlyStats.remainingDaysNeeded}

Last 4 Weeks Trend:
${trendData.map(w => `- Week ${w.week}: ${w.percentage}%`).join("\n")}

Provide insights in the following format:
1. First insight (specific and actionable)
2. Second insight (specific and actionable)
3. Third insight if applicable (specific and actionable)

Keep each insight to 1-2 sentences. Focus on practical suggestions like "Attend Tuesday and Thursday next week" or "You're behind by X days, focus on attending 3 days per week".`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant providing personalized attendance insights. Provide specific, actionable recommendations based on attendance data.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.choices[0]?.message.content;
      const contentStr = typeof content === "string" ? content : "";
      const insights = contentStr
        .split("\n")
        .filter((line: string) => line.trim().match(/^\d+\./))  
        .map((line: string) => line.replace(/^\d+\.\s*/, "").trim());

      return {
        insights: insights.length > 0 ? insights : generateDefaultInsights(monthlyStats),
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("Error generating AI insights:", error);
      // Fallback to rule-based insights
      return {
        insights: generateDefaultInsights(monthlyStats),
        generatedAt: new Date(),
      };
    }
  }),

  /**
   * Get AI recommendation for next week
   */
  getNextWeekRecommendation: protectedProcedure.query(async ({ ctx }) => {
    const settings = await getUserSettings(ctx.user.id);
    if (!settings) return null;

    const monthRange = getCurrentMonthRange();
    const records = await getAttendanceRecords(ctx.user.id, monthRange.start, monthRange.end);
    const monthlyStats = calculateAttendanceStats(
      records,
      monthRange,
      settings.workingDays,
      settings.targetPercentage
    );

    if (monthlyStats.remainingDaysNeeded === 0) {
      return {
        recommendation: "You've already met your attendance target! Keep up the great work.",
        daysToAttend: 0,
      };
    }

    // Calculate optimal days to attend per week
    const daysPerWeek = Math.ceil(monthlyStats.remainingDaysNeeded / 2);
    const workingDaysList = settings.workingDays.split(",").map(d => parseInt(d, 10));

    return {
      recommendation: `Attend ${daysPerWeek} office days next week to stay on track with your ${monthlyStats.targetPercentage}% target.`,
      daysToAttend: daysPerWeek,
      suggestedDays: workingDaysList.slice(0, daysPerWeek),
    };
  }),
});

/**
 * Generate default rule-based insights when LLM is unavailable
 */
function generateDefaultInsights(stats: {
  remainingDaysNeeded: number;
  attendancePercentage: number;
  targetPercentage: number;
  officeAttendedDays: number;
}): string[] {
  const insights: string[] = [];

  if (stats.remainingDaysNeeded === 0) {
    insights.push("Congratulations! You've met your attendance target for this month.");
  } else if (stats.remainingDaysNeeded <= 2) {
    insights.push(`You're close! Just ${stats.remainingDaysNeeded} more office day${stats.remainingDaysNeeded === 1 ? "" : "s"} to reach your target.`);
  } else {
    insights.push(`You are behind by ${stats.remainingDaysNeeded} days this month.`);
  }

  if (stats.remainingDaysNeeded > 0) {
    const daysPerWeek = Math.ceil(stats.remainingDaysNeeded / 2);
    insights.push(`Try attending ${daysPerWeek} office days per week for the next 2 weeks to catch up.`);
  }

  if (stats.officeAttendedDays > 0) {
    const consistency = stats.officeAttendedDays / (stats.officeAttendedDays + stats.remainingDaysNeeded);
    if (consistency > 0.7) {
      insights.push("You're maintaining strong attendance consistency!");
    }
  }

  return insights;
}
