import { runAfimCollector } from "../server/efgCollector";

const summary = await runAfimCollector();
console.log(JSON.stringify(summary, null, 2));
if (summary.status === "failed") process.exit(1);
