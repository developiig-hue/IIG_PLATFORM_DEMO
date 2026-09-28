# IIG News Source Registry — Portability Contract

## Canonical artifact
- Logical URI: `repo://content/discovery/IIG_news_source_registry_260.json`
- Repository-relative path: `content/discovery/IIG_news_source_registry_260.json`
- Resolver: `scripts/news_registry.py`
- Schema: `iig.source-registry.v1`
- Required count: **260 approved sources**

## Portability invariant
All News Source / Discovery components MUST resolve the registry through the logical `repo://` URI or the repository root. Absolute filesystem paths, ChatGPT Library IDs, usernames, workstation paths, GitHub owner URLs and external fallback copies are forbidden runtime dependencies.

The same checkout must work after clone, fork, CI checkout, local execution or repository transfer without changing the registry reference.

## Fail closed
Missing registry, schema mismatch, count other than 260, duplicate IDs/URLs, or an unsafe/non-repository URI MUST block a production Discovery run. No fallback to a seed list is allowed for FULL_DISCOVERY.

## Ownership
The JSON file in this repository is the canonical runtime artifact. External/Library copies are backup/source provenance only and never the runtime source of truth.


## Production Discovery contract — 28.09.2026

The canonical production entry point is `scripts/news_source_discovery.py`.

* Registry: exactly **260** owner-approved records, processed as a hard priority barrier: all **160 P1** complete before any of **100 P2** starts.
* Per-source method order: **RSS/Atom → Sitemap (including sitemap indexes) → HTML fallback**. Every attempted method is recorded.
* Freshness/noise: dated candidates outside the configured window are rejected; navigation/privacy/career/category noise is excluded; tracking parameters are normalized and URLs are deduplicated across sources.
* Security/reliability: public HTTP(S) only, private/loopback/link-local/reserved destinations blocked including DNS resolution, redirects revalidated, response size/time bounded, one-source failure isolated.
* I/O: report and candidate handoff are JSON; production writes are atomic. Per-source final status is `DISCOVERED`, `NO_MATCH` or `ERROR` with elapsed time, attempts and problem evidence.
* Expanded research: newest bounded handoff candidates receive an outside-registry supplementary news search. These results are **leads**, not factual confirmation. Candidates without supplementary evidence remain `NEEDS_RESEARCH`.
* Pipeline: `discovered-candidates.json` uses schema `iig.discovery-candidates.v1`. Content Engine accepts only `handoff_ready` records as enrichment input and never treats raw Discovery output as publishable content.
* Governance: Discovery and Content Engine workflows use read-only repository permissions and cannot publish. Admin Review remains mandatory.
* Acceptance: `scripts/verify_full_discovery.py` requires 260 per-source records, 160/100 priority accounting, method evidence, outside-registry enrichment handoff and the portable registry contract. Connectivity-only runs cannot claim `FULL_DISCOVERY_PASS`.
