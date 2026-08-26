# Project TODO

- [x] Configure server-side Supabase URL and secret environment settings without exposing secrets to the browser or chat
- [x] Add EFG Holding source client and parser for fund name, NAV/IC price, and valuation date
- [x] Match EFG records to imported funds and persist validated fund price snapshots with audit metadata
- [x] Make collector writes idempotent and report inserted, unchanged, unmatched, and failed records
- [x] Add protected manual-run and status endpoints
- [x] Add daily scheduled callback after the expected EFG publication window (callback implemented at `/api/scheduled/all`; Heartbeat creation remains deployment-gated)
- [x] Add unit tests for parsing, matching, idempotency, and run summaries
- [ ] Verify the manual run and scheduled callback in the deployed environment
- [x] Rotate the Supabase secret key that was exposed in chat before configuring the collector
- [x] Confirm the compromised Supabase secret was revoked and document that only the replacement key is active (user confirmed the old key was disabled)
- [x] Add Vitest coverage for fund-name matching, idempotent unchanged writes, and run-summary counters
- [x] Implement and validate CI Capital fund-price parser for all mapped CI records
- [x] Resolve Beltone ADIB Islamic and Beltone Gems USD records with explicit source mappings before final provider validation
- [x] Implement and validate AFIM fund-price parser for all mapped AFIM records
- [x] Correct and validate Zaldi fund-specific mappings and parsers
- [x] Investigate and implement Beltone, Azimut, Arab African, and HC source parsers or mark unavailable records explicitly
- [x] Run a full multi-provider validation report before deployment
- [ ] Publish only after all supported providers pass validation and then enable the daily schedule
- [x] Replace the legacy Beltone mapping URL with the currently verified official asset-management page and add a Beltone parser integration task
- [x] Verify AFIM completeness by comparing all Supabase/imported AFIM-mapped funds against extracted AFIM records, and fail/report any mapped fund missing from source output
- [x] Add Vitest coverage for AFIM parsing and AFIM fund-name matching using real-like HTML/detail fixtures
- [x] Emit exact matched-fund counts and matched fund IDs in provider run summaries for precise coverage reporting
- [x] Re-check AAIM official NAV source and implement or explicitly document unavailable status
- [x] Re-check CI Capital official TLS, HTTP, and alternate-domain endpoints and implement a secure verified fallback if available
- [x] Verify CI completeness against all funds mapped to the CI source and add an idempotent second-run assertion
- [x] Replace CI card parser with the official Fund Type/Fund Name/Price table parser and add a real HTML fixture test
- [x] Add explicit CI mappings for Banque Misr Money Market Fund (EUR) and PBD & Banque du Caire (Al Wefak), then rerun completeness validation
- [x] Import every distinct fund from the uploaded workbook into Supabase funds, preserving existing matches and marking source as pending when absent
- [x] Verify workbook-to-database completeness after import and produce the source-discovery backlog
- [ ] Discover and verify official Mubasher Asset Management NAV source for all Mubasher funds in the workbook/database
- [ ] Add Mubasher source mapping, parser, idempotent writes, and tests after official source verification
- [x] Verify whether mubasherfunds.info is officially controlled by Mubasher Asset Management/Mubasher Trade, or keep it explicitly classified as affiliated publication
- [x] Update Mubasher support reporting to distinguish affiliated publication coverage from a primary manager NAV feed
- [x] Inspect and document official Suez Canal Bank fund-rate source and extract published NAV/date rows
- [x] Inspect and document official Faisal Islamic Bank investment-funds source and extract published NAV/date rows
- [x] Match both bank sources to existing funds and the 57-source-pending backlog without creating duplicates
- [x] Add verified secondary-source mappings/parsers, tests, and idempotent snapshots for matched Suez Canal/Faisal funds
- [x] Run strict duplicate-name/catalog check after SCB insurance insertion and merge/remove any duplicate if found
- [x] Rerun SCB and Faisal collectors after final inserts and verify all matched snapshots are unchanged
- [x] Produce a final SCB/Faisal validation report with aliases and matched fund IDs
- [x] Run strict cross-field duplicate audit using canonical_name and eima_name_raw with exact and normalized keys, and save an artifact
- [x] Add an explicit SCB/Faisal alias mapping table to the final validation report
- [x] Re-freeze the current 53 uncovered workbook funds and classify each by provider/manager before source discovery
- [ ] Research official NAV sources for the uncovered bank, asset-manager, and independent-fund groups in priority order
- [ ] Add only verified source mappings/parsers and preserve explicit pending status where no reliable source exists
- [x] Re-run all collectors and refresh workbook coverage after each completed source group
- [x] Re-run EFG official parser after tolerating whitespace in IC Price headers and link additional EFG-mapped funds
- [x] Add Mubasher daily article/category parsers with EGP/USD separation, date validation, aliases, and source provenance
- [x] Validate Mubasher/EFG changes with TypeScript, 14 collector tests, Supabase secret test, and live Run All
- [x] Add regression coverage for Mubasher articles whose date omits the year and for USD category tables
- [x] Rerun the expanded Mubasher category set twice and confirm zero new duplicates on the second run
- [x] Resolve only evidence-backed Mubasher Arabic/English aliases from the current catalog, with no fuzzy or ambiguous matches
- [x] Re-run Mubasher categories after approved aliases and verify source-level idempotency
- [x] Add and validate the official ABK-Egypt Equity Fund NAV parser/source for ABK Fund I
- [x] Confirm ABK Fund II remains pending unless a separate verified NAV endpoint is found
- [x] Remove unsupported Mubasher aliases such as Aafaq, Horus, and Weladna unless exact catalog records are proven
- [x] Produce a Mubasher alias-audit artifact with published name, exact catalog record, and evidence source
- [x] Recheck official/public sources for EBank El Khabeer, BLOM, Pharos, and Pioneers; reject stale, secondary, or identity-mismatched values
- [x] Document why the four rechecked groups remain pending rather than storing unsupported current prices

