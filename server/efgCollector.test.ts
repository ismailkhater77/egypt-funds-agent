import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { aggregateRunSummaries, buildActiveFundsQuery, collectorStatus, emptyRecordsOutcome, matchEfgRecords, normalize, parseAbkFund, parseAfimFunds, parseAlphaOdinFunds, parseAzimutFunds, parseBeltoneFunds, parseEbankMarketUpdates, parseHcSponsor, parseZaldiFund, chooseActualValuationDate, resolvePersistedValuationDate, parseCiCapitalFunds, parseEfgMutualFunds, parseFaisalMutualFunds, parseMubasherDailyArticle, parseMubasherFunds, parseNbkFundPage, parseNiCapitalFunds, parsePfiFunds, parseFabMisrEzdehar, parseFabMisrAlAwal, parseAtonPharosFunds, parseSndukAuthorizedFunds, parseScbFundRates, parseCreditAgricoleThiqa, parseBdcAlWefak, runFabMisrCollector, runFabMisrAlAwalCollector, runSndukAuthorizedCollector, runBeltoneCollector, runHcCollector, runZaldiStarCollector, fetchFabMisrPage, selectDnsARecord, isCoverageEligibleSnapshot, selectLatestValidatedSnapshots, findSameSourceDuplicateGroups, tallyWriteResult, sndukAuthorizedFundSpecs, egyptBusinessDate } from "./efgCollector";

