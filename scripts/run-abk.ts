import { runAbkCollector } from "../server/efgCollector";
const result = await runAbkCollector();
console.log(JSON.stringify(result, null, 2));
