(function () {
  "use strict";

  const visualSelector = [
    "img",
    "svg",
    "canvas",
    "video",
    "object[type='image/svg+xml']",
    "embed[type='image/svg+xml']"
  ].join(",");

  function uniqueStrings(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function describeElement(element) {
    if (!element) {
      return "unknown";
    }

    const pieces = [element.tagName.toLowerCase()];
    if (element.id) {
      pieces.push("#" + element.id);
    }
    if (typeof element.className === "string" && element.className.trim()) {
      pieces.push("." + element.className.trim().split(/\s+/).slice(0, 4).join("."));
    } else if (element.classList && element.classList.length) {
      pieces.push("." + Array.from(element.classList).slice(0, 4).join("."));
    }
    return pieces.join("");
  }

  function isAuditClone(element) {
    return Boolean(element && element.closest(
      "#question-image-lightbox, template, noscript, svg defs, "
        + ".katex-html, .MathJax, mjx-container"
    ));
  }

  function isRendered(element) {
    if (!element || isAuditClone(element)) {
      return false;
    }
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none"
      && style.visibility !== "hidden"
      && Number(style.opacity || 1) !== 0
      && rect.width > 0
      && rect.height > 0;
  }

  function revealElementAncestors(element) {
    let current = element;
    while (current && current !== document.body) {
      if (current.closest && current.closest("#question-image-lightbox")) {
        return;
      }
      if (current.hidden) {
        current.hidden = false;
      }
      if (current.classList) {
        current.classList.remove("hidden", "exam-mode-hidden");
      }
      if (current.matches && current.matches("details")) {
        current.open = true;
      }
      current = current.parentElement;
    }
  }

  function clickSafeButton(selector) {
    const button = document.querySelector(selector);
    if (!button || button.disabled || button.tagName.toLowerCase() !== "button") {
      return false;
    }
    button.click();
    return true;
  }

  function clickButtonElement(button) {
    if (!button
        || button.tagName.toLowerCase() !== "button"
        || button.disabled
        || button.getAttribute("aria-disabled") === "true") {
      return false;
    }
    button.click();
    return true;
  }

  function exerciseWalkthroughControls() {
    clickSafeButton("#show-hints-btn");
    clickSafeButton("#show-walkthrough-btn");

    Array.from(document.querySelectorAll("[data-working-step]"))
      .forEach(clickButtonElement);

    Array.from(document.querySelectorAll(".next-step-btn"))
      .forEach(clickButtonElement);

    let guard = 0;
    let nextButton = document.getElementById("walkthrough-next-btn");
    while (nextButton && !nextButton.disabled && guard < 100) {
      const before = (document.getElementById("walkthrough-progress-status") || {}).textContent || "";
      if (!clickButtonElement(nextButton)) {
        break;
      }
      guard += 1;
      Array.from(document.querySelectorAll("[data-working-step]"))
        .filter(function (button) {
          return button.getAttribute("aria-expanded") !== "true";
        })
        .forEach(clickButtonElement);
      nextButton = document.getElementById("walkthrough-next-btn");
      const after = (document.getElementById("walkthrough-progress-status") || {}).textContent || "";
      if (nextButton && !nextButton.disabled && before === after) {
        break;
      }
    }

    Array.from(document.querySelectorAll('[role="tab"][aria-controls]'))
      .forEach(function (tab) {
        const panel = document.getElementById(tab.getAttribute("aria-controls"));
        if (panel && panel.getAttribute("role") === "tabpanel"
            && typeof tab.click === "function") {
          tab.click();
        }
      });

    clickSafeButton("#show-answer-btn");
  }

  function revealKnownWalkthroughContainers() {
    const selectors = [
      "#hints-card",
      "#tips-card",
      "#walkthrough-content",
      "#answer-card",
      ".hint-body",
      ".walkthrough-step-card",
      ".walkthrough-step-working",
      ".legacy-managed-step",
      ".legacy-step-working",
      ".step-card",
      ".graph-card",
      "[role='tabpanel']"
    ];

    document.querySelectorAll(selectors.join(",")).forEach(function (element) {
      if (element.closest("#question-image-lightbox")) {
        return;
      }
      element.hidden = false;
      element.classList.remove("hidden", "exam-mode-hidden");
      if (element.hasAttribute("aria-hidden")) {
        element.setAttribute("aria-hidden", "false");
      }
    });
  }

  window.prepareVisualAssetAudit = function () {
    try {
      window.localStorage.setItem("calc.nz.examMode", "false");
    } catch (error) {
      // Storage can be unavailable in hardened browser configurations.
    }

    const examSetting = document.getElementById("exam-mode-setting");
    if (examSetting && examSetting.checked) {
      examSetting.checked = false;
      examSetting.dispatchEvent(new Event("change", { bubbles: true }));
    }

    clickSafeButton("#exam-mode-reveal-btn");
    exerciseWalkthroughControls();
    revealKnownWalkthroughContainers();

    const candidates = Array.from(document.querySelectorAll(visualSelector))
      .filter(function (element) {
        return !isAuditClone(element);
      });

    candidates.forEach(function (element) {
      revealElementAncestors(element);
      if (element.tagName.toLowerCase() === "img") {
        element.loading = "eager";
      }
    });

    document.querySelectorAll("details").forEach(function (details) {
      if (details.querySelector(visualSelector)) {
        details.open = true;
      }
    });

    window.dispatchEvent(new Event("resize"));
    window.scrollTo(0, 0);
    window.__visualAssetAuditPrepared = true;
    return candidates.length;
  };

  function svgAccessibleName(svg) {
    const ariaLabel = (svg.getAttribute("aria-label") || "").trim();
    if (ariaLabel) {
      return ariaLabel;
    }

    const labelledBy = (svg.getAttribute("aria-labelledby") || "").trim();
    if (labelledBy) {
      const text = labelledBy.split(/\s+/).map(function (id) {
        const label = document.getElementById(id);
        return label ? label.textContent.trim() : "";
      }).filter(Boolean).join(" ");
      if (text) {
        return text;
      }
    }

    const title = Array.from(svg.children).find(function (child) {
      return child.tagName && child.tagName.toLowerCase() === "title";
    });
    return title ? title.textContent.trim() : "";
  }

  function isDecorativeSvg(svg) {
    const role = (svg.getAttribute("role") || "").toLowerCase();
    return svg.getAttribute("aria-hidden") === "true"
      || role === "none"
      || role === "presentation";
  }

  function blackFill(fill) {
    const value = String(fill || "").replace(/\s+/g, "").toLowerCase();
    return value === "black"
      || value === "#000"
      || value === "#000000"
      || value === "rgb(0,0,0)"
      || value === "rgba(0,0,0,1)";
  }

  function transparentPaint(paint) {
    const value = String(paint || "").replace(/\s+/g, "").toLowerCase();
    return !value
      || value === "none"
      || value === "transparent"
      || value === "rgba(0,0,0,0)";
  }

  function rgbComponents(paint) {
    const match = String(paint || "").match(/rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)/i);
    return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
  }

  function isDarkPaint(paint) {
    const rgb = rgbComponents(paint);
    return Boolean(rgb && (rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722) < 110);
  }

  function isWhitePaint(paint) {
    const rgb = rgbComponents(paint);
    return Boolean(rgb && rgb.every(function (component) { return component >= 245; }));
  }

  function directViewBox(svg) {
    const box = svg && svg.viewBox && svg.viewBox.baseVal;
    return Boolean(box && box.width > 0 && box.height > 0);
  }

  function printHidingRules() {
    const selectors = [];

    function visitRules(rules, inPrintMedia) {
      Array.from(rules || []).forEach(function (rule) {
        if (rule.type === CSSRule.MEDIA_RULE) {
          const isPrint = inPrintMedia || /(^|\W)print(\W|$)/i.test(rule.conditionText || "");
          visitRules(rule.cssRules, isPrint);
          return;
        }
        if (rule.cssRules) {
          visitRules(rule.cssRules, inPrintMedia);
          return;
        }
        if (inPrintMedia
            && rule.type === CSSRule.STYLE_RULE
            && rule.selectorText
            && (rule.style.display === "none" || rule.style.visibility === "hidden")) {
          selectors.push(rule.selectorText);
        }
      });
    }

    Array.from(document.styleSheets).forEach(function (sheet) {
      try {
        visitRules(sheet.cssRules, false);
      } catch (error) {
        // Cross-origin stylesheets are not inspectable, but local print rules still are.
      }
    });
    return uniqueStrings(selectors);
  }

  function hiddenByPrintSelector(visual, selectors) {
    let current = visual;
    while (current && current !== document.documentElement) {
      const matched = selectors.find(function (selector) {
        try {
          return current.matches(selector);
        } catch (error) {
          return false;
        }
      });
      if (matched) {
        return { element: describeElement(visual), hiddenBy: describeElement(current), selector: matched };
      }
      current = current.parentElement;
    }
    return null;
  }

  function graphGuideCanEncloseFill(element) {
    const tag = element.tagName.toLowerCase();
    if (["polygon", "rect", "circle", "ellipse"].includes(tag)) {
      return true;
    }
    if (tag === "polyline") {
      const points = (element.getAttribute("points") || "").trim().split(/\s+/);
      return points.length >= 3;
    }
    if (tag !== "path") {
      return false;
    }

    const pathData = element.getAttribute("d") || "";
    const commands = pathData.match(/[a-df-z]/gi) || [];
    if (commands.some(function (command) { return command.toLowerCase() === "z"; })) {
      return true;
    }
    if (commands.some(function (command) {
      return /[acqst]/i.test(command);
    })) {
      return true;
    }
    const drawingCommands = commands.filter(function (command) {
      return /[lhv]/i.test(command);
    });
    return drawingCommands.length >= 2;
  }

  function scrollableAncestor(element) {
    let current = element.parentElement;
    while (current && current !== document.body) {
      const style = getComputedStyle(current);
      if (/(auto|scroll)/.test(style.overflowX)
          && current.scrollWidth > current.clientWidth + 1) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  function clippingIssue(element) {
    const rect = element.getBoundingClientRect();
    let current = element.parentElement;
    while (current && current !== document.body) {
      const style = getComputedStyle(current);
      if (/(hidden|clip)/.test(style.overflowX + " " + style.overflowY)) {
        const ancestorRect = current.getBoundingClientRect();
        if (rect.left < ancestorRect.left - 1
            || rect.right > ancestorRect.right + 1
            || rect.top < ancestorRect.top - 1
            || rect.bottom > ancestorRect.bottom + 1) {
          return describeElement(current);
        }
      }
      current = current.parentElement;
    }
    return "";
  }

  function metricFor(element) {
    const rect = element.getBoundingClientRect();
    return {
      element: describeElement(element),
      width: Math.round(rect.width * 10) / 10,
      height: Math.round(rect.height * 10) / 10,
      left: Math.round(rect.left * 10) / 10,
      right: Math.round(rect.right * 10) / 10
    };
  }

  function overflowElements() {
    return Array.from(document.body.querySelectorAll("*"))
      .filter(isRendered)
      .map(metricFor)
      .filter(function (entry) {
        return entry.left < -1 || entry.right > document.documentElement.clientWidth + 1;
      })
      .slice(0, 20);
  }

  function backgroundVisuals() {
    return Array.from(document.body.querySelectorAll("*"))
      .filter(function (element) {
        if (isAuditClone(element)) {
          return false;
        }
        return /url\(/.test(getComputedStyle(element).backgroundImage || "");
      });
  }

  function issueCounts(issues) {
    const counts = {};
    Object.keys(issues).forEach(function (key) {
      counts[key] = Array.isArray(issues[key]) ? issues[key].length : Number(Boolean(issues[key]));
    });
    return counts;
  }

  window.runVisualAssetAudit = function (viewportName, expectedWidth) {
    if (!window.__visualAssetAuditPrepared) {
      window.prepareVisualAssetAudit();
    }

    const allVisuals = Array.from(document.querySelectorAll(visualSelector))
      .filter(function (element) { return !isAuditClone(element); });
    const renderedVisuals = allVisuals.filter(isRendered);
    const backgrounds = backgroundVisuals();
    const issues = {
      brokenImages: [],
      imageMetadata: [],
      invalidDimensions: [],
      distortedImages: [],
      overflowingVisuals: [],
      clippedVisuals: [],
      unnamedSvg: [],
      graphSvgContract: [],
      blackGraphGuideFills: [],
      lostIntentionalShading: [],
      hiddenByPrintRule: [],
      coneRegression: [],
      filledEqualityLocus: [],
      legacyPlotInteractivity: [],
      viewportMismatch: []
    };

    Array.from(document.images).filter(function (image) {
      return !isAuditClone(image) && Boolean(image.getAttribute("src") || image.getAttribute("srcset"));
    }).forEach(function (image) {
      const source = image.currentSrc || image.getAttribute("src") || image.getAttribute("srcset");
      if (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
        issues.brokenImages.push({
          element: describeElement(image),
          source: source,
          complete: image.complete,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight
        });
        return;
      }

      const alt = image.getAttribute("alt");
      const declaredWidth = Number(image.getAttribute("width"));
      const declaredHeight = Number(image.getAttribute("height"));
      if (alt == null || !alt.trim()) {
        issues.imageMetadata.push({
          element: describeElement(image),
          source: source,
          reason: "authored image needs non-empty alt text"
        });
      }
      if (!(declaredWidth > 0 && declaredHeight > 0)) {
        issues.imageMetadata.push({
          element: describeElement(image),
          source: source,
          reason: "authored image needs positive width and height attributes"
        });
      } else if (declaredWidth !== image.naturalWidth || declaredHeight !== image.naturalHeight) {
        issues.imageMetadata.push({
          element: describeElement(image),
          source: source,
          reason: "declared image dimensions do not match natural dimensions",
          declared: [declaredWidth, declaredHeight],
          natural: [image.naturalWidth, image.naturalHeight]
        });
      }
    });

    renderedVisuals.forEach(function (visual) {
      const rect = visual.getBoundingClientRect();
      const tag = visual.tagName.toLowerCase();
      if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height)
          || rect.width < 1 || rect.height < 1) {
        issues.invalidDimensions.push(metricFor(visual));
      }

      if (tag === "svg") {
        const box = visual.viewBox && visual.viewBox.baseVal;
        const hasViewBox = Boolean(box && box.width > 0 && box.height > 0);
        const width = Number.parseFloat(visual.getAttribute("width"));
        const height = Number.parseFloat(visual.getAttribute("height"));
        if (!hasViewBox && !(width > 0 && height > 0)) {
          issues.invalidDimensions.push(Object.assign(metricFor(visual), {
            reason: "SVG has neither a positive viewBox nor intrinsic width and height"
          }));
        }
      }

      if (tag === "canvas" && (visual.width <= 0 || visual.height <= 0)) {
        issues.invalidDimensions.push(Object.assign(metricFor(visual), {
          reason: "canvas has non-positive intrinsic dimensions"
        }));
      }

      if (tag === "img" && visual.naturalWidth > 0 && visual.naturalHeight > 0) {
        const renderedRatio = rect.width / rect.height;
        const naturalRatio = visual.naturalWidth / visual.naturalHeight;
        const objectFit = getComputedStyle(visual).objectFit;
        if ((objectFit === "fill" || objectFit === "")
            && Math.abs(renderedRatio / naturalRatio - 1) > 0.08) {
          issues.distortedImages.push(Object.assign(metricFor(visual), {
            renderedRatio: Math.round(renderedRatio * 1000) / 1000,
            naturalRatio: Math.round(naturalRatio * 1000) / 1000
          }));
        }
      }

      const outsideViewport = rect.left < -1
        || rect.right > document.documentElement.clientWidth + 1;
      if (outsideViewport && !scrollableAncestor(visual)) {
        issues.overflowingVisuals.push(metricFor(visual));
      }

      const clippedBy = clippingIssue(visual);
      if (clippedBy) {
        issues.clippedVisuals.push(Object.assign(metricFor(visual), { clippedBy: clippedBy }));
      }
    });

    allVisuals.filter(function (visual) {
      return visual.tagName.toLowerCase() === "svg"
        && !visual.ownerSVGElement
        && !isDecorativeSvg(visual);
    }).forEach(function (svg) {
      if (!svgAccessibleName(svg)) {
        issues.unnamedSvg.push(describeElement(svg));
      }
    });

    Array.from(document.querySelectorAll("svg.graph-svg")).filter(function (svg) {
      return !svg.ownerSVGElement && !isAuditClone(svg);
    }).forEach(function (svg) {
      const failures = [];
      if ((svg.getAttribute("role") || "").toLowerCase() !== "img") {
        failures.push("missing role=img");
      }
      if (!directViewBox(svg)) {
        failures.push("missing positive viewBox");
      }
      if (!svgAccessibleName(svg)) {
        failures.push("missing accessible name");
      }
      if (failures.length) {
        issues.graphSvgContract.push({ element: describeElement(svg), failures: failures });
      }
    });

    Array.from(document.querySelectorAll(".graph-guide")).forEach(function (guide) {
      const fill = getComputedStyle(guide).fill;
      if (blackFill(fill) && graphGuideCanEncloseFill(guide)) {
        issues.blackGraphGuideFills.push({
          element: describeElement(guide),
          fill: fill,
          path: (guide.getAttribute("d") || guide.getAttribute("points") || "").slice(0, 180)
        });
      }
    });

    Array.from(document.querySelectorAll(".question-shade, .question-shade-strong"))
      .filter(function (shade) { return !isAuditClone(shade); })
      .forEach(function (shade) {
        const fill = getComputedStyle(shade).fill;
        if (transparentPaint(fill)) {
          issues.lostIntentionalShading.push({
            element: describeElement(shade),
            fill: fill,
            reason: "intentional question shading computed to no fill"
          });
        }
      });

    const printSelectors = printHidingRules();
    renderedVisuals.forEach(function (visual) {
      const printIssue = hiddenByPrintSelector(visual, printSelectors);
      if (printIssue) {
        issues.hiddenByPrintRule.push(printIssue);
      }
    });

    if (/\/1e2021\.html$/.test(window.location.pathname)) {
      const cone = document.querySelector('svg.graph-svg[aria-label*="Cone"]');
      if (!cone) {
        issues.coneRegression.push("cone-and-cylinder SVG is missing");
      } else {
        const outline = Array.from(cone.querySelectorAll("path.question-curve")).find(function (path) {
          return /^M\s*90\s+332\s+L\s*260\s+46\s+L\s*430\s+332/i.test(
            path.getAttribute("d") || ""
          );
        });
        const mask = Array.from(cone.querySelectorAll("path.graph-bg")).find(function (path) {
          return /^M\s*156\s+214\s+H\s*364/i.test(path.getAttribute("d") || "");
        });
        const centre = Array.from(cone.querySelectorAll("path.graph-guide")).find(function (path) {
          return /^M\s*260\s+46\s+L\s*260\s+332/i.test(path.getAttribute("d") || "");
        });
        const labels = ["h", "r", "3 m", "1.5 m"];
        const visibleLabels = Array.from(cone.querySelectorAll("text")).filter(isRendered)
          .map(function (text) { return text.textContent.trim(); });

        if (!outline
            || !transparentPaint(getComputedStyle(outline).fill)
            || !isDarkPaint(getComputedStyle(outline).stroke)) {
          issues.coneRegression.push("cone outline must have no fill and a dark stroke");
        }
        if (!mask || !isWhitePaint(getComputedStyle(mask).fill)) {
          issues.coneRegression.push("white cylinder-body mask is missing");
        }
        if (!centre
            || transparentPaint(getComputedStyle(centre).stroke)
            || /^(none|0(px)?)(,?\s*0(px)?)?$/i.test(
              getComputedStyle(centre).strokeDasharray || ""
            )) {
          issues.coneRegression.push("dashed centre construction line is missing");
        }
        labels.forEach(function (label) {
          if (!visibleLabels.includes(label)) {
            issues.coneRegression.push("visible cone label missing: " + label);
          }
        });
      }
    }

    const query = new URLSearchParams(window.location.search);
    if (/\/complex-2021\.html$/.test(window.location.pathname)
        && ["1e", "2e"].includes(query.get("q"))) {
      Array.from(document.querySelectorAll("svg.graph-svg circle")).forEach(function (circle) {
        const radius = Number(circle.getAttribute("r"));
        const fill = getComputedStyle(circle).fill;
        if (radius >= 20 && !transparentPaint(fill)) {
          issues.filledEqualityLocus.push({
            element: describeElement(circle),
            radius: radius,
            fill: fill,
            reason: "an equality locus must be an outline, not a filled disk"
          });
        }
      });
    }

    Array.from(document.querySelectorAll(".walkthrough-plot-frame")).forEach(function (plot) {
      const svg = plot.querySelector("svg");
      const failures = [];
      if (plot.classList.contains("interactive-plot-frame")) {
        failures.push("interactive-plot-frame class remains");
      }
      if (plot.querySelector(
        ".interactive-plot-svg, .graph-point-draggable, .graph-draggable-label"
      )) {
        failures.push("draggable or interactive plot classes remain");
      }
      if (svg && getComputedStyle(svg).cursor === "crosshair") {
        failures.push("crosshair cursor remains");
      }
      if (svg && getComputedStyle(svg).touchAction === "none") {
        failures.push("touch-action none remains");
      }
      if (failures.length) {
        issues.legacyPlotInteractivity.push({
          element: describeElement(plot),
          failures: failures
        });
      }
    });

    if (Math.abs(window.innerWidth - Number(expectedWidth)) > 1) {
      issues.viewportMismatch.push({
        expected: Number(expectedWidth),
        innerWidth: window.innerWidth,
        clientWidth: document.documentElement.clientWidth
      });
    }

    const pageOverflow = document.documentElement.scrollWidth
      > document.documentElement.clientWidth + 1;
    const errors = (window.__visualAssetAuditErrors || []).slice();
    const warnings = (window.__visualAssetAuditWarnings || []).slice();
    const failedChecks = Object.keys(issues).filter(function (key) {
      return issues[key].length > 0;
    });
    if (pageOverflow) {
      failedChecks.push("pageHorizontalOverflow");
    }
    if (errors.length) {
      failedChecks.push("consoleOrResourceErrors");
    }

    return JSON.stringify({
      route: window.location.pathname + window.location.search + window.location.hash,
      requestedViewport: viewportName,
      expectedWidth: Number(expectedWidth),
      actualViewport: {
        innerWidth: window.innerWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth
      },
      visualCount: allVisuals.length + backgrounds.length,
      renderedVisualCount: renderedVisuals.length + backgrounds.filter(isRendered).length,
      visualSummary: {
        images: allVisuals.filter(function (element) { return element.tagName.toLowerCase() === "img"; }).length,
        svg: allVisuals.filter(function (element) { return element.tagName.toLowerCase() === "svg"; }).length,
        canvas: allVisuals.filter(function (element) { return element.tagName.toLowerCase() === "canvas"; }).length,
        other: allVisuals.filter(function (element) {
          return !["img", "svg", "canvas"].includes(element.tagName.toLowerCase());
        }).length,
        cssBackgrounds: backgrounds.length
      },
      issueCounts: issueCounts(issues),
      issues: issues,
      pageHorizontalOverflow: pageOverflow,
      overflowElements: pageOverflow ? overflowElements() : [],
      errors: errors,
      warnings: warnings,
      failedChecks: uniqueStrings(failedChecks)
    });
  };
}());
