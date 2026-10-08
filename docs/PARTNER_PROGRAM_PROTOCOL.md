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


## Binary media integrity hard rule

Partner logos stored as repository image assets must be committed as real binary blobs, not as UTF-8/base64 text through a text-file API.

Required QA before release:
- decode the repository asset as an image;
- verify the PNG/JPG/WebP signature and successful rendering;
- compare expected dimensions/file size where known;
- confirm the public page references the canonical binary asset;
- bump the public asset cache key after replacement.

The IIG strategic-partner logo incident was caused by an invalid/corrupted repository PNG while CSS/JS were otherwise able to render the card. Future fixes must validate the media binary before changing layout layers.

Marker: `IIG_PARTNER_BINARY_MEDIA_INTEGRITY_V1`.


## CLOSED INCIDENT — PARTNER LOGO BINARY ASSET CORRUPTION — 2026-10-08

Status: FIXED / VERIFIED on desktop and mobile.

Root cause:
- the strategic partner PNG had been written incorrectly and the repository asset was not a valid decodable PNG;
- the public partner card itself and its layout were functional;
- multiple CSS/JS rendering workarounds could not solve the issue because the underlying media asset was corrupted.

Permanent hard rules:

1. Partner PNG/JPG/WebP files must be committed as real binary blobs.
2. Never write or replace binary logo files through a UTF-8 text-file write path.
3. Before changing CSS, z-index, background rendering or JavaScript, first validate the image binary itself.
4. Binary validation must include:
   - valid file signature;
   - successful image decode/render;
   - non-zero dimensions;
   - correct repository blob;
   - public URL/asset path resolves to the same valid media.
5. After replacing a logo asset, bump the public cache/version key.
6. Public Partner Program must use one canonical rendering path; do not stack simultaneous background + absolute + inline fallback approaches.
7. Keep partner logo rendering simple:
   - normal foreground `<img>`;
   - `object-fit: contain`;
   - centered inside the partner card;
   - preserve aspect ratio.
8. QA is mandatory on:
   - desktop browser;
   - Android mobile browser;
   - a second independent mobile/browser device.
9. A visible empty partner card is a RELEASE DEFECT even when the surrounding layout renders correctly.
10. The bug is not considered fixed until the logo is visibly confirmed on both desktop and mobile.

Verified fixed implementation:
- canonical asset: `assets/partners/iig-group.png`;
- repaired as a real binary PNG blob;
- public renderer references the canonical asset;
- desktop verification: PASS;
- mobile verification: PASS.

Do not regress to the previous corrupted-asset or multi-layer workaround implementation.

Markers:
- `IIG_PARTNER_BINARY_MEDIA_INTEGRITY_V2`
- `IIG_PARTNER_LOGO_DESKTOP_MOBILE_VERIFIED_20261008`
- `IIG_PARTNER_LOGO_INCIDENT_CLOSED_V1`
