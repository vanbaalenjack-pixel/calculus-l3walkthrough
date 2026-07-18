#!/usr/bin/env swift

import Foundation
import AppKit
import WebKit

private struct TestCase {
    let name: String
    let path: String
    let width: CGFloat
    let height: CGFloat
    let expectedPart: String?
    let expectedSteps: Int?
    let revealAll: Bool
    let preferenceAction: String
    let legacyRedirect: Bool
    let snapshotName: String?
}

private let tests = [
    TestCase(name: "1(a) desktop reveals and disables sticky", path: "1a2020.html#question-1a", width: 1280, height: 900, expectedPart: "1a", expectedSteps: 4, revealAll: true, preferenceAction: "disable", legacyRedirect: false, snapshotName: nil),
    TestCase(name: "sticky preference survives refresh", path: "1a2020.html#question-1a", width: 1280, height: 900, expectedPart: "1a", expectedSteps: 4, revealAll: false, preferenceAction: "verify-disabled-then-enable", legacyRedirect: false, snapshotName: "calc-walkthrough-desktop.png"),
    TestCase(name: "1(e) desktop", path: "1e2020.html#question-1e", width: 1280, height: 900, expectedPart: "1e", expectedSteps: 4, revealAll: true, preferenceAction: "none", legacyRedirect: false, snapshotName: nil),
    TestCase(name: "2(d) desktop tall question", path: "2d2020.html#question-2d", width: 1280, height: 900, expectedPart: "2d", expectedSteps: 4, revealAll: true, preferenceAction: "none", legacyRedirect: false, snapshotName: nil),
    TestCase(name: "2(e) desktop", path: "2e2020.html#question-2e", width: 1280, height: 900, expectedPart: "2e", expectedSteps: 3, revealAll: true, preferenceAction: "none", legacyRedirect: false, snapshotName: nil),
    TestCase(name: "3(e) desktop", path: "3e2020.html#question-3e", width: 1280, height: 900, expectedPart: "3e", expectedSteps: 3, revealAll: true, preferenceAction: "none", legacyRedirect: false, snapshotName: nil),
    TestCase(name: "1(a) mobile", path: "1a2020.html#question-1a", width: 390, height: 844, expectedPart: "1a", expectedSteps: 4, revealAll: true, preferenceAction: "mobile-toggle", legacyRedirect: false, snapshotName: nil),
    TestCase(name: "2(d) mobile tall question", path: "2d2020.html#question-2d", width: 390, height: 844, expectedPart: "2d", expectedSteps: 4, revealAll: false, preferenceAction: "none", legacyRedirect: false, snapshotName: "calc-walkthrough-mobile.png"),
    TestCase(name: "sitewide setting on 2021 walkthrough", path: "1a2021.html", width: 1280, height: 900, expectedPart: nil, expectedSteps: 3, revealAll: false, preferenceAction: "none", legacyRedirect: false, snapshotName: nil),
    TestCase(name: "guided sequential walkthrough", path: "1a2020.html?mode=guided#question-1a", width: 1280, height: 900, expectedPart: "1a", expectedSteps: 4, revealAll: true, preferenceAction: "guided", legacyRedirect: false, snapshotName: "guided-walkthrough-desktop.png"),
    TestCase(name: "legacy guided single-step walkthrough", path: "1a2022.html?mode=guided", width: 1280, height: 900, expectedPart: nil, expectedSteps: 6, revealAll: false, preferenceAction: "legacy-guided", legacyRedirect: false, snapshotName: nil),
    TestCase(name: "homepage drill-down flow", path: "index.html?smoke=flow", width: 1280, height: 900, expectedPart: nil, expectedSteps: nil, revealAll: false, preferenceAction: "index-flow", legacyRedirect: false, snapshotName: "home-flow-desktop.png"),
    TestCase(name: "homepage genuine fragment history", path: "index.html?smoke=fragment-history#main-content", width: 1280, height: 900, expectedPart: nil, expectedSteps: nil, revealAll: false, preferenceAction: "index-fragment-history", legacyRedirect: false, snapshotName: nil),
    TestCase(name: "header Standards navigation and Back", path: "index.html?smoke=standards-navigation", width: 1280, height: 900, expectedPart: nil, expectedSteps: nil, revealAll: false, preferenceAction: "site-standards-navigation", legacyRedirect: false, snapshotName: nil),
    TestCase(name: "standards directory desktop", path: "standards.html?smoke=desktop", width: 1280, height: 900, expectedPart: nil, expectedSteps: nil, revealAll: false, preferenceAction: "standards-desktop", legacyRedirect: false, snapshotName: "standards-desktop.png"),
    TestCase(name: "standards directory mobile", path: "standards.html?smoke=mobile", width: 390, height: 844, expectedPart: nil, expectedSteps: nil, revealAll: false, preferenceAction: "standards-mobile", legacyRedirect: false, snapshotName: "standards-mobile.png"),
    TestCase(name: "year landing navigation wraps", path: "level-3-integration-2023.html?smoke=year-navigation", width: 1280, height: 900, expectedPart: nil, expectedSteps: nil, revealAll: false, preferenceAction: "year-navigation", legacyRedirect: false, snapshotName: nil),
    TestCase(name: "Level 2 direct paper flow", path: "index.html?smoke=level-2#level-2-algebra-2025", width: 1280, height: 900, expectedPart: nil, expectedSteps: nil, revealAll: false, preferenceAction: "index-level-2", legacyRedirect: false, snapshotName: nil),
    TestCase(name: "Level 3 Integration direct paper flow", path: "index.html?smoke=integration#level-3-integration-2020", width: 1280, height: 900, expectedPart: nil, expectedSteps: nil, revealAll: false, preferenceAction: "index-integration", legacyRedirect: false, snapshotName: nil),
    TestCase(name: "Level 3 Complex Numbers mobile flow", path: "index.html?smoke=complex-mobile#level-3-complex", width: 390, height: 844, expectedPart: nil, expectedSteps: nil, revealAll: false, preferenceAction: "index-mobile", legacyRedirect: false, snapshotName: "home-flow-mobile.png"),
    TestCase(name: "2020 native paper picker", path: "index.html?smoke=differentiation#level-3-differentiation-2020", width: 1280, height: 900, expectedPart: nil, expectedSteps: nil, revealAll: false, preferenceAction: "index-picker", legacyRedirect: false, snapshotName: nil),
    TestCase(name: "legacy 2020 hash redirect", path: "differentiation-2020.html#question-two-d", width: 1280, height: 900, expectedPart: "2d", expectedSteps: 4, revealAll: false, preferenceAction: "none", legacyRedirect: true, snapshotName: nil)
]

