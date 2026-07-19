#!/usr/bin/env python3
"""Verified skill-page content and catalogue classification for Calc.nz.

This module deliberately classifies only skills that are well represented by
the wording in ``question-catalogue.js``.  Classification is deterministic: a
question must belong to one of the declared standards and its ``method`` text
must match an explicit pattern.  There is no inference from question number,
grade, or position in a paper.

The module has no third-party dependencies.  It can be imported by the static
site generator, or run directly to audit the current catalogue::

    python3 scripts/skill_content.py
"""

from __future__ import annotations

import argparse
import html
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Mapping, Optional, Sequence


CATALOGUE_GLOBAL = "CALC_NZ_QUESTION_CATALOGUE"
EXPECTED_CATALOGUE_QUESTION_COUNT = 447

KNOWN_STANDARD_IDS = frozenset(
    {
        "level-2-algebra",
        "level-2-calculus",
        "level-3-complex",
        "level-3-differentiation",
        "level-3-integration",
    }
)


@dataclass(frozen=True)
class MistakeRule:
    """A safe common-mistake statement tied to catalogue method wording."""

    patterns: tuple[str, ...]
    text: str

    def matches(self, method: str) -> bool:
        value = normalise_method(method)
        return any(re.search(pattern, value, flags=re.IGNORECASE) for pattern in self.patterns)


@dataclass(frozen=True)
class SkillSpec:
    """Content and classification rules for one substantial skill page."""

    slug: str
    title_label: str
    short_label: str
    intro: str
    explanation: str
    meta_description: str
    standard_ids: tuple[str, ...]
    classification_patterns: tuple[str, ...]
    common_mistake_guidance: str
    mistake_rules: tuple[MistakeRule, ...]
    neutral_common_mistake: str
    min_count: int
    related_skill_slugs: tuple[str, ...]

    @property
    def h1(self) -> str:
        return self.title_label

    @property
    def label(self) -> str:
        """A generator-friendly alias for ``title_label``."""

        return self.title_label

    @property
    def page_href(self) -> str:
        return f"skill-{self.slug}.html"

    def matches(self, method: str, standard_id: str) -> bool:
        if standard_id not in self.standard_ids:
            return False
        value = normalise_method(method)
        return any(
            re.search(pattern, value, flags=re.IGNORECASE)
            for pattern in self.classification_patterns
        )


def _mistake(patterns: Sequence[str], text: str) -> MistakeRule:
    return MistakeRule(tuple(patterns), text)


