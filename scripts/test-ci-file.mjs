import fs from "node:fs/promises";
import { parseCiCapitalFunds } from "../server/efgCollector.ts";
const html = await fs.readFile("/tmp/ci-fundprice.html", "utf8");
const records = parseCiCapitalFunds(html);
console.log(JSON.stringify({ bytes: html.length, records: records.length, names: records.map((record) => record.name) }, null, 2));
