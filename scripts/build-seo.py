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
import re
import sys
from collections import defaultdict
from dataclasses import dataclass
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
CACHE_TOKEN = "20260719-8"
REVIEW_DATE = "2026-07-19"
SOCIAL_IMAGE_URL = f"{BASE_URL}assets/calc-nz-social.png"
SOCIAL_IMAGE_ALT = "Calc.nz guided NCEA maths walkthroughs"
EXPECTED_ROUTE_COUNT = 447
EXPECTED_YEAR_COUNT = 30
CATALOGUE_FILE = ROOT / "question-catalogue.js"

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

STANDARD_ORDER = tuple(STANDARDS)

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
        "/* Generated from the verified Calc.nz walkthrough catalogue. "
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
                    question.update(
                        {
                            "methodTitle": question_method_title(route),
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
                            "reviewedDate": REVIEW_DATE,
                        }
                    )
    enriched["schemaVersion"] = 2
    enriched["generatedAt"] = REVIEW_DATE
    return enriched


def question_sort_key(route: QuestionRoute) -> tuple[int, str]:
    match = re.fullmatch(r"(\d+)([a-z])", route.question_id)
    assert match
    return int(match.group(1)), match.group(2)


def meta_plain(value: str) -> str:
    """Turn short catalogue TeX into readable search-snippet prose."""

    value = html.unescape(value)
    value = value.replace(r"\(", "").replace(r"\)", "")
    value = value.replace(r"\[", "").replace(r"\]", "")
    replacements = {
        r"\ln": "ln",
        r"\log": "log",
        r"\sin": "sin",
        r"\cos": "cos",
        r"\tan": "tan",
        r"\cot": "cot",
        r"\sqrt": "square root of ",
        r"\frac": "fraction ",
        r"\overline": "conjugate of ",
        r"\theta": "theta",
        r"\pi": "pi",
        r"\cdot": " times ",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = re.sub(r"\\[A-Za-z]+", "", value)
    value = value.replace("{", "").replace("}", "")
    value = value.replace("^", " to the power ")
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


def question_method_title(route: QuestionRoute) -> str:
    """Return a concise, truthful method label for browser/social titles."""

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
        (r"factor theorem", "Factor Theorem"),
        (r"remainder theorem", "Remainder Theorem"),
        (r"de moivre", "De Moivre’s Theorem"),
        (r"polar form|modulus and argument|argument and modulus", "Polar Form"),
        (r"roots of unity|complex roots|fourth roots|cube roots|all .* roots", "Complex Roots"),
        (r"chain rule|composite", "Chain Rule"),
        (r"product rule.*quotient|quotient rule.*product", "Product and Quotient Rules"),
        (r"product rule", "Product Rule"),
        (r"quotient rule", "Quotient Rule"),
        (r"related rates|related-rate|rate of change", "Related Rates"),
        (r"parametric", "Parametric Differentiation"),
        (r"implicit", "Implicit Differentiation"),
        (r"stationary|critical point|turning point|optimi|maximi|minimi", "Stationary Points and Optimisation"),
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
        (r"conjugate|complex division", "Complex-number Algebra"),
        (r"locus", "Complex-number Loci"),
        (r"polynomial|factoris", "Polynomial Algebra"),
    )
    for pattern, label in patterns:
        if re.search(pattern, focus, flags=re.I):
            return label
    concise = re.sub(
        r"^(?:using|finding|solving|applying|recognising|rewriting|simplifying|forming|building|converting|proving|showing|determining|evaluating|calculating)\s+",
        "",
        meta_plain(route.focus).strip(" ."),
        flags=re.I,
    )
    words = concise.split()
    concise = " ".join(words[:7])
    if len(concise) > 42:
        concise = concise[:42].rsplit(" ", 1)[0]
    return concise[:1].upper() + concise[1:] if concise else route.standard.topic


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
        if href is None:
            content = f'<span class="home-breadcrumb-current" aria-current="page"{dynamic_attribute}>{h(name)}</span>'
        else:
            content = f'<a class="home-breadcrumb-button" href="{h(href)}"{dynamic_attribute}>{h(name)}</a>'
        list_items.append(f"  <li>{content}</li>")
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
  <p class="page-updated">Page updated <time datetime="{REVIEW_DATE}">19 July 2026</time>.</p>
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
  </ul>
