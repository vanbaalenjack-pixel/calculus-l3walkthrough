#!/usr/bin/env python3
"""Dependency-free structural audit for Calc.nz.

The 447 question cards in ``index.html`` are the route and ownership source of
truth.  This audit deliberately checks generated landing pages and walkthrough
sources against that catalogue instead of maintaining a second list of every
question URL.

Run from any directory::

    python3 scripts/audit-site-structure.py

The checks here focus on the information architecture and the post-migration
guided-solution contract.  Browser behaviour and responsive layout remain the
responsibility of the WebKit smoke tests.
"""

from __future__ import annotations

import html
import os
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable, Mapping, Sequence
from urllib.parse import parse_qs, unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
INDEX_FILE = ROOT / "index.html"

EXPECTED_LOGICAL_ROUTE_COUNT = 447
EXPECTED_PHYSICAL_WALKTHROUGH_COUNT = 335
EXPECTED_STANDARD_COUNT = 5
EXPECTED_YEAR_PAGE_COUNT = 30
EXPECTED_DATA_FILE_COUNT = 28

FULL_PARTS = tuple(f"{number}{letter}" for number in "123" for letter in "abcde")
L2_CALCULUS_PARTS = tuple(f"{number}{letter}" for number in "123" for letter in "abcd")


@dataclass(frozen=True)
class StandardSpec:
    """Stable standard-level facts; question routes still come from index.html."""

    key: str
    public_slug: str
    years: tuple[int, ...]
    parts: tuple[str, ...]

    @property
    def standard_file(self) -> str:
        return f"{self.public_slug}.html"

    def year_file(self, year: int) -> str:
        return f"{self.public_slug}-{year}.html"


STANDARD_SPECS: tuple[StandardSpec, ...] = (
    StandardSpec("level-2-calculus", "level-2-calculus", (2025,), L2_CALCULUS_PARTS),
    StandardSpec("level-2-algebra", "level-2-algebra", (2025,), FULL_PARTS),
    StandardSpec(
        "level-3-complex",
        "level-3-complex-numbers",
        tuple(range(2017, 2026)),
        FULL_PARTS,
    ),
    StandardSpec(
        "level-3-differentiation",
        "level-3-differentiation",
        tuple(range(2016, 2026)),
        FULL_PARTS,
    ),
    StandardSpec(
        "level-3-integration",
        "level-3-integration",
        tuple(range(2017, 2026)),
        FULL_PARTS,
    ),
)
SPEC_BY_KEY = {spec.key: spec for spec in STANDARD_SPECS}


@dataclass(frozen=True)
class QuestionRoute:
    standard_key: str
    year: int
    part: str
    href: str
    logical_route: str
    source_file: str

    @property
    def paper_id(self) -> str:
        return f"{self.standard_key}-{self.year}"


class Failures:
    def __init__(self) -> None:
        self.items: list[str] = []

    def add(self, message: str) -> None:
        self.items.append(message)

    def extend(self, messages: Iterable[str]) -> None:
        self.items.extend(messages)

    def check(self, condition: bool, message: str) -> None:
        if not condition:
            self.add(message)


class IndexCatalogueParser(HTMLParser):
    """Collect question-card hrefs while retaining their paper-panel owner."""

    VOID_TAGS = {
        "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "param", "source", "track", "wbr",
    }

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.paper_panel: str | None = None
        self.stack: list[tuple[str, str | None]] = []
        self.cards: list[tuple[str, str, int]] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        tag = tag.lower()
        values = {name.lower(): value or "" for name, value in attrs}
        previous_panel = self.paper_panel
        declared_panel = values.get("data-paper-panel", "").strip()
        if declared_panel:
            self.paper_panel = declared_panel

        if tag == "a" and self.paper_panel:
            classes = set(values.get("class", "").split())
            href = html.unescape(values.get("href", "").strip())
            if "index-link-card" in classes and href:
                self.cards.append((self.paper_panel, href, self.getpos()[0]))

        if tag not in self.VOID_TAGS:
            self.stack.append((tag, previous_panel))

    def handle_startendtag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        self.handle_starttag(tag, attrs)
        if tag.lower() not in self.VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        match = next(
            (
                index
                for index in range(len(self.stack) - 1, -1, -1)
                if self.stack[index][0] == tag
            ),
            None,
        )
        if match is None:
            return
        previous_panel = self.stack[match][1]
        del self.stack[match:]
        self.paper_panel = previous_panel


