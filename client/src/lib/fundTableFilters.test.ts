import { describe, expect, it } from "vitest";
import { filterFundTableItems } from "./fundTableFilters";

const funds = [
  { canonical_name: "Nile Equity", category: "Equity", verified: true },
  { canonical_name: "Nile Income", category: "Fixed Income", verified: true },
  { canonical_name: "Aman Micro Finance", category: null, verified: false },
];

describe("filterFundTableItems", () => {
  it("combines case-insensitive name search with the chosen category", () => {
    expect(filterFundTableItems(funds, { query: "nile", category: "Equity", navStatus: "all" })).toEqual([funds[0]]);
  });

  it("returns only funds that await NAV when requested", () => {
    expect(filterFundTableItems(funds, { query: "", category: "all", navStatus: "missing" })).toEqual([funds[2]]);
  });

  it("does not turn an unmatched filter into a fallback result and honors the visible-row limit", () => {
    expect(filterFundTableItems(funds, { query: "absent", category: "all", navStatus: "all" })).toEqual([]);
    expect(filterFundTableItems(funds, { query: "", category: "all", navStatus: "verified", limit: 1 })).toEqual([funds[0]]);
  });
});
