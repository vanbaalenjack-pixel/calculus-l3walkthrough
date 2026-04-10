(function () {
  function initializeAlgebraWalkthrough(config) {
    if (typeof window.initializeProgressiveWalkthrough !== "function") {
      return;
    }

    window.initializeProgressiveWalkthrough(config, {
      defaultEyebrow: "Level 2 Algebra Walkthrough"
    });
  }

  window.initializeAlgebraWalkthrough = initializeAlgebraWalkthrough;
}());
