# IIG MARKET — PRODUCTION / PORTABILITY MASTER PROTOCOL

Date: 2026-10-12  
Status: **OWNER-APPROVED CONCEPT / HARD RULE / PRODUCTION BUILD SOURCE OF TRUTH**  
Primary marker: `IIG_MARKET_PRODUCTION_PORTABILITY_V1`

This document consolidates the approved IIG MARKET concept, Admin workflow, Digest integration, commercial controls and paid-hosting portability requirements.

It MUST be read together with:
- `docs/IIG_MARKET_ADMIN_PROTOCOL.md`
- `ADMIN_MASTER_SPEC.md`
- `DIGEST_PROTOCOL.md`
- `config/iig-market-admin-contract.json`

If an implementation conflicts with this protocol, the implementation is blocked until OWNER decision.

---

## 1. Purpose and positioning

IIG MARKET is a controlled **B2B industrial energy equipment marketplace**, not a consumer web shop and not a mass-market classifieds portal.

The marketplace is intended for specialized new, used, refurbished or never-installed equipment and industrial energy assets whose sale normally requires:
- technical qualification;
- project-specific compatibility review;
- documentation;
- controlled commercial negotiation;
- confidentiality;
- buyer/seller qualification.

IIG acts as:
- marketplace operator;
- technical/commercial presentation layer;
- lead qualification layer;
- controlled buyer/seller introduction point;
- potential success-fee / commission intermediary.

Direct seller contacts are NOT public by default.

---

## 2. Public launch state

Until separate OWNER activation:

`PUBLIC_MARKET_STATUS = HIDDEN_UNTIL_CONTENT_READY`

Hard rules:
- public HOME architecture remains unchanged;
- existing approved top-menu section count remains unchanged;
- MARKET is allowed in Admin before public launch;
- `/market.html` may exist as hidden preview;
- no public navigation item may be enabled until OWNER explicitly activates MARKET;
- public activation is a separate release decision from Admin implementation.

Future public route:

`/market.html`

Future exact listing route:

`/market.html?id={listing_id}#listing-{listing_id}`

After OWNER activation, navigation position is reserved:
`ГАЛУЗІ → IIG MARKET → ФІНАНСУВАННЯ`

When IIG MARKET is open, the active menu item has the approved yellow underline.

---

## 3. Public IIG MARKET visual architecture

The future public MARKET page SHALL preserve IIG corporate identity.

Mandatory visual framework:
1. approved IIG corporate dark-navy header;
2. IIG logo / INDUSTRY INTELLIGENCE GENERATION identity unchanged;
3. active `IIG MARKET` nav item with yellow underline;
4. approved industrial-energy hero visual from the IIG website visual system;
5. IIG MARKET heading / industrial B2B positioning;
6. search/filter panel;
7. equipment grid/cards;
8. clear NEW / Б/У / REFURBISHED / NEVER INSTALLED badges;
9. red `ТЕРМІНОВО` paid-promotion badge where applicable;
10. controlled request CTA instead of seller contact;
11. IIG trust/process blocks;
12. `Як це працює`;
13. bottom public actions:
   - `РОЗМІСТИТИ ВЛАСНЕ ОБЛАДНАННЯ`;
   - `УМОВИ РОЗМІЩЕННЯ ОБЛАДНАННЯ`;
   - `НАДІСЛАТИ ЗАПИТ`;
14. normal visible page scrollbar when content exceeds viewport.

IIG MARKET must not visually resemble a consumer e-commerce store.

---

## 4. Equipment categories

Initial taxonomy is extensible.

### GENERATION
- Gas Engine / CHP
- Gas Turbine
- Steam Turbine
- Diesel / HFO Generation
- Packaged CHP Solutions

### GRID & ELECTRICAL
- Transformers
- Switchgear
- Substations
- MV / HV Equipment
- Protection Systems

### ENERGY STORAGE
- BESS
- UPS
- PCS / Inverters
- Battery Modules

