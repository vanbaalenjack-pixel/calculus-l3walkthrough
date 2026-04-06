(function () {
  const katexDelimiters = [
    { left: "$$", right: "$$", display: true },
    { left: "\\[", right: "\\]", display: true },
    { left: "\\(", right: "\\)", display: false }
  ];

  function renderMath(element) {
    if (!element || typeof renderMathInElement !== "function") {
      return;
    }

    renderMathInElement(element, { delimiters: katexDelimiters });
  }

  function getPageScrollTop(target) {
    if (!target) {
      return 0;
    }

    if (typeof getWalkthroughPageScrollTop === "function") {
      return getWalkthroughPageScrollTop(target);
    }

    return Math.max(window.scrollY + target.getBoundingClientRect().top - 24, 0);
  }

  function showOnlyStep(stepId) {
    document.querySelectorAll(".step-card").forEach(function (step) {
      step.classList.add("hidden");
    });

    const targetStep = document.getElementById(stepId);
    if (targetStep) {
      targetStep.classList.remove("hidden");
      window.requestAnimationFrame(function () {
        window.scrollTo({
          top: getPageScrollTop(targetStep),
          behavior: "smooth"
        });
      });
    }
  }

  function setFeedback(id, message, isSuccess) {
    const box = document.getElementById(id);
    if (!box) {
      return;
    }

    box.innerHTML = message;
    box.classList.remove("success", "error");
    box.classList.add(isSuccess ? "success" : "error");
    renderMath(box);
  }

  function toggleNextStepButton(buttonId, shouldShow) {
    const button = document.getElementById(buttonId);
    if (!button) {
      return;
    }

    button.classList.toggle("hidden", !shouldShow);
  }

  function getStepSectionClass(index) {
    return index === 0 ? "step-card active" : "step-card hidden";
  }

  function hashString(value) {
    const text = String(value || "");
    let hash = 2166136261;

    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }

  function seededShuffle(values, seed) {
    const result = values.slice();
    let state = seed >>> 0;

    if (!state) {
      state = 0x9e3779b9;
    }

    for (let index = result.length - 1; index > 0; index -= 1) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      const swapIndex = state % (index + 1);
      const temp = result[index];
      result[index] = result[swapIndex];
      result[swapIndex] = temp;
    }

    return result;
  }

  function getChoiceRenderEntries(step) {
    if (Array.isArray(step.renderChoices) && step.renderChoices.length) {
      return step.renderChoices;
    }

    return (step.choices || []).map(function (choice, choiceIndex) {
      return {
        choice: choice,
        originalIndex: choiceIndex
      };
    });
  }

  function buildChoiceRenderEntries(config, step, stepIndex, positionCountsByLength) {
    const choices = Array.isArray(step.choices) ? step.choices : [];
    const defaultEntries = choices.map(function (choice, choiceIndex) {
      return {
        choice: choice,
        originalIndex: choiceIndex
      };
    });
    const correctIndices = [];

    choices.forEach(function (choice, choiceIndex) {
      if (choice && choice.correct) {
        correctIndices.push(choiceIndex);
      }
    });

    if (choices.length < 2 || correctIndices.length !== 1) {
      return defaultEntries;
    }

    const choiceCount = choices.length;

    if (!positionCountsByLength[choiceCount]) {
      positionCountsByLength[choiceCount] = Array(choiceCount).fill(0);
    }

    const counts = positionCountsByLength[choiceCount];
    const seedBase = [
      config.browserTitle || "",
      config.title || "",
      step.title || "",
      step.text || "",
      String(stepIndex),
      String(choiceCount)
    ].join("|");
    const preferredPositions = seededShuffle(
      Array.from({ length: choiceCount }, function (_, positionIndex) {
        return positionIndex;
      }),
      hashString(seedBase + "|positions")
    );
    let targetCorrectPosition = preferredPositions[0];
    let lowestCount = counts[targetCorrectPosition];

    preferredPositions.forEach(function (position) {
      if (counts[position] < lowestCount) {
        lowestCount = counts[position];
        targetCorrectPosition = position;
      }
    });

    counts[targetCorrectPosition] += 1;

    const distractorIndices = seededShuffle(
      choices.map(function (_, choiceIndex) {
        return choiceIndex;
      }).filter(function (choiceIndex) {
        return choiceIndex !== correctIndices[0];
      }),
      hashString(seedBase + "|distractors")
    );
    const orderedIndices = distractorIndices.slice();

    orderedIndices.splice(targetCorrectPosition, 0, correctIndices[0]);

    return orderedIndices.map(function (choiceIndex) {
      return {
        choice: choices[choiceIndex],
        originalIndex: choiceIndex
      };
    });
  }

  function prepareChoiceSteps(config) {
    const positionCountsByLength = {};

    (config.steps || []).forEach(function (step, stepIndex) {
      if (step.type !== "choice") {
        return;
      }

      step.renderChoices = buildChoiceRenderEntries(config, step, stepIndex, positionCountsByLength);
    });
  }

  function fmtGraph(value) {
    return Number(value.toFixed(2));
  }

  function createGraphScale(width, height, padding, xMin, xMax, yMin, yMax) {
    return {
      x: function (value) {
        return fmtGraph(padding + ((value - xMin) / (xMax - xMin)) * (width - padding * 2));
      },
      y: function (value) {
        return fmtGraph(height - padding - ((value - yMin) / (yMax - yMin)) * (height - padding * 2));
      }
    };
  }

  function graphLineMarkup(scale, x1, y1, x2, y2, className, extra) {
    return `<line class="${className}" x1="${scale.x(x1)}" y1="${scale.y(y1)}" x2="${scale.x(x2)}" y2="${scale.y(y2)}"${extra || ""}></line>`;
  }

  function graphCircleMarkup(scale, x, y, radius, className, extra) {
    return `<circle class="${className}" cx="${scale.x(x)}" cy="${scale.y(y)}" r="${radius}"${extra || ""}></circle>`;
  }

  function graphTextMarkup(scale, x, y, text, className, extra) {
    return `<text class="${className}" x="${scale.x(x)}" y="${scale.y(y)}"${extra || ""}>${text}</text>`;
  }

  function renderChoiceButtons(step, stepNumber) {
    const gridClass = step.buttonGridClass || "button-grid";
    const renderChoices = getChoiceRenderEntries(step);

    return `
      <div class="${gridClass}">
        ${renderChoices.map(function (entry) {
          return `
            <button
              class="option-btn"
              type="button"
              data-choice-step="${stepNumber}"
              data-choice-index="${entry.originalIndex}"
            >
              ${entry.choice.html}
            </button>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderPlotInput(step, stepNumber) {
    const plot = step.plot || {};
    const width = plot.width || 420;
    const height = plot.height || 420;
    const padding = plot.padding || 28;
    const xMin = plot.xMin == null ? -6.5 : plot.xMin;
    const xMax = plot.xMax == null ? 6.5 : plot.xMax;
    const yMin = plot.yMin == null ? -6.5 : plot.yMin;
    const yMax = plot.yMax == null ? 6.5 : plot.yMax;
    const scale = createGraphScale(width, height, padding, xMin, xMax, yMin, yMax);
    const gridLines = [];

    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 1) {
      gridLines.push(graphLineMarkup(scale, x, yMin + 0.5, x, yMax - 0.5, "graph-grid-line"));
    }

    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += 1) {
      gridLines.push(graphLineMarkup(scale, xMin + 0.5, y, xMax - 0.5, y, "graph-grid-line"));
    }

    const fixedPoints = (plot.points || []).map(function (point) {
      const labelX = point.labelX == null ? point.x + 0.22 : point.labelX;
      const labelY = point.labelY == null ? point.y + 0.22 : point.labelY;

      return graphCircleMarkup(scale, point.x, point.y, 5, point.className || "graph-point")
        + graphTextMarkup(scale, labelX, labelY, point.label, "graph-label");
    }).join("");

    return `
      <div
        class="graph-frame question-graph-frame interactive-plot-frame"
        data-plot-step="${stepNumber}"
        data-width="${width}"
        data-height="${height}"
        data-padding="${padding}"
        data-x-min="${xMin}"
        data-x-max="${xMax}"
        data-y-min="${yMin}"
        data-y-max="${yMax}"
        data-target-x="${plot.targetX}"
        data-target-y="${plot.targetY}"
      >
        <svg class="graph-svg interactive-plot-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${plot.ariaLabel || "Interactive Argand diagram"}">
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${gridLines.join("")}
          ${graphLineMarkup(scale, xMin + 0.5, 0, xMax - 0.5, 0, "graph-axis")}
          ${graphLineMarkup(scale, 0, yMin + 0.5, 0, yMax - 0.5, "graph-axis")}
          ${graphCircleMarkup(scale, 0, 0, 4.5, "question-origin")}
          ${graphTextMarkup(scale, xMax - 0.55, -0.22, plot.xAxisLabel || "Real", "graph-label")}
          ${graphTextMarkup(scale, -0.18, yMax - 0.2, plot.yAxisLabel || "Imaginary", "graph-label", ' text-anchor="middle"')}
          ${fixedPoints}
          <g data-drag-group class="plot-draggable hidden" aria-hidden="true">
            <circle data-drag-point class="graph-point-draggable" cx="${scale.x(0)}" cy="${scale.y(0)}" r="6"></circle>
            <text data-drag-label class="graph-label graph-draggable-label" x="${scale.x(0.22)}" y="${scale.y(-0.18)}">${plot.draggableLabel || "z"}</text>
          </g>
        </svg>
        <div class="plot-toolbar">
          <p id="plot-status-${stepNumber}" class="plot-status">Current point: not plotted yet.</p>
          <button class="nav-btn check-btn" type="button" data-plot-check-step="${stepNumber}">
            ${step.checkLabel || "Check point"}
          </button>
        </div>
      </div>
    `;
  }

  function renderTypedInput(step, stepNumber) {
    const inputId = "step-" + stepNumber + "-answer";
    const previewId = "step-" + stepNumber + "-preview";
    const placeholder = step.placeholder || "Type your answer here";
    const checkLabel = step.checkLabel || "Check";

    return `
      <div class="math-input-group">
        <input
          id="${inputId}"
          class="math-answer-input"
          type="text"
          inputmode="text"
          autocomplete="off"
          spellcheck="false"
          aria-label="${step.ariaLabel || "Type your answer"}"
          placeholder="${placeholder}"
        />
        <div id="${previewId}" class="math-preview is-placeholder">Preview will appear here.</div>
        <button
          class="nav-btn check-btn"
          type="button"
          data-typed-step="${stepNumber}"
        >
          ${checkLabel}
        </button>
      </div>
    `;
  }

  function renderFinalNav(config, stepNumber) {
    const nav = config.finalNav || {
      secondary: {
        href: config.backHref,
        label: "← Back to paper"
      },
      primary: {
        href: config.nextHref,
        label: config.nextLabel || "Next question →"
      }
    };

    const secondaryButton = nav.secondary
      ? `<a class="nav-btn secondary" href="${nav.secondary.href}">${nav.secondary.label}</a>`
      : "";
    const primaryButton = nav.primary
      ? `<a class="nav-btn" href="${nav.primary.href}">${nav.primary.label}</a>`
      : "";

    return `
      <div id="step-${stepNumber}-nav" class="nav-row hidden">
        ${secondaryButton}
        ${primaryButton}
      </div>
    `;
  }

  function getOrCreateTipsCard(questionCard, walkthroughContent) {
    if (!questionCard || !walkthroughContent || !walkthroughContent.parentNode) {
      return null;
    }

    const tipsCard = document.getElementById("tips-card") || document.createElement("section");

    if (!tipsCard.id) {
      tipsCard.id = "tips-card";
    }

    tipsCard.classList.add("question-card", "tips-card");
    walkthroughContent.parentNode.insertBefore(tipsCard, walkthroughContent);

    return tipsCard;
  }

  function renderStep(step, index, config) {
    const stepNumber = index + 1;
    let interactionHtml = "";

    if (step.type === "choice") {
      interactionHtml = renderChoiceButtons(step, stepNumber);
    } else if (step.type === "plot") {
      interactionHtml = renderPlotInput(step, stepNumber);
    } else {
      interactionHtml = renderTypedInput(step, stepNumber);
    }

    const beforeHtml = step.beforeHtml || "";
    const feedbackHtml = `<div id="feedback-${stepNumber}" class="feedback"></div>`;
    const nextButtonHtml = index < config.steps.length - 1
      ? `
        <button
          id="next-step-${stepNumber}"
          class="nav-btn next-step-btn hidden"
          type="button"
          data-next-step="step-${stepNumber + 1}"
        >
          Next step →
        </button>
      `
      : "";
    const finalNavHtml = index === config.steps.length - 1 ? renderFinalNav(config, stepNumber) : "";

    return `
      <section id="step-${stepNumber}" class="${getStepSectionClass(index)}">
        <p class="step-number">Step ${stepNumber}</p>
        <h2>${step.title}</h2>
        <p class="step-text">${step.text}</p>
        ${beforeHtml}
        ${interactionHtml}
        ${feedbackHtml}
        ${nextButtonHtml}
        ${finalNavHtml}
      </section>
    `;
  }

  function buildQuestionCardHtml(config) {
    return `
      <p class="question-label">Question</p>
      ${config.questionHtml}
    `;
  }

  function buildTipsCardHtml(config) {
    const fallbackFocus = !config.focus && Array.isArray(config.hints) && config.hints.length
      ? config.hints[0]
      : "";
    const focusText = config.focus || fallbackFocus;
    const focusHtml = focusText
      ? `<p class="step-text"><strong>Focus:</strong> ${focusText}</p>`
      : "";
    const noteHtml = (config.questionNotes || []).map(function (note) {
      return `<p class="step-text question-note">${note}</p>`;
    }).join("");

    return `
      <p class="question-label">Tips</p>
      ${focusHtml}
      <p class="step-text attempt-note">
        Try the question yourself first. If you get stuck, open the hints before using the full walkthrough.
      </p>
      ${noteHtml}
    `;
  }

  function handleChoiceStep(config, stepIndex, choiceIndex) {
    const stepNumber = stepIndex + 1;
    const step = config.steps[stepIndex];
    const choice = step.choices[choiceIndex];
    const feedbackId = "feedback-" + stepNumber;
    const nextButtonId = "next-step-" + stepNumber;
    const successRevealId = "step-" + stepNumber + "-nav";

    if (!choice) {
      return;
    }

    if (choice.correct) {
      setFeedback(feedbackId, choice.successMessage || step.successMessage || "Correct.", true);

      if (stepIndex < config.steps.length - 1) {
        toggleNextStepButton(nextButtonId, true);
      } else {
        const successReveal = document.getElementById(successRevealId);
        if (successReveal) {
          successReveal.classList.remove("hidden");
        }
      }

      return;
    }

    setFeedback(feedbackId, choice.failureMessage || step.genericMessage || "Try again.");

    if (stepIndex < config.steps.length - 1) {
      toggleNextStepButton(nextButtonId, false);
    } else {
      const successReveal = document.getElementById(successRevealId);
      if (successReveal) {
        successReveal.classList.add("hidden");
      }
    }
  }

  function handleTypedStep(config, stepIndex) {
    const stepNumber = stepIndex + 1;
    const step = config.steps[stepIndex];

    TypedMath.checkTypedStep({
      inputId: "step-" + stepNumber + "-answer",
      feedbackId: "feedback-" + stepNumber,
      nextButtonId: stepIndex < config.steps.length - 1 ? "next-step-" + stepNumber : null,
      successRevealId: stepIndex === config.steps.length - 1 ? "step-" + stepNumber + "-nav" : null,
      acceptedAnswers: step.acceptedAnswers,
      samples: step.samples,
      successMessage: step.successMessage,
      targetedFeedback: step.targetedFeedback,
      genericMessage: step.genericMessage,
      emptyMessage: step.emptyMessage,
      tolerance: step.tolerance,
      mode: step.mode,
      options: step.options,
      setFeedback: setFeedback,
      toggleNextStepButton: toggleNextStepButton
    });
  }

  function updatePlotMarker(wrapper, stepNumber, x, y) {
    const width = Number(wrapper.dataset.width);
    const height = Number(wrapper.dataset.height);
    const padding = Number(wrapper.dataset.padding);
    const xMin = Number(wrapper.dataset.xMin);
    const xMax = Number(wrapper.dataset.xMax);
    const yMin = Number(wrapper.dataset.yMin);
    const yMax = Number(wrapper.dataset.yMax);
    const scale = createGraphScale(width, height, padding, xMin, xMax, yMin, yMax);
    const group = wrapper.querySelector("[data-drag-group]");
    const point = wrapper.querySelector("[data-drag-point]");
    const label = wrapper.querySelector("[data-drag-label]");
    const status = document.getElementById("plot-status-" + stepNumber);

    if (!group || !point || !label) {
      return;
    }

    point.setAttribute("cx", scale.x(x));
    point.setAttribute("cy", scale.y(y));
    label.setAttribute("x", scale.x(x + 0.22));
    label.setAttribute("y", scale.y(y - 0.18));
    group.classList.remove("hidden");
    group.setAttribute("aria-hidden", "false");
    wrapper.dataset.currentX = String(x);
    wrapper.dataset.currentY = String(y);

    if (status) {
      status.textContent = "Current point: (" + x + ", " + y + ").";
    }
  }

  function getPlotCoordinates(wrapper, event) {
    const svg = wrapper.querySelector(".interactive-plot-svg");
    const rect = svg.getBoundingClientRect();
    const width = Number(wrapper.dataset.width);
    const height = Number(wrapper.dataset.height);
    const padding = Number(wrapper.dataset.padding);
    const xMin = Number(wrapper.dataset.xMin);
    const xMax = Number(wrapper.dataset.xMax);
    const yMin = Number(wrapper.dataset.yMin);
    const yMax = Number(wrapper.dataset.yMax);
    const svgX = ((event.clientX - rect.left) / rect.width) * width;
    const svgY = ((event.clientY - rect.top) / rect.height) * height;
    const rawX = xMin + ((svgX - padding) / (width - padding * 2)) * (xMax - xMin);
    const rawY = yMin + ((height - padding - svgY) / (height - padding * 2)) * (yMax - yMin);
    const minX = Math.ceil(xMin);
    const maxX = Math.floor(xMax);
    const minY = Math.ceil(yMin);
    const maxY = Math.floor(yMax);

    return {
      x: Math.max(minX, Math.min(maxX, Math.round(rawX))),
      y: Math.max(minY, Math.min(maxY, Math.round(rawY)))
    };
  }

  function handlePlotStep(config, stepIndex) {
    const stepNumber = stepIndex + 1;
    const step = config.steps[stepIndex];
    const feedbackId = "feedback-" + stepNumber;
    const nextButtonId = "next-step-" + stepNumber;
    const successRevealId = "step-" + stepNumber + "-nav";
    const wrapper = document.querySelector('[data-plot-step="' + stepNumber + '"]');

    if (!wrapper || wrapper.dataset.currentX == null || wrapper.dataset.currentY == null) {
      setFeedback(feedbackId, step.emptyMessage || "Place the point on the diagram first.");
      return;
    }

    const isCorrect = Number(wrapper.dataset.currentX) === Number(wrapper.dataset.targetX)
      && Number(wrapper.dataset.currentY) === Number(wrapper.dataset.targetY);

    if (!isCorrect) {
      setFeedback(feedbackId, step.genericMessage || "Check both coordinates and try again.");

      if (stepIndex < config.steps.length - 1) {
        toggleNextStepButton(nextButtonId, false);
      } else {
        const successReveal = document.getElementById(successRevealId);
        if (successReveal) {
          successReveal.classList.add("hidden");
        }
      }

      return;
    }

    setFeedback(feedbackId, step.successMessage || "Correct.", true);

    if (stepIndex < config.steps.length - 1) {
      toggleNextStepButton(nextButtonId, true);
    } else {
      const successReveal = document.getElementById(successRevealId);
      if (successReveal) {
        successReveal.classList.remove("hidden");
      }
    }
  }

  function setupPlotStep(config, stepIndex) {
    const stepNumber = stepIndex + 1;
    const wrapper = document.querySelector('[data-plot-step="' + stepNumber + '"]');
    const svg = wrapper ? wrapper.querySelector(".interactive-plot-svg") : null;
    const checkButton = document.querySelector('[data-plot-check-step="' + stepNumber + '"]');
    let isDragging = false;

    if (!wrapper || !svg) {
      return;
    }

    function placePoint(event) {
      const coords = getPlotCoordinates(wrapper, event);
      updatePlotMarker(wrapper, stepNumber, coords.x, coords.y);
    }

    svg.addEventListener("pointerdown", function (event) {
      isDragging = true;
      placePoint(event);
      if (typeof svg.setPointerCapture === "function") {
        svg.setPointerCapture(event.pointerId);
      }
    });

    svg.addEventListener("pointermove", function (event) {
      if (!isDragging) {
        return;
      }

      placePoint(event);
    });

    function stopDragging(event) {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      placePoint(event);

      if (typeof svg.releasePointerCapture === "function") {
        try {
          svg.releasePointerCapture(event.pointerId);
        } catch (error) {
          return;
        }
      }
    }

    svg.addEventListener("pointerup", stopDragging);
    svg.addEventListener("pointercancel", function () {
      isDragging = false;
    });

    if (checkButton) {
      checkButton.addEventListener("click", function () {
        handlePlotStep(config, stepIndex);
      });
    }
  }

  function attachStepHandlers(config) {
    config.steps.forEach(function (step, index) {
      const stepNumber = index + 1;

      if (step.type === "typed") {
        const inputId = "step-" + stepNumber + "-answer";
        const previewId = "step-" + stepNumber + "-preview";
        const previewOptions = Object.assign(
          { mode: step.mode || "expression" },
          step.options || {},
          step.previewOptions || {}
        );

        TypedMath.setupMathInputPreview(inputId, previewId, previewOptions);
        TypedMath.bindMathInputCheck(inputId, function () {
          handleTypedStep(config, index);
        });

        const checkButton = document.querySelector('[data-typed-step="' + stepNumber + '"]');
        if (checkButton) {
          checkButton.addEventListener("click", function () {
            handleTypedStep(config, index);
          });
        }

        return;
      }

      if (step.type === "plot") {
        setupPlotStep(config, index);
        return;
      }

      document.querySelectorAll('[data-choice-step="' + stepNumber + '"]').forEach(function (button) {
        button.addEventListener("click", function () {
          handleChoiceStep(config, index, Number(button.dataset.choiceIndex));
        });
      });
    });

    document.querySelectorAll("[data-next-step]").forEach(function (button) {
      button.addEventListener("click", function () {
        showOnlyStep(button.dataset.nextStep);
      });
    });
  }

  function initializeComplexWalkthrough(config) {
    if (!config) {
      return;
    }

    const gateHints = !config.focus && Array.isArray(config.hints) && config.hints.length > 1
      ? config.hints.slice(1)
      : config.hints;

    prepareChoiceSteps(config);
    document.title = config.browserTitle;

    const eyebrow = document.getElementById("page-eyebrow");
    const pageTitle = document.getElementById("page-title");
    const subtitle = document.getElementById("page-subtitle");
    const backLink = document.getElementById("back-link");
    const questionCard = document.getElementById("question-card");
    const walkthroughContent = document.getElementById("walkthrough-content");
    const tipsCard = getOrCreateTipsCard(questionCard, walkthroughContent);

    if (!eyebrow || !pageTitle || !subtitle || !backLink || !questionCard || !walkthroughContent || !tipsCard) {
      return;
    }

    eyebrow.textContent = config.eyebrow || "Level 3 Complex Numbers Walkthrough";
    pageTitle.textContent = config.title;
    subtitle.textContent = config.subtitle;
    backLink.href = config.backHref;

    questionCard.classList.add("sticky-question-card");
    questionCard.innerHTML = buildQuestionCardHtml(config);
    tipsCard.innerHTML = buildTipsCardHtml(config);
    walkthroughContent.innerHTML = config.steps.map(function (step, index) {
      return renderStep(step, index, config);
    }).join("");

    if (typeof config.afterRender === "function") {
      config.afterRender();
    }

    window.renderMath = renderMath;
    renderMath(document.body);

    initializeWalkthroughGate({
      hints: gateHints,
      answerHtml: config.answerHtml,
      nextHref: config.gateNextHref || config.nextHref,
      nextLabel: config.gateNextLabel || config.nextLabel || "Next question →"
    });

    attachStepHandlers(config);
  }

  window.initializeComplexWalkthrough = initializeComplexWalkthrough;
}());
