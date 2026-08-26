import { runFaisalCollector, runScbCollector } from "../server/efgCollector";

const [scb, faisal] = await Promise.all([runScbCollector(), runFaisalCollector()]);
console.log(JSON.stringify({ scb, faisal }, null, 2));
