import { runFabMisrCollector, runNiCapitalCollector } from "../server/efgCollector";

const [niCapital, fabMisr] = await Promise.all([runNiCapitalCollector(), runFabMisrCollector()]);
console.log(JSON.stringify({ niCapital, fabMisr }, null, 2));
