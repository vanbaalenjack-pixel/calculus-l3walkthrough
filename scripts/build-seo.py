#!/usr/bin/env python3
"""Build the static SEO layer for Calc.nz.

The question catalogue in ``index.html`` remains the source of truth.  This
script reads its 432 crawlable question cards, derives the supported standards
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


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://calc.nz/"
CACHE_TOKEN = "20260719-2"
EXPECTED_ROUTE_COUNT = 432
EXPECTED_YEAR_COUNT = 29

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
            '<meta name="twitter:card" content="summary">',
            f'<meta name="twitter:title" content="{h(title)}">',
            f'<meta name="twitter:description" content="{h(description)}">',
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


def discover_routes(index_html: str) -> list[QuestionRoute]:
    parser = IndexCardParser()
    parser.feed(index_html)
    parser.close()

    if len(parser.cards) != EXPECTED_ROUTE_COUNT:
        raise ValueError(
            f"Expected {EXPECTED_ROUTE_COUNT} index question cards, found {len(parser.cards)}"
        )

    routes: list[QuestionRoute] = []
    for card in parser.cards:
        panel = card["panel"]
        standard_key = next(
            (key for key in STANDARD_ORDER if panel.startswith(f"{key}-")),
            None,
        )
        if not standard_key:
            raise ValueError(f"Unsupported standard panel: {panel}")

        expected_prefix = f"{standard_key}-"
        year_text = panel[len(expected_prefix) :]
        if not re.fullmatch(r"20\d{2}", year_text):
            raise ValueError(f"Could not derive a year from paper panel: {panel}")
        year = int(year_text)

        title_match = re.fullmatch(
            r"Question\s+([1-9]\d*\([a-z]\)(?:\((?:i|ii|iii|iv)\))?)",
            card["title"],
            re.I,
        )
        if not title_match:
            raise ValueError(f"Unexpected question-card title: {card['title']!r}")
        display_number = title_match.group(1).lower()

        href = html.unescape(card["href"])
        route_path = href.split("#", 1)[0]
        source_file = route_path.split("?", 1)[0]
        if not re.fullmatch(r"[A-Za-z0-9._-]+\.html", source_file):
            raise ValueError(f"Unsafe or unsupported question route: {href!r}")
        if not (ROOT / source_file).is_file():
            raise ValueError(f"Question route points to missing file: {source_file}")

        query = urlsplit(route_path).query
        if query:
            query_match = re.fullmatch(r"q=([1-9]\d*[a-z])", query, re.I)
            if not query_match:
                raise ValueError(f"Question query does not match its card title: {href!r}")
            question_id = query_match.group(1).lower()
        else:
            file_match = re.search(
                rf"([1-9]\d*[a-z]){year}(?:-l2)?\.html$",
                source_file,
                flags=re.I,
            )
            if not file_match:
                raise ValueError(f"Could not derive an internal question id from {source_file!r}")
            question_id = file_match.group(1).lower()

        focus = re.sub(r"^Focus:\s*", "", card["focus"], flags=re.I).strip()
        routes.append(
            QuestionRoute(
                standard_key=standard_key,
                year=year,
                question_id=question_id,
                display_number=display_number,
                title=card["title"],
                focus=focus,
                href=href,
                route_path=route_path,
                source_file=source_file,
            )
        )

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


def question_browser_title(route: QuestionRoute) -> str:
    standard = route.standard
    return (
        f"{route.year} NCEA Level {standard.level} {standard.topic} {standard.code} "
        f"Question {route.display_number} — Worked Solution"
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
                "learningResourceType": "Interactive worked-solution walkthrough",
                "educationalUse": "Practice",
                "educationalLevel": f"NCEA Level {standard.level}",
                "teaches": meta_plain(route.focus),
                "about": {
                    "@type": "Thing",
                    "name": f"{standard.code} — {standard.official_name}",
                },
                "creator": {"@type": "Person", "name": "Jack van Baalen"},
                "isPartOf": {"@id": f"{standard.landing_url}#webpage"},
            },
            breadcrumb_schema(crumbs),
        ],
    }


def infer_common_mistake(route: QuestionRoute) -> str:
    focus = route.focus.lower()
    patterns = (
        ("chain rule", "Do not stop after differentiating the outside function; include the derivative of the inside function as a factor."),
        ("product rule", "Differentiate both factors in turn and keep both product-rule terms."),
        ("quotient rule", "Use brackets carefully and retain the squared denominator when applying the quotient rule."),
        ("point of inflection", "A zero second derivative alone is not enough; check the required change in concavity or other supporting evidence."),
        ("stationary", "After solving the derivative condition, check the point's nature and answer the conclusion the question actually asks for."),
        ("related rates", "Differentiate with respect to time consistently, then include the correct units and contextual interpretation."),
        ("maxim", "Finding a stationary value is only part of an optimisation argument; justify that it is the required maximum and respect the domain."),
        ("minimum", "Finding a stationary value is only part of the argument; justify that it is the required minimum and respect the domain."),
        ("argument", "Check the complex number's quadrant and the argument range before selecting the final angle."),
        ("roots", "Check whether the equation requires every root, and list distinct roots with the correct angular spacing."),
        ("root", "Substitute candidate roots back where domain restrictions or extraneous solutions are possible."),
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
    return route.standard.mistakes[0]


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
  <p class="step-text">This is Question {h(route.display_number)} from the <a href="{h(route.year_file)}" data-seo-year-link>{route.year} NCEA Level {standard.level} {h(standard.topic)} paper</a> for <a href="{h(standard.landing_file)}" data-seo-standard-link>{h(standard.code)} — {h(standard.official_name)}</a>. Use the guided hints to practise the method before revealing the full working.</p>
  <p class="question-note">Walkthrough and mathematical explanations by Jack van Baalen. Compare the wording, diagrams, and assessment information with the <a href="{h(standard.official_url)}">official NZQA resources for {h(standard.code)}</a>.</p>
</section>
""".strip()


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
  <p class="step-text" data-seo-summary>This walkthrough focuses on {h(lower_sentence(route.focus))}. Afterwards, try the same method again without hints and explain the reasoning that connects each step.</p>
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
        r"(?is)(</header>)\s*",
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

    return original


