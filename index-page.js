document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const catalogue = window.CALC_NZ_QUESTION_CATALOGUE;
  const reportIssueHtml = 'Found an error or unclear explanation? Report it <a class="site-footer-link" href="https://docs.google.com/forms/d/e/1FAIpQLSfsQWI9kX3BVpUNJbEqUa9gdKiF1rTvNXT4bL0T3_AYYvLpkA/viewform?usp=publish-editor" target="_blank" rel="noopener noreferrer">here</a>.';
  const storageKeys = {
    progress: "calc.nz.walkthroughProgress",
    sessionProgress: "calc.nz.walkthroughSessionProgress",
    lastVisited: "calc.nz.lastWalkthrough",
    bookmarks: "calc.nz.bookmarks",
    retry: "calc.nz.retryQuestions",
    practiceSet: "calc.nz.practiceSet"
  };
  const memoryStorage = Object.create(null);
  const volatileStorageKeys = Object.create(null);

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

  function escapeHomeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normaliseSearchText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function capitaliseSentence(value) {
    const text = String(value || "").trim();
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : "Method summary unavailable.";
  }

  function renderHomeMath(root) {
    if (!root || typeof renderMathInElement !== "function") {
      return;
    }

    renderMathInElement(root, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\(", right: "\\)", display: false }
      ]
    });
  }

  function hasUsableCatalogue(value) {
    return Boolean(value && Array.isArray(value.levels) && value.levels.length);
  }

  if (!hasUsableCatalogue(catalogue)) {
    const selector = document.querySelector("[data-selection-stage]");
    if (selector) {
      selector.innerHTML = '<p class="question-label">Catalogue unavailable</p><h2 id="selection-stage-heading">Use the static walkthrough directory</h2><p class="step-text">The interactive selector could not load. You can still browse every available standard and paper.</p><a class="nav-btn" href="standards.html">Browse standards</a>';
    }
    const availability = document.getElementById("catalogue-availability");
    if (availability) {
      availability.textContent = "Browse the complete catalogue from the standards directory.";
    }
    ensureHomepageReportFooter();
    return;
  }

  const levels = catalogue.levels;
  const levelsById = Object.create(null);
  const standards = [];
  const standardsById = Object.create(null);
  const papers = [];
  const papersById = Object.create(null);
  const questions = [];
  const questionsByKey = Object.create(null);

  levels.forEach(function (level) {
    levelsById[level.id] = level;
    (level.standards || []).forEach(function (standard) {
      standards.push(standard);
      standardsById[standard.id] = { level: level, standard: standard };
      (standard.papers || []).forEach(function (paper) {
        const paperEntry = { level: level, standard: standard, paper: paper };
        papers.push(paperEntry);
        papersById[paper.id] = paperEntry;
        (paper.questions || []).forEach(function (question) {
          const entry = {
            level: level,
            standard: standard,
            paper: paper,
            question: question,
            key: paper.id + ":" + question.id
          };
          entry.haystack = normaliseSearchText([
            level.label,
            standard.label,
            standard.code,
            paper.year,
            question.id,
            question.label,
            question.methodTitle,
            question.method,
            Array.isArray(question.skillSlugs) ? question.skillSlugs.join(" ") : "",
            paper.id
          ].join(" "));
          questions.push(entry);
          questionsByKey[entry.key] = entry;
        });
      });
    });
  });

  function getLocalStorage() {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  function getSessionStorage() {
    try {
      return window.sessionStorage;
    } catch (error) {
      return null;
    }
  }

  function canUsePersistentStorage() {
    const storage = getLocalStorage();
    if (!storage) {
      return false;
    }

    const probe = "calc.nz.storageProbe";
    try {
      storage.setItem(probe, "1");
      storage.removeItem(probe);
      return true;
    } catch (error) {
      return false;
    }
  }

  const persistentStorageAvailable = canUsePersistentStorage();

  function readRawStorage(key) {
    const storage = getLocalStorage();
    if (persistentStorageAvailable && storage && volatileStorageKeys[key] !== true) {
      try {
        const value = storage.getItem(key);
        if (value !== null) {
          memoryStorage[key] = value;
          return value;
        }
      } catch (error) {
        volatileStorageKeys[key] = true;
        // Fall through to this page's in-memory copy.
      }
    }
    return Object.prototype.hasOwnProperty.call(memoryStorage, key) ? memoryStorage[key] : null;
  }

  function writeRawStorage(key, value) {
    memoryStorage[key] = value;
    if (!persistentStorageAvailable || volatileStorageKeys[key] === true) {
      volatileStorageKeys[key] = true;
      return false;
    }
    const storage = getLocalStorage();
    if (!storage) {
      volatileStorageKeys[key] = true;
      return false;
    }
    try {
      storage.setItem(key, value);
      return true;
    } catch (error) {
      volatileStorageKeys[key] = true;
      return false;
    }
  }

  function removeStoredValue(key) {
    delete memoryStorage[key];
    if (!persistentStorageAvailable || volatileStorageKeys[key] === true) {
      volatileStorageKeys[key] = true;
      return;
    }
    const storage = getLocalStorage();
    if (!storage) {
      volatileStorageKeys[key] = true;
      return;
    }
    try {
      storage.removeItem(key);
    } catch (error) {
      volatileStorageKeys[key] = true;
      // The in-memory copy has still been cleared.
    }
  }

  function readStoredJson(key, fallbackValue) {
    const raw = readRawStorage(key);
    if (!raw) {
      return fallbackValue;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      return fallbackValue;
    }
  }

  function updateStorageDescription() {
    const description = document.querySelector("[data-storage-description]");
    if (!description || persistentStorageAvailable) {
      return;
    }
    description.textContent = "Browser storage is unavailable. These tools still work for this visit, but changes may not be saved.";
  }

  function catalogueCounts() {
    const years = Object.create(null);
    papers.forEach(function (entry) {
      years[String(entry.paper.year)] = true;
    });
    return {
      questions: questions.length,
      standards: standards.length,
      papers: papers.length,
      years: Object.keys(years).length
    };
  }

  function updateAvailabilityLine() {
    const target = document.getElementById("catalogue-availability");
    if (!target) {
      return;
    }
    const counts = catalogueCounts();
    target.textContent = counts.questions + " walkthroughs across "
      + counts.standards + " standards, "
      + counts.papers + " papers, and "
      + counts.years + " exam years.";
  }

  function setupHowItWorksDetails() {
    const details = document.querySelector("[data-home-how-details]");
    const aside = details ? details.closest(".home-hero-aside") : null;
    const hero = document.querySelector(".home-hero");
    const chooser = document.getElementById("choose-level");
    if (!details || !aside || !hero || !chooser || !window.matchMedia) {
      return;
    }
    const mobileQuery = window.matchMedia("(max-width: 960px)");
    let syncing = false;

    function syncDetails() {
      syncing = true;
      if (mobileQuery.matches) {
        chooser.insertAdjacentElement("afterend", aside);
        aside.dataset.mobilePlacement = "true";
      } else {
        hero.appendChild(aside);
        delete aside.dataset.mobilePlacement;
      }
      details.open = !mobileQuery.matches;
      window.setTimeout(function () {
        syncing = false;
      }, 0);
    }

    details.addEventListener("toggle", function () {
      if (!syncing && mobileQuery.matches) {
        details.dataset.userToggled = "true";
      }
    });

    function handleViewportChange() {
      if (!mobileQuery.matches || details.dataset.userToggled !== "true") {
        syncDetails();
      }
    }

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", handleViewportChange);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(handleViewportChange);
    }
    syncDetails();
  }

  function readProgressMap() {
    const progress = readStoredJson(storageKeys.progress, null);
    if (progress && typeof progress === "object" && !Array.isArray(progress)) {
      return progress;
    }
    const session = getSessionStorage();
    if (session) {
      try {
        const sessionProgress = JSON.parse(session.getItem(storageKeys.sessionProgress) || "{}");
        if (sessionProgress && typeof sessionProgress === "object" && !Array.isArray(sessionProgress)) {
          return sessionProgress;
        }
      } catch (error) {
        return {};
      }
    }
    return {};
  }

  function progressForPaper(paper) {
    const map = readProgressMap();
    let visited = 0;
    let completed = 0;
    (paper.questions || []).forEach(function (question) {
      const state = map[paper.id + ":" + question.id] || {};
      if (state.visited) {
        visited += 1;
      }
      if (state.completed) {
        completed += 1;
      }
    });
    return { visited: visited, completed: completed, total: (paper.questions || []).length };
  }

  function progressLabelForQuestion(entry) {
    const state = readProgressMap()[entry.key] || {};
    if (state.completed) {
      return "Completed";
    }
    if (state.visited) {
      return "Visited";
    }
    return "";
  }

  function addGuidedModeToHref(href) {
    if (!href) {
      return "";
    }
    const url = new URL(href, window.location.href);
    url.searchParams.set("mode", "guided");
    return url.pathname + url.search + url.hash;
  }

  function makeSelection(levelId, standardId, paperId, paperView) {
    return {
      levelId: levelId || null,
      standardId: standardId || null,
      paperId: paperId || null,
      paperView: paperId ? (paperView === "questions" ? "questions" : "entry") : null
    };
  }

  function normaliseSelection(selection) {
    const source = selection || {};
    if (source.paperId && papersById[source.paperId]) {
      const paperEntry = papersById[source.paperId];
      return makeSelection(
        paperEntry.level.id,
        paperEntry.standard.id,
        paperEntry.paper.id,
        source.paperView
      );
    }
    if (source.standardId && standardsById[source.standardId]) {
      const standardEntry = standardsById[source.standardId];
      return makeSelection(standardEntry.level.id, standardEntry.standard.id);
    }
    if (source.levelId && levelsById[source.levelId]) {
      return makeSelection(source.levelId);
    }
    return makeSelection();
  }

  function selectionsMatch(first, second) {
    return first.levelId === second.levelId
      && first.standardId === second.standardId
      && first.paperId === second.paperId
      && first.paperView === second.paperView;
  }

  function selectionHash(selection) {
    if (selection.paperId && selection.paperView === "questions") {
      return selection.paperId + "-questions";
    }
    return selection.paperId || selection.standardId || selection.levelId || "choose-level";
  }

  function selectionFromHash(rawHash) {
    const hash = String(rawHash || "").replace(/^#/, "");
    if (!hash || hash === "choose-level") {
      return makeSelection();
    }
    const questionMatch = hash.match(/^(.*)-questions$/);
    if (questionMatch && papersById[questionMatch[1]]) {
      return normaliseSelection({ paperId: questionMatch[1], paperView: "questions" });
    }
    if (papersById[hash]) {
      return normaliseSelection({ paperId: hash });
    }
    if (standardsById[hash]) {
      return normaliseSelection({ standardId: hash });
    }
    if (levelsById[hash]) {
      return normaliseSelection({ levelId: hash });
    }
    const legacyDifferentiation = hash.match(/^level-3-(202[0-5])$/);
    if (legacyDifferentiation && papersById["level-3-differentiation-" + legacyDifferentiation[1]]) {
      return normaliseSelection({ paperId: "level-3-differentiation-" + legacyDifferentiation[1] });
    }
    if (hash === "level-2-2025" && papersById["level-2-calculus-2025"]) {
      return normaliseSelection({ paperId: "level-2-calculus-2025" });
    }
    return null;
  }

  function parentSelection(selection) {
    if (selection.paperId && selection.paperView === "questions") {
      return makeSelection(selection.levelId, selection.standardId, selection.paperId);
    }
    if (selection.paperId) {
      return makeSelection(selection.levelId, selection.standardId);
    }
    if (selection.standardId) {
      return makeSelection(selection.levelId);
    }
    return makeSelection();
  }

  const stageContainer = document.querySelector("[data-selection-stage]");
  const selectorCard = document.getElementById("choose-level");
  const flowNavigation = document.getElementById("selection-flow-nav");
  const backButton = document.querySelector("[data-selection-back]");
  const backButtonLabel = document.querySelector("[data-selection-back-label]");
  const breadcrumb = document.querySelector("[data-selection-breadcrumb]");
  const selectionStatus = document.querySelector("[data-selection-status]");
  const revealLevelPickerButton = document.querySelector("[data-reveal-level-picker]");
  let activeSelection = makeSelection();

  function choiceButton(attributes, title, copy) {
    return '<button class="nav-btn secondary year-option" type="button" '
      + attributes
      + '><span class="year-option-title">' + escapeHomeHtml(title) + '</span>'
      + '<span class="year-option-copy">' + escapeHomeHtml(copy) + '</span></button>';
  }

  function renderLevelStage() {
    stageContainer.innerHTML = '<div class="home-dynamic-stage" data-stage-type="level">'
      + '<p class="question-label home-step-label">Start here</p>'
      + '<h2 id="selection-stage-heading" tabindex="-1">Step 1: Choose a level</h2>'
      + '<p class="step-text home-level-intro">Choose Level 2 or Level 3 to browse the standards and papers available.</p>'
      + '<div class="year-picker-grid">'
      + levels.map(function (level) {
        return choiceButton(
          'data-level="' + escapeHomeHtml(level.id) + '"',
          level.label,
          level.description
        );
      }).join("")
      + '</div><p class="step-text question-note">Select a level to continue to its standards.</p></div>';
  }

  function renderStandardStage(selection) {
    const level = levelsById[selection.levelId];
    stageContainer.innerHTML = '<div id="' + escapeHomeHtml(level.id) + '" class="home-dynamic-stage paper-panel" data-level-panel="' + escapeHomeHtml(level.id) + '">'
      + '<p class="eyebrow">' + escapeHomeHtml(level.label) + '</p>'
      + '<h2 id="selection-stage-heading" tabindex="-1">Step 2: Choose a standard</h2>'
      + '<p class="step-text">Start with the ' + escapeHomeHtml(level.label) + ' standard you want to practise.</p>'
      + '<div class="year-picker-grid standard-picker-grid">'
      + (level.standards || []).map(function (standard) {
        return choiceButton(
          'data-standard="' + escapeHomeHtml(standard.id) + '" data-parent-level="' + escapeHomeHtml(level.id) + '"',
          standard.label + " · " + standard.code,
          standard.description
        );
      }).join("")
      + '</div><p class="step-text question-note">Choose a standard to show its paper years.</p></div>';
  }

  function renderPaperStage(selection) {
    const context = standardsById[selection.standardId];
    const standard = context.standard;
    stageContainer.innerHTML = '<div id="' + escapeHomeHtml(standard.id) + '" class="home-dynamic-stage standard-section" data-standard-panel="' + escapeHomeHtml(standard.id) + '" data-parent-level="' + escapeHomeHtml(context.level.id) + '">'
      + '<p class="question-label">' + escapeHomeHtml(context.level.label + " · " + standard.code) + '</p>'
      + '<h2 id="selection-stage-heading" tabindex="-1">Step 3: Choose a paper year</h2>'
      + '<p class="step-text">Select the ' + escapeHomeHtml(standard.label) + ' paper you want to open.</p>'
      + '<div class="year-picker-grid paper-picker-grid">'
      + (standard.papers || []).map(function (paper) {
        const progress = progressForPaper(paper);
        const progressText = progress.completed
          ? progress.completed + " of " + progress.total + " completed."
          : "Open the " + paper.year + " question list.";
        return '<button class="nav-btn secondary year-option" type="button" data-paper="' + escapeHomeHtml(paper.id) + '" data-parent-standard="' + escapeHomeHtml(standard.id) + '">'
          + '<span class="year-option-title">' + escapeHomeHtml(paper.label) + '</span>'
          + '<span class="year-option-copy" data-paper-progress="' + escapeHomeHtml(paper.id) + '">' + escapeHomeHtml(progressText) + '</span></button>';
      }).join("")
      + '</div><p class="home-directory-link"><a class="site-footer-link" href="' + escapeHomeHtml(standard.landingHref) + '">View the full ' + escapeHomeHtml(standard.label) + ' directory</a></p></div>';
  }

  function renderPaperEntryStage(selection) {
    const context = papersById[selection.paperId];
    const paper = context.paper;
    const firstQuestion = paper.questions && paper.questions[0];
    const progress = progressForPaper(paper);
    stageContainer.innerHTML = '<div id="' + escapeHomeHtml(paper.id) + '" class="home-dynamic-stage paper-year-panel" data-paper-panel="' + escapeHomeHtml(paper.id) + '" data-parent-standard="' + escapeHomeHtml(context.standard.id) + '"><div class="paper-entry-choice">'
      + '<p class="question-label">' + escapeHomeHtml(context.standard.label + " · " + paper.year + " paper") + '</p>'
      + '<h2 id="selection-stage-heading" tabindex="-1">Where would you like to start?</h2>'
      + '<p class="paper-progress-chip">' + progress.completed + " of " + progress.total + ' completed</p>'
      + '<p class="step-text paper-entry-intro">Begin with the first question, jump to a specific part, or browse the crawlable paper directory.</p>'
      + '<div class="year-picker-grid paper-entry-grid">'
      + '<a class="nav-btn secondary year-option paper-entry-option" data-paper-start-guided href="' + escapeHomeHtml(firstQuestion ? addGuidedModeToHref(firstQuestion.href) : context.standard.landingHref) + '"><span class="year-option-title">From the start</span><span class="year-option-copy">Begin with ' + escapeHomeHtml(firstQuestion ? firstQuestion.label : "the paper") + ' as a guided lesson.</span></a>'
      + '<button class="nav-btn secondary year-option paper-entry-option" data-paper-start-specific type="button"><span class="year-option-title">A specific question</span><span class="year-option-copy">Open only this paper’s question menu.</span></button>'
      + '<a class="nav-btn secondary year-option paper-entry-option" href="' + escapeHomeHtml(paper.landingHref) + '"><span class="year-option-title">Paper overview</span><span class="year-option-copy">Browse every question and source link for this paper.</span></a>'
      + '</div></div></div>';
  }

  function questionCardHtml(entry) {
    const progress = progressLabelForQuestion(entry);
    const progressText = progress
      ? '<span class="home-question-progress">' + escapeHomeHtml(progress) + '</span>'
      : "";
    return '<a class="nav-btn index-link-card" href="' + escapeHomeHtml(entry.question.href) + '">'
      + '<span class="index-link-title">' + escapeHomeHtml(entry.question.label) + '</span>'
      + progressText
      + '<span class="index-link-copy">' + escapeHomeHtml(capitaliseSentence(entry.question.method)) + '</span></a>';
  }

  function renderQuestionStage(selection) {
    const context = papersById[selection.paperId];
    const groups = Object.create(null);
    (context.paper.questions || []).forEach(function (question) {
      const group = question.id.charAt(0) || "Other";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(questionsByKey[context.paper.id + ":" + question.id]);
    });
    stageContainer.innerHTML = '<div id="' + escapeHomeHtml(context.paper.id) + '" class="home-dynamic-stage paper-year-panel" data-paper-panel="' + escapeHomeHtml(context.paper.id) + '" data-parent-standard="' + escapeHomeHtml(context.standard.id) + '"><div class="paper-question-picker">'
      + '<div class="paper-stage-header"><p class="question-label">' + escapeHomeHtml(context.standard.label + " · " + context.paper.year + " paper") + '</p>'
      + '<h2 id="selection-stage-heading" tabindex="-1">Choose a question</h2>'
      + '<p class="step-text">Only questions from this paper are shown.</p></div>'
      + Object.keys(groups).sort().map(function (group) {
        return '<div class="index-group"><p class="question-label index-group-label">Question ' + escapeHomeHtml(group) + '</p><div class="nav-row index-nav">'
          + groups[group].map(questionCardHtml).join("") + '</div></div>';
      }).join("")
      + '</div></div>';
    renderHomeMath(stageContainer);
  }

  function updateBreadcrumb(selection) {
    const visible = Boolean(selection.levelId);
    flowNavigation.hidden = !visible;
    flowNavigation.classList.toggle("hidden", !visible);
    breadcrumb.textContent = "";
    if (!visible) {
      return;
    }
    const items = [];
    const level = levelsById[selection.levelId];
    items.push({ label: level.label, selection: makeSelection(level.id) });
    if (selection.standardId) {
      const standard = standardsById[selection.standardId].standard;
      items.push({ label: standard.label, selection: makeSelection(level.id, standard.id) });
    }
    if (selection.paperId) {
      const paper = papersById[selection.paperId].paper;
      items.push({ label: String(paper.year), selection: makeSelection(level.id, selection.standardId, paper.id) });
    }
    if (selection.paperView === "questions") {
      items.push({ label: "Questions", selection: selection });
    }

    items.forEach(function (item, index) {
      const listItem = document.createElement("li");
      if (index === items.length - 1) {
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

    if (selection.paperView === "questions") {
      backButtonLabel.textContent = "Back to start options";
    } else if (selection.paperId) {
      backButtonLabel.textContent = "Back to paper years";
    } else if (selection.standardId) {
      backButtonLabel.textContent = "Back to standards";
    } else {
      backButtonLabel.textContent = "Back to level choice";
    }
  }

  function updateSelectionStatus(selection) {
    if (!selectionStatus) {
      return;
    }
    if (selection.paperView === "questions") {
      const paperContext = papersById[selection.paperId];
      selectionStatus.textContent = "Showing " + paperContext.paper.questions.length + " questions from the " + paperContext.paper.year + " " + paperContext.standard.label + " paper.";
    } else if (selection.paperId) {
      const entryContext = papersById[selection.paperId];
      selectionStatus.textContent = "Choose where to begin the " + entryContext.paper.year + " " + entryContext.standard.label + " paper.";
    } else if (selection.standardId) {
      selectionStatus.textContent = "Choose a paper year for " + standardsById[selection.standardId].standard.label + ".";
    } else if (selection.levelId) {
      selectionStatus.textContent = "Choose a standard for " + levelsById[selection.levelId].label + ".";
    } else {
      selectionStatus.textContent = "Choose an NCEA level.";
    }
  }

  function focusStageHeading() {
    const heading = document.getElementById("selection-stage-heading");
    if (!heading) {
      return;
    }
    if (typeof focusWithoutPageScroll === "function") {
      focusWithoutPageScroll(heading);
    } else {
      try {
        heading.focus({ preventScroll: true });
      } catch (error) {
        heading.focus();
      }
    }
  }

  function renderSelection(selection, options) {
    const next = normaliseSelection(selection);
    const settings = options || {};
    if (next.paperView === "questions") {
      renderQuestionStage(next);
    } else if (next.paperId) {
      renderPaperEntryStage(next);
    } else if (next.standardId) {
      renderPaperStage(next);
    } else if (next.levelId) {
      renderStandardStage(next);
    } else {
      renderLevelStage();
    }
    activeSelection = next;
    selectorCard.dataset.currentStage = next.paperView === "questions"
      ? "questions"
      : next.paperId ? "paper" : next.standardId ? "year" : next.levelId ? "standard" : "level";
    stageContainer.classList.remove("home-stage-current");
    void stageContainer.offsetWidth;
    stageContainer.classList.add("home-stage-current");
    updateBreadcrumb(next);
    updateSelectionStatus(next);
    bindStageEvents();
    if (settings.focus) {
      focusStageHeading();
    }
  }

  function bindStageEvents() {
    stageContainer.querySelectorAll("[data-level]").forEach(function (button) {
      button.addEventListener("click", function () {
        navigateToSelection(makeSelection(button.dataset.level));
      });
    });
    stageContainer.querySelectorAll("[data-standard]").forEach(function (button) {
      button.addEventListener("click", function () {
        navigateToSelection(makeSelection(button.dataset.parentLevel, button.dataset.standard));
      });
    });
    stageContainer.querySelectorAll("[data-paper]").forEach(function (button) {
      button.addEventListener("click", function () {
        const context = papersById[button.dataset.paper];
        navigateToSelection(makeSelection(context.level.id, context.standard.id, context.paper.id));
      });
    });
    const questionPickerButton = stageContainer.querySelector("[data-paper-start-specific]");
    if (questionPickerButton) {
      questionPickerButton.addEventListener("click", function () {
        navigateToSelection(makeSelection(activeSelection.levelId, activeSelection.standardId, activeSelection.paperId, "questions"));
      });
    }
  }

  function createHistoryState(selection, cameFromHash, scrollY) {
    return {
      selectionFlow: true,
      selectionHash: selectionHash(selection),
      cameFromHash: cameFromHash || null,
      scrollY: Number.isFinite(scrollY) ? scrollY : window.scrollY
    };
  }

  function navigateToSelection(selection, historyMode, options) {
    const next = normaliseSelection(selection);
    const currentHash = selectionHash(activeSelection);
    const method = historyMode === "replace" ? "replaceState" : "pushState";
    if (window.history && typeof window.history[method] === "function") {
      if (method === "pushState" && window.history.state && window.history.state.selectionFlow) {
        window.history.replaceState(
          Object.assign({}, window.history.state, { scrollY: window.scrollY }),
          "",
          window.location.href
        );
      }
      window.history[method](createHistoryState(next, currentHash), "", "#" + selectionHash(next));
      renderSelection(next, { focus: true });
    } else {
      window.location.hash = selectionHash(next);
    }
    if (options && options.scroll && selectorCard) {
      const top = Math.max(window.scrollY + selectorCard.getBoundingClientRect().top - 90, 0);
      window.scrollTo({ top: top, behavior: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }

  function navigateBackOneStep() {
    const parent = parentSelection(activeSelection);
    const parentHash = selectionHash(parent);
    const state = window.history ? window.history.state : null;
    if (state && state.selectionFlow && state.cameFromHash === parentHash) {
      window.history.back();
      return;
    }
    navigateToSelection(parent, "replace");
  }

  if (backButton) {
    backButton.addEventListener("click", navigateBackOneStep);
  }
  if (revealLevelPickerButton) {
    revealLevelPickerButton.addEventListener("click", function (event) {
      event.preventDefault();
      navigateToSelection(makeSelection(), "push", { scroll: true });
    });
  }

  window.addEventListener("popstate", function (event) {
    const state = event.state && event.state.selectionFlow ? event.state : null;
    const selection = selectionFromHash(window.location.hash) || (state ? selectionFromHash(state.selectionHash) : null);
    if (!selection) {
      return;
    }
    renderSelection(selection, { focus: true });
    if (state && Number.isFinite(Number(state.scrollY))) {
      window.setTimeout(function () {
        window.scrollTo(0, Number(state.scrollY));
      }, 0);
    }
  });

  window.addEventListener("hashchange", function () {
    const selection = selectionFromHash(window.location.hash);
    if (selection && !selectionsMatch(selection, activeSelection)) {
      renderSelection(selection, { focus: true });
    }
  });

  function updateContinueCard() {
    const card = document.getElementById("homepage-continue-card");
    const record = readStoredJson(storageKeys.lastVisited, null);
    if (!card) {
      return;
    }
    const key = record && record.paperId && record.partId ? record.paperId + ":" + record.partId : "";
    const entry = key ? questionsByKey[key] : null;
    if (!record || !entry) {
      card.hidden = true;
      return;
    }
    const href = record.href || entry.question.href;
    const title = "Continue " + entry.paper.year + " " + entry.standard.label + " · " + entry.question.label;
    card.hidden = false;
    card.innerHTML = '<div class="home-continue-copy"><p class="question-label">Continue where you left off</p><h2 id="homepage-continue-heading">' + escapeHomeHtml(title) + '</h2><p class="step-text">Pick up from your most recent walkthrough.</p></div><a class="nav-btn home-continue-button" href="' + escapeHomeHtml(href) + '">Continue ' + escapeHomeHtml(entry.question.label) + '</a>';
  }

  function scoreSearchResult(entry, tokens, query) {
    let score = 0;
    const title = normaliseSearchText(entry.question.label);
    const method = normaliseSearchText(entry.question.method);
    const standard = normaliseSearchText(entry.standard.label + " " + entry.standard.code);
    tokens.forEach(function (token) {
      if (title.indexOf(token) >= 0) {
        score += 6;
      }
      if (standard.indexOf(token) >= 0) {
        score += 5;
      }
      if (String(entry.paper.year) === token) {
        score += 5;
      }
      if (method.indexOf(token) >= 0) {
        score += 3;
      }
    });
    if (entry.haystack.indexOf(query) >= 0) {
      score += 4;
    }
    return score;
  }

  function setupSearch() {
    const searchSection = document.getElementById("walkthrough-site-search");
    if (!searchSection) {
      return;
    }
    const input = searchSection.querySelector("#walkthrough-search-input");
    const form = searchSection.querySelector(".home-search-form");
    const resultsContainer = searchSection.querySelector("[data-search-results]");

    function renderSearchResults() {
      const query = normaliseSearchText(input.value);
      const tokens = query ? query.split(" ").filter(Boolean) : [];
      if (!tokens.length) {
        resultsContainer.hidden = true;
        resultsContainer.innerHTML = "";
        return;
      }
      const matches = questions.filter(function (entry) {
        return tokens.every(function (token) {
          return entry.haystack.indexOf(token) >= 0;
        });
      }).map(function (entry) {
        return { entry: entry, score: scoreSearchResult(entry, tokens, query) };
      }).sort(function (first, second) {
        return second.score - first.score
          || second.entry.paper.year - first.entry.paper.year
          || first.entry.question.label.localeCompare(second.entry.question.label);
      }).slice(0, 12).map(function (result) {
        return result.entry;
      });

      resultsContainer.hidden = false;
      if (!matches.length) {
        resultsContainer.innerHTML = '<p class="home-search-empty">No matching walkthroughs found. Try a method, year, or standard number.</p>';
        return;
      }
      resultsContainer.innerHTML = '<p class="visually-hidden">' + matches.length + ' matching walkthroughs shown.</p><ol class="home-search-result-list">'
        + matches.map(function (entry) {
          return '<li><a class="home-search-result" href="' + escapeHomeHtml(entry.question.href) + '"><span class="home-search-result-meta">' + escapeHomeHtml(entry.paper.year + " · " + entry.standard.label + " · " + entry.standard.code) + '</span><span class="home-search-result-title">' + escapeHomeHtml(entry.question.label) + '</span><span class="home-search-result-copy">' + escapeHomeHtml(capitaliseSentence(entry.question.method)) + '</span></a></li>';
        }).join("") + '</ol>';
      renderHomeMath(resultsContainer);
    }

    input.addEventListener("input", renderSearchResults);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const first = resultsContainer.querySelector("a.home-search-result");
      if (first) {
        window.location.href = first.href;
      }
    });
  }

  function practiceScopes() {
    const scopes = [{ value: "all", label: "All available questions", questions: questions }];
    levels.forEach(function (level) {
      scopes.push({
        value: "level:" + level.id,
        label: level.label + " · all standards",
        questions: questions.filter(function (entry) { return entry.level.id === level.id; })
      });
      (level.standards || []).forEach(function (standard) {
        scopes.push({
          value: "standard:" + standard.id,
          label: level.label + " · " + standard.label + " · " + standard.code,
          questions: questions.filter(function (entry) { return entry.standard.id === standard.id; })
        });
      });
    });
    return scopes;
  }

  const scopes = practiceScopes();

  function randomIndex(length) {
    if (length <= 1) {
      return 0;
    }
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return values[0] % length;
    }
    return Math.floor(Math.random() * length);
  }

  function shuffled(entries) {
    const copy = entries.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = randomIndex(index + 1);
      const temporary = copy[index];
      copy[index] = copy[swapIndex];
      copy[swapIndex] = temporary;
    }
    return copy;
  }

  function variedSample(entries, count) {
    const pool = shuffled(entries);
    const selected = [];
    const usedPapers = Object.create(null);
    pool.forEach(function (entry) {
      if (selected.length < count && !usedPapers[entry.paper.id]) {
        selected.push(entry);
        usedPapers[entry.paper.id] = true;
      }
    });
    if (selected.length < count) {
      pool.forEach(function (entry) {
        if (selected.length < count && selected.indexOf(entry) < 0) {
          selected.push(entry);
        }
      });
    }
    return selected;
  }

  function practiceSetRecord(minutes, scopeValue, entries) {
    return {
      minutes: minutes,
      scope: scopeValue,
      updatedAt: Date.now(),
      questions: entries.map(function (entry) {
        return {
          paperId: entry.paper.id,
          partId: entry.question.id,
          href: entry.question.href,
          label: entry.paper.year + " " + entry.standard.label + " · " + entry.question.label
        };
      })
    };
  }

  function normalisePracticeSet(record) {
    if (!record || !Array.isArray(record.questions)) {
      return null;
    }
    const entries = record.questions.map(function (item) {
      return item && item.paperId && item.partId ? questionsByKey[item.paperId + ":" + item.partId] : null;
    }).filter(Boolean);
    if (!entries.length) {
      return null;
    }
    return {
      minutes: Number(record.minutes) === 20 ? 20 : 10,
      scope: record.scope || "all",
      entries: entries
    };
  }

  function renderPracticeSet(output, practiceSet) {
    output.hidden = false;
    output.innerHTML = '<div class="home-practice-result-heading"><p class="question-label">' + practiceSet.minutes + '-minute set</p><h3>Your ' + practiceSet.entries.length + '-question practice set</h3><p class="step-text">Work at your own pace or use your own timer. The set uses available questions only; it does not infer difficulty or grade level.</p></div><ol class="home-practice-set-list">'
      + practiceSet.entries.map(function (entry, index) {
        return '<li><a class="home-practice-set-link" href="' + escapeHomeHtml(entry.question.href) + '"><span>' + (index + 1) + '. ' + escapeHomeHtml(entry.paper.year + " " + entry.standard.label + " · " + entry.question.label) + '</span><small>' + escapeHomeHtml(capitaliseSentence(entry.question.method)) + '</small></a></li>';
      }).join("") + '</ol>';
    renderHomeMath(output);
  }

  function setupPracticeTools() {
    const scopeSelect = document.querySelector("[data-practice-scope]");
    const output = document.querySelector("[data-practice-output]");
    if (!scopeSelect || !output) {
      return;
    }
    scopeSelect.innerHTML = scopes.map(function (scope) {
      return '<option value="' + escapeHomeHtml(scope.value) + '">' + escapeHomeHtml(scope.label + " (" + scope.questions.length + ")") + '</option>';
    }).join("");

    function selectedScope() {
      return scopes.find(function (scope) { return scope.value === scopeSelect.value; }) || scopes[0];
    }

    const savedSet = normalisePracticeSet(readStoredJson(storageKeys.practiceSet, null));
    if (savedSet) {
      renderPracticeSet(output, savedSet);
    }

    document.querySelector("[data-random-question]").addEventListener("click", function () {
      const scope = selectedScope();
      if (!scope.questions.length) {
        output.hidden = false;
        output.innerHTML = '<p class="home-search-empty">No questions are available in that scope.</p>';
        return;
      }
      const entry = scope.questions[randomIndex(scope.questions.length)];
      window.location.href = entry.question.href;
    });

    document.querySelectorAll("[data-practice-set]").forEach(function (button) {
      button.addEventListener("click", function () {
        const minutes = Number(button.dataset.practiceSet) === 20 ? 20 : 10;
        const count = minutes === 20 ? 6 : 3;
        const scope = selectedScope();
        const entries = variedSample(scope.questions, Math.min(count, scope.questions.length));
        const record = practiceSetRecord(minutes, scope.value, entries);
        writeRawStorage(storageKeys.practiceSet, JSON.stringify(record));
        renderPracticeSet(output, { minutes: minutes, scope: scope.value, entries: entries });
        const heading = output.querySelector("h3");
        if (heading) {
          heading.tabIndex = -1;
          heading.focus();
        }
      });
    });
  }

  function normaliseSavedCollection(key) {
    const raw = readStoredJson(key, {});
    const records = Array.isArray(raw) ? raw : raw && typeof raw === "object" ? Object.keys(raw).map(function (recordKey) {
      const value = raw[recordKey];
      return value && typeof value === "object" ? Object.assign({ storageKey: recordKey }, value) : { storageKey: recordKey };
    }) : [];
    const seen = Object.create(null);
    return records.map(function (record) {
      let paperId = record.paperId || "";
      let partId = record.partId || "";
      const storedKey = record.storageKey || record.key || "";
      if ((!paperId || !partId) && storedKey.indexOf(":") > 0) {
        const separator = storedKey.lastIndexOf(":");
        paperId = storedKey.slice(0, separator);
        partId = storedKey.slice(separator + 1);
      }
      const entry = questionsByKey[paperId + ":" + partId];
      if (!entry || seen[entry.key]) {
        return null;
      }
      seen[entry.key] = true;
      return { entry: entry, record: record };
    }).filter(Boolean).sort(function (first, second) {
      return Number(second.record.updatedAt || 0) - Number(first.record.updatedAt || 0);
    });
  }

  function setupLocalLibrary() {
    const results = document.getElementById("home-library-results");
    const buttons = Array.from(document.querySelectorAll("[data-library-view]"));
    const resetButton = document.querySelector("[data-reset-progress]");
    if (!results || !buttons.length || !resetButton) {
      return;
    }
    let activeView = null;

    function collectionFor(view) {
      return normaliseSavedCollection(view === "bookmarks" ? storageKeys.bookmarks : storageKeys.retry);
    }

    function updateCounts() {
      const bookmarkCount = collectionFor("bookmarks").length;
      const retryCount = collectionFor("retry").length;
      const bookmarkTarget = document.querySelector('[data-library-count="bookmarks"]');
      const retryTarget = document.querySelector('[data-library-count="retry"]');
      if (bookmarkTarget) {
        bookmarkTarget.textContent = String(bookmarkCount);
      }
      if (retryTarget) {
        retryTarget.textContent = String(retryCount);
      }
    }

    function renderLibrary(view) {
      const collection = collectionFor(view);
      results.hidden = false;
      if (!collection.length) {
        results.innerHTML = '<p class="home-search-empty">No ' + (view === "bookmarks" ? "bookmarked" : "retry") + ' questions are saved on this device yet.</p>';
        return;
      }
      results.innerHTML = '<p class="visually-hidden">' + collection.length + ' saved questions shown.</p><ol class="home-library-list">'
        + collection.map(function (item) {
          const entry = item.entry;
          return '<li><a class="home-library-link" href="' + escapeHomeHtml(item.record.href || entry.question.href) + '"><span>' + escapeHomeHtml(entry.paper.year + " " + entry.standard.label + " · " + entry.question.label) + '</span><small>' + escapeHomeHtml(capitaliseSentence(entry.question.method)) + '</small></a></li>';
        }).join("") + '</ol>';
      renderHomeMath(results);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        const view = button.dataset.libraryView;
        const shouldOpen = activeView !== view || results.hidden;
        activeView = shouldOpen ? view : null;
        buttons.forEach(function (candidate) {
          candidate.setAttribute("aria-expanded", candidate === button && shouldOpen ? "true" : "false");
          candidate.classList.toggle("is-active", candidate === button && shouldOpen);
        });
        if (!shouldOpen) {
          results.hidden = true;
          results.innerHTML = "";
          return;
        }
        renderLibrary(view);
      });
    });

    resetButton.addEventListener("click", function () {
      const confirmed = window.confirm("Clear walkthrough progress, bookmarks, retry questions, and your latest practice set from this browser?");
      if (!confirmed) {
        return;
      }
      [storageKeys.progress, storageKeys.lastVisited, storageKeys.bookmarks, storageKeys.retry, storageKeys.practiceSet].forEach(removeStoredValue);
      const session = getSessionStorage();
      if (session) {
        try {
          session.removeItem(storageKeys.sessionProgress);
        } catch (error) {
          // Session progress is optional.
        }
      }
      activeView = null;
      buttons.forEach(function (button) {
        button.setAttribute("aria-expanded", "false");
        button.classList.remove("is-active");
      });
      results.hidden = false;
      results.innerHTML = '<p class="home-search-empty">Saved practice has been cleared from this browser.</p>';
      const practiceOutput = document.querySelector("[data-practice-output]");
      if (practiceOutput) {
        practiceOutput.hidden = true;
        practiceOutput.innerHTML = "";
      }
      updateCounts();
      updateContinueCard();
      renderSelection(activeSelection, { focus: false });
    });

    updateCounts();
    window.addEventListener("storage", updateCounts);
    window.addEventListener("pageshow", updateCounts);
  }

  updateAvailabilityLine();
  updateStorageDescription();
  setupHowItWorksDetails();
  setupSearch();
  setupPracticeTools();
  setupLocalLibrary();
  updateContinueCard();

  window.addEventListener("pageshow", function () {
    updateContinueCard();
    if (activeSelection.standardId) {
      renderSelection(activeSelection, { focus: false });
    }
  });

  const initialHash = window.location.hash.replace(/^#/, "");
  const hashSelection = selectionFromHash(initialHash);
  const initialSelection = hashSelection || makeSelection();
  renderSelection(initialSelection, { focus: false });
  if ((!initialHash || hashSelection) && window.history && typeof window.history.replaceState === "function") {
    window.history.replaceState(createHistoryState(initialSelection, null), "", window.location.href);
  }

  ensureHomepageReportFooter();
});
