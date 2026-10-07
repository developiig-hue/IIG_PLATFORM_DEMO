# IIG REQUESTS / SUBSCRIPTIONS PROCESSING PROTOCOL

## Version
V31 — OWNER COMMERCIAL INTAKE CONTRACT — 2026-10-07

## Purpose
This protocol protects the commercial intake path of the IIG website:

**Public Form → protected backend → single requests registry → Admin / Обробка Заяв та Підписки → ADMIN_2 download + processing → unified IIG contacts database.**

The three canonical intake types are:
1. `project` — Розмістити проєкт.
2. `engineer` — Задати питання Головному інженеру.
3. `subscribe` — Підписка на Digest.

## Source of truth
Production source of truth is the private server registry under `IIG_REQUESTS_DIR` or an equivalent transactional database implementation. PII MUST NOT be committed to Git or written to public static assets.

GitHub Pages localStorage is DEMO-only and is never production authority.

## Immutable request history
Every valid submission receives:
- unique request ID;
- canonical type;
- `received_at`;
- form fields exactly relevant to that intake type;
- consent text / consent flag;
- processing state;
- download audit;
- promotion-to-contact audit.

Original submissions remain in the lifetime registry. Processing or promotion MUST NOT delete the original request.

## Lifetime counters
For each of the three queues Admin must see:
- TOTAL received since registry activation;
- NEW / not processed;
- DOWNLOADED;
- PROCESSED.

ADMIN_1 must also see total cross-queue lifetime counters. Counters are derived from the persistent registry, not from current UI cards.

## ADMIN_2 processing hard gate
A request is NOT processed merely because it was viewed.

Canonical sequence:
`NEW → Excel served/downloaded_at → ADMIN_2 checkbox → PROCESSED`.

Backend MUST reject `processed=true` if `downloaded_at` is absent. ADMIN_2 identity and timestamp are stored in `processed_by` / `processed_at`.

ADMIN_1 is the control/oversight role and can view/export counters. The processing checkbox is assigned to ADMIN_2.

## Excel export
Each of the three columns has an independent Excel-compatible export action at the bottom. Export contains the full queue fields and audit columns. Production endpoint:
`GET /api/v1/requests/export/:type.xls`.

Serving an export atomically adds `downloaded_at` and `downloaded_by` to previously undownloaded records of that type.

## Unified contacts database
After processing, ADMIN_2 may promote the request to IIG contacts:
- PROJECT / ENGINEER → PENDING (request-response consent is not marketing consent);
- SUBSCRIBE with explicit Digest consent → ACTIVE.

Suppression/unsubscribe state remains authoritative and must not be overridden by later imports.

## Public form security
Public intake uses `POST /api/v1/requests` with:
- required-field and consent validation;
- form-type allowlist;
- anti-bot honeypot;
- per-source rate limiting;
- origin policy;
- source IP stored only as a salted one-way hash;
- request size limits at reverse proxy/backend.

## Portability
Paid-hosting/domain migration MUST preserve the stable API:
- `POST /api/v1/requests`
- `GET /api/v1/requests`
- `GET /api/v1/requests/stats`
- `GET /api/v1/requests/export/:type.xls`
- `POST /api/v1/requests/:id/processed`
- `POST /api/v1/requests/:id/promote-contact`

Migration is RELEASE-BLOCKED if any of the following fail:
- public form does not create a server request;
- lifetime counters reset unexpectedly;
- Admin cannot distinguish the 3 intake types;
- Excel export does not mark download audit;
- request can be marked processed without prior download;
- ADMIN_2 identity/timestamp is not persisted;
- processed request cannot be promoted to contacts;
- PII is exposed in Git/static assets.

## Status
**HARD RULE / COMMERCIAL INTAKE / PII / RBAC / PORTABLE / RELEASE-BLOCKING.**


## ADMIN MASTER UI HARD LOCK

Approved working visual reference: `admin-ua.html#requests` as accepted by IIG owner on 2026-10-07.

This requests/subscriptions screen is now a HARD-LOCKED UI contract. Future changes MUST preserve:
- the existing IIG ADMIN MASTER shell and left navigation;
- the section title `ОБРОБКА ЗАЯВ ТА ПІДПИСКИ`;
- ADMIN_1 oversight and ADMIN_2 processing-role separation;
- top lifetime counters;
- the HARD RULE notice;
- the refresh-registry action;
- exactly three operational lanes in the current order: PROJECT → ENGINEER → SUBSCRIBE;
- per-lane TOTAL / NEW / DOWNLOADED / PROCESSED counters;
- request stream inside each lane;
- Excel export action at the bottom of each lane;
- the rule that processing is impossible before download;
- promotion to the unified IIG contacts base only after processing.

