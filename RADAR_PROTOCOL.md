# IIG RADAR ADMIN SEARCH — ADMIN MASTER UI CONTRACT

Status: OWNER REQUESTED / IMPLEMENTED — 2026-10-07  
Marker: `IIG_RADAR_EPHEMERAL_V39`

## Accepted UI location

`ADMIN MASTER → Розсилка та база → RADAR · ЦІЛЬОВИЙ ПОШУК ПОТЕНЦІЙНИХ КЛІЄНТІВ`.

## Accepted operator flow

`1 пошук → тимчасова таблиця → Excel → скидання → ручне рішення ADMIN_2`.

1. ADMIN_2 enters target query.
2. ADMIN_2 chooses country/market, industry and maximum candidates.
3. ADMIN_2 presses `▶ ЗАПУСТИТИ RADAR · ADMIN_2`.
4. A new run replaces any previous generated set.
5. Results are shown only in the current Admin session.
6. Required visible fields:
   - company;
   - full name;
   - position;
   - email;
   - short relevance/current signal;
   - source.
7. ADMIN_2 checks the result.
8. ADMIN_2 presses `⬇ СКАЧАТИ ЗГЕНЕРОВАНУ БАЗУ В EXCEL`.
9. ADMIN_2 presses `✕ СКИНУТИ ГЕНЕРАЦІЮ`.
10. If useful, ADMIN_2 manually adds selected rows to the common IIG client base through the accepted contact-base import/edit workflow.

## No automatic accumulation

RADAR must NOT automatically:
- add candidates to the common IIG contact base;
- add candidates to mailing recipients;
- create ACTIVE subscribers;
- accumulate generated sets on the site;
- persist the generated list in cloud storage;
- save generated rows to browser localStorage.

The common IIG client base and Mailing Center remain separate from RADAR generation.

## DEMO / GitHub Pages mode

GitHub Pages must not simulate a successful RADAR run with invented or preloaded client contacts.

On GitHub Pages:
- the real RADAR controls remain visible for acceptance/UI review;
- pressing RUN must not fabricate companies, names, positions or emails;
- the UI explains that the real live scan requires the private backend;
- no real generated contact list is stored in Git, localStorage or another demo file.

A green RADAR success state is permitted only when the production backend confirms a real external scan.

## Production mode

Paid hosting uses:
- `POST /api/v1/radar/search`;
- private server-side search provider;
- response `mode=EPHEMERAL`;
- `persisted=false`.

Provider configuration remains server-side:
- `IIG_RADAR_SEARCH_ENDPOINT`;
- `IIG_RADAR_SEARCH_TOKEN`.

## Excel contract

File name pattern:
`IIG_RADAR_Target_Search_YYYY-MM-DD.xls`.

Columns:
- Компанія
- ПІБ
- Посада
- Email
- Країна
- Галузь
- Актуальність
- Джерело

## Reset contract

`СКИНУТИ ГЕНЕРАЦІЮ`:
- clears the current in-memory rows;
- disables Excel/reset buttons;
- returns the block to “ready for new search”;
- does not delete or alter the manually maintained common IIG client base.

## Migration hard lock

Paid hosting must preserve:
- one-search/one-temporary-set behavior;
- contact detail fields;
- Excel download;
- reset generation;
- no automatic RADAR → mailing transfer;
- no generated lead-base accumulation in cloud storage;
- manual ADMIN_2 transfer into the common IIG client base only.

Any implementation that changes RADAR back into an accumulating cloud lead registry is a RELEASE BLOCKER.

Marker: `IIG_RADAR_DEMO_EPHEMERAL_V39`.


## CONTACT-COMPLETE DOWNLOADABLE SET

The accepted generated RADAR table is a practical contact list, not a generic company-signal list.

Each downloadable row must show:
- company;
- full name;
- position / role;
- email;
- one concise relevance sentence;
- source URL.

If full name, position or email cannot be verified, RADAR must not invent it. That discovery is omitted from the downloadable target-contact set.

## MANUAL IIG-BASE TRANSFER

There is no RADAR auto-promote button in the accepted workflow.

After Excel download, ADMIN_2 manually adds/imports only the selected useful contacts into the common IIG contact base.

Mailing Center reads only the common IIG base. A contact manually entered by ADMIN_2 participates in mailing only when its common-base status is ACTIVE. PENDING remains excluded; UNSUBSCRIBE/SUPPRESSED remains blocked.

## NO GENERATED-BASE HISTORY

Neither DEMO nor production may maintain a visible or hidden history of generated RADAR client bases.

Allowed:
- current in-memory browser rows;
- downloaded Excel on ADMIN_2's computer;
- non-PII audit metadata.

Forbidden:
- localStorage generated-base cache;
- PostgreSQL generated candidate rows for this ADMIN workflow;
- object/cloud file copy;
- automatic CRM/mailing insertion.


## LIVE RADAR 1000+ SOURCES — V40

A production run is successful only when the backend receives provider evidence that at least 1000 real external web sources were processed.

Required request:
- min_sources >= 1000
- deep_scan = true

Required response:
- scanned_sources >= 1000
- rows[] containing only contact-complete verified output rows

The number of final contacts may be much lower than 1000; 1000 is the minimum discovery/source-processing depth.

Fake DEMO contacts, static snapshots and cached pre-generated contact lists cannot satisfy this requirement.

Marker: `IIG_RADAR_LIVE_1000_V40`.


## ACTIVE RUN REPLACEMENT — OWNER VERIFIED

When ADMIN_2 changes industry/query and starts RADAR again while another run is active:
- the old run is superseded;
- old polling is ignored;
- the old crawler is cancelled on backend;
- the new run starts without a 409 conflict;
- only the latest run may render results.

Owner E2E pass:
Energy active → Agro launch → Energy superseded → Agro success.
Agro run `live-3c4f59fa519d475e`: 1006 pages processed, 716 external domains discovered, 18 seeds, 7 contact rows.

Marker: `IIG_RADAR_RUN_REPLACEMENT_V46`.
