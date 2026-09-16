#!/usr/bin/env swift

import AppKit
import Foundation
import WebKit

private struct AuditCase {
    let name: String
    let path: String
    let width: CGFloat
    let height: CGFloat
    let mode: String
}

private let cases: [AuditCase] = [
    AuditCase(name: "P0 locus mobile", path: "complex-1e2025.html?auditVisual=1", width: 390, height: 844, mode: "walkthrough"),
    AuditCase(name: "P0 IVP tablet", path: "int-2c2024.html?auditVisual=1", width: 768, height: 1024, mode: "walkthrough"),
    AuditCase(name: "P0 parameter w mobile", path: "complex-2023.html?q=3c&auditVisual=1", width: 390, height: 844, mode: "walkthrough-prose"),
    AuditCase(name: "P0 parameter p desktop", path: "complex-2022.html?q=1d&auditVisual=1", width: 1440, height: 900, mode: "walkthrough"),
    AuditCase(name: "P0 parameter g mobile", path: "complex-2020.html?q=1c&auditVisual=1", width: 390, height: 844, mode: "walkthrough"),
    AuditCase(name: "P0 parameter m tablet", path: "complex-2021.html?q=3d&auditVisual=1", width: 768, height: 1024, mode: "walkthrough"),
    AuditCase(name: "P0 stationary inflection desktop", path: "2e2024.html?auditVisual=1", width: 1440, height: 900, mode: "walkthrough"),
    AuditCase(name: "implicit singular continuation mobile", path: "int-3e2023.html?auditVisual=1", width: 390, height: 844, mode: "walkthrough"),
    AuditCase(name: "positive square root tablet", path: "3e2023.html?auditVisual=1", width: 768, height: 1024, mode: "walkthrough"),
    AuditCase(name: "logarithm branch desktop", path: "int-1e2025.html?auditVisual=1", width: 1440, height: 900, mode: "walkthrough"),
    AuditCase(name: "2020 zero polar root mobile", path: "complex-2020.html?q=3d&auditVisual=1", width: 390, height: 844, mode: "walkthrough"),
    AuditCase(name: "2021 zero polar root tablet", path: "complex-2021.html?q=2d&auditVisual=1", width: 768, height: 1024, mode: "walkthrough"),
    AuditCase(name: "2022 zero polar root desktop", path: "complex-2022.html?q=3c&auditVisual=1", width: 1440, height: 900, mode: "walkthrough"),
    AuditCase(name: "2023 zero polar root mobile", path: "complex-2023.html?q=2d&auditVisual=1", width: 390, height: 844, mode: "walkthrough"),
    AuditCase(name: "2024 zero polar root tablet", path: "complex-2024.html?q=3d&auditVisual=1", width: 768, height: 1024, mode: "walkthrough"),
    AuditCase(name: "prose regression tablet", path: "complex-2023.html?q=3c&auditVisual=tablet", width: 768, height: 1024, mode: "walkthrough-prose"),
    AuditCase(name: "prose regression desktop", path: "complex-2023.html?q=3c&auditVisual=desktop", width: 1440, height: 900, mode: "walkthrough-prose"),
    AuditCase(name: "Level 3 homepage desktop", path: "index.html?auditSurface=home", width: 1440, height: 900, mode: "home"),
    AuditCase(name: "official resources mobile", path: "level-3-integration-2024.html?auditSurface=resources", width: 390, height: 844, mode: "resources"),
    AuditCase(name: "exam mode before and after reveal", path: "complex-1e2025.html?auditExam=1", width: 1440, height: 900, mode: "exam"),
    AuditCase(name: "self assessment save", path: "complex-1e2025.html?auditReset=1", width: 390, height: 844, mode: "assessment-save"),
    AuditCase(name: "self assessment reload", path: "complex-1e2025.html?auditAssessment=reload", width: 390, height: 844, mode: "assessment-reload"),
    AuditCase(name: "legacy completion migration", path: "complex-1e2025.html?auditLegacy=1", width: 768, height: 1024, mode: "legacy"),
    AuditCase(name: "malformed progress recovery", path: "complex-1e2025.html?auditMalformed=1", width: 768, height: 1024, mode: "malformed"),
    AuditCase(name: "search URL filters history and reset", path: "search.html?q=chain%20rule&level=level-3&auditSearch=1", width: 768, height: 1024, mode: "search")
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
    private var evaluating = false
    private var failures: [String] = []

    init(baseURL: URL) {
        self.baseURL = baseURL
        self.consoleCollector = ConsoleCollector()

        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.userContentController.add(consoleCollector, name: "auditConsole")
        configuration.userContentController.addUserScript(WKUserScript(
            source: #"""
              (function () {
                const params = new URLSearchParams(location.search);
                const progressKey = "calc.nz.walkthroughProgress";
                if (params.get("auditReset") === "1") {
                  localStorage.removeItem(progressKey);
                  localStorage.setItem("calc.nz.examMode", "false");
                }
                if (params.get("auditExam") === "1") {
                  localStorage.setItem("calc.nz.examMode", "true");
                }
                if (params.get("auditLegacy") === "1") {
                  localStorage.setItem(progressKey, JSON.stringify({
                    "level-3-complex-2025:1e": {
                      visited: true,
                      completed: true,
                      completedAt: "1700000000000"
                    }
                  }));
                }
                if (params.get("auditMalformed") === "1") {
                  localStorage.setItem(progressKey, "{not-json");
                }
                window.__auditSmokeErrors = [];
                window.addEventListener("error", function (event) {
                  window.__auditSmokeErrors.push(event.message || "Resource load error");
                });
                window.addEventListener("unhandledrejection", function (event) {
                  window.__auditSmokeErrors.push(String(event.reason || "Unhandled rejection"));
                });
                const originalError = console.error;
                console.error = function () {
                  const message = Array.prototype.join.call(arguments, " ");
                  window.__auditSmokeErrors.push(message);
                  window.webkit.messageHandlers.auditConsole.postMessage(message);
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
        guard index < cases.count else {
            print("\nAudit remediation WebKit smoke: \(cases.count - failures.count)/\(cases.count) cases passed.")
            if !failures.isEmpty {
                print("Failures:")
                failures.forEach { print("- \($0)") }
                exit(1)
            }
            NSApplication.shared.terminate(nil)
            return
        }

        evaluating = false
        consoleCollector.messages.removeAll()
        let test = cases[index]
        webView.frame = CGRect(x: 0, y: 0, width: test.width, height: test.height)
        webView.load(URLRequest(url: URL(string: test.path, relativeTo: baseURL)!))
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard !evaluating else { return }
        evaluating = true
        let test = cases[index]

        let evaluateAfterEnhancement = { [weak self] in
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.35) {
                self?.evaluate(test)
            }
        }
        if webView.url?.lastPathComponent == "index.html" {
            webView.evaluateJavaScript("window.loadCalcNzHomepageTools && window.loadCalcNzHomepageTools();") { _, _ in
                evaluateAfterEnhancement()
            }
        } else {
            evaluateAfterEnhancement()
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        finish(cases[index], failure: "navigation failed: \(error.localizedDescription)")
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        finish(cases[index], failure: "provisional navigation failed: \(error.localizedDescription)")
    }

    private func evaluate(_ test: AuditCase) {
        let script = #"""
          const mode = "\#(test.mode)";
          const delay = function (milliseconds) {
            return new Promise(function (resolve) { setTimeout(resolve, milliseconds); });
          };
          const visible = function (element) {
            return Boolean(element && !element.hidden && !element.classList.contains("hidden")
              && !element.classList.contains("exam-mode-hidden") && getComputedStyle(element).display !== "none");
          };
          const checks = {};
          const debug = { mode: mode, url: location.href };

          if (mode.indexOf("walkthrough") === 0) {
            const question = document.getElementById("question-card");
            const notice = question && question.querySelector(".walkthrough-review-notice");
            const tips = Array.from(document.querySelectorAll(".walkthrough-tip-toggle"));
            const assessment = Array.from(document.querySelectorAll('[data-self-assessment] input[type="radio"]'));
            const equations = Array.from(document.querySelectorAll(".katex-display"));
            checks.runtimeReady = document.body.classList.contains("walkthrough-runtime-ready");
            checks.questionVisible = visible(question);
            checks.reviewNotice = Boolean(notice && visible(notice) && /awaiting independent teacher review/i.test(notice.textContent));
            checks.threeProgressiveHints = tips.length === 3 && tips.every(function (button, offset) {
              return button.textContent.trim() === "Show Hint " + (offset + 1);
            });
            checks.richWalkthrough = document.querySelectorAll(".walkthrough-step-card").length >= 7;
            checks.fourAssessmentOutcomes = assessment.length === 4;
            checks.noDocumentOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
            checks.legibleEquations = equations.length > 0 && equations.every(function (equation) {
              return parseFloat(getComputedStyle(equation).fontSize) >= 12;
            });
            checks.touchTargets = tips.every(function (button) { return button.getBoundingClientRect().height >= 43; });
            checks.headingAndStandard = Boolean(document.getElementById("page-title") && /Question/.test(document.getElementById("page-title").textContent)
              && /AS9157[789]/.test(document.body.textContent));
            if (mode === "walkthrough-prose") {
              const instruction = question && Array.from(question.querySelectorAll("p")).find(function (paragraph) {
                return /Solve the equation for/.test(paragraph.textContent);
              });
              const math = question && question.querySelector(".question-math");
              checks.semanticInstruction = Boolean(instruction && visible(instruction));
              checks.instructionWraps = Boolean(instruction && instruction.scrollWidth <= instruction.clientWidth + 1);
              checks.displayContainsNoSentence = Boolean(math && !/Solve|terms of|real parameter/.test(math.textContent));
            }
          } else if (mode === "home") {
            const scope = document.querySelector("[data-practice-scope]");
            checks.levelThreeHero = /Level 3 Calculus/.test(document.querySelector("h1").textContent);
            checks.threePrimaryStandards = document.querySelectorAll("[data-level-three-standard]").length === 3;
            checks.levelTwoSecondary = /More maths/.test(document.body.textContent) && Boolean(document.querySelector('a[href="level-2-calculus.html"]'));
            checks.levelThreeChooserDefault = document.getElementById("choose-level").dataset.currentStage === "standard"
              && document.querySelectorAll('[data-parent-level="level-3"]').length === 3;
            checks.levelThreePracticeDefault = Boolean(scope && scope.value === "level:level-3");
            checks.noDocumentOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
          } else if (mode === "resources") {
            const links = Array.from(document.querySelectorAll(".official-resource-list a"));
            checks.officialGroupPresent = links.length >= 3;
            checks.officialOnly = links.every(function (link) { return new URL(link.href).hostname === "www.nzqa.govt.nz"; });
            checks.safeNewTabs = links.every(function (link) {
              return link.target === "_blank" && /noopener/.test(link.rel)
                && /opens in a new tab/i.test(link.getAttribute("aria-label") || "");
            });
            checks.checkedDateVisible = /checked 28 August 2026/i.test(document.body.textContent);
            checks.noDocumentOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
          } else if (mode === "exam") {
            const tips = document.getElementById("tips-card") || document.getElementById("hints-card");
            const content = document.getElementById("walkthrough-content");
            const subtitle = document.getElementById("page-subtitle");
            const reveal = document.getElementById("exam-mode-reveal-btn");
            checks.neutralHeading = /Exam question/.test(document.getElementById("page-title").textContent)
              && /^.*Exam question \| Calc\.nz$/.test(document.title);
            checks.questionStillVisible = visible(document.getElementById("question-card"));
            checks.cuesHidden = Boolean(tips && content && subtitle
              && tips.classList.contains("exam-mode-hidden") && tips.inert && tips.getAttribute("aria-hidden") === "true"
              && content.classList.contains("exam-mode-hidden") && content.inert && content.getAttribute("aria-hidden") === "true"
              && subtitle.classList.contains("exam-mode-hidden"));
            checks.revealAvailable = visible(reveal) && reveal.getAttribute("aria-expanded") === "false";
            reveal.click();
            checks.revealRestoresContent = visible(tips) && visible(content) && reveal.getAttribute("aria-expanded") === "true";
            checks.revealMovesFocus = document.activeElement !== reveal && Boolean(document.activeElement.closest("#tips-card, #hints-card, #walkthrough-content"));
          } else if (mode === "assessment-save") {
            const radio = document.querySelector('[data-self-assessment] input[value="solved-with-hint"]');
            radio.checked = true;
            radio.dispatchEvent(new Event("change", { bubbles: true }));
            const progress = JSON.parse(localStorage.getItem("calc.nz.walkthroughProgress") || "{}");
            const state = progress["level-3-complex-2025:1e"] || {};
            checks.saved = state.assessment === "solved-with-hint" && state.attempted === true;
            checks.editable = document.querySelectorAll('[data-self-assessment] input[type="radio"]:not(:disabled)').length === 4;
          } else if (mode === "assessment-reload") {
            const radio = document.querySelector('[data-self-assessment] input[value="solved-with-hint"]');
            checks.persisted = Boolean(radio && radio.checked);
          } else if (mode === "legacy") {
            const progress = JSON.parse(localStorage.getItem("calc.nz.walkthroughProgress") || "{}");
            const state = progress["level-3-complex-2025:1e"] || {};
            checks.mappedWithoutMasteryClaim = state.assessment === "needed-walkthrough"
              && state.reviewed === true && state.migratedFromCompleted === true
              && !Object.prototype.hasOwnProperty.call(state, "completed");
          } else if (mode === "malformed") {
            let progress = null;
            try { progress = JSON.parse(localStorage.getItem("calc.nz.walkthroughProgress") || "{}"); } catch (error) {}
            checks.recoveredToObject = Boolean(progress && typeof progress === "object" && !Array.isArray(progress));
            checks.pageStillWorks = visible(document.getElementById("question-card"));
          } else if (mode === "search") {
            const input = document.querySelector("[data-global-search-input]");
            const level = document.querySelector('[data-search-filter="level"]');
            const standard = document.querySelector('[data-search-filter="standard"]');
            const form = document.querySelector("[data-global-search-form]");
            checks.initialHydration = input.value === "chain rule" && level.value === "level-3";
            input.value = "parametric";
            form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
            await delay(350);
            checks.submitUpdatesUrl = new URL(location.href).searchParams.get("q") === "parametric";
            standard.value = "AS91578";
            standard.dispatchEvent(new Event("change", { bubbles: true }));
            await delay(350);
            checks.filterUpdatesUrl = new URL(location.href).searchParams.get("standard") === "AS91578";
            history.back();
            await delay(350);
            checks.backRestoresControls = input.value === "parametric" && standard.value === "";
            history.forward();
            await delay(350);
            checks.forwardRestoresControls = input.value === "parametric" && standard.value === "AS91578";
            document.querySelector("[data-search-reset]").click();
            await delay(100);
            const resetUrl = new URL(location.href);
            checks.resetClearsState = !input.value && !level.value && !standard.value
              && !resetUrl.searchParams.has("q") && !resetUrl.searchParams.has("level") && !resetUrl.searchParams.has("standard");
            checks.resultsRendered = /result|Enter a search term/.test(document.querySelector("[data-global-search-status]").textContent);
            checks.noDocumentOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
          }

          checks.noConsoleErrors = (window.__auditSmokeErrors || []).length === 0;
          debug.errors = window.__auditSmokeErrors || [];
          return JSON.stringify({
            checks: checks,
            failedChecks: Object.keys(checks).filter(function (key) { return !checks[key]; }),
            debug: debug
          });
        """#

        webView.callAsyncJavaScript(script, arguments: [:], in: nil, in: .page) { [weak self] result in
            guard let self else { return }
            switch result {
            case .failure(let error):
                self.finish(test, failure: "evaluation failed: \(error.localizedDescription)")
            case .success(let value):
                guard let json = value as? String,
                      let data = json.data(using: .utf8),
                      let payload = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                      let failedChecks = payload["failedChecks"] as? [String] else {
                    self.finish(test, failure: "result could not be decoded")
                    return
                }
                if failedChecks.isEmpty && self.consoleCollector.messages.isEmpty {
                    print("PASS \(test.name)")
                    self.finish(test, failure: nil)
                    return
                }
                let console = self.consoleCollector.messages.joined(separator: " | ")
                let details = [
                    failedChecks.isEmpty ? nil : "checks: \(failedChecks.joined(separator: ", "))",
                    console.isEmpty ? nil : "console: \(console)"
                ].compactMap { $0 }.joined(separator: "; ")
                self.finish(test, failure: details)
            }
        }
    }

    private func finish(_ test: AuditCase, failure: String?) {
        if let failure {
            let message = "\(test.name): \(failure)"
            failures.append(message)
            print("FAIL \(message)")
        }
        index += 1
        runNext()
    }
}

private let baseURL = URL(string: CommandLine.arguments.dropFirst().first ?? "http://127.0.0.1:8002/")!
private let application = NSApplication.shared
private let runner = Runner(baseURL: baseURL)
application.setActivationPolicy(.prohibited)
runner.start()
application.run()
