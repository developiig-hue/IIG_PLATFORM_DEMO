# STEP 26 — IIG MASTER SITE ARCHITECTURE & VISUAL HARD RULE

Date: 2026-10-09  
Status: OWNER APPROVED / HARD LOCK / PAID-HOSTING PORTABILITY SOURCE OF TRUTH  
Precedence marker: `STEP26_MASTER_SITE_ARCHITECTURE_HARD_RULE_V1`

This document is the highest-priority visual and structural specification for the public IIG website. If any older STEP 25/26 note conflicts with this document, this MASTER file wins for page order, composition, colors, asset identity, placement and migration acceptance.

## 1. Global design tokens — immutable

- Primary navy: `#06223D`
- Secondary navy / CTA navy: `#062450`
- Deep blue text: `#0B2B5C`
- Link blue: `#153F8A`
- Active / accent yellow: `#FFC400`
- Digest border yellow: `#F2BD00`
- Light CTA background: `#C9E8FF`
- Light section background: `#F5F7FA` / accepted right-rail light `#F4F6F9`
- Standard border: `#D9E1EA` / `#DBE2EA`
- Partner border: `#D7E1EC`
- White: `#FFFFFF`
- Default body font: Calibri / Carlito / Arial, sans-serif.

Forbidden:
- white legacy top navigation;
- blue/gray text on gray when contrast is insufficient;
- generated replacement hero or engineer images;
- page-specific redesign of the shared header;
- moving approved blocks solely by runtime JS.

## 2. Shared top navigation — ALL public pages

Canonical pages:
`index.html`, `industry.html`, `case.html`, `advice.html`, `financing.html`, `finance-news.html`, `news.html`, `article.html`, `forms.html`, `about.html`.

Mandatory:
- sticky top bar;
- navy `#06223D`;
- white IIG logo: `assets/iig-logo-white.svg`;
- active menu item yellow `#FFC400`;
- inactive menu items white;
- active language yellow text, no white filled pill;
- desktop HOME header target min-height: 76 px; internal pages must visually match the same shared header and must never revert to the legacy white header.
- navigation order MUST remain:
  1. ГОЛОВНА
  2. ГАЛУЗІ
  3. ФІНАНСУВАННЯ
  4. ПОРАДИ ГОЛОВНОГО ІНЖЕНЕРА
  5. НОВИНИ ТА ІНСАЙТИ
  6. ПРО IIG
  7. КОНТАКТИ
  8. UA / EN
  9. search icon.
- first site entry: Ukrainian HOME; language switch must remain consistent during navigation.

## 3. Shared hero / banner asset

Only approved panorama:
`Вариант шапки сайта_промкомплекса на рассвете ( розово-фиалетовый).png`

HOME:
- full-width main hero under header;
- dark navy gradient overlay from left to right;
- min-height desktop approximately 330 px;
- mobile min-height approximately 460 px;
- background center / cover.

Internal public pages:
- page hero/banner must use the SAME approved sunrise panorama;
- no pipe photograph;
- no Unsplash substitution;
- no WEBP proxy as source of truth.

## 4. HOME desktop shell

Canonical desktop canvas:
- maximum shell width: 1536 px;
- columns: main content + 360 px right rail;
- main column may shrink; right rail remains visually distinct.
- breakpoint <= 1180 px: right rail moves below main content.
- mobile <= 700 px: one-column composition.

## 5. HOME hero content

Left side:
- title:
  `Інтелект енергетики промисловості / для сильнішого та стійкішого завтра.`
- white text; phrase `енергетики промисловості` yellow;
- desktop title approx. 37 px / line-height 1.02; max width about 790 px;
- subtitle approx. 16 px;
- content padding approx. 25 px 30 px.

Search:
- white field;
- radius 8 px;
- max width approx. 680 px on HOME;
- input text approx. 15 px;
- button navy, white text, bold;
- no detached or floating search button.

