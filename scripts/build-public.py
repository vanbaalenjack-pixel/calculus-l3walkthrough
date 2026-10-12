#!/usr/bin/env python3
"""Assemble only runtime website files; never publish the source directory."""
from pathlib import Path
import hashlib
import json
import os
import re
import shutil
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '_site'

def publication_inputs():
    """Explicit runtime allowlist, shared with release-boundary tests."""
    pages = {urlsplit(e.text).path.lstrip('/') or 'index.html'
             for e in ET.parse(ROOT / 'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
    if any('/' in name or not name.endswith('.html') for name in pages):
        raise ValueError('Sitemap publication inputs must be root-level HTML pages')
    pages |= {'404.html', 'integration-2017.html', 'integration-2019.html',
              'integration-2020.html', 'differentiation-2020.html'}
    runtime = {'style.css', 'question-catalogue.js', 'walkthrough-gate.js',
               'walkthrough-audit-data.js', 'site-shell.js', 'index-loader.js',
               'index-page.js', 'search-core.js', 'search-page.js',
               'complex-walkthrough.js', 'differentiation-walkthrough.js',
               'algebra-walkthrough.js', 'favicon.ico', 'CNAME', 'robots.txt', 'sitemap.xml'}
    for name in pages:
        for src in re.findall(r'<script[^>]+src=["\']([^"\']+)', (ROOT / name).read_text()):
            parsed = urlsplit(src)
            if parsed.path in runtime:
                continue
            if not parsed.netloc and parsed.path.endswith('-data.js'):
                if not re.fullmatch(r'[a-z]+-20\d\d-data\.js', parsed.path):
                    raise ValueError(f'Unexpected content dependency: {src}')
                runtime.add(parsed.path)
    assets = json.loads((ROOT / 'scripts/public-assets.json').read_text())
    if len(assets) != len(set(assets)):
        raise ValueError('Duplicate public asset')
    for name in assets:
        path = Path(name)
        if not name.startswith('assets/') or '..' in path.parts or path.suffix == '.map':
            raise ValueError(f'Invalid public asset: {name}')
    return pages | runtime | set(assets)

def build():
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    files = {ROOT / p for p in publication_inputs()}
    records = []
    for source in sorted(files):
        if source.is_symlink() or not source.is_file() or not source.resolve().is_relative_to(ROOT.resolve()):
            raise ValueError(f'Invalid publication input: {source}')
        relative = source.relative_to(ROOT)
        destination = OUTPUT / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
        records.append({'path': relative.as_posix(), 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'bytes': source.stat().st_size})
    (OUTPUT / '.nojekyll').touch()
    report = Path(os.environ.get('CALC_REVIEW_DIR', ROOT / '.review/2026-10-12')) / 'public-manifest.json'
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps(records, indent=2) + '\n')
    assert {p.relative_to(OUTPUT).as_posix() for p in OUTPUT.rglob('*') if p.is_file()} == publication_inputs() | {'.nojekyll'}
    print(f'Public build: {len(records)} files, {sum(x["bytes"] for x in records):,} bytes; scripts, tests and internal records excluded.')

if __name__ == '__main__':
    build()
