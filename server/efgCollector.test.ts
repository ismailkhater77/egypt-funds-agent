import { describe, expect, it, vi } from "vitest";
import { collectorStatus, matchEfgRecords, normalize, parseAfimFunds, parseBeltoneFunds, parseEfgMutualFunds, tallyWriteResult } from "./efgCollector";

describe("EFG mutual-fund parser", () => {
  it("extracts a validated fund snapshot from the EFG data payload", () => {
    const html = `<table><tbody><tr><td data-before="Conventional Equity Funds"><a href="/en/our-services/mutual-funds/EFG-Hermes-EQ">EFG Hermes Equity Fund</a></td><td data-before="IC Price">118.84</td><td data-before="As of Date">24/08/2026</td></tr></tbody></table>`;
    const result = parseEfgMutualFunds(html);
    expect(result).toEqual([
      {
        name: "EFG Hermes Equity Fund",
        rawName: "EFG Hermes Equity Fund",
        nav: 118.84,
        valuationDate: "2026-08-24",
        currency: "EGP",
      },
    ]);
  });

  it("extracts Beltone price and last-update date from a fund-sheet row", () => {
    const html = `<div class="flex items-center justify-between w-full"><a class="underline"><p>MID Bank Fund 2</p></a><div class="w-[879px]"><p>1026.37</p><p>2005-07-01</p><p>2026-08-23</p><p>19.32%</p></div></div>`;
    expect(parseBeltoneFunds(html)).toEqual([{
      name: "MID Bank Fund 2",
      rawName: "MID Bank Fund 2",
      nav: 1026.37,
      valuationDate: "2026-08-23",
      currency: "EGP",
    }]);
  });

  it("extracts AFIM price and valuation date from the detail page", async () => {
    const listing = `<a href="/public/index.php/get-service/713"><div class="info text-center"><p>الصندوق الرابع – نقدى</p></div><div class="fundPrice"><span>304.2 جنيه</span></div></a>`;
    const detail = `<div>التاريخ:<span> 8/25/2026 </span></div><div>سعر الوثيقة:<span>304.15366 جنيه</span></div>`;
    const fetchMock = vi.fn(async (url: string) => new Response(url.includes("get-service") ? detail : listing, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(parseAfimFunds(listing)).resolves.toEqual([{
      name: "الصندوق الرابع – نقدى",
      rawName: "الصندوق الرابع – نقدى",
      nav: 304.15366,
      valuationDate: "2026-08-25",
      currency: "EGP",
    }]);
    vi.unstubAllGlobals();
  });

  it("returns no rows for unrelated markup", () => {
    expect(parseEfgMutualFunds("<html><body>No fund table</body></html>")).toEqual([]);
  });

  it("matches canonical and raw EIMA names and reports unmatched rows", () => {
    const funds = [
      { fund_id: "f1", canonical_name: "EFG Hermes Equity Fund", eima_name_raw: "Hermes Equity", category: null, price_update_url: null },
    ];
    const records = [
      { name: "EFG Hermes Equity Fund", rawName: "EFG Hermes Equity Fund", nav: 118.84, valuationDate: "2026-08-24", currency: "EGP" },
      { name: "Unknown Fund", rawName: "Unknown Fund", nav: 10, valuationDate: "2026-08-24", currency: "EGP" },
    ];
    const result = matchEfgRecords(records, funds);
    expect(result.matched).toHaveLength(1);
    expect(result.unmatched).toEqual(["Unknown Fund"]);
    expect(normalize(" EFG-Hermes Equity Fund ")).toBe("efg hermes equity fund");
  });

  it("counts a repeated identical snapshot as unchanged and preserves exact counters", () => {
    const firstRun = tallyWriteResult({ inserted: 0, unchanged: 0, updated: 0 }, "inserted");
    const secondRun = tallyWriteResult({ inserted: 0, unchanged: 0, updated: 0 }, "unchanged");
    expect(firstRun).toEqual({ inserted: 1, unchanged: 0, updated: 0 });
    expect(secondRun).toEqual({ inserted: 0, unchanged: 1, updated: 0 });
    expect(tallyWriteResult(firstRun, "unchanged")).toEqual({ inserted: 1, unchanged: 1, updated: 0 });
  });

  it("marks clean runs successful and incomplete runs partial", () => {
    expect(collectorStatus(0, 0)).toBe("success");
    expect(collectorStatus(1, 0)).toBe("partial");
    expect(collectorStatus(0, 1)).toBe("partial");
  });
});
