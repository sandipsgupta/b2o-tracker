import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getAttendanceRecords,
  upsertAttendanceRecord,
  deleteAttendanceRecord,
  getUserSettings,
  updateUserSettings,
  createSharedDashboard,
  getUserSharedDashboards,
  deleteSharedDashboard,
} from "../db";
import {
  calculateAttendanceStats,
  getCurrentWeekRange,
  getCurrentMonthRange,
  getLastNWeeksRanges,
} from "../../shared/attendance";

export const attendanceRouter = router({
  /**
   * Get attendance records for a date range
   */
  getRecords: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const records = await getAttendanceRecords(ctx.user.id, input.startDate, input.endDate);
      console.log(`[DEBUG] getRecords - User ${ctx.user.id}, Range ${input.startDate} to ${input.endDate}, Found ${records.length} records`);
      records.forEach(r => console.log(`  - ${r.date}: ${r.status}`));
      return records;
    }),

  /**
   * Log attendance for a specific date
   */
  logAttendance: protectedProcedure
    .input(
      z.object({
        date: z.string(),
        status: z.enum(["office", "wfh", "planned", "holiday", "time-off"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log(`[DEBUG] logAttendance - User ${ctx.user.id}, Date ${input.date}, Status ${input.status}`);
      const result = await upsertAttendanceRecord(ctx.user.id, input.date, input.status);
      console.log(`[DEBUG] logAttendance - Saved: ${result?.date} = ${result?.status}`);
      return result;
    }),

  /**
   * Delete attendance record for a date
   */
  deleteAttendance: protectedProcedure
    .input(z.object({ date: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return deleteAttendanceRecord(ctx.user.id, input.date);
    }),

  /**
   * Get weekly attendance statistics
   */
  getWeeklyStats: protectedProcedure.query(async ({ ctx }) => {
    const settings = await getUserSettings(ctx.user.id);
    if (!settings) return null;

    const weekRange = getCurrentWeekRange();
    const records = await getAttendanceRecords(ctx.user.id, weekRange.start, weekRange.end);

    return calculateAttendanceStats(
      records,
      weekRange,
      settings.workingDays,
      settings.targetPercentage
    );
  }),

  /**
   * Get monthly attendance statistics
   */
  getMonthlyStats: protectedProcedure.query(async ({ ctx }) => {
    const settings = await getUserSettings(ctx.user.id);
    if (!settings) return null;

    const monthRange = getCurrentMonthRange();
    console.log(`[DEBUG] getMonthlyStats - Month range: ${monthRange.start} to ${monthRange.end}`);
    const records = await getAttendanceRecords(ctx.user.id, monthRange.start, monthRange.end);
    console.log(`[DEBUG] getMonthlyStats - Found ${records.length} records`);
    records.forEach(r => console.log(`  - ${r.date}: ${r.status}`));

    const stats = calculateAttendanceStats(
      records,
      monthRange,
      settings.workingDays,
      settings.targetPercentage
    );
    console.log(`[DEBUG] getMonthlyStats - Stats: ${stats.officeAttendedDays} attended, ${stats.totalWorkingDays} total, ${stats.remainingDaysNeeded} remaining`);
    return stats;
  }),

  /**
   * Get trend data for last N weeks
   */
  getTrendData: protectedProcedure
    .input(z.object({ weeks: z.number().min(1).max(52).default(12) }))
    .query(async ({ ctx, input }) => {
      const settings = await getUserSettings(ctx.user.id);
      if (!settings) return [];

      const weekRanges = getLastNWeeksRanges(input.weeks);
      const trends = [];

      for (const range of weekRanges) {
        const records = await getAttendanceRecords(ctx.user.id, range.start, range.end);
        const stats = calculateAttendanceStats(
          records,
          range,
          settings.workingDays,
          settings.targetPercentage
        );

        trends.push({
          week: range.week,
          date: range.start,
          percentage: stats.attendancePercentage,
          officeAttended: stats.officeAttendedDays,
          totalWorkingDays: stats.totalWorkingDays,
        });
      }

      return trends;
    }),

  /**
   * Get user settings
   */
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    return getUserSettings(ctx.user.id);
  }),

  /**
   * Update user settings
   */
  updateSettings: protectedProcedure
    .input(
      z.object({
        targetPercentage: z.number().min(1).max(100).optional(),
        workingDays: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return updateUserSettings(ctx.user.id, input);
    }),

  /**
   * Create a shareable dashboard link
   */
  createShareLink: protectedProcedure
    .input(
      z.object({
        expiresInDays: z.number().min(1).max(365).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let expiresAt: Date | undefined;
      if (input.expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
      }

      const token = await createSharedDashboard(ctx.user.id, expiresAt);
      return {
        token,
        url: `/share/${token}`,
        expiresAt,
      };
    }),

  /**
   * Get all share links for the user
   */
  getShareLinks: protectedProcedure.query(async ({ ctx }) => {
    return getUserSharedDashboards(ctx.user.id);
  }),

  /**
   * Delete a share link
   */
  deleteShareLink: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return deleteSharedDashboard(input.token);
    }),
});
