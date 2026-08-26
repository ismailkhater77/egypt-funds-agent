import { runCiCollector } from "../server/efgCollector.ts";

const summary = await runCiCollector();
console.log(JSON.stringify(summary, null, 2));
