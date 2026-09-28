# IIG News Robot — implementation contract

Status: DESIGN / NOT DEPLOYED. Governing editorial rules: `NEWS_EDITORIAL_PROTOCOL.md` and `content/moderation-policy.json`. Issue #2 tracks the nine-article backlog. This document does not assert that discovery, fact checking, writing or publication is implemented.

## Safety and operating model

The scheduled workflow runs with `contents: read`; it must not push to `main`, merge pull requests, deploy pages, or publish from an unreviewed queue. No model or automated step may set `APPROVED`, impersonate an administrator, or infer approval from an issue assignment or workflow success. A successful run with `items: []` is an empty queue, not nine completed articles. Fail closed on invalid records and retain an audit trail.

## Pipeline and data contracts

1. **Discover**: Maintain an audited registry of official project owners, OEM/EPC pressrooms, banks/ECAs and public filings. Each entry records name, canonical HTTPS URL, geography, sector, type, access status, last check, primary/secondary designation and image-rights policy. Fetch dated source documents; store source URL, retrieved timestamp, publication/event dates, content digest and original excerpt. Discovery must never mark `primary_source_verified=true` merely because a URL resolves.
2. **Verify**: Each material claim gets an evidence record `{claim, source_url, source_date, exact_support, verified_by, verified_at}`. Validate project identity, location, stage, dates, capacities, investment vs loan amount, ownership and quotes. Distinguish MoU, approved financing, signed financing, contract, construction, commissioning, PAC and commercial operation. Mark unverifiable claims `UNVERIFIED` and exclude them from publication; do not invent a source, quote or image permission. URL/HTTP checks alone are not fact verification.
3. **Draft**: Prepare UA and EN from the same verified claim ledger. Nine sectors are energy, metallurgy, agriculture, food, chemical, pharma, logistics, datacenters and waste. Each article needs a specific headline, lead, project, financing where known, technology, timeline, attributed participant statements if available, separately labelled IIG engineering analysis, next confirmed stage or disclosed unknowns, source links and dates. Aim for 3,000–5,000 characters per language only when supported. Missing reliable news in a sector means retain its prior verified article, not fabricate a replacement. Require sector-matched, rights-cleared imagery or block release.
4. **Review**: Output a downloadable artifact containing draft articles, claim/source ledger, bilingual text, image rights and a validation report. Status must be `READY_FOR_REVIEW`, `auto_publish=false`, `publish_authority=ADMIN_ONLY`; no approval metadata is filled by the robot. Surface missing evidence, stale links and duplicate slugs explicitly.
5. **Approve**: The human administrator reviews a specific immutable draft revision and records an explicit decision with identity and timestamp. Rejection returns to drafting; changes after approval invalidate approval. The existing read-only scheduled workflow must not perform approval.
6. **Publish**: A separately implemented, explicitly initiated admin-only process validates approval for the exact content digest, checks the nine-sector mapping, bilingual schema, JSON integrity, URLs and image assets, then proposes the site content change for administrator review. Publish only after the administrator authorizes the final deployment. Log commit, deployment and rollback reference. Never interpret an `APPROVED` string in a manually edited JSON as sufficient authorization without authenticated identity and digest binding.

## Implementation milestones

- M1: repository inventory, source registry, discovery adapters and fixture tests; no live publication.
- M2: evidence ledger and independent source/date/stage validators; reject unsupported claims.
- M3: UA/EN draft generation and nine-sector coverage report, with honest gaps.
- M4: downloadable moderation artifact and human review workflow with revision-bound approval.
- M5: separate publish workflow, administrator authorization, staging tests and rollback.

## Acceptance tests

- Empty candidate pool yields an explicit `0 verified candidates` report, not a successful-news claim.
- Invalid or absent `publish_authority`, missing source, wrong project stage, missing translation, unlicensed image, duplicate canonical URL or changed draft digest prevents publication.
- Scheduler has read-only permissions and cannot publish, approve, push or merge.
- Nine verified articles are required only for the one-time backlog if sources support all nine; otherwise report the actual number and preserve existing verified coverage.
- Site deployment and article rendering must be verified separately from workflow success.

Current baseline: `.github/workflows/content-engine.yml` schedules weekly/monthly read-only moderation artifacts; `scripts/content_engine.py` reads `content/candidates/*.json` and emits a queue. There is no confirmed automated discovery, independently verified claim ledger, bilingual authoring, admin approval UI or gated publication workflow. Implement and test each milestone before calling this robot production-ready.