### HEAT & UTILITIES
- Boilers
- Heat Recovery
- Chillers
- Pumps
- Compressors

### CONTROL & SERVICE
- SCADA
- Control Systems
- Automation
- Spare Parts
- Major Components
- Service Equipment

Category count is not fixed. Production DB must support category extension without schema migration for each new equipment type.

---

## 5. Equipment public card

Each public card may include:
- cover photo;
- Listing ID;
- equipment category;
- title UA / EN;
- manufacturer;
- model;
- NEW / Б/У / REFURBISHED / NEVER INSTALLED;
- optional `ТЕРМІНОВО`;
- selected public technical parameters;
- broad country/region;
- availability;
- approved public price or `За запитом`;
- IIG Technical Review status where approved;
- `ДЕТАЛІ / ЗАПИТ` CTA.

Direct seller phone/email/company contact is not displayed.

---

## 6. Exact listing page

Each listing has its own exact URL.

Required sections:
1. image gallery;
2. main commercial summary;
3. technical parameters;
4. scope included;
5. scope excluded;
6. documents subject to visibility;
7. IIG Technical Review;
8. Project Fit;
9. integration checks;
10. public price/price mode;
11. request form;
12. confidentiality note.

Every Digest MARKET card MUST deep-link to this exact listing page.

---

## 7. Admin placement and navigation

Canonical Admin location:

`НОВИНИ → IIG MARKET → ДАЙДЖЕСТ`

Canonical Admin route:

`/admin-ua.html#market`

The module is part of the existing ADMIN MASTER shell. It MUST NOT create a separate independent administration system.

---

## 8. Admin MARKET operational screen

Required top controls:
- `+ ДОДАТИ ОБЛАДНАННЯ`
- status filters;
- search;
- category filter;
- condition filter;
- country/location filter;
- price mode filter;
- public visibility filter;
- `УМОВИ РОЗМІЩЕННЯ ОБЛАДНАННЯ`;
- `ПЕРЕГЛЯД MARKET`.

Required dashboard counters:
- TOTAL LISTINGS
- DRAFT
- REVIEW
- WAITING ADMIN_1
- PUBLISHED
- RESERVED
- SOLD
- ARCHIVED
- NEW BUYER REQUESTS
- PRICE REAPPROVAL REQUIRED
- TERMS DRAFT PENDING
- ACTIVE TERMS VERSION

---

## 9. Equipment editor layout

Desktop editor is two-column.

### Left column
- media;
- public title UA/EN;
- description UA/EN;
- category;
- condition;
- manufacturer/model;
- country/region;
- availability;
- seller PRIVATE data;
- commercial/price data.

### Right column
Dedicated internal vertical scroll.

It contains unlimited/custom technical parameter rows.

Canonical parameter row:
`Group → Name → Value → Unit → Public yes/no → Order`

No fixed maximum parameter count is permitted.

This is required because one CHP package may need dozens of fields while another asset may need only a few.

---

## 10. Media

Per listing:
- cover image;
- gallery;
- reorder;
- replace/delete;
- alt text UA/EN;
- caption;
- source;
- rights/ownership basis;
- optional restricted documents.

Production upload rules:
- MIME validation;
- binary signature validation;
- size limits;
- random object filename;
- malware scan where available;
- image metadata handling;
- no executable upload;
- object/media storage outside public Git.

GitHub/browser localStorage is not production media storage.

---

## 11. Condition / promotional states

Principal condition:
- NEW
- Б/У
- REFURBISHED
- NEVER INSTALLED

Optional operational state:
- Operational
- Stored
- Dismantled
- In operation until date
- Under overhaul
- Inspection required

Paid urgency flag:
`ТЕРМІНОВО`

Hard rules for `ТЕРМІНОВО`:
- Ukrainian label only: `ТЕРМІНОВО`;
- rendered red;
- administered by ADMIN_2;
- may appear in MARKET and Digest;
- is a promotion signal only;
- does not bypass publication, price or final Digest approval.

