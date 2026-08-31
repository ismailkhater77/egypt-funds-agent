/**
 * Run SmartScore evaluation for available EIMA report dates and persist results.
 * Does not change methodology formulas (smartscore_v1.0).
 *
 * Env:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SMARTSCORE_REPORT_DATE (optional, YYYY-MM-DD) — evaluate a single report date
 */
import { runSmartScoreEvaluation } from "../server/smartScoreRunner.ts";

const startedAt = new Date().toISOString();
const reportDate = process.env.SMARTSCORE_REPORT_DATE || undefined;

console.log(
  JSON.stringify(
    {
      event: "smartscore_run_start",
      startedAt,
      methodologyVersion: "smartscore_v1.0",
      reportDate: reportDate ?? "all_available_reports",
    },
    null,
    2,
  ),
);

try {
  const summary = await runSmartScoreEvaluation(reportDate);
  const finishedAt = new Date().toISOString();
  console.log(
    JSON.stringify(
      {
        event: "smartscore_run_complete",
        startedAt,
        finishedAt,
        ...summary,
      },
      null,
      2,
    ),
  );
} catch (error) {
  const finishedAt = new Date().toISOString();
  console.error(
    JSON.stringify(
      {
        event: "smartscore_run_failed",
        startedAt,
        finishedAt,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
