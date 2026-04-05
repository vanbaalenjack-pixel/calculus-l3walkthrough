function initializeWalkthroughGate(config) {
  const hintsCard = document.getElementById("hints-card");
  const showHintsButton = document.getElementById("show-hints-btn");
  const walkthroughContent = document.getElementById("walkthrough-content");
  const questionCard = showHintsButton ? showHintsButton.closest(".question-card") : null;
  let questionMenuButton = null;
  let questionMenuPanel = null;

  if (
    !hintsCard ||
    !showHintsButton ||
    !walkthroughContent ||
    !config ||
    !Array.isArray(config.hints) ||
    !config.answerHtml ||
    !config.nextHref ||
    !config.nextLabel
  ) {
    return;
  }

  function placeHintsAfterWalkthrough() {
    if (!hintsCard.parentNode || hintsCard.parentNode !== walkthroughContent.parentNode) {
      return;
    }

    if (walkthroughContent.nextElementSibling !== hintsCard) {
      walkthroughContent.parentNode.insertBefore(hintsCard, walkthroughContent.nextSibling);
    }
  }

  placeHintsAfterWalkthrough();

  // Force the initial closed state in case the browser restores prior page state.
  hintsCard.classList.add("hidden");
  walkthroughContent.classList.add("hidden");
  showHintsButton.classList.remove("hidden");

  function getPageScrollTop(target) {
    if (!target) {
      return 0;
    }

    return Math.max(window.scrollY + target.getBoundingClientRect().top - 24, 0);
  }

  function normaliseActionLabel(value) {
    return (value || "").replace(/[←→]/g, "").replace(/\s+/g, " ").trim();
  }

  const answerButtonLabel = config.answerButtonLabel || "Show answer";
  const answerSectionLabel = config.answerSectionLabel || "Answer";
  const walkthroughButtonLabel = config.walkthroughButtonLabel || "Show full walkthrough";

  function closeQuestionMenu() {
    if (!questionMenuButton || !questionMenuPanel) {
      return;
    }

    if (questionCard) {
      questionCard.classList.remove("menu-open");
    }
    questionMenuButton.setAttribute("aria-expanded", "false");
    questionMenuPanel.classList.add("hidden");
  }

  function openQuestionMenu() {
    if (!questionMenuButton || !questionMenuPanel) {
      return;
    }

    if (questionCard) {
      questionCard.classList.add("menu-open");
    }
    questionMenuButton.setAttribute("aria-expanded", "true");
    questionMenuPanel.classList.remove("hidden");
  }

  function toggleQuestionMenu() {
    if (!questionMenuButton || !questionMenuPanel) {
      return;
    }

    if (questionMenuPanel.classList.contains("hidden")) {
      openQuestionMenu();
    } else {
      closeQuestionMenu();
    }
  }

  function getEntryNavigation() {
    const navRows = walkthroughContent.querySelectorAll(".nav-row");
    const finalNavRow = navRows.length ? navRows[navRows.length - 1] : null;
    const secondaryLink = finalNavRow ? finalNavRow.querySelector("a.nav-btn.secondary") : null;
    const primaryLink = finalNavRow
      ? Array.from(finalNavRow.querySelectorAll("a.nav-btn")).find(function (link) {
        return !link.classList.contains("secondary");
      })
      : null;
    const secondaryLabel = secondaryLink ? normaliseActionLabel(secondaryLink.textContent) : "";
    const previous = secondaryLink && !/back to paper/i.test(secondaryLabel)
      ? {
        href: secondaryLink.getAttribute("href"),
        label: "← Previous question"
      }
      : (config.previousHref
        ? {
          href: config.previousHref,
          label: config.previousLabel || "← Previous question"
        }
        : null);
    const next = primaryLink
      ? {
        href: primaryLink.getAttribute("href"),
        label: primaryLink.textContent.trim()
      }
      : {
        href: config.nextHref,
        label: config.nextLabel
      };

    return { previous: previous, next: next };
  }

  function addEntryActions() {
    if (!questionCard || questionCard.querySelector(".question-entry-actions")) {
      return;
    }

    const entryNavigation = getEntryNavigation();
    const actionRow = document.createElement("div");
    actionRow.className = "gate-actions question-entry-actions";
    const menuWrap = document.createElement("div");
    menuWrap.className = "question-menu";

    questionMenuButton = document.createElement("button");
    questionMenuButton.type = "button";
    questionMenuButton.className = "nav-btn secondary question-menu-button";
    questionMenuButton.textContent = "Menu";
    questionMenuButton.setAttribute("aria-expanded", "false");
    questionMenuButton.setAttribute("aria-haspopup", "true");

    questionMenuPanel = document.createElement("div");
    questionMenuPanel.className = "question-menu-panel hidden";

    const menuHintsButton = document.createElement("button");
    menuHintsButton.type = "button";
    menuHintsButton.className = "nav-btn secondary question-menu-option";
    menuHintsButton.textContent = "Hints";

    const menuWalkthroughButton = document.createElement("button");
    menuWalkthroughButton.type = "button";
    menuWalkthroughButton.className = "nav-btn secondary question-menu-option";
    menuWalkthroughButton.textContent = "Walkthrough";

    const menuAnswerButton = document.createElement("button");
    menuAnswerButton.type = "button";
    menuAnswerButton.className = "nav-btn secondary question-menu-option";
    menuAnswerButton.textContent = "Answer";

    questionMenuPanel.appendChild(menuHintsButton);
    questionMenuPanel.appendChild(menuWalkthroughButton);
    questionMenuPanel.appendChild(menuAnswerButton);
    menuWrap.appendChild(questionMenuButton);
    menuWrap.appendChild(questionMenuPanel);
    actionRow.appendChild(menuWrap);

    if (entryNavigation.previous) {
      const previousLink = document.createElement("a");
      previousLink.className = "nav-btn secondary";
      previousLink.href = entryNavigation.previous.href;
      previousLink.textContent = entryNavigation.previous.label;
      actionRow.appendChild(previousLink);
    } else {
      const previousButton = document.createElement("button");
      previousButton.type = "button";
      previousButton.className = "nav-btn secondary is-disabled";
      previousButton.textContent = "← Previous question";
      previousButton.disabled = true;
      previousButton.setAttribute("aria-disabled", "true");
      actionRow.appendChild(previousButton);
    }

    const nextLink = document.createElement("a");
    nextLink.className = "nav-btn";
    nextLink.href = entryNavigation.next.href;
    nextLink.textContent = entryNavigation.next.label;
    actionRow.appendChild(nextLink);

    showHintsButton.classList.add("hidden");

    questionCard.appendChild(actionRow);

    questionMenuButton.addEventListener("click", function (event) {
      event.stopPropagation();
      toggleQuestionMenu();
    });

    menuHintsButton.addEventListener("click", function () {
      closeQuestionMenu();
      revealHints();
    });

    menuWalkthroughButton.addEventListener("click", function () {
      closeQuestionMenu();
      revealWalkthrough();
    });

    menuAnswerButton.addEventListener("click", function () {
      closeQuestionMenu();
      revealAnswer();
    });

    document.addEventListener("click", function (event) {
      if (!questionMenuPanel || questionMenuPanel.classList.contains("hidden")) {
        return;
      }

      if (menuWrap.contains(event.target)) {
        return;
      }

      closeQuestionMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeQuestionMenu();
      }
    });
  }

  hintsCard.innerHTML = `
    <p class="question-label">Hints</p>
    <p class="step-text hint-intro">Open these one step at a time if you want a nudge before using the full walkthrough.</p>
    <div class="hint-list">
      ${config.hints.map((hint, index) => `
        <div class="hint-item">
          <p class="step-number">Hint ${index + 1}</p>
          <button class="nav-btn secondary hint-toggle-btn${index > 0 ? " hidden" : ""}" type="button" data-hint-index="${index}">
            Show hint ${index + 1}
          </button>
          <div class="hint-body hidden" id="hint-body-${index}">
            <p class="step-text">${hint}</p>
          </div>
        </div>
      `).join("")}
    </div>
    <div class="gate-actions">
      <button id="show-walkthrough-btn" class="nav-btn" type="button">${walkthroughButtonLabel}</button>
      <button id="show-answer-btn" class="nav-btn secondary" type="button">${answerButtonLabel}</button>
      <a id="next-question-link" class="nav-btn hidden" href="${config.nextHref}">${config.nextLabel}</a>
    </div>
    <div id="answer-card" class="hint-item hidden">
      <p class="step-number">${answerSectionLabel}</p>
      <div class="hint-body">
        ${config.answerHtml}
      </div>
    </div>
  `;

  if (typeof renderMath === "function") {
    renderMath(hintsCard);
  }

  const showWalkthroughButton = document.getElementById("show-walkthrough-btn");
  const showAnswerButton = document.getElementById("show-answer-btn");
  const nextQuestionLink = document.getElementById("next-question-link");
  const answerCard = document.getElementById("answer-card");
  const hintToggleButtons = hintsCard.querySelectorAll(".hint-toggle-btn");

  function ensureHintsVisible() {
    hintsCard.classList.remove("hidden");
    showHintsButton.classList.add("hidden");
  }

  function revealHints() {
    ensureHintsVisible();
    window.scrollTo({ top: getPageScrollTop(hintsCard), behavior: "smooth" });
  }

  function revealWalkthrough() {
    ensureHintsVisible();
    walkthroughContent.classList.remove("hidden");
    showWalkthroughButton.classList.add("hidden");
    addWalkthroughSkipButtons();
    window.scrollTo({ top: getPageScrollTop(walkthroughContent), behavior: "smooth" });
  }

  function revealAnswer() {
    ensureHintsVisible();
    answerCard.classList.remove("hidden");
    showAnswerButton.classList.add("hidden");
    nextQuestionLink.classList.remove("hidden");
    if (typeof renderMath === "function") {
      renderMath(answerCard);
    }
    window.scrollTo({ top: getPageScrollTop(answerCard), behavior: "smooth" });
  }

  addEntryActions();

  function addWalkthroughSkipButtons() {
    const stepCards = walkthroughContent.querySelectorAll(".step-card");

    stepCards.forEach(function (stepCard) {
      if (stepCard.querySelector(".walkthrough-step-actions")) {
        return;
      }

      const actionRow = document.createElement("div");
      actionRow.className = "walkthrough-step-actions";

      const skipButton = document.createElement("button");
      skipButton.type = "button";
      skipButton.className = "nav-btn secondary";
      skipButton.textContent = "Skip to answer";
      skipButton.addEventListener("click", revealAnswer);

      actionRow.appendChild(skipButton);

      const insertionTarget = stepCard.querySelector(".next-step-btn, .nav-row");
      if (insertionTarget) {
        stepCard.insertBefore(actionRow, insertionTarget);
      } else {
        stepCard.appendChild(actionRow);
      }
    });
  }

  hintToggleButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const hintIndex = Number(button.dataset.hintIndex);
      const hintBody = document.getElementById(`hint-body-${hintIndex}`);
      if (!hintBody) {
        return;
      }

      hintBody.classList.remove("hidden");
      button.classList.add("hidden");

      const nextButton = hintsCard.querySelector(`[data-hint-index="${hintIndex + 1}"]`);
      if (nextButton) {
        nextButton.classList.remove("hidden");
      }

      window.scrollTo({ top: getPageScrollTop(button), behavior: "smooth" });
    });
  });

  showHintsButton.addEventListener("click", function () {
    revealHints();
  });

  showWalkthroughButton.addEventListener("click", function () {
    revealWalkthrough();
  });

  showAnswerButton.addEventListener("click", function () {
    revealAnswer();
  });
}