_SKILL_SPEC_SEQUENCE = (
    SkillSpec(
        slug="chain-rule",
        title_label="Chain Rule",
        short_label="Chain rule",
        intro=(
            "Practise differentiating composite functions across powers, roots, "
            "logarithms, trigonometric functions, and exponential functions."
        ),
        explanation=(
            "The matched questions explicitly use the chain rule, sometimes after "
            "rewriting a root or negative power. They then apply the derivative to "
            "gradients, stationary points, rates, or second-derivative reasoning."
        ),
        meta_description=(
            "Practise NCEA Level 3 chain rule questions from AS91578, including "
            "composite powers, roots, logarithms and trigonometric functions."
        ),
        standard_ids=("level-3-differentiation",),
        classification_patterns=(
            r"\bchain[- ]rule\b",
            r"\bchain rules\b",
        ),
        common_mistake_guidance=(
            "Use only warnings supported by the matched composite-function wording; "
            "do not attach chain-rule advice to a method selected for another rule."
        ),
        mistake_rules=(
            _mistake(
                (r"\bchain[- ]rule\b", r"\bchain rules\b"),
                "Differentiate the outer expression while retaining the inner "
                "expression, then multiply by the inner derivative.",
            ),
            _mistake(
                (r"\b(?:square|fourth) root\b", r"\bradicals?\b", r"\bnegative powers?\b"),
                "After rewriting a root or reciprocal as a power, keep the new "
                "exponent and any negative sign consistent through differentiation.",
            ),
            _mistake(
                (r"\btrig", r"\blogarithm", r"\bexponential\b"),
                "For a trigonometric, logarithmic, or exponential composite, include "
                "the derivative of its complete inside expression.",
            ),
        ),
        neutral_common_mistake=(
            "Check that every composite layer has been differentiated and that the "
            "inner derivative is present before simplifying."
        ),
        min_count=12,
        related_skill_slugs=(
            "product-quotient-rules",
            "related-rates",
            "stationary-points-optimisation",
            "parametric-differentiation",
        ),
    ),
    SkillSpec(
        slug="product-quotient-rules",
        title_label="Product and Quotient Rules",
        short_label="Product and quotient rules",
        intro=(
            "Practise differentiating products and quotients, including questions "
            "where one factor or expression also needs the chain rule."
        ),
        explanation=(
            "The matched methods cover both product-rule terms and the ordered "
            "quotient-rule numerator. The resulting derivatives are used for "
            "tangents, normals, rates, stationary points, and proofs."
        ),
        meta_description=(
            "Practise NCEA Level 3 product and quotient rule questions from AS91578, "
            "with worked examples involving tangents, rates and stationary points."
        ),
        standard_ids=("level-3-differentiation",),
        classification_patterns=(
            r"\bproduct rule\b",
            r"\bproduct and chain rules\b",
            r"\bquotient rule\b",
        ),
        common_mistake_guidance=(
            "Select product and quotient warnings independently from the method "
            "wording, and mention a nested chain rule only when it is explicit."
        ),
        mistake_rules=(
            _mistake(
                (r"\bproduct rule\b", r"\bproduct and chain rules\b"),
                "Keep both product-rule terms: differentiate one factor at a time "
                "while leaving the other factor unchanged.",
            ),
            _mistake(
                (r"\bquotient rule\b",),
                "Keep the quotient-rule numerator in the correct order and square "
                "the original denominator before simplifying.",
            ),
            _mistake(
                (r"\bchain rule\b", r"\bchain rules\b"),
                "A factor can still be composite, so apply its inner derivative "
                "inside the product or quotient rule."
            ),
        ),
        neutral_common_mistake=(
            "Write the full rule structure before simplifying so no product term or "
            "quotient factor is lost."
        ),
        min_count=12,
        related_skill_slugs=(
            "chain-rule",
            "stationary-points-optimisation",
        ),
    ),
    SkillSpec(
        slug="related-rates",
        title_label="Related Rates",
        short_label="Related rates",
        intro=(
            "Practise connecting changing geometric or physical quantities through "
            "a shared equation and rates measured with respect to time."
        ),
        explanation=(
            "The catalogue includes sphere, cone, angle, height, area, and motion "
            "contexts. Each matched method is explicitly identified as related rates, "
            "so the grouping does not infer the topic from a generic rate question."
        ),
        meta_description=(
            "Practise NCEA Level 3 related-rates questions from AS91578 across "
            "geometry, motion, volume, surface-area and angle contexts."
        ),
        standard_ids=("level-3-differentiation",),
        classification_patterns=(r"\brelated rates\b",),
        common_mistake_guidance=(
            "Keep advice limited to explicitly labelled related-rates methods and "
            "preserve the signs and units supplied by each problem."
        ),
        mistake_rules=(
            _mistake(
                (r"\brelated rates\b",),
                "Differentiate the relationship with respect to time before "
                "substituting values from the particular instant."
            ),
            _mistake(
                (r"\b(?:volume|surface area|height|radius)\b",),
                "Keep each geometric quantity distinct and attach the correct units "
                "to its rate of change."
            ),
            _mistake(
                (r"\bangle\b",),
                "For an angular rate, differentiate the trigonometric relationship "
                "before evaluating the angle and other measurements."
            ),
        ),
        neutral_common_mistake=(
            "Differentiate before substituting the instant's values, and keep each "
            "rate's sign, variable, and units clear."
        ),
        min_count=8,
        related_skill_slugs=(
            "chain-rule",
            "stationary-points-optimisation",
        ),
    ),
    SkillSpec(
        slug="stationary-points-optimisation",
        title_label="Stationary Points and Optimisation",
        short_label="Stationary points and optimisation",
        intro=(
            "Practise finding and classifying stationary or critical points, then "
            "using derivative evidence to maximise or minimise a model."
        ),
        explanation=(
            "The matched Level 2 and Level 3 methods include derivative sign, first- "
            "and second-derivative classification, graph interpretation, and "
            "optimisation in geometric or contextual domains."
        ),
        meta_description=(
            "Practise stationary-point and optimisation questions from NCEA Level 2 "
            "Calculus AS91262 and Level 3 Differentiation AS91578."
        ),
        standard_ids=("level-2-calculus", "level-3-differentiation"),
        classification_patterns=(
            r"\bstationary\b",
            r"\bturning[- ]point",
            r"\bcritical points?\b",
            r"\boptimi[sz]",
            r"\bmaximi[sz]",
            r"\bminimi[sz]",
            r"\bmaximum(?:[- ]volume)?\b",
            r"\bminimum\b",
            r"\blargest possible\b",
        ),
        common_mistake_guidance=(
            "Distinguish finding a candidate, classifying it, and proving an optimum; "
            "surface only the stages named in the selected methods."
        ),
        mistake_rules=(
            _mistake(
                (r"\bstationary\b", r"\bcritical points?\b", r"\bturning[- ]point"),
                "Solving the derivative condition finds a candidate; use the original "
                "function when a coordinate is also required."
            ),
            _mistake(
                (r"\bclassif", r"\bsecond derivative\b", r"\bderivative sign\b"),
                "Do not label a maximum, minimum, or stationary inflection without "
                "the sign or derivative evidence requested by the question."
            ),
            _mistake(
                (r"\boptimi[sz]", r"\bmaximi[sz]", r"\bminimi[sz]", r"\blargest possible\b"),
                "Check the model's domain and interpret the admissible optimum in "
                "context rather than reporting every algebraic candidate."
            ),
        ),
        neutral_common_mistake=(
            "A zero derivative gives a candidate; classification or an optimisation "
            "claim still needs the required evidence and a domain check."
        ),
        min_count=15,
        related_skill_slugs=(
            "chain-rule",
            "product-quotient-rules",
            "related-rates",
            "parametric-differentiation",
        ),
    ),
    SkillSpec(
        slug="parametric-differentiation",
        title_label="Parametric Differentiation",
        short_label="Parametric differentiation",
        intro=(
            "Practise finding gradients and tangent information when both coordinates "
            "are expressed using a parameter."
        ),
        explanation=(
            "The matched methods explicitly use parametric gradients, tangent "
            "equations, gradient conditions, or parametric first and second "
            "derivatives."
        ),
        meta_description=(
            "Practise NCEA Level 3 parametric differentiation questions from AS91578, "
            "including gradients, tangents and second derivatives."
        ),
        standard_ids=("level-3-differentiation",),
        classification_patterns=(r"\bparametric\b",),
        common_mistake_guidance=(
            "Use the standard parametric-gradient warning for all matched methods, "
            "and add second-derivative advice only when the method names it."
        ),
        mistake_rules=(
            _mistake(
                (r"\bparametric\b",),
                "Form the gradient as \(dy/dx=(dy/dt)/(dx/dt)\), keeping both "
                "derivatives at the same parameter value."
            ),
            _mistake(
                (r"\bsecond derivatives?\b",),
                "For a parametric second derivative, differentiate \(dy/dx\) with "
                "respect to the parameter and divide by \(dx/dt\) again."
            ),
            _mistake(
                (r"\btangent\b", r"\bgradient condition\b"),
                "After solving for the parameter, substitute it consistently into "
                "both coordinates before writing the tangent information."
            ),
        ),
        neutral_common_mistake=(
            "Do not reverse \(dy/dt\) and \(dx/dt\), and evaluate both coordinates "
            "and the gradient at the same parameter value."
        ),
        min_count=8,
        related_skill_slugs=(
            "chain-rule",
            "stationary-points-optimisation",
        ),
    ),
    SkillSpec(
        slug="antidifferentiation",
        title_label="Antidifferentiation",
        short_label="Antidifferentiation",
        intro=(
            "Practise recovering a function from its derivative or rate, including "
            "power, logarithmic, exponential, motion, and initial-condition examples."
        ),
        explanation=(
            "The matched methods explicitly name antidifferentiation, antiderivatives, "
            "or integration of a derivative, gradient, rate, velocity, or acceleration. "
            "They include both Level 2 Calculus and Level 3 Integration questions."
        ),
        meta_description=(
            "Practise antidifferentiation from NCEA Level 2 Calculus AS91262 and Level "
            "3 Integration AS91579, including rates and initial conditions."
        ),
        standard_ids=("level-2-calculus", "level-3-integration"),
        classification_patterns=(
            r"\bantidifferentiat",
            r"\bantiderivatives?\b",
            r"\bintegration constant\b",
            r"\bintegrating (?:a |an |the )?(?:derivative|gradient|rate(?: function)?|velocity|acceleration)\b",
            r"\b(?:building|turning) velocity (?:and (?:distance|displacement) )?from acceleration\b",
            r"\bintegrating (?:an? )?(?:linear|exponential|polynomial|reciprocal(?:-square)?|square-root|radical) (?:term|terms)\b",
            r"\bintegrating polynomial and exponential terms\b",
            r"\bintegrating a power\b",
            r"\bsplitting an integral into .+ antiderivatives\b",
            r"\bpower, constant, and logarithmic antiderivatives\b",
            r"\bnegative powers and the integration constant\b",
        ),
        common_mistake_guidance=(
            "Tie constant and initial-condition warnings to the matched wording, and "
            "do not imply that a definite-integral question needs an added constant."
        ),
        mistake_rules=(
            _mistake(
                (r"\binitial condition\b", r"\bposition condition\b", r"\bfitting? the constant\b", r"\bpoint on the graph\b"),
                "Include the constant of integration, then use the supplied point or "
                "initial condition to determine it."
            ),
            _mistake(
                (r"\bvelocity\b", r"\bacceleration\b", r"\brate function\b"),
                "Track which quantity is being recovered from the rate and keep the "
                "initial value and units attached to that quantity."
            ),
            _mistake(
                (r"\bpower\b", r"\bnegative powers?\b", r"\bsquare-root\b", r"\bradical\b"),
                "For a power antiderivative, increase the exponent and divide by the "
                "new exponent before applying any condition."
            ),
        ),
        neutral_common_mistake=(
            "For an indefinite integral, retain the constant of integration and use "
            "the supplied condition when one is available."
        ),
        min_count=10,
        related_skill_slugs=(
            "integration-techniques",
            "differential-equations",
        ),
    ),
    SkillSpec(
        slug="integration-techniques",
        title_label="Integration Techniques",
        short_label="Integration techniques",
        intro=(
            "Practise choosing and preparing an integration method from the structure "
            "of the integrand or from tabulated numerical data."
        ),
        explanation=(
            "The matched methods explicitly include reverse-chain patterns, "
            "substitution, trigonometric identities, algebraic rewriting, logarithmic "
            "forms, and the Trapezium or Simpson's Rule."
        ),
        meta_description=(
            "Practise NCEA Level 3 integration techniques from AS91579, including "
            "reverse chain rule, substitution, trig identities and numerical rules."
        ),
        standard_ids=("level-3-integration",),
        classification_patterns=(
            r"\breverse (?:chain[- ]rule|derivative|sec-tan|trigonometric)",
            r"\breversing (?:the )?chain rule",
            r"\bsubstitution\b",
            r"\bproduct-to-sum\b",
            r"\b(?:trig(?:onometric)?|double-angle|squared-trigonometric) identit",
            r"\blogarithmic (?:antiderivatives?|integration|substitution)",
            r"\brational integrand\b",
            r"\brational function\b",
            r"\balgebraic division\b",
            r"\bdecomposing a rational\b",
            r"\b(?:expanding|simplifying|rewriting) .+ before integrating",
            r"\brewriting .+ before evaluating",
            r"\bsplitting an integral\b",
            r"\bsplitting .+ antiderivatives\b",
            r"\bsec-tan\b",
            r"\btrapezium rule\b",
            r"\bsimpson['’]s rule\b",
            r"\bfactor cancellation\b",
        ),
        common_mistake_guidance=(
            "Select warnings by the named technique. Do not present numerical-rule "
            "advice beside an exact-integration method, or vice versa."
        ),
        mistake_rules=(
            _mistake(
                (r"\breverse (?:chain[- ]rule|derivative|sec-tan|trigonometric)", r"\breversing (?:the )?chain rule"),
                "Check the derivative of the inner expression and account for any "
                "constant factor when reversing a chain-rule pattern."
            ),
            _mistake(
                (r"\bsubstitution\b",),
                "Transform the full integrand under the substitution, including the "
                "differential and any definite-integral limits."
            ),
            _mistake(
                (r"\bproduct-to-sum\b", r"\b(?:trig(?:onometric)?|double-angle|squared-trigonometric) identit"),
                "Apply the trigonometric identity before integrating and preserve its "
                "constant factors."
            ),
            _mistake(
                (r"\brational integrand\b", r"\brational function\b", r"\balgebraic division\b", r"\bdecomposing a rational\b"),
                "Simplify, divide, or decompose the rational expression before "
                "integrating; verify that the rewritten form is equivalent."
            ),
            _mistake(
                (r"\btrapezium rule\b", r"\bsimpson['’]s rule\b"),
                "Use the stated spacing and coefficient pattern, and keep all given "
                "ordinates in their correct order."
            ),
        ),
        neutral_common_mistake=(
            "Match the method to the integrand's structure and complete any algebraic "
            "or trigonometric preparation before integrating."
        ),
        min_count=15,
        related_skill_slugs=(
            "antidifferentiation",
            "differential-equations",
        ),
    ),
    SkillSpec(
        slug="differential-equations",
        title_label="Differential Equations",
        short_label="Differential equations",
        intro=(
            "Practise solving separable differential equations and verifying proposed "
            "relationships with first or second derivatives."
        ),
        explanation=(
            "The matched Integration methods explicitly name separation or a "
            "differential equation, while matched Differentiation methods verify or "
            "prove a differential-equation relationship."
        ),
        meta_description=(
            "Practise NCEA Level 3 differential-equation questions from AS91578 and "
            "AS91579, including separation, initial conditions and verification."
        ),
        standard_ids=("level-3-differentiation", "level-3-integration"),
        classification_patterns=(
            r"\bdifferential[- ]equation\b",
            r"\bseparat(?:ing|able)\b",
        ),
        common_mistake_guidance=(
            "Distinguish solving from verification using the matched method and never "
            "claim a model type that the catalogue wording does not identify."
        ),
        mistake_rules=(
            _mistake(
                (r"\bseparat(?:ing|able)\b",),
                "Separate the variables consistently before integrating, without "
                "dropping factors that belong with either differential."
            ),
            _mistake(
                (r"\bcondition\b", r"\bmodel\b"),
                "Retain the integration constant and apply the supplied condition, "
                "then check the resulting branch and domain in context."
            ),
            _mistake(
                (r"\b(?:verifying|proving|proof-style)\b",),
                "For verification, calculate the required derivatives and substitute "
                "them into both sides of the stated differential equation."
            ),
        ),
        neutral_common_mistake=(
            "Keep constants and conditions explicit, and check the final relationship "
            "against the original differential equation."
        ),
        min_count=10,
        related_skill_slugs=(
            "antidifferentiation",
            "integration-techniques",
        ),
    ),
    SkillSpec(
        slug="complex-number-algebra",
        title_label="Complex-number Algebra",
        short_label="Complex-number algebra",
        intro=(
            "Practise exact algebra with complex numbers, conjugates, real and "
            "imaginary parts, polynomials, quadratics, surds, and radical equations."
        ),
        explanation=(
            "The matched AS91577 methods explicitly identify complex-number "
            "operations or the polynomial, discriminant, conjugate, rationalising, "
            "surd, and radical techniques used in the standard."
        ),
        meta_description=(
            "Practise NCEA Level 3 complex-number algebra from AS91577, including "
            "conjugates, polynomial roots, discriminants, surds and exact equations."
        ),
        standard_ids=("level-3-complex",),
        classification_patterns=(
            r"\bcomplex\b",
            r"\bconjugat",
            r"\breal and imaginary parts\b",
            r"\breal or imaginary parts\b",
            r"\bcorresponding parts\b",
            r"\bcomplex parts\b",
            r"\bfactor theorem\b",
            r"\bremainder theorem\b",
            r"\bpolynomial (?:division|long division)",
            r"\bcubic (?:factor|relation)",
            r"\bfactorising a cubic\b",
            r"\bmatching coefficients\b",
            r"\bvieta",
            r"\bcompleting the square\b",
            r"\bdiscriminant\b",
            r"\bsurd\b",
            r"\bradical equation\b",
            r"\brationalis",
            r"\bquadratic (?:has|with|in terms|roots?)",
        ),
        common_mistake_guidance=(
            "Choose warnings from the named algebraic operation. In particular, do "
            "not use a polar-form warning for a rectangular-form calculation."
        ),
        mistake_rules=(
            _mistake(
                (r"\bconjugat", r"\brationalis", r"\bcomplex (?:fraction|quotient|division)"),
                "When using a conjugate, change only the sign of the imaginary part "
                "and multiply the complete numerator and denominator."
            ),
            _mistake(
                (r"\breal and imaginary parts\b", r"\breal or imaginary parts\b", r"\bcorresponding parts\b", r"\bcomplex parts\b"),
                "Collect real and imaginary components separately before equating "
                "their corresponding coefficients."
            ),
            _mistake(
                (r"\bfactor theorem\b", r"\bremainder theorem\b", r"\bpolynomial", r"\bcubic", r"\bvieta"),
                "Keep the divisor, root, and remainder signs consistent, then verify "
                "the factorisation or reconstructed polynomial."
            ),
            _mistake(
                (r"\bsurd\b", r"\bradical equation\b"),
                "After isolating and squaring a radical, check real-domain restrictions "
                "and reject any extraneous solution."
            ),
            _mistake(
                (r"\bdiscriminant\b", r"\bcompleting the square\b"),
                "Preserve exact signs and parameter conditions when using the "
                "discriminant or completing the square."
            ),
        ),
        neutral_common_mistake=(
            "Keep real and imaginary components separate, preserve conjugate signs, "
            "and check exact algebra before interpreting the result."
        ),
        min_count=30,
        related_skill_slugs=("polar-form-de-moivre",),
    ),
    SkillSpec(
        slug="polar-form-de-moivre",
        title_label="Polar Form and De Moivre’s Theorem",
        short_label="Polar form and De Moivre",
        intro=(
            "Practise modulus-and-argument calculations, polar or cis form, powers, "
            "and complete sets of complex roots."
        ),
        explanation=(
            "The matched AS91577 methods explicitly mention polar form, cis form, "
            "arguments, or De Moivre's theorem. This excludes generic modulus and "
            "Argand-diagram questions that do not identify a polar method."
        ),
        meta_description=(
            "Practise NCEA Level 3 polar form and De Moivre questions from AS91577, "
            "including arguments, powers and complete sets of complex roots."
        ),
        standard_ids=("level-3-complex",),
        classification_patterns=(
            r"\bpolar form\b",
            r"\bcis\b",
            r"\bde moivre['’]s theorem\b",
            r"\bprincipal argument\b",
            r"\bargument condition\b",
            r"\bfinding its argument\b",
            r"\bfind(?:ing)? (?:its|the) argument\b",
            r"\bsubtracting arguments\b",
            r"\badding arguments\b",
            r"\bmodulus and argument\b",
        ),
        common_mistake_guidance=(
            "Use root-count advice only for methods that name roots, and use argument "
            "range or quadrant advice only when the method names an argument."
        ),
        mistake_rules=(
            _mistake(
                (r"\bargument\b",),
                "Choose the argument from the correct quadrant and within the range "
                "required by the question."
            ),
            _mistake(
                (r"\bdividing\b", r"\bsubtracting arguments\b"),
                "When dividing in polar form, divide the moduli and subtract the "
                "arguments in a consistent order."
            ),
            _mistake(
                (r"\bmultiplying\b", r"\badding arguments\b"),
                "When multiplying in polar form, multiply the moduli and add the "
                "arguments before normalising the angle if required."
            ),
            _mistake(
                (r"\broots?\b",),
                "List the complete set of roots with evenly spaced arguments rather "
                "than stopping after the principal value."
            ),
            _mistake(
                (r"\bde moivre['’]s theorem\b",),
                "Apply the power to the modulus and multiply the argument by the same "
                "power before converting form."
            ),
        ),
        neutral_common_mistake=(
            "Keep modulus and argument operations separate, and check the quadrant and "
            "required argument range before giving the final form."
        ),
        min_count=12,
        related_skill_slugs=("complex-number-algebra",),
    ),
)

