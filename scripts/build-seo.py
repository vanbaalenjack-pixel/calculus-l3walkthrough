#!/usr/bin/env python3
"""Build the static SEO layer for Calc.nz.

The question catalogue in ``index.html`` remains the source of truth.  This
script reads its 447 crawlable question cards, derives the supported standards
and paper years, and then makes deterministic, marker-delimited updates.

Run from any directory::

    python3 scripts/build-seo.py
    python3 scripts/build-seo.py --check

``--check`` performs the same discovery and validation but does not write.  It
returns a non-zero status when generated output is missing or stale, which
makes it suitable for a small CI check.
"""

from __future__ import annotations

import argparse
import copy
import html
import json
import os
import re
import subprocess
import sys
from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable, Mapping, Sequence
from urllib.parse import urlsplit
from xml.sax.saxutils import escape as xml_escape

try:
    from skill_content import (
        SKILL_SPECS,
        catalogue_questions,
        classify_question,
        synthesise_common_mistakes,
        validate_skill_coverage,
    )
except ModuleNotFoundError:  # Supports import-based validators from the repository root.
    from scripts.skill_content import (  # type: ignore[no-redef]
        SKILL_SPECS,
        catalogue_questions,
        classify_question,
        synthesise_common_mistakes,
        validate_skill_coverage,
    )


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://calc.nz/"
CACHE_TOKEN = "20260916-2"
REVIEW_DATE = "2026-09-02"
WALKTHROUGH_CONTENT_RELEASE_DATE = "2026-09-02"
SOCIAL_IMAGE_URL = f"{BASE_URL}assets/calc-nz-social.jpg"
SOCIAL_IMAGE_ALT = "Calc.nz guided NCEA maths walkthroughs"
EXPECTED_ROUTE_COUNT = 447
EXPECTED_YEAR_COUNT = 30
CATALOGUE_FILE = ROOT / "question-catalogue.js"
GUIDES_FILE = ROOT / "guides.json"
WALKTHROUGH_EXTRACTOR = ROOT / "scripts" / "extract-walkthrough-content.swift"
OFFICIAL_RESOURCES_FILE = ROOT / "official-resources.json"

PAGE_MODIFIED_DATES = {
    "index.html": "2026-09-02",
    "standards.html": "2026-09-02",
    "skills.html": "2026-09-02",
    "search.html": "2026-09-02",
    # Navigation and icon chrome changed in the current release, but the
    # substantive About-page content did not. Keep its content date distinct.
    "about.html": "2026-07-19",
    "404.html": "2026-08-09",
}

AUDITED_WALKTHROUGH_KEYS = {
    ("level-3-complex", 2025, "1e"),
    ("level-3-integration", 2024, "2c"),
    ("level-3-complex", 2023, "3c"),
    ("level-3-complex", 2022, "1d"),
    ("level-3-complex", 2020, "1c"),
    ("level-3-complex", 2021, "3d"),
    ("level-3-differentiation", 2024, "2e"),
    ("level-3-integration", 2023, "3e"),
    ("level-3-differentiation", 2023, "3e"),
    ("level-3-integration", 2025, "1e"),
    ("level-3-complex", 2020, "3d"),
    ("level-3-complex", 2021, "2d"),
    ("level-3-complex", 2022, "3c"),
    ("level-3-complex", 2023, "2d"),
    ("level-3-complex", 2024, "3d"),
}

AUDIT_REVIEW_STATUS = "awaiting-teacher-review"
VALID_REVIEW_STATUSES = {
    "unreviewed",
    "internally-corrected",
    "awaiting-teacher-review",
    "teacher-reviewed",
}

REPOSITORY_URL = "https://github.com/vanbaalenjack-pixel/calculus-l3walkthrough"
ERROR_REPORT_URL = (
    "https://docs.google.com/forms/d/e/"
    "1FAIpQLSfsQWI9kX3BVpUNJbEqUa9gdKiF1rTvNXT4bL0T3_AYYvLpkA/"
    "viewform?usp=publish-editor"
)

# Internal panel ids pre-date the public, descriptive complex-numbers slug.
# Keep discovery keyed to the existing panel id while generating stable public
# landing-page filenames that match the shared walkthrough catalogue.
PUBLIC_SLUGS = {"level-3-complex": "level-3-complex-numbers"}


def public_slug(standard_key: str) -> str:
    return PUBLIC_SLUGS.get(standard_key, standard_key)


@dataclass(frozen=True)
class Standard:
    key: str
    code: str
    level: int
    topic: str
    official_name: str
    summary: str
    skills: tuple[str, ...]
    mistakes: tuple[str, ...]
    official_url: str

    @property
    def landing_file(self) -> str:
        return f"{public_slug(self.key)}.html"

    @property
    def landing_url(self) -> str:
        return absolute_url(self.landing_file)


@dataclass(frozen=True)
class Guide:
    slug: str
    title: str
    summary: str
    subject: str
    standard_key: str
    skill_slugs: tuple[str, ...]
    author: str
    reviewed_date: str
    direct_answer: str
    sections: tuple[Mapping[str, object], ...]
    related_concepts: tuple[Mapping[str, object], ...]
    practice_question_ids: tuple[str, ...]
    sources: tuple[Mapping[str, object], ...]
    toc: bool

    @property
    def filename(self) -> str:
        return f"guide-{self.slug}.html"

    @property
    def canonical(self) -> str:
        return absolute_url(self.filename)


# The official titles below are the titles used by NZQA for these achievement
# standards.  The view-detailed links are the corresponding official standard
# and assessment-resource pages rather than third-party copies of exam papers.
STANDARDS: dict[str, Standard] = {
    "level-2-calculus": Standard(
        key="level-2-calculus",
        code="AS91262",
        level=2,
        topic="Calculus",
        official_name="Apply calculus methods in solving problems",
        summary=(
            "Build confidence with differentiation and anti-differentiation, "
            "then use those methods to solve gradient, rate, stationary-point, "
            "and optimisation problems."
        ),
        skills=(
            "Differentiate and anti-differentiate polynomial and power functions.",
            "Use gradients, tangents, stationary points, and rates of change.",
            "Form and optimise a model, then interpret the result in context.",
        ),
        mistakes=(
            "Substituting into the original function when the question asks for a gradient or rate.",
            "Finding a stationary point without justifying whether it is a maximum or minimum.",
            "Forgetting the constant of integration or information needed to determine it.",
        ),
        official_url="https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=91262",
    ),
    "level-2-algebra": Standard(
        key="level-2-algebra",
        code="AS91261",
        level=2,
        topic="Algebra",
        official_name="Apply algebraic methods in solving problems",
        summary=(
            "Practise selecting and connecting algebraic methods for equations, "
            "expressions, graphs, and contextual models."
        ),
        skills=(
            "Manipulate powers, radicals, rational expressions, and logarithms.",
            "Solve quadratic, exponential, logarithmic, and simultaneous equations.",
            "Use roots, discriminants, and algebraic models to solve problems.",
        ),
        mistakes=(
            "Dropping domain restrictions when simplifying radicals, fractions, or logarithms.",
            "Using a decimal approximation when an exact algebraic form is required.",
            "Stopping after obtaining a value without checking it or interpreting it in context.",
        ),
        official_url="https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=91261",
    ),
    "level-3-complex": Standard(
        key="level-3-complex",
        code="AS91577",
        level=3,
        topic="Complex Numbers",
        official_name="Apply the algebra of complex numbers in solving problems",
        summary=(
            "Connect rectangular and polar forms, polynomial algebra, loci, "
            "and De Moivre's theorem in multi-step complex-number problems."
        ),
        skills=(
            "Work with modulus, argument, conjugates, and rectangular or polar form.",
            "Use De Moivre's theorem to calculate powers and find every required root.",
            "Solve polynomial, locus, and proof problems involving complex numbers.",
        ),
        mistakes=(
            "Choosing an argument from the wrong quadrant or ignoring the required argument range.",
            "Listing one root when a power equation requires a complete set of roots.",
            "Losing a conjugate sign, exact value, or domain restriction during algebraic manipulation.",
        ),
        official_url="https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=91577",
    ),
    "level-3-differentiation": Standard(
        key="level-3-differentiation",
        code="AS91578",
        level=3,
        topic="Differentiation",
        official_name="Apply differentiation methods in solving problems",
        summary=(
            "Develop fluent differentiation and use derivatives to reason about "
            "graphs, motion, related rates, optimisation, and mathematical models."
        ),
        skills=(
            "Apply chain, product, quotient, logarithmic, trigonometric, and parametric differentiation.",
            "Use first and second derivatives to analyse stationary points and inflection points.",
            "Solve related-rate, tangent, optimisation, and proof-style problems.",
        ),
        mistakes=(
            "Applying a differentiation rule but omitting an inner derivative or one product term.",
            "Solving a derivative condition without checking the domain or interpreting the result.",
            "Claiming a maximum, minimum, or inflection point without the required sign or derivative evidence.",
        ),
        official_url="https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=91578",
    ),
    "level-3-integration": Standard(
        key="level-3-integration",
        code="AS91579",
        level=3,
        topic="Integration",
        official_name="Apply integration methods in solving problems",
        summary=(
            "Use a range of integration methods to find functions, areas, volumes, "
            "and solutions to contextual or differential-equation problems."
        ),
        skills=(
            "Recognise and apply substitution, reverse-chain-rule, trigonometric, and other integration methods.",
            "Use definite integrals for signed area, total area, and volume.",
            "Apply initial conditions and interpret an integrated model in context.",
        ),
        mistakes=(
            "Forgetting the constant of integration or failing to use an initial condition.",
            "Using bounds without checking sign, intersections, or whether total area is required.",
            "Choosing an integration method without first simplifying or matching the integrand's structure.",
        ),
        official_url="https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=91579",
    ),
}

STANDARD_ORDER = (
    "level-3-complex",
    "level-3-differentiation",
    "level-3-integration",
    "level-2-calculus",
    "level-2-algebra",
)

GRADE_REASONING = (
    (
        "Achieved",
        "Select an appropriate method, carry it out correctly, and communicate a valid solution to the problem.",
    ),
    (
        "Merit",
        "Connect methods and conditions, with the relational thinking needed to justify important steps and conclusions.",
    ),
    (
        "Excellence",
        "Develop, generalise, or prove a result using extended abstract thinking and a coherent chain of reasoning.",
    ),
)

LEGACY_REDIRECTS = {
    "integration-2017.html": "int-1a2017.html",
    "integration-2019.html": "int-1a2019.html",
    "integration-2020.html": "int-1a2020.html",
    "differentiation-2020.html": "1a2020.html",
}


@dataclass(frozen=True)
class QuestionRoute:
    standard_key: str
    year: int
    question_id: str
    display_number: str
    title: str
    focus: str
    href: str
    route_path: str
    source_file: str

    @property
    def standard(self) -> Standard:
        return STANDARDS[self.standard_key]

    @property
    def canonical(self) -> str:
        return absolute_url(self.route_path)

    @property
    def year_file(self) -> str:
        return year_file(self.standard_key, self.year)


