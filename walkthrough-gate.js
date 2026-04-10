function getSiteHeader() {
  return document.querySelector(".site-header");
}

const WALKTHROUGH_KATEX_DELIMITERS = [
  { left: "$$", right: "$$", display: true },
  { left: "\\[", right: "\\]", display: true },
  { left: "\\(", right: "\\)", display: false }
];

function ensureWalkthroughMathRenderer() {
  if (typeof window.renderMath === "function") {
    return window.renderMath;
  }

  window.renderMath = function renderMath(element) {
    if (!element || typeof renderMathInElement !== "function") {
      return;
    }

    renderMathInElement(element, { delimiters: WALKTHROUGH_KATEX_DELIMITERS });
  };

  return window.renderMath;
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

function getOrCreateWalkthroughTipsCard(questionCard, walkthroughContent) {
  const existingTipsCard = document.getElementById("tips-card") || document.getElementById("hints-card");

  if (existingTipsCard) {
    existingTipsCard.classList.add("question-card", "tips-card");

    if (
      walkthroughContent
      && walkthroughContent.parentNode
      && existingTipsCard.parentNode === walkthroughContent.parentNode
      && walkthroughContent.previousElementSibling !== existingTipsCard
    ) {
      walkthroughContent.parentNode.insertBefore(existingTipsCard, walkthroughContent);
    }

    return existingTipsCard;
  }

  return ensureTipsCard(questionCard, walkthroughContent);
}

function normaliseRichTextBlock(html, className) {
  const value = String(html || "").trim();

  if (!value) {
    return "";
  }

  if (/<(div|p|section|article|figure|svg|table|ol|ul|li|blockquote|h[1-6]|pre|hr)\b/i.test(value)) {
    return value;
  }

  return `<p class="${className || "step-text"}">${value}</p>`;
}

function getCorrectChoice(step) {
  if (!step || !Array.isArray(step.choices)) {
    return null;
  }

  return step.choices.find(function (choice) {
    return Boolean(choice && choice.correct);
  }) || null;
}

function buildAnswerHighlight(label, html) {
  const content = String(html || "").trim();

  if (!content) {
    return "";
  }

  return `
    <div class="answer-highlight walkthrough-answer-highlight">
      <p class="question-label">${label || "Key result"}</p>
      ${content}
    </div>
  `;
}

function formatGraphCoordinate(value) {
  return Number(Number(value).toFixed(2));
}

function createPlotScale(width, height, padding, xMin, xMax, yMin, yMax) {
  return {
    x: function (value) {
      return formatGraphCoordinate(
        padding + ((value - xMin) / (xMax - xMin)) * (width - padding * 2)
      );
    },
    y: function (value) {
      return formatGraphCoordinate(
        height - padding - ((value - yMin) / (yMax - yMin)) * (height - padding * 2)
      );
    }
  };
}

function plotLineMarkup(scale, x1, y1, x2, y2, className, extra) {
  return `<line class="${className}" x1="${scale.x(x1)}" y1="${scale.y(y1)}" x2="${scale.x(x2)}" y2="${scale.y(y2)}"${extra || ""}></line>`;
}

function plotCircleMarkup(scale, x, y, radius, className, extra) {
  return `<circle class="${className}" cx="${scale.x(x)}" cy="${scale.y(y)}" r="${radius}"${extra || ""}></circle>`;
}

function plotTextMarkup(scale, x, y, text, className, extra) {
  return `<text class="${className}" x="${scale.x(x)}" y="${scale.y(y)}"${extra || ""}>${text}</text>`;
}

function buildLegacyPlotHtml(step) {
  const plot = step && step.plot;

  if (!plot) {
    return "";
  }

  const width = plot.width || 420;
  const height = plot.height || 420;
  const padding = plot.padding || 28;
  const xMin = plot.xMin == null ? -6.5 : plot.xMin;
  const xMax = plot.xMax == null ? 6.5 : plot.xMax;
  const yMin = plot.yMin == null ? -6.5 : plot.yMin;
  const yMax = plot.yMax == null ? 6.5 : plot.yMax;
  const scale = createPlotScale(width, height, padding, xMin, xMax, yMin, yMax);
  const gridLines = [];

  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 1) {
    gridLines.push(plotLineMarkup(scale, x, yMin + 0.5, x, yMax - 0.5, "graph-grid-line"));
  }

  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += 1) {
    gridLines.push(plotLineMarkup(scale, xMin + 0.5, y, xMax - 0.5, y, "graph-grid-line"));
  }

  const fixedPoints = (plot.points || []).map(function (point) {
    const labelX = point.labelX == null ? point.x + 0.22 : point.labelX;
    const labelY = point.labelY == null ? point.y + 0.22 : point.labelY;

    return plotCircleMarkup(scale, point.x, point.y, 5, point.className || "graph-point")
      + plotTextMarkup(scale, labelX, labelY, point.label, "graph-label");
  }).join("");

  const targetLabel = plot.draggableLabel || "z";
  const targetLabelX = plot.targetLabelX == null ? Number(plot.targetX) + 0.22 : plot.targetLabelX;
  const targetLabelY = plot.targetLabelY == null ? Number(plot.targetY) - 0.18 : plot.targetLabelY;

  return `
    <div class="graph-frame question-graph-frame interactive-plot-frame walkthrough-plot-frame">
      <svg class="graph-svg interactive-plot-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${plot.ariaLabel || "Argand diagram"}">
        <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
        ${gridLines.join("")}
        ${plotLineMarkup(scale, xMin + 0.5, 0, xMax - 0.5, 0, "graph-axis")}
        ${plotLineMarkup(scale, 0, yMin + 0.5, 0, yMax - 0.5, "graph-axis")}
        ${plotCircleMarkup(scale, 0, 0, 4.5, "question-origin")}
        ${plotTextMarkup(scale, xMax - 0.55, -0.22, plot.xAxisLabel || "Real", "graph-label")}
        ${plotTextMarkup(scale, -0.18, yMax - 0.2, plot.yAxisLabel || "Imaginary", "graph-label", ' text-anchor="middle"')}
        ${fixedPoints}
        ${plotCircleMarkup(scale, plot.targetX, plot.targetY, 6, "graph-point-draggable")}
        ${plotTextMarkup(scale, targetLabelX, targetLabelY, targetLabel, "graph-label graph-draggable-label")}
      </svg>
      <p class="plot-status">Plotted point: (${plot.targetX}, ${plot.targetY}).</p>
    </div>
  `;
}

