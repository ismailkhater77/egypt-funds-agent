import fs from "node:fs";
const raw = fs.readFileSync("/tmp/run-all-ni-fab.json", "utf8");
const start = raw.indexOf("{\n  \"runId\"");
if (start < 0) throw new Error("Run All JSON not found");
const result = JSON.parse(raw.slice(start));
const names = ["ni_capital_official_funds_v1", "fab_misr_official_ezdehar_v1"];
console.log(JSON.stringify({ overall: { status: result.status, fetchedRecords: result.fetchedRecords, matchedRecords: result.matchedRecords, inserted: result.inserted, unchanged: result.unchanged, updated: result.updated, unmatchedCount: result.unmatched?.length ?? 0, failedCount: result.failed?.length ?? 0 }, targetRecords: names.map(parser => ({ parser, matched: result.matchedFundIds?.length ?? 0 })) }, null, 2));
