#!/usr/bin/env python3
"""Check the data-driven NZQA resource manifest without guessing URLs.

Exit codes distinguish stable link failures from temporary network conditions:
0 means every URL resolved, 1 means at least one permanent HTTP failure, and
2 means no permanent failure was seen but one or more checks were transient.
"""

from __future__ import annotations

import argparse
import json
import socket
import sys
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST = ROOT / "official-resources.json"
USER_AGENT = "Calc.nz-official-resource-check/1.0"


def manifest_urls(path: Path) -> list[tuple[str, str]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    output: list[tuple[str, str]] = []
    for standard, years in payload.get("standards", {}).items():
        for year, record in years.items():
            for resource in record.get("resources", []):
                output.append((f"{standard} {year} {resource['label']}", resource["url"]))
    return output


def request_status(url: str, timeout: float) -> int:
    headers = {"User-Agent": USER_AGENT}
    request = urllib.request.Request(url, headers=headers, method="HEAD")
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return int(response.status)
    except urllib.error.HTTPError as error:
        if error.code not in {403, 405}:
            return int(error.code)

    # Some document hosts disable HEAD. A one-byte GET checks the target while
    # avoiding a full PDF or ZIP download.
    headers["Range"] = "bytes=0-0"
    request = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return int(response.status)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--timeout", type=float, default=12.0)
    arguments = parser.parse_args()

    permanent: list[str] = []
    transient: list[str] = []
    passed = 0
    for label, url in manifest_urls(arguments.manifest):
        try:
            status = request_status(url, arguments.timeout)
        except (urllib.error.URLError, TimeoutError, socket.timeout) as error:
            transient.append(f"{label}: transient network error ({error})")
            continue

        if 200 <= status < 400:
            passed += 1
        elif status == 429 or status >= 500:
            transient.append(f"{label}: transient HTTP {status}")
        else:
            permanent.append(f"{label}: permanent HTTP {status}")

    print(f"Official NZQA resources: {passed} resolved, {len(permanent)} permanent failures, {len(transient)} transient failures.")
    for message in permanent + transient:
        print(message, file=sys.stderr)
    if permanent:
        return 1
    if transient:
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