class PageLinkParser(HTMLParser):
    """Small page inventory used for standard and year landing pages."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.links: list[tuple[str, frozenset[str], int]] = []
        self.ids: set[str] = set()
        self.id_lines: dict[str, list[int]] = defaultdict(list)
        self.script_sources: list[tuple[str, int]] = []
        self.references: list[tuple[str, str, str, int]] = []
        self.aria_references: list[tuple[str, str, int]] = []
        self.anchors_without_href: list[int] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        tag = tag.lower()
        values = {name.lower(): value or "" for name, value in attrs}
        element_id = values.get("id", "").strip()
        if element_id:
            self.ids.add(element_id)
            self.id_lines[element_id].append(self.getpos()[0])
        if tag == "a":
            if not any(name.lower() == "href" for name, _value in attrs):
                self.anchors_without_href.append(self.getpos()[0])
            self.links.append(
                (
                    html.unescape(values.get("href", "").strip()),
                    frozenset(values.get("class", "").split()),
                    self.getpos()[0],
                )
            )
        if tag == "script" and values.get("src", "").strip():
            self.script_sources.append(
                (html.unescape(values["src"].strip()), self.getpos()[0])
            )
        for attribute in ("href", "src", "action"):
            if any(name.lower() == attribute for name, _value in attrs):
                self.references.append(
                    (
                        tag,
                        attribute,
                        html.unescape(values.get(attribute, "").strip()),
                        self.getpos()[0],
                    )
                )
        for attribute in ("aria-controls", "aria-labelledby"):
            value = values.get(attribute, "").strip()
            if value:
                self.aria_references.append(
                    (attribute, html.unescape(value), self.getpos()[0])
                )


def read_text(path: Path, failures: Failures) -> str | None:
    try:
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as error:
        failures.add(f"{path.name}: cannot read UTF-8 source ({error})")
        return None


def parse_html(path: Path, source: str, failures: Failures) -> PageLinkParser | None:
    parser = PageLinkParser()
    try:
        parser.feed(source)
        parser.close()
    except Exception as error:
        failures.add(f"{path.name}: HTML parse error ({error})")
        return None
    return parser


def split_paper_id(paper_id: str) -> tuple[StandardSpec, int] | None:
    for spec in sorted(STANDARD_SPECS, key=lambda item: len(item.key), reverse=True):
        prefix = spec.key + "-"
        if not paper_id.startswith(prefix):
            continue
        year_text = paper_id[len(prefix) :]
        if re.fullmatch(r"20\d{2}", year_text):
            return spec, int(year_text)
    return None


def normalise_logical_route(href: str) -> str:
    parsed = urlsplit(html.unescape(href.strip()))
    path = unquote(parsed.path).lstrip("/")
    return path + ("?" + parsed.query if parsed.query else "")


def derive_part(spec: StandardSpec, year: int, href: str) -> str | None:
    parsed = urlsplit(href)
    path = unquote(parsed.path).lstrip("/")
    query = parse_qs(parsed.query, keep_blank_values=True)

    if spec.key == "level-3-complex" and year < 2025:
        if path != f"complex-{year}.html" or set(query) != {"q"}:
            return None
        values = query.get("q", [])
        return values[0].lower() if len(values) == 1 else None

    if query:
        return None

    patterns = {
        "level-2-calculus": rf"([1-3][a-d]){year}-l2\.html",
        "level-2-algebra": rf"alg-([1-3][a-e]){year}-l2\.html",
        "level-3-complex": rf"complex-([1-3][a-e]){year}\.html",
        "level-3-differentiation": rf"([1-3][a-e]){year}\.html",
        "level-3-integration": rf"int-([1-3][a-e]){year}\.html",
    }
    match = re.fullmatch(patterns[spec.key], path, flags=re.I)
    return match.group(1).lower() if match else None


def discover_routes(failures: Failures) -> list[QuestionRoute]:
    source = read_text(INDEX_FILE, failures)
    if source is None:
        return []

    parser = IndexCatalogueParser()
    try:
        parser.feed(source)
        parser.close()
    except Exception as error:
        failures.add(f"index.html: catalogue parse error ({error})")
        return []

    failures.check(
        len(parser.cards) == EXPECTED_LOGICAL_ROUTE_COUNT,
        f"index.html: expected {EXPECTED_LOGICAL_ROUTE_COUNT} question cards, "
        f"found {len(parser.cards)}",
    )

    routes: list[QuestionRoute] = []
    parts_by_paper: dict[str, list[str]] = defaultdict(list)
    seen_panels: set[str] = set()

    for paper_id, href, line in parser.cards:
        ownership = split_paper_id(paper_id)
        if ownership is None:
            failures.add(
                f"index.html:{line}: question card belongs to unsupported paper panel "
                f"{paper_id!r}"
            )
            continue
        spec, year = ownership
        seen_panels.add(paper_id)

        if year not in spec.years:
            failures.add(
                f"index.html:{line}: {paper_id} has unexpected year {year} for {spec.key}"
            )

        part = derive_part(spec, year, href)
        if part is None or part not in spec.parts:
            failures.add(
                f"index.html:{line}: {href!r} does not match {spec.key} {year} ownership"
            )
            continue

        logical_route = normalise_logical_route(href)
        source_file = unquote(urlsplit(href).path).lstrip("/")
        if not source_file or not (ROOT / source_file).is_file():
            failures.add(f"index.html:{line}: walkthrough target is missing: {href!r}")

        route = QuestionRoute(
            standard_key=spec.key,
            year=year,
            part=part,
            href=href,
            logical_route=logical_route,
            source_file=source_file,
        )
        routes.append(route)
        parts_by_paper[paper_id].append(part)

    expected_papers = {
        f"{spec.key}-{year}" for spec in STANDARD_SPECS for year in spec.years
    }
    failures.check(
        seen_panels == expected_papers,
        "index.html: paper panels differ from the expected 30 standard/year owners "
        f"(missing={sorted(expected_papers - seen_panels)}, "
        f"unexpected={sorted(seen_panels - expected_papers)})",
    )

    for paper_id in sorted(expected_papers):
        ownership = split_paper_id(paper_id)
        assert ownership is not None
        spec, _year = ownership
        actual = parts_by_paper.get(paper_id, [])
        duplicates = sorted(part for part, count in Counter(actual).items() if count > 1)
        if duplicates:
            failures.add(f"index.html: {paper_id} has duplicate parts: {duplicates}")
        if set(actual) != set(spec.parts):
            failures.add(
                f"index.html: {paper_id} part ownership mismatch "
                f"(missing={sorted(set(spec.parts) - set(actual))}, "
                f"unexpected={sorted(set(actual) - set(spec.parts))})"
            )

    logical_routes = [route.logical_route for route in routes]
    duplicate_routes = sorted(
        route for route, count in Counter(logical_routes).items() if count > 1
    )
    if duplicate_routes:
        failures.add(
            "index.html: duplicate logical walkthrough routes: "
            + ", ".join(duplicate_routes[:8])
        )

    physical_files = {route.source_file for route in routes}
    failures.check(
        len(routes) == EXPECTED_LOGICAL_ROUTE_COUNT,
        f"index.html: derived {len(routes)} valid logical routes, expected "
        f"{EXPECTED_LOGICAL_ROUTE_COUNT}",
    )
    failures.check(
        len(physical_files) == EXPECTED_PHYSICAL_WALKTHROUGH_COUNT,
        f"index.html: derived {len(physical_files)} physical walkthrough files, expected "
        f"{EXPECTED_PHYSICAL_WALKTHROUGH_COUNT}",
    )
    return routes


def audit_standard_pages(routes: Sequence[QuestionRoute], failures: Failures) -> None:
    all_year_files = {
        spec.year_file(year) for spec in STANDARD_SPECS for year in spec.years
    }
    logical_routes = {route.logical_route for route in routes}

    failures.check(
        len(STANDARD_SPECS) == EXPECTED_STANDARD_COUNT,
        f"audit catalogue: expected {EXPECTED_STANDARD_COUNT} standards",
    )

    for spec in STANDARD_SPECS:
        path = ROOT / spec.standard_file
        source = read_text(path, failures)
        if source is None:
            continue
        parser = parse_html(path, source, failures)
        if parser is None:
            continue

        lowered = source.casefold()
        if "complete walkthrough directory" in lowered:
            failures.add(f"{path.name}: obsolete Complete walkthrough directory remains")
        if "all-walkthroughs" in lowered:
            failures.add(
                f"{path.name}: obsolete all-walkthroughs fragment/id reference remains"
            )

        expected_year_files = {spec.year_file(year) for year in spec.years}
        linked_year_files: list[str] = []
        direct_question_links: list[str] = []
        for href, _classes, _line in parser.links:
            parsed = urlsplit(href)
            local_path = unquote(parsed.path).lstrip("/")
            if local_path in all_year_files:
                linked_year_files.append(local_path)
            if normalise_logical_route(href) in logical_routes:
                direct_question_links.append(href)

        counts = Counter(linked_year_files)
        missing = sorted(expected_year_files - set(counts))
        unexpected = sorted(set(counts) - expected_year_files)
        duplicates = sorted(name for name, count in counts.items() if count != 1)
        if missing or unexpected or duplicates:
            failures.add(
                f"{path.name}: year links must contain each owned year exactly once "
                f"(missing={missing}, unexpected={unexpected}, repeated={duplicates})"
            )
        if direct_question_links:
            failures.add(
                f"{path.name}: standard page still links directly to walkthroughs "
                f"(first: {direct_question_links[0]!r})"
            )


def audit_year_pages(routes: Sequence[QuestionRoute], failures: Failures) -> None:
    by_paper: dict[str, list[QuestionRoute]] = defaultdict(list)
    for route in routes:
        by_paper[route.paper_id].append(route)

    all_expected_routes = {route.logical_route for route in routes}
    collective_counts: Counter[str] = Counter()
    visited_pages = 0

    for spec in STANDARD_SPECS:
        for year in spec.years:
            visited_pages += 1
            paper_id = f"{spec.key}-{year}"
            path = ROOT / spec.year_file(year)
            source = read_text(path, failures)
            if source is None:
                continue
            parser = parse_html(path, source, failures)
            if parser is None:
                continue

            card_routes = [
                normalise_logical_route(href)
                for href, classes, _line in parser.links
                if "index-link-card" in classes
            ]
            counts = Counter(card_routes)
            expected = {route.logical_route for route in by_paper.get(paper_id, [])}
            missing = sorted(expected - set(counts))
            unexpected = sorted(set(counts) - expected)
            duplicates = sorted(route for route, count in counts.items() if count != 1)
            if missing or unexpected or duplicates:
                failures.add(
                    f"{path.name}: question cards do not exactly match {paper_id} ownership "
                    f"(missing={missing[:4]}, unexpected={unexpected[:4]}, "
                    f"repeated={duplicates[:4]})"
                )
            collective_counts.update(card_routes)

    failures.check(
        visited_pages == EXPECTED_YEAR_PAGE_COUNT,
        f"audit catalogue: expected {EXPECTED_YEAR_PAGE_COUNT} year pages, found {visited_pages}",
    )
    missing_collective = sorted(all_expected_routes - set(collective_counts))
    unexpected_collective = sorted(set(collective_counts) - all_expected_routes)
    repeated_collective = sorted(
        route for route, count in collective_counts.items() if count != 1
    )
    if missing_collective or unexpected_collective or repeated_collective:
        failures.add(
            "year pages: collective question directory must contain all 447 logical routes "
            "exactly once "
            f"(missing={missing_collective[:4]}, unexpected={unexpected_collective[:4]}, "
            f"repeated={repeated_collective[:4]})"
        )


CURRENT_INITIALIZERS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("progressive", re.compile(r"\binitializeProgressiveWalkthrough\s*\(")),
    ("algebra wrapper", re.compile(r"\binitializeAlgebraWalkthrough\s*\(")),
    ("complex wrapper", re.compile(r"\binitializeComplexWalkthrough\s*\(")),
    (
        "differentiation/integration wrapper",
        re.compile(r"\binitializeDifferentiationWalkthrough\s*\("),
    ),
)

FORBIDDEN_CONTROL_IDENTIFIER = re.compile(
    r"(?:^|[-_])(?:"
    r"option-btn|answer-option|choice-btn|choice-card|multiple-choice|"
    r"answer-input|answer-entry|answer-preview|feedback|check-answer|try-again|"
    r"legacy-next|next-step-btn"
    r")(?:$|[-_])",
    flags=re.I,
)

FORBIDDEN_INLINE_CODE: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("legacy initializer", re.compile(r"\binitializeWalkthroughGate\s*\(")),
    (
        "typed-answer binding",
        re.compile(
            r"\b(?:bindMathInputCheck|checkTypedStep|setupMathInputPreview)\s*\("
        ),
    ),
    (
        "legacy validation helper",
        re.compile(
            r"\b(?:setFeedback|toggleNextStepButton|checkTypedAnswer|"
            r"checkEquivalentAnswer|normaliseMathInput|parseMathExpression|"
            r"compileMathExpression)\s*\("
        ),
    ),
    (
        "legacy assessment function",
        re.compile(
            r"\bfunction\s+(?:check[A-Z_a-z0-9]*|tryAgain|nextStep|"
            r"selectAnswer|selectOption|showFeedback)\s*\("
        ),
    ),
    (
        "legacy assigned assessment handler",
        re.compile(
            r"\b(?:const|let|var)\s+(?:check[A-Za-z0-9_]*|tryAgain|"
            r"selectAnswer|selectOption|showFeedback)\s*="
        ),
    ),
    (
        "legacy assessment handler",
        re.compile(
            r"\bon(?:click|change|input)\s*=\s*['\"][^'\"]*"
            r"(?:check[A-Za-z0-9_]*|tryAgain|nextStep|selectAnswer|"
            r"selectOption|showFeedback)\b",
            flags=re.I,
        ),
    ),
)


def line_number(source: str, offset: int) -> int:
    return source.count("\n", 0, offset) + 1


def attribute_value(tag: str, name: str) -> str:
    match = re.search(
        rf"\b{re.escape(name)}\s*=\s*(['\"])(.*?)\1", tag, flags=re.I | re.S
    )
    return html.unescape(match.group(2)).strip() if match else ""


def audit_walkthrough_controls(
    filename: str, source: str, failures: Failures
) -> None:
    findings: list[str] = []
    input_hits: list[tuple[int, str]] = []
    for match in re.finditer(r"<input\b[^>]*>", source, flags=re.I | re.S):
        tag = match.group(0)
        input_type = attribute_value(tag, "type").casefold() or "text"
        element_id = attribute_value(tag, "id").casefold()
        # The surviving interactive inputs are graph sliders/toggles. Hidden
        # inputs are non-assessment implementation details. A checkbox or range
        # input without the established graph-control naming is treated as an
        # assessment control, so answer checkboxes cannot slip through.
        is_graph_control = (
            input_type == "range" and element_id.endswith("-slider")
        ) or (
            input_type == "checkbox" and element_id.endswith("-toggle")
        )
        if input_type != "hidden" and not is_graph_control:
            input_hits.append((line_number(source, match.start()), input_type))
    if input_hits:
        examples = ", ".join(
            f"{input_type}@{line}" for line, input_type in input_hits[:5]
        )
        findings.append(
            f"assessment inputs ({len(input_hits)} occurrence(s); {examples})"
        )

    tag_hits: list[tuple[int, str]] = []
    for tag_name in ("textarea", "select", "option", "form"):
        for match in re.finditer(rf"<{tag_name}\b", source, flags=re.I):
            tag_hits.append((line_number(source, match.start()), tag_name))
    if tag_hits:
        examples = ", ".join(f"<{tag}>@{line}" for line, tag in tag_hits[:5])
        findings.append(
            f"assessment elements ({len(tag_hits)} occurrence(s); {examples})"
        )

    identifier_hits: list[tuple[int, str]] = []
    for match in re.finditer(
        r"\b(?:id|class)\s*=\s*(['\"])(.*?)\1", source, flags=re.I | re.S
    ):
        identifiers = re.split(r"\s+", html.unescape(match.group(2)).strip())
        forbidden = next(
            (value for value in identifiers if FORBIDDEN_CONTROL_IDENTIFIER.search(value)),
            None,
        )
        if forbidden:
            identifier_hits.append((line_number(source, match.start()), forbidden))
    if identifier_hits:
        examples = ", ".join(
            f"{identifier}@{line}" for line, identifier in identifier_hits[:5]
        )
        findings.append(
            f"obsolete identifiers ({len(identifier_hits)} occurrence(s); {examples})"
        )

    code_hits: list[tuple[int, str]] = []
    for label, pattern in FORBIDDEN_INLINE_CODE:
        match = pattern.search(source)
        if match:
            code_hits.append((line_number(source, match.start()), label))
    if code_hits:
        examples = ", ".join(f"{label}@{line}" for line, label in code_hits)
        findings.append(f"obsolete JavaScript ({examples})")

    button_hits: list[tuple[int, str]] = []
    for match in re.finditer(
        r"<button\b[^>]*>(.*?)</button>", source, flags=re.I | re.S
    ):
        text = re.sub(r"<[^>]+>", " ", match.group(1))
        text = re.sub(r"\s+", " ", html.unescape(text)).strip()
        if re.search(
            r"\b(?:check answer|try again|submit answer|validate answer)\b",
            text,
            flags=re.I,
        ):
            button_hits.append((line_number(source, match.start()), text))
    if button_hits:
        examples = ", ".join(f"{text!r}@{line}" for line, text in button_hits[:5])
        findings.append(
            f"assessment buttons ({len(button_hits)} occurrence(s); {examples})"
        )

    if findings:
        failures.add(
            f"{filename}: obsolete assessment controls/code remain: "
            + "; ".join(findings)
        )


def audit_walkthrough_pages(
    routes: Sequence[QuestionRoute], failures: Failures
) -> set[str]:
    physical_files = sorted({route.source_file for route in routes})
    failures.check(
        len(physical_files) == EXPECTED_PHYSICAL_WALKTHROUGH_COUNT,
        f"walkthrough audit: expected {EXPECTED_PHYSICAL_WALKTHROUGH_COUNT} physical files, "
        f"found {len(physical_files)}",
    )

    for filename in physical_files:
        path = ROOT / filename
        source = read_text(path, failures)
        if source is None:
            continue

        initializer_counts = {
            label: len(pattern.findall(source)) for label, pattern in CURRENT_INITIALIZERS
        }
        active_initializers = {
            label: count for label, count in initializer_counts.items() if count
        }
        total_initializers = sum(active_initializers.values())
        if total_initializers != 1:
            failures.add(
                f"{filename}: expected exactly one current guided initializer call, found "
                f"{active_initializers or 'none'}"
            )
        if active_initializers.get("progressive") and not re.search(
            r"\bguidedSteps\s*:", source
        ):
            failures.add(
                f"{filename}: direct initializeProgressiveWalkthrough call has no guidedSteps"
            )

        audit_walkthrough_controls(filename, source, failures)

    return set(physical_files)


FORBIDDEN_DATA_KEYS = re.compile(
    r"(?m)^\s*(?:"
    r"steps|acceptedAnswers|choices|options|correct|"
    r"failure[A-Za-z0-9_]*|targeted[A-Za-z0-9_]*|generic[A-Za-z0-9_]*"
    r")\s*:"
)
FORBIDDEN_DATA_HELPERS = re.compile(
    r"\b(?:function\s+)?(?:wrongChoice|correctChoice|choiceStep|inputStep|typedStep)\s*\("
)
FORBIDDEN_DATA_STEP_TYPE = re.compile(
    r"\btype\s*:\s*['\"](?:input|choice|typed|number|equation)['\"]",
    flags=re.I,
)


def audit_data_files(failures: Failures) -> set[str]:
    paths = sorted(path for path in ROOT.glob("*-data.js") if path.is_file())
    failures.check(
        len(paths) == EXPECTED_DATA_FILE_COUNT,
        f"data audit: expected {EXPECTED_DATA_FILE_COUNT} *-data.js files, found {len(paths)}",
    )

    for path in paths:
        source = read_text(path, failures)
        if source is None:
            continue
        if not re.search(r"\bguidedSteps\s*:", source):
            failures.add(f"{path.name}: no guidedSteps configuration is exposed")

        for label, pattern in (
            ("legacy validation key", FORBIDDEN_DATA_KEYS),
            ("legacy choice/input helper", FORBIDDEN_DATA_HELPERS),
            ("legacy assessment step type", FORBIDDEN_DATA_STEP_TYPE),
        ):
            match = pattern.search(source)
            if match:
                token = re.sub(r"\s+", " ", match.group(0)).strip()
                failures.add(
                    f"{path.name}:{line_number(source, match.start())}: {label} remains "
                    f"({token!r})"
                )

    return {path.name for path in paths}


@dataclass(frozen=True)
class GuidedCopyField:
    filename: str
    name: str
    value: str
    line: int


GUIDED_ARRAY_START = re.compile(r"\bguidedSteps\s*(?::|=)\s*\[")
GUIDED_FIELD_NAMES = {"title", "previewHtml", "workingHtml"}


def skip_js_string(source: str, start: int, limit: int) -> int:
    quote = source[start]
    index = start + 1
    while index < limit:
        if source[index] == "\\":
            index += 2
            continue
        if source[index] == quote:
            return index + 1
        index += 1
    return limit


def skip_js_space_and_comments(source: str, start: int, limit: int) -> int:
    index = start
    while index < limit:
        if source[index].isspace():
            index += 1
            continue
        if source.startswith("//", index):
            newline = source.find("\n", index + 2, limit)
            index = limit if newline < 0 else newline + 1
            continue
        if source.startswith("/*", index):
            close = source.find("*/", index + 2, limit)
            index = limit if close < 0 else close + 2
            continue
        break
    return index


def matching_js_array_end(source: str, opening: int) -> int | None:
    depth = 0
    index = opening
    limit = len(source)
    while index < limit:
        character = source[index]
        if character in "'\"`":
            index = skip_js_string(source, index, limit)
            continue
        if source.startswith("//", index) or source.startswith("/*", index):
            index = skip_js_space_and_comments(source, index, limit)
            continue
        if character == "[":
            depth += 1
        elif character == "]":
            depth -= 1
            if depth == 0:
                return index
        index += 1
    return None


def read_tagged_js_literal(
    source: str, start: int, limit: int
) -> tuple[str, int, int] | None:
    index = skip_js_space_and_comments(source, start, limit)
    for tag in ("String.raw", "raw"):
        if source.startswith(tag, index):
            after = index + len(tag)
            if after < limit and source[after] in "'\"`":
                index = after
                break
    if index >= limit or source[index] not in "'\"`":
        return None
    end = skip_js_string(source, index, limit)
    if end <= index + 1 or end > limit or source[end - 1] != source[index]:
        return None
    return source[index + 1 : end - 1], end, index


def extract_guided_fields(path: Path, source: str) -> list[GuidedCopyField]:
    fields: list[GuidedCopyField] = []
    two_literal_helper = bool(
        re.search(
            r"\bfunction\s+guidedStep\s*\(\s*title\s*,\s*workingHtml\s*,\s*extra\s*\)",
            source,
        )
    )
    for array_match in GUIDED_ARRAY_START.finditer(source):
        opening = source.find("[", array_match.start(), array_match.end())
        closing = matching_js_array_end(source, opening)
        if closing is None:
            continue
        index = opening + 1
        while index < closing:
            index = skip_js_space_and_comments(source, index, closing)
            if index >= closing:
                break
            if source[index] in "'\"`":
                index = skip_js_string(source, index, closing)
                continue
            identifier_match = re.match(r"[A-Za-z_$][A-Za-z0-9_$]*", source[index:])
            if identifier_match is None:
                index += 1
                continue
            identifier = identifier_match.group(0)
            after_identifier = index + len(identifier)
            next_token = skip_js_space_and_comments(
                source, after_identifier, closing
            )

            if identifier == "guidedStep" and source.startswith("(", next_token):
                argument_index = next_token + 1
                parsed_arguments: list[tuple[str, int]] = []
                argument_names = (
                    ("title", "workingHtml")
                    if two_literal_helper
                    else ("title", "previewHtml", "workingHtml")
                )
                for argument_name in argument_names:
                    literal = read_tagged_js_literal(
                        source, argument_index, closing
                    )
                    if literal is None:
                        break
                    value, argument_index, literal_start = literal
                    parsed_arguments.append((value, literal_start))
                    argument_index = skip_js_space_and_comments(
                        source, argument_index, closing
                    )
                    if argument_name != argument_names[-1]:
                        if argument_index >= closing or source[argument_index] != ",":
                            break
                        argument_index += 1
                if len(parsed_arguments) == len(argument_names):
                    for name, (value, literal_start) in zip(
                        argument_names, parsed_arguments
                    ):
                        fields.append(
                            GuidedCopyField(
                                path.name,
                                name,
                                value,
                                line_number(source, literal_start),
                            )
                        )
                    index = argument_index
                    continue

            if identifier in GUIDED_FIELD_NAMES and source.startswith(":", next_token):
                literal = read_tagged_js_literal(source, next_token + 1, closing)
                if literal is not None:
                    value, literal_end, literal_start = literal
                    fields.append(
                        GuidedCopyField(
                            path.name,
                            identifier,
                            value,
                            line_number(source, literal_start),
                        )
                    )
                    index = literal_end
                    continue
            index = after_identifier
    return fields


class GuidedTextParser(HTMLParser):
    """Extract learner copy while excluding legitimate graph-control content."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[tuple[str, bool]] = []
        self.excluded = False
        self.parts: list[str] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        values = {name.lower(): value or "" for name, value in attrs}
        classes = set(values.get("class", "").split())
        locally_excluded = tag.lower() in {"canvas", "script", "style", "svg"} or any(
            class_name.startswith("graph-") for class_name in classes
        )
        self.stack.append((tag.lower(), self.excluded))
        self.excluded = self.excluded or locally_excluded

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        match = next(
            (
                index
                for index in range(len(self.stack) - 1, -1, -1)
                if self.stack[index][0] == tag
            ),
            None,
        )
        if match is None:
            return
        self.excluded = self.stack[match][1]
        del self.stack[match:]

    def handle_data(self, data: str) -> None:
        if not self.excluded:
            self.parts.append(data)

    def text(self) -> str:
        return re.sub(r"\s+", " ", " ".join(self.parts)).strip()