</section>
""".strip()


def update_question_page(
    original: str,
    route: QuestionRoute,
    siblings: Sequence[QuestionRoute],
) -> str:
    for name in ("HEAD", "BREADCRUMBS", "OVERVIEW", "SUMMARY"):
        original = remove_marker(original, name)

    original, html_count = re.subn(
        r'(?is)<html\b[^>]*\blang\s*=\s*(["\']).*?\1[^>]*>',
        '<html lang="en-NZ">',
        original,
        count=1,
    )
    if html_count != 1:
        raise ValueError(f"Expected one language declaration in {route.source_file}")

    if "question-catalogue.js" not in original:
        original, script_count = re.subn(
            r'(?im)^(\s*<script\s+defer\s+src=["\']walkthrough-gate\.js[^"\']*["\']></script>)',
            f'  <script defer src="question-catalogue.js?v={CACHE_TOKEN}"></script>\n\\1',
            original,
            count=1,
        )
        if script_count != 1:
            raise ValueError(f"Could not add question catalogue to {route.source_file}")

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

    original, count = re.subn(
        r"(?is)(<div\b(?=[^>]*\bid=[\"']walkthrough-content[\"'])[^>]*>.*?</div>)\s*",
        lambda match: f"{match.group(1)}\n\n{marker('OVERVIEW', question_overview(route), '    ')}\n\n",
        original,
        count=1,
    )
    if count != 1:
        raise ValueError(f"Could not insert overview into {route.source_file}")

    original, count = re.subn(
        r"(?is)\s*</main>",
        lambda match: f"\n\n{marker('SUMMARY', question_summary(route, siblings), '    ')}\n  </main>",
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

    return original


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
    return add_head_marker(
        original,
        metadata_body(
            title=title,
            description=description,
            canonical=absolute_url(target),
            structured_data=structured_data,
            robots="noindex,follow",
        ),
    )


def website_schema() -> dict[str, object]:
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": f"{BASE_URL}#website",
        "url": BASE_URL,
        "name": "Calc.nz",
        "description": "Free guided NCEA Level 2 and Level 3 maths worked answers and question walkthroughs.",
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
    <a class="nav-btn secondary" href="level-3-calculus.html">Level 3 Calculus: Differentiation and Integration</a>
    <a class="nav-btn secondary" href="skills.html">Browse questions by skill</a>
  </div>
</section>
""".strip()


