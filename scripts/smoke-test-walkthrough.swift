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
    TestCase(name: "2020 native paper picker", path: "index.html#level-3-differentiation-2020", width: 1280, height: 900, expectedPart: nil, expectedSteps: nil, revealAll: false, preferenceAction: "index-picker", legacyRedirect: false, snapshotName: nil),
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
        consoleCollector.messages.removeAll()
        let test = tests[index]
        webView.frame = CGRect(x: 0, y: 0, width: test.width, height: test.height)
        let url = URL(string: test.path, relativeTo: baseURL)!
        webView.load(URLRequest(url: url))
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard !isEvaluating else { return }
        let test = tests[index]

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

            if (preferenceAction === "index-picker") {
              const panel = document.getElementById("level-3-differentiation-2020");
              const links = panel ? Array.from(panel.querySelectorAll("a.index-link-card")) : [];
              checks.paperPanelVisible = Boolean(panel && !panel.classList.contains("hidden") && panel.getAttribute("aria-hidden") === "false");
              checks.paperHasAllParts = links.length === 15;
              checks.paperUsesDirectPartRoutes = links.every(function (link) {
                return /\/[123][a-e]2020\.html#question-[123][a-e]$/.test(link.href);
              });
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
            const stepCards = Array.from(document.querySelectorAll(".walkthrough-step-card"));
            const revealButton = document.getElementById("walkthrough-next-btn");

            checks.questionRendered = Boolean(questionCard && questionCard.children.length);
            checks.settingPresent = Boolean(setting);
            checks.stepCount = expectedSteps === null || stepCards.length === expectedSteps;
            checks.katexRendered = document.querySelectorAll(".katex").length > 0;
            checks.noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;

            if (expectedPart !== null) {
              const chips = Array.from(document.querySelectorAll("#walkthrough-part-navigation .nav-btn"));
              const activeChip = document.querySelector("#walkthrough-part-navigation [aria-current='page']");
              checks.partChips = chips.length === 15;
              checks.partLinks = chips.every(function (link) {
                return /\/[123][a-e]2020\.html#question-[123][a-e]$/.test(link.href);
              });
              checks.activePart = Boolean(activeChip && activeChip.textContent.trim() === expectedPart.charAt(0) + "(" + expectedPart.charAt(1) + ")");
              checks.directHash = window.location.hash === "#question-" + expectedPart;
              checks.sharpQuestionImage = Boolean(image && image.complete && image.naturalWidth === 3125 && image.clientWidth <= image.naturalWidth);
            }

            if (revealAll && revealButton) {
              let guard = 0;
              while (!revealButton.disabled && guard < 20) {
                revealButton.click();
                guard += 1;
              }
              document.querySelectorAll(".step-working-btn:not(:disabled)").forEach(function (button) {
                button.click();
              });
              checks.allStepsRevealed = stepCards.every(function (card) { return !card.classList.contains("hidden"); });
              checks.allWorkingRevealed = stepCards.every(function (card) { return card.dataset.workingVisible === "true"; });
              checks.finalAnswerVisible = Boolean(document.querySelector(".walkthrough-step-card:last-child .answer-highlight"));
              checks.previousNextVisible = Boolean(document.querySelector("#walkthrough-final-nav:not(.hidden)"));
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

            if failedChecks.isEmpty && errors.isEmpty && self.consoleCollector.messages.isEmpty {
                print("PASS \(test.name)")
            } else {
                let reasons = [
                    failedChecks.isEmpty ? nil : "failed checks: \(failedChecks.joined(separator: ", "))",
                    errors.isEmpty ? nil : "page errors: \(errors.joined(separator: " | "))",
                    self.consoleCollector.messages.isEmpty ? nil : "console errors: \(self.consoleCollector.messages.joined(separator: " | "))"
                ].compactMap { $0 }
                self.failures.append("\(test.name): \(reasons.joined(separator: "; "))")
                print("FAIL \(test.name): \(reasons.joined(separator: "; "))")
            }

            self.finishCase(test)
        }
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
