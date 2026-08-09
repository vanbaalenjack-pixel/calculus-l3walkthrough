#!/usr/bin/env python3
"""Authoritative, inactive migration contract for legacy Complex question URLs.

GitHub Pages cannot apply this query-string-aware redirect contract.  The data in
this module is preparation for a future edge migration; importing or running it
does not create pages, rewrite links, or enable redirects.
"""

from dataclasses import dataclass
from pathlib import Path
import re
from typing import Dict, Optional, Sequence, Tuple, Union
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit


LEGACY_YEARS: Tuple[int, ...] = tuple(range(2017, 2025))
QUESTION_PARTS: Tuple[str, ...] = tuple(
    f"{question}{letter}"
    for question in range(1, 4)
    for letter in "abcde"
)

# Deliberately false while calc.nz is served directly by GitHub Pages.  Enabling
# a migration requires both generated destination pages and a query-aware edge.
EDGE_REDIRECTS_ACTIVE = False


@dataclass(frozen=True)
class LegacyComplexRedirect:
    """One legacy query URL and its future canonical path."""

    year: int
    part: str

    @property
    def source_path(self) -> str:
        return f"/complex-{self.year}.html"

    @property
    def source_url(self) -> str:
        return f"{self.source_path}?q={self.part}"

    @property
    def destination_path(self) -> str:
        return f"/complex-{self.part}{self.year}.html"


# This tuple is the single source of truth for all 8 years x 15 question parts.
# Keep consumers pointed at this contract instead of maintaining copied lists.
LEGACY_COMPLEX_REDIRECTS: Tuple[LegacyComplexRedirect, ...] = tuple(
    LegacyComplexRedirect(year=year, part=part)
    for year in LEGACY_YEARS
    for part in QUESTION_PARTS
)

REDIRECT_BY_SOURCE: Dict[str, LegacyComplexRedirect] = {
    redirect.source_url: redirect for redirect in LEGACY_COMPLEX_REDIRECTS
}


class RedirectContractError(ValueError):
    """Raised when the inactive migration contract is inconsistent or unsafe."""


def redirect_target(request_url: str) -> Optional[str]:
    """Return the future 308 target, preserving every non-``q`` parameter.

    Both absolute URLs and root-relative URLs are accepted.  ``None`` means the
    request is outside this narrowly defined migration.  This helper calculates
    a target only; it never performs or activates a redirect.
    """

    parsed = urlsplit(request_url)
    path_match = re.fullmatch(r"/complex-(201[7-9]|202[0-4])\.html", parsed.path)
    if path_match is None:
        return None

    parameters = parse_qsl(parsed.query, keep_blank_values=True)
    q_values = [value.lower() for key, value in parameters if key == "q"]
    if not q_values or q_values[0] not in QUESTION_PARTS:
        return None

    year = int(path_match.group(1))
    mapping = REDIRECT_BY_SOURCE.get(
        f"/complex-{year}.html?q={q_values[0]}"
    )
    if mapping is None:
        return None

    remaining_query = urlencode(
        [(key, value) for key, value in parameters if key != "q"],
        doseq=True,
    )
    return urlunsplit(
        (
            parsed.scheme,
            parsed.netloc,
            mapping.destination_path,
            remaining_query,
            parsed.fragment,
        )
    )


def validate_redirect_contract(
    repository_root: Optional[Union[Path, str]] = None,
) -> None:
    """Validate mapping completeness and that the dormant state remains safe."""

    root = (
        Path(repository_root)
        if repository_root is not None
        else Path(__file__).resolve().parent.parent
    )
    errors = []
    redirects: Sequence[LegacyComplexRedirect] = LEGACY_COMPLEX_REDIRECTS
    expected_pairs = {
        (year, part) for year in LEGACY_YEARS for part in QUESTION_PARTS
    }
    actual_pairs = {(redirect.year, redirect.part) for redirect in redirects}
    source_urls = [redirect.source_url for redirect in redirects]
    destinations = [redirect.destination_path for redirect in redirects]

    if EDGE_REDIRECTS_ACTIVE:
        errors.append("edge redirect activation must remain disabled on GitHub Pages")
    if len(redirects) != 120:
        errors.append(f"expected 120 mappings, found {len(redirects)}")
    if actual_pairs != expected_pairs:
        errors.append("year/question-part coverage is incomplete or unexpected")
    if len(source_urls) != len(set(source_urls)):
        errors.append("legacy source URLs are not unique")
    if len(destinations) != len(set(destinations)):
        errors.append("future destination paths are not unique")

    for redirect in redirects:
        expected_source = f"/complex-{redirect.year}.html?q={redirect.part}"
        expected_destination = f"/complex-{redirect.part}{redirect.year}.html"
        if redirect.source_url != expected_source:
            errors.append(f"unexpected source naming: {redirect.source_url}")
        if redirect.destination_path != expected_destination:
            errors.append(
                f"unexpected destination naming: {redirect.destination_path}"
            )

    missing_shells = [
        f"complex-{year}.html"
        for year in LEGACY_YEARS
        if not (root / f"complex-{year}.html").is_file()
    ]
    if missing_shells:
        errors.append("missing legacy year shells: " + ", ".join(missing_shells))

    destination_collisions = [
        redirect.destination_path.lstrip("/")
        for redirect in redirects
        if (root / redirect.destination_path.lstrip("/")).exists()
    ]
    if destination_collisions:
        errors.append(
            "future destinations already exist while migration is inactive: "
            + ", ".join(destination_collisions)
        )

    if errors:
        raise RedirectContractError("\n".join(errors))


def main() -> int:
    validate_redirect_contract()
    print(
        "Legacy Complex redirect contract valid: "
        "120 unique mappings; edge activation disabled."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