// Legacy walkthrough data still stores interactive prompts; convert those prompts into
// reveal-only explanations so every page can use the same guided UI while migrations happen incrementally.
function buildLegacyWorkingHtml(config, step, stepIndex, totalSteps) {
  const parts = [];
  const correctChoice = getCorrectChoice(step);
  const explanationHtml = step.workingHtml
    || step.explanationHtml
    || step.successMessage
    || (correctChoice && correctChoice.successMessage)
    || "";

  if (step.text) {
    parts.push(normaliseRichTextBlock(step.text, "step-text walkthrough-working-intro"));
  }

  if (step.beforeHtml) {
    parts.push(step.beforeHtml);
  }

  if (step.type === "plot") {
    parts.push(buildLegacyPlotHtml(step));
  }

  if (explanationHtml) {
    parts.push(normaliseRichTextBlock(explanationHtml, "step-text"));
  }

  if (step.type === "choice" && correctChoice && correctChoice.html) {
    parts.push(buildAnswerHighlight(step.resultLabel || "Key result", correctChoice.html));
  }

  if (stepIndex === totalSteps - 1 && config.answerHtml) {
    parts.push(config.answerHtml);
  }

  return parts.join("");
}

function normaliseGuidedStep(config, step, stepIndex, totalSteps, stepsAreGuided) {
  const title = step.revealTitle || step.strategyTitle || step.title || "Step " + (stepIndex + 1);
  const previewHtml = stepsAreGuided
    ? (step.previewHtml || step.leadHtml || step.text || "")
    : "";
  const guidedWorkingHtml = [
    step.beforeHtml || "",
    step.workingHtml || step.explanationHtml || ""
  ].join("");
  const workingHtml = stepsAreGuided
    ? (guidedWorkingHtml || buildLegacyWorkingHtml(config, step, stepIndex, totalSteps))
    : buildLegacyWorkingHtml(config, step, stepIndex, totalSteps);

  return {
    title: title,
    previewHtml: previewHtml,
    workingHtml: normaliseRichTextBlock(workingHtml, "step-text")
      || normaliseRichTextBlock(step.text, "step-text"),
    workingButtonLabel: step.workingButtonLabel || "Show working",
    workingShownLabel: step.workingShownLabel || "Working shown"
  };
}