def update_redirect_page(original: str, source: str, target: str) -> str:
    original = remove_marker(original, "HEAD")
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
        "description": "Free interactive NCEA Level 2 and Level 3 maths worked answers and walkthroughs.",
        "inLanguage": "en-NZ",
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
  <p class="step-text">These crawlable standard pages organise every interactive walkthrough by topic and examination year.</p>
  <div class="nav-row index-nav">
    {' '.join(cards)}
  </div>
</section>
""".strip()


def update_homepage(
    original: str,
) -> str:
    for name in ("HEAD", "DIRECTORY", "FOOTER"):
        original = remove_marker(original, name)

    title = "Free NCEA Maths Worked Answers & Walkthroughs | Calc.nz"
    description = (
        "Free interactive NCEA Level 2 and Level 3 maths worked answers. "
        "Practise Calculus, Algebra, Complex Numbers, Differentiation, and Integration step by step."
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
  <p class="site-footer-text">Created by Jack van Baalen as part of a Year 13 extended learning project. Mathematical explanations and walkthrough design by Jack van Baalen. AI tools assisted with parts of the website implementation.</p>
  <nav class="site-footer-nav" aria-label="Footer">
    <a class="site-footer-link" href="/">Home</a>
    <a class="site-footer-link" href="/standards.html">Standards</a>
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
        "with free interactive worked answers organised by topic and examination year."
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
        f"Free NCEA Level {standard.level} {standard.topic} {standard.code} worked answers and interactive walkthroughs, grouped by examination year with guided hints and reasoning."
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
    year_walkthrough_groups: list[str] = []
    for year in years:
        year_routes = sorted(
            (route for route in routes if route.year == year),
            key=question_sort_key,
        )
        count = len(year_routes)
        year_cards.append(
            f"""<a class="nav-btn index-link-card" href="{h(year_file(standard.key, year))}">
  <span class="index-link-title">{year} {h(standard.topic)} worked answers</span>
  <span class="index-link-copy">{count} interactive Question walkthroughs for {h(standard.code)}.</span>
</a>"""
        )
        question_links = "\n".join(
            f'<li><a href="{h(route.href)}">Question {h(route.display_number)} — {h(sentence(route.focus))}</a></li>'
            for route in year_routes
        )
        year_walkthrough_groups.append(
            f"""<section class="index-group" aria-labelledby="walkthroughs-{year}-heading">
  <h3 id="walkthroughs-{year}-heading"><a href="{h(year_file(standard.key, year))}">{year} {h(standard.topic)} paper overview</a></h3>
  <ul class="step-text">
    {question_links}
  </ul>
