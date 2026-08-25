import { runHcCollector } from "../server/efgCollector";

const summary = await runHcCollector();
console.log(JSON.stringify(summary, null, 2));
if (summary.failed.length > 0) process.exitCode = 1;
