import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { collectorStatus, emptyRecordsOutcome, matchEfgRecords, normalize, parseAbkFund, parseAfimFunds, parseAzimutFunds, parseBeltoneFunds, parseEbankMarketUpdates, parseHcSponsor, parseZaldiFund, chooseActualValuationDate, resolvePersistedValuationDate, parseCiCapitalFunds, parseEfgMutualFunds, parseFaisalMutualFunds, parseMubasherDailyArticle, parseMubasherFunds, parseNbkFundPage, parseNiCapitalFunds, parsePfiFunds, parseFabMisrEzdehar, parseScbFundRates, runFabMisrCollector, runBeltoneCollector, tallyWriteResult } from "./efgCollector";

describe("EFG mutual-fund parser", () => {
  it("extracts the official ABK-Egypt Equity Fund price and last-update date", () => {
    const html = readFileSync(new URL("./fixtures/abk-equity-fund.html", import.meta.url), "utf8");
    expect(parseAbkFund(html)).toEqual([{
      name: "ABK-Egypt Equity Fund",
      rawName: "ABK-Egypt Equity Fund",
      nav: 410.52,
      valuationDate: "2026-08-26",
      currency: "EGP",
    }]);
  });

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

  it("extracts all rows from the official CI Capital table, including rowspan continuation rows", () => {
    const html = readFileSync(new URL("./fixtures/ci-fundprice.html", import.meta.url), "utf8");
    const result = parseCiCapitalFunds(html);
    expect(result).toHaveLength(41);
    expect(result[1]).toMatchObject({ name: "CIB Money Market Fund (Ossoul)", nav: 1102.56, valuationDate: "2026-08-22" });
    expect(result).toContainEqual({ name: "Menthum Fixed Income Fund – USD", rawName: "Menthum Fixed Income Fund – USD", nav: 1.1116, valuationDate: "2026-08-22", currency: "EGP" });
  });

  it("selects the latest Mubasher article snapshot per fund", async () => {
    const home = '<a href="https://mubasherfunds.info/8483/article/latest">latest</a><a href="https://mubasherfunds.info/8483/article/older">older</a>';
    const latest = '<div>أسعار وثائق صناديق الاستثمار في الأسهم بتاريخ 25 أغسطس 2026</div><table><tr><td>أسهم مباشر</td><td>2.0182</td></tr></table>';
    const older = '<div>أسعار وثائق صناديق الاستثمار في الأسهم بتاريخ 24 أغسطس 2026</div><table><tr><td>أسهم مباشر</td><td>2.0351</td></tr></table>';
    vi.stubGlobal("fetch", vi.fn(async (url: string) => new Response(url.endsWith("latest") ? latest : url.endsWith("older") ? older : home, { status: 200 })));
    await expect(parseMubasherFunds(home)).resolves.toEqual([{
      name: "Mubasher Equity", rawName: "أسهم مباشر", nav: 2.0182, valuationDate: "2026-08-25", currency: "EGP",
    }]);
    vi.unstubAllGlobals();
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

  it("keeps B-Cobonat on its prior actual date when Beltone changes only the scheduled update date", () => {
    const firstRunHtml = `<div class="flex items-center justify-between w-full"><a><p>Beltone 2nd tranche &quot;B-Cobonat&quot; Fund</p></a><div><p>1.02</p><p>2026-07-16</p><p>2026-08-23</p><p>-</p></div></div>`;
    const secondRunHtml = firstRunHtml.replace("2026-08-23", "2026-08-30");
    const first = parseBeltoneFunds(firstRunHtml)[0];
    const second = parseBeltoneFunds(secondRunHtml)[0];
    expect(first).toMatchObject({ nav: 1.02, valuationDate: "2026-08-23" });
    expect(second).toMatchObject({ nav: 1.02, valuationDate: "2026-08-30" });
    expect(chooseActualValuationDate(second.valuationDate, first.valuationDate, "2026-08-26")).toBe("2026-08-23");
  });

  it("does not promote future HC and Zaldi dates when the NAV is unchanged", () => {
    const hc = parseHcSponsor(`<h3>FABMISR (Al Awal) Daily Cumulative Return Fund for Liquidity</h3><div>Price per certificate as of Date 540.95951 - 2026-08-29</div>`)[0];
    const zaldi = parseZaldiFund(`<h1>Zaldi Star _IC</h1><div>NAV/UNIT : 112.65609 EGP</div><div>Date: 30/8/2026</div>`)[0];
    expect(chooseActualValuationDate(hc.valuationDate, "2026-08-22", "2026-08-26")).toBe("2026-08-22");
    expect(chooseActualValuationDate(zaldi.valuationDate, "2026-08-26", "2026-08-26")).toBe("2026-08-26");
  });

  it("uses Azimut graph's latest actual NAV instead of future last_nav date", () => {
    const payload = JSON.stringify({ response: { funds: { dataList: [
      {
        name: "az- حالا",
        currency: { symbol: "EGP" },
        last_nav: { nav: 1.81142, date: "2026-08-30" },
        graph: [[Date.parse("2026-08-25T12:00:00Z"), 1.81055], [Date.parse("2026-08-30T12:00:00Z"), 1.81142]],
      },
    ] } } });
    expect(parseAzimutFunds(payload)).toEqual([{ name: "az- حالا", rawName: "az- حالا", nav: 1.81055, valuationDate: "2026-08-25", currency: "EGP" }]);
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

  it("extracts all four official Suez Canal Bank fund cards", () => {
    const html = readFileSync(new URL("./fixtures/scbank-fund-rates.html", import.meta.url), "utf8");
    expect(parseScbFundRates(html)).toEqual([
      { name: "صندوق استثمار بنك قناة السويس", rawName: "صندوق استثمار بنك قناة السويس", nav: 2043.56, valuationDate: "2026-08-20", currency: "EGP" },
      { name: "صندوق الأجيال", rawName: "صندوق الأجيال", nav: 73.96204, valuationDate: "2026-08-25", currency: "EGP" },
      { name: "صندوق استثمار العربية المصرية للتأمين", rawName: "صندوق استثمار العربية المصرية للتأمين", nav: 1376.56, valuationDate: "2026-08-20", currency: "EGP" },
      { name: "صندوق استثمار السويس اليومى", rawName: "صندوق استثمار السويس اليومى", nav: 25.41787, valuationDate: "2026-08-25", currency: "EGP" },
    ]);
  });

  it("extracts both official Faisal Islamic Bank mutual-fund cards", () => {
    const html = readFileSync(new URL("./fixtures/faisal-mutual-funds.html", import.meta.url), "utf8");
    expect(parseFaisalMutualFunds(html)).toEqual([
      { name: "صندوق أمان ذو العائد التراكمى", rawName: "صندوق أمان ذو العائد التراكمى", nav: 525.63, valuationDate: "2026-08-25", currency: "EGP" },
      { name: "صندوق إستثمار بنك فيصل الإسلامى المصرى ذو العائد الدورى", rawName: "صندوق إستثمار بنك فيصل الإسلامى المصرى ذو العائد الدورى", nav: 581.67, valuationDate: "2026-08-23", currency: "EGP" },
    ]);
  });

  it("extracts the current Mubasher daily article table", () => {
    const html = `<p>أسعار وثائق صناديق الاستثمار المصرية بتاريخ 25 أغسطس 2026</p><table><tr><td>24.54846</td><td>Al-Siola Fund-NI Capital</td></tr><tr><td>204.35979</td><td>Delta Life Assurance</td></tr><tr><td>18.969</td><td>GIG Money Market</td></tr></table>`;
    expect(parseMubasherDailyArticle(html)).toEqual([
      { name: "Al-Siola Fund-NI Capital", rawName: "Al-Siola Fund-NI Capital", nav: 24.54846, valuationDate: "2026-08-25", currency: "EGP" },
      { name: "Delta Life Assurance", rawName: "Delta Life Assurance", nav: 204.35979, valuationDate: "2026-08-25", currency: "EGP" },
      { name: "GIG Money Market", rawName: "GIG Money Market", nav: 18.969, valuationDate: "2026-08-25", currency: "EGP" },
    ]);
  });

  it("accepts a shortened Mubasher date and preserves USD table currency", () => {
    const html = `<p>أسعار وثائق صناديق الاستثمار في الأسهم العقارية بتاريخ 25 أغسطس.</p><table><tr><td>1.18033</td><td>Maksab OZ USD</td></tr></table><p>أسعار وثائق بالدولار 25 أغسطس 2026</p><table><tr><td>1.18033</td><td>Maksab OZ USD</td></tr></table>`;
    expect(parseMubasherDailyArticle(html)).toContainEqual({ name: "Maksab OZ USD", rawName: "Maksab OZ USD", nav: 1.18033, valuationDate: "2026-08-25", currency: "USD" });
  });

  it("extracts PFI funds and rejects future-dated rows", () => {
    const html = `<h2>GIG Equity Fund</h2><div>About NAV Per Certificate 1,387.99 26-08-2026</div><h2>GIG Money Market Fund</h2><div>About NAV Per Certificate 18.9972 29-08-2026</div>`;
    expect(parsePfiFunds(html)).toEqual([{
      name: "GIG Equity Fund", rawName: "GIG Equity Fund", nav: 1387.99, valuationDate: "2026-08-26", currency: "EGP",
    }]);
  });

  it("extracts NI Capital official funds and rejects future-dated rows", () => {
    const html = `<section>SAHMY FUND 26 August 2026 Certificate Price EGP 40.7555</section><section>SAHMY 70 FUND 26 August 2026 Certificate Price EGP 22.4184</section><section>15/30 Fixed Income Fund 29 August 2026 Certificate Price EGP 21.78483</section><section>MAKASEB 1st Tranche 29 August 2026 Certificate Price EGP 20.64864</section><section>MAKASEB 2nd Tranche 29 August 2026 Certificate Price EGP 20.60258</section><section>EDUCATION FOR LIFE 29 August 2026 Certificate Price EGP 200.417</section>`;
    expect(parseNiCapitalFunds(html)).toEqual([
      { name: "NI Capital (Sahmy Fund)", rawName: "SAHMY FUND", nav: 40.7555, valuationDate: "2026-08-26", currency: "EGP" },
      { name: "NI Capital EGX 70", rawName: "SAHMY 70 FUND", nav: 22.4184, valuationDate: "2026-08-26", currency: "EGP" },
    ]);
  });
  it("extracts official EBank fund prices and valuation dates", () => {
    const html = `<table><tr><td><strong>khabeer fund</strong><br>ICs price closing 20-08-2026</td><td>677.3</td></tr><tr><td><strong>Money market fund</strong><br>ICs price as at 26-08-2026</td><td>949.6679</td></tr><tr><td><strong>konooz fund</strong><br>ICs price closing 25-08-2026</td><td>873.2525</td></tr></table>`;
    expect(parseEbankMarketUpdates(html)).toEqual([
      { name: "Ebank Fund (El Khabeer)", rawName: "khabeer fund", nav: 677.3, valuationDate: "2026-08-20", currency: "EGP" },
      { name: "Ebank Fund II", rawName: "money market fund", nav: 949.6679, valuationDate: "2026-08-26", currency: "EGP" },
      { name: "Ebank Fund III (Konooz)", rawName: "konooz fund", nav: 873.2525, valuationDate: "2026-08-25", currency: "EGP" },
    ]);
  });

  it("extracts FAB Misr official Ezdehar NAV and valuation date", () => {
    const html = `<div>Ezdehar Fund (NAV)</div><table><tr><td>Date</td><td>22 August 2026</td></tr><tr><td>Currency (EGP)</td><td>472.6990</td></tr></table>`;
    expect(parseFabMisrEzdehar(html)).toEqual([{ name: "FAB Misr Fund (Ezdhar)", rawName: "Ezdehar Fund", nav: 472.699, valuationDate: "2026-08-22", currency: "EGP" }]);
  });
  it("rejects future-dated Azimut API rows while retaining current official NAV rows", () => {
    const payload = JSON.stringify({ response: { funds: { dataList: [
      { name: "az– استحقاق T27 USD", currency: { symbol: "USD" }, last_nav: { nav: 10.50287, date: "2026-08-25" } },
      { name: "az- حالا", currency: { symbol: "EGP" }, last_nav: { nav: 1.81142, date: "2026-08-30" } },
    ] } } });
    expect(parseAzimutFunds(payload)).toEqual([{ name: "az– استحقاق T27 USD", rawName: "az– استحقاق T27 USD", nav: 10.50287, valuationDate: "2026-08-25", currency: "USD" }]);
  });

  it("extracts an official NBK detail-page NAV and closing date", () => {
    const html = `<h1>Ishraq</h1><table><tr><th>Pricing</th><th>Closing date</th></tr><tr><td>EGP 69.92017</td><td>25/08/2026</td></tr></table><p>Ishraq Fund Unit Price</p>`;
    expect(parseNbkFundPage(html)).toEqual([{
      name: "Ishraq", rawName: "Ishraq", nav: 69.92017, valuationDate: "2026-08-25", currency: "EGP",
    }]);
  });

  it("returns no rows for unrelated markup", () => {
    expect(parseEfgMutualFunds("<html><body>No fund table</body></html>")).toEqual([]);
  });

  it("matches official CI Menthum and Banque Misr EUR names by exact aliases", () => {
    const funds = [
      { fund_id: "menthum", canonical_name: "Menthum", eima_name_raw: "Menthum", category: null, price_update_url: null },
      { fund_id: "misr-eur", canonical_name: "Misr Money Market (Euro)", eima_name_raw: "Misr Money Market (Euro)", category: null, price_update_url: null },
    ];
    const records = [
      { name: "Menthum Fixed Income Fund – USD", rawName: "Menthum Fixed Income Fund – USD", nav: 1.1116, valuationDate: "2026-08-22", currency: "EGP" },
      { name: "Banque Misr Money Market Fund (EUR)", rawName: "Banque Misr Money Market Fund (EUR)", nav: 11.94, valuationDate: "2026-08-22", currency: "EGP" },
    ];
    const result = matchEfgRecords(records, funds);
    expect(result.matched.map(({ fund }) => fund.fund_id)).toEqual(["menthum", "misr-eur"]);
    expect(result.unmatched).toEqual([]);
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

  it("resolves a future Beltone schedule end-to-end as unchanged against the prior actual snapshot", async () => {
    const html = `<div class="flex items-center justify-between w-full"><a><p>Beltone 2nd tranche &quot;B-Cobonat&quot; Fund</p></a><div><p>1.02</p><p>2026-07-16</p><p>2026-08-30</p><p>-</p></div></div>`;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "https://www.beltoneholding.com/business-line/asset-management-1") return new Response(html, { status: 200 });
      if (url.includes("/rest/v1/funds?")) return new Response(JSON.stringify([{ fund_id: "fund-b-cobonat", canonical_name: "Beltone 2nd tranche B-Cobonat Fund", eima_name_raw: null, category: "fixed income", price_update_url: "https://www.beltoneholding.com/business-line/asset-management-1" }]), { status: 200 });
      if (url.includes("/rest/v1/sources?")) return new Response(JSON.stringify([{ source_id: "source-beltone" }]), { status: 200 });
      if (url.includes("/rest/v1/fund_prices?") && url.includes("status=eq.validated")) return new Response(JSON.stringify([{ nav: 1.02, currency: "EGP", valuation_date: "2026-08-23" }]), { status: 200 });
      if (url.includes("/rest/v1/fund_prices?")) return new Response(JSON.stringify([{ id: "prior-b-cobonat", nav: 1.02 }]), { status: 200 });
      if (url.includes("/rest/v1/fund_prices") && init?.method === "POST") return new Response(null, { status: 204 });
      return new Response(JSON.stringify([]), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const summary = await runBeltoneCollector();
    expect(summary).toMatchObject({ status: "success", fetchedRecords: 1, matchedRecords: 1, inserted: 0, unchanged: 1, updated: 0, failed: [] });
    expect(fetchMock.mock.calls.some(([input, init]) => String(input).includes("/rest/v1/fund_prices") && init?.method === "POST")).toBe(false);
    vi.unstubAllGlobals();
  });

  it("resolves future scheduled dates only against the same NAV and currency", () => {
    const prior = [
      { nav: 1.02, currency: "EGP", valuation_date: "2026-08-23" },
      { nav: 1.02, currency: "EGP", valuation_date: "2026-08-26" },
      { nav: 1.02, currency: "USD", valuation_date: "2026-08-25" },
    ];
    expect(resolvePersistedValuationDate("2026-08-30", 1.02, "EGP", prior, "2026-08-26")).toBe("2026-08-26");
    expect(resolvePersistedValuationDate("2026-08-30", 1.03, "EGP", prior, "2026-08-26")).toBeNull();
    expect(resolvePersistedValuationDate("2026-08-25", 1.02, "EGP", prior, "2026-08-26")).toBe("2026-08-26");
  });

  it("counts a repeated identical snapshot as unchanged and preserves exact counters", () => {
    const firstRun = tallyWriteResult({ inserted: 0, unchanged: 0, updated: 0 }, "inserted");
    const secondRun = tallyWriteResult({ inserted: 0, unchanged: 0, updated: 0 }, "unchanged");
    expect(firstRun).toEqual({ inserted: 1, unchanged: 0, updated: 0 });
    expect(secondRun).toEqual({ inserted: 0, unchanged: 1, updated: 0 });
    expect(tallyWriteResult(firstRun, "unchanged")).toEqual({ inserted: 1, unchanged: 1, updated: 0 });
  });

  it("treats an empty weekly valuation as no-new-valuation, not a source failure", () => {
    expect(emptyRecordsOutcome("weekly")).toBe("no_new_valuation");
    expect(emptyRecordsOutcome("daily")).toBe("error");
    expect(emptyRecordsOutcome()).toBe("error");
  });

  it("classifies a recognized weekly page with no current valuation as successful no-new-valuation", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<div>Ezdehar Fund (NAV)</div>", { status: 200 })));
    await expect(runFabMisrCollector()).resolves.toMatchObject({ status: "success", outcome: "no_new_valuation", schedule: "weekly", fetchedRecords: 0 });
    vi.unstubAllGlobals();
  });

  it("keeps real FABMISR fetch and source-structure failures as errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("DNS unavailable"); }));
    await expect(runFabMisrCollector()).resolves.toMatchObject({ status: "failed", outcome: "error", fetchError: "DNS unavailable" });
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>changed markup</html>", { status: 200 })));
    await expect(runFabMisrCollector()).resolves.toMatchObject({ status: "failed", outcome: "error" });
    vi.unstubAllGlobals();
  });

  it("marks clean runs successful and incomplete runs partial", () => {
    expect(collectorStatus(0, 0)).toBe("success");
    expect(collectorStatus(1, 0)).toBe("partial");
    expect(collectorStatus(0, 1)).toBe("partial");
  });
});
