#!/usr/bin/env python3
"""Focused contract test for extract-walkthrough-content.swift."""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys


ROOT = Path(__file__).resolve().parent.parent
EXTRACTOR = ROOT / "scripts" / "extract-walkthrough-content.swift"
EXPECTED_ROUTE_COUNT = 447
EXPECTED_QUERY_COUNT = 120
EXPECTED_EXTERNAL_COUNT = 420
EXPECTED_INLINE_COUNT = 27
DIGEST_PATTERN = re.compile(r"^sha256:[0-9a-f]{64}$")


def fail(message: str) -> None:
    raise AssertionError(message)


def run_extractor() -> tuple[dict[str, dict[str, object]], bytes]:
    environment = os.environ.copy()
    cache = "/tmp/calc-nz-swift-module-cache"
    environment.setdefault("CLANG_MODULE_CACHE_PATH", cache)
    environment.setdefault("SWIFT_MODULE_CACHE_PATH", cache)
    process = subprocess.run(
        ["swift", str(EXTRACTOR), "--root", str(ROOT)],
        cwd=ROOT,
        env=environment,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if process.returncode:
        sys.stderr.buffer.write(process.stderr)
        fail(f"extractor exited with status {process.returncode}")
    try:
        parsed = json.loads(process.stdout)
    except json.JSONDecodeError as error:
        fail(f"extractor stdout was not JSON: {error}")
    if not isinstance(parsed, dict):
        fail("extractor output must be an object keyed by logical route")
    return parsed, process.stdout


def require_text(value: object, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        fail(f"{label} must be a non-empty string")
    return value


def validate_record(route: str, record: object) -> None:
    if not isinstance(record, dict):
        fail(f"{route}: record must be an object")
    require_text(record.get("questionHtml"), f"{route}: questionHtml")
    require_text(record.get("standardId"), f"{route}: standardId")
    require_text(record.get("paperId"), f"{route}: paperId")
    require_text(record.get("questionId"), f"{route}: questionId")
    require_text(record.get("pageFile"), f"{route}: pageFile")
    require_text(record.get("configSource"), f"{route}: configSource")
    digest = require_text(record.get("sourceDigest"), f"{route}: sourceDigest")
    if not DIGEST_PATTERN.fullmatch(digest):
        fail(f"{route}: invalid source digest {digest!r}")
    support = record.get("firstSupport")
    if not isinstance(support, dict) or support.get("kind") not in {"focus", "tip", "hint"}:
        fail(f"{route}: firstSupport has an invalid kind")
    require_text(support.get("html"), f"{route}: firstSupport.html")
    step = record.get("firstGuidedStep")
    if not isinstance(step, dict):
        fail(f"{route}: firstGuidedStep must be an object")
    for field in ("title", "previewHtml", "workingHtml"):
        require_text(step.get(field), f"{route}: firstGuidedStep.{field}")
    if not isinstance(record.get("hasAfterRender"), bool):
        fail(f"{route}: hasAfterRender must be boolean")
    rendered_count = record.get("renderedQuestionElementCount")
    if not isinstance(rendered_count, int) or isinstance(rendered_count, bool) or rendered_count < 0:
        fail(f"{route}: renderedQuestionElementCount must be a non-negative integer")
    if re.search(r"<svg\b[^>]*>\s*</svg>", str(record.get("questionHtml", "")), flags=re.I):
        fail(f"{route}: questionHtml contains an empty SVG after static rendering")


def assert_contains(record: dict[str, object], field_path: tuple[str, ...], needle: str) -> None:
    value: object = record
    for field in field_path:
        if not isinstance(value, dict):
            fail(f"{'.'.join(field_path)} is not present")
        value = value.get(field)
    text = require_text(value, ".".join(field_path))
    if needle.casefold() not in text.casefold():
        fail(f"Expected {needle!r} in {'.'.join(field_path)}")


def validate() -> None:
    records, raw_output = run_extractor()
    repeated_records, repeated_output = run_extractor()
    if raw_output != repeated_output or records != repeated_records:
        fail("identical source inputs did not produce byte-identical JSON")
    if len(records) != EXPECTED_ROUTE_COUNT:
        fail(f"expected {EXPECTED_ROUTE_COUNT} routes, found {len(records)}")

    query_routes = [route for route in records if "?" in route]
    external = [record for record in records.values() if str(record.get("configSource", "")).endswith("-data.js")]
    inline = [record for record in records.values() if str(record.get("configSource", "")).endswith("#inline-config")]
    if len(query_routes) != EXPECTED_QUERY_COUNT:
        fail(f"expected {EXPECTED_QUERY_COUNT} query routes, found {len(query_routes)}")
    if len(external) != EXPECTED_EXTERNAL_COUNT:
        fail(f"expected {EXPECTED_EXTERNAL_COUNT} external records, found {len(external)}")
    if len(inline) != EXPECTED_INLINE_COUNT:
        fail(f"expected {EXPECTED_INLINE_COUNT} inline records, found {len(inline)}")

    for route, record in records.items():
        validate_record(route, record)

    old_complex = records["complex-2024.html?q=2e"]
    if old_complex["questionId"] != "2e" or old_complex["configSource"] != "complex-2024-data.js":
        fail("older parameterised Complex Numbers route did not retain its exact config identity")
    assert_contains(old_complex, ("questionHtml",), "locus")
    assert_contains(old_complex, ("firstGuidedStep", "title"), "locus")

    static_complex = records["complex-1a2025.html"]
    if static_complex["configSource"] != "complex-2025-data.js":
        fail("2025 static Complex Numbers route did not use its external config")
    assert_contains(static_complex, ("questionHtml",), "x-2")

    differentiation_inline = records["1a2022.html"]
    if differentiation_inline["configSource"] != "1a2022.html#inline-config":
        fail("2022 Differentiation route was not extracted from inline config")
    assert_contains(differentiation_inline, ("firstGuidedStep", "title"), "differentiation rule")

    level_two_inline = records["1a2025-l2.html"]
    if level_two_inline["configSource"] != "1a2025-l2.html#inline-config":
        fail("2025 Level 2 Calculus route was not extracted from inline config")
    assert_contains(level_two_inline, ("questionHtml",), "gradient")

    after_render = records["int-1d2025.html"]
    if after_render["hasAfterRender"] is not True:
        fail("representative diagram walkthrough lost afterRender presence")
    if after_render["renderedQuestionElementCount"] != 1:
        fail("representative diagram walkthrough did not pre-render its initial SVG")
    assert_contains(after_render, ("questionHtml",), "question-curve")

    rendered_routes = [
        record for record in records.values()
        if int(record.get("renderedQuestionElementCount", 0)) > 0
    ]
    if len(rendered_routes) != 45:
        fail(f"expected 45 question-diagram routes to be statically rendered, found {len(rendered_routes)}")

    screenshot_sources = {
        "complex-2019-data.js",
        "complex-2020-data.js",
        "integration-2019-data.js",
        "integration-2020-data.js",
    }
    transcribed_by_source = {source: 0 for source in screenshot_sources}
    for route, record in records.items():
        source = str(record.get("configSource", ""))
        if source not in screenshot_sources:
            continue
        question_html = require_text(record.get("questionHtml"), f"{route}: questionHtml")
        if "data-question-transcription" not in question_html:
            fail(f"{route}: screenshot prompt has no authored text transcription")
        if "text transcription follows" not in question_html:
            fail(f"{route}: screenshot alt does not identify the adjacent transcription")
        if "the mathematical expression shown" in question_html:
            fail(f"{route}: screenshot prompt retained a generic mathematical alt")
        transcribed_by_source[source] += 1
    if set(transcribed_by_source.values()) != {15}:
        fail(
            "expected 15 transcribed screenshot prompts per assigned source, found "
            + repr(transcribed_by_source)
        )

    # The extractor hashes exact source bytes. Check both provenance modes independently.
    external_digest = "sha256:" + hashlib.sha256((ROOT / "complex-2024-data.js").read_bytes()).hexdigest()
    inline_digest = "sha256:" + hashlib.sha256((ROOT / "1a2022.html").read_bytes()).hexdigest()
    if old_complex["sourceDigest"] != external_digest:
        fail("external sourceDigest does not match complex-2024-data.js")
    if differentiation_inline["sourceDigest"] != inline_digest:
        fail("inline sourceDigest does not match 1a2022.html")

    print(
        "Walkthrough extractor validation passed: "
        f"{len(records)} routes ({len(query_routes)} query, "
        f"{len(external)} external, {len(inline)} inline), "
        f"{len(raw_output)} JSON bytes."
    )


if __name__ == "__main__":
    try:
        validate()
    except (AssertionError, KeyError) as error:
        print(f"walkthrough extractor validation failed: {error}", file=sys.stderr)
        raise SystemExit(1)
