function getSiteHeader() {
  return document.querySelector(".site-header");
}

function getSitePageName(url) {
  try {
    const pathname = new URL(url, window.location.href).pathname.replace(/\/+$/, "");
    return pathname.split("/").pop() || "index.html";
  } catch (error) {
    return "";
  }
}

function syncSiteNavigationCurrentState(root) {
  const scope = root || document;
  const currentPage = getSitePageName(window.location.href);

  scope.querySelectorAll(".site-brand, .site-header-link, .site-footer-link").forEach(function (link) {
    const linkedPage = getSitePageName(link.href);
    const isSitePage = linkedPage === "index.html"
      || linkedPage === "standards.html"
      || linkedPage === "about.html";

    if (isSitePage && linkedPage === currentPage) {
      link.setAttribute("aria-current", "page");
    } else if (link.getAttribute("aria-current") === "page") {
      link.removeAttribute("aria-current");
    }
  });
}

function focusWithoutPageScroll(element) {
  if (!element || typeof element.focus !== "function") {
    return;
  }

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  try {
    element.focus({ preventScroll: true });
  } catch (error) {
    element.focus();
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(scrollX, scrollY);
    root.style.scrollBehavior = previousScrollBehavior;
  }
}

function focusRevealedContent(container) {
  if (!container) {
    return;
  }

  const target = container.matches("h1, h2, h3, .question-label, .step-number, .step-text")
    ? container
    : container.querySelector("h1, h2, h3, .question-label, .step-number, .step-text");

  if (!target) {
    return;
  }

  if (!target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1");
  }
  target.classList.add("in-page-focus-target");
  focusWithoutPageScroll(target);
}

const WALKTHROUGH_KATEX_DELIMITERS = [
  { left: "$$", right: "$$", display: true },
  { left: "\\[", right: "\\]", display: true },
  { left: "\\(", right: "\\)", display: false }
];
const WALKTHROUGH_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(", ");

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

function getWalkthroughFocusableElements(container) {
  if (!container || typeof container.querySelectorAll !== "function") {
    return [];
  }

  return Array.from(container.querySelectorAll(WALKTHROUGH_FOCUSABLE_SELECTOR)).filter(function (element) {
    return !element.hidden
      && !element.closest("[hidden], .hidden, [inert]")
      && element.getAttribute("aria-hidden") !== "true";
  });
}

function containWalkthroughFocus(event, container) {
  if (!event || event.key !== "Tab" || !container) {
    return false;
  }

  const focusableElements = getWalkthroughFocusableElements(container);

  if (!focusableElements.length) {
    event.preventDefault();
    if (!container.hasAttribute("tabindex")) {
      container.setAttribute("tabindex", "-1");
    }
    container.focus();
    return true;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey && (activeElement === firstElement || !container.contains(activeElement))) {
    event.preventDefault();
    lastElement.focus();
    return true;
  }

  if (!event.shiftKey && (activeElement === lastElement || !container.contains(activeElement))) {
    event.preventDefault();
    firstElement.focus();
    return true;
  }

  return false;
}

function setWalkthroughModalSiblingsInert(modal, shouldBeInert) {
  if (!modal || !document.body) {
    return;
  }

  if (shouldBeInert) {
    modal._inertedSiblings = Array.from(document.body.children).filter(function (element) {
      return element !== modal && "inert" in element;
    }).map(function (element) {
      const state = { element: element, wasInert: element.inert };
      element.inert = true;
      return state;
    });
    return;
  }

  (modal._inertedSiblings || []).forEach(function (state) {
    if (state.element && state.element.isConnected) {
      state.element.inert = state.wasInert;
    }
  });
  modal._inertedSiblings = [];
}

