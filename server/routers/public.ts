import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getSharedDashboardByToken, getAttendanceRecords, getUserSettings } from "../db";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { calculateAttendanceStats, getCurrentMonthRange } from "../../shared/attendance";

export const publicRouter = router({
  /**
   * Get public shared dashboard data by token
   * Returns only non-sensitive data: attendance summary, monthly %, charts
   */
  getSharedDashboard: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const share = await getSharedDashboardByToken(input.token);
      if (!share) {
        throw new Error("Share link not found or expired");
      }

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get user info (minimal)
      const userRecord = await db.select().from(users).where(eq(users.id, share.userId)).limit(1);
      if (!userRecord[0]) throw new Error("User not found");

      const user = userRecord[0];
      const settings = await getUserSettings(share.userId);
      if (!settings) throw new Error("Settings not found");

      // Get current month stats
      const monthRange = getCurrentMonthRange();
      const records = await getAttendanceRecords(share.userId, monthRange.start, monthRange.end);
      const monthlyStats = calculateAttendanceStats(
        records,
        monthRange,
        settings.workingDays,
        settings.targetPercentage
      );

      // Return only non-sensitive data (no personal identifiers)
      return {
        monthlyStats: {
          attendancePercentage: monthlyStats.attendancePercentage,
          officeAttendedDays: monthlyStats.officeAttendedDays,
          totalWorkingDays: monthlyStats.totalWorkingDays,
          remainingDaysNeeded: monthlyStats.remainingDaysNeeded,
          targetPercentage: monthlyStats.targetPercentage,
        },
        records: records.map(r => ({
          date: r.date,
          status: r.status,
        })),
      };
    }),
});
