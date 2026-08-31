# Daily NAV scheduling (GitHub Actions)

This repository already implements TypeScript collectors (`server/efgCollector.ts`, `scripts/run-all-once.mjs`).
GitHub Actions runs them on a schedule — no separate Python worker system is required.

## Workflow

File: `.github/workflows/nav-daily.yml`

| Trigger | When |
|---------|------|
| Schedule | `30 14 * * 0-4` UTC (Sun–Thu ≈ 16:30 Egypt) |
| Manual | Actions → **NAV Daily Collectors** → Run workflow |

Steps:
1. `pnpm install`
2. `tsx scripts/run-all-once.mjs` (all fund NAV collectors)
3. `tsx scripts/run-market-data-once.ts` (macro series; non-blocking on failure)

## Required secrets

Repo → **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|--------|
| `SUPABASE_URL` | e.g. `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **service role** key (write access to `fund_prices`) |

Do **not** put the service role key in client code or public HTML.

## Security notes

- If a service-role key was ever pasted in chat, **rotate it in Supabase** and update the GitHub secret.
- Personal access tokens used for one-time git push should be revoked after use.
- Prefer the service role only inside Actions / server — never in the browser.

## Manual local run

```bash
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
pnpm exec tsx scripts/run-all-once.mjs
```

## Platform Heartbeat (optional)

The app also exposes cron-only routes:

- `POST /api/scheduled/all`
- `POST /api/scheduled/efg`
- `POST /api/scheduled/market-data`

These require the Forge/Heartbeat cron identity (`isCron`). GitHub Actions does **not** need them; it runs the scripts directly.
