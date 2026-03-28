(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-complex-2024";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const orderedListOptions = {
    ordered: true,
    stripOuterParens: true
  };
  const unorderedListOptions = {
    ordered: false,
    stripOuterParens: true
  };
  const complexPairListOptions = Object.assign({}, orderedListOptions, {
    allowComplexInput: true
  });
  const complexListOptions = Object.assign({}, unorderedListOptions, {
    allowComplexInput: true
  });
  const wrappedListPreview = {
    wrapWithParens: true
  };

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return "complex-2024.html?q=" + encodeURIComponent(id);
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
      browserTitle: "2024 Level 3 Complex Numbers Paper — " + questionLabel(id),
      eyebrow: "Level 3 Complex Numbers Walkthrough",
      title: questionLabel(id),
      subtitle: subtitle,
      backHref: paperHref,
      nextHref: next ? pageHref(next) : paperHref,
      nextLabel: next ? "Next question →" : "Back to paper",
      finalNav: buildFinalNav(id),
      answerButtonLabel: "Show full solution"
    }, details);
  }

  function answerBox(content) {
    return `
      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>
        ${content}
      </div>
    `;
  }

  function calloutBox(kind, title, text) {
    return `
      <div class="callout-card ${kind}">
        <p class="callout-title">${title}</p>
        <p class="step-text">${text}</p>
      </div>
    `;
  }

  function tipBox(text) {
    return calloutBox("tip", "Exam Tip", text);
  }

  function mistakeBox(text) {
    return calloutBox("mistake", "Common Mistake", text);
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
    const width = 420;
    const height = 420;
    const padding = 28;
    const xMin = settings.xMin;
    const xMax = settings.xMax;
    const yMin = settings.yMin;
    const yMax = settings.yMax;
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
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${settings.ariaLabel}">
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${gridLines.join("")}
          ${lineMarkup(scale, xMin, 0, xMax, 0, "graph-axis")}
          ${lineMarkup(scale, 0, yMin, 0, yMax, "graph-axis")}
          ${circleMarkup(scale, 0, 0, 4.5, "question-origin")}
          ${textMarkup(scale, xMax - 0.35, -0.4, "Real", "graph-label", ' text-anchor="end"')}
          ${textMarkup(scale, 0, yMax - 0.2, "Imaginary", "graph-label", ' text-anchor="middle"')}
          ${(settings.points || []).map(function (point) {
            return circleMarkup(scale, point.x, point.y, 5, point.className || "graph-point")
              + textMarkup(
                scale,
                point.labelX !== undefined ? point.labelX : point.x + 0.25,
                point.labelY !== undefined ? point.labelY : point.y + 0.3,
                point.label,
                "graph-label"
              );
          }).join("")}
        </svg>
      </div>
    `;
  }

  window.Complex2024Walkthroughs = {
    "1a": createConfig("1a", "2024 Paper — Factor theorem", {
      focus: raw`using the factor theorem by substituting the root \(x=-3\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Given that }x+3\text{ is a factor of }x^3+px^2+5x-12,\text{ find the value of }p.
          \]
        </div>
      `,
      hints: [
        raw`If \(x+3\) is a factor, then \(x=-3\) makes the polynomial equal to \(0\).`,
        raw`Substitute \(-3\) carefully into every term, especially the \(px^2\) term.`,
        raw`Once you have a linear equation in \(p\), just solve it.`
      ],
      answerHtml: raw`
        <p class="step-text">Since \(x+3\) is a factor, \(f(-3)=0\).</p>
        <div class="math-block">
          \[
          f(-3)=(-3)^3+p(-3)^2+5(-3)-12=0
          \]
          \[
          -27+9p-15-12=0
          \]
          \[
          9p-54=0
          \]
          \[
          p=6
          \]
        </div>
        ${answerBox(raw`
          \[
          p=6
          \]
        `)}
        ${tipBox(raw`If the factor is \(x-a\), the quick check is always \(f(a)=0\). Here \(x+3=x-(-3)\), so we use \(x=-3\).`)}
      `,
      steps: [
        {
          type: "typed",
          title: "Use the factor theorem",
          text: raw`What value of \(x\) should you substitute into the polynomial?`,
          ariaLabel: "Type the x value to substitute",
          acceptedAnswers: ["-3"],
          successMessage: raw`Correct. Since \(x+3=0\), the root is \(x=-3\).`,
          genericMessage: raw`Set the factor \(x+3\) equal to \(0\).`
        },
        {
          type: "typed",
          title: "Simplify the substitution",
          text: raw`After substituting \(x=-3\), what equation do you get in \(p\)?`,
          ariaLabel: "Type the equation in p",
          mode: "equation",
          acceptedAnswers: ["9p-54=0"],
          samples: [{ p: 6 }, { p: 2 }, { p: 10 }],
          successMessage: raw`Yes. Everything simplifies to \(9p-54=0\).`,
          genericMessage: raw`Work through \((-3)^3\), \(p(-3)^2\), \(5(-3)\), and \(-12\), then collect like terms.`
        },
        {
          type: "typed",
          title: "Solve for p",
          text: raw`What value of \(p\) makes the factor theorem work?`,
          ariaLabel: "Type the value of p",
          acceptedAnswers: ["6"],
          successMessage: raw`Exactly. Solving \(9p-54=0\) gives \(p=6\).`,
          genericMessage: raw`Rearrange the linear equation and divide by \(9\).`
        }
      ]
    }),
    "1b": createConfig("1b", "2024 Paper — De Moivre in polar form", {
      focus: raw`raising a complex number in polar form to a power with De Moivre’s Theorem.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{If }z=m\operatorname{cis}\left(\frac{n\pi}{5}\right),\text{ where }m\text{ and }n\text{ are positive real constants, find }z^{15},
          \]
        </div>
        <p class="step-text">giving your answer in polar form, in terms of \(m\) and \(n\).</p>
      `,
      hints: [
        raw`De Moivre says you raise the modulus to the power and multiply the argument by the power.`,
        raw`So the modulus becomes \(m^{15}\), and the angle becomes \(15\times \frac{n\pi}{5}\).`,
        raw`Write the result in \(\operatorname{cis}\) form before you try to tidy the angle.`
      ],
      answerHtml: raw`
        <p class="step-text">Apply De Moivre’s Theorem directly:</p>
        <div class="math-block">
          \[
          z^{15}=m^{15}\operatorname{cis}\left(15\cdot\frac{n\pi}{5}\right)
          \]
          \[
          z^{15}=m^{15}\operatorname{cis}(3n\pi)
          \]
        </div>
        ${answerBox(raw`
          \[
          z^{15}=m^{15}\operatorname{cis}(3n\pi)
          \]
        `)}
        ${tipBox(raw`For polar powers, it helps to say out loud: modulus power first, angle multiplication second.`)}
      `,
      steps: [
        {
          type: "typed",
          title: "Raise the modulus",
          text: raw`What happens to the modulus when you work out \(z^{15}\)?`,
          ariaLabel: "Type the new modulus",
          acceptedAnswers: ["m^15"],
          samples: [{ m: 2 }, { m: 5 }, { m: 7 }],
          successMessage: raw`Correct. The modulus becomes \(m^{15}\).`,
          genericMessage: raw`De Moivre raises the modulus to the same power.`
        },
        {
          type: "typed",
          title: "Multiply the argument",
          text: raw`What argument do you get after multiplying by \(15\)?`,
          ariaLabel: "Type the new argument",
          acceptedAnswers: ["3npi", "3*pi*n", "n*3pi"],
          samples: [{ n: 1 }, { n: 2 }, { n: 3 }],
          successMessage: raw`Yes. \(15\times \frac{n\pi}{5}=3n\pi\).`,
          genericMessage: raw`Multiply the original angle \(\frac{n\pi}{5}\) by \(15\).`
        },
        {
          type: "choice",
          title: "Choose the safest final polar form",
          text: raw`Which option matches the wording in the question most safely?`,
          choices: [
            {
              html: raw`\[
                m^{15}\operatorname{cis}(3n\pi)
              \]`,
              correct: true,
              successMessage: raw`Correct. That is the direct De Moivre result, and it works for positive real \(n\).`
            },
            {
              html: raw`\[
                m^{15}\operatorname{cis}(n\pi)
              \]`,
              failureMessage: raw`That reduction only works if \(n\) is an integer, so it is not guaranteed by the wording of the question.`
            }
          ],
          genericMessage: raw`Use the form that stays valid for any positive real \(n\).`
        }
      ]
    }),
    "1c": createConfig("1c", "2024 Paper — Solving a surd equation", {
      focus: raw`squaring carefully, simplifying in stages, and checking the result after squaring.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          4-\sqrt{kx}=\sqrt{kx+4}
          \]
        </div>
        <p class="step-text">Solve the equation for \(x\), in terms of \(k\), where \(k\) is a positive real constant.</p>
      `,
      hints: [
        raw`Square once to get rid of one layer of surds.`,
        raw`After the first squaring, isolate \(\sqrt{kx}\) before you square again.`,
        raw`At the end, divide by \(64k\), not just \(64\).`
      ],
      answerHtml: raw`
        <p class="step-text">Square both sides first:</p>
        <div class="math-block">
          \[
          (4-\sqrt{kx})^2=(\sqrt{kx+4})^2
          \]
          \[
          16+kx-8\sqrt{kx}=kx+4
          \]
          \[
          12=8\sqrt{kx}
          \]
        </div>
        <p class="step-text">Now square again:</p>
        <div class="math-block">
          \[
          144=64kx
          \]
          \[
          x=\frac{144}{64k}=\frac{9}{4k}
          \]
        </div>
        ${answerBox(raw`
          \[
          x=\frac{9}{4k}
          \]
        `)}
        ${tipBox(raw`Any time you square to solve an equation, it is worth checking the final answer in the original line. This one does work.`)}
      `,
      steps: [
        {
          type: "typed",
          title: "Square once",
          text: raw`After the first squaring and simplification, what equation do you get?`,
          ariaLabel: "Type the simplified equation after squaring",
          mode: "equation",
          acceptedAnswers: ["12=8sqrt(kx)", "8sqrt(kx)=12"],
          samples: [{ k: 2, x: 1 }, { k: 3, x: 4 }],
          successMessage: raw`Correct. The \(kx\) terms cancel, leaving \(12=8\sqrt{kx}\).`,
          genericMessage: raw`Expand \((4-\sqrt{kx})^2\) carefully, then cancel the matching \(kx\) terms.`
        },
        {
          type: "typed",
          title: "Square again",
          text: raw`What equation do you get after squaring a second time?`,
          ariaLabel: "Type the equation after squaring twice",
          mode: "equation",
          acceptedAnswers: ["144=64kx", "64kx=144"],
          samples: [{ k: 2, x: 1 }, { k: 3, x: 4 }],
          successMessage: raw`Yes. Squaring \(12=8\sqrt{kx}\) gives \(144=64kx\).`,
          genericMessage: raw`Square both sides of \(12=8\sqrt{kx}\).`
        },
        {
          type: "typed",
          title: "Solve for x",
          text: raw`What is \(x\) in terms of \(k\)?`,
          ariaLabel: "Type x in terms of k",
          acceptedAnswers: ["9/(4k)", "9/4k"],
          samples: [{ k: 1 }, { k: 2 }, { k: 5 }],
          successMessage: raw`Exactly. Dividing by \(64k\) gives \(x=\frac{9}{4k}\).`,
          targetedFeedback: [
            {
              answers: ["9/4"],
              message: raw`You still need the \(k\) in the denominator.`
            }
          ],
          genericMessage: raw`Rearrange \(144=64kx\) and divide by \(64k\).`
        }
      ]
    }),
    "1d": createConfig("1d", "2024 Paper — Locus to straight-line gradient", {
      focus: raw`rewriting a modulus locus in \(x\) and \(y\), then simplifying to a line.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          |z-i|=|z+1|
          \]
        </div>
        <p class="step-text">The locus described is a straight line.</p>
        <p class="step-text">Find the gradient of that line. Justify your answer.</p>
      `,
      hints: [
        raw`Let \(z=x+yi\).`,
        raw`Each modulus becomes a square root using real part squared plus imaginary part squared.`,
        raw`Square both sides, expand, and look for the line equation.`
      ],
      answerHtml: raw`
        <p class="step-text">Let \(z=x+yi\). Then:</p>
        <div class="math-block">
          \[
          |z-i|=|x+(y-1)i|=\sqrt{x^2+(y-1)^2}
          \]
          \[
          |z+1|=|(x+1)+yi|=\sqrt{(x+1)^2+y^2}
          \]
        </div>
        <p class="step-text">Set them equal and square both sides:</p>
        <div class="math-block">
          \[
          x^2+(y-1)^2=(x+1)^2+y^2
          \]
          \[
          x^2+y^2-2y+1=x^2+2x+1+y^2
          \]
          \[
          -2y=2x
          \]
          \[
          y=-x
          \]
        </div>
        <p class="step-text">That is a straight line with gradient \(-1\).</p>
        ${answerBox(raw`
          \[
          \text{Gradient}=-1
          \]
        `)}
        ${tipBox(raw`Once the locus is in the form \(y=mx+c\), the gradient is just the coefficient of \(x\).`)}
      `,
      steps: [
        {
          type: "typed",
          title: "Rewrite the moduli",
          text: raw`After letting \(z=x+yi\), what equation do you get before squaring?`,
          ariaLabel: "Type the equation before squaring",
          mode: "equation",
          acceptedAnswers: ["sqrt(x^2+(y-1)^2)=sqrt((x+1)^2+y^2)"],
          samples: [{ x: 2, y: 1 }, { x: -1, y: 4 }, { x: 3, y: -2 }],
          successMessage: raw`Correct. Each modulus becomes a distance formula in \(x\) and \(y\).`,
          genericMessage: raw`Write each complex number in \(a+bi\) form, then use \(|a+bi|=\sqrt{a^2+b^2}\).`
        },
        {
          type: "typed",
          title: "Simplify to a line",
          text: raw`After squaring and simplifying, what line equation do you get?`,
          ariaLabel: "Type the line equation",
          mode: "equation",
          acceptedAnswers: ["y=-x", "x+y=0", "-y=x"],
          samples: [{ x: 2, y: -2 }, { x: -3, y: 3 }, { x: 1, y: -1 }],
          successMessage: raw`Yes. The locus simplifies to \(y=-x\).`,
          genericMessage: raw`Expand both sides and cancel the matching \(x^2\), \(y^2\), and constant terms.`
        },
        {
          type: "typed",
          title: "State the gradient",
          text: raw`What is the gradient of the line?`,
          ariaLabel: "Type the gradient",
          acceptedAnswers: ["-1"],
          successMessage: raw`Correct. The line \(y=-x\) has gradient \(-1\).`,
          genericMessage: raw`Read the coefficient of \(x\) from the line equation.`
        }
      ]
    }),
    "1e": createConfig("1e", "2024 Paper — Showing a quotient misses y = x", {
      focus: raw`rationalising a complex quotient and comparing real and imaginary parts.`,
      questionHtml: raw`
        <p class="step-text">Consider the complex numbers \(u=2+3ki\) and \(v=4+5ki\), where \(k\) is a real constant.</p>
        <p class="step-text">Show that the complex number \(w=\frac{u}{v}\) will not lie on the line \(y=x\) in the Argand diagram, for any value of \(k\).</p>
      `,
      hints: [
        raw`Start by writing \(w=\frac{2+3ki}{4+5ki}\).`,
        raw`Multiply top and bottom by the conjugate \(4-5ki\).`,
        raw`For a point on \(y=x\), the real part and imaginary part must be equal.`
      ],
      answerHtml: raw`
        <p class="step-text">First rationalise the denominator:</p>
        <div class="math-block">
          \[
          w=\frac{2+3ki}{4+5ki}\cdot\frac{4-5ki}{4-5ki}
          \]
          \[
          w=\frac{8+12ki-10ki-15k^2i^2}{16+25k^2}
          \]
          \[
          w=\frac{15k^2+8+2ki}{16+25k^2}
          \]
          \[
          w=\frac{15k^2+8}{16+25k^2}+\frac{2k}{16+25k^2}i
          \]
        </div>
        <p class="step-text">For a point on \(y=x\), the real and imaginary parts must be equal:</p>
        <div class="math-block">
          \[
          \frac{15k^2+8}{16+25k^2}=\frac{2k}{16+25k^2}
          \]
          \[
          15k^2+8=2k
          \]
          \[
          15k^2-2k+8=0
          \]
        </div>
        <p class="step-text">Now check the discriminant:</p>
        <div class="math-block">
          \[
          b^2-4ac=(-2)^2-4(15)(8)=4-480=-476
          \]
        </div>
        <p class="step-text">Since the discriminant is negative, there is no real value of \(k\). So \(w\) cannot lie on \(y=x\).</p>
        ${answerBox(raw`
          \[
          \text{No real value of }k\text{ makes }w\text{ lie on }y=x.
          \]
        `)}
        ${mistakeBox(raw`Do not set the original numerator and denominator equal. You need the real part of the simplified quotient to match the imaginary part.`)}
      `,
      steps: [
        {
          type: "typed",
          title: "Split the numerator cleanly",
          text: raw`After multiplying by \(4-5ki\), what pair do you get for \((\text{real numerator},\text{coefficient of }i)\)?`,
          ariaLabel: "Type the real numerator and coefficient of i",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["15k^2+8,2k"],
          samples: [{ k: 1 }, { k: 2 }, { k: -1 }],
          successMessage: raw`Correct. The numerator is \(15k^2+8+2ki\), so the pair is \((15k^2+8,2k)\).`,
          genericMessage: raw`Expand carefully and remember that \(i^2=-1\).`
        },
        {
          type: "typed",
          title: "Use y = x",
          text: raw`What equation do you get by setting the real and imaginary parts equal?`,
          ariaLabel: "Type the equation after matching parts",
          mode: "equation",
          acceptedAnswers: ["15k^2+8=2k", "15k^2-2k+8=0"],
          samples: [{ k: 1 }, { k: 2 }, { k: -1 }],
          successMessage: raw`Yes. Matching the parts leads to \(15k^2+8=2k\), or \(15k^2-2k+8=0\).`,
          genericMessage: raw`Write \(w\) in \(a+bi\) form, then use \(a=b\).`
        },
        {
          type: "typed",
          title: "Check the discriminant",
          text: raw`What is the discriminant of \(15k^2-2k+8=0\)?`,
          ariaLabel: "Type the discriminant",
          acceptedAnswers: ["-476"],
          successMessage: raw`Right. The discriminant is negative, so there are no real solutions for \(k\).`,
          genericMessage: raw`Use \(b^2-4ac\) with \(a=15\), \(b=-2\), and \(c=8\).`
        },
        {
          type: "choice",
          title: "Finish the argument",
          text: raw`What conclusion does the negative discriminant give?`,
          choices: [
            {
              html: raw`No real value of \(k\) works.`,
              correct: true,
              successMessage: raw`Exactly. No real \(k\) works, so \(w\) never lands on \(y=x\).`
            },
            {
              html: raw`There is exactly one real value of \(k\).`,
              failureMessage: raw`Not here. A negative discriminant means there are no real roots.`
            },
            {
              html: raw`There are two real values of \(k\).`,
              failureMessage: raw`That would need a positive discriminant, not a negative one.`
            }
          ],
          genericMessage: raw`Use what a negative discriminant tells you about real roots.`
        }
      ]
    }),
    "2a": createConfig("2a", "2024 Paper — Writing a fraction as a + bi", {
      focus: raw`using the conjugate to rewrite a complex fraction in standard form.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \frac{i}{2k+i}
          \]
        </div>
        <p class="step-text">Write the complex number in the form \(a+bi\), where \(a\), \(b\), and \(k\) are real numbers, giving your answer in terms of \(k\).</p>
      `,
      questionNotes: [
        raw`When you type coefficient pairs, use \((a,b)\).`
      ],
      hints: [
        raw`Multiply top and bottom by the conjugate of the denominator, \(2k-i\).`,
        raw`The denominator becomes \(4k^2+1\).`,
        raw`Once the fraction is simplified, read off the real and imaginary coefficients.`
      ],
      answerHtml: raw`
        <p class="step-text">Multiply by the conjugate of the denominator:</p>
        <div class="math-block">
          \[
          \frac{i}{2k+i}\cdot\frac{2k-i}{2k-i}
          =\frac{i(2k-i)}{(2k+i)(2k-i)}
          \]
          \[
          =\frac{2ki-i^2}{4k^2+1}
          \]
          \[
          =\frac{1+2ki}{4k^2+1}
          \]
        </div>
        <p class="step-text">Now split it into real and imaginary parts:</p>
        <div class="math-block">
          \[
          \frac{i}{2k+i}=\frac{1}{4k^2+1}+\frac{2k}{4k^2+1}i
          \]
        </div>
        ${answerBox(raw`
          \[
          \frac{i}{2k+i}=\frac{1}{4k^2+1}+\frac{2k}{4k^2+1}i
          \]
        `)}
        ${tipBox(raw`A quick way to check yourself is this: after rationalising, there should be no \(i\) left in the denominator.`)}
      `,
      steps: [
        {
          type: "typed",
          title: "Choose the conjugate",
          text: raw`What pair \((\text{real part},\text{imaginary coefficient})\) represents the conjugate of \(2k+i\)?`,
          ariaLabel: "Type the conjugate pair",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["2k,-1"],
          samples: [{ k: 1 }, { k: 2 }, { k: 5 }],
          successMessage: raw`Correct. The conjugate is \(2k-i\), so the pair is \((2k,-1)\).`,
          genericMessage: raw`Keep the real part the same and change the sign of the imaginary part.`
        },
        {
          type: "typed",
          title: "Simplify the numerator",
          text: raw`After multiplying out, what pair do you get for \((\text{real numerator},\text{coefficient of }i)\)?`,
          ariaLabel: "Type the real numerator and coefficient of i",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["1,2k"],
          samples: [{ k: 1 }, { k: 2 }, { k: 5 }],
          successMessage: raw`Yes. Since \(i^2=-1\), the numerator becomes \(1+2ki\), so the pair is \((1,2k)\).`,
          genericMessage: raw`Expand \(i(2k-i)\) and replace \(i^2\) with \(-1\).`
        },
        {
          type: "typed",
          title: "Read off a and b",
          text: raw`Type the coefficients \((a,b)\) for the final form \(a+bi\).`,
          ariaLabel: "Type the values of a and b",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["1/(4k^2+1),2k/(4k^2+1)"],
          samples: [{ k: 1 }, { k: 2 }, { k: 5 }],
          successMessage: raw`Correct. So \(a=\frac{1}{4k^2+1}\) and \(b=\frac{2k}{4k^2+1}\).`,
          targetedFeedback: [
            {
              answers: ["2k/(4k^2+1),1/(4k^2+1)"],
              mode: "list",
              options: orderedListOptions,
              message: raw`Those are the right pieces, but the order should be \((a,b)\).`
            }
          ],
          genericMessage: raw`Split \(\frac{1+2ki}{4k^2+1}\) into a real part and an imaginary coefficient.`
        }
      ]
    }),
    "2b": createConfig("2b", "2024 Paper — Equal roots from the discriminant", {
      focus: raw`setting the discriminant equal to zero and solving the quadratic in \(r\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          2x^2+(3+2r)x+3-2r=0
          \]
        </div>
        <p class="step-text">Find the value(s) of \(r\) so that the quadratic equation has equal roots.</p>
      `,
      hints: [
        raw`Equal roots means the discriminant is \(0\).`,
        raw`Here \(a=2\), \(b=3+2r\), and \(c=3-2r\).`,
        raw`Once you expand \(b^2-4ac=0\), solve the new quadratic in \(r\).`
      ],
      answerHtml: raw`
        <p class="step-text">For equal roots, the discriminant must be zero:</p>
        <div class="math-block">
          \[
          (3+2r)^2-4(2)(3-2r)=0
          \]
          \[
          9+12r+4r^2-24+16r=0
          \]
          \[
          4r^2+28r-15=0
          \]
        </div>
        <p class="step-text">Now solve the quadratic in \(r\):</p>
        <div class="math-block">
          \[
          r=\frac{1}{2},\,-\frac{15}{2}
          \]
        </div>
        ${answerBox(raw`
          \[
          r=\frac{1}{2},\,-\frac{15}{2}
          \]
        `)}
        ${tipBox(raw`This is a classic “equal roots” cue. The moment you see it, think \(b^2-4ac=0\).`)}
      `,
      steps: [
        {
          type: "typed",
          title: "Write the discriminant condition",
          text: raw`What equation do you get from \(b^2-4ac=0\)?`,
          ariaLabel: "Type the discriminant equation",
          mode: "equation",
          acceptedAnswers: ["(3+2r)^2-8(3-2r)=0"],
          samples: [{ r: 1 }, { r: -2 }, { r: 3 }],
          successMessage: raw`Correct. That is the discriminant condition for equal roots.`,
          genericMessage: raw`Use \(a=2\), \(b=3+2r\), and \(c=3-2r\).`
        },
        {
          type: "typed",
          title: "Simplify the quadratic in r",
          text: raw`After expanding, what quadratic in \(r\) do you get?`,
          ariaLabel: "Type the quadratic in r",
          mode: "equation",
          acceptedAnswers: ["4r^2+28r-15=0"],
          samples: [{ r: 1 }, { r: -2 }, { r: 3 }],
          successMessage: raw`Yes. Expanding and collecting terms gives \(4r^2+28r-15=0\).`,
          genericMessage: raw`Expand \((3+2r)^2\), then combine like terms carefully.`
        },
        {
          type: "typed",
          title: "Solve for r",
          text: raw`Type both values of \(r\), separated by commas.`,
          ariaLabel: "Type both values of r",
          mode: "list",
          options: unorderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["1/2,-15/2"],
          successMessage: raw`Exactly. The values are \(r=\frac{1}{2}\) and \(r=-\frac{15}{2}\).`,
          genericMessage: raw`Solve \(4r^2+28r-15=0\).`
        }
      ]
    }),
    "2c": createConfig("2c", "2024 Paper — Solving for w before taking the modulus", {
      focus: raw`rearranging a complex equation, splitting \(w\) into \(a+bi\), and then finding \(|w|\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \frac{w}{w+i}=2-i
          \]
        </div>
        <p class="step-text">Given that, find \(|w|\).</p>
      `,
      hints: [
        raw`Start by multiplying both sides by \(w+i\).`,
        raw`Let \(w=a+bi\) so you can match real and imaginary parts.`,
        raw`Once you have \(w\), use \(|a+bi|=\sqrt{a^2+b^2}\).`
      ],
      answerHtml: raw`
        <p class="step-text">Rearrange first:</p>
        <div class="math-block">
          \[
          w=(2-i)(w+i)
          \]
          \[
          w=2w-wi+2i-i^2
          \]
          \[
          w=2w+1+i(2-w)
          \]
        </div>
        <p class="step-text">Let \(w=a+bi\). Then:</p>
        <div class="math-block">
          \[
          a+bi+1+2i-ai-bi^2=0
          \]
          \[
          a+b+1+bi+2i-ai=0
          \]
          \[
          a+b+1=0
          \]
          \[
          a=-b-1
          \]
          \[
          bi+2i-ai=0
          \]
          \[
          bi+2i+bi+i=0
          \]
          \[
          2bi+3i=0
          \]
          \[
          2b+3=0
          \]
          \[
          b=-\frac{3}{2},\qquad a=\frac{1}{2}
          \]
        </div>
        <p class="step-text">So:</p>
        <div class="math-block">
          \[
          w=\frac{1}{2}-\frac{3}{2}i
          \]
          \[
          |w|=\sqrt{\left(\frac{1}{2}\right)^2+\left(-\frac{3}{2}\right)^2}
          =\sqrt{\frac{10}{4}}=\frac{\sqrt{10}}{2}
          \]
        </div>
        ${answerBox(raw`
          \[
          |w|=\frac{\sqrt{10}}{2}
          \]
        `)}
        ${mistakeBox(raw`Do not take the modulus too early. You need the actual value of \(w\) first, then you can find \(|w|\).`)}
      `,
      steps: [
        {
          type: "choice",
          title: "Clear the denominator",
          text: raw`Which equation do you get after multiplying both sides by \(w+i\)?`,
          choices: [
            {
              html: raw`\[
                w=(2-i)(w+i)
              \]`,
              correct: true,
              successMessage: raw`Correct. That is the clean starting point for solving for \(w\).`
            },
            {
              html: raw`\[
                w+i=(2-i)w
              \]`,
              failureMessage: raw`Close, but you need to multiply the whole right-hand side by \(w+i\), not just \(w\).`
            },
            {
              html: raw`\[
                w=(2-i)+w+i
              \]`,
              failureMessage: raw`That treats multiplication like addition. Clear the denominator first, then keep the factor \(w+i\) together.`
            }
          ],
          genericMessage: raw`Multiply both sides of \(\frac{w}{w+i}=2-i\) by the denominator \(w+i\).`
        },
        {
          type: "typed",
          title: "Find w",
          text: raw`If \(w=a+bi\), what pair \((a,b)\) do you get?`,
          ariaLabel: "Type the values of a and b",
          mode: "list",
          options: complexPairListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["1/2,-3/2"],
          successMessage: raw`Yes. So \(w=\frac{1}{2}-\frac{3}{2}i\).`,
          targetedFeedback: [
            {
              answers: ["-3/2,1/2"],
              mode: "list",
              options: orderedListOptions,
              message: raw`Those are the right numbers, but the order should be \((a,b)\).`
            }
          ],
          genericMessage: raw`Match real and imaginary parts after substituting \(w=a+bi\).`
        },
        {
          type: "typed",
          title: "Find the modulus",
          text: raw`What is \(|w|\)?`,
          ariaLabel: "Type the modulus of w",
          acceptedAnswers: ["sqrt(10)/2"],
          successMessage: raw`Correct. \(|w|=\frac{\sqrt{10}}{2}\).`,
          genericMessage: raw`Use \(|a+bi|=\sqrt{a^2+b^2}\) with \(a=\frac{1}{2}\) and \(b=-\frac{3}{2}\).`
        }
      ]
    }),
    "2d": createConfig("2d", "2024 Paper — Conjugate roots and matching coefficients", {
      focus: raw`using the conjugate root, building a quadratic factor, and then finding the remaining root and coefficient.`,
      questionHtml: raw`
        <p class="step-text">One solution of the equation</p>
        <div class="question-math">
          \[
          2z^3+dz^2+140z-200=0
          \]
        </div>
        <p class="step-text">is \(z=6-2i\).</p>
        <p class="step-text">If \(d\) is real, find the value of \(d\) and the other two solutions of the equation.</p>
      `,
      hints: [
        raw`Since \(d\) is real, the conjugate \(6+2i\) is another root.`,
        raw`Multiply the conjugate pair first to get a quadratic factor.`,
        raw`Use the constant term to find the last linear factor quickly.`
      ],
      answerHtml: raw`
        <p class="step-text">Because the coefficients are real, the conjugate root \(6+2i\) is also a solution.</p>
        <p class="step-text">So the conjugate pair gives:</p>
        <div class="math-block">
          \[
          (z-(6-2i))(z-(6+2i))
          =(z-6+2i)(z-6-2i)
          \]
          \[
          =z^2-12z+40
          \]
        </div>
        <p class="step-text">Now match the full cubic:</p>
        <div class="math-block">
          \[
          (z^2-12z+40)(2z-a)
          \]
          \[
          \text{To get the constant }-200,\text{ we need }40(-a)=-200,\text{ so }a=5
          \]
          \[
          (z^2-12z+40)(2z-5)
          \]
          \[
          =2z^3-29z^2+140z-200
          \]
        </div>
        <p class="step-text">So the remaining root comes from \(2z-5=0\), which gives \(z=\frac{5}{2}\), and the coefficient is \(d=-29\).</p>
        ${answerBox(raw`
          \[
          d=-29
          \]
          \[
          \text{Other two solutions: }6+2i,\ \frac{5}{2}
          \]
        `)}
        ${tipBox(raw`That little constant-term shortcut saves time: once you have the quadratic factor, use the product of constants to pin down the last factor quickly.`)}
      `,
      steps: [
        {
          type: "typed",
          title: "Use the conjugate root",
          text: raw`Type the conjugate root as \((\text{real part},\text{imaginary coefficient})\).`,
          ariaLabel: "Type the conjugate root as a pair",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["6,2"],
          successMessage: raw`Correct. The conjugate root is \(6+2i\).`,
          genericMessage: raw`Take the conjugate of \(6-2i\) by changing the sign of the imaginary part.`
        },
        {
          type: "typed",
          title: "Build the quadratic factor",
          text: raw`What quadratic factor comes from the conjugate pair?`,
          ariaLabel: "Type the quadratic factor",
          acceptedAnswers: ["z^2-12z+40"],
          samples: [{ z: 0 }, { z: 2 }, { z: 5 }],
          successMessage: raw`Yes. Multiplying the conjugate pair gives \(z^2-12z+40\).`,
          genericMessage: raw`Multiply \((z-6+2i)(z-6-2i)\).`
        },
        {
          type: "typed",
          title: "Find the remaining root",
          text: raw`Type the other two roots, separated by commas.`,
          ariaLabel: "Type the remaining roots",
          mode: "list",
          options: complexListOptions,
          acceptedAnswers: ["6+2i,5/2"],
          successMessage: raw`Correct. The last factor is \(2z-5\), so the remaining roots are \(6+2i\) and \(\frac{5}{2}\).`,
          genericMessage: raw`Use the constant term to find the last factor, then solve it.`
        },
        {
          type: "typed",
          title: "Match the coefficient",
          text: raw`What value of \(d\) does the expansion give?`,
          ariaLabel: "Type the value of d",
          acceptedAnswers: ["-29"],
          successMessage: raw`Exactly. Expanding gives \(2z^3-29z^2+140z-200\), so \(d=-29\).`,
          genericMessage: raw`Expand \((z^2-12z+40)(2z-5)\) and compare the \(z^2\) coefficient.`
        }
      ]
    }),
    "2e": createConfig("2e", "2024 Paper — Turning a modulus locus into a circle", {
      focus: raw`rewriting the locus in \(x\) and \(y\), completing the square, and then finding the given point on the circle.`,
      questionHtml: raw`
        <p class="step-text">The locus of a complex number \(z\) is described by</p>
        <div class="question-math">
          \[
          |z-1-7i|=2|z-4-4i|
          \]
        </div>
        <p class="step-text">The complex number \(u=3+di\) lies on this locus.</p>
        <p class="step-text">Find the Cartesian equation of the locus of \(z\), giving your answer in the form \((x-a)^2+(y-b)^2=k\), and also find the complex number(s) \(u\).</p>
      `,
      hints: [
        raw`Let \(z=x+yi\), then rewrite both moduli as square roots.`,
        raw`After squaring and simplifying, complete the square in both \(x\) and \(y\).`,
        raw`For \(u=3+di\), the real part is already fixed at \(x=3\).`
      ],
      answerHtml: raw`
        <p class="step-text">Let \(z=x+yi\). Then:</p>
        <div class="math-block">
          \[
          |(x-1)+(y-7)i|=2|(x-4)+(y-4)i|
          \]
          \[
          \sqrt{(x-1)^2+(y-7)^2}=2\sqrt{(x-4)^2+(y-4)^2}
          \]
        </div>
        <p class="step-text">Square both sides and expand:</p>
        <div class="math-block">
          \[
          (x-1)^2+(y-7)^2=4(x-4)^2+4(y-4)^2
          \]
          \[
          -3x^2+30x-63=3y^2-18y+15
          \]
          \[
          x^2-10x+y^2-6y+26=0
          \]
        </div>
        <p class="step-text">Now complete the square:</p>
        <div class="math-block">
          \[
          (x-5)^2+(y-3)^2=8
          \]
        </div>
        <p class="step-text">Since \(u=3+di\), we know \(x=3\). Substitute that into the circle:</p>
        <div class="math-block">
          \[
          (3-5)^2+(y-3)^2=8
          \]
          \[
          4+(y-3)^2=8
          \]
          \[
          (y-3)^2=4
          \]
          \[
          y=5\text{ or }1
          \]
        </div>
        <p class="step-text">So the two possible complex numbers are \(u=3+5i\) and \(u=3+i\).</p>
        ${answerBox(raw`
          \[
          (x-5)^2+(y-3)^2=8
          \]
          \[
          u=3+5i,\ 3+i
          \]
        `)}
        ${tipBox(raw`When the question gives you \(u=3+di\), it is basically handing you \(x=3\). Use that straight away after you find the circle.`)}
      `,
      steps: [
        {
          type: "typed",
          title: "Rewrite the locus",
          text: raw`What equation do you get after writing \(z=x+yi\) and converting both moduli to square roots?`,
          ariaLabel: "Type the square-root equation",
          mode: "equation",
          acceptedAnswers: ["sqrt((x-1)^2+(y-7)^2)=2sqrt((x-4)^2+(y-4)^2)"],
          samples: [{ x: 0, y: 0 }, { x: 3, y: 5 }, { x: 6, y: -1 }],
          successMessage: raw`Correct. That is the clean Cartesian version of the locus.`,
          genericMessage: raw`Use \(|a+bi|=\sqrt{a^2+b^2}\) on both sides.`
        },
        {
          type: "typed",
          title: "Complete the square",
          text: raw`What circle equation do you get after expanding and completing the square?`,
          ariaLabel: "Type the circle equation",
          mode: "equation",
          acceptedAnswers: ["(x-5)^2+(y-3)^2=8"],
          samples: [{ x: 0, y: 0 }, { x: 3, y: 5 }, { x: 6, y: -1 }],
          successMessage: raw`Yes. The locus is the circle \((x-5)^2+(y-3)^2=8\).`,
          genericMessage: raw`Expand first, then collect terms and complete the square in both variables.`
        },
        {
          type: "typed",
          title: "Use x = 3",
          text: raw`After substituting \(x=3\), what equation do you get for \(y\)?`,
          ariaLabel: "Type the equation in y",
          mode: "equation",
          acceptedAnswers: ["(y-3)^2=4"],
          samples: [{ y: 1 }, { y: 5 }, { y: 6 }],
          successMessage: raw`Correct. Substituting \(x=3\) leaves \((y-3)^2=4\).`,
          genericMessage: raw`Put \(x=3\) into the circle equation and simplify.`
        },
        {
          type: "typed",
          title: "Find u",
          text: raw`Type both possible values of \(u\), separated by commas.`,
          ariaLabel: "Type both possible values of u",
          mode: "list",
          options: complexListOptions,
          acceptedAnswers: ["3+5i,3+i"],
          successMessage: raw`Exactly. The two values are \(u=3+5i\) and \(u=3+i\).`,
          genericMessage: raw`Use the two possible \(y\)-values with real part \(3\).`
        }
      ]
    }),
    "3a": createConfig("3a", "2024 Paper — Rationalising a surd denominator", {
      focus: raw`multiplying by the conjugate and simplifying everything cleanly.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \frac{\sqrt{2p}}{\sqrt{2p}-\sqrt{p}}
          \]
        </div>
        <p class="step-text">Write the expression in the form \(a+\sqrt{a}\), where \(p\) and \(a\) are real constants.</p>
      `,
      hints: [
        raw`Multiply top and bottom by the conjugate \(\sqrt{2p}+\sqrt{p}\).`,
        raw`The denominator becomes \(2p-p\), which is just \(p\).`,
        raw`After simplifying, the \(p\) cancels out completely.`
      ],
      answerHtml: raw`
        <p class="step-text">Multiply by the conjugate of the denominator:</p>
        <div class="math-block">
          \[
          \frac{\sqrt{2p}}{\sqrt{2p}-\sqrt{p}}\cdot\frac{\sqrt{2p}+\sqrt{p}}{\sqrt{2p}+\sqrt{p}}
          \]
          \[
          =\frac{\sqrt{2p}(\sqrt{2p}+\sqrt{p})}{(\sqrt{2p})^2-(\sqrt{p})^2}
          \]
          \[
          =\frac{2p+\sqrt{2p^2}}{p}
          \]
        </div>
        <p class="step-text">Now simplify:</p>
        <div class="math-block">
          \[
          \frac{2p}{p}+\frac{p\sqrt{2}}{p}=2+\sqrt{2}
          \]
        </div>
        ${answerBox(raw`
          \[
          2+\sqrt{2}
          \]
        `)}
        ${tipBox(raw`This is one of those nice ones where the parameter disappears completely after rationalising.`)}
      `,
      steps: [
        {
          type: "typed",
          title: "Pick the conjugate",
          text: raw`What conjugate should you multiply by?`,
          ariaLabel: "Type the conjugate",
          acceptedAnswers: ["sqrt(2p)+sqrt(p)"],
          samples: [{ p: 1 }, { p: 2 }, { p: 5 }],
          successMessage: raw`Correct. That conjugate removes the surd from the denominator.`,
          genericMessage: raw`Change the sign between the two surds.`
        },
        {
          type: "typed",
          title: "Simplify the denominator",
          text: raw`What does the denominator simplify to after using the difference of two squares?`,
          ariaLabel: "Type the simplified denominator",
          acceptedAnswers: ["p"],
          samples: [{ p: 1 }, { p: 2 }, { p: 5 }],
          successMessage: raw`Yes. \((\sqrt{2p})^2-(\sqrt{p})^2=2p-p=p\).`,
          genericMessage: raw`Use \(a^2-b^2\) with \(a=\sqrt{2p}\) and \(b=\sqrt{p}\).`
        },
        {
          type: "typed",
          title: "Finish the simplification",
          text: raw`What is the final simplified result?`,
          ariaLabel: "Type the final simplified result",
          acceptedAnswers: ["2+sqrt(2)"],
          successMessage: raw`Exactly. The whole expression simplifies to \(2+\sqrt{2}\).`,
          genericMessage: raw`Cancel the common factor of \(p\) after expanding the numerator.`
        }
      ]
    }),
    "3b": createConfig("3b", "2024 Paper — Squaring a plotted complex number", {
      focus: raw`turning a plotted point into \(a+bi\), squaring it, and reading off the new Argand point.`,
      questionHtml: raw`
        <p class="step-text">In the Argand diagram below, the point \((-2,3)\) represents the complex number \(z\).</p>
        ${argandPlotHtml({
          ariaLabel: "Argand diagram showing the point z at negative 2 comma 3",
          xMin: -8,
          xMax: 4,
          yMin: -14,
          yMax: 6,
          points: [
            { x: -2, y: 3, label: "z", labelX: -1.55, labelY: 3.4 }
          ]
        })}
        <p class="step-text">Show clearly, in the diagram below, the point representing \(w=z^2\).</p>
      `,
      questionNotes: [
        raw`When you type coordinates, use \((\text{real},\text{imaginary})\).`
      ],
      hints: [
        raw`The point \((-2,3)\) means \(z=-2+3i\).`,
        raw`Square it the usual algebra way.`,
        raw`Once you simplify to \(a+bi\), the point is \((a,b)\).`
      ],
      answerHtml: raw`
        <p class="step-text">Translate the point into complex form and square it:</p>
        <div class="math-block">
          \[
          z=-2+3i
          \]
          \[
          z^2=(-2+3i)^2
          \]
          \[
          =4-12i+9i^2
          \]
          \[
          =4-12i-9
          \]
          \[
          =-5-12i
          \]
        </div>
        <p class="step-text">So the point for \(w=z^2\) is \((-5,-12)\).</p>
        ${argandPlotHtml({
          ariaLabel: "Argand diagram showing z at negative 2 comma 3 and w at negative 5 comma negative 12",
          xMin: -8,
          xMax: 4,
          yMin: -14,
          yMax: 6,
          points: [
            { x: -2, y: 3, label: "z", labelX: -1.55, labelY: 3.4 },
            { x: -5, y: -12, label: "w", className: "graph-point-secondary", labelX: -4.55, labelY: -11.55 }
          ]
        })}
        ${answerBox(raw`
          \[
          w=-5-12i
          \]
          \[
          \text{Plot the point }(-5,-12).
          \]
        `)}
      `,
      steps: [
        {
          type: "typed",
          title: "Read z from the diagram",
          text: raw`Type the coefficients of \(z\) as \((\text{real part},\text{imaginary coefficient})\).`,
          ariaLabel: "Type the coefficients of z",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["-2,3"],
          successMessage: raw`Correct. So \(z=-2+3i\).`,
          genericMessage: raw`Read the horizontal coordinate first and the vertical coordinate second.`
        },
        {
          type: "typed",
          title: "Find the plotted point",
          text: raw`What ordered pair should you plot for \(w=z^2\)?`,
          ariaLabel: "Type the coordinates of w",
          mode: "list",
          options: complexPairListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["-5,-12"],
          successMessage: raw`Exactly. Squaring gives \(w=-5-12i\), so the point is \((-5,-12)\).`,
          genericMessage: raw`Square \((-2+3i)\) first, then read the real and imaginary parts as coordinates.`
        }
      ]
    }),
    "3c": createConfig("3c", "2024 Paper — Using z times z-bar", {
      focus: raw`turning an inverse equation into a quadratic in the real parameter \(d\).`,
      questionHtml: raw`
        <p class="step-text">Find the value(s) of the real constant \(d\), given that \(z=3+di\) and</p>
        <div class="question-math">
          \[
          \overline{z}=10dz^{-1}
          \]
        </div>
      `,
      hints: [
        raw`Write \(\overline{z}\) as \(3-di\).`,
        raw`Multiply both sides by \(z\) so the inverse disappears.`,
        raw`Use \(z\overline{z}=|z|^2\).`
      ],
      answerHtml: raw`
        <p class="step-text">Start by writing the conjugate and clearing the inverse:</p>
        <div class="math-block">
          \[
          3-di=\frac{10d}{3+di}
          \]
          \[
          (3-di)(3+di)=10d
          \]
        </div>
        <p class="step-text">Now simplify:</p>
        <div class="math-block">
          \[
          9-d^2i^2=10d
          \]
          \[
          9+d^2=10d
          \]
          \[
          d^2-10d+9=0
          \]
          \[
          (d-9)(d-1)=0
          \]
        </div>
        ${answerBox(raw`
          \[
          d=9,\ 1
          \]
        `)}
        ${tipBox(raw`As soon as you see \(\overline{z}\) and \(z^{-1}\) together, think about multiplying through by \(z\). It usually collapses nicely.`)}
      `,
      steps: [
        {
          type: "typed",
          title: "Clear the inverse",
          text: raw`What equation do you get after multiplying through by \(z\)?`,
          ariaLabel: "Type the equation after clearing the inverse",
          mode: "equation",
          acceptedAnswers: ["9+d^2=10d"],
          samples: [{ d: 1 }, { d: 2 }, { d: 9 }],
          successMessage: raw`Correct. Multiplying by \(z\) gives \(z\overline{z}=10d\), which becomes \(9+d^2=10d\).`,
          genericMessage: raw`Use \((3-di)(3+di)\) on the left-hand side.`
        },
        {
          type: "typed",
          title: "Solve for d",
          text: raw`Type both possible values of \(d\), separated by commas.`,
          ariaLabel: "Type the values of d",
          mode: "list",
          options: unorderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["9,1"],
          successMessage: raw`Exactly. The solutions are \(d=9\) and \(d=1\).`,
          genericMessage: raw`Factor \(d^2-10d+9\).`
        }
      ]
    }),
    "3d": createConfig("3d", "2024 Paper — Fourth roots in polar form", {
      focus: raw`writing a negative real number in polar form and then taking the fourth roots.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          z^4+81k^8=0
          \]
        </div>
        <p class="step-text">Solve the equation, where \(k\) is a real constant.</p>
        <p class="step-text">Give your solution(s) in polar form in terms of \(k\).</p>
      `,
      hints: [
        raw`Move \(81k^8\) to the other side first.`,
        raw`A negative real number has argument \(\pi\), so start with \(81k^8\operatorname{cis}(\pi)\).`,
        raw`When you take fourth roots, the modulus becomes \(3k^2\) and the arguments differ by \(\frac{\pi}{2}\).`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite the equation first:</p>
        <div class="math-block">
          \[
          z^4=-81k^8
          \]
          \[
          z^4=81k^8\operatorname{cis}((2n+1)\pi)
          \]
        </div>
        <p class="step-text">Now take fourth roots:</p>
        <div class="math-block">
          \[
          z=3k^2\operatorname{cis}\left(\frac{(2n+1)\pi}{4}\right)
          \]
          \[
          z=3k^2\operatorname{cis}\left(\frac{\pi}{4}+n\frac{\pi}{2}\right),\qquad n=0,1,2,3
          \]
        </div>
        <p class="step-text">So the four solutions are:</p>
        <div class="math-block">
          \[
          3k^2\operatorname{cis}\left(\frac{\pi}{4}\right),\ 
          3k^2\operatorname{cis}\left(\frac{3\pi}{4}\right),\ 
          3k^2\operatorname{cis}\left(-\frac{3\pi}{4}\right),\ 
          3k^2\operatorname{cis}\left(-\frac{\pi}{4}\right)
          \]
        </div>
        ${answerBox(raw`
          \[
          z=3k^2\operatorname{cis}\left(\frac{\pi}{4}\right),\ 
          3k^2\operatorname{cis}\left(\frac{3\pi}{4}\right),\ 
          3k^2\operatorname{cis}\left(-\frac{3\pi}{4}\right),\ 
          3k^2\operatorname{cis}\left(-\frac{\pi}{4}\right)
          \]
        `)}
        ${tipBox(raw`I’ve used \(n\) as the root counter here so it does not clash with the real constant \(k\).`)}
      `,
      steps: [
        {
          type: "typed",
          title: "Rewrite the right-hand side",
          text: raw`What is the modulus of \(-81k^8\)?`,
          ariaLabel: "Type the modulus",
          acceptedAnswers: ["81k^8"],
          samples: [{ k: 1 }, { k: 2 }, { k: 3 }],
          successMessage: raw`Correct. The modulus is \(81k^8\).`,
          genericMessage: raw`A modulus is always non-negative, so use the size of the number only.`
        },
        {
          type: "typed",
          title: "General argument form",
          text: raw`What general expression can you use for the fourth-root arguments?`,
          ariaLabel: "Type the general root argument",
          acceptedAnswers: ["pi/4+npi/2", "npi/2+pi/4"],
          samples: [{ n: 0 }, { n: 1 }, { n: 2 }, { n: 3 }],
          successMessage: raw`Yes. The arguments are \(\frac{\pi}{4}+n\frac{\pi}{2}\).`,
          genericMessage: raw`Start from argument \(\pi\), then divide by \(4\) and allow the usual full set of roots.`
        },
        {
          type: "typed",
          title: "List the four arguments",
          text: raw`Type the four principal arguments, separated by commas.`,
          ariaLabel: "Type the four arguments",
          mode: "list",
          options: unorderedListOptions,
          acceptedAnswers: [
            "pi/4,3pi/4,-3pi/4,-pi/4",
            "pi/4,3pi/4,5pi/4,7pi/4"
          ],
          successMessage: raw`Correct. Those give the four fourth roots in polar form.`,
          genericMessage: raw`Substitute \(n=0,1,2,3\) into \(\frac{\pi}{4}+n\frac{\pi}{2}\).`
        }
      ]
    }),
    "3e": createConfig("3e", "2024 Paper — Using a cube expansion", {
      focus: raw`cubing \(x+\frac{1}{x}\), then rearranging to isolate \(x^3+\frac{1}{x^3}\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          x+\frac{1}{x}=p
          \]
        </div>
        <p class="step-text">Given that, where \(p\) is a real constant, find the value of</p>
        <div class="question-math">
          \[
          x^3+\frac{1}{x^3},
          \]
        </div>
        <p class="step-text">giving your answer in terms of \(p\).</p>
      `,
      hints: [
        raw`Cube both sides: \(p^3=\left(x+\frac{1}{x}\right)^3\).`,
        raw`When you expand, group \(x^3+\frac{1}{x^3}\) together.`,
        raw`Replace \(x+\frac{1}{x}\) with \(p\) right at the end.`
      ],
      answerHtml: raw`
        <p class="step-text">Start by cubing both sides:</p>
        <div class="math-block">
          \[
          p^3=\left(x+\frac{1}{x}\right)^3
          \]
          \[
          p^3=x^3+\frac{1}{x^3}+3x+\frac{3}{x}
          \]
        </div>
        <p class="step-text">Now group the middle terms together:</p>
        <div class="math-block">
          \[
          p^3=x^3+\frac{1}{x^3}+3\left(x+\frac{1}{x}\right)
          \]
          \[
          p^3=x^3+\frac{1}{x^3}+3p
          \]
        </div>
        <p class="step-text">Rearrange:</p>
        <div class="math-block">
          \[
          x^3+\frac{1}{x^3}=p^3-3p
          \]
        </div>
        ${answerBox(raw`
          \[
          x^3+\frac{1}{x^3}=p^3-3p
          \]
        `)}
        ${tipBox(raw`That last substitution matters. Once you see \(x+\frac{1}{x}\) appear again, replace it with \(p\) straight away.`)}
      `,
      steps: [
        {
          type: "typed",
          title: "Expand the cube",
          text: raw`After cubing both sides, what equation do you get before substituting back in \(p\)?`,
          ariaLabel: "Type the expanded cube equation",
          mode: "equation",
          acceptedAnswers: [
            "p^3=x^3+1/x^3+3x+3/x",
            "p^3=x^3+3x+3/x+1/x^3",
            "p^3=x^3+1/x^3+3(x+1/x)"
          ],
          samples: [{ x: 2, p: 5 }, { x: 3, p: 2 }, { x: 5, p: 7 }],
          successMessage: raw`Correct. That is the expanded form of \(\left(x+\frac{1}{x}\right)^3\).`,
          genericMessage: raw`Use \((a+b)^3=a^3+3a^2b+3ab^2+b^3\) with \(a=x\) and \(b=\frac{1}{x}\).`
        },
        {
          type: "typed",
          title: "Substitute the given relation",
          text: raw`What does \(3\left(x+\frac{1}{x}\right)\) become?`,
          ariaLabel: "Type the substituted term",
          acceptedAnswers: ["3p"],
          samples: [{ p: 1 }, { p: 3 }, { p: 5 }],
          successMessage: raw`Yes. Since \(x+\frac{1}{x}=p\), the whole bracket becomes \(3p\).`,
          genericMessage: raw`Use the given relation exactly as written.`
        },
        {
          type: "typed",
          title: "Isolate the target expression",
          text: raw`So what is \(x^3+\frac{1}{x^3}\) in terms of \(p\)?`,
          ariaLabel: "Type the final expression in p",
          acceptedAnswers: ["p^3-3p"],
          samples: [{ p: 1 }, { p: 3 }, { p: 5 }],
          successMessage: raw`Exactly. Rearranging gives \(x^3+\frac{1}{x^3}=p^3-3p\).`,
          genericMessage: raw`Subtract \(3p\) from both sides.`
        }
      ]
    })
  };
}());