TITLE_PREVIEW_QUIZ_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("question-style prompt", re.compile(r"\?")),
    (
        "answer/method selection prompt",
        re.compile(r"\b(?:choose|select|pick)\b", re.I),
    ),
    (
        "answer-entry prompt",
        re.compile(
            r"\b(?:enter|supply|submit)\b|\btype\s+(?:the|your|in|a|an|\()",
            re.I,
        ),
    ),
    ("retry prompt", re.compile(r"\btry\s+again\b", re.I)),
    (
        "answer-check prompt",
        re.compile(
            r"\bcheck\s+(?:your|the|this|an?)\s+"
            r"(?:answer|response|work|solution)\b",
            re.I,
        ),
    ),
)

WORKING_COPY_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    (
        "answer-entry/selection instruction",
        re.compile(
            r"(?:^|[.!?]\s+)(?:(?:please|now|next|then)\s+)?"
            r"(?:type|enter|select|submit|supply|choose|pick)\b",
            re.I,
        ),
    ),
    (
        "explicit answer/method selection",
        re.compile(
            r"\b(?:choose|select|pick)\s+(?:an?|the|your|which|correct|best)\s+"
            r"(?:answer|response|option|method|rule|approach)\b",
            re.I,
        ),
    ),
    (
        "answer check/retry instruction",
        re.compile(
            r"\btry\s+again\b|\bcheck\s+(?:your|the|this|an?)\s+"
            r"(?:answer|response|work|solution)\b",
            re.I,
        ),
    ),
    (
        "assessment-button instruction",
        re.compile(
            r"\b(?:click|press|tap)\s+(?:the\s+)?(?:check\s+answer|submit|try\s+again)\b",
            re.I,
        ),
    ),
)


