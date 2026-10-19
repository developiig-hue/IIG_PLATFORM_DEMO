# IIG → Mirohost eVPS TEST staging

**Status:** PREPARED / HOST ACCESS DETAILS REQUIRED  
**Purpose:** move the IIG public site and portable backend package off GitHub Pages for visual/basic Admin testing without changing HARD RULE, information architecture, NEWS/Digest/Mailing logic, or the future E-13 production design.

## Stage-1 scope

The eVPS-TEST stage may receive:
- the exact approved public surface from `IIG_PRODUCTION_DEPLOY_PACKAGE/PUBLIC_COPYLIST.txt`;
- the existing Node.js backend source and Admin UI build input;
- the existing NEWS/editorial integration, which continues to dispatch the GitHub `editorial-refresh.yml` robot server-side when `IIG_GITHUB_ACTIONS_TOKEN` is configured;
- local persistent directories supplied by Mirohost for test data.

It MUST NOT:
- rewrite public architecture/design;
- replace the NEWS robot;
- expose Admin source files in the public root;
- commit hosting passwords/tokens;
- activate mass mailing before SMTP/suppression/live checks;
- treat eVPS-TEST as final E-13 production.

## Required Mirohost handoff before upload

The account/panel credentials are not SSH credentials. Deployment requires values from the Mirohost panel:
- server IPv4 or hostname;
- SSH username;
- SSH port;
- website document-root path;
- Node.js runtime method/version (Node 20+ required);
- backend long-running process method supported by Mirohost;
- Nginx reverse-proxy target configuration method;
- test hostname/domain or confirmation that the site is reachable by dedicated IP.

No secret is written to Git.

## Build

```bash
bash deploy/mirohost-evps-staging/build.sh
```

Output:
`dist/IIG_MIROHOST_EVPS_STAGING/`

## Acceptance boundary

Before public traffic is moved from GitHub Pages, verify:
1. public pages render from Mirohost with the same layout/assets;
2. internal navigation/search/UA-EN behavior is unchanged;
3. `/admin/` login surface is served by the backend, not exposed static Admin source;
4. backend `/healthz` responds;
5. NEWS manual refresh can dispatch the existing GitHub editorial robot from the Mirohost backend;
6. requests/contacts/digest test storage survives backend restart;
7. no SMTP mass send is enabled during staging;
8. GitHub remains repository/CI/robot engine only.

Final E-13 migration happens only after this staging acceptance.
