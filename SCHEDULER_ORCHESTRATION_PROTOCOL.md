# IIG Scheduler / Orchestration Robot #7 — Production Contract

Robot **7 of 7**. It is the final gate before the external email delivery adapter.

## Ten-point Definition of Done
1. Functionality — accepts only an explicitly Admin-approved exact Digest SHA and prepares one scheduled delivery job.
2. Input/Output — `iig.approved-digest.v1 -> iig.orchestration-preflight.v1 -> iig.delivery-job.v1`.
3. Reliability — fail closed; atomic state; duplicate-send ledger.
4. Security — digest SHA binding, reviewer/reason/timestamp, HTTPS-only live checks, strict same-origin IIG paths, no credentials in URLs, DNS/IP SSRF blocking for private/loopback/link-local/reserved/multicast/unspecified addresses.
5. Portability — repository-relative paths; public URLs originate upstream from `IIG_PUBLIC_BASE_URL`; UTC-normalized schedule.
6. Integration — exact `DIGEST (#6) -> SCHEDULER_ORCHESTRATION (#7) -> DELIVERY_ADAPTER`.
7. Admin Approval / NO AUTO — no Digest approval is created here. #7 consumes only `iig.approved-digest.v1`.
8. Tests — approval integrity, publication registry, live URL, timezone and duplicate-delivery tests.
9. Live-test — live IIG website checks plus exact published-slug verification before delivery authorization.
10. Acceptance + GitHub — feature GREEN, PR, owner merge decision, post-merge GREEN.

## Mandatory pre-send gates
A digest item is not considered published merely because its page returns HTTP 200. Its `public_slug` must first exist in the correct public registry:
- NEWS: `content/public-news.json`, `status=APPROVED`, `admin_approved=true`.
- Advice: `content/public-advice.json`.

Then #7 checks live HTTPS for every individual digest item, **Розмістити проєкт**, **Підписатися на Дайджест**, and the IIG site root.

A digest SHA may have only one active `SCHEDULED/DISPATCHED/DELIVERED` ledger record. Actual SMTP/API delivery is performed by a configured external delivery adapter; #7 authorizes and orchestrates it, it does not invent provider credentials.
\n## Portable recipient source\nRobot #7 never reads recipient emails from Git, digest files or site assets. It calls `RecipientProvider.get_active_recipients()` through `scripts/recipient_provider.py`. Production uses `RECIPIENT_PROVIDER=http_api` with `RECIPIENT_PROVIDER_URL` + secret `RECIPIENT_PROVIDER_TOKEN`; migrations change ENV/adapter, not orchestration. `runtime_json` exists only for isolated tests/manual single-recipient checks. Only ACTIVE recipients are returned; production provider owns consent, unsubscribe, bounce and suppression state. Recipient PII must not be committed or uploaded as CI artifacts.\n
## Email delivery artifact contract
- Email body is a short language-specific wrapper only. **The Digest HTML must never be embedded into the email body.**
- UA is the default language. EN is selected only for a recipient whose stored `language=EN`.
- Approved subject: `IIG Monthly Digest — промислова енергетика | [Місяць, рік]` (UA); EN mirror is stored in `content/email/digest-template.json`.
- The approved Digest is delivered as an **application/pdf attachment**. Current approved artifact: `digest/IIG-Monthly-Digest-2026-09.pdf`.
- Every message requires a recipient-specific unsubscribe URL. Missing unsubscribe token/URL blocks delivery; suppression/unsubscribe is owned by Recipient Provider.
- The wrapper contains Submit Project CTA; article links remain active inside the approved PDF.
- No production send may use an inline HTML Digest, even if a mail client can render it.
