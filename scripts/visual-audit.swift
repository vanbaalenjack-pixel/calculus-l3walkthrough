#!/usr/bin/env swift

import AppKit
import Foundation
import WebKit

/// A repeatable, live-equivalent visual smoke audit for the generated Calc.nz site.
///
/// Usage:
///   SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX15.4.sdk \
///     swift scripts/visual-audit.swift http://127.0.0.1:8003/
///
/// PNGs are written to `/tmp/calc-nz-visual-audit` by default. Pass a second
/// argument to use a different output directory.

private enum PageKind: String {
    case homepage
    case standards
    case standard
    case year
    case question
    case parameterQuestion
    case skill
    case about
}

private struct AuditCase {
    let slug: String
    let name: String
    let path: String
    let width: CGFloat
    let height: CGFloat
    let kind: PageKind
    let expectedH1Text: String

    var filename: String {
        "\(slug)-\(Int(width))x\(Int(height)).png"
    }
}

private let cases: [AuditCase] = [
    AuditCase(
        slug: "01-homepage-desktop",
        name: "Homepage — desktop",
        path: "index.html?visual-audit=desktop",
        width: 1280,
        height: 900,
        kind: .homepage,
        expectedH1Text: "Free NCEA maths worked answers"
    ),
    AuditCase(
        slug: "02-standards-desktop",
        name: "Standards directory — desktop",
        path: "standards.html?visual-audit=desktop",
        width: 1280,
        height: 900,
        kind: .standards,
        expectedH1Text: "NCEA maths standards"
    ),
    AuditCase(
        slug: "03-differentiation-standard-desktop",
        name: "Differentiation standard — desktop",
        path: "level-3-differentiation.html?visual-audit=desktop",
        width: 1280,
        height: 900,
        kind: .standard,
        expectedH1Text: "AS91578"
    ),
    AuditCase(
        slug: "04-differentiation-2025-year-desktop",
        name: "Differentiation 2025 year — desktop",
        path: "level-3-differentiation-2025.html?visual-audit=desktop",
        width: 1280,
        height: 900,
        kind: .year,
        expectedH1Text: "2025 Differentiation AS91578"
    ),
    AuditCase(
        slug: "05-level-2-calculus-question-desktop",
        name: "Level 2 Calculus question — desktop",
        path: "1a2025-l2.html?visual-audit=desktop",
        width: 1280,
        height: 900,
        kind: .question,
        expectedH1Text: "Level 2 Calculus — Question 1(a)"
    ),
    AuditCase(
        slug: "06-level-2-algebra-question-desktop",
        name: "Level 2 Algebra question — desktop",
        path: "alg-1a2025-l2.html?visual-audit=desktop",
        width: 1280,
        height: 900,
        kind: .question,
        expectedH1Text: "Level 2 Algebra — Question 1(a)"
    ),
    AuditCase(
        slug: "07-level-3-differentiation-question-desktop",
        name: "Level 3 Differentiation question — desktop",
        path: "1a2025.html?visual-audit=desktop",
        width: 1280,
        height: 900,
        kind: .question,
        expectedH1Text: "Level 3 Differentiation — Question 1(a)"
    ),
    AuditCase(
        slug: "08-level-3-integration-question-desktop",
        name: "Level 3 Integration question — desktop",
        path: "int-1a2025.html?visual-audit=desktop",
        width: 1280,
        height: 900,
        kind: .question,
        expectedH1Text: "Level 3 Integration — Question 1(a)"
    ),
    AuditCase(
        slug: "09-modern-complex-question-desktop",
        name: "Modern Complex Numbers question — desktop",
        path: "complex-1a2025.html?visual-audit=desktop",
        width: 1280,
        height: 900,
        kind: .question,
        expectedH1Text: "Level 3 Complex Numbers — Question 1(a)"
    ),
    AuditCase(
        slug: "10-parameter-complex-question-desktop",
        name: "Parameter-based Complex Numbers question — desktop",
        path: "complex-2024.html?q=1b&visual-audit=desktop",
        width: 1280,
        height: 900,
        kind: .parameterQuestion,
        expectedH1Text: "Level 3 Complex Numbers — Question 1(b)"
    ),
    AuditCase(
        slug: "11-chain-rule-skill-desktop",
        name: "Chain rule skill page — desktop",
        path: "skill-chain-rule.html?visual-audit=desktop",
        width: 1280,
        height: 900,
        kind: .skill,
        expectedH1Text: "Chain Rule NCEA practice questions"
    ),
    AuditCase(
        slug: "12-about-desktop",
        name: "About page — desktop",
        path: "about.html?visual-audit=desktop",
        width: 1280,
        height: 900,
        kind: .about,
        expectedH1Text: "About Calc.nz"
    ),
    AuditCase(
        slug: "13-homepage-mobile",
        name: "Homepage — mobile",
        path: "index.html?visual-audit=mobile",
        width: 390,
        height: 844,
        kind: .homepage,
        expectedH1Text: "Free NCEA maths worked answers"
    ),
    AuditCase(
        slug: "14-differentiation-question-mobile",
        name: "Differentiation question — mobile",
        path: "1a2025.html?visual-audit=mobile",
        width: 390,
        height: 844,
        kind: .question,
        expectedH1Text: "Level 3 Differentiation — Question 1(a)"
    ),
    AuditCase(
        slug: "15-chain-rule-skill-mobile",
        name: "Chain rule skill page — mobile",
        path: "skill-chain-rule.html?visual-audit=mobile",
        width: 390,
        height: 844,
        kind: .skill,
        expectedH1Text: "Chain Rule NCEA practice questions"
    ),
    AuditCase(
        slug: "16-homepage-tablet",
        name: "Homepage — tablet",
        path: "index.html?visual-audit=tablet",
        width: 768,
        height: 1024,
        kind: .homepage,
        expectedH1Text: "Free NCEA maths worked answers"
    )
]

