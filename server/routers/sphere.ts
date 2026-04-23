import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createSphere,
  getUserSphere,
  joinSphere,
  getSphereMembersWithAttendance,
  getSphereById,
  leaveSphere,
} from "../sphereDb";
import { getAttendanceRecords } from "../db";

// Get today's date in YYYY-MM-DD format
function getTodayString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export const sphereRouter = router({
  /**
   * Create a new sphere (one per user)
   */
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      const sphere = await createSphere(ctx.user.id, input.name);
      if (!sphere) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create sphere",
        });
      }
      return sphere;
    }),

  /**
   * Get user's sphere (if they own one)
   */
  getOwn: protectedProcedure.query(async ({ ctx }) => {
    return getUserSphere(ctx.user.id);
  }),

  /**
   * Join a sphere via code
   */
  join: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sphere = await joinSphere(ctx.user.id, input.code);
      if (!sphere) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sphere not found",
        });
      }
      return sphere;
    }),

  /**
   * Get sphere members with today's attendance and location
   */
  getMembers: protectedProcedure
    .input(z.object({ sphereId: z.number() }))
    .query(async ({ ctx, input }) => {
      const sphere = await getSphereById(input.sphereId);
      if (!sphere) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sphere not found",
        });
      }

      // Get all members
      const members = await getSphereMembersWithAttendance(input.sphereId, getTodayString());

      // Get today's attendance for all members
      const today = getTodayString();
      const attendanceRecords = await getAttendanceRecords(ctx.user.id, today, today);

      // Map members with their attendance
      const membersWithAttendance = await Promise.all(
        members.map(async (member) => {
          const records = await getAttendanceRecords(member.id, today, today);
          const todayRecord = records[0];
          return {
            ...member,
            status: todayRecord?.status || null,
            location: todayRecord?.location || null,
          };
        })
      );

      return membersWithAttendance;
    }),

  /**
   * Leave a sphere
   */
  leave: protectedProcedure
    .input(z.object({ sphereId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await leaveSphere(ctx.user.id, input.sphereId);
      return result;
    }),
});
