# IIG News Source Registry — Portability Contract

## Canonical artifact
- Logical URI: `repo://content/discovery/IIG_news_source_registry_260.json`
- Repository-relative path: `content/discovery/IIG_news_source_registry_260.json`
- Resolver: `scripts/news_registry.py`
- Schema: `iig.source-registry.v1`
- Required count: **260 approved sources**

## Portability invariant
All News Source / Discovery components MUST resolve the registry through the logical `repo://` URI or the repository root. Absolute filesystem paths, ChatGPT Library IDs, usernames, workstation paths, GitHub owner URLs and external fallback copies are forbidden runtime dependencies.

The same checkout must work after clone, fork, CI checkout, local execution or repository transfer without changing the registry reference.

## Fail closed
Missing registry, schema mismatch, count other than 260, duplicate IDs/URLs, or an unsafe/non-repository URI MUST block a production Discovery run. No fallback to a seed list is allowed for FULL_DISCOVERY.

## Ownership
The JSON file in this repository is the canonical runtime artifact. External/Library copies are backup/source provenance only and never the runtime source of truth.
