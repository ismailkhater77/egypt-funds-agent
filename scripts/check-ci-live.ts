import { parseCiCapitalFunds } from "../server/efgCollector";

const url = "https://www.cicapital.com/fundprice/";
const response = await fetch(url, { headers: { "User-Agent": "EgyptFundsPriceAgent/1.0" } });
if (!response.ok) throw new Error(`CI Capital returned HTTP ${response.status}`);
const records = parseCiCapitalFunds(await response.text());
console.log(JSON.stringify({ count: records.length, sample: records.slice(0, 5) }, null, 2));
if (records.length === 0) process.exit(1);
