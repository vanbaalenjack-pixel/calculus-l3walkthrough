(function () {
  function initializeComplexWalkthrough(config) {
    if (typeof window.initializeProgressiveWalkthrough !== "function") {
      return;
    }

    window.initializeProgressiveWalkthrough(config, {
      defaultEyebrow: "Complex Number Walkthrough"
    });
  }

  window.initializeComplexWalkthrough = initializeComplexWalkthrough;
}());