---

## 12. Pricing

Private fields:
- seller asking price;
- seller minimum acceptable price where available;
- internal IIG commission %;
- fixed success fee;
- expected IIG margin;
- private negotiation notes.

Public modes:
- FIXED PRICE
- PRICE RANGE
- FROM
- ON REQUEST

ADMIN_2:
- enters seller/commercial data;
- prepares proposed public price.

ADMIN_1 only:
- approves final public price;
- approves any published-price change;
- approves final commercial configuration where required.

Hard rule:
`NO PUBLIC PRICE WITHOUT ADMIN_1 APPROVAL`

If an approved public price is edited:

`PRICE_REAPPROVAL_REQUIRED`

The previous approval may not silently carry over.

---

## 13. Roles / RBAC

### ADMIN_2 — operational MARKET manager
Allowed:
- create/edit listing;
- upload/manage media;
- edit UA/EN content;
- manage parameters;
- set category/condition;
- set `ТЕРМІНОВО`;
- manage seller PRIVATE data;
- prepare price;
- manage documents;
- process buyer requests;
- prepare Terms revisions;
- select Digest candidate;
- select FEATURE;
- build a manual MARKET supplemental Digest page;
- preview.

Not allowed:
- activate final public price;
- activate new MARKET Terms;
- silently alter approved public price;
- expose seller contacts outside approved workflow;
- bypass audit.

### ADMIN_1 — final commercial authority
Exclusive:
- approve public price;
- approve price changes;
- activate Terms/Public Offer;
- final commercial publication gate;
- commercial override/rollback;
- exceptional seller identity disclosure;
- final Digest layout approval.

Production RBAC must be enforced by backend/API, not only UI.

---

## 14. Seller confidentiality

PRIVATE by default:
- legal entity;
- contact person;
- email;
- phone;
- exact address;
- internal seller ID;
- mandate/authority;
- NDA state;
- success-fee agreement;
- negotiation data.

Public API must exclude all private seller fields.

Seller contact disclosure must be controlled, authenticated and audited.

---

## 15. Buyer request workflow

Public CTA:

`ДЕТАЛІ / ЗАПИТ`

Required buyer fields:
- company;
- contact name;
- position;
- country;
- email;
- phone;
- project / intended use;
- target delivery;
- message;
- privacy/consent acknowledgement.

Workflow:

`NEW → ADMIN_2 REVIEW → QUALIFIED → SELLER CONTACT AUTHORIZED → NEGOTIATION → WON / LOST / CLOSED`

Request automatically stores:
- Listing ID;
- listing title;
- seller internal reference;
- source URL;
- language;
- timestamp;
- status;
- assignee.

---

## 16. Listing lifecycle

Canonical status chain:

`DRAFT → ADMIN_2_PREPARED → TECHNICAL_REVIEW → READY_FOR_ADMIN_1 → ADMIN_1_APPROVED → PUBLISHED → RESERVED → SOLD → ARCHIVED`

No robot may bypass Admin approval.

Publication must be versioned and auditable.

---

## 17. Terms / Public Offer

Permanent Admin action:

`УМОВИ РОЗМІЩЕННЯ ОБЛАДНАННЯ`

ADMIN_2 may:
- draft;
- edit;
- preview;
- submit.

ADMIN_1 only:
- approves;
- activates;
- assigns effective date;
- rolls back to a previous approved version.

Version lifecycle:

`DRAFT → ADMIN_2_READY → ADMIN_1_APPROVED → ACTIVE → SUPERSEDED`

Every Terms version preserves:
- full UA text;
- full EN text;
- author;
- approver;
- timestamps;
- effective date;
- version number;
- immutable archive.

Public MARKET displays only the current ACTIVE version.

---

## 18. Digest selection controls

