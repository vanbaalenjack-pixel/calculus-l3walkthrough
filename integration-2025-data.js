(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-integration-2025";
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

  function correctChoice(html, successMessage) {
    return {
      html: html,
      correct: true,
      successMessage: successMessage
    };
  }

  function wrongChoice(html, failureMessage) {
    return {
      html: html,
      failureMessage: failureMessage
    };
  }

  function choiceStep(title, text, choices, extra) {
    return Object.assign({
      type: "choice",
      title: title,
      text: text,
      choices: choices
    }, extra || {});
  }

  function typedStep(title, text, acceptedAnswers, extra) {
    return Object.assign({
      type: "typed",
      title: title,
      text: text,
      acceptedAnswers: acceptedAnswers
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
      ${textMarkup(scale, 0.36, 2.56, "y = 4 sin(5x) cos(3x)", "graph-label", ' text-anchor="middle"')}
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
      ${textMarkup(scale, 1.18, 0.11, "y = sin³x cos³x", "graph-label", ' text-anchor="middle"')}
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
      <path class="question-shade" d="${areaPath}"></path>
      <path class="question-curve" d="${curvePath}"></path>
      ${circleMarkup(scale, 0, 0, 4.2, "question-origin")}
      ${textMarkup(scale, 1, -0.18, "p", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 2, -0.18, "2p", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 1.62, 2.55, "y = (x² + 6) / x⁴", "graph-label", ' text-anchor="middle"')}
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
      ${textMarkup(scale, 1.96, 20, "f(x) = (x² + 3)² / 3", "graph-label", ' text-anchor="middle"')}
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
      steps: [
        choiceStep("Spot the pattern", raw`Which derivative pattern is the useful one here?`, [
          correctChoice(raw`\[
            \frac{d}{dx}\bigl(\sec(kx)\bigr)=k\sec(kx)\tan(kx)
          \]`, raw`Correct. The integrand already matches the derivative pattern for \(\sec(kx)\).`),
          wrongChoice(raw`\[
            \frac{d}{dx}\bigl(\tan(kx)\bigr)=k\sec^2(kx)
          \]`, raw`That derivative gives \(\sec^2(kx)\), not \(\sec(kx)\tan(kx)\).`),
          wrongChoice(raw`\[
            \frac{d}{dx}\bigl(\ln|\sec(kx)+\tan(kx)|\bigr)=k\sec(kx)
          \]`, raw`That pattern is for \(\sec(kx)\), not for \(\sec(kx)\tan(kx)\).`),
          wrongChoice(raw`\[
            \frac{d}{dx}\bigl(\cos(kx)\bigr)=-k\sin(kx)
          \]`, raw`This is a trigonometric derivative, but it does not match the sec-tan structure here.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Adjust for the inside coefficient", raw`If \(\frac{d}{dx}\bigl(\sec(3x)\bigr)=3\sec(3x)\tan(3x)\), what coefficient should sit in front of \(\sec(3x)\) after integrating \(6\sec(3x)\tan(3x)\)?`, [
          wrongChoice(raw`\[
            6
          \]`, raw`That keeps the original coefficient, but we still need to divide by the inside factor \(3\).`),
          correctChoice(raw`\[
            2
          \]`, raw`Yes. The \(6\) becomes \(6 \div 3 = 2\) when we reverse the chain rule.`),
          wrongChoice(raw`\[
            3
          \]`, raw`Close, but we divide the outside coefficient \(6\) by \(3\), not replace it with \(3\).`),
          wrongChoice(raw`\[
            \frac{1}{3}
          \]`, raw`That would only account for the inside derivative, not the existing coefficient \(6\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Choose the antiderivative", raw`Which final antiderivative is correct?`, [
          wrongChoice(raw`\[
            6\sec(3x)+C
          \]`, raw`The coefficient is too large because the inside derivative \(3\) has not been accounted for.`),
          wrongChoice(raw`\[
            2\tan(3x)+C
          \]`, raw`The sec-tan pattern belongs to \(\sec(3x)\), not \(\tan(3x)\).`),
          correctChoice(raw`\[
            2\sec(3x)+C
          \]`, raw`Correct. This is a clean reverse-chain-rule antiderivative.`),
          wrongChoice(raw`\[
            \sec(3x)+C
          \]`, raw`You still need the coefficient \(2\) from dividing \(6\) by \(3\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
      ]
    }),
    "1b": createConfig("1b", "2025 Paper — Solving by integrating and fitting \(C\)", {
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
      steps: [
        choiceStep("Integrate to get the general solution", raw`Which antiderivative is correct?`, [
          wrongChoice(raw`\[
            y=2x^{3/2}+2x^{1/2}+C
          \]`, raw`The second term is too small. Integrating \(2x^{-1/2}\) gives \(4x^{1/2}\), not \(2x^{1/2}\).`),
          correctChoice(raw`\[
            y=2x^{3/2}+4x^{1/2}+C
          \]`, raw`Correct. Increase each power by \(1\), divide by the new power, and keep the constant of integration.`),
          wrongChoice(raw`\[
            y=\frac{3}{2}x^{3/2}+4x^{1/2}+C
          \]`, raw`The first term is off. Integrating \(3x^{1/2}\) gives \(2x^{3/2}\).`),
          wrongChoice(raw`\[
            y=2x^{3/2}+4x^{-1/2}+C
          \]`, raw`After integrating, the power on the second term should increase to \(+\frac{1}{2}\), not stay negative.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        typedStep("Find the constant", raw`Use \(y=10\) when \(x=4\). What is the value of \(C\)?`, ["-14"], {
          ariaLabel: "Type the constant C",
          successMessage: raw`Yes. Substituting \(x=4\) gives \(10=16+8+C\), so \(C=-14\).`,
          genericMessage: raw`Substitute \(x=4\) into \(y=2x^{3/2}+4x^{1/2}+C\), then solve for \(C\).`
        }),
        choiceStep("Write the fitted solution", raw`Which function satisfies the differential equation and the condition?`, [
          wrongChoice(raw`\[
            y=2x^{3/2}+4x^{1/2}+14
          \]`, raw`The sign of \(C\) is wrong. The condition gives \(C=-14\).`),
          wrongChoice(raw`\[
            y=2x^{3/2}+4x^{-1/2}-14
          \]`, raw`The integrated second term should be \(4x^{1/2}\), not \(4x^{-1/2}\).`),
          correctChoice(raw`\[
            y=2x^{3/2}+4x^{1/2}-14
          \]`, raw`Correct. That is the general antiderivative with the fitted constant included.`),
          wrongChoice(raw`\[
            y=3x^{3/2}+2x^{1/2}-14
          \]`, raw`Those coefficients come from the derivative, not from the antiderivative.`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Integrate the first expression", raw`Which antiderivative matches \(a-\frac{6k}{x^2}\)?`, [
          wrongChoice(raw`\[
            F(x)=ax-\frac{6k}{x}
          \]`, raw`The sign on the second term should become positive, because integrating \(-6kx^{-2}\) gives \(+6kx^{-1}\).`),
          correctChoice(raw`\[
            F(x)=ax+\frac{6k}{x}
          \]`, raw`Correct. The constant term integrates to \(ax\), and the \(x^{-2}\) term becomes a positive \(x^{-1}\) term.`),
          wrongChoice(raw`\[
            F(x)=a+\frac{6k}{x}
          \]`, raw`Do not forget that integrating \(a\) with respect to \(x\) gives \(ax\).`),
          wrongChoice(raw`\[
            F(x)=ax+\frac{6k}{x^2}
          \]`, raw`The power on the second term should increase from \(-2\) to \(-1\), not stay the same.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Use the first integral to link \(a\) and \(k\)", raw`After evaluating from \(1\) to \(2\), what equation do you get for \(a\)?`, [
          wrongChoice(raw`\[
            a=3-3k
          \]`, raw`Check the signs when you subtract \(F(1)\) from \(F(2)\).`),
          wrongChoice(raw`\[
            a=3k-3
          \]`, raw`That comes from mixing the area value with the second integral too early.`),
          correctChoice(raw`\[
            a=3+3k
          \]`, raw`Yes. Evaluating \(F(2)-F(1)\) gives \(a-3k=3\), so \(a=3+3k\).`),
          wrongChoice(raw`\[
            a=6+3k
          \]`, raw`The constant on the right is \(3\), not \(6\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Solve for \(k\)", raw`Once you substitute \(a=3+3k\) into \(\int_1^k 6x\,dx=a\), which values of \(k\) work?`, [
          wrongChoice(raw`\[
            k=1 \text{ or } k=2
          \]`, raw`\(k=1\) does not satisfy the quadratic \(k^2-k-2=0\).`),
          correctChoice(raw`\[
            k=-1 \text{ or } k=2
          \]`, raw`Correct. The quadratic factorises as \((k+1)(k-2)=0\).`),
          wrongChoice(raw`\[
            k=-2 \text{ or } k=1
          \]`, raw`Those are not the roots of \(k^2-k-2\).`),
          wrongChoice(raw`\[
            k=2 \text{ only}
          \]`, raw`There are two possible values because the quadratic has two real factors.`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
      ]
    }),
    "1d": createConfig("1d", "2025 Paper — Product-to-sum area under a trig curve", {
      questionHtml: raw`
        <p class="step-text">The graph below shows part of the graph of the function \(y=4\sin(5x)\cos(3x)\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-1d-int" class="graph-svg" viewBox="0 0 460 300" aria-label="Shaded region under y equals 4 sine 5x cosine 3x from x equals 0 to pi over 6"></svg>
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
      steps: [
        choiceStep("Rewrite the integrand", raw`Using products to sums, what does \(4\sin(5x)\cos(3x)\) become?`, [
          wrongChoice(raw`\[
            2\sin(8x)+\sin(2x)
          \]`, raw`The second term also keeps the outside factor \(2\).`),
          correctChoice(raw`\[
            2\sin(8x)+2\sin(2x)
          \]`, raw`Correct. Multiply the identity by the outside factor \(2\) to get both sine terms with coefficient \(2\).`),
          wrongChoice(raw`\[
            4\sin(8x)+4\sin(2x)
          \]`, raw`That doubles the expression one time too many.`),
          wrongChoice(raw`\[
            2\cos(8x)+2\cos(2x)
          \]`, raw`The product-to-sum identity here produces sines, not cosines.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Set up the definite integral", raw`Which evaluated antiderivative is correct?`, [
          wrongChoice(raw`\[
            \left[\frac{\cos(8x)}{4}+\cos(2x)\right]_{0}^{\pi/6}
          \]`, raw`The signs should be negative because \(\int \sin(kx)\,dx=-\frac{\cos(kx)}{k}\).`),
          wrongChoice(raw`\[
            \left[-\frac{\cos(8x)}{8}-\frac{\cos(2x)}{2}\right]_{0}^{\pi/6}
          \]`, raw`Those antiderivatives forget the outside coefficients \(2\) in the integrand.`),
          correctChoice(raw`\[
            \left[-\frac{\cos(8x)}{4}-\cos(2x)\right]_{0}^{\pi/6}
          \]`, raw`Yes. Each coefficient has been simplified correctly after integrating.`),
          wrongChoice(raw`\[
            \left[-\frac{\sin(8x)}{4}-\sin(2x)\right]_{0}^{\pi/6}
          \]`, raw`The antiderivative of sine involves cosine, not sine again.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Finish the area", raw`What is the value of the shaded area?`, [
          wrongChoice(raw`\[
            \frac{3}{8}
          \]`, raw`That is only part of the evaluated expression. You still need to subtract the lower-bound value.`),
          wrongChoice(raw`\[
            \frac{5}{4}
          \]`, raw`That matches the lower-bound contribution, not the final difference.`),
          correctChoice(raw`\[
            \frac{7}{8}
          \]`, raw`Correct. The evaluated difference is \(0.875=\frac{7}{8}\).`),
          wrongChoice(raw`\[
            \frac{9}{8}
          \]`, raw`This is a little too large. Recheck the subtraction of the lower-bound value.`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Separate the variables", raw`Which rearranged equation is the most useful before integrating?`, [
          wrongChoice(raw`\[
            y\,dy=\frac{1-x}{1+x}\,dx
          \]`, raw`There should be a \(\frac{1}{y}\) on the left after dividing by \(y\), not an extra \(y\).`),
          correctChoice(raw`\[
            \frac{1}{y}\,dy=\left(-1+\frac{2}{1+x}\right)dx
          \]`, raw`Correct. This is the separated form, and the right-hand side is ready to integrate.`),
          wrongChoice(raw`\[
            \frac{dy}{dx}=y(1-x)(1+x)
          \]`, raw`That multiplies by \(1+x\) instead of dividing by it.`),
          wrongChoice(raw`\[
            \frac{1}{y}\,dy=\frac{1+x}{1-x}\,dx
          \]`, raw`The fraction has been inverted. The numerator should be \(1-x\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Integrate both sides", raw`After integrating, which equation do you get?`, [
          wrongChoice(raw`\[
            \ln|y|=x+2\ln|1+x|+C
          \]`, raw`The constant term from the split fraction is \(-1\), so its integral should be \(-x\), not \(+x\).`),
          wrongChoice(raw`\[
            y=-x+2\ln|1+x|+C
          \]`, raw`The left-hand side integrates to \(\ln|y|\), not just \(y\).`),
          correctChoice(raw`\[
            \ln|y|=-x+2\ln|1+x|+C
          \]`, raw`Yes. This is the natural logarithm result from integrating \(\frac{1}{y}\,dy\).`),
          wrongChoice(raw`\[
            \ln|y|=-x+\frac{2}{1+x}+C
          \]`, raw`The integral of \(\frac{2}{1+x}\) is logarithmic, not another fraction.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Evaluate at \(x=2\)", raw`What is the value of \(y\) when \(x=2\)?`, [
          wrongChoice(raw`\[
            y=\frac{9}{e^2}\approx 1.218
          \]`, raw`That keeps only one factor of \(3\), but the logarithm term contributes \(3^3\) overall.`),
          wrongChoice(raw`\[
            y=27e^2
          \]`, raw`The \(-2\) in the exponent gives a factor of \(e^{-2}\), not \(e^2\).`),
          correctChoice(raw`\[
            y=\frac{27}{e^2}\approx 3.654
          \]`, raw`Correct. This matches the integrated model and the initial condition.`),
          wrongChoice(raw`\[
            y=\frac{27}{2e^2}
          \]`, raw`There is no extra division by \(2\) after substituting \(x=2\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Rewrite in power form", raw`Which rewrite is the most helpful?`, [
          correctChoice(raw`\[
            10(2x+1)^{-6}
          \]`, raw`Correct. This exposes the reverse-chain-rule structure straight away.`),
          wrongChoice(raw`\[
            10(2x+1)^6
          \]`, raw`The power should be negative because the bracket is in the denominator.`),
          wrongChoice(raw`\[
            \frac{10}{2x+1}
          \]`, raw`Only the denominator has changed there; the power of \(6\) is missing.`),
          wrongChoice(raw`\[
            (2x+1)^{-5}
          \]`, raw`That is close to the antiderivative stage, but it is not the original integrand.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Choose the antiderivative", raw`What is the correct integral?`, [
          wrongChoice(raw`\[
            \frac{1}{(2x+1)^5}+C
          \]`, raw`The sign should be negative after dividing by the new power \(-5\).`),
          wrongChoice(raw`\[
            -\frac{1}{5(2x+1)^5}+C
          \]`, raw`That only divides by the new power. You also need to divide by the inside derivative \(2\).`),
          correctChoice(raw`\[
            -\frac{1}{(2x+1)^5}+C
          \]`, raw`Yes. The factor \(\frac{10}{-5\times 2}\) simplifies to \(-1\).`),
          wrongChoice(raw`\[
            -\frac{1}{(2x+1)^4}+C
          \]`, raw`The power should increase from \(-6\) to \(-5\), not to \(-4\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Integrate the rate", raw`Which general function comes from \(\frac{dp}{dt}=5\cos(4t)\)?`, [
          wrongChoice(raw`\[
            p=5\sin(4t)+C
          \]`, raw`That misses the divide-by-\(4\) adjustment from the inside derivative.`),
          correctChoice(raw`\[
            p=\frac{5}{4}\sin(4t)+C
          \]`, raw`Correct. Reverse the chain rule by dividing by the inside coefficient \(4\).`),
          wrongChoice(raw`\[
            p=-\frac{5}{4}\sin(4t)+C
          \]`, raw`The antiderivative of cosine is positive sine, not negative sine.`),
          wrongChoice(raw`\[
            p=\frac{5}{4}\cos(4t)+C
          \]`, raw`Cosine differentiates to negative sine, so this cannot be the antiderivative.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        typedStep("Find the constant", raw`Using \(p=8\) when \(t=\frac{\pi}{24}\), what is \(C\)?`, ["59/8", "7.375"], {
          ariaLabel: "Type the constant C for p",
          successMessage: raw`Yes. Since \(\sin\left(\frac{\pi}{6}\right)=\frac{1}{2}\), we get \(8=\frac{5}{8}+C\), so \(C=\frac{59}{8}=7.375\).`,
          genericMessage: raw`Substitute \(t=\frac{\pi}{24}\) into the sine expression first, then solve \(8=\frac{5}{4}\sin(4t)+C\).`
        }),
        choiceStep("Write the fitted function", raw`Which function is correct?`, [
          wrongChoice(raw`\[
            p=\frac{5}{4}\sin(4t)+\frac{5}{8}
          \]`, raw`\(\frac{5}{8}\) is the value of the sine term at the given time, not the constant \(C\).`),
          wrongChoice(raw`\[
            p=5\sin(4t)+\frac{59}{8}
          \]`, raw`The sine term still needs the factor \(\frac{5}{4}\), not \(5\).`),
          correctChoice(raw`\[
            p=\frac{5}{4}\sin(4t)+\frac{59}{8}
          \]`, raw`Correct. That is the general antiderivative with the fitted constant.`),
          wrongChoice(raw`\[
            p=\frac{5}{4}\cos(4t)+\frac{59}{8}
          \]`, raw`The original derivative was cosine, so the antiderivative should involve sine.`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Find the antiderivative", raw`Which antiderivative is correct?`, [
          wrongChoice(raw`\[
            \sqrt{4x+1}+C
          \]`, raw`That forgets the divide-by-\(4\) adjustment from the inside derivative.`),
          correctChoice(raw`\[
            \frac{\sqrt{4x+1}}{2}+C
          \]`, raw`Correct. The reverse chain rule introduces the factor of \(\frac{1}{2}\).`),
          wrongChoice(raw`\[
            2\sqrt{4x+1}+C
          \]`, raw`The coefficient has gone in the wrong direction. We divide by the inside effect; we do not multiply.`),
          wrongChoice(raw`\[
            \frac{1}{2\sqrt{4x+1}}+C
          \]`, raw`That is very close to the original integrand, not its antiderivative.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Evaluate the bounds", raw`After substituting the limits, which equation in \(k\) do you get?`, [
          correctChoice(raw`\[
            1=\frac{\sqrt{4k+1}-1}{2}
          \]`, raw`Yes. The lower bound contributes \(\frac{1}{2}\), so it must be subtracted from the upper-bound value.`),
          wrongChoice(raw`\[
            1=\frac{\sqrt{4k+1}+1}{2}
          \]`, raw`The lower-bound value should be subtracted, not added.`),
          wrongChoice(raw`\[
            1=\sqrt{4k+1}-1
          \]`, raw`The factor of \(\frac{1}{2}\) from the antiderivative has been dropped.`),
          wrongChoice(raw`\[
            1=\frac{4k+1-1}{2}
          \]`, raw`Do not lose the square root when evaluating the antiderivative.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Solve for \(k\)", raw`What is the value of \(k\)?`, [
          wrongChoice(raw`\[
            1
          \]`, raw`If \(k=1\), the upper-bound value is too small to make the integral equal \(1\).`),
          correctChoice(raw`\[
            2
          \]`, raw`Correct. Rearranging gives \(\sqrt{4k+1}=3\), so \(4k+1=9\) and \(k=2\).`),
          wrongChoice(raw`\[
            \frac{3}{2}
          \]`, raw`That would give \(4k+1=7\), not the required \(9\).`),
          wrongChoice(raw`\[
            4
          \]`, raw`That makes the upper-bound term too large.`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Integrate acceleration to get velocity", raw`Which velocity function is correct before using the initial condition?`, [
          wrongChoice(raw`\[
            v(t)=8e^{-0.3t}-t+C
          \]`, raw`The exponential term should be negative, because integrating \(e^{-0.3t}\) introduces division by \(-0.3\).`),
          correctChoice(raw`\[
            v(t)=-8e^{-0.3t}-t+C
          \]`, raw`Correct. Both terms integrate neatly, and the constant of integration must stay.`),
          wrongChoice(raw`\[
            v(t)=-0.8e^{-0.3t}-t+C
          \]`, raw`The coefficient is too small. Dividing \(2.4\) by \(-0.3\) gives \(-8\).`),
          wrongChoice(raw`\[
            v(t)=-8e^{0.3t}-t+C
          \]`, raw`The exponent keeps the negative sign from the original acceleration model.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        typedStep("Use the initial velocity", raw`Since \(v(0)=6\), what is the constant in the velocity function?`, ["14"], {
          ariaLabel: "Type the velocity constant",
          successMessage: raw`Yes. Substituting \(t=0\) gives \(6=-8+C\), so \(C=14\).`,
          genericMessage: raw`Substitute \(t=0\) into \(v(t)=-8e^{-0.3t}-t+C\) and use \(v(0)=6\).`
        }),
        choiceStep("Build the displacement model", raw`After integrating velocity and using \(s(0)=0\), which displacement function is correct?`, [
          wrongChoice(raw`\[
            s(t)=\frac{80}{3}e^{-0.3t}-\frac{t^2}{2}+14t+\frac{80}{3}
          \]`, raw`The constant should be negative, because \(s(0)=0\) forces it to cancel the \(\frac{80}{3}\) term.`),
          wrongChoice(raw`\[
            s(t)=-\frac{80}{3}e^{-0.3t}-\frac{t^2}{2}+14t-\frac{80}{3}
          \]`, raw`The exponential term becomes positive when integrating \(-8e^{-0.3t}\).`),
          correctChoice(raw`\[
            s(t)=\frac{80}{3}e^{-0.3t}-\frac{t^2}{2}+14t-\frac{80}{3}
          \]`, raw`Correct. This is the fitted displacement model with \(s(0)=0\).`),
          wrongChoice(raw`\[
            s(t)=\frac{80}{3}e^{-0.3t}-t^2+14t-\frac{80}{3}
          \]`, raw`The antiderivative of \(-t\) is \(-\frac{t^2}{2}\), not \(-t^2\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Evaluate at \(t=3\)", raw`How far from \(P\) is the particle after \(3\) seconds?`, [
          wrongChoice(raw`\[
            18.675\text{ m}
          \]`, raw`That underestimates the positive contribution from the fitted velocity model.`),
          correctChoice(raw`\[
            21.675\text{ m}
          \]`, raw`Correct. Substituting \(t=3\) into the displacement model gives approximately \(21.675\text{ m}\).`),
          wrongChoice(raw`\[
            26.675\text{ m}
          \]`, raw`That is too large. Recheck the exponential term at \(t=3\).`),
          wrongChoice(raw`\[
            14\text{ m}
          \]`, raw`That is the fitted velocity constant, not the displacement after \(3\) seconds.`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
      ]
    }),
    "2e": createConfig("2e", "2025 Paper — Trig area by substitution", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(y=\sin^3x\cos^3x\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-2e-int" class="graph-svg" viewBox="0 0 460 300" aria-label="Shaded region under y equals sine cubed x cosine cubed x from x equals 0 to pi over 2"></svg>
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
      steps: [
        choiceStep("Rewrite the trig powers", raw`Which rewrite is the useful one before substituting?`, [
          wrongChoice(raw`\[
            \sin^3x\cos^3x=\sin^2x\cos^3x
          \]`, raw`One factor of \(\sin x\) has disappeared there.`),
          correctChoice(raw`\[
            \sin^3x\cos^3x=\sin^3x\cos x(1-\sin^2x)
          \]`, raw`Correct. This keeps a single \(\cos x\) ready for \(du\).`),
          wrongChoice(raw`\[
            \sin^3x\cos^3x=\cos^3x(1-\cos^2x)
          \]`, raw`That does not keep a clean factor for the substitution shown in the PDF.`),
          wrongChoice(raw`\[
            \sin^3x\cos^3x=(\sin x\cos x)^3
          \]`, raw`That identity is true, but it does not lead to the substitution route we want here.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Make the substitution", raw`If \(u=\sin x\), what does the integral become?`, [
          wrongChoice(raw`\[
            \int_0^1 (u^2-u^4)\,du
          \]`, raw`The original powers of \(\sin x\) are \(3\) and \(5\), so the powers of \(u\) should stay \(3\) and \(5\).`),
          wrongChoice(raw`\[
            \int_0^{\pi/2}(u^3-u^5)\,du
          \]`, raw`After substituting, the bounds must change to match \(u=\sin x\).`),
          correctChoice(raw`\[
            \int_0^1 (u^3-u^5)\,du
          \]`, raw`Yes. The bounds become \(u=0\) to \(u=1\), and \(du=\cos x\,dx\).`),
          wrongChoice(raw`\[
            \int_0^1 (u^3+u^5)\,du
          \]`, raw`The second term should be subtracted because of the \(1-\sin^2x\) rewrite.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Integrate in \(u\)", raw`Which antiderivative is correct?`, [
          wrongChoice(raw`\[
            \frac{u^4}{4}+\frac{u^6}{6}
          \]`, raw`The second term should stay negative.`),
          correctChoice(raw`\[
            \frac{u^4}{4}-\frac{u^6}{6}
          \]`, raw`Correct. Integrate term by term, keeping the minus sign.`),
          wrongChoice(raw`\[
            \frac{u^3}{3}-\frac{u^5}{5}
          \]`, raw`Those powers have not been increased by \(1\) yet.`),
          wrongChoice(raw`\[
            \frac{u^5}{5}-\frac{u^7}{7}
          \]`, raw`The new powers are \(4\) and \(6\), not \(5\) and \(7\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Evaluate the area", raw`What is the shaded area?`, [
          wrongChoice(raw`\[
            \frac{1}{6}
          \]`, raw`That only keeps the second term. You need the difference \(\frac{1}{4}-\frac{1}{6}\).`),
          wrongChoice(raw`\[
            \frac{1}{8}
          \]`, raw`That is not the result of simplifying \(\frac{1}{4}-\frac{1}{6}\).`),
          correctChoice(raw`\[
            \frac{1}{12}
          \]`, raw`Correct. The substitution gives a neat exact area of \(\frac{1}{12}\).`),
          wrongChoice(raw`\[
            \frac{5}{12}
          \]`, raw`That is too large for the area under this small positive hump.`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
      ]
    }),
    "3a": createConfig("3a", "2025 Paper — Trapezium rule estimate", {
      questionHtml: raw`
        <p class="step-text">The diagram below shows the cross-section of a hole dug in the ground.</p>
        <p class="step-text">The depth of the hole is measured every \(5\) metres across the top of the hole.</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3a-int" class="graph-svg" viewBox="0 0 520 280" aria-label="Hole cross-section with depths measured every five metres"></svg>
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
      steps: [
        choiceStep("Identify the trapezium width", raw`What is the value of \(h\) in the trapezium rule here?`, [
          wrongChoice(raw`\[
            2.5
          \]`, raw`\(2.5\) is half the spacing. The measurements are taken every \(5\) metres.`),
          correctChoice(raw`\[
            5
          \]`, raw`Correct. Each trapezium is \(5\) metres wide.`),
          wrongChoice(raw`\[
            10
          \]`, raw`That would skip every second measurement point.`),
          wrongChoice(raw`\[
            20
          \]`, raw`That is the total span across the top, not the width of each trapezium.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Substitute into the rule", raw`Which substitution is correct?`, [
          wrongChoice(raw`\[
            A\approx \frac{5}{2}\left(2.12+1.88+2(2.12+2.32+2.65+2.54+1.88)\right)
          \]`, raw`The endpoints \(2.12\) and \(1.88\) should not be counted again inside the doubled sum.`),
          wrongChoice(raw`\[
            A\approx 5\left(2.12+1.88+2(2.32+2.65+2.54)\right)
          \]`, raw`The trapezium rule uses \(\frac{h}{2}\), not just \(h\).`),
          correctChoice(raw`\[
            A\approx \frac{5}{2}\left(2.12+1.88+2(2.32+2.65+2.54)\right)
          \]`, raw`Yes. That uses the endpoints once and the three interior depths twice.`),
          wrongChoice(raw`\[
            A\approx \frac{5}{2}\left(2.12+1.88+(2.32+2.65+2.54)\right)
          \]`, raw`The interior ordinates must be doubled in the trapezium rule.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Estimate the area", raw`What estimate does this give for the area?`, [
          wrongChoice(raw`\[
            38.04\text{ m}^2
          \]`, raw`That comes from missing the \(\frac{5}{2}\) scaling after the bracket is evaluated.`),
          wrongChoice(raw`\[
            42.55\text{ m}^2
          \]`, raw`That is a little low. Recheck the doubled interior terms.`),
          correctChoice(raw`\[
            47.55\text{ m}^2
          \]`, raw`Correct. The trapezium rule estimate is \(47.55\text{ m}^2\).`),
          wrongChoice(raw`\[
            52.55\text{ m}^2
          \]`, raw`That overestimates the area from this substitution.`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
      ]
    }),
    "3b": createConfig("3b", "2025 Paper — Logarithmic antiderivative in terms of \(k\)", {
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
      steps: [
        choiceStep("Choose the antiderivative", raw`Which antiderivative is correct?`, [
          wrongChoice(raw`\[
            10\ln|2x-1|+C
          \]`, raw`That forgets to divide by the inside derivative \(2\).`),
          correctChoice(raw`\[
            5\ln|2x-1|+C
          \]`, raw`Correct. The reverse chain rule turns the coefficient \(10\) into \(5\).`),
          wrongChoice(raw`\[
            5(2x-1)+C
          \]`, raw`A linear denominator integrates to a logarithm, not another linear term.`),
          wrongChoice(raw`\[
            \frac{5}{2x-1}+C
          \]`, raw`That expression differentiates to a reciprocal-square structure, not the original reciprocal form.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Evaluate the bounds", raw`What do you get after substituting the limits \(1\) and \(k\)?`, [
          correctChoice(raw`\[
            5\ln|2k-1|-5\ln 1
          \]`, raw`Yes. The lower-bound value is \(5\ln|1|=5\ln 1\).`),
          wrongChoice(raw`\[
            5\ln|2k-1|+5\ln 1
          \]`, raw`The lower-bound value should be subtracted, not added.`),
          wrongChoice(raw`\[
            5\ln|k-1|-5\ln 1
          \]`, raw`The inside of the logarithm must stay \(2x-1\).`),
          wrongChoice(raw`\[
            \ln|2k-1|-\ln 1
          \]`, raw`The factor of \(5\) from the antiderivative has disappeared.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Simplify using \(k>1\)", raw`What is the final answer in terms of \(k\)?`, [
          wrongChoice(raw`\[
            5\ln|k-1|
          \]`, raw`The expression inside the logarithm should be \(2k-1\).`),
          wrongChoice(raw`\[
            \ln(2k-1)
          \]`, raw`The coefficient \(5\) should stay in front.`),
          correctChoice(raw`\[
            5\ln(2k-1)
          \]`, raw`Correct. Since \(k>1\), \(2k-1\) is positive, so the absolute value is not needed.`),
          wrongChoice(raw`\[
            10\ln(2k-1)
          \]`, raw`That doubles the answer and ignores the divide-by-\(2\) step from the antiderivative.`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Separate the variables", raw`Which separated equation is correct?`, [
          wrongChoice(raw`\[
            \sqrt{4y+1}\,dy=x^{-2}\,dx
          \]`, raw`The radical needs to be moved to the denominator on the left, not kept in the numerator.`),
          correctChoice(raw`\[
            (4y+1)^{-1/2}\,dy=x^{-2}\,dx
          \]`, raw`Correct. This puts all the \(y\)-terms on one side and all the \(x\)-terms on the other.`),
          wrongChoice(raw`\[
            dy=(4y+1)^{-1/2}x^{-2}\,dx
          \]`, raw`That still mixes the \(x\)- and \(y\)-terms on the same side.`),
          wrongChoice(raw`\[
            (4y+1)^{1/2}\,dy=x^2\,dx
          \]`, raw`Both the radical and the power of \(x\) have been moved the wrong way.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Integrate carefully", raw`What is the integrated relationship?`, [
          wrongChoice(raw`\[
            \sqrt{4y+1}= -\frac{1}{x}+C
          \]`, raw`The left side is missing the factor of \(\frac{1}{2}\) from the antiderivative.`),
          wrongChoice(raw`\[
            \frac{\sqrt{4y+1}}{2}= \frac{1}{x}+C
          \]`, raw`The sign on the \(x\)-term is wrong because \(\int x^{-2}\,dx=-x^{-1}\).`),
          correctChoice(raw`\[
            \frac{\sqrt{4y+1}}{2}= -\frac{1}{x}+C
          \]`, raw`Yes. Both sides have been integrated correctly.`),
          wrongChoice(raw`\[
            \frac{4y+1}{2}= -\frac{1}{x}+C
          \]`, raw`The square root must stay after integrating the left-hand side.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Find the constant", raw`Using \(y=2\) when \(x=\frac{2}{3}\), what is \(C\)?`, [
          wrongChoice(raw`\[
            \frac{3}{2}
          \]`, raw`That is the value of \(\frac{\sqrt{4y+1}}{2}\), not the constant after solving.`),
          wrongChoice(raw`\[
            \frac{9}{2}
          \]`, raw`That adds the two terms instead of solving the equation \(\frac{3}{2}=-\frac{3}{2}+C\).`),
          correctChoice(raw`\[
            3
          \]`, raw`Correct. The initial condition gives \(\frac{3}{2}=-\frac{3}{2}+C\), so \(C=3\).`),
          wrongChoice(raw`\[
            0
          \]`, raw`The initial condition does not make the constant vanish.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Solve for \(y\) at \(x=\frac{4}{5}\)", raw`What value of \(y\) do you get?`, [
          wrongChoice(raw`\[
            \frac{25}{16}
          \]`, raw`That is too small. Recheck the value of the left-hand side after substituting \(x=\frac{4}{5}\).`),
          correctChoice(raw`\[
            \frac{45}{16}=2.8125
          \]`, raw`Correct. Substituting \(x=\frac{4}{5}\) gives \(\sqrt{4y+1}=3.5\), which leads to \(y=\frac{45}{16}\).`),
          wrongChoice(raw`\[
            \frac{49}{16}
          \]`, raw`That would correspond to forgetting to subtract the \(1\) before dividing by \(4\).`),
          wrongChoice(raw`\[
            \frac{11}{4}
          \]`, raw`This is close numerically, but it does not come from solving \(4y+1=12.25\) exactly.`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
          <svg id="question-graph-3d-int" class="graph-svg" viewBox="0 0 450 280" aria-label="Shaded region under y equals x squared plus 6 over x to the fourth from p to 2p"></svg>
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
      steps: [
        choiceStep("Rewrite in integrable form", raw`Which equivalent form is best before integrating?`, [
          wrongChoice(raw`\[
            x^{-2}+6x^{-2}
          \]`, raw`Only the first term simplifies to \(x^{-2}\). The second becomes \(6x^{-4}\).`),
          correctChoice(raw`\[
            x^{-2}+6x^{-4}
          \]`, raw`Correct. This makes the power rule straightforward to apply.`),
          wrongChoice(raw`\[
            x^{-4}+6x^{-2}
          \]`, raw`The exponents have been swapped.`),
          wrongChoice(raw`\[
            \frac{1}{x^2+6x^4}
          \]`, raw`That changes the algebra completely. The numerator and denominator have not been split correctly.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Integrate the rewritten function", raw`What is the antiderivative?`, [
          wrongChoice(raw`\[
            -\frac{1}{x}+\frac{2}{x^3}+C
          \]`, raw`The second term should also be negative, because integrating \(6x^{-4}\) gives \(-2x^{-3}\).`),
          correctChoice(raw`\[
            -\frac{1}{x}-\frac{2}{x^3}+C
          \]`, raw`Yes. Both terms come straight from the power rule.`),
          wrongChoice(raw`\[
            \frac{1}{x}+\frac{2}{x^3}+C
          \]`, raw`Both signs are wrong after integrating negative powers.`),
          wrongChoice(raw`\[
            -\frac{1}{2x}-\frac{2}{3x^3}+C
          \]`, raw`The coefficients do not match the power-rule results.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Evaluate the shaded area", raw`After substituting \(2p\) and \(p\), what does the area equal?`, [
          wrongChoice(raw`\[
            \frac{1}{2p}+\frac{1}{4p^3}
          \]`, raw`The cubic term is too small. It should include the full difference from the lower bound.`),
          wrongChoice(raw`\[
            \frac{1}{p}+\frac{2}{p^3}
          \]`, raw`That is just the lower-bound value with the signs changed.`),
          correctChoice(raw`\[
            \frac{1}{2p}+\frac{7}{4p^3}
          \]`, raw`Correct. Simplifying the subtraction gives this exact area expression.`),
          wrongChoice(raw`\[
            \frac{1}{4p}+\frac{7}{2p^3}
          \]`, raw`Both denominators are off after simplifying the evaluated terms.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Finish the proof", raw`If the area is \(\frac{9}{4}\), which equation follows after clearing fractions?`, [
          wrongChoice(raw`\[
            9p^3+2p^2-7=0
          \]`, raw`The middle term should be subtracted when everything is moved to one side.`),
          correctChoice(raw`\[
            9p^3-2p^2-7=0
          \]`, raw`Exactly. Multiply \(\frac{1}{2p}+\frac{7}{4p^3}=\frac{9}{4}\) by \(4p^3\) and rearrange.`),
          wrongChoice(raw`\[
            9p^2-2p-7=0
          \]`, raw`The powers of \(p\) should rise to \(p^3\) and \(p^2\) when the fractions are cleared.`),
          wrongChoice(raw`\[
            4p^3-2p^2-7=0
          \]`, raw`The right-hand side area is \(\frac{9}{4}\), so the leading coefficient must become \(9\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
      ]
    }),
    "3e": createConfig("3e", "2025 Paper — Balance point from weighted integrals", {
      questionHtml: raw`
        <p class="step-text">Murray is planning to hang a piece of his art on a wall. This is shown in the diagram below.</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3e-int" class="graph-svg" viewBox="0 0 470 300" aria-label="Curved art edge under f of x equals one third times x squared plus three all squared from x equals 0 to x equals 3"></svg>
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
      steps: [
        choiceStep("Evaluate the numerator", raw`Which expression correctly evaluates \(\int_0^3 xf(x)\,dx\)?`, [
          wrongChoice(raw`\[
            \left[\frac{(x^2+3)^2}{6}\right]_0^3
          \]`, raw`The power should increase to \(3\) after substitution, not stay at \(2\).`),
          correctChoice(raw`\[
            \left[\frac{(x^2+3)^3}{18}\right]_0^3=94.5
          \]`, raw`Correct. With \(u=x^2+3\), the numerator becomes a straightforward power-rule integral.`),
          wrongChoice(raw`\[
            \left[\frac{x(x^2+3)^3}{9}\right]_0^3
          \]`, raw`That keeps an extra \(x\) factor that the substitution should remove.`),
          wrongChoice(raw`\[
            \left[\frac{(x^2+3)^3}{9}\right]_0^3=189
          \]`, raw`The denominator should be \(18\), not \(9\), because \(du=2x\,dx\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Evaluate the denominator", raw`Which result matches \(\int_0^3 f(x)\,dx\)?`, [
          wrongChoice(raw`\[
            \left[\frac{x^5}{5}+2x^3+3x\right]_0^3=81
          \]`, raw`The \(x^4\) term still needs the factor of \(\frac{1}{3}\), and the \(2x^2\) term integrates to \(\frac{2x^3}{3}\).`),
          wrongChoice(raw`\[
            \left[\frac{x^5}{15}+\frac{2x^3}{3}+3x\right]_0^3=34.2
          \]`, raw`The antiderivative is right, but the arithmetic is too small.`),
          correctChoice(raw`\[
            \left[\frac{x^5}{15}+\frac{2x^3}{3}+3x\right]_0^3=43.2
          \]`, raw`Yes. Expanding \(f(x)\) first makes the denominator integral clean and exact.`),
          wrongChoice(raw`\[
            \left[\frac{x^5}{12}+2x^3+3x\right]_0^3=43.2
          \]`, raw`The coefficients in the antiderivative do not match the expanded function.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Find the hanging point", raw`What is the \(x\)-value of the hanging position?`, [
          wrongChoice(raw`\[
            \frac{16}{35}
          \]`, raw`That is the reciprocal of the required ratio.`),
          wrongChoice(raw`\[
            \frac{189}{86.4}
          \]`, raw`Those values are double the numerator and denominator, but the fraction still simplifies to the same point only if you continue simplifying.`),
          correctChoice(raw`\[
            \frac{35}{16}=2.1875
          \]`, raw`Correct. Dividing the weighted numerator by the area denominator gives \(x=\frac{35}{16}\).`),
          wrongChoice(raw`\[
            \frac{43.2}{94.5}=0.457
          \]`, raw`The formula places the numerator on top and the denominator underneath, not the other way around.`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
      ]
    })
  };
}());
