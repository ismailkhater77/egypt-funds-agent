import { runPfiCollector } from '../server/efgCollector';

const result = await runPfiCollector();
console.log(JSON.stringify(result, null, 2));
