#!/usr/bin/env python3
"""Portable recipient-provider contract for Robot #7. No recipient PII is stored in Git."""
import json,os
from urllib.request import Request,urlopen
from urllib.parse import urlparse
VALID={"ACTIVE"}
def normalize(rows):
 out=[];seen=set()
 for r in rows:
  if not isinstance(r,dict):continue
  email=str(r.get("email","")).strip().lower();status=str(r.get("status","")).upper()
  if status not in VALID or "@" not in email or email in seen:continue
  seen.add(email);out.append({"recipient_id":str(r.get("recipient_id","")),"email":email,"language":str(r.get("language","EN")).upper(),"status":"ACTIVE"})
 return out
def get_active_recipients():
 provider=os.getenv("RECIPIENT_PROVIDER","http_api")
 if provider=="runtime_json":
  raw=os.getenv("RECIPIENTS_RUNTIME_JSON","[]")
  try:return normalize(json.loads(raw))
  except Exception:raise SystemExit("RECIPIENT_PROVIDER_BLOCKED: invalid runtime JSON")
 if provider!="http_api":raise SystemExit("RECIPIENT_PROVIDER_BLOCKED: unknown provider")
 url=os.getenv("RECIPIENT_PROVIDER_URL","");token=os.getenv("RECIPIENT_PROVIDER_TOKEN","")
 u=urlparse(url)
 if u.scheme!="https" or not u.hostname or not token:raise SystemExit("RECIPIENT_PROVIDER_BLOCKED: HTTPS endpoint/token required")
 req=Request(url,headers={"Authorization":"Bearer "+token,"Accept":"application/json","User-Agent":"IIG-RecipientProvider/1.0"})
 try:
  with urlopen(req,timeout=15) as r:data=json.load(r)
 except Exception:raise SystemExit("RECIPIENT_PROVIDER_BLOCKED: provider unavailable")
 rows=data.get("recipients") if isinstance(data,dict) else None
 if not isinstance(rows,list):raise SystemExit("RECIPIENT_PROVIDER_BLOCKED: invalid response")
 return normalize(rows)
