# IIG MARKET — ADMIN MASTER MANAGEMENT PROTOCOL

Date: 2026-10-12  
Status: **OWNER CONCEPT APPROVED / HARD RULE / BUILD SOURCE OF TRUTH**  
Marker: `IIG_MARKET_ADMIN_PROTOCOL_V1`

This protocol defines the future ADMIN MASTER management model for the IIG MARKET section of the IIG platform.

IIG MARKET is NOT a mass-market web shop. It is a controlled B2B marketplace for specialized industrial energy equipment and project assets: new, used, refurbished or never-installed generating, electrical, storage, automation and servicing equipment.

IIG provides the marketplace, technical/commercial presentation and controlled buyer-seller introduction. Direct seller contact data is NOT public. IIG may receive an agreed success fee / commission from a completed sale.

---

## 1. ADMIN MASTER placement

The future ADMIN MASTER left navigation order SHALL include:

`НОВИНИ → IIG MARKET → ДАЙДЖЕСТ`

Canonical future admin route:

`/admin-ua.html#market`

Public future route:

`/market.html`

Until explicit OWNER activation:

`PUBLIC_MARKET_STATUS = HIDDEN_UNTIL_CONTENT_READY`

Hard rule:
- IIG MARKET may exist in Admin and repository before public launch.
- It MUST NOT appear on HOME or public top navigation until OWNER separately approves publication.
- Existing approved HOME architecture and current public section count remain unchanged until that approval.

---

## 2. ADMIN MARKET screen — primary UX

The IIG MARKET admin section SHALL be a single operational workspace optimized for fast equipment management.

### 2.1 Top control bar

Required controls:

1. `+ ДОДАТИ ОБЛАДНАННЯ`
2. `ЧЕРНЕТКИ`
3. `НА ПЕРЕВІРЦІ`
4. `ГОТОВО ДО ПУБЛІКАЦІЇ`
5. `ОПУБЛІКОВАНО`
6. `ЗАРЕЗЕРВОВАНО`
7. `ПРОДАНО`
8. `АРХІВ`
9. search by Listing ID / manufacturer / model / seller / equipment type
10. filters: category, condition, country, price mode, status, visibility
11. button `УМОВИ РОЗМІЩЕННЯ ОБЛАДНАННЯ`
12. button `ПЕРЕГЛЯД MARKET` — preview only until public activation.

### 2.2 Main equipment list

The screen SHALL show equipment records as compact rows/cards.

Each row must show at minimum:
- Listing ID;
- primary photo thumbnail;
- equipment category;
- manufacturer;
- model;
- condition tag: `NEW`, `Б/У`, `REFURBISHED`, `NEVER INSTALLED`;
- primary capacity value;
- country / broad location;
- public price mode;
- publication status;
- last edited by / timestamp;
- ADMIN_1 price approval state;
- open/edit button.

The list must support many records without changing the page architecture.

---

## 3. Equipment editor — two-column management layout

When ADMIN opens an equipment item, the editor SHALL use a two-column desktop layout.

### LEFT COLUMN — media and commercial summary

Required blocks:

#### A. Media
- cover image;
- image gallery: target 1–10 images initially, extensible;
- drag/drop upload;
- reorder images;
- choose cover image;
- delete/replace image;
- alt text UA/EN;
- image source / ownership basis;
- optional caption;
- future: video/document preview.

Uploads MUST follow Media Library security rules:
- validate MIME and binary signature;
- maximum size limits;
- random server filename;
- malware scan where available;
- never execute uploaded content.

#### B. Public commercial summary
- public title UA;
- public title EN;
- short description UA;
- short description EN;
- condition;
- location shown publicly;
- availability;
- price mode;
- public price display;
- primary CTA preview.

### RIGHT COLUMN — technical parameters

This column MUST have its own vertical scroll independent of the page.

Reason:
a gas engine generator set may require dozens of technical fields, while another asset such as one gas turbine may need far fewer fields.

Required behavior:
- fixed editor height within viewport;
- internal vertical scrollbar;
- add unlimited/custom parameter rows;
- reorder parameters;
- hide/show individual parameters publicly;
- UA/EN labels;
- parameter groups;
- no artificial fixed maximum number of technical characteristics.

Canonical structure:
`Parameter Group → Parameter Name → Value → Unit → Public yes/no → Order`

