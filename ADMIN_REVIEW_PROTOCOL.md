# IIG Admin Review / Publication — Production Contract

Robot **5 of 7**. It is the only human authorization boundary between moderated content and publication/digest preparation.

## Ten-point Definition of Done
1. **Functionality** — prepare an immutable review queue; record explicit APPROVED or REJECTED decisions; only APPROVED items receive publication authorization.
2. **Input / Output** — consume the exact `iig.image-rights-report.v1` artifact and `iig.image-rights.v1` queue; emit `iig.admin-review.v1`, `iig.admin-decisions.v1`, and `iig.publication-handoff.v1`.
3. **Reliability** — malformed input, one invalid contract, duplicate terminal decision, or integrity mismatch fails closed; writes are atomic.
4. **Security** — artifact path is confined to `content/image-rights/`; SHA-256 is recomputed over the complete item; NEWS cannot bypass Image / Rights; reviewer identity and reason are mandatory.
5. **Portability / Hosting** — repository-relative paths only; no GitHub Pages, workstation, account, domain, or hosting dependency. Persistent storage can later move behind the same contracts.
6. **Integration** — exact chain `IMAGE_RIGHTS (#4) -> ADMIN_REVIEW_PUBLICATION (#5) -> DIGEST (#6)`. Advice needs no image; NEWS must arrive rights-cleared.
7. **Admin Approval / NO AUTO** — CI may only prepare/verify the queue. It MUST NOT call `decide`. Only explicit human `APPROVED` creates publication authorization. `REJECTED` never does.
8. **Automated Tests** — integrity, malformed state, image bypass, approval, rejection, duplicate decision, reviewer/reason and workflow governance are tested.
9. **Live-test** — CI rebuilds the real Content Engine -> Quality Gate -> Image / Rights chain, then prepares Robot #5 queue from the real artifact.
10. **Acceptance + GitHub** — feature workflow must be GREEN; merge to main only after owner authorization; post-merge GREEN required.

## Publication rule
Admin approval is the authorization event. Robot #5 does not invent or edit content and never approves itself. On APPROVED it creates an immutable publication handoff carrying the original item, its SHA-256, image selection where required, reviewer, reason and timestamp. The website publication adapter and Digest Robot may consume only this approved handoff.

## Mailing boundary
Robot #5 does **not** send email. Robot #6 builds the digest from approved material. Robot #7 Scheduler / Orchestration may trigger mailing only after the relevant digest has explicit Admin approval; the email transport is infrastructure, not an eighth robot.


## Paid-hosting portability audit — 2026-10-10
Marker: `IIG_ADMIN_REVIEW_PORTABILITY_AUDIT_2026_10_10`.
No behavior change; this marker forces a fresh acceptance workflow on the current main branch.
