import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { attendanceRouter } from "./routers/attendance";
import { profileRouter } from "./routers/profile";
import { publicRouter } from "./routers/public";
import { reportsRouter } from "./routers/reports";
import { aiRouter } from "./routers/ai";
import { timeTrackingRouter } from "./routers/timeTracking";
import { notificationsRouter } from "./routers/notifications";
import { sphereRouter } from "./routers/sphere";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  attendance: attendanceRouter,
  profile: profileRouter,
  public: publicRouter,
  reports: reportsRouter,
  ai: aiRouter,
  timeTracking: timeTrackingRouter,
  notifications: notificationsRouter,
  sphere: sphereRouter,
});

export type AppRouter = typeof appRouter;