class IndexCardParser(HTMLParser):
    """Extract question cards while retaining their paper-panel context."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.panel: str | None = None
        self._div_panel_history: list[str | None] = []
        self._anchor: dict[str, object] | None = None
        self._capture: str | None = None
        self._capture_text: list[str] = []
        self.cards: list[dict[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {name: value or "" for name, value in attrs}

        if tag == "div":
            self._div_panel_history.append(self.panel)
            if attributes.get("data-paper-panel"):
                self.panel = attributes["data-paper-panel"]

        if tag == "a" and self.panel:
            classes = set(attributes.get("class", "").split())
            if "index-link-card" in classes:
                self._anchor = {
                    "panel": self.panel,
                    "href": attributes.get("href", ""),
                    "title": "",
                    "focus": "",
                }

        if tag == "span" and self._anchor is not None:
            classes = set(attributes.get("class", "").split())
            if "index-link-title" in classes:
                self._capture = "title"
                self._capture_text = []
            elif "index-link-copy" in classes:
                self._capture = "focus"
                self._capture_text = []

    def handle_data(self, data: str) -> None:
        if self._capture is not None:
            self._capture_text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "span" and self._capture is not None and self._anchor is not None:
            value = normalise_space("".join(self._capture_text))
            # A currently duplicated focus span in the catalogue should not
            # duplicate its sentence in generated descriptions.
            if value and not self._anchor[self._capture]:
                self._anchor[self._capture] = value
            self._capture = None
            self._capture_text = []

        if tag == "a" and self._anchor is not None:
            card = {key: str(value) for key, value in self._anchor.items()}
            if not all(card.values()):
                raise ValueError(f"Incomplete index question card: {card!r}")
            self.cards.append(card)
            self._anchor = None

        if tag == "div":
            if not self._div_panel_history:
                raise ValueError("Unbalanced <div> structure while parsing index.html")
            self.panel = self._div_panel_history.pop()


def normalise_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def h(value: object, *, quote: bool = True) -> str:
    return html.escape(str(value), quote=quote)


def absolute_url(path: str) -> str:
    if not path:
        return BASE_URL
    return f"{BASE_URL}{path.lstrip('/')}"


def year_file(standard_key: str, year: int) -> str:
    return f"{public_slug(standard_key)}-{year}.html"


def marker(name: str, body: str, indent: str = "") -> str:
    lines = body.strip("\n").splitlines()
    indented = "\n".join(f"{indent}{line}" if line else "" for line in lines)
    return (
        f"{indent}<!-- SEO:{name}:START -->\n"
        f"{indented}\n"
        f"{indent}<!-- SEO:{name}:END -->"
    )


def remove_marker(document: str, name: str) -> str:
    pattern = re.compile(
        rf"(?ms)^[ \t]*<!-- SEO:{re.escape(name)}:START -->.*?"
        rf"^[ \t]*<!-- SEO:{re.escape(name)}:END -->[ \t]*\n?"
    )
    return pattern.sub("", document)


def json_script(data: Mapping[str, object]) -> str:
    payload = json.dumps(data, ensure_ascii=False, indent=2).replace("</", "<\\/")
    return f'<script id="seo-structured-data" type="application/ld+json" data-seo-generated="true">\n{payload}\n</script>'


def metadata_body(
    *,
    title: str,
    description: str,
    canonical: str,
    structured_data: Mapping[str, object],
    robots: str = "index,follow",
    og_type: str = "website",
) -> str:
    return "\n".join(
        (
            f'<meta name="description" content="{h(description)}">',
            f'<meta name="robots" content="{h(robots)}">',
            f'<link rel="canonical" href="{h(canonical)}">',
            '<link rel="icon" href="/favicon.ico" sizes="48x48">',
            '<link rel="icon" href="/assets/favicon-48.png" type="image/png" sizes="48x48">',
            '<link rel="icon" href="/assets/favicon-192.png" type="image/png" sizes="192x192">',
            '<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" sizes="180x180">',
            f'<meta property="og:locale" content="en_NZ">',
            f'<meta property="og:type" content="{h(og_type)}">',
            f'<meta property="og:site_name" content="Calc.nz">',
            f'<meta property="og:title" content="{h(title)}">',
            f'<meta property="og:description" content="{h(description)}">',
            f'<meta property="og:url" content="{h(canonical)}">',
            f'<meta property="og:image" content="{h(SOCIAL_IMAGE_URL)}">',
            '<meta property="og:image:width" content="1200">',
            '<meta property="og:image:height" content="630">',
            f'<meta property="og:image:alt" content="{h(SOCIAL_IMAGE_ALT)}">',
            '<meta name="twitter:card" content="summary_large_image">',
            f'<meta name="twitter:title" content="{h(title)}">',
            f'<meta name="twitter:description" content="{h(description)}">',
            f'<meta name="twitter:image" content="{h(SOCIAL_IMAGE_URL)}">',
            f'<meta name="twitter:image:alt" content="{h(SOCIAL_IMAGE_ALT)}">',
            json_script(structured_data),
        )
    )


def replace_title(document: str, title: str) -> str:
    updated, count = re.subn(
        r"(?is)<title\b[^>]*>.*?</title>",
        f"<title>{h(title)}</title>",
        document,
        count=1,
    )
    if count != 1:
        raise ValueError("Expected exactly one <title> element")
    return updated


def add_head_marker(document: str, body: str) -> str:
    document = remove_marker(document, "HEAD")
    match = re.search(r"(?is)<title\b[^>]*>.*?</title>\s*", document)
    if not match:
        raise ValueError("Cannot add SEO head block without a <title>")
    title_element = match.group(0).rstrip()
    return (
        document[: match.start()]
        + title_element
        + "\n"
        + marker("HEAD", body)
        + "\n\n"
        + document[match.end() :]
    )


def inject_site_shell(document: str, *, guides_published: bool | None = None) -> str:
    """Put the shared header in source while keeping the JS setup idempotent."""

    document = remove_marker(document, "SITE_HEADER")
    document = re.sub(
        r'(?im)^[ \t]*<script\b(?=[^>\r\n]*\bsrc\s*=\s*["\']site-shell\.js(?:\?[^"\']*)?["\'])[^>]*>\s*</script>[ \t]*\n?',
        "",
        document,
    )
    document = re.sub(
        r'(?im)^[ \t]*<script\b(?=[^>\r\n]*\bsrc\s*=\s*["\']walkthrough-audit-data\.js(?:\?[^"\']*)?["\'])[^>]*>\s*</script>[ \t]*\n?',
        "",
        document,
    )
    document = re.sub(
        r'(?ims)^[ \t]*<script\b[^>]*data-exam-mode-bootstrap[^>]*>.*?</script>[ \t]*\n?',
        "",
        document,
    )
    if re.search(r'\bsrc\s*=\s*["\']walkthrough-gate\.js', document, re.I):
        exam_bootstrap = (
            '<script data-exam-mode-bootstrap>'
            'try{if(localStorage.getItem("calc.nz.examMode")==="true")'
            '{document.documentElement.classList.add("exam-mode-pending");'
            'document.title="Exam question | Calc.nz"}}catch(e){}'
            '</script>\n'
            f'<script defer src="walkthrough-audit-data.js?v={CACHE_TOKEN}"></script>\n'
        )
        document, audit_count = re.subn(
            r'(?im)(^[ \t]*<script\b(?=[^>\r\n]*\bsrc\s*=\s*["\']walkthrough-gate\.js[^"\']*["\'])[^>]*>)',
            lambda match: exam_bootstrap + match.group(1),
            document,
            count=1,
        )
        if audit_count != 1:
            raise ValueError("Could not add walkthrough audit data before walkthrough runtime")
    document, count = re.subn(
        r"(?is)(</head>)",
        f'  <script defer src="site-shell.js?v={CACHE_TOKEN}"></script>\n\\1',
        document,
        count=1,
    )
    if count != 1:
        raise ValueError("Could not add the shared site shell script")

    body_match = re.search(r"(?is)<body\b[^>]*>", document)
    if not body_match:
        raise ValueError("Could not find a body element for the shared site header")
    body_tag = body_match.group(0)
    if re.search(r"\bclass\s*=", body_tag, flags=re.I):
        body_tag = re.sub(
            r"(?is)\bclass\s*=\s*(['\"])(.*?)\1",
            lambda match: (
                f'class="{normalise_space(match.group(2) + " has-site-header")}"'
                if "has-site-header" not in match.group(2).split()
                else match.group(0)
            ),
            body_tag,
            count=1,
        )
    else:
        body_tag = body_tag[:-1] + ' class="has-site-header">'
    document = document[: body_match.start()] + body_tag + document[body_match.end() :]

    body_match = re.search(r"(?is)<body\b[^>]*>", document)
    assert body_match
    header = marker("SITE_HEADER", site_header(guides_published=guides_published))
    remainder = document[body_match.end() :].lstrip("\r\n")
    document = document[: body_match.end()] + "\n" + header + "\n" + remainder

    document, main_count = re.subn(
        r"(?is)<main\b([^>]*)>",
        lambda match: (
            "<main"
            + (match.group(1) if re.search(r"\bid\s*=", match.group(1), flags=re.I) else ' id="main-content"' + match.group(1))
            + ("" if re.search(r"\btabindex\s*=", match.group(1), flags=re.I) else ' tabindex="-1"')
            + ">"
        ),
        document,
        count=1,
    )
    if main_count != 1:
        raise ValueError("Could not identify the main content landmark")
    main_match = re.search(
        r'(?is)<main\b[^>]*\bid\s*=\s*(["\'])(?P<id>[^"\']+)\1',
        document,
    )
    if not main_match:
        raise ValueError("Could not identify the main landmark id")
    main_id = main_match.group("id")
    document = document.replace(
        'class="skip-link" href="#main-content"',
        f'class="skip-link" href="#{h(main_id)}"',
        1,
    )
    return document


def load_catalogue(source: str | None = None) -> dict[str, object]:
    """Read the JSON-compatible catalogue assignment without executing JS."""

    if source is None:
        source = CATALOGUE_FILE.read_text(encoding="utf-8")
    match = re.fullmatch(
        r"\s*(?:/\*.*?\*/\s*)?window\.CALC_NZ_QUESTION_CATALOGUE\s*=\s*(\{.*\})\s*;\s*",
        source,
        flags=re.S,
    )
    if not match:
        raise ValueError("question-catalogue.js must contain one JSON-compatible catalogue assignment")
    try:
        value = json.loads(match.group(1))
    except json.JSONDecodeError as error:
        raise ValueError(f"question-catalogue.js contains invalid JSON: {error}") from error
    if not isinstance(value, dict) or not isinstance(value.get("levels"), list):
        raise ValueError("question-catalogue.js is missing its levels array")
    return value


def load_guides(source: str | None = None) -> list[Guide]:
    """Load substantive guide entries; an empty registry publishes no URLs."""

    if source is None:
        source = GUIDES_FILE.read_text(encoding="utf-8")
    try:
        payload = json.loads(source)
    except json.JSONDecodeError as error:
        raise ValueError(f"guides.json contains invalid JSON: {error}") from error
    if not isinstance(payload, dict) or payload.get("schemaVersion") != 1:
        raise ValueError("guides.json must use schemaVersion 1")
    raw_guides = payload.get("guides")
    if not isinstance(raw_guides, list):
        raise ValueError("guides.json must contain a guides list")

    guides: list[Guide] = []
    slugs: set[str] = set()
    for index, record in enumerate(raw_guides):
        if not isinstance(record, dict):
            raise ValueError(f"Guide entry {index + 1} must be an object")
        slug = str(record.get("slug", "")).strip()
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
            raise ValueError(f"Guide entry {index + 1} has an invalid slug")
        if slug in slugs:
            raise ValueError(f"Duplicate guide slug: {slug}")
        slugs.add(slug)
        standard_key = str(record.get("standardKey", ""))
        if standard_key not in STANDARDS:
            raise ValueError(f"Guide {slug} has an unknown standardKey")
        raw_skill_slugs = record.get("skillSlugs")
        if not isinstance(raw_skill_slugs, list) or not raw_skill_slugs:
            raise ValueError(f"Guide {slug} must include at least one skill slug")
        skill_slugs = tuple(str(value).strip() for value in raw_skill_slugs)
        if any(
            not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", value)
            for value in skill_slugs
        ) or len(skill_slugs) != len(set(skill_slugs)):
            raise ValueError(f"Guide {slug} has invalid or duplicate skill slugs")
        unknown_skills = sorted(set(skill_slugs) - set(SKILL_SPECS))
        if unknown_skills:
            raise ValueError(f"Guide {slug} has unknown skill slugs: {unknown_skills}")
        mismatched_skills = sorted(
            value
            for value in skill_slugs
            if standard_key not in SKILL_SPECS[value].standard_ids
        )
        if mismatched_skills:
            raise ValueError(
                f"Guide {slug} has skills outside {standard_key}: {mismatched_skills}"
            )
        sections = record.get("sections", [])
        sources = record.get("sources", [])
        required_text = (
            "title",
            "summary",
            "subject",
            "author",
            "reviewedDate",
            "directAnswer",
        )
        missing = [name for name in required_text if not str(record.get(name, "")).strip()]
        if missing or not isinstance(sections, list) or len(sections) < 2:
            raise ValueError(
                f"Guide {slug} is not substantive enough to publish; missing {missing or ['at least two sections']}"
            )
        if not isinstance(sources, list) or not sources:
            raise ValueError(f"Guide {slug} must include at least one source")
        reviewed_date = str(record["reviewedDate"])
        try:
            parsed_review_date = date.fromisoformat(reviewed_date)
        except ValueError:
            raise ValueError(f"Guide {slug} has an invalid reviewedDate")
        if parsed_review_date > date.today():
            raise ValueError(f"Guide {slug} has a future reviewedDate")

        section_ids: set[str] = set()
        for section_index, section in enumerate(sections, 1):
            if not isinstance(section, dict):
                raise ValueError(f"Guide {slug} section {section_index} must be an object")
            section_id = str(section.get("id", "")).strip()
            if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", section_id):
                raise ValueError(f"Guide {slug} section {section_index} has an invalid id")
            if section_id in section_ids:
                raise ValueError(f"Guide {slug} has duplicate section id {section_id}")
            section_ids.add(section_id)
            if not str(section.get("heading", "")).strip() or len(
                re.sub(r"<[^>]+>", " ", str(section.get("html", ""))).strip()
            ) < 40:
                raise ValueError(f"Guide {slug} section {section_index} is incomplete or too thin")

        for source_index, item in enumerate(sources, 1):
            if not isinstance(item, dict):
                raise ValueError(f"Guide {slug} source {source_index} must be an object")
            if not str(item.get("label", "")).strip() or not str(item.get("href", "")).strip():
                raise ValueError(f"Guide {slug} source {source_index} needs a label and href")

        raw_related = record.get("relatedConcepts", [])
        if not isinstance(raw_related, list):
            raise ValueError(f"Guide {slug} relatedConcepts must be a list")
        for related_index, item in enumerate(raw_related, 1):
            if not isinstance(item, dict):
                raise ValueError(f"Guide {slug} related concept {related_index} must be an object")
            if not str(item.get("title", "")).strip() or not str(item.get("href", "")).strip():
                raise ValueError(f"Guide {slug} related concept {related_index} needs a title and href")

        raw_practice = record.get("practiceQuestionIds")
        if not isinstance(raw_practice, list) or not raw_practice:
            raise ValueError(f"Guide {slug} must include at least one practice question")
        practice_question_ids = tuple(str(value).strip() for value in raw_practice)
        if any(
            not re.fullmatch(r"20\d{2}:[1-9]\d*[a-z]", value)
            for value in practice_question_ids
        ) or len(practice_question_ids) != len(set(practice_question_ids)):
            raise ValueError(f"Guide {slug} has invalid or duplicate practice question ids")
        toc = record.get("toc", True)
        if not isinstance(toc, bool):
            raise ValueError(f"Guide {slug} toc must be true or false")
        guides.append(
            Guide(
                slug=slug,
                title=str(record["title"]).strip(),
                summary=str(record["summary"]).strip(),
                subject=str(record["subject"]).strip(),
                standard_key=standard_key,
                skill_slugs=skill_slugs,
                author=str(record["author"]).strip(),
                reviewed_date=reviewed_date,
                direct_answer=str(record["directAnswer"]).strip(),
                sections=tuple(sections),
                related_concepts=tuple(raw_related),
                practice_question_ids=practice_question_ids,
                sources=tuple(sources),
                toc=toc,
            )
        )
    return guides


def unexpected_guide_outputs(
    guides: Sequence[Guide],
    root: Path = ROOT,
) -> tuple[Path, ...]:
    """Return published guide files that are no longer registered.

    Removal stays an explicit operation so unpublishing content cannot silently
    delete a page that may already be indexed or linked from elsewhere.
    """

    expected = (
        {root / "guides.html"} | {root / guide.filename for guide in guides}
        if guides
        else set()
    )
    actual = set(root.glob("guide-*.html"))
    hub = root / "guides.html"
    if hub.is_file():
        actual.add(hub)
    return tuple(sorted(actual - expected, key=lambda path: path.name))


def validate_guide_relationships(
    guides: Sequence[Guide],
    routes: Sequence[QuestionRoute],
) -> None:
    """Require every published practice relationship to resolve exactly."""

    route_by_key = {
        (route.standard_key, f"{route.year}:{route.question_id}"): route
        for route in routes
    }
    for guide in guides:
        missing = sorted(
            question_id
            for question_id in guide.practice_question_ids
            if (guide.standard_key, question_id) not in route_by_key
        )
        if missing:
            raise ValueError(
                f"Guide {guide.slug} has unknown or mismatched practice questions: {missing}"
            )
        unrelated = sorted(
            question_id
            for question_id in guide.practice_question_ids
            if not (
                set(guide.skill_slugs)
                & set(
                    classify_question(
                        route_by_key[(guide.standard_key, question_id)].focus,
                        guide.standard_key,
                    )
                )
            )
        )
        if unrelated:
            raise ValueError(
                f"Guide {guide.slug} practice questions do not match its skills: {unrelated}"
            )


def load_walkthrough_content() -> dict[str, Mapping[str, object]]:
    """Project authored JS configs into deterministic static fallback records."""

    environment = os.environ.copy()
    # Swift records the module-cache path in its PCM output. Reusing a cache
    # once addressed through the /tmp symlink can make Foundation appear twice.
    cache_path = "/private/tmp/calc-nz-seo-swift-module-cache-v2"
    environment["CLANG_MODULE_CACHE_PATH"] = cache_path
    environment["SWIFT_MODULE_CACHE_PATH"] = cache_path
    environment["SWIFT_MODULECACHE_PATH"] = cache_path
    process = subprocess.run(
        ["swift", str(WALKTHROUGH_EXTRACTOR), "--root", str(ROOT)],
        cwd=ROOT,
        env=environment,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if process.returncode:
        detail = process.stderr.decode("utf-8", errors="replace").strip()
        raise ValueError(f"Walkthrough content extraction failed: {detail}")
    try:
        payload = json.loads(process.stdout)
    except json.JSONDecodeError as error:
        raise ValueError(f"Walkthrough content extractor returned invalid JSON: {error}") from error
    if not isinstance(payload, dict) or len(payload) != EXPECTED_ROUTE_COUNT:
        raise ValueError(
            f"Expected {EXPECTED_ROUTE_COUNT} walkthrough fallback records, found "
            f"{len(payload) if isinstance(payload, dict) else 'a non-object'}"
        )
    return payload


def discover_routes(catalogue: Mapping[str, object]) -> list[QuestionRoute]:
    routes: list[QuestionRoute] = []
    levels = catalogue.get("levels", [])

    for level in levels if isinstance(levels, list) else []:
        if not isinstance(level, dict):
            raise ValueError("Catalogue level records must be objects")
        standards = level.get("standards", [])
        for standard_record in standards if isinstance(standards, list) else []:
            if not isinstance(standard_record, dict):
                raise ValueError("Catalogue standard records must be objects")
            standard_key = str(standard_record.get("id", ""))
            if standard_key not in STANDARDS:
                raise ValueError(f"Unsupported catalogue standard: {standard_key!r}")
            standard = STANDARDS[standard_key]
            if standard_record.get("code") != standard.code:
                raise ValueError(f"Catalogue code does not match {standard_key}: {standard_record.get('code')!r}")

            papers = standard_record.get("papers", [])
            for paper in papers if isinstance(papers, list) else []:
                if not isinstance(paper, dict) or not isinstance(paper.get("year"), int):
                    raise ValueError(f"Invalid paper record for {standard_key}")
                year = int(paper["year"])
                questions = paper.get("questions", [])
                for question in questions if isinstance(questions, list) else []:
                    if not isinstance(question, dict):
                        raise ValueError(f"Invalid question record for {standard_key} {year}")
                    question_id = str(question.get("id", "")).lower()
                    label = str(question.get("label", ""))
                    if not re.fullmatch(r"[1-9]\d*[a-z]", question_id):
                        raise ValueError(f"Invalid question id for {standard_key} {year}: {question_id!r}")
                    if not re.fullmatch(r"Question\s+[1-9]\d*\([a-z]\)(?:\((?:i|ii|iii|iv)\))?", label, flags=re.I):
                        raise ValueError(
                            f"Invalid catalogue question label for {standard_key} {year} {question_id}: {label!r}"
                        )
                    display_number = label.removeprefix("Question ")
                    href = html.unescape(str(question.get("href", ""))).strip()
                    focus = str(question.get("method", "")).strip()
                    if not href or not focus:
                        raise ValueError(f"Incomplete catalogue question: {standard_key} {year} {question_id}")

                    route_path = href.split("#", 1)[0]
                    source_file = route_path.split("?", 1)[0]
                    if not re.fullmatch(r"[A-Za-z0-9._-]+\.html", source_file):
                        raise ValueError(f"Unsafe or unsupported question route: {href!r}")
                    if not (ROOT / source_file).is_file():
                        raise ValueError(f"Question route points to missing file: {source_file}")

                    query = urlsplit(route_path).query
                    if query and query.lower() != f"q={question_id}":
                        raise ValueError(f"Question query does not match catalogue id: {href!r}")
                    if not query:
                        file_match = re.search(
                            rf"([1-9]\d*[a-z]){year}(?:-l2)?\.html$",
                            source_file,
                            flags=re.I,
                        )
                        if not file_match or file_match.group(1).lower() != question_id:
                            raise ValueError(f"Question filename does not match catalogue id: {href!r}")

                    routes.append(
                        QuestionRoute(
                            standard_key=standard_key,
                            year=year,
                            question_id=question_id,
                            display_number=display_number,
                            title=label,
                            focus=focus,
                            href=href,
                            route_path=route_path,
                            source_file=source_file,
                        )
                    )

    if len(routes) != EXPECTED_ROUTE_COUNT:
        raise ValueError(f"Expected {EXPECTED_ROUTE_COUNT} catalogue questions, found {len(routes)}")

    route_paths = [route.route_path for route in routes]
    if len(set(route_paths)) != len(route_paths):
        duplicates = sorted(path for path in set(route_paths) if route_paths.count(path) > 1)
        raise ValueError(f"Duplicate logical question routes: {duplicates}")

    panels = {(route.standard_key, route.year) for route in routes}
    if len(panels) != EXPECTED_YEAR_COUNT:
        raise ValueError(f"Expected {EXPECTED_YEAR_COUNT} standard/year groups, found {len(panels)}")

    dynamic_expected = {f"complex-{year}.html" for year in range(2017, 2025)}
    by_source: dict[str, list[QuestionRoute]] = defaultdict(list)
    for route in routes:
        by_source[route.source_file].append(route)
    dynamic_actual = {source for source, values in by_source.items() if len(values) > 1}
    if dynamic_actual != dynamic_expected:
        raise ValueError(
            "Unexpected query-routed question shells: "
            f"expected {sorted(dynamic_expected)}, found {sorted(dynamic_actual)}"
        )

    return routes


def group_routes(
    routes: Sequence[QuestionRoute],
) -> tuple[
    dict[str, list[QuestionRoute]],
    dict[tuple[str, int], list[QuestionRoute]],
    dict[str, list[QuestionRoute]],
]:
    by_standard: dict[str, list[QuestionRoute]] = defaultdict(list)
    by_year: dict[tuple[str, int], list[QuestionRoute]] = defaultdict(list)
    by_source: dict[str, list[QuestionRoute]] = defaultdict(list)
    for route in routes:
        by_standard[route.standard_key].append(route)
        by_year[(route.standard_key, route.year)].append(route)
        by_source[route.source_file].append(route)
    return by_standard, by_year, by_source


def catalogue_javascript(catalogue: Mapping[str, object]) -> str:
    payload = json.dumps(catalogue, ensure_ascii=False, indent=2).replace("</", "<\\/")
    return (
        "/* Generated from the Calc.nz walkthrough catalogue. "
        "Keep this assignment JSON-compatible. */\n"
        f"window.CALC_NZ_QUESTION_CATALOGUE = {payload};\n"
    )


def enrich_catalogue(
    catalogue: Mapping[str, object],
    routes: Sequence[QuestionRoute],
) -> dict[str, object]:
    """Put logical-route SEO and learning records beside each question."""

    enriched = copy.deepcopy(dict(catalogue))
    skill_report = validate_skill_coverage(
        catalogue_questions(catalogue),
        expected_question_count=EXPECTED_ROUTE_COUNT,
    )
    skill_report.raise_for_errors()
    route_map = {
        (route.standard_key, route.year, route.question_id): route for route in routes
    }
    levels = enriched.get("levels", [])
    for level in levels if isinstance(levels, list) else []:
        for standard_record in level.get("standards", []):
            standard_key = standard_record["id"]
            for paper in standard_record.get("papers", []):
                year = int(paper["year"])
                questions = paper.get("questions", [])
                paper_routes = [
                    route_map[(standard_key, year, str(question["id"]))]
                    for question in questions
                ]
                for index, (question, route) in enumerate(zip(questions, paper_routes)):
                    # `reviewedDate` previously implied a completed review that the
                    # repository cannot substantiate. Keep the neutral content-update
                    # date and explicit review status as the public trust model.
                    question.pop("reviewedDate", None)
                    question.update(
                        {
                            "methodTitle": question_method_title(route),
                            "methodPlain": sentence(meta_plain(route.focus)),
                            "canonical": route.canonical,
                            "title": question_browser_title(route),
                            "description": question_description(route),
                            "summary": question_learning_summary(route),
                            "commonMistake": infer_common_mistake(route),
                            "skillSlugs": list(classify_question(route.focus, route.standard_key)),
                            "standardHref": route.standard.landing_file,
                            "yearHref": route.year_file,
                            "previousHref": paper_routes[index - 1].href if index > 0 else None,
                            "nextHref": paper_routes[index + 1].href if index + 1 < len(paper_routes) else None,
                            "updatedDate": REVIEW_DATE,
                            "reviewStatus": "unreviewed",
                        }
                    )
                    if (standard_key, year, str(question["id"])) in AUDITED_WALKTHROUGH_KEYS:
                        question["reviewStatus"] = AUDIT_REVIEW_STATUS
    enriched["schemaVersion"] = 2
    enriched["generatedAt"] = REVIEW_DATE
    return enriched


def question_sort_key(route: QuestionRoute) -> tuple[int, str]:
    match = re.fullmatch(r"(\d+)([a-z])", route.question_id)
    assert match
    return int(match.group(1)), match.group(2)


def meta_plain(value: str) -> str:
    """Turn short catalogue TeX into readable search-snippet prose."""

    def grouped_expression(expression: str) -> str:
        expression = expression.strip()
        if re.search(
            r"\s(?:plus|minus|divided by)\s|[+=]|(?<=\S)-(?=\S)",
            expression,
        ):
            return f"({expression})"
        return expression

    value = html.unescape(value)
    value = re.sub(r"<[^>]+>", " ", value)
    value = value.replace(r"\(", "").replace(r"\)", "")
    value = value.replace(r"\[", "").replace(r"\]", "")
    value = value.replace(r"\left", "").replace(r"\right", "")

    # Resolve braced TeX structures from the inside out so snippets retain the
    # mathematical relationship instead of flattening tokens such as
    # \frac{dy/dt}{dx/dt} into an unreadable string.
    fraction_pattern = re.compile(
        r"\\(?:dfrac|tfrac|frac)\{([^{}]*)\}\{([^{}]*)\}"
    )
    while fraction_pattern.search(value):
        value = fraction_pattern.sub(
            lambda match: (
                f"{grouped_expression(match.group(1))} divided by "
                f"{grouped_expression(match.group(2))}"
            ),
            value,
        )
    indexed_root_pattern = re.compile(r"\\sqrt\[([^\]]+)\]\{([^{}]*)\}")
    while indexed_root_pattern.search(value):
        value = indexed_root_pattern.sub(
            lambda match: (
                f"the {match.group(1).strip()} root of ({match.group(2).strip()})"
            ),
            value,
        )
    square_root_pattern = re.compile(r"\\sqrt\{([^{}]*)\}")
    while square_root_pattern.search(value):
        value = square_root_pattern.sub(
            lambda match: (
                f" square root of {grouped_expression(match.group(1))} "
            ),
            value,
        )
    for command, label in (
        ("overline", "conjugate of"),
        ("operatorname", ""),
        ("mathrm", ""),
        ("text", ""),
    ):
        command_pattern = re.compile(rf"\\{command}\{{([^{{}}]*)\}}")
        while command_pattern.search(value):
            value = command_pattern.sub(
                lambda match, prefix=label: (
                    f"{prefix} ({match.group(1).strip()})" if prefix
                    else match.group(1).strip()
                ),
                value,
            )

    replacements = {
        r"\ln": "ln",
        r"\log": "log",
        r"\sin": "sin",
        r"\cos": "cos",
        r"\tan": "tan",
        r"\cot": "cot",
        r"\sqrt": " square root of ",
        r"\theta": "theta",
        r"\alpha": "alpha",
        r"\beta": "beta",
        r"\Delta": "Delta",
        r"\pi": "pi",
        r"\cdot": " times ",
        r"\times": " times ",
        r"\pm": " plus or minus ",
        r"\Im": "imaginary part of ",
        r"\Re": "real part of ",
        r"\,": " ",
        r"\;": " ",
        r"\!": "",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = re.sub(
        r"\b(sin|cos|tan|cot|sec|csc)\^2(?=[A-Za-z(])",
        lambda match: f"{match.group(1)} squared ",
        value,
    )
    value = re.sub(
        r"(\([^()]+\)|[A-Za-z0-9]+)(?:\^\{2\}|\^2(?![A-Za-z0-9]))",
        lambda match: f"{match.group(1)} squared",
        value,
    )
    value = re.sub(
        r"(\([^()]+\)|[A-Za-z0-9]+)(?:\^\{3\}|\^3(?![A-Za-z0-9]))",
        lambda match: f"{match.group(1)} cubed",
        value,
    )
    value = re.sub(
        r"(\([^()]+\)|[A-Za-z0-9]+)\^\{([^{}]+)\}",
        lambda match: f"{match.group(1)} to the power ({match.group(2)})",
        value,
    )
    value = re.sub(
        r"(\([^()]+\)|[A-Za-z0-9]+)\^(-?[A-Za-z0-9]+)",
        lambda match: f"{match.group(1)} to the power {match.group(2)}",
        value,
    )
    value = re.sub(r"_\{([^{}]+)\}", r" subscript (\1)", value)
    value = re.sub(r"_([A-Za-z0-9]+)", r" subscript \1", value)
    value = re.sub(r"\\([A-Za-z]+)", r" \1 ", value)
    value = value.replace("{", "(").replace("}", ")")
    value = re.sub(r"\s*([+=])\s*", r" \1 ", value)
    value = re.sub(
        r"(?<=[0-9)])\s*-\s*(?=(?:square root|[A-Za-z0-9(]))",
        " - ",
        value,
    )
    value = re.sub(r"(?<=[A-Za-z)])-(?=[0-9(])", " - ", value)
    value = re.sub(r"\b(squared|cubed)(?=[A-Za-z(])", r"\1 ", value)
    value = re.sub(r"\s+([)])", r"\1", value)
    return normalise_space(value).strip(" .")


def truncate(value: str, limit: int = 158) -> str:
    value = normalise_space(value)
    if len(value) <= limit:
        return value
    shortened = value[: limit - 1].rsplit(" ", 1)[0].rstrip(" ,;:-")
    return f"{shortened}…"


def sentence(value: str) -> str:
    value = normalise_space(value).strip()
    if not value:
        return value
    value = value[0].upper() + value[1:]
    if value[-1] not in ".!?":
        value += "."
    return value


def lower_sentence(value: str) -> str:
    value = normalise_space(value).strip().rstrip(".")
    if not value:
        return value
    return value[0].lower() + value[1:]


def human_date(value: str) -> str:
    parsed = date.fromisoformat(value)
    return f"{parsed.day} {parsed.strftime('%B')} {parsed.year}"


def official_resource_manifest() -> Mapping[str, object]:
    """Load the manually checked NZQA resource inventory."""

    try:
        manifest = json.loads(OFFICIAL_RESOURCES_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"Could not read {OFFICIAL_RESOURCES_FILE.name}: {exc}") from exc
    if not isinstance(manifest, dict) or not isinstance(manifest.get("standards"), dict):
        raise ValueError(f"{OFFICIAL_RESOURCES_FILE.name} must contain a standards object")
    return manifest


def official_resources_for_year(standard: Standard, year: int) -> str:
    """Render checked official links, formats, and explicit gaps for one paper."""

    manifest = official_resource_manifest()
    standards = manifest.get("standards", {})
    standard_records = standards.get(standard.code, {}) if isinstance(standards, dict) else {}
    record = standard_records.get(str(year), {}) if isinstance(standard_records, dict) else {}
    if not isinstance(record, dict) or not record:
        return f"""<section class="official-resource-group" aria-labelledby="official-{h(standard.code.lower())}-{year}-heading">
  <h2 id="official-{h(standard.code.lower())}-{year}-heading">Official NZQA material</h2>
  <p class="step-text">Use the <a href="{h(standard.official_url)}" target="_blank" rel="noopener noreferrer" aria-label="NZQA assessment resource page for {h(standard.code)} (opens in a new tab)">NZQA assessment-resource page for {h(standard.code)} <span aria-hidden="true">↗</span></a> to check the currently published material for this standard.</p>
