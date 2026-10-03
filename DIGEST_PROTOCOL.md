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


## CANDIDATE STORAGE / EMBEDDED IMAGE RULE — 2026-10-02
Digest release-candidate persistence MUST NOT serialize full embedded image data into browser localStorage. Cover/background/article images may exist as data URLs in the working editor, but candidate fingerprinting stores only a compact deterministic binary marker/metadata representation. This keeps exact-candidate change detection while preventing browser quota overflow.

Primary persistence is localStorage for continuity; if localStorage quota is unavailable, the Admin may fall back to sessionStorage for the active browser session and must inform the operator. Failure of localStorage alone is not a reason to block candidate generation when safe session persistence succeeds. The candidate itself remains metadata-only; original image bytes stay in the working editor/media state until production materialization.


## PUBLIC PDF RELEASE AFTER ADMIN_1 APPROVAL — 2026-10-02
For the public demo, final ADMIN_1 approval is the authorization point for the current downloadable Digest artifact. The canonical public route is versioned under `digest/releases/` and MUST be exposed on the public website after the Pages release build. The homepage «НОВИЙ ДАЙДЖЕСТ IIG» control links directly to the current public PDF, not to a generic NEWS section.

Current public release route: `digest/releases/IIG-Monthly-Digest-2026-09-PUBLIC.pdf`.

The Pages deployment builds this PDF from the approved Digest release template and validates that the artifact exists before deployment. Public download and mailing are separate: the PDF may be publicly downloadable after ADMIN_1 final approval, while Robot #7 mailing remains a separately authorized action. Legacy `digest/IIG-Monthly-Digest-2026-09.pdf` remains forbidden.


## ADMIN-ONLY DIGEST ARTIFACT GENERATION — SUPERSEDING RULE — 2026-10-02
This rule supersedes the temporary public-PDF/Pages-generation experiment recorded earlier the same day.

The Digest artifact MUST be generated only from the live Admin Digest Builder state after ADMIN_1 Final Preview and final approval. Hosting, GitHub Pages, CI, deployment workflows and the public website MUST NOT independently rebuild or synthesize the Digest.

Canonical path:
ADMIN uploads/approves cover -> approved CMS/LEDGER content -> Build release-candidate -> Final Preview -> ADMIN_1 final approval -> Admin-only artifact export.

Admin export modes:
1. «ЗАВАНТАЖИТИ ФАЙЛ ДАЙДЖЕСТУ» creates a self-contained HTML artifact from the exact approved in-browser state, including the approved custom cover background and current Digest pages/content/links.
2. «PDF · ДРУК / ЗБЕРЕГТИ» opens the exact same approved artifact in print layout so ADMIN can save it as PDF from the browser.

The export is fingerprint-locked: if layout/content changes after Preview/approval, export is blocked until a new candidate is generated, previewed and approved. The artifact is portable to a future paid hosting/domain and does not depend on a GitHub-specific build step.

Mailing Robot #7 remains separate. Public website download routing is configured only after ADMIN exports and deploys the chosen artifact to the target hosting.


## ADVICE CLICKABILITY + READABILITY LOCK — 2026-10-02
In every Final Preview and Admin-generated Digest artifact, each item in «ПОРАДИ ГОЛОВНОГО ІНЖЕНЕРА» MUST remain an active hyperlink to its exact IIG Advice article route (`advice-article.html?slug=...`). Both the advice title and «Детальніше →» are part of the same clickable row.

The Advice block typography is locked at 1.5× the previous 9 px baseline: 13.5 px for the section text/title rows and «Детальніше →», with line-height adjusted for readability. This rule applies to Final Preview and exported HTML/PDF print output.

The two bottom CTA controls in this block also remain active links: «РОЗМІСТИТИ ПРОЄКТ» -> `forms.html#project`; «ПІДПИСАТИСЯ НА ДАЙДЖЕСТ» -> `forms.html#subscribe`. Any regression to non-clickable spans or 9 px Advice text is release-blocking.


## CURRENT / ARCHIVE / READY-FOR-MAILING RELEASE RULE — SUPERSEDING RULE — 2026-10-02
This rule is mandatory and supersedes any earlier Digest publication wording that allowed an approved issue to remain merely exported without becoming the current website issue.

