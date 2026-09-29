# IIG Digest Robot #6 — Production Contract

Robot **6 of 7**. Input is exclusively content explicitly APPROVED by Robot #5.

## Ten-point Definition of Done
1. Functionality — builds digest JSON + HTML from Admin-approved publication handoff only.
2. Input/Output — `iig.publication-handoff.v1 -> iig.digest.v1 + iig.digest-report.v1`.
3. Reliability — malformed/duplicate/tampered/unauthorized items fail closed; atomic JSON writes.
4. Security — recompute SHA-256; require APPROVED reviewer/reason/timestamp; HTTPS public base; NEWS requires approved image handoff; HTML escaping.
5. Portability — `IIG_PUBLIC_BASE_URL` ENV controls public domain; repository-relative filesystem paths; Windows/Linux compatible.
6. Integration — exact `ADMIN_REVIEW_PUBLICATION (#5) -> DIGEST (#6) -> SCHEDULER_ORCHESTRATION (#7)`.
7. Admin Approval / NO AUTO — digest is `READY_FOR_ADMIN_APPROVAL`, `auto_send=false`. Robot #6 never mails. After build, an administrator must explicitly approve the exact digest SHA-256 with reviewer + reason. Only `iig.approved-digest.v1` authorizes Robot #7 to trigger delivery.
8. Tests — approval/integrity/image/base URL/routing/link/CTA/governance tests.
9. Live-test — production workflow tests the real #5 handoff contract plus a deterministic, explicitly Admin-approved acceptance fixture; no fake approval enters public content.
10. Acceptance + GitHub — feature GREEN, PR, merge to main by owner instruction, then post-merge GREEN.


## HARD RULE — DIRECT LINK TO THE SAME IIG MATERIAL
This rule is **release-blocking and non-optional**.

Every content item displayed in the Digest MUST be clickable and MUST link directly to the **same individual material on the IIG website** that the Digest item represents.

Applies without exception to:
- main NEWS / Ukraine / World items;
- energy legislation and regulatory items;
- financing / bank / ECA / project-finance items;
- Chief Engineer Advice;
- future IIG ORIGINAL, PARTNER MATERIAL and SPONSORED MATERIAL items when enabled.

Required routes are individual-content routes such as `article.html?id=<public_slug>` or `advice-article.html?id=<public_slug>` generated from `IIG_PUBLIC_BASE_URL`.

**FORBIDDEN:** home page, generic NEWS catalogue/section, generic finance section, empty `#`, missing URL, another item's URL, or any substitute destination that is not the exact material represented by the Digest card.

If the exact IIG material does not yet exist or does not have a valid HTTPS direct URL, that card MUST NOT be released in the Digest. The build/release gate must fail closed with `DIGEST_RELEASE_BLOCKED: DIRECT_LINK_HARD_RULE`.

QA must validate the direct-link contract before Digest approval. A visually clickable card is not sufficient: destination identity must match the item's public slug/content identity.

## Mandatory active links
Every digest content item has an HTTPS link back to its individual IIG site page:
- NEWS -> `article.html?id=<public_slug>`
- Chief Engineer Advice -> `advice-article.html?id=<public_slug>`

Mandatory CTA:
- **Розмістити проєкт** -> `forms.html#project`
- **Підписатися на Дайджест** -> `forms.html#subscribe`

All URLs are generated from `IIG_PUBLIC_BASE_URL`; no hard dependency on GitHub Pages in the robot contract.
\nAcceptance note: production regression includes the approved Robot #5 boundary and exact public-link contract.\n
## HARD RULE — UNIFIED PRIMARY CTA GEOMETRY & TYPOGRAPHY
The primary Digest CTAs **РОЗМІСТИТИ ПРОЄКТ** and **ПІДПИСАТИСЯ НА ДАЙДЖЕСТ** MUST use one identical component standard on every Digest page.

They may differ only by **color and destination/action**. The following properties MUST be identical 1:1:
- button height and shape;
- width logic within the same CTA row;
- corner radius;
- internal horizontal/vertical padding;
- font family and font weight;
- font size;
- letter spacing;
- text baseline, horizontal centering and vertical centering.

Canonical typography: **DejaVu Sans Bold**, white uppercase label. Canonical geometry: equal-height rounded rectangles with the same radius and padding. **РОЗМІСТИТИ ПРОЄКТ** links only to the project form; **ПІДПИСАТИСЯ НА ДАЙДЖЕСТ** links only to the subscription form.

Any generated Digest where these two primary CTAs have different geometry or typography fails visual QA and MUST NOT be released until corrected.

## APPROVED MASTER LOCK — 2026-09-29
The approved visual/content master is `IIG_Monthly_Digest_2026-09_FINAL_DEMO.pdf`, SHA-256 `6003552eed45f96e32bc1794b2297a04adef84dd319595844cebef57118111fc`.

Normative companion artifacts:
- `DIGEST_MASTER_SPEC.md` — human-readable locked layout/content specification;
- `content/digest-layout-standard-v1.json` — machine-readable portability/design contract.

The Digest is fixed as a 3-page portrait presentation (Cover → 15 News → Finance/Regulation/Chief Engineer). The cover MUST use a visible real energy-enterprise photograph as a full-page background with moderate navy dimming; pages 2–3 use the approved large-news typography and collision-safe layout. Page-2 news cards have no thumbnails. Page-3 approved lower Chief Engineer/CTA block is locked.

Portability is mandatory: hosting/domain changes MUST be implemented by changing `IIG_PUBLIC_BASE_URL` and deployment configuration, not by changing the Digest information architecture, layout contract, direct-link identity rules, typography hierarchy or CTA component standard. Post-migration visual and link regression against the MASTER is release-blocking.
