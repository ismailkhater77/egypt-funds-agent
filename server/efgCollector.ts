import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";

const EFG_URL = "https://efgholding.com/en/our-services/mutual-funds";
const PARSER_NAME = "efg_html_table_v1";

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

type RunSummary = {
  runId: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "success" | "partial" | "failed";
  source: string;
  parser: string;
  fetchedRecords: number;
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
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[()\[\]{}.,:/\\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDate(value: string): string {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) throw new Error(`Invalid EFG valuation date: ${value}`);
  return `${match[3]}-${match[2]}-${match[1]}`;
}

export function parseEfgMutualFunds(html: string): EfgRecord[] {
  const records: EfgRecord[] = [];
  const rowPattern = /<tr\b[\s\S]*?<\/tr>/gi;
  const namePattern = /data-before=(["'])[^"']+\1[\s\S]*?<a\b[^>]*>([^<]+)<\/a>/i;
  const pricePattern = /data-before=(["'])IC Price\1[\s\S]*?>([0-9]+(?:\.[0-9]+)?)<\/td>/i;
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

export function matchEfgRecords(records: EfgRecord[], funds: FundRow[]) {
  const byName = new Map<string, FundRow>();
  for (const fund of funds) {
    byName.set(normalize(fund.canonical_name), fund);
    if (fund.eima_name_raw) byName.set(normalize(fund.eima_name_raw), fund);
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

export function collectorStatus(failed: number, unmatched: number): RunSummary["status"] {
  return failed > 0 || unmatched > 0 ? "partial" : "success";
}

async function getFunds(): Promise<FundRow[]> {
  const params = new URLSearchParams({
    select: "fund_id,canonical_name,eima_name_raw,category,price_update_url",
    price_update_url: `eq.${EFG_URL}`,
    limit: "500",
  });
  return supabaseRequest<FundRow[]>(`/rest/v1/funds?${params.toString()}`);
}

async function getSourceId(): Promise<string> {
  const params = new URLSearchParams({ select: "source_id", source_url: `eq.${EFG_URL}`, limit: "1" });
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

async function writeSnapshot(record: EfgRecord, fund: FundRow, sourceId: string): Promise<"inserted" | "unchanged" | "updated"> {
  const existing = await fetchExisting(fund.fund_id, record.valuationDate, sourceId);
  if (existing && Number(existing.nav) === record.nav) return "unchanged";
  const payload = {
    fund_id: fund.fund_id,
    nav: record.nav,
    currency: record.currency,
    valuation_date: record.valuationDate,
    source_id: sourceId,
    parser_name: PARSER_NAME,
    status: "validated",
    raw_name: record.rawName,
    raw_payload: { source_url: EFG_URL, extracted_name: record.rawName },
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

export async function runEfgCollector(): Promise<RunSummary> {
  const run: RunSummary = {
    runId: crypto.randomUUID(), startedAt: new Date().toISOString(), status: "running",
    source: EFG_URL, parser: PARSER_NAME, fetchedRecords: 0, inserted: 0, unchanged: 0,
    updated: 0, unmatched: [], failed: [],
  };
  lastRun = run;
  try {
    const response = await fetch(EFG_URL, { headers: { "User-Agent": "EgyptFundsPriceAgent/1.0" } });
    if (!response.ok) throw new Error(`EFG source returned HTTP ${response.status}`);
    const html = await response.text();
    const records = parseEfgMutualFunds(html);
    run.fetchedRecords = records.length;
    if (records.length === 0) throw new Error("EFG parser found no validated mutual-fund rows");
    const [funds, sourceId] = await Promise.all([getFunds(), getSourceId()]);
    const matching = matchEfgRecords(records, funds);
    run.unmatched.push(...matching.unmatched);
    for (const { record, fund } of matching.matched) {
      try {
        const result = await writeSnapshot(record, fund, sourceId);
        run[result] += 1;
      } catch (error) {
        run.failed.push({ name: record.name, error: error instanceof Error ? error.message : String(error) });
      }
    }
    run.status = collectorStatus(run.failed.length, run.unmatched.length);
  } catch (error) {
    run.status = "failed";
    run.fetchError = error instanceof Error ? error.message : String(error);
  }
  run.finishedAt = new Date().toISOString();
  lastRun = run;
  return run;
}

async function requireAuthenticated(req: Request) {
  const user = await sdk.authenticateRequest(req);
  if (user.isCron) throw new Error("cron caller is not allowed on manual endpoint");
  return user;
}

export async function manualEfgRunHandler(req: Request, res: Response) {
  try {
    await requireAuthenticated(req);
    res.json(await runEfgCollector());
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "unauthorized" });
  }
}

export async function efgStatusHandler(req: Request, res: Response) {
  try {
    await requireAuthenticated(req);
    res.json({ source: EFG_URL, parser: PARSER_NAME, lastRun });
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "unauthorized" });
  }
}

export async function scheduledEfgHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    res.json(await runEfgCollector());
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error), timestamp: new Date().toISOString() });
  }
}
