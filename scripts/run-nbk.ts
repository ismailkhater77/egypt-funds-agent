import { runNbkCollector } from '../server/efgCollector';

const result = await runNbkCollector();
console.log(JSON.stringify(result, null, 2));
