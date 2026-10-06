# IIG Monthly Digest — MASTER SPEC v1.0

Status: **APPROVED / DESIGN & CONTENT PRINCIPLES LOCKED**  
Approval date: 2026-09-29  
Visual master: `IIG_Monthly_Digest_2026-09_FINAL_DEMO (2).pdf`  
Approved master SHA-256: `6003552eed45f96e32bc1794b2297a04adef84dd319595844cebef57118111fc`  
Admin read-only reference: `digest/admin-master-2026-09-v2.html`  
The legacy public-site PDF is not normative unless its SHA exactly matches this approved master.

## Core structure
1. Page 1 — COVER.
2. Page 2 — 15 Ukraine/World content cards.
3. Page 3 — Finance + Regulation + Chief Engineer Advice.

Core portrait flow is Page 1 → Page 2 → Page 3. Pages 4+ are optional approved extensions. The visual canvas of core pages is locked; content packing follows the current capacity rules below.

## Cover
- Full-page real energy/industrial energy enterprise photo.
- Preserve aspect ratio; cover crop only; no stretching.
- Moderate navy dimming only; enterprise MUST remain clearly visible.
- No vertical image divider.
- Four thematic blocks: industrial generation Ukraine; world practice; financing/regulation; Chief Engineer Advice.
- KPI panel at bottom + two primary CTAs.

## Typography
Canonical family: DejaVu Sans / DejaVu Sans Bold.
- IIG 29 pt Bold
- MONTHLY DIGEST 39 pt Bold
- subtitle 15.5 pt Bold
- cover slogan 17 pt Bold
- issue/month 10.5 pt Bold
- cover thematic title ~14.8 pt Bold
- cover thematic explanation ~12 pt Regular
- cover read-more ~10.5 pt Bold
- KPI number 16 pt Bold; KPI label 5.8 pt Regular
- page-2 heading 17.2 pt Bold
- news headline target 12.2 pt Bold; auto-fit floor 9.5 pt
- category 6.2 pt Bold; news number 11.2 pt Bold
- page-3 heading 15.6 pt Bold
- Finance/Regulation heading 11.5 pt Bold
- Finance title 9.2 pt Bold; explanation 7.5 pt Regular
- Regulation 8.8–11.2 pt Bold auto-fit
- Chief Engineer block 13 pt Bold
- Chief Engineer item 9.5–11.8 pt Bold auto-fit
- Детальніше → 7.5 pt Bold
- footer 6.8 pt Regular

Auto-fit may shrink text only to prevent collision. Text MUST NOT overlap arrows, CTA, adjacent cards, extension slot or footer.

## Page 2
Capacity-weighted packing is mandatory. The historical MASTER visual reference showed 15 cards, but the current approved Builder fills the available Page-2 canvas with as many approved items as fit without collision or unreadable shrinkage. Current Admin capacity model = 23 units; short headlines may fit more cards than the historical reference. No thumbnails/photos in cards. Each whole card is clickable. Do not leave avoidable blank space when approved current-issue content is available, and never fabricate content to fill space.

## Page 3
Finance, Regulation and Chief Engineer are content areas with direct individual IIG links. Approved lower Chief Engineer + CTA block is locked.

## HARD RULE — DIRECT LINK TO SAME IIG MATERIAL
Every Digest content item MUST link directly to the exact individual IIG material represented by that item. Applies to NEWS, Finance/Bank/ECA/Project Finance, Regulation, Chief Engineer Advice and future approved Original/Partner/Sponsored items.

Forbidden destinations: homepage, generic NEWS catalogue, generic Finance section, empty #, missing URL, another item URL, or substitute destination.

If the exact individual IIG material does not exist with a valid HTTPS direct URL, the item MUST NOT be released. Gate: `DIGEST_RELEASE_BLOCKED: DIRECT_LINK_HARD_RULE`.

## HARD RULE — PRIMARY CTA
`РОЗМІСТИТИ ПРОЄКТ` and `ПІДПИСАТИСЯ НА ДАЙДЖЕСТ` are one component standard. Geometry, rounded corners, height, radius, padding, font, size, weight, letter spacing and centering are identical 1:1. They differ only in color and destination.
- Project: red → `forms.html#project`
- Subscribe: pumpkin terracotta `#E66B32` → `forms.html#subscribe`
- white uppercase DejaVu Sans Bold labels.
- OWNER CTA TYPOGRAPHY LOCK — 2026-10-01: on Page 1 bottom primary CTA row, label font size is 14 px; on Page 3 bottom Chief Engineer CTA row, label font size is 12 px. These values are exactly 2× the prior Admin MASTER v2 values (7 px and 6 px). Text remains #FFFFFF, uppercase, bold, centered. The two buttons within each row remain 1:1 identical in typography and geometry.
- This CTA typography rule is portable and MUST survive migration to paid hosting/domain without reset to legacy sizes.
- Site MUST resolve hashes to the correct form.