def guided_plain_text(value: str) -> str:
    parser = GuidedTextParser()
    try:
        parser.feed(value)
        parser.close()
    except Exception:
        return re.sub(r"<[^>]+>", " ", html.unescape(value))
    return parser.text()


def audit_guided_copy(
    routes: Sequence[QuestionRoute], failures: Failures
) -> None:
    paths = {ROOT / route.source_file for route in routes}
    paths.update(ROOT.glob("*-data.js"))
    issues: list[str] = []
    audited_fields = 0

    for path in sorted(paths):
        source = read_text(path, failures)
        if source is None:
            continue
        for field in extract_guided_fields(path, source):
            audited_fields += 1
            text = guided_plain_text(field.value)
            if not text:
                issues.append(
                    f"{field.filename}:{field.line} {field.name} is empty"
                )
                continue
            patterns = (
                TITLE_PREVIEW_QUIZ_PATTERNS
                if field.name in {"title", "previewHtml"}
                else WORKING_COPY_PATTERNS
            )
            hit = next(
                (label for label, pattern in patterns if pattern.search(text)),
                None,
            )
            if hit:
                snippet = text[:120] + ("…" if len(text) > 120 else "")
                issues.append(
                    f"{field.filename}:{field.line} {field.name} has {hit}: {snippet!r}"
                )

    if not audited_fields:
        failures.add("guided-copy audit could not find any guided step fields")
    if issues:
        failures.add(
            f"guided-copy audit found {len(issues)} issue(s) across "
            f"{audited_fields} fields: "
            + "; ".join(issues[:24])
            + (f"; … {len(issues) - 24} more" if len(issues) > 24 else "")
        )