Examples:
- Manufacturer
- Model
- Electrical output
- Thermal output
- Voltage
- Frequency
- Fuel
- Gas pressure
- Efficiency
- Year
- Operating hours
- Starts
- Emissions class
- Generator manufacturer
- Generator type
- Heat recovery
- Transformer
- Control system
- Grid synchronization
- Auxiliary systems
- Service history
- Overhaul history
- Documentation
- Spare parts
- Dismantling
- Packaging
- Delivery condition
- Commissioning option

No category is forced to show irrelevant fields.

---

## 4. Equipment categories

Initial category framework:

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

ADMIN_2 may manage categories and parameter templates, subject to audit.

---

## 5. Equipment condition badges

Every item MUST have exactly one principal condition status:

- `NEW`
- `Б/У`
- `REFURBISHED`
- `NEVER INSTALLED`

Optional additional operational state:
- Operational
- Stored
- Dismantled
- In operation until date
- Under overhaul
- Inspection required

Public badges must be visually compact and unambiguous.

ADMIN_2 may set/edit condition.
Condition history is audit logged.

---

## 6. Pricing model — HARD RBAC

Pricing has separate INTERNAL and PUBLIC fields.

### Internal commercial fields
Private; never published:
- Seller asking price;
- Seller currency;
- Minimum acceptable price if disclosed;
- Internal IIG commission %;
- Internal IIG fixed success fee;
- IIG expected margin;
- seller commercial notes;
- buyer negotiation notes.

### Public price modes
- `FIXED PRICE`
- `PRICE RANGE`
- `FROM`
- `ON REQUEST`

Public fields:
- currency;
- amount / min / max where applicable;
- VAT note if applicable;
- delivery basis note;
- optional public commercial comment.

### RBAC

ADMIN_2:
- may enter seller asking price;
- may prepare proposed public price;
- may change price mode while item is DRAFT/REVIEW;
- may edit all technical and descriptive data.

ADMIN_1 ONLY:
- approves the final PUBLIC price;
- approves any change of already-published public price;
- approves final commission/success-fee commercial configuration where stored in system;
- publishes price to public MARKET.

Hard rule:
`NO PUBLIC PRICE WITHOUT ADMIN_1 APPROVAL`

Machine state:
- `price_admin2_prepared_at`
- `price_admin2_prepared_by`
- `price_admin1_approved_at`
- `price_admin1_approved_by`
- `price_version`

Any post-approval price edit resets price status to:
`PRICE_REAPPROVAL_REQUIRED`.

---

## 7. Seller identity and confidentiality

Seller identity is PRIVATE by default.

Private ADMIN fields:
- legal company name;
- contact person;
- position;
- email;
- phone;
- exact address;
- seller reference / CRM ID;
- ownership evidence;
- mandate / authority to sell;
- NDA status;
- brokerage/success-fee agreement status.

Public MARKET MUST NOT expose:
- seller name unless ADMIN_1 explicitly approves disclosure;
- direct phone;
- direct email;
- exact asset address;
- confidential commercial terms;
- internal IIG commission;
- internal negotiation notes.

Public buyer CTA:
`ДЕТАЛІ / ЗАПИТ`

Contact exchange occurs only after an official request processed through IIG.

---

## 8. Buyer request flow

Every published equipment page must support:
`ДЕТАЛІ / ЗАПИТ`

Buyer request fields:
- company;
- contact name;
- position;
- country;
- email;
- phone;
- project / intended use;
- target delivery date;
- message;
- consent/privacy acknowledgement.

Request links automatically to:
- Listing ID;
- item title;
- seller internal ID;
- request timestamp;
- UA/EN;
- source URL.

Request state:
`NEW → ADMIN_2 REVIEW → QUALIFIED → SELLER CONTACT AUTHORIZED → NEGOTIATION → WON / LOST / CLOSED`

Direct seller contact release must be recorded in audit log.

---

## 9. Publication workflow

Canonical lifecycle:

`DRAFT → ADMIN_2 PREPARED → TECHNICAL REVIEW → READY_FOR_ADMIN_1 → ADMIN_1 APPROVED → PUBLISHED → RESERVED → SOLD → ARCHIVED`

ADMIN_2 responsibilities:
- create listing;
- upload/manage photos;
- fill UA/EN descriptions;
- fill all technical characteristics;
- set category;
- condition;
- broad location;
- availability;
- documents;
- prepare proposed price;
- prepare IIG technical note;
- preview public card/page;
- submit to ADMIN_1.

ADMIN_1 responsibilities:
- approve/reject final public price;
- approve/reject placement/sale rules;
- final publication approval when commercial price is visible;
- approve material changes to public sale terms;
- approve seller identity disclosure if ever required.

No robot may bypass these approvals.

---

## 10. Equipment documents

