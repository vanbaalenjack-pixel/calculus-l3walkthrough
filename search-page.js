(function () {
  "use strict";

  const form = document.querySelector("[data-global-search-form]");
  const input = document.querySelector("[data-global-search-input]");
  const results = document.querySelector("[data-global-search-results]");
  const status = document.querySelector("[data-global-search-status]");
  const staticRecords = Array.isArray(window.CALC_NZ_STATIC_SEARCH_RECORDS)
    ? window.CALC_NZ_STATIC_SEARCH_RECORDS
    : [];
  let records = staticRecords.map(window.CalcNzSearch.prepareRecord);
  let cataloguePromise = null;
  let searchRequestId = 0;

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
              year: paper.year,
              standard: standard.code + " " + standard.label,
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
      script.src = "question-catalogue.js?v=20260809-1";
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
      // Search input and submit handlers provide the visible fallback state.
    });
  }

  function render(query) {
    const matches = window.CalcNzSearch.search(records, query, 30);
    results.hidden = false;
    status.textContent = matches.length + (matches.length === 1 ? " result" : " results") + " for “" + query.trim() + "”.";
    if (!matches.length) {
      results.innerHTML = '<p class="home-search-empty">No close matches found. Try a method, standard number, year, or question topic.</p>';
      return;
    }
    results.innerHTML = '<ol class="home-search-result-list">' + matches.map(function (record) {
      const context = [record.year, record.standard].filter(Boolean).join(" · ");
      return '<li><a class="home-search-result" href="' + escapeHtml(record.href) + '">'
        + '<span class="home-search-result-meta"><span class="search-result-type">' + escapeHtml(record.type) + '</span>'
        + (context ? " · " + escapeHtml(context) : "") + '</span>'
        + '<span class="home-search-result-title">' + escapeHtml(record.title) + '</span>'
        + '<span class="home-search-result-copy">' + escapeHtml(record.description) + '</span></a></li>';
    }).join("") + "</ol>";
  }

  function runSearch() {
    const requestId = ++searchRequestId;
    const query = input.value.trim();
    if (!query) {
      results.hidden = true;
      results.innerHTML = "";
      status.textContent = "Enter a search term.";
      return;
    }
    status.textContent = "Searching…";
    loadCatalogue().then(function () {
      if (requestId !== searchRequestId || input.value.trim() !== query) {
        return;
      }
      render(query);
    }).catch(function () {
      if (requestId !== searchRequestId || input.value.trim() !== query) {
        return;
      }
      render(query);
      status.textContent += " Question results are temporarily unavailable; showing the static directory results.";
    });
  }

  if (!form || !input || !results || !status || !window.CalcNzSearch) {
    return;
  }

  input.addEventListener("focus", requestCatalogue);
  input.addEventListener("input", runSearch);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    runSearch();
  });

  const initialQuery = new URLSearchParams(window.location.search).get("q");
  if (initialQuery) {
    input.value = initialQuery;
    runSearch();
  }
}());
