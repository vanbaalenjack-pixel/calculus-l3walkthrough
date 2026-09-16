# Calc.nz audit remediation

Last updated: 16 September 2026

This document tracks the internal audit remediation requested for Calc.nz. Mathematical changes listed here have been internally checked during implementation but are **awaiting independent teacher review**. Calc.nz is independent and is not affiliated with or endorsed by NZQA.

## Phased implementation plan

1. Add a shared review-status model and notice, then correct the named high-priority mathematics records.
2. Extend the shared walkthrough schema and renderer with attempt-first prompts, progressive hints, domain/sign/interval reasoning, mark-relevant communication, final results, verification, and specific mistakes.
3. Repair exam-mode concealment and replace binary completion with editable student self-assessment, including a safe local-data migration.
4. Synchronise search queries and filters with browser history, improve matching, and add the requested filters and reset/no-result states.
5. Reframe the homepage and Level 3 hub, add a checked official-resource manifest, and remove unsupported review claims.
6. Fix prose-in-KaTeX/mobile overflow and reduce repetitive walkthrough context.
7. Regenerate authoritative static output, add regression coverage, run the full validation suite, and complete local browser checks at mobile, tablet, and desktop widths.

## Audit checklist

### A-D. Mathematics and trust notices

- [x] Correct `complex-1e2025.html` and retain only the lower hyperbola branch.
- [x] Correct `int-2c2024.html` with the singularity/maximal-IVP-interval caveat and schedule distinction.
- [x] Correct `complex-2023.html?q=3c` with the full parameter restriction.
- [x] Correct `complex-2022.html?q=1d` with the full solution-count classification.
- [x] Correct `complex-2020.html?q=1c` with the required parameter restriction.
- [x] Correct `complex-2021.html?q=3d` with the required parameter restriction.
- [x] Correct `2e2024.html` to distinguish a stationary point of inflection from a genuine turning point.
- [x] Repair cancellation/singular-solution reasoning on `int-3e2023.html`.
- [x] Repair positive-root justification on `3e2023.html`.
- [x] Repair logarithm/domain/branch selection on `int-1e2025.html`.
- [x] Add the zero-parameter case to all five named polar-root questions.
- [x] Add an accessible shared “awaiting independent teacher review” notice to every affected question.

### E-F. Editorial language and walkthrough structure

- [x] Remove unsupported user-visible “verified” claims throughout source and generated output.
- [x] Add reusable review status, domain/checks, mark-relevant reasoning, final result, and verification fields.
- [x] Apply the full improved structure to every mathematics record changed here.
- [x] Add schema validation for review status, distinct Idea/Working, required restrictions, final result, verification, and specific mistakes.
- [x] Document the remaining catalogue records that retain the backward-compatible legacy structure.

### G-H. Exam mode and student reflection

- [x] Conceal every technique-revealing cue before deliberate exam-mode reveal.
- [x] Preserve an accessible neutral heading, correct focus, keyboard operation, and accessibility-tree concealment.
- [x] Replace binary completion with four editable self-assessment outcomes.
- [x] Safely migrate legacy completion data without overstating independent mastery.
- [x] Preserve bookmarks/retry data and recover safely from malformed local storage.
- [x] Update progress summaries and saved-practice/home/sidebar surfaces.

### I. Search

- [x] Keep query and filters synchronised with the URL and Back/Forward history.
- [x] Add scoped synonyms, punctuation/whitespace normalisation, and AND-style multi-token matching.
- [x] Add Level, Standard, Year, and Skill/method filters plus reset and helpful no-results guidance.

### J. Homepage and navigation

- [x] Make AS91577, AS91578, and AS91579 the primary Level 3 pathways.
- [x] Move Level 2 into a secondary “More maths” pathway.
- [x] Make Quick Practice default to all Level 3 standards or remember the latest scope.
- [x] Make “Level 3 Calculus” consistently include all three Level 3 standards.
- [x] Reconcile standard wording, counts, navigation, and About copy.

### K. Mobile and visual presentation

- [x] Render question prose as semantic wrapping HTML and only equations as KaTeX.
- [x] Prevent page-wide horizontal overflow while keeping long equations legible.
- [x] Reduce repeated method/context cards and improve mobile titles, spacing, focus, and tap targets.
- [x] Respect reduced motion.

### L. Official resources

- [x] Add a data-driven official NZQA resource manifest keyed by standard/year.
- [x] Include only links whose official source and availability were checked; record the check date.
- [x] Retain the supplied 2024 AS91578 and AS91579 schedules and the independent-site disclaimer.

### M. Regression and browser checks