Per listing, Admin may attach:
- datasheet;
- inspection report;
- service report;
- operating history;
- manuals;
- single-line diagram;
- performance curves;
- emissions documents;
- scope-of-supply document;
- equipment list;
- photos;
- optional NDA-restricted files.

Document visibility:
- PUBLIC;
- REQUEST_ONLY;
- ADMIN_ONLY.

REQUEST_ONLY files require qualified buyer request and Admin action.

---

## 11. IIG Technical Review / Project Fit

Optional but strategically important fields:

### IIG Technical Review status
- NOT REVIEWED
- DOCUMENTS RECEIVED
- IIG REVIEWED
- TECHNICALLY QUALIFIED

### Public IIG technical note
Short professional assessment.

### Project Fit
Admin-editable tags:
- Reserve CHP
- Industrial onsite generation
- Data Center backup
- District heating
- Grid support
- Peak shaving
- Replacement unit
- Emergency generation
- Renewable integration
- BESS/grid stability

### Integration checks
Custom list such as:
- grid voltage;
- frequency;
- gas pressure;
- heat demand;
- emissions;
- foundation;
- cooling;
- transformer compatibility;
- controls;
- remaining lifetime.

---

## 12. Placement Terms management

ADMIN MARKET MUST contain a permanent control:

`УМОВИ РОЗМІЩЕННЯ ОБЛАДНАННЯ`

This is the Admin management counterpart of the public MARKET button shown in the approved concept.

The screen must allow ADMIN to maintain:

1. Marketplace equipment placement conditions;
2. Seller eligibility requirements;
3. Step-by-step listing instruction;
4. Required technical documents;
5. Photo requirements;
6. Accuracy / seller responsibility clauses;
7. IIG moderation rights;
8. Confidentiality rules;
9. Buyer inquiry process;
10. Seller-contact disclosure procedure;
11. IIG success fee / commercial principle description where legally appropriate;
12. Equipment reservation rules;
13. Sale / withdrawal / archive procedure;
14. Liability limitations;
15. Public offer / platform terms text;
16. Privacy/data-processing references;
17. effective date;
18. version number;
19. UA version;
20. EN version.

### Terms RBAC

ADMIN_2:
- can draft/edit new version;
- can upload supporting legal text;
- can preview;
- can submit for approval;
- CANNOT activate a new public version.

ADMIN_1 ONLY:
- approves final wording;
- publishes/activates new Terms version;
- selects effective date;
- may rollback to previous approved version.

Hard rule:
`NO MARKET TERMS PUBLICATION WITHOUT ADMIN_1 APPROVAL`

Version states:
`DRAFT → ADMIN_2_READY → ADMIN_1_APPROVED → ACTIVE → SUPERSEDED`

Every version must preserve:
- full text;
- author;
- approver;
- timestamps;
- version;
- effective date;
- immutable archive.

---

## 13. Public Terms UX

Public MARKET button:

`УМОВИ РОЗМІЩЕННЯ ОБЛАДНАННЯ →`

Click opens a dedicated page or modal with:

### A. Short summary
Who can place equipment and basic commercial principle.

### B. Step-by-step instruction
1. Submit equipment;
2. Provide documentation/photos;
3. IIG review;
4. Price/commercial approval;
5. Publication;
6. Buyer inquiry through IIG;
7. Negotiation/transaction process.

### C. Full placement terms / public offer
Current ADMIN_1-approved version.

### D. Version information
- version;
- effective date;
- language;
- link/download printable copy if enabled.

Public page must never display an unapproved draft.

---

## 14. MARKET dashboard counters

Admin MARKET top dashboard should show:

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
- TERMS ACTIVE VERSION

Optional commercial counters for ADMIN_1 only:
- total seller asking value;
- public asking value;
- potential IIG commission;
- active negotiations;
- WON value.

---

## 15. Bulk management / large inventory

Because some categories may have dozens of units:

Admin list must support:
- pagination or virtual scrolling;
- search;
- sort;
- multi-filter;
- duplicate listing;
- clone technical parameter template;
- bulk archive;
- bulk visibility change;
- batch category change;
- CSV/XLSX export for internal management;
- import template MAY be added later but must validate fields before committing.

A category with only one or two assets must use the same system without empty placeholders.

---

## 16. Per-listing audit log

Every listing must keep an immutable activity timeline:

- created;
- field edited;
- photo uploaded/deleted/reordered;
- technical parameter changed;
- condition changed;
- seller data changed;
- price proposed;
- ADMIN_1 price approved/rejected;
- publication approved;
- published;
- reserved;
- buyer request received;
- seller contact authorized;
- price changed;
- sold;
- archived.