function setWalkthroughSidebarBackgroundInert(sidebar, shouldBeInert) {
  if (!sidebar || !document.body) {
    return;
  }

  if (shouldBeInert) {
    if (Array.isArray(sidebar._inertedBackgroundElements)) {
      return;
    }

    const sidebarParent = sidebar.parentElement;
    const backdrop = document.getElementById("walkthrough-sidebar-backdrop");
    const lightbox = document.getElementById("question-image-lightbox");
    const targets = Array.from(document.body.children).filter(function (element) {
      return element !== sidebarParent
        && element !== backdrop
        && element !== lightbox
        && "inert" in element;
    });

    if (sidebarParent) {
      Array.from(sidebarParent.children).forEach(function (element) {
        if (element !== sidebar && "inert" in element) {
          targets.push(element);
        }
      });
    }

    sidebar._inertedBackgroundElements = targets.map(function (element) {
      const state = { element: element, wasInert: element.inert };
      element.inert = true;
      return state;
    });
    return;
  }

  (sidebar._inertedBackgroundElements || []).forEach(function (state) {
    if (state.element && state.element.isConnected) {
      state.element.inert = state.wasInert;
    }
  });
  sidebar._inertedBackgroundElements = null;
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

  const mainContent = document.querySelector("main");
  if (mainContent && !mainContent.id) {
    mainContent.id = "main-content";
  }
  if (mainContent && !mainContent.hasAttribute("tabindex")) {
    mainContent.setAttribute("tabindex", "-1");
  }

  let skipLink = document.querySelector(".skip-link");
  if (!skipLink && mainContent) {
    skipLink = document.createElement("a");
    skipLink.className = "skip-link";
    skipLink.href = "#" + mainContent.id;
    skipLink.textContent = "Skip to main content";
    body.insertBefore(skipLink, body.firstChild);
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
    brandLink.href = "/";
    brandLink.textContent = "Calc.nz";

    const headerLinks = document.createElement("div");
    headerLinks.className = "site-header-links";
    headerLinks.innerHTML = `
      <a class="site-header-link" href="/standards.html">Standards</a>
      <a class="site-header-link" href="about.html">About</a>
    `;

    headerInner.appendChild(brandLink);
    headerInner.appendChild(headerLinks);
    siteHeader.appendChild(headerInner);

    const main = document.querySelector("main");

    if (main && main.parentNode === body) {
      body.insertBefore(siteHeader, main);
    } else {
      body.insertBefore(siteHeader, body.firstChild);
    }
  }

  body.classList.add("has-site-header");
  syncSiteNavigationCurrentState(siteHeader);
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
const WALKTHROUGH_NAV_INTEGRATION_2021_PART_LABELS = {
  "1a": "1(a)",
  "1b": "1(b)(i)",
  "1c": "1(b)(ii)",
  "1d": "1(c)",
  "1e": "1(d)"
};
const WALKTHROUGH_NAV_YEARS = [2025, 2024, 2023, 2022, 2021, 2020];
const WALKTHROUGH_NAV_DIFFERENTIATION_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];
const WALKTHROUGH_NAV_INTEGRATION_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];
let walkthroughSidebarPreferenceFallback = null;
let walkthroughProgressFallback = {};
let walkthroughLastVisitedFallback = null;
let walkthroughExamModeFallback = false;

function createWalkthroughPaper(id, year, routeTemplate, parts, partLabels) {
  const landingId = id.replace("level-3-complex-", "level-3-complex-numbers-");

  return {
    id: id,
    year: year,
    label: year + " Paper",
    indexHref: landingId + ".html",
    routeTemplate: routeTemplate,
    parts: parts || WALKTHROUGH_NAV_PARTS,
    partLabels: partLabels || null
  };
}