## Portability
No hard dependency on GitHub Pages. All public routes derive from `IIG_PUBLIC_BASE_URL`. Local assets use repository-relative paths or a portable manifest. New hosting/domain MUST support HTTPS, Unicode, direct article routes, forms hashes and static PDF download.

## Release QA
- Core pages 1–3 remain in fixed order; approved pages 4+ may follow.
- visual regression against approved master.
- Ukrainian Unicode renders without ????.
- every content URL identity matches the represented item.
- Subscribe → #subscribe; Project → #project; no cross-link.
- Public Digest download is absent until the current issue has an ADMIN_1-approved final artifact/SHA; legacy PDFs must never remain linked.
- Robot #6 outputs READY_FOR_ADMIN_APPROVAL / auto_send=false.
- Robot #7 cannot send before Admin approval of exact digest artifact/SHA.

## Change control
Any visual/content-rule change requires new demo, User/Admin approval, protocol version increment, machine-readable spec update and regression QA. Silent builder/CSS drift is forbidden.


## OWNER CHANGE LOCK — CTA FONT SCALE — 2026-10-01
The approved Admin MASTER v2 visual reference was updated by ADMIN_1 instruction: the white labels inside the two primary CTA buttons are doubled relative to the previous reference on the bottom of Page 1 and bottom of Page 3. Page 1 CTA labels = 14 px Bold; Page 3 CTA labels = 12 px Bold. This is a normative MASTER requirement, not a demo-only override. Migration/deployment tooling must preserve it.


## WORKING COVER AND EXTENSIBLE PAGE CONTRACT — 2026-10-01
The 3-page approved MASTER remains the read-only baseline reference; the working Builder is now extensible. ADMIN may edit the working cover background and copy, and may append pages 4+ for IIG ORIGINAL, successful-project cases, Partner, Sponsored or Editorial material. A changed working cover or appended page does not silently redefine the historical MASTER SHA; final production output requires a new rendered artifact and approval.

Background assets: JPG/PNG/WebP, <=10 MB, hard minimum 1200×1697 px, recommended >=1800×2546 px portrait. Preserve aspect ratio and use cover crop. Content pages 4+ support headline, subtitle, body, background, disclosure/type label and up to two CTAs. Sponsored/partner labels are mandatory when applicable. All configured CTAs obey the direct-link rule.


## PAGE 2 CANVAS FOR IMPORTED LONG-FORM MATERIAL — 2026-10-01
Optional pages 4+ may use ARTICLE_PAGE2_CANVAS for IIG original news, successful projects, Partner or Sponsored articles imported from DOCX/TXT/MD/RTF/HTML. The visual grammar follows Page 2: portrait canvas, safe margins, top identity strip, readable editorial typography and reserved bottom footer. Text and embedded approved-quality photos auto-flow within the fixed page height; overflow creates continuation pages. Every continuation repeats the Subscribe CTA to `forms.html#subscribe`. The historical 3-page MASTER remains the baseline; appended article pages form part of a new final artifact/SHA.


## DEFAULT CANVAS FALLBACK — 2026-10-01
Customization is opt-in. If no working-cover change is applied, the Digest uses the approved MASTER v2 Page 1 visual/canvas as the default. Core Page 2/Page 3 layout standards likewise remain the fallback when no explicit page-level customization exists. Missing optional customization must never create a blank page or replace an approved canvas with a generic placeholder.


## ROLE SEPARATION — ADMIN_2 BUILD / ADMIN_1 FINAL APPROVAL — 2026-10-02
ADMIN_2 may build a monthly Digest release-candidate from the current approved CMS/Approval Ledger, edit working cover/pages, run auto-pack, working preview, final preview and QA. ADMIN_2 MUST NOT grant final Digest approval, authorize public release or authorize mailing.

ADMIN_1 may perform all Builder actions and is the sole role permitted to give final approval to the generated release-candidate. Final approval is valid only for the exact current issue/candidate and must occur after Final Preview and all release gates pass. Any material/issue/layout change after candidate generation invalidates the candidate and requires regeneration before ADMIN_1 approval.

The public site must not expose a legacy/static Digest while a new issue is pending. Only an ADMIN_1-approved current final artifact may become the public download target.


## CUSTOM COVER IMAGE APPROVAL LOCK — 2026-10-02
A custom working-cover background is not considered active merely because the browser accepted the file. Activation requires two explicit steps: (a) ADMIN_1 rights confirmation and (b) Apply to Cover. The rendered cover and final preview must show the selected image, not the navy fallback color. Final QA blocks any non-MASTER cover whose background is not marked OWNER_CONFIRMED by ADMIN_1. File intake and cover activation are separate auditable actions.


## CUSTOM BACKGROUND / MASTER COMPOSITION INVARIANT — 2026-10-02
Changing the cover image does not authorize a new cover design. The approved MASTER v2 Page 1 composition, spacing hierarchy, four linked thematic rows, KPI strip and two bottom CTAs remain the canonical layout. A custom background is a skin only. The working preview and final preview must match the MASTER structure while showing the newly approved background.