After the exact Digest candidate is built in Admin, Final-Previewed and approved by ADMIN_1, the Admin-generated exact artifact is submitted to the protected production endpoint `POST /api/v1/digest/releases`. The server transaction MUST perform all of the following atomically:
1. validate ADMIN_1 authorization and exact artifact fingerprint;
2. persist the new Admin-generated artifact without rebuilding it;
3. move the previous website `CURRENT` Digest to `ARCHIVE`;
4. promote the new issue to `CURRENT`;
5. expose a stable public download URL for the new `CURRENT` issue;
6. mark the same exact artifact `READY_FOR_DOWNLOAD` and `READY_FOR_MAILING` for Robot #7;
7. record previous issue, new issue, actor, timestamp, fingerprint/artifact identity and public/archive URLs in Audit.

The hosting/backend is a storage/publication layer only. It MUST NOT regenerate, re-layout or synthesize the Digest. The artifact originates only from the Admin Builder state approved by ADMIN_1.

On static Demo hosting where the protected publication endpoint does not exist, Admin MUST fail closed: it may retain/export the approved artifact but MUST NOT claim public publication, CURRENT promotion, archive rotation or mailing readiness.

### Mandatory last-page CTA
Regardless of the number or type of pages, the actual final page of every Digest MUST end with two active buttons: `РОЗМІСТИТИ ПРОЄКТ` -> `forms.html#project` and `ПІДПИСАТИСЯ НА ДАЙДЖЕСТ` -> `forms.html#subscribe`. They are part of the canonical artifact and must survive HTML/PDF export and hosting migration.


### Public CURRENT resolver — 2026-10-02
The public website MUST NOT hardcode a monthly Digest filename. Public Digest download controls resolve the active issue from `GET /api/v1/digest/current`. The response returns at minimum `status=CURRENT`, `issue`, `public_url`, artifact identity/fingerprint and download readiness. After ADMIN_1 publishes a new issue, the public button therefore switches automatically to the new CURRENT artifact without editing the page template. Archive browsing uses backend release history; archived issues must never replace CURRENT in the main download control.


## CANONICAL PDF ARTIFACT + ACTIVE IIG LINKS — SUPERSEDING RULE — 2026-10-02
The canonical released Digest file is PDF. After ADMIN_1 approves the exact Admin-generated Digest, production publication stores a PDF named from the issue, e.g. `IIG_Monthly_Digest_YYYY-MM_ADMIN1_APPROVED.pdf`.

The PDF is derived 1:1 from the exact Admin-approved self-contained layout. The production backend may perform only technical HTML-to-PDF conversion; it MUST NOT select content, repack pages, change typography, replace images, alter the approved cover, or regenerate the Digest from CMS/CI.

Every displayed NEWS/Finance/Regulation item in the PDF MUST retain an active hyperlink to its exact IIG site article. Every Chief Engineer Advice item MUST retain an active hyperlink to its exact IIG Advice page. The final Project and Subscribe CTA buttons MUST remain active. The publication endpoint must return `links_preserved=true`; otherwise publication is blocked and the new issue MUST NOT become CURRENT.

Release transaction remains atomic: previous CURRENT PDF -> ARCHIVE; new ADMIN_1-approved PDF -> CURRENT + READY_FOR_DOWNLOAD + READY_FOR_MAILING. Robot #7 must use the same CURRENT PDF URL/artifact identity that users download from the site.


## PAGE 3 + PAGE 4+ CTA / BALANCED PACKING LOCK — SUPERSEDING RULE — 2026-10-03
This rule is mandatory for every new Digest and supersedes any earlier footer behavior that placed Project/Subscribe buttons only on the last page.

### Page 3
Page 3 always reserves fixed vertical space for: (1) the fixed 3-item Chief Engineer Advice block, and (2) the two mandatory CTA buttons immediately below it. The buttons are always visible in Working Preview, Final Preview, HTML export and PDF output:
- `РОЗМІСТИТИ ПРОЄКТ` -> `forms.html#project`
- `ПІДПИСАТИСЯ НА ДАЙДЖЕСТ` -> `forms.html#subscribe`

The Finance/Regulation content area above Advice is filled only up to the remaining safe capacity. The Page 3 packer must balance Finance and Regulation as evenly as possible (target 50/50; absolute count difference <=1 when both pools are available). It must not shrink typography, overlap Advice/CTA, or hide the CTA footer to fit more items. Overflow goes to Page 4+.

### Every subsequent page
Every page from Page 4 onward, regardless of type (news continuation, imported article, promo/IIG material, Page 5/6/etc.), ends with the same two active CTA buttons. They are page-level invariants, not a final-page-only footer. Links must survive Final Preview, Admin export and canonical PDF conversion.

