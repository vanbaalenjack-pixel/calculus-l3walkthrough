(function () {
  "use strict";

  let loadPromise = null;
  let toolsReady = false;

  function setAvailabilityMessage(message) {
    const availability = document.getElementById("catalogue-availability");
    if (availability) {
      availability.textContent = message;
      const help = availability.closest("details"); if (help) help.open = true;
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
    loadPromise = appendScript("question-catalogue.js?v=20261026-1")
      .then(function () { return appendScript("index-page.js?v=20261026-1"); })
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

  requestHomepageTools();

  const activationRoots = Array.from(document.querySelectorAll([
    "#selection-flow-nav",
    "#choose-level",
    ".home-practice-card",
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
      if (control.tagName === "A" && control.href) window.location.href = control.href;
    });
  }

  activationRoots.forEach(function (root) {
    root.addEventListener("click", function (event) {
      if (toolsReady) {
        return;
      }
      const eventTarget = event.target instanceof Element ? event.target : null;
      const control = eventTarget && eventTarget.closest("[data-standard], button");
      if (!control || !root.contains(control)) {
        return;
      }
      event.preventDefault();
      replayAfterToolsLoad(control, function () { control.click(); });
    }, true);
  });

  window.loadCalcNzHomepageTools = loadHomepageTools;
}());
