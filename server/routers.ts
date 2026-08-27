import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { getMarketDashboardSnapshot, toPublicMarketDashboardSnapshot } from "./marketDashboard";
import { getLatestSmartScoreSnapshot, getSmartScoreDetail } from "./smartScoreDashboard";
import { runSmartScoreEvaluation } from "./smartScoreRunner";
import { getDiscoverSnapshot, getFundProfile, getFundUniverseSnapshot } from "./platformData";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { protectedProcedure } from "./_core/trpc";
import { addWorkspaceFund, createDecisionEntry, getWorkspace, removeWorkspaceFund, updateDecisionStatus } from "./workspace";
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
  platform: router({
    universe: publicProcedure.query(() => getFundUniverseSnapshot()),
    discover: publicProcedure.query(() => getDiscoverSnapshot()),
    profile: publicProcedure.input(z.object({ fundId: z.string().min(1).max(120) })).query(({ input }) => getFundProfile(input.fundId)),
  }),
  workspace: router({
    snapshot: protectedProcedure.query(({ctx})=>getWorkspace(ctx.user.openId)),
    addFund: protectedProcedure.input(z.object({fundId:z.string().min(1).max(120),listType:z.enum(["shortlist","watchlist","portfolio_candidate"]),note:z.string().max(1000).nullish()})).mutation(({ctx,input})=>addWorkspaceFund(ctx.user.openId,input.fundId,input.listType,input.note)),
    removeFund: protectedProcedure.input(z.object({id:z.string().uuid()})).mutation(({ctx,input})=>removeWorkspaceFund(ctx.user.openId,input.id)),
    addJournal: protectedProcedure.input(z.object({fundId:z.string().min(1).max(120).nullish(),title:z.string().min(1).max(180),thesis:z.string().max(4000).nullish(),risks:z.string().max(4000).nullish(),decisionStatus:z.enum(["researching","shortlisted","watching","rejected","archived"])})).mutation(({ctx,input})=>createDecisionEntry(ctx.user.openId,input)),
    updateJournalStatus: protectedProcedure.input(z.object({id:z.string().uuid(),status:z.enum(["researching","shortlisted","watching","rejected","archived"])})).mutation(({ctx,input})=>updateDecisionStatus(ctx.user.openId,input.id,input.status)),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
