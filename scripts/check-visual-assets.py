#!/usr/bin/env python3
"""Static integrity checks for calc.nz visual assets and diagram regressions."""

from __future__ import annotations

import hashlib
import re
import struct
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent.parent
SOURCE_GLOBS = ("*.html", "*.js", "*.css")


def source_files() -> list[Path]:
    return sorted(
        path
        for pattern in SOURCE_GLOBS
        for path in ROOT.glob(pattern)
        if path.is_file()
    )


def local_reference(raw_reference: str) -> Path | None:
    reference = raw_reference.strip()
    if not reference or reference.startswith(("#", "data:", "http:", "https:", "mailto:")):
        return None
    path = unquote(urlsplit(reference).path)
    if not path or path.startswith("/"):
        return None
    return ROOT / path


def png_dimensions(path: Path) -> tuple[int, int]:
    with path.open("rb") as stream:
        header = stream.read(24)
    if len(header) != 24 or header[:8] != b"\x89PNG\r\n\x1a\n" or header[12:16] != b"IHDR":
        raise ValueError("invalid PNG header")
    return struct.unpack(">II", header[16:24])


def jpeg_dimensions(path: Path) -> tuple[int, int]:
    """Read JPEG dimensions without adding an image-library dependency."""

    start_of_frame_markers = {
        0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7,
        0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF,
    }
    with path.open("rb") as stream:
        if stream.read(2) != b"\xff\xd8":
            raise ValueError("invalid JPEG header")
        while True:
            prefix = stream.read(1)
            if not prefix:
                break
            if prefix != b"\xff":
                continue
            marker_byte = stream.read(1)
            while marker_byte == b"\xff":
                marker_byte = stream.read(1)
            if not marker_byte:
                break
            marker = marker_byte[0]
            if marker in {0x01, *range(0xD0, 0xDA)}:
                continue
            length_bytes = stream.read(2)
            if len(length_bytes) != 2:
                break
            segment_length = struct.unpack(">H", length_bytes)[0]
            if segment_length < 2:
                raise ValueError("invalid JPEG segment length")
            if marker in start_of_frame_markers:
                frame = stream.read(5)
                if len(frame) != 5:
                    break
                height, width = struct.unpack(">HH", frame[1:5])
                return width, height
            if marker in {0xD9, 0xDA}:
                break
            stream.seek(segment_length - 2, 1)
    raise ValueError("JPEG dimensions not found")


def ico_dimensions(path: Path) -> tuple[int, int]:
    """Return the largest square/icon entry advertised by an ICO container."""

    with path.open("rb") as stream:
        header = stream.read(6)
        if len(header) != 6:
            raise ValueError("invalid ICO header")
        reserved, image_type, count = struct.unpack("<HHH", header)
        if reserved != 0 or image_type != 1 or count < 1:
            raise ValueError("invalid ICO directory")
        dimensions: list[tuple[int, int]] = []
        for _index in range(count):
            entry = stream.read(16)
            if len(entry) != 16:
                raise ValueError("truncated ICO directory")
            width = entry[0] or 256
            height = entry[1] or 256
            dimensions.append((width, height))
    return max(dimensions, key=lambda value: value[0] * value[1])


