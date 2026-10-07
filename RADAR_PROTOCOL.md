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

## DEMO TEST mode

GitHub Pages uses `data/radar-test-latest.json` only as a safe operator test snapshot.

At button press the selected test rows are copied into JavaScript memory only.

The DEMO Admin can:
- see contact name / role / email / relevance / source;
- download the current generated set as an Excel-compatible file;
- reset the generation.

The DEMO does not create CRM/contact records.

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
