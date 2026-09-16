(function () {
  "use strict";

  const FILTER_NAMES = ["level", "standard", "year", "skill"];
  const INPUT_HISTORY_DELAY = 180;
  const form = document.querySelector("[data-global-search-form]");
  const input = document.querySelector("[data-global-search-input]");
  const results = document.querySelector("[data-global-search-results]");
  const status = document.querySelector("[data-global-search-status]");

  if (!form || !input || !results || !status || !window.CalcNzSearch) {
    return;
  }

  const staticRecords = Array.isArray(window.CALC_NZ_STATIC_SEARCH_RECORDS)
    ? window.CALC_NZ_STATIC_SEARCH_RECORDS
    : [];
  const filterControls = {};
  form.querySelectorAll("[data-search-filter]").forEach(function (control) {
    const name = control.getAttribute("data-search-filter");
    if (FILTER_NAMES.indexOf(name) >= 0 && !filterControls[name]) {
      filterControls[name] = control;
    }
  });
  const resetControl = form.querySelector("[data-search-reset]");
  let records = staticRecords.map(window.CalcNzSearch.prepareRecord);
  let cataloguePromise = null;
  let searchRequestId = 0;
  let inputHistoryTimer = null;
  let filtersWithoutControls = {};

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function questionRecords(catalogue) {
    const output = [];
    (catalogue.levels || []).forEach(function (level) {
      (level.standards || []).forEach(function (standard) {
        (standard.papers || []).forEach(function (paper) {
          (paper.questions || []).forEach(function (question) {
            output.push(window.CalcNzSearch.prepareRecord({
              type: "Question",
              title: question.label + " · " + (question.methodTitle || question.methodPlain || question.method),
              description: question.methodPlain || question.method,
              href: question.href,
              level: level.label,
              levelId: level.id,
              year: paper.year,
              standard: standard.code + " " + standard.label,
              standardCode: standard.code,
              standardId: standard.id,
              skillSlugs: Array.isArray(question.skillSlugs) ? question.skillSlugs : [],
              keywords: Array.isArray(question.skillSlugs) ? question.skillSlugs.join(" ") : ""
            }));
          });
        });
      });
    });
    return output;
  }

  function loadCatalogue() {
    if (window.CALC_NZ_QUESTION_CATALOGUE) {
      records = staticRecords.map(window.CalcNzSearch.prepareRecord)
        .concat(questionRecords(window.CALC_NZ_QUESTION_CATALOGUE));
      return Promise.resolve(records);
    }
    if (cataloguePromise) {
      return cataloguePromise;
    }
    cataloguePromise = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = "question-catalogue.js?v=20260916-2";
      script.addEventListener("load", function () {
        if (!window.CALC_NZ_QUESTION_CATALOGUE) {
          reject(new Error("Question catalogue did not initialise."));
          return;
        }
        records = staticRecords.map(window.CalcNzSearch.prepareRecord)
          .concat(questionRecords(window.CALC_NZ_QUESTION_CATALOGUE));
        resolve(records);
      });
      script.addEventListener("error", function () {
        reject(new Error("Question catalogue could not be loaded."));
      });
      document.head.appendChild(script);
    }).catch(function (error) {
      cataloguePromise = null;
      throw error;
    });
    return cataloguePromise;
  }

  function requestCatalogue() {
    loadCatalogue().catch(function () {
      // Search and filter handlers provide the visible static-record fallback.
    });
  }

  function controlValue(control) {
    return control ? String(control.value || "").trim() : "";
  }

  function controlAllowsValue(control, value) {
    if (!control || !value) {
      return !value;
    }
    if (control.tagName === "SELECT") {
      return Array.prototype.some.call(control.options, function (option) {
        return option.value === value;
      });
    }
    return !control.hasAttribute("data-search-filter-values")
      || control.getAttribute("data-search-filter-values").split(/\s+/).indexOf(value) >= 0;
  }

  function activeFilters() {
    const active = {};
    FILTER_NAMES.forEach(function (name) {
      const value = filterControls[name]
        ? controlValue(filterControls[name])
        : String(filtersWithoutControls[name] || "").trim();
      if (value) {
        active[name] = value;
      }
    });
    return active;
  }

  function hasActiveFilters(filters) {
    return FILTER_NAMES.some(function (name) {
      return Boolean(filters[name]);
    });
  }

  function stateSignature() {
    return JSON.stringify({ query: input.value.trim(), filters: activeFilters() });
  }

  function hydrateFromUrl() {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    let correctedUnknownValue = false;
    input.value = params.get("q") || "";
    filtersWithoutControls = {};
    FILTER_NAMES.forEach(function (name) {
      const requested = params.get(name) || "";
      const control = filterControls[name];
      if (!control) {
        if (requested) filtersWithoutControls[name] = requested;
        return;
      }
      if (controlAllowsValue(control, requested)) {
        control.value = requested;
        return;
      }
      control.value = "";
      if (requested) {
        params.delete(name);
        correctedUnknownValue = true;
      }
    });
    if (correctedUnknownValue) {
      window.history.replaceState(null, "", url.pathname + (params.toString() ? "?" + params.toString() : "") + url.hash);
    }
  }

  function writeUrl(historyMethod) {
    const url = new URL(window.location.href);
    const query = input.value.trim();
    if (query) {
      url.searchParams.set("q", query);
    } else {
      url.searchParams.delete("q");
    }
    FILTER_NAMES.forEach(function (name) {
      if (!filterControls[name]) {
        return;
      }
      const value = controlValue(filterControls[name]);
      if (value) {
        url.searchParams.set(name, value);
      } else {
        url.searchParams.delete(name);
      }
    });
    window.history[historyMethod](null, "", url.pathname + (url.searchParams.toString() ? "?" + url.searchParams.toString() : "") + url.hash);
  }

  function clearInputHistoryTimer() {
    if (inputHistoryTimer !== null) {
      window.clearTimeout(inputHistoryTimer);
      inputHistoryTimer = null;
    }
  }

  function resultStateDescription(query, filters) {
    if (query && hasActiveFilters(filters)) return " for “" + query + "” with the selected filters";
    if (query) return " for “" + query + "”";
    return " with the selected filters";
  }

  function render(query, filters) {
    const matches = window.CalcNzSearch.search(records, query, 30, filters);
    results.hidden = false;
    status.textContent = matches.length + (matches.length === 1 ? " result" : " results")
      + resultStateDescription(query.trim(), filters) + ".";
    if (!matches.length) {
      results.innerHTML = '<p class="home-search-empty">No close matches found. Try another method, standard, year, skill, or a broader set of filters.</p>';
      return;
    }
    results.innerHTML = '<ol class="home-search-result-list">' + matches.map(function (record) {
      const context = [record.year, record.standard].filter(Boolean).join(" · ");
      return '<li><a class="home-search-result" href="' + escapeHtml(record.href) + '">'
        + '<span class="home-search-result-meta"><span class="search-result-type">' + escapeHtml(record.type) + "</span>"
        + (context ? " · " + escapeHtml(context) : "") + "</span>"
        + '<span class="home-search-result-title">' + escapeHtml(record.title) + "</span>"
        + '<span class="home-search-result-copy">' + escapeHtml(record.description) + "</span></a></li>";
    }).join("") + "</ol>";
  }

  function runSearch() {
    const requestId = ++searchRequestId;
    const query = input.value.trim();
    const filters = activeFilters();
    const signature = stateSignature();
    if (!query && !hasActiveFilters(filters)) {
      results.hidden = true;
      results.innerHTML = "";
      status.textContent = "Enter a search term or choose a filter.";
      return;
    }
    status.textContent = "Searching…";
    loadCatalogue().then(function () {
      if (requestId !== searchRequestId || stateSignature() !== signature) {
        return;
      }
      render(query, filters);
    }).catch(function () {
      if (requestId !== searchRequestId || stateSignature() !== signature) {
        return;
      }
      render(query, filters);
      status.textContent += " Question results are temporarily unavailable; showing the static directory results.";
    });
  }

  function resetSearch() {
    clearInputHistoryTimer();
    input.value = "";
    FILTER_NAMES.forEach(function (name) {
      if (filterControls[name]) filterControls[name].value = "";
    });
    filtersWithoutControls = {};
    const url = new URL(window.location.href);
    ["q"].concat(FILTER_NAMES).forEach(function (name) {
      url.searchParams.delete(name);
    });
    window.history.pushState(null, "", url.pathname + (url.searchParams.toString() ? "?" + url.searchParams.toString() : "") + url.hash);
    runSearch();
    input.focus();
  }

  input.addEventListener("focus", requestCatalogue);
  input.addEventListener("input", function () {
    clearInputHistoryTimer();
    inputHistoryTimer = window.setTimeout(function () {
      inputHistoryTimer = null;
      writeUrl("replaceState");
      runSearch();
    }, INPUT_HISTORY_DELAY);
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearInputHistoryTimer();
    writeUrl("pushState");
    runSearch();
  });
  form.addEventListener("change", function (event) {
    if (!event.target.matches("[data-search-filter]")) {
      return;
    }
    clearInputHistoryTimer();
    writeUrl("pushState");
    runSearch();
  });
  form.addEventListener("reset", function (event) {
    event.preventDefault();
    resetSearch();
  });
  if (resetControl && resetControl.type !== "reset") {
    resetControl.addEventListener("click", function (event) {
      event.preventDefault();
      resetSearch();
    });
  }
  window.addEventListener("popstate", function () {
    clearInputHistoryTimer();
    hydrateFromUrl();
    runSearch();
  });

  hydrateFromUrl();
  if (input.value.trim() || hasActiveFilters(activeFilters())) {
    runSearch();
  }
}());
