import { runSndukAuthorizedCollector } from "../server/efgCollector";

console.log(JSON.stringify(await runSndukAuthorizedCollector(), null, 2));
