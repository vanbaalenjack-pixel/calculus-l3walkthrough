(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-differentiation-2017";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const metadata = {
    topic: "Differentiation",
    year: 2017,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };
  const tags = [
    "Differentiation",
    "2017",
    "NCEA Level 3 Calculus",
    "mixed / Excellence-style"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return id + "2017.html";
  }

  function adjacentId(id, offset) {
    const index = questionOrder.indexOf(id);
    const target = index + offset;
    return index >= 0 && target >= 0 && target < questionOrder.length
      ? questionOrder[target]
      : null;
  }

  function buildFinalNav(id) {
    const previous = adjacentId(id, -1);
    const next = adjacentId(id, 1);

    return {
      secondary: previous
        ? { href: pageHref(previous), label: "\u2190 Back to " + questionLabel(previous) }
        : { href: paperHref, label: "\u2190 Back to paper" },
      primary: next
        ? { href: pageHref(next), label: "Next question \u2192" }
        : { href: paperHref, label: "Back to paper" }
    };
  }

  function createConfig(id, subtitle, details) {
    const next = adjacentId(id, 1);

    return Object.assign({
      browserTitle: "2017 Differentiation Paper - " + questionLabel(id),
      eyebrow: "Level 3 Differentiation Walkthrough",
      title: questionLabel(id),
      subtitle: subtitle,
      backHref: paperHref,
      nextHref: next ? pageHref(next) : paperHref,
      nextLabel: next ? "Next question \u2192" : "Back to paper",
      finalNav: buildFinalNav(id),
      metadata: metadata,
      tags: tags
    }, details);
  }

  function guidedStep(title, previewHtml, workingHtml) {
    return {
      title: title,
      previewHtml: previewHtml,
      workingHtml: workingHtml
    };
  }

  function answerHighlight(label, html) {
    return raw`
      <div class="answer-highlight walkthrough-answer-highlight">
        <p class="question-label">${label || "Final answer"}</p>
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

  function lineMarkup(scale, x1, y1, x2, y2, className, extra) {
    return `<line class="${className}" x1="${scale.x(x1)}" y1="${scale.y(y1)}" x2="${scale.x(x2)}" y2="${scale.y(y2)}"${extra || ""}></line>`;
  }

  function circleMarkup(scale, x, y, radius, className) {
    return `<circle class="${className}" cx="${scale.x(x)}" cy="${scale.y(y)}" r="${radius}"></circle>`;
  }

  function textMarkup(scale, x, y, text, className, extra) {
    const extraAttributes = extra || "";
    const sizeStyle = /\sstyle=/.test(extraAttributes)
      ? ""
      : className === "graph-label"
        ? ' style="font-size:22px"'
        : className === "graph-equation-label" || className === "question-axis-label"
          ? ' style="font-size:24px"'
          : "";

    return `<text class="${className}" x="${scale.x(x)}" y="${scale.y(y)}"${sizeStyle}${extraAttributes}>${text}</text>`;
  }

  function curvePath(scale, start, end, increment, valueAt) {
    const points = [];

    for (let value = start; value <= end + increment / 2; value += increment) {
      points.push((points.length ? "L " : "M ") + scale.x(value) + " " + scale.y(valueAt(value)));
    }

    return points.join(" ");
  }

  function parabolaNormalDiagramHtml() {
    const width = 600;
    const height = 430;
    const padding = 50;
    const scale = createScale(width, height, padding, -2.8, 9.3, -1.3, 14.5);
    const parabola = curvePath(scale, -1.95, 7.95, 0.05, function (x) {
      return 0.5 * Math.pow(x - 3, 2) + 2;
    });
    const xTicks = [4, 8].map(function (x) {
      return lineMarkup(scale, x, -0.16, x, 0.16, "graph-axis")
        + textMarkup(scale, x, -0.58, String(x), "graph-label", ' text-anchor="middle"');
    });
    const yTicks = [4, 8, 12].map(function (y) {
      return lineMarkup(scale, -0.12, y, 0.12, y, "graph-axis")
        + textMarkup(scale, -0.78, y - 0.1, String(y), "graph-label", ' text-anchor="end"');
    });

    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the parabola and normal diagram">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="diff-2017-parabola-title diff-2017-parabola-desc">
          <title id="diff-2017-parabola-title">Parabola and normal line</title>
          <desc id="diff-2017-parabola-desc">The upward-opening parabola has vertex at three comma two. A rising normal line passes through one comma four and meets the right branch again at the point P.</desc>
          <defs>
            <marker id="diff-2017-parabola-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${lineMarkup(scale, -2.65, 0, 9.15, 0, "graph-axis", ' marker-start="url(#diff-2017-parabola-arrow)" marker-end="url(#diff-2017-parabola-arrow)"')}
          ${lineMarkup(scale, 0, -1.2, 0, 14.35, "graph-axis", ' marker-start="url(#diff-2017-parabola-arrow)" marker-end="url(#diff-2017-parabola-arrow)"')}
          ${xTicks.join("")}
          ${yTicks.join("")}
          <path class="question-curve" d="${parabola}"></path>
          ${lineMarkup(scale, -0.5, 3.25, 8.2, 7.6, "question-normal")}
          ${circleMarkup(scale, 1, 4, 5, "question-dot")}
          ${circleMarkup(scale, 6, 6.5, 5, "question-dot")}
          ${textMarkup(scale, 1.18, 4.85, "(1, 4)", "graph-equation-label")}
          ${textMarkup(scale, 6.35, 6.12, "P", "graph-equation-label")}
          ${textMarkup(scale, 8.95, -0.5, "x", "question-axis-label")}
          ${textMarkup(scale, 0.28, 14.05, "y", "question-axis-label")}
        </svg>
      </div>
    `;
  }

  function squareRootTangentDiagramHtml() {
    const width = 600;
    const height = 340;
    const padding = 46;
    const scale = createScale(width, height, padding, -6, 10, -1.5, 4.4);
    const squareRoot = curvePath(scale, 0, 10, 0.05, function (x) {
      return Math.sqrt(x);
    });

    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the square-root curve and tangent">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="diff-2017-tangent-title diff-2017-tangent-desc">
          <title id="diff-2017-tangent-title">Square-root curve and tangent</title>
          <desc id="diff-2017-tangent-desc">The curve y equals square root of x begins at the origin. Its tangent at four comma two extends left to meet the x-axis at Q.</desc>
          <defs>
            <marker id="diff-2017-tangent-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${lineMarkup(scale, -5.85, 0, 9.85, 0, "graph-axis", ' marker-start="url(#diff-2017-tangent-arrow)" marker-end="url(#diff-2017-tangent-arrow)"')}
          ${lineMarkup(scale, 0, -1.35, 0, 4.25, "graph-axis", ' marker-start="url(#diff-2017-tangent-arrow)" marker-end="url(#diff-2017-tangent-arrow)"')}
          <path class="question-curve" d="${squareRoot}"></path>
          ${lineMarkup(scale, -5.4, -0.35, 9.6, 3.4, "question-normal")}
          ${circleMarkup(scale, 0, 0, 4.5, "question-origin")}
          ${circleMarkup(scale, 4, 2, 5, "question-dot")}
          ${textMarkup(scale, 3.55, 1.55, "(4, 2)", "graph-equation-label", ' text-anchor="end"')}
          ${textMarkup(scale, -4.2, 0.35, "Q", "graph-equation-label", ' text-anchor="middle"')}
          ${textMarkup(scale, 9.55, -0.38, "x", "question-axis-label")}
          ${textMarkup(scale, 0.28, 4.05, "y", "question-axis-label")}
        </svg>
      </div>
    `;
  }

  function squareRootClosestDiagramHtml() {
    const width = 600;
    const height = 380;
    const padding = 48;
    const scale = createScale(width, height, padding, -1.5, 11.5, -1, 5.1);
    const squareRoot = curvePath(scale, 0, 11, 0.05, function (x) {
      return Math.sqrt(x);
    });
    const xTicks = [2, 4, 6, 8, 10].map(function (x) {
      return lineMarkup(scale, x, -0.12, x, 0.12, "graph-axis")
        + textMarkup(scale, x, -0.43, String(x), "graph-label", ' text-anchor="middle"');
    });
    const yTicks = [2, 4].map(function (y) {
      return lineMarkup(scale, -0.1, y, 0.1, y, "graph-axis")
        + textMarkup(scale, -0.32, y - 0.08, String(y), "graph-label", ' text-anchor="end"');
    });
    const candidateX = 3.5;
    const candidateY = Math.sqrt(candidateX);

    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the square-root curve and closest-point diagram">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="diff-2017-closest-title diff-2017-closest-desc">
          <title id="diff-2017-closest-title">Point on the square-root curve closest to four comma zero</title>
          <desc id="diff-2017-closest-desc">A point P lies on y equals square root of x. A dashed segment joins P to the fixed point four comma zero on the x-axis.</desc>
          <defs>
            <marker id="diff-2017-closest-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${lineMarkup(scale, -1.35, 0, 11.35, 0, "graph-axis", ' marker-start="url(#diff-2017-closest-arrow)" marker-end="url(#diff-2017-closest-arrow)"')}
          ${lineMarkup(scale, 0, -0.85, 0, 4.95, "graph-axis", ' marker-start="url(#diff-2017-closest-arrow)" marker-end="url(#diff-2017-closest-arrow)"')}
          ${xTicks.join("")}
          ${yTicks.join("")}
          <path class="question-curve" d="${squareRoot}"></path>
          ${lineMarkup(scale, candidateX, candidateY, 4, 0, "graph-guide")}
          ${circleMarkup(scale, 0, 0, 4.5, "question-origin")}
          ${circleMarkup(scale, candidateX, candidateY, 5, "question-dot")}
          ${circleMarkup(scale, 4, 0, 5, "question-dot")}
          ${textMarkup(scale, candidateX - 0.18, candidateY + 0.45, "P (x, y)", "graph-equation-label", ' text-anchor="end"')}
          ${textMarkup(scale, 4.22, 0.48, "(4, 0)", "graph-equation-label")}
          ${textMarkup(scale, 11.05, -0.4, "x", "question-axis-label")}
          ${textMarkup(scale, 0.25, 4.75, "y", "question-axis-label")}
        </svg>
      </div>
    `;
  }

  function semicircleRectangleDiagramHtml() {
    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the rectangle inside a semicircle">
        <svg class="graph-svg" viewBox="60 0 600 430" role="img" aria-labelledby="diff-2017-semicircle-title diff-2017-semicircle-desc">
          <title id="diff-2017-semicircle-title">Rectangle inscribed in a semicircle</title>
          <desc id="diff-2017-semicircle-desc">A semicircle of radius r is centred on its diameter. A symmetric rectangle has half-width x and height y, with both upper corners on the arc.</desc>
          <defs>
            <marker id="diff-2017-semicircle-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="720" height="430"></rect>
          <path class="question-curve" d="M 90 340 A 270 270 0 0 1 630 340"></path>
          <line class="question-curve" x1="90" y1="340" x2="630" y2="340"></line>
          <rect class="question-curve" x="205" y="119" width="310" height="221"></rect>
          <line class="question-normal" x1="360" y1="55" x2="360" y2="365"></line>
          <line class="graph-measure-soft" x1="535" y1="126" x2="535" y2="333" marker-start="url(#diff-2017-semicircle-arrow)" marker-end="url(#diff-2017-semicircle-arrow)"></line>
          <circle class="question-origin" cx="360" cy="340" r="5"></circle>
          <text class="graph-equation-label" style="font-size:24px" x="90" y="374" text-anchor="middle">−r</text>
          <text class="graph-equation-label" style="font-size:24px" x="205" y="374" text-anchor="middle">−x</text>
          <text class="graph-equation-label" style="font-size:24px" x="515" y="374" text-anchor="middle">x</text>
          <text class="graph-equation-label" style="font-size:24px" x="630" y="374" text-anchor="middle">r</text>
          <text class="graph-equation-label" style="font-size:24px" x="552" y="232">y</text>
          <text class="graph-label" style="font-size:22px" x="360" y="407" text-anchor="middle">width = 2x</text>
        </svg>
      </div>
    `;
  }

  function piecewiseGraphHtml() {
    const width = 560;
    const height = 410;
    const padding = 46;
    const scale = createScale(width, height, padding, -4.5, 4.5, -2.5, 6.5);
    const xTicks = [];
    const yTicks = [];
    const leftCurve = [];
    const rightCurve = [];

    for (let x = -4; x <= 4; x += 1) {
      xTicks.push(lineMarkup(scale, x, -0.12, x, 0.12, "graph-axis"));
      if (x !== 0) {
        xTicks.push(textMarkup(scale, x, -0.42, String(x).replace("-", "\u2212"), "graph-label", ' text-anchor="middle" style="font-size:20px"'));
      }
    }

    for (let y = -2; y <= 6; y += 1) {
      yTicks.push(lineMarkup(scale, -0.12, y, 0.12, y, "graph-axis"));
      if (y !== 0) {
        yTicks.push(textMarkup(scale, -0.28, y - 0.08, String(y).replace("-", "\u2212"), "graph-label", ' text-anchor="end" style="font-size:20px"'));
      }
    }

    for (let x = 0; x <= 1.001; x += 0.025) {
      const y = 2 * Math.pow(x - 1, 2);
      leftCurve.push((leftCurve.length ? "L " : "M ") + scale.x(x) + " " + scale.y(y));
    }

    for (let x = 1; x <= 3.22; x += 0.025) {
      const y = 5 - 5 * Math.pow(x - 2, 2);
      rightCurve.push((rightCurve.length ? "L " : "M ") + scale.x(x) + " " + scale.y(y));
    }

    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the piecewise graph of f">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="diff-2017-piecewise-title diff-2017-piecewise-desc">
          <title id="diff-2017-piecewise-title">Piecewise graph of y equals f of x</title>
          <desc id="diff-2017-piecewise-desc">A horizontal branch at y equals one meets a rising line at negative two comma one. The line has an open point at negative one comma two and a filled point at negative one comma one, then ends filled at zero comma three. A separate curve begins open at zero comma two, falls to a corner at one comma zero, rises to a maximum at two comma five, and then falls through three comma zero.</desc>
          <defs>
            <marker id="diff-2017-piecewise-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${lineMarkup(scale, -4.42, 0, 4.42, 0, "graph-axis", ' marker-start="url(#diff-2017-piecewise-arrow)" marker-end="url(#diff-2017-piecewise-arrow)"')}
          ${lineMarkup(scale, 0, -2.42, 0, 6.42, "graph-axis", ' marker-start="url(#diff-2017-piecewise-arrow)" marker-end="url(#diff-2017-piecewise-arrow)"')}
          ${xTicks.join("")}
          ${yTicks.join("")}
          ${lineMarkup(scale, -4.3, 1, -2, 1, "question-curve", ' marker-start="url(#diff-2017-piecewise-arrow)"')}
          ${lineMarkup(scale, -2, 1, 0, 3, "question-curve")}
          ${circleMarkup(scale, -1, 2, 7, "question-origin")}
          ${circleMarkup(scale, -1, 1, 7, "question-dot")}
          ${circleMarkup(scale, 0, 3, 7, "question-dot")}
          <path class="question-curve" d="${leftCurve.join(" ")}"></path>
          ${circleMarkup(scale, 0, 2, 7, "question-origin")}
          <path class="question-curve" d="${rightCurve.join(" ")}" marker-end="url(#diff-2017-piecewise-arrow)"></path>
          ${textMarkup(scale, 4.28, -0.34, "x", "question-axis-label", ' style="font-size:24px;font-weight:700"')}
          ${textMarkup(scale, 0.2, 6.18, "y", "question-axis-label", ' style="font-size:24px;font-weight:700"')}
        </svg>
      </div>
    `;
  }

  function elevatorDiagramHtml() {
    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the elevator related-rates diagram">
        <svg class="graph-svg" viewBox="50 0 620 500" role="img" aria-labelledby="diff-2017-elevator-title diff-2017-elevator-desc">
          <title id="diff-2017-elevator-title">Elevator, Sarah, and angle of elevation</title>
          <desc id="diff-2017-elevator-desc">Sarah stands thirty metres horizontally from an elevator shaft. The elevator floor is x metres above her eye level and rises at two metres per second. A dashed line of sight forms the angle theta at Sarah.</desc>
          <defs>
            <marker id="diff-2017-elevator-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="720" height="500"></rect>
          <rect x="72" y="40" width="126" height="416" fill="#f8fafc" stroke="#111827" stroke-width="2"></rect>
          <rect x="92" y="118" width="86" height="92" rx="16" fill="#0ea5e9" stroke="#111827" stroke-width="2"></rect>
          <line class="graph-measure" x1="135" y1="182" x2="135" y2="92" marker-end="url(#diff-2017-elevator-arrow)"></line>
          <text class="graph-label" style="font-size:24px" x="151" y="103">rising at 2 m s⁻¹</text>
          <line class="graph-guide" x1="178" y1="210" x2="593" y2="369"></line>
          <line class="graph-guide" x1="178" y1="369" x2="593" y2="369"></line>
          <line class="graph-measure" x1="223" y1="214" x2="223" y2="365" marker-start="url(#diff-2017-elevator-arrow)" marker-end="url(#diff-2017-elevator-arrow)"></line>
          <text class="graph-equation-label" style="font-size:27px" x="240" y="278">x</text>
          <text class="graph-label" style="font-size:24px" x="240" y="304">20 m at this instant</text>
          <line class="graph-measure" x1="188" y1="438" x2="583" y2="438" marker-start="url(#diff-2017-elevator-arrow)" marker-end="url(#diff-2017-elevator-arrow)"></line>
          <text class="graph-equation-label" style="font-size:27px" x="386" y="465" text-anchor="middle">30 m</text>
          <circle class="question-dot" cx="593" cy="369" r="5"></circle>
          <circle cx="605" cy="369" r="12" fill="#ffffff" stroke="#111827" stroke-width="2"></circle>
          <line class="question-curve" x1="605" y1="381" x2="605" y2="426"></line>
          <line class="question-curve" x1="605" y1="392" x2="583" y2="411"></line>
          <line class="question-curve" x1="605" y1="392" x2="625" y2="410"></line>
          <line class="question-curve" x1="605" y1="426" x2="589" y2="452"></line>
          <line class="question-curve" x1="605" y1="426" x2="621" y2="452"></line>
          <text class="graph-label" style="font-size:24px" x="605" y="483" text-anchor="middle">Sarah</text>
          <path class="question-curve" d="M 551 369 A 42 42 0 0 1 556 350"></path>
          <text class="graph-equation-label" style="font-size:27px" x="535" y="354">θ</text>
          <text class="graph-label" style="font-size:24px" x="72" y="28">elevator shaft</text>
          <text class="graph-label" style="font-size:24px" x="240" y="200">elevator floor</text>
        </svg>
      </div>
    `;
  }

  window.Differentiation2017Walkthroughs = {
    "1a": createConfig("1a", "Question One - power and chain rules", {
      focus: raw`Treat the square root as a power, then differentiate the tangent term as a composite function.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Differentiate }y=\sqrt{x}+\tan(2x).
          \]
        </div>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[\frac{dy}{dx}=\frac{1}{2\sqrt{x}}+2\sec^2(2x)\]</div>
      `),
      guidedSteps: [
        guidedStep("Rewrite the square root", raw`Writing a radical as an exponent makes the power rule visible.`, raw`
          <div class="math-block">\[\sqrt{x}=x^{1/2}\]</div>
          <p class="step-text">For \(x^n\), the power rule is</p>
          <div class="math-block">\[\frac{d}{dx}(x^n)=nx^{n-1}.\]</div>
        `),
        guidedStep("Differentiate the square-root term", raw`Apply the power rule, then rewrite the negative exponent as a radical.`, raw`
          <div class="math-block">
            \[\frac{d}{dx}\left(x^{1/2}\right)=\frac12x^{-1/2}=\frac{1}{2\sqrt{x}}\]
          </div>
          <p class="step-text">The square-root derivative requires \(x>0\); the tangent term also requires \(\cos(2x)\ne0\).</p>
        `),
        guidedStep("Differentiate the tangent term", raw`The input to tangent is \(2x\), so the chain rule contributes the derivative of that input.`, raw`
          <div class="math-block">
            \[\frac{d}{dx}\bigl(\tan u\bigr)=\sec^2(u)\frac{du}{dx}\]
            \[u=2x,\qquad \frac{du}{dx}=2\]
            \[\frac{d}{dx}\bigl(\tan(2x)\bigr)=2\sec^2(2x)\]
          </div>
        `),
        guidedStep("Combine the two derivatives", raw`Differentiate a sum term by term.`, raw`
          <div class="math-block">
            \[\frac{dy}{dx}=\frac{1}{2\sqrt{x}}+2\sec^2(2x)\]
          </div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{\frac{dy}{dx}=\frac{1}{2\sqrt{x}}+2\sec^2(2x)}\]</div>`)}
        `)
      ]
    }),

    "1b": createConfig("1b", "Question One - quotient and chain rules", {
      focus: raw`Use the quotient rule, taking care to differentiate the exponential numerator with the chain rule before evaluating the gradient.`,
      questionHtml: raw`
        <p class="step-text">Find the gradient of the tangent to the curve</p>
        <div class="question-math">\[y=\frac{e^{2x}}{x+2}\]</div>
        <p class="step-text">at the point where \(x=0\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[\left.\frac{dy}{dx}\right|_{x=0}=\frac34\]</div>
      `),
      guidedSteps: [
        guidedStep("Set up the quotient rule", raw`Name the numerator and denominator so that each derivative is clear.`, raw`
          <p class="step-text">For \(y=u/v\),</p>
          <div class="math-block">\[\frac{dy}{dx}=\frac{u'v-uv'}{v^2}.\]</div>
          <p class="step-text">Here</p>
          <div class="math-block">\[u=e^{2x},\qquad v=x+2.\]</div>
        `),
        guidedStep("Differentiate numerator and denominator", raw`The exponential has an inner function, so include its derivative.`, raw`
          <div class="math-block">
            \[u'=2e^{2x}\]
            \[v'=1\]
          </div>
          <p class="step-text">The factor \(2\) in \(u'\) comes from differentiating the exponent \(2x\).</p>
        `),
        guidedStep("Form the derivative", raw`Substitute the four quotient-rule pieces without cancelling too early.`, raw`
          <div class="math-block">
            \[\frac{dy}{dx}=\frac{2e^{2x}(x+2)-e^{2x}(1)}{(x+2)^2}\]
          </div>
        `),
        guidedStep("Evaluate the requested gradient", raw`A tangent gradient at a specified x-value is found by substituting that value into the derivative.`, raw`
          <div class="math-block">
            \[\left.\frac{dy}{dx}\right|_{x=0}=\frac{2e^0(0+2)-e^0}{(0+2)^2}\]
            \[=\frac{4-1}{4}=\frac34\]
          </div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{\text{Gradient}=\frac34}\]</div>`)}
        `)
      ]
    }),

    "1c": createConfig("1c", "Question One - tangent, normal, and intersections", {
      focus: raw`Find the tangent gradient at the known point, convert it to the perpendicular normal gradient, then solve where that line meets the parabola.`,
      questionHtml: raw`
        <p class="step-text">The normal to the parabola</p>
        <div class="question-math">\[y=\frac12(x-3)^2+2\]</div>
        <p class="step-text">at the point \((1,4)\) intersects the parabola again at the point \(P\).</p>
        ${parabolaNormalDiagramHtml()}
        <p class="step-text">Find the \(x\)-coordinate of point \(P\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[x_P=6\]</div>
      `),
      guidedSteps: [
        guidedStep("Find the tangent gradient", raw`Differentiate the parabola, then substitute the x-coordinate of the known point.`, raw`
          <div class="math-block">
            \[\frac{dy}{dx}=\frac12\cdot2(x-3)=x-3\]
            \[m_{\text{tangent}}=1-3=-2\]
          </div>
        `),
        guidedStep("Convert to the normal gradient", raw`Perpendicular non-vertical lines have gradients whose product is negative one.`, raw`
          <div class="math-block">
            \[m_{\text{tangent}}m_{\text{normal}}=-1\]
            \[(-2)m_{\text{normal}}=-1\]
            \[m_{\text{normal}}=\frac12\]
          </div>
          <p class="step-text">This is the negative reciprocal of the tangent gradient.</p>
        `),
        guidedStep("Write the normal equation", raw`Use point-gradient form with the known point on the normal.`, raw`
          <div class="math-block">
            \[y-y_1=m(x-x_1)\]
            \[y-4=\frac12(x-1)\]
            \[y=\frac{x}{2}+\frac72\]
          </div>
        `),
        guidedStep("Find both intersections", raw`At an intersection, the line and parabola have the same y-value. Expect one root for the known point and one for P.`, raw`
          <div class="math-block">
            \[\frac{x}{2}+\frac72=\frac12(x-3)^2+2\]
            \[x+3=(x-3)^2\]
            \[x+3=x^2-6x+9\]
            \[x^2-7x+6=0\]
            \[(x-1)(x-6)=0\]
          </div>
          <p class="step-text">The root \(x=1\) is the intersection already given in the question. Point \(P\) is the other intersection, so the known root must not be reported as the answer.</p>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{x_P=6}\]</div>`)}
        `)
      ]
    }),

    "1d": createConfig("1d", "Question One - parametric differentiation", {
      focus: raw`Differentiate both coordinates with respect to the common parameter, then divide the two rates to obtain the curve's gradient.`,
      questionHtml: raw`
        <p class="step-text">A curve is defined parametrically by the equations</p>
        <div class="question-math">\[x=\sqrt{t+1},\qquad y=\sin(2t).\]</div>
        <p class="step-text">Find the gradient of the tangent to the curve at the point when \(t=0\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[\left.\frac{dy}{dx}\right|_{t=0}=4\]</div>
      `),
      guidedSteps: [
        guidedStep("Differentiate x with respect to t", raw`Rewrite the radical as a power and apply the chain rule.`, raw`
          <div class="math-block">
            \[x=(t+1)^{1/2}\]
            \[\frac{dx}{dt}=\frac12(t+1)^{-1/2}=\frac{1}{2\sqrt{t+1}}\]
          </div>
        `),
        guidedStep("Differentiate y with respect to t", raw`The sine input is \(2t\), so differentiating it supplies another factor.`, raw`
          <div class="math-block">
            \[\frac{dy}{dt}=2\cos(2t)\]
          </div>
        `),
        guidedStep("Form the parametric gradient", raw`Both x and y change through t, so their rate ratio gives the rate of change of y with x.`, raw`
          <p class="step-text">The chain rule gives \(\frac{dy}{dt}=\frac{dy}{dx}\frac{dx}{dt}\). Therefore, when \(dx/dt\ne0\),</p>
          <div class="math-block">
            \[\frac{dy}{dx}=\frac{dy/dt}{dx/dt}\]
            \[=\frac{2\cos(2t)}{1/(2\sqrt{t+1})}\]
            \[=4\sqrt{t+1}\cos(2t).\]
          </div>
        `),
        guidedStep("Evaluate at the stated parameter", raw`Substitute the parameter value only after forming the derivative.`, raw`
          <div class="math-block">
            \[\left.\frac{dy}{dx}\right|_{t=0}=4\sqrt{0+1}\cos(0)=4\]
          </div>
          <p class="step-text">At this moment the point is \((x,y)=(1,0)\), and its tangent has this gradient.</p>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{\text{Gradient}=4}\]</div>`)}
        `)
      ]
    }),

    "1e": createConfig("1e", "Question One - conditions at a turning point", {
      focus: raw`A stated turning point supplies two independent equations: its coordinates lie on the curve, and its tangent is horizontal.`,
      questionHtml: raw`
        <p class="step-text">Find the values of \(a\) and \(b\) such that the curve</p>
        <div class="question-math">\[y=\frac{ax-b}{x^2-1}\]</div>
        <p class="step-text">has a turning point at \((3,1)\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[a=6,\qquad b=10\]</div>
      `),
      guidedSteps: [
        guidedStep("Use the point condition", raw`Because the stated point is on the curve, substituting both coordinates gives one equation.`, raw`
          <div class="math-block">
            \[y(3)=1\]
            \[\frac{3a-b}{3^2-1}=1\]
            \[\frac{3a-b}{8}=1\]
            \[3a-b=8.\tag{1}\]
          </div>
        `),
        guidedStep("Differentiate the curve", raw`Use the quotient rule, treating a and b as constants.`, raw`
          <div class="math-block">
            \[\frac{dy}{dx}=\frac{a(x^2-1)-(ax-b)(2x)}{(x^2-1)^2}\]
          </div>
        `),
        guidedStep("Use the turning-point condition", raw`At a differentiable turning point the tangent is horizontal, so the derivative is zero at the stated x-value.`, raw`
          <div class="math-block">
            \[\left.\frac{dy}{dx}\right|_{x=3}=0\]
            \[\frac{8a-6(3a-b)}{64}=0\]
            \[8a-18a+6b=0\]
            \[6b=10a.\tag{2}\]
          </div>
        `),
        guidedStep("Solve the simultaneous equations", raw`Use the derivative condition to replace one unknown in the point equation.`, raw`
          <div class="math-block">
            \[b=\frac{5a}{3}\]
            \[3a-\frac{5a}{3}=8\]
            \[\frac{4a}{3}=8\]
            \[a=6,\qquad b=10\]
          </div>
          <p class="step-text">Check: \((3a-b)/8=(18-10)/8=1\), and the derivative numerator at \(x=3\) is \(48-6(8)=0\).</p>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{a=6,\qquad b=10}\]</div>`)}
        `)
      ]
    }),

    "2a": createConfig("2a", "Question Two - the chain rule", {
      focus: raw`Keep the nested power intact: differentiate the outside first, then multiply by the derivative of the inside.`,
      questionHtml: raw`
        <div class="question-math">\[\text{Differentiate }y=2(x^2-4x)^5.\]</div>
        <p class="step-text question-note">You do not need to simplify your answer.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[\frac{dy}{dx}=10(x^2-4x)^4(2x-4)\]</div>
      `),
      guidedSteps: [
        guidedStep("Identify the inner and outer functions", raw`A substitution can make the two layers of the composite function easier to see.`, raw`
          <div class="math-block">
            \[u=x^2-4x,\qquad y=2u^5\]
          </div>
        `),
        guidedStep("Differentiate both layers", raw`Differentiate the outside with respect to u and the inside with respect to x.`, raw`
          <div class="math-block">
            \[\frac{dy}{du}=10u^4\]
            \[\frac{du}{dx}=2x-4\]
          </div>
        `),
        guidedStep("Apply the chain rule", raw`Multiply the layer derivatives and replace u with the original inner expression.`, raw`
          <div class="math-block">
            \[\frac{dy}{dx}=\frac{dy}{du}\frac{du}{dx}\]
            \[=10(x^2-4x)^4(2x-4)\]
          </div>
          <p class="step-text">The question does not require expansion, and the factored form shows the chain rule clearly.</p>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{\frac{dy}{dx}=10(x^2-4x)^4(2x-4)}\]</div>`)}
        `)
      ]
    }),

    "2b": createConfig("2b", "Question Two - maximising a model", {
      focus: raw`Differentiate the percentage model, solve for an interior stationary point, then use the derivative or concavity to justify that it gives the maximum in the allowed domain.`,
      questionHtml: raw`
        <p class="step-text">The percentage of seeds germinating depends on the amount of water applied to the seedbed that the seeds are sown in, and may be modelled by the function</p>
        <div class="question-math">\[P(w)=96\ln(w+1.25)-16w-12,\]</div>
        <p class="step-text">where \(P\) is the percentage of seeds that germinate and \(w\) is the daily amount of water applied (litres per square metre of seedbed), with \(0\le w\le15\).</p>
        <p class="step-text">Find the amount of water that should be applied daily to maximise the percentage of seeds germinating.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[w=4.75\text{ L m}^{-2}\text{ per day}\]</div>
      `),
      guidedSteps: [
        guidedStep("Differentiate the model", raw`An interior maximum of a differentiable model occurs at a stationary point, so begin by finding the derivative.`, raw`
          <div class="math-block">
            \[P'(w)=96\left(\frac{1}{w+1.25}\right)-16\]
            \[P'(w)=\frac{96}{w+1.25}-16\]
          </div>
          <p class="step-text">The logarithm uses the chain rule; the derivative of \(w+1.25\) is \(1\).</p>
        `),
        guidedStep("Find the stationary amount", raw`Set the derivative equal to zero and solve without rounding.`, raw`
          <div class="math-block">
            \[\frac{96}{w+1.25}-16=0\]
            \[\frac{96}{w+1.25}=16\]
            \[96=16(w+1.25)\]
            \[w+1.25=6\]
            \[w=4.75\]
          </div>
        `),
        guidedStep("Check the domain and maximum", raw`A stationary point is only usable if it lies in the model's domain, and it still needs a maximum justification.`, raw`
          <p class="step-text">The value satisfies \(0\le4.75\le15\). Also, throughout this domain,</p>
          <div class="math-block">
            \[P''(w)=-\frac{96}{(w+1.25)^2}<0.\]
          </div>
          <p class="step-text">Therefore the model is concave down and its stationary point is the maximum. Equivalently, \(P'(w)\) changes from positive to negative there.</p>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">\[\boxed{w=4.75\text{ L m}^{-2}\text{ per day}}\]</div>
            <p class="step-text">Apply \(4.75\) litres per square metre each day.</p>
          `)}
        `)
      ]
    }),

    "2c": createConfig("2c", "Question Two - a tangent and its intercept", {
      focus: raw`Differentiate the square-root curve, find the tangent gradient at the stated point, then set y to zero to locate the x-intercept.`,
      questionHtml: raw`
        <p class="step-text">The tangent to the curve</p>
        <div class="question-math">\[y=\sqrt{x}\]</div>
        <p class="step-text">is drawn at the point \((4,2)\).</p>
        ${squareRootTangentDiagramHtml()}
        <p class="step-text">Find the coordinates of the point \(Q\) where the tangent intersects the \(x\)-axis.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[Q=(-4,0)\]</div>
      `),
      guidedSteps: [
        guidedStep("Differentiate the curve", raw`Rewrite the square root as a power before applying the power rule.`, raw`
          <div class="math-block">
            \[y=x^{1/2}\]
            \[\frac{dy}{dx}=\frac12x^{-1/2}=\frac{1}{2\sqrt{x}}\]
          </div>
        `),
        guidedStep("Find the tangent gradient", raw`Evaluate the derivative at the x-coordinate of the point of tangency.`, raw`
          <div class="math-block">
            \[m=\left.\frac{dy}{dx}\right|_{x=4}=\frac{1}{2\sqrt4}=\frac14\]
          </div>
        `),
        guidedStep("Write the tangent equation", raw`Use point-gradient form with the given point and the calculated gradient.`, raw`
          <div class="math-block">
            \[y-2=\frac14(x-4)\]
            \[y-2=\frac{x}{4}-1\]
            \[y=\frac{x}{4}+1\]
          </div>
        `),
        guidedStep("Find the x-intercept", raw`Every point on the x-axis has y-coordinate zero.`, raw`
          <div class="math-block">
            \[0=\frac{x}{4}+1\]
            \[\frac{x}{4}=-1\]
            \[x=-4\]
          </div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{Q=(-4,0)}\]</div>`)}
        `)
      ]
    }),

    "2d": createConfig("2d", "Question Two - minimising distance", {
      focus: raw`Use the curve equation to turn the squared distance into a function of x alone, then locate its stationary value.`,
      questionHtml: raw`
        <p class="step-text">Find the coordinates of the point \(P(x,y)\) on the curve</p>
        <div class="question-math">\[y=\sqrt{x}\]</div>
        <p class="step-text">that is closest to the point \((4,0)\).</p>
        ${squareRootClosestDiagramHtml()}
        <p class="step-text question-note">You do not need to prove that your solution is the minimum value.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[P=\left(\frac72,\frac{\sqrt{14}}2\right)\]</div>
      `),
      guidedSteps: [
        guidedStep("Write the squared distance", raw`The distance formula contains a square root. Its square has the same minimising point and is simpler to differentiate.`, raw`
          <div class="math-block">
            \[d=\sqrt{(x-4)^2+(y-0)^2}\]
            \[D=d^2=(x-4)^2+y^2\]
          </div>
          <p class="step-text">Because \(d\ge0\), the squaring function is increasing: making \(D=d^2\) smallest also makes \(d\) smallest.</p>
        `),
        guidedStep("Use the curve equation", raw`Replace y squared so that the expression contains only one variable.`, raw`
          <p class="step-text">On \(y=\sqrt{x}\), we have \(y^2=x\). Therefore</p>
          <div class="math-block">
            \[D(x)=(x-4)^2+x.\]
          </div>
        `),
        guidedStep("Find the stationary x-coordinate", raw`Differentiate the squared-distance function and set its derivative equal to zero.`, raw`
          <div class="math-block">
            \[D'(x)=2(x-4)+1\]
            \[0=2x-8+1\]
            \[2x-7=0\]
            \[x=\frac72\]
          </div>
          <p class="step-text">This value lies in the curve's domain \(x\ge0\). The question states that a separate proof of minimality is not required.</p>
        `),
        guidedStep("Find the matching y-coordinate", raw`The point lies on the upper square-root curve, so use its positive y-value.`, raw`
          <div class="math-block">
            \[y=\sqrt{\frac72}=\frac{\sqrt{14}}{2}\]
          </div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{P=\left(\frac72,\frac{\sqrt{14}}2\right)}\]</div>`)}
        `)
      ]
    }),

    "2e": createConfig("2e", "Question Two - maximum rectangle area", {
      focus: raw`Use the circle equation to express the rectangle's height in terms of its half-width, then differentiate the resulting area function.`,
      questionHtml: raw`
        <p class="step-text">A rectangle is inscribed in a semicircle of radius \(r\), as shown below.</p>
        ${semicircleRectangleDiagramHtml()}
        <p class="step-text">Show that the maximum possible area of such a rectangle occurs when</p>
        <div class="question-math">\[x=\frac{r}{\sqrt2}.\]</div>
        <p class="step-text question-note">You do not need to prove that your solution gives the maximum area.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Shown", raw`
        <div class="math-block">\[x=\frac{r}{\sqrt2}\]</div>
      `),
      guidedSteps: [
        guidedStep("Relate the height and half-width", raw`One upper corner, the centre, and a radius form a right triangle.`, raw`
          <p class="step-text">Let \(x\) be half the rectangle's width and \(y\) its height. Then</p>
          <div class="math-block">
            \[x^2+y^2=r^2\]
            \[y^2=r^2-x^2\]
            \[y=\sqrt{r^2-x^2}.\]
          </div>
          <p class="step-text">Here \(0\le x\le r\), and the positive square root is used because \(y\) is a height.</p>
        `),
        guidedStep("Build the area function", raw`The full rectangle width is twice its half-width.`, raw`
          <div class="math-block">
            \[A=(2x)y\]
            \[A(x)=2x\sqrt{r^2-x^2}\]
            \[=2x(r^2-x^2)^{1/2}.\]
          </div>
        `),
        guidedStep("Differentiate the area", raw`Use the product rule and then the chain rule on the square-root factor.`, raw`
          <div class="math-block">
            \[\frac{dA}{dx}=2(r^2-x^2)^{1/2}
            +2x\left(\frac12\right)(r^2-x^2)^{-1/2}(-2x)\]
            \[\frac{dA}{dx}=2\sqrt{r^2-x^2}-\frac{2x^2}{\sqrt{r^2-x^2}}.\]
          </div>
        `),
        guidedStep("Solve the stationary equation", raw`Work in the interior of the domain, set the derivative to zero, and clear the square-root denominator carefully.`, raw`
          <p class="step-text">For an interior rectangle, \(0&lt;x&lt;r\), so \(\sqrt{r^2-x^2}>0\) and the displayed derivative is defined.</p>
          <div class="math-block">
            \[0=2\sqrt{r^2-x^2}-\frac{2x^2}{\sqrt{r^2-x^2}}\]
            \[0=2(r^2-x^2)-2x^2\]
            \[0=2r^2-4x^2\]
            \[2x^2=r^2\]
            \[x^2=\frac{r^2}{2}.\]
          </div>
          <p class="step-text">Since \(x\) is a non-negative length and \(r>0\), take the positive root. The question says that no separate proof of maximality is required.</p>
          ${answerHighlight("Shown", raw`<div class="math-block">\[\boxed{x=\frac{r}{\sqrt2}}\]</div>`)}
        `)
      ]
    }),

    "3a": createConfig("3a", "Question Three - product and chain rules", {
      focus: raw`Treat \(x\) and \(\ln(3x-1)\) as two factors. The logarithm also needs the chain rule.`,
      questionHtml: raw`
        <div class="question-math">\[\text{Differentiate }y=x\ln(3x-1).\]</div>
        <p class="step-text question-note">You do not need to simplify your answer.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[\frac{dy}{dx}=\ln(3x-1)+\frac{3x}{3x-1}\]</div>`),
      guidedSteps: [
        guidedStep("Identify the two rules", raw`The expression is a product, and the logarithm contains the inner function \(3x-1\).`, raw`
          <p class="step-text">Let \(u=x\) and \(v=\ln(3x-1)\). The product rule is</p>
          <div class="math-block">\[\frac{d}{dx}(uv)=u'v+uv'.\]</div>
          <p class="step-text">For real values, the original function is defined when \(3x-1>0\), so \(x>\tfrac13\).</p>
        `),
        guidedStep("Differentiate the logarithmic factor", raw`For \(\ln(g(x))\), divide by the inside and multiply by its derivative.`, raw`
          <div class="math-block">\[\frac{d}{dx}\ln(3x-1)=\frac{1}{3x-1}\cdot3=\frac{3}{3x-1}.\]</div>
        `),
        guidedStep("Apply the product rule", raw`Differentiate each factor once and keep the other factor beside it.`, raw`
          <div class="math-block">
            \[\frac{dy}{dx}=1\cdot\ln(3x-1)+x\left(\frac{3}{3x-1}\right)\]
            \[\frac{dy}{dx}=\ln(3x-1)+\frac{3x}{3x-1}.\]
          </div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\frac{dy}{dx}=\ln(3x-1)+\frac{3x}{3x-1}\]</div>`)}
        `)
      ]
    }),

    "3b": createConfig("3b", "Question Three - gradient from negative powers", {
      focus: raw`Rewrite the reciprocal terms with negative powers, differentiate term by term, and then substitute \(x=2\).`,
      questionHtml: raw`
        <p class="step-text">Find the gradient of the curve</p>
        <div class="question-math">\[y=\frac1x-\frac1{x^2}\]</div>
        <p class="step-text">at the point \(\left(2,\frac14\right)\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[\text{Gradient}=0\]</div>`),
      guidedSteps: [
        guidedStep("Rewrite using powers", raw`Negative powers make the power rule easy to apply.`, raw`
          <div class="math-block">\[y=x^{-1}-x^{-2}.\]</div>
        `),
        guidedStep("Differentiate term by term", raw`Use \(\frac{d}{dx}(x^n)=nx^{n-1}\), including each sign.`, raw`
          <div class="math-block">
            \[\frac{dy}{dx}=-x^{-2}+2x^{-3}\]
            \[=-\frac1{x^2}+\frac2{x^3}.\]
          </div>
        `),
        guidedStep("Evaluate at x equals two", raw`The gradient comes from the derivative, so substitute \(x=2\) there.`, raw`
          <div class="math-block">
            \[\left.\frac{dy}{dx}\right|_{x=2}=-\frac1{2^2}+\frac2{2^3}\]
            \[=-\frac14+\frac14=0.\]
          </div>
          <div class="callout-card tip">
            <p class="callout-title">Interpretation</p>
            <p class="step-text">The tangent is horizontal at \(\left(2,\tfrac14\right)\). A zero gradient does not mean the point itself is \((0,0)\).</p>
          </div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\text{Gradient}=0\]</div>`)}
        `)
      ]
    }),

    "3c": createConfig("3c", "Question Three - reading a piecewise graph", {
      focus: raw`Read filled and open points carefully. Then keep limits, continuity, differentiability, gradient, and concavity as separate ideas.`,
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(y=f(x)\).</p>
        ${piecewiseGraphHtml()}
        <p class="step-text">For the function above:</p>
        <p class="step-text">(i) Find the value(s) of \(x\) that meet each condition:</p>
        <div class="question-math">
          \[\text{(1) }f'(x)=0\]
          <p class="step-text">(2) \(f(x)\) is continuous but not differentiable</p>
          <p class="step-text">(3) \(f(x)\) is not continuous</p>
          \[\text{(4) }f''(x)&lt;0\]
        </div>
        <p class="step-text">(ii) What is the value of \(\displaystyle\lim_{x\to-1}f(x)\)? State clearly if the value does not exist.</p>
      `,
      answerHtml: answerHighlight("Final answers", raw`
        <div class="math-block">
          <p class="step-text"><strong>Zero gradient:</strong> \(-4&lt;x&lt;-2\) and \(x=2\).</p>
          <p class="step-text"><strong>Continuous but not differentiable:</strong> \(x=-2\) and \(x=1\).</p>
          <p class="step-text"><strong>Not continuous:</strong> \(x=-1\) and \(x=0\).</p>
          <p class="step-text"><strong>Concave down:</strong> \(x>1\).</p>
          \[\lim_{x\to-1}f(x)=2\]
        </div>
      `),
      guidedSteps: [
        guidedStep("Find where the gradient is zero", raw`Look for horizontal pieces or smooth turning points, but exclude corners and endpoints where the derivative does not exist.`, raw`
          <p class="step-text">On the interval shown, the left branch is horizontal for \(-4&lt;x&lt;-2\). At \(x=-2\) the graph has a corner, so there is no single gradient there.</p>
          <p class="step-text">The right-hand arch has a smooth maximum at \(x=2\), so its tangent is horizontal.</p>
          <div class="math-block">\[f'(x)=0\quad\text{for}\quad -4&lt;x&lt;-2\quad\text{and}\quad x=2.\]</div>
          <div class="callout-card mistake">
            <p class="callout-title">Common error</p>
            <p class="step-text">A corner may have a horizontal branch on one side, but it is not differentiable unless the gradients from both sides agree.</p>
          </div>
        `),
        guidedStep("Separate continuity from differentiability", raw`Continuity asks whether the pieces meet. Differentiability also requires them to meet smoothly.`, raw`
          <p class="step-text">At \(x=-2\), both pieces meet at \((-2,1)\), but their gradients differ. At \(x=1\), both curves meet at \((1,0)\), but the join is sharp.</p>
          <p class="step-text"><strong>Conclusion:</strong> \(f(x)\) is continuous but not differentiable at \(x=-2\) and \(x=1\).</p>
        `),
        guidedStep("Find the discontinuities", raw`Compare the function value and the nearby graph from both sides.`, raw`
          <p class="step-text">At \(x=-1\), the line approaches \(2\), but the filled point gives \(f(-1)=1\). At \(x=0\), the left branch ends at \(3\), while the right branch approaches \(2\).</p>
          <p class="step-text"><strong>Conclusion:</strong> \(f(x)\) is not continuous at \(x=-1\) and \(x=0\).</p>
        `),
        guidedStep("Read the concavity", raw`Concave up means the gradient increases as \(x\) increases; concave down means it decreases.`, raw`
          <p class="step-text">Concave up curves bend like a cup and have increasing gradients; concave down curves bend like an upside-down bowl and have decreasing gradients. The branch between \(0\) and \(1\) is concave up. After the corner at \(x=1\), the entire arch bends down.</p>
          <div class="math-block">\[f''(x)&lt;0\quad\text{for}\quad x>1.\]</div>
        `),
        guidedStep("Evaluate the limit at negative one", raw`A limit follows the nearby line; it does not use the isolated filled value.`, raw`
          <p class="step-text">From both the left and the right, points on the sloping line approach the open point \((-1,2)\).</p>
          <div class="math-block">
            \[\lim_{x\to-1^-}f(x)=2,\qquad \lim_{x\to-1^+}f(x)=2\]
            \[\therefore\ \lim_{x\to-1}f(x)=2,\quad\text{even though }f(-1)=1.\]
          </div>
          ${answerHighlight("Final answers", raw`
            <div class="math-block">
              <p class="step-text"><strong>Zero gradient:</strong> \(-4&lt;x&lt;-2\) and \(x=2\).</p>
              <p class="step-text"><strong>Continuous but not differentiable:</strong> \(x=-2\) and \(x=1\).</p>
              <p class="step-text"><strong>Not continuous:</strong> \(x=-1\) and \(x=0\).</p>
              <p class="step-text"><strong>Concave down:</strong> \(x>1\).</p>
              \[\lim_{x\to-1}f(x)=2\]
            </div>
          `)}
        `)
      ]
    }),

    "3d": createConfig("3d", "Question Three - related rates and angle of elevation", {
      focus: raw`Let the vertical height \(x\) and angle \(\theta\) depend on time. Connect them with tangent, then differentiate with respect to time.`,
      questionHtml: raw`
        <p class="step-text">A building has an external elevator. The elevator is rising at a constant rate of \(2\text{ m s}^{-1}\). Sarah is stationary, watching the elevator from a point \(30\text{ m}\) away from the base of the elevator shaft.</p>
        <p class="step-text">Let the angle of elevation of the elevator floor from Sarah's eye level be \(\theta\).</p>
        ${elevatorDiagramHtml()}
        <p class="step-text">Find the rate at which the angle of elevation is increasing when the elevator floor is \(20\text{ m}\) above Sarah's eye level.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[\frac{d\theta}{dt}=\frac3{65}\approx0.0462\text{ rad s}^{-1}\]</div>`),
      guidedSteps: [
        guidedStep("Define the changing quantities", raw`The height and viewing angle change with time; the horizontal distance stays fixed.`, raw`
          <p class="step-text">Let \(x=x(t)\) be the elevator floor's height above Sarah's eye level and let \(\theta=\theta(t)\).</p>
          <div class="math-block">\[\frac{dx}{dt}=2\text{ m s}^{-1},\qquad 30\text{ m is constant}.\]</div>
          <p class="step-text">The requested rate is \(d\theta/dt\), not the elevator's vertical speed \(dx/dt\).</p>
        `),
        guidedStep("Write the trigonometric relationship", raw`In the right triangle, height \(x\) is opposite \(\theta\) and \(30\) is adjacent.`, raw`
          <div class="math-block">\[\tan\theta=\frac{x}{30}.\]</div>
        `),
        guidedStep("Differentiate with respect to time", raw`Both \(x\) and \(\theta\) are functions of time, so implicit differentiation produces their time derivatives.`, raw`
          <div class="math-block">
            \[\sec^2\theta\,\frac{d\theta}{dt}=\frac1{30}\frac{dx}{dt}\]
            \[\frac{d\theta}{dt}=\frac{1}{30\sec^2\theta}\frac{dx}{dt}.\]
          </div>
        `),
        guidedStep("Evaluate when the height is twenty metres", raw`Use \(\sec^2\theta=1+\tan^2\theta\), so there is no need to round \(\theta\) first.`, raw`
          <div class="math-block">
            \[\tan\theta=\frac{20}{30}=\frac23\quad\Longrightarrow\quad \sec^2\theta=1+\left(\frac23\right)^2=\frac{13}{9}\]
            \[\frac{d\theta}{dt}=\frac{1}{30}\,(2)\div\frac{13}{9}=\frac1{15}\cdot\frac9{13}=\frac3{65}\]
            \[\frac3{65}\approx0.0462.\]
          </div>
          <p class="step-text">Angular rates are measured in radians per second because calculus derivatives of trigonometric functions use radians.</p>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\frac{d\theta}{dt}=\frac3{65}\approx0.0462\text{ rad s}^{-1}\]</div>`)}
        `)
      ]
    }),

    "3e": createConfig("3e", "Question Three - higher derivatives and a differential equation", {
      focus: raw`Use the product rule twice. Then substitute \(y\), \(y'\), and \(y''\) into the differential equation and collect like trigonometric terms.`,
      questionHtml: raw`
        <p class="step-text">For the function</p>
        <div class="question-math">\[y=e^x\cos(kx):\]</div>
        <p class="step-text">(i) Find \(\dfrac{dy}{dx}\) and \(\dfrac{d^2y}{dx^2}\).</p>
        <p class="step-text">(ii) Find all the value(s) of \(k\) such that the function satisfies</p>
        <div class="question-math">\[\frac{d^2y}{dx^2}-2\frac{dy}{dx}+2y=0\]</div>
        <p class="step-text">for all values of \(x\).</p>
      `,
      answerHtml: answerHighlight("Final answers", raw`
        <div class="math-block">
          \[\frac{dy}{dx}=e^x\bigl(\cos(kx)-k\sin(kx)\bigr)\]
          \[\begin{aligned}
          \frac{d^2y}{dx^2}
          &=e^x\bigl(\cos(kx)-2k\sin(kx)\\
          &\qquad-k^2\cos(kx)\bigr)
          \end{aligned}\]
          \[k=\pm1\]
        </div>
      `),
      guidedSteps: [
        guidedStep("Find the first derivative", raw`Apply the product rule and use \(\frac{d}{dx}\cos(kx)=-k\sin(kx)\).`, raw`
          <div class="math-block">
            \[\frac{dy}{dx}=e^x\cos(kx)+e^x\bigl(-k\sin(kx)\bigr)\]
            \[\frac{dy}{dx}=e^x\bigl(\cos(kx)-k\sin(kx)\bigr).\]
          </div>
        `),
        guidedStep("Differentiate a second time", raw`Use the product rule again, including the chain-rule factor \(k\) in both trigonometric derivatives.`, raw`
          <div class="math-block">
            \[\begin{aligned}
            \frac{d}{dx}\bigl(\cos(kx)-k\sin(kx)\bigr)
            &=-k\sin(kx)\\
            &\quad-k^2\cos(kx).
            \end{aligned}\]
            \[\begin{aligned}
            \frac{d^2y}{dx^2}
            &=e^x\bigl(\cos(kx)-k\sin(kx)\bigr)\\
            &\quad+e^x\bigl(-k\sin(kx)-k^2\cos(kx)\bigr).
            \end{aligned}\]
            \[\begin{aligned}
            \frac{d^2y}{dx^2}
            &=e^x\bigl(\cos(kx)-2k\sin(kx)\\
            &\qquad-k^2\cos(kx)\bigr).
            \end{aligned}\]
          </div>
        `),
        guidedStep("Substitute into the differential equation", raw`Write all three terms with the common factor \(e^x\), then combine sine terms and cosine terms.`, raw`
          <div class="math-block">
            \[\begin{aligned}
            y''-2y'+2y
            &=e^x\bigl(\cos(kx)-2k\sin(kx)-k^2\cos(kx)\bigr)\\
            &\quad-2e^x\bigl(\cos(kx)-k\sin(kx)\bigr)\\
            &\quad+2e^x\cos(kx)\\
            &=e^x\cos(kx)(1-k^2).
            \end{aligned}\]
          </div>
          <p class="step-text">The \(-2k\sin(kx)\) and \(+2k\sin(kx)\) terms cancel. The cosine coefficients combine to \(1-k^2\).</p>
        `),
        guidedStep("Make the identity hold for every x", raw`A differential equation stated for every \(x\) cannot rely on a factor that is zero only at isolated points.`, raw`
          <div class="math-block">\[e^x\cos(kx)(1-k^2)=0\quad\text{for every }x.\]</div>
          <p class="step-text">The factor \(e^x\) is never zero. Also \(\cos(kx)\) is not identically zero; at \(x=0\), it equals \(1\). Therefore the constant factor must vanish:</p>
          <div class="math-block">
            \[1-k^2=0\]
            \[k^2=1\]
            \[k=\pm1.\]
          </div>
          ${answerHighlight("Final answers", raw`
            <div class="math-block">
              \[\frac{dy}{dx}=e^x\bigl(\cos(kx)-k\sin(kx)\bigr)\]
              \[\begin{aligned}
              \frac{d^2y}{dx^2}
              &=e^x\bigl(\cos(kx)-2k\sin(kx)\\
              &\qquad-k^2\cos(kx)\bigr)
              \end{aligned}\]
              \[k=\pm1\]
            </div>
          `)}
        `)
      ]
    })
  };
}());
