import { runAllCollectors } from "../server/efgCollector.ts";

const summary = await runAllCollectors();
console.log(JSON.stringify(summary, null, 2));
