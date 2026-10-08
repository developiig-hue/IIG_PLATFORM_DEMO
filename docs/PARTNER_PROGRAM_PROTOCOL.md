# IIG PARTNER PROGRAM — WEBSITE / ADMIN / MIGRATION CONTRACT

Status: OWNER APPROVED — 2026-10-08  
Marker: `IIG_PARTNER_PROGRAM_ARCHITECTURE_V1`

## Purpose

The Partner Program is a permanent website architecture block in the public right rail, directly below the CTA `НАДІСЛАТИ ПРОЄКТ`.

It must survive migration from GitHub Pages/demo to the paid IIG hosting without visual or functional regression.

## Public website layout

Accepted order in the right rail:

1. Chief Engineer block.
2. `ЗАДАТИ ПИТАННЯ ГОЛОВНОМУ ІНЖЕНЕРУ`.
3. `НАДІСЛАТИ ПРОЄКТ`.
4. Partner Program.
5. Social-media block at the bottom of the Partner Program.

The Partner Program itself is:

### Strategic partners

Heading:
- UA: `СТРАТЕГІЧНІ ПАРТНЕРИ`
- EN: `STRATEGIC PARTNERS`

Rules:
- heading is centered relative to the logo cards;
- up to 2 strategic partner logos;
- if only 1 strategic partner is active, its card uses the full available width;
- if 2 are active, they render as two equal columns;
- every active logo is fully clickable;
- each partner has its own configurable destination URL;
- destination may be an external HTTPS website or a concrete internal IIG page/content route.

Initial accepted example:
- Investment Industrial Group s.r.o.
- logo asset: `assets/partners/iig-group.png`

### Regular partners

Heading:
- UA: `ПАРТНЕРИ`
- EN: `PARTNERS`

Rules:
- up to 8 regular partners;
- visual grid: 2 columns × 4 rows;
- compact logo cards;
- only active partners are rendered;
- empty/inactive slots are not shown publicly;
- every active logo is fully clickable and has its own configurable URL.

## ADMIN contract

Location:
`ADMIN → КЕРУВАННЯ САЙТОМ → Партнерська програма`

ADMIN_2 must be able to manage each partner slot:

- upload/replace logo;
- partner name;
- destination URL;
- active/visible state;
- clear/remove slot.

Capacity:
- 2 strategic partner slots;
- 8 regular partner slots.

Validation:
- an active slot requires a valid logo and destination URL;
- allowed destinations: external HTTPS or a valid internal IIG route;
- a missing logo or invalid URL must not create a live clickable public card.

Production migration must replace browser-local demo persistence with the production CMS/API/storage layer without changing the accepted public UI contract.

## Social media block

At the bottom of the Partner Program there is a dedicated IIG social-media group.

Accepted initial channels:
- Facebook;
- LinkedIn.

Current demo state:
- icons are visible;
- icons are intentionally NOT clickable;
- text indicates that links will be activated later.

Future production state:
- the same visual positions become clickable when official IIG social URLs are entered;
- links must open the official IIG social pages only;
- external social links use safe external-link attributes.

The social block is not to be removed during migration merely because links are not yet configured.

## Visual lock

The accepted public layout includes:
- centered `СТРАТЕГІЧНІ ПАРТНЕРИ` heading;
- full-width strategic card when only one strategic partner is active;
- 2-column strategic layout when two are active;
- regular partner grid 2×4;
- restrained light background and border consistent with the IIG right rail;
- Facebook/LinkedIn group below partner logos.

The Partner Program must remain visually subordinate to the main editorial content and must not become a large advertising banner.

## Cache/versioning rule

When public JS/CSS for this module changes, the asset version/cache key must be bumped in the page reference.

Accepted example:
`assets/partners.js?v=PARTNERS-V2-SOCIAL`

A code commit that is not visible on the published site because an old cached asset is still loaded is NOT considered a successful release.

## Paid-hosting migration hard lock

Migration must preserve all of the following:

- right-rail placement below `НАДІСЛАТИ ПРОЄКТ`;
- 2 strategic partner slots;
- 8 regular partner slots;
- 1 strategic partner = full width;
- 2 strategic partners = 2 columns;
- regular partners = 2×4;
- ADMIN_2 logo upload;
- ADMIN_2 URL configuration;
- ADMIN_2 visibility control;
- clickable partner logos;
- internal/external destination support;
- Facebook and LinkedIn social positions;
- social placeholders remain visible until official links are configured;
- UA/EN labels;
- cache-busting/versioned public assets.

Loss of this block, loss of ADMIN management, or replacement with hard-coded non-editable partner data is a migration regression.

## Post-migration acceptance test

Required checks:

1. Open production homepage.
2. Confirm Partner Program is directly below `НАДІСЛАТИ ПРОЄКТ`.
3. Confirm centered `СТРАТЕГІЧНІ ПАРТНЕРИ`.
4. Confirm Investment Industrial Group s.r.o. example logo renders correctly.
5. Confirm one strategic logo uses full width.
6. Add a second strategic partner in ADMIN and verify 2-column rendering.
7. Add regular partners and verify 2×4 maximum grid.
8. Confirm inactive slots are not rendered.
9. Confirm each active partner opens its configured destination.
10. Confirm Facebook/LinkedIn positions are present.
11. Confirm social icons remain non-clickable until URLs are configured.
12. Configure official social URLs and confirm safe external navigation.
13. Reload with normal browser cache and confirm the current asset version is served.

Any failure above is a migration defect.

Marker: `IIG_PARTNER_PROGRAM_MIGRATION_LOCK_V1`.

## Mobile rendering hard rule

Strategic partner logos must render fully on Android and iPhone browsers. Logo cards use an explicit height and the logo image must use full-card `width:100%; height:100%; object-fit:contain; object-position:center`. Mobile CSS must not rely only on `max-width/max-height`, because that caused clipping/partial rendering on real phones.

Post-release QA must include at least two mobile-browser checks. A card frame that loads while the logo is clipped or only partially visible is a RELEASE DEFECT.

Marker: `IIG_PARTNER_MOBILE_LOGO_FIX_V1`.