Any regression in which Page 3 lacks these buttons, Page 4+ omits them, or Page 3 becomes materially unbalanced between Finance and Regulation is release-blocking.


## PAGE 3 NON-OVERLAP GEOMETRY LOCK — 2026-10-03
Page 3 must use a sequential four-zone layout: header -> Finance/Regulation items -> Chief Engineer Advice -> Project/Subscribe CTA footer. Advice and CTA must never share absolute/floating space or overlap. CTA controls must render after the full Advice block and remain visible in Working Preview, Final Preview, Admin export and canonical PDF.

Because Advice typography is locked at 13.5 px, Page 3 uses a reduced safe content capacity for Finance/Regulation. Overflow is moved to Page 4+; hiding or covering Advice text to keep more Page 3 items is forbidden. Any visual overlap between Advice and CTA is release-blocking.


## ADVICE ROUTE + EXPLICIT PUBLISH BUTTON LOCK — 2026-10-03
Two release-path invariants are mandatory.

### 1. Chief Engineer Advice links
The canonical public Advice route is `advice-article.html?id=<slug>`. Admin Builder, Final Preview, HTML export and PDF link annotations MUST emit `?id=`. The public Advice runtime may accept legacy `?slug=` only as backward compatibility for already exported artifacts; new releases must never generate `?slug=`.

### 2. Explicit Admin publication action
ADMIN_1 final approval and site publication are separate auditable actions. Final approval sets the exact candidate to `READY_TO_PUBLISH` and unlocks the button `⇧ ЗАЛИТИ ДАЙДЖЕСТ НА САЙТ`, placed beside the Admin export/download controls. Only this button may call `POST /api/v1/digest/releases` for the exact approved fingerprint.

A successful publish transaction must: create/verify the linked PDF, archive the prior CURRENT, promote the new issue to CURRENT, return the public PDF URL, set READY_FOR_DOWNLOAD and READY_FOR_MAILING, and write Audit. A failed/unavailable backend must leave the old CURRENT untouched and must not show a false success state.

### 3. Public download route
The website download card must never fall back to `news.html#digest`. It resolves CURRENT through `GET /api/v1/digest/current`. If the API is unavailable, the fallback route is the dedicated `digest/current.html` status/resolver page, not News & Insights. Once a new issue is published, the public card points to the returned CURRENT artifact.


## NEWS ROW READ-MORE + SITE PDF UPLOAD LOCK — 2026-10-03
Every news row in Final Preview, Admin export and the canonical PDF must display an explicit right-aligned action label `Читати далі... →`. The title and the action label belong to the same anchor and open the exact corresponding IIG article. A row that is clickable but does not visibly indicate the continuation action is a presentation regression.

Chief Engineer Advice links use the canonical route `advice-article.html?id=<slug>`. For backward compatibility, public Advice pages must accept legacy `?slug=` links and normalize them to `?id=` before rendering. This is required so previously generated Digests do not break after route migrations.

### PDF publication to the website
The public artifact is a PDF selected/generated from the exact ADMIN_1-approved Digest. Admin exposes a `PDF для публікації` file control and a separate `ЗАЛИТИ PDF ДАЙДЖЕСТ НА САЙТ` action. The action uploads the PDF itself as multipart form data to `POST /api/v1/digest/releases` together with metadata containing issue, exact fingerprint, ADMIN_1 approval, required IIG links, `make_current=true`, `archive_previous_current=true`, `READY_FOR_DOWNLOAD` and `READY_FOR_MAILING`.

The server must not rebuild the Digest from HTML/CMS. It stores and validates the uploaded PDF, verifies active PDF link annotations, archives the previous CURRENT PDF, promotes the new PDF to CURRENT, and returns a `.pdf` public URL with `links_preserved=true`. The public website resolves the current download target through the CURRENT route/API and never falls back to the NEWS section.


## NEWS ROW READ-MORE + SITE-PUBLISHED PDF — SUPERSEDING RULE — 2026-10-03
Every NEWS / Finance / Regulation row in the Digest must show an explicit right-edge action label `Читати далі... →`. The title and this action are part of the same active hyperlink and resolve to the exact IIG article route. A row that is visually clickable but lacks the explicit action marker is a usability regression.

Chief Engineer Advice uses the canonical route `advice-article.html?id=<slug>`. For backward compatibility, public Advice pages must also accept legacy `?slug=<slug>` and normalize it to `?id=<slug>` before content lookup. New Digest artifacts must never generate new `?slug=` Advice links.

