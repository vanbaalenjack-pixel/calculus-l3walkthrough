(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-integration-2024";
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
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -0.12, 0, 1.28, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -1.1, 0, 11.4, "graph-axis")}
      ${lineMarkup(scale, 1, 0, 1, 9.4, "graph-guide")}
      <path class="question-shade" d="${areaPath}"></path>
      <path class="question-curve" d="${topPath}"></path>
      <path class="question-curve" d="${bottomPath}"></path>
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
      steps: [
        choiceStep("Spot the derivative pattern", raw`Which derivative pattern matches the integrand?`, [
          wrongChoice(raw`\[
            \frac{d}{dx}\bigl(\tan(2x)\bigr)=2\sec^2(2x)
          \]`, raw`That produces \(\sec^2(2x)\), not \(\sec(2x)\tan(2x)\).`),
          correctChoice(raw`\[
            \frac{d}{dx}\bigl(\sec(2x)\bigr)=2\sec(2x)\tan(2x)
          \]`, raw`Correct. This is the reverse-chain-rule pattern we want.`),
          wrongChoice(raw`\[
            \frac{d}{dx}\bigl(\ln|\sec(2x)+\tan(2x)|\bigr)=2\sec(2x)
          \]`, raw`That derivative gives \(\sec(2x)\), not the sec-tan product.`),
          wrongChoice(raw`\[
            \frac{d}{dx}\bigl(\cos(2x)\bigr)=-2\sin(2x)
          \]`, raw`This is a trig derivative, but it does not match the structure here.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Adjust the coefficient", raw`If the derivative contributes a factor of \(2\), what should the coefficient become after integrating \(6\sec(2x)\tan(2x)\)?`, [
          wrongChoice(raw`\[
            6
          \]`, raw`That leaves the inside derivative unaccounted for.`),
          wrongChoice(raw`\[
            2
          \]`, raw`Close, but \(6 \div 2 = 3\), not \(2\).`),
          correctChoice(raw`\[
            3
          \]`, raw`Yes. Reverse chain rule means dividing the outside coefficient by the inside coefficient.`),
          wrongChoice(raw`\[
            \frac{1}{2}
          \]`, raw`That only accounts for the inside derivative, not the existing \(6\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Choose the antiderivative", raw`Which final answer is correct?`, [
          wrongChoice(raw`\[
            3\tan(2x)+C
          \]`, raw`The sec-tan derivative pattern belongs to \(\sec(2x)\), not \(\tan(2x)\).`),
          correctChoice(raw`\[
            3\sec(2x)+C
          \]`, raw`Correct. This is a clean reverse-chain-rule antiderivative.`),
          wrongChoice(raw`\[
            6\sec(2x)+C
          \]`, raw`The coefficient is too large because the factor of \(2\) has not been divided out.`),
          wrongChoice(raw`\[
            \sec(2x)+C
          \]`, raw`You still need the factor of \(3\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
      ]
    }),
    "1b": createConfig("1b", "2024 Paper — Area under a polynomial-style curve", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(y=40x(5x^2-3)^3\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-1b-int-2024" class="graph-svg" viewBox="0 0 460 300" aria-label="Shaded region under y equals 40x times 5x squared minus 3 cubed from x equals negative 0.4 to x equals 0"></svg>
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
      steps: [
        choiceStep("Set up the area", raw`Which definite integral represents the shaded area?`, [
          wrongChoice(raw`\[
            \int_{0}^{-0.4}40x(5x^2-3)^3\,dx
          \]`, raw`Those limits would reverse the interval and make the area negative.`),
          wrongChoice(raw`\[
            \int_{-0.4}^{0}(5x^2-3)^3\,dx
          \]`, raw`The factor \(40x\) is part of the function, so it must stay in the integral.`),
          correctChoice(raw`\[
            \int_{-0.4}^{0}40x(5x^2-3)^3\,dx
          \]`, raw`Correct. That matches the shaded region exactly.`),
          wrongChoice(raw`\[
            \int_{-0.4}^{0}40x(5x^2-3)^4\,dx
          \]`, raw`The power \(4\) appears after integrating, not in the original integrand.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Reverse the chain rule", raw`Which antiderivative is correct?`, [
          wrongChoice(raw`\[
            4(5x^2-3)^4+C
          \]`, raw`That coefficient is one factor of \(4\) too large after undoing the inside derivative.`),
          correctChoice(raw`\[
            (5x^2-3)^4+C
          \]`, raw`Yes. Since \(\frac{d}{dx}(5x^2-3)=10x\), the \(40x\) becomes exactly the coefficient needed.`),
          wrongChoice(raw`\[
            \frac{(5x^2-3)^4}{10x}+C
          \]`, raw`We do not divide by a variable after integrating. Instead we match the derivative pattern before integrating.`),
          wrongChoice(raw`\[
            40x(5x^2-3)^4+C
          \]`, raw`That keeps the original factor \(40x\) instead of integrating it away.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Evaluate the bounds", raw`What is the area of the shaded region?`, [
          wrongChoice(raw`\[
            23.4256\text{ units}^2
          \]`, raw`That is only the lower-bound value, not the difference.`),
          wrongChoice(raw`\[
            104.4256\text{ units}^2
          \]`, raw`That adds the two bound values instead of subtracting them.`),
          correctChoice(raw`\[
            57.5744\text{ units}^2
          \]`, raw`Correct. The evaluated difference is \(81-23.4256\).`),
          wrongChoice(raw`\[
            81\text{ units}^2
          \]`, raw`That is just the upper-bound value at \(x=0\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Build the position function", raw`What do you get after integrating \(v(t)=26.4t^{1/3}\)?`, [
          wrongChoice(raw`\[
            s(t)=26.4t^{4/3}+C
          \]`, raw`The power increases correctly, but the coefficient also needs to be divided by \(\frac{4}{3}\).`),
          wrongChoice(raw`\[
            s(t)=8.8t^{4/3}+C
          \]`, raw`That divides by \(3\), not by \(\frac{4}{3}\).`),
          correctChoice(raw`\[
            s(t)=19.8t^{4/3}+C
          \]`, raw`Correct. Integrating \(t^{1/3}\) gives \(\frac{t^{4/3}}{4/3}\).`),
          wrongChoice(raw`\[
            s(t)=19.8t^{1/3}+C
          \]`, raw`The power should increase by \(1\) when you integrate.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Use the initial position", raw`If the object is \(360\) metres from \(P\) at \(t=0\), what is the fitted position function?`, [
          wrongChoice(raw`\[
            s(t)=19.8t^{4/3}
          \]`, raw`That would make the initial position \(0\), not \(360\).`),
          correctChoice(raw`\[
            s(t)=19.8t^{4/3}+360
          \]`, raw`Yes. Substituting \(t=0\) shows the constant must be \(360\).`),
          wrongChoice(raw`\[
            s(t)=19.8t^{4/3}-360
          \]`, raw`The initial position is positive \(360\), so the constant is positive.`),
          wrongChoice(raw`\[
            s(t)=26.4t^{1/3}+360
          \]`, raw`That is still the velocity expression, not the integrated position function.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        typedStep("Find the time", raw`When \(v(t)=264\), what is the value of \(t\)?`, ["1000"], {
          beforeHtml: raw`
            <div class="math-block">
              \[
              26.4t^{1/3}=264
              \]
              \[
              t^{1/3}=10
              \]
            </div>
          `,
          ariaLabel: "Type the time t",
          successMessage: raw`Correct. Cubing both sides gives \(t=10^3=1000\).`,
          genericMessage: raw`After \(t^{1/3}=10\), cube both sides.`
        }),
        choiceStep("Substitute into position", raw`How far from point \(P\) is the object at that time?`, [
          wrongChoice(raw`\[
            19\,800\text{ m}
          \]`, raw`That uses \(19.8\times 1000\), but the power is \(t^{4/3}\), not just \(t\).`),
          wrongChoice(raw`\[
            198\,000\text{ m}
          \]`, raw`That leaves out the initial \(360\) metres from \(P\).`),
          wrongChoice(raw`\[
            198\,720\text{ m}
          \]`, raw`Close, but the arithmetic with \(19.8\times 10^4\) is slightly off.`),
          correctChoice(raw`\[
            198\,360\text{ m}
          \]`, raw`Correct. Since \(1000^{4/3}=10^4\), the distance is \(19.8\times 10^4+360\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Rewrite the product", raw`Using products to sums, what does \(24\cos(3x)\sin(x)\) become?`, [
          wrongChoice(raw`\[
            24(\sin 4x-\sin 2x)
          \]`, raw`That forgets the factor of \(\frac{1}{2}\) built into the identity.`),
          correctChoice(raw`\[
            12(\sin 4x-\sin 2x)
          \]`, raw`Correct. Since \(2\sin x\cos 3x=\sin 4x-\sin 2x\), the outside \(24\) becomes \(12\) times that bracket.`),
          wrongChoice(raw`\[
            12(\cos 4x-\cos 2x)
          \]`, raw`The identity produces sines here, not cosines.`),
          wrongChoice(raw`\[
            12(\sin 4x+\sin 2x)
          \]`, raw`The second term should be negative because \(\sin(x-3x)=\sin(-2x)=-\sin 2x\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Integrate the new form", raw`Which general solution is correct after integrating?`, [
          wrongChoice(raw`\[
            y=3\cos 4x-6\cos 2x+C
          \]`, raw`The signs should be negative then positive after integrating sine terms.`),
          wrongChoice(raw`\[
            y=-12\cos 4x+12\cos 2x+C
          \]`, raw`The inside coefficients \(4\) and \(2\) still need to be divided out.`),
          correctChoice(raw`\[
            y=-3\cos 4x+6\cos 2x+C
          \]`, raw`Yes. This is the integrated form you can now fit to the condition.`),
          wrongChoice(raw`\[
            y=-3\sin 4x+6\sin 2x+C
          \]`, raw`The antiderivative of sine is cosine, not sine again.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        typedStep("Find the constant", raw`Using \(y=6\) when \(x=\frac{\pi}{3}\), what is the value of \(C\)?`, ["15/2", "7.5"], {
          beforeHtml: raw`
            <div class="math-block">
              \[
              6=-3\cos\left(\frac{4\pi}{3}\right)+6\cos\left(\frac{2\pi}{3}\right)+C
              \]
            </div>
          `,
          ariaLabel: "Type the constant C",
          successMessage: raw`Correct. Since \(\cos\frac{4\pi}{3}=-\frac{1}{2}\) and \(\cos\frac{2\pi}{3}=-\frac{1}{2}\), the equation becomes \(6=-1.5+C\).`,
          genericMessage: raw`Substitute the cosine values at \(\frac{4\pi}{3}\) and \(\frac{2\pi}{3}\), then solve for \(C\).`
        }),
        choiceStep("Evaluate at \(x=\frac{\pi}{2}\)", raw`What is the value of \(y\) when \(x=\frac{\pi}{2}\)?`, [
          wrongChoice(raw`\[
            1.5
          \]`, raw`Check the sign of the \(6\cos(\pi)\) term. Since \(\cos(\pi)=-1\), that term is negative.`),
          wrongChoice(raw`\[
            -7.5
          \]`, raw`That leaves out the contribution from the \(-3\cos(2\pi)\) term.`),
          correctChoice(raw`\[
            -1.5
          \]`, raw`Correct. The fitted model gives \(-3-6+7.5=-1.5\).`),
          wrongChoice(raw`\[
            4.5
          \]`, raw`That comes from treating \(\cos(\pi)\) as \(+1\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
      ]
    }),
    "1e": createConfig("1e", "2024 Paper — Enclosed area between sec² and tan² curves", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the curves \(y=3\sec^2x\) and \(y=2\tan^2x\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-1e-int-2024" class="graph-svg" viewBox="0 0 460 300" aria-label="Shaded region between y equals 3 sec squared x and y equals 2 tan squared x from x equals 0 to x equals 1"></svg>
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
      steps: [
        choiceStep("Choose top minus bottom", raw`Which integral correctly represents the shaded area?`, [
          wrongChoice(raw`\[
            \int_0^1\left(2\tan^2x-3\sec^2x\right)\,dx
          \]`, raw`That is bottom minus top, so it would make the area negative.`),
          wrongChoice(raw`\[
            \int_0^1\left(3\sec x-2\tan x\right)\,dx
          \]`, raw`The original curves are squared, so the integrand must keep the squares.`),
          correctChoice(raw`\[
            \int_0^1\left(3\sec^2x-2\tan^2x\right)\,dx
          \]`, raw`Correct. Area between curves is top minus bottom over the interval \(0\le x\le1\).`),
          wrongChoice(raw`\[
            \int_{-1}^1\left(3\sec^2x-2\tan^2x\right)\,dx
          \]`, raw`The region is bounded by the \(y\)-axis and \(x=1\), so the interval is \(0\) to \(1\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Use the identity", raw`After replacing \(\tan^2x\) with \(\sec^2x-1\), what does the integrand become?`, [
          wrongChoice(raw`\[
            \sec^2x+1
          \]`, raw`Distributing the \(-2\) gives \(+2\), not \(+1\).`),
          correctChoice(raw`\[
            \sec^2x+2
          \]`, raw`Yes. The identity makes the area integral much easier to integrate.`),
          wrongChoice(raw`\[
            5\sec^2x-2
          \]`, raw`The \(\sec^2x\) terms should partly cancel, not combine to \(5\sec^2x\).`),
          wrongChoice(raw`\[
            \tan^2x+2
          \]`, raw`The whole point of the identity is to rewrite the tangent term in terms of \(\sec^2x\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Integrate the simplified expression", raw`Which evaluated antiderivative is correct?`, [
          wrongChoice(raw`\[
            \left[\sec x+2x\right]_0^1
          \]`, raw`The antiderivative of \(\sec^2x\) is \(\tan x\), not \(\sec x\).`),
          wrongChoice(raw`\[
            \left[\tan x+x^2\right]_0^1
          \]`, raw`The constant \(2\) integrates to \(2x\), not \(x^2\).`),
          correctChoice(raw`\[
            \left[\tan x+2x\right]_0^1
          \]`, raw`Correct. Now it is just a careful substitution of the bounds.`),
          wrongChoice(raw`\[
            \left[-\tan x+2x\right]_0^1
          \]`, raw`There is no negative sign when integrating \(\sec^2x\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Finish the area", raw`What is the area of the shaded region?`, [
          wrongChoice(raw`\[
            \tan 1\approx 1.557
          \]`, raw`That leaves out the \(+2x\) contribution.`),
          wrongChoice(raw`\[
            2
          \]`, raw`That keeps only the constant contribution and ignores the tangent term.`),
          correctChoice(raw`\[
            \tan 1+2\approx 3.557
          \]`, raw`Correct. The exact area is \(\tan 1+2\), which is about \(3.557\).`),
          wrongChoice(raw`\[
            \sec 1+2\approx 3.851
          \]`, raw`That uses the wrong antiderivative for \(\sec^2x\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Expand the bracket", raw`What is \((3x^4+4)^2\)?`, [
          wrongChoice(raw`\[
            9x^8+12x^4+16
          \]`, raw`The middle term should be \(2(3x^4)(4)=24x^4\).`),
          wrongChoice(raw`\[
            9x^8+24x^8+16
          \]`, raw`The middle term keeps the power \(x^4\), not \(x^8\).`),
          correctChoice(raw`\[
            9x^8+24x^4+16
          \]`, raw`Correct. Expand before you try to integrate.`),
          wrongChoice(raw`\[
            6x^8+16
          \]`, raw`This misses the cross term completely.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Integrate each term", raw`Which antiderivative is correct after expanding?`, [
          wrongChoice(raw`\[
            \frac{9x^9}{9}+\frac{24x^5}{4}+16x+C
          \]`, raw`The first term simplifies correctly, but the second should divide by \(5\), not \(4\).`),
          correctChoice(raw`\[
            x^9+\frac{24x^5}{5}+16x+C
          \]`, raw`Yes. Increase each power by \(1\) and divide by the new power.`),
          wrongChoice(raw`\[
            x^9+\frac{24x^4}{4}+16x+C
          \]`, raw`The second power should become \(x^5\) after integrating.`),
          wrongChoice(raw`\[
            9x^9+\frac{24x^5}{5}+16x+C
          \]`, raw`The first term still needs to be divided by \(9\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Choose the final answer", raw`Which final result should you write?`, [
          wrongChoice(raw`\[
            x^9+\frac{24x^5}{5}+16x
          \]`, raw`Remember the constant of integration on an indefinite integral.`),
          wrongChoice(raw`\[
            \frac{(3x^4+4)^3}{12x^3}+C
          \]`, raw`That treats the question like a reverse-chain-rule problem, but it is not set up cleanly that way.`),
          correctChoice(raw`\[
            x^9+\frac{24x^5}{5}+16x+C
          \]`, raw`Correct. Expanding first gives a straightforward power-rule integral.`),
          wrongChoice(raw`\[
            x^9+\frac{24x^5}{4}+16x+C
          \]`, raw`The \(x^4\) term integrates to \(\frac{x^5}{5}\), not \(\frac{x^5}{4}\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Find the antiderivative", raw`What is \(\int 3\sqrt{x}\,dx\)?`, [
          wrongChoice(raw`\[
            \frac{3}{2}x^{3/2}+C
          \]`, raw`The coefficient should become \(2\), not \(\frac{3}{2}\).`),
          correctChoice(raw`\[
            2x^{3/2}+C
          \]`, raw`Correct. \(3x^{1/2}\) integrates to \(3\cdot\frac{x^{3/2}}{3/2}=2x^{3/2}\).`),
          wrongChoice(raw`\[
            2x^{1/2}+C
          \]`, raw`The power should increase from \(\frac{1}{2}\) to \(\frac{3}{2}\).`),
          wrongChoice(raw`\[
            x^{3/2}+C
          \]`, raw`The coefficient is too small.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Apply the bounds", raw`Which equation comes from evaluating the definite integral?`, [
          wrongChoice(raw`\[
            112=2(16)^{1/2}-2k^{1/2}
          \]`, raw`The power should stay \(\frac{3}{2}\) after integrating.`),
          wrongChoice(raw`\[
            112=2k^{3/2}-2(16)^{3/2}
          \]`, raw`The upper bound should be substituted first, then the lower bound subtracted.`),
          correctChoice(raw`\[
            112=2(16)^{3/2}-2k^{3/2}
          \]`, raw`Yes. This is the correct result after applying the limits.`),
          wrongChoice(raw`\[
            112=3(16)^{3/2}-3k^{3/2}
          \]`, raw`The coefficient \(3\) has already been integrated into the \(2x^{3/2}\) antiderivative.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        typedStep("Solve for \(k\)", raw`What is the value of \(k\)?`, ["4"], {
          beforeHtml: raw`
            <div class="math-block">
              \[
              112=128-2k^{3/2}
              \]
              \[
              k^{3/2}=8
              \]
            </div>
          `,
          ariaLabel: "Type the value of k",
          successMessage: raw`Correct. Since \(8=2^3\), raising both sides to the power \(\frac{2}{3}\) gives \(k=2^2=4\).`,
          genericMessage: raw`From \(k^{3/2}=8\), raise both sides to the power \(\frac{2}{3}\).`
        })
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
      steps: [
        choiceStep("Separate the variables", raw`Which rearrangement is correct before integrating?`, [
          wrongChoice(raw`\[
            y^2\,dy=12e^{3x}\,dx
          \]`, raw`The \(y^2\) should move to the denominator on the left, not stay in the numerator.`),
          correctChoice(raw`\[
            y^{-2}\,dy=12e^{3x}\,dx
          \]`, raw`Correct. This puts all the \(y\)-terms on one side and all the \(x\)-terms on the other.`),
          wrongChoice(raw`\[
            \frac{dy}{dx}=12e^{3x}
          \]`, raw`That incorrectly removes the \(y^2\) factor.`),
          wrongChoice(raw`\[
            \frac{1}{y}\,dy=12e^{3x}\,dx
          \]`, raw`The denominator should be \(y^2\), not \(y\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Integrate both sides", raw`What equation do you get after integrating?`, [
          wrongChoice(raw`\[
            \frac{1}{y}=4e^{3x}+C
          \]`, raw`The left-hand side should be negative because \(\int y^{-2}\,dy=-y^{-1}\).`),
          correctChoice(raw`\[
            -\frac{1}{y}=4e^{3x}+C
          \]`, raw`Yes. The exponential side integrates cleanly to \(4e^{3x}\).`),
          wrongChoice(raw`\[
            -\frac{1}{2y^2}=4e^{3x}+C
          \]`, raw`That is the wrong antiderivative for \(y^{-2}\).`),
          wrongChoice(raw`\[
            -\frac{1}{y}=12e^{3x}+C
          \]`, raw`The exponential term still needs to be divided by the inside coefficient \(3\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Use the initial condition", raw`What value of \(C\) do you get from \(y=0.5\) when \(x=0\)?`, [
          wrongChoice(raw`\[
            -2
          \]`, raw`That is the value of \(-\frac{1}{y}\), not the constant after solving.`),
          wrongChoice(raw`\[
            2
          \]`, raw`The constant must make \(-2=4+C\) true.`),
          correctChoice(raw`\[
            -6
          \]`, raw`Correct. Substituting the condition gives \(C=-6\).`),
          wrongChoice(raw`\[
            6
          \]`, raw`That has the wrong sign.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Evaluate at \(x=\frac{1}{3}\)", raw`What is the value of \(y\) when \(x=\frac{1}{3}\)?`, [
          wrongChoice(raw`\[
            \frac{1}{4e-6}\approx 0.2052
          \]`, raw`The sign should be negative because the equation is \(-\frac{1}{y}=4e-6\).`),
          wrongChoice(raw`\[
            6-4e\approx -4.873
          \]`, raw`That is the denominator of \(y\), not the value of \(y\) itself.`),
          correctChoice(raw`\[
            \frac{1}{6-4e}\approx -0.2052
          \]`, raw`Correct. This is equivalent to \(-\frac{1}{4e-6}\).`),
          wrongChoice(raw`\[
            \frac{1}{4e+6}\approx 0.0597
          \]`, raw`The constant is \(-6\), so the denominator should be \(6-4e\), not \(4e+6\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
      ]
    }),
    "2d": createConfig("2d", "2024 Paper — Shaded area between \(y=\sin^2x\) and \(y=1\)", {
      questionHtml: raw`
        <p class="step-text">The graph below shows part of the graph of the function \(y=\sin^2x\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-2d-int-2024" class="graph-svg" viewBox="0 0 470 310" aria-label="Shaded region between y equals sine squared x and y equals 1 from x equals negative pi over 2 to pi over 2"></svg>
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
      steps: [
        choiceStep("Set up the area", raw`Which definite integral gives the shaded area?`, [
          wrongChoice(raw`\[
            \int_{-\pi/2}^{\pi/2}(\sin^2x-1)\,dx
          \]`, raw`That is bottom minus top, so it would make the area negative.`),
          correctChoice(raw`\[
            \int_{-\pi/2}^{\pi/2}(1-\sin^2x)\,dx
          \]`, raw`Correct. The line \(y=1\) sits above the curve \(y=\sin^2x\) on this interval.`),
          wrongChoice(raw`\[
            \int_{0}^{\pi/2}(1-\sin^2x)\,dx
          \]`, raw`That would only capture half of the shaded region.`),
          wrongChoice(raw`\[
            \int_{-\pi/2}^{\pi/2}(1-\sin x)\,dx
          \]`, raw`The curve is \(y=\sin^2x\), not \(y=\sin x\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Use the identity", raw`After replacing \(\sin^2x\) with \(\frac{1-\cos 2x}{2}\), what does the integrand become?`, [
          wrongChoice(raw`\[
            \frac{1}{2}-\frac{\cos 2x}{2}
          \]`, raw`The cosine term should be positive after simplifying \(1-\frac{1-\cos 2x}{2}\).`),
          wrongChoice(raw`\[
            1+\frac{\cos 2x}{2}
          \]`, raw`The constant part should simplify to \(\frac{1}{2}\), not \(1\).`),
          correctChoice(raw`\[
            \frac{1}{2}+\frac{\cos 2x}{2}
          \]`, raw`Yes. This form integrates smoothly.`),
          wrongChoice(raw`\[
            \cos^2x
          \]`, raw`That is equivalent, but the paper's working route here is the double-angle form before integrating.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Integrate correctly", raw`Which antiderivative with bounds is correct?`, [
          correctChoice(raw`\[
            \left[\frac{x}{2}+\frac{\sin 2x}{4}\right]_{-\pi/2}^{\pi/2}
          \]`, raw`Correct. The cosine term integrates to \(\frac{\sin 2x}{4}\).`),
          wrongChoice(raw`\[
            \left[\frac{x}{2}+\frac{\cos 2x}{4}\right]_{-\pi/2}^{\pi/2}
          \]`, raw`The antiderivative of \(\cos 2x\) is sine, not cosine.`),
          wrongChoice(raw`\[
            \left[x+\frac{\sin 2x}{2}\right]_{-\pi/2}^{\pi/2}
          \]`, raw`Both coefficients are twice as large as they should be.`),
          wrongChoice(raw`\[
            \left[\frac{x}{2}+\frac{\sin x}{2}\right]_{-\pi/2}^{\pi/2}
          \]`, raw`The inside angle should stay as \(2x\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Evaluate the area", raw`What is the final value of the shaded area?`, [
          wrongChoice(raw`\[
            \frac{\pi}{4}
          \]`, raw`That is only one end of the subtraction, not the full difference.`),
          wrongChoice(raw`\[
            \pi
          \]`, raw`The constant term contributes only half of the interval length, not the full interval length.`),
          correctChoice(raw`\[
            \frac{\pi}{2}
          \]`, raw`Correct. The sine term vanishes at both bounds, leaving \(\frac{\pi}{4}-\left(-\frac{\pi}{4}\right)\).`),
          wrongChoice(raw`\[
            1
          \]`, raw`This question gives an exact answer in terms of \(\pi\), not a whole number.`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Factor out the constants", raw`Which rewrite is the best starting point?`, [
          wrongChoice(raw`\[
            M=\int_0^p\frac{4\pi ar^2}{1+b^3r}\,dr
          \]`, raw`That changes the denominator completely. It should stay as \(1+br^3\).`),
          correctChoice(raw`\[
            M=4\pi a\int_0^p\frac{r^2}{1+br^3}\,dr
          \]`, raw`Correct. Pulling out the constants makes the substitution step clearer.`),
          wrongChoice(raw`\[
            M=4\pi a\int_0^p\frac{r}{1+br^3}\,dr
          \]`, raw`The numerator should remain \(r^2\), not \(r\).`),
          wrongChoice(raw`\[
            M=4\pi\int_0^p\frac{r^2}{a+br^3}\,dr
          \]`, raw`The constant \(a\) multiplies the whole integrand. It does not move into the denominator.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Create a logarithmic form", raw`Why is multiplying and dividing by \(3b\) useful?`, [
          wrongChoice(raw`\[
            \text{It turns the denominator into }3b+br^3.
          \]`, raw`The denominator does not change like that. We only scale the fraction by \(1\).`),
          wrongChoice(raw`\[
            \text{It makes the integral a power-rule integral.}
          \]`, raw`This becomes a logarithmic integral, not a power-rule one.`),
          correctChoice(raw`\[
            \text{It creates }3br^2,\text{ which is the derivative of }1+br^3.
          \]`, raw`Exactly. That is the key substitution idea behind the logarithm.`),
          wrongChoice(raw`\[
            \text{It removes the }r^2\text{ completely.}
          \]`, raw`The numerator is not removed. It is matched to the denominator's derivative.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Integrate the logarithmic form", raw`Which antiderivative is correct?`, [
          wrongChoice(raw`\[
            \frac{4\pi a}{3b}(1+br^3)+C
          \]`, raw`A denominator of the form \(\frac{u'}{u}\) integrates to a logarithm, not back to \(u\).`),
          correctChoice(raw`\[
            \frac{4\pi a}{3b}\ln|1+br^3|+C
          \]`, raw`Correct. This is the standard logarithmic antiderivative.`),
          wrongChoice(raw`\[
            4\pi a\ln|1+br^3|+C
          \]`, raw`You still need the factor of \(\frac{1}{3b}\) from matching the derivative.`),
          wrongChoice(raw`\[
            \frac{4\pi a}{b}\ln|1+br^3|+C
          \]`, raw`The denominator should be \(3b\), not \(b\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Evaluate the bounds", raw`What final expression do you get for \(M\)?`, [
          wrongChoice(raw`\[
            \frac{4\pi a}{3b}\ln(bp^3)
          \]`, raw`The \(1\) inside the logarithm must stay as part of the denominator expression.`),
          wrongChoice(raw`\[
            \frac{4\pi a}{3b}\bigl(\ln(1+bp^3)+1\bigr)
          \]`, raw`\(\ln 1=0\), so there is no extra \(+1\) term.`),
          correctChoice(raw`\[
            \frac{4\pi a}{3b}\ln(1+bp^3)
          \]`, raw`Correct. The lower bound gives \(\ln 1=0\).`),
          wrongChoice(raw`\[
            \frac{4\pi a}{3b}(1+bp^3)
          \]`, raw`This forgets that the antiderivative is logarithmic.`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Rewrite the integrand", raw`What is the helpful rewrite for the second term?`, [
          wrongChoice(raw`\[
            \frac{3}{e^{4x}}=3e^{4x}
          \]`, raw`Dividing by \(e^{4x}\) is the same as multiplying by \(e^{-4x}\), not \(e^{4x}\).`),
          correctChoice(raw`\[
            \frac{3}{e^{4x}}=3e^{-4x}
          \]`, raw`Correct. This makes the power of \(e\) easy to integrate.`),
          wrongChoice(raw`\[
            \frac{3}{e^{4x}}=e^{-x}
          \]`, raw`The coefficient \(3\) and the exponent \(-4x\) both matter.`),
          wrongChoice(raw`\[
            \frac{3}{e^{4x}}=\frac{1}{3}e^{-4x}
          \]`, raw`The factor of \(3\) stays in the numerator.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Integrate each exponential", raw`Which antiderivative is correct?`, [
          wrongChoice(raw`\[
            \frac{e^{2x}}{2}+\frac{3e^{-4x}}{4}+C
          \]`, raw`The second term should be negative because dividing by \(-4\) introduces a minus sign.`),
          wrongChoice(raw`\[
            e^{2x}-\frac{3e^{-4x}}{4}+C
          \]`, raw`The first term still needs to be divided by \(2\).`),
          correctChoice(raw`\[
            \frac{e^{2x}}{2}-\frac{3e^{-4x}}{4}+C
          \]`, raw`Yes. Each term has been integrated using reverse chain rule.`),
          wrongChoice(raw`\[
            \frac{e^{2x}}{2}-3e^{-4x}+C
          \]`, raw`The second term still needs to be divided by \(-4\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Choose the final answer", raw`Which final result should you write?`, [
          wrongChoice(raw`\[
            \frac{e^{2x}}{2}-\frac{3e^{4x}}{4}+C
          \]`, raw`The second exponent should stay negative after the rewrite.`),
          correctChoice(raw`\[
            \frac{e^{2x}}{2}-\frac{3e^{-4x}}{4}+C
          \]`, raw`Correct. This matches both exponential terms exactly.`),
          wrongChoice(raw`\[
            \frac{e^{2x}}{2}-\frac{3}{4e^{4x}}
          \]`, raw`That is equivalent to the second term, but the constant of integration is missing.`),
          wrongChoice(raw`\[
            \frac{e^{2x}}{2}+\frac{3}{4e^{4x}}+C
          \]`, raw`The second term should still be negative.`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Integrate the derivative", raw`Which general solution is correct?`, [
          wrongChoice(raw`\[
            y=5\ln|4x-3|+C
          \]`, raw`You still need to divide by the inside coefficient \(4\).`),
          wrongChoice(raw`\[
            y=\frac{5}{4x-3}+C
          \]`, raw`That keeps the integrand instead of integrating it.`),
          correctChoice(raw`\[
            y=\frac{5}{4}\ln|4x-3|+C
          \]`, raw`Correct. The logarithm comes from the \(\frac{1}{4x-3}\) form.`),
          wrongChoice(raw`\[
            y=\frac{1}{4}\ln|4x-3|+C
          \]`, raw`The factor of \(5\) must stay in the numerator after integrating.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        typedStep("Use the condition", raw`What is the value of \(C\)?`, ["10"], {
          beforeHtml: raw`
            <div class="math-block">
              \[
              10=\frac{5}{4}\ln|4(1)-3|+C
              \]
            </div>
          `,
          ariaLabel: "Type the constant C",
          successMessage: raw`Correct. Since \(\ln 1=0\), the logarithm disappears and \(C=10\).`,
          genericMessage: raw`Substitute \(x=1\). The logarithm becomes \(\ln 1\).`
        }),
        choiceStep("Write the fitted solution", raw`Which final equation satisfies both the differential equation and the condition?`, [
          wrongChoice(raw`\[
            y=\frac{5}{4}\ln|4x-3|-10
          \]`, raw`The constant should be positive \(10\), not negative.`),
          correctChoice(raw`\[
            y=\frac{5}{4}\ln|4x-3|+10
          \]`, raw`Yes. This is the fitted solution after using the initial condition.`),
          wrongChoice(raw`\[
            y=5\ln|4x-3|+10
          \]`, raw`The coefficient of the logarithm is too large because the factor of \(4\) was not divided out.`),
          wrongChoice(raw`\[
            y=\frac{5}{4}\ln(4x-3)+10
          \]`, raw`The absolute value is important in the general logarithmic antiderivative.`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Decompose the fraction", raw`Which rewrite is most useful before integrating?`, [
          wrongChoice(raw`\[
            \frac{4x+5}{2x+3}=2+\frac{1}{2x+3}
          \]`, raw`The remainder should be \(-1\), not \(+1\).`),
          correctChoice(raw`\[
            \frac{4x+5}{2x+3}=2-\frac{1}{2x+3}
          \]`, raw`Correct. This splits the fraction into something easy to integrate.`),
          wrongChoice(raw`\[
            \frac{4x+5}{2x+3}=1+\frac{2x+2}{2x+3}
          \]`, raw`That does not simplify the integral enough. We want a constant plus a simple reciprocal.`),
          wrongChoice(raw`\[
            \frac{4x+5}{2x+3}=\frac{2}{x}+\frac{5}{3}
          \]`, raw`That is not algebraically equivalent.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Integrate the rewrite", raw`What is the antiderivative of \(2-\frac{1}{2x+3}\)?`, [
          wrongChoice(raw`\[
            2x-\ln|2x+3|+C
          \]`, raw`The logarithm term still needs the factor of \(\frac{1}{2}\).`),
          wrongChoice(raw`\[
            2x+\frac{1}{2}\ln|2x+3|+C
          \]`, raw`The reciprocal term is negative, so the logarithm term should also be negative.`),
          correctChoice(raw`\[
            2x-\frac{1}{2}\ln|2x+3|+C
          \]`, raw`Yes. The coefficient \(\frac{1}{2}\) comes from the inside derivative \(2\).`),
          wrongChoice(raw`\[
            x-\frac{1}{2}\ln|2x+3|+C
          \]`, raw`The constant \(2\) integrates to \(2x\), not \(x\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Use the bounds", raw`After substituting the limits, which equation remains?`, [
          wrongChoice(raw`\[
            2m-\frac{1}{2}\ln|2m+3|-2=2m
          \]`, raw`At the lower bound \(x=-1\), the antiderivative is \(-2\), so subtracting it adds \(2\).`),
          correctChoice(raw`\[
            2m-\frac{1}{2}\ln|2m+3|+2=2m
          \]`, raw`Correct. This is the key equation after evaluating the lower bound.`),
          wrongChoice(raw`\[
            2m-\ln|2m+3|+2=2m
          \]`, raw`The factor of \(\frac{1}{2}\) on the logarithm is missing.`),
          wrongChoice(raw`\[
            2m-\frac{1}{2}\ln|2m+3|=2
          \]`, raw`The right-hand side stays as \(2m\). The extra \(2\) comes from the lower bound.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Solve for \(m\)", raw`What is the value of \(m\)?`, [
          wrongChoice(raw`\[
            \frac{e^4+3}{2}
          \]`, raw`The \(3\) should be subtracted when solving \(2m+3=e^4\).`),
          wrongChoice(raw`\[
            \frac{e^2-3}{2}
          \]`, raw`The logarithm gives \(|2m+3|=e^4\), not \(e^2\).`),
          correctChoice(raw`\[
            \frac{e^4-3}{2}\approx 25.799
          \]`, raw`Correct. This is the valid solution for the definite integral.`),
          wrongChoice(raw`\[
            -\frac{e^4+3}{2}
          \]`, raw`That comes from the negative absolute-value branch, which would cross the asymptote at \(x=-\frac{3}{2}\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
      ]
    }),
    "3d": createConfig("3d", "2024 Paper — Splitting a cosine area into two equal parts", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(y=2\cos\left(\frac{x}{2}\right)\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3d-int-2024" class="graph-svg" viewBox="0 0 470 300" aria-label="Area under y equals 2 cosine x over 2 from x equals 0 to x equals pi, split into Area A and Area B by x equals k"></svg>
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
      steps: [
        choiceStep("Find the total area", raw`What is the total shaded area from \(x=0\) to \(x=\pi\)?`, [
          wrongChoice(raw`\[
            2
          \]`, raw`That is half the total area, not the full area under the curve.`),
          correctChoice(raw`\[
            4
          \]`, raw`Correct. \(\left[4\sin\left(\frac{x}{2}\right)\right]_0^{\pi}=4\).`),
          wrongChoice(raw`\[
            \pi
          \]`, raw`The area comes from integrating the cosine function, not from just using the width of the interval.`),
          wrongChoice(raw`\[
            8
          \]`, raw`That doubles the total area one time too many.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Set Area A equal to half", raw`If each region has area \(2\), which equation should you solve?`, [
          wrongChoice(raw`\[
            \left[2\sin\left(\frac{x}{2}\right)\right]_0^k=2
          \]`, raw`The antiderivative should be \(4\sin\left(\frac{x}{2}\right)\), not \(2\sin\left(\frac{x}{2}\right)\).`),
          wrongChoice(raw`\[
            \left[4\cos\left(\frac{x}{2}\right)\right]_0^k=2
          \]`, raw`The antiderivative of cosine is sine, not cosine.`),
          correctChoice(raw`\[
            \left[4\sin\left(\frac{x}{2}\right)\right]_0^k=2
          \]`, raw`Yes. That sets the left-hand area equal to half of the total.`),
          wrongChoice(raw`\[
            \left[4\sin\left(\frac{x}{2}\right)\right]_0^k=4
          \]`, raw`The left-hand area should equal half of the total area, not all of it.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Solve the trig equation", raw`What equation for \(k\) comes next?`, [
          wrongChoice(raw`\[
            \sin(k)=\frac{1}{2}
          \]`, raw`The sine angle is \(\frac{k}{2}\), not \(k\).`),
          correctChoice(raw`\[
            \sin\left(\frac{k}{2}\right)=\frac{1}{2}
          \]`, raw`Correct. After evaluating the antiderivative, that is the equation to solve.`),
          wrongChoice(raw`\[
            \cos\left(\frac{k}{2}\right)=\frac{1}{2}
          \]`, raw`The antiderivative gives a sine expression, not cosine.`),
          wrongChoice(raw`\[
            \sin\left(\frac{k}{2}\right)=2
          \]`, raw`A sine value cannot be \(2\). The equation simplifies to \(\frac{1}{2}\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Choose the valid value", raw`What is \(k\)?`, [
          wrongChoice(raw`\[
            \frac{\pi}{6}
          \]`, raw`That is the value of \(\frac{k}{2}\), not \(k\) itself.`),
          wrongChoice(raw`\[
            \frac{2\pi}{3}
          \]`, raw`That would make \(\frac{k}{2}=\frac{\pi}{3}\), where sine is \(\frac{\sqrt{3}}{2}\), not \(\frac{1}{2}\).`),
          correctChoice(raw`\[
            \frac{\pi}{3}
          \]`, raw`Correct. Since \(0&lt;\frac{k}{2}&lt;\frac{\pi}{2}\), the valid angle is \(\frac{\pi}{6}\).`),
          wrongChoice(raw`\[
            \frac{5\pi}{3}
          \]`, raw`That is outside the interval \(0&lt;k&lt;\pi\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
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
      steps: [
        choiceStep("Write the model", raw`Which differential equation matches the situation?`, [
          wrongChoice(raw`\[
            \frac{dN}{dt}=k(N+18)
          \]`, raw`The temperature change depends on the difference from room temperature, not the sum.`),
          wrongChoice(raw`\[
            \frac{dN}{dt}=-kN
          \]`, raw`That ignores the ambient room temperature of \(18^\circ\text{C}\).`),
          correctChoice(raw`\[
            \frac{dN}{dt}=-k(N-18)
          \]`, raw`Correct. The negative sign captures cooling toward the room temperature.`),
          wrongChoice(raw`\[
            \frac{dN}{dt}=k(18-N)
          \]`, raw`This is algebraically similar, but the standard model written from the question is \(-k(N-18)\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Solve the differential equation", raw`What is the general temperature model after integrating?`, [
          wrongChoice(raw`\[
            N=Ce^{-kt}
          \]`, raw`That would cool toward \(0^\circ\text{C}\), not toward the room temperature of \(18^\circ\text{C}\).`),
          correctChoice(raw`\[
            N=18+Ce^{-kt}
          \]`, raw`Yes. The excess temperature above room temperature decays exponentially.`),
          wrongChoice(raw`\[
            N=18+Ce^{kt}
          \]`, raw`The exponent must be negative so the coffee cools over time.`),
          wrongChoice(raw`\[
            N=18+kCe^{-t}
          \]`, raw`The exponential decay rate should stay in the exponent as \(e^{-kt}\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Use the two data points", raw`After substituting \(t=30\) and \(t=90\), which pair of equations is correct?`, [
          wrongChoice(raw`\[
            50=18+Ce^{-30k},\quad 30=18+Ce^{-60k}
          \]`, raw`The second reading is one hour after the \(30\)-minute mark, so it occurs at \(t=90\), not \(t=60\).`),
          correctChoice(raw`\[
            32=Ce^{-30k},\quad 12=Ce^{-90k}
          \]`, raw`Correct. Subtracting \(18\) from each measured temperature gives these two equations.`),
          wrongChoice(raw`\[
            50=Ce^{-30k},\quad 30=Ce^{-90k}
          \]`, raw`The room temperature \(18\) must be removed first because the model is \(N=18+Ce^{-kt}\).`),
          wrongChoice(raw`\[
            32=Ce^{30k},\quad 12=Ce^{90k}
          \]`, raw`The exponent should stay negative.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Eliminate the constant", raw`What equation do you get by dividing the two temperature equations?`, [
          wrongChoice(raw`\[
            \frac{12}{32}=e^{-120k}
          \]`, raw`The exponents subtract to \(-90k-(-30k)=-60k\), not \(-120k\).`),
          wrongChoice(raw`\[
            \frac{12}{32}=e^{-30k}
          \]`, raw`Only dividing by the first exponential leaves a difference of \(-60k\).`),
          correctChoice(raw`\[
            \frac{12}{32}=e^{-60k}
          \]`, raw`Yes. This removes \(C\) and leaves a clean equation for \(k\).`),
          wrongChoice(raw`\[
            \frac{12}{32}=e^{60k}
          \]`, raw`The exponent difference is still negative.`)
        ], {
          buttonGridClass: "button-grid two-col"
        }),
        choiceStep("Find the original temperature", raw`What was the temperature of the coffee when it was made?`, [
          wrongChoice(raw`\[
            52.256^\circ\text{C}
          \]`, raw`That is the value of \(C\), the excess above room temperature, not the original temperature itself.`),
          correctChoice(raw`\[
            70.256^\circ\text{C}
          \]`, raw`Correct. The initial temperature is \(18+C\approx 18+52.256\).`),
          wrongChoice(raw`\[
            68^\circ\text{C}
          \]`, raw`That is too low once both measurements are fitted to the exponential model.`),
          wrongChoice(raw`\[
            72.256^\circ\text{C}
          \]`, raw`That adds \(18\) and \(52.256\) incorrectly. The correct total is \(70.256\).`)
        ], {
          buttonGridClass: "button-grid two-col"
        })
      ]
    })
  };
}());