function buildWalkthroughTipItems(config, stepsAreGuided) {
  const items = [];

  if (Array.isArray(config.tips) && config.tips.length) {
    config.tips.forEach(function (tip, index) {
      if (tip && typeof tip === "object" && !Array.isArray(tip)) {
        items.push({
          label: tip.label || "Tip " + (index + 1),
          html: tip.html || tip.text || ""
        });
        return;
      }

      items.push({
        label: "Tip " + (index + 1),
        html: tip
      });
    });
  }

  if (config.focus) {
    items.unshift({
      label: "Focus",
      html: config.focus
    });
  }

  if (Array.isArray(config.questionNotes)) {
    config.questionNotes.forEach(function (note, index) {
      items.push({
        label: "Note " + (index + 1),
        html: note
      });
    });
  }

  if (!items.length && !stepsAreGuided && Array.isArray(config.hints) && config.hints.length) {
    items.push({
      label: "Think first",
      html: config.hints[0]
    });
  }

  return items.filter(function (item) {
    return item && String(item.html || "").trim();
  });
}

function buildTipsCardHtml(config, tipItems) {
  if (!tipItems.length) {
    return "";
  }

  return `
    <p class="question-label">${config.tipsTitle || "Before You Reveal"}</p>
    <p class="step-text">Try the question yourself first, then reveal one idea at a time and open the working only when you need it.</p>
    <div class="walkthrough-tip-list">
      ${tipItems.map(function (item) {
        return `
          <div class="walkthrough-tip-card">
            <p class="walkthrough-tip-label">${item.label}</p>
            <div class="walkthrough-tip-body">
              ${normaliseRichTextBlock(item.html, "step-text")}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function buildQuestionCardHtml(config) {
  return `
    <p class="question-label">Question</p>
    ${config.questionHtml}
  `;
}

function buildProgressiveFinalNavHtml(config) {
  const nav = config.finalNav || {
    secondary: config.backHref
      ? {
        href: config.backHref,
        label: config.backLabel || "← Back to paper"
      }
      : null,
    primary: config.nextHref
      ? {
        href: config.nextHref,
        label: config.nextLabel || "Next question →"
      }
      : null
  };
  const secondaryButton = nav.secondary
    ? `<a class="nav-btn secondary" href="${nav.secondary.href}">${nav.secondary.label}</a>`
    : "";
  const primaryButton = nav.primary
    ? `<a class="nav-btn" href="${nav.primary.href}">${nav.primary.label}</a>`
    : "";

  if (!secondaryButton && !primaryButton) {
    return "";
  }

  return `
    <div id="walkthrough-final-nav" class="nav-row hidden">
      ${secondaryButton}
      ${primaryButton}
    </div>
  `;
}

function renderProgressiveStep(step, index) {
  const stepNumber = index + 1;
  const previewHtml = step.previewHtml
    ? `<div class="walkthrough-step-preview">${normaliseRichTextBlock(step.previewHtml, "step-text")}</div>`
    : "";

  return `
    <section
      id="walkthrough-step-${stepNumber}"
      class="step-card walkthrough-step-card hidden"
      data-step-index="${index}"
    >
      <div class="walkthrough-step-header">
        <p class="step-number">Step ${stepNumber}</p>
        <p class="walkthrough-step-chip">Idea</p>
      </div>
      <h2>${step.title}</h2>
      ${previewHtml}
      <div class="walkthrough-step-actions">
        <button
          class="nav-btn secondary step-working-btn"
          type="button"
          data-working-step="${index}"
          data-shown-label="${step.workingShownLabel}"
          aria-controls="walkthrough-step-${stepNumber}-working"
          aria-expanded="false"
        >
          ${step.workingButtonLabel}
        </button>
      </div>
      <div
        id="walkthrough-step-${stepNumber}-working"
        class="walkthrough-step-working hidden"
      >
        <p class="walkthrough-working-label">Working</p>
        <div class="walkthrough-working-body">
          ${step.workingHtml}
        </div>
      </div>
    </section>
  `;
}

function buildProgressiveWalkthroughHtml(config) {
  return `
    <div class="walkthrough-sequence">
      ${config.guidedSteps.map(function (step, index) {
        return renderProgressiveStep(step, index);
      }).join("")}
    </div>
    <section class="question-card walkthrough-progress-card">
      <p class="question-label">Walkthrough</p>
      <div class="walkthrough-progress-row">
        <div class="walkthrough-progress-copy">
          <p id="walkthrough-progress-status" class="walkthrough-progress-status" aria-live="polite"></p>
          <p class="step-text walkthrough-progress-note">Reveal the strategy first, then show the detailed working only when you want the next layer of help.</p>
        </div>
        <button id="walkthrough-next-btn" class="nav-btn walkthrough-next-btn" type="button"></button>
      </div>
    </section>
    ${buildProgressiveFinalNavHtml(config)}
  `;
}

function normaliseProgressiveWalkthroughConfig(config) {
  const sourceSteps = Array.isArray(config.guidedSteps)
    ? config.guidedSteps
    : Array.isArray(config.walkthroughSteps)
      ? config.walkthroughSteps
      : Array.isArray(config.revealSteps)
        ? config.revealSteps
        : Array.isArray(config.steps)
          ? config.steps
          : [];
  const stepsAreGuided = sourceSteps !== config.steps;
  const guidedSteps = sourceSteps.map(function (step, stepIndex) {
    return normaliseGuidedStep(config, step, stepIndex, sourceSteps.length, stepsAreGuided);
  });

  return Object.assign({}, config, {
    guidedSteps: guidedSteps,
    tips: buildWalkthroughTipItems(config, stepsAreGuided)
  });
}

function attachProgressiveWalkthroughHandlers(config, walkthroughContent) {
  const stepCards = Array.from(walkthroughContent.querySelectorAll(".walkthrough-step-card"));
  const revealButton = document.getElementById("walkthrough-next-btn");
  const progressStatus = document.getElementById("walkthrough-progress-status");
  const finalNav = document.getElementById("walkthrough-final-nav");
  let revealedCount = 0;

  function updateProgressUi() {
    if (!revealButton || !progressStatus) {
      return;
    }

    const totalSteps = stepCards.length;
    const stepLabel = totalSteps === 1 ? "step" : "steps";
    progressStatus.textContent = revealedCount + " of " + totalSteps + " " + stepLabel + " revealed";

    if (!totalSteps) {
      revealButton.textContent = "No steps available";
      revealButton.disabled = true;
      return;
    }

    if (revealedCount === 0) {
      revealButton.textContent = config.startRevealLabel || "Reveal first step";
      revealButton.disabled = false;
      if (finalNav) {
        finalNav.classList.add("hidden");
      }
      return;
    }

    if (revealedCount < totalSteps) {
      revealButton.textContent = config.nextRevealLabel || "Reveal next step";
      revealButton.disabled = false;
      if (finalNav) {
        finalNav.classList.add("hidden");
      }
      return;
    }

    revealButton.textContent = config.allStepsShownLabel || "All steps revealed";
    revealButton.disabled = true;

    if (finalNav) {
      finalNav.classList.remove("hidden");
    }
  }

  function revealStep(stepCard) {
    if (!stepCard || !stepCard.classList.contains("hidden")) {
      return;
    }

    stepCard.classList.remove("hidden");
    stepCard.classList.add("is-revealed");

    window.requestAnimationFrame(function () {
      window.scrollTo({
        top: getWalkthroughPageScrollTop(stepCard),
        behavior: "smooth"
      });
    });
  }

  if (revealButton) {
    revealButton.addEventListener("click", function () {
      if (revealedCount >= stepCards.length) {
        return;
      }

      revealStep(stepCards[revealedCount]);
      revealedCount += 1;
      updateProgressUi();
    });
  }

  walkthroughContent.querySelectorAll(".step-working-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      const stepIndex = Number(button.dataset.workingStep);
      const stepCard = stepCards[stepIndex];
      const workingPanel = document.getElementById("walkthrough-step-" + (stepIndex + 1) + "-working");

      if (!stepCard || !workingPanel || !workingPanel.classList.contains("hidden")) {
        return;
      }

      workingPanel.classList.remove("hidden");
      workingPanel.classList.add("is-visible");
      stepCard.dataset.workingVisible = "true";
      button.disabled = true;
      button.textContent = button.dataset.shownLabel || "Working shown";
      button.setAttribute("aria-expanded", "true");

      window.requestAnimationFrame(function () {
        window.scrollTo({
          top: getWalkthroughPageScrollTop(stepCard),
          behavior: "smooth"
        });
      });
    });
  });

  updateProgressUi();
}

