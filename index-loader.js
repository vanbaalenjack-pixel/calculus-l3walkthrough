(function () {
  "use strict";

  let loadPromise = null;
  let toolsReady = false;

  function setAvailabilityMessage(message) {
    const availability = document.getElementById("catalogue-availability");
    if (availability) {
      availability.textContent = message;
    }
  }

  function appendScript(src) {
    return new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.addEventListener("load", resolve);
      script.addEventListener("error", reject);
      document.head.appendChild(script);
    });
  }

  function loadHomepageTools() {
    if (loadPromise) {
      return loadPromise;
    }
    loadPromise = appendScript("question-catalogue.js?v=20260916-2")
      .then(function () { return appendScript("index-page.js?v=20260916-2"); })
      .then(function () {
        toolsReady = true;
      })
      .catch(function (error) {
        loadPromise = null;
        setAvailabilityMessage("Practice tools could not load. Check your connection and try again.");
        throw error;
      });
    return loadPromise;
  }

  function requestHomepageTools() {
    loadHomepageTools().catch(function () {
      // The visible availability message provides a recoverable error state.
    });
  }

  const activationRoots = Array.from(document.querySelectorAll([
    "[data-reveal-level-picker]",
    "#choose-level",
    ".home-practice-card",
    "#walkthrough-site-search",
    ".home-library-card"
  ].join(",")));

  activationRoots.forEach(function (root) {
    ["pointerenter", "focusin", "touchstart"].forEach(function (eventName) {
      root.addEventListener(eventName, requestHomepageTools, { once: true, passive: true });
    });
  });

  function replayAfterToolsLoad(control, activate) {
    if (!control || control.dataset.deferredActivationPending === "true") {
      return;
    }
    control.dataset.deferredActivationPending = "true";
    loadHomepageTools().then(function () {
      delete control.dataset.deferredActivationPending;
      if (control.isConnected) {
        activate();
      }
    }).catch(function () {
      delete control.dataset.deferredActivationPending;
    });
  }

  activationRoots.forEach(function (root) {
    root.addEventListener("click", function (event) {
      if (toolsReady) {
        return;
      }
      const eventTarget = event.target instanceof Element ? event.target : null;
      const control = eventTarget && eventTarget.closest("[data-reveal-level-picker], button");
      if (!control || !root.contains(control)) {
        return;
      }
      event.preventDefault();
      replayAfterToolsLoad(control, function () { control.click(); });
    }, true);
  });

  const deferredSearchForm = document.querySelector("#walkthrough-site-search form");
  if (deferredSearchForm) {
    deferredSearchForm.addEventListener("submit", function (event) {
      if (toolsReady) {
        return;
      }
      event.preventDefault();
      replayAfterToolsLoad(deferredSearchForm, function () {
        const searchInput = deferredSearchForm.querySelector('input[type="search"]');
        if (searchInput) {
          searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (typeof deferredSearchForm.requestSubmit === "function") {
          deferredSearchForm.requestSubmit();
        } else {
          deferredSearchForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        }
      });
    }, true);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        observer.disconnect();
        requestHomepageTools();
      }
    }, { rootMargin: "240px 0px" });
    // Preload as the chooser approaches the viewport. The first-activation
    // replay above keeps the above-fold CTA reliable without eagerly fetching
    // the full catalogue merely because the CTA itself is visible.
    const preloadTarget = document.getElementById("choose-level");
    if (preloadTarget) {
      observer.observe(preloadTarget);
    }
  }

  try {
    if (window.localStorage.getItem("calc.nz.lastWalkthrough")) {
      requestHomepageTools();
    }
  } catch (error) {
    // Local storage is optional; interaction still loads the tools.
  }

  window.loadCalcNzHomepageTools = loadHomepageTools;
}());
