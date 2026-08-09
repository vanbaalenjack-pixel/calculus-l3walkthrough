#!/usr/bin/env python3
"""Focused tests for new generator outputs without rewriting the site."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import re
import sys
import tempfile
import unittest
from unittest import mock
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parent.parent


def load_script_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


BUILD_SEO = load_script_module("calc_nz_build_seo_contract", ROOT / "scripts" / "build-seo.py")
VISUAL_ASSETS = load_script_module(
    "calc_nz_visual_asset_contract", ROOT / "scripts" / "check-visual-assets.py"
)
LEGACY_COMPLEX = load_script_module(
    "calc_nz_legacy_complex_contract",
    ROOT / "scripts" / "legacy_complex_redirects.py",
)


class BuildSeoContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.routes = BUILD_SEO.discover_routes(BUILD_SEO.load_catalogue())

    @staticmethod
    def guide_payload() -> str:
        return json.dumps(
            {
                "schemaVersion": 1,
                "guides": [
                    {
                        "slug": "complex-conjugates",
                        "title": "Complex conjugates",
                        "summary": "Understand conjugates and connect the idea to exact NCEA Complex Numbers practice.",
                        "subject": "Complex Numbers",
                        "standardKey": "level-3-complex",
                        "skillSlugs": ["complex-number-algebra"],
                        "author": "Calc.nz",
                        "reviewedDate": "2026-08-08",
                        "directAnswer": "<p>The conjugate of \\(a+bi\\) is \\(a-bi\\).</p>",
                        "sections": [
                            {
                                "id": "why-it-works",
                                "heading": "Why the conjugate works",
                                "html": "<p>Multiplying a complex number by its conjugate removes the imaginary part and gives a real modulus-squared value.</p>",
                            },
                            {
                                "id": "worked-example",
                                "heading": "Worked example",
                                "html": "<p>Change the sign of the imaginary part, multiply carefully, and then simplify the resulting real expression.</p>",
                            },
                        ],
                        "relatedConcepts": [],
                        "practiceQuestionIds": ["2025:1a"],
                        "sources": [
                            {
                                "label": "Official NZQA Mathematics and Statistics material",
                                "href": "https://www2.nzqa.govt.nz/ncea/subjects/select-subject/mathematics-and-statistics/",
                            }
                        ],
                        "toc": True,
                    }
                ],
            }
        )

    def test_metadata_uses_complete_icon_set_and_optimized_social_image(self) -> None:
        metadata = BUILD_SEO.metadata_body(
            title="Test | Calc.nz",
            description="A test description.",
            canonical="https://calc.nz/test.html",
            structured_data={"@context": "https://schema.org", "@type": "WebPage"},
        )
        expected_links = (
            '<link rel="icon" href="/favicon.ico" sizes="48x48">',
            '<link rel="icon" href="/assets/favicon-48.png" type="image/png" sizes="48x48">',
            '<link rel="icon" href="/assets/favicon-192.png" type="image/png" sizes="192x192">',
            '<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" sizes="180x180">',
        )
        for link in expected_links:
            self.assertEqual(metadata.count(link), 1)
        self.assertIn(
            'content="https://calc.nz/assets/calc-nz-social.jpg"', metadata
        )
        self.assertNotIn("calc-nz-social.png", metadata)

        self.assertEqual(
            VISUAL_ASSETS.jpeg_dimensions(ROOT / "assets" / "calc-nz-social.jpg"),
            (1200, 630),
        )
        self.assertLess(
            (ROOT / "assets" / "calc-nz-social.jpg").stat().st_size,
            739_031 // 2,
        )
        self.assertFalse((ROOT / "assets" / "calc-nz-social.png").exists())
        self.assertEqual(VISUAL_ASSETS.ico_dimensions(ROOT / "favicon.ico"), (48, 48))

        about_date = BUILD_SEO.PAGE_MODIFIED_DATES["about.html"]
        self.assertIn(
            f'<time datetime="{about_date}">{BUILD_SEO.human_date(about_date)}</time>',
            BUILD_SEO.about_page(),
        )

    def test_empty_registry_publishes_search_but_no_guides(self) -> None:
        guides = BUILD_SEO.load_guides('{"schemaVersion":1,"guides":[]}')
        self.assertEqual(guides, [])
        records = BUILD_SEO.static_search_records(self.routes, guides)
        self.assertEqual(
            {record["type"] for record in records},
            {"Standard", "Paper", "Skill"},
        )
        search_html = BUILD_SEO.search_page(self.routes, guides)
        self.assertIn('role="search"', search_html)
        self.assertIn('type="search"', search_html)
        self.assertIn('src="search-core.js?', search_html)
        self.assertIn('src="search-page.js?', search_html)
        self.assertNotIn('src="question-catalogue.js?', search_html)
        self.assertNotIn('href="guides.html"', search_html)
        self.assertNotIn('>Guides</a>', BUILD_SEO.site_header(guides_published=False))

        not_found = BUILD_SEO.not_found_page(guides_published=False)
        self.assertIn('content="noindex,follow"', not_found)
        self.assertIn('href="search.html">Search Calc.nz</a>', not_found)
        self.assertNotIn('href="guides.html"', not_found)
        self.assertNotRegex(not_found, r"(?i)http-equiv=[\"']refresh")

    def test_method_labels_are_complete_and_browser_titles_stay_concise(self) -> None:
        for route in self.routes:
            with self.subTest(route=route.route_path):
                method_title = BUILD_SEO.question_method_title(route)
                self.assertTrue(method_title)
                self.assertLessEqual(len(method_title), 44)
                self.assertNotRegex(method_title, r"[,;:\-]$")
                self.assertNotIn("…", method_title)
                self.assertLessEqual(len(BUILD_SEO.question_browser_title(route)), 105)
        titles_by_route = {
            route.route_path: BUILD_SEO.question_method_title(route)
            for route in self.routes
        }
        self.assertEqual(
            titles_by_route["int-3e2024.html"], "Newton’s Law of Cooling"
        )
        self.assertEqual(
            titles_by_route["complex-2024.html?q=2c"], "Complex Modulus"
        )
        expected_semantic_titles = {
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
        for route_path, expected_title in expected_semantic_titles.items():
            self.assertEqual(titles_by_route[route_path], expected_title)
        expected_plain_fragments = {
            "2a2024.html": "dy/dt divided by dx/dt",
            "2d2024.html": "ln x divided by x",
            "3a2021.html": "cot x and csc squared x",
            "complex-2024.html?q=3e": "x + 1 divided by x",
        }
        for route_path, expected_fragment in expected_plain_fragments.items():
            method_plain = BUILD_SEO.meta_plain(
                next(route.focus for route in self.routes if route.route_path == route_path)
            )
            self.assertIn(expected_fragment, method_plain)
            self.assertNotIn("fraction", method_plain)
        for skill in BUILD_SEO.SKILL_SPECS.values():
            matching = BUILD_SEO.routes_for_skill(self.routes, skill.slug)
            skill_page = BUILD_SEO.skill_page(skill, self.routes)
            card_methods = re.findall(
                r'<a class="nav-btn index-link-card"[^>]* data-skill-method="([^"]+)"',
                skill_page,
            )
            self.assertEqual(
                sorted(card_methods),
                sorted(BUILD_SEO.question_method_title(route) for route in matching),
            )

    def test_substantive_guide_gets_article_learning_resource_architecture(self) -> None:
        guides = BUILD_SEO.load_guides(self.guide_payload())
        self.assertEqual(len(guides), 1)
        guide = guides[0]
        page = BUILD_SEO.guide_page(guide, self.routes)
        self.assertIn('content="article"', page)
        self.assertRegex(
            page,
            r'"@type"\s*:\s*\[\s*"Article",\s*"LearningResource"\s*\]',
        )
        self.assertIn("Formula and idea summary", page)
        self.assertIn("Practise this concept", page)
        self.assertIn("2025 Question 1(a)", page)
        self.assertIn("Sources and review", page)
        self.assertIn('href="guides.html"', page)
        self.assertIn("katex@0.16.11/dist/katex.min.css", page)
        self.assertIn("katex@0.16.11/dist/contrib/auto-render.min.js", page)
        self.assertIn("renderMathInElement", page)
        self.assertNotRegex(page, r'\boutput\s*:\s*["\']html["\']')
        guide_record = next(
            record
            for record in BUILD_SEO.static_search_records(self.routes, guides)
            if record["type"] == "Guide"
        )
        self.assertIn("modulus-squared", guide_record["keywords"])
        standard = BUILD_SEO.STANDARDS[guide.standard_key]
        standard_routes = [
            route for route in self.routes if route.standard_key == guide.standard_key
        ]
        self.assertIn(
            f'href="{guide.filename}"',
            BUILD_SEO.standard_page(standard, standard_routes, guides),
        )
        skill = BUILD_SEO.SKILL_SPECS[guide.skill_slugs[0]]
        self.assertIn(
            f'href="{guide.filename}"',
            BUILD_SEO.skill_page(skill, self.routes, guides),
        )
        matched_route = next(
            route
            for route in standard_routes
            if route.year == 2025 and route.question_id == "1a"
        )
        self.assertIn(
            f'href="{guide.filename}"',
            BUILD_SEO.question_summary(matched_route, standard_routes, guides),
        )
        self.assertEqual(
            BUILD_SEO.question_page_record(matched_route, guides)["question"]["guideLinks"],
            [{"href": guide.filename, "title": guide.title}],
        )
        with self.assertRaisesRegex(ValueError, "not substantive enough"):
            BUILD_SEO.load_guides(
                self.guide_payload().replace(
                    '"sections": [{', '"sections": [], "unusedSections": [{', 1
                )
            )

        no_math_payload = json.loads(self.guide_payload())
        no_math_payload["guides"][0]["directAnswer"] = (
            "<p>A conjugate changes the sign of the imaginary part.</p>"
        )
        no_math_guide = BUILD_SEO.load_guides(json.dumps(no_math_payload))[0]
        self.assertNotIn(
            "katex@", BUILD_SEO.guide_page(no_math_guide, self.routes)
        )

    def test_guide_registry_rejects_unsafe_publication_relationships(self) -> None:
        def rejected(mutator, message: str) -> None:
            payload = json.loads(self.guide_payload())
            mutator(payload["guides"][0])
            with self.assertRaisesRegex(ValueError, message):
                BUILD_SEO.load_guides(json.dumps(payload))

        rejected(
            lambda guide: guide.update(practiceQuestionIds=[]),
            "at least one practice question",
        )
        rejected(
            lambda guide: guide.update(reviewedDate="2026-02-30"),
            "invalid reviewedDate",
        )
        rejected(
            lambda guide: guide["sections"][1].update(id="why-it-works"),
            "duplicate section id",
        )
        rejected(
            lambda guide: guide.update(toc="yes"),
            "toc must be true or false",
        )
        rejected(
            lambda guide: guide.update(skillSlugs=["chain-rule"]),
            "skills outside level-3-complex",
        )

        payload = json.loads(self.guide_payload())
        payload["guides"][0]["practiceQuestionIds"] = ["2099:1a"]
        guide = BUILD_SEO.load_guides(json.dumps(payload))[0]
        with self.assertRaisesRegex(ValueError, "unknown or mismatched"):
            BUILD_SEO.validate_guide_relationships([guide], self.routes)

    def test_removed_guides_are_reported_as_orphan_outputs(self) -> None:
        guide = BUILD_SEO.load_guides(self.guide_payload())[0]
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "guides.html").write_text("stale", encoding="utf-8")
            (root / "guide-old-topic.html").write_text("stale", encoding="utf-8")
            self.assertEqual(
                {path.name for path in BUILD_SEO.unexpected_guide_outputs([], root)},
                {"guides.html", "guide-old-topic.html"},
            )
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "guides.html").write_text("current", encoding="utf-8")
            (root / guide.filename).write_text("current", encoding="utf-8")
            self.assertEqual(
                BUILD_SEO.unexpected_guide_outputs([guide], root), ()
            )
            (root / "guide-old-topic.html").write_text("stale", encoding="utf-8")
            self.assertEqual(
                [
                    path.name
                    for path in BUILD_SEO.unexpected_guide_outputs([guide], root)
                ],
                ["guide-old-topic.html"],
            )

    def test_sitemap_dates_are_per_page_and_legacy_migration_stays_dormant(self) -> None:
        with mock.patch.object(
            BUILD_SEO,
            "question_content_lastmod",
            side_effect=lambda _route: "2026-07-19",
        ):
            sitemap = BUILD_SEO.sitemap_xml(self.routes, [])
        document = ET.fromstring(sitemap)
        entries = []
        for url_element in document:
            values = {
                child.tag.rsplit("}", 1)[-1]: child.text or ""
                for child in url_element
            }
            entries.append((values.get("loc", ""), values.get("lastmod", "")))
        self.assertEqual(len(entries), 498)
        self.assertTrue(all(re.fullmatch(r"20\d{2}-\d{2}-\d{2}", date_value) for _, date_value in entries))
        self.assertGreater(len({date_value for _, date_value in entries}), 1)
        urls = {url for url, _date_value in entries}
        self.assertIn("https://calc.nz/search.html", urls)
        self.assertNotIn("https://calc.nz/guides.html", urls)
        self.assertNotIn("https://calc.nz/404.html", urls)
        parameter_urls = {url for url in urls if "?q=" in url}
        expected_parameter_urls = {
            "https://calc.nz" + mapping.source_url
            for mapping in LEGACY_COMPLEX.LEGACY_COMPLEX_REDIRECTS
        }
        self.assertEqual(parameter_urls, expected_parameter_urls)
        self.assertFalse(LEGACY_COMPLEX.EDGE_REDIRECTS_ACTIVE)
        self.assertFalse(any(
            re.fullmatch(r"/complex-[1-3][a-e]20(?:1[7-9]|2[0-4])\.html", urlsplit(url).path)
            for url in urls
        ))

        guides = BUILD_SEO.load_guides(self.guide_payload())
        with mock.patch.object(
            BUILD_SEO,
            "question_content_lastmod",
            side_effect=lambda _route: "2026-07-19",
        ):
            guide_sitemap = BUILD_SEO.sitemap_xml(self.routes, guides)
        guide_document = ET.fromstring(guide_sitemap)
        guide_entries = {
            next(
                child.text for child in url_element
                if child.tag.rsplit("}", 1)[-1] == "loc"
            ): next(
                child.text for child in url_element
                if child.tag.rsplit("}", 1)[-1] == "lastmod"
            )
            for url_element in guide_document
        }
        self.assertEqual(len(guide_entries), 500)
        self.assertEqual(
            guide_entries["https://calc.nz/guides.html"], "2026-08-08"
        )
        self.assertEqual(
            guide_entries["https://calc.nz/guide-complex-conjugates.html"],
            "2026-08-08",
        )


if __name__ == "__main__":
    unittest.main()
