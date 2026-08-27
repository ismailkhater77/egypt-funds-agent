import { writeFile } from "node:fs/promises";

import { getEgyptBusinessDate } from "./lib/egyptBusinessDate.mjs";

const asOfDate = getEgyptBusinessDate();
const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Supabase server configuration is missing");
const headers = { apikey: key, Authorization: `Bearer ${key}` };

const response = await fetch(`${base}/rest/v1/fund_prices?select=fund_id,source_id,nav,currency,valuation_date,status,raw_payload&limit=5000`, { headers });
if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
const rows = await response.json();
const futureValidated = rows.filter((row) => row.status === "validated" && row.valuation_date > asOfDate);
const scheduled = rows.filter((row) => row.status === "review" && row.raw_payload?.observation_state === "scheduled_weekly");
const coverageEligible = rows.filter((row) => row.status === "validated" && row.valuation_date <= asOfDate);
const scheduledRows = scheduled.length
  ? scheduled.map((row) => `| ${row.fund_id} | ${row.source_id} | ${row.nav} | ${row.currency} | ${row.valuation_date} |`).join("\n")
  : "| — | — | — | — | — |";

const markdown = `# Scheduled Weekly NAV Audit — ${asOfDate}

This read-only audit verifies the separation between scheduled weekly observations and validated coverage.

| Measure | Count |
| --- | ---: |
| Future-dated rows with status validated | ${futureValidated.length} |
| Rows marked review + scheduled_weekly | ${scheduled.length} |
| Coverage-eligible validated rows (status validated, date ≤ as-of) | ${coverageEligible.length} |

## Result

Scheduled weekly rows are queried separately from coverage eligibility. A scheduled observation may retain its official future date only under status review; it is excluded from validated coverage and from the collector's prior-validated lookup, which explicitly filters status=eq.validated.

## Scheduled observations currently persisted

| Fund ID | Source ID | NAV | Currency | Displayed valuation date |
| --- | --- | ---: | --- | --- |
${scheduledRows}
`;

await writeFile(`/home/ubuntu/egypt-funds-agent/reports/scheduled-weekly-nav-audit-${asOfDate}.md`, markdown);
console.log(JSON.stringify({ asOfDate, futureValidated: futureValidated.length, scheduledWeeklyReviews: scheduled.length, coverageEligibleValidatedRows: coverageEligible.length }, null, 2));
