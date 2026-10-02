# Readiness fixes — 2 October 2026

Implemented and verified locally on `main`. No push, deployment, DNS change,
account change or external message was made. Production has not been verified
with these changes. The full 1 October audit was read before implementation.
The starting working tree was clean; no applicable AGENTS.md was found.

## Changes

- `style.css`: darker shared blue gradients (`#315bb5` → `#254994`, hover
  `#294f9f` → `#1f3e80`), and homepage white highlight reduced from 22% to 6%.
  Label sizing, focus outlines and touch targets remain intact.
- `complex-2025-data.js`: both rationalisation explanations identify the real
  and imaginary parts of the complete fraction, explain the positive common
  denominator, and refer to the retained first-quadrant check. Solutions remain
  −2 and −3. Original-equation regression checks give 2+2i and 1.5+1.5i.
- `walkthrough-audit-data.js`: corrected logarithm markup in Integration 2025
  Q1(e)'s reasoning and common mistake, retaining absolute-value/sign reasoning.
- `differentiation-2025-data.js`: Q3(e) now shows the quadratic calculation,
  the geometric domain 0<x<8, and rejection of 8+4√2. AD=8√2 is unchanged;
  the prompt's permission to assume the maximum is retained.
- `scripts/build-seo.py`, `index.html`, `index-page.js`, `index-loader.js`:
  generate the initial chooser links/counts from the catalogue, enhance those
  links in place, keep the initial breadcrumb layout, select the mobile header
  layout before first paint, retain native mobile “How it works” disclosure
  without moving its node, and place Continue beside saved practice. Desktop
  explanation content is visible through CSS, including without JavaScript.
  Deferred activation covers the new static chooser and Back control.
- Added targeted mathematics, generator, browser, and raster text-scan checks;
  added mathematical regressions to CI. Existing browser coverage now includes
  1440px and catalogue-wide mobile overflow detection.
- Expanded `scripts/check-public-output.py` to catch assisted wording and
  indirect implementation credits. No public notices or licences were removed.
- Regenerated the SEO/public output through the existing build. The baseline
  `build-seo.py --check` already reported stale `sitemap.xml`; its regenerated
  diff updates 500 last-modified dates from Git history, without changing URLs.
  The mathematical edits affect runtime data beyond the pre-rendered first step.

## Measurements

Chrome headless via Playwright; disposable profiles; local `_site` HTTP server.
These are synthetic lab results, not real-user Core Web Vitals.

The 390×844 baseline, 150ms latency, 1.6Mbps download, 0.75Mbps upload and 4× CPU
slowdown produced CLS **0.144549763** in each of three cold-cache runs.
Attribution identified a separate **0.116939197** header/hero shift when deferred
JavaScript switched the mobile navigation layout, then chooser/practice movement
when the homepage tools loaded. CLS uses the largest session window, not the sum
of these separated events.

After changes, the fresh and saved-last-question matrix recorded **0.000 CLS**
at 320, 390, 768 and 1440px, with three cold runs and one primed warm-cache run per
case. A separate matrix with a matching saved three-question practice set and
Continue record confirmed both restored and recorded **0.000 CLS in all 16 runs**.
See `.review/2026-10-02/readiness-saved.json` for those measurements. The blocked
storage check also recorded 0.000. No page hiding, timing delays or content
clipping were added to the site.

CTA screenshots suppress only child ink to measure the actual gradient/highlight
composite. The conservative central label-height band had minimum contrast
**3.33:1 before → 6.73:1 after** (normal/focus), and **3.87:1 → 8.06:1** on hover.
The wider interior background sweep improved **2.59:1 → 5.66:1** (normal/focus)
and **2.80:1 → 6.75:1** (hover). These sampling regions are broader than the audit's
individual unobstructed text-height samples. The label is still 16.64px bold;
CTA minimum height is 62px, and the focus outline remains 3px.
Twelve additional normal/hover/focus measurements on Search, 404, a legacy paper
entry and a walkthrough button passed, with minimum **5.96:1**, 44px-or-larger
controls and the expected computed colours.

