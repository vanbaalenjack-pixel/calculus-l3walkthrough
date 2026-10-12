#!/usr/bin/env python3
"""Verify the routing package boundary and all potential public text responses."""
import importlib.util
import hashlib
import json
import os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
REVIEW=Path(os.environ.get('CALC_REVIEW_DIR',ROOT/'.review/2026-10-12-final'))

def check():
    package=REVIEW/'query-release';assets=package/'assets'
    manifest=json.loads((REVIEW/'query-release-manifest.json').read_text())
    public=manifest['publicFiles'];questions=manifest['questions']
    assert len(questions)==120
    expected={v['asset'].lstrip('/') for v in list(public.values())+list(questions.values())}
    actual={p.relative_to(assets).as_posix() for p in assets.rglob('*') if p.is_file()}
    assert expected==actual,'Unlisted/missing package assets'
    assert all(not p.startswith('/__questions/') for p in public)
    assert not any(p.endswith(('.md','.map','.py','.swift','.mjs','.cjs')) for p in public)
    for item in list(public.values())+list(questions.values()):
        assert hashlib.sha256((assets/item['asset'].lstrip('/')).read_bytes()).hexdigest()==item['sha256']
    config=json.loads((package/'wrangler.json').read_text())
    assert config['routes']==[] and config['workers_dev'] is False and config['preview_urls'] is False
    assert config['assets']['run_worker_first'] is True
    spec=importlib.util.spec_from_file_location('public_scan',ROOT/'scripts/check-public-output.py')
    scan=importlib.util.module_from_spec(spec);spec.loader.exec_module(scan)
    failures=[];math=[];count=0
    for p in sorted(assets.rglob('*')):
        if not p.is_file() or p.suffix not in scan.TEXT and p.name not in {'CNAME','LICENSE'}:continue
        count+=1
        for number,line in enumerate(p.read_text().splitlines(),1):
            hit=scan.TERMS.search(line) or scan.UPPER_AI.search(line) or scan.DEV_REFERENCE.search(line)
            if hit:failures.append({'path':p.relative_to(assets).as_posix(),'line':number,'match':hit[0]})
            if __import__('re').search(r'\bai\b',line):math.append({'path':p.relative_to(assets).as_posix(),'line':number})
    result={'assetFiles':len(actual),'textFiles':count,'selectedQuestionResponses':len(questions),
            'scope':'All public static text and all 120 server-selected HTML responses. Private response paths must return 404 over HTTP.',
            'failures':failures,'mathematicalAiForContextReview':math}
    (REVIEW/'query-public-scan.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k!='mathematicalAiForContextReview'}))
    assert not failures

if __name__=='__main__':check()
