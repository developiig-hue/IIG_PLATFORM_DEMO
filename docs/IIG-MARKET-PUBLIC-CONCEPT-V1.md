# IIG MARKET — PUBLIC SECTION CONCEPT V1
**Status:** CONCEPT LOCK / future public implementation  
**Date:** 2026-10-12  
**Purpose:** preserve the approved idea, placement logic and content model of the future public IIG MARKET section during redesign and paid-hosting migration.

This is a **concept specification**, not a pixel-perfect final design. Visual styling may evolve, but the information architecture, product placement logic, commercial flow and supporting content described below must remain recognizable and functional.

## 1. Core idea
IIG MARKET is a controlled B2B marketplace for new and used industrial energy equipment and related project solutions. It is not a generic classifieds page.

The public section should:
- show curated energy equipment in a professional industrial context;
- make it easy to compare and find relevant equipment;
- protect seller confidentiality;
- route every commercial interaction through IIG;
- combine equipment listings with technical review, project-fit guidance and supporting editorial material;
- connect selected MARKET equipment to the IIG Digest.

## 2. Recommended public-page structure

### A. Main site navigation
IIG MARKET appears as a top-level navigation item in the main IIG website header.

The MARKET page keeps the global IIG navigation and language switcher.

### B. Hero / positioning block
The top block communicates:
- IIG MARKET;
- new and used energy equipment for industrial projects;
- generation / transformation / automation / industrial solutions;
- IIG as the controlled commercial and technical intermediary.

The hero may use industrial energy imagery. The exact visual may change, but the positioning message must remain.

### C. Equipment search / filter bar
A highly visible filter/search strip appears immediately after the hero.

Minimum filter dimensions:
- Category;
- Condition;
- Power / capacity;
- Manufacturer;
- Country / region;
- free search / "find equipment" action.

Filters must work on the actual MARKET inventory, not decorative demo data.

### D. Product grid / listing cards
The main content area presents equipment cards in a clear grid/list.

Each card should expose only approved public data:
- equipment category;
- condition badge (NEW / Б/У / REFURBISHED / NEVER INSTALLED);
- urgent badge «ТЕРМІНОВО» when enabled;
- primary image;
- title;
- manufacturer / model;
- key power or capacity;
- voltage / fuel / year / location or other category-relevant parameters;
- approved public price or "за запитом";
- direct "ДЕТАЛІ / ЗАПИТ" action.

Each card must link to a dedicated listing page/deep-link, never only to a generic MARKET page.

Seller identity/contact, seller asking price and IIG fee remain private.

## 3. Product/category model
Initial and future inventory may include:
- Gas Engine / CHP / KGU;
- Gas Boiler;
- Gas Turbine;
- BESS;
- Transformers;
- SCADA / Control;
- Packaged CHP / complex energy solutions;
- other approved industrial energy equipment.

The public page can show mixed categories, while category pages/filters should allow fast narrowing.

## 4. Supporting trust/value strip
After the main product block, keep a concise IIG value proposition strip similar in purpose to:
- IIG technical review;
- confidential sale;
- project-fit selection;
- request through IIG.

The exact wording/icons may change, but the four principles must remain visible:
1. technical verification / qualification;
2. seller confidentiality;
3. equipment-to-project matching;
4. controlled buyer request through IIG.

## 5. "How it works" block
The public MARKET should explain the commercial process in 4 simple stages:
1. Publication / equipment intake;
2. Technical assessment / document review;
3. Buyer request through IIG;
4. Deal / negotiation support through IIG.

This block is mandatory because the MARKET model is relationship-led, not self-service checkout.

## 6. Bottom commercial CTA block
At the bottom of the MARKET section, keep a strong dual-use CTA:
- seller: place own equipment / submit offer;
- buyer: send request / ask IIG to find a solution.

Existing site routes should be reused where applicable:
- forms.html#project or a dedicated MARKET seller-intake route;
- buyer request route / MARKET inquiry form.

Terms of equipment placement must remain directly accessible from this area.

## 7. Additional content beyond product cards
IIG MARKET may include supporting content that helps buyers evaluate equipment and projects. This can include:
- IIG technical notes / equipment selection guidance;
- short technical comparisons;
- project-fit notes;
- commissioning / dismantling / logistics considerations;
- financing / ECA relevance where applicable;
- case studies;
- partner/OEM materials clearly labelled;
- IIG Original material;
- Digest-related MARKET selections.

Supporting content must not visually obscure the equipment inventory. Equipment discovery remains the primary purpose of the section.

## 8. Listing detail page
Every product card must open a dedicated listing page or anchored deep-link containing:
- listing ID;
- photo gallery;
- public technical parameters;
- condition;
- manufacturer/model;
- country/location region;
- availability;
- IIG technical review / project-fit note when approved;
- public price mode;
- request action;
- seller confidentiality statement.

No private seller fields may be exposed in HTML, public API payloads or metadata.

## 9. Integration with Admin
The public MARKET is populated only from IIG MARKET Admin.

ADMIN_2:
- creates/edits listing;
- uploads media;
- fills technical parameters;
- manages condition/category;
- prepares price;
- selects Digest inclusion;
- marks FEATURE / ТЕРМІНОВО;
- prepares supporting content.

ADMIN_1:
- approves public price;
- approves final commercial state/terms;
- controls public activation.

The public page must not have a separate manual inventory source.

## 10. Digest integration
The public MARKET concept remains connected to the locked Marketplace -> Digest V5 workflow:
- selected equipment can be marked include_digest=true;
- Marketplace material type auto-pulls approved selected records;
- equipment is grouped in Digest by category tag;
- every Digest equipment row links back to the exact public MARKET listing.

## 11. Future layout principle
The supplied concept image is treated as a **visual direction reference**:
- strong industrial hero;
- filter bar directly below hero;
- equipment cards as the primary information layer;
- trust/value strip;
- "how it works" steps;
- bottom seller/buyer CTA.

The final paid-hosting implementation may change typography, spacing, card count per row, imagery and responsive behavior. It must not remove or bury these functional layers.

## 12. Mobile / responsive behavior
On smaller screens:
- filters may collapse into a drawer;
- product cards become 1–2 columns;
- primary CTA remains visible;
- listing parameters remain readable;
- category/condition/urgent badges remain visible;
- no horizontal scrolling for core content.

## 13. Commercial and UX HARD RULES
- No public seller contact.
- No public internal commission.
- No unapproved numeric price.
- No equipment without a unique Listing ID.
- No generic "details" link that loses the exact listing context.
- No direct buyer-to-seller bypass in the public UI.
- No deletion of listing history when an item is excluded from a Digest.
- Search/filter must operate on real public inventory.
- MARKET must stay hidden until owner activation / content readiness.

## 14. Migration requirement
This concept file and the matching machine-readable concept contract are part of the paid-hosting migration scope. The future production MARKET may be redesigned, but the core structure, product model, IIG-mediated commercial flow, Admin source-of-truth and Digest integration must be preserved.
