import { runEfgCollector } from "../server/efgCollector";

const result = await runEfgCollector();
console.log(JSON.stringify(result, null, 2));
if (result.status === "failed") process.exit(1);
