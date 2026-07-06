(function () {
  window.runComplex2020SmokeCheck = function (part, mode) {
    const checks = {};
    const debug = {};

    if (mode === "picker") {
      const panel = document.getElementById("level-3-complex-2020");
      const button = document.querySelector('[data-paper="level-3-complex-2020"]');
      const links = panel ? Array.from(panel.querySelectorAll("a.index-link-card")) : [];
      checks.pickerButton = Boolean(button && button.getAttribute("aria-pressed") === "true");
      checks.panelVisible = Boolean(
        panel
        && !panel.classList.contains("hidden")
        && panel.getAttribute("aria-hidden") === "false"
      );
      checks.entryChoiceVisible = Boolean(
        panel && !panel.querySelector(".paper-entry-choice").classList.contains("hidden")
      );
      checks.guidedStartRoute = Boolean(
        panel
        && /\/complex-2020\.html\?q=1a&mode=guided$/.test(
          panel.querySelector("[data-paper-start-guided]").href
        )
      );
      checks.fifteenLinks = links.length === 15;
      checks.directRoutes = links.every(function (link) {
        return /\/complex-2020\.html\?q=[123][a-e]$/.test(link.href);
      });
    } else {
      const questionCard = document.getElementById("question-card");
      const image = questionCard && questionCard.querySelector("img.question-screenshot");
      const setting = document.getElementById("sticky-question-setting");
      const stepCards = Array.from(document.querySelectorAll(".walkthrough-step-card"));
      const previousButton = document.getElementById("walkthrough-previous-btn");
      const nextButton = document.getElementById("walkthrough-next-btn");
      const chips = Array.from(document.querySelectorAll("#walkthrough-part-navigation .nav-btn"));
      const activeChip = document.querySelector("#walkthrough-part-navigation [aria-current='page']");

      checks.route = window.location.pathname.endsWith("/complex-2020.html")
        && window.location.search === "?q=" + part;
      checks.questionImage = Boolean(
        image
        && image.complete
        && image.naturalWidth > 1500
        && image.naturalHeight > 250
      );
      checks.partNavigation = chips.length === 15 && chips.every(function (link) {
        return /\/complex-2020\.html\?q=[123][a-e]$/.test(link.href);
      });
      checks.activePart = Boolean(
        activeChip
        && activeChip.textContent.trim() === part.charAt(0) + "(" + part.charAt(1) + ")"
      );
      checks.focusCard = Boolean(document.querySelector("#hints-card:not(.hidden) .walkthrough-tip-card"));
      checks.stepsPresent = stepCards.length > 0;
      checks.stickySetting = Boolean(setting);
      checks.oneStepStartsVisible = stepCards.filter(function (card) {
        return !card.classList.contains("hidden");
      }).length === 1;
      checks.previousStartsDisabled = previousButton.disabled;

      const workingButtons = Array.from(document.querySelectorAll(".step-working-btn"));
      workingButtons[0].click();
      nextButton.click();
      previousButton.click();
      checks.workingPreserved = stepCards[0].dataset.workingVisible === "true";

      let navigationGuard = 0;
      while (nextButton && !nextButton.disabled && navigationGuard < 20) {
        nextButton.click();
        navigationGuard += 1;
      }

      checks.navigationCompleted = Boolean(nextButton && nextButton.disabled && navigationGuard < 20);
      checks.showWorkingButtons = workingButtons.length === stepCards.length;
      checks.oneStepRemainsVisible = stepCards.filter(function (card) {
        return !card.classList.contains("hidden");
      }).length === 1;
      checks.finalStepVisible = !stepCards[stepCards.length - 1].classList.contains("hidden");
      checks.finalWorkingVisible = stepCards[stepCards.length - 1].dataset.workingVisible === "true";
      checks.finalAnswer = Boolean(
        document.querySelector(".walkthrough-step-card:last-child .answer-highlight")
      );
      checks.finalNavigation = Boolean(
        document.querySelector("#walkthrough-final-nav:not(.hidden) a.nav-btn")
      );
      checks.katex = document.querySelectorAll(".katex").length > 0
        && !document.querySelector(".katex-error");
      checks.inlineKatex = Array.from(document.querySelectorAll(".katex")).some(function (node) {
        return !node.closest(".katex-display");
      });

      const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const unrenderedMathText = [];
      let textNode = textWalker.nextNode();
      while (textNode) {
        const parent = textNode.parentElement;
        const value = textNode.nodeValue || "";
        const renderedMath = parent && parent.closest(".katex");
        const ignored = parent && parent.closest("script, style");
        if (!renderedMath && !ignored && (
          /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]/.test(value)
          || /\\(?:frac|sqrt|operatorname|boxed|overline|left|right|therefore|in|mathbb|quad|text|\(|\))/.test(value)
        )) {
          unrenderedMathText.push(value.trim());
        }
        textNode = textWalker.nextNode();
      }
      checks.noUnrenderedMathText = unrenderedMathText.length === 0;
      debug.unrenderedMathText = unrenderedMathText;
      checks.noPageOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;

      if (mode === "mobile") {
        checks.mobileImageFits = image.getBoundingClientRect().width
          <= questionCard.getBoundingClientRect().width;
        checks.mobileQuestionNotSticky = !questionCard.classList.contains(
          "sticky-question-card-enabled"
        );
      }

      if (mode === "desktop" && part === "1a") {
        const startedOn = setting.checked
          && localStorage.getItem("calc.nz.stickyQuestionCard") !== "false";
        const stickyClassOn = questionCard.classList.contains("sticky-question-card-enabled");
        setting.checked = false;
        setting.dispatchEvent(new Event("change", { bubbles: true }));
        const savedOff = localStorage.getItem("calc.nz.stickyQuestionCard") === "false";
        const stickyClassOff = !questionCard.classList.contains("sticky-question-card-enabled");
        setting.checked = true;
        setting.dispatchEvent(new Event("change", { bubbles: true }));
        const stickyClassRestored = questionCard.classList.contains("sticky-question-card-enabled");
        checks.stickyToggle = startedOn
          && stickyClassOn
          && savedOff
          && stickyClassOff
          && stickyClassRestored
          && localStorage.getItem("calc.nz.stickyQuestionCard") === "true";
      }
    }

    checks.noConsoleErrors = (window.__complex2020Errors || []).length === 0;
    const failedChecks = Object.keys(checks).filter(function (key) {
      return !checks[key];
    });
    return JSON.stringify({
      checks: checks,
      failedChecks: failedChecks,
      errors: window.__complex2020Errors || [],
      debug: debug
    });
  };
}());
