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
    let mode: String
}

private let parts = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
]

private var tests: [TestCase] = [
    TestCase(
        name: "2019 Integration picker",
        path: "index.html#level-3-integration-2019",
        width: 1280,
        height: 900,
        part: nil,
        mode: "picker"
    ),
    TestCase(
        name: "legacy hash redirect",
        path: "integration-2019.html#question-three-e",
        width: 1280,
        height: 900,
        part: "3e",
        mode: "redirect"
    )
]

for part in parts {
    tests.append(TestCase(
        name: "\(part) desktop",
        path: "int-\(part)2019.html",
        width: 1280,
        height: 900,
        part: part,
        mode: "desktop"
    ))
}

for part in parts {
    tests.append(TestCase(
        name: "\(part) mobile",
        path: "int-\(part)2019.html",
        width: 390,
        height: 844,
        part: part,
        mode: "mobile"
    ))
}

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
              window.__integration2019Errors = [];
              window.addEventListener("error", function (event) {
                window.__integration2019Errors.push(event.message || "Resource load error");
              });
              window.addEventListener("unhandledrejection", function (event) {
                window.__integration2019Errors.push(String(event.reason || "Unhandled rejection"));
              });
              (function () {
                const originalError = console.error;
                console.error = function () {
                  window.__integration2019Errors.push(Array.prototype.join.call(arguments, " "));
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
            print("\n2019 Integration browser smoke test: \(tests.count - failures.count)/\(tests.count) cases passed.")
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

        DispatchQueue.main.asyncAfter(deadline: .now() + 12.0) { [weak self] in
            guard let self else { return }
            if self.currentIndex == startedIndex && !self.evaluating {
                self.webView.stopLoading()
                self.finishCurrent(failure: "navigation timed out before didFinish")
            }
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard !evaluating else { return }
        let test = tests[currentIndex]

        if test.mode == "redirect" && webView.url?.lastPathComponent != "int-3e2019.html" {
            return
        }

        evaluating = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { [weak self] in
            self?.evaluate(test)
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
        let script = #"""
          (function () {
            const part = \#(part);
            const mode = "\#(test.mode)";
            const checks = {};
            const isVisible = function (element) {
              return Boolean(element && !element.hidden && !element.classList.contains("hidden") && getComputedStyle(element).display !== "none");
            };

            if (mode === "picker") {
              const panel = document.getElementById("level-3-integration-2019");
              const button = document.querySelector('[data-paper="level-3-integration-2019"]');
              const links = panel ? Array.from(panel.querySelectorAll("a.index-link-card")) : [];
              checks.pickerButton = Boolean(button && button.getAttribute("aria-pressed") === "true");
              checks.panelVisible = isVisible(panel) && panel.getAttribute("aria-hidden") === "false";
              checks.entryChoiceVisible = isVisible(panel.querySelector(".paper-entry-choice"));
              checks.entryHeading = panel.querySelector(".paper-entry-choice h2").textContent.trim() === "Where would you like to start?";
              checks.guidedStartRoute = /\/int-1a2019\.html\?mode=guided$/.test(panel.querySelector("[data-paper-start-guided]").href);
              checks.fifteenLinks = links.length === 15;
              checks.directRoutes = links.every(function (link) {
                return /\/int-[123][a-e]2019\.html$/.test(link.href);
              });
              panel.querySelector("[data-paper-start-specific]").click();
              checks.specificQuestionHash = window.location.hash === "#level-3-integration-2019-questions";
              checks.questionPickerVisible = !isVisible(panel.querySelector(".paper-entry-choice")) && isVisible(panel.querySelector(".paper-question-picker"));
              checks.noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
            } else {
              const questionCard = document.getElementById("question-card");
              const image = questionCard && questionCard.querySelector("img.question-screenshot");
              const imageStyle = image ? getComputedStyle(image) : null;
              const setting = document.getElementById("sticky-question-setting");
              const stepCards = Array.from(document.querySelectorAll(".walkthrough-step-card"));
              const previousButton = document.getElementById("walkthrough-previous-btn");
              const nextButton = document.getElementById("walkthrough-next-btn");
              const chips = Array.from(document.querySelectorAll("#walkthrough-part-navigation .nav-btn"));
              const activeChip = document.querySelector("#walkthrough-part-navigation [aria-current='page']");
              const sidebarYears = Array.from(document.querySelectorAll(".walkthrough-sidebar-year-list a")).map(function (link) {
                return link.textContent.trim();
              });
              const sidebarParts = Array.from(document.querySelectorAll("[data-walkthrough-sidebar-part]"));

              checks.route = window.location.pathname.endsWith("/int-" + part + "2019.html") && window.location.hash === "";
              checks.questionImage = Boolean(image && image.complete && image.naturalWidth > 1500 && image.naturalHeight > 250);
              checks.imageWhiteCard = Boolean(imageStyle && imageStyle.backgroundColor === "rgb(255, 255, 255)" && imageStyle.colorScheme.indexOf("light") >= 0);
              checks.partNavigation = chips.length === 15 && chips.every(function (link) {
                return /\/int-[123][a-e]2019\.html$/.test(link.href);
              });
              checks.activePart = Boolean(activeChip && activeChip.textContent.trim() === part.charAt(0) + "(" + part.charAt(1) + ")");
              checks.sidebarYear = sidebarYears.indexOf("2019") >= 0;
              checks.sidebarParts = sidebarParts.length === 15;
              checks.focusCard = Boolean(document.querySelector("#hints-card:not(.hidden) .walkthrough-tip-card"));
              checks.stepsPresent = stepCards.length > 0;
              checks.nonEmptyRevealWorking = stepCards.every(function (card) {
                const body = card.querySelector(".walkthrough-working-body");
                return Boolean(body && body.textContent.trim().length > 0);
              });
              checks.stickySetting = Boolean(setting);
              checks.oneStepStartsVisible = stepCards.filter(function (card) { return !card.classList.contains("hidden"); }).length === 1;
              checks.previousStartsDisabled = previousButton.disabled;

              const firstWorkingButton = stepCards[0].querySelector(".step-working-btn");
              firstWorkingButton.click();
              nextButton.click();
              previousButton.click();
              checks.workingPreserved = stepCards[0].dataset.workingVisible === "true";

              let navigationGuard = 0;
              while (nextButton && !nextButton.disabled && navigationGuard < 24) {
                nextButton.click();
                navigationGuard += 1;
              }
              checks.oneStepRemainsVisible = stepCards.filter(function (card) { return !card.classList.contains("hidden"); }).length === 1;
              checks.finalStepVisible = !stepCards[stepCards.length - 1].classList.contains("hidden");
              checks.finalWorkingVisible = stepCards[stepCards.length - 1].dataset.workingVisible === "true";
              checks.finalAnswer = Boolean(document.querySelector(".walkthrough-step-card:last-child .answer-highlight"));
              checks.finalNavigation = Boolean(document.querySelector("#walkthrough-final-nav:not(.hidden) a.nav-btn"));
              checks.navigationCompleted = nextButton.disabled && navigationGuard < 24;
              checks.katex = document.querySelectorAll(".katex").length > 0 && !document.querySelector(".katex-error");
              checks.inlineKatex = Array.from(document.querySelectorAll(".katex")).some(function (node) {
                return !node.closest(".katex-display");
              });

              const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
              const unrenderedMathText = [];
              let textNode = textWalker.nextNode();
              while (textNode) {
                const parent = textNode.parentElement;
                const text = textNode.nodeValue || "";
                const isRenderedMath = parent && parent.closest(".katex");
                const isIgnoredElement = parent && parent.closest("script, style");
                if (!isRenderedMath && !isIgnoredElement && (
                  /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]/.test(text)
                  || /\\(?:frac|sqrt|sin|cos|tan|sec|ln|int|left|right|approx|therefore|boxed|text|\(|\))/.test(text)
                )) {
                  unrenderedMathText.push(text.trim());
                }
                textNode = textWalker.nextNode();
              }
              checks.noUnrenderedMathText = unrenderedMathText.length === 0;
              checks.noPageOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;

              if (mode === "mobile") {
                checks.mobileImageFits = image.getBoundingClientRect().width <= questionCard.getBoundingClientRect().width;
                checks.mobileQuestionNotSticky = !questionCard.classList.contains("sticky-question-card-enabled");
              }

              if (mode === "desktop" && part === "1a") {
                const startedOn = setting.checked && localStorage.getItem("calc.nz.stickyQuestionCard") !== "false";
                const stickyClassOn = questionCard.classList.contains("sticky-question-card-enabled");
                setting.checked = false;
                setting.dispatchEvent(new Event("change", { bubbles: true }));
                const savedOff = localStorage.getItem("calc.nz.stickyQuestionCard") === "false";
                const stickyClassOff = !questionCard.classList.contains("sticky-question-card-enabled");
                setting.checked = true;
                setting.dispatchEvent(new Event("change", { bubbles: true }));
                const stickyClassRestored = questionCard.classList.contains("sticky-question-card-enabled");
                checks.stickyToggle = startedOn && stickyClassOn && savedOff && stickyClassOff
                  && stickyClassRestored && localStorage.getItem("calc.nz.stickyQuestionCard") === "true";
              }
            }

            checks.noConsoleErrors = (window.__integration2019Errors || []).length === 0;
            const failedChecks = Object.keys(checks).filter(function (key) { return !checks[key]; });
            return JSON.stringify({
              checks: checks,
              failedChecks: failedChecks,
              errors: window.__integration2019Errors || []
            });
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

            if !failedChecks.isEmpty || !errors.isEmpty {
                let checkText = failedChecks.isEmpty ? "no failed checks" : failedChecks.joined(separator: ", ")
                let errorText = errors.isEmpty ? "no console errors" : errors.joined(separator: " | ")
                self.finishCurrent(failure: "\(checkText); \(errorText)")
                return
            }

            self.finishCurrent(failure: nil)
        }
    }

    private func finishCurrent(failure: String?) {
        let test = tests[currentIndex]
        if let failure {
            failures.append("\(test.name): \(failure)")
            print("✗ \(test.name)")
        } else {
            print("✓ \(test.name)")
        }
        currentIndex += 1
        DispatchQueue.main.async { [weak self] in
            self?.runNext()
        }
    }
}

private let baseURL = CommandLine.arguments.count > 1
    ? URL(string: CommandLine.arguments[1])!
    : URL(fileURLWithPath: FileManager.default.currentDirectoryPath, isDirectory: true)
private let runner = Runner(baseURL: baseURL)
runner.start()
NSApplication.shared.run()
