(function () {
  const raw = String.raw;
  const paperHref = "level-3-differentiation-2025.html";
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

  function guidedStep(title, workingHtml, extra) {
    return Object.assign({
      title: title,
      workingHtml: workingHtml
    }, extra || {});
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
    const height = 300;
    const padding = 32;
    const scale = createScale(width, height, padding, -1.8, 1.45, -2.2, 12.8);
    const curvePath = functionPath(function (x) {
      return x * x + Math.exp(2 * x);
    }, -1.55, 1.22, 0.02, scale);
    const slope = 2 + 2 * Math.exp(2);
    const x0 = 1;
    const y0 = 1 + Math.exp(2);
    const tangentPath = functionPath(function (x) {
      return slope * (x - x0) + y0;
    }, 0.36, 1.24, 0.02, scale);

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -1.8, 0, 1.45, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -2.2, 0, 12.8, "graph-axis")}
      <path class="question-curve" d="${curvePath}"></path>
      <path class="question-normal" d="${tangentPath}"></path>
      ${circleMarkup(scale, x0, y0, 4.5, "question-dot")}
      ${circleMarkup(scale, 0.5, 0, 4.5, "question-dot")}
      ${textMarkup(scale, 1.08, 9.35, "tangent", "graph-label", ' stroke="#ffffff" stroke-opacity="0.96" stroke-width="5" stroke-linejoin="round" paint-order="stroke"')}
      ${textMarkup(scale, -0.72, 5.05, "y = x² + e²ˣ", "graph-equation-label", ' text-anchor="middle" stroke="#ffffff" stroke-opacity="0.96" stroke-width="6" stroke-linejoin="round" paint-order="stroke"')}
      ${textMarkup(scale, 0.56, 0.72, "P", "graph-label", ' stroke="#ffffff" stroke-opacity="0.96" stroke-width="4" stroke-linejoin="round" paint-order="stroke"')}
      ${textMarkup(scale, 1.06, 7.92, "T", "graph-label", ' stroke="#ffffff" stroke-opacity="0.96" stroke-width="4" stroke-linejoin="round" paint-order="stroke"')}
      ${textMarkup(scale, 1.38, -0.15, "x", "question-axis-label")}
      ${textMarkup(scale, -0.08, 12.35, "y", "question-axis-label")}
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
      <defs>
        <clipPath id="diff-2025-2c-plot-clip" clipPathUnits="userSpaceOnUse">
          <rect x="${padding}" y="${padding}" width="${width - padding * 2}" height="${height - padding * 2}"></rect>
        </clipPath>
      </defs>
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${gridLines.join("")}
      ${lineMarkup(scale, -10, 0, 10, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -40, 0, 10, "graph-axis")}
      ${lineMarkup(scale, -4, -40, -4, 10, "graph-normal", ' stroke-dasharray="6 6"')}
      <g clip-path="url(#diff-2025-2c-plot-clip)">
        <path class="question-curve" d="${leftCurve}"></path>
        <path class="question-curve" d="${rightCurve}"></path>
        <path class="graph-normal" d="${tangentOne}" stroke-dasharray="8 6"></path>
        <path class="graph-normal" d="${tangentTwo}" stroke-dasharray="8 6"></path>
      </g>
      ${circleMarkup(scale, -6, -18, 4, "question-dot")}
      ${circleMarkup(scale, -2, 2, 4, "question-dot")}
      ${textMarkup(scale, -9.7, -33.5, "y = f(x)", "graph-equation-label")}
      ${textMarkup(scale, 3.2, 1.4, "y = f(x)", "graph-equation-label")}
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
        "graph-equation-label",
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
      tips: [
        raw`Treat the bracket \(5x^3-2x+1\) as one inside function before you start differentiating.`,
        raw`A power outside a bracket usually points to the chain rule.`
      ],
      guidedSteps: [
        guidedStep("Recognise a composite function", raw`
          <p class="step-text">The expression has the form \(f(x)=\bigl(u(x)\bigr)^5\), where</p>
          <div class="math-block">
            \[
            u(x)=5x^3-2x+1.
            \]
          </div>
          <p class="step-text">That means this is a chain rule question: differentiate the outside power, then multiply by the derivative of the inside.</p>
        `, {
          previewHtml: raw`Treat the whole bracket as one inside function.`
        }),
        guidedStep("Differentiate the outer power", raw`
          <p class="step-text">If the outside function is \(u^5\), its derivative is \(5u^4\).</p>
          <div class="math-block">
            \[
            \frac{d}{dx}\left((u)^5\right)=5u^4\cdot \frac{du}{dx}
            \]
          </div>
          <p class="step-text">So before we deal with the inside derivative, the outside part becomes</p>
          <div class="math-block">
            \[
            5(5x^3-2x+1)^4.
            \]
          </div>
        `, {
          previewHtml: raw`Differentiate \(u^5\) as \(5u^4\).`
        }),
        guidedStep("Differentiate the inner cubic", raw`
          <p class="step-text">Now differentiate \(5x^3-2x+1\) term by term.</p>
          <div class="math-block">
            \[
            \frac{d}{dx}(5x^3-2x+1)=15x^2-2.
            \]
          </div>
          <p class="step-text">The constant differentiates to \(0\), so the inner derivative is \(15x^2-2\).</p>
        `, {
          previewHtml: raw`Work through the bracket term by term.`
        }),
        guidedStep("Apply the chain rule", raw`
          <p class="step-text">Multiply the outer derivative by the derivative of the inside.</p>
          <div class="math-block">
            \[
            f'(x)=5(5x^3-2x+1)^4(15x^2-2)
            \]
          </div>
          <p class="step-text">That is already a correct final answer, so you do not need to simplify it further.</p>
        `, {
          previewHtml: raw`Combine the two derivatives to finish.`
        })
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
      guidedSteps: [
        {
          title: raw`Rewrite in power form`,
          previewHtml: raw`\(\frac{1}{\sqrt{t}}=t^{-1/2}\) and \(\sqrt{t}=t^{1/2}\).`,
          workingHtml: raw`<p class="step-text">\(\frac{1}{\sqrt{t}}=t^{-1/2}\) and \(\sqrt{t}=t^{1/2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                60t^{-1/2}+5t^{1/2}+15
              \]
</div>`
        },
        {
          title: raw`Differentiate carefully`,
          previewHtml: raw`The two variable terms differentiate to \(-30t^{-3/2}\) and \(\frac{5}{2}t^{-1/2}\).`,
          workingHtml: raw`<p class="step-text">The two variable terms differentiate to \(-30t^{-3/2}\) and \(\frac{5}{2}t^{-1/2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  -30 t^{\left(\frac{-3}{2}\right)} + \left(\frac{5}{2}\right) t^{\left(\frac{-1}{2}\right)}
  \]
</div>
</div>`
        },
        {
          title: raw`Evaluate at \(t=4\)`,
          previewHtml: raw`The oven temperature is changing at \(-\frac{5}{2}^\circ\text{C}\) per minute after \(4\) minutes.`,
          workingHtml: raw`<p class="step-text">The oven temperature is changing at \(-\frac{5}{2}^\circ\text{C}\) per minute after \(4\) minutes.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                -\frac{5}{2}
              \]
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Identify the rule`,
          previewHtml: raw`The function is a product of \(\sin^3x\) and \(\cos x\).`,
          workingHtml: raw`<p class="step-text">The function is a product of \(\sin^3x\) and \(\cos x\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Product rule
</div>`
        },
        {
          title: raw`Find the tangent gradient`,
          previewHtml: raw`The tangent gradient at \(x=\frac{\pi}{4}\) is \(\frac{1}{2}\).`,
          workingHtml: raw`<p class="step-text">The tangent gradient at \(x=\frac{\pi}{4}\) is \(\frac{1}{2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{1}{2}
              \]
</div>`
        },
        {
          title: raw`Convert to the normal gradient`,
          previewHtml: raw`The negative reciprocal of \(\frac{1}{2}\) is \(-2\).`,
          workingHtml: raw`<p class="step-text">The negative reciprocal of \(\frac{1}{2}\) is \(-2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                -2
              \]
</div>

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
      `
        }
      ]
    }),
    "1d": createConfig("1d", "2025 Paper — Tangent line x-intercept", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(f(x)=x^2+e^{2x}\) and the tangent to the curve when \(x=1\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-1d" class="graph-svg" viewBox="0 0 420 300" aria-label="Graph of y equals x squared plus e to the power 2x with a tangent at x equals 1" role="img"></svg>
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
      guidedSteps: [
        {
          title: raw`Find the point of tangency`,
          previewHtml: raw`Substituting \(x=1\) gives \(1^2+e^2=1+e^2\).`,
          workingHtml: raw`<p class="step-text">Substituting \(x=1\) gives \(1^2+e^2=1+e^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                1+e^2
              \]
</div>`
        },
        {
          title: raw`Find the gradient`,
          previewHtml: raw`Since \(f'(x)=2x+2e^{2x}\), we get \(f'(1)=2+2e^2\).`,
          workingHtml: raw`<p class="step-text">Since \(f'(x)=2x+2e^{2x}\), we get \(f'(1)=2+2e^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  2 + 2 e^{2}
  \]
</div>
</div>`
        },
        {
          title: raw`Find the x-intercept`,
          previewHtml: raw`The tangent crosses the \(x\)-axis at \(x=\frac{1}{2}\), so \(P=\left(\frac{1}{2},0\right)\).`,
          workingHtml: raw`<p class="step-text">The tangent crosses the \(x\)-axis at \(x=\frac{1}{2}\), so \(P=\left(\frac{1}{2},0\right)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{1}{2}
              \]
</div>

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
      `
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
        raw`You do need the second derivative here: solve \(\frac{d^2y}{dx^2}=0\), then compare those values with the stationary values.`
      ],
      answerHtml: raw`
        <p class="step-text">First find the gradient:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=\frac{6t^2}{6t+6}=\frac{t^2}{t+1}
          \]
        </div>
        <p class="step-text">Stationary points satisfy \(\frac{dy}{dx}=0\), so \(t=0\).</p>
        <p class="step-text">Now find the second derivative:</p>
        <div class="math-block">
          \[
          \frac{d}{dt}\left(\frac{dy}{dx}\right)=\frac{d}{dt}\left(\frac{t^2}{t+1}\right)=\frac{2t(t+1)-t^2}{(t+1)^2}=\frac{t(t+2)}{(t+1)^2}
          \]
          \[
          \frac{d^2y}{dx^2}=\frac{\frac{d}{dt}\left(\frac{dy}{dx}\right)}{\frac{dx}{dt}}=\frac{t(t+2)}{(t+1)^2(6t+6)}=\frac{t(t+2)}{6(t+1)^3}
          \]
        </div>
        <p class="step-text">For a point of inflection, set the second derivative equal to zero:</p>
        <div class="math-block">
          \[
          \frac{t(t+2)}{6(t+1)^3}=0
          \]
          \[
          t=0 \text{ or } t=-2
          \]
        </div>
        <p class="step-text">The only value that is both stationary and an inflection candidate is \(t=0\).</p>
        <p class="step-text">At \(t=0\):</p>
        <div class="math-block">
          \[
          x=1,\qquad y=0
          \]
        </div>
        <p class="step-text">This gives the stationary point of inflection \((1,0)\).</p>
      `,
      guidedSteps: [
        guidedStep("Find the first derivative", raw`
          <p class="step-text">For parametric equations, differentiate both \(x\) and \(y\) with respect to \(t\), then divide.</p>
          <div class="math-block">
            \[
            \frac{dx}{dt}=6t+6,\qquad \frac{dy}{dt}=6t^2
            \]
            \[
            \frac{dy}{dx}=\frac{dy/dt}{dx/dt}=\frac{6t^2}{6t+6}=\frac{t^2}{t+1}
            \]
          </div>
        `, {
          previewHtml: raw`Start with \(\frac{dy}{dx}=\frac{dy/dt}{dx/dt}\).`
        }),
        guidedStep(raw`Find the stationary value of \(t\)`, raw`
          <p class="step-text">A stationary point occurs when \(\frac{dy}{dx}=0\).</p>
          <div class="math-block">
            \[
            \frac{t^2}{t+1}=0
            \]
          </div>
          <p class="step-text">A fraction is zero when its numerator is zero, provided the denominator is not zero.</p>
          <div class="math-block">
            \[
            t^2=0
            \]
            \[
            t=0
            \]
          </div>
        `, {
          previewHtml: raw`Set the first derivative equal to zero.`
        }),
        guidedStep("Set up the second derivative", raw`
          <p class="step-text">For a parametric curve, differentiate \(\frac{dy}{dx}\) with respect to \(t\), then divide by \(\frac{dx}{dt}\).</p>
          <div class="math-block">
            \[
            \frac{d}{dt}\left(\frac{dy}{dx}\right)=\frac{d}{dt}\left(\frac{t^2}{t+1}\right)
            =\frac{2t(t+1)-t^2}{(t+1)^2}
            =\frac{t(t+2)}{(t+1)^2}
            \]
            \[
            \frac{d^2y}{dx^2}
            =\frac{\frac{d}{dt}\left(\frac{dy}{dx}\right)}{\frac{dx}{dt}}
            =\frac{t(t+2)}{(t+1)^2(6t+6)}
            =\frac{t(t+2)}{6(t+1)^3}
            \]
          </div>
        `, {
          previewHtml: raw`Now form \(\frac{d^2y}{dx^2}\) for the parametric curve.`
        }),
        guidedStep("Find the inflection candidates", raw`
          <p class="step-text">For a point of inflection, set the second derivative equal to zero.</p>
          <p class="step-text">The question says you may assume any values found this way are genuine points of inflection, so we only need to solve the equation.</p>
          <div class="math-block">
            \[
            \frac{t(t+2)}{6(t+1)^3}=0
            \]
            \[
            t(t+2)=0
            \]
            \[
            t=0 \text{ or } t=-2
            \]
          </div>
        `, {
          previewHtml: raw`Set the second derivative equal to zero as well.`
        }),
        guidedStep("Compare the two conditions", raw`
          <p class="step-text">We now compare the two conditions.</p>
          <div class="math-block">
            \[
            \text{Stationary: } t=0
            \]
            \[
            \text{Inflection candidates: } t=0,\,-2
            \]
          </div>
          <p class="step-text">The only value that satisfies both conditions is \(t=0\).</p>
        `, {
          previewHtml: raw`Match the stationary value with the inflection candidate values.`
        }),
        guidedStep("Convert back to coordinates", raw`
          <p class="step-text">Substitute \(t=0\) into the parametric equations.</p>
          <div class="math-block">
            \[
            x=3(0)^2+6(0)+1=1
            \]
            \[
            y=2(0)^3=0
            \]
          </div>
          <p class="step-text">So the stationary point of inflection is</p>
          <div class="math-block">
            \[
            (1,0)
            \]
          </div>
        `, {
          previewHtml: raw`Use the shared value of \(t\) to find the coordinates.`
        })
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
      guidedSteps: [
        {
          title: raw`Rewrite the reciprocal term`,
          previewHtml: raw`Writing the reciprocal as a negative power makes it easy to differentiate.`,
          workingHtml: raw`<p class="step-text">Writing the reciprocal as a negative power makes it easy to differentiate.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                7x^{-1}
              \]
</div>`
        },
        {
          title: raw`Differentiate the function`,
          previewHtml: raw`The reciprocal term uses the power rule, and the logarithm term uses the chain rule.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \frac{d}{dx}\left(\frac{7}{x}\right)=-\frac{7}{x^2}
              \]
              \[
              \frac{d}{dx}\left[\ln(3x^3-2x^2+5)\right]=\frac{9x^2-4x}{3x^3-2x^2+5}
              \]
            </div>

<p class="step-text">The reciprocal term uses the power rule, and the logarithm term uses the chain rule.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{-7}{x^{2}} - \frac{\left(9 x^{2} - 4 x\right)}{\left(3 x^{3} - 2 x^{2} + 5\right)}
  \]
</div>
</div>

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
      `
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
          where \(t\) is measured in hours and \(0&lt;t\le4\).
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
      guidedSteps: [
        {
          title: raw`Identify the rule`,
          previewHtml: raw`The formula is the product of two functions of \(t\).`,
          workingHtml: raw`<p class="step-text">The formula is the product of two functions of \(t\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Product rule
</div>`
        },
        {
          title: raw`Evaluate the derivative at \(t=2\)`,
          previewHtml: raw`Substituting \(t=2\) gives \(P'(2)=-30e^{-2}\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              P'(t)=(30-10t)e^{-t}+(30t-5t^2)(-e^{-t})
              \]
              \[
              P'(t)=e^{-t}(5t^2-40t+30)
              \]
            </div>

<p class="step-text">Substituting \(t=2\) gives \(P'(2)=-30e^{-2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                -30e^{-2}
              \]
</div>`
        },
        {
          title: raw`Interpret the sign`,
          previewHtml: raw`Because \(P'(2)\) is negative, the water depth is decreasing after \(2\) hours.`,
          workingHtml: raw`<p class="step-text">Because \(P'(2)\) is negative, the water depth is decreasing after \(2\) hours.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  The depth is decreasing
</div>

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
      `
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
          <svg id="question-graph-2c" class="graph-svg" viewBox="0 0 420 280" aria-label="Graph of y equals x squared over x plus 4 with two tangents of gradient negative 3" role="img"></svg>
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
      guidedSteps: [
        {
          title: raw`Differentiate the curve`,
          previewHtml: raw`The quotient rule simplifies to \(\frac{x(x+8)}{(x+4)^2}\).`,
          workingHtml: raw`<p class="step-text">The quotient rule simplifies to \(\frac{x(x+8)}{(x+4)^2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{x \left(x + 8\right)}{\left(x + 4\right)^{2}}
  \]
</div>
</div>`
        },
        {
          title: raw`Find the matching \(x\)-values`,
          previewHtml: raw`The two tangency points occur when \(x=-6\) and \(x=-2\).`,
          workingHtml: raw`<p class="step-text">The two tangency points occur when \(x=-6\) and \(x=-2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x=-6,\ -2
              \]
</div>`
        },
        {
          title: raw`Identify the two points of contact`,
          previewHtml: raw`Substituting the two \(x\)-values into the curve gives \((-6,-18)\) and \((-2,2)\).`,
          workingHtml: raw`<p class="step-text">Substituting the two \(x\)-values into the curve gives \((-6,-18)\) and \((-2,2)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                (-6,-18)\text{ and }(-2,2)
              \]
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Find \(\frac{dy}{dx}\)`,
          previewHtml: raw`Dividing \(\frac{dy}{dt}\) by \(\frac{dx}{dt}\) simplifies to \(\frac{5}{2\sin t}\).`,
          workingHtml: raw`<p class="step-text">Dividing \(\frac{dy}{dt}\) by \(\frac{dx}{dt}\) simplifies to \(\frac{5}{2\sin t}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{5}{\left(2 \sin\left(t\right)\right)}
  \]
</div>
</div>`
        },
        {
          title: raw`Find the point on the curve`,
          previewHtml: raw`At \(t=\frac{\pi}{6}\), the point is \(\left(\frac{4}{\sqrt{3}},\frac{5}{\sqrt{3}}\right)\).`,
          workingHtml: raw`<p class="step-text">At \(t=\frac{\pi}{6}\), the point is \(\left(\frac{4}{\sqrt{3}},\frac{5}{\sqrt{3}}\right)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \left(\frac{4}{\sqrt{3}},\frac{5}{\sqrt{3}}\right)
              \]
</div>`
        },
        {
          title: raw`Write the tangent equation`,
          previewHtml: raw`The tangent has gradient \(5\) and passes through \(\left(\frac{4}{\sqrt{3}},\frac{5}{\sqrt{3}}\right)\), so \(y=5x-5\sqrt{3}\).`,
          workingHtml: raw`<p class="step-text">The tangent has gradient \(5\) and passes through \(\left(\frac{4}{\sqrt{3}},\frac{5}{\sqrt{3}}\right)\), so \(y=5x-5\sqrt{3}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                y=5x-5\sqrt{3}
              \]
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Find the first derivative`,
          previewHtml: raw`Follow the working to find the first derivative.`,
          workingHtml: raw`<p class="step-text">The first derivative can be written as \(-4\sin(2x)\cos(2x)\), which simplifies to \(-2\sin(4x)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  -2 \sin\left(4 x\right)
  \]
</div>
</div>`
        },
        {
          title: raw`Find the second derivative`,
          previewHtml: raw`Differentiating \(-2\sin(4x)\) gives \(-8\cos(4x)\).`,
          workingHtml: raw`<p class="step-text">Differentiating \(-2\sin(4x)\) gives \(-8\cos(4x)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  -8 \cos\left(4 x\right)
  \]
</div>
</div>`
        },
        {
          title: raw`Evaluate the radius of curvature`,
          previewHtml: raw`Substituting the derivative values into the formula gives \(\rho=2\).`,
          workingHtml: raw`<p class="step-text">Substituting the derivative values into the formula gives \(\rho=2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                2
              \]
</div>

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
      `
        }
      ]
    }),
    "3a": createConfig("3a", "2025 Paper — Reading derivatives and limits from a graph", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(y=f(x)\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3a" class="graph-svg" viewBox="0 0 460 320" aria-label="Graph of a piecewise function with a horizontal ray, two holes, and turning points" role="img"></svg>
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
      guidedSteps: [
        {
          title: raw`Find the non-differentiable points`,
          previewHtml: raw`There is a break at \(x=-6\), a hole and mismatched point at \(x=-2\), and another hole at \(x=3\).`,
          workingHtml: raw`<p class="step-text">There is a break at \(x=-6\), a hole and mismatched point at \(x=-2\), and another hole at \(x=3\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x=-6,\,-2,\text{ and }3
              \]
</div>`
        },
        {
          title: raw`Find where \(f'(x)=0\)`,
          previewHtml: raw`The left ray is horizontal for every \(x&lt;-6\), and the two smooth turning points occur at \(x=-4\) and \(x=6\).`,
          workingHtml: raw`<p class="step-text">The left ray is horizontal for every \(x&lt;-6\), and the two smooth turning points occur at \(x=-4\) and \(x=6\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x&lt;-6,\ x=-4,\text{ and }x=6
              \]
</div>`
        },
        {
          title: raw`Evaluate the limit`,
          previewHtml: raw`Both sides of the graph approach \(2\) as \(x\) approaches \(-2\).`,
          workingHtml: raw`<p class="step-text">Both sides of the graph approach \(2\) as \(x\) approaches \(-2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                2
              \]
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Differentiate the curve`,
          previewHtml: raw`Differentiating gives \(\frac{1-\ln x}{2x^2}\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              y=\frac{1}{2}(\ln x)x^{-1}
              \]
            </div>

<p class="step-text">Differentiating gives \(\frac{1-\ln x}{2x^2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{\left(1 - \ln\left(x\right)\right)}{\left(2 x^{2}\right)}
  \]
</div>
</div>`
        },
        {
          title: raw`Solve for the stationary point`,
          previewHtml: raw`Setting \(1-\ln x=0\) gives \(\ln x=1\), so \(x=e\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \frac{1-\ln x}{2x^2}=0
              \]
              \[
              1-\ln x=0
              \]
            </div>

<p class="step-text">Setting \(1-\ln x=0\) gives \(\ln x=1\), so \(x=e\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                e
              \]
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Link the rates`,
          previewHtml: raw`This is the chain rule written for related rates.`,
          workingHtml: raw`<p class="step-text">This is the chain rule written for related rates.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{dV}{dt}=\frac{dV}{dr}\cdot\frac{dr}{dt}
              \]
</div>`
        },
        {
          title: raw`Differentiate volume with respect to radius`,
          previewHtml: raw`Differentiating \(\frac{4}{3}\pi r^3\) gives \(4\pi r^2\).`,
          workingHtml: raw`<p class="step-text">Differentiating \(\frac{4}{3}\pi r^3\) gives \(4\pi r^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  4 \pi r^{2}
  \]
</div>
</div>`
        },
        {
          title: raw`Find the rate of change of volume`,
          previewHtml: raw`The volume is decreasing at \(-\frac{36\pi}{5}\text{ cm}^3\text{s}^{-1}\).`,
          workingHtml: raw`<p class="step-text">The volume is decreasing at \(-\frac{36\pi}{5}\text{ cm}^3\text{s}^{-1}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                -\frac{36\pi}{5}
              \]
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Find \(\frac{dy}{dx}\)`,
          previewHtml: raw`The gradient simplifies to \(-e^{4t}\).`,
          workingHtml: raw`<p class="step-text">The gradient simplifies to \(-e^{4t}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  -e^{\left(4 t\right)}
  \]
</div>
</div>`
        },
        {
          title: raw`Solve for the parameter`,
          previewHtml: raw`Solving \(-e^{4t}=-2\) gives \(t=\frac{\ln 2}{4}\).`,
          workingHtml: raw`<p class="step-text">Solving \(-e^{4t}=-2\) gives \(t=\frac{\ln 2}{4}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{\ln 2}{4}
              \]
</div>`
        },
        {
          title: raw`Find the coordinates`,
          previewHtml: raw`Substituting the value of \(t\) gives \(\left(\frac{5}{\sqrt{2}},5\sqrt{2}\right)\).`,
          workingHtml: raw`<p class="step-text">Substituting the value of \(t\) gives \(\left(\frac{5}{\sqrt{2}},5\sqrt{2}\right)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \left(\frac{5}{\sqrt{2}},5\sqrt{2}\right)
              \]
</div>

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
      `
        }
      ]
    }),
    "3e": createConfig("3e", "2025 Paper — Maximum-area rectangle in a curve", {
      questionHtml: raw`
        <p class="step-text">The diagram below shows part of the symmetrical graph \(y^2=16x-x^2\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3e" class="graph-svg" viewBox="0 0 420 270" aria-label="Upper half of the curve y squared equals 16x minus x squared with a rectangle inside" role="img"></svg>
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
      guidedSteps: [
        {
          title: raw`Write the area function`,
          previewHtml: raw`Width times height gives \((16-2x)\sqrt{16x-x^2}\).`,
          workingHtml: raw`<p class="step-text">Width times height gives \((16-2x)\sqrt{16x-x^2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \left(16 - 2 x\right) \sqrt{16 x - x^{2}}
  \]
</div>
</div>`
        },
        {
          title: raw`Solve for the valid \(x\)-value`,
          previewHtml: raw`Follow the working to solve for the valid \(x\)-value.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              A'(x)=-2\sqrt{16x-x^2}+\frac{(16-2x)^2}{2\sqrt{16x-x^2}}
              \]
            </div>

<p class="step-text">The valid value is \(x=8-4\sqrt{2}\), which is about \(2.343\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                8-4\sqrt{2}
              \]
</div>`
        },
        {
          title: raw`Find the maximum length \(AD\)`,
          previewHtml: raw`Follow the working to find the maximum length \(AD\).`,
          workingHtml: raw`<p class="step-text">The rectangle has maximum length \(AD=8\sqrt{2}\), which is about \(11.314\) units.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                8\sqrt{2}
              \]
</div>

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
      `
        }
      ]
    })
  };
}());