private final class ConsoleCollector: NSObject, WKScriptMessageHandler {
    var messages: [String] = []

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        messages.append(String(describing: message.body))
    }
}

private final class VisualAuditRunner: NSObject, WKNavigationDelegate {
    private let baseURL: URL
    private let outputDirectory: URL
    private let webView: WKWebView
    private let consoleCollector: ConsoleCollector
    private var caseIndex = 0
    private var isEvaluating = false
    private var mainDocumentStatus: Int?
    private var failures: [String] = []

    init(baseURL: URL, outputDirectory: URL) {
        self.baseURL = baseURL
        self.outputDirectory = outputDirectory
        self.consoleCollector = ConsoleCollector()

        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.userContentController.add(consoleCollector, name: "visualAuditConsole")
        configuration.userContentController.addUserScript(WKUserScript(
            source: #"""
              window.__calcVisualAuditErrors = [];
              window.addEventListener("error", function (event) {
                const source = event.target && (event.target.src || event.target.href);
                const message = event.message || (source ? "Resource failed: " + source : "Resource load error");
                window.__calcVisualAuditErrors.push(message);
              }, true);
              window.addEventListener("unhandledrejection", function (event) {
                window.__calcVisualAuditErrors.push(String(event.reason || "Unhandled rejection"));
              });
              (function () {
                const originalError = console.error;
                console.error = function () {
                  const message = Array.prototype.join.call(arguments, " ");
                  window.__calcVisualAuditErrors.push(message);
                  window.webkit.messageHandlers.visualAuditConsole.postMessage(message);
                  return originalError.apply(console, arguments);
                };
              }());
            """#,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        ))

        self.webView = WKWebView(frame: .zero, configuration: configuration)
        super.init()
        self.webView.navigationDelegate = self
    }

    func start() {
        do {
            try FileManager.default.createDirectory(
                at: outputDirectory,
                withIntermediateDirectories: true
            )
        } catch {
            fputs("Could not create \(outputDirectory.path): \(error.localizedDescription)\n", stderr)
            exit(2)
        }
        runNext()
    }

    private func runNext() {
        guard caseIndex < cases.count else {
            finishAudit()
            return
        }

        let auditCase = cases[caseIndex]
        isEvaluating = false
        mainDocumentStatus = nil
        consoleCollector.messages.removeAll()
        webView.frame = CGRect(x: 0, y: 0, width: auditCase.width, height: auditCase.height)

        guard let url = URL(string: auditCase.path, relativeTo: baseURL) else {
            failCurrent("invalid URL")
            return
        }

        webView.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData))
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationResponse: WKNavigationResponse,
        decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void
    ) {
        if navigationResponse.isForMainFrame,
           let response = navigationResponse.response as? HTTPURLResponse {
            mainDocumentStatus = response.statusCode
        }
        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard !isEvaluating else { return }
        isEvaluating = true

        // Give deferred scripts, local question data, fonts, and KaTeX a stable
        // rendering window before assertions and the viewport snapshot.
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
            self?.evaluateCurrent()
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        failCurrent("navigation failed: \(error.localizedDescription)")
    }

    func webView(
        _ webView: WKWebView,
        didFailProvisionalNavigation navigation: WKNavigation!,
        withError error: Error
    ) {
        failCurrent("provisional navigation failed: \(error.localizedDescription)")
    }

    private func evaluateCurrent() {
        let auditCase = cases[caseIndex]
        let expectedH1 = javascriptString(auditCase.expectedH1Text)
        let kind = javascriptString(auditCase.kind.rawValue)

        let script = #"""
          (function () {
            const expectedH1 = \#(expectedH1);
            const kind = \#(kind);
            const checks = {};
            const details = {};
            const visible = function (element) {
              if (!element || element.hidden || element.classList.contains("hidden")) return false;
              const style = getComputedStyle(element);
              const rect = element.getBoundingClientRect();
              return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
            };
            const visibleH1s = Array.from(document.querySelectorAll("h1")).filter(visible);
            const canonical = document.querySelector('link[rel="canonical"]');
            const metaContent = function (selector) {
              const element = document.querySelector(selector);
              return element ? (element.getAttribute("content") || "") : "";
            };
            const ogImage = metaContent('meta[property="og:image"]');
            const twitterImage = metaContent('meta[name="twitter:image"]');
            const rootWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);

            details.url = window.location.href;
            details.title = document.title;
            details.h1 = visibleH1s.map(function (h1) { return h1.textContent.trim(); });
            details.scrollWidth = document.documentElement.scrollWidth;
            details.viewportWidth = rootWidth;
            details.pageHeight = document.documentElement.scrollHeight;
            details.errors = window.__calcVisualAuditErrors || [];

            checks.documentComplete = document.readyState === "complete";
            checks.oneVisibleH1 = visibleH1s.length === 1;
            checks.expectedH1 = visibleH1s.length === 1 && visibleH1s[0].textContent.includes(expectedH1);
            checks.noHorizontalOverflow = document.documentElement.scrollWidth <= rootWidth + 1;
            checks.titlePresent = document.title.trim().length > 12;
            checks.enNZLanguage = document.documentElement.lang.toLowerCase() === "en-nz";
            checks.absoluteCanonical = Boolean(canonical && /^https:\/\/calc\.nz\//.test(canonical.href));
            checks.socialPreviewImage = /^https:\/\/calc\.nz\//.test(ogImage)
              && twitterImage === ogImage
              && metaContent('meta[property="og:image:width"]') === "1200"
              && metaContent('meta[property="og:image:height"]') === "630"
              && metaContent('meta[property="og:image:alt"]').length > 10
              && metaContent('meta[name="twitter:image:alt"]').length > 10;
            checks.largeTwitterCard = metaContent('meta[name="twitter:card"]') === "summary_large_image";
            checks.socialCanonicalAgreement = Boolean(canonical)
              && metaContent('meta[property="og:url"]') === canonical.href;
            checks.mainLandmark = Boolean(document.querySelector("main"));
            checks.skipLink = Boolean(document.querySelector('.skip-link[href="#main-content"]'));
            checks.noJavaScriptErrors = details.errors.length === 0;

            if (kind === "homepage") {
              const availability = document.getElementById("catalogue-availability");
              const catalogue = window.CALC_NZ_QUESTION_CATALOGUE;
              const stageRoots = document.querySelectorAll("[data-level-panel], [data-standard-panel], [data-paper-panel]");
              checks.catalogueLoaded = Boolean(catalogue && Array.isArray(catalogue.levels));
              checks.availabilityCalculated = Boolean(availability && /447 walkthroughs/.test(availability.textContent));
              checks.selectorRendered = Boolean(document.querySelector("[data-level]"));
              checks.onlyCurrentSelectorStage = stageRoots.length <= 1;
              checks.practiceControls = Boolean(document.querySelector("[data-random-question]") && document.querySelector('[data-practice-set="10"]') && document.querySelector('[data-practice-set="20"]'));
              checks.searchReadyWithoutResults = Boolean(document.getElementById("walkthrough-search-input") && document.querySelector("[data-search-results][hidden]"));
              checks.skillsDiscoveryLink = Boolean(document.querySelector('a[href="skills.html"]'));
              checks.mobileHowToCollapsed = window.innerWidth > 480 || !document.querySelector("[data-home-how-details]").open;
              checks.levelChoicesNearTop = window.innerWidth > 480 || document.getElementById("choose-level").getBoundingClientRect().top < window.innerHeight * 2;
            }

            if (kind === "standards") {
              checks.fiveStandards = document.querySelectorAll(".standard-directory a.index-link-card").length === 5;
              checks.levelTwoAndThree = /Level 2/.test(document.body.textContent) && /Level 3/.test(document.body.textContent);
              checks.skillsLink = Boolean(document.querySelector('.standard-directory a[href="skills.html"]'));
            }

            if (kind === "standard") {
              checks.officialStandard = /AS91578/.test(document.body.textContent);
              checks.yearLinks = document.querySelectorAll('a.index-link-card[href^="level-3-differentiation-20"]').length >= 9;
              checks.skillLinks = document.querySelectorAll('a[href^="skill-"]').length >= 3;
              checks.officialNZQALink = Boolean(document.querySelector('a[href*="nzqa.govt.nz"]'));
            }

            if (kind === "year") {
              checks.paperOverview = Boolean(document.getElementById("paper-overview-heading"));
              checks.questionIndex = Boolean(document.getElementById("question-list-heading"));
              checks.questionLinks = document.querySelectorAll('a.index-link-card[href$="2025.html"]').length >= 10;
              checks.officialNZQALink = Boolean(document.querySelector('a[href*="nzqa.govt.nz"]'));
            }

            if (kind === "question" || kind === "parameterQuestion") {
              const questionCard = document.getElementById("question-card");
              const hintsCard = document.getElementById("hints-card");
              const walkthrough = document.getElementById("walkthrough-content");
              const revealButtons = Array.from(document.querySelectorAll(".step-working-btn"));
              const hintButtons = Array.from(document.querySelectorAll(".walkthrough-tip-toggle"));
              const katex = Array.from(document.querySelectorAll(".katex"));
              checks.questionRendered = Boolean(questionCard && visible(questionCard) && questionCard.textContent.trim().length > 20);
              checks.questionCardNoOverflow = Boolean(questionCard && questionCard.scrollWidth <= questionCard.clientWidth + 1);
              checks.questionBeforeOverview = Boolean(questionCard && document.querySelector(".seo-question-overview") && (questionCard.compareDocumentPosition(document.querySelector(".seo-question-overview")) & Node.DOCUMENT_POSITION_FOLLOWING));
              checks.walkthroughRendered = Boolean(walkthrough && visible(walkthrough) && document.querySelector(".walkthrough-progress-card"));
              checks.hintsRendered = Boolean(hintsCard && (visible(hintsCard) || hintButtons.length === 0));
              checks.saveControls = Boolean(document.getElementById("bookmark-question-btn") && document.getElementById("retry-question-btn"));
              checks.backToPaper = Boolean(document.getElementById("back-link"));
              checks.breadcrumb = Boolean(document.querySelector('nav[aria-label="Breadcrumb"]'));
              checks.revealA11y = revealButtons.length > 0 && revealButtons.every(function (button) {
                const controlled = document.getElementById(button.getAttribute("aria-controls"));
                return /Step \d+:/.test(button.getAttribute("aria-label") || "") && button.hasAttribute("aria-expanded") && Boolean(controlled);
              });
              checks.hintA11y = hintButtons.every(function (button) {
                return button.hasAttribute("aria-expanded") && Boolean(document.getElementById(button.getAttribute("aria-controls")));
              });
              checks.mathAccessible = katex.length === 0 || katex.every(function (node) {
                return Boolean(node.querySelector(".katex-mathml") && node.querySelector('.katex-html[aria-hidden="true"]'));
              });
              checks.questionInFirstScreen = window.innerWidth > 480 || questionCard.getBoundingClientRect().top < window.innerHeight;
              checks.mobileProgress = window.innerWidth > 480 || Boolean(document.querySelector(".walkthrough-mobile-progress"));
            }

            if (kind === "parameterQuestion") {
              const overviewQuestion = document.querySelector("[data-seo-overview-question]");
              checks.queryPreserved = new URLSearchParams(window.location.search).get("q") === "1b";
              checks.questionOneBOverview = Boolean(overviewQuestion && overviewQuestion.textContent.trim() === "Question 1(b)");
              checks.questionOneBCanonical = Boolean(canonical && canonical.href === "https://calc.nz/complex-2024.html?q=1b");
              checks.questionOneBMethodMetadata = /De Moivre/i.test(document.title)
                && /De Moivre/i.test(metaContent('meta[name="description"]'))
                && metaContent('meta[property="og:title"]') === document.title
                && metaContent('meta[name="twitter:title"]') === document.title;
              checks.questionOneBStructuredData = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some(function (script) {
                return script.textContent.includes("https://calc.nz/complex-2024.html?q=1b")
                  && script.textContent.includes("Question 1(b)");
              });
            }

            if (kind === "skill") {
              checks.substantialOverview = Boolean(document.getElementById("skill-overview-heading") && document.getElementById("skill-mistakes-heading"));
              checks.multipleYears = document.querySelectorAll(".skill-question-group").length >= 3;
              checks.relatedQuestions = document.querySelectorAll('.skill-question-group a.index-link-card').length >= 6;
              checks.standardAndYearLinks = Boolean(document.querySelector('.skill-question-group a[href="level-3-differentiation.html"]') && document.querySelector('.skill-question-group a[href^="level-3-differentiation-20"]'));
            }

            if (kind === "about") {
              const bodyText = document.body.textContent;
              const creatorName = ["Jack", "van", "Baa" + "len"].join(" ");
              checks.creatorExplained = bodyText.includes(creatorName);
              checks.aiExplained = /AI tools were used/.test(bodyText);
              checks.independenceExplained = /not affiliated with or endorsed by NZQA/.test(bodyText);
              checks.localStorageExplained = /stored only in the browser/.test(bodyText);
              checks.correctionsLink = Boolean(document.querySelector('a[href*="docs.google.com/forms"]'));
            }

            return JSON.stringify({
              checks: checks,
              failedChecks: Object.keys(checks).filter(function (key) { return !checks[key]; }),
              details: details
            });
          }());
        """#

        webView.evaluateJavaScript(script) { [weak self] result, error in
            guard let self else { return }

            var reasons: [String] = []
            if self.mainDocumentStatus != 200 {
                reasons.append("HTTP status \(self.mainDocumentStatus.map(String.init) ?? "missing")")
            }

            if let error {
                reasons.append("browser assertions failed: \(error.localizedDescription)")
            } else if let json = result as? String,
                      let data = json.data(using: .utf8),
                      let payload = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                      let failedChecks = payload["failedChecks"] as? [String],
                      let details = payload["details"] as? [String: Any] {
                if !failedChecks.isEmpty {
                    reasons.append("failed checks: \(failedChecks.sorted().joined(separator: ", "))")
                }
                if let errors = details["errors"] as? [String], !errors.isEmpty {
                    reasons.append("page errors: \(errors.joined(separator: " | "))")
                }
            } else {
                reasons.append("could not decode assertion result")
            }

            if !self.consoleCollector.messages.isEmpty {
                reasons.append("console errors: \(self.consoleCollector.messages.joined(separator: " | "))")
            }

            self.captureCurrent(reasons: reasons)
        }
    }

    private func captureCurrent(reasons: [String]) {
        let auditCase = cases[caseIndex]
        let configuration = WKSnapshotConfiguration()
        configuration.rect = CGRect(x: 0, y: 0, width: auditCase.width, height: auditCase.height)
        configuration.afterScreenUpdates = true

        webView.takeSnapshot(with: configuration) { [weak self] image, error in
            guard let self else { return }
            var caseReasons = reasons
            let destination = self.outputDirectory.appendingPathComponent(auditCase.filename)

            if let error {
                caseReasons.append("snapshot failed: \(error.localizedDescription)")
            } else if let image,
                      let tiff = image.tiffRepresentation,
                      let bitmap = NSBitmapImageRep(data: tiff),
                      let png = bitmap.representation(using: .png, properties: [:]) {
                do {
                    try png.write(to: destination, options: .atomic)
                } catch {
                    caseReasons.append("could not write PNG: \(error.localizedDescription)")
                }
            } else {
                caseReasons.append("snapshot produced no PNG data")
            }

            if caseReasons.isEmpty {
                print("PASS \(auditCase.name) → \(destination.path)")
            } else {
                let message = "\(auditCase.name): \(caseReasons.joined(separator: "; "))"
                self.failures.append(message)
                print("FAIL \(message)")
            }

            self.caseIndex += 1
            self.runNext()
        }
    }

    private func failCurrent(_ reason: String) {
        guard caseIndex < cases.count else { return }
        let auditCase = cases[caseIndex]
        failures.append("\(auditCase.name): \(reason)")
        print("FAIL \(auditCase.name): \(reason)")
        caseIndex += 1
        runNext()
    }

    private func finishAudit() {
        let passed = cases.count - failures.count
        print("\nVisual audit: \(passed)/\(cases.count) viewport cases passed.")
        print("Screenshots: \(outputDirectory.path)")

        if failures.isEmpty {
            NSApplication.shared.terminate(nil)
            return
        }

        print("Failures:")
        failures.forEach { print("- \($0)") }
        exit(1)
    }

    private func javascriptString(_ value: String) -> String {
        guard let data = try? JSONSerialization.data(withJSONObject: [value]),
              let encoded = String(data: data, encoding: .utf8) else {
            return "\"\""
        }
        return String(encoded.dropFirst().dropLast())
    }
}

private func normalisedBaseURL(_ rawValue: String) -> URL? {
    let value = rawValue.hasSuffix("/") ? rawValue : rawValue + "/"
    return URL(string: value)
}

let rawBaseURL = CommandLine.arguments.dropFirst().first ?? "http://127.0.0.1:8003/"
let outputPath = CommandLine.arguments.dropFirst(2).first ?? "/tmp/calc-nz-visual-audit"

guard let baseURL = normalisedBaseURL(rawBaseURL) else {
    fputs("Invalid base URL: \(rawBaseURL)\n", stderr)
    exit(2)
}

private let runner = VisualAuditRunner(
    baseURL: baseURL,
    outputDirectory: URL(fileURLWithPath: outputPath, isDirectory: true)
)
runner.start()
NSApplication.shared.run()
