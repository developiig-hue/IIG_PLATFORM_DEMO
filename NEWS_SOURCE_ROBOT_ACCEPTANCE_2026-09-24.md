# News Source Robot — Red-Team Acceptance Report (2026-09-24)

Scope: `scripts/news_source_discovery.py` on `feature/news-robot-pipeline`.
Invariant: discovery never verifies facts, approves content, edits `public-news.json`, or publishes.

## Definition of Done — 10 points

1. **Filesystem & JSON — PARTIAL.** Portable atomic JSON writer implemented and tested on Linux/temp paths. The separately observed Windows `content/` create-file failure is an OS/filesystem condition and remains to be re-tested on that workstation.
2. **Registry 260 — PASS.** Approved `content/news-source-registry.json` is now present in the feature branch. Loader and live CI validate exactly 260 sources = 160 P1 + 100 P2, unique IDs, HTTPS and supported sectors.
3. **Discovery RSS/Atom → Sitemap → HTML — PASS OFFLINE.** RSS is used only when configured or declared by source HTML; sitemap and HTML fallbacks are isolated and tested.
4. **Search quality — PARTIAL.** URL canonicalization, junk filtering and cross-source dedup are implemented. Reliable freshness/date validation for sitemap/HTML candidates still requires article-level metadata verification.
5. **Outside-registry enrichment — PARTIAL.** Every discovery candidate is explicitly marked `enrichment_required: true`; actual external corroboration remains a downstream research/content-engine responsibility and is not fabricated by discovery.
6. **Reliability & Security — PASS OFFLINE.** Per-source failure isolation, HTTPS-only URLs, credential/private-literal rejection, DNS public-address guard, redirect guard, response-size limit, timeout and polite inter-source delay are implemented.
7. **Portability / Hosting — PASS.** Paths derive from `Path(__file__).resolve()`; no dependency on `C:\\Users\\...`, GitHub Pages or a fixed domain. GitHub Actions executes successfully on Ubuntu/Linux and includes an explicit portability assertion.
8. **Pipeline integration — PASS CODE / NO PUBLISH.** `content_engine.py` now consumes registry discovery; discovery remains `NOT_VERIFIED`, `ADMIN_ONLY`, `auto_publish=false`. Legacy queue artifacts are excluded from robot-schema verification rather than silently treated as robot output.
9. **Testing — PASS OFFLINE + LIVE SMOKE / FULL 260 PENDING.** Seven discovery tests pass in GitHub Actions, plus compile, moderation invariants and portability checks. A real Linux live smoke validated the registry and produced 30 candidates while scanning 8 prioritized P1 sources (1 source with no match/error) before the configured item limit stopped the run. Full 260 acceptance remains pending.
10. **Acceptance & GitHub — PARTIAL.** Changes are committed only to the feature branch. PR remains draft; no merge and no publication. Final acceptance requires the full 260-source run and resulting per-source statistics.

## CI evidence

GitHub Actions offline run #20 completed successfully on Ubuntu/Python 3.12. A separate live push acceptance run #22 also completed successfully: registry 260 / P1 160 / P2 100; 30 candidates; 8 prioritized sources scanned; 1 failed/no-match source.

## Required next acceptance step

Run the full 260-source cycle with DISCOVERED / NO_MATCH / ERROR and adapter statistics, then review freshness false positives and source-specific adapter tuning.

No merge until owner approval.
