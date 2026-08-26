import fs from "node:fs/promises";

const report = JSON.parse(await fs.readFile("reports/final-multi-provider-validation.json", "utf8"));
const supported = report.providers.filter((provider) => (provider.run?.status === "success" || provider.run?.status === "partial") && (provider.run?.matchedRecords ?? 0) > 0);
const matchedIds = new Set(supported.flatMap((provider) => provider.run.matchedFundIds ?? []));
const sourceRecords = supported.reduce((sum, provider) => sum + (provider.run.matchedRecords ?? 0), 0);
const successfulWrites = supported.reduce((sum, provider) => sum + (provider.run.inserted ?? 0) + (provider.run.unchanged ?? 0) + (provider.run.updated ?? 0), 0);
console.log(JSON.stringify({ distinctFunds: matchedIds.size, matchedSourceFundRecords: sourceRecords, successfulWrites, providers: supported.map((provider) => ({ provider: provider.provider, matchedRecords: provider.run.matchedRecords, successfulWrites: (provider.run.inserted ?? 0) + (provider.run.unchanged ?? 0) + (provider.run.updated ?? 0) })) }, null, 2));
