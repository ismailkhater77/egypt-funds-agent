import { runAlphaOdinCollector } from "../server/efgCollector.ts";

const summary = await runAlphaOdinCollector();
console.log(JSON.stringify(summary, null, 2));

if (summary.status === "failed" || summary.failed.length || summary.unmatched.length) {
  process.exitCode = 1;
}
