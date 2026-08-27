import { runMarketDataHistoryImport } from "../server/marketDataCollector";

runMarketDataHistoryImport(7)
  .then(summary => console.log(JSON.stringify(summary, null, 2)))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