(function () {
  const reportIssueHtml = 'Found an error or unclear explanation? Report it <a class="site-footer-link" href="https://docs.google.com/forms/d/e/1FAIpQLSfsQWI9kX3BVpUNJbEqUa9gdKiF1rTvNXT4bL0T3_AYYvLpkA/viewform?usp=publish-editor" target="_blank" rel="noreferrer">here</a>.';
  const INTERACTION_SELECTOR = ".option-btn, .check-btn, .next-step-btn";

  function getPageScrollTop(target) {
    if (!target) {
      return 0;
    }

    return Math.max(window.scrollY + target.getBoundingClientRect().top - 24, 0);
  }

  function normaliseButtonTypes(root) {
    const scope = root || document;
    scope.querySelectorAll("button:not([type])").forEach(function (button) {
      button.type = "button";
    });
  }

  function stabiliseInteractiveScroll(root) {
    const scope = root || document;

    scope.addEventListener("click", function (event) {
      const button = event.target.closest(INTERACTION_SELECTOR);
      if (!button) {
        return;
      }

      const initialScrollY = window.scrollY;
      const initialStep = button.closest(".step-card");

      window.setTimeout(function () {
        button.blur();
      }, 0);

      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          const currentScrollY = window.scrollY;
          const jumpedUpALot = initialScrollY - currentScrollY > 180;
          const jumpedNearTop = initialScrollY > 140 && currentScrollY < 60;

          if (!jumpedUpALot && !jumpedNearTop) {
            return;
          }

          const visibleStep = document.querySelector(".step-card:not(.hidden)");
          const target = button.classList.contains("next-step-btn")
            ? (visibleStep || initialStep)
            : (initialStep || visibleStep);

          if (!target) {
            return;
          }

          window.scrollTo({
            top: getPageScrollTop(target),
            behavior: "smooth"
          });
        });
      });
    }, true);
  }

  function ensureReportIssueFooter() {
    const body = document.body;
    if (!body) {
      return;
    }

    let footer = document.querySelector(".site-footer");
    if (!footer) {
      footer = document.createElement("footer");
      footer.className = "site-footer";
      body.appendChild(footer);
    }

    if (footer.querySelector(".report-issue-text")) {
      return;
    }

    const reportParagraph = document.createElement("p");
    reportParagraph.className = "site-footer-text report-issue-text";
    reportParagraph.innerHTML = reportIssueHtml;
    footer.appendChild(reportParagraph);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      normaliseButtonTypes(document);
      stabiliseInteractiveScroll(document);
      ensureReportIssueFooter();
    });
  } else {
    normaliseButtonTypes(document);
    stabiliseInteractiveScroll(document);
    ensureReportIssueFooter();
  }
}());
