import { describe, expect, it } from "vitest";

describe("Gold API free spot endpoints", () => {
  it.each(["XAU/USD", "XAG/USD"])("reads a %s spot price without credentials", async pair => {
    const response = await fetch(`https://api.gold-api.com/price/${pair}`, { headers: { Accept: "application/json" } });
    const payload = (await response.json().catch(() => null)) as { price?: unknown; symbol?: unknown; currency?: unknown; updatedAt?: unknown } | null;
    expect(response.ok, `Gold API request failed with HTTP ${response.status}`).toBe(true);
    expect(payload?.symbol).toBe(pair.split("/")[0]);
    expect(payload?.currency).toBe("USD");
    expect(typeof payload?.price).toBe("number");
    expect(Number.isFinite(payload?.price as number)).toBe(true);
    expect(payload?.price as number).toBeGreaterThan(0);
    expect(typeof payload?.updatedAt).toBe("string");
  }, 15_000);
});
