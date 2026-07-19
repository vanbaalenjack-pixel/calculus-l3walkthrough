(function () {
  const raw = String.raw;
  const paperHref = "level-3-differentiation-2016.html";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const metadata = {
    topic: "Differentiation",
    year: 2016,
    standard: "NCEA Level 3 Calculus",
    assessment: "AS91578",
    difficulty: "mixed / Excellence-style"
  };
  const tags = [
    "Differentiation",
    "2016",
    "AS91578",
    "NCEA Level 3 Calculus",
    "mixed / Excellence-style"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return id + "2016.html";
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
      browserTitle: "2016 Differentiation Paper - " + questionLabel(id),
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

  function circleMarkup(scale, x, y, radius, className, extra) {
    return `<circle class="${className}" cx="${scale.x(x)}" cy="${scale.y(y)}" r="${radius}"${extra || ""}></circle>`;
  }

  function textMarkup(scale, x, y, text, className, extra) {
    return `<text class="${className}" x="${scale.x(x)}" y="${scale.y(y)}"${extra || ""}>${text}</text>`;
  }

  function curvePath(scale, start, end, increment, valueAt) {
    const points = [];

    for (let value = start; value <= end + increment / 2; value += increment) {
      points.push((points.length ? "L " : "M ") + scale.x(value) + " " + scale.y(valueAt(value)));
    }

    return points.join(" ");
  }

  function perpendicularTangentsDiagramHtml() {
    const width = 680;
    const height = 430;
    const padding = 52;
    const scale = createScale(width, height, padding, -1, 8.2, -2, 6.5);
    const parabola = curvePath(scale, -0.3, 7.1, 0.04, function (x) {
      return 0.25 * Math.pow(x - 2, 2);
    });
    const intersection = [3.5, -1];
    const side = 0.32;
    const rootFive = Math.sqrt(5);
    const pVector = [2 / rootFive, -1 / rootFive];
    const qVector = [1 / rootFive, 2 / rootFive];
    const cornerOne = [
      intersection[0] + side * pVector[0],
      intersection[1] + side * pVector[1]
    ];
    const cornerTwo = [
      cornerOne[0] + side * qVector[0],
      cornerOne[1] + side * qVector[1]
    ];
    const cornerThree = [
      intersection[0] + side * qVector[0],
      intersection[1] + side * qVector[1]
    ];

    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the parabola and perpendicular tangents">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="diff-2016-1d-title diff-2016-1d-desc">
          <title id="diff-2016-1d-title">Parabola with perpendicular tangents at P and Q</title>
          <desc id="diff-2016-1d-desc">The parabola y equals one quarter times x minus two squared has vertex at two comma zero. Q is at six comma four. Tangents at Q and at the point P on the left branch meet at a right angle.</desc>
          <defs>
            <marker id="diff-2016-1d-axis-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${lineMarkup(scale, -0.9, 0, 8.05, 0, "graph-axis", ' marker-start="url(#diff-2016-1d-axis-arrow)" marker-end="url(#diff-2016-1d-axis-arrow)"')}
          ${lineMarkup(scale, 0, -1.9, 0, 6.35, "graph-axis", ' marker-start="url(#diff-2016-1d-axis-arrow)" marker-end="url(#diff-2016-1d-axis-arrow)"')}
          <path class="question-curve" d="${parabola}"></path>
          ${lineMarkup(scale, -0.6, 1.05, 7.6, -3.05, "question-normal")}
          ${lineMarkup(scale, 2.55, -2.9, 7.25, 6.5, "question-normal")}
          <polyline points="${scale.x(cornerOne[0])},${scale.y(cornerOne[1])} ${scale.x(cornerTwo[0])},${scale.y(cornerTwo[1])} ${scale.x(cornerThree[0])},${scale.y(cornerThree[1])}" fill="none" stroke="#111827" stroke-width="2" stroke-dasharray="none"></polyline>
          ${circleMarkup(scale, 1, 0.25, 5, "question-dot")}
          ${circleMarkup(scale, 6, 4, 5, "question-dot")}
          ${textMarkup(scale, 0.72, 0.78, "P", "graph-equation-label")}
          ${textMarkup(scale, 6.18, 4.2, "Q (6, 4)", "graph-equation-label")}
          ${textMarkup(scale, 7.8, -0.38, "x", "question-axis-label")}
          ${textMarkup(scale, 0.18, 6.1, "y", "question-axis-label")}
        </svg>
      </div>
    `;
  }

  function piecewiseGraphDiagramHtml() {
    const width = 760;
    const height = 500;
    const padding = 54;
    const scale = createScale(width, height, padding, -6.6, 6.8, -5.8, 6.4);
    const leftCurve = curvePath(scale, -6.25, -2, 0.04, function (x) {
      return Math.pow(x + 4, 2);
    });
    const rightCurve = curvePath(scale, 1, 4, 0.03, function (x) {
      return -2 * Math.pow(x - 3, 2) + 5;
    });
    const gridX = [];
    const gridY = [];

    for (let x = -6; x <= 6; x += 1) {
      if (x !== 0) {
        gridX.push(lineMarkup(scale, x, -5.4, x, 6, "graph-grid-line"));
      }
    }
    for (let y = -5; y <= 6; y += 1) {
      if (y !== 0) {
        gridY.push(lineMarkup(scale, -6.35, y, 6.45, y, "graph-grid-line"));
      }
    }

    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the piecewise function graph">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="diff-2016-2c-title diff-2016-2c-desc">
          <title id="diff-2016-2c-title">Graph of the piecewise function y equals f of x</title>
          <desc id="diff-2016-2c-desc">A curved left branch has a smooth minimum at negative four and a corner at negative two. A descending line has an open point at negative one comma one while a filled point is at negative one comma five, and it ends open at one comma negative five. A filled point at one comma negative three starts a concave-down curve with a maximum at three comma five; the curve meets a horizontal ray at x equals four.</desc>
          <defs>
            <marker id="diff-2016-2c-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${gridX.join("")}
          ${gridY.join("")}
          ${lineMarkup(scale, -6.45, 0, 6.65, 0, "graph-axis", ' marker-start="url(#diff-2016-2c-arrow)" marker-end="url(#diff-2016-2c-arrow)"')}
          ${lineMarkup(scale, 0, -5.55, 0, 6.2, "graph-axis", ' marker-start="url(#diff-2016-2c-arrow)" marker-end="url(#diff-2016-2c-arrow)"')}
          <path class="question-curve" d="${leftCurve}" marker-start="url(#diff-2016-2c-arrow)"></path>
          ${lineMarkup(scale, -2, 4, 1, -5, "question-curve")}
          <path class="question-curve" d="${rightCurve}"></path>
          ${lineMarkup(scale, 4, 3, 6.45, 3, "question-curve", ' marker-end="url(#diff-2016-2c-arrow)"')}
          ${circleMarkup(scale, -1, 1, 7, "question-origin", ' fill="#ffffff" stroke="#111827" stroke-width="3"')}
          ${circleMarkup(scale, -1, 5, 6, "question-dot")}
          ${circleMarkup(scale, 1, -5, 7, "question-origin", ' fill="#ffffff" stroke="#111827" stroke-width="3"')}
          ${circleMarkup(scale, 1, -3, 6, "question-dot")}
          ${[-6, -4, -2, 2, 4, 6].map(function (x) {
            return textMarkup(scale, x, -0.55, String(x), "graph-label", ' text-anchor="middle"');
          }).join("")}
          ${textMarkup(scale, -0.25, 5.08, "5", "graph-label", ' text-anchor="end"')}
          ${textMarkup(scale, -0.25, -5.15, "-5", "graph-label", ' text-anchor="end"')}
          ${textMarkup(scale, 6.5, -0.35, "x", "question-axis-label")}
          ${textMarkup(scale, 0.18, 6.02, "y", "question-axis-label")}
        </svg>
      </div>
    `;
  }

  function coneInSphereDiagramHtml() {
    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the cone inscribed in a sphere">
        <svg class="graph-svg" viewBox="0 0 680 470" role="img" aria-labelledby="diff-2016-2e-title diff-2016-2e-desc">
          <title id="diff-2016-2e-title">Cone inscribed in a sphere of radius six centimetres</title>
          <desc id="diff-2016-2e-desc">A sphere is shown in cross-section as a circle centred at the origin with radius six. A cone has its apex at the top of the sphere and a horizontal circular base s centimetres below the x-axis. The cone has height h and base radius r.</desc>
          <defs>
            <marker id="diff-2016-2e-axis-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
            <marker id="diff-2016-2e-measure-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#374151"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="680" height="470"></rect>
          <circle cx="340" cy="235" r="170" fill="#e5e7eb" fill-opacity="0.72" stroke="#111827" stroke-width="3"></circle>
          <path d="M 340 65 L 188 302 L 492 302 Z" fill="#6b7280" fill-opacity="0.3" stroke="#111827" stroke-width="3"></path>
          <ellipse cx="340" cy="302" rx="152" ry="18" fill="#ffffff" fill-opacity="0.48" stroke="#111827" stroke-width="3"></ellipse>
          <line class="graph-axis" x1="120" y1="235" x2="560" y2="235" marker-start="url(#diff-2016-2e-axis-arrow)" marker-end="url(#diff-2016-2e-axis-arrow)"></line>
          <line class="graph-axis" x1="340" y1="420" x2="340" y2="45" marker-start="url(#diff-2016-2e-axis-arrow)" marker-end="url(#diff-2016-2e-axis-arrow)"></line>
          <line class="graph-measure" x1="390" y1="239" x2="390" y2="298" marker-start="url(#diff-2016-2e-measure-arrow)" marker-end="url(#diff-2016-2e-measure-arrow)"></line>
          <line class="graph-guide" x1="340" y1="302" x2="492" y2="302" stroke-dasharray="7 6"></line>
          <text class="graph-equation-label" x="405" y="272">s</text>
          <text class="graph-equation-label" x="414" y="291">r</text>
          <text class="graph-equation-label" x="307" y="191">h</text>
          <text class="graph-label" x="363" y="80">6</text>
          <text class="graph-label" x="500" y="226">6</text>
          <text class="graph-label" x="158" y="226">-6</text>
          <text class="graph-label" x="352" y="407">-6</text>
          <text class="question-axis-label" x="548" y="224">x</text>
          <text class="question-axis-label" x="353" y="54">y</text>
        </svg>
      </div>
    `;
  }

  function rectangleParabolaDiagramHtml() {
    const width = 680;
    const height = 450;
    const padding = 52;
    const scale = createScale(width, height, padding, -1.5, 12.8, -2, 39);
    const parabola = curvePath(scale, -0.7, 12.2, 0.05, function (x) {
      return Math.pow(x - 6, 2);
    });
    const rectangleX = 2.4;
    const rectangleY = Math.pow(rectangleX - 6, 2);

    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the rectangle beneath the parabola">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="diff-2016-3c-title diff-2016-3c-desc">
          <title id="diff-2016-3c-title">Rectangle with opposite vertex on y equals x minus six squared</title>
          <desc id="diff-2016-3c-desc">An axes-aligned rectangle has lower-left vertex at the origin. Its upper-right vertex lies on the left branch of the upward-opening parabola y equals x minus six squared, whose vertex is at six comma zero.</desc>
          <defs>
            <marker id="diff-2016-3c-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${lineMarkup(scale, -1.3, 0, 12.6, 0, "graph-axis", ' marker-start="url(#diff-2016-3c-arrow)" marker-end="url(#diff-2016-3c-arrow)"')}
          ${lineMarkup(scale, 0, -1.7, 0, 38.4, "graph-axis", ' marker-start="url(#diff-2016-3c-arrow)" marker-end="url(#diff-2016-3c-arrow)"')}
          <path class="question-curve" d="${parabola}"></path>
          <rect x="${scale.x(0)}" y="${scale.y(rectangleY)}" width="${scale.x(rectangleX) - scale.x(0)}" height="${scale.y(0) - scale.y(rectangleY)}" fill="#9ca3af" fill-opacity="0.42" stroke="#111827" stroke-width="3"></rect>
          ${circleMarkup(scale, rectangleX, rectangleY, 4.5, "question-dot")}
          ${textMarkup(scale, 6, -1.05, "6", "graph-label", ' text-anchor="middle"')}
          ${textMarkup(scale, 12, -1.05, "12", "graph-label", ' text-anchor="middle"')}
          ${textMarkup(scale, rectangleX + 0.18, rectangleY + 2.1, "(x, (x - 6)²)", "graph-equation-label")}
          ${textMarkup(scale, 12.35, -0.7, "x", "question-axis-label")}
          ${textMarkup(scale, 0.22, 37.7, "y", "question-axis-label")}
        </svg>
      </div>
    `;
  }

  function rugbyConversionDiagramHtml() {
    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the rugby conversion geometry">
        <svg class="graph-svg" viewBox="0 0 720 450" role="img" aria-labelledby="diff-2016-3e-title diff-2016-3e-desc">
          <title id="diff-2016-3e-title">Rugby conversion angle geometry</title>
          <desc id="diff-2016-3e-desc">The ball is on a line perpendicular to the goal-line through the point where the try was scored. That point is fifteen metres from the nearer goal-post, and the posts are five point four metres apart. The ball is d metres from the goal-line, and the two sight lines from the ball to the posts form angle theta.</desc>
          <defs>
            <marker id="diff-2016-3e-measure-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#374151"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="720" height="450"></rect>
          <line class="graph-axis" x1="55" y1="105" x2="665" y2="105"></line>
          <text class="graph-equation-label" x="60" y="88">goal-line</text>
          <line class="graph-guide" x1="175" y1="105" x2="175" y2="376" stroke-dasharray="8 7"></line>
          <path class="graph-guide" d="M 175 105 L 175 128 L 198 128 L 198 105" fill="none" stroke="#111827" stroke-width="2.5"></path>
          <line class="question-normal" x1="175" y1="370" x2="425" y2="105"></line>
          <line class="question-normal" x1="175" y1="370" x2="515" y2="105"></line>
          <line class="graph-measure" x1="175" y1="74" x2="425" y2="74" marker-start="url(#diff-2016-3e-measure-arrow)" marker-end="url(#diff-2016-3e-measure-arrow)"></line>
          <line class="graph-measure" x1="425" y1="74" x2="515" y2="74" marker-start="url(#diff-2016-3e-measure-arrow)" marker-end="url(#diff-2016-3e-measure-arrow)"></line>
          <line class="graph-measure" x1="145" y1="105" x2="145" y2="370" marker-start="url(#diff-2016-3e-measure-arrow)" marker-end="url(#diff-2016-3e-measure-arrow)"></line>
          <line x1="425" y1="105" x2="425" y2="28" stroke="#6b7280" stroke-width="7"></line>
          <line x1="515" y1="105" x2="515" y2="28" stroke="#6b7280" stroke-width="7"></line>
          <line x1="425" y1="43" x2="515" y2="43" stroke="#6b7280" stroke-width="7"></line>
          <circle cx="175" cy="370" r="12" fill="#6b7280"></circle>
          <path d="M 175 319 A 51 51 0 0 1 210 333" fill="none" stroke="#111827" stroke-width="2.5"></path>
          <path d="M 224 318 A 68 68 0 0 1 229 329" fill="none" stroke="#111827" stroke-width="2.5"></path>
          <text class="graph-equation-label" x="189" y="318">α</text>
          <text class="graph-equation-label" x="231" y="323">θ</text>
          <text class="graph-equation-label" x="125" y="247">d</text>
          <text class="graph-label" x="300" y="62" text-anchor="middle">15 m</text>
          <text class="graph-label" x="470" y="62" text-anchor="middle">5.4 m</text>
          <text class="graph-label" x="175" y="408" text-anchor="middle">ball</text>
        </svg>
      </div>
    `;
  }

  window.Differentiation2016Walkthroughs = {
    "1a": createConfig("1a", "Question One - differentiating reciprocal powers", {
      focus: raw`Rewrite each reciprocal as a negative power, then apply the power rule term by term.`,
      tags: tags.concat(["power rule", "negative powers", "reciprocal differentiation", "Question 1(a)"]),
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Differentiate }y=1+x-\frac1x+\frac1{x^2}.
          \]
        </div>
      `,
      hints: [
        raw`Write \(1/x\) as \(x^{-1}\) and \(1/x^2\) as \(x^{-2}\).`,
        raw`Use \(\frac{d}{dx}(x^n)=nx^{n-1}\), keeping track of both minus signs.`
      ],
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[\frac{dy}{dx}=1+\frac1{x^2}-\frac2{x^3}\]</div>
      `),
      guidedSteps: [
        guidedStep("Rewrite the reciprocal terms", raw`Negative powers make the power rule visible.`, raw`
          <div class="math-block">
            \[y=1+x-x^{-1}+x^{-2}.\]
          </div>
          <p class="step-text">The function is defined for \(x\ne0\), so its derivative will have the same restriction.</p>
        `),
        guidedStep("Differentiate term by term", raw`Differentiate the constant, the linear term, and each negative power separately.`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}=0+1-(-1)x^{-2}+(-2)x^{-3}
            \]
            \[=1+x^{-2}-2x^{-3}.\]
          </div>
          <p class="step-text">The derivative of \(-x^{-1}\) is positive because the existing minus sign and the power-rule factor \(-1\) cancel.</p>
        `),
        guidedStep("Return to reciprocal notation", raw`Rewrite the negative powers in the same style as the original question.`, raw`
          <div class="math-block">
            \[x^{-2}=\frac1{x^2},\qquad 2x^{-3}=\frac2{x^3}.\]
          </div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{\frac{dy}{dx}=1+\frac1{x^2}-\frac2{x^3}}\]</div>`)}
        `)
      ]
    }),

    "1b": createConfig("1b", "Question One - rate of change of tide height", {
      focus: raw`Differentiate the sinusoidal tide model with the chain rule, then use \(t=9\) for 9.00 a.m.`,
      tags: tags.concat(["chain rule", "trigonometric differentiation", "rate of change", "tide model", "Question 1(b)"]),
      questionHtml: raw`
        <p class="step-text">The height of the tide at a particular beach today is given by the function</p>
        <div class="question-math">
          \[h(t)=0.8\sin\left(\frac{4\pi}{25}t+\frac{\pi}{2}\right),\]
        </div>
        <p class="step-text">where \(h\) is the height of water, in metres, relative to the mean sea level and \(t\) is the time in hours after midnight.</p>
        <p class="step-text">At what rate was the height of the tide changing at that beach at 9.00 a.m. today?</p>
      `,
      hints: [
        raw`At 9.00 a.m., the model's time variable is \(t=9\).`,
        raw`For \(\sin(g(t))\), the chain rule gives \(\cos(g(t))g'(t)\).`,
        raw`Keep the calculator in radians because the model uses \(\pi\).`
      ],
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[\left.\frac{dh}{dt}\right|_{t=9}\approx0.395\text{ m/h}\]</div>
        <p class="step-text">The positive sign means the tide height was rising.</p>
      `),
      guidedSteps: [
        guidedStep("Identify the inner angle", raw`The sine input is a linear function of time.`, raw`
          <div class="math-block">
            \[u(t)=\frac{4\pi}{25}t+\frac{\pi}{2},\qquad \frac{du}{dt}=\frac{4\pi}{25}.\]
          </div>
          <p class="step-text">The amplitude \(0.8\) stays as a constant multiplier.</p>
        `),
        guidedStep("Differentiate the tide model", raw`Differentiate sine to cosine and multiply by the derivative of its input.`, raw`
          <div class="math-block">
            \[
            \frac{dh}{dt}=0.8\cos\left(\frac{4\pi}{25}t+\frac{\pi}{2}\right)\frac{4\pi}{25}
            \]
            \[=\frac{16\pi}{125}\cos\left(\frac{4\pi}{25}t+\frac{\pi}{2}\right).\]
          </div>
          <p class="step-text">Because height is in metres and time is in hours, this derivative is measured in metres per hour.</p>
        `),
        guidedStep("Evaluate at 9.00 a.m.", raw`Substitute \(t=9\) and round only at the end.`, raw`
          <div class="math-block">
            \[
            \left.\frac{dh}{dt}\right|_{t=9}
            =\frac{16\pi}{125}\cos\left(\frac{36\pi}{25}+\frac{\pi}{2}\right)
            \]
            \[=\frac{16\pi}{125}\cos\left(\frac{97\pi}{50}\right)\approx0.395.\]
          </div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">\[\boxed{\left.\frac{dh}{dt}\right|_{t=9}\approx0.395\text{ m/h}}\]</div>
            <p class="step-text">The tide height was increasing at approximately \(0.395\) metres per hour.</p>
          `)}
        `)
      ]
    }),

    "1c": createConfig("1c", "Question One - parametric gradient", {
      focus: raw`Differentiate both coordinates with respect to \(t\), then divide \(dy/dt\) by \(dx/dt\).`,
      tags: tags.concat(["parametric differentiation", "chain rule", "tangent gradient", "Question 1(c)"]),
      questionHtml: raw`
        <p class="step-text">A curve is defined by the parametric equations</p>
        <div class="question-math">\[x=2\cos(2t)\quad\text{and}\quad y=\tan^2t.\]</div>
        <p class="step-text">Find the gradient of the tangent to the curve at the point where \(t=\dfrac{\pi}{4}\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Find \(dx/dt\) and \(dy/dt\) separately.`,
        raw`Remember that \(\tan^2t\) means \((\tan t)^2\).`,
        raw`For a parametric curve, \(\frac{dy}{dx}=\frac{dy/dt}{dx/dt}\) when \(dx/dt\ne0\).`
      ],
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[\left.\frac{dy}{dx}\right|_{t=\pi/4}=-1\]</div>
      `),
      guidedSteps: [
        guidedStep("Differentiate x with respect to t", raw`The input \(2t\) contributes a chain-rule factor of two.`, raw`
          <div class="math-block">
            \[x=2\cos(2t)\]
            \[\frac{dx}{dt}=2\bigl(-\sin(2t)\bigr)(2)=-4\sin(2t).\]
          </div>
        `),
        guidedStep("Differentiate y with respect to t", raw`Differentiate the outside square, then the tangent inside it.`, raw`
          <div class="math-block">
            \[y=(\tan t)^2\]
            \[\frac{dy}{dt}=2\tan t\,\sec^2t=\frac{2\tan t}{\cos^2t}.\]
          </div>
        `),
        guidedStep("Form the parametric gradient", raw`The ratio of the two time rates gives the gradient with respect to x.`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}=\frac{dy/dt}{dx/dt}
            =\frac{2\tan t\,\sec^2t}{-4\sin(2t)}.
            \]
          </div>
        `),
        guidedStep("Evaluate at t equals pi over four", raw`Use exact trigonometric values to avoid unnecessary rounding.`, raw`
          <div class="math-block">
            \[\tan\frac{\pi}{4}=1,\qquad \sec^2\frac{\pi}{4}=2,\qquad \sin\frac{\pi}{2}=1\]
            \[
            \left.\frac{dy}{dx}\right|_{t=\pi/4}
            =\frac{2(1)(2)}{-4(1)}=-1.
            \]
          </div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{\text{Gradient}=-1}\]</div>`)}
        `)
      ]
    }),

    "1d": createConfig("1d", "Question One - perpendicular tangents to a parabola", {
      focus: raw`Find the gradient at Q, take its negative reciprocal, then use the derivative again to locate P.`,
      tags: tags.concat(["perpendicular tangents", "parabola", "gradient", "Question 1(d)"]),
      questionHtml: raw`
        <p class="step-text">The tangents to the curve</p>
        <div class="question-math">\[y=\frac14(x-2)^2\]</div>
        <p class="step-text">at points P and Q are perpendicular.</p>
        <p class="step-text">Q is the point \((6,4)\).</p>
        ${perpendicularTangentsDiagramHtml()}
        <p class="step-text">What is the \(x\)-coordinate of point P?</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Differentiate the parabola and evaluate its gradient at \(x=6\).`,
        raw`Perpendicular non-vertical gradients multiply to \(-1\).`,
        raw`Set the derivative at P equal to the required perpendicular gradient.`
      ],
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[x_P=1\]</div>
      `),
      guidedSteps: [
        guidedStep("Differentiate the parabola", raw`The derivative gives the tangent gradient at any point on the curve.`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}=\frac14\cdot2(x-2)=\frac{x-2}{2}.
            \]
          </div>
        `),
        guidedStep("Find the tangent gradient at Q", raw`Use Q's x-coordinate in the derivative.`, raw`
          <div class="math-block">
            \[m_Q=\left.\frac{dy}{dx}\right|_{x=6}=\frac{6-2}{2}=2.\]
          </div>
        `),
        guidedStep("Use the perpendicular-gradient condition", raw`The tangent at P must have the negative reciprocal of the tangent gradient at Q.`, raw`
          <div class="math-block">
            \[m_Pm_Q=-1\]
            \[m_P(2)=-1\]
            \[m_P=-\frac12.\]
          </div>
        `),
        guidedStep("Locate P using the derivative", raw`At P, the derivative must equal \(-1/2\).`, raw`
          <div class="math-block">
            \[-\frac12=\frac{x_P-2}{2}\]
            \[-1=x_P-2\]
            \[x_P=1.\]
          </div>
          <p class="step-text">As a check, P is \(\left(1,\tfrac14\right)\), and its tangent gradient \(-\tfrac12\) is perpendicular to the gradient \(2\) at Q.</p>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{x_P=1}\]</div>`)}
        `)
      ]
    }),

    "1e": createConfig("1e", "Question One - second derivative of a translated Gaussian", {
      focus: raw`Differentiate twice with the chain and product rules, then use the fact that the exponential factor is never zero.`,
      tags: tags.concat(["second derivative", "chain rule", "product rule", "exponential", "Question 1(e)"]),
      questionHtml: raw`
        <p class="step-text">A curve is defined by the function</p>
        <div class="question-math">\[f(x)=e^{-(x-k)^2}.\]</div>
        <p class="step-text">Find, in terms of \(k\), the \(x\)-coordinate(s) for which \(f''(x)=0\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`For the first derivative, differentiate the exponent \(-(x-k)^2\).`,
        raw`The first derivative is a product, so finding \(f''(x)\) needs the product rule.`,
        raw`The factor \(e^{-(x-k)^2}\) is positive for every real \(x\).`
      ],
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[x=k\pm\frac{\sqrt2}{2}\]</div>
      `),
      guidedSteps: [
        guidedStep("Find the first derivative", raw`Apply the chain rule to the exponential.`, raw`
          <div class="math-block">
            \[
            \frac{d}{dx}\bigl(-(x-k)^2\bigr)=-2(x-k)
            \]
            \[
            f'(x)=-2(x-k)e^{-(x-k)^2}=(2k-2x)e^{-(x-k)^2}.
            \]
          </div>
        `),
        guidedStep("Differentiate a second time", raw`Use the product rule on \((2k-2x)e^{-(x-k)^2}\).`, raw`
          <div class="math-block">
            \[
            f''(x)=-2e^{-(x-k)^2}+(2k-2x)^2e^{-(x-k)^2}
            \]
            \[
            =e^{-(x-k)^2}\left((2k-2x)^2-2\right).
            \]
          </div>
          <p class="step-text">The square appears because differentiating the exponential contributes another factor \(2k-2x\).</p>
        `),
        guidedStep("Set the second derivative to zero", raw`The exponential factor cannot make the product zero.`, raw`
          <div class="math-block">
            \[e^{-(x-k)^2}>0\quad\text{for every real }x\]
            \[f''(x)=0\quad\Longrightarrow\quad(2k-2x)^2-2=0.\]
          </div>
        `),
        guidedStep("Solve for x", raw`Take both square-root possibilities, then isolate x.`, raw`
          <div class="math-block">
            \[(2k-2x)^2=2\]
            \[2k-2x=\pm\sqrt2\]
            \[x=k\mp\frac{\sqrt2}{2}.\]
          </div>
          <p class="step-text">Because the plus-minus symbol includes both choices, this can be written in the usual order as follows.</p>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{x=k\pm\frac{\sqrt2}{2}}\]</div>`)}
        `)
      ]
    }),

    "2a": createConfig("2a", "Question Two - product and logarithm rules", {
      focus: raw`Use the product rule, with the chain rule inside the logarithmic factor.`,
      tags: tags.concat(["product rule", "logarithmic differentiation", "chain rule", "Question 2(a)"]),
      questionHtml: raw`
        <div class="question-math">\[\text{Differentiate }f(x)=x\ln(3x-1).\]</div>
      `,
      hints: [
        raw`Treat \(x\) and \(\ln(3x-1)\) as the two factors.`,
        raw`Use \(\frac{d}{dx}\ln(g(x))=\frac{g'(x)}{g(x)}\).`
      ],
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[f'(x)=\ln(3x-1)+\frac{3x}{3x-1}\]</div>
      `),
      guidedSteps: [
        guidedStep("Identify the product", raw`Name the factors so each part of the product rule is clear.`, raw`
          <div class="math-block">
            \[u=x,\qquad v=\ln(3x-1)\]
            \[\frac{d}{dx}(uv)=u'v+uv'.\]
          </div>
          <p class="step-text">For real values, \(3x-1>0\), so the original function has domain \(x>\tfrac13\).</p>
        `),
        guidedStep("Differentiate both factors", raw`The logarithm contains an inner linear function.`, raw`
          <div class="math-block">
            \[u'=1\]
            \[v'=\frac{3}{3x-1}.\]
          </div>
        `),
        guidedStep("Apply the product rule", raw`Differentiate one factor at a time and add the two terms.`, raw`
          <div class="math-block">
            \[
            f'(x)=1\cdot\ln(3x-1)+x\left(\frac{3}{3x-1}\right)
            \]
            \[f'(x)=\ln(3x-1)+\frac{3x}{3x-1}.\]
          </div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{f'(x)=\ln(3x-1)+\frac{3x}{3x-1}}\]</div>`)}
        `)
      ]
    }),

    "2b": createConfig("2b", "Question Two - tangent gradient of a square-root curve", {
      focus: raw`Rewrite the square root as a power, differentiate with the chain rule, then substitute \(x=5\).`,
      tags: tags.concat(["chain rule", "square root", "tangent gradient", "Question 2(b)"]),
      questionHtml: raw`
        <p class="step-text">Find the gradient of the tangent to the function</p>
        <div class="question-math">\[y=\sqrt{2x-1}\]</div>
        <p class="step-text">at the point \((5,3)\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Write \(\sqrt{2x-1}\) as \((2x-1)^{1/2}\).`,
        raw`The derivative of the inside \(2x-1\) cancels the factor \(1/2\).`
      ],
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[\text{Gradient}=\frac13\]</div>
      `),
      guidedSteps: [
        guidedStep("Rewrite the radical", raw`Power notation makes the outside function explicit.`, raw`
          <div class="math-block">\[y=(2x-1)^{1/2}.\]</div>
        `),
        guidedStep("Differentiate with the chain rule", raw`Differentiate the outside power and multiply by the derivative of the inside.`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}=\frac12(2x-1)^{-1/2}(2)
            \]
            \[=\frac{1}{\sqrt{2x-1}}.\]
          </div>
        `),
        guidedStep("Evaluate at the given point", raw`A tangent gradient at \((5,3)\) uses \(x=5\) in the derivative.`, raw`
          <div class="math-block">
            \[
            \left.\frac{dy}{dx}\right|_{x=5}=\frac{1}{\sqrt{2(5)-1}}
            =\frac1{\sqrt9}=\frac13.
            \]
          </div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{\text{Gradient}=\frac13}\]</div>`)}
        `)
      ]
    }),

    "2c": createConfig("2c", "Question Two - continuity, differentiability, and graph interpretation", {
      focus: raw`Read open and filled points, corners, stationary points, concavity, and limits as separate graph features.`,
      tags: tags.concat(["piecewise graph", "continuity", "differentiability", "stationary points", "concavity", "limits", "Question 2(c)"]),
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(y=f(x)\).</p>
        ${piecewiseGraphDiagramHtml()}
        <p class="step-text">For the function \(y=f(x)\) above:</p>
        <p class="step-text">Find the value(s) of \(x\) that meet the following conditions:</p>
        <div class="question-math">
          <p class="step-text">(a) \(f\) is not continuous.</p>
          <p class="step-text">(b) \(f\) is not differentiable.</p>
          <p class="step-text">(c) \(f'(x)=0\).</p>
          <p class="step-text">(d) \(f''(x)&lt;0\).</p>
        </div>
        <p class="step-text">(e) What is the value of \(\displaystyle\lim_{x\to-1}f(x)\)? State clearly if the value of the limit does not exist.</p>
      `,
      hints: [
        raw`A filled point gives the function value; an open point can still show the value approached by a limit.`,
        raw`Differentiability can fail at a discontinuity or at a corner where the one-sided gradients do not agree.`,
        raw`For \(f'(x)=0\), look for smooth horizontal tangents and horizontal intervals.`
      ],
      answerHtml: answerHighlight("Final answers", raw`
        <div class="math-block">
          <p class="step-text"><strong>Not continuous:</strong> \(x=-1,1\).</p>
          <p class="step-text"><strong>Not differentiable:</strong> \(x=-2,-1,1,4\).</p>
          <p class="step-text"><strong>Zero gradient:</strong> \(x=-4\), \(x=3\), and \(x>4\).</p>
          <p class="step-text"><strong>Concave down:</strong> \(1&lt;x&lt;4\).</p>
          \[\lim_{x\to-1}f(x)=1\]
        </div>
      `),
      guidedSteps: [
        guidedStep("Find the discontinuities", raw`Compare the value shown by a filled point with the values approached by the nearby branches.`, raw`
          <p class="step-text">At \(x=-1\), the descending line has an open point at height \(1\), while the filled point gives a different function value. At \(x=1\), the line approaches the open point at \(y=-5\), but the next branch begins at the filled point \((1,-3)\).</p>
          <div class="math-block">\[\boxed{x=-1\text{ and }x=1}\]</div>
        `),
        guidedStep("Find where f is not differentiable", raw`Every differentiable point is continuous, and corners also prevent a unique tangent gradient.`, raw`
          <p class="step-text">The graph has a corner where the left curve meets the line at \(x=-2\). It is discontinuous at \(x=-1\) and \(x=1\). At \(x=4\), the curved branch joins a horizontal ray with unequal one-sided gradients.</p>
          <div class="math-block">\[\boxed{x=-2,-1,1,4}\]</div>
        `),
        guidedStep("Find where the gradient is zero", raw`Look for smooth stationary points and the interior of any horizontal branch.`, raw`
          <p class="step-text">The left curve has a smooth minimum at \(x=-4\), and the right curve has a smooth maximum at \(x=3\). The ray is horizontal for every \(x>4\); the endpoint \(x=4\) is excluded because the graph has a corner there.</p>
          <div class="math-block">\[\boxed{f'(x)=0\text{ at }x=-4,\ x=3,\text{ and for }x>4}\]</div>
        `),
        guidedStep("Read the concavity", raw`Concave down means the gradient decreases as x increases.`, raw`
          <p class="step-text">The right-hand curved branch bends like an upside-down bowl from just after \(x=1\) until the corner at \(x=4\).</p>
          <div class="math-block">\[\boxed{f''(x)&lt;0\text{ for }1&lt;x&lt;4}\]</div>
        `),
        guidedStep("Evaluate the limit at negative one", raw`A limit follows the nearby branch rather than the isolated filled value.`, raw`
          <p class="step-text">From both sides of \(x=-1\), the descending line approaches the open point \((-1,1)\).</p>
          <div class="math-block">
            \[\lim_{x\to-1^-}f(x)=1,\qquad \lim_{x\to-1^+}f(x)=1\]
            \[\therefore\ \lim_{x\to-1}f(x)=1.\]
          </div>
          ${answerHighlight("Final answers", raw`
            <div class="math-block">
              <p class="step-text"><strong>Not continuous:</strong> \(x=-1,1\).</p>
              <p class="step-text"><strong>Not differentiable:</strong> \(x=-2,-1,1,4\).</p>
              <p class="step-text"><strong>Zero gradient:</strong> \(x=-4\), \(x=3\), and \(x>4\).</p>
              <p class="step-text"><strong>Concave down:</strong> \(1&lt;x&lt;4\).</p>
              \[\boxed{\lim_{x\to-1}f(x)=1}\]
            </div>
          `)}
        `)
      ]
    }),

    "2d": createConfig("2d", "Question Two - related rates for an inflating sphere", {
      focus: raw`Use the stated volume to find the radius at that instant, then differentiate the sphere-volume formula with respect to time.`,
      tags: tags.concat(["related rates", "sphere volume", "implicit differentiation", "Question 2(d)"]),
      questionHtml: raw`
        <p class="step-text">A large spherical helium balloon is being inflated at a constant rate of</p>
        <div class="question-math">\[4800\text{ cm}^3\text{ s}^{-1}.\]</div>
        <p class="step-text">At what rate is the radius of the balloon increasing when the volume of the balloon is \(288000\pi\text{ cm}^3\)?</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`First solve \(\frac43\pi r^3=288000\pi\) for the radius at that instant.`,
        raw`Treat both \(V\) and \(r\) as functions of time when differentiating.`,
        raw`Substitute \(dV/dt=4800\) only after forming the related-rates equation.`
      ],
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[\frac{dr}{dt}=\frac1{3\pi}\approx0.1061\text{ cm/s}\]</div>
      `),
      guidedSteps: [
        guidedStep("Find the radius at the stated volume", raw`The related-rates equation needs the radius at this particular instant.`, raw`
          <div class="math-block">
            \[V=\frac43\pi r^3\]
            \[288000\pi=\frac43\pi r^3\]
            \[r^3=216000\]
            \[r=60\text{ cm}.\]
          </div>
        `),
        guidedStep("Differentiate with respect to time", raw`Volume and radius both change as the balloon is inflated.`, raw`
          <div class="math-block">
            \[
            \frac{dV}{dt}=4\pi r^2\frac{dr}{dt}.
            \]
          </div>
          <p class="step-text">The factor \(dr/dt\) appears through the chain rule because \(r=r(t)\).</p>
        `),
        guidedStep("Substitute the known rates and radius", raw`Use consistent centimetre-and-second units throughout.`, raw`
          <div class="math-block">
            \[4800=4\pi(60)^2\frac{dr}{dt}\]
            \[\frac{dr}{dt}=\frac{4800}{14400\pi}=\frac1{3\pi}\]
            \[\frac{dr}{dt}\approx0.1061.\]
          </div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">\[\boxed{\frac{dr}{dt}\approx0.1061\text{ cm/s}}\]</div>
            <p class="step-text">The radius is increasing at approximately \(0.1061\) centimetres per second.</p>
          `)}
        `)
      ]
    }),

    "2e": createConfig("2e", "Question Two - maximum cone volume inside a sphere", {
      focus: raw`Express the cone's height and radius in terms of s, build its volume function, and find the valid stationary value.`,
      tags: tags.concat(["optimisation", "cone volume", "sphere geometry", "product rule", "Question 2(e)"]),
      questionHtml: raw`
        <p class="step-text">A cone of height \(h\) and radius \(r\) is inscribed, as shown, inside a sphere of radius \(6\text{ cm}\).</p>
        <p class="step-text">The base of the cone is \(s\text{ cm}\) below the \(x\)-axis.</p>
        ${coneInSphereDiagramHtml()}
        <p class="step-text">Find the value of \(s\) which maximises the volume of the cone.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
        <p class="step-text question-note">You do not need to prove that the volume you have found is a maximum.</p>
      `,
      hints: [
        raw`The apex is at height \(6\), while the base is at height \(-s\), so \(h=6+s\).`,
        raw`A point on the base circle lies on the sphere, giving \(r^2+s^2=36\).`,
        raw`Substitute both relationships into \(V=\frac13\pi r^2h\) before differentiating.`
      ],
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[s=2\text{ cm}\]</div>
      `),
      guidedSteps: [
        guidedStep("Relate the cone dimensions to s", raw`Use the vertical positions and the sphere's radius.`, raw`
          <div class="math-block">
            \[h=6+s\]
            \[s^2+r^2=6^2=36\]
            \[r^2=36-s^2.\]
          </div>
          <p class="step-text">For the configuration shown, \(0\le s<6\).</p>
        `),
        guidedStep("Write the volume as a function of s", raw`Substitute the height and squared radius into the cone-volume formula.`, raw`
          <div class="math-block">
            \[V=\frac13\pi r^2h\]
            \[V(s)=\frac{\pi}{3}(36-s^2)(6+s).\]
          </div>
        `),
        guidedStep("Differentiate the volume", raw`Use the product rule while keeping the constant \(\pi/3\) outside.`, raw`
          <div class="math-block">
            \[
            \frac{dV}{ds}=\frac{\pi}{3}\left[(36-s^2)-2s(6+s)\right]
            \]
            \[=\frac{\pi}{3}(36-12s-3s^2).\]
          </div>
        `),
        guidedStep("Solve the stationary equation", raw`Factor the resulting quadratic, then keep only values allowed by the geometry.`, raw`
          <div class="math-block">
            \[36-12s-3s^2=0\]
            \[s^2+4s-12=0\]
            \[(s+6)(s-2)=0\]
            \[s=-6\quad\text{or}\quad s=2.\]
          </div>
          <p class="step-text">The distance \(s\) is non-negative, so \(s=-6\) is not a valid position. The question states that a separate proof of maximum is not required.</p>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{s=2\text{ cm}}\]</div>`)}
        `)
      ]
    }),

    "3a": createConfig("3a", "Question Three - chain rule for a fourth root", {
      focus: raw`Write the fourth root as a fractional power, then differentiate the outside and inside functions.`,
      tags: tags.concat(["chain rule", "fractional powers", "fourth root", "Question 3(a)"]),
      questionHtml: raw`
        <div class="question-math">\[\text{Differentiate }f(x)=\sqrt[4]{3x+2}.\]</div>
      `,
      hints: [
        raw`Rewrite \(\sqrt[4]{3x+2}\) as \((3x+2)^{1/4}\).`,
        raw`After the power rule, multiply by the derivative of \(3x+2\).`
      ],
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[f'(x)=\frac34(3x+2)^{-3/4}\]</div>
      `),
      guidedSteps: [
        guidedStep("Rewrite the fourth root", raw`A fourth root is a power of one quarter.`, raw`
          <div class="math-block">\[f(x)=(3x+2)^{1/4}.\]</div>
        `),
        guidedStep("Apply the chain rule", raw`Reduce the outside exponent by one, then multiply by the derivative of the inside.`, raw`
          <div class="math-block">
            \[
            f'(x)=\frac14(3x+2)^{-3/4}(3)
            \]
            \[f'(x)=\frac34(3x+2)^{-3/4}.\]
          </div>
          <p class="step-text">The original real-valued function is defined for \(x\ge-\tfrac23\); this derivative is defined for \(x>-\tfrac23\).</p>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{f'(x)=\frac34(3x+2)^{-3/4}}\]</div>`)}
        `)
      ]
    }),

    "3b": createConfig("3b", "Question Three - horizontal tangent to an exponential curve", {
      focus: raw`A tangent parallel to the x-axis has gradient zero, so differentiate and solve the resulting exponential equation.`,
      tags: tags.concat(["horizontal tangent", "exponential differentiation", "logarithms", "Question 3(b)"]),
      questionHtml: raw`
        <p class="step-text">Find the \(x\)-value at which a tangent to the curve</p>
        <div class="question-math">\[y=6x-e^{3x}\]</div>
        <p class="step-text">is parallel to the \(x\)-axis.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Parallel to the x-axis means \(dy/dx=0\).`,
        raw`The chain rule gives \(\frac{d}{dx}e^{3x}=3e^{3x}\).`,
        raw`Use natural logarithms to solve \(e^{3x}=2\).`
      ],
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[x=\frac{\ln2}{3}=\ln\left(\sqrt[3]{2}\right)\]</div>
      `),
      guidedSteps: [
        guidedStep("Differentiate the curve", raw`Differentiate the linear and exponential terms separately.`, raw`
          <div class="math-block">
            \[\frac{dy}{dx}=6-3e^{3x}.\]
          </div>
        `),
        guidedStep("Use the horizontal-tangent condition", raw`Set the tangent gradient equal to zero.`, raw`
          <div class="math-block">
            \[6-3e^{3x}=0\]
            \[e^{3x}=2.\]
          </div>
        `),
        guidedStep("Solve for x", raw`Take natural logarithms and use the power rule for logarithms.`, raw`
          <div class="math-block">
            \[3x=\ln2\]
            \[x=\frac{\ln2}{3}.\]
          </div>
          <p class="step-text">Since \(\ln(2^{1/3})=\tfrac13\ln2\), the source's equivalent form is \(\ln(\sqrt[3]{2})\).</p>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\boxed{x=\frac{\ln2}{3}=\ln\left(\sqrt[3]{2}\right)}\]</div>`)}
        `)
      ]
    }),

    "3c": createConfig("3c", "Question Three - maximum rectangle area beneath a parabola", {
      focus: raw`Use the opposite vertex to express the rectangle's area in one variable, then find the valid stationary point.`,
      tags: tags.concat(["optimisation", "rectangle area", "parabola", "product rule", "Question 3(c)"]),
      questionHtml: raw`
        <p class="step-text">A rectangle has one vertex at \((0,0)\) and the opposite vertex on the curve</p>
        <div class="question-math">\[y=(x-6)^2,\qquad 0&lt;x&lt;6,\]</div>
        <p class="step-text">as shown on the graph below.</p>
        ${rectangleParabolaDiagramHtml()}
        <p class="step-text">Find the maximum possible area of the rectangle.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
        <p class="step-text question-note">You do not need to prove that the area you have found is a maximum.</p>
      `,
      hints: [
        raw`The rectangle has width \(x\) and height \(y=(x-6)^2\).`,
        raw`Differentiate \(A(x)=x(x-6)^2\) using the product rule or by expanding first.`,
        raw`Use the restriction \(0&lt;x&lt;6\) when choosing a stationary point.`
      ],
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[x=2,\qquad A_{\max}=32\text{ units}^2\]</div>
      `),
      guidedSteps: [
        guidedStep("Build the area function", raw`Width times height gives an expression in x only.`, raw`
          <div class="math-block">
            \[A=xy\]
            \[A(x)=x(x-6)^2.\]
          </div>
        `),
        guidedStep("Differentiate the area", raw`Use the product rule and then factor the result.`, raw`
          <div class="math-block">
            \[
            A'(x)=(x-6)^2+2x(x-6)
            \]
            \[=(x-6)\bigl((x-6)+2x\bigr)\]
            \[=(x-6)(3x-6)=3(x-6)(x-2).\]
          </div>
        `),
        guidedStep("Find the valid stationary point", raw`Set the derivative to zero and apply the stated open interval.`, raw`
          <div class="math-block">
            \[3(x-6)(x-2)=0\]
            \[x=6\quad\text{or}\quad x=2.\]
          </div>
          <p class="step-text">The value \(x=6\) is excluded by \(0&lt;x&lt;6\) and would give a degenerate rectangle. Therefore the usable stationary value is \(x=2\).</p>
        `),
        guidedStep("Calculate the area", raw`Substitute the valid x-value into the original area function.`, raw`
          <div class="math-block">
            \[A(2)=2(2-6)^2=2(16)=32.\]
          </div>
          <p class="step-text">The question states that a separate proof of maximum is not required.</p>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">\[\boxed{x=2,\qquad A_{\max}=32\text{ units}^2}\]</div>
          `)}
        `)
      ]
    }),

    "3d": createConfig("3d", "Question Three - quotient rule identity", {
      focus: raw`Differentiate the quotient, then factor the original function from the result and recognise cotangent.`,
      tags: tags.concat(["quotient rule", "exponential", "trigonometric identity", "cotangent", "Question 3(d)"]),
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{If }y=\frac{e^x}{\sin x},\text{ show that }\frac{dy}{dx}=y(1-\cot x).
          \]
        </div>
      `,
      hints: [
        raw`Use the quotient rule with numerator \(e^x\) and denominator \(\sin x\).`,
        raw`After differentiating, factor out \(e^x/\sin x\).`,
        raw`Use \(\cot x=\cos x/\sin x\).`
      ],
      answerHtml: answerHighlight("Shown", raw`
        <div class="math-block">\[\frac{dy}{dx}=y(1-\cot x)\]</div>
      `),
      guidedSteps: [
        guidedStep("Set up the quotient rule", raw`Differentiate the numerator and denominator before substituting into the rule.`, raw`
          <div class="math-block">
            \[u=e^x,\quad u'=e^x,\qquad v=\sin x,\quad v'=\cos x\]
            \[\frac{d}{dx}\left(\frac uv\right)=\frac{u'v-uv'}{v^2}.\]
          </div>
        `),
        guidedStep("Differentiate y", raw`Substitute all four quotient-rule pieces with their signs intact.`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}=\frac{e^x\sin x-e^x\cos x}{\sin^2x}.
            \]
          </div>
        `),
        guidedStep("Factor the original function", raw`Split one factor of sine from the denominator and simplify the bracket.`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}=\frac{e^x}{\sin x}\left(1-\frac{\cos x}{\sin x}\right)
            \]
            \[=\frac{e^x}{\sin x}(1-\cot x).\]
          </div>
          <p class="step-text">Since \(y=e^x/\sin x\), substitute \(y\) for that factor. The identity holds wherever the original function is defined, so \(\sin x\ne0\).</p>
          ${answerHighlight("Shown", raw`<div class="math-block">\[\boxed{\frac{dy}{dx}=y(1-\cot x)}\]</div>`)}
        `)
      ]
    }),

    "3e": createConfig("3e", "Question Three - maximising a rugby conversion angle", {
      focus: raw`Express the viewing angle through tangent subtraction, then maximise the resulting one-variable function of d.`,
      tags: tags.concat(["optimisation", "rugby conversion", "trigonometry", "quotient rule", "Question 3(e)"]),
      questionHtml: raw`
        <p class="step-text">In a rugby game, a try is scored \(15\text{ m}\) from the left-hand goal-post. The conversion kick is taken at some point on the line perpendicular to the goal-line from the point where the try was scored, as shown in the diagram below.</p>
        <p class="step-text">The ball needs to pass between the goal-posts, which are \(5.4\text{ m}\) apart.</p>
        ${rugbyConversionDiagramHtml()}
        <p class="step-text">Find the distance \(d\) from the goal-line that the conversion kick should be taken from in order to maximise the angle \(\theta\) between the lines from the ball to the goal-posts.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
        <p class="step-text question-note">You do not need to prove that the angle you have found is a maximum.</p>
      `,
      hints: [
        raw`The farther post is \(15+5.4=20.4\) metres along the goal-line from the try line.`,
        raw`If \(\alpha\) is the angle to the nearer post, then \(\tan\alpha=15/d\) and \(\tan(\alpha+\theta)=20.4/d\).`,
        raw`Use the tangent subtraction formula to write \(\tan\theta\) as a function of \(d\).`
      ],
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">\[d=\sqrt{306}\text{ m}\approx17.49\text{ m}\]</div>
      `),
      guidedSteps: [
        guidedStep("Write the two sight-line angles", raw`Use the right triangles made by the perpendicular distance d and the distances along the goal-line.`, raw`
          <div class="math-block">
            \[\tan\alpha=\frac{15}{d}\]
            \[\tan(\alpha+\theta)=\frac{20.4}{d}.\]
          </div>
        `),
        guidedStep("Express tan theta in terms of d", raw`Subtract the angles and apply the tangent subtraction identity.`, raw`
          <div class="math-block">
            \[
            \tan\theta=\tan\bigl((\alpha+\theta)-\alpha\bigr)
            \]
            \[
            =\frac{\frac{20.4}{d}-\frac{15}{d}}
            {1+\left(\frac{20.4}{d}\right)\left(\frac{15}{d}\right)}
            \]
            \[=\frac{5.4/d}{1+306/d^2}=\frac{5.4d}{306+d^2}.\]
          </div>
          <p class="step-text">For this geometry, \(0<\theta<\tfrac\pi2\), so tangent is increasing. Maximising \(\tan\theta\) therefore maximises \(\theta\).</p>
        `),
        guidedStep("Differentiate the angle function", raw`Use the quotient rule on \(T(d)=\tan\theta\).`, raw`
          <div class="math-block">
            \[
            T'(d)=\frac{5.4(306+d^2)-5.4d(2d)}{(306+d^2)^2}
            \]
            \[=\frac{5.4(306-d^2)}{(306+d^2)^2}.\]
          </div>
        `),
        guidedStep("Find the physical stationary distance", raw`Set the derivative equal to zero; the denominator is always positive.`, raw`
          <div class="math-block">
            \[5.4(306-d^2)=0\]
            \[d^2=306\]
            \[d=\pm\sqrt{306}.\]
          </div>
          <p class="step-text">Distance is positive, so take \(d=\sqrt{306}\). The question states that a separate proof of maximum is not required.</p>
          <div class="math-block">\[\sqrt{306}\approx17.49.\]</div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">\[\boxed{d=\sqrt{306}\text{ m}\approx17.49\text{ m}}\]</div>
            <p class="step-text">Take the conversion kick approximately \(17.49\) metres from the goal-line.</p>
          `)}
        `)
      ]
    })
  };
}());
