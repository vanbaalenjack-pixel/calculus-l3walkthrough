#!/usr/bin/env python3
"""Check the actual release artifact, including runtime comments and metadata."""
from pathlib import Path
import json
import os
import runpy
import re

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '_site'
TEXT = {'.html', '.js', '.css', '.json', '.svg', '.xml', '.txt', '.map'}
TERMS = re.compile(r'\b(?:artificial intelligence|AI[ -](?:assistant|assisted|generated|powered)|OpenAI|ChatGPT|Codex|Anthropic|Claude|Gemini|Copilot|DALL[ -]?E|Midjourney|DeepSeek|Grok|Perplexity|Mistral|LLaMA|Stable[ -]Diffusion|Google Bard|A\.I\.|GPT(?:-?\d+)?|LLMs?|(?:large |generative )?language models?|machine[ -]generated|software[ -]development tools|technical implementation created with|development prompt)\b', re.I)
UPPER_AI = re.compile(r'\bAI\b')
DEV_REFERENCE = re.compile(r'/Users/|/home/|\.codex/|\.agents/')
FORBIDDEN_PATHS = re.compile(r'(^|/)(?:scripts|tests?|\.review|tmp|node_modules|\.github)(/|$)|\.(?:swift|py|m|md|ya?ml|toml|map)$')

def check():
    files = [p for p in OUTPUT.rglob('*') if p.is_file()]
    failures, mathematical_ai, checked = [], [], []
    inputs = runpy.run_path(str(ROOT / 'scripts/build-public.py'))['publication_inputs']()
    actual = {p.relative_to(OUTPUT).as_posix() for p in files}
    expected = inputs | {'.nojekyll'}
    if actual != expected:
        failures.append({'reason': 'artifact differs from publication allowlist',
                         'missing': sorted(expected - actual), 'unexpected': sorted(actual - expected)})
    for name in inputs & actual:
        if (ROOT / name).read_bytes() != (OUTPUT / name).read_bytes():
            failures.append({'path': name, 'reason': 'stale artifact content'})
    for p in files:
        name = p.relative_to(OUTPUT).as_posix()
        if FORBIDDEN_PATHS.search(name):
            failures.append({'path': name, 'reason': 'development file in publication'})
        if p.suffix not in TEXT and p.name not in {'CNAME', 'LICENSE', '.nojekyll'}:
            continue
        checked.append(name)
        content = p.read_text()
        for line_number, line in enumerate(content.splitlines(), 1):
            hit = TERMS.search(line) or UPPER_AI.search(line) or DEV_REFERENCE.search(line)
            if hit:
                failures.append({'path': name, 'line': line_number, 'match': hit.group()})
            if re.search(r'\bai\b', line):
                mathematical_ai.append({'path': name, 'line': line_number})
    result = {'textFilesChecked': len(checked), 'allPublicFiles': len(files),
              'scope': 'Complete _site text assets, metadata, comments and notices; no source maps published. Binary image pixel data and unrelated third-party sites are outside terminology scope.',
              'failures': failures, 'lowercaseAiOccurrencesForReview': mathematical_ai}
    report = Path(os.environ.get('CALC_REVIEW_DIR', ROOT / '.review/2026-10-12'))
    report.mkdir(parents=True, exist_ok=True)
    (report / 'public-scan.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k != 'lowercaseAiOccurrencesForReview'}))
    if failures:
        raise SystemExit(1)

if __name__ == '__main__':
    check()
