(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-complex-2018";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const metadata = {
    topic: "Complex Numbers",
    year: 2018,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };
  const tags = [
    "Complex Numbers",
    "2018",
    "NCEA Level 3 Calculus",
    "mixed / Excellence-style"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return "complex-2018.html?q=" + encodeURIComponent(id);
  }

  function previousId(id) {
    const index = questionOrder.indexOf(id);
    return index > 0 ? questionOrder[index - 1] : null;
  }

  function nextId(id) {
    const index = questionOrder.indexOf(id);
    return index >= 0 && index < questionOrder.length - 1
      ? questionOrder[index + 1]
      : null;
  }

  function buildFinalNav(id) {
    const previous = previousId(id);
    const next = nextId(id);

    return {
      secondary: previous
        ? { href: pageHref(previous), label: "← Back to " + questionLabel(previous) }
        : { href: paperHref, label: "← Back to paper" },
      primary: next
        ? { href: pageHref(next), label: "Next question →" }
        : { href: paperHref, label: "Back to paper" }
    };
  }

  function buildPartNavigation(id) {
    return questionOrder.map(function (partId) {
      return {
        href: pageHref(partId),
        label: partId.charAt(0) + "(" + partId.charAt(1) + ")",
        current: partId === id
      };
    });
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
      <div class="answer-highlight walkthrough-answer-highlight">
        <p class="question-label">Final Answer</p>
        ${content}
      </div>
    `;
  }

  function createConfig(id, subtitle, details) {
    const next = nextId(id);
    const finalAnswer = details.answerHtml;
    const guidedSteps = (details.guidedSteps || []).map(function (step) {
      return Object.assign({}, step);
    });

    if (guidedSteps.length && finalAnswer) {
      guidedSteps[guidedSteps.length - 1].workingHtml += finalAnswer;
    }

    return Object.assign({
      browserTitle: "2018 Level 3 Complex Numbers Paper - " + questionLabel(id),
      eyebrow: "Level 3 Complex Numbers Walkthrough",
      title: questionLabel(id),
      subtitle: subtitle,
      backHref: paperHref,
      nextHref: next ? pageHref(next) : paperHref,
      nextLabel: next ? "Next question →" : "Back to paper",
      finalNav: buildFinalNav(id),
      partNavigation: buildPartNavigation(id),
      partNavigationTitle: "2018 paper questions",
      metadata: metadata,
      tags: tags
    }, details, {
      guidedSteps: guidedSteps
    });
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
    return "<line class=\"" + className
      + "\" x1=\"" + scale.x(x1)
      + "\" y1=\"" + scale.y(y1)
      + "\" x2=\"" + scale.x(x2)
      + "\" y2=\"" + scale.y(y2)
      + "\"" + (extra || "") + "></line>";
  }

  function circleMarkup(scale, x, y, radius, className) {
    return "<circle class=\"" + className
      + "\" cx=\"" + scale.x(x)
      + "\" cy=\"" + scale.y(y)
      + "\" r=\"" + radius + "\"></circle>";
  }

  function textMarkup(scale, x, y, content, className, extra) {
    return "<text class=\"" + className
      + "\" x=\"" + scale.x(x)
      + "\" y=\"" + scale.y(y)
      + "\"" + (extra || "") + ">" + content + "</text>";
  }

  function argandDiagram(points, ariaLabel) {
    const width = 440;
    const height = 440;
    const padding = 38;
    const xMin = -6;
    const xMax = 6;
    const yMin = -6;
    const yMax = 6;
    const scale = createScale(width, height, padding, xMin, xMax, yMin, yMax);
    const gridLines = [];
    const axisLabels = [];

    for (let x = xMin; x <= xMax; x += 1) {
      gridLines.push(lineMarkup(scale, x, yMin, x, yMax, "graph-grid-line"));
      if (x !== 0 && x % 2 === 0) {
        axisLabels.push(textMarkup(scale, x, -0.38, String(x), "graph-label", ' text-anchor="middle"'));
      }
    }

    for (let y = yMin; y <= yMax; y += 1) {
      gridLines.push(lineMarkup(scale, xMin, y, xMax, y, "graph-grid-line"));
      if (y !== 0 && y % 2 === 0) {
        axisLabels.push(textMarkup(scale, -0.28, y, String(y), "graph-label", ' text-anchor="end" dominant-baseline="middle"'));
      }
    }

    return [
      '<div class="graph-frame question-graph-frame">',
      '<svg class="graph-svg" viewBox="0 0 ' + width + " " + height + '" role="img" aria-label="' + ariaLabel + '">',
      '<rect class="graph-bg" x="0" y="0" width="' + width + '" height="' + height + '"></rect>',
      gridLines.join(""),
      lineMarkup(scale, xMin, 0, xMax, 0, "graph-axis"),
      lineMarkup(scale, 0, yMin, 0, yMax, "graph-axis"),
      axisLabels.join(""),
      circleMarkup(scale, 0, 0, 4.5, "question-origin"),
      textMarkup(scale, xMax - 0.55, 0.55, "Real", "graph-label", ' text-anchor="end"'),
      textMarkup(scale, 0.45, yMax - 0.7, "Imaginary", "graph-label"),
      points.map(function (point) {
        return circleMarkup(scale, point.x, point.y, point.radius || 5, point.className || "graph-point")
          + textMarkup(
            scale,
            point.labelX !== undefined ? point.labelX : point.x + 0.25,
            point.labelY !== undefined ? point.labelY : point.y + 0.35,
            point.label,
            "graph-label"
          );
      }).join(""),
      "</svg>",
      "</div>"
    ].join("");
  }

  function initialArgandDiagram() {
    return argandDiagram([
      { x: -2, y: 3, label: "u", labelX: -2.55, labelY: 3.35 },
      { x: 4, y: 2, label: "v", labelX: 4.25, labelY: 2.35 }
    ], "Argand diagram from negative six to six on each axis, showing u at negative two plus three i and v at four plus two i.");
  }

  function conjugateArgandDiagram() {
    return argandDiagram([
      { x: -2, y: 3, label: "u", labelX: -2.55, labelY: 3.35 },
      { x: 4, y: 2, label: "v", labelX: 4.25, labelY: 2.35 },
      { x: 4, y: -2, label: "conjugate of v", labelX: 1.8, labelY: -2.35, className: "graph-point-secondary" }
    ], "Argand diagram showing u and v, with the conjugate of v reflected to four minus two i.");
  }

  function completedArgandDiagram() {
    return argandDiagram([
      { x: -2, y: 3, label: "u", labelX: -2.55, labelY: 3.35, className: "graph-point-secondary" },
      { x: 4, y: 2, label: "v", labelX: 4.25, labelY: 2.35, className: "graph-point-secondary" },
      { x: 4, y: -2, label: "conjugate of v", labelX: 1.8, labelY: -2.35, className: "graph-point-secondary" },
      { x: 2, y: 1, label: "w = 2 + i", labelX: 2.25, labelY: 1.35 }
    ], "Completed Argand diagram showing w equals two plus i at the coordinate two, one.");
  }

  window.Complex2018Walkthroughs = {
    "1a": createConfig("1a", "2018 Complex Numbers", {
      focus: raw`Use the Remainder Theorem: division by \(x-2\) gives remainder \(f(2)\).`,
      questionHtml: raw`
        <div class="question-math">
          <p class="step-text">What is the remainder when</p>
          \[
          2x^3-3x^2+4x+3
          \]
          <p class="step-text">is divided by \(x-2\)?</p>
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \boxed{15}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Name the polynomial and divisor root", raw`Write the dividend as \(f(x)\). The divisor \(x-2\) is zero at \(x=2\).`, raw`
          <p class="step-text">Let</p>
          <div class="math-block">
            \[
            f(x)=2x^3-3x^2+4x+3.
            \]
          </div>
          <p class="step-text">By the Remainder Theorem, dividing \(f(x)\) by \(x-2\) leaves the constant remainder \(f(2)\).</p>
        `),
        guidedStep("Substitute x = 2", raw`Replace every occurrence of \(x\) with \(2\), keeping the powers and coefficients visible.`, raw`
          <div class="math-block">
            \[
            f(2)=2(2)^3-3(2)^2+4(2)+3.
            \]
          </div>
        `),
        guidedStep("Evaluate the remainder", raw`Calculate the powers first, then combine the four terms.`, raw`
          <div class="math-block">
            \[
            f(2)=16-12+8+3=15.
            \]
          </div>
          <p class="step-text">Therefore the remainder is \(15\).</p>
        `)
      ]
    }),

    "1b": createConfig("1b", "2018 Complex Numbers", {
      focus: raw`When multiplying polar forms, multiply moduli and add arguments.`,
      questionHtml: raw`
        <div class="question-math">
          <p class="step-text">If</p>
          \[
          u=m\operatorname{cis}\left(\frac{\pi}{3}\right)
          \quad\text{and}\quad
          v=m^3\operatorname{cis}\left(\frac{2\pi}{5}\right),
          \]
          <p class="step-text">find \(uv\) in polar form.</p>
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \boxed{uv=m^4\operatorname{cis}\left(\frac{11\pi}{15}\right)}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Identify modulus and argument", raw`Read the radius and angle from each polar form before combining them.`, raw`
          <div class="math-block">
            \[
            |u|=m,\quad \arg(u)=\frac{\pi}{3},\qquad
            |v|=m^3,\quad \arg(v)=\frac{2\pi}{5}.
            \]
          </div>
        `),
        guidedStep("Multiply the moduli", raw`Polar multiplication multiplies the two radii.`, raw`
          <div class="math-block">
            \[
            m\cdot m^3=m^{1+3}=m^4.
            \]
          </div>
        `),
        guidedStep("Add the arguments", raw`Use a common denominator of \(15\), then attach the result to the new modulus.`, raw`
          <div class="math-block">
            \[
            \frac{\pi}{3}+\frac{2\pi}{5}
            =\frac{5\pi}{15}+\frac{6\pi}{15}
            =\frac{11\pi}{15}.
            \]
            \[
            uv=m^4\operatorname{cis}\left(\frac{11\pi}{15}\right).
            \]
          </div>
        `)
      ]
    }),

    "1c": createConfig("1c", "2018 Complex Numbers", {
      focus: raw`Square once, isolate \(\sqrt{x}\), and retain the real-domain condition.`,
      questionHtml: raw`
        <div class="question-math">
          <p class="step-text">Solve the equation</p>
          \[
          2+\sqrt{x}=\sqrt{x+k}
          \]
          <p class="step-text">for \(x\) in terms of \(k\).</p>
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \boxed{x=\frac{(k-4)^2}{16}\text{ for }k\ge 4}
          \]
          <p class="step-text">There is no real solution when \(k&lt;4\).</p>
        </div>
      `),
      guidedSteps: [
        guidedStep("State the real domain", raw`Each square root needs a nonnegative radicand.`, raw`
          <div class="math-block">
            \[
            x\ge0,\qquad x+k\ge0.
            \]
          </div>
          <p class="step-text">Squaring can introduce extraneous values, so the eventual result must also be checked in the original equation.</p>
        `),
        guidedStep("Square and expand", raw`Both sides are nonnegative on the real domain, so square them and expand \((2+\sqrt{x})^2\).`, raw`
          <div class="math-block">
            \[
            (2+\sqrt{x})^2=x+k
            \]
            \[
            4+4\sqrt{x}+x=x+k.
            \]
          </div>
        `),
        guidedStep("Isolate the square root", raw`Cancel \(x\) and use the fact that \(\sqrt{x}\) cannot be negative.`, raw`
          <div class="math-block">
            \[
            4\sqrt{x}=k-4.
            \]
          </div>
          <p class="step-text">The left side is nonnegative, so \(k-4\ge0\). Therefore a real solution requires \(k\ge4\).</p>
        `),
        guidedStep("Solve for x", raw`Divide by \(4\), then square after imposing the required sign condition.`, raw`
          <div class="math-block">
            \[
            \sqrt{x}=\frac{k-4}{4}
            \]
            \[
            x=\left(\frac{k-4}{4}\right)^2=\frac{(k-4)^2}{16}.
            \]
          </div>
        `),
        guidedStep("Verify and reject invalid parameters", raw`Substitute the candidate into both sides of the original equation.`, raw`
          <p class="step-text">For \(k\ge4\), \(\sqrt{x}=(k-4)/4\), so</p>
          <div class="math-block">
            \[
            2+\sqrt{x}=2+\frac{k-4}{4}=\frac{k+4}{4}.
            \]
            \[
            \sqrt{x+k}
            =\sqrt{\frac{(k-4)^2+16k}{16}}
            =\sqrt{\frac{(k+4)^2}{16}}
            =\frac{k+4}{4}.
            \]
          </div>
          <p class="step-text">The two sides agree. If \(k&lt;4\), the equation \(4\sqrt{x}=k-4\) would equate a nonnegative number with a negative one, so no real solution exists.</p>
        `)
      ]
    }),

    "1d": createConfig("1d", "2018 Complex Numbers", {
      focus: raw`Rearrange into a quadratic in \(x\) and set its discriminant to zero.`,
      questionHtml: raw`
        <div class="question-math">
          <p class="step-text">Find the exact value(s) of \(k\) for which</p>
          \[
          k(1+x^2)=3-8x-x^2
          \]
          <p class="step-text">has one repeated solution. Give the solution in the form \(k=a\pm\sqrt{b}\).</p>
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \boxed{k=1\pm\sqrt{20}}
          \]
          <p class="step-text">Equivalently, \(k=1\pm2\sqrt5\).</p>
        </div>
      `),
      guidedSteps: [
        guidedStep("Form a quadratic in x", raw`Expand the left side and move every term to one side.`, raw`
          <div class="math-block">
            \[
            k+kx^2=3-8x-x^2
            \]
            \[
            (k+1)x^2+8x+(k-3)=0.
            \]
          </div>
        `),
        guidedStep("Identify the coefficients", raw`A repeated quadratic root requires a genuine quadratic and a zero discriminant.`, raw`
          <div class="math-block">
            \[
            a=k+1,\qquad b=8,\qquad c=k-3.
            \]
          </div>
          <p class="step-text">If \(k=-1\), the \(x^2\) term disappears and the equation is linear, so it cannot have a repeated quadratic root. This value is not one of the candidates found below.</p>
        `),
        guidedStep("Set the discriminant to zero", raw`Use \(b^2-4ac=0\) for one repeated root.`, raw`
          <div class="math-block">
            \[
            8^2-4(k+1)(k-3)=0
            \]
            \[
            64-4(k^2-2k-3)=0.
            \]
          </div>
        `),
        guidedStep("Simplify the equation in k", raw`Expand, divide by \(-4\), and collect the terms.`, raw`
          <div class="math-block">
            \[
            64-4k^2+8k+12=0
            \]
            \[
            k^2-2k-19=0.
            \]
          </div>
        `),
        guidedStep("Complete the square", raw`Add \(20\) after writing \(k^2-2k\) as part of \((k-1)^2\).`, raw`
          <div class="math-block">
            \[
            k^2-2k=19
            \]
            \[
            (k-1)^2=20
            \]
            \[
            k=1\pm\sqrt{20}.
            \]
          </div>
          <p class="step-text">Neither value is \(-1\), so both keep the equation quadratic and give a repeated root.</p>
        `)
      ]
    }),

    "1e": createConfig("1e", "2018 Complex Numbers", {
      focus: raw`Rationalise \(z/\overline z\), identify \(c\) and \(d\), and simplify their squared sum.`,
      questionHtml: raw`
        <div class="question-math">
          <p class="step-text">If \(z=a+bi\) and</p>
          \[
          \frac{z}{\overline z}=c+di,
          \]
          <p class="step-text">prove that \(c^2+d^2=1\).</p>
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \boxed{c^2+d^2=1\quad\text{for }z\ne0}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("State when the quotient is defined", raw`The denominator \(\overline z\) must be nonzero.`, raw`
          <p class="step-text">Assume \(z\ne0\). Then \(a\) and \(b\) are not both zero, so</p>
          <div class="math-block">
            \[
            a^2+b^2\ne0.
            \]
          </div>
        `),
        guidedStep("Rationalise the quotient", raw`Substitute \(z=a+bi\) and multiply numerator and denominator by \(a+bi\).`, raw`
          <div class="math-block">
            \[
            \frac{z}{\overline z}
            =\frac{a+bi}{a-bi}\cdot\frac{a+bi}{a+bi}
            =\frac{(a+bi)^2}{a^2+b^2}.
            \]
          </div>
        `),
        guidedStep("Expand and match parts", raw`Use \(i^2=-1\), then compare the real and imaginary components with \(c+di\).`, raw`
          <div class="math-block">
            \[
            (a+bi)^2=a^2+2abi+b^2i^2=a^2-b^2+2abi.
            \]
            \[
            \frac{z}{\overline z}
            =\frac{a^2-b^2}{a^2+b^2}
            +\frac{2ab}{a^2+b^2}i.
            \]
            \[
            c=\frac{a^2-b^2}{a^2+b^2},\qquad
            d=\frac{2ab}{a^2+b^2}.
            \]
          </div>
        `),
        guidedStep("Form the squared sum", raw`Square the two expressions and place them over the common denominator.`, raw`
          <div class="math-block">
            \[
            c^2+d^2
            =\frac{(a^2-b^2)^2+4a^2b^2}{(a^2+b^2)^2}.
            \]
          </div>
        `),
        guidedStep("Simplify to the requested result", raw`Expand the numerator and recognise a perfect square.`, raw`
          <div class="math-block">
            \[
            (a^2-b^2)^2+4a^2b^2
            =a^4-2a^2b^2+b^4+4a^2b^2
            \]
            \[
            =a^4+2a^2b^2+b^4=(a^2+b^2)^2.
            \]
            \[
            c^2+d^2=\frac{(a^2+b^2)^2}{(a^2+b^2)^2}=1.
            \]
          </div>
          <p class="step-text">This also agrees with \(\left|z/\overline z\right|=|z|/|z|=1\), but the algebra above proves the requested statement directly.</p>
        `)
      ]
    }),

    "2a": createConfig("2a", "2018 Complex Numbers", {
      focus: raw`Reflect \(v\) in the real axis to get its conjugate, add coordinates, then plot the result.`,
      questionHtml: raw`
        <div class="question-math">
          <p class="step-text">The Argand diagram gives \(u=-2+3i\) and \(v=4+2i\). If \(w=u+\overline v\), show \(w\) on the Argand diagram.</p>
          ${initialArgandDiagram()}
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \boxed{w=2+i}
          \]
          <p class="step-text">It is plotted at \((2,1)\) on the completed Argand diagram.</p>
        </div>
      `),
      guidedSteps: [
        guidedStep("Read u and v", raw`Use the horizontal coordinate as the real part and the vertical coordinate as the imaginary part.`, raw`
          <div class="math-block">
            \[
            u=-2+3i,\qquad v=4+2i.
            \]
          </div>
        `),
        guidedStep("Conjugate v", raw`A conjugate keeps the real part and reverses the sign of the imaginary part.`, raw`
          <div class="math-block">
            \[
            \overline v=4-2i.
            \]
          </div>
          <p class="step-text">Geometrically this reflects \(v\) across the real axis.</p>
          ${conjugateArgandDiagram()}
        `),
        guidedStep("Add corresponding parts", raw`Add the real parts together and the imaginary parts together.`, raw`
          <div class="math-block">
            \[
            w=(-2+3i)+(4-2i)
            \]
            \[
            =(-2+4)+(3-2)i=2+i.
            \]
          </div>
        `),
        guidedStep("Plot w", raw`The number \(2+i\) has real coordinate \(2\) and imaginary coordinate \(1\).`, raw`
          <p class="step-text">Move \(2\) units right from the origin and \(1\) unit up, then mark \(w\).</p>
          ${completedArgandDiagram()}
        `)
      ]
    }),

    "2b": createConfig("2b", "2018 Complex Numbers", {
      focus: raw`Multiply by the conjugate \(3+\sqrt7\).`,
      questionHtml: raw`
        <div class="question-math">
          <p class="step-text">Write</p>
          \[
          \frac{6}{3-\sqrt7}
          \]
          <p class="step-text">in the form \(a+b\sqrt7\).</p>
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \boxed{9+3\sqrt7}
          \]
          <p class="step-text">Thus \(a=9\) and \(b=3\).</p>
        </div>
      `),
      guidedSteps: [
        guidedStep("Multiply by the conjugate", raw`The conjugate \(3+\sqrt7\) creates a rational difference of squares in the denominator.`, raw`
          <div class="math-block">
            \[
            \frac{6}{3-\sqrt7}\cdot\frac{3+\sqrt7}{3+\sqrt7}
            =\frac{6(3+\sqrt7)}{(3-\sqrt7)(3+\sqrt7)}.
            \]
          </div>
        `),
        guidedStep("Simplify the denominator", raw`Use \((a-b)(a+b)=a^2-b^2\).`, raw`
          <div class="math-block">
            \[
            (3-\sqrt7)(3+\sqrt7)=3^2-(\sqrt7)^2=9-7=2.
            \]
          </div>
        `),
        guidedStep("Write the requested form", raw`Divide the numerator by \(2\), then expand.`, raw`
          <div class="math-block">
            \[
            \frac{6(3+\sqrt7)}{2}=3(3+\sqrt7)=9+3\sqrt7.
            \]
          </div>
          <p class="step-text">Matching \(a+b\sqrt7\) gives \(a=9\) and \(b=3\).</p>
        `)
      ]
    }),

    "2c": createConfig("2c", "2018 Complex Numbers", {
      focus: raw`Real coefficients force the conjugate root; combine the pair into a real quadratic factor.`,
      questionHtml: raw`
        <div class="question-math">
          <p class="step-text">One solution of</p>
          \[
          z^3+Az^2+34z-40=0
          \]
          <p class="step-text">is \(z=3+i\). If \(A\) is real, find \(A\) and the other two solutions.</p>
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \boxed{A=-10}
          \]
          \[
          \boxed{\text{Other roots: }3-i\text{ and }4}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Use the conjugate-root rule", raw`A polynomial with real coefficients has nonreal roots in conjugate pairs.`, raw`
          <p class="step-text">Since \(3+i\) is a root and every coefficient is real, \(3-i\) is also a root.</p>
        `),
        guidedStep("Build the real quadratic factor", raw`Multiply the two conjugate linear factors as a difference of squares.`, raw`
          <div class="math-block">
            \[
            (z-(3+i))(z-(3-i))
            \]
            \[
            =((z-3)-i)((z-3)+i)
            =(z-3)^2+1
            \]
            \[
            =z^2-6z+10.
            \]
          </div>
        `),
        guidedStep("Find the third root", raw`Call the third root \(r\), then compare the constant term of the factorised cubic.`, raw`
          <div class="math-block">
            \[
            z^3+Az^2+34z-40=(z-r)(z^2-6z+10).
            \]
          </div>
          <p class="step-text">The constant term on the right is \((-r)(10)=-10r\), so</p>
          <div class="math-block">
            \[
            -10r=-40\quad\Longrightarrow\quad r=4.
            \]
          </div>
        `),
        guidedStep("Expand and identify A", raw`Substitute \(r=4\), expand every term, and compare the coefficient of \(z^2\).`, raw`
          <div class="math-block">
            \[
            (z-4)(z^2-6z+10)
            \]
            \[
            =z^3-6z^2+10z-4z^2+24z-40
            \]
            \[
            =z^3-10z^2+34z-40.
            \]
          </div>
          <p class="step-text">Comparing with \(z^3+Az^2+34z-40\) gives \(A=-10\). The other roots are \(3-i\) and \(4\).</p>
        `)
      ]
    }),

    "2d": createConfig("2d", "2018 Complex Numbers", {
      focus: raw`Rationalise the fraction, write \(z\) in Cartesian form, then use \(\sqrt{a^2+b^2}\).`,
      questionHtml: raw`
        <div class="question-math">
          <p class="step-text">If</p>
          \[
          z=\frac{15}{1-2i}-2i,
          \]
          <p class="step-text">find \(\operatorname{mod}(z)\). Show all algebraic working.</p>
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \boxed{\operatorname{mod}(z)=5}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Rationalise the fraction", raw`Multiply numerator and denominator by the conjugate \(1+2i\).`, raw`
          <div class="math-block">
            \[
            \frac{15}{1-2i}\cdot\frac{1+2i}{1+2i}
            =\frac{15(1+2i)}{(1-2i)(1+2i)}.
            \]
          </div>
        `),
        guidedStep("Simplify to Cartesian form", raw`The denominator is \(1^2+2^2=5\), then subtract \(2i\).`, raw`
          <div class="math-block">
            \[
            \frac{15+30i}{5}=3+6i
            \]
            \[
            z=3+6i-2i=3+4i.
            \]
          </div>
        `),
        guidedStep("Calculate the modulus", raw`For \(z=a+bi\), use \(|z|=\sqrt{a^2+b^2}\).`, raw`
          <div class="math-block">
            \[
            \operatorname{mod}(z)=|z|=\sqrt{3^2+4^2}
            =\sqrt{9+16}=\sqrt{25}=5.
            \]
          </div>
        `)
      ]
    }),

    "2e": createConfig("2e", "2018 Complex Numbers", {
      focus: raw`Interpret both moduli as distances and substitute \(u\) directly.`,
      questionHtml: raw`
        <div class="question-math">
          <p class="step-text">The complex number \(u=3+mi\) is on the locus</p>
          \[
          |z-8|=|z-4+2i|.
          \]
          <p class="step-text">Find \(m\).</p>
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \boxed{m=5}
          \]
          <p class="step-text">Therefore \(u=3+5i\).</p>
        </div>
      `),
      guidedSteps: [
        guidedStep("Interpret the two distances", raw`Rewrite each modulus as a distance from a fixed point in the Argand plane.`, raw`
          <p class="step-text">\(|z-8|\) is the distance from \((8,0)\). Also,</p>
          <div class="math-block">
            \[
            |z-4+2i|=|z-(4-2i)|,
            \]
          </div>
          <p class="step-text">so the second fixed point is \((4,-2)\), not \((4,2)\).</p>
        `),
        guidedStep("Substitute u", raw`Put \(z=3+mi\) into both sides and collect the real and imaginary parts.`, raw`
          <div class="math-block">
            \[
            |(3+mi)-8|=|(3+mi)-4+2i|
            \]
            \[
            |-5+mi|=|-1+(m+2)i|.
            \]
          </div>
        `),
        guidedStep("Square the nonnegative moduli", raw`Equal nonnegative distances have equal squares.`, raw`
          <div class="math-block">
            \[
            (-5)^2+m^2=(-1)^2+(m+2)^2
            \]
            \[
            25+m^2=1+m^2+4m+4.
            \]
          </div>
        `),
        guidedStep("Solve for m", raw`Cancel \(m^2\), then isolate the remaining linear term.`, raw`
          <div class="math-block">
            \[
            25=5+4m
            \]
            \[
            20=4m
            \]
            \[
            m=5.
            \]
          </div>
          <p class="step-text">As a check, the perpendicular-bisector locus simplifies to \(2x+y=11\). At \(x=3\), this gives \(y=5\).</p>
        `)
      ]
    }),

    "3a": createConfig("3a", "2018 Complex Numbers", {
      focus: raw`Expand \(uv\) using \(i^2=-1\), collect real and imaginary parts, and match coefficients.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          u=3-2i\quad\text{and}\quad v=2+bi.
          \]
          <p class="step-text">Find \(b\) if \(uv=14+8i\).</p>
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \boxed{b=4}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Substitute into the product", raw`Place the two given Cartesian forms into \(uv\).`, raw`
          <div class="math-block">
            \[
            uv=(3-2i)(2+bi).
            \]
          </div>
        `),
        guidedStep("Expand and use i squared", raw`Multiply every pair of terms, then replace \(i^2\) by \(-1\).`, raw`
          <div class="math-block">
            \[
            uv=6+3bi-4i-2bi^2
            \]
            \[
            =6+3bi-4i+2b
            \]
            \[
            =(6+2b)+(3b-4)i.
            \]
          </div>
        `),
        guidedStep("Match both parts", raw`Equal complex numbers have equal real parts and equal imaginary coefficients.`, raw`
          <div class="math-block">
            \[
            6+2b=14\quad\Longrightarrow\quad b=4.
            \]
            \[
            3b-4=8\quad\Longrightarrow\quad 3b=12\quad\Longrightarrow\quad b=4.
            \]
          </div>
          <p class="step-text">Both comparisons give the same value, so \(b=4\) satisfies the full complex equation.</p>
        `)
      ]
    }),

    "3b": createConfig("3b", "2018 Complex Numbers", {
      focus: raw`Complete the square, then factor \(p\) from the roots.`,
      questionHtml: raw`
        <div class="question-math">
          <p class="step-text">Solve</p>
          \[
          x^2-6px+4p^2=0
          \]
          <p class="step-text">for \(x\) in terms of \(p\), expressing the solution in its simplest form.</p>
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \boxed{x=p(3\pm\sqrt5)}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Move the constant term", raw`Leave the \(x\)-terms on the left before completing the square.`, raw`
          <div class="math-block">
            \[
            x^2-6px=-4p^2.
            \]
          </div>
        `),
        guidedStep("Complete the square", raw`Half of \(-6p\) is \(-3p\), so add \(9p^2\) to both sides.`, raw`
          <div class="math-block">
            \[
            x^2-6px+9p^2=-4p^2+9p^2
            \]
            \[
            (x-3p)^2=5p^2.
            \]
          </div>
        `),
        guidedStep("Take both square-root branches", raw`A squared expression has positive and negative square-root branches.`, raw`
          <div class="math-block">
            \[
            x-3p=\pm\sqrt{5p^2}.
            \]
          </div>
          <p class="step-text">Strictly, \(\sqrt{p^2}=|p|\). Because the \(\pm\) sign gives an unordered pair, the same two roots can be written \(x-3p=\pm p\sqrt5\) for any real \(p\).</p>
        `),
        guidedStep("Solve and factor", raw`Add \(3p\), then take out the common factor \(p\).`, raw`
          <div class="math-block">
            \[
            x=3p\pm p\sqrt5=p(3\pm\sqrt5).
            \]
          </div>
          <p class="step-text">When \(p=0\), this formula correctly gives the repeated root \(x=0\).</p>
        `)
      ]
    }),

    "3c": createConfig("3c", "2018 Complex Numbers", {
      focus: raw`Write \(-i\) with coterminal arguments, then take cube roots of the modulus and arguments.`,
      questionHtml: raw`
        <div class="question-math">
          <p class="step-text">Solve</p>
          \[
          z^3=-k^6i,
          \]
          <p class="step-text">where \(k\) is real and positive. Write the solutions in polar form in terms of \(k\).</p>
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \boxed{z=k^2\operatorname{cis}\left(-\frac{\pi}{6}+\frac{2n\pi}{3}\right),\quad n=0,1,2}
          \]
          \[
          \boxed{k^2\operatorname{cis}\left(\frac{\pi}{2}\right),\quad
          k^2\operatorname{cis}\left(-\frac{5\pi}{6}\right),\quad
          k^2\operatorname{cis}\left(-\frac{\pi}{6}\right)}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Write the right side in polar form", raw`Separate the modulus from the argument of \(-i\).`, raw`
          <p class="step-text">Since \(k&gt;0\), the modulus is \(k^6\). The arguments of \(-i\) are \(-\pi/2+2n\pi\), so</p>
          <div class="math-block">
            \[
            -k^6i=k^6\operatorname{cis}\left(-\frac{\pi}{2}+2n\pi\right).
            \]
          </div>
        `),
        guidedStep("Take the cube-root modulus", raw`Taking a cube root divides the exponent of the positive modulus by \(3\).`, raw`
          <div class="math-block">
            \[
            \sqrt[3]{k^6}=k^{6/3}=k^2.
            \]
          </div>
        `),
        guidedStep("Divide the arguments", raw`Divide every coterminal argument by \(3\) and take three consecutive values of \(n\).`, raw`
          <div class="math-block">
            \[
            z=k^2\operatorname{cis}\left(\frac{-\pi/2+2n\pi}{3}\right)
            =k^2\operatorname{cis}\left(-\frac{\pi}{6}+\frac{2n\pi}{3}\right),
            \]
            \[
            n=0,1,2.
            \]
          </div>
        `),
        guidedStep("List the three distinct roots", raw`Convert coterminal angles to the principal-angle style used in the source.`, raw`
          <div class="math-block">
            \[
            n=0:\quad k^2\operatorname{cis}\left(-\frac{\pi}{6}\right),
            \]
            \[
            n=1:\quad k^2\operatorname{cis}\left(\frac{\pi}{2}\right),
            \]
            \[
            n=2:\quad k^2\operatorname{cis}\left(\frac{7\pi}{6}\right)
            =k^2\operatorname{cis}\left(-\frac{5\pi}{6}\right).
            \]
          </div>
          <p class="step-text">These are three distinct angles separated by \(2\pi/3\), so each root is listed exactly once.</p>
        `),
        guidedStep("Check by cubing", raw`Cubing restores the modulus \(k^6\) and triples each argument.`, raw`
          <p class="step-text">The three tripled angles are \(-\pi/2\), \(3\pi/2\), and \(-5\pi/2\). Each is coterminal with \(-\pi/2\), so every cube is \(-k^6i\).</p>
        `)
      ]
    }),

    "3d": createConfig("3d", "2018 Complex Numbers", {
      focus: raw`The argument places \(w\) on the first-quadrant line \(y=x\), while \(w\overline w=|w|^2\).`,
      questionHtml: raw`
        <div class="question-math">
          <p class="step-text">Find \(w\) in the form \(x+iy\) if</p>
          \[
          \arg(w)=\frac{\pi}{4}\quad\text{and}\quad |w\overline w|=20.
          \]
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \boxed{w=\sqrt{10}+i\sqrt{10}}
          \]
        </div>
      `),
      guidedSteps: [
        guidedStep("Use the argument", raw`An argument of \(\pi/4\) is in quadrant I on the line \(y=x\).`, raw`
          <p class="step-text">Let \(w=x+iy\). Then</p>
          <div class="math-block">
            \[
            y=x,\qquad x&gt;0.
            \]
          </div>
          <p class="step-text">The positivity is essential: it records the quadrant specified by the argument.</p>
        `),
        guidedStep("Multiply by the conjugate", raw`Substitute \(y=x\) and use the difference of squares.`, raw`
          <div class="math-block">
            \[
            w\overline w=(x+xi)(x-xi)=x^2-(xi)^2=x^2+x^2=2x^2.
            \]
          </div>
          <p class="step-text">This is a nonnegative real number, so \(|w\overline w|=2x^2\).</p>
        `),
        guidedStep("Solve with the quadrant condition", raw`Use the modulus equation, then choose the sign allowed by \(\arg(w)=\pi/4\).`, raw`
          <div class="math-block">
            \[
            2x^2=20
            \]
            \[
            x^2=10.
            \]
          </div>
          <p class="step-text">Algebra gives \(x=\pm\sqrt{10}\), but quadrant I requires \(x&gt;0\). Hence \(x=\sqrt{10}\), not the negative value.</p>
        `),
        guidedStep("Write w in Cartesian form", raw`Since \(y=x\), the imaginary coefficient has the same positive value.`, raw`
          <div class="math-block">
            \[
            y=\sqrt{10}
            \]
            \[
            w=\sqrt{10}+i\sqrt{10}.
            \]
          </div>
          <p class="step-text">As a check, \(|w|=\sqrt{20}=2\sqrt5\), and \(2\sqrt5\operatorname{cis}(\pi/4)=\sqrt{10}+i\sqrt{10}\).</p>
        `)
      ]
    }),

    "3e": createConfig("3e", "2018 Complex Numbers", {
      focus: raw`Rationalise the denominator, solve the radical equation, then enforce the original real domain and nonzero denominator.`,
      questionHtml: raw`
        <div class="question-math">
          <p class="step-text">Solve</p>
          \[
          \frac{\sqrt{x+k}+\sqrt{x-k}}{\sqrt{x+k}-\sqrt{x-k}}=4
          \]
          <p class="step-text">for \(x\) in terms of \(k\).</p>
        </div>
      `,
      answerHtml: answerBox(raw`
        <div class="math-block">
          \[
          \boxed{x=\frac{17k}{8}\text{ for }k&gt;0}
          \]
          <p class="step-text">There is no real solution for \(k\le0\).</p>
        </div>
      `),
      guidedSteps: [
        guidedStep("State the domain", raw`Both radicals must be real and the original denominator must not be zero.`, raw`
          <div class="math-block">
            \[
            x+k\ge0,\qquad x-k\ge0
            \]
            \[
            x\ge|k|.
            \]
          </div>
          <p class="step-text">Also \(\sqrt{x+k}-\sqrt{x-k}\ne0\). In particular, \(k=0\) makes this denominator zero, so \(k=0\) is invalid. Because squaring will be used later, any candidate must be checked in the original quotient.</p>
        `),
        guidedStep("Rationalise the denominator", raw`Let \(A=\sqrt{x+k}\) and \(B=\sqrt{x-k}\), then multiply by \((A+B)/(A+B)\).`, raw`
          <div class="math-block">
            \[
            \frac{A+B}{A-B}\cdot\frac{A+B}{A+B}
            =\frac{(A+B)^2}{A^2-B^2}.
            \]
          </div>
          <p class="step-text">Here \(A^2-B^2=(x+k)-(x-k)=2k\). For any point where the original quotient is defined, \(A+B&gt;0\), so this rationalisation is valid.</p>
        `),
        guidedStep("Expand the rationalised expression", raw`Replace \(A^2+B^2\) by \(2x\) and \(AB\) by \(\sqrt{x^2-k^2}\).`, raw`
          <div class="math-block">
            \[
            4=\frac{(A+B)^2}{2k}
            =\frac{A^2+2AB+B^2}{2k}
            \]
            \[
            =\frac{2x+2\sqrt{(x+k)(x-k)}}{2k}
            =\frac{2x+2\sqrt{x^2-k^2}}{2k}.
            \]
            \[
            4k=x+\sqrt{x^2-k^2}.
            \]
          </div>
        `),
        guidedStep("Isolate the radical", raw`Move \(x\) to the other side and record the sign condition before squaring.`, raw`
          <div class="math-block">
            \[
            \sqrt{x^2-k^2}=4k-x.
            \]
          </div>
          <p class="step-text">The square root is nonnegative, so a valid solution must have \(4k-x\ge0\).</p>
        `),
        guidedStep("Square and solve", raw`Square both sides, cancel \(x^2\), and use \(k\ne0\).`, raw`
          <div class="math-block">
            \[
            x^2-k^2=(4k-x)^2
            \]
            \[
            x^2-k^2=16k^2-8kx+x^2
            \]
            \[
            8kx=17k^2.
            \]
          </div>
          <p class="step-text">Since \(k=0\) is excluded by the original denominator, divide by \(8k\):</p>
          <div class="math-block">
            \[
            x=\frac{17k}{8}.
            \]
          </div>
        `),
        guidedStep("Enforce the conditions and verify", raw`Check the parameter sign, domain, radical sign, and original quotient.`, raw`
          <p class="step-text">If \(k&gt;0\), then \(x=17k/8\ge k=|k|\) and</p>
          <div class="math-block">
            \[
            4k-x=4k-\frac{17k}{8}=\frac{15k}{8}\ge0.
            \]
          </div>
          <p class="step-text">If \(k&lt;0\), the candidate \(17k/8\) is negative and cannot satisfy \(x\ge|k|\). The case \(k=0\) is undefined. Thus only \(k&gt;0\) remains.</p>
          <p class="step-text">For \(k&gt;0\), substitute \(x=17k/8\) into the original radicals:</p>
          <div class="math-block">
            \[
            \sqrt{x+k}=\sqrt{\frac{25k}{8}}=5\sqrt{\frac{k}{8}},\qquad
            \sqrt{x-k}=\sqrt{\frac{9k}{8}}=3\sqrt{\frac{k}{8}}.
            \]
            \[
            \frac{5\sqrt{k/8}+3\sqrt{k/8}}{5\sqrt{k/8}-3\sqrt{k/8}}
            =\frac{5+3}{5-3}=4.
            \]
          </div>
          <p class="step-text">The candidate works in the original equation, so it is not an extraneous result from squaring.</p>
        `)
      ]
    })
  };
}());