def main() -> int:
    failures: list[str] = []
    sources = source_files()
    source_text = {path: path.read_text(encoding="utf-8") for path in sources}
    combined_source = "\n".join(source_text.values())

    html_files = sorted(ROOT.glob("*.html"))
    cache_tokens: set[str] = set()
    for html_path in html_files:
        html = source_text[html_path]
        cache_tokens.update(re.findall(r"\?v=([0-9A-Za-z._-]+)", html))
        for attribute, reference in re.findall(r"\b(href|src)=[\"']([^\"']+)[\"']", html):
            target = local_reference(reference)
            if target is not None and not target.exists():
                failures.append(f"{html_path.name}: missing {attribute} target {reference}")
    if len(cache_tokens) != 1:
        failures.append(f"HTML files use inconsistent local cache tokens: {sorted(cache_tokens)}")

    css = source_text[ROOT / "style.css"]
    for reference in re.findall(r"url\((?:[\"']?)([^)'\"]+)", css):
        target = local_reference(reference)
        if target is not None and not target.exists():
            failures.append(f"style.css: missing url() target {reference}")

    png_files = sorted((ROOT / "assets").rglob("*.png"))
    png_hashes: dict[str, Path] = {}
    for png_path in png_files:
        try:
            width, height = png_dimensions(png_path)
        except (OSError, ValueError) as error:
            failures.append(f"{png_path.relative_to(ROOT)}: {error}")
            continue
        if width <= 0 or height <= 0:
            failures.append(f"{png_path.relative_to(ROOT)}: empty dimensions {width}x{height}")
        digest = hashlib.sha256(png_path.read_bytes()).hexdigest()
        if digest in png_hashes:
            failures.append(
                f"duplicate PNGs: {png_hashes[digest].relative_to(ROOT)} and {png_path.relative_to(ROOT)}"
            )
        png_hashes[digest] = png_path
        relative = png_path.relative_to(ROOT).as_posix()
        dynamic_pattern = png_path.parent.relative_to(ROOT).as_posix() + "/${id}-question.png"
        if relative not in combined_source and dynamic_pattern not in combined_source:
            failures.append(f"{relative}: deployed asset is not referenced")

    required_brand_assets = {
        "favicon.ico": ((48, 48), ico_dimensions),
        "assets/favicon-48.png": ((48, 48), png_dimensions),
        "assets/favicon-192.png": ((192, 192), png_dimensions),
        "assets/apple-touch-icon.png": ((180, 180), png_dimensions),
        "assets/calc-nz-social.jpg": ((1200, 630), jpeg_dimensions),
    }
    for relative, (expected_dimensions, dimension_reader) in required_brand_assets.items():
        path = ROOT / relative
        if not path.is_file():
            failures.append(f"{relative}: required brand asset is missing")
            continue
        try:
            dimensions = dimension_reader(path)
        except (OSError, ValueError) as error:
            failures.append(f"{relative}: {error}")
            continue
        if dimensions != expected_dimensions:
            failures.append(
                f"{relative}: dimensions are {dimensions[0]}x{dimensions[1]}, "
                f"expected {expected_dimensions[0]}x{expected_dimensions[1]}"
            )
        reference = "/" + relative
        if reference not in combined_source and relative not in combined_source:
            failures.append(f"{relative}: required site metadata reference is missing")

    social_jpeg = ROOT / "assets" / "calc-nz-social.jpg"
    legacy_social_png = ROOT / "assets" / "calc-nz-social.png"
    if social_jpeg.is_file():
        if social_jpeg.stat().st_size > 250_000:
            failures.append(
                "assets/calc-nz-social.jpg: optimized sharing image exceeds 250 KB"
            )
        if (
            legacy_social_png.is_file()
            and social_jpeg.stat().st_size >= legacy_social_png.stat().st_size // 2
        ):
            failures.append(
                "assets/calc-nz-social.jpg: sharing image is not materially smaller "
                "than the previous PNG"
            )

    authored_images = []
    for path, text in source_text.items():
        for match in re.finditer(r"<img\b[^>]*>", text):
            tag = match.group(0)
            if "question-image-lightbox-img" in tag:
                continue
            authored_images.append((path, tag))
            for attribute in ("width", "height", "alt"):
                if not re.search(rf"\b{attribute}=[\"'][^\"']+[\"']", tag):
                    failures.append(f"{path.name}: authored image omits {attribute}: {tag[:140]}")

    graph_svgs = []
    for path, text in source_text.items():
        for match in re.finditer(r"<svg\b[^>]*\bclass=[\"'][^\"']*\bgraph-svg\b[^\"']*[\"'][^>]*>", text):
            tag = match.group(0)
            graph_svgs.append((path, tag))
            if not re.search(r"\bviewBox=[\"'][^\"']+[\"']", tag):
                failures.append(f"{path.name}: graph SVG omits viewBox")
            if not re.search(r"\brole=[\"']img[\"']", tag):
                failures.append(f"{path.name}: graph SVG omits role=img")
            if not re.search(r"\baria-(?:label|labelledby)=", tag):
                failures.append(f"{path.name}: graph SVG has no accessible name")

    required_fragments = {
        "style.css": [
            ".graph-guide {\n  fill: none;",
            ".graph-normal {\n  fill: none;",
            ".graph-measure {\n  fill: none;",
            ".question-shade {\n  fill: rgba(17, 24, 39, 0.14);",
        ],
        "differentiation-2021-data.js": [
            '<path class="question-curve" fill="none" d="M 90 332 L 260 46 L 430 332"></path>',
            '<path class="graph-bg" d="M 156 214 H 364 V 332 C 315 360 205 360 156 332 Z"></path>',
            '<path class="question-normal" d="M 300 305 L 300 275 L 330 275"></path>',
            '<path class="question-normal" d="M 330 126 A 38 38 0 0 1 303 110"></path>',
        ],
        "differentiation-2018-data.js": [
            '<path class="question-normal" d="M 185 176 L 218 139 L 266 139 L 270 176 Z',
            '<path class="question-normal" d="M 601 230 L 601 210 L 621 210"></path>',
        ],
        "integration-2024-data.js": [
            'lineMarkup(scale, 1, 0, 1, topFn(1), "graph-guide")',
        ],
        "integration-2025-data.js": [
            'lineMarkup(scale, 2, 0, 2, fn(2), "graph-guide")',
        ],
        "1b2025-l2.html": [
            '<path class="graph-curve-secondary" d="${tangentPath}"></path>',
        ],
    }
    for filename, fragments in required_fragments.items():
        text = source_text[ROOT / filename]
        for fragment in fragments:
            if fragment not in text:
                failures.append(f"{filename}: missing visual regression guard {fragment[:90]!r}")

    complex_2021 = source_text[ROOT / "complex-2021-data.js"]
    if re.search(r"<circle class=\"question-shade\"[^>]*r=\"\$\{(?:screenRadius|radius)\}", complex_2021):
        failures.append("complex-2021-data.js: equality locus is still rendered as a filled disk")

    gate = source_text[ROOT / "walkthrough-gate.js"]
    for stale_affordance in ("interactive-plot-svg", "graph-point-draggable", "graph-draggable-label"):
        if stale_affordance in gate or stale_affordance in css:
            failures.append(f"legacy static plots retain false affordance {stale_affordance}")

    if re.search(r"prompt from (?:the )?20(?:19|20)", combined_source, re.IGNORECASE):
        failures.append("historical question screenshots retain generic prompt-only alternative text")

    stale_pdf_artifacts = ROOT / "tmp" / "pdfs"
    if stale_pdf_artifacts.exists():
        failures.append("tmp/pdfs contains unreferenced PDF-rendering inspection artifacts")

    if failures:
        print("Visual asset audit failed:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(
        "Visual asset audit passed: "
        f"{len(html_files)} HTML files, {len(png_files)} PNG assets, "
        f"{len(graph_svgs)} graph SVG templates, {len(authored_images)} authored image templates."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