# Public, ordered mapping used by generators.  Dict insertion order is stable
# on every supported Python version.
SKILL_SPECS: dict[str, SkillSpec] = {
    spec.slug: spec for spec in _SKILL_SPEC_SEQUENCE
}
SUPPORTED_SKILL_SLUGS = tuple(SKILL_SPECS)


@dataclass(frozen=True)
class QuestionFact:
    standard_id: str
    method: str
    reference: str = ""
    year: Optional[int] = None
    question_id: str = ""


@dataclass(frozen=True)
class ClassifiedQuestion:
    question: QuestionFact
    skill_slugs: tuple[str, ...]


@dataclass(frozen=True)
class SkillCoverage:
    slug: str
    count: int
    standard_ids: tuple[str, ...]
    examples: tuple[str, ...]


@dataclass(frozen=True)
class SkillCoverageReport:
    question_count: int
    coverage: tuple[SkillCoverage, ...]
    errors: tuple[str, ...]

    @property
    def ok(self) -> bool:
        return not self.errors

    @property
    def counts(self) -> dict[str, int]:
        return {item.slug: item.count for item in self.coverage}

    def raise_for_errors(self) -> None:
        if self.errors:
            raise ValueError("Skill catalogue validation failed:\n- " + "\n- ".join(self.errors))


