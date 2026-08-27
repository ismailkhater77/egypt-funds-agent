import { describe, expect, it } from "vitest";
import { buildFundUniverseCsv, filterUniverseItems, type UniverseFilters } from "./universeFilters";

const items = [
  { canonicalName: "Nile Equity", manager: "Nile AM", category: "Equity", fundType: "أسهم ومؤشرات", currency: "EGP", active: true, dataAvailability: "complete", naturalBenchmark: "EGX30", smartScore: 82, returns: { ytd: 12, "1y": 16 } },
  { canonicalName: "Nile Treasury", manager: "Nile AM", category: "Income", fundType: "دخل ثابت", currency: "EGP", active: true, dataAvailability: "partial", naturalBenchmark: "TBILLS", smartScore: 70, returns: { ytd: 8, "1y": null } },
  { canonicalName: "Dollar Shield", manager: "Harbor AM", category: "Income", fundType: "دخل ثابت", currency: "USD", active: false, dataAvailability: "limited", naturalBenchmark: "USD", smartScore: 65, returns: { ytd: null, "1y": 5 } },
];

const allFilters: UniverseFilters = { search: "", category: "__all__", manager: "__all__", fundType: "__all__", currency: "__all__", activeStatus: "all", availability: "__all__", period: "all", criterion: null };

describe("filterUniverseItems", () => {
  it("applies every selected field with AND semantics", () => {
    const result = filterUniverseItems(items, { ...allFilters, search: "nile", fundType: "دخل ثابت", activeStatus: "active", period: "ytd" });
    expect(result).toEqual([items[1]]);
  });

  it("requires a stored return for a selected performance period and never supplies a fallback", () => {
    expect(filterUniverseItems(items, { ...allFilters, period: "1y" })).toEqual([items[0], items[2]]);
  });

  it("filters the stored natural benchmark and category leader criteria deterministically", () => {
    expect(filterUniverseItems(items, { ...allFilters, criterion: "tbills" })).toEqual([items[1]]);
    expect(filterUniverseItems(items, { ...allFilters, criterion: "best_category" })).toEqual([items[0], items[1]]);
  });

  it("exports only the supplied current result rows with escaped CSV values", () => {
    const csv = buildFundUniverseCsv([{ ...items[0], canonicalName: 'Nile "Equity"' }]);
    expect(csv).toContain('"Nile ""Equity"""');
    expect(csv.split("\r\n")).toHaveLength(2);
  });
});
