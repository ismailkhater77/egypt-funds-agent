import { runSmartScoreEvaluation } from "../server/smartScoreRunner.ts";

const summary = await runSmartScoreEvaluation();
console.log(JSON.stringify(summary, null, 2));
