(function () {
  const raw = String.raw;
  const paperHref = "level-3-integration-2024.html";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return "int-" + id + "2024.html";
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
      browserTitle: "2024 Integration Paper — " + questionLabel(id),
      eyebrow: "Level 3 Integration Walkthrough",
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

  function shadedAreaPath(fn, start, end, baseline, step, scale) {
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

  function shadedBetweenPath(topFn, bottomFn, start, end, step, scale) {
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
    const svg = document.getElementById("question-graph-1b-int-2024");

    if (!svg) {
      return;
    }

    const width = 460;
    const height = 300;
    const padding = 34;
    const fn = function (x) {
      return 40 * x * Math.pow(5 * x * x - 3, 3);
    };
    const scale = createScale(width, height, padding, -1.25, 0.12, -8, 78);
    const curvePath = functionPath(fn, -1.18, 0.04, 0.008, scale);
    const areaPath = shadedAreaPath(fn, -0.4, 0, 0, 0.006, scale);

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -1.25, 0, 0.12, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -8, 0, 78, "graph-axis")}
      ${lineMarkup(scale, -0.4, 0, -0.4, fn(-0.4), "graph-guide")}
      <path class="question-shade" d="${areaPath}"></path>
      <path class="question-curve" d="${curvePath}"></path>
      ${circleMarkup(scale, 0, 0, 4.2, "question-origin")}
      ${textMarkup(scale, -0.4, -2.5, "-0.4", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 0.03, 3.6, "(0, 0)", "graph-label")}
      ${textMarkup(scale, -0.56, 34, "y = 40x(5x² - 3)³", "graph-equation-label", ' text-anchor="middle"')}
      ${textMarkup(scale, -0.4, 28, "x = -0.4", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 0.105, -1.5, "x", "question-axis-label")}
      ${textMarkup(scale, -0.035, 76, "y", "question-axis-label")}
      <rect class="graph-chip" x="306" y="24" width="116" height="44" rx="12"></rect>
      <text class="graph-label" x="364" y="42" text-anchor="middle">Diagram is</text>
      <text class="graph-label" x="364" y="60" text-anchor="middle">not to scale</text>
    `;
  }

  function draw1eGraph() {
    const svg = document.getElementById("question-graph-1e-int-2024");

    if (!svg) {
      return;
    }

    const width = 460;
    const height = 300;
    const padding = 32;
    const topFn = function (x) {
      return 3 / (Math.cos(x) * Math.cos(x));
    };
    const bottomFn = function (x) {
      const tan = Math.tan(x);
      return 2 * tan * tan;
    };
    const scale = createScale(width, height, padding, -0.12, 1.28, -1.1, 11.4);
    const topPath = functionPath(topFn, 0, 1.08, 0.006, scale);
    const bottomPath = functionPath(bottomFn, 0, 1.08, 0.006, scale);
    const areaPath = shadedBetweenPath(topFn, bottomFn, 0, 1, 0.006, scale);

    svg.innerHTML = `
      <defs>
        <clipPath id="int-2024-1e-plot-clip" clipPathUnits="userSpaceOnUse">
          <rect x="${padding}" y="${padding}" width="${width - padding * 2}" height="${height - padding * 2}"></rect>
        </clipPath>
      </defs>
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -0.12, 0, 1.28, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -1.1, 0, 11.4, "graph-axis")}
      ${lineMarkup(scale, 1, 0, 1, topFn(1), "graph-guide")}
      <g clip-path="url(#int-2024-1e-plot-clip)">
        <path class="question-shade" d="${areaPath}"></path>
        <path class="question-curve" d="${topPath}"></path>
        <path class="question-curve" d="${bottomPath}"></path>
      </g>
      ${circleMarkup(scale, 0, 0, 4.2, "question-origin")}
      ${textMarkup(scale, 1, -0.32, "1", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 0.03, 9.05, "x = 1", "graph-label")}
      ${textMarkup(scale, 0.65, 5.15, "y = 3 sec²x", "graph-equation-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 0.96, 6.95, "y = 2 tan²x", "graph-equation-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 1.25, -0.15, "x", "question-axis-label")}
      ${textMarkup(scale, -0.02, 11.05, "y", "question-axis-label")}
      <rect class="graph-chip" x="296" y="24" width="116" height="44" rx="12"></rect>
      <text class="graph-label" x="354" y="42" text-anchor="middle">Diagram is</text>
      <text class="graph-label" x="354" y="60" text-anchor="middle">not to scale</text>
    `;
  }

  function draw2dGraph() {
    const svg = document.getElementById("question-graph-2d-int-2024");

    if (!svg) {
      return;
    }

    const width = 470;
    const height = 310;
    const padding = 34;
    const fn = function (x) {
      return Math.sin(x) * Math.sin(x);
    };
    const scale = createScale(width, height, padding, -1.95, 1.95, -0.22, 1.22);
    const curvePath = functionPath(fn, -1.85, 1.85, 0.01, scale);
    const lineY = 1;
    const areaPath = shadedBetweenPath(
      function (x) {
        return lineY;
      },
      fn,
      -Math.PI / 2,
      Math.PI / 2,
      0.01,
      scale
    );

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -1.95, 0, 1.95, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -0.22, 0, 1.22, "graph-axis")}
      ${lineMarkup(scale, -Math.PI / 2, -0.22, -Math.PI / 2, 1.1, "graph-guide")}
      ${lineMarkup(scale, Math.PI / 2, -0.22, Math.PI / 2, 1.1, "graph-guide")}
      ${lineMarkup(scale, -Math.PI / 2, 1, Math.PI / 2, 1, "graph-axis", ' stroke-dasharray="0"')}
      <path class="question-shade" d="${areaPath}"></path>
      <path class="question-curve" d="${curvePath}"></path>
      ${circleMarkup(scale, 0, 0, 4.2, "question-origin")}
      ${textMarkup(scale, 0.66, 1.045, "y = 1", "graph-equation-label")}
      ${textMarkup(scale, 0.72, 0.34, "y = sin²x", "graph-equation-label")}
      ${textMarkup(scale, -Math.PI / 2, 1.1, "x = -π/2", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, Math.PI / 2, 1.1, "x = π/2", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 1.9, -0.06, "x", "question-axis-label")}
      ${textMarkup(scale, -0.04, 1.18, "y", "question-axis-label")}
      <rect class="graph-chip" x="326" y="30" width="116" height="44" rx="12"></rect>
      <text class="graph-label" x="384" y="48" text-anchor="middle">Diagram is</text>
      <text class="graph-label" x="384" y="66" text-anchor="middle">not to scale</text>
    `;
  }

  function draw3dGraph() {
    const svg = document.getElementById("question-graph-3d-int-2024");

    if (!svg) {
      return;
    }

    const width = 470;
    const height = 300;
    const padding = 34;
    const fn = function (x) {
      return 2 * Math.cos(x / 2);
    };
    const scale = createScale(width, height, padding, -0.18, Math.PI + 0.18, -0.2, 2.2);
    const curvePath = functionPath(fn, 0, Math.PI, 0.01, scale);
    const areaPath = shadedAreaPath(fn, 0, Math.PI, 0, 0.01, scale);
    const k = Math.PI / 3;

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -0.18, 0, Math.PI + 0.18, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -0.2, 0, 2.2, "graph-axis")}
      ${lineMarkup(scale, k, 0, k, fn(k), "graph-guide")}
      <path class="question-shade" d="${areaPath}"></path>
      <path class="question-curve" d="${curvePath}"></path>
      ${circleMarkup(scale, 0, 0, 4.2, "question-origin")}
      ${textMarkup(scale, 1.92, 1.18, "y = 2 cos(x/2)", "graph-equation-label", ' text-anchor="middle"')}
      ${textMarkup(scale, k, -0.12, "k", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, Math.PI, -0.12, "π", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 0.46, 0.93, "Area A", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 1.84, 0.93, "Area B", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, Math.PI + 0.12, -0.04, "x", "question-axis-label")}
      ${textMarkup(scale, -0.03, 2.1, "y", "question-axis-label")}
      <rect class="graph-chip" x="334" y="26" width="112" height="44" rx="12"></rect>
      <text class="graph-label" x="390" y="44" text-anchor="middle">Graph is</text>
      <text class="graph-label" x="390" y="62" text-anchor="middle">not to scale</text>
    `;
  }

  window.Integration2024Walkthroughs = {
    "1a": createConfig("1a", "2024 Paper — Reverse sec-tan antiderivative", {
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find } \int 6\sec(2x)\tan(2x)\,dx.
          \]
        </div>
      `,
      hints: [
        raw`Look for a function whose derivative already contains \(\sec(2x)\tan(2x)\).`,
        raw`The derivative of \(\sec(2x)\) is \(2\sec(2x)\tan(2x)\), so the outside \(6\) still needs to be adjusted.`,
        raw`Divide by the inside coefficient and keep the constant of integration.`
      ],
      answerHtml: raw`
        <p class="step-text">Use the reverse derivative of \(\sec(2x)\):</p>
        <div class="math-block">
          \[
          \frac{d}{dx}\bigl(\sec(2x)\bigr)=2\sec(2x)\tan(2x)
          \]
          \[
          \int 6\sec(2x)\tan(2x)\,dx=3\sec(2x)+C
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Spot the derivative pattern`,
          previewHtml: raw`This is the reverse-chain-rule pattern we want.`,
          workingHtml: raw`<p class="step-text">This is the reverse-chain-rule pattern we want.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{d}{dx}\bigl(\sec(2x)\bigr)=2\sec(2x)\tan(2x)
          \]
</div>`
        },
        {
          title: raw`Adjust the coefficient`,
          previewHtml: raw`Reverse chain rule means dividing the outside coefficient by the inside coefficient.`,
          workingHtml: raw`<p class="step-text">Reverse chain rule means dividing the outside coefficient by the inside coefficient.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            3
          \]
</div>`
        },
        {
          title: raw`Identify the antiderivative`,
          previewHtml: raw`This is a clean reverse-chain-rule antiderivative.`,
          workingHtml: raw`<p class="step-text">This is a clean reverse-chain-rule antiderivative.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            3\sec(2x)+C
          \]
</div>

        <p class="step-text">Use the reverse derivative of \(\sec(2x)\):</p>
        <div class="math-block">
          \[
          \frac{d}{dx}\bigl(\sec(2x)\bigr)=2\sec(2x)\tan(2x)
          \]
          \[
          \int 6\sec(2x)\tan(2x)\,dx=3\sec(2x)+C
          \]
        </div>
      `
        }
      ]
    }),
    "1b": createConfig("1b", "2024 Paper — Area under a polynomial-style curve", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(y=40x(5x^2-3)^3\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-1b-int-2024" class="graph-svg" viewBox="0 0 460 300" aria-label="Shaded region under y equals 40x times 5x squared minus 3 cubed from x equals negative 0.4 to x equals 0" role="img"></svg>
        </div>
        <p class="step-text">Find the shaded area.</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`The shaded region runs from \(x=-0.4\) to \(x=0\), and the curve is above the \(x\)-axis on that interval.`,
        raw`The inside expression is \(5x^2-3\), whose derivative is \(10x\).`,
        raw`Because the integrand has \(40x\,dx\), the antiderivative simplifies neatly to \((5x^2-3)^4\).`
      ],
      answerHtml: raw`
        <p class="step-text">Set up the definite integral for the shaded area:</p>
        <div class="math-block">
          \[
          A=\int_{-0.4}^{0}40x(5x^2-3)^3\,dx
          \]
        </div>
        <p class="step-text">Reverse the chain rule:</p>
        <div class="math-block">
          \[
          \frac{d}{dx}(5x^2-3)=10x
          \]
          \[
          \int 40x(5x^2-3)^3\,dx=(5x^2-3)^4+C
          \]
        </div>
        <p class="step-text">Now evaluate the bounds:</p>
        <div class="math-block">
          \[
          A=\left[(5x^2-3)^4\right]_{-0.4}^{0}
          \]
          \[
          =(-3)^4-(-2.2)^4
          \]
          \[
          =81-23.4256=57.5744
          \]
        </div>
        <p class="step-text">So the shaded area is \(57.5744\text{ units}^2\).</p>
      `,
      afterRender: draw1bGraph,
      guidedSteps: [
        {
          title: raw`Set up the area`,
          previewHtml: raw`That matches the shaded region exactly.`,
          workingHtml: raw`<p class="step-text">That matches the shaded region exactly.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \int_{-0.4}^{0}40x(5x^2-3)^3\,dx
          \]
</div>`
        },
        {
          title: raw`Reverse the chain rule`,
          previewHtml: raw`Since \(\frac{d}{dx}(5x^2-3)=10x\), the \(40x\) becomes exactly the coefficient needed.`,
          workingHtml: raw`<p class="step-text">Since \(\frac{d}{dx}(5x^2-3)=10x\), the \(40x\) becomes exactly the coefficient needed.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            (5x^2-3)^4+C
          \]
</div>`
        },
        {
          title: raw`Evaluate the bounds`,
          previewHtml: raw`The evaluated difference is \(81-23.4256\).`,
          workingHtml: raw`<p class="step-text">The evaluated difference is \(81-23.4256\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            57.5744\text{ units}^2
          \]
</div>

        <p class="step-text">Set up the definite integral for the shaded area:</p>
        <div class="math-block">
          \[
          A=\int_{-0.4}^{0}40x(5x^2-3)^3\,dx
          \]
        </div>
        <p class="step-text">Reverse the chain rule:</p>
        <div class="math-block">
          \[
          \frac{d}{dx}(5x^2-3)=10x
          \]
          \[
          \int 40x(5x^2-3)^3\,dx=(5x^2-3)^4+C
          \]
        </div>
        <p class="step-text">Now evaluate the bounds:</p>
        <div class="math-block">
          \[
          A=\left[(5x^2-3)^4\right]_{-0.4}^{0}
          \]
          \[
          =(-3)^4-(-2.2)^4
          \]
          \[
          =81-23.4256=57.5744
          \]
        </div>
        <p class="step-text">So the shaded area is \(57.5744\text{ units}^2\).</p>
      `
        }
      ]
    }),
    "1c": createConfig("1c", "2024 Paper — Turning velocity into position", {
      questionHtml: raw`
        <p class="step-text">
          An object's velocity can be modelled by the equation
          \[
          v(t)=26.4t^{1/3},
          \]
          where \(v\) is the velocity of the object in \(\text{m s}^{-1}\), and \(t\) is the time in seconds since the start of timing.
        </p>
        <p class="step-text">Initially, the object was \(360\) metres from a point \(P\).</p>
        <p class="step-text">Calculate the distance of the object from point \(P\) when it has reached a velocity of \(264\text{ m s}^{-1}\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`Velocity is the derivative of position, so integrate \(v(t)\) to get a position model.`,
        raw`Use the initial position \(s(0)=360\) to find the constant.`,
        raw`Find the time from \(v(t)=264\) first, then substitute that time into \(s(t)\).`
      ],
      answerHtml: raw`
        <p class="step-text">Integrate velocity to get position:</p>
        <div class="math-block">
          \[
          s'(t)=26.4t^{1/3}
          \]
          \[
          s(t)=26.4\cdot\frac{t^{4/3}}{4/3}+C=19.8t^{4/3}+C
          \]
          \[
          s(0)=360 \Rightarrow C=360
          \]
          \[
          s(t)=19.8t^{4/3}+360
          \]
        </div>
        <p class="step-text">Now find when the velocity is \(264\text{ m s}^{-1}\):</p>
        <div class="math-block">
          \[
          26.4t^{1/3}=264
          \]
          \[
          t^{1/3}=10
          \]
          \[
          t=1000
          \]
        </div>
        <p class="step-text">Substitute that time into the position model:</p>
        <div class="math-block">
          \[
          s(1000)=19.8(1000)^{4/3}+360
          \]
          \[
          =19.8(10^4)+360=198\,360
          \]
        </div>
        <p class="step-text">So the object is \(198\,360\text{ m}\) from point \(P\).</p>
      `,
      guidedSteps: [
        {
          title: raw`Build the position function`,
          previewHtml: raw`Integrating \(t^{1/3}\) gives \(\frac{t^{4/3}}{4/3}\).`,
          workingHtml: raw`<p class="step-text">Integrating \(t^{1/3}\) gives \(\frac{t^{4/3}}{4/3}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            s(t)=19.8t^{4/3}+C
          \]
</div>`
        },
        {
          title: raw`Use the initial position`,
          previewHtml: raw`Substituting \(t=0\) shows the constant must be \(360\).`,
          workingHtml: raw`<p class="step-text">Substituting \(t=0\) shows the constant must be \(360\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            s(t)=19.8t^{4/3}+360
          \]
</div>`
        },
        {
          title: raw`Find the time`,
          previewHtml: raw`Cubing both sides gives \(t=10^3=1000\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              26.4t^{1/3}=264
              \]
              \[
              t^{1/3}=10
              \]
            </div>

<p class="step-text">Cubing both sides gives \(t=10^3=1000\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  1000
  \]
</div>
</div>`
        },
        {
          title: raw`Substitute into position`,
          previewHtml: raw`Since \(1000^{4/3}=10^4\), the distance is \(19.8\times 10^4+360\).`,
          workingHtml: raw`<p class="step-text">Since \(1000^{4/3}=10^4\), the distance is \(19.8\times 10^4+360\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            198\,360\text{ m}
          \]
</div>

        <p class="step-text">Integrate velocity to get position:</p>
        <div class="math-block">
          \[
          s'(t)=26.4t^{1/3}
          \]
          \[
          s(t)=26.4\cdot\frac{t^{4/3}}{4/3}+C=19.8t^{4/3}+C
          \]
          \[
          s(0)=360 \Rightarrow C=360
          \]
          \[
          s(t)=19.8t^{4/3}+360
          \]
        </div>
        <p class="step-text">Now find when the velocity is \(264\text{ m s}^{-1}\):</p>
        <div class="math-block">
          \[
          26.4t^{1/3}=264
          \]
          \[
          t^{1/3}=10
          \]
          \[
          t=1000
          \]
        </div>
        <p class="step-text">Substitute that time into the position model:</p>
        <div class="math-block">
          \[
          s(1000)=19.8(1000)^{4/3}+360
          \]
          \[
          =19.8(10^4)+360=198\,360
          \]
        </div>
        <p class="step-text">So the object is \(198\,360\text{ m}\) from point \(P\).</p>
      `
        }
      ]
    }),
    "1d": createConfig("1d", "2024 Paper — Differential equation with a trig identity", {
      questionHtml: raw`
        <p class="step-text">
          Consider the differential equation
          \[
          \frac{dy}{dx}=24\cos(3x)\sin(x).
          \]
        </p>
        <p class="step-text">Given that \(y=6\) when \(x=\frac{\pi}{3}\), find the value(s) of \(y\) when \(x=\frac{\pi}{2}\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`The product \(\sin(x)\cos(3x)\) suggests the product-to-sum identity \(2\sin A\cos B=\sin(A+B)+\sin(A-B)\).`,
        raw`Here that gives \(2\sin x\cos 3x=\sin 4x-\sin 2x\).`,
        raw`Integrate first, then use \(y=6\) at \(x=\frac{\pi}{3}\) to find the constant before substituting \(x=\frac{\pi}{2}\).`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite the derivative using products to sums:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=24\cos(3x)\sin(x)
          \]
          \[
          =12\bigl(2\sin x\cos 3x\bigr)
          \]
          \[
          =12(\sin 4x-\sin 2x)
          \]
        </div>
        <p class="step-text">Integrate term by term:</p>
        <div class="math-block">
          \[
          y=\int(12\sin 4x-12\sin 2x)\,dx
          \]
          \[
          y=-3\cos 4x+6\cos 2x+C
          \]
        </div>
        <p class="step-text">Use the condition \(y=6\) when \(x=\frac{\pi}{3}\):</p>
        <div class="math-block">
          \[
          6=-3\cos\left(\frac{4\pi}{3}\right)+6\cos\left(\frac{2\pi}{3}\right)+C
          \]
          \[
          6=-3\left(-\frac{1}{2}\right)+6\left(-\frac{1}{2}\right)+C
          \]
          \[
          6=-1.5+C
          \]
          \[
          C=7.5
          \]
        </div>
        <p class="step-text">Now substitute \(x=\frac{\pi}{2}\):</p>
        <div class="math-block">
          \[
          y=-3\cos(2\pi)+6\cos(\pi)+7.5
          \]
          \[
          y=-3-6+7.5=-1.5
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Rewrite the product`,
          previewHtml: raw`Since \(2\sin x\cos 3x=\sin 4x-\sin 2x\), the outside \(24\) becomes \(12\) times that bracket.`,
          workingHtml: raw`<p class="step-text">Since \(2\sin x\cos 3x=\sin 4x-\sin 2x\), the outside \(24\) becomes \(12\) times that bracket.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            12(\sin 4x-\sin 2x)
          \]
</div>`
        },
        {
          title: raw`Integrate the new form`,
          previewHtml: raw`This is the integrated form you can now fit to the condition.`,
          workingHtml: raw`<p class="step-text">This is the integrated form you can now fit to the condition.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            y=-3\cos 4x+6\cos 2x+C
          \]
</div>`
        },
        {
          title: raw`Find the constant`,
          previewHtml: raw`Since \(\cos\frac{4\pi}{3}=-\frac{1}{2}\) and \(\cos\frac{2\pi}{3}=-\frac{1}{2}\), the equation becomes \(6=-1.5+C\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              6=-3\cos\left(\frac{4\pi}{3}\right)+6\cos\left(\frac{2\pi}{3}\right)+C
              \]
            </div>

<p class="step-text">Since \(\cos\frac{4\pi}{3}=-\frac{1}{2}\) and \(\cos\frac{2\pi}{3}=-\frac{1}{2}\), the equation becomes \(6=-1.5+C\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{15}{2}
  \]
</div>
</div>`
        },
        {
          title: raw`Evaluate at \(x=\frac{\pi}{2}\)`,
          previewHtml: raw`The fitted model gives \(-3-6+7.5=-1.5\).`,
          workingHtml: raw`<p class="step-text">The fitted model gives \(-3-6+7.5=-1.5\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            -1.5
          \]
</div>

        <p class="step-text">Rewrite the derivative using products to sums:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=24\cos(3x)\sin(x)
          \]
          \[
          =12\bigl(2\sin x\cos 3x\bigr)
          \]
          \[
          =12(\sin 4x-\sin 2x)
          \]
        </div>
        <p class="step-text">Integrate term by term:</p>
        <div class="math-block">
          \[
          y=\int(12\sin 4x-12\sin 2x)\,dx
          \]
          \[
          y=-3\cos 4x+6\cos 2x+C
          \]
        </div>
        <p class="step-text">Use the condition \(y=6\) when \(x=\frac{\pi}{3}\):</p>
        <div class="math-block">
          \[
          6=-3\cos\left(\frac{4\pi}{3}\right)+6\cos\left(\frac{2\pi}{3}\right)+C
          \]
          \[
          6=-3\left(-\frac{1}{2}\right)+6\left(-\frac{1}{2}\right)+C
          \]
          \[
          6=-1.5+C
          \]
          \[
          C=7.5
          \]
        </div>
        <p class="step-text">Now substitute \(x=\frac{\pi}{2}\):</p>
        <div class="math-block">
          \[
          y=-3\cos(2\pi)+6\cos(\pi)+7.5
          \]
          \[
          y=-3-6+7.5=-1.5
          \]
        </div>
      `
        }
      ]
    }),
    "1e": createConfig("1e", "2024 Paper — Enclosed area between sec² and tan² curves", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the curves \(y=3\sec^2x\) and \(y=2\tan^2x\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-1e-int-2024" class="graph-svg" viewBox="0 0 460 300" aria-label="Shaded region between y equals 3 sec squared x and y equals 2 tan squared x from x equals 0 to x equals 1" role="img"></svg>
        </div>
        <p class="step-text">Find the area of the shaded region enclosed by the two curves, \(x=1\), and the \(y\)-axis.</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`Between \(x=0\) and \(x=1\), the top curve is \(y=3\sec^2x\) and the bottom curve is \(y=2\tan^2x\).`,
        raw`Use \(\tan^2x=\sec^2x-1\) to simplify the integrand before integrating.`,
        raw`After simplifying, the definite integral becomes very quick to evaluate.`
      ],
      answerHtml: raw`
        <p class="step-text">Set up top minus bottom:</p>
        <div class="math-block">
          \[
          A=\int_0^1\left(3\sec^2x-2\tan^2x\right)\,dx
          \]
        </div>
        <p class="step-text">Use \(\tan^2x=\sec^2x-1\):</p>
        <div class="math-block">
          \[
          3\sec^2x-2\tan^2x
          =
          3\sec^2x-2(\sec^2x-1)
          =
          \sec^2x+2
          \]
        </div>
        <p class="step-text">Now integrate and evaluate:</p>
        <div class="math-block">
          \[
          A=\int_0^1(\sec^2x+2)\,dx
          \]
          \[
          A=\left[\tan x+2x\right]_0^1
          \]
          \[
          A=\tan 1+2\approx 3.557
          \]
        </div>
      `,
      afterRender: draw1eGraph,
      guidedSteps: [
        {
          title: raw`Identify top minus bottom`,
          previewHtml: raw`Area between curves is top minus bottom over the interval \(0\le x\le1\).`,
          workingHtml: raw`<p class="step-text">Area between curves is top minus bottom over the interval \(0\le x\le1\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \int_0^1\left(3\sec^2x-2\tan^2x\right)\,dx
          \]