def normalise_method(method: str) -> str:
    """Normalise presentation differences without changing mathematical words."""

    if not isinstance(method, str):
        raise TypeError("question method must be a string")
    value = html.unescape(method).casefold()
    value = value.replace("‘", "'").replace("’", "'")
    value = value.replace("–", "-").replace("—", "-")
    return re.sub(r"\s+", " ", value).strip()


def classify_question(method: str, standard_id: str) -> tuple[str, ...]:
    """Return supported skill slugs in stable display order.

    A method can belong to more than one skill, for example a product-rule
    stationary-point question.  Unknown standards and blank methods classify to
    an empty tuple; the validation functions report unknown standards separately.
    """

    if not isinstance(standard_id, str):
        raise TypeError("standard_id must be a string")
    value = normalise_method(method)
    if not value:
        return ()
    standard = standard_id.strip()
    return tuple(
        spec.slug
        for spec in _SKILL_SPEC_SEQUENCE
        if spec.matches(value, standard)
    )


def classify_records(records: Iterable[QuestionFact]) -> tuple[ClassifiedQuestion, ...]:
    """Classify already-flattened catalogue records."""

    return tuple(
        ClassifiedQuestion(
            question=record,
            skill_slugs=classify_question(record.method, record.standard_id),
        )
        for record in records
    )


