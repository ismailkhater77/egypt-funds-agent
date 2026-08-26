import { runAzimutCollector, runBeltoneCollector, runHcCollector, runZaldiCollector } from "../server/efgCollector.ts";

const collectors = [
  ["Beltone", runBeltoneCollector],
  ["Azimut", runAzimutCollector],
  ["HC Securities", runHcCollector],
  ["Zaldi", runZaldiCollector],
];

for (const [name, run] of collectors) {
  try {
    const summary = await run();
    console.log(JSON.stringify({ provider: name, ...summary }));
  } catch (error) {
    console.log(JSON.stringify({ provider: name, error: error instanceof Error ? error.message : String(error) }));
  }
}
