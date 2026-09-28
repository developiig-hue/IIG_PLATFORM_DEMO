# IIG Image / Rights Robot — Production Contract

Robot **4 of 7**. Its job is to produce auditable image-selection evidence; it never grants publication authority.

## Ten-point Definition of Done
1. Functionality — evaluate provenance, relevance, rights and technical suitability; choose ORIGINAL, authorized same-sector fallback, or BLOCK.
2. Input/Output — input audits use `iig.news-image-audit.v1`; output `iig.image-rights.v1`; report `iig.image-rights-report.v1`.
3. Reliability — malformed/failed evidence blocks that image without promoting it; JSON output is atomic.
4. Security — remote candidate and external rights-evidence URLs must be HTTPS and credential-free; local fallback must resolve inside repository and be a real non-empty JPEG.
5. Portability — all runtime paths are repository-relative; no workstation, account, Pages host or Library dependency.
6. Integration — robot identifies itself as IMAGE_RIGHTS #4 and hands evidence to QUALITY_GATE within the fixed seven-robot architecture.
7. Admin control — `ADMIN_ONLY`, `auto_publish=false`; BLOCK is never Quality-Gate eligible.
8. Automated tests — positive and negative tests for rights bases, failed gates, schema, URL safety, local ownership proof and nonpublishing workflow.
9. Live test — CI executes Content Engine → Quality Gate (#3) → Image / Rights (#4) on real repository evidence, not only fixtures.
10. Acceptance + GitHub — feature branch must be GREEN; merge requires separate owner decision and post-merge verification.

## Rights rule
A boolean such as `image_rights_verified=true` is metadata, **not legal evidence**. It cannot by itself produce a PASS.

Accepted structured rights bases are: `IIG_OWNED`, `EXPLICIT_PERMISSION`, `OPEN_LICENSE`, `PUBLIC_DOMAIN`. Permission/license/public-domain claims require a documented evidence URL. IIG-owned local assets require an integrity hash plus provenance evidence.

An original source image is eligible only when G1 Provenance, G2 Relevance, G3 Rights and G4 Technical all PASS **and** the structured rights basis is independently valid.

If any original gate does not pass, fallback is allowed only when the same-sector repository asset itself has a proven rights basis. Otherwise the correct result is BLOCK / image unavailable. Public visibility, downloadability, GitHub storage or a historical boolean never establishes reuse rights.