def catalogue_questions(catalogue: Mapping[str, object]) -> tuple[QuestionFact, ...]:
    """Flatten the JSON-compatible catalogue document into question facts."""

    levels = catalogue.get("levels")
    if not isinstance(levels, list):
        raise ValueError("catalogue levels must be a list")

    records: list[QuestionFact] = []
    for level in levels:
        if not isinstance(level, Mapping):
            raise ValueError("every catalogue level must be an object")
        standards = level.get("standards")
        if not isinstance(standards, list):
            raise ValueError("every catalogue level must contain a standards list")
        for standard in standards:
            if not isinstance(standard, Mapping):
                raise ValueError("every catalogue standard must be an object")
            standard_id = standard.get("id")
            if not isinstance(standard_id, str) or not standard_id.strip():
                raise ValueError("every catalogue standard must have a string id")
            papers = standard.get("papers")
            if not isinstance(papers, list):
                raise ValueError(f"{standard_id}: papers must be a list")
            for paper in papers:
                if not isinstance(paper, Mapping):
                    raise ValueError(f"{standard_id}: every paper must be an object")
                year = paper.get("year")
                if not isinstance(year, int):
                    raise ValueError(f"{standard_id}: paper year must be an integer")
                questions = paper.get("questions")
                if not isinstance(questions, list):
                    raise ValueError(f"{standard_id}/{year}: questions must be a list")
                for question in questions:
                    if not isinstance(question, Mapping):
                        raise ValueError(
                            f"{standard_id}/{year}: every question must be an object"
                        )
                    method = question.get("method")
                    question_id = question.get("id")
                    href = question.get("href")
                    if not isinstance(method, str) or not method.strip():
                        raise ValueError(
                            f"{standard_id}/{year}/{question_id}: method must be text"
                        )
                    if not isinstance(question_id, str) or not question_id.strip():
                        raise ValueError(
                            f"{standard_id}/{year}: question id must be text"
                        )
                    reference = (
                        href
                        if isinstance(href, str) and href.strip()
                        else f"{standard_id}/{year}/{question_id}"
                    )
                    records.append(
                        QuestionFact(
                            standard_id=standard_id.strip(),
                            method=method.strip(),
                            reference=reference,
                            year=year,
                            question_id=question_id.strip(),
                        )
                    )
    return tuple(records)