function initializeProgressiveWalkthrough(config, options) {
  if (!config) {
    return;
  }

  ensureSiteHeader();
  ensureWalkthroughMathRenderer();

  const pageOptions = options || {};
  const normalisedConfig = normaliseProgressiveWalkthroughConfig(config);
  const eyebrow = document.getElementById("page-eyebrow");
  const pageTitle = document.getElementById("page-title");
  const subtitle = document.getElementById("page-subtitle");
  const backLink = document.getElementById("back-link");
  const questionCard = document.getElementById("question-card");
  const walkthroughContent = document.getElementById("walkthrough-content");
  const tipsCard = getOrCreateWalkthroughTipsCard(questionCard, walkthroughContent);

  if (!eyebrow || !pageTitle || !subtitle || !backLink || !questionCard || !walkthroughContent || !tipsCard) {
    return;
  }

  document.title = normalisedConfig.browserTitle || document.title;
  eyebrow.textContent = normalisedConfig.eyebrow || pageOptions.defaultEyebrow || eyebrow.textContent;
  pageTitle.textContent = normalisedConfig.title || pageTitle.textContent;
  subtitle.textContent = normalisedConfig.subtitle || subtitle.textContent;
  backLink.href = normalisedConfig.backHref || backLink.href;

  questionCard.classList.add("sticky-question-card");
  questionCard.innerHTML = buildQuestionCardHtml(normalisedConfig);

  if (normalisedConfig.tips.length) {
    tipsCard.innerHTML = buildTipsCardHtml(normalisedConfig, normalisedConfig.tips);
    tipsCard.classList.remove("hidden");
  } else {
    tipsCard.innerHTML = "";
    tipsCard.classList.add("hidden");
  }

  walkthroughContent.innerHTML = buildProgressiveWalkthroughHtml(normalisedConfig);
  walkthroughContent.classList.remove("hidden");

  setupQuestionCardSticky(questionCard);

  if (typeof normalisedConfig.afterRender === "function") {
    normalisedConfig.afterRender();
  }

  window.renderMath(document.body);
  attachProgressiveWalkthroughHandlers(normalisedConfig, walkthroughContent);
}

window.initializeProgressiveWalkthrough = initializeProgressiveWalkthrough;

(function () {
  const reportIssueHtml = 'Found an error or unclear explanation? Report it <a class="site-footer-link" href="https://docs.google.com/forms/d/e/1FAIpQLSfsQWI9kX3BVpUNJbEqUa9gdKiF1rTvNXT4bL0T3_AYYvLpkA/viewform?usp=publish-editor" target="_blank" rel="noreferrer">here</a>.';
  const INTERACTION_SELECTOR = ".option-btn, .check-btn, .next-step-btn, .walkthrough-next-btn, .step-working-btn";

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
