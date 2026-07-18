(function () {
  const raw = String.raw;
  const paperHref = "level-3-complex-numbers-2021.html";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const metadata = {
    topic: "Complex Numbers",
    year: 2021,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return "complex-2021.html?q=" + encodeURIComponent(id);
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
      browserTitle: "2021 Level 3 Complex Numbers Paper - " + questionLabel(id),
      eyebrow: "Level 3 Complex Numbers Walkthrough",
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

  function answerBox(content) {
    return raw`
      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>
        ${content}
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

  function argandPlotHtml(options) {
    const settings = options || {};
    const width = settings.width || 420;
    const height = settings.height || 420;
    const padding = settings.padding || 30;
    const xMin = settings.xMin == null ? -8 : settings.xMin;
    const xMax = settings.xMax == null ? 8 : settings.xMax;
    const yMin = settings.yMin == null ? -8 : settings.yMin;
    const yMax = settings.yMax == null ? 8 : settings.yMax;
    const scale = createScale(width, height, padding, xMin, xMax, yMin, yMax);
    const gridLines = [];

    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 1) {
      gridLines.push(lineMarkup(scale, x, yMin, x, yMax, "graph-grid-line"));
    }

    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += 1) {
      gridLines.push(lineMarkup(scale, xMin, y, xMax, y, "graph-grid-line"));
    }

    return `
      <div class="graph-frame question-graph-frame">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${settings.ariaLabel || "Argand diagram"}">
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${gridLines.join("")}
          ${lineMarkup(scale, xMin, 0, xMax, 0, "graph-axis")}
          ${lineMarkup(scale, 0, yMin, 0, yMax, "graph-axis")}
          ${circleMarkup(scale, 0, 0, 4.5, "question-origin")}
          ${textMarkup(scale, xMax - 0.35, -0.35, "Real", "graph-label", ' text-anchor="end"')}
          ${textMarkup(scale, 0, yMax - 0.25, "Imaginary", "graph-label", ' text-anchor="middle"')}
          ${(settings.extraMarkup || []).join("")}
          ${(settings.points || []).map(function (point) {
            return circleMarkup(scale, point.x, point.y, point.radius || 5, point.className || "graph-point")
              + textMarkup(
                scale,
                point.labelX !== undefined ? point.labelX : point.x + 0.25,
                point.labelY !== undefined ? point.labelY : point.y + 0.35,
                point.label,
                "graph-label"
              );
          }).join("")}
        </svg>
      </div>
    `;
  }

  function plotted26OverZDiagram() {
    const width = 420;
    const height = 420;
    const padding = 30;
    const scale = createScale(width, height, padding, -8, 8, -8, 8);

    return argandPlotHtml({
      width: width,
      height: height,
      padding: padding,
      xMin: -8,
      xMax: 8,
      yMin: -8,
      yMax: 8,
      ariaLabel: "Argand diagram showing 26 over z at four minus six i",
      extraMarkup: [
        lineMarkup(scale, 0, 0, 4, -6, "graph-measure"),
        lineMarkup(scale, 4, 0, 4, -6, "graph-guide"),
        lineMarkup(scale, 0, -6, 4, -6, "graph-guide"),
        textMarkup(scale, 4, 0.55, "4", "graph-label", ' text-anchor="middle"'),
        textMarkup(scale, -0.25, -6, "-6", "graph-label", ' text-anchor="end"')
      ],
      points: [
        { x: 4, y: -6, label: "4 - 6i", labelX: 4.35, labelY: -5.55 }
      ]
    });
  }

  function circleLocusDiagram(centerX, centerY, radius, label, ariaLabel, excludedPoint) {
    const width = 420;
    const height = 420;
    const padding = 30;
    const scale = createScale(width, height, padding, -4, 8, -5, 7);
    const screenRadius = Math.abs(scale.x(centerX + radius) - scale.x(centerX));
    const extras = [
      `<circle class="graph-curve-secondary" cx="${scale.x(centerX)}" cy="${scale.y(centerY)}" r="${screenRadius}"></circle>`,
      circleMarkup(scale, centerX, centerY, 4.5, "graph-point-secondary"),
      textMarkup(scale, centerX + 0.25, centerY + 0.35, label, "graph-label")
    ];

    if (excludedPoint) {
      extras.push(circleMarkup(scale, excludedPoint.x, excludedPoint.y, 5, "question-origin"));
      extras.push(textMarkup(scale, excludedPoint.x + 0.25, excludedPoint.y - 0.35, excludedPoint.label, "graph-label"));
    }

    return argandPlotHtml({
      width: width,
      height: height,
      padding: padding,
      xMin: -4,
      xMax: 8,
      yMin: -5,
      yMax: 7,
      ariaLabel: ariaLabel,
      extraMarkup: extras
    });
  }

  function modulusCircleDiagram() {
    const width = 420;
    const height = 420;
    const padding = 30;
    const scale = createScale(width, height, padding, -5, 5, -5, 5);
    const radius = Math.abs(scale.x(4) - scale.x(0));

    return argandPlotHtml({
      width: width,
      height: height,
      padding: padding,
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
      ariaLabel: "Circle locus centered at the origin with radius four",
      extraMarkup: [
        `<circle class="graph-curve-secondary" cx="${scale.x(0)}" cy="${scale.y(0)}" r="${radius}"></circle>`,
        lineMarkup(scale, 0, 0, 4, 0, "graph-measure"),
        textMarkup(scale, 2, 0.35, "4", "graph-label", ' text-anchor="middle"'),
        textMarkup(scale, 3.35, 3.35, "|z| = 4", "graph-equation-label")
      ]
    });
  }

  window.Complex2021Walkthroughs = {
    "1a": createConfig("1a", "2021 Paper - multiplying complex numbers", {
      focus: raw`Expand \(wz\), use \(i^2=-1\), then match real or imaginary parts.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Given that } w=d+5i \text{ and } z=3-4i,\text{ find }d\text{ if }wz=38-9i.
          \]
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          d=6
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Set up the product", raw`Substitute the expressions for \(w\) and \(z\).`, raw`
          <div class="math-block">
            \[
            wz=(d+5i)(3-4i)
            \]
          </div>
        `),
        guidedStep("Expand and simplify", raw`Use \(i^2=-1\), so the final term becomes a real number.`, raw`
          <div class="math-block">
            \[
            (d+5i)(3-4i)
            =
            3d+15i-4di-20i^2
            \]
            \[
            =
            3d+20+(15-4d)i
            \]
          </div>
        `),
        guidedStep("Match the real parts", raw`The real part of \(38-9i\) is \(38\).`, raw`
          <div class="math-block">
            \[
            3d+20=38
            \]
            \[
            3d=18
            \]
            \[
            d=6
            \]
          </div>
          <p class="step-text">You could also match imaginary parts: \(15-4d=-9\), which gives the same \(d\).</p>
        `)
      ]
    }),
    "1b": createConfig("1b", "2021 Paper - plotting a complex quotient", {
      focus: raw`Write \(\frac{26}{z}\) in \(a+bi\) form first, then plot the point \((a,b)\).`,
      questionHtml: raw`
        <p class="step-text">If \(z=2+3i\), show \(\frac{26}{z}\) on the Argand diagram below.</p>
        ${plotted26OverZDiagram()}
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \frac{26}{z}=4-6i
          \]
        </div>
        <p class="step-text">Plot the point \(4\) units right and \(6\) units down.</p>
      `),
      guidedSteps: [
        guidedStep("Substitute z", raw`Start by replacing \(z\) with \(2+3i\).`, raw`
          <div class="math-block">
            \[
            \frac{26}{z}
            =
            \frac{26}{2+3i}
            \]
          </div>
        `),
        guidedStep("Multiply by the conjugate", raw`Use \(2-3i\) so the denominator becomes real.`, raw`
          <div class="math-block">
            \[
            \frac{26}{2+3i}\cdot\frac{2-3i}{2-3i}
            =
            \frac{26(2-3i)}{(2+3i)(2-3i)}
            \]
            \[
            =
            \frac{52-78i}{4+9}
            =
            \frac{52-78i}{13}
            \]
          </div>
        `),
        guidedStep("Simplify and plot", raw`The real part gives the horizontal coordinate, and the imaginary part gives the vertical coordinate.`, raw`
          <div class="math-block">
            \[
            \frac{52-78i}{13}=4-6i
            \]
          </div>
          <p class="step-text">On the Argand diagram, plot \((4,-6)\).</p>
        `)
      ]
    }),
    "1c": createConfig("1c", "2021 Paper - remainders and a factor", {
      focus: raw`Translate the remainder information into \(f(-1)=f(2)\), then use the factor information as \(f(-2)=0\).`,
      questionHtml: raw`
        <p class="step-text">The polynomial</p>
        <div class="question-math">
          \[
          f(x)=x^3+3x^2+ax+b
          \]
        </div>
        <p class="step-text">has the same remainder when divided by \((x-2)\) as it does when divided by \((x+1)\).</p>
        <p class="step-text">The polynomial \(f(x)\) also has \((x+2)\) as a factor. Find the values of \(a\) and \(b\).</p>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          a=-6,\qquad b=-16
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Use the remainder theorem", raw`Same remainder means the polynomial has the same value at the two divisor roots.`, raw`
          <div class="math-block">
            \[
            x-2=0\Rightarrow x=2
            \]
            \[
            x+1=0\Rightarrow x=-1
            \]
            \[
            f(-1)=f(2)
            \]
          </div>
        `),
        guidedStep("Solve for a", raw`Substitute \(-1\) and \(2\), then simplify.`, raw`
          <div class="math-block">
            \[
            (-1)^3+3(-1)^2+a(-1)+b
            =
            2^3+3(2)^2+2a+b
            \]
            \[
            2-a+b=20+2a+b
            \]
            \[
            -3a=18
            \]
            \[
            a=-6
            \]
          </div>
        `),
        guidedStep("Use the factor theorem", raw`Since \(x+2\) is a factor, \(x=-2\) makes \(f(x)=0\).`, raw`
          <div class="math-block">
            \[
            f(-2)=0
            \]
            \[
            0=(-2)^3+3(-2)^2+(-6)(-2)+b
            \]
            \[
            0=-8+12+12+b
            \]
            \[
            16+b=0
            \]
            \[
            b=-16
            \]
          </div>
        `)
      ]
    }),
    "1d": createConfig("1d", "2021 Paper - argument of a quotient", {
      focus: raw`Turn the quotient into \(a+bi\) form, then read the argument from the first quadrant.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Show that if }z=1+3i,\text{ then }\arg\left(\frac{z-1}{z-2i}\right)=\frac{\pi}{4}.
          \]
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \frac{z-1}{z-2i}=\frac{3}{2}+\frac{3}{2}i
          \]
          \[
          \arg\left(\frac{z-1}{z-2i}\right)=\frac{\pi}{4}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Substitute z", raw`Replace \(z\) with \(1+3i\).`, raw`
          <div class="math-block">
            \[
            \frac{z-1}{z-2i}
            =
            \frac{1+3i-1}{1+3i-2i}
            =
            \frac{3i}{1+i}
            \]
          </div>
        `),
        guidedStep("Remove i from the denominator", raw`Multiply by the conjugate \(1-i\).`, raw`
          <div class="math-block">
            \[
            \frac{3i}{1+i}\cdot\frac{1-i}{1-i}
            =
            \frac{3i-3i^2}{1-i^2}
            \]
            \[
            =
            \frac{3+3i}{2}
            =
            \frac{3}{2}+\frac{3}{2}i
            \]
          </div>
        `),
        guidedStep("Find the argument", raw`The real and imaginary parts are equal and positive, so the point lies on the \(45^\circ\) line in quadrant one.`, raw`
          <div class="math-block">
            \[
            \arg=\arctan\left(\frac{\frac{3}{2}}{\frac{3}{2}}\right)
            =
            \arctan(1)
            =
            \frac{\pi}{4}
            \]
          </div>
        `)
      ]
    }),
    "1e": createConfig("1e", "2021 Paper - Cartesian equation of a locus", {
      focus: raw`Let \(z=x+yi\), rationalise the fraction, then set the real numerator equal to zero.`,
      questionHtml: raw`
        <p class="step-text">Given that the real part of \(\frac{z-2i}{z-4}\) is zero and \(z\ne4\), prove that the locus of points described by \(z\) is given by</p>
        <div class="question-math">
          \[
          (x-2)^2+(y-1)^2=5.
          \]
        </div>
        ${circleLocusDiagram(2, 1, Math.sqrt(5), "centre (2, 1)", "Circle locus with centre two one and radius root five", { x: 4, y: 0, label: "z=4 excluded" })}
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          (x-2)^2+(y-1)^2=5
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Write z in Cartesian form", raw`Use \(z=x+yi\) so real and imaginary parts can be separated.`, raw`
          <div class="math-block">
            \[
            \frac{z-2i}{z-4}
            =
            \frac{x+(y-2)i}{(x-4)+yi}
            \]
          </div>
        `),
        guidedStep("Multiply by the conjugate", raw`The conjugate of \((x-4)+yi\) is \((x-4)-yi\).`, raw`
          <div class="math-block">
            \[
            \frac{x+(y-2)i}{(x-4)+yi}
            \cdot
            \frac{(x-4)-yi}{(x-4)-yi}
            \]
            \[
            =
            \frac{x(x-4)-xyi+(x-4)(y-2)i-y(y-2)i^2}{(x-4)^2+y^2}
            \]
          </div>
        `),
        guidedStep("Take the real part", raw`Only the non-\(i\) terms contribute to the real part, and \(i^2=-1\).`, raw`
          <div class="math-block">
            \[
            \operatorname{Re}\left(\frac{z-2i}{z-4}\right)
            =
            \frac{x(x-4)+y(y-2)}{(x-4)^2+y^2}
            \]
            \[
            =
            \frac{x^2-4x+y^2-2y}{(x-4)^2+y^2}
            \]
          </div>
        `),
        guidedStep("Set the real part to zero", raw`Because \(z\ne4\), the denominator is not zero, so the numerator must be zero.`, raw`
          <div class="math-block">
            \[
            x^2-4x+y^2-2y=0
            \]
            \[
            (x-2)^2-4+(y-1)^2-1=0
            \]
            \[
            (x-2)^2+(y-1)^2=5
            \]
          </div>
        `)
      ]
    }),
    "2a": createConfig("2a", "2021 Paper - dividing in cis form", {
      focus: raw`Convert \(u=2i\) into cis form, then divide moduli and subtract arguments.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Given that }u=2i\text{ and }w=2\operatorname{cis}\left(\frac{2\pi}{3}\right),\text{ find }z=\frac{u}{w}.
          \]
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          z=\operatorname{cis}\left(-\frac{\pi}{6}\right)
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Write u in cis form", raw`The number \(2i\) has modulus \(2\) and argument \(\frac{\pi}{2}\).`, raw`
          <div class="math-block">
            \[
            u=2\operatorname{cis}\left(\frac{\pi}{2}\right)
            \]
          </div>
        `),
        guidedStep("Divide the moduli and arguments", raw`For division in polar form, divide moduli and subtract arguments.`, raw`
          <div class="math-block">
            \[
            z=\frac{u}{w}
            =
            \frac{2\operatorname{cis}\left(\frac{\pi}{2}\right)}
            {2\operatorname{cis}\left(\frac{2\pi}{3}\right)}
            \]
            \[
            =
            \operatorname{cis}\left(\frac{\pi}{2}-\frac{2\pi}{3}\right)
            \]
          </div>
        `),
        guidedStep("Simplify the angle", raw`Use a common denominator of \(6\).`, raw`
          <div class="math-block">
            \[
            \frac{\pi}{2}-\frac{2\pi}{3}
            =
            \frac{3\pi}{6}-\frac{4\pi}{6}
            =
            -\frac{\pi}{6}
            \]
            \[
            z=\operatorname{cis}\left(-\frac{\pi}{6}\right)
            \]
          </div>
        `)
      ]
    }),
    "2b": createConfig("2b", "2021 Paper - solving a quadratic in q", {
      focus: raw`Complete the square, then take the positive and negative square roots.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Solve }x^2-12qx+20q^2=0\text{ for }x\text{ in terms of }q,\text{ expressing any solutions in their simplest form.}
          \]
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          x=10q\quad\text{or}\quad x=2q
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Complete the square", raw`Half of \(-12q\) is \(-6q\), so use \((x-6q)^2\).`, raw`
          <div class="math-block">
            \[
            x^2-12qx+20q^2=0
            \]
            \[
            (x-6q)^2-36q^2+20q^2=0
            \]
            \[
            (x-6q)^2=16q^2
            \]
          </div>
        `),
        guidedStep("Take square roots", raw`Remember both the positive and negative roots.`, raw`
          <div class="math-block">
            \[
            x-6q=\pm4q
            \]
          </div>
        `),
        guidedStep("Write both solutions", raw`Solve each linear equation.`, raw`
          <div class="math-block">
            \[
            x=6q+4q=10q
            \]
            \[
            x=6q-4q=2q
            \]
          </div>
        `)
      ]
    }),
    "2c": createConfig("2c", "2021 Paper - proving a quotient is imaginary", {
      focus: raw`Multiply by the conjugate of the denominator and show the real terms cancel.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Prove that }\frac{a+bi}{b-ai}\text{ is purely imaginary, where }a\text{ and }b\text{ are real constants.}
          \]
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \frac{a+bi}{b-ai}=i
          \]
        </div>
        <p class="step-text">So the expression is purely imaginary, provided the denominator is defined.</p>
      `),
      guidedSteps: [
        guidedStep("Use the conjugate", raw`The conjugate of \(b-ai\) is \(b+ai\).`, raw`
          <div class="math-block">
            \[
            \frac{a+bi}{b-ai}\cdot\frac{b+ai}{b+ai}
            \]
          </div>
        `),
        guidedStep("Expand the numerator", raw`Use \(i^2=-1\) and look for cancellation.`, raw`
          <div class="math-block">
            \[
            (a+bi)(b+ai)
            =
            ab+a^2i+b^2i+ab i^2
            \]
            \[
            =
            ab-ab+(a^2+b^2)i
            \]
            \[
            =
            (a^2+b^2)i
            \]
          </div>
        `),
        guidedStep("Simplify the denominator", raw`The denominator becomes a sum of squares.`, raw`
          <div class="math-block">
            \[
            (b-ai)(b+ai)=b^2+a^2
            \]
            \[
            \frac{a+bi}{b-ai}
            =
            \frac{(a^2+b^2)i}{a^2+b^2}
            =
            i
            \]
          </div>
          <p class="step-text">Since the result has zero real part, it is purely imaginary.</p>
        `)
      ]
    }),
    "2d": createConfig("2d", "2021 Paper - cube roots in cis form", {
      focus: raw`Write the right-hand side in polar form, then use De Moivre's theorem for cube roots.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Solve the equation }z^3=k^6+k^6i,\text{ where }k\text{ is a real constant.}
          \]
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          z=\sqrt[6]{2}\,k^2\operatorname{cis}\left(\frac{\pi}{12}\right),\quad
          \sqrt[6]{2}\,k^2\operatorname{cis}\left(\frac{3\pi}{4}\right),\quad
          \sqrt[6]{2}\,k^2\operatorname{cis}\left(-\frac{7\pi}{12}\right)
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Write the number in cis form", raw`The real and imaginary parts are both \(k^6\), so the argument is \(\frac{\pi}{4}\).`, raw`
          <div class="math-block">
            \[
            k^6+k^6i
            =
            \sqrt{2}\,k^6\operatorname{cis}\left(\frac{\pi}{4}\right)
            \]
          </div>
        `),
        guidedStep("Set up all cube roots", raw`Add \(2n\pi\) before dividing the argument by \(3\).`, raw`
          <div class="math-block">
            \[
            z^3=\sqrt{2}\,k^6\operatorname{cis}\left(\frac{\pi}{4}+2n\pi\right)
            \]
            \[
            z=\sqrt[6]{2}\,k^2
            \operatorname{cis}\left(\frac{\pi}{12}+\frac{2n\pi}{3}\right),
            \qquad n=0,1,2
            \]
          </div>
        `),
        guidedStep("List the three roots", raw`Substitute \(n=0,1,2\).`, raw`
          <div class="math-block">
            \[
            n=0:\quad z_1=\sqrt[6]{2}\,k^2\operatorname{cis}\left(\frac{\pi}{12}\right)
            \]
            \[
            n=1:\quad z_2=\sqrt[6]{2}\,k^2\operatorname{cis}\left(\frac{3\pi}{4}\right)
            \]
            \[
            n=2:\quad z_3=\sqrt[6]{2}\,k^2\operatorname{cis}\left(\frac{17\pi}{12}\right)
            =
            \sqrt[6]{2}\,k^2\operatorname{cis}\left(-\frac{7\pi}{12}\right)
            \]
          </div>
        `)
      ]
    }),
    "2e": createConfig("2e", "2021 Paper - modulus locus", {
      focus: raw`Let \(z=x+yi\), translate each modulus into a distance expression, then simplify.`,
      questionHtml: raw`
        <p class="step-text">If \(z\) is a complex number and</p>
        <div class="question-math">
          \[
          |z+16|=4|z+1|,
          \]
        </div>
        <p class="step-text">find the value of \(|z|\).</p>
        ${modulusCircleDiagram()}
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          |z|=4
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Let z equal x plus yi", raw`This turns the modulus equation into a Cartesian distance equation.`, raw`
          <div class="math-block">
            \[
            z=x+yi
            \]
            \[
            |z+16|=\sqrt{(x+16)^2+y^2}
            \]
            \[
            |z+1|=\sqrt{(x+1)^2+y^2}
            \]
          </div>
        `),
        guidedStep("Square both sides", raw`Both sides are non-negative, so squaring is valid.`, raw`
          <div class="math-block">
            \[
            \sqrt{(x+16)^2+y^2}
            =
            4\sqrt{(x+1)^2+y^2}
            \]
            \[
            (x+16)^2+y^2
            =
            16\left((x+1)^2+y^2\right)
            \]
          </div>
        `),
        guidedStep("Simplify the locus", raw`Expand and collect like terms.`, raw`
          <div class="math-block">
            \[
            x^2+32x+256+y^2
            =
            16x^2+32x+16+16y^2
            \]
            \[
            15x^2+15y^2=240
            \]
            \[
            x^2+y^2=16
            \]
          </div>
        `),
        guidedStep("Read off |z|", raw`The modulus of \(z=x+yi\) is \(\sqrt{x^2+y^2}\).`, raw`
          <div class="math-block">
            \[
            |z|=\sqrt{x^2+y^2}
            \]
            \[
            |z|=\sqrt{16}=4
            \]
          </div>
        `)
      ]
    }),
    "3a": createConfig("3a", "2021 Paper - modulus and argument", {
      focus: raw`Use \(|u|^2=5^2+m^2\), then use the argument condition to choose the positive root.`,
      questionHtml: raw`
        <p class="step-text">The complex number \(u=5+mi\) has \(|u|=6\).</p>
        <p class="step-text">Given that \(0<\arg(u)<\frac{\pi}{2}\), find the exact value of the real number \(m\).</p>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          m=\sqrt{11}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Use the modulus", raw`For \(u=5+mi\), the modulus is \(\sqrt{5^2+m^2}\).`, raw`
          <div class="math-block">
            \[
            |u|=6
            \]
            \[
            \sqrt{5^2+m^2}=6
            \]
            \[
            25+m^2=36
            \]
          </div>
        `),
        guidedStep("Solve for m", raw`This gives two algebraic roots at first.`, raw`
          <div class="math-block">
            \[
            m^2=11
            \]
            \[
            m=\pm\sqrt{11}
            \]
          </div>
        `),
        guidedStep("Use the argument condition", raw`The condition \(0<\arg(u)<\frac{\pi}{2}\) puts \(u\) in quadrant one, so the imaginary part must be positive.`, raw`
          <div class="math-block">
            \[
            m>0
            \]
            \[
            m=\sqrt{11}
            \]
          </div>
        `)
      ]
    }),
    "3b": createConfig("3b", "2021 Paper - rationalising a surd denominator", {
      focus: raw`Multiply by the conjugate \(4+2\sqrt{3}\), then simplify.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Write }\frac{18}{4-2\sqrt{3}}\text{ in the form }a+b\sqrt{3},\text{ where }a\text{ and }b\text{ are integers.}
          \]
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          18+9\sqrt{3}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Choose the conjugate", raw`The conjugate of \(4-2\sqrt{3}\) is \(4+2\sqrt{3}\).`, raw`
          <div class="math-block">
            \[
            \frac{18}{4-2\sqrt{3}}
            \cdot
            \frac{4+2\sqrt{3}}{4+2\sqrt{3}}
            \]
          </div>
        `),
        guidedStep("Expand and simplify", raw`The denominator becomes a difference of squares.`, raw`
          <div class="math-block">
            \[
            =
            \frac{18(4+2\sqrt{3})}{(4-2\sqrt{3})(4+2\sqrt{3})}
            \]
            \[
            =
            \frac{72+36\sqrt{3}}{16-12}
            =
            \frac{72+36\sqrt{3}}{4}
            \]
          </div>
        `),
        guidedStep("Write the required form", raw`Divide both terms in the numerator by \(4\).`, raw`
          <div class="math-block">
            \[
            \frac{72+36\sqrt{3}}{4}
            =
            18+9\sqrt{3}
            \]
          </div>
        `)
      ]
    }),
    "3c": createConfig("3c", "2021 Paper - conjugate root and cubic factorisation", {
      focus: raw`Because the coefficients are real, the conjugate root is also a root. Use those two roots to build a quadratic factor.`,
      questionHtml: raw`
        <p class="step-text">One solution of</p>
        <div class="question-math">
          \[
          4z^3-19z^2+128z+A=0
          \]
        </div>
        <p class="step-text">is \(z=2+5i\). If \(A\) is real, find the value of \(A\) and the other two solutions of the equation.</p>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          A=-87
          \]
          \[
          z=2-5i,\qquad z=\frac{3}{4}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Use the conjugate root", raw`With real coefficients, complex roots come in conjugate pairs.`, raw`
          <div class="math-block">
            \[
            z=2+5i\quad\Rightarrow\quad z=2-5i
            \]
          </div>
        `),
        guidedStep("Build the quadratic factor", raw`Multiply the two linear factors from the conjugate pair.`, raw`
          <div class="math-block">
            \[
            (z-(2+5i))(z-(2-5i))
            \]
            \[
            =
            (z-2-5i)(z-2+5i)
            \]
            \[
            =
            (z-2)^2+25
            =
            z^2-4z+29
            \]
          </div>
        `),
        guidedStep("Add the remaining linear factor", raw`The leading coefficient is \(4\), so write the full cubic as \((z^2-4z+29)(4z-a)\).`, raw`
          <div class="math-block">
            \[
            (z^2-4z+29)(4z-a)
            \]
            \[
            =
            4z^3-(16+a)z^2+(116+4a)z-29a
            \]
          </div>
        `),
        guidedStep("Match coefficients", raw`Compare with \(4z^3-19z^2+128z+A\).`, raw`
          <div class="math-block">
            \[
            -(16+a)=-19
            \]
            \[
            a=3
            \]
            \[
            A=-29a=-87
            \]
          </div>
        `),
        guidedStep("Find the final root", raw`The remaining factor is \(4z-3\).`, raw`
          <div class="math-block">
            \[
            4z-3=0
            \]
            \[
            z=\frac{3}{4}
            \]
          </div>
          <p class="step-text">So the other two solutions are \(2-5i\) and \(\frac{3}{4}\).</p>
        `)
      ]
    }),
    "3d": createConfig("3d", "2021 Paper - solving a radical equation", {
      focus: raw`Isolate the remaining square root after squaring, then square again.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Solve }6\sqrt{2x}-5=6\sqrt{2x+m}\text{ for }x\text{ in terms of }m.
          \]
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          x=\frac{1}{2}\left(\frac{25-36m}{60}\right)^2
          \]
        </div>
        <p class="step-text">For a real solution in the original equation, the sign conditions require \(m\le -\frac{25}{36}\).</p>
      `),
      guidedSteps: [
        guidedStep("Square both sides", raw`This removes the square root on the right, but leaves one root term from the left expansion.`, raw`
          <div class="math-block">
            \[
            \left(6\sqrt{2x}-5\right)^2
            =
            \left(6\sqrt{2x+m}\right)^2
            \]
            \[
            36(2x)+25-60\sqrt{2x}
            =
            36(2x+m)
            \]
          </div>
        `),
        guidedStep("Isolate the remaining root", raw`The \(36(2x)\) terms cancel from both sides.`, raw`
          <div class="math-block">
            \[
            25-60\sqrt{2x}=36m
            \]
            \[
            25-36m=60\sqrt{2x}
            \]
          </div>
        `),
        guidedStep("Square again and solve", raw`Now the remaining square root is isolated.`, raw`
          <div class="math-block">
            \[
            \left(\frac{25-36m}{60}\right)^2=2x
            \]
            \[
            x=\frac{1}{2}\left(\frac{25-36m}{60}\right)^2
            \]
          </div>
          <p class="step-text">Because we squared, check the original equation if a value of \(m\) is supplied.</p>
        `)
      ]
    }),
    "3e": createConfig("3e", "2021 Paper - solving an equation with modulus", {
      focus: raw`Let \(z=x+yi\), then equate real and imaginary parts.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Solve }z^2=i\left(|z|^2-4\right).
          \]
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          z=1-i\quad\text{or}\quad z=-1+i
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Let z equal x plus yi", raw`This lets us compare real and imaginary parts.`, raw`
          <div class="math-block">
            \[
            z=x+yi
            \]
            \[
            z^2=(x+yi)^2=x^2-y^2+2xyi
            \]
            \[
            i(|z|^2-4)=i(x^2+y^2-4)
            \]
          </div>
        `),
        guidedStep("Equate real parts", raw`The right-hand side has no real part.`, raw`
          <div class="math-block">
            \[
            x^2-y^2=0
            \]
            \[
            x^2=y^2
            \]
            \[
            x=\pm y
            \]
          </div>
        `),
        guidedStep("Equate imaginary parts", raw`The imaginary coefficients must also match.`, raw`
          <div class="math-block">
            \[
            2xy=x^2+y^2-4
            \]
          </div>
        `),
        guidedStep("Test the two real-part cases", raw`Use \(x=y\) and \(x=-y\) in the imaginary-part equation.`, raw`
          <div class="math-block">
            \[
            x=y:\quad 2x^2=2x^2-4
            \]
            \[
            \text{No solution}
            \]
            \[
            x=-y:\quad -2x^2=2x^2-4
            \]
            \[
            x^2=1
            \]
          </div>
        `),
        guidedStep("Write the complex numbers", raw`Since \(x=-y\), the two possibilities are \((x,y)=(1,-1)\) and \((-1,1)\).`, raw`
          <div class="math-block">
            \[
            (x,y)=(1,-1)\Rightarrow z=1-i
            \]
            \[
            (x,y)=(-1,1)\Rightarrow z=-1+i
            \]
          </div>
        `)
      ]
    })
  };
}());
