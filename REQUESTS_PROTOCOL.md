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
