import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { pushSubscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const notificationsRouter = router({
  /**
   * Subscribe device to push notifications
   */
  subscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
        auth: z.string(),
        p256dh: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        // Check if subscription already exists
        const existing = await db
          .select()
          .from(pushSubscriptions)
          .where(eq(pushSubscriptions.endpoint, input.endpoint))
          .limit(1);

        if (existing.length > 0) {
          // Update existing subscription
          await db
            .update(pushSubscriptions)
            .set({
              auth: input.auth,
              p256dh: input.p256dh,
            })
            .where(eq(pushSubscriptions.endpoint, input.endpoint));
        } else {
          // Create new subscription
          await db.insert(pushSubscriptions).values({
            userId: ctx.user.id,
            endpoint: input.endpoint,
            auth: input.auth,
            p256dh: input.p256dh,
          });
        }

        return { success: true, message: "Subscription saved" };
      } catch (error) {
        console.error("[notifications.subscribe] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save subscription",
        });
      }
    }),

  /**
   * Unsubscribe device from push notifications
   */
  unsubscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        // Delete subscription
        await db
          .delete(pushSubscriptions)
          .where(eq(pushSubscriptions.endpoint, input.endpoint));

        return { success: true, message: "Unsubscribed" };
      } catch (error) {
        console.error("[notifications.unsubscribe] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to unsubscribe",
        });
      }
    }),

  /**
   * Get user's push subscriptions
   */
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    try {
      const subs = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, ctx.user.id));

      return subs;
    } catch (error) {
      console.error("[notifications.getSubscriptions] Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch subscriptions",
      });
    }
  }),

  /**
   * Check if notifications are enabled for user
   */
  isEnabled: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    try {
      const subs = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, ctx.user.id))
        .limit(1);

      return subs.length > 0;
    } catch (error) {
      console.error("[notifications.isEnabled] Error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to check notification status",
      });
    }
  }),
});
