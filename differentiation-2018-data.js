(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-differentiation-2018";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const metadata = {
    topic: "Differentiation",
    year: 2018,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };
  const tags = [
    "Differentiation",
    "2018",
    "NCEA Level 3 Calculus",
    "mixed / Excellence-style"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return id + "2018.html";
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
      browserTitle: "2018 Differentiation Paper - " + questionLabel(id),
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
    return `<text class="${className}" x="${scale.x(x)}" y="${scale.y(y)}"${extra || ""}>${text}</text>`;
  }

  function carPulleyDiagramHtml() {
    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the car and pulley diagram">
        <svg class="graph-svg" viewBox="0 0 720 330" role="img" aria-labelledby="diff-2018-car-title diff-2018-car-desc">
          <title id="diff-2018-car-title">Car, rope, and pulley</title>
          <desc id="diff-2018-car-desc">A rope of length L runs from the tow-bar of a car to a pulley three metres higher. The horizontal separation is x.</desc>
          <defs>
            <marker id="diff-2018-car-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="720" height="330"></rect>
          <line class="graph-axis" x1="38" y1="267" x2="684" y2="267"></line>
          <path class="question-shade" d="M 70 236 L 92 199 Q 113 180 157 178 L 205 137 Q 238 112 300 121 L 350 177 Q 389 179 414 204 L 425 236 Z"></path>
          <path class="question-curve" d="M 70 236 L 92 199 Q 113 180 157 178 L 205 137 Q 238 112 300 121 L 350 177 Q 389 179 414 204 L 425 236"></path>
          <path class="graph-guide" d="M 185 176 L 218 139 L 266 139 L 270 176 Z M 280 139 L 316 145 L 342 176 L 286 176 Z"></path>
          <circle class="question-origin" cx="137" cy="238" r="29"></circle>
          <circle class="question-dot" cx="137" cy="238" r="10"></circle>
          <circle class="question-origin" cx="359" cy="238" r="29"></circle>
          <circle class="question-dot" cx="359" cy="238" r="10"></circle>
          <line class="question-curve" x1="425" y1="230" x2="621" y2="77"></line>
          <circle class="question-origin" cx="621" cy="77" r="15"></circle>
          <line class="graph-guide" x1="621" y1="92" x2="621" y2="248" stroke-dasharray="7 7"></line>
          <line class="graph-guide" x1="425" y1="230" x2="621" y2="230" stroke-dasharray="7 7"></line>
          <path class="graph-guide" d="M 601 230 L 601 210 L 621 210"></path>
          <line class="graph-measure" x1="435" y1="254" x2="612" y2="254" marker-start="url(#diff-2018-car-arrow)" marker-end="url(#diff-2018-car-arrow)"></line>
          <line class="graph-measure" x1="662" y1="84" x2="662" y2="224" marker-start="url(#diff-2018-car-arrow)" marker-end="url(#diff-2018-car-arrow)"></line>
          <text class="graph-equation-label" x="519" y="136">L</text>
          <text class="graph-equation-label" x="523" y="282" text-anchor="middle">x</text>
          <text class="graph-equation-label" x="676" y="160">3 m</text>
          <text class="graph-label" x="392" y="214" text-anchor="end">tow-bar</text>
          <text class="graph-label" x="621" y="44" text-anchor="middle">pulley</text>
        </svg>
      </div>
    `;
  }

  function piecewiseGraphHtml() {
    const width = 720;
    const height = 500;
    const padding = 48;
    const scale = createScale(width, height, padding, -10.5, 10.5, -3.5, 10.5);
    const xTicks = [];
    const yTicks = [];
    const curvePoints = [];

    for (let x = -10; x <= 10; x += 1) {
      xTicks.push(lineMarkup(scale, x, -0.13, x, 0.13, "graph-axis"));
      if (x !== 0) {
        xTicks.push(textMarkup(scale, x, -0.48, String(x).replace("-", "\u2212"), "graph-label", ' text-anchor="middle"'));
      }
    }

    for (let y = -3; y <= 10; y += 1) {
      yTicks.push(lineMarkup(scale, -0.13, y, 0.13, y, "graph-axis"));
      if (y !== 0) {
        yTicks.push(textMarkup(scale, -0.42, y - 0.1, String(y).replace("-", "\u2212"), "graph-label", ' text-anchor="end"'));
      }
    }

    for (let x = 1; x <= 5.001; x += 0.05) {
      const y = 9 - Math.pow(x - 3, 2);
      curvePoints.push((curvePoints.length ? "L " : "M ") + scale.x(x) + " " + scale.y(y));
    }

    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the graph of f">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="diff-2018-function-title diff-2018-function-desc">
          <title id="diff-2018-function-title">Piecewise graph of y equals f of x</title>
          <desc id="diff-2018-function-desc">A decreasing ray has holes at negative seven comma two and negative three comma negative two. A separate horizontal piece runs from a filled point at negative three comma two to an open point at one comma two. An upper curve begins at a filled point at one comma five, peaks smoothly at three comma nine, and ends open at five comma five. A horizontal piece continues to seven comma five, where an increasing ray begins.</desc>
          <defs>
            <marker id="diff-2018-graph-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${lineMarkup(scale, -10.4, 0, 10.4, 0, "graph-axis", ' marker-start="url(#diff-2018-graph-arrow)" marker-end="url(#diff-2018-graph-arrow)"')}
          ${lineMarkup(scale, 0, -3.4, 0, 10.4, "graph-axis", ' marker-start="url(#diff-2018-graph-arrow)" marker-end="url(#diff-2018-graph-arrow)"')}
          ${xTicks.join("")}
          ${yTicks.join("")}
          ${lineMarkup(scale, -10, 5, -3, -2, "question-curve", ' marker-start="url(#diff-2018-graph-arrow)"')}
          ${circleMarkup(scale, -7, 2, 7, "question-origin")}
          ${circleMarkup(scale, -3, -2, 7, "question-origin")}
          ${lineMarkup(scale, -3, 2, 1, 2, "question-curve")}
          ${circleMarkup(scale, -3, 2, 7, "question-dot")}
          ${circleMarkup(scale, 1, 2, 7, "question-origin")}
          <path class="question-curve" d="${curvePoints.join(" ")}"></path>
          ${circleMarkup(scale, 1, 5, 7, "question-dot")}
          ${circleMarkup(scale, 5, 5, 7, "question-origin")}
          ${lineMarkup(scale, 5, 5, 7, 5, "question-curve")}
          ${lineMarkup(scale, 7, 5, 10, 8, "question-curve", ' marker-end="url(#diff-2018-graph-arrow)"')}
          ${textMarkup(scale, 10.25, -0.35, "x", "question-axis-label")}
          ${textMarkup(scale, 0.28, 10.15, "y", "question-axis-label")}
        </svg>
      </div>
    `;
  }

  function coneDiagramHtml() {
    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the inverted cone diagram">
        <svg class="graph-svg" viewBox="0 0 600 500" role="img" aria-labelledby="diff-2018-cone-title diff-2018-cone-desc">
          <title id="diff-2018-cone-title">Inverted conical water tank</title>
          <desc id="diff-2018-cone-desc">The cone is 200 centimetres high with radius 80 centimetres. Water has depth h and surface radius r.</desc>
          <defs>
            <marker id="diff-2018-cone-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="600" height="500"></rect>
          <path class="question-shade" d="M 211 244 Q 300 211 389 244 L 300 444 Z"></path>
          <ellipse class="question-shade-strong" cx="300" cy="244" rx="89" ry="24"></ellipse>
          <ellipse class="question-curve" cx="300" cy="72" rx="170" ry="44"></ellipse>
          <line class="question-curve" x1="130" y1="72" x2="300" y2="444"></line>
          <line class="question-curve" x1="470" y1="72" x2="300" y2="444"></line>
          <ellipse class="question-curve" cx="300" cy="244" rx="89" ry="24"></ellipse>
          <line class="graph-guide" x1="300" y1="72" x2="300" y2="444" stroke-dasharray="7 7"></line>
          <line class="graph-measure" x1="84" y1="76" x2="84" y2="438" marker-start="url(#diff-2018-cone-arrow)" marker-end="url(#diff-2018-cone-arrow)"></line>
          <line class="graph-measure" x1="300" y1="72" x2="458" y2="72" marker-start="url(#diff-2018-cone-arrow)" marker-end="url(#diff-2018-cone-arrow)"></line>
          <line class="graph-measure-soft" x1="326" y1="244" x2="383" y2="244" marker-end="url(#diff-2018-cone-arrow)"></line>
          <line class="graph-measure-soft" x1="326" y1="430" x2="326" y2="250" marker-start="url(#diff-2018-cone-arrow)" marker-end="url(#diff-2018-cone-arrow)"></line>
          <text class="graph-equation-label" x="56" y="270" text-anchor="end">200 cm</text>
          <text class="graph-equation-label" x="379" y="57">80 cm</text>
          <text class="graph-equation-label" x="355" y="231">r</text>
          <text class="graph-equation-label" x="340" y="345">h</text>
        </svg>
      </div>
    `;
  }

  function triangleDiagramHtml() {
    const width = 620;
    const height = 520;
    const padding = 50;
    const scale = createScale(width, height, padding, -5, 5, -1, 16.5);
    const curvePoints = [];

    for (let x = -Math.sqrt(15); x <= Math.sqrt(15) + 0.01; x += 0.04) {
      curvePoints.push((curvePoints.length ? "L " : "M ") + scale.x(x) + " " + scale.y(15 - x * x));
    }

    const pointX = 2.5;
    const pointY = 15 - pointX * pointX;

    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the parabola and triangle diagram">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="diff-2018-triangle-title diff-2018-triangle-desc">
          <title id="diff-2018-triangle-title">Triangle OAB inside y equals 15 minus x squared</title>
          <desc id="diff-2018-triangle-desc">The isosceles triangle has vertex O at the origin and the other vertices A and B at equal heights on opposite sides of the parabola.</desc>
          <defs>
            <marker id="diff-2018-triangle-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${lineMarkup(scale, -4.9, 0, 4.9, 0, "graph-axis", ' marker-start="url(#diff-2018-triangle-arrow)" marker-end="url(#diff-2018-triangle-arrow)"')}
          ${lineMarkup(scale, 0, -0.9, 0, 16.35, "graph-axis", ' marker-start="url(#diff-2018-triangle-arrow)" marker-end="url(#diff-2018-triangle-arrow)"')}
          <path class="question-curve" d="${curvePoints.join(" ")}"></path>
          ${lineMarkup(scale, -pointX, pointY, pointX, pointY, "question-curve")}
          ${lineMarkup(scale, -pointX, pointY, 0, 0, "question-curve")}
          ${lineMarkup(scale, pointX, pointY, 0, 0, "question-curve")}
          ${circleMarkup(scale, -pointX, pointY, 5, "question-dot")}
          ${circleMarkup(scale, pointX, pointY, 5, "question-dot")}
          ${circleMarkup(scale, 0, 0, 5, "question-dot")}
          ${textMarkup(scale, -pointX - 0.25, pointY + 0.35, "A", "graph-equation-label", ' text-anchor="end"')}
          ${textMarkup(scale, pointX + 0.25, pointY + 0.35, "B", "graph-equation-label")}
          ${textMarkup(scale, 0.18, 0.55, "O", "graph-equation-label")}
          ${textMarkup(scale, 4.75, -0.45, "x", "question-axis-label")}
          ${textMarkup(scale, 0.25, 16.1, "y", "question-axis-label")}
          ${textMarkup(scale, 2.15, 14.4, "y = 15 \u2212 x\u00b2", "graph-equation-label")}
        </svg>
      </div>
    `;
  }

  function wireDiagramHtml() {
    return raw`
      <div class="graph-frame question-graph-frame" aria-label="Open a larger view of the symmetric wire diagram">
        <svg class="graph-svg" viewBox="0 0 640 520" role="img" aria-labelledby="diff-2018-wire-title diff-2018-wire-desc">
          <title id="diff-2018-wire-title">Symmetric wire inside a ten centimetre square</title>
          <desc id="diff-2018-wire-desc">A central vertical wire of length x joins two branch points. Four equal diagonal wires run from the branch points to the corners of a ten centimetre square. Dashed vertical and horizontal lines show symmetry.</desc>
          <defs>
            <marker id="diff-2018-wire-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="640" height="520"></rect>
          <rect class="graph-guide" x="110" y="55" width="420" height="400" fill="none" stroke-dasharray="9 9"></rect>
          <line class="graph-measure-soft" x1="320" y1="38" x2="320" y2="472" stroke-dasharray="6 8"></line>
          <line class="graph-measure-soft" x1="92" y1="255" x2="548" y2="255" stroke-dasharray="6 8"></line>
          <line class="question-curve" x1="110" y1="55" x2="320" y2="155"></line>
          <line class="question-curve" x1="530" y1="55" x2="320" y2="155"></line>
          <line class="question-curve" x1="320" y1="155" x2="320" y2="355"></line>
          <line class="question-curve" x1="320" y1="355" x2="110" y2="455"></line>
          <line class="question-curve" x1="320" y1="355" x2="530" y2="455"></line>
          <line class="graph-measure" x1="76" y1="60" x2="76" y2="450" marker-start="url(#diff-2018-wire-arrow)" marker-end="url(#diff-2018-wire-arrow)"></line>
          <line class="graph-measure" x1="115" y1="486" x2="525" y2="486" marker-start="url(#diff-2018-wire-arrow)" marker-end="url(#diff-2018-wire-arrow)"></line>
          <line class="graph-measure-soft" x1="340" y1="160" x2="340" y2="350" marker-start="url(#diff-2018-wire-arrow)" marker-end="url(#diff-2018-wire-arrow)"></line>
          <text class="graph-equation-label" x="54" y="264" text-anchor="end">10 cm</text>
          <text class="graph-equation-label" x="320" y="512" text-anchor="middle">10 cm</text>
          <text class="graph-equation-label" x="358" y="262">x</text>
          <text class="graph-equation-label" x="216" y="116">y</text>
          <text class="graph-label" x="326" y="30">vertical symmetry</text>
          <text class="graph-label" x="536" y="244" text-anchor="end">horizontal symmetry</text>
        </svg>
      </div>
    `;
  }

  window.Differentiation2018Walkthroughs = {
    "1a": createConfig("1a", "Question One - chain and power rules", {
      focus: raw`Rewrite the fraction with a negative power, then use the power rule and chain rule.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Differentiate }y=2x^3+\frac{5}{(x^3+2)^3}.
          \]
        </div>
        <p class="step-text question-note">You do not need to simplify your answer.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[\frac{dy}{dx}=6x^2-\frac{45x^2}{(x^3+2)^4}\]</div>`),
      guidedSteps: [
        guidedStep("Rewrite the fraction", raw`A denominator power can be written as a negative exponent.`, raw`
          <div class="math-block">\[y=2x^3+5(x^3+2)^{-3}\]</div>
        `),
        guidedStep("Differentiate both terms", raw`The second term is a composite function, so include the derivative of \(x^3+2\).`, raw`
          <div class="math-block">
            \[\frac{dy}{dx}=6x^2+5(-3)(x^3+2)^{-4}(3x^2)\]
            \[\frac{dy}{dx}=6x^2-45x^2(x^3+2)^{-4}\]
          </div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\frac{dy}{dx}=6x^2-\frac{45x^2}{(x^3+2)^4}\]</div>`)}
        `)
      ]
    }),

    "1b": createConfig("1b", "Question One - a second-derivative identity", {
      focus: raw`Differentiate twice, then substitute both \(f(x)\) and \(f''(x)\) into the expression you must show is zero.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{If }f(x)=3\cos(3x),\text{ show that }9f(x)+f''(x)=0.
          \]
        </div>
      `,
      answerHtml: answerHighlight("Shown", raw`<div class="math-block">\[9f(x)+f''(x)=27\cos(3x)-27\cos(3x)=0\]</div>`),
      guidedSteps: [
        guidedStep("Find the first derivative", raw`Use the chain rule: differentiating \(\cos(3x)\) brings out a factor of \(3\).`, raw`
          <div class="math-block">\[f'(x)=-9\sin(3x)\]</div>
        `),
        guidedStep("Find the second derivative", raw`Differentiate the sine term once more.`, raw`
          <div class="math-block">\[f''(x)=-27\cos(3x)\]</div>
        `),
        guidedStep("Substitute and cancel", raw`For a “show that” question, display the substitution and the cancellation.`, raw`
          <div class="math-block">
            \[9f(x)+f''(x)=9\bigl(3\cos(3x)\bigr)-27\cos(3x)\]
            \[=27\cos(3x)-27\cos(3x)=0\]
          </div>
          ${answerHighlight("Shown", raw`<div class="math-block">\[9f(x)+f''(x)=0\]</div>`)}
        `)
      ]
    }),

    "1c": createConfig("1c", "Question One - logarithmic and trigonometric differentiation", {
      focus: raw`Differentiate \(\ln|u|\) as \(u'/u\), with \(u=\sin^2x\), before substituting \(x=\pi/6\).`,
      questionHtml: raw`
        <p class="step-text">Find the gradient of the curve</p>
        <div class="question-math">\[y=\ln\left|\sin^2x\right|\]</div>
        <p class="step-text">at the point where \(x=\frac{\pi}{6}\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[\left.\frac{dy}{dx}\right|_{x=\pi/6}=2\sqrt3\]</div>`),
      guidedSteps: [
        guidedStep("Differentiate the logarithm", raw`The derivative of \(\ln|u|\) is \(u'/u\) wherever \(u\ne0\).`, raw`
          <div class="math-block">
            \[\frac{dy}{dx}=\frac{1}{\sin^2x}\bigl(2\sin x\cos x\bigr)\]
            \[\frac{dy}{dx}=\frac{2\cos x}{\sin x}\]
          </div>
        `),
        guidedStep("Evaluate at pi over six", raw`Use \(\sin(\pi/6)=1/2\) and \(\cos(\pi/6)=\sqrt3/2\).`, raw`
          <div class="math-block">
            \[\left.\frac{dy}{dx}\right|_{x=\pi/6}=\frac{2(\sqrt3/2)}{1/2}=2\sqrt3\]
          </div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\text{Gradient}=2\sqrt3\]</div>`)}
        `)
      ]
    }),

    "1d": createConfig("1d", "Question One - related rates with a car and pulley", {
      focus: raw`The rope, ground, and fixed \(3\text{ m}\) height form a right triangle. Relate \(L\) and \(x\), then relate their rates.`,
      questionHtml: raw`
        ${carPulleyDiagramHtml()}
        <p class="step-text">A car is being pulled along by a rope attached to the tow-bar at the back of the car. The rope passes through a pulley, the top of which is \(3\text{ m}\) further from the ground than the tow-bar.</p>
        <p class="step-text">The pulley is \(x\text{ m}\) horizontally from the tow-bar. The rope is being winched in at a speed of \(0.6\text{ m s}^{-1}\), and the wheels remain in contact with the ground.</p>
        <p class="step-text">At what speed is the car moving when the length \(L\) between the tow-bar and pulley is \(5.4\text{ m}\)?</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[\text{Car speed}=0.72\text{ m s}^{-1}\]</div>`),
      guidedSteps: [
        guidedStep("Write the geometric relationship", raw`Apply Pythagoras to the right triangle.`, raw`
          <div class="math-block">\[L^2=x^2+3^2=x^2+9\]</div>
        `),
        guidedStep("Find the horizontal distance", raw`Use \(L=5.4\) in the triangle before evaluating the rate.`, raw`
          <div class="math-block">
            \[x=\sqrt{L^2-9}=\sqrt{5.4^2-3^2}=\frac{6\sqrt{14}}5\]
          </div>
        `),
        guidedStep("Relate the two rates", raw`Differentiate with respect to time. Winching in makes \(dL/dt=-0.6\).`, raw`
          <div class="math-block">
            \[2L\frac{dL}{dt}=2x\frac{dx}{dt}\]
            \[\frac{dx}{dt}=\frac{L}{x}\frac{dL}{dt}\]
            \[\frac{dx}{dt}=\frac{5.4}{6\sqrt{14}/5}(-0.6)=-0.72\text{ m s}^{-1}\]
          </div>
        `),
        guidedStep("Interpret the sign", raw`The negative sign says the horizontal separation is decreasing; speed is its magnitude.`, raw`
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\text{Car speed}=\left|\frac{dx}{dt}\right|=0.72\text{ m s}^{-1}\]</div>`)}
        `)
      ]
    }),

    "1e": createConfig("1e", "Question One - parametric higher derivatives", {
      focus: raw`First form \(dy/dx\). For the second derivative, differentiate that result with respect to \(t\), then divide by \(dx/dt\).`,
      questionHtml: raw`
        <p class="step-text">A curve is defined by the parametric equations</p>
        <div class="question-math">\[x=t^3+1,\qquad y=t^2+1.\]</div>
        <p class="step-text">Show that</p>
        <div class="question-math">\[\frac{\dfrac{d^2y}{dx^2}}{\left(\dfrac{dy}{dx}\right)^4}\]</div>
        <p class="step-text">is a constant.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[\frac{\dfrac{d^2y}{dx^2}}{\left(\dfrac{dy}{dx}\right)^4}=-\frac98\]</div>`),
      guidedSteps: [
        guidedStep("Find the first parametric derivative", raw`Differentiate both coordinates with respect to \(t\), then divide.`, raw`
          <div class="math-block">
            \[\frac{dx}{dt}=3t^2,\qquad \frac{dy}{dt}=2t\]
            \[\frac{dy}{dx}=\frac{dy/dt}{dx/dt}=\frac{2}{3t}\]
          </div>
        `),
        guidedStep("Find the second derivative", raw`Use \(\frac{d^2y}{dx^2}=\frac{d}{dt}(dy/dx)\div\frac{dx}{dt}\).`, raw`
          <div class="math-block">
            \[\frac{d}{dt}\left(\frac{2}{3t}\right)=-\frac{2}{3t^2}\]
            \[\frac{d^2y}{dx^2}=\frac{-2/(3t^2)}{3t^2}=-\frac{2}{9t^4}\]
          </div>
        `),
        guidedStep("Form the required quotient", raw`The powers of \(t\) should cancel completely.`, raw`
          <div class="math-block">
            \[\frac{-2/(9t^4)}{(2/(3t))^4}=-\frac{2}{9t^4}\cdot\frac{81t^4}{16}=-\frac98\]
          </div>
          <p class="step-text">This holds for values of \(t\) where the derivatives are defined.</p>
          ${answerHighlight("Constant value", raw`<div class="math-block">\[-\frac98\]</div>`)}
        `)
      ]
    }),

    "2a": createConfig("2a", "Question Two - radical and cosecant differentiation", {
      focus: raw`Rewrite \(\sqrt{x}\) as \(x^{1/2}\), and remember the chain-rule factor from \(\operatorname{cosec}(5x)\).`,
      questionHtml: raw`<div class="question-math">\[\text{Differentiate }y=3\sqrt{x}+\operatorname{cosec}(5x).\]</div>`,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[\frac{dy}{dx}=\frac32x^{-1/2}-5\operatorname{cosec}(5x)\cot(5x)\]</div>`),
      guidedSteps: [
        guidedStep("Rewrite and differentiate the radical", raw`Use the power rule on \(3x^{1/2}\).`, raw`
          <div class="math-block">\[\frac{d}{dx}\left(3x^{1/2}\right)=\frac32x^{-1/2}\]</div>
        `),
        guidedStep("Differentiate the cosecant term", raw`Use \(\frac{d}{du}(\operatorname{cosec}u)=-\operatorname{cosec}u\cot u\) and \(du/dx=5\).`, raw`
          <div class="math-block">\[\frac{d}{dx}\bigl(\operatorname{cosec}(5x)\bigr)=-5\operatorname{cosec}(5x)\cot(5x)\]</div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\frac{dy}{dx}=\frac32x^{-1/2}-5\operatorname{cosec}(5x)\cot(5x)\]</div>`)}
        `)
      ]
    }),

    "2b": createConfig("2b", "Question Two - velocity from a distance function", {
      focus: raw`Velocity is \(ds/dt\). Differentiate the logarithm using the chain rule, then evaluate at \(t=2\).`,
      questionHtml: raw`
        <p class="step-text">A particle is travelling in a straight line. The distance, in metres, travelled by the particle may be modelled by</p>
        <div class="question-math">\[s(t)=\ln(3t^2+3t+1),\qquad t\ge0,\]</div>
        <p class="step-text">where \(t\) is time measured in seconds. Find the velocity of this particle after \(2\) seconds.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[v(2)=\frac{15}{19}\text{ m s}^{-1}\]</div>`),
      guidedSteps: [
        guidedStep("Differentiate the distance function", raw`For \(\ln u\), the derivative is \(u'/u\).`, raw`
          <div class="math-block">\[v(t)=\frac{ds}{dt}=\frac{6t+3}{3t^2+3t+1}\]</div>
        `),
        guidedStep("Evaluate after two seconds", raw`Substitute \(t=2\) into the velocity function.`, raw`
          <div class="math-block">\[v(2)=\frac{6(2)+3}{3(2)^2+3(2)+1}=\frac{15}{19}\]</div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[v(2)=\frac{15}{19}\text{ m s}^{-1}\]</div>`)}
        `)
      ]
    }),

    "2c": createConfig("2c", "Question Two - interpreting a function graph", {
      focus: raw`Keep four ideas separate: a filled dot gives the function value, a limit follows nearby values, \(f'>0\) means increasing, and differentiability requires a smooth join.`,
      questionHtml: raw`
        <p class="step-text">The diagram below shows the graph of the function \(y=f(x)\).</p>
        ${piecewiseGraphHtml()}
        <p class="step-text">For the function above:</p>
        <p class="step-text">(i) What is the value of \(f(1)\)? State clearly if the value does not exist.</p>
        <p class="step-text">(ii) For what value(s) of \(x\) does \(f(x)\) not have a limit?</p>
        <p class="step-text">(iii) Find all values of \(x\) that meet each condition:</p>
        <div class="question-math">
          \[\text{(1) }f'(x)>0\]
          \[\text{(2) }f'(x)=0\text{ and }f''(x)&lt;0\]
          \[\text{(3) }f(x)\text{ is continuous but not differentiable}\]
        </div>
      `,
      answerHtml: answerHighlight("Final answers", raw`
        <div class="math-block">
          \[f(1)=5\]
          \[\text{No limit at }x=-3\text{ and }x=1\]
          \[f'(x)>0:\ 1&lt;x&lt;3\text{ and }x>7\]
          \[f'(x)=0\text{ and }f''(x)&lt;0:\ x=3\]
          \[\text{Continuous but not differentiable: }x=7\]
        </div>
      `),
      guidedSteps: [
        guidedStep("Read the function value", raw`At a given \(x\), the filled point gives \(f(x)\); an open circle is excluded.`, raw`
          <p class="step-text">At \(x=1\), the filled point is at \(y=5\), while the point at \(y=2\) is open.</p>
          <div class="math-block">\[f(1)=5\]</div>
        `),
        guidedStep("Find where the limit fails", raw`Compare what the graph approaches from the left and from the right.`, raw`
          <p class="step-text">At \(x=-3\), the left side approaches \(-2\) and the right side approaches \(2\). At \(x=1\), the left side approaches \(2\) and the right side approaches \(5\).</p>
          <div class="math-block">\[\text{The limit does not exist at }x=-3\text{ and }x=1.\]</div>
        `),
        guidedStep("Locate increasing pieces", raw`A positive derivative means the graph rises as \(x\) increases.`, raw`
          <p class="step-text">The upper curve rises from \(x=1\) to \(x=3\), and the right ray rises after the corner at \(x=7\).</p>
          <div class="math-block">\[f'(x)>0\text{ for }1&lt;x&lt;3\text{ and }x>7.\]</div>
        `),
        guidedStep("Identify the smooth maximum and corner", raw`A smooth maximum has zero gradient and negative concavity; a corner is continuous but has no single tangent gradient.`, raw`
          <div class="math-block">
            \[f'(x)=0\text{ and }f''(x)&lt;0\text{ at }x=3\]
            \[f(x)\text{ is continuous but not differentiable at }x=7\]
          </div>
          ${answerHighlight("Final answers", raw`
            <div class="math-block">
              \[f(1)=5;\quad \text{no limit at }x=-3,1\]
              \[f'(x)>0:\ 1&lt;x&lt;3\text{ or }x>7\]
              \[\text{smooth maximum at }x=3;\quad \text{corner at }x=7\]
            </div>
          `)}
        `)
      ]
    }),

    "2d": createConfig("2d", "Question Two - stationary points of an exponential product", {
      focus: raw`Use the product rule, factor the resulting quadratic, and remember that \(e^x\) is never zero.`,
      questionHtml: raw`
        <p class="step-text">If</p>
        <div class="question-math">\[y=e^x(2x^2-x-1),\]</div>
        <p class="step-text">find the value(s) of \(x\) for which \(\frac{dy}{dx}=0\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[x=\frac12,\ -2\]</div>`),
      guidedSteps: [
        guidedStep("Differentiate using the product rule", raw`Differentiate each factor once.`, raw`
          <div class="math-block">
            \[\frac{dy}{dx}=e^x(2x^2-x-1)+e^x(4x-1)\]
            \[\frac{dy}{dx}=e^x(2x^2+3x-2)\]
          </div>
        `),
        guidedStep("Set the derivative to zero and factor", raw`Take out the exponential factor and factor the quadratic.`, raw`
          <div class="math-block">\[0=e^x(2x-1)(x+2)\]</div>
        `),
        guidedStep("Use the non-zero exponential", raw`Since \(e^x\ne0\), one of the linear factors must be zero.`, raw`
          <div class="math-block">\[2x-1=0\quad\text{or}\quad x+2=0\]</div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[x=\frac12,\ -2\]</div>`)}
        `)
      ]
    }),

    "2e": createConfig("2e", "Question Two - related rates in a conical tank", {
      focus: raw`Use similar triangles to write both volume and surface area in terms of the single variable \(h\), then connect their rates.`,
      questionHtml: raw`
        <p class="step-text">A water tank is in the shape of an inverted right-circular cone. The height of the cone is \(200\text{ cm}\) and its radius is \(80\text{ cm}\).</p>
        ${coneDiagramHtml()}
        <p class="step-text">The tank is being filled with water at a rate of \(150\text{ cm}^3\) per second. At what rate will the circular surface area of the water be increasing when the depth is \(125\text{ cm}\)?</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[\frac{dS}{dt}=2.4\text{ cm}^2\text{/s}\]</div>`),
      guidedSteps: [
        guidedStep("Use similar triangles", raw`The water cone and tank cone have the same radius-to-height ratio.`, raw`
          <div class="math-block">\[\frac{r}{h}=\frac{80}{200}=\frac25\quad\Longrightarrow\quad r=\frac25h\]</div>
        `),
        guidedStep("Write and differentiate the volume", raw`Replace \(r\) so volume depends only on \(h\).`, raw`
          <div class="math-block">
            \[V=\frac13\pi r^2h=\frac13\pi\left(\frac25h\right)^2h=\frac{4\pi h^3}{75}\]
            \[\frac{dV}{dh}=\frac{4\pi h^2}{25}\]
          </div>
        `),
        guidedStep("Write and differentiate the surface area", raw`The water surface is a circle of radius \(r\).`, raw`
          <div class="math-block">
            \[S=\pi r^2=\frac{4\pi h^2}{25}\]
            \[\frac{dS}{dh}=\frac{8\pi h}{25}\]
          </div>
        `),
        guidedStep("Connect the rates", raw`Use \(dS/dt=(dS/dh)(dh/dV)(dV/dt)\), then set \(h=125\).`, raw`
          <div class="math-block">
            \[\frac{dS}{dt}=\frac{8\pi h}{25}\cdot\frac{25}{4\pi h^2}\cdot150\]
            \[\left.\frac{dS}{dt}\right|_{h=125}=\frac{2}{125}(150)=2.4\]
          </div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\frac{dS}{dt}=2.4\text{ cm}^2\text{/s}\]</div>`)}
        `)
      ]
    }),

    "3a": createConfig("3a", "Question Three - quotient rule", {
      focus: raw`Treat \(e^{2x}\) as the numerator and \(x^2+1\) as the denominator, then apply the quotient rule.`,
      questionHtml: raw`
        <div class="question-math">\[\text{Differentiate }y=\frac{e^{2x}}{x^2+1}.\]</div>
        <p class="step-text question-note">You do not need to simplify your answer.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[\frac{dy}{dx}=\frac{2e^{2x}(x^2+1)-2xe^{2x}}{(x^2+1)^2}\]</div>`),
      guidedSteps: [
        guidedStep("Differentiate numerator and denominator", raw`The numerator also needs the chain rule.`, raw`
          <div class="math-block">\[u=e^{2x},\ u'=2e^{2x};\qquad v=x^2+1,\ v'=2x\]</div>
        `),
        guidedStep("Apply the quotient rule", raw`Use \((u/v)'=(u'v-uv')/v^2\).`, raw`
          <div class="math-block">\[\frac{dy}{dx}=\frac{2e^{2x}(x^2+1)-e^{2x}(2x)}{(x^2+1)^2}\]</div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\frac{dy}{dx}=\frac{2e^{2x}(x^2+1)-2xe^{2x}}{(x^2+1)^2}\]</div>`)}
        `)
      ]
    }),

    "3b": createConfig("3b", "Question Three - parametric gradient", {
      focus: raw`For a parametric curve, divide \(dy/dt\) by \(dx/dt\), then substitute \(t=0\).`,
      questionHtml: raw`
        <p class="step-text">A curve is defined parametrically by</p>
        <div class="question-math">\[x=5e^{2t},\qquad y=2e^{5t}.\]</div>
        <p class="step-text">Find the gradient of the tangent to this curve at the point where \(t=0\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[\left.\frac{dy}{dx}\right|_{t=0}=1\]</div>`),
      guidedSteps: [
        guidedStep("Differentiate both coordinates", raw`Differentiate \(x\) and \(y\) separately with respect to \(t\).`, raw`
          <div class="math-block">\[\frac{dx}{dt}=10e^{2t},\qquad \frac{dy}{dt}=10e^{5t}\]</div>
        `),
        guidedStep("Form and evaluate the gradient", raw`Divide the parametric derivatives and use \(e^0=1\).`, raw`
          <div class="math-block">
            \[\frac{dy}{dx}=\frac{10e^{5t}}{10e^{2t}}=e^{3t}\]
            \[\left.\frac{dy}{dx}\right|_{t=0}=e^0=1\]
          </div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[\text{Gradient}=1\]</div>`)}
        `)
      ]
    }),

    "3c": createConfig("3c", "Question Three - maximum triangle area", {
      focus: raw`Express the triangle's base and height using \(x\), build one area function, and maximise it.`,
      questionHtml: raw`
        <p class="step-text">The diagram shows the graph of</p>
        <div class="question-math">\[y=15-x^2,\]</div>
        <p class="step-text">inside which an isosceles triangle \(OAB\) has been drawn.</p>
        ${triangleDiagramHtml()}
        <p class="step-text">Find the maximum possible area, \(A\), of the triangle. You may assume that your answer is a maximum.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[A_{\max}=10\sqrt5\approx22.36\text{ square units}\]</div>`),
      guidedSteps: [
        guidedStep("Build the area function", raw`The base \(AB\) is \(2x\), and the height from \(O\) is \(y=15-x^2\).`, raw`
          <div class="math-block">
            \[A=\frac12(2x)y=xy\]
            \[A=x(15-x^2)=15x-x^3\]
          </div>
        `),
        guidedStep("Find the relevant stationary point", raw`Differentiate, set the result to zero, and use the positive value of \(x\).`, raw`
          <div class="math-block">
            \[\frac{dA}{dx}=15-3x^2\]
            \[15-3x^2=0\quad\Longrightarrow\quad x=\sqrt5\]
          </div>
        `),
        guidedStep("Evaluate the maximum area", raw`At \(x=\sqrt5\), the height is \(15-5=10\).`, raw`
          <div class="math-block">\[A_{\max}=\sqrt5(10)=10\sqrt5\approx22.36\]</div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[A_{\max}=10\sqrt5\approx22.36\text{ square units}\]</div>`)}
        `)
      ]
    }),

    "3d": createConfig("3d", "Question Three - equation of a tangent", {
      focus: raw`Find the point on the curve and the derivative at \(x=e\), then use point-gradient form.`,
      questionHtml: raw`
        <p class="step-text">Find the equation of the tangent to the curve</p>
        <div class="question-math">\[y=x^2\ln x\]</div>
        <p class="step-text">at the point where \(x=e\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[y=3ex-2e^2\]</div>`),
      guidedSteps: [
        guidedStep("Find the point", raw`Substitute \(x=e\) into the curve and use \(\ln e=1\).`, raw`
          <div class="math-block">\[y=e^2\ln e=e^2\quad\Longrightarrow\quad (e,e^2)\]</div>
        `),
        guidedStep("Find the tangent gradient", raw`Differentiate \(x^2\ln x\) using the product rule.`, raw`
          <div class="math-block">
            \[\frac{dy}{dx}=2x\ln x+x\]
            \[\left.\frac{dy}{dx}\right|_{x=e}=2e(1)+e=3e\]
          </div>
        `),
        guidedStep("Write the tangent equation", raw`Use point-gradient form with point \((e,e^2)\) and gradient \(3e\).`, raw`
          <div class="math-block">
            \[y-e^2=3e(x-e)\]
            \[y=3ex-2e^2\]
          </div>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[y=3ex-2e^2\]</div>`)}
        `)
      ]
    }),

    "3e": createConfig("3e", "Question Three - minimum wire length", {
      focus: raw`Use symmetry and Pythagoras to express one diagonal length in terms of \(x\), then minimise the total length.`,
      questionHtml: raw`
        ${wireDiagramHtml()}
        <p class="step-text">The shape is made from wire and has both vertical and horizontal lines of symmetry. Its four ends are at the vertices of a square with side length \(10\text{ cm}\).</p>
        <p class="step-text">The length of the piece of wire through the centre is \(x\text{ cm}\). Find the value(s) of \(x\) that enables the shape to be made with the minimum length of wire.</p>
        <p class="step-text question-note">You do not need to prove that the length is a minimum. You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`<div class="math-block">\[x=10-\frac{10}{\sqrt3}\approx4.23\text{ cm}\]</div>`),
      guidedSteps: [
        guidedStep("Find one diagonal length", raw`Each diagonal has horizontal displacement \(5\) and vertical displacement \((10-x)/2\).`, raw`
          <div class="math-block">
            \[y^2=\left(\frac{10-x}{2}\right)^2+5^2\]
            \[y^2=\frac{x^2}{4}-5x+50\]
            \[y=\sqrt{\frac{x^2}{4}-5x+50}\]
          </div>
        `),
        guidedStep("Build the total length", raw`There is one central piece and four identical diagonals.`, raw`
          <div class="math-block">\[L=x+4\sqrt{\frac{x^2}{4}-5x+50}\]</div>
        `),
        guidedStep("Differentiate and set to zero", raw`Apply the chain rule to the square-root term.`, raw`
          <div class="math-block">
            \[\frac{dL}{dx}=1+\frac{x-10}{\sqrt{x^2/4-5x+50}}\]
            \[1+\frac{x-10}{\sqrt{x^2/4-5x+50}}=0\]
          </div>
        `),
        guidedStep("Solve the stationary equation", raw`Isolate the square root, square both sides, and solve the quadratic.`, raw`
          <div class="math-block">
            \[10-x=\sqrt{\frac{x^2}{4}-5x+50}\]
            \[(10-x)^2=\frac{x^2}{4}-5x+50\]
            \[x=10\pm\frac{10}{\sqrt3}\]
          </div>
        `),
        guidedStep("Reject the impossible value", raw`The central wire must fit inside the \(10\text{ cm}\) height, so \(x\le10\).`, raw`
          <p class="step-text">The value \(10+10/\sqrt3\) is longer than the available height and is invalid.</p>
          ${answerHighlight("Final answer", raw`<div class="math-block">\[x=10-\frac{10}{\sqrt3}\approx4.23\text{ cm}\]</div>`)}
        `)
      ]
    })
  };
}());