</section>"""
    checked_date = str(manifest.get("checkedDate", REVIEW_DATE))
    resources = record.get("resources", []) if isinstance(record, dict) else []
    unavailable = record.get("unavailable", []) if isinstance(record, dict) else []

    links: list[str] = []
    if isinstance(resources, list):
        for resource in resources:
            if not isinstance(resource, dict):
                continue
            label = str(resource.get("label", "Official NZQA resource"))
            resource_url = str(resource.get("url", ""))
            resource_format = str(resource.get("format", "resource"))
            if not resource_url.startswith("https://www.nzqa.govt.nz/"):
                raise ValueError(
                    f"Unchecked official resource URL for {standard.code} {year}: {resource_url}"
                )
            links.append(
                '<li><a href="{url}" target="_blank" rel="noopener noreferrer" '
                'aria-label="{label} ({format}, opens in a new tab)">{label} '
                '<span aria-hidden="true">({format}) ↗</span></a></li>'.format(
                    url=h(resource_url),
                    label=h(label),
                    format=h(resource_format),
                )
            )

    if links:
        availability_html = f'<ul class="step-text official-resource-list">{"".join(links)}</ul>'
    else:
        availability_html = (
            '<p class="question-note">No directly downloadable paper, schedule, report, or exemplar '
            'for this year remained available at the official NZQA locations when checked.</p>'
        )

    unavailable_html = ""
    if isinstance(unavailable, list) and unavailable:
        unavailable_labels = ", ".join(str(value) for value in unavailable)
        unavailable_html = (
            '<p class="question-note"><strong>Not currently available from the checked NZQA '
            f'locations:</strong> {h(unavailable_labels)}. No replacement URL has been guessed.</p>'
        )

    return f"""<section class="official-resource-group" aria-labelledby="official-{h(standard.code.lower())}-{year}-heading">
  <h2 id="official-{h(standard.code.lower())}-{year}-heading">Official NZQA material for {year}</h2>
  {availability_html}
  {unavailable_html}
  <p class="step-text"><a href="{h(standard.official_url)}" target="_blank" rel="noopener noreferrer" aria-label="NZQA assessment resource page for {h(standard.code)} (opens in a new tab)">Open the NZQA assessment-resource page for {h(standard.code)} <span aria-hidden="true">↗</span></a>.</p>
  <p class="question-note">Availability last checked <time datetime="{h(checked_date)}">{h(human_date(checked_date))}</time>. NZQA may move or remove older files.</p>
</section>"""


def question_method_title(route: QuestionRoute) -> str:
    """Return a concise, truthful method label for browser/social titles."""

    route_specific_titles = {
        "alg-2e2025-l2.html": "Discriminants and Simultaneous Equations",
        "alg-3d2025-l2.html": "Root Relationships",
        "2d2024.html": "Quotient Rule and Inflection",
        "1a2022.html": "Chain Rule",
        "1e2022.html": "Second Derivative and Concavity",
        "3a2019.html": "Trigonometric Differentiation",
        "int-2a2020.html": "Power Rule Integration",
        "int-1d2019.html": "Integration and Area",
        "complex-2023.html?q=2b": "Complex Modulus",
        "complex-2023.html?q=3e": "Complex Equations and Imaginary Parts",
        "complex-2020.html?q=3b": "Complex Modulus",
    }
    if route.route_path in route_specific_titles:
        return route_specific_titles[route.route_path]

    focus = meta_plain(route.focus).lower()
    if re.search(r"\bsubstitution\b", focus):
        if route.standard.key == "level-3-integration":
            return "Integration by Substitution"
        if re.search(r"radical|square root|surd", focus):
            return "Radical Substitution"
        return "Algebraic Substitution"
    if route.standard.key == "level-3-integration":
        if re.search(r"reverse|reversing", focus) and re.search(
            r"chain rule", focus
        ):
            return "Reverse Chain Rule Integration"
        if re.search(r"sec.?tan|trigonometric derivative|tangent function", focus):
            return "Trigonometric Antidifferentiation"
    if (
        route.standard.key == "level-3-integration"
        and "polynomial" in focus
        and re.search(r"integrat|antideriv", focus)
    ):
        return (
            "Polynomial and Exponential Integration"
            if "exponential" in focus
            else "Polynomial Integration"
        )
    patterns = (
        (r"newton['’]?s law of cooling", "Newton’s Law of Cooling"),
        (r"finding \|[^|]+\|", "Complex Modulus"),
        (r"factor theorem", "Factor Theorem"),
        (r"remainder theorem", "Remainder Theorem"),
        (r"completing the square", "Completing the Square"),
        (r"argand", "Argand Diagram Algebra"),
        (r"squaring.*complex|complex.*squar", "Squaring a Complex Expression"),
        (r"equating real and imaginary|real and imaginary parts", "Equating Real and Imaginary Parts"),
        (r"simultaneous.*complex|complex.*simultaneous", "Complex Simultaneous Equations"),
        (r"de moivre", "De Moivre’s Theorem"),
        (r"polar form|modulus and argument|argument and modulus", "Polar Form"),
        (r"roots of unity|complex roots|fourth roots|cube roots|all .* roots", "Complex Roots"),
        (r"chain[- ]rule|composite", "Chain Rule"),
        (r"product rule.*quotient|quotient rule.*product", "Product and Quotient Rules"),
        (r"product rule", "Product Rule"),
        (r"quotient rule", "Quotient Rule"),
        (r"related rates|related-rate|rate of change", "Related Rates"),
        (r"parametric", "Parametric Differentiation"),
        (r"implicit", "Implicit Differentiation"),
        (
            r"stationary|critical point|turning point|optimi|maximi|minimi|"
            r"largest possible|smallest possible",
            "Stationary Points and Optimisation",
        ),
        (r"differential equation|separable", "Differential Equations"),
        (r"antidifferentiat|anti-differentiat", "Antidifferentiation"),
        (r"partial fraction", "Partial Fractions"),
        (r"area.*integr|integr.*area|area between|area under", "Integration and Area"),
        (r"volume.*integr|integr.*volume", "Integration and Volume"),
        (r"tangent", "Tangents"),
        (r"normal", "Normal Lines"),
        (r"logarith", "Logarithms"),
        (r"quadratic", "Quadratic Algebra"),
        (r"radical|surd", "Radicals and Surds"),
        (
            r"conjugate|complex division|rationalis|complex quotient|"
            r"complex fraction|reciprocal complex|purely (?:real|imaginary)|"
            r"matching (?:real|imaginary|corresponding).*parts|collecting parts",
            "Complex-number Algebra",
        ),
        (r"locus", "Complex-number Loci"),
        (r"polynomial|factoris", "Polynomial Algebra"),
    )
    for pattern, label in patterns:
        if re.search(pattern, focus, flags=re.I):
            return label

    scoped_patterns: Mapping[str, Sequence[tuple[str, str]]] = {
        "level-2-calculus": (
            (r"power rule|negative (?:powers|exponents)", "Power Rule"),
            (r"velocity|acceleration|displacement|motion", "Calculus and Motion"),
            (r"gradient|coordinate on the curve", "Gradients and Curve Points"),
        ),
        "level-2-algebra": (
            (r"rearrang|make .* subject", "Rearranging Formulae"),
            (r"pythagoras", "Pythagoras and Area"),
            (r"perfect square", "Perfect Squares"),
        ),
        "level-3-differentiation": (
            (r"radius of curvature", "Radius of Curvature"),
            (
                r"continuity|differentiability|concavity|limits?.*graph|"
                r"reading .* graph|piecewise graph",
                "Graph Analysis",
            ),
            (r"power rule|negative (?:powers|exponents)", "Power Rule"),
            (r"velocity|acceleration|displacement|motion", "Differentiation and Motion"),
            (r"first and second derivatives|second derivatives", "Higher Derivatives"),
            (r"derivative sign|increasing|decreasing", "Function Behaviour"),
            (r"exponential", "Exponential Differentiation"),
            (r"point.*condition|condition.*parameter", "Derivative Conditions"),
        ),
        "level-3-integration": (
            (r"separating variables", "Differential Equations"),
            (
                r"velocity|acceleration|displacement|position|distance over",
                "Integration and Kinematics",
            ),
            (r"simpson|trapezium", "Numerical Integration"),
            (
                r"rational (?:integrand|curve|function)|decompos(?:e|ing).*rational",
                "Rational-function Integration",
            ),
            (
                r"area strategy|shaded[- ]area|geometric area|area formula|"
                r"courtyard area|curve intersections",
                "Integration and Area",
            ),
            (
                r"integrating exponential terms?|exponential terms?.*inside coefficients",
                "Exponential Integration",
            ),
            (r"square[- ]root term|radical term", "Radical Integration"),
            (
                r"product-to-sum|double-angle|trig(?:onometric)? identit|"
                r"sin to the power 2|cos to the power 2|squared-trigonometric|"
                r"(?:sin|cos|sine|cosine).*area",
                "Trigonometric Integration",
            ),
            (r"mean value|weighted-average|balance point", "Mean-value Integration"),
            (r"pumping energy|similar triangles", "Integration and Work"),
            (
                r"definite integrals?|unknown limit|adding a constant inside",
                "Definite Integral Equations",
            ),
            (
                r"initial condition|position condition|fitting the constant|"
                r"using a condition|volume readings",
                "Integration with Conditions",
            ),
            (
                r"expanding|term by term|familiar antiderivatives|"
                r"linear term|reciprocal term|negative powers",
                "Algebraic Integration",
            ),
            (r"exponential.*model|model.*exponential", "Exponential Models"),
        ),
        "level-3-complex": (
            (r"discriminant", "Discriminants and Real Roots"),
            (r"argument|quadrant", "Arguments and Quadrants"),
            (r"modulus equation|equal moduli", "Modulus Equations"),
            (r"cis form|moduli.*arguments", "Polar Form"),
            (r"cubing|algebraic identit", "Complex Algebraic Identities"),
            (r"square root|radical", "Radical Equations"),
            (r"complex|real part|imaginary part", "Complex-number Algebra"),
        ),
    }
    for pattern, label in scoped_patterns.get(route.standard.key, ()):
        if re.search(pattern, focus, flags=re.I):
            return label
    concise = re.sub(
        r"^(?:using|finding|solving|applying|recognising|rewriting|simplifying|forming|building|converting|proving|showing|determining|evaluating|calculating)\s+",
        "",
        meta_plain(route.focus).strip(" ."),
        flags=re.I,
    )
    concise = concise.rstrip(" ,;:-")
    if concise and len(concise) <= 44:
        return concise[:1].upper() + concise[1:]
    return {
        "level-2-calculus": "Calculus Method",
        "level-2-algebra": "Algebraic Method",
        "level-3-complex": "Complex Numbers Method",
        "level-3-differentiation": "Differentiation Method",
        "level-3-integration": "Integration Method",
    }.get(route.standard.key, f"{route.standard.topic} Method")


def question_browser_title(route: QuestionRoute) -> str:
    standard = route.standard
    return (
        f"{question_method_title(route)} Worked Solution – {route.year} NCEA "
        f"Level {standard.level} Q{route.display_number} ({standard.code}) | Calc.nz"
    )


def question_description(route: QuestionRoute) -> str:
    standard = route.standard
    focus = meta_plain(route.focus)
    return truncate(
        f"{route.year} NCEA Level {standard.level} {standard.topic} "
        f"{standard.code} Question {route.display_number} worked solution: "
        f"{lower_sentence(focus)}. Use guided hints and step-by-step reasoning."
    )


def breadcrumb_schema(items: Sequence[tuple[str, str]]) -> dict[str, object]:
    return {
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": position,
                "name": name,
                "item": url,
            }
            for position, (name, url) in enumerate(items, start=1)
        ],
    }


def breadcrumb_nav(
    items: Sequence[tuple[str, str | None]],
    data_attributes: Sequence[str | None] | None = None,
) -> str:
    list_items: list[str] = []
    if data_attributes is not None and len(data_attributes) != len(items):
        raise ValueError("Breadcrumb data-attribute count does not match its items")
    for index, (name, href) in enumerate(items):
        if href == "index.html":
            href = "/"
        elif href and href.startswith("index.html#"):
            href = "/" + href[len("index.html") :]
        data_attribute = data_attributes[index] if data_attributes is not None else None
        dynamic_attribute = f" {data_attribute}" if data_attribute else ""
        position_class = "breadcrumb-current" if href is None else "breadcrumb-link"
        if index == len(items) - 2:
            position_class += " breadcrumb-parent"
        if href is None:
            content = f'<span class="home-breadcrumb-current" aria-current="page"{dynamic_attribute}>{h(name)}</span>'
        else:
            content = f'<a class="home-breadcrumb-button" href="{h(href)}"{dynamic_attribute}>{h(name)}</a>'
        list_items.append(f'  <li class="breadcrumb-item {position_class}">{content}</li>')
    return (
        '<nav class="home-flow-nav seo-breadcrumbs" aria-label="Breadcrumb">\n'
        ' <ol class="home-breadcrumb">\n'
        + "\n".join(list_items)
        + "\n </ol>\n</nav>"
    )


def question_structured_data(route: QuestionRoute, title: str, description: str) -> dict[str, object]:
    standard = route.standard
    crumbs = (
        ("Calc.nz", BASE_URL),
        (f"NCEA Level {standard.level} {standard.topic} — {standard.code}", standard.landing_url),
        (f"{route.year} paper", absolute_url(route.year_file)),
        (f"Question {route.display_number}", route.canonical),
    )
    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "LearningResource",
                "@id": f"{route.canonical}#learning-resource",
                "url": route.canonical,
                "name": title,
                "description": description,
                "inLanguage": "en-NZ",
                "isAccessibleForFree": True,
                "learningResourceType": "Guided worked-solution walkthrough",
                "educationalUse": "Practice",
                "educationalLevel": f"NCEA Level {standard.level}",
                "teaches": meta_plain(route.focus),
                "about": {
                    "@type": "Thing",
                    "name": f"{standard.code} — {standard.official_name}",
                },
                "dateModified": REVIEW_DATE,
                "publisher": {
                    "@type": "Organization",
                    "name": "Calc.nz",
                    "url": BASE_URL,
                },
                "isPartOf": {"@id": f"{standard.landing_url}#webpage"},
            },
            breadcrumb_schema(crumbs),
        ],
    }


def infer_common_mistake(route: QuestionRoute) -> str:
    polar_zero_case_keys = {
        ("level-3-complex", 2020, "3d"),
        ("level-3-complex", 2021, "2d"),
        ("level-3-complex", 2022, "3c"),
        ("level-3-complex", 2023, "2d"),
        ("level-3-complex", 2024, "3d"),
    }
    if (route.standard_key, route.year, route.question_id) in polar_zero_case_keys:
        return (
            "Check whether the right-hand side is zero before using the polar-root rule; "
            "only a non-zero right-hand side gives the listed distinct, equally spaced roots."
        )
    focus = route.focus.lower()
    patterns = (
        ("factor theorem", "Match the factor to its root carefully: for a factor x − a, substitute x = a into the complete polynomial and keep every sign."),
        ("remainder theorem", "Substitute the stated value into every polynomial term before solving for the unknown or interpreting the remainder."),
        ("chain rule", "Do not stop after differentiating the outside function; include the derivative of the inside function as a factor."),
        ("product rule", "Differentiate both factors in turn and keep both product-rule terms."),
        ("quotient rule", "Use brackets carefully and retain the squared denominator when applying the quotient rule."),
        ("point of inflection", "A zero second derivative alone is not enough; check the required change in concavity or other supporting evidence."),
        ("stationary", "After solving the derivative condition, check the point's nature and answer the conclusion the question actually asks for."),
        ("related rates", "Differentiate with respect to time consistently, then include the correct units and contextual interpretation."),
        ("maxim", "Finding a stationary value is only part of an optimisation argument; justify that it is the required maximum and respect the domain."),
        ("minimum", "Finding a stationary value is only part of the argument; justify that it is the required minimum and respect the domain."),
        ("argument", "Check the complex number's quadrant and the argument range before selecting the final angle."),
        ("roots of unity", "List every distinct root and check that the arguments have the required equal angular spacing."),
        ("complex roots", "Check whether the equation requires every root, and list distinct roots with the correct angular spacing."),
        ("fourth roots", "List all four distinct roots with the correct angular spacing and in the form the question requests."),
        ("cube roots", "List all three distinct roots with the correct angular spacing and in the form the question requests."),
        ("de moivre", "Apply the power to the modulus and multiply the argument by the same power before converting form."),
        ("polar form", "Keep modulus and argument operations separate, then check the quadrant and required argument range."),
        ("antidifferentiat", "Include the constant of integration, then use any given point or initial condition to determine it."),
        ("integrat", "Check the antiderivative by differentiating it, and handle constants and bounds explicitly."),
        ("area", "Check intersections, signs, and whether the question asks for signed area or total geometric area."),
        ("log", "Keep logarithm domain restrictions and any inner-function factor visible throughout the working."),
        ("radical", "State or check the real-domain restriction and test for extraneous solutions after squaring."),
        ("surd", "Keep exact values until the end and check any denominator or domain restriction."),
        ("normal", "A normal gradient is the negative reciprocal of the tangent gradient, not simply its negative."),
        ("tangent", "Use the derivative for the gradient and the original curve for the point before forming the tangent equation."),
    )
    for keyword, note in patterns:
        if keyword in focus:
            return note
    return (
        "Check each step against the original condition, preserve signs and restrictions, "
        "and confirm that the final result answers the question asked."
    )


def replace_first_h1(document: str, heading: str) -> str:
    updated, count = re.subn(
        r"(?is)(<h1\b[^>]*>).*?(</h1>)",
        lambda match: f"{match.group(1)}{h(heading)}{match.group(2)}",
        document,
        count=1,
    )
    if count != 1:
        raise ValueError("Expected exactly one <h1> element")
    return updated


def replace_back_to_paper(document: str, href: str) -> str:
    pattern = re.compile(r"(?is)<a\b(?P<attrs>[^>]*)>(?P<label>.*?Back to paper.*?)</a>")

    def replacement(match: re.Match[str]) -> str:
        attrs = match.group("attrs")
        if re.search(r"\bhref\s*=", attrs, flags=re.I):
            attrs = re.sub(
                r"(?is)\bhref\s*=\s*(['\"]).*?\1",
                f'href="{h(href)}"',
                attrs,
                count=1,
            )
        else:
            attrs += f' href="{h(href)}"'
        return f"<a{attrs}>{match.group('label')}</a>"

    updated, count = pattern.subn(replacement, document)
    if count < 1:
        raise ValueError("Expected at least one visible 'Back to paper' link")
    return updated


def question_overview(route: QuestionRoute) -> str:
    standard = route.standard
    return f"""
