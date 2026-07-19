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

private let visualParts = ["1d", "2c", "2e", "3c", "3e"]

private var tests: [TestCase] = [
    TestCase(
        name: "2016 Differentiation picker and search",
        path: "index.html#level-3-differentiation-2016",
        width: 1280,
        height: 900,
        part: nil,
        mode: "picker"
    ),
    TestCase(
        name: "2016 Differentiation paper overview",
        path: "level-3-differentiation-2016.html",
        width: 375,
        height: 844,
        part: nil,
        mode: "overview"
    )
]

for part in parts {
    tests.append(TestCase(
        name: "\(part) desktop 1280px",
        path: "\(part)2016.html",
        width: 1280,
        height: 900,
        part: part,
        mode: "desktop"
    ))
}

for (index, part) in parts.enumerated() {
    let width: CGFloat = index.isMultiple(of: 2) ? 320 : 375
    tests.append(TestCase(
        name: "\(part) mobile \(Int(width))px",
        path: "\(part)2016.html",
        width: width,
        height: 844,
        part: part,
        mode: "mobile"
    ))
}

for part in visualParts {
    tests.append(TestCase(
        name: "\(part) diagram tablet 768px",
        path: "\(part)2016.html",
        width: 768,
        height: 1024,
        part: part,
        mode: "tablet"
    ))
}

for part in visualParts {
    tests.append(TestCase(
        name: "\(part) diagram wide 1440px",
        path: "\(part)2016.html",
        width: 1440,
        height: 1000,
        part: part,
        mode: "wide"
    ))
}

