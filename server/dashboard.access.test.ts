import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const anonymousContext: TrpcContext = {
  user: null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

const standardUserContext: TrpcContext = {
  ...anonymousContext,
  user: {
    id: 2,
    openId: "standard-user",
    name: "Standard User",
    email: "standard@example.com",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
};

describe("dashboard.snapshot access", () => {
  it("rejects an anonymous caller before any source health or agent data can be read", async () => {
    const caller = appRouter.createCaller(anonymousContext);
    await expect(caller.dashboard.snapshot()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("rejects a signed-in non-admin caller from the private source route", async () => {
    const caller = appRouter.createCaller(standardUserContext);
    await expect(caller.dashboard.snapshot()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