function createWalkthroughYearPapers(standardId, routeTemplate, years, partLabelsByYear) {
  return (years || WALKTHROUGH_NAV_YEARS).map(function (year) {
    return createWalkthroughPaper(
      standardId + "-" + year,
      year,
      routeTemplate.replace(/\{year\}/g, String(year)),
      null,
      partLabelsByYear && partLabelsByYear[year]
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
        standardNumber: "AS91262",
        officialName: "Apply calculus methods in solving problems",
        officialUrl: "https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=91262",
        indexHref: "level-2-calculus.html",
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
        standardNumber: "AS91261",
        officialName: "Apply algebraic methods in solving problems",
        officialUrl: "https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=91261",
        indexHref: "level-2-algebra.html",
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
        standardNumber: "AS91578",
        officialName: "Apply differentiation methods in solving problems",
        officialUrl: "https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=91578",
        indexHref: "level-3-differentiation.html",
        papers: createWalkthroughYearPapers("level-3-differentiation", "{part}{year}.html", WALKTHROUGH_NAV_DIFFERENTIATION_YEARS)
      },
      {
        id: "level-3-integration",
        label: "Integration",
        standardNumber: "AS91579",
        officialName: "Apply integration methods in solving problems",
        officialUrl: "https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=91579",
        indexHref: "level-3-integration.html",
        papers: createWalkthroughYearPapers(
          "level-3-integration",
          "int-{part}{year}.html",
          WALKTHROUGH_NAV_INTEGRATION_YEARS,
          { 2021: WALKTHROUGH_NAV_INTEGRATION_2021_PART_LABELS }
        )
      },
      {
        id: "level-3-complex",
        label: "Complex Numbers",
        standardNumber: "AS91577",
        officialName: "Apply the algebra of complex numbers in solving problems",
        officialUrl: "https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=91577",
        indexHref: "level-3-complex-numbers.html",
        papers: [
          createWalkthroughPaper("level-3-complex-2025", 2025, "complex-{part}2025.html")
        ].concat(createWalkthroughYearPapers("level-3-complex", "complex-{year}.html?q={part}", [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017]))
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

function walkthroughPartLabel(partId, paper) {
  const value = String(partId || "");

  if (paper && paper.partLabels && paper.partLabels[value]) {
    return paper.partLabels[value];
  }

  return value.charAt(0) + "(" + value.charAt(1) + ")";
}

function walkthroughQuestionLabel(partId, paper) {
  return "Question " + walkthroughPartLabel(partId, paper);
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
    label: context.paper.year + " " + context.standard.label + " \u00b7 " + walkthroughQuestionLabel(partId, context.paper),
    levelLabel: context.level.label,
    standardLabel: context.standard.label,
    year: context.paper.year,
    questionLabel: walkthroughQuestionLabel(partId, context.paper),
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

  return context.paper.year
    + " NCEA "
    + context.level.label
    + " "
    + context.standard.label
    + " \u2014 "
    + walkthroughQuestionLabel(context.partId, context.paper);
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

const WALKTHROUGH_SEO_ORIGIN = "https://calc.nz";

function getWalkthroughSeoCanonicalUrl(context) {
  if (!context || !context.paper || !context.partId) {
    return WALKTHROUGH_SEO_ORIGIN + "/";
  }

  const target = new URL(getWalkthroughPartHref(context.paper, context.partId), WALKTHROUGH_SEO_ORIGIN + "/");
  target.searchParams.delete("mode");
  target.hash = "";
  return target.href;
}

function getWalkthroughSeoTitle(context) {
  return context.paper.year
    + " NCEA "
    + context.level.label
    + " "
    + context.standard.label
    + " "
    + context.standard.standardNumber
    + " "
    + walkthroughQuestionLabel(context.partId, context.paper)
    + " \u2014 Worked Solution";
}

function getWalkthroughSeoDescription(context) {
  return "Work through "
    + context.paper.year
    + " NCEA "
    + context.level.label
    + " "
    + context.standard.label
    + " "
    + context.standard.standardNumber
    + " "
    + walkthroughQuestionLabel(context.partId, context.paper)
    + " with guided hints, method explanations, and a step-by-step solution.";
}

function ensureWalkthroughSeoMeta(attribute, key, value) {
  let element = document.head.querySelector('meta[' + attribute + '="' + key + '"]');

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", value);
  return element;
}

function ensureWalkthroughSeoCanonical(canonicalUrl) {
  let canonical = document.head.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }

  canonical.href = canonicalUrl;
}

function getWalkthroughSeoPlainText(value) {
  const container = document.createElement("div");
  container.innerHTML = String(value || "");

  return String(container.textContent || "")
    .replace(/\\[()[\]]/g, "")
    .replace(/\\(?:text|mathrm|mathbf|operatorname)\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\(?:,|;|!|quad|qquad)/g, " ")
    .replace(/\\([a-zA-Z]+)/g, "$1")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getWalkthroughSeoMistake(context, focus) {
  const plainFocus = getWalkthroughSeoPlainText(focus).toLowerCase();

  if (/chain rule|inner function|inside function/.test(plainFocus)) {
    return "A common slip is differentiating the outside expression but forgetting to multiply by the derivative of the inside function.";
  }

  if (/tangent|normal/.test(plainFocus)) {
    return "Keep the curve gradient, tangent or normal gradient, and the point on the curve separate before writing the line equation.";
  }

  if (/stationary|turning point|maximum|minimum|optimis/.test(plainFocus)) {
    return "Finding a critical value is only part of the reasoning: also justify its nature and answer in the context of the question.";
  }

  if (/area|volume|numerical integration/.test(plainFocus)) {
    return "Check limits, signs, and units carefully; a correct antiderivative can still produce the wrong contextual area or volume.";
  }

  if (/rate|kinematic|velocity|acceleration|displacement/.test(plainFocus)) {
    return "Track which quantity is being differentiated or integrated, then include the requested units and contextual conclusion.";
  }

  if (/conjugate|rationalis/.test(plainFocus)) {
    return "Use the correct conjugate sign and expand the whole product before simplifying the real and imaginary parts.";
  }

  if (/argument|polar|de moivre|root/.test(plainFocus) && context.standard.id === "level-3-complex") {
    return "Check the modulus and starting angle, including the quadrant, before applying polar-form or De Moivre reasoning.";
  }

  if (context.standard.id === "level-3-integration") {
    return "Differentiate your result as a quick check, and include the constant of integration whenever the question requires an indefinite integral.";
  }

  if (context.standard.id === "level-3-differentiation" || context.standard.id === "level-2-calculus") {
    return "State the rule you are using, keep each algebraic step equivalent, and connect the derivative result back to the question.";
  }

  if (context.standard.id === "level-3-complex") {
    return "Keep modulus, argument, conjugate, and real or imaginary parts distinct, and finish in the form the question requests.";
  }

  return "Keep each algebraic transformation equivalent, preserve signs and exponents, and check that the final expression is in the requested form.";
}

function updateWalkthroughSeoRelatedLink(context, relation, offset) {
  const link = document.querySelector('[data-seo-related="' + relation + '"]');

  if (!link) {
    return;
  }

  const currentIndex = context.paper.parts.indexOf(context.partId);
  const targetPart = context.paper.parts[currentIndex + offset];

  if (!targetPart) {
    link.hidden = true;
    link.removeAttribute("href");
    return;
  }

  link.hidden = false;
  link.href = getWalkthroughPartHref(context.paper, targetPart);
  link.textContent = (offset < 0 ? "\u2190 " : "")
    + walkthroughQuestionLabel(targetPart, context.paper)
    + (offset > 0 ? " \u2192" : "");
}

function buildWalkthroughSeoStructuredData(context, title, description, canonicalUrl) {
  const standardUrl = new URL(context.standard.indexHref, WALKTHROUGH_SEO_ORIGIN + "/").href;
  const yearUrl = new URL(context.paper.indexHref, WALKTHROUGH_SEO_ORIGIN + "/").href;
  const questionLabel = walkthroughQuestionLabel(context.partId, context.paper);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": canonicalUrl + "#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: WALKTHROUGH_SEO_ORIGIN + "/" },
          { "@type": "ListItem", position: 2, name: "NCEA " + context.level.label + " " + context.standard.label, item: standardUrl },
          { "@type": "ListItem", position: 3, name: context.paper.year + " paper", item: yearUrl },
          { "@type": "ListItem", position: 4, name: questionLabel, item: canonicalUrl }
        ]
      },
      {
        "@type": "LearningResource",
        "@id": canonicalUrl + "#learning-resource",
        url: canonicalUrl,
        name: title,
        description: description,
        inLanguage: "en-NZ",
        learningResourceType: "Guided worked solution",
        educationalLevel: "NCEA " + context.level.label,
        mainEntityOfPage: canonicalUrl,
        author: {
          "@type": "Person",
          name: "Jack van Baalen",
          url: WALKTHROUGH_SEO_ORIGIN + "/about.html"
        },
        about: {
          "@type": "DefinedTerm",
          name: context.standard.officialName,
          termCode: context.standard.standardNumber,
          url: context.standard.officialUrl || standardUrl
        },
        isPartOf: {
          "@type": "WebPage",
          "@id": yearUrl
        }
      }
    ]
  };
}

function syncWalkthroughSeo(context, config) {
  if (!context || !context.standard.standardNumber) {
    return;
  }

  const title = getWalkthroughSeoTitle(context);
  const description = getWalkthroughSeoDescription(context);
  const canonicalUrl = getWalkthroughSeoCanonicalUrl(context);
  const standardUrl = context.standard.indexHref;
  const yearUrl = context.paper.indexHref;
  const questionLabel = walkthroughQuestionLabel(context.partId, context.paper);
  const pageTitle = document.getElementById("page-title") || document.querySelector("main.app .topbar h1");
  const backLink = document.getElementById("back-link") || document.querySelector("main.app .topbar .ghost-link");
  const focusElement = document.querySelector("[data-seo-focus]");
  const sourceFocus = config && config.focus
    ? String(config.focus)
    : focusElement
      ? focusElement.innerHTML
      : "using a clear method and checking each stage of the working";

  document.title = title;
  ensureWalkthroughSeoCanonical(canonicalUrl);
  ensureWalkthroughSeoMeta("name", "description", description);
  ensureWalkthroughSeoMeta("name", "robots", "index,follow,max-image-preview:large");
  ensureWalkthroughSeoMeta("property", "og:type", "article");
  ensureWalkthroughSeoMeta("property", "og:locale", "en_NZ");
  ensureWalkthroughSeoMeta("property", "og:site_name", "Calc.nz");
  ensureWalkthroughSeoMeta("property", "og:title", title);
  ensureWalkthroughSeoMeta("property", "og:description", description);
  ensureWalkthroughSeoMeta("property", "og:url", canonicalUrl);
  ensureWalkthroughSeoMeta("name", "twitter:card", "summary");
  ensureWalkthroughSeoMeta("name", "twitter:title", title);
  ensureWalkthroughSeoMeta("name", "twitter:description", description);

  if (pageTitle) {
    pageTitle.textContent = getWalkthroughHeaderTitle(context);
  }

  if (backLink) {
    backLink.href = yearUrl;
  }

  document.querySelectorAll("[data-seo-standard-link]").forEach(function (link) {
    link.href = standardUrl;
  });
  document.querySelectorAll("[data-seo-year-link]").forEach(function (link) {
    link.href = yearUrl;
  });

  const breadcrumbStandard = document.querySelector("[data-seo-breadcrumb-standard]");
  const breadcrumbYear = document.querySelector("[data-seo-breadcrumb-year]");
  const breadcrumbQuestion = document.querySelector("[data-seo-breadcrumb-question]");

  if (breadcrumbStandard) {
    breadcrumbStandard.href = standardUrl;
    breadcrumbStandard.textContent = "NCEA " + context.level.label + " " + context.standard.label;
  }
  if (breadcrumbYear) {
    breadcrumbYear.href = yearUrl;
    breadcrumbYear.textContent = context.paper.year + " paper";
  }
  if (breadcrumbQuestion) {
    breadcrumbQuestion.textContent = questionLabel;
  }

  if (focusElement && config && config.focus) {
    focusElement.innerHTML = String(config.focus);
    if (typeof window.renderMath === "function") {
      window.renderMath(focusElement);
    }
  }

  const overviewLead = document.querySelector("[data-seo-overview-lead]");
  if (overviewLead) {
    overviewLead.textContent = "This "
      + context.paper.year
      + " walkthrough is part of "
      + context.standard.standardNumber
      + " \u2014 "
      + context.standard.officialName
      + ".";
  }

  const summary = document.querySelector("[data-seo-summary]");
  if (summary) {
    const plainFocus = getWalkthroughSeoPlainText(sourceFocus).replace(/[.\s]+$/, "");
    summary.textContent = "This walkthrough helps you practise "
      + plainFocus.charAt(0).toLowerCase()
      + plainFocus.slice(1)
      + ". Use the hints to plan the method before opening the full worked solution.";
  }

  const mistake = document.querySelector("[data-seo-mistake]");
  if (mistake) {
    mistake.textContent = getWalkthroughSeoMistake(context, sourceFocus);
  }

  const yearRelatedLink = document.querySelector("[data-seo-related-year]");
  if (yearRelatedLink) {
    yearRelatedLink.href = yearUrl;
    yearRelatedLink.textContent = "All " + context.paper.year + " questions";
  }

  updateWalkthroughSeoRelatedLink(context, "previous", -1);
  updateWalkthroughSeoRelatedLink(context, "next", 1);

  let structuredData = document.getElementById("seo-structured-data");
  if (!structuredData) {
    structuredData = document.createElement("script");
    structuredData.id = "seo-structured-data";
    structuredData.type = "application/ld+json";
    document.head.appendChild(structuredData);
  }
  structuredData.textContent = JSON.stringify(buildWalkthroughSeoStructuredData(context, title, description, canonicalUrl));
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

  const wasVisible = body.classList.contains("walkthrough-nav-visible");
  const isDesktop = isWalkthroughSidebarDesktop();
  const willBeMobileOpen = isVisible && !isDesktop;

  if (isVisible && !wasVisible && settings.focus !== false) {
    sidebar._previousWalkthroughFocus = settings.trigger || document.activeElement;
  }

  if (settings.persist) {
    setWalkthroughSidebarStoredPreference(isVisible);
  }

  body.classList.toggle("walkthrough-nav-visible", isVisible);
  body.classList.toggle("walkthrough-nav-hidden", !isVisible);
  body.classList.toggle("walkthrough-nav-mobile-open", willBeMobileOpen);
  setWalkthroughSidebarInteractivity(sidebar, isVisible);
  setWalkthroughSidebarBackgroundInert(sidebar, willBeMobileOpen);

  if (willBeMobileOpen) {
    sidebar.setAttribute("role", "dialog");
    sidebar.setAttribute("aria-modal", "true");
  } else {
    sidebar.removeAttribute("role");
    sidebar.removeAttribute("aria-modal");
  }

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
    backdrop.hidden = !willBeMobileOpen;
  }

  if (isVisible && !wasVisible && settings.focus !== false) {
    focusWithoutPageScroll(closeToggle || sidebar);
  }

  if (wasVisible && !isVisible) {
    const previousFocus = sidebar._previousWalkthroughFocus;
    sidebar._previousWalkthroughFocus = null;

    if (settings.restoreFocus !== false) {
      const focusTarget = previousFocus && previousFocus.isConnected
        ? previousFocus
        : openToggle;

      if (focusTarget && typeof focusTarget.focus === "function") {
        focusWithoutPageScroll(focusTarget);
      }
    } else if (sidebar.contains(document.activeElement)
      && openToggle
      && typeof openToggle.focus === "function") {
      focusWithoutPageScroll(openToggle);
    }
  }
}