## FINAL PREVIEW / APPROVAL ORDER LOCK — 2026-10-02
The complete Digest layout must be visually reviewable before ADMIN_1 approval. Final Preview is mandatory and precedes approval. It must not be blocked merely because other current-month NEWS remain in REVIEW outside the release-candidate. Approval applies to the exact candidate and requires proof that the same fingerprint was previewed. Layout or content changes after preview invalidate that preview and require regeneration/re-preview.


## PUBLIC DOWNLOAD ARTIFACT — 2026-10-02
An ADMIN_1-approved final Digest must have a public downloadable PDF route on the IIG website. The public homepage Digest CTA must point directly to the current versioned release PDF under `digest/releases/`. This is distinct from Robot #7 mailing authorization. A final approval state with no public downloadable artifact is a release-flow defect.


## ADMIN IS THE SINGLE DIGEST BUILD AUTHORITY — SUPERSEDING RULE — 2026-10-02
The approved Digest must not be regenerated by CI, GitHub Pages or hosting infrastructure. Only the Admin Builder may materialize the final artifact from the exact approved working state. This preserves the ADMIN-selected cover image, text, approved NEWS set, Finance/Regulation, Advice, extra pages and links exactly as reviewed.

The portable Admin export is the canonical artifact source for migration to paid hosting/domain. Hosting serves an artifact; it does not author or rebuild it.


## CHIEF ENGINEER ADVICE LINK + TYPE INVARIANT — 2026-10-02
The final Digest Advice section uses active per-item links to exact Advice pages, not decorative text. Advice typography is 13.5 px (1.5× the former 9 px baseline) for readability, including the «Детальніше →» action. Bottom Project/Subscribe CTAs remain clickable. These properties must survive Admin export and later hosting migration.


## CURRENT ISSUE ROTATION + FINAL CTA INVARIANT — 2026-10-02
ADMIN_1 final approval authorizes publication of the exact Admin-generated artifact. Production publication is an atomic current/archive rotation: previous CURRENT -> ARCHIVE; new approved issue -> CURRENT + READY_FOR_DOWNLOAD + READY_FOR_MAILING. The hosting service persists and serves the artifact; it does not rebuild it.

Every Digest, including issues with appended article/promo pages, ends on its true last page with active Project and Subscribe buttons. This last-page CTA footer is independent of the Advice block and is mandatory in Final Preview and Admin export.


## CANONICAL OUTPUT FORMAT: PDF WITH LIVE LINKS — 2026-10-02
The final Admin-approved Digest is distributed as PDF. The PDF preserves the exact approved visual state and active links to corresponding IIG NEWS/Finance/Regulation/Advice pages plus Project and Subscribe CTAs. A PDF with flattened/non-clickable links is not release-ready.

The server is allowed to convert the exact Admin artifact to PDF for storage/distribution, but is forbidden to re-author or regenerate layout/content. Only a verified PDF may be promoted to CURRENT.


## PAGE 3 CAPACITY + CTA FOOTER INVARIANT — 2026-10-03
Page 3 has a protected lower zone for 3 Chief Engineer Advice rows and two CTA buttons. Finance/Regulation items use only the safe area above that zone and are packed as close to 50/50 as available content permits. Overflow is continued on Page 4+ rather than compressing the protected lower zone.

Page 3 and every page 4+ contain active Project and Subscribe buttons at the bottom. These are canonical layout components and must remain in Admin Working Preview, Final Preview and linked PDF output.


## PAGE 3 NON-OVERLAP LAYOUT — 2026-10-03
The protected lower part of Page 3 is sequential, not layered: Advice block first, CTA footer second. The content list above may shrink in count but must never force the CTA over Advice text. Safe packing takes precedence over item count.


## ADVICE DIRECT ROUTE + CURRENT DOWNLOAD ROUTE — 2026-10-03
Advice links in every Digest use `advice-article.html?id=<slug>`. Legacy `?slug=` may be read, not generated.

After Final Preview and ADMIN_1 approval, Admin exposes a separate `ЗАЛИТИ ДАЙДЖЕСТ НА САЙТ` control. Approval alone does not claim publication. Public download resolves the server CURRENT release and never redirects users to the News section when no Digest is published.


## VISIBLE READ-MORE + PDF-TO-SITE INVARIANT — 2026-10-03
Each Digest news row ends with visible `Читати далі... →` at the right edge, inside the same active link as the news title. Advice links use canonical `?id=` routes with compatibility for legacy `?slug=` links.

The released website artifact is the exact ADMIN_1-approved PDF uploaded from Admin. Publication is a storage/current-archive transaction, not a second generation step. Public download must resolve to the CURRENT PDF, never to News & Insights.


## EXPLICIT READ-MORE + WEBSITE PDF DISTRIBUTION — 2026-10-03
Each Digest content row ends with `Читати далі... →` aligned toward the right edge; the entire row link targets the specific IIG article. Advice links use canonical `advice-article.html?id=` routes, with legacy slug-route compatibility only for historical artifacts.

