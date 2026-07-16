(function () {
  const allParts = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const visualParts = ["1b", "1e", "2c", "2d", "3b", "3c"];

  function isVisible(element) {
    return Boolean(
      element
      && !element.hidden
      && !element.classList.contains("hidden")
      && getComputedStyle(element).display !== "none"
      && element.getClientRects().length
    );
  }

  function findUnrenderedMathText() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const matches = [];
    let node = walker.nextNode();

    while (node) {
      const parent = node.parentElement;
      const value = node.nodeValue || "";
      const renderedMath = parent && parent.closest(".katex");
      const ignored = parent && parent.closest("script, style");

      if (!renderedMath && !ignored && (
        /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]/.test(value)
        || /\\(?:frac|sqrt|operatorname|boxed|overline|left|right|therefore|mathbb|quad|text|begin|end)/.test(value)
      )) {
        matches.push(value.trim());
      }
      node = walker.nextNode();
    }

    return matches;
  }

  window.runIntegration2017SmokeCheck = function (part, mode) {
    const checks = {};
    const debug = {};

    if (mode === "picker") {
      const panel = document.getElementById("level-3-integration-2017");
      const button = document.querySelector('[data-paper="level-3-integration-2017"]');
      const links = panel ? Array.from(panel.querySelectorAll("a.index-link-card")) : [];
      const guidedLink = panel && panel.querySelector("[data-paper-start-guided]");

      checks.buttonAfter2018 = Boolean(
        button
        && button.previousElementSibling
        && button.previousElementSibling.dataset.paper === "level-3-integration-2018"
      );
      checks.nineIntegrationYears = document.querySelectorAll(
        '[data-standard-panel="level-3-integration"] > .paper-picker-grid [data-paper]'
      ).length === 9;
      checks.pickerButton = Boolean(button && button.getAttribute("aria-pressed") === "true");
      checks.panelVisible = isVisible(panel) && panel.getAttribute("aria-hidden") === "false";
      checks.entryChoiceVisible = isVisible(panel && panel.querySelector(".paper-entry-choice"));
      checks.guidedStartRoute = Boolean(
        guidedLink
        && /\/int-1a2017\.html\?mode=guided#question-1a$/.test(guidedLink.href)
      );
      checks.fifteenLinks = links.length === 15;
      checks.directRoutes = links.every(function (link) {
        return /\/int-[123][a-e]2017\.html#question-[123][a-e]$/.test(link.href);
      });

      panel.querySelector("[data-paper-start-specific]").click();
      checks.specificQuestionHash = window.location.hash === "#level-3-integration-2017-questions";
      checks.questionPickerVisible = isVisible(panel.querySelector(".paper-question-picker"));

      const searchInput = document.getElementById("walkthrough-search-input");
      searchInput.value = "integration 2017";
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      const searchLinks = Array.from(document.querySelectorAll(".home-search-result"));
      checks.searchCatalogue = searchLinks.length > 0 && searchLinks.every(function (link) {
        return /int-[123][a-e]2017\.html/.test(link.getAttribute("href"));
      });
      checks.noPageOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
    } else if (mode === "continue") {
      const card = document.getElementById("homepage-continue-card");
      const link = card && card.querySelector("a");
      const progress = JSON.parse(localStorage.getItem("calc.nz.walkthroughProgress") || "{}");
      const completed2017 = Object.keys(progress).filter(function (key) {
        return key.indexOf("level-3-integration-2017:") === 0 && progress[key].completed;
      });

      checks.continueVisible = isVisible(card);
      checks.continuePaper = Boolean(card && /2017 Integration/.test(card.textContent));
      checks.continueRoute = Boolean(link && /int-3e2017\.html/.test(link.getAttribute("href")));
      checks.allPartsCompleted = completed2017.length === 15;
      checks.noPageOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
    } else {
      const questionCard = document.getElementById("question-card");
      const stepCards = Array.from(document.querySelectorAll(".walkthrough-step-card"));
      const previousButton = document.getElementById("walkthrough-previous-btn");
      const nextButton = document.getElementById("walkthrough-next-btn");
      const partLinks = Array.from(document.querySelectorAll("#walkthrough-part-navigation .nav-btn"));
      const activePartLink = document.querySelector("#walkthrough-part-navigation [aria-current='page']");
      const sidebarParts = Array.from(document.querySelectorAll("[data-walkthrough-sidebar-part]"));
      const sidebarYears = Array.from(document.querySelectorAll(".walkthrough-sidebar-year-list a")).map(function (link) {
        return link.textContent.trim();
      });
      const backLink = document.getElementById("back-link");
      const graphSvgs = Array.from(document.querySelectorAll("svg.graph-svg"));

      checks.route = window.location.pathname.endsWith("/int-" + part + "2017.html")
        && window.location.hash === "#question-" + part;
      checks.redirectGuidedMode = mode !== "redirect"
        || new URLSearchParams(window.location.search).get("mode") === "guided";
      checks.dataLoaded = Boolean(
        window.Integration2017Walkthroughs
        && window.Integration2017Walkthroughs[part]
      );
      checks.questionVisible = isVisible(questionCard) && questionCard.textContent.trim().length > 0;
      checks.mathRendered = document.querySelectorAll(".katex").length > 0
        && !document.querySelector(".katex-error");
      checks.focusCard = Boolean(document.querySelector("#hints-card:not(.hidden) .walkthrough-tip-card"));
      checks.stepCount = stepCards.length >= 2;
      checks.stepWorking = stepCards.every(function (card) {
        const body = card.querySelector(".walkthrough-working-body");
        return Boolean(body && body.textContent.trim());
      });
      checks.finalAnswerPresent = Boolean(
        stepCards.length
        && stepCards[stepCards.length - 1].querySelector(".walkthrough-answer-highlight")
      );
      checks.partNavigation = partLinks.length === 15 && partLinks.every(function (link) {
        return /\/int-[123][a-e]2017\.html/.test(link.href);
      });
      checks.activePart = Boolean(
        activePartLink
        && activePartLink.textContent.trim() === part.charAt(0) + "(" + part.charAt(1) + ")"
      );
      checks.sidebarNavigation = sidebarParts.length === 15 && sidebarYears.indexOf("2017") >= 0;
      checks.backToPaper = Boolean(
        backLink && backLink.getAttribute("href") === "index.html#level-3-integration-2017"
      );
      checks.settings = Boolean(
        document.getElementById("sticky-question-setting")
        && document.getElementById("exam-mode-setting")
      );
      checks.oneStepStartsVisible = stepCards.filter(isVisible).length === 1;
      checks.previousStartsDisabled = Boolean(previousButton && previousButton.disabled);

      const firstWorking = stepCards[0] && stepCards[0].querySelector(".step-working-btn");
      if (firstWorking) {
        firstWorking.click();
      }
      checks.workingReveal = Boolean(
        firstWorking
        && firstWorking.getAttribute("aria-expanded") === "true"
        && isVisible(stepCards[0].querySelector(".walkthrough-step-working"))
      );

      if (stepCards.length > 1) {
        nextButton.click();
        checks.nextStep = stepCards[1].getAttribute("aria-hidden") === "false";
        previousButton.click();
        checks.previousStep = stepCards[0].getAttribute("aria-hidden") === "false";
      }

      let navigationGuard = 0;
      while (nextButton && !nextButton.disabled && navigationGuard < 20) {
        nextButton.click();
        navigationGuard += 1;
      }

      checks.navigationCompleted = Boolean(nextButton && nextButton.disabled && navigationGuard < 20);
      checks.oneStepRemainsVisible = stepCards.filter(isVisible).length === 1;
      checks.finalStepVisible = isVisible(stepCards[stepCards.length - 1]);
      checks.finalWorkingVisible = stepCards[stepCards.length - 1].dataset.workingVisible === "true";
      checks.finalAnswerVisible = isVisible(
        stepCards[stepCards.length - 1].querySelector(".walkthrough-answer-highlight")
      );
      checks.finalNavigation = isVisible(document.getElementById("walkthrough-final-nav"));

      const progress = JSON.parse(localStorage.getItem("calc.nz.walkthroughProgress") || "{}");
      checks.progressKey = Boolean(
        progress["level-3-integration-2017:" + part]
        && progress["level-3-integration-2017:" + part].completed
      );
      checks.sidebarPartCompleted = Boolean(
        document.querySelector('[data-walkthrough-sidebar-part="' + part + '"].is-complete')
      );

      const finalPrimary = document.querySelector("#walkthrough-final-nav .nav-btn:not(.secondary)");
      const partIndex = allParts.indexOf(part);
      const nextPart = partIndex >= 0 && partIndex < allParts.length - 1
        ? allParts[partIndex + 1]
        : null;
      checks.nextQuestion = nextPart
        ? Boolean(finalPrimary && finalPrimary.href.indexOf("int-" + nextPart + "2017.html") >= 0)
        : Boolean(finalPrimary && finalPrimary.href.indexOf("#level-3-integration-2017") >= 0);
      const guidedRequested = new URLSearchParams(window.location.search).get("mode") === "guided";
      checks.guidedModeCarried = !guidedRequested || !nextPart
        || Boolean(finalPrimary && /\?mode=guided/.test(finalPrimary.href));

      checks.expectedVisual = visualParts.indexOf(part) < 0 || graphSvgs.length > 0;
      checks.graphAccessible = graphSvgs.every(function (svg) {
        return svg.getAttribute("role") === "img"
          && Boolean(svg.querySelector("title"))
          && Boolean(svg.querySelector("desc"));
      });
      checks.graphFits = graphSvgs.every(function (svg) {
        const rect = svg.getBoundingClientRect();
        return rect.left >= -1 && rect.right <= window.innerWidth + 1;
      });
      checks.visualFramesFit = Array.from(questionCard.querySelectorAll(".graph-frame")).every(function (frame) {
        const rect = frame.getBoundingClientRect();
        return rect.left >= -1 && rect.right <= window.innerWidth + 1;
      });

      const unrenderedMathText = findUnrenderedMathText();
      checks.noUnrenderedMathText = unrenderedMathText.length === 0;
      debug.unrenderedMathText = unrenderedMathText;
      checks.noPageOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;

      if (mode === "mobile") {
        checks.mobileQuestionNotSticky = !questionCard.classList.contains(
          "sticky-question-card-enabled"
        );
      }
    }

    checks.noConsoleErrors = (window.__integration2017Errors || []).length === 0;
    const failedChecks = Object.keys(checks).filter(function (key) {
      return !checks[key];
    });
    return JSON.stringify({
      checks: checks,
      failedChecks: failedChecks,
      errors: window.__integration2017Errors || [],
      debug: debug
    });
  };

  window.navigateIntegration2017HistoryToQuestion = function () {
    const panel = document.getElementById("level-3-integration-2017");
    const specificQuestionButton = panel && panel.querySelector("[data-paper-start-specific]");
    const targetLink = panel && panel.querySelector(
      'a[href="int-2c2017.html#question-2c"]'
    );

    if (!specificQuestionButton || !targetLink) {
      return false;
    }

    specificQuestionButton.click();
    if (!isVisible(panel.querySelector(".paper-question-picker"))) {
      return false;
    }

    window.setTimeout(function () {
      targetLink.click();
    }, 0);
    return true;
  };

  window.runIntegration2017HistoryCheck = function (stage) {
    const checks = {};
    const debug = {
      stage: stage,
      path: window.location.pathname,
      hash: window.location.hash,
      historyState: window.history.state
    };
    const errors = window.__integration2017Errors || [];
    const panel = document.getElementById("level-3-integration-2017");
    const entryChoice = panel && panel.querySelector(".paper-entry-choice");
    const questionPicker = panel && panel.querySelector(".paper-question-picker");
    const targetLink = panel && panel.querySelector(
      'a[href="int-2c2017.html#question-2c"]'
    );
    const onQuestion = stage === "question-first"
      || stage === "question-reload"
      || stage === "question-forward";

    if (onQuestion) {
      const questionCard = document.getElementById("question-card");
      const activePart = document.querySelector(
        "#walkthrough-part-navigation [aria-current='page']"
      );
      const graph = questionCard && questionCard.querySelector("svg.graph-svg");

      checks.questionRoute = window.location.pathname.endsWith("/int-2c2017.html")
        && window.location.hash === "#question-2c";
      checks.questionData = Boolean(
        window.Integration2017Walkthroughs
        && window.Integration2017Walkthroughs["2c"]
      );
      checks.questionRendered = isVisible(questionCard)
        && questionCard.textContent.trim().length > 0;
      checks.mathRendered = document.querySelectorAll(".katex").length > 0
        && !document.querySelector(".katex-error");
      checks.walkthroughRendered = document.querySelectorAll(".walkthrough-step-card").length >= 2;
      checks.currentPartRetained = Boolean(activePart && activePart.textContent.trim() === "2(c)");
      checks.graphRetained = Boolean(
        graph
        && graph.getAttribute("role") === "img"
        && graph.querySelector("title")
        && graph.querySelector("desc")
      );
    } else {
      const expectedHash = stage === "index-back"
        ? "#level-3-integration-2017-questions"
        : "#level-3-integration-2017";
      const expectedSelection = expectedHash.slice(1);

      checks.indexRoute = window.location.pathname.endsWith("/index.html")
        && window.location.hash === expectedHash;
      checks.panelVisible = isVisible(panel) && panel.getAttribute("aria-hidden") === "false";
      checks.paperSelected = Boolean(
        document.querySelector(
          '[data-paper="level-3-integration-2017"][aria-pressed="true"]'
        )
      );
      checks.historySelectionRetained = Boolean(
        window.history.state
        && window.history.state.selectionHash === expectedSelection
      );
      checks.targetLinkRetained = Boolean(targetLink);

      if (stage === "index-back") {
        checks.questionPickerRestored = isVisible(questionPicker);
        checks.entryChoiceHidden = !isVisible(entryChoice);
      } else {
        checks.entryChoiceVisible = isVisible(entryChoice);
        checks.questionPickerHidden = !isVisible(questionPicker);
      }
    }

    checks.noPageOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
    checks.noConsoleErrors = errors.length === 0;
    const failedChecks = Object.keys(checks).filter(function (key) {
      return !checks[key];
    });

    return JSON.stringify({
      checks: checks,
      failedChecks: failedChecks,
      errors: errors,
      debug: debug
    });
  };
}());
