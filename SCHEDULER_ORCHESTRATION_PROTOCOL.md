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
