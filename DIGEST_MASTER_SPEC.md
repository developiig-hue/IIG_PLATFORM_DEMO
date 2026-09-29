# IIG Monthly Digest — MASTER SPEC v1.0

Status: **APPROVED / DESIGN & CONTENT PRINCIPLES LOCKED**  
Approval date: 2026-09-29  
Visual master: `IIG_Monthly_Digest_2026-09_FINAL_DEMO.pdf`  
Approved master SHA-256: `6003552eed45f96e32bc1794b2297a04adef84dd319595844cebef57118111fc`

## Immutable structure
1. Page 1 — COVER.
2. Page 2 — 15 Ukraine/World content cards.
3. Page 3 — Finance + Regulation + Chief Engineer Advice.

Portrait presentation; vertical reading 1 → 2 → 3. No layout change without new User/Admin approval and protocol version.

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
Exactly 15 content cards in approved vertical composition. No thumbnails/photos in cards. Each whole card is clickable. Safe-zone must separate card 15, extension slot, footer and Subscribe CTA. Do not fabricate content to fill a quota.

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
- Site MUST resolve hashes to the correct form.

## Portability
No hard dependency on GitHub Pages. All public routes derive from `IIG_PUBLIC_BASE_URL`. Local assets use repository-relative paths or a portable manifest. New hosting/domain MUST support HTTPS, Unicode, direct article routes, forms hashes and static PDF download.

## Release QA
- 3 pages in fixed order.
- visual regression against approved master.
- Ukrainian Unicode renders without ????.
- every content URL identity matches the represented item.
- Subscribe → #subscribe; Project → #project; no cross-link.
- public PDF download points to the current approved master.
- Robot #6 outputs READY_FOR_ADMIN_APPROVAL / auto_send=false.
- Robot #7 cannot send before Admin approval of exact digest artifact/SHA.

## Change control
Any visual/content-rule change requires new demo, User/Admin approval, protocol version increment, machine-readable spec update and regression QA. Silent builder/CSS drift is forbidden.