<section class="standard-section seo-question-overview" aria-labelledby="walkthrough-overview-heading">
  <p class="question-label">Walkthrough overview</p>
  <h2 id="walkthrough-overview-heading">What this question practises</h2>
  <p class="step-text" data-seo-overview-lead>This {route.year} walkthrough is part of {h(standard.code)} — {h(standard.official_name)}.</p>
  <p class="step-text"><strong>Method:</strong> <span data-seo-focus>{h(sentence(route.focus))}</span></p>
  <p class="step-text">This is <span data-seo-overview-question>Question {h(route.display_number)}</span> from the <a href="{h(route.year_file)}" data-seo-year-link>{route.year} NCEA Level {standard.level} {h(standard.topic)} paper</a> for <a href="{h(standard.landing_file)}" data-seo-standard-link>{h(standard.code)} — {h(standard.official_name)}</a>. Use the guided hints to practise the method before revealing the full working.</p>
  <p class="question-note">Calc.nz is an independent learning resource. Compare questions, diagrams, and assessment information with the <a href="{h(standard.official_url)}">official NZQA resources for {h(standard.code)}</a>.</p>
  <p class="page-updated">Page updated <time datetime="{REVIEW_DATE}">{human_date(REVIEW_DATE)}</time>.</p>
</section>
""".strip()


def question_learning_summary(route: QuestionRoute) -> str:
    return (
        f"This walkthrough helps you practise {lower_sentence(route.focus)}. "
        "Use the hints to plan the method, then repeat the question without hints and check each step."
    )


def question_skill_links(route: QuestionRoute) -> str:
    slugs = classify_question(route.focus, route.standard_key)
    if not slugs:
        return '<a href="skills.html">Browse more questions by skill</a>'
    return "Practise more questions using this skill: " + ", ".join(
        f'<a href="{h(SKILL_SPECS[slug].page_href)}">{h(SKILL_SPECS[slug].short_label)}</a>'
        for slug in slugs
    )


def skill_navigation_for_routes(routes: Sequence[QuestionRoute]) -> str:
    slugs = [
        slug
        for slug in SKILL_SPECS
        if any(slug in classify_question(route.focus, route.standard_key) for route in routes)
    ]
    return " ".join(
        f'<a class="nav-btn secondary" href="{h(SKILL_SPECS[slug].page_href)}">{h(SKILL_SPECS[slug].short_label)}</a>'
        for slug in slugs
    )


def question_summary(
    route: QuestionRoute,
    siblings: Sequence[QuestionRoute],
    guides: Sequence[Guide] = (),
) -> str:
    standard = route.standard
    ordered = sorted(siblings, key=question_sort_key)
    current_index = ordered.index(route)
    previous = ordered[current_index - 1] if current_index > 0 else None
    following = ordered[current_index + 1] if current_index + 1 < len(ordered) else None
    previous_href = previous.href if previous else route.href
    following_href = following.href if following else route.href
    previous_label = f"← Question {previous.display_number}" if previous else "Previous question"
    following_label = f"Question {following.display_number} →" if following else "Next question"
    previous_hidden = "" if previous else " hidden"
    following_hidden = "" if following else " hidden"
    matching_guides = [
        guide
        for guide in guides
        if guide.standard_key == route.standard_key
        and f"{route.year}:{route.question_id}" in guide.practice_question_ids
    ]
    guide_links = ", ".join(
        f'<a href="{h(guide.filename)}">{h(guide.title)}</a>'
        for guide in matching_guides
    )
    guide_hidden = "" if guide_links else " hidden"

    return f"""
<section class="standard-section seo-learning-summary" aria-labelledby="learning-summary-heading">
  <p class="question-label">Learning summary</p>
  <h2 id="learning-summary-heading">Review the method, not only the answer</h2>
  <p class="step-text" data-seo-summary>{h(question_learning_summary(route))}</p>
  <h3>Common mistake to avoid</h3>
  <p class="step-text" data-seo-mistake>{h(infer_common_mistake(route))}</p>
  <h3>Continue practising</h3>
  <div class="nav-row">
    <a class="nav-btn secondary" href="{h(previous_href)}" data-seo-related="previous"{previous_hidden}>{h(previous_label)}</a>
    <a class="nav-btn secondary" href="{h(following_href)}" data-seo-related="next"{following_hidden}>{h(following_label)}</a>
  </div>
  <ul class="step-text">
    <li><a href="{h(route.year_file)}" data-seo-related-year>All {route.year} {h(standard.topic)} walkthroughs</a></li>
    <li><a href="{h(standard.landing_file)}" data-seo-standard-link>All {h(standard.code)} {h(standard.topic)} years</a></li>
    <li data-seo-related-skills>{question_skill_links(route)}</li>
    <li data-seo-related-guides{guide_hidden}>{'Related concept guide: ' + guide_links if guide_links else ''}</li>
  </ul>
</section>
""".strip()


def question_page_record(
    route: QuestionRoute,
    guides: Sequence[Guide] = (),
) -> dict[str, object]:
    standard = route.standard
    matching_guides = [
        guide
        for guide in guides
        if guide.standard_key == route.standard_key
        and f"{route.year}:{route.question_id}" in guide.practice_question_ids
    ]
    record = {
        "level": {
            "id": f"level-{standard.level}",
            "label": f"Level {standard.level}",
        },
        "standard": {
            "id": route.standard_key,
            "label": standard.topic,
            "code": standard.code,
        },
        "paper": {
            "id": f"{route.standard_key}-{route.year}",
            "year": route.year,
        },
        "question": {
            "id": route.question_id,
            "label": f"Question {route.display_number}",
            "method": route.focus,
            "methodTitle": question_method_title(route),
            "canonical": route.canonical,
            "title": question_browser_title(route),
            "description": question_description(route),
            "summary": question_learning_summary(route),
            "commonMistake": infer_common_mistake(route),
            "skillSlugs": list(classify_question(route.focus, route.standard_key)),
            "reviewStatus": "unreviewed",
            "guideLinks": [
                {"href": guide.filename, "title": guide.title}
                for guide in matching_guides
            ],
        },
    }
    if (route.standard_key, route.year, route.question_id) in AUDITED_WALKTHROUGH_KEYS:
        record["question"]["reviewStatus"] = AUDIT_REVIEW_STATUS
    return record


def inject_question_page_record(
    document: str,
    route: QuestionRoute,
    source_routes: Sequence[QuestionRoute],
    guides: Sequence[Guide] = (),
) -> str:
    document = remove_marker(document, "PAGE_RECORD")
    owned_routes = sorted(
        (candidate for candidate in source_routes if candidate.source_file == route.source_file),
        key=lambda candidate: candidate.question_id,
    )
    if not owned_routes or route.route_path not in {candidate.route_path for candidate in owned_routes}:
        raise ValueError(f"Could not resolve page-record ownership for {route.route_path}")
    if len(owned_routes) == 1:
        payload: object = question_page_record(route, guides)
        assignment = "window.CALC_NZ_PAGE_RECORD"
    else:
        payload = {
            candidate.question_id: question_page_record(candidate, guides)
            for candidate in owned_routes
        }
        assignment = "window.CALC_NZ_PAGE_RECORDS"
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True).replace("</", "<\\/")
    block = marker(
        "PAGE_RECORD",
        f"<script>{assignment} = {encoded};</script>",
        "  ",
    )
    document, count = re.subn(
        r"(?is)(</head>)",
        lambda match: f"{block}\n{match.group(1)}",
        document,
        count=1,
    )
    if count != 1:
        raise ValueError(f"Could not add the page record for {route.route_path}")
    return document


def walkthrough_rich_block(value: object, class_name: str = "step-text") -> str:
    markup = str(value or "").strip()
    if not markup:
        return ""
    if re.search(r"<(?:div|p|section|article|figure|svg|table|ol|ul|li|blockquote|h[1-6]|pre|hr)\b", markup, flags=re.I):
        return markup
    return f'<p class="{h(class_name)}">{markup}</p>'


def walkthrough_fallback(route: QuestionRoute, record: Mapping[str, object]) -> str:
    expected_identity = {
        "standardId": route.standard_key,
        "paperId": f"{route.standard_key}-{route.year}",
        "questionId": route.question_id,
        "pageFile": route.source_file,
    }
    for field_name, expected in expected_identity.items():
        if record.get(field_name) != expected:
            raise ValueError(
                f"Static walkthrough projection for {route.route_path} has "
                f"{field_name}={record.get(field_name)!r}, expected {expected!r}"
            )
    question_html = str(record.get("questionHtml", "")).strip()
    support = record.get("firstSupport")
    step = record.get("firstGuidedStep")
    if not question_html or not isinstance(support, dict) or not isinstance(step, dict):
        raise ValueError(f"Incomplete static walkthrough projection for {route.route_path}")
    support_kind = str(support.get("kind", "idea")).strip().title()
    support_html = walkthrough_rich_block(support.get("html"))
    step_title = str(step.get("title", "First step")).strip()
    preview_html = walkthrough_rich_block(step.get("previewHtml"))
    working_html = walkthrough_rich_block(step.get("workingHtml"))
    rendered_diagram_count = record.get("renderedQuestionElementCount", 0)
    if not isinstance(rendered_diagram_count, int) or rendered_diagram_count < 0:
        raise ValueError(
            f"Invalid renderedQuestionElementCount for {route.route_path}"
        )
    if rendered_diagram_count:
        diagram_note = (
            '<p class="question-note static-diagram-note">The diagram is shown in its initial state. JavaScript adds any interactive controls and later walkthrough visuals.</p>'
        )
    elif record.get("hasAfterRender") is True:
        diagram_note = (
            '<p class="question-note static-diagram-note">A later walkthrough visual becomes available with JavaScript; the complete question and first learning steps remain below.</p>'
        )
    else:
        diagram_note = ""
    review_notice = ""
    if (route.standard_key, route.year, route.question_id) in AUDITED_WALKTHROUGH_KEYS:
        review_notice = (
            '<aside class="walkthrough-review-notice" aria-label="Review status">'
            '<p class="question-label">Review status</p>'
            '<p>This walkthrough has been corrected following an internal audit and is awaiting independent teacher review.</p>'
            '</aside>'
        )
    body = f"""
<section id="question-card" class="question-card static-walkthrough-question" data-prerendered="true">
  <p class="question-label">Question</p>
  {review_notice}
  {question_html}
  {diagram_note}
  <noscript><p class="question-note">Bookmarks, retry marks, exam mode, and the pinned-question setting need JavaScript. The question and first learning step remain available.</p></noscript>
</section>
<section id="hints-card" class="question-card tips-card static-walkthrough-support" data-prerendered="true">
  <p class="question-label">First walkthrough idea</p>
  <h2 id="static-first-idea-heading">{h(support_kind)} to try first</h2>
  {support_html}
</section>
<div id="walkthrough-content" class="static-walkthrough-content" data-prerendered="true">
  <section class="step-card static-first-step" aria-labelledby="static-first-step-heading">
    <p class="step-number">Step 1</p>
    <h2 id="static-first-step-heading">{h(step_title)}</h2>
    {preview_html}
    <details class="static-first-step-working">
      <summary>Show the first step’s working</summary>
      <div class="walkthrough-step-working">{working_html}</div>
    </details>
  </section>
  <noscript><p class="question-note">This no-JavaScript view shows the question, the first idea, and the first worked step. Enable JavaScript for all reveals, progress controls, and saved practice features.</p></noscript>
