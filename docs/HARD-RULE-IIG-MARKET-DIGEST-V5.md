# IIG HARD RULE — Marketplace → Digest V5
Status: LOCKED / migration-critical
Date: 2026-10-12
Scope: GitHub Pages demo now; preserve 1:1 during paid-hosting migration.

## 1. Material type
Digest Builder for Page 4/5+ must contain material type Marketplace. Selecting Marketplace switches the builder to MARKET auto-pull mode. DOCX/TXT is not required. ADMIN_2 may optionally add a title, lead/subtitle and editorial body; these fields are presentation wrapping only and must never replace the linked equipment records.

## 2. Automatic source
Source of truth: IIG MARKET records explicitly marked «Розмістити дане обладнання у Дайджесті» (include_digest=true). Auto-pull may include only records that pass release gates: public/approved listing state, allowed visibility, and ADMIN_1-approved public price when the price is not ON REQUEST. Auto-pull starts when ADMIN_2 explicitly runs page formation; it must not silently overwrite another content type.

## 3. Page allocation
Marketplace is intended for Page 4–5 and may continue on Page 6+ if the selected equipment does not fit. Demo limit: 12 equipment rows per MARKET page. Existing non-Marketplace Page 4+ content is conflict-locked and cannot be overwritten automatically.

## 4. Mandatory category navigation
Before each new equipment class, render a left-side category tag. Canonical categories:
- KGU — gas engine / cogeneration / CHP; each row shows manufacturer/model + power where available.
- ГАЗОВА КОТЕЛЬНЯ (GAS BOILER).
- ГАЗОВА ТУРБІНА (TURBIN).
- BESS.
- Other approved equipment classes follow the same pattern.

A MARKET page must never be one unstructured equipment list.

## 5. One equipment item = one linked row
Each equipment item is one line, similar to Digest news rows. The line contains a short equipment name, key power/capacity where applicable, optional condition/price status, and a direct deep-link to the exact IIG MARKET listing: market.html?id=<LISTING_ID>#listing-<LISTING_ID>.

## 6. ADMIN_2 manual authority after auto-pull
Auto-pull is only the initial assembly. In the admin builder every MARKET equipment row must have:
- ↑ move up;
- ↓ move down;
- ⇄ move to another Marketplace page/block;
- × exclude from this Digest issue only.

× must never delete or modify the original IIG MARKET listing. Manual order and exclusions are part of the issue layout state and must survive preview/PDF rendering and reopening of the issue. A repeated auto-pull that can replace manual order requires explicit ADMIN confirmation.

## 7. Approval reset
Any change to MARKET equipment selection, order, category, linked record, URL, power/capacity, price display, urgency, or editorial wrapper invalidates the previous final-preview/approval fingerprint and requires a new Preview → Approval before PDF/export/publication.

## 8. Urgent marker
If the IIG MARKET record is marked urgent, Digest must render «ТЕРМІНОВО» in red on that equipment row.

## 9. Required CTA on every Page 4+
Every Page 4/5+ must keep two default CTA buttons:
- forms.html#project
- forms.html#subscribe

This applies regardless of number of MARKET pages.

## 10. Migration lock
Paid-hosting migration must preserve:
- Marketplace material type in UI;
- include_digest source flag and release-gate mapping;
- automatic pull algorithm;
- category classifier and tag labels;
- equipment short-name + power/capacity formatter;
- direct per-listing deep-links;
- ↑ / ↓ / ⇄ / × controls;
- issue-scoped persisted manual order/exclusions;
- urgent tag;
- CTA invariant;
- preview/approval invalidation;
- DB/API/UI/PDF behavior.

Production implementation must move browser/localStorage demo state to server-side persistence without changing this editorial behavior.
