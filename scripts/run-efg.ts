import { runEfgCollector } from '../server/efgCollector';

const result = await runEfgCollector();
console.log(JSON.stringify(result, null, 2));
