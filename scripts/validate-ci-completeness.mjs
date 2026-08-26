import { runCiCollector } from "../server/efgCollector.ts";

const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
const sourceUrl = "https://www.cicapital.com/fundprice/";
const response = await fetch(`${baseUrl}/rest/v1/funds?select=fund_id,canonical_name&price_update_url=eq.${encodeURIComponent(sourceUrl)}&limit=500`, { headers: { apikey: secret, Authorization: `Bearer ${secret}` } });
if (!response.ok) throw new Error(`CI mapped-fund lookup failed: ${response.status} ${await response.text()}`);
const mappedFunds = await response.json();
const first = await runCiCollector();
const second = await runCiCollector();
const result = {
  mappedFundCount: mappedFunds.length,
  firstRun: { fetchedRecords: first.fetchedRecords, matchedRecords: first.matchedRecords, unmatched: first.unmatched, failed: first.failed, writes: first.inserted + first.unchanged + first.updated },
  secondRun: { fetchedRecords: second.fetchedRecords, matchedRecords: second.matchedRecords, unmatched: second.unmatched, failed: second.failed, inserted: second.inserted, unchanged: second.unchanged, updated: second.updated },
};
console.log(JSON.stringify(result, null, 2));
if (mappedFunds.length !== first.matchedRecords || first.unmatched.length || first.failed.length || second.inserted !== 0 || second.unchanged !== first.matchedRecords || second.failed.length) process.exit(1);
