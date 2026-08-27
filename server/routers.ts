import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { getMarketDashboardSnapshot, toPublicMarketDashboardSnapshot } from "./marketDashboard";
import { getLatestSmartScoreSnapshot, getSmartScoreDetail } from "./smartScoreDashboard";
import { runSmartScoreEvaluation } from "./smartScoreRunner";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

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

  dashboard: router({
    publicSnapshot: publicProcedure.query(async () => toPublicMarketDashboardSnapshot(await getMarketDashboardSnapshot())),
    snapshot: adminProcedure.query(() => getMarketDashboardSnapshot()),
  }),

  smartScore: router({
    latest: publicProcedure.query(() => getLatestSmartScoreSnapshot()),
    detail: publicProcedure.input(z.object({ fundId: z.string().min(1).max(120) })).query(({ input }) => getSmartScoreDetail(input.fundId)),
    run: adminProcedure.mutation(async () => runSmartScoreEvaluation()),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