function syncWalkthroughSidebarState() {
  setWalkthroughSidebarVisible(shouldShowWalkthroughSidebarByDefault(), {
    persist: false,
    focus: false,
    restoreFocus: false
  });
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
      setWalkthroughSidebarVisible(true, { persist: true, trigger: openToggle });
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
              label: walkthroughPartLabel(partId, context.paper),
              partId: partId,
              progressState: getWalkthroughPartProgressState(context, partId),
              current: current,
              currentValue: "page",
              ariaLabel: walkthroughQuestionLabel(partId, context.paper) + ", " + context.paper.year + " " + context.standard.label
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
      href: paper.indexHref,
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
  syncWalkthroughSeo(context, config);

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
      setWalkthroughSidebarVisible(false, { persist: true, restoreFocus: true });
    });
  }

  ensureWalkthroughSidebarToggle(app);
  syncWalkthroughSidebarState();

  if (sidebar.dataset.sidebarSetup !== "true") {
    sidebar.dataset.sidebarSetup = "true";
    sidebar.addEventListener("click", function (event) {
      const closeToggle = event.target.closest("#walkthrough-sidebar-close-toggle");
      if (closeToggle) {
        setWalkthroughSidebarVisible(false, { persist: true, restoreFocus: true });
        return;
      }

      const link = event.target.closest("[data-close-walkthrough-sidebar]");
      if (link && !isWalkthroughSidebarDesktop()) {
        setWalkthroughSidebarVisible(false, { persist: true, restoreFocus: false });
      }
    });
  }

  if (document.body.dataset.walkthroughSidebarSetup !== "true") {
    document.body.dataset.walkthroughSidebarSetup = "true";
    window.addEventListener("resize", syncWalkthroughSidebarState);
    document.addEventListener("keydown", function (event) {
      const sidebar = document.getElementById("walkthrough-sidebar");
      const lightbox = document.getElementById("question-image-lightbox");

      if (lightbox && !lightbox.hidden) {
        return;
      }

      if (document.body.classList.contains("walkthrough-nav-mobile-open")
        && containWalkthroughFocus(event, sidebar)) {
        return;
      }

      if (!event.defaultPrevented && event.key === "Escape" && document.body.classList.contains("walkthrough-nav-visible")) {
        setWalkthroughSidebarVisible(false, { persist: true, restoreFocus: true });
        event.preventDefault();
        return;
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
      const revealedContainer = hiddenElements.find(function (element) {
        return !element.hidden
          && !element.classList.contains("hidden")
          && !element.classList.contains("exam-mode-hidden")
          && window.getComputedStyle(element).display !== "none";
      });
      focusRevealedContent(revealedContainer || questionCard);
    });
  }

  questionCard.dataset.examModeSetup = "true";
  applyExamModeState();
}