The user-facing Digest distribution artifact is PDF on the IIG website. After Final Preview and ADMIN_1 approval, Admin exposes a separate action `ЗАЛИТИ PDF ДАЙДЖЕСТ НА САЙТ`. That action publishes the exact approved Admin artifact through the protected Digest release endpoint, produces/persists the PDF, verifies active IIG links, archives the previous CURRENT PDF and promotes the new PDF to CURRENT + READY_FOR_DOWNLOAD + READY_FOR_MAILING.

The public website download button resolves CURRENT and downloads the PDF. It must not fall back to `Новини та інсайти`, an HTML digest, or a ChatGPT/sandbox artifact. Chat output is never the publication destination for an approved Digest.


## FINAL_ADMIN_IIG — PDF PUBLICATION + CANONICAL DIGEST LINKS + READ-MORE LOCK (2026-10-03)

Обязательный финальный контракт:

- После ADMIN_1 Final Preview и Final Approval публикуется **точно утверждённый PDF** через защищённое действие **«ЗАВАНТАЖИТИ PDF ДАЙДЖЕСТ НА САЙТ»**. Новый выпуск становится CURRENT, предыдущий CURRENT переносится в Archive.
- Публичная карточка на главной — **«ЗАВАНТАЖИТИ ДАЙДЖЕСТ PDF»** со стрелкой вниз. Она никогда не должна вести в «Новини та інсайти» или другой контент. Runtime принимает только CURRENT release с `.pdf` public_url; иначе остаётся dedicated resolver `digest/current.html`.
- Каждая строка NEWS / Finance / Regulation в Digest целиком кликабельна и ведёт только на canonical `article.html?id=<slug>`.
- Каждая строка «Поради Головного інженера» целиком кликабельна и ведёт только на canonical `advice-article.html?id=<slug>`.
- Справа каждой кликабельной строки Digest обязателен единый видимый CTA: **«Читати далі... →»**. Для Advice запрещено возвращать отдельный текст «Детальніше →».
- Final candidate, Final Preview и ADMIN_1 approval должны fail-closed при некорректном canonical route NEWS/Advice.
- PDF export обязан сохранять активные IIG link annotations; publication backend обязан вернуть `links_preserved=true` и PDF public URL.
- Эти правила являются migration-safe и должны сохраняться при переносе с GitHub Pages на production hosting/backend.


## FINAL_ADMIN_IIG — CORE ROW GEOMETRY INVARIANT / PAGE 2 SUBSCRIBE CTA (2026-10-03)

Нерушимое правило верстки Digest:

- Геометрия каждой строки NEWS / Finance / Regulation на всех core-страницах одинакова. Page 3 не имеет права увеличивать высоту строки, padding, font-size, grid gap или размер Read-more относительно Page 2.
- Core row baseline: `grid-template-columns: 28px 1fr`, `gap: 8px`, `padding: 5px 7px`, `font-size: 9px`, Read-more `8px`.
- Grid rows всегда content-sized: `align-content:start` + `grid-auto-rows:max-content`. Вертикальное растягивание строк запрещено.
- Page 2 внизу всегда содержит отдельную кнопку **«ПІДПИСАТИСЯ НА ДАЙДЖЕСТ»** → `forms.html#subscribe`.
- Page 3 и страницы 4+ сохраняют нижние CTA согласно утверждённому стандарту.
- Page 3 compact capacity = **14** условных слотов; уменьшение capacity только из-за CSS-регресса запрещено. Finance/Regulation не должны уходить на Page 4, если помещаются при canonical compact-row geometry.
- Любое изменение, нарушающее одинаковую геометрию строк Page 2 / Page 3, является release-blocker и должно ронять STEP 26 acceptance.


## FINAL_ADMIN_IIG — MANUAL LAYOUT LOCK / 3-PAGE CORE STANDARD (2026-10-03)

Обязательный workflow после ручной редакции Digest:

- Стандартный Monthly Digest имеет **3 core-страницы**: Page 1 cover, Page 2 NEWS, Page 3 Finance / Regulation / Advice.
- Автоматический Auto-fill **не создаёт Page 4 для обычных NEWS / Finance / Regulation**. Материалы сверх вместимости остаются вне текущего выпуска и показываются как excluded by capacity.
- Page 4+ допускается только как вручную добавленная IIG ORIGINAL / partner / sponsored / promo / article page.
- Candidate формируется один раз. После ручного удаления лишних новостей, перестановки строк или другой корректировки **запрещено требовать повторный build candidate**, потому что это повторно запускает Auto-fill.
- После ручной редакции оператор нажимает **«ЗАФІКСУВАТИ ЗМІНИ МАКЕТУ»**. Эта команда:
  1. не запускает Auto-fill;
  2. сохраняет текущий состав и порядок страниц;
  3. обновляет fingerprint текущего candidate;
  4. увеличивает revision;
  5. сбрасывает старый Final Preview / Final Approval / PDF как устаревшие;
  6. переводит candidate в AWAITING_ADMIN_1_PREVIEW.
