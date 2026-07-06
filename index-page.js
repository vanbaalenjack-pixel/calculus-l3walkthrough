document.addEventListener("DOMContentLoaded", function () {
  const reportIssueHtml = 'Found an error or unclear explanation? Report it <a class="site-footer-link" href="https://docs.google.com/forms/d/e/1FAIpQLSfsQWI9kX3BVpUNJbEqUa9gdKiF1rTvNXT4bL0T3_AYYvLpkA/viewform?usp=publish-editor" target="_blank" rel="noreferrer">here</a>.';

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

  if (window.history && "scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

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

    return makeSelection();
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
        window.scrollTo(0, scrollTop);
        root.style.scrollBehavior = previousInlineBehavior;
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
      try {
        heading.focus({ preventScroll: true });
      } catch (error) {
        heading.focus();
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

  function createHistoryState(selection, cameFromHash) {
    return {
      selectionFlow: true,
      selectionHash: getSelectionHash(selection),
      cameFromHash: cameFromHash || null
    };
  }

  function navigateToSelection(selection, historyMode) {
    const nextSelection = normaliseSelection(selection);
    const nextHash = getSelectionHash(nextSelection);
    const currentHash = getSelectionHash(activeSelection);
    const method = historyMode === "replace" ? "replaceState" : "pushState";

    if (window.history && typeof window.history[method] === "function") {
      window.history[method](createHistoryState(nextSelection, currentHash), "", "#" + nextHash);
      renderSelection(nextSelection, { scroll: true, focus: true });
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
      navigateToSelection(makeSelection());
    });
  }

  function handleHistoryNavigation() {
    const hash = window.location.hash.slice(1);
    const historySelection = getSelectionForHash(hash);
    renderSelection(historySelection, {
      scroll: true,
      scrollBehavior: "auto",
      focus: true
    });
    window.setTimeout(function () {
      moveToSelection(historySelection, "auto");
    }, 100);
  }

  window.addEventListener("popstate", handleHistoryNavigation);
  window.addEventListener("hashchange", function () {
    const hashSelection = getSelectionForHash(window.location.hash.slice(1));
    if (!selectionsMatch(hashSelection, activeSelection)) {
      handleHistoryNavigation();
    }
  });

  const initialHash = window.location.hash.slice(1);
  const initialSelection = getSelectionForHash(initialHash);
  renderSelection(initialSelection, {
    animate: true,
    scroll: Boolean(initialHash),
    scrollBehavior: "auto"
  });

  if (window.history && typeof window.history.replaceState === "function") {
    window.history.replaceState(createHistoryState(initialSelection, null), "", window.location.href);
  }

  if (initialHash) {
    window.addEventListener("load", function () {
      moveToSelection(initialSelection, "auto");
    }, { once: true });
  }

  ensureHomepageReportFooter();
});
