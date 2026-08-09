#!/usr/bin/env python3
"""Focused regression tests for the dormant Complex URL migration contract."""

from pathlib import Path
import sys
import unittest


SCRIPT_DIRECTORY = Path(__file__).resolve().parent
if str(SCRIPT_DIRECTORY) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIRECTORY))

from legacy_complex_redirects import (  # noqa: E402
    EDGE_REDIRECTS_ACTIVE,
    LEGACY_COMPLEX_REDIRECTS,
    LEGACY_YEARS,
    QUESTION_PARTS,
    redirect_target,
    validate_redirect_contract,
)


REPOSITORY_ROOT = SCRIPT_DIRECTORY.parent


class LegacyComplexRedirectTests(unittest.TestCase):
    def test_contract_is_complete_unique_and_inactive(self) -> None:
        self.assertFalse(EDGE_REDIRECTS_ACTIVE)
        self.assertEqual(len(LEGACY_COMPLEX_REDIRECTS), 120)

        sources = [mapping.source_url for mapping in LEGACY_COMPLEX_REDIRECTS]
        destinations = [
            mapping.destination_path for mapping in LEGACY_COMPLEX_REDIRECTS
        ]
        self.assertEqual(len(sources), len(set(sources)))
        self.assertEqual(len(destinations), len(set(destinations)))

        expected_pairs = {
            (year, part) for year in range(2017, 2025) for part in QUESTION_PARTS
        }
        actual_pairs = {
            (mapping.year, mapping.part)
            for mapping in LEGACY_COMPLEX_REDIRECTS
        }
        self.assertEqual(LEGACY_YEARS, tuple(range(2017, 2025)))
        self.assertEqual(
            QUESTION_PARTS,
            tuple(
                f"{question}{letter}"
                for question in range(1, 4)
                for letter in "abcde"
            ),
        )
        self.assertEqual(actual_pairs, expected_pairs)

    def test_paths_follow_static_question_naming_and_do_not_collide(self) -> None:
        for mapping in LEGACY_COMPLEX_REDIRECTS:
            with self.subTest(source=mapping.source_url):
                self.assertRegex(
                    mapping.source_url,
                    r"^/complex-20(?:1[7-9]|2[0-4])\.html\?q=[1-3][a-e]$",
                )
                self.assertRegex(
                    mapping.destination_path,
                    r"^/complex-[1-3][a-e]20(?:1[7-9]|2[0-4])\.html$",
                )
                self.assertTrue(
                    (REPOSITORY_ROOT / mapping.source_path.lstrip("/")).is_file()
                )
                self.assertFalse(
                    (
                        REPOSITORY_ROOT
                        / mapping.destination_path.lstrip("/")
                    ).exists()
                )

    def test_target_preserves_non_question_parameters(self) -> None:
        self.assertEqual(
            redirect_target(
                "https://calc.nz/complex-2024.html"
                "?q=2e&mode=guided&utm_source=bookmark"
            ),
            "https://calc.nz/complex-2e2024.html"
            "?mode=guided&utm_source=bookmark",
        )
        self.assertEqual(
            redirect_target("/complex-2017.html?theme=dark&q=1a&theme=large"),
            "/complex-1a2017.html?theme=dark&theme=large",
        )

    def test_unrelated_or_invalid_urls_do_not_map(self) -> None:
        invalid_urls = (
            "/complex-2016.html?q=1a",
            "/complex-2025.html?q=1a",
            "/complex-2024.html",
            "/complex-2024.html?q=4a",
            "/complex-2024.html?q=2f",
            "/differentiation-2024.html?q=2e",
        )
        for url in invalid_urls:
            with self.subTest(url=url):
                self.assertIsNone(redirect_target(url))

    def test_full_contract_validator_passes(self) -> None:
        validate_redirect_contract(REPOSITORY_ROOT)


if __name__ == "__main__":
    unittest.main()
