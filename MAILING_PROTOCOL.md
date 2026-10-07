# IIG MAILING CENTER PROTOCOL

## Version
V33 — OWNER MAILING OPERATIONS CONTRACT — 2026-10-07

## Canonical workflow

`ADMIN_1 approved Digest → ADMIN_2 selects exact PDF from computer → backend SHA-256 match → ACTIVE IIG contacts → language routing → test send → ADMIN_1 mass send → campaign ledger → unsubscribe/suppression`.

## Roles

- **ADMIN_2** may upload the already approved PDF and run a test email.
- **ADMIN_1** is the only role allowed to start the real mass mailing.
- Neither role can override the server-side approved-Digest SHA check.

## Approved PDF gate

The mailing PDF is accepted only if:
1. it is a valid PDF;
2. the selected language is UA or EN;
3. the server already has the corresponding ADMIN_1-approved CURRENT Digest;
4. uploaded PDF SHA-256 is exactly equal to that approved CURRENT binary.

Failure is `PDF_NOT_EQUAL_TO_ADMIN1_APPROVED_CURRENT` and mailing remains blocked.

## Recipient rules

Only contacts satisfying all conditions are eligible:
- `status=ACTIVE`;
- `marketing_consent=true`;
- no `unsubscribed_at`.

PENDING, SUPPRESSED, unsubscribed and invalid contacts are excluded.

Each contact is routed by its saved language:
- UA → Ukrainian locked email MASTER + UA approved PDF;
- EN → English version + EN approved PDF.

UA is default. EN is used only when the contact explicitly carries EN.

## Locked email MASTER

The mailing preserves the previously accepted IIG email contract:
- subject: `IIG Monthly Digest — промислова енергетика | [Місяць, рік]` for UA;
- personalized polite greeting;
- concise Digest introduction;
- PDF as attachment, never inline;
- IIG signature;
- unsubscribe link in every message.

The server, not the browser, generates subject/body/unsubscribe.

## Unsubscribe

Every real email contains a signed unsubscribe link. The link opens a confirmation page to avoid accidental unsubscribe by email scanners.

After confirmation:
- contact becomes `SUPPRESSED`;
- `marketing_consent=false`;
- `unsubscribed_at` and reason/source are persisted;
- the contact is excluded from all later mailings;
- Admin contact table shows `UNSUBSCRIBE / SUPPRESSED` in red for the exact email.

Re-import MUST NOT silently reactivate an unsubscribed contact.

## Campaign ledger

Every mass mailing stores:
- campaign ID;
- started_by;
- start/completion timestamps;
- recipient count;
- sent count;
- failed count;
- per-recipient failures without exposing them publicly.

## SMTP / hosting

Credentials are server-side only:
- `IIG_SMTP_HOST`
- `IIG_SMTP_PORT`
- `IIG_SMTP_SECURE`
- `IIG_SMTP_USER`
- `IIG_SMTP_PASS`
- `IIG_MAIL_FROM`
- `IIG_UNSUBSCRIBE_SECRET`
- `PUBLIC_BASE_URL`

No SMTP credentials, Admin tokens or subscriber PII may be committed to Git or embedded in public JavaScript.

## Stable API

- `GET /api/v1/contacts`
- `POST /api/v1/mailing/digest`
- `GET /api/v1/mailing/status`
- `POST /api/v1/mailing/test`
- `POST /api/v1/mailing/send`
- `GET /unsubscribe?token=...`
- `POST /unsubscribe`

## Release blockers

Migration/deployment is blocked if:
- ADMIN_2 can upload a non-approved PDF;
- mass send is possible without ADMIN_1;
- SUPPRESSED contacts are included;
- language routing ignores saved contact language;
- unsubscribe does not persist;
- unsubscribed address does not appear red in Admin;
- campaign results are not recorded;
- SMTP secrets or PII leak to Git/static assets.

Marker: `IIG_MAILING_V33`.


## FIXED SENDER IDENTITY — OWNER APPROVED 2026-10-07

The canonical From header for all IIG Monthly Digest messages is:

`IIG Monthly Digest <digest@iig.energy>`

The sender display name and mailbox must be preserved across staging, production, hosting changes and UA/EN campaigns. Set `IIG_MAIL_FROM="IIG Monthly Digest <digest@iig.energy>"` server-side. SPF, DKIM, DMARC and mailbox/SMTP authorization for `iig.energy` must be verified before sending; do not assume ownership or live mailbox provisioning merely from this protocol.


## ADMIN_2 MASTER CONTACT-BASE IMPORT — OWNER APPROVED 2026-10-07

Before a Digest mailing, ADMIN_2 may upload the current approved IIG recipient MASTER in XLSX/XLS/CSV. The file may contain contacts consolidated from:
- public website applications/subscriptions;
- approved RADAR contacts;
- contacts added manually by IIG;
- a previously exported IIG MASTER updated offline.

Production endpoint: `POST /api/v1/contacts/import`.

Role contract:
- **ADMIN_2** — upload/merge recipient MASTER and review import report;
- **ADMIN_1** — final control and the only role permitted to press the red `ЗАПУСТИТИ РОЗСИЛКУ · ADMIN_1` action.

Import is a merge, never a destructive replacement:
- canonical key is normalized e-mail;
- new valid contacts are added;
- existing contacts are updated;
- invalid rows are rejected and counted;
- ACTIVE requires explicit marketing consent / consent evidence;
- PENDING contacts are not mailed;
- existing `UNSUBSCRIBE / SUPPRESSED` contacts remain suppressed even when an uploaded file marks them ACTIVE;
- imported data never deletes request history or unsubscribe evidence.

The Admin must display an import result with total / added / updated / invalid / preserved-suppressed counts and refresh the unified contact base immediately after a successful import.

This role separation is release-blocking: base import may be delegated to ADMIN_2; mass mailing authority remains ADMIN_1 only.

Marker: `IIG_CONTACT_BASE_IMPORT_V34`.
