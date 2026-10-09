# STEP 26 — OWNER APPROVED FINAL HOSTING ASSEMBLY INSTRUCTION

**Authority:** OWNER APPROVED / HARD LOCK / SOURCE OF TRUTH, dated 2026-10-09.
**Basis:** Owner-uploaded original `IIG_STEP26_APPROVED_SITE_DESIGN_HARD_RULE_2026-10-09(1).docx` (6 pages), SHA-256 `6f5218987c27b34a0145061d3321b942776f171fb2bc6a28f1aac8bd4b750f0e`.
**Supporting execution history:** Owner-uploaded `ШАГ_26_FINAL исполнительный проход(1).docx` (115 pages), SHA-256 `4022f85e817605928eb3fb26536bea31c40ae9c64ebeacf85baafb1e0483879a`.
**Repository canonical technical contracts:** `docs/STEP26_MASTER_SITE_ARCHITECTURE_HARD_RULE_2026-10-09.md`, `config/site-design-lock.json`, `scripts/check_site_design_lock.py`, `docs/PARTNER_PROGRAM_PROTOCOL.md`, `.github/workflows/pages.yml`.
**Markers:** `STEP26_MASTER_SITE_ARCHITECTURE_HARD_RULE_V1`, `STEP26_PAID_HOSTING_VISUAL_PORTABILITY_LOCK_V1`, `STEP26_STATIC_FIRST_RENDERING_RULE_V1`, `STEP26_ADVICE_TAG_CONTRAST_LOCK_V1`, `IIG_PARTNER_PROGRAM_MIGRATION_LOCK_V1`.

## Priority / no substitutions
The 6-page owner-approved design DOCX supersedes older visual/structural protocols for block order, colors, assets, right rail, buttons and responsiveness. Do not rebuild by memory or generic templates. Preserve approved HTML/CSS composition before JS runs; no runtime-JS-only shell. Do not substitute generated photos, Unsplash, WebP for the two approved original PNGs. Every change to layout, color, sizing, asset, block order or CTA requires explicit owner approval and simultaneous revision of code, MASTER protocol, machine-readable design lock, checker and Word original.

## Design tokens
Primary Navy `#06223D`; CTA Navy `#062450`; Deep Blue `#0B2B5C`; Link Blue `#153F8A`; Yellow `#FFC400`; Digest Border `#F2BD00`; Light CTA `#C9E8FF`; Soft `#F5F7FA`; Right Rail `#F4F6F9`; Card Border `#D9E1EA`.

## Header and routes
All public pages: sticky navy `#06223D` header, white `assets/iig-logo-white.svg`, active item and active UA/EN yellow `#FFC400`; legacy white header FORBIDDEN. Header HOME min-height 76px. Navigation: ГОЛОВНА → ГАЛУЗІ → ФІНАНСУВАННЯ → ПОРАДИ ГОЛОВНОГО ІНЖЕНЕРА → НОВИНИ ТА ІНСАЙТИ → ПРО IIG → КОНТАКТИ → UA/EN → search. Ukrainian default, UA/EN preserved across navigation.

Mandatory routes: `index.html`, `industry.html`, `financing.html`, `finance-news.html`, `advice.html`, `advice-article.html`, `news.html`, `article.html`, `about.html`, `forms.html`.

## Immutable image assets
Hero: `Вариант шапки сайта_промкомплекса на рассвете ( розово-фиалетовый).png`.
Chief Engineer: `Принятое фото главного инженера в каске IIG.png`.
Preserve original binary bytes and integrity; no textual media placeholders. Partner logos also require binary integrity.

