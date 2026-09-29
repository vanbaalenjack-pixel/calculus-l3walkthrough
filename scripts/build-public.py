#!/usr/bin/env python3
"""Assemble only runtime website files; never publish the source directory."""
from pathlib import Path
import hashlib
import json
import re
import shutil
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '_site'

def build():
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    pages = {urlsplit(e.text).path.lstrip('/') or 'index.html'
             for e in ET.parse(ROOT / 'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
    pages |= {'404.html', 'integration-2017.html', 'integration-2019.html',
              'integration-2020.html', 'differentiation-2020.html'}
    runtime = {'style.css', 'question-catalogue.js', 'walkthrough-gate.js',
               'walkthrough-audit-data.js', 'site-shell.js', 'index-loader.js',
               'index-page.js', 'search-core.js', 'search-page.js',
               'complex-walkthrough.js', 'differentiation-walkthrough.js',
               'algebra-walkthrough.js', 'favicon.ico', 'CNAME', 'robots.txt', 'sitemap.xml'}
    # Per-paper content files are runtime inputs referenced by the page shells.
    for name in pages:
        for src in re.findall(r'<script[^>]+src=["\']([^"\']+)', (ROOT / name).read_text()):
            path = urlsplit(src).path
            if not urlsplit(src).netloc and path.endswith('-data.js'):
                runtime.add(path)
    files = {ROOT / p for p in pages | runtime}
    asset_suffixes = {'.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.css', '.js'}
    files |= {p for p in (ROOT / 'assets').rglob('*') if p.is_file() and
              (p.suffix in asset_suffixes or p.name == 'LICENSE')}
    records = []
    for source in sorted(files):
        if source.is_symlink() or not source.is_file():
            raise ValueError(f'Invalid publication input: {source}')
        relative = source.relative_to(ROOT)
        destination = OUTPUT / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
        records.append({'path': relative.as_posix(), 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'bytes': source.stat().st_size})
    (OUTPUT / '.nojekyll').touch()
    report = ROOT / '.review/2026-09-24/public-manifest.json'
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps(records, indent=2) + '\n')
    assert not any((OUTPUT / name).exists() for name in ['scripts', '.review', 'tmp', 'AUDIT_REMEDIATION.md', 'HOSTING_MIGRATION.md', '.github'])
    print(f'Public build: {len(records)} files, {sum(x["bytes"] for x in records):,} bytes; scripts, tests and internal records excluded.')

if __name__ == '__main__':
    build()