let questionGraphicCloneSequence = 0;

function cloneQuestionGraphicForLightbox(target) {
  const clone = target.cloneNode(true);
  const idMap = {};
  const suffix = "-lightbox-" + (++questionGraphicCloneSequence);

  [clone].concat(Array.from(clone.querySelectorAll(".question-image-zoomable, [data-image-zoom-setup='true']"))).forEach(function (zoomClone) {
    if (!zoomClone.matches(".question-image-zoomable, [data-image-zoom-setup='true']")) {
      return;
    }

    zoomClone.classList.remove("question-image-zoomable");
    zoomClone.removeAttribute("role");
    zoomClone.removeAttribute("tabindex");
    zoomClone.removeAttribute("aria-label");
    delete zoomClone.dataset.imageZoomSetup;
    delete zoomClone.dataset.imageZoomDescription;
  });

  clone.removeAttribute("id");
  clone.querySelectorAll("[id]").forEach(function (element) {
    const originalId = element.id;
    const cloneId = originalId + suffix;

    idMap[originalId] = cloneId;
    element.id = cloneId;
  });

  clone.querySelectorAll("*").forEach(function (element) {
    ["aria-labelledby", "aria-describedby"].forEach(function (attributeName) {
      const value = element.getAttribute(attributeName);

      if (value) {
        element.setAttribute(attributeName, value.split(/\s+/).map(function (id) {
          return idMap[id] || id;
        }).join(" "));
      }
    });

    Array.from(element.attributes).forEach(function (attribute) {
      let value = attribute.value;

      Object.keys(idMap).forEach(function (originalId) {
        if (value === "#" + originalId) {
          value = "#" + idMap[originalId];
        } else {
          value = value
            .split("url(#" + originalId + ")")
            .join("url(#" + idMap[originalId] + ")");
        }
      });

      if (value !== attribute.value) {
        element.setAttribute(attribute.name, value);
      }
    });
  });

  return clone;
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
    lightbox.setAttribute("tabindex", "-1");
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
      setWalkthroughModalSiblingsInert(lightbox, false);

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
      if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === "function") {
        focusWithoutPageScroll(previousFocus);
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
      if (lightbox.hidden) {
        return;
      }

      if (containWalkthroughFocus(event, lightbox)) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
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
  const zoomDescription = getQuestionImageZoomDescription(target);
  lightbox.setAttribute("aria-label", zoomDescription
    ? "Larger view: " + zoomDescription
    : "Question image preview");
  graphic.innerHTML = "";
  graphic.hidden = true;
  image.hidden = false;

  if (target.tagName === "IMG") {
    image.src = target.currentSrc || target.src;
    image.alt = target.alt || "Question image";
  } else {
    const clone = cloneQuestionGraphicForLightbox(target);
    image.hidden = true;
    image.removeAttribute("src");
    image.alt = "";
    graphic.hidden = false;
    graphic.appendChild(clone);
  }

  lightbox.hidden = false;
  document.body.classList.add("question-image-lightbox-open");
  setWalkthroughModalSiblingsInert(lightbox, true);

  if (closeButton) {
    closeButton.focus();
  } else {
    lightbox.focus();
  }
}