tests.append(TestCase(
    name: "2016 Differentiation continue card",
    path: "index.html",
    width: 1280,
    height: 900,
    part: nil,
    mode: "continue"
))

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
              window.__diff2016Errors = [];
              window.addEventListener("error", function (event) {
                window.__diff2016Errors.push(event.message || "Resource load error");
              });
              window.addEventListener("unhandledrejection", function (event) {
                window.__diff2016Errors.push(String(event.reason || "Unhandled rejection"));
              });
              (function () {
                const originalError = console.error;
                console.error = function () {
                  window.__diff2016Errors.push(Array.prototype.join.call(arguments, " "));
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
            print("\n2016 Differentiation browser smoke test: \(tests.count - failures.count)/\(tests.count) cases passed.")
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
        webView.load(URLRequest(url: url))
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard !evaluating else { return }
        let test = tests[currentIndex]

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
        let allPartList = parts.map { "\"\($0)\"" }.joined(separator: ", ")
        let visualPartList = visualParts.map { "\"\($0)\"" }.joined(separator: ", ")
        let script = #"""
          (function () {
            const part = \#(part);
            const mode = "\#(test.mode)";
            const allParts = [\#(allPartList)];
            const visualParts = [\#(visualPartList)];
            const checks = {};
            const unrenderedMathText = [];
            const isVisible = function (element) {
              if (!element || element.hidden || element.classList.contains("hidden")) return false;
              const style = getComputedStyle(element);
              return style.display !== "none" && style.visibility !== "hidden";
            };
            const routeEndsWith = function (href, route) {
              if (!href) return false;
              return new URL(href, window.location.href).pathname.endsWith("/" + route);
            };
            const uniqueSortedRoutes = function (links) {
              return Array.from(new Set(links.map(function (link) {
                return new URL(link.href, window.location.href).pathname.split("/").pop();
              }))).sort();
            };
            const expectedRoutes = allParts.map(function (item) {
              return item + "2016.html";
            }).sort();
            const routesMatchAllParts = function (links) {
              const routes = uniqueSortedRoutes(links);
              return routes.length === expectedRoutes.length && routes.every(function (route, index) {
                return route === expectedRoutes[index];
              });
            };
            const fitsViewport = function (element) {
              if (!isVisible(element)) return true;
              const rect = element.getBoundingClientRect();
              return rect.left >= -1 && rect.right <= window.innerWidth + 1;
            };

            if (mode === "picker") {
              const panel = document.getElementById("level-3-differentiation-2016");
              const button = document.querySelector('[data-paper="level-3-differentiation-2016"]');
              const links = panel ? Array.from(panel.querySelectorAll("a.index-link-card")) : [];
              const entry = panel && panel.querySelector(".paper-entry-choice");
              const guidedLink = panel && panel.querySelector("[data-paper-start-guided]");
              const specificButton = panel && panel.querySelector("[data-paper-start-specific]");

              checks.pickerButton = Boolean(button && button.getAttribute("aria-pressed") === "true");
              checks.panelVisible = isVisible(panel) && panel.getAttribute("aria-hidden") === "false";
              checks.entryChoiceVisible = isVisible(entry);
              checks.entryHeading = Boolean(
                entry
                && entry.querySelector("h2")
                && entry.querySelector("h2").textContent.trim() === "Where would you like to start?"
              );
              checks.guidedStartRoute = Boolean(guidedLink && /\/1a2016\.html\?mode=guided$/.test(guidedLink.href));
              checks.fifteenLinks = links.length === 15;
              checks.directRoutes = routesMatchAllParts(links);

              const searchInput = document.getElementById("walkthrough-search-input");
              if (searchInput) {
                searchInput.value = "AS91578 2016 differentiation";
                searchInput.dispatchEvent(new Event("input", { bubbles: true }));
              }
              const searchResults = Array.from(document.querySelectorAll("a.home-search-result"));
              checks.searchHasAllFifteen = searchResults.length === 15;
              checks.searchRoutesAre2016 = routesMatchAllParts(searchResults);
              checks.searchLabelsAre2016 = searchResults.every(function (link) {
                return link.textContent.indexOf("2016") >= 0 && /Question\s+[123]\([a-e]\)/i.test(link.textContent);
              });

              if (specificButton) specificButton.click();
              checks.specificQuestionHash = window.location.hash === "#level-3-differentiation-2016-questions";
              checks.questionPickerVisible = Boolean(
                panel
                && !isVisible(panel.querySelector(".paper-entry-choice"))
                && isVisible(panel.querySelector(".paper-question-picker"))
              );
              checks.noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
            } else if (mode === "overview") {
              const links = Array.from(document.querySelectorAll("a.index-link-card"));
              const breadcrumbStandard = document.querySelector('.seo-breadcrumbs a[href*="level-3-differentiation.html"]');
              const currentBreadcrumb = document.querySelector(".seo-breadcrumbs [aria-current='page']");
              const backLink = document.querySelector('.topbar a[href*="level-3-differentiation.html"]');
              const overview = document.getElementById("paper-overview-heading");

              checks.overviewRoute = window.location.pathname.endsWith("/level-3-differentiation-2016.html");
              checks.overviewTitle = Boolean(document.querySelector("h1") && document.querySelector("h1").textContent.indexOf("2016") >= 0);
              checks.overviewCount = Boolean(
                overview
                && overview.closest("section")
                && /15\s+(?:independent\s+)?worked question walkthroughs/i.test(overview.closest("section").textContent)
              );
              checks.overviewFifteenLinks = links.length === 15;
              checks.overviewRoutes = routesMatchAllParts(links);
              checks.standardBreadcrumb = Boolean(breadcrumbStandard && routeEndsWith(breadcrumbStandard.href, "level-3-differentiation.html"));
              checks.yearBreadcrumb = Boolean(currentBreadcrumb && /2016 paper/i.test(currentBreadcrumb.textContent));
              checks.backToStandard = Boolean(backLink && routeEndsWith(backLink.href, "level-3-differentiation.html"));
              checks.overviewNoOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
              checks.overviewFits = fitsViewport(document.querySelector(".topbar"))
                && fitsViewport(document.querySelector(".seo-breadcrumbs"));
            } else if (mode === "continue") {
              const card = document.getElementById("homepage-continue-card");
              const link = card && card.querySelector("a.home-continue-button");

              checks.continueVisible = Boolean(card && !card.hidden);
              checks.continueLabel = Boolean(
                card
                && card.textContent.indexOf("2016 Differentiation") >= 0
                && card.textContent.indexOf("Question 3(e)") >= 0
              );
              checks.continueRoute = Boolean(link && routeEndsWith(link.href, "3e2016.html"));
              checks.noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
            } else {
              const questionCard = document.getElementById("question-card");
              const visual = questionCard && questionCard.querySelector(".question-graph-frame");
              const setting = document.getElementById("sticky-question-setting");
              const stepCards = Array.from(document.querySelectorAll(".walkthrough-step-card"));
              const workingButtons = Array.from(document.querySelectorAll(".step-working-btn"));
              const previousButton = document.getElementById("walkthrough-previous-btn");
              const nextButton = document.getElementById("walkthrough-next-btn");
              const backLink = document.getElementById("back-link");
              const sidebarYears = Array.from(document.querySelectorAll(".walkthrough-sidebar-year-list a")).map(function (link) {
                return link.textContent.trim();
              });
              const sidebarParts = Array.from(document.querySelectorAll("[data-walkthrough-sidebar-part]"));
              const lastVisited = JSON.parse(localStorage.getItem("calc.nz.lastWalkthrough") || "null");
              const partIndex = allParts.indexOf(part);
              const expectedPrevious = partIndex > 0
                ? allParts[partIndex - 1] + "2016.html"
                : "level-3-differentiation-2016.html";
              const expectedNext = partIndex < allParts.length - 1
                ? allParts[partIndex + 1] + "2016.html"
                : "level-3-differentiation-2016.html";

              checks.route = window.location.pathname.endsWith("/" + part + "2016.html");
              checks.title = Boolean(
                document.getElementById("page-title")
                && document.getElementById("page-title").textContent.indexOf(
                  "Question " + part.charAt(0) + "(" + part.charAt(1) + ")"
                ) >= 0
              );
              checks.questionPrompt = Boolean(questionCard && questionCard.textContent.trim().length > 20);
              checks.backToPaper = Boolean(backLink && routeEndsWith(backLink.href, "level-3-differentiation-2016.html"));
              checks.breadcrumbHierarchy = Boolean(
                document.querySelector('.seo-breadcrumbs a[href*="level-3-differentiation.html"]')
                && document.querySelector('.seo-breadcrumbs a[href*="level-3-differentiation-2016.html"]')
                && document.querySelector(".seo-breadcrumbs [aria-current='page']")
              );
              checks.sidebarYear = sidebarYears.indexOf("2016") >= 0;
              checks.sidebarParts = sidebarParts.length === 15 && routesMatchAllParts(sidebarParts);
              checks.activePart = Boolean(
                document.querySelector("[data-walkthrough-sidebar-part='" + part + "'][aria-current='page']")
              );
              checks.tipsPresent = Boolean(document.querySelector("#hints-card:not(.hidden) .walkthrough-tip-card"));
              checks.progressiveStages = stepCards.length >= 2;
              checks.stickySetting = Boolean(setting);
              checks.recentRecord = Boolean(
                lastVisited
                && lastVisited.paperId === "level-3-differentiation-2016"
                && lastVisited.partId === part
                && routeEndsWith(lastVisited.href, part + "2016.html")
              );
              checks.visualDiagram = visualParts.indexOf(part) < 0 || Boolean(
                visual
                && visual.getAttribute("role") === "button"
                && visual.getAttribute("tabindex") === "0"
                && visual.querySelector("svg[viewBox][role='img']")
                && visual.querySelector("svg title")
                && visual.querySelector("svg desc")
                && !visual.querySelector("img")
              );
              checks.revealControlsAccessible = workingButtons.length === stepCards.length && workingButtons.every(function (button) {
                const controlled = button.getAttribute("aria-controls");
                return button.tagName === "BUTTON"
                  && button.type === "button"
                  && button.hasAttribute("aria-expanded")
                  && Boolean(controlled && document.getElementById(controlled));
              });
              checks.noQuizControls = Array.from(document.querySelectorAll("input")).every(function (input) {
                return input.type === "checkbox"
                  && (input.id === "sticky-question-setting" || input.id === "exam-mode-setting");
              })
                && !document.querySelector("textarea, select, [contenteditable='true'], [role='radio'], [role='combobox'], [data-correct-answer], .answer-input, .quiz-controls, .validation-feedback, .correctness-feedback")
                && !Array.from(document.querySelectorAll("button")).some(function (button) {
                  return /check answer|try again|submit answer|validate answer|score answer|mark answer/i.test(button.textContent);
                });
              checks.oneStepStartsVisible = stepCards.filter(function (card) {
                return !card.classList.contains("hidden");
              }).length === 1;
              checks.finalAnswerStartsHidden = Boolean(
                stepCards.length >= 2
                && stepCards[stepCards.length - 1].classList.contains("hidden")
                && stepCards[stepCards.length - 1].querySelector(".answer-highlight")
              );
              checks.previousStartsDisabled = Boolean(previousButton && previousButton.disabled);

              if (part === "1d" && mode === "desktop" && visual) {
                visual.focus();
                visual.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

                const lightbox = document.getElementById("question-image-lightbox");
                const clonedSvg = lightbox && lightbox.querySelector("svg[role='img']");
                const labelledIds = clonedSvg
                  ? (clonedSvg.getAttribute("aria-labelledby") || "").split(/\s+/).filter(Boolean)
                  : [];
                const documentIds = Array.from(document.querySelectorAll("[id]")).map(function (element) {
                  return element.id;
                });
                const markerIds = clonedSvg
                  ? Array.from(clonedSvg.querySelectorAll("[marker-start], [marker-mid], [marker-end]")).flatMap(function (element) {
                      return ["marker-start", "marker-mid", "marker-end"].map(function (attribute) {
                        const value = element.getAttribute(attribute) || "";
                        const match = value.match(/^url\(#(.+)\)$/);
                        return match ? match[1] : null;
                      }).filter(Boolean);
                    })
                  : [];

                checks.lightboxKeyboardOpen = Boolean(lightbox && !lightbox.hidden && clonedSvg);
                checks.lightboxUniqueIds = new Set(documentIds).size === documentIds.length;
                checks.lightboxAccessibleClone = labelledIds.length >= 2 && labelledIds.every(function (id) {
                  return Boolean(clonedSvg.querySelector("#" + CSS.escape(id)));
                });
                checks.lightboxMarkerReferences = markerIds.every(function (id) {
                  return Boolean(clonedSvg.querySelector("#" + CSS.escape(id)));
                });

                const closeButton = lightbox && lightbox.querySelector(".question-image-lightbox-close");
                if (closeButton) closeButton.click();
                checks.lightboxClose = Boolean(lightbox && lightbox.hidden);
                checks.lightboxFocusRestored = document.activeElement === visual;
              }

              if (part === "1a" && mode === "desktop" && setting) {
                const originalStickyValue = setting.checked;
                setting.checked = !originalStickyValue;
                setting.dispatchEvent(new Event("change", { bubbles: true }));
                checks.stickyPreferenceStored = localStorage.getItem("calc.nz.stickyQuestionCard")
                  === (!originalStickyValue ? "true" : "false");
                setting.checked = originalStickyValue;
                setting.dispatchEvent(new Event("change", { bubbles: true }));

                const examSetting = document.getElementById("exam-mode-setting");
                checks.examModeControls = Boolean(examSetting);
                if (examSetting) {
                  examSetting.checked = true;
                  examSetting.dispatchEvent(new Event("change", { bubbles: true }));
                  const revealPanel = document.getElementById("walkthrough-exam-mode-reveal-panel");
                  checks.examModeHides = document.body.classList.contains("exam-mode-active")
                    && Boolean(revealPanel && !revealPanel.hidden);
                  const revealButton = document.getElementById("exam-mode-reveal-btn");
                  if (revealButton) revealButton.click();
                  checks.examModeReveals = !document.body.classList.contains("exam-mode-active");
                  examSetting.checked = false;
                  examSetting.dispatchEvent(new Event("change", { bubbles: true }));
                }
              }

              if (stepCards.length) {
                const firstWorkingButton = stepCards[0].querySelector(".step-working-btn");
                const scrollBeforeReveal = window.scrollY;
                if (firstWorkingButton) firstWorkingButton.click();
                checks.workingRevealNoJump = Math.abs(window.scrollY - scrollBeforeReveal) <= 1;

                if (stepCards.length > 1 && nextButton && previousButton) {
                  nextButton.click();
                  previousButton.click();
                }
                checks.workingPreserved = stepCards[0].dataset.workingVisible === "true";
              } else {
                checks.workingRevealNoJump = false;
                checks.workingPreserved = false;
              }

              let navigationGuard = 0;
              while (nextButton && !nextButton.disabled && navigationGuard < 30) {
                nextButton.click();
                navigationGuard += 1;
              }

              checks.navigationCompleted = Boolean(nextButton && nextButton.disabled && navigationGuard < 30);
              checks.oneStepRemainsVisible = stepCards.filter(function (card) {
                return !card.classList.contains("hidden");
              }).length === 1;
              checks.finalStepVisible = Boolean(
                stepCards.length && !stepCards[stepCards.length - 1].classList.contains("hidden")
              );
              checks.finalWorkingVisible = Boolean(
                stepCards.length && stepCards[stepCards.length - 1].dataset.workingVisible === "true"
              );
              checks.finalAnswer = Boolean(document.querySelector(".walkthrough-step-card:last-child .answer-highlight"));

              const finalNavigation = document.querySelector("#walkthrough-final-nav:not(.hidden)");
              const finalLinks = finalNavigation ? Array.from(finalNavigation.querySelectorAll("a.nav-btn")) : [];
              checks.finalNavigation = finalLinks.length === 2;
              checks.previousQuestionRoute = Boolean(finalLinks[0] && routeEndsWith(finalLinks[0].href, expectedPrevious));
              checks.nextQuestionRoute = Boolean(finalLinks[1] && routeEndsWith(finalLinks[1].href, expectedNext));

              const progressMap = JSON.parse(localStorage.getItem("calc.nz.walkthroughProgress") || "{}");
              const progressKey = "level-3-differentiation-2016:" + part;
              checks.completionStored = Boolean(progressMap[progressKey] && progressMap[progressKey].completed);
              checks.progressIsYearSpecific = !progressMap["level-3-differentiation-2017:" + part];
              checks.katex = document.querySelectorAll(".katex").length > 0 && !document.querySelector(".katex-error");

              const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
              let textNode = textWalker.nextNode();
              while (textNode) {
                const parent = textNode.parentElement;
                const text = textNode.nodeValue || "";
                const isRenderedMath = parent && parent.closest(".katex");
                const isIgnoredElement = parent && parent.closest("script, style");
                if (!isRenderedMath && !isIgnoredElement && (
                  /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]/.test(text)
                  || /\\(?:frac|sqrt|sin|cos|tan|sec|csc|cot|ln|left|right|boxed|text|operatorname|arctan|\(|\))/.test(text)
                )) {
                  unrenderedMathText.push(text.trim());
                }
                textNode = textWalker.nextNode();
              }

              checks.noUnrenderedMathText = unrenderedMathText.length === 0;
              checks.noPageOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
              checks.responsiveContainers = fitsViewport(questionCard)
                && fitsViewport(document.querySelector(".topbar"))
                && fitsViewport(document.querySelector(".seo-breadcrumbs"))
                && fitsViewport(document.querySelector(".walkthrough-progress-card"));
              checks.mathContained = Array.from(document.querySelectorAll(".katex-display")).every(fitsViewport);

              if (mode === "mobile" || mode === "tablet") {
                checks.responsiveVisualFits = !visual
                  || visual.getBoundingClientRect().width <= questionCard.getBoundingClientRect().width + 1;
              }
              if (mode === "mobile") {
                checks.mobileQuestionNotSticky = !questionCard.classList.contains("sticky-question-card-enabled");
              }
            }

            checks.noConsoleErrors = (window.__diff2016Errors || []).length === 0;
            const failedChecks = Object.keys(checks).filter(function (key) {
              return !checks[key];
            });

            return JSON.stringify({
              checks: checks,
              failedChecks: failedChecks,
              errors: window.__diff2016Errors || [],
              unrenderedMathText: unrenderedMathText
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

            if failedChecks.isEmpty && errors.isEmpty {
                print("PASS \(test.name)")
                self.finishCurrent(failure: nil)
            } else {
                let unrendered = (payload["unrenderedMathText"] as? [String] ?? []).joined(separator: " | ")
                let detail = "checks: \(failedChecks.joined(separator: ", ")); errors: \(errors.joined(separator: " | "))"
                    + (unrendered.isEmpty ? "" : "; unrendered: \(unrendered)")
                self.finishCurrent(failure: detail)
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
    fputs("Usage: smoke-test-differentiation-2016.swift http://127.0.0.1:PORT/\n", stderr)
    exit(64)
}

private let app = NSApplication.shared
private let runner = Runner(baseURL: baseURL)
app.setActivationPolicy(.prohibited)
runner.start()
app.run()
