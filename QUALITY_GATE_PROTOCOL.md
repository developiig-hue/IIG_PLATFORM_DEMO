# IIG Quality Gate — Production Contract

**Robot:** 3 of the fixed seven-robot IIG pipeline.

`NEWS_SOURCE_DISCOVERY → CONTENT_ENGINE → QUALITY_GATE → IMAGE_RIGHTS`

## Ten-point Definition of Done

1. **Functionality.** Evaluate both Content Engine routes item-by-item and return deterministic PASS/BLOCK decisions with reasons.
2. **Input / Output.** Input is `iig.content-engine.v3`; output is `iig.quality-gate.v1`; run report is `iig.quality-gate-report.v1`. JSON writes are atomic.
3. **Reliability.** A bad item is blocked without stopping evaluation of unrelated items. Fatal envelope/schema/governance errors fail the entire gate closed.
4. **Security.** Curated source URLs must be public HTTPS without embedded credentials; loopback/private/link-local/reserved/local addresses are blocked. Workflow is read-only.
5. **Portability / Hosting.** Runtime paths are repository-relative from ROOT. No Windows path, GitHub Pages path, account ID, Library ID, server name or domain is required.
6. **Integration.** Previous robot must be CONTENT_ENGINE, declared next state must be QUALITY_GATE, both NEWS and CHIEF_ENGINEER_ADVICE routes are evaluated, and output next state is IMAGE_RIGHTS.
7. **Publication control.** Quality Gate cannot publish. Output remains `ADMIN_ONLY`, `auto_publish=false`. BLOCK items are never admin-eligible.
8. **Tests.** Positive and negative tests cover schema, governance, pipeline, raw Discovery boundary, route mismatch, unsafe URL, primary source, Advice four-block contract, NEWS image requirement and duplicate isolation.
9. **Live test.** CI generates a real Content Engine v3 artifact and Quality Gate consumes that exact artifact in the same runner. Both routes must be non-empty and evaluated.
10. **Acceptance + GitHub.** Feature branch must be green. Merge into main requires a separate owner decision and post-merge verification.

## Quality boundaries

A GREEN Quality Gate run means the **robot behaved correctly**, not that every content item passed. BLOCK is an expected successful outcome for unsafe/incomplete content.

NEWS must carry sector identity. Image provenance, relevance, rights and technical suitability are the responsibility of the downstream IMAGE_RIGHTS robot (#4), avoiding duplicate authority in Quality Gate.

Chief Engineer Advice must preserve the four-block structure **Problem → Checks → Technical solution → Management decision**.

Fatal Content Engine envelope defects (wrong schema, broken governance, wrong pipeline, missing raw-Discovery boundary) stop the entire gate. Item defects are isolated and reported individually.