private final class ConsoleCollector: NSObject, WKScriptMessageHandler {
    var messages: [String] = []

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        messages.append(String(describing: message.body))
    }
}

private final class Runner: NSObject, WKNavigationDelegate {
    private let baseURL: URL
    private let webView: WKWebView
    private let consoleCollector: ConsoleCollector
    private var index = 0
    private var failures: [String] = []
    private var isEvaluating = false
    private var standardsNavigationPhase = 0

    init(baseURL: URL) {
        self.baseURL = baseURL
        self.consoleCollector = ConsoleCollector()

        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.userContentController.add(consoleCollector, name: "testConsole")
        configuration.userContentController.addUserScript(WKUserScript(
            source: #"""
              window.__walkthroughTestErrors = [];
              window.addEventListener("error", function (event) {
                window.__walkthroughTestErrors.push(event.message || "Resource load error");
              });
              window.addEventListener("unhandledrejection", function (event) {
                window.__walkthroughTestErrors.push(String(event.reason || "Unhandled rejection"));
              });
              (function () {
                const originalError = console.error;
                console.error = function () {
                  const message = Array.prototype.join.call(arguments, " ");
                  window.__walkthroughTestErrors.push(message);
                  window.webkit.messageHandlers.testConsole.postMessage(message);
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
        runNext()
    }

    private func runNext() {
        guard index < tests.count else {
            print("\nWebKit smoke test: \(tests.count - failures.count)/\(tests.count) cases passed.")
            if failures.isEmpty {
                NSApplication.shared.terminate(nil)
                return
            }
            print("Failures:")
            failures.forEach { print("- \($0)") }
            exit(1)
        }

        isEvaluating = false
        standardsNavigationPhase = 0
        consoleCollector.messages.removeAll()
        let test = tests[index]
        webView.frame = CGRect(x: 0, y: 0, width: test.width, height: test.height)
        let url = URL(string: test.path, relativeTo: baseURL)!
        webView.load(URLRequest(url: url))
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        let test = tests[index]

        if test.preferenceAction == "site-standards-navigation" {
            if standardsNavigationPhase == 1 && webView.url?.lastPathComponent == "standards.html" {
                isEvaluating = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                    self?.verifyStandardsNavigationDestination(test)
                }
                return
            }
            if standardsNavigationPhase == 2 && webView.url?.lastPathComponent == "index.html" {
                isEvaluating = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                    self?.verifyStandardsNavigationBack(test)
                }
                return
            }
        }

        guard !isEvaluating else { return }

        if test.legacyRedirect && !(webView.url?.lastPathComponent == "2d2020.html") {
            return
        }

        isEvaluating = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { [weak self] in
            self?.evaluate(test)
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        failCurrent("navigation failed: \(error.localizedDescription)")
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        failCurrent("provisional navigation failed: \(error.localizedDescription)")
    }

    private func failCurrent(_ reason: String) {
        failures.append("\(tests[index].name): \(reason)")
        print("FAIL \(tests[index].name): \(reason)")
        index += 1
        runNext()
    }

    private func evaluate(_ test: TestCase) {
        let expectedPart = test.expectedPart.map { "\"\($0)\"" } ?? "null"
        let expectedSteps = test.expectedSteps.map(String.init) ?? "null"
        let script = #"""
          (function () {
            const expectedPart = \#(expectedPart);
            const expectedSteps = \#(expectedSteps);
            const revealAll = \#(test.revealAll ? "true" : "false");
            const preferenceAction = "\#(test.preferenceAction)";
            const checks = {};

            if (preferenceAction === "site-standards-navigation") {
              const standardsLink = document.querySelector('.site-header-link[href="/standards.html"]');
              const previousScrollBehavior = document.documentElement.style.scrollBehavior;
              document.documentElement.style.scrollBehavior = "auto";
              window.scrollTo(0, 640);
              document.documentElement.style.scrollBehavior = previousScrollBehavior;

              checks.homepageDirectoryRemoved = document.querySelector(".standard-directory") === null;
              checks.headerStandardsLink = Boolean(standardsLink && standardsLink.textContent.trim() === "Standards");
              checks.sourcePageScrolled = Math.abs(window.scrollY - 640) <= 2;
              checks.noConsoleErrors = (window.__walkthroughTestErrors || []).length === 0;

              const failedChecks = Object.keys(checks).filter(function (key) { return !checks[key]; });
              return JSON.stringify({
                url: window.location.href,
                checks: checks,
                failedChecks: failedChecks,
                errors: window.__walkthroughTestErrors || []
              });
            }

            if (preferenceAction.indexOf("index-") === 0) {
              const isVisible = function (element) {
                return Boolean(element && !element.hidden && !element.classList.contains("hidden") && getComputedStyle(element).display !== "none");
              };
              const levelChooser = document.getElementById("choose-level");
              const flowNavigation = document.getElementById("selection-flow-nav");

              if (preferenceAction === "index-fragment-history") {
                window.__genuineFragmentScrollY = window.scrollY;
                checks.genuineFragmentStartsIntact = window.location.hash === "#main-content";
                checks.levelChooserStartsVisible = isVisible(levelChooser);
                document.querySelector('[data-level="level-3"]').click();
                const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
                const previousScrollBehavior = document.documentElement.style.scrollBehavior;
                document.documentElement.style.scrollBehavior = "auto";
                window.scrollTo(0, Math.min(maxScrollY, window.__genuineFragmentScrollY + 320));
                document.documentElement.style.scrollBehavior = previousScrollBehavior;
                window.__selectionFragmentScrollY = window.scrollY;
                checks.selectionRenders = isVisible(document.querySelector('[data-level-panel="level-3"]'));
                checks.selectionHash = window.location.hash === "#level-3";
                checks.selectionScrollIsDistinct = Math.abs(window.__selectionFragmentScrollY - window.__genuineFragmentScrollY) >= 100;
              } else if (preferenceAction === "index-flow") {
                checks.levelChooserStartsAlone = isVisible(levelChooser) && !isVisible(flowNavigation);

                document.querySelector('[data-level="level-3"]').click();
                checks.levelReplacesChooser = !isVisible(levelChooser) && isVisible(document.querySelector('[data-level-panel="level-3"]'));
                checks.levelHash = window.location.hash === "#level-3";
                checks.levelThreeStandards = ["level-3-differentiation", "level-3-integration", "level-3-complex"].every(function (standard) {
                  return Boolean(document.querySelector('[data-standard="' + standard + '"]'));
                });

                document.querySelector('[data-standard="level-3-differentiation"]').click();
                const differentiationPanel = document.querySelector('[data-standard-panel="level-3-differentiation"]');
                checks.standardReplacesLevel = getComputedStyle(document.querySelector('[data-level-panel="level-3"] > .standard-picker-grid')).display === "none";
                checks.differentiationYears = differentiationPanel.querySelectorAll(":scope > .paper-picker-grid [data-paper]").length === 9;

                document.querySelector(".home-breadcrumb-button").click();
                document.querySelector('[data-standard="level-3-integration"]').click();
                checks.integrationAppears = isVisible(document.querySelector('[data-standard-panel="level-3-integration"]'));
                checks.integrationYears = document.querySelectorAll('[data-standard-panel="level-3-integration"] > .paper-picker-grid [data-paper]').length === 9;

                document.querySelector(".home-breadcrumb-button").click();
                document.querySelector('[data-standard="level-3-complex"]').click();
                checks.complexAppears = isVisible(document.querySelector('[data-standard-panel="level-3-complex"]'));
                checks.complexYears = document.querySelectorAll('[data-standard-panel="level-3-complex"] > .paper-picker-grid [data-paper]').length === 9;

                document.querySelector('[data-paper="level-3-complex-2020"]').click();
                const complexPaper = document.querySelector('[data-paper-panel="level-3-complex-2020"]');
                const complexLinks = Array.from(complexPaper.querySelectorAll("a.index-link-card"));
                checks.paperReplacesYears = getComputedStyle(document.querySelector('[data-standard-panel="level-3-complex"] > .paper-picker-grid')).display === "none";
                checks.entryChoiceVisible = isVisible(complexPaper.querySelector(".paper-entry-choice")) && !isVisible(complexPaper.querySelector(".paper-question-picker"));
                checks.entryChoiceHeading = complexPaper.querySelector(".paper-entry-choice h2").textContent.trim() === "Where would you like to start?";
                checks.guidedStartRoute = /\/complex-2020\.html\?q=1a&mode=guided$/.test(complexPaper.querySelector("[data-paper-start-guided]").href);
                complexPaper.querySelector("[data-paper-start-specific]").click();
                checks.specificQuestionHash = window.location.hash === "#level-3-complex-2020-questions";
                checks.questionPickerVisible = !isVisible(complexPaper.querySelector(".paper-entry-choice")) && isVisible(complexPaper.querySelector(".paper-question-picker"));
                checks.paperQuestionLinks = complexLinks.length === 15 && complexLinks.every(function (link) {
                  return /\/complex-2020\.html\?q=[123][a-e]$/.test(link.href);
                });
                checks.completeBreadcrumb = Array.from(document.querySelectorAll(".home-breadcrumb li")).map(function (item) {
                  return item.textContent.trim();
                }).join(" → ") === "Level 3 → Complex Numbers → 2020";
                checks.contextualBackButton = /start options/.test(document.querySelector("[data-selection-back-label]").textContent);
                checks.oneVisibleLevel = document.querySelectorAll('[data-level-panel]:not(.hidden)').length === 1;
                checks.oneVisibleStandard = document.querySelectorAll('[data-standard-panel]:not(.hidden)').length === 1;
                checks.oneVisiblePaper = document.querySelectorAll('[data-paper-panel]:not(.hidden)').length === 1;
                window.__homeFlowPaperScrollY = window.scrollY;
                window.history.back();
              } else if (preferenceAction === "index-level-2") {
                const algebraPaper = document.querySelector('[data-paper-panel="level-2-algebra-2025"]');
                checks.level2PaperVisible = isVisible(algebraPaper);
                checks.level2AncestorsReplaced = getComputedStyle(document.querySelector('[data-level-panel="level-2"] > .standard-picker-grid')).display === "none" &&
                  getComputedStyle(document.querySelector('[data-standard-panel="level-2-algebra"] > .paper-picker-grid')).display === "none";
                checks.level2QuestionLinks = algebraPaper.querySelectorAll("a.index-link-card").length === 15;
                checks.level2EntryChoice = isVisible(algebraPaper.querySelector(".paper-entry-choice"));
                checks.level2GuidedRoute = /\/alg-1a2025-l2\.html\?mode=guided$/.test(algebraPaper.querySelector("[data-paper-start-guided]").href);
                document.querySelector("[data-selection-back]").click();
                checks.directLinkBackWorks = window.location.hash === "#level-2-algebra" &&
                  isVisible(document.querySelector('[data-standard-panel="level-2-algebra"]')) &&
                  !isVisible(algebraPaper);
              } else if (preferenceAction === "index-integration") {
                const integrationPaper = document.querySelector('[data-paper-panel="level-3-integration-2020"]');
                const integrationLinks = Array.from(integrationPaper.querySelectorAll("a.index-link-card"));
                checks.integrationPaperVisible = isVisible(integrationPaper);
                checks.integrationEntryChoice = isVisible(integrationPaper.querySelector(".paper-entry-choice"));
                checks.integrationGuidedRoute = /\/int-1a2020\.html\?mode=guided#question-1a$/.test(integrationPaper.querySelector("[data-paper-start-guided]").href);
                checks.integrationHasAllParts = integrationLinks.length === 15;
                checks.integrationUsesDirectPartRoutes = integrationLinks.every(function (link) {
                  return /\/int-[123][a-e]2020\.html#question-[123][a-e]$/.test(link.href);
                });
              } else if (preferenceAction === "index-mobile") {
                const complexPanel = document.querySelector('[data-standard-panel="level-3-complex"]');
                checks.mobileComplexVisible = isVisible(complexPanel);
                checks.mobileNineYears = complexPanel.querySelectorAll(":scope > .paper-picker-grid [data-paper]").length === 9;
                checks.mobileAncestorChoicesHidden = getComputedStyle(document.querySelector('[data-level-panel="level-3"] > .standard-picker-grid')).display === "none";
                checks.mobileCardsFit = Array.from(complexPanel.querySelectorAll(":scope > .paper-picker-grid .year-option")).every(function (card) {
                  return card.getBoundingClientRect().right <= window.innerWidth + 1;
                });
                checks.mobileNavigationFits = flowNavigation.getBoundingClientRect().right <= window.innerWidth + 1;
                const mobileNavigationOffset = flowNavigation.getBoundingClientRect().top - document.querySelector(".site-header").getBoundingClientRect().bottom;
                checks["mobileNavigationAligned(offset=" + Math.round(mobileNavigationOffset) + ")"] = mobileNavigationOffset >= 10 && mobileNavigationOffset <= 48;
              } else if (preferenceAction === "index-picker") {
                const panel = document.getElementById("level-3-differentiation-2020");
                const links = panel ? Array.from(panel.querySelectorAll("a.index-link-card")) : [];
                checks.paperPanelVisible = isVisible(panel) && panel.getAttribute("aria-hidden") === "false";
                checks.paperHasAllParts = links.length === 15;
                checks.paperUsesDirectPartRoutes = links.every(function (link) {
                  return /\/[123][a-e]2020\.html#question-[123][a-e]$/.test(link.href);
                });
              }

              checks.keyboardControls = Boolean(document.querySelector("[data-selection-back]") && document.querySelector("[data-selection-back]").tagName === "BUTTON");
              checks.noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
              const failedChecks = Object.keys(checks).filter(function (key) { return !checks[key]; });
              return JSON.stringify({
                url: window.location.href,
                checks: checks,
                failedChecks: failedChecks,
                errors: window.__walkthroughTestErrors || []
              });
            }

            if (preferenceAction.indexOf("standards-") === 0) {
              const isStandardsElementVisible = function (element) {
                return Boolean(element && !element.hidden && !element.classList.contains("hidden") && getComputedStyle(element).display !== "none");
              };
              const expectedHrefs = [
                "level-2-calculus.html",
                "level-2-algebra.html",
                "level-3-complex-numbers.html",
                "level-3-differentiation.html",
                "level-3-integration.html"
              ];
              const cards = Array.from(document.querySelectorAll(".standard-directory a.index-link-card"));
              const activeHeaderLink = document.querySelector('.site-header-link[aria-current="page"]');
              const activeFooterLink = document.querySelector('.site-footer-link[aria-current="page"]');
              const directory = document.querySelector(".standard-directory");
              const cardRects = cards.map(function (card) { return card.getBoundingClientRect(); });

              checks.startsAtTop = window.scrollY <= 1;
              checks.directoryVisible = isStandardsElementVisible(directory);
              checks.directoryHeading = document.querySelector("#standard-directory-heading").textContent.trim() === "NCEA maths standards on Calc.nz";
              checks.fiveStandardCards = cards.length === expectedHrefs.length;
              checks.cardDestinations = cards.map(function (card) { return card.getAttribute("href"); }).join("|") === expectedHrefs.join("|");
              checks.headerStandardsDestination = document.querySelector('.site-header-link[href="/standards.html"]') !== null;
              checks.footerStandardsDestination = document.querySelector('.site-footer-link[href="/standards.html"]') !== null;
              checks.activeHeaderState = Boolean(activeHeaderLink && activeHeaderLink.textContent.trim() === "Standards" && getComputedStyle(activeHeaderLink).backgroundColor !== "rgba(0, 0, 0, 0)");
              checks.activeFooterState = Boolean(activeFooterLink && activeFooterLink.textContent.trim() === "Standards");
              checks.noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
              checks.responsiveCardLayout = preferenceAction === "standards-mobile"
                ? cardRects.every(function (rect, index) { return index === 0 || rect.top > cardRects[index - 1].top; })
                : Math.abs(cardRects[0].top - cardRects[1].top) <= 1 && cardRects[2].top > cardRects[0].top;

              if (cards[0]) {
                cards[0].focus();
              }
              checks.cardKeyboardFocus = Boolean(cards[0] && document.activeElement === cards[0] && cards[0].tabIndex === 0);
              checks.noConsoleErrors = (window.__walkthroughTestErrors || []).length === 0;

              const failedChecks = Object.keys(checks).filter(function (key) { return !checks[key]; });
              return JSON.stringify({
                url: window.location.href,
                checks: checks,
                failedChecks: failedChecks,
                errors: window.__walkthroughTestErrors || []
              });
            }

            if (preferenceAction === "year-navigation") {
              const relatedLinks = Array.from(document.querySelectorAll('#related-years-heading + .nav-row .nav-btn'));
              const linkRects = relatedLinks.map(function (link) { return link.getBoundingClientRect(); });

              checks.eightRelatedYears = relatedLinks.length === 8;
              checks.relatedYearsWrap = new Set(linkRects.map(function (rect) { return Math.round(rect.top); })).size > 1;
              checks.relatedLinksStayInViewport = linkRects.every(function (rect) {
                return rect.left >= -1 && rect.right <= window.innerWidth + 1;
              });
              checks.noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
              checks.noConsoleErrors = (window.__walkthroughTestErrors || []).length === 0;

              const failedChecks = Object.keys(checks).filter(function (key) { return !checks[key]; });
              return JSON.stringify({
                url: window.location.href,
                checks: checks,
                failedChecks: failedChecks,
                errors: window.__walkthroughTestErrors || []
              });
            }

            if (preferenceAction === "legacy-guided") {
              const walkthroughContent = document.getElementById("walkthrough-content");
              const legacySteps = Array.from(walkthroughContent.querySelectorAll(":scope > .step-card"));
              const firstStep = legacySteps[0];
              const workingToggle = firstStep.querySelector(".legacy-working-toggle");
              const workingPanel = firstStep.querySelector(".legacy-step-working");

              checks.guidedMode = new URLSearchParams(window.location.search).get("mode") === "guided";
              checks.walkthroughStartsOpen = !walkthroughContent.classList.contains("hidden");
              checks.legacyStepCount = legacySteps.length === expectedSteps;
              checks.oneLegacyStepVisible = legacySteps.filter(function (step) { return !step.classList.contains("hidden"); }).length === 1;
              checks.legacyStartsAtStepOne = !firstStep.classList.contains("hidden") && firstStep.querySelector(".legacy-step-progress").textContent.trim() === "Step 1 of 6";
              checks.previousInitiallyDisabled = firstStep.querySelector(".legacy-previous-btn").disabled;
              workingToggle.click();
              checks.legacyWorkingShows = !workingPanel.classList.contains("hidden") && workingToggle.textContent.trim() === "Hide working";
              workingToggle.click();
              checks.legacyWorkingHides = workingPanel.classList.contains("hidden") && workingToggle.textContent.trim() === "Show working";
              workingToggle.click();
              window.showOnlyStep("step-2");
              checks.legacyAdvancesOneAtATime = !legacySteps[1].classList.contains("hidden") && firstStep.classList.contains("hidden");
              legacySteps[1].querySelector(".legacy-previous-btn").click();
              checks.legacyPreviousWorks = !firstStep.classList.contains("hidden") && legacySteps[1].classList.contains("hidden");
              checks.legacyWorkingPreserved = !workingPanel.classList.contains("hidden");
              window.showOnlyStep("step-6");
              const legacyCompleteButton = legacySteps[legacySteps.length - 1].querySelector(".legacy-complete-btn");
              checks.legacyFinalAction = Boolean(legacyCompleteButton && legacyCompleteButton.textContent.trim() === "Show final answer");
              if (legacyCompleteButton) {
                legacyCompleteButton.click();
              }
              const legacyAnswerCard = document.getElementById("answer-card");
              checks.legacyAnswerVisible = !legacyAnswerCard.classList.contains("hidden");
              const guidedNextQuestion = document.getElementById("next-question-link");
              checks.guidedModeContinues = Boolean(guidedNextQuestion && /mode=guided/.test(guidedNextQuestion.href));
              checks.answerFocusVisible = Boolean(legacyAnswerCard.contains(document.activeElement) && document.activeElement.classList.contains("in-page-focus-target"));
              checks.nextQuestionFollowsAnswer = Boolean(guidedNextQuestion && legacyAnswerCard.contains(guidedNextQuestion));
              checks.legacyStickySetting = Boolean(document.getElementById("sticky-question-setting"));
              checks.noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;

              const failedChecks = Object.keys(checks).filter(function (key) { return !checks[key]; });
              return JSON.stringify({
                url: window.location.href,
                checks: checks,
                failedChecks: failedChecks,
                errors: window.__walkthroughTestErrors || []
              });
            }

            const questionCard = document.getElementById("question-card");
            const image = questionCard && questionCard.querySelector("img.question-screenshot");
            const setting = document.getElementById("sticky-question-setting");
            const stepCards = Array.from(document.querySelectorAll("#walkthrough-content > .walkthrough-sequence > .walkthrough-step-card"));
            const previousButton = document.getElementById("walkthrough-previous-btn");
            const nextButton = document.getElementById("walkthrough-next-btn");

            checks.questionRendered = Boolean(questionCard && questionCard.children.length);
            checks.settingPresent = Boolean(setting);
            checks.stepCount = expectedSteps === null || stepCards.length === expectedSteps;
            checks.katexRendered = document.querySelectorAll(".katex").length > 0;
            checks.noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
            checks.oneStepVisible = stepCards.filter(function (card) { return !card.classList.contains("hidden"); }).length === 1;
            checks.startsAtFirstStep = Boolean(stepCards[0] && !stepCards[0].classList.contains("hidden"));
            checks.progressStartsAtOne = !stepCards.length || /Step 1 of \d+/.test(document.getElementById("walkthrough-progress-status").textContent);
            checks.previousStartsDisabled = !previousButton || previousButton.disabled;
            checks.workingTogglePresent = !stepCards.length || Boolean(stepCards[0].querySelector(".step-working-btn"));

            if (expectedPart !== null) {
              const chips = Array.from(document.querySelectorAll("#walkthrough-part-navigation .nav-btn"));
              const activeChip = document.querySelector("#walkthrough-part-navigation [aria-current='page']");
              checks.partChips = chips.length === 15;
              checks.partLinks = chips.every(function (link) {
                return /\/[123][a-e]2020\.html(?:\?mode=guided)?#question-[123][a-e]$/.test(link.href);
              });
              checks.activePart = Boolean(activeChip && activeChip.textContent.trim() === expectedPart.charAt(0) + "(" + expectedPart.charAt(1) + ")");
              checks.directHash = window.location.hash === "#question-" + expectedPart;
              checks.sharpQuestionImage = Boolean(image && image.complete && image.naturalWidth === 3125 && image.clientWidth <= image.naturalWidth);
            }

            if (revealAll && nextButton) {
              const firstWorkingButton = stepCards[0].querySelector(".step-working-btn");
              const firstWorkingPanel = stepCards[0].querySelector(".walkthrough-step-working");
              firstWorkingButton.click();
              checks.workingShows = !firstWorkingPanel.classList.contains("hidden") && firstWorkingButton.textContent.trim() === "Hide working";
              firstWorkingButton.click();
              checks.workingHides = firstWorkingPanel.classList.contains("hidden") && firstWorkingButton.textContent.trim() === "Show working";
              firstWorkingButton.click();
              nextButton.click();
              checks.nextShowsOnlySecond = stepCards.length < 2 || (!stepCards[1].classList.contains("hidden") && stepCards[0].classList.contains("hidden"));
              previousButton.click();
              checks.previousReturnsToFirst = !stepCards[0].classList.contains("hidden");
              checks.workingVisibilityPreserved = stepCards[0].dataset.workingVisible === "true";

              let guard = 0;
              while (!nextButton.disabled && guard < 20) {
                nextButton.click();
                guard += 1;
              }
              checks.oneStepStillVisible = stepCards.filter(function (card) { return !card.classList.contains("hidden"); }).length === 1;
              checks.lastStepVisible = Boolean(stepCards.length && !stepCards[stepCards.length - 1].classList.contains("hidden"));
              checks.finalWorkingVisible = stepCards[stepCards.length - 1].dataset.workingVisible === "true";
              checks.finalAnswerVisible = Boolean(document.querySelector(".walkthrough-step-card:last-child .answer-highlight, .walkthrough-step-card:last-child .walkthrough-answer-highlight"));
              checks.previousNextVisible = Boolean(document.querySelector("#walkthrough-final-nav:not(.hidden)"));
              checks.questionComplete = nextButton.disabled && /complete/i.test(nextButton.textContent);
              checks.navigationGuard = guard <= stepCards.length + 2;
            }

            if (preferenceAction === "guided") {
              checks.guidedQueryPreserved = new URLSearchParams(window.location.search).get("mode") === "guided";
              const nextQuestionLink = document.querySelector("#walkthrough-final-nav a:not(.secondary)");
              checks.guidedNextQuestion = Boolean(nextQuestionLink && /mode=guided/.test(nextQuestionLink.href));
            }

            if (preferenceAction === "disable" && setting) {
              checks.defaultPreferenceMatchesCurrent = setting.checked === true;
              checks.desktopQuestionStickyBeforeDisable = questionCard.classList.contains("sticky-question-card-enabled");
              setting.checked = false;
              setting.dispatchEvent(new Event("change", { bubbles: true }));
              checks.preferenceSavedOff = localStorage.getItem("calc.nz.stickyQuestionCard") === "false";
              checks.stickyDisabled = !questionCard.classList.contains("sticky-question-card-enabled");
            } else if (preferenceAction === "verify-disabled-then-enable" && setting) {
              checks.preferencePersistedAfterRefresh = setting.checked === false && localStorage.getItem("calc.nz.stickyQuestionCard") === "false";
              setting.checked = true;
              setting.dispatchEvent(new Event("change", { bubbles: true }));
              checks.preferenceRestored = localStorage.getItem("calc.nz.stickyQuestionCard") === "true";
              checks.desktopQuestionStickyRestored = questionCard.classList.contains("sticky-question-card-enabled");
            } else if (preferenceAction === "mobile-toggle" && setting) {
              setting.checked = false;
              setting.dispatchEvent(new Event("change", { bubbles: true }));
              const offSaved = localStorage.getItem("calc.nz.stickyQuestionCard") === "false";
              setting.checked = true;
              setting.dispatchEvent(new Event("change", { bubbles: true }));
              checks.mobileToggleWorks = offSaved && localStorage.getItem("calc.nz.stickyQuestionCard") === "true";
            }

            if (window.innerWidth < 700) {
              checks.mobileQuestionNotSticky = !questionCard.classList.contains("sticky-question-card-enabled");
              checks.mobileImageFits = !image || image.getBoundingClientRect().width <= questionCard.getBoundingClientRect().width;
            }

            if (window.innerWidth >= 1120 && expectedPart === "2d") {
              checks.tallQuestionNotSticky = !questionCard.classList.contains("sticky-question-card-enabled");
            }

            const failedChecks = Object.keys(checks).filter(function (key) { return !checks[key]; });
            return JSON.stringify({
              url: window.location.href,
              checks: checks,
              failedChecks: failedChecks,
              errors: window.__walkthroughTestErrors || []
            });
          }());
        """#

        webView.evaluateJavaScript(script) { [weak self] result, error in
            guard let self else { return }
            if let error {
                self.failCurrent("JavaScript evaluation failed: \(error.localizedDescription)")
                return
            }
            guard let json = result as? String,
                  let data = json.data(using: .utf8),
                  let payload = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let failedChecks = payload["failedChecks"] as? [String],
                  let errors = payload["errors"] as? [String] else {
                self.failCurrent("could not decode browser result")
                return
            }

            let reasons = [
                failedChecks.isEmpty ? nil : "failed checks: \(failedChecks.joined(separator: ", "))",
                errors.isEmpty ? nil : "page errors: \(errors.joined(separator: " | "))",
                self.consoleCollector.messages.isEmpty ? nil : "console errors: \(self.consoleCollector.messages.joined(separator: " | "))"
            ].compactMap { $0 }

            if !reasons.isEmpty {
                self.failures.append("\(test.name): \(reasons.joined(separator: "; "))")
            }

            if test.preferenceAction == "site-standards-navigation" {
                startStandardsNavigation(test)
                return
            }

            if test.preferenceAction == "index-flow" {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { [weak self] in
                    self?.verifyHomepageHistory(test)
                }
                return
            }

            if test.preferenceAction == "index-fragment-history" {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.65) { [weak self] in
                    self?.beginGenuineFragmentHistoryBack(test)
                }
                return
            }

            if reasons.isEmpty {
                print("PASS \(test.name)")
            } else {
                print("FAIL \(test.name): \(reasons.joined(separator: "; "))")
            }
            self.finishCase(test)
        }
    }

    private func verifyHomepageHistory(_ test: TestCase) {
        let script = #"""
          (function () {
            const paperPanel = document.querySelector('[data-paper-panel="level-3-complex-2020"]');
            const checks = {
              correctHash: window.location.hash === "#level-3-complex-2020",
              paperVisible: Boolean(paperPanel && !paperPanel.hidden && !paperPanel.classList.contains("hidden")),
              paperHasHeight: Boolean(paperPanel && paperPanel.getBoundingClientRect().height > 300),
              paperIsOpaque: Boolean(paperPanel && Number.parseFloat(getComputedStyle(paperPanel).opacity) > 0.99),
              entryChoiceVisible: Boolean(paperPanel && getComputedStyle(paperPanel.querySelector(".paper-entry-choice")).display !== "none"),
              questionPickerHidden: Boolean(paperPanel && getComputedStyle(paperPanel.querySelector(".paper-question-picker")).display === "none")
            };
            checks.scrollPositionRestored = Math.abs(window.scrollY - Number(window.__homeFlowPaperScrollY || 0)) <= 2;
            return JSON.stringify(checks);
          }());
        """#

        webView.evaluateJavaScript(script) { [weak self] result, error in
            guard let self else { return }
            var historyFailure: String?

            if let error {
                historyFailure = "browser Back check failed: \(error.localizedDescription)"
            } else if let json = result as? String,
                      let data = json.data(using: .utf8),
                      let checks = try? JSONSerialization.jsonObject(with: data) as? [String: Bool] {
                let failedChecks = checks.filter { !$0.value }.map(\.key).sorted()
                if !failedChecks.isEmpty {
                    historyFailure = "browser Back failed checks: \(failedChecks.joined(separator: ", "))"
                }
            } else {
                historyFailure = "browser Back result could not be decoded"
            }

            if let historyFailure {
                self.failures.append("\(test.name): \(historyFailure)")
            }

            let caseFailures = self.failures.filter { $0.hasPrefix(test.name + ":") }
            if caseFailures.isEmpty {
                print("PASS \(test.name)")
            } else {
                print("FAIL \(test.name): \(caseFailures.joined(separator: "; "))")
            }
            self.finishCase(test)
        }
    }

    private func startStandardsNavigation(_ test: TestCase) {
        standardsNavigationPhase = 1
        isEvaluating = false
        let script = #"""
          (function () {
            const link = document.querySelector('.site-header-link[href="/standards.html"]');
            if (!link) {
              return false;
            }
            link.click();
            return true;
          }());
        """#

        webView.evaluateJavaScript(script) { [weak self] result, error in
            guard let self else { return }
            if let error {
                self.failures.append("\(test.name): Standards link activation failed: \(error.localizedDescription)")
                self.finishStandardsNavigationCase(test)
            } else if (result as? Bool) != true {
                self.failures.append("\(test.name): Standards link was unavailable")
                self.finishStandardsNavigationCase(test)
            }
        }
    }

    private func verifyStandardsNavigationDestination(_ test: TestCase) {
        let script = #"""
          (function () {
            const headerCurrent = document.querySelector('.site-header-link[aria-current="page"]');
            const footerCurrent = document.querySelector('.site-footer-link[aria-current="page"]');
            const checks = {
              standardsRoute: window.location.pathname === "/standards.html",
              destinationStartsAtTop: window.scrollY <= 1,
              directoryVisible: Boolean(document.querySelector(".standard-directory")),
              fiveCards: document.querySelectorAll(".standard-directory a.index-link-card").length === 5,
              activeHeader: Boolean(headerCurrent && headerCurrent.textContent.trim() === "Standards"),
              activeFooter: Boolean(footerCurrent && footerCurrent.textContent.trim() === "Standards"),
              noConsoleErrors: (window.__walkthroughTestErrors || []).length === 0
            };
            return JSON.stringify({
              failedChecks: Object.keys(checks).filter(function (key) { return !checks[key]; }),
              errors: window.__walkthroughTestErrors || []
            });
          }());
        """#

        webView.evaluateJavaScript(script) { [weak self] result, error in
            guard let self else { return }
            self.recordStandardsNavigationResult(result, error: error, stage: "destination", test: test)

            guard self.webView.canGoBack else {
                self.failures.append("\(test.name): browser Back was unavailable from Standards")
                self.finishStandardsNavigationCase(test)
                return
            }

            self.standardsNavigationPhase = 2
            self.isEvaluating = false
            self.webView.goBack()
        }
    }

    private func verifyStandardsNavigationBack(_ test: TestCase) {
        let script = #"""
          (function () {
            const checks = {
              homepageRouteRestored: window.location.pathname === "/index.html",
              homepageScrollRestored: Math.abs(window.scrollY - 640) <= 2,
              homepageDirectoryStillRemoved: document.querySelector(".standard-directory") === null,
              standardsLinkPreserved: Boolean(document.querySelector('.site-header-link[href="/standards.html"]')),
              noConsoleErrors: (window.__walkthroughTestErrors || []).length === 0
            };
            return JSON.stringify({
              failedChecks: Object.keys(checks).filter(function (key) { return !checks[key]; }),
              errors: window.__walkthroughTestErrors || []
            });
          }());
        """#

        webView.evaluateJavaScript(script) { [weak self] result, error in
            guard let self else { return }
            self.recordStandardsNavigationResult(result, error: error, stage: "Back", test: test)
            self.finishStandardsNavigationCase(test)
        }
    }

    private func recordStandardsNavigationResult(_ result: Any?, error: Error?, stage: String, test: TestCase) {
        if let error {
            failures.append("\(test.name): \(stage) check failed: \(error.localizedDescription)")
            return
        }
        guard let json = result as? String,
              let data = json.data(using: .utf8),
              let payload = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let failedChecks = payload["failedChecks"] as? [String],
              let errors = payload["errors"] as? [String] else {
            failures.append("\(test.name): \(stage) result could not be decoded")
            return
        }

        if !failedChecks.isEmpty {
            failures.append("\(test.name): \(stage) failed checks: \(failedChecks.joined(separator: ", "))")
        }
        if !errors.isEmpty {
            failures.append("\(test.name): \(stage) page errors: \(errors.joined(separator: " | "))")
        }
    }

    private func finishStandardsNavigationCase(_ test: TestCase) {
        let caseFailures = failures.filter { $0.hasPrefix(test.name + ":") }
        if caseFailures.isEmpty {
            print("PASS \(test.name)")
        } else {
            print("FAIL \(test.name): \(caseFailures.joined(separator: "; "))")
        }
        finishCase(test)
    }

    private func beginGenuineFragmentHistoryBack(_ test: TestCase) {
        webView.evaluateJavaScript("window.history.back();") { [weak self] _, error in
            guard let self else { return }
            if let error {
                self.failures.append("\(test.name): browser Back failed: \(error.localizedDescription)")
                self.finishGenuineFragmentHistoryCase(test)
                return
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { [weak self] in
                self?.verifyGenuineFragmentHistoryBack(test)
            }
        }
    }

    private func verifyGenuineFragmentHistoryBack(_ test: TestCase) {
        let script = #"""
          (function () {
            const levelChooser = document.getElementById("choose-level");
            const levelPanel = document.querySelector('[data-level-panel="level-3"]');
            return JSON.stringify({
              genuineFragmentRestored: window.location.hash === "#main-content",
              chooserRestored: Boolean(levelChooser && !levelChooser.hidden && !levelChooser.classList.contains("hidden")),
              newerSelectionHidden: Boolean(levelPanel && (levelPanel.hidden || levelPanel.classList.contains("hidden"))),
              scrollPositionRestored: Math.abs(window.scrollY - Number(window.__genuineFragmentScrollY || 0)) <= 2
            });
          }());
        """#

        webView.evaluateJavaScript(script) { [weak self] result, error in
            guard let self else { return }

            if let error {
                self.failures.append("\(test.name): genuine fragment Back check failed: \(error.localizedDescription)")
            } else if let json = result as? String,
                      let data = json.data(using: .utf8),
                      let checks = try? JSONSerialization.jsonObject(with: data) as? [String: Bool] {
                let failedChecks = checks.filter { !$0.value }.map(\.key).sorted()
                if !failedChecks.isEmpty {
                    self.failures.append("\(test.name): genuine fragment Back failed checks: \(failedChecks.joined(separator: ", "))")
                }
            } else {
                self.failures.append("\(test.name): genuine fragment Back result could not be decoded")
            }

            self.webView.evaluateJavaScript("window.history.forward();") { [weak self] _, forwardError in
                guard let self else { return }
                if let forwardError {
                    self.failures.append("\(test.name): browser Forward failed: \(forwardError.localizedDescription)")
                    self.finishGenuineFragmentHistoryCase(test)
                    return
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { [weak self] in
                    self?.verifyGenuineFragmentHistoryForward(test)
                }
            }
        }
    }

    private func verifyGenuineFragmentHistoryForward(_ test: TestCase) {
        let script = #"""
          (function () {
            const levelChooser = document.getElementById("choose-level");
            const levelPanel = document.querySelector('[data-level-panel="level-3"]');
            return JSON.stringify({
              selectionFragmentRestored: window.location.hash === "#level-3",
              selectionRestored: Boolean(levelPanel && !levelPanel.hidden && !levelPanel.classList.contains("hidden")),
              chooserHidden: Boolean(levelChooser && (levelChooser.hidden || levelChooser.classList.contains("hidden"))),
              scrollPositionRestored: Math.abs(window.scrollY - Number(window.__selectionFragmentScrollY || 0)) <= 2
            });
          }());
        """#

        webView.evaluateJavaScript(script) { [weak self] result, error in
            guard let self else { return }

            if let error {
                self.failures.append("\(test.name): selection Forward check failed: \(error.localizedDescription)")
            } else if let json = result as? String,
                      let data = json.data(using: .utf8),
                      let checks = try? JSONSerialization.jsonObject(with: data) as? [String: Bool] {
                let failedChecks = checks.filter { !$0.value }.map(\.key).sorted()
                if !failedChecks.isEmpty {
                    self.failures.append("\(test.name): selection Forward failed checks: \(failedChecks.joined(separator: ", "))")
                }
            } else {
                self.failures.append("\(test.name): selection Forward result could not be decoded")
            }

            self.finishGenuineFragmentHistoryCase(test)
        }
    }

    private func finishGenuineFragmentHistoryCase(_ test: TestCase) {
        let caseFailures = failures.filter { $0.hasPrefix(test.name + ":") }
        if caseFailures.isEmpty {
            print("PASS \(test.name)")
        } else {
            print("FAIL \(test.name): \(caseFailures.joined(separator: "; "))")
        }
        finishCase(test)
    }

    private func finishCase(_ test: TestCase) {
        guard let snapshotName = test.snapshotName else {
            index += 1
            runNext()
            return
        }

        webView.takeSnapshot(with: nil) { [weak self] image, error in
            guard let self else { return }
            if let image,
               let tiff = image.tiffRepresentation,
               let bitmap = NSBitmapImageRep(data: tiff),
               let png = bitmap.representation(using: .png, properties: [:]) {
                let url = URL(fileURLWithPath: "/tmp/\(snapshotName)")
                try? png.write(to: url)
                print("SNAPSHOT \(url.path)")
            } else if let error {
                self.failures.append("\(test.name): snapshot failed: \(error.localizedDescription)")
            }
            self.index += 1
            self.runNext()
        }
    }
}

private let baseURL = URL(string: CommandLine.arguments.dropFirst().first ?? "http://127.0.0.1:8002/")!
private let application = NSApplication.shared
private let runner = Runner(baseURL: baseURL)
application.setActivationPolicy(.prohibited)
runner.start()
application.run()