The canonical distribution surface is the IIG website CURRENT PDF. Admin approval alone does not mean public availability; ADMIN_1 must execute the dedicated site-upload action. On success the public site points to the new PDF and the previous PDF is archived. No chat attachment or NEWS-page redirect is a valid substitute.


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


## FINAL_ADMIN_IIG — MEASURED LAYOUT CAPACITY LOCK (2026-10-03)

Headless-browser stress test with the approved static 32 px core row geometry found:

- Page 2 at 23 rows overflowed the 864 px page canvas (scrollHeight 992 px) and pushed the Subscribe CTA outside the page.
- Page 2 at 20 rows still produced scroll overflow; 21+ moved the CTA outside the page.
- **Safe Page 2 capacity = 19 core rows** with the mandatory bottom Subscribe CTA.
- **Safe Page 3 capacity = 14 core rows** with 3 Chief Engineer Advice rows and Project + Subscribe CTA; no overflow was observed in the stress test.
- Page 2 and Page 3 core row geometry remains identical: 554 px measured inner row width in the test canvas and exactly 32 px row height.

HARD runtime capacity: `PAGE_CAPACITY={cover:0,news:19,finance:14}`.
Any increase of Page 2 above 19 without a new browser geometry test is a release blocker.


## FINAL_ADMIN_IIG — PDF EXPORT WITHOUT POP-UP V4 (2026-10-05)

- The Admin action **PDF · ЗБЕРЕГТИ** MUST NOT use `window.open()` and MUST NOT require browser pop-up permission.
- Approved Digest HTML is printed from an internal same-origin iframe (`iigDigestPrintFrame`) and invokes the browser system print dialog from that frame.
- The operator selects **Save as PDF / Зберегти як PDF** in the system print dialog.
- Before rendering the print frame, the export injects a `<base href="...">` pointing to the current IIG Admin/site origin so relative NEWS / Advice / CTA links resolve to valid IIG URLs and can be written as active PDF link annotations by Chromium.
- Export source remains the exact ADMIN_1-approved manual-layout fingerprint; no Auto-fill/rebuild is allowed during PDF export.
- Regression blocker: reintroducing blank-window `window.open()`, a pop-up permission dependency, or stripping the anchor `href` routes from PDF HTML is forbidden.


## FINAL_ADMIN_IIG — PDF VISUAL FIDELITY V5 (2026-10-05)

### Root cause

Chrome/Edge Save-as-PDF can suppress CSS `background-image` when Background graphics is disabled, and nested iframe content is not a reliable print source. This caused the approved cover photo / visual substrate to disappear in the PDF preview.

### HARD export rules

- Critical Digest imagery MUST NOT rely on CSS background printing.
- Cover and promo background photos are materialized as foreground `<img class="pdf-visual-bg">` elements inside the printable DOM.
- Dark cover/promo overlays are materialized as foreground SVG layers (`pdf-visual-overlay`), not as print-dependent CSS background gradients.
- DEFAULT MASTER cover MUST NOT be printed through the nested MASTER iframe. PDF export reconstructs the approved MASTER visual using the approved master background image and the same cover content/CTA structure.
- Article photos remain ordinary `<img>` elements and must be visible in PDF.
- PDF CSS sets `-webkit-print-color-adjust: exact` and `print-color-adjust: exact`.
- Before invoking `print()`, Admin waits for every image plus `document.fonts.ready`; printing before asset readiness is forbidden.
- The PDF must preserve the exact ADMIN_1-approved manual-layout fingerprint and all active NEWS / Advice / CTA hyperlinks.
- User should NOT need to enable the browser «Background graphics / Фон» option for critical approved imagery to appear.

Any return to iframe-only cover printing or CSS-background-only critical imagery is a release-blocking regression.


## FINAL_ADMIN_IIG — CROSS-DEVICE DIGEST LINKS V6 (2026-10-05)

### Root cause

The public news renderer merged ADMIN demo-published items from browser `localStorage`. Therefore a link could work on the ADMIN workstation but fail on another computer where that local browser state did not exist. The public repository registry could contain the same article in REVIEW state, so the ordinary public filter hid it and returned “verified/approved news unavailable”.

### HARD link contract

- PDF NEWS links must be absolute HTTPS IIG links and carry an explicit release marker: `source=iig-admin1-digest&issue=YYYY-MM`.
- This marker is added only by export from an ADMIN_1-approved Digest artifact.
- `article.html` may resolve the exact requested slug from the shared `content/public-news.json` registry when that marker is present and the record passes source/date/slug/content validation.
- This fallback is limited to the requested article route. Homepage, News lists and industry listings continue to use ordinary APPROVED/PUBLISHED filtering and MUST NOT mass-publish REVIEW items.
- Chief Engineer Advice continues to use the shared approved advice registry and canonical `advice-article.html?id=<slug>` route.
- Cross-device behavior must not depend on `localStorage`, `sessionStorage`, browser profile, ADMIN workstation or previous local publication state.
- Any PDF link that resolves only because of ADMIN-browser local storage is a release-blocking defect.


