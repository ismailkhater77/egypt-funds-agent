import { runMarketDataCollector } from "../server/marketDataCollector";

const summary = await runMarketDataCollector();
console.log(JSON.stringify(summary, null, 2));
