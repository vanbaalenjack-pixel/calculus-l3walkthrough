(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-integration-2023";
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
    steps: [
      choiceStep("Split the integrand", raw`Which rewrite is the best starting point?`, [
        wrongChoice(raw`\[
          \int \left(3x+2+\frac{1}{3x+2}\right)\,dx
          =
          \int (3x+2)\,dx + \frac{1}{3x+2}
        \]`, raw`The last term still needs to stay inside an integral.`),
        correctChoice(raw`\[
          \int 3x\,dx + \int 2\,dx + \int \frac{1}{3x+2}\,dx
        \]`, raw`Correct. A sum inside an integral can be split into separate integrals.`),
        wrongChoice(raw`\[
          \int \left(3x+2\right)\left(\frac{1}{3x+2}\right)\,dx
        \]`, raw`That changes the integrand completely. It is a sum, not a product.`),
        wrongChoice(raw`\[
          \int \frac{3x+2+1}{3x+2}\,dx
        \]`, raw`Combining everything into one fraction is possible, but it makes the integral less clear, not more.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Handle the logarithm term", raw`What is \(\int \frac{1}{3x+2}\,dx\)?`, [
        wrongChoice(raw`\[
          \ln|3x+2|+C
        \]`, raw`That misses the factor of \(\frac{1}{3}\) from the inside derivative.`),
        correctChoice(raw`\[
          \frac{1}{3}\ln|3x+2|+C
        \]`, raw`Yes. The derivative of \(3x+2\) is \(3\), so we divide by \(3\).`),
        wrongChoice(raw`\[
          \frac{1}{(3x+2)^2}+C
        \]`, raw`That would come from a power-rule pattern, not the \(\frac{u'}{u}\) logarithm pattern.`),
        wrongChoice(raw`\[
          3\ln|3x+2|+C
        \]`, raw`The factor should divide the logarithm, not multiply it.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Assemble the final answer", raw`Which complete antiderivative is correct?`, [
        wrongChoice(raw`\[
          \frac{3x^2}{2}+2x+\ln|3x+2|+C
        \]`, raw`The logarithm term still needs the factor \(\frac{1}{3}\).`),
        wrongChoice(raw`\[
          \frac{x^2}{2}+2x+\frac{1}{3}\ln|3x+2|+C
        \]`, raw`The antiderivative of \(3x\) is \(\frac{3x^2}{2}\), not \(\frac{x^2}{2}\).`),
        correctChoice(raw`\[
          \frac{3x^2}{2}+2x+\frac{1}{3}\ln|3x+2|+C
        \]`, raw`Correct. Each term has been integrated properly.`),
        wrongChoice(raw`\[
          \frac{3x^2}{2}+2+\frac{1}{3}\ln|3x+2|+C
        \]`, raw`The constant \(2\) integrates to \(2x\), not \(2\).`)
      ], {
        buttonGridClass: "button-grid two-col"
      })
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
    steps: [
      choiceStep("Find the position function", raw`What should we do first?`, [
        wrongChoice(raw`\[
          s(t)=\frac{d}{dt}(\sec^2 t)
        \]`, raw`That differentiates the velocity instead of reversing it.`),
        correctChoice(raw`\[
          s(t)=\int \sec^2 t\,dt=\tan t + C
        \]`, raw`Correct. Position is found by integrating the velocity.`),
        wrongChoice(raw`\[
          s(t)=\sec^2 t + C
        \]`, raw`That copies the velocity instead of integrating it.`),
        wrongChoice(raw`\[
          s(t)=\sec t + C
        \]`, raw`The antiderivative of \(\sec^2 t\) is \(\tan t\), not \(\sec t\).`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      typedStep("Use the initial distance", raw`Since \(s(0)=3\), what is the value of \(C\)?`, ["3"], {
        beforeHtml: raw`
          <div class="math-block">
            \[
            s(t)=\tan t + C
            \]
            \[
            3=s(0)=\tan 0 + C
            \]
          </div>
        `,
        ariaLabel: "Type the value of C",
        successMessage: raw`Correct. \(\tan 0=0\), so the constant must be \(3\).`,
        genericMessage: raw`Substitute \(t=0\) into \(s(t)=\tan t + C\).`
      }),
      choiceStep("Evaluate the distance", raw`What is the object’s distance from \(P\) after \(\frac{\pi}{4}\) hours?`, [
        wrongChoice(raw`\[
          3\text{ km}
        \]`, raw`That is the starting distance, but the object has moved after \(\frac{\pi}{4}\) hours.`),
        wrongChoice(raw`\[
          1\text{ km}
        \]`, raw`That is only \(\tan\left(\frac{\pi}{4}\right)\); you still need the \(+3\).`),
        correctChoice(raw`\[
          4\text{ km}
        \]`, raw`Yes. \(s\left(\frac{\pi}{4}\right)=1+3=4\).`),
        wrongChoice(raw`\[
          \pi + 3\text{ km}
        \]`, raw`The tangent of \(\frac{\pi}{4}\) is \(1\), not \(\pi\).`)
      ], {
        buttonGridClass: "button-grid two-col"
      })
    ]
  });

  walkthroughs["1c"] = createConfig("1c", "2023 Paper — Area between \u221ax and x\u00b2/8", {
    focus: raw`Find the intersection points first, then integrate top minus bottom over that interval.`,
    questionHtml: raw`
      <p class="step-text">The graph below shows the functions \(y=\sqrt{x}\) and \(8y=x^2\).</p>
      <div class="graph-frame question-graph-frame">
        <svg id="question-graph-1c-int-2023" class="graph-svg" viewBox="0 0 460 300" aria-label="Shaded region between y equals square root x and 8y equals x squared"></svg>
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
    steps: [
      typedStep("Find the non-zero intersection", raw`Besides \(x=0\), where do the two curves meet?`, ["4"], {
        beforeHtml: raw`
          <div class="math-block">
            \[
            \sqrt{x}=\frac{x^2}{8}
            \]
            \[
            64x=x^4
            \]
          </div>
        `,
        ariaLabel: "Type the non-zero intersection x value",
        successMessage: raw`Correct. Solving \(x^3=64\) gives \(x=4\).`,
        genericMessage: raw`From \(64x=x^4\), factor out \(x\) and solve \(x^3=64\).`
      }),
      choiceStep("Set up top minus bottom", raw`Which definite integral represents the shaded area?`, [
        wrongChoice(raw`\[
          \int_0^4\left(\frac{x^2}{8}-\sqrt{x}\right)\,dx
        \]`, raw`That is bottom minus top, so it would make the area negative.`),
        correctChoice(raw`\[
          \int_0^4\left(\sqrt{x}-\frac{x^2}{8}\right)\,dx
        \]`, raw`Yes. On this interval, \(\sqrt{x}\) is the upper curve.`),
        wrongChoice(raw`\[
          \int_0^8\left(\sqrt{x}-\frac{x^2}{8}\right)\,dx
        \]`, raw`The curves meet again at \(x=4\), not \(x=8\).`),
        wrongChoice(raw`\[
          \int_0^4\left(x-\frac{x^2}{8}\right)\,dx
        \]`, raw`The top curve is \(\sqrt{x}\), not \(x\).`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Evaluate the area", raw`What is the shaded area?`, [
        wrongChoice(raw`\[
          \frac{16}{3}\text{ units}^2
        \]`, raw`That is only the contribution from \(\int_0^4 \sqrt{x}\,dx\).`),
        wrongChoice(raw`\[
          \frac{4}{3}\text{ units}^2
        \]`, raw`You have subtracted too much. Check the \(x^3/24\) term carefully.`),
        correctChoice(raw`\[
          \frac{8}{3}\text{ units}^2
        \]`, raw`Correct. \(\frac{16}{3}-\frac{8}{3}=\frac{8}{3}\).`),
        wrongChoice(raw`\[
          8\text{ units}^2
        \]`, raw`The exact area is \(\frac{8}{3}\), not \(8\).`)
      ], {
        buttonGridClass: "button-grid two-col"
      })
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
    steps: [
      choiceStep("Separate the variables", raw`Which separated form is correct?`, [
        wrongChoice(raw`\[
          dy = \frac{2x-3x^2}{y}\,dx
        \]`, raw`That moves \(y\) to the wrong side. We want all the \(y\)-terms with \(dy\).`),
        correctChoice(raw`\[
          \frac{1}{y}\,dy = (2x-3x^2)\,dx
        \]`, raw`Correct. Now each side contains only one variable.`),
        wrongChoice(raw`\[
          \frac{1}{x}\,dx = (2y-3y^2)\,dy
        \]`, raw`That swaps the variables and changes the equation.`),
        wrongChoice(raw`\[
          \frac{dy}{2x-3x^2} = y\,dx
        \]`, raw`This does not separate the variables cleanly for integration.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      typedStep("Use the initial condition", raw`After substituting \(x=2\) and \(y=1\), what is the value of \(C\)?`, ["4"], {
        beforeHtml: raw`
          <div class="math-block">
            \[
            \ln|y| = x^2 - x^3 + C
            \]
            \[
            \ln|1| = 2^2 - 2^3 + C
            \]
          </div>
        `,
        ariaLabel: "Type the value of C",
        successMessage: raw`Correct. Since \(\ln 1 = 0\), we get \(0 = 4 - 8 + C\), so \(C=4\).`,
        genericMessage: raw`Remember that \(\ln 1 = 0\).`
      }),
      choiceStep("Find the value of y", raw`What is the value of \(y\) when \(x=1\)?`, [
        wrongChoice(raw`\[
          4
        \]`, raw`That is the constant \(C\), not the value of \(y\).`),
        wrongChoice(raw`\[
          -e^4
        \]`, raw`The initial value is positive, so the solution branch here stays positive.`),
        correctChoice(raw`\[
          e^4
        \]`, raw`Yes. At \(x=1\), \(\ln|y|=4\), and the positive branch gives \(y=e^4\).`),
        wrongChoice(raw`\[
          e
        \]`, raw`The exponent is \(4\), not \(1\).`)
      ], {
        buttonGridClass: "button-grid two-col"
      })
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
        <svg id="question-graph-1e-int-2023" class="graph-svg" viewBox="0 0 520 320" aria-label="Shaded region bounded by y squared equals 10 minus x, y equals 3x, and y equals negative sine of pi x over 10"></svg>
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
    steps: [
      choiceStep("Find the key intersection values", raw`Which set of \(x\)-values is the important one for this region?`, [
        wrongChoice(raw`\[
          x=0,\ 3,\ 10
        \]`, raw`The line and the parabola meet at \(x=1\), not \(x=3\).`),
        correctChoice(raw`\[
          x=0,\ 1,\ 10
        \]`, raw`Correct. Those are the points where the boundary changes.`),
        wrongChoice(raw`\[
          x=0,\ \frac{10}{3},\ 10
        \]`, raw`That uses the line slope without solving the actual intersection equation.`),
        wrongChoice(raw`\[
          x=1,\ 5,\ 10
        \]`, raw`The boundary also starts at the origin, so \(x=0\) matters.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Choose the region strategy", raw`Which setup matches the worked-solution approach from the PDF?`, [
        wrongChoice(raw`\[
          \int_0^{10}\left(3x+\sin\left(\frac{\pi x}{10}\right)\right)\,dx
        \]`, raw`That ignores the parabola for most of the region.`),
        correctChoice(raw`\[
          \int_0^{10}\left(\sqrt{10-x}+\sin\left(\frac{\pi x}{10}\right)\right)\,dx
          -
          \int_0^1\left(\sqrt{10-x}-3x\right)\,dx
        \]`, raw`Yes. Start with the full curved region, then subtract the small cap above the line.`),
        wrongChoice(raw`\[
          \int_0^1\left(\sqrt{10-x}-3x\right)\,dx
          +
          \int_1^{10}\left(3x+\sin\left(\frac{\pi x}{10}\right)\right)\,dx
        \]`, raw`The line is not the top boundary on \(1\le x\le10\).`),
        wrongChoice(raw`\[
          \int_0^{10}\left(\sqrt{10-x}-3x+\sin\left(\frac{\pi x}{10}\right)\right)\,dx
        \]`, raw`That subtracts the line across the whole interval, even where it is not a boundary.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Evaluate the large curved region", raw`What is the value of \(\int_0^{10}\left(\sqrt{10-x}+\sin\left(\frac{\pi x}{10}\right)\right)\,dx\)?`, [
        wrongChoice(raw`\[
          \frac{20\sqrt{10}}{3}-\frac{20}{\pi}
        \]`, raw`The sine part contributes \(+\frac{20}{\pi}\), not \(-\frac{20}{\pi}\).`),
        correctChoice(raw`\[
          \frac{20\sqrt{10}}{3}+\frac{20}{\pi}
        \]`, raw`Correct. This is about \(27.448\).`),
        wrongChoice(raw`\[
          \frac{10\sqrt{10}}{3}+\frac{10}{\pi}
        \]`, raw`Both terms are half the size they should be.`),
        wrongChoice(raw`\[
          \frac{39}{2}+\frac{20}{\pi}
        \]`, raw`That is the final answer after the subtraction, not the first integral by itself.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Subtract the cap and finish", raw`What is the shaded area?`, [
        wrongChoice(raw`\[
          \frac{20\sqrt{10}}{3}+\frac{20}{\pi}
          \approx 27.448
        \]`, raw`That is the whole curved region before subtracting the cap above the line.`),
        wrongChoice(raw`\[
          \frac{20\sqrt{10}}{3}-\frac{39}{2}
          \approx 1.582
        \]`, raw`That is only the cap that needs to be removed.`),
        correctChoice(raw`\[
          \frac{39}{2}+\frac{20}{\pi}
          \approx 25.866
        \]`, raw`Exactly. Subtracting the cap leaves the shaded region only.`),
        wrongChoice(raw`\[
          \frac{39}{2}-\frac{20}{\pi}
          \approx 13.134
        \]`, raw`The sine contribution is positive in the full-region integral, so the sign should not flip here.`)
      ], {
        buttonGridClass: "button-grid two-col"
      })
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
    steps: [
      choiceStep("Spot the inside derivative", raw`What is the derivative of the exponent \(2x-1\)?`, [
        wrongChoice(raw`\[
          1
        \]`, raw`Only the constant disappears. The derivative of \(2x\) is still \(2\).`),
        correctChoice(raw`\[
          2
        \]`, raw`Correct. That is the chain-rule factor we need to undo.`),
        wrongChoice(raw`\[
          2x
        \]`, raw`That differentiates \(x^2\)-style expressions, not a linear expression.`),
        wrongChoice(raw`\[
          e^{2x-1}
        \]`, raw`That is the exponential itself, not the derivative of the exponent.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Undo the chain rule", raw`What is \(\int e^{2x-1}\,dx\)?`, [
        wrongChoice(raw`\[
          e^{2x-1}+C
        \]`, raw`That misses the factor of \(\frac{1}{2}\).`),
        correctChoice(raw`\[
          \frac{1}{2}e^{2x-1}+C
        \]`, raw`Yes. We divide by the inside derivative \(2\).`),
        wrongChoice(raw`\[
          2e^{2x-1}+C
        \]`, raw`That multiplies by \(2\) instead of dividing by it.`),
        wrongChoice(raw`\[
          \frac{1}{2x-1}e^{2x-1}+C
        \]`, raw`We divide by the derivative of the inside, not by the inside itself.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Finish the integral", raw`Which final answer is correct?`, [
        wrongChoice(raw`\[
          e^{2x-1}+C
        \]`, raw`The factor \(4\) has not been fully accounted for.`),
        correctChoice(raw`\[
          2e^{2x-1}+C
        \]`, raw`Correct. \(4\times\frac{1}{2}=2\).`),
        wrongChoice(raw`\[
          4e^{2x-1}+C
        \]`, raw`That ignores the chain-rule division by \(2\).`),
        wrongChoice(raw`\[
          8e^{2x-1}+C
        \]`, raw`The coefficient becomes smaller after integrating, not larger.`)
      ], {
        buttonGridClass: "button-grid two-col"
      })
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
    steps: [
      choiceStep("Integrate the derivative", raw`What is the general antiderivative of \((4x+1)^{-1/2}\)?`, [
        wrongChoice(raw`\[
          2\sqrt{4x+1}+C
        \]`, raw`That is too large by a factor of \(2\).`),
        correctChoice(raw`\[
          \frac{\sqrt{4x+1}}{2}+C
        \]`, raw`Correct. The inside derivative \(4\) has to be accounted for.`),
        wrongChoice(raw`\[
          \sqrt{4x+1}+C
        \]`, raw`That misses the division by \(2\).`),
        wrongChoice(raw`\[
          \ln|4x+1|+C
        \]`, raw`This is a power-rule integral, not a logarithmic one.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      typedStep("Find the constant", raw`Using \(x=6\) and \(y=7.5\), what is \(C\)?`, ["5"], {
        beforeHtml: raw`
          <div class="math-block">
            \[
            y=\frac{\sqrt{4x+1}}{2}+C
            \]
            \[
            7.5=\frac{\sqrt{25}}{2}+C
            \]
          </div>
        `,
        ariaLabel: "Type the value of C",
        successMessage: raw`Correct. Since \(\frac{\sqrt{25}}{2}=\frac{5}{2}=2.5\), the constant is \(5\).`,
        genericMessage: raw`Subtract \(\frac{5}{2}\) from \(7.5\).`
      }),
      choiceStep("Write the solved equation", raw`Which final equation is correct?`, [
        wrongChoice(raw`\[
          y=\sqrt{4x+1}+5
        \]`, raw`The factor of \(\frac{1}{2}\) is missing.`),
        correctChoice(raw`\[
          y=\frac{\sqrt{4x+1}}{2}+5
        \]`, raw`Yes. That is the antiderivative with the correct constant attached.`),
        wrongChoice(raw`\[
          y=\frac{\sqrt{4x+1}}{2}-5
        \]`, raw`The condition gives a positive \(C\), not a negative one.`),
        wrongChoice(raw`\[
          y=\frac{1}{2\sqrt{4x+1}}+5
        \]`, raw`That returns to the derivative, not the integrated function.`)
      ], {
        buttonGridClass: "button-grid two-col"
      })
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
    steps: [
      choiceStep("Rewrite the fraction", raw`Which decomposition is correct?`, [
        wrongChoice(raw`\[
          \frac{6x-3}{2x-3}=3+\frac{3}{2x-3}
        \]`, raw`The remainder should be \(6\), not \(3\).`),
        correctChoice(raw`\[
          \frac{6x-3}{2x-3}=3+\frac{6}{2x-3}
        \]`, raw`Correct. Writing \(6x-3=3(2x-3)+6\) makes the integral much easier.`),
        wrongChoice(raw`\[
          \frac{6x-3}{2x-3}=6+\frac{3}{2x-3}
        \]`, raw`The constant part should be \(3\), not \(6\).`),
        wrongChoice(raw`\[
          \frac{6x-3}{2x-3}=\frac{3}{2x-3}
        \]`, raw`That leaves out the constant part completely.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Apply the bounds", raw`What does the definite integral simplify to after evaluating from \(2\) to \(k\)?`, [
        wrongChoice(raw`\[
          3k+6\ln|2k-3|-6
        \]`, raw`The logarithm coefficient should be \(3\), not \(6\).`),
        correctChoice(raw`\[
          3k+3\ln|2k-3|-6
        \]`, raw`Yes. At the lower bound, \(2(2)-3=1\), and \(\ln 1=0\).`),
        wrongChoice(raw`\[
          3k+3\ln|2k-3|-3
        \]`, raw`The lower-bound constant term is \(3(2)=6\), not \(3\).`),
        wrongChoice(raw`\[
          3k-3\ln|2k-3|-6
        \]`, raw`The logarithm term stays positive during integration.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Solve for k", raw`What is the value of \(k\)?`, [
        wrongChoice(raw`\[
          \frac{e^2-3}{2}
        \]`, raw`You need to add \(3\) before dividing by \(2\).`),
        correctChoice(raw`\[
          \frac{e^2+3}{2}
        \]`, raw`Correct. After the \(3k\) terms cancel, the logarithm equation leads directly to this value.`),
        wrongChoice(raw`\[
          e^2+3
        \]`, raw`That forgets to divide by \(2\) at the end.`),
        wrongChoice(raw`\[
          \frac{3-e^2}{2}
        \]`, raw`That would make \(2k-3\) negative, which does not fit the interval starting at \(x=2\).`)
      ], {
        buttonGridClass: "button-grid two-col"
      })
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
    steps: [
      choiceStep("Differentiate the denominator", raw`What is \(\frac{d}{dx}(\cos 2x-\sin 2x)\)?`, [
        wrongChoice(raw`\[
          -\sin 2x-\cos 2x
        \]`, raw`You still need the factor of \(2\) from differentiating \(2x\).`),
        correctChoice(raw`\[
          -2\sin 2x-2\cos 2x
        \]`, raw`Correct. Both trig terms bring out a factor of \(2\).`),
        wrongChoice(raw`\[
          2\sin 2x-2\cos 2x
        \]`, raw`The derivative of \(\cos 2x\) is negative.`),
        wrongChoice(raw`\[
          2\cos 2x+2\sin 2x
        \]`, raw`That differentiates neither term correctly.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Match the numerator", raw`What factor turns the derivative of the denominator into the numerator?`, [
        wrongChoice(raw`\[
          2
        \]`, raw`That would make the coefficient even larger.`),
        correctChoice(raw`\[
          -\frac{1}{2}
        \]`, raw`Yes. Multiplying by \(-\frac{1}{2}\) changes \(-2(\cos 2x+\sin 2x)\) into \(\cos 2x+\sin 2x\).`),
        wrongChoice(raw`\[
          \frac{1}{2}
        \]`, raw`That fixes the size but not the sign.`),
        wrongChoice(raw`\[
          -2
        \]`, raw`That moves the coefficient in the wrong direction.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Write the logarithmic antiderivative", raw`Which final answer is correct?`, [
        wrongChoice(raw`\[
          \frac{1}{2}\ln|\cos 2x-\sin 2x|+C
        \]`, raw`The sign should be negative.`),
        correctChoice(raw`\[
          -\frac{1}{2}\ln|\cos 2x-\sin 2x|+C
        \]`, raw`Correct. This is exactly the \(\frac{u'}{u}\) logarithm pattern.`),
        wrongChoice(raw`\[
          -\ln|\cos 2x-\sin 2x|+C
        \]`, raw`You still need the factor of \(\frac{1}{2}\).`),
        wrongChoice(raw`\[
          -\frac{1}{2}\ln|\sin 2x-\cos 2x|+C
        \]`, raw`That inside is just the negative of the denominator, so it is not the form built directly from the substitution.`)
      ], {
        buttonGridClass: "button-grid two-col"
      })
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
    steps: [
      choiceStep("Write the model", raw`Which differential equation matches the description?`, [
        wrongChoice(raw`\[
          \frac{dV}{dt}=kV^2
        \]`, raw`The volume is decreasing, so the rate needs a negative sign.`),
        correctChoice(raw`\[
          \frac{dV}{dt}=-kV^2
        \]`, raw`Correct. The negative sign represents the chocolate being pumped out.`),
        wrongChoice(raw`\[
          \frac{dV}{dt}=-kV
        \]`, raw`The question says the rate is proportional to the square of the volume, not the volume itself.`),
        wrongChoice(raw`\[
          \frac{dV}{dt}=-k^2V
        \]`, raw`That changes the model entirely. The square belongs on \(V\).`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Integrate the separated equation", raw`Which general result is the cleanest form after integrating?`, [
        wrongChoice(raw`\[
          V=kt+C
        \]`, raw`That would come from integrating a constant rate, not a \(V^2\) model.`),
        correctChoice(raw`\[
          \frac{1}{V}=kt+C
        \]`, raw`Yes. This is equivalent to \(-\frac{1}{V}=-kt+C\), and it makes the substitutions easier.`),
        wrongChoice(raw`\[
          \ln|V|=-kt+C
        \]`, raw`A logarithm would appear with \(\frac{1}{V}\), not \(\frac{1}{V^2}\).`),
        wrongChoice(raw`\[
          V=\frac{1}{kt+C}
        \]`, raw`That is equivalent after rearranging, but the linear form in \(\frac{1}{V}\) is the cleaner next step.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Use the two time conditions", raw`Which pair of equations comes from \(V(1)=p\) and \(V(2)=\frac{4}{5}p\)?`, [
        wrongChoice(raw`\[
          \frac{1}{p}=k+C,
          \qquad
          \frac{4}{5p}=2k+C
        \]`, raw`When you divide by \(\frac{4}{5}p\), the reciprocal is \(\frac{5}{4p}\), not \(\frac{4}{5p}\).`),
        correctChoice(raw`\[
          \frac{1}{p}=k+C,
          \qquad
          \frac{5}{4p}=2k+C
        \]`, raw`Correct. Those are the two equations we need.`),
        wrongChoice(raw`\[
          p=k+C,
          \qquad
          \frac{4}{5}p=2k+C
        \]`, raw`The linear form is in \(\frac{1}{V}\), not \(V\).`),
        wrongChoice(raw`\[
          \frac{1}{p}=2k+C,
          \qquad
          \frac{5}{4p}=k+C
        \]`, raw`The coefficients of \(k\) should match the times \(t=1\) and \(t=2\).`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Find the starting volume", raw`How much chocolate was in the container at the start of the day?`, [
        wrongChoice(raw`\[
          p
        \]`, raw`That is the volume after one hour, not at the start.`),
        wrongChoice(raw`\[
          \frac{3p}{4}
        \]`, raw`That is the reciprocal step reversed the wrong way.`),
        correctChoice(raw`\[
          \frac{4p}{3}
        \]`, raw`Yes. Since \(\frac{1}{V(0)}=\frac{3}{4p}\), the starting volume is \(\frac{4p}{3}\).`),
        wrongChoice(raw`\[
          \frac{5p}{4}
        \]`, raw`That relates to the reciprocal at \(t=2\), not the starting volume.`)
      ], {
        buttonGridClass: "button-grid two-col"
      })
    ]
  });

  walkthroughs["3a"] = createConfig("3a", "2023 Paper — Simpson’s Rule for a garden section", {
    focus: raw`Read the equally spaced ordinates carefully, identify \(h\), then slot the values into Simpson’s Rule in the correct odd-even pattern.`,
    questionHtml: raw`
      <p class="step-text">A garden designer wants an approximation of the area of the shaded garden section below.</p>
      <div class="graph-frame question-graph-frame">
        <svg id="question-graph-3a-int-2023" class="graph-svg" viewBox="0 0 560 330" aria-label="Garden section measured every 3 metres with ordinates 10, 13, 16, 15, and 14"></svg>
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
    steps: [
      typedStep("Find h", raw`What is the value of \(h\) in Simpson’s Rule?`, ["3"], {
        ariaLabel: "Type the value of h",
        successMessage: raw`Correct. The measurements are taken every \(3\) metres.`,
        genericMessage: raw`Look at the spacing marked along the path.`
      }),
      choiceStep("Use the odd-even pattern", raw`Which substitution into Simpson’s Rule is correct?`, [
        wrongChoice(raw`\[
          \frac{3}{3}\left[10+14+4(16)+2(13+15)\right]
        \]`, raw`The coefficients on the middle ordinates are reversed.`),
        correctChoice(raw`\[
          \frac{3}{3}\left[10+14+4(13+15)+2(16)\right]
        \]`, raw`Yes. The odd interior ordinates get the \(4\), and the even interior ordinate gets the \(2\).`),
        wrongChoice(raw`\[
          \frac{1}{3}\left[10+14+4(13+15)+2(16)\right]
        \]`, raw`You still need the factor of \(h=3\) in front.`),
        wrongChoice(raw`\[
          \frac{3}{2}\left[10+14+13+16+15\right]
        \]`, raw`That is not Simpson’s Rule.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Evaluate the approximation", raw`What is the approximate area of the garden section?`, [
        wrongChoice(raw`\[
          156\text{ m}^2
        \]`, raw`Check the weighted middle terms again.`),
        correctChoice(raw`\[
          168\text{ m}^2
        \]`, raw`Correct. The Simpson’s Rule total comes to \(168\).`),
        wrongChoice(raw`\[
          176\text{ m}^2
        \]`, raw`That adds the ordinates without applying Simpson’s coefficients correctly.`),
        wrongChoice(raw`\[
          84\text{ m}^2
        \]`, raw`That is half the correct result.`)
      ], {
        buttonGridClass: "button-grid two-col"
      })
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
    steps: [
      choiceStep("Simplify the quotient", raw`What does \(\frac{\sqrt{x}-3}{\sqrt{x}}\) simplify to?`, [
        wrongChoice(raw`\[
          1-\frac{3}{x}
        \]`, raw`The denominator is \(\sqrt{x}\), not \(x\).`),
        correctChoice(raw`\[
          1-3x^{-1/2}
        \]`, raw`Correct. Writing the second term as a power makes the integration easier.`),
        wrongChoice(raw`\[
          x^{1/2}-3x^{-1/2}
        \]`, raw`The first term simplifies all the way to \(1\).`),
        wrongChoice(raw`\[
          \sqrt{x}-3\sqrt{x}
        \]`, raw`Dividing by \(\sqrt{x}\) does not multiply both terms by \(\sqrt{x}\).`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Integrate term by term", raw`Which antiderivative is correct?`, [
        wrongChoice(raw`\[
          x-3\sqrt{x}+C
        \]`, raw`The second term is missing a factor of \(2\).`),
        correctChoice(raw`\[
          x-6\sqrt{x}+C
        \]`, raw`Yes. \(\int x^{-1/2}\,dx=2x^{1/2}\).`),
        wrongChoice(raw`\[
          x-6x+C
        \]`, raw`The power \(\frac{1}{2}\) should stay as a square root, not become \(x\).`),
        wrongChoice(raw`\[
          x+6\sqrt{x}+C
        \]`, raw`The second term stays negative after integrating.`)
      ], {
        buttonGridClass: "button-grid two-col"
      })
    ]
  });

  walkthroughs["3c"] = createConfig("3c", "2023 Paper — Product-to-sum in a shaded trig area", {
    focus: raw`Use the product-to-sum identity before integrating, then give the exact area and the decimal approximation.`,
    questionHtml: raw`
      <p class="step-text">The graph below shows the function \(y=5\sin(3x)\sin(x)\).</p>
      <div class="graph-frame question-graph-frame">
        <svg id="question-graph-3c-int-2023" class="graph-svg" viewBox="0 0 470 300" aria-label="Shaded region under y equals 5 sine 3x times sine x from x equals 0 to pi over 3"></svg>
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
    steps: [
      choiceStep("Apply the identity", raw`What does \(5\sin(3x)\sin(x)\) become after using the product-to-sum identity?`, [
        wrongChoice(raw`\[
          \frac{5}{2}\left(\sin 2x-\sin 4x\right)
        \]`, raw`The identity produces cosines here, not sines.`),
        correctChoice(raw`\[
          \frac{5}{2}\left(\cos 2x-\cos 4x\right)
        \]`, raw`Correct. This is the version that integrates cleanly.`),
        wrongChoice(raw`\[
          5\left(\cos 2x-\cos 4x\right)
        \]`, raw`The factor of \(\frac{1}{2}\) from the identity is missing.`),
        wrongChoice(raw`\[
          \frac{5}{2}\left(\cos 4x-\cos 2x\right)
        \]`, raw`The order is reversed, which would change the sign.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Integrate the trig terms", raw`Which antiderivative is correct?`, [
        wrongChoice(raw`\[
          \left[\frac{5}{2}\sin 2x-\frac{5}{2}\sin 4x\right]_0^{\pi/3}
        \]`, raw`Each sine term needs an extra division by the inside coefficient.`),
        correctChoice(raw`\[
          \left[\frac{5}{4}\sin 2x-\frac{5}{8}\sin 4x\right]_0^{\pi/3}
        \]`, raw`Yes. \(\int \cos 2x\,dx=\frac{1}{2}\sin 2x\) and \(\int \cos 4x\,dx=\frac{1}{4}\sin 4x\).`),
        wrongChoice(raw`\[
          \left[-\frac{5}{4}\cos 2x+\frac{5}{8}\cos 4x\right]_0^{\pi/3}
        \]`, raw`That would be the antiderivative of sines, not cosines.`),
        wrongChoice(raw`\[
          \left[\frac{5}{4}\cos 2x-\frac{5}{8}\cos 4x\right]_0^{\pi/3}
        \]`, raw`The antiderivative of cosine is sine.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Finish the area", raw`What is the shaded area?`, [
        wrongChoice(raw`\[
          \frac{5\sqrt{3}}{8}\text{ units}^2
        \]`, raw`That is only the first term after substitution.`),
        correctChoice(raw`\[
          \frac{15\sqrt{3}}{16}\text{ units}^2 \approx 1.624\text{ units}^2
        \]`, raw`Correct. The second sine term is negative, so subtracting it adds another \(\frac{5\sqrt{3}}{16}\).`),
        wrongChoice(raw`\[
          \frac{5\sqrt{3}}{16}\text{ units}^2
        \]`, raw`That is only the contribution from the \(-\frac{5}{8}\sin 4x\) term.`),
        wrongChoice(raw`\[
          \frac{3\sqrt{5}}{16}\text{ units}^2
        \]`, raw`The exact value should involve \(\sqrt{3}\), not \(\sqrt{5}\).`)
      ], {
        buttonGridClass: "button-grid two-col"
      })
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
    steps: [
      choiceStep("Integrate the acceleration", raw`Which antiderivative pattern matches \(\frac{e^{2t}}{4e^{2t}-3}\)?`, [
        wrongChoice(raw`\[
          \ln|e^{2t}|+C
        \]`, raw`The whole denominator \(4e^{2t}-3\) needs to stay inside the logarithm.`),
        correctChoice(raw`\[
          \frac{1}{8}\ln|4e^{2t}-3|+C
        \]`, raw`Correct. The derivative of \(4e^{2t}-3\) is \(8e^{2t}\).`),
        wrongChoice(raw`\[
          \frac{1}{4}\ln|4e^{2t}-3|+C
        \]`, raw`The inside derivative is \(8e^{2t}\), not \(4e^{2t}\).`),
        wrongChoice(raw`\[
          \frac{1}{2}\ln|4e^{2t}-3|+C
        \]`, raw`That is still too large by a factor of \(4\).`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      typedStep("Use the initial velocity", raw`Given that \(v(0)=5\), what is the value of \(C\)?`, ["5"], {
        beforeHtml: raw`
          <div class="math-block">
            \[
            v(t)=\frac{1}{8}\ln|4e^{2t}-3|+C
            \]
            \[
            v(0)=\frac{1}{8}\ln|4e^0-3|+C
            \]
          </div>
        `,
        ariaLabel: "Type the value of C",
        successMessage: raw`Correct. Since \(4e^0-3=1\), the logarithm is \(\ln 1=0\).`,
        genericMessage: raw`At \(t=0\), the logarithm becomes \(\ln 1\).`
      }),
      choiceStep("Find the velocity at 4 seconds", raw`What is the object’s velocity when \(t=4\)?`, [
        wrongChoice(raw`\[
          \frac{1}{8}\ln|4e^8-3|
        \]`, raw`That leaves out the constant \(+5\).`),
        correctChoice(raw`\[
          5+\frac{1}{8}\ln|4e^8-3|
          \approx 6.173\text{ m s}^{-1}
        \]`, raw`Yes. That is the exact expression and its decimal value.`),
        wrongChoice(raw`\[
          5+\frac{1}{4}\ln|4e^8-3|
          \approx 7.347\text{ m s}^{-1}
        \]`, raw`The logarithm coefficient should be \(\frac{1}{8}\), not \(\frac{1}{4}\).`),
        wrongChoice(raw`\[
          5+\ln|4e^8-3|
        \]`, raw`The chain-rule factor has been lost.`)
      ], {
        buttonGridClass: "button-grid two-col"
      })
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
    steps: [
      choiceStep("Simplify the differential equation", raw`After factoring and cancelling common factors, what does the equation become?`, [
        wrongChoice(raw`\[
          \frac{dy}{dx}=-\frac{1+y}{1+x}
        \]`, raw`The factor that remains on top is \(1-y\), not \(1+y\).`),
        correctChoice(raw`\[
          \frac{dy}{dx}=-\frac{1-y}{1+x}
        \]`, raw`Correct. Factoring \(1-x^2\) and \(1-y^2\) lets the common factors cancel cleanly.`),
        wrongChoice(raw`\[
          \frac{dy}{dx}=\frac{1-y}{1-x}
        \]`, raw`The denominator should simplify to \(1+x\), not \(1-x\).`),
        wrongChoice(raw`\[
          \frac{dy}{dx}=-\frac{1-y^2}{1-x^2}
        \]`, raw`That is before the useful cancellation happens.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Separate the variables", raw`Which separated form is correct?`, [
        wrongChoice(raw`\[
          (1-y)\,dy=-\frac{1}{1+x}\,dx
        \]`, raw`The factor \(1-y\) should divide, not multiply, the \(dy\).`),
        correctChoice(raw`\[
          \frac{1}{1-y}\,dy=-\frac{1}{1+x}\,dx
        \]`, raw`Yes. Now each side depends on just one variable.`),
        wrongChoice(raw`\[
          \frac{1}{1+y}\,dy=-\frac{1}{1+x}\,dx
        \]`, raw`The left-hand denominator should be \(1-y\).`),
        wrongChoice(raw`\[
          \frac{1}{1-y}\,dy=\frac{1}{1+x}\,dx
        \]`, raw`The negative sign must stay on the right-hand side.`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Use the initial condition", raw`What is the value of the constant \(C\)?`, [
        wrongChoice(raw`\[
          3
        \]`, raw`The constant comes from a logarithm, so it should not be a plain \(3\).`),
        correctChoice(raw`\[
          \ln 3
        \]`, raw`Correct. Substituting \(x=2\) and \(y=0\) gives \(0=-\ln 3 + C\).`),
        wrongChoice(raw`\[
          -\ln 3
        \]`, raw`That would have the wrong sign after rearranging.`),
        wrongChoice(raw`\[
          0
        \]`, raw`The logarithm on the right does not vanish when \(x=2\).`)
      ], {
        buttonGridClass: "button-grid two-col"
      }),
      choiceStep("Find y when x = 6", raw`What is the value of \(y\) when \(x=6\)?`, [
        wrongChoice(raw`\[
          \frac{4}{3}
        \]`, raw`Check the sign after solving \(1-y=\frac{7}{3}\).`),
        correctChoice(raw`\[
          -\frac{4}{3}
        \]`, raw`Correct. \(1-y=\frac{7}{3}\) gives \(y=1-\frac{7}{3}=-\frac{4}{3}\).`),
        wrongChoice(raw`\[
          \frac{10}{3}
        \]`, raw`That comes from taking the wrong branch of the absolute value equation.`),
        wrongChoice(raw`\[
          -\frac{7}{3}
        \]`, raw`That forgets the extra \(1\) on the left-hand side.`)
      ], {
        buttonGridClass: "button-grid two-col"
      })
    ]
  });

  window.Integration2023Walkthroughs = walkthroughs;
}());
