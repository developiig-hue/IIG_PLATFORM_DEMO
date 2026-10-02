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
The approved visual/content master is `IIG_Monthly_Digest_2026-09_FINAL_DEMO (2).pdf`, SHA-256 `6003552eed45f96e32bc1794b2297a04adef84dd319595844cebef57118111fc`.

Admin read-only visual reference: `digest/admin-master-2026-09-v2.html`. The legacy public-site PDF MUST NOT be substituted for this master unless its SHA matches the approved SHA.

Normative companion artifacts:
- `DIGEST_MASTER_SPEC.md` — human-readable locked layout/content specification;
- `content/digest-layout-standard-v1.json` — machine-readable portability/design contract.

The Digest is fixed as a 3-page portrait presentation (Cover → 15 News → Finance/Regulation/Chief Engineer). The cover MUST use a visible real energy-enterprise photograph as a full-page background with moderate navy dimming; pages 2–3 use the approved large-news typography and collision-safe layout. Page-2 news cards have no thumbnails. Page-3 approved lower Chief Engineer/CTA block is locked.

Portability is mandatory: hosting/domain changes MUST be implemented by changing `IIG_PUBLIC_BASE_URL` and deployment configuration, not by changing the Digest information architecture, layout contract, direct-link identity rules, typography hierarchy or CTA component standard. Post-migration visual and link regression against the MASTER is release-blocking.


## OWNER CTA TYPOGRAPHY LOCK — 2026-10-01
For the approved Digest component, the primary CTA labels `РОЗМІСТИТИ ПРОЄКТ` and `ПІДПИСАТИСЯ НА ДАЙДЖЕСТ` remain white uppercase DejaVu Sans Bold and centered. The Admin-approved display sizes are locked as follows: Page 1 bottom CTA row = 14 px; Page 3 bottom Chief Engineer CTA row = 12 px. Both values are 2× the previous MASTER v2 values. Any deployment, paid-hosting migration, PDF/HTML regeneration or CSS rebuild that restores 7 px / 6 px, changes white text, or makes the two buttons within a row typographically inconsistent fails visual QA and MUST NOT be released.


## EXTENSIBLE DIGEST BUILDER — COVER + PAGES 4+ — 2026-10-01
Robot #6 and Admin must support a working cover configuration plus optional additional pages after the core pages. The core MASTER remains a versioned read-only reference; custom working cover/background/copy and appended pages are inputs to a new final artifact, never an in-place mutation of an already approved SHA.

Allowed extra-page classes: IIG_ORIGINAL, SUCCESS_PROJECT, PARTNER, SPONSORED, EDITORIAL. Sponsored/Partner material requires visible disclosure. Each page can carry a validated background asset, title, subtitle/announcement, body and up to two direct CTAs. Invalid configured CTA routes, missing title/body, failed image-quality validation or missing sponsorship disclosure are release blockers. Robot #6 must preserve page order and supplied content, and Robot #7 still requires ADMIN approval of the exact final artifact before mailing.


## FILE IMPORT / ARTICLE_PAGE2_CANVAS CONTRACT — 2026-10-01
Robot #6/Admin may receive approved long-form source material prepared in DOCX or supported text-editor formats. Step 26 performs local import and deterministic pagination; production must persist the normalized article blocks and approved media, not the original browser-only object URLs. ARTICLE_PAGE2_CANVAS preserves Page-2 margins/header/footer and repeats the Subscribe CTA on every continuation page. Content overflow must create a new page; it must never be hidden, overlap the footer/CTA, or force unreadable text shrinkage. Partner/Sponsored disclosure is mandatory on each generated page. Final send remains blocked until the exact rendered multi-page artifact is approved by Admin and handed to Robot #7.


## DEFAULT TEMPLATE RESOLUTION — 2026-10-01
Robot #6 resolves absent optional layout overrides by inheriting the approved MASTER/canonical page canvas. It must not interpret a missing background, missing override object or untouched Admin form as an instruction to generate a blank title page. Explicit Admin override wins; otherwise approved fallback wins.


## MONTH-BOUND ISSUE SELECTION / RELEASE CANDIDATE — 2026-10-01
Every monthly Digest resolves content against the selected `YYYY-MM` issue. Approved archive items outside that month are excluded from automatic issue packing unless ADMIN explicitly imports them as a separately labelled retrospective/original page. A release-candidate JSON may freeze the Admin Builder input slugs/counts for QA, but it never substitutes for the final rendered artifact, ADMIN_1 approval, exact SHA, Robot #7 link check or mailing approval.