def classify_catalogue(
    catalogue: Mapping[str, object],
) -> tuple[ClassifiedQuestion, ...]:
    """Flatten and classify a parsed ``question-catalogue.js`` payload."""

    return classify_records(catalogue_questions(catalogue))


def synthesise_common_mistakes(
    skill_slug: str,
    methods: Iterable[str],
    limit: int = 3,
) -> tuple[str, ...]:
    """Return method-supported, deterministic common-mistake statements.

    ``methods`` should be the methods selected for the skill page.  If none of
    the more specific rules matches, the skill's neutral and mathematically
    relevant fallback is returned instead of an unrelated warning.
    """

    if skill_slug not in SKILL_SPECS:
        raise KeyError(f"unknown skill slug: {skill_slug}")
    if limit < 1:
        return ()
    selected_methods = tuple(normalise_method(method) for method in methods)
    spec = SKILL_SPECS[skill_slug]
    statements = tuple(
        rule.text
        for rule in spec.mistake_rules
        if any(rule.matches(method) for method in selected_methods)
    )
    return statements[:limit] or (spec.neutral_common_mistake,)


def validate_skill_specs() -> tuple[str, ...]:
    """Validate static spec relationships, standards, slugs, and regex patterns."""

    errors: list[str] = []
    slugs = set(SKILL_SPECS)
    for spec in _SKILL_SPEC_SEQUENCE:
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", spec.slug):
            errors.append(f"{spec.slug!r}: invalid public slug")
        if spec.min_count < 1:
            errors.append(f"{spec.slug}: min_count must be positive")
        unknown_standards = set(spec.standard_ids) - KNOWN_STANDARD_IDS
        if unknown_standards:
            errors.append(
                f"{spec.slug}: unknown standards {sorted(unknown_standards)!r}"
            )
        unknown_related = set(spec.related_skill_slugs) - slugs
        if unknown_related:
            errors.append(
                f"{spec.slug}: unknown related skills {sorted(unknown_related)!r}"
            )
        if spec.slug in spec.related_skill_slugs:
            errors.append(f"{spec.slug}: a skill cannot relate to itself")
        if not spec.classification_patterns:
            errors.append(f"{spec.slug}: no classification patterns")
        if not spec.mistake_rules or not spec.neutral_common_mistake:
            errors.append(f"{spec.slug}: common-mistake guidance is incomplete")
        patterns = list(spec.classification_patterns)
        patterns.extend(
            pattern
            for rule in spec.mistake_rules
            for pattern in rule.patterns
        )
        for pattern in patterns:
            try:
                re.compile(pattern, flags=re.IGNORECASE)
            except re.error as error:
                errors.append(f"{spec.slug}: invalid regex {pattern!r}: {error}")
    return tuple(errors)


