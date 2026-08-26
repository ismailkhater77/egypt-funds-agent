import fs from "node:fs";
import { parseMubasherDailyArticle } from "../server/efgCollector";
const html = fs.readFileSync("/tmp/mubasher8482.html", "utf8");
const records = parseMubasherDailyArticle(html);
console.log(JSON.stringify({ bytes: html.length, records: records.length, sample: records.slice(0, 5) }, null, 2));
