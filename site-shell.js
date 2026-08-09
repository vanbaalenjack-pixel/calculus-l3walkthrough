(function () {
  "use strict";

  const SITE_PAGE_NAMES = [
    "index.html",
    "standards.html",
    "skills.html",
    "guides.html",
    "search.html",
    "about.html"
  ];

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
      if (SITE_PAGE_NAMES.indexOf(linkedPage) >= 0 && linkedPage === currentPage) {
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
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(scrollX, scrollY);
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    }
  }

  function siteHeaderLinksHtml() {
    return [
      '<a class="site-header-link" href="/standards.html">Standards</a>',
      '<a class="site-header-link" href="/skills.html">Skills</a>',
      '<a class="site-header-link" href="/search.html">Search</a>',
      '<a class="site-header-link" href="/about.html">About</a>'
    ].join("");
  }

  function createSiteHeader() {
    const siteHeader = document.createElement("header");
    siteHeader.className = "site-header";
    siteHeader.innerHTML = `
      <nav class="site-header-inner" aria-label="Site">
        <a class="site-brand" href="/">Calc.nz</a>
        <button class="site-menu-toggle" type="button" aria-expanded="false" aria-controls="site-header-links">
          <span class="site-menu-label">Menu</span>
          <span class="site-menu-icon" aria-hidden="true"></span>
        </button>
        <div id="site-header-links" class="site-header-links">${siteHeaderLinksHtml()}</div>
      </nav>
    `;
    return siteHeader;
  }

  function syncSiteHeaderMetrics(siteHeader) {
    const header = siteHeader || document.querySelector(".site-header");
    const height = header
      ? Math.ceil(header.getBoundingClientRect().height || header.offsetHeight || 0)
      : 0;
    document.documentElement.style.setProperty("--site-header-height", height + "px");
    document.documentElement.style.setProperty("--site-scroll-offset", height + 24 + "px");
  }

  function setSiteMenuOpen(siteHeader, shouldOpen, options) {
    const toggle = siteHeader && siteHeader.querySelector(".site-menu-toggle");
    const links = siteHeader && siteHeader.querySelector(".site-header-links");
    if (!toggle || !links) {
      return;
    }

    const settings = options || {};
    toggle.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    toggle.setAttribute("aria-label", shouldOpen ? "Close site menu" : "Open site menu");
    siteHeader.classList.toggle("site-menu-open", shouldOpen);
    if (shouldOpen && settings.focusFirst) {
      const firstLink = links.querySelector("a[href]");
      if (firstLink) {
        firstLink.focus();
      }
    }
    if (!shouldOpen && settings.returnFocus) {
      toggle.focus();
    }
  }

  function setupSiteMenu(siteHeader) {
    if (!siteHeader || siteHeader.dataset.menuSetup === "true") {
      return;
    }

    const toggle = siteHeader.querySelector(".site-menu-toggle");
    const links = siteHeader.querySelector(".site-header-links");
    if (!toggle || !links) {
      return;
    }

    siteHeader.dataset.menuSetup = "true";
    toggle.setAttribute("aria-label", "Open site menu");
    toggle.addEventListener("click", function () {
      setSiteMenuOpen(siteHeader, toggle.getAttribute("aria-expanded") !== "true");
    });

    links.addEventListener("click", function (event) {
      if (event.target.closest("a[href]")) {
        setSiteMenuOpen(siteHeader, false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        event.preventDefault();
        setSiteMenuOpen(siteHeader, false, { returnFocus: true });
      }
    });

    document.addEventListener("pointerdown", function (event) {
      if (toggle.getAttribute("aria-expanded") === "true" && !siteHeader.contains(event.target)) {
        setSiteMenuOpen(siteHeader, false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia && window.matchMedia("(min-width: 601px)").matches) {
        setSiteMenuOpen(siteHeader, false);
      }
      syncSiteHeaderMetrics(siteHeader);
    });
  }

  function ensureSiteHeader() {
    const body = document.body;
    if (!body) {
      return null;
    }

    const main = document.querySelector("main");
    if (main && !main.id) {
      main.id = "main-content";
    }
    if (main && !main.hasAttribute("tabindex")) {
      main.setAttribute("tabindex", "-1");
    }

    if (main && !document.querySelector(".skip-link")) {
      const skipLink = document.createElement("a");
      skipLink.className = "skip-link";
      skipLink.href = "#" + main.id;
      skipLink.textContent = "Skip to main content";
      body.insertBefore(skipLink, body.firstChild);
    }

    let siteHeader = document.querySelector(".site-header");
    if (!siteHeader) {
      siteHeader = createSiteHeader();
      if (main && main.parentNode === body) {
        body.insertBefore(siteHeader, main);
      } else {
        body.insertBefore(siteHeader, body.firstChild);
      }
    }

    body.classList.add("has-site-header");
    setupSiteMenu(siteHeader);
    syncSiteNavigationCurrentState(document);
    syncSiteHeaderMetrics(siteHeader);

    if (siteHeader.dataset.metricsSetup !== "true") {
      siteHeader.dataset.metricsSetup = "true";
      window.addEventListener("load", function () { syncSiteHeaderMetrics(siteHeader); });
      window.addEventListener("pageshow", function () { syncSiteHeaderMetrics(siteHeader); });
      if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(function () { syncSiteHeaderMetrics(siteHeader); });
        observer.observe(siteHeader);
        siteHeader._siteShellResizeObserver = observer;
      }
      window.requestAnimationFrame(function () { syncSiteHeaderMetrics(siteHeader); });
    }

    return siteHeader;
  }

  function setupSkillPageTools() {
    const root = document.querySelector("[data-skill-collection]");
    if (!root || root.dataset.skillToolsSetup === "true") {
      return;
    }
    root.dataset.skillToolsSetup = "true";

    const groups = Array.from(root.querySelectorAll("[data-skill-group]"));
    if (window.matchMedia && window.matchMedia("(max-width: 700px)").matches) {
      const openedStandards = Object.create(null);
      groups.forEach(function (group) {
        const standard = group.dataset.standard || "all";
        if (!openedStandards[standard]) {
          openedStandards[standard] = true;
          group.open = true;
        } else {
          group.open = false;
        }
      });
    }

    const status = root.querySelector("[data-skill-filter-status]");
    root.querySelectorAll("[data-skill-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        const filter = button.dataset.skillFilter || "all";
        root.querySelectorAll("[data-skill-filter]").forEach(function (candidate) {
          const selected = candidate === button;
          candidate.classList.toggle("is-active", selected);
          candidate.setAttribute("aria-pressed", selected ? "true" : "false");
        });
        let visibleCount = 0;
        groups.forEach(function (group) {
          const cards = Array.from(group.querySelectorAll("a.index-link-card[href][data-skill-method]"));
          const standardMatches = group.dataset.standard === filter;
          let groupVisibleCount = 0;
          cards.forEach(function (card) {
            const matches = filter === "all"
              || standardMatches
              || card.dataset.skillMethod === filter;
            card.hidden = !matches;
            if (matches) {
              groupVisibleCount += 1;
            }
          });
          group.hidden = groupVisibleCount === 0;
          visibleCount += groupVisibleCount;
        });
        if (status) {
          status.textContent = visibleCount + " matching questions shown.";
        }
      });
    });

    const randomButton = root.querySelector("[data-skill-random]");
    if (randomButton) {
      randomButton.addEventListener("click", function () {
        const links = Array.from(root.querySelectorAll(
          "[data-skill-group]:not([hidden]) a.index-link-card[href][data-skill-method]:not([hidden])"
        ));
        if (!links.length) {
          return;
        }
        const chosen = links[Math.floor(Math.random() * links.length)];
        window.location.href = chosen.href;
      });
    }
  }

  function setupMobilePaperOverview() {
    if (!window.matchMedia || !window.matchMedia("(max-width: 700px)").matches) {
      return;
    }
    document.querySelectorAll("details[data-mobile-paper-overview][open]").forEach(function (details) {
      details.open = false;
    });
  }

  function finishSiteShellSetup() {
    ensureSiteHeader();
    setupSkillPageTools();
    setupMobilePaperOverview();
  }

  document.documentElement.classList.add("js");
  window.ensureSiteHeader = window.ensureSiteHeader || ensureSiteHeader;
  window.focusWithoutPageScroll = window.focusWithoutPageScroll || focusWithoutPageScroll;
  window.syncSiteNavigationCurrentState = window.syncSiteNavigationCurrentState || syncSiteNavigationCurrentState;
  window.syncSiteHeaderMetrics = window.syncSiteHeaderMetrics || syncSiteHeaderMetrics;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", finishSiteShellSetup);
  } else {
    finishSiteShellSetup();
  }
}());
