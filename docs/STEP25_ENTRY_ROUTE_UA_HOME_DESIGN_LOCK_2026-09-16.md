# STEP 25 — ENTRY ROUTE / LANGUAGE DESIGN LOCK

Decision date: 2026-09-16. User-approved mandatory acceptance criterion.

**Every first entry to the IIG Platform website MUST open the `Головна` (Home) section in Ukrainian (UA), and only UA as the initial language.** The canonical initial route is the site's root `/IIG_PLATFORM_DEMO/` (equivalent to `index.html`); the initial active navigation item is `ГОЛОВНА`; the document language is `uk`; the UA switch is active. Do not open financing, news, industry, or another section by default, and do not initialize first-entry language from browser language or a previously persisted EN preference.

Once the visitor explicitly selects EN, the language switch must work consistently on every page and remain consistent while navigating during that visit. A subsequent genuinely new visit must again start at the Ukrainian home page, subject to defining a reliable visit/session boundary; do not indiscriminately redirect every internal navigation or reload to Home, which would break normal use. Distinguish first site entry from navigation between sections and from an explicitly opened deep link; deep-link handling should not destroy user-requested navigation without a separately approved rule.

Implementation gate: inspect `index.html`, all internal page scripts and `assets/iig.js` (currently reads `localStorage.iig_lang_current`); implement first-entry UA/Home logic in a single shared entry point with explicit visit/session semantics. Add regression tests for first visit with empty storage, first visit with old EN stored, UA→EN switch, EN navigation, reload, new visit, active menu and direct internal link. Preserve the accepted white IIG logo, common sunrise panorama, compact PDF download and other STEP25 design locks.

**Status at recording: REQUIREMENT LOCKED / CODE NOT YET VERIFIED OR CHANGED BY THIS DOCUMENT.** Do not report implementation or deployment GREEN solely because this protocol exists. Verify exact commit, CI/deployment and live behavior before marking done.
