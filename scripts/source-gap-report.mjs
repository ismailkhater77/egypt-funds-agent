import { writeFile } from "node:fs/promises";

import { getEgyptBusinessDate } from "./lib/egyptBusinessDate.mjs";

const asOfDate = getEgyptBusinessDate();
const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function get(path) {
  const response = await fetch(`${base}/rest/v1/${path}`, { headers });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  return response.json();
}

const [funds, prices] = await Promise.all([
  get("funds?select=fund_id,canonical_name,eima_name_raw,price_update_url&active=eq.true&limit=500"),
  get("fund_prices?select=fund_id,valuation_date,status&status=eq.validated&limit=5000"),
]);

const validFundIds = new Set(prices.filter((row) => row.valuation_date <= asOfDate).map((row) => row.fund_id));
const byName = (a, b) => a.canonical_name.localeCompare(b.canonical_name, "en");
const unlinked = funds.filter((fund) => !fund.price_update_url).sort(byName);
const linkedButNoValidatedSnapshot = funds.filter((fund) => fund.price_update_url && !validFundIds.has(fund.fund_id)).sort(byName);
const noValidatedSnapshot = funds.filter((fund) => !validFundIds.has(fund.fund_id)).sort(byName);
const row = (fund, includeUrl = false) => `| ${fund.canonical_name.replaceAll("|", "\\|")} | ${String(fund.eima_name_raw ?? "—").replaceAll("|", "\\|")} | ${includeUrl ? fund.price_update_url : "—"} |`;

const covered = funds.filter((fund) => validFundIds.has(fund.fund_id));
const markdown = `# Source-Coverage Gap Report — ${asOfDate}\n\nThis report is a **read-only** Supabase audit of active fund records. “No update source at all” means \`price_update_url IS NULL\`; it does not mean that an external source can never be found. “Linked but no validated snapshot” means a URL exists in the active fund catalog but there is no validated price dated on or before ${asOfDate}.\n\n| Category | Count |\n| --- | ---: |\n| Active catalog funds | ${funds.length} |\n| Funds with no update-source URL at all | ${unlinked.length} |\n| Funds linked to a URL but without a validated snapshot as of ${asOfDate} | ${linkedButNoValidatedSnapshot.length} |\n| Funds with no validated snapshot as of ${asOfDate} (functional coverage gap) | ${noValidatedSnapshot.length} |\n| Funds with at least one validated snapshot as of ${asOfDate} | ${covered.length} |\n\n## A. Funds with no update-source URL at all (${unlinked.length})\n\n| Canonical fund name | Imported/EIMA name | Source URL |\n| --- | --- | --- |\n${unlinked.map((fund) => row(fund)).join("\n")}\n\n## B. Funds linked to a source URL but with no validated snapshot as of ${asOfDate} (${linkedButNoValidatedSnapshot.length})\n\nThese are **not** part of the “no source at all” count. They are included so that stale, undated, future-dated, blocked, or unmatched source situations remain visibly separate.\n\n| Canonical fund name | Imported/EIMA name | Linked source URL |\n| --- | --- | --- |\n${linkedButNoValidatedSnapshot.map((fund) => row(fund, true)).join("\n")}\n\n## C. Funds with no validated snapshot as of ${asOfDate} (${noValidatedSnapshot.length})\n\nThis is the operational priority list. It contains all active funds not yet covered by a validated NAV snapshot, whether the catalog currently has a source URL or not.\n\n| Canonical fund name | Imported/EIMA name | Linked source URL |\n| --- | --- | --- |\n${noValidatedSnapshot.map((fund) => row(fund, true)).join("\n")}\n`;

await writeFile(`/home/ubuntu/egypt-funds-agent/reports/source-coverage-gap-${asOfDate}.md`, markdown);
console.log(JSON.stringify({ asOfDate, activeFunds: funds.length, unlinked: unlinked.length, linkedButNoValidatedSnapshot: linkedButNoValidatedSnapshot.length, noValidatedSnapshot: noValidatedSnapshot.length, covered: covered.length }, null, 2));