The equipment editor exposes the Digest controls only once, at the top of the card:
- `РОЗМІСТИТИ ДАНЕ ОБЛАДНАННЯ У ДАЙДЖЕСТІ`
- `FEATURE`
- `ТЕРМІНОВО`

Lower duplicate controls are forbidden.

The include checkbox means ONLY:

`ADD TO MARKET → DIGEST CANDIDATE POOL`

It does NOT create a Digest page.

---

## 19. Digest — NO AUTO PAGE

The standard approved Digest remains 3 core pages.

Hard rule:

`MARKET CANDIDATE != DIGEST PAGE`

MARKET:
- never creates Page 4 automatically;
- never creates Page 5 automatically;
- never reserves a page number;
- never displaces IIG project material;
- never displaces SPONSORED content;
- never displaces PARTNER content;
- never displaces IIG ORIGINAL.

Additional Page 4+ is created only manually.

Allowed supplemental types:
- IIG MARKET
- IIG PROJECT / SUCCESS PROJECT
- SPONSORED MATERIAL
- PARTNER MATERIAL
- IIG ORIGINAL
- OTHER ADMIN-APPROVED

---

## 20. Manual MARKET Digest composer

Digest Admin contains:

`IIG MARKET · ДОДАТКОВА СТОРІНКА`

The window shows only listings with:

`include_digest=true`

ADMIN_2 may:
- filter by equipment category;
- select candidates;
- choose target Page 4 / Page 5;
- manually build the page.

Conflict lock:
- MARKET cannot overwrite a non-MARKET supplemental page;
- if Page 4/5 is already occupied, Admin chooses another slot or removes the existing page;
- an existing MARKET page may be rebuilt manually.

Final Digest layout remains ADMIN_1-controlled.

---

## 21. MARKET card inside Digest

A MARKET Digest card may include:
- listing photo;
- title;
- Listing ID;
- category;
- condition;
- `ТЕРМІНОВО` red badge;
- selected public parameters;
- approved price or `За запитом`;
- exact listing deep-link.

Hard price rule:
numeric public price is allowed only if:

`price_state = ADMIN_1_APPROVED`

ON REQUEST is allowed without a numeric price.

Hidden/unreleased listings remain in candidate pool but are blocked from final PDF.

---

## 22. CTA footer on EVERY MARKET Digest page

Every page with:

`kind = market`

must end with exactly one standard CTA pair:

1. `РОЗМІСТИТИ ПРОЄКТ` → `forms.html#project`
2. `ПІДПИСАТИСЯ НА ДАЙДЖЕСТ` → `forms.html#subscribe`

Applies to Page 4, Page 5, Page 6 and later.

Must survive:
- Working Preview;
- Final Preview;
- standalone HTML;
- PDF link annotations.

Duplicate inline pairs are forbidden.

---

## 23. Production data model

Production storage must include at minimum:

### Listing
`listing_id`
`status`
`visibility`
`category_id`
`subcategory_id`
`condition`
`operational_state`
`urgent`
`feature_market`
`include_digest`
`feature_digest`
`title_ua`
`title_en`
`summary_ua`
`summary_en`
`description_ua`
`description_en`
`manufacturer`
`model`
`year`
`country`
`public_location`
`availability`
`review_status`
`technical_note_ua`
`technical_note_en`
`price_mode`
`currency`
`public_price`
`public_price_min`
`public_price_max`
`seller_asking_price_private`
`iig_success_fee_private`
`price_state`
`version`
`created_at`
`updated_at`
`published_at`
`reserved_at`
`sold_at`
`archived_at`

### Related records
- technical_parameters
- media
- documents
- scope_included
- scope_excluded
- project_fit
- integration_checks
- seller_private
- buyer_requests
- price_approvals
- listing_versions
- terms_versions
- audit_events

---

## 24. Production API contract

Recommended protected namespace:

`/api/v1/market`

Minimum endpoint domains:

### Public read
- `GET /api/v1/market/listings`
- `GET /api/v1/market/listings/:listing_id`
- `GET /api/v1/market/categories`
- `GET /api/v1/market/terms/active`
- `POST /api/v1/market/listings/:listing_id/inquiries`

### Authenticated Admin
- `POST /api/v1/market/listings`
- `PATCH /api/v1/market/listings/:listing_id`
- `POST /api/v1/market/listings/:listing_id/media`
- `DELETE /api/v1/market/listings/:listing_id/media/:media_id`
- `POST /api/v1/market/listings/:listing_id/submit`
- `POST /api/v1/market/listings/:listing_id/price/prepare`
- `POST /api/v1/market/listings/:listing_id/price/approve`
- `POST /api/v1/market/listings/:listing_id/publish`
- `POST /api/v1/market/listings/:listing_id/archive`
- `GET /api/v1/market/inquiries`
- `PATCH /api/v1/market/inquiries/:id`
- `POST /api/v1/market/terms`
- `POST /api/v1/market/terms/:version/submit`
- `POST /api/v1/market/terms/:version/approve`
- `POST /api/v1/market/terms/:version/activate`

API must return only role-authorized fields.

---

## 25. Authentication / Admin security for paid hosting

Production MARKET inherits ADMIN MASTER authentication:

`/admin/ → Password → MFA → server session → RBAC`

Mandatory:
- server-side authentication;
- MFA for ADMIN_1 and ADMIN_2;
- Secure + HttpOnly + SameSite session cookie;
- session revocation;
- inactivity timeout;
- CSRF protection;
- rate limiting;
- brute-force protection;
- security audit;
- no auth secrets in Git/client JS.

Static GitHub Pages remains demo only.

---

## 26. Production database

MARKET production data MUST NOT depend on:
- browser localStorage;
- sessionStorage;
- public JSON;
- Git commits.

Use transactional production DB. PostgreSQL is the preferred architecture already identified in ADMIN MASTER.

Requirements:
- foreign keys;
- transaction boundaries around approval/publication;
- optimistic/version conflict protection;
- immutable audit history;
- backup;
- restore verification.

---

## 27. Object / media storage

Production photos and documents use:
- S3-compatible object storage OR
- persistent server object volume with backup.

Store in DB only metadata/keys, not large files.

Required:
- private buckets/paths for ADMIN_ONLY / REQUEST_ONLY documents;
- public-safe delivery only for approved public media;
- signed URLs for restricted files where appropriate;
- backup/versioning policy.

---

## 28. Secrets and environment portability

No production secret may be hardcoded.

Environment/secret manager controls:
- DB URL/credentials;
- object storage credentials;
- public base URL;
- API base;
- session keys;
- MFA/identity config;
- SMTP/email integration;
- anti-spam/CAPTCHA where selected;
- analytics;
- error monitoring.

Repository paths and UI logic remain environment-neutral.

---

## 29. Public / private API separation

Public listing response MUST NOT contain:
- seller contact;
- seller legal identity unless explicitly approved;
- exact address;
- internal seller asking price;
- internal commission;
- internal success fee;
- private documents;
- negotiation notes;
- ADMIN approval metadata not intended for public use.

This must be enforced by server-side serializer, not merely hidden in browser UI.

---

## 30. Audit

Append-only audit events are mandatory for:
- listing created;
- content changed;
- technical parameter changed;
- media changed;
- seller private data changed;
- `ТЕРМІНОВО` changed;
- Digest selection changed;
- price prepared;
- price approved/rejected;
- price reapproval required;
- submitted to ADMIN_1;
- published;
- reserved;
- sold;
- archived;
- inquiry received;
- contact disclosure authorized;
- Terms edited/submitted/approved/activated;
- MARKET supplemental Digest page built.

Minimum event:
`actor → role → action → object → timestamp → before → after → result → correlation/session`

---

## 31. Buyer/seller privacy

MARKET is commercial B2B but personal/contact data still requires controlled processing.

