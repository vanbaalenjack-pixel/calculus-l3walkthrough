#!/usr/bin/env swift

import AppKit
import Foundation
import WebKit

private struct TestStep {
    let name: String
    let path: String
    let width: CGFloat
    let height: CGFloat
    let mode: String
}

private let steps = [
    TestStep(name: "homepage initial", path: "index.html?ux-smoke=initial", width: 1280, height: 900, mode: "home-initial"),
    TestStep(name: "homepage deep-linked paper", path: "index.html?ux-smoke=deep#level-3-integration-2021-questions", width: 1280, height: 900, mode: "home-deep-link"),
    TestStep(name: "2019 differentiation progress and zoom", path: "1a2019.html", width: 1280, height: 900, mode: "diff-progress-zoom"),
    TestStep(name: "2020 integration separate progress", path: "int-1a2020.html", width: 1280, height: 900, mode: "integration-progress"),
    TestStep(name: "homepage continue search and picker", path: "index.html?ux-smoke=return", width: 1280, height: 900, mode: "home-return"),
    TestStep(name: "exam mode differentiation", path: "1b2019.html", width: 1280, height: 900, mode: "exam-diff"),
    TestStep(name: "exam mode integration", path: "int-1b2020.html", width: 1280, height: 900, mode: "exam-integration"),
    TestStep(name: "mobile question zoom", path: "2d2019.html", width: 390, height: 844, mode: "mobile-question"),
    TestStep(name: "mobile homepage", path: "index.html?ux-smoke=mobile", width: 390, height: 844, mode: "mobile-home"),
    TestStep(name: "homepage storage fallback", path: "index.html?ux-smoke=storage-off", width: 1280, height: 900, mode: "home-storage-off"),
    TestStep(name: "walkthrough read-only storage fallback", path: "1a2025.html?ux-smoke=storage-readonly", width: 1280, height: 900, mode: "walkthrough-storage-readonly"),
    TestStep(name: "homepage reset controls", path: "index.html?ux-smoke=reset", width: 1280, height: 900, mode: "home-reset")
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

    init(baseURL: URL) {
        self.baseURL = baseURL
        self.consoleCollector = ConsoleCollector()

        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.userContentController.add(consoleCollector, name: "testConsole")
        configuration.userContentController.addUserScript(WKUserScript(
            source: #"""
              window.__uxSmokeErrors = [];
              if (new URLSearchParams(window.location.search).get("ux-smoke") === "initial") {
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                } catch (error) {
                  // Storage-unavailable behaviour is covered by the page fallback.
                }
              }
              if (new URLSearchParams(window.location.search).get("ux-smoke") === "storage-off") {
                ["setItem", "removeItem"].forEach(function (method) {
                  Storage.prototype[method] = function () {
                    throw new Error("Storage disabled for UX smoke test");
                  };
                });
              }
              if (new URLSearchParams(window.location.search).get("ux-smoke") === "storage-readonly") {
                localStorage.setItem("calc.nz.bookmarks", "{}");
                localStorage.setItem("calc.nz.retryQuestions", "{}");
                localStorage.setItem("calc.nz.stickyQuestionCard", "true");
                localStorage.setItem("calc.nz.examMode", "false");
                ["setItem", "removeItem"].forEach(function (method) {
                  Storage.prototype[method] = function () {
                    throw new Error("Storage is read-only for UX smoke test");
                  };
                });
              }
              window.addEventListener("error", function (event) {
                window.__uxSmokeErrors.push(event.message || "Resource load error");
              });
              window.addEventListener("unhandledrejection", function (event) {
                window.__uxSmokeErrors.push(String(event.reason || "Unhandled rejection"));
              });
              (function () {
                const originalError = console.error;
                console.error = function () {
                  const message = Array.prototype.join.call(arguments, " ");
                  window.__uxSmokeErrors.push(message);
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
        guard index < steps.count else {
            print("\nUX feature smoke test: \(steps.count - failures.count)/\(steps.count) cases passed.")
            if failures.isEmpty {
                NSApplication.shared.terminate(nil)
                return
            }
            print("Failures:")
            failures.forEach { print("- \($0)") }
            exit(1)
        }

        isEvaluating = false
        consoleCollector.messages.removeAll()
        let step = steps[index]
        webView.frame = CGRect(x: 0, y: 0, width: step.width, height: step.height)
        let url = URL(string: step.path, relativeTo: baseURL)!
        webView.load(URLRequest(url: url))
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard !isEvaluating else { return }
        let step = steps[index]
        isEvaluating = true

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { [weak self] in
            self?.evaluate(step)
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        finishCurrent(failure: "navigation failed: \(error.localizedDescription)")
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        finishCurrent(failure: "provisional navigation failed: \(error.localizedDescription)")
    }

    private func evaluate(_ step: TestStep) {
        let script = #"""
          (function () {
            try {
            const mode = "\#(step.mode)";
            const checks = {};
            const metrics = {};
            const isVisible = function (element) {
              return Boolean(element && !element.hidden && !element.classList.contains("hidden") && getComputedStyle(element).display !== "none");
            };
            const progressMap = function () {
              try {
                return JSON.parse(localStorage.getItem("calc.nz.walkthroughProgress") || "{}");
              } catch (error) {
                return {};
              }
            };
            const completeCurrentWalkthrough = function () {
              const nextButton = document.getElementById("walkthrough-next-btn");
              let guard = 0;
              while (nextButton && !nextButton.disabled && guard < 30) {
                nextButton.click();
                guard += 1;
              }
              return guard < 30 && nextButton && nextButton.disabled;
            };
            const runSearch = function (query) {
              const input = document.getElementById("walkthrough-search-input");
              input.value = query;
              input.dispatchEvent(new Event("input", { bubbles: true }));
              return Array.from(document.querySelectorAll(".home-search-result"));
            };

            if (mode === "home-initial") {
              localStorage.clear();
              metrics.initialElements = document.querySelectorAll("*").length;
              metrics.initialLinks = document.querySelectorAll("a[href]").length;
              metrics.initialControls = document.querySelectorAll("button, input, select, textarea").length;
              metrics.initialPracticeSetLinks = document.querySelectorAll(".home-practice-set-link").length;
              checks.compactInitialDom = metrics.initialElements < 260;
              checks.compactInitialLinks = metrics.initialLinks < 20;
              checks.catalogueHas447Questions = window.CALC_NZ_QUESTION_CATALOGUE.levels.reduce(function (levelTotal, level) {
                return levelTotal + level.standards.reduce(function (standardTotal, standard) {
                  return standardTotal + standard.papers.reduce(function (paperTotal, paper) {
                    return paperTotal + paper.questions.length;
                  }, 0);
                }, 0);
              }, 0) === 447;
              checks.searchCard = Boolean(document.getElementById("walkthrough-site-search"));
              checks.noContinueYet = !isVisible(document.getElementById("homepage-continue-card"));
              const chainResults = runSearch("chain rule");
              checks.chainRuleSearch = chainResults.length > 0 && chainResults.some(function (link) {
                return /chain rule/i.test(link.textContent);
              });
              checks.noConsoleErrors = (window.__uxSmokeErrors || []).length === 0;
            }

            if (mode === "diff-progress-zoom") {
              const questionCard = document.getElementById("question-card");
              const image = questionCard && questionCard.querySelector("img.question-screenshot");
              const sidebarProgress = document.querySelector("[data-walkthrough-paper-progress-text]");
              const lastVisited = JSON.parse(localStorage.getItem("calc.nz.lastWalkthrough") || "{}");

              checks.lastVisitedDiff = lastVisited.paperId === "level-3-differentiation-2019" && lastVisited.partId === "1a";
              checks.progressVisited = progressMap()["level-3-differentiation-2019:1a"].visited === true;
              checks.sidebarProgressStarts = sidebarProgress && sidebarProgress.textContent.trim() === "0 of 15 completed";
              checks.imageLoaded = Boolean(image && image.complete && image.naturalWidth > 900);
              checks.imageZoomable = Boolean(image && image.classList.contains("question-image-zoomable") && image.getAttribute("role") === "button");
              image.click();
              checks.lightboxOpens = isVisible(document.getElementById("question-image-lightbox"));
              document.querySelector(".question-image-lightbox-close").click();
              checks.lightboxCloses = !isVisible(document.getElementById("question-image-lightbox"));
              const finalButton = document.getElementById("walkthrough-next-btn");
              let finalGuard = 0;
              while (finalButton && /Next step/.test(finalButton.textContent) && finalGuard < 30) {
                finalButton.click();
                finalGuard += 1;
              }
              const finalPanelId = finalButton && finalButton.getAttribute("aria-controls");
              checks.finalAnswerDisclosure = Boolean(finalPanelId)
                && finalButton.getAttribute("aria-expanded") === "false"
                && document.getElementById(finalPanelId).getAttribute("aria-hidden") === "true";
              finalButton.click();
              checks.finalAnswerExpanded = finalButton.getAttribute("aria-expanded") === "true"
                && document.getElementById(finalPanelId).getAttribute("aria-hidden") === "false";
              checks.walkthroughCompletes = finalGuard < 30 && finalButton.disabled;
              checks.progressCompleted = progressMap()["level-3-differentiation-2019:1a"].completed === true;
              checks.sidebarProgressCompletes = sidebarProgress && sidebarProgress.textContent.trim() === "1 of 15 completed";
              document.getElementById("bookmark-question-btn").click();
              checks.bookmarkSaved = Boolean(JSON.parse(localStorage.getItem("calc.nz.bookmarks") || "{}")["level-3-differentiation-2019:1a"]);
              checks.katexRendered = document.querySelectorAll(".katex").length > 0 && !document.querySelector(".katex-error");
              checks.noPageOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
              checks.noConsoleErrors = (window.__uxSmokeErrors || []).length === 0;
            }

            if (mode === "home-deep-link") {
              checks.deepLinkHash = window.location.hash === "#level-3-integration-2021-questions";
              checks.deepLinkQuestions = document.querySelectorAll(".index-link-card").length === 15;
              checks.deepLinkCorrectPaper = /Integration · 2021 paper/.test(document.getElementById("choose-level").textContent);
              checks.deepLinkBreadcrumb = document.querySelector(".home-breadcrumb-current").textContent.trim() === "Questions";
              checks.oneSelectorStage = document.querySelectorAll("[data-level-panel], [data-standard-panel], [data-paper-panel]").length === 1;
              const ids = Array.from(document.querySelectorAll("[id]")).map(function (element) { return element.id; });
              checks.uniqueIds = new Set(ids).size === ids.length;
              document.querySelector("[data-selection-back]").click();
              checks.hierarchyBack = window.location.hash === "#level-3-integration-2021"
                && isVisible(document.querySelector(".paper-entry-choice"));
              document.querySelector("[data-paper-start-specific]").click();
              checks.historyState = window.history.state.selectionHash === "level-3-integration-2021-questions"
                && window.history.state.cameFromHash === "level-3-integration-2021";
              checks.noConsoleErrors = (window.__uxSmokeErrors || []).length === 0;
            }

            if (mode === "integration-progress") {
              checks.walkthroughCompletes = completeCurrentWalkthrough();
              const map = progressMap();
              const lastVisited = JSON.parse(localStorage.getItem("calc.nz.lastWalkthrough") || "{}");
              checks.integrationCompleted = map["level-3-integration-2020:1a"].completed === true;
              checks.diffStillComplete = map["level-3-differentiation-2019:1a"].completed === true;
              checks.separateKeys = Boolean(map["level-3-integration-2020:1a"]) && Boolean(map["level-3-differentiation-2019:1a"]);
              checks.lastVisitedIntegration = lastVisited.paperId === "level-3-integration-2020" && lastVisited.partId === "1a";
              document.getElementById("retry-question-btn").click();
              checks.retrySaved = Boolean(JSON.parse(localStorage.getItem("calc.nz.retryQuestions") || "{}")["level-3-integration-2020:1a"]);
              checks.noConsoleErrors = (window.__uxSmokeErrors || []).length === 0;
            }

            if (mode === "home-return") {
              const continueCard = document.getElementById("homepage-continue-card");
              checks.continueVisible = isVisible(continueCard);
              checks.continueLabel = /Continue 2020 Integration \u00b7 Question 1\(a\)/.test(continueCard.textContent);
              checks.continueHref = /int-1a2020\.html$/.test(continueCard.querySelector("a").getAttribute("href"));
              const integrationResults = runSearch("integration 2020");
              const cylinderResults = runSearch("cylinder");
              const complexResults = runSearch("complex numbers");
              checks.integrationSearch = integrationResults.length > 0 && integrationResults[0].href.indexOf("int-") >= 0;
              checks.cylinderSearch = cylinderResults.length > 0;
              checks.complexSearch = complexResults.length > 0 && /Complex Numbers/.test(complexResults[0].textContent);

              document.querySelector('[data-level="level-3"]').click();
              checks.selectorFocusMoves = document.activeElement === document.getElementById("selection-stage-heading");
              checks.selectorAnnouncement = /Choose a standard for Level 3/.test(document.querySelector("[data-selection-status]").textContent);
              checks.onlyCurrentLevelStageRendered = document.querySelectorAll("[data-level-panel]").length === 1
                && document.querySelectorAll("[data-standard-panel]").length === 0
                && document.querySelectorAll("[data-paper-panel]").length === 0;
              document.querySelector('[data-standard="level-3-differentiation"]').click();
              checks.diffProgressChip = document.querySelector('[data-paper-progress="level-3-differentiation-2019"]').textContent.trim() === "1 of 15 completed.";
              checks.onlyRelevantYearsRendered = document.querySelectorAll("[data-paper]").length === 10
                && document.querySelectorAll("[data-paper-panel]").length === 0;
              document.querySelector('[data-paper="level-3-differentiation-2019"]').click();
              let panel = document.getElementById("level-3-differentiation-2019");
              checks.paperEntryVisible = isVisible(panel.querySelector(".paper-entry-choice"));
              const startURL = new URL(panel.querySelector("[data-paper-start-guided]").href);
              checks.fromStart = /\/1a2019\.html$/.test(startURL.pathname) && startURL.searchParams.get("mode") === "guided";
              panel.querySelector("[data-paper-start-specific]").click();
              panel = document.getElementById("level-3-differentiation-2019");
              checks.specificQuestionMenu = window.location.hash === "#level-3-differentiation-2019-questions" && isVisible(panel.querySelector(".paper-question-picker"));
              checks.onlyCurrentQuestionsRendered = document.querySelectorAll(".index-link-card").length === 15
                && document.querySelectorAll("[data-paper-panel]").length === 1;

              document.querySelector('[data-library-view="bookmarks"]').click();
              checks.bookmarkList = document.querySelectorAll("#home-library-results a").length === 1
                && /2019 Differentiation/.test(document.getElementById("home-library-results").textContent);
              document.querySelector('[data-library-view="retry"]').click();
              checks.retryList = document.querySelectorAll("#home-library-results a").length === 1
                && /2020 Integration/.test(document.getElementById("home-library-results").textContent);
              const practiceScope = document.querySelector("[data-practice-scope]");
              practiceScope.value = "standard:level-2-calculus";
              document.querySelector('[data-practice-set="10"]').click();
              checks.tenMinuteSet = document.querySelectorAll(".home-practice-set-link").length === 3
                && Array.from(document.querySelectorAll(".home-practice-set-link")).every(function (link) {
                  return /-l2\.html$/.test(new URL(link.href).pathname);
                });
              document.querySelector('[data-practice-set="20"]').click();
              checks.twentyMinuteSet = document.querySelectorAll(".home-practice-set-link").length === 6;
              metrics.questionStageElements = document.querySelectorAll("*").length;
              metrics.questionStageLinks = document.querySelectorAll("a[href]").length;
              localStorage.setItem("calc.nz.examMode", "true");
              checks.noConsoleErrors = (window.__uxSmokeErrors || []).length === 0;
            }

            if (mode === "exam-diff") {
              const tipsCard = document.getElementById("tips-card") || document.getElementById("hints-card");
              const content = document.getElementById("walkthrough-content");
              const revealPanel = document.getElementById("walkthrough-exam-mode-reveal-panel");
              const checkbox = document.getElementById("exam-mode-setting");
              checks.examPreferenceLoaded = checkbox.checked && localStorage.getItem("calc.nz.examMode") === "true";
              checks.questionVisible = isVisible(document.getElementById("question-card"));
              checks.revealPanelVisible = isVisible(revealPanel);
              checks.walkthroughHidden = tipsCard.classList.contains("exam-mode-hidden") && content.classList.contains("exam-mode-hidden");
              checks.stepsHidden = content.classList.contains("exam-mode-hidden") || document.querySelector(".walkthrough-step-card").getClientRects().length === 0;
              const revealButton = document.getElementById("exam-mode-reveal-btn");
              const controlledIds = (revealButton.getAttribute("aria-controls") || "").split(/\s+/).filter(Boolean);
              checks.revealDisclosureAria = revealButton.getAttribute("aria-expanded") === "false"
                && controlledIds.length >= 1
                && controlledIds.every(function (id) { return Boolean(document.getElementById(id)); });
              revealButton.focus();
              revealButton.click();
              checks.revealShowsContent = !tipsCard.classList.contains("exam-mode-hidden") && !content.classList.contains("exam-mode-hidden") && isVisible(document.querySelector(".walkthrough-step-card"));
              checks.revealExpandedAria = revealButton.getAttribute("aria-expanded") === "true";
              checks.revealMovesFocus = document.activeElement !== revealButton
                && document.activeElement.classList.contains("in-page-focus-target")
                && !document.activeElement.closest("[hidden], .exam-mode-hidden");
              checks.preferencePersists = localStorage.getItem("calc.nz.examMode") === "true";
              checks.noConsoleErrors = (window.__uxSmokeErrors || []).length === 0;
            }

            if (mode === "exam-integration") {
              const content = document.getElementById("walkthrough-content");
              const offButton = document.getElementById("exam-mode-off-btn");
              checks.examStillActive = document.getElementById("exam-mode-setting").checked && content.classList.contains("exam-mode-hidden");
              const previousScrollBehavior = document.documentElement.style.scrollBehavior;
              document.documentElement.style.scrollBehavior = "auto";
              window.scrollTo(0, Math.max(0, offButton.getBoundingClientRect().top + window.scrollY - 180));
              document.documentElement.style.scrollBehavior = previousScrollBehavior;
              const scrollBeforeTurningOff = window.scrollY;
              offButton.click();
              const focusedElement = document.activeElement;
              const focusedRect = focusedElement.getBoundingClientRect();
              checks.examTurnsOff = localStorage.getItem("calc.nz.examMode") === "false" && !content.classList.contains("exam-mode-hidden");
              checks.examOffKeepsViewport = Math.abs(window.scrollY - scrollBeforeTurningOff) <= 2;
              checks.examOffFocusVisible = focusedElement.classList.contains("in-page-focus-target")
                && focusedRect.top >= 0
                && focusedRect.bottom <= window.innerHeight;
              checks.noConsoleErrors = (window.__uxSmokeErrors || []).length === 0;
            }

            if (mode === "mobile-question") {
              const questionCard = document.getElementById("question-card");
              const image = questionCard && questionCard.querySelector("img.question-screenshot");
              checks.noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
              checks.questionNotSticky = !questionCard.classList.contains("sticky-question-card-enabled");
              checks.imageFitsCard = image.getBoundingClientRect().width <= questionCard.getBoundingClientRect().width + 1;
              image.click();
              checks.lightboxOpens = isVisible(document.getElementById("question-image-lightbox"));
              checks.lightboxScrollable = document.querySelector(".question-image-lightbox-stage").scrollWidth >= document.querySelector(".question-image-lightbox-stage").clientWidth;
              document.querySelector(".question-image-lightbox-close").click();
              checks.noConsoleErrors = (window.__uxSmokeErrors || []).length === 0;
            }

            if (mode === "mobile-home") {
              const howDetails = document.querySelector("[data-home-how-details]");
              metrics.mobileSelectorTop = Math.round(document.getElementById("choose-level").getBoundingClientRect().top + window.scrollY);
              checks.noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
              checks.howItWorksCollapsed = Boolean(howDetails && !howDetails.open);
              checks.howItWorksFollowsSelector = Boolean(howDetails && document.getElementById("choose-level").nextElementSibling.contains(howDetails));
              checks.selectorNearFirstScreen = metrics.mobileSelectorTop <= window.innerHeight + 80;
              checks.searchVisible = isVisible(document.getElementById("walkthrough-site-search"));
              checks.continueVisible = isVisible(document.getElementById("homepage-continue-card"));
              const results = runSearch("quotient rule");
              checks.mobileSearchResults = results.length > 0;
              checks.noConsoleErrors = (window.__uxSmokeErrors || []).length === 0;
            }

            if (mode === "home-storage-off") {
              checks.selectorStillWorks = Boolean(document.querySelector('[data-level="level-2"]'));
              checks.storageMessage = /storage is unavailable/i.test(document.querySelector("[data-storage-description]").textContent);
              document.querySelector('[data-practice-set="10"]').click();
              checks.inMemoryPracticeSet = document.querySelectorAll(".home-practice-set-link").length === 3;
              checks.continueSafelyHidden = !isVisible(document.getElementById("homepage-continue-card"));
              checks.noConsoleErrors = (window.__uxSmokeErrors || []).length === 0;
            }

            if (mode === "walkthrough-storage-readonly") {
              const bookmarkButton = document.getElementById("bookmark-question-btn");
              const retryButton = document.getElementById("retry-question-btn");
              bookmarkButton.click();
              retryButton.click();
              checks.bookmarkFallbackPersistsInUi = bookmarkButton.getAttribute("aria-pressed") === "true";
              checks.retryFallbackPersistsInUi = retryButton.getAttribute("aria-pressed") === "true";
              bookmarkButton.click();
              checks.bookmarkFallbackCanRemove = bookmarkButton.getAttribute("aria-pressed") === "false";
              const sticky = document.getElementById("sticky-question-setting");
              sticky.checked = false;
              sticky.dispatchEvent(new Event("change", { bubbles: true }));
              checks.stickyFallbackDoesNotRevert = sticky.checked === false;
              const exam = document.getElementById("exam-mode-setting");
              exam.checked = true;
              exam.dispatchEvent(new Event("change", { bubbles: true }));
              checks.examFallbackDoesNotRevert = exam.checked === true
                && isVisible(document.getElementById("walkthrough-exam-mode-reveal-panel"));
              checks.noConsoleErrors = (window.__uxSmokeErrors || []).length === 0;
            }

            if (mode === "home-reset") {
              checks.savedStateExists = Boolean(localStorage.getItem("calc.nz.walkthroughProgress"))
                && Boolean(localStorage.getItem("calc.nz.bookmarks"))
                && Boolean(localStorage.getItem("calc.nz.retryQuestions"))
                && Boolean(localStorage.getItem("calc.nz.practiceSet"));
              const examPreference = localStorage.getItem("calc.nz.examMode");
              window.confirm = function () { return true; };
              document.querySelector("[data-reset-progress]").click();
              checks.practiceStateCleared = [
                "calc.nz.walkthroughProgress",
                "calc.nz.lastWalkthrough",
                "calc.nz.bookmarks",
                "calc.nz.retryQuestions",
                "calc.nz.practiceSet"
              ].every(function (key) { return localStorage.getItem(key) === null; });
              checks.settingsPreserved = localStorage.getItem("calc.nz.examMode") === examPreference;
              checks.resetAnnounced = /has been cleared/.test(document.getElementById("home-library-results").textContent);
              checks.continueRemoved = !isVisible(document.getElementById("homepage-continue-card"));
              checks.noConsoleErrors = (window.__uxSmokeErrors || []).length === 0;
            }

            const failedChecks = Object.keys(checks).filter(function (key) { return !checks[key]; });
            return JSON.stringify({
              checks: checks,
              failedChecks: failedChecks,
              errors: window.__uxSmokeErrors || [],
              metrics: metrics
            });
            } catch (error) {
              const errorText = [
                error && error.name ? error.name : "Error",
                error && error.message ? error.message : String(error),
                error && error.stack ? error.stack : ""
              ].filter(Boolean).join(": ");
              return JSON.stringify({
                checks: {},
                failedChecks: ["exception"],
                errors: [errorText]
              });
            }
          }());
        """#

        webView.evaluateJavaScript(script) { [weak self] result, error in
            guard let self else { return }
            if let error {
                self.finishCurrent(failure: "JavaScript evaluation failed: \(error.localizedDescription)")
                return
            }
            guard let json = result as? String,
                  let data = json.data(using: .utf8),
                  let payload = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let failedChecks = payload["failedChecks"] as? [String],
                  let errors = payload["errors"] as? [String] else {
                self.finishCurrent(failure: "could not decode browser result")
                return
            }

            if let metrics = payload["metrics"] as? [String: Any], !metrics.isEmpty {
                let rendered = metrics.keys.sorted().map { key in
                    "\(key)=\(metrics[key]!)"
                }.joined(separator: ", ")
                print("METRICS \(step.name): \(rendered)")
            }

            if failedChecks.isEmpty && errors.isEmpty {
                print("PASS \(step.name)")
                self.finishCurrent(failure: nil)
            } else {
                self.finishCurrent(failure: "checks: \(failedChecks.joined(separator: ", ")); errors: \(errors.joined(separator: " | "))")
            }
        }
    }

    private func finishCurrent(failure: String?) {
        let step = steps[index]
        if let failure {
            failures.append("\(step.name): \(failure)")
            print("FAIL \(step.name): \(failure)")
        }
        index += 1
        runNext()
    }
}

let arguments = CommandLine.arguments
guard arguments.count >= 2, let baseURL = URL(string: arguments[1]) else {
    fputs("Usage: smoke-test-ux-features.swift http://127.0.0.1:PORT/\n", stderr)
    exit(64)
}

private let app = NSApplication.shared
private let runner = Runner(baseURL: baseURL)
runner.start()
app.run()