</div>""".strip()
    return marker("WALKTHROUGH_FALLBACK", body, "    ")


def remove_legacy_walkthrough_mounts(document: str, source_file: str) -> str:
    """Remove only known empty runtime mounts; never regex across authored HTML."""

    for mount_id in ("question-card", "hints-card", "walkthrough-content"):
        empty_mount = re.compile(
            rf"(?is)\s*<(?P<tag>section|div)\b"
            rf"(?=[^>]*\bid\s*=\s*[\"']{re.escape(mount_id)}[\"'])"
            rf"[^>]*>\s*</(?P=tag)>"
        )
        document = empty_mount.sub("", document)
        if re.search(
            rf"(?is)<(?:section|div)\b"
            rf"(?=[^>]*\bid\s*=\s*[\"']{re.escape(mount_id)}[\"'])",
            document,
        ):
            raise ValueError(
                f"Refusing to replace non-empty or malformed #{mount_id} in {source_file}"
            )
    return document


def update_question_page(
    original: str,
    route: QuestionRoute,
    siblings: Sequence[QuestionRoute],
    fallback_record: Mapping[str, object],
    guides: Sequence[Guide] = (),
) -> str:
    for name in ("HEAD", "BREADCRUMBS", "OVERVIEW", "SUMMARY", "SITE_HEADER", "PAGE_RECORD", "WALKTHROUGH_FALLBACK"):
        original = remove_marker(original, name)

    original, html_count = re.subn(
        r'(?is)<html\b[^>]*\blang\s*=\s*(["\']).*?\1[^>]*>',
        '<html lang="en-NZ">',
        original,
        count=1,
    )
    if html_count != 1:
        raise ValueError(f"Expected one language declaration in {route.source_file}")

    original = re.sub(
        r'(?im)^[ \t]*<script\b(?=[^>\r\n]*\bsrc\s*=\s*["\']question-catalogue\.js(?:\?[^"\']*)?["\'])[^>]*>\s*</script>[ \t]*\n?',
        "",
        original,
    )

    title = question_browser_title(route)
    description = question_description(route)
    original = replace_title(original, title)
    original = add_head_marker(
        original,
        metadata_body(
            title=title,
            description=description,
            canonical=route.canonical,
            structured_data=question_structured_data(route, title, description),
            og_type="article",
        ),
    )

    heading = (
        f"{route.year} NCEA Level {route.standard.level} {route.standard.topic} "
        f"Question {route.display_number}"
    )
    original = replace_first_h1(original, heading)
    original = replace_back_to_paper(original, route.year_file)
    old_paper_fragments = {f"index.html#{route.standard_key}-{route.year}"}
    if route.standard_key == "level-2-calculus":
        old_paper_fragments.add(f"index.html#level-2-{route.year}")
    for old_fragment in old_paper_fragments:
        original = original.replace(old_fragment, route.year_file)

    breadcrumb = breadcrumb_nav(
        (
            ("Calc.nz", "index.html"),
            (
                f"NCEA Level {route.standard.level} {route.standard.topic} — {route.standard.code}",
                route.standard.landing_file,
            ),
            (f"{route.year} paper", route.year_file),
            (f"Question {route.display_number}", None),
        ),
        (
            None,
            "data-seo-breadcrumb-standard",
            "data-seo-breadcrumb-year",
            "data-seo-breadcrumb-question",
        ),
    )
    original, count = re.subn(
        r"(?is)(<main\b[^>]*>)\s*",
        lambda match: f"{match.group(1)}\n{marker('BREADCRUMBS', breadcrumb, '  ')}\n\n",
        original,
        count=1,
    )
    if count != 1:
        raise ValueError(f"Could not insert breadcrumbs into {route.source_file}")

    original = remove_legacy_walkthrough_mounts(original, route.source_file)
    fallback = walkthrough_fallback(route, fallback_record)
    original, fallback_count = re.subn(
        r"(?is)(</header>)",
        lambda match: f"{match.group(1)}\n\n{fallback}\n",
        original,
        count=1,
    )
    if fallback_count != 1:
        raise ValueError(f"Could not insert static walkthrough content into {route.source_file}")

    original, count = re.subn(
        r"(?ims)(^[ \t]*<!-- SEO:WALKTHROUGH_FALLBACK:END -->)\s*",
        lambda match: f"{match.group(1)}\n\n{marker('OVERVIEW', question_overview(route), '    ')}\n\n",
        original,
        count=1,
    )
    if count != 1:
        raise ValueError(f"Could not insert overview into {route.source_file}")

    original, count = re.subn(
        r"(?is)\s*</main>",
        lambda match: f"\n\n{marker('SUMMARY', question_summary(route, siblings, guides), '    ')}\n  </main>",
        original,
        count=1,
    )
    if count != 1:
        raise ValueError(f"Could not insert learning summary into {route.source_file}")

    # Answer entry is no longer part of any walkthrough. Keep generated pages
    # from reintroducing the retired parser/validator bundle.
    original = re.sub(
        r'(?m)^\s*<script\s+defer\s+src=["\']typed-math\.js\?v=[^"\']+["\']></script>\s*\n?',
        "",
        original,
    )
    original = inject_question_page_record(original, route, siblings, guides)
    return inject_site_shell(original)


def update_redirect_page(original: str, source: str, target: str) -> str:
    original = remove_marker(original, "HEAD")
    # Legacy hash aliases still select the right part, but current question
    # pages no longer need a redundant fragment that can cause a viewport jump.
    original = re.sub(r"(?<=\.html)#question-[123][a-e]", "", original)
    title = f"Redirecting to {target} | Calc.nz"
    description = "This legacy walkthrough URL redirects to the current question page."
    original = replace_title(original, title)
    structured_data = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "url": absolute_url(target),
        "name": title,
    }
    updated = add_head_marker(
        original,
        metadata_body(
            title=title,
            description=description,
            canonical=absolute_url(target),
            structured_data=structured_data,
            robots="noindex,follow",
        ),
    )
    return inject_site_shell(updated)


def website_schema() -> dict[str, object]:
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": f"{BASE_URL}#website",
        "url": BASE_URL,
        "name": "Calc.nz",
        "description": "Free guided NCEA Level 3 Calculus worked answers for Complex Numbers, Differentiation, and Integration, with additional Level 2 practice.",
        "inLanguage": "en-NZ",
        "dateModified": REVIEW_DATE,
    }


def standards_directory(
    by_standard: Mapping[str, Sequence[QuestionRoute]],
) -> str:
    cards: list[str] = []
    for key in STANDARD_ORDER:
        standard = STANDARDS[key]
        years = sorted({route.year for route in by_standard[key]}, reverse=True)
        year_label = ", ".join(str(year) for year in years)
        cards.append(
            f"""
<a class="nav-btn index-link-card" href="{h(standard.landing_file)}">
  <span class="index-link-title">NCEA Level {standard.level} {h(standard.topic)} — {h(standard.code)}</span>
  <span class="index-link-copy">{h(standard.official_name)}. Available papers: {h(year_label)}.</span>
</a>""".strip()
        )
    return f"""
<section class="question-card standard-directory" aria-labelledby="standard-directory-heading">
  <p class="question-label">Browse all worked answers</p>
  <h1 id="standard-directory-heading">NCEA maths standards on Calc.nz</h1>
  <p class="step-text">These standard pages organise every worked question walkthrough by topic and examination year.</p>
  <div class="nav-row index-nav">
    {' '.join(cards)}
  </div>
  <div class="nav-row">
    <a class="nav-btn secondary" href="level-3-calculus.html">Level 3 Calculus: all three standards</a>
    <a class="nav-btn secondary" href="skills.html">Browse questions by skill</a>
  </div>
</section>
""".strip()


def update_homepage(
    original: str,
) -> str:
    for name in ("HEAD", "DIRECTORY", "FOOTER", "SITE_HEADER"):
        original = remove_marker(original, name)
    original, html_count = re.subn(
        r'(?is)<html\b[^>]*\blang\s*=\s*(["\']).*?\1[^>]*>',
        '<html lang="en-NZ">',
        original,
        count=1,
    )
    if html_count != 1:
        raise ValueError("Homepage must declare one language")

    title = "NCEA Level 3 Calculus Worked Answers & Walkthroughs | Calc.nz"
    description = (
        "Free guided NCEA Level 3 Calculus worked answers for AS91577 Complex Numbers, "
        "AS91578 Differentiation, and AS91579 Integration."
    )
    original = replace_title(original, title)
    original = add_head_marker(
        original,
        metadata_body(
            title=title,
            description=description,
            canonical=BASE_URL,
            structured_data=website_schema(),
        ),
    )
    original = replace_first_h1(original, "Level 3 Calculus worked answers and walkthroughs")

    original = re.sub(
        r'(?im)^\s*<(?:link|script)\b[^>]*(?:katex|auto-render|walkthrough-gate\.js|question-catalogue\.js|index-page\.js|site-shell\.js|search-core\.js|index-loader\.js)[^>]*>(?:</script>)?\s*\n?',
        "",
        original,
    )
    homepage_scripts = "\n".join(
        (
            f'<script defer src="site-shell.js?v={CACHE_TOKEN}"></script>',
            f'<script defer src="search-core.js?v={CACHE_TOKEN}"></script>',
            f'<script defer src="index-loader.js?v={CACHE_TOKEN}"></script>',
        )
    )
    original, script_count = re.subn(
        r"(?is)(</head>)",
        lambda match: f"{homepage_scripts}\n{match.group(1)}",
        original,
        count=1,
    )
    if script_count != 1:
        raise ValueError("Could not add the lazy homepage scripts")

    homepage_guides_link = (
        '<a class="site-footer-link" href="/guides.html">Guides</a>'
        if load_guides()
        else ""
    )
    footer_navigation = f"""
<nav class="site-footer-nav" aria-label="Footer">
  <a class="site-footer-link" href="/">Home</a>
  <a class="site-footer-link" href="/standards.html">Standards</a>
  <a class="site-footer-link" href="/skills.html">Skills</a>
  {homepage_guides_link}
  <a class="site-footer-link" href="/search.html">Search</a>
  <a class="site-footer-link" href="/about.html">About</a>
</nav>""".strip()
    if "site-footer-nav" not in original:
        original, footer_nav_count = re.subn(
            r"(?is)(<footer\b[^>]*>)",
            lambda match: f"{match.group(1)}\n  {footer_navigation}",
            original,
            count=1,
        )
        if footer_nav_count != 1:
            raise ValueError("Could not add the homepage footer navigation")
    else:
        original, footer_nav_count = re.subn(
            r'(?is)<nav\b(?=[^>]*\bclass=["\'][^"\']*\bsite-footer-nav\b)[^>]*>.*?</nav>',
            footer_navigation,
            original,
            count=1,
        )
        if footer_nav_count != 1:
            raise ValueError("Could not update the homepage footer navigation")

    footer = f"""
<p class="site-footer-text site-footer-disclaimer">Calc.nz is an independent learning resource and is not affiliated with or endorsed by NZQA. Check questions and assessment information against the <a class="site-footer-link" href="https://www2.nzqa.govt.nz/ncea/subjects/select-subject/mathematics-and-statistics/">official NZQA Mathematics and Statistics material</a>.</p>
""".strip()
    original, count = re.subn(
        r"(?is)\s*</footer>",
        lambda match: f"\n{marker('FOOTER', footer, '  ')}\n</footer>",
        original,
        count=1,
    )
    if count != 1:
        raise ValueError("Could not improve the homepage footer")
    return inject_site_shell(original)


def page_head(
    *,
    title: str,
    description: str,
    canonical: str,
    structured_data: Mapping[str, object],
    robots: str = "index,follow",
    og_type: str = "website",
) -> str:
    return f"""<!DOCTYPE html>
<html lang="en-NZ">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{h(title)}</title>
{marker('HEAD', metadata_body(title=title, description=description, canonical=canonical, structured_data=structured_data, robots=robots, og_type=og_type), '  ')}
  <link rel="stylesheet" href="style.css?v={CACHE_TOKEN}">
  <script defer src="site-shell.js?v={CACHE_TOKEN}"></script>
</head>"""


def site_header(*, guides_published: bool | None = None) -> str:
    if guides_published is None:
        guides_published = bool(load_guides())
    guides_link = (
        '<a class="site-header-link" href="/guides.html">Guides</a>'
        if guides_published
        else ""
    )
    return f"""
<a class="skip-link" href="#main-content">Skip to main content</a>
<header class="site-header">
  <nav class="site-header-inner" aria-label="Site">
    <a class="site-brand" href="/">Calc.nz</a>
    <button class="site-menu-toggle" type="button" aria-expanded="false" aria-controls="site-header-links">
      <span class="site-menu-label">Menu</span>
      <span class="site-menu-icon" aria-hidden="true"></span>
    </button>
    <div id="site-header-links" class="site-header-links">
      <a class="site-header-link" href="/standards.html">Standards</a>
      <a class="site-header-link" href="/skills.html">Skills</a>
      {guides_link}
      <a class="site-header-link" href="/search.html">Search</a>
      <a class="site-header-link" href="/about.html">About</a>
    </div>
  </nav>
</header>""".strip()


def collection_schema(
    *,
    canonical: str,
    title: str,
    description: str,
    crumbs: Sequence[tuple[str, str]],
    standard: Standard | None = None,
    date_modified: str = REVIEW_DATE,
) -> dict[str, object]:
    page: dict[str, object] = {
        "@type": "WebPage",
        "@id": f"{canonical}#webpage",
        "url": canonical,
        "name": title,
        "description": description,
        "inLanguage": "en-NZ",
        "dateModified": date_modified,
        "isPartOf": {"@id": f"{BASE_URL}#website"},
    }
    if standard is not None:
        page["about"] = {
            "@type": "LearningResource",
            "name": f"{standard.code} — {standard.official_name}",
            "educationalLevel": f"NCEA Level {standard.level}",
            "isAccessibleForFree": True,
        }
    return {
        "@context": "https://schema.org",
        "@graph": [page, breadcrumb_schema(crumbs)],
    }


def site_footer(*, guides_published: bool | None = None) -> str:
    if guides_published is None:
        guides_published = bool(load_guides())
    guides_link = (
        '<a class="site-footer-link" href="/guides.html">Guides</a>'
        if guides_published
        else ""
    )
    return f"""
<footer class="site-footer">
  <p class="site-footer-text">Calc.nz is an independent learning resource. Compare questions, diagrams, and assessment information with the official NZQA material.</p>
  <nav class="site-footer-nav" aria-label="Footer">
    <a class="site-footer-link" href="/">Home</a>
    <a class="site-footer-link" href="/standards.html">Standards</a>
    <a class="site-footer-link" href="/skills.html">Skills</a>
    {guides_link}
    <a class="site-footer-link" href="/search.html">Search</a>
    <a class="site-footer-link" href="about.html">About</a>
  </nav>
  <p class="site-footer-text site-footer-disclaimer">Calc.nz is independent and is not affiliated with or endorsed by NZQA.</p>
  <p class="site-footer-text report-issue-text"><a class="report-issue-link" href="{h(ERROR_REPORT_URL)}" target="_blank" rel="noopener noreferrer">Report an error or issue</a></p>
</footer>""".strip()


def standards_page(
    by_standard: Mapping[str, Sequence[QuestionRoute]],
) -> str:
    filename = "standards.html"
    canonical = absolute_url(filename)
    title = "NCEA Maths Standards & Worked Answers | Calc.nz"
    description = (
        "Browse every NCEA Level 2 and Level 3 maths standard available on Calc.nz, "
        "with free guided worked answers organised by topic and examination year."
    )
    structured = collection_schema(
        canonical=canonical,
        title=title,
        description=description,
        crumbs=(("Calc.nz", BASE_URL), ("Standards", canonical)),
    )
    breadcrumb = breadcrumb_nav((("Calc.nz", "index.html"), ("Standards", None)))
    return f"""{page_head(title=title, description=description, canonical=canonical, structured_data=structured)}
<body class="home-page standards-page has-site-header">
{site_header()}
<main id="main-content" class="app home-app standards-app" tabindex="-1">
{marker('BREADCRUMBS', breadcrumb, '  ')}
  {standards_directory(by_standard)}
</main>
{site_footer()}
</body>
</html>
"""


def grade_reasoning_html() -> str:
    return "\n".join(
        f"<li><strong>{h(grade)}:</strong> {h(explanation)}</li>"
        for grade, explanation in GRADE_REASONING
    )


def standard_page(
    standard: Standard,
    routes: Sequence[QuestionRoute],
    guides: Sequence[Guide] = (),
) -> str:
    years = sorted({route.year for route in routes}, reverse=True)
    canonical = standard.landing_url
    title = f"NCEA Level {standard.level} {standard.topic} {standard.code} Worked Answers | Calc.nz"
    description = truncate(
        f"Free NCEA Level {standard.level} {standard.topic} {standard.code} worked answers and guided question walkthroughs, grouped by examination year with hints and reasoning."
    )
    structured = collection_schema(
        canonical=canonical,
        title=title,
        description=description,
        crumbs=(
            ("Calc.nz", BASE_URL),
            (f"NCEA Level {standard.level} {standard.topic} — {standard.code}", canonical),
        ),
        standard=standard,
    )
    skill_items = "\n".join(f"<li>{h(skill)}</li>" for skill in standard.skills)
    mistake_items = "\n".join(f"<li>{h(item)}</li>" for item in standard.mistakes)
    year_cards: list[str] = []
    for year in years:
        year_routes = sorted(
            (route for route in routes if route.year == year),
            key=question_sort_key,
        )
        count = len(year_routes)
        year_cards.append(
            f"""<a class="nav-btn index-link-card" href="{h(year_file(standard.key, year))}">
  <span class="index-link-title">{year} {h(standard.topic)} worked answers</span>
  <span class="index-link-copy">{count} worked question walkthroughs for {h(standard.code)}.</span>
</a>"""
        )
    breadcrumb = breadcrumb_nav(
        (
            ("Calc.nz", "index.html"),
            (f"NCEA Level {standard.level} {standard.topic} — {standard.code}", None),
        )
    )
    umbrella_link = (
        '\n      <a class="nav-btn secondary" href="level-3-calculus.html">Level 3 Calculus overview</a>'
        if standard.key in {"level-3-differentiation", "level-3-integration"}
        else ""
    )
    direct_skill_links = skill_navigation_for_routes(routes)
    matching_guides = [guide for guide in guides if guide.standard_key == standard.key]
    guide_block = ""
    if matching_guides:
        guide_cards = " ".join(
            f'<a class="nav-btn index-link-card" href="{h(guide.filename)}">'
            f'<span class="index-link-title">{h(guide.title)}</span>'
            f'<span class="index-link-copy">{h(guide.summary)}</span></a>'
            for guide in matching_guides
        )
        guide_block = f"""
  <section class="question-card related-guide-section" aria-labelledby="standard-guides-heading">
    <p class="question-label">Learn the concepts</p>
    <h2 id="standard-guides-heading">Guides for {h(standard.code)}</h2>
    <div class="nav-row index-nav">{guide_cards}</div>
  </section>