Log fields:
`actor → role → action → timestamp → before → after → object/version`

---

## 17. Required equipment record schema

Minimum conceptual record:

```
listing_id
status
visibility
category
subcategory
condition
operational_state

title_ua
title_en
summary_ua
summary_en
description_ua
description_en

manufacturer
model
year
country
public_location
availability

technical_parameters[]
scope_included[]
scope_excluded[]
project_fit[]
integration_checks[]

media[]
documents[]

price_mode
currency
public_price
public_price_min
public_price_max
seller_asking_price_private
iig_success_fee_private

seller_private{}
buyer_requests[]

iig_review_status
iig_technical_note_ua
iig_technical_note_en

price_admin2_prepared_at
price_admin1_approved_at
publication_admin1_approved_at

created_at
updated_at
published_at
reserved_at
sold_at
archived_at
version
audit[]
```

---

## 18. Website ↔ Digest integration

Future MARKET must be usable as a source for both:
- public IIG MARKET pages;
- commercial MARKET block/pages in IIG Digest.

A listing MAY be marked:
- `SHOW_ON_MARKET`
- `FEATURE_ON_MARKET`
- `INCLUDE_IN_DIGEST`
- `FEATURE_IN_DIGEST`

Digest inclusion does NOT bypass public/price approvals.

If a Digest displays a price, that price must be the currently ADMIN_1-approved public price version.

---

## 19. Public MARKET architecture — current concept lock

The accepted conceptual visual architecture consists of:

1. approved IIG corporate navy header;
2. future navigation item `IIG MARKET` after `ГАЛУЗІ`;
3. when MARKET is open, yellow underline under `IIG MARKET`;
4. approved IIG sunrise industrial hero image;
5. IIG MARKET title and B2B positioning;
6. category/condition/power/manufacturer/country filters;
7. equipment card grid;
8. condition badges;
9. technical review / confidentiality / project fit / request-through-IIG trust strip;
10. `Як це працює` process;
11. bottom CTAs:
   - `РОЗМІСТИТИ ВЛАСНЕ ОБЛАДНАННЯ`
   - `УМОВИ РОЗМІЩЕННЯ ОБЛАДНАННЯ`
   - `НАДІСЛАТИ ЗАПИТ`
12. visible normal page scrollbar for large inventory.

This is a concept architecture only. Public activation requires separate OWNER approval.

---

## 20. RBAC summary

### ADMIN_2 — operational manager
CAN:
- create/edit equipment;
- upload/manage media;
- edit UA/EN content;
- manage technical parameters;
- assign NEW/Б/У/etc.;
- enter seller information;
- prepare pricing;
- manage categories;
- manage documents;
- process buyer requests;
- prepare placement Terms revisions;
- preview MARKET;
- submit listing / price / Terms to ADMIN_1.

CANNOT:
- publish/activate final public price without ADMIN_1;
- activate new Marketplace Terms/Public Offer;
- silently change an ADMIN_1-approved public price;
- bypass audit;
- expose seller contact without workflow authorization.

### ADMIN_1 — commercial approval authority
Exclusive:
- final public price approval;
- approval of price changes after publication;
- final activation of placement/sale Terms;
- approval/activation of public-offer version;
- commercial override/rollback;
- approval of seller identity disclosure where exceptional;
- final commercial publication gate when required.

---

## 21. Security / privacy

- Seller and buyer personal/contact data MUST live in private production storage, not Git/public JSON.
- RBAC enforced in backend/API, not only UI.
- MFA required for ADMIN_1 and ADMIN_2 in production.
- Uploaded documents/files validated and private where applicable.
- Internal commission data must never reach public API responses.
- Audit log is append-only.
- Public equipment API returns only approved public fields.
- Buyer requests are private business leads.
- Rate limiting / anti-spam required on public inquiry forms.
- Terms acceptance evidence must be retained where legally required.

---

## 22. Paid-hosting portability

Production implementation must use:
- transactional private DB;
- persistent media/object storage;
- protected backend API;
- audit log;
- versioned Terms;
- versioned listings;
- ADMIN session/RBAC;
- backups.

No MARKET production data may depend solely on browser localStorage.

---

## 23. Release blockers