- После фиксации workflow: **Final Preview → ADMIN_1 Final Approval → PDF → publish**.
- Пока ручные изменения не зафиксированы, Admin показывает явный статус **«Є НЕЗАФІКСОВАНІ ЗМІНИ»** и блокирует approval/export/publish.
- Если существует Page 4+ типа NEWS/Finance, Final Preview/approval блокируется как нарушение 3-page core standard.


## FINAL_ADMIN_IIG — FINAL PREVIEW LOCK + RED FINAL APPROVAL (2026-10-03)

Этот раздел заменяет прежнюю отдельную команду «ЗАФІКСУВАТИ ЗМІНИ МАКЕТУ».

- Отдельной кнопки фиксации ручных изменений нет.
- После любых ручных изменений оператор открывает **«ФІНАЛЬНИЙ ПЕРЕГЛЯД ВЕРСТКИ»**.
- Final Preview выполняет две функции одновременно: визуальная проверка + фиксация exact текущего layout fingerprint как новой ревизии candidate. Auto-fill не запускается.
- Красная кнопка **«ЗАТВЕРДИТИ ФІНАЛЬНИЙ МАКЕТ»** утверждает только тот exact layout, который был последним показан в Final Preview.
- Если после Final Preview изменена хотя бы одна строка, порядок, страница, CTA, cover или другой элемент fingerprint, красная кнопка блокируется и требует **только повторно открыть Final Preview**. Повторно формировать candidate нельзя и не требуется.
- При успешном Final Approval текущий fingerprint считается одновременно зафиксированным и утверждённым ADMIN_1; затем разблокируются PDF/export/publication действия.
- Workflow: **build candidate один раз → ручная редакция → Final Preview (lock revision) → red Final Approval → PDF → publish**.


## FINAL_ADMIN_IIG — ADMIN_1 ATOMIC FINAL REVISION LOCK (2026-10-03)

Канонический маршрут полномочий Digest:

1. **ADMIN_2**: build candidate → edit current layout → Final Preview / QA.
2. Final Preview создаёт immutable review snapshot текущей редакции: fingerprint, issue, page_count, item_count, timestamp, creator. Snapshot имеет статус **AWAITING_ADMIN_1_ATOMIC_LOCK** и сам по себе НЕ меняет canonical candidate fingerprint.
3. **ADMIN_1**: красная кнопка **«ЗАТВЕРДИТИ ФІНАЛЬНИЙ МАКЕТ»** — единственная операция, которая одновременно:
   - проверяет, что текущий layout fingerprint = latest Final Preview snapshot fingerprint;
   - фиксирует этот fingerprint как canonical candidate fingerprint;
   - увеличивает revision, если редакция изменилась относительно предыдущего candidate;
   - фиксирует `layout_locked_by=ADMIN_1`;
   - переводит review snapshot в **ADMIN_1_LOCKED_AND_APPROVED**;
   - выставляет final approval и **READY_TO_PUBLISH**.
4. Если после Final Preview ADMIN_2 или ADMIN_1 меняет хотя бы один элемент макета, красная кнопка должна fail-closed и требовать только **повторный Final Preview**. Повторный build candidate запрещён как лишний и не должен требоваться.
5. Маршрут состояния: **candidate → edits → Final Preview snapshot → ADMIN_1 atomic lock + approval → PDF → publish**.
6. Никакая роль кроме ADMIN_1 не имеет права переводить preview fingerprint в canonical approved candidate fingerprint.


### Cache-proof runtime publication lock

- `admin-ua.html` loads **`assets/admin-final-admin1-v1.js`** as the active Admin runtime, not the legacy cached `assets/admin.js` URL.
- The UI must visibly show **RUNTIME · ADMIN1 FINAL LOCK v1**.
- Runtime marker: `window.IIG_ADMIN_RUNTIME_VERSION="ADMIN1_ATOMIC_FINAL_LOCK_V1"`.
- If this badge is absent, the browser is not running the authoritative ADMIN_1 atomic-final-lock runtime and acceptance is invalid.


### Dedicated cache-proof FINAL_ADMIN_IIG route