Production requirements:
- privacy notice;
- consent/legal-basis record where applicable;
- retention rules;
- role-limited access;
- export/delete procedure where legally required;
- no PII in public Git or public analytics payloads.

---

## 32. Anti-spam / inquiry protection

Public inquiry endpoint must include:
- rate limiting;
- abuse protection;
- server validation;
- email validation;
- duplicate detection;
- optional CAPTCHA/turnstile mechanism;
- audit;
- no direct mail relay from arbitrary browser content.

---

## 33. Search and filtering

Public MARKET search/filter must support:
- category;
- condition;
- manufacturer;
- model;
- capacity/power;
- voltage where applicable;
- country;
- availability;
- NEW/Б/У;
- `ТЕРМІНОВО`;
- text search.

Admin search additionally supports:
- Listing ID;
- seller;
- internal status;
- price state;
- approval state.

Search indexes must rebuild/migrate during paid-hosting cutover.

---

## 34. UA / EN

Public MARKET is bilingual.

Production record must keep separate UA/EN fields where text is editorial.

A missing EN translation may:
- show an explicit fallback only if approved by global site language policy;
- never silently overwrite UA with EN or vice versa.

Terms/Public Offer require versioned UA and EN variants.

---

## 35. Backups

Before production activation:
- automated DB backup;
- media/object backup/versioning;
- Terms/archive backup;
- encrypted off-site copy;
- restore procedure;
- successful restore test.

Production readiness is BLOCKED without tested restore.

---

## 36. Monitoring

Production monitoring should cover:
- API health;
- DB health;
- object storage;
- failed media uploads;
- inquiry failures;
- auth failures;
- approval failures;
- broken public listing URLs;
- broken Digest exact links;
- public 4xx/5xx rate;
- backup status.

---

## 37. Deployment environments

Minimum:
- STAGING
- PRODUCTION

Recommended:
`main → build/test → staging → owner acceptance → production`

Do not test destructive/real commercial actions directly in production.

---

## 38. Paid-hosting migration sequence

### Phase A — infrastructure
1. provision production domain/subdomain;
2. HTTPS + reverse proxy;
3. backend runtime;
4. PostgreSQL;
5. object storage/persistent media;
6. secret manager/env;
7. backup destination.

### Phase B — Admin/backend
1. Password + MFA + server session;
2. ADMIN_1/ADMIN_2 RBAC;
3. MARKET DB schema;
4. MARKET API;
5. media;
6. Terms versioning;
7. inquiries;
8. audit;
9. Digest bridge.

### Phase C — migration
1. deploy public site;
2. deploy Admin;
3. import approved MARKET configuration;
4. migrate any real listings/media only after validation;
5. rebuild search indexes;
6. verify exact listing URLs;
7. verify Digest deep-links;
8. verify CTA routes.

### Phase D — staging acceptance
Run all gates in section 39.

### Phase E — production cutover
Only after OWNER approval:
- switch production domain;
- activate backend;
- keep public MARKET hidden unless separately approved;
- preserve rollback point.

---

## 39. Production acceptance gate

MARKET production is NOT GREEN until all are true:

### Infrastructure
- HTTPS PASS
- DB persistence PASS
- media persistence PASS
- backup PASS
- restore PASS
- secrets PASS

### Authentication / RBAC
- Password PASS
- MFA PASS
- session PASS
- ADMIN_2 permissions PASS
- ADMIN_1 exclusive price approval PASS
- ADMIN_1 exclusive Terms activation PASS

### Listings
- create/edit PASS
- unlimited technical parameters PASS
- right-panel scroll PASS
- NEW/Б/У PASS
- `ТЕРМІНОВО` red PASS
- photos PASS
- documents visibility PASS
- seller private isolation PASS
- public serializer PASS

### Commercial
- prepare price PASS
- ADMIN_1 approval PASS
- price reapproval PASS
- ON REQUEST PASS
- private commission never public PASS