## FINAL_ADMIN_IIG — ADMIN_2 PDF RE-UPLOAD / REPLACE CURRENT V7 (2026-10-05)

### Authority split

- **ADMIN_1** remains the only role that can approve/fix the Digest content/layout fingerprint.
- After that approval, **ADMIN_1 or ADMIN_2** may upload or re-upload the already-generated PDF binary for the exact approved fingerprint.
- ADMIN_2 PDF re-upload is a technical publication action only. It does not authorize editing or approving Digest content.
- Re-upload does **not** require a new Final Preview / Final Approval while the approved fingerprint is unchanged.
- If the layout fingerprint changes after approval, PDF publication is blocked until Final Preview + ADMIN_1 approval are repeated.

### Replacement semantics

This section supersedes all older Digest publication clauses that said previous CURRENT must be archived.

- New upload is **REPLACE CURRENT**, not append/archive.
- Backend request contract: `replace_current=true`, `delete_previous_current=true`, `archive_previous_current=false`.
- The previous CURRENT PDF must be physically removed or made unreachable before the new transaction is reported successful.
- Backend success MUST return `previous_current_deleted=true`.
- Exactly one public CURRENT PDF may exist at a time.
- Public URL must carry a new immutable revision/hash or explicit cache-busting revision so browser/CDN caches cannot serve the superseded PDF.
- Admin sends `X-IIG-Digest-Revision`; public resolver appends `?v=<revision>` when necessary.
- A successful replacement keeps `READY_FOR_DOWNLOAD` and `READY_FOR_MAILING` and preserves active PDF link annotations.

### Static-host limitation

- GitHub Pages is static and cannot accept a browser file upload by itself.
- The protected endpoint `POST /api/v1/digest/releases` (or an equivalent authenticated production storage API) is therefore mandatory for true Admin-to-site upload.
- The Admin UI must not claim publication success when that endpoint is absent.
- Static fallback may serve `digest/current.pdf` if such a file was deployed by another authenticated mechanism; it is not a substitute for the upload API.

Any return to ADMIN_1-only technical PDF re-upload, blocking replacement after status PUBLISHED, retaining multiple CURRENT files, or serving an unversioned stale CURRENT PDF is a release-blocking regression.


## FINAL_ADMIN_IIG — STATIC CURRENT PACKAGE V8 (2026-10-05)

### GitHub Pages behavior

- GitHub Pages has no server-side upload endpoint and MUST NOT call `POST /api/v1/digest/releases` from the Admin publish button.
- On a `*.github.io` host, Admin short-circuits before the API call and creates a deterministic static publication package from the already ADMIN_1-approved PDF.
- The package contains:
  - `current.pdf` — the exact selected approved PDF, renamed for canonical static publication;
  - `current.json` — issue/fingerprint/revision/approval metadata.
- The static flow must never show the obsolete **UPLOAD BACKEND NOT CONNECTED** error modal.
- ADMIN_1 and ADMIN_2 may prepare this package for the unchanged approved fingerprint.
- Deploying the package means replacing `digest/current.pdf` and `digest/current.json`; the previous files are overwritten/removed so exactly one CURRENT remains.
- `digest/current.html` requests CURRENT with cache bypass/revision, so a replaced PDF cannot be served under the old browser/CDN cache identity.

### Production behavior

- On a production host with `/api/v1/digest/releases`, Admin continues to use authenticated REPLACE CURRENT semantics: delete previous CURRENT, publish new PDF, verify links, return a new revision URL.

Returning to a GitHub-Pages API POST attempt or showing a backend-missing modal on the static host is a release-blocking regression.


## FINAL_ADMIN_IIG — PUBLIC DIRECT CURRENT PDF DOWNLOAD V9 (2026-10-05)

### Public-user contract

- The homepage action **«ЗАВАНТАЖИТИ ДАЙДЖЕСТ PDF»** is a user download action, not an Admin workflow entry point.
- If a physical CURRENT PDF exists, the homepage binds directly to that PDF and sets a download filename. The user must not be routed through ADMIN, approval, API, upload-endpoint, or publication diagnostics.
- Public users must never see the terms ADMIN_1, ADMIN_2, upload endpoint, approval workflow, production backend or repository publication instructions.
- `digest/current.html` is a public-only fallback resolver. It may show only neutral availability text and the direct PDF download button.
- The resolver checks `current.json` for revision metadata and `current.pdf` for the actual binary. If unavailable, it shows only **«Актуальний випуск тимчасово недоступний. Будь ласка, спробуйте пізніше.»**

### Source-of-truth rule

- A PDF is considered **published** only when its binary physically exists in public hosting/storage as CURRENT. Preparing/downloading `current.pdf` on an Admin workstation is not publication.
- GitHub Pages static publication requires `digest/current.pdf` (and preferably `digest/current.json`) to be committed/deployed to the Pages artifact.
- Production hosting may implement the same contract through authenticated storage/API, but the public result must remain a physical/versioned PDF URL.

### Replacement/cache rule