function getQuestionImageZoomDescription(target) {
  if (!target) {
    return "";
  }

  if (target.dataset.imageZoomDescription) {
    return target.dataset.imageZoomDescription;
  }

  const authoredLabel = String(target.getAttribute("aria-label") || "").trim();
  if (authoredLabel) {
    const zoomPrefix = /^Open (?:a )?larger view(?:(?: of)|:)?\s*/i;
    const authoredDescription = authoredLabel.replace(zoomPrefix, "").trim();

    if (authoredDescription && authoredDescription !== authoredLabel) {
      return authoredDescription;
    }

    if (!zoomPrefix.test(authoredLabel)) {
      return authoredLabel;
    }
  }

  if (target.tagName === "IMG" && target.alt && target.alt.trim()) {
    return target.alt.trim();
  }

  const graphic = target.matches("svg") ? target : target.querySelector("svg");
  if (graphic) {
    const graphicLabel = String(graphic.getAttribute("aria-label") || "").trim();
    if (graphicLabel) {
      return graphicLabel;
    }

    const labelledBy = String(graphic.getAttribute("aria-labelledby") || "").trim();
    if (labelledBy) {
      const labelledText = labelledBy.split(/\s+/).map(function (id) {
        const labelElement = document.getElementById(id);
        return labelElement ? String(labelElement.textContent || "").trim() : "";
      }).filter(Boolean).join(". ");

      if (labelledText) {
        return labelledText;
      }
    }

    const title = graphic.querySelector("title");
    const description = graphic.querySelector("desc");
    const graphicText = [title, description].map(function (element) {
      return element ? String(element.textContent || "").trim() : "";
    }).filter(Boolean).join(". ");

    if (graphicText) {
      return graphicText;
    }
  }

  const figure = target.closest("figure");
  const caption = figure && figure.querySelector("figcaption");
  return caption ? String(caption.textContent || "").trim() : "";
}

