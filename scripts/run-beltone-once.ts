import { runBeltoneCollector } from "../server/efgCollector";

const summary = await runBeltoneCollector();
console.log(JSON.stringify(summary, null, 2));
if (summary.status === "failed") process.exit(1);
