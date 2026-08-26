import fs from "node:fs";
import { parseMubasherDailyArticle, matchEfgRecords } from "../server/efgCollector.ts";

const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
const headers = { apikey: secret, Authorization: `Bearer ${secret}` };
const normalize = (value) => (value ?? "").normalize("NFKC").trim().toLocaleLowerCase("en-US").replace(/[()\[\]{}.,:;\/\\"'“”‘’*&-]/g, " ").replace(/\s+/g, " ").trim();
const collector = fs.readFileSync(new URL("../server/efgCollector.ts", import.meta.url), "utf8");
const start = collector.indexOf("const providerAliases");
const end = collector.indexOf("\n  };", start);
if (start < 0 || end < 0) throw new Error("providerAliases block not found");
const block = collector.slice(start, end + 5);
const aliases = new Map([...block.matchAll(/^\s*["'](.+?)["']:\s*["'](.+?)["'],?$/gm)].map((m) => [normalize(m[1]), m[2].replace(/^\\*/, "")]));
const excluded = new Set(["aafaq investment fund", "horus - afim", "weladna charity fund"]);
const reportSources = JSON.parse(fs.readFileSync("reports/mubasher-category-run-after-alias-cleanup-v1.clean.json", "utf8"));
const sourceUrls = [...new Set(reportSources.map((row) => row.source).filter((url) => url.includes("mubasherfunds.info")))];
const fundsResponse = await fetch(`${baseUrl}/rest/v1/funds?select=fund_id,canonical_name,eima_name_raw&limit=500`, { headers });
if (!fundsResponse.ok) throw new Error(`Supabase funds ${fundsResponse.status}`);
const funds = await fundsResponse.json();
const rows = [];
for (const sourceUrl of sourceUrls) {
  const response = await fetch(sourceUrl, { headers: { "User-Agent": "EgyptFundsPriceAgent/1.0", Accept: "text/html" } });
  if (!response.ok) continue;
  const records = parseMubasherDailyArticle(await response.text());
  const { matched } = matchEfgRecords(records, funds);
  for (const { record, fund } of matched) {
    const target = aliases.get(normalize(record.name));
    if (!target || excluded.has(target)) continue;
    rows.push({
      published_name: record.name,
      catalog_alias_target: target,
      fund_id: fund.fund_id,
      canonical_name: fund.canonical_name,
      eima_name_raw: fund.eima_name_raw,
      nav: record.nav,
      currency: record.currency,
      valuation_date: record.valuationDate,
      evidence_source: "Current Mubasher daily/category article parsed and matched by explicit alias; catalog record returned by exact normalized alias lookup",
      source_url: sourceUrl,
    });
  }
}
const unique = [...new Map(rows.map((row) => [`${normalize(row.published_name)}|${row.fund_id}|${row.valuation_date}`, row])).values()];
const output = {
  generated_at: new Date().toISOString(),
  policy: "Mubasher-only audit of names observed in current category articles. Every row has an exact catalog fund_id and canonical_name; no fuzzy matching is used for approval.",
  source_provenance: "Affiliated/publication source; primary manager ownership is not independently verified.",
  count: unique.length,
  aliases: unique,
  excluded_unproven_aliases: [...excluded].map((catalog_name) => ({ catalog_name, reason: "Observed in Mubasher output but no exact current catalog record was proven" })),
};
fs.writeFileSync("reports/mubasher-alias-audit.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify({ count: output.count, excluded: output.excluded_unproven_aliases.length, output: "reports/mubasher-alias-audit.json" }, null, 2));
