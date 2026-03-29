function initializeWalkthroughGate(config) {
  const hintsCard = document.getElementById("hints-card");
  const showHintsButton = document.getElementById("show-hints-btn");
  const walkthroughContent = document.getElementById("walkthrough-content");
  const questionCard = showHintsButton ? showHintsButton.closest(".question-card") : null;
  const topBackLink = document.querySelector(".topbar .ghost-link");

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

  function addEntryActions() {
    if (!questionCard || questionCard.querySelector(".question-entry-actions")) {
      return;
    }

    const actionRow = document.createElement("div");
    actionRow.className = "gate-actions question-entry-actions";
    actionRow.appendChild(showHintsButton);

    const entryShowAnswerButton = document.createElement("button");
    entryShowAnswerButton.type = "button";
    entryShowAnswerButton.className = "nav-btn secondary";
    entryShowAnswerButton.textContent = answerButtonLabel;
    actionRow.appendChild(entryShowAnswerButton);

    const nextLabel = normaliseActionLabel(config.nextLabel);
    const nextHref = config.nextHref;

    if (topBackLink) {
      const backHref = topBackLink.getAttribute("href");
      const backLabel = normaliseActionLabel(topBackLink.textContent);
      const sameAsNext = backHref === nextHref && backLabel === nextLabel;

      if (!sameAsNext) {
        const entryBackLink = document.createElement("a");
        entryBackLink.className = "nav-btn secondary";
        entryBackLink.href = backHref;
        entryBackLink.textContent = topBackLink.textContent.trim();
        actionRow.appendChild(entryBackLink);
      }
    }

    const entryNextLink = document.createElement("a");
    entryNextLink.className = "nav-btn";
    entryNextLink.href = nextHref;
    entryNextLink.textContent = config.nextLabel;
    actionRow.appendChild(entryNextLink);

    questionCard.appendChild(actionRow);

    entryShowAnswerButton.addEventListener("click", function () {
      revealAnswer();
    });
  }

  addEntryActions();

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

  function revealAnswer() {
    hintsCard.classList.remove("hidden");
    showHintsButton.classList.add("hidden");
    answerCard.classList.remove("hidden");
    showAnswerButton.classList.add("hidden");
    nextQuestionLink.classList.remove("hidden");
    if (typeof renderMath === "function") {
      renderMath(answerCard);
    }
    window.scrollTo({ top: answerCard.offsetTop - 24, behavior: "smooth" });
  }

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

      window.scrollTo({ top: button.offsetTop - 24, behavior: "smooth" });
    });
  });

  showHintsButton.addEventListener("click", function () {
    hintsCard.classList.remove("hidden");
    showHintsButton.classList.add("hidden");
    window.scrollTo({ top: hintsCard.offsetTop - 24, behavior: "smooth" });
  });

  showWalkthroughButton.addEventListener("click", function () {
    walkthroughContent.classList.remove("hidden");
    showWalkthroughButton.classList.add("hidden");
    addWalkthroughSkipButtons();
    window.scrollTo({ top: walkthroughContent.offsetTop - 24, behavior: "smooth" });
  });

  showAnswerButton.addEventListener("click", function () {
    revealAnswer();
  });
}

(function () {
  const reportIssueHtml = 'Found an error or unclear explanation? Report it <a class="site-footer-link" href="https://docs.google.com/forms/d/e/1FAIpQLSfsQWI9kX3BVpUNJbEqUa9gdKiF1rTvNXT4bL0T3_AYYvLpkA/viewform?usp=publish-editor" target="_blank" rel="noreferrer">here</a>.';

  function normaliseButtonTypes(root) {
    const scope = root || document;
    scope.querySelectorAll("button:not([type])").forEach(function (button) {
      button.type = "button";
    });
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
      ensureReportIssueFooter();
    });
  } else {
    normaliseButtonTypes(document);
    ensureReportIssueFooter();
  }
}());
