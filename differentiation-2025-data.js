(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-differentiation-2025";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return id + "2025.html";
  }

  function previousId(id) {
    const index = questionOrder.indexOf(id);
    return index > 0 ? questionOrder[index - 1] : null;
  }

  function nextId(id) {
    const index = questionOrder.indexOf(id);
    return index >= 0 && index < questionOrder.length - 1 ? questionOrder[index + 1] : null;
  }

  function buildFinalNav(id) {
    const previous = previousId(id);
    const next = nextId(id);

    return {
      secondary: previous
        ? {
          href: pageHref(previous),
          label: "← Back to " + questionLabel(previous)
        }
        : {
          href: paperHref,
          label: "← Back to paper"
        },
      primary: next
        ? {
          href: pageHref(next),
          label: "Next question →"
        }
        : {
          href: paperHref,
          label: "Back to paper"
        }
    };
  }

  function createConfig(id, subtitle, details) {
    const next = nextId(id);

    return Object.assign({
      browserTitle: "2025 Differentiation Paper — " + questionLabel(id),
      eyebrow: "Level 3 Differentiation Walkthrough",
      title: questionLabel(id),
      subtitle: subtitle,
      backHref: paperHref,
      nextHref: next ? pageHref(next) : paperHref,
      nextLabel: next ? "Next question →" : "Back to paper",
      finalNav: buildFinalNav(id)
    }, details);
  }

  function fmt(value) {
    return Number(value.toFixed(2));
  }

  function createScale(width, height, padding, xMin, xMax, yMin, yMax) {
    return {
      x: function (value) {
        return fmt(padding + ((value - xMin) / (xMax - xMin)) * (width - padding * 2));
      },
      y: function (value) {
        return fmt(height - padding - ((value - yMin) / (yMax - yMin)) * (height - padding * 2));
      }
    };
  }

  function polylinePath(points, scale) {
    return points.map(function (point, index) {
      return (index === 0 ? "M " : " L ") + scale.x(point[0]) + " " + scale.y(point[1]);
    }).join("");
  }

  function functionPath(fn, start, end, step, scale) {
    let d = "";
    let drawing = false;

    for (let x = start; x <= end + step / 2; x += step) {
      const y = fn(x);

      if (!Number.isFinite(y)) {
        drawing = false;
        continue;
      }

      const svgX = scale.x(x);
      const svgY = scale.y(y);

      if (!drawing) {
        d += "M " + svgX + " " + svgY;
        drawing = true;
      } else {
        d += " L " + svgX + " " + svgY;
      }
    }

    return d;
  }

  function lineMarkup(scale, x1, y1, x2, y2, className, extra) {
    return `<line class="${className}" x1="${scale.x(x1)}" y1="${scale.y(y1)}" x2="${scale.x(x2)}" y2="${scale.y(y2)}"${extra || ""}></line>`;
  }

  function circleMarkup(scale, x, y, radius, className, extra) {
    return `<circle class="${className}" cx="${scale.x(x)}" cy="${scale.y(y)}" r="${radius}"${extra || ""}></circle>`;
  }

  function textMarkup(scale, x, y, text, className, extra) {
    return `<text class="${className}" x="${scale.x(x)}" y="${scale.y(y)}"${extra || ""}>${text}</text>`;
  }

  function draw1dGraph() {
    const svg = document.getElementById("question-graph-1d");
    if (!svg) {
      return;
    }

    const width = 420;
    const height = 280;
    const padding = 32;
    const scale = createScale(width, height, padding, -1.8, 1.9, -3.2, 10.8);
    const curvePath = functionPath(function (x) {
      return x * x + Math.exp(2 * x);
    }, -1.6, 1.55, 0.03, scale);
    const slope = 2 + 2 * Math.exp(2);
    const x0 = 1;
    const y0 = 1 + Math.exp(2);
    const tangentPath = functionPath(function (x) {
      return slope * (x - x0) + y0;
    }, -0.2, 1.6, 0.03, scale);

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -1.8, 0, 1.9, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -3.2, 0, 10.8, "graph-axis")}
      <path class="question-curve" d="${curvePath}"></path>
      <path class="question-normal" d="${tangentPath}"></path>
      ${circleMarkup(scale, 1, 1 + Math.exp(2), 4.5, "question-dot")}
      ${circleMarkup(scale, 0.5, 0, 4.5, "question-dot")}
      ${textMarkup(scale, 1.03, 8.9, "tangent", "graph-label")}
      ${textMarkup(scale, -0.95, 4.6, "y = x^2 + e^(2x)", "graph-label")}
      ${textMarkup(scale, 0.48, -0.45, "P", "graph-label")}
      ${textMarkup(scale, 1.02, 8.05, "T", "graph-label")}
      ${textMarkup(scale, 1.78, -0.25, "x", "question-axis-label")}
      ${textMarkup(scale, -0.12, 10.55, "y", "question-axis-label")}
    `;
  }

  function draw2cGraph() {
    const svg = document.getElementById("question-graph-2c");
    if (!svg) {
      return;
    }

    const width = 420;
    const height = 280;
    const padding = 28;
    const scale = createScale(width, height, padding, -10, 10, -40, 10);
    const leftCurve = functionPath(function (x) {
      return (x * x) / (x + 4);
    }, -10, -4.2, 0.05, scale);
    const rightCurve = functionPath(function (x) {
      return (x * x) / (x + 4);
    }, -3.8, 10, 0.05, scale);
    const tangentOne = functionPath(function (x) {
      return -3 * x - 36;
    }, -10, -1.5, 0.1, scale);
    const tangentTwo = functionPath(function (x) {
      return -3 * x - 4;
    }, -6.5, 10, 0.1, scale);
    const gridLines = [];

    for (let x = -10; x <= 10; x += 2) {
      gridLines.push(lineMarkup(scale, x, -40, x, 10, "graph-grid-line"));
    }

    for (let y = -40; y <= 10; y += 5) {
      gridLines.push(lineMarkup(scale, -10, y, 10, y, "graph-grid-line"));
    }

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${gridLines.join("")}
      ${lineMarkup(scale, -10, 0, 10, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -40, 0, 10, "graph-axis")}
      ${lineMarkup(scale, -4, -40, -4, 10, "graph-normal", ' stroke-dasharray="6 6"')}
      <path class="question-curve" d="${leftCurve}"></path>
      <path class="question-curve" d="${rightCurve}"></path>
      <path class="graph-normal" d="${tangentOne}" stroke-dasharray="8 6"></path>
      <path class="graph-normal" d="${tangentTwo}" stroke-dasharray="8 6"></path>
      ${circleMarkup(scale, -6, -18, 4, "question-dot")}
      ${circleMarkup(scale, -2, 2, 4, "question-dot")}
      ${textMarkup(scale, -9.7, -33.5, "y = f(x)", "graph-label")}
      ${textMarkup(scale, 3.2, 1.4, "y = f(x)", "graph-label")}
      ${textMarkup(scale, -3.65, 8.7, "x = -4", "graph-label")}
      ${textMarkup(scale, 9.6, -1.3, "x", "question-axis-label")}
      ${textMarkup(scale, 0.2, 9.2, "y", "question-axis-label")}
    `;
  }

  function draw3aGraph() {
    const svg = document.getElementById("question-graph-3a");
    if (!svg) {
      return;
    }

    const width = 460;
    const height = 320;
    const padding = 28;
    const scale = createScale(width, height, padding, -10, 10, -5, 10);
    const gridLines = [];

    for (let x = -10; x <= 10; x += 1) {
      gridLines.push(lineMarkup(scale, x, -5, x, 10, "graph-grid-line"));
    }

    for (let y = -5; y <= 10; y += 1) {
      gridLines.push(lineMarkup(scale, -10, y, 10, y, "graph-grid-line"));
    }

    const leftRay = polylinePath([[-10, -2], [-6, -2]], scale);
    const middleCurve = functionPath(function (x) {
      return -1.75 * Math.pow(x + 4, 2) + 9;
    }, -6, -2, 0.04, scale);
    const lineSegment = polylinePath([[-2, 2], [3, 5]], scale);
    const rightCurve = functionPath(function (x) {
      return (8 / 9) * Math.pow(x - 6, 2) - 3;
    }, 3, 10, 0.04, scale);

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${gridLines.join("")}
      ${lineMarkup(scale, -10, 0, 10, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -5, 0, 10, "graph-axis")}
      <path class="question-curve" d="${leftRay}"></path>
      <path class="question-curve" d="${middleCurve}"></path>
      <path class="question-curve" d="${lineSegment}"></path>
      <path class="question-curve" d="${rightCurve}"></path>
      ${circleMarkup(scale, -6, -2, 3.8, "question-dot")}
      ${circleMarkup(scale, -6, 2, 4.5, "question-origin")}
      ${circleMarkup(scale, -2, 2, 4.5, "question-origin")}
      ${circleMarkup(scale, -2, 7, 3.8, "question-dot")}
      ${circleMarkup(scale, 3, 5, 4.5, "question-origin")}
      ${textMarkup(scale, 9.6, -0.4, "x", "question-axis-label")}
      ${textMarkup(scale, 0.25, 9.55, "y", "question-axis-label")}
    `;
  }

  function draw3eGraph() {
    const svg = document.getElementById("question-graph-3e");
    if (!svg) {
      return;
    }

    const width = 420;
    const height = 270;
    const padding = 30;
    const scale = createScale(width, height, padding, 0, 16, 0, 9);
    const curvePath = functionPath(function (x) {
      return Math.sqrt(Math.max(0, 16 * x - x * x));
    }, 0, 16, 0.05, scale);
    const xLeft = 8 - 4 * Math.sqrt(2);
    const xRight = 16 - xLeft;
    const heightValue = Math.sqrt(16 * xLeft - xLeft * xLeft);

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, 0, 0, 16, 0, "graph-axis")}
      ${lineMarkup(scale, 0, 0, 0, 9, "graph-axis")}
      <path class="question-curve" d="${curvePath}"></path>
      ${lineMarkup(scale, xLeft, 0, xLeft, heightValue, "question-normal")}
      ${lineMarkup(scale, xLeft, heightValue, xRight, heightValue, "question-normal")}
      ${lineMarkup(scale, xRight, 0, xRight, heightValue, "question-normal")}
      ${circleMarkup(scale, xLeft, 0, 3.5, "question-dot")}
      ${circleMarkup(scale, xLeft, heightValue, 3.5, "question-dot")}
      ${circleMarkup(scale, xRight, heightValue, 3.5, "question-dot")}
      ${circleMarkup(scale, xRight, 0, 3.5, "question-dot")}
      ${textMarkup(scale, xLeft - 0.35, -0.45, "A", "graph-label")}
      ${textMarkup(scale, xLeft - 0.35, heightValue + 0.55, "B", "graph-label")}
      ${textMarkup(scale, xRight + 0.15, heightValue + 0.55, "C", "graph-label")}
      ${textMarkup(scale, xRight + 0.15, -0.45, "D", "graph-label")}
      ${textMarkup(
        scale,
        8,
        7.05,
        "y² = 16x - x²",
        "graph-label",
        ' text-anchor="middle" stroke="#ffffff" stroke-opacity="0.96" stroke-width="6" stroke-linejoin="round" paint-order="stroke"'
      )}
      ${textMarkup(scale, 15.7, -0.35, "x", "question-axis-label")}
      ${textMarkup(scale, 0.2, 8.6, "y", "question-axis-label")}
    `;
  }

  window.Differentiation2025Walkthroughs = {
    "1a": createConfig("1a", "2025 Paper — Chain rule differentiation", {
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Differentiate } f(x)=(5x^3-2x+1)^5.
          \]
        </div>
        <p class="step-text question-note">You do not need to simplify your answer.</p>
      `,
      hints: [
        raw`This is a chain rule question with an outer power and an inside cubic.`,
        raw`Differentiate the outside first: \(u^5 \to 5u^4\).`,
        raw`Then multiply by the derivative of the inside, \(5x^3-2x+1\).`
      ],
      answerHtml: raw`
        <p class="step-text">Use the chain rule:</p>
        <div class="math-block">
          \[
          f'(x)=5(5x^3-2x+1)^4(15x^2-2)
          \]
        </div>
      `,
      steps: [
        {
          type: "choice",
          title: "Choose the rule",
          text: raw`What is the main differentiation rule you need here?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`Chain rule`,
              correct: true,
              successMessage: raw`Correct. The whole bracket is raised to a power, so this is a chain rule question.`
            },
            {
              html: raw`Product rule`,
              failureMessage: raw`Not quite. There is no product of two separate functions here.`
            },
            {
              html: raw`Quotient rule`,
              failureMessage: raw`Not here. The function is not written as one expression divided by another.`
            },
            {
              html: raw`Implicit differentiation`,
              failureMessage: raw`Not this time. The function is already given explicitly in terms of \(x\).`
            }
          ]
        },
        {
          type: "typed",
          title: "Differentiate the inside",
          text: raw`What is the derivative of the inside function \(5x^3-2x+1\)?`,
          ariaLabel: "Type the derivative of the inside function",
          acceptedAnswers: ["15x^2-2"],
          samples: [{ x: 0 }, { x: 1 }, { x: 2 }],
          successMessage: raw`Correct. Differentiate each term separately: \(15x^2-2+0\).`,
          targetedFeedback: [
            {
              answers: ["15x^2-2x"],
              message: raw`Close, but the derivative of \(-2x\) is just \(-2\), not \(-2x\).`
            }
          ],
          genericMessage: raw`Try again. Differentiate \(5x^3\), \(-2x\), and \(1\) term by term.`
        },
        {
          type: "typed",
          title: "Build the full derivative",
          text: raw`Now combine the outside derivative with the inside derivative.`,
          ariaLabel: "Type the full derivative",
          acceptedAnswers: ["5(5x^3-2x+1)^4(15x^2-2)"],
          samples: [{ x: -1 }, { x: 0.5 }, { x: 2 }],
          successMessage: raw`Yes. The chain rule gives \(5(5x^3-2x+1)^4\) multiplied by \(15x^2-2\).`,
          targetedFeedback: [
            {
              answers: ["(5x^3-2x+1)^4(15x^2-2)"],
              message: raw`You are missing the outside coefficient \(5\).`
            },
            {
              answers: ["5(5x^3-2x+1)^5(15x^2-2)"],
              message: raw`The outer power drops from \(5\) to \(4\) after differentiating.`
            }
          ],
          genericMessage: raw`Use the chain rule structure carefully: derivative of the outside, then multiply by the derivative of the inside.`
        }
      ]
    }),
    "1b": createConfig("1b", "2025 Paper — Rate of change of oven temperature", {
      questionHtml: raw`
        <p class="step-text">
          The temperature of an oven is given by the formula
          \[
          C=\frac{60}{\sqrt{t}}+5\sqrt{t}+15,
          \]
          where \(C\) is the temperature of the oven, in \(^\circ\text{C}\), and \(t\) is the time, in minutes, after the oven has been switched off.
        </p>
        <p class="step-text">Find the rate of change of the temperature of the oven \(4\) minutes after the oven was switched off.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Rewrite the square roots as powers first so the power rule is easier to use.`,
        raw`Differentiate term by term to find \(C'(t)\).`,
        raw`Then substitute \(t=4\).`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite the function in power form and differentiate:</p>
        <div class="math-block">
          \[
          C=60t^{-1/2}+5t^{1/2}+15
          \]
          \[
          C'(t)=-30t^{-3/2}+\frac{5}{2}t^{-1/2}
          \]
          \[
          C'(4)=-\frac{5}{2}
          \]
        </div>
        <p class="step-text">So the temperature is decreasing at \(\frac{5}{2}^\circ\text{C}\) per minute.</p>
      `,
      steps: [
        {
          type: "choice",
          title: "Rewrite in power form",
          text: raw`Which version rewrites the formula correctly using indices?`,
          choices: [
            {
              html: raw`\[
                60t^{-1/2}+5t^{1/2}+15
              \]`,
              correct: true,
              successMessage: raw`Correct. \(\frac{1}{\sqrt{t}}=t^{-1/2}\) and \(\sqrt{t}=t^{1/2}\).`
            },
            {
              html: raw`\[
                60t^{-2}+5t^2+15
              \]`,
              failureMessage: raw`Not quite. A square root gives a power of \(1/2\), not \(2\).`
            },
            {
              html: raw`\[
                60t^{1/2}+5t^{-1/2}+15
              \]`,
              failureMessage: raw`Those powers are reversed. The reciprocal square root should have a negative power.`
            },
            {
              html: raw`\[
                60t^{-1/2}+15t^{1/2}
              \]`,
              failureMessage: raw`You have lost the constant \(15\), and the middle term should be \(5t^{1/2}\).`
            }
          ]
        },
        {
          type: "typed",
          title: "Differentiate carefully",
          text: raw`What is \(C'(t)\)?`,
          ariaLabel: "Type the derivative of C with respect to t",
          acceptedAnswers: ["-30t^(-3/2)+(5/2)t^(-1/2)"],
          samples: [{ t: 1 }, { t: 4 }, { t: 9 }],
          successMessage: raw`Correct. The two variable terms differentiate to \(-30t^{-3/2}\) and \(\frac{5}{2}t^{-1/2}\).`,
          targetedFeedback: [
            {
              answers: ["30t^(-3/2)+(5/2)t^(-1/2)"],
              message: raw`Watch the sign. Differentiating \(t^{-1/2}\) introduces a negative coefficient.`
            }
          ],
          genericMessage: raw`Try again. Use the power rule on each term in the power-form expression.`
        },
        {
          type: "typed",
          title: "Evaluate at \(t=4\)",
          text: raw`What is the rate of change \(C'(4)\)?`,
          ariaLabel: "Type the value of C prime at 4",
          acceptedAnswers: ["-5/2"],
          successMessage: raw`Yes. The oven temperature is changing at \(-\frac{5}{2}^\circ\text{C}\) per minute after \(4\) minutes.`,
          genericMessage: raw`Check the substitution into \(C'(t)\) again, especially the negative first term.`
        }
      ]
    }),
    "1c": createConfig("1c", "2025 Paper — Gradient of a normal line", {
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{What is the gradient of the normal to the curve } y=\sin^3x\cos x \text{ when } x=\frac{\pi}{4}\text{?}
          \]
        </div>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`This is a product of \(\sin^3x\) and \(\cos x\), so start with the product rule.`,
        raw`Find the gradient of the tangent at \(x=\frac{\pi}{4}\) first.`,
        raw`The gradient of the normal is the negative reciprocal of the tangent gradient.`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate with the product rule:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=3\sin^2x\cos^2x-\sin^4x
          \]
          \[
          \frac{dy}{dx}\bigg|_{x=\pi/4}=\frac{1}{2}
          \]
        </div>
        <p class="step-text">So the normal gradient is the negative reciprocal:</p>
        <div class="math-block">
          \[
          m_{\text{normal}}=-2
          \]
        </div>
      `,
      steps: [
        {
          type: "choice",
          title: "Choose the rule",
          text: raw`What is the most useful rule to start with?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`Product rule`,
              correct: true,
              successMessage: raw`Correct. The function is a product of \(\sin^3x\) and \(\cos x\).`
            },
            {
              html: raw`Quotient rule`,
              failureMessage: raw`Not quite. The function is not written as a quotient.`
            },
            {
              html: raw`Implicit differentiation`,
              failureMessage: raw`No need for implicit differentiation here because \(y\) is already isolated.`
            },
            {
              html: raw`Only the power rule`,
              failureMessage: raw`The power rule is part of the process, but you first need the product rule because there are two factors.`
            }
          ]
        },
        {
          type: "typed",
          title: "Find the tangent gradient",
          text: raw`After differentiating, what is the gradient of the tangent when \(x=\frac{\pi}{4}\)?`,
          ariaLabel: "Type the tangent gradient",
          acceptedAnswers: ["1/2"],
          successMessage: raw`Correct. The tangent gradient at \(x=\frac{\pi}{4}\) is \(\frac{1}{2}\).`,
          genericMessage: raw`Try again. Evaluate your derivative at \(x=\frac{\pi}{4}\) using \(\sin\frac{\pi}{4}=\cos\frac{\pi}{4}=\frac{\sqrt{2}}{2}\).`
        },
        {
          type: "typed",
          title: "Convert to the normal gradient",
          text: raw`What is the gradient of the normal?`,
          ariaLabel: "Type the normal gradient",
          acceptedAnswers: ["-2"],
          successMessage: raw`Yes. The negative reciprocal of \(\frac{1}{2}\) is \(-2\).`,
          targetedFeedback: [
            {
              answers: ["2"],
              message: raw`Remember the normal gradient is the negative reciprocal, not just the reciprocal.`
            },
            {
              answers: ["-1/2"],
              message: raw`That only changes the sign. You also need the reciprocal of the tangent gradient.`
            }
          ],
          genericMessage: raw`Take the negative reciprocal of the tangent gradient.`
        }
      ]
    }),
    "1d": createConfig("1d", "2025 Paper — Tangent line x-intercept", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(f(x)=x^2+e^{2x}\) and the tangent to the curve when \(x=1\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-1d" class="graph-svg" viewBox="0 0 420 280" aria-label="Graph of y equals x squared plus e to the power 2x with a tangent at x equals 1"></svg>
        </div>
        <p class="step-text">Find the point \(P\), the \(x\)-intercept of this tangent.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Start by finding the point on the curve when \(x=1\).`,
        raw`Differentiate \(f(x)=x^2+e^{2x}\) to get the tangent gradient.`,
        raw`Use the tangent equation, then set \(y=0\) to find the \(x\)-intercept.`
      ],
      answerHtml: raw`
        <p class="step-text">At the point of tangency, \(x=1\):</p>
        <div class="math-block">
          \[
          y=1+e^2
          \]
        </div>
        <p class="step-text">Differentiate to find the gradient:</p>
        <div class="math-block">
          \[
          f'(x)=2x+2e^{2x}
          \]
          \[
          f'(1)=2+2e^2
          \]
        </div>
        <p class="step-text">Use the tangent equation and set \(y=0\):</p>
        <div class="math-block">
          \[
          y-(1+e^2)=(2+2e^2)(x-1)
          \]
          \[
          x=\frac{1}{2}
          \]
        </div>
        <p class="step-text">So \(P=\left(\frac{1}{2},0\right)\).</p>
      `,
      afterRender: draw1dGraph,
      steps: [
        {
          type: "typed",
          title: "Find the point of tangency",
          text: raw`When \(x=1\), what is the \(y\)-coordinate of the point on the curve?`,
          ariaLabel: "Type the y coordinate of the point of tangency",
          acceptedAnswers: ["1+e^2"],
          successMessage: raw`Correct. Substituting \(x=1\) gives \(1^2+e^2=1+e^2\).`,
          genericMessage: raw`Substitute \(x=1\) into \(x^2+e^{2x}\).`
        },
        {
          type: "typed",
          title: "Find the gradient",
          text: raw`What is the gradient of the tangent when \(x=1\)?`,
          ariaLabel: "Type the tangent gradient at x equals 1",
          acceptedAnswers: ["2+2e^2"],
          successMessage: raw`Yes. Since \(f'(x)=2x+2e^{2x}\), we get \(f'(1)=2+2e^2\).`,
          genericMessage: raw`Differentiate first, then substitute \(x=1\).`
        },
        {
          type: "typed",
          title: "Find the x-intercept",
          text: raw`Set the tangent equation equal to \(0\). What is the \(x\)-coordinate of point \(P\)?`,
          ariaLabel: "Type the x coordinate of P",
          acceptedAnswers: ["1/2"],
          successMessage: raw`Correct. The tangent crosses the \(x\)-axis at \(x=\frac{1}{2}\), so \(P=\left(\frac{1}{2},0\right)\).`,
          targetedFeedback: [
            {
              answers: ["-1/2"],
              message: raw`Check the rearrangement carefully. The tangent intercept is to the right of the \(y\)-axis.`
            }
          ],
          genericMessage: raw`Use the point-gradient form of the tangent line, then put \(y=0\).`
        }
      ]
    }),
    "1e": createConfig("1e", "2025 Paper — Stationary point that is also an inflection point", {
      questionHtml: raw`
        <p class="step-text">
          A curve is defined by the pair of parametric equations
          \[
          x=3t^2+6t+1 \quad \text{and} \quad y=2t^3.
          \]
        </p>
        <p class="step-text">Find the coordinates of any points of inflection on this curve that are also stationary points.</p>
        <p class="step-text">You may assume that any inflection point(s) found are actually inflection points.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`For parametric equations, start with \(\frac{dy}{dx}=\frac{dy/dt}{dx/dt}\).`,
        raw`Stationary points happen when \(\frac{dy}{dx}=0\).`,
        raw`Then check the second derivative condition and convert back to coordinates.`
      ],
      answerHtml: raw`
        <p class="step-text">First find the gradient:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=\frac{6t^2}{6t+6}=\frac{t^2}{t+1}
          \]
        </div>
        <p class="step-text">Stationary points satisfy \(\frac{dy}{dx}=0\), so \(t=0\).</p>
        <p class="step-text">At \(t=0\):</p>
        <div class="math-block">
          \[
          x=1,\qquad y=0
          \]
        </div>
        <p class="step-text">This gives the stationary point of inflection \((1,0)\).</p>
      `,
      steps: [
        {
          type: "typed",
          title: "Find \(\frac{dy}{dx}\)",
          text: raw`Using the parametric derivatives, what is \(\frac{dy}{dx}\)?`,
          ariaLabel: "Type dy by dx for the parametric curve",
          acceptedAnswers: ["t^2/(t+1)"],
          samples: [{ t: -0.5 }, { t: 1 }, { t: 2 }],
          successMessage: raw`Correct. \(\frac{dy}{dx}=\frac{dy/dt}{dx/dt}=\frac{6t^2}{6t+6}=\frac{t^2}{t+1}\).`,
          genericMessage: raw`Differentiate \(x\) and \(y\) with respect to \(t\), then divide \(\frac{dy}{dt}\) by \(\frac{dx}{dt}\).`
        },
        {
          type: "typed",
          title: "Find the stationary value of \(t\)",
          text: raw`Stationary points happen when \(\frac{dy}{dx}=0\). What value of \(t\) works here?`,
          ariaLabel: "Type the stationary value of t",
          acceptedAnswers: ["0"],
          successMessage: raw`Yes. The numerator \(t^2\) is zero when \(t=0\), giving a stationary point.`,
          targetedFeedback: [
            {
              answers: ["-1"],
              message: raw`\(t=-1\) makes the denominator zero, so the gradient is undefined there.`
            }
          ],
          genericMessage: raw`Set the numerator of \(\frac{t^2}{t+1}\) equal to zero.`
        },
        {
          type: "typed",
          title: "Find the coordinates",
          text: raw`Substitute the valid value of \(t\) back into the parametric equations. What point do you get?`,
          ariaLabel: "Type the coordinates of the point",
          mode: "list",
          options: {
            ordered: true,
            stripOuterParens: true
          },
          previewOptions: {
            wrapWithParens: true
          },
          acceptedAnswers: ["1,0"],
          successMessage: raw`Correct. At \(t=0\), the point is \((1,0)\), which is the required stationary point of inflection.`,
          targetedFeedback: [
            {
              answers: ["0,1"],
              mode: "list",
              options: {
                ordered: true,
                stripOuterParens: true
              },
              message: raw`Watch the order. Write the point as \((x,y)\), not \((y,x)\).`
            }
          ],
          genericMessage: raw`Substitute \(t=0\) into both parametric equations and write the answer as \((x,y)\).`
        }
      ]
    }),
    "2a": createConfig("2a", "2025 Paper — Differentiate a reciprocal and log function", {
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Differentiate } f(x)=\frac{7}{x}-\ln(3x^3-2x^2+5).
          \]
        </div>
        <p class="step-text question-note">You do not need to simplify your answer.</p>
      `,
      hints: [
        raw`Rewrite \(\frac{7}{x}\) as \(7x^{-1}\).`,
        raw`Use the chain rule for the logarithm term.`,
        raw`Remember \(\frac{d}{dx}[\ln u]=\frac{u'}{u}\).`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate each term:</p>
        <div class="math-block">
          \[
          \frac{d}{dx}\left(\frac{7}{x}\right)=-\frac{7}{x^2}
          \]
          \[
          \frac{d}{dx}\left[\ln(3x^3-2x^2+5)\right]=\frac{9x^2-4x}{3x^3-2x^2+5}
          \]
        </div>
        <p class="step-text">So</p>
        <div class="math-block">
          \[
          f'(x)=-\frac{7}{x^2}-\frac{9x^2-4x}{3x^3-2x^2+5}
          \]
        </div>
      `,
      steps: [
        {
          type: "choice",
          title: "Rewrite the reciprocal term",
          text: raw`Which is the best power-form rewrite of \(\frac{7}{x}\)?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                7x^{-1}
              \]`,
              correct: true,
              successMessage: raw`Correct. Writing the reciprocal as a negative power makes it easy to differentiate.`
            },
            {
              html: raw`\[
                7x
              \]`,
              failureMessage: raw`Not quite. \(\frac{7}{x}\) is not the same as \(7x\).`
            },
            {
              html: raw`\[
                x^{-7}
              \]`,
              failureMessage: raw`That changes both the coefficient and the exponent.`
            },
            {
              html: raw`\[
                \frac{1}{7x}
              \]`,
              failureMessage: raw`That places the \(7\) in the denominator, which is a different expression.`
            }
          ]
        },
        {
          type: "typed",
          title: "Differentiate the function",
          text: raw`What is \(f'(x)\)?`,
          ariaLabel: "Type the derivative of f",
          acceptedAnswers: ["-7/x^2-(9x^2-4x)/(3x^3-2x^2+5)"],
          samples: [{ x: 1 }, { x: 2 }, { x: 3 }],
          successMessage: raw`Correct. The reciprocal term uses the power rule, and the logarithm term uses the chain rule.`,
          targetedFeedback: [
            {
              answers: ["-7/x^2-(9x^2-4x)"],
              message: raw`You have differentiated the inside of the logarithm, but you still need to divide by the original inside function.`
            }
          ],
          genericMessage: raw`Differentiate each part separately, and remember the log derivative needs the inside derivative divided by the inside itself.`
        }
      ]
    }),
    "2b": createConfig("2b", "2025 Paper — Increasing or decreasing from a product rule model", {
      questionHtml: raw`
        <p class="step-text">
          The depth of water, in metres, in a particular harbour, is given by the formula
          \[
          P=(30t-5t^2)e^{-t},
          \]
          where \(t\) is measured in hours and \(0<t\le4\).
        </p>
        <p class="step-text">Show whether the depth of the water in the harbour is increasing or decreasing after \(2\) hours.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`This is a product of \((30t-5t^2)\) and \(e^{-t}\), so use the product rule.`,
        raw`Evaluate the derivative at \(t=2\).`,
        raw`A negative derivative means the depth is decreasing.`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate using the product rule:</p>
        <div class="math-block">
          \[
          P'(t)=(30-10t)e^{-t}+(30t-5t^2)(-e^{-t})
          \]
          \[
          P'(t)=e^{-t}(5t^2-40t+30)
          \]
          \[
          P'(2)=-30e^{-2}
          \]
        </div>
        <p class="step-text">Since \(P'(2)&lt;0\), the depth is <strong>decreasing</strong> after \(2\) hours.</p>
      `,
      steps: [
        {
          type: "choice",
          title: "Choose the rule",
          text: raw`Which rule should you use to differentiate \(P=(30t-5t^2)e^{-t}\)?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`Product rule`,
              correct: true,
              successMessage: raw`Correct. The formula is the product of two functions of \(t\).`
            },
            {
              html: raw`Quotient rule`,
              failureMessage: raw`Not here. The expression is written as a product, not a quotient.`
            },
            {
              html: raw`Implicit differentiation`,
              failureMessage: raw`No need for implicit differentiation in this question.`
            },
            {
              html: raw`Second derivative test`,
              failureMessage: raw`We only need the first derivative to decide whether the depth is increasing or decreasing at a given time.`
            }
          ]
        },
        {
          type: "typed",
          title: "Evaluate the derivative at \(t=2\)",
          text: raw`After differentiating, what is the value of \(P'(2)\)?`,
          beforeHtml: raw`
            <div class="math-block">
              \[
              P'(t)=(30-10t)e^{-t}+(30t-5t^2)(-e^{-t})
              \]
              \[
              P'(t)=e^{-t}(5t^2-40t+30)
              \]
            </div>
          `,
          ariaLabel: "Type the value of P prime at 2",
          acceptedAnswers: ["-30/e^2"],
          successMessage: raw`Correct. Substituting \(t=2\) gives \(P'(2)=-30e^{-2}\).`,
          genericMessage: raw`Substitute \(t=2\) into the derivative carefully and simplify.`
        },
        {
          type: "choice",
          title: "Interpret the sign",
          text: raw`What does the sign of \(P'(2)\) tell you?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`The depth is decreasing`,
              correct: true,
              successMessage: raw`Exactly. Because \(P'(2)\) is negative, the water depth is decreasing after \(2\) hours.`
            },
            {
              html: raw`The depth is increasing`,
              failureMessage: raw`A positive derivative means increasing. Here the derivative is negative.`
            },
            {
              html: raw`The depth is stationary`,
              failureMessage: raw`A stationary depth would require the derivative to be zero.`
            },
            {
              html: raw`There is not enough information`,
              failureMessage: raw`The sign of the derivative at \(t=2\) is enough to answer the question.`
            }
          ]
        }
      ]
    }),
    "2c": createConfig("2c", "2025 Paper — Tangents with a given gradient", {
      questionHtml: raw`
        <p class="step-text">
          There are two tangents to the curve
          \[
          y=f(x)=\frac{x^2}{x+4}
          \]
          that have the equation tangents of the form \(y=-3x+c\).
        </p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-2c" class="graph-svg" viewBox="0 0 420 280" aria-label="Graph of y equals x squared over x plus 4 with two tangents of gradient negative 3"></svg>
        </div>
        <p class="step-text">Find the coordinates of the two points of contact of these tangents with the curve \(y=f(x)\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Differentiate \(f(x)=\frac{x^2}{x+4}\) using the quotient rule.`,
        raw`Set the derivative equal to \(-3\) because the tangents all have gradient \(-3\).`,
        raw`Use the \(x\)-values you find to calculate the corresponding points on the curve.`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate with the quotient rule:</p>
        <div class="math-block">
          \[
          f'(x)=\frac{x(x+8)}{(x+4)^2}
          \]
        </div>
        <p class="step-text">Set the gradient equal to \(-3\):</p>
        <div class="math-block">
          \[
          \frac{x(x+8)}{(x+4)^2}=-3
          \]
          \[
          x=-6 \text{ or } x=-2
          \]
        </div>
        <p class="step-text">Substitute into the curve:</p>
        <div class="math-block">
          \[
          f(-6)=-18,\qquad f(-2)=2
          \]
        </div>
        <p class="step-text">So the points of contact are \((-6,-18)\) and \((-2,2)\).</p>
      `,
      afterRender: draw2cGraph,
      steps: [
        {
          type: "typed",
          title: "Differentiate the curve",
          text: raw`What is \(f'(x)\)?`,
          ariaLabel: "Type the derivative of the curve",
          acceptedAnswers: ["x(x+8)/(x+4)^2"],
          samples: [{ x: -6 }, { x: -2 }, { x: 3 }],
          successMessage: raw`Correct. The quotient rule simplifies to \(\frac{x(x+8)}{(x+4)^2}\).`,
          targetedFeedback: [
            {
              answers: ["(2x(x+4)-x^2)/(x+4)^2"],
              message: raw`That is the correct quotient-rule numerator before simplifying. Expand and tidy it to \(\frac{x(x+8)}{(x+4)^2}\).`
            }
          ],
          genericMessage: raw`Use the quotient rule carefully, then simplify the numerator.`
        },
        {
          type: "typed",
          title: "Find the matching \(x\)-values",
          text: raw`Solve \(f'(x)=-3\). What two \(x\)-values do you get?`,
          ariaLabel: "Type the x values where the derivative is negative three",
          mode: "list",
          options: {
            ordered: false,
            stripOuterParens: true
          },
          acceptedAnswers: ["-6,-2"],
          successMessage: raw`Yes. The two tangency points occur when \(x=-6\) and \(x=-2\).`,
          targetedFeedback: [
            {
              answers: ["-8,0"],
              mode: "list",
              options: {
                ordered: false,
                stripOuterParens: true
              },
              message: raw`Those are the zeros of the derivative numerator, but here you need the points where the derivative equals \(-3\), not \(0\).`
            }
          ],
          genericMessage: raw`Set the derivative equal to \(-3\) and solve the resulting equation.`
        },
        {
          type: "choice",
          title: "Choose the two points of contact",
          text: raw`Which pair of coordinates is correct?`,
          choices: [
            {
              html: raw`\[
                (-6,-18)\text{ and }(-2,2)
              \]`,
              correct: true,
              successMessage: raw`Correct. Substituting the two \(x\)-values into the curve gives \((-6,-18)\) and \((-2,2)\).`
            },
            {
              html: raw`\[
                (-6,18)\text{ and }(-2,2)
              \]`,
              failureMessage: raw`Check the sign of \(f(-6)\). The denominator is negative there, so the \(y\)-value is negative.`
            },
            {
              html: raw`\[
                (-8,0)\text{ and }(0,0)
              \]`,
              failureMessage: raw`Those are related to where the derivative numerator is zero, not to the tangents of gradient \(-3\).`
            },
            {
              html: raw`\[
                (-6,-18)\text{ and }(-2,-2)
              \]`,
              failureMessage: raw`Recheck \(f(-2)\). It equals \(2\), not \(-2\).`
            }
          ]
        }
      ]
    }),
    "2d": createConfig("2d", "2025 Paper — Tangent equation for a parametric curve", {
      questionHtml: raw`
        <p class="step-text">
          Find the equation of the tangent to the graph defined by the pair of equations
          \[
          x=2\sec t \quad \text{and} \quad y=5\tan t,
          \]
          at the point on the graph where \(t=\frac{\pi}{6}\).
        </p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`For a parametric curve, \(\frac{dy}{dx}=\frac{dy/dt}{dx/dt}\).`,
        raw`Find the point on the curve when \(t=\frac{\pi}{6}\).`,
        raw`Use the point-gradient form of a line.`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate each parametric equation:</p>
        <div class="math-block">
          \[
          \frac{dx}{dt}=2\sec t\tan t,\qquad \frac{dy}{dt}=5\sec^2 t
          \]
          \[
          \frac{dy}{dx}=\frac{5\sec^2 t}{2\sec t\tan t}=\frac{5}{2\sin t}
          \]
          \[
          \frac{dy}{dx}\bigg|_{t=\pi/6}=5
          \]
        </div>
        <p class="step-text">Find the point:</p>
        <div class="math-block">
          \[
          \left(x,y\right)=\left(\frac{4}{\sqrt{3}},\frac{5}{\sqrt{3}}\right)
          \]
        </div>
        <p class="step-text">So the tangent equation is:</p>
        <div class="math-block">
          \[
          y-\frac{5}{\sqrt{3}}=5\left(x-\frac{4}{\sqrt{3}}\right)
          \]
          \[
          y=5x-5\sqrt{3}
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Find \(\frac{dy}{dx}\)",
          text: raw`What is \(\frac{dy}{dx}\) for this parametric curve?`,
          ariaLabel: "Type dy by dx for the parametric curve",
          acceptedAnswers: ["5/(2sin(t))"],
          samples: [{ t: 0.7 }, { t: 1 }, { t: 1.2 }],
          successMessage: raw`Correct. Dividing \(\frac{dy}{dt}\) by \(\frac{dx}{dt}\) simplifies to \(\frac{5}{2\sin t}\).`,
          genericMessage: raw`Differentiate \(x\) and \(y\) with respect to \(t\), then divide \(\frac{dy}{dt}\) by \(\frac{dx}{dt}\).`
        },
        {
          type: "typed",
          title: "Find the point on the curve",
          text: raw`When \(t=\frac{\pi}{6}\), what point \((x,y)\) lies on the curve?`,
          ariaLabel: "Type the point on the curve",
          mode: "list",
          options: {
            ordered: true,
            stripOuterParens: true
          },
          previewOptions: {
            wrapWithParens: true
          },
          acceptedAnswers: ["4/sqrt(3),5/sqrt(3)"],
          successMessage: raw`Correct. At \(t=\frac{\pi}{6}\), the point is \(\left(\frac{4}{\sqrt{3}},\frac{5}{\sqrt{3}}\right)\).`,
          genericMessage: raw`Substitute \(t=\frac{\pi}{6}\) into both parametric equations and write the coordinates as \((x,y)\).`
        },
        {
          type: "typed",
          title: "Write the tangent equation",
          text: raw`What is the equation of the tangent line?`,
          ariaLabel: "Type the tangent line equation",
          mode: "equation",
          acceptedAnswers: ["y=5x-5sqrt(3)"],
          samples: [{ x: 0 }, { x: 1 }, { x: 3 }],
          successMessage: raw`Yes. The tangent has gradient \(5\) and passes through \(\left(\frac{4}{\sqrt{3}},\frac{5}{\sqrt{3}}\right)\), so \(y=5x-5\sqrt{3}\).`,
          genericMessage: raw`Use the point-gradient form \(y-y_1=m(x-x_1)\), then simplify.`
        }
      ]
    }),
    "2e": createConfig("2e", "2025 Paper — Radius of curvature", {
      questionHtml: raw`
        <p class="step-text">The radius of curvature of a function is a measure of how much the curve is bending at a given point.</p>
        <div class="math-block">
          \[
          \rho=\frac{\left(1+\left(\frac{dy}{dx}\right)^2\right)^{3/2}}{\frac{d^2y}{dx^2}}
          \]
        </div>
        <p class="step-text">Find the radius of curvature for the curve \(y=\cos^2(2x)\) when \(x=\frac{\pi}{3}\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Find the first derivative carefully using the chain rule.`,
        raw`Then differentiate again to get the second derivative.`,
        raw`Evaluate both derivatives at \(x=\frac{\pi}{3}\), then substitute into the formula.`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate twice:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=-2\sin(4x)
          \]
          \[
          \frac{d^2y}{dx^2}=-8\cos(4x)
          \]
        </div>
        <p class="step-text">At \(x=\frac{\pi}{3}\):</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=\sqrt{3},\qquad \frac{d^2y}{dx^2}=4
          \]
        </div>
        <p class="step-text">Substitute into the formula:</p>
        <div class="math-block">
          \[
          \rho=\frac{(1+3)^{3/2}}{4}=2
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Find the first derivative",
          text: raw`What is \(\frac{dy}{dx}\) for \(y=\cos^2(2x)\)?`,
          ariaLabel: "Type the first derivative",
          acceptedAnswers: ["-2sin(4x)", "-4sin(2x)cos(2x)"],
          samples: [{ x: 0.2 }, { x: 1 }, { x: 1.4 }],
          successMessage: raw`Correct. The first derivative can be written as \(-4\sin(2x)\cos(2x)\), which simplifies to \(-2\sin(4x)\).`,
          genericMessage: raw`Use the chain rule carefully: differentiate the outside square, then the inside cosine, then the angle \(2x\).`
        },
        {
          type: "typed",
          title: "Find the second derivative",
          text: raw`What is \(\frac{d^2y}{dx^2}\)?`,
          ariaLabel: "Type the second derivative",
          acceptedAnswers: ["-8cos(4x)"],
          samples: [{ x: 0.2 }, { x: 1 }, { x: 1.4 }],
          successMessage: raw`Yes. Differentiating \(-2\sin(4x)\) gives \(-8\cos(4x)\).`,
          genericMessage: raw`Differentiate the first derivative again, remembering the chain rule for the angle \(4x\).`
        },
        {
          type: "typed",
          title: "Evaluate the radius of curvature",
          text: raw`What is the radius of curvature when \(x=\frac{\pi}{3}\)?`,
          ariaLabel: "Type the radius of curvature",
          acceptedAnswers: ["2"],
          successMessage: raw`Correct. Substituting the derivative values into the formula gives \(\rho=2\).`,
          genericMessage: raw`Evaluate both derivatives at \(x=\frac{\pi}{3}\), then substitute into the radius of curvature formula.`
        }
      ]
    }),
    "3a": createConfig("3a", "2025 Paper — Reading derivatives and limits from a graph", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(y=f(x)\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3a" class="graph-svg" viewBox="0 0 460 320" aria-label="Graph of a piecewise function with a horizontal ray, two holes, and turning points"></svg>
        </div>
        <div class="question-math">
          \[
          \text{(i) Find the value(s) of }x\text{ where }f(x)\text{ is not differentiable.}
          \]
          \[
          \text{(ii) Find the value(s) of }x\text{ where }f'(x)=0.
          \]
          \[
          \text{(iii) What is the value of }\lim_{x\to -2}f(x)\text{?}
          \]
        </div>
      `,
      hints: [
        raw`Points are not differentiable where the graph has a jump, a hole, or a sharp break.`,
        raw`The derivative is zero where the graph is horizontal.`,
        raw`For the limit, look at the value the graph approaches from both sides, not the filled-in point.`
      ],
      answerHtml: raw`
        <p class="step-text">The graph tells us:</p>
        <div class="math-block">
          \[
          \text{(i) }x=-6,\,-2,\text{ and }3
          \]
          \[
          \text{(ii) }x&lt;-6,\ x=-4,\text{ and }x=6
          \]
          \[
          \text{(iii) }\lim_{x\to -2}f(x)=2
          \]
        </div>
      `,
      afterRender: draw3aGraph,
      steps: [
        {
          type: "choice",
          title: "Find the non-differentiable points",
          text: raw`Which set of \(x\)-values is correct for part (i)?`,
          choices: [
            {
              html: raw`\[
                x=-6,\,-2,\text{ and }3
              \]`,
              correct: true,
              successMessage: raw`Correct. There is a break at \(x=-6\), a hole and mismatched point at \(x=-2\), and another hole at \(x=3\).`
            },
            {
              html: raw`\[
                x=-4,\,-2,\text{ and }6
              \]`,
              failureMessage: raw`Not quite. The points \(x=-4\) and \(x=6\) are smooth turning points, so the derivative exists there.`
            },
            {
              html: raw`\[
                x=-6\text{ and }3
              \]`,
              failureMessage: raw`You have missed the discontinuity at \(x=-2\).`
            },
            {
              html: raw`\[
                x=-2\text{ and }6
              \]`,
              failureMessage: raw`The point \(x=6\) is a smooth minimum, so it is differentiable there.`
            }
          ]
        },
        {
          type: "choice",
          title: "Find where \(f'(x)=0\)",
          text: raw`Which answer matches the horizontal parts and turning points of the graph?`,
          choices: [
            {
              html: raw`\[
                x&lt;-6,\ x=-4,\text{ and }x=6
              \]`,
              correct: true,
              successMessage: raw`Yes. The left ray is horizontal for every \(x&lt;-6\), and the two smooth turning points occur at \(x=-4\) and \(x=6\).`
            },
            {
              html: raw`\[
                x=-6,\,-4,\text{ and }6
              \]`,
              failureMessage: raw`At \(x=-6\) the graph jumps between pieces, so the derivative does not exist there.`
            },
            {
              html: raw`\[
                x&lt;-6,\ x=3,\text{ and }x=6
              \]`,
              failureMessage: raw`At \(x=3\) there is a hole, so the derivative does not exist there.`
            },
            {
              html: raw`\[
                x=-4\text{ and }x=6
              \]`,
              failureMessage: raw`You also need the entire horizontal ray for \(x&lt;-6\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Evaluate the limit",
          text: raw`What is \(\lim_{x\to -2}f(x)\)?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                2
              \]`,
              correct: true,
              successMessage: raw`Correct. Both sides of the graph approach \(2\) as \(x\) approaches \(-2\).`
            },
            {
              html: raw`\[
                7
              \]`,
              failureMessage: raw`\(7\) is the value of the filled point, but the limit depends on what the graph approaches from both sides.`
            },
            {
              html: raw`\[
                0
              \]`,
              failureMessage: raw`The graph is not approaching \(0\) near \(x=-2\).`
            },
            {
              html: raw`\[
                \text{Does not exist}
              \]`,
              failureMessage: raw`The limit does exist because the left- and right-hand values both approach the same number.`
            }
          ]
        }
      ]
    }),
    "3b": createConfig("3b", "2025 Paper — Stationary point of a logarithmic curve", {
      questionHtml: raw`
        <div class="question-math">
          \[
          y=\frac{\ln x}{2x}
          \]
        </div>
        <p class="step-text">Find the \(x\)-coordinate(s) of any stationary point(s) on the curve.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`A convenient rewrite is \(y=\frac{1}{2}(\ln x)x^{-1}\).`,
        raw`Differentiate, then set the derivative equal to zero.`,
        raw`Solve the resulting logarithmic equation.`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite and differentiate:</p>
        <div class="math-block">
          \[
          y=\frac{1}{2}(\ln x)x^{-1}
          \]
          \[
          \frac{dy}{dx}=\frac{1-\ln x}{2x^2}
          \]
        </div>
        <p class="step-text">Set the derivative equal to zero:</p>
        <div class="math-block">
          \[
          1-\ln x=0
          \]
          \[
          \ln x=1
          \]
          \[
          x=e
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Differentiate the curve",
          text: raw`What is \(\frac{dy}{dx}\)?`,
          ariaLabel: "Type the derivative of y",
          acceptedAnswers: ["(1-ln(x))/(2x^2)"],
          samples: [{ x: 1.5 }, { x: 2 }, { x: 4 }],
          successMessage: raw`Correct. Differentiating gives \(\frac{1-\ln x}{2x^2}\).`,
          genericMessage: raw`Try rewriting the function as \(\frac{1}{2}(\ln x)x^{-1}\) or use the quotient rule, then simplify.`
        },
        {
          type: "typed",
          title: "Solve for the stationary point",
          text: raw`Set the derivative equal to zero. What is the \(x\)-coordinate of the stationary point?`,
          ariaLabel: "Type the x coordinate of the stationary point",
          acceptedAnswers: ["e"],
          successMessage: raw`Yes. Setting \(1-\ln x=0\) gives \(\ln x=1\), so \(x=e\).`,
          genericMessage: raw`Set the derivative equal to zero and solve the logarithmic equation.`
        }
      ]
    }),
    "3c": createConfig("3c", "2025 Paper — Related rates for a melting sphere", {
      questionHtml: raw`
        <p class="step-text">A solid spherical lump of ice is melting while maintaining its spherical shape.</p>
        <p class="step-text">At the instant when the radius is \(6\) cm, the radius of the ball of ice is decreasing by \(0.05\) cm s\(^{-1}\).</p>
        <p class="step-text">Find the rate at which the volume of the spherical ice ball is decreasing at the instant when the radius is \(6\) cm.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Use the sphere volume formula \(V=\frac{4}{3}\pi r^3\).`,
        raw`Differentiate volume with respect to \(r\) first.`,
        raw`Then use \(\frac{dV}{dt}=\frac{dV}{dr}\cdot\frac{dr}{dt}\).`
      ],
      answerHtml: raw`
        <p class="step-text">Start with the volume formula:</p>
        <div class="math-block">
          \[
          V=\frac{4}{3}\pi r^3
          \]
          \[
          \frac{dV}{dr}=4\pi r^2
          \]
        </div>
        <p class="step-text">Apply the chain rule in rates form:</p>
        <div class="math-block">
          \[
          \frac{dV}{dt}=\frac{dV}{dr}\cdot\frac{dr}{dt}
          \]
          \[
          \frac{dV}{dt}=4\pi(6)^2(-0.05)
          \]
          \[
          \frac{dV}{dt}=-\frac{36\pi}{5}
          \]
        </div>
        <p class="step-text">So the volume is decreasing at \(\frac{36\pi}{5}\text{ cm}^3\text{s}^{-1}\).</p>
      `,
      steps: [
        {
          type: "choice",
          title: "Link the rates",
          text: raw`Which relationship should you use between the rates?`,
          choices: [
            {
              html: raw`\[
                \frac{dV}{dt}=\frac{dV}{dr}\cdot\frac{dr}{dt}
              \]`,
              correct: true,
              successMessage: raw`Correct. This is the chain rule written for related rates.`
            },
            {
              html: raw`\[
                \frac{dV}{dt}=\frac{dV}{dr}+\frac{dr}{dt}
              \]`,
              failureMessage: raw`Not quite. Related rates are linked by multiplication here, not addition.`
            },
            {
              html: raw`\[
                \frac{dV}{dt}=\frac{dr}{dt}\div\frac{dV}{dr}
              \]`,
              failureMessage: raw`The rates should be multiplied in this chain-rule relationship.`
            },
            {
              html: raw`\[
                \frac{dV}{dt}=\frac{4}{3}\pi r^3\cdot\frac{dr}{dt}
              \]`,
              failureMessage: raw`You need \(\frac{dV}{dr}\), not just the original volume formula.`
            }
          ]
        },
        {
          type: "typed",
          title: "Differentiate volume with respect to radius",
          text: raw`What is \(\frac{dV}{dr}\) for a sphere?`,
          ariaLabel: "Type dV by dr",
          acceptedAnswers: ["4pi r^2"],
          samples: [{ r: 1 }, { r: 3 }, { r: 6 }],
          successMessage: raw`Correct. Differentiating \(\frac{4}{3}\pi r^3\) gives \(4\pi r^2\).`,
          genericMessage: raw`Differentiate \(V=\frac{4}{3}\pi r^3\) with respect to \(r\).`
        },
        {
          type: "typed",
          title: "Find the rate of change of volume",
          text: raw`What is \(\frac{dV}{dt}\) when \(r=6\) and \(\frac{dr}{dt}=-0.05\)?`,
          ariaLabel: "Type dV by dt",
          acceptedAnswers: ["-36pi/5"],
          successMessage: raw`Yes. The volume is decreasing at \(-\frac{36\pi}{5}\text{ cm}^3\text{s}^{-1}\).`,
          genericMessage: raw`Substitute \(r=6\) and \(\frac{dr}{dt}=-0.05\) into \(\frac{dV}{dt}=\frac{dV}{dr}\cdot\frac{dr}{dt}\).`
        }
      ]
    }),
    "3d": createConfig("3d", "2025 Paper — Gradient condition for a parametric curve", {
      questionHtml: raw`
        <p class="step-text">
          The equation of a curve is given by the pair of parametric equations
          \[
          x=\frac{5}{e^{2t}} \quad \text{and} \quad y=5e^{2t}.
          \]
        </p>
        <p class="step-text">Find the coordinates of the point(s) on the curve where the gradient is \(-2\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Rewrite \(x=\frac{5}{e^{2t}}\) as \(x=5e^{-2t}\) before differentiating.`,
        raw`Find \(\frac{dy}{dx}=\frac{dy/dt}{dx/dt}\), then set it equal to \(-2\).`,
        raw`Use the value of \(t\) to find both coordinates.`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite and differentiate:</p>
        <div class="math-block">
          \[
          x=5e^{-2t},\qquad y=5e^{2t}
          \]
          \[
          \frac{dx}{dt}=-10e^{-2t},\qquad \frac{dy}{dt}=10e^{2t}
          \]
          \[
          \frac{dy}{dx}=\frac{10e^{2t}}{-10e^{-2t}}=-e^{4t}
          \]
        </div>
        <p class="step-text">Set the gradient equal to \(-2\):</p>
        <div class="math-block">
          \[
          -e^{4t}=-2
          \]
          \[
          e^{4t}=2
          \]
          \[
          t=\frac{\ln 2}{4}
          \]
        </div>
        <p class="step-text">Substitute back:</p>
        <div class="math-block">
          \[
          x=\frac{5}{\sqrt{2}},\qquad y=5\sqrt{2}
          \]
        </div>
        <p class="step-text">So the point is \(\left(\frac{5}{\sqrt{2}},5\sqrt{2}\right)\).</p>
      `,
      steps: [
        {
          type: "typed",
          title: "Find \(\frac{dy}{dx}\)",
          text: raw`What is the gradient \(\frac{dy}{dx}\) in terms of \(t\)?`,
          ariaLabel: "Type dy by dx in terms of t",
          acceptedAnswers: ["-e^(4t)"],
          samples: [{ t: 0 }, { t: 0.5 }, { t: 1 }],
          successMessage: raw`Correct. The gradient simplifies to \(-e^{4t}\).`,
          genericMessage: raw`Differentiate both parametric equations with respect to \(t\), then divide \(\frac{dy}{dt}\) by \(\frac{dx}{dt}\).`
        },
        {
          type: "typed",
          title: "Solve for the parameter",
          text: raw`Set the gradient equal to \(-2\). What value of \(t\) do you get?`,
          ariaLabel: "Type the value of t",
          acceptedAnswers: ["ln(2)/4"],
          successMessage: raw`Yes. Solving \(-e^{4t}=-2\) gives \(t=\frac{\ln 2}{4}\).`,
          genericMessage: raw`Set \(-e^{4t}\) equal to \(-2\), then solve the exponential equation.`
        },
        {
          type: "typed",
          title: "Find the coordinates",
          text: raw`What point on the curve has this gradient?`,
          ariaLabel: "Type the coordinates of the point",
          mode: "list",
          options: {
            ordered: true,
            stripOuterParens: true
          },
          previewOptions: {
            wrapWithParens: true
          },
          acceptedAnswers: ["5/sqrt(2),5sqrt(2)"],
          successMessage: raw`Correct. Substituting the value of \(t\) gives \(\left(\frac{5}{\sqrt{2}},5\sqrt{2}\right)\).`,
          genericMessage: raw`Substitute \(t=\frac{\ln 2}{4}\) into both parametric equations and write the point as \((x,y)\).`
        }
      ]
    }),
    "3e": createConfig("3e", "2025 Paper — Maximum-area rectangle in a curve", {
      questionHtml: raw`
        <p class="step-text">The diagram below shows part of the symmetrical graph \(y^2=16x-x^2\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3e" class="graph-svg" viewBox="0 0 420 270" aria-label="Upper half of the curve y squared equals 16x minus x squared with a rectangle inside"></svg>
        </div>
        <p class="step-text">A rectangle \(ABCD\) is drawn inside the curve with its vertices \(B\) and \(C\) lying on the curve.</p>
        <p class="step-text">Find the length \(AD\) so that the rectangle has its maximum area.</p>
        <p class="step-text question-note">You can assume that the value found is a maximum.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Let \(A=(x,0)\), so by symmetry \(D\) is at \(x=16-x\).`,
        raw`The height is \(AB=\sqrt{16x-x^2}\), and the width is \(AD=16-2x\).`,
        raw`Differentiate the area function, solve for the valid \(x\)-value, then calculate \(AD\).`
      ],
      answerHtml: raw`
        <p class="step-text">Let \(A=(x,0)\). Then:</p>
        <div class="math-block">
          \[
          AD=16-2x
          \]
          \[
          AB=\sqrt{16x-x^2}
          \]
          \[
          \text{Area}=(16-2x)\sqrt{16x-x^2}
          \]
        </div>
        <p class="step-text">Differentiating and solving \(A'(x)=0\) gives:</p>
        <div class="math-block">
          \[
          x=8-4\sqrt{2}
          \]
        </div>
        <p class="step-text">So the maximum width is:</p>
        <div class="math-block">
          \[
          AD=16-2x=8\sqrt{2}
          \]
        </div>
      `,
      afterRender: draw3eGraph,
      steps: [
        {
          type: "typed",
          title: "Write the area function",
          text: raw`If \(A=(x,0)\), what is the area of the rectangle in terms of \(x\)?`,
          ariaLabel: "Type the area function",
          acceptedAnswers: ["(16-2x)sqrt(16x-x^2)"],
          samples: [{ x: 1 }, { x: 3 }, { x: 6 }],
          successMessage: raw`Correct. Width times height gives \((16-2x)\sqrt{16x-x^2}\).`,
          genericMessage: raw`Use symmetry to find \(AD=16-2x\), then multiply by the height \(AB=\sqrt{16x-x^2}\).`
        },
        {
          type: "typed",
          title: "Solve for the valid \(x\)-value",
          text: raw`Solving \(A'(x)=0\), what valid value of \(x\) do you get?`,
          beforeHtml: raw`
            <div class="math-block">
              \[
              A'(x)=-2\sqrt{16x-x^2}+\frac{(16-2x)^2}{2\sqrt{16x-x^2}}
              \]
            </div>
          `,
          ariaLabel: "Type the valid x value",
          acceptedAnswers: ["8-4sqrt(2)"],
          tolerance: 1e-3,
          successMessage: raw`Yes. The valid value is \(x=8-4\sqrt{2}\), which is about \(2.343\).`,
          targetedFeedback: [
            {
              answers: ["8+4sqrt(2)"],
              message: raw`That value lies to the right of the centre, so it does not match point \(A\) on the left side of the rectangle.`
            }
          ],
          genericMessage: raw`Solve the derivative equation and keep the value that fits the left-hand corner \(A\) on the diagram.`
        },
        {
          type: "typed",
          title: "Find the maximum length \(AD\)",
          text: raw`What is the maximum length \(AD\)?`,
          ariaLabel: "Type the maximum length AD",
          acceptedAnswers: ["8sqrt(2)"],
          tolerance: 1e-3,
          successMessage: raw`Correct. The rectangle has maximum length \(AD=8\sqrt{2}\), which is about \(11.314\) units.`,
          genericMessage: raw`Use \(AD=16-2x\) with your value of \(x\).`
        }
      ]
    })
  };
}());
