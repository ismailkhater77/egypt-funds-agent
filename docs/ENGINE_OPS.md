# Engine operations (production)

## Sealed methodology

- Active scoring formulas: **smartscore_v1.0**
- Weights: P 30 · R 25 · B 25 · C 10 · I 10
- Evidence does **not** multiply the score
- Missing components redistribute weight; they are not zero-filled

## Pipelines

| Workflow | Purpose |
|----------|---------|
| `NAV Daily Collectors` | NAV → market data → SmartScore refresh |
| `SmartScore Refresh` | Score-only (manual or Tuesday 18:00 UTC) |
| `CI SmartScore` | Unit tests on engine file changes |

## B transparency

Each evaluation stores `calculation_inputs.benchmark_transparency`:

- available / excluded benchmarks
- configured vs effective weights inside B
- plain-language summary

Detail API also returns `presentation` notes separating **score** from **evidence strength**.

## Change policy

Any formula change requires a new `methodology_version` and side-by-side comparison. Do not rewrite historical v1.0 rows in place.
