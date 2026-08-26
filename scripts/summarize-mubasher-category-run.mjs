import fs from "node:fs";
const raw = fs.readFileSync("reports/mubasher-category-each-v1.json", "utf8");
const json = raw.slice(raw.indexOf("[\n"));
const results = JSON.parse(json);
console.log(JSON.stringify(results.map((r) => ({
  source: r.source,
  status: r.status,
  fetched: r.fetchedRecords,
  matched: r.matchedRecords,
  inserted: r.inserted,
  unchanged: r.unchanged,
  updated: r.updated,
  unmatched: r.unmatched.length,
  failed: r.failed,
  fetchError: r.fetchError ?? null,
})), null, 2));
