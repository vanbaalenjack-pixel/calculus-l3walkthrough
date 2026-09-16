#!/usr/bin/env python3
"""Regression tests for the 2026 walkthrough audit remediation.

The checks are deliberately read-only and use only Python's standard library.
They cover the authored audit overlay, its mathematical/domain conclusions, the
official-resource manifest, and the runtime hooks that expose the new schema.
"""

from __future__ import annotations

import cmath
from datetime import date
import html
import json
import math
from pathlib import Path
import re
import unittest
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parent.parent
AUDIT_DATA_PATH = ROOT / "walkthrough-audit-data.js"
RESOURCE_MANIFEST_PATH = ROOT / "official-resources.json"
RUNTIME_PATH = ROOT / "walkthrough-gate.js"
CATALOGUE_PATH = ROOT / "question-catalogue.js"

REVIEW_STATUS = "awaiting-teacher-review"
DIRECT_AUDIT_KEYS = {
    "level-3-complex-2025:1e",
    "level-3-integration-2024:2c",
    "level-3-complex-2023:3c",
    "level-3-complex-2022:1d",
    "level-3-complex-2020:1c",
    "level-3-complex-2021:3d",
    "level-3-differentiation-2024:2e",
    "level-3-integration-2023:3e",
    "level-3-differentiation-2023:3e",
    "level-3-integration-2025:1e",
}
POLAR_AUDIT_KEYS = {
    "level-3-complex-2020:3d",
    "level-3-complex-2021:2d",
    "level-3-complex-2022:3c",
    "level-3-complex-2023:2d",
    "level-3-complex-2024:3d",
}
ALL_AUDIT_KEYS = DIRECT_AUDIT_KEYS | POLAR_AUDIT_KEYS

RICH_SCHEMA_FIELDS = {
    "questionHtml",
    "hints",
    "guidedSteps",
    "checksHtml",
    "markReasoningHtml",
    "finalResultHtml",
    "verificationHtml",
    "commonMistakeHtml",
}


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def balanced_js_segment(source: str, opening_index: int) -> str:
    """Return one balanced JS object/array while ignoring quoted contents.

    The audit data intentionally stores TeX in template literals; ignoring
    braces inside those strings makes this safer than a broad regular expression.
    """

    opening = source[opening_index]
    closing = {"{": "}", "[": "]", "(": ")"}.get(opening)
    if closing is None:
        raise ValueError(f"Expected a bracket at offset {opening_index}")

    depth = 0
    quote: str | None = None
    escaped = False
    line_comment = False
    block_comment = False
    index = opening_index

    while index < len(source):
        char = source[index]
        following = source[index + 1] if index + 1 < len(source) else ""

        if line_comment:
            if char in "\r\n":
                line_comment = False
            index += 1
            continue
        if block_comment:
            if char == "*" and following == "/":
                block_comment = False
                index += 2
            else:
                index += 1
            continue
        if quote is not None:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            index += 1
            continue

        if char == "/" and following == "/":
            line_comment = True
            index += 2
            continue
        if char == "/" and following == "*":
            block_comment = True
            index += 2
            continue
        if char in "'\"`":
            quote = char
            index += 1
            continue
        if char == opening:
            depth += 1
        elif char == closing:
            depth -= 1
            if depth == 0:
                return source[opening_index : index + 1]
        index += 1

    raise ValueError(f"Unclosed {opening!r} at offset {opening_index}")


def object_after_marker(source: str, marker: str) -> str:
    marker_index = source.find(marker)
    if marker_index < 0:
        raise AssertionError(f"Missing JS marker: {marker}")
    object_index = source.find("{", marker_index + len(marker))
    if object_index < 0:
        raise AssertionError(f"Missing object after JS marker: {marker}")
    return balanced_js_segment(source, object_index)


def property_names(js_object: str) -> set[str]:
    return set(re.findall(r"(?m)^\s{4,}([A-Za-z_$][\w$]*)\s*:", js_object))


def compact(source: str) -> str:
    return re.sub(r"\s+", "", html.unescape(source))


