# News Source Robot — Red-Team Acceptance Report (2026-09-24)

Scope: `scripts/news_source_discovery.py` on `feature/news-robot-pipeline`.
Invariant: discovery never verifies facts, approves content, edits `public-news.json`, or publishes.

## Definition of Done — 10 points

1. **Filesystem & JSON — PARTIAL.** Portable atomic JSON writer implemented and tested on Linux/temp paths. The separately observed Windows `content/` create-file failure is an OS/filesystem condition and remains to be re-tested on that workstation.
2. **Registry 260 — BLOCKED IN REMOTE BRANCH.** Loader enforces exactly 260 sources = 160 P1 + 100 P2, unique IDs, HTTPS and supported sectors. However `content/news-source-registry.json` is not currently present in this GitHub branch, so a real 260-source run cannot start in GitHub Actions.
3. **Discovery RSS/Atom → Sitemap → HTML — PASS OFFLINE.** RSS is used only when configured or declared by source HTML; sitemap and HTML fallbacks are isolated and tested.
4. **Search quality — PARTIAL.** URL canonicalization, junk filtering and cross-source dedup are implemented. Reliable freshness/date validation for sitemap/HTML candidates still requires article-level metadata verification.
5. **Outside-registry enrichment — PARTIAL.** Every discovery candidate is explicitly marked `enrichment_required: true`; actual external corroboration remains a downstream research/content-engine responsibility and is not fabricated by discovery.
6. **Reliability & Security — PASS OFFLINE.** Per-source failure isolation, HTTPS-only URLs, credential/private-literal rejection, DNS public-address guard, redirect guard, response-size limit, timeout and polite inter-source delay are implemented.
7. **Portability / Hosting — PASS.** Paths derive from `Path(__file__).resolve()`; no dependency on `C:\\Users\\...`, GitHub Pages or a fixed domain. GitHub Actions executes successfully on Ubuntu/Linux and includes an explicit portability assertion.
8. **Pipeline integration — PASS CODE / NO PUBLISH.** `content_engine.py` now consumes registry discovery; discovery remains `NOT_VERIFIED`, `ADMIN_ONLY`, `auto_publish=false`. Legacy queue artifacts are excluded from robot-schema verification rather than silently treated as robot output.
9. **Testing — PASS OFFLINE / LIVE BLOCKED.** Seven discovery tests pass in GitHub Actions, plus compile, moderation invariants and portability checks. Live 1→10→260 acceptance is blocked until the 260-source registry file exists in the branch.
10. **Acceptance & GitHub — PARTIAL.** Changes are committed only to the feature branch. PR remains draft; no merge and no publication. Final acceptance requires registry upload + live runs + resulting source statistics.

## CI evidence

GitHub Actions `News Robot Tests (No Publishing)` run #17 completed successfully on Ubuntu/Python 3.12 for commit `a2e4ee5e389310395a5c36f8697985dafc7f5013`.

## Required next acceptance step

Add the approved `content/news-source-registry.json` (260 sources) to this branch, then run:
1. live smoke for first source;
2. live 5–10 prioritized sources;
3. full 260-source cycle with DISCOVERED / NO_MATCH / ERROR and adapter statistics.

No merge until owner approval.
