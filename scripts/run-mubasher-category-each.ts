import { runMubasherCategoryCollectors } from "../server/efgCollector";
const results = await runMubasherCategoryCollectors();
console.log(JSON.stringify(results, null, 2));
