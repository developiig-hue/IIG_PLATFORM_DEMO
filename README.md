# IIG_PLATFORM_DEMO
Public demo of the IIG Industrial Energy Intelligence Platform

## HARD RULE — IIG visual identity
- MASTER visual reference: `digest/2026-09-review.html` / approved MASTER V11 Digest composition.
- Website surfaces must inherit the Digest visual language: IIG navy/blue system, white content surfaces, restrained red CTA/accent where applicable, Calibri/Carlito typography, compact editorial grids, aligned rows/cards, and industrial-energy photography.
- The project trademark is always `IIG`; it must never be translated or transliterated (`ИИГ`, `ІІГ`, `ИІГ` are forbidden).
- Canonical website logo assets: `assets/iig-logo-navy.svg` on light surfaces and `assets/iig-logo-white.svg` on dark surfaces. Logo wording stays in English as part of the brand identity.
- UA is the default/native interface language. EN appears only after explicit user selection.

## HARD RULE — news imagery
- Every news/case card must support a source-driven image via `data-source-image` / `data-news-image`.
- When the verified primary source provides a relevant article/project image, the card uses that source image and updates with the source record.
- If the source has no usable image, or the source image fails to load, the UI must show the standard industrial-energy fallback image.
- Never invent a project-specific image and present it as if it came from the source.
- `assets/iig.js` enforces the fallback behavior on public surfaces.
