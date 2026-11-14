# IIG Digest — REV28 Browser PDF Export / Publication Protocol

**Date:** 2026-11-14  
**Scope:** IIG ADMIN_1 → immutable HTML artifact → ADMIN_2 Chrome PDF → publication on IIG site  
**Status:** PDF export confirmed working; PDF publication not yet accepted / currently blocked by browser-local approval receipt.

## Confirmed results (not guesses)
- Issue: **2026-09**, approved revision **REV28**.
- Approved server HTML: `/var/www/iigeur/iig-data/digest/revisions/2026-09/r0028-3dcb63560308/digest.html`.
- The server-side verification script reported SHA-256: `099f4615c860d2c9ae185d1c67c566b24f283b5c267753a00823c7dfa1922866`.
- Client action `PDF · ЗБЕРЕГТИ` opens the already-approved server HTML in Chrome and invokes Chrome's native **Save as PDF** print dialog.
- Headless Chromium / Playwright / Linux sudo access are **not required** for this workflow; PDF rendering happens on ADMIN_2's workstation.
- A print-copy-only optimization patch `IIG_PDF_PRINT_COMPACT_V1` was installed and passed `node --check` (2026-11-14). **The achieved PDF size reduction and final layout have not yet been independently measured or accepted.**
- `/api/v1/digest/releases` is an existing ADMIN_2 route which accepts a completed PDF and metadata.
- Publication UI currently shows a blocking dialog: no valid ADMIN_1 approval receipt in the **current browser**. This does **not** prove absence of a server approval record.

## Hard rules
1. **No new HTML assembly, candidate, Final Preview, or repeat ADMIN_1 approval** just to export or upload an already approved revision.
2. The exact source for PDF is the immutable approved HTML with a server-side SHA-256 match. A previous demo file or newly constructed HTML cannot substitute.
3. Native Chrome printing may open a user-initiated print dialog and requires an explicit Save step; the browser controls the destination path.
4. Formatting/quality changes apply **only to a transient print copy**. They must not overwrite the approved HTML, fingerprint, revision, or server-side approval.
5. **Publication authorization is server authoritative**. The server must confirm existing ADMIN_1 approval for issue + language + revision/fingerprint (as applicable) and validate uploaded PDF and metadata. Missing `localStorage` or `sessionStorage` approval receipt in an incognito/new browser session must not by itself prevent a legitimate approved upload.
6. Do **not** simply remove approval checks or trust the visible badge `ЗАТВЕРДЖЕНО`. Preserve role checks, release validation, audit history, and protection against a mismatched version or release.
7. Uploading a newly generated PDF from the user's Windows PC necessarily involves **one PDF file selection** in the browser (unless implementing a separate browser File System Access workflow). This is NOT the obsolete HTML selection during PDF export.
8. Publish to IIG public storage only after confirmed POST success and verification that new CURRENT PDF is actually accessible; no premature success message or overwrite based only on a successful request.
9. Because print-copy layout changes may diverge from the ADMIN_1-reviewed HTML, visually verify the exported PDF before public publishing and route material editorial changes through approval.
10. Never assert the PDF is smaller or that every external link works until actual PDF tests confirm it.

## Required UI workflow
ADMIN_1 approves immutable HTML → ADMIN_2 clicks `PDF · ЗБЕРЕГТИ` → Chrome loads approved HTML from server and shows native Save as PDF → ADMIN_2 selects resulting **PDF** in `Раніше згенерований / готовий PDF` → clicks `ЗАЛИТИ ДАЙДЖЕСТ НА САЙТ IIG` → server checks stored approval, PDF, fingerprint/revision and stores release → verify public CURRENT PDF URL.

## Open issue / next implementation
Replace the frontend's **browser-local approval receipt** hard gate for `publishApprovedDigestToSite` with a server-side approval authority check. Confirm how the backend currently retrieves/stores approvals and exactly what the `/api/v1/digest/releases` handler validates before changing any guard. Do not bypass server approval. Confirm API response and public CURRENT release before closing this task.

## Observability and rollback
Keep timestamped backups of frontend JS and backend server module. Run `node --check` on changed JS/MJS. Changes to UI-only print handling do not require PM2 reload; backend changes do. Do not modify existing approved REV28 HTML.