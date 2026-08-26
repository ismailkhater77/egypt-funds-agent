import fs from "node:fs/promises";
import { parseAaimFunds } from "../server/efgCollector.ts";

const html = await fs.readFile("/tmp/aaim-live.html", "utf8");
const records = parseAaimFunds(html);
console.log(JSON.stringify({ bytes: html.length, records: records.length, sample: records.slice(0, 3) }, null, 2));
