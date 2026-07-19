(function () {
  const raw = String.raw;
  const paperHref = "level-3-differentiation-2024.html";
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
        <p class="step-text">A clean way to set this up is:</p>
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
      guidedSteps: [
        {
          title: raw`Rewrite the square root first`,
          previewHtml: raw`Writing the square root as a power of \(\frac{1}{2}\) makes the chain rule much easier to see.`,
          workingHtml: raw`<p class="step-text">Writing the square root as a power of \(\frac{1}{2}\) makes the chain rule much easier to see.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \left(4 - 9 x^{4}\right)^{\left(\frac{1}{2}\right)}
  \]
</div>
</div>`
        },
        {
          title: raw`Differentiate the inside`,
          previewHtml: raw`The constant disappears, and \(-9x^4\) becomes \(-36x^3\).`,
          workingHtml: raw`<p class="step-text">The constant disappears, and \(-9x^4\) becomes \(-36x^3\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  -36 x^{3}
  \]
</div>
</div>`
        },
        {
          title: raw`Build the derivative`,
          previewHtml: raw`That is exactly right, and the simplified denominator form is fine too.`,
          workingHtml: raw`<p class="step-text">That is exactly right, and the simplified denominator form is fine too.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  -18 x^{3} \left(4 - 9 x^{4}\right)^{\left(\frac{-1}{2}\right)}
  \]
</div>
</div>

        <p class="step-text">A clean way to set this up is:</p>
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
      `
        }
      ]
    }),
    "1b": createConfig("1b", raw`2024 Paper — Product rule at \(x=0\)`, {
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
      guidedSteps: [
        {
          title: raw`Identify the main rule`,
          previewHtml: raw`The function is one factor times another, so the product rule is the obvious starting point.`,
          workingHtml: raw`<p class="step-text">The function is one factor times another, so the product rule is the obvious starting point.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Product rule
</div>`
        },
        {
          title: raw`Differentiate before substituting`,
          previewHtml: raw`That is the product rule result we want before evaluating.`,
          workingHtml: raw`<p class="step-text">That is the product rule result we want before evaluating.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \left(2 x + 3\right) \sin\left(x\right) + \left(x^{2} + 3 x + 2\right) \cos\left(x\right)
  \]
</div>
</div>`
        },
        {
          title: raw`Evaluate the gradient`,
          previewHtml: raw`Since \(\sin 0=0\) and \(\cos 0=1\), the gradient comes out to \(2\).`,
          workingHtml: raw`<p class="step-text">Since \(\sin 0=0\) and \(\cos 0=1\), the gradient comes out to \(2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                2
              \]
</div>

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
      `
        }
      ]
    }),
    "1c": createConfig("1c", "2024 Paper — Find where the function is decreasing", {
      focus: raw`differentiating first, then solving \(\frac{dy}{dx}<0\) to locate the interval where the graph is falling.`,
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
        raw`Go term by term.`,
        raw`A function is decreasing where its derivative is negative.`,
        raw`After finding the critical values, test a value in between them if you want to check the sign directly.`
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
          1&lt;x&lt;\frac{5}{2}.
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Find the derivative`,
          previewHtml: raw`That matches the term-by-term derivative.`,
          workingHtml: raw`<p class="step-text">That matches the term-by-term derivative.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  24 x - 84 + \frac{60}{x}
  \]
</div>
</div>`
        },
        {
          title: raw`Find the critical values`,
          previewHtml: raw`The derivative is zero at \(x=1\) and \(x=\frac{5}{2}\).`,
          workingHtml: raw`<p class="step-text">The derivative is zero at \(x=1\) and \(x=\frac{5}{2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x=1,\ \frac{5}{2}
              \]
</div>`
        },
        {
          title: raw`Identify the decreasing interval`,
          previewHtml: raw`That is exactly the interval you get after testing a value like \(x=2\).`,
          workingHtml: raw`<p class="step-text">That is exactly the interval you get after testing a value like \(x=2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                1&lt;x&lt;\frac{5}{2}
              \]
</div>

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
          1&lt;x&lt;\frac{5}{2}.
          \]
        </div>
      `
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
        raw`We need both the first and second derivatives here.`,
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
          \frac{d^2y}{dx^2}\bigg|_{x=1}=-4e^{-2}&lt;0
          \]
        </div>
        <p class="step-text">So there is a stationary point at \(x=1\), and it is a maximum.</p>
      `,
      guidedSteps: [
        {
          title: raw`Differentiate the product`,
          previewHtml: raw`The product rule simplifies nicely to \(e^{-2x}(4-4x)\).`,
          workingHtml: raw`<p class="step-text">The product rule simplifies nicely to \(e^{-2x}(4-4x)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  e^{\left(-2 x\right)} \left(4 - 4 x\right)
  \]
</div>
</div>`
        },
        {
          title: raw`Solve for the stationary point`,
          previewHtml: raw`The exponential factor is never zero, so the stationary point comes from \(4-4x=0\).`,
          workingHtml: raw`<p class="step-text">The exponential factor is never zero, so the stationary point comes from \(4-4x=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                1
              \]
</div>`
        },
        {
          title: raw`Use the second derivative test`,
          previewHtml: raw`A negative second derivative means the curve is concave down there, so the stationary point is a maximum.`,
          workingHtml: raw`<p class="step-text">A negative second derivative means the curve is concave down there, so the stationary point is a maximum.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  The stationary point is a maximum
</div>

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
          \frac{d^2y}{dx^2}\bigg|_{x=1}=-4e^{-2}&lt;0
          \]
        </div>
        <p class="step-text">So there is a stationary point at \(x=1\), and it is a maximum.</p>
      `
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
        raw`Start by finding where the second derivative is zero, because that tells us where \(P\) is.`,
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
      guidedSteps: [
        {
          title: raw`Find the first derivative`,
          previewHtml: raw`That is the first derivative we need before going on to the second derivative.`,
          workingHtml: raw`<p class="step-text">That is the first derivative we need before going on to the second derivative.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  2 + \frac{1}{x^{2}} - \frac{2}{x}
  \]
</div>
</div>`
        },
        {
          title: raw`Find the second derivative`,
          previewHtml: raw`And this is the one we set equal to zero to find the inflection point.`,
          workingHtml: raw`<p class="step-text">And this is the one we set equal to zero to find the inflection point.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{-2}{x^{3}} + \frac{2}{x^{2}}
  \]
</div>
</div>`
        },
        {
          title: raw`Find point \(P\)`,
          previewHtml: raw`Point \(P\) happens at \(x=1\).`,
          workingHtml: raw`<p class="step-text">Point \(P\) happens at \(x=1\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                1
              \]
</div>`
        },
        {
          title: raw`Write the tangent equation`,
          previewHtml: raw`A rare anticlimax: the tangent equation is just \(y=x\).`,
          workingHtml: raw`<p class="step-text">A rare anticlimax: the tangent equation is just \(y=x\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                y=x
              \]
</div>

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
      `
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
        raw`That is exactly the right route here.`
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
      guidedSteps: [
        {
          title: raw`Differentiate \(x\) with respect to \(t\)`,
          previewHtml: raw`\(3t^2+1\) differentiates to \(6t\).`,
          workingHtml: raw`<p class="step-text">\(3t^2+1\) differentiates to \(6t\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  6 t
  \]
</div>
</div>`
        },
        {
          title: raw`Differentiate \(y\) with respect to \(t\)`,
          previewHtml: raw`The derivative of \(\cos t\) is \(-\sin t\).`,
          workingHtml: raw`<p class="step-text">The derivative of \(\cos t\) is \(-\sin t\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  -\sin\left(t\right)
  \]
</div>
</div>`
        },
        {
          title: raw`Combine them into \(\frac{dy}{dx}\)`,
          previewHtml: raw`That is the parametric derivative.`,
          workingHtml: raw`<p class="step-text">That is the parametric derivative.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{-\sin\left(t\right)}{\left(6 t\right)}
  \]
</div>
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Spot the method`,
          previewHtml: raw`The logarithm is the outside function, and \(3t^2+5t+2\) is the inside.`,
          workingHtml: raw`<p class="step-text">The logarithm is the outside function, and \(3t^2+5t+2\) is the inside.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Because the logarithm has a quadratic inside it
</div>`
        },
        {
          title: raw`Find the velocity function`,
          previewHtml: raw`The derivative of \(\ln(\text{inside})\) is \(\frac{\text{inside}'}{\text{inside}}\).`,
          workingHtml: raw`<p class="step-text">The derivative of \(\ln(\text{inside})\) is \(\frac{\text{inside}'}{\text{inside}}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{\left(6 t + 5\right)}{\left(3 t^{2} + 5 t + 2\right)}
  \]
</div>
</div>`
        },
        {
          title: raw`Evaluate at \(t=1\)`,
          previewHtml: raw`And that is the value you get after the substitution.`,
          workingHtml: raw`<p class="step-text">And that is the value you get after the substitution.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{11}{10}
              \]
</div>

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
      `
        }
      ]
    }),
    "2c": createConfig("2c", "2024 Paper — Show a function satisfies a differential equation", {
      focus: raw`finding \(y'\) and \(y''\), then substituting back into the left-hand side and simplifying until the matching terms appear.`,
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
      guidedSteps: [
        {
          title: raw`Differentiate once`,
          previewHtml: raw`The first term needs the chain rule, and the second term differentiates to \(+\sin x\).`,
          workingHtml: raw`<p class="step-text">The first term needs the chain rule, and the second term differentiates to \(+\sin x\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  2 x \cdot \cos\left(x^{2}\right) + \sin\left(x\right)
  \]
</div>
</div>`
        },
        {
          title: raw`Differentiate again`,
          previewHtml: raw`This is the part where the product rule and chain rule both show up together.`,
          workingHtml: raw`<p class="step-text">This is the part where the product rule and chain rule both show up together.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  2 \cos\left(x^{2}\right) - 4 x^{2} \sin\left(x^{2}\right) + \cos\left(x\right)
  \]
</div>
</div>`
        },
        {
          title: raw`Show the left-hand side matches`,
          previewHtml: raw`The sine terms cancel, and you are left with the required right-hand side.`,
          workingHtml: raw`<p class="step-text">The sine terms cancel, and you are left with the required right-hand side.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  2 \cos\left(x^{2}\right) + \left(1 - 4 x^{2}\right) \cos\left(x\right)
  \]
</div>
</div>

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
      `
        }
      ]
    }),
    "2d": createConfig("2d", raw`2024 Paper — Point of inflection on \(f(x)=\frac{\ln x}{x}\)`, {
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
        raw`You can do this with the quotient rule twice, but the simplified derivatives are easier to work with here.`,
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
      guidedSteps: [
        {
          title: raw`Find the first derivative`,
          previewHtml: raw`That is the simplified quotient-rule result.`,
          workingHtml: raw`<p class="step-text">That is the simplified quotient-rule result.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{\left(1 - \ln\left(x\right)\right)}{x^{2}}
  \]
</div>
</div>`
        },
        {
          title: raw`Find the second derivative`,
          previewHtml: raw`That gives the equation we need for the inflection point.`,
          workingHtml: raw`<p class="step-text">That gives the equation we need for the inflection point.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{\left(-3 + 2 \ln\left(x\right)\right)}{x^{3}}
  \]
</div>
</div>`
        },
        {
          title: raw`Solve for the \(x\)-coordinate`,
          previewHtml: raw`The logarithm step gives \(x=e^{3/2}\).`,
          workingHtml: raw`<p class="step-text">The logarithm step gives \(x=e^{3/2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                e^{3/2}
              \]
</div>`
        },
        {
          title: raw`Find the coordinates`,
          previewHtml: raw`That is the exact-coordinate version of the point.`,
          workingHtml: raw`<p class="step-text">That is the exact-coordinate version of the point.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \left(e^{3/2},\frac{3}{2e^{3/2}}\right)
              \]
</div>

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
      `
        }
      ]
    }),
    "2e": createConfig("2e", "2024 Paper — A single turning point via the discriminant", {
      focus: raw`differentiating to get the turning-point equation, then using the discriminant to force one repeated solution.`,
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
      guidedSteps: [
        {
          title: raw`Differentiate the function`,
          previewHtml: raw`The derivative tidies up to a nice quadratic factor on top.`,
          workingHtml: raw`<p class="step-text">The derivative tidies up to a nice quadratic factor on top.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{e^{\left(3 x\right)} \left(6 x^{2} + 3 k x + k\right)}{\left(2 x + k\right)^{2}}
  \]
</div>
</div>`
        },
        {
          title: raw`Use the single-turning-point idea`,
          previewHtml: raw`One turning point means one repeated solution when you solve the derivative equation.`,
          workingHtml: raw`<p class="step-text">One turning point means one repeated solution when you solve the derivative equation.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Because the quadratic for the turning points must have one repeated root
</div>`
        },
        {
          title: raw`Find \(k\)`,
          previewHtml: raw`The valid non-zero constant is \(k=\frac{8}{3}\).`,
          workingHtml: raw`<p class="step-text">The valid non-zero constant is \(k=\frac{8}{3}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{8}{3}
              \]
</div>`
        },
        {
          title: raw`Find the turning-point \(x\)-coordinate`,
          previewHtml: raw`That repeated root gives the single turning point at \(x=-\frac{2}{3}\).`,
          workingHtml: raw`<p class="step-text">That repeated root gives the single turning point at \(x=-\frac{2}{3}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                -\frac{2}{3}
              \]
</div>

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
      `
        }
      ]
    }),
    "3a": createConfig("3a", raw`2024 Paper — Differentiate \(\sqrt{x}\sec(6x)\)`, {
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
      guidedSteps: [
        {
          title: raw`Identify the overall rule`,
          previewHtml: raw`There is a square-root factor multiplied by a secant factor.`,
          workingHtml: raw`<p class="step-text">There is a square-root factor multiplied by a secant factor.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Product rule
</div>`
        },
        {
          title: raw`Differentiate the \(\sqrt{x}\) factor`,
          previewHtml: raw`That is the outside factor's derivative in the product rule.`,
          workingHtml: raw`<p class="step-text">That is the outside factor's derivative in the product rule.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{1}{\left(2 \sqrt{x}\right)}
  \]
</div>
</div>`
        },
        {
          title: raw`Build the full derivative`,
          previewHtml: raw`Product rule on the outside, chain rule inside the secant, and no extra simplification needed.`,
          workingHtml: raw`<p class="step-text">Product rule on the outside, chain rule inside the secant, and no extra simplification needed.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \left(\frac{1}{\left(2 \sqrt{x}\right)}\right) \cdot \sec\left(6 x\right) + 6 \sqrt{x} \sec\left(6 x\right) \tan\left(6 x\right)
  \]
</div>
</div>

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
      `
        }
      ]
    }),
    "3b": createConfig("3b", "2024 Paper — Read continuity, differentiability, and a limit from a graph", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(y=f(x)\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3b-2024" class="graph-svg" viewBox="0 0 560 360" aria-label="Graph of a piecewise function with open and closed points" role="img"></svg>
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
          \text{(ii) } x=1 \text{ and } 3&lt;x&lt;5
          \]
          \[
          \text{(iii) } \lim_{x\to -1}f(x)=1
          \]
        </div>
        <p class="step-text">At \(x=5\), the graph is still joined up, but the gradient changes abruptly, so it is continuous but not differentiable there.</p>
      `,
      afterRender: draw3bGraph,
      guidedSteps: [
        {
          title: raw`Find where the graph is joined but has a sharp change`,
          previewHtml: raw`The graph is connected at \(x=5\), but the gradient changes suddenly there.`,
          workingHtml: raw`<p class="step-text">The graph is connected at \(x=5\), but the gradient changes suddenly there.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x=5
              \]
</div>`
        },
        {
          title: raw`Find where the graph is horizontal`,
          previewHtml: raw`There is a turning point at \(x=1\), and the graph is flat all the way across the horizontal segment for \(3&lt;x&lt;5\).`,
          workingHtml: raw`<p class="step-text">There is a turning point at \(x=1\), and the graph is flat all the way across the horizontal segment for \(3&lt;x&lt;5\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x=1 \text{ and } 3&lt;x&lt;5
              \]
</div>`
        },
        {
          title: raw`Read the limit`,
          previewHtml: raw`Both sides of the graph are heading towards the open point at \((-1,1)\), so the limit is \(1\).`,
          workingHtml: raw`<p class="step-text">Both sides of the graph are heading towards the open point at \((-1,1)\), so the limit is \(1\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                1
              \]
</div>

        <p class="step-text">Reading from the graph:</p>
        <div class="math-block">
          \[
          \text{(i) } x=5
          \]
          \[
          \text{(ii) } x=1 \text{ and } 3&lt;x&lt;5
          \]
          \[
          \text{(iii) } \lim_{x\to -1}f(x)=1
          \]
        </div>
        <p class="step-text">At \(x=5\), the graph is still joined up, but the gradient changes abruptly, so it is continuous but not differentiable there.</p>
      `
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
        raw`Expanding the numerator after differentiating is a good move here.`,
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
      guidedSteps: [
        {
          title: raw`Differentiate the quotient`,
          previewHtml: raw`After the quotient rule, the numerator simplifies a lot more nicely than it first looks.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              f'(x)=\frac{(x^2+5x+4)(2x-5)-(x^2-5x+4)(2x+5)}{(x^2+5x+4)^2}
              \]
            </div>

<p class="step-text">After the quotient rule, the numerator simplifies a lot more nicely than it first looks.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{\left(10 x^{2} - 40\right)}{\left(x^{2} + 5 x + 4\right)^{2}}
  \]
</div>
</div>`
        },
        {
          title: raw`Solve for the stationary \(x\)-values`,
          previewHtml: raw`Those are the two stationary \(x\)-values.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \frac{10x^2-40}{(x^2+5x+4)^2}=0
              \]
              \[
              10x^2-40=0
              \]
              \[
              x^2=4
              \]
            </div>

