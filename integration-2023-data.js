(function () {
  const raw = String.raw;
  const paperHref = "level-3-integration-2023.html";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return "int-" + id + "2023.html";
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
      browserTitle: "2023 Integration Paper — " + questionLabel(id),
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

  function smoothQuadraticPath(points, scale) {
    if (!points.length) {
      return "";
    }

    if (points.length === 1) {
      return "M " + scale.x(points[0][0]) + " " + scale.y(points[0][1]);
    }

    let path = "M " + scale.x(points[0][0]) + " " + scale.y(points[0][1]);

    for (let index = 1; index < points.length - 1; index += 1) {
      const control = points[index];
      const next = points[index + 1];
      const midX = (control[0] + next[0]) / 2;
      const midY = (control[1] + next[1]) / 2;
      path += " Q " + scale.x(control[0]) + " " + scale.y(control[1]) + " " + scale.x(midX) + " " + scale.y(midY);
    }

    const last = points[points.length - 1];
    path += " T " + scale.x(last[0]) + " " + scale.y(last[1]);
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

  function draw1cGraph() {
    const svg = document.getElementById("question-graph-1c-int-2023");

    if (!svg) {
      return;
    }

    const width = 460;
    const height = 300;
    const padding = 32;
    const scale = createScale(width, height, padding, -0.35, 6.5, -0.45, 5.05);
    const topPath = functionPath(function (x) {
      return Math.sqrt(x);
    }, 0, 6.1, 0.03, scale);
    const bottomPath = functionPath(function (x) {
      return x * x / 8;
    }, 0, 6.1, 0.03, scale);
    const shadePath = shadedBetweenPath(function (x) {
      return Math.sqrt(x);
    }, function (x) {
      return x * x / 8;
    }, 0, 4, 0.03, scale);

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -0.35, 0, 6.5, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -0.45, 0, 5.05, "graph-axis")}
      <path class="question-shade" d="${shadePath}"></path>
      <path class="question-curve" d="${topPath}"></path>
      <path class="question-curve" d="${bottomPath}"></path>
      ${circleMarkup(scale, 0, 0, 4.2, "question-origin")}
      ${textMarkup(scale, 6.42, -0.12, "x", "question-axis-label", ' text-anchor="end"')}
      ${textMarkup(scale, -0.03, 4.9, "y", "question-axis-label")}
      ${textMarkup(scale, 1.48, 1.7, "y = sqrt(x)", "graph-equation-label")}
      ${textMarkup(scale, 4.95, 3.25, "8y = x^2", "graph-equation-label", ' text-anchor="middle"')}
      <rect class="graph-chip" x="304" y="30" width="118" height="44" rx="12"></rect>
      <text class="graph-label" x="363" y="48" text-anchor="middle">Diagram is</text>
      <text class="graph-label" x="363" y="66" text-anchor="middle">not to scale</text>
    `;
  }

  function draw1eGraph() {
    const svg = document.getElementById("question-graph-1e-int-2023");

    if (!svg) {
      return;
    }

    const width = 520;
    const height = 320;
    const padding = 30;
    const scale = createScale(width, height, padding, -2, 11.2, -4.2, 4.2);
    const upperParabola = functionPath(function (x) {
      return Math.sqrt(10 - x);
    }, -0.8, 10, 0.04, scale);
    const lowerParabola = functionPath(function (x) {
      return -Math.sqrt(10 - x);
    }, -0.8, 10, 0.04, scale);
    const sinePath = functionPath(function (x) {
      return -Math.sin(Math.PI * x / 10);
    }, -0.2, 10.9, 0.04, scale);
    const linePath = functionPath(function (x) {
      return 3 * x;
    }, -1.1, 1.55, 0.04, scale);
    const topPoints = functionPoints(function (x) {
      return Math.sqrt(10 - x);
    }, 1, 10, 0.04);
    const bottomPoints = functionPoints(function (x) {
      return -Math.sin(Math.PI * x / 10);
    }, 0, 10, 0.04).reverse();

    let shadePath = "M " + scale.x(0) + " " + scale.y(0);
    shadePath += " L " + scale.x(1) + " " + scale.y(3);

    topPoints.slice(1).forEach(function (point) {
      shadePath += " L " + scale.x(point[0]) + " " + scale.y(point[1]);
    });

    bottomPoints.forEach(function (point) {
      shadePath += " L " + scale.x(point[0]) + " " + scale.y(point[1]);
    });

    shadePath += " Z";

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -2, 0, 11.2, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -4.2, 0, 4.2, "graph-axis")}
      <path class="question-shade" d="${shadePath}"></path>
      <path class="question-curve" d="${upperParabola}"></path>
      <path class="question-curve" d="${lowerParabola}"></path>
      <path class="question-curve" d="${sinePath}"></path>
      <path class="question-curve" d="${linePath}"></path>
      ${circleMarkup(scale, 0, 0, 4.2, "question-origin")}
      ${textMarkup(scale, 11.05, -0.1, "x", "question-axis-label", ' text-anchor="end"')}
      ${textMarkup(scale, -0.06, 4.02, "y", "question-axis-label")}
      ${textMarkup(scale, 7.6, 1.55, "y^2 = 10 - x", "graph-equation-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 1.58, 3.46, "y = 3x", "graph-equation-label")}
      ${textMarkup(scale, 1.8, -1.05, "y = -sin(pi x / 10)", "graph-equation-label")}
      <rect class="graph-chip" x="366" y="28" width="118" height="44" rx="12"></rect>
      <text class="graph-label" x="425" y="46" text-anchor="middle">Diagram is</text>
      <text class="graph-label" x="425" y="64" text-anchor="middle">not to scale</text>
    `;
  }

  function draw3aGraph() {
    const svg = document.getElementById("question-graph-3a-int-2023");

    if (!svg) {
      return;
    }

    const width = 560;
    const height = 330;
    const padding = 28;
    const scale = createScale(width, height, padding, -1.4, 13.6, -3.2, 19);
    const topPoints = [
      [0, 10],
      [3, 13],
      [6, 16],
      [9, 15],
      [12, 14]
    ];
    const topCurve = smoothQuadraticPath(topPoints, scale);
    const shadePath = topCurve
      + " L " + scale.x(12) + " " + scale.y(0)
      + " L " + scale.x(0) + " " + scale.y(0)
      + " Z";

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      <path class="question-shade" d="${shadePath}"></path>
      <path class="question-curve" d="${topCurve}"></path>
      <rect class="graph-soil" x="${scale.x(-0.95)}" y="${scale.y(-2.5)}" width="${fmt(scale.x(12.95) - scale.x(-0.95))}" height="${fmt(scale.y(-0.05) - scale.y(-2.5))}" rx="0"></rect>
      <path class="graph-measure" d="M ${scale.x(-0.95)} ${scale.y(0)} L ${scale.x(12.95)} ${scale.y(0)}"></path>
      ${[0, 3, 6, 9, 12].map(function (xValue, index) {
        const heightValue = topPoints[index][1];
        return `
          ${lineMarkup(scale, xValue, 0, xValue, heightValue, "graph-guide")}
          ${textMarkup(scale, xValue + 0.1, heightValue / 2 + 0.15, heightValue + " metres", "graph-label")}
        `;
      }).join("")}
      ${[1.5, 4.5, 7.5, 10.5].map(function (xValue) {
        return textMarkup(scale, xValue, 0.6, "3 metres", "graph-label", ' text-anchor="middle"');
      }).join("")}
      ${textMarkup(scale, 6, -1.2, "path", "graph-label", ' text-anchor="middle"')}
      <rect class="graph-chip" x="80" y="32" width="118" height="52" rx="12"></rect>
      <text class="graph-label" x="139" y="52" text-anchor="middle">Diagram is</text>
      <text class="graph-label" x="139" y="71" text-anchor="middle">not to scale</text>
    `;
  }

  function draw3cGraph() {
    const svg = document.getElementById("question-graph-3c-int-2023");

    if (!svg) {
      return;
    }

    const width = 470;
    const height = 300;
    const padding = 32;
    const xMax = Math.PI / 3;
    const scale = createScale(width, height, padding, -0.08, xMax + 0.11, -0.55, 5.2);
    const fn = function (x) {
      return 5 * Math.sin(3 * x) * Math.sin(x);
    };
    const curvePath = functionPath(fn, 0, xMax + 0.05, 0.006, scale);
    const shadePath = shadedAreaPath(fn, 0, xMax, 0, 0.006, scale);

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -0.08, 0, xMax + 0.11, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -0.55, 0, 5.2, "graph-axis")}
      <path class="question-shade" d="${shadePath}"></path>
      <path class="question-curve" d="${curvePath}"></path>
      ${circleMarkup(scale, 0, 0, 4.2, "question-origin")}
      ${textMarkup(scale, xMax, -0.15, "pi/3", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, xMax + 0.095, -0.06, "x", "question-axis-label", ' text-anchor="end"')}
      ${textMarkup(scale, -0.03, 5.02, "y", "question-axis-label")}
      ${textMarkup(scale, 0.63, 4.25, "y = 5 sin(3x) sin(x)", "graph-equation-label", ' text-anchor="middle"')}
      <rect class="graph-chip" x="318" y="28" width="118" height="44" rx="12"></rect>
      <text class="graph-label" x="377" y="46" text-anchor="middle">Diagram is</text>
      <text class="graph-label" x="377" y="64" text-anchor="middle">not to scale</text>
    `;
  }

  const walkthroughs = {};

  walkthroughs["1a"] = createConfig("1a", "2023 Paper — Term-by-term antiderivative", {
    focus: raw`Split the integral into three familiar pieces, then integrate each part separately.`,
    questionHtml: raw`
      <div class="question-math">
        \[
        \text{Find } \int \left(3x+2+\frac{1}{3x+2}\right)\,dx.
        \]
      </div>
    `,
    questionNotes: [
      raw`Keep the constant of integration because this is an indefinite integral.`
    ],
    hints: [
      raw`This integrand is already a sum, so you can integrate it term by term.`,
      raw`The first two terms use the power rule, while \(\frac{1}{3x+2}\) gives a logarithm.`,
      raw`For \(\int \frac{1}{3x+2}\,dx\), divide by the inside derivative \(3\).`
    ],
    answerHtml: raw`
      <p class="step-text">Split the integral first:</p>
      <div class="math-block">
        \[
        \int \left(3x+2+\frac{1}{3x+2}\right)\,dx
        =
        \int 3x\,dx + \int 2\,dx + \int \frac{1}{3x+2}\,dx
        \]
      </div>
      <p class="step-text">Now integrate each term:</p>
      <div class="math-block">
        \[
        \int 3x\,dx = \frac{3x^2}{2}
        \qquad
        \int 2\,dx = 2x
        \]
        \[
        \int \frac{1}{3x+2}\,dx = \frac{1}{3}\ln|3x+2|
        \]
      </div>
      <p class="step-text">So the full antiderivative is</p>
      <div class="math-block">
        \[
        \int \left(3x+2+\frac{1}{3x+2}\right)\,dx
        =
        \frac{3x^2}{2}+2x+\frac{1}{3}\ln|3x+2|+C
        \]
      </div>
    `,
    guidedSteps: [
      {
        title: raw`Split the integrand`,
        previewHtml: raw`A sum inside an integral can be split into separate integrals.`,
        workingHtml: raw`<p class="step-text">A sum inside an integral can be split into separate integrals.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \int 3x\,dx + \int 2\,dx + \int \frac{1}{3x+2}\,dx
        \]
</div>`
      },
      {
        title: raw`Handle the logarithm term`,
        previewHtml: raw`The derivative of \(3x+2\) is \(3\), so we divide by \(3\).`,
        workingHtml: raw`<p class="step-text">The derivative of \(3x+2\) is \(3\), so we divide by \(3\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{1}{3}\ln|3x+2|+C
        \]
</div>`
      },
      {
        title: raw`Assemble the final result`,
        previewHtml: raw`Each term has been integrated properly.`,
        workingHtml: raw`<p class="step-text">Each term has been integrated properly.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{3x^2}{2}+2x+\frac{1}{3}\ln|3x+2|+C
        \]
</div>

      <p class="step-text">Split the integral first:</p>
      <div class="math-block">
        \[
        \int \left(3x+2+\frac{1}{3x+2}\right)\,dx
        =
        \int 3x\,dx + \int 2\,dx + \int \frac{1}{3x+2}\,dx
        \]
      </div>
      <p class="step-text">Now integrate each term:</p>
      <div class="math-block">
        \[
        \int 3x\,dx = \frac{3x^2}{2}
        \qquad
        \int 2\,dx = 2x
        \]
        \[
        \int \frac{1}{3x+2}\,dx = \frac{1}{3}\ln|3x+2|
        \]
      </div>
      <p class="step-text">So the full antiderivative is</p>
      <div class="math-block">
        \[
        \int \left(3x+2+\frac{1}{3x+2}\right)\,dx
        =
        \frac{3x^2}{2}+2x+\frac{1}{3}\ln|3x+2|+C
        \]
      </div>
    `
      }
    ]
  });

  walkthroughs["1b"] = createConfig("1b", "2023 Paper — Position from a velocity model", {
    focus: raw`Velocity is the derivative of position, so integrate first, then use the starting position to find the constant.`,
    questionHtml: raw`
      <p class="step-text">An object’s velocity can be modelled by</p>
      <div class="question-math">
        \[
        v(t)=\sec^2 t,
        \]
      </div>
      <p class="step-text">where \(v\) is measured in km hr\(^{-1}\) and \(t\) is the time in hours from the start of timing.</p>
      <p class="step-text">Initially the object was \(3\) km from a point \(P\).</p>
      <p class="step-text">Find the distance of this object from the point \(P\) after \(\frac{\pi}{4}\) hours.</p>
    `,
    questionNotes: [
      raw`Use calculus and show the integration needed to solve the problem.`
    ],
    hints: [
      raw`If \(v(t)=\frac{ds}{dt}\), then the distance function \(s(t)\) is an antiderivative of \(\sec^2 t\).`,
      raw`\(\int \sec^2 t\,dt = \tan t + C\).`,
      raw`Use \(s(0)=3\) before substituting \(t=\frac{\pi}{4}\).`
    ],
    answerHtml: raw`
      <p class="step-text">Because velocity is the derivative of position, start with</p>
      <div class="math-block">
        \[
        \frac{ds}{dt}=\sec^2 t
        \]
        \[
        s(t)=\int \sec^2 t\,dt
        \]
        \[
        s(t)=\tan t + C
        \]
      </div>
      <p class="step-text">Use the initial distance \(s(0)=3\):</p>
      <div class="math-block">
        \[
        3=\tan 0 + C
        \]
        \[
        3=0+C
        \]
        \[
        C=3
        \]
      </div>
      <p class="step-text">So the distance function is</p>
      <div class="math-block">
        \[
        s(t)=\tan t + 3
        \]
      </div>
      <p class="step-text">Now substitute \(t=\frac{\pi}{4}\):</p>
      <div class="math-block">
        \[
        s\!\left(\frac{\pi}{4}\right)=\tan\!\left(\frac{\pi}{4}\right)+3=1+3=4
        \]
      </div>
      <p class="step-text">The object is \(4\) km from \(P\) after \(\frac{\pi}{4}\) hours.</p>
    `,
    guidedSteps: [
      {
        title: raw`Find the position function`,
        previewHtml: raw`Position is found by integrating the velocity.`,
        workingHtml: raw`<p class="step-text">Position is found by integrating the velocity.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          s(t)=\int \sec^2 t\,dt=\tan t + C
        \]
</div>`
      },
      {
        title: raw`Use the initial distance`,
        previewHtml: raw`\(\tan 0=0\), so the constant must be \(3\).`,
        workingHtml: raw`
          <div class="math-block">
            \[
            s(t)=\tan t + C
            \]
            \[
            3=s(0)=\tan 0 + C
            \]
          </div>

<p class="step-text">\(\tan 0=0\), so the constant must be \(3\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  3
  \]
</div>
</div>`
      },
      {
        title: raw`Evaluate the distance`,
        previewHtml: raw`\(s\left(\frac{\pi}{4}\right)=1+3=4\).`,
        workingHtml: raw`<p class="step-text">\(s\left(\frac{\pi}{4}\right)=1+3=4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          4\text{ km}
        \]
</div>

      <p class="step-text">Because velocity is the derivative of position, start with</p>
      <div class="math-block">
        \[
        \frac{ds}{dt}=\sec^2 t
        \]
        \[
        s(t)=\int \sec^2 t\,dt
        \]
        \[
        s(t)=\tan t + C
        \]
      </div>
      <p class="step-text">Use the initial distance \(s(0)=3\):</p>
      <div class="math-block">
        \[
        3=\tan 0 + C
        \]
        \[
        3=0+C
        \]
        \[
        C=3
        \]
      </div>
      <p class="step-text">So the distance function is</p>
      <div class="math-block">
        \[
        s(t)=\tan t + 3
        \]
      </div>
      <p class="step-text">Now substitute \(t=\frac{\pi}{4}\):</p>
      <div class="math-block">
        \[
        s\!\left(\frac{\pi}{4}\right)=\tan\!\left(\frac{\pi}{4}\right)+3=1+3=4
        \]
      </div>
      <p class="step-text">The object is \(4\) km from \(P\) after \(\frac{\pi}{4}\) hours.</p>
    `
      }
    ]
  });

  walkthroughs["1c"] = createConfig("1c", "2023 Paper — Area between \u221ax and x\u00b2/8", {
    focus: raw`Find the intersection points first, then integrate top minus bottom over that interval.`,
    questionHtml: raw`
      <p class="step-text">The graph below shows the functions \(y=\sqrt{x}\) and \(8y=x^2\).</p>
      <div class="graph-frame question-graph-frame">
        <svg id="question-graph-1c-int-2023" class="graph-svg" viewBox="0 0 460 300" aria-label="Shaded region between y equals square root x and 8y equals x squared" role="img"></svg>
      </div>
      <p class="step-text">Find the shaded area.</p>
    `,
    questionNotes: [
      raw`Use calculus and show the integration needed to solve the problem.`
    ],
    hints: [
      raw`Rewrite \(8y=x^2\) as \(y=\frac{x^2}{8}\).`,
      raw`Find where the curves intersect by solving \(\sqrt{x}=\frac{x^2}{8}\).`,
      raw`From \(x=0\) to \(x=4\), the upper curve is \(y=\sqrt{x}\).`
    ],
    answerHtml: raw`
      <p class="step-text">Start by finding the intersection points:</p>
      <div class="math-block">
        \[
        \sqrt{x}=\frac{x^2}{8}
        \]
        \[
        8\sqrt{x}=x^2
        \]
        \[
        64x=x^4
        \]
        \[
        x(x^3-64)=0
        \]
        \[
        x=0 \text{ or } x=4
        \]
      </div>
      <p class="step-text">On \(0\le x\le4\), \(\sqrt{x}\) is above \(\frac{x^2}{8}\), so</p>
      <div class="math-block">
        \[
        A=\int_0^4\left(\sqrt{x}-\frac{x^2}{8}\right)\,dx
        \]
        \[
        A=\int_0^4\left(x^{1/2}-\frac{x^2}{8}\right)\,dx
        \]
      </div>
      <p class="step-text">Integrate term by term:</p>
      <div class="math-block">
        \[
        A=\left[\frac{2}{3}x^{3/2}-\frac{x^3}{24}\right]_0^4
        \]
        \[
        A=\left(\frac{2}{3}\cdot 4^{3/2}-\frac{4^3}{24}\right)-0
        \]
        \[
        A=\frac{16}{3}-\frac{8}{3}=\frac{8}{3}
        \]
      </div>
      <p class="step-text">So the shaded area is \(\frac{8}{3}\text{ units}^2\).</p>
    `,
    afterRender: draw1cGraph,
    guidedSteps: [
      {
        title: raw`Find the non-zero intersection`,
        previewHtml: raw`Solving \(x^3=64\) gives \(x=4\).`,
        workingHtml: raw`
          <div class="math-block">
            \[
            \sqrt{x}=\frac{x^2}{8}
            \]
            \[
            64x=x^4
            \]
          </div>

<p class="step-text">Solving \(x^3=64\) gives \(x=4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  4
  \]
</div>
</div>`
      },
      {
        title: raw`Set up top minus bottom`,
        previewHtml: raw`On this interval, \(\sqrt{x}\) is the upper curve.`,
        workingHtml: raw`<p class="step-text">On this interval, \(\sqrt{x}\) is the upper curve.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \int_0^4\left(\sqrt{x}-\frac{x^2}{8}\right)\,dx
        \]
</div>`
      },
      {
        title: raw`Evaluate the area`,
        previewHtml: raw`\(\frac{16}{3}-\frac{8}{3}=\frac{8}{3}\).`,
        workingHtml: raw`<p class="step-text">\(\frac{16}{3}-\frac{8}{3}=\frac{8}{3}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{8}{3}\text{ units}^2
        \]
</div>

      <p class="step-text">Start by finding the intersection points:</p>
      <div class="math-block">
        \[
        \sqrt{x}=\frac{x^2}{8}
        \]
        \[
        8\sqrt{x}=x^2
        \]
        \[
        64x=x^4
        \]
        \[
        x(x^3-64)=0
        \]
        \[
        x=0 \text{ or } x=4
        \]
      </div>
      <p class="step-text">On \(0\le x\le4\), \(\sqrt{x}\) is above \(\frac{x^2}{8}\), so</p>
      <div class="math-block">
        \[
        A=\int_0^4\left(\sqrt{x}-\frac{x^2}{8}\right)\,dx
        \]
        \[
        A=\int_0^4\left(x^{1/2}-\frac{x^2}{8}\right)\,dx
        \]
      </div>
      <p class="step-text">Integrate term by term:</p>
      <div class="math-block">
        \[
        A=\left[\frac{2}{3}x^{3/2}-\frac{x^3}{24}\right]_0^4
        \]
        \[
        A=\left(\frac{2}{3}\cdot 4^{3/2}-\frac{4^3}{24}\right)-0
        \]
        \[
        A=\frac{16}{3}-\frac{8}{3}=\frac{8}{3}
        \]
      </div>
      <p class="step-text">So the shaded area is \(\frac{8}{3}\text{ units}^2\).</p>
    `
      }
    ]
  });

  walkthroughs["1d"] = createConfig("1d", "2023 Paper — Separable differential equation with a positive solution", {
    focus: raw`Separate the variables first, then use the initial condition to fix the constant and the sign of the solution.`,
    questionHtml: raw`
      <p class="step-text">Consider the differential equation</p>
      <div class="question-math">
        \[
        \frac{dy}{dx}=y(2x-3x^2).
        \]
      </div>
      <p class="step-text">Given that \(y=1\) when \(x=2\), find the value of \(y\) when \(x=1\).</p>
    `,
    questionNotes: [
      raw`Use calculus and show the integration needed to solve the problem.`
    ],
    hints: [
      raw`Move the \(y\) to the left so the variables are separated.`,
      raw`Integrating gives \(\ln|y| = x^2 - x^3 + C\).`,
      raw`Because the initial value is \(y=1\), the solution stays positive here, so the final answer is not negative.`
    ],
    answerHtml: raw`
      <p class="step-text">Separate the variables:</p>
      <div class="math-block">
        \[
        \frac{1}{y}\,dy=(2x-3x^2)\,dx
        \]
      </div>
      <p class="step-text">Integrate both sides:</p>
      <div class="math-block">
        \[
        \int \frac{1}{y}\,dy = \int (2x-3x^2)\,dx
        \]
        \[
        \ln|y| = x^2 - x^3 + C
        \]
      </div>
      <p class="step-text">Use \(y=1\) when \(x=2\):</p>
      <div class="math-block">
        \[
        \ln|1| = 2^2 - 2^3 + C
        \]
        \[
        0 = 4 - 8 + C
        \]
        \[
        C=4
        \]
      </div>
      <p class="step-text">Now substitute \(x=1\):</p>
      <div class="math-block">
        \[
        \ln|y| = 1^2 - 1^3 + 4 = 4
        \]
        \[
        |y|=e^4
        \]
      </div>
      <p class="step-text">Since the solution started with the positive value \(y=1\), we take the positive branch.</p>
      <div class="math-block">
        \[
        y=e^4
        \]
      </div>
    `,
    guidedSteps: [
      {
        title: raw`Separate the variables`,
        previewHtml: raw`Now each side contains only one variable.`,
        workingHtml: raw`<p class="step-text">Now each side contains only one variable.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{1}{y}\,dy = (2x-3x^2)\,dx
        \]
</div>`
      },
      {
        title: raw`Use the initial condition`,
        previewHtml: raw`Since \(\ln 1 = 0\), we get \(0 = 4 - 8 + C\), so \(C=4\).`,
        workingHtml: raw`
          <div class="math-block">
            \[
            \ln|y| = x^2 - x^3 + C
            \]
            \[
            \ln|1| = 2^2 - 2^3 + C
            \]
          </div>

<p class="step-text">Since \(\ln 1 = 0\), we get \(0 = 4 - 8 + C\), so \(C=4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  4
  \]
</div>
</div>`
      },
      {
        title: raw`Find the value of y`,
        previewHtml: raw`At \(x=1\), \(\ln|y|=4\), and the positive branch gives \(y=e^4\).`,
        workingHtml: raw`<p class="step-text">At \(x=1\), \(\ln|y|=4\), and the positive branch gives \(y=e^4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          e^4
        \]
</div>

      <p class="step-text">Separate the variables:</p>
      <div class="math-block">
        \[
        \frac{1}{y}\,dy=(2x-3x^2)\,dx
        \]
      </div>
      <p class="step-text">Integrate both sides:</p>
      <div class="math-block">
        \[
        \int \frac{1}{y}\,dy = \int (2x-3x^2)\,dx
        \]
        \[
        \ln|y| = x^2 - x^3 + C
        \]
      </div>
      <p class="step-text">Use \(y=1\) when \(x=2\):</p>
      <div class="math-block">
        \[
        \ln|1| = 2^2 - 2^3 + C
        \]
        \[
        0 = 4 - 8 + C
        \]
        \[
        C=4
        \]
      </div>
      <p class="step-text">Now substitute \(x=1\):</p>
      <div class="math-block">
        \[
        \ln|y| = 1^2 - 1^3 + 4 = 4
        \]
        \[
        |y|=e^4
        \]
      </div>
      <p class="step-text">Since the solution started with the positive value \(y=1\), we take the positive branch.</p>
      <div class="math-block">
        \[
        y=e^4
        \]
      </div>
    `
      }
    ]
  });

  walkthroughs["1e"] = createConfig("1e", "2023 Paper — Composite area bounded by three curves", {
    focus: raw`Follow the PDF strategy: find the key intersections, integrate the large curved region first, then subtract the small cap above \(y=3x\).`,
    questionHtml: raw`
      <p class="step-text">The shaded region is bounded by the three graphs</p>
      <div class="question-math">
        \[
        y^2=10-x,\qquad y=3x,\qquad y=-\sin\left(\frac{\pi x}{10}\right).
        \]
      </div>
      <div class="graph-frame question-graph-frame">
        <svg id="question-graph-1e-int-2023" class="graph-svg" viewBox="0 0 520 320" aria-label="Shaded region bounded by y squared equals 10 minus x, y equals 3x, and y equals negative sine of pi x over 10" role="img"></svg>
      </div>
      <p class="step-text">Find the area of the shaded region.</p>
    `,
    questionNotes: [
      raw`Use calculus and show the integration needed to solve the problem.`
    ],
    hints: [
      raw`The important intersection \(x\)-values are \(0\), \(1\), and \(10\).`,
      raw`A clean way through is to take the whole region between \(y=\sqrt{10-x}\) and \(y=-\sin\left(\frac{\pi x}{10}\right)\) from \(x=0\) to \(x=10\).`,
      raw`Then subtract the small region between \(y=\sqrt{10-x}\) and \(y=3x\) from \(x=0\) to \(x=1\).`
    ],
    answerHtml: raw`
      <p class="step-text">First find the key intersections:</p>
      <div class="math-block">
        \[
        3x=-\sin\left(\frac{\pi x}{10}\right) \Rightarrow x=0
        \]
        \[
        y^2=10-x \text{ and } y=-\sin\left(\frac{\pi x}{10}\right) \Rightarrow x=10,\ y=0
        \]
        \[
        3x=\sqrt{10-x}
        \Rightarrow 9x^2=10-x
        \Rightarrow 9x^2+x-10=0
        \Rightarrow x=1
        \]
      </div>
      <p class="step-text">Now use the large-region-minus-small-cap strategy:</p>
      <div class="math-block">
        \[
        A=
        \int_0^{10}\left(\sqrt{10-x}+\sin\left(\frac{\pi x}{10}\right)\right)\,dx
        -
        \int_0^1\left(\sqrt{10-x}-3x\right)\,dx
        \]
      </div>
      <p class="step-text">Evaluate the large curved region first:</p>
      <div class="math-block">
        \[
        \int_0^{10}\left(\sqrt{10-x}+\sin\left(\frac{\pi x}{10}\right)\right)\,dx
        =
        \left[-\frac{2}{3}(10-x)^{3/2}-\frac{10}{\pi}\cos\left(\frac{\pi x}{10}\right)\right]_0^{10}
        \]
        \[
        =
        \frac{20\sqrt{10}}{3}+\frac{20}{\pi}
        \approx 27.448
        \]
      </div>
      <p class="step-text">Now subtract the cap above \(y=3x\):</p>
      <div class="math-block">
        \[
        \int_0^1\left(\sqrt{10-x}-3x\right)\,dx
        =
        \left[-\frac{2}{3}(10-x)^{3/2}-\frac{3x^2}{2}\right]_0^1
        \]
        \[
        =
        \frac{20\sqrt{10}}{3}-\frac{39}{2}
        \approx 1.58185
        \]
      </div>
      <p class="step-text">So the shaded area is</p>
      <div class="math-block">
        \[
        A=
        \left(\frac{20\sqrt{10}}{3}+\frac{20}{\pi}\right)
        -
        \left(\frac{20\sqrt{10}}{3}-\frac{39}{2}\right)
        =
        \frac{39}{2}+\frac{20}{\pi}
        \approx 25.866
        \]
      </div>
    `,
    afterRender: draw1eGraph,
    guidedSteps: [
      {
        title: raw`Find the key intersection values`,
        previewHtml: raw`Those are the points where the boundary changes.`,
        workingHtml: raw`<p class="step-text">Those are the points where the boundary changes.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          x=0,\ 1,\ 10
        \]
</div>`
      },
      {
        title: raw`Identify the region strategy`,
        previewHtml: raw`Start with the full curved region, then subtract the small cap above the line.`,
        workingHtml: raw`<p class="step-text">Start with the full curved region, then subtract the small cap above the line.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \int_0^{10}\left(\sqrt{10-x}+\sin\left(\frac{\pi x}{10}\right)\right)\,dx
          -
          \int_0^1\left(\sqrt{10-x}-3x\right)\,dx
        \]
</div>`
      },
      {
        title: raw`Evaluate the large curved region`,
        previewHtml: raw`This is about \(27.448\).`,
        workingHtml: raw`<p class="step-text">This is about \(27.448\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{20\sqrt{10}}{3}+\frac{20}{\pi}
        \]
</div>`
      },
      {
        title: raw`Subtract the cap and finish`,
        previewHtml: raw`Subtracting the cap leaves the shaded region only.`,
        workingHtml: raw`<p class="step-text">Subtracting the cap leaves the shaded region only.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{39}{2}+\frac{20}{\pi}
          \approx 25.866
        \]
</div>

      <p class="step-text">First find the key intersections:</p>
      <div class="math-block">
        \[
        3x=-\sin\left(\frac{\pi x}{10}\right) \Rightarrow x=0
        \]
        \[
        y^2=10-x \text{ and } y=-\sin\left(\frac{\pi x}{10}\right) \Rightarrow x=10,\ y=0
        \]
        \[
        3x=\sqrt{10-x}
        \Rightarrow 9x^2=10-x
        \Rightarrow 9x^2+x-10=0
        \Rightarrow x=1
        \]
      </div>
      <p class="step-text">Now use the large-region-minus-small-cap strategy:</p>
      <div class="math-block">
        \[
        A=
        \int_0^{10}\left(\sqrt{10-x}+\sin\left(\frac{\pi x}{10}\right)\right)\,dx
        -
        \int_0^1\left(\sqrt{10-x}-3x\right)\,dx
        \]
      </div>
      <p class="step-text">Evaluate the large curved region first:</p>
      <div class="math-block">
        \[
        \int_0^{10}\left(\sqrt{10-x}+\sin\left(\frac{\pi x}{10}\right)\right)\,dx
        =
        \left[-\frac{2}{3}(10-x)^{3/2}-\frac{10}{\pi}\cos\left(\frac{\pi x}{10}\right)\right]_0^{10}
        \]
        \[
        =
        \frac{20\sqrt{10}}{3}+\frac{20}{\pi}
        \approx 27.448
        \]
      </div>
      <p class="step-text">Now subtract the cap above \(y=3x\):</p>
      <div class="math-block">
        \[
        \int_0^1\left(\sqrt{10-x}-3x\right)\,dx
        =
        \left[-\frac{2}{3}(10-x)^{3/2}-\frac{3x^2}{2}\right]_0^1
        \]
        \[
        =
        \frac{20\sqrt{10}}{3}-\frac{39}{2}
        \approx 1.58185
        \]
      </div>
      <p class="step-text">So the shaded area is</p>
      <div class="math-block">
        \[
        A=
        \left(\frac{20\sqrt{10}}{3}+\frac{20}{\pi}\right)
        -
        \left(\frac{20\sqrt{10}}{3}-\frac{39}{2}\right)
        =
        \frac{39}{2}+\frac{20}{\pi}
        \approx 25.866
        \]
      </div>
    `
      }
    ]
  });

  walkthroughs["2a"] = createConfig("2a", "2023 Paper — Reverse chain rule with an exponential", {
    focus: raw`Look for the derivative of the exponent and divide by its coefficient when you integrate.`,
    questionHtml: raw`
      <div class="question-math">
        \[
        \text{Find } \int 4e^{2x-1}\,dx.
        \]
      </div>
    `,
    questionNotes: [
      raw`Keep the constant of integration.`
    ],
    hints: [
      raw`The exponent is \(2x-1\), whose derivative is \(2\).`,
      raw`That means the antiderivative of \(e^{2x-1}\) is \(\frac{1}{2}e^{2x-1}\).`,
      raw`The outside \(4\) then becomes \(4\times\frac{1}{2}=2\).`
    ],
    answerHtml: raw`
      <p class="step-text">Use the reverse chain rule:</p>
      <div class="math-block">
        \[
        \frac{d}{dx}(2x-1)=2
        \]
        \[
        \int e^{2x-1}\,dx=\frac{1}{2}e^{2x-1}+C
        \]
      </div>
      <p class="step-text">Now include the factor \(4\):</p>
      <div class="math-block">
        \[
        \int 4e^{2x-1}\,dx = 4\left(\frac{1}{2}e^{2x-1}\right)+C
        = 2e^{2x-1}+C
        \]
      </div>
    `,
    guidedSteps: [
      {
        title: raw`Spot the inside derivative`,
        previewHtml: raw`That is the chain-rule factor we need to undo.`,
        workingHtml: raw`<p class="step-text">That is the chain-rule factor we need to undo.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          2
        \]
</div>`
      },
      {
        title: raw`Undo the chain rule`,
        previewHtml: raw`We divide by the inside derivative \(2\).`,
        workingHtml: raw`<p class="step-text">We divide by the inside derivative \(2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{1}{2}e^{2x-1}+C
        \]
</div>`
      },
      {
        title: raw`Finish the integral`,
        previewHtml: raw`\(4\times\frac{1}{2}=2\).`,
        workingHtml: raw`<p class="step-text">\(4\times\frac{1}{2}=2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          2e^{2x-1}+C
        \]
</div>

      <p class="step-text">Use the reverse chain rule:</p>
      <div class="math-block">
        \[
        \frac{d}{dx}(2x-1)=2
        \]
        \[
        \int e^{2x-1}\,dx=\frac{1}{2}e^{2x-1}+C
        \]
      </div>
      <p class="step-text">Now include the factor \(4\):</p>
      <div class="math-block">
        \[
        \int 4e^{2x-1}\,dx = 4\left(\frac{1}{2}e^{2x-1}\right)+C
        = 2e^{2x-1}+C
        \]
      </div>
    `
      }
    ]
  });

  walkthroughs["2b"] = createConfig("2b", "2023 Paper — Solve a differential equation from one condition", {
    focus: raw`Integrate the right-hand side first, then use the point \((6, 7.5)\) to determine the constant.`,
    questionHtml: raw`
      <p class="step-text">Solve the differential equation</p>
      <div class="question-math">
        \[
        \frac{dy}{dx}=(4x+1)^{-1/2},
        \]
      </div>
      <p class="step-text">where \(x\ge 0\), given that when \(x=6\), \(y=7.5\).</p>
    `,
    questionNotes: [
      raw`Use calculus and show the integration needed to solve the problem.`
    ],
    hints: [
      raw`Rewrite \((4x+1)^{-1/2}\) as \(\frac{1}{\sqrt{4x+1}}\) if that looks friendlier.`,
      raw`Because the inside is \(4x+1\), integrating gives a factor of \(\frac{1}{4}\).`,
      raw`After integrating, use \(y(6)=7.5\) to find the constant.`
    ],
    answerHtml: raw`
      <p class="step-text">Integrate both sides:</p>
      <div class="math-block">
        \[
        y=\int (4x+1)^{-1/2}\,dx
        \]
        \[
        y=\frac{(4x+1)^{1/2}}{\frac{1}{2}\cdot 4}+C
        \]
        \[
        y=\frac{\sqrt{4x+1}}{2}+C
        \]
      </div>
      <p class="step-text">Now use the point \((6, 7.5)\):</p>
      <div class="math-block">
        \[
        7.5=\frac{\sqrt{4(6)+1}}{2}+C
        \]
        \[
        7.5=\frac{\sqrt{25}}{2}+C=\frac{5}{2}+C
        \]
        \[
        C=5
        \]
      </div>
      <p class="step-text">So the solved equation is</p>
      <div class="math-block">
        \[
        y=\frac{\sqrt{4x+1}}{2}+5
        \]
      </div>
    `,
    guidedSteps: [
      {
        title: raw`Integrate the derivative`,
        previewHtml: raw`The inside derivative \(4\) has to be accounted for.`,
        workingHtml: raw`<p class="step-text">The inside derivative \(4\) has to be accounted for.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{\sqrt{4x+1}}{2}+C
        \]
</div>`
      },
      {
        title: raw`Find the constant`,
        previewHtml: raw`Since \(\frac{\sqrt{25}}{2}=\frac{5}{2}=2.5\), the constant is \(5\).`,
        workingHtml: raw`
          <div class="math-block">
            \[
            y=\frac{\sqrt{4x+1}}{2}+C
            \]
            \[
            7.5=\frac{\sqrt{25}}{2}+C
            \]
          </div>

<p class="step-text">Since \(\frac{\sqrt{25}}{2}=\frac{5}{2}=2.5\), the constant is \(5\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  5
  \]
</div>
</div>`
      },
      {
        title: raw`Write the solved equation`,
        previewHtml: raw`That is the antiderivative with the correct constant attached.`,
        workingHtml: raw`<p class="step-text">That is the antiderivative with the correct constant attached.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          y=\frac{\sqrt{4x+1}}{2}+5
        \]
</div>

      <p class="step-text">Integrate both sides:</p>
      <div class="math-block">
        \[
        y=\int (4x+1)^{-1/2}\,dx
        \]
        \[
        y=\frac{(4x+1)^{1/2}}{\frac{1}{2}\cdot 4}+C
        \]
        \[
        y=\frac{\sqrt{4x+1}}{2}+C
        \]
      </div>
      <p class="step-text">Now use the point \((6, 7.5)\):</p>
      <div class="math-block">
        \[
        7.5=\frac{\sqrt{4(6)+1}}{2}+C
        \]
        \[
        7.5=\frac{\sqrt{25}}{2}+C=\frac{5}{2}+C
        \]
        \[
        C=5
        \]
      </div>
      <p class="step-text">So the solved equation is</p>
      <div class="math-block">
        \[
        y=\frac{\sqrt{4x+1}}{2}+5
        \]
      </div>
    `
      }
    ]
  });

  walkthroughs["2c"] = createConfig("2c", "2023 Paper — Definite integral with a parameter", {
    focus: raw`Rewrite the rational function into a constant plus a logarithmic term before applying the bounds.`,
    questionHtml: raw`
      <div class="question-math">
        \[
        \text{Find the value of }k,\text{ given that }
        \int_2^k \left(\frac{6x-3}{2x-3}\right)\,dx = 3k.
        \]
      </div>
    `,
    hints: [
      raw`Rewrite the numerator as \(3(2x-3)+6\).`,
      raw`That makes the integrand \(3+\frac{6}{2x-3}\).`,
      raw`After applying the bounds, the \(3k\) terms cancel and leave a logarithm equation.`
    ],
    answerHtml: raw`
      <p class="step-text">Rewrite the integrand first:</p>
      <div class="math-block">
        \[
        \frac{6x-3}{2x-3}
        =
        \frac{3(2x-3)+6}{2x-3}
        =
        3+\frac{6}{2x-3}
        \]
      </div>
      <p class="step-text">Now integrate and apply the bounds:</p>
      <div class="math-block">
        \[
        \int_2^k \left(3+\frac{6}{2x-3}\right)\,dx
        =
        \left[3x+3\ln|2x-3|\right]_2^k
        \]
        \[
        =
        3k+3\ln|2k-3|-6
        \]
      </div>
      <p class="step-text">Set this equal to \(3k\) and solve:</p>
      <div class="math-block">
        \[
        3k+3\ln|2k-3|-6=3k
        \]
        \[
        3\ln|2k-3|=6
        \]
        \[
        \ln|2k-3|=2
        \]
        \[
        |2k-3|=e^2
        \]
      </div>
      <p class="step-text">Because the integral starts at \(x=2\), we stay in the region \(2x-3&gt;0\), so \(2k-3=e^2\).</p>
      <div class="math-block">
        \[
        2k=e^2+3
        \]
        \[
        k=\frac{e^2+3}{2}
        \]
      </div>
    `,
    guidedSteps: [
      {
        title: raw`Rewrite the fraction`,
        previewHtml: raw`Writing \(6x-3=3(2x-3)+6\) makes the integral much easier.`,
        workingHtml: raw`<p class="step-text">Writing \(6x-3=3(2x-3)+6\) makes the integral much easier.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{6x-3}{2x-3}=3+\frac{6}{2x-3}
        \]
</div>`
      },
      {
        title: raw`Apply the bounds`,
        previewHtml: raw`At the lower bound, \(2(2)-3=1\), and \(\ln 1=0\).`,
        workingHtml: raw`<p class="step-text">At the lower bound, \(2(2)-3=1\), and \(\ln 1=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          3k+3\ln|2k-3|-6
        \]
</div>`
      },
      {
        title: raw`Solve for k`,
        previewHtml: raw`After the \(3k\) terms cancel, the logarithm equation leads directly to this value.`,
        workingHtml: raw`<p class="step-text">After the \(3k\) terms cancel, the logarithm equation leads directly to this value.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{e^2+3}{2}
        \]
</div>

      <p class="step-text">Rewrite the integrand first:</p>
      <div class="math-block">
        \[
        \frac{6x-3}{2x-3}
        =
        \frac{3(2x-3)+6}{2x-3}
        =
        3+\frac{6}{2x-3}
        \]
      </div>
      <p class="step-text">Now integrate and apply the bounds:</p>
      <div class="math-block">
        \[
        \int_2^k \left(3+\frac{6}{2x-3}\right)\,dx
        =
        \left[3x+3\ln|2x-3|\right]_2^k
        \]
        \[
        =
        3k+3\ln|2k-3|-6
        \]
      </div>
      <p class="step-text">Set this equal to \(3k\) and solve:</p>
      <div class="math-block">
        \[
        3k+3\ln|2k-3|-6=3k
        \]
        \[
        3\ln|2k-3|=6
        \]
        \[
        \ln|2k-3|=2
        \]
        \[
        |2k-3|=e^2
        \]
      </div>
      <p class="step-text">Because the integral starts at \(x=2\), we stay in the region \(2x-3&gt;0\), so \(2k-3=e^2\).</p>
      <div class="math-block">
        \[
        2k=e^2+3
        \]
        \[
        k=\frac{e^2+3}{2}
        \]
      </div>
    `
      }
    ]
  });

  walkthroughs["2d"] = createConfig("2d", "2023 Paper — Logarithmic antiderivative from a quotient", {
    focus: raw`Differentiate the denominator and then scale it so it matches the numerator.`,
    questionHtml: raw`
      <div class="question-math">
        \[
        \text{Find } \int \frac{\cos 2x+\sin 2x}{\cos 2x-\sin 2x}\,dx.
        \]
      </div>
    `,
    hints: [
      raw`Take \(u=\cos 2x-\sin 2x\).`,
      raw`Then \(u'=-2\sin 2x-2\cos 2x=-2(\cos 2x+\sin 2x)\).`,
      raw`That means the integrand is \(-\frac{1}{2}\frac{u'}{u}\).`
    ],
    answerHtml: raw`
      <p class="step-text">Let the denominator be the inside function:</p>
      <div class="math-block">
        \[
        u=\cos 2x-\sin 2x
        \]
        \[
        \frac{du}{dx}=-2\sin 2x-2\cos 2x=-2(\cos 2x+\sin 2x)
        \]
      </div>
      <p class="step-text">So the numerator is \(-\frac{1}{2}\) times the derivative of the denominator:</p>
      <div class="math-block">
        \[
        \frac{\cos 2x+\sin 2x}{\cos 2x-\sin 2x}
        =
        -\frac{1}{2}\cdot\frac{-2(\cos 2x+\sin 2x)}{\cos 2x-\sin 2x}
        \]
      </div>
      <p class="step-text">Now integrate using the logarithm pattern:</p>
      <div class="math-block">
        \[
        \int \frac{\cos 2x+\sin 2x}{\cos 2x-\sin 2x}\,dx
        =
        -\frac{1}{2}\ln|\cos 2x-\sin 2x|+C
        \]
      </div>
    `,
    guidedSteps: [
      {
        title: raw`Differentiate the denominator`,
        previewHtml: raw`Both trig terms bring out a factor of \(2\).`,
        workingHtml: raw`<p class="step-text">Both trig terms bring out a factor of \(2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          -2\sin 2x-2\cos 2x
        \]
</div>`
      },
      {
        title: raw`Match the numerator`,
        previewHtml: raw`Multiplying by \(-\frac{1}{2}\) changes \(-2(\cos 2x+\sin 2x)\) into \(\cos 2x+\sin 2x\).`,
        workingHtml: raw`<p class="step-text">Multiplying by \(-\frac{1}{2}\) changes \(-2(\cos 2x+\sin 2x)\) into \(\cos 2x+\sin 2x\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          -\frac{1}{2}
        \]
</div>`
      },
      {
        title: raw`Write the logarithmic antiderivative`,
        previewHtml: raw`This is exactly the \(\frac{u'}{u}\) logarithm pattern.`,
        workingHtml: raw`<p class="step-text">This is exactly the \(\frac{u'}{u}\) logarithm pattern.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          -\frac{1}{2}\ln|\cos 2x-\sin 2x|+C
        \]
</div>

      <p class="step-text">Let the denominator be the inside function:</p>
      <div class="math-block">
        \[
        u=\cos 2x-\sin 2x
        \]
        \[
        \frac{du}{dx}=-2\sin 2x-2\cos 2x=-2(\cos 2x+\sin 2x)
        \]
      </div>
      <p class="step-text">So the numerator is \(-\frac{1}{2}\) times the derivative of the denominator:</p>
      <div class="math-block">
        \[
        \frac{\cos 2x+\sin 2x}{\cos 2x-\sin 2x}
        =
        -\frac{1}{2}\cdot\frac{-2(\cos 2x+\sin 2x)}{\cos 2x-\sin 2x}
        \]
      </div>
      <p class="step-text">Now integrate using the logarithm pattern:</p>
      <div class="math-block">
        \[
        \int \frac{\cos 2x+\sin 2x}{\cos 2x-\sin 2x}\,dx
        =
        -\frac{1}{2}\ln|\cos 2x-\sin 2x|+C
        \]
      </div>
    `
      }
    ]
  });

  walkthroughs["2e"] = createConfig("2e", "2023 Paper — Quadratic decay model for chocolate volume", {
    focus: raw`Model the pumping with \(\frac{dV}{dt}=-kV^2\), solve the separable differential equation, then use the two time conditions to work back to \(V(0)\).`,
    questionHtml: raw`
      <p class="step-text">A cake factory has a container of liquid chocolate that is used in the manufacture of chocolate cakes.</p>
      <p class="step-text">The liquid chocolate is pumped out so that the rate of change of the volume remaining is proportional to the square of the volume remaining.</p>
      <p class="step-text">After one hour, the volume remaining is \(p\) litres, where \(p\) is a positive constant.</p>
      <p class="step-text">After a further hour, the volume remaining is \(\frac{4}{5}p\) litres.</p>
      <p class="step-text">Write a differential equation that models this situation, and solve it to calculate how much liquid chocolate was in the container at the start of the day, giving your answer in terms of \(p\).</p>
    `,
    questionNotes: [
      raw`Use calculus and show the integration needed to solve the problem.`
    ],
    hints: [
      raw`If \(V\) is volume, “rate of change is proportional to the square of the volume” becomes \(\frac{dV}{dt}=-kV^2\).`,
      raw`Separating variables gives \(\int V^{-2}\,dV = \int -k\,dt\).`,
      raw`Once you get a linear equation in \(\frac{1}{V}\), using \(V(1)=p\) and \(V(2)=\frac{4}{5}p\) becomes much easier.`
    ],
    answerHtml: raw`
      <p class="step-text">Let \(V\) be the volume of chocolate remaining after \(t\) hours. The model is</p>
      <div class="math-block">
        \[
        \frac{dV}{dt}=-kV^2
        \]
      </div>
      <p class="step-text">Separate variables and integrate:</p>
      <div class="math-block">
        \[
        \frac{1}{V^2}\,dV=-k\,dt
        \]
        \[
        \int V^{-2}\,dV = \int -k\,dt
        \]
        \[
        -\frac{1}{V}=-kt+C
        \]
      </div>
      <p class="step-text">It is convenient to rewrite this as</p>
      <div class="math-block">
        \[
        \frac{1}{V}=kt+C
        \]
      </div>
      <p class="step-text">Now use the two conditions:</p>
      <div class="math-block">
        \[
        V(1)=p \Rightarrow \frac{1}{p}=k+C
        \]
        \[
        V(2)=\frac{4}{5}p \Rightarrow \frac{1}{(4/5)p}=2k+C
        \]
        \[
        \frac{5}{4p}=2k+C
        \]
      </div>
      <p class="step-text">Subtract the equations to find \(k\):</p>
      <div class="math-block">
        \[
        \frac{5}{4p}-\frac{1}{p}=k
        \]
        \[
        \frac{1}{4p}=k
        \]
      </div>
      <p class="step-text">Then use \(\frac{1}{p}=k+C\):</p>
      <div class="math-block">
        \[
        \frac{1}{p}=\frac{1}{4p}+C
        \]
        \[
        C=\frac{3}{4p}
        \]
      </div>
      <p class="step-text">At the start of the day, \(t=0\), so</p>
      <div class="math-block">
        \[
        \frac{1}{V(0)}=C=\frac{3}{4p}
        \]
        \[
        V(0)=\frac{4p}{3}
        \]
      </div>
      <p class="step-text">The container started with \(\frac{4p}{3}\) litres of chocolate.</p>
    `,
    guidedSteps: [
      {
        title: raw`Write the model`,
        previewHtml: raw`The negative sign represents the chocolate being pumped out.`,
        workingHtml: raw`<p class="step-text">The negative sign represents the chocolate being pumped out.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{dV}{dt}=-kV^2
        \]
</div>`
      },
      {
        title: raw`Integrate the separated equation`,
        previewHtml: raw`This is equivalent to \(-\frac{1}{V}=-kt+C\), and it makes the substitutions easier.`,
        workingHtml: raw`<p class="step-text">This is equivalent to \(-\frac{1}{V}=-kt+C\), and it makes the substitutions easier.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{1}{V}=kt+C
        \]
</div>`
      },
      {
        title: raw`Use the two time conditions`,
        previewHtml: raw`Those are the two equations we need.`,
        workingHtml: raw`<p class="step-text">Those are the two equations we need.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{1}{p}=k+C,
          \qquad
          \frac{5}{4p}=2k+C
        \]
</div>`
      },
      {
        title: raw`Find the starting volume`,
        previewHtml: raw`Since \(\frac{1}{V(0)}=\frac{3}{4p}\), the starting volume is \(\frac{4p}{3}\).`,
        workingHtml: raw`<p class="step-text">Since \(\frac{1}{V(0)}=\frac{3}{4p}\), the starting volume is \(\frac{4p}{3}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{4p}{3}
        \]
</div>

      <p class="step-text">Let \(V\) be the volume of chocolate remaining after \(t\) hours. The model is</p>
      <div class="math-block">
        \[
        \frac{dV}{dt}=-kV^2
        \]
      </div>
      <p class="step-text">Separate variables and integrate:</p>
      <div class="math-block">
        \[
        \frac{1}{V^2}\,dV=-k\,dt
        \]
        \[
        \int V^{-2}\,dV = \int -k\,dt
        \]
        \[
        -\frac{1}{V}=-kt+C
        \]
      </div>
      <p class="step-text">It is convenient to rewrite this as</p>
      <div class="math-block">
        \[
        \frac{1}{V}=kt+C
        \]
      </div>
      <p class="step-text">Now use the two conditions:</p>
      <div class="math-block">
        \[
        V(1)=p \Rightarrow \frac{1}{p}=k+C
        \]
        \[
        V(2)=\frac{4}{5}p \Rightarrow \frac{1}{(4/5)p}=2k+C
        \]
        \[
        \frac{5}{4p}=2k+C
        \]
      </div>
      <p class="step-text">Subtract the equations to find \(k\):</p>
      <div class="math-block">
        \[
        \frac{5}{4p}-\frac{1}{p}=k
        \]
        \[
        \frac{1}{4p}=k
        \]
      </div>
      <p class="step-text">Then use \(\frac{1}{p}=k+C\):</p>
      <div class="math-block">
        \[
        \frac{1}{p}=\frac{1}{4p}+C
        \]
        \[
        C=\frac{3}{4p}
        \]
      </div>
      <p class="step-text">At the start of the day, \(t=0\), so</p>
      <div class="math-block">
        \[
        \frac{1}{V(0)}=C=\frac{3}{4p}
        \]
        \[
        V(0)=\frac{4p}{3}
        \]
      </div>
      <p class="step-text">The container started with \(\frac{4p}{3}\) litres of chocolate.</p>
    `
      }
    ]
  });

  walkthroughs["3a"] = createConfig("3a", "2023 Paper — Simpson’s Rule for a garden section", {
    focus: raw`Read the equally spaced ordinates carefully, identify \(h\), then slot the values into Simpson’s Rule in the correct odd-even pattern.`,
    questionHtml: raw`
      <p class="step-text">A garden designer wants an approximation of the area of the shaded garden section below.</p>
      <div class="graph-frame question-graph-frame">
        <svg id="question-graph-3a-int-2023" class="graph-svg" viewBox="0 0 560 330" aria-label="Garden section measured every 3 metres with ordinates 10, 13, 16, 15, and 14" role="img"></svg>
      </div>
      <p class="step-text">Using these measurements, and Simpson’s Rule, find an approximation of the area of the garden section.</p>
    `,
    hints: [
      raw`The strips are each \(3\) metres wide, so \(h=3\).`,
      raw`The ordinates are \(10, 13, 16, 15, 14\).`,
      raw`Simpson’s Rule is \(\frac{h}{3}[y_0+y_4+4(y_1+y_3)+2y_2]\) for this set of five ordinates.`
    ],
    answerHtml: raw`
      <p class="step-text">The interval width is</p>
      <div class="math-block">
        \[
        h=3
        \]
      </div>
      <p class="step-text">The ordinates are</p>
      <div class="math-block">
        \[
        y_0=10,\quad y_1=13,\quad y_2=16,\quad y_3=15,\quad y_4=14
        \]
      </div>
      <p class="step-text">Substitute into Simpson’s Rule:</p>
      <div class="math-block">
        \[
        A \approx \frac{h}{3}\left[y_0+y_4+4(y_1+y_3)+2y_2\right]
        \]
        \[
        A \approx \frac{3}{3}\left[10+14+4(13+15)+2(16)\right]
        \]
        \[
        A \approx 10+14+112+32 = 168
        \]
      </div>
      <p class="step-text">So the approximate area is \(168\text{ m}^2\).</p>
    `,
    afterRender: draw3aGraph,
    guidedSteps: [
      {
        title: raw`Find h`,
        previewHtml: raw`The measurements are taken every \(3\) metres.`,
        workingHtml: raw`<p class="step-text">The measurements are taken every \(3\) metres.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  3
  \]
</div>
</div>`
      },
      {
        title: raw`Use the odd-even pattern`,
        previewHtml: raw`The odd interior ordinates get the \(4\), and the even interior ordinate gets the \(2\).`,
        workingHtml: raw`<p class="step-text">The odd interior ordinates get the \(4\), and the even interior ordinate gets the \(2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{3}{3}\left[10+14+4(13+15)+2(16)\right]
        \]
</div>`
      },
      {
        title: raw`Evaluate the approximation`,
        previewHtml: raw`The Simpson’s Rule total comes to \(168\).`,
        workingHtml: raw`<p class="step-text">The Simpson’s Rule total comes to \(168\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          168\text{ m}^2
        \]
</div>

      <p class="step-text">The interval width is</p>
      <div class="math-block">
        \[
        h=3
        \]
      </div>
      <p class="step-text">The ordinates are</p>
      <div class="math-block">
        \[
        y_0=10,\quad y_1=13,\quad y_2=16,\quad y_3=15,\quad y_4=14
        \]
      </div>
      <p class="step-text">Substitute into Simpson’s Rule:</p>
      <div class="math-block">
        \[
        A \approx \frac{h}{3}\left[y_0+y_4+4(y_1+y_3)+2y_2\right]
        \]
        \[
        A \approx \frac{3}{3}\left[10+14+4(13+15)+2(16)\right]
        \]
        \[
        A \approx 10+14+112+32 = 168
        \]
      </div>
      <p class="step-text">So the approximate area is \(168\text{ m}^2\).</p>
    `
      }
    ]
  });

  walkthroughs["3b"] = createConfig("3b", "2023 Paper — Simplify a radical quotient before integrating", {
    focus: raw`Simplify the fraction first so the integral becomes a basic power-rule exercise.`,
    questionHtml: raw`
      <div class="question-math">
        \[
        \text{Find } \int \left(\frac{\sqrt{x}-3}{\sqrt{x}}\right)\,dx.
        \]
      </div>
    `,
    hints: [
      raw`Split the numerator over the denominator term by term.`,
      raw`\(\frac{\sqrt{x}}{\sqrt{x}}=1\).`,
      raw`\(\frac{3}{\sqrt{x}}=3x^{-1/2}\), which integrates to \(6\sqrt{x}\).`
    ],
    answerHtml: raw`
      <p class="step-text">Simplify the integrand first:</p>
      <div class="math-block">
        \[
        \frac{\sqrt{x}-3}{\sqrt{x}}
        =
        \frac{\sqrt{x}}{\sqrt{x}}-\frac{3}{\sqrt{x}}
        =
        1-3x^{-1/2}
        \]
      </div>
      <p class="step-text">Now integrate term by term:</p>
      <div class="math-block">
        \[
        \int \left(1-3x^{-1/2}\right)\,dx
        =
        x-3\left(\frac{x^{1/2}}{1/2}\right)+C
        \]
        \[
        =
        x-6\sqrt{x}+C
        \]
      </div>
    `,
    guidedSteps: [
      {
        title: raw`Simplify the quotient`,
        previewHtml: raw`Writing the second term as a power makes the integration easier.`,
        workingHtml: raw`<p class="step-text">Writing the second term as a power makes the integration easier.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          1-3x^{-1/2}
        \]
</div>`
      },
      {
        title: raw`Integrate term by term`,
        previewHtml: raw`\(\int x^{-1/2}\,dx=2x^{1/2}\).`,
        workingHtml: raw`<p class="step-text">\(\int x^{-1/2}\,dx=2x^{1/2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          x-6\sqrt{x}+C
        \]
</div>

      <p class="step-text">Simplify the integrand first:</p>
      <div class="math-block">
        \[
        \frac{\sqrt{x}-3}{\sqrt{x}}
        =
        \frac{\sqrt{x}}{\sqrt{x}}-\frac{3}{\sqrt{x}}
        =
        1-3x^{-1/2}
        \]
      </div>
      <p class="step-text">Now integrate term by term:</p>
      <div class="math-block">
        \[
        \int \left(1-3x^{-1/2}\right)\,dx
        =
        x-3\left(\frac{x^{1/2}}{1/2}\right)+C
        \]
        \[
        =
        x-6\sqrt{x}+C
        \]
      </div>
    `
      }
    ]
  });

  walkthroughs["3c"] = createConfig("3c", "2023 Paper — Product-to-sum in a shaded trig area", {
    focus: raw`Use the product-to-sum identity before integrating, then give the exact area and the decimal approximation.`,
    questionHtml: raw`
      <p class="step-text">The graph below shows the function \(y=5\sin(3x)\sin(x)\).</p>
      <div class="graph-frame question-graph-frame">
        <svg id="question-graph-3c-int-2023" class="graph-svg" viewBox="0 0 470 300" aria-label="Shaded region under y equals 5 sine 3x times sine x from x equals 0 to pi over 3" role="img"></svg>
      </div>
      <p class="step-text">Find the shaded area.</p>
    `,
    questionNotes: [
      raw`Use calculus and show the integration needed to solve the problem.`
    ],
    hints: [
      raw`Start with \(\sin A\sin B=\frac{1}{2}[\cos(A-B)-\cos(A+B)]\).`,
      raw`Here that makes \(5\sin(3x)\sin(x)=\frac{5}{2}(\cos 2x-\cos 4x)\).`,
      raw`After integrating, \(\sin\left(\frac{4\pi}{3}\right)=-\frac{\sqrt{3}}{2}\).`
    ],
    answerHtml: raw`
      <p class="step-text">Use products to sums:</p>
      <div class="math-block">
        \[
        \sin(3x)\sin(x)=\frac{1}{2}\left[\cos(2x)-\cos(4x)\right]
        \]
        \[
        5\sin(3x)\sin(x)=\frac{5}{2}\left(\cos 2x-\cos 4x\right)
        \]
      </div>
      <p class="step-text">Set up and integrate the area:</p>
      <div class="math-block">
        \[
        A=\int_0^{\pi/3}5\sin(3x)\sin(x)\,dx
        =
        \int_0^{\pi/3}\frac{5}{2}\left(\cos 2x-\cos 4x\right)\,dx
        \]
        \[
        A=\left[\frac{5}{4}\sin 2x-\frac{5}{8}\sin 4x\right]_0^{\pi/3}
        \]
      </div>
      <p class="step-text">Evaluate the bounds:</p>
      <div class="math-block">
        \[
        A=
        \frac{5}{4}\sin\left(\frac{2\pi}{3}\right)
        -
        \frac{5}{8}\sin\left(\frac{4\pi}{3}\right)
        \]
        \[
        A=
        \frac{5}{4}\cdot\frac{\sqrt{3}}{2}
        -
        \frac{5}{8}\cdot\left(-\frac{\sqrt{3}}{2}\right)
        =
        \frac{15\sqrt{3}}{16}
        \approx 1.624
        \]
      </div>
      <p class="step-text">So the shaded area is \(\frac{15\sqrt{3}}{16}\text{ units}^2 \approx 1.624\text{ units}^2\).</p>
    `,
    afterRender: draw3cGraph,
    guidedSteps: [
      {
        title: raw`Apply the identity`,
        previewHtml: raw`This is the version that integrates cleanly.`,
        workingHtml: raw`<p class="step-text">This is the version that integrates cleanly.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{5}{2}\left(\cos 2x-\cos 4x\right)
        \]
</div>`
      },
      {
        title: raw`Integrate the trig terms`,
        previewHtml: raw`\(\int \cos 2x\,dx=\frac{1}{2}\sin 2x\) and \(\int \cos 4x\,dx=\frac{1}{4}\sin 4x\).`,
        workingHtml: raw`<p class="step-text">\(\int \cos 2x\,dx=\frac{1}{2}\sin 2x\) and \(\int \cos 4x\,dx=\frac{1}{4}\sin 4x\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \left[\frac{5}{4}\sin 2x-\frac{5}{8}\sin 4x\right]_0^{\pi/3}
        \]
</div>`
      },
      {
        title: raw`Finish the area`,
        previewHtml: raw`The second sine term is negative, so subtracting it adds another \(\frac{5\sqrt{3}}{16}\).`,
        workingHtml: raw`<p class="step-text">The second sine term is negative, so subtracting it adds another \(\frac{5\sqrt{3}}{16}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{15\sqrt{3}}{16}\text{ units}^2 \approx 1.624\text{ units}^2
        \]
</div>

      <p class="step-text">Use products to sums:</p>
      <div class="math-block">
        \[
        \sin(3x)\sin(x)=\frac{1}{2}\left[\cos(2x)-\cos(4x)\right]
        \]
        \[
        5\sin(3x)\sin(x)=\frac{5}{2}\left(\cos 2x-\cos 4x\right)
        \]
      </div>
      <p class="step-text">Set up and integrate the area:</p>
      <div class="math-block">
        \[
        A=\int_0^{\pi/3}5\sin(3x)\sin(x)\,dx
        =
        \int_0^{\pi/3}\frac{5}{2}\left(\cos 2x-\cos 4x\right)\,dx
        \]
        \[
        A=\left[\frac{5}{4}\sin 2x-\frac{5}{8}\sin 4x\right]_0^{\pi/3}
        \]
      </div>
      <p class="step-text">Evaluate the bounds:</p>
      <div class="math-block">
        \[
        A=
        \frac{5}{4}\sin\left(\frac{2\pi}{3}\right)
        -
        \frac{5}{8}\sin\left(\frac{4\pi}{3}\right)
        \]
        \[
        A=
        \frac{5}{4}\cdot\frac{\sqrt{3}}{2}
        -
        \frac{5}{8}\cdot\left(-\frac{\sqrt{3}}{2}\right)
        =
        \frac{15\sqrt{3}}{16}
        \approx 1.624
        \]
      </div>
      <p class="step-text">So the shaded area is \(\frac{15\sqrt{3}}{16}\text{ units}^2 \approx 1.624\text{ units}^2\).</p>
    `
      }
    ]
  });

  walkthroughs["3d"] = createConfig("3d", "2023 Paper — Velocity from an acceleration model", {
    focus: raw`Treat acceleration as \(\frac{dv}{dt}\), integrate carefully, then use \(v(0)=5\) before substituting \(t=4\).`,
    questionHtml: raw`
      <p class="step-text">An object’s acceleration can be modelled by</p>
      <div class="question-math">
        \[
        a=\frac{e^{2t}}{4e^{2t}-3},
        \]
      </div>
      <p class="step-text">where \(t\ge 0\), \(a\) is measured in m s\(^{-2}\), and \(t\) is the time in seconds from the start of timing.</p>
      <p class="step-text">At \(t=0\) seconds, the object had velocity \(5\) m s\(^{-1}\).</p>
      <p class="step-text">Find the object’s velocity when \(t=4\) seconds.</p>
    `,
    hints: [
      raw`Because \(a=\frac{dv}{dt}\), integrate the acceleration function with respect to \(t\).`,
      raw`Use \(u=4e^{2t}-3\), so \(du=8e^{2t}\,dt\).`,
      raw`After integrating, the initial velocity makes the constant especially easy because \(4e^0-3=1\).`
    ],
    answerHtml: raw`
      <p class="step-text">Since \(a=\frac{dv}{dt}\), we have</p>
      <div class="math-block">
        \[
        \frac{dv}{dt}=\frac{e^{2t}}{4e^{2t}-3}
        \]
        \[
        v(t)=\int \frac{e^{2t}}{4e^{2t}-3}\,dt
        \]
      </div>
      <p class="step-text">Use the substitution \(u=4e^{2t}-3\):</p>
      <div class="math-block">
        \[
        \frac{du}{dt}=8e^{2t}
        \]
        \[
        \int \frac{e^{2t}}{4e^{2t}-3}\,dt
        =
        \frac{1}{8}\int \frac{u'}{u}\,dt
        =
        \frac{1}{8}\ln|4e^{2t}-3|+C
        \]
      </div>
      <p class="step-text">So</p>
      <div class="math-block">
        \[
        v(t)=\frac{1}{8}\ln|4e^{2t}-3|+C
        \]
      </div>
      <p class="step-text">Use \(v(0)=5\):</p>
      <div class="math-block">
        \[
        5=\frac{1}{8}\ln|4e^0-3|+C
        =
        \frac{1}{8}\ln 1 + C
        =
        C
        \]
        \[
        C=5
        \]
      </div>
      <p class="step-text">Now substitute \(t=4\):</p>
      <div class="math-block">
        \[
        v(4)=\frac{1}{8}\ln|4e^8-3|+5
        \approx 6.173
        \]
      </div>
      <p class="step-text">So the velocity after \(4\) seconds is approximately \(6.173\text{ m s}^{-1}\).</p>
    `,
    guidedSteps: [
      {
        title: raw`Integrate the acceleration`,
        previewHtml: raw`The derivative of \(4e^{2t}-3\) is \(8e^{2t}\).`,
        workingHtml: raw`<p class="step-text">The derivative of \(4e^{2t}-3\) is \(8e^{2t}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{1}{8}\ln|4e^{2t}-3|+C
        \]
</div>`
      },
      {
        title: raw`Use the initial velocity`,
        previewHtml: raw`Since \(4e^0-3=1\), the logarithm is \(\ln 1=0\).`,
        workingHtml: raw`
          <div class="math-block">
            \[
            v(t)=\frac{1}{8}\ln|4e^{2t}-3|+C
            \]
            \[
            v(0)=\frac{1}{8}\ln|4e^0-3|+C
            \]
          </div>

<p class="step-text">Since \(4e^0-3=1\), the logarithm is \(\ln 1=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  5
  \]
</div>
</div>`
      },
      {
        title: raw`Find the velocity at 4 seconds`,
        previewHtml: raw`That is the exact expression and its decimal value.`,
        workingHtml: raw`<p class="step-text">That is the exact expression and its decimal value.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          5+\frac{1}{8}\ln|4e^8-3|
          \approx 6.173\text{ m s}^{-1}
        \]
</div>

      <p class="step-text">Since \(a=\frac{dv}{dt}\), we have</p>
      <div class="math-block">
        \[
        \frac{dv}{dt}=\frac{e^{2t}}{4e^{2t}-3}
        \]
        \[
        v(t)=\int \frac{e^{2t}}{4e^{2t}-3}\,dt
        \]
      </div>
      <p class="step-text">Use the substitution \(u=4e^{2t}-3\):</p>
      <div class="math-block">
        \[
        \frac{du}{dt}=8e^{2t}
        \]
        \[
        \int \frac{e^{2t}}{4e^{2t}-3}\,dt
        =
        \frac{1}{8}\int \frac{u'}{u}\,dt
        =
        \frac{1}{8}\ln|4e^{2t}-3|+C
        \]
      </div>
      <p class="step-text">So</p>
      <div class="math-block">
        \[
        v(t)=\frac{1}{8}\ln|4e^{2t}-3|+C
        \]
      </div>
      <p class="step-text">Use \(v(0)=5\):</p>
      <div class="math-block">
        \[
        5=\frac{1}{8}\ln|4e^0-3|+C
        =
        \frac{1}{8}\ln 1 + C
        =
        C
        \]
        \[
        C=5
        \]
      </div>
      <p class="step-text">Now substitute \(t=4\):</p>
      <div class="math-block">
        \[
        v(4)=\frac{1}{8}\ln|4e^8-3|+5
        \approx 6.173
        \]
      </div>
      <p class="step-text">So the velocity after \(4\) seconds is approximately \(6.173\text{ m s}^{-1}\).</p>
    `
      }
    ]
  });

  walkthroughs["3e"] = createConfig("3e", "2023 Paper — Separable equation with factor cancellation", {
    focus: raw`Factor both \(1-x^2\) and \(1-y^2\), cancel the common factors carefully, then use the initial condition to choose the correct branch.`,
    questionHtml: raw`
      <p class="step-text">Consider the differential equation</p>
      <div class="question-math">
        \[
        (1-x^2)(1+y)\frac{dy}{dx}+(1-x)(1-y^2)=0.
        \]
      </div>
      <p class="step-text">Given that \(y=0\) when \(x=2\), find the value of \(y\) when \(x=6\).</p>
    `,
    questionNotes: [
      raw`Use calculus and show the integration needed to solve the problem.`
    ],
    hints: [
      raw`Factor \(1-x^2=(1-x)(1+x)\) and \(1-y^2=(1-y)(1+y)\).`,
      raw`After cancelling, the equation becomes \(\frac{dy}{dx}=-\frac{1-y}{1+x}\).`,
      raw`When you solve the logarithmic equation, use the initial condition to decide the sign of \(1-y\).`
    ],
    answerHtml: raw`
      <p class="step-text">Factor the quadratic terms:</p>
      <div class="math-block">
        \[
        (1-x)(1+x)(1+y)\frac{dy}{dx}+(1-x)(1-y)(1+y)=0
        \]
      </div>
      <p class="step-text">On the interval we care about, we can cancel the common factors and simplify:</p>
      <div class="math-block">
        \[
        (1+x)\frac{dy}{dx}+(1-y)=0
        \]
        \[
        \frac{dy}{dx}=-\frac{1-y}{1+x}
        \]
      </div>
      <p class="step-text">Separate variables:</p>
      <div class="math-block">
        \[
        \frac{1}{1-y}\,dy=-\frac{1}{1+x}\,dx
        \]
      </div>
      <p class="step-text">Integrate both sides:</p>
      <div class="math-block">
        \[
        -\ln|1-y|=-\ln|1+x|+C
        \]
      </div>
      <p class="step-text">Use the initial condition \(y=0\) when \(x=2\):</p>
      <div class="math-block">
        \[
        -\ln|1|=-\ln|3|+C
        \]
        \[
        C=\ln 3
        \]
      </div>
      <p class="step-text">So</p>
      <div class="math-block">
        \[
        -\ln|1-y|=-\ln|1+x|+\ln 3
        \]
        \[
        \ln|1-y|=\ln\left(\frac{1+x}{3}\right)
        \]
        \[
        |1-y|=\frac{1+x}{3}
        \]
      </div>
      <p class="step-text">At \(x=2\), \(1-y=1\) is positive, so we keep the positive branch:</p>
      <div class="math-block">
        \[
        1-y=\frac{1+x}{3}
        \]
      </div>
      <p class="step-text">Now substitute \(x=6\):</p>
      <div class="math-block">
        \[
        1-y=\frac{7}{3}
        \]
        \[
        y=1-\frac{7}{3}=-\frac{4}{3}
        \]
      </div>
    `,
    guidedSteps: [
      {
        title: raw`Simplify the differential equation`,
        previewHtml: raw`Factoring \(1-x^2\) and \(1-y^2\) lets the common factors cancel cleanly.`,
        workingHtml: raw`<p class="step-text">Factoring \(1-x^2\) and \(1-y^2\) lets the common factors cancel cleanly.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{dy}{dx}=-\frac{1-y}{1+x}
        \]
</div>`
      },
      {
        title: raw`Separate the variables`,
        previewHtml: raw`Now each side depends on just one variable.`,
        workingHtml: raw`<p class="step-text">Now each side depends on just one variable.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \frac{1}{1-y}\,dy=-\frac{1}{1+x}\,dx
        \]
</div>`
      },
      {
        title: raw`Use the initial condition`,
        previewHtml: raw`Substituting \(x=2\) and \(y=0\) gives \(0=-\ln 3 + C\).`,
        workingHtml: raw`<p class="step-text">Substituting \(x=2\) and \(y=0\) gives \(0=-\ln 3 + C\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          \ln 3
        \]
</div>`
      },
      {
        title: raw`Find y when x = 6`,
        previewHtml: raw`\(1-y=\frac{7}{3}\) gives \(y=1-\frac{7}{3}=-\frac{4}{3}\).`,
        workingHtml: raw`<p class="step-text">\(1-y=\frac{7}{3}\) gives \(y=1-\frac{7}{3}=-\frac{4}{3}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
          -\frac{4}{3}
        \]
</div>

      <p class="step-text">Factor the quadratic terms:</p>
      <div class="math-block">
        \[
        (1-x)(1+x)(1+y)\frac{dy}{dx}+(1-x)(1-y)(1+y)=0
        \]
      </div>
      <p class="step-text">On the interval we care about, we can cancel the common factors and simplify:</p>
      <div class="math-block">
        \[
        (1+x)\frac{dy}{dx}+(1-y)=0
        \]
        \[
        \frac{dy}{dx}=-\frac{1-y}{1+x}
        \]
      </div>
      <p class="step-text">Separate variables:</p>
      <div class="math-block">
        \[
        \frac{1}{1-y}\,dy=-\frac{1}{1+x}\,dx
        \]
      </div>
      <p class="step-text">Integrate both sides:</p>
      <div class="math-block">
        \[
        -\ln|1-y|=-\ln|1+x|+C
        \]
      </div>
      <p class="step-text">Use the initial condition \(y=0\) when \(x=2\):</p>
      <div class="math-block">
        \[
        -\ln|1|=-\ln|3|+C
        \]
        \[
        C=\ln 3
        \]
      </div>
      <p class="step-text">So</p>
      <div class="math-block">
        \[
        -\ln|1-y|=-\ln|1+x|+\ln 3
        \]
        \[
        \ln|1-y|=\ln\left(\frac{1+x}{3}\right)
        \]
        \[
        |1-y|=\frac{1+x}{3}
        \]
      </div>
      <p class="step-text">At \(x=2\), \(1-y=1\) is positive, so we keep the positive branch:</p>
      <div class="math-block">
        \[
        1-y=\frac{1+x}{3}
        \]
      </div>
      <p class="step-text">Now substitute \(x=6\):</p>
      <div class="math-block">
        \[
        1-y=\frac{7}{3}
        \]
        \[
        y=1-\frac{7}{3}=-\frac{4}{3}
        \]
      </div>
    `
      }
    ]
  });

  window.Integration2023Walkthroughs = walkthroughs;
}());
