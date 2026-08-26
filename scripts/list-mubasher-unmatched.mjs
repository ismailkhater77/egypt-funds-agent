import fs from "node:fs";
const raw = fs.readFileSync("reports/mubasher-category-each-v9.json", "utf8");
const results = JSON.parse(raw.slice(raw.indexOf("[\n")));
for (const result of results) {
  console.log(`\n${result.source}`);
  console.log(JSON.stringify({ status: result.status, fetched: result.fetchedRecords, matched: result.matchedRecords, inserted: result.inserted, unchanged: result.unchanged, unmatched: result.unmatched }, null, 2));
}
