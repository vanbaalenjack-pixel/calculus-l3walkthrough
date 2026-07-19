(function () {
  const raw = String.raw;
  const paperHref = "level-3-integration-2025.html";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return "int-" + id + "2025.html";
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
      browserTitle: "2025 Integration Paper — " + questionLabel(id),
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

  function lineMarkup(scale, x1, y1, x2, y2, className, extra) {
    return `<line class="${className}" x1="${scale.x(x1)}" y1="${scale.y(y1)}" x2="${scale.x(x2)}" y2="${scale.y(y2)}"${extra || ""}></line>`;
  }

  function circleMarkup(scale, x, y, radius, className, extra) {
    return `<circle class="${className}" cx="${scale.x(x)}" cy="${scale.y(y)}" r="${radius}"${extra || ""}></circle>`;
  }

  function textMarkup(scale, x, y, text, className, extra) {
    return `<text class="${className}" x="${scale.x(x)}" y="${scale.y(y)}"${extra || ""}>${text}</text>`;
  }

  function draw1dAreaGraph() {
    const svg = document.getElementById("question-graph-1d-int");

    if (!svg) {
      return;
    }

    const width = 460;
    const height = 300;
    const padding = 32;
    const xMax = Math.PI / 6;
    const scale = createScale(width, height, padding, -0.035, xMax + 0.06, -0.25, 4.15);
    const curvePath = functionPath(function (x) {
      return 4 * Math.sin(5 * x) * Math.cos(3 * x);
    }, 0, xMax, 0.006, scale);
    const areaPath = shadedAreaPath(function (x) {
      return 4 * Math.sin(5 * x) * Math.cos(3 * x);
    }, 0, xMax, 0, 0.006, scale);

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -0.035, 0, xMax + 0.06, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -0.25, 0, 4.15, "graph-axis")}
      <path class="question-shade" d="${areaPath}"></path>
      <path class="question-curve" d="${curvePath}"></path>
      ${textMarkup(scale, xMax - 0.004, -0.12, "π/6", "graph-label", ' text-anchor="end"')}
      ${textMarkup(scale, xMax + 0.052, -0.05, "x", "question-axis-label")}
      ${textMarkup(scale, -0.008, 4.04, "y", "question-axis-label")}
      ${textMarkup(scale, 0.36, 2.56, "y = 4 sin(5x) cos(3x)", "graph-equation-label", ' text-anchor="middle"')}
      <rect class="graph-chip" x="320" y="52" width="112" height="44" rx="12"></rect>
      <text class="graph-label" x="376" y="70" text-anchor="middle">Diagram is</text>
      <text class="graph-label" x="376" y="88" text-anchor="middle">not to scale</text>
    `;
  }

  function draw2eGraph() {
    const svg = document.getElementById("question-graph-2e-int");

    if (!svg) {
      return;
    }

    const width = 460;
    const height = 300;
    const padding = 30;
    const xMax = Math.PI / 2;
    const scale = createScale(width, height, padding, -0.08, xMax + 0.08, -0.01, 0.16);
    const fn = function (x) {
      return Math.pow(Math.sin(x), 3) * Math.pow(Math.cos(x), 3);
    };
    const curvePath = functionPath(fn, 0, xMax, 0.01, scale);
    const areaPath = shadedAreaPath(fn, 0, xMax, 0, 0.01, scale);

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -0.08, 0, xMax + 0.08, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -0.01, 0, 0.16, "graph-axis")}
      <path class="question-shade" d="${areaPath}"></path>
      <path class="question-curve" d="${curvePath}"></path>
      ${circleMarkup(scale, xMax, 0, 4.2, "question-origin")}
      ${textMarkup(scale, xMax - 0.02, 0.014, "(π/2, 0)", "graph-label", ' text-anchor="end"')}
      ${textMarkup(scale, 1.18, 0.11, "y = sin³x cos³x", "graph-equation-label", ' text-anchor="middle"')}
      ${textMarkup(scale, xMax + 0.07, -0.005, "x", "question-axis-label")}
      ${textMarkup(scale, -0.012, 0.153, "y", "question-axis-label")}
      <rect class="graph-chip" x="310" y="42" width="116" height="44" rx="12"></rect>
      <text class="graph-label" x="368" y="60" text-anchor="middle">Diagram is</text>
      <text class="graph-label" x="368" y="78" text-anchor="middle">not to scale</text>
    `;
  }

  function draw3aHoleGraph() {
    const svg = document.getElementById("question-graph-3a-int");

    if (!svg) {
      return;
    }

    const width = 520;
    const height = 280;
    const topY = 96;
    const scaleY = 40;
    const xMarks = [64, 164, 264, 364, 464];
    const depths = [2.12, 2.32, 2.65, 2.54, 1.88];
    const points = xMarks.map(function (x, index) {
      return [x, topY + depths[index] * scaleY];
    });
    const holePath = [
      `M ${xMarks[0]} ${topY}`,
      `L ${xMarks[0]} ${points[0][1]}`,
      `Q 112 ${points[0][1] + 10} ${points[1][0]} ${points[1][1]}`,
      `Q 214 ${points[1][1] + 28} ${points[2][0]} ${points[2][1]}`,
      `Q 314 ${points[2][1] - 8} ${points[3][0]} ${points[3][1]}`,
      `Q 414 ${points[3][1] - 6} ${points[4][0]} ${points[4][1]}`,
      `L ${xMarks[4]} ${topY}`,
      "Z"
    ].join(" ");
    const topLabels = [114, 214, 314, 414];
    const depthLabelPositions = [
      { x: 88, y: 156, value: "2.12" },
      { x: 176, y: 154, value: "2.32" },
      { x: 276, y: 170, value: "2.65" },
      { x: 376, y: 164, value: "2.54" },
      { x: 448, y: 140, value: "1.88" }
    ];

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      <path class="graph-soil" d="M 0 76 L 520 76 L 520 252 L 0 252 Z"></path>
      <path class="graph-hole" d="${holePath}"></path>
      <line class="graph-measure-soft" x1="${xMarks[0]}" y1="44" x2="${xMarks[4]}" y2="44"></line>
      ${xMarks.map(function (x) {
        return `<line class="graph-measure-soft" x1="${x}" y1="38" x2="${x}" y2="50"></line>`;
      }).join("")}
      ${topLabels.map(function (x) {
        return `<text class="graph-label" x="${x}" y="36" text-anchor="middle">5</text>`;
      }).join("")}
      ${xMarks.map(function (x, index) {
        return `<line class="graph-guide" x1="${x}" y1="${topY}" x2="${x}" y2="${points[index][1]}"></line>`;
      }).join("")}
      ${depthLabelPositions.map(function (label) {
        return `<text class="graph-label" x="${label.x}" y="${label.y}" text-anchor="middle">${label.value}</text>`;
      }).join("")}
      <rect class="graph-chip" x="18" y="18" width="114" height="44" rx="12"></rect>
      <text class="graph-label" x="75" y="36" text-anchor="middle">Diagram is</text>
      <text class="graph-label" x="75" y="54" text-anchor="middle">not to scale</text>
      <rect class="graph-chip" x="194" y="18" width="138" height="44" rx="12"></rect>
      <text class="graph-label" x="263" y="36" text-anchor="middle">All lengths are</text>
      <text class="graph-label" x="263" y="54" text-anchor="middle">in metres</text>
    `;
  }

  function draw3dAreaGraph() {
    const svg = document.getElementById("question-graph-3d-int");

    if (!svg) {
      return;
    }

    const width = 450;
    const height = 280;
    const padding = 34;
    const scale = createScale(width, height, padding, -0.05, 2.35, -0.4, 7.8);
    const fn = function (x) {
      return (x * x + 6) / Math.pow(x, 4);
    };
    const curvePath = functionPath(fn, 1, 2.12, 0.01, scale);
    const areaPath = shadedAreaPath(fn, 1, 2, 0, 0.01, scale);

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -0.05, 0, 2.35, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -0.4, 0, 7.8, "graph-axis")}
      ${lineMarkup(scale, 1, 0, 1, fn(1), "graph-guide")}
      ${lineMarkup(scale, 2, 0, 2, fn(2), "graph-guide")}
      <path class="question-shade" d="${areaPath}"></path>
      <path class="question-curve" d="${curvePath}"></path>
      ${circleMarkup(scale, 0, 0, 4.2, "question-origin")}
      ${textMarkup(scale, 1, -0.18, "p", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 2, -0.18, "2p", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 1.62, 2.55, "y = (x² + 6) / x⁴", "graph-equation-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 2.32, -0.03, "x", "question-axis-label")}
      ${textMarkup(scale, -0.02, 7.62, "y", "question-axis-label")}
      <rect class="graph-chip" x="80" y="28" width="114" height="44" rx="12"></rect>
      <text class="graph-label" x="137" y="46" text-anchor="middle">Diagram is</text>
      <text class="graph-label" x="137" y="64" text-anchor="middle">not to scale</text>
    `;
  }

  function draw3eArtGraph() {
    const svg = document.getElementById("question-graph-3e-int");

    if (!svg) {
      return;
    }

    const width = 470;
    const height = 300;
    const padding = 32;
    const scale = createScale(width, height, padding, -0.05, 3.18, -1.5, 51);
    const fn = function (x) {
      return Math.pow(x * x + 3, 2) / 3;
    };
    const curvePath = functionPath(fn, 0, 3, 0.02, scale);
    const areaPath = shadedAreaPath(fn, 0, 3, 0, 0.02, scale);

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -0.05, 0, 3.18, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -1.5, 0, 51, "graph-axis")}
      ${lineMarkup(scale, 1, 0, 1, 44, "graph-guide")}
      ${lineMarkup(scale, 2, 0, 2, 44, "graph-guide")}
      <path class="question-shade" d="${areaPath}"></path>
      <path class="question-curve" d="${curvePath}"></path>
      ${textMarkup(scale, 1.96, 20, "f(x) = (x² + 3)² / 3", "graph-equation-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 3.12, -0.24, "x", "question-axis-label")}
      ${textMarkup(scale, -0.02, 49.6, "y", "question-axis-label")}
      ${textMarkup(scale, 1, -0.18, "1", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 2, -0.18, "2", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 3, -0.18, "3", "graph-label", ' text-anchor="middle"')}
      <rect class="graph-chip" x="342" y="36" width="112" height="44" rx="12"></rect>
      <text class="graph-label" x="398" y="54" text-anchor="middle">Diagram is</text>
      <text class="graph-label" x="398" y="72" text-anchor="middle">not to scale</text>
    `;
  }

  window.Integration2025Walkthroughs = {
    "1a": createConfig("1a", "2025 Paper — Reverse sec-tan antiderivative", {
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find } \int 6\sec(3x)\tan(3x)\,dx.
          \]
        </div>
      `,
      hints: [
        raw`Look for a function whose derivative already contains \(\sec(3x)\tan(3x)\).`,
        raw`The derivative of \(\sec(kx)\) produces a factor of \(k\sec(kx)\tan(kx)\).`,
        raw`Once you match the pattern, divide by the inside coefficient and remember the constant of integration.`
      ],
      answerHtml: raw`
        <p class="step-text">Use the reverse derivative of \(\sec(3x)\):</p>
        <div class="math-block">
          \[
          \frac{d}{dx}\bigl(\sec(3x)\bigr)=3\sec(3x)\tan(3x)
          \]
          \[
          \int 6\sec(3x)\tan(3x)\,dx=2\sec(3x)+C
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Spot the pattern`,
          previewHtml: raw`The integrand already matches the derivative pattern for \(\sec(kx)\).`,
          workingHtml: raw`<p class="step-text">The integrand already matches the derivative pattern for \(\sec(kx)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{d}{dx}\bigl(\sec(kx)\bigr)=k\sec(kx)\tan(kx)
          \]
</div>`
        },
        {
          title: raw`Adjust for the inside coefficient`,
          previewHtml: raw`The \(6\) becomes \(6 \div 3 = 2\) when we reverse the chain rule.`,
          workingHtml: raw`<p class="step-text">The \(6\) becomes \(6 \div 3 = 2\) when we reverse the chain rule.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            2
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
            2\sec(3x)+C
          \]
</div>

        <p class="step-text">Use the reverse derivative of \(\sec(3x)\):</p>
        <div class="math-block">
          \[
          \frac{d}{dx}\bigl(\sec(3x)\bigr)=3\sec(3x)\tan(3x)
          \]
          \[
          \int 6\sec(3x)\tan(3x)\,dx=2\sec(3x)+C
          \]
        </div>
      `
        }
      ]
    }),
    "1b": createConfig("1b", raw`2025 Paper — Solving by integrating and fitting \(C\)`, {
      questionHtml: raw`
        <p class="step-text">
          Solve the differential equation
          \[
          \frac{dy}{dx}=3\sqrt{x}+\frac{2}{\sqrt{x}},
          \]
          given that \(y=10\) when \(x=4\).
        </p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`Rewrite the derivative in index form before integrating.`,
        raw`Find the general antiderivative first, then substitute \(x=4\) and \(y=10\).`,
        raw`After finding \(C\), put it back into the general solution.`
      ],
      answerHtml: raw`
        <p class="step-text">Integrate term by term:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=3x^{1/2}+2x^{-1/2}
          \]
          \[
          y=2x^{3/2}+4x^{1/2}+C
          \]
          \[
          10=2(4)^{3/2}+4(4)^{1/2}+C
          \]
          \[
          C=-14
          \]
          \[
          y=2x^{3/2}+4x^{1/2}-14
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Integrate to get the general solution`,
          previewHtml: raw`Increase each power by \(1\), divide by the new power, and keep the constant of integration.`,
          workingHtml: raw`<p class="step-text">Increase each power by \(1\), divide by the new power, and keep the constant of integration.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            y=2x^{3/2}+4x^{1/2}+C
          \]
</div>`
        },
        {
          title: raw`Find the constant`,
          previewHtml: raw`Substituting \(x=4\) gives \(10=16+8+C\), so \(C=-14\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              y=2x^{3/2}+4x^{1/2}+C
              \]
              \[
              10=2(4)^{3/2}+4(4)^{1/2}+C
              \]
            </div>

<p class="step-text">Substituting \(x=4\) gives \(10=16+8+C\), so \(C=-14\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  -14
  \]
</div>
</div>`
        },
        {
          title: raw`Write the fitted solution`,
          previewHtml: raw`That is the general antiderivative with the fitted constant included.`,
          workingHtml: raw`<p class="step-text">That is the general antiderivative with the fitted constant included.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            y=2x^{3/2}+4x^{1/2}-14
          \]
