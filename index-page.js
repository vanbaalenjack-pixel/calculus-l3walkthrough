document.addEventListener("DOMContentLoaded", function () {
  const reportIssueHtml = 'Found an error or unclear explanation? Report it <a class="site-footer-link" href="https://docs.google.com/forms/d/e/1FAIpQLSfsQWI9kX3BVpUNJbEqUa9gdKiF1rTvNXT4bL0T3_AYYvLpkA/viewform?usp=publish-editor" target="_blank" rel="noopener noreferrer">here</a>.';

  if (typeof ensureSiteHeader === "function") {
    ensureSiteHeader();
  }

  document.querySelectorAll("button:not([type])").forEach(function (button) {
    button.type = "button";
  });

  function ensureHomepageReportFooter() {
    const footer = document.querySelector(".site-footer");
    if (!footer || footer.querySelector(".report-issue-text")) {
      return;
    }

    const reportParagraph = document.createElement("p");
    reportParagraph.className = "site-footer-text report-issue-text";
    reportParagraph.innerHTML = reportIssueHtml;
    footer.appendChild(reportParagraph);
  }

  if (typeof renderMathInElement === "function") {
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\(", right: "\\)", display: false }
      ]
    });
  }

  const levelButtons = Array.from(document.querySelectorAll("[data-level]"));
  const levelPanels = Array.from(document.querySelectorAll("[data-level-panel]"));
  const standardButtons = Array.from(document.querySelectorAll("[data-standard]"));
  const standardPanels = Array.from(document.querySelectorAll("[data-standard-panel]"));
  const paperButtons = Array.from(document.querySelectorAll("[data-paper]"));
  const paperPanels = Array.from(document.querySelectorAll("[data-paper-panel]"));
  const levelChooser = document.getElementById("choose-level");
  const revealLevelPickerButton = document.querySelector("[data-reveal-level-picker]");
  const flowNavigation = document.getElementById("selection-flow-nav");
  const backButton = document.querySelector("[data-selection-back]");
  const backButtonLabel = document.querySelector("[data-selection-back-label]");
  const breadcrumb = document.querySelector("[data-selection-breadcrumb]");
  const selectionStatus = document.querySelector("[data-selection-status]");
  let activeSelection = { level: null, standard: null, paper: null, paperView: null };
  const homepageStorageKeys = {
    progress: window.CalcNzWalkthrough && window.CalcNzWalkthrough.progressStorageKey
      ? window.CalcNzWalkthrough.progressStorageKey
      : "calc.nz.walkthroughProgress",
    lastVisited: window.CalcNzWalkthrough && window.CalcNzWalkthrough.lastVisitedStorageKey
      ? window.CalcNzWalkthrough.lastVisitedStorageKey
      : "calc.nz.lastWalkthrough"
  };

  if (!levelChooser || !levelButtons.length || !levelPanels.length) {
    ensureHomepageReportFooter();
    return;
  }

  function getLevelPanel(level) {
    return levelPanels.find(function (panel) {
      return panel.dataset.levelPanel === level;
    }) || null;
  }

  function getStandardPanel(standard) {
    return standardPanels.find(function (panel) {
      return panel.dataset.standardPanel === standard;
    }) || null;
  }

  function getPaperPanel(paper) {
    return paperPanels.find(function (panel) {
      return panel.dataset.paperPanel === paper;
    }) || null;
  }

  function getChoiceButton(type, value) {
    const buttons = type === "level"
      ? levelButtons
      : type === "standard"
        ? standardButtons
        : paperButtons;

    return buttons.find(function (button) {
      return button.dataset[type] === value;
    }) || null;
  }

  function getChoiceLabel(type, value) {
    const button = getChoiceButton(type, value);
    const title = button ? button.querySelector(".year-option-title") : null;
    return title ? title.textContent.trim() : value;
  }

  function getPaperYear(paper) {
    const yearMatch = paper ? paper.match(/(\d{4})$/) : null;
    if (yearMatch) {
      return yearMatch[1];
    }

    return getChoiceLabel("paper", paper).replace(/\s+Paper$/i, "");
  }

  function escapeHomeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function readHomepageJsonStorage(key, fallbackValue) {
    try {
      const storedValue = window.localStorage.getItem(key);
      const parsedValue = storedValue ? JSON.parse(storedValue) : fallbackValue;

      return parsedValue && typeof parsedValue === "object" && !Array.isArray(parsedValue)
        ? parsedValue
        : fallbackValue;
    } catch (error) {
      return fallbackValue;
    }
  }

  function readHomepageProgressMap() {
    if (window.CalcNzWalkthrough && typeof window.CalcNzWalkthrough.readProgressMap === "function") {
      return window.CalcNzWalkthrough.readProgressMap();
    }

    return readHomepageJsonStorage(homepageStorageKeys.progress, {});
  }

  function readHomepageLastWalkthrough() {
    if (window.CalcNzWalkthrough && typeof window.CalcNzWalkthrough.readLastWalkthrough === "function") {
      return window.CalcNzWalkthrough.readLastWalkthrough();
    }

    return readHomepageJsonStorage(homepageStorageKeys.lastVisited, null);
  }

  function getPaperPartLinks(paper) {
    const panel = getPaperPanel(paper);

    return panel ? Array.from(panel.querySelectorAll("a.index-link-card[href]")) : [];
  }

  function getPaperProgress(paper) {
    if (window.CalcNzWalkthrough && typeof window.CalcNzWalkthrough.getPaperProgressById === "function") {
      const sharedProgress = window.CalcNzWalkthrough.getPaperProgressById(paper);
      const total = sharedProgress.total || getPaperPartLinks(paper).length;

      return Object.assign({}, sharedProgress, { total: total });
    }

    const links = getPaperPartLinks(paper);
    const progressMap = readHomepageProgressMap();
    let visited = 0;
    let completed = 0;

    links.forEach(function (link) {
      const title = link.querySelector(".index-link-title");
      const partMatch = (title ? title.textContent : link.textContent).match(/Question\s+([123])\(([a-e])\)/i);
      const partId = partMatch ? partMatch[1] + partMatch[2].toLowerCase() : "";
      const state = progressMap[paper + ":" + partId] || {};

      if (state.visited) {
        visited += 1;
      }
      if (state.completed) {
        completed += 1;
      }
    });

    return {
      visited: visited,
      completed: completed,
      total: links.length
    };
  }

  function getPaperProgressText(progress) {
    const state = progress || {};

    return (state.completed || 0) + " of " + (state.total || 0) + " completed";
  }

  function getPaperContext(paper) {
    const panel = getPaperPanel(paper);
    const standard = panel ? panel.dataset.parentStandard : null;
    const standardPanel = standard ? getStandardPanel(standard) : null;
    const level = standardPanel ? standardPanel.dataset.parentLevel : null;

    return {
      level: level,
      standard: standard,
      levelLabel: level ? getChoiceLabel("level", level) : "",
      standardLabel: standard ? getChoiceLabel("standard", standard) : "",
      year: getPaperYear(paper)
    };
  }

  function makeSelection(level, standard, paper, paperView) {
    return {
      level: level || null,
      standard: standard || null,
      paper: paper || null,
      paperView: paper ? (paperView === "questions" ? "questions" : "entry") : null
    };
  }

  function normaliseSelection(selection) {
    let level = selection && selection.level;
    let standard = selection && selection.standard;
    let paper = selection && selection.paper;
    let paperView = selection && selection.paperView;
    let standardPanel = standard ? getStandardPanel(standard) : null;
    const paperPanel = paper ? getPaperPanel(paper) : null;

    if (paperPanel) {
      standard = paperPanel.dataset.parentStandard;
      standardPanel = getStandardPanel(standard);
    } else {
      paper = null;
      paperView = null;
    }

    if (standardPanel) {
      level = standardPanel.dataset.parentLevel;
    } else {
      standard = null;
      paper = null;
      paperView = null;
    }

    if (!getLevelPanel(level)) {
      return makeSelection();
    }

    return makeSelection(level, standard, paper, paperView);
  }

  function selectionsMatch(first, second) {
    return first.level === second.level &&
      first.standard === second.standard &&
      first.paper === second.paper &&
      first.paperView === second.paperView;
  }

  function getSelectionHash(selection) {
    if (selection.paper && selection.paperView === "questions") {
      return selection.paper + "-questions";
    }

    return selection.paper || selection.standard || selection.level || "choose-level";
  }

  function getSelectionForHash(hash) {
    if (!hash || hash === "choose-level") {
      return makeSelection();
    }

    const questionPickerMatch = hash.match(/^(.*)-questions$/);
    const questionPickerPaper = questionPickerMatch ? questionPickerMatch[1] : null;
    if (questionPickerPaper && getPaperPanel(questionPickerPaper)) {
      return normaliseSelection({ paper: questionPickerPaper, paperView: "questions" });
    }

    const paperPanel = getPaperPanel(hash);
    if (paperPanel) {
      return normaliseSelection({ paper: hash });
    }

    const standardPanel = getStandardPanel(hash);
    if (standardPanel) {
      return normaliseSelection({ standard: hash });
    }

    if (getLevelPanel(hash)) {
      return makeSelection(hash);
    }

    const legacyDifferentiationMatch = hash.match(/^level-3-(202[0-5])$/);
    if (legacyDifferentiationMatch) {
      return normaliseSelection({ paper: "level-3-differentiation-" + legacyDifferentiationMatch[1] });
    }

    if (hash === "level-2-2025") {
      return normaliseSelection({ paper: "level-2-calculus-2025" });
    }

    return null;
  }

  function setButtonState(button, isActive) {
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  }

  function setPanelState(panel, isActive) {
    panel.hidden = !isActive;
    panel.classList.toggle("hidden", !isActive);
    panel.setAttribute("aria-hidden", isActive ? "false" : "true");
  }

  function getDirectHeading(container) {
    return Array.from(container.children).find(function (child) {
      return /^H[1-6]$/.test(child.tagName);
    }) || null;
  }

  function addGuidedModeToHref(href) {
    if (!href) {
      return "";
    }

    const url = new URL(href, window.location.href);
    url.searchParams.set("mode", "guided");
    return url.pathname + url.search + url.hash;
  }

  function setupPaperEntryChoices() {
    paperPanels.forEach(function (panel) {
      if (panel.querySelector(".paper-entry-choice")) {
        return;
      }

      const standard = panel.dataset.parentStandard;
      const paper = panel.dataset.paperPanel;
      const standardPanel = getStandardPanel(standard);
      const level = standardPanel ? standardPanel.dataset.parentLevel : null;
      const existingChildren = Array.from(panel.children);
      const firstQuestionLink = panel.querySelector("a.index-link-card");
      const entry = document.createElement("div");
      const questionPicker = document.createElement("div");
      const header = document.createElement("div");
      const label = document.createElement("p");
      const heading = document.createElement("h2");

      entry.className = "paper-entry-choice";
      entry.innerHTML = `
        <p class="question-label">${getChoiceLabel("standard", standard)} · ${getPaperYear(paper)} paper</p>
        <h2>Where would you like to start?</h2>
        <p class="paper-progress-chip" data-paper-progress="${paper}">${getPaperProgressText(getPaperProgress(paper))}</p>
        <p class="step-text paper-entry-intro">Choose a guided lesson from Question 1(a), or jump straight to the question you need.</p>
        <div class="year-picker-grid paper-entry-grid">
          <a class="nav-btn secondary year-option paper-entry-option" data-paper-start-guided href="${addGuidedModeToHref(firstQuestionLink ? firstQuestionLink.getAttribute("href") : "")}">
            <span class="year-option-title">From the start</span>
            <span class="year-option-copy">Begin at Question 1(a) and work through the paper as a guided lesson.</span>
          </a>
          <button class="nav-btn secondary year-option paper-entry-option" data-paper-start-specific type="button">
            <span class="year-option-title">A specific question</span>
            <span class="year-option-copy">Open the question menu and jump directly to the part you want to revise.</span>
          </button>
        </div>
      `;

      questionPicker.className = "paper-question-picker hidden";
      header.className = "paper-stage-header";
      label.className = "question-label";
      label.textContent = getChoiceLabel("standard", standard) + " · " + getPaperYear(paper) + " paper";
      heading.textContent = "Choose a question";
      header.appendChild(label);
      header.appendChild(heading);
      questionPicker.appendChild(header);
      existingChildren.forEach(function (child) {
        questionPicker.appendChild(child);
      });

      const specificQuestionButton = entry.querySelector("[data-paper-start-specific]");
      specificQuestionButton.addEventListener("click", function () {
        navigateToSelection(makeSelection(level, standard, paper, "questions"));
      });

      panel.appendChild(entry);
      panel.appendChild(questionPicker);
    });
  }

  function updatePaperProgressSummaries() {
    document.querySelectorAll("[data-paper-progress]").forEach(function (summary) {
      const paper = summary.dataset.paperProgress;
      summary.textContent = getPaperProgressText(getPaperProgress(paper));
    });
  }

  function updateHomepageContinueCard() {
    const card = document.getElementById("homepage-continue-card");
    const record = readHomepageLastWalkthrough();

    if (!card) {
      return;
    }

    if (!record || !record.href || !record.paperId || !getPaperPanel(record.paperId)) {
      card.hidden = true;
      return;
    }

    const context = getPaperContext(record.paperId);
    const questionLabel = record.questionLabel || "Question " + (record.partId || "").charAt(0) + "(" + (record.partId || "").charAt(1) + ")";
    const title = "Continue " + context.year + " " + context.standardLabel + " · " + questionLabel;

    card.hidden = false;
    card.innerHTML = `
      <div class="home-continue-copy">
        <p class="question-label">Continue where you left off</p>
        <h2>${escapeHomeHtml(title)}</h2>
        <p class="step-text">Pick up from your most recent walkthrough.</p>
      </div>
      <a class="nav-btn home-continue-button" href="${escapeHomeHtml(record.href)}">Continue</a>
    `;
  }

  function setupHomepageContinueCard() {
    if (document.getElementById("homepage-continue-card") || !levelChooser.parentNode) {
      updateHomepageContinueCard();
      return;
    }

    const card = document.createElement("section");
    card.id = "homepage-continue-card";
    card.className = "question-card home-continue-card";
    card.hidden = true;
    levelChooser.parentNode.insertBefore(card, levelChooser);
    updateHomepageContinueCard();
  }

  function normaliseSearchText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function buildWalkthroughSearchIndex() {
    const results = [];

    paperPanels.forEach(function (panel) {
      const paper = panel.dataset.paperPanel;
      const context = getPaperContext(paper);

      getPaperPartLinks(paper).forEach(function (link) {
        const title = link.querySelector(".index-link-title");
        const copy = link.querySelector(".index-link-copy");
        const titleText = title ? title.textContent.trim() : link.textContent.trim();
        const copyText = copy ? copy.textContent.trim() : "";
        const contextText = [
          context.levelLabel,
          context.standardLabel,
          context.year,
          context.year + " " + context.standardLabel,
          paper
        ].join(" ");

        results.push({
          href: link.getAttribute("href"),
          title: titleText,
          copy: copyText,
          levelLabel: context.levelLabel,
          standardLabel: context.standardLabel,
          year: context.year,
          haystack: normaliseSearchText([titleText, copyText, contextText].join(" "))
        });
      });
    });

    return results;
  }

  function scoreSearchResult(entry, tokens, query) {
    let score = 0;
    const title = normaliseSearchText(entry.title);
    const copy = normaliseSearchText(entry.copy);
    const standard = normaliseSearchText(entry.standardLabel);

    tokens.forEach(function (token) {
      if (title.indexOf(token) >= 0) {
        score += 6;
      }
      if (standard.indexOf(token) >= 0) {
        score += 5;
      }
      if (String(entry.year) === token) {
        score += 5;
      }
      if (copy.indexOf(token) >= 0) {
        score += 3;
      }
    });

    if (entry.haystack.indexOf(query) >= 0) {
      score += 4;
    }

    return score;
  }

  function setupWalkthroughSearch() {
    if (document.getElementById("walkthrough-site-search") || !levelChooser.parentNode) {
      return;
    }

    const searchIndex = buildWalkthroughSearchIndex();
    const searchSection = document.createElement("section");
    searchSection.id = "walkthrough-site-search";
    searchSection.className = "question-card home-search-card";
    searchSection.innerHTML = `
      <div class="home-search-heading">
        <p class="question-label">Find a walkthrough</p>
        <h2>Search by topic, year, or standard</h2>
      </div>
      <form class="home-search-form" role="search">
        <label class="visually-hidden" for="walkthrough-search-input">Search walkthroughs</label>
        <input id="walkthrough-search-input" class="home-search-input" type="search" autocomplete="off" placeholder="Try chain rule, cylinder, integration 2020" />
      </form>
      <div class="home-search-results" data-search-results hidden aria-live="polite"></div>
    `;

    levelChooser.parentNode.insertBefore(searchSection, levelChooser);

    const input = searchSection.querySelector("#walkthrough-search-input");
    const resultsContainer = searchSection.querySelector("[data-search-results]");

    function renderSearchResults() {
      const rawQuery = input.value || "";
      const query = normaliseSearchText(rawQuery);
      const tokens = query ? query.split(" ").filter(Boolean) : [];

      if (!tokens.length) {
        resultsContainer.hidden = true;
        resultsContainer.innerHTML = "";
        return;
      }

      const matches = searchIndex
        .filter(function (entry) {
          return tokens.every(function (token) {
            return entry.haystack.indexOf(token) >= 0;
          });
        })
        .map(function (entry) {
          return Object.assign({ score: scoreSearchResult(entry, tokens, query) }, entry);
        })
        .sort(function (first, second) {
          return second.score - first.score || second.year.localeCompare(first.year) || first.title.localeCompare(second.title);
        })
        .slice(0, 10);

      resultsContainer.hidden = false;

      if (!matches.length) {
        resultsContainer.innerHTML = '<p class="home-search-empty">No matching walkthroughs found.</p>';
        return;
      }

      resultsContainer.innerHTML = `
        <div class="home-search-result-list" role="list">
          ${matches.map(function (entry) {
            return `
              <a class="home-search-result" href="${escapeHomeHtml(entry.href)}" role="listitem">
                <span class="home-search-result-meta">${escapeHomeHtml(entry.year)} · ${escapeHomeHtml(entry.standardLabel)}</span>
                <span class="home-search-result-title">${escapeHomeHtml(entry.title)}</span>
                <span class="home-search-result-copy">${escapeHomeHtml(entry.copy)}</span>
              </a>
            `;
          }).join("")}
        </div>
      `;
    }

    searchSection.querySelector(".home-search-form").addEventListener("submit", function (event) {
      event.preventDefault();
      const firstResult = resultsContainer.querySelector("a.home-search-result");
      if (firstResult) {
        window.location.href = firstResult.href;
      }
    });

    input.addEventListener("input", renderSearchResults);
  }

  function setHeadingFocusTarget(heading) {
    if (heading && !heading.hasAttribute("tabindex")) {
      heading.setAttribute("tabindex", "-1");
    }
    return heading;
  }

  function getCurrentStage(selection) {
    if (selection.paper) {
      const paperPanel = getPaperPanel(selection.paper);
      const paperStage = paperPanel
        ? paperPanel.querySelector(selection.paperView === "questions" ? ".paper-question-picker" : ".paper-entry-choice")
        : null;
      return {
        element: paperStage || paperPanel,
        heading: paperStage ? paperStage.querySelector("h2") : null
      };
    }

    if (selection.standard) {
      const standardPanel = getStandardPanel(selection.standard);
      return {
        element: standardPanel,
        heading: standardPanel ? getDirectHeading(standardPanel) : null
      };
    }

    if (selection.level) {
      const levelPanel = getLevelPanel(selection.level);
      return {
        element: levelPanel,
        heading: levelPanel ? getDirectHeading(levelPanel) : null
      };
    }

    return {
      element: levelChooser,
      heading: getDirectHeading(levelChooser)
    };
  }

  function getPageScrollTop(target) {
    if (!target) {
      return 0;
    }

    const helperOffset = typeof getSiteScrollOffset === "function"
      ? getSiteScrollOffset(20)
      : 20;
    const siteHeader = document.querySelector(".site-header");
    const measuredHeaderOffset = siteHeader
      ? Math.ceil(siteHeader.getBoundingClientRect().height || siteHeader.offsetHeight || 0) + 20
      : 20;
    const scrollOffset = Math.max(helperOffset, measuredHeaderOffset);

    return Math.max(window.scrollY + target.getBoundingClientRect().top - scrollOffset, 0);
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function moveToSelection(selection, behavior) {
    const target = selection.level && flowNavigation ? flowNavigation : levelChooser;
    const scrollBehavior = prefersReducedMotion() ? "auto" : behavior;

    window.setTimeout(function () {
      const scrollTop = getPageScrollTop(target);
      if (scrollBehavior === "auto") {
        const root = document.documentElement;
        const previousInlineBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        void root.offsetHeight;
        window.scrollTo(0, scrollTop);
        window.setTimeout(function () {
          root.style.scrollBehavior = previousInlineBehavior;
        }, 0);
        return;
      }

      window.scrollTo({ top: scrollTop, behavior: scrollBehavior });
    }, 0);
  }

  function focusCurrentStage(selection) {
    const stage = getCurrentStage(selection);
    const heading = setHeadingFocusTarget(stage.heading);
    if (!heading) {
      return;
    }

    window.setTimeout(function () {
      if (typeof focusWithoutPageScroll === "function") {
        focusWithoutPageScroll(heading);
        return;
      }

      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      try {
        heading.focus({ preventScroll: true });
      } catch (error) {
        heading.focus();
        window.scrollTo(scrollX, scrollY);
      }
    }, 0);
  }

  function getParentSelection(selection) {
    if (selection.paper && selection.paperView === "questions") {
      return makeSelection(selection.level, selection.standard, selection.paper);
    }
    if (selection.paper) {
      return makeSelection(selection.level, selection.standard);
    }
    if (selection.standard) {
      return makeSelection(selection.level);
    }
    return makeSelection();
  }

  function updateBreadcrumb(selection) {
    if (!flowNavigation || !breadcrumb || !backButtonLabel) {
      return;
    }

    const isVisible = Boolean(selection.level);
    setPanelState(flowNavigation, isVisible);
    breadcrumb.textContent = "";

    if (!isVisible) {
      return;
    }

    const items = [
      {
        label: getChoiceLabel("level", selection.level),
        selection: makeSelection(selection.level)
      }
    ];

    if (selection.standard) {
      items.push({
        label: getChoiceLabel("standard", selection.standard),
        selection: makeSelection(selection.level, selection.standard)
      });
    }

    if (selection.paper) {
      items.push({
        label: getPaperYear(selection.paper),
        selection: makeSelection(selection.level, selection.standard, selection.paper)
      });
    }

    items.forEach(function (item, index) {
      const listItem = document.createElement("li");
      const isCurrent = index === items.length - 1;

      if (isCurrent) {
        const current = document.createElement("span");
        current.className = "home-breadcrumb-current";
        current.setAttribute("aria-current", "step");
        current.textContent = item.label;
        listItem.appendChild(current);
      } else {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "home-breadcrumb-button";
        button.textContent = item.label;
        button.addEventListener("click", function () {
          navigateToSelection(item.selection);
        });
        listItem.appendChild(button);
      }

      breadcrumb.appendChild(listItem);
    });

    if (selection.paper && selection.paperView === "questions") {
      backButtonLabel.textContent = "Back to start options";
    } else if (selection.paper) {
      backButtonLabel.textContent = "Back to " + getChoiceLabel("standard", selection.standard) + " years";
    } else if (selection.standard) {
      backButtonLabel.textContent = "Back to " + getChoiceLabel("level", selection.level) + " standards";
    } else {
      backButtonLabel.textContent = "Back to level choice";
    }
  }

  function updateSelectionStatus(selection) {
    if (!selectionStatus) {
      return;
    }

    if (selection.paper && selection.paperView === "questions") {
      selectionStatus.textContent = "Choose a question from the " + getPaperYear(selection.paper) + " " + getChoiceLabel("standard", selection.standard) + " paper.";
    } else if (selection.paper) {
      selectionStatus.textContent = "Choose where to begin the " + getPaperYear(selection.paper) + " " + getChoiceLabel("standard", selection.standard) + " walkthrough.";
    } else if (selection.standard) {
      selectionStatus.textContent = "Choose a paper year for " + getChoiceLabel("standard", selection.standard) + ".";
    } else if (selection.level) {
      selectionStatus.textContent = "Choose a standard for " + getChoiceLabel("level", selection.level) + ".";
    } else {
      selectionStatus.textContent = "Choose an NCEA level.";
    }
  }

  function animateCurrentStage(selection) {
    const paperStageViews = Array.from(document.querySelectorAll(".paper-entry-choice, .paper-question-picker"));
    const stageElements = [levelChooser].concat(levelPanels, standardPanels, paperPanels, paperStageViews);
    const currentStage = getCurrentStage(selection).element;

    stageElements.forEach(function (element) {
      element.classList.remove("home-stage-current");
    });

    if (currentStage) {
      void currentStage.offsetWidth;
      currentStage.classList.add("home-stage-current");
    }
  }

  function renderSelection(selection, options) {
    const nextSelection = normaliseSelection(selection);
    const settings = options || {};
    const hasChanged = !selectionsMatch(nextSelection, activeSelection);
    const showLevelChooser = !nextSelection.level;

    setPanelState(levelChooser, showLevelChooser);
    if (revealLevelPickerButton) {
      revealLevelPickerButton.setAttribute("aria-expanded", showLevelChooser ? "true" : "false");
    }

    levelPanels.forEach(function (panel) {
      const isActive = panel.dataset.levelPanel === nextSelection.level;
      setPanelState(panel, isActive);
      panel.classList.toggle("is-showing-standard", isActive && Boolean(nextSelection.standard));
    });

    standardPanels.forEach(function (panel) {
      const isActive = panel.dataset.standardPanel === nextSelection.standard;
      setPanelState(panel, isActive);
      panel.classList.toggle("is-showing-paper", isActive && Boolean(nextSelection.paper));
    });

    paperPanels.forEach(function (panel) {
      const isActive = panel.dataset.paperPanel === nextSelection.paper;
      const entry = panel.querySelector(".paper-entry-choice");
      const questionPicker = panel.querySelector(".paper-question-picker");
      setPanelState(panel, isActive);

      if (entry) {
        setPanelState(entry, isActive && nextSelection.paperView !== "questions");
      }
      if (questionPicker) {
        setPanelState(questionPicker, isActive && nextSelection.paperView === "questions");
      }
    });

    levelButtons.forEach(function (button) {
      setButtonState(button, button.dataset.level === nextSelection.level);
    });
    standardButtons.forEach(function (button) {
      setButtonState(button, button.dataset.standard === nextSelection.standard);
    });
    paperButtons.forEach(function (button) {
      setButtonState(button, button.dataset.paper === nextSelection.paper);
    });

    activeSelection = nextSelection;
    updateBreadcrumb(nextSelection);
    updateSelectionStatus(nextSelection);

    if (hasChanged || settings.animate) {
      animateCurrentStage(nextSelection);
    }
    if (settings.scroll) {
      moveToSelection(nextSelection, settings.scrollBehavior || "smooth");
    }
    if (hasChanged && settings.focus) {
      focusCurrentStage(nextSelection);
    }
  }

  function createHistoryState(selection, cameFromHash, scrollY) {
    return {
      selectionFlow: true,
      selectionHash: getSelectionHash(selection),
      cameFromHash: cameFromHash || null,
      scrollY: Number.isFinite(scrollY) ? scrollY : window.scrollY
    };
  }

  function restoreHistoryScrollPosition(scrollY) {
    if (!Number.isFinite(scrollY)) {
      return;
    }

    const root = document.documentElement;
    const previousInlineBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, scrollY);
    window.setTimeout(function () {
      root.style.scrollBehavior = previousInlineBehavior;
    }, 0);
  }

  let historyScrollUpdateTimer = null;

  function rememberCurrentHistoryScrollPosition() {
    if (historyScrollUpdateTimer !== null) {
      window.clearTimeout(historyScrollUpdateTimer);
    }

    historyScrollUpdateTimer = window.setTimeout(function () {
      historyScrollUpdateTimer = null;
      const historyState = window.history ? window.history.state : null;
      if (!historyState
        || !historyState.selectionFlow
        || typeof window.history.replaceState !== "function") {
        return;
      }

      const scrollY = window.scrollY;
      if (Math.abs(Number(historyState.scrollY) - scrollY) <= 0.5) {
        return;
      }

      try {
        window.history.replaceState(
          Object.assign({}, historyState, { scrollY: scrollY }),
          "",
          window.location.href
        );
      } catch (error) {
        // Native restoration remains available if a browser rate-limits History API writes.
      }
    }, 500);
  }

  window.addEventListener("scroll", rememberCurrentHistoryScrollPosition, { passive: true });

  function navigateToSelection(selection, historyMode, options) {
    const nextSelection = normaliseSelection(selection);
    const nextHash = getSelectionHash(nextSelection);
    const currentHash = getSelectionHash(activeSelection);
    const method = historyMode === "replace" ? "replaceState" : "pushState";
    const settings = options || {};

    if (window.history && typeof window.history[method] === "function") {
      if (method === "pushState" && typeof window.history.replaceState === "function") {
        const currentState = window.history.state || createHistoryState(activeSelection, null);
        window.history.replaceState(
          Object.assign({}, currentState, { scrollY: window.scrollY }),
          "",
          window.location.href
        );
      }
      window.history[method](createHistoryState(nextSelection, currentHash), "", "#" + nextHash);
      renderSelection(nextSelection, {
        scroll: Boolean(settings.scroll),
        scrollBehavior: settings.scrollBehavior,
        focus: true
      });
      return;
    }

    window.location.hash = nextHash;
  }

  function navigateBackOneStep() {
    const parentSelection = getParentSelection(activeSelection);
    const parentHash = getSelectionHash(parentSelection);
    const historyState = window.history ? window.history.state : null;

    if (historyState && historyState.selectionFlow && historyState.cameFromHash === parentHash) {
      window.history.back();
      return;
    }

    navigateToSelection(
      parentSelection,
      historyState && historyState.selectionFlow && historyState.cameFromHash ? "push" : "replace"
    );
  }

  setupPaperEntryChoices();
  setupHomepageContinueCard();
  setupWalkthroughSearch();
  updatePaperProgressSummaries();

  levelButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      navigateToSelection(makeSelection(button.dataset.level));
    });
  });

  standardButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      navigateToSelection(makeSelection(button.dataset.parentLevel, button.dataset.standard));
    });
  });

  paperButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const standardPanel = getStandardPanel(button.dataset.parentStandard);
      const level = standardPanel ? standardPanel.dataset.parentLevel : null;
      navigateToSelection(makeSelection(level, button.dataset.parentStandard, button.dataset.paper));
    });
  });

  if (backButton) {
    backButton.addEventListener("click", navigateBackOneStep);
  }

  if (revealLevelPickerButton) {
    revealLevelPickerButton.addEventListener("click", function (event) {
      event.preventDefault();
      navigateToSelection(makeSelection(), "push", { scroll: true });
    });
  }

  function handleHistoryNavigation(event) {
    const hash = window.location.hash.slice(1);
    const historyState = event && event.state && event.state.selectionFlow
      ? event.state
      : null;
    const historySelection = getSelectionForHash(hash)
      || (historyState ? getSelectionForHash(historyState.selectionHash || "") : null);
    if (!historySelection) {
      return;
    }

    renderSelection(historySelection, { focus: false });
    const savedScrollY = historyState
      ? Number(historyState.scrollY)
      : NaN;
    if (Number.isFinite(savedScrollY)) {
      window.setTimeout(function () {
        restoreHistoryScrollPosition(savedScrollY);
      }, 0);
    }
  }

  window.addEventListener("popstate", handleHistoryNavigation);
  window.addEventListener("hashchange", function () {
    const hashSelection = getSelectionForHash(window.location.hash.slice(1));
    if (hashSelection && !selectionsMatch(hashSelection, activeSelection)) {
      handleHistoryNavigation(null);
    }
  });
  window.addEventListener("pageshow", function () {
    updateHomepageContinueCard();
    updatePaperProgressSummaries();
  });

  const initialHash = window.location.hash.slice(1);
  const hashSelection = getSelectionForHash(initialHash);
  const initialSelection = hashSelection || makeSelection();
  renderSelection(initialSelection, {
    animate: true,
    scroll: Boolean(initialHash && hashSelection),
    scrollBehavior: "auto"
  });

  if ((!initialHash || hashSelection)
    && window.history
    && typeof window.history.replaceState === "function") {
    window.history.replaceState(createHistoryState(initialSelection, null), "", window.location.href);
  }

  if (initialHash && hashSelection) {
    window.addEventListener("load", function () {
      moveToSelection(initialSelection, "auto");
    }, { once: true });
  }

  ensureHomepageReportFooter();
});
