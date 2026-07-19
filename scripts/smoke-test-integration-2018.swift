#!/usr/bin/env swift

import AppKit
import Foundation
import WebKit

private struct TestCase {
    let name: String
    let path: String
    let width: CGFloat
    let height: CGFloat
    let part: String?
    let expectedSteps: Int?
    let mode: String
}

private let parts = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
]

private let stepCounts = [
    "1a": 3, "1b": 4, "1c": 3, "1d": 4, "1e": 4,
    "2a": 2, "2b": 3, "2c": 4, "2d": 4, "2e": 5,
    "3a": 3, "3b": 3, "3c": 3, "3d": 4, "3e": 5
]

private var tests: [TestCase] = [
    TestCase(name: "2018 Integration picker and search", path: "index.html#level-3-integration-2018", width: 1280, height: 900, part: nil, expectedSteps: nil, mode: "picker")
]

for part in parts {
    let guided = part == "1a" ? "?mode=guided" : ""
    tests.append(TestCase(
        name: "\(part) desktop",
        path: "int-\(part)2018.html\(guided)",
        width: 1280,
        height: 900,
        part: part,
        expectedSteps: stepCounts[part],
        mode: "page"
    ))
}

for part in ["1e", "2c", "3b", "3d", "3e"] {
    tests.append(TestCase(
        name: "\(part) narrow mobile",
        path: "int-\(part)2018.html",
        width: 390,
        height: 844,
        part: part,
        expectedSteps: stepCounts[part],
        mode: "mobile"
    ))
}

tests.append(TestCase(name: "2018 continue card", path: "index.html", width: 1280, height: 900, part: nil, expectedSteps: nil, mode: "continue"))

private final class Runner: NSObject, WKNavigationDelegate {
    private let baseURL: URL
    private let webView: WKWebView
    private var currentIndex = 0
    private var evaluating = false
    private var failures: [String] = []

