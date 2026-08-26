import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { collectorStatus, matchEfgRecords, normalize, parseAbkFund, parseAfimFunds, parseBeltoneFunds, parseCiCapitalFunds, parseEfgMutualFunds, parseFaisalMutualFunds, parseMubasherDailyArticle, parseMubasherFunds, parseNbkFundPage, parseNiCapitalFunds, parsePfiFunds, parseFabMisrEzdehar, parseScbFundRates, tallyWriteResult } from "./efgCollector";

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
  it("extracts FAB Misr official Ezdehar NAV and valuation date", () => {
    const html = `<div>Ezdehar Fund (NAV)</div><table><tr><td>Date</td><td>22 August 2026</td></tr><tr><td>Currency (EGP)</td><td>472.6990</td></tr></table>`;
    expect(parseFabMisrEzdehar(html)).toEqual([{ name: "FAB Misr Fund (Ezdhar)", rawName: "Ezdehar Fund", nav: 472.699, valuationDate: "2026-08-22", currency: "EGP" }]);
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
