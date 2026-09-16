#!/usr/bin/env swift

import AppKit
import Foundation
import WebKit

/// Final responsive browser audit for the Calc.nz polish work.
///
/// The script intentionally uses WebKit rather than DOM-only parsing: it verifies
/// the rendered page, responsive CSS, progressive enhancement, and query-driven
/// legacy Complex Numbers identity together.
///
/// Usage:
///   swift scripts/final-responsive-audit.swift \
///     http://127.0.0.1:8003/ \
///     /tmp/calc-nz-final-responsive-audit

private struct Viewport {
    let width: CGFloat
    let height: CGFloat

    var label: String {
        "\(Int(width))x\(Int(height))"
    }

    var isCompact: Bool {
        width <= 600
    }
}

private let phone320 = Viewport(width: 320, height: 568)
private let phone375 = Viewport(width: 375, height: 812)
private let phone390 = Viewport(width: 390, height: 844)
private let tablet768 = Viewport(width: 768, height: 1024)
private let desktop1366 = Viewport(width: 1366, height: 768)
private let desktop1440 = Viewport(width: 1440, height: 900)

private enum PageKind: String {
    case homepage
    case directory
    case skill
    case standard
    case paper
    case walkthrough
    case legacyWalkthrough
    case search
    case notFound
}

private struct AuditCase {
    let slug: String
    let name: String
    let path: String
    let viewport: Viewport
    let kind: PageKind
    let expectedH1: String
    let expectedCanonical: String
    let legacyYear: Int?

    init(
        slug: String,
        name: String,
        path: String,
        viewport: Viewport,
        kind: PageKind,
        expectedH1: String,
        expectedCanonical: String,
        legacyYear: Int? = nil
    ) {
        self.slug = slug
        self.name = name
        self.path = path
        self.viewport = viewport
        self.kind = kind
        self.expectedH1 = expectedH1
        self.expectedCanonical = expectedCanonical
        self.legacyYear = legacyYear
    }

    var filename: String {
        "\(slug)-\(viewport.label).png"
    }
}

private let homepageViewports = [
    phone320,
    phone375,
    phone390,
    tablet768,
    desktop1366,
    desktop1440
]

private let homepageCases: [AuditCase] = homepageViewports.enumerated().map { offset, viewport in
    AuditCase(
        slug: String(format: "%02d-homepage", offset + 1),
        name: "Homepage — \(viewport.label)",
        path: "index.html?final-responsive-audit=\(viewport.label)",
        viewport: viewport,
        kind: .homepage,
        expectedH1: "Level 3 Calculus worked answers and walkthroughs",
        expectedCanonical: "https://calc.nz/"
    )
}

private let representativeCases: [AuditCase] = [
    AuditCase(
        slug: "07-standards",
        name: "Standards directory — mobile",
        path: "standards.html?final-responsive-audit=mobile",
        viewport: phone320,
        kind: .directory,
        expectedH1: "NCEA maths standards",
        expectedCanonical: "https://calc.nz/standards.html"
    ),
    AuditCase(
        slug: "08-skills",
        name: "Skills directory — mobile",
        path: "skills.html?final-responsive-audit=mobile",
        viewport: phone375,
        kind: .directory,
        expectedH1: "Browse NCEA maths questions by skill",
        expectedCanonical: "https://calc.nz/skills.html"
    ),
    AuditCase(
        slug: "09-complex-algebra-skill",
        name: "Complex-number Algebra skill — mobile",
        path: "skill-complex-number-algebra.html?final-responsive-audit=mobile",
        viewport: phone390,
        kind: .skill,
        expectedH1: "Complex-number Algebra NCEA practice questions",
        expectedCanonical: "https://calc.nz/skill-complex-number-algebra.html"
    ),
    AuditCase(
        slug: "10-as91577-standard",
        name: "AS91577 standard — tablet",
        path: "level-3-complex-numbers.html?final-responsive-audit=tablet",
        viewport: tablet768,
        kind: .standard,
        expectedH1: "AS91577",
        expectedCanonical: "https://calc.nz/level-3-complex-numbers.html"
    ),
    AuditCase(
        slug: "11-complex-2025-paper",
        name: "2025 Complex Numbers paper — narrow mobile",
        path: "level-3-complex-numbers-2025.html?final-responsive-audit=mobile",
        viewport: phone320,
        kind: .paper,
        expectedH1: "2025 Complex Numbers AS91577",
        expectedCanonical: "https://calc.nz/level-3-complex-numbers-2025.html"
    ),
    AuditCase(
        slug: "12-complex-2025-walkthrough",
        name: "2025 Complex Numbers Question 2(e) — mobile",
        path: "complex-2e2025.html?final-responsive-audit=mobile",
        viewport: phone390,
        kind: .walkthrough,
        expectedH1: "2025 NCEA Level 3 Complex Numbers — Question 2(e)",
        expectedCanonical: "https://calc.nz/complex-2e2025.html"
    ),
    AuditCase(
        slug: "13-search",
        name: "Search — desktop",
        path: "search.html?final-responsive-audit=desktop",
        viewport: desktop1366,
        kind: .search,
        expectedH1: "Search Calc.nz",
        expectedCanonical: "https://calc.nz/search.html"
    ),
    AuditCase(
        slug: "14-branded-404",
        name: "Branded 404 document — desktop",
        path: "404.html",
        viewport: desktop1440,
        kind: .notFound,
        expectedH1: "That page isn’t here",
        expectedCanonical: "https://calc.nz/404.html"
    )
]

