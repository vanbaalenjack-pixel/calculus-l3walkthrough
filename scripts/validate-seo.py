#!/usr/bin/env python3
"""Dependency-free SEO validation for the generated Calc.nz static site."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Set, Tuple
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, unquote, urljoin, urlsplit, urlunsplit
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET


ORIGIN = "https://calc.nz"
EXPECTED_SITEMAP_COUNT = 468
EXPECTED_QUESTION_COUNT = 432
LEGACY_REDIRECTS = {
    "differentiation-2020.html",
    "integration-2017.html",
    "integration-2019.html",
    "integration-2020.html",
}
FULL_PARTS = tuple(f"{number}{letter}" for number in "123" for letter in "abcde")
L2_CALCULUS_PARTS = tuple(f"{number}{letter}" for number in "123" for letter in "abcd")
STANDARD_INFO = {
    "level-2-calculus": "91262",
    "level-2-algebra": "91261",
    "level-3-complex-numbers": "91577",
    "level-3-differentiation": "91578",
    "level-3-integration": "91579",
}
STANDARD_FILES = {f"{slug}.html" for slug in STANDARD_INFO}
YEAR_FILE_TO_STANDARD: Dict[str, str] = {}
for _slug in ("level-2-calculus", "level-2-algebra"):
    YEAR_FILE_TO_STANDARD[f"{_slug}-2025.html"] = _slug
for _slug in ("level-3-complex-numbers", "level-3-differentiation", "level-3-integration"):
    for _year in range(2017, 2026):
        YEAR_FILE_TO_STANDARD[f"{_slug}-{_year}.html"] = _slug
YEAR_FILES = set(YEAR_FILE_TO_STANDARD)


def absolute(route: str) -> str:
    return ORIGIN + "/" + route.lstrip("/")


def build_expected_question_routes() -> Set[str]:
    routes: Set[str] = set()
    routes.update(absolute(f"{part}2025-l2.html") for part in L2_CALCULUS_PARTS)
    routes.update(absolute(f"alg-{part}2025-l2.html") for part in FULL_PARTS)
    for year in range(2017, 2026):
        routes.update(absolute(f"{part}{year}.html") for part in FULL_PARTS)
        routes.update(absolute(f"int-{part}{year}.html") for part in FULL_PARTS)
    routes.update(absolute(f"complex-{part}2025.html") for part in FULL_PARTS)
    for year in range(2017, 2025):
        routes.update(absolute(f"complex-{year}.html?q={part}") for part in FULL_PARTS)
    return routes


QUESTION_URLS = build_expected_question_routes()
LANDING_URLS = {ORIGIN + "/", absolute("about.html")}
LANDING_URLS.update(absolute(name) for name in STANDARD_FILES)
LANDING_URLS.update(absolute(name) for name in YEAR_FILES)
EXPECTED_SITEMAP_URLS = LANDING_URLS | QUESTION_URLS


def local_file_for_url(url: str) -> str:
    path = unquote(urlsplit(url).path).lstrip("/")
    return path or "index.html"


QUESTION_FILES = {local_file_for_url(url) for url in QUESTION_URLS}
PUBLIC_FILES = QUESTION_FILES | STANDARD_FILES | YEAR_FILES | {"index.html", "about.html"}


@dataclass
class Capture:
    kind: str
    visible: bool
    text: List[str] = field(default_factory=list)
    links: int = 0

    @property
    def value(self) -> str:
        return re.sub(r"\s+", " ", "".join(self.text)).strip()


class PageParser(HTMLParser):
    VOID_TAGS = {
        "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "param", "source", "track", "wbr",
    }

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: List[dict] = []
        self.active: List[Capture] = []
        self.captures: Dict[str, List[Capture]] = defaultdict(list)
        self.meta_name: Dict[str, List[str]] = defaultdict(list)
        self.meta_property: Dict[str, List[str]] = defaultdict(list)
        self.canonicals: List[str] = []
        self.references: List[Tuple[str, str, str, int]] = []
        self.ids: Set[str] = set()
        self.duplicate_ids: Set[str] = set()
        self.visible_text_parts: List[str] = []
        self.comments: List[str] = []

    @property
    def visible_text(self) -> str:
        return re.sub(r"\s+", " ", " ".join(self.visible_text_parts)).strip()

    def _capture(self, kind: str, visible: bool, started: List[Capture]) -> None:
        capture = Capture(kind=kind, visible=visible)
        self.captures[kind].append(capture)
        self.active.append(capture)
        started.append(capture)

    def handle_starttag(self, tag: str, attrs: Sequence[Tuple[str, Optional[str]]]) -> None:
        tag = tag.lower()
        pairs = [(key.lower(), value or "") for key, value in attrs]
        values = dict(pairs)
        classes = set(values.get("class", "").lower().split())
        parent_visible = self.stack[-1]["visible"] if self.stack else True
        parent_suppressed = self.stack[-1]["suppressed"] if self.stack else False
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
        started: List[Capture] = []

        for active in self.active:
            if tag == "a" and values.get("href"):
                active.links += 1

        element_id = values.get("id", "").strip()
        if element_id:
            if element_id in self.ids:
                self.duplicate_ids.add(element_id)
            self.ids.add(element_id)

        for attribute in ("href", "src"):
            if attribute in values:
                self.references.append((tag, attribute, values[attribute].strip(), self.getpos()[0]))

        if tag == "meta":
            content = values.get("content", "").strip()
            if values.get("name"):
                self.meta_name[values["name"].strip().lower()].append(content)
            if values.get("property"):
                self.meta_property[values["property"].strip().lower()].append(content)
        if tag == "link" and "canonical" in values.get("rel", "").lower().split():
            self.canonicals.append(values.get("href", "").strip())

        if tag == "title":
            self._capture("title", visible, started)
        if tag == "h1":
            self._capture("h1", visible, started)
        if tag == "script" and values.get("type", "").lower().split(";", 1)[0].strip() == "application/ld+json":
            self._capture("jsonld", visible, started)

        aria_label = values.get("aria-label", "").lower()
        if "seo-breadcrumbs" in classes or "breadcrumb" in aria_label or any(
            key.startswith("data-seo-breadcrumb") for key, _ in pairs
        ):
            self._capture("breadcrumb", visible, started)

        if (
            classes.intersection({"seo-question-overview", "learning-overview"})
            or any(key.startswith("data-seo-overview") for key, _ in pairs)
        ):
            self._capture("overview", visible, started)
        if values.get("data-seo-focus") is not None:
            self._capture("focus", visible, started)
        if (
            classes.intersection({"seo-learning-summary", "learning-summary"})
            or values.get("data-seo-summary") is not None
        ):
            self._capture("summary", visible, started)

        if tag not in self.VOID_TAGS:
            self.stack.append({
                "tag": tag,
                "visible": visible,
                "suppressed": suppressed,
                "started": started,
            })
        else:
            for capture in started:
                self.active = [item for item in self.active if item is not capture]

    def handle_startendtag(self, tag: str, attrs: Sequence[Tuple[str, Optional[str]]]) -> None:
        self.handle_starttag(tag, attrs)
        if tag.lower() not in self.VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        match = next((index for index in range(len(self.stack) - 1, -1, -1)
                      if self.stack[index]["tag"] == tag), None)
        if match is None:
            return
        popped = self.stack[match:]
        del self.stack[match:]
        for entry in reversed(popped):
            for capture in entry["started"]:
                self.active = [item for item in self.active if item is not capture]

    def handle_data(self, data: str) -> None:
        for capture in self.active:
            capture.text.append(data)
        if self.stack and self.stack[-1]["visible"] and not self.stack[-1]["suppressed"]:
            if data.strip():
                self.visible_text_parts.append(data)

    def handle_comment(self, data: str) -> None:
        self.comments.append(data.strip())


class Failures:
    def __init__(self) -> None:
        self.items: List[str] = []

    def add(self, message: str) -> None:
        self.items.append(message)

    def extend(self, messages: Iterable[str]) -> None:
        self.items.extend(messages)


def parse_page(path: Path, failures: Failures) -> Optional[PageParser]:
    try:
        source = path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as error:
        failures.add(f"{path.name}: cannot read UTF-8 HTML ({error})")
        return None
    parser = PageParser()
    try:
        parser.feed(source)
        parser.close()
    except Exception as error:  # HTMLParser can surface malformed declarations.
        failures.add(f"{path.name}: HTML parse error ({error})")
        return None
    return parser


def one_value(values: Sequence[str], label: str, filename: str, failures: Failures) -> Optional[str]:
    if len(values) != 1:
        failures.add(f"{filename}: expected one {label}, found {len(values)}")
        return None
    value = re.sub(r"\s+", " ", values[0]).strip()
    if not value:
        failures.add(f"{filename}: empty {label}")
        return None
    return value


def expected_canonical(filename: str) -> str:
    if filename == "index.html":
        return ORIGIN + "/"
    if re.fullmatch(r"complex-(201[7-9]|202[0-4])\.html", filename):
        return absolute(filename + "?q=1a")
    return absolute(filename)


def jsonld_is_valid(raw: str) -> bool:
    try:
        value = json.loads(raw)
    except (TypeError, ValueError):
        return False
    if not isinstance(value, (dict, list)):
        return False
    roots = value if isinstance(value, list) else [value]
    return any(isinstance(item, dict) and "@context" in item for item in roots)


def has_visible_capture(parser: PageParser, kind: str, minimum_length: int = 1,
                        require_link: bool = False) -> bool:
    return any(
        capture.visible
        and len(capture.value) >= minimum_length
        and (not require_link or capture.links > 0)
        for capture in parser.captures.get(kind, [])
    )


def validate_public_page(filename: str, parser: PageParser, failures: Failures,
                         uniqueness: Dict[str, Dict[str, List[str]]]) -> None:
    title = one_value([item.value for item in parser.captures.get("title", [])],
                      "non-empty title", filename, failures)
    description = one_value(parser.meta_name.get("description", []), "meta description", filename, failures)
    canonical = one_value(parser.canonicals, "canonical", filename, failures)
    og_title = one_value(parser.meta_property.get("og:title", []), "og:title", filename, failures)
    og_description = one_value(parser.meta_property.get("og:description", []), "og:description", filename, failures)
    og_url = one_value(parser.meta_property.get("og:url", []), "og:url", filename, failures)
    h1 = one_value([item.value for item in parser.captures.get("h1", [])], "H1", filename, failures)

    values = {
        "title": title,
        "description": description,
        "canonical": canonical,
        "og:title": og_title,
        "og:description": og_description,
        "og:url": og_url,
    }
    for key, value in values.items():
        if value:
            uniqueness[key][value.casefold()].append(filename)

    wanted = expected_canonical(filename)
    if canonical and canonical != wanted:
        failures.add(f"{filename}: canonical is {canonical!r}, expected {wanted!r}")
    if og_url and canonical and og_url != canonical:
        failures.add(f"{filename}: og:url does not match canonical")
    if og_title and title and og_title != title:
        failures.add(f"{filename}: og:title does not match title")
    if og_description and description and og_description != description:
        failures.add(f"{filename}: og:description does not match meta description")
    if h1 and not any(item.visible for item in parser.captures.get("h1", [])):
        failures.add(f"{filename}: H1 is not visible")

    robots = " ".join(parser.meta_name.get("robots", [])).lower()
    if re.search(r"(?:^|[\s,])noindex(?:$|[\s,])", robots):
        failures.add(f"{filename}: public page has noindex")
    if re.search(r"(?:^|[\s,])nofollow(?:$|[\s,])", robots):
        failures.add(f"{filename}: public page has nofollow")

    jsonld = parser.captures.get("jsonld", [])
    if not jsonld:
        failures.add(f"{filename}: missing JSON-LD")
    for index, capture in enumerate(jsonld, 1):
        if not capture.value or not jsonld_is_valid(capture.value):
            failures.add(f"{filename}: invalid JSON-LD block {index}")

    if filename != "index.html" and not has_visible_capture(parser, "breadcrumb", 2, True):
        failures.add(f"{filename}: missing visible linked breadcrumb")


def resolve_local_target(root: Path, source: Path, reference: str) -> Tuple[Optional[Path], str]:
    if not reference:
        return None, "empty URL"
    parsed = urlsplit(reference)
    if parsed.scheme and parsed.scheme.lower() not in {"http", "https"}:
        return None, ""
    if parsed.netloc and parsed.hostname and parsed.hostname.lower() != "calc.nz":
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
        return None, "escapes repository root"
    if target.is_dir():
        target = target / "index.html"
    return target, parsed.fragment


def validate_references(root: Path, pages: Dict[str, PageParser], failures: Failures) -> None:
    for filename, parser in pages.items():
        source = root / filename
        for tag, attribute, value, line in parser.references:
            target, detail = resolve_local_target(root, source, value)
            if target is None:
                if detail:
                    failures.add(f"{filename}:{line}: invalid {tag} {attribute}={value!r} ({detail})")
                continue
            if not target.exists() or not target.is_file():
                failures.add(f"{filename}:{line}: missing local target {value!r}")
                continue
            if detail and target.suffix.lower() == ".html":
                target_parser = pages.get(target.name)
                if target_parser is not None and detail not in target_parser.ids:
                    failures.add(f"{filename}:{line}: missing fragment #{detail} in {target.name}")


def validate_nzqa_content(filename: str, parser: PageParser, failures: Failures) -> None:
    slug = filename[:-5] if filename in STANDARD_FILES else YEAR_FILE_TO_STANDARD.get(filename)
    if not slug:
        return
    standard_number = STANDARD_INFO[slug]
    found_source = False
    for _tag, attribute, value, _line in parser.references:
        if attribute != "href":
            continue
        parsed = urlsplit(value)
        if parsed.scheme == "https" and parsed.hostname and parsed.hostname.lower().endswith("nzqa.govt.nz"):
            supplied = parse_qs(parsed.query).get("standardNumber", [])
            if standard_number in supplied or ("AS" + standard_number) in supplied:
                found_source = True
                break
    if not found_source:
        failures.add(f"{filename}: missing official NZQA link for AS{standard_number}")
    text = parser.visible_text.casefold()
    if "nzqa" not in text or "independent" not in text or not (
        "not affiliated" in text or "independent of nzqa" in text
    ):
        failures.add(f"{filename}: missing visible independence/NZQA disclaimer")


def validate_question_markers(filename: str, parser: PageParser, failures: Failures) -> None:
    if filename not in QUESTION_FILES:
        return
    if not has_visible_capture(parser, "overview", 20):
        failures.add(f"{filename}: missing visible SEO question overview marker/content")
    if not has_visible_capture(parser, "summary", 20):
        failures.add(f"{filename}: missing visible SEO learning summary marker/content")


def parse_sitemap(root: Path, failures: Failures) -> List[str]:
    path = root / "sitemap.xml"
    if not path.exists():
        failures.add("sitemap.xml: missing")
        return []
    try:
        tree = ET.parse(path)
    except (OSError, ET.ParseError) as error:
        failures.add(f"sitemap.xml: invalid XML ({error})")
        return []
    document = tree.getroot()
    if document.tag.rsplit("}", 1)[-1] != "urlset":
        failures.add("sitemap.xml: root element must be urlset")
    urls: List[str] = []
    for url_element in document.iter():
        if url_element.tag.rsplit("}", 1)[-1] != "url":
            continue
        locations = [child for child in url_element
                     if child.tag.rsplit("}", 1)[-1] == "loc"]
        if len(locations) != 1 or not (locations[0].text or "").strip():
            failures.add("sitemap.xml: every url needs exactly one non-empty loc")
            continue
        urls.append((locations[0].text or "").strip())
    return urls


def validate_sitemap(root: Path, urls: List[str], failures: Failures) -> None:
    if len(urls) != EXPECTED_SITEMAP_COUNT:
        failures.add(f"sitemap.xml: expected {EXPECTED_SITEMAP_COUNT} URLs, found {len(urls)}")
    if len(set(urls)) != len(urls):
        duplicates = sorted(url for url, count in __import__("collections").Counter(urls).items() if count > 1)
        failures.add("sitemap.xml: duplicate URLs: " + ", ".join(duplicates[:5]))

    actual = set(urls)
    missing = sorted(EXPECTED_SITEMAP_URLS - actual)
    extra = sorted(actual - EXPECTED_SITEMAP_URLS)
    if missing:
        failures.add(f"sitemap.xml: {len(missing)} expected URLs missing (first: {missing[0]})")
    if extra:
        failures.add(f"sitemap.xml: {len(extra)} unexpected URLs (first: {extra[0]})")
    question_actual = actual & QUESTION_URLS
    if len(question_actual) != EXPECTED_QUESTION_COUNT:
        failures.add(f"sitemap.xml: expected {EXPECTED_QUESTION_COUNT} question routes, found {len(question_actual)}")

    for url in urls:
        parsed = urlsplit(url)
        if parsed.scheme != "https" or parsed.netloc != "calc.nz":
            failures.add(f"sitemap.xml: non-canonical origin {url!r}")
        if parsed.fragment:
            failures.add(f"sitemap.xml: fragment is not allowed in {url!r}")
        if local_file_for_url(url) in LEGACY_REDIRECTS:
            failures.add(f"sitemap.xml: legacy redirect shell included: {url!r}")
        local = root / local_file_for_url(url)
        if not local.exists() or not local.is_file():
            failures.add(f"sitemap.xml: URL has no local file: {url!r}")


def validate_robots(root: Path, failures: Failures) -> None:
    path = root / "robots.txt"
    if not path.exists():
        failures.add("robots.txt: missing")
        return
    try:
        lines = [line.split("#", 1)[0].strip() for line in path.read_text(encoding="utf-8").splitlines()]
    except (OSError, UnicodeError) as error:
        failures.add(f"robots.txt: cannot read ({error})")
        return
    directives = [(key.strip().lower(), value.strip()) for line in lines if ":" in line
                  for key, value in [line.split(":", 1)]]
    if ("user-agent", "*") not in [(key, value.lower()) for key, value in directives]:
        failures.add("robots.txt: missing User-agent: *")
    if ("allow", "/") not in [(key, value) for key, value in directives]:
        failures.add("robots.txt: missing Allow: /")
    if any(key == "disallow" and value == "/" for key, value in directives):
        failures.add("robots.txt: root crawling is disallowed")
    sitemap_values = [value for key, value in directives if key == "sitemap"]
    if sitemap_values != [ORIGIN + "/sitemap.xml"]:
        failures.add(f"robots.txt: expected exactly `Sitemap: {ORIGIN}/sitemap.xml`")


def head_url(base: str, public_url: str, timeout: float) -> Tuple[str, Optional[str]]:
    public = urlsplit(public_url)
    base_parts = urlsplit(base)
    prefix = base_parts.path.rstrip("/")
    path = prefix + (public.path if public.path.startswith("/") else "/" + public.path)
    target = urlunsplit((base_parts.scheme, base_parts.netloc, path or "/", public.query, ""))
    try:
        request = Request(target, method="HEAD", headers={"User-Agent": "Calc.nz SEO validator"})
        with urlopen(request, timeout=timeout) as response:
            status = response.getcode()
        if status < 200 or status >= 300:
            return public_url, f"HTTP {status} from {target}"
        return public_url, None
    except HTTPError as error:
        return public_url, f"HTTP {error.code} from {target}"
    except (URLError, OSError) as error:
        return public_url, f"HEAD failed for {target}: {error}"


def validate_heads(base: str, urls: Sequence[str], timeout: float, workers: int,
                   failures: Failures) -> None:
    parsed = urlsplit(base)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        failures.add(f"--head-base must be an absolute HTTP(S) URL, got {base!r}")
        return
    with ThreadPoolExecutor(max_workers=max(1, workers)) as executor:
        futures = [executor.submit(head_url, base, url, timeout) for url in urls]
        for future in as_completed(futures):
            _url, error = future.result()
            if error:
                failures.add(error)


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path,
                        default=Path(__file__).resolve().parents[1],
                        help="repository root (default: parent of scripts directory)")
    parser.add_argument("--head-base", metavar="URL",
                        help="optionally HEAD-check sitemap paths against this local or remote base URL")
    parser.add_argument("--head-timeout", type=float, default=5.0)
    parser.add_argument("--head-workers", type=int, default=8)
    parser.add_argument("--max-errors", type=int, default=100)
    args = parser.parse_args(argv)
    root = args.root.resolve()
    failures = Failures()

    if len(EXPECTED_SITEMAP_URLS) != EXPECTED_SITEMAP_COUNT:
        failures.add(f"validator route catalog error: expected {EXPECTED_SITEMAP_COUNT}, built {len(EXPECTED_SITEMAP_URLS)}")
    if len(QUESTION_URLS) != EXPECTED_QUESTION_COUNT:
        failures.add(f"validator question catalog error: expected {EXPECTED_QUESTION_COUNT}, built {len(QUESTION_URLS)}")

    actual_html = {path.name for path in root.glob("*.html") if path.is_file()}
    missing_files = sorted(PUBLIC_FILES - actual_html)
    unexpected_files = sorted(actual_html - PUBLIC_FILES - LEGACY_REDIRECTS)
    if missing_files:
        failures.add(f"root HTML: {len(missing_files)} expected files missing (first: {missing_files[0]})")
    if unexpected_files:
        failures.add(f"root HTML: unclassified files not permitted by exact sitemap: {', '.join(unexpected_files[:5])}")

    pages: Dict[str, PageParser] = {}
    for filename in sorted(actual_html):
        parsed_page = parse_page(root / filename, failures)
        if parsed_page:
            pages[filename] = parsed_page
            if parsed_page.duplicate_ids:
                failures.add(f"{filename}: duplicate IDs: {', '.join(sorted(parsed_page.duplicate_ids)[:5])}")

    uniqueness: Dict[str, Dict[str, List[str]]] = defaultdict(lambda: defaultdict(list))
    for filename in sorted(PUBLIC_FILES & pages.keys()):
        page = pages[filename]
        validate_public_page(filename, page, failures, uniqueness)
        validate_question_markers(filename, page, failures)
        validate_nzqa_content(filename, page, failures)

    for filename in sorted(LEGACY_REDIRECTS):
        page = pages.get(filename)
        if not page:
            failures.add(f"{filename}: legacy redirect shell missing")
            continue
        robots = " ".join(page.meta_name.get("robots", [])).lower()
        if not re.search(r"(?:^|[\s,])noindex(?:$|[\s,])", robots):
            failures.add(f"{filename}: legacy redirect shell must be noindex")

    for field_name, occurrences in uniqueness.items():
        for files in occurrences.values():
            if len(files) > 1:
                failures.add(f"duplicate {field_name}: {', '.join(sorted(files)[:5])}")

    validate_references(root, pages, failures)
    sitemap_urls = parse_sitemap(root, failures)
    validate_sitemap(root, sitemap_urls, failures)
    validate_robots(root, failures)
    if args.head_base and sitemap_urls:
        validate_heads(args.head_base, sitemap_urls, args.head_timeout, args.head_workers, failures)

    if failures.items:
        limit = max(1, args.max_errors)
        print(f"SEO validation failed: {len(failures.items)} issue(s)", file=sys.stderr)
        for message in failures.items[:limit]:
            print(f"- {message}", file=sys.stderr)
        if len(failures.items) > limit:
            print(f"- ... {len(failures.items) - limit} more issue(s); raise --max-errors to show them", file=sys.stderr)
        return 1

    print(
        f"SEO validation passed: {len(PUBLIC_FILES)} public HTML files, "
        f"{len(EXPECTED_SITEMAP_URLS)} sitemap URLs, {len(QUESTION_URLS)} question routes."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