## ADMIN_1 FINAL PREVIEW / NO AUTO-PUBLISH — 2026-10-01
The monthly Digest may only be assembled from NEWS explicitly approved by ADMIN_1. Newly collected monthly NEWS starts as REVIEW and is excluded from Robot #6 input until approval. Robot #6/Admin provides a final page-by-page visual preview after packing and before exact-artifact approval. Final Preview is non-mutating and does not publish/send. Website publication, exact PDF/SHA approval and Robot #7 mailing authorization remain separate protected ADMIN_1 actions. Missing news photography must resolve through the approved image hierarchy/fallback policy; an editorial fallback must be clearly illustrative and never mislabelled as the reported object.


## ADMIN_2 BUILDER / ADMIN_1 FINAL GATE — 2026-10-02
Canonical monthly flow: CURRENT APPROVED CMS/APPROVAL LEDGER → ADMIN_2 (or ADMIN_1) BUILD RELEASE-CANDIDATE → PREVIEW/QA → status AWAITING_ADMIN_1_APPROVAL → ADMIN_1 FINAL APPROVAL → exact artifact/SHA materialization → Robot #7 link check → mailing authorization.

ADMIN_2 has build/edit/preview/QA authority only. ADMIN_1 is the exclusive final approver. A stored historical candidate is never reusable after content approval changes; candidate input must be regenerated from the current approved state. PUBLISHED content is considered approved input when admin_approved=true and image approval requirements are satisfied.

Legacy public Digest HTML/PDF routes are forbidden once superseded. Public download remains unavailable until a current issue artifact is finally approved by ADMIN_1.


## COVER BACKGROUND RIGHTS + APPLY GATE — 2026-10-02
A newly uploaded Digest cover background is a two-stage operation and MUST NOT silently replace the current cover.

1. Technical intake validates JPG/PNG/WebP, <=10 MB, minimum 1200×1697 px; undersized images may be normalized to the recommended 1800×2546 px canvas.
2. ADMIN_1 must explicitly confirm that IIG has the right to use the selected background. The state records bgApproved=true, bgApprovedBy=ADMIN_1, bgRightsVerification=OWNER_CONFIRMED, timestamp, file identity and dimensions.
3. Only after that approval may «Застосувати до титульної» mutate the working cover. The UI must show a separate confirmation that the new background was actually applied.
4. Preview may show a pending upload for inspection, but release-candidate/final QA MUST fail closed if a non-MASTER cover background lacks ADMIN_1 approval.
5. Rendering must preserve the uploaded data URL correctly. The HTML/CSS renderer must not quote a data URL in a way that breaks the inline style attribute; a technically accepted image that renders as a flat fallback color is a release-blocking bug.

The approved MASTER v2 fallback remains valid without re-approval. Any new custom cover image is governed by the ADMIN_1 rights/apply gate above.


## COVER MASTER LAYOUT LOCK — 2026-10-02
When ADMIN_1 selects a new approved cover background, only the background asset/crop/dimming may change. The title-page composition remains locked to the approved MASTER v2 1:1: IIG brand header + UA/EN, MONTHLY DIGEST title, subtitle, issue badge, mission/slogan, four thematic linked blocks with icons and «Читати далі...», KPI strip, and two bottom primary CTAs.

The four cover thematic links are active and must resolve to IIG content hubs: Ukraine industrial generation -> industry.html?sector=energy; world industrial energy practice -> news.html; financing/regulation -> finance-news.html; Chief Engineer Advice -> advice.html. Bottom CTAs are mandatory and fixed: «РОЗМІСТИТИ ПРОЄКТ» -> forms.html#project and «ПІДПИСАТИСЯ НА ДАЙДЖЕСТ» -> forms.html#subscribe.

Custom-cover rendering may not collapse these blocks into cards, remove the IIG header, remove KPI/CTA areas, change typography hierarchy, or substitute a simplified layout. Any such drift is a visual-regression blocker.


## FINAL PREVIEW BEFORE APPROVAL — 2026-10-02
The Final Preview is an inspection step, not an approval gate. Correct sequence: CURRENT APPROVED CMS/LEDGER -> BUILD RELEASE-CANDIDATE -> FINAL PREVIEW OF THE ENTIRE DIGEST -> FIX LAYOUT/QA ISSUES IF ANY -> ADMIN_1 FINAL APPROVAL -> exact artifact/SHA -> Robot #7.

The release-candidate is built only from items already eligible for Digest input (APPROVED/PUBLISHED with required image approval). Unapproved monthly NEWS that are not included in the candidate MUST NOT block candidate generation or Final Preview.

Final Preview must open for the exact current candidate even when QA contains amber/blocking findings; these findings are shown to ADMIN for correction but they block only FINAL APPROVAL, not visual inspection. Opening Final Preview records preview_completed=true, previewed_by, previewed_at and preview_fingerprint for the exact candidate. ADMIN_1 final approval MUST fail closed unless this exact candidate/fingerprint has been previewed first.
