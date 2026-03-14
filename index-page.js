document.addEventListener("DOMContentLoaded", function () {
  const reportIssueHtml = 'Found an error or unclear explanation? Report it <a class="site-footer-link" href="https://docs.google.com/forms/d/e/1FAIpQLSfsQWI9kX3BVpUNJbEqUa9gdKiF1rTvNXT4bL0T3_AYYvLpkA/viewform?usp=publish-editor" target="_blank" rel="noreferrer">here</a>.';

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
  let activeLevel = null;
  const hashTargets = {
    "level-2": { level: "level-2" },
    "level-3": { level: "level-3" },
    "level-2-calculus": { level: "level-2", target: "level-2-calculus" },
    "level-2-algebra": { level: "level-2", target: "level-2-algebra" },
    "level-3-differentiation": { level: "level-3", target: "level-3-differentiation" },
    "level-2-2025": { level: "level-2", target: "level-2-calculus" },
    "level-2-algebra-2025": { level: "level-2", target: "level-2-algebra" },
    "level-3-2022": { level: "level-3", target: "level-3-differentiation" }
  };

  if (!levelButtons.length || !levelPanels.length) {
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

  function resolveScrollTarget(level, targetId) {
    if (targetId) {
      return document.getElementById(targetId);
    }

    return levelPanels.find(function (panel) {
      return panel.dataset.levelPanel === level;
    }) || null;
  }

  function selectLevel(level, shouldScroll, targetId, historyHash) {
    const activePanel = levelPanels.find(function (panel) {
      return panel.dataset.levelPanel === level;
    });

    if (!activePanel) {
      return;
    }

    levelPanels.forEach(function (panel) {
      const isActive = panel === activePanel;
      panel.classList.toggle("hidden", !isActive);
      panel.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    levelButtons.forEach(function (button) {
      const isActive = button.dataset.level === level;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    activeLevel = level;
    updateHash(historyHash || targetId || level);

    if (shouldScroll) {
      const scrollTarget = resolveScrollTarget(level, targetId);
      if (scrollTarget) {
        window.scrollTo({ top: scrollTarget.offsetTop - 24, behavior: "smooth" });
      }
    }
  }

  function clearSelection() {
    levelPanels.forEach(function (panel) {
      panel.classList.add("hidden");
      panel.setAttribute("aria-hidden", "true");
    });

    levelButtons.forEach(function (button) {
      button.classList.remove("is-active");
      button.setAttribute("aria-pressed", "false");
    });

    activeLevel = null;
    updateHash("");
  }

  levelButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (activeLevel === button.dataset.level) {
        clearSelection();
        return;
      }

      selectLevel(button.dataset.level, true, null, button.dataset.level);
    });
  });

  const initialHash = window.location.hash.slice(1);
  const initialSelection = hashTargets[initialHash];
  if (initialSelection) {
    selectLevel(
      initialSelection.level,
      true,
      initialSelection.target || null,
      initialSelection.target || initialSelection.level
    );
  }

  ensureHomepageReportFooter();
});
