import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getAttendanceRecords, getUserSettings } from "../db";
import { calculateAttendanceStats, getMonthRange, getCurrentWeekRange } from "../../shared/attendance";
import { generateWeeklyReport, generateMonthlyReport, reportToCSV, reportToJSON } from "../reports";

export const reportsRouter = router({
  /**
   * Generate weekly report
   */
  getWeeklyReport: protectedProcedure.query(async ({ ctx }) => {
    const settings = await getUserSettings(ctx.user.id);
    if (!settings) return null;

    const weekRange = getCurrentWeekRange();
    const records = await getAttendanceRecords(ctx.user.id, weekRange.start, weekRange.end);
    const stats = calculateAttendanceStats(
      records,
      weekRange,
      settings.workingDays,
      settings.targetPercentage
    );

    const report = generateWeeklyReport(records, stats, weekRange.start, weekRange.end);
    return reportToJSON(report);
  }),

  /**
   * Generate monthly report
   */
  getMonthlyReport: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12).optional(),
        year: z.number().min(2000).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const settings = await getUserSettings(ctx.user.id);
      if (!settings) return null;

      const now = new Date();
      const month = input.month || now.getUTCMonth() + 1;
      const year = input.year || now.getUTCFullYear();

      const monthRange = getMonthRange(year, month);
      const records = await getAttendanceRecords(ctx.user.id, monthRange.start, monthRange.end);
      const stats = calculateAttendanceStats(
        records,
        monthRange,
        settings.workingDays,
        settings.targetPercentage
      );

      const report = generateMonthlyReport(records, stats, month, year);
      return reportToJSON(report);
    }),

  /**
   * Export weekly report as CSV
   */
  exportWeeklyCSV: protectedProcedure.query(async ({ ctx }) => {
    const settings = await getUserSettings(ctx.user.id);
    if (!settings) return null;

    const weekRange = getCurrentWeekRange();
    const records = await getAttendanceRecords(ctx.user.id, weekRange.start, weekRange.end);
    const stats = calculateAttendanceStats(
      records,
      weekRange,
      settings.workingDays,
      settings.targetPercentage
    );

    const report = generateWeeklyReport(records, stats, weekRange.start, weekRange.end);
    const csv = reportToCSV(report, ctx.user.name || "User", ctx.user.email || "");

    return {
      filename: `attendance-report-week-${weekRange.start}.csv`,
      content: csv,
      mimeType: "text/csv",
    };
  }),

  /**
   * Export monthly report as CSV
   */
  exportMonthlyCSV: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12).optional(),
        year: z.number().min(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const settings = await getUserSettings(ctx.user.id);
      if (!settings) return null;

      const now = new Date();
      const month = input.month || now.getUTCMonth() + 1;
      const year = input.year || now.getUTCFullYear();

      const monthRange = getMonthRange(year, month);
      const records = await getAttendanceRecords(ctx.user.id, monthRange.start, monthRange.end);
      const stats = calculateAttendanceStats(
        records,
        monthRange,
        settings.workingDays,
        settings.targetPercentage
      );

      const report = generateMonthlyReport(records, stats, month, year);
      const csv = reportToCSV(report, ctx.user.name || "User", ctx.user.email || "");

      return {
        filename: `attendance-report-${year}-${String(month).padStart(2, "0")}.csv`,
        content: csv,
        mimeType: "text/csv",
      };
    }),
});
