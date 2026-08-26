import type { Request, Response as ExpressResponse } from "express";
import { readFileSync } from "node:fs";
import { request as httpsRequest } from "node:https";
import { rootCertificates } from "node:tls";
import { sdk } from "./_core/sdk";

const EFG_URL = "https://efgholding.com/en/our-services/mutual-funds";
const BELTONE_URL = "https://www.beltoneholding.com/business-line/asset-management-1";
const CI_URL = "https://www.cicapital.com/fundprice/";
const AFIM_URL = "https://www.afim.com.eg/public/index.php/investment";
const ZALDI_STAR_URL = "https://zaldi-capital.com/zaldi-star/";
const ZALDI_ELMASRY_URL = "https://zaldi-capital.com/zaldi-elmasry/";
const AZIMUT_SOURCE_URL = "https://azimut.eg/funds";
const AZIMUT_API_URL = "https://app.azimut.eg/api/fund/list?size=100&web=true";
const HC_SOURCE_URL = "https://www.hc-si.com/Service/asset-management#funds";
const HC_FETCH_URL = "https://www.hc-si.com/Service/asset-management";
const HC_AJAX_URL = "https://www.hc-si.com/wp-admin/admin-ajax.php";
const AAIM_SOURCE_URL = "https://aaim.com.eg/ar/what-we-offer/funds";
const AAIM_FETCH_URL = "https://aaim.com.eg/en/what-we-offer/funds";
const MUBASHER_SOURCE_URL = "https://mubasherfunds.info/";
const MUBASHER_DAILY_SOURCE_URL = "https://mubasherfunds.info/8479/article/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D9%88%D8%AB%D8%A7%D8%A6%D9%82-%D8%B5%D9%86%D8%A7%D8%AF%D9%8A%D9%82-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1-%D8%A7%D9%84%D9%85%D8%B5%D8%B1%D9%8A%D8%A9-25-%D8%A3%D8%BA%D8%B3%D8%B7%D8%B3-2026";
const MUBASHER_CATEGORY_SOURCE_URLS = [
  MUBASHER_DAILY_SOURCE_URL,
  "https://mubasherfunds.info/8481/article/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D9%88%D8%AB%D8%A7%D8%A6%D9%82-%D8%B5%D9%86%D8%A7%D8%AF%D9%8A%D9%82-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1-%D9%81%D9%8A-%D8%A7%D9%84%D8%A3%D8%B3%D9%87%D9%85-%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%B1%D9%8A%D8%A9-25-%D8%A3%D8%BA%D8%B3%D8%B7%D8%B3-2026",
  "https://mubasherfunds.info/8482/article/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D9%88%D8%AB%D8%A7%D8%A6%D9%82-%D8%B5%D9%86%D8%A7%D8%AF%D9%8A%D9%82-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1-%D8%A7%D9%84%D9%86%D9%82%D8%AF%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%AF%D8%AE%D9%84-%D8%A7%D9%84%D8%AB%D8%A7%D8%A8%D8%AA-25-%D8%A3%D8%BA%D8%B3%D8%B7%D8%B3-2026",
  "https://mubasherfunds.info/8483/article/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D9%88%D8%AB%D8%A7%D8%A6%D9%82-%D8%B5%D9%86%D8%A7%D8%AF%D9%8A%D9%82-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1-%D9%81%D9%8A-%D8%A7%D9%84%D8%A3%D8%B3%D9%87%D9%85-25-%D8%A3%D8%BA%D8%B3%D8%B7%D8%B3-2026",
  "https://mubasherfunds.info/8484/article/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D9%88%D8%AB%D8%A7%D8%A6%D9%82-%D8%B5%D9%86%D8%A7%D8%AF%D9%8A%D9%82-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1-%D8%A7%D9%84%D8%AF%D9%88%D9%84%D8%A7%D8%B1%D9%8A%D8%A9-25-%D8%A3%D8%BA%D8%B3%D8%B7%D8%B3-2026",
  "https://mubasherfunds.info/8487/article/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D9%88%D8%AB%D8%A7%D8%A6%D9%82-%D8%B5%D9%86%D8%A7%D8%AF%D9%8A%D9%82-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1-%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85%D9%8A%D8%A9-25-%D8%A3%D8%BA%D8%B3%D8%B7%D8%B3-2026",
] as const;
const SCB_SOURCE_URL = "https://scbank.com.eg/Ar/Fund_Rates.aspx";
const FAISAL_SOURCE_URL = "https://www.faisalbank.com.eg/ar/Retail/Mutual-Funds";
const PFI_SOURCE_URL = "https://pfi-am.com.eg/funds/";
const NI_CAPITAL_SOURCE_URL = "https://nicapital.com.eg/lines-of-business/asset-management/";
const FAB_MISR_EZDEHAR_SOURCE_URL = "https://www.fabmisr.com.eg/en/personal-banking/investments-funds/ezdehar-fund";
const ABK_SOURCE_URL = "https://www.abkegypt.com/Business/Treasury/Investments/Equity-Fund?r=2";
const NBK_SOURCE_URLS = [
  "https://www.nbk.com/egypt/financial-markets/investment/mutual-funds/ishraq.html",
  "https://www.nbk.com/egypt/financial-markets/investment/mutual-funds/namaa.html",
  "https://www.nbk.com/egypt/financial-markets/investment/mutual-funds/al-hayah.html",
  "https://www.nbk.com/egypt/financial-markets/investment/mutual-funds/mizan.html",
] as const;
const MUBASHER_PARSER_NAME = "mubasher_funds_daily_articles_v1";
const MUBASHER_DAILY_PARSER_NAME = "mubasher_daily_all_funds_article_v1";
const SCB_PARSER_NAME = "suez_canal_bank_fund_rates_v1";
const FAISAL_PARSER_NAME = "faisal_bank_mutual_funds_cards_v1";
const NBK_PARSER_NAME = "nbk_official_fund_detail_v1";
const PFI_PARSER_NAME = "pfi_official_funds_v1";
const NI_CAPITAL_PARSER_NAME = "ni_capital_official_funds_v1";
const FAB_MISR_PARSER_NAME = "fab_misr_official_ezdehar_v1";
const EFG_PARSER_NAME = "efg_html_table_v1";
const CI_PARSER_NAME = "ci_capital_fundprice_v1";
const AFIM_PARSER_NAME = "afim_detail_pages_v1";
const ZALDI_PARSER_NAME = "zaldi_detail_page_v1";
const AZIMUT_PARSER_NAME = "azimut_fund_api_v1";
const HC_PARSER_NAME = "hc_sponsor_ajax_v1";
const BELTONE_PARSER_NAME = "beltone_fund_sheet_v1";
const CI_INTERMEDIATE_CA = readFileSync(new URL("./certs/digicert-global-g2-tls-rsa-sha256-2020-ca1.pem", import.meta.url));

type EfgRecord = {
  name: string;
  nav: number;
  valuationDate: string;
  currency: string;
  rawName: string;
};

type FundRow = {
  fund_id: string;
  canonical_name: string;
  eima_name_raw: string | null;
  category: string | null;
  price_update_url: string | null;
};

export type RunSummary = {
  runId: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "success" | "partial" | "failed";
  outcome?: "new_valuation" | "no_new_valuation" | "error";
  schedule?: "daily" | "weekly";
  source: string;
  parser: string;
  fetchedRecords: number;
  matchedRecords: number;
  matchedFundIds: string[];
  inserted: number;
  unchanged: number;
  updated: number;
  unmatched: string[];
  failed: Array<{ name: string; error: string }>;
  fetchError?: string;
};