Do NOT replace this accepted ADMIN MASTER screen with a separate simplified `/admin/` application, a new layout, or an alternate navigation model.

The canonical staging entry point is:
`/admin-ua.html#requests`

The short `/admin/` route may only redirect to that canonical view until a production reverse proxy maps the same ADMIN MASTER shell server-side.

Any future redesign that changes the accepted layout or processing sequence requires explicit owner approval and is otherwise a RELEASE BLOCKER.


## OWNER-VERIFIED E2E PASS — SUBSCRIBE

Date: 2026-10-07  
Status: **OWNER VERIFIED / ACCEPTED / MUST SURVIVE HOSTING MIGRATION**

The IIG owner physically executed the Subscribe intake flow in the accepted GitHub Pages ADMIN MASTER demo and confirmed the following end-to-end behavior:

1. A public visitor submitted the `SUBSCRIBE` form with real test data.
2. The submission appeared in `Admin → Обробка Заяв та Підписки → ПІДПИСКА НА DIGEST`.
3. The request preserved the submitted identity/contact fields, submission timestamp, language and consent evidence.
4. The per-column Excel export downloaded successfully with the submitted data.
5. The export established the download audit (`downloaded_at` / ADMIN_2 download state).
6. ADMIN_2 processing completed successfully and the request became `ОБРОБЛЕНО`.
7. The processed record was consolidated into the IIG contacts workflow and displayed `У БАЗІ IIG`.
8. The lifetime request remains visible/auditable; processing does not delete the source submission.

This observed sequence is accepted as the canonical behavior:

`PUBLIC SUBSCRIBE → REQUEST REGISTRY → ADMIN SUBSCRIBE LANE → EXCEL DOWNLOAD → downloaded_at → ADMIN_2 PROCESSED → IIG CONTACTS`

### Public UX privacy rule

Internal environment/debug text MUST NOT be shown to the public visitor after a successful form submission. In particular, the former GitHub Pages message beginning with `✓ DEMO:` is prohibited on the public form.

The static DEMO fallback may continue storing the test record in browser-local storage for ADMIN MASTER workflow verification, but that implementation detail is not reader-facing.

### Paid-hosting preservation rule

When moving IIG to paid hosting, the implementation MAY replace browser-local demo persistence with PostgreSQL/private transactional storage, but the owner-verified business sequence above MUST NOT change.

Migration is RELEASE-BLOCKED if any of these regress:
- subscribe submission does not enter the canonical request registry;
- Admin Subscribe lane does not receive it;
- exact submitted fields/consent/timestamp are lost;
- Excel does not contain the record;
- Excel delivery does not create a download audit;
- processing is possible before download;
- ADMIN_2 processing state/timestamp is lost;
- processed Subscribe cannot enter the unified IIG contact base;
- source request disappears after processing;
- internal DEMO/backend/debug implementation text becomes visible to the public user.

Machine guard marker: `OWNER_VERIFIED_SUBSCRIBE_E2E_V32`.


## CONTACT BASE VISIBILITY / EXPORT CONTRACT

Status: OWNER-REQUESTED / ACCEPTED EXTENSION — 2026-10-07.

When a processed request has been promoted to the unified IIG contacts base and the request card shows `✓ У БАЗІ IIG`, that state MUST be directly verifiable by ADMIN:

1. The `✓ У БАЗІ IIG` control opens `Розсилка та база → Керування базою контактів`.
2. The exact promoted contact is searchable and visible there.
3. The complete current IIG contacts base can be exported through `⬇ СКАЧАТИ БАЗУ IIG В EXCEL`.
4. The export contains at minimum: email, name, company, position, source, language, contact status and consent evidence.
5. In GitHub Pages DEMO, promoted contacts persist in browser-local storage under a dedicated contacts key and are reconstructed from request records carrying `promoted_at`.
6. On paid hosting this browser persistence MUST be replaced by private transactional database storage, while preserving the same Admin visibility and export behavior.

A visual `✓ У БАЗІ IIG` without a corresponding retrievable contact in the contact-base view is a RELEASE BLOCKER.

Marker: `IIG_CONTACT_BASE_EXPORT_V32`.