</div>`
        },
        {
          title: raw`Use the identity`,
          previewHtml: raw`The identity makes the area integral much easier to integrate.`,
          workingHtml: raw`<p class="step-text">The identity makes the area integral much easier to integrate.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \sec^2x+2
          \]
</div>`
        },
        {
          title: raw`Integrate the simplified expression`,
          previewHtml: raw`Now it is just a careful substitution of the bounds.`,
          workingHtml: raw`<p class="step-text">Now it is just a careful substitution of the bounds.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \left[\tan x+2x\right]_0^1
          \]
</div>`
        },
        {
          title: raw`Finish the area`,
          previewHtml: raw`Follow the working to finish the area.`,
          workingHtml: raw`<p class="step-text">The exact area is \(\tan 1+2\), which is about \(3.557\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \tan 1+2\approx 3.557
          \]
</div>

        <p class="step-text">Set up top minus bottom:</p>
        <div class="math-block">
          \[
          A=\int_0^1\left(3\sec^2x-2\tan^2x\right)\,dx
          \]
        </div>
        <p class="step-text">Use \(\tan^2x=\sec^2x-1\):</p>
        <div class="math-block">
          \[
          3\sec^2x-2\tan^2x
          =
          3\sec^2x-2(\sec^2x-1)
          =
          \sec^2x+2
          \]
        </div>
        <p class="step-text">Now integrate and evaluate:</p>
        <div class="math-block">
          \[
          A=\int_0^1(\sec^2x+2)\,dx
          \]
          \[
          A=\left[\tan x+2x\right]_0^1
          \]
          \[
          A=\tan 1+2\approx 3.557
          \]
        </div>
      `
        }
      ]
    }),
    "2a": createConfig("2a", "2024 Paper — Expand before integrating", {
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find } \int (3x^4+4)^2\,dx.
          \]
        </div>
      `,
      hints: [
        raw`This is not a clean reverse-chain-rule integral, so expand the square first.`,
        raw`Use \((a+b)^2=a^2+2ab+b^2\).`,
        raw`Once expanded, integrate each power of \(x\) term by term.`
      ],
      answerHtml: raw`
        <p class="step-text">Expand the square first:</p>
        <div class="math-block">
          \[
          (3x^4+4)^2=9x^8+24x^4+16
          \]
        </div>
        <p class="step-text">Now integrate term by term:</p>
        <div class="math-block">
          \[
          \int(9x^8+24x^4+16)\,dx
          =
          x^9+\frac{24x^5}{5}+16x+C
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Expand the bracket`,
          previewHtml: raw`Expand before you try to integrate.`,
          workingHtml: raw`<p class="step-text">Expand before you try to integrate.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            9x^8+24x^4+16
          \]
</div>`
        },
        {
          title: raw`Integrate each term`,
          previewHtml: raw`Increase each power by \(1\) and divide by the new power.`,
          workingHtml: raw`<p class="step-text">Increase each power by \(1\) and divide by the new power.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            x^9+\frac{24x^5}{5}+16x+C
          \]
</div>`
        },
        {
          title: raw`Identify the final result`,
          previewHtml: raw`Expanding first gives a straightforward power-rule integral.`,
          workingHtml: raw`<p class="step-text">Expanding first gives a straightforward power-rule integral.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            x^9+\frac{24x^5}{5}+16x+C
          \]
</div>

        <p class="step-text">Expand the square first:</p>
        <div class="math-block">
          \[
          (3x^4+4)^2=9x^8+24x^4+16
          \]
        </div>
        <p class="step-text">Now integrate term by term:</p>
        <div class="math-block">
          \[
          \int(9x^8+24x^4+16)\,dx
          =
          x^9+\frac{24x^5}{5}+16x+C
          \]
        </div>
      `
        }
      ]
    }),
    "2b": createConfig("2b", "2024 Paper — Solving for a constant from a definite integral", {
      questionHtml: raw`
        <p class="step-text">
          Find the value of \(k\), given that
          \[
          \int_k^{16}3\sqrt{x}\,dx=112.
          \]
        </p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`Rewrite \(3\sqrt{x}\) as \(3x^{1/2}\).`,
        raw`The antiderivative is \(2x^{3/2}\).`,
        raw`After applying the limits, solve \(112=128-2k^{3/2}\) before undoing the power.`
      ],
      answerHtml: raw`
        <p class="step-text">Integrate first:</p>
        <div class="math-block">
          \[
          \int 3x^{1/2}\,dx=2x^{3/2}+C
          \]
        </div>
        <p class="step-text">Apply the limits:</p>
        <div class="math-block">
          \[
          \left[2x^{3/2}\right]_k^{16}=112
          \]
          \[
          2(16)^{3/2}-2k^{3/2}=112
          \]
          \[
          128-2k^{3/2}=112
          \]
        </div>
        <p class="step-text">Now solve for \(k\):</p>
        <div class="math-block">
          \[
          2k^{3/2}=16
          \]
          \[
          k^{3/2}=8
          \]
          \[
          k=4
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Find the antiderivative`,
          previewHtml: raw`\(3x^{1/2}\) integrates to \(3\cdot\frac{x^{3/2}}{3/2}=2x^{3/2}\).`,
          workingHtml: raw`<p class="step-text">\(3x^{1/2}\) integrates to \(3\cdot\frac{x^{3/2}}{3/2}=2x^{3/2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            2x^{3/2}+C
          \]
</div>`
        },
        {
          title: raw`Apply the bounds`,
          previewHtml: raw`This is the correct result after applying the limits.`,
          workingHtml: raw`<p class="step-text">This is the correct result after applying the limits.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            112=2(16)^{3/2}-2k^{3/2}
          \]
</div>`
        },
        {
          title: raw`Solve for \(k\)`,
          previewHtml: raw`Since \(8=2^3\), raising both sides to the power \(\frac{2}{3}\) gives \(k=2^2=4\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              112=128-2k^{3/2}
              \]
              \[
              k^{3/2}=8
              \]
            </div>

<p class="step-text">Since \(8=2^3\), raising both sides to the power \(\frac{2}{3}\) gives \(k=2^2=4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  4
  \]
</div>
</div>

        <p class="step-text">Integrate first:</p>
        <div class="math-block">
          \[
          \int 3x^{1/2}\,dx=2x^{3/2}+C
          \]
        </div>
        <p class="step-text">Apply the limits:</p>
        <div class="math-block">
          \[
          \left[2x^{3/2}\right]_k^{16}=112
          \]
          \[
          2(16)^{3/2}-2k^{3/2}=112
          \]
          \[
          128-2k^{3/2}=112
          \]
        </div>
        <p class="step-text">Now solve for \(k\):</p>
        <div class="math-block">
          \[
          2k^{3/2}=16
          \]
          \[
          k^{3/2}=8
          \]
          \[
          k=4
          \]
        </div>
      `
        }
      ]
    }),
    "2c": createConfig("2c", "2024 Paper — Separable differential equation with an exponential", {
      questionHtml: raw`
        <p class="step-text">
          Consider the differential equation
          \[
          \frac{dy}{dx}=12y^2e^{3x}.
          \]
        </p>
        <p class="step-text">Given that \(y=0.5\) when \(x=0\), find the value of \(y\) when \(x=\frac{1}{3}\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`This equation is separable because the \(y\)-part and the \(x\)-part can be moved onto opposite sides.`,
        raw`Dividing by \(y^2\) gives \(y^{-2}\,dy=12e^{3x}\,dx\).`,
        raw`Use the initial condition to find \(C\) before substituting \(x=\frac{1}{3}\).`
      ],
      answerHtml: raw`
        <p class="step-text">Separate the variables:</p>
        <div class="math-block">
          \[
          y^{-2}\,dy=12e^{3x}\,dx
          \]
        </div>
        <p class="step-text">Integrate both sides:</p>
        <div class="math-block">
          \[
          \int y^{-2}\,dy=\int 12e^{3x}\,dx
          \]
          \[
          -\frac{1}{y}=4e^{3x}+C
          \]
        </div>
        <p class="step-text">Use \(y=0.5\) when \(x=0\):</p>
        <div class="math-block">
          \[
          -2=4+C
          \]
          \[
          C=-6
          \]
        </div>
        <p class="step-text">Now substitute \(x=\frac{1}{3}\):</p>
        <div class="math-block">
          \[
          -\frac{1}{y}=4e-6
          \]
          \[
          y=\frac{1}{6-4e}\approx -0.2052
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Separate the variables`,
          previewHtml: raw`This puts all the \(y\)-terms on one side and all the \(x\)-terms on the other.`,
          workingHtml: raw`<p class="step-text">This puts all the \(y\)-terms on one side and all the \(x\)-terms on the other.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            y^{-2}\,dy=12e^{3x}\,dx
          \]
</div>`
        },
        {
          title: raw`Integrate both sides`,
          previewHtml: raw`The exponential side integrates cleanly to \(4e^{3x}\).`,
          workingHtml: raw`<p class="step-text">The exponential side integrates cleanly to \(4e^{3x}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            -\frac{1}{y}=4e^{3x}+C
          \]
</div>`
        },
        {
          title: raw`Use the initial condition`,
          previewHtml: raw`Substituting the condition gives \(C=-6\).`,
          workingHtml: raw`<p class="step-text">Substituting the condition gives \(C=-6\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            -6
          \]
</div>`
        },
        {
          title: raw`Evaluate at \(x=\frac{1}{3}\)`,
          previewHtml: raw`This is equivalent to \(-\frac{1}{4e-6}\).`,
          workingHtml: raw`<p class="step-text">This is equivalent to \(-\frac{1}{4e-6}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{1}{6-4e}\approx -0.2052
          \]
</div>

        <p class="step-text">Separate the variables:</p>
        <div class="math-block">
          \[
          y^{-2}\,dy=12e^{3x}\,dx
          \]
        </div>
        <p class="step-text">Integrate both sides:</p>
        <div class="math-block">
          \[
          \int y^{-2}\,dy=\int 12e^{3x}\,dx
          \]
          \[
          -\frac{1}{y}=4e^{3x}+C
          \]
        </div>
        <p class="step-text">Use \(y=0.5\) when \(x=0\):</p>
        <div class="math-block">
          \[
          -2=4+C
          \]
          \[
          C=-6
          \]
        </div>
        <p class="step-text">Now substitute \(x=\frac{1}{3}\):</p>
        <div class="math-block">
          \[
          -\frac{1}{y}=4e-6
          \]
          \[
          y=\frac{1}{6-4e}\approx -0.2052
          \]
        </div>
      `
        }
      ]
    }),
    "2d": createConfig("2d", raw`2024 Paper — Shaded area between \(y=\sin^2x\) and \(y=1\)`, {
      questionHtml: raw`
        <p class="step-text">The graph below shows part of the graph of the function \(y=\sin^2x\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-2d-int-2024" class="graph-svg" viewBox="0 0 470 310" aria-label="Shaded region between y equals sine squared x and y equals 1 from x equals negative pi over 2 to pi over 2" role="img"></svg>
        </div>
        <p class="step-text">Find the shaded area enclosed between the lines \(y=\sin^2x\), \(y=1\), \(x=-\frac{\pi}{2}\), and \(x=\frac{\pi}{2}\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`The top function is \(y=1\), so the area starts as \(\int (1-\sin^2x)\,dx\).`,
        raw`Use \(\sin^2x=\frac{1-\cos 2x}{2}\) to rewrite the integrand in a form that integrates neatly.`,
        raw`Be careful with the bounds: the sine term vanishes at both \(-\frac{\pi}{2}\) and \(\frac{\pi}{2}\).`
      ],
      answerHtml: raw`
        <p class="step-text">Set up the area using top minus bottom:</p>
        <div class="math-block">
          \[
          A=\int_{-\pi/2}^{\pi/2}(1-\sin^2x)\,dx
          \]
        </div>
        <p class="step-text">Use the double-angle identity:</p>
        <div class="math-block">
          \[
          \sin^2x=\frac{1-\cos 2x}{2}
          \]
          \[
          1-\sin^2x=1-\frac{1-\cos 2x}{2}=\frac{1}{2}+\frac{\cos 2x}{2}
          \]
        </div>
        <p class="step-text">Now integrate and evaluate:</p>
        <div class="math-block">
          \[
          A=\int_{-\pi/2}^{\pi/2}\left(\frac{1}{2}+\frac{\cos 2x}{2}\right)\,dx
          \]
          \[
          A=\left[\frac{x}{2}+\frac{\sin 2x}{4}\right]_{-\pi/2}^{\pi/2}
          \]
          \[
          =\left(\frac{\pi}{4}+0\right)-\left(-\frac{\pi}{4}+0\right)
          \]
          \[
          =\frac{\pi}{2}
          \]
        </div>
      `,
      afterRender: draw2dGraph,
      guidedSteps: [
        {
          title: raw`Set up the area`,
          previewHtml: raw`The line \(y=1\) sits above the curve \(y=\sin^2x\) on this interval.`,
          workingHtml: raw`<p class="step-text">The line \(y=1\) sits above the curve \(y=\sin^2x\) on this interval.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \int_{-\pi/2}^{\pi/2}(1-\sin^2x)\,dx
          \]
</div>`
        },
        {
          title: raw`Use the identity`,
          previewHtml: raw`This form integrates smoothly.`,
          workingHtml: raw`<p class="step-text">This form integrates smoothly.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{1}{2}+\frac{\cos 2x}{2}
          \]
