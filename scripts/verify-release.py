#!/usr/bin/env python3
"""Read-only verification of the exact public artifact at a preview or live origin."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote, urlsplit
from urllib.request import Request, build_opener, HTTPRedirectHandler

ROOT = Path(__file__).resolve().parents[1]
REVIEW = ROOT / '.review/2026-09-24'


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def read(url):
    try:
        try:
            response = build_opener(NoRedirect()).open(
                Request(url, headers={'User-Agent': 'Calc.nz-release-verification/1.0'}), timeout=30)
        except HTTPError as error:
            response = error
        with response:
            body = response.read()
            return {'url': url, 'status': response.code,
                    'location': response.headers.get('Location'),
                    'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest()}
    except Exception as error:
        return {'url': url, 'error': str(error)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--origin', default='http://127.0.0.1:8004')
    parser.add_argument('--live', action='store_true', help='Also check production HTTP/www redirects')
    args = parser.parse_args()
    origin = args.origin.rstrip('/')
    if urlsplit(origin).scheme not in ('http', 'https'):
        parser.error('Use an http or https origin')
    manifest = json.loads((REVIEW / 'public-manifest.json').read_text())
    manifest.append({'path': '.nojekyll', 'sha256': hashlib.sha256(b'').hexdigest(), 'bytes': 0})

    def check_file(record):
        result = read(origin + '/' + quote(record['path']))
        result['path'] = record['path']
        result['pass'] = result.get('status') == 200 and result.get('sha256') == record['sha256']
        return result

    with ThreadPoolExecutor(max_workers=6) as pool:
        public = list(pool.map(check_file, manifest))
    excluded = sorted({'/' + str(p.relative_to(ROOT)) for p in (ROOT / 'scripts').rglob('*')
                       if p.is_file() and '__pycache__' not in p.parts} | {
        '/.review/2026-09-24/checklist.md', '/.github/workflows/pages.yml', '/_config.yml',
        '/HOSTING_MIGRATION.md', '/AUDIT_REMEDIATION.md', '/official-resources.json',
        '/guides.json', '/verification-missing-page-20260929.html'})
    with ThreadPoolExecutor(max_workers=6) as pool:
        exclusions = list(pool.map(lambda path: read(origin + quote(path)), excluded))
    for result in exclusions:
        result['pass'] = result.get('status') in (404, 410)
    redirects = []
    if args.live:
        for url in ('http://calc.nz/', 'http://www.calc.nz/', 'https://www.calc.nz/'):
            result = read(url)
            result['pass'] = result.get('status') in (301, 308) and result.get('location') == 'https://calc.nz/'
            redirects.append(result)
    results = public + exclusions + redirects
    report = {'checkedAt': datetime.now(timezone.utc).isoformat(), 'origin': origin,
              'live': args.live, 'publicFiles': public, 'excludedAndMissing': exclusions,
              'redirects': redirects, 'failures': [r for r in results if not r['pass']]}
    output = REVIEW / ('live-release.json' if args.live else 'preview-release.json')
    output.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({'publicFiles': len(public), 'excludedAndMissing': len(exclusions),
                      'redirects': len(redirects), 'failures': len(report['failures']),
                      'report': str(output)}, indent=2))
    return bool(report['failures'])


if __name__ == '__main__':
    raise SystemExit(main())