</div>

        <p class="step-text">Integrate term by term:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=3x^{1/2}+2x^{-1/2}
          \]
          \[
          y=2x^{3/2}+4x^{1/2}+C
          \]
          \[
          10=2(4)^{3/2}+4(4)^{1/2}+C
          \]
          \[
          C=-14
          \]
          \[
          y=2x^{3/2}+4x^{1/2}-14
          \]
        </div>
      `
        }
      ]
    }),
    "1c": createConfig("1c", "2025 Paper — Constants from linked definite integrals", {
      questionHtml: raw`
        <p class="step-text">
          It is given that
          \[
          \int_{1}^{2}\left(a-\frac{6k}{x^2}\right)\,dx=3
          \quad \text{and} \quad
          \int_{1}^{k}6x\,dx=a,
          \]
          where \(a\) and \(k\) are constants.
        </p>
        <p class="step-text">Determine the possible value(s) of \(k\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`Use the first integral to write \(a\) in terms of \(k\).`,
        raw`For \(a-\frac{6k}{x^2}\), integrating the \(x^{-2}\) term gives a positive \(\frac{6k}{x}\).`,
        raw`Then use \(\int_1^k 6x\,dx=a\) to make an equation in \(k\) only.`
      ],
      answerHtml: raw`
        <p class="step-text">Start with the first integral:</p>
        <div class="math-block">
          \[
          F(x)=ax+\frac{6k}{x}
          \]
          \[
          \left(2a+3k\right)-\left(a+6k\right)=3
          \]
          \[
          a-3k=3
          \]
          \[
          a=3+3k
          \]
        </div>
        <p class="step-text">Now use the second integral:</p>
        <div class="math-block">
          \[
          \int_1^k 6x\,dx=3k^2-3=a
          \]
          \[
          3k^2-3=3+3k
          \]
          \[
          k^2-k-2=0
          \]
          \[
          (k+1)(k-2)=0
          \]
          \[
          k=-1 \text{ or } k=2
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Integrate the first expression`,
          previewHtml: raw`The constant term integrates to \(ax\), and the \(x^{-2}\) term becomes a positive \(x^{-1}\) term.`,
          workingHtml: raw`<p class="step-text">The constant term integrates to \(ax\), and the \(x^{-2}\) term becomes a positive \(x^{-1}\) term.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            F(x)=ax+\frac{6k}{x}
          \]
</div>`
        },
        {
          title: raw`Use the first integral to link \(a\) and \(k\)`,
          previewHtml: raw`Evaluating \(F(2)-F(1)\) gives \(a-3k=3\), so \(a=3+3k\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \left[ax+\frac{6k}{x}\right]_1^2=3
              \]
              \[
              \left(2a+3k\right)-\left(a+6k\right)=3
              \]
            </div>

<p class="step-text">Evaluating \(F(2)-F(1)\) gives \(a-3k=3\), so \(a=3+3k\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            a=3+3k
          \]
</div>`
        },
        {
          title: raw`Solve for \(k\)`,
          previewHtml: raw`The quadratic factorises as \((k+1)(k-2)=0\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \int_1^k 6x\,dx=3k^2-3
              \]
              \[
              3k^2-3=3+3k
              \]
              \[
              k^2-k-2=0
              \]
            </div>

<p class="step-text">The quadratic factorises as \((k+1)(k-2)=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            k=-1 \text{ or } k=2
          \]
</div>

        <p class="step-text">Start with the first integral:</p>
        <div class="math-block">
          \[
          F(x)=ax+\frac{6k}{x}
          \]
          \[
          \left(2a+3k\right)-\left(a+6k\right)=3
          \]
          \[
          a-3k=3
          \]
          \[
          a=3+3k
          \]
        </div>
        <p class="step-text">Now use the second integral:</p>
        <div class="math-block">
          \[
          \int_1^k 6x\,dx=3k^2-3=a
          \]
          \[
          3k^2-3=3+3k
          \]
          \[
          k^2-k-2=0
          \]
          \[
          (k+1)(k-2)=0
          \]
          \[
          k=-1 \text{ or } k=2
          \]
        </div>
      `
        }
      ]
    }),
    "1d": createConfig("1d", "2025 Paper — Product-to-sum area under a trig curve", {
      questionHtml: raw`
        <p class="step-text">The graph below shows part of the graph of the function \(y=4\sin(5x)\cos(3x)\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-1d-int" class="graph-svg" viewBox="0 0 460 300" aria-label="Shaded region under y equals 4 sine 5x cosine 3x from x equals 0 to pi over 6" role="img"></svg>
        </div>
        <p class="step-text">Find the shaded area under the curve between \(x=0\) and \(x=\frac{\pi}{6}\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`Use the product-to-sum identity \(2\sin A \cos B=\sin(A+B)+\sin(A-B)\).`,
        raw`That turns the integrand into a sum of two sine terms, which are much easier to integrate.`,
        raw`After integrating, substitute the bounds \(0\) and \(\frac{\pi}{6}\) carefully.`
      ],
      answerHtml: raw`
        <p class="step-text">First rewrite the product:</p>
        <div class="math-block">
          \[
          4\sin(5x)\cos(3x)=2\bigl(2\sin(5x)\cos(3x)\bigr)=2\sin(8x)+2\sin(2x)
          \]
        </div>
        <p class="step-text">Now integrate and evaluate:</p>
        <div class="math-block">
          \[
          \int_{0}^{\pi/6}\left(2\sin(8x)+2\sin(2x)\right)\,dx
          =
          \left[-\frac{\cos(8x)}{4}-\cos(2x)\right]_{0}^{\pi/6}
          \]
          \[
          =-\frac{3}{8}-(-1.25)=0.875
          \]
        </div>
        <p class="step-text">So the shaded area is \(\frac{7}{8}\) square units.</p>
      `,
      afterRender: draw1dAreaGraph,
      guidedSteps: [
        {
          title: raw`Rewrite the integrand`,
          previewHtml: raw`Multiply the identity by the outside factor \(2\) to get both sine terms with coefficient \(2\).`,
          workingHtml: raw`<p class="step-text">Multiply the identity by the outside factor \(2\) to get both sine terms with coefficient \(2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            2\sin(8x)+2\sin(2x)
          \]
</div>`
        },
        {
          title: raw`Set up the definite integral`,
          previewHtml: raw`Each coefficient has been simplified correctly after integrating.`,
          workingHtml: raw`<p class="step-text">Each coefficient has been simplified correctly after integrating.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \left[-\frac{\cos(8x)}{4}-\cos(2x)\right]_{0}^{\pi/6}
          \]
</div>`
        },
        {
          title: raw`Finish the area`,
          previewHtml: raw`The evaluated difference is \(0.875=\frac{7}{8}\).`,
          workingHtml: raw`<p class="step-text">The evaluated difference is \(0.875=\frac{7}{8}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{7}{8}
          \]
</div>

        <p class="step-text">First rewrite the product:</p>
        <div class="math-block">
          \[
          4\sin(5x)\cos(3x)=2\bigl(2\sin(5x)\cos(3x)\bigr)=2\sin(8x)+2\sin(2x)
          \]
        </div>
        <p class="step-text">Now integrate and evaluate:</p>
        <div class="math-block">
          \[
          \int_{0}^{\pi/6}\left(2\sin(8x)+2\sin(2x)\right)\,dx
          =
          \left[-\frac{\cos(8x)}{4}-\cos(2x)\right]_{0}^{\pi/6}
          \]
          \[
          =-\frac{3}{8}-(-1.25)=0.875
          \]
        </div>
        <p class="step-text">So the shaded area is \(\frac{7}{8}\) square units.</p>
      `
        }
      ]
    }),
    "1e": createConfig("1e", "2025 Paper — Separable differential equation with a logarithm", {
      questionHtml: raw`
        <p class="step-text">
          Consider the differential equation
          \[
          y-xy-(1+x)\frac{dy}{dx}=0.
          \]
        </p>
        <p class="step-text">Given that \(y=3\) when \(x=0\), find the value(s) of \(y\) when \(x=2\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`Rearrange first so all the \(y\)-terms are on one side and all the \(x\)-terms are on the other.`,
        raw`The right-hand side simplifies nicely if you split \(\frac{1-x}{1+x}\) into \(-1+\frac{2}{1+x}\).`,
        raw`Use the condition \(y=3\) when \(x=0\), then substitute \(x=2\).`
      ],
      answerHtml: raw`
        <p class="step-text">Separate the variables:</p>
        <div class="math-block">
          \[
          y(1-x)=(1+x)\frac{dy}{dx}
          \]
          \[
          \frac{1}{y}\,dy=\frac{1-x}{1+x}\,dx=\left(-1+\frac{2}{1+x}\right)dx
          \]
        </div>
        <p class="step-text">Integrate and use the condition:</p>
        <div class="math-block">
          \[
          \ln|y|=-x+2\ln|1+x|+C
          \]
          \[
          \ln 3=C
          \]
          \[
          \ln|y|=-2+2\ln 3+\ln 3
          \]
          \[
          y=\frac{27}{e^2}\approx 3.654
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Separate the variables`,
          previewHtml: raw`This is the separated form, and the right-hand side is ready to integrate.`,
          workingHtml: raw`<p class="step-text">This is the separated form, and the right-hand side is ready to integrate.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{1}{y}\,dy=\left(-1+\frac{2}{1+x}\right)dx
          \]
</div>`
        },
        {
          title: raw`Integrate both sides`,
          previewHtml: raw`This is the natural logarithm result from integrating \(\frac{1}{y}\,dy\).`,
          workingHtml: raw`<p class="step-text">This is the natural logarithm result from integrating \(\frac{1}{y}\,dy\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \ln|y|=-x+2\ln|1+x|+C
          \]
</div>`
        },
        {
          title: raw`Evaluate at \(x=2\)`,
          previewHtml: raw`This matches the integrated model and the initial condition.`,
          workingHtml: raw`<p class="step-text">This matches the integrated model and the initial condition.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            y=\frac{27}{e^2}\approx 3.654
          \]
</div>

        <p class="step-text">Separate the variables:</p>
        <div class="math-block">
          \[
          y(1-x)=(1+x)\frac{dy}{dx}
          \]
          \[
          \frac{1}{y}\,dy=\frac{1-x}{1+x}\,dx=\left(-1+\frac{2}{1+x}\right)dx
          \]
        </div>
        <p class="step-text">Integrate and use the condition:</p>
        <div class="math-block">
          \[
          \ln|y|=-x+2\ln|1+x|+C
          \]
          \[
          \ln 3=C
          \]
          \[
          \ln|y|=-2+2\ln 3+\ln 3
          \]
          \[
          y=\frac{27}{e^2}\approx 3.654
          \]
        </div>
      `
        }
      ]
    }),
    "2a": createConfig("2a", "2025 Paper — Reverse chain rule with a linear power", {
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find } \int \frac{10}{(2x+1)^6}\,dx.
          \]
        </div>
      `,
      hints: [
        raw`Rewrite the integrand as a power of \(2x+1\).`,
        raw`Integrating \((2x+1)^n\) means increasing the power and dividing by both the new power and the inside derivative.`,
        raw`This is a quick reverse-chain-rule question, so keep the working compact.`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite first:</p>
        <div class="math-block">
          \[
          \frac{10}{(2x+1)^6}=10(2x+1)^{-6}
          \]
          \[
          \int 10(2x+1)^{-6}\,dx
          =
          \frac{10(2x+1)^{-5}}{-5\times 2}+C
          \]
          \[
          =-\frac{1}{(2x+1)^5}+C
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Rewrite in power form`,
          previewHtml: raw`This exposes the reverse-chain-rule structure straight away.`,
          workingHtml: raw`<p class="step-text">This exposes the reverse-chain-rule structure straight away.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            10(2x+1)^{-6}
          \]
</div>`
        },
        {
          title: raw`Identify the antiderivative`,
          previewHtml: raw`The factor \(\frac{10}{-5\times 2}\) simplifies to \(-1\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \int 10(2x+1)^{-6}\,dx
              =
              \frac{10(2x+1)^{-5}}{-5\times 2}+C
              \]
            </div>

<p class="step-text">The factor \(\frac{10}{-5\times 2}\) simplifies to \(-1\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            -\frac{1}{(2x+1)^5}+C
          \]
</div>

        <p class="step-text">Rewrite first:</p>
        <div class="math-block">
          \[
          \frac{10}{(2x+1)^6}=10(2x+1)^{-6}
          \]
          \[
          \int 10(2x+1)^{-6}\,dx
          =
          \frac{10(2x+1)^{-5}}{-5\times 2}+C
          \]
          \[
          =-\frac{1}{(2x+1)^5}+C
          \]
        </div>
      `
        }
      ]
    }),
    "2b": createConfig("2b", "2025 Paper — Finding the function from its rate", {
      questionHtml: raw`
        <p class="step-text">
          The rate of change of a particular function, \(p\), is given by
          \[
          \frac{dp}{dt}=5\cos(4t).
          \]
        </p>
        <p class="step-text">Find the function, given that \(p=8\) when \(t=\frac{\pi}{24}\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`Integrate \(5\cos(4t)\) first to get the general function.`,
        raw`Use \(t=\frac{\pi}{24}\), so the angle inside the sine becomes \(\frac{\pi}{6}\).`,
        raw`You can keep the constant exactly as a fraction or use the decimal from the PDF.`
      ],
      answerHtml: raw`
        <p class="step-text">Integrate first:</p>
        <div class="math-block">
          \[
          p=\frac{5}{4}\sin(4t)+C
          \]
        </div>
        <p class="step-text">Use the condition \(p=8\) when \(t=\frac{\pi}{24}\):</p>
        <div class="math-block">
          \[
          8=\frac{5}{4}\sin\left(\frac{\pi}{6}\right)+C
          \]
          \[
          C=\frac{59}{8}=7.375
          \]
          \[
          p=\frac{5}{4}\sin(4t)+\frac{59}{8}
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Integrate the rate`,
          previewHtml: raw`Reverse the chain rule by dividing by the inside coefficient \(4\).`,
          workingHtml: raw`<p class="step-text">Reverse the chain rule by dividing by the inside coefficient \(4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            p=\frac{5}{4}\sin(4t)+C
          \]
</div>`
        },
        {
          title: raw`Find the constant`,
          previewHtml: raw`Since \(\sin\left(\frac{\pi}{6}\right)=\frac{1}{2}\), we get \(8=\frac{5}{8}+C\), so \(C=\frac{59}{8}=7.375\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              p=\frac{5}{4}\sin(4t)+C
              \]
              \[
              8=\frac{5}{4}\sin\left(4\cdot\frac{\pi}{24}\right)+C
              \]
            </div>

<p class="step-text">Since \(\sin\left(\frac{\pi}{6}\right)=\frac{1}{2}\), we get \(8=\frac{5}{8}+C\), so \(C=\frac{59}{8}=7.375\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{59}{8}
  \]
</div>
</div>`
        },
        {
          title: raw`Write the fitted function`,
          previewHtml: raw`That is the general antiderivative with the fitted constant.`,
          workingHtml: raw`<p class="step-text">That is the general antiderivative with the fitted constant.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            p=\frac{5}{4}\sin(4t)+\frac{59}{8}
          \]
</div>

        <p class="step-text">Integrate first:</p>
        <div class="math-block">
          \[
          p=\frac{5}{4}\sin(4t)+C
          \]
        </div>
        <p class="step-text">Use the condition \(p=8\) when \(t=\frac{\pi}{24}\):</p>
        <div class="math-block">
          \[
          8=\frac{5}{4}\sin\left(\frac{\pi}{6}\right)+C
          \]
          \[
          C=\frac{59}{8}=7.375
          \]
          \[
          p=\frac{5}{4}\sin(4t)+\frac{59}{8}
          \]
        </div>
      `
        }
      ]
    }),
    "2c": createConfig("2c", "2025 Paper — Solving for a constant with bounds", {
      questionHtml: raw`
        <p class="step-text">
          Find the value of the constant \(k\), given that
          \[
          \int_{0}^{k}\frac{1}{\sqrt{4x+1}}\,dx=1.
          \]
        </p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`Treat the integrand as \((4x+1)^{-1/2}\).`,
        raw`The antiderivative needs the usual divide-by-the-inside adjustment.`,
        raw`Evaluate at \(k\) and \(0\), set the result equal to \(1\), then solve.`
      ],
      answerHtml: raw`
        <div class="math-block">
          \[
          \int (4x+1)^{-1/2}\,dx=\frac{\sqrt{4x+1}}{2}+C
          \]
          \[
          1=\left[\frac{\sqrt{4x+1}}{2}\right]_0^k=\frac{\sqrt{4k+1}-1}{2}
          \]
          \[
          2=\sqrt{4k+1}-1
          \]
          \[
          3=\sqrt{4k+1}
          \]
          \[
          k=2
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Find the antiderivative`,
          previewHtml: raw`The reverse chain rule introduces the factor of \(\frac{1}{2}\).`,
          workingHtml: raw`<p class="step-text">The reverse chain rule introduces the factor of \(\frac{1}{2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{\sqrt{4x+1}}{2}+C
          \]
</div>`
        },
        {
          title: raw`Evaluate the bounds`,
          previewHtml: raw`The lower bound contributes \(\frac{1}{2}\), so it must be subtracted from the upper-bound value.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              1=\left[\frac{\sqrt{4x+1}}{2}\right]_0^k
              \]
              \[
              1=\frac{\sqrt{4k+1}}{2}-\frac{1}{2}
              \]
            </div>

<p class="step-text">The lower bound contributes \(\frac{1}{2}\), so it must be subtracted from the upper-bound value.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            1=\frac{\sqrt{4k+1}-1}{2}
          \]
</div>`
        },
        {
          title: raw`Solve for \(k\)`,
          previewHtml: raw`Rearranging gives \(\sqrt{4k+1}=3\), so \(4k+1=9\) and \(k=2\).`,
          workingHtml: raw`<p class="step-text">Rearranging gives \(\sqrt{4k+1}=3\), so \(4k+1=9\) and \(k=2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            2
          \]
</div>

        <div class="math-block">
          \[
          \int (4x+1)^{-1/2}\,dx=\frac{\sqrt{4x+1}}{2}+C
          \]
          \[
          1=\left[\frac{\sqrt{4x+1}}{2}\right]_0^k=\frac{\sqrt{4k+1}-1}{2}
          \]
          \[
          2=\sqrt{4k+1}-1
          \]
          \[
          3=\sqrt{4k+1}
          \]
          \[
          k=2
          \]
        </div>
      `
        }
      ]
    }),
    "2d": createConfig("2d", "2025 Paper — Particle motion from acceleration to displacement", {
      questionHtml: raw`
        <p class="step-text">
          A particle's acceleration can be modelled by the equation
          \[
          a(t)=2.4e^{-0.3t}-1,
          \]
          where \(a(t)\) is the acceleration of the particle, in \(\text{m s}^{-2}\), and \(t\) is the time, in seconds, from the start of timing.
        </p>
        <p class="step-text">Initially, at a fixed point \(P\), the particle had a velocity of \(6\text{ m s}^{-1}\).</p>
        <p class="step-text">How far from the point \(P\) is the particle \(3\) seconds after timing started?</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`Integrate acceleration to get velocity, and keep the \(+C\).`,
        raw`Use \(v(0)=6\) to find the first constant, then integrate again for displacement.`,
        raw`At the fixed point \(P\), the initial displacement is \(s(0)=0\).`
      ],
      answerHtml: raw`
        <p class="step-text">First integrate acceleration:</p>
        <div class="math-block">
          \[
          v(t)=-8e^{-0.3t}-t+C
          \]
          \[
          6=v(0)=-8+C
          \]
          \[
          C=14
          \]
          \[
          v(t)=-8e^{-0.3t}-t+14
          \]
        </div>
        <p class="step-text">Now integrate velocity and use \(s(0)=0\):</p>
        <div class="math-block">
          \[
          s(t)=\frac{80}{3}e^{-0.3t}-\frac{t^2}{2}+14t+C
          \]
          \[
          0=s(0)=\frac{80}{3}+C
          \]
          \[
          C=-\frac{80}{3}
          \]
          \[
          s(t)=\frac{80}{3}e^{-0.3t}-\frac{t^2}{2}+14t-\frac{80}{3}
          \]
          \[
          s(3)\approx 21.675\text{ m}
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Integrate acceleration to get velocity`,
          previewHtml: raw`Both terms integrate neatly, and the constant of integration must stay.`,
          workingHtml: raw`<p class="step-text">Both terms integrate neatly, and the constant of integration must stay.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            v(t)=-8e^{-0.3t}-t+C
          \]
</div>`
        },
        {
          title: raw`Use the initial velocity`,
          previewHtml: raw`Substituting \(t=0\) gives \(6=-8+C\), so \(C=14\).`,
          workingHtml: raw`<p class="step-text">Substituting \(t=0\) gives \(6=-8+C\), so \(C=14\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  14
  \]
</div>
</div>`
        },
        {
          title: raw`Build the displacement model`,
          previewHtml: raw`This is the fitted displacement model with \(s(0)=0\).`,
          workingHtml: raw`<p class="step-text">This is the fitted displacement model with \(s(0)=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            s(t)=\frac{80}{3}e^{-0.3t}-\frac{t^2}{2}+14t-\frac{80}{3}
          \]
</div>`
        },
        {
          title: raw`Evaluate at \(t=3\)`,
          previewHtml: raw`Substituting \(t=3\) into the displacement model gives approximately \(21.675\text{ m}\).`,
          workingHtml: raw`<p class="step-text">Substituting \(t=3\) into the displacement model gives approximately \(21.675\text{ m}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            21.675\text{ m}
          \]
</div>

        <p class="step-text">First integrate acceleration:</p>
        <div class="math-block">
          \[
          v(t)=-8e^{-0.3t}-t+C
          \]
          \[
          6=v(0)=-8+C
          \]
          \[
          C=14
          \]
          \[
          v(t)=-8e^{-0.3t}-t+14
          \]
        </div>
        <p class="step-text">Now integrate velocity and use \(s(0)=0\):</p>
        <div class="math-block">
          \[
          s(t)=\frac{80}{3}e^{-0.3t}-\frac{t^2}{2}+14t+C
          \]
          \[
          0=s(0)=\frac{80}{3}+C
          \]
          \[
          C=-\frac{80}{3}
          \]
          \[
          s(t)=\frac{80}{3}e^{-0.3t}-\frac{t^2}{2}+14t-\frac{80}{3}
          \]
          \[
          s(3)\approx 21.675\text{ m}
          \]
        </div>
      `
        }
      ]
    }),
    "2e": createConfig("2e", "2025 Paper — Trig area by substitution", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(y=\sin^3x\cos^3x\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-2e-int" class="graph-svg" viewBox="0 0 460 300" aria-label="Shaded region under y equals sine cubed x cosine cubed x from x equals 0 to pi over 2" role="img"></svg>
        </div>
        <p class="step-text">Find the shaded area under the curve between \(x=0\) and \(x=\frac{\pi}{2}\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`Save one factor of \(\cos x\) for \(du\), and rewrite \(\cos^2x\) as \(1-\sin^2x\).`,
        raw`Let \(u=\sin x\), so \(du=\cos x\,dx\).`,
        raw`The new bounds become \(u=0\) to \(u=1\).`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite the integrand:</p>
        <div class="math-block">
          \[
          \sin^3x\cos^3x=\sin^3x\cos x\cos^2x
          \]
          \[
          =\sin^3x\cos x(1-\sin^2x)
          \]
          \[
          =\sin^3x\cos x-\sin^5x\cos x
          \]
        </div>
        <p class="step-text">Now substitute \(u=\sin x\):</p>
        <div class="math-block">
          \[
          \int_0^{\pi/2}\sin^3x\cos^3x\,dx=\int_0^1(u^3-u^5)\,du
          \]
          \[
          =\left[\frac{u^4}{4}-\frac{u^6}{6}\right]_0^1
          \]
          \[
          =\frac{1}{4}-\frac{1}{6}=\frac{1}{12}
          \]
        </div>
      `,
      afterRender: draw2eGraph,
      guidedSteps: [
        {
          title: raw`Rewrite the trig powers`,
          previewHtml: raw`This keeps a single \(\cos x\) ready for \(du\).`,
          workingHtml: raw`<p class="step-text">This keeps a single \(\cos x\) ready for \(du\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \sin^3x\cos^3x=\sin^3x\cos x(1-\sin^2x)
          \]
</div>`
        },
        {
          title: raw`Make the substitution`,
          previewHtml: raw`The bounds become \(u=0\) to \(u=1\), and \(du=\cos x\,dx\).`,
          workingHtml: raw`<p class="step-text">The bounds become \(u=0\) to \(u=1\), and \(du=\cos x\,dx\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \int_0^1 (u^3-u^5)\,du
          \]
</div>`
        },
        {
          title: raw`Integrate in \(u\)`,
          previewHtml: raw`Integrate term by term, keeping the minus sign.`,
          workingHtml: raw`<p class="step-text">Integrate term by term, keeping the minus sign.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{u^4}{4}-\frac{u^6}{6}
          \]
</div>`
        },
        {
          title: raw`Evaluate the area`,
          previewHtml: raw`The substitution gives a neat exact area of \(\frac{1}{12}\).`,
          workingHtml: raw`<p class="step-text">The substitution gives a neat exact area of \(\frac{1}{12}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{1}{12}
          \]
</div>

        <p class="step-text">Rewrite the integrand:</p>
        <div class="math-block">
          \[
          \sin^3x\cos^3x=\sin^3x\cos x\cos^2x
          \]
          \[
          =\sin^3x\cos x(1-\sin^2x)
          \]
          \[
          =\sin^3x\cos x-\sin^5x\cos x
          \]
        </div>
        <p class="step-text">Now substitute \(u=\sin x\):</p>
        <div class="math-block">
          \[
          \int_0^{\pi/2}\sin^3x\cos^3x\,dx=\int_0^1(u^3-u^5)\,du
          \]
          \[
          =\left[\frac{u^4}{4}-\frac{u^6}{6}\right]_0^1
          \]
          \[
          =\frac{1}{4}-\frac{1}{6}=\frac{1}{12}
          \]
        </div>
      `
        }
      ]
    }),
    "3a": createConfig("3a", "2025 Paper — Trapezium rule estimate", {
      questionHtml: raw`
        <p class="step-text">The diagram below shows the cross-section of a hole dug in the ground.</p>
        <p class="step-text">The depth of the hole is measured every \(5\) metres across the top of the hole.</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3a-int" class="graph-svg" viewBox="0 0 520 280" aria-label="Hole cross-section with depths measured every five metres" role="img"></svg>
        </div>
        <p class="step-text">Using the trapezium rule, find an estimate for the area of the cross-section of the hole.</p>
      `,
      hints: [
        raw`The spacing is every \(5\) metres, so that is the trapezium width \(h\).`,
        raw`Use the endpoints \(y_0\) and \(y_n\), then double the interior ordinates.`,
        raw`The interior depths are \(2.32\), \(2.65\), and \(2.54\).`
      ],
      answerHtml: raw`
        <p class="step-text">Use the trapezium rule formula:</p>
        <div class="math-block">
          \[
          A\approx \frac{h}{2}\left(y_0+y_n+2(y_1+y_2+\cdots+y_{n-1})\right)
          \]
          \[
          A\approx \frac{5}{2}\left(2.12+1.88+2(2.32+2.65+2.54)\right)
          \]
          \[
          A\approx \frac{5}{2}(19.02)=47.55
          \]
        </div>
        <p class="step-text">So the estimated cross-sectional area is \(47.55\text{ m}^2\).</p>
      `,
      afterRender: draw3aHoleGraph,
      guidedSteps: [
        {
          title: raw`Identify the trapezium width`,
          previewHtml: raw`Each trapezium is \(5\) metres wide.`,
          workingHtml: raw`<p class="step-text">Each trapezium is \(5\) metres wide.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            5
          \]
</div>`
        },
        {
          title: raw`Substitute into the rule`,
          previewHtml: raw`That uses the endpoints once and the three interior depths twice.`,
          workingHtml: raw`<p class="step-text">That uses the endpoints once and the three interior depths twice.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            A\approx \frac{5}{2}\left(2.12+1.88+2(2.32+2.65+2.54)\right)
          \]
</div>`
        },
        {
          title: raw`Estimate the area`,
          previewHtml: raw`The trapezium rule estimate is \(47.55\text{ m}^2\).`,
          workingHtml: raw`<p class="step-text">The trapezium rule estimate is \(47.55\text{ m}^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            47.55\text{ m}^2
          \]
</div>

        <p class="step-text">Use the trapezium rule formula:</p>
        <div class="math-block">
          \[
          A\approx \frac{h}{2}\left(y_0+y_n+2(y_1+y_2+\cdots+y_{n-1})\right)
          \]
          \[
          A\approx \frac{5}{2}\left(2.12+1.88+2(2.32+2.65+2.54)\right)
          \]
          \[
          A\approx \frac{5}{2}(19.02)=47.55
          \]
        </div>
        <p class="step-text">So the estimated cross-sectional area is \(47.55\text{ m}^2\).</p>
      `
        }
      ]
    }),
    "3b": createConfig("3b", raw`2025 Paper — Logarithmic antiderivative in terms of \(k\)`, {
      questionHtml: raw`
        <p class="step-text">
          Find
          \[
          \int_{1}^{k}\frac{10}{2x-1}\,dx,
          \]
          giving your answer in terms of \(k\), where \(k\) is a constant and \(k&gt;1\).
        </p>
      `,
      hints: [
        raw`This is a \(\frac{1}{\text{linear}}\) integral, so a logarithm should appear.`,
        raw`The inside derivative is \(2\), so the antiderivative coefficient is \(5\), not \(10\).`,
        raw`Since \(k>1\), the expression \(2k-1\) is positive.`
      ],
      answerHtml: raw`
        <div class="math-block">
          \[
          \int \frac{10}{2x-1}\,dx=5\ln|2x-1|+C
          \]
          \[
          \int_1^k \frac{10}{2x-1}\,dx
          =
          \left[5\ln|2x-1|\right]_1^k
          \]
          \[
          =5\ln|2k-1|-5\ln 1
          \]
          \[
          =5\ln(2k-1)
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Identify the antiderivative`,
          previewHtml: raw`The reverse chain rule turns the coefficient \(10\) into \(5\).`,
          workingHtml: raw`<p class="step-text">The reverse chain rule turns the coefficient \(10\) into \(5\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            5\ln|2x-1|+C
          \]
</div>`
        },
        {
          title: raw`Evaluate the bounds`,
          previewHtml: raw`The lower-bound value is \(5\ln|1|=5\ln 1\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \left[5\ln|2x-1|\right]_1^k
              \]
              \[
              =5\ln|2k-1|-5\ln 1
              \]
            </div>

<p class="step-text">The lower-bound value is \(5\ln|1|=5\ln 1\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            5\ln|2k-1|-5\ln 1
          \]
</div>`
        },
        {
          title: raw`Simplify using \(k>1\)`,
          previewHtml: raw`Since \(k>1\), \(2k-1\) is positive, so the absolute value is not needed.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              5\ln|2k-1|-5\ln 1
              \]
              \[
              5\ln|2k-1|
              \]
            </div>

<p class="step-text">Since \(k>1\), \(2k-1\) is positive, so the absolute value is not needed.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            5\ln(2k-1)
          \]
</div>

        <div class="math-block">
          \[
          \int \frac{10}{2x-1}\,dx=5\ln|2x-1|+C
          \]
          \[
          \int_1^k \frac{10}{2x-1}\,dx
          =
          \left[5\ln|2x-1|\right]_1^k
          \]
          \[
          =5\ln|2k-1|-5\ln 1
          \]
          \[
          =5\ln(2k-1)
          \]
        </div>
      `
        }
      ]
    }),
    "3c": createConfig("3c", "2025 Paper — Separable differential equation with a radical", {
      questionHtml: raw`
        <p class="step-text">
          Consider the differential equation
          \[
          \frac{dy}{dx}=\frac{\sqrt{4y+1}}{x^2}.
          \]
        </p>
        <p class="step-text">Given that \(y=2\) when \(x=\frac{2}{3}\), find the value(s) of \(y\) when \(x=\frac{4}{5}\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`Move the radical involving \(y\) to the left and the power of \(x\) to the right.`,
        raw`Integrating \(x^{-2}\) gives \(-x^{-1}\), so the right-hand side becomes \(-\frac{1}{x}+C\).`,
        raw`Once you find \(C\), substitute \(x=\frac{4}{5}\) and solve for \(y\).`
      ],
      answerHtml: raw`
        <p class="step-text">Separate the variables:</p>
        <div class="math-block">
          \[
          (4y+1)^{-1/2}\,dy=x^{-2}\,dx
          \]
          \[
          \int (4y+1)^{-1/2}\,dy=\int x^{-2}\,dx
          \]
          \[
          \frac{\sqrt{4y+1}}{2}=-\frac{1}{x}+C
          \]
        </div>
        <p class="step-text">Use \(y=2\) when \(x=\frac{2}{3}\):</p>
        <div class="math-block">
          \[
          \frac{3}{2}=-\frac{3}{2}+C
          \]
          \[
          C=3
          \]
        </div>
        <p class="step-text">Now substitute \(x=\frac{4}{5}\):</p>
        <div class="math-block">
          \[
          -\frac{1}{4/5}+3=\frac{\sqrt{4y+1}}{2}
          \]
          \[
          \frac{\sqrt{4y+1}}{2}=\frac{7}{4}
          \]
          \[
          y=\frac{45}{16}=2.8125
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
            (4y+1)^{-1/2}\,dy=x^{-2}\,dx
          \]
</div>`
        },
        {
          title: raw`Integrate carefully`,
          previewHtml: raw`Both sides have been integrated correctly.`,
          workingHtml: raw`<p class="step-text">Both sides have been integrated correctly.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{\sqrt{4y+1}}{2}= -\frac{1}{x}+C
          \]
</div>`
        },
        {
          title: raw`Find the constant`,
          previewHtml: raw`The initial condition gives \(\frac{3}{2}=-\frac{3}{2}+C\), so \(C=3\).`,
          workingHtml: raw`<p class="step-text">The initial condition gives \(\frac{3}{2}=-\frac{3}{2}+C\), so \(C=3\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            3
          \]
</div>`
        },
        {
          title: raw`Solve for \(y\) at \(x=\frac{4}{5}\)`,
          previewHtml: raw`Follow the working to solve for \(y\) at \(x=\frac{4}{5}\).`,
          workingHtml: raw`<p class="step-text">Substituting \(x=\frac{4}{5}\) gives \(\sqrt{4y+1}=3.5\), which leads to \(y=\frac{45}{16}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{45}{16}=2.8125
          \]
</div>

        <p class="step-text">Separate the variables:</p>
        <div class="math-block">
          \[
          (4y+1)^{-1/2}\,dy=x^{-2}\,dx
          \]
          \[
          \int (4y+1)^{-1/2}\,dy=\int x^{-2}\,dx
          \]
          \[
          \frac{\sqrt{4y+1}}{2}=-\frac{1}{x}+C
          \]
        </div>
        <p class="step-text">Use \(y=2\) when \(x=\frac{2}{3}\):</p>
        <div class="math-block">
          \[
          \frac{3}{2}=-\frac{3}{2}+C
          \]
          \[
          C=3
          \]
        </div>
        <p class="step-text">Now substitute \(x=\frac{4}{5}\):</p>
        <div class="math-block">
          \[
          -\frac{1}{4/5}+3=\frac{\sqrt{4y+1}}{2}
          \]
          \[
          \frac{\sqrt{4y+1}}{2}=\frac{7}{4}
          \]
          \[
          y=\frac{45}{16}=2.8125
          \]
        </div>
      `
        }
      ]
    }),
    "3d": createConfig("3d", "2025 Paper — Area proof leading to a cubic equation", {
      questionHtml: raw`
        <p class="step-text">The graph below shows part of the curve</p>
        <div class="question-math">
          \[
          y=\frac{x^2+6}{x^4}, \qquad x&gt;0.
          \]
        </div>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3d-int" class="graph-svg" viewBox="0 0 450 280" aria-label="Shaded region under y equals x squared plus 6 over x to the fourth from p to 2p" role="img"></svg>
        </div>
        <p class="step-text">The area of the shaded region is \(\frac{9}{4}\) units\(^2\).</p>
        <p class="step-text">Prove that \(9p^3-2p^2-7=0\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`Rewrite the function as powers of \(x\) before integrating.`,
        raw`Evaluate the integral from \(p\) to \(2p\), then simplify the exact area expression first.`,
        raw`Once the area equals \(\frac{9}{4}\), multiply through by \(4p^3\) to clear the fractions.`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite the function and integrate:</p>
        <div class="math-block">
          \[
          \frac{x^2+6}{x^4}=x^{-2}+6x^{-4}
          \]
          \[
          \int \left(x^{-2}+6x^{-4}\right)\,dx=-\frac{1}{x}-\frac{2}{x^3}+C
          \]
        </div>
        <p class="step-text">Evaluate from \(p\) to \(2p\):</p>
        <div class="math-block">
          \[
          \left[-\frac{1}{x}-\frac{2}{x^3}\right]_{p}^{2p}
          =
          \frac{1}{2p}+\frac{7}{4p^3}
          \]
        </div>
        <p class="step-text">Set this equal to \(\frac{9}{4}\) and clear fractions:</p>
        <div class="math-block">
          \[
          \frac{1}{2p}+\frac{7}{4p^3}=\frac{9}{4}
          \]
          \[
          2p^2+7=9p^3
          \]
          \[
          9p^3-2p^2-7=0
          \]
        </div>
      `,
      afterRender: draw3dAreaGraph,
      guidedSteps: [
        {
          title: raw`Rewrite in integrable form`,
          previewHtml: raw`This makes the power rule straightforward to apply.`,
          workingHtml: raw`<p class="step-text">This makes the power rule straightforward to apply.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            x^{-2}+6x^{-4}
          \]
</div>`
        },
        {
          title: raw`Integrate the rewritten function`,
          previewHtml: raw`Both terms come straight from the power rule.`,
          workingHtml: raw`<p class="step-text">Both terms come straight from the power rule.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            -\frac{1}{x}-\frac{2}{x^3}+C
          \]
