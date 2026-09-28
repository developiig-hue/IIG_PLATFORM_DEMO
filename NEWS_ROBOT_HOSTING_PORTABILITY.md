# IIG News Robot — mandatory hosting portability contract

Status: binding development requirement for PR #3, NOT proof that deployment or migration has been tested.

## Objective

The complete website and News Robot must be movable from GitHub Pages to IIG's own paid hosting and custom domain without rewriting editorial logic, losing moderation data or depending on a `github.io` address. GitHub is a source-code and optional CI provider, not a required production runtime.

## Repository layout and responsibilities

- `scripts/`: host-neutral Python standard-library modules for discovery, evidence verification, drafting, image selection, moderation and export. Resolve all repository files relative to `Path(__file__).resolve().parents[1]`, never to a developer machine or GitHub runner working directory.
- `content/`: versionable source registry, candidate inputs, verified evidence, review queue, photo manifest and article data. Keep secrets, authentication credentials, administrator approval tokens and private interview correspondence OUT of the publicly served web root and git.
- `baze_foto_news/manifest.json`: metadata only. Nine fallback JPEGs currently live at the repository root. `content/news-sector-image-paths.json` maps sector to their exact root-relative filenames; do not invent `/baze_foto_news/<filename>` paths.
- `.github/workflows/`: optional GitHub scheduler/CI adapter only. All business logic must also run with documented local commands or an ordinary host cron job. No workflow may silently publish.
- `news.html` and other HTML/JS: static client, reads exported public JSON only; never reads the private moderation queue or approval secrets.

## Domain and base-path independence

- Never hardcode `developiig-hue.github.io`, `github.io`, repository name, a paid host name, a local absolute filesystem path, or an API host into article metadata or asset-selection logic.
- Canonical external source URLs remain the original publisher URLs; local site URLs and asset URLs are derived at build/runtime from environment/configuration `IIG_SITE_BASE_PATH` (default `/`) and optional `IIG_SITE_ORIGIN` (only when absolute canonical links are required). Normalize and validate base path to avoid `//`, traversal and duplicate prefix.
- On GitHub Pages project deployment, base path can be `/IIG_PLATFORM_DEMO/`; on a custom-domain root deployment use `/`; on a subfolder deployment use that subfolder. The nine `/baze_foto_news_*.jpg` entries are logical paths relative to the SITE root, NOT unconditional host-root URLs. Join with configured site base path when emitting browser URLs. Use relative URLs where feasible.
- Do not reference GitHub raw URLs as production assets. Copy assets and exported JSON with the site build so they are served by the destination host itself.

## Deployment adapters

- Static site hosting: build/export reviewed public JSON and static assets into a deployable directory, upload to any standard web server/CDN. Python discovery and review pipeline runs separately on a secure machine or server scheduler; static hosting alone cannot execute Python or securely authenticate approvals.
- Paid host with Python: run the same CLI from the repository checkout and schedule via cron/systemd; configure writeable state directories and secrets outside public web root. If host lacks Python/cron, use a separate worker and transfer only approved export artifacts.
- Required documentation: environment variables, install prerequisites, cron command, output locations, backup/restore, permission model, DNS/HTTPS cutover and smoke checks for all nine image URLs and UA/EN articles. No provider-specific service is mandatory.

## Publication safety and migration acceptance

- Discovery, draft and image fallback can be automatic. Editorial approval must be authenticated and bound to an immutable content+image digest. Publishing only after explicit approval; never interpret `reviewed_by` in editable JSON as sufficient authorization.
- Keep unpublished evidence, review queue and secrets private. Never place them in the static export. Do not make GitHub Actions `contents: write` or auto-deploy a publication backdoor.
- Migration acceptance requires a clean deployment under both a subpath and `/`, verified asset/JSON URLs, working nine-image fallback, no GitHub-domain references in served files, and a demonstrated manual approval gate. Until these tests run, mark migration as NOT VERIFIED.
