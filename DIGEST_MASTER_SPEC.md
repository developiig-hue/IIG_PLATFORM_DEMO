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
