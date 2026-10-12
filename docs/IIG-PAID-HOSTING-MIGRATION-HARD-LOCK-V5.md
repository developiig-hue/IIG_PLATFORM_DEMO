# IIG PAID HOSTING MIGRATION HARD LOCK — V5
**Status:** LOCKED / mandatory for production migration
**Date:** 2026-10-12
**Owner authority:** ADMIN_1
**Scope:** IIG CMS, Digest Builder, IIG MARKET, mailing, search, PDF publication, security and persistence.

This document is the authoritative migration checklist. A paid-hosting deployment is not accepted unless every rule below is preserved or intentionally migrated to a server-side equivalent with identical editorial behavior.

## 1. Admin / CMS
- Canonical admin route: /admin/
- Production authentication: Login + Password -> one-time MFA -> Dashboard.
- Server-side RBAC for ADMIN_1 / ADMIN_2.
- HTTPS, secure cookies/sessions, inactivity timeout/logout, rate limit, audit log.
- Secrets must be outside source code and outside public static assets.
- ADMIN_2 edits/prepares; ADMIN_1 is final authority for approvals, public prices and final Digest layout.
- Ukrainian admin UI remains the default language.

## 2. News / editorial
- News editor keeps title, category, date, summary, body, source URL, slug, image review and approval.
- Main generation button label remains: «ЗГЕНЕРУВАТИ ОНОВЛЕННЯ НОВИН САЙТУ».
- No duplicate lower controls if the same action already exists above.
- Each Digest news item remains a single linked row with «читати далі…» and a direct route to the exact IIG article.
- Site search must find actual published content and return the matching page/material.

## 3. Digest authority / approval
- Digest is built only from approved content through Admin.
- Manual layout is the working source-of-truth after initial assembly.
- Any content/layout change invalidates previous Final Preview / approval fingerprint.
- Final flow: working layout -> Final Preview -> ADMIN_1 approval -> PDF/export -> publication.
- GitHub/CI or production jobs must never silently rebuild or replace an ADMIN-approved issue.
- Existing approved PDF may be re-uploaded only under the approved-release rules already implemented.

## 4. PDF publication
- Final Digest PDF must physically exist in public storage/CDN/object storage used by the website.
- User-facing download must resolve to the current approved PDF and must not redirect to the news section.
- Production migration must provide persistent public storage and CURRENT-PDF pointer/versioning.
- Backup, rollback and restore test are mandatory.

## 5. IIG MARKET core
- Public MARKET remains hidden until owner activation/content readiness.
- Seller contact, seller asking price and IIG fee remain PRIVATE.
- ADMIN_2 prepares equipment cards, technical data, media, price and terms.
- ADMIN_1 approves public price and final commercial terms.
- «ТЕРМІНОВО» remains a red urgency marker and propagates into Digest.
- Canonical deep-link to equipment remains listing-specific.

## 6. Marketplace -> Digest HARD RULE
- Digest Builder Page 4/5+ must include material type Marketplace.
- Marketplace auto-pulls only IIG MARKET records marked include_digest=true and passing release gates.
- Auto-pull is initiated explicitly by ADMIN_2; it never silently overwrites a non-Marketplace page.
- Page 4 and Page 5 are the normal Marketplace start pages; Page 6+ is allowed when required.
- ADMIN_2 may optionally add title, lead/subtitle and editorial body; these are optional wrappers only.
- Each new equipment category must begin with a left-side category tag.
- Canonical tags/classes:
  - KGU — Gas Engine / CHP / cogeneration;
  - GAS BOILER — gas boiler house/equipment;
  - TURBIN — gas turbine;
  - BESS — battery energy storage;
  - other approved categories use the same grouped pattern.
- Each equipment item is exactly one clickable line, comparable to a Digest news row.
- For KGU, show manufacturer/model plus electrical output where available.
- For BESS, show power/energy capacity where available.
- Every row deep-links to the exact IIG MARKET listing.
- Urgent equipment shows red «ТЕРМІНОВО».
- MARKET equipment must never be rendered as one unstructured list.

## 7. ADMIN_2 manual control after Marketplace auto-pull
For each pulled equipment row:
- ↑ move up;
- ↓ move down;
- ⇄ move to another Marketplace page/block;
- × exclude from this Digest issue only.

HARD RULE: × never deletes or changes the source IIG MARKET listing.

Manual ordering and exclusions are issue-scoped persisted state. Reopening Preview/PDF must preserve them. A repeated auto-pull that can replace manual ordering requires explicit ADMIN confirmation.

## 8. Page 4+ CTA invariant
Every Page 4/5+ always contains both standard CTA links:
- forms.html#project
- forms.html#subscribe

This rule applies regardless of how many supplemental/Marketplace pages exist.

## 9. Persistence model on paid hosting
Static demo/localStorage state must migrate to server-side persistence without changing behavior.
Required production storage:
- PostgreSQL (or approved relational DB) for CMS, Digest issues, approvals, MARKET, recipients, audit metadata.
- Persistent/object storage (S3-compatible or approved equivalent) for media and PDFs.
- Secrets manager/environment variables for credentials and keys.
- Versioned migrations, backups, restore verification and rollback.

Required issue-level Digest state:
- issue ID / month / year / language;
- page order and page type;
- MARKET listing IDs included in the issue;
- MARKET row order;
- issue-only exclusions;
- category/tag snapshot;
- display power/capacity snapshot;
- direct URL snapshot;
- urgency snapshot;
- optional editorial wrapper;
- Final Preview fingerprint;
- ADMIN_1 approval receipt/status;
- published PDF/version/current pointer.

## 10. Deployment architecture
Migration path is staging -> acceptance gates -> production.
Production release must include database migrations, media/PDF storage migration, API/RBAC/auth migration, search index rebuild, route/deep-link verification, audit continuity and rollback plan.

No migration is accepted if any public/admin route, deep-link, MARKET listing mapping, Digest approval rule, PDF link, search behavior or CTA is lost.

## 11. Automated acceptance gate
The repository contains a machine-readable migration contract and a CI gate. The gate must remain enabled until paid-hosting migration is complete. Production deployment is BLOCKED when required migration rules/files are missing.

## 12. Final migration principle
Preserve behavior, not browser implementation. GitHub Pages/localStorage are DEMO transport/storage only. Paid hosting may replace them with backend/API/DB/storage, but all editorial authority, Marketplace auto-pull, manual controls, approval invalidation, category tags, direct links, CTA rules, search and PDF behavior must remain identical.