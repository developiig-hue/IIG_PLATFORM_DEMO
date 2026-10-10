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


## BILINGUAL EMAIL LETTER EDITOR — OWNER APPROVED 2026-10-07

ADMIN_2 may prepare and edit the accompanying email text independently for UA and EN before a Digest campaign.

Default behavior:
- opening the Mailing Center automatically loads the previously approved standard text for the selected language;
- UA and EN templates are stored separately;
- subject and rich HTML body are persisted server-side on paid hosting;
- GitHub Pages DEMO stores editor changes only in browser-local storage for UI verification.

ADMIN_2 rich-text controls include:
- bold;
- italic;
- underline;
- upper/lower/sentence case;
- heading;
- bulleted and numbered lists;
- HTTPS link insertion;
- remove formatting.

System-protected behavior:
- `{{greeting}}` is the personalization token; if ADMIN_2 removes it, backend prepends a polite personalized greeting automatically;
- unsubscribe is NOT part of editable content authority: backend appends the signed unsubscribe link to every real email after template rendering;
- unsafe HTML/scripts/forms/event handlers are rejected by backend;
- recipient language selects the corresponding saved UA or EN template automatically.

Production API:
- `GET /api/v1/mailing/template/:language`;
- `POST /api/v1/mailing/template/:language`;
- `POST /api/v1/mailing/template/:language/reset`.

Role boundary remains unchanged:
- ADMIN_2 edits/saves UA and EN email text and can send a test;
- ADMIN_1 alone starts final mass mailing.

Marker: `IIG_MAIL_TEMPLATE_EDITOR_V35`.


## UA ADDRESS MAIL MASTER V36 — OWNER APPROVED 2026-10-07

The automatic UA accompanying email default is owner-approved and loads into the ADMIN_2 editor by default.

Personalization rule:
- visible template starts with `Шановний {{name}} !`;
- `{{name}}` is replaced at send time by the exact `name` field stored for the recipient in the IIG contacts base;
- if the contact name is empty, fallback is `Шановний колего !`.

Approved UA subject:
`IIG Monthly Digest — промислова енергетика | Вересень 2026`

Approved UA body contains:
- announcement of the September 2026 IIG Monthly Digest;
- practical overview description;
- four bullet points: Ukrainian industrial generation, world industrial-energy practice, financing/regulation, Chief Engineer advice;
- bold statement that the Digest is attached as PDF;
- active `РОЗМІСТИТИ ПРОЄКТ` link;
- signature: `Ігор Кривошей · Директор з розвитку IIG s.r.o.`;
- visible unsubscribe line.

DEMO unsubscribe may display the approved mailto fallback. In production, backend MUST replace that unsubscribe action with the recipient-specific signed HTTPS unsubscribe URL that moves the address to the suppression list after confirmation.

Marker: `IIG_UA_MAIL_MASTER_V36`.


## PAID-HOSTING MIGRATION LOCK — UA MAIL MASTER V36

This behavior is a hard migration contract and MUST survive the move from GitHub Pages DEMO to paid hosting / production domain:

- UA default accompanying email remains the OWNER-approved V36 MASTER.
- The first line remains `Шановний {{name}} !`.
- `{{name}}` is populated from the unified IIG contact-base `name` field for the exact recipient.
- Empty name fallback remains `Шановний колего !`.
- Subject remains the approved Digest subject for the current issue.
- The body retains the approved structure, PDF notice, `РОЗМІСТИТИ ПРОЄКТ` CTA and signature `Ігор Кривошей · Директор з розвитку IIG s.r.o.`.
- ADMIN_2 may edit/save UA and EN letter templates but cannot start final mass mailing.
- ADMIN_1 remains the only role authorized to start the real mass campaign.
- Production unsubscribe MUST be a recipient-specific signed HTTPS link and must place the address into suppression after confirmation.
- A static/demo mailto unsubscribe MUST NOT be used as the production suppression mechanism.
- Recipient language continues to select the matching UA/EN template automatically.
- Sender identity remains `IIG Monthly Digest <digest@iig.energy>`.

Any deployment that loses these invariants is a RELEASE BLOCKER.

Migration marker: `IIG_UA_MAIL_MASTER_V36_MIGRATION_LOCK`.


## RED TEAM MAILING GREEN CHECK — 2026-10-10

Purpose: force a fresh CI validation of the current Digest mailing robot before OWNER single-address test send.

Acceptance scope:
- locked UA V36 standard letter remains default;
- ADMIN_2 test-send path remains separate from ADMIN_1 mass send;
- exact approved Digest SHA gate remains mandatory;
- SMTP/unsubscribe/secrets remain backend-only;
- contact suppression and consent tests remain release-blocking;
- GitHub Pages DEMO must clearly report production backend as not connected rather than simulate delivery.

Marker: `IIG_MAILING_REDTEAM_GREEN_CHECK_2026_10_10`.
