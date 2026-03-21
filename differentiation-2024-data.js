(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-differentiation-2024";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return id + "2024.html";
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
      browserTitle: "2024 Differentiation Paper — " + questionLabel(id),
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

  function polylinePath(points, scale) {
    return points.map(function (point, index) {
      return (index === 0 ? "M " : " L ") + scale.x(point[0]) + " " + scale.y(point[1]);
    }).join("");
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

  function draw3bGraph() {
    const svg = document.getElementById("question-graph-3b-2024");
    if (!svg) {
      return;
    }

    const width = 560;
    const height = 360;
    const padding = 34;
    const scale = createScale(width, height, padding, -5, 10, -2, 7);
    const gridLines = [];

    for (let x = -5; x <= 10; x += 1) {
      gridLines.push(lineMarkup(scale, x, -2, x, 7, "graph-grid-line"));
    }

    for (let y = -2; y <= 7; y += 1) {
      gridLines.push(lineMarkup(scale, -5, y, 10, y, "graph-grid-line"));
    }

    const leftRay = polylinePath([[-5, 5], [-1, 1]], scale);
    const middleCurve = functionPath(function (x) {
      return -1.25 * Math.pow(x - 1, 2) + 6;
    }, -1, 3, 0.04, scale);
    const flatSegment = polylinePath([[3, -1], [5, -1]], scale);
    const rightRay = polylinePath([[5, -1], [10, 4]], scale);

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${gridLines.join("")}
      ${lineMarkup(scale, -5, 0, 10, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -2, 0, 7, "graph-axis")}
      <path class="question-curve" d="${leftRay}"></path>
      <path class="question-curve" d="${middleCurve}"></path>
      <path class="question-curve" d="${flatSegment}"></path>
      <path class="question-curve" d="${rightRay}"></path>
      ${circleMarkup(scale, -1, 1, 5.2, "question-origin")}
      ${circleMarkup(scale, 0, 0, 5.2, "question-origin")}
      ${circleMarkup(scale, 3, -1, 5.2, "question-origin")}
      ${circleMarkup(scale, 3, 1, 4.8, "question-dot")}
      ${textMarkup(scale, 10.2, 0.12, "x", "question-axis-label")}
      ${textMarkup(scale, 0.18, 7.18, "y", "question-axis-label")}
    `;
  }

  function draw3eGraph() {
    const svg = document.getElementById("question-graph-3e-2024");
    if (!svg) {
      return;
    }

    const width = 520;
    const height = 320;
    const padding = 34;
    const scale = createScale(width, height, padding, 0, 3, -0.25, 1.25);
    const curvePath = functionPath(function (x) {
      return Math.exp(-(x * x));
    }, 0, 2.85, 0.03, scale);
    const px = 1;
    const py = Math.exp(-1);
    const qx = 2;

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, 0, 0, 3, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -0.25, 0, 1.25, "graph-axis")}
      <path class="question-curve" d="${curvePath}"></path>
      ${lineMarkup(scale, 0, 0, px, py, "question-normal")}
      ${lineMarkup(scale, px, py, qx, 0, "question-normal")}
      ${lineMarkup(scale, 0, 0, qx, 0, "question-normal")}
      ${circleMarkup(scale, 0, 0, 4, "question-dot")}
      ${circleMarkup(scale, px, py, 4, "question-dot")}
      ${circleMarkup(scale, qx, 0, 4, "question-dot")}
      ${textMarkup(scale, 0, -0.06, "O", "graph-label", ' text-anchor="end"')}
      ${textMarkup(scale, px - 0.03, py + 0.08, "P", "graph-label")}
      ${textMarkup(scale, qx + 0.03, -0.06, "Q", "graph-label")}
      ${textMarkup(scale, 0.9, 1.02, "y = e^{-x^2}", "graph-equation-label")}
      ${textMarkup(scale, 3.05, -0.04, "x", "question-axis-label")}
      ${textMarkup(scale, -0.04, 1.28, "y", "question-axis-label")}
    `;
  }

  window.Differentiation2024Walkthroughs = {
    "1a": createConfig("1a", "2024 Paper — Chain rule with a square root", {
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Differentiate } f(x)=\sqrt{4-9x^4}.
          \]
        </div>
        <p class="step-text question-note">You do not need to simplify your answer.</p>
      `,
      hints: [
        raw`Taking the square root is the same as raising the bracket to the power of \(\frac{1}{2}\).`,
        raw`This is still a chain rule question: outside first, then inside.`,
        raw`If you want the fully tidied version at the end, the negative power can go back into a denominator.`
      ],
      answerHtml: raw`
        <p class="step-text">Following the walkthrough method:</p>
        <div class="math-block">
          \[
          f(x)=(4-9x^4)^{1/2}
          \]
          \[
          f'(x)=\frac{1}{2}(4-9x^4)^{-1/2}(-36x^3)
          \]
          \[
          f'(x)=-18x^3(4-9x^4)^{-1/2}
          \]
        </div>
        <p class="step-text">You can leave it like that. If you fully simplify it, you get</p>
        <div class="math-block">
          \[
          f'(x)=-\frac{18x^3}{\sqrt{4-9x^4}}.
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Rewrite the square root first",
          text: raw`As in your walkthrough, what is the index-form rewrite of \(\sqrt{4-9x^4}\)?`,
          ariaLabel: "Type the index form rewrite",
          acceptedAnswers: ["(4-9x^4)^(1/2)"],
          samples: [{ x: 0 }, { x: 0.4 }, { x: 0.7 }],
          successMessage: raw`Yes. Writing the square root as a power of \(\frac{1}{2}\) makes the chain rule much easier to see.`,
          genericMessage: raw`Rewrite the square root as a power of one half, with the whole bracket kept together.`
        },
        {
          type: "typed",
          title: "Differentiate the inside",
          text: raw`What is the derivative of the inside bracket \(4-9x^4\)?`,
          ariaLabel: "Type the derivative of the inside bracket",
          acceptedAnswers: ["-36x^3"],
          samples: [{ x: 0 }, { x: 1 }, { x: 2 }],
          successMessage: raw`Correct. The constant disappears, and \(-9x^4\) becomes \(-36x^3\).`,
          targetedFeedback: [
            {
              answers: ["-36x^4"],
              message: raw`Close, but the power drops by one when you differentiate.`
            }
          ],
          genericMessage: raw`Differentiate the inside term by term before putting it into the chain rule.`
        },
        {
          type: "typed",
          title: "Build the derivative",
          text: raw`Now put the outside and inside together. What is \(f'(x)\)?`,
          ariaLabel: "Type the derivative of f",
          acceptedAnswers: [
            "-18x^3(4-9x^4)^(-1/2)",
            "(-18x^3)/sqrt(4-9x^4)"
          ],
          samples: [{ x: 0.1 }, { x: 0.4 }, { x: 0.7 }],
          successMessage: raw`Nice. That matches the walkthrough exactly, and the simplified denominator form is fine too.`,
          targetedFeedback: [
            {
              answers: ["(1/2)(4-9x^4)^(-1/2)"],
              message: raw`That is only the derivative of the outside. You still need to multiply by the derivative of the inside.`
            }
          ],
          genericMessage: raw`Use chain rule structure: derivative of the outside, then multiply by the derivative of the inside.`
        }
      ]
    }),
    "1b": createConfig("1b", "2024 Paper — Product rule at \(x=0\)", {
      questionHtml: raw`
        <p class="step-text">
          A curve is defined by the equation
          \[
          y=(x^2+3x+2)\sin x.
          \]
        </p>
        <p class="step-text">Find the gradient of the tangent to this curve when \(x=0\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Here we have two functions multiplied together, so start with the product rule.`,
        raw`Differentiate both factors before you substitute \(x=0\).`,
        raw`At the end, use \(\sin 0=0\) and \(\cos 0=1\).`
      ],
      answerHtml: raw`
        <p class="step-text">Using the product rule:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=(2x+3)\sin x+(x^2+3x+2)\cos x
          \]
        </div>
        <p class="step-text">Now evaluate at \(x=0\):</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}\bigg|_{x=0}=3\sin 0+2\cos 0=0+2=2
          \]
        </div>
        <p class="step-text">So the gradient of the tangent is \(2\).</p>
      `,
      steps: [
        {
          type: "choice",
          title: "Choose the main rule",
          text: raw`What is the main differentiation rule here?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`Product rule`,
              correct: true,
              successMessage: raw`Exactly. The function is one factor times another, so the product rule is the obvious starting point.`
            },
            {
              html: raw`Chain rule only`,
              failureMessage: raw`There is trig inside the question, but the overall structure is a product of two functions.`
            },
            {
              html: raw`Quotient rule`,
              failureMessage: raw`Not this one. Nothing is being divided.`
            },
            {
              html: raw`Implicit differentiation`,
              failureMessage: raw`No need. \(y\) is already given explicitly in terms of \(x\).`
            }
          ]
        },
        {
          type: "typed",
          title: "Differentiate before substituting",
          text: raw`What is \(\frac{dy}{dx}\) before you put \(x=0\) in?`,
          ariaLabel: "Type the derivative",
          acceptedAnswers: ["(2x+3)sin(x)+(x^2+3x+2)cos(x)"],
          samples: [{ x: 0 }, { x: 1 }, { x: 2 }],
          successMessage: raw`Correct. That is the product rule result your walkthrough works with before evaluating.`,
          targetedFeedback: [
            {
              answers: ["(2x+3)sin(x)+(x^2+3x+2)(-sin(x))"],
              message: raw`Watch the trig derivative. The derivative of \(\sin x\) is \(\cos x\), not \(-\sin x\).`
            }
          ],
          genericMessage: raw`Use \(u'v+uv'\), with \(u=x^2+3x+2\) and \(v=\sin x\).`
        },
        {
          type: "typed",
          title: "Evaluate the gradient",
          text: raw`Now evaluate at \(x=0\). What gradient do you get?`,
          ariaLabel: "Type the gradient at x equals 0",
          acceptedAnswers: ["2"],
          successMessage: raw`Yes. Since \(\sin 0=0\) and \(\cos 0=1\), the gradient comes out to \(2\).`,
          genericMessage: raw`Substitute \(x=0\) into the derivative and use the exact trig values.`
        }
      ]
    }),
    "1c": createConfig("1c", "2024 Paper — Find where the function is decreasing", {
      questionHtml: raw`
        <p class="step-text">
          For the function below, find the range of values of \(x\) for which the function is decreasing.
          \[
          y=3(2x-7)^2+60\ln x+12,\qquad x>0
          \]
        </p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Go term by term, just like the walkthrough does.`,
        raw`A function is decreasing where its derivative is negative.`,
        raw`After finding the critical values, test a value in between them if you want to copy the walkthrough style.`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate term by term:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=24x-84+\frac{60}{x}
          \]
        </div>
        <p class="step-text">Set the derivative equal to \(0\):</p>
        <div class="math-block">
          \[
          24x-84+\frac{60}{x}=0
          \]
          \[
          24x^2-84x+60=0
          \]
          \[
          2x^2-7x+5=0
          \]
          \[
          (2x-5)(x-1)=0
          \]
        </div>
        <p class="step-text">So the critical values are \(x=1\) and \(x=\frac{5}{2}\). Testing \(x=2\) gives a negative derivative, so the function is decreasing for</p>
        <div class="math-block">
          \[
          1<x<\frac{5}{2}.
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Find the derivative",
          text: raw`What is \(\frac{dy}{dx}\)?`,
          ariaLabel: "Type the derivative",
          acceptedAnswers: ["24x-84+60/x"],
          samples: [{ x: 1 }, { x: 2 }, { x: 4 }],
          successMessage: raw`Correct. That matches the term-by-term derivative in your walkthrough.`,
          targetedFeedback: [
            {
              answers: ["12(2x-7)+60/x"],
              message: raw`That is also correct. You can expand it to \(24x-84+\frac{60}{x}\) if you want the next step to look cleaner.`
            }
          ],
          genericMessage: raw`Differentiate the squared bracket with the chain rule, then add the derivative of \(60\ln x\).`
        },
        {
          type: "typed",
          title: "Find the critical values",
          text: raw`When you solve \(\frac{dy}{dx}=0\), which two \(x\)-values do you get?`,
          ariaLabel: "Type the critical values",
          mode: "list",
          options: {
            ordered: false,
            stripOuterParens: true
          },
          acceptedAnswers: ["1,5/2"],
          successMessage: raw`Yes. The derivative is zero at \(x=1\) and \(x=\frac{5}{2}\).`,
          genericMessage: raw`Clear the fraction first, then factorise the quadratic carefully.`
        },
        {
          type: "choice",
          title: "Pick the decreasing interval",
          text: raw`Using those critical values, where is the derivative negative?`,
          choices: [
            {
              html: raw`\[
                1<x<\frac{5}{2}
              \]`,
              correct: true,
              successMessage: raw`Correct. That is exactly the interval your walkthrough lands on after testing a value like \(x=2\).`
            },
            {
              html: raw`\[
                0<x<1
              \]`,
              failureMessage: raw`Try testing a value there. The derivative is not negative on that whole interval.`
            },
            {
              html: raw`\[
                x>\frac{5}{2}
              \]`,
              failureMessage: raw`For large positive \(x\), the \(24x\) term makes the derivative positive.`
            },
            {
              html: raw`\[
                x<1 \text{ or } x>\frac{5}{2}
              \]`,
              failureMessage: raw`That is the opposite sign pattern. We want where the derivative is negative, not positive.`
            }
          ]
        }
      ]
    }),
    "1d": createConfig("1d", "2024 Paper — Stationary point and its nature", {
      questionHtml: raw`
        <p class="step-text">
          Find the \(x\)-value(s) of any stationary points on the graph of the function below, and determine their nature.
          \[
          y=(2x-1)e^{-2x}
          \]
        </p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Your walkthrough uses both the first and second derivatives here.`,
        raw`Differentiate the product first, then solve \(y'=0\).`,
        raw`Once you have the stationary \(x\)-value, use the sign of \(y''\) to decide the nature.`
      ],
      answerHtml: raw`
        <p class="step-text">First derivative:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=e^{-2x}(4-4x)
          \]
        </div>
        <p class="step-text">Solve \(\frac{dy}{dx}=0\):</p>
        <div class="math-block">
          \[
          e^{-2x}(4-4x)=0
          \]
          \[
          x=1
          \]
        </div>
        <p class="step-text">Second derivative:</p>
        <div class="math-block">
          \[
          \frac{d^2y}{dx^2}=e^{-2x}(8x-12)
          \]
          \[
          \frac{d^2y}{dx^2}\bigg|_{x=1}=-4e^{-2}<0
          \]
        </div>
        <p class="step-text">So there is a stationary point at \(x=1\), and it is a maximum.</p>
      `,
      steps: [
        {
          type: "typed",
          title: "Differentiate the product",
          text: raw`What is the first derivative?`,
          ariaLabel: "Type the first derivative",
          acceptedAnswers: ["e^(-2x)(4-4x)"],
          samples: [{ x: 0 }, { x: 1 }, { x: 2 }],
          successMessage: raw`Correct. The product rule simplifies nicely to \(e^{-2x}(4-4x)\).`,
          targetedFeedback: [
            {
              answers: ["e^(-2x)(2-4x)"],
              message: raw`You are close, but the derivative of \(2x-1\) is \(2\), and the product rule gives another \(2\) coming through the simplification.`
            }
          ],
          genericMessage: raw`Use the product rule, and remember the derivative of \(e^{-2x}\) brings in a factor of \(-2\).`
        },
        {
          type: "typed",
          title: "Solve for the stationary point",
          text: raw`When you set the first derivative equal to zero, what \(x\)-value do you get?`,
          ariaLabel: "Type the stationary x value",
          acceptedAnswers: ["1"],
          successMessage: raw`Yes. The exponential factor is never zero, so the stationary point comes from \(4-4x=0\).`,
          genericMessage: raw`Focus on the bracket. \(e^{-2x}\) never equals zero.`
        },
        {
          type: "choice",
          title: "Use the second derivative test",
          text: raw`At \(x=1\), the second derivative is negative. What does that tell you?`,
          choices: [
            {
              html: raw`The stationary point is a maximum`,
              correct: true,
              successMessage: raw`Exactly. A negative second derivative means the curve is concave down there, so the stationary point is a maximum.`
            },
            {
              html: raw`The stationary point is a minimum`,
              failureMessage: raw`A minimum would need a positive second derivative, not a negative one.`
            },
            {
              html: raw`It is a point of inflection`,
              failureMessage: raw`A point of inflection would need the concavity to change, not just a negative second derivative at the point.`
            },
            {
              html: raw`There is not enough information`,
              failureMessage: raw`For this question, the second derivative sign is enough to classify the stationary point.`
            }
          ]
        }
      ]
    }),
    "1e": createConfig("1e", "2024 Paper — Tangent at the point of inflection", {
      questionHtml: raw`
        <p class="step-text">
          A curve is defined by the equation
          \[
          y=\frac{2x^2-1-2x\ln x}{x},\qquad x>0.
          \]
        </p>
        <p class="step-text">The curve has a point of inflection at the point \(P\).</p>
        <p class="step-text">Find the equation of the tangent to the curve at the point \(P\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Your walkthrough starts by finding where the second derivative is zero, because that tells us where \(P\) is.`,
        raw`It helps to simplify the function first: \(y=2x-\frac{1}{x}-2\ln x\).`,
        raw`Once you know \(P\), find the gradient there and write the tangent equation.`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite first:</p>
        <div class="math-block">
          \[
          y=2x-\frac{1}{x}-2\ln x
          \]
        </div>
        <p class="step-text">Differentiate:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=2+\frac{1}{x^2}-\frac{2}{x}
          \]
          \[
          \frac{d^2y}{dx^2}=-\frac{2}{x^3}+\frac{2}{x^2}
          \]
        </div>
        <p class="step-text">Set the second derivative equal to zero:</p>
        <div class="math-block">
          \[
          -\frac{2}{x^3}+\frac{2}{x^2}=0
          \]
          \[
          x=1
          \]
        </div>
        <p class="step-text">Then \(y(1)=1\) and \(\frac{dy}{dx}\big|_{x=1}=1\), so the tangent is</p>
        <div class="math-block">
          \[
          y-1=1(x-1)
          \]
          \[
          y=x.
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Find the first derivative",
          text: raw`After simplifying the function, what is \(\frac{dy}{dx}\)?`,
          ariaLabel: "Type the first derivative",
          acceptedAnswers: ["2+1/x^2-2/x"],
          samples: [{ x: 1 }, { x: 2 }, { x: 4 }],
          successMessage: raw`Correct. That is the first derivative your walkthrough uses before going on to the second derivative.`,
          genericMessage: raw`Differentiate \(2x\), \(-x^{-1}\), and \(-2\ln x\) carefully.`
        },
        {
          type: "typed",
          title: "Find the second derivative",
          text: raw`Now differentiate again. What is \(\frac{d^2y}{dx^2}\)?`,
          ariaLabel: "Type the second derivative",
          acceptedAnswers: ["-2/x^3+2/x^2"],
          samples: [{ x: 1 }, { x: 2 }, { x: 5 }],
          successMessage: raw`Yes. And this is the one we set equal to zero to find the inflection point.`,
          genericMessage: raw`Watch the signs here, just like the walkthrough warns. Differentiate each term one more time.`
        },
        {
          type: "typed",
          title: "Find point \(P\)",
          text: raw`Solving \(\frac{d^2y}{dx^2}=0\) gives the \(x\)-coordinate of \(P\). What is it?`,
          ariaLabel: "Type the x coordinate of P",
          acceptedAnswers: ["1"],
          successMessage: raw`Correct. Point \(P\) happens at \(x=1\).`,
          genericMessage: raw`Factor or clear the denominators so you can solve the second-derivative equation cleanly.`
        },
        {
          type: "typed",
          title: "Write the tangent equation",
          text: raw`At \(x=1\), the point is \((1,1)\) and the gradient is \(1\). What is the tangent equation?`,
          ariaLabel: "Type the tangent equation",
          mode: "equation",
          options: {
            equationLhs: "y",
            allowBareExpression: true
          },
          acceptedAnswers: ["y=x"],
          samples: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }],
          successMessage: raw`Exactly. A rare anticlimax: the tangent equation is just \(y=x\).`,
          genericMessage: raw`Use point-gradient form with point \((1,1)\) and gradient \(1\), then simplify.`
        }
      ]
    }),
    "2a": createConfig("2a", "2024 Paper — Parametric derivative", {
      questionHtml: raw`
        <p class="step-text">
          A function is defined parametrically by the pair of equations
          \[
          x=3t^2+1 \quad \text{and} \quad y=\cos t.
          \]
        </p>
        <p class="step-text">Find an expression for \(\frac{dy}{dx}\).</p>
      `,
      hints: [
        raw`Find \(\frac{dy}{dt}\) and \(\frac{dx}{dt}\) first.`,
        raw`Then divide \(\frac{dy}{dt}\) by \(\frac{dx}{dt}\).`,
        raw`That is exactly the route your walkthrough takes.`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate each parametric equation:</p>
        <div class="math-block">
          \[
          \frac{dx}{dt}=6t,\qquad \frac{dy}{dt}=-\sin t
          \]
        </div>
        <p class="step-text">So</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=\frac{dy/dt}{dx/dt}=-\frac{\sin t}{6t}.
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Differentiate \(x\) with respect to \(t\)",
          text: raw`What is \(\frac{dx}{dt}\)?`,
          ariaLabel: "Type dx by dt",
          acceptedAnswers: ["6t"],
          samples: [{ t: 1 }, { t: 2 }, { t: 3 }],
          successMessage: raw`Correct. \(3t^2+1\) differentiates to \(6t\).`,
          genericMessage: raw`Differentiate the parametric \(x\)-equation with respect to \(t\).`
        },
        {
          type: "typed",
          title: "Differentiate \(y\) with respect to \(t\)",
          text: raw`What is \(\frac{dy}{dt}\)?`,
          ariaLabel: "Type dy by dt",
          acceptedAnswers: ["-sin(t)"],
          samples: [{ t: 0.5 }, { t: 1 }, { t: 2 }],
          successMessage: raw`Yes. The derivative of \(\cos t\) is \(-\sin t\).`,
          genericMessage: raw`Differentiate the parametric \(y\)-equation with respect to \(t\).`
        },
        {
          type: "typed",
          title: "Combine them into \(\frac{dy}{dx}\)",
          text: raw`Now find \(\frac{dy}{dx}\).`,
          ariaLabel: "Type dy by dx",
          acceptedAnswers: ["-sin(t)/(6t)"],
          samples: [{ t: 0.5 }, { t: 1 }, { t: 2 }],
          successMessage: raw`Correct. That is the parametric derivative the walkthrough arrives at.`,
          genericMessage: raw`Use \(\frac{dy}{dx}=\frac{dy/dt}{dx/dt}\).`
        }
      ]
    }),
    "2b": createConfig("2b", "2024 Paper — Velocity from a logarithmic displacement", {
      questionHtml: raw`
        <p class="step-text">
          An object is travelling in a straight line. Its displacement, in metres, is given by the formula
          \[
          s(t)=\ln(3t^2+5t+2),
          \]
          where \(t>0\) and \(t\) is time, in seconds.
        </p>
        <p class="step-text">Find the velocity of this object when \(t=1\) second.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`We are given displacement, so differentiate to get velocity.`,
        raw`Because the logarithm has a quadratic inside it, this is a chain rule step.`,
        raw`Once you have \(v(t)\), substitute \(t=1\).`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate using the chain rule:</p>
        <div class="math-block">
          \[
          v(t)=\frac{ds}{dt}=\frac{6t+5}{3t^2+5t+2}
          \]
        </div>
        <p class="step-text">Now evaluate at \(t=1\):</p>
        <div class="math-block">
          \[
          v(1)=\frac{11}{10}=1.1
          \]
        </div>
        <p class="step-text">So the velocity at \(t=1\) second is \(\frac{11}{10}\text{ m s}^{-1}\).</p>
      `,
      steps: [
        {
          type: "choice",
          title: "Spot the method",
          text: raw`Why do we need the chain rule here?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`Because the logarithm has a quadratic inside it`,
              correct: true,
              successMessage: raw`Exactly. The logarithm is the outside function, and \(3t^2+5t+2\) is the inside.`
            },
            {
              html: raw`Because it is a product`,
              failureMessage: raw`Not here. The whole thing is a logarithm of one inside expression.`
            },
            {
              html: raw`Because it is a quotient`,
              failureMessage: raw`The final derivative will involve a fraction, but the original function is not a quotient-rule question.`
            },
            {
              html: raw`Because the displacement is constant`,
              failureMessage: raw`The displacement is not constant, and that is not why the chain rule appears here.`
            }
          ]
        },
        {
          type: "typed",
          title: "Find the velocity function",
          text: raw`What is \(v(t)=\frac{ds}{dt}\)?`,
          ariaLabel: "Type the velocity function",
          acceptedAnswers: ["(6t+5)/(3t^2+5t+2)"],
          samples: [{ t: 1 }, { t: 2 }, { t: 4 }],
          successMessage: raw`Correct. The derivative of \(\ln(\text{inside})\) is \(\frac{\text{inside}'}{\text{inside}}\).`,
          targetedFeedback: [
            {
              answers: ["6t+5"],
              message: raw`That is only the derivative of the inside. You still need to divide by the original inside bracket.`
            }
          ],
          genericMessage: raw`Differentiate the inside, then divide by the original inside expression.`
        },
        {
          type: "typed",
          title: "Evaluate at \(t=1\)",
          text: raw`What is the velocity when \(t=1\)?`,
          ariaLabel: "Type the velocity at t equals 1",
          acceptedAnswers: ["11/10", "1.1"],
          successMessage: raw`Yes. And that is the value the walkthrough lands on after the substitution.`,
          genericMessage: raw`Substitute \(t=1\) carefully into your velocity function and simplify.`
        }
      ]
    }),
    "2c": createConfig("2c", "2024 Paper — Show a function satisfies a differential equation", {
      questionHtml: raw`
        <p class="step-text">
          Show that
          \[
          y=\sin(x^2)-\cos x
          \]
          is a solution to the equation
          \[
          \frac{d^2y}{dx^2}+4x^2y=2\cos(x^2)+(1-4x^2)\cos x.
          \]
        </p>
      `,
      hints: [
        raw`This is not as scary as it looks. Just go step by step.`,
        raw`Find the first derivative, then the second derivative.`,
        raw`When you substitute into the left-hand side, two terms cancel out.`
      ],
      answerHtml: raw`
        <p class="step-text">First derivative:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=2x\cos(x^2)+\sin x
          \]
        </div>
        <p class="step-text">Second derivative:</p>
        <div class="math-block">
          \[
          \frac{d^2y}{dx^2}=2\cos(x^2)-4x^2\sin(x^2)+\cos x
          \]
        </div>
        <p class="step-text">Substitute into the left-hand side:</p>
        <div class="math-block">
          \[
          \frac{d^2y}{dx^2}+4x^2y
          \]
          \[
          =2\cos(x^2)-4x^2\sin(x^2)+\cos x+4x^2\big(\sin(x^2)-\cos x\big)
          \]
          \[
          =2\cos(x^2)+(1-4x^2)\cos x
          \]
        </div>
        <p class="step-text">Shown.</p>
      `,
      steps: [
        {
          type: "typed",
          title: "Differentiate once",
          text: raw`What is \(\frac{dy}{dx}\)?`,
          ariaLabel: "Type the first derivative",
          acceptedAnswers: ["2x*cos(x^2)+sin(x)"],
          samples: [{ x: 0 }, { x: 1 }, { x: 2 }],
          successMessage: raw`Correct. The first term needs the chain rule, and the second term differentiates to \(+\sin x\).`,
          genericMessage: raw`Differentiate \(\sin(x^2)\) with the chain rule, and watch the sign on \(-\cos x\).`
        },
        {
          type: "typed",
          title: "Differentiate again",
          text: raw`Now find \(\frac{d^2y}{dx^2}\).`,
          ariaLabel: "Type the second derivative",
          acceptedAnswers: ["2cos(x^2)-4x^2sin(x^2)+cos(x)"],
          samples: [{ x: 0 }, { x: 1 }, { x: 2 }],
          successMessage: raw`Yes. This is the part where the product rule and chain rule both show up together.`,
          genericMessage: raw`Go term by term, and use the product rule on \(2x\cos(x^2)\).`
        },
        {
          type: "typed",
          title: "Show the left-hand side matches",
          text: raw`After substituting \(y\) and \(y''\) into the left-hand side, what does it simplify to?`,
          ariaLabel: "Type the simplified left hand side",
          acceptedAnswers: ["2cos(x^2)+(1-4x^2)cos(x)"],
          samples: [{ x: 0 }, { x: 1 }, { x: 2 }],
          successMessage: raw`Exactly. The sine terms cancel, and you are left with the required right-hand side.`,
          genericMessage: raw`Substitute into \(\frac{d^2y}{dx^2}+4x^2y\) and simplify carefully.`
        }
      ]
    }),
    "2d": createConfig("2d", "2024 Paper — Point of inflection on \(f(x)=\frac{\ln x}{x}\)", {
      questionHtml: raw`
        <p class="step-text">
          Consider the function
          \[
          f(x)=\frac{\ln x}{x},\qquad x>0.
          \]
        </p>
        <p class="step-text">Find the coordinates of the point of inflection on the graph of the function.</p>
        <p class="step-text">You can assume that your point found is actually a point of inflection.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`At a point of inflection, the second derivative is zero.`,
        raw`Your walkthrough does this with the quotient rule twice, but the simplified derivatives are easier to work with here.`,
        raw`Once you have the \(x\)-value, substitute back into \(f(x)=\frac{\ln x}{x}\).`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate:</p>
        <div class="math-block">
          \[
          f'(x)=\frac{1-\ln x}{x^2}
          \]
          \[
          f''(x)=\frac{-3+2\ln x}{x^3}
          \]
        </div>
        <p class="step-text">For a point of inflection, set the second derivative equal to zero:</p>
        <div class="math-block">
          \[
          \frac{-3+2\ln x}{x^3}=0
          \]
          \[
          -3+2\ln x=0
          \]
          \[
          \ln x=\frac{3}{2}
          \]
          \[
          x=e^{3/2}
          \]
        </div>
        <p class="step-text">Now find the \(y\)-coordinate:</p>
        <div class="math-block">
          \[
          y=\frac{\ln(e^{3/2})}{e^{3/2}}=\frac{3}{2e^{3/2}}
          \]
        </div>
        <p class="step-text">So the point of inflection is \(\left(e^{3/2},\frac{3}{2e^{3/2}}\right)\).</p>
      `,
      steps: [
        {
          type: "typed",
          title: "Find the first derivative",
          text: raw`What is \(f'(x)\)?`,
          ariaLabel: "Type the first derivative",
          acceptedAnswers: ["(1-ln(x))/x^2"],
          samples: [{ x: 1 }, { x: 2 }, { x: 5 }],
          successMessage: raw`Correct. That is the simplified quotient-rule result.`,
          genericMessage: raw`Use the quotient rule, or rewrite as \((\ln x)x^{-1}\) and differentiate carefully.`
        },
        {
          type: "typed",
          title: "Find the second derivative",
          text: raw`What is \(f''(x)\)?`,
          ariaLabel: "Type the second derivative",
          acceptedAnswers: ["(-3+2ln(x))/x^3"],
          samples: [{ x: 1 }, { x: 2 }, { x: 5 }],
          successMessage: raw`Yes. That gives the equation we need for the inflection point.`,
          genericMessage: raw`Differentiate \(f'(x)\) once more and simplify the result over a common denominator.`
        },
        {
          type: "typed",
          title: "Solve for the \(x\)-coordinate",
          text: raw`When you set the second derivative equal to zero, what \(x\)-value do you get?`,
          ariaLabel: "Type the x coordinate of the inflection point",
          acceptedAnswers: ["e^(3/2)", "e^1.5"],
          successMessage: raw`Correct. The logarithm step gives \(x=e^{3/2}\).`,
          genericMessage: raw`Only the numerator needs to be zero, so solve \(-3+2\ln x=0\).`
        },
        {
          type: "typed",
          title: "Find the coordinates",
          text: raw`What are the coordinates of the point of inflection?`,
          ariaLabel: "Type the coordinates of the point of inflection",
          mode: "list",
          options: {
            ordered: true,
            stripOuterParens: true
          },
          previewOptions: {
            wrapWithParens: true
          },
          acceptedAnswers: ["e^(3/2),3/(2e^(3/2))"],
          successMessage: raw`Exactly. That is the exact-coordinate version of the point.`,
          targetedFeedback: [
            {
              answers: ["3/(2e^(3/2)),e^(3/2)"],
              mode: "list",
              options: {
                ordered: true,
                stripOuterParens: true
              },
              message: raw`Watch the order. The point should be written as \((x,y)\), not \((y,x)\).`
            }
          ],
          genericMessage: raw`Substitute your \(x\)-value back into \(f(x)=\frac{\ln x}{x}\) and write the point as \((x,y)\).`
        }
      ]
    }),
    "2e": createConfig("2e", "2024 Paper — A single turning point via the discriminant", {
      questionHtml: raw`
        <p class="step-text">
          The graph of the function
          \[
          y=\frac{xe^{3x}}{2x+k},
          \]
          where \(k\) is a non-zero constant, has a single turning point at \(Q\).
        </p>
        <p class="step-text">Find the \(x\)-coordinate of the point \(Q\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Yes, this one is long. Start by differentiating carefully.`,
        raw`A single turning point means the derivative equation has one repeated solution.`,
        raw`That is why the discriminant gets set to zero.`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=\frac{e^{3x}(6x^2+3kx+k)}{(2x+k)^2}
          \]
        </div>
        <p class="step-text">Turning points happen when the derivative is zero, so</p>
        <div class="math-block">
          \[
          6x^2+3kx+k=0
          \]
        </div>
        <p class="step-text">For a single turning point, this quadratic must have one repeated root, so</p>
        <div class="math-block">
          \[
          (3k)^2-4(6)(k)=0
          \]
          \[
          9k^2-24k=0
          \]
          \[
          k=\frac{8}{3}
          \]
        </div>
        <p class="step-text">Substitute back into the quadratic:</p>
        <div class="math-block">
          \[
          6x^2+8x+\frac{8}{3}=0
          \]
          \[
          (3x+2)^2=0
          \]
          \[
          x=-\frac{2}{3}
          \]
        </div>
        <p class="step-text">So the \(x\)-coordinate of \(Q\) is \(-\frac{2}{3}\).</p>
      `,
      steps: [
        {
          type: "typed",
          title: "Differentiate the function",
          text: raw`What is \(\frac{dy}{dx}\)?`,
          ariaLabel: "Type the derivative",
          acceptedAnswers: ["e^(3x)(6x^2+3kx+k)/(2x+k)^2"],
          samples: [{ x: 0, k: 1 }, { x: 1, k: 2 }, { x: -0.5, k: 3 }],
          successMessage: raw`Correct. The derivative tidies up to a nice quadratic factor on top.`,
          genericMessage: raw`Use the quotient rule carefully, and do not forget the chain rule from \(e^{3x}\).`
        },
        {
          type: "choice",
          title: "Use the single-turning-point idea",
          text: raw`Why do we set the discriminant equal to zero?`,
          choices: [
            {
              html: raw`Because the quadratic for the turning points must have one repeated root`,
              correct: true,
              successMessage: raw`Exactly. One turning point means one repeated solution when you solve the derivative equation.`
            },
            {
              html: raw`Because the derivative must be positive`,
              failureMessage: raw`The sign of the derivative is not the key idea here. We need one solution, not necessarily a positive one.`
            },
            {
              html: raw`Because the denominator must be zero`,
              failureMessage: raw`Turning points come from the derivative being zero, and here that comes from the numerator.`
            },
            {
              html: raw`Because \(e^{3x}=0\)`,
              failureMessage: raw`The exponential factor never equals zero.`
            }
          ]
        },
        {
          type: "typed",
          title: "Find \(k\)",
          text: raw`What value of \(k\) makes the discriminant zero?`,
          ariaLabel: "Type the value of k",
          acceptedAnswers: ["8/3"],
          successMessage: raw`Correct. The valid non-zero constant is \(k=\frac{8}{3}\).`,
          targetedFeedback: [
            {
              answers: ["0"],
              message: raw`\(k=0\) comes out of the factorisation too, but the question says \(k\) is non-zero, so we ignore it.`
            }
          ],
          genericMessage: raw`Solve \(9k^2-24k=0\), then remember the question says \(k\neq 0\).`
        },
        {
          type: "typed",
          title: "Find the turning-point \(x\)-coordinate",
          text: raw`Now substitute your \(k\)-value back into the derivative equation. What is the \(x\)-coordinate of \(Q\)?`,
          ariaLabel: "Type the x coordinate of Q",
          acceptedAnswers: ["-2/3"],
          successMessage: raw`Yes. That repeated root gives the single turning point at \(x=-\frac{2}{3}\).`,
          genericMessage: raw`Put \(k=\frac{8}{3}\) back into the quadratic and solve the repeated-root equation.`
        }
      ]
    }),
    "3a": createConfig("3a", "2024 Paper — Differentiate \(\sqrt{x}\sec(6x)\)", {
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Differentiate } y=\sqrt{x}\,\sec(6x).
          \]
        </div>
        <p class="step-text question-note">You do not need to simplify your answer.</p>
      `,
      hints: [
        raw`As before with the square root, rewrite it as a power of one half.`,
        raw`The whole expression is a product, so the product rule is the main structure.`,
        raw`The derivative of \(\sec(6x)\) needs the chain rule as well.`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite and differentiate:</p>
        <div class="math-block">
          \[
          y=x^{1/2}\sec(6x)
          \]
          \[
          \frac{dy}{dx}=\frac{1}{2}x^{-1/2}\sec(6x)+x^{1/2}\big(6\sec(6x)\tan(6x)\big)
          \]
        </div>
        <p class="step-text">You do not need to simplify any further.</p>
      `,
      steps: [
        {
          type: "choice",
          title: "Choose the overall rule",
          text: raw`What is the main rule holding this derivative together?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`Product rule`,
              correct: true,
              successMessage: raw`Correct. There is a square-root factor multiplied by a secant factor.`
            },
            {
              html: raw`Quotient rule`,
              failureMessage: raw`Not this time. Nothing is written as a fraction.`
            },
            {
              html: raw`Chain rule only`,
              failureMessage: raw`The chain rule does appear inside \(\sec(6x)\), but the overall structure is still a product.`
            },
            {
              html: raw`Implicit differentiation`,
              failureMessage: raw`No need. The function is already given explicitly.`
            }
          ]
        },
        {
          type: "typed",
          title: "Differentiate the \(\sqrt{x}\) factor",
          text: raw`After rewriting \(\sqrt{x}\) as \(x^{1/2}\), what is its derivative?`,
          ariaLabel: "Type the derivative of square root x",
          acceptedAnswers: ["1/(2sqrt(x))", "(1/2)x^(-1/2)"],
          samples: [{ x: 1 }, { x: 4 }, { x: 9 }],
          successMessage: raw`Yes. That is the outside factor's derivative in the product rule.`,
          genericMessage: raw`Use the power rule on \(x^{1/2}\).`
        },
        {
          type: "typed",
          title: "Build the full derivative",
          text: raw`Now write the derivative of the whole product.`,
          ariaLabel: "Type the derivative of y",
          acceptedAnswers: [
            "(1/(2sqrt(x)))*sec(6x)+6sqrt(x)sec(6x)tan(6x)",
            "(1/2)x^(-1/2)sec(6x)+6x^(1/2)sec(6x)tan(6x)"
          ],
          samples: [{ x: 0.2 }, { x: 0.35 }, { x: 0.6 }],
          successMessage: raw`Great. Product rule on the outside, chain rule inside the secant, and no extra simplification needed.`,
          targetedFeedback: [
            {
              answers: ["(1/(2sqrt(x)))*sec(6x)+sqrt(x)sec(6x)tan(6x)"],
              message: raw`Close, but the derivative of \(\sec(6x)\) needs the chain-rule factor of \(6\).`
            }
          ],
          genericMessage: raw`Use \(u'v+uv'\), and remember \( \frac{d}{dx}[\sec(6x)]=6\sec(6x)\tan(6x)\).`
        }
      ]
    }),
    "3b": createConfig("3b", "2024 Paper — Read continuity, differentiability, and a limit from a graph", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(y=f(x)\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3b-2024" class="graph-svg" viewBox="0 0 560 360" aria-label="Graph of a piecewise function with open and closed points"></svg>
        </div>
        <p class="step-text">(i) Find the value(s) of \(x\) where \(f(x)\) is continuous but not differentiable.</p>
        <p class="step-text">(ii) Find the value(s) of \(x\) where \(f'(x)=0\).</p>
        <p class="step-text">(iii) Find \(\lim\limits_{x\to -1}f(x)\), or state clearly if it does not exist.</p>
      `,
      hints: [
        raw`Continuous but not differentiable usually means a corner or cusp, not a jump.`,
        raw`A derivative of zero means the graph is horizontal, either at a turning point or along a flat section.`,
        raw`For the limit at \(x=-1\), look at what both sides of the graph are approaching.`
      ],
      answerHtml: raw`
        <p class="step-text">Reading from the graph:</p>
        <div class="math-block">
          \[
          \text{(i) } x=5
          \]
          \[
          \text{(ii) } x=1 \text{ and } 3<x<5
          \]
          \[
          \text{(iii) } \lim_{x\to -1}f(x)=1
          \]
        </div>
        <p class="step-text">At \(x=5\), the graph is still joined up, but the gradient changes abruptly, so it is continuous but not differentiable there.</p>
      `,
      afterRender: draw3bGraph,
      steps: [
        {
          type: "choice",
          title: "Find where the graph is joined but has a sharp change",
          text: raw`Where is \(f(x)\) continuous but not differentiable?`,
          choices: [
            {
              html: raw`\[
                x=5
              \]`,
              correct: true,
              successMessage: raw`Correct. The graph is connected at \(x=5\), but the gradient changes suddenly there.`
            },
            {
              html: raw`\[
                x=-1
              \]`,
              failureMessage: raw`At \(x=-1\), the graph has a hole, so it is not continuous there.`
            },
            {
              html: raw`\[
                x=3
              \]`,
              failureMessage: raw`At \(x=3\), the graph jumps, so it is not continuous there either.`
            },
            {
              html: raw`\[
                x=0
              \]`,
              failureMessage: raw`The graph is not even defined there, so this is not the continuous-but-not-differentiable point.`
            }
          ]
        },
        {
          type: "choice",
          title: "Find where the graph is horizontal",
          text: raw`Which answer matches all the \(x\)-values where \(f'(x)=0\)?`,
          choices: [
            {
              html: raw`\[
                x=1 \text{ and } 3<x<5
              \]`,
              correct: true,
              successMessage: raw`Yes. There is a turning point at \(x=1\), and the graph is flat all the way across the horizontal segment for \(3<x<5\).`
            },
            {
              html: raw`\[
                x=1,3,5
              \]`,
              failureMessage: raw`At \(x=3\) and \(x=5\), the derivative does not exist because of the discontinuity and corner.`
            },
            {
              html: raw`\[
                3<x\le 5
              \]`,
              failureMessage: raw`You have missed the stationary turning point at \(x=1\), and the derivative does not exist right at \(x=5\).`
            },
            {
              html: raw`\[
                x=1 \text{ only}
              \]`,
              failureMessage: raw`Do not forget the flat horizontal section. Every point there has gradient \(0\).`
            }
          ]
        },
        {
          type: "typed",
          title: "Read the limit",
          text: raw`What is \(\lim\limits_{x\to -1}f(x)\)?`,
          ariaLabel: "Type the limit value",
          acceptedAnswers: ["1"],
          successMessage: raw`Correct. Both sides of the graph are heading towards the open point at \((-1,1)\), so the limit is \(1\).`,
          genericMessage: raw`Look at the \(y\)-value both sides are approaching as \(x\) gets close to \(-1\).`
        }
      ]
    }),
    "3c": createConfig("3c", "2024 Paper — Stationary points of a quotient", {
      questionHtml: raw`
        <p class="step-text">
          Find the \(x\)-value(s) of any stationary point(s) on the graph of the function
          \[
          f(x)=\frac{x^2-5x+4}{x^2+5x+4}.
          \]
        </p>
        <p class="step-text">You do not need to determine the nature of any stationary point(s) found.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Use the quotient rule here.`,
        raw`Your walkthrough expands the numerator after differentiating, which is a good move.`,
        raw`A stationary point happens when the derivative is zero.`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate with the quotient rule:</p>
        <div class="math-block">
          \[
          f'(x)=\frac{10x^2-40}{(x^2+5x+4)^2}
          \]
        </div>
        <p class="step-text">For stationary points, set the derivative equal to zero:</p>
        <div class="math-block">
          \[
          10x^2-40=0
          \]
          \[
          x^2=4
          \]
          \[
          x=\pm 2
          \]
        </div>
        <p class="step-text">So the stationary points are at \(x=-2\) and \(x=2\).</p>
      `,
      steps: [
        {
          type: "typed",
          title: "Differentiate the quotient",
          text: raw`What is \(f'(x)\)?`,
          ariaLabel: "Type the derivative",
          acceptedAnswers: ["(10x^2-40)/(x^2+5x+4)^2", "10(x^2-4)/(x^2+5x+4)^2"],
          samples: [{ x: -2 }, { x: 0 }, { x: 2 }],
          successMessage: raw`Correct. After the quotient rule, the numerator simplifies a lot more nicely than it first looks.`,
          genericMessage: raw`Use the quotient rule carefully, then expand and simplify the top.`
        },
        {
          type: "typed",
          title: "Solve for the stationary \(x\)-values",
          text: raw`What \(x\)-values make the derivative zero?`,
          ariaLabel: "Type the stationary x values",
          mode: "list",
          options: {
            ordered: false,
            stripOuterParens: true
          },
          acceptedAnswers: ["-2,2"],
          successMessage: raw`Yes. Those are the two stationary \(x\)-values.`,
          genericMessage: raw`Set the numerator equal to zero. The denominator does not give stationary points here.`
        }
      ]
    }),
    "3d": createConfig("3d", "2024 Paper — Related rates with a conical pile of flour", {
      questionHtml: raw`
        <p class="step-text">Jamie is doing some baking and pouring the flour to form a conical pile.</p>
        <p class="step-text">The height of the pile is always the same as the diameter of the base of the cone.</p>
        <p class="step-text">If the flour is being added at a constant rate of \(3\text{ cm}^3\) per second, at what rate is the height increasing when the pile is \(4\) cm in height?</p>
        <p class="step-text">Note that the volume of a cone is \(V=\frac{1}{3}\pi r^2h\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`The height equals the diameter, so start by linking \(r\) and \(h\).`,
        raw`Substitute that relation into the cone-volume formula so everything is in terms of \(h\).`,
        raw`Then differentiate and use \(\frac{dV}{dt}=3\).`
      ],
      answerHtml: raw`
        <p class="step-text">Because the height equals the diameter,</p>
        <div class="math-block">
          \[
          r=\frac{h}{2}
          \]
        </div>
        <p class="step-text">Substitute into the volume formula:</p>
        <div class="math-block">
          \[
          V=\frac{1}{3}\pi\left(\frac{h}{2}\right)^2 h=\frac{\pi h^3}{12}
          \]
        </div>
        <p class="step-text">Differentiate with respect to \(h\):</p>
        <div class="math-block">
          \[
          \frac{dV}{dh}=\frac{\pi h^2}{4}
          \]
        </div>
        <p class="step-text">Now use related rates:</p>
        <div class="math-block">
          \[
          \frac{dh}{dt}=\frac{dh}{dV}\cdot\frac{dV}{dt}
          \]
          \[
          \frac{dh}{dt}=\frac{4}{\pi h^2}\cdot 3
          \]
        </div>
        <p class="step-text">At \(h=4\):</p>
        <div class="math-block">
          \[
          \frac{dh}{dt}=\frac{12}{16\pi}=\frac{3}{4\pi}\text{ cm s}^{-1}
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Relate the radius and the height",
          text: raw`If the height equals the diameter, what is \(r\) in terms of \(h\)?`,
          ariaLabel: "Type r in terms of h",
          acceptedAnswers: ["h/2"],
          samples: [{ h: 2 }, { h: 4 }, { h: 6 }],
          successMessage: raw`Correct. That substitution is the key step that makes the related-rates algebra manageable.`,
          genericMessage: raw`The radius is half the diameter.`
        },
        {
          type: "typed",
          title: "Write the volume in terms of \(h\)",
          text: raw`After substituting for \(r\), what is \(V\) in terms of \(h\)?`,
          ariaLabel: "Type V in terms of h",
          acceptedAnswers: ["pi*h^3/12"],
          samples: [{ h: 2 }, { h: 4 }, { h: 6 }],
          successMessage: raw`Yes. That is the simplified volume expression your walkthrough differentiates next.`,
          genericMessage: raw`Substitute \(r=\frac{h}{2}\) into \(V=\frac{1}{3}\pi r^2h\) and simplify.`
        },
        {
          type: "typed",
          title: "Differentiate with respect to \(h\)",
          text: raw`What is \(\frac{dV}{dh}\)?`,
          ariaLabel: "Type dV by dh",
          acceptedAnswers: ["pi*h^2/4"],
          samples: [{ h: 2 }, { h: 4 }, { h: 6 }],
          successMessage: raw`Correct. Now we can turn that into \(\frac{dh}{dt}\).`,
          genericMessage: raw`Differentiate \(\frac{\pi h^3}{12}\) with respect to \(h\).`
        },
        {
          type: "typed",
          title: "Find the rate when \(h=4\)",
          text: raw`What is \(\frac{dh}{dt}\) when the pile is \(4\) cm high?`,
          ariaLabel: "Type dh by dt when h equals 4",
          acceptedAnswers: ["3/(4pi)", "0.2387324146"],
          successMessage: raw`Exactly. The height is increasing at \(\frac{3}{4\pi}\text{ cm s}^{-1}\) when \(h=4\).`,
          genericMessage: raw`Use \(\frac{dV}{dt}=3\) together with your \(\frac{dV}{dh}\), then substitute \(h=4\).`
        }
      ]
    }),
    "3e": createConfig("3e", "2024 Paper — Maximise the area of triangle \(OPQ\)", {
      questionHtml: raw`
        <p class="step-text">
          The diagram below shows part of the graph of the function
          \[
          f(x)=e^{-x^2},\qquad x\ge 0.
          \]
        </p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3e-2024" class="graph-svg" viewBox="0 0 520 320" aria-label="Graph of y equals e to the power negative x squared with a triangle OPQ"></svg>
        </div>
        <p class="step-text">The point \(P\) lies on the curve and the point \(Q\) lies on the \(x\)-axis so that \(OP=PQ\), where \(O\) is the origin.</p>
        <p class="step-text">Prove that the largest possible area of the triangle \(OPQ\) is \(\frac{1}{\sqrt{2e}}\).</p>
        <p class="step-text">You do not need to show that the area you have found is a maximum.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Notice the triangle is isosceles because \(OP=PQ\). That means \(P\) sits above the midpoint of the base.`,
        raw`If \(P=(x,e^{-x^2})\), then the whole base is \(2x\), so the area simplifies nicely.`,
        raw`Once you have the area function, just differentiate and solve \(A'(x)=0\).`
      ],
      answerHtml: raw`
        <p class="step-text">Let \(P=(x,e^{-x^2})\). Because \(OP=PQ\), point \(P\) is above the midpoint of the base, so \(OQ=2x\).</p>
        <p class="step-text">That makes the area</p>
        <div class="math-block">
          \[
          A=\frac{1}{2}(2x)\left(e^{-x^2}\right)=xe^{-x^2}
          \]
        </div>
        <p class="step-text">Differentiate:</p>
        <div class="math-block">
          \[
          \frac{dA}{dx}=e^{-x^2}(1-2x^2)
          \]
        </div>
        <p class="step-text">Set the derivative equal to zero:</p>
        <div class="math-block">
          \[
          e^{-x^2}(1-2x^2)=0
          \]
          \[
          1-2x^2=0
          \]
          \[
          x=\frac{1}{\sqrt{2}}
          \]
        </div>
        <p class="step-text">Now substitute back into the area function:</p>
        <div class="math-block">
          \[
          A=\frac{1}{\sqrt{2}}e^{-1/2}=\frac{1}{\sqrt{2e}}
          \]
        </div>
        <p class="step-text">And that is the required largest possible area. We do not even have to prove it is a maximum.</p>
      `,
      afterRender: draw3eGraph,
      steps: [
        {
          type: "typed",
          title: "Write the area function",
          text: raw`If \(P=(x,e^{-x^2})\), what is the area \(A(x)\) of triangle \(OPQ\)?`,
          ariaLabel: "Type the area function",
          acceptedAnswers: ["x*e^(-x^2)"],
          samples: [{ x: 0.3 }, { x: 0.7 }, { x: 1.1 }],
          successMessage: raw`Correct. The symmetry means the base is \(2x\), so the half-base-times-height calculation collapses to \(xe^{-x^2}\).`,
          genericMessage: raw`Use area \(=\frac{1}{2}\times\text{base}\times\text{height}\), with base \(2x\) and height \(e^{-x^2}\).`
        },
        {
          type: "typed",
          title: "Differentiate the area",
          text: raw`What is \(A'(x)\)?`,
          ariaLabel: "Type the derivative of the area function",
          acceptedAnswers: ["e^(-x^2)(1-2x^2)"],
          samples: [{ x: 0.3 }, { x: 0.7 }, { x: 1.1 }],
          successMessage: raw`Yes. Product rule and chain rule together give that derivative.`,
          genericMessage: raw`Differentiate \(xe^{-x^2}\) with the product rule, then factor out the common exponential.`
        },
        {
          type: "typed",
          title: "Find the positive critical value",
          text: raw`Solve \(A'(x)=0\). Since \(x\ge 0\), which value of \(x\) do we keep?`,
          ariaLabel: "Type the positive x value",
          acceptedAnswers: ["1/sqrt(2)"],
          successMessage: raw`Correct. The negative root is ignored because the question says \(x\ge 0\).`,
          genericMessage: raw`The exponential factor is never zero, so solve \(1-2x^2=0\) and keep the valid root.`
        },
        {
          type: "typed",
          title: "State the largest area",
          text: raw`What is the largest possible area of triangle \(OPQ\)?`,
          ariaLabel: "Type the largest possible area",
          acceptedAnswers: ["1/sqrt(2e)", "(1/sqrt(2))*e^(-1/2)"],
          successMessage: raw`Exactly. That is the value the question asks you to prove.`,
          genericMessage: raw`Substitute \(x=\frac{1}{\sqrt{2}}\) back into \(A(x)=xe^{-x^2}\) and simplify.`
        }
      ]
    })
  };
}());