Digest CTA — HOME:
- MUST sit inside hero, lower-right;
- width max 245 px;
- min-height 58 px;
- navy `#062450`;
- yellow border `#F2BD00`;
- radius 6 px;
- title yellow, approx. 12 px;
- secondary text white, approx. 8 px;
- download circle approx. 32 × 32 px;
- yellow downward arrow;
- direct local PDF download;
- MUST NOT return to financing row.
- JS may bind URL but MUST NOT be needed for placement.

## 6. HOME main-column section order — immutable

Current owner-approved order, superseding any older conflicting note:

1. HERO
2. ПРОГРАМИ ТА МОЖЛИВОСТІ ФІНАНСУВАННЯ
3. TOP-5 АКТУАЛЬНИХ НОВИН ПРОМИСЛОВОЇ ЕНЕРГЕТИКИ
4. ДОСЛІДЖУЙТЕ ЗА ГАЛУЗЗЮ
5. 5-value navy strip / bottom values

No migration may reorder these blocks without explicit owner approval.

### 6.1 Financing programs
- 7 institution cards in one desktop row;
- grid gap 6 px;
- approved institution order:
  NRB → EBRD → EIFO → Bpifrance → EIB → World Bank → BII;
- approved card height: 102 px desktop; 96 px mobile;
- white card, 1 px light border, radius 8 px;
- institution logo centered and proportional;
- bank logo changes MUST NOT alter card dimensions or surrounding architecture;
- current owner-supplied local logo assets for EBRD, EIFO, Bpifrance, World Bank and BII are authoritative;
- mobile: two columns.

### 6.2 TOP-5 news
- exactly five latest approved public news cards on HOME;
- section title at left; `ПЕРЕГЛЯНУТИ ВСІ →` at right;
- no demo/unapproved news;
- each card contains image, metadata, title, tags and clickable route;
- article/news image must render; fallback must be sector/company-relevant, never an empty placeholder;
- HOME news order precedes industries.

### 6.3 Industries
Exactly 9 owner-approved industry cards:
01 Energy & Energy Infrastructure  
02 Metallurgy / Heavy Industry / Manufacturing  
03 Food & Beverage  
04 Logistics & Distribution Centers  
05 Data Centers  
06 Chemical Industry  
07 Agriculture & Agro-processing  
08 Pharmaceuticals  
09 Waste Management & Recycling

Desktop:
- 9-column grid;
- gap approx. 7 px;
- white cards; border; radius 6 px;
- min-height approx. 150 px;
- image area approx. 75 px;
- number badge top-left;
- text must wrap; clipping/ellipsis is forbidden.

Responsive:
- <=1180: 5-column / auto-fit behavior accepted;
- <=700: 2 columns.

### 6.4 Bottom value strip
- navy `#06234D`;
- 5 equal desktop columns;
- white primary text;
- light secondary text;
- each value separated by subtle divider;
- mobile may collapse to two/one columns without changing content.

## 7. RIGHT RAIL — immutable order

Desktop right rail order:
1. approved Chief Engineer photo;
2. navy Chief Engineer title block;
3. yellow `ПЕРЕГЛЯНУТИ ВСІ ПОРАДИ →` button;
4. `6 ОСТАННІХ ПОРАД`;
5. six latest advice items;
6. `ЗАДАТИ ПИТАННЯ ГОЛОВНОМУ ІНЖЕНЕРУ` CTA;
7. `НАДІСЛАТИ ПРОЄКТ` CTA;
8. Partner Program;
9. IIG social-media placeholders.

### 7.1 Chief Engineer image
Only approved asset:
`Принятое фото главного инженера в каске IIG.png`

Desktop target:
- 245 px high;
- full rail width;
- background-size cover;
- background-position center 28%;
- no generated substitute;
- no data-URI substitute as canonical source;
- no hidden/removed image.

### 7.2 Chief Engineer title block
- navy `#06223D`;
- white heading;
- padding 16 px;
- yellow button;
- button text navy;
- button radius about 7 px.