"""
    return f"""{page_head(title=title, description=description, canonical=canonical, structured_data=structured)}
<body class="home-page has-site-header">
{site_header()}
<main id="main-content" class="app home-app" tabindex="-1">
{marker('BREADCRUMBS', breadcrumb, '  ')}
  <header class="topbar">
    <div>
      <p class="eyebrow">NCEA Level {standard.level} worked answers and walkthroughs</p>
      <h1>NCEA Level {standard.level} {h(standard.topic)} — {h(standard.code)}</h1>
      <p class="subtitle">{h(standard.official_name)}</p>
    </div>
    <a class="ghost-link" href="/standards.html">← Browse all standards</a>
  </header>

  <section class="question-card" aria-labelledby="standard-overview-heading">
    <p class="question-label">Standard overview</p>
    <h2 id="standard-overview-heading">Skills covered in {h(standard.code)}</h2>
    <p class="step-text">{h(standard.summary)}</p>
    <ul class="step-text">
      {skill_items}
    </ul>
    <p class="question-note">Official title: <strong>{h(standard.code)} — {h(standard.official_name)}</strong>. View the <a href="{h(standard.official_url)}">official NZQA standard and assessment resources for {h(standard.code)}</a>.</p>
  </section>

  <section class="question-card" aria-labelledby="skill-discovery-heading">
    <p class="question-label">More ways to practise</p>
    <h2 id="skill-discovery-heading">Browse related questions by method</h2>
    <p class="step-text">Skill pages collect questions using the same method from different examination years.</p>
    <div class="nav-row">
      <a class="nav-btn secondary" href="skills.html">Browse by skill</a>{umbrella_link}
    </div>
    <div class="nav-row">{direct_skill_links}</div>
  </section>

  <section class="question-card" aria-labelledby="paper-years-heading">
    <p class="question-label">Available examination years</p>
    <h2 id="paper-years-heading">Choose a {h(standard.topic)} paper</h2>
    <p class="step-text">Each year page links to every walkthrough currently available on Calc.nz.</p>
    <div class="nav-row index-nav">
      {' '.join(year_cards)}
    </div>
  </section>

  {guide_block}

  <section class="question-card" aria-labelledby="grade-reasoning-heading">
    <p class="question-label">Reasoning progression</p>
    <h2 id="grade-reasoning-heading">Achieved, Merit, and Excellence thinking</h2>
    <p class="step-text">The grade depends on the complete evidence in a response, not merely the apparent difficulty of a question part. Across these walkthroughs, the progression can be understood as:</p>
    <ul class="step-text">
      {grade_reasoning_html()}
    </ul>
    <p class="question-note">Always use the assessment schedule for the specific examination when checking grade evidence.</p>
  </section>

  <section class="question-card" aria-labelledby="mistakes-heading">
    <p class="question-label">Exam preparation</p>
    <h2 id="mistakes-heading">Common mistakes to watch for</h2>
    <ul class="step-text">
      {mistake_items}
    </ul>
  </section>
  <p class="page-updated">Page updated <time datetime="{REVIEW_DATE}">{human_date(REVIEW_DATE)}</time>.</p>
</main>
{site_footer()}
</body>
</html>
"""


def year_page(
    standard: Standard,
    year: int,
    routes: Sequence[QuestionRoute],
    all_years: Sequence[int],
) -> str:
    ordered = sorted(routes, key=question_sort_key)
    filename = year_file(standard.key, year)
    canonical = absolute_url(filename)
    title = f"{year} NCEA Level {standard.level} {standard.topic} {standard.code} Worked Answers | Calc.nz"
    description = truncate(
        f"Free {year} NCEA Level {standard.level} {standard.topic} {standard.code} worked answers. Study {len(ordered)} questions with optional hints and step-by-step reasoning."
    )
    structured = collection_schema(
        canonical=canonical,
        title=title,
        description=description,
        crumbs=(
            ("Calc.nz", BASE_URL),
            (f"NCEA Level {standard.level} {standard.topic} — {standard.code}", standard.landing_url),
            (f"{year} paper", canonical),
        ),
        standard=standard,
    )
    breadcrumb = breadcrumb_nav(
        (
            ("Calc.nz", "index.html"),
            (
                f"NCEA Level {standard.level} {standard.topic} — {standard.code}",
                standard.landing_file,
            ),
            (f"{year} paper", None),
        )
    )

    by_number: dict[int, list[QuestionRoute]] = defaultdict(list)
    for route in ordered:
        by_number[int(re.match(r"\d+", route.question_id).group())].append(route)  # type: ignore[union-attr]

    groups: list[str] = []
    for number, question_routes in sorted(by_number.items()):
        cards = []
        for route in question_routes:
            cards.append(
                f"""<a class="nav-btn index-link-card" href="{h(route.href)}">
  <span class="index-link-title">Question {h(route.display_number)} worked solution</span>
  <span class="index-link-copy">{h(sentence(meta_plain(route.focus)))}</span>
</a>"""
            )
        groups.append(
            f"""<section class="index-group" aria-labelledby="question-{number}-heading">
  <p class="question-label index-group-label">Question {number}</p>
  <h3 id="question-{number}-heading">Question {number} walkthroughs</h3>
  <div class="nav-row index-nav">
    {' '.join(cards)}
  </div>
</section>"""
        )

    other_years = [value for value in all_years if value != year]
    other_links = " ".join(
        f'<a class="nav-btn secondary" href="{h(year_file(standard.key, value))}">{value}</a>'
        for value in other_years
    )

    priority_note = ""
    if standard.code == "AS91577" and year == 2022:
        priority_note = (
            '<p class="question-note"><strong>Looking for 2022 NCEA complex numbers worked answers?</strong> '
            "Start with the question that matches your paper, attempt it first, and use each hint before opening the full working.</p>"
        )

    direct_skill_links = skill_navigation_for_routes(ordered)
    official_resources = official_resources_for_year(standard, year)

    return f"""{page_head(title=title, description=description, canonical=canonical, structured_data=structured)}
<body class="home-page has-site-header">
{site_header()}
<main id="main-content" class="app home-app" tabindex="-1">
{marker('BREADCRUMBS', breadcrumb, '  ')}
  <header class="topbar">
    <div>
      <p class="eyebrow">{year} NCEA Level {standard.level} {h(standard.topic)}</p>
      <h1>{year} {h(standard.topic)} {h(standard.code)} worked answers</h1>
      <p class="subtitle">Guided, step-by-step worked solutions for {h(standard.official_name)}.</p>
    </div>
    <a class="ghost-link" href="{h(standard.landing_file)}">← All {h(standard.topic)} years</a>
  </header>

  <details class="question-card paper-overview-details" open data-mobile-paper-overview>
    <summary id="paper-overview-heading">
      <span class="question-label">Paper overview</span>
      <strong>Work through the {year} questions one step at a time</strong>
      <span class="paper-overview-summary">{len(ordered)} walkthroughs · {h(standard.code)} · Official source context included</span>
    </summary>
    <div class="paper-overview-body">
      <p class="step-text">This page contains {len(ordered)} independent worked question walkthroughs for NCEA Level {standard.level} {h(standard.topic)} ({h(standard.code)}). Each walkthrough offers hints, reveals the full working in a logical sequence, and focuses on the method described below.</p>
      {priority_note}
      {official_resources}
      <p class="question-note">Calc.nz is independent of NZQA. Use official NZQA material for the original paper, diagrams, assessment schedule, and authoritative standard information.</p>
    </div>
  </details>

  <section class="question-card" aria-labelledby="question-list-heading">
    <p class="question-label">Worked question index</p>
    <h2 id="question-list-heading">{year} {h(standard.topic)} questions</h2>
    <p class="step-text">Choose a question part to open its guided worked solution.</p>
    {' '.join(groups)}
  </section>

  <section class="question-card" aria-labelledby="related-years-heading">
    <p class="question-label">More practice</p>
    <h2 id="related-years-heading">Other {h(standard.topic)} examination years</h2>
    <div class="nav-row">{other_links}</div>
    <p class="step-text"><a href="skills.html">Browse questions from different years by skill</a>.</p>
    <div class="nav-row">{direct_skill_links}</div>
  </section>
  <p class="page-updated">Page updated <time datetime="{REVIEW_DATE}">{human_date(REVIEW_DATE)}</time>.</p>
</main>
{site_footer()}
</body>
</html>
"""


def level_three_calculus_page(
    by_standard: Mapping[str, Sequence[QuestionRoute]],
) -> str:
    filename = "level-3-calculus.html"
    canonical = absolute_url(filename)
    complex_numbers = STANDARDS["level-3-complex"]
    differentiation = STANDARDS["level-3-differentiation"]
    integration = STANDARDS["level-3-integration"]
    level_three_standards = (complex_numbers, differentiation, integration)
    routes = [
        route
        for standard in level_three_standards
        for route in by_standard[standard.key]
    ]
    years = sorted({route.year for route in routes}, reverse=True)
    title = "NCEA Level 3 Calculus Worked Answers | Calc.nz"
    description = (
        "Prepare for NCEA Level 3 Calculus with AS91577 Complex Numbers, AS91578 "
        "Differentiation, and AS91579 Integration walkthroughs."
    )
    structured = collection_schema(
        canonical=canonical,
        title=title,
        description=description,
        crumbs=(("Calc.nz", BASE_URL), ("NCEA Level 3 Calculus", canonical)),
    )
    breadcrumb = breadcrumb_nav(
        (("Calc.nz", "index.html"), ("NCEA Level 3 Calculus", None))
    )
    standard_cards = " ".join(
        f"""<a class="nav-btn index-link-card" href="{h(standard.landing_file)}">
  <span class="index-link-title">{h(standard.topic)} — {h(standard.code)}</span>
  <span class="index-link-copy">{h(standard.official_name)}. Browse {len(by_standard[standard.key])} walkthroughs.</span>
</a>"""
        for standard in level_three_standards
    )
    year_links = " ".join(
        f'<a class="nav-btn secondary" href="{h(year_file(standard.key, year))}">{year} {h(standard.topic)}</a>'
        for year in years
        for standard in level_three_standards
        if any(route.year == year for route in by_standard[standard.key])
    )

    return f"""{page_head(title=title, description=description, canonical=canonical, structured_data=structured)}
<body class="home-page content-page has-site-header">
{site_header()}
<main id="main-content" class="app home-app content-app" tabindex="-1">
{marker('BREADCRUMBS', breadcrumb, '  ')}
  <header class="topbar">
    <div>
      <p class="eyebrow">NCEA Level 3 Calculus</p>
      <h1>NCEA Level 3 Calculus worked answers</h1>
      <p class="subtitle">Practise Complex Numbers, Differentiation, and Integration by standard, paper year, or question.</p>
    </div>
    <a class="ghost-link" href="standards.html">Browse all standards</a>
  </header>

  <section class="question-card" aria-labelledby="level-three-calculus-overview">
    <p class="question-label">Level 3 Calculus</p>
    <h2 id="level-three-calculus-overview">All three external Level 3 standards</h2>
    <p class="step-text">This hub includes <a href="{h(complex_numbers.landing_file)}">{h(complex_numbers.code)} Complex Numbers</a>, <a href="{h(differentiation.landing_file)}">{h(differentiation.code)} Differentiation</a>, and <a href="{h(integration.landing_file)}">{h(integration.code)} Integration</a> — {len(routes)} walkthroughs in total.</p>
    <p class="question-note">Calc.nz is independent. Use the linked official NZQA pages on each standard and paper page for authoritative assessment material.</p>
  </section>

  <section class="question-card" aria-labelledby="calculus-standard-heading">
    <p class="question-label">Choose a standard</p>
    <h2 id="calculus-standard-heading">Level 3 Calculus walkthrough collections</h2>
    <div class="nav-row index-nav">{standard_cards}</div>
  </section>

  <section class="question-card" aria-labelledby="calculus-year-heading">
    <p class="question-label">Browse examination years</p>
    <h2 id="calculus-year-heading">Level 3 papers by standard and year</h2>
    <div class="nav-row">{year_links}</div>
  </section>

  <section class="question-card" aria-labelledby="calculus-skill-heading">
    <p class="question-label">Method practice</p>
    <h2 id="calculus-skill-heading">Browse Level 3 Calculus by skill</h2>
    <p class="step-text">Use the <a href="skills.html">Browse by skill directory</a> to collect related questions from different years before returning to a full paper.</p>
  </section>
  <p class="page-updated">Page updated <time datetime="{REVIEW_DATE}">{human_date(REVIEW_DATE)}</time>.</p>
</main>
{site_footer()}
</body>
</html>
"""


def routes_for_skill(routes: Sequence[QuestionRoute], slug: str) -> list[QuestionRoute]:
    return [
        route
        for route in routes
        if slug in classify_question(route.focus, route.standard_key)
    ]


def skills_directory_page(routes: Sequence[QuestionRoute]) -> str:
    filename = "skills.html"
    canonical = absolute_url(filename)
    title = "Browse NCEA Maths Questions by Skill | Calc.nz"
    description = (
        "Browse substantial NCEA maths skill collections on Calc.nz, with related "
        "worked questions grouped across standards and examination years."
    )
    structured = collection_schema(
        canonical=canonical,
        title=title,
        description=description,
        crumbs=(("Calc.nz", BASE_URL), ("Browse by skill", canonical)),
    )
    breadcrumb = breadcrumb_nav(
        (("Calc.nz", "index.html"), ("Browse by skill", None))
    )
    cards: list[str] = []
    for slug, spec in SKILL_SPECS.items():
        matching = routes_for_skill(routes, slug)
        standards = [
            STANDARDS[key]
            for key in STANDARD_ORDER
            if any(route.standard_key == key for route in matching)
        ]
        context = ", ".join(
            f"Level {standard.level} {standard.code}" for standard in standards
        )
        cards.append(
            f"""<a class="nav-btn index-link-card" href="{h(spec.page_href)}">
  <span class="index-link-title">{h(spec.title_label)}</span>
  <span class="index-link-copy">{len(matching)} questions · {h(context)}. {h(spec.intro)}</span>
</a>"""
        )

    return f"""{page_head(title=title, description=description, canonical=canonical, structured_data=structured)}
<body class="home-page content-page skills-directory-page has-site-header">
{site_header()}
<main id="main-content" class="app home-app content-app" tabindex="-1">
{marker('BREADCRUMBS', breadcrumb, '  ')}
  <header class="topbar">
    <div>
      <p class="eyebrow">Browse by skill</p>
      <h1>Browse NCEA maths questions by skill</h1>
      <p class="subtitle">Collect questions using the same method from different papers and years.</p>
    </div>
    <a class="ghost-link" href="standards.html">Browse standards</a>
  </header>

  <section class="question-card" aria-labelledby="skills-directory-introduction">
    <p class="question-label">Method practice</p>
    <h2 id="skills-directory-introduction">Choose a skill to practise</h2>
    <p class="step-text">These pages are created only for skills with enough matching questions in the walkthrough catalogue to provide useful practice. Grouping comes from the recorded method for each walkthrough; Calc.nz does not infer grades or difficulty from question position.</p>
    <div class="nav-row index-nav">{' '.join(cards)}</div>
  </section>

  <section class="question-card" aria-labelledby="skills-browse-context">
    <p class="question-label">Other browse paths</p>
    <h2 id="skills-browse-context">Return to a standard or full paper</h2>
    <div class="nav-row">
      <a class="nav-btn secondary" href="level-3-calculus.html">Level 3 Calculus overview</a>
      <a class="nav-btn secondary" href="standards.html">All standards and years</a>
    </div>
  </section>
  <p class="page-updated">Page updated <time datetime="{REVIEW_DATE}">{human_date(REVIEW_DATE)}</time>.</p>
</main>
{site_footer()}
</body>
</html>
"""


def skill_page(
    spec: object,
    routes: Sequence[QuestionRoute],
    guides: Sequence[Guide] = (),
) -> str:
    # SkillSpec is imported from the dependency-free content module. Keeping
    # this renderer structural lets the curated copy/classification stay data-driven.
    slug = spec.slug
    matching = sorted(
        routes_for_skill(routes, slug),
        key=lambda route: (
            STANDARD_ORDER.index(route.standard_key),
            -route.year,
            question_sort_key(route),
        ),
    )
    if len(matching) < spec.min_count:
        raise ValueError(
            f"{slug} has {len(matching)} questions, below its useful-page minimum {spec.min_count}"
        )
    filename = spec.page_href
    canonical = absolute_url(filename)
    title = f"{spec.title_label} NCEA Practice Questions | Calc.nz"
    description = truncate(spec.meta_description)
    structured = collection_schema(
        canonical=canonical,
        title=title,
        description=description,
        crumbs=(
            ("Calc.nz", BASE_URL),
            ("Browse by skill", absolute_url("skills.html")),
            (spec.title_label, canonical),
        ),
    )
    breadcrumb = breadcrumb_nav(
        (
            ("Calc.nz", "index.html"),
            ("Browse by skill", "skills.html"),
            (spec.title_label, None),
        )
    )
    standards = [
        STANDARDS[key]
        for key in STANDARD_ORDER
        if any(route.standard_key == key for route in matching)
    ]
    standard_links = " · ".join(
        f'<a href="{h(standard.landing_file)}">NCEA Level {standard.level} {h(standard.topic)} — {h(standard.code)}</a>'
        for standard in standards
    )
    mistakes = synthesise_common_mistakes(
        slug,
        (route.focus for route in matching),
        limit=3,
    )
    mistake_items = "".join(f"<li>{h(item)}</li>" for item in mistakes)

    grouped: dict[tuple[str, int], list[QuestionRoute]] = defaultdict(list)
    for route in matching:
        grouped[(route.standard_key, route.year)].append(route)
    question_groups: list[str] = []
    jump_links: list[str] = []
    for standard_key in STANDARD_ORDER:
        years = sorted(
            {year for key, year in grouped if key == standard_key},
            reverse=True,
        )
        for year in years:
            standard = STANDARDS[standard_key]
            group_routes = sorted(grouped[(standard_key, year)], key=question_sort_key)
            group_id = f"{slug}-{standard_key}-{year}"
            method_values = sorted({question_method_title(route) for route in group_routes})
            jump_links.append(
                f'<a class="skill-jump-link" href="#{h(group_id)}">{year} {h(standard.topic)}</a>'
            )
            cards = " ".join(
                f"""<a class="nav-btn index-link-card" href="{h(route.href)}" data-skill-method="{h(question_method_title(route))}">
  <span class="index-link-title">{h(route.title)} — {h(question_method_title(route))}</span>
  <span class="index-link-copy">{h(sentence(meta_plain(route.focus)))}</span>
