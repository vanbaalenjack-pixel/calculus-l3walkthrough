# Calc.nz UX redesign

Local implementation and review package. Production hosting has not been changed.

The redesign uses the existing static HTML, KaTeX, shared JavaScript and Python generators. It covers all **447 questions, 30 papers, five standards and 17 skill collections**, including Level 2. `scripts/build-seo.py` remains the source for generated pages; `scripts/build-public.py` still publishes only its explicit runtime allowlist. No AGENTS.md was present.

## Coverage and verification

- [x] **1. Compact context.** One modest question heading beside Questions; a short prompt starts above 200px at the tested sizes. Full semantic titles and canonical metadata remain.
- [x] **2. Quiet opening.** Complete question, Hint, Show solution, Bookmark and independent question navigation. Retry and self-assessment live under Record attempt.
- [x] **3. Question beside help.** Hints expand in place. Wide screens use adjacent question/solution columns, respecting the existing pin preference when content fits. Phones have one page scroll and an accessible Original question dialog containing the complete prompt and graphic.
- [x] **4. Independent navigation.** Previous/next question works with answers hidden. Solution-step controls use explicit names. Sequences finish without looping or changing scope.
- [x] **5. Direct paper lists.** Home → subject → year → question takes three selections. Old paper-entry hashes resolve to the question list. Static paper pages put questions before optional official-source information.
- [x] **6. Questions-first drawer.** Current sequence choices appear immediately, with an active selection and quiet progress. Change paper is secondary. Escape, focus containment and focus return are checked.
- [x] **7. Practice-first skills.** A real question is visible on the initial 390px phone screen. Explanations follow practice; redundant filters and year jumps are removed. The directory groups concise methods by subject.
- [x] **8. Results-first search.** Optional filters are collapsed, applied filters have removal controls, and results follow the query. Submission announces results and brings them into view. Query, filters and list position survive return.
- [x] **9. Compact homepage.** Short introduction, early skills/search/subject routes, returning Continue and saved-set resume. Random practice and set configuration are secondary. Clear saved practice remains guarded in management.
- [x] **10. Compact choices.** Plain year choices and question rows retain identifiers, useful descriptions and restrained progress, with usable touch targets.
- [x] **11. Restrained styling.** White background, dark text, one blue accent, subtle separators, plain equation blocks and visible keyboard focus. Obsolete decorative card styles were replaced.
- [x] **12. Efficient solutions.** Hint reveals progressively; guided steps are available before the full answer. Show solution exposes every worked step, including nested solution details, in one action. Exam and pin preferences share one secondary settings disclosure.
- [x] **13. Explicit practice context.** Validated URL context carries skill/filter, search selection or an immutable ordered set. Refresh, browser history, modified-click links, separate tabs and missing/replaced saved sets are supported. Invalid context falls back to the paper.
- [x] **14. Brief optional feedback.** Record an independent attempt without revealing answers. Opening, reviewing and independently solving remain distinct. Retry later adds the question to the retry queue. Mathematical checks are brief; reflection is optional.

## Data and mathematical preservation

All 447 author configurations match the original checkout exactly, **including diagram-rendering functions, questions, hints and 1,555 authored solution steps**. No mathematical data files or image assets changed. Existing storage keys and progress migration rules remain; the recent-question record only gains an optional practice-context field. Legacy saved practice sets are resolved through their existing paper/part identifiers. Context is carried per URL, rather than in shared last-context storage.

## Checks

The review evidence lives in `.review/ux-redesign/` (excluded from publication):

- `checks.json`: 21 build, mathematics, content, metadata, source, public-output and routing checks.
- `browser-results.json`: responsive student journeys at **390×844, 1366×768, 320×700 and 768×1024**.
- `extended-results.json`: automated WCAG A/AA checks, keyboard/modal behaviour, original diagrams, return positions, multiple tabs, new/saved sets, random practice, retry recording, clear cancellation, blocked storage, no-JavaScript fallback and 200% text enlargement across the main surfaces.
- `catalogue-browser-results.json`: all 447 routes checked in Chrome for hidden initial answers, full solution visibility, valid KaTeX, canonical metadata and phone overflow.
- `content-preservation.txt`: exact before/after configuration comparison.
- `query-http-final.log`: 952 HTTP requests covering all 120 legacy query identities; private paths remain excluded.
- `preview-release.json`: public files and excluded/missing paths checked over HTTP.
- `screenshots/`: before/after home, question, skill and search views; phone/tablet/laptop, wide solution, drawer, original-question dialog and enlarged-text examples.

JavaScript syntax, modified Python syntax and `git diff --check` also pass. There is no configured package-level lint or type-check command. Older source checks tied to retired per-working reveal controls were updated; mathematical checks were retained. Behavioural coverage lives in the three `browser-minimal-*.cjs` suites, with URL validation/order checks in `scripts/test-practice-context.cjs` and CI.

To rebuild: `python3 scripts/build-seo.py && python3 scripts/build-public.py`.

To preview the static artifact: `python3 scripts/serve-preview.py --port 8004`.

The browser suites use the repository's existing Playwright/Chrome harness. In this checkout, set `NODE_PATH=.review/tooling/browser/node_modules` when invoking them with Node. `CALC_REVIEW_DIR` and `CALC_PREVIEW` can select another evidence folder and local origin.

## Limits and review notes

Browser verification used desktop Chrome with emulated viewports, keyboard interaction and axe. Physical devices, Safari/Firefox and a manual screen-reader session were not tested.

The existing static-host limitation remains: raw HTML for 112 non-default legacy `complex-YEAR.html?q=...` requests initially describes the default question until JavaScript selects the requested one. Every route renders correctly in the browser. The **existing query-aware adapter** has been rebuilt locally with all 120 correct initial responses and passes HTTP checks; its package is `.review/ux-redesign/query-release`. Activating it on production hosting is outside this request. No production publication was attempted.
