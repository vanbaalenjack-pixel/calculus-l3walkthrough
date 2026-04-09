function getSiteHeader() {
  return document.querySelector(".site-header");
}

function getSiteHeaderHeight() {
  const siteHeader = getSiteHeader();

  if (siteHeader) {
    return Math.ceil(siteHeader.getBoundingClientRect().height || siteHeader.offsetHeight || 0);
  }

  const rootStyles = window.getComputedStyle(document.documentElement);
  return parseFloat(rootStyles.getPropertyValue("--site-header-height")) || 0;
}

function getSiteScrollOffset(extraOffset) {
  const baseOffset = Number.isFinite(extraOffset) ? extraOffset : 24;
  return getSiteHeaderHeight() + baseOffset;
}

function syncSiteHeaderMetrics(siteHeader) {
  const header = siteHeader || getSiteHeader();
  const headerHeight = header
    ? Math.ceil(header.getBoundingClientRect().height || header.offsetHeight || 0)
    : 0;

  document.documentElement.style.setProperty("--site-header-height", headerHeight + "px");
  document.documentElement.style.setProperty("--site-scroll-offset", headerHeight + 24 + "px");
}

function ensureSiteHeader() {
  const body = document.body;

  if (!body) {
    return null;
  }

  let siteHeader = getSiteHeader();

  if (!siteHeader) {
    siteHeader = document.createElement("header");
    siteHeader.className = "site-header";

    const headerInner = document.createElement("nav");
    headerInner.className = "site-header-inner";
    headerInner.setAttribute("aria-label", "Site");

    const brandLink = document.createElement("a");
    brandLink.className = "site-brand";
    brandLink.href = "index.html";
    brandLink.textContent = "calc.nz";

    headerInner.appendChild(brandLink);
    siteHeader.appendChild(headerInner);

    const main = document.querySelector("main");

    if (main && main.parentNode === body) {
      body.insertBefore(siteHeader, main);
    } else {
      body.insertBefore(siteHeader, body.firstChild);
    }
  }

  body.classList.add("has-site-header");
  syncSiteHeaderMetrics(siteHeader);

  if (siteHeader.dataset.metricsSetup === "true") {
    return siteHeader;
  }

  siteHeader.dataset.metricsSetup = "true";

  const updateSiteHeaderMetrics = function () {
    syncSiteHeaderMetrics(siteHeader);

    const stickyQuestionCard = document.querySelector(".sticky-question-card");
    if (stickyQuestionCard) {
      syncQuestionCardStickyState(stickyQuestionCard);
    }
  };

  window.addEventListener("resize", updateSiteHeaderMetrics);
  window.addEventListener("load", updateSiteHeaderMetrics);
  window.addEventListener("pageshow", updateSiteHeaderMetrics);

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(updateSiteHeaderMetrics);
    resizeObserver.observe(siteHeader);
    siteHeader._headerResizeObserver = resizeObserver;
  }

  window.requestAnimationFrame(updateSiteHeaderMetrics);

  return siteHeader;
}

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

  return Math.max(
    window.scrollY + target.getBoundingClientRect().top - getSiteScrollOffset(24),
    0
  );
}