## Verification completed

- **76 unit tests passed**: `test-mathematical-corrections.py` (18),
  `test-catalogue-mathematics.py` (6), `test-audit-remediation.py` (32),
  `test_build_seo_contract.py` (9), `test_legacy_complex_redirects.py` (7),
  `test-readiness-fixes.py` (4).
- `validate-walkthrough-content-extractor.py`: 447 routes passed.
- `audit-site-structure.py`, `validate-site-quality.py`, `validate-seo.py`,
  `check-visual-assets.py`: passed; 506 sitemap URLs, 399 HTML files.
- `build-seo.py --check`: up to date after regeneration.
- `build-public.py`: 603 publishable files plus `.nojekyll`; development files
  and this report are excluded. `check-public-output.py` and `git diff --check`
  passed.
- `browser-catalogue-review.cjs`: **447 routes / 1,662 worked steps**, at 390px;
  no content/math rendering failures, broken eager images, console errors,
  failed requests, canonical identity mismatches or horizontal overflow.
- `browser-functional-review.cjs`: **64 checks passed**, including 40 template
  reflow checks at 320/390/768/1440px; hints, worked steps, exam mode, search
  filters/persistence, bookmarks, retries, progress, practice scopes, keyboard
  menus, storage blocking and JavaScript-off fallback. Seven expanded-page axe
  audits reported no violations. This is not a WCAG conformance certification.
- `browser-readiness-interactions.cjs`: all four keyboard standard → year →
  question journeys and history checks passed; focused headings stay below the
  sticky header. JavaScript-off standard links, blocked storage, corrected
  complex working, Continue and practice-set restoration passed. No console or
  request failures. Screenshots inspected at 390px and 1440px.

## Public terminology scan

No prohibited references found in **447 public text files**: visible source
text, titles/descriptions, structured data, accessible labels, HTML comments,
JavaScript, CSS, SVG/XML/text assets and licence notices. All **19** lowercase
`ai` occurrences were examined and are complex-number algebra; they remain.
Apple Vision OCR plus ImageIO metadata checks covered **97 raster/icon files**,
with no recognition errors or matches. OCR is fallible. The first sandboxed
Vision attempt could not access its recognition service; the successful local
run used the required process permission. No image assets were changed.

Truthful independent-review notices, NZQA disclaimers, copyright and licences
remain. No independent teacher review is claimed. No concept articles were added.

## Metadata migration: safely prepared, still pending

The repository publishes directly to GitHub Pages. All **120** legacy routes
remain in the catalogue and sitemap with their existing question identities;
**112** initial canonical mismatches are still reproducible. No destination pages,
client redirects, meta refreshes or partial canonical migration were activated.

The dormant contract's tests now cover every mapping, uppercase question values,
all non-q values including repeated/blank/encoded parameters, removal of repeated
q parameters, fragments, loop prevention, and unchanged catalogue/sitemap saved
identities. `HOSTING_MIGRATION.md` records the current status and rollout boundary.

Minimum next decision: approve a query-aware HTTP 301/308 edge or alternative
host, and permission to prepare its preview. Then generate/verify all 120 raw
question destinations and coordinate origin, links/sitemap, saved-state identity
and real permanent redirects as one cutover. Destination availability and HTTP
redirect/metadata cutover tests cannot be certified on the inactive Pages build.

## Evidence and limits

Machine-readable evidence and screenshots are under `.review/2026-10-02/`;
existing functional/catalogue reports are under `.review/2026-09-24/`.
Browser scripts require Playwright, pngjs, Chrome, and (for the functional suite)
`@axe-core/playwright`. The latter was installed in a temporary test directory;
no project package manager or lockfile was introduced.

No physical devices, Firefox/Safari, full screen-reader audit, exhaustive
mathematical certification or production deployment was tested. Saved-state
fixtures use disposable local browser data only.
