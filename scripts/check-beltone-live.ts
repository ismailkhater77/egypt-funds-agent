import { readFile } from "node:fs/promises";
import { parseBeltoneFunds } from "../server/efgCollector";

const html = await readFile("/home/ubuntu/fund_test/providers/beltone_current.html", "utf8");
const records = parseBeltoneFunds(html);
console.log(JSON.stringify({ count: records.length, sample: records.slice(0, 5) }, null, 2));
if (records.length === 0) process.exit(1);