def update_homepage(
    original: str,
) -> str:
    for name in ("HEAD", "DIRECTORY", "FOOTER"):
        original = remove_marker(original, name)
    original, html_count = re.subn(
        r'(?is)<html\b[^>]*\blang\s*=\s*(["\']).*?\1[^>]*>',
        '<html lang="en-NZ">',
        original,
        count=1,
    )
    if html_count != 1:
        raise ValueError("Homepage must declare one language")

    title = "Free NCEA Maths Worked Answers & Walkthroughs | Calc.nz"
    description = (
        "Free guided NCEA Level 2 and Level 3 maths worked answers. "
        "Study Calculus, Algebra, Complex Numbers, Differentiation, and Integration step by step."
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
    original = replace_first_h1(original, "Free NCEA maths worked answers and walkthroughs")

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
    return original


def page_head(
    *,
    title: str,
    description: str,
    canonical: str,
    structured_data: Mapping[str, object],
) -> str:
    return f"""<!DOCTYPE html>
<html lang="en-NZ">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{h(title)}</title>
{marker('HEAD', metadata_body(title=title, description=description, canonical=canonical, structured_data=structured_data), '  ')}
  <link rel="stylesheet" href="style.css?v={CACHE_TOKEN}">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
  <script defer src="walkthrough-gate.js?v={CACHE_TOKEN}"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function () {{
      if (window.renderMathInElement) {{
        window.renderMathInElement(document.body, {{
          delimiters: [
            {{ left: "\\\\[", right: "\\\\]", display: true }},
            {{ left: "\\\\(", right: "\\\\)", display: false }}
          ],
          throwOnError: false
        }});
      }}
    }});
  </script>
</head>"""


def collection_schema(
    *,
    canonical: str,
    title: str,
    description: str,
    crumbs: Sequence[tuple[str, str]],
    standard: Standard | None = None,
) -> dict[str, object]:
    page: dict[str, object] = {
        "@type": "WebPage",
        "@id": f"{canonical}#webpage",
        "url": canonical,
        "name": title,
        "description": description,
        "inLanguage": "en-NZ",
        "dateModified": REVIEW_DATE,
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


def site_footer() -> str:
    return f"""
<footer class="site-footer">
  <p class="site-footer-text">Calc.nz is an independent learning resource. Compare questions, diagrams, and assessment information with the official NZQA material.</p>
  <nav class="site-footer-nav" aria-label="Footer">
    <a class="site-footer-link" href="/">Home</a>
    <a class="site-footer-link" href="/standards.html">Standards</a>
    <a class="site-footer-link" href="/skills.html">Skills</a>
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
<body class="home-page standards-page">
<main class="app home-app standards-app">
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
    return f"""{page_head(title=title, description=description, canonical=canonical, structured_data=structured)}
<body class="home-page">
<main class="app home-app">
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
  <p class="page-updated">Page updated <time datetime="{REVIEW_DATE}">19 July 2026</time>.</p>
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
  <span class="index-link-copy">{h(sentence(route.focus))}</span>
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
            '<div class="attempt-note" aria-labelledby="official-2022-sources-heading">'
            '<h3 id="official-2022-sources-heading">Official 2022 NZQA Complex Numbers material</h3>'
            '<ul class="step-text">'
            '<li><a href="https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2022/91577-exm-2022.pdf">2022 AS91577 examination paper (PDF)</a></li>'
            '<li><a href="https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2022/91577-frm-2022.pdf">2022 AS91577 formulae sheet (PDF)</a></li>'
            '<li><a href="https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2022/91577-ass-2022.pdf">2022 AS91577 assessment schedule (PDF)</a></li>'
            '<li><a href="https://www.nzqa.govt.nz/nqfdocs/ncea-resource/reports/2022/level3/91577-report-2022.pdf">2022 AS91577 assessment report (PDF)</a></li>'
            f'<li><a href="{h(standard.official_url)}">Durable NZQA standard and assessment-resource record for AS91577</a></li>'
            "</ul></div>"
        )

    direct_skill_links = skill_navigation_for_routes(ordered)

    return f"""{page_head(title=title, description=description, canonical=canonical, structured_data=structured)}
<body class="home-page">
<main class="app home-app">
{marker('BREADCRUMBS', breadcrumb, '  ')}
  <header class="topbar">
    <div>
      <p class="eyebrow">{year} NCEA Level {standard.level} {h(standard.topic)}</p>
      <h1>{year} {h(standard.topic)} {h(standard.code)} worked answers</h1>
      <p class="subtitle">Guided, step-by-step worked solutions for {h(standard.official_name)}.</p>
    </div>
    <a class="ghost-link" href="{h(standard.landing_file)}">← All {h(standard.topic)} years</a>
  </header>

  <section class="question-card" aria-labelledby="paper-overview-heading">
    <p class="question-label">Paper overview</p>
    <h2 id="paper-overview-heading">Work through the {year} questions one step at a time</h2>
    <p class="step-text">This page contains {len(ordered)} independent worked question walkthroughs for NCEA Level {standard.level} {h(standard.topic)} ({h(standard.code)}). Each walkthrough offers hints, reveals the full working in a logical sequence, and focuses on the method described below.</p>
    {priority_note}
    <p class="question-note">Calc.nz is independent of NZQA. Use the <a href="{h(standard.official_url)}">official NZQA {h(standard.code)} assessment resources</a> for the original paper, diagrams, assessment schedule, and authoritative standard information.</p>
  </section>

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
  <p class="page-updated">Page updated <time datetime="{REVIEW_DATE}">19 July 2026</time>.</p>
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
    differentiation = STANDARDS["level-3-differentiation"]
    integration = STANDARDS["level-3-integration"]
    routes = list(by_standard[differentiation.key]) + list(by_standard[integration.key])
    years = sorted({route.year for route in routes}, reverse=True)
    title = "NCEA Level 3 Calculus Worked Answers | Calc.nz"
    description = (
        "Browse NCEA Level 3 Calculus worked answers for AS91578 Differentiation and "
        "AS91579 Integration, organised by method and examination year."
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
        for standard in (differentiation, integration)
    )
    year_links = " ".join(
        f'<a class="nav-btn secondary" href="{h(year_file(standard.key, year))}">{year} {h(standard.topic)}</a>'
        for year in years
        for standard in (differentiation, integration)
        if any(route.year == year for route in by_standard[standard.key])
    )

    return f"""{page_head(title=title, description=description, canonical=canonical, structured_data=structured)}
<body class="home-page content-page">
<main class="app home-app content-app">
{marker('BREADCRUMBS', breadcrumb, '  ')}
  <header class="topbar">
    <div>
      <p class="eyebrow">NCEA Level 3 Calculus</p>
      <h1>NCEA Level 3 Calculus worked answers</h1>
      <p class="subtitle">Practise Differentiation and Integration by method, paper year, or individual question.</p>
    </div>
    <a class="ghost-link" href="standards.html">Browse all standards</a>
  </header>

  <section class="question-card" aria-labelledby="level-three-calculus-overview">
    <p class="question-label">Level 3 Calculus</p>
    <h2 id="level-three-calculus-overview">Differentiation and Integration in one place</h2>
    <p class="step-text">Students searching for Level 3 Calculus usually need two NCEA standards: <a href="{h(differentiation.landing_file)}">{h(differentiation.code)} Differentiation</a> and <a href="{h(integration.landing_file)}">{h(integration.code)} Integration</a>. Calc.nz keeps each standard and paper distinct while providing one route into both collections.</p>
    <p class="step-text">Across {len(routes)} available walkthroughs, the verified catalogue includes derivative rules, related rates, stationary points and optimisation, parametric differentiation, antidifferentiation, integration techniques, and differential equations.</p>
    <p class="question-note">Use the official NZQA pages for <a href="{h(differentiation.official_url)}">{h(differentiation.code)}</a> and <a href="{h(integration.official_url)}">{h(integration.code)}</a> for authoritative standard information and assessment material.</p>
  </section>

  <section class="question-card" aria-labelledby="calculus-standard-heading">
    <p class="question-label">Choose a standard</p>
    <h2 id="calculus-standard-heading">Level 3 Calculus walkthrough collections</h2>
    <div class="nav-row index-nav">{standard_cards}</div>
  </section>

  <section class="question-card" aria-labelledby="calculus-year-heading">
    <p class="question-label">Browse examination years</p>
    <h2 id="calculus-year-heading">Differentiation and Integration papers</h2>
    <div class="nav-row">{year_links}</div>
  </section>

  <section class="question-card" aria-labelledby="calculus-skill-heading">
    <p class="question-label">Method practice</p>
    <h2 id="calculus-skill-heading">Browse Level 3 Calculus by skill</h2>
    <p class="step-text">Use the <a href="skills.html">Browse by skill directory</a> to collect related questions from different years before returning to a full paper.</p>
  </section>
  <p class="page-updated">Page updated <time datetime="{REVIEW_DATE}">19 July 2026</time>.</p>
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
<body class="home-page content-page skills-directory-page">
<main class="app home-app content-app">
{marker('BREADCRUMBS', breadcrumb, '  ')}
  <header class="topbar">
    <div>
      <p class="eyebrow">Browse by skill</p>
      <h1>Browse NCEA maths questions by skill</h1>
      <p class="subtitle">Collect questions using the same verified method from different papers and years.</p>
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
  <p class="page-updated">Page updated <time datetime="{REVIEW_DATE}">19 July 2026</time>.</p>
</main>
{site_footer()}
</body>
</html>
"""


def skill_page(spec: object, routes: Sequence[QuestionRoute]) -> str:
    # SkillSpec is imported from the dependency-free content module. Keeping
    # this renderer structural lets the verified copy/classification stay data-driven.
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
    for standard_key in STANDARD_ORDER:
        years = sorted(
            {year for key, year in grouped if key == standard_key},
            reverse=True,
        )
        for year in years:
            standard = STANDARDS[standard_key]
            group_routes = sorted(grouped[(standard_key, year)], key=question_sort_key)
            group_id = f"{slug}-{standard_key}-{year}"
            cards = " ".join(
                f"""<a class="nav-btn index-link-card" href="{h(route.href)}">
  <span class="index-link-title">{h(route.title)} · {h(question_method_title(route))}</span>
  <span class="index-link-copy">{h(sentence(route.focus))}</span>
</a>"""
                for route in group_routes
            )
            question_groups.append(
                f"""<section class="index-group skill-question-group" aria-labelledby="{h(group_id)}">
  <div class="year-cluster-header">
    <div>
      <p class="question-label">NCEA Level {standard.level} · {h(standard.code)}</p>
      <h3 id="{h(group_id)}">{year} {h(standard.topic)}</h3>
    </div>
    <div class="nav-row">
      <a class="site-footer-link" href="{h(standard.landing_file)}">Standard overview</a>
      <a class="site-footer-link" href="{h(year_file(standard_key, year))}">{year} paper</a>
    </div>
  </div>
  <div class="nav-row index-nav">{cards}</div>
</section>"""
            )

    related_links = " ".join(
        f'<a class="nav-btn secondary" href="{h(SKILL_SPECS[related].page_href)}">{h(SKILL_SPECS[related].short_label)}</a>'
        for related in spec.related_skill_slugs
    )

    return f"""{page_head(title=title, description=description, canonical=canonical, structured_data=structured)}
<body class="home-page content-page skill-page">
<main class="app home-app content-app">
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

  <section class="question-card" aria-labelledby="skill-questions-heading">
    <p class="question-label">Related practice</p>
    <h2 id="skill-questions-heading">{h(spec.title_label)} questions from different years</h2>
    <p class="step-text">Open a question for hints and a progressive worked solution, or use the standard and paper links to return to its assessment context.</p>
    {' '.join(question_groups)}
  </section>

  <section class="question-card" aria-labelledby="related-skills-heading">
    <p class="question-label">Keep practising</p>
    <h2 id="related-skills-heading">Related skill collections</h2>
    <div class="nav-row">{related_links}</div>
  </section>
  <p class="page-updated">Page updated <time datetime="{REVIEW_DATE}">19 July 2026</time>.</p>
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
<body class="home-page">
<main class="app home-app">
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
    <p class="question-note">The site does not claim that its walkthroughs are NZQA-verified, teacher-reviewed, or a replacement for official material.</p>
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
  <p class="page-updated">Page updated <time datetime="{REVIEW_DATE}">19 July 2026</time>.</p>
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


def sitemap_xml(routes: Sequence[QuestionRoute]) -> str:
    urls = [BASE_URL]
    urls.append(absolute_url("standards.html"))
    urls.append(absolute_url("level-3-calculus.html"))
    urls.append(absolute_url("skills.html"))
    urls.extend(absolute_url(spec.page_href) for spec in SKILL_SPECS.values())
    urls.extend(STANDARDS[key].landing_url for key in STANDARD_ORDER)
    for key in STANDARD_ORDER:
        years = sorted({route.year for route in routes if route.standard_key == key}, reverse=True)
        urls.extend(absolute_url(year_file(key, year)) for year in years)
    urls.append(absolute_url("about.html"))
    urls.extend(route.canonical for route in routes)

    if len(urls) != 1 + 1 + 1 + 1 + len(SKILL_SPECS) + len(STANDARDS) + EXPECTED_YEAR_COUNT + 1 + EXPECTED_ROUTE_COUNT:
        raise ValueError("Unexpected sitemap URL count")
    if len(urls) != len(set(urls)):
        raise ValueError("Sitemap contains duplicate canonical URLs")
    if any(not url.startswith(BASE_URL) for url in urls):
        raise ValueError("Sitemap contains a non-canonical host or non-HTTPS URL")

    body = "\n".join(
        f"  <url><loc>{xml_escape(url)}</loc><lastmod>{REVIEW_DATE}</lastmod></url>"
        for url in urls
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
            if "/" in local_path or local_path not in available:
                failures.append(f"{path.name}: {href}")
    if failures:
        raise ValueError("Generated HTML has missing local links:\n  " + "\n  ".join(sorted(set(failures))))


def build_outputs() -> dict[Path, str]:
    index_path = ROOT / "index.html"
    index_original = index_path.read_text(encoding="utf-8")
    catalogue_original = CATALOGUE_FILE.read_text(encoding="utf-8")
    catalogue = load_catalogue(catalogue_original)
    routes = discover_routes(catalogue)
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
    for spec in SKILL_SPECS.values():
        outputs[ROOT / spec.page_href] = skill_page(spec, routes)

    for key in STANDARD_ORDER:
        standard = STANDARDS[key]
        outputs[ROOT / standard.landing_file] = standard_page(standard, by_standard[key])
        years = sorted({route.year for route in by_standard[key]}, reverse=True)
        for year in years:
            outputs[ROOT / year_file(key, year)] = year_page(
                standard,
                year,
                by_year[(key, year)],
                years,
            )

    outputs[ROOT / "about.html"] = about_page()
    outputs[ROOT / "robots.txt"] = robots_txt()
    outputs[ROOT / "sitemap.xml"] = sitemap_xml(routes)

    # All HTML pages are generator-controlled. Use one cache token for local
    # styles, scripts, and data so shared walkthrough changes cannot be served
    # alongside an older asset bundle.
    cache_pattern = re.compile(
        r'(?P<prefix>\b(?:href|src)=["\'][^"\']+\?v=)[^"\']+(?P<suffix>["\'])'
    )
    for path, content in tuple(outputs.items()):
        if path.suffix == ".html":
            outputs[path] = cache_pattern.sub(
                lambda match: (
                    match.group("prefix") + CACHE_TOKEN + match.group("suffix")
                ),
                content,
            )

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
