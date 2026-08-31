# Daily pipeline scheduling (GitHub Actions)

Workflow: `.github/workflows/nav-daily.yml`

## Order of steps

1. **Fund NAV collectors** — `scripts/run-all-once.mjs`
2. **Market data collector** — `scripts/run-market-data-once.ts` (non-blocking on failure)
3. **SmartScore refresh** — `scripts/run-smartscore.mjs` (methodology `smartscore_v1.0`, formulas unchanged)

## Schedule

| Trigger | When |
|---------|------|
| Cron | `30 14 * * 0-4` UTC (Sun–Thu ≈ 16:30 Egypt) |
| Manual | Actions → **NAV Daily Collectors** → Run workflow |

## Secrets

| Secret | Purpose |
|--------|---------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server write access |

## SmartScore note

SmartScore evaluations are keyed by EIMA `report_date` and use performance/indicator rows for that report.
Refreshing after NAV collection does **not** invent weekly scores from NAV alone; it re-runs the sealed v1.0 engine on the latest available report inputs so stored evaluations stay current.

Optional single-date run:

```bash
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
export SMARTSCORE_REPORT_DATE=2025-12-31
pnpm exec tsx scripts/run-smartscore.mjs
```

## Manual local pipeline

```bash
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
pnpm exec tsx scripts/run-all-once.mjs
pnpm exec tsx scripts/run-market-data-once.ts
pnpm exec tsx scripts/run-smartscore.mjs
```
