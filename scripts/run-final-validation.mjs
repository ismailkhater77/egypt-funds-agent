import fs from "node:fs/promises";
import {
  getProviderSupportReport,
  runAfimCollector,
  runAzimutCollector,
  runBeltoneCollector,
  runCiCollector,
  runEfgCollector,
  runHcCollector,
  runZaldiCollector,
} from "../server/efgCollector.ts";

const support = getProviderSupportReport();
const runners = {
  "EFG Holding / Hermes": runEfgCollector,
  Beltone: runBeltoneCollector,
  AFIM: runAfimCollector,
  Zaldi: runZaldiCollector,
  Azimut: runAzimutCollector,
  "HC Securities": runHcCollector,
  "CI Capital": runCiCollector,
};

const results = [];
for (const provider of support) {
  if (provider.status === "unavailable") {
    results.push({ ...provider, run: { status: "unavailable", fetchedRecords: 0, inserted: 0, unchanged: 0, updated: 0, unmatched: [], failed: [{ name: provider.provider, error: provider.note }] } });
    continue;
  }
  try {
    const run = await runners[provider.provider]();
    results.push({ ...provider, run });
  } catch (error) {
    results.push({ ...provider, run: { status: "failed", fetchedRecords: 0, inserted: 0, unchanged: 0, updated: 0, unmatched: [], failed: [{ name: provider.provider, error: String(error) }] } });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  purpose: "Final pre-deployment multi-provider validation",
  policy: "Only official provider data is persisted; blocked or unavailable sources are reported and never fabricated.",
  providers: results,
};
await fs.writeFile("reports/final-multi-provider-validation.json", JSON.stringify(report, null, 2) + "\n");
const lines = [
  "# Final Multi-Provider Validation",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  "| Provider | Support | Run status | Fetched | Inserted | Unchanged | Updated | Unmatched | Failed / reason |",
  "|---|---|---:|---:|---:|---:|---:|---:|---|",
];
for (const item of results) {
  const run = item.run;
  const reason = [run.fetchError, ...(run.failed ?? []).map((f) => f.error)].filter(Boolean).join("; ") || "—";
  lines.push(`| ${item.provider} | ${item.status} | ${run.status} | ${run.fetchedRecords} | ${run.inserted} | ${run.unchanged} | ${run.updated} | ${run.unmatched.length} | ${reason.replaceAll("|", "\\|")} |`);
}
lines.push("", "## Unmatched records", "");
for (const item of results) for (const name of item.run.unmatched ?? []) lines.push(`- ${item.provider}: ${name}`);
lines.push("", "## Interpretation", "", "CI Capital remains blocked by TLS validation on its official host. AAIM remains unavailable because no verified official public NAV table or API was found. Beltone has two intentionally unresolved source mappings: ADIB Islamic and Beltone Gems Equity Fund-USD.", "");
await fs.writeFile("reports/final-multi-provider-validation.md", lines.join("\n"));
console.log(JSON.stringify(report, null, 2));
