import { runPharosCollector } from "../server/efgCollector";

console.log(JSON.stringify(await runPharosCollector(), null, 2));
