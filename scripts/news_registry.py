#!/usr/bin/env python3
"""Portable resolver/loader for the canonical IIG 260-source registry."""
import json
from pathlib import Path
REGISTRY_URI="repo://content/discovery/IIG_news_source_registry_260.json"
EXPECTED_SCHEMA="iig.source-registry.v1"
EXPECTED_COUNT=260
def repo_root(start=None):
    p=Path(start or __file__).resolve()
    if p.is_file(): p=p.parent
    for candidate in (p,*p.parents):
        if (candidate/'.git').exists() or ((candidate/'content').is_dir() and (candidate/'scripts').is_dir()):
            return candidate
    raise RuntimeError("IIG repository root not found")
def resolve_repo_uri(uri=REGISTRY_URI,start=None):
    prefix="repo://"
    if not uri.startswith(prefix): raise ValueError("Only portable repo:// URIs are allowed")
    rel=uri[len(prefix):]
    if rel.startswith('/') or '..' in Path(rel).parts: raise ValueError("Unsafe registry URI")
    return repo_root(start)/rel
def load_registry(uri=REGISTRY_URI,start=None):
    path=resolve_repo_uri(uri,start)
    data=json.loads(path.read_text(encoding='utf-8'))
    if data.get('schema')!=EXPECTED_SCHEMA: raise ValueError(f"Unexpected registry schema: {data.get('schema')}")
    sources=data.get('sources',[])
    if len(sources)!=EXPECTED_COUNT: raise ValueError(f"Registry must contain exactly {EXPECTED_COUNT} sources, got {len(sources)}")
    ids=[x.get('id') for x in sources]; urls=[x.get('website_url') for x in sources]
    if len(set(ids))!=EXPECTED_COUNT or len(set(urls))!=EXPECTED_COUNT: raise ValueError("Registry IDs and website URLs must be unique")
    if not all(isinstance(u,str) and u.startswith(('https://','http://')) for u in urls): raise ValueError("Invalid website_url in registry")
    return data
if __name__=="__main__":
    d=load_registry(); print(f"PORTABLE_REGISTRY_OK uri={REGISTRY_URI} sources={len(d['sources'])}")