let lastRun: RunSummary | null = null;

export function normalize(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[()\[\]{}.,:\/\\\"'“”‘’]/g, " ")
    .replace(/[‐‑‒–—―-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDate(value: string): string {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) throw new Error(`Invalid EFG valuation date: ${value}`);
  return `${match[3]}-${match[2]}-${match[1]}`;
}
function parseEnglishDateStrict(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid English valuation date: ${value}`);
  return date.toISOString().slice(0, 10);
}

function parseLocalizedNumber(value: string): number {
  const arabicDigits = value.replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  return Number(arabicDigits.replace(/,/g, "").replace(/[^0-9.]/g, ""));
}

export function parseScbFundRates(html: string): EfgRecord[] {
  const text = html.replace(/\s+/g, " ");
  const definitions = [
    ["ctl00_ContentPlaceHolder1_Label1032", "ctl00_ContentPlaceHolder1_lblFund_Rate_Suez", "ctl00_ContentPlaceHolder1_lblFund_Date_Suez"],
    ["ctl00_ContentPlaceHolder1_Label1", "ctl00_ContentPlaceHolder1_lblFund_Rate_Agyal", "ctl00_ContentPlaceHolder1_lblFund_Date_Agyal"],
    ["ctl00_ContentPlaceHolder1_Label1033", "ctl00_ContentPlaceHolder1_lblFund_Rate_AMIG", "ctl00_ContentPlaceHolder1_lblFund_Date_AMIG"],
    ["ctl00_ContentPlaceHolder1_Label2", "ctl00_ContentPlaceHolder1_lblFund_Rate_Suez_Daily", "ctl00_ContentPlaceHolder1_lblFund_Date_Suez_Daily"],
  ] as const;
  const records: EfgRecord[] = [];
  for (const [nameId, rateId, dateId] of definitions) {
    const name = text.match(new RegExp(`id=["']${nameId}["'][\\s\\S]*?<font[^>]*>([^<]+)</font>`, "i"))?.[1]?.trim();
    const rawNav = text.match(new RegExp(`id=["']${rateId}["'][^>]*>[\\s\\S]*?<b>([^<]+)</b>`, "i"))?.[1];
    const rawDate = text.match(new RegExp(`id=["']${dateId}["'][^>]*>[\\s\\S]*?<b>(\\d{2}/\\d{2}/\\d{4})</b>`, "i"))?.[1];
    if (!name || !rawNav || !rawDate) continue;
    const nav = parseLocalizedNumber(rawNav);
    if (!Number.isFinite(nav) || nav < 0) continue;
    records.push({ name, rawName: name, nav, valuationDate: parseDate(rawDate), currency: "EGP" });
  }
  return records;
}

export function parseFaisalMutualFunds(html: string): EfgRecord[] {
  const records: EfgRecord[] = [];
  const cardPattern = new RegExp(`<div class="card-listing[\\s\\S]*?<h3[^>]*title="([^"]+)"[^>]*>[^<]*</h3>[\\s\\S]*?<h3[^>]*>\\s*([0-9.,]+)[\\s\\S]*?</h3>[\\s\\S]*?<span>(\\d{4}/\\d{2}/\\d{2})</span>`, "gi");
  for (const match of Array.from(html.matchAll(cardPattern))) {
    const name = stripTags(match[1] ?? "").trim();
    const nav = parseLocalizedNumber(match[2] ?? "");
    if (!name || !Number.isFinite(nav) || nav < 0) continue;
    records.push({ name, rawName: name, nav, valuationDate: (match[3] ?? "").replace(/\//g, "-"), currency: "EGP" });
  }
  return records;
}

export function parsePfiFunds(html: string): EfgRecord[] {
  const text = stripTags(html);
  const fundNames = ["GIG Money Market Fund", "GIG Equity Fund", "Mawared Money Market Fund", "PFI Cashi Money Market Fund"];
  const records: EfgRecord[] = [];
  for (const name of fundNames) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = text.match(new RegExp(`${escaped}.*?NAV Per Certificate\\s+([0-9.,]+)\\s+(\\d{2})-(\\d{2})-(\\d{4})`, "i"));
    if (!match) continue;
    const nav = parseLocalizedNumber(match[1]);
    const valuationDate = `${match[4]}-${match[3]}-${match[2]}`;
    if (!Number.isFinite(nav) || nav < 0 || valuationDate > new Date().toISOString().slice(0, 10)) continue;
    records.push({ name, rawName: name, nav, valuationDate, currency: "EGP" });
  }
  return records;
}

export function parseNiCapitalFunds(html: string): EfgRecord[] {
  const text = stripTags(html);
  const definitions = [
    ["SAHMY FUND", "NI Capital (Sahmy Fund)"],
    ["SAHMY 70 FUND", "NI Capital EGX 70"],
    ["15/30 Fixed Income Fund", "NI Capital 15/30"],
    ["MAKASEB 1st Tranche", "GIG Makaseb Fund First Tranche"],
    ["MAKASEB 2nd Tranche", "GIG Makaseb Fund Second Tranche"],
    ["EDUCATION FOR LIFE", "The charitable education Fund"],
  ] as const;
  const records: EfgRecord[] = [];
  for (const [publishedName, name] of definitions) {
    const escaped = publishedName.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");
    const match = text.match(new RegExp(`${escaped}\\s+(\\d{1,2}\\s+[A-Za-z]+\\s+\\d{4})\\s+Certificate Price\\s+(?:EGP\\s*)?([0-9.,]+)`, "i"));
    if (!match) continue;
    const date = parseEnglishDateStrict(match[1]);
    const nav = parseLocalizedNumber(match[2]);
    if (!Number.isFinite(nav) || nav < 0 || date > new Date().toISOString().slice(0, 10)) continue;
    records.push({ name, rawName: publishedName, nav, valuationDate: date, currency: "EGP" });
  }
  return records;
}
export function parseFabMisrEzdehar(html: string): EfgRecord[] {
  const text = stripTags(html);
  if (!/Ezdehar Fund \(NAV\)/i.test(text)) throw new Error("FABMISR parser did not recognize the Ezdehar NAV section");
  const match = text.match(/Ezdehar Fund \(NAV\)\s+Date\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})\s+Currency \(EGP\)\s+([0-9.,]+)/i);
  if (!match) return [];
  const nav = parseLocalizedNumber(match[2]);
  const valuationDate = parseEnglishDateStrict(match[1]);
  if (!Number.isFinite(nav) || nav < 0 || valuationDate > new Date().toISOString().slice(0, 10)) return [];
  return [{ name: "FAB Misr Fund (Ezdhar)", rawName: "Ezdehar Fund", nav, valuationDate, currency: "EGP" }];
}
export function parseNbkFundPage(html: string): EfgRecord[] {
  const title = html.match(/<h1[^>]*>\s*(Ishraq|Namaa|Al-Hayah|Al-Mizan)\s*<\/h1>/i)?.[1];
  const text = stripTags(html);
  const priceMatch = text.match(/EGP\s*([0-9.,]+)\s+(\d{2}\/\d{2}\/\d{4})/i);
  if (!title || !priceMatch) return [];
  const nav = parseLocalizedNumber(priceMatch[1]);
  if (!Number.isFinite(nav) || nav < 0) return [];
  return [{ name: title, rawName: title, nav, valuationDate: parseDate(priceMatch[2]), currency: "EGP" }];
}

export function parseEfgMutualFunds(html: string): EfgRecord[] {
  const records: EfgRecord[] = [];
  const rowPattern = /<tr\b[\s\S]*?<\/tr>/gi;
  const namePattern = /data-before=(["'])[^"']+\1[\s\S]*?<a\b[^>]*>([^<]+)<\/a>/i;
  const pricePattern = /data-before=(["'])IC Price\s*\1[\s\S]*?>([0-9]+(?:\.[0-9]+)?)<\/td>/i;
  const datePattern = /data-before=(["'])As of Date\1[\s\S]*?>(\d{2}\/\d{2}\/\d{4})<\/td>/i;
  for (const row of Array.from(html.matchAll(rowPattern))) {
    const rowHtml = row[0];
    const name = rowHtml.match(namePattern)?.[2]?.trim();
    const rawNav = rowHtml.match(pricePattern)?.[2];
    const rawDate = rowHtml.match(datePattern)?.[2];
    if (!name || !rawNav || !rawDate) continue;
    const nav = Number(rawNav);
    if (!Number.isFinite(nav) || nav < 0) continue;
    records.push({ name, rawName: name, nav, valuationDate: parseDate(rawDate), currency: "EGP" });
  }
  const unique = new Map<string, EfgRecord>();
  for (const record of records) unique.set(`${normalize(record.name)}|${record.valuationDate}`, record);
  return Array.from(unique.values());
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const baseUrl = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase ${response.status}: ${body.slice(0, 500)}`);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&amp;/gi, "&").replace(/&nbsp;/gi, " ").replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code))).replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16))).replace(/\s+/g, " ").trim();
}

function parseCiDate(html: string): string {
  const match = stripTags(html).match(/Last update:\s*\w+,\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
  if (!match) throw new Error("CI Capital page has no validated Last update date");
  const parsed = new Date(match[1]);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid CI valuation date: ${match[1]}`);
  return parsed.toISOString().slice(0, 10);
}

export function parseCiCapitalFunds(html: string): EfgRecord[] {
  const valuationDate = parseCiDate(html);
  const records: EfgRecord[] = [];
  const rowPattern = new RegExp(String.raw`<tr\b[\s\S]*?</tr>`, "gi");
  for (const match of Array.from(html.matchAll(rowPattern))) {
    const cellMatches = Array.from(match[0].matchAll(new RegExp(String.raw`<td\b[^>]*>([\s\S]*?)</td>`, "gi"))) as RegExpMatchArray[];
    const cells = cellMatches.map((cell) => stripTags(cell[1] ?? ""));
    if (cells.length < 2) continue;
    const name = cells.length >= 3 ? cells[1] : cells[0];
    const navText = cells.length >= 3 ? cells[2] : cells[1];
    const nav = Number(navText.replace(/,/g, ""));
    if (!name || !Number.isFinite(nav) || nav < 0 || !/[A-Za-z]/.test(name)) continue;
    records.push({ name, rawName: name, nav, valuationDate, currency: "EGP" });
  }
  const unique = new Map<string, EfgRecord>();
  for (const record of records) unique.set(`${normalize(record.name)}|${record.valuationDate}`, record);
  return Array.from(unique.values());
}

export async function parseAfimFunds(html: string): Promise<EfgRecord[]> {
  const records: EfgRecord[] = [];
  const cards = Array.from(html.matchAll(new RegExp(String.raw`<a\s+href="([^"]*get-service/\d+)"[\s\S]*?<div class="info text-center">\s*<p>([^<]+)</p>[\s\S]*?fundPrice[\s\S]*?<span>([0-9.,]+)\s*جنيه`, "gi")));
  for (const card of cards) {
    const detailUrl = new URL(card[1], AFIM_URL).href;
    const response = await fetch(detailUrl, { headers: { "User-Agent": "EgyptFundsPriceAgent/1.0" } });
    if (!response.ok) continue;
    const detail = stripTags(await response.text());
    const rawDate = detail.match(/التاريخ:\s*(\d{1,2}\/\d{1,2}\/\d{4})/)?.[1];
    const rawPrice = detail.match(/سعر الوثيقة:\s*([0-9.,]+)\s*جنيه/)?.[1];
    if (!rawDate || !rawPrice) continue;
    const [month, day, year] = rawDate.split("/").map(Number);
    const nav = Number(rawPrice.replace(/,/g, ""));
    if (!Number.isFinite(nav) || nav < 0) continue;
    records.push({ name: stripTags(card[2]), rawName: stripTags(card[2]), nav, valuationDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, currency: "EGP" });
  }
  const unique = new Map<string, EfgRecord>();
  for (const record of records) unique.set(`${normalize(record.name)}|${record.valuationDate}`, record);
  return Array.from(unique.values());
}

export function parseZaldiFund(html: string): EfgRecord[] {
  const text = stripTags(html);
  const name = text.match(/^\s*(Zaldi Star|Zaldi El Masry)\s+/i)?.[1] ?? text.match(/Investment\s+(Zaldi Star|Zaldi El Masry)/i)?.[1];
  const rawNav = text.match(/NAV\/UNIT\s*:\s*([0-9.,]+)\s*EGP/i)?.[1];
  const rawDate = text.match(/Date:\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i);
  if (!name || !rawNav || !rawDate) return [];
  const nav = Number(rawNav.replace(/,/g, ""));
  if (!Number.isFinite(nav) || nav < 0) return [];
  const [, day, month, year] = rawDate;
  return [{ name, rawName: name, nav, valuationDate: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`, currency: "EGP" }];
}

function parseEnglishDate(value: string): string | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

export function parseAaimFunds(html: string): EfgRecord[] {
  const records: EfgRecord[] = [];
  const cardPattern = new RegExp(String.raw`<a[^>]+href="([^"]*/funds/[^"]+)"[^>]*>([\s\S]*?)</a>`, "gi");
  for (const match of Array.from(html.matchAll(cardPattern))) {
    const rawCard = match[2] ?? "";
    const rawName = rawCard.match(/<h3 class="name[^>]*>\s*([^<]+?)\s*<\/h3>/i)?.[1];
    const rawNav = rawCard.match(/<div class="price">\s*([0-9.,]+)\s*<\/div>/i)?.[1];
    const rawCurrency = rawCard.match(/<div class="currency[^>]*>\s*([^<]+?)\s*<\/div>/i)?.[1];
    const rawDate = rawCard.match(/Last update\s+(\d{1,2}\s+[A-Za-z]+,\s+\d{4})/i)?.[1];
    const nav = Number(rawNav?.replace(/,/g, ""));
    const valuationDate = rawDate ? parseEnglishDate(rawDate) : null;
    if (!rawName || !rawCurrency || !Number.isFinite(nav) || nav < 0 || !valuationDate) continue;
    records.push({ name: rawName.trim(), rawName: rawName.trim(), nav, valuationDate, currency: rawCurrency.trim().toUpperCase() });
  }
  const unique = new Map<string, EfgRecord>();
  for (const record of records) unique.set(`${normalize(record.name)}|${record.valuationDate}`, record);
  return Array.from(unique.values());
}

export function parseAbkFund(html: string): EfgRecord[] {
  const text = stripTags(html);
  const match = text.match(/Today's ABK-Egypt Equity Fund Price:\s*Price\s+Last Update\s+([0-9.,]+)\s+(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (!match) return [];
  const nav = Number(match[1].replace(/,/g, ""));
  const date = match[2].split("/");
  if (!Number.isFinite(nav) || nav < 0 || date.length !== 3) return [];
  const [month, day, year] = date;
  return [{ name: "ABK-Egypt Equity Fund", rawName: "ABK-Egypt Equity Fund", nav, valuationDate: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`, currency: "EGP" }];
}

export function parseAzimutFunds(payload: string): EfgRecord[] {
  const parsed = JSON.parse(payload) as { response?: { funds?: { dataList?: Array<{ name?: string; currency?: { symbol?: string }; last_nav?: { nav?: number; date?: string } }> } } };
  const funds = parsed.response?.funds?.dataList ?? [];
  return funds.flatMap((fund) => {
    const nav = fund.last_nav?.nav;
    const date = fund.last_nav?.date;
    if (!fund.name || !Number.isFinite(nav) || (nav ?? 0) < 0 || !date) return [];
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return [];
    return [{ name: fund.name, rawName: fund.name, nav: nav as number, valuationDate: date, currency: (fund.currency?.symbol ?? "EGP").toUpperCase() }];
  });
}

export function parseHcSponsor(html: string): EfgRecord[] {
  const title = html.match(/<h3>\s*([^<]+?)\s*<\/h3>/i)?.[1]?.trim();
  const priceLine = stripTags(html).match(/Price per certificate as of Date\s*([0-9.,]+)\s*-\s*(\d{4}-\d{2}-\d{2})/i);
  if (!title || !priceLine) return [];
  const nav = Number(priceLine[1].replace(/,/g, ""));
  if (!Number.isFinite(nav) || nav < 0) return [];
  return [{ name: title, rawName: title, nav, valuationDate: priceLine[2], currency: "EGP" }];
}

export async function parseHcFunds(listingHtml: string): Promise<EfgRecord[]> {
  const links = Array.from(listingHtml.matchAll(/class="click_sponsor bank"[^>]*data-id="(\d+)"[^>]*data-slug="([^"]+)"/gi));
  const pages = await Promise.all(links.map(async ([, sponsorId, sponsorSlug]) => {
    const body = new URLSearchParams({ action: "sponsors_data_fn", sponsor_id: sponsorId, sponsor_slug: sponsorSlug });
    const response = await fetch(HC_AJAX_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "EgyptFundsPriceAgent/1.0" }, body });
    if (!response.ok) return "";
    return response.text();
  }));
  return pages.flatMap(parseHcSponsor);
}

const ARABIC_MONTHS: Record<string, string> = { يناير: "01", فبراير: "02", مارس: "03", أبريل: "04", مايو: "05", يونيو: "06", يوليو: "07", أغسطس: "08", سبتمبر: "09", أكتوبر: "10", نوفمبر: "11", ديسمبر: "12" };

function parseMubasherArticle(html: string): EfgRecord[] {
  const text = stripTags(html);
  const dateMatch = text.match(/بتاريخ\s+(\d{1,2})\s+(يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)\s+(\d{4})/);
  if (!dateMatch) return [];
  const valuationDate = `${dateMatch[3]}-${ARABIC_MONTHS[dateMatch[2]]}-${dateMatch[1].padStart(2, "0")}`;
  const records: EfgRecord[] = [];
  const rowPattern = new RegExp(String.raw`<tr\b[\s\S]*?</tr>`, "gi");
  const cellPattern = new RegExp(String.raw`<td\b[^>]*>([\s\S]*?)</td>`, "gi");
  for (const row of Array.from(html.matchAll(rowPattern))) {
    const cells = Array.from(row[0].matchAll(cellPattern)).map((m) => stripTags(m[1] ?? ""));
    if (cells.length < 2) continue;
    const nav = Number((cells[1] ?? "").replace(/,/g, "").replace(/[^0-9.]/g, ""));
    if (!cells[0] || !Number.isFinite(nav) || nav < 0) continue;
    const rawName = cells[0].trim();
    const mappedName = normalize(rawName) === normalize("أسهم مباشر") ? "Mubasher Equity" : normalize(rawName) === normalize("كاش مباشر") ? "Cash Mubasher" : normalize(rawName) === normalize("دهب مباشر") ? "Mubasher Gold" : rawName;
    records.push({ name: mappedName, rawName, nav, valuationDate, currency: "EGP" });
  }
  return records;
}

export function parseMubasherDailyArticle(html: string): EfgRecord[] {
  const text = stripTags(html);
  const dateMatch = text.match(/بتاريخ\s+(\d{1,2})\s+(يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)(?:\s+(\d{4}))?/);
  const year = dateMatch?.[3] ?? text.match(/25\s+أغسطس\s+(20\d{2})/)?.[1];
  if (!dateMatch || !year) return [];
  const valuationDate = `${year}-${ARABIC_MONTHS[dateMatch[2]]}-${dateMatch[1].padStart(2, "0")}`;
  const records: EfgRecord[] = [];
  const tablePattern = new RegExp(String.raw`<table\b[\s\S]*?</table>`, "gi");
  const cellPattern = new RegExp(String.raw`<td\b[^>]*>([\s\S]*?)</td>`, "gi");
  for (const table of Array.from(html.matchAll(tablePattern))) {
    const tableText = stripTags(table[0]);
    const tableStart = table.index ?? 0;
    const nearbyHeading = stripTags(html.slice(Math.max(0, tableStart - 500), tableStart));
    const currency = /بالدولار|السعر بالدولار/i.test(`${nearbyHeading} ${tableText}`) ? "USD" : "EGP";
    const rowPattern = new RegExp(String.raw`<tr\b[\s\S]*?</tr>`, "gi");
    for (const row of Array.from(table[0].matchAll(rowPattern))) {
      const cells = Array.from(row[0].matchAll(cellPattern)).map((m) => stripTags(m[1] ?? ""));
      if (cells.length < 2) continue;
      const numericCells = cells.map((cell) => {
        const cleaned = cell.replace(/,/g, "").replace(/[^0-9.]/g, "");
        return /\d/.test(cleaned) ? Number(cleaned) : Number.NaN;
      });
      const navIndex = numericCells.findIndex((value) => Number.isFinite(value) && value >= 0);
      if (navIndex < 0) continue;
      const nav = numericCells[navIndex];
      const rawName = cells[navIndex === 0 ? 1 : 0].trim();
      if (!rawName || /^(اسم الصندوق|الصندوق|سعر الوثيقة)/.test(rawName) || !/[A-Za-z\u0600-\u06FF]/.test(rawName)) continue;
      const mappedName = normalize(rawName) === normalize("أسهم مباشر") ? "Mubasher Equity" : normalize(rawName) === normalize("كاش مباشر") ? "Cash Mubasher" : normalize(rawName) === normalize("دهب مباشر") ? "Mubasher Gold" : rawName;
      records.push({ name: mappedName, rawName, nav, valuationDate, currency });
    }
  }
  return records;
}

export async function parseMubasherFunds(homeHtml: string): Promise<EfgRecord[]> {
  const linkPattern = new RegExp(String.raw`href=["'](https?://mubasherfunds\.info/\d+/article/[^"']+)["']`, "gi");
  const links = Array.from(homeHtml.matchAll(linkPattern)).map((m) => m[1]);
  const uniqueLinks = Array.from(new Set(links));
  const fetchArticle = async (url: string) => {
    const response = await fetch(url, { headers: { "User-Agent": "EgyptFundsPriceAgent/1.0", Accept: "text/html" } });
    return response.ok ? response.text() : "";
  };
  const firstArticles = await Promise.all(uniqueLinks.map(fetchArticle));
  const relatedLinks = firstArticles.flatMap((html) => Array.from(html.matchAll(linkPattern)).map((m) => m[1]));
  const allLinks = Array.from(new Set([...uniqueLinks, ...relatedLinks])).slice(0, 100);
  const articles = await Promise.all(allLinks.map(fetchArticle));
  const latestByFund = new Map<string, EfgRecord>();
  for (const article of articles.flatMap((html) => [...parseMubasherArticle(html), ...parseMubasherDailyArticle(html)])) {
    const key = normalize(article.name);
    const previous = latestByFund.get(key);
    if (!previous || article.valuationDate > previous.valuationDate) latestByFund.set(key, article);
  }
  return Array.from(latestByFund.values());
}

export function parseBeltoneFunds(html: string): EfgRecord[] {
  const records: EfgRecord[] = [];
  const rowPattern = new RegExp(String.raw`<div class="flex items-center justify-between w-full">([\s\S]*?)</div>\s*</div>`, "gi");
  const numberPattern = new RegExp(String.raw`<p[^>]*>\s*([^<]+?)\s*</p>`, "gi");
  for (const rowMatch of Array.from(html.matchAll(rowPattern))) {
    const rowHtml = rowMatch[1];
    const name = rowHtml.match(new RegExp(String.raw`<p[^>]*>\s*([^<]+?)\s*</p>`, "i"))?.[1]?.trim();
    const values = Array.from(rowHtml.matchAll(numberPattern)).map((m) => m[1].trim());
    const nav = Number(values[1]);
    const dates = values.filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value));
    const date = dates.at(-1);
    if (!name || !Number.isFinite(nav) || nav < 0 || !date) continue;
    records.push({ name, rawName: name, nav, valuationDate: date, currency: "EGP" });
  }
  const unique = new Map<string, EfgRecord>();
  for (const record of records) unique.set(`${normalize(record.name)}|${record.valuationDate}`, record);
  return Array.from(unique.values());
}

export function matchEfgRecords(records: EfgRecord[], funds: FundRow[]) {
  const byName = new Map<string, FundRow>();
  const providerAliases: Record<string, string> = {
    "mid bank fund 2": "mid bank fund ii",
    "abc mazaya": "bank abc fund mazaya",
    "banque du caire ii el kahera el yawmi": "banque du caire fund ii",
    "arab bank yomaty": "arab bank fund yomaty",
    "saib money market fund": "saib yaumy fund",
    "attijariwafa bank money market fund": "attijariwafa bankfund",
    "beltone 3rd tranche b yawmy fund": "b youmy",
    "adib islamic": "adib egypt shari'a compliant al nahrda fund",
    "egx 30 etf": "egx30 index etf egx30 index etf",
    "beltone egx33 wafra shariah tracker": "beltone egx33 shariah index tracker wafra",
    "beltone egx100 tracker": "beltone egx100 index tracker meya meya",
    "menthum grow fund": "menthum grow egx 30 capped",
    "egx35 lv": "beltone egx 35 tracker",
    "beltone egx70 tracker": "b70 egx 70 tracker",
    "beltone evolve gold fund sabayek": "sabayek",
    "beltone evolve silver fund fadda": "beltone fada",
    "suez canal bank ii agial": "suez canal bank fund ii al agial",
    "mid bank fund 1": "mid bank fund i",
    "beltone gems equity fund usd": "beltone gems equity fund usd",
    "qnba tawazon": "qnb al ahli tawazon",
    "egyptian sport fund": "sports fund",
    "beltone fixed income fund b secure": "b secure",
    "beltone 2nd tranche b couponat fund": "b couponat",
    "beltone 2nd tranche b cobonat fund": "b couponat",
    "az–استحقاق t30 usd": "azimut target maturity fund-target 2030 usd",
    "az–استحقاق t29 usd": "azimut target maturity fund-target 2029 usd",
    "az- فرص الشريعة": "az-foras shariah",
    "az- حالا": "az halan",
    "az- جولد": "az gold",
    "az- فاليو": "az value",
    "az– ناصر": "az naser",
    "az- ادخار": "edkhar",
    "az- فرص": "az foras",
    "Ataa Charity Fund": "ataa",
    "Maashy": "*maashy",
    "bank nxt - sanady": "bank nxt fund iii (sanady)",
    "crédit agricole &#8211; egypt fund no 4 balanced fund al thiqa": "credit agricole bank egypt balanced fund no 4",
    "shield": "arab african international bank shield",
    "juman": "arab african international bank juman",
    "iskan": "iskan insurance",
    "gozoor": "aaib gozoor",
    "guard": "arab african international bank guard",
    "kenz foras": "kenz foras equity",
    "sarwaty": "sarwaty*",
    "gosour": "gosour equity",
    "bond$": "bonds fixed income usd fund",
    "istsmar w aman": "misr insurance istithmar and aman",
    "el fanar": "fanar",
    "al tameer": "housing & development bank al tameer",
    "kenz shariah": "kenoz egx33 shariah index tracker shariah",
    "kenz egx70 ewi": "kenz egx70 ewi",
    "kenz egx35 lv": "kenz egx35 lv",
    "صندوق استثمار بنك قناة السويس": "suez canal bank fund i",
    "صندوق الأجيال": "suez canal bank fund ii al agial",
    "صندوق استثمار السويس اليومى": "suez canal bank al suez al youmi",
    "صندوق أمان ذو العائد التراكمى": "fibe & cib aman",
    "صندوق إستثمار بنك فيصل الإسلامى المصرى ذو العائد الدورى": "faisal islamic bank of egypt fund",
    "ishraq": "national bank of kuwait fund ishraq",
    "namaa": "national bank of kuwait fund namaa",
    "al hayah": "national bank of kuwait hayat",
    "al mizan": "*national bank of kuwait al mizan",
    "gig money market fund": "gig insurance",
    "gig equity fund": "gig insurance egypt fund i",
    "mawared money market fund": "housing development bank mawared",
    "pfi cashi money market fund": "pfi cashi",
    "al siola fund ni capital": "siula money market",
    "delta life assurance": "delta life insurance",
    "gig money market": "gig insurance",
    "pfi cashi fund": "pfi cashi",
    "granite fund": "granite first fund",
    "وثاق": "wethaq investment",
    "استثمار وأمان لمصر للتأمين": "misr insurance istithmar and aman",
    "تميز": "tamayoz - afim",
    "إسكان للتأمين (كل يوم)": "iskan insurance",
    "مصر اليومي": "ciam - misr al youmy",
    "الدلتا لتأمينات الحياة النقدى": "delta life insurance",
    "الفنار": "fanar",
    "أودن الرابع": "odin 4",
    "زالدي ستار": "zaldi star",
    "صندوق تارجت الأول للدخل الثابت": "target first fund",
    "سيولة": "siula money market",
    "إشراق": "national bank of kuwait fund (ishraq)",
    "بريق": "bareeq",
    "كاشي": "pfi cashi",
    "جرانيت": "granite first fund",
    "ادخار - AZFI": "edkhar",
    "جي أي جي النقدي": "gig insurance",
    "ABK-Egypt Equity Fund": "al ahli bank of kuwait - egypt fund i",
    "NI Capital (Sahmy Fund)": "ni capital (sahmy fund)",
    "SAHMY FUND": "ni capital (sahmy fund)",
    "SAHMY 70 FUND": "ni capital egx 70",
    "15/30 Fixed Income Fund": "ni capital 15/30",
    "MAKASEB 1st Tranche": "gig makaseb fund first tranche",
    "MAKASEB 2nd Tranche": "gig makaseb fund second tranche",
    "EDUCATION FOR LIFE": "the charitable education fund",
    "Ezdehar Fund": "fab misr fund (ezdhar)",
  };
  for (const fund of funds) {
    byName.set(normalize(fund.canonical_name), fund);
    if (fund.eima_name_raw) byName.set(normalize(fund.eima_name_raw), fund);
  }
  for (const [officialName, eimaName] of Object.entries(providerAliases)) {
    const fund = byName.get(normalize(eimaName));
    if (fund) byName.set(normalize(officialName), fund);
  }
  const matched: Array<{ record: EfgRecord; fund: FundRow }> = [];
  const unmatched: string[] = [];
  for (const record of records) {
    const fund = byName.get(normalize(record.name));
    if (fund) matched.push({ record, fund });
    else unmatched.push(record.name);
  }
  return { matched, unmatched };
}

export function emptyRecordsOutcome(schedule?: "daily" | "weekly"): "no_new_valuation" | "error" {
  return schedule === "weekly" ? "no_new_valuation" : "error";
}
export function collectorStatus(failed: number, unmatched: number): RunSummary["status"] {
  return failed > 0 || unmatched > 0 ? "partial" : "success";
}

export type WriteCounters = Pick<RunSummary, "inserted" | "unchanged" | "updated">;

export function tallyWriteResult(counters: WriteCounters, result: "inserted" | "unchanged" | "updated"): WriteCounters {
  return { ...counters, [result]: counters[result] + 1 };
}

async function getFunds(sourceUrl: string, matchAllFunds = false): Promise<FundRow[]> {
  const params = new URLSearchParams({ select: "fund_id,canonical_name,eima_name_raw,category,price_update_url", limit: "500" });
  if (!matchAllFunds) params.set("price_update_url", `eq.${sourceUrl}`);
  return supabaseRequest<FundRow[]>(`/rest/v1/funds?${params.toString()}`);
}

async function getSourceId(sourceUrl: string): Promise<string> {
  const params = new URLSearchParams({ select: "source_id", source_url: `eq.${sourceUrl}`, limit: "1" });
  const rows = await supabaseRequest<Array<{ source_id: string }>>(`/rest/v1/sources?${params.toString()}`);
  if (!rows[0]) throw new Error("EFG source is not present in Supabase sources table");
  return rows[0].source_id;
}

async function fetchExisting(fundId: string, valuationDate: string, sourceId: string) {
  const params = new URLSearchParams({
    select: "id,nav",
    fund_id: `eq.${fundId}`,
    valuation_date: `eq.${valuationDate}`,
    source_id: `eq.${sourceId}`,
    limit: "1",
  });
  const rows = await supabaseRequest<Array<{ id: string; nav: number }>>(`/rest/v1/fund_prices?${params.toString()}`);
  return rows[0];
}

async function writeSnapshot(record: EfgRecord, fund: FundRow, sourceId: string, sourceUrl: string, parserName: string): Promise<"inserted" | "unchanged" | "updated"> {
  const existing = await fetchExisting(fund.fund_id, record.valuationDate, sourceId);
  if (existing && Number(existing.nav) === record.nav) return "unchanged";
  const payload = {
    fund_id: fund.fund_id,
    nav: record.nav,
    currency: record.currency,
    valuation_date: record.valuationDate,
    source_id: sourceId,
    parser_name: parserName,
    status: "validated",
    raw_name: record.rawName,
    raw_payload: { source_url: sourceUrl, extracted_name: record.rawName },
  };
  if (existing) {
    await supabaseRequest(`/rest/v1/fund_prices?id=eq.${encodeURIComponent(existing.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(payload),
    });
    return "updated";
  }
  await supabaseRequest("/rest/v1/fund_prices", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(payload),
  });
  return "inserted";
}

type CollectorConfig = { sourceUrl: string; fetchUrl?: string; parserName: string; parse: (html: string) => EfgRecord[] | Promise<EfgRecord[]>; fetcher?: (url: string) => Promise<globalThis.Response>; matchAllFunds?: boolean; schedule?: "daily" | "weekly" };

function fetchWithDigicertChain(url: string): Promise<globalThis.Response> {
  return new Promise((resolve, reject) => {
    const req = httpsRequest(url, { ca: [...rootCertificates, CI_INTERMEDIATE_CA], headers: { "User-Agent": "EgyptFundsPriceAgent/1.0", Accept: "text/html" } }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve(new globalThis.Response(Buffer.concat(chunks).toString("utf8"), { status: res.statusCode ?? 0, headers: { "content-type": String(res.headers["content-type"] ?? "text/html") } })));
    });
    req.on("error", reject);
    req.end();
  });
}

function fetchCiCapital(url: string): Promise<globalThis.Response> {
  return new Promise((resolve, reject) => {
    const req = httpsRequest(url, { ca: [...rootCertificates, CI_INTERMEDIATE_CA], headers: { "User-Agent": "EgyptFundsPriceAgent/1.0", Accept: "text/html" } }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        resolve(new globalThis.Response(body, { status: res.statusCode ?? 0, headers: { "content-type": String(res.headers["content-type"] ?? "text/html") } }));
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function runCombinedCollectors(configs: CollectorConfig[]): Promise<RunSummary> {
  const summaries = await Promise.all(configs.map(runCollector));
  const allFailed = summaries.length > 0 && summaries.every((summary) => summary.status === "failed");
  return summaries.reduce((combined, summary) => ({
    ...combined,
    runId: `${combined.runId},${summary.runId}`,
    status: allFailed ? "failed" : combined.status === "partial" || summary.status === "partial" || combined.status === "failed" || summary.status === "failed" ? "partial" : "success",
    fetchedRecords: combined.fetchedRecords + summary.fetchedRecords,
    matchedRecords: combined.matchedRecords + summary.matchedRecords,
    matchedFundIds: Array.from(new Set([...combined.matchedFundIds, ...summary.matchedFundIds])),
    inserted: combined.inserted + summary.inserted,
    unchanged: combined.unchanged + summary.unchanged,
    updated: combined.updated + summary.updated,
    unmatched: [...combined.unmatched, ...summary.unmatched],
    failed: [...combined.failed, ...summary.failed],
    finishedAt: summary.finishedAt,
  }));
}

async function runCollector(config: CollectorConfig): Promise<RunSummary> {
  const run: RunSummary = {
    runId: crypto.randomUUID(), startedAt: new Date().toISOString(), status: "running",
    source: config.sourceUrl, parser: config.parserName, schedule: config.schedule, fetchedRecords: 0, matchedRecords: 0, matchedFundIds: [], inserted: 0, unchanged: 0,
    updated: 0, unmatched: [], failed: [],
  };
  lastRun = run;
  try {
    const response = config.fetcher ? await config.fetcher(config.fetchUrl ?? config.sourceUrl) : await fetch(config.fetchUrl ?? config.sourceUrl, { headers: { "User-Agent": "EgyptFundsPriceAgent/1.0", Accept: "application/json, text/html" } });
    if (!response.ok) throw new Error(`Provider source returned HTTP ${response.status}`);
    const html = await response.text();
    const records = await config.parse(html);
    run.fetchedRecords = records.length;
    if (records.length === 0) {
      run.outcome = emptyRecordsOutcome(config.schedule);
      if (run.outcome === "no_new_valuation") {
        run.status = "success";
        return run;
      }
      throw new Error("EFG parser found no validated mutual-fund rows");
    }
    run.outcome = "new_valuation";
    const [funds, sourceId] = await Promise.all([getFunds(config.sourceUrl, config.matchAllFunds), getSourceId(config.sourceUrl)]);
    const matching = matchEfgRecords(records, funds);
    run.matchedRecords = matching.matched.length;
    run.matchedFundIds = matching.matched.map(({ fund }) => fund.fund_id);
    run.unmatched.push(...matching.unmatched);
    for (const { record, fund } of matching.matched) {
      try {
        const result = await writeSnapshot(record, fund, sourceId, config.sourceUrl, config.parserName);
        run[result] += 1;
      } catch (error) {
        run.failed.push({ name: record.name, error: error instanceof Error ? error.message : String(error) });
      }
    }
    run.status = collectorStatus(run.failed.length, run.unmatched.length);
  } catch (error) {
    run.status = "failed";
    run.outcome = "error";
    run.fetchError = error instanceof Error ? error.message : String(error);
  }
  run.finishedAt = new Date().toISOString();
  lastRun = run;
  return run;
}

export function runEfgCollector(): Promise<RunSummary> {
  return runCollector({ sourceUrl: EFG_URL, parserName: EFG_PARSER_NAME, parse: parseEfgMutualFunds });
}

export function runBeltoneCollector(): Promise<RunSummary> {
  return runCollector({ sourceUrl: BELTONE_URL, parserName: BELTONE_PARSER_NAME, parse: parseBeltoneFunds });
}

export function runCiCollector(): Promise<RunSummary> {
  return runCollector({ sourceUrl: CI_URL, parserName: CI_PARSER_NAME, parse: parseCiCapitalFunds, fetcher: fetchCiCapital });
}

export function runAfimCollector(): Promise<RunSummary> {
  return runCollector({ sourceUrl: AFIM_URL, parserName: AFIM_PARSER_NAME, parse: parseAfimFunds });
}

export function runHcCollector(): Promise<RunSummary> {
  return runCollector({ sourceUrl: HC_SOURCE_URL, fetchUrl: HC_FETCH_URL, parserName: HC_PARSER_NAME, parse: parseHcFunds });
}

export function runAzimutCollector(): Promise<RunSummary> {
  return runCollector({ sourceUrl: AZIMUT_SOURCE_URL, fetchUrl: AZIMUT_API_URL, parserName: AZIMUT_PARSER_NAME, parse: parseAzimutFunds });
}

export function runAbkCollector(): Promise<RunSummary> {
  return runCollector({ sourceUrl: ABK_SOURCE_URL, parserName: "abk_official_equity_fund_v1", parse: parseAbkFund, fetcher: fetchWithDigicertChain, matchAllFunds: true });
}

export function runAaimCollector(): Promise<RunSummary> {
  return runCollector({ sourceUrl: AAIM_SOURCE_URL, fetchUrl: AAIM_FETCH_URL, parserName: "aaim_fund_cards_v1", parse: parseAaimFunds });
}

const fetchMubasherArticle = (url: string) => fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36", Accept: "text/html,application/xhtml+xml", "Accept-Language": "ar,en;q=0.8" } });
const mubasherCategoryConfigs = () => MUBASHER_CATEGORY_SOURCE_URLS.map(sourceUrl => ({ sourceUrl, parserName: MUBASHER_DAILY_PARSER_NAME, parse: parseMubasherDailyArticle, fetcher: fetchMubasherArticle, matchAllFunds: true }));
export function runMubasherCategoryCollectors(): Promise<RunSummary[]> {
  return Promise.all(mubasherCategoryConfigs().map(runCollector));
}
export function runMubasherDailyCollector(): Promise<RunSummary> {
  return runCombinedCollectors(mubasherCategoryConfigs());
}
export function runMubasherCollector(): Promise<RunSummary> {
  return runCollector({ sourceUrl: MUBASHER_SOURCE_URL, parserName: MUBASHER_PARSER_NAME, parse: parseMubasherFunds, matchAllFunds: true });
}
export function runScbCollector(): Promise<RunSummary> {
  return runCollector({ sourceUrl: SCB_SOURCE_URL, parserName: SCB_PARSER_NAME, parse: parseScbFundRates, matchAllFunds: true });
}
export function runFaisalCollector(): Promise<RunSummary> {
  return runCollector({ sourceUrl: FAISAL_SOURCE_URL, parserName: FAISAL_PARSER_NAME, parse: parseFaisalMutualFunds, matchAllFunds: true });
}
export function runPfiCollector(): Promise<RunSummary> {
  return runCollector({ sourceUrl: PFI_SOURCE_URL, parserName: PFI_PARSER_NAME, parse: parsePfiFunds, matchAllFunds: true });
}
export function runNiCapitalCollector(): Promise<RunSummary> {
  return runCollector({ sourceUrl: NI_CAPITAL_SOURCE_URL, parserName: NI_CAPITAL_PARSER_NAME, parse: parseNiCapitalFunds, matchAllFunds: true });
}
export function runFabMisrCollector(): Promise<RunSummary> {
  return runCollector({ sourceUrl: FAB_MISR_EZDEHAR_SOURCE_URL, parserName: FAB_MISR_PARSER_NAME, parse: parseFabMisrEzdehar, matchAllFunds: true, schedule: "weekly" });
}
export function runNbkCollector(): Promise<RunSummary> {
  return runCombinedCollectors(NBK_SOURCE_URLS.map(sourceUrl => ({ sourceUrl, parserName: NBK_PARSER_NAME, parse: parseNbkFundPage, matchAllFunds: true })));
}

export function runZaldiCollector(): Promise<RunSummary> {
  return runCombinedCollectors([
    { sourceUrl: ZALDI_STAR_URL, parserName: ZALDI_PARSER_NAME, parse: parseZaldiFund },
    { sourceUrl: ZALDI_ELMASRY_URL, parserName: ZALDI_PARSER_NAME, parse: parseZaldiFund },
  ]);
}

export function getProviderSupportReport() {
  return [
    { provider: "EFG Holding / Hermes", source: EFG_URL, parser: EFG_PARSER_NAME, status: "implemented" as const, note: "Official HTML table" },
    { provider: "Beltone", source: BELTONE_URL, parser: BELTONE_PARSER_NAME, status: "implemented" as const, note: "Official fund sheet" },
    { provider: "AFIM", source: AFIM_URL, parser: AFIM_PARSER_NAME, status: "implemented" as const, note: "Official detail pages" },
    { provider: "Zaldi", source: `${ZALDI_STAR_URL}, ${ZALDI_ELMASRY_URL}`, parser: ZALDI_PARSER_NAME, status: "implemented" as const, note: "Official fund pages" },
    { provider: "Azimut", source: AZIMUT_API_URL, parser: AZIMUT_PARSER_NAME, status: "implemented" as const, note: "Official API" },
    { provider: "HC Securities", source: HC_SOURCE_URL, parser: HC_PARSER_NAME, status: "implemented" as const, note: "Official AJAX listing" },
    { provider: "CI Capital", source: CI_URL, parser: CI_PARSER_NAME, status: "implemented" as const, note: "Official Fund Type/Fund Name/Price table; secure DigiCert chain completion" },
    { provider: "Arab African Investment Management (AAIM)", source: AAIM_FETCH_URL, parser: "aaim_fund_cards_v1", status: "implemented" as const, note: "Official fund cards" },
    { provider: "Mubasher Funds", source: MUBASHER_SOURCE_URL, parser: MUBASHER_PARSER_NAME, status: "implemented" as const, note: "Affiliated/publication daily tables; primary manager ownership not independently verified" },
    { provider: "Mubasher Funds Daily Articles", source: MUBASHER_CATEGORY_SOURCE_URLS.join(", "), parser: MUBASHER_DAILY_PARSER_NAME, status: "implemented" as const, note: "Current daily publication category articles; secondary source, not primary manager feed" },
    { provider: "Suez Canal Bank", source: SCB_SOURCE_URL, parser: SCB_PARSER_NAME, status: "implemented" as const, note: "Official bank page with four NAV cards and valuation dates" },
    { provider: "Faisal Islamic Bank Egypt", source: FAISAL_SOURCE_URL, parser: FAISAL_PARSER_NAME, status: "implemented" as const, note: "Official bank page with two mutual-fund cards and valuation dates" },
    { provider: "National Bank of Kuwait Egypt", source: NBK_SOURCE_URLS.join(", "), parser: NBK_PARSER_NAME, status: "implemented" as const, note: "Official detail pages for Ishraq, Namaa, Al-Hayah, and Al-Mizan" },
    { provider: "PFI Asset Management", source: PFI_SOURCE_URL, parser: PFI_PARSER_NAME, status: "implemented" as const, note: "Official funds page; future-dated rows are rejected" },
    { provider: "NI Capital", source: NI_CAPITAL_SOURCE_URL, parser: NI_CAPITAL_PARSER_NAME, status: "implemented" as const, note: "Official asset-management page; future-dated rows are rejected" },
    { provider: "FAB Misr", source: FAB_MISR_EZDEHAR_SOURCE_URL, parser: FAB_MISR_PARSER_NAME, status: "implemented" as const, note: "Official bank fund page; NAV/date extracted and future-dated values rejected" },
    { provider: "ABK-Egypt", source: ABK_SOURCE_URL, parser: "abk_official_equity_fund_v1", status: "implemented" as const, note: "Official equity-fund page; TLS uses trusted DigiCert intermediate" },
  ];
}

function unavailableSummary(provider: string, source: string, reason: string): RunSummary {
  const now = new Date().toISOString();
  return { runId: crypto.randomUUID(), startedAt: now, finishedAt: now, status: "partial", source, parser: "unsupported_source", fetchedRecords: 0, matchedRecords: 0, matchedFundIds: [], inserted: 0, unchanged: 0, updated: 0, unmatched: [], failed: [{ name: provider, error: reason }] };
}

export async function runAllCollectors(): Promise<RunSummary> {
  return runCombinedCollectors([
    { sourceUrl: EFG_URL, parserName: EFG_PARSER_NAME, parse: parseEfgMutualFunds },
    { sourceUrl: BELTONE_URL, parserName: BELTONE_PARSER_NAME, parse: parseBeltoneFunds },
    { sourceUrl: CI_URL, parserName: CI_PARSER_NAME, parse: parseCiCapitalFunds },
    { sourceUrl: AFIM_URL, parserName: AFIM_PARSER_NAME, parse: parseAfimFunds },
    { sourceUrl: HC_SOURCE_URL, fetchUrl: HC_FETCH_URL, parserName: HC_PARSER_NAME, parse: parseHcFunds },
    { sourceUrl: AZIMUT_SOURCE_URL, fetchUrl: AZIMUT_API_URL, parserName: AZIMUT_PARSER_NAME, parse: parseAzimutFunds },
    { sourceUrl: AAIM_SOURCE_URL, fetchUrl: AAIM_FETCH_URL, parserName: "aaim_fund_cards_v1", parse: parseAaimFunds },
    { sourceUrl: MUBASHER_SOURCE_URL, parserName: MUBASHER_PARSER_NAME, parse: parseMubasherFunds },
    ...MUBASHER_CATEGORY_SOURCE_URLS.map(sourceUrl => ({ sourceUrl, parserName: MUBASHER_DAILY_PARSER_NAME, parse: parseMubasherDailyArticle, matchAllFunds: true })),
    { sourceUrl: SCB_SOURCE_URL, parserName: SCB_PARSER_NAME, parse: parseScbFundRates, matchAllFunds: true },
    { sourceUrl: FAISAL_SOURCE_URL, parserName: FAISAL_PARSER_NAME, parse: parseFaisalMutualFunds, matchAllFunds: true },
    ...NBK_SOURCE_URLS.map(sourceUrl => ({ sourceUrl, parserName: NBK_PARSER_NAME, parse: parseNbkFundPage, matchAllFunds: true })),
    { sourceUrl: PFI_SOURCE_URL, parserName: PFI_PARSER_NAME, parse: parsePfiFunds, matchAllFunds: true },
    { sourceUrl: NI_CAPITAL_SOURCE_URL, parserName: NI_CAPITAL_PARSER_NAME, parse: parseNiCapitalFunds, matchAllFunds: true },
    { sourceUrl: FAB_MISR_EZDEHAR_SOURCE_URL, parserName: FAB_MISR_PARSER_NAME, parse: parseFabMisrEzdehar, matchAllFunds: true, schedule: "weekly" },
    { sourceUrl: ABK_SOURCE_URL, parserName: "abk_official_equity_fund_v1", parse: parseAbkFund, fetcher: fetchWithDigicertChain, matchAllFunds: true },
    { sourceUrl: ZALDI_STAR_URL, parserName: ZALDI_PARSER_NAME, parse: parseZaldiFund },
    { sourceUrl: ZALDI_ELMASRY_URL, parserName: ZALDI_PARSER_NAME, parse: parseZaldiFund },
  ]).then(summary => {
    return summary;
  });
}

async function requireAuthenticated(req: Request) {
  const user = await sdk.authenticateRequest(req);
  if (user.isCron) throw new Error("cron caller is not allowed on manual endpoint");
  return user;
}

export async function manualEfgRunHandler(req: Request, res: ExpressResponse) {
  try {
    await requireAuthenticated(req);
    res.json(await runEfgCollector());
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "unauthorized" });
  }
}

export async function manualBeltoneRunHandler(req: Request, res: ExpressResponse) {
  try {
    await requireAuthenticated(req);
    res.json(await runBeltoneCollector());
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "unauthorized" });
  }
}

export async function manualAfimRunHandler(req: Request, res: ExpressResponse) {
  try {
    await requireAuthenticated(req);
    res.json(await runAfimCollector());
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "unauthorized" });
  }
}

export async function manualCiRunHandler(req: Request, res: ExpressResponse) {
  try {
    await requireAuthenticated(req);
    res.json(await runCiCollector());
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "unauthorized" });
  }
}

export async function allCollectorsHandler(req: Request, res: ExpressResponse) {
  try {
    await requireAuthenticated(req);
    res.json(await runAllCollectors());
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "unauthorized" });
  }
}

export async function providerSupportHandler(req: Request, res: ExpressResponse) {
  try {
    await requireAuthenticated(req);
    res.json({ generatedAt: new Date().toISOString(), providers: getProviderSupportReport() });
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "unauthorized" });
  }
}

export async function efgStatusHandler(req: Request, res: ExpressResponse) {
  try {
    await requireAuthenticated(req);
    res.json({ source: EFG_URL, parser: EFG_PARSER_NAME, lastRun });
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "unauthorized" });
  }
}

export async function scheduledEfgHandler(req: Request, res: ExpressResponse) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    res.json(await runEfgCollector());
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error), timestamp: new Date().toISOString() });
  }
}

export async function scheduledAllCollectorsHandler(req: Request, res: ExpressResponse) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    res.json(await runAllCollectors());
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error), timestamp: new Date().toISOString() });
  }
}