<p class="step-text">Those are the two stationary \(x\)-values.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x=-2,\ 2
              \]
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Relate the radius and the height`,
          previewHtml: raw`That substitution is the key step that makes the related-rates algebra manageable.`,
          workingHtml: raw`<p class="step-text">That substitution is the key step that makes the related-rates algebra manageable.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                r=\frac{h}{2}
              \]
</div>`
        },
        {
          title: raw`Write the volume in terms of \(h\)`,
          previewHtml: raw`That is the simplified volume expression we differentiate next.`,
          workingHtml: raw`<p class="step-text">That is the simplified volume expression we differentiate next.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{\pi \cdot h^{3}}{12}
  \]
</div>
</div>`
        },
        {
          title: raw`Differentiate with respect to \(h\)`,
          previewHtml: raw`Now we can turn that into \(\frac{dh}{dt}\).`,
          workingHtml: raw`<p class="step-text">Now we can turn that into \(\frac{dh}{dt}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{\pi \cdot h^{2}}{4}
  \]
</div>
</div>`
        },
        {
          title: raw`Find the rate when \(h=4\)`,
          previewHtml: raw`The height is increasing at \(\frac{3}{4\pi}\text{ cm s}^{-1}\) when \(h=4\).`,
          workingHtml: raw`<p class="step-text">The height is increasing at \(\frac{3}{4\pi}\text{ cm s}^{-1}\) when \(h=4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{3}{4\pi}
              \]
