import { describe, expect, it } from "vitest";

describe("GoldAPI free credential", () => {
  it.each(["XAU/USD", "XAG/USD"])("authenticates a %s spot request without exposing the key", async pair => {
    const apiKey = process.env.GOLDAPI_API_KEY;
    expect(apiKey, "GOLDAPI_API_KEY must be configured").toBeTruthy();

    const response = await fetch(`https://www.goldapi.io/api/${pair}`, {
      headers: { "x-access-token": apiKey ?? "", Accept: "application/json" },
    });
    const payload = (await response.json().catch(() => null)) as { price?: unknown; error?: unknown } | null;

    expect(response.ok, `GoldAPI request failed with HTTP ${response.status}`).toBe(true);
    expect(typeof payload?.price).toBe("number");
    expect(Number.isFinite(payload?.price as number)).toBe(true);
    expect(payload?.price as number).toBeGreaterThan(0);
  }, 15_000);
});