def _coverage(
    records: Sequence[QuestionFact],
) -> tuple[tuple[ClassifiedQuestion, ...], tuple[SkillCoverage, ...]]:
    classified = classify_records(records)
    items: list[SkillCoverage] = []
    for slug in SUPPORTED_SKILL_SLUGS:
        matches = [item for item in classified if slug in item.skill_slugs]
        observed_standards = tuple(
            standard_id
            for standard_id in SKILL_SPECS[slug].standard_ids
            if any(item.question.standard_id == standard_id for item in matches)
        )
        examples = tuple(
            (
                f"{item.question.reference}: {item.question.method}"
                if item.question.reference
                else item.question.method
            )
            for item in matches[:3]
        )
        items.append(
            SkillCoverage(
                slug=slug,
                count=len(matches),
                standard_ids=observed_standards,
                examples=examples,
            )
        )
    return classified, tuple(items)


def validate_minimum_counts(records: Iterable[QuestionFact]) -> tuple[str, ...]:
    """Report supported skills whose catalogue count is below its safe minimum."""

    materialised = tuple(records)
    _, coverage = _coverage(materialised)
    return tuple(
        f"{item.slug}: {item.count} questions, minimum is {SKILL_SPECS[item.slug].min_count}"
        for item in coverage
        if item.count < SKILL_SPECS[item.slug].min_count
    )


