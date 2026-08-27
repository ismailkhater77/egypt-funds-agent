import { afterEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const standardUserContext: TrpcContext = {
  user: { id: 2, openId:"workspace-owner", name:"Workspace Owner", email:"owner@example.com", loginMethod:"manus", role:"user", createdAt:new Date(), updatedAt:new Date(), lastSignedIn:new Date() },
  req: { protocol:"https", headers:{} } as TrpcContext["req"], res: {} as TrpcContext["res"],
};

afterEach(() => vi.unstubAllGlobals());

describe("workspace ownership isolation", () => {
  it("derives the list owner from the authenticated context rather than client input", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => new Response(JSON.stringify([{id:"11111111-1111-4111-8111-111111111111"}]), {status:201}));
    vi.stubGlobal("fetch", fetchMock);
    const caller = appRouter.createCaller(standardUserContext);
    await caller.workspace.addFund({fundId:"fund_catalog_a",listType:"watchlist",note:"Evidence review"});
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("on_conflict=owner_open_id,fund_id,list_type");
    expect(JSON.parse(String(init.body))).toMatchObject({owner_open_id:"workspace-owner",fund_id:"fund_catalog_a",list_type:"watchlist"});
  });

  it("scopes deletions to the authenticated owner", async () => {
    const fetchMock = vi.fn(async () => new Response(null, {status:204})); vi.stubGlobal("fetch", fetchMock);
    const caller = appRouter.createCaller(standardUserContext);
    await caller.workspace.removeFund({id:"11111111-1111-4111-8111-111111111111"});
    expect(fetchMock.mock.calls[0]?.[0]).toContain("owner_open_id=eq.workspace-owner");
  });

  it("rejects malformed IDs before reaching persistence", async () => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch",fetchMock);
    const caller = appRouter.createCaller(standardUserContext);
    await expect(caller.workspace.removeFund({id:"not-a-uuid"})).rejects.toMatchObject({code:"BAD_REQUEST"});
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
