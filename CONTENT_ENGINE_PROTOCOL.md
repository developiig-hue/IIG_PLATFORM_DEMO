# IIG Content Engine — Production Contract

**Status:** acceptance candidate, 28.09.2026  
**Architecture:** robot 2 of the fixed seven-robot IIG pipeline.

`NEWS_SOURCE_DISCOVERY → CONTENT_ENGINE → {NEWS | CHIEF_ENGINEER_ADVICE} → QUALITY_GATE → ADMIN_REVIEW`

## Ten-point Definition of Done

1. **Functionality.** Accept Discovery v1 handoff as research intake, validate curated evidence, score/deduplicate candidates, route only validated records to NEWS or CHIEF_ENGINEER_ADVICE, and hand both routes to Quality Gate.
2. **Input / Output.** Input schema is `iig.discovery-candidates.v1`; moderation output schema is `iig.content-engine.v3`; run report is `iig.content-engine-report.v1`. Raw Discovery records remain `publishable=false`.
3. **Reliability / isolation.** One rejected curated candidate is recorded with reasons and does not corrupt accepted candidates. Invalid Discovery handoff fails closed when no safe research packet survives. Writes are atomic.
4. **Security.** Only HTTPS source URLs without credentials are accepted into curated output; workflow has repository `contents: read` only and contains no push/deploy/publish command.
5. **Portability / hosting.** All runtime paths resolve from repository root; no workstation path, account ID, Library ID or owner-specific GitHub URL is a runtime dependency.
6. **Integration.** Discovery research packets are consumed explicitly; output declares `next=QUALITY_GATE`. NEWS and CHIEF_ENGINEER_ADVICE are outputs of this robot, not additional robots.
7. **Admin Approval.** Every generated moderation artifact is `READY_FOR_REVIEW`, `publish_authority=ADMIN_ONLY`, `auto_publish=false`. Content Engine cannot publish or mail.
8. **Automated tests.** Tests cover policy, valid/invalid primary source, URL/date validation, Advice four-block contract, routing isolation, bounded scoring, read-only workflow and architecture markers. Acceptance gate validates the generated artifact.
9. **Live test.** Production acceptance is run both standalone and in the Full 260 Discovery workflow so an actual Discovery handoff is processed in the same runner before Content Engine verification.
10. **Acceptance + GitHub.** Feature branch must finish green; only an explicit owner decision may merge it into `main`. Post-merge workflows must be checked separately.

## Fail-closed boundaries

Content Engine does not reinterpret supplementary Discovery links as verified facts. They become research packets only. A record becomes a NEWS/ADVICE moderation candidate only after it satisfies the curated evidence contract, including a verified primary source, project/status evidence and valid source/date metadata.

Chief Engineer Advice uses the mandatory four-block structure **Problem → Checks → Technical solution → Management decision** when the structured Advice payload is present. Missing/short blocks are rejected.

No Content Engine success state is equivalent to publication approval. Quality Gate and Admin Review remain downstream mandatory stages.
