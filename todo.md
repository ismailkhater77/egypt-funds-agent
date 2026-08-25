# Project TODO

- [x] Configure server-side Supabase URL and secret environment settings without exposing secrets to the browser or chat
- [x] Add EFG Holding source client and parser for fund name, NAV/IC price, and valuation date
- [x] Match EFG records to imported funds and persist validated fund price snapshots with audit metadata
- [x] Make collector writes idempotent and report inserted, unchanged, unmatched, and failed records
- [x] Add protected manual-run and status endpoints
- [ ] Add daily scheduled callback after the expected EFG publication window
- [x] Add unit tests for parsing, matching, idempotency, and run summaries
- [ ] Verify the manual run and scheduled callback in the deployed environment
- [ ] Rotate the Supabase secret key that was exposed in chat before configuring the collector
- [ ] Confirm the compromised Supabase secret was revoked and document that only the replacement key is active
- [ ] Add Vitest coverage for fund-name matching, idempotent unchanged writes, and run-summary counters
