function getSiteHeader() {
  return document.querySelector(".site-header");
}

const WALKTHROUGH_KATEX_DELIMITERS = [
  { left: "$$", right: "$$", display: true },
  { left: "\\[", right: "\\]", display: true },
  { left: "\\(", right: "\\)", display: false }
];

const STICKY_QUESTION_STORAGE_KEY = "calc.nz.stickyQuestionCard";
let stickyQuestionPreferenceFallback = true;

function getStickyQuestionPreference() {
  try {
    const storedPreference = window.localStorage.getItem(STICKY_QUESTION_STORAGE_KEY);
    stickyQuestionPreferenceFallback = storedPreference === null
      ? stickyQuestionPreferenceFallback
      : storedPreference !== "false";
    return stickyQuestionPreferenceFallback;
  } catch (error) {
    return stickyQuestionPreferenceFallback;
  }
}

function setStickyQuestionPreference(enabled) {
  stickyQuestionPreferenceFallback = enabled;
  try {
    window.localStorage.setItem(STICKY_QUESTION_STORAGE_KEY, enabled ? "true" : "false");
  } catch (error) {
    // The setting still applies for this page when storage is unavailable.
  }
}

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
  const stickyPreferenceEnabled = getStickyQuestionPreference();
  const enableSticky = stickyPreferenceEnabled
    && hasFinePointer
    && viewportWidth >= 1120
    && questionCardHeight > 0
    && !hasMultipleVisuals
    && questionCardHeight <= maxStickyHeight
    && viewportHeight - questionCardHeight - stickyClearance >= minimumVisibleStepArea;

  document.documentElement.style.setProperty("--question-sticky-top", stickyGap + "px");
  questionCard.classList.toggle("question-card-with-visual", containsVisual);
  questionCard.classList.toggle("question-card-multi-visual", hasMultipleVisuals);
  questionCard.classList.toggle("sticky-question-card-enabled", enableSticky);

  const preferenceControl = document.getElementById("sticky-question-setting");
  const preferenceStatus = document.getElementById("sticky-question-setting-status");

  if (preferenceControl) {
    preferenceControl.checked = stickyPreferenceEnabled;
  }

  if (preferenceStatus) {
    preferenceStatus.textContent = !stickyPreferenceEnabled
      ? "Off. Questions scroll with the page."
      : enableSticky
        ? "On for this question."
        : "On when the question fits safely; large cards stay in the normal page flow.";
  }
}