function syncQuestionCardStickyState(questionCard) {
  if (!questionCard) {
    return;
  }

  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const headerHeight = getSiteHeaderHeight();
  const hasFinePointer = typeof window.matchMedia !== "function"
    || window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const graphCount = questionCard.querySelectorAll(".graph-frame").length;
  const imageCount = questionCard.querySelectorAll("img").length;
  const containsVisual = graphCount > 0 || imageCount > 0;
  const hasMultipleVisuals = graphCount > 1 || imageCount > 1;
  const stickyGap = viewportWidth >= 1380 ? 28 : viewportWidth >= 1100 ? 24 : 20;
  const stickyClearance = headerHeight + stickyGap;
  const minimumVisibleStepArea = viewportWidth >= 1280 ? 320 : 280;
  const questionCardHeight = Math.ceil(questionCard.getBoundingClientRect().height || questionCard.offsetHeight || 0);
  const maxStickyHeight = containsVisual
    ? Math.min(viewportHeight * 0.42, 380)
    : Math.min(viewportHeight * 0.48, 460);
  const enableSticky = hasFinePointer
    && viewportWidth >= 1120
    && questionCardHeight > 0
    && !hasMultipleVisuals
    && questionCardHeight <= maxStickyHeight
    && viewportHeight - questionCardHeight - stickyClearance >= minimumVisibleStepArea;

  document.documentElement.style.setProperty("--question-sticky-top", stickyGap + "px");
  questionCard.classList.toggle("question-card-with-visual", containsVisual);
  questionCard.classList.toggle("question-card-multi-visual", hasMultipleVisuals);
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
  window.addEventListener("pageshow", updateStickyState);

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

function ensureControlsSection(tipsCard, walkthroughContent) {
  if (!walkthroughContent || !walkthroughContent.parentNode) {
    return null;
  }

  const controlsSection = document.getElementById("question-controls") || document.createElement("nav");

  if (!controlsSection.id) {
    controlsSection.id = "question-controls";
  }

  controlsSection.classList.add("question-controls");
  controlsSection.setAttribute("aria-label", "Page controls");

  const insertionPoint = tipsCard || walkthroughContent;

  if (insertionPoint.nextElementSibling !== controlsSection) {
    walkthroughContent.parentNode.insertBefore(controlsSection, walkthroughContent);
  }

  return controlsSection;
}

function moveQuestionSupportToTips(questionCard, tipsCard) {
  if (!questionCard || !tipsCard || questionCard === tipsCard) {
    return;
  }

  const supportNodes = questionCard.querySelectorAll(".attempt-note, .question-note");

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
  ensureSiteHeader();

  const hintsCard = document.getElementById("hints-card");
  const walkthroughContent = document.getElementById("walkthrough-content");
  const initialQuestionCard = document.querySelector(".sticky-question-card")
    || document.getElementById("question-card")
    || document.querySelector(".question-card");
  const tipsCard = ensureTipsCard(initialQuestionCard, walkthroughContent);
  const controlsSection = ensureControlsSection(tipsCard, walkthroughContent);

  moveQuestionSupportToTips(initialQuestionCard, tipsCard);
  setupQuestionCardSticky(initialQuestionCard);

  let showHintsButton = document.getElementById("show-hints-btn");
  const pageBackLink = document.getElementById("back-link");

  if (
    !hintsCard ||
    !walkthroughContent ||
    !controlsSection ||
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

  if (!showHintsButton) {
    showHintsButton = createShowHintsButton();
  }

  showHintsButton.classList.remove("hidden");

  function normaliseActionLabel(value) {
    return (value || "").replace(/[←→]/g, "").replace(/\s+/g, " ").trim();
  }

  const answerButtonLabel = config.answerButtonLabel || "Show answer";
  const answerSectionLabel = config.answerSectionLabel || "Answer";
  const walkthroughButtonLabel = config.walkthroughButtonLabel || "Show full walkthrough";

  function getEntryNavigation() {
    const secondary = config.backHref
      ? {
        href: config.backHref,
        label: config.backLabel || "← Back to paper"
      }
      : null;
    const nextLabel = normaliseActionLabel(config.nextLabel);
    const primary = config.nextHref
      && config.nextLabel
      && (
        /next question/i.test(nextLabel)
        || config.nextHref !== config.backHref
      )
      ? {
        href: config.nextHref,
        label: config.nextLabel
      }
      : null;

    return { secondary: secondary, primary: primary };
  }

  function createShowHintsButton() {
    const button = document.createElement("button");
    button.id = "show-hints-btn";
    button.className = "nav-btn secondary";
    button.type = "button";
    button.textContent = "Show hints";
    return button;
  }

  function addEntryActions() {
    if (!controlsSection || controlsSection.querySelector(".question-entry-actions")) {
      return;
    }

    if (!showHintsButton) {
      showHintsButton = createShowHintsButton();
    }

    const entryNavigation = getEntryNavigation();
    const actionRow = document.createElement("div");
    actionRow.className = "gate-actions question-entry-actions";

    showHintsButton.classList.add("secondary");
    showHintsButton.classList.remove("hidden");
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

    controlsSection.appendChild(actionRow);

    if (pageBackLink) {
      pageBackLink.classList.add("hidden");
    }
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
      ensureSiteHeader();
      normaliseButtonTypes(document);
      stabiliseInteractiveScroll(document);
      ensureReportIssueFooter();
    });
  } else {
    ensureSiteHeader();
    normaliseButtonTypes(document);
    stabiliseInteractiveScroll(document);
    ensureReportIssueFooter();
  }
}());