def assert_complex_close(
    case: unittest.TestCase,
    actual: complex,
    expected: complex,
    *,
    tolerance: float = 1e-9,
) -> None:
    case.assertLessEqual(abs(actual - expected), tolerance)


class AuditSchemaSourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = read_text(AUDIT_DATA_PATH)

    def test_exactly_the_fifteen_required_walkthroughs_are_registered(self) -> None:
        direct = set(
            re.findall(r'^\s{4}"([^"]+)"\s*:\s*audited\s*\(', self.source, re.MULTILINE)
        )
        polar = set(
            re.findall(
                r'^\s*walkthroughs\["([^"]+)"\]\s*=\s*polarAudit\s*\(',
                self.source,
                re.MULTILINE,
            )
        )
        self.assertEqual(direct, DIRECT_AUDIT_KEYS)
        self.assertEqual(polar, POLAR_AUDIT_KEYS)
        self.assertEqual(direct | polar, ALL_AUDIT_KEYS)

    def test_audited_defaults_publish_schema_and_review_status(self) -> None:
        defaults = object_after_marker(self.source, "return Object.assign(")
        self.assertRegex(defaults, r"auditSchemaVersion\s*:\s*1")
        self.assertRegex(defaults, r"reviewStatus\s*:\s*REVIEW_STATUS")
        self.assertRegex(defaults, r"reviewNotice\s*:")
        self.assertIn(REVIEW_STATUS, self.source)
        self.assertIn("awaiting independent teacher review", defaults)

    def test_each_direct_patch_has_the_complete_rich_schema_and_three_hints(self) -> None:
        for key in sorted(DIRECT_AUDIT_KEYS):
            with self.subTest(key=key):
                block = object_after_marker(self.source, f'"{key}": audited(')
                self.assertTrue(RICH_SCHEMA_FIELDS <= property_names(block))
                hints_marker = re.search(r"(?m)^\s*hints\s*:\s*\[", block)
                self.assertIsNotNone(hints_marker)
                assert hints_marker is not None
                hints_start = block.find("[", hints_marker.start())
                hints = balanced_js_segment(block, hints_start)
                hint_values = re.findall(r"\braw\s*`([^`]*)`", hints)
                self.assertEqual(len(hint_values), 3)
                self.assertTrue(all(value.strip() for value in hint_values))
                self.assertEqual(len({compact(value) for value in hint_values}), 3)
                self.assertGreaterEqual(len(re.findall(r"\bstep\s*\(", block)), 2)

    def test_polar_helper_expands_to_the_same_schema_and_three_hints(self) -> None:
        helper = object_after_marker(self.source, "return audited(")
        self.assertTrue(RICH_SCHEMA_FIELDS <= property_names(helper))
        hints_marker = re.search(r"(?m)^\s*hints\s*:\s*\[", helper)
        self.assertIsNotNone(hints_marker)
        assert hints_marker is not None
        hints = balanced_js_segment(helper, helper.find("[", hints_marker.start()))
        hint_values = re.findall(r"\braw\s*`([^`]*)`", hints)
        self.assertEqual(len(hint_values), 3)
        self.assertTrue(all(value.strip() for value in hint_values))
        self.assertEqual(len({compact(value) for value in hint_values}), 3)
        self.assertGreaterEqual(len(re.findall(r"\bstep\s*\(", helper)), 2)

        option_fields = {
            "questionHtml",
            "nonzeroWorkingHtml",
            "finalResultHtml",
            "verificationHtml",
        }
        for key in sorted(POLAR_AUDIT_KEYS):
            with self.subTest(key=key):
                options = object_after_marker(
                    self.source, f'walkthroughs["{key}"] = polarAudit('
                )
                self.assertTrue(option_fields <= property_names(options))

    def test_corrected_conclusions_are_present_in_the_authored_overlay(self) -> None:
        required_fragments = {
            "level-3-complex-2025:1e": ("21y^2-4x^2=84", r"y\le-2"),
            "level-3-integration-2024:2c": (
                r"y=\frac{1}{6-4e^{3x}}",
                r"x<\frac{\ln(3/2)}3",
            ),
            "level-3-complex-2023:3c": (
                r"-\frac{25}{16}\le w\le\frac{25}{16}",
                "no real solution",
            ),
            "level-3-complex-2022:1d": ("p=4", "p&gt;5"),
            "level-3-complex-2020:1c": (r"g\ge25", "no real solution"),
            "level-3-complex-2021:3d": (r"m\le-\dfrac{25}{36}", "no real solution"),
            "level-3-differentiation-2024:2e": (
                r"x=-\frac23",
                "stationary point of inflection",
            ),
            "level-3-integration-2023:3e": (
                r"y(6)=-\frac43",
                "not uniquely forced",
            ),
            "level-3-differentiation-2023:3e": (
                r"ay''=\sqrt{1+(y')^2}",
                "positive square root",
            ),
            "level-3-integration-2025:1e": (
                r"\ln|y|",
                r"\frac{27}{e^2}",
            ),
        }
        for key, fragments in required_fragments.items():
            with self.subTest(key=key):
                block = compact(object_after_marker(self.source, f'"{key}": audited('))
                for fragment in fragments:
                    self.assertIn(compact(fragment), block)

        polar_expectations = {
            "level-3-complex-2020:3d": ("multiplicity4", "n=0,1,2,3"),
            "level-3-complex-2021:2d": ("multiplicity3", "n=0,1,2"),
            "level-3-complex-2022:3c": ("multiplicity3", "n=0,1,2"),
            "level-3-complex-2023:2d": ("multiplicity3", "n=0,1,2"),
            "level-3-complex-2024:3d": ("multiplicity4", "n=0,1,2,3"),
        }
        for key, fragments in polar_expectations.items():
            with self.subTest(key=key):
                block = compact(
                    object_after_marker(
                        self.source, f'walkthroughs["{key}"] = polarAudit('
                    )
                )
                for fragment in fragments:
                    self.assertIn(fragment, block)


