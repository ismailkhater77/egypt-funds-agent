const urls = [
  "https://efgholding.com/en/our-services/mutual-funds",
  "https://www.fabmisr.com.eg/en/personal-banking/investments-funds/al-awal-fund",
];

const results = [];
for (const url of urls) {
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "EgyptFundsPriceAgent/1.0", Accept: "text/html" },
      signal: AbortSignal.timeout(20_000),
    });
    results.push({ url, ok: response.ok, status: response.status, elapsedMs: Date.now() - startedAt });
  } catch (error) {
    results.push({ url, ok: false, error: error instanceof Error ? error.message : String(error), elapsedMs: Date.now() - startedAt });
  }
}

console.log(JSON.stringify({ mode: "sequential-node-fetch", results }, null, 2));