private let legacyViewports = [
    phone320,
    phone375,
    phone390,
    tablet768,
    desktop1366,
    desktop1440,
    phone320,
    phone390
]

private let legacyCases: [AuditCase] = Array(2017...2024).enumerated().map { offset, year in
    let viewport = legacyViewports[offset]
    return AuditCase(
        slug: String(format: "%02d-complex-%d-q2e", offset + 15, year),
        name: "Legacy \(year) Complex Numbers Question 2(e) — \(viewport.label)",
        path: "complex-\(year).html?q=2e",
        viewport: viewport,
        kind: .legacyWalkthrough,
        expectedH1: "\(year) NCEA Level 3 Complex Numbers — Question 2(e)",
        expectedCanonical: "https://calc.nz/complex-\(year).html?q=2e",
        legacyYear: year
    )
}

private let auditCases = homepageCases + representativeCases + legacyCases

private final class ConsoleCollector: NSObject, WKScriptMessageHandler {
    var messages: [String] = []

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        messages.append(String(describing: message.body))
    }
}

private final class FinalResponsiveAuditRunner: NSObject, WKNavigationDelegate {
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
        configuration.userContentController.add(consoleCollector, name: "finalResponsiveConsole")
        configuration.userContentController.addUserScript(WKUserScript(
            source: #"""
              window.__calcFinalResponsiveErrors = [];
              window.addEventListener("error", function (event) {
                const target = event.target;
                const resource = target && target !== window && (target.currentSrc || target.src || target.href);
                const message = event.message || (resource ? "Resource failed: " + resource : "Resource load error");
                window.__calcFinalResponsiveErrors.push(String(message));
              }, true);
              window.addEventListener("unhandledrejection", function (event) {
                window.__calcFinalResponsiveErrors.push(String(event.reason || "Unhandled rejection"));
              });
              (function () {
                const originalError = console.error;
                console.error = function () {
                  const message = Array.prototype.join.call(arguments, " ");
                  window.__calcFinalResponsiveErrors.push(message);
                  window.webkit.messageHandlers.finalResponsiveConsole.postMessage(message);
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
        guard caseIndex < auditCases.count else {
            finishAudit()
            return
        }

        let auditCase = auditCases[caseIndex]
        isEvaluating = false
        mainDocumentStatus = nil
        consoleCollector.messages.removeAll()
        webView.frame = CGRect(
            x: 0,
            y: 0,
            width: auditCase.viewport.width,
            height: auditCase.viewport.height
        )

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

        // Deferred page scripts, local data, fonts, and KaTeX all settle inside
        // this window on the local static server used by the test suite.
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
        let auditCase = auditCases[caseIndex]
        let kind = javascriptString(auditCase.kind.rawValue)
        let expectedH1 = javascriptString(auditCase.expectedH1)
        let expectedCanonical = javascriptString(auditCase.expectedCanonical)
        let legacyYear = auditCase.legacyYear.map(String.init) ?? "null"
        let compact = auditCase.viewport.isCompact ? "true" : "false"

        let script = #"""
          (function () {
            const kind = \#(kind);
            const expectedH1 = \#(expectedH1);
            const expectedCanonical = \#(expectedCanonical);
            const legacyYear = \#(legacyYear);
            const compact = \#(compact);
            const checks = {};
            const metrics = {};
            const visible = function (element) {
              if (!element || element.hidden) return false;
              const style = getComputedStyle(element);
              const rect = element.getBoundingClientRect();
              return style.display !== "none"
                && style.visibility !== "hidden"
                && rect.width > 0
                && rect.height > 0;
            };
            const meta = function (selector) {
              const element = document.querySelector(selector);
              return element ? (element.getAttribute("content") || "") : "";
            };
            const canonical = document.querySelector('link[rel="canonical"]');
            const h1s = Array.from(document.querySelectorAll("h1"));
            const visibleH1s = h1s.filter(visible);
            const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
            const documentWidth = Math.max(
              document.documentElement.scrollWidth,
              document.body ? document.body.scrollWidth : 0
            );
            const navChildren = Array.from(document.querySelectorAll(".nav-row > *")).filter(visible);

            metrics.url = location.href;
            metrics.title = document.title;
            metrics.viewport = window.innerWidth + "x" + window.innerHeight;
            metrics.pageHeight = document.documentElement.scrollHeight;
            metrics.scrollWidth = documentWidth;
            metrics.consoleErrors = (window.__calcFinalResponsiveErrors || []).slice();

            checks.httpDocumentReady = document.readyState === "complete";
            checks.oneH1 = h1s.length === 1 && visibleH1s.length === 1;
            checks.expectedH1 = visibleH1s.length === 1
              && visibleH1s[0].textContent.trim().includes(expectedH1);
            checks.noHorizontalOverflow = documentWidth <= viewportWidth + 1;
            checks.noConsoleErrors = metrics.consoleErrors.length === 0;
            checks.canonicalAgreement = Boolean(canonical)
              && canonical.href === expectedCanonical
              && meta('meta[property="og:url"]') === expectedCanonical;
            checks.mainAndSkipLink = Boolean(document.querySelector("main"))
              && Boolean(document.querySelector('.skip-link[href="#main-content"]'))
              && Boolean(document.getElementById("main-content"));
            checks.naturalMobileNavBasis = !compact || navChildren.every(function (element) {
              return getComputedStyle(element).flexBasis !== "220px";
            });

            const menuToggle = document.querySelector(".site-menu-toggle");
            if (compact) {
              const menuLinksContainer = document.getElementById("site-header-links");
              const toggleRect = menuToggle && menuToggle.getBoundingClientRect();
              checks.mobileMenuNamed = Boolean(menuToggle)
                && /menu/i.test(menuToggle.getAttribute("aria-label") || menuToggle.textContent)
                && menuToggle.getAttribute("aria-expanded") === "false"
                && menuToggle.getAttribute("aria-controls") === "site-header-links"
                && Boolean(menuLinksContainer);
              checks.mobileMenuToggle44 = Boolean(toggleRect)
                && toggleRect.width >= 44
                && toggleRect.height >= 44;

              if (menuToggle && menuLinksContainer) {
                menuToggle.focus();
                menuToggle.click();
                const menuLinks = Array.from(menuLinksContainer.querySelectorAll("a[href]")).filter(visible);
                checks.mobileMenuOpens = menuToggle.getAttribute("aria-expanded") === "true"
                  && menuLinks.length >= 4;
                checks.mobileMenuLinks44 = menuLinks.length >= 4 && menuLinks.every(function (link) {
                  const rect = link.getBoundingClientRect();
                  return rect.width >= 44 && rect.height >= 44;
                });
                document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
                checks.mobileMenuEscape = menuToggle.getAttribute("aria-expanded") === "false"
                  && document.activeElement === menuToggle;
              } else {
                checks.mobileMenuOpens = false;
                checks.mobileMenuLinks44 = false;
                checks.mobileMenuEscape = false;
              }
            } else {
              checks.desktopNavigationVisible = Boolean(document.querySelector(".site-header-links"))
                && Array.from(document.querySelectorAll(".site-header-link")).filter(visible).length >= 4;
            }

            if (kind === "homepage") {
              const cta = document.querySelector("[data-reveal-level-picker]");
              const ctaRect = cta && cta.getBoundingClientRect();
              metrics.ctaTop = ctaRect ? Math.round(ctaRect.top) : null;
              metrics.ctaBottom = ctaRect ? Math.round(ctaRect.bottom) : null;
              checks.primaryCTA = Boolean(ctaRect) && ctaRect.height >= 44;
              checks.desktopCTAInFold = window.innerWidth !== 1366 || ctaRect.bottom <= window.innerHeight;
              checks.smallMobileCTAInFold = window.innerWidth !== 320 || ctaRect.bottom <= window.innerHeight;
              checks.homeSemanticBenefits = document.querySelectorAll(".home-hero-benefits > li").length === 3;
              checks.homeAvailability = /(?:Level 3 walkthrough availability is loading|420 Level 3 walkthroughs across 3 standards, 28 papers)/.test(
                (document.getElementById("catalogue-availability") || {}).textContent || ""
              );
            }

            if (kind === "directory") {
              checks.directoryLinks = document.querySelectorAll("a.index-link-card[href]").length >= 5;
            }

            if (kind === "skill") {
              const questionLinks = Array.from(document.querySelectorAll('.skill-question-group a.index-link-card[href]'));
              checks.skillQuestionsCrawlable = questionLinks.length >= 20;
              checks.skillYearNavigation = document.querySelectorAll('.skill-jump-nav a.skill-jump-link[href^="#"]').length >= 3;
              checks.skillRandomQuestion = Boolean(document.querySelector("[data-skill-random]"));
              checks.skillSemanticGroups = document.querySelectorAll("details.skill-question-group").length >= 3;
              checks.skillQuestionCardsNatural = !compact || questionLinks.filter(visible).every(function (link) {
                const rect = link.getBoundingClientRect();
                const style = getComputedStyle(link);
                return rect.height >= 44 && style.flexBasis !== "220px";
              });
            }

            if (kind === "standard") {
              checks.as91577Context = /AS91577/.test(document.body.textContent)
                && Boolean(document.querySelector('a[href*="nzqa.govt.nz"]'));
              checks.standardYearLinks = document.querySelectorAll('a.index-link-card[href^="level-3-complex-numbers-20"]').length >= 8;
            }

            if (kind === "paper") {
              const firstQuestion = document.querySelector('.paper-question-section a.index-link-card[href], #question-list-heading + * a.index-link-card[href], #question-list-heading ~ * a.index-link-card[href]');
              const firstQuestionRect = firstQuestion && firstQuestion.getBoundingClientRect();
              metrics.firstPaperQuestionTop = firstQuestionRect ? Math.round(firstQuestionRect.top) : null;
              checks.paperQuestionLinks = document.querySelectorAll('a.index-link-card[href^="complex-"][href$="2025.html"]').length === 15;
              checks.firstPaperQuestionNearTop = !compact || Boolean(firstQuestionRect && firstQuestionRect.top < 900);
            }

            if (kind === "walkthrough" || kind === "legacyWalkthrough") {
              const questionCard = document.getElementById("question-card");
              const questionRect = questionCard && questionCard.getBoundingClientRect();
              metrics.questionTop = questionRect ? Math.round(questionRect.top) : null;
              checks.walkthroughQuestionRendered = Boolean(questionCard)
                && visible(questionCard)
                && questionCard.textContent.trim().length > 20;
              checks.walkthroughQuestionFirstScreen = !compact
                || Boolean(questionRect && questionRect.top < window.innerHeight);
              checks.walkthroughEnhancementOnce = Boolean(document.getElementById("walkthrough-content"))
                && Boolean(document.getElementById("hints-card"))
                && document.querySelectorAll("#question-card").length === 1
                && document.querySelectorAll("#hints-card").length === 1
                && document.querySelectorAll("#walkthrough-content").length === 1;
            }

            if (kind === "legacyWalkthrough") {
              const year = String(legacyYear);
              const query = new URLSearchParams(location.search).get("q");
              const description = meta('meta[name="description"]');
              const breadcrumbQuestion = document.querySelector("[data-seo-breadcrumb-question]");
              const overviewQuestion = document.querySelector("[data-seo-overview-question]");
              const record = window.CALC_NZ_PAGE_RECORD
                || (window.CALC_NZ_PAGE_RECORDS && window.CALC_NZ_PAGE_RECORDS["2e"]);
              checks.legacyQueryPreserved = query === "2e";
              checks.legacyRenderedRecord = Boolean(record)
                && String(record.paper.year) === year
                && record.question.id === "2e"
                && record.question.canonical === expectedCanonical;
              checks.legacyTitleIdentity = document.title.includes(year)
                && /Q(?:uestion )?2\(e\)/.test(document.title);
              checks.legacyDescriptionIdentity = description.includes(year)
                && description.includes("Question 2(e)");
              checks.legacySocialIdentity = meta('meta[property="og:title"]') === document.title
                && meta('meta[name="twitter:title"]') === document.title;
              checks.legacyVisibleIdentity = Boolean(breadcrumbQuestion)
                && breadcrumbQuestion.textContent.trim() === "Question 2(e)"
                && Boolean(overviewQuestion)
                && overviewQuestion.textContent.trim() === "Question 2(e)";
              checks.legacyStructuredIdentity = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some(function (node) {
                return node.textContent.includes(expectedCanonical)
                  && node.textContent.includes("Question 2(e)");
              });
            }

            if (kind === "search") {
              checks.searchControls = Boolean(document.querySelector('input[type="search"]'))
                && Boolean(document.querySelector("[data-global-search-results]"));
            }

            if (kind === "notFound") {
              checks.branded404 = /404|Page not found/i.test(document.body.textContent)
                && Boolean(document.querySelector('a[href="/"]'))
                && Boolean(document.querySelector('a[href="standards.html"]'))
                && Boolean(document.querySelector('a[href="skills.html"]'))
                && Boolean(document.querySelector('a[href="search.html"]'));
            }

            return JSON.stringify({
              checks: checks,
              failedChecks: Object.keys(checks).filter(function (key) { return !checks[key]; }),
              metrics: metrics
            });
          }());
        """#

        webView.evaluateJavaScript(script) { [weak self] result, error in
            guard let self else { return }

            var reasons: [String] = []
            var metrics: [String: Any] = [:]
            if self.mainDocumentStatus != 200 {
                reasons.append("HTTP status \(self.mainDocumentStatus.map(String.init) ?? "missing")")
            }

            if let error {
                reasons.append("browser assertions failed: \(error.localizedDescription)")
            } else if let json = result as? String,
                      let data = json.data(using: .utf8),
                      let payload = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                      let failedChecks = payload["failedChecks"] as? [String] {
                metrics = payload["metrics"] as? [String: Any] ?? [:]
                if !failedChecks.isEmpty {
                    reasons.append("failed checks: \(failedChecks.sorted().joined(separator: ", "))")
                }
                if let errors = metrics["consoleErrors"] as? [String], !errors.isEmpty {
                    reasons.append("page errors: \(errors.joined(separator: " | "))")
                }
            } else {
                reasons.append("could not decode assertion result")
            }

            if !self.consoleCollector.messages.isEmpty {
                reasons.append("console errors: \(self.consoleCollector.messages.joined(separator: " | "))")
            }

            self.captureCurrent(reasons: reasons, metrics: metrics)
        }
    }

    private func captureCurrent(reasons: [String], metrics: [String: Any]) {
        let auditCase = auditCases[caseIndex]
        let configuration = WKSnapshotConfiguration()
        configuration.rect = CGRect(
            x: 0,
            y: 0,
            width: auditCase.viewport.width,
            height: auditCase.viewport.height
        )
        configuration.afterScreenUpdates = true

        // The compact menu assertion closes the menu with Escape. A short delay
        // keeps the saved image representative of the stable, closed page state.
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { [weak self] in
            guard let self else { return }
            self.webView.takeSnapshot(with: configuration) { [weak self] image, error in
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

                let metricSummary = self.metricSummary(metrics)
                if caseReasons.isEmpty {
                    print("PASS \(auditCase.name)\(metricSummary) → \(destination.path)")
                } else {
                    let message = "\(auditCase.name): \(caseReasons.joined(separator: "; "))\(metricSummary)"
                    self.failures.append(message)
                    print("FAIL \(message)")
                }

                self.caseIndex += 1
                self.runNext()
            }
        }
    }

    private func metricSummary(_ metrics: [String: Any]) -> String {
        var values: [String] = []
        if let pageHeight = metrics["pageHeight"] as? NSNumber {
            values.append("page h=\(pageHeight.intValue)")
        }
        if let ctaBottom = metrics["ctaBottom"] as? NSNumber {
            values.append("CTA bottom=\(ctaBottom.intValue)")
        }
        if let firstQuestion = metrics["firstPaperQuestionTop"] as? NSNumber {
            values.append("first question y=\(firstQuestion.intValue)")
        }
        if let questionTop = metrics["questionTop"] as? NSNumber {
            values.append("question y=\(questionTop.intValue)")
        }
        return values.isEmpty ? "" : " [\(values.joined(separator: ", "))]"
    }

    private func failCurrent(_ reason: String) {
        guard caseIndex < auditCases.count else { return }
        let auditCase = auditCases[caseIndex]
        failures.append("\(auditCase.name): \(reason)")
        print("FAIL \(auditCase.name): \(reason)")
        caseIndex += 1
        runNext()
    }

    private func finishAudit() {
        let passed = auditCases.count - failures.count
        print("\nFinal responsive audit: \(passed)/\(auditCases.count) cases passed.")
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
let outputPath = CommandLine.arguments.dropFirst(2).first ?? "/tmp/calc-nz-final-responsive-audit"

guard let baseURL = normalisedBaseURL(rawBaseURL) else {
    fputs("Invalid base URL: \(rawBaseURL)\n", stderr)
    exit(2)
}

private let runner = FinalResponsiveAuditRunner(
    baseURL: baseURL,
    outputDirectory: URL(fileURLWithPath: outputPath, isDirectory: true)
)
runner.start()
NSApplication.shared.run()