MARKET release is BLOCKED if:
- seller direct contacts appear publicly without approval;
- internal commission appears publicly;
- public price has no ADMIN_1 approval;
- changed price does not trigger reapproval;
- active Terms have no ADMIN_1 approval/version;
- photos/documents are broken;
- condition is missing;
- public card does not link to its exact equipment page;
- buyer request is not linked to Listing ID;
- right technical editor cannot handle arbitrary parameter counts;
- ADMIN_2 can activate price or Terms without ADMIN_1;
- audit trail is missing;
- current Terms cannot be edited/versioned from Admin;
- public MARKET is activated before OWNER approval.

---

## 24. Build sequence

When implementation begins, build in this order:

1. ADMIN MARKET data model + list + equipment editor + media + technical scroll.
2. Pricing RBAC + seller privacy + buyer requests + placement Terms versioning.
3. Hidden public `market.html` preview bound to approved records.
4. OWNER visual/functional acceptance.
5. Only then activate public navigation / HOME exposure if separately approved.

---

## 25. Source of truth

This protocol is the controlling build specification for the IIG MARKET Admin module.

Files/modules created later MUST reference:
`IIG_MARKET_ADMIN_PROTOCOL_V1`

Any conflicting implementation is a release blocker until OWNER decision.


## 26. MARKET → DIGEST bridge — HARD RULE

Marker: `IIG_MARKET_DIGEST_BRIDGE_V1`

Every equipment editor MUST expose the checkbox:

`РОЗМІСТИТИ ДАНЕ ОБЛАДНАННЯ У ДАЙДЖЕСТІ`

ADMIN_2 may select/deselect it. The selected record enters the dedicated `MARKET → DIGEST` queue.

The queue is reserved for future commercial Digest pages 4/5 and does NOT alter the currently approved three-page Digest MASTER until a separate OWNER layout approval.

Each selected item carries:
- Listing ID;
- cover image;
- title;
- NEW / Б/У / REFURBISHED / NEVER INSTALLED badge;
- up to key public technical parameters;
- approved public price or `За запитом`;
- exact canonical deep-link to that listing:
  `market.html?id={listing_id}#listing-{listing_id}`.

Hard release rules:
1. Digest MARKET card must link to the exact equipment listing, never only to MARKET home.
2. Numeric public price may appear only when `price_state=ADMIN_1_APPROVED`.
3. `ON REQUEST` may appear without numeric price.
4. A listing still `HIDDEN` or not publicly released stays in the Admin Digest queue but is BLOCKED from final PDF publication.
5. Seller identity/contact and IIG private commission never enter Digest.
6. ADMIN_2 controls inclusion selection; ADMIN_1 price approval remains mandatory.


## 27. DIGEST SUPPLEMENTAL PAGE CONFLICT RULE — NO AUTO PAGE

Marker: `IIG_MARKET_DIGEST_NO_AUTO_PAGE_V1`

This rule supersedes any wording that may imply that selecting a MARKET listing automatically forms, reserves or assigns Digest Page 4 or Page 5.

### Standard issue
The standard IIG Monthly Digest remains the currently approved **3-page** structure.

### Meaning of MARKET checkbox
The checkbox:
`РОЗМІСТИТИ ДАНЕ ОБЛАДНАННЯ У ДАЙДЖЕСТІ`

means ONLY:
`ADD THIS LISTING TO THE MARKET → DIGEST CANDIDATE POOL`.

It MUST NOT:
- create Page 4;
- create Page 5;
- reserve a page number;
- alter the standard 3-page Digest;
- displace advertising/sponsored content;
- displace IIG own project material;
- displace partner or IIG ORIGINAL material;
- trigger Digest generation by itself.

### Additional pages
Any Page 4+ is created ONLY by explicit manual Admin action in the Digest Builder.

ADMIN_2 chooses the supplemental page content type manually from the approved set:
- IIG MARKET;
- SPONSORED MATERIAL / advertising material;
- PARTNER MATERIAL;
- IIG own project / SUCCESS PROJECT;
- IIG ORIGINAL;
- OTHER ADMIN-APPROVED supplemental content.

There is no fixed ownership of Page 4 or Page 5 by MARKET.

A future issue may have:
- no supplemental page;
- Page 4 = IIG project;
- Page 4 = sponsored material;
- Page 4 = IIG MARKET;
- Page 4 + Page 5 using different approved content types;
- any other explicit Admin-approved ordering.

Final layout remains subject to ADMIN_1 approval.

### MARKET pool
MARKET queue is a source library only. An item enters the PDF only after:
1. ADMIN_2 explicitly creates/selects a supplemental page;
2. ADMIN_2 chooses MARKET as that page's content type;
3. ADMIN_2 selects one or more eligible MARKET candidates;
4. listing/public-link/price gates pass;
5. final Digest layout is approved under the existing Digest release workflow.