def validate_standards(records: Iterable[QuestionFact]) -> tuple[str, ...]:
    """Report unknown standards or declared skill standards without a match."""

    materialised = tuple(records)
    classified, coverage = _coverage(materialised)
    errors: list[str] = []
    unknown = sorted(
        {record.standard_id for record in materialised} - KNOWN_STANDARD_IDS
    )
    if unknown:
        errors.append(f"catalogue contains unknown standards: {unknown!r}")

    by_slug = {item.slug: item for item in coverage}
    for spec in _SKILL_SPEC_SEQUENCE:
        observed = set(by_slug[spec.slug].standard_ids)
        missing = set(spec.standard_ids) - observed
        if missing:
            errors.append(
                f"{spec.slug}: no classified question for declared standards "
                f"{sorted(missing)!r}"
            )
        outside = {
            item.question.standard_id
            for item in classified
            if spec.slug in item.skill_slugs
        } - set(spec.standard_ids)
        if outside:
            errors.append(
                f"{spec.slug}: classified questions outside declared standards "
                f"{sorted(outside)!r}"
            )
    return tuple(errors)


def validate_skill_coverage(
    records: Iterable[QuestionFact],
    expected_question_count: Optional[int] = None,
) -> SkillCoverageReport:
    """Return one combined static, count, and standard validation report."""

    materialised = tuple(records)
    _, coverage = _coverage(materialised)
    errors = list(validate_skill_specs())
    errors.extend(validate_minimum_counts(materialised))
    errors.extend(validate_standards(materialised))
    if (
        expected_question_count is not None
        and len(materialised) != expected_question_count
    ):
        errors.append(
            f"catalogue has {len(materialised)} questions; expected "
            f"{expected_question_count}"
        )
    return SkillCoverageReport(
        question_count=len(materialised),
        coverage=coverage,
        errors=tuple(errors),
    )


def load_catalogue(path: Path) -> Mapping[str, object]:
    """Read the single JSON-compatible assignment in question-catalogue.js."""

    source = path.read_text(encoding="utf-8")
    assignment = re.fullmatch(
        rf"\s*(?:/\*[\s\S]*?\*/\s*)?window\.{CATALOGUE_GLOBAL}\s*=\s*"
        rf"(?P<payload>\{{[\s\S]*\}})\s*;\s*",
        source,
    )
    if assignment is None:
        raise ValueError(
            f"{path}: expected one JSON-compatible window.{CATALOGUE_GLOBAL} assignment"
        )
    document = json.loads(assignment.group("payload"))
    if not isinstance(document, Mapping):
        raise ValueError(f"{path}: catalogue payload must be an object")
    return document


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "catalogue",
        nargs="?",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "question-catalogue.js",
        help="path to question-catalogue.js",
    )
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = _build_parser().parse_args(argv)
    catalogue = load_catalogue(args.catalogue)
    records = catalogue_questions(catalogue)
    report = validate_skill_coverage(
        records,
        expected_question_count=EXPECTED_CATALOGUE_QUESTION_COUNT,
    )
    print(f"questions: {report.question_count}")
    for item in report.coverage:
        standards = ", ".join(item.standard_ids)
        print(f"{item.slug}: {item.count} [{standards}]")
        for example in item.examples:
            print(f"  - {example}")
    if report.errors:
        print("validation errors:")
        for error in report.errors:
            print(f"  - {error}")
        return 1
    print("skill coverage validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
