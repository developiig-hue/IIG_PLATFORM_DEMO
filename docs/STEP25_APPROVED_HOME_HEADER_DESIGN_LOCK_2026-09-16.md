# STEP 25 — Approved IIG HOME / Shared Header Design Lock

Date: 2026-09-16. Status: DESIGN APPROVED; IMPLEMENTATION AND PUBLISHED VISUAL GATE NOT YET VERIFIED.

## Source of truth
User-approved visual reference: `Визуал общего утвержденного макета головной страницы сайта IIG.png` (1536 × 1024 screenshot supplied in chat on 2026-09-16). This screenshot is a layout reference, **not** a production-resolution hero image. Do not upscale/crop the screenshot and use it as the site hero. Use the separately approved original sunrise industrial collage and original approved Chief Engineer portrait, at suitable source resolution, with direct repository-local asset paths. If the original approved files are not available in the repository, STOP and obtain the originals; do not silently substitute existing low-resolution assets or regenerate an unapproved portrait.

## HARD RULE — identical shared header on every principal section
Navigation/header and hero collage must not switch imagery when navigating HOME, Industries, Financing, Chief Engineer Advice, News & Insights, About IIG or Contact. Single canonical shared header styles/assets; no page-specific pipe/motor image overrides and no JS runtime replacement of approved imagery. Keep content below the header specific to the destination page. Preserve mobile responsiveness and language persistence.

## Approved composition
- Dark navy navigation strip (#06223D) with white menu text; selected page and selected UA/EN yellow (#FFC400); inactive language white. Logo left: IIG, vertical divider and only `INDUSTRY INTELLIGENCE GENERATION` (verify exact approved spelling against original logo artwork); remove `Industrial Energy Intelligence Platform` and other tagline under the wordmark. Do not recreate or distort approved logo artwork.
- Wide high-resolution sunrise collage: industrial generating plant, clearly recognizable transmission line pylons and wires, wind turbines, partial solar panels, gentle pink-violet/yellow dawn. Correct wide hero crop and text contrast at 1366, 1440, 1920 and 2560 px. Do not stretch small assets.
- Approved Chief Engineer portrait: same approved face, glasses, posture, workwear, high-visibility vest, white helmet with navy IIG logo and no yellow stripes. Right-hand separate portrait above dark navy Chief Engineer Advice title bar, followed by three advice cards and the View All Advice CTA. Do not replace approved portrait.
- Hero headline/search and organically placed separate navy/yellow `ЗАВАНТАЖИТИ ДАЙДЖЕСТ IIG` card, with direct downloadable PDF link; do not replace with print or an inert button.
- Below hero: financing partners, nine industry cards, TOP-5 weekly news cards, Chief Engineer advice, project/question CTAs and footer, preserving approved content architecture. Weekly news content remains subject to existing moderation/admin-only publication gates; no automatic publishing.

## Typography implementation specification (not measured from generated screenshot)
Font family: Inter, Arial, sans-serif; normal-width, never condensed. Desktop 1440–1920: main menu 18px/700, language 18px/700, hero title 44px/800, hero copy 18px/500, search 17px/400, section headings 24px/800, industry labels 16px/700 with natural wrapping, news titles 16px/700, advice heading 19px/700, CTAs 17px/700, body 17px/400, digest title 18px/700. For >=1920px: menu 19px, hero 48px, section headings 26px. Adapt smaller viewports without horizontal overflow or clipped text; check actual font availability and Ukrainian glyph coverage.

## Required implementation sequence and gate
1. Inspect current HEAD, asset provenance/resolution, all public page header structures, CSS cascade and JS runtime overrides. Identify the exact approved source images, not screenshot-derived substitutes.
2. Implement canonical header and typography with minimum safe delta, remove conflicting rules and image swaps; keep UA/EN, search, navigation, Digest PDF and all approved content functional.
3. Test desktop 1366/1440/1920/2560 and mobile; verify header identical across every primary route; active menu/language, hash routes, advice links and download PDF; verify no image 404, pixelation, clipping, regressions.
4. Commit and wait for GitHub Pages success at the exact HEAD, then inspect the actual published URL against the approved screenshot. Only then mark HEADER GREEN; a commit or successful workflow alone is not visual acceptance.

Principle: APPROVED COMPOSITION -> SIMPLEST DIRECT PATH -> ONE SOURCE OF TRUTH -> VERIFY PUBLISHED RESULT. Minimal Delta -> Maximum Verification.
