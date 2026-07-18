(function () {
  const raw = String.raw;
  const paperHref = "level-3-integration-2022.html";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return "int-" + id + "2022.html";
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
      browserTitle: "2022 Integration Paper — " + questionLabel(id),
      eyebrow: "Level 3 Integration Walkthrough",
      title: questionLabel(id),
      subtitle: subtitle,
      backHref: paperHref,
      nextHref: next ? pageHref(next) : paperHref,
      nextLabel: next ? "Next question →" : "Back to paper",
      finalNav: buildFinalNav(id)
    }, details);
  }

  function guidedStep(title, previewHtml, workingHtml) {
    return {
      title: title,
      previewHtml: previewHtml,
      workingHtml: workingHtml
    };
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

    if (step <= 0) {
      return points;
    }

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

    if (!points.length) {
      return "";
    }

    let path = "M " + scale.x(start) + " " + scale.y(baseline);

    points.forEach(function (point) {
      path += " L " + scale.x(point[0]) + " " + scale.y(point[1]);
    });

    path += " L " + scale.x(end) + " " + scale.y(baseline) + " Z";
    return path;
  }

  function areaBetweenCurvesPath(topFn, bottomFn, start, end, step, scale) {
    const topPoints = functionPoints(topFn, start, end, step);
    const bottomPoints = functionPoints(bottomFn, start, end, step).reverse();

    if (!topPoints.length || !bottomPoints.length) {
      return "";
    }

    let path = "M " + scale.x(topPoints[0][0]) + " " + scale.y(topPoints[0][1]);

    topPoints.slice(1).forEach(function (point) {
      path += " L " + scale.x(point[0]) + " " + scale.y(point[1]);
    });

    bottomPoints.forEach(function (point) {
      path += " L " + scale.x(point[0]) + " " + scale.y(point[1]);
    });

    path += " Z";
    return path;
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

  function draw1bGraph() {
    const svg = document.getElementById("question-graph-1b-int-2022");

    if (!svg) {
      return;
    }

    const width = 460;
    const height = 320;
    const padding = 28;
    const root = Math.sqrt(2.4);
    const scale = createScale(width, height, padding, -3.75, 3.75, -2.6, 3.8);
    const fn = function (x) {
      return 0.13 * (x * x - 9) * (x * x - 2.4);
    };

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -3.75, 0, 3.75, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -2.6, 0, 3.8, "graph-axis")}
      <path class="question-shade" d="${areaBetweenCurvesPath(function () { return 0; }, fn, -3, -root, 0.02, scale)}"></path>
      <path class="question-shade" d="${areaBetweenCurvesPath(fn, function () { return 0; }, 0, root, 0.02, scale)}"></path>
      <path class="question-curve" d="${functionPath(fn, -3.55, 3.55, 0.02, scale)}"></path>
      ${circleMarkup(scale, 0, 0, 7, "question-origin")}
      ${textMarkup(scale, 3.63, -0.16, "x", "question-axis-label")}
      ${textMarkup(scale, -0.08, 3.65, "y", "question-axis-label", ' text-anchor="middle"')}
      ${textMarkup(scale, -3, -0.18, "−3", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 3, -0.18, "3", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 0.55, 1.1, "4.4", "graph-equation-label")}
      ${textMarkup(scale, -2.55, -0.58, "1.2", "graph-equation-label")}
      ${textMarkup(scale, 0.22, 3.1, "y = f(x)", "graph-equation-label")}
      <rect class="graph-chip" x="320" y="28" width="112" height="42" rx="12"></rect>
      <text class="graph-label" x="376" y="46" text-anchor="middle">Diagram is</text>
      <text class="graph-label" x="376" y="63" text-anchor="middle">not to scale</text>
    `;
  }

  function draw1dGraph() {
    const svg = document.getElementById("question-graph-1d-int-2022");

    if (!svg) {
      return;
    }

    const width = 460;
    const height = 300;
    const padding = 30;
    const displayK = 5.6;
    const scale = createScale(width, height, padding, 0, 6.8, 0, 5.2);
    const fn = function (x) {
      return 4 / Math.sqrt(3 * x - 2);
    };

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, 0, 0, 6.8, 0, "graph-axis")}
      ${lineMarkup(scale, 0, 0, 0, 5.2, "graph-axis")}
      <path class="question-shade" d="${areaUnderCurvePath(fn, 1, displayK, 0, 0.02, scale)}"></path>
      <path class="question-curve" d="${functionPath(fn, 0.7, 6.6, 0.02, scale)}"></path>
      ${lineMarkup(scale, 1, 0, 1, fn(1), "graph-guide")}
      ${lineMarkup(scale, displayK, 0, displayK, fn(displayK), "graph-guide")}
      ${textMarkup(scale, 1, -0.15, "1", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, displayK, -0.15, "k", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 6.68, -0.12, "x", "question-axis-label")}
      ${textMarkup(scale, -0.06, 5.05, "y", "question-axis-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 4.3, 3.6, "y = 4 / √(3x − 2)", "graph-equation-label", ' text-anchor="middle"')}
      <rect class="graph-chip" x="318" y="36" width="112" height="42" rx="12"></rect>
      <text class="graph-label" x="374" y="54" text-anchor="middle">Diagram is</text>
      <text class="graph-label" x="374" y="71" text-anchor="middle">not to scale</text>
    `;
  }

  function draw1eGraph() {
    const svg = document.getElementById("question-graph-1e-int-2022");

    if (!svg) {
      return;
    }

    const width = 500;
    const height = 320;
    const padding = 30;
    const intersection = Math.log(5);
    const scale = createScale(width, height, padding, -0.55, 1.95, 0, 29);
    const topFn = function (x) {
      return 3 * Math.exp(x) + 10;
    };
    const bottomFn = function (x) {
      return Math.exp(2 * x);
    };

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -0.55, 0, 1.95, 0, "graph-axis")}
      ${lineMarkup(scale, 0, 0, 0, 29, "graph-axis")}
      <path class="question-shade" d="${areaBetweenCurvesPath(topFn, bottomFn, 0, intersection, 0.01, scale)}"></path>
      <path class="graph-curve-secondary" d="${functionPath(topFn, -0.45, 1.8, 0.01, scale)}"></path>
      <path class="question-curve" d="${functionPath(bottomFn, -0.45, 1.8, 0.01, scale)}"></path>
      ${textMarkup(scale, 1.94, -0.3, "x", "question-axis-label", ' text-anchor="end"')}
      ${textMarkup(scale, -0.05, 28.6, "y", "question-axis-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 0.55, 14.8, "y = 3e^x + 10", "graph-equation-label")}
      ${textMarkup(scale, 1.28, 7.6, "y = (e^x)^2", "graph-equation-label")}
    `;
  }

  function draw3dGraph() {
    const svg = document.getElementById("question-graph-3d-int-2022");

    if (!svg) {
      return;
    }

    const width = 470;
    const height = 320;
    const padding = 34;
    const scale = createScale(width, height, padding, -2.15, 2.15, -2.35, 2.35);
    const curveFn = function (x) {
      return x + Math.cos(x);
    };
    const lineFn = function (x) {
      return x;
    };

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -2.15, 0, 2.15, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -2.35, 0, 2.35, "graph-axis")}
      <path class="question-shade" d="${areaBetweenCurvesPath(curveFn, lineFn, -Math.PI / 2, Math.PI / 2, 0.01, scale)}"></path>
      <path class="question-curve" d="${functionPath(curveFn, -1.95, 1.95, 0.01, scale)}"></path>
      <path class="graph-curve-secondary" d="${functionPath(lineFn, -1.95, 1.95, 0.01, scale)}"></path>
      ${circleMarkup(scale, 0, 0, 7, "question-origin")}
      ${textMarkup(scale, 2.1, -0.18, "x", "question-axis-label")}
      ${textMarkup(scale, 0.02, 2.2, "y", "question-axis-label", ' text-anchor="middle"')}
      ${textMarkup(scale, -1.4, -1.72, "y = x", "graph-equation-label")}
      ${textMarkup(scale, 0.64, 1.3, "y = x + cos x", "graph-equation-label")}
    `;
  }

  function draw3eGraph() {
    const svg = document.getElementById("question-graph-3e-int-2022");

    if (!svg) {
      return;
    }

    const width = 460;
    const height = 320;
    const padding = 32;
    const sampleK = 1;
    const scale = createScale(width, height, padding, 0, 4.35, 0, 2.85);
    const fn = function (x) {
      return 2 / x;
    };

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, 0, 0, 4.35, 0, "graph-axis")}
      ${lineMarkup(scale, 0, 0, 0, 2.85, "graph-axis")}
      <path class="question-shade" d="${areaBetweenCurvesPath(function () { return 2; }, fn, sampleK, 3 * sampleK, 0.01, scale)}"></path>
      <path class="question-curve" d="${functionPath(fn, 0.72, 4.1, 0.01, scale)}"></path>
      ${lineMarkup(scale, sampleK, 0, sampleK, 2, "graph-guide")}
      ${lineMarkup(scale, 3 * sampleK, 0, 3 * sampleK, 2, "graph-guide")}
      ${lineMarkup(scale, sampleK, 2, 3 * sampleK, 2, "graph-guide")}
      ${textMarkup(scale, sampleK, -0.16, "k", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 3 * sampleK, -0.16, "3k", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, sampleK + 0.08, 2.08, "P", "graph-equation-label")}
      ${textMarkup(scale, 3 * sampleK + 0.08, fn(3 * sampleK) + 0.05, "Q", "graph-equation-label")}
      ${textMarkup(scale, 3 * sampleK + 0.08, 2.08, "R", "graph-equation-label")}
      ${textMarkup(scale, 4.22, -0.12, "x", "question-axis-label")}
      ${textMarkup(scale, -0.04, 2.72, "y", "question-axis-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 0.95, 2.42, "y = 2 / x", "graph-equation-label")}
    `;
  }

  window.Integration2022Walkthroughs = {
    "1a": createConfig("1a", "2022 Paper — Splitting a logarithm and trig antiderivative", {
      focus: raw`Split the integrand into two familiar pieces before integrating.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find } \int \left(\frac{4}{x}-\sec^2 x\right)\,dx.
          \]
        </div>
      `,
      answerHtml: raw`
        <p class="step-text">Final answer:</p>
        <div class="math-block">
          \[
          \int \left(\frac{4}{x}-\sec^2 x\right)\,dx
          =
          4\ln|x|-\tan x+C
          \]
        </div>
      `,
      guidedSteps: [
        guidedStep("Split the integrand", raw`Each term already matches a standard antiderivative, so it is easier to integrate them separately.`, raw`
          <div class="math-block">
            \[
            \int \left(\frac{4}{x}-\sec^2 x\right)\,dx
            =
            \int \frac{4}{x}\,dx-\int \sec^2 x\,dx
            \]
          </div>
        `),
        guidedStep("Integrate the logarithm term", raw`The \(\frac{1}{x}\) pattern integrates to a logarithm.`, raw`
          <div class="math-block">
            \[
            \int \frac{4}{x}\,dx
            =
            4\int \frac{1}{x}\,dx
            =
            4\ln|x|
            \]
          </div>
        `),
        guidedStep("Integrate the trig term", raw`Because \(\frac{d}{dx}(\tan x)=\sec^2 x\), the second antiderivative is immediate.`, raw`
          <div class="math-block">
            \[
            \int \sec^2 x\,dx=\tan x
            \]
            \[
            -\int \sec^2 x\,dx=-\tan x
            \]
          </div>
        `),
        guidedStep("Combine the result", raw`Add the two antiderivatives and include the constant of integration once at the end.`, raw`
          <div class="math-block">
            \[
            \int \left(\frac{4}{x}-\sec^2 x\right)\,dx
            =
            4\ln|x|-\tan x+C
            \]
          </div>
        `)
      ]
    }),
    "1b": createConfig("1b", "2022 Paper — Symmetry and signed area", {
      focus: raw`Use the graph's symmetry, then count regions above the axis as positive and below the axis as negative.`,
      questionHtml: raw`
        <p class="step-text">The graph of the function \(y=f(x)\) below is symmetrical about the \(y\)-axis. The shaded areas are given.</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-1b-int-2022" class="graph-svg" viewBox="0 0 460 320" aria-label="Symmetrical graph of y equals f of x with shaded areas 4.4 and 1.2" role="img"></svg>
        </div>
        <div class="question-math">
          \[
          \text{Find } \int_{-3}^{3} f(x)\,dx.
          \]
        </div>
      `,
      questionNotes: [
        raw`Think of the definite integral as signed area.`
      ],
      answerHtml: raw`
        <p class="step-text">Use symmetry and signed area:</p>
        <div class="math-block">
          \[
          \int_{-3}^{3} f(x)\,dx
          =
          2(4.4)-2(1.2)
          =
          8.8-2.4
          =
          6.4
          \]
        </div>
        <p class="step-text">So the value of the integral is \(6.4\).</p>
      `,
      afterRender: draw1bGraph,
      guidedSteps: [
        guidedStep("Use the symmetry", raw`The graph is even-looking about the \(y\)-axis, so each shaded region has a matching partner on the other side.`, raw`
          <p class="step-text">The central shaded region labelled \(4.4\) appears on both sides of the \(y\)-axis.</p>
          <p class="step-text">The lower shaded region labelled \(1.2\) also appears on both sides of the \(y\)-axis.</p>
        `),
        guidedStep("Track the sign of each region", raw`Area above the \(x\)-axis contributes positively, while area below the \(x\)-axis contributes negatively.`, raw`
          <div class="math-block">
            \[
            \text{positive contribution}=2(4.4)
            \]
            \[
            \text{negative contribution}=2(1.2)
            \]
          </div>
        `),
        guidedStep("Form the definite integral", raw`The integral over the full interval is positive area minus negative area.`, raw`
          <div class="math-block">
            \[
            \int_{-3}^{3} f(x)\,dx
            =
            2(4.4)-2(1.2)
            \]
            \[
            =8.8-2.4
            \]
            \[
            =6.4
            \]
          </div>
        `)
      ]
    }),
    "1c": createConfig("1c", "2022 Paper — Product-to-sum for sine squared", {
      focus: raw`Convert \(\sin^2(2x)\) into a cosine expression first, then the definite integral becomes straightforward.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find } \int_{0}^{\pi/4} \sin^2(2x)\,dx.
          \]
        </div>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: raw`
        <p class="step-text">Use the identity \(\sin^2\theta=\frac{1}{2}(1-\cos 2\theta)\):</p>
        <div class="math-block">
          \[
          \sin^2(2x)=\frac{1}{2}(1-\cos 4x)
          \]
          \[
          \int_{0}^{\pi/4}\sin^2(2x)\,dx
          =
          \left[\frac{x}{2}-\frac{\sin 4x}{8}\right]_{0}^{\pi/4}
          \]
          \[
          =
          \frac{\pi}{8}
          \]
        </div>
      `,
      guidedSteps: [
        guidedStep("Rewrite the trig square", raw`A squared sine is awkward to integrate directly, so start by using a standard identity.`, raw`
          <div class="math-block">
            \[
            \sin^2(2x)=\frac{1}{2}(1-\cos 4x)
            \]
          </div>
        `),
        guidedStep("Integrate term by term", raw`Once rewritten, the integral is just a constant term and a cosine term.`, raw`
          <div class="math-block">
            \[
            \int_{0}^{\pi/4}\sin^2(2x)\,dx
            =
            \int_{0}^{\pi/4}\left(\frac{1}{2}-\frac{1}{2}\cos 4x\right)\,dx
            \]
            \[
            =
            \left[\frac{x}{2}-\frac{\sin 4x}{8}\right]_{0}^{\pi/4}
            \]
          </div>
        `),
        guidedStep("Evaluate the bounds", raw`At both endpoints the sine term disappears, so only the linear term remains.`, raw`
          <div class="math-block">
            \[
            \left[\frac{x}{2}-\frac{\sin 4x}{8}\right]_{0}^{\pi/4}
            =
            \left(\frac{\pi}{8}-\frac{\sin \pi}{8}\right)-\left(0-\frac{\sin 0}{8}\right)
            \]
            \[
            =
            \frac{\pi}{8}
            \]
          </div>
        `)
      ]
    }),
    "1d": createConfig("1d", "2022 Paper — Area under a radical curve", {
      focus: raw`Because the curve stays above the axis, the shaded area is the definite integral from \(x=1\) to \(x=k\).`,
      questionHtml: raw`
        <p class="step-text">The graph below shows part of the function \(y=\frac{4}{\sqrt{3x-2}}\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-1d-int-2022" class="graph-svg" viewBox="0 0 460 300" aria-label="Area under y equals four over square root of three x minus two from x equals 1 to x equals k" role="img"></svg>
        </div>
        <p class="step-text">Find the value of \(k\) such that the shaded region has an area of \(8\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: raw`
        <p class="step-text">Set the area equal to \(8\):</p>
        <div class="math-block">
          \[
          \int_{1}^{k}\frac{4}{\sqrt{3x-2}}\,dx=8
          \]
          \[
          \left[\frac{8}{3}\sqrt{3x-2}\right]_{1}^{k}=8
          \]
          \[
          \frac{8}{3}\bigl(\sqrt{3k-2}-1\bigr)=8
          \]
          \[
          \sqrt{3k-2}=4
          \]
          \[
          3k-2=16
          \]
          \[
          k=6
          \]
        </div>
      `,
      afterRender: draw1dGraph,
      guidedSteps: [
        guidedStep("Set up the area equation", raw`The function is positive on the shaded interval, so ordinary area and signed area are the same here.`, raw`
          <div class="math-block">
            \[
            \int_{1}^{k}\frac{4}{\sqrt{3x-2}}\,dx=8
            \]
          </div>
        `),
        guidedStep("Find the antiderivative", raw`Rewrite the denominator as a power so the reverse chain rule is easier to see.`, raw`
          <div class="math-block">
            \[
            \frac{4}{\sqrt{3x-2}}=4(3x-2)^{-1/2}
            \]
            \[
            \int 4(3x-2)^{-1/2}\,dx=\frac{8}{3}(3x-2)^{1/2}+C
            \]
            \[
            =\frac{8}{3}\sqrt{3x-2}+C
            \]
          </div>
        `),
        guidedStep("Apply the bounds", raw`Substitute \(x=k\) and \(x=1\), then use the stated area of \(8\).`, raw`
          <div class="math-block">
            \[
            \left[\frac{8}{3}\sqrt{3x-2}\right]_{1}^{k}=8
            \]
            \[
            \frac{8}{3}\sqrt{3k-2}-\frac{8}{3}\sqrt{1}=8
            \]
            \[
            \frac{8}{3}\bigl(\sqrt{3k-2}-1\bigr)=8
            \]
          </div>
        `),
        guidedStep("Solve for k", raw`Now it is just algebra: isolate the root, square both sides, and solve the linear equation.`, raw`
          <div class="math-block">
            \[
            \sqrt{3k-2}-1=3
            \]
            \[
            \sqrt{3k-2}=4
            \]
            \[
            3k-2=16
            \]
            \[
            3k=18
            \]
            \[
            k=6
            \]
          </div>
        `)
      ]
    }),
    "1e": createConfig("1e", "2022 Paper — Exact area between exponential curves", {
      focus: raw`Find the intersection first, then integrate top minus bottom from the \(y\)-axis to that point.`,
      questionHtml: raw`
        <p class="step-text">The graph below shows the functions \(y=(e^x)^2\) and \(y=3e^x+10\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-1e-int-2022" class="graph-svg" viewBox="0 0 500 320" aria-label="Shaded region between y equals e to the two x and y equals three e to the x plus ten from x equals 0 to their intersection" role="img"></svg>
        </div>
        <p class="step-text">Find the exact value of the shaded area.</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: raw`
        <p class="step-text">The intersection satisfies</p>
        <div class="math-block">
          \[
          e^{2x}=3e^x+10
          \]
          \[
          e^x=5
          \Rightarrow
          x=\ln 5
          \]
        </div>
        <p class="step-text">On \(0 \le x \le \ln 5\), the upper curve is \(y=3e^x+10\) and the lower curve is \(y=e^{2x}\). So</p>
        <div class="math-block">
          \[
          A=\int_{0}^{\ln 5}\left(3e^x+10-e^{2x}\right)\,dx
          \]
          \[
          A=\left[3e^x+10x-\frac{e^{2x}}{2}\right]_{0}^{\ln 5}
          \]
          \[
          =
          \left(15+10\ln 5-\frac{25}{2}\right)-\left(3-\frac{1}{2}\right)
          \]
          \[
          =10\ln 5
          \]
        </div>
      `,
      afterRender: draw1eGraph,
      guidedSteps: [
        guidedStep("Find the intersection", raw`You need the right-hand limit of the shaded region, so solve where the two curves meet.`, raw`
          <div class="math-block">
            \[
            e^{2x}=3e^x+10
            \]
            \[
            \text{Let }u=e^x
            \]
            \[
            u^2=3u+10
            \]
            \[
            u^2-3u-10=0
            \]
            \[
            (u-5)(u+2)=0
            \]
            \[
            u=5 \quad (\text{since }e^x>0)
            \]
            \[
            e^x=5
            \Rightarrow
            x=\ln 5
            \]
          </div>
        `),
        guidedStep("Choose top minus bottom", raw`Area between curves is found by upper function minus lower function, and the left limit is the \(y\)-axis at \(x=0\).`, raw`
          <p class="step-text">At \(x=0\), \(3e^x+10=13\) while \(e^{2x}=1\), so \(3e^x+10\) is above \(e^{2x}\) over the shaded region.</p>
          <div class="math-block">
            \[
            A=\int_{0}^{\ln 5}\left(3e^x+10-e^{2x}\right)\,dx
            \]
          </div>
        `),
        guidedStep("Integrate the difference", raw`Now integrate each term exactly before substituting the bounds.`, raw`
          <div class="math-block">
            \[
            \int \left(3e^x+10-e^{2x}\right)\,dx
            =
            3e^x+10x-\frac{e^{2x}}{2}+C
            \]
          </div>
        `),
        guidedStep("Evaluate exactly", raw`Use \(e^{\ln 5}=5\) and \(e^{2\ln 5}=25\) to keep the final answer exact.`, raw`
          <div class="math-block">
            \[
            A=\left[3e^x+10x-\frac{e^{2x}}{2}\right]_{0}^{\ln 5}
            \]
            \[
            =
            \left(15+10\ln 5-\frac{25}{2}\right)-\left(3-\frac{1}{2}\right)
            \]
            \[
            =
            \left(\frac{30}{2}-\frac{25}{2}\right)+10\ln 5-\frac{5}{2}
            \]
            \[
            =
            10\ln 5
            \]
          </div>
        `)
      ]
    }),
    "2a": createConfig("2a", "2022 Paper — Integrating an exponential and a root", {
      focus: raw`Rewrite the square root as a power, then integrate each term separately.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find } \int \left(e^{3x}-\sqrt{x}\right)\,dx.
          \]
        </div>
      `,
      answerHtml: raw`
        <div class="math-block">
          \[
          \int \left(e^{3x}-\sqrt{x}\right)\,dx
          =
          \frac{e^{3x}}{3}-\frac{2}{3}x^{3/2}+C
          \]
        </div>
      `,
      guidedSteps: [
        guidedStep("Rewrite the square root", raw`A power is easier to integrate than a radical symbol.`, raw`
          <div class="math-block">
            \[
            \sqrt{x}=x^{1/2}
            \]
            \[
            \int \left(e^{3x}-\sqrt{x}\right)\,dx
            =
            \int \left(e^{3x}-x^{1/2}\right)\,dx
            \]
          </div>
        `),
        guidedStep("Integrate each term", raw`Use the reverse chain rule for \(e^{3x}\) and the power rule for \(x^{1/2}\).`, raw`
          <div class="math-block">
            \[
            \int e^{3x}\,dx=\frac{e^{3x}}{3}
            \]
            \[
            \int x^{1/2}\,dx=\frac{x^{3/2}}{3/2}=\frac{2}{3}x^{3/2}
            \]
          </div>
        `),
        guidedStep("Combine the result", raw`Keep the minus sign with the radical term and add the constant once at the end.`, raw`
          <div class="math-block">
            \[
            \int \left(e^{3x}-\sqrt{x}\right)\,dx
            =
            \frac{e^{3x}}{3}-\frac{2}{3}x^{3/2}+C
            \]
          </div>
        `)
      ]
    }),
    "2b": createConfig("2b", "2022 Paper — Solving for a limit from a definite integral", {
      focus: raw`Turn the radical into a negative power, evaluate the definite integral, then solve the resulting equation for \(k\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find the value of }k,\text{ given that }\int_{1}^{k}\frac{2}{\sqrt{x}}\,dx=8.
          \]
        </div>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: raw`
        <div class="math-block">
          \[
          \int_{1}^{k}\frac{2}{\sqrt{x}}\,dx
          =
          \int_{1}^{k}2x^{-1/2}\,dx
          =
          \left[4\sqrt{x}\right]_{1}^{k}
          \]
          \[
          4\sqrt{k}-4=8
          \]
          \[
          4\sqrt{k}=12
          \]
          \[
          \sqrt{k}=3
          \]
          \[
          k=9
          \]
        </div>
      `,
      guidedSteps: [
        guidedStep("Rewrite the integrand", raw`The power rule is easiest to use when the square root is written as an exponent.`, raw`
          <div class="math-block">
            \[
            \frac{2}{\sqrt{x}}=2x^{-1/2}
            \]
          </div>
        `),
        guidedStep("Integrate and use the limits", raw`Evaluate the definite integral before solving for \(k\).`, raw`
          <div class="math-block">
            \[
            \int_{1}^{k}2x^{-1/2}\,dx
            =
            \left[4x^{1/2}\right]_{1}^{k}
            =
            \left[4\sqrt{x}\right]_{1}^{k}
            \]
            \[
            4\sqrt{k}-4=8
            \]
          </div>
        `),
        guidedStep("Solve for k", raw`Now isolate the square root and square both sides.`, raw`
          <div class="math-block">
            \[
            4\sqrt{k}=12
            \]
            \[
            \sqrt{k}=3
            \]
            \[
            k=9
            \]
          </div>
        `)
      ]
    }),
    "2c": createConfig("2c", "2022 Paper — Separable differential equation with a logarithm", {
      focus: raw`Separate variables first, then use the condition to find the constant before substituting the target \(y\)-value.`,
      questionHtml: raw`
        <p class="step-text">Consider the differential equation</p>
        <div class="question-math">
          \[
          \frac{dy}{dx}=\frac{1}{3y^2(x-1)},
          \qquad x>1.
          \]
        </div>
        <p class="step-text">Given that \(y=-1\) when \(x=2\), find the value(s) of \(x\) which give a \(y\)-value of \(1\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: raw`
        <div class="math-block">
          \[
          3y^2\,dy=\frac{1}{x-1}\,dx
          \]
          \[
          y^3=\ln(x-1)+C
          \]
          \[
          -1=\ln(1)+C \Rightarrow C=-1
          \]
          \[
          y^3=\ln(x-1)-1
          \]
          \[
          1=\ln(x-1)-1
          \]
          \[
          \ln(x-1)=2
          \]
          \[
          x=e^2+1
          \]
        </div>
      `,
      guidedSteps: [
        guidedStep("Separate the variables", raw`Move the \(y\)-terms to the left and the \(x\)-terms to the right before integrating.`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}=\frac{1}{3y^2(x-1)}
            \]
            \[
            3y^2\,dy=\frac{1}{x-1}\,dx
            \]
          </div>
        `),
        guidedStep("Integrate both sides", raw`The left side is a power rule, and the right side is a logarithm. Because \(x>1\), we can write \(\ln(x-1)\).`, raw`
          <div class="math-block">
            \[
            \int 3y^2\,dy=\int \frac{1}{x-1}\,dx
            \]
            \[
            y^3=\ln(x-1)+C
            \]
          </div>
        `),
        guidedStep("Find the constant", raw`Substitute the known point \((x,y)=(2,-1)\) into the integrated equation.`, raw`
          <div class="math-block">
            \[
            (-1)^3=\ln(2-1)+C
            \]
            \[
            -1=\ln 1+C
            \]
            \[
            -1=0+C
            \]
            \[
            C=-1
            \]
            \[
            y^3=\ln(x-1)-1
            \]
          </div>
        `),
        guidedStep("Substitute the target value", raw`Now set \(y=1\) and solve the resulting logarithmic equation for \(x\).`, raw`
          <div class="math-block">
            \[
            1^3=\ln(x-1)-1
            \]
            \[
            1=\ln(x-1)-1
            \]
            \[
            \ln(x-1)=2
            \]
            \[
            x-1=e^2
            \]
            \[
            x=e^2+1
            \]
          </div>
        `)
      ]
    }),
    "2d": createConfig("2d", "2022 Paper — Velocity and distance from an acceleration model", {
      focus: raw`Integrate acceleration to get velocity, use the given velocity to fix the constant, then integrate velocity from \(t=4\) to \(t=5\).`,
      questionHtml: raw`
        <p class="step-text">An object's acceleration can be modelled by</p>
        <div class="question-math">
          \[
          a(t)=0.9e^{0.3t},
          \]
        </div>
        <p class="step-text">where \(a\) is measured in \(\text{m s}^{-2}\), and \(t\) is the time in seconds from the start of timing.</p>
        <p class="step-text">The object had a velocity of \(10\text{ m s}^{-1}\) after \(2\) seconds.</p>
        <p class="step-text">How far did the object travel during the 5th second of its motion?</p>
        <p class="step-text question-note">The 5th second means the interval from \(t=4\) to \(t=5\).</p>
      `,
      answerHtml: raw`
        <div class="math-block">
          \[
          v'(t)=0.9e^{0.3t}
          \]
          \[
          v(t)=3e^{0.3t}+C
          \]
          \[
          10=3e^{0.6}+C
          \Rightarrow
          C=10-3e^{0.6}
          \]
          \[
          v(t)=3e^{0.3t}+10-3e^{0.6}
          \]
          \[
          \text{distance in the 5th second}=\int_{4}^{5}v(t)\,dt
          \]
          \[
          =
          \int_{4}^{5}\left(3e^{0.3t}+10-3e^{0.6}\right)\,dt
          \]
          \[
          =
          \left[10e^{0.3t}+\left(10-3e^{0.6}\right)t\right]_{4}^{5}
          \]
          \[
          =10\left(e^{1.5}-e^{1.2}\right)+10-3e^{0.6}
          \approx 16.15
          \]
        </div>
        <p class="step-text">So the object travelled about \(16.15\text{ m}\) during the 5th second.</p>
      `,
      guidedSteps: [
        guidedStep("Build the velocity function", raw`Acceleration is \(\frac{dv}{dt}\), so integrate \(a(t)\) with respect to time.`, raw`
          <div class="math-block">
            \[
            \frac{dv}{dt}=0.9e^{0.3t}
            \]
            \[
            v(t)=\int 0.9e^{0.3t}\,dt
            \]
            \[
            v(t)=3e^{0.3t}+C
            \]
          </div>
        `),
        guidedStep("Use the velocity condition", raw`Substitute \(t=2\) and \(v=10\) to find the constant.`, raw`
          <div class="math-block">
            \[
            10=3e^{0.3(2)}+C
            \]
            \[
            10=3e^{0.6}+C
            \]
            \[
            C=10-3e^{0.6}
            \]
            \[
            v(t)=3e^{0.3t}+10-3e^{0.6}
            \]
          </div>
        `),
        guidedStep("Choose the correct interval", raw`The 5th second runs from \(t=4\) to \(t=5\), so distance travelled is the integral of velocity over that interval.`, raw`
          <p class="step-text">The velocity is positive on this interval, so signed displacement and distance are the same here.</p>
          <div class="math-block">
            \[
            \text{distance}=\int_{4}^{5}v(t)\,dt
            \]
            \[
            =
            \int_{4}^{5}\left(3e^{0.3t}+10-3e^{0.6}\right)\,dt
            \]
          </div>
        `),
        guidedStep("Evaluate the distance", raw`Integrate the velocity function and substitute the endpoints \(4\) and \(5\).`, raw`
          <div class="math-block">
            \[
            \int \left(3e^{0.3t}+10-3e^{0.6}\right)\,dt
            =
            10e^{0.3t}+\left(10-3e^{0.6}\right)t+C
            \]
            \[
            \text{distance}
            =
            \left[10e^{0.3t}+\left(10-3e^{0.6}\right)t\right]_{4}^{5}
            \]
            \[
            =10\left(e^{1.5}-e^{1.2}\right)+10-3e^{0.6}
            \]
            \[
            \approx 16.15
            \]
          </div>
        `)
      ]
    }),
    "2e": createConfig("2e", "2022 Paper — Tank leakage differential equation", {
      focus: raw`Separate the variables carefully, integrate, use the full-tank starting condition, then substitute the target height.`,
      questionHtml: raw`
        <p class="step-text">A cylindrical tank of height \(150\text{ cm}\) is originally full of oil.</p>
        <p class="step-text">The height \(h\), in cm, of the oil left in the tank after it has been leaking for \(t\) minutes can be modelled by</p>
        <div class="question-math">
          \[
          \frac{dh}{dt}=-\frac{1}{4}\sqrt{(h-6)^3}.
          \]
        </div>
        <p class="step-text">Find how long it takes for the oil to be \(15\text{ cm}\) above the bottom of the tank.</p>
        <p class="step-text question-note">Initially the tank is full, so \(h=150\) when \(t=0\).</p>
      `,
      answerHtml: raw`
        <div class="math-block">
          \[
          (h-6)^{-3/2}\,dh=-\frac{1}{4}\,dt
          \]
          \[
          -2(h-6)^{-1/2}=-\frac{t}{4}+C
          \]
          \[
          -2(150-6)^{-1/2}=C
          \Rightarrow
          C=-\frac{1}{6}
          \]
          \[
          -2(15-6)^{-1/2}=-\frac{t}{4}-\frac{1}{6}
          \]
          \[
          -\frac{2}{3}=-\frac{t}{4}-\frac{1}{6}
          \]
          \[
          -\frac{1}{2}=-\frac{t}{4}
          \]
          \[
          t=2
          \]
        </div>
        <p class="step-text">So it takes \(2\) minutes.</p>
      `,
      guidedSteps: [
        guidedStep("Separate the variables", raw`Move all the \(h\)-terms to one side and the \(t\)-terms to the other.`, raw`
          <div class="math-block">
            \[
            \frac{dh}{dt}=-\frac{1}{4}\sqrt{(h-6)^3}
            \]
            \[
            \frac{1}{\sqrt{(h-6)^3}}\,dh=-\frac{1}{4}\,dt
            \]
            \[
            (h-6)^{-3/2}\,dh=-\frac{1}{4}\,dt
            \]
          </div>
        `),
        guidedStep("Integrate both sides", raw`The left side is a power of \(h-6\), so use the reverse chain rule with power-rule integration.`, raw`
          <div class="math-block">
            \[
            \int (h-6)^{-3/2}\,dh=\int -\frac{1}{4}\,dt
            \]
            \[
            -2(h-6)^{-1/2}=-\frac{t}{4}+C
            \]
          </div>
        `),
        guidedStep("Find the constant", raw`At the start the tank is full, so substitute \(t=0\) and \(h=150\).`, raw`
          <div class="math-block">
            \[
            -2(150-6)^{-1/2}=C
            \]
            \[
            -2(144)^{-1/2}=C
            \]
            \[
            -2\left(\frac{1}{12}\right)=C
            \]
            \[
            C=-\frac{1}{6}
            \]
          </div>
        `),
        guidedStep("Substitute the target height", raw`Now use \(h=15\) and solve the linear equation in \(t\).`, raw`
          <div class="math-block">
            \[
            -2(15-6)^{-1/2}=-\frac{t}{4}-\frac{1}{6}
            \]
            \[
            -2(9)^{-1/2}=-\frac{t}{4}-\frac{1}{6}
            \]
            \[
            -\frac{2}{3}=-\frac{t}{4}-\frac{1}{6}
            \]
            \[
            -\frac{1}{2}=-\frac{t}{4}
            \]
            \[
            t=2
            \]
          </div>
        `)
      ]
    }),
    "3a": createConfig("3a", "2022 Paper — Reverse chain rule with a linear inside", {
      focus: raw`The whole integrand is a power of a linear expression, so reverse the chain rule straight away.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find } \int (2x+5)^3\,dx.
          \]
        </div>
      `,
      answerHtml: raw`
        <div class="math-block">
          \[
          \int (2x+5)^3\,dx
          =
          \frac{(2x+5)^4}{8}+C
          \]
        </div>
      `,
      guidedSteps: [
        guidedStep("Recognise the inner derivative", raw`The inside expression is \(2x+5\), whose derivative is \(2\). That tells us we will need to divide by \(2\) when reversing the chain rule.`, raw`
          <div class="math-block">
            \[
            \frac{d}{dx}(2x+5)=2
            \]
          </div>
        `),
        guidedStep("Integrate the power", raw`Increase the power by \(1\), then divide by the new power and by the inside derivative.`, raw`
          <div class="math-block">
            \[
            \int (2x+5)^3\,dx
            =
            \frac{(2x+5)^4}{4 \cdot 2}+C
            \]
            \[
            =
            \frac{(2x+5)^4}{8}+C
            \]
          </div>
        `)
      ]
    }),
    "3b": createConfig("3b", "2022 Paper — Trapezium Rule approximation", {
      focus: raw`Identify the common width first, then apply the trapezium rule with endpoints counted once and the middle values counted twice.`,
      questionHtml: raw`
        <p class="step-text">Use the values in the table below to find an approximation to \(\int_{0}^{2} f(x)\,dx\) using the Trapezium Rule.</p>
        <div class="table-wrap">
          <table class="question-data-table">
            <caption class="visually-hidden">Values of x and f of x from zero to two in steps of zero point four</caption>
            <thead>
              <tr>
                <th scope="col">\(x\)</th>
                <th scope="col">0</th>
                <th scope="col">0.4</th>
                <th scope="col">0.8</th>
                <th scope="col">1.2</th>
                <th scope="col">1.6</th>
                <th scope="col">2.0</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">\(f(x)\)</th>
                <td>3.6</td>
                <td>4.2</td>
                <td>4.8</td>
                <td>5.4</td>
                <td>4.5</td>
                <td>3.2</td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
      answerHtml: raw`
        <div class="math-block">
          \[
          h=0.4
          \]
          \[
          \int_{0}^{2} f(x)\,dx
          \approx
          \frac{h}{2}
          \left[y_0+y_5+2(y_1+y_2+y_3+y_4)\right]
          \]
          \[
          =
          \frac{0.4}{2}
          \left(3.6+3.2+2(4.2+4.8+5.4+4.5)\right)
          \]
          \[
          =
          8.92
          \]
        </div>
      `,
      guidedSteps: [
        guidedStep("Identify the strip width", raw`The \(x\)-values increase by a constant amount, so that spacing is the trapezium width \(h\).`, raw`
          <div class="math-block">
            \[
            h=0.4
            \]
          </div>
        `),
        guidedStep("Set up the trapezium rule", raw`The first and last ordinates are counted once, and all the interior ordinates are counted twice.`, raw`
          <div class="math-block">
            \[
            \int_{0}^{2} f(x)\,dx
            \approx
            \frac{h}{2}
            \left[y_0+y_5+2(y_1+y_2+y_3+y_4)\right]
            \]
            \[
            =
            \frac{0.4}{2}
            \left(3.6+3.2+2(4.2+4.8+5.4+4.5)\right)
            \]
          </div>
        `),
        guidedStep("Evaluate the approximation", raw`Now simplify the bracket first, then multiply by \(\frac{0.4}{2}\).`, raw`
          <div class="math-block">
            \[
            4.2+4.8+5.4+4.5=18.9
            \]
            \[
            3.6+3.2+2(18.9)=44.6
            \]
            \[
            \frac{0.4}{2}(44.6)=0.2(44.6)=8.92
            \]
          </div>
        `)
      ]
    }),
    "3c": createConfig("3c", "2022 Paper — Simplifying a rational integrand", {
      focus: raw`Rewrite the fraction before integrating so the definite integral becomes a linear term plus a logarithm.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find } \int_{5}^{8}\frac{4x-5}{x-3}\,dx.
          \]
        </div>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: raw`
        <div class="math-block">
          \[
          \frac{4x-5}{x-3}
          =
          \frac{4(x-3)+7}{x-3}
          =
          4+\frac{7}{x-3}
          \]
          \[
          \int_{5}^{8}\frac{4x-5}{x-3}\,dx
          =
          \left[4x+7\ln|x-3|\right]_{5}^{8}
          \]
          \[
          =
          (32+7\ln 5)-(20+7\ln 2)
          \]
          \[
          =12+7\ln\left(\frac{5}{2}\right)
          \approx 18.414
          \]
        </div>
      `,
      guidedSteps: [
        guidedStep("Rewrite the fraction", raw`Split the numerator into a multiple of the denominator plus a remainder.`, raw`
          <div class="math-block">
            \[
            4x-5=4(x-3)+7
            \]
            \[
            \frac{4x-5}{x-3}
            =
            \frac{4(x-3)+7}{x-3}
            =
            4+\frac{7}{x-3}
            \]
          </div>
        `),
        guidedStep("Integrate the simpler form", raw`Now the definite integral splits into a constant term and a logarithm term.`, raw`
          <div class="math-block">
            \[
            \int_{5}^{8}\frac{4x-5}{x-3}\,dx
            =
            \int_{5}^{8}\left(4+\frac{7}{x-3}\right)\,dx
            \]
            \[
            =
            \left[4x+7\ln|x-3|\right]_{5}^{8}
            \]
          </div>
        `),
        guidedStep("Evaluate the bounds", raw`Substitute \(x=8\) and \(x=5\), then combine the logarithms into one exact answer.`, raw`
          <div class="math-block">
            \[
            \left[4x+7\ln|x-3|\right]_{5}^{8}
            =
            (32+7\ln 5)-(20+7\ln 2)
            \]
            \[
            =12+7(\ln 5-\ln 2)
            \]
            \[
            =12+7\ln\left(\frac{5}{2}\right)
            \]
            \[
            \approx 18.414
            \]
          </div>
        `)
      ]
    }),
    "3d": createConfig("3d", "2022 Paper — Area between a curve and a line", {
      focus: raw`Find the intersection points first, decide which graph is on top, then integrate the vertical gap.`,
      questionHtml: raw`
        <p class="step-text">The graph below shows part of the curve \(y=x+\cos x\) and the line \(y=x\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3d-int-2022" class="graph-svg" viewBox="0 0 470 320" aria-label="Shaded region between y equals x plus cosine x and y equals x" role="img"></svg>
        </div>
        <p class="step-text">Find the shaded area.</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: raw`
        <div class="math-block">
          \[
          x+\cos x=x
          \Rightarrow
          \cos x=0
          \Rightarrow
          x=-\frac{\pi}{2},\frac{\pi}{2}
          \]
          \[
          A=\int_{-\pi/2}^{\pi/2}\bigl((x+\cos x)-x\bigr)\,dx
          \]
          \[
          A=\int_{-\pi/2}^{\pi/2}\cos x\,dx
          \]
          \[
          A=\left[\sin x\right]_{-\pi/2}^{\pi/2}
          =1-(-1)=2
          \]
        </div>
      `,
      afterRender: draw3dGraph,
      guidedSteps: [
        guidedStep("Find the intersections", raw`The shaded region starts and ends where the curve and line meet.`, raw`
          <div class="math-block">
            \[
            x+\cos x=x
            \]
            \[
            \cos x=0
            \]
            \[
            x=-\frac{\pi}{2},\frac{\pi}{2}
            \]
          </div>
        `),
        guidedStep("Choose top minus bottom", raw`On \(\left[-\frac{\pi}{2},\frac{\pi}{2}\right]\), \(\cos x \ge 0\), so \(x+\cos x\) lies above \(x\).`, raw`
          <div class="math-block">
            \[
            A=\int_{-\pi/2}^{\pi/2}\bigl((x+\cos x)-x\bigr)\,dx
            \]
            \[
            A=\int_{-\pi/2}^{\pi/2}\cos x\,dx
            \]
          </div>
        `),
        guidedStep("Evaluate the area", raw`Integrate the cosine gap and substitute the two intersection points.`, raw`
          <div class="math-block">
            \[
            A=\left[\sin x\right]_{-\pi/2}^{\pi/2}
            \]
            \[
            =\sin\left(\frac{\pi}{2}\right)-\sin\left(-\frac{\pi}{2}\right)
            \]
            \[
            =1-(-1)
            \]
            \[
            =2
            \]
          </div>
        `)
      ]
    }),
    "3e": createConfig("3e", "2022 Paper — Rectangle minus logarithmic curve area", {
      focus: raw`Express the shaded region as a rectangle minus the area under the curve, then rewrite the logarithm in the requested \(a+b\ln c\) form.`,
      questionHtml: raw`
        <p class="step-text">The graph below shows part of the curve \(y=\frac{2}{x}\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3e-int-2022" class="graph-svg" viewBox="0 0 460 320" aria-label="Rectangle and shaded region above y equals two over x between x equals k and x equals 3k" role="img"></svg>
        </div>
        <p class="step-text">Points \(P\) and \(Q\) lie on the curve with \(x\)-coordinates \(k\) and \(3k\) respectively, where \(k&gt;0\). Point \(R\) is such that \(PR\) is parallel to the \(x\)-axis and \(QR\) is parallel to the \(y\)-axis.</p>
        <p class="step-text">The shaded area can be written in the form \(a+b\ln c\), where \(a\), \(b\), and \(c\) are integers. Find the values of \(a\), \(b\), and \(c\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: raw`
        <div class="math-block">
          \[
          \text{rectangle area}=\frac{2}{k}(3k-k)=\frac{2}{k}(2k)=4
          \]
          \[
          \text{area under the curve}=\int_{k}^{3k}\frac{2}{x}\,dx
          \]
          \[
          =
          \left[2\ln|x|\right]_{k}^{3k}
          =
          2\ln|3k|-2\ln|k|
          \]
          \[
          =2\ln 3=\ln 9
          \]
          \[
          A=4-\ln 9
          \]
        </div>
        <p class="step-text">So \(a=4\), \(b=-1\), and \(c=9\).</p>
      `,
      afterRender: draw3eGraph,
      guidedSteps: [
        guidedStep("Find the rectangle area", raw`The shaded region sits inside a rectangle whose width and height can both be read from the diagram.`, raw`
          <div class="math-block">
            \[
            \text{height}=y_P=\frac{2}{k}
            \]
            \[
            \text{width}=3k-k=2k
            \]
            \[
            A_{\text{rectangle}}=\frac{2}{k}\cdot 2k=4
            \]
          </div>
        `),
        guidedStep("Find the curved part", raw`The part to remove is the area under \(y=\frac{2}{x}\) from \(x=k\) to \(x=3k\).`, raw`
          <div class="math-block">
            \[
            A_{\text{curve}}=\int_{k}^{3k}\frac{2}{x}\,dx
            \]
            \[
            =
            \left[2\ln|x|\right]_{k}^{3k}
            \]
            \[
            =2\ln|3k|-2\ln|k|
            \]
          </div>
        `),
        guidedStep("Form the shaded area", raw`The shaded region is rectangle minus curve area, and the logarithm can be compressed into a single \(\ln\) term.`, raw`
          <div class="math-block">
            \[
            2\ln|3k|-2\ln|k|
            =
            2\ln\left(\frac{3k}{k}\right)
            =
            2\ln 3
            =
            \ln 9
            \]
            \[
            A=4-\ln 9
            \]
          </div>
        `),
        guidedStep("Read off a, b, and c", raw`Match the finished expression to the required form \(a+b\ln c\).`, raw`
          <div class="math-block">
            \[
            A=4+(-1)\ln 9
            \]
          </div>
          <p class="step-text">Therefore \(a=4\), \(b=-1\), and \(c=9\).</p>
        `)
      ]
    })
  };
}());
