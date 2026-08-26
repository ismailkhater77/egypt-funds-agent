import { parseAzimutFunds } from "../server/efgCollector";
const response = await fetch("https://app.azimut.eg/api/fund/list?size=100&web=true", { headers: { "User-Agent": "EgyptFundsPriceAgent/1.0", Accept: "application/json" } });
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const records = await parseAzimutFunds(await response.text());
console.log(JSON.stringify(records, null, 2));
