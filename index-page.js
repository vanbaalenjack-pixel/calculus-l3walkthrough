document.addEventListener("DOMContentLoaded", function () {
  const reportIssueHtml = 'Found an error or unclear explanation? Report it <a class="site-footer-link" href="https://docs.google.com/forms/d/e/1FAIpQLSfsQWI9kX3BVpUNJbEqUa9gdKiF1rTvNXT4bL0T3_AYYvLpkA/viewform?usp=publish-editor" target="_blank" rel="noreferrer">here</a>.';

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
  let activeLevel = null;
  let activeStandard = null;
  let activePaper = null;
  const hashTargets = {
    "level-2": { level: "level-2" },
    "level-3": { level: "level-3" },
    "level-2-calculus": { level: "level-2", standard: "level-2-calculus" },
    "level-2-algebra": { level: "level-2", standard: "level-2-algebra" },
    "level-3-differentiation": { level: "level-3", standard: "level-3-differentiation" },
    "level-3-integration": { level: "level-3", standard: "level-3-integration" },
    "level-3-complex": { level: "level-3", standard: "level-3-complex" },
    "level-3-differentiation-2025": {
      level: "level-3",
      standard: "level-3-differentiation",
      paper: "level-3-differentiation-2025"
    },
    "level-3-integration-2025": {
      level: "level-3",
      standard: "level-3-integration",
      paper: "level-3-integration-2025"
    },
    "level-3-complex-2025": {
      level: "level-3",
      standard: "level-3-complex",
      paper: "level-3-complex-2025"
    },
    "level-3-complex-2023": {
      level: "level-3",
      standard: "level-3-complex",
      paper: "level-3-complex-2023"
    },
    "level-3-complex-2022": {
      level: "level-3",
      standard: "level-3-complex",
      paper: "level-3-complex-2022"
    },
    "level-3-differentiation-2024": {
      level: "level-3",
      standard: "level-3-differentiation",
      paper: "level-3-differentiation-2024"
    },
    "level-3-differentiation-2023": {
      level: "level-3",
      standard: "level-3-differentiation",
      paper: "level-3-differentiation-2023"
    },
    "level-2-calculus-2025": {
      level: "level-2",
      standard: "level-2-calculus",
      paper: "level-2-calculus-2025"
    },
    "level-2-algebra-2025": {
      level: "level-2",
      standard: "level-2-algebra",
      paper: "level-2-algebra-2025"
    },
    "level-3-differentiation-2022": {
      level: "level-3",
      standard: "level-3-differentiation",
      paper: "level-3-differentiation-2022"
    },
    "level-2-2025": {
      level: "level-2",
      standard: "level-2-calculus",
      paper: "level-2-calculus-2025"
    },
    "level-3-2022": {
      level: "level-3",
      standard: "level-3-differentiation",
      paper: "level-3-differentiation-2022"
    },
    "level-3-2024": {
      level: "level-3",
      standard: "level-3-differentiation",
      paper: "level-3-differentiation-2024"
    },
    "level-3-2023": {
      level: "level-3",
      standard: "level-3-differentiation",
      paper: "level-3-differentiation-2023"
    },
    "level-3-2025": {
      level: "level-3",
      standard: "level-3-differentiation",
      paper: "level-3-differentiation-2025"
    }
  };

  if (!levelButtons.length || !levelPanels.length) {
    ensureHomepageReportFooter();
    return;
  }

  function updateHash(hash) {
    if (!window.history || typeof window.history.replaceState !== "function") {
      return;
    }

    if (!hash) {
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    window.history.replaceState(null, "", "#" + hash);
  }

  function setButtonState(button, isActive) {
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  }

  function setPanelState(panel, isActive) {
    panel.classList.toggle("hidden", !isActive);
    panel.setAttribute("aria-hidden", isActive ? "false" : "true");
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

  function getPageScrollTop(target) {
    if (!target) {
      return 0;
    }

    return Math.max(window.scrollY + target.getBoundingClientRect().top - 24, 0);
  }

  function scrollToPanel(targetId) {
    const scrollTarget = document.getElementById(targetId) ||
      getLevelPanel(targetId) ||
      getStandardPanel(targetId) ||
      getPaperPanel(targetId);

    if (!scrollTarget) {
      return;
    }

    window.scrollTo({ top: getPageScrollTop(scrollTarget), behavior: "smooth" });
  }

  function stabilisePickerScroll(button, targetId) {
    if (!button || !targetId) {
      return;
    }

    const initialScrollY = window.scrollY;

    window.setTimeout(function () {
      button.blur();
    }, 0);

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        const currentScrollY = window.scrollY;
        const jumpedUpALot = initialScrollY - currentScrollY > 180;
        const jumpedNearTop = initialScrollY > 140 && currentScrollY < 60;

        if (jumpedUpALot || jumpedNearTop) {
          scrollToPanel(targetId);
        }
      });
    });
  }

  function clearPaperSelection(parentStandard) {
    const matchingPanels = paperPanels.filter(function (panel) {
      return !parentStandard || panel.dataset.parentStandard === parentStandard;
    });

    const matchingPaperIds = matchingPanels.map(function (panel) {
      return panel.dataset.paperPanel;
    });

    matchingPanels.forEach(function (panel) {
      setPanelState(panel, false);
    });

    paperButtons.forEach(function (button) {
      if (!parentStandard || button.dataset.parentStandard === parentStandard) {
        setButtonState(button, false);
      }
    });

    if (!parentStandard || matchingPaperIds.includes(activePaper)) {
      activePaper = null;
    }
  }

  function clearStandardSelection(parentLevel) {
    const matchingPanels = standardPanels.filter(function (panel) {
      return !parentLevel || panel.dataset.parentLevel === parentLevel;
    });

    const matchingStandardIds = matchingPanels.map(function (panel) {
      return panel.dataset.standardPanel;
    });

    matchingPanels.forEach(function (panel) {
      setPanelState(panel, false);
      clearPaperSelection(panel.dataset.standardPanel);
    });

    standardButtons.forEach(function (button) {
      if (!parentLevel || button.dataset.parentLevel === parentLevel) {
        setButtonState(button, false);
      }
    });

    if (!parentLevel || matchingStandardIds.includes(activeStandard)) {
      activeStandard = null;
    }
  }

  function activateLevel(level) {
    const activePanel = getLevelPanel(level);

    if (!activePanel) {
      return null;
    }

    if (activeLevel && activeLevel !== level) {
      clearStandardSelection(activeLevel);
    }

    levelPanels.forEach(function (panel) {
      const isActive = panel === activePanel;
      setPanelState(panel, isActive);
    });

    levelButtons.forEach(function (button) {
      const isActive = button.dataset.level === level;
      setButtonState(button, isActive);
    });

    activeLevel = level;
    return activePanel;
  }

  function selectLevel(level, shouldScroll) {
    const activePanel = activateLevel(level);

    if (!activePanel) {
      return;
    }

    clearStandardSelection(level);
    updateHash(level);

    if (shouldScroll) {
      scrollToPanel(level);
    }
  }

  function selectStandard(standard, shouldScroll) {
    const standardPanel = getStandardPanel(standard);

    if (!standardPanel) {
      return;
    }

    const parentLevel = standardPanel.dataset.parentLevel;
    const activePanel = activateLevel(parentLevel);

    if (!activePanel) {
      return;
    }

    clearStandardSelection(parentLevel);
    setPanelState(standardPanel, true);

    standardButtons.forEach(function (button) {
      if (button.dataset.parentLevel === parentLevel) {
        setButtonState(button, button.dataset.standard === standard);
      }
    });

    activeStandard = standard;
    updateHash(standard);

    if (shouldScroll) {
      scrollToPanel(standard);
    }
  }

  function selectPaper(paper, shouldScroll) {
    const paperPanel = getPaperPanel(paper);

    if (!paperPanel) {
      return;
    }

    const parentStandard = paperPanel.dataset.parentStandard;
    const standardPanel = getStandardPanel(parentStandard);

    if (!standardPanel) {
      return;
    }

    const parentLevel = standardPanel.dataset.parentLevel;
    const activePanel = activateLevel(parentLevel);

    if (!activePanel) {
      return;
    }

    clearStandardSelection(parentLevel);
    setPanelState(standardPanel, true);

    standardButtons.forEach(function (button) {
      if (button.dataset.parentLevel === parentLevel) {
        setButtonState(button, button.dataset.standard === parentStandard);
      }
    });

    setPanelState(paperPanel, true);

    paperButtons.forEach(function (button) {
      if (button.dataset.parentStandard === parentStandard) {
        setButtonState(button, button.dataset.paper === paper);
      }
    });

    activeStandard = parentStandard;
    activePaper = paper;
    updateHash(paper);

    if (shouldScroll) {
      scrollToPanel(paper);
    }
  }

  function clearSelection() {
    clearStandardSelection();

    levelPanels.forEach(function (panel) {
      setPanelState(panel, false);
    });

    levelButtons.forEach(function (button) {
      setButtonState(button, false);
    });

    activeLevel = null;
    activeStandard = null;
    activePaper = null;
    updateHash("");
  }

  levelButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (activeLevel === button.dataset.level) {
        clearSelection();
        return;
      }

      selectLevel(button.dataset.level, true);
      stabilisePickerScroll(button, button.dataset.level);
    });
  });

  standardButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const standard = button.dataset.standard;
      const parentLevel = button.dataset.parentLevel;

      if (activeStandard === standard) {
        clearStandardSelection(parentLevel);
        updateHash(parentLevel);
        scrollToPanel(parentLevel);
        stabilisePickerScroll(button, parentLevel);
        return;
      }

      selectStandard(standard, true);
      stabilisePickerScroll(button, standard);
    });
  });

  paperButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const paper = button.dataset.paper;
      const parentStandard = button.dataset.parentStandard;

      if (activePaper === paper) {
        clearPaperSelection(parentStandard);
        updateHash(parentStandard);
        scrollToPanel(parentStandard);
        stabilisePickerScroll(button, parentStandard);
        return;
      }

      selectPaper(paper, true);
      stabilisePickerScroll(button, paper);
    });
  });

  const initialHash = window.location.hash.slice(1);
  const initialSelection = hashTargets[initialHash];
  if (initialSelection) {
    if (initialSelection.paper) {
      selectPaper(initialSelection.paper, true);
    } else if (initialSelection.standard) {
      selectStandard(initialSelection.standard, true);
    } else if (initialSelection.level) {
      selectLevel(initialSelection.level, true);
    }
  }

  ensureHomepageReportFooter();
});
