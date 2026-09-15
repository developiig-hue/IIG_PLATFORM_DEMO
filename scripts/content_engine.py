#!/usr/bin/env python3
"""IIG content engine. Generates review queues only. Never publishes."""
import argparse,json,hashlib
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
QUEUE=ROOT/'content'/'review-queue'
POLICY=ROOT/'content'/'moderation-policy.json'

def policy(): return json.loads(POLICY.read_text(encoding='utf-8'))
def existing(kind):
    out=[]
    for p in QUEUE.glob('*.json'):
        try:
            x=json.loads(p.read_text(encoding='utf-8'))
            if x.get('kind')==kind: out.append(x)
        except Exception: pass
    return out

def score(x):
    # deterministic editorial pre-score; admin remains final authority
    return sum(int(x.get(k,0)) for k in ['evidence','practical_value','transferability','technology_diversity','decision_maker_value'])
def candidate_pool():
    pool=[]
    for p in (ROOT/'content'/'candidates').glob('*.json') if (ROOT/'content'/'candidates').exists() else []:
        data=json.loads(p.read_text(encoding='utf-8'))
        pool += data if isinstance(data,list) else [data]
    return pool

def make(kind,now):
    pol=policy(); pool=candidate_pool(); month=now.strftime('%Y-%m')
    if kind=='weekly':
        eligible=[x for x in pool if x.get('type') in ('news','chief-engineer-advice')]
        selected=sorted(eligible,key=score,reverse=True)[:pol['weekly']['max_candidates']]
    else:
        approved=[x for x in existing('weekly') if x.get('status')=='APPROVED']
        items=[i for q in approved for i in q.get('items',[]) if str(i.get('date','')).startswith(month)]
        seen=set(); dedup=[]
        for x in sorted(items,key=score,reverse=True):
            key=(x.get('canonical_url') or x.get('title','')).strip().lower()
            if key and key not in seen: seen.add(key); dedup.append(x)
        selected=dedup[:pol['monthly']['max_items']]
    stamp=now.strftime('%Y%m%dT%H%M%SZ'); ident=hashlib.sha256((kind+stamp).encode()).hexdigest()[:12]
    doc={'schema':'iig.moderation.v1','id':ident,'kind':kind,'generated_at':now.isoformat(),'status':'READY_FOR_REVIEW','publish_authority':'ADMIN_ONLY','auto_publish':False,'items':selected,'moderation':{'reviewed_by':None,'reviewed_at':None,'decision':None},'audit':{'generator':'scripts/content_engine.py','immutable_rule':'NO_AUTO_PUBLISH'}}
    QUEUE.mkdir(parents=True,exist_ok=True); path=QUEUE/f'{kind}-{stamp}.json'; path.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); print(path.relative_to(ROOT))

def verify():
    pol=policy(); assert pol['publication']['auto_publish'] is False and pol['publication']['authority']=='ADMIN_ONLY'
    wf=(ROOT/'.github/workflows/content-engine.yml').read_text(encoding='utf-8')
    assert 'cron: \'15 6 * * 1\'' in wf and 'cron: \'30 6 1 * *\'' in wf
    forbidden=['git push','gh api','deploy-pages','curl -X POST','PUBLISH_NOW']
    low=wf.lower()
    for x in forbidden: assert x.lower() not in low, f'forbidden publish path: {x}'
    for p in QUEUE.glob('*.json'):
        x=json.loads(p.read_text(encoding='utf-8')); assert x['auto_publish'] is False; assert x['publish_authority']=='ADMIN_ONLY'; assert x['status'] in ('READY_FOR_REVIEW','APPROVED','REJECTED')
    print('GREEN: scheduler + moderation + ADMIN_ONLY/no-auto-publish invariants verified')

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('command',choices=['weekly','monthly','verify']); a=ap.parse_args(); now=datetime.now(timezone.utc)
    verify() if a.command=='verify' else make(a.command,now)
if __name__=='__main__': main()
