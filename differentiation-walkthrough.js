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

  function initializeDifferentiationWalkthrough(config) {
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

    eyebrow.textContent = config.eyebrow || "Level 3 Differentiation Walkthrough";
    pageTitle.textContent = config.title;
    subtitle.textContent = config.subtitle;
    backLink.href = config.backHref;

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

  window.initializeDifferentiationWalkthrough = initializeDifferentiationWalkthrough;
}());
