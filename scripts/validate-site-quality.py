#!/usr/bin/env python3
"""Validate Calc.nz's generated content, SEO, links, and static a11y contract.

This validator treats ``question-catalogue.js`` as the single source of truth
for the 447 logical walkthrough routes.  It validates both one-file-per-question
pages and the older Complex Numbers shells whose distinct questions use ``?q=``
URLs.  No third-party Python packages or network access are required.

Run from any directory::

    python3 scripts/validate-site-quality.py

Use ``--max-errors 0`` to print every finding.  The optional ``--root`` flag is
useful when checking a staged copy of the generated site.
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import struct
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Iterable, Iterator, Mapping, Optional, Sequence
from urllib.parse import parse_qs, unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET

try:
    from skill_content import SKILL_SPECS, classify_question, validate_skill_specs
except ImportError:  # Support import through the historical validator wrapper.
    try:
        from scripts.skill_content import (  # type: ignore[no-redef]
            SKILL_SPECS,
            classify_question,
            validate_skill_specs,
        )
    except ImportError:  # A clear validation error is emitted later.
        SKILL_SPECS = {}  # type: ignore[assignment]
        classify_question = None  # type: ignore[assignment]
        validate_skill_specs = None  # type: ignore[assignment]


ORIGIN = "https://calc.nz"
CATALOGUE_FILE = "question-catalogue.js"
CATALOGUE_GLOBAL = "CALC_NZ_QUESTION_CATALOGUE"
EXPECTED_QUESTION_COUNT = 447
EXPECTED_SOCIAL_IMAGE_URL = ORIGIN + "/assets/calc-nz-social.jpg"
EXPECTED_ICON_LINKS = (
    ("icon", "/favicon.ico", "48x48", ""),
    ("icon", "/assets/favicon-48.png", "48x48", "image/png"),
    ("icon", "/assets/favicon-192.png", "192x192", "image/png"),
    ("apple-touch-icon", "/assets/apple-touch-icon.png", "180x180", ""),
)
NO_INITIAL_MATH_ASSET_PAGES = {"index.html", "standards.html", "skills.html"}
# Assemble the prohibited search strings at runtime so the validator itself does
# not become a source-tree occurrence of the text it is meant to prohibit.
PERSONAL_NAME_PATTERNS = (
    re.compile(r"Jack van " + r"Baalen", re.I),
    re.compile(r"van " + r"Baalen", re.I),
)
SKIP_DIRECTORIES = {".git", ".agents", ".codex", "node_modules", "__pycache__"}
TEXT_SUFFIXES = {
    ".css", ".html", ".js", ".json", ".m", ".md", ".py", ".swift",
    ".txt", ".xml",
}


@dataclass(frozen=True)
class StandardFacts:
    key: str
    level_id: str
    level_label: str
    label: str
    code: str
    official_name: str
    landing_href: str
    official_url: str


STANDARD_FACTS: dict[str, StandardFacts] = {
    "level-2-calculus": StandardFacts(
        "level-2-calculus", "level-2", "Level 2", "Calculus", "AS91262",
        "Apply calculus methods in solving problems", "level-2-calculus.html",
        "https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=91262",
    ),
    "level-2-algebra": StandardFacts(
        "level-2-algebra", "level-2", "Level 2", "Algebra", "AS91261",
        "Apply algebraic methods in solving problems", "level-2-algebra.html",
        "https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=91261",
    ),
    "level-3-complex": StandardFacts(
        "level-3-complex", "level-3", "Level 3", "Complex Numbers", "AS91577",
        "Apply the algebra of complex numbers in solving problems",
        "level-3-complex-numbers.html",
        "https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=91577",
    ),
    "level-3-differentiation": StandardFacts(
        "level-3-differentiation", "level-3", "Level 3", "Differentiation", "AS91578",
        "Apply differentiation methods in solving problems",
        "level-3-differentiation.html",
        "https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=91578",
    ),
    "level-3-integration": StandardFacts(
        "level-3-integration", "level-3", "Level 3", "Integration", "AS91579",
        "Apply integration methods in solving problems", "level-3-integration.html",
        "https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=91579",
    ),
}


@dataclass(frozen=True)
class QuestionRecord:
    standard: StandardFacts
    year: int
    paper_id: str
    paper_href: str
    question_id: str
    label: str
    method: str
    method_title: str
    href: str
    canonical: str
    title: str
    description: str
    summary: str
    common_mistake: str
    skill_slugs: tuple[str, ...]
    raw: Mapping[str, Any]

    @property
    def source_file(self) -> str:
        return unquote(urlsplit(self.href).path).lstrip("/")

    @property
    def is_parameter_route(self) -> bool:
        return bool(urlsplit(self.href).query)


class Failures:
    def __init__(self) -> None:
        self.items: list[str] = []

    def add(self, message: str) -> None:
        self.items.append(message)

    def check(self, condition: bool, message: str) -> None:
        if not condition:
            self.add(message)

    def extend(self, messages: Iterable[str]) -> None:
        self.items.extend(messages)


def normalise_space(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def normalise_url_path(value: str) -> str:
    parsed = urlsplit(html.unescape(value.strip()))
    path = unquote(parsed.path).lstrip("/")
    return path + ("?" + parsed.query if parsed.query else "")


def absolute_url(value: str) -> str:
    return urljoin(ORIGIN + "/", value)


def plain_math_text(value: object) -> str:
    text = html.unescape(str(value or ""))
    text = re.sub(r"<[^>]+>", " ", text)
    text = text.replace(r"\(", " ").replace(r"\)", " ")
    text = text.replace(r"\[", " ").replace(r"\]", " ")
    text = re.sub(r"\\(?:text|mathrm|mathbf|operatorname)\s*\{([^{}]*)\}", r"\1", text)
    text = re.sub(r"\\(?:left|right|quad|qquad)\b|\\[,;!]", " ", text)
    text = re.sub(r"\\([A-Za-z]+)", r"\1", text)
    text = text.replace("{", " ").replace("}", " ")
    return normalise_space(text)


def read_catalogue(root: Path, failures: Failures) -> list[QuestionRecord]:
    path = root / CATALOGUE_FILE
    try:
        source = path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as error:
        failures.add(f"{CATALOGUE_FILE}: cannot read UTF-8 source ({error})")
        return []

    assignment = re.fullmatch(
        rf"\s*(?:/\*[\s\S]*?\*/\s*)?window\.{CATALOGUE_GLOBAL}\s*=\s*"
        rf"(?P<payload>\{{[\s\S]*\}})\s*;\s*",
        source,
    )
    if assignment is None:
        failures.add(
            f"{CATALOGUE_FILE}: expected one JSON-compatible "
            f"window.{CATALOGUE_GLOBAL} assignment"
        )
        return []
    try:
        document = json.loads(assignment.group("payload"))
    except (TypeError, ValueError) as error:
        failures.add(f"{CATALOGUE_FILE}: invalid JSON-compatible payload ({error})")
        return []
    if (
        not isinstance(document, dict)
        or document.get("schemaVersion") not in {1, 2}
    ):
        failures.add(f"{CATALOGUE_FILE}: expected schemaVersion 1 or 2")
        return []

    records: list[QuestionRecord] = []
    seen_levels: set[str] = set()
    seen_standards: set[str] = set()
    seen_papers: set[str] = set()
    for level in document.get("levels", []):
        if not isinstance(level, dict):
            failures.add(f"{CATALOGUE_FILE}: every level must be an object")
            continue
        level_id = normalise_space(level.get("id"))
        level_label = normalise_space(level.get("label"))
        if level_id in seen_levels:
            failures.add(f"{CATALOGUE_FILE}: duplicate level id {level_id!r}")
        seen_levels.add(level_id)
        for standard in level.get("standards", []):
            if not isinstance(standard, dict):
                failures.add(f"{CATALOGUE_FILE}: every standard must be an object")
                continue
            standard_id = normalise_space(standard.get("id"))
            facts = STANDARD_FACTS.get(standard_id)
            if facts is None:
                failures.add(f"{CATALOGUE_FILE}: unsupported standard id {standard_id!r}")
                continue
            if standard_id in seen_standards:
                failures.add(f"{CATALOGUE_FILE}: duplicate standard id {standard_id!r}")
            seen_standards.add(standard_id)
            expected_standard_fields = {
                "label": facts.label,
                "code": facts.code,
                "landingHref": facts.landing_href,
            }
            if level_id != facts.level_id or level_label != facts.level_label:
                failures.add(
                    f"{CATALOGUE_FILE}: {standard_id} is under {level_id!r}/"
                    f"{level_label!r}, expected {facts.level_id!r}/{facts.level_label!r}"
                )
            for field_name, expected in expected_standard_fields.items():
                if normalise_space(standard.get(field_name)) != expected:
                    failures.add(
                        f"{CATALOGUE_FILE}: {standard_id}.{field_name} is "
                        f"{standard.get(field_name)!r}, expected {expected!r}"
                    )

            for paper in standard.get("papers", []):
                if not isinstance(paper, dict):
                    failures.add(f"{CATALOGUE_FILE}: every paper must be an object")
                    continue
                paper_id = normalise_space(paper.get("id"))
                year = paper.get("year")
                if not isinstance(year, int) or not 2000 <= year <= 2100:
                    failures.add(f"{CATALOGUE_FILE}: {paper_id!r} has invalid year {year!r}")
                    continue
                expected_paper_id = f"{standard_id}-{year}"
                if paper_id != expected_paper_id:
                    failures.add(
                        f"{CATALOGUE_FILE}: paper id {paper_id!r}, expected "
                        f"{expected_paper_id!r}"
                    )
                if paper_id in seen_papers:
                    failures.add(f"{CATALOGUE_FILE}: duplicate paper id {paper_id!r}")
                seen_papers.add(paper_id)
                paper_href = normalise_space(paper.get("landingHref"))
                expected_paper_href = facts.landing_href[:-5] + f"-{year}.html"
                if paper_href != expected_paper_href:
                    failures.add(
                        f"{CATALOGUE_FILE}: {paper_id}.landingHref is {paper_href!r}, "
                        f"expected {expected_paper_href!r}"
                    )

                for question in paper.get("questions", []):
                    if not isinstance(question, dict):
                        failures.add(f"{CATALOGUE_FILE}: every question must be an object")
                        continue
                    question_id = normalise_space(question.get("id")).lower()
                    label = normalise_space(question.get("label"))
                    method = normalise_space(question.get("method") or question.get("focus"))
                    method_title = normalise_space(question.get("methodTitle"))
                    href = normalise_space(question.get("href"))
                    derived_canonical = absolute_url(href)
                    canonical = normalise_space(question.get("canonical"))
                    title = normalise_space(question.get("title"))
                    description = normalise_space(question.get("description"))
                    summary = normalise_space(
                        question.get("summary") or question.get("learningSummary")
                    )
                    common_mistake = normalise_space(question.get("commonMistake"))
                    raw_skills = question.get("skillSlugs", [])
                    skill_slugs = tuple(
                        normalise_space(value) for value in raw_skills
                    ) if isinstance(raw_skills, list) else ()

                    context = f"{CATALOGUE_FILE}: {paper_id}/{question_id or '?'}"
                    if not re.fullmatch(r"[1-9]\d*[a-z]", question_id):
                        failures.add(f"{context}: invalid question id")
                    if not label or not re.search(r"Question\s+\d", label, re.I):
                        failures.add(f"{context}: missing or invalid question label")
                    if not method:
                        failures.add(f"{context}: missing method")
                    if not method_title:
                        failures.add(f"{context}: missing methodTitle")
                    if not href or urlsplit(href).scheme or urlsplit(href).netloc:
                        failures.add(f"{context}: href must be a non-empty local URL")
                    if canonical != derived_canonical:
                        failures.add(
                            f"{context}: canonical is {canonical!r}, expected "
                            f"{derived_canonical!r}"
                        )
                    for name, value in (
                        ("title", title), ("description", description),
                        ("summary", summary), ("commonMistake", common_mistake),
                    ):
                        if not value:
                            failures.add(f"{context}: missing {name}")
                    if title:
                        for identity in (str(year), facts.level_label):
                            if identity.casefold() not in title.casefold():
                                failures.add(f"{context}: title omits {identity!r}")
                        compact_question = re.sub(
                            r"^Question\s+", "Q", label, flags=re.I
                        ).replace(" ", "")
                        compact_title = title.replace(" ", "")
                        if (
                            label.casefold() not in title.casefold()
                            and compact_question.casefold() not in compact_title.casefold()
                        ):
                            failures.add(f"{context}: title omits {label!r}")
                        if len(title) > 105:
                            failures.add(
                                f"{context}: title is {len(title)} characters; keep it concise"
                            )
                        if method_title and not title.startswith(
                            f"{method_title} Worked Solution"
                        ):
                            failures.add(
                                f"{context}: title does not begin with its methodTitle"
                            )
                    if description:
                        for identity in (str(year), facts.code, label):
                            if identity.casefold() not in description.casefold():
                                failures.add(f"{context}: description omits {identity!r}")
                        if not 70 <= len(description) <= 170:
                            failures.add(
                                f"{context}: description length {len(description)} is outside 70–170"
                            )
                    stopwords = {
                        "the", "and", "for", "from", "with", "using", "use", "find",
                        "finding", "apply", "applying", "question", "worked", "solution",
                        "level", "ncea", "calculus", "algebra", "complex", "numbers",
                        "differentiation", "integration", "expression", "equation",
                    }
                    method_words = {
                        word for word in re.findall(r"[a-z][a-z0-9-]{2,}", plain_math_text(method).casefold())
                        if word not in stopwords
                    }
                    description_words = set(
                        re.findall(r"[a-z][a-z0-9-]{2,}", description.casefold())
                    )
                    if description and method_words and not method_words.intersection(description_words):
                        failures.add(f"{context}: description does not mention the method")
                    if not isinstance(raw_skills, list) or not all(
                        re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", value)
                        for value in skill_slugs
                    ):
                        failures.add(f"{context}: skillSlugs must be a list of slugs")
                    records.append(
                        QuestionRecord(
                            facts, year, paper_id, paper_href, question_id, label,
                            method, method_title, href, canonical, title, description, summary,
                            common_mistake, skill_slugs, question,
                        )
                    )

    if set(STANDARD_FACTS) != seen_standards:
        failures.add(
            f"{CATALOGUE_FILE}: standard coverage mismatch "
            f"(missing={sorted(set(STANDARD_FACTS) - seen_standards)}, "
            f"unexpected={sorted(seen_standards - set(STANDARD_FACTS))})"
        )
    if len(records) != EXPECTED_QUESTION_COUNT:
        failures.add(
            f"{CATALOGUE_FILE}: expected {EXPECTED_QUESTION_COUNT} question records, "
            f"found {len(records)}"
        )
    for field_name, values in (
        ("href", [record.href for record in records]),
        ("canonical", [record.canonical for record in records if record.canonical]),
        ("title", [record.title.casefold() for record in records if record.title]),
        ("description", [record.description.casefold() for record in records if record.description]),
    ):
        duplicates = sorted(value for value, count in Counter(values).items() if count > 1)
        if duplicates:
            failures.add(
                f"{CATALOGUE_FILE}: duplicate question {field_name} values "
                f"(first: {duplicates[0]!r})"
            )
    return records


@dataclass
class Element:
    tag: str
    attrs: dict[str, str]
    line: int
    parent: Optional[int]
    visible: bool
    suppressed: bool
    text_parts: list[str] = field(default_factory=list)

    @property
    def text(self) -> str:
        return normalise_space("".join(self.text_parts))


class StaticPageParser(HTMLParser):
    VOID_TAGS = {
        "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "param", "source", "track", "wbr",
    }

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.elements: list[Element] = []
        self.stack: list[int] = []
        self.ids: dict[str, list[int]] = defaultdict(list)
        self.references: list[tuple[str, str, str, int]] = []

    def handle_starttag(
        self, tag: str, attrs: Sequence[tuple[str, Optional[str]]]
    ) -> None:
        tag = tag.lower()
        values = {name.lower(): value or "" for name, value in attrs}
        parent = self.stack[-1] if self.stack else None
        parent_visible = self.elements[parent].visible if parent is not None else True
        parent_suppressed = self.elements[parent].suppressed if parent is not None else False
        classes = set(values.get("class", "").lower().split())
        style = re.sub(r"\s+", "", values.get("style", "").lower())
        hidden = (
            "hidden" in values
            or values.get("aria-hidden", "").lower() == "true"
            or "hidden" in classes
            or "display:none" in style
            or "visibility:hidden" in style
        )
        visible = parent_visible and not hidden
        suppressed = parent_suppressed or tag in {"head", "script", "style", "template"}
        element = Element(tag, values, self.getpos()[0], parent, visible, suppressed)
        index = len(self.elements)
        self.elements.append(element)
        element_id = values.get("id", "").strip()
        if element_id:
            self.ids[element_id].append(element.line)
        for attribute in ("href", "src", "action"):
            if attribute in values:
                self.references.append((tag, attribute, values[attribute].strip(), element.line))
        if tag not in self.VOID_TAGS:
            self.stack.append(index)

    def handle_startendtag(
        self, tag: str, attrs: Sequence[tuple[str, Optional[str]]]
    ) -> None:
        self.handle_starttag(tag, attrs)
        if tag.lower() not in self.VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        match = next(
            (index for index in range(len(self.stack) - 1, -1, -1)
             if self.elements[self.stack[index]].tag == tag),
            None,
        )
        if match is not None:
            del self.stack[match:]

    def handle_data(self, data: str) -> None:
        for index in self.stack:
            self.elements[index].text_parts.append(data)

    def find(self, tag: Optional[str] = None, **attrs: str) -> list[Element]:
        return [
            element for element in self.elements
            if (tag is None or element.tag == tag)
            and all(element.attrs.get(name) == value for name, value in attrs.items())
        ]

    def with_attr(self, name: str, value: Optional[str] = None) -> list[Element]:
        return [
            element for element in self.elements
            if name in element.attrs and (value is None or element.attrs[name] == value)
        ]

    def meta_name(self, name: str) -> list[str]:
        return [
            element.attrs.get("content", "").strip()
            for element in self.find("meta")
            if element.attrs.get("name", "").strip().casefold() == name.casefold()
        ]

    def meta_property(self, name: str) -> list[str]:
        return [
            element.attrs.get("content", "").strip()
            for element in self.find("meta")
            if element.attrs.get("property", "").strip().casefold() == name.casefold()
        ]

    def canonical_values(self) -> list[str]:
        return [
            element.attrs.get("href", "").strip()
            for element in self.find("link")
            if "canonical" in element.attrs.get("rel", "").lower().split()
        ]


def element_has_ancestor(
    parser: StaticPageParser, element: Element, ancestor_tag: str
) -> bool:
    parent = element.parent
    while parent is not None:
        candidate = parser.elements[parent]
        if candidate.tag == ancestor_tag:
            return True
        parent = candidate.parent
    return False


def document_title_values(parser: StaticPageParser) -> list[str]:
    """Return HTML document titles without counting accessible SVG titles."""

    return [
        element.text for element in parser.find("title")
        if element_has_ancestor(parser, element, "head")
    ]


def parse_pages(root: Path, failures: Failures) -> dict[str, StaticPageParser]:
    pages: dict[str, StaticPageParser] = {}
    for path in sorted(root.glob("*.html")):
        try:
            source = path.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as error:
            failures.add(f"{path.name}: cannot read UTF-8 HTML ({error})")
            continue
        parser = StaticPageParser()
        try:
            parser.feed(source)
            parser.close()
        except Exception as error:
            failures.add(f"{path.name}: HTML parse error ({error})")
            continue
        pages[path.name] = parser
    return pages


def exactly_one(
    values: Sequence[str], filename: str, label: str, failures: Failures
) -> str:
    if len(values) != 1:
        failures.add(f"{filename}: expected exactly one {label}, found {len(values)}")
        return ""
    value = normalise_space(values[0])
    if not value:
        failures.add(f"{filename}: {label} is empty")
    return value


def jsonld_nodes(parser: StaticPageParser, filename: str, failures: Failures) -> list[dict[str, Any]]:
    nodes: list[dict[str, Any]] = []
    scripts = [
        element for element in parser.find("script")
        if element.attrs.get("type", "").lower().split(";", 1)[0].strip()
        == "application/ld+json"
    ]
    if not scripts:
        failures.add(f"{filename}: missing JSON-LD")
        return nodes
    for index, script in enumerate(scripts, 1):
        try:
            value = json.loads(script.text)
        except (TypeError, ValueError) as error:
            failures.add(f"{filename}: invalid JSON-LD block {index} ({error})")
            continue
        roots = value if isinstance(value, list) else [value]
        for root in roots:
            if not isinstance(root, dict):
                failures.add(f"{filename}: JSON-LD block {index} root must be an object")
                continue
            graph = root.get("@graph")
            if isinstance(graph, list):
                nodes.extend(item for item in graph if isinstance(item, dict))
            nodes.append(root)
    return nodes


@dataclass(frozen=True)
class SitemapEntry:
    url: str
    lastmod: str


def parse_sitemap(root: Path, failures: Failures) -> list[SitemapEntry]:
    path = root / "sitemap.xml"
    try:
        tree = ET.parse(path)
    except (OSError, ET.ParseError) as error:
        failures.add(f"sitemap.xml: missing or invalid XML ({error})")
        return []
    document = tree.getroot()
    if document.tag.rsplit("}", 1)[-1] != "urlset":
        failures.add("sitemap.xml: root element must be urlset")
    entries: list[SitemapEntry] = []
    for element in document:
        if element.tag.rsplit("}", 1)[-1] != "url":
            continue
        children: dict[str, list[str]] = defaultdict(list)
        for child in element:
            children[child.tag.rsplit("}", 1)[-1]].append(normalise_space(child.text))
        locations = children.get("loc", [])
        if len(locations) != 1 or not locations[0]:
            failures.add("sitemap.xml: every <url> needs exactly one non-empty <loc>")
            continue
        lastmods = children.get("lastmod", [])
        if len(lastmods) != 1:
            failures.add(
                f"sitemap.xml: {locations[0]} must have exactly one <lastmod>, "
                f"found {len(lastmods)}"
            )
        lastmod = lastmods[0] if lastmods else ""
        if lastmod:
            try:
                parsed_date = date.fromisoformat(lastmod)
            except ValueError:
                failures.add(
                    f"sitemap.xml: {locations[0]} has invalid ISO lastmod {lastmod!r}"
                )
            else:
                if parsed_date > date.today():
                    failures.add(
                        f"sitemap.xml: {locations[0]} has future lastmod {lastmod!r}"
                    )
        entries.append(SitemapEntry(locations[0], lastmod))
    return entries


def local_file_for_url(url: str) -> str:
    path = unquote(urlsplit(url).path).lstrip("/")
    return path or "index.html"


def page_is_noindex(parser: StaticPageParser) -> bool:
    robots = " ".join(parser.meta_name("robots")).casefold()
    return bool(re.search(r"(?:^|[\s,])noindex(?:$|[\s,])", robots))


def validate_sitemap(
    root: Path,
    pages: Mapping[str, StaticPageParser],
    records: Sequence[QuestionRecord],
    entries: Sequence[SitemapEntry],
    failures: Failures,
) -> set[str]:
    urls = [entry.url for entry in entries]
    duplicate_urls = sorted(url for url, count in Counter(urls).items() if count > 1)
    if duplicate_urls:
        failures.add(f"sitemap.xml: duplicate URL (first: {duplicate_urls[0]!r})")
    actual = set(urls)
    dated_entries = [entry.lastmod for entry in entries if entry.lastmod]
    if len(dated_entries) == len(entries) and len(entries) > 1:
        if len(set(dated_entries)) < 2:
            failures.add(
                "sitemap.xml: every URL has the same lastmod; use meaningful "
                "page/content dates rather than one build date"
            )

    expected_question_urls = {record.canonical for record in records if record.canonical}
    missing_questions = sorted(expected_question_urls - actual)
    extra_question_like = sorted(
        url for url in actual
        if ("?q=" in url or re.search(r"(?:alg-|int-|complex-)?[1-3][a-e]20\d{2}", url))
        and url not in expected_question_urls
    )
    if missing_questions:
        failures.add(
            f"sitemap.xml: {len(missing_questions)} catalogue questions missing "
            f"(first: {missing_questions[0]})"
        )
    if extra_question_like:
        failures.add(
            f"sitemap.xml: non-catalogue question-like URL present "
            f"(first: {extra_question_like[0]})"
        )

    # Every indexable canonical HTML document belongs in the sitemap. Query
    # variants are supplied by the catalogue above because they share a file.
    expected_static: set[str] = set()
    for filename, parser in pages.items():
        if page_is_noindex(parser):
            continue
        canonicals = parser.canonical_values()
        if len(canonicals) == 1 and canonicals[0]:
            expected_static.add(canonicals[0])
    missing_static = sorted(expected_static - actual)
    if missing_static:
        failures.add(
            f"sitemap.xml: {len(missing_static)} indexable canonical pages missing "
            f"(first: {missing_static[0]})"
        )

    for url in urls:
        parsed = urlsplit(url)
        if parsed.scheme != "https" or parsed.netloc != "calc.nz":
            failures.add(f"sitemap.xml: URL is not absolute canonical HTTPS: {url!r}")
        if parsed.fragment:
            failures.add(f"sitemap.xml: fragments are not allowed: {url!r}")
        filename = local_file_for_url(url)
        path = root / filename
        if not path.is_file():
            failures.add(f"sitemap.xml: URL has no local page: {url!r}")
            continue
        parser = pages.get(filename)
        if parser and page_is_noindex(parser):
            failures.add(f"sitemap.xml: noindex page included: {url!r}")
        if parser and not urlsplit(url).query:
            canonicals = parser.canonical_values()
            if canonicals != [url]:
                failures.add(
                    f"sitemap.xml: {url!r} does not match {filename}'s canonical "
                    f"{canonicals!r}"
                )

    return actual


def validate_robots(root: Path, failures: Failures) -> None:
    path = root / "robots.txt"
    try:
        lines = [
            line.split("#", 1)[0].strip()
            for line in path.read_text(encoding="utf-8").splitlines()
        ]
    except (OSError, UnicodeError) as error:
        failures.add(f"robots.txt: cannot read ({error})")
        return
    directives = [
        (key.strip().casefold(), value.strip())
        for line in lines if ":" in line
        for key, value in [line.split(":", 1)]
    ]
    lower_directives = [(key, value.casefold()) for key, value in directives]
    if ("user-agent", "*") not in lower_directives:
        failures.add("robots.txt: missing User-agent: *")
    if ("allow", "/") not in directives:
        failures.add("robots.txt: missing Allow: /")
    if any(key == "disallow" and value == "/" for key, value in directives):
        failures.add("robots.txt: root crawling is disallowed")
    sitemap_values = [value for key, value in directives if key == "sitemap"]
    if sitemap_values != [ORIGIN + "/sitemap.xml"]:
        failures.add(
            f"robots.txt: expected exactly `Sitemap: {ORIGIN}/sitemap.xml`"
        )


def resolve_local_target(root: Path, source: Path, reference: str) -> tuple[Optional[Path], str]:
    if not reference:
        return None, "empty URL"
    parsed = urlsplit(html.unescape(reference))
    if parsed.scheme and parsed.scheme.casefold() not in {"http", "https"}:
        return None, ""
    if parsed.netloc and parsed.hostname and parsed.hostname.casefold() != "calc.nz":
        return None, ""
    raw_path = unquote(parsed.path)
    if not raw_path:
        target = source
    elif raw_path == "/":
        target = root / "index.html"
    elif raw_path.startswith("/"):
        target = root / raw_path.lstrip("/")
    else:
        target = source.parent / raw_path
    try:
        target = target.resolve()
        target.relative_to(root.resolve())
    except (OSError, ValueError):
        return None, "escapes site root"
    if target.is_dir():
        target /= "index.html"
    return target, unquote(parsed.fragment)


def validate_references(
    root: Path, pages: Mapping[str, StaticPageParser], failures: Failures
) -> None:
    for filename, parser in pages.items():
        source = root / filename
        for tag, attribute, value, line in parser.references:
            if attribute == "href" and (not value or value == "#"):
                failures.add(f"{filename}:{line}: placeholder href {value!r}")
                continue
            target, fragment = resolve_local_target(root, source, value)
            if target is None:
                if fragment:
                    failures.add(
                        f"{filename}:{line}: invalid {tag} {attribute}={value!r} "
                        f"({fragment})"
                    )
                continue
            if not target.is_file():
                failures.add(f"{filename}:{line}: missing local target {value!r}")
                continue
            if fragment and target.suffix.casefold() == ".html":
                target_parser = pages.get(target.name)
                if target_parser is not None and fragment not in target_parser.ids:
                    failures.add(
                        f"{filename}:{line}: fragment #{fragment} is missing in "
                        f"{target.name}"
                    )


def image_dimensions(path: Path) -> Optional[tuple[int, int]]:
    try:
        with path.open("rb") as stream:
            header = stream.read(32)
            stream.seek(0)
            if header.startswith(b"\xff\xd8"):
                stream.read(2)
                start_of_frame_markers = {
                    0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7,
                    0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF,
                }
                while True:
                    prefix = stream.read(1)
                    if not prefix:
                        return None
                    if prefix != b"\xff":
                        continue
                    marker_byte = stream.read(1)
                    while marker_byte == b"\xff":
                        marker_byte = stream.read(1)
                    if not marker_byte:
                        return None
                    marker = marker_byte[0]
                    if marker in {0x01, *range(0xD0, 0xDA)}:
                        continue
                    length_bytes = stream.read(2)
                    if len(length_bytes) != 2:
                        return None
                    segment_length = struct.unpack(">H", length_bytes)[0]
                    if segment_length < 2:
                        return None
                    if marker in start_of_frame_markers:
                        frame = stream.read(5)
                        if len(frame) != 5:
                            return None
                        height, width = struct.unpack(">HH", frame[1:5])
                        return width, height
                    if marker in {0xD9, 0xDA}:
                        return None
                    stream.seek(segment_length - 2, 1)
    except OSError:
        return None
    if header.startswith(b"\x89PNG\r\n\x1a\n") and len(header) >= 24:
        return struct.unpack(">II", header[16:24])
    if len(header) >= 22 and header[:4] == b"\x00\x00\x01\x00":
        count = struct.unpack("<H", header[4:6])[0]
        if count:
            width = header[6] or 256
            height = header[7] or 256
            return width, height
    return None


def validate_icon_metadata(
    root: Path,
    filename: str,
    parser: StaticPageParser,
    failures: Failures,
) -> None:
    links = parser.find("link")
    for rel, href, sizes, media_type in EXPECTED_ICON_LINKS:
        matches = [
            element for element in links
            if rel in element.attrs.get("rel", "").casefold().split()
            and element.attrs.get("href", "") == href
        ]
        if len(matches) != 1:
            failures.add(
                f"{filename}: expected one {rel} link for {href}, found {len(matches)}"
            )
            continue
        link = matches[0]
        if link.attrs.get("sizes", "").casefold() != sizes:
            failures.add(f"{filename}: {href} must declare sizes={sizes!r}")
        if link.attrs.get("type", "").casefold() != media_type:
            expected = media_type or "no type attribute"
            failures.add(f"{filename}: {href} must declare {expected}")
        target, _fragment = resolve_local_target(root, root / filename, href)
        if target is None or not target.is_file():
            failures.add(f"{filename}: icon target is missing: {href}")
            continue
        expected_size = tuple(int(value) for value in sizes.split("x"))
        dimensions = image_dimensions(target)
        if dimensions != expected_size:
            detail = "unreadable" if dimensions is None else f"{dimensions[0]}x{dimensions[1]}"
            failures.add(
                f"{filename}: {href} is {detail}, expected {sizes}"
            )


def validate_social_metadata(
    root: Path,
    filename: str,
    parser: StaticPageParser,
    title: str,
    description: str,
    canonical: str,
    failures: Failures,
) -> None:
    og_title = exactly_one(parser.meta_property("og:title"), filename, "og:title", failures)
    og_description = exactly_one(
        parser.meta_property("og:description"), filename, "og:description", failures
    )
    og_url = exactly_one(parser.meta_property("og:url"), filename, "og:url", failures)
    og_locale = exactly_one(parser.meta_property("og:locale"), filename, "og:locale", failures)
    twitter_card = exactly_one(
        parser.meta_name("twitter:card"), filename, "twitter:card", failures
    )
    twitter_title = exactly_one(
        parser.meta_name("twitter:title"), filename, "twitter:title", failures
    )
    twitter_description = exactly_one(
        parser.meta_name("twitter:description"), filename, "twitter:description", failures
    )
    og_image = exactly_one(parser.meta_property("og:image"), filename, "og:image", failures)
    twitter_image = exactly_one(
        parser.meta_name("twitter:image"), filename, "twitter:image", failures
    )
    og_image_alt = exactly_one(
        parser.meta_property("og:image:alt"), filename, "og:image:alt", failures
    )
    twitter_image_alt = exactly_one(
        parser.meta_name("twitter:image:alt"), filename, "twitter:image:alt", failures
    )
    width = exactly_one(
        parser.meta_property("og:image:width"), filename, "og:image:width", failures
    )
    height = exactly_one(
        parser.meta_property("og:image:height"), filename, "og:image:height", failures
    )

    for label, actual, expected in (
        ("og:title", og_title, title),
        ("og:description", og_description, description),
        ("og:url", og_url, canonical),
        ("twitter:title", twitter_title, title),
        ("twitter:description", twitter_description, description),
    ):
        if actual and expected and actual != expected:
            failures.add(f"{filename}: {label} does not match primary metadata")
    if og_locale and og_locale != "en_NZ":
        failures.add(f"{filename}: og:locale must be en_NZ")
    if twitter_card and twitter_card != "summary_large_image":
        failures.add(f"{filename}: twitter:card must be summary_large_image")
    if og_image and twitter_image and og_image != twitter_image:
        failures.add(f"{filename}: twitter:image does not match og:image")
    if og_image and og_image != EXPECTED_SOCIAL_IMAGE_URL:
        failures.add(
            f"{filename}: og:image must use the optimized sitewide sharing image "
            f"{EXPECTED_SOCIAL_IMAGE_URL!r}"
        )
    for label, value in (("og:image", og_image), ("twitter:image", twitter_image)):
        parsed = urlsplit(value)
        if value and (parsed.scheme != "https" or not parsed.netloc):
            failures.add(f"{filename}: {label} must be an absolute HTTPS URL")
    if width and width != "1200":
        failures.add(f"{filename}: og:image:width must be 1200")
    if height and height != "630":
        failures.add(f"{filename}: og:image:height must be 630")
    if og_image_alt and len(og_image_alt) < 12:
        failures.add(f"{filename}: og:image:alt is not descriptive")
    if twitter_image_alt and twitter_image_alt != og_image_alt:
        failures.add(f"{filename}: twitter:image:alt does not match og:image:alt")
    if og_image:
        target, _fragment = resolve_local_target(root, root / filename, og_image)
        if target is not None:
            if not target.is_file():
                failures.add(f"{filename}: sharing image target is missing: {og_image}")
            else:
                dimensions = image_dimensions(target)
                if dimensions is None:
                    failures.add(
                        f"{filename}: sharing image dimensions could not be read"
                    )
                elif dimensions != (1200, 630):
                    failures.add(
                        f"{filename}: sharing image is {dimensions[0]}x{dimensions[1]}, "
                        "expected 1200x630"
                    )


def about_generator_span(source: str) -> tuple[int, int]:
    match = re.search(r"(?m)^def\s+about_page\s*\(", source)
    if match is None:
        return (-1, -1)
    following = re.search(r"(?m)^def\s+\w+\s*\(", source[match.end():])
    end = len(source) if following is None else match.end() + following.start()
    return match.start(), end


def footer_attribution_spans(source: str) -> tuple[tuple[int, int], ...]:
    return tuple(
        match.span()
        for match in re.finditer(
            r'(?is)<p\b(?=[^>]*\bclass=["\'][^"\']*\bsite-footer-attribution\b)[^>]*>.*?</p>',
            source,
        )
    )


def validate_personal_name(root: Path, failures: Failures) -> None:
    findings: list[str] = []
    for directory, dirnames, filenames in os.walk(root):
        dirnames[:] = [name for name in dirnames if name not in SKIP_DIRECTORIES]
        for basename in filenames:
            path = Path(directory) / basename
            if path.suffix.casefold() not in TEXT_SUFFIXES:
                continue
            try:
                source = path.read_text(encoding="utf-8")
            except (OSError, UnicodeError):
                continue
            relative = path.relative_to(root).as_posix()
            allowed_span = about_generator_span(source) if relative == "scripts/build-seo.py" else (-1, -1)
            footer_spans = footer_attribution_spans(source) if path.suffix.casefold() == ".html" else ()
            for pattern in PERSONAL_NAME_PATTERNS:
                for match in pattern.finditer(source):
                    allowed = relative == "about.html" or (
                        allowed_span[0] <= match.start() < allowed_span[1]
                    ) or any(
                        start <= match.start() < end for start, end in footer_spans
                    )
                    if not allowed:
                        line = source.count("\n", 0, match.start()) + 1
                        findings.append(f"{relative}:{line}: {match.group(0)!r}")
    if findings:
        failures.add(
            "personal-name restriction violated at "
            + "; ".join(findings[:20])
            + (f"; … {len(findings) - 20} more" if len(findings) > 20 else "")
        )


def schema_types(node: Mapping[str, Any]) -> set[str]:
    raw_types = node.get("@type")
    if isinstance(raw_types, str):
        return {raw_types}
    if isinstance(raw_types, list):
        return {value for value in raw_types if isinstance(value, str)}
    return set()


def validate_jsonld_page(
    filename: str,
    parser: StaticPageParser,
    canonical: str,
    title: str,
    description: str,
    failures: Failures,
) -> list[dict[str, Any]]:
    nodes = jsonld_nodes(parser, filename, failures)
    typed_nodes = [node for node in nodes if schema_types(node)]
    if not typed_nodes:
        failures.add(f"{filename}: JSON-LD contains no typed nodes")
        return nodes
    page_nodes = [
        node for node in nodes
        if schema_types(node).intersection(
            {"WebPage", "CollectionPage", "LearningResource", "Article"}
        )
    ]
    if not page_nodes and filename != "index.html":
        failures.add(f"{filename}: JSON-LD has no page or learning-resource node")
    for node in page_nodes:
        types = schema_types(node)
        is_article = "Article" in types
        node_url = normalise_space(node.get("url") or node.get("mainEntityOfPage"))
        if node_url and node_url != canonical:
            failures.add(
                f"{filename}: JSON-LD {node.get('@type')} URL {node_url!r} "
                f"does not match canonical {canonical!r}"
            )
        node_name = normalise_space(node.get("name"))
        node_description = normalise_space(node.get("description"))
        visible_h1 = [element.text for element in parser.find("h1") if element.visible]
        expected_name = visible_h1[0] if is_article and len(visible_h1) == 1 else title
        if node_name and node_name != expected_name:
            failures.add(
                f"{filename}: JSON-LD name does not match "
                + ("article H1" if is_article else "page title")
            )
        if node_description and node_description != description and not is_article:
            failures.add(f"{filename}: JSON-LD description does not match meta description")
        author = node.get("author")
        if is_article:
            if not isinstance(author, dict) or not normalise_space(author.get("name")):
                failures.add(f"{filename}: Article JSON-LD needs a named author")
            if "LearningResource" not in types:
                failures.add(
                    f"{filename}: guide Article must also identify as LearningResource"
                )
        elif author and filename != "about.html":
            failures.add(f"{filename}: JSON-LD author must be omitted outside About")
    breadcrumb_nodes = [node for node in nodes if node.get("@type") == "BreadcrumbList"]
    if filename != "index.html" and len(breadcrumb_nodes) != 1:
        failures.add(
            f"{filename}: expected one BreadcrumbList JSON-LD node, "
            f"found {len(breadcrumb_nodes)}"
        )
    for breadcrumb in breadcrumb_nodes:
        items = breadcrumb.get("itemListElement")
        if not isinstance(items, list) or not items:
            failures.add(f"{filename}: BreadcrumbList has no itemListElement entries")
            continue
        positions = [item.get("position") for item in items if isinstance(item, dict)]
        if positions != list(range(1, len(items) + 1)):
            failures.add(f"{filename}: BreadcrumbList positions are not sequential")
        final = items[-1] if isinstance(items[-1], dict) else {}
        final_url = normalise_space(final.get("item"))
        if final_url and final_url != canonical:
            failures.add(f"{filename}: final JSON-LD breadcrumb does not match canonical")
    return nodes


def element_accessible_name(parser: StaticPageParser, element: Element) -> str:
    direct = normalise_space(element.attrs.get("aria-label"))
    if direct:
        return direct
    labelledby = element.attrs.get("aria-labelledby", "").split()
    if labelledby:
        parts: list[str] = []
        for element_id in labelledby:
            target = next(
                (candidate for candidate in parser.elements
                 if candidate.attrs.get("id") == element_id),
                None,
            )
            if target is not None:
                parts.append(target.text)
        if normalise_space(" ".join(parts)):
            return normalise_space(" ".join(parts))
    return element.text


def validate_accessibility_page(
    root: Path, filename: str, parser: StaticPageParser, failures: Failures
) -> None:
    html_elements = parser.find("html")
    if len(html_elements) != 1:
        failures.add(f"{filename}: expected exactly one html element")
    else:
        language = html_elements[0].attrs.get("lang", "").casefold()
        allowed = {"en", "en-nz"} if page_is_noindex(parser) else {"en-nz"}
        if language not in allowed:
            failures.add(
                f"{filename}: html lang must be en-NZ"
                + (" (or en on a redirect shell)" if page_is_noindex(parser) else "")
            )

    if len(parser.find("main")) != 1:
        failures.add(f"{filename}: expected exactly one main landmark")
    visible_h1 = [element for element in parser.find("h1") if element.visible]
    if len(visible_h1) != 1:
        failures.add(f"{filename}: expected exactly one visible H1, found {len(visible_h1)}")

    for element_id, lines in parser.ids.items():
        if len(lines) > 1:
            failures.add(
                f"{filename}: duplicate id {element_id!r} at lines {lines[:6]}"
            )

    headings = [
        element for element in parser.elements
        if re.fullmatch(r"h[1-6]", element.tag) and element.visible
    ]
    previous_level = 0
    for heading in headings:
        level = int(heading.tag[1])
        if previous_level and level > previous_level + 1:
            failures.add(
                f"{filename}:{heading.line}: heading jumps from H{previous_level} "
                f"to H{level}"
            )
        previous_level = level

    runtime_sources: list[str] = []
    for script in parser.find("script"):
        src = script.attrs.get("src", "")
        parsed_src = urlsplit(src)
        if parsed_src.scheme or parsed_src.netloc or not parsed_src.path.endswith(".js"):
            continue
        target = root / unquote(parsed_src.path).lstrip("/")
        try:
            runtime_sources.append(target.read_text(encoding="utf-8"))
        except (OSError, UnicodeError):
            continue

    def runtime_declares_id(element_id: str) -> bool:
        quoted = re.compile(rf"['\"]{re.escape(element_id)}['\"]")
        return any(quoted.search(source) for source in runtime_sources)

    for element in parser.elements:
        if (
            element.tag in {"div", "span", "p"}
            and (element.attrs.get("aria-label") or element.attrs.get("aria-labelledby"))
            and not element.attrs.get("role")
        ):
            failures.add(
                f"{filename}:{element.line}: generic {element.tag} is named with ARIA "
                "but has no semantic role"
            )
        for attribute in ("aria-controls", "aria-labelledby", "aria-describedby"):
            value = element.attrs.get(attribute, "").strip()
            if not value:
                continue
            missing = [
                token for token in value.split()
                if token not in parser.ids and not runtime_declares_id(token)
            ]
            if missing:
                failures.add(
                    f"{filename}:{element.line}: {attribute} references missing "
                    f"id(s) {missing}"
                )
        if "aria-expanded" in element.attrs:
            expanded = element.attrs["aria-expanded"].casefold()
            if expanded not in {"true", "false"}:
                failures.add(
                    f"{filename}:{element.line}: aria-expanded must be true or false"
                )
            if not element.attrs.get("aria-controls"):
                failures.add(
                    f"{filename}:{element.line}: aria-expanded control lacks aria-controls"
                )

    buttons = parser.find("button")
    names: dict[str, list[Element]] = defaultdict(list)
    for button in buttons:
        name = element_accessible_name(parser, button)
        if not name:
            failures.add(f"{filename}:{button.line}: button has no accessible name")
        else:
            names[name.casefold()].append(button)
    for name, repeated in names.items():
        controlled = {button.attrs.get("aria-controls", "") for button in repeated}
        if len(repeated) > 1 and len(controlled - {""}) > 1:
            failures.add(
                f"{filename}: repeated button name {name!r} controls different content; "
                "give each control a unique accessible name"
            )

    label_targets = {
        element.attrs.get("for") for element in parser.find("label")
        if element.attrs.get("for")
    }
    for control in [
        element for element in parser.elements
        if element.tag in {"input", "select", "textarea"}
        and element.attrs.get("type", "").casefold() != "hidden"
    ]:
        control_id = control.attrs.get("id", "")
        labelled = bool(
            control.attrs.get("aria-label")
            or control.attrs.get("aria-labelledby")
            or (control_id and control_id in label_targets)
        )
        if not labelled:
            failures.add(
                f"{filename}:{control.line}: {control.tag} has no programmatic label"
            )


def validate_shared_accessibility_contract(root: Path, failures: Failures) -> None:
    try:
        runtime = (root / "walkthrough-gate.js").read_text(encoding="utf-8")
        styles = (root / "style.css").read_text(encoding="utf-8")
    except (OSError, UnicodeError) as error:
        failures.add(f"shared accessibility assets cannot be read ({error})")
        return
    runtime_requirements = {
        "skip-link creation": r"className\s*=\s*[\"']skip-link[\"']",
        "working reveal aria-controls": r"aria-controls=[\"']walkthrough-step-\$\{stepNumber\}-working",
        "working reveal aria-expanded": r"aria-expanded=[\"']false[\"']",
        "step-specific working accessible name": r"Show working for Step",
        "exam-mode reveal disclosure relationship": (
            r"revealButton\.setAttribute\([\"']aria-controls[\"']"
            r"[\s\S]{0,300}revealButton\.setAttribute\([\"']aria-expanded[\"']"
        ),
        "logical focus after exam-mode reveal": r"focusRevealedContent\(",
        "final-answer disclosure relationship": (
            r"nextButton\.setAttribute\([\"']aria-controls[\"']"
            r"[\s\S]{0,300}nextButton\.setAttribute\([\"']aria-expanded[\"']"
        ),
        "mobile progress indicator": r"walkthrough-mobile-progress",
        "sidebar progress group semantics": (
            r"walkthrough-sidebar-progress[\"']\s+role=[\"']group[\"']"
        ),
        "question-save group semantics": (
            r"question-personal-actions[\"']\s+role=[\"']group[\"']"
        ),
        "logical focus after final answer": (
            r"walkthroughComplete\s*=\s*true[\s\S]{0,300}focusRevealedContent\("
        ),
        "logical focus after step navigation": r"heading\.focus\s*\(",
        "KaTeX auto-render with MathML default": r"renderMathInElement",
    }
    for label, pattern in runtime_requirements.items():
        if not re.search(pattern, runtime):
            failures.add(f"walkthrough-gate.js: missing {label} accessibility contract")
    if re.search(r"\boutput\s*:\s*[\"']html[\"']", runtime):
        failures.add(
            "walkthrough-gate.js: KaTeX output=html removes the MathML accessibility layer"
        )
    if re.search(
        r"walkthrough-mobile-progress[\"'][^>]*\baria-live\s*=", runtime
    ):
        failures.add(
            "walkthrough-gate.js: mobile progress duplicates the canonical live status"
        )
    style_requirements = {
        "visible keyboard focus": r":focus-visible",
        "solid high-contrast focus token": r"--focus-ring:\s*#[0-9a-f]{6}",
        "lightbox focus contrast": (
            r"\.question-image-lightbox-close:focus-visible\s*\{[^}]*"
            r"outline:\s*3px\s+solid\s+#fff\s*!important"
        ),
        "skip-link focus style": r"\.skip-link:focus",
        "reduced motion": r"prefers-reduced-motion:\s*reduce",
        "focused-content scroll clearance": r"scroll-padding|scroll-margin",
        "44px walkthrough setting target": (
            r"\.walkthrough-setting-toggle\s*\{[^}]*min-height:\s*44px"
        ),
        "44px range target": (
            r"input\[type=[\"']range[\"']\]\s*\{[^}]*min-height:\s*44px"
        ),
        "44px no-JavaScript details target": (
            r"\.static-first-step-working\s*>\s*summary\s*\{[^}]*min-height:\s*44px"
        ),
        "solid off-state setting boundary": (
            r"\.walkthrough-setting-switch\s*\{[^}]*border:\s*1px\s+solid\s+#[0-9a-f]{6}"
        ),
        "solid home search boundary": (
            r"\.home-search-input\s*\{[^}]*border:\s*1px\s+solid\s+#[0-9a-f]{6}"
        ),
        "mobile walkthrough drawer trigger remains visible": (
            r"\.seo-breadcrumbs\s*\+\s*\.topbar\s+\.ghost-link:not\("
            r"\.walkthrough-sidebar-open-toggle\)\s*\{[^}]*display:\s*none"
        ),
    }
    for label, pattern in style_requirements.items():
        if not re.search(pattern, styles, re.I):
            failures.add(f"style.css: missing {label}")


def validate_static_pages(
    root: Path,
    pages: Mapping[str, StaticPageParser],
    failures: Failures,
) -> tuple[dict[str, tuple[str, str, str]], dict[str, list[str]]]:
    metadata_by_file: dict[str, tuple[str, str, str]] = {}
    uniqueness: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))
    for filename, parser in sorted(pages.items()):
        validate_accessibility_page(root, filename, parser, failures)
        validate_icon_metadata(root, filename, parser, failures)
        if filename in NO_INITIAL_MATH_ASSET_PAGES:
            math_assets = sorted({
                element.attrs.get(attribute, "")
                for element in parser.elements
                for attribute in ("src", "href")
                if attribute in element.attrs
                and (
                    "katex" in element.attrs.get(attribute, "").casefold()
                    or "auto-render" in element.attrs.get(attribute, "").casefold()
                )
            })
            if math_assets:
                failures.add(
                    f"{filename}: no initial maths but eagerly loads "
                    + ", ".join(math_assets)
                )
        if page_is_noindex(parser):
            continue
        title = exactly_one(
            document_title_values(parser),
            filename, "title", failures,
        )
        description = exactly_one(
            parser.meta_name("description"), filename, "meta description", failures
        )
        canonical = exactly_one(
            parser.canonical_values(), filename, "canonical", failures
        )
        metadata_by_file[filename] = (title, description, canonical)
        for field_name, value in (
            ("title", title), ("description", description), ("canonical", canonical),
        ):
            if value:
                uniqueness[field_name][value.casefold()].append(filename)
        if canonical:
            parsed = urlsplit(canonical)
            if parsed.scheme != "https" or parsed.netloc != "calc.nz" or parsed.fragment:
                failures.add(f"{filename}: canonical is not an absolute Calc.nz HTTPS URL")
        robots = " ".join(parser.meta_name("robots")).casefold()
        if re.search(r"(?:^|[\s,])nofollow(?:$|[\s,])", robots):
            failures.add(f"{filename}: indexable page has nofollow")
        has_skip_link = any(
            "skip-link" in element.attrs.get("class", "").split()
            for element in parser.find("a")
        )
        script_names = {
            unquote(urlsplit(element.attrs.get("src", "")).path).split("/")[-1]
            for element in parser.find("script")
        }
        if not has_skip_link and "walkthrough-gate.js" not in script_names:
            failures.add(
                f"{filename}: no static skip link or shared runtime that creates one"
            )
        validate_social_metadata(
            root, filename, parser, title, description, canonical, failures
        )
        validate_jsonld_page(
            filename, parser, canonical, title, description, failures
        )
        if filename != "index.html":
            breadcrumbs = [
                element for element in parser.find("nav")
                if "seo-breadcrumbs" in element.attrs.get("class", "").split()
                or "breadcrumb" in element.attrs.get("aria-label", "").casefold()
            ]
            if len(breadcrumbs) != 1 or not breadcrumbs[0].visible:
                failures.add(f"{filename}: expected one visible breadcrumb navigation")

    duplicate_report: dict[str, list[str]] = {}
    for field_name, values in uniqueness.items():
        duplicate_report[field_name] = []
        for files in values.values():
            # A query-routed shell represents only its default record in static
            # HTML, so physical-page duplicates are never intentional here.
            if len(files) > 1:
                failures.add(f"duplicate indexable {field_name}: {', '.join(files[:6])}")
                duplicate_report[field_name].extend(files)
    return metadata_by_file, duplicate_report


METHOD_CATEGORIES: dict[str, re.Pattern[str]] = {
    "chain-rule": re.compile(r"\bchain rule\b|\binner (?:function|derivative)\b|\bcomposite\b", re.I),
    "product-quotient": re.compile(r"\bproduct rule\b|\bquotient rule\b|\bproduct and quotient\b", re.I),
    "related-rates": re.compile(r"\brelated rate|\brate of (?:change|increase|decrease)|\bd[avrstx]/dt\b", re.I),
    "stationary-optimisation": re.compile(r"\bstationary|\bcritical point|\bturning point|\bmaximi[sz]|\bminimi[sz]|\boptimis", re.I),
    "parametric": re.compile(r"\bparametric|\bd[xy]/dt\b|\bdy/dx.*dt", re.I),
    "implicit": re.compile(r"\bimplicit", re.I),
    "antidifferentiation": re.compile(r"\banti-?differentiat|\bantiderivative|\bconstant of integration", re.I),
    "integration-techniques": re.compile(r"\bintegration by parts|\bsubstitution|\breverse chain|\bpartial fraction|\btrigonometric integr|\bproduct.to.sum", re.I),
    "differential-equations": re.compile(r"\bdifferential equation|\bseparab|\binitial condition|\bgeneral solution", re.I),
    "complex-polynomial": re.compile(r"\bfactor theorem|\bremainder theorem|\bvieta|\blong division|\bconjugate roots", re.I),
    "complex-polar": re.compile(r"\bpolar form|\bde moivre|\bargument|\bquadrant|\bmodulus", re.I),
    "complex-algebra": re.compile(r"\bcomplex (?:division|fraction|algebra)|\bconjugate|\breal and imaginary|\bcartesian form|\blocus", re.I),
}


def method_categories(value: str) -> set[str]:
    plain = plain_math_text(value)
    return {
        category for category, pattern in METHOD_CATEGORIES.items()
        if pattern.search(plain)
    }


def validate_common_mistake_semantics(record: QuestionRecord, failures: Failures) -> None:
    method_kinds = method_categories(record.method)
    mistake_kinds = method_categories(record.common_mistake)
    # Only reject a confident incompatible-topic pairing. Several categories
    # legitimately overlap: for example, solving a differential equation uses
    # antidifferentiation, and an integration technique may still need the
    # constant of integration. Generic neutral advice has no category and is
    # deliberately accepted when no curated route-specific warning is available.
    incompatible_pairs = {
        frozenset(("complex-polynomial", "complex-polar")),
        frozenset(("complex-polynomial", "chain-rule")),
        frozenset(("complex-polynomial", "product-quotient")),
        frozenset(("complex-polynomial", "related-rates")),
        frozenset(("complex-polar", "chain-rule")),
        frozenset(("complex-polar", "product-quotient")),
        frozenset(("complex-polar", "related-rates")),
    }
    mismatch = any(
        frozenset((method_kind, mistake_kind)) in incompatible_pairs
        for method_kind in method_kinds
        for mistake_kind in mistake_kinds
    )
    if mismatch:
        failures.add(
            f"{CATALOGUE_FILE}: {record.paper_id}/{record.question_id} commonMistake "
            f"appears unrelated to its method (method={sorted(method_kinds)}, "
            f"mistake={sorted(mistake_kinds)})"
        )


def validate_method_title_semantics(
    record: QuestionRecord, failures: Failures
) -> None:
    """Catch high-confidence cross-standard method-label collisions.

    The generator uses concise pattern labels before falling back to the full
    method text.  Some mathematical words have different meanings across
    standards (notably algebraic substitution versus integration by
    substitution), so these assertions keep those shared patterns honest.
    """

    focus = plain_math_text(record.method).casefold()
    title = record.method_title.casefold()
    context = f"{CATALOGUE_FILE}: {record.paper_id}/{record.question_id}"
    integration_substitution_mismatch = (
        record.method_title == "Integration by Substitution"
        and record.standard.key != "level-3-integration"
    )
    if integration_substitution_mismatch:
        failures.add(
            f"{context}: Integration by Substitution is reserved for the "
            "Integration standard"
        )
    elif (
        record.standard.key in {"level-2-algebra", "level-3-complex"}
        and "substitution" in focus
        and "integration" in title
    ):
        failures.add(
            f"{context}: algebraic/radical substitution is mislabeled as integration"
        )
    if (
        record.standard.key == "level-3-integration"
        and re.search(r"integrat\w*.*polynomial.*exponential", focus)
        and "integration" not in title
    ):
        failures.add(
            f"{context}: polynomial/exponential integration has a non-integration label"
        )
    if (
        record.standard.key == "level-3-integration"
        and "tangent function" in focus
        and record.method_title == "Tangents"
    ):
        failures.add(
            f"{context}: a trigonometric tangent function is mislabeled as line tangents"
        )
    if (
        record.standard.key in {"level-2-calculus", "level-3-differentiation"}
        and re.search(r"\bcritical points?\b", focus)
        and record.method_title == "Polynomial Algebra"
    ):
        failures.add(
            f"{context}: a critical-point method is mislabeled as Polynomial Algebra"
        )


def first_attr_text(parser: StaticPageParser, name: str) -> str:
    values = parser.with_attr(name)
    return values[0].text if values else ""


def attr_links(parser: StaticPageParser, name: str, value: Optional[str] = None) -> list[Element]:
    return [
        element for element in parser.with_attr(name, value)
        if element.tag == "a"
    ]


def href_matches(actual: str, expected: str) -> bool:
    return normalise_url_path(actual) == normalise_url_path(expected)


def find_learning_resource(nodes: Sequence[Mapping[str, Any]]) -> Optional[Mapping[str, Any]]:
    return next(
        (node for node in nodes if node.get("@type") == "LearningResource"),
        None,
    )


def validate_question_jsonld(
    record: QuestionRecord,
    filename: str,
    nodes: Sequence[Mapping[str, Any]],
    failures: Failures,
) -> None:
    resource = find_learning_resource(nodes)
    if resource is None:
        failures.add(f"{filename}: question JSON-LD has no LearningResource")
        return
    expected = {
        "url": record.canonical,
        "name": record.title,
        "description": record.description,
        "inLanguage": "en-NZ",
    }
    for field_name, wanted in expected.items():
        actual = normalise_space(resource.get(field_name))
        if actual != wanted:
            failures.add(
                f"{filename}: LearningResource.{field_name} is {actual!r}, "
                f"expected {wanted!r}"
            )
    educational_level = normalise_space(resource.get("educationalLevel"))
    if record.standard.level_label not in educational_level:
        failures.add(f"{filename}: JSON-LD educationalLevel disagrees with catalogue")
    about = resource.get("about")
    about_nodes = about if isinstance(about, list) else [about]
    matching_about = next(
        (
            value for value in about_nodes
            if isinstance(value, dict)
            and (
                normalise_space(value.get("termCode")) == record.standard.code
                or record.standard.code in normalise_space(value.get("name"))
            )
        ),
        None,
    )
    if matching_about is None:
        failures.add(f"{filename}: JSON-LD about does not identify {record.standard.code}")
    elif record.standard.official_name not in normalise_space(matching_about.get("name")):
        failures.add(f"{filename}: JSON-LD standard name disagrees with catalogue")
    if resource.get("author"):
        failures.add(f"{filename}: question JSON-LD must not contain an author")

    breadcrumb = next(
        (node for node in nodes if node.get("@type") == "BreadcrumbList"),
        None,
    )
    items = breadcrumb.get("itemListElement") if isinstance(breadcrumb, dict) else None
    if not isinstance(items, list) or len(items) < 4:
        failures.add(f"{filename}: question BreadcrumbList is incomplete")
    else:
        final = items[-1] if isinstance(items[-1], dict) else {}
        if normalise_space(final.get("name")) != record.label:
            failures.add(f"{filename}: JSON-LD breadcrumb question label is incorrect")
        if normalise_space(final.get("item")) != record.canonical:
            failures.add(f"{filename}: JSON-LD breadcrumb question URL is incorrect")


def js_matching_delimiter(source: str, opening: int) -> Optional[int]:
    pairs = {"(": ")", "{": "}", "[": "]"}
    wanted = pairs.get(source[opening]) if 0 <= opening < len(source) else None
    if not wanted:
        return None
    stack = [wanted]
    index = opening + 1
    while index < len(source):
        char = source[index]
        if char in "'\"`":
            quote = char
            index += 1
            while index < len(source):
                if source[index] == "\\":
                    index += 2
                    continue
                if source[index] == quote:
                    index += 1
                    break
                index += 1
            continue
        if source.startswith("//", index):
            newline = source.find("\n", index + 2)
            index = len(source) if newline < 0 else newline + 1
            continue
        if source.startswith("/*", index):
            closing = source.find("*/", index + 2)
            index = len(source) if closing < 0 else closing + 2
            continue
        if char in pairs:
            stack.append(pairs[char])
        elif char in ")}]":
            if not stack or char != stack[-1]:
                return None
            stack.pop()
            if not stack:
                return index
        index += 1
    return None


def config_source_defines_question(source: str, question_id: str) -> bool:
    quoted = rf"[\"']{re.escape(question_id)}[\"']"
    patterns = (
        rf"{quoted}\s*:\s*(?:createConfig\s*\(|\{{)",
        rf"\w+\s*\[\s*{quoted}\s*\]\s*=\s*createConfig\s*\(",
    )
    return any(re.search(pattern, source) for pattern in patterns)


def question_configuration_source(
    root: Path,
    filename: str,
    parser: StaticPageParser,
    cache: dict[str, str],
    failures: Failures,
) -> str:
    chunks: list[str] = []
    path = root / filename
    try:
        chunks.append(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError):
        return ""
    for script in parser.find("script"):
        src = script.attrs.get("src", "")
        local_name = unquote(urlsplit(src).path).split("/")[-1]
        if not local_name.endswith("-data.js") or local_name == "walkthrough-audit-data.js":
            continue
        if local_name not in cache:
            try:
                cache[local_name] = (root / local_name).read_text(encoding="utf-8")
            except (OSError, UnicodeError) as error:
                failures.add(f"{filename}: cannot read data source {local_name} ({error})")
                cache[local_name] = ""
        chunks.append(cache[local_name])
    return "\n".join(chunks)


def question_page_records(
    parser: StaticPageParser,
    filename: str,
    failures: Failures,
) -> dict[str, Mapping[str, Any]]:
    """Read the generated per-page metadata without executing its inline JS."""

    assignments: list[tuple[str, object]] = []
    pattern = re.compile(
        r"^\s*window\.(CALC_NZ_PAGE_RECORDS?)\s*=\s*(\{.*\})\s*;\s*$",
        re.S,
    )
    for script in parser.find("script"):
        if script.attrs.get("src"):
            continue
        source = "".join(script.text_parts)
        if "CALC_NZ_PAGE_RECORD" not in source:
            continue
        match = pattern.fullmatch(source)
        if not match:
            failures.add(f"{filename}: malformed inline walkthrough page-record assignment")
            continue
        try:
            assignments.append((match.group(1), json.loads(match.group(2))))
        except json.JSONDecodeError as error:
            failures.add(f"{filename}: invalid walkthrough page-record JSON ({error})")

    if len(assignments) != 1:
        failures.add(
            f"{filename}: expected exactly one walkthrough page-record assignment, "
            f"found {len(assignments)}"
        )
        return {}

    variable, payload = assignments[0]
    if not isinstance(payload, dict):
        failures.add(f"{filename}: walkthrough page-record payload must be an object")
        return {}
    if variable == "CALC_NZ_PAGE_RECORDS":
        invalid = [key for key, value in payload.items() if not isinstance(key, str) or not isinstance(value, dict)]
        if invalid:
            failures.add(f"{filename}: invalid keyed walkthrough page records: {invalid[:3]}")
            return {}
        return payload

    question = payload.get("question")
    question_id = question.get("id") if isinstance(question, dict) else None
    if not isinstance(question_id, str) or not question_id:
        failures.add(f"{filename}: singular walkthrough page record has no question id")
        return {}
    return {question_id: payload}


def validate_question_page_records(
    filename: str,
    actual: Mapping[str, Mapping[str, Any]],
    expected: Sequence[QuestionRecord],
    failures: Failures,
) -> None:
    expected_by_id = {record.question_id: record for record in expected}
    if set(actual) != set(expected_by_id):
        failures.add(
            f"{filename}: page-record ownership mismatch "
            f"(expected={sorted(expected_by_id)}, found={sorted(actual)})"
        )
        return

    for question_id, expected_record in expected_by_id.items():
        page_record = actual[question_id]
        level = page_record.get("level")
        standard = page_record.get("standard")
        paper = page_record.get("paper")
        question = page_record.get("question")
        if not all(isinstance(value, dict) for value in (level, standard, paper, question)):
            failures.add(f"{filename}: page record {question_id} is structurally incomplete")
            continue
        assert isinstance(level, dict) and isinstance(standard, dict)
        assert isinstance(paper, dict) and isinstance(question, dict)
        expected_values: tuple[tuple[str, object, object], ...] = (
            ("level.id", level.get("id"), expected_record.standard.level_id),
            ("level.label", level.get("label"), expected_record.standard.level_label),
            ("standard.id", standard.get("id"), expected_record.standard.key),
            ("standard.label", standard.get("label"), expected_record.standard.label),
            ("standard.code", standard.get("code"), expected_record.standard.code),
            ("paper.id", paper.get("id"), expected_record.paper_id),
            ("paper.year", paper.get("year"), expected_record.year),
            ("question.id", question.get("id"), expected_record.question_id),
            ("question.label", question.get("label"), expected_record.label),
            ("question.method", question.get("method"), expected_record.method),
            ("question.methodTitle", question.get("methodTitle"), expected_record.method_title),
            ("question.canonical", question.get("canonical"), expected_record.canonical),
            ("question.title", question.get("title"), expected_record.title),
            ("question.description", question.get("description"), expected_record.description),
            ("question.summary", question.get("summary"), expected_record.summary),
            ("question.commonMistake", question.get("commonMistake"), expected_record.common_mistake),
            ("question.skillSlugs", question.get("skillSlugs"), list(expected_record.skill_slugs)),
        )
        for field_name, value, wanted in expected_values:
            if value != wanted:
                failures.add(
                    f"{filename}: page record {question_id} {field_name} is "
                    f"{value!r}, expected {wanted!r}"
                )


def validate_static_walkthrough_fallback(
    parser: StaticPageParser,
    filename: str,
    failures: Failures,
) -> None:
    mounts: dict[str, Element] = {}
    expected_classes = {
        "question-card": "static-walkthrough-question",
        "hints-card": "static-walkthrough-support",
        "walkthrough-content": "static-walkthrough-content",
    }
    for element_id, expected_class in expected_classes.items():
        candidates = [
            element for element in parser.elements
            if element.attrs.get("id") == element_id
        ]
        if len(candidates) != 1:
            failures.add(
                f"{filename}: expected one pre-rendered #{element_id}, "
                f"found {len(candidates)}"
            )
            continue
        element = candidates[0]
        mounts[element_id] = element
        classes = element.attrs.get("class", "").split()
        if element.attrs.get("data-prerendered") != "true" or expected_class not in classes:
            failures.add(f"{filename}: #{element_id} is not marked as static walkthrough content")
        if not element.visible:
            failures.add(f"{filename}: pre-rendered #{element_id} is hidden in raw HTML")

    question_card = mounts.get("question-card")
    if question_card is not None:
        question_index = next(
            index for index, element in enumerate(parser.elements)
            if element is question_card
        )
        content_classes = {
            "question-math", "question-prompt", "step-text", "graph-frame",
            "question-screenshot", "math-block",
        }
        has_question_content = False
        for candidate in parser.elements:
            if not content_classes.intersection(candidate.attrs.get("class", "").split()):
                continue
            parent = candidate.parent
            while parent is not None:
                if parent == question_index:
                    has_question_content = True
                    break
                parent = parser.elements[parent].parent
            if has_question_content:
                break
        if not has_question_content:
            failures.add(f"{filename}: raw #question-card has no authored question content")

    first_idea = [
        element for element in parser.elements
        if element.attrs.get("id") == "static-first-idea-heading"
    ]
    first_step = [
        element for element in parser.elements
        if element.attrs.get("id") == "static-first-step-heading"
    ]
    working = [
        element for element in parser.find("details")
        if "static-first-step-working" in element.attrs.get("class", "").split()
    ]
    if len(first_idea) != 1 or not first_idea[0].text:
        failures.add(f"{filename}: raw walkthrough has no first idea heading")
    if len(first_step) != 1 or not first_step[0].text:
        failures.add(f"{filename}: raw walkthrough has no first guided-step heading")
    if len(working) != 1 or not working[0].text:
        failures.add(f"{filename}: raw walkthrough has no usable first-step working")
    no_script = [element for element in parser.find("noscript") if "JavaScript" in element.text]
    if len(no_script) < 2:
        failures.add(f"{filename}: walkthrough has no useful no-JavaScript state")


def validate_parameter_runtime_contract(root: Path, failures: Failures) -> None:
    try:
        runtime = (root / "walkthrough-gate.js").read_text(encoding="utf-8")
        generator = (root / "scripts" / "build-seo.py").read_text(encoding="utf-8")
    except (OSError, UnicodeError) as error:
        failures.add(f"walkthrough-gate.js: cannot inspect parameter SEO runtime ({error})")
        return
    review_date_match = re.search(
        r'^REVIEW_DATE\s*=\s*["\']([^"\']+)', generator, re.M
    )
    if review_date_match is None or (
        f'dateModified: "{review_date_match.group(1)}"' not in runtime
    ):
        failures.add(
            "walkthrough-gate.js: runtime structured dateModified does not match "
            "build-seo.py REVIEW_DATE"
        )
    required_tokens = {
        "structured question catalogue": CATALOGUE_GLOBAL,
        "per-question canonical": "canonical",
        "per-question title": "title",
        "per-question description": "description",
        "per-question learning summary": "summary",
        "per-question common mistake": "commonMistake",
        "per-question skill links": "skillSlugs",
    }
    for label, token in required_tokens.items():
        if token not in runtime:
            failures.add(
                f"walkthrough-gate.js: parameter-route metadata does not use {label}"
            )
    required_patterns = {
        "active per-page record selection": (
            r"pageRecords\s*&&\s*pageRecords\[context\.partId\]"
        ),
        "complete per-page record identity check": (
            r"pageRecord\.level\.id\s*===\s*context\.level\.id"
            r"[\s\S]{0,500}pageRecord\.standard\.id\s*===\s*context\.standard\.id"
            r"[\s\S]{0,500}pageRecord\.paper\.id\s*===\s*context\.paper\.id"
        ),
        "pre-rendered question replacement": (
            r"questionCard\.innerHTML\s*=\s*buildQuestionCardHtml"
        ),
        "pre-rendered support replacement": (
            r"tipsCard\.innerHTML\s*=\s*buildTipsCardHtml"
        ),
        "pre-rendered walkthrough replacement": (
            r"walkthroughContent\.innerHTML\s*=\s*buildProgressiveWalkthroughHtml"
        ),
        "once-only progressive enhancement": (
            r"questionCard\.dataset\.walkthroughEnhanced\s*===\s*[\"']true[\"']"
        ),
        "catalogue record selected by the active question": (
            r"item\.id\s*===\s*context\.partId"
        ),
        "question-specific H1": (
            r"pageTitle\.textContent\s*=\s*getWalkthroughHeaderTitle\(context\)"
        ),
        "question-specific breadcrumb": (
            r"breadcrumbQuestion\.textContent\s*=\s*questionLabel"
        ),
        "question-specific overview label": (
            r"overviewQuestion\.textContent\s*=\s*questionLabel"
        ),
        "catalogue learning summary": (
            r"catalogueEntry\.question\.summary"
        ),
        "catalogue common mistake": (
            r"catalogueEntry\.question\.commonMistake"
        ),
        "question-specific previous and next links": (
            r"updateWalkthroughSeoRelatedLink\(context,\s*[\"']previous[\"']"
            r"[\s\S]{0,200}updateWalkthroughSeoRelatedLink\(context,\s*[\"']next[\"']"
        ),
        "question-specific structured data": (
            r"buildWalkthroughSeoStructuredData\(context,\s*title,\s*description,\s*canonicalUrl\)"
        ),
    }
    for label, pattern in required_patterns.items():
        if not re.search(pattern, runtime):
            failures.add(
                f"walkthrough-gate.js: missing {label} runtime contract for "
                "query-routed questions"
            )


def validate_walkthroughs(
    root: Path,
    pages: Mapping[str, StaticPageParser],
    records: Sequence[QuestionRecord],
    sitemap_urls: set[str],
    failures: Failures,
) -> None:
    by_source: dict[str, list[QuestionRecord]] = defaultdict(list)
    by_paper: dict[str, list[QuestionRecord]] = defaultdict(list)
    for record in records:
        by_source[record.source_file].append(record)
        by_paper[record.paper_id].append(record)
        validate_method_title_semantics(record, failures)
        validate_common_mistake_semantics(record, failures)
        if record.canonical and record.canonical not in sitemap_urls:
            failures.add(f"{record.href}: canonical is missing from sitemap")
        if not (root / record.source_file).is_file():
            failures.add(f"{record.href}: physical walkthrough file is missing")

    for paper_id, paper_records in by_paper.items():
        for index, record in enumerate(paper_records):
            expected_previous = paper_records[index - 1].href if index > 0 else None
            expected_next = paper_records[index + 1].href if index + 1 < len(paper_records) else None
            expected_fields: dict[str, object] = {
                "standardHref": record.standard.landing_href,
                "yearHref": record.paper_href,
                "previousHref": expected_previous,
                "nextHref": expected_next,
            }
            for field_name, expected in expected_fields.items():
                if record.raw.get(field_name) != expected:
                    failures.add(
                        f"{CATALOGUE_FILE}: {paper_id}/{record.question_id} "
                        f"{field_name} is {record.raw.get(field_name)!r}, "
                        f"expected {expected!r}"
                    )
            if "reviewedDate" in record.raw:
                failures.add(
                    f"{CATALOGUE_FILE}: {paper_id}/{record.question_id} retains obsolete "
                    "reviewedDate; use updatedDate plus reviewStatus"
                )
            reviewed = normalise_space(record.raw.get("updatedDate"))
            try:
                reviewed_date = date.fromisoformat(reviewed)
            except ValueError:
                failures.add(
                    f"{CATALOGUE_FILE}: {paper_id}/{record.question_id} has invalid "
                    f"updatedDate {reviewed!r}"
                )
            else:
                if reviewed_date > date.today():
                    failures.add(
                        f"{CATALOGUE_FILE}: {paper_id}/{record.question_id} updatedDate "
                        f"is in the future"
                    )

            review_status = normalise_space(record.raw.get("reviewStatus"))
            valid_review_statuses = {
                "unreviewed",
                "internally-corrected",
                "awaiting-teacher-review",
                "teacher-reviewed",
            }
            if review_status not in valid_review_statuses:
                failures.add(
                    f"{CATALOGUE_FILE}: {paper_id}/{record.question_id} has invalid "
                    f"reviewStatus {review_status!r}"
                )

    data_cache: dict[str, str] = {}
    for source_file, source_records in sorted(by_source.items()):
        parser = pages.get(source_file)
        if parser is None:
            continue
        configuration = question_configuration_source(
            root, source_file, parser, data_cache, failures
        )
        has_external_question_data = any(
            (
                unquote(urlsplit(script.attrs.get("src", "")).path)
                .split("/")[-1]
                .endswith("-data.js")
                and unquote(urlsplit(script.attrs.get("src", "")).path).split("/")[-1]
                != "walkthrough-audit-data.js"
            )
            for script in parser.find("script")
        )
        for record in source_records:
            # Inline Level 2 Calculus pages do not define a keyed config because
            # one file contains exactly one question. Other shared data sources
            # must expose a config for every logical route.
            if len(source_records) > 1 or has_external_question_data:
                if not config_source_defines_question(configuration, record.question_id):
                    failures.add(
                        f"{record.href}: walkthrough data has no keyed config for "
                        f"{record.question_id}"
                    )

        default = source_records[0]
        if len(source_records) > 1:
            preferred = next(
                (record for record in source_records if record.question_id == "1a"),
                source_records[0],
            )
            default = preferred

        script_names = {
            unquote(urlsplit(element.attrs.get("src", "")).path).split("/")[-1]
            for element in parser.find("script")
        }
        if CATALOGUE_FILE in script_names:
            failures.add(
                f"{source_file}: question page should use its compact page record, "
                f"not load {CATALOGUE_FILE}"
            )
        validate_question_page_records(
            source_file,
            question_page_records(parser, source_file, failures),
            source_records,
            failures,
        )
        validate_static_walkthrough_fallback(parser, source_file, failures)

        title = exactly_one(
            document_title_values(parser),
            source_file, "title", failures,
        )
        description = exactly_one(
            parser.meta_name("description"), source_file, "meta description", failures
        )
        canonical = exactly_one(
            parser.canonical_values(), source_file, "canonical", failures
        )
        for field_name, actual, expected in (
            ("title", title, default.title),
            ("meta description", description, default.description),
            ("canonical", canonical, default.canonical),
        ):
            if expected and actual != expected:
                failures.add(
                    f"{source_file}: default {field_name} disagrees with catalogue "
                    f"record {default.question_id}"
                )

        h1s = [element for element in parser.find("h1") if element.visible]
        h1 = h1s[0].text if len(h1s) == 1 else ""
        for fact in (
            str(default.year), default.standard.level_label,
            default.standard.label, default.label,
        ):
            if h1 and fact.casefold() not in h1.casefold():
                failures.add(f"{source_file}: H1 omits or disagrees with {fact!r}")

        focus = first_attr_text(parser, "data-seo-focus")
        summary = first_attr_text(parser, "data-seo-summary")
        mistake = first_attr_text(parser, "data-seo-mistake")
        if plain_math_text(focus).casefold() != plain_math_text(default.method).casefold():
            failures.add(f"{source_file}: visible method disagrees with catalogue")
        if summary != default.summary:
            failures.add(f"{source_file}: learning summary disagrees with catalogue")
        if mistake != default.common_mistake:
            failures.add(f"{source_file}: common-mistake text disagrees with catalogue")

        overview = next(
            (
                element for element in parser.elements
                if "seo-question-overview" in element.attrs.get("class", "").split()
            ),
            None,
        )
        question_card = next(
            (
                element for element in parser.elements
                if element.attrs.get("id") == "question-card"
            ),
            None,
        )
        if overview is None:
            failures.add(f"{source_file}: missing walkthrough overview")
        else:
            for fact in (
                str(default.year), default.standard.code,
                default.standard.official_name, default.label,
            ):
                if fact.casefold() not in overview.text.casefold():
                    failures.add(
                        f"{source_file}: walkthrough overview omits or disagrees "
                        f"with {fact!r}"
                    )
            if question_card is not None:
                overview_index = parser.elements.index(overview)
                question_index = parser.elements.index(question_card)
                if question_index > overview_index:
                    failures.add(
                        f"{source_file}: question card must appear before the overview"
                    )

        breadcrumb_current = first_attr_text(parser, "data-seo-breadcrumb-question")
        if breadcrumb_current != default.label:
            failures.add(f"{source_file}: breadcrumb question label disagrees with catalogue")
        for attribute, expected in (
            ("data-seo-breadcrumb-standard", default.standard.landing_href),
            ("data-seo-breadcrumb-year", default.paper_href),
        ):
            links = attr_links(parser, attribute)
            if len(links) != 1 or not href_matches(links[0].attrs.get("href", ""), expected):
                failures.add(f"{source_file}: {attribute} link is missing or incorrect")

        standard_links = attr_links(parser, "data-seo-standard-link")
        year_links = attr_links(parser, "data-seo-year-link")
        if not standard_links or any(
            not href_matches(link.attrs.get("href", ""), default.standard.landing_href)
            for link in standard_links
        ):
            failures.add(f"{source_file}: standard links disagree with catalogue")
        if not year_links or any(
            not href_matches(link.attrs.get("href", ""), default.paper_href)
            for link in year_links
        ):
            failures.add(f"{source_file}: paper links disagree with catalogue")

        official_links = [
            element for element in parser.find("a")
            if urlsplit(element.attrs.get("href", "")).hostname
            and urlsplit(element.attrs.get("href", "")).hostname.casefold().endswith("nzqa.govt.nz")
        ]
        if not any(
            default.standard.code.removeprefix("AS") in
            parse_qs(urlsplit(link.attrs.get("href", "")).query).get("standardNumber", [])
            for link in official_links
        ):
            failures.add(f"{source_file}: missing official NZQA {default.standard.code} link")

        siblings = by_paper[default.paper_id]
        index = siblings.index(default)
        expected_previous = siblings[index - 1].href if index > 0 else ""
        expected_next = siblings[index + 1].href if index + 1 < len(siblings) else ""
        for relation, expected in (("previous", expected_previous), ("next", expected_next)):
            links = attr_links(parser, "data-seo-related", relation)
            if len(links) != 1:
                failures.add(f"{source_file}: expected one {relation} related control")
                continue
            link = links[0]
            actual = link.attrs.get("href", "")
            if expected:
                if not href_matches(actual, expected) or "hidden" in link.attrs:
                    failures.add(f"{source_file}: {relation} question link is incorrect")
            elif actual and "hidden" not in link.attrs:
                failures.add(f"{source_file}: terminal {relation} link should be absent/hidden")

        nodes = jsonld_nodes(parser, source_file, failures)
        validate_question_jsonld(default, source_file, nodes, failures)

        for slug in default.skill_slugs:
            wanted = f"skill-{slug}.html"
            has_static_link = any(
                href_matches(element.attrs.get("href", ""), wanted)
                for element in parser.find("a")
            )
            has_runtime_container = bool(parser.with_attr("data-seo-related-skills"))
            if not has_static_link and not has_runtime_container:
                failures.add(
                    f"{source_file}: missing ‘Practise more’ link to {wanted}"
                )

    # Each year page is the crawlable directory and must contain every owned
    # logical route once, in catalogue order.
    for paper_id, paper_records in sorted(by_paper.items()):
        year_file = paper_records[0].paper_href
        parser = pages.get(year_file)
        if parser is None:
            failures.add(f"{year_file}: missing year directory page")
            continue
        links = [
            normalise_url_path(element.attrs.get("href", ""))
            for element in parser.find("a")
            if "index-link-card" in element.attrs.get("class", "").split()
            or "question-index-link" in element.attrs.get("class", "").split()
        ]
        expected = [normalise_url_path(record.href) for record in paper_records]
        if links != expected:
            missing = sorted(set(expected) - set(links))
            unexpected = sorted(set(links) - set(expected))
            failures.add(
                f"{year_file}: question directory disagrees with {paper_id} "
                f"(missing={missing[:3]}, unexpected={unexpected[:3]}, "
                f"order_or_duplicates={not missing and not unexpected})"
            )

    if any(record.is_parameter_route for record in records):
        validate_parameter_runtime_contract(root, failures)


def validate_discovery_pages(
    pages: Mapping[str, StaticPageParser],
    records: Sequence[QuestionRecord],
    sitemap_urls: set[str],
    failures: Failures,
) -> None:
    by_skill: dict[str, list[QuestionRecord]] = defaultdict(list)
    by_standard: dict[str, list[QuestionRecord]] = defaultdict(list)
    for record in records:
        by_standard[record.standard.key].append(record)
        if classify_question is not None:
            expected_slugs = tuple(
                classify_question(record.method, record.standard.key)
            )
            if record.skill_slugs != expected_slugs:
                failures.add(
                    f"{CATALOGUE_FILE}: {record.paper_id}/{record.question_id} "
                    f"skillSlugs={record.skill_slugs!r}, expected {expected_slugs!r}"
                )
        for slug in record.skill_slugs:
            by_skill[slug].append(record)

    if validate_skill_specs is None:
        failures.add("scripts/skill_content.py: cannot import skill classification model")
    else:
        for issue in validate_skill_specs():
            failures.add(f"scripts/skill_content.py: {issue}")
        for slug, spec in SKILL_SPECS.items():
            count = len(by_skill.get(slug, []))
            if count < spec.min_count:
                failures.add(
                    f"{CATALOGUE_FILE}: skill {slug!r} has {count} questions, "
                    f"below configured minimum {spec.min_count}"
                )

    skills_index = pages.get("skills.html")
    if skills_index is None:
        failures.add("skills.html: missing Browse by skill landing page")
    else:
        for slug in sorted(by_skill):
            wanted = f"skill-{slug}.html"
            if not any(
                href_matches(link.attrs.get("href", ""), wanted)
                for link in skills_index.find("a")
            ):
                failures.add(f"skills.html: missing link to {wanted}")

    for slug, skill_records in sorted(by_skill.items()):
        filename = f"skill-{slug}.html"
        parser = pages.get(filename)
        if parser is None:
            failures.add(f"{filename}: declared skill has no substantial static page")
            continue
        canonical = ORIGIN + "/" + filename
        if canonical not in sitemap_urls:
            failures.add(f"{filename}: skill page is missing from sitemap")
        linked_routes = {
            normalise_url_path(link.attrs.get("href", ""))
            for link in parser.find("a")
            if normalise_url_path(link.attrs.get("href", ""))
            in {normalise_url_path(record.href) for record in records}
        }
        expected_routes = {normalise_url_path(record.href) for record in skill_records}
        missing = sorted(expected_routes - linked_routes)
        unexpected = sorted(linked_routes - expected_routes)
        if missing or unexpected:
            failures.add(
                f"{filename}: linked questions disagree with catalogue skillSlugs "
                f"(missing={missing[:4]}, unexpected={unexpected[:4]})"
            )
        expected_methods = {
            normalise_url_path(record.href): record.method_title
            for record in skill_records
        }
        question_cards = [
            link for link in parser.find("a")
            if "index-link-card" in link.attrs.get("class", "").split()
            and normalise_url_path(link.attrs.get("href", "")) in expected_methods
        ]
        if len(question_cards) != len(skill_records):
            failures.add(
                f"{filename}: expected {len(skill_records)} question cards with "
                f"per-card method metadata, found {len(question_cards)}"
            )
        for card in question_cards:
            route_path = normalise_url_path(card.attrs.get("href", ""))
            method = normalise_space(card.attrs.get("data-skill-method"))
            if method != expected_methods[route_path]:
                failures.add(
                    f"{filename}: {route_path} data-skill-method is {method!r}, "
                    f"expected {expected_methods[route_path]!r}"
                )
        if len(expected_routes) < 3:
            failures.add(
                f"{filename}: only {len(expected_routes)} questions support this page; "
                "avoid a thin skill page"
            )
        applicable_standards = {record.standard.landing_href for record in skill_records}
        applicable_years = {record.paper_href for record in skill_records}
        all_hrefs = [link.attrs.get("href", "") for link in parser.find("a")]
        for target in sorted(applicable_standards | applicable_years):
            if not any(href_matches(value, target) for value in all_hrefs):
                failures.add(f"{filename}: missing applicable directory link {target}")
        visible_text = " ".join(
            element.text for element in parser.find("main") if element.visible
        ).casefold()
        if "common mistake" not in visible_text:
            failures.add(f"{filename}: no visible common-mistake guidance")
        if len(visible_text) < 500:
            failures.add(
                f"{filename}: visible skill content is too short to be a useful page"
            )

    undeclared_skill_pages = sorted(
        filename for filename in pages
        if re.fullmatch(r"skill-[a-z0-9-]+\.html", filename)
        and filename[6:-5] not in by_skill
    )
    if undeclared_skill_pages:
        failures.add(
            "undeclared/thin skill pages exist: " + ", ".join(undeclared_skill_pages[:8])
        )

    umbrella = pages.get("level-3-calculus.html")
    if umbrella is None:
        failures.add("level-3-calculus.html: missing Level 3 Calculus umbrella page")
    else:
        hrefs = [link.attrs.get("href", "") for link in umbrella.find("a")]
        for target in ("level-3-differentiation.html", "level-3-integration.html"):
            if not any(href_matches(value, target) for value in hrefs):
                failures.add(f"level-3-calculus.html: missing link to {target}")
        if ORIGIN + "/level-3-calculus.html" not in sitemap_urls:
            failures.add("level-3-calculus.html: umbrella page is missing from sitemap")

    # Standard pages link their owned years; year pages are validated in exact
    # detail by validate_walkthroughs.
    for standard_key, standard_records in sorted(by_standard.items()):
        facts = STANDARD_FACTS[standard_key]
        parser = pages.get(facts.landing_href)
        if parser is None:
            failures.add(f"{facts.landing_href}: missing standard page")
            continue
        hrefs = [link.attrs.get("href", "") for link in parser.find("a")]
        for year_href in sorted({record.paper_href for record in standard_records}):
            if not any(href_matches(value, year_href) for value in hrefs):
                failures.add(f"{facts.landing_href}: missing year link {year_href}")


def validate_search_and_guides(
    root: Path,
    pages: Mapping[str, StaticPageParser],
    records: Sequence[QuestionRecord],
    sitemap_urls: set[str],
    failures: Failures,
) -> None:
    registry_path = root / "guides.json"
    try:
        registry = json.loads(registry_path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, ValueError) as error:
        failures.add(f"guides.json: missing or invalid JSON ({error})")
        return
    if not isinstance(registry, dict) or registry.get("schemaVersion") != 1:
        failures.add("guides.json: expected schemaVersion 1")
        return
    guides = registry.get("guides")
    if not isinstance(guides, list):
        failures.add("guides.json: guides must be a list")
        return

    known_practice_ids: dict[str, set[str]] = defaultdict(set)
    for record in records:
        known_practice_ids[record.standard.key].add(
            f"{record.year}:{record.question_id}"
        )
    guide_slugs: set[str] = set()
    for index, guide in enumerate(guides, 1):
        context = f"guides.json: guide {index}"
        if not isinstance(guide, dict):
            failures.add(f"{context} must be an object")
            continue
        slug = normalise_space(guide.get("slug"))
        context = f"guides.json: {slug or f'guide {index}'}"
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
            failures.add(f"{context} has an invalid slug")
        if slug in guide_slugs:
            failures.add(f"guides.json: duplicate guide slug {slug!r}")
        guide_slugs.add(slug)
        for field_name in (
            "title", "summary", "subject", "author", "reviewedDate", "directAnswer",
        ):
            if not normalise_space(guide.get(field_name)):
                failures.add(f"{context} is missing {field_name}")
        standard_key = normalise_space(guide.get("standardKey"))
        if standard_key not in STANDARD_FACTS:
            failures.add(f"{context} has unknown standardKey {standard_key!r}")
        raw_skills = guide.get("skillSlugs")
        if not isinstance(raw_skills, list) or not raw_skills:
            failures.add(f"{context} needs at least one skillSlugs entry")
            raw_skills = []
        skill_slugs = [normalise_space(value) for value in raw_skills]
        unknown_skills = sorted(
            value for value in skill_slugs if value not in SKILL_SPECS
        )
        if unknown_skills:
            failures.add(f"{context} has unknown skill slugs {unknown_skills!r}")
        if len(skill_slugs) != len(set(skill_slugs)):
            failures.add(f"{context} has duplicate skill slugs")
        mismatched_skills = sorted(
            value for value in skill_slugs
            if value in SKILL_SPECS
            and standard_key not in SKILL_SPECS[value].standard_ids
        )
        if mismatched_skills:
            failures.add(
                f"{context} has skills outside {standard_key!r}: "
                f"{mismatched_skills!r}"
            )
        reviewed_date = normalise_space(guide.get("reviewedDate"))
        try:
            parsed_review_date = date.fromisoformat(reviewed_date)
        except ValueError:
            failures.add(f"{context} has invalid reviewedDate {reviewed_date!r}")
        else:
            if parsed_review_date > date.today():
                failures.add(f"{context} reviewedDate is in the future")

        sections = guide.get("sections")
        if not isinstance(sections, list) or len(sections) < 2:
            failures.add(f"{context} needs at least two substantive sections")
            sections = []
        section_ids: set[str] = set()
        for section_index, section in enumerate(sections, 1):
            if not isinstance(section, dict):
                failures.add(f"{context} section {section_index} must be an object")
                continue
            section_id = normalise_space(section.get("id"))
            if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", section_id):
                failures.add(f"{context} section {section_index} has an invalid id")
            if section_id in section_ids:
                failures.add(f"{context} has duplicate section id {section_id!r}")
            section_ids.add(section_id)
            if not normalise_space(section.get("heading")):
                failures.add(f"{context} section {section_index} has no heading")
            if len(plain_math_text(section.get("html"))) < 40:
                failures.add(f"{context} section {section_index} is too thin")

        sources = guide.get("sources")
        if not isinstance(sources, list) or not sources:
            failures.add(f"{context} needs at least one source")
            sources = []
        for source_index, source in enumerate(sources, 1):
            if not isinstance(source, dict) or not normalise_space(source.get("label")):
                failures.add(f"{context} source {source_index} needs a label")
            if not isinstance(source, dict) or not normalise_space(source.get("href")):
                failures.add(f"{context} source {source_index} needs an href")

        related_concepts = guide.get("relatedConcepts", [])
        if not isinstance(related_concepts, list):
            failures.add(f"{context} relatedConcepts must be a list")
            related_concepts = []
        for related_index, related in enumerate(related_concepts, 1):
            if not isinstance(related, dict):
                failures.add(f"{context} related concept {related_index} must be an object")
                continue
            if not normalise_space(related.get("title")):
                failures.add(f"{context} related concept {related_index} needs a title")
            if not normalise_space(related.get("href")):
                failures.add(f"{context} related concept {related_index} needs an href")

        practice_ids = guide.get("practiceQuestionIds", [])
        if not isinstance(practice_ids, list) or not practice_ids:
            failures.add(
                f"{context} practiceQuestionIds must be a nonempty list"
            )
            practice_ids = []
        normalised_practice_ids = [normalise_space(value) for value in practice_ids]
        if any(
            not re.fullmatch(r"20\d{2}:[1-9]\d*[a-z]", value)
            for value in normalised_practice_ids
        ):
            failures.add(f"{context} has invalid practice question ids")
        if len(normalised_practice_ids) != len(set(normalised_practice_ids)):
            failures.add(f"{context} has duplicate practice question ids")
        unknown_practice = sorted(
            value for value in normalised_practice_ids
            if value not in known_practice_ids.get(standard_key, set())
        )
        if unknown_practice:
            failures.add(
                f"{context} has unknown/mismatched practice questions "
                f"{unknown_practice!r}"
            )
        unrelated_practice = sorted(
            f"{record.year}:{record.question_id}"
            for record in records
            if record.standard.key == standard_key
            and f"{record.year}:{record.question_id}" in normalised_practice_ids
            and not (set(record.skill_slugs) & set(skill_slugs))
        )
        if unrelated_practice:
            failures.add(
                f"{context} practice questions do not match its skills "
                f"{unrelated_practice!r}"
            )
        if not isinstance(guide.get("toc", True), bool):
            failures.add(f"{context} toc must be true or false")

    guide_files = {
        filename for filename in pages
        if re.fullmatch(r"guide-[a-z0-9-]+\.html", filename)
    }
    expected_guide_files = {f"guide-{slug}.html" for slug in guide_slugs}
    if guide_files != expected_guide_files:
        failures.add(
            "guide pages disagree with guides.json "
            f"(missing={sorted(expected_guide_files - guide_files)!r}, "
            f"unexpected={sorted(guide_files - expected_guide_files)!r})"
        )
    guides_hub = pages.get("guides.html")
    if guides:
        if guides_hub is None:
            failures.add("guides.html: substantive guides exist but the hub is missing")
        if ORIGIN + "/guides.html" not in sitemap_urls:
            failures.add("guides.html: published hub is missing from sitemap")
        for guide in guides:
            if not isinstance(guide, dict):
                continue
            slug = normalise_space(guide.get("slug"))
            filename = f"guide-{slug}.html"
            if ORIGIN + "/" + filename not in sitemap_urls:
                failures.add(f"{filename}: published guide is missing from sitemap")
            guide_page = pages.get(filename)
            if guide_page is None:
                continue
            if len(guide_page.find("article")) != 1:
                failures.add(f"{filename}: expected one article landmark")
            if "guide-direct-answer" not in guide_page.ids:
                failures.add(f"{filename}: missing direct answer/formula summary")
            authored_math = normalise_space(guide.get("directAnswer")) + " " + " ".join(
                normalise_space(section.get("html"))
                for section in guide.get("sections", [])
                if isinstance(section, dict)
            )
            needs_katex = bool(re.search(
                r"\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]",
                authored_math,
            ))
            asset_values = {
                element.attrs.get(attribute, "")
                for element in guide_page.elements
                for attribute in ("src", "href")
                if element.attrs.get(attribute)
            }
            math_assets = {
                value for value in asset_values
                if "katex" in value.casefold() or "auto-render" in value.casefold()
            }
            render_scripts = [
                element.text for element in guide_page.find("script")
                if "renderMathInElement" in element.text
            ]
            if needs_katex:
                for required_asset in (
                    "dist/katex.min.css",
                    "dist/katex.min.js",
                    "contrib/auto-render.min.js",
                ):
                    if not any(required_asset in value for value in math_assets):
                        failures.add(
                            f"{filename}: authored TeX is missing {required_asset}"
                        )
                if len(render_scripts) != 1:
                    failures.add(
                        f"{filename}: authored TeX needs one KaTeX auto-render call"
                    )
                elif re.search(r"\boutput\s*:\s*[\"']html[\"']", render_scripts[0]):
                    failures.add(
                        f"{filename}: KaTeX output=html removes accessible MathML"
                    )
            elif math_assets or render_scripts:
                failures.add(f"{filename}: maths-free guide eagerly loads KaTeX")
            guide_hrefs = [link.attrs.get("href", "") for link in guide_page.find("a")]
            standard_key = normalise_space(guide.get("standardKey"))
            facts = STANDARD_FACTS.get(standard_key)
            if facts and not any(
                href_matches(value, facts.landing_href) for value in guide_hrefs
            ):
                failures.add(f"{filename}: missing linked standard {facts.landing_href}")
            for skill_slug in guide.get("skillSlugs", []):
                spec = SKILL_SPECS.get(normalise_space(skill_slug))
                if spec and not any(
                    href_matches(value, spec.page_href) for value in guide_hrefs
                ):
                    failures.add(f"{filename}: missing linked skill {spec.page_href}")
            matching_practice = [
                record for record in records
                if record.standard.key == standard_key
                and f"{record.year}:{record.question_id}"
                in guide.get("practiceQuestionIds", [])
            ]
            for record in matching_practice:
                if not any(href_matches(value, record.href) for value in guide_hrefs):
                    failures.add(f"{filename}: missing practice link {record.href}")

            if guides_hub and not any(
                href_matches(link.attrs.get("href", ""), filename)
                for link in guides_hub.find("a")
            ):
                failures.add(f"guides.html: missing guide card for {filename}")
            if facts:
                standard_page = pages.get(facts.landing_href)
                if standard_page and not any(
                    href_matches(link.attrs.get("href", ""), filename)
                    for link in standard_page.find("a")
                ):
                    failures.add(
                        f"{facts.landing_href}: missing reverse guide link {filename}"
                    )
            for skill_slug in guide.get("skillSlugs", []):
                spec = SKILL_SPECS.get(normalise_space(skill_slug))
                skill_page = pages.get(spec.page_href) if spec else None
                if skill_page and not any(
                    href_matches(link.attrs.get("href", ""), filename)
                    for link in skill_page.find("a")
                ):
                    failures.add(
                        f"{spec.page_href}: missing reverse guide link {filename}"
                    )
    else:
        if guides_hub is not None:
            failures.add("guides.html: empty registry must not publish a hub")
        if any("/guide" in urlsplit(url).path for url in sitemap_urls):
            failures.add("sitemap.xml: empty guide registry publishes guide URLs")

    search = pages.get("search.html")
    if search is None:
        failures.add("search.html: global search page is missing")
        return
    if ORIGIN + "/search.html" not in sitemap_urls:
        failures.add("search.html: global search page is missing from sitemap")
    script_names = {
        Path(unquote(urlsplit(script.attrs.get("src", "")).path)).name
        for script in search.find("script") if script.attrs.get("src")
    }
    for required in ("search-core.js", "search-page.js", "site-shell.js"):
        if required not in script_names:
            failures.add(f"search.html: missing required script {required}")
    if CATALOGUE_FILE in script_names:
        failures.add("search.html: question catalogue must be loaded on demand")
    search_forms = [
        form for form in search.find("form")
        if form.attrs.get("role", "").casefold() == "search"
    ]
    if len(search_forms) != 1:
        failures.add("search.html: expected one role=search form")
    if len([
        element for element in search.find("input")
        if element.attrs.get("type", "").casefold() == "search"
        and "data-global-search-input" in element.attrs
    ]) != 1:
        failures.add("search.html: expected one labelled global search input")
    if not any(
        element.attrs.get("aria-live") == "polite"
        and "data-global-search-status" in element.attrs
        for element in search.elements
    ):
        failures.add("search.html: missing polite search result status")
    if len(search.with_attr("data-global-search-results")) != 1:
        failures.add("search.html: missing search result container")

    embedded_records: list[dict[str, Any]] = []
    inline_scripts = [
        element.text for element in search.find("script")
        if "CALC_NZ_STATIC_SEARCH_RECORDS" in element.text
    ]
    if len(inline_scripts) != 1:
        failures.add(
            "search.html: expected one embedded static search-record assignment"
        )
    else:
        match = re.fullmatch(
            r"window\.CALC_NZ_STATIC_SEARCH_RECORDS\s*=\s*(\[[\s\S]*\]);",
            inline_scripts[0],
        )
        try:
            payload = json.loads(match.group(1)) if match else None
        except (TypeError, ValueError):
            payload = None
        if not isinstance(payload, list) or not all(
            isinstance(record, dict) for record in payload
        ):
            failures.add("search.html: static search records are not valid JSON objects")
        else:
            embedded_records = payload
    record_types = {
        normalise_space(record.get("type")) for record in embedded_records
    }
    wanted_types = {"Standard", "Paper", "Skill"} | ({"Guide"} if guides else set())
    if record_types != wanted_types:
        failures.add(
            f"search.html: static result types {sorted(record_types)!r}, "
            f"expected {sorted(wanted_types)!r}"
        )
    if any(normalise_space(record.get("type")) == "Question" for record in embedded_records):
        failures.add("search.html: question records must remain in the lazy catalogue")
    for guide in guides:
        if not isinstance(guide, dict):
            continue
        slug = normalise_space(guide.get("slug"))
        filename = f"guide-{slug}.html"
        matches = [
            record for record in embedded_records
            if normalise_space(record.get("type")) == "Guide"
            and normalise_url_path(normalise_space(record.get("href"))) == filename
        ]
        if len(matches) != 1:
            failures.add(
                f"search.html: expected one static Guide record for {filename}, "
                f"found {len(matches)}"
            )
            continue
        authored_values = [normalise_space(guide.get("directAnswer"))]
        authored_values.extend(
            f"{normalise_space(section.get('heading'))} "
            f"{normalise_space(section.get('html'))}"
            for section in guide.get("sections", [])
            if isinstance(section, dict)
        )
        authored_values.extend(
            normalise_space(item.get("title"))
            for item in guide.get("relatedConcepts", [])
            if isinstance(item, dict)
        )
        searchable_prose = " ".join(
            re.sub(
                r"\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]",
                " ",
                value,
            )
            for value in authored_values
        )
        expected_terms = set(re.findall(
            r"[a-z][a-z'-]{3,}", plain_math_text(searchable_prose).casefold()
        ))
        keyword_text = normalise_space(matches[0].get("keywords")).casefold()
        missing_terms = sorted(
            term for term in expected_terms if term not in keyword_text
        )
        if missing_terms:
            failures.add(
                f"search.html: {filename} omits authored guide terms from search "
                f"keywords: {missing_terms[:8]!r}"
            )

    try:
        search_runtime = (root / "search-page.js").read_text(encoding="utf-8")
        generator = (root / "scripts" / "build-seo.py").read_text(encoding="utf-8")
    except (OSError, UnicodeError) as error:
        failures.add(f"search runtime: cannot inspect source ({error})")
    else:
        for token in (
            CATALOGUE_GLOBAL,
            'type: "Question"',
            "loadCatalogue",
            "cataloguePromise = null",
            "requestCatalogue",
            "searchRequestId",
            "stateSignature() !== signature",
            'writeUrl("replaceState")',
            'writeUrl("pushState")',
            'window.addEventListener("popstate"',
        ):
            if token not in search_runtime:
                failures.add(f"search-page.js: missing lazy question contract {token!r}")
        cache_match = re.search(r'^CACHE_TOKEN\s*=\s*["\']([^"\']+)', generator, re.M)
        runtime_tokens = set(re.findall(r"\?v=([0-9A-Za-z._-]+)", search_runtime))
        if cache_match is None or runtime_tokens != {cache_match.group(1)}:
            failures.add(
                "search-page.js: lazy catalogue token does not match build-seo.py "
                "CACHE_TOKEN"
            )

    for filename, parser in pages.items():
        if not any(
            href_matches(link.attrs.get("href", ""), "search.html")
            for link in parser.find("a")
        ):
            failures.add(f"{filename}: no crawlable global search link")
        guide_linked = any(
            href_matches(link.attrs.get("href", ""), "guides.html")
            for link in parser.find("a")
        )
        if bool(guides) != guide_linked and filename != "guides.html":
            state = "missing" if guides else "published with an empty registry"
            failures.add(f"{filename}: Guides navigation is {state}")


def validate_homepage_architecture(
    root: Path, parser: Optional[StaticPageParser], records: Sequence[QuestionRecord],
    failures: Failures,
) -> tuple[int, int]:
    if parser is None:
        failures.add("index.html: homepage is missing")
        return (0, 0)
    element_count = len(parser.elements)
    link_count = len([element for element in parser.find("a") if element.attrs.get("href")])
    logical_routes = {normalise_url_path(record.href) for record in records}
    pre_rendered_question_links = [
        element for element in parser.find("a")
        if normalise_url_path(element.attrs.get("href", "")) in logical_routes
    ]
    if pre_rendered_question_links:
        failures.add(
            f"index.html: {len(pre_rendered_question_links)} question links are still "
            "pre-rendered instead of being created on demand"
        )
    if parser.with_attr("data-paper-panel"):
        failures.add("index.html: hidden paper panels remain in the static DOM")
    script_names = {
        unquote(urlsplit(element.attrs.get("src", "")).path).split("/")[-1]
        for element in parser.find("script")
    }
    required_lazy_scripts = {"site-shell.js", "search-core.js", "index-loader.js"}
    missing_lazy_scripts = sorted(required_lazy_scripts - script_names)
    if missing_lazy_scripts:
        failures.add(
            "index.html: missing lazy homepage scripts "
            + ", ".join(missing_lazy_scripts)
        )
    eager_scripts = sorted(
        {CATALOGUE_FILE, "index-page.js"}.intersection(script_names)
    )
    if eager_scripts:
        failures.add(
            "index.html: catalogue/practice scripts must be loaded on demand, not "
            "in initial HTML: " + ", ".join(eager_scripts)
        )
    initial_math_assets = sorted({
        element.attrs.get(attribute, "")
        for element in parser.elements
        for attribute in ("src", "href")
        if attribute in element.attrs
        and (
            "katex" in element.attrs.get(attribute, "").casefold()
            or "auto-render" in element.attrs.get(attribute, "").casefold()
        )
    })
    if initial_math_assets:
        failures.add(
            "index.html: KaTeX must not load before content requiring maths: "
            + ", ".join(initial_math_assets)
        )
    live_regions = [
        element for element in parser.elements
        if element.attrs.get("aria-live") in {"polite", "assertive"}
        or element.attrs.get("role") in {"status", "alert"}
    ]
    if not live_regions:
        failures.add("index.html: selector/search has no live-region announcements")
    result_lists = [
        *parser.with_attr("data-search-results"),
        *parser.with_attr("data-practice-output"),
        *[
            element for element in parser.with_attr("id")
            if element.attrs.get("id") == "home-library-results"
        ],
    ]
    for element in result_lists:
        if "aria-live" in element.attrs:
            failures.add(
                f"index.html:{element.line}: dynamic result list must not be an "
                "atomic live region; announce its dedicated status instead"
            )
    for status_attribute in (
        "data-search-status",
        "data-practice-status",
        "data-library-status",
    ):
        statuses = parser.with_attr(status_attribute)
        if len(statuses) != 1 or statuses[0].attrs.get("role") != "status":
            failures.add(
                f"index.html: expected one dedicated role=status for {status_attribute}"
            )
    try:
        runtime = (root / "index-page.js").read_text(encoding="utf-8")
        loader = (root / "index-loader.js").read_text(encoding="utf-8")
        generator = (root / "scripts" / "build-seo.py").read_text(encoding="utf-8")
    except (OSError, UnicodeError) as error:
        failures.add(f"homepage scripts: cannot inspect selector/lazy runtime ({error})")
        return element_count, link_count
    contracts = {
        "structured catalogue use": CATALOGUE_GLOBAL,
        "browser history state": "pushState",
        "browser back restoration": "popstate",
        "logical focus movement": ".focus(",
    }
    for label, token in contracts.items():
        if token not in runtime:
            failures.add(f"index-page.js: missing {label}")
    for token in (
        CATALOGUE_FILE,
        "index-page.js",
        "IntersectionObserver",
        "focusin",
        "deferredActivationPending",
        'dispatchEvent(new Event("input"',
        "requestHomepageTools();",
    ):
        if token not in loader:
            failures.add(f"index-loader.js: missing lazy-load contract {token!r}")
    cache_match = re.search(r'^CACHE_TOKEN\s*=\s*["\']([^"\']+)', generator, re.M)
    loader_tokens = set(re.findall(r"\?v=([0-9A-Za-z._-]+)", loader))
    if cache_match is None:
        failures.add("scripts/build-seo.py: cannot identify CACHE_TOKEN")
    elif loader_tokens != {cache_match.group(1)}:
        failures.add(
            "index-loader.js: lazy asset tokens do not match build-seo.py "
            f"CACHE_TOKEN ({sorted(loader_tokens)!r})"
        )
    return element_count, link_count


def validate_local_practice_contract(root: Path, failures: Failures) -> None:
    sources: list[str] = []
    for filename in ("walkthrough-gate.js", "index-page.js"):
        try:
            sources.append((root / filename).read_text(encoding="utf-8"))
        except (OSError, UnicodeError):
            pass
    source = "\n".join(sources)
    contracts = {
        "bookmarks": r"bookmark",
        "retry list": r"retry",
        "random question": r"random",
        "10/20-minute practice sets": r"10.{0,80}20|20.{0,80}10",
        "continue where you left off": r"continue",
        "clear/reset local progress": r"clear|reset",
        "local-only persistence": r"localStorage",
        "storage failure fallback": r"try\s*\{[\s\S]{0,500}localStorage[\s\S]{0,500}catch",
        "walkthrough per-key volatile fallback": r"walkthroughVolatileStorageKeys",
        "homepage per-key volatile fallback": r"volatileStorageKeys",
    }
    for label, pattern in contracts.items():
        if not re.search(pattern, source, re.I):
            failures.add(f"shared practice runtime: missing {label} contract")


def validate_no_tracking_scripts(
    pages: Mapping[str, StaticPageParser], failures: Failures
) -> None:
    allowed_external_hosts = {"cdn.jsdelivr.net"}
    findings: list[str] = []
    for filename, parser in pages.items():
        for script in parser.find("script"):
            src = script.attrs.get("src", "")
            hostname = urlsplit(src).hostname
            if hostname and hostname.casefold() not in allowed_external_hosts:
                findings.append(f"{filename}:{script.line} {src}")
    if findings:
        failures.add(
            "unexpected external scripts (analytics/tracking are not permitted): "
            + "; ".join(findings[:10])
        )


def main(argv: Optional[Sequence[str]] = None) -> int:
    argument_parser = argparse.ArgumentParser(description=__doc__)
    argument_parser.add_argument(
        "--root", type=Path, default=Path(__file__).resolve().parents[1],
        help="generated site root (default: parent of scripts directory)",
    )
    argument_parser.add_argument(
        "--max-errors", type=int, default=150,
        help="maximum findings to print; 0 prints all (default: 150)",
    )
    args = argument_parser.parse_args(argv)
    root = args.root.resolve()
    failures = Failures()

    records = read_catalogue(root, failures)
    pages = parse_pages(root, failures)
    entries = parse_sitemap(root, failures)

    validate_personal_name(root, failures)
    validate_robots(root, failures)
    validate_references(root, pages, failures)
    validate_no_tracking_scripts(pages, failures)
    validate_shared_accessibility_contract(root, failures)
    validate_static_pages(root, pages, failures)
    sitemap_urls = validate_sitemap(root, pages, records, entries, failures)

    if records:
        validate_walkthroughs(root, pages, records, sitemap_urls, failures)
        validate_discovery_pages(pages, records, sitemap_urls, failures)
        validate_search_and_guides(root, pages, records, sitemap_urls, failures)
        homepage_elements, homepage_links = validate_homepage_architecture(
            root, pages.get("index.html"), records, failures
        )
    else:
        homepage_elements = 0
        homepage_links = 0
    validate_local_practice_contract(root, failures)

    if failures.items:
        limit = len(failures.items) if args.max_errors == 0 else max(1, args.max_errors)
        print(
            f"Site quality validation failed: {len(failures.items)} issue(s)",
            file=sys.stderr,
        )
        for message in failures.items[:limit]:
            print(f"- {message}", file=sys.stderr)
        if len(failures.items) > limit:
            print(
                f"- ... {len(failures.items) - limit} more; use --max-errors 0 "
                "to show all",
                file=sys.stderr,
            )
        print(
            f"Homepage static complexity: {homepage_elements} elements, "
            f"{homepage_links} links.",
            file=sys.stderr,
        )
        return 1

    print(
        "Site quality validation passed: "
        f"{len(records)} logical walkthroughs, {len(pages)} physical HTML pages, "
        f"{len(entries)} sitemap URLs. Homepage static complexity: "
        f"{homepage_elements} elements, {homepage_links} links."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