- [x] Add explicit mathematical fixtures/assertions for every named correction.
- [x] Add schema/content checks for every modified walkthrough.
- [x] Add behavioural tests for exam mode, self-assessment/migration, and search/history/filters.
- [x] Run SEO, site-quality, link, smoke, and mathematical regression suites.
- [x] Check the required walkthroughs and core surfaces locally at approximately 390 px, 768 px, and 1440 px.

## Verification summary

- Mathematical/schema audit: 32/32 tests passed, covering every named correction and all 15 rich walkthrough records.
- Python generator contracts: 12/12 unit tests passed; generated output is current.
- Rendered WebKit checks: remediation 25/25, walkthrough 22/22, UX behaviour 16/16, site regressions 24/24, and final responsive audit 22/22.
- Responsive audit widths: 320, 375, 390, 768, 1366, and 1440 px. The remediation suite explicitly exercised every affected question at 390, 768, and 1440 px.
- Site validators: 447 logical walkthroughs, 391 physical HTML pages, and 498 canonical sitemap URLs passed; all 498 local URLs returned HTTP 200.
- Resource and asset checks: 58/58 official NZQA URLs resolved when checked, and 391 HTML files, 95 PNG assets, 154 graph SVG templates, and 86 authored image templates passed the visual-asset audit.
- Syntax/type checks passed for the modified Python, Swift, Objective-C, and JavaScript test paths; `git diff --check` passed.
- The in-app browser had no connected browser surface. Repository-native WKWebView/WebKit runners performed the required rendered-browser, interaction, console-error, overflow, accessibility, and screenshot checks instead.

## Teacher-review checklist

Use this package to review the corrected authored overlay before publication. In every entry, inspect these revised sections: **Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, and Common mistake**. Resource links below come from `official-resources.json`, checked 28 August 2026; the absence of a legacy link means the manifest records that resource as unavailable, not that an unchecked URL should be substituted.

### 1. AS91577 · 2025 · Question 1(e)

