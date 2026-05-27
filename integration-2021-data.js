(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-integration-2021";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const questionLabels = {
    "1a": "Question 1(a)",
    "1b": "Question 1(b)(i)",
    "1c": "Question 1(b)(ii)",
    "1d": "Question 1(c)",
    "1e": "Question 1(d)",
    "2a": "Question 2(a)",
    "2b": "Question 2(b)",
    "2c": "Question 2(c)",
    "2d": "Question 2(d)",
    "2e": "Question 2(e)",
    "3a": "Question 3(a)",
    "3b": "Question 3(b)",
    "3c": "Question 3(c)",
    "3d": "Question 3(d)",
    "3e": "Question 3(e)"
  };
  const metadata = {
    topic: "Integration",
    year: 2021,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };

  function questionLabel(id) {
    return questionLabels[id] || "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return "int-" + id + "2021.html";
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
      browserTitle: "2021 Integration Paper - " + questionLabel(id),
      eyebrow: "Level 3 Integration Walkthrough",
      title: questionLabel(id),
      subtitle: subtitle,
      backHref: paperHref,
      nextHref: next ? pageHref(next) : paperHref,
      nextLabel: next ? "Next question →" : "Back to paper",
      finalNav: buildFinalNav(id),
      metadata: metadata
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

    if (step <= 0) {
      return points;
    }

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

  function areaUnderCurvePath(fn, start, end, baseline, step, scale) {
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

  function areaBetweenCurvesPath(topFn, bottomFn, start, end, step, scale) {
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

  function draw2dGraph() {
    const svg = document.getElementById("question-graph-2d-int-2021");

    if (!svg) {
      return;
    }

    const width = 500;
    const height = 320;
    const padding = 34;
    const k = (2 * Math.exp(2) + 4) / 3;
    const scale = createScale(width, height, padding, -2.7, 7.2, -4.2, 7.2);
    const fn = function (x) {
      return 6 / (3 * x - 4);
    };

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -2.7, 0, 7.2, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -4.2, 0, 7.2, "graph-axis")}
      ${lineMarkup(scale, 4 / 3, -4.2, 4 / 3, 7.2, "graph-guide")}
      <path class="question-shade" d="${areaUnderCurvePath(fn, 2, k, 0, 0.025, scale)}"></path>
      <path class="question-curve" d="${functionPath(fn, -2.6, 1.08, 0.025, scale)}"></path>
      <path class="question-curve" d="${functionPath(fn, 1.58, 7.05, 0.025, scale)}"></path>
      ${lineMarkup(scale, 2, 0, 2, fn(2), "graph-guide")}
      ${lineMarkup(scale, k, 0, k, fn(k), "graph-guide")}
      ${circleMarkup(scale, 0, 0, 6, "question-origin")}
      ${textMarkup(scale, 7.05, -0.22, "x", "question-axis-label")}
      ${textMarkup(scale, -0.12, 6.95, "y", "question-axis-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 2, -0.35, "2", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, k, -0.35, "k", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 4.55, 1.35, "area = 4", "graph-equation-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 5.45, 3.2, "y = 6 / (3x - 4)", "graph-equation-label", ' text-anchor="middle"')}
    `;
  }

  function draw2eGraph() {
    const svg = document.getElementById("question-graph-2e-int-2021");

    if (!svg) {
      return;
    }

    const width = 520;
    const height = 360;
    const padding = 34;
    const scale = createScale(width, height, padding, -0.55, 4.65, -3.2, 3.2);
    const branch = function (x) {
      return Math.sqrt(Math.max(0, 9 - 8 * Math.exp(-0.5 * x)));
    };

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -0.55, 0, 4.65, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -3.2, 0, 3.2, "graph-axis")}
      ${lineMarkup(scale, 3, -2.69, 3, 2.69, "graph-guide")}
      <path class="question-curve" d="${functionPath(branch, -0.22, 4.5, 0.02, scale)}"></path>
      <path class="question-curve" d="${functionPath(function (x) { return -branch(x); }, -0.22, 4.5, 0.02, scale)}"></path>
      ${circleMarkup(scale, 0, 0, 6, "question-origin")}
      ${textMarkup(scale, 4.52, -0.16, "x", "question-axis-label")}
      ${textMarkup(scale, -0.08, 3.02, "y", "question-axis-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 3, -0.22, "3", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, -0.12, 2, "2", "graph-label", ' text-anchor="end"')}
      ${textMarkup(scale, -0.12, 1, "1", "graph-label", ' text-anchor="end"')}
      ${textMarkup(scale, -0.12, -1, "-1", "graph-label", ' text-anchor="end"')}
      ${textMarkup(scale, -0.12, -2, "-2", "graph-label", ' text-anchor="end"')}
      ${textMarkup(scale, 3.05, 2.86, "P", "graph-equation-label")}
      ${textMarkup(scale, 3.05, -2.75, "Q", "graph-equation-label")}
    `;
  }

  function draw3dGraph() {
    const svg = document.getElementById("question-graph-3d-int-2021");

    if (!svg) {
      return;
    }

    const width = 540;
    const height = 330;
    const padding = 34;
    const scale = createScale(width, height, padding, -0.75, 7.1, -3.3, 3.25);
    const fn = function (x) {
      return (3 * x - 2) / (x + 2);
    };

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -0.75, 0, 7.1, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -3.3, 0, 3.25, "graph-axis")}
      ${lineMarkup(scale, -0.75, 1, 7.1, 1, "graph-guide")}
      ${lineMarkup(scale, -0.75, 2, 7.1, 2, "graph-guide")}
      <path class="question-shade" d="${areaUnderCurvePath(fn, 2, 6, 0, 0.02, scale)}"></path>
      <path class="question-curve" d="${functionPath(fn, -0.72, 7, 0.02, scale)}"></path>
      ${lineMarkup(scale, 2, 0, 2, fn(2), "graph-guide")}
      ${lineMarkup(scale, 6, 0, 6, fn(6), "graph-guide")}
      ${circleMarkup(scale, 0, 0, 6, "question-origin")}
      ${textMarkup(scale, 6.95, -0.16, "x", "question-axis-label")}
      ${textMarkup(scale, -0.08, 3.02, "y", "question-axis-label", ' text-anchor="middle"')}
      ${textMarkup(scale, -0.12, 1, "1", "graph-label", ' text-anchor="end"')}
      ${textMarkup(scale, -0.12, 2, "2", "graph-label", ' text-anchor="end"')}
      ${textMarkup(scale, 2, -0.22, "2", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 6, -0.22, "6", "graph-label", ' text-anchor="middle"')}
      ${textMarkup(scale, 4.7, 2.45, "y = (3x - 2) / (x + 2)", "graph-equation-label", ' text-anchor="middle"')}
    `;
  }

  function draw3eGraph() {
    const svg = document.getElementById("question-graph-3e-int-2021");

    if (!svg) {
      return;
    }

    const width = 500;
    const height = 360;
    const padding = 34;
    const displayK = 2;
    const xStart = 0.5 * Math.log(1 / displayK);
    const scale = createScale(width, height, padding, -1.25, 0.75, -0.35, 4.8);
    const topFn = function (x) {
      return displayK * displayK * Math.exp(2 * x);
    };
    const bottomFn = function () {
      return displayK;
    };

    svg.innerHTML = `
      <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
      ${lineMarkup(scale, -1.25, 0, 0.75, 0, "graph-axis")}
      ${lineMarkup(scale, 0, -0.35, 0, 4.8, "graph-axis")}
      ${lineMarkup(scale, -1.25, displayK, 0.75, displayK, "graph-measure-soft")}
      <path class="question-shade" d="${areaBetweenCurvesPath(topFn, bottomFn, xStart, 0, 0.01, scale)}"></path>
      <path class="question-curve" d="${functionPath(topFn, -1.2, 0.32, 0.01, scale)}"></path>
      ${lineMarkup(scale, xStart, 0, xStart, displayK, "graph-guide")}
      ${circleMarkup(scale, 0, 0, 6, "question-origin")}
      ${textMarkup(scale, 0.68, -0.08, "x", "question-axis-label")}
      ${textMarkup(scale, 0.03, 4.6, "y", "question-axis-label")}
      ${textMarkup(scale, -0.86, displayK + 0.2, "y = k", "graph-equation-label")}
      ${textMarkup(scale, 0.26, 4.18, "y = (ke^x)^2", "graph-equation-label")}
    `;
  }

  window.Integration2021Walkthroughs = {
    "1a": createConfig("1a", "Question One - basic antiderivative", {
      focus: raw`Split the two terms and remember that \(\int \frac{1}{x}\,dx=\ln|x|\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find } \int \left(\frac{x}{3}+\frac{3}{x}\right)\,dx.
          \]
        </div>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          \int \left(\frac{x}{3}+\frac{3}{x}\right)\,dx
          =
          \frac{x^2}{6}+3\ln|x|+C
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Split the integral", raw`Each term has a standard antiderivative, so deal with them separately.`, raw`
          <div class="math-block">
            \[
            \int \left(\frac{x}{3}+\frac{3}{x}\right)\,dx
            =
            \int \frac{x}{3}\,dx+\int \frac{3}{x}\,dx
            \]
          </div>
        `),
        guidedStep("Integrate each term", raw`Use the power rule for the \(x\)-term and the logarithm rule for the reciprocal term.`, raw`
          <div class="math-block">
            \[
            \int \frac{x}{3}\,dx=\frac{1}{3}\cdot\frac{x^2}{2}=\frac{x^2}{6}
            \]
            \[
            \int \frac{3}{x}\,dx=3\ln|x|
            \]
          </div>
        `),
        guidedStep("Add the constant", raw`For an indefinite integral, add one constant of integration at the end.`, raw`
          <div class="math-block">
            \[
            \int \left(\frac{x}{3}+\frac{3}{x}\right)\,dx
            =
            \frac{x^2}{6}+3\ln|x|+C
            \]
          </div>
        `)
      ]
    }),
    "1b": createConfig("1b", "Question One - finding a curve from its gradient", {
      focus: raw`Integrate the gradient function, then use the point \((1,3)\) to find \(C\).`,
      questionHtml: raw`
        <p class="step-text">The gradient function of a curve is</p>
        <div class="question-math">
          \[
          \frac{dy}{dx}=\frac{8}{x^3}.
          \]
        </div>
        <p class="step-text">Find the equation of the curve if it passes through the point \((1,3)\).</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          y=-4x^{-2}+7
          \]
          \[
          \text{or } y=7-\frac{4}{x^2}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Rewrite the gradient", raw`The power rule is easier to apply when the denominator is written as a negative power.`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}=\frac{8}{x^3}=8x^{-3}
            \]
          </div>
        `),
        guidedStep("Integrate to find y", raw`The curve is found by integrating the gradient function.`, raw`
          <div class="math-block">
            \[
            y=\int 8x^{-3}\,dx
            \]
            \[
            y=8\cdot\frac{x^{-2}}{-2}+C
            \]
            \[
            y=-4x^{-2}+C
            \]
          </div>
        `),
        guidedStep("Use the point", raw`Substitute \(x=1\) and \(y=3\) into the general equation.`, raw`
          <div class="math-block">
            \[
            3=-4(1)^{-2}+C
            \]
            \[
            3=-4+C
            \]
            \[
            C=7
            \]
          </div>
        `),
        guidedStep("Write the equation", raw`Put the constant back into the curve equation.`, raw`
          <div class="math-block">
            \[
            y=-4x^{-2}+7
            \]
            \[
            y=7-\frac{4}{x^2}
            \]
          </div>
        `)
      ]
    }),
    "1c": createConfig("1c", "Question One - area under the curve", {
      focus: raw`Use the curve from the previous part and integrate it between \(x=1\) and \(x=2\).`,
      questionHtml: raw`
        <p class="step-text">Using the curve from the previous part, find the area enclosed by the curve, the \(x\)-axis, and the lines \(x=1\) and \(x=2\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          A=\int_{1}^{2}\left(-4x^{-2}+7\right)\,dx=5
          \]
        </div>
        <p class="step-text">The area is \(5\) square units.</p>
      `),
      guidedSteps: [
        guidedStep("Set up the area", raw`On \(1\le x\le 2\), the curve \(y=-4x^{-2}+7\) is above the \(x\)-axis, so no absolute-value adjustment is needed.`, raw`
          <div class="math-block">
            \[
            A=\int_{1}^{2}\left(-4x^{-2}+7\right)\,dx
            \]
          </div>
        `),
        guidedStep("Find the antiderivative", raw`Use the power rule again, then integrate the constant \(7\).`, raw`
          <div class="math-block">
            \[
            \int \left(-4x^{-2}+7\right)\,dx
            =
            4x^{-1}+7x+C
            \]
          </div>
        `),
        guidedStep("Evaluate the limits", raw`Substitute the upper limit and subtract the lower limit.`, raw`
          <div class="math-block">
            \[
            A=\left[4x^{-1}+7x\right]_{1}^{2}
            \]
            \[
            A=\left(2+14\right)-\left(4+7\right)
            \]
            \[
            A=16-11=5
            \]
          </div>
        `)
      ]
    }),
    "1d": createConfig("1d", "Question One - acceleration to displacement", {
      focus: raw`Integrate acceleration to velocity, use the velocity condition, then integrate velocity to displacement.`,
      questionHtml: raw`
        <p class="step-text">An object's motion can be modelled by the differential equation</p>
        <div class="question-math">
          \[
          a(t)=2-\sin 2t,\qquad t\ge 0,
          \]
        </div>
        <p class="step-text">where \(a\) is the acceleration of the object in \(\text{m s}^{-2}\), and \(t\) is time in seconds.</p>
        <p class="step-text">At \(t=0\), the object has a velocity of \(1\text{ m s}^{-1}\) and a displacement of \(3\text{ m}\).</p>
        <p class="step-text">What is the displacement of the object at time \(t=5\)?</p>
        <p class="step-text question-note">Angles are in radians.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          s(5)=25+\frac{\sin 10}{4}+\frac{5}{2}+3
          \]
          \[
          s(5)\approx 30.36\text{ m}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Integrate to get velocity", raw`Acceleration is the derivative of velocity.`, raw`
          <div class="math-block">
            \[
            v(t)=\int \left(2-\sin 2t\right)\,dt
            \]
            \[
            v(t)=2t+\frac{\cos 2t}{2}+C
            \]
          </div>
        `),
        guidedStep("Use the starting velocity", raw`Substitute \(t=0\) and \(v=1\) to find the first constant.`, raw`
          <div class="math-block">
            \[
            1=2(0)+\frac{\cos 0}{2}+C
            \]
            \[
            1=\frac{1}{2}+C
            \]
            \[
            C=\frac{1}{2}
            \]
            \[
            v(t)=2t+\frac{\cos 2t}{2}+\frac{1}{2}
            \]
          </div>
        `),
        guidedStep("Integrate to get displacement", raw`Velocity is the derivative of displacement.`, raw`
          <div class="math-block">
            \[
            s(t)=\int \left(2t+\frac{\cos 2t}{2}+\frac{1}{2}\right)\,dt
            \]
            \[
            s(t)=t^2+\frac{\sin 2t}{4}+\frac{t}{2}+C
            \]
          </div>
        `),
        guidedStep("Use the starting displacement", raw`Substitute \(t=0\) and \(s=3\) to find the second constant.`, raw`
          <div class="math-block">
            \[
            3=0+\frac{\sin 0}{4}+0+C
            \]
            \[
            C=3
            \]
            \[
            s(t)=t^2+\frac{\sin 2t}{4}+\frac{t}{2}+3
            \]
          </div>
        `),
        guidedStep("Evaluate at t equals 5", raw`Now substitute \(t=5\) into the displacement function.`, raw`
          <div class="math-block">
            \[
            s(5)=5^2+\frac{\sin(10)}{4}+\frac{5}{2}+3
            \]
            \[
            s(5)\approx 30.36
            \]
          </div>
          <p class="step-text">The displacement at \(t=5\) is approximately \(30.36\text{ m}\).</p>
        `)
      ]
    }),
    "1e": createConfig("1e", "Question One - leaking tank model", {
      focus: raw`A proportional rate means write a differential equation with a constant \(k\), then use the two volume readings to find it.`,
      questionHtml: raw`
        <p class="step-text">A water tank developed a leak.</p>
        <p class="step-text">Six hours after the tank started to leak, the volume of water in the tank was \(400\) litres.</p>
        <p class="step-text">Ten hours after the tank started to leak, the volume of water in the tank was \(256\) litres.</p>
        <p class="step-text">The rate at which the water leaks out of the tank at any instant is proportional to the square root of the volume of water in the tank at that instant.</p>
        <p class="step-text">How much water was in the tank at the instant it started to leak?</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          2\sqrt{V}=kt+C,\qquad k=-2,\qquad C=52
          \]
          \[
          2\sqrt{V}=52
          \Rightarrow
          V=676
          \]
        </div>
        <p class="step-text">The tank initially contained \(676\text{ L}\) of water.</p>
      `),
      guidedSteps: [
        guidedStep("Write and separate the model", raw`The volume is decreasing, so the constant will come out negative.`, raw`
          <div class="math-block">
            \[
            \frac{dV}{dt}=k\sqrt{V}
            \]
            \[
            V^{-1/2}\,dV=k\,dt
            \]
          </div>
        `),
        guidedStep("Integrate the model", raw`Integrate both sides to connect volume and time.`, raw`
          <div class="math-block">
            \[
            \int V^{-1/2}\,dV=\int k\,dt
            \]
            \[
            2\sqrt{V}=kt+C
            \]
          </div>
        `),
        guidedStep("Use the first reading", raw`At \(t=6\), the volume is \(400\) litres.`, raw`
          <div class="math-block">
            \[
            2\sqrt{400}=6k+C
            \]
            \[
            40=6k+C
            \]
            \[
            C=40-6k
            \]
          </div>
        `),
        guidedStep("Use the second reading", raw`At \(t=10\), the volume is \(256\) litres.`, raw`
          <div class="math-block">
            \[
            2\sqrt{256}=10k+C
            \]
            \[
            32=10k+40-6k
            \]
            \[
            32=4k+40
            \]
            \[
            k=-2
            \]
          </div>
        `),
        guidedStep("Find the starting volume", raw`Use \(k=-2\) to find \(C\), then put \(t=0\).`, raw`
          <div class="math-block">
            \[
            C=40-6(-2)=52
            \]
            \[
            2\sqrt{V}=-2t+52
            \]
            \[
            t=0:\quad 2\sqrt{V}=52
            \]
            \[
            \sqrt{V}=26
            \]
            \[
            V=676
            \]
          </div>
        `)
      ]
    }),
    "2a": createConfig("2a", "Question Two - exponential and radical antiderivative", {
      focus: raw`Use the reverse chain rule for \(e^{4x}\) and rewrite \(\sqrt{x}\) as \(x^{1/2}\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find } \int \left(e^{4x}+4\sqrt{x}\right)\,dx.
          \]
        </div>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          \int \left(e^{4x}+4\sqrt{x}\right)\,dx
          =
          \frac{e^{4x}}{4}+\frac{8}{3}x^{3/2}+C
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Rewrite the radical", raw`A power form makes the power rule straightforward.`, raw`
          <div class="math-block">
            \[
            4\sqrt{x}=4x^{1/2}
            \]
          </div>
        `),
        guidedStep("Integrate each term", raw`Remember to divide by the inside derivative for \(e^{4x}\).`, raw`
          <div class="math-block">
            \[
            \int e^{4x}\,dx=\frac{e^{4x}}{4}
            \]
            \[
            \int 4x^{1/2}\,dx
            =
            4\cdot\frac{x^{3/2}}{3/2}
            =
            \frac{8}{3}x^{3/2}
            \]
          </div>
        `),
        guidedStep("Combine the answer", raw`Add the constant of integration once.`, raw`
          <div class="math-block">
            \[
            \int \left(e^{4x}+4\sqrt{x}\right)\,dx
            =
            \frac{e^{4x}}{4}+\frac{8}{3}x^{3/2}+C
            \]
          </div>
        `)
      ]
    }),
    "2b": createConfig("2b", "Question Two - adding a constant inside an integral", {
      focus: raw`Split the integral: \(\int(h(x)+2)\,dx=\int h(x)\,dx+\int 2\,dx\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{If } \int_{1}^{5}h(x)\,dx=6,\text{ what is the value of }
          \int_{1}^{5}\left(h(x)+2\right)\,dx?
          \]
        </div>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          \int_{1}^{5}\left(h(x)+2\right)\,dx=14
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Split the integral", raw`Use the given integral and handle the added \(2\) separately.`, raw`
          <div class="math-block">
            \[
            \int_{1}^{5}\left(h(x)+2\right)\,dx
            =
            \int_{1}^{5}h(x)\,dx+\int_{1}^{5}2\,dx
            \]
          </div>
        `),
        guidedStep("Use the given value", raw`The first part is already given as \(6\).`, raw`
          <div class="math-block">
            \[
            \int_{1}^{5}h(x)\,dx=6
            \]
          </div>
        `),
        guidedStep("Add the rectangular area", raw`The integral of \(2\) from \(1\) to \(5\) is a rectangle of height \(2\) and width \(4\).`, raw`
          <div class="math-block">
            \[
            \int_{1}^{5}2\,dx=2(5-1)=8
            \]
            \[
            \int_{1}^{5}\left(h(x)+2\right)\,dx=6+8=14
            \]
          </div>
        `)
      ]
    }),
    "2c": createConfig("2c", "Question Two - product-to-sum trigonometric integral", {
      focus: raw`Convert \(\sin 6x\sin 2x\) into cosines before integrating.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find } \int_{0}^{\pi/8}\sin 6x\sin 2x\,dx.
          \]
        </div>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          \int_{0}^{\pi/8}\sin 6x\sin 2x\,dx=\frac{1}{8}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Use product-to-sum", raw`This identity turns the product of sines into a sum of cosines.`, raw`
          <div class="math-block">
            \[
            \sin A\sin B=\frac{1}{2}\left(\cos(A-B)-\cos(A+B)\right)
            \]
            \[
            \sin 6x\sin 2x
            =
            \frac{1}{2}\left(\cos 4x-\cos 8x\right)
            \]
          </div>
        `),
        guidedStep("Integrate the cosines", raw`Each cosine term needs the reverse chain rule.`, raw`
          <div class="math-block">
            \[
            \int_{0}^{\pi/8}\sin 6x\sin 2x\,dx
            =
            \int_{0}^{\pi/8}\left(\frac{1}{2}\cos4x-\frac{1}{2}\cos8x\right)\,dx
            \]
            \[
            =
            \left[\frac{\sin4x}{8}-\frac{\sin8x}{16}\right]_{0}^{\pi/8}
            \]
          </div>
        `),
        guidedStep("Evaluate the bounds", raw`At \(x=\pi/8\), \(\sin(\pi/2)=1\) and \(\sin\pi=0\).`, raw`
          <div class="math-block">
            \[
            \left[\frac{\sin4x}{8}-\frac{\sin8x}{16}\right]_{0}^{\pi/8}
            =
            \left(\frac{1}{8}-0\right)-0
            =
            \frac{1}{8}
            \]
          </div>
        `)
      ]
    }),
    "2d": createConfig("2d", "Question Two - shaded logarithmic area", {
      focus: raw`The shaded area is under \(g(x)=\frac{6}{3x-4}\) from \(x=2\) to \(x=k\). Set that integral equal to \(4\).`,
      questionHtml: raw`
        <p class="step-text">The diagram below shows part of the graph of the function</p>
        <div class="question-math">
          \[
          g(x)=\frac{6}{3x-4}.
          \]
        </div>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-2d-int-2021" class="graph-svg" viewBox="0 0 500 320" aria-label="Shaded area under g of x from x equals 2 to x equals k"></svg>
        </div>
        <p class="step-text">The area of the shaded region is \(4\). Find the value of \(k\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          \int_{2}^{k}\frac{6}{3x-4}\,dx=4
          \]
          \[
          k=\frac{2e^2+4}{3}\approx 6.26
          \]
        </div>
      `),
      afterRender: draw2dGraph,
      guidedSteps: [
        guidedStep("Set up the area equation", raw`The curve is above the \(x\)-axis on the shaded interval.`, raw`
          <div class="math-block">
            \[
            \int_{2}^{k}\frac{6}{3x-4}\,dx=4
            \]
          </div>
        `),
        guidedStep("Integrate the function", raw`Because the derivative of \(3x-4\) is \(3\), the antiderivative is logarithmic.`, raw`
          <div class="math-block">
            \[
            \int \frac{6}{3x-4}\,dx
            =
            2\ln|3x-4|+C
            \]
          </div>
        `),
        guidedStep("Apply the limits", raw`Substitute \(k\) and \(2\), then set the result equal to \(4\).`, raw`
          <div class="math-block">
            \[
            \left[2\ln|3x-4|\right]_{2}^{k}=4
            \]
            \[
            2\ln|3k-4|-2\ln|2|=4
            \]
            \[
            \ln\left(\frac{3k-4}{2}\right)=2
            \]
          </div>
        `),
        guidedStep("Solve for k", raw`Exponentiate both sides, then isolate \(k\).`, raw`
          <div class="math-block">
            \[
            \frac{3k-4}{2}=e^2
            \]
            \[
            3k-4=2e^2
            \]
            \[
            k=\frac{2e^2+4}{3}
            \]
            \[
            k\approx 6.26
            \]
          </div>
        `)
      ]
    }),
    "2e": createConfig("2e", "Question Two - separable differential equation and vertical distance", {
      focus: raw`Separate variables, use the two \(y\)-intercepts from the graph, then find the matching \(y\)-values when \(x=3\).`,
      questionHtml: raw`
        <p class="step-text">The diagram below shows the graph of a curve \(y=f(x)\), which satisfies the differential equation</p>
        <div class="question-math">
          \[
          \frac{dy}{dx}=\frac{2}{ye^{0.5x}}.
          \]
        </div>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-2e-int-2021" class="graph-svg" viewBox="0 0 520 360" aria-label="Curve with points P and Q at x equals 3"></svg>
        </div>
        <p class="step-text">Points P and Q are the points on the graph of the curve that have \(x\)-coordinates of \(3\). What is the vertical distance between points P and Q?</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          y=\pm\sqrt{2\left(4.5-4e^{-1.5}\right)}\approx \pm 2.686
          \]
          \[
          \text{vertical distance}=2.686-(-2.686)=5.372
          \]
        </div>
        <p class="step-text">The vertical distance is approximately \(5.372\) units.</p>
      `),
      afterRender: draw2eGraph,
      guidedSteps: [
        guidedStep("Separate the variables", raw`Rewrite \(e^{0.5x}\) in the numerator as \(e^{-0.5x}\).`, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}=\frac{2}{ye^{0.5x}}
            \]
            \[
            y\,dy=2e^{-0.5x}\,dx
            \]
          </div>
        `),
        guidedStep("Integrate both sides", raw`The left side is a power rule, and the right side is an exponential reverse-chain-rule integral.`, raw`
          <div class="math-block">
            \[
            \int y\,dy=\int 2e^{-0.5x}\,dx
            \]
            \[
            \frac{y^2}{2}=-4e^{-0.5x}+C
            \]
          </div>
        `),
        guidedStep("Use the intercepts", raw`The graph shows \(y=\pm 1\) when \(x=0\). Both branches give the same \(y^2\), so the same constant applies.`, raw`
          <div class="math-block">
            \[
            \frac{1^2}{2}=-4e^0+C
            \]
            \[
            \frac{1}{2}=-4+C
            \]
            \[
            C=4.5
            \]
          </div>
        `),
        guidedStep("Find the y-values at x equals 3", raw`Substitute \(x=3\) into the integrated equation.`, raw`
          <div class="math-block">
            \[
            \frac{y^2}{2}=-4e^{-1.5}+4.5
            \]
            \[
            \frac{y^2}{2}\approx 3.607
            \]
            \[
            y=\pm\sqrt{2(3.607)}
            \]
            \[
            y\approx \pm 2.686
            \]
          </div>
        `),
        guidedStep("Calculate the vertical distance", raw`Vertical distance is the top \(y\)-value minus the bottom \(y\)-value.`, raw`
          <div class="math-block">
            \[
            d=2.686-(-2.686)
            \]
            \[
            d=5.372
            \]
          </div>
        `)
      ]
    }),
    "3a": createConfig("3a", "Question Three - expanding before integrating", {
      focus: raw`Expand the square first so the integral becomes a sum of powers of \(x\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find } \int \left(x+\sqrt{x}\right)^2\,dx.
          \]
        </div>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          \int \left(x+\sqrt{x}\right)^2\,dx
          =
          \frac{x^3}{3}+\frac{x^2}{2}+\frac{4}{5}x^{5/2}+C
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Expand the square", raw`Use \((a+b)^2=a^2+2ab+b^2\).`, raw`
          <div class="math-block">
            \[
            \left(x+\sqrt{x}\right)^2
            =
            x^2+2x\sqrt{x}+x
            \]
            \[
            =
            x^2+x+2x^{3/2}
            \]
          </div>
        `),
        guidedStep("Integrate term by term", raw`Now each term is a power of \(x\).`, raw`
          <div class="math-block">
            \[
            \int \left(x^2+x+2x^{3/2}\right)\,dx
            =
            \frac{x^3}{3}+\frac{x^2}{2}+2\cdot\frac{x^{5/2}}{5/2}+C
            \]
          </div>
        `),
        guidedStep("Simplify the last coefficient", raw`Dividing by \(\frac{5}{2}\) is the same as multiplying by \(\frac{2}{5}\).`, raw`
          <div class="math-block">
            \[
            2\cdot\frac{x^{5/2}}{5/2}
            =
            \frac{4}{5}x^{5/2}
            \]
            \[
            \int \left(x+\sqrt{x}\right)^2\,dx
            =
            \frac{x^3}{3}+\frac{x^2}{2}+\frac{4}{5}x^{5/2}+C
            \]
          </div>
        `)
      ]
    }),
    "3b": createConfig("3b", "Question Three - Trapezium Rule approximation", {
      focus: raw`The \(x\)-values are evenly spaced by \(0.25\), so use that as the trapezium width.`,
      questionHtml: raw`
        <p class="step-text">Use the values given in the table below to find an approximation to \(\int_{1}^{2.5}f(x)\,dx\) using the Trapezium Rule.</p>
        <div class="table-wrap">
          <table class="question-data-table">
            <thead>
              <tr>
                <th scope="col">\(x\)</th>
                <th scope="col">1</th>
                <th scope="col">1.25</th>
                <th scope="col">1.5</th>
                <th scope="col">1.75</th>
                <th scope="col">2</th>
                <th scope="col">2.25</th>
                <th scope="col">2.5</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">\(f(x)\)</th>
                <td>0.8</td>
                <td>1.1</td>
                <td>1.5</td>
                <td>1.9</td>
                <td>2.2</td>
                <td>2.1</td>
                <td>2.4</td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          \int_{1}^{2.5}f(x)\,dx\approx 2.6
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Find the width", raw`The gap between consecutive \(x\)-values is constant.`, raw`
          <div class="math-block">
            \[
            h=1.25-1=0.25
            \]
          </div>
        `),
        guidedStep("Set up the trapezium rule", raw`Count the first and last \(y\)-values once, and all the middle \(y\)-values twice.`, raw`
          <div class="math-block">
            \[
            \int_{1}^{2.5}f(x)\,dx
            \approx
            \frac{h}{2}
            \left(y_0+y_6+2(y_1+y_2+y_3+y_4+y_5)\right)
            \]
          </div>
        `),
        guidedStep("Substitute the values", raw`Use the \(f(x)\)-row from the table.`, raw`
          <div class="math-block">
            \[
            \int_{1}^{2.5}f(x)\,dx
            \approx
            \frac{0.25}{2}
            \left(0.8+2.4+2(1.1+1.5+1.9+2.2+2.1)\right)
            \]
            \[
            =
            0.125(3.2+17.6)
            =
            2.6
            \]
          </div>
        `)
      ]
    }),
    "3c": createConfig("3c", "Question Three - separable trigonometric differential equation", {
      focus: raw`Separate \(y\) from \(x\), integrate \(\sec^2(2x)\), then use the given point to find the constant.`,
      questionHtml: raw`
        <p class="step-text">Consider the differential equation</p>
        <div class="question-math">
          \[
          \frac{dy}{dx}=\frac{\sec^2 2x}{y}.
          \]
        </div>
        <p class="step-text">Given that \(y=2\) when \(x=\frac{3\pi}{8}\), find the value(s) of \(y\) when \(x=\pi\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          \frac{y^2}{2}=2.5
          \]
          \[
          y=\pm\sqrt{5}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Separate the variables", raw`Move \(y\) to the left before integrating.`, raw`
          <div class="math-block">
            \[
            y\,dy=\sec^2(2x)\,dx
            \]
          </div>
        `),
        guidedStep("Integrate both sides", raw`Since \(\frac{d}{dx}\tan(2x)=2\sec^2(2x)\), include the factor \(\frac{1}{2}\).`, raw`
          <div class="math-block">
            \[
            \int y\,dy=\int \sec^2(2x)\,dx
            \]
            \[
            \frac{y^2}{2}=\frac{\tan 2x}{2}+C
            \]
          </div>
        `),
        guidedStep("Find the constant", raw`Substitute \(x=\frac{3\pi}{8}\) and \(y=2\).`, raw`
          <div class="math-block">
            \[
            \frac{2^2}{2}=\frac{\tan\left(2\cdot\frac{3\pi}{8}\right)}{2}+C
            \]
            \[
            2=\frac{\tan\left(\frac{3\pi}{4}\right)}{2}+C
            \]
            \[
            2=-\frac{1}{2}+C
            \]
            \[
            C=2.5
            \]
          </div>
        `),
        guidedStep("Substitute x equals pi", raw`At \(x=\pi\), \(\tan(2\pi)=0\).`, raw`
          <div class="math-block">
            \[
            \frac{y^2}{2}=\frac{\tan(2\pi)}{2}+2.5
            \]
            \[
            \frac{y^2}{2}=2.5
            \]
            \[
            y^2=5
            \]
            \[
            y=\pm\sqrt{5}
            \]
          </div>
        `)
      ]
    }),
    "3d": createConfig("3d", "Question Three - shaded area under a rational curve", {
      focus: raw`Find the \(x\)-limits from the \(y\)-values shown on the graph, then integrate the curve above the \(x\)-axis.`,
      questionHtml: raw`
        <p class="step-text">The diagram below shows part of the graph of the function</p>
        <div class="question-math">
          \[
          y=\frac{3x-2}{x+2}.
          \]
        </div>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3d-int-2021" class="graph-svg" viewBox="0 0 540 330" aria-label="Shaded area under y equals three x minus two over x plus two from x equals two to x equals six"></svg>
        </div>
        <p class="step-text">Find the shaded area.</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          A=\int_{2}^{6}\frac{3x-2}{x+2}\,dx
          =
          12-8\ln2
          \approx 6.45
          \]
        </div>
        <p class="step-text">The shaded area is approximately \(6.45\) square units.</p>
      `),
      afterRender: draw3dGraph,
      guidedSteps: [
        guidedStep("Find the x-limits", raw`The endpoints of the shaded region occur where the curve has \(y=1\) and \(y=2\).`, raw`
          <div class="math-block">
            \[
            1=\frac{3x-2}{x+2}
            \Rightarrow
            x+2=3x-2
            \Rightarrow
            x=2
            \]
            \[
            2=\frac{3x-2}{x+2}
            \Rightarrow
            2x+4=3x-2
            \Rightarrow
            x=6
            \]
          </div>
        `),
        guidedStep("Rewrite the function", raw`Divide or rearrange the numerator so the integral becomes a constant minus a reciprocal term.`, raw`
          <div class="math-block">
            \[
            3x-2=3(x+2)-8
            \]
            \[
            \frac{3x-2}{x+2}
            =
            \frac{3(x+2)-8}{x+2}
            =
            3-\frac{8}{x+2}
            \]
          </div>
        `),
        guidedStep("Set up and integrate the area", raw`The curve is above the \(x\)-axis from \(x=2\) to \(x=6\).`, raw`
          <div class="math-block">
            \[
            A=\int_{2}^{6}\left(3-\frac{8}{x+2}\right)\,dx
            \]
            \[
            A=\left[3x-8\ln|x+2|\right]_{2}^{6}
            \]
          </div>
        `),
        guidedStep("Evaluate the exact area", raw`Use log rules to simplify the final expression.`, raw`
          <div class="math-block">
            \[
            A=\left(18-8\ln8\right)-\left(6-8\ln4\right)
            \]
            \[
            A=12-8(\ln8-\ln4)
            \]
            \[
            A=12-8\ln2
            \]
            \[
            A\approx 6.45
            \]
          </div>
        `)
      ]
    }),
    "3e": createConfig("3e", "Question Three - proving a shaded exponential area", {
      focus: raw`Find the intersection first. Then use top minus bottom from the intersection to the \(y\)-axis.`,
      questionHtml: raw`
        <p class="step-text">The graph below shows the functions</p>
        <div class="question-math">
          \[
          y=(ke^x)^2
          \qquad\text{and}\qquad
          y=k,
          \]
        </div>
        <p class="step-text">where \(k\) is a constant greater than \(1\).</p>
        <div class="graph-frame question-graph-frame">
          <svg id="question-graph-3e-int-2021" class="graph-svg" viewBox="0 0 500 360" aria-label="Shaded area between y equals k squared e to the two x and y equals k"></svg>
        </div>
        <p class="step-text">Show that the shaded area is \(\frac{k}{2}\left(k-1+\ln\frac{1}{k}\right)\).</p>
        <p class="step-text question-note">You must use calculus and show the results of any integration needed to solve the problem. Clearly show each step of your working.</p>
      `,
      answerHtml: answerHighlight("Final answer", raw`
        <div class="math-block">
          \[
          A=\frac{k}{2}\left(k-1+\ln\frac{1}{k}\right)
          \]
        </div>
      `),
      afterRender: draw3eGraph,
      guidedSteps: [
        guidedStep("Find the intersection", raw`Set the two functions equal to get the left-hand limit of the shaded region.`, raw`
          <div class="math-block">
            \[
            (ke^x)^2=k
            \]
            \[
            k^2e^{2x}=k
            \]
            \[
            ke^{2x}=1
            \]
            \[
            e^{2x}=\frac{1}{k}
            \]
            \[
            x=\frac{1}{2}\ln\frac{1}{k}
            \]
          </div>
        `),
        guidedStep("Set up top minus bottom", raw`At the \(y\)-axis, \((ke^0)^2=k^2\), which is above \(k\) because \(k>1\).`, raw`
          <div class="math-block">
            \[
            A=\int_{\frac{1}{2}\ln(1/k)}^{0}\left(k^2e^{2x}-k\right)\,dx
            \]
          </div>
        `),
        guidedStep("Integrate", raw`Treat \(k\) as a constant.`, raw`
          <div class="math-block">
            \[
            \int \left(k^2e^{2x}-k\right)\,dx
            =
            \frac{k^2e^{2x}}{2}-kx+C
            \]
            \[
            A=
            \left[\frac{k^2e^{2x}}{2}-kx\right]_{\frac{1}{2}\ln(1/k)}^{0}
            \]
          </div>
        `),
        guidedStep("Evaluate the bounds", raw`Use \(e^{\ln(1/k)}=\frac{1}{k}\) at the lower limit.`, raw`
          <div class="math-block">
            \[
            A=
            \frac{k^2}{2}
            -
            \left(
            \frac{k^2e^{\ln(1/k)}}{2}
            -
            \frac{k}{2}\ln\frac{1}{k}
            \right)
            \]
            \[
            A=
            \frac{k^2}{2}
            -
            \left(
            \frac{k^2}{2k}
            -
            \frac{k}{2}\ln\frac{1}{k}
            \right)
            \]
            \[
            A=
            \frac{k^2}{2}-\frac{k}{2}+\frac{k}{2}\ln\frac{1}{k}
            \]
          </div>
        `),
        guidedStep("Factor the result", raw`Take out the common factor \(\frac{k}{2}\) to match the required form.`, raw`
          <div class="math-block">
            \[
            A=
            \frac{k}{2}
            \left(k-1+\ln\frac{1}{k}\right)
            \]
          </div>
        `)
      ]
    })
  };
}());
