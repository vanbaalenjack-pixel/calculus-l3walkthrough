#!/usr/bin/env python3
"""Package the checked site and query-aware responses; never activate hosting."""
import hashlib
import json
import mimetypes
import os
from pathlib import Path
import shutil

ROOT=Path(__file__).resolve().parents[1]
REVIEW=Path(os.environ.get('CALC_REVIEW_DIR',ROOT/'.review/2026-10-12-final'))

def build():
    output=REVIEW/'query-release'
    if output.exists():shutil.rmtree(output)
    (output/'assets').mkdir(parents=True)
    records=json.loads((REVIEW/'public-manifest.json').read_text())
    responses=json.loads((REVIEW/'complex-response-preview/responses.json').read_text())
    assert len(responses)==120
    release={'publicFiles':{},'questions':{}}
    def copy(source,target):
        content=source.read_bytes()
        destination=output/'assets'/target.lstrip('/')
        destination.parent.mkdir(parents=True,exist_ok=True);destination.write_bytes(content)
        return {'asset':target,'sha256':hashlib.sha256(content).hexdigest(),
                'type':'text/html; charset=utf-8' if target.endswith('.html') else mimetypes.guess_type(target)[0] or 'application/octet-stream'}
    for record in records:
        source=ROOT/'_site'/record['path']
        assert hashlib.sha256(source.read_bytes()).hexdigest()==record['sha256'],record['path']
        release['publicFiles']['/'+record['path']]=copy(source,'/'+record['path'])
    for record in responses:
        key=record['paperId'].removeprefix('level-3-complex-')+':'+record['partId']
        release['questions'][key]=copy(REVIEW/'complex-response-preview'/record['response'],'/__questions/'+record['response'])
    for name in ['worker.mjs','serve.mjs']:shutil.copyfile(ROOT/'scripts/query-routing'/name,output/name)
    shutil.copyfile(ROOT/'scripts/query-routing/ROLLOUT.md', output/'ROLLOUT.md')
    (output/'release.mjs').write_text('export default '+json.dumps(release,ensure_ascii=False,sort_keys=True)+';\n')
    # Optional adapter, inactive by default: no account, public preview or routes.
    (output/'wrangler.json').write_text(json.dumps({'name':'calc-nz-question-responses','main':'worker.mjs',
       'compatibility_date':'2026-10-12','workers_dev':False,'preview_urls':False,'routes':[],
       'assets':{'directory':'assets','binding':'ASSETS','run_worker_first':True,
                 'html_handling':'none','not_found_handling':'none'}},indent=2)+'\n')
    (output/'package.json').write_text(json.dumps({'private':True,'type':'module','scripts':{'preview':'node serve.mjs'}},indent=2)+'\n')
    (output/'response-manifest.json').write_text(json.dumps(responses,indent=2)+'\n')
    (REVIEW/'query-release-manifest.json').write_text(json.dumps(release,indent=2)+'\n')
    print(f'Inactive query-aware package: {len(records)} public files, {len(responses)} question responses; {output}')

if __name__=='__main__':build()
