document.addEventListener("DOMContentLoaded", function () {
  if (typeof renderMathInElement === "function") {
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\(", right: "\\)", display: false }
      ]
    });
  }

  const yearButtons = Array.from(document.querySelectorAll("[data-year]"));
  const yearPanels = Array.from(document.querySelectorAll("[data-year-panel]"));
  let activeYear = null;

  if (!yearButtons.length || !yearPanels.length) {
    return;
  }

  function selectYear(year, shouldScroll) {
    const activePanel = yearPanels.find(function (panel) {
      return panel.dataset.yearPanel === year;
    });

    if (!activePanel) {
      return;
    }

    yearPanels.forEach(function (panel) {
      const isActive = panel === activePanel;
      panel.classList.toggle("hidden", !isActive);
      panel.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    yearButtons.forEach(function (button) {
      const isActive = button.dataset.year === year;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    activeYear = year;

    if (window.history && typeof window.history.replaceState === "function") {
      window.history.replaceState(null, "", "#" + year);
    }

    if (shouldScroll) {
      window.scrollTo({ top: activePanel.offsetTop - 24, behavior: "smooth" });
    }
  }

  function clearSelection() {
    yearPanels.forEach(function (panel) {
      panel.classList.add("hidden");
      panel.setAttribute("aria-hidden", "true");
    });

    yearButtons.forEach(function (button) {
      button.classList.remove("is-active");
      button.setAttribute("aria-pressed", "false");
    });

    activeYear = null;

    if (window.history && typeof window.history.replaceState === "function") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  yearButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (activeYear === button.dataset.year) {
        clearSelection();
        return;
      }

      selectYear(button.dataset.year, true);
    });
  });

  const initialYear = window.location.hash.slice(1);
  if (initialYear) {
    selectYear(initialYear, false);
  }
});
