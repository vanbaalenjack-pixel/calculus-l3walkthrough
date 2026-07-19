(function () {
  const raw = String.raw;
  const paperHref = "level-3-integration-2018.html";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const metadata = {
    topic: "Integration",
    year: 2018,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return "int-" + id + "2018.html";
  }

  function buildPartNavigation(id) {
    return questionOrder.map(function (partId) {
      return {
        href: pageHref(partId),
        label: partId.charAt(0) + "(" + partId.charAt(1) + ")",
        current: partId === id
      };
    });
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
        ? { href: pageHref(previous), label: "← Back to " + questionLabel(previous) }
        : { href: paperHref, label: "← Back to paper" },
      primary: next
        ? { href: pageHref(next), label: "Next question →" }
        : { href: paperHref, label: "Back to paper" }
    };
  }

  function createConfig(id, subtitle, details) {
    const next = nextId(id);
    const config = Object.assign({
      browserTitle: "2018 Integration Paper - " + questionLabel(id),
      eyebrow: "Level 3 Integration Walkthrough",
      title: questionLabel(id),
      subtitle: subtitle,
      backHref: paperHref,
      nextHref: next ? pageHref(next) : paperHref,
      nextLabel: next ? "Next question →" : "Back to paper",
      finalNav: buildFinalNav(id),
      partNavigation: buildPartNavigation(id),
      partNavigationTitle: "2018 paper questions",
      metadata: metadata
    }, details);

    if (config.answerHtml && Array.isArray(config.guidedSteps) && config.guidedSteps.length) {
      config.guidedSteps = config.guidedSteps.map(function (step, index) {
        if (index !== config.guidedSteps.length - 1) {
          return step;
        }

        return Object.assign({}, step, {
          workingHtml: (step.workingHtml || "") + config.answerHtml
        });
      });
    }

    return config;
  }

  function guidedStep(title, previewHtml, workingHtml) {
    return {
      title: title,
      previewHtml: previewHtml,
      workingHtml: workingHtml
    };
  }

  function answerHighlight(html) {
    return raw`
      <div class="answer-highlight walkthrough-answer-highlight">
        <p class="question-label">Final answer</p>
        ${html}
      </div>
    `;
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

  function functionPoints(fn, start, end, step) {
    const points = [];

    for (let x = start; x <= end + step / 2; x += step) {
      const y = fn(x);
      if (Number.isFinite(y)) {
        points.push([x, y]);
      }
    }

    return points;
  }

  function polylinePath(points, scale) {
    return points.map(function (point, index) {
      return (index === 0 ? "M " : " L ") + scale.x(point[0]) + " " + scale.y(point[1]);
    }).join("");
  }

  function functionPath(fn, start, end, step, scale) {
    return polylinePath(functionPoints(fn, start, end, step), scale);
  }

  function areaUnderCurvePath(fn, start, end, baseline, step, scale) {
    const points = functionPoints(fn, start, end, step);
    let path = "M " + scale.x(start) + " " + scale.y(baseline);

    points.forEach(function (point) {
      path += " L " + scale.x(point[0]) + " " + scale.y(point[1]);
    });

    return path + " L " + scale.x(end) + " " + scale.y(baseline) + " Z";
  }

  function areaBetweenCurvesPath(topFn, bottomFn, start, end, step, scale) {
    const topPoints = functionPoints(topFn, start, end, step);
    const bottomPoints = functionPoints(bottomFn, start, end, step).reverse();
    let path = polylinePath(topPoints, scale);

    bottomPoints.forEach(function (point) {
      path += " L " + scale.x(point[0]) + " " + scale.y(point[1]);
    });

    return path + " Z";
  }

  function lineMarkup(scale, x1, y1, x2, y2, className, extra) {
    return `<line class="${className}" x1="${scale.x(x1)}" y1="${scale.y(y1)}" x2="${scale.x(x2)}" y2="${scale.y(y2)}"${extra || ""}></line>`;
  }

  function circleMarkup(scale, x, y, radius, className) {
    return `<circle class="${className}" cx="${scale.x(x)}" cy="${scale.y(y)}" r="${radius}"></circle>`;
  }

  function textMarkup(scale, x, y, text, className, extra) {
    return `<text class="${className}" x="${scale.x(x)}" y="${scale.y(y)}"${extra || ""}>${text}</text>`;
  }

  function graphDefinitions(markerId) {
    return `
      <defs>
        <marker id="${markerId}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#66758f"></path>
        </marker>
      </defs>
    `;
  }

  function draw1eGraph() {
    const svg = document.getElementById("question-graph-1e-int-2018");
    if (!svg) {
      return;
    }

    const width = 620;
    const height = 360;
    const padding = 50;
    const displayK = 1.25643;
    const scale = createScale(width, height, padding, -0.14, 1.92, -0.18, 2.38);
    const fn = function (x) { return 0.5 * (Math.exp(x) - 1); };

    svg.innerHTML = `
      <title id="graph-1e-title">Area under an exponential curve to Q at k comma k</title>
      <desc id="graph-1e-desc">The increasing curve f of x equals one half times e to the x minus one begins at the origin. The area under the curve from zero to k is shaded. A vertical line at x equals k reaches the point Q with coordinates k comma k.</desc>
      ${graphDefinitions("graph-arrow-1e")}
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      <path class="question-shade" d="${areaUnderCurvePath(fn, 0, displayK, 0, 0.012, scale)}"></path>
      <path class="question-curve" d="${functionPath(fn, 0, 1.72, 0.012, scale)}"></path>
      ${lineMarkup(scale, 0, 0, 1.86, 0, "graph-axis", ' marker-end="url(#graph-arrow-1e)"')}
      ${lineMarkup(scale, 0, 0, 0, 2.28, "graph-axis", ' marker-end="url(#graph-arrow-1e)"')}
      ${lineMarkup(scale, displayK, 0, displayK, fn(displayK), "graph-measure")}
      ${circleMarkup(scale, displayK, fn(displayK), 5, "question-dot")}
      ${circleMarkup(scale, 0, 0, 5, "question-origin")}
      ${textMarkup(scale, 1.87, -0.08, "x", "question-axis-label")}
      ${textMarkup(scale, -0.05, 2.27, "f(x)", "question-axis-label", ' text-anchor="end"')}
      ${textMarkup(scale, displayK, -0.09, "k", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 0.98, 1.48, "Q (k, k)", "graph-equation-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 1.47, 1.9, "f(x) = ½(eˣ − 1)", "graph-equation-label", ' text-anchor="middle"')}
    `;
  }

  function draw2cGraph() {
    const svg = document.getElementById("question-graph-2c-int-2018");
    if (!svg) {
      return;
    }

    const width = 660;
    const height = 360;
    const padding = 48;
    const displayK = Math.PI / 4;
    const scale = createScale(width, height, padding, -0.66, 3.38, -0.22, 1.2);
    const cosSquared = function (x) { return Math.cos(x) * Math.cos(x); };
    const sinSquared = function (x) { return Math.sin(x) * Math.sin(x); };

    svg.innerHTML = `
      <title id="graph-2c-title">First positive region between cosine squared and sine squared</title>
      <desc id="graph-2c-desc">The solid cosine-squared curve starts at one and the dashed sine-squared curve starts at zero. The region between them from x equals zero to their first intersection at x equals k is shaded, with a dashed vertical guide at k.</desc>
      ${graphDefinitions("graph-arrow-2c")}
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      <path class="question-shade" d="${areaBetweenCurvesPath(cosSquared, sinSquared, 0, displayK, 0.012, scale)}"></path>
      <path class="question-curve" d="${functionPath(cosSquared, -0.55, 3.25, 0.012, scale)}"></path>
      <path class="graph-curve-secondary" stroke-dasharray="8 5" d="${functionPath(sinSquared, -0.55, 3.25, 0.012, scale)}"></path>
      ${lineMarkup(scale, -0.57, 0, 3.29, 0, "graph-axis", ' marker-start="url(#graph-arrow-2c)" marker-end="url(#graph-arrow-2c)"')}
      ${lineMarkup(scale, 0, -0.14, 0, 1.13, "graph-axis", ' marker-end="url(#graph-arrow-2c)"')}
      ${lineMarkup(scale, displayK, 0, displayK, cosSquared(displayK), "graph-guide")}
      ${circleMarkup(scale, 0, 0, 5, "question-origin")}
      ${textMarkup(scale, 3.28, -0.08, "x", "question-axis-label")}
      ${textMarkup(scale, 0.04, 1.12, "y", "question-axis-label")}
      ${textMarkup(scale, displayK, -0.09, "k", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, -0.3, 0.83, "y = cos²x", "graph-equation-label", ' text-anchor="middle"')}
      ${textMarkup(scale, -0.31, 0.16, "y = sin²x", "graph-equation-label", ' text-anchor="middle"')}
    `;
  }

  function draw3dGraph() {
    const svg = document.getElementById("question-graph-3d-int-2018");
    if (!svg) {
      return;
    }

    const width = 620;
    const height = 360;
    const padding = 50;
    const scale = createScale(width, height, padding, -0.14, 1.38, -0.16, 1.42);
    const parabola = function (x) { return x * x; };
    const cubeRoot = function (x) { return Math.cbrt(x); };

    svg.innerHTML = `
      <title id="graph-3d-title">Area between y equals x squared and y equals the cube root of x</title>
      <desc id="graph-3d-desc">In the first quadrant, the cube-root curve lies above the parabola between their intersections at zero and one. The enclosed region between the curves is shaded.</desc>
      ${graphDefinitions("graph-arrow-3d")}
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      <path class="question-shade" d="${areaBetweenCurvesPath(cubeRoot, parabola, 0, 1, 0.01, scale)}"></path>
      <path class="question-curve" d="${functionPath(parabola, 0, 1.17, 0.01, scale)}"></path>
      <path class="graph-curve-secondary" stroke-dasharray="8 5" d="${functionPath(cubeRoot, 0, 1.27, 0.01, scale)}"></path>
      ${lineMarkup(scale, 0, 0, 1.31, 0, "graph-axis", ' marker-end="url(#graph-arrow-3d)"')}
      ${lineMarkup(scale, 0, 0, 0, 1.34, "graph-axis", ' marker-end="url(#graph-arrow-3d)"')}
      ${circleMarkup(scale, 0, 0, 5, "question-origin")}
      ${circleMarkup(scale, 1, 1, 5, "question-dot")}
      ${textMarkup(scale, 1.31, -0.08, "x", "question-axis-label")}
      ${textMarkup(scale, -0.04, 1.33, "y", "question-axis-label", ' text-anchor="end"')}
      ${textMarkup(scale, 1, -0.09, "1", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, -0.04, 1, "1", "graph-label", ' text-anchor="end"')}
      ${textMarkup(scale, 1.11, 1.24, "y = x²", "graph-equation-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 1.13, 0.82, "y = ∛x", "graph-equation-label", ' text-anchor="middle"')}
    `;
  }

  function draw3eGraph() {
    const svg = document.getElementById("question-graph-3e-int-2018");
    if (!svg) {
      return;
    }

    const width = 680;
    const height = 390;
    const padding = 54;
    const scale = createScale(width, height, padding, -0.12, 1.16, -0.18, 1.72);
    const curve = function (x) { return Math.pow(2 * x - 1, 4); };
    const tangent = function (x) { return 8 * x - 7; };
    const curvePoints = functionPoints(curve, 0.5, 1, 0.006);
    let shadePath = polylinePath(curvePoints, scale);
    shadePath += " L " + scale.x(0.875) + " " + scale.y(0);
    shadePath += " L " + scale.x(0.5) + " " + scale.y(0) + " Z";

    svg.innerHTML = `
      <title id="graph-3e-title">Region bounded by a quartic curve, its tangent at Q, and the x-axis</title>
      <desc id="graph-3e-desc">The quartic curve f of x equals two x minus one to the fourth touches the x-axis at P, one half comma zero, and passes through Q, one comma one. The tangent at Q crosses the x-axis at seven eighths. The region inside the curve, axis, and tangent is shaded.</desc>
      ${graphDefinitions("graph-arrow-3e")}
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      <path class="question-shade-strong" d="${shadePath}"></path>
      <path class="question-curve" d="${functionPath(curve, -0.03, 1.06, 0.006, scale)}"></path>
      <path class="graph-curve-secondary" d="${functionPath(tangent, 0.875, 1.075, 0.006, scale)}"></path>
      ${lineMarkup(scale, -0.06, 0, 1.1, 0, "graph-axis", ' marker-start="url(#graph-arrow-3e)" marker-end="url(#graph-arrow-3e)"')}
      ${lineMarkup(scale, 0, -0.1, 0, 1.62, "graph-axis", ' marker-end="url(#graph-arrow-3e)"')}
      ${circleMarkup(scale, 0.5, 0, 5, "question-dot")}
      ${circleMarkup(scale, 0.875, 0, 5, "question-origin")}
      ${circleMarkup(scale, 1, 1, 5, "question-dot")}
      ${textMarkup(scale, 1.1, -0.08, "x", "question-axis-label")}
      ${textMarkup(scale, -0.03, 1.61, "y", "question-axis-label", ' text-anchor="end"')}
      ${textMarkup(scale, 0.5, -0.09, "P (½, 0)", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 0.875, -0.13, "⅞", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 1.02, 1.08, "Q (1, 1)", "graph-equation-label")}
      ${textMarkup(scale, 0.2, 1.43, "f(x) = (2x − 1)⁴", "graph-equation-label")}
      ${textMarkup(scale, 0.96, 0.55, "tangent", "graph-equation-label", ' text-anchor="end"')}
    `;
  }

  window.Integration2018Walkthroughs = {
    "1a": createConfig("1a", "Question One - negative powers", {
      focus: raw`Rewrite the fraction as a negative power, then use the power rule term by term.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find }\int\left(6x-\frac{8}{x^3}\right)\,dx.
          \]
        </div>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{3x^2+\frac{4}{x^2}+C}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Rewrite the negative power", raw`Move the power of \(x\) from the denominator into the numerator.`, raw`
          <div class="math-block">
            \[
            \int\left(6x-\frac{8}{x^3}\right)\,dx
            =\int\left(6x-8x^{-3}\right)\,dx.
            \]
          </div>
        `),
        guidedStep("Integrate each term", raw`Increase each exponent by one and divide by the new exponent.`, raw`
          <div class="math-block">
            \[
            \int 6x\,dx=3x^2,
            \qquad
            \int -8x^{-3}\,dx=-8\left(\frac{x^{-2}}{-2}\right)=4x^{-2}.
            \]
          </div>
        `),
        guidedStep("Write the antiderivative", raw`Convert the negative power back to a fraction and include the integration constant.`, raw`
          <div class="math-block">
            \[
            3x^2+4x^{-2}+C=3x^2+\frac{4}{x^2}+C.
            \]
          </div>
        `)
      ]
    }),

    "1b": createConfig("1b", "Question One - an initial condition", {
      focus: raw`Integrate the gradient first, then use the given point to determine \(C\).`,
      questionHtml: raw`
        <p class="step-text">Solve the differential equation</p>
        <div class="question-math">
          \[
          \frac{dy}{dx}=e^{2x}+\frac{1}{x},
          \]
        </div>
        <p class="step-text">given that \(y=2\) when \(x=1\).</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{y=\frac12e^{2x}+\ln|x|+2-\frac12e^2}
          \]
        </div>
        <p class="step-text question-note">The solution branch containing \(x=1\) has \(x>0\), so \(\ln x\) is also valid on this domain.</p>
      `),
      guidedSteps: [
        guidedStep("Integrate the gradient", raw`Reverse the chain rule for \(e^{2x}\), and use the logarithm rule for \(1/x\).`, raw`
          <div class="math-block">
            \[
            y=\int\left(e^{2x}+\frac1x\right)\,dx
            =\frac12e^{2x}+\ln|x|+C.
            \]
          </div>
        `),
        guidedStep("Substitute the initial condition", raw`Put \(x=1\) and \(y=2\) into the general solution.`, raw`
          <div class="math-block">
            \[
            2=\frac12e^2+\ln|1|+C.
            \]
          </div>
        `),
        guidedStep("Find the constant", raw`Use \(\ln 1=0\), then isolate \(C\).`, raw`
          <div class="math-block">
            \[
            C=2-\frac12e^2.
            \]
          </div>
        `),
        guidedStep("Complete the solution", raw`Return the constant to the integrated equation.`, raw`
          <div class="math-block">
            \[
            y=\frac12e^{2x}+\ln|x|+2-\frac12e^2.
            \]
          </div>
        `)
      ]
    }),

    "1c": createConfig("1c", "Question One - algebra before integration", {
      focus: raw`Rewrite the numerator in terms of \(x-5\) so the fraction splits into familiar pieces.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find }\int_6^8\frac{2x-7}{x-5}\,dx.
          \]
        </div>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{4+3\ln 3\approx7.296}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Split the fraction", raw`Express \(2x-7\) as a multiple of \(x-5\) plus a remainder.`, raw`
          <div class="math-block">
            \[
            2x-7=2(x-5)+3,
            \qquad
            \frac{2x-7}{x-5}=2+\frac3{x-5}.
            \]
          </div>
        `),
        guidedStep("Integrate", raw`The reciprocal linear term gives a logarithm.`, raw`
          <div class="math-block">
            \[
            \int_6^8\left(2+\frac3{x-5}\right)\,dx
            =\left[2x+3\ln|x-5|\right]_6^8.
            \]
          </div>
        `),
        guidedStep("Evaluate the limits", raw`Substitute the upper value, then subtract the lower value.`, raw`
          <div class="math-block">
            \[
            (16+3\ln3)-(12+3\ln1)=4+3\ln3.
            \]
          </div>
        `)
      ]
    }),

    "1d": createConfig("1d", "Question One - separating variables", {
      focus: raw`Move \(e^y\) beside \(dy\), then integrate both sides before applying the condition.`,
      questionHtml: raw`
        <p class="step-text">Solve the differential equation</p>
        <div class="question-math">
          \[
          \frac{dy}{dx}=\frac{\cos 2x}{e^y},
          \]
        </div>
        <p class="step-text">given that \(y=0\) when \(x=\frac{\pi}{4}\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{y=\ln\left(\frac{\sin 2x+1}{2}\right)}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Separate the variables", raw`Collect the \(y\)-terms with \(dy\) and the \(x\)-terms with \(dx\).`, raw`
          <div class="math-block">
            \[
            e^y\,dy=\cos(2x)\,dx.
            \]
          </div>
        `),
        guidedStep("Integrate both sides", raw`Reverse the chain rule for \(\cos(2x)\).`, raw`
          <div class="math-block">
            \[
            e^y=\frac12\sin(2x)+C.
            \]
          </div>
        `),
        guidedStep("Use the condition", raw`Substitute \(y=0\) and \(x=\frac{\pi}{4}\).`, raw`
          <div class="math-block">
            \[
            1=\frac12\sin\left(\frac{\pi}{2}\right)+C,
            \qquad C=\frac12.
            \]
          </div>
        `),
        guidedStep("Make y the subject", raw`Combine the terms, then take the natural logarithm.`, raw`
          <div class="math-block">
            \[
            e^y=\frac{\sin2x+1}{2}
            \quad\Longrightarrow\quad
            y=\ln\left(\frac{\sin2x+1}{2}\right).
            \]
          </div>
        `)
      ]
    }),

    "1e": createConfig("1e", "Question One - an exponential area proof", {
      focus: raw`Find the area in terms of \(e^k\), then use the fact that \(Q(k,k)\) lies on the curve.`,
      questionHtml: raw`
        <p class="step-text">The diagram shows the graph of</p>
        <div class="question-math">
          \[
          f(x)=\frac12(e^x-1).
          \]
        </div>
        <figure class="graph-frame question-graph-frame">
          <svg id="question-graph-1e-int-2018" class="graph-svg" viewBox="0 0 620 360" role="img" aria-labelledby="graph-1e-title graph-1e-desc"></svg>
        </figure>
        <p class="step-text">The point \(Q(k,k)\), where \(k>0\), lies on the curve. The shaded region is bounded by the curve, the \(x\)-axis, and the line \(x=k\).</p>
        <p class="step-text"><strong>Show that the shaded region has area \(\frac12k\).</strong></p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{A=\frac12k}
          \]
        </div>
        <p class="step-text question-note">The point condition replaces the exponential expression. There is no need to solve explicitly for \(k\).</p>
      `),
      afterRender: draw1eGraph,
      guidedSteps: [
        guidedStep("Set up the area", raw`Integrate the curve from the origin to the vertical boundary.`, raw`
          <div class="math-block">
            \[
            A=\int_0^k\frac12(e^x-1)\,dx.
            \]
          </div>
        `),
        guidedStep("Integrate and evaluate", raw`Keep the result exact and in terms of \(k\).`, raw`
          <div class="math-block">
            \[
            A=\left[\frac12e^x-\frac12x\right]_0^k
            =\frac12e^k-\frac12-\frac12k.
            \]
          </div>
        `),
        guidedStep("Use the point on the curve", raw`Because the coordinates of \(Q\) are \((k,k)\), its height is both \(f(k)\) and \(k\).`, raw`
          <div class="math-block">
            \[
            f(k)=k
            \quad\Longrightarrow\quad
            \frac12e^k-\frac12=k.
            \]
          </div>
        `),
        guidedStep("Substitute into the area", raw`Replace the matching exponential expression rather than trying to solve for \(k\).`, raw`
          <div class="math-block">
            \[
            A=\left(\frac12e^k-\frac12\right)-\frac12k
            =k-\frac12k=\frac12k.
            \]
          </div>
        `)
      ]
    }),

    "2a": createConfig("2a", "Question Two - reverse trigonometric derivatives", {
      focus: raw`Treat the two terms separately and look for the derivative of \(\sec(2x)\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find }\int\left(\sec^2x+\sec(2x)\tan(2x)\right)\,dx.
          \]
        </div>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{\tan x+\frac12\sec(2x)+C}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Recognise the derivatives", raw`One term is the derivative of \(\tan x\); the other is half the derivative of \(\sec(2x)\).`, raw`
          <div class="math-block">
            \[
            \int\sec^2x\,dx=\tan x,
            \qquad
            \frac{d}{dx}\sec(2x)=2\sec(2x)\tan(2x).
            \]
          </div>
        `),
        guidedStep("Combine the antiderivatives", raw`Divide the second reverse derivative by its inside factor of \(2\), then add \(C\).`, raw`
          <div class="math-block">
            \[
            \int\left(\sec^2x+\sec(2x)\tan(2x)\right)\,dx
            =\tan x+\frac12\sec(2x)+C.
            \]
          </div>
        `)
      ]
    }),

    "2b": createConfig("2b", "Question Two - finding an upper limit", {
      focus: raw`Integrate \(\sqrt{x}\), evaluate at both limits, then solve the resulting power equation.`,
      questionHtml: raw`
        <p class="step-text">Find the value of \(k\), given that</p>
        <div class="question-math">
          \[
          \int_1^k\sqrt{x}\,dx=\frac{52}{3}.
          \]
        </div>
        <p class="step-text question-note">The integration must be shown.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{k=9}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Write a power and integrate", raw`Use \(\sqrt{x}=x^{1/2}\) before applying the power rule.`, raw`
          <div class="math-block">
            \[
            \int_1^k x^{1/2}\,dx
            =\left[\frac23x^{3/2}\right]_1^k.
            \]
          </div>
        `),
        guidedStep("Evaluate the limits", raw`Set the evaluated integral equal to the given value.`, raw`
          <div class="math-block">
            \[
            \frac{52}{3}=\frac23k^{3/2}-\frac23
            \quad\Longrightarrow\quad
            k^{3/2}=27.
            \]
          </div>
        `),
        guidedStep("Solve for k", raw`Raise both sides to the power \(\frac23\).`, raw`
          <div class="math-block">
            \[
            k=27^{2/3}=\left(\sqrt[3]{27}\right)^2=9.
            \]
          </div>
        `)
      ]
    }),

    "2c": createConfig("2c", "Question Two - area between trigonometric curves", {
      focus: raw`Simplify the difference of the two squared trig functions before integrating.`,
      questionHtml: raw`
        <p class="step-text">The diagram shows the graphs of \(y=\cos^2x\) and \(y=\sin^2x\).</p>
        <figure class="graph-frame question-graph-frame">
          <svg id="question-graph-2c-int-2018" class="graph-svg" viewBox="0 0 660 360" role="img" aria-labelledby="graph-2c-title graph-2c-desc"></svg>
        </figure>
        <p class="step-text">Find the first positive value of \(k\) shown by the diagram such that</p>
        <div class="question-math">
          \[
          \int_0^k\left(\cos^2x-\sin^2x\right)\,dx=\frac12.
          \]
        </div>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{k=\frac{\pi}{4}}
          \]
        </div>
        <p class="step-text question-note">The diagram selects the first positive intersection, so later periodic solutions are not part of the stated shaded region.</p>
      `),
      afterRender: draw2cGraph,
      guidedSteps: [
        guidedStep("Use a double-angle identity", raw`The difference of the two squared functions is a single cosine.`, raw`
          <div class="math-block">
            \[
            \cos^2x-\sin^2x=\cos(2x).
            \]
          </div>
        `),
        guidedStep("Integrate", raw`Reverse the chain rule and keep the factor \(\frac12\).`, raw`
          <div class="math-block">
            \[
            \int_0^k\cos(2x)\,dx
            =\left[\frac12\sin(2x)\right]_0^k
            =\frac12\sin(2k).
            \]
          </div>
        `),
        guidedStep("Form the trig equation", raw`Equate the evaluated integral to the given area.`, raw`
          <div class="math-block">
            \[
            \frac12=\frac12\sin(2k)
            \quad\Longrightarrow\quad
            \sin(2k)=1.
            \]
          </div>
        `),
        guidedStep("Use the first positive intersection", raw`The pictured region ends at the first positive point where the curves meet.`, raw`
          <div class="math-block">
            \[
            2k=\frac{\pi}{2}
            \quad\Longrightarrow\quad
            k=\frac{\pi}{4}.
            \]
          </div>
        `)
      ]
    }),

    "2d": createConfig("2d", "Question Two - acceleration, velocity, and distance", {
      focus: raw`Integrate acceleration to find velocity, use the given velocity, then integrate velocity over the first eight seconds.`,
      questionHtml: raw`
        <p class="step-text">An object's acceleration is modelled by</p>
        <div class="question-math">
          \[
          a(t)=\frac{2}{\sqrt{t+1}},\qquad t\ge0,
          \]
        </div>
        <p class="step-text">where acceleration is measured in \(\text{m s}^{-2}\) and \(t\) is measured in seconds. The object has velocity \(9\text{ m s}^{-1}\) when \(t=3\).</p>
        <p class="step-text"><strong>How far did the object travel during the first eight seconds?</strong></p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{D=\frac{232}{3}\text{ m}\approx77.33\text{ m}}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Integrate acceleration", raw`Acceleration is the derivative of velocity.`, raw`
          <div class="math-block">
            \[
            v(t)=\int2(t+1)^{-1/2}\,dt=4\sqrt{t+1}+C.
            \]
          </div>
        `),
        guidedStep("Use the given velocity", raw`Substitute \(t=3\) and \(v=9\).`, raw`
          <div class="math-block">
            \[
            9=4\sqrt4+C=8+C
            \quad\Longrightarrow\quad C=1,
            \]
            \[
            v(t)=4\sqrt{t+1}+1.
            \]
          </div>
        `),
        guidedStep("Set up the distance", raw`This velocity is positive for \(t\ge0\), so distance equals the integral of velocity.`, raw`
          <div class="math-block">
            \[
            D=\int_0^8\left(4\sqrt{t+1}+1\right)\,dt.
            \]
          </div>
        `),
        guidedStep("Evaluate the distance", raw`Integrate the shifted power, then apply the limits.`, raw`
          <div class="math-block">
            \[
            D=\left[\frac83(t+1)^{3/2}+t\right]_0^8
            =80-\frac83=\frac{232}{3}\text{ m}.
            \]
          </div>
        `)
      ]
    }),

    "2e": createConfig("2e", "Question Two - an exponential candle model", {
      focus: raw`Separate the variables to build the mass model, then use the two measured masses before solving for the target time.`,
      questionHtml: raw`
        <p class="step-text">The mass \(m\) grams of a burning candle \(t\) hours after it was first lit is modelled by</p>
        <div class="question-math">
          \[
          \frac{dm}{dt}=-k(m-10),
          \]
        </div>
        <p class="step-text">where \(k>0\) and \(m\ge10\). The candle initially had mass \(140\) grams. After three hours its mass had halved.</p>
        <p class="step-text"><strong>Find the time from when the candle was first lit for its mass to reduce to \(50\) grams.</strong></p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{t=\frac{3\ln(13/4)}{\ln(13/6)}\approx4.573\text{ hours}}
          \]
        </div>
        <p class="step-text question-note">This is the total time since the candle was first lit, not an additional time after the three-hour measurement.</p>
      `),
      guidedSteps: [
        guidedStep("Separate and integrate", raw`Move \(m-10\) to the left before integrating.`, raw`
          <div class="math-block">
            \[
            \frac{1}{m-10}\,dm=-k\,dt
            \quad\Longrightarrow\quad
            \ln|m-10|=-kt+C.
            \]
          </div>
        `),
        guidedStep("Write the mass model", raw`Exponentiating gives an exponential term with a new constant.`, raw`
          <div class="math-block">
            \[
            m=10+Ae^{-kt}.
            \]
          </div>
        `),
        guidedStep("Use the initial mass", raw`At \(t=0\), the mass is \(140\) grams.`, raw`
          <div class="math-block">
            \[
            140=10+A
            \quad\Longrightarrow\quad A=130,
            \]
            \[
            m=10+130e^{-kt}.
            \]
          </div>
        `),
        guidedStep("Find k from the halved mass", raw`After three hours the mass is \(70\) grams.`, raw`
          <div class="math-block">
            \[
            70=10+130e^{-3k}
            \quad\Longrightarrow\quad
            e^{-3k}=\frac6{13},
            \]
            \[
            k=\frac13\ln\left(\frac{13}{6}\right).
            \]
          </div>
        `),
        guidedStep("Solve for the 50-gram time", raw`Substitute \(m=50\), then use the exact value of \(k\).`, raw`
          <div class="math-block">
            \[
            50=10+130e^{-kt}
            \quad\Longrightarrow\quad
            e^{-kt}=\frac4{13},
            \]
            \[
            t=\frac{\ln(13/4)}{k}
            =\frac{3\ln(13/4)}{\ln(13/6)}.
            \]
          </div>
        `)
      ]
    }),

    "3a": createConfig("3a", "Question Three - expansion and logarithmic integration", {
      focus: raw`Expand \((4x)^2\), then integrate the polynomial and reciprocal terms separately.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find }\int\left((4x)^2+4x+\frac4x\right)\,dx.
          \]
        </div>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{\frac{16x^3}{3}+2x^2+4\ln|x|+C}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Expand the square", raw`Square both the coefficient and the variable.`, raw`
          <div class="math-block">
            \[
            (4x)^2=16x^2,
            \]
            \[
            \int\left((4x)^2+4x+\frac4x\right)\,dx
            =\int\left(16x^2+4x+\frac4x\right)\,dx.
            \]
          </div>
        `),
        guidedStep("Integrate term by term", raw`Use the power rule for the first two terms and the logarithm rule for \(4/x\).`, raw`
          <div class="math-block">
            \[
            \int16x^2\,dx=\frac{16x^3}{3},
            \quad
            \int4x\,dx=2x^2,
            \quad
            \int\frac4x\,dx=4\ln|x|.
            \]
          </div>
        `),
        guidedStep("Combine the result", raw`Add one constant of integration after combining the antiderivatives.`, raw`
          <div class="math-block">
            \[
            \frac{16x^3}{3}+2x^2+4\ln|x|+C.
            \]
          </div>
        `)
      ]
    }),

    "3b": createConfig("3b", "Question Three - Simpson's Rule", {
      focus: raw`There are six equal subintervals, so apply the \(1,4,2,4,2,4,1\) Simpson coefficient pattern.`,
      questionHtml: raw`
        <p class="step-text">Use the values in the table to approximate \(\int_0^3 f(x)\,dx\) using Simpson's Rule.</p>
        <div class="table-wrap">
          <table class="question-data-table">
            <caption class="visually-hidden">Values of x and f of x from zero to three in steps of one half</caption>
            <thead>
              <tr>
                <th scope="col">\(x\)</th>
                <th scope="col">\(0\)</th>
                <th scope="col">\(0.5\)</th>
                <th scope="col">\(1\)</th>
                <th scope="col">\(1.5\)</th>
                <th scope="col">\(2\)</th>
                <th scope="col">\(2.5\)</th>
                <th scope="col">\(3\)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">\(f(x)\)</th>
                <td>\(0.3\)</td>
                <td>\(0.75\)</td>
                <td>\(1.1\)</td>
                <td>\(1.35\)</td>
                <td>\(1.6\)</td>
                <td>\(1.15\)</td>
                <td>\(0.5\)</td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{3.2}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Find the interval width", raw`Consecutive \(x\)-values are separated by the same amount.`, raw`
          <div class="math-block">
            \[
            h=0.5,
            \qquad n=6\text{ subintervals}.
            \]
          </div>
        `),
        guidedStep("Assign Simpson coefficients", raw`Count the endpoints once, the odd-position interior values four times, and the even-position interior values twice.`, raw`
          <div class="math-block">
            \[
            1,\ 4,\ 2,\ 4,\ 2,\ 4,\ 1.
            \]
            \[
            \frac{0.5}{3}\left[0.3+0.5+4(0.75+1.35+1.15)+2(1.1+1.6)\right].
            \]
          </div>
        `),
        guidedStep("Evaluate the approximation", raw`Add the weighted groups, then multiply by \(h/3\).`, raw`
          <div class="math-block">
            \[
            \frac{0.5}{3}\left[0.8+4(3.25)+2(2.7)\right]
            =\frac{0.5}{3}(19.2)=3.2.
            \]
          </div>
        `)
      ]
    }),

    "3c": createConfig("3c", "Question Three - an unknown exponential limit", {
      focus: raw`Integrate the exponential, evaluate at zero and \(k\), then use logarithms to isolate \(k\).`,
      questionHtml: raw`
        <p class="step-text">Find the value of \(k\), given that</p>
        <div class="question-math">
          \[
          \int_0^k3e^{0.5x}\,dx=75.
          \]
        </div>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{k=2\ln(13.5)\approx5.205}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Integrate the exponential", raw`Divide by the inside coefficient \(0.5\).`, raw`
          <div class="math-block">
            \[
            \int3e^{0.5x}\,dx=\frac3{0.5}e^{0.5x}=6e^{0.5x}.
            \]
          </div>
        `),
        guidedStep("Evaluate the limits", raw`Apply the fundamental theorem and set the result equal to \(75\).`, raw`
          <div class="math-block">
            \[
            75=\left[6e^{0.5x}\right]_0^k
            =6e^{0.5k}-6,
            \]
            \[
            e^{0.5k}=13.5.
            \]
          </div>
        `),
        guidedStep("Take natural logarithms", raw`Use \(\ln(e^{0.5k})=0.5k\), then multiply by two.`, raw`
          <div class="math-block">
            \[
            0.5k=\ln(13.5)
            \quad\Longrightarrow\quad
            k=2\ln(13.5).
            \]
          </div>
        `)
      ]
    }),

    "3d": createConfig("3d", "Question Three - area between two curves", {
      focus: raw`Find both intersections, decide which curve is on top, then integrate top minus bottom.`,
      questionHtml: raw`
        <p class="step-text">The diagram shows the graphs of \(y=x^2\) and \(y=\sqrt[3]{x}\).</p>
        <figure class="graph-frame question-graph-frame">
          <svg id="question-graph-3d-int-2018" class="graph-svg" viewBox="0 0 620 360" role="img" aria-labelledby="graph-3d-title graph-3d-desc"></svg>
        </figure>
        <p class="step-text"><strong>Find the area of the shaded region between the graphs.</strong></p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{\frac5{12}\text{ square units}}
          \]
        </div>
      `),
      afterRender: draw3dGraph,
      guidedSteps: [
        guidedStep("Find the intersections", raw`Set the two function values equal.`, raw`
          <div class="math-block">
            \[
            x^2=x^{1/3}
            \quad\Longrightarrow\quad
            x^6=x,
            \]
            \[
            x(x^5-1)=0.
            \]
          </div>
        `),
        guidedStep("Use the enclosed-region limits", raw`The pictured first-quadrant region is enclosed by the two non-negative intersections.`, raw`
          <div class="math-block">
            \[
            x=0\quad\text{and}\quad x=1.
            \]
          </div>
        `),
        guidedStep("Set up top minus bottom", raw`On \(0<x<1\), the cube-root curve lies above the parabola.`, raw`
          <div class="math-block">
            \[
            A=\int_0^1\left(x^{1/3}-x^2\right)\,dx.
            \]
          </div>
        `),
        guidedStep("Integrate and evaluate", raw`Apply the power rule to both terms.`, raw`
          <div class="math-block">
            \[
            A=\left[\frac34x^{4/3}-\frac13x^3\right]_0^1
            =\frac34-\frac13=\frac5{12}.
            \]
          </div>
        `)
      ]
    }),

    "3e": createConfig("3e", "Question Three - a curve, tangent, and axis", {
      focus: raw`Find the tangent at \(Q\), then subtract the area under that tangent from the area under the curve.`,
      questionHtml: raw`
        <p class="step-text">The diagram shows the graph of</p>
        <div class="question-math">
          \[
          f(x)=(2x-1)^4.
          \]
        </div>
        <figure class="graph-frame question-graph-frame">
          <svg id="question-graph-3e-int-2018" class="graph-svg" viewBox="0 0 680 390" role="img" aria-labelledby="graph-3e-title graph-3e-desc"></svg>
        </figure>
        <p class="step-text">The curve meets the \(x\)-axis at \(P\), and the line shown is tangent to the curve at \(Q(1,1)\).</p>
        <p class="step-text"><strong>Find the area bounded by the curve, the \(x\)-axis, and the tangent at \(Q\).</strong></p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{\frac3{80}\text{ square units}}
          \]
        </div>
      `),
      afterRender: draw3eGraph,
      guidedSteps: [
        guidedStep("Find the tangent gradient", raw`Differentiate the quartic using the chain rule, then substitute \(x=1\).`, raw`
          <div class="math-block">
            \[
            f'(x)=8(2x-1)^3,
            \qquad f'(1)=8.
            \]
          </div>
        `),
        guidedStep("Write the tangent and its intercept", raw`Use point-gradient form through \(Q(1,1)\), then set \(y=0\).`, raw`
          <div class="math-block">
            \[
            y-1=8(x-1)
            \quad\Longrightarrow\quad y=8x-7,
            \]
            \[
            0=8x-7
            \quad\Longrightarrow\quad x=\frac78.
            \]
          </div>
        `),
        guidedStep("Find the area under the curve", raw`The curve meets the \(x\)-axis at \(P=(\frac12,0)\). Integrate from \(P\) to \(Q\).`, raw`
          <div class="math-block">
            \[
            \int_{1/2}^{1}(2x-1)^4\,dx
            =\left[\frac{(2x-1)^5}{10}\right]_{1/2}^{1}
            =\frac1{10}.
            \]
          </div>
        `),
        guidedStep("Find the area under the tangent", raw`Only the portion of the tangent above the \(x\)-axis, from \(\frac78\) to \(1\), is inside the area under the curve.`, raw`
          <div class="math-block">
            \[
            \int_{7/8}^{1}(8x-7)\,dx
            =\left[4x^2-7x\right]_{7/8}^{1}
            =\frac1{16}.
            \]
          </div>
        `),
        guidedStep("Subtract the triangular portion", raw`The requested boundary follows the tangent rather than the \(x\)-axis from \(\frac78\) to \(1\), so remove the area beneath the tangent from the full area beneath the curve.`, raw`
          <div class="math-block">
            \[
            A=\frac1{10}-\frac1{16}
            =\frac{8-5}{80}=\frac3{80}.
            \]
          </div>
        `)
      ]
    })
  };
}());