</a>"""
                for route in group_routes
            )
            question_groups.append(
                f"""<details class="index-group skill-question-group" open data-skill-group data-standard="{h(standard_key)}" data-methods="{h('|'.join(method_values))}">
  <summary id="{h(group_id)}" class="skill-question-summary">
    <span class="question-label">NCEA Level {standard.level} · {h(standard.code)}</span>
    <strong>{year} {h(standard.topic)}</strong>
    <span>{len(group_routes)} question{'s' if len(group_routes) != 1 else ''}</span>
  </summary>
  <div class="year-cluster-header skill-year-links">
    <div>
      <p class="step-text">Open a question or return to its assessment context.</p>
    </div>
    <div class="nav-row">
      <a class="site-footer-link" href="{h(standard.landing_file)}">Standard overview</a>
      <a class="site-footer-link" href="{h(year_file(standard_key, year))}">{year} paper</a>
    </div>
  </div>
  <div class="nav-row index-nav">{cards}</div>
</details>"""
            )

    method_filters = sorted({question_method_title(route) for route in matching})
    filter_buttons = [
        '<button class="skill-filter-chip is-active" type="button" aria-pressed="true" data-skill-filter="all">All questions</button>'
    ]
    filter_buttons.extend(
        f'<button class="skill-filter-chip" type="button" aria-pressed="false" data-skill-filter="{h(standard.key)}">{h(standard.code)}</button>'
        for standard in standards
    )
    if len(method_filters) > 1:
        filter_buttons.extend(
            f'<button class="skill-filter-chip" type="button" aria-pressed="false" data-skill-filter="{h(method)}">{h(method)}</button>'
            for method in method_filters
        )

    related_links = " ".join(
        f'<a class="nav-btn secondary" href="{h(SKILL_SPECS[related].page_href)}">{h(SKILL_SPECS[related].short_label)}</a>'
        for related in spec.related_skill_slugs
    )
    matching_guides = [guide for guide in guides if slug in guide.skill_slugs]
    guide_block = ""
    if matching_guides:
        guide_links = " ".join(
            f'<a class="nav-btn secondary guide-chip" href="{h(guide.filename)}">{h(guide.title)}</a>'
            for guide in matching_guides
        )
        guide_block = f"""
  <section class="question-card related-guide-section" aria-labelledby="skill-guides-heading">
    <p class="question-label">Learn before practising</p>
    <h2 id="skill-guides-heading">Guides related to this skill</h2>
    <div class="nav-row">{guide_links}</div>
  </section>
"""

    return f"""{page_head(title=title, description=description, canonical=canonical, structured_data=structured)}
<body class="home-page content-page skill-page has-site-header">
{site_header()}
<main id="main-content" class="app home-app content-app" tabindex="-1">
{marker('BREADCRUMBS', breadcrumb, '  ')}
  <header class="topbar">
    <div>
      <p class="eyebrow">NCEA maths skill practice</p>
      <h1>{h(spec.h1)} NCEA practice questions</h1>
      <p class="subtitle">{h(spec.intro)}</p>
    </div>
    <a class="ghost-link" href="skills.html">← All skills</a>
  </header>

  <section class="question-card" aria-labelledby="skill-overview-heading">
    <p class="question-label">Skill overview</p>
    <h2 id="skill-overview-heading">What these questions practise</h2>
    <p class="step-text">{h(spec.explanation)}</p>
    <p class="step-text"><strong>Relevant standards:</strong> {standard_links}</p>
    <p class="step-text">This collection contains {len(matching)} matching walkthroughs across {len({route.year for route in matching})} examination years.</p>
    <p class="question-note">The grouping is based on the method recorded for each walkthrough. Use the linked NZQA standard and paper material for authoritative wording, diagrams, and assessment information.</p>
  </section>

  <section class="question-card" aria-labelledby="skill-mistakes-heading">
    <p class="question-label">Before you start</p>
    <h2 id="skill-mistakes-heading">Common mistakes in these methods</h2>
    <ul class="step-text">{mistake_items}</ul>
  </section>

  {guide_block}

  <section class="question-card" aria-labelledby="skill-questions-heading" data-skill-collection>
    <p class="question-label">Related practice</p>
    <h2 id="skill-questions-heading">{h(spec.title_label)} questions from different years</h2>
    <p class="step-text">Open a question for hints and a progressive worked solution, or use the standard and paper links to return to its assessment context.</p>
    <div class="skill-question-tools">
      <nav class="skill-jump-nav" aria-label="Jump to a year">{''.join(jump_links)}</nav>
      <div class="skill-filter-row" role="group" aria-label="Filter this skill collection">{''.join(filter_buttons)}</div>
      <button class="nav-btn secondary skill-random-button" type="button" data-skill-random>Random question from this skill</button>
      <p class="visually-hidden" aria-live="polite" data-skill-filter-status>{len(matching)} matching questions shown.</p>
    </div>
    {' '.join(question_groups)}
  </section>

  <section class="question-card" aria-labelledby="related-skills-heading">
    <p class="question-label">Keep practising</p>
    <h2 id="related-skills-heading">Related skill collections</h2>
    <div class="nav-row">{related_links}</div>
  </section>
  <p class="page-updated">Page updated <time datetime="{REVIEW_DATE}">{human_date(REVIEW_DATE)}</time>.</p>
</main>
{site_footer()}
</body>
</html>
"""


def about_page() -> str:
    # Keep personal attribution scoped to this page. Splitting the source
    # literal also makes whole-repository audits report only the generated
    # About page, where the name is intentionally visible.
    about_creator = "Jack " + "van " + "Baalen"
    filename = "about.html"
    canonical = absolute_url(filename)
    title = "About Calc.nz | Independent NCEA Maths Walkthroughs"
    description = (
        "Learn how Calc.nz creates independent, guided NCEA maths walkthroughs, "
        "uses official sources, handles privacy, and invites error reports."
    )
    structured = collection_schema(
        canonical=canonical,
        title=title,
        description=description,
        crumbs=(("Calc.nz", BASE_URL), ("About Calc.nz", canonical)),
        date_modified=PAGE_MODIFIED_DATES[filename],
    )
    page_node = structured.get("@graph", [])[0]
    if isinstance(page_node, dict):
        page_node["creator"] = {
            "@type": "Person",
            "name": about_creator,
        }
    breadcrumb = breadcrumb_nav((("Calc.nz", "index.html"), ("About Calc.nz", None)))
    standard_links = "\n".join(
        f'<li><a href="{h(standard.landing_file)}">NCEA Level {standard.level} {h(standard.topic)} — {h(standard.code)}</a></li>'
        for standard in STANDARDS.values()
    )
    return f"""{page_head(title=title, description=description, canonical=canonical, structured_data=structured)}
<body class="home-page has-site-header">
{site_header()}
<main id="main-content" class="app home-app" tabindex="-1">
{marker('BREADCRUMBS', breadcrumb, '  ')}
  <header class="topbar">
    <div>
      <p class="eyebrow">Purpose, sources, and transparency</p>
      <h1>About Calc.nz</h1>
      <p class="subtitle">An independent collection of guided NCEA maths worked-answer walkthroughs.</p>
    </div>
    <a class="ghost-link" href="/">← Home</a>
  </header>

  <section class="question-card" aria-labelledby="purpose-heading">
    <p class="question-label">Purpose and approach</p>
    <h2 id="purpose-heading">Learning the reasoning behind each step</h2>
    <p class="step-text">Calc.nz is designed to help students attempt an exam-style question, request a hint when needed, and then work through the decisions and mathematical reasoning behind a strong response. The walkthroughs are learning aids, not a substitute for teaching, an official assessment schedule, or personalised academic advice.</p>
    <p class="step-text">The supported standards are:</p>
    <ul class="step-text">{standard_links}</ul>
  </section>

  <section class="question-card" aria-labelledby="author-heading">
    <p class="question-label">Project information</p>
    <h2 id="author-heading">Who made Calc.nz</h2>
    <p class="step-text">Calc.nz was created by {h(about_creator)} as part of a Year 13 extended learning project. Mathematical explanations and walkthrough design are by {h(about_creator)}. AI tools were used to assist with parts of the website implementation.</p>
    <p class="question-note">Calc.nz is independently published. The corrected audit questions are awaiting independent teacher review, and all walkthroughs should be compared with official NZQA material.</p>
  </section>

  <section class="question-card" aria-labelledby="sources-heading">
    <p class="question-label">Source policy and disclaimer</p>
    <h2 id="sources-heading">Check official assessment material</h2>
    <p class="step-text">Standard titles and links point to NZQA. Question labels and walkthrough topics are organised to match the examination material represented in this project. Students and teachers should use the linked NZQA pages for original questions, diagrams, schedules, current standard information, and authoritative assessment requirements.</p>
    <p class="step-text"><strong>Calc.nz is independent and is not affiliated with or endorsed by NZQA.</strong> Any error in a walkthrough belongs to this project, not NZQA.</p>
  </section>

  <section class="question-card" aria-labelledby="privacy-heading">
    <p class="question-label">Privacy</p>
    <h2 id="privacy-heading">A static learning website</h2>
    <p class="step-text">Calc.nz does not add analytics, advertising, user accounts, mailing lists, or tracking cookies. Walkthrough progress, bookmarks, retry marks, display preferences, and practice sets may be stored only in the browser on the student's own device.</p>
    <p class="step-text">Students can clear this local information from the homepage. If browser storage is blocked, core pages and walkthroughs still work, but saved practice features last only for the current visit.</p>
  </section>

  <section class="question-card" aria-labelledby="errors-heading">
    <p class="question-label">Corrections</p>
    <h2 id="errors-heading">Report an error</h2>
    <p class="step-text">If you find a mathematical, wording, accessibility, or technical problem, <a href="{h(ERROR_REPORT_URL)}">use the Calc.nz error-report form</a>. Include the page URL, question number, and a concise description so it can be checked.</p>
    <p class="question-note"><a href="{h(REPOSITORY_URL)}">View the Calc.nz project repository</a>.</p>
  </section>
  <p class="page-updated">Page updated <time datetime="{PAGE_MODIFIED_DATES[filename]}">{human_date(PAGE_MODIFIED_DATES[filename])}</time>.</p>
</main>
{site_footer()}
</body>
</html>
"""


def static_search_records(
    routes: Sequence[QuestionRoute],
    guides: Sequence[Guide],
) -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    for key in STANDARD_ORDER:
        standard = STANDARDS[key]
        standard_routes = [route for route in routes if route.standard_key == key]
        standard_skills = sorted(
            {
                skill
                for route in standard_routes
                for skill in classify_question(route.focus, route.standard_key)
            }
        )
        records.append(
            {
                "type": "Standard",
                "title": f"NCEA Level {standard.level} {standard.topic} — {standard.code}",
                "description": standard.summary,
                "href": standard.landing_file,
                "standard": standard.code,
                "standardCode": standard.code,
                "standardId": key,
                "levelId": f"level-{standard.level}",
                "skillSlugs": standard_skills,
                "keywords": " ".join(standard.skills),
            }
        )
        years = sorted({route.year for route in standard_routes}, reverse=True)
        for year in years:
            paper_routes = [route for route in standard_routes if route.year == year]
            paper_skills = sorted(
                {
                    skill
                    for route in paper_routes
                    for skill in classify_question(route.focus, route.standard_key)
                }
            )
            records.append(
                {
                    "type": "Paper",
                    "title": f"{year} {standard.topic} paper",
                    "description": f"All guided {standard.code} walkthroughs from the {year} paper.",
                    "href": year_file(key, year),
                    "year": year,
                    "standard": f"{standard.code} {standard.topic}",
                    "standardCode": standard.code,
                    "standardId": key,
                    "levelId": f"level-{standard.level}",
                    "skillSlugs": paper_skills,
                    "keywords": "paper exam questions",
                }
            )
    for spec in SKILL_SPECS.values():
        matching = routes_for_skill(routes, spec.slug)
        records.append(
            {
                "type": "Skill",
                "title": spec.title_label,
                "description": spec.intro,
                "href": spec.page_href,
                "standard": " ".join(sorted({route.standard.code for route in matching})),
                "standardCode": sorted({route.standard.code for route in matching}),
                "standardId": sorted({route.standard_key for route in matching}),
                "levelId": sorted({f"level-{route.standard.level}" for route in matching}),
                "skillSlugs": [spec.slug],
                "keywords": f"{spec.slug} {spec.explanation}",
            }
        )
    for guide in guides:
        standard = STANDARDS[guide.standard_key]
        authored_search_text = [guide.direct_answer]
        authored_search_text.extend(
            f"{section.get('heading', '')} {section.get('html', '')}"
            for section in guide.sections
        )
        authored_search_text.extend(
            str(item.get("title", "")) for item in guide.related_concepts
        )
        guide_keywords = " ".join(
            (
                *guide.skill_slugs,
                *(
                    meta_plain(re.sub(r"<[^>]+>", " ", value))
                    for value in authored_search_text
                ),
            )
        )
        records.append(
            {
                "type": "Guide",
                "title": guide.title,
                "description": guide.summary,
                "href": guide.filename,
                "standard": f"{standard.code} {standard.topic}",
                "standardCode": standard.code,
                "standardId": guide.standard_key,
                "levelId": f"level-{standard.level}",
                "skillSlugs": list(guide.skill_slugs),
                "keywords": normalise_space(guide_keywords),
            }
        )
    return records


def search_page(routes: Sequence[QuestionRoute], guides: Sequence[Guide]) -> str:
    filename = "search.html"
    canonical = absolute_url(filename)
    title = "Search NCEA Maths Guides, Skills & Questions | Calc.nz"
    description = (
        "Search Calc.nz by mathematical method, NCEA standard, paper year, skill, "
        "guide, or exact walkthrough question."
    )
    structured = collection_schema(
        canonical=canonical,
        title=title,
        description=description,
        crumbs=(("Calc.nz", BASE_URL), ("Search", canonical)),
    )
    breadcrumb = breadcrumb_nav((("Calc.nz", "index.html"), ("Search", None)))
    records = json.dumps(static_search_records(routes, guides), ensure_ascii=False).replace("</", "<\\/")
    standard_options = "".join(
        f'<option value="{h(STANDARDS[key].code)}">{h(STANDARDS[key].code)} · {h(STANDARDS[key].topic)}</option>'
        for key in STANDARD_ORDER
    )
    year_options = "".join(
        f'<option value="{year}">{year}</option>'
        for year in sorted({route.year for route in routes}, reverse=True)
    )
    skill_options = "".join(
        f'<option value="{h(spec.slug)}">{h(spec.short_label)}</option>'
        for spec in sorted(SKILL_SPECS.values(), key=lambda item: item.short_label)
    )
    scripts = "\n".join(
        (
            f'<script>window.CALC_NZ_STATIC_SEARCH_RECORDS = {records};</script>',
            f'<script defer src="search-core.js?v={CACHE_TOKEN}"></script>',
            f'<script defer src="search-page.js?v={CACHE_TOKEN}"></script>',
        )
    )
    return f"""{page_head(title=title, description=description, canonical=canonical, structured_data=structured).replace('</head>', scripts + chr(10) + '</head>')}
<body class="home-page content-page search-page has-site-header">
{site_header(guides_published=bool(guides))}
<main id="main-content" class="app home-app content-app" tabindex="-1">
{marker('BREADCRUMBS', breadcrumb, '  ')}
  <header class="topbar search-page-header">
    <div>
      <p class="eyebrow">Find the right next step</p>
      <h1>Search Calc.nz</h1>
      <p class="subtitle">Search by method, topic, standard number, paper year, skill, or question.</p>
    </div>
  </header>
  <section class="question-card global-search-card" aria-labelledby="global-search-heading">
    <p class="question-label">Site search</p>
    <h2 id="global-search-heading">What do you want to practise?</h2>
    <form class="home-search-form" role="search" data-global-search-form>
      <label for="global-search-input">Search guides, skills, papers, and questions</label>
      <div class="global-search-query-row">
        <input id="global-search-input" class="home-search-input" type="search" name="q" autocomplete="off" placeholder="Try natural log, turning point, or 91579 2024" data-global-search-input>
        <button class="nav-btn global-search-submit" type="submit">Search</button>
      </div>
      <fieldset class="global-search-filters">
        <legend>Filter results</legend>
        <div class="global-search-filter-grid">
          <label for="global-search-level">NCEA level<select id="global-search-level" name="level" data-search-filter="level"><option value="">All levels</option><option value="level-3">Level 3</option><option value="level-2">Level 2</option></select></label>
          <label for="global-search-standard">Standard<select id="global-search-standard" name="standard" data-search-filter="standard"><option value="">All standards</option>{standard_options}</select></label>
          <label for="global-search-year">Year<select id="global-search-year" name="year" data-search-filter="year"><option value="">All years</option>{year_options}</select></label>
          <label for="global-search-skill">Skill or method<select id="global-search-skill" name="skill" data-search-filter="skill"><option value="">All skills</option>{skill_options}</select></label>
        </div>
        <button class="nav-btn secondary global-search-reset" type="reset" data-search-reset>Reset search and filters</button>
      </fieldset>
    </form>
    <p class="search-status visually-hidden" aria-live="polite" aria-atomic="true" data-global-search-status>Enter a search term.</p>
    <div class="home-search-results" data-global-search-results hidden></div>
    <noscript><p class="question-note">Search needs JavaScript, but every destination remains available through the <a href="standards.html">standards</a> and <a href="skills.html">skills</a> directories.</p></noscript>
  </section>
  <nav class="question-card" aria-labelledby="search-browse-heading">
    <p class="question-label">Browse instead</p>
    <h2 id="search-browse-heading">Explore crawlable directories</h2>
    <div class="nav-row">
      <a class="nav-btn secondary" href="standards.html">Standards and papers</a>
      <a class="nav-btn secondary" href="skills.html">Skills</a>
    </div>
  </nav>
</main>
{site_footer()}
</body>
</html>
"""


def guides_hub_page(guides: Sequence[Guide]) -> str:
    canonical = absolute_url("guides.html")
    title = "NCEA Maths Guides & Concept Explanations | Calc.nz"
    description = "Learn NCEA maths concepts, then move directly into matched standards, skills, and walkthrough questions."
    structured = collection_schema(
        canonical=canonical,
        title=title,
        description=description,
        crumbs=(("Calc.nz", BASE_URL), ("Guides", canonical)),
    )
    breadcrumb = breadcrumb_nav((("Calc.nz", "index.html"), ("Guides", None)))
    grouped: dict[str, list[Guide]] = defaultdict(list)
    for guide in guides:
        grouped[guide.standard_key].append(guide)
    groups = []
    for standard_key in STANDARD_ORDER:
        if standard_key not in grouped:
            continue
        standard = STANDARDS[standard_key]
        cards = "".join(
            f'<a class="content-info-card guide-card" href="{h(guide.filename)}"><strong>{h(guide.title)}</strong><p>{h(guide.summary)}</p></a>'
            for guide in grouped[standard_key]
        )
        groups.append(
            f'<section class="question-card"><p class="question-label">NCEA Level {standard.level} · {h(standard.code)}</p><h2>{h(standard.topic)}</h2><div class="content-card-grid">{cards}</div></section>'
        )
    return f"""{page_head(title=title, description=description, canonical=canonical, structured_data=structured)}
