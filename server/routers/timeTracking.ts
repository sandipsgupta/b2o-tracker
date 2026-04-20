import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { attendanceRecords } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const timeTrackingRouter = router({
  startTracking: protectedProcedure
    .input(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const startTime = new Date().toISOString();

      const existing = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.userId, ctx.user.id),
            eq(attendanceRecords.date, input.date)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No attendance record found for this date",
        });
      }

      // Only allow time tracking for office status
      if (existing[0].status !== "office") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Time tracking only available for Office status",
        });
      }

      await db
        .update(attendanceRecords)
        .set({ startTime })
        .where(
          and(
            eq(attendanceRecords.userId, ctx.user.id),
            eq(attendanceRecords.date, input.date)
          )
        );

      return { startTime, success: true };
    }),

  stopTracking: protectedProcedure
    .input(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const endTime = new Date().toISOString();

      const record = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.userId, ctx.user.id),
            eq(attendanceRecords.date, input.date)
          )
        )
        .limit(1);

      if (record.length === 0 || !record[0].startTime) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No active time tracking session",
        });
      }

      const start = new Date(record[0].startTime).getTime();
      const end = new Date(endTime).getTime();
      const minutesWorked = Math.round((end - start) / (1000 * 60));
      const hoursWorked = Math.min(minutesWorked, 480);

      await db
        .update(attendanceRecords)
        .set({ endTime, hoursWorked, startTime: null }) // Clear startTime after stopping
        .where(
          and(
            eq(attendanceRecords.userId, ctx.user.id),
            eq(attendanceRecords.date, input.date)
          )
        );

      return {
        endTime,
        hoursWorked,
        hoursDisplay: `${Math.floor(hoursWorked / 60)}h ${hoursWorked % 60}m`,
        success: true,
      };
    }),

  getTrackingStatus: protectedProcedure
    .input(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const record = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.userId, ctx.user.id),
            eq(attendanceRecords.date, input.date)
          )
        )
        .limit(1);

      if (record.length === 0) {
        return {
          isTracking: false,
          startTime: null,
          endTime: null,
          hoursWorked: null,
        };
      }

      const r = record[0];
      const isTracking = r.startTime && !r.endTime;

      let elapsedMinutes = 0;
      if (isTracking && r.startTime) {
        const start = new Date(r.startTime).getTime();
        const now = new Date().getTime();
        elapsedMinutes = Math.round((now - start) / (1000 * 60));
      }

      return {
        isTracking,
        startTime: r.startTime,
        endTime: r.endTime,
        hoursWorked: r.hoursWorked,
        elapsedMinutes: isTracking ? elapsedMinutes : null,
      };
    }),
});