- **Public URL:** [https://calc.nz/complex-1e2025.html](https://calc.nz/complex-1e2025.html)
- **Original problem:** For \(|z-5i|-|z+5i|=4\), find the Cartesian locus in the form \(ay^2-bx^2=k\).
- **Corrected conclusion:** \(21y^2-4x^2=84\) with \(y\le-2\).
- **Audit focus:** Squaring produces both hyperbola branches, but isolating \(\sqrt{x^2+(y+5)^2}=(-5y-4)/2\) imposes a sign restriction. The upper branch \(y\ge2\) gives a distance difference of \(-4\) and is extraneous.
- **Schedule nuance:** No schedule-specific departure is recorded; check that the branch restriction is communicated, not just the Cartesian equation.
- **Official resources:** [2025 paper](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2025/91577-exm-2025.pdf) · [2025 schedule](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2025/91577-ass-2025.pdf)
- **Inspect:** Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, Common mistake.
- **Status:** awaiting independent teacher review

### 2. AS91579 · 2024 · Question 2(c)

- **Public URL:** [https://calc.nz/int-2c2024.html](https://calc.nz/int-2c2024.html)
- **Original problem:** Solve \(dy/dx=12y^2e^{3x}\), given \(y(0)=0.5\), and find \(y\) when \(x=1/3\).
- **Corrected conclusion:** The local formula is \(y=(6-4e^{3x})^{-1}\), but the maximal IVP interval containing \(0\) is \(x<\ln(3/2)/3\); therefore that IVP has no value at \(x=1/3\).
- **Audit focus:** The denominator vanishes at \(x=\ln(3/2)/3\approx0.1352\), between the initial point and target. Formally evaluating the same algebraic expression at \(1/3\) reaches a disconnected branch.
- **Schedule nuance:** The official schedule reports the formal value \(1/(6-4e)\approx-0.2052\). The walkthrough retains that schedule-expected calculation while clearly separating it from the maximal-IVP conclusion.
- **Official resources:** [2024 paper](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2024/91579-exm-2024.pdf) · [2024 schedule](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2024/91579-ass-2024.pdf)
- **Inspect:** Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, Common mistake.
- **Status:** awaiting independent teacher review

### 3. AS91577 · 2023 · Question 3(c)

- **Public URL:** [https://calc.nz/complex-2023.html?q=3c](https://calc.nz/complex-2023.html?q=3c)
- **Original problem:** Solve \(4\sqrt{4x-w}=5-8\sqrt{x}\) for \(x\) in terms of real \(w\).
- **Corrected conclusion:** \(x=((25+16w)/80)^2\) only for \(-25/16\le w\le25/16\); otherwise there is no real solution.
- **Audit focus:** Before squaring, require \(x\ge0\), \(4x-w\ge0\), and \(5-8\sqrt{x}\ge0\). Equivalently, the derived \(\sqrt{x}\) must lie in \([0,5/8]\), which supplies both parameter bounds.
- **Schedule nuance:** No schedule-specific departure is recorded; review whether both endpoint cases and the no-real-solution case are explicit.
- **Official resources:** [2023 paper](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2023/91577-exm-2023.pdf) · [2023 schedule](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2023/91577-ass-2023.pdf)
- **Inspect:** Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, Common mistake.
- **Status:** awaiting independent teacher review

### 4. AS91577 · 2022 · Question 1(d)

- **Public URL:** [https://calc.nz/complex-2022.html?q=1d](https://calc.nz/complex-2022.html?q=1d)
- **Original problem:** Find all real \(p\) for which \(x-2\sqrt{x+p}=-5\) has exactly one real solution.
- **Corrected conclusion:** There are no real solutions for \(p<4\), one for \(p=4\), two for \(4<p\le5\), and one for \(p>5\). Hence exactly one occurs for \(p=4\) or \(p>5\).
- **Audit focus:** With \(u=\sqrt{x+p}\), the roots \(u=1\pm\sqrt{p-4}\) must satisfy \(u\ge0\). A discriminant-only answer misses the second one-solution range \(p>5\).
- **Schedule nuance:** No schedule-specific departure is recorded; check the full solution-count classification rather than only the requested set.
- **Official resources:** [2022 paper](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2022/91577-exm-2022.pdf) · [2022 schedule](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2022/91577-ass-2022.pdf)
- **Inspect:** Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, Common mistake.
- **Status:** awaiting independent teacher review

### 5. AS91577 · 2020 · Question 1(c)

- **Public URL:** [https://calc.nz/complex-2020.html?q=1c](https://calc.nz/complex-2020.html?q=1c)
- **Original problem:** Solve \(2\sqrt{x}-5=\sqrt{4x-g}\) for \(x\) in terms of real \(g\).
- **Corrected conclusion:** \(x=((25+g)/20)^2\) for \(g\ge25\); there is no real solution for \(g<25\).
- **Audit focus:** The original right side is non-negative, so \(2\sqrt{x}-5\ge0\). This sign condition, lost by squaring, is stronger than merely checking that the formula for \(x\) is non-negative.
- **Schedule nuance:** No checked 2020 paper or schedule URL is available in the official-resource manifest; review the conclusion against an authorised copy if one is available to the reviewer.
- **Official resources:** Paper and schedule are recorded as unavailable in the checked manifest.
- **Inspect:** Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, Common mistake.
- **Status:** awaiting independent teacher review

### 6. AS91577 · 2021 · Question 3(d)

- **Public URL:** [https://calc.nz/complex-2021.html?q=3d](https://calc.nz/complex-2021.html?q=3d)
- **Original problem:** Solve \(6\sqrt{2x}-5=6\sqrt{2x+m}\) for \(x\) in terms of real \(m\).
- **Corrected conclusion:** \(x=\tfrac12((25-36m)/60)^2\) for \(m\le-25/36\); there is no real solution for \(m>-25/36\).
- **Audit focus:** The principal root on the right requires \(6\sqrt{2x}-5\ge0\). Restoring this sign after squaring gives the missing parameter restriction.
- **Schedule nuance:** No schedule-specific departure is recorded; inspect the boundary \(m=-25/36\) and the no-real-solution range.
- **Official resources:** [2021 paper](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2021/91577-exm-2021.pdf) · [2021 schedule](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2021/91577-ass-2021.pdf)
- **Inspect:** Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, Common mistake.
- **Status:** awaiting independent teacher review

### 7. AS91578 · 2024 · Question 2(e)

- **Public URL:** [https://calc.nz/2e2024.html](https://calc.nz/2e2024.html)
- **Original problem:** For \(y=xe^{3x}/(2x+k)\), \(k\ne0\), the assessment says the graph has one “turning point” \(Q\); find its \(x\)-coordinate.
- **Corrected conclusion:** \(k=8/3\) and \(x_Q=-2/3\), but this stationary point is a stationary point of inflection, not a genuine turning point.
- **Audit focus:** At \(k=8/3\), \(y'=6e^{3x}(x+2/3)^2/(2x+8/3)^2\), which is positive on both sides of \(-2/3\). The derivative has no sign change.
- **Schedule nuance:** The official schedule uses “turning point” for the single stationary point. The walkthrough preserves the exam interpretation and answer while correcting the graph classification.
- **Official resources:** [2024 paper](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2024/91578-exm-2024.pdf) · [2024 schedule](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2024/91578-ass-2024.pdf)
- **Inspect:** Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, Common mistake.
- **Status:** awaiting independent teacher review

### 8. AS91579 · 2023 · Question 3(e)

- **Public URL:** [https://calc.nz/int-3e2023.html](https://calc.nz/int-3e2023.html)
- **Original problem:** For \((1-x^2)(1+y)y'+(1-x)(1-y^2)=0\), given \(y(2)=0\), find \(y(6)\).
- **Corrected conclusion:** The regular branch \(y=(2-x)/3\) gives the smooth-continuation value \(y(6)=-4/3\), but the original implicit problem does not uniquely force continuation beyond \((5,-1)\).
- **Audit focus:** Factoring gives \((1-x)(1+y)((1+x)y'+1-y)=0\). Cancelling requires \(x\ne1\) and \(y\ne-1\); at \((5,-1)\) the original equation is \(0=0\), so it does not determine \(y'\).
- **Schedule nuance:** No schedule-specific departure is recorded; review the wording that distinguishes a valid smooth continuation from uniqueness of the original implicit problem.
- **Official resources:** [2023 paper](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2023/91579-exm-2023.pdf) · [2023 schedule](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2023/91579-ass-2023.pdf)
- **Inspect:** Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, Common mistake.
- **Status:** awaiting independent teacher review

### 9. AS91578 · 2023 · Question 3(e)

- **Public URL:** [https://calc.nz/3e2023.html](https://calc.nz/3e2023.html)
- **Original problem:** For \(a>0\), show that \(y=\tfrac a2(e^{x/a}+e^{-x/a})\) satisfies \(ay''=\sqrt{1+(y')^2}\).
- **Corrected conclusion:** The identity holds, with \(ay''=(e^{x/a}+e^{-x/a})/2>0\), so the positive square root is justified.
- **Audit focus:** Equality of \((ay'')^2\) and \(1+(y')^2\) alone permits both signs. Positivity of \(a\) and the exponential terms selects the principal positive root.
- **Schedule nuance:** No schedule-specific departure is recorded; check that the sign argument follows the squared identity explicitly.
- **Official resources:** [2023 paper](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2023/91578-exm-2023.pdf) · [2023 schedule](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2023/91578-ass-2023.pdf)
- **Inspect:** Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, Common mistake.
- **Status:** awaiting independent teacher review

### 10. AS91579 · 2025 · Question 1(e)

- **Public URL:** [https://calc.nz/int-1e2025.html](https://calc.nz/int-1e2025.html)
- **Original problem:** For \(y-xy-(1+x)y'=0\), given \(y(0)=3\), find \(y(2)\).
- **Corrected conclusion:** On the interval \(x>-1\), \(y=3e^{-x}(1+x)^2\), so \(y(2)=27/e^2\approx3.654\).
- **Audit focus:** Division requires \(y\ne0\) and \(x\ne-1\); integration gives \(\ln|y|\), not automatically \(\ln y\). The initial condition selects the positive branch on the maximal interval containing \(0\).
- **Schedule nuance:** No schedule-specific departure is recorded; inspect the excluded zero solution, absolute value, branch choice, and interval together.
- **Official resources:** [2025 paper](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2025/91579-exm-2025.pdf) · [2025 schedule](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2025/91579-ass-2025.pdf)
- **Inspect:** Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, Common mistake.
- **Status:** awaiting independent teacher review

### 11. AS91577 · 2020 · Question 3(d)

- **Public URL:** [https://calc.nz/complex-2020.html?q=3d](https://calc.nz/complex-2020.html?q=3d)
- **Original problem:** Solve \(z^4=-16k^8\) for real \(k\), giving polar form where applicable.
- **Corrected conclusion:** If \(k=0\), \(z=0\) is the only distinct root, with multiplicity 4. If \(k\ne0\), \(z=2k^2\operatorname{cis}(\pi/4+n\pi/2)\), \(n=0,1,2,3\).
- **Audit focus:** Zero has no unique polar argument, and substituting \(k=0\) into the non-zero formula does not produce four distinct roots.
- **Schedule nuance:** No checked 2020 paper or schedule URL is available in the official-resource manifest; review the multiplicity language against an authorised copy if available.
- **Official resources:** Paper and schedule are recorded as unavailable in the checked manifest.
- **Inspect:** Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, Common mistake.
- **Status:** awaiting independent teacher review

### 12. AS91577 · 2021 · Question 2(d)

- **Public URL:** [https://calc.nz/complex-2021.html?q=2d](https://calc.nz/complex-2021.html?q=2d)
- **Original problem:** Solve \(z^3=k^6+k^6i\) for real \(k\), giving polar form where applicable.
- **Corrected conclusion:** If \(k=0\), \(z=0\) is the only distinct root, with multiplicity 3. If \(k\ne0\), \(z=2^{1/6}k^2\operatorname{cis}(\pi/12+2n\pi/3)\), \(n=0,1,2\).
- **Audit focus:** The three-angle De Moivre list assumes a non-zero right side. The zero-parameter case must be stated separately and counted by multiplicity, not as three distinct polar roots.
- **Schedule nuance:** No schedule-specific departure is recorded; check the piecewise distinction and complete counter range.
- **Official resources:** [2021 paper](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2021/91577-exm-2021.pdf) · [2021 schedule](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2021/91577-ass-2021.pdf)
- **Inspect:** Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, Common mistake.
- **Status:** awaiting independent teacher review

### 13. AS91577 · 2022 · Question 3(c)

- **Public URL:** [https://calc.nz/complex-2022.html?q=3c](https://calc.nz/complex-2022.html?q=3c)
- **Original problem:** Solve \(z^3+k^6i=0\) for real \(k\), giving polar form where applicable.
- **Corrected conclusion:** If \(k=0\), \(z=0\) is the only distinct root, with multiplicity 3. If \(k\ne0\), \(z=k^2\operatorname{cis}(-\pi/6+2n\pi/3)\), \(n=0,1,2\).
- **Audit focus:** The zero right side has no unique argument. The non-zero polar-root rule applies only after separating \(k=0\) from \(k\ne0\).
- **Schedule nuance:** No schedule-specific departure is recorded; check the negative base argument and zero case separately.
- **Official resources:** [2022 paper](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2022/91577-exm-2022.pdf) · [2022 schedule](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2022/91577-ass-2022.pdf)
- **Inspect:** Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, Common mistake.
- **Status:** awaiting independent teacher review

### 14. AS91577 · 2023 · Question 2(d)

- **Public URL:** [https://calc.nz/complex-2023.html?q=2d](https://calc.nz/complex-2023.html?q=2d)
- **Original problem:** Solve \(z^3+64m^{12}=0\) for real \(m\), giving polar form where applicable.
- **Corrected conclusion:** If \(m=0\), \(z=0\) is the only distinct root, with multiplicity 3. If \(m\ne0\), \(z=4m^4\operatorname{cis}(\pi/3+2n\pi/3)\), \(n=0,1,2\).
- **Audit focus:** The non-zero root list is distinct only for \(m\ne0\). At \(m=0\), every listed modulus collapses to zero and polar argument is undefined.
- **Schedule nuance:** No schedule-specific departure is recorded; review that the zero case precedes assigning an argument.
- **Official resources:** [2023 paper](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2023/91577-exm-2023.pdf) · [2023 schedule](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2023/91577-ass-2023.pdf)
- **Inspect:** Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, Common mistake.
- **Status:** awaiting independent teacher review

### 15. AS91577 · 2024 · Question 3(d)

- **Public URL:** [https://calc.nz/complex-2024.html?q=3d](https://calc.nz/complex-2024.html?q=3d)
- **Original problem:** Solve \(z^4+81k^8=0\) for real \(k\), giving polar form where applicable.
- **Corrected conclusion:** If \(k=0\), \(z=0\) is the only distinct root, with multiplicity 4. If \(k\ne0\), \(z=3k^2\operatorname{cis}(\pi/4+n\pi/2)\), \(n=0,1,2,3\).
- **Audit focus:** The four non-zero roots are distinct only when \(k\ne0\). The zero case has one distinct root and no unique polar argument.
- **Schedule nuance:** No schedule-specific departure is recorded; inspect the piecewise answer and multiplicity wording.
- **Official resources:** [2024 paper](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2024/91577-exm-2024.pdf) · [2024 schedule](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2024/91577-ass-2024.pdf)
- **Inspect:** Question, Hints, Working, Checks, Mark reasoning, Final result, Verification, Common mistake.
- **Status:** awaiting independent teacher review

## Catalogue migration boundary

The shared renderer remains backward compatible. This remediation migrates the 15 mathematics questions named in the audit to the richer structure. The other 432 catalogue questions remain on the existing legacy record shape unless a safe shared default can improve them without inventing question-specific mathematical reasoning.

## Deployment

No deployment, publication, push, or production-infrastructure change is authorised for this remediation.
