import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def test_policy_admin_only():
    p=json.loads((ROOT/'content/moderation-policy.json').read_text())
    assert p['publication']['auto_publish'] is False
    assert p['publication']['authority']=='ADMIN_ONLY'
    assert p['publication']['digest_mailing_requires_admin_approval'] is True

def test_scheduler():
    w=(ROOT/'.github/workflows/content-engine.yml').read_text()
    assert "cron: '15 6 * * 1'" in w
    assert "cron: '30 6 1 * *'" in w

def test_workflow_cannot_write_or_deploy():
    w=(ROOT/'.github/workflows/content-engine.yml').read_text().lower()
    assert 'contents: read' in w
    assert 'contents: write' not in w
    for forbidden in ['git push','deploy-pages','gh api','curl -x post','publish_now']:
        assert forbidden not in w

def test_engine_emits_review_only():
    s=(ROOT/'scripts/content_engine.py').read_text()
    assert "'status':'READY_FOR_REVIEW'" in s
    assert "'publish_authority':'ADMIN_ONLY'" in s
    assert "'auto_publish':False" in s
