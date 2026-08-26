import { runMubasherCollector } from '../server/efgCollector';
const result = await runMubasherCollector();
console.log(JSON.stringify(result, null, 2));