### 7.3 Advice list
- heading: `6 ОСТАННІХ ПОРАД`;
- six latest items;
- light/gray background;
- each item separated by thin navy divider;
- tag/meta above title MUST be dark navy `#0B2B5C`, bold 700, opacity 1;
- advice title approx. 11 px / 1.3–1.4 line-height in compact rail;
- tag text may never use `#D7E3EF` on light background.

### 7.4 Side CTAs
`ЗАДАТИ ПИТАННЯ ГОЛОВНОМУ ІНЖЕНЕРУ` and `НАДІСЛАТИ ПРОЄКТ`:
- light blue `#C9E8FF`;
- text `#0B2B5C`;
- radius 7 px;
- padding approx. 15 × 17 px;
- full available width inside rail;
- arrow on right.

## 8. Partner Program
Canonical contract remains `docs/PARTNER_PROGRAM_PROTOCOL.md`.

Placement:
- directly below `НАДІСЛАТИ ПРОЄКТ`.

Strategic:
- heading centered;
- 1 active partner = full width;
- 2 = two equal columns;
- clickable logo;
- admin-editable logo + URL.

Regular partners:
- up to 8;
- 2 × 4 compact grid.

Partner card:
- white;
- border `#DBE3EC`;
- radius 8 px;
- logo object-fit contain;
- binary asset integrity mandatory.

Social:
- Facebook + LinkedIn placeholders remain at bottom;
- non-clickable until official URLs configured.

## 9. Shared buttons / interaction visual rules

Primary yellow CTA:
- background `#FFC400`;
- text navy `#06223D`;
- radius ~7 px;
- bold;
- hover may darken slightly but must remain yellow family.

Dark CTA/search:
- background `#06223D` / `#062450`;
- white text;
- radius 7–8 px.

Text links / “VIEW ALL”:
- dark blue `#153F8A`;
- bold;
- compact size about 10–12 px;
- underline on hover acceptable.

Focus:
- keyboard focus must remain visible;
- approved yellow focus outline is acceptable.

## 10. Internal section configuration

### NEWS
- shared navy header + approved sunrise page hero;
- news listing below hero;
- approved public-news gate only;
- cards/rows link to article pages;
- working images and sector-relevant fallbacks;
- UA/EN labels and metadata must switch.

### ADVICE
- shared header + approved sunrise hero;
- Chief Engineer advice index;
- each advice item clickable to full advice;
- practical engineering content and concept illustration;
- no placeholder-only cards;
- tags dark navy on light backgrounds.

### FINANCING
- shared header + approved sunrise hero;
- financial institutions section;
- same institution identities as HOME;
- institution click leads to `finance-news.html?institution=...`;
- logos preserve approved files and aspect ratios.

### FINANCE INSTITUTION PAGE
- shared header + approved sunrise hero;
- institution logo, name and relevant signals;
- current layout: 3 latest relevant signals/cards;
- official source link per signal;
- same logo asset as HOME for that institution.

### INDUSTRY
- shared header + approved sunrise hero;
- dynamic industry title;
- TOP-5 latest industry intelligence;
- detailed exploration below;
- titles must wrap, never clip.

### ABOUT IIG
- shared header + approved sunrise hero;
- IIG profile;
- team;
- delivery / implementation process;
- contact block;
- branding remains `INDUSTRY INTELLIGENCE GENERATION (IIG)`.

### FORMS
- shared header + approved sunrise hero;
- three functions:
  1. submit energy project;
  2. subscribe to IIG Monthly Digest;
  3. ask Chief Engineer.
- forms must preserve labels, required fields, validation and UA/EN.

## 11. Responsive hard rules

Desktop QA widths:
1366, 1440, 1536, 1920, 2560.

Mobile QA:
- at least Android Chrome;
- second independent mobile/browser device;
- <=700 px canonical mobile breakpoint.

