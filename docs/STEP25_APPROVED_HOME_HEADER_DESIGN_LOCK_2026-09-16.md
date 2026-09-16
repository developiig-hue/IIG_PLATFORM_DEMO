# STEP 25 — Approved IIG HOME / Shared Header Design Lock

Date: 2026-09-16. Status: DESIGN APPROVED; IMPLEMENTATION COMMITTED; PUBLISHED VISUAL GATE PENDING.

## Approved source of truth
User-supplied full-page reference screenshot (1536 × 1024) from 2026-09-16 is the composition master, not a hero asset. Use only the two separately approved original PNG images uploaded to repository root; do not substitute thumbnail proxies, crop screenshot as hero, or regenerate engineer portrait.

## Confirmed original image paths
- Hero: `Вариант шапки сайта_промкомплекса на рассвете ( розово-фиалетовый).png`.
- Engineer: `Принятое фото главного инженера в каске IIG.png`.
Both filenames and blob SHA were verified against GitHub in the preceding STEP 25 investigation. `assets/home-hero-approved.webp` and `assets/chief-engineer-approved.webp` are not approved replacements. Original image SHA-256, dimensions and published browser decoding have NOT been independently measured; do not invent these results.

## Immutable design lock
Dark navy (#06223D) shared header, white navigation, yellow (#FFC400) active item and active language, IIG and only INDUSTRY INTELLIGENCE GENERATION branding. Original sunrise industrial collage with power pylons, wind, solar and gentle pink-violet dawn. Original approved Chief Engineer portrait in right rail, navy advice title and three light advice cards, view-all link, two lower CTAs. Hero title/search, four benefit captions. Below hero in this exact order: financing partners NRB, EBRD, EIFO, bpifrance, EIB, World Bank, BII; nine industry cards; TOP-5 news cards; footer. Preserve existing moderation/admin-only news publication gates. Responsive at 1366/1440/1920/2560 and mobile. Persistent UA/EN, navigation and PDF must work.

## Digest — explicit user acceptance criterion
Card in lower-right corner OVER the hero panorama, navy with yellow border/icon and downward arrow. Ukrainian label `ЗАВАНТАЖИТИ ДАЙДЖЕСТ IIG`; English `DOWNLOAD IIG DIGEST`. Entire card is an accessible, actionable anchor to repository-local `digest/IIG-Monthly-Digest-2026-09.pdf` with HTML `download` attribute. It must download the PDF rather than open `digest/2026-09-review.html`, print a page or do nothing. PDF path exists in repository; PDF content and browser download still require end-to-end QA.

## Implementation record — 2026-09-16
- Prior commit `df0492edffd59b02a6a68f0bb5c6aa6f41aafd48`: connect approved original PNG paths and unify navy header styles in `assets/iig.js`.
- Commit `bdf94da265b4434f1209066e6ad1f3b3432c561f`: revise `assets/iig.js` to move existing digest anchor into hero, position it at lower right, assign direct PDF URL and download attribute, reorder industry section before TOP-5 news using existing DOM nodes (no news deletion), make financing partners span the financing row, retain originals and shared header/language logic, refine responsive CSS and advice rail. This is a runtime DOM/CSS adaptation, not a static HTML source reorder.
- This protocol update records actual committed changes, not proof of successful deployment or visual match.

## Release / GREEN gate (mandatory)
1. Verify final repository HEAD includes both commits and this protocol update; inspect JS syntax and browser console.
2. Verify GitHub Pages workflow concludes success for exact HEAD; verify published HTML actually loads new JS and original images (no 404), PDF responds correctly.
3. Compare actual published screenshot with user-approved 1536 × 1024 reference, and check 1366, 1440, 1920, 2560 plus mobile; ensure no clipping, overlap or broken logos.
4. Check UA/EN persistence, active menu, hash routes, advice links, search, download PDF and consistent header across all principal pages.
5. Only after these checks set STEP 25 = GREEN. Commit alone is not GREEN. Record any unresolved issue explicitly.

Principle: APPROVED COMPOSITION → SIMPLEST DIRECT PATH → ONE SOURCE OF TRUTH → VERIFY PUBLISHED RESULT. Minimal Delta → Maximum Verification.