describe("EFG mutual-fund parser", () => {
  it("uses Cairo's calendar day during the post-midnight local window", () => {
    expect(egyptBusinessDate(new Date("2026-08-26T20:30:00.000Z"))).toBe("2026-08-26");
    expect(egyptBusinessDate(new Date("2026-08-26T22:30:00.000Z"))).toBe("2026-08-27");
  });

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

  it("extracts the official ABK-Egypt Money Market Fund price and last-update date", () => {
    const html = readFileSync(new URL("./fixtures/abk-money-market-fund.html", import.meta.url), "utf8");
    expect(parseAbkFund(html)).toEqual([{
      name: "ABK-Egypt Money Market Fund",
      rawName: "ABK-Egypt Money Market Fund",
      nav: 72.8897,
      valuationDate: "2026-08-26",
      currency: "EGP",
    }]);
  });

  it("extracts only exact, current Alpha Odin API records with their matching NAV dates and currencies", async () => {
    const api = JSON.stringify({ funds_all: [
      { id: 81, name: "Odin Equity Investment Fund in EGX-Listed Stocks (Trend) – First Issue", newprice: "1.23911", currentprice: "1.24156", currency: "EGP", status: 1 },
      { id: 38, name: "The Egyptian Arab Land Bank Investment Fund for Debt Instruments – Egyptian Accumulative Yield", newprice: "471.83603", currentprice: "470.75763", currency: "EGP", status: 1 },
      { id: 71, name: "Maksab-OZ Fixed Income Investment Fund - Second Edition (Euro)", newprice: "1.07862", currency: "EUR", status: 1 },
      { id: 45, name: "Maksab (OZ) Fixed Income Instruments Investment Fund – First Issue (USD)", newprice: "1.18012", currency: "$", status: 1 },
    ] });
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/81")) return new Response(JSON.stringify({ fundDetails: { status: 1, newprice: "1.23911", currency: "EGP" }, dates: ["2026-08-20T13:10:00.000Z", "2026-08-26T14:32:00.000Z"] }), { status: 200 });
      if (url.endsWith("/38")) return new Response(JSON.stringify({ fundDetails: { status: 1, newprice: "471.83603", currency: "EGP" }, dates: ["2026-08-20T12:17:00.000Z", "2026-08-26T13:54:00.000Z"] }), { status: 200 });
      if (url.endsWith("/45")) return new Response(JSON.stringify({ fundDetails: { status: 1, newprice: "1.18012", currency: "$" }, dates: ["2026-08-17T12:43:00.000Z", "2026-08-24T15:34:00.000Z"] }), { status: 200 });
      if (url.endsWith("/71")) return new Response(JSON.stringify({ fundDetails: { status: 1, newprice: "1.07862", currency: "EUR" }, dates: ["2026-08-17T14:37:00.000Z", "2026-08-24T14:15:00.000Z"] }), { status: 200 });
      throw new Error(`unexpected Alpha Odin detail URL: ${url}`);
    }));
    await expect(parseAlphaOdinFunds(api)).resolves.toEqual([
      { name: "Odin Trend", rawName: "Odin Equity Investment Fund in EGX-Listed Stocks (Trend) – First Issue", nav: 1.23911, valuationDate: "2026-08-26", currency: "EGP" },
      { name: "Egyptian Arab Land Bank Fund (Al Masry)", rawName: "The Egyptian Arab Land Bank Investment Fund for Debt Instruments – Egyptian Accumulative Yield", nav: 471.83603, valuationDate: "2026-08-26", currency: "EGP" },
      { name: "Maksab First Tranche USD $", rawName: "Maksab (OZ) Fixed Income Instruments Investment Fund – First Issue (USD)", nav: 1.18012, valuationDate: "2026-08-24", currency: "USD" },
      { name: "Maksab Second Tranche (Euro)", rawName: "Maksab-OZ Fixed Income Investment Fund - Second Edition (Euro)", nav: 1.07862, valuationDate: "2026-08-24", currency: "EUR" },
    ]);
    vi.unstubAllGlobals();
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
    const firstRunHtml = readFileSync(new URL("./fixtures/beltone-b-cobonat-2026-08-23.html", import.meta.url), "utf8");
    const secondRunHtml = readFileSync(new URL("./fixtures/beltone-b-cobonat-2026-08-30.html", import.meta.url), "utf8");
    const first = parseBeltoneFunds(firstRunHtml)[0];
    const second = parseBeltoneFunds(secondRunHtml)[0];
    expect(first).toMatchObject({ nav: 1.02, valuationDate: "2026-08-23" });
    expect(second).toMatchObject({ nav: 1.02, valuationDate: "2026-08-30" });
    expect(chooseActualValuationDate(second.valuationDate, first.valuationDate, "2026-08-26")).toBe("2026-08-23");
  });

  it("adds scheduled weekly observations in a combined collector summary", () => {
    const base = { startedAt: "2026-08-26T00:00:00.000Z", finishedAt: "2026-08-26T00:01:00.000Z", status: "success" as const, source: "official", parser: "parser", fetchedRecords: 1, matchedRecords: 1, matchedFundIds: ["fund-1"], inserted: 0, unchanged: 0, updated: 0, unmatched: [], failed: [] };
    const summary = aggregateRunSummaries([
      { ...base, runId: "first", scheduled: 1 },
      { ...base, runId: "second", scheduled: 2, matchedFundIds: ["fund-2"] },
    ]);
    expect(summary).toMatchObject({ status: "success", scheduled: 3, matchedFundIds: ["fund-1", "fund-2"] });
  });

  it("does not promote future HC and Zaldi dates when the NAV is unchanged", () => {
    const hc = parseHcSponsor(`<h3>FABMISR (Al Awal) Daily Cumulative Return Fund for Liquidity</h3><div>Price per certificate as of Date 540.95951 - 2026-08-29</div>`)[0];
    const zaldi = parseZaldiFund(`<h1>Zaldi Star _IC</h1><div>NAV/UNIT : 112.65609 EGP</div><div>Date: 30/8/2026</div>`)[0];
    expect(chooseActualValuationDate(hc.valuationDate, "2026-08-22", "2026-08-26")).toBe("2026-08-22");
    expect(chooseActualValuationDate(zaldi.valuationDate, "2026-08-26", "2026-08-26")).toBe("2026-08-26");
  });

  it("keeps all four provider regressions off future next-update dates", () => {
    const beltone = parseBeltoneFunds(`<div class="flex items-center justify-between w-full"><a><p>B-Cobonat</p></a><div><p>1.02</p><p>2005-07-01</p><p>2026-08-30</p></div></div>`)[0];
    const azimut = parseAzimutFunds(JSON.stringify({ response: { funds: { dataList: [{ name: "az- حالا", currency: { symbol: "EGP" }, last_nav: { nav: 1.81142, date: "2026-08-30" }, graph: [[Date.parse("2026-08-23T12:00:00Z"), 1.81142]] }] } } }))[0];
    const hc = parseHcSponsor(`<h3>FABMISR (Al Awal) Daily Cumulative Return Fund for Liquidity</h3><div>Price per certificate as of Date 540.95951 - 2026-08-29</div>`)[0];
    const zaldi = parseZaldiFund(`<h1>Zaldi Star _IC</h1><div>NAV/UNIT : 112.65609 EGP</div><div>Date: 30/8/2026</div>`)[0];
    expect(chooseActualValuationDate(beltone.valuationDate, "2026-08-23", "2026-08-26")).toBe("2026-08-23");
    expect(azimut).toMatchObject({ valuationDate: "2026-08-23", nav: 1.81142 });
    expect(chooseActualValuationDate(hc.valuationDate, "2026-08-22", "2026-08-26")).toBe("2026-08-22");
    expect(chooseActualValuationDate(zaldi.valuationDate, "2026-08-26", "2026-08-26")).toBe("2026-08-26");
  });

  it("rejects changed-NAV future dates for Beltone, HC, and Zaldi", () => {
    const beltone = parseBeltoneFunds(`<div class="flex items-center justify-between w-full"><a><p>B-Cobonat</p></a><div><p>1.03</p><p>2005-07-01</p><p>2026-08-30</p></div></div>`)[0];
    const hc = parseHcSponsor(`<h3>FABMISR (Al Awal) Daily Cumulative Return Fund for Liquidity</h3><div>Price per certificate as of Date 541.10000 - 2026-08-29</div>`)[0];
    const zaldi = parseZaldiFund(`<h1>Zaldi Star _IC</h1><div>NAV/UNIT : 113.00000 EGP</div><div>Date: 30/8/2026</div>`)[0];
    expect(resolvePersistedValuationDate(beltone.valuationDate, beltone.nav, beltone.currency, [{ nav: 1.02, currency: "EGP", valuation_date: "2026-08-23" }], "2026-08-26")).toBeNull();
    expect(resolvePersistedValuationDate(hc.valuationDate, hc.nav, hc.currency, [{ nav: 540.95951, currency: "EGP", valuation_date: "2026-08-22" }], "2026-08-26")).toBeNull();
    expect(resolvePersistedValuationDate(zaldi.valuationDate, zaldi.nav, zaldi.currency, [{ nav: 112.65609, currency: "EGP", valuation_date: "2026-08-26" }], "2026-08-26")).toBeNull();
  });

  it("rejects changed future HC and Zaldi snapshots before any database write", async () => {
    const hcHtml = `<div class="click_sponsor bank" data-id="1" data-slug="fabmisr"></div>`;
    const hcSponsor = `<h3>FABMISR (Al Awal) Daily Cumulative Return Fund for Liquidity</h3><div>Price per certificate as of Date 541.10000 - 2999-12-30</div>`;
    const zaldiHtml = `<h1>Zaldi Star _IC</h1><div>NAV/UNIT : 113.00000 EGP</div><div>Date: 30/12/2999</div>`;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("hc-si.com/Service/asset-management")) return new Response(hcHtml, { status: 200 });
      if (url.includes("hc-si.com/wp-admin/admin-ajax.php")) return new Response(hcSponsor, { status: 200 });
      if (url.includes("zaldi-capital.com/zaldi-star") || url.includes("zaldi-capital.com/zaldi-elmasry")) return new Response(zaldiHtml, { status: 200 });
      if (url.includes("/rest/v1/funds?")) return new Response(JSON.stringify([{ fund_id: "fund-future", canonical_name: url.includes("hc-si") ? "FABMISR (Al Awal) Daily Cumulative Return Fund for Liquidity" : "Zaldi Star", eima_name_raw: null, category: null, price_update_url: url.includes("hc-si") ? "https://www.hc-si.com/Service/asset-management#funds" : url.includes("zaldi-star") ? "https://zaldi-capital.com/zaldi-star/" : "https://zaldi-capital.com/zaldi-elmasry/" }]), { status: 200 });
      if (url.includes("/rest/v1/sources?")) return new Response(JSON.stringify([{ source_id: "source-future" }]), { status: 200 });
      if (url.includes("/rest/v1/fund_prices?") && url.includes("status=eq.validated")) return new Response(JSON.stringify([{ nav: url.includes("zaldi") ? 112.65609 : 540.95951, currency: "EGP", valuation_date: "2026-08-26" }]), { status: 200 });
      if (url.includes("/rest/v1/fund_prices") && (init?.method === "POST" || init?.method === "PATCH")) throw new Error(`unexpected write: ${url}`);
      return new Response(JSON.stringify([]), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const hcSummary = await runHcCollector();
    const zaldiSummary = await runZaldiStarCollector();
    expect(hcSummary.failed).toHaveLength(1);
    expect(zaldiSummary).toMatchObject({ status: "partial", outcome: "new_valuation" });
    expect(zaldiSummary.failed.length).toBeGreaterThanOrEqual(1);
    expect(fetchMock.mock.calls.some(([input, init]) => String(input).includes("/rest/v1/fund_prices") && (init?.method === "POST" || init?.method === "PATCH"))).toBe(false);
    vi.unstubAllGlobals();
  });

  it("uses Azimut graph's latest actual NAV instead of future last_nav date", () => {
    const payload = JSON.stringify({ response: { funds: { dataList: [
      {
        name: "az- حالا",
        currency: { symbol: "EGP" },
        last_nav: { nav: 1.81142, date: "2026-09-01" },
        graph: [[Date.parse("2026-08-25T12:00:00Z"), 1.81055]],
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

  it("extracts Credit Agricole Al Thiqa NAV with an explicit closing date", () => {
    const html = `<h2>Crédit Agricole Egypt Mutual Fund Number 4</h2><div>As of closing: 23 August 2026</div><div>IC Price: EGP 903.73</div><div>Updated every Sunday and Wednesday</div>`;
    expect(parseCreditAgricoleThiqa(html)).toEqual([{ name: "Crédit Agricole – Egypt Fund No.4 Balanced Fund (Al Thiqa)", rawName: "CAE Mutual Fund Number 4 – Al Thiqa", nav: 903.73, valuationDate: "2026-08-23", currency: "EGP" }]);
    expect(parseCreditAgricoleThiqa(html.replace("23 August 2026", "01 September 2026"))).toEqual([]);
  });

  it("extracts Banque du Caire Al Wefak NAV with the official update date", () => {
    const html = `<div>تم تحديث الأسعار بتاريخ 26-August-2026</div><table><tr><td>الوفاق</td><td>45.9061</td></tr></table>`;
    expect(parseBdcAlWefak(html)).toEqual([{ name: "Agriculural Bank of Egypt (Al Wefak)", rawName: "الوفاق", nav: 45.9061, valuationDate: "2026-08-26", currency: "EGP" }]);
    expect(parseBdcAlWefak(html.replace("26-August-2026", "01-September-2026"))).toEqual([]);
  });

  it("extracts the official Aton Pharos Fund I NAV from dated Arabic post text", () => {
    const html = `<div dir="auto">سعر وثيقة صندوق فاروس الأول ذو العائد التراكمي يوم الأربعاء الموافق ٢٦ أغسطس 2026</div><div dir="auto">EGP سعر الوثيقه  792.60</div><div>page modified 26-Aug-2026</div>`;
    expect(parseAtonPharosFunds(html)).toEqual([{
      name: "Pharos Fund I", rawName: "صندوق فاروس الأول ذو العائد التراكمي", nav: 792.6, valuationDate: "2026-08-26", currency: "EGP",
    }]);
  });

  it("restricts Snduk authorization to 15 exact records and parses its displayed Document Price date", async () => {
    expect(sndukAuthorizedFundSpecs).toHaveLength(15);
    expect(sndukAuthorizedFundSpecs.map((spec) => spec.canonicalName)).not.toContain("Aman Micro Finance");
    expect(sndukAuthorizedFundSpecs.map((spec) => spec.canonicalName)).not.toContain("Bank ABC Fund I");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(`<div>EGP&nbsp;447.56</div><div>Document Price - Last Updated: <span>8/1/26, 12:00 AM</span></div>`, { status: 200 })));
    await expect(parseSndukAuthorizedFunds("<html>directory</html>")).resolves.toEqual(expect.arrayContaining([{
      name: "Arope Insurance Misr Fund", rawName: "Arope Money Market Fund", nav: 447.56, valuationDate: "2026-08-01", currency: "EGP",
    }]));
    vi.unstubAllGlobals();
  });

  it("persists only the finite user-authorized Snduk allow-list with explicit external provenance", async () => {
    const detail = `<div>EGP&nbsp;447.56</div><div>Document Price - Last Updated: <span>8/1/26, 12:00 AM</span></div>`;
    const catalog = sndukAuthorizedFundSpecs.map((spec, index) => ({ fund_id: `snduk-${index}`, canonical_name: spec.canonicalName, eima_name_raw: null, category: null, price_update_url: null }));
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "https://snduk.com/eg/funds?lang=en") return new Response("<html>directory</html>", { status: 200 });
      if (url.startsWith("https://snduk.com/eg/funds/")) return new Response(detail, { status: 200 });
      if (url.includes("/rest/v1/funds?")) return new Response(JSON.stringify(catalog), { status: 200 });
      if (url.includes("/rest/v1/sources?")) return new Response(JSON.stringify([{ source_id: "src_snduk_authorized_22" }]), { status: 200 });
      if (url.includes("/rest/v1/fund_prices?")) return new Response(JSON.stringify([]), { status: 200 });
      if (url.endsWith("/rest/v1/fund_prices") && init?.method === "POST") return new Response(null, { status: 204 });
      return new Response(JSON.stringify([]), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const summary = await runSndukAuthorizedCollector();
    expect(summary).toMatchObject({ status: "success", fetchedRecords: 15, matchedRecords: 15, inserted: 15, unchanged: 0, failed: [] });
    const writes = fetchMock.mock.calls.filter(([input, init]) => String(input).endsWith("/rest/v1/fund_prices") && init?.method === "POST");
    expect(writes).toHaveLength(15);
    expect(JSON.parse(String(writes[0]?.[1]?.body))).toMatchObject({
      source_id: "src_snduk_authorized_22",
      status: "validated",
      raw_payload: { source_provenance: "user_authorized_external_snduk_limited_22" },
    });
    vi.unstubAllGlobals();
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
    const html = `<h2>GIG Equity Fund</h2><div>About NAV Per Certificate 1,387.99 26-08-2026</div><h2>GIG Money Market Fund</h2><div>About NAV Per Certificate 18.9972 01-09-2026</div>`;
    expect(parsePfiFunds(html)).toEqual([{
      name: "GIG Equity Fund", rawName: "GIG Equity Fund", nav: 1387.99, valuationDate: "2026-08-26", currency: "EGP",
    }]);
  });

  it("extracts NI Capital official funds and rejects future-dated rows", () => {
    const html = `<section>SIULA MONEY MARKET FUND 26 August 2026 Certificate Price EGP 24.55001</section><section>SAHMY FUND 26 August 2026 Certificate Price EGP 40.7555</section><section>SAHMY 70 FUND 26 August 2026 Certificate Price EGP 22.4184</section><section>15/30 Fixed Income Fund 01 September 2026 Certificate Price EGP 21.78483</section><section>MAKASEB 1st Tranche 01 September 2026 Certificate Price EGP 20.64864</section><section>MAKASEB 2nd Tranche 01 September 2026 Certificate Price EGP 20.60258</section><section>EDUCATION FOR LIFE 01 September 2026 Certificate Price EGP 200.417</section>`;
    expect(parseNiCapitalFunds(html)).toEqual([
      { name: "Siula Money Market", rawName: "SIULA MONEY MARKET FUND", nav: 24.55001, valuationDate: "2026-08-26", currency: "EGP" },
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
  it("extracts FAB Misr Al Awal NAV and explicit daily valuation date", () => {
    const html = readFileSync(new URL("./fixtures/fab-misr-al-awal.html", import.meta.url), "utf8");
    expect(parseFabMisrAlAwal(html)).toEqual([{
      name: "FABMISR (Al Awal) Daily Cumulative Return Fund for Liquidity",
      rawName: "Al Awal Fund",
      nav: 541.4604,
      valuationDate: "2026-08-24",
      currency: "EGP",
    }]);
  });
  it("preserves a future weekly FABMISR source date for scheduled review instead of discarding the official NAV", () => {
    const html = `<div>Ezdehar Fund (NAV)</div><table><tr><td>Date</td><td>01 September 2026</td></tr><tr><td>Currency (EGP)</td><td>480.1000</td></tr></table>`;
    expect(parseFabMisrEzdehar(html)).toEqual([{ name: "FAB Misr Fund (Ezdhar)", rawName: "Ezdehar Fund", nav: 480.1, valuationDate: "2026-09-01", currency: "EGP" }]);
  });
  it("persists FABMISR Al Awal as a daily validated snapshot under its independent official-bank source", async () => {
    const html = `<div>Al Awal Daily Money Market Fund (NAV)</div><table><tr><td>Date</td><td>24 August 2026</td></tr><tr><td>Currency (EGP)</td><td>541.46040</td></tr></table>`;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("fabmisr.com.eg/en/personal-banking/investments-funds/al-awal-fund")) return new Response(html, { status: 200 });
      if (url.includes("/rest/v1/funds?")) return new Response(JSON.stringify([{
        fund_id: "fab-al-awal",
        canonical_name: "FABMISR (Al Awal) Daily Cumulative Return Fund for Liquidity",
        eima_name_raw: "Fab Misr (Al Awal)",
        category: "Open End- Money Market Funds",
        price_update_url: "https://www.hc-si.com/Service/asset-management#funds",
      }]), { status: 200 });
      if (url.includes("/rest/v1/sources?")) return new Response(JSON.stringify([{ source_id: "src_fab_misr_al_awal" }]), { status: 200 });
      if (url.includes("/rest/v1/fund_prices?")) return new Response(JSON.stringify([]), { status: 200 });
      if (url.endsWith("/rest/v1/fund_prices") && init?.method === "POST") return new Response(null, { status: 204 });
      return new Response(JSON.stringify([]), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const summary = await runFabMisrAlAwalCollector();
    expect(summary).toMatchObject({ status: "success", schedule: "daily", fetchedRecords: 1, matchedRecords: 1, inserted: 1, scheduled: 0, failed: [] });
    const write = fetchMock.mock.calls.find(([input, init]) => String(input).endsWith("/rest/v1/fund_prices") && init?.method === "POST");
    expect(JSON.parse(String(write?.[1]?.body))).toMatchObject({
      fund_id: "fab-al-awal",
      source_id: "src_fab_misr_al_awal",
      nav: 541.4604,
      currency: "EGP",
      valuation_date: "2026-08-24",
      status: "validated",
      raw_payload: { observation_state: "validated_actual_or_resolved_date" },
    });
    vi.unstubAllGlobals();
  });
  it("accepts only valid IPv4 A records for the FABMISR DNS fallback", () => {
    expect(selectDnsARecord({ Answer: [{ type: 28, data: "2001:db8::1" }, { type: 1, data: "41.33.19.60" }] })).toBe("41.33.19.60");
    expect(selectDnsARecord({ Answer: [{ type: 1, data: "999.33.19.60" }] })).toBeNull();
    expect(selectDnsARecord({ Answer: [] })).toBeNull();
  });
  it("uses direct-IP DNS-over-HTTPS when local DNS cannot resolve both FABMISR and Cloudflare", async () => {
    const fetchImpl = vi.fn(async () => { throw new Error("getaddrinfo EAI_AGAIN"); });
    const fetchViaResolvedIpv4Impl = vi.fn(async (url: string, address: string) => {
      if (url.includes("cloudflare-dns.com")) {
        expect(address).toBe("1.1.1.1");
        return new Response(JSON.stringify({ Answer: [{ type: 1, data: "41.33.19.60" }] }), { status: 200 });
      }
      expect(url).toContain("fabmisr.com.eg/en/personal-banking/investments-funds/al-awal-fund");
      expect(address).toBe("41.33.19.60");
      return new Response("<div>Al Awal Daily Money Market Fund (NAV)</div>", { status: 200 });
    });
    await expect(fetchFabMisrPage("https://www.fabmisr.com.eg/en/personal-banking/investments-funds/al-awal-fund", { fetchImpl, fetchViaResolvedIpv4Impl })).resolves.toMatchObject({ status: 200 });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchViaResolvedIpv4Impl).toHaveBeenCalledTimes(2);
  });
  it("rejects future-dated Azimut API rows while retaining current official NAV rows", () => {
    const payload = JSON.stringify({ response: { funds: { dataList: [
      { name: "az– استحقاق T27 USD", currency: { symbol: "USD" }, last_nav: { nav: 10.50287, date: "2026-08-25" } },
      { name: "az- حالا", currency: { symbol: "EGP" }, last_nav: { nav: 1.81142, date: "2026-09-01" } },
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

  it("queries only active catalog funds for matched and match-all collectors", () => {
    const linked = new URL(`https://example.test${buildActiveFundsQuery("https://efgholding.com/en/our-services/mutual-funds")}`);
    const all = new URL(`https://example.test${buildActiveFundsQuery("https://abkegypt.com/Business/Treasury/Investments/Equity-Fund", true)}`);
    expect(linked.searchParams.get("active")).toBe("eq.true");
    expect(linked.searchParams.get("price_update_url")).toBe("eq.https://efgholding.com/en/our-services/mutual-funds");
    expect(all.searchParams.get("active")).toBe("eq.true");
    expect(all.searchParams.has("price_update_url")).toBe(false);
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

  it("maps the official Zaldi Star name only to the corrected money-market catalog identity", () => {
    const funds = [
      { fund_id: "zaldi-star-mm", canonical_name: "Zaldi Star (Money Market)", eima_name_raw: "Zaldi Star Equity", category: "Open End- Money Market Funds", price_update_url: "https://zaldi-capital.com/zaldi-star/" },
      { fund_id: "zaldi-star-equity", canonical_name: "Zaldi Star Equity", eima_name_raw: "Zaldi Star Equity", category: "Open End- Equity Funds", price_update_url: null },
    ];
    const records = [{ name: "Zaldi Star", rawName: "Zaldi Star", nav: 112.88191, valuationDate: "2026-08-30", currency: "EGP" }];
    const result = matchEfgRecords(records, funds);
    expect(result.matched.map(({ fund }) => fund.fund_id)).toEqual(["zaldi-star-mm"]);
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

  it("rejects a changed NAV when the only provider date is a future schedule", async () => {
    const html = `<div class="flex items-center justify-between w-full"><a><p>Beltone 2nd tranche &quot;B-Cobonat&quot; Fund</p></a><div><p>1.03</p><p>2026-07-16</p><p>2026-09-01</p><p>-</p></div></div>`;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "https://www.beltoneholding.com/business-line/asset-management-1") return new Response(html, { status: 200 });
      if (url.includes("/rest/v1/funds?")) return new Response(JSON.stringify([{ fund_id: "fund-b-cobonat", canonical_name: "Beltone 2nd tranche B-Cobonat Fund", eima_name_raw: null, category: "fixed income", price_update_url: "https://www.beltoneholding.com/business-line/asset-management-1" }]), { status: 200 });
      if (url.includes("/rest/v1/sources?")) return new Response(JSON.stringify([{ source_id: "source-beltone" }]), { status: 200 });
      if (url.includes("/rest/v1/fund_prices?") && url.includes("status=eq.validated")) return new Response(JSON.stringify([{ nav: 1.02, currency: "EGP", valuation_date: "2026-08-23" }]), { status: 200 });
      return new Response(JSON.stringify([]), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const summary = await runBeltoneCollector();
    expect(summary).toMatchObject({ status: "partial", fetchedRecords: 1, matchedRecords: 1, inserted: 0, unchanged: 0, updated: 0 });
    expect(summary.failed).toHaveLength(1);
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

  it("excludes scheduled weekly review observations from validated coverage", () => {
    expect(isCoverageEligibleSnapshot("review", "2026-08-29", "2026-08-26")).toBe(false);
    expect(isCoverageEligibleSnapshot("validated", "2026-08-29", "2026-08-26")).toBe(false);
    expect(isCoverageEligibleSnapshot("validated", "2026-08-22", "2026-08-26")).toBe(true);
  });

  it("excludes persisted scheduled review fixtures from latest-validated selection and source-date duplicate keys", () => {
    const rows = [
      { nav: 480.1, currency: "EGP", valuation_date: "2026-08-29", status: "review", source_id: "fab", fund_id: "ezdehar" },
      { nav: 472.699, currency: "EGP", valuation_date: "2026-08-22", status: "validated", source_id: "fab", fund_id: "ezdehar" },
    ];
    expect(selectLatestValidatedSnapshots(rows, "2026-08-26")).toEqual([rows[1]]);
    expect(rows.filter((row) => isCoverageEligibleSnapshot(row.status, row.valuation_date, "2026-08-26"))).toEqual([rows[1]]);
    expect(findSameSourceDuplicateGroups(rows)).toEqual([]);
  });

  it("keeps scheduled weekly review state separate while still flagging a true duplicate within that same state", () => {
    const scheduled = { fund_id: "ezdehar", source_id: "fab", valuation_date: "2026-08-29", status: "review" };
    const validated = { fund_id: "ezdehar", source_id: "fab", valuation_date: "2026-08-22", status: "validated" };
    expect(findSameSourceDuplicateGroups([scheduled, validated])).toEqual([]);
    expect(findSameSourceDuplicateGroups([scheduled, { ...scheduled }])).toEqual([{ key: "ezdehar|fab|2026-08-29|review", count: 2 }]);
  });

  it("classifies a recognized weekly page with no current valuation as successful no-new-valuation", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<div>Ezdehar Fund (NAV)</div>", { status: 200 })));
    await expect(runFabMisrCollector()).resolves.toMatchObject({ status: "success", outcome: "no_new_valuation", schedule: "weekly", fetchedRecords: 0 });
    vi.unstubAllGlobals();
  });

  it("stores a future-dated official weekly NAV as review without promoting it to validated", async () => {
    const html = `<div>Ezdehar Fund (NAV)</div><table><tr><td>Date</td><td>01 September 2026</td></tr><tr><td>Currency (EGP)</td><td>480.1000</td></tr></table>`;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/rest/v1/funds?")) return new Response(JSON.stringify([{ fund_id: "fab-ezdehar", canonical_name: "FAB Misr Fund (Ezdhar)", eima_name_raw: null, category: null, price_update_url: "https://www.fabmisr.com.eg/en/personal-banking/investments-funds/ezdehar-fund" }]), { status: 200 });
      if (url.includes("/rest/v1/sources?")) return new Response(JSON.stringify([{ source_id: "source-fab" }]), { status: 200 });
      if (url.includes("/rest/v1/fund_prices?")) return new Response(JSON.stringify([]), { status: 200 });
      if (url.endsWith("/rest/v1/fund_prices") && init?.method === "POST") return new Response(null, { status: 204 });
      if (url.includes("fabmisr.com.eg")) return new Response(html, { status: 200 });
      return new Response(JSON.stringify([]), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const summary = await runFabMisrCollector();
    expect(summary).toMatchObject({ status: "success", fetchedRecords: 1, matchedRecords: 1, inserted: 0, scheduled: 1, failed: [] });
    const write = fetchMock.mock.calls.find(([input, init]) => String(input).endsWith("/rest/v1/fund_prices") && init?.method === "POST");
    const payload = JSON.parse(String(write?.[1]?.body));
    expect(payload).toMatchObject({ valuation_date: "2026-09-01", status: "review", raw_payload: { observation_state: "scheduled_weekly" } });
    vi.unstubAllGlobals();
  });

  it("promotes an unchanged weekly review observation to validated after its displayed date becomes current", async () => {
    const html = `<div>Ezdehar Fund (NAV)</div><table><tr><td>Date</td><td>22 August 2026</td></tr><tr><td>Currency (EGP)</td><td>472.6990</td></tr></table>`;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/rest/v1/funds?")) return new Response(JSON.stringify([{ fund_id: "fab-ezdehar", canonical_name: "FAB Misr Fund (Ezdhar)", eima_name_raw: null, category: null, price_update_url: "https://www.fabmisr.com.eg/en/personal-banking/investments-funds/ezdehar-fund" }]), { status: 200 });
      if (url.includes("/rest/v1/sources?")) return new Response(JSON.stringify([{ source_id: "source-fab" }]), { status: 200 });
      if (url.includes("/rest/v1/fund_prices?") && url.includes("status=eq.validated")) return new Response(JSON.stringify([]), { status: 200 });
      if (url.includes("/rest/v1/fund_prices?")) return new Response(JSON.stringify([{ id: "review-fab", nav: 472.699, status: "review" }]), { status: 200 });
      if (url.includes("/rest/v1/fund_prices?id=eq.review-fab") && init?.method === "PATCH") return new Response(null, { status: 204 });
      if (url.includes("fabmisr.com.eg")) return new Response(html, { status: 200 });
      return new Response(JSON.stringify([]), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const summary = await runFabMisrCollector();
    expect(summary).toMatchObject({ status: "success", inserted: 0, updated: 1, scheduled: 0, failed: [] });
    const promote = fetchMock.mock.calls.find(([input, init]) => String(input).includes("/rest/v1/fund_prices?id=eq.review-fab") && init?.method === "PATCH");
    expect(JSON.parse(String(promote?.[1]?.body))).toMatchObject({ status: "validated", valuation_date: "2026-08-22" });
    vi.unstubAllGlobals();
  });

  it("keeps real FABMISR fetch and source-structure failures as errors", async () => {
    await expect(runFabMisrCollector(async () => { throw new Error("DNS unavailable"); })).resolves.toMatchObject({ status: "failed", outcome: "error", fetchError: expect.stringContaining("DNS unavailable") });
    await expect(runFabMisrCollector(async () => new Response("<html>changed markup</html>", { status: 200 }))).resolves.toMatchObject({ status: "failed", outcome: "error" });
  });

  it("marks clean runs successful and incomplete runs partial", () => {
    expect(collectorStatus(0, 0)).toBe("success");
    expect(collectorStatus(1, 0)).toBe("partial");
    expect(collectorStatus(0, 1)).toBe("partial");
  });
});