## Batch: seven funds requested by user
- [x] Verify official source, live NAV, and explicit valuation date for NI Capital Sahmy
- [x] Verify official source, live NAV, and explicit valuation date for NI Capital Sahmy 70 / EGX 70
- [ ] Verify official source, live NAV, and explicit valuation date for NI Capital 15/30
- [ ] Verify official source, live NAV, and explicit valuation date for GIG Makaseb First Tranche
- [ ] Verify official source, live NAV, and explicit valuation date for GIG Makaseb Second Tranche
- [ ] Verify official source, live NAV, and explicit valuation date for Education for Life
- [ ] Verify official source, live NAV, and explicit valuation date for FAB Misr Ezdhar
- [ ] Add only the seven fully verified sources to Run All, persist validated snapshots idempotently, and refresh coverage

## FABMISR weekly valuation behavior
- [x] Model Ezdehar as a weekly-priced fund and document the expected no-new-valuation outcome
- [x] Distinguish weekly no-new-valuation from network/parser/source failure in the FABMISR collector
- [x] Add Vitest coverage for a valid weekly NAV, a no-new-valuation day, and a real fetch/parse failure
- [x] Run FABMISR and Run All, refresh coverage, and save the verified behavior in the batch report
- [x] Add collector-level tests for FABMISR: weekly no-new-valuation success, fetch failure, and parser/source-structure failure
- [x] Make FABMISR parser recognize the official NAV section before classifying an empty result as weekly no-new-valuation

## User-provided source batch
- [ ] Verify current NI Capital prices for Sahmy, Sahmy 70, 15/30, GIG Makaseb tranches, and Education for Life
- [ ] Verify current PFI prices for Housing & Development Bank (Mawared) and any matched GIG funds
- [ ] Verify current Azimut prices for Ebank El Khabeer, Bank ABC Fund I, Ebank Fund II, Menthum, and Target Maturity 2027 USD
- [x] Verify Alpha Odin official NAV/valuation-date evidence for Odin Trend, Maksab tranches, and Al Masry (official page inspected; no current NAV/date exposed, records remain Pending)
- [x] Verify whether Aton/Pharos links are authoritative and contain current NAV plus valuation dates (identity supported; no current NAV/date published, so Pharos remains Pending)
- [ ] Add only fully verified new source mappings and refresh coverage; preserve --, stale, or undated records as Pending Verification
- [x] Reject future-dated Azimut NAV rows and add a regression test before accepting official API records
- [x] Quarantine previously stored future-dated Azimut snapshots as rejected without deleting audit history, then verify coverage excludes them (metadata quarantine; DB status constraint remains validated-only)
- [x] Exclude future-dated validated snapshots from workbook coverage calculations and document the as-of date
- [x] Classify the 22 duplicate fund/date price groups by source and NAV, then flag only same-source duplicates as integrity violations
- [x] Produce a duplicate-price audit artifact and preserve legitimate multi-source snapshots without deleting data blindly
- [x] Remove the ambiguous Mubasher alias mapping for Delta Life cash fund and document the existing conflicting snapshot as pending identity review
- [x] Implement and validate the official EBank Market Updates parser for Khabeer, Money Market, and Konooz with future-date rejection and idempotent writes
- [x] Re-run the official EBank collector and prove 3 unchanged with zero new inserts
- [x] Add an EBank idempotency regression test or saved run artifact for the three official fund records
- [x] Reconcile Azimut Target Maturity 2027 USD: verify the valid 25-Aug NAV maps to the workbook fund_id and is included in coverage
- [x] Add exact CI Capital aliases for Menthum USD and Banque Misr Money Market EUR, validate dated NAVs, and rerun CI idempotently

## Regression: actual NAV date versus next update date
- [ ] Inspect Beltone, Azimut, HC Securities, and Zaldi parsers and identify the exact actual-date field versus next-update field
- [ ] Fix the four parsers to persist the latest actual NAV date and ignore next-update dates
- [x] Add B-Cobonat regression fixtures proving two identical prices retain the actual date rather than changing to the future date
- [x] Rerun the four collectors, Run All, coverage, duplicate audit, TypeScript, and Vitest after the date-field fix

- [ ] Add a regression invariant across Beltone 30/60, Azimut 5/30, HC Securities 4/14, and Zaldi 2/4: identical NAV values must not receive a future next-update date; preserve the last verified actual valuation date instead

- [x] Add an end-to-end B-Cobonat persistence test proving a future scheduled date reuses the prior same-NAV/same-currency validated date without POSTing a new snapshot
- [x] Document provider limitations: Azimut exposes an actual historical graph; current Beltone, HC Securities, and Zaldi payloads expose no separate actual valuation-date field, so changed-NAV future-dated rows remain rejected
- [x] Rerun Beltone, Azimut, HC Securities, and Zaldi after the date-resolution change and verify zero newly written future validated rows
- [x] Run All collectors, refresh workbook coverage, and rerun the strict duplicate/conflict audit after the date-resolution change