- Exactly one CURRENT PDF is publicly addressable.
- Replacing CURRENT must invalidate the previous cache identity using an immutable revision/hash or `?v=<revision>`.
- The public homepage and resolver use cache-bypassing metadata checks before binding the download URL.

### Migration invariant

When moving from GitHub Pages to a paid domain/hosting, preserve the same separation:
**Admin publication layer → physical CURRENT PDF in storage → public direct-download layer.** Public pages never expose Admin controls or backend diagnostics.

Any public redirect to Admin workflow, any Admin/API error text visible to users, or any “published” state without a physical CURRENT PDF is a release-blocking regression.


## FINAL_ADMIN_IIG — ADMIN_2 RE-UPLOAD OF PREVIOUSLY APPROVED PDF V10 (2026-10-05)

### Canonical rule

- If a Digest PDF was already generated from a layout that ADMIN_1 previously approved, **ADMIN_2 may select that existing PDF from a local folder and upload/re-upload it without regenerating the Digest, without a new Final Preview and without a new ADMIN_1 approval**.
- This is permitted only when the current Digest layout fingerprint matches a persisted ADMIN_1 approval receipt for the same issue/revision.
- ADMIN_2 receives publication/re-upload authority only; ADMIN_2 does not receive content-approval authority.

### Approval receipt

- ADMIN_1 Final Approval stores a durable approval receipt containing issue, approved fingerprint, preview fingerprint, revision, approver and approval timestamp.
- The re-upload gate accepts either the current live ADMIN_1-approved candidate or a valid persisted approval receipt whose fingerprint exactly matches the current manual Digest.
- If the layout changes after approval, the receipt no longer authorizes re-upload. A new Final Preview + ADMIN_1 approval is required only because the content changed, not because the PDF file is being re-uploaded.

### Operator workflow

**Previously approved PDF already exists:**
1. ADMIN_2 opens Digest Admin.
2. Selects the existing PDF from the local file catalog using **«Раніше згенерований / готовий PDF»**.
3. Presses **«ОПУБЛІКУВАТИ / ЗАМІНИТИ CURRENT PDF»**.
4. No candidate rebuild, no new PDF generation and no repeated Final Preview/approval are required while the approved fingerprint is unchanged.

Any rule that forces regeneration or a repeated approval solely because ADMIN_2 is re-uploading the same previously approved PDF is a release-blocking regression.


## FINAL_ADMIN_IIG — CANONICAL «ЗАЛИТИ ДАЙДЖЕСТ НА САЙТ IIG» V11 (2026-10-05)

### Operator rule

- The canonical publication action is **«ЗАЛИТИ ДАЙДЖЕСТ НА САЙТ IIG»**.
- ADMIN_1 or ADMIN_2 may use this action for a previously generated PDF when the same Digest revision was already approved by ADMIN_1 and the approval receipt still matches the current fingerprint.
- Re-upload of the already-approved PDF does not require regeneration, candidate rebuild, Final Preview, or repeated ADMIN_1 approval.

### Success definition

Publication is successful only after the PDF binary physically exists in public hosting/storage as the single CURRENT artifact and is reachable through a public versioned HTTPS URL. Selecting a local file, downloading a static package, or creating metadata in the browser is not publication.

### Portable production contract

The paid-domain/hosting implementation MUST preserve this API contract:

`POST /api/v1/digest/releases`
- authenticated ADMIN_1 or ADMIN_2;
- multipart PDF + metadata;
- verify unchanged ADMIN_1-approved fingerprint;
- replace CURRENT atomically;
- delete previous CURRENT;
- verify active PDF hyperlinks;
- return `public_url`, `revision`, `previous_current_deleted=true`, `links_preserved=true`.

Public flow:
**homepage → direct versioned CURRENT PDF download**. No Admin or backend diagnostics may ever be exposed publicly.

### Static GitHub Pages limitation

GitHub Pages does not provide a browser write endpoint. Therefore the demo MUST NOT report successful site publication after a local file selection. On static hosting it may prepare a package, but true publication requires a write-capable storage/API or committing `digest/current.pdf` into the deployed artifact through an authenticated mechanism.

Any implementation that labels a locally selected file as “published” before the binary is physically accessible from the public site is a release-blocking defect.


## FINAL_ADMIN_IIG — PDF FILE NAMING + PHYSICAL CURRENT REQUIREMENT V12 (2026-10-05)

### PDF filename

- The browser Save-as-PDF default filename MUST follow `IIG_Digest_MM_YYYY.pdf`.
- Example: September 2026 → `IIG_Digest_09_2026.pdf`; October 2026 → `IIG_Digest_10_2026.pdf`.
- Admin page titles such as “IIG Адмін-панель — Крок 26 • Демо” must never be used as the PDF filename.
- Before print, both the print-frame document title and the temporary parent document title are set to the deterministic Digest basename; the parent title is restored after printing.

### Physical CURRENT binary

