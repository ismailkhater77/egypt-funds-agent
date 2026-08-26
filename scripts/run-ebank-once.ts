import { runEbankCollector } from "../server/efgCollector";

const result = await runEbankCollector();
console.log(JSON.stringify(result, null, 2));
