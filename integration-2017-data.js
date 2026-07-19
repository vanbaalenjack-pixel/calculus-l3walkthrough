(function () {
  const raw = String.raw;
  const paperHref = "level-3-integration-2017.html";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const metadata = {
    topic: "Integration",
    year: 2017,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return "int-" + id + "2017.html";
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
      browserTitle: "2017 Integration Paper - " + questionLabel(id),
      eyebrow: "Level 3 Integration Walkthrough",
      title: questionLabel(id),
      subtitle: subtitle,
      backHref: paperHref,
      nextHref: next ? pageHref(next) : paperHref,
      nextLabel: next ? "Next question →" : "Back to paper",
      finalNav: buildFinalNav(id),
      partNavigation: buildPartNavigation(id),
      partNavigationTitle: "2017 paper questions",
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

  function smoothPath(points, scale) {
    if (!points.length) {
      return "";
    }

    let path = "M " + scale.x(points[0][0]) + " " + scale.y(points[0][1]);

    for (let index = 0; index < points.length - 1; index += 1) {
      const previous = points[Math.max(0, index - 1)];
      const current = points[index];
      const next = points[index + 1];
      const following = points[Math.min(points.length - 1, index + 2)];
      const control1 = [
        current[0] + (next[0] - previous[0]) / 6,
        current[1] + (next[1] - previous[1]) / 6
      ];
      const control2 = [
        next[0] - (following[0] - current[0]) / 6,
        next[1] - (following[1] - current[1]) / 6
      ];

      path += " C " + scale.x(control1[0]) + " " + scale.y(control1[1]);
      path += " " + scale.x(control2[0]) + " " + scale.y(control2[1]);
      path += " " + scale.x(next[0]) + " " + scale.y(next[1]);
    }

    return path;
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

  function gridMarkup(scale, xValues, yValues, xMin, xMax, yMin, yMax) {
    let markup = "";

    xValues.forEach(function (x) {
      markup += lineMarkup(scale, x, yMin, x, yMax, "graph-grid-line");
    });
    yValues.forEach(function (y) {
      markup += lineMarkup(scale, xMin, y, xMax, y, "graph-grid-line");
    });

    return markup;
  }

  function draw1bGraph() {
    const svg = document.getElementById("question-graph-1b-int-2017");
    if (!svg) {
      return;
    }

    const width = 700;
    const height = 430;
    const padding = 56;
    const scale = createScale(width, height, padding, -1.05, 6.35, -0.65, 10.55);
    const fn = function (x) { return x + 1 / Math.sqrt(x); };
    const xGrid = [-1, 1, 2, 3, 4, 5, 6];
    const yGrid = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    svg.innerHTML = `
      <title id="graph-1b-title">Shaded area under y equals x plus one over square root x</title>
      <desc id="graph-1b-desc">For positive x, the curve drops steeply from the vertical asymptote at x equals zero, reaches a minimum below y equals two, then rises. The region above the x-axis and below the curve from x equals one to x equals four is shaded.</desc>
      ${graphDefinitions("graph-arrow-1b-2017")}
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${gridMarkup(scale, xGrid, yGrid, -1, 6, 0, 10)}
      <path class="question-shade" d="${areaUnderCurvePath(fn, 1, 4, 0, 0.02, scale)}"></path>
      <path class="question-curve" d="${functionPath(fn, 0.012, 6, 0.012, scale)}"></path>
      ${lineMarkup(scale, -0.92, 0, 6.2, 0, "graph-axis", ' marker-start="url(#graph-arrow-1b-2017)" marker-end="url(#graph-arrow-1b-2017)"')}
      ${lineMarkup(scale, 0, -0.45, 0, 10.35, "graph-axis", ' marker-start="url(#graph-arrow-1b-2017)" marker-end="url(#graph-arrow-1b-2017)"')}
      ${lineMarkup(scale, 1, 0, 1, fn(1), "graph-measure-soft")}
      ${lineMarkup(scale, 4, 0, 4, fn(4), "graph-measure-soft")}
      ${circleMarkup(scale, 0, 0, 5, "question-origin")}
      ${textMarkup(scale, 6.18, -0.3, "x", "question-axis-label")}
      ${textMarkup(scale, -0.1, 10.28, "y", "question-axis-label", ' text-anchor="end"')}
      ${textMarkup(scale, 1, -0.32, "1", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 4, -0.32, "4", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 4.75, 6.05, "y = x + x⁻½", "graph-equation-label", ' text-anchor="middle"')}
    `;
  }

  function draw1eGraph() {
    const svg = document.getElementById("question-graph-1e-int-2017");
    if (!svg) {
      return;
    }

    const width = 680;
    const height = 350;
    const padding = 54;
    const scale = createScale(width, height, padding, -0.38, 3.55, -0.22, 1.25);
    const fn = function (x) { return Math.sin(x) * Math.sin(x); };

    svg.innerHTML = `
      <title id="graph-1e-title">Graph of sine squared from zero to pi</title>
      <desc id="graph-1e-desc">The non-negative curve y equals sine squared x starts at zero, reaches its maximum value one at x equals pi over two, and returns to zero at x equals pi.</desc>
      ${graphDefinitions("graph-arrow-1e-2017")}
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      <path class="question-curve" d="${functionPath(fn, -0.3, 3.45, 0.012, scale)}"></path>
      ${lineMarkup(scale, -0.3, 0, 3.43, 0, "graph-axis", ' marker-start="url(#graph-arrow-1e-2017)" marker-end="url(#graph-arrow-1e-2017)"')}
      ${lineMarkup(scale, 0, -0.14, 0, 1.16, "graph-axis", ' marker-start="url(#graph-arrow-1e-2017)" marker-end="url(#graph-arrow-1e-2017)"')}
      ${lineMarkup(scale, Math.PI, -0.03, Math.PI, 0.03, "graph-measure")}
      ${lineMarkup(scale, -0.035, 1, 0.035, 1, "graph-measure")}
      ${circleMarkup(scale, 0, 0, 5, "question-origin")}
      ${textMarkup(scale, 3.42, -0.12, "x", "question-axis-label")}
      ${textMarkup(scale, -0.06, 1.16, "y", "question-axis-label", ' text-anchor="end"')}
      ${textMarkup(scale, Math.PI, -0.13, "π", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, -0.07, 1, "1", "graph-label", ' text-anchor="end"')}
      ${textMarkup(scale, 1.57, 1.13, "y = sin²x", "graph-equation-label", ' text-anchor="middle"')}
    `;
  }

  function draw2cGraph() {
    const svg = document.getElementById("question-graph-2c-int-2017");
    if (!svg) {
      return;
    }

    const width = 720;
    const height = 420;
    const padding = 56;
    const scale = createScale(width, height, padding, -3.1, 15.5, -2.2, 17.2);
    const parabola = function (x) { return -x * x + 3 * x + 10; };
    const tangent = function (x) { return -x + 14; };
    const lowerCurve = functionPoints(parabola, 2, 5, 0.03).reverse();
    let shadePath = "M " + scale.x(2) + " " + scale.y(tangent(2));
    shadePath += " L " + scale.x(14) + " " + scale.y(0);
    shadePath += " L " + scale.x(5) + " " + scale.y(0);
    lowerCurve.forEach(function (point) {
      shadePath += " L " + scale.x(point[0]) + " " + scale.y(point[1]);
    });
    shadePath += " Z";

    svg.innerHTML = `
      <title id="graph-2c-title">Shaded region bounded by a tangent, a parabola, and the x-axis</title>
      <desc id="graph-2c-desc">The line y equals negative x plus fourteen is tangent to the downward parabola y equals negative x squared plus three x plus ten at two comma twelve. The shaded region lies below the tangent, above the parabola from x equals two to five, and above the x-axis from x equals five to fourteen.</desc>
      ${graphDefinitions("graph-arrow-2c-2017")}
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      <path class="question-shade-strong" d="${shadePath}"></path>
      <path class="question-curve" d="${functionPath(parabola, -2.25, 5.25, 0.025, scale)}"></path>
      <path class="graph-curve-secondary" d="${functionPath(tangent, -2.5, 15, 0.04, scale)}"></path>
      ${lineMarkup(scale, -2.7, 0, 15.25, 0, "graph-axis", ' marker-start="url(#graph-arrow-2c-2017)" marker-end="url(#graph-arrow-2c-2017)"')}
      ${lineMarkup(scale, 0, -1.6, 0, 16.5, "graph-axis", ' marker-start="url(#graph-arrow-2c-2017)" marker-end="url(#graph-arrow-2c-2017)"')}
      ${circleMarkup(scale, 0, 0, 5, "question-origin")}
      ${circleMarkup(scale, 2, 12, 5, "question-dot")}
      ${textMarkup(scale, 15.18, -0.75, "x", "question-axis-label")}
      ${textMarkup(scale, -0.28, 16.36, "y", "question-axis-label", ' text-anchor="end"')}
      ${textMarkup(scale, 2, 13.15, "(2, 12)", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 5, -0.72, "5", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 14, -0.72, "14", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, -1.4, 15.2, "y = −x + 14", "graph-equation-label")}
      ${textMarkup(scale, -1.5, 5.5, "y = −x² + 3x + 10", "graph-equation-label")}
    `;
  }

  function draw2dGraph() {
    const svg = document.getElementById("question-graph-2d-int-2017");
    if (!svg) {
      return;
    }

    const width = 700;
    const height = 360;
    const padding = 54;
    const scale = createScale(width, height, padding, -0.62, 1.3, -0.42, 0.82);
    const fn = function (x) { return Math.sin(3 * x) * Math.cos(2 * x); };

    svg.innerHTML = `
      <title id="graph-2d-title">Area under y equals sine three x cosine two x</title>
      <desc id="graph-2d-desc">The curve passes through the origin and is positive until x equals pi over four. That first positive region above the x-axis is shaded. The curve is then slightly negative until its next zero at pi over three.</desc>
      ${graphDefinitions("graph-arrow-2d-2017")}
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      <path class="question-shade" d="${areaUnderCurvePath(fn, 0, Math.PI / 4, 0, 0.008, scale)}"></path>
      <path class="question-curve" d="${functionPath(fn, -0.52, 1.22, 0.008, scale)}"></path>
      ${lineMarkup(scale, -0.52, 0, 1.22, 0, "graph-axis", ' marker-start="url(#graph-arrow-2d-2017)" marker-end="url(#graph-arrow-2d-2017)"')}
      ${lineMarkup(scale, 0, -0.32, 0, 0.74, "graph-axis", ' marker-start="url(#graph-arrow-2d-2017)" marker-end="url(#graph-arrow-2d-2017)"')}
      ${lineMarkup(scale, Math.PI / 4, -0.025, Math.PI / 4, 0.025, "graph-measure")}
      ${lineMarkup(scale, Math.PI / 3, -0.025, Math.PI / 3, 0.025, "graph-measure")}
      ${circleMarkup(scale, 0, 0, 5, "question-origin")}
      ${textMarkup(scale, 1.21, -0.09, "x", "question-axis-label")}
      ${textMarkup(scale, -0.025, 0.73, "y", "question-axis-label", ' text-anchor="end"')}
      ${textMarkup(scale, Math.PI / 4, -0.13, "π/4", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, Math.PI / 3, -0.13, "π/3", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 0.46, 0.66, "y = sin(3x) cos(2x)", "graph-equation-label", ' text-anchor="middle"')}
    `;
  }

  function draw3bDiagram() {
    const svg = document.getElementById("question-diagram-3b-int-2017");
    if (!svg) {
      return;
    }

    const width = 720;
    const height = 430;
    const padding = 58;
    const scale = createScale(width, height, padding, -0.8, 11.1, -1.4, 13.25);
    const points = [[0, 0], [2, 6], [4, 8], [6, 10], [8, 11], [10, 12]];
    const topPath = smoothPath(points, scale);
    const courtyardPath = topPath + " L " + scale.x(10) + " " + scale.y(0) + " L " + scale.x(0) + " " + scale.y(0) + " Z";
    const heightLabels = [6, 8, 10, 11, 12];

    let ordinates = "";
    points.slice(1).forEach(function (point, index) {
      ordinates += lineMarkup(scale, point[0], 0, point[0], point[1], index === points.length - 2 ? "graph-measure" : "graph-measure-soft");
    });

    let labels = "";
    points.slice(1).forEach(function (point, index) {
      labels += textMarkup(scale, point[0] + (index === 4 ? 0.22 : 0.12), point[1] / 2, heightLabels[index] + " m", "graph-label");
    });
    [1, 3, 5, 7, 9].forEach(function (x) {
      labels += textMarkup(scale, x, -0.55, "2 m", "graph-label", ' text-anchor="middle"');
    });

    svg.innerHTML = `
      <title id="diagram-3b-title">Measured paved courtyard for the trapezium rule</title>
      <desc id="diagram-3b-desc">The courtyard has a ten metre straight base split into five equal widths of two metres. Its measured heights at x equals zero, two, four, six, eight, and ten metres are zero, six, eight, ten, eleven, and twelve metres. A smooth curved border joins the tops of the measurements.</desc>
      ${graphDefinitions("diagram-arrow-3b-2017")}
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      <path class="question-shade" d="${courtyardPath}"></path>
      ${ordinates}
      <path class="question-curve" d="${topPath}"></path>
      ${lineMarkup(scale, 0, 0, 10, 0, "graph-measure")}
      ${lineMarkup(scale, 10.55, 0, 10.55, 12, "graph-guide", ' marker-start="url(#diagram-arrow-3b-2017)" marker-end="url(#diagram-arrow-3b-2017)"')}
      ${labels}
    `;
  }

  function draw3cGraph() {
    const svg = document.getElementById("question-graph-3c-int-2017");
    if (!svg) {
      return;
    }

    const width = 720;
    const height = 420;
    const padding = 56;
    const scale = createScale(width, height, padding, -0.25, 12.8, -0.8, 13.15);
    const fn = function (x) { return (15 * x - 15) / (x + 2); };

    svg.innerHTML = `
      <title id="graph-3c-title">Courtyard area under a rational model</title>
      <desc id="graph-3c-desc">The curve y equals fifteen x minus fifteen over x plus two begins at one comma zero and rises with decreasing slope. The courtyard area above the x-axis, below the curve, and between x equals one and x equals eleven is shaded.</desc>
      ${graphDefinitions("graph-arrow-3c-2017")}
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      <path class="question-shade" d="${areaUnderCurvePath(fn, 1, 11, 0, 0.025, scale)}"></path>
      <path class="question-curve" d="${functionPath(fn, 1, 12, 0.025, scale)}"></path>
      ${lineMarkup(scale, -0.05, 0, 12.55, 0, "graph-axis", ' marker-start="url(#graph-arrow-3c-2017)" marker-end="url(#graph-arrow-3c-2017)"')}
      ${lineMarkup(scale, 0, -0.45, 0, 12.8, "graph-axis", ' marker-start="url(#graph-arrow-3c-2017)" marker-end="url(#graph-arrow-3c-2017)"')}
      ${lineMarkup(scale, 11, 0, 11, fn(11), "graph-measure-soft")}
      ${circleMarkup(scale, 1, 0, 5, "question-dot")}
      ${textMarkup(scale, 12.48, -0.35, "x", "question-axis-label")}
      ${textMarkup(scale, -0.14, 12.68, "y", "question-axis-label", ' text-anchor="end"')}
      ${textMarkup(scale, 1, -0.4, "1", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 11, -0.4, "11", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 7.25, 11.75, "y = (15x − 15)/(x + 2)", "graph-equation-label", ' text-anchor="middle"')}
    `;
  }

  window.Integration2017Walkthroughs = {
    "1a": createConfig("1a", "Question One - reverse trigonometric differentiation", {
      focus: raw`Recognise that the derivative of \(\tan(2x)\) contains both \(\sec^2(2x)\) and an inside factor of \(2\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find }\int 4\sec^2(2x)\,dx.
          \]
        </div>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{2\tan(2x)+C}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Reverse the chain rule", raw`The inside derivative of \(2x\) is \(2\), so divide the coefficient by \(2\).`, raw`
          <div class="math-block">
            \[
            \int 4\sec^2(2x)\,dx
            =\frac{4\tan(2x)}{2}+C.
            \]
          </div>
        `),
        guidedStep("Simplify", raw`Reduce the constant factor.`, raw`
          <div class="math-block">
            \[
            \frac{4\tan(2x)}{2}+C=2\tan(2x)+C.
            \]
          </div>
        `)
      ]
    }),

    "1b": createConfig("1b", "Question One - area under a rational curve", {
      focus: raw`Simplify the fraction into powers of \(x\), then integrate the curve from \(1\) to \(4\).`,
      questionHtml: raw`
        <p class="step-text">Use integration to find the area enclosed between the curve</p>
        <div class="question-math">
          \[
          y=\frac{x^2+\sqrt{x}}{x}
          \]
        </div>
        <p class="step-text">and the lines \(y=0\), \(x=1\), and \(x=4\) (the area shaded in the diagram below).</p>
        <figure class="graph-frame question-graph-frame">
          <svg id="question-graph-1b-int-2017" class="graph-svg" viewBox="0 0 700 430" role="img" aria-labelledby="graph-1b-title graph-1b-desc"></svg>
        </figure>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{9.5\text{ square units}}
          \]
        </div>
      `),
      afterRender: draw1bGraph,
      guidedSteps: [
        guidedStep("Simplify the curve", raw`Divide both numerator terms by \(x\), then write the radical as a power.`, raw`
          <div class="math-block">
            \[
            y=\frac{x^2}{x}+\frac{\sqrt{x}}{x}
            =x+x^{-1/2}.
            \]
          </div>
        `),
        guidedStep("Set up the area", raw`The curve is above the \(x\)-axis throughout the shaded interval.`, raw`
          <div class="math-block">
            \[
            A=\int_1^4\left(x+x^{-1/2}\right)\,dx.
            \]
          </div>
        `),
        guidedStep("Integrate", raw`Apply the power rule to each term.`, raw`
          <div class="math-block">
            \[
            A=\left[\frac{x^2}{2}+2x^{1/2}\right]_1^4.
            \]
          </div>
        `),
        guidedStep("Evaluate the limits", raw`Substitute \(4\), then subtract the value at \(1\).`, raw`
          <div class="math-block">
            \[
            A=\left(\frac{16}{2}+2\sqrt4\right)
            -\left(\frac12+2\sqrt1\right)
            =12-2.5=9.5.
            \]
          </div>
        `)
      ]
    }),

    "1c": createConfig("1c", "Question One - acceleration, velocity, and distance", {
      focus: raw`Integrate acceleration to obtain velocity, use the velocity at four seconds, then integrate velocity over the first nine seconds.`,
      questionHtml: raw`
        <p class="step-text">An object's acceleration is modelled by the function</p>
        <div class="question-math">
          \[
          a(t)=1.2\sqrt{t},
          \]
        </div>
        <p class="step-text">where \(a\) is the acceleration of the object, in \(\text{m s}^{-2}\), and \(t\) is the time in seconds since the start of the object's motion.</p>
        <p class="step-text">If the object had a velocity of \(7\text{ m s}^{-1}\) after 4 seconds, how far did it travel in the first 9 seconds of motion?</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{83.16\text{ m}}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Write acceleration as a power", raw`Use \(\sqrt t=t^{1/2}\) before integrating.`, raw`
          <div class="math-block">
            \[
            a(t)=1.2t^{1/2}.
            \]
          </div>
        `),
        guidedStep("Integrate to find velocity", raw`Acceleration is the derivative of velocity.`, raw`
          <div class="math-block">
            \[
            v(t)=\frac{1.2t^{3/2}}{3/2}+C
            =0.8t^{3/2}+C.
            \]
          </div>
        `),
        guidedStep("Use the velocity at four seconds", raw`Substitute \(t=4\) and \(v=7\) to determine \(C\).`, raw`
          <div class="math-block">
            \[
            v(4)=7,
            \qquad
            C=7-0.8(4)^{3/2}=0.6.
            \]
            \[
            v(t)=0.8t^{3/2}+0.6.
            \]
          </div>
        `),
        guidedStep("Set up the distance", raw`Velocity is positive for \(0\le t\le9\), so distance equals the integral of velocity.`, raw`
          <div class="math-block">
            \[
            D=\int_0^9v(t)\,dt
            =\int_0^9\left(0.8t^{3/2}+0.6\right)\,dt.
            \]
          </div>
        `),
        guidedStep("Integrate and evaluate", raw`Apply the limits to the displacement function.`, raw`
          <div class="math-block">
            \[
            D=\left[\frac{0.8t^{5/2}}{5/2}+0.6t\right]_0^9
            =83.16-0
            =83.16\text{ m}.
            \]
          </div>
        `)
      ]
    }),

    "1d": createConfig("1d", "Question One - finding an integration limit", {
      focus: raw`Evaluate the exponential definite integral, then use logarithms to isolate \(k\).`,
      questionHtml: raw`
        <p class="step-text">Find the value of \(k\) if</p>
        <div class="question-math">
          \[
          \int_0^k3e^{2x}\,dx=4.
          \]
        </div>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{k=\ln\sqrt{\frac{11}{3}}
          =\frac12\ln\left(\frac{11}{3}\right)}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Integrate the exponential", raw`Divide by the inside coefficient of \(2\).`, raw`
          <div class="math-block">
            \[
            \int_0^k3e^{2x}\,dx
            =\left[\frac{3e^{2x}}{2}\right]_0^k.
            \]
          </div>
        `),
        guidedStep("Evaluate both limits", raw`Set the evaluated integral equal to \(4\).`, raw`
          <div class="math-block">
            \[
            4=\frac{3e^{2k}}{2}-\frac{3e^0}{2}.
            \]
          </div>
        `),
        guidedStep("Isolate the exponential", raw`Add \(\frac32\), then simplify.`, raw`
          <div class="math-block">
            \[
            \frac{11}{2}=\frac{3e^{2k}}{2}
            \quad\Longrightarrow\quad
            e^{2k}=\frac{11}{3}.
            \]
          </div>
        `),
        guidedStep("Solve for k", raw`Take natural logarithms; the two exact forms are equivalent.`, raw`
          <div class="math-block">
            \[
            2k=\ln\left(\frac{11}{3}\right)
            \quad\Longrightarrow\quad
            k=\frac12\ln\left(\frac{11}{3}\right)
            =\ln\sqrt{\frac{11}{3}}.
            \]
          </div>
        `)
      ]
    }),

    "1e": createConfig("1e", "Question One - mean value of a function", {
      focus: raw`Use the double-angle identity for \(\sin^2x\), integrate over one arch, then divide by the interval length.`,
      questionHtml: raw`
        <p class="step-text">The mean value of a function \(y=f(x)\) from \(x=a\) to \(x=b\) is given by</p>
        <div class="question-math">
          \[
          \text{Mean value}=\frac{\int_a^b f(x)\,dx}{b-a}.
          \]
        </div>
        <p class="step-text">Find the mean value of \(y=\sin^2x\) between \(x=0\) and \(x=\pi\).</p>
        <p class="step-text">Part of the graph of \(y=\sin^2x\) is shown below.</p>
        <figure class="graph-frame question-graph-frame">
          <svg id="question-graph-1e-int-2017" class="graph-svg" viewBox="0 0 680 350" role="img" aria-labelledby="graph-1e-title graph-1e-desc"></svg>
        </figure>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{\text{Mean value}=\frac12}
          \]
        </div>
      `),
      afterRender: draw1eGraph,
      guidedSteps: [
        guidedStep("Use a double-angle identity", raw`Rewrite the squared sine so it can be integrated directly.`, raw`
          <div class="math-block">
            \[
            \sin^2x=\frac12-\frac{\cos(2x)}2.
            \]
          </div>
        `),
        guidedStep("Set up the integral", raw`Integrate the function over the stated interval.`, raw`
          <div class="math-block">
            \[
            \int_0^\pi\left(\frac12-\frac{\cos(2x)}2\right)\,dx.
            \]
          </div>
        `),
        guidedStep("Integrate", raw`Reverse the chain rule for \(\cos(2x)\).`, raw`
          <div class="math-block">
            \[
            \int_0^\pi\sin^2x\,dx
            =\left[\frac{x}{2}-\frac{\sin(2x)}4\right]_0^\pi.
            \]
          </div>
        `),
        guidedStep("Evaluate the area", raw`The sine term is zero at both limits.`, raw`
          <div class="math-block">
            \[
            \int_0^\pi\sin^2x\,dx
            =\frac\pi2-0=\frac\pi2.
            \]
          </div>
        `),
        guidedStep("Divide by the interval length", raw`The interval has length \(\pi-0\).`, raw`
          <div class="math-block">
            \[
            \text{Mean value}
            =\frac{\pi/2}{\pi-0}
            =\frac12.
            \]
          </div>
        `)
      ]
    }),

    "2a": createConfig("2a", "Question Two - logarithmic integration", {
      focus: raw`Use a linear substitution, or match the numerator to the derivative of the denominator.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find }\int\frac{6}{2x-1}\,dx.
          \]
        </div>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{3\ln|2x-1|+C}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Substitute the denominator", raw`Let \(u=2x-1\), so \(du=2\,dx\).`, raw`
          <div class="math-block">
            \[
            u=2x-1,
            \qquad du=2\,dx,
            \qquad dx=\frac12\,du.
            \]
          </div>
        `),
        guidedStep("Integrate the reciprocal", raw`The absolute-value signs keep the antiderivative valid on either side of \(x=\frac12\).`, raw`
          <div class="math-block">
            \[
            \int\frac6{2x-1}\,dx
            =3\int\frac1u\,du
            =3\ln|u|+C
            =3\ln|2x-1|+C.
            \]
          </div>
        `)
      ]
    }),

    "2b": createConfig("2b", "Question Two - a linear power", {
      focus: raw`Reverse the chain rule for the fourth power of \(2x-5\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find }\int(2x-5)^4\,dx.
          \]
        </div>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{\frac{(2x-5)^5}{10}+C}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Use a substitution", raw`Let \(u=2x-5\), so \(dx=\frac12\,du\).`, raw`
          <div class="math-block">
            \[
            \int(2x-5)^4\,dx
            =\frac12\int u^4\,du.
            \]
          </div>
        `),
        guidedStep("Apply the power rule", raw`Increase the power to five, divide by five, then substitute back.`, raw`
          <div class="math-block">
            \[
            \frac12\int u^4\,du
            =\frac{u^5}{10}+C
            =\frac{(2x-5)^5}{10}+C.
            \]
          </div>
        `)
      ]
    }),

    "2c": createConfig("2c", "Question Two - a tangent and a parabola", {
      focus: raw`Treat the shaded region as the area under the tangent from \(2\) to \(14\), minus the area under the parabola from \(2\) to \(5\).`,
      questionHtml: raw`
        <p class="step-text">The diagram below shows the curve \(y=-x^2+3x+10\), and the line \(y=-x+14\), which is the tangent to the curve at the point \((2,12)\).</p>
        <figure class="graph-frame question-graph-frame">
          <svg id="question-graph-2c-int-2017" class="graph-svg" viewBox="0 0 720 420" role="img" aria-labelledby="graph-2c-title graph-2c-desc"></svg>
        </figure>
        <p class="step-text"><strong>Calculate the shaded area.</strong></p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{49.5\text{ square units}}
          \]
        </div>
      `),
      afterRender: draw2cGraph,
      guidedSteps: [
        guidedStep("Split the shaded region", raw`The source construction uses one large area under the tangent, then removes the area under the parabola.`, raw`
          <p class="step-text">The shaded area is equal to the area under the tangent from \(x=2\) to \(x=14\), minus the area under the parabola from \(x=2\) to \(x=5\).</p>
        `),
        guidedStep("Integrate the tangent", raw`Find the area under \(y=-x+14\) between its tangent point and x-intercept.`, raw`
          <div class="math-block">
            \[
            A_{\text{tangent}}
            =\int_2^{14}(-x+14)\,dx
            =\left[-\frac{x^2}{2}+14x\right]_2^{14}.
            \]
          </div>
        `),
        guidedStep("Evaluate the tangent area", raw`Substitute both limits.`, raw`
          <div class="math-block">
            \[
            A_{\text{tangent}}=98-26=72\text{ units}^2.
            \]
          </div>
        `),
        guidedStep("Integrate the parabola", raw`Use the interval from the tangent point to the parabola's positive x-intercept.`, raw`
          <div class="math-block">
            \[
            A_{\text{parabola}}
            =\int_2^5(-x^2+3x+10)\,dx
            =\left[-\frac{x^3}{3}+\frac{3x^2}{2}+10x\right]_2^5.
            \]
          </div>
        `),
        guidedStep("Evaluate and subtract", raw`Remove the parabola area from the full tangent area.`, raw`
          <div class="math-block">
            \[
            A_{\text{parabola}}
            =\frac{275}{6}-\frac{70}{3}
            =22.5\text{ units}^2,
            \]
            \[
            A_{\text{net}}=72-22.5=49.5\text{ units}^2.
            \]
          </div>
        `)
      ]
    }),

    "2d": createConfig("2d", "Question Two - a product-to-sum identity", {
      focus: raw`Convert the product of sine and cosine into a sum, then integrate over the first positive region.`,
      questionHtml: raw`
        <p class="step-text">Part of the graph of \(y=\sin(3x)\cos(2x)\) is shown below.</p>
        <figure class="graph-frame question-graph-frame">
          <svg id="question-graph-2d-int-2017" class="graph-svg" viewBox="0 0 700 360" role="img" aria-labelledby="graph-2d-title graph-2d-desc"></svg>
        </figure>
        <p class="step-text">Find the area enclosed between the curve \(y=\sin(3x)\cos(2x)\) and the lines \(y=0\), \(x=0\), and \(x=\frac{\pi}{4}\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{\frac{3-\sqrt2}{5}\text{ square units}
          \approx0.3172\text{ square units}}
          \]
        </div>
      `),
      afterRender: draw2dGraph,
      guidedSteps: [
        guidedStep("Use the product-to-sum identity", raw`Apply \(\sin A\cos B=\frac12[\sin(A+B)+\sin(A-B)]\).`, raw`
          <div class="math-block">
            \[
            \sin(3x)\cos(2x)
            =\frac12\bigl(\sin(5x)+\sin x\bigr).
            \]
          </div>
        `),
        guidedStep("Set up the area", raw`The curve is above \(y=0\) throughout \(0\le x\le\frac\pi4\).`, raw`
          <div class="math-block">
            \[
            A=\int_0^{\pi/4}
            \left(\frac{\sin(5x)}2+\frac{\sin x}2\right)\,dx.
            \]
          </div>
        `),
        guidedStep("Integrate", raw`Reverse the chain rule for \(\sin(5x)\).`, raw`
          <div class="math-block">
            \[
            A=\left[-\frac{\cos(5x)}{10}-\frac{\cos x}{2}\right]_0^{\pi/4}.
            \]
          </div>
        `),
        guidedStep("Evaluate the limits", raw`At the upper limit the antiderivative is \(-\frac{\sqrt2}{5}\); at zero it is \(-\frac35\).`, raw`
          <div class="math-block">
            \[
            A=-\frac{\sqrt2}{5}-\left(-\frac35\right)
            =\frac{3-\sqrt2}{5}
            \approx0.3172.
            \]
          </div>
        `)
      ]
    }),

    "2e": createConfig("2e", "Question Two - substitution in a motion model", {
      focus: raw`Use \(u=\ln t\) to integrate acceleration, then apply the known velocity before evaluating at ten seconds.`,
      questionHtml: raw`
        <p class="step-text">The acceleration of an object is modelled by the function</p>
        <div class="question-math">
          \[
          a(t)=\frac{20\ln t}{t},
          \]
        </div>
        <p class="step-text">where \(a\) is the acceleration of the object in \(\text{m s}^{-2}\), and \(t\) is the time in seconds since the start of the object's motion.</p>
        <p class="step-text">The object was moving with a velocity of \(12\text{ m s}^{-1}\) when \(t=4\).</p>
        <p class="step-text"><strong>Find the velocity of the object after 10 seconds.</strong></p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{v(10)\approx45.8\text{ m s}^{-1}}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Use the logarithmic substitution", raw`The derivative of \(\ln t\) supplies the remaining factor \(1/t\).`, raw`
          <div class="math-block">
            \[
            u=\ln t,
            \qquad
            \frac{du}{dt}=\frac1t,
            \qquad
            du=\frac1t\,dt.
            \]
          </div>
        `),
        guidedStep("Integrate acceleration", raw`Velocity is an antiderivative of acceleration.`, raw`
          <div class="math-block">
            \[
            v(t)=\int a(t)\,dt
            =\int20u\,du
            =10u^2+C.
            \]
          </div>
        `),
        guidedStep("Substitute back", raw`Return to the original variable.`, raw`
          <div class="math-block">
            \[
            v(t)=10(\ln t)^2+C.
            \]
          </div>
        `),
        guidedStep("Use the known velocity", raw`Substitute \(t=4\) and \(v=12\).`, raw`
          <div class="math-block">
            \[
            v(4)=12,
            \qquad
            C=12-10(\ln4)^2\approx-7.218.
            \]
          </div>
        `),
        guidedStep("Write the velocity function", raw`Keep the exact constant for the most accurate final evaluation.`, raw`
          <div class="math-block">
            \[
            v(t)=10(\ln t)^2+12-10(\ln4)^2.
            \]
          </div>
        `),
        guidedStep("Evaluate at ten seconds", raw`Substitute \(t=10\).`, raw`
          <div class="math-block">
            \[
            v(10)=10(\ln10)^2+12-10(\ln4)^2
            \approx45.8009\text{ m s}^{-1}
            \approx45.8\text{ m s}^{-1}.
            \]
          </div>
        `)
      ]
    }),

    "3a": createConfig("3a", "Question Three - negative powers and exponentials", {
      focus: raw`Rewrite the fraction with a negative power, then integrate both terms separately.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find }\int\left(\frac9{x^4}+8e^{4x}\right)\,dx.
          \]
        </div>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{-\frac3{x^3}+2e^{4x}+C}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Rewrite the fraction", raw`Move \(x^4\) into the numerator as \(x^{-4}\).`, raw`
          <div class="math-block">
            \[
            \int\left(\frac9{x^4}+8e^{4x}\right)\,dx
            =\int\left(9x^{-4}+8e^{4x}\right)\,dx.
            \]
          </div>
        `),
        guidedStep("Integrate each term", raw`Use the power rule on the first term and divide by the inside coefficient \(4\) on the second.`, raw`
          <div class="math-block">
            \[
            \int9x^{-4}\,dx=-3x^{-3},
            \qquad
            \int8e^{4x}\,dx=2e^{4x}.
            \]
          </div>
        `),
        guidedStep("Combine the antiderivatives", raw`Add the integration constant and write the negative power as a fraction.`, raw`
          <div class="math-block">
            \[
            -3x^{-3}+2e^{4x}+C
            =-\frac3{x^3}+2e^{4x}+C.
            \]
          </div>
        `)
      ]
    }),

    "3b": createConfig("3b", "Question Three - the Trapezium rule", {
      focus: raw`The five strips each have width \(2\) metres; count the two endpoint heights once and all four interior heights twice.`,
      questionHtml: raw`
        <p class="step-text">Julia wants to find an approximation of the area of a paved courtyard that she wishes to construct on her property. She takes some measurements and these are shown on the diagram below.</p>
        <figure class="graph-frame question-graph-frame">
          <svg id="question-diagram-3b-int-2017" class="graph-svg" viewBox="0 0 720 430" role="img" aria-labelledby="diagram-3b-title diagram-3b-desc"></svg>
        </figure>
        <p class="step-text">Using these measurements, and the Trapezium rule, find an approximation of the area of paved courtyard.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{82\text{ m}^2}
          \]
        </div>
      `),
      afterRender: draw3bDiagram,
      guidedSteps: [
        guidedStep("Identify the measurements", raw`The ordinates are \(0,6,8,10,11,12\) metres and the equal interval width is \(h=2\) metres.`, raw`
          <div class="math-block">
            \[
            h=2,
            \qquad
            y_0=0,\ y_1=6,\ y_2=8,\ y_3=10,\ y_4=11,\ y_5=12.
            \]
          </div>
        `),
        guidedStep("Apply the Trapezium rule", raw`Use \(\frac h2[y_0+y_5+2(y_1+y_2+y_3+y_4)]\).`, raw`
          <div class="math-block">
            \[
            A\approx\frac22\left[0+12+2(6+8+10+11)\right].
            \]
          </div>
        `),
        guidedStep("Evaluate the approximation", raw`The factor \(h/2\) is \(1\).`, raw`
          <div class="math-block">
            \[
            A\approx1\left[0+12+2(35)\right]
            =82\text{ m}^2.
            \]
          </div>
        `)
      ]
    }),

    "3c": createConfig("3c", "Question Three - integrating a rational model", {
      focus: raw`Rewrite the rational function as a constant minus a reciprocal linear term, then integrate from \(x=1\) to \(x=11\).`,
      questionHtml: raw`
        <p class="step-text">Julia's friend Sarah believes that the equation of the curved border of the paved courtyard can be modelled by the function</p>
        <div class="question-math">
          \[
          y=\frac{15x-15}{x+2}.
          \]
        </div>
        <figure class="graph-frame question-graph-frame">
          <svg id="question-graph-3c-int-2017" class="graph-svg" viewBox="0 0 720 420" role="img" aria-labelledby="graph-3c-title graph-3c-desc"></svg>
        </figure>
        <p class="step-text">Use integration to find the area of the courtyard, shown in the diagram above.</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{150-45\ln\left(\frac{13}{3}\right)
          \approx84.015\text{ m}^2}
          \]
        </div>
        <p class="step-text question-note">The exact value is \(84.0148319\ldots\text{ m}^2\), which rounds to \(84.015\text{ m}^2\) to three decimal places.</p>
      `),
      afterRender: draw3cGraph,
      guidedSteps: [
        guidedStep("Rewrite the numerator", raw`Create a multiple of \(x+2\), leaving a constant remainder.`, raw`
          <div class="math-block">
            \[
            15x-15=15(x+2)-45,
            \]
            \[
            y=\frac{15(x+2)-45}{x+2}
            =15-\frac{45}{x+2}.
            \]
          </div>
        `),
        guidedStep("Set up the area", raw`The shaded courtyard begins where the curve meets the axis at \(x=1\) and ends at \(x=11\).`, raw`
          <div class="math-block">
            \[
            A=\int_1^{11}\left(15-\frac{45}{x+2}\right)\,dx.
            \]
          </div>
        `),
        guidedStep("Integrate", raw`The reciprocal linear term gives a natural logarithm.`, raw`
          <div class="math-block">
            \[
            A=\left[15x-45\ln|x+2|\right]_1^{11}.
            \]
          </div>
        `),
        guidedStep("Evaluate both limits", raw`Keep the logarithms exact before rounding.`, raw`
          <div class="math-block">
            \[
            A=(165-45\ln13)-(15-45\ln3)
            \]
            \[
            =150-45\ln\left(\frac{13}{3}\right).
            \]
          </div>
        `),
        guidedStep("Round the area correctly", raw`The source walkthrough truncates this value; to three decimal places it rounds up.`, raw`
          <div class="math-block">
            \[
            A=84.0148319\ldots\text{ m}^2
            \approx84.015\text{ m}^2.
            \]
          </div>
        `)
      ]
    }),

    "3d": createConfig("3d", "Question Three - a separable differential equation", {
      focus: raw`Separate \(y\) from \(x\), integrate both sides, and use the initial condition to select the positive branch.`,
      questionHtml: raw`
        <p class="step-text">Solve the differential equation</p>
        <div class="question-math">
          \[
          \frac{dy}{dx}=\frac{y}{\sqrt{x}},
          \]
        </div>
        <p class="step-text">given that when \(x=4\), then \(y=1\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{y=e^{2\sqrt{x}-4}},\qquad x>0
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Separate the variables", raw`Move \(y\) beside \(dy\) and write the square root as a power.`, raw`
          <div class="math-block">
            \[
            y^{-1}\,dy=x^{-1/2}\,dx.
            \]
          </div>
        `),
        guidedStep("Integrate both sides", raw`The left side integrates to a logarithm.`, raw`
          <div class="math-block">
            \[
            \ln|y|=2x^{1/2}+C.
            \]
          </div>
        `),
        guidedStep("Use the initial condition", raw`Substitute \(x=4\) and \(y=1\).`, raw`
          <div class="math-block">
            \[
            0=2(4)^{1/2}+C
            \quad\Longrightarrow\quad
            C=-4.
            \]
          </div>
        `),
        guidedStep("Write the logarithmic solution", raw`Return the constant to the integrated equation.`, raw`
          <div class="math-block">
            \[
            \ln|y|=2\sqrt{x}-4.
            \]
          </div>
        `),
        guidedStep("Exponentiate and apply the condition", raw`The condition \(y=1\) identifies the positive solution.`, raw`
          <div class="math-block">
            \[
            |y|=e^{2\sqrt{x}-4}
            \quad\Longrightarrow\quad
            y=e^{2\sqrt{x}-4}.
            \]
          </div>
        `)
      ]
    }),

    "3e": createConfig("3e", "Question Three - substitution with two conditions", {
      focus: raw`Integrate by substituting \(u=\sin(0.5t)\), then use the two known values of \(y\) to determine \(k\) and the constant.`,
      questionHtml: raw`
        <p class="step-text">\(y\) and \(t\) satisfy the differential equation</p>
        <div class="question-math">
          \[
          \begin{gathered}
          \frac{dy}{dt}=k\cos(0.5t)\,e^{\sin(0.5t)},\\
          0\le t\le5.
          \end{gathered}
          \]
        </div>
        <p class="step-text">Given that when \(t=0\), \(y=8\), and that when \(t=2\), \(y=12\), find the value of \(y\) when \(t=5\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight(raw`
        <div class="math-block">
          \[
          \boxed{y(5)\approx10.483}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Use a substitution", raw`The derivative of \(\sin(0.5t)\) is already present, apart from a factor of \(0.5\).`, raw`
          <div class="math-block">
            \[
            u=\sin(0.5t),
            \qquad
            du=0.5\cos(0.5t)\,dt.
            \]
          </div>
        `),
        guidedStep("Integrate the differential equation", raw`Replace \(\cos(0.5t)\,dt\) with \(2\,du\).`, raw`
          <div class="math-block">
            \[
            y=2k\int e^u\,du
            =2ke^u+C
            =2ke^{\sin(0.5t)}+C.
            \]
          </div>
        `),
        guidedStep("Use the first condition", raw`Substitute \(t=0\) and \(y=8\).`, raw`
          <div class="math-block">
            \[
            8=2ke^{\sin0}+C
            \quad\Longrightarrow\quad
            C=8-2k.
            \]
          </div>
        `),
        guidedStep("Use the second condition", raw`Substitute \(t=2\), \(y=12\), and the expression for \(C\).`, raw`
          <div class="math-block">
            \[
            12=2ke^{\sin1}+C
            =2ke^{\sin1}+8-2k,
            \]
            \[
            4=k\left(2e^{\sin1}-2\right).
            \]
          </div>
        `),
        guidedStep("Find k", raw`Divide by the remaining factor.`, raw`
          <div class="math-block">
            \[
            k=\frac4{2e^{\sin1}-2}
            \approx1.51541,
            \qquad
            C=8-2k.
            \]
          </div>
        `),
        guidedStep("Evaluate at t equals five", raw`Substitute \(t=5\) into the integrated function.`, raw`
          <div class="math-block">
            \[
            \begin{aligned}
            y(5)&=2ke^{\sin(5/2)}\\
            &\quad+8-2k,
            \end{aligned}
            \]
            \[
            k=\frac4{2e^{\sin1}-2},
            \]
            \[
            \begin{aligned}
            y(5)&=10.483259\ldots\\
            &\approx10.483.
            \end{aligned}
            \]
          </div>
        `)
      ]
    })
  };
}());
