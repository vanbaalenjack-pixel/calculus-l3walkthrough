(function () {
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(", ");

  function isVisible(element) {
    return Boolean(
      element
      && !element.hidden
      && !element.classList.contains("hidden")
      && getComputedStyle(element).display !== "none"
      && getComputedStyle(element).visibility !== "hidden"
      && element.getClientRects().length
    );
  }

  function visibleFocusables(container) {
    if (!container) {
      return [];
    }

    return Array.from(container.querySelectorAll(focusableSelector)).filter(function (element) {
      return isVisible(element)
        && !element.closest("[hidden], .hidden, [inert]")
        && element.getAttribute("aria-hidden") !== "true";
    });
  }

  function dispatchKey(target, key, shiftKey) {
    const event = new KeyboardEvent("keydown", {
      key: key,
      shiftKey: Boolean(shiftKey),
      bubbles: true,
      cancelable: true
    });
    (target || document).dispatchEvent(event);
    return event;
  }

  function findUnrenderedMathText(root) {
    const walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT);
    const matches = [];
    let node = walker.nextNode();

    while (node) {
      const parent = node.parentElement;
      const value = node.nodeValue || "";
      const ignored = parent && parent.closest("script, style, noscript, .katex");

      if (!ignored && (
        /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]/.test(value)
        || /\\(?:frac|sqrt|operatorname|boxed|overline|left|right|therefore|mathbb|quad|text|begin|end|\(|\)|\[|\])/.test(value)
      )) {
        matches.push(value.trim());
      }
      node = walker.nextNode();
    }

    return matches;
  }

  function overflowDebug() {
    return Array.from(document.body.querySelectorAll("*"))
      .filter(isVisible)
      .map(function (element) {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id || "",
          className: typeof element.className === "string" ? element.className : "",
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        };
      })
      .filter(function (entry) {
        return entry.left < -1 || entry.right > window.innerWidth + 1;
      })
      .slice(0, 8);
  }

  function relativeHref(element) {
    if (!element) {
      return "";
    }
    const url = new URL(element.getAttribute("href"), window.location.href);
    return url.pathname.split("/").pop() + url.search + url.hash;
  }

  function runBasicChecks(checks, debug) {
    const unrenderedMath = findUnrenderedMathText(document.body);
    const brokenImages = Array.from(document.images).filter(function (image) {
      return image.getAttribute("src") && (!image.complete || image.naturalWidth === 0);
    }).map(function (image) {
      return image.getAttribute("src");
    });

    checks.documentReady = document.readyState === "complete";
    checks.katexAvailable = typeof window.katex === "object" || typeof window.katex === "function";
    checks.mathRendered = document.querySelectorAll(".katex").length > 0;
    checks.noKatexErrors = !document.querySelector(".katex-error");
    checks.noUnrenderedMath = unrenderedMath.length === 0;
    checks.imagesLoaded = brokenImages.length === 0;
    checks.noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
    debug.unrenderedMath = unrenderedMath;
    debug.brokenImages = brokenImages;
    debug.viewport = {
      innerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    };
    if (!checks.noHorizontalOverflow) {
      debug.overflow = overflowDebug();
    }
  }

  function checkIntegration2021Labels(checks, debug) {
    const expectedLabels = {
      "1a": "1(a)",
      "1b": "1(b)(i)",
      "1c": "1(b)(ii)",
      "1d": "1(c)",
      "1e": "1(d)"
    };
    const header = document.getElementById("page-title") || document.querySelector(".topbar h1");
    const sidebarLinks = Array.from(document.querySelectorAll("[data-walkthrough-sidebar-part]"));
    const currentLink = document.querySelector('[data-walkthrough-sidebar-part="1b"]');
    const progressText = document.querySelector("[data-walkthrough-paper-progress-text]");

    checks.headerCustomLabel = Boolean(
      header && header.textContent.trim() === "2021 NCEA Level 3 Integration — Question 1(b)(i)"
    );
    checks.sidebarHasAllParts = sidebarLinks.length === 15;
    checks.sidebarCustomLabels = Object.keys(expectedLabels).every(function (part) {
      const link = document.querySelector('[data-walkthrough-sidebar-part="' + part + '"]');
      return link && link.textContent.trim() === expectedLabels[part];
    });
    checks.currentAriaCustomLabel = Boolean(
      currentLink
      && currentLink.getAttribute("aria-label").indexOf("Question 1(b)(i), 2021 Integration") === 0
      && /visited/.test(currentLink.getAttribute("aria-label"))
    );

    const nextButton = document.getElementById("walkthrough-next-btn");
    let guard = 0;
    while (nextButton && !nextButton.disabled && guard < 20) {
      nextButton.click();
      guard += 1;
    }

    const storedProgress = JSON.parse(localStorage.getItem("calc.nz.walkthroughProgress") || "{}");
    const lastVisited = JSON.parse(localStorage.getItem("calc.nz.lastWalkthrough") || "null");
    checks.completedProgress = Boolean(
      storedProgress["level-3-integration-2021:1b"]
      && storedProgress["level-3-integration-2021:1b"].completed
      && currentLink.classList.contains("is-complete")
      && /completed/.test(currentLink.getAttribute("aria-label"))
      && progressText.textContent.trim() === "1 of 15 completed"
    );
    checks.lastVisitedCustomLabel = Boolean(
      lastVisited
      && lastVisited.questionLabel === "Question 1(b)(i)"
      && /Question 1\(b\)\(i\)/.test(lastVisited.label)
    );

    const openToggle = document.getElementById("walkthrough-sidebar-open-toggle");
    const closeToggle = document.getElementById("walkthrough-sidebar-close-toggle");
    setWalkthroughSidebarVisible(false, {
      persist: false,
      focus: false,
      restoreFocus: false
    });
    openToggle.focus();
    openToggle.click();
    checks.desktopOpenMovesFocusInside = Boolean(
      document.body.classList.contains("walkthrough-nav-visible")
      && document.activeElement === closeToggle
    );
    closeToggle.click();
    checks.desktopCloseRestoresOpener = Boolean(
      !document.body.classList.contains("walkthrough-nav-visible")
      && document.activeElement === openToggle
    );
    debug.header = header && header.textContent.trim();
    debug.customSidebarLabels = sidebarLinks.slice(0, 5).map(function (link) {
      return {
        part: link.dataset.walkthroughSidebarPart,
        text: link.textContent.trim(),
        ariaLabel: link.getAttribute("aria-label")
      };
    });
    debug.progressText = progressText && progressText.textContent.trim();
  }

  function checkMobileSidebar(checks, debug) {
    const openToggle = document.getElementById("walkthrough-sidebar-open-toggle");
    const sidebar = document.getElementById("walkthrough-sidebar");
    checks.sidebarStartsClosed = Boolean(
      openToggle
      && sidebar
      && isVisible(openToggle)
      && sidebar.getAttribute("aria-hidden") === "true"
    );

    openToggle.focus();
    openToggle.click();
    const focusables = visibleFocusables(sidebar);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const closeToggle = document.getElementById("walkthrough-sidebar-close-toggle");
    const app = document.querySelector("main.app");
    checks.sidebarOpens = Boolean(
      document.body.classList.contains("walkthrough-nav-mobile-open")
      && sidebar.getAttribute("aria-hidden") === "false"
      && isVisible(sidebar)
    );
    checks.openMovesFocusInside = Boolean(
      closeToggle && document.activeElement === closeToggle && sidebar.contains(document.activeElement)
    );
    checks.sidebarBackgroundInert = Boolean(app && app.inert);

    last.focus();
    const tabEvent = dispatchKey(last, "Tab", false);
    checks.forwardTabContained = Boolean(tabEvent.defaultPrevented && document.activeElement === first);

    first.focus();
    const shiftTabEvent = dispatchKey(first, "Tab", true);
    checks.backwardTabContained = Boolean(shiftTabEvent.defaultPrevented && document.activeElement === last);

    const escapeEvent = dispatchKey(document.activeElement, "Escape", false);
    checks.escapeClosesSidebar = Boolean(
      escapeEvent.defaultPrevented
      && !document.body.classList.contains("walkthrough-nav-mobile-open")
      && sidebar.getAttribute("aria-hidden") === "true"
      && document.activeElement === openToggle
    );
    checks.sidebarBackgroundRestored = Boolean(app && !app.inert);
    debug.sidebarFocusables = focusables.map(function (element) {
      return element.id || element.textContent.trim().slice(0, 50);
    });
    debug.activeAfterEscape = document.activeElement && (
      document.activeElement.id || document.activeElement.textContent.trim().slice(0, 50)
    );
  }

  function checkCaption(checks, expectedText) {
    const table = document.querySelector("table.question-data-table");
    const caption = table && table.querySelector("caption");
    checks.tablePresent = Boolean(table);
    checks.captionPresent = Boolean(caption && caption.textContent.trim());
    checks.captionDescriptive = Boolean(
      caption
      && caption.classList.contains("visually-hidden")
      && caption.textContent.trim() === expectedText
    );
  }

  function checkSequence(checks, expected) {
    const topbarBack = document.querySelector(".topbar .ghost-link");
    const legacyNav = Array.from(document.querySelectorAll("#walkthrough-content .nav-row a"));
    const configuredNext = window.__walkthroughCurrentConfig
      && window.__walkthroughCurrentConfig.nextHref;
    checks.paperBackLink = relativeHref(topbarBack) === "level-3-differentiation-2022.html";
    checks.previousBoundary = !expected.previous || legacyNav.some(function (link) {
      return relativeHref(link) === expected.previous;
    });
    checks.nextBoundary = !expected.next || legacyNav.some(function (link) {
      return relativeHref(link) === expected.next;
    });
    checks.configuredNext = !expected.next || configuredNext === expected.next;
  }

  function checkImageLightbox(checks, debug) {
    const target = document.querySelector("img.question-screenshot");
    const originalAlt = target && target.alt;
    const zoomLabel = target && target.getAttribute("aria-label");
    checks.zoomTargetReady = Boolean(target && target.complete && target.naturalWidth > 0);
    checks.zoomNamePreservesDescription = Boolean(
      originalAlt
      && zoomLabel
      && zoomLabel !== "Open larger view"
      && zoomLabel.indexOf(originalAlt) >= 0
    );

    target.focus();
    target.click();
    const lightbox = document.getElementById("question-image-lightbox");
    const closeButton = lightbox && lightbox.querySelector(".question-image-lightbox-close");
    const main = document.querySelector("main");
    checks.lightboxOpens = Boolean(lightbox && !lightbox.hidden);
    checks.lightboxInitialFocus = Boolean(closeButton && document.activeElement === closeButton);
    checks.backgroundInert = Boolean(main && main.closest("[inert]"));

    closeButton.focus();
    const tabEvent = dispatchKey(closeButton, "Tab", false);
    const forwardContained = tabEvent.defaultPrevented && document.activeElement === closeButton;
    const shiftTabEvent = dispatchKey(closeButton, "Tab", true);
    checks.lightboxFocusContained = Boolean(
      forwardContained
      && shiftTabEvent.defaultPrevented
      && document.activeElement === closeButton
    );

    const escapeEvent = dispatchKey(closeButton, "Escape", false);
    checks.escapeClosesLightbox = Boolean(escapeEvent.defaultPrevented && lightbox.hidden);
    checks.lightboxRestoresFocus = document.activeElement === target;
    checks.backgroundRestored = Boolean(main && !main.closest("[inert]"));
    debug.imageAlt = originalAlt;
    debug.imageZoomLabel = zoomLabel;
    debug.activeAfterLightbox = document.activeElement && document.activeElement.outerHTML.slice(0, 240);
  }

  function checkGraphZoomName(checks, debug) {
    const targets = Array.from(document.querySelectorAll(".question-graph-frame"));
    checks.graphZoomTargets = targets.length >= 2;
    checks.graphNamesPreserved = targets.every(function (target) {
      const label = target.getAttribute("aria-label") || "";
      const childLabel = (target.querySelector("[aria-label]") || {}).getAttribute
        ? target.querySelector("[aria-label]").getAttribute("aria-label")
        : "";
      return label
        && label !== "Open larger view"
        && childLabel
        && label.indexOf(childLabel) >= 0;
    });

    const firstTarget = targets[0];
    firstTarget.focus();
    firstTarget.click();
    const lightbox = document.getElementById("question-image-lightbox");
    const graphicStage = lightbox && lightbox.querySelector(".question-image-lightbox-graphic");
    const graphicClone = graphicStage && graphicStage.firstElementChild;
    checks.graphPreviewOpens = Boolean(lightbox && !lightbox.hidden && graphicClone);
    checks.graphPreviewHasNoDeadZoomControl = Boolean(
      graphicClone
      && !graphicClone.matches(".question-image-zoomable, [data-image-zoom-setup='true']")
      && !graphicClone.hasAttribute("role")
      && !graphicClone.hasAttribute("tabindex")
      && !graphicClone.hasAttribute("aria-label")
      && !graphicClone.querySelector(".question-image-zoomable, [data-image-zoom-setup='true']")
    );
    const closeButton = lightbox && lightbox.querySelector(".question-image-lightbox-close");
    if (closeButton) {
      closeButton.click();
    }
    checks.graphPreviewRestoresFocus = document.activeElement === firstTarget;
    debug.graphZoomLabels = targets.map(function (target) {
      return {
        label: target.getAttribute("aria-label"),
        childLabel: (target.querySelector("[aria-label]") || {}).getAttribute
          ? target.querySelector("[aria-label]").getAttribute("aria-label")
          : null
      };
    });
  }

  function checkRawMathHeading(checks, debug) {
    const renderedHeadings = Array.from(document.querySelectorAll(
      ".walkthrough-step-card h2, .walkthrough-step-card h3"
    )).filter(function (heading) {
      return heading.querySelector(".katex");
    });
    checks.mathRenderedInStepHeading = renderedHeadings.length > 0;
    debug.mathHeadings = renderedHeadings.map(function (heading) {
      return heading.textContent.trim();
    }).slice(0, 8);

    if (/^complex-(?:201[7-9]|202[0-4])\.html$/.test(window.location.pathname.split("/").pop())) {
      const part = new URLSearchParams(window.location.search).get("q");
      const questionLabel = part && part.length === 2
        ? "Question " + part.charAt(0) + "(" + part.charAt(1) + ")"
        : "";
      const expectedCanonical = "https://calc.nz" + window.location.pathname + "?q=" + part;
      const canonical = document.querySelector('link[rel="canonical"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');
      const currentBreadcrumb = document.querySelector("[data-seo-breadcrumb-question]");
      const overview = document.querySelector(".seo-question-overview");
      const summary = document.querySelector("[data-seo-summary]");
      let learningResource = null;

      try {
        const structuredData = JSON.parse(document.getElementById("seo-structured-data").textContent);
        learningResource = (structuredData["@graph"] || []).find(function (item) {
          return item["@type"] === "LearningResource";
        }) || null;
      } catch (error) {
        debug.dynamicSeoJsonError = String(error);
      }

      checks.dynamicSeoCanonical = Boolean(canonical && canonical.href === expectedCanonical);
      checks.dynamicSeoOpenGraphUrl = Boolean(ogUrl && ogUrl.content === expectedCanonical);
      checks.dynamicSeoTitle = document.title.indexOf(questionLabel) >= 0;
      checks.dynamicSeoHeading = Boolean(document.getElementById("page-title") && document.getElementById("page-title").textContent.indexOf(questionLabel) >= 0);
      checks.dynamicSeoBreadcrumb = Boolean(currentBreadcrumb && currentBreadcrumb.textContent.trim() === questionLabel);
      checks.dynamicSeoVisibleOverview = Boolean(overview && isVisible(overview) && overview.textContent.trim().length > 80);
      checks.dynamicSeoVisibleSummary = Boolean(summary && isVisible(summary) && summary.textContent.trim().length > 40);
      checks.dynamicSeoStructuredData = Boolean(learningResource && learningResource.url === expectedCanonical);
      debug.dynamicSeo = {
        expectedCanonical: expectedCanonical,
        canonical: canonical && canonical.href,
        title: document.title,
        heading: document.getElementById("page-title") && document.getElementById("page-title").textContent.trim()
      };
    }
  }

  function checkSeoLanding(checks, debug, kind) {
    const expectedCanonical = "https://calc.nz" + window.location.pathname;
    const canonical = document.querySelector('link[rel="canonical"]');
    const description = document.querySelector('meta[name="description"]');
    const breadcrumb = document.querySelector(".seo-breadcrumbs");
    const h1 = document.querySelector("main h1");
    const structuredDataScript = document.getElementById("seo-structured-data");
    let structuredNodes = [];

    try {
      const structuredData = JSON.parse(structuredDataScript.textContent);
      structuredNodes = structuredData["@graph"] || [structuredData];
    } catch (error) {
      debug.seoLandingJsonError = String(error);
    }

    checks.landingCanonical = Boolean(canonical && canonical.href === expectedCanonical);
    checks.landingDescription = Boolean(description && description.content.trim().length >= 100);
    checks.landingTitle = document.title.trim().length >= 40;
    checks.landingHeading = Boolean(h1 && isVisible(h1) && /AS91577/.test(h1.textContent));
    checks.landingBreadcrumb = Boolean(breadcrumb && isVisible(breadcrumb) && breadcrumb.querySelector("a[href]"));
    checks.landingWebPageSchema = structuredNodes.some(function (node) {
      return node["@type"] === "WebPage" && node.url === expectedCanonical;
    });
    checks.landingBreadcrumbSchema = structuredNodes.some(function (node) {
      return node["@type"] === "BreadcrumbList";
    });
    checks.landingDisclaimer = /independent/i.test(document.body.textContent) && /not affiliated|independent of NZQA/i.test(document.body.textContent);

    if (kind === "standard") {
      const yearLinks = Array.from(document.querySelectorAll('a[href^="level-3-complex-numbers-20"]'));
      const questionLinks = Array.from(document.querySelectorAll('a[href^="complex-"]')).filter(function (link) {
        return /(?:\.html\?q=|complex-[123][a-e]2025\.html)/.test(link.getAttribute("href"));
      });
      checks.standardAllYearsLinked = new Set(yearLinks.map(function (link) {
        return link.getAttribute("href");
      })).size === 9;
      checks.standardEveryQuestionLinked = new Set(questionLinks.map(function (link) {
        return link.getAttribute("href");
      })).size === 135;
      checks.standardReasoningVisible = /Achieved/.test(document.body.textContent) && /Merit/.test(document.body.textContent) && /Excellence/.test(document.body.textContent);
    } else {
      const questionLinks = Array.from(document.querySelectorAll('a[href^="complex-2022.html?q="]'));
      const officialLinks = Array.from(document.querySelectorAll('a[href*="nzqa.govt.nz"]'));
      checks.yearEveryQuestionLinked = new Set(questionLinks.map(function (link) {
        return link.getAttribute("href");
      })).size === 15;
      checks.yearOfficialSources = officialLinks.length >= 5;
      checks.yearPriorityCopy = /2022 NCEA complex numbers worked answers/i.test(document.body.textContent);
    }

    debug.seoLanding = {
      kind: kind,
      canonical: canonical && canonical.href,
      title: document.title,
      heading: h1 && h1.textContent.trim()
    };
  }

  function checkHintMath(checks, debug) {
    const hintsButton = document.getElementById("show-hints-btn");
    const hintsCard = document.getElementById("hints-card");
    checks.hintsControlPresent = Boolean(hintsButton && hintsCard);
    hintsButton.click();
    const unrenderedHints = findUnrenderedMathText(hintsCard);
    checks.hintsVisible = isVisible(hintsCard);
    checks.hintMathRendered = hintsCard.querySelectorAll(".katex").length > 0;
    checks.noUnrenderedHintMath = unrenderedHints.length === 0;
    debug.unrenderedHints = unrenderedHints;
    debug.hintKatexCount = hintsCard.querySelectorAll(".katex").length;
  }

  function checkFeedbackMath(checks, debug) {
    const stepOneOptions = Array.from(document.querySelectorAll("#step-1 .option-btn"));
    const stepTwoOptions = Array.from(document.querySelectorAll("#step-2 .option-btn"));
    const feedbackOne = document.getElementById("feedback-1");
    const feedbackTwo = document.getElementById("feedback-2");
    checks.feedbackControlsPresent = stepOneOptions.length >= 2
      && stepTwoOptions.length >= 1
      && Boolean(feedbackOne)
      && Boolean(feedbackTwo);
    stepOneOptions[1].click();
    const wrongKatex = feedbackOne.querySelectorAll(".katex").length;
    const wrongUnrendered = findUnrenderedMathText(feedbackOne);
    stepTwoOptions[0].click();
    const correctKatex = feedbackTwo.querySelectorAll(".katex").length;
    const correctUnrendered = findUnrenderedMathText(feedbackTwo);
    checks.wrongFeedbackMathRendered = wrongKatex > 0 && wrongUnrendered.length === 0;
    checks.correctFeedbackMathRendered = correctKatex >= 2 && correctUnrendered.length === 0;
    debug.feedback = {
      wrongKatex: wrongKatex,
      wrongUnrendered: wrongUnrendered,
      correctKatex: correctKatex,
      correctUnrendered: correctUnrendered,
      wrongText: feedbackOne.textContent.trim(),
      correctText: feedbackTwo.textContent.trim()
    };
  }

  window.runSiteRegressionSmokeCheck = function (mode) {
    const checks = {};
    const debug = { mode: mode, url: window.location.href };

    if (mode === "seo-standard-landing") {
      checkSeoLanding(checks, debug, "standard");
    } else if (mode === "seo-year-landing") {
      checkSeoLanding(checks, debug, "year");
    } else if (mode === "integration-2021-labels") {
      checkIntegration2021Labels(checks, debug);
    } else if (mode === "mobile-sidebar") {
      checkMobileSidebar(checks, debug);
    } else if (mode === "caption-2021") {
      checkCaption(
        checks,
        "Values of x and f of x from one to two point five in steps of zero point two five"
      );
    } else if (mode === "caption-2022") {
      checkCaption(
        checks,
        "Values of x and f of x from zero to two in steps of zero point four"
      );
    } else if (mode === "sequence-1e") {
      checkSequence(checks, { previous: "1d2022.html", next: "2a2022.html" });
    } else if (mode === "sequence-2a") {
      checkSequence(checks, { previous: "1e2022.html", next: "2b2022.html" });
    } else if (mode === "sequence-2e") {
      checkSequence(checks, { previous: "2d2022.html", next: "3a2022.html" });
    } else if (mode === "sequence-3a") {
      checkSequence(checks, { previous: "2e2022.html", next: "3b2022.html" });
    } else if (mode === "image-lightbox") {
      checkImageLightbox(checks, debug);
    } else if (mode === "graph-zoom-name") {
      checkGraphZoomName(checks, debug);
    } else if (mode === "raw-math-heading") {
      checkRawMathHeading(checks, debug);
    } else if (mode === "rendered-math-page") {
      checks.renderedMathPage = document.querySelectorAll(".katex").length > 0;
    } else if (mode === "hint-math") {
      checkHintMath(checks, debug);
    } else if (mode === "feedback-math") {
      checkFeedbackMath(checks, debug);
    } else {
      checks.knownMode = false;
    }

    runBasicChecks(checks, debug);
    const errors = window.__siteRegressionErrors || [];
    checks.noConsoleOrResourceErrors = errors.length === 0;
    const failedChecks = Object.keys(checks).filter(function (key) {
      return !checks[key];
    });
    return JSON.stringify({
      checks: checks,
      failedChecks: failedChecks,
      errors: errors,
      debug: debug
    });
  };
}());
