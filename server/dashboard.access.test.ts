import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const anonymousContext: TrpcContext = {
  user: null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

describe("dashboard.snapshot access", () => {
  it("rejects an anonymous caller before any market or fund data can be read", async () => {
    const caller = appRouter.createCaller(anonymousContext);
    await expect(caller.dashboard.snapshot()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