function syncQuestionImageZoomLabel(target) {
  const description = getQuestionImageZoomDescription(target);

  if (description) {
    target.dataset.imageZoomDescription = description;
    target.setAttribute("aria-label", "Open larger view: " + description);
  } else {
    target.setAttribute("aria-label", "Open larger view");
  }
}

function setupQuestionImageZoom(root) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }

  const targets = Array.from(root.querySelectorAll("img.question-screenshot, .question-prompt img, .paper-question-prompt img, .question-graph-frame, .question-card .graph-frame"));

  targets.forEach(function (target) {
    if (target.dataset.imageZoomSetup === "true") {
      syncQuestionImageZoomLabel(target);
      return;
    }

    target.dataset.imageZoomSetup = "true";
    target.classList.add("question-image-zoomable");
    target.setAttribute("role", "button");
    target.setAttribute("tabindex", "0");
    syncQuestionImageZoomLabel(target);
    target.addEventListener("click", function () {
      openQuestionImageLightbox(target);
    });
    target.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        openQuestionImageLightbox(target);
      }
    });

    window.requestAnimationFrame(function () {
      syncQuestionImageZoomLabel(target);
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

function normaliseGuidedStep(step, stepIndex) {
  const title = step.title || "Step " + (stepIndex + 1);
  const previewHtml = step.previewHtml || "";
  const workingHtml = step.workingHtml || "";

  return {
    title: title,
    previewHtml: previewHtml,
    workingHtml: normaliseRichTextBlock(workingHtml, "step-text"),
    workingButtonLabel: step.workingButtonLabel || "Show working",
    workingHideLabel: step.workingHideLabel || "Hide working"
  };
}

function buildWalkthroughTipItems(config) {
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

  if (Array.isArray(config.hints) && config.hints.length) {
    config.hints.forEach(function (hint, index) {
      items.push({
        label: "Hint " + (index + 1),
        html: hint
      });
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
  const sourceSteps = Array.isArray(config.guidedSteps) ? config.guidedSteps : [];
  const guidedSteps = sourceSteps.map(function (step, stepIndex) {
    return normaliseGuidedStep(step, stepIndex);
  });

  return Object.assign({}, config, {
    guidedSteps: guidedSteps,
    tips: buildWalkthroughTipItems(config)
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

  function setWorkingVisibility(stepIndex, isVisible) {
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
        setWorkingVisibility(currentStepIndex, true);
        walkthroughComplete = true;
        markCurrentWalkthroughPartComplete();
        updateProgressUi();
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
    hiddenElements: [tipsCard, walkthroughContent]
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
  const reportIssueHtml = 'Found an error or unclear explanation? Report it <a class="site-footer-link" href="https://docs.google.com/forms/d/e/1FAIpQLSfsQWI9kX3BVpUNJbEqUa9gdKiF1rTvNXT4bL0T3_AYYvLpkA/viewform?usp=publish-editor" target="_blank" rel="noopener noreferrer">here</a>.';

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

    if (!footer.querySelector(".site-footer-nav")) {
      const footerNavigation = document.createElement("nav");
      footerNavigation.className = "site-footer-nav";
      footerNavigation.setAttribute("aria-label", "Footer");
      footerNavigation.innerHTML = `
        <a class="site-footer-link" href="/">Home</a>
        <a class="site-footer-link" href="/standards.html">Standards</a>
        <a class="site-footer-link" href="about.html">About</a>
      `;
      footer.appendChild(footerNavigation);
    }

    if (!footer.querySelector(".site-footer-disclaimer")) {
      const disclaimer = document.createElement("p");
      disclaimer.className = "site-footer-text site-footer-disclaimer";
      disclaimer.textContent = "Calc.nz is an independent learning project and is not affiliated with or endorsed by NZQA.";
      footer.appendChild(disclaimer);
    }

    syncSiteNavigationCurrentState(footer);

    if (footer.querySelector(".report-issue-text")) {
      return;
    }

    const reportParagraph = document.createElement("p");
    reportParagraph.className = "site-footer-text report-issue-text";
    reportParagraph.innerHTML = reportIssueHtml;
    footer.appendChild(reportParagraph);
  }

  const initialSiteHeader = ensureSiteHeader();

  function finishSharedPageSetup() {
      if (!initialSiteHeader) {
        ensureSiteHeader();
      }
      const questionCard = document.getElementById("question-card");
      if (questionCard && document.querySelector("main.app:not(.home-app)")) {
        questionCard.classList.add("sticky-question-card");
        ensureStickyQuestionPreferenceControl(questionCard);
        setupQuestionCardSticky(questionCard);
        setupQuestionImageZoom(questionCard);
      }
      normaliseButtonTypes(document);
      ensureReportIssueFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", finishSharedPageSetup);
  } else {
    finishSharedPageSetup();
  }
}());
