(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-differentiation-2021";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const metadata = {
    topic: "Differentiation",
    year: 2021,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };
  const tags = [
    "Differentiation",
    "2021",
    "NCEA Level 3 Calculus",
    "mixed / Excellence-style"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return id + "2021.html";
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
      browserTitle: "2021 Differentiation Paper - " + questionLabel(id),
      eyebrow: "Level 3 Differentiation Walkthrough",
      title: questionLabel(id),
      subtitle: subtitle,
      backHref: paperHref,
      nextHref: next ? pageHref(next) : paperHref,
      nextLabel: next ? "Next question →" : "Back to paper",
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

  function lineMarkup(scale, x1, y1, x2, y2, className, extra) {
    return `<line class="${className}" x1="${scale.x(x1)}" y1="${scale.y(y1)}" x2="${scale.x(x2)}" y2="${scale.y(y2)}"${extra || ""}></line>`;
  }

  function circleMarkup(scale, x, y, radius, className, extra) {
    return `<circle class="${className}" cx="${scale.x(x)}" cy="${scale.y(y)}" r="${radius}"${extra || ""}></circle>`;
  }

  function textMarkup(scale, x, y, text, className, extra) {
    return `<text class="${className}" x="${scale.x(x)}" y="${scale.y(y)}"${extra || ""}>${text}</text>`;
  }

  function gridMarkup(scale, xMin, xMax, yMin, yMax) {
    const lines = [];

    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 1) {
      lines.push(lineMarkup(scale, x, yMin, x, yMax, "graph-grid-line"));
    }

    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += 1) {
      lines.push(lineMarkup(scale, xMin, y, xMax, y, "graph-grid-line"));
    }

    return lines.join("");
  }

  function questionOneGraphHtml() {
    const width = 560;
    const height = 430;
    const padding = 42;
    const scale = createScale(width, height, padding, -2, 9, -2, 8.6);
    const parabola = functionPath(function (x) {
      return Math.pow(x - 4, 2) + 2;
    }, 3, 6, 0.035, scale);
    const rightRay = polylinePath([[6, 6], [7, 3], [8.1, -0.3]], scale);

    return raw`
      <div class="graph-frame question-graph-frame">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Piecewise graph of y equals f of x">
          <defs>
            <marker id="diff-2021-1b-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${gridMarkup(scale, -2, 9, -2, 8)}
          ${lineMarkup(scale, -2, 0, 9, 0, "graph-axis")}
          ${lineMarkup(scale, 0, -2, 0, 8.5, "graph-axis")}
          <path class="question-curve" d="${polylinePath([[-2, 1], [2, 1], [3, 2]], scale)}" marker-start="url(#diff-2021-1b-arrow)"></path>
          <path class="question-curve" d="${parabola}"></path>
          <path class="question-curve" d="${rightRay}" marker-end="url(#diff-2021-1b-arrow)"></path>
          ${circleMarkup(scale, 0, 0, 6, "question-origin")}
          ${circleMarkup(scale, 3, 2, 5.5, "question-origin")}
          ${circleMarkup(scale, 3, 3, 5.5, "question-dot")}
          ${circleMarkup(scale, 7, 3, 5.5, "question-origin")}
          ${circleMarkup(scale, 7, 5, 5.5, "question-dot")}
          ${textMarkup(scale, 8.85, -0.28, "x", "question-axis-label")}
          ${textMarkup(scale, 0.18, 8.35, "y", "question-axis-label")}
          ${textMarkup(scale, -0.18, 8, "8", "graph-label", ' text-anchor="end"')}
          ${textMarkup(scale, -0.18, 6, "6", "graph-label", ' text-anchor="end"')}
          ${textMarkup(scale, -0.18, 4, "4", "graph-label", ' text-anchor="end"')}
          ${textMarkup(scale, -0.18, 2, "2", "graph-label", ' text-anchor="end"')}
          ${textMarkup(scale, 2, -0.35, "2", "graph-label", ' text-anchor="middle"')}
          ${textMarkup(scale, 4, -0.35, "4", "graph-label", ' text-anchor="middle"')}
          ${textMarkup(scale, 6, -0.35, "6", "graph-label", ' text-anchor="middle"')}
          ${textMarkup(scale, 8, -0.35, "8", "graph-label", ' text-anchor="middle"')}
        </svg>
      </div>
    `;
  }

  function coneCylinderDiagramHtml() {
    return raw`
      <div class="graph-frame question-graph-frame">
        <svg class="graph-svg" viewBox="0 0 560 420" role="img" aria-label="Cone with an inscribed cylinder">
          <defs>
            <marker id="diff-2021-cone-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#111827"></path>
            </marker>
          </defs>
          <rect class="graph-bg" x="0" y="0" width="560" height="420"></rect>
          <ellipse class="question-curve" cx="260" cy="332" rx="170" ry="42"></ellipse>
          <path class="question-curve" fill="none" d="M 90 332 L 260 46 L 430 332"></path>
          <path class="graph-bg" d="M 156 214 H 364 V 332 C 315 360 205 360 156 332 Z"></path>
          <ellipse class="question-curve" cx="260" cy="214" rx="104" ry="24"></ellipse>
          <path class="question-curve" d="M 156 214 L 156 332"></path>
          <path class="question-curve" d="M 364 214 L 364 332"></path>
          <path class="question-curve" d="M 156 332 C 205 360 315 360 364 332"></path>
          <path class="graph-guide" d="M 260 46 L 260 332"></path>
          <path class="graph-measure" d="M 468 52 L 468 326" marker-start="url(#diff-2021-cone-arrow)" marker-end="url(#diff-2021-cone-arrow)"></path>
          <path class="graph-measure" d="M 260 384 L 430 384" marker-start="url(#diff-2021-cone-arrow)" marker-end="url(#diff-2021-cone-arrow)"></path>
          <text class="graph-equation-label" x="486" y="196">3 m</text>
          <text class="graph-equation-label" x="318" y="407" text-anchor="middle">1.5 m</text>
          <text class="graph-label" x="248" y="274" text-anchor="end">h</text>
          <text class="graph-label" x="315" y="354" text-anchor="middle">r</text>
        </svg>
      </div>
    `;
  }

  function tangentDiagramHtml() {
    const width = 620;
    const height = 340;
    const padding = 34;
    const scale = createScale(width, height, padding, -3, 14, -0.6, 5.4);
    const curvePath = functionPath(function (x) {
      return Math.sqrt(Math.max(0, 2 * x - 4));
    }, 2, 13.5, 0.04, scale);
    const tangent = function (x) {
      return 0.25 * x + 1.5;
    };

    return raw`
      <div class="graph-frame question-graph-frame">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Curve y equals square root of two x minus four and tangent through negative two one">
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${lineMarkup(scale, -3, 0, 14, 0, "graph-axis")}
          ${lineMarkup(scale, 0, -0.6, 0, 5.4, "graph-axis")}
          <path class="question-curve" d="${curvePath}"></path>
          ${lineMarkup(scale, -3, tangent(-3), 14, tangent(14), "question-normal")}
          ${circleMarkup(scale, -2, 1, 5.5, "question-dot")}
          ${circleMarkup(scale, 10, 4, 5.5, "question-dot")}
          ${textMarkup(scale, -2.1, 1.52, "(-2, 1)", "graph-label", ' text-anchor="middle"')}
          ${textMarkup(scale, 10.1, 4.46, "P", "graph-equation-label")}
          ${textMarkup(scale, 13.85, -0.14, "x", "question-axis-label")}
          ${textMarkup(scale, -0.2, 5.15, "y", "question-axis-label", ' text-anchor="end"')}
          ${textMarkup(scale, 8.9, 2.45, "y = sqrt(2x - 4)", "graph-label", ' text-anchor="middle"')}
        </svg>
      </div>
    `;
  }

  function lampTableDiagramHtml() {
    return raw`
      <div class="graph-frame question-graph-frame">
        <svg class="graph-svg" viewBox="0 0 640 420" role="img" aria-label="Lamp above the centre of a round table">
          <rect class="graph-bg" x="0" y="0" width="640" height="420"></rect>
          <ellipse class="question-shade" cx="330" cy="305" rx="255" ry="56"></ellipse>
          <ellipse class="question-curve" cx="330" cy="305" rx="255" ry="56"></ellipse>
          <line class="graph-measure" x1="330" y1="92" x2="330" y2="305"></line>
          <line class="graph-measure" x1="95" y1="305" x2="330" y2="305"></line>
          <line class="graph-measure" x1="95" y1="305" x2="330" y2="92"></line>
          <path class="question-normal" d="M 300 305 L 300 275 L 330 275"></path>
          <circle class="question-origin" cx="330" cy="92" r="34"></circle>
          <rect class="question-dot" x="318" y="42" width="24" height="28"></rect>
          <rect class="question-dot" x="314" y="66" width="32" height="18"></rect>
          <circle class="question-dot" cx="95" cy="305" r="5"></circle>
          <path class="question-normal" d="M 330 126 A 38 38 0 0 1 303 110"></path>
          <text class="graph-equation-label" x="376" y="83">light</text>
          <text class="graph-equation-label" x="376" y="111">source</text>
          <text class="graph-equation-label" x="343" y="202">h</text>
          <text class="graph-equation-label" x="216" y="292" text-anchor="middle">r</text>
          <text class="graph-equation-label" x="205" y="210" text-anchor="middle">S</text>
          <text class="graph-label" x="307" y="132">θ</text>
          <text class="graph-equation-label" x="76" y="313" text-anchor="end">P</text>
        </svg>
      </div>
    `;
  }

  window.Differentiation2021Walkthroughs = {
    "1a": createConfig("1a", "Question One - product rule", {
      focus: raw`Treat \(e^{3x}\) and \(\sin 2x\) as two separate factors, then use the product rule.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Differentiate } y=e^{3x}\sin 2x.
          \]
        </div>
        <p class="step-text question-note">You do not need to simplify your answer.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          \frac{dy}{dx}=3e^{3x}\sin 2x+2e^{3x}\cos 2x
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Name the two factors", raw`The function is a product, so set up \(u\) and \(v\).`, raw`
          <div class="math-block">
            \[
            u=e^{3x},\qquad v=\sin 2x
            \]
          </div>
        `),
        guidedStep("Differentiate each factor", raw`Both factors also need the chain rule.`, raw`
          <div class="math-block">
            \[
            u'=3e^{3x}
            \]
            \[
            v'=2\cos 2x
            \]
          </div>
        `),
        guidedStep("Apply the product rule", raw`Use \((uv)'=u'v+uv'\).`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}=3e^{3x}\sin 2x+e^{3x}(2\cos2x)
            \]
          </div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">
              \[
              \frac{dy}{dx}=3e^{3x}\sin 2x+2e^{3x}\cos2x
              \]
            </div>
          `)}
        `)
      ]
    }),
    "1b": createConfig("1b", "Question One - concavity and limits from a graph", {
      focus: raw`Read the shape of the graph, not just the filled dots. Limits care about where the graph approaches.`,
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(y=f(x)\).</p>
        ${questionOneGraphHtml()}
        <p class="step-text">For the function above:</p>
        <p class="step-text">(i) Find the value(s) of \(x\) that meet the following conditions:</p>
        <div class="question-math">
          \[
          \text{(1) } f'(x)=0
          \]
          \[
          \text{(2) } f(x)\text{ is concave upwards}
          \]
        </div>
        <p class="step-text">(ii) What is the value of \(\lim_{x\to 7} f(x)\)? State clearly if the value does not exist.</p>
      `,
      answerHtml: answerHighlight("Final answers", raw`
        <div class="math-block">
          \[
          f'(x)=0 \text{ at } x=4
          \]
          \[
          f(x)\text{ is concave upwards for }3<x<6
          \]
          \[
          \lim_{x\to7}f(x)=3
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Find where the gradient is zero", raw`Look for a smooth point where the tangent would be horizontal.`, raw`
          <p class="step-text">The curve has a smooth minimum at \(x=4\). The tangent there is horizontal.</p>
          <div class="math-block">
            \[
            f'(4)=0
            \]
          </div>
        `),
        guidedStep("Find the concave-up interval", raw`Concave upwards means the curve bends like a cup.`, raw`
          <p class="step-text">The curved part from \(x=3\) to \(x=6\) bends upwards. The endpoints are not included because the graph changes piece there.</p>
          <div class="math-block">
            \[
            3<x<6
            \]
          </div>
        `),
        guidedStep("Read the limit at x equals 7", raw`A limit ignores the filled dot and follows the graph from both sides.`, raw`
          <p class="step-text">As \(x\) approaches \(7\), the line approaches the open circle at \(y=3\). The filled dot shows \(f(7)=5\), but that is not the limit.</p>
          ${answerHighlight("Final answers", raw`
            <div class="math-block">
              \[
              f'(x)=0\text{ at }x=4
              \]
              \[
              f(x)\text{ is concave upwards for }3<x<6
              \]
              \[
              \lim_{x\to7}f(x)=3
              \]
            </div>
          `)}
        `)
      ]
    }),
    "1c": createConfig("1c", "Question One - stationary points with product and chain rules", {
      focus: raw`Differentiate first, then use \(e^{x^2}>0\) to simplify the stationary-point equation.`,
      questionHtml: raw`
        <p class="step-text">A curve has the equation</p>
        <div class="question-math">
          \[
          y=(2x+3)e^{x^2}.
          \]
        </div>
        <p class="step-text">Find the \(x\)-coordinate(s) of any stationary point(s) on the curve.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          x=-1,\quad x=-\frac{1}{2}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Differentiate the product", raw`Use the product rule on \((2x+3)e^{x^2}\).`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}=2e^{x^2}+(2x+3)e^{x^2}(2x)
            \]
            \[
            \frac{dy}{dx}=e^{x^2}(4x^2+6x+2)
            \]
          </div>
        `),
        guidedStep("Set the derivative to zero", raw`Stationary points happen when \(\frac{dy}{dx}=0\).`, raw`
          <div class="math-block">
            \[
            e^{x^2}(4x^2+6x+2)=0
            \]
          </div>
          <p class="step-text">Because \(e^{x^2}\) is never zero, only the quadratic factor can be zero.</p>
          <div class="math-block">
            \[
            4x^2+6x+2=0
            \]
          </div>
        `),
        guidedStep("Solve the quadratic", raw`Factorise the quadratic to find the possible \(x\)-coordinates.`, raw`
          <div class="math-block">
            \[
            4x^2+6x+2=0
            \]
            \[
            (4x+2)(x+1)=0
            \]
            \[
            x=-\frac{1}{2},\quad x=-1
            \]
          </div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">
              \[
              x=-1,\quad x=-\frac{1}{2}
              \]
            </div>
          `)}
        `)
      ]
    }),
    "1d": createConfig("1d", "Question One - parametric differentiation", {
      focus: raw`For parametric curves, use \(\frac{dy}{dx}=\frac{dy/dt}{dx/dt}\), then find the matching value of \(t\).`,
      questionHtml: raw`
        <p class="step-text">A curve is defined parametrically by the equations</p>
        <div class="question-math">
          \[
          x=t^2+3t,\qquad y=t^2\ln(2t-3),\qquad t>\frac{3}{2}.
          \]
        </div>
        <p class="step-text">Find the gradient of the tangent to the curve at the point \((10,0)\).</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          \frac{dy}{dx}=\frac{8}{7}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Differentiate x and y with respect to t", raw`Find \(dx/dt\) and \(dy/dt\) separately.`, raw`
          <div class="math-block">
            \[
            \frac{dx}{dt}=2t+3
            \]
            \[
            \frac{dy}{dt}=2t\ln(2t-3)+t^2\cdot\frac{2}{2t-3}
            \]
            \[
            \frac{dy}{dt}=2t\ln(2t-3)+\frac{2t^2}{2t-3}
            \]
          </div>
        `),
        guidedStep("Build dy over dx", raw`Divide the two parametric derivatives.`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            \frac{\frac{dy}{dt}}{\frac{dx}{dt}}
            =
            \frac{2t\ln(2t-3)+\frac{2t^2}{2t-3}}{2t+3}
            \]
          </div>
        `),
        guidedStep("Find the t-value for the point", raw`Use the \(x\)-coordinate \(10\) and the restriction \(t>\frac32\).`, raw`
          <div class="math-block">
            \[
            t^2+3t=10
            \]
            \[
            (t+5)(t-2)=0
            \]
            \[
            t=2
            \]
          </div>
          <p class="step-text">The value \(t=-5\) is rejected because \(t>\frac{3}{2}\).</p>
        `),
        guidedStep("Evaluate the gradient", raw`Substitute \(t=2\). Since \(\ln(1)=0\), the expression becomes much simpler.`, raw`
          <div class="math-block">
            \[
            \left.\frac{dy}{dx}\right|_{t=2}
            =
            \frac{2(2)\ln(1)+\frac{2(2)^2}{1}}{2(2)+3}
            \]
            \[
            =
            \frac{8}{7}
            \]
          </div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">
              \[
              \text{The gradient is }\frac{8}{7}.
              \]
            </div>
          `)}
        `)
      ]
    }),
    "1e": createConfig("1e", "Question One - cone and cylinder optimisation", {
      focus: raw`First express the cylinder height \(h\) in terms of its radius \(r\). Then make a one-variable volume function.`,
      questionHtml: raw`
        <p class="step-text">A cone has a height of \(3\text{ m}\) and a radius of \(1.5\text{ m}\).</p>
        <p class="step-text">A cylinder is inscribed in the cone, as shown in the diagram below.</p>
        ${coneCylinderDiagramHtml()}
        <p class="step-text">The base of the cylinder has the same centre as the base of the cone.</p>
        <p class="step-text">Prove that the maximum volume of the cylinder is \(\pi\text{ m}^3\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          V_{\max}=\pi\text{ m}^3
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Relate h and r", raw`Use similar triangles, or the straight line from \((0,3)\) to \((1.5,0)\).`, raw`
          <p class="step-text">When \(r=0\), the available height is \(3\). When \(r=1.5\), the height is \(0\). This gives a straight-line relationship.</p>
          <div class="math-block">
            \[
            h=3-2r
            \]
          </div>
        `),
        guidedStep("Write the cylinder volume", raw`Now substitute \(h=3-2r\) into \(V=\pi r^2h\).`, raw`
          <div class="math-block">
            \[
            V=\pi r^2h
            \]
            \[
            V=\pi r^2(3-2r)
            \]
            \[
            V=3\pi r^2-2\pi r^3
            \]
          </div>
        `),
        guidedStep("Differentiate and solve", raw`Stationary volumes happen when \(\frac{dV}{dr}=0\).`, raw`
          <div class="math-block">
            \[
            \frac{dV}{dr}=6\pi r-6\pi r^2
            \]
            \[
            6\pi r(1-r)=0
            \]
            \[
            r=0\quad\text{or}\quad r=1
            \]
          </div>
          <p class="step-text">The meaningful interior radius is \(r=1\text{ m}\).</p>
        `),
        guidedStep("Show it is a maximum", raw`A second derivative check is the quickest proof here.`, raw`
          <div class="math-block">
            \[
            \frac{d^2V}{dr^2}=6\pi-12\pi r
            \]
            \[
            \left.\frac{d^2V}{dr^2}\right|_{r=1}=6\pi-12\pi=-6\pi<0
            \]
          </div>
          <p class="step-text">So \(r=1\) gives a maximum volume.</p>
        `),
        guidedStep("Find the maximum volume", raw`Substitute \(r=1\) into the volume equation.`, raw`
          <div class="math-block">
            \[
            V(1)=3\pi(1)^2-2\pi(1)^3
            \]
            \[
            V(1)=\pi
            \]
          </div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">
              \[
              V_{\max}=\pi\text{ m}^3
              \]
            </div>
          `)}
        `)
      ]
    }),
    "2a": createConfig("2a", "Question Two - chain rule", {
      focus: raw`Differentiate the outside power first, then multiply by the derivative of \(1-x^2\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Differentiate } f(x)=(1-x^2)^5.
          \]
        </div>
        <p class="step-text question-note">You do not need to simplify your answer.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          f'(x)=5(1-x^2)^4(-2x)
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Identify the inside function", raw`The inside expression is \(1-x^2\).`, raw`
          <div class="math-block">
            \[
            u=1-x^2,\qquad f(x)=u^5
            \]
          </div>
        `),
        guidedStep("Differentiate with the chain rule", raw`Power down, reduce the power, then multiply by \(u'\).`, raw`
          <div class="math-block">
            \[
            f'(x)=5(1-x^2)^4\cdot(-2x)
            \]
          </div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">
              \[
              f'(x)=5(1-x^2)^4(-2x)
              \]
            </div>
          `)}
        `)
      ]
    }),
    "2b": createConfig("2b", "Question Two - stationary points with the quotient rule", {
      focus: raw`Use the quotient rule carefully, then set the numerator of the derivative equal to zero.`,
      questionHtml: raw`
        <p class="step-text">A curve has the equation</p>
        <div class="question-math">
          \[
          y=\frac{x^2}{x+1}.
          \]
        </div>
        <p class="step-text">Find the \(x\)-coordinate(s) of any stationary point(s) on the curve.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          x=0,\quad x=-2
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Apply the quotient rule", raw`Let the numerator be \(x^2\) and the denominator be \(x+1\).`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            \frac{2x(x+1)-x^2(1)}{(x+1)^2}
            \]
            \[
            \frac{dy}{dx}
            =
            \frac{x^2+2x}{(x+1)^2}
            \]
          </div>
        `),
        guidedStep("Set the derivative to zero", raw`A fraction is zero when its numerator is zero and its denominator is not zero.`, raw`
          <div class="math-block">
            \[
            \frac{x^2+2x}{(x+1)^2}=0
            \]
            \[
            x^2+2x=0
            \]
          </div>
        `),
        guidedStep("Solve and check the domain", raw`Factor the numerator and remember \(x=-1\) is not in the domain.`, raw`
          <div class="math-block">
            \[
            x(x+2)=0
            \]
            \[
            x=0,\quad x=-2
            \]
          </div>
          <p class="step-text">Both values are allowed because neither makes the denominator zero.</p>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">
              \[
              x=0,\quad x=-2
              \]
            </div>
          `)}
        `)
      ]
    }),
    "2c": createConfig("2c", "Question Two - normal to a curve", {
      focus: raw`Find the point on the \(y\)-axis, differentiate to get the tangent gradient, then take the negative reciprocal for the normal.`,
      questionHtml: raw`
        <p class="step-text">A curve has the equation</p>
        <div class="question-math">
          \[
          y=(x^2+3x+2)\cos3x.
          \]
        </div>
        <p class="step-text">Find the equation of the normal to the curve at the point where the curve crosses the \(y\)-axis.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          y=-\frac{x}{3}+2
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Find the point on the y-axis", raw`On the \(y\)-axis, \(x=0\).`, raw`
          <div class="math-block">
            \[
            y=(0^2+3(0)+2)\cos0=2
            \]
          </div>
          <p class="step-text">The point is \((0,2)\).</p>
        `),
        guidedStep("Differentiate the curve", raw`Use the product rule, with a chain rule on \(\cos3x\).`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            (2x+3)\cos3x
            -
            3(x^2+3x+2)\sin3x
            \]
          </div>
        `),
        guidedStep("Evaluate the tangent gradient", raw`Substitute \(x=0\).`, raw`
          <div class="math-block">
            \[
            \left.\frac{dy}{dx}\right|_{x=0}
            =
            3\cos0-3(2)\sin0
            \]
            \[
            =3
            \]
          </div>
        `),
        guidedStep("Write the normal equation", raw`The normal gradient is the negative reciprocal of the tangent gradient.`, raw`
          <div class="math-block">
            \[
            m_{\text{normal}}=-\frac{1}{3}
            \]
            \[
            y-2=-\frac{1}{3}(x-0)
            \]
            \[
            y=-\frac{x}{3}+2
            \]
          </div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">
              \[
              y=-\frac{x}{3}+2
              \]
            </div>
          `)}
        `)
      ]
    }),
    "2d": createConfig("2d", "Question Two - related rates for a sphere", {
      focus: raw`Connect \(\frac{dV}{dt}\) and \(\frac{dr}{dt}\) using \(\frac{dV}{dt}=\frac{dV}{dr}\frac{dr}{dt}\).`,
      questionHtml: raw`
        <p class="step-text">The volume of a spherical balloon is increasing at a constant rate of \(60\text{ cm}^3\) per second.</p>
        <p class="step-text">Find the rate of increase of the radius when the radius is \(15\text{ cm}\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          \frac{dr}{dt}=\frac{1}{15\pi}\approx0.0212\text{ cm s}^{-1}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Write what is given", raw`The volume rate is already a derivative with respect to time.`, raw`
          <div class="math-block">
            \[
            \frac{dV}{dt}=60
            \]
          </div>
          <p class="step-text">We need \(\frac{dr}{dt}\) when \(r=15\).</p>
        `),
        guidedStep("Differentiate the volume formula", raw`Use the sphere volume formula \(V=\frac{4}{3}\pi r^3\).`, raw`
          <div class="math-block">
            \[
            V=\frac{4}{3}\pi r^3
            \]
            \[
            \frac{dV}{dr}=4\pi r^2
            \]
          </div>
        `),
        guidedStep("Use the chain rule for rates", raw`Rearrange \(\frac{dV}{dt}=\frac{dV}{dr}\frac{dr}{dt}\).`, raw`
          <div class="math-block">
            \[
            \frac{dr}{dt}=\frac{\frac{dV}{dt}}{\frac{dV}{dr}}
            \]
            \[
            \frac{dr}{dt}=\frac{60}{4\pi r^2}
            \]
          </div>
        `),
        guidedStep("Substitute r equals 15", raw`Keep units in the final answer.`, raw`
          <div class="math-block">
            \[
            \left.\frac{dr}{dt}\right|_{r=15}
            =
            \frac{60}{4\pi(15)^2}
            \]
            \[
            =
            \frac{1}{15\pi}
            \approx0.0212
            \]
          </div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">
              \[
              \frac{dr}{dt}\approx0.0212\text{ cm s}^{-1}
              \]
            </div>
          `)}
        `)
      ]
    }),
    "2e": createConfig("2e", "Question Two - tangent to a radical curve", {
      focus: raw`At point \(P\), the derivative of the curve must match the gradient of the tangent line through \((-2,1)\).`,
      questionHtml: raw`
        <p class="step-text">The graph below shows the curve</p>
        <div class="question-math">
          \[
          y=\sqrt{2x-4},
          \]
        </div>
        <p class="step-text">and the tangent to the curve at point \(P\). The tangent passes through the point \((-2,1)\).</p>
        ${tangentDiagramHtml()}
        <p class="step-text">Find the coordinates of point \(P\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          P=(10,4)
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Differentiate the curve", raw`Rewrite the square root as a power if that helps.`, raw`
          <div class="math-block">
            \[
            y=(2x-4)^{1/2}
            \]
            \[
            \frac{dy}{dx}
            =
            \frac{1}{2}(2x-4)^{-1/2}\cdot2
            =
            \frac{1}{\sqrt{2x-4}}
            \]
          </div>
        `),
        guidedStep("Write the tangent gradient two ways", raw`Let \(P=(x,\sqrt{2x-4})\).`, raw`
          <p class="step-text">The gradient from \((-2,1)\) to \(P\) is the same as the derivative at \(P\).</p>
          <div class="math-block">
            \[
            \frac{\sqrt{2x-4}-1}{x+2}
            =
            \frac{1}{\sqrt{2x-4}}
            \]
          </div>
        `),
        guidedStep("Solve the equation", raw`Clear the denominator, then square carefully.`, raw`
          <div class="math-block">
            \[
            \sqrt{2x-4}\left(\sqrt{2x-4}-1\right)=x+2
            \]
            \[
            2x-4-\sqrt{2x-4}=x+2
            \]
            \[
            \sqrt{2x-4}=x-6
            \]
            \[
            2x-4=(x-6)^2
            \]
            \[
            x^2-14x+40=0
            \]
            \[
            x=10\quad\text{or}\quad x=4
            \]
          </div>
        `),
        guidedStep("Check for the valid point", raw`Squaring can introduce an extra solution, so check the tangent-gradient equation.`, raw`
          <p class="step-text">For \(x=4\), the line gradient is \(\frac{2-1}{6}=\frac16\), but the derivative is \(\frac12\). So \(x=4\) is rejected.</p>
          <p class="step-text">For \(x=10\),</p>
          <div class="math-block">
            \[
            y=\sqrt{20-4}=4
            \]
            \[
            \frac{4-1}{10+2}=\frac{3}{12}=\frac14
            \]
            \[
            \frac{1}{\sqrt{20-4}}=\frac14
            \]
          </div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">
              \[
              P=(10,4)
              \]
            </div>
          `)}
        `)
      ]
    }),
    "3a": createConfig("3a", "Question Three - quotient rule with cotangent", {
      focus: raw`Use the quotient rule, and remember \(\frac{d}{dx}(\cot x)=-\csc^2x\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Differentiate } y=\frac{\cot x}{x^2+1}.
          \]
        </div>
        <p class="step-text question-note">You do not need to simplify your answer.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          \frac{dy}{dx}
          =
          \frac{-\csc^2x(x^2+1)-2x\cot x}{(x^2+1)^2}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Name numerator and denominator", raw`This is a quotient with \(u=\cot x\) and \(v=x^2+1\).`, raw`
          <div class="math-block">
            \[
            u=\cot x,\qquad u'=-\csc^2x
            \]
            \[
            v=x^2+1,\qquad v'=2x
            \]
          </div>
        `),
        guidedStep("Apply the quotient rule", raw`Use \(\frac{u'v-uv'}{v^2}\).`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            \frac{-\csc^2x(x^2+1)-\cot x(2x)}{(x^2+1)^2}
            \]
          </div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">
              \[
              \frac{dy}{dx}
              =
              \frac{-\csc^2x(x^2+1)-2x\cot x}{(x^2+1)^2}
              \]
            </div>
          `)}
        `)
      ]
    }),
    "3b": createConfig("3b", "Question Three - stationary point on a radical curve", {
      focus: raw`Differentiate \(4\sqrt{x}\) as \(4x^{1/2}\), then set the derivative to zero.`,
      questionHtml: raw`
        <p class="step-text">The graph of the function</p>
        <div class="question-math">
          \[
          y=4\sqrt{x}-x+2,\qquad x>0,
          \]
        </div>
        <p class="step-text">has a stationary point at point \(Q\).</p>
        <p class="step-text">Find the coordinates of point \(Q\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          Q=(4,6)
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Differentiate the function", raw`Use power form for the square root.`, raw`
          <div class="math-block">
            \[
            y=4x^{1/2}-x+2
            \]
            \[
            \frac{dy}{dx}=2x^{-1/2}-1
            \]
            \[
            \frac{dy}{dx}=\frac{2}{\sqrt{x}}-1
            \]
          </div>
        `),
        guidedStep("Set the derivative to zero", raw`Stationary points have zero gradient.`, raw`
          <div class="math-block">
            \[
            \frac{2}{\sqrt{x}}-1=0
            \]
            \[
            \frac{2}{\sqrt{x}}=1
            \]
            \[
            \sqrt{x}=2
            \]
            \[
            x=4
            \]
          </div>
        `),
        guidedStep("Find the y-coordinate", raw`Substitute \(x=4\) into the original equation.`, raw`
          <div class="math-block">
            \[
            y=4\sqrt{4}-4+2
            \]
            \[
            y=8-4+2=6
            \]
          </div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">
              \[
              Q=(4,6)
              \]
            </div>
          `)}
        `)
      ]
    }),
    "3c": createConfig("3c", "Question Three - increasing intervals", {
      focus: raw`A function is increasing where its derivative is positive.`,
      questionHtml: raw`
        <p class="step-text">For what values of \(x\) is the function</p>
        <div class="question-math">
          \[
          y=\frac{x}{x^2+4}
          \]
        </div>
        <p class="step-text">increasing?</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          -2<x<2
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Differentiate with the quotient rule", raw`Use \(u=x\) and \(v=x^2+4\).`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            \frac{(x^2+4)-x(2x)}{(x^2+4)^2}
            \]
            \[
            \frac{dy}{dx}
            =
            \frac{4-x^2}{(x^2+4)^2}
            \]
          </div>
        `),
        guidedStep("Make the derivative positive", raw`The denominator is always positive, so only the numerator controls the sign.`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}>0
            \]
            \[
            \frac{4-x^2}{(x^2+4)^2}>0
            \]
            \[
            4-x^2>0
            \]
          </div>
        `),
        guidedStep("Solve the inequality", raw`Factor or recognise the square inequality.`, raw`
          <div class="math-block">
            \[
            x^2<4
            \]
            \[
            -2<x<2
            \]
          </div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">
              \[
              \text{The function is increasing for }-2<x<2.
              \]
            </div>
          `)}
        `)
      ]
    }),
    "3d": createConfig("3d", "Question Three - quotient rule with a parameter", {
      focus: raw`Differentiate in terms of \(k\), then substitute \(x=3\) and the given gradient.`,
      questionHtml: raw`
        <p class="step-text">A curve has the equation</p>
        <div class="question-math">
          \[
          y=\frac{4x+k}{4x-k},
          \]
        </div>
        <p class="step-text">where \(k\) is a constant and \(x\ne\frac{k}{4}\).</p>
        <p class="step-text">The point \(P\) lies on the curve and has an \(x\)-coordinate of \(3\).</p>
        <p class="step-text">The gradient of the tangent to the curve at \(P\) is \(-\frac{8}{27}\).</p>
        <p class="step-text">Find the possible value(s) of \(k\).</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          k=48\quad\text{or}\quad k=3
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Differentiate in terms of k", raw`Treat \(k\) as a constant.`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            \frac{4(4x-k)-4(4x+k)}{(4x-k)^2}
            \]
            \[
            \frac{dy}{dx}
            =
            \frac{-8k}{(4x-k)^2}
            \]
          </div>
        `),
        guidedStep("Use x equals 3 and the gradient", raw`Substitute \(x=3\) and \(\frac{dy}{dx}=-\frac{8}{27}\).`, raw`
          <div class="math-block">
            \[
            -\frac{8}{27}
            =
            \frac{-8k}{(12-k)^2}
            \]
            \[
            \frac{1}{27}
            =
            \frac{k}{(12-k)^2}
            \]
          </div>
        `),
        guidedStep("Solve the quadratic", raw`Cross-multiply, expand, and factorise.`, raw`
          <div class="math-block">
            \[
            (12-k)^2=27k
            \]
            \[
            144-24k+k^2=27k
            \]
            \[
            k^2-51k+144=0
            \]
            \[
            (k-48)(k-3)=0
            \]
            \[
            k=48,\quad k=3
            \]
          </div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">
              \[
              k=48\quad\text{or}\quad k=3
              \]
            </div>
          `)}
        `)
      ]
    }),
    "3e": createConfig("3e", "Question Three - lamp and table optimisation", {
      focus: raw`Rewrite the illumination formula using only \(h\) and the fixed table radius \(r\), then differentiate with respect to \(h\).`,
      questionHtml: raw`
        <p class="step-text">A lamp is suspended above the centre of a round table of radius \(r\). The height, \(h\), of the lamp above the table is adjustable.</p>
        ${lampTableDiagramHtml()}
        <p class="step-text">Point \(P\) is on the edge of the table.</p>
        <p class="step-text">At point \(P\), the illumination \(I\) is directly proportional to the cosine of angle \(\theta\) in the above diagram, and inversely proportional to the square of the distance, \(S\), to the lamp.</p>
        <div class="question-math">
          \[
          I=\frac{k\cos\theta}{S^2},
          \]
        </div>
        <p class="step-text">where \(k\) is a constant.</p>
        <p class="step-text">Prove that the edge of the table will have maximum illumination when \(h=\frac{r}{\sqrt{2}}\).</p>
        <p class="step-text question-note">You do not need to prove that your solution gives the maximum value. You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          h=\frac{r}{\sqrt{2}}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Rewrite the geometry", raw`Use the right triangle in the diagram.`, raw`
          <div class="math-block">
            \[
            \cos\theta=\frac{h}{S}
            \]
            \[
            S^2=h^2+r^2
            \]
            \[
            S=(h^2+r^2)^{1/2}
            \]
          </div>
        `),
        guidedStep("Make I a function of h", raw`Substitute \(\cos\theta=\frac{h}{S}\) into the given formula.`, raw`
          <div class="math-block">
            \[
            I=\frac{k\cos\theta}{S^2}
            =
            \frac{k\frac{h}{S}}{S^2}
            =
            \frac{kh}{S^3}
            \]
            \[
            I=\frac{kh}{(h^2+r^2)^{3/2}}
            \]
          </div>
        `),
        guidedStep("Differentiate with respect to h", raw`Treat \(k\) and \(r\) as constants.`, raw`
          <div class="math-block">
            \[
            I=kh(h^2+r^2)^{-3/2}
            \]
            \[
            \frac{dI}{dh}
            =
            k(h^2+r^2)^{-3/2}
            -
            3kh^2(h^2+r^2)^{-5/2}
            \]
          </div>
        `),
        guidedStep("Set the derivative to zero", raw`Multiply by the positive factor \((h^2+r^2)^{5/2}\) to clear powers.`, raw`
          <div class="math-block">
            \[
            k(h^2+r^2)^{-3/2}
            -
            3kh^2(h^2+r^2)^{-5/2}=0
            \]
            \[
            k(h^2+r^2)-3kh^2=0
            \]
            \[
            h^2+r^2=3h^2
            \]
            \[
            2h^2=r^2
            \]
          </div>
        `),
        guidedStep("Solve for h", raw`Height is positive, so take the positive square root.`, raw`
          <div class="math-block">
            \[
            h^2=\frac{r^2}{2}
            \]
            \[
            h=\frac{r}{\sqrt{2}}
            \]
          </div>
          ${answerHighlight("Final answer", raw`
            <div class="math-block">
              \[
              \text{Maximum illumination occurs when }h=\frac{r}{\sqrt{2}}.
              \]
            </div>
          `)}
        `)
      ]
    })
  };
}());
