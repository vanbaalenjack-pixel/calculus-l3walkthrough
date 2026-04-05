function getWalkthroughPageScrollTop(target) {
  if (!target) {
    return 0;
  }

  const stickyQuestionCard = document.querySelector(".sticky-question-card");

  if (stickyQuestionCard) {
    const styles = window.getComputedStyle(stickyQuestionCard);

    if (styles.position === "sticky") {
      const stickyTop = parseFloat(styles.top) || 0;
      const stickyGap = 18;

      return Math.max(
        window.scrollY + target.getBoundingClientRect().top
          - (stickyQuestionCard.getBoundingClientRect().height + stickyTop + stickyGap),
        0
      );
    }
  }

  return Math.max(window.scrollY + target.getBoundingClientRect().top - 24, 0);
}

function syncQuestionCardStickyState(questionCard) {
  if (!questionCard) {
    return;
  }

  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const stickyTop = viewportWidth >= 1100 ? 24 : 20;
  const minimumVisibleStepArea = viewportWidth >= 980 ? 260 : 220;
  const questionCardHeight = questionCard.offsetHeight;
  const enableSticky = viewportWidth >= 760
    && questionCardHeight > 0
    && viewportHeight - questionCardHeight - stickyTop >= minimumVisibleStepArea;

  document.documentElement.style.setProperty("--question-sticky-top", stickyTop + "px");
  questionCard.classList.toggle("sticky-question-card-enabled", enableSticky);
}

function setupQuestionCardSticky(questionCard) {
  if (!questionCard) {
    return;
  }

  const updateStickyState = function () {
    syncQuestionCardStickyState(questionCard);
  };

  updateStickyState();
  window.requestAnimationFrame(updateStickyState);

  if (questionCard.dataset.stickySetup === "true") {
    return;
  }

  questionCard.dataset.stickySetup = "true";
  window.addEventListener("resize", updateStickyState);
  window.addEventListener("load", updateStickyState);

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(updateStickyState);
    resizeObserver.observe(questionCard);
    questionCard._stickyResizeObserver = resizeObserver;
  }
}

function ensureTipsCard(questionCard, walkthroughContent) {
  if (!questionCard || !walkthroughContent || !walkthroughContent.parentNode) {
    return null;
  }

  const tipsCard = document.getElementById("tips-card") || document.createElement("section");

  if (!tipsCard.id) {
    tipsCard.id = "tips-card";
  }

  questionCard.classList.add("sticky-question-card");
  tipsCard.classList.add("question-card", "tips-card");
  walkthroughContent.parentNode.insertBefore(tipsCard, walkthroughContent);

  return tipsCard;
}

function moveQuestionSupportToTips(questionCard, tipsCard) {
  if (!questionCard || !tipsCard || questionCard === tipsCard) {
    return;
  }

  const supportNodes = questionCard.querySelectorAll(".attempt-note, .question-note, #show-hints-btn");

  if (!supportNodes.length) {
    return;
  }

  if (!tipsCard.querySelector(".question-label")) {
    const tipsLabel = document.createElement("p");
    tipsLabel.className = "question-label";
    tipsLabel.textContent = "Tips";
    tipsCard.appendChild(tipsLabel);
  }

  supportNodes.forEach(function (node) {
    tipsCard.appendChild(node);
  });
}

function initializeWalkthroughGate(config) {
  const hintsCard = document.getElementById("hints-card");
  const walkthroughContent = document.getElementById("walkthrough-content");
  const initialQuestionCard = document.querySelector(".sticky-question-card")
    || document.getElementById("question-card")
    || document.querySelector(".question-card");
  const tipsCard = ensureTipsCard(initialQuestionCard, walkthroughContent);

  moveQuestionSupportToTips(initialQuestionCard, tipsCard);
  setupQuestionCardSticky(initialQuestionCard);

  const showHintsButton = document.getElementById("show-hints-btn");
  const entryCard = tipsCard || (showHintsButton ? showHintsButton.closest(".question-card") : null);

  if (
    !hintsCard ||
    !showHintsButton ||
    !walkthroughContent ||
    !entryCard ||
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

  function normaliseActionLabel(value) {
    return (value || "").replace(/[←→]/g, "").replace(/\s+/g, " ").trim();
  }

  const answerButtonLabel = config.answerButtonLabel || "Show answer";
  const answerSectionLabel = config.answerSectionLabel || "Answer";
  const walkthroughButtonLabel = config.walkthroughButtonLabel || "Show full walkthrough";

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
    const secondary = secondaryLink
      ? {
        href: secondaryLink.getAttribute("href"),
        label: /back to paper/i.test(secondaryLabel)
          ? secondaryLink.textContent.trim()
          : "← Previous question"
      }
      : (config.previousHref
        ? {
          href: config.previousHref,
          label: config.previousLabel || "← Previous question"
        }
        : (config.backHref
          ? {
            href: config.backHref,
            label: "← Back to paper"
          }
          : null));
    const primary = primaryLink
      ? {
        href: primaryLink.getAttribute("href"),
        label: primaryLink.textContent.trim()
      }
      : {
        href: config.nextHref,
        label: config.nextLabel
      };

    return { secondary: secondary, primary: primary };
  }

  function addEntryActions() {
    if (!entryCard || entryCard.querySelector(".question-entry-actions")) {
      return;
    }

    const entryNavigation = getEntryNavigation();
    const actionRow = document.createElement("div");
    actionRow.className = "gate-actions question-entry-actions";
    actionRow.appendChild(showHintsButton);

    if (entryNavigation.secondary) {
      const secondaryLink = document.createElement("a");
      secondaryLink.className = "nav-btn secondary";
      secondaryLink.href = entryNavigation.secondary.href;
      secondaryLink.textContent = entryNavigation.secondary.label;
      actionRow.appendChild(secondaryLink);
    }

    if (entryNavigation.primary) {
      const primaryLink = document.createElement("a");
      primaryLink.className = "nav-btn";
      primaryLink.href = entryNavigation.primary.href;
      primaryLink.textContent = entryNavigation.primary.label;
      actionRow.appendChild(primaryLink);
    }

    entryCard.appendChild(actionRow);
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
    window.scrollTo({ top: getWalkthroughPageScrollTop(hintsCard), behavior: "smooth" });
  }

  function revealWalkthrough() {
    ensureHintsVisible();
    walkthroughContent.classList.remove("hidden");
    showWalkthroughButton.classList.add("hidden");
    addWalkthroughSkipButtons();
    window.scrollTo({ top: getWalkthroughPageScrollTop(walkthroughContent), behavior: "smooth" });
  }

  function revealAnswer() {
    ensureHintsVisible();
    answerCard.classList.remove("hidden");
    showAnswerButton.classList.add("hidden");
    nextQuestionLink.classList.remove("hidden");
    if (typeof renderMath === "function") {
      renderMath(answerCard);
    }
    window.scrollTo({ top: getWalkthroughPageScrollTop(answerCard), behavior: "smooth" });
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

      window.scrollTo({ top: getWalkthroughPageScrollTop(button), behavior: "smooth" });
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
            top: getWalkthroughPageScrollTop(target),
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
