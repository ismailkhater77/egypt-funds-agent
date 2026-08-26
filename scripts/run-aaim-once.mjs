import { runAaimCollector } from "../server/efgCollector.ts";

const summary = await runAaimCollector();
console.log(JSON.stringify(summary, null, 2));