### Terms
- draft PASS
- submit PASS
- ADMIN_1 approve PASS
- activate PASS
- version archive PASS

### Buyer requests
- exact Listing ID PASS
- private storage PASS
- anti-spam PASS
- workflow PASS
- contact disclosure audit PASS

### Digest
- candidate checkbox PASS
- no lower duplicate controls PASS
- FEATURE PASS
- `ТЕРМІНОВО` propagation PASS
- NO AUTO PAGE PASS
- manual Page 4+ composer PASS
- conflict lock PASS
- exact listing deep-link PASS
- approved-price rule PASS
- every MARKET page CTA pair PASS
- PDF active links PASS

### Public visibility
- MARKET remains hidden before OWNER activation PASS
- no accidental HOME/menu exposure PASS

Any FAIL = production release blocked.

---

## 40. Rollback

Paid-hosting release must have rollback for:
- application version;
- DB migration;
- public routing;
- media/object configuration;
- Terms active version.

Rollback must NOT:
- resurrect deleted/private seller contacts publicly;
- restore stale approved price as current without version checks;
- publish a hidden listing;
- change active Terms silently.

---

## 41. Data migration rules from demo

Demo localStorage records are NOT production truth.

Before importing any demo listing:
1. validate Listing ID;
2. validate seller authority;
3. validate media rights;
4. validate technical fields;
5. validate price;
6. force price status to require ADMIN_1 approval unless approval was generated inside production audit system;
7. set public visibility HIDDEN;
8. re-review Terms acceptance;
9. write import audit event.

No browser-only approval is trusted as production approval.

---

## 42. CI / HARD LOCK

Production code must retain automated gates for:
- Admin nav order NEWS → IIG MARKET → DIGEST;
- single-location Digest controls;
- red Ukrainian `ТЕРМІНОВО`;
- unlimited technical parameter UI;
- seller privacy;
- ADMIN_1 price approval;
- Terms approval;
- NO AUTO DIGEST PAGE;
- manual composer conflict lock;
- exact MARKET deep-link;
- MARKET page CTA pair;
- no public secrets/PII.

Any regression blocks deployment.

---

## 43. Portability principle

The MARKET codebase must be portable across hosting providers.

Forbidden assumptions:
- GitHub Pages is the production backend;
- hardcoded GitHub domain;
- browser localStorage as production DB;
- filesystem-only non-persistent uploads;
- client-side RBAC;
- client-side approval authority.

Required abstraction:
- public base URL from configuration;
- API base from configuration;
- storage adapter;
- DB adapter;
- identity/session backend;
- environment secrets.

---

## 44. Owner activation gate

Even when production infrastructure is fully GREEN:

`MARKET_READY != MARKET_PUBLIC`

Public activation requires separate OWNER decision confirming:
- enough quality listings;
- approved active Terms;
- commercial model ready;
- seller agreements ready;
- buyer inquiry workflow ready;
- visual acceptance;
- legal/privacy review completed where required.

Only then:
`PUBLIC_MARKET_STATUS = ACTIVE`.

---

## 45. Controlling markers

Implementation must preserve/reference:
- `IIG_MARKET_ADMIN_PROTOCOL_V1`
- `IIG_MARKET_DIGEST_BRIDGE_V1`
- `IIG_MARKET_DIGEST_NO_AUTO_PAGE_V1`
- `IIG_MARKET_URGENT_AND_DIGEST_COMPOSER_V1`
- `IIG_MARKET_DIGEST_MANDATORY_CTA_PAIR_V1`
- `DIGEST_SUPPLEMENTAL_PAGES_MANUAL_ONLY_V1`
- `DIGEST_MARKET_MANUAL_COMPOSER_V1`
- `DIGEST_MARKET_EVERY_PAGE_CTA_V1`
- `IIG_MARKET_PRODUCTION_PORTABILITY_V1`

These markers define the accepted architecture across demo, staging and production.