OBSOLETE_SHARED_TOKENS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("initializeWalkthroughGate", re.compile(r"\binitializeWalkthroughGate\b")),
    ("TypedMath", re.compile(r"\bTypedMath\b")),
    (".option-btn", re.compile(r"\.option-btn(?![A-Za-z0-9_-])")),
    (".check-btn", re.compile(r"\.check-btn(?![A-Za-z0-9_-])")),
    (".feedback", re.compile(r"\.feedback(?![A-Za-z0-9_-])")),
    (
        ".math-answer-input",
        re.compile(r"\.math-answer-input(?![A-Za-z0-9_-])"),
    ),
    (".legacy-*", re.compile(r"\.legacy-[A-Za-z0-9_-]*")),
)


def audit_shared_runtime_and_styles(failures: Failures) -> None:
    """Reject obsolete assessment APIs/selectors in shared root assets."""

    paths = sorted(
        list(ROOT.glob("*.css"))
        + [
            path
            for path in ROOT.glob("*.js")
            if not path.name.endswith("-data.js")
        ]
    )
    issues: list[str] = []
    for path in paths:
        source = read_text(path, failures)
        if source is None:
            continue
        for label, pattern in OBSOLETE_SHARED_TOKENS:
            matches = list(pattern.finditer(source))
            if matches:
                lines = [line_number(source, match.start()) for match in matches[:6]]
                issues.append(
                    f"{path.name}: obsolete {label} occurs {len(matches)} time(s) "
                    f"at lines {lines}"
                )
    if issues:
        failures.add(
            f"shared runtime/style audit found {len(issues)} obsolete token group(s): "
            + "; ".join(issues)
        )


