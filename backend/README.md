# IIG Digest Publication Service

Portable backend for the IIG Monthly Digest.

## What it solves

The public website must never depend on a browser-local PDF. The publication path is:

```
ADMIN_1 approval
  -> POST /api/v1/digest/approvals
ADMIN_1 or ADMIN_2 selects an already approved PDF
  -> POST /api/v1/digest/releases
  -> PDF validation
  -> active-link verification
  -> replace single CURRENT PDF
  -> GET /api/v1/digest/current
Homepage
  -> direct /digest/current.pdf?v=<revision> download
```

ADMIN_2 can re-upload an already generated PDF without regeneration or a new Final Preview while its fingerprint is the same ADMIN_1-approved fingerprint.

## API

### POST /api/v1/digest/approvals
ADMIN_1 only. Stores the server-side approval receipt.

JSON:
```json
{
  "issue": "2026-09",
  "fingerprint": "...",
  "preview_fingerprint": "...",
  "revision": 3
}
```

### POST /api/v1/digest/releases
ADMIN_1 or ADMIN_2. Multipart:
- `pdf`: PDF binary
- `metadata`: JSON string

Backend requires an exact server-side ADMIN_1 approval match, verifies that the file is PDF, extracts HTTP(S) link annotations, verifies expected IIG links, replaces CURRENT and returns a revisioned publication record.

### GET /api/v1/digest/current
Returns the current release metadata with `public_url` and `revision`.

### GET /digest/current.pdf
Direct public binary download. Response filename is automatically `IIG_Digest_MM_YYYY.pdf`.

## Storage

Set `IIG_DIGEST_STORAGE=local` for normal VPS/paid hosting. Data is stored under `IIG_DIGEST_LOCAL_DIR`.

Set `IIG_DIGEST_STORAGE=s3` for any S3-compatible object storage. Configure the `IIG_S3_*` environment variables. The website/Admin code does not change when storage changes.

## Security

Preferred production setup:
1. Serve Admin and API on the same paid domain.
2. Put Admin behind real authentication.
3. Reverse proxy strips any incoming `X-IIG-Admin-Role` and injects a trusted role only after successful authentication.
4. The backend accepts only ADMIN_1 for approvals and ADMIN_1/ADMIN_2 for release upload.

Direct bearer tokens are supported for integration/testing through `IIG_ADMIN1_TOKEN` and `IIG_ADMIN2_TOKEN`. Never place these tokens in public JavaScript.

## Docker / VPS

```bash
cd backend
cp .env.example .env
# edit PUBLIC_BASE_URL, storage and auth settings
docker compose up -d --build
```

Then reverse proxy `/api/v1/digest/*` and `/digest/current.pdf` to port 8787 using `nginx.iig-digest.conf`.

## Portability

The public/admin frontend depends only on the stable URLs:
- `/api/v1/digest/approvals`
- `/api/v1/digest/releases`
- `/api/v1/digest/current`
- `/digest/current.pdf`

Therefore changing domain, VPS provider, S3 vendor or hosting platform requires environment/proxy changes only; no Digest UI rewrite is needed.


## Bilingual UA/EN portability

The verified production contract is bilingual:
- UA is the default language.
- EN is a separate language-scoped edition of the same issue.
- Approval and release metadata MUST carry `language`.
- UA CURRENT: `/digest/current.pdf`.
- EN CURRENT: `/digest/current-en.pdf`.
- `GET /api/v1/digest/current?language=UA` and `?language=EN` resolve language-specific metadata.
- UA and EN approval receipts/storage objects MUST remain separate.
- PDF link verification applies independently to both language editions.

Owner acceptance on 2026-10-06 confirmed that EN translation and EN Digest links work correctly. A hosting/domain migration must re-run the UA/EN switch, translation, state isolation and PDF/direct-link checks before cutover.
