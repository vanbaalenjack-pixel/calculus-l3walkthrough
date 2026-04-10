(function () {
  function initializeDifferentiationWalkthrough(config) {
    if (typeof window.initializeProgressiveWalkthrough !== "function") {
      return;
    }

    window.initializeProgressiveWalkthrough(config, {
      defaultEyebrow: "Level 3 Differentiation Walkthrough"
    });
  }

  window.initializeDifferentiationWalkthrough = initializeDifferentiationWalkthrough;
}());