</div>`
        },
        {
          title: raw`Integrate correctly`,
          previewHtml: raw`The cosine term integrates to \(\frac{\sin 2x}{4}\).`,
          workingHtml: raw`<p class="step-text">The cosine term integrates to \(\frac{\sin 2x}{4}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \left[\frac{x}{2}+\frac{\sin 2x}{4}\right]_{-\pi/2}^{\pi/2}
          \]
</div>`
        },
        {
          title: raw`Evaluate the area`,
          previewHtml: raw`The sine term vanishes at both bounds, leaving \(\frac{\pi}{4}-\left(-\frac{\pi}{4}\right)\).`,
          workingHtml: raw`<p class="step-text">The sine term vanishes at both bounds, leaving \(\frac{\pi}{4}-\left(-\frac{\pi}{4}\right)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{\pi}{2}
          \]
</div>

        <p class="step-text">Set up the area using top minus bottom:</p>
        <div class="math-block">
          \[
          A=\int_{-\pi/2}^{\pi/2}(1-\sin^2x)\,dx
          \]
        </div>
        <p class="step-text">Use the double-angle identity:</p>
        <div class="math-block">
          \[
          \sin^2x=\frac{1-\cos 2x}{2}
          \]
          \[
          1-\sin^2x=1-\frac{1-\cos 2x}{2}=\frac{1}{2}+\frac{\cos 2x}{2}
          \]
        </div>
        <p class="step-text">Now integrate and evaluate:</p>
        <div class="math-block">
          \[
          A=\int_{-\pi/2}^{\pi/2}\left(\frac{1}{2}+\frac{\cos 2x}{2}\right)\,dx
          \]
          \[
          A=\left[\frac{x}{2}+\frac{\sin 2x}{4}\right]_{-\pi/2}^{\pi/2}
          \]
          \[
          =\left(\frac{\pi}{4}+0\right)-\left(-\frac{\pi}{4}+0\right)
          \]
          \[
          =\frac{\pi}{2}
          \]
        </div>
      `
        }
      ]
    }),
    "2e": createConfig("2e", "2024 Paper — Logarithmic substitution for spherical mass", {
      questionHtml: raw`
        <p class="step-text">
          The mass, \(M\), of a spherical object, with radius \(p\), can be approximated by
          \[
          M=\int_0^p 4\pi r^2\frac{a}{1+br^3}\,dr,
          \]
          where \(a\), \(b\), and \(p\) are all positive constants.
        </p>
        <p class="step-text">Using this formula, find an expression for the mass \(M\), giving your answer in terms of \(a\), \(b\), \(p\), and \(\pi\).</p>
      `,
      hints: [
        raw`Factor the constants out first so the integral looks like \(\int \frac{r^2}{1+br^3}\,dr\).`,
        raw`The denominator has derivative \(3br^2\), so multiply and divide by \(3b\).`,
        raw`That creates a logarithmic antiderivative because \(\int \frac{u'}{u}\,dr=\ln|u|\).`
      ],
      answerHtml: raw`
        <p class="step-text">Pull the constants outside:</p>
        <div class="math-block">
          \[
          M=4\pi a\int_0^p\frac{r^2}{1+br^3}\,dr
          \]
        </div>
        <p class="step-text">Create the derivative of the denominator on top:</p>
        <div class="math-block">
          \[
          \frac{d}{dr}(1+br^3)=3br^2
          \]
          \[
          M=\frac{4\pi a}{3b}\int_0^p\frac{3br^2}{1+br^3}\,dr
          \]
        </div>
        <p class="step-text">Now integrate and evaluate:</p>
        <div class="math-block">
          \[
          M=\frac{4\pi a}{3b}\left[\ln|1+br^3|\right]_0^p
          \]
          \[
          M=\frac{4\pi a}{3b}\left(\ln(1+bp^3)-\ln 1\right)
          \]
          \[
          M=\frac{4\pi a}{3b}\ln(1+bp^3)
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Factor out the constants`,
          previewHtml: raw`Pulling out the constants makes the substitution step clearer.`,
          workingHtml: raw`<p class="step-text">Pulling out the constants makes the substitution step clearer.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            M=4\pi a\int_0^p\frac{r^2}{1+br^3}\,dr
          \]
</div>`
        },
        {
          title: raw`Create a logarithmic form`,
          previewHtml: raw`That is the key substitution idea behind the logarithm.`,
          workingHtml: raw`<p class="step-text">That is the key substitution idea behind the logarithm.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \text{It creates }3br^2,\text{ which is the derivative of }1+br^3.
          \]
</div>`
        },
        {
          title: raw`Integrate the logarithmic form`,
          previewHtml: raw`This is the standard logarithmic antiderivative.`,
          workingHtml: raw`<p class="step-text">This is the standard logarithmic antiderivative.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{4\pi a}{3b}\ln|1+br^3|+C
          \]
</div>`
        },
        {
          title: raw`Evaluate the bounds`,
          previewHtml: raw`The lower bound gives \(\ln 1=0\).`,
          workingHtml: raw`<p class="step-text">The lower bound gives \(\ln 1=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{4\pi a}{3b}\ln(1+bp^3)
          \]
</div>

        <p class="step-text">Pull the constants outside:</p>
        <div class="math-block">
          \[
          M=4\pi a\int_0^p\frac{r^2}{1+br^3}\,dr
          \]
        </div>
        <p class="step-text">Create the derivative of the denominator on top:</p>
        <div class="math-block">
          \[
          \frac{d}{dr}(1+br^3)=3br^2
          \]
          \[
          M=\frac{4\pi a}{3b}\int_0^p\frac{3br^2}{1+br^3}\,dr
          \]
        </div>
        <p class="step-text">Now integrate and evaluate:</p>
        <div class="math-block">
          \[
          M=\frac{4\pi a}{3b}\left[\ln|1+br^3|\right]_0^p
          \]
          \[
          M=\frac{4\pi a}{3b}\left(\ln(1+bp^3)-\ln 1\right)
          \]
          \[
          M=\frac{4\pi a}{3b}\ln(1+bp^3)
          \]
        </div>
      `
        }
      ]
    }),
    "3a": createConfig("3a", "2024 Paper — Integrating a sum of exponentials", {
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find } \int \left(e^{2x}+\frac{3}{e^{4x}}\right)\,dx.
          \]
        </div>
      `,
      hints: [
        raw`Rewrite \(\frac{3}{e^{4x}}\) as \(3e^{-4x}\) before integrating.`,
        raw`Each exponential integrates by dividing by the coefficient of \(x\) in the exponent.`,
        raw`This is an indefinite integral, so keep the \(+C\).`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite the second term first:</p>
        <div class="math-block">
          \[
          \frac{3}{e^{4x}}=3e^{-4x}
          \]
        </div>
        <p class="step-text">Now integrate term by term:</p>
        <div class="math-block">
          \[
          \int e^{2x}\,dx=\frac{e^{2x}}{2}
          \]
          \[
          \int 3e^{-4x}\,dx=-\frac{3e^{-4x}}{4}
          \]
          \[
          \int \left(e^{2x}+\frac{3}{e^{4x}}\right)\,dx
          =
          \frac{e^{2x}}{2}-\frac{3e^{-4x}}{4}+C
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Rewrite the integrand`,
          previewHtml: raw`This makes the power of \(e\) easy to integrate.`,
          workingHtml: raw`<p class="step-text">This makes the power of \(e\) easy to integrate.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{3}{e^{4x}}=3e^{-4x}
          \]
</div>`
        },
        {
          title: raw`Integrate each exponential`,
          previewHtml: raw`Each term has been integrated using reverse chain rule.`,
          workingHtml: raw`<p class="step-text">Each term has been integrated using reverse chain rule.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{e^{2x}}{2}-\frac{3e^{-4x}}{4}+C
          \]
</div>`
        },
        {
          title: raw`Identify the final result`,
          previewHtml: raw`This matches both exponential terms exactly.`,
          workingHtml: raw`<p class="step-text">This matches both exponential terms exactly.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{e^{2x}}{2}-\frac{3e^{-4x}}{4}+C
          \]
</div>

        <p class="step-text">Rewrite the second term first:</p>
        <div class="math-block">
          \[
          \frac{3}{e^{4x}}=3e^{-4x}
          \]
        </div>
        <p class="step-text">Now integrate term by term:</p>
        <div class="math-block">
          \[
          \int e^{2x}\,dx=\frac{e^{2x}}{2}
          \]
          \[
          \int 3e^{-4x}\,dx=-\frac{3e^{-4x}}{4}
          \]
          \[
          \int \left(e^{2x}+\frac{3}{e^{4x}}\right)\,dx
          =
          \frac{e^{2x}}{2}-\frac{3e^{-4x}}{4}+C
          \]
        </div>
      `
        }
      ]
    }),
    "3b": createConfig("3b", "2024 Paper — Solving a logarithmic differential equation", {
      questionHtml: raw`
        <p class="step-text">
          Solve the differential equation
          \[
          \frac{dy}{dx}=\frac{5}{4x-3},
          \]
          given that \(y=10\) when \(x=1\).
        </p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`This is a direct logarithmic antiderivative because the denominator is linear.`,
        raw`Integrating \(\frac{1}{4x-3}\) gives \(\frac{1}{4}\ln|4x-3|\).`,
        raw`Use the condition \(x=1\), \(y=10\) after finding the general solution.`
      ],
      answerHtml: raw`
        <p class="step-text">Integrate both sides:</p>
        <div class="math-block">
          \[
          y=\int \frac{5}{4x-3}\,dx
          \]
          \[
          y=\frac{5}{4}\ln|4x-3|+C
          \]
        </div>
        <p class="step-text">Use the condition \(y=10\) when \(x=1\):</p>
        <div class="math-block">
          \[
          10=\frac{5}{4}\ln|4(1)-3|+C
          \]
          \[
          10=\frac{5}{4}\ln 1+C
          \]
          \[
          C=10
          \]
        </div>
        <p class="step-text">So the solution is</p>
        <div class="math-block">
          \[
          y=\frac{5}{4}\ln|4x-3|+10
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Integrate the derivative`,
          previewHtml: raw`The logarithm comes from the \(\frac{1}{4x-3}\) form.`,
          workingHtml: raw`<p class="step-text">The logarithm comes from the \(\frac{1}{4x-3}\) form.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            y=\frac{5}{4}\ln|4x-3|+C
          \]
</div>`
        },
        {
          title: raw`Use the condition`,
          previewHtml: raw`Since \(\ln 1=0\), the logarithm disappears and \(C=10\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              10=\frac{5}{4}\ln|4(1)-3|+C
              \]
            </div>

<p class="step-text">Since \(\ln 1=0\), the logarithm disappears and \(C=10\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  10
  \]
</div>
</div>`
        },
        {
          title: raw`Write the fitted solution`,
          previewHtml: raw`This is the fitted solution after using the initial condition.`,
          workingHtml: raw`<p class="step-text">This is the fitted solution after using the initial condition.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            y=\frac{5}{4}\ln|4x-3|+10
          \]
</div>

        <p class="step-text">Integrate both sides:</p>
        <div class="math-block">
          \[
          y=\int \frac{5}{4x-3}\,dx
          \]
          \[
          y=\frac{5}{4}\ln|4x-3|+C
          \]
        </div>
        <p class="step-text">Use the condition \(y=10\) when \(x=1\):</p>
        <div class="math-block">
          \[
          10=\frac{5}{4}\ln|4(1)-3|+C
          \]
          \[
          10=\frac{5}{4}\ln 1+C
          \]
          \[
          C=10
          \]
        </div>
        <p class="step-text">So the solution is</p>
        <div class="math-block">
          \[
          y=\frac{5}{4}\ln|4x-3|+10
          \]
        </div>
      `
        }
      ]
    }),
    "3c": createConfig("3c", "2024 Paper — Definite integral with a logarithmic parameter", {
      questionHtml: raw`
        <p class="step-text">
          Find the value of \(m\), given that
          \[
          \int_{-1}^{m}\frac{4x+5}{2x+3}\,dx=2m.
          \]
        </p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`Start by rewriting the fraction so it looks like a constant plus a simple reciprocal term.`,
        raw`A useful decomposition is \(\frac{4x+5}{2x+3}=2-\frac{1}{2x+3}\).`,
        raw`After evaluating the lower bound \(x=-1\), the \(2m\) terms cancel and leave a logarithmic equation.`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite the integrand first:</p>
        <div class="math-block">
          \[
          \frac{4x+5}{2x+3}
          =
          \frac{2(2x+3)-1}{2x+3}
          =
          2-\frac{1}{2x+3}
          \]
        </div>
        <p class="step-text">Now integrate and apply the bounds:</p>
        <div class="math-block">
          \[
          \int\left(2-\frac{1}{2x+3}\right)\,dx
          =
          2x-\frac{1}{2}\ln|2x+3|+C
          \]
          \[
          \left[2x-\frac{1}{2}\ln|2x+3|\right]_{-1}^{m}=2m
          \]
          \[
          2m-\frac{1}{2}\ln|2m+3|-(-2)=2m
          \]
          \[
          \frac{1}{2}\ln|2m+3|=2
          \]
        </div>
        <p class="step-text">Solve the logarithmic equation:</p>
        <div class="math-block">
          \[
          \ln|2m+3|=4
          \]
          \[
          |2m+3|=e^4
          \]
          \[
          2m+3=e^4
          \]
          \[
          m=\frac{e^4-3}{2}\approx 25.799
          \]
        </div>
        <p class="step-text">The negative branch would cross the asymptote at \(x=-\frac{3}{2}\), so it is not valid for this definite integral.</p>
      `,
      guidedSteps: [
        {
          title: raw`Decompose the fraction`,
          previewHtml: raw`This splits the fraction into something easy to integrate.`,
          workingHtml: raw`<p class="step-text">This splits the fraction into something easy to integrate.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{4x+5}{2x+3}=2-\frac{1}{2x+3}
          \]