Mobile:
- burger replaces full nav where needed;
- logo remains white and legible;
- hero image remains approved sunrise;
- digest remains inside hero and must not cover search/title;
- finance cards: 2 columns;
- industries: 2 columns;
- right rail becomes stacked;
- engineer photo remains visible;
- partner logo must fully render;
- no horizontal scrolling caused by card text.

## 12. Static-first architecture rule

Critical approved visuals MUST exist in static HTML/CSS before JS enhancement:
- header color/logo/nav;
- hero asset;
- digest position;
- Chief Engineer photo;
- right-rail order;
- financing/news/industry block order;
- partner container.

JavaScript may enhance data, routing, language, download URL and dynamic content. JavaScript MUST NOT be the only mechanism that creates the approved page composition.

## 13. Asset integrity / cache rule

- binary images must be committed as real binary blobs;
- before release: validate signature, decode, dimensions and public URL;
- no text-write API for PNG/JPG/WebP;
- cache/version key must be bumped after public CSS/JS/media changes;
- a commit not visible on the published site is NOT released.

## 14. Paid-hosting migration hard gate

Migration to paid IIG hosting must preserve:
- exact approved asset paths or content-equivalent migrated paths;
- all block order;
- dimensions and responsive behavior;
- URLs/routes;
- admin-managed partner configuration;
- UA/EN;
- PDF download;
- public-news moderation rules;
- search;
- Chief Engineer links;
- forms.

Forbidden migration behavior:
- rebuilding from a generic template;
- substituting hero/engineer images;
- removing right rail;
- changing header to white;
- changing HOME section order;
- replacing partner program with hard-coded static data;
- silently dropping bilingual attributes;
- using stale cached CSS/JS.

## 15. Release acceptance checklist — mandatory

A release is GREEN only if ALL pass:
1. design-lock checker;
2. JS syntax guard;
3. STEP 26 Admin MASTER acceptance;
4. GitHub Pages / production deployment = success;
5. HOME visual screenshot at 1536×1024;
6. 1366/1440/1920/2560 desktop review;
7. two mobile-browser reviews;
8. header navy / white logo / yellow active;
9. approved sunrise visible;
10. approved Chief Engineer photo visible;
11. digest inside hero;
12. HOME order = Finance → TOP-5 News → Industries;
13. six advice items; navy tags;
14. partner block visible and functional;
15. PDF download works;
16. UA↔EN works across principal pages;
17. no broken internal links / 404 media.

Markers:
- `STEP26_MASTER_SITE_ARCHITECTURE_HARD_RULE_V1`
- `STEP26_PAID_HOSTING_VISUAL_PORTABILITY_LOCK_V1`
- `STEP26_STATIC_FIRST_RENDERING_RULE_V1`


## Public search HARD RULE — 2026-10-09

The public HOME search is a protected production function.

Canonical standalone module:
`assets/site-search.js`

Required behavior:
- button click and Enter MUST both launch search;
- search MUST NOT depend on the rest of `assets/iig.js`;
- search sources: `content/public-news.json`, `content/public-advice.json`, financing institutions and industry sections;
- full news body/body_html/company_context must be searchable, not only headlines;
- canonical finance aliases must include EIFO, EBRD/ЄБРР, EIB/ЄІБ, Bpifrance, World Bank and BII;
- results render directly below HOME hero and link to the relevant article/advice/finance/industry route;
- zero-result query must still visibly return a result panel; silent no-op is a RELEASE DEFECT;
- CI checker: `scripts/check_site_search.py`.

Marker: `STEP26_PUBLIC_SEARCH_HARD_RULE_V1`.


### Exact phrase deep-link rule
When the user searches an exact phrase that exists inside a published news article:
- the exact phrase match MUST outrank token-only matches;
- the search result MUST link directly to the matching article;
- the query MUST be passed as `find=`;
- the article MUST scroll to the matching text and highlight it;
- silent routing only to a generic news list is forbidden.

Marker: `STEP26_EXACT_PHRASE_DEEPLINK_SEARCH_V1`.
