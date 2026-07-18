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
    TestStep(name: "2019 differentiation progress and zoom", path: "1a2019.html", width: 1280, height: 900, mode: "diff-progress-zoom"),
    TestStep(name: "2020 integration separate progress", path: "int-1a2020.html", width: 1280, height: 900, mode: "integration-progress"),
    TestStep(name: "homepage continue search and picker", path: "index.html?ux-smoke=return", width: 1280, height: 900, mode: "home-return"),
    TestStep(name: "exam mode differentiation", path: "1b2019.html", width: 1280, height: 900, mode: "exam-diff"),
    TestStep(name: "exam mode integration", path: "int-1b2020.html", width: 1280, height: 900, mode: "exam-integration"),
    TestStep(name: "mobile question zoom", path: "2d2019.html", width: 390, height: 844, mode: "mobile-question"),
    TestStep(name: "mobile homepage", path: "index.html?ux-smoke=mobile", width: 390, height: 844, mode: "mobile-home")
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
              checks.walkthroughCompletes = completeCurrentWalkthrough();
              checks.progressCompleted = progressMap()["level-3-differentiation-2019:1a"].completed === true;
              checks.sidebarProgressCompletes = sidebarProgress && sidebarProgress.textContent.trim() === "1 of 15 completed";
              checks.katexRendered = document.querySelectorAll(".katex").length > 0 && !document.querySelector(".katex-error");
              checks.noPageOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
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
              checks.noConsoleErrors = (window.__uxSmokeErrors || []).length === 0;
            }

            if (mode === "home-return") {
              const continueCard = document.getElementById("homepage-continue-card");
              checks.continueVisible = isVisible(continueCard);
              checks.continueLabel = /Continue 2020 Integration \u00b7 Question 1\(a\)/.test(continueCard.textContent);
              checks.continueHref = /int-1a2020\.html$/.test(continueCard.querySelector("a").getAttribute("href"));
              checks.diffProgressChip = document.querySelector('[data-paper-progress="level-3-differentiation-2019"]').textContent.trim() === "1 of 15 completed";
              checks.integrationProgressChip = document.querySelector('[data-paper-progress="level-3-integration-2020"]').textContent.trim() === "1 of 15 completed";

              const integrationResults = runSearch("integration 2020");
              const cylinderResults = runSearch("cylinder");
              const complexResults = runSearch("complex numbers");
              checks.integrationSearch = integrationResults.length > 0 && integrationResults[0].href.indexOf("int-") >= 0;
              checks.cylinderSearch = cylinderResults.length > 0;
              checks.complexSearch = complexResults.length > 0 && /Complex Numbers/.test(complexResults[0].textContent);

              document.querySelector('[data-level="level-3"]').click();
              document.querySelector('[data-standard="level-3-differentiation"]').click();
              document.querySelector('[data-paper="level-3-differentiation-2019"]').click();
              const panel = document.getElementById("level-3-differentiation-2019");
              checks.paperEntryVisible = isVisible(panel.querySelector(".paper-entry-choice"));
              checks.fromStart = /1a2019\.html\?mode=guided$/.test(panel.querySelector("[data-paper-start-guided]").href);
              panel.querySelector("[data-paper-start-specific]").click();
              checks.specificQuestionMenu = window.location.hash === "#level-3-differentiation-2019-questions" && isVisible(panel.querySelector(".paper-question-picker"));
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
              document.getElementById("exam-mode-reveal-btn").click();
              checks.revealShowsContent = !tipsCard.classList.contains("exam-mode-hidden") && !content.classList.contains("exam-mode-hidden") && isVisible(document.querySelector(".walkthrough-step-card"));
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
              checks.noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
              checks.searchVisible = isVisible(document.getElementById("walkthrough-site-search"));
              checks.continueVisible = isVisible(document.getElementById("homepage-continue-card"));
              const results = runSearch("quotient rule");
              checks.mobileSearchResults = results.length > 0;
              checks.noConsoleErrors = (window.__uxSmokeErrors || []).length === 0;
            }

            const failedChecks = Object.keys(checks).filter(function (key) { return !checks[key]; });
            return JSON.stringify({
              checks: checks,
              failedChecks: failedChecks,
              errors: window.__uxSmokeErrors || []
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