class TrustAndQuestionRenderingTests(unittest.TestCase):
    def catalogue(self) -> dict[str, object]:
        source = read_text(CATALOGUE_PATH)
        start = source.index("{", source.index("window.CALC_NZ_QUESTION_CATALOGUE"))
        return json.loads(balanced_js_segment(source, start))

    def question_records(self) -> list[dict[str, object]]:
        records: list[dict[str, object]] = []
        for level in self.catalogue().get("levels", []):
            for standard in level.get("standards", []):
                for paper in standard.get("papers", []):
                    records.extend(paper.get("questions", []))
        return records

    def test_catalogue_uses_explicit_status_without_legacy_review_claims(self) -> None:
        records = self.question_records()
        self.assertEqual(len(records), 447)
        statuses = [record.get("reviewStatus") for record in records]
        self.assertEqual(statuses.count(REVIEW_STATUS), 15)
        self.assertEqual(statuses.count("unreviewed"), 432)
        self.assertNotIn("teacher-reviewed", statuses)
        self.assertTrue(all("reviewedDate" not in record for record in records))

    def test_generated_visible_content_has_no_unsupported_review_claim(self) -> None:
        prohibited = re.compile(
            r"\b(?:NZQA[- ]verified|mathematically verified|independently checked|"
            r"teacher[- ]reviewed|verified (?:method|catalogue))\b",
            re.IGNORECASE,
        )
        failures: list[str] = []
        for path in sorted(ROOT.glob("*.html")):
            match = prohibited.search(read_text(path))
            if match:
                failures.append(f"{path.name}: {match.group(0)!r}")
        catalogue_match = prohibited.search(read_text(CATALOGUE_PATH))
        if catalogue_match:
            failures.append(f"{CATALOGUE_PATH.name}: {catalogue_match.group(0)!r}")
        self.assertEqual(failures, [])

    def test_question_display_math_does_not_contain_sentence_length_prose(self) -> None:
        violations: list[str] = []
        prose_word = re.compile(r"[A-Za-z][A-Za-z'-]*")
        text_command = re.compile(r"\\text\s*\{([^{}]*)\}")
        question_math = re.compile(
            r'<div\b[^>]*class=["\'][^"\']*\bquestion-math\b[^"\']*["\'][^>]*>'
            r"([\s\S]*?)</div>",
            re.IGNORECASE,
        )
        for path in sorted(ROOT.glob("*-data.js")):
            if path == AUDIT_DATA_PATH:
                continue
            source = read_text(path)
            for match in question_math.finditer(source):
                prose_segments = text_command.findall(match.group(1))
                words = [word for segment in prose_segments for word in prose_word.findall(segment)]
                sentence_punctuation = any(
                    re.search(r"[.!?]", segment) and len(prose_word.findall(segment)) >= 2
                    for segment in prose_segments
                )
                if len(words) >= 6 or sentence_punctuation:
                    line = source.count("\n", 0, match.start()) + 1
                    violations.append(
                        f"{path.name}:{line} embeds {len(words)} prose words in display math"
                    )
        self.assertEqual(violations, [])

    def test_named_mobile_regression_uses_semantic_instruction_prose(self) -> None:
        source = read_text(ROOT / "complex-2023-data.js")
        start = source.index('"3c": createConfig(')
        end = source.index('"3d": createConfig(', start)
        block = source[start:end]
        self.assertIn("question-instruction", block)
        match = re.search(
            r'<div\b[^>]*\bquestion-math\b[^>]*>([\s\S]*?)</div>', block
        )
        self.assertIsNotNone(match)
        assert match is not None
        self.assertNotIn(r"\text{", match.group(1))

    def test_generated_walkthroughs_load_the_audit_overlay_before_the_runtime(self) -> None:
        pages = sorted(ROOT.glob("*.html"))
        audited_pages = 0
        for path in pages:
            source = read_text(path)
            overlay = source.find('src="walkthrough-audit-data.js')
            runtime = source.find('src="walkthrough-gate.js')
            if overlay < 0:
                continue
            audited_pages += 1
            self.assertGreater(runtime, overlay, path.name)
        self.assertEqual(audited_pages, 335)

    def test_homepage_defaults_selection_and_quick_practice_to_level_three(self) -> None:
        source = read_text(ROOT / "index-page.js")
        self.assertIn(
            'const initialSelection = hashSelection || makeSelection(levelsById["level-3"] ? "level-3" : null);',
            source,
        )
        self.assertIn('scope.value === "level:level-3"', source)
        self.assertIn('? "level:level-3"', source)


