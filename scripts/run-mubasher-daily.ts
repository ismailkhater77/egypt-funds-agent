import { runMubasherDailyCollector } from '../server/efgCollector';
const result = await runMubasherDailyCollector();
console.log(JSON.stringify(result, null, 2));