</div>`
        },
        {
          title: raw`Integrate the rewrite`,
          previewHtml: raw`The coefficient \(\frac{1}{2}\) comes from the inside derivative \(2\).`,
          workingHtml: raw`<p class="step-text">The coefficient \(\frac{1}{2}\) comes from the inside derivative \(2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            2x-\frac{1}{2}\ln|2x+3|+C
          \]
</div>`
        },
        {
          title: raw`Use the bounds`,
          previewHtml: raw`This is the key equation after evaluating the lower bound.`,
          workingHtml: raw`<p class="step-text">This is the key equation after evaluating the lower bound.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            2m-\frac{1}{2}\ln|2m+3|+2=2m
          \]
</div>`
        },
        {
          title: raw`Solve for \(m\)`,
          previewHtml: raw`This is the valid solution for the definite integral.`,
          workingHtml: raw`<p class="step-text">This is the valid solution for the definite integral.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{e^4-3}{2}\approx 25.799
          \]
</div>

        <p class="step-text">Rewrite the integrand first:</p>
        <div class="math-block">
          \[
          \frac{4x+5}{2x+3}
          =
          \frac{2(2x+3)-1}{2x+3}
          =
          2-\frac{1}{2x+3}
          \]
        </div>
        <p class="step-text">Now integrate and apply the bounds:</p>
        <div class="math-block">
          \[
          \int\left(2-\frac{1}{2x+3}\right)\,dx
          =
          2x-\frac{1}{2}\ln|2x+3|+C
          \]
          \[
          \left[2x-\frac{1}{2}\ln|2x+3|\right]_{-1}^{m}=2m
          \]
          \[
          2m-\frac{1}{2}\ln|2m+3|-(-2)=2m
          \]
          \[
          \frac{1}{2}\ln|2m+3|=2
          \]
        </div>
        <p class="step-text">Solve the logarithmic equation:</p>
        <div class="math-block">
          \[
          \ln|2m+3|=4
          \]
          \[
          |2m+3|=e^4
          \]
          \[
          2m+3=e^4
          \]
          \[
          m=\frac{e^4-3}{2}\approx 25.799
          \]
        </div>
        <p class="step-text">The negative branch would cross the asymptote at \(x=-\frac{3}{2}\), so it is not valid for this definite integral.</p>
      `
        }
      ]
    }),
    "3d": createConfig("3d", "2024 Paper — Splitting a cosine area into two equal parts", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(y=2\cos\left(\frac{x}{2}\right)\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3d-int-2024" class="graph-svg" viewBox="0 0 470 300" aria-label="Area under y equals 2 cosine x over 2 from x equals 0 to x equals pi, split into Area A and Area B by x equals k" role="img"></svg>
        </div>
        <p class="step-text">Find the value of \(k\) so that the shaded Area A will be equal to the shaded Area B.</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`If Area A equals Area B, each one must be half of the total shaded area.`,
        raw`Find the total area from \(x=0\) to \(x=\pi\) first.`,
        raw`Then set the area from \(0\) to \(k\) equal to half of the total and solve the trig equation.`
      ],
      answerHtml: raw`
        <p class="step-text">First find the total shaded area:</p>
        <div class="math-block">
          \[
          \int_0^{\pi}2\cos\left(\frac{x}{2}\right)\,dx
          =
          \left[4\sin\left(\frac{x}{2}\right)\right]_0^{\pi}
          =
          4
          \]
        </div>
        <p class="step-text">So each half must have area \(2\).</p>
        <p class="step-text">Now set Area A equal to \(2\):</p>
        <div class="math-block">
          \[
          \int_0^k2\cos\left(\frac{x}{2}\right)\,dx=2
          \]
          \[
          \left[4\sin\left(\frac{x}{2}\right)\right]_0^k=2
          \]
          \[
          4\sin\left(\frac{k}{2}\right)=2
          \]
          \[
          \sin\left(\frac{k}{2}\right)=\frac{1}{2}
          \]
        </div>
        <p class="step-text">Because \(0&lt;k&lt;\pi\), we have \(0&lt;\frac{k}{2}&lt;\frac{\pi}{2}\), so</p>
        <div class="math-block">
          \[
          \frac{k}{2}=\frac{\pi}{6}
          \]
          \[
          k=\frac{\pi}{3}
          \]
        </div>
      `,
      afterRender: draw3dGraph,
      guidedSteps: [
        {
          title: raw`Find the total area`,
          previewHtml: raw`\(\left[4\sin\left(\frac{x}{2}\right)\right]_0^{\pi}=4\).`,
          workingHtml: raw`<p class="step-text">\(\left[4\sin\left(\frac{x}{2}\right)\right]_0^{\pi}=4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            4
          \]