## HOME — locked structure
Desktop shell max-width 1536px; main + right rail width 360px.
Main in exact order: (1) HERO, (2) ПРОГРАМИ ТА МОЖЛИВОСТІ ФІНАНСУВАННЯ, (3) TOP-5 АКТУАЛЬНИХ НОВИН ПРОМИСЛОВОЇ ЕНЕРГЕТИКИ, (4) ДОСЛІДЖУЙТЕ ЗА ГАЛУЗЗЮ, (5) bottom navy values panel (five columns).
Hero: original sunrise, center/cover, left navy gradient; desktop min-height ~330px, mobile ~460px; title ~37px, line-height 1.02, max-width ~790px; subtitle ~16px; padding ~25px 30px; search white radius 8px max-width ~680px with dark navy search button. Digest button INSIDE hero at bottom right, max-width 245px, min-height 58px, `#062450`, yellow border, 32x32 download circle and downward arrow; PDF must download.
Financing: seven institutions in exact order NRB → EBRD → EIFO → Bpifrance → EIB → World Bank → BII. Desktop one row, card height 102px, gap 6px, border 1px, radius 8px; mobile two columns, card height 96px. Logos cannot change grid.
TOP-5: exactly five latest approved public news; image, metadata, headline, tags and functional article link; 'ПЕРЕГЛЯНУТИ ВСІ →' at right. No empty/demo cards; TOP-5 before industries.
Industries: exactly nine cards, desktop nine columns, gap ~7px, image area ~75px, min-height 150px, number badge top-left; mobile two columns; no ellipsis or horizontal clipping.
Bottom values: background `#06234D`, five equal desktop columns.

## Right rail — exact sequence
1. Chief Engineer approved photo (245px desktop, center 28% / cover).
2. Navy `#06223D` title block with white title and yellow CTA.
3. Yellow 'ПЕРЕГЛЯНУТИ ВСІ ПОРАДИ →'.
4. '6 ОСТАННІХ ПОРАД' heading.
5. Six advice items with tags `#0B2B5C`, font-weight 700, opacity 1. Pale `#D7E3EF` tags on light background forbidden.
6. 'ЗАДАТИ ПИТАННЯ...' CTA `#C9E8FF`.
7. 'НАДІСЛАТИ ПРОЄКТ' CTA `#C9E8FF`.
8. СТРАТЕГІЧНІ ПАРТНЕРИ / ПАРТНЕРИ, ADMIN_2 managed.
9. IIG social links: Facebook and LinkedIn placeholders until approved URLs.

Partner program immediately below project CTA: strategic 1 logo full-width, 2 logos in two columns; up to eight ordinary partners in 2x4; white cards border `#DBE3EC`, radius 8px, logos `contain`. ADMIN_2 controls logo, URL and visibility.

## Buttons
Primary yellow `#FFC400` / navy text / ~7px radius; dark navy `#06223D` or `#062450` / white text / 7–8px; light `#C9E8FF` / deep-blue text / 7px; text links transparent / `#153F8A`; digest navy/yellow/white with yellow border.

## Mobile and release gate
Desktop QA widths 1366, 1440, 1536, 1920, 2560. Mobile breakpoint <=700px; right rail stacks below, engineer photo remains visible; finance and industries each two columns; digest stays inside hero without covering title/search; no horizontal scrolling. Check partner logos in Android and an independent mobile/browser.

Release BLOCKED unless: original PNG bytes and white SVG logo intact; correct navy header/yellow active; exact HOME and right-rail order; working PDF download; six advice items; seven financing cards; nine industries; ADMIN_2 partner controls; UA/EN; working search; internal navigation red-team; no media 404; cache versioning; design-lock checker PASS; desktop and two-mobile visual QA PASS.

## Migration blocker (STEP 29.3)
`IIG_PLATFORM/apps/web/index.html` was only a foundation placeholder and Dockerfile packaged only that placeholder. Never deploy that as the approved site. The final host build must package the approved public tree with immutable manifest and preserve all HTML/CSS/JS/media/PDF, then prove actual route, search, digest and robot behavior in staging.

## Important status
This document is a repository transcription/operational cross-reference of the owner-supplied six-page design standard; **the two original binary DOCX files are NOT uploaded by this commit**. Their SHA-256 identifiers are recorded above to enable exact later archival. The 115-page execution history is an audit record and is not allowed to override the six-page owner-approved design HARD LOCK. GitHub commit alone is not a hosted QA pass.