def audit_typed_math_references(failures: Failures) -> None:
    references: list[tuple[str, int]] = []
    for path in sorted(ROOT.glob("*.html")):
        source = read_text(path, failures)
        if source is None:
            continue
        parser = parse_html(path, source, failures)
        if parser is None:
            continue
        for src, line in parser.script_sources:
            if unquote(urlsplit(src).path).split("/")[-1] == "typed-math.js":
                references.append((path.name, line))

    if references:
        examples = ", ".join(
            f"{filename}:{line}" for filename, line in references[:10]
        )
        failures.add(
            f"obsolete typed-math.js references remain in {len(references)} HTML file(s) "
            f"(first: {examples})"
        )


EXCLUDED_HTML_DIRECTORIES = {".git", ".agents", ".codex", "node_modules"}
def all_site_html_files() -> list[Path]:
    return sorted(
        path
        for path in ROOT.rglob("*.html")
        if path.is_file()
        and not EXCLUDED_HTML_DIRECTORIES.intersection(path.relative_to(ROOT).parts)
    )


def display_path(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return str(path)


def resolve_internal_target(source_path: Path, url_path: str) -> Path | None:
    decoded = unquote(url_path)
    if not decoded:
        return source_path
    if decoded.startswith("/"):
        candidate = ROOT / decoded.lstrip("/")
    else:
        candidate = source_path.parent / decoded
    candidate = Path(os.path.normpath(str(candidate)))
    try:
        candidate.relative_to(ROOT)
    except ValueError:
        return None
    if decoded.endswith("/") or candidate.is_dir():
        candidate /= "index.html"
    return candidate


def audit_html_references(failures: Failures) -> None:
    """Audit static internal references and ID/ARIA integrity in every HTML file."""

    documents: dict[Path, PageLinkParser] = {}
    for path in all_site_html_files():
        source = read_text(path, failures)
        if source is None:
            continue
        parser = parse_html(path, source, failures)
        if parser is not None:
            documents[path] = parser

    issues: list[str] = []
    for path, parser in list(documents.items()):
        filename = display_path(path)
        for element_id, lines in sorted(parser.id_lines.items()):
            if len(lines) > 1:
                issues.append(
                    f"{filename}: duplicate id {element_id!r} at lines {lines[:6]}"
                )

        for line in parser.anchors_without_href:
            issues.append(f"{filename}:{line}: <a> has no href")

        for attribute, value, line in parser.aria_references:
            missing = [token for token in value.split() if token not in parser.ids]
            if missing:
                issues.append(
                    f"{filename}:{line}: {attribute} references missing id(s) {missing}"
                )

        for tag, attribute, value, line in parser.references:
            if attribute == "href":
                lowered = value.casefold()
                if not value or value == "#":
                    issues.append(
                        f"{filename}:{line}: {tag} has empty placeholder href {value!r}"
                    )
                    continue
                if lowered.startswith("javascript:"):
                    issues.append(
                        f"{filename}:{line}: {tag} has JavaScript href {value!r}"
                    )
                    continue
            elif not value:
                issues.append(
                    f"{filename}:{line}: {tag} has empty {attribute} target"
                )
                continue

            if value.startswith("//"):
                continue
            parsed = urlsplit(value)
            if parsed.scheme:
                # Unknown schemes are still intentionally external. JavaScript
                # hrefs were rejected above; normal web/contact/data schemes do
                # not have repository targets.
                continue

            target = resolve_internal_target(path, parsed.path)
            if target is None:
                issues.append(
                    f"{filename}:{line}: {attribute} escapes the site root: {value!r}"
                )
                continue
            if not target.is_file():
                issues.append(
                    f"{filename}:{line}: missing local {attribute} target {value!r}"
                )
                continue

            fragment = unquote(parsed.fragment)
            if not fragment:
                continue
            target_parser = documents.get(target)
            if target_parser is None and target.suffix.casefold() == ".html":
                target_source = read_text(target, failures)
                if target_source is not None:
                    target_parser = parse_html(target, target_source, failures)
                    if target_parser is not None:
                        documents[target] = target_parser
            if target_parser is None or fragment not in target_parser.ids:
                issues.append(
                    f"{filename}:{line}: {attribute} fragment #{fragment} does not "
                    f"exist in {display_path(target)}"
                )

    if issues:
        failures.add(
            f"HTML reference audit found {len(issues)} issue(s): "
            + "; ".join(issues[:12])
            + (f"; … {len(issues) - 12} more" if len(issues) > 12 else "")
        )


def extract_js_array(
    source: str, name: str, failures: Failures, *, strings: bool
) -> tuple[str, ...] | tuple[int, ...]:
    match = re.search(
        rf"\bconst\s+{re.escape(name)}\s*=\s*\[(.*?)\]\s*;",
        source,
        flags=re.S,
    )
    if not match:
        failures.add(f"walkthrough-gate.js: cannot find navigation array {name}")
        return ()
    body = match.group(1)
    if strings:
        return tuple(re.findall(r"['\"]([^'\"]+)['\"]", body))
    return tuple(int(value) for value in re.findall(r"\b20\d{2}\b", body))


def parse_year_argument(
    argument: str,
    arrays: Mapping[str, Sequence[int]],
) -> tuple[int, ...]:
    value = argument.strip()
    if value.startswith("["):
        return tuple(int(year) for year in re.findall(r"\b20\d{2}\b", value))
    return tuple(arrays.get(value, ()))


def audit_navigation_catalogue(
    routes: Sequence[QuestionRoute], failures: Failures
) -> None:
    path = ROOT / "walkthrough-gate.js"
    source = read_text(path, failures)
    if source is None:
        return

    full_parts = extract_js_array(
        source, "WALKTHROUGH_NAV_PARTS", failures, strings=True
    )
    l2_parts = extract_js_array(
        source, "WALKTHROUGH_NAV_L2_CALCULUS_PARTS", failures, strings=True
    )
    year_arrays: dict[str, tuple[int, ...]] = {}
    for name in (
        "WALKTHROUGH_NAV_YEARS",
        "WALKTHROUGH_NAV_DIFFERENTIATION_YEARS",
        "WALKTHROUGH_NAV_INTEGRATION_YEARS",
    ):
        values = extract_js_array(source, name, failures, strings=False)
        year_arrays[name] = tuple(int(value) for value in values)

    failures.check(
        tuple(full_parts) == FULL_PARTS,
        "walkthrough-gate.js: WALKTHROUGH_NAV_PARTS differs from index ownership",
    )
    failures.check(
        tuple(l2_parts) == L2_CALCULUS_PARTS,
        "walkthrough-gate.js: Level 2 Calculus parts differ from index ownership",
    )

    navigation_by_paper: dict[str, set[str]] = defaultdict(set)

    direct_pattern = re.compile(
        r"createWalkthroughPaper\(\s*"
        r"['\"](?P<id>[^'\"]+)['\"]\s*,\s*"
        r"(?P<year>20\d{2})\s*,\s*"
        r"['\"](?P<template>[^'\"]+)['\"]"
        r"(?P<tail>[^)]*)\)",
        flags=re.S,
    )
    for match in direct_pattern.finditer(source):
        paper_id = match.group("id")
        template = match.group("template")
        parts: Sequence[str] = (
            L2_CALCULUS_PARTS
            if "WALKTHROUGH_NAV_L2_CALCULUS_PARTS" in match.group("tail")
            else FULL_PARTS
        )
        for part in parts:
            navigation_by_paper[paper_id].add(
                normalise_logical_route(template.replace("{part}", part))
            )

    year_pattern = re.compile(
        r"createWalkthroughYearPapers\(\s*"
        r"['\"](?P<id>[^'\"]+)['\"]\s*,\s*"
        r"['\"](?P<template>[^'\"]+)['\"]\s*,\s*"
        r"(?P<years>WALKTHROUGH_NAV_[A-Z_]+|\[[^\]]*\])",
        flags=re.S,
    )
    for match in year_pattern.finditer(source):
        standard_id = match.group("id")
        template = match.group("template")
        years = parse_year_argument(match.group("years"), year_arrays)
        if not years:
            failures.add(
                f"walkthrough-gate.js: cannot resolve years for {standard_id!r}"
            )
            continue
        for year in years:
            paper_id = f"{standard_id}-{year}"
            year_template = template.replace("{year}", str(year))
            for part in FULL_PARTS:
                navigation_by_paper[paper_id].add(
                    normalise_logical_route(year_template.replace("{part}", part))
                )

    expected_by_paper: dict[str, set[str]] = defaultdict(set)
    for route in routes:
        expected_by_paper[route.paper_id].add(route.logical_route)

    expected_papers = set(expected_by_paper)
    navigation_papers = set(navigation_by_paper)
    if navigation_papers != expected_papers:
        failures.add(
            "walkthrough-gate.js: navigation paper catalogue differs from index.html "
            f"(missing={sorted(expected_papers - navigation_papers)}, "
            f"unexpected={sorted(navigation_papers - expected_papers)})"
        )

    for paper_id in sorted(expected_papers & navigation_papers):
        expected = expected_by_paper[paper_id]
        actual = navigation_by_paper[paper_id]
        if actual != expected:
            failures.add(
                f"walkthrough-gate.js: {paper_id} part routes differ from index.html "
                f"(missing={sorted(expected - actual)[:4]}, "
                f"unexpected={sorted(actual - expected)[:4]})"
            )


def main() -> int:
    failures = Failures()
    routes = discover_routes(failures)

    if routes:
        audit_standard_pages(routes, failures)
        audit_year_pages(routes, failures)
        physical_files = audit_walkthrough_pages(routes, failures)
        audit_navigation_catalogue(routes, failures)
        audit_guided_copy(routes, failures)
    else:
        physical_files = set()

    data_files = audit_data_files(failures)
    audit_typed_math_references(failures)
    audit_shared_runtime_and_styles(failures)
    audit_html_references(failures)

    if failures.items:
        print(f"Site structure audit failed ({len(failures.items)} issue(s)):")
        for failure in failures.items:
            print(f"- {failure}")
        return 1

    print(
        "Site structure audit passed: "
        f"{EXPECTED_STANDARD_COUNT} standards, {EXPECTED_YEAR_PAGE_COUNT} year pages, "
        f"{len(routes)} logical walkthrough routes, {len(physical_files)} physical "
        f"walkthrough files, {len(data_files)} guided data files, and shared navigation "
        "catalogue parity."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