- A public download is possible only when the exact approved PDF binary physically exists in public hosting/storage as `digest/current.pdf` (or an equivalent versioned storage URL returned by production API).
- A locally selected or downloaded PDF on an ADMIN workstation is not sufficient and must never be treated as public publication.
- If CURRENT is physically absent, the public download button must remain hidden/inactive and only neutral unavailability text may be shown.
- Once CURRENT exists, the homepage must bind directly to its versioned PDF URL and download it without exposing Admin workflow.

Any return to an Admin-derived PDF filename or a visible/active public download control when CURRENT is absent is a release-blocking regression.


## FINAL_ADMIN_IIG — PORTABLE AUTOMATIC DIGEST PUBLICATION BACKEND V13 (2026-10-05)

### Canonical publication pipeline

The IIG Digest publication flow is now standardized as:

**ADMIN_1 Final Approval → server-side approval receipt → ADMIN_1/ADMIN_2 PDF upload → PDF validation/link verification → atomic CURRENT replacement → public direct download.**

### Stable portable API

Every future IIG hosting/domain migration MUST preserve these URLs (or reverse-proxy them unchanged):

- `POST /api/v1/digest/approvals` — ADMIN_1 stores the approved issue/fingerprint/revision on the server.
- `POST /api/v1/digest/releases` — ADMIN_1 or ADMIN_2 uploads an already approved PDF.
- `GET /api/v1/digest/current` — public/runtime metadata for the current release.
- `GET /digest/current.pdf` — direct public PDF download.

### ADMIN_2 re-upload rule

ADMIN_2 may upload a previously generated PDF from a local catalog without regenerating the Digest and without repeating Final Preview/ADMIN_1 approval when the server-side ADMIN_1 approval receipt still matches the exact issue/fingerprint.

### Backend validation

A release is accepted only when:

1. authenticated role is ADMIN_1 or ADMIN_2;
2. uploaded binary is a valid PDF signature and within the size limit;
3. issue/fingerprint match the server-side ADMIN_1 approval receipt;
4. expected IIG NEWS / Advice / CTA links are present as active HTTP(S) PDF annotations;
5. storage write succeeds.

Only then backend reports `CURRENT` and returns a versioned public URL.

### Storage portability

The backend supports:

- **LOCAL** persistent filesystem for VPS/classic paid hosting;
- **S3-compatible** object storage for AWS S3, Cloudflare R2, MinIO, Backblaze B2 S3 API, or equivalent.

Switching storage is environment configuration only. Admin/public frontend routes do not change.

### CURRENT replacement/cache behavior

- Exactly one logical CURRENT exists.
- New upload replaces the current binary and metadata.
- Public metadata is `no-store`.
- PDF response is `public, max-age=0, must-revalidate` and carries an ETag/revision.
- Homepage resolves the current metadata and binds directly to `/digest/current.pdf?v=<revision>`.
- Public users never see Admin/backend diagnostics.

### Security portability

Preferred deployment uses a trusted reverse proxy/auth layer that removes any client-supplied `X-IIG-Admin-Role` and injects ADMIN_1/ADMIN_2 only after successful authentication. Optional bearer tokens are supported for integration, but secrets must never be embedded in public JavaScript.

### Deployment package

The canonical repository contains:

- `backend/Dockerfile`
- `backend/docker-compose.yml`
- `backend/.env.example`
- `backend/nginx.iig-digest.conf`
- `backend/README.md`
- local/S3 storage adapters, server-side approval receipts and PDF hyperlink verification.

When moving IIG to a paid domain/hosting, deploy this service (or a contract-compatible implementation) behind the same domain. No Digest UI rewrite is permitted/required.

Any implementation that reverts to browser-local publication, requires manual public-file replacement after a successful production upload, exposes secrets client-side, or changes these stable public/API routes is a portability regression and release blocker.


## FINAL_ADMIN_IIG — PUBLIC CURRENT PHYSICAL GATE V14 (2026-10-05)

- Public download controls MUST NOT be rendered/activated before the CURRENT PDF binary is physically verified in public storage.
- `digest/current.html` creates its download anchor dynamically only after a successful HEAD/metadata check of `current.pdf`.
- If CURRENT is absent, the page shows only neutral unavailability text; there is no clickable download control.
- Homepage Digest CTA is disabled and loses its href when CURRENT is absent. It must not route users to a dead resolver page.
- When CURRENT exists, homepage binds directly to the versioned PDF URL and enables the normal browser download flow.
- This rule is hosting-agnostic and must survive migration to any paid domain/storage implementation.

A visible or clickable public Digest download control without a physically available CURRENT PDF is a release-blocking regression.


## FINAL_ADMIN_IIG — BILINGUAL DIGEST EDITIONS UA/EN V15 (2026-10-05)

### Canonical language rule

- **UA is the primary/default Digest language.**
- ADMIN may explicitly switch the working Digest to **EN** using the Digest language selector.
- UA and EN are independent editorial/release editions of the same monthly issue. Switching language must never overwrite the other language's manual layout, release-candidate, Final Preview snapshot, ADMIN_1 approval receipt or PDF artifact.