</div>

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
      `
        }
      ]
    }),
    "3e": createConfig("3e", raw`2024 Paper — Maximise the area of triangle \(OPQ\)`, {
      questionHtml: raw`
        <p class="step-text">
          The diagram below shows part of the graph of the function
          \[
          f(x)=e^{-x^2},\qquad x\ge 0.
          \]
        </p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3e-2024" class="graph-svg" viewBox="0 0 520 320" aria-label="Graph of y equals e to the power negative x squared with a triangle OPQ" role="img"></svg>
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
      guidedSteps: [
        {
          title: raw`Write the area function`,
          previewHtml: raw`The symmetry means the base is \(2x\), so the half-base-times-height calculation collapses to \(xe^{-x^2}\).`,
          workingHtml: raw`<p class="step-text">The symmetry means the base is \(2x\), so the half-base-times-height calculation collapses to \(xe^{-x^2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  x \cdot e^{\left(-x^{2}\right)}
  \]
</div>
</div>`
        },
        {
          title: raw`Differentiate the area`,
          previewHtml: raw`Product rule and chain rule together give that derivative.`,
          workingHtml: raw`<p class="step-text">Product rule and chain rule together give that derivative.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  e^{\left(-x^{2}\right)} \left(1 - 2 x^{2}\right)
  \]
</div>
</div>`
        },
        {
          title: raw`Find the positive critical value`,
          previewHtml: raw`The negative root is ignored because the question says \(x\ge 0\).`,
          workingHtml: raw`<p class="step-text">The negative root is ignored because the question says \(x\ge 0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{1}{\sqrt{2}}
              \]
</div>`
        },
        {
          title: raw`State the largest area`,
          previewHtml: raw`That is the value the question asks you to prove.`,
          workingHtml: raw`<p class="step-text">That is the value the question asks you to prove.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{1}{\sqrt{2e}}
              \]
</div>

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
      `
        }
      ]
    })
  };
}());