</div>`
        },
        {
          title: raw`Evaluate the shaded area`,
          previewHtml: raw`Simplifying the subtraction gives this exact area expression.`,
          workingHtml: raw`<p class="step-text">Simplifying the subtraction gives this exact area expression.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{1}{2p}+\frac{7}{4p^3}
          \]
</div>`
        },
        {
          title: raw`Finish the proof`,
          previewHtml: raw`Multiply \(\frac{1}{2p}+\frac{7}{4p^3}=\frac{9}{4}\) by \(4p^3\) and rearrange.`,
          workingHtml: raw`<p class="step-text">Multiply \(\frac{1}{2p}+\frac{7}{4p^3}=\frac{9}{4}\) by \(4p^3\) and rearrange.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            9p^3-2p^2-7=0
          \]
</div>

        <p class="step-text">Rewrite the function and integrate:</p>
        <div class="math-block">
          \[
          \frac{x^2+6}{x^4}=x^{-2}+6x^{-4}
          \]
          \[
          \int \left(x^{-2}+6x^{-4}\right)\,dx=-\frac{1}{x}-\frac{2}{x^3}+C
          \]
        </div>
        <p class="step-text">Evaluate from \(p\) to \(2p\):</p>
        <div class="math-block">
          \[
          \left[-\frac{1}{x}-\frac{2}{x^3}\right]_{p}^{2p}
          =
          \frac{1}{2p}+\frac{7}{4p^3}
          \]
        </div>
        <p class="step-text">Set this equal to \(\frac{9}{4}\) and clear fractions:</p>
        <div class="math-block">
          \[
          \frac{1}{2p}+\frac{7}{4p^3}=\frac{9}{4}
          \]
          \[
          2p^2+7=9p^3
          \]
          \[
          9p^3-2p^2-7=0
          \]
        </div>
      `
        }
      ]
    }),
    "3e": createConfig("3e", "2025 Paper — Balance point from weighted integrals", {
      questionHtml: raw`
        <p class="step-text">Murray is planning to hang a piece of his art on a wall. This is shown in the diagram below.</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3e-int" class="graph-svg" viewBox="0 0 470 300" aria-label="Curved art edge under f of x equals one third times x squared plus three all squared from x equals 0 to x equals 3" role="img"></svg>
        </div>
        <p class="step-text">
          The equation of the curved edge of the piece of art is
          \[
          f(x)=\frac{1}{3}(x^2+3)^2.
          \]
        </p>
        <p class="step-text">
          Murray has researched a way to make the picture balance by using the following formula to find the \(x\)-value of the hanging position:
          \[
          \frac{\int_0^3 xf(x)\,dx}{\int_0^3 f(x)\,dx}.
          \]
        </p>
        <p class="step-text">Use this formula to find the \(x\)-value of the hanging point.</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      hints: [
        raw`Treat the numerator and denominator as two separate definite integrals.`,
        raw`For the numerator, rewriting \(xf(x)\) as \(\frac{x(x^2+3)^2}{3}\) suggests the substitution \(u=x^2+3\).`,
        raw`For the denominator, expand \(f(x)\) first so the power rule works cleanly.`
      ],
      answerHtml: raw`
        <p class="step-text">Evaluate the numerator:</p>
        <div class="math-block">
          \[
          xf(x)=\frac{x(x^2+3)^2}{3}
          \]
          \[
          \int_0^3 xf(x)\,dx
          =
          \left[\frac{(x^2+3)^3}{18}\right]_0^3
          =94.5
          \]
        </div>
        <p class="step-text">Now evaluate the denominator:</p>
        <div class="math-block">
          \[
          f(x)=\frac{x^4}{3}+2x^2+3
          \]
          \[
          \int_0^3 f(x)\,dx
          =
          \left[\frac{x^5}{15}+\frac{2x^3}{3}+3x\right]_0^3
          =43.2
          \]
        </div>
        <p class="step-text">Divide the two results:</p>
        <div class="math-block">
          \[
          \frac{94.5}{43.2}=\frac{35}{16}=2.1875
          \]
        </div>
        <p class="step-text">So the hanging point is at \(x=\frac{35}{16}\).</p>
      `,
      afterRender: draw3eArtGraph,
      guidedSteps: [
        {
          title: raw`Evaluate the numerator`,
          previewHtml: raw`With \(u=x^2+3\), the numerator becomes a straightforward power-rule integral.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \int_0^3 xf(x)\,dx=\int_0^3 \frac{x(x^2+3)^2}{3}\,dx
              \]
              \[
              u=x^2+3,\qquad du=2x\,dx
              \]
            </div>

<p class="step-text">With \(u=x^2+3\), the numerator becomes a straightforward power-rule integral.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \left[\frac{(x^2+3)^3}{18}\right]_0^3=94.5
          \]
</div>`
        },
        {
          title: raw`Evaluate the denominator`,
          previewHtml: raw`Expanding \(f(x)\) first makes the denominator integral clean and exact.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              f(x)=\frac{(x^2+3)^2}{3}
              \]
              \[
              f(x)=\frac{x^4}{3}+2x^2+3
              \]
            </div>

<p class="step-text">Expanding \(f(x)\) first makes the denominator integral clean and exact.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \left[\frac{x^5}{15}+\frac{2x^3}{3}+3x\right]_0^3=43.2
          \]
</div>`
        },
        {
          title: raw`Find the hanging point`,
          previewHtml: raw`Dividing the weighted numerator by the area denominator gives \(x=\frac{35}{16}\).`,
          workingHtml: raw`<p class="step-text">Dividing the weighted numerator by the area denominator gives \(x=\frac{35}{16}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
            \frac{35}{16}=2.1875
          \]
</div>

        <p class="step-text">Evaluate the numerator:</p>
        <div class="math-block">
          \[
          xf(x)=\frac{x(x^2+3)^2}{3}
          \]
          \[
          \int_0^3 xf(x)\,dx
          =
          \left[\frac{(x^2+3)^3}{18}\right]_0^3
          =94.5
          \]
        </div>
        <p class="step-text">Now evaluate the denominator:</p>
        <div class="math-block">
          \[
          f(x)=\frac{x^4}{3}+2x^2+3
          \]
          \[
          \int_0^3 f(x)\,dx
          =
          \left[\frac{x^5}{15}+\frac{2x^3}{3}+3x\right]_0^3
          =43.2
          \]
        </div>
        <p class="step-text">Divide the two results:</p>
        <div class="math-block">
          \[
          \frac{94.5}{43.2}=\frac{35}{16}=2.1875
          \]
        </div>
        <p class="step-text">So the hanging point is at \(x=\frac{35}{16}\).</p>
      `
        }
      ]
    })
  };
}());
