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

  function showOnlyStep(stepId) {
    document.querySelectorAll(".step-card").forEach(function (step) {
      step.classList.add("hidden");
    });

    const targetStep = document.getElementById(stepId);
    if (targetStep) {
      targetStep.classList.remove("hidden");
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

  function renderChoiceButtons(step, stepNumber) {
    const gridClass = step.buttonGridClass || "button-grid";

    return `
      <div class="${gridClass}">
        ${step.choices.map(function (choice, choiceIndex) {
          return `
            <button
              class="option-btn"
              type="button"
              data-choice-step="${stepNumber}"
              data-choice-index="${choiceIndex}"
            >
              ${choice.html}
            </button>
          `;
        }).join("")}
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

  function renderStep(step, index, config) {
    const stepNumber = index + 1;
    const interactionHtml = step.type === "choice"
      ? renderChoiceButtons(step, stepNumber)
      : renderTypedInput(step, stepNumber);
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
    const focusHtml = config.focus
      ? `<p class="step-text"><strong>Focus:</strong> ${config.focus}</p>`
      : "";
    const noteHtml = (config.questionNotes || []).map(function (note) {
      return `<p class="step-text question-note">${note}</p>`;
    }).join("");

    return `
      <p class="question-label">Question</p>
      ${config.questionHtml}
      ${focusHtml}
      <p class="step-text attempt-note">
        Try the question yourself first. If you get stuck, open the hints before using the full walkthrough.
      </p>
      ${noteHtml}
      <button id="show-hints-btn" class="nav-btn" type="button">Show hints</button>
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

    document.title = config.browserTitle;

    const eyebrow = document.getElementById("page-eyebrow");
    const pageTitle = document.getElementById("page-title");
    const subtitle = document.getElementById("page-subtitle");
    const backLink = document.getElementById("back-link");
    const questionCard = document.getElementById("question-card");
    const walkthroughContent = document.getElementById("walkthrough-content");

    if (!eyebrow || !pageTitle || !subtitle || !backLink || !questionCard || !walkthroughContent) {
      return;
    }

    eyebrow.textContent = config.eyebrow || "Level 3 Complex Numbers Walkthrough";
    pageTitle.textContent = config.title;
    subtitle.textContent = config.subtitle;
    backLink.href = config.backHref;

    questionCard.innerHTML = buildQuestionCardHtml(config);
    walkthroughContent.innerHTML = config.steps.map(function (step, index) {
      return renderStep(step, index, config);
    }).join("");

    if (typeof config.afterRender === "function") {
      config.afterRender();
    }

    window.renderMath = renderMath;
    renderMath(document.body);

    initializeWalkthroughGate({
      hints: config.hints,
      answerHtml: config.answerHtml,
      nextHref: config.gateNextHref || config.nextHref,
      nextLabel: config.gateNextLabel || config.nextLabel || "Next question →"
    });

    attachStepHandlers(config);
  }

  window.initializeComplexWalkthrough = initializeComplexWalkthrough;
}());