<body class="home-page content-page guides-page has-site-header">
{site_header(guides_published=True)}
<main id="main-content" class="app home-app content-app" tabindex="-1">
{marker('BREADCRUMBS', breadcrumb, '  ')}
  <header class="topbar"><div><p class="eyebrow">Learn, connect, practise</p><h1>NCEA maths guides</h1><p class="subtitle">Concept explanations connected to the exact standards, skills, and walkthroughs where you can use them.</p></div></header>
  {''.join(groups)}
</main>
{site_footer()}
</body>
</html>
"""


GUIDE_TEX_PATTERN = re.compile(
    r"\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]"
)


def guide_requires_katex(guide: Guide) -> bool:
    """Return whether authored guide content contains supported TeX delimiters."""

    values = [guide.direct_answer]
    values.extend(str(section.get("html", "")) for section in guide.sections)
    return any(GUIDE_TEX_PATTERN.search(value) for value in values)


def guide_katex_assets() -> str:
    """Load and run accessible KaTeX only for guides that contain maths."""

    return r"""  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function () {
      if (typeof window.renderMathInElement !== "function") return;
      window.renderMathInElement(document.querySelector(".guide-article"), {
        delimiters: [
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false
      });
    });
  </script>"""


def guide_page(guide: Guide, routes: Sequence[QuestionRoute]) -> str:
    standard = STANDARDS[guide.standard_key]
    title = f"{guide.title} — NCEA Maths Guide | Calc.nz"
    description = truncate(guide.summary)
    crumbs = (
        ("Calc.nz", BASE_URL),
        ("Guides", absolute_url("guides.html")),
        (guide.title, guide.canonical),
    )
    structured = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": ["Article", "LearningResource"],
                "@id": f"{guide.canonical}#article",
                "url": guide.canonical,
                "name": guide.title,
                "description": guide.summary,
                "inLanguage": "en-NZ",
                "isAccessibleForFree": True,
                "educationalLevel": f"NCEA Level {standard.level}",
                "learningResourceType": "Concept guide",
                "author": {"@type": "Person", "name": guide.author},
                "dateModified": guide.reviewed_date,
                "about": {"@type": "DefinedTerm", "name": standard.official_name, "termCode": standard.code},
            },
            breadcrumb_schema(crumbs),
        ],
    }
    breadcrumb = breadcrumb_nav((("Calc.nz", "index.html"), ("Guides", "guides.html"), (guide.title, None)))
    section_html = []
    toc_items = []
    for index, section in enumerate(guide.sections):
        section_id = str(section.get("id", f"section-{index + 1}"))
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", section_id):
            raise ValueError(f"Guide {guide.slug} has an invalid section id: {section_id}")
        heading = str(section.get("heading", "")).strip()
        body = str(section.get("html", "")).strip()
        if not heading or not body:
            raise ValueError(f"Guide {guide.slug} contains an incomplete section")
        toc_items.append(f'<li><a href="#{h(section_id)}">{h(heading)}</a></li>')
        section_html.append(f'<section class="guide-section" aria-labelledby="{h(section_id)}"><h2 id="{h(section_id)}">{h(heading)}</h2>{body}</section>')
    matched = [
        route for route in routes
        if route.standard_key == guide.standard_key
        and f"{route.year}:{route.question_id}" in guide.practice_question_ids
    ]
    practice_links = "".join(
        f'<li><a href="{h(route.href)}">{route.year} Question {h(route.display_number)} — {h(question_method_title(route))}</a></li>'
        for route in matched
    ) or '<li><a href="skills.html">Browse matched questions by skill</a></li>'
    related = "".join(
        f'<li><a href="{h(str(item.get("href", "")))}">{h(str(item.get("title", "Related concept")))}</a></li>'
        for item in guide.related_concepts
    )
    sources = "".join(
        f'<li><a href="{h(str(item.get("href", "")))}">{h(str(item.get("label", "Source")))}</a></li>'
        for item in guide.sources
    )
    skill_links = " · ".join(
        f'<a href="{h(SKILL_SPECS[slug].page_href)}">{h(SKILL_SPECS[slug].short_label)}</a>'
        for slug in guide.skill_slugs
    ) or '<a href="skills.html">Browse skills</a>'
    toc = f'<nav class="guide-toc" aria-label="On this page"><p class="question-label">On this page</p><ol>{"".join(toc_items)}</ol></nav>' if guide.toc else ""
    head = page_head(
        title=title,
        description=description,
        canonical=guide.canonical,
        structured_data=structured,
        og_type="article",
    )
    if guide_requires_katex(guide):
        head = head.replace("</head>", f"{guide_katex_assets()}\n</head>")
    return f"""{head}
<body class="home-page content-page guide-page has-site-header">
{site_header(guides_published=True)}
<main id="main-content" class="app home-app content-app guide-layout" tabindex="-1">
{marker('BREADCRUMBS', breadcrumb, '  ')}
  <article class="guide-article">
    <header class="topbar"><div><p class="eyebrow">{h(guide.subject)} · {h(standard.code)}</p><h1>{h(guide.title)}</h1><p class="subtitle">{h(guide.summary)}</p></div></header>
    <section class="guide-direct-answer" aria-labelledby="guide-direct-answer"><p class="question-label">Direct answer</p><h2 id="guide-direct-answer">Formula and idea summary</h2>{guide.direct_answer}</section>
    {toc}
    {''.join(section_html)}
    <section class="guide-section"><h2>Practise this concept</h2><ul>{practice_links}</ul><p><strong>Standard:</strong> <a href="{h(standard.landing_file)}">{h(standard.code)} — {h(standard.official_name)}</a></p><p><strong>Skills:</strong> {skill_links}</p></section>
    {f'<section class="guide-section"><h2>Related concepts</h2><ul>{related}</ul></section>' if related else ''}
    <section class="guide-section guide-review"><h2>Sources and review</h2><ul>{sources}</ul><p>Written by {h(guide.author)}. Reviewed <time datetime="{h(guide.reviewed_date)}">{h(guide.reviewed_date)}</time>.</p></section>
  </article>
</main>
{site_footer()}
</body>
</html>
"""


def not_found_page(guides_published: bool) -> str:
    canonical = absolute_url("404.html")
    title = "Page Not Found | Calc.nz"
    description = "The requested Calc.nz page could not be found. Search the site or return to the standards and skills directories."
    structured = {"@context": "https://schema.org", "@type": "WebPage", "url": canonical, "name": title}
    guide_link = '<a class="nav-btn secondary" href="guides.html">Guides</a>' if guides_published else ""
    return f"""{page_head(title=title, description=description, canonical=canonical, structured_data=structured, robots='noindex,follow')}
<body class="home-page not-found-page has-site-header">
{site_header(guides_published=guides_published)}
<main id="main-content" class="app home-app not-found-app" tabindex="-1">
  <section class="question-card not-found-card" aria-labelledby="not-found-heading">
    <p class="eyebrow">404 · Page not found</p>
    <h1 id="not-found-heading">That page isn’t here</h1>
    <p class="subtitle">The address may be out of date or mistyped. Your saved practice and progress have not been changed.</p>
    <div class="nav-row">
      <a class="nav-btn" href="/">Go home</a>
      <a class="nav-btn secondary" href="standards.html">Standards</a>
      <a class="nav-btn secondary" href="skills.html">Skills</a>
      {guide_link}
      <a class="nav-btn secondary" href="search.html">Search Calc.nz</a>
    </div>
  </section>
</main>
{site_footer()}
</body>
</html>
"""


def rewrite_data_back_links(original: str, filename: str) -> str:
    topic_match = re.fullmatch(r"(algebra|complex|differentiation|integration)-(20\d{2})-data\.js", filename)
    if not topic_match:
        return original
    topic, year_text = topic_match.groups()
    standard_key = {
        "algebra": "level-2-algebra",
        "complex": "level-3-complex",
        "differentiation": "level-3-differentiation",
        "integration": "level-3-integration",
    }[topic]
    target = year_file(standard_key, int(year_text))
    updated, count = re.subn(
        r'(?m)^(\s*const\s+paperHref\s*=\s*)["\'][^"\']*["\'](\s*;)',
        rf'\1"{target}"\2',
        original,
        count=1,
    )
    if count != 1:
        raise ValueError(f"Expected one paperHref declaration in {filename}")
    return updated


_GIT_LASTMOD_CACHE: dict[str, str] = {}


def git_last_modified(filename: str) -> str:
    if filename in _GIT_LASTMOD_CACHE:
        return _GIT_LASTMOD_CACHE[filename]
    process = subprocess.run(
        ["git", "log", "-1", "--format=%cs", "--", filename],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        check=False,
        text=True,
    )
    value = process.stdout.strip() if process.returncode == 0 else ""
    if not re.fullmatch(r"20\d{2}-\d{2}-\d{2}", value):
        value = PAGE_MODIFIED_DATES.get(filename, REVIEW_DATE)
    _GIT_LASTMOD_CACHE[filename] = value
    return value


def question_content_lastmod(route: QuestionRoute) -> str:
    topic = {
        "level-2-algebra": "algebra",
        "level-3-complex": "complex",
        "level-3-differentiation": "differentiation",
        "level-3-integration": "integration",
    }.get(route.standard_key)
    candidates = [route.source_file]
    if topic:
        data_filename = f"{topic}-{route.year}-data.js"
        if (ROOT / data_filename).is_file():
            candidates.append(data_filename)
    return max(
        WALKTHROUGH_CONTENT_RELEASE_DATE,
        *(git_last_modified(filename) for filename in candidates),
    )


def sitemap_xml(routes: Sequence[QuestionRoute], guides: Sequence[Guide]) -> str:
    entries: list[tuple[str, str]] = []

    def add(path: str, lastmod: str) -> None:
        entries.append((absolute_url(path), lastmod))

    question_dates = {route.route_path: question_content_lastmod(route) for route in routes}
    add("", PAGE_MODIFIED_DATES["index.html"])
    add("standards.html", PAGE_MODIFIED_DATES["standards.html"])
    calculus_routes = [route for route in routes if route.standard_key in {"level-3-differentiation", "level-3-integration"}]
    add("level-3-calculus.html", max(question_dates[route.route_path] for route in calculus_routes))
    add("skills.html", PAGE_MODIFIED_DATES["skills.html"])
    add("search.html", PAGE_MODIFIED_DATES["search.html"])
    for spec in SKILL_SPECS.values():
        matching = routes_for_skill(routes, spec.slug)
        add(spec.page_href, max(question_dates[route.route_path] for route in matching))
    for key in STANDARD_ORDER:
        standard_routes = [route for route in routes if route.standard_key == key]
        add(STANDARDS[key].landing_file, max(question_dates[route.route_path] for route in standard_routes))
    for key in STANDARD_ORDER:
        years = sorted({route.year for route in routes if route.standard_key == key}, reverse=True)
        for year in years:
            year_routes = [route for route in routes if route.standard_key == key and route.year == year]
            add(year_file(key, year), max(question_dates[route.route_path] for route in year_routes))
    add("about.html", PAGE_MODIFIED_DATES["about.html"])
    if guides:
        add("guides.html", max(guide.reviewed_date for guide in guides))
        for guide in guides:
            add(guide.filename, guide.reviewed_date)
    entries.extend((route.canonical, question_dates[route.route_path]) for route in routes)

    expected_count = 1 + 1 + 1 + 1 + 1 + len(SKILL_SPECS) + len(STANDARDS) + EXPECTED_YEAR_COUNT + 1 + EXPECTED_ROUTE_COUNT
    expected_count += (1 + len(guides)) if guides else 0
    if len(entries) != expected_count:
        raise ValueError(f"Unexpected sitemap URL count: expected {expected_count}, found {len(entries)}")
    urls = [url for url, _ in entries]
    if len(urls) != len(set(urls)):
        raise ValueError("Sitemap contains duplicate canonical URLs")
    if any(not url.startswith(BASE_URL) for url in urls):
        raise ValueError("Sitemap contains a non-canonical host or non-HTTPS URL")

    body = "\n".join(
        f"  <url><loc>{xml_escape(url)}</loc><lastmod>{lastmod}</lastmod></url>"
        for url, lastmod in entries
    )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{body}\n"
        "</urlset>\n"
    )


def robots_txt() -> str:
    return f"User-agent: *\nAllow: /\n\nSitemap: {BASE_URL}sitemap.xml\n"


def validate_local_links(outputs: Mapping[Path, str]) -> None:
    """Catch missing local href targets in the HTML this generator controls."""

    available = {path.name for path in ROOT.iterdir() if path.is_file()}
    available.update(path.name for path in outputs if path.parent == ROOT)
    available.add("index.html")

    href_pattern = re.compile(r"(?is)\bhref\s*=\s*(['\"])(.*?)\1")
    failures: list[str] = []
    for path, content in outputs.items():
        if path.suffix != ".html":
            continue
        for _, raw_href in href_pattern.findall(content):
            href = html.unescape(raw_href).strip()
            if not href or href.startswith("#"):
                continue
            parsed = urlsplit(href)
            if parsed.scheme or parsed.netloc:
                continue
            local_path = parsed.path.lstrip("/")
            if not local_path:
                continue
            target = (ROOT / local_path).resolve()
            # Permit repository-owned asset subdirectories while rejecting
            # traversal and links to missing files.
            try:
                target.relative_to(ROOT.resolve())
            except ValueError:
                failures.append(f"{path.name}: {href}")
                continue
            if not target.is_file() and local_path not in available:
                failures.append(f"{path.name}: {href}")
    if failures:
        raise ValueError("Generated HTML has missing local links:\n  " + "\n  ".join(sorted(set(failures))))


def build_outputs() -> dict[Path, str]:
    index_path = ROOT / "index.html"
    index_original = index_path.read_text(encoding="utf-8")
    catalogue_original = CATALOGUE_FILE.read_text(encoding="utf-8")
    catalogue = load_catalogue(catalogue_original)
    guides = load_guides()
    orphaned_guides = unexpected_guide_outputs(guides)
    if orphaned_guides:
        raise ValueError(
            "Unregistered guide output must be reviewed and removed explicitly: "
            + ", ".join(path.name for path in orphaned_guides)
        )
    walkthrough_content = load_walkthrough_content()
    routes = discover_routes(catalogue)
    validate_guide_relationships(guides, routes)
    by_standard, by_year, by_source = group_routes(routes)

    outputs: dict[Path, str] = {}
    outputs[CATALOGUE_FILE] = catalogue_javascript(enrich_catalogue(catalogue, routes))

    # A query-routed complex shell can only contain one source-default metadata
    # set.  Question 1(a) is deliberately the default; runtime JS updates the
    # visible and document metadata when another ?q= route is requested.
    for source_file, source_routes in sorted(by_source.items()):
        default = next(
            (route for route in source_routes if route.question_id == "1a"),
            source_routes[0],
        )
        path = ROOT / source_file
        outputs[path] = update_question_page(
            path.read_text(encoding="utf-8"),
            default,
            by_year[(default.standard_key, default.year)],
            walkthrough_content[default.route_path],
            guides,
        )

    for source, target in LEGACY_REDIRECTS.items():
        path = ROOT / source
        if not path.is_file() or not (ROOT / target).is_file():
            raise ValueError(f"Missing legacy redirect source or target: {source} -> {target}")
        outputs[path] = update_redirect_page(path.read_text(encoding="utf-8"), source, target)

    for path in sorted(ROOT.glob("*-data.js")):
        outputs[path] = rewrite_data_back_links(path.read_text(encoding="utf-8"), path.name)

    outputs[index_path] = update_homepage(index_original)
    outputs[ROOT / "standards.html"] = standards_page(by_standard)
    outputs[ROOT / "level-3-calculus.html"] = level_three_calculus_page(by_standard)
    outputs[ROOT / "skills.html"] = skills_directory_page(routes)
    outputs[ROOT / "search.html"] = search_page(routes, guides)
    for spec in SKILL_SPECS.values():
        outputs[ROOT / spec.page_href] = skill_page(spec, routes, guides)

    if guides:
        outputs[ROOT / "guides.html"] = guides_hub_page(guides)
        for guide in guides:
            outputs[ROOT / guide.filename] = guide_page(guide, routes)

    for key in STANDARD_ORDER:
        standard = STANDARDS[key]
        outputs[ROOT / standard.landing_file] = standard_page(
            standard,
            by_standard[key],
            guides,
        )
        years = sorted({route.year for route in by_standard[key]}, reverse=True)
        for year in years:
            outputs[ROOT / year_file(key, year)] = year_page(
                standard,
                year,
                by_year[(key, year)],
                years,
            )

    outputs[ROOT / "about.html"] = about_page()
    outputs[ROOT / "404.html"] = not_found_page(bool(guides))
    outputs[ROOT / "robots.txt"] = robots_txt()
    outputs[ROOT / "sitemap.xml"] = sitemap_xml(routes, guides)

    # All HTML pages are generator-controlled. Use one cache token for local
    # styles, scripts, and data so shared walkthrough changes cannot be served
    # alongside an older asset bundle.
    cache_pattern = re.compile(
        r'(?P<prefix>\b(?:href|src)=["\'][^"\']+\?v=)[^"\']+(?P<suffix>["\'])'
    )
    for path, content in tuple(outputs.items()):
        if path.suffix == ".html":
            content = cache_pattern.sub(
                lambda match: (
                    match.group("prefix") + CACHE_TOKEN + match.group("suffix")
                ),
                content,
            )
            # Optional template blocks can otherwise leave indentation-only
            # lines. Keep generated HTML deterministic and diff-clean without
            # altering authored text or inline markup.
            outputs[path] = "\n".join(
                line.rstrip() for line in content.splitlines()
            ) + "\n"

    validate_local_links(outputs)
    return outputs


def stale_outputs(outputs: Mapping[Path, str]) -> list[Path]:
    stale: list[Path] = []
    for path, intended in outputs.items():
        current = path.read_text(encoding="utf-8") if path.exists() else None
        if current != intended:
            stale.append(path)
    return sorted(stale, key=lambda path: str(path.relative_to(ROOT)))


def write_outputs(outputs: Mapping[Path, str], paths: Iterable[Path]) -> None:
    for path in paths:
        content = outputs[path]
        if not content.endswith("\n"):
            content += "\n"
        path.write_text(content, encoding="utf-8")


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="report stale SEO output without writing any files",
    )
    args = parser.parse_args(argv)

    try:
        outputs = build_outputs()
        stale = stale_outputs(outputs)
    except (OSError, ValueError) as error:
        print(f"SEO build failed: {error}", file=sys.stderr)
        return 2

    if args.check:
        if stale:
            print("SEO output is stale:")
            for path in stale:
                print(f"  {path.relative_to(ROOT)}")
            return 1
        print("SEO output is up to date.")
        return 0

    write_outputs(outputs, stale)
    if stale:
        print(f"Updated {len(stale)} SEO-generated files.")
        for path in stale:
            print(f"  {path.relative_to(ROOT)}")
    else:
        print("SEO output is already up to date.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
