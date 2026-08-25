import { describe, expect, it } from "vitest";
import { collectorStatus, matchEfgRecords, normalize, parseEfgMutualFunds } from "./efgCollector";

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

  it("marks clean runs successful and incomplete runs partial", () => {
    expect(collectorStatus(0, 0)).toBe("success");
    expect(collectorStatus(1, 0)).toBe("partial");
    expect(collectorStatus(0, 1)).toBe("partial");
  });
});