class CorrectedMathematicsTests(unittest.TestCase):
    def test_2025_complex_locus_keeps_only_the_lower_hyperbola_branch(self) -> None:
        def distance_difference(x: float, y: float) -> float:
            return math.hypot(x, y - 5) - math.hypot(x, y + 5)

        for y in (-2.0, -3.0, -6.0):
            x_squared = (21 * y * y - 84) / 4
            self.assertGreaterEqual(x_squared, 0)
            for x in ({0.0} if x_squared == 0 else {math.sqrt(x_squared), -math.sqrt(x_squared)}):
                self.assertAlmostEqual(21 * y * y - 4 * x * x, 84)
                self.assertAlmostEqual(distance_difference(x, y), 4)

        upper_y = 3.0
        upper_x = math.sqrt((21 * upper_y * upper_y - 84) / 4)
        self.assertAlmostEqual(distance_difference(upper_x, upper_y), -4)

    def test_2024_integration_ivp_has_a_singularity_before_one_third(self) -> None:
        singular_x = math.log(3 / 2) / 3

        def solution(x: float) -> float:
            return 1 / (6 - 4 * math.exp(3 * x))

        def derivative(x: float) -> float:
            denominator = 6 - 4 * math.exp(3 * x)
            return 12 * math.exp(3 * x) / (denominator * denominator)

        self.assertLess(0, singular_x)
        self.assertLess(singular_x, 1 / 3)
        self.assertAlmostEqual(6 - 4 * math.exp(3 * singular_x), 0)
        self.assertAlmostEqual(solution(0), 0.5)
        for x in (-0.7, 0.0, 0.1):
            self.assertAlmostEqual(derivative(x), 12 * solution(x) ** 2 * math.exp(3 * x))
        self.assertAlmostEqual(solution(1 / 3), 1 / (6 - 4 * math.e))
        self.assertAlmostEqual(solution(1 / 3), -0.2052070795680825)

    def test_2023_complex_radical_formula_has_the_exact_w_domain(self) -> None:
        def candidate(w: float) -> float | None:
            if not (-25 / 16 <= w <= 25 / 16):
                return None
            return ((25 + 16 * w) / 80) ** 2

        for w in (-25 / 16, -1.0, 0.0, 1.0, 25 / 16):
            x = candidate(w)
            self.assertIsNotNone(x)
            assert x is not None
            self.assertGreaterEqual(x, 0)
            self.assertGreaterEqual(4 * x - w, -1e-12)
            self.assertAlmostEqual(4 * math.sqrt(max(0, 4 * x - w)), 5 - 8 * math.sqrt(x))
        self.assertIsNone(candidate(-25 / 16 - 1e-9))
        self.assertIsNone(candidate(25 / 16 + 1e-9))

    def test_2022_complex_solution_count_enforces_nonnegative_substitution(self) -> None:
        def solutions(p: float) -> list[float]:
            if p < 4:
                return []
            radius = math.sqrt(p - 4)
            admissible_u = {round(u, 14) for u in (1 + radius, 1 - radius) if u >= 0}
            return [u * u - p for u in sorted(admissible_u)]

        expected_counts = {3.9: 0, 4.0: 1, 4.5: 2, 5.0: 2, 5.1: 1, 9.0: 1}
        for p, expected_count in expected_counts.items():
            values = solutions(p)
            self.assertEqual(len(values), expected_count)
            for x in values:
                self.assertGreaterEqual(x + p, -1e-12)
                self.assertAlmostEqual(x - 2 * math.sqrt(max(0, x + p)), -5)

    def test_2020_complex_radical_formula_requires_g_at_least_25(self) -> None:
        def candidate(g: float) -> float | None:
            return ((25 + g) / 20) ** 2 if g >= 25 else None

        for g in (25.0, 30.0, 100.0):
            x = candidate(g)
            assert x is not None
            self.assertAlmostEqual(2 * math.sqrt(x) - 5, math.sqrt(4 * x - g))
        self.assertIsNone(candidate(25 - 1e-9))
        extraneous_x = ((25 + 0) / 20) ** 2
        self.assertNotAlmostEqual(2 * math.sqrt(extraneous_x) - 5, math.sqrt(4 * extraneous_x))

    def test_2021_complex_radical_formula_requires_m_at_most_negative_25_over_36(self) -> None:
        def candidate(m: float) -> float | None:
            return 0.5 * ((25 - 36 * m) / 60) ** 2 if m <= -25 / 36 else None

        for m in (-5.0, -1.0, -25 / 36):
            x = candidate(m)
            assert x is not None
            self.assertAlmostEqual(
                6 * math.sqrt(2 * x) - 5,
                6 * math.sqrt(max(0, 2 * x + m)),
                delta=1e-7,
            )
        self.assertIsNone(candidate(-25 / 36 + 1e-9))
        extraneous_x = 0.5 * (25 / 60) ** 2
        self.assertNotAlmostEqual(
            6 * math.sqrt(2 * extraneous_x) - 5,
            6 * math.sqrt(2 * extraneous_x),
        )

    def test_2024_differentiation_stationary_point_does_not_turn(self) -> None:
        k = 8 / 3

        def derivative(x: float) -> float:
            return math.exp(3 * x) * (6 * x * x + 3 * k * x + k) / (2 * x + k) ** 2

        stationary_x = -2 / 3
        self.assertAlmostEqual(derivative(stationary_x), 0)
        self.assertGreater(derivative(stationary_x - 0.1), 0)
        self.assertGreater(derivative(stationary_x + 0.1), 0)
        self.assertAlmostEqual(
            6 * stationary_x * stationary_x + 3 * k * stationary_x + k,
            0,
        )

    def test_2023_implicit_equation_accepts_but_does_not_force_smooth_continuation(self) -> None:
        def branch(x: float) -> float:
            return (2 - x) / 3

        def residual(x: float, y: float, y_prime: float) -> float:
            return (1 - x * x) * (1 + y) * y_prime + (1 - x) * (1 - y * y)

        for x in (2.0, 4.9, 5.0, 5.1, 6.0):
            self.assertAlmostEqual(residual(x, branch(x), -1 / 3), 0)
        self.assertAlmostEqual(branch(6), -4 / 3)
        self.assertEqual(branch(5), -1)
        for arbitrary_slope in (-100.0, 0.0, 37.0):
            self.assertAlmostEqual(residual(5, -1, arbitrary_slope), 0)

    def test_2023_catenary_uses_the_positive_square_root(self) -> None:
        for a, x in ((0.5, -1.2), (1.0, 0.0), (3.0, 4.0)):
            exp_pos = math.exp(x / a)
            exp_neg = math.exp(-x / a)
            y_prime = (exp_pos - exp_neg) / 2
            a_y_second = (exp_pos + exp_neg) / 2
            self.assertGreater(a, 0)
            self.assertGreater(a_y_second, 0)
            self.assertAlmostEqual(a_y_second * a_y_second, 1 + y_prime * y_prime)
            self.assertAlmostEqual(a_y_second, math.sqrt(1 + y_prime * y_prime))

    def test_2025_integration_branch_retains_absolute_value_and_interval(self) -> None:
        def solution(x: float) -> float:
            return 3 * math.exp(-x) * (1 + x) ** 2

        def derivative(x: float) -> float:
            return 3 * math.exp(-x) * (1 + x) * (1 - x)

        def in_relevant_interval(x: float) -> bool:
            return x > -1

        self.assertAlmostEqual(solution(0), 3)
        self.assertAlmostEqual(solution(2), 27 / math.e**2)
        for x in (-0.9, 0.0, 0.8, 2.0, 7.0):
            y = solution(x)
            self.assertGreater(y, 0)
            self.assertAlmostEqual(y - x * y - (1 + x) * derivative(x), 0)
        self.assertFalse(in_relevant_interval(-1))
        self.assertFalse(in_relevant_interval(-2))
        self.assertTrue(in_relevant_interval(2))


