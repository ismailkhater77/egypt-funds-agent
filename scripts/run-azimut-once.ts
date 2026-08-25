import { runAzimutCollector } from "../server/efgCollector";

const summary = await runAzimutCollector();
console.log(JSON.stringify(summary, null, 2));
if (summary.status === "failed") process.exit(1);