For acceptance and emergency cache bypass, canonical test route is:

`/IIG_PLATFORM_DEMO/admin-final-admin1-v1.html#digest`

This page has a unique filename, loads only `assets/admin-final-admin1-v1.js?v=ADMIN1-FINAL-LOCK-V1`, and carries `data-admin-runtime-page="ADMIN1_FINAL_LOCK_V1"`. It must be used when validating ADMIN_1 red-button behavior so no historical `admin-ua.html` or `admin.js` cache can affect the result.


## FINAL_ADMIN_IIG — MANUAL LAYOUT AUTHORITY + STATIC CORE ROWS V2 (2026-10-03)

### Root cause fixed

1. The previous runtime called `autoFillDigest(false)` from editorial approve/publish/reject and from content reload. That allowed the approved-content pool to overwrite ADMIN_2 manual Digest edits after candidate creation.
2. Candidate persistence stored a fingerprint but not the current manual page layout. Reload could therefore reconstruct the Digest from Auto-fill instead of restoring the editor's exact version.
3. Page 3 had a dedicated stretching grid (`minmax(0,1fr)` / stretch behavior), violating the rule that core news rows must have identical geometry on Page 2 and Page 3.

### HARD rules

- Auto-fill is authoritative **only** during the first candidate build or after the operator explicitly presses the Auto-fill button.
- Once a candidate exists, **manual Digest layout has priority over the approved-content pool**. Editorial approve/publish/reject, content refresh, role change, Final Preview and red Final Approval MUST NOT call Auto-fill.
- Manual layout is persisted under a dedicated layout state and restored before any fallback Auto-fill on page reload.
- Every manual delete, reorder, move, page edit, cover edit or extra-page edit invalidates the previous Final Preview and preserves the exact current layout.
- Final Preview snapshots the exact manual layout. ADMIN_1 red **«ЗАТВЕРДИТИ ФІНАЛЬНИЙ МАКЕТ»** promotes that exact snapshot fingerprint to canonical candidate and sets `layout_authority=ADMIN_1_APPROVED_MANUAL_LAYOUT`.
- After ADMIN_1 approval, automatic refill authority is disabled for that candidate. A new Auto-fill requires an explicit destructive action by the operator and a new Final Preview.
- Page 2 and Page 3 NEWS / Finance / Regulation rows share one immutable geometry: full width, **32 px row height**, identical columns/gap/padding/font/read-more sizing. No page-specific stretch override is allowed.
- Page 3 Advice and CTA blocks follow the fixed news rows; they cannot resize or stretch the rows above them.
- Any reintroduction of automatic `autoFillDigest(false)` into approve/publish/reject/load paths, or any Page-3-only news-row geometry override, is a **release blocker**.


## FINAL_ADMIN_IIG — CURRENT MANUAL DIGEST IS PRIMARY / NO CANDIDATE REBUILD V3 (2026-10-03)

### Canonical authority

- The **CURRENT manual Digest visible in Admin** is the primary working source-of-truth.
- A release-candidate is only a technical release envelope. It must never outrank or overwrite ADMIN_2 / ADMIN_1 manual edits.
- After any manual edit there is **no requirement to press “Form new candidate” again**.

### Required route

1. ADMIN_2 edits CURRENT Digest.
2. ADMIN_2 opens **Final Preview**.
3. If no technical candidate exists for the issue, Final Preview automatically creates it from the exact CURRENT manual layout with source `MANUAL_CURRENT_DIGEST_BOOTSTRAP` and `auto_fill_policy=FORBIDDEN_FOR_BOOTSTRAP`.
4. This bootstrap MUST NOT call Auto-fill and MUST NOT change page composition, order, deleted items, cover, additional pages or current row layout.
5. Final Preview snapshots the exact current manual fingerprint.
6. ADMIN_1 red **«ЗАТВЕРДИТИ ФІНАЛЬНИЙ МАКЕТ»** locks and approves that exact Preview snapshot.
7. If the layout changes after Preview, only a new Final Preview is required. A candidate rebuild is forbidden and must never be requested.

### UI meaning

- The old “Form new Digest / candidate” action is a destructive new auto-build/reset action only. It is not part of the normal edit → approve route.
- When no candidate exists but a manual Digest exists, Admin state must show **РУЧНИЙ МАКЕТ · READY FOR FINAL PREVIEW**, not “candidate missing”.

### Release blocker

Any runtime, acceptance rule or message that requires rebuilding a candidate because the manual Digest was edited is a release-blocking regression.