class PolarZeroAndNonzeroTests(unittest.TestCase):
    SPECS = {
        "level-3-complex-2020:3d": {
            "degree": 4,
            "scale": lambda k: 2 * k**2,
            "angle": lambda n: math.pi / 4 + n * math.pi / 2,
            "rhs": lambda k: complex(-16 * k**8, 0),
        },
        "level-3-complex-2021:2d": {
            "degree": 3,
            "scale": lambda k: 2 ** (1 / 6) * k**2,
            "angle": lambda n: math.pi / 12 + 2 * n * math.pi / 3,
            "rhs": lambda k: k**6 * (1 + 1j),
        },
        "level-3-complex-2022:3c": {
            "degree": 3,
            "scale": lambda k: k**2,
            "angle": lambda n: -math.pi / 6 + 2 * n * math.pi / 3,
            "rhs": lambda k: -1j * k**6,
        },
        "level-3-complex-2023:2d": {
            "degree": 3,
            "scale": lambda m: 4 * m**4,
            "angle": lambda n: math.pi / 3 + 2 * n * math.pi / 3,
            "rhs": lambda m: complex(-64 * m**12, 0),
        },
        "level-3-complex-2024:3d": {
            "degree": 4,
            "scale": lambda k: 3 * k**2,
            "angle": lambda n: math.pi / 4 + n * math.pi / 2,
            "rhs": lambda k: complex(-81 * k**8, 0),
        },
    }

    def test_zero_parameter_has_one_root_with_the_polynomial_multiplicity(self) -> None:
        for key, spec in self.SPECS.items():
            with self.subTest(key=key):
                degree = spec["degree"]
                roots = [0j]
                self.assertEqual(len(roots), 1)
                self.assertEqual(roots[0] ** degree, spec["rhs"](0))
                self.assertIn(degree, (3, 4))

    def test_every_nonzero_polar_root_satisfies_its_original_equation(self) -> None:
        for key, spec in self.SPECS.items():
            degree = spec["degree"]
            for parameter in (-1.7, 0.4, 2.0):
                roots = [
                    cmath.rect(spec["scale"](parameter), spec["angle"](n))
                    for n in range(degree)
                ]
                with self.subTest(key=key, parameter=parameter):
                    self.assertEqual(len(roots), degree)
                    for root in roots:
                        assert_complex_close(self, root**degree, spec["rhs"](parameter))
                    for left_index, left in enumerate(roots):
                        for right in roots[left_index + 1 :]:
                            self.assertGreater(abs(left - right), 1e-9)


class OfficialResourceManifestTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.manifest = json.loads(read_text(RESOURCE_MANIFEST_PATH))

    def test_manifest_has_all_and_only_supported_standard_year_groups(self) -> None:
        expected_years = {
            "AS91577": {str(year) for year in range(2017, 2026)},
            "AS91578": {str(year) for year in range(2016, 2026)},
            "AS91579": {str(year) for year in range(2017, 2026)},
        }
        standards = self.manifest.get("standards")
        self.assertIsInstance(standards, dict)
        self.assertEqual(set(standards), set(expected_years))
        for standard, years in expected_years.items():
            self.assertEqual(set(standards[standard]), years)
        self.assertEqual(sum(len(years) for years in standards.values()), 28)

    def test_manifest_check_date_source_and_availability_status_are_explicit(self) -> None:
        checked = date.fromisoformat(self.manifest["checkedDate"])
        self.assertLessEqual(checked, date.today())
        self.assertIn("Official NZQA", self.manifest["source"])

        allowed_unavailable = {
            "examination paper",
            "assessment schedule",
            "assessment report",
            "exemplars",
        }
        singular_by_kind = {
            "paper": "examination paper",
            "schedule": "assessment schedule",
            "report": "assessment report",
            "exemplar": "exemplars",
        }
        for standard, years in self.manifest["standards"].items():
            for year, group in years.items():
                with self.subTest(standard=standard, year=year):
                    self.assertEqual(set(group), {"resources", "unavailable"})
                    self.assertIsInstance(group["resources"], list)
                    self.assertIsInstance(group["unavailable"], list)
                    self.assertTrue(group["resources"] or group["unavailable"])
                    self.assertTrue(set(group["unavailable"]) <= allowed_unavailable)
                    available_kinds = {resource["kind"] for resource in group["resources"]}
                    for kind in available_kinds:
                        self.assertNotIn(singular_by_kind[kind], group["unavailable"])

    def test_every_resource_uses_the_official_https_host_and_matching_format(self) -> None:
        allowed_kinds = {"paper", "schedule", "report", "exemplar"}
        seen_urls: set[str] = set()
        for standard, years in self.manifest["standards"].items():
            for year, group in years.items():
                for resource in group["resources"]:
                    with self.subTest(standard=standard, year=year, label=resource.get("label")):
                        self.assertEqual(
                            set(resource), {"kind", "label", "url", "format"}
                        )
                        self.assertIn(resource["kind"], allowed_kinds)
                        self.assertIn(str(year), resource["label"])
                        parsed = urlsplit(resource["url"])
                        self.assertEqual(parsed.scheme, "https")
                        self.assertEqual(parsed.hostname, "www.nzqa.govt.nz")
                        self.assertTrue(parsed.path.startswith("/nqfdocs/ncea-resource/"))
                        expected_format = parsed.path.rsplit(".", 1)[-1].upper()
                        self.assertIn(expected_format, {"PDF", "ZIP"})
                        self.assertEqual(resource["format"], expected_format)
                        self.assertNotIn(resource["url"], seen_urls)
                        seen_urls.add(resource["url"])
        self.assertGreaterEqual(len(seen_urls), 50)

    def test_recent_years_have_paper_schedule_and_report_and_2024_exemplars(self) -> None:
        for standard, years in self.manifest["standards"].items():
            for year in ("2021", "2022", "2023", "2024", "2025"):
                kinds = [resource["kind"] for resource in years[year]["resources"]]
                with self.subTest(standard=standard, year=year):
                    self.assertTrue({"paper", "schedule", "report"} <= set(kinds))
                    if year == "2024":
                        self.assertEqual(kinds.count("exemplar"), 3)


class RuntimeContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.source = read_text(RUNTIME_PATH)

    def test_runtime_defines_and_renders_all_four_self_assessment_outcomes(self) -> None:
        for outcome in (
            "solved-independently",
            "solved-with-hint",
            "needed-walkthrough",
            "retry-later",
        ):
            self.assertIn(f'"{outcome}"', self.source)
        self.assertIn("WALKTHROUGH_ASSESSMENT_OUTCOMES", self.source)
        self.assertIn("walkthrough-self-assessment", self.source)
        self.assertIn("setupWalkthroughSelfAssessment", self.source)
        self.assertRegex(self.source, r"markWalkthroughPartProgress\([^)]*\{[\s\S]*?assessment\s*:")

    def test_legacy_completed_state_is_migrated_without_remaining_binary_state(self) -> None:
        normaliser_start = self.source.index("function normaliseWalkthroughProgressMap")
        normaliser_end = self.source.index("\nfunction readWalkthroughProgressMap", normaliser_start)
        normaliser = self.source[normaliser_start:normaliser_end]
        self.assertIn("state.completed && !state.assessment", normaliser)
        self.assertIn('state.assessment = "needed-walkthrough"', normaliser)
        self.assertIn("state.reviewed = true", normaliser)
        self.assertIn("state.migratedFromCompleted = true", normaliser)
        self.assertIn('delete state.completed', normaliser)

    def test_exam_mode_removes_pending_state_and_neutralises_answer_cues(self) -> None:
        self.assertIn('classList.remove("exam-mode-pending")', self.source)
        self.assertIn('neutralHeading || "Exam question"', self.source)
        self.assertIn("originalDocumentTitle", self.source)
        self.assertIn('document.title = shouldHideWalkthrough ? neutralHeading + " | Calc.nz"', self.source)
        self.assertIn("exam-mode-hidden", self.source)

    def test_overflow_enhancement_makes_long_katex_display_math_accessible(self) -> None:
        self.assertIn("function enhanceWalkthroughMathOverflow", self.source)
        self.assertIn('querySelectorAll(".katex-display")', self.source)
        self.assertIn("display.scrollWidth > region.clientWidth + 2", self.source)
        self.assertIn('region.setAttribute("role", "region")', self.source)
        self.assertIn('region.setAttribute("tabindex", "0")', self.source)
        self.assertIn('region.setAttribute("aria-label", "Scrollable mathematical expression")', self.source)
        self.assertIn("Scroll to see the full equation", self.source)

    def test_runtime_validates_and_applies_the_audited_schema(self) -> None:
        self.assertIn("function validateAuditedWalkthroughConfig", self.source)
        self.assertIn("config.auditSchemaVersion !== 1", self.source)
        self.assertIn(f'config.reviewStatus !== "{REVIEW_STATUS}"', self.source)
        for field in RICH_SCHEMA_FIELDS - {"questionHtml", "hints", "guidedSteps"}:
            self.assertIn(f'"{field}"', self.source)
        self.assertIn("function applyWalkthroughAuditRemediation", self.source)
        self.assertIn("window.CALC_NZ_AUDIT_WALKTHROUGHS", self.source)


if __name__ == "__main__":
    unittest.main(verbosity=2)