</section>"""
        )
    breadcrumb = breadcrumb_nav(
        (
            ("Calc.nz", "index.html"),
            (f"NCEA Level {standard.level} {standard.topic} — {standard.code}", None),
        )
    )
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

  <section class="question-card" aria-labelledby="paper-years-heading">
    <p class="question-label">Available examination years</p>
    <h2 id="paper-years-heading">Choose a {h(standard.topic)} paper</h2>
    <p class="step-text">Each year page links to every walkthrough currently available on Calc.nz.</p>
    <div class="nav-row index-nav">
      {' '.join(year_cards)}
    </div>
  </section>

  <section class="question-card" aria-labelledby="all-walkthroughs-heading">
    <p class="question-label">Complete walkthrough directory</p>
    <h2 id="all-walkthroughs-heading">Every {h(standard.code)} walkthrough, grouped by year</h2>
    <p class="step-text">Use a paper overview for the full year context, or open any question part directly.</p>
    {' '.join(year_walkthrough_groups)}
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
        f"Free {year} NCEA Level {standard.level} {standard.topic} {standard.code} worked answers. Practise {len(ordered)} questions with interactive hints and step-by-step reasoning."
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

    return f"""{page_head(title=title, description=description, canonical=canonical, structured_data=structured)}
<body class="home-page">
<main class="app home-app">
{marker('BREADCRUMBS', breadcrumb, '  ')}
  <header class="topbar">
    <div>
      <p class="eyebrow">{year} NCEA Level {standard.level} {h(standard.topic)}</p>
      <h1>{year} {h(standard.topic)} {h(standard.code)} worked answers</h1>
      <p class="subtitle">Interactive, step-by-step walkthroughs for {h(standard.official_name)}.</p>
    </div>
    <a class="ghost-link" href="{h(standard.landing_file)}">← All {h(standard.topic)} years</a>
  </header>

  <section class="question-card" aria-labelledby="paper-overview-heading">
    <p class="question-label">Paper overview</p>
    <h2 id="paper-overview-heading">Practise the {year} questions one step at a time</h2>
    <p class="step-text">This page contains {len(ordered)} independent walkthroughs for NCEA Level {standard.level} {h(standard.topic)} ({h(standard.code)}). Each walkthrough keeps the interactive answer flow, gives hints before full working, and focuses on the method described below.</p>
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
  </section>
</main>
{site_footer()}
</body>
</html>
"""


def about_page() -> str:
    filename = "about.html"
    canonical = absolute_url(filename)
    title = "About Calc.nz | Independent NCEA Maths Walkthroughs"
    description = (
        "Learn how Calc.nz creates independent, interactive NCEA maths walkthroughs, "
        "uses official sources, handles privacy, and invites error reports."
    )
    structured = collection_schema(
        canonical=canonical,
        title=title,
        description=description,
        crumbs=(("Calc.nz", BASE_URL), ("About Calc.nz", canonical)),
    )
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
      <p class="subtitle">An independent collection of interactive NCEA maths worked-answer walkthroughs.</p>
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
    <p class="step-text">Calc.nz was created by Jack van Baalen as part of a Year 13 extended learning project. Mathematical explanations and walkthrough design are by Jack van Baalen. AI tools were used to assist with parts of the website implementation.</p>
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
    <p class="step-text">Calc.nz does not add analytics, advertising, user accounts, mailing lists, or tracking cookies. Walkthrough progress may be stored by the browser on the student's own device so the interactive experience can work across visits.</p>
  </section>

  <section class="question-card" aria-labelledby="errors-heading">
    <p class="question-label">Corrections</p>
    <h2 id="errors-heading">Report an error</h2>
    <p class="step-text">If you find a mathematical, wording, accessibility, or technical problem, <a href="{h(ERROR_REPORT_URL)}">use the Calc.nz error-report form</a>. Include the page URL, question number, and a concise description so it can be checked.</p>
    <p class="question-note"><a href="{h(REPOSITORY_URL)}">View the Calc.nz project repository</a>.</p>
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


def sitemap_xml(routes: Sequence[QuestionRoute]) -> str:
    urls = [BASE_URL]
    urls.append(absolute_url("standards.html"))
    urls.extend(STANDARDS[key].landing_url for key in STANDARD_ORDER)
    for key in STANDARD_ORDER:
        years = sorted({route.year for route in routes if route.standard_key == key}, reverse=True)
        urls.extend(absolute_url(year_file(key, year)) for year in years)
    urls.append(absolute_url("about.html"))
    urls.extend(route.canonical for route in routes)

    if len(urls) != 1 + 1 + len(STANDARDS) + EXPECTED_YEAR_COUNT + 1 + EXPECTED_ROUTE_COUNT:
        raise ValueError("Unexpected sitemap URL count")
    if len(urls) != len(set(urls)):
        raise ValueError("Sitemap contains duplicate canonical URLs")
    if any(not url.startswith(BASE_URL) for url in urls):
        raise ValueError("Sitemap contains a non-canonical host or non-HTTPS URL")

    body = "\n".join(f"  <url><loc>{xml_escape(url)}</loc></url>" for url in urls)
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
    routes = discover_routes(index_original)
    by_standard, by_year, by_source = group_routes(routes)

    outputs: dict[Path, str] = {}

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