</div>`
        },
        {
          title: raw`Set Area A equal to half`,
          previewHtml: raw`That sets the left-hand area equal to half of the total.`,
          workingHtml: raw`<p class="step-text">That sets the left-hand area equal to half of the total.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \left[4\sin\left(\frac{x}{2}\right)\right]_0^k=2
          \]
</div>`
        },
        {
          title: raw`Solve the trig equation`,
          previewHtml: raw`After evaluating the antiderivative, that is the equation to solve.`,
          workingHtml: raw`<p class="step-text">After evaluating the antiderivative, that is the equation to solve.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \sin\left(\frac{k}{2}\right)=\frac{1}{2}
          \]
</div>`
        },
        {
          title: raw`Identify the valid value`,
          previewHtml: raw`Since \(0&lt;\frac{k}{2}&lt;\frac{\pi}{2}\), the valid angle is \(\frac{\pi}{6}\).`,
          workingHtml: raw`<p class="step-text">Since \(0&lt;\frac{k}{2}&lt;\frac{\pi}{2}\), the valid angle is \(\frac{\pi}{6}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{\pi}{3}
          \]
</div>

        <p class="step-text">First find the total shaded area:</p>
        <div class="math-block">
          \[
          \int_0^{\pi}2\cos\left(\frac{x}{2}\right)\,dx
          =
          \left[4\sin\left(\frac{x}{2}\right)\right]_0^{\pi}
          =
          4
          \]
        </div>
        <p class="step-text">So each half must have area \(2\).</p>
        <p class="step-text">Now set Area A equal to \(2\):</p>
        <div class="math-block">
          \[
          \int_0^k2\cos\left(\frac{x}{2}\right)\,dx=2
          \]
          \[
          \left[4\sin\left(\frac{x}{2}\right)\right]_0^k=2
          \]
          \[
          4\sin\left(\frac{k}{2}\right)=2
          \]
          \[
          \sin\left(\frac{k}{2}\right)=\frac{1}{2}
          \]
        </div>
        <p class="step-text">Because \(0&lt;k&lt;\pi\), we have \(0&lt;\frac{k}{2}&lt;\frac{\pi}{2}\), so</p>
        <div class="math-block">
          \[
          \frac{k}{2}=\frac{\pi}{6}
          \]
          \[
          k=\frac{\pi}{3}
          \]
        </div>
      `
        }
      ]
    }),
    "3e": createConfig("3e", "2024 Paper — Newton's law of cooling model", {
      questionHtml: raw`
        <p class="step-text">A teacher makes a cup of coffee at the start of the interval. The teacher leaves the cup of coffee in the staff room where the temperature is \(18^\circ\text{C}\).</p>
        <p class="step-text">After \(30\) minutes, the temperature of the cup of coffee is \(50^\circ\text{C}\).</p>
        <p class="step-text">When the teacher returns again, after a further one hour, the cup of coffee has cooled down to a temperature of \(30^\circ\text{C}\).</p>
        <p class="step-text">The rate at which the temperature of the cup of coffee changes at any instant is proportional to the difference between the temperature of the cup of coffee, \(N\), and the temperature of the room.</p>
        <p class="step-text">Write a differential equation that models this situation, and then solve it to calculate the temperature of the cup of coffee when it was made.</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`The cooling law compares the coffee temperature to the room temperature \(18^\circ\text{C}\), so the model is \(\frac{dN}{dt}=-k(N-18)\).`,
        raw`Solving the differential equation gives \(N=18+Ce^{-kt}\).`,
        raw`Use \(N(30)=50\) and \(N(90)=30\), then divide the equations to eliminate \(C\).`
      ],
      answerHtml: raw`
        <p class="step-text">Model the cooling with</p>
        <div class="math-block">
          \[
          \frac{dN}{dt}=-k(N-18)
          \]
        </div>
        <p class="step-text">Separate and integrate:</p>
        <div class="math-block">
          \[
          \frac{dN}{N-18}=-k\,dt
          \]
          \[
          \ln|N-18|=-kt+C_1
          \]
          \[
          N=18+Ce^{-kt}
          \]
        </div>
        <p class="step-text">Use the two temperature readings:</p>
        <div class="math-block">
          \[
          50=18+Ce^{-30k}
          \Rightarrow 32=Ce^{-30k}
          \]
          \[
          30=18+Ce^{-90k}
          \Rightarrow 12=Ce^{-90k}
          \]
        </div>
        <p class="step-text">Divide the equations to eliminate \(C\):</p>
        <div class="math-block">
          \[
          \frac{12}{32}=e^{-60k}
          \]
          \[
          k=\frac{\ln(8/3)}{60}
          \]
        </div>
        <p class="step-text">Then find \(C\):</p>
        <div class="math-block">
          \[
          C=\frac{32}{e^{-30k}}\approx 52.256
          \]
        </div>
        <p class="step-text">So the original temperature was</p>
        <div class="math-block">
          \[
          N(0)=18+C\approx 18+52.256=70.256^\circ\text{C}
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Write the model`,
          previewHtml: raw`The negative sign captures cooling toward the room temperature.`,
          workingHtml: raw`<p class="step-text">The negative sign captures cooling toward the room temperature.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{dN}{dt}=-k(N-18)
          \]
</div>`
        },
        {
          title: raw`Solve the differential equation`,
          previewHtml: raw`The excess temperature above room temperature decays exponentially.`,
          workingHtml: raw`<p class="step-text">The excess temperature above room temperature decays exponentially.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            N=18+Ce^{-kt}
          \]
</div>`
        },
        {
          title: raw`Use the two data points`,
          previewHtml: raw`Subtracting \(18\) from each measured temperature gives these two equations.`,
          workingHtml: raw`<p class="step-text">Subtracting \(18\) from each measured temperature gives these two equations.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            32=Ce^{-30k},\quad 12=Ce^{-90k}
          \]
</div>`
        },
        {
          title: raw`Eliminate the constant`,
          previewHtml: raw`This removes \(C\) and leaves a clean equation for \(k\).`,
          workingHtml: raw`<p class="step-text">This removes \(C\) and leaves a clean equation for \(k\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{12}{32}=e^{-60k}
          \]
</div>`
        },
        {
          title: raw`Find the original temperature`,
          previewHtml: raw`The initial temperature is \(18+C\approx 18+52.256\).`,
          workingHtml: raw`<p class="step-text">The initial temperature is \(18+C\approx 18+52.256\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            70.256^\circ\text{C}
          \]
</div>

        <p class="step-text">Model the cooling with</p>
        <div class="math-block">
          \[
          \frac{dN}{dt}=-k(N-18)
          \]
        </div>
        <p class="step-text">Separate and integrate:</p>
        <div class="math-block">
          \[
          \frac{dN}{N-18}=-k\,dt
          \]
          \[
          \ln|N-18|=-kt+C_1
          \]
          \[
          N=18+Ce^{-kt}
          \]
        </div>
        <p class="step-text">Use the two temperature readings:</p>
        <div class="math-block">
          \[
          50=18+Ce^{-30k}
          \Rightarrow 32=Ce^{-30k}
          \]
          \[
          30=18+Ce^{-90k}
          \Rightarrow 12=Ce^{-90k}
          \]
        </div>
        <p class="step-text">Divide the equations to eliminate \(C\):</p>
        <div class="math-block">
          \[
          \frac{12}{32}=e^{-60k}
          \]
          \[
          k=\frac{\ln(8/3)}{60}
          \]
        </div>
        <p class="step-text">Then find \(C\):</p>
        <div class="math-block">
          \[
          C=\frac{32}{e^{-30k}}\approx 52.256
          \]
        </div>
        <p class="step-text">So the original temperature was</p>
        <div class="math-block">
          \[
          N(0)=18+C\approx 18+52.256=70.256^\circ\text{C}
          \]
        </div>
      `
        }
      ]
    })
  };
}());