function ensureStickyQuestionPreferenceControl(questionCard) {
  const app = document.querySelector("main.app:not(.home-app)");

  if (!app || !questionCard) {
    return null;
  }

  let setting = document.getElementById("sticky-question-setting-panel");

  if (!setting) {
    setting = document.createElement("aside");
    setting.id = "sticky-question-setting-panel";
    setting.className = "walkthrough-setting-panel";
    setting.setAttribute("aria-label", "Walkthrough display settings");
    setting.innerHTML = `
      <label class="walkthrough-setting-toggle" for="sticky-question-setting">
        <input id="sticky-question-setting" type="checkbox" />
        <span class="walkthrough-setting-switch" aria-hidden="true"></span>
        <span class="walkthrough-setting-label">Pin question while scrolling</span>
      </label>
      <span id="sticky-question-setting-status" class="walkthrough-setting-status" aria-live="polite"></span>
    `;

    const topbar = app.querySelector(".topbar");
    if (topbar) {
      topbar.insertAdjacentElement("afterend", setting);
    } else {
      app.insertBefore(setting, app.firstChild);
    }
  }

  const checkbox = document.getElementById("sticky-question-setting");

  if (checkbox && checkbox.dataset.preferenceSetup !== "true") {
    checkbox.dataset.preferenceSetup = "true";
    checkbox.checked = getStickyQuestionPreference();
    checkbox.addEventListener("change", function () {
      setStickyQuestionPreference(checkbox.checked);
      document.querySelectorAll(".sticky-question-card").forEach(function (card) {
        syncQuestionCardStickyState(card);
      });
    });
  }

  syncQuestionCardStickyState(questionCard);
  return setting;
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

function isGuidedWalkthroughMode() {
  return new URLSearchParams(window.location.search).get("mode") === "guided";
}

function getGuidedWalkthroughHref(href) {
  if (!isGuidedWalkthroughMode() || !href || /(?:^|\/)index\.html(?:[?#]|$)/i.test(href)) {
    return href;
  }

  const url = new URL(href, window.location.href);
  url.searchParams.set("mode", "guided");
  return url.pathname + url.search + url.hash;
}

function carryGuidedModeToQuestionLinks(root) {
  if (!isGuidedWalkthroughMode() || !root) {
    return;
  }

  root.querySelectorAll("a[href]").forEach(function (link) {
    const label = String(link.textContent || "").trim();
    const href = link.getAttribute("href");

    if (/question/i.test(label) && href && !/(?:^|\/)index\.html(?:[?#]|$)/i.test(href)) {
      link.setAttribute("href", getGuidedWalkthroughHref(href));
    }
  });
}

const WALKTHROUGH_SIDEBAR_STORAGE_KEY = "calc.nz.walkthroughSidebarVisible";
const WALKTHROUGH_PROGRESS_STORAGE_KEY = "calc.nz.walkthroughProgress";
const WALKTHROUGH_SESSION_PROGRESS_STORAGE_KEY = "calc.nz.walkthroughSessionProgress";
const WALKTHROUGH_LAST_VISITED_STORAGE_KEY = "calc.nz.lastWalkthrough";
const WALKTHROUGH_EXAM_MODE_STORAGE_KEY = "calc.nz.examMode";
const WALKTHROUGH_NAV_PARTS = [
  "1a", "1b", "1c", "1d", "1e",
  "2a", "2b", "2c", "2d", "2e",
  "3a", "3b", "3c", "3d", "3e"
];
const WALKTHROUGH_NAV_L2_CALCULUS_PARTS = [
  "1a", "1b", "1c", "1d",
  "2a", "2b", "2c", "2d",
  "3a", "3b", "3c", "3d"
];
const WALKTHROUGH_NAV_YEARS = [2025, 2024, 2023, 2022, 2021, 2020];
const WALKTHROUGH_NAV_DIFFERENTIATION_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
const WALKTHROUGH_NAV_INTEGRATION_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019];
let walkthroughSidebarPreferenceFallback = null;
let walkthroughProgressFallback = {};
let walkthroughLastVisitedFallback = null;
let walkthroughExamModeFallback = false;

function createWalkthroughPaper(id, year, routeTemplate, parts) {
  return {
    id: id,
    year: year,
    label: year + " Paper",
    indexHref: "index.html#" + id,
    routeTemplate: routeTemplate,
    parts: parts || WALKTHROUGH_NAV_PARTS
  };
}

function createWalkthroughYearPapers(standardId, routeTemplate, years) {
  return (years || WALKTHROUGH_NAV_YEARS).map(function (year) {
    return createWalkthroughPaper(
      standardId + "-" + year,
      year,
      routeTemplate.replace(/\{year\}/g, String(year))
    );
  });
}

const WALKTHROUGH_NAV_CATALOG = [
  {
    id: "level-2",
    label: "Level 2",
    indexHref: "index.html#level-2",
    standards: [
      {
        id: "level-2-calculus",
        label: "Calculus",
        indexHref: "index.html#level-2-calculus",
        papers: [
          createWalkthroughPaper(
            "level-2-calculus-2025",
            2025,
            "{part}2025-l2.html",
            WALKTHROUGH_NAV_L2_CALCULUS_PARTS
          )
        ]
      },
      {
        id: "level-2-algebra",
        label: "Algebra",
        indexHref: "index.html#level-2-algebra",
        papers: [
          createWalkthroughPaper("level-2-algebra-2025", 2025, "alg-{part}2025-l2.html")
        ]
      }
    ]
  },
  {
    id: "level-3",
    label: "Level 3",
    indexHref: "index.html#level-3",
    standards: [
      {
        id: "level-3-differentiation",
        label: "Differentiation",
        indexHref: "index.html#level-3-differentiation",
        papers: createWalkthroughYearPapers("level-3-differentiation", "{part}{year}.html", WALKTHROUGH_NAV_DIFFERENTIATION_YEARS)
      },
      {
        id: "level-3-integration",
        label: "Integration",
        indexHref: "index.html#level-3-integration",
        papers: createWalkthroughYearPapers("level-3-integration", "int-{part}{year}.html", WALKTHROUGH_NAV_INTEGRATION_YEARS)
      },
      {
        id: "level-3-complex",
        label: "Complex Numbers",
        indexHref: "index.html#level-3-complex",
        papers: [
          createWalkthroughPaper("level-3-complex-2025", 2025, "complex-{part}2025.html")
        ].concat(createWalkthroughYearPapers("level-3-complex", "complex-{year}.html?q={part}", [2024, 2023, 2022, 2021, 2020, 2019]))
      }
    ]
  }
];

function escapeWalkthroughSidebarHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function walkthroughPartLabel(partId) {
  const value = String(partId || "");
  return value.charAt(0) + "(" + value.charAt(1) + ")";
}

function walkthroughQuestionLabel(partId) {
  return "Question " + walkthroughPartLabel(partId);
}

function getWalkthroughProgressStorage() {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

function readWalkthroughSessionProgressMap() {
  try {
    const storedProgress = window.sessionStorage.getItem(WALKTHROUGH_SESSION_PROGRESS_STORAGE_KEY);
    const parsedProgress = storedProgress ? JSON.parse(storedProgress) : {};

    return parsedProgress && typeof parsedProgress === "object" && !Array.isArray(parsedProgress)
      ? parsedProgress
      : {};
  } catch (error) {
    return {};
  }
}

function readWalkthroughProgressMap() {
  const storage = getWalkthroughProgressStorage();

  if (!storage) {
    return walkthroughProgressFallback;
  }

  try {
    const storedProgress = storage.getItem(WALKTHROUGH_PROGRESS_STORAGE_KEY);
    const parsedProgress = storedProgress ? JSON.parse(storedProgress) : readWalkthroughSessionProgressMap();

    if (parsedProgress && typeof parsedProgress === "object" && !Array.isArray(parsedProgress)) {
      walkthroughProgressFallback = parsedProgress;
      if (!storedProgress && Object.keys(parsedProgress).length) {
        writeWalkthroughProgressMap(parsedProgress);
      }
      return parsedProgress;
    }
  } catch (error) {
    return walkthroughProgressFallback;
  }

  return walkthroughProgressFallback;
}

function writeWalkthroughProgressMap(progressMap) {
  walkthroughProgressFallback = progressMap;

  const storage = getWalkthroughProgressStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(WALKTHROUGH_PROGRESS_STORAGE_KEY, JSON.stringify(progressMap));
  } catch (error) {
    // Progress indicators are optional; keep the in-memory copy when storage is unavailable.
  }
}

function getWalkthroughProgressKey(context, partId) {
  if (!context || !context.paper || !partId) {
    return "";
  }

  return context.paper.id + ":" + partId;
}

function getWalkthroughPartProgressState(context, partId) {
  const key = getWalkthroughProgressKey(context, partId);
  const progressMap = readWalkthroughProgressMap();

  return key && progressMap[key] && typeof progressMap[key] === "object"
    ? progressMap[key]
    : {};
}

function getWalkthroughPartProgressLabel(state) {
  if (state && state.completed) {
    return "Completed";
  }

  if (state && state.visited) {
    return "Visited";
  }

  return "";
}

function getWalkthroughPartProgressClass(state) {
  if (state && state.completed) {
    return " is-complete";
  }

  if (state && state.visited) {
    return " is-visited";
  }

  return "";
}

function getWalkthroughPaperProgress(context) {
  const paper = context && context.paper;
  const parts = paper && Array.isArray(paper.parts) ? paper.parts : [];
  let visited = 0;
  let completed = 0;

  parts.forEach(function (partId) {
    const state = getWalkthroughPartProgressState(context, partId);

    if (state && state.visited) {
      visited += 1;
    }
    if (state && state.completed) {
      completed += 1;
    }
  });

  return {
    visited: visited,
    completed: completed,
    total: parts.length
  };
}

function getWalkthroughPaperProgressText(progress) {
  const state = progress || {};
  const total = state.total || 0;

  return (state.completed || 0) + " of " + total + " completed";
}

function getWalkthroughPaperProgressPercent(progress) {
  const state = progress || {};

  if (!state.total) {
    return 0;
  }

  return Math.round(((state.completed || 0) / state.total) * 100);
}

function readLastWalkthrough() {
  try {
    const storedLastVisited = window.localStorage.getItem(WALKTHROUGH_LAST_VISITED_STORAGE_KEY);
    const parsedLastVisited = storedLastVisited ? JSON.parse(storedLastVisited) : null;

    if (parsedLastVisited && typeof parsedLastVisited === "object" && !Array.isArray(parsedLastVisited)) {
      walkthroughLastVisitedFallback = parsedLastVisited;
      return parsedLastVisited;
    }
  } catch (error) {
    return walkthroughLastVisitedFallback;
  }

  return walkthroughLastVisitedFallback;
}

function writeLastWalkthrough(context, partId) {
  if (!context || !context.paper || !partId) {
    return;
  }

  const href = getWalkthroughPartHref(context.paper, partId);
  const payload = {
    paperId: context.paper.id,
    partId: partId,
    href: href,
    label: context.paper.year + " " + context.standard.label + " \u00b7 " + walkthroughQuestionLabel(partId),
    levelLabel: context.level.label,
    standardLabel: context.standard.label,
    year: context.paper.year,
    questionLabel: walkthroughQuestionLabel(partId),
    updatedAt: Date.now()
  };

  walkthroughLastVisitedFallback = payload;

  try {
    window.localStorage.setItem(WALKTHROUGH_LAST_VISITED_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    // The continue card can fall back to this page's in-memory state.
  }
}

function applyWalkthroughProgressStateToLink(link, state) {
  if (!link) {
    return;
  }

  const progressLabel = getWalkthroughPartProgressLabel(state);
  const baseAriaLabel = link.dataset.baseAriaLabel || String(link.textContent || "").trim();

  link.classList.toggle("is-visited", Boolean(state && state.visited));
  link.classList.toggle("is-complete", Boolean(state && state.completed));
  link.dataset.progressState = state && state.completed
    ? "complete"
    : state && state.visited
      ? "visited"
      : "";

  if (baseAriaLabel) {
    link.setAttribute("aria-label", progressLabel ? baseAriaLabel + ", " + progressLabel.toLowerCase() : baseAriaLabel);
  }
}

function updateWalkthroughSidebarProgressIndicators(context) {
  const sidebar = document.getElementById("walkthrough-sidebar");

  if (!sidebar || !context) {
    return;
  }

  sidebar.querySelectorAll("[data-walkthrough-sidebar-part]").forEach(function (link) {
    const partId = link.dataset.walkthroughSidebarPart;
    applyWalkthroughProgressStateToLink(link, getWalkthroughPartProgressState(context, partId));
  });

  const progress = getWalkthroughPaperProgress(context);
  const progressText = sidebar.querySelector("[data-walkthrough-paper-progress-text]");
  const progressBar = sidebar.querySelector("[data-walkthrough-paper-progress-bar]");

  if (progressText) {
    progressText.textContent = getWalkthroughPaperProgressText(progress);
  }

  if (progressBar) {
    progressBar.style.width = getWalkthroughPaperProgressPercent(progress) + "%";
  }
}

function markWalkthroughPartProgress(context, partId, updates) {
  const key = getWalkthroughProgressKey(context, partId);

  if (!key) {
    return;
  }

  const progressMap = Object.assign({}, readWalkthroughProgressMap());
  const currentState = Object.assign({}, progressMap[key] || {});
  const now = String(Date.now());

  if (updates && updates.visited) {
    currentState.visited = true;
    currentState.visitedAt = currentState.visitedAt || now;
  }

  if (updates && updates.completed) {
    currentState.visited = true;
    currentState.completed = true;
    currentState.completedAt = now;
  }

  progressMap[key] = currentState;
  writeWalkthroughProgressMap(progressMap);
  if (updates && updates.visited) {
    writeLastWalkthrough(context, partId);
  }
  updateWalkthroughSidebarProgressIndicators(context);
}

function markCurrentWalkthroughPartComplete() {
  const context = window.__walkthroughCurrentContext || findCurrentWalkthroughContext(window.__walkthroughCurrentConfig);

  if (context) {
    markWalkthroughPartProgress(context, context.partId, { visited: true, completed: true });
  }
}

function getWalkthroughPartHref(paper, partId) {
  if (!paper || !partId) {
    return "";
  }

  const targetPart = paper.parts.indexOf(partId) >= 0 ? partId : paper.parts[0];
  return paper.routeTemplate.replace(/\{part\}/g, encodeURIComponent(targetPart));
}

function getWalkthroughPaperStartHref(paper, preferredPart) {
  if (!paper || !paper.parts.length) {
    return "";
  }

  const partId = paper.parts.indexOf(preferredPart) >= 0 ? preferredPart : paper.parts[0];
  return getGuidedWalkthroughHref(getWalkthroughPartHref(paper, partId));
}

function getWalkthroughFileName(pathname) {
  const parts = String(pathname || "").split("/");
  return parts[parts.length - 1] || "index.html";
}

function walkthroughPaperUsesQuery(paper) {
  return Boolean(paper && /\?q=\{part\}/.test(paper.routeTemplate));
}

function currentLocationMatchesWalkthroughPart(paper, partId) {
  if (!paper || !partId) {
    return false;
  }

  const targetUrl = new URL(getWalkthroughPartHref(paper, partId), window.location.href);
  const currentFileName = getWalkthroughFileName(window.location.pathname);
  const targetFileName = getWalkthroughFileName(targetUrl.pathname);

  if (currentFileName !== targetFileName) {
    return false;
  }

  if (walkthroughPaperUsesQuery(paper)) {
    const currentPart = new URLSearchParams(window.location.search).get("q") || paper.parts[0];
    return currentPart === partId;
  }

  return true;
}

function getWalkthroughCatalogEntries() {
  const entries = [];

  WALKTHROUGH_NAV_CATALOG.forEach(function (level) {
    level.standards.forEach(function (standard) {
      standard.papers.forEach(function (paper) {
        entries.push({
          level: level,
          standard: standard,
          paper: paper
        });
      });
    });
  });

  return entries;
}

function findWalkthroughPaperById(paperId) {
  return getWalkthroughCatalogEntries().find(function (entry) {
    return entry.paper.id === paperId;
  }) || null;
}

function findWalkthroughPaperByBackHref(backHref) {
  if (!backHref) {
    return null;
  }

  const hash = new URL(backHref, window.location.href).hash.replace(/^#/, "");
  return hash ? findWalkthroughPaperById(hash) : null;
}

function getWalkthroughPartFromText(value) {
  const match = String(value || "").match(/Question\s+([123])\s*\(?([a-e])\)?|([123])\s*\(([a-e])\)/i);

  if (!match) {
    return null;
  }

  return (match[1] || match[3]) + (match[2] || match[4]).toLowerCase();
}

function findCurrentWalkthroughContext(config) {
  const entries = getWalkthroughCatalogEntries();

  for (let entryIndex = 0; entryIndex < entries.length; entryIndex += 1) {
    const entry = entries[entryIndex];

    for (let partIndex = 0; partIndex < entry.paper.parts.length; partIndex += 1) {
      const partId = entry.paper.parts[partIndex];

      if (currentLocationMatchesWalkthroughPart(entry.paper, partId)) {
        return Object.assign({ partId: partId }, entry);
      }
    }
  }

  const backHref = config && config.backHref
    ? config.backHref
    : (document.getElementById("back-link") || document.querySelector(".topbar .ghost-link") || {}).href;
  const paperEntry = findWalkthroughPaperByBackHref(backHref);
  const titleText = config && config.title
    ? config.title
    : (document.getElementById("page-title") || document.querySelector(".topbar h1") || {}).textContent;
  const partId = getWalkthroughPartFromText(titleText);

  if (paperEntry && partId && paperEntry.paper.parts.indexOf(partId) >= 0) {
    return Object.assign({ partId: partId }, paperEntry);
  }

  return null;
}

function escapeWalkthroughRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getWalkthroughHeaderTitle(context) {
  if (!context) {
    return "";
  }

  return context.paper.year + " " + context.standard.label + " \u00b7 " + walkthroughQuestionLabel(context.partId);
}

function getWalkthroughHeaderSubtitle(context, sourceSubtitle) {
  if (!context) {
    return String(sourceSubtitle || "").trim();
  }

  const source = String(sourceSubtitle || "").trim();
  const year = String(context.paper.year);
  const standard = context.standard.label;
  const base = context.level.label + " " + standard;
  const separatorPattern = "(?:\\s*(?:-|\\u2013|\\u2014)\\s*)?";
  let detail = source
    .replace(new RegExp("^" + escapeWalkthroughRegExp(year) + "\\s+Paper" + separatorPattern, "i"), "")
    .replace(new RegExp("^" + escapeWalkthroughRegExp(year) + "\\s+" + escapeWalkthroughRegExp(standard) + separatorPattern, "i"), "")
    .trim();

  if (!detail || /^paper$/i.test(detail)) {
    return base + " walkthrough";
  }

  return base + " \u00b7 " + detail;
}

function syncWalkthroughPageHeaderContext(context, config) {
  const app = document.querySelector("main.app:not(.home-app)");
  const pageTitle = document.getElementById("page-title") || (app && app.querySelector(".topbar h1"));
  const subtitle = document.getElementById("page-subtitle") || (app && app.querySelector(".topbar .subtitle"));

  if (pageTitle && !pageTitle.dataset.walkthroughOriginalTitle) {
    pageTitle.dataset.walkthroughOriginalTitle = pageTitle.textContent || "";
  }

  if (subtitle && !subtitle.dataset.walkthroughOriginalSubtitle) {
    subtitle.dataset.walkthroughOriginalSubtitle = subtitle.textContent || "";
  }

  if (pageTitle) {
    pageTitle.textContent = getWalkthroughHeaderTitle(context) || pageTitle.textContent;
  }

  if (subtitle) {
    subtitle.textContent = getWalkthroughHeaderSubtitle(
      context,
      config && config.subtitle ? config.subtitle : subtitle.dataset.walkthroughOriginalSubtitle
    );
  }
}

function getWalkthroughSidebarStoredPreference() {
  try {
    const storedPreference = window.localStorage.getItem(WALKTHROUGH_SIDEBAR_STORAGE_KEY);

    if (storedPreference === "true" || storedPreference === "false") {
      walkthroughSidebarPreferenceFallback = storedPreference === "true";
      return walkthroughSidebarPreferenceFallback;
    }
  } catch (error) {
    return walkthroughSidebarPreferenceFallback;
  }

  return walkthroughSidebarPreferenceFallback;
}

function setWalkthroughSidebarStoredPreference(isVisible) {
  walkthroughSidebarPreferenceFallback = isVisible;

  try {
    window.localStorage.setItem(WALKTHROUGH_SIDEBAR_STORAGE_KEY, isVisible ? "true" : "false");
  } catch (error) {
    // The current page still reflects the preference when storage is unavailable.
  }
}

function isWalkthroughSidebarDesktop() {
  return typeof window.matchMedia !== "function"
    || window.matchMedia("(min-width: 981px)").matches;
}

function shouldShowWalkthroughSidebarByDefault() {
  if (!isWalkthroughSidebarDesktop()) {
    return false;
  }

  const storedPreference = getWalkthroughSidebarStoredPreference();
  return storedPreference === null ? true : storedPreference;
}

function setWalkthroughSidebarInteractivity(sidebar, isVisible) {
  if (!sidebar) {
    return;
  }

  sidebar.setAttribute("aria-hidden", isVisible ? "false" : "true");

  if ("inert" in sidebar) {
    sidebar.inert = !isVisible;
    return;
  }

  sidebar.querySelectorAll("a, button").forEach(function (control) {
    if (!control.dataset.originalTabIndex && control.hasAttribute("tabindex")) {
      control.dataset.originalTabIndex = control.getAttribute("tabindex");
    }

    if (isVisible) {
      if (control.dataset.originalTabIndex) {
        control.setAttribute("tabindex", control.dataset.originalTabIndex);
      } else {
        control.removeAttribute("tabindex");
      }
    } else {
      control.setAttribute("tabindex", "-1");
    }
  });
}

function setWalkthroughSidebarVisible(isVisible, options) {
  const settings = options || {};
  const body = document.body;
  const sidebar = document.getElementById("walkthrough-sidebar");
  const openToggle = document.getElementById("walkthrough-sidebar-open-toggle");
  const closeToggle = document.getElementById("walkthrough-sidebar-close-toggle");
  const backdrop = document.getElementById("walkthrough-sidebar-backdrop");

  if (!body || !sidebar) {
    return;
  }

  if (settings.persist) {
    setWalkthroughSidebarStoredPreference(isVisible);
  }

  body.classList.toggle("walkthrough-nav-visible", isVisible);
  body.classList.toggle("walkthrough-nav-hidden", !isVisible);
  body.classList.toggle("walkthrough-nav-mobile-open", isVisible && !isWalkthroughSidebarDesktop());
  setWalkthroughSidebarInteractivity(sidebar, isVisible);

  if (openToggle) {
    openToggle.hidden = isVisible;
    openToggle.setAttribute("aria-expanded", isVisible ? "true" : "false");
    openToggle.textContent = "Show navigation";
    openToggle.setAttribute("aria-label", "Show navigation");
  }

  if (closeToggle) {
    closeToggle.setAttribute("aria-expanded", isVisible ? "true" : "false");
    closeToggle.textContent = "Hide navigation";
    closeToggle.setAttribute("aria-label", "Hide navigation");
  }

  if (backdrop) {
    backdrop.hidden = !isVisible || isWalkthroughSidebarDesktop();
  }
}

function syncWalkthroughSidebarState() {
  setWalkthroughSidebarVisible(shouldShowWalkthroughSidebarByDefault(), { persist: false });
}

function isWalkthroughShortcutSuppressed(event) {
  const target = event && event.target;

  if (!event || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
    return true;
  }

  if (!target || typeof target.closest !== "function") {
    return false;
  }

  return Boolean(target.closest("input, textarea, select, button, a, [contenteditable='true'], [role='button'], [role='link']"));
}

function getCurrentWalkthroughContext() {
  return window.__walkthroughCurrentContext || findCurrentWalkthroughContext(window.__walkthroughCurrentConfig);
}

function getAdjacentWalkthroughPartHref(offset) {
  const context = getCurrentWalkthroughContext();

  if (!context || !context.paper || !Array.isArray(context.paper.parts)) {
    return "";
  }

  const currentIndex = context.paper.parts.indexOf(context.partId);
  if (currentIndex < 0) {
    return "";
  }

  const targetPart = context.paper.parts[currentIndex + offset];

  return targetPart ? getGuidedWalkthroughHref(getWalkthroughPartHref(context.paper, targetPart)) : "";
}

function navigateAdjacentWalkthroughPart(offset) {
  const href = getAdjacentWalkthroughPartHref(offset);

  if (!href) {
    return false;
  }

  window.location.href = href;
  return true;
}

function toggleCurrentWalkthroughWorking() {
  const currentProgressiveStep = document.querySelector(".walkthrough-step-card:not(.hidden)");
  const progressiveButton = currentProgressiveStep && currentProgressiveStep.querySelector(".step-working-btn");

  if (progressiveButton) {
    progressiveButton.click();
    return true;
  }

  const currentLegacyStep = document.querySelector(".legacy-managed-step:not(.hidden)");
  const legacyButton = currentLegacyStep && currentLegacyStep.querySelector(".legacy-working-toggle");

  if (legacyButton) {
    legacyButton.click();
    return true;
  }

  return false;
}

function ensureWalkthroughLayout(app) {
  if (!app || app.closest(".walkthrough-layout")) {
    return app ? app.closest(".walkthrough-layout") : null;
  }

  const layout = document.createElement("div");
  layout.id = "walkthrough-layout";
  layout.className = "walkthrough-layout";
  app.parentNode.insertBefore(layout, app);
  layout.appendChild(app);
  app.classList.add("walkthrough-main");

  return layout;
}

function ensureWalkthroughSidebarToggle(app) {
  let openToggle = document.getElementById("walkthrough-sidebar-open-toggle");

  if (!openToggle) {
    openToggle = document.createElement("button");
    openToggle.id = "walkthrough-sidebar-open-toggle";
    openToggle.className = "ghost-link walkthrough-sidebar-toggle walkthrough-sidebar-open-toggle";
    openToggle.type = "button";
    openToggle.textContent = "Show navigation";
    openToggle.setAttribute("aria-controls", "walkthrough-sidebar");
    openToggle.setAttribute("aria-expanded", "false");
    openToggle.setAttribute("aria-label", "Show navigation");
    openToggle.addEventListener("click", function () {
      setWalkthroughSidebarVisible(true, { persist: true });
    });
  }

  const topbar = app ? app.querySelector(".topbar") : null;

  if (!topbar) {
    if (app && openToggle.parentNode !== app) {
      app.insertBefore(openToggle, app.firstChild);
    }
    return openToggle;
  }

  let actions = topbar.querySelector(".walkthrough-topbar-actions");

  if (!actions) {
    actions = document.createElement("div");
    actions.className = "walkthrough-topbar-actions";

    Array.from(topbar.children).forEach(function (child) {
      if (child.matches(".ghost-link") || child.id === "back-link") {
        actions.appendChild(child);
      }
    });

    topbar.appendChild(actions);
  }

  if (!actions.contains(openToggle)) {
    actions.appendChild(openToggle);
  }

  return openToggle;
}

function renderWalkthroughSidebarLink(item) {
  const current = item.current ? ' aria-current="' + (item.currentValue || "location") + '"' : "";
  const progressLabel = getWalkthroughPartProgressLabel(item.progressState);
  const baseAriaLabel = item.ariaLabel || item.label;
  const className = "walkthrough-sidebar-link"
    + (item.current ? " is-current" : "")
    + getWalkthroughPartProgressClass(item.progressState);
  const ariaLabel = (item.ariaLabel || progressLabel)
    ? ' aria-label="' + escapeWalkthroughSidebarHtml(baseAriaLabel + (progressLabel ? ", " + progressLabel.toLowerCase() : "")) + '"'
    : "";
  const partAttributes = item.partId
    ? ' data-walkthrough-sidebar-part="' + escapeWalkthroughSidebarHtml(item.partId) + '"'
      + ' data-base-aria-label="' + escapeWalkthroughSidebarHtml(baseAriaLabel) + '"'
      + ' data-progress-state="' + escapeWalkthroughSidebarHtml(item.progressState && item.progressState.completed ? "complete" : item.progressState && item.progressState.visited ? "visited" : "") + '"'
    : "";

  return `<a class="${className}" href="${escapeWalkthroughSidebarHtml(item.href)}"${current}${ariaLabel}${partAttributes} data-close-walkthrough-sidebar>${escapeWalkthroughSidebarHtml(item.label)}</a>`;
}

function renderWalkthroughPartGroups(context) {
  const groups = [];

  context.paper.parts.forEach(function (partId) {
    const questionNumber = partId.charAt(0);
    let group = groups.find(function (existingGroup) {
      return existingGroup.questionNumber === questionNumber;
    });

    if (!group) {
      group = {
        questionNumber: questionNumber,
        parts: []
      };
      groups.push(group);
    }

    group.parts.push(partId);
  });

  return groups.map(function (group) {
    return `
      <div class="walkthrough-sidebar-question-group">
        <p class="walkthrough-sidebar-question-label">Question ${escapeWalkthroughSidebarHtml(group.questionNumber)}</p>
        <div class="walkthrough-sidebar-part-grid">
          ${group.parts.map(function (partId) {
            const current = partId === context.partId;
            const href = getGuidedWalkthroughHref(getWalkthroughPartHref(context.paper, partId));
            return renderWalkthroughSidebarLink({
              href: href,
              label: walkthroughPartLabel(partId),
              partId: partId,
              progressState: getWalkthroughPartProgressState(context, partId),
              current: current,
              currentValue: "page",
              ariaLabel: walkthroughQuestionLabel(partId) + ", " + context.paper.year + " " + context.standard.label
            });
          }).join("")}
        </div>
      </div>
    `;
  }).join("");
}

function buildWalkthroughSidebarHtml(context) {
  const paperProgress = getWalkthroughPaperProgress(context);
  const levelLinks = WALKTHROUGH_NAV_CATALOG.map(function (level) {
    return renderWalkthroughSidebarLink({
      href: level.indexHref,
      label: level.label,
      current: level.id === context.level.id
    });
  }).join("");
  const standardLinks = context.level.standards.map(function (standard) {
    return renderWalkthroughSidebarLink({
      href: standard.indexHref,
      label: standard.label,
      current: standard.id === context.standard.id
    });
  }).join("");
  const paperLinks = context.standard.papers.map(function (paper) {
    return renderWalkthroughSidebarLink({
      href: getWalkthroughPaperStartHref(paper, context.partId),
      label: String(paper.year),
      current: paper.id === context.paper.id,
      ariaLabel: paper.year + " " + context.standard.label + " paper"
    });
  }).join("");

  return `
    <div class="walkthrough-sidebar-header">
      <div class="walkthrough-sidebar-header-copy">
        <p class="question-label">Navigation</p>
        <p class="walkthrough-sidebar-current">${escapeWalkthroughSidebarHtml(context.level.label)} &middot; ${escapeWalkthroughSidebarHtml(context.standard.label)} &middot; ${escapeWalkthroughSidebarHtml(String(context.paper.year))}</p>
        <div class="walkthrough-sidebar-progress" aria-label="Paper progress">
          <p class="walkthrough-sidebar-progress-text" data-walkthrough-paper-progress-text>${escapeWalkthroughSidebarHtml(getWalkthroughPaperProgressText(paperProgress))}</p>
          <div class="walkthrough-sidebar-progress-track" aria-hidden="true">
            <span class="walkthrough-sidebar-progress-bar" data-walkthrough-paper-progress-bar style="width: ${getWalkthroughPaperProgressPercent(paperProgress)}%"></span>
          </div>
        </div>
      </div>
      <button
        id="walkthrough-sidebar-close-toggle"
        class="ghost-link walkthrough-sidebar-toggle walkthrough-sidebar-close-toggle"
        type="button"
        aria-controls="walkthrough-sidebar"
        aria-expanded="true"
        aria-label="Hide navigation"
      >
        Hide navigation
      </button>
    </div>
    <nav class="walkthrough-sidebar-nav" aria-label="Walkthrough navigation">
      <section class="walkthrough-sidebar-section" aria-labelledby="walkthrough-nav-level">
        <p id="walkthrough-nav-level" class="walkthrough-sidebar-section-title">Level</p>
        <div class="walkthrough-sidebar-link-list">${levelLinks}</div>
      </section>
      <section class="walkthrough-sidebar-section" aria-labelledby="walkthrough-nav-standard">
        <p id="walkthrough-nav-standard" class="walkthrough-sidebar-section-title">Standard</p>
        <div class="walkthrough-sidebar-link-list">${standardLinks}</div>
      </section>
      <section class="walkthrough-sidebar-section" aria-labelledby="walkthrough-nav-paper">
        <p id="walkthrough-nav-paper" class="walkthrough-sidebar-section-title">Year</p>
        <div class="walkthrough-sidebar-year-list">${paperLinks}</div>
      </section>
      <section class="walkthrough-sidebar-section" aria-labelledby="walkthrough-nav-parts">
        <p id="walkthrough-nav-parts" class="walkthrough-sidebar-section-title">Questions</p>
        ${renderWalkthroughPartGroups(context)}
      </section>
    </nav>
  `;
}

function ensureWalkthroughSidebar(config) {
  const app = document.querySelector("main.app:not(.home-app)");
  const context = findCurrentWalkthroughContext(config);

  if (!app || !context) {
    return false;
  }

  window.__walkthroughCurrentConfig = config || null;
  window.__walkthroughCurrentContext = context;
  markWalkthroughPartProgress(context, context.partId, { visited: true });
  syncWalkthroughPageHeaderContext(context, config);

  const layout = ensureWalkthroughLayout(app);
  let sidebar = document.getElementById("walkthrough-sidebar");

  if (!sidebar) {
    sidebar = document.createElement("aside");
    sidebar.id = "walkthrough-sidebar";
    sidebar.className = "walkthrough-sidebar";
    sidebar.setAttribute("aria-label", "Walkthrough navigation");
    layout.insertBefore(sidebar, app);
  }

  sidebar.innerHTML = buildWalkthroughSidebarHtml(context);

  let backdrop = document.getElementById("walkthrough-sidebar-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("button");
    backdrop.id = "walkthrough-sidebar-backdrop";
    backdrop.className = "walkthrough-sidebar-backdrop";
    backdrop.type = "button";
    backdrop.hidden = true;
    backdrop.setAttribute("aria-label", "Close navigation");
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", function () {
      setWalkthroughSidebarVisible(false, { persist: true });
    });
  }

  ensureWalkthroughSidebarToggle(app);
  syncWalkthroughSidebarState();

  if (sidebar.dataset.sidebarSetup !== "true") {
    sidebar.dataset.sidebarSetup = "true";
    sidebar.addEventListener("click", function (event) {
      const closeToggle = event.target.closest("#walkthrough-sidebar-close-toggle");
      if (closeToggle) {
        setWalkthroughSidebarVisible(false, { persist: true });
        const openToggle = document.getElementById("walkthrough-sidebar-open-toggle");
        if (openToggle) {
          openToggle.focus();
        }
        return;
      }

      const link = event.target.closest("[data-close-walkthrough-sidebar]");
      if (link && !isWalkthroughSidebarDesktop()) {
        setWalkthroughSidebarVisible(false, { persist: true });
      }
    });
  }

  if (document.body.dataset.walkthroughSidebarSetup !== "true") {
    document.body.dataset.walkthroughSidebarSetup = "true";
    window.addEventListener("resize", syncWalkthroughSidebarState);
    document.addEventListener("keydown", function (event) {
      if (!event.defaultPrevented && event.key === "Escape" && document.body.classList.contains("walkthrough-nav-visible")) {
        setWalkthroughSidebarVisible(false, { persist: true });
        const openToggle = document.getElementById("walkthrough-sidebar-open-toggle");
        if (openToggle) {
          openToggle.focus();
        }
        event.preventDefault();
        return;
      }

      if (isWalkthroughShortcutSuppressed(event)) {
        return;
      }

      if (event.key === "ArrowLeft" && navigateAdjacentWalkthroughPart(-1)) {
        event.preventDefault();
        return;
      }

      if (event.key === "ArrowRight" && navigateAdjacentWalkthroughPart(1)) {
        event.preventDefault();
        return;
      }

      if ((event.key === " " || event.key === "Spacebar" || event.code === "Space") && toggleCurrentWalkthroughWorking()) {
        event.preventDefault();
      }
    });
  }

  return true;
}

function renderPartNavigation(config, questionCard) {
  const items = config && Array.isArray(config.partNavigation)
    ? config.partNavigation
    : [];
  let navigation = document.getElementById("walkthrough-part-navigation");

  if (!items.length || !questionCard || !questionCard.parentNode) {
    if (navigation) {
      navigation.remove();
    }
    return;
  }

  if (!navigation) {
    navigation = document.createElement("nav");
    navigation.id = "walkthrough-part-navigation";
    navigation.className = "question-card walkthrough-part-navigation";
    navigation.setAttribute("aria-label", config.partNavigationLabel || "Paper questions");
    questionCard.parentNode.insertBefore(navigation, questionCard);
  }

  navigation.innerHTML = `
    <p class="question-label">${config.partNavigationTitle || "2020 paper questions"}</p>
    <div class="paper-part-nav">
      ${items.map(function (item) {
        const current = item.current ? ' aria-current="page"' : "";
        return `<a class="nav-btn secondary" href="${getGuidedWalkthroughHref(item.href)}"${current}>${item.label}</a>`;
      }).join("")}
    </div>
  `;
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

function getWalkthroughExamModePreference() {
  try {
    const storedPreference = window.localStorage.getItem(WALKTHROUGH_EXAM_MODE_STORAGE_KEY);

    if (storedPreference === "true" || storedPreference === "false") {
      walkthroughExamModeFallback = storedPreference === "true";
      return walkthroughExamModeFallback;
    }
  } catch (error) {
    return walkthroughExamModeFallback;
  }

  return walkthroughExamModeFallback;
}

function setWalkthroughExamModePreference(enabled) {
  walkthroughExamModeFallback = Boolean(enabled);

  try {
    window.localStorage.setItem(WALKTHROUGH_EXAM_MODE_STORAGE_KEY, enabled ? "true" : "false");
  } catch (error) {
    // The page still follows the preference for this visit when storage is unavailable.
  }
}

function ensureExamModeSettingControl(questionCard) {
  const app = document.querySelector("main.app:not(.home-app)");

  if (!app || !questionCard) {
    return null;
  }

  const setting = document.getElementById("sticky-question-setting-panel")
    || ensureStickyQuestionPreferenceControl(questionCard);

  if (!setting) {
    return null;
  }

  let examSetting = document.getElementById("exam-mode-setting");

  if (!examSetting) {
    const wrapper = document.createElement("span");
    wrapper.className = "walkthrough-setting-divider";
    wrapper.setAttribute("aria-hidden", "true");
    wrapper.textContent = "";
    setting.appendChild(wrapper);

    const label = document.createElement("label");
    label.className = "walkthrough-setting-toggle";
    label.setAttribute("for", "exam-mode-setting");
    label.innerHTML = `
      <input id="exam-mode-setting" type="checkbox" />
      <span class="walkthrough-setting-switch" aria-hidden="true"></span>
      <span class="walkthrough-setting-label">Exam mode</span>
    `;
    setting.appendChild(label);

    const status = document.createElement("span");
    status.id = "exam-mode-setting-status";
    status.className = "walkthrough-setting-status exam-mode-setting-status";
    status.setAttribute("aria-live", "polite");
    setting.appendChild(status);
    examSetting = label.querySelector("#exam-mode-setting");
  }

  return examSetting;
}

function setupExamModeControls(options) {
  const settings = options || {};
  const questionCard = settings.questionCard;
  const hiddenElements = (settings.hiddenElements || []).filter(Boolean);

  if (!questionCard || questionCard.dataset.examModeSetup === "true") {
    return;
  }

  const checkbox = ensureExamModeSettingControl(questionCard);
  const parent = questionCard.parentNode;

  if (!checkbox || !parent) {
    return;
  }

  let revealPanel = document.getElementById("walkthrough-exam-mode-reveal-panel");

  if (!revealPanel) {
    revealPanel = document.createElement("section");
    revealPanel.id = "walkthrough-exam-mode-reveal-panel";
    revealPanel.className = "question-card exam-mode-reveal-panel";
    revealPanel.innerHTML = `
      <p class="question-label">Exam Mode</p>
      <h2>Attempt the question first</h2>
      <p class="step-text">The walkthrough is hidden until you are ready to check your thinking.</p>
      <div class="nav-row exam-mode-actions">
        <button id="exam-mode-reveal-btn" class="nav-btn" type="button">Reveal walkthrough</button>
        <button id="exam-mode-off-btn" class="nav-btn secondary" type="button">Turn off exam mode</button>
      </div>
    `;
  }

  if (questionCard.nextElementSibling !== revealPanel) {
    parent.insertBefore(revealPanel, questionCard.nextSibling);
  }

  const status = document.getElementById("exam-mode-setting-status");
  const revealButton = revealPanel.querySelector("#exam-mode-reveal-btn");
  const offButton = revealPanel.querySelector("#exam-mode-off-btn");
  let revealedForThisQuestion = false;

  function applyExamModeState() {
    const isEnabled = getWalkthroughExamModePreference();
    const shouldHideWalkthrough = isEnabled && !revealedForThisQuestion;

    checkbox.checked = isEnabled;
    document.body.classList.toggle("exam-mode-active", shouldHideWalkthrough);
    revealPanel.hidden = !shouldHideWalkthrough;

    hiddenElements.forEach(function (element) {
      element.classList.toggle("exam-mode-hidden", shouldHideWalkthrough);
      if (shouldHideWalkthrough) {
        element.setAttribute("aria-hidden", "true");
      } else if (!element.classList.contains("hidden") && !element.hidden) {
        element.setAttribute("aria-hidden", "false");
      }
    });

    if (status) {
      status.textContent = !isEnabled
        ? "Off. Walkthroughs reveal normally."
        : revealedForThisQuestion
          ? "Revealed for this question. Future questions still start hidden."
          : "On. Walkthrough hidden until you reveal it.";
    }
  }

  checkbox.dataset.preferenceSetup = "true";
  checkbox.checked = getWalkthroughExamModePreference();
  checkbox.addEventListener("change", function () {
    revealedForThisQuestion = false;
    setWalkthroughExamModePreference(checkbox.checked);
    applyExamModeState();
  });

  if (revealButton) {
    revealButton.addEventListener("click", function () {
      revealedForThisQuestion = true;
      applyExamModeState();
      if (typeof settings.onReveal === "function") {
        settings.onReveal();
        applyExamModeState();
      }
    });
  }

  if (offButton) {
    offButton.addEventListener("click", function () {
      revealedForThisQuestion = true;
      setWalkthroughExamModePreference(false);
      applyExamModeState();
      checkbox.focus();
    });
  }

  questionCard.dataset.examModeSetup = "true";
  applyExamModeState();
}

function ensureQuestionImageLightbox() {
  let lightbox = document.getElementById("question-image-lightbox");

  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.id = "question-image-lightbox";
    lightbox.className = "question-image-lightbox";
    lightbox.hidden = true;
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Question image preview");
    lightbox.innerHTML = `
      <button class="question-image-lightbox-close" type="button" aria-label="Close image preview">Close</button>
      <div class="question-image-lightbox-stage">
        <img class="question-image-lightbox-img" alt="" />
        <div class="question-image-lightbox-graphic" hidden></div>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  if (lightbox.dataset.lightboxSetup !== "true") {
    lightbox.dataset.lightboxSetup = "true";
    const closeButton = lightbox.querySelector(".question-image-lightbox-close");

    function closeLightbox() {
      const previousFocus = lightbox._previousQuestionFocus;
      lightbox.hidden = true;
      document.body.classList.remove("question-image-lightbox-open");

      const image = lightbox.querySelector(".question-image-lightbox-img");
      const graphic = lightbox.querySelector(".question-image-lightbox-graphic");
      if (image) {
        image.removeAttribute("src");
        image.alt = "";
      }
      if (graphic) {
        graphic.innerHTML = "";
        graphic.hidden = true;
      }

      lightbox._previousQuestionFocus = null;
      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
    }

    lightbox._closeQuestionImageLightbox = closeLightbox;

    if (closeButton) {
      closeButton.addEventListener("click", closeLightbox);
    }

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (!lightbox.hidden && event.key === "Escape") {
        closeLightbox();
      }
    });
  }

  return lightbox;
}

function openQuestionImageLightbox(target) {
  const lightbox = ensureQuestionImageLightbox();
  const closeButton = lightbox.querySelector(".question-image-lightbox-close");
  const image = lightbox.querySelector(".question-image-lightbox-img");
  const graphic = lightbox.querySelector(".question-image-lightbox-graphic");

  if (!target || !lightbox || !image || !graphic) {
    return;
  }

  lightbox._previousQuestionFocus = target;
  graphic.innerHTML = "";
  graphic.hidden = true;
  image.hidden = false;

  if (target.tagName === "IMG") {
    image.src = target.currentSrc || target.src;
    image.alt = target.alt || "Question image";
  } else {
    const clone = target.cloneNode(true);
    clone.removeAttribute("id");
    image.hidden = true;
    image.removeAttribute("src");
    image.alt = "";
    graphic.hidden = false;
    graphic.appendChild(clone);
  }

  lightbox.hidden = false;
  document.body.classList.add("question-image-lightbox-open");

  if (closeButton) {
    closeButton.focus();
  }
}

function setupQuestionImageZoom(root) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }

  const targets = Array.from(root.querySelectorAll("img.question-screenshot, .question-prompt img, .paper-question-prompt img, .question-graph-frame, .question-card .graph-frame"));

  targets.forEach(function (target) {
    if (target.dataset.imageZoomSetup === "true") {
      return;
    }

    target.dataset.imageZoomSetup = "true";
    target.classList.add("question-image-zoomable");
    target.setAttribute("role", "button");
    target.setAttribute("tabindex", "0");
    target.setAttribute("aria-label", target.getAttribute("aria-label") || "Open larger view");
    target.addEventListener("click", function () {
      openQuestionImageLightbox(target);
    });
    target.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        openQuestionImageLightbox(target);
      }
    });
  });
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

function attachLegacySingleStepNavigation(walkthroughContent, options) {
  if (!walkthroughContent || walkthroughContent.dataset.singleStepSetup === "true") {
    return;
  }

  const stepCards = Array.from(walkthroughContent.querySelectorAll(":scope > .step-card"));
  if (!stepCards.length) {
    return;
  }

  const settings = options || {};
  walkthroughContent.dataset.singleStepSetup = "true";
  let currentStepIndex = Math.max(stepCards.findIndex(function (stepCard) {
    return !stepCard.classList.contains("hidden");
  }), 0);

  function moveToStep(stepCard, shouldFocus) {
    if (!stepCard) {
      return;
    }

    const heading = stepCard.querySelector(":scope > h2");
    if (heading && !heading.hasAttribute("tabindex")) {
      heading.setAttribute("tabindex", "-1");
    }

    window.setTimeout(function () {
      window.scrollTo({
        top: getWalkthroughPageScrollTop(stepCard),
        behavior: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth"
      });

      if (shouldFocus && heading) {
        try {
          heading.focus({ preventScroll: true });
        } catch (error) {
          heading.focus();
        }
      }
    }, 0);
  }

  function showStep(stepIndex, shouldMove) {
    if (stepIndex < 0 || stepIndex >= stepCards.length) {
      return;
    }

    currentStepIndex = stepIndex;
    stepCards.forEach(function (stepCard, index) {
      const isCurrent = index === currentStepIndex;
      stepCard.classList.toggle("hidden", !isCurrent);
      stepCard.setAttribute("aria-hidden", isCurrent ? "false" : "true");

      const previousButton = stepCard.querySelector("[data-legacy-previous-step]");
      if (previousButton) {
        previousButton.disabled = index === 0;
      }
    });

    if (shouldMove !== false) {
      moveToStep(stepCards[currentStepIndex], true);
    }
  }

  stepCards.forEach(function (stepCard, stepIndex) {
    const stepLabel = stepCard.querySelector(":scope > .step-number");
    const heading = stepCard.querySelector(":scope > h2");
    const originalChildren = Array.from(stepCard.children);
    const workingPanel = document.createElement("div");
    const workingActions = document.createElement("div");
    const workingButton = document.createElement("button");
    const navigation = document.createElement("nav");
    const previousButton = document.createElement("button");
    const progress = document.createElement("span");

    stepCard.classList.add("legacy-managed-step");
    stepCard.setAttribute("aria-hidden", stepIndex === currentStepIndex ? "false" : "true");

    workingPanel.className = "legacy-step-working hidden";
    workingPanel.id = "legacy-step-working-" + (stepIndex + 1);
    originalChildren.forEach(function (child) {
      if (child !== stepLabel && child !== heading) {
        workingPanel.appendChild(child);
      }
    });

    workingActions.className = "walkthrough-step-actions legacy-working-actions";
    workingButton.className = "nav-btn secondary legacy-working-toggle";
    workingButton.type = "button";
    workingButton.textContent = "Show working";
    workingButton.setAttribute("aria-controls", workingPanel.id);
    workingButton.setAttribute("aria-expanded", "false");
    workingButton.addEventListener("click", function () {
      const shouldShow = workingPanel.classList.contains("hidden");
      workingPanel.classList.toggle("hidden", !shouldShow);
      workingPanel.classList.toggle("is-visible", shouldShow);
      stepCard.dataset.workingVisible = shouldShow ? "true" : "false";
      workingButton.textContent = shouldShow ? "Hide working" : "Show working";
      workingButton.setAttribute("aria-expanded", shouldShow ? "true" : "false");

      if (shouldShow) {
        moveToStep(stepCard, false);
      }
    });
    workingActions.appendChild(workingButton);

    navigation.className = "legacy-step-navigation";
    navigation.setAttribute("aria-label", "Walkthrough step navigation");
    previousButton.className = "nav-btn secondary legacy-previous-btn";
    previousButton.type = "button";
    previousButton.dataset.legacyPreviousStep = String(stepIndex - 1);
    previousButton.textContent = "← Previous step";
    previousButton.disabled = stepIndex === 0;
    previousButton.addEventListener("click", function () {
      showStep(stepIndex - 1);
    });
    progress.className = "legacy-step-progress";
    progress.textContent = "Step " + (stepIndex + 1) + " of " + stepCards.length;

    navigation.appendChild(previousButton);
    navigation.appendChild(progress);

    const originalNextButton = workingPanel.querySelector(".next-step-btn");
    if (originalNextButton) {
      originalNextButton.classList.remove("hidden");
      originalNextButton.textContent = "Next step →";
      originalNextButton.removeAttribute("onclick");
      originalNextButton.addEventListener("click", function () {
        showStep(stepIndex + 1);
      });
      navigation.appendChild(originalNextButton);
    } else if (stepIndex === stepCards.length - 1 && typeof settings.onComplete === "function") {
      const completeButton = document.createElement("button");
      completeButton.className = "nav-btn legacy-complete-btn";
      completeButton.type = "button";
      completeButton.textContent = "Show final answer";
      completeButton.addEventListener("click", settings.onComplete);
      navigation.appendChild(completeButton);
    }

    stepCard.appendChild(workingActions);
    stepCard.appendChild(workingPanel);
    stepCard.appendChild(navigation);
  });

  window.showOnlyStep = function showManagedLegacyStep(stepId) {
    const stepIndex = stepCards.findIndex(function (stepCard) {
      return stepCard.id === stepId;
    });
    showStep(stepIndex);
  };

  carryGuidedModeToQuestionLinks(walkthroughContent);
  showStep(currentStepIndex, false);
}

function initializeWalkthroughGate(config) {
  ensureSiteHeader();
  ensureWalkthroughSidebar(config);

  const hintsCard = document.getElementById("hints-card");
  const walkthroughContent = document.getElementById("walkthrough-content");
  const initialQuestionCard = document.querySelector(".sticky-question-card")
    || document.getElementById("question-card")
    || document.querySelector(".question-card");
  const tipsCard = ensureTipsCard(initialQuestionCard, walkthroughContent);
  const controlsSection = ensureControlsSection(tipsCard, walkthroughContent);

  moveQuestionSupportToTips(initialQuestionCard, tipsCard);
  ensureStickyQuestionPreferenceControl(initialQuestionCard);
  setupQuestionCardSticky(initialQuestionCard);
  setupQuestionImageZoom(initialQuestionCard);

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
        href: getGuidedWalkthroughHref(config.nextHref),
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
      pageBackLink.classList.remove("hidden");
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
      <a id="next-question-link" class="nav-btn hidden" href="${getGuidedWalkthroughHref(config.nextHref)}">${config.nextLabel}</a>
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
    addWalkthroughSkipButtons();
    attachLegacySingleStepNavigation(walkthroughContent, { onComplete: revealAnswer });
    walkthroughContent.classList.remove("hidden");
    showWalkthroughButton.classList.add("hidden");
    window.scrollTo({ top: getWalkthroughPageScrollTop(walkthroughContent), behavior: "smooth" });
  }

  function revealAnswer() {
    ensureHintsVisible();
    answerCard.classList.remove("hidden");
    showAnswerButton.classList.add("hidden");
    nextQuestionLink.classList.remove("hidden");
    markCurrentWalkthroughPartComplete();
    if (typeof renderMath === "function") {
      renderMath(answerCard);
    }
    window.scrollTo({ top: getWalkthroughPageScrollTop(answerCard), behavior: "smooth" });
  }

  addEntryActions();
  setupExamModeControls({
    questionCard: initialQuestionCard,
    hiddenElements: [tipsCard, hintsCard, controlsSection, walkthroughContent],
    onReveal: function () {
      revealWalkthrough();
    }
  });

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

  if (isGuidedWalkthroughMode()) {
    revealWalkthrough();
  }
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

function containsLegacyMathContent(html) {
  return /\\\(|\\\[|<div[^>]*math-block|<span[^>]*math|\$\$|\$[^$]+\$/.test(String(html || ""));
}

function rewriteLegacyPromptText(text) {
  const value = String(text || "").trim();

  if (!value) {
    return "";
  }

  let rewritten = value
    .replace(/\bwhat is the equation of\b/ig, "find the equation of")
    .replace(/\bwhat is the gradient of\b/ig, "find the gradient of")
    .replace(/\bwhat is the value of\b/ig, "find the value of")
    .replace(/\bwhat is the maximum\b/ig, "find the maximum")
    .replace(/\bwhat is the\b/ig, "find the")
    .replace(/\bwhat are the\b/ig, "find the")
    .replace(/\bwhat are\b/ig, "find")
    .replace(/\bwhat is\b/ig, "find")
    .replace(/\bwhich pair of\b/ig, "identify the pair of")
    .replace(/\bwhich set of\b/ig, "identify the set of")
    .replace(/\bwhich value of\b/ig, "identify the value of")
    .replace(/\bwhich value\b/ig, "identify the value")
    .replace(/\bwhich equation\b/ig, "identify the equation")
    .replace(/\bwhich derivative\b/ig, "identify the derivative")
    .replace(/\bwhich expression\b/ig, "identify the expression")
    .replace(/\bwhich rewrite\b/ig, "identify the rewrite")
    .replace(/\bwhich statement\b/ig, "identify the statement")
    .replace(/\bwhich relationship\b/ig, "identify the relationship")
    .replace(/\bwhich rule\b/ig, "identify the rule")
    .replace(/\bwhich answer\b/ig, "identify the answer")
    .replace(/\bwhich\b/ig, "identify")
    .replace(/\bwhat valid value of\b/ig, "find the valid value of")
    .replace(/\?+\s*$/g, "");

  if (/[A-Za-z0-9)\]]$/.test(rewritten)) {
    rewritten += ".";
  }

  return rewritten.charAt(0).toUpperCase() + rewritten.slice(1);
}

function cleanLegacyFeedbackTone(html) {
  const value = String(html || "").trim();

  if (!value) {
    return "";
  }

  return value
    .replace(/^<p([^>]*)>\s*(Correct|Yes|Exactly|Nice|Right|Great|Try again|Not quite|Close|Almost|Watch the signs here)\.\s*/i, "<p$1>")
    .replace(/^(Correct|Yes|Exactly|Nice|Right|Great|Try again|Not quite|Close|Almost|Watch the signs here)\.\s*/i, "")
    .replace(/^That is also correct\.\s*/i, "")
    .replace(/^That is exactly right,?\s*(and\s+)?/i, "")
    .replace(/^A rare anticlimax:\s*/i, "");
}

function buildLegacyTypedAnswerHtml(step) {
  if (!step || step.type !== "typed" || !Array.isArray(step.acceptedAnswers) || !step.acceptedAnswers.length) {
    return "";
  }

  if (!window.TypedMath || typeof window.TypedMath.formatMathForPreview !== "function") {
    return "";
  }

  const previewOptions = Object.assign({
    mode: step.mode || "expression"
  }, step.options || {});
  const latex = window.TypedMath.formatMathForPreview(step.acceptedAnswers[0], previewOptions);

  if (!latex) {
    return "";
  }

  return buildAnswerHighlight(step.resultLabel || "Key result", `
    <div class="math-block">
      \\[
      ${latex}
      \\]
    </div>
  `);
}

function buildLegacyIntroHtml(step, explanationHtml) {
  const coachingHtml = cleanLegacyFeedbackTone(step && step.genericMessage);

  if (coachingHtml) {
    return coachingHtml;
  }

  if (!step || step.type === "choice" || step.type === "plot") {
    return "";
  }

  if (containsLegacyMathContent(explanationHtml)) {
    return "";
  }

  return rewriteLegacyPromptText(step.text);
}

function normaliseLegacyStandalonePrompts(root) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }

  root.querySelectorAll(".step-card:not(.walkthrough-step-card) .step-text").forEach(function (node) {
    if (!node || !node.closest(".step-card") || !node.closest(".step-card").querySelector(".feedback")) {
      return;
    }

    const originalHtml = String(node.innerHTML || "").trim();

    if (!originalHtml || !/[?]/.test(originalHtml)) {
      return;
    }

    const rewrittenHtml = rewriteLegacyPromptText(originalHtml);

    if (rewrittenHtml && rewrittenHtml !== originalHtml) {
      node.innerHTML = rewrittenHtml;
    }
  });
}

function installLegacyFeedbackNormaliser(root) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }

  function normaliseFeedbackElement(element) {
    if (!element) {
      return;
    }

    const cleanedHtml = cleanLegacyFeedbackTone(element.innerHTML);

    if (cleanedHtml && cleanedHtml !== element.innerHTML) {
      element.innerHTML = cleanedHtml;
    }
  }

  root.querySelectorAll(".feedback").forEach(function (element) {
    normaliseFeedbackElement(element);

    if (typeof MutationObserver === "function") {
      const observer = new MutationObserver(function () {
        normaliseFeedbackElement(element);
      });

      observer.observe(element, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  });

  if (typeof window.setFeedback === "function" && !window.setFeedback.__walkthroughToneWrapped) {
    const originalSetFeedback = window.setFeedback;
    const wrappedSetFeedback = function wrappedSetFeedback(id, message, isSuccess) {
      return originalSetFeedback.call(this, id, cleanLegacyFeedbackTone(message), isSuccess);
    };

    wrappedSetFeedback.__walkthroughToneWrapped = true;
    window.setFeedback = wrappedSetFeedback;
  }
}

// Legacy walkthrough data still stores interactive prompts; convert those prompts into
// reveal-only explanations so every page can use the same guided UI while migrations happen incrementally.
function buildLegacyWorkingHtml(config, step, stepIndex, totalSteps) {
  const parts = [];
  const correctChoice = getCorrectChoice(step);
  const explanationHtml = cleanLegacyFeedbackTone(step.workingHtml
    || step.explanationHtml
    || step.successMessage
    || (correctChoice && correctChoice.successMessage)
    || "");
  const introHtml = buildLegacyIntroHtml(step, explanationHtml);
  const typedAnswerHtml = !containsLegacyMathContent(explanationHtml)
    ? buildLegacyTypedAnswerHtml(step)
    : "";

  if (introHtml) {
    parts.push(normaliseRichTextBlock(introHtml, "step-text walkthrough-working-intro"));
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

  if (typedAnswerHtml) {
    parts.push(typedAnswerHtml);
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
    workingHideLabel: step.workingHideLabel || "Hide working"
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
    ? `<a class="nav-btn secondary" href="${getGuidedWalkthroughHref(nav.secondary.href)}">${nav.secondary.label}</a>`
    : "";
  const primaryButton = nav.primary
    ? `<a class="nav-btn" href="${getGuidedWalkthroughHref(nav.primary.href)}">${nav.primary.label}</a>`
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
      aria-hidden="true"
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
          data-hidden-label="${step.workingButtonLabel}"
          data-shown-label="${step.workingHideLabel}"
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
    <section class="question-card walkthrough-progress-card" aria-label="Walkthrough step navigation">
      <p class="question-label">Walkthrough</p>
      <div class="walkthrough-progress-row">
        <div class="walkthrough-progress-copy">
          <p id="walkthrough-progress-status" class="walkthrough-progress-status" aria-live="polite"></p>
          <div class="walkthrough-progress-dots" aria-hidden="true">
            ${config.guidedSteps.map(function (_, index) {
              return `<span class="walkthrough-progress-dot" data-progress-step="${index}"></span>`;
            }).join("")}
          </div>
        </div>
        <div class="walkthrough-step-navigation">
          <button id="walkthrough-previous-btn" class="nav-btn secondary walkthrough-previous-btn" type="button">← Previous step</button>
          <button id="walkthrough-next-btn" class="nav-btn walkthrough-next-btn" type="button">Next step →</button>
        </div>
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
  const previousButton = document.getElementById("walkthrough-previous-btn");
  const nextButton = document.getElementById("walkthrough-next-btn");
  const progressStatus = document.getElementById("walkthrough-progress-status");
  const progressDots = Array.from(walkthroughContent.querySelectorAll(".walkthrough-progress-dot"));
  const finalNav = document.getElementById("walkthrough-final-nav");
  let currentStepIndex = 0;
  let walkthroughComplete = false;

  function updateProgressUi() {
    if (!previousButton || !nextButton || !progressStatus) {
      return;
    }

    const totalSteps = stepCards.length;

    if (!totalSteps) {
      progressStatus.textContent = "No steps available";
      previousButton.disabled = true;
      nextButton.disabled = true;
      return;
    }

    progressStatus.textContent = (walkthroughComplete ? "Complete · " : "")
      + "Step " + (currentStepIndex + 1) + " of " + totalSteps;
    previousButton.disabled = currentStepIndex === 0;

    const isLastStep = currentStepIndex === totalSteps - 1;
    const currentWorkingVisible = stepCards[currentStepIndex]
      && stepCards[currentStepIndex].dataset.workingVisible === "true";

    if (!isLastStep) {
      nextButton.textContent = "Next step →";
      nextButton.disabled = false;
    } else if (walkthroughComplete) {
      nextButton.textContent = "Question complete";
      nextButton.disabled = true;
    } else {
      nextButton.textContent = currentWorkingVisible ? "Finish question" : "Show final answer";
      nextButton.disabled = false;
    }

    progressDots.forEach(function (dot, index) {
      dot.classList.toggle("is-current", index === currentStepIndex);
      dot.classList.toggle("is-complete", index < currentStepIndex || walkthroughComplete);
    });

    if (finalNav) {
      finalNav.classList.toggle("hidden", !walkthroughComplete || !isLastStep);
    }
  }

  function moveToCurrentStep(shouldFocus) {
    const stepCard = stepCards[currentStepIndex];
    if (!stepCard) {
      return;
    }

    const heading = stepCard.querySelector("h2");
    if (heading && !heading.hasAttribute("tabindex")) {
      heading.setAttribute("tabindex", "-1");
    }

    window.setTimeout(function () {
      window.scrollTo({
        top: getWalkthroughPageScrollTop(stepCard),
        behavior: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth"
      });

      if (shouldFocus && heading) {
        try {
          heading.focus({ preventScroll: true });
        } catch (error) {
          heading.focus();
        }
      }
    }, 0);
  }

  function showStep(stepIndex, options) {
    if (stepIndex < 0 || stepIndex >= stepCards.length) {
      return;
    }

    currentStepIndex = stepIndex;
    stepCards.forEach(function (stepCard, index) {
      const isCurrent = index === currentStepIndex;
      stepCard.classList.toggle("hidden", !isCurrent);
      stepCard.classList.toggle("is-revealed", isCurrent);
      stepCard.setAttribute("aria-hidden", isCurrent ? "false" : "true");
    });

    updateProgressUi();

    const settings = options || {};
    if (settings.scroll !== false) {
      moveToCurrentStep(settings.focus !== false);
    }
  }

  function setWorkingVisibility(stepIndex, isVisible, shouldScroll) {
    const stepCard = stepCards[stepIndex];
    const button = walkthroughContent.querySelector('[data-working-step="' + stepIndex + '"]');
    const workingPanel = document.getElementById("walkthrough-step-" + (stepIndex + 1) + "-working");

    if (!stepCard || !button || !workingPanel) {
      return;
    }

    workingPanel.classList.toggle("hidden", !isVisible);
    workingPanel.classList.toggle("is-visible", isVisible);
    stepCard.dataset.workingVisible = isVisible ? "true" : "false";
    button.textContent = isVisible
      ? (button.dataset.shownLabel || "Hide working")
      : (button.dataset.hiddenLabel || "Show working");
    button.setAttribute("aria-expanded", isVisible ? "true" : "false");
    updateProgressUi();

    if (isVisible && shouldScroll !== false) {
      moveToCurrentStep(false);
    }
  }

  if (previousButton) {
    previousButton.addEventListener("click", function () {
      showStep(currentStepIndex - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      if (currentStepIndex < stepCards.length - 1) {
        showStep(currentStepIndex + 1);
        return;
      }

      if (!walkthroughComplete && stepCards[currentStepIndex]) {
        setWorkingVisibility(currentStepIndex, true, false);
        walkthroughComplete = true;
        markCurrentWalkthroughPartComplete();
        updateProgressUi();
        moveToCurrentStep(false);
      }
    });
  }

  walkthroughContent.querySelectorAll(".step-working-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      const stepIndex = Number(button.dataset.workingStep);
      const stepCard = stepCards[stepIndex];
      const workingPanel = document.getElementById("walkthrough-step-" + (stepIndex + 1) + "-working");

      if (!stepCard || !workingPanel) {
        return;
      }

      setWorkingVisibility(stepIndex, workingPanel.classList.contains("hidden"));
    });
  });

  showStep(0, { scroll: false, focus: false });
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
  ensureWalkthroughSidebar(normalisedConfig);

  questionCard.classList.add("sticky-question-card");
  questionCard.innerHTML = buildQuestionCardHtml(normalisedConfig);
  renderPartNavigation(normalisedConfig, questionCard);
  setupQuestionImageZoom(questionCard);

  if (normalisedConfig.tips.length) {
    tipsCard.innerHTML = buildTipsCardHtml(normalisedConfig, normalisedConfig.tips);
    tipsCard.classList.remove("hidden");
  } else {
    tipsCard.innerHTML = "";
    tipsCard.classList.add("hidden");
  }

  walkthroughContent.innerHTML = buildProgressiveWalkthroughHtml(normalisedConfig);
  walkthroughContent.classList.remove("hidden");
  carryGuidedModeToQuestionLinks(walkthroughContent);

  ensureStickyQuestionPreferenceControl(questionCard);
  setupQuestionCardSticky(questionCard);

  if (typeof normalisedConfig.afterRender === "function") {
    normalisedConfig.afterRender();
  }

  window.renderMath(document.body);
  attachProgressiveWalkthroughHandlers(normalisedConfig, walkthroughContent);
  setupExamModeControls({
    questionCard: questionCard,
    hiddenElements: [tipsCard, walkthroughContent],
    onReveal: function () {
      const target = tipsCard && !tipsCard.classList.contains("hidden") ? tipsCard : walkthroughContent;
      window.scrollTo({ top: getWalkthroughPageScrollTop(target), behavior: "smooth" });
    }
  });
}

function getWalkthroughPaperProgressById(paperId) {
  const entry = findWalkthroughPaperById(paperId);

  if (!entry) {
    return {
      visited: 0,
      completed: 0,
      total: 0
    };
  }

  return getWalkthroughPaperProgress(Object.assign({ partId: entry.paper.parts[0] }, entry));
}

window.CalcNzWalkthrough = Object.assign(window.CalcNzWalkthrough || {}, {
  progressStorageKey: WALKTHROUGH_PROGRESS_STORAGE_KEY,
  lastVisitedStorageKey: WALKTHROUGH_LAST_VISITED_STORAGE_KEY,
  examModeStorageKey: WALKTHROUGH_EXAM_MODE_STORAGE_KEY,
  readProgressMap: readWalkthroughProgressMap,
  readLastWalkthrough: readLastWalkthrough,
  getPaperProgressById: getWalkthroughPaperProgressById,
  getPaperProgressText: getWalkthroughPaperProgressText,
  getCatalogEntries: getWalkthroughCatalogEntries
});

window.initializeProgressiveWalkthrough = initializeProgressiveWalkthrough;

(function () {
  const reportIssueHtml = 'Found an error or unclear explanation? Report it <a class="site-footer-link" href="https://docs.google.com/forms/d/e/1FAIpQLSfsQWI9kX3BVpUNJbEqUa9gdKiF1rTvNXT4bL0T3_AYYvLpkA/viewform?usp=publish-editor" target="_blank" rel="noreferrer">here</a>.';
  const INTERACTION_SELECTOR = ".option-btn, .check-btn, .next-step-btn, .walkthrough-next-btn, .walkthrough-previous-btn, .step-working-btn, .legacy-working-toggle, .legacy-previous-btn";

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
      const questionCard = document.getElementById("question-card");
      if (questionCard && document.querySelector("main.app:not(.home-app)")) {
        questionCard.classList.add("sticky-question-card");
        ensureStickyQuestionPreferenceControl(questionCard);
        setupQuestionCardSticky(questionCard);
        setupQuestionImageZoom(questionCard);
      }
      normaliseButtonTypes(document);
      normaliseLegacyStandalonePrompts(document);
      installLegacyFeedbackNormaliser(document);
      stabiliseInteractiveScroll(document);
      ensureReportIssueFooter();
    });
  } else {
    ensureSiteHeader();
    const questionCard = document.getElementById("question-card");
    if (questionCard && document.querySelector("main.app:not(.home-app)")) {
      questionCard.classList.add("sticky-question-card");
      ensureStickyQuestionPreferenceControl(questionCard);
      setupQuestionCardSticky(questionCard);
      setupQuestionImageZoom(questionCard);
    }
    normaliseButtonTypes(document);
    normaliseLegacyStandalonePrompts(document);
    installLegacyFeedbackNormaliser(document);
    stabiliseInteractiveScroll(document);
    ensureReportIssueFooter();
  }
}());
