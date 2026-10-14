# IIG PRE-HOSTING FINAL GATE

**Version:** 2026.10.14-FINAL-GATE-1  
**Scope:** frozen `IIG_PRODUCTION_DEPLOY_PACKAGE` as one release candidate  
**Output vocabulary:** exactly `READY FOR HOSTING` or `BLOCKED`.

## Purpose

This gate is the final automated acceptance before any paid-hosting credentials are required. It does not deploy the site and does not touch DNS. It proves that the repository can assemble one production package whose static site, secure Admin, backend, persistence contract, backup/restore, Robots, Digest, MARKET rules and production container are internally consistent.

## Gate groups

A. Freeze / HARD RULE contracts:
- Production Package Freeze manifest;
- ADMIN MASTER;
- STEP26 design lock;
- IIG MARKET Admin;
- Marketplace portability;
- paid-hosting migration contract;
- public search;
- secure Admin static contract.

B. Robots/content:
- full repository Python robot/content test suite.

C. Browser code:
- JavaScript syntax for production-facing assets.

D. Backend:
- dependency install;
- backend syntax;
- unit/integration tests;
- secure Admin E2E: Admin → NEWS → approval → Digest → test mailing → RADAR → contacts.

E/F/G. Assembled package:
- deterministic assembly;
- public/Admin security boundary;
- public secret scan;
- internal-link/404 gate.

H. Production runtime simulation:
- production Compose validation;
- production Docker build;
- PostgreSQL + backend startup;
- /healthz;
- /readyz using non-secret pre-host placeholders;
- protected /admin/ login surface/security headers;
- unauthenticated privileged API denial.

I. Persistence:
- backup dry-run;
- checksum verification;
- destructive restore dry-run against test volumes;
- post-restore health.

J. Integrity:
- SHA256 manifest of final assembled release candidate.

## Decision rule

Any failed sub-gate => `BLOCKED`.

Every sub-gate GREEN => `READY FOR HOSTING`.

There is no WARN/PARTIAL/CONDITIONAL status.

## Boundary

`READY FOR HOSTING` means ready to receive paid-hosting/staging credentials. It does not mean production cutover is approved. Real TLS, provider credentials, SMTP delivery, production RADAR provider, staging browser E2E and final Migration Gate remain host-specific next-stage checks.

The current public-site architecture stays frozen. The future public IIG MARKET page remains a post-migration development concept and is not activated by this gate.