    init(baseURL: URL) {
        self.baseURL = baseURL

        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.userContentController.addUserScript(WKUserScript(
            source: #"""
              window.__integration2018Errors = [];
              window.addEventListener("error", function (event) {
                window.__integration2018Errors.push(event.message || "Resource load error");
              });
              window.addEventListener("unhandledrejection", function (event) {
                window.__integration2018Errors.push(String(event.reason || "Unhandled rejection"));
              });
              (function () {
                const originalError = console.error;
                console.error = function () {
                  window.__integration2018Errors.push(Array.prototype.join.call(arguments, " "));
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
        guard currentIndex < tests.count else {
            print("\n2018 Integration browser smoke test: \(tests.count - failures.count)/\(tests.count) cases passed.")
            if failures.isEmpty {
                NSApplication.shared.terminate(nil)
                return
            }

            print("Failures:")
            failures.forEach { print("- \($0)") }
            exit(1)
        }

        evaluating = false
        let test = tests[currentIndex]
        webView.frame = CGRect(x: 0, y: 0, width: test.width, height: test.height)
        let url = URL(string: test.path, relativeTo: baseURL)!
        let startedIndex = currentIndex
        print("→ \(test.name)")
        webView.load(URLRequest(url: url))

        DispatchQueue.main.asyncAfter(deadline: .now() + 15.0) { [weak self] in
            guard let self else { return }
            if self.currentIndex == startedIndex && !self.evaluating {
                self.webView.stopLoading()
                self.finishCurrent(failure: "navigation timed out before didFinish")
            }
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard !evaluating else { return }
        evaluating = true

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { [weak self] in
            guard let self else { return }
            self.evaluate(tests[self.currentIndex])
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        finishCurrent(failure: "navigation failed: \(error.localizedDescription)")
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        finishCurrent(failure: "provisional navigation failed: \(error.localizedDescription)")
    }

    private func evaluate(_ test: TestCase) {
        let part = test.part.map { "\"\($0)\"" } ?? "null"
        let expectedSteps = test.expectedSteps.map(String.init) ?? "null"
        let script = #"""
          (function () {
            const part = \#(part);
            const expectedSteps = \#(expectedSteps);
            const mode = "\#(test.mode)";
            const checks = {};
            const isVisible = function (element) {
              return Boolean(element && !element.hidden && !element.classList.contains("hidden") && getComputedStyle(element).display !== "none" && element.getClientRects().length);
            };

            if (mode === "picker") {
              const panel = document.getElementById("level-3-integration-2018");
              const button = document.querySelector('[data-paper="level-3-integration-2018"]');
              const links = panel ? Array.from(panel.querySelectorAll("a.index-link-card")) : [];
              const guidedLink = panel && panel.querySelector("[data-paper-start-guided]");
              checks.buttonAfter2019 = Boolean(button && button.previousElementSibling && button.previousElementSibling.dataset.paper === "level-3-integration-2019");
              checks.pickerButton = Boolean(button && button.getAttribute("aria-pressed") === "true");
              checks.panelVisible = isVisible(panel) && panel.getAttribute("aria-hidden") === "false";
              checks.entryChoiceVisible = isVisible(panel.querySelector(".paper-entry-choice"));
              checks.guidedStartRoute = /\/int-1a2018\.html\?mode=guided$/.test(guidedLink.href);
              checks.fifteenLinks = links.length === 15;
              checks.directRoutes = links.every(function (link) {
                return /\/int-[123][a-e]2018\.html$/.test(link.href);
              });

              panel.querySelector("[data-paper-start-specific]").click();
              checks.specificQuestionHash = window.location.hash === "#level-3-integration-2018-questions";
              checks.questionPickerVisible = isVisible(panel.querySelector(".paper-question-picker"));

              const searchInput = document.getElementById("walkthrough-search-input");
              searchInput.value = "integration 2018";
              searchInput.dispatchEvent(new Event("input", { bubbles: true }));
              const searchLinks = Array.from(document.querySelectorAll(".home-search-result"));
              checks.searchCatalogue = searchLinks.length > 0 && searchLinks.every(function (link) {
                return /int-[123][a-e]2018\.html/.test(link.getAttribute("href"));
              });
              checks.noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
            } else if (mode === "continue") {
              const card = document.getElementById("homepage-continue-card");
              const link = card && card.querySelector("a");
              checks.continueVisible = isVisible(card);
              checks.continuePaper = Boolean(card && /2018 Integration/.test(card.textContent));
              checks.continueRoute = Boolean(link && /int-[123][a-e]2018\.html/.test(link.getAttribute("href")));
              const progress = JSON.parse(localStorage.getItem("calc.nz.walkthroughProgress") || "{}");
              checks.distinctProgressNamespace = Object.keys(progress).some(function (key) {
                return key.indexOf("level-3-integration-2018:") === 0;
              }) && !Object.keys(progress).some(function (key) {
                return key.indexOf("level-3-differentiation-2018:") === 0;
              });
            } else {
              const questionCard = document.getElementById("question-card");
              const stepCards = Array.from(document.querySelectorAll(".walkthrough-step-card"));
              const previousButton = document.getElementById("walkthrough-previous-btn");
              const nextButton = document.getElementById("walkthrough-next-btn");
              const partLinks = Array.from(document.querySelectorAll("#walkthrough-part-navigation .nav-btn"));
              const sidebarParts = Array.from(document.querySelectorAll("[data-walkthrough-sidebar-part]"));
              const sidebarYears = Array.from(document.querySelectorAll(".walkthrough-sidebar-year-list a")).map(function (link) {
                return link.textContent.trim();
              });
              const backLink = document.getElementById("back-link");
              const stickySetting = document.getElementById("sticky-question-setting");
              const examSetting = document.getElementById("exam-mode-setting");

              checks.route = window.location.pathname.endsWith("/int-" + part + "2018.html") && window.location.hash === "";
              checks.dataLoaded = Boolean(window.Integration2018Walkthroughs && window.Integration2018Walkthroughs[part]);
              checks.questionVisible = isVisible(questionCard) && questionCard.textContent.trim().length > 0;
              checks.mathRendered = document.querySelectorAll(".katex").length > 0;
              checks.focusCard = Boolean(document.querySelector("#hints-card:not(.hidden) .walkthrough-tip-card"));
              checks.stepCount = stepCards.length === expectedSteps;
              checks.stepWorking = stepCards.every(function (card) {
                return Boolean(card.querySelector(".walkthrough-working-body").textContent.trim());
              });
              checks.finalAnswerPresent = Boolean(stepCards[stepCards.length - 1].querySelector(".walkthrough-answer-highlight"));
              checks.partNavigation = partLinks.length === 15 && partLinks.every(function (link) {
                return /\/int-[123][a-e]2018\.html/.test(link.href);
              });
              checks.sidebarNavigation = sidebarParts.length === 15 && sidebarYears.indexOf("2018") >= 0;
              checks.backToPaper = Boolean(backLink && backLink.getAttribute("href") === "level-3-integration-2018.html");
              checks.stickyControl = Boolean(stickySetting);
              checks.examControl = Boolean(examSetting);
              checks.oneStepVisible = stepCards.filter(function (card) { return isVisible(card); }).length === 1;
              checks.previousDisabled = previousButton.disabled;

              if (part === "1a") {
                stickySetting.checked = false;
                stickySetting.dispatchEvent(new Event("change", { bubbles: true }));
                checks.pinOffStored = localStorage.getItem("calc.nz.stickyQuestionCard") === "false";
                stickySetting.checked = true;
                stickySetting.dispatchEvent(new Event("change", { bubbles: true }));

                examSetting.checked = true;
                examSetting.dispatchEvent(new Event("change", { bubbles: true }));
                checks.examHidesWalkthrough = document.body.classList.contains("exam-mode-active") && document.getElementById("walkthrough-content").classList.contains("exam-mode-hidden");
                document.getElementById("exam-mode-reveal-btn").click();
                checks.examReveal = !document.getElementById("walkthrough-content").classList.contains("exam-mode-hidden");
                examSetting.checked = false;
                examSetting.dispatchEvent(new Event("change", { bubbles: true }));
              }

              const firstWorking = stepCards[0].querySelector(".step-working-btn");
              firstWorking.click();
              checks.workingReveal = firstWorking.getAttribute("aria-expanded") === "true" && isVisible(stepCards[0].querySelector(".walkthrough-step-working"));

              if (stepCards.length > 1) {
                nextButton.click();
                checks.nextStep = stepCards[1].getAttribute("aria-hidden") === "false";
                previousButton.click();
                checks.previousStep = stepCards[0].getAttribute("aria-hidden") === "false";
                for (let index = 1; index < stepCards.length; index += 1) {
                  nextButton.click();
                }
              }

              checks.finalHiddenBeforeReveal = !isVisible(stepCards[stepCards.length - 1].querySelector(".walkthrough-answer-highlight"));
              nextButton.click();
              checks.finalRevealed = isVisible(stepCards[stepCards.length - 1].querySelector(".walkthrough-answer-highlight"));
              checks.completedState = nextButton.disabled && /Question complete/.test(nextButton.textContent);
              const progress = JSON.parse(localStorage.getItem("calc.nz.walkthroughProgress") || "{}");
              checks.progressKey = Boolean(progress["level-3-integration-2018:" + part] && progress["level-3-integration-2018:" + part].completed);

              const finalPrimary = document.querySelector("#walkthrough-final-nav .nav-btn:not(.secondary)");
              const partIndex = \#(parts).indexOf(part);
              const nextPart = partIndex >= 0 && partIndex < \#(parts).length - 1 ? \#(parts)[partIndex + 1] : null;
              checks.nextQuestion = nextPart
                ? Boolean(finalPrimary && finalPrimary.href.indexOf("int-" + nextPart + "2018.html") >= 0)
                : Boolean(finalPrimary && finalPrimary.href.indexOf("#level-3-integration-2018") >= 0);
              if (part === "1a") {
                checks.guidedModeCarried = /\?mode=guided/.test(finalPrimary.href);
              }

              const graphId = ({ "1e": "question-graph-1e-int-2018", "2c": "question-graph-2c-int-2018", "3d": "question-graph-3d-int-2018", "3e": "question-graph-3e-int-2018" })[part];
              if (graphId) {
                const svg = document.getElementById(graphId);
                checks.graphAccessible = Boolean(svg && svg.getAttribute("role") === "img" && svg.querySelector("title") && svg.querySelector("desc"));
                checks.graphVector = Boolean(svg && svg.querySelectorAll("path").length >= 3 && !svg.querySelector("image"));
                checks.graphFits = Boolean(svg && svg.getBoundingClientRect().right <= window.innerWidth + 1);
              }

              if (part === "3b") {
                const table = document.querySelector("table.question-data-table");
                checks.semanticTable = Boolean(table && table.querySelector("caption") && table.querySelectorAll('th[scope="col"]').length === 8 && table.querySelector('th[scope="row"]'));
              }

              checks.noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
              if (!checks.noHorizontalOverflow && part === "3b") {
                const overflowDetail = Array.from(document.querySelectorAll("body *")).map(function (element) {
                  const rect = element.getBoundingClientRect();
                  return { element: element, rect: rect };
                }).filter(function (entry) {
                  return entry.rect.right > window.innerWidth + 1;
                }).slice(0, 8).map(function (entry) {
                  return entry.element.tagName.toLowerCase() + "." + entry.element.className + "[" + Math.round(entry.rect.left) + "," + Math.round(entry.rect.right) + "]";
                }).join("|");
                checks["overflow=" + document.documentElement.scrollWidth + "/" + window.innerWidth + ":" + overflowDetail] = false;
              }
            }

            const failedChecks = Object.keys(checks).filter(function (key) { return !checks[key]; });
            return JSON.stringify({
              url: window.location.href,
              checks: checks,
              failedChecks: failedChecks,
              errors: window.__integration2018Errors || []
            });
          }());
        """#

        webView.evaluateJavaScript(script) { [weak self] result, error in
            guard let self else { return }
            if let error {
                self.finishCurrent(failure: "evaluation failed: \(error.localizedDescription)")
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
                print("PASS \(test.name)")
                self.finishCurrent(failure: nil)
            } else {
                self.finishCurrent(failure: "checks: \(failedChecks.joined(separator: ", ")); errors: \(errors.joined(separator: " | "))")
            }
        }
    }

    private func finishCurrent(failure: String?) {
        let test = tests[currentIndex]
        if let failure {
            failures.append("\(test.name): \(failure)")
            print("FAIL \(test.name): \(failure)")
        }
        currentIndex += 1
        runNext()
    }
}

let arguments = CommandLine.arguments
guard arguments.count >= 2, let baseURL = URL(string: arguments[1]) else {
    fputs("Usage: smoke-test-integration-2018.swift http://127.0.0.1:PORT/\n", stderr)
    exit(64)
}

if arguments.count >= 3 && arguments[2] == "3b-mobile" {
    tests = [TestCase(name: "3b narrow mobile", path: "int-3b2018.html", width: 390, height: 844, part: "3b", expectedSteps: stepCounts["3b"], mode: "mobile")]
}

private let app = NSApplication.shared
private let runner = Runner(baseURL: baseURL)
runner.start()
app.run()