### Persistence / approval separation

- Digest persistence keys are language-scoped by issue and language.
- Candidate/fingerprint includes the selected language.
- ADMIN_1 approval for UA does not approve EN automatically, and EN approval does not replace UA approval.
- Returning from EN to UA restores the previously saved UA edition exactly, and vice versa.

### Content selection

- Digest NEWS/Advice output uses the matching localized fields: UA edition prefers `ua`, EN edition prefers `en`.
- If an EN field is absent, the system may fall back to the UA value so the material is not silently lost; the fallback remains visible editorial content and may be edited before approval.
- Layout geometry, page capacities, link routes and approval rules stay identical across languages.

### Required English UI inside the generated Digest

EN output uses English cover/subtitle, month names, section headers, Chief Engineer Advice label, **Read more...**, **SUBMIT A PROJECT**, and **SUBSCRIBE TO THE DIGEST**.

### Artifact naming

- UA: `IIG_Digest_MM_YYYY.pdf`
- EN: `IIG_Digest_MM_YYYY_EN.pdf`

The EN artifact must not overwrite the UA artifact merely because month/year are identical.

### Portability invariant

Any future paid-domain/hosting migration must preserve the language selector, UA-default behavior, language-scoped layout/candidate/approval state, localized PDF rendering, and non-colliding UA/EN artifact names.

A regression that merges UA/EN state, makes EN overwrite UA, or silently forces Digest generation back to UA-only is a release blocker.


## FINAL_ADMIN_IIG — BILINGUAL DIGEST OWNER ACCEPTANCE + PORTABILITY GATE V16 (2026-10-06)

**OWNER ACCEPTANCE: PASSED.** The owner verified the bilingual Digest flow in Admin:
- UA remains the primary/default edition.
- Switching to EN produces the English edition correctly.
- EN translation rendering is accepted as correct.
- Internal Digest links and content redirects in EN were manually checked and work correctly.
- Returning between UA and EN must preserve the corresponding language-scoped edition/state.

### Portable migration contract

Any migration to another domain, paid hosting, VPS, container platform or S3-compatible storage MUST preserve this verified behavior without redesigning the Digest workflow:
1. language selector exposes UA and EN;
2. UA is selected by default on a new Digest session;
3. language is carried through Admin state, candidate/fingerprint, Final Preview, ADMIN_1 approval, PDF rendering, release metadata and storage;
4. UA and EN CURRENT artifacts are isolated and never overwrite one another;
5. EN uses the same approved content identity/link targets as the corresponding localized material;
6. PDF hyperlinks remain active after generation/upload;
7. migration configuration is environment/proxy/storage based — no hardcoded old domain is permitted in bilingual workflow logic;
8. post-migration regression test MUST generate/preview both UA and EN, verify language-specific artifact identity, and click-test NEWS, Advice and CTA links before production cutover.

### Acceptance gate after migration

Migration is NOT accepted until all of the following pass:
`UA_DEFAULT=PASS + EN_SWITCH=PASS + EN_TRANSLATION=PASS + UA_EN_STATE_ISOLATION=PASS + PDF_LINKS=PASS + DIRECT_CONTENT_LINKS=PASS + CTA_LINKS=PASS + PUBLIC_DOWNLOAD_UA=PASS + PUBLIC_DOWNLOAD_EN=PASS`.

Any loss of EN translation, fallback to UA-only operation, cross-language overwrite, broken link annotation, old-domain hardcoding, or wrong-language public artifact is a RELEASE BLOCKER.

**Status:** VERIFIED / OWNER APPROVED / PORTABLE.


## FINAL_ADMIN_IIG — PAGE 4+ CTA DEDUPLICATION HARD RULE V17 (2026-10-06)

**BUG FOUND BY OWNER / RED TEAM — FIXED.**

### Canonical Page 4+ CTA rule
- Additional promo/article pages MUST NOT render a second inline CTA pair inside the page content body.
- The legacy inline buttons such as **«Детальніше»** and **«Розмістити проєкт»** inside the text/content zone are forbidden.
- Page 3 and every Page 4+ retain ONLY the canonical bottom footer CTA pair generated by `digestEndCtas()`: Project + Subscribe.
- The bottom footer CTA geometry, routes, language-aware labels and placement remain unchanged.
- Working Preview and print/PDF renderer MUST follow the same rule; no renderer may reintroduce the inline duplicate pair.
- Newly created Page 4+ promo pages start with empty legacy CTA fields so stale defaults cannot leak back into output.

### Portability / migration gate
This rule is part of the portable MASTER. Any new hosting/domain implementation MUST preserve:
`NO_INLINE_PROMO_CTA + ONE_BOTTOM_CANONICAL_CTA_PAIR + UA_EN_LABELS + ACTIVE_PROJECT_SUBSCRIBE_LINKS`.

A duplicated CTA pair on Page 4+, or removal of the canonical bottom footer CTA pair, is a RELEASE-BLOCKING regression.

**Status:** FIXED / PROTOCOL LOCKED / PORTABLE.
