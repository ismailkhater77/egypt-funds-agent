import { runFabMisrAlAwalCollector } from "../server/efgCollector";

console.log(JSON.stringify(await runFabMisrAlAwalCollector(), null, 2));
