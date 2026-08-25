import { runZaldiCollector } from "../server/efgCollector";

const summary = await runZaldiCollector();
console.log(JSON.stringify(summary, null, 2));
if (summary.status === "failed") process.exit(1);
