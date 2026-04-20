import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { attendanceRecords } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";

export const timeTrackingRouter = router({
  /**
   * Start time tracking for a date
   */
  startTimeTracking: protectedProcedure
    .input(z.object({ date: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Find or create record for this date
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

      if (existing.length > 0) {
        // Update existing record with start time
        await db
          .update(attendanceRecords)
          .set({ startTime: now })
          .where(
            and(
              eq(attendanceRecords.userId, ctx.user.id),
              eq(attendanceRecords.date, input.date)
            )
          );
      } else {
        // Create new record with start time
        await db.insert(attendanceRecords).values({
          userId: ctx.user.id,
          date: input.date,
          status: "office",
          startTime: now,
        });
      }

      return { startTime: now };
    }),

  /**
   * End time tracking for a date
   */
  endTimeTracking: protectedProcedure
    .input(z.object({ date: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get the record to calculate hours
      const records = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.userId, ctx.user.id),
            eq(attendanceRecords.date, input.date)
          )
        )
        .limit(1);

      if (records.length === 0) {
        return { error: "No time tracking started for this date" };
      }

      const record = records[0];
      let hoursWorkedMinutes = 0;

      if (record.startTime) {
        const startTime = new Date(record.startTime);
        const endTime = new Date(now);
        hoursWorkedMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      }

      // Update record with end time and hours worked
      await db
        .update(attendanceRecords)
        .set({
          endTime: now,
          hoursWorked: hoursWorkedMinutes,
        })
        .where(
          and(
            eq(attendanceRecords.userId, ctx.user.id),
            eq(attendanceRecords.date, input.date)
          )
        );

      return {
        endTime: now,
        hoursWorked: Math.round(hoursWorkedMinutes / 60), // Convert to hours
      };
    }),

  /**
   * Manually set hours worked for a date
   */
  setHoursWorked: protectedProcedure
    .input(z.object({ date: z.string(), hours: z.number().min(0).max(24) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const hoursWorkedMinutes = Math.round(input.hours * 60);

      // Find or create record
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

      if (existing.length > 0) {
        await db
          .update(attendanceRecords)
          .set({ hoursWorked: hoursWorkedMinutes })
          .where(
            and(
              eq(attendanceRecords.userId, ctx.user.id),
              eq(attendanceRecords.date, input.date)
            )
          );
      } else {
        await db.insert(attendanceRecords).values({
          userId: ctx.user.id,
          date: input.date,
          status: "office",
          hoursWorked: hoursWorkedMinutes,
        });
      }

      return { hoursWorked: input.hours };
    }),

  /**
   * Get time tracking data for a date
   */
  getTimeTracking: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const records = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.userId, ctx.user.id),
            eq(attendanceRecords.date, input.date)
          )
        )
        .limit(1);

      if (records.length === 0) {
        return null;
      }

      const record = records[0];
      const hoursWorked = record.hoursWorked ? Math.round(record.hoursWorked / 60) : 0;

      return {
        startTime: record.startTime,
        endTime: record.endTime,
        hoursWorked,
      };
    }),
});
