# IIG RADAR ADMIN SEARCH — ADMIN MASTER UI CONTRACT

Status: OWNER REQUESTED / IMPLEMENTED — 2026-10-07  
Marker: `IIG_RADAR_ADMIN_SEARCH_V37`

## Accepted UI location
`ADMIN MASTER → Розсилка та база → RADAR · ПОШУК ПОТЕНЦІЙНИХ КЛІЄНТІВ`.

## Operator flow
1. ADMIN_2 enters search query.
2. ADMIN_2 chooses country/market, industry and maximum candidates.
3. ADMIN_2 presses `▶ ЗАПУСТИТИ RADAR · ADMIN_2`.
4. Admin calls relative endpoint `POST /api/v1/radar/runs`.
5. Backend dispatches Redis queue `radar`.
6. Robot calls the private configured search provider.
7. Candidates are persisted to PostgreSQL `radar_prospects` as PENDING.
8. Admin polls `GET /api/v1/radar/runs/{run_key}`.
9. Candidate table is loaded through `GET /api/v1/radar/prospects`.
10. ADMIN_2 manually checks the source and chooses `До бази IIG` or `Відхилити`.
11. Promotion creates an internal CRM lead/contact with mailing status PENDING.
12. RADAR discovery alone never creates ACTIVE marketing consent.

## GitHub Pages behavior
GitHub Pages remains visual/demo staging and MUST NOT contain search-provider secrets.

For operator acceptance testing, the RADAR button runs a safe **DEMO TEST SEARCH** against the repository artifact `data/radar-test-latest.json`. That artifact is a current public-evidence snapshot generated outside the browser and contains no private provider token. It allows the owner to verify the full Admin interaction: launch → results → source review → reject/check candidate.

The DEMO TEST snapshot is not the production search engine and must never be represented as a live provider call. Paid hosting switches the same button to the private `/api/v1/radar/runs` backend.

The manual CSV/JSON import remains a fallback/recovery path; it is not the primary production RADAR mechanism.

## Migration hard lock
Paid hosting must preserve:
- this Admin block and launch button;
- relative `/api/v1/radar/*` endpoints;
- ADMIN_2 operational launch/moderation;
- ADMIN_1 oversight;
- Redis radar queue;
- PostgreSQL run/prospect history;
- private provider configuration;
- manual review;
- PENDING-not-ACTIVE rule;
- source URL visibility;
- FAILED state when provider is unavailable.

Replacing the robot with static upload-only behavior is a RELEASE BLOCKER.


## DEMO TEST RADAR V38 — 2026-10-07

Accepted test behavior:
- `▶ ЗАПУСТИТИ RADAR · ADMIN_2` works on GitHub Pages;
- it filters the current public-evidence snapshot by selected industry/country and requested result limit;
- the run state becomes `TEST SEARCH…` and then `✓ TEST SUCCESS · N`;
- candidate company, signal, confidence and source link are visible;
- test rejection can be exercised locally;
- promotion to the real IIG CRM remains server-only and therefore cannot create fake production records.

Marker: `IIG_RADAR_DEMO_TEST_V38`.
