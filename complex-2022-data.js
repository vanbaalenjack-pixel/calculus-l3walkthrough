(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-complex-2022";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];

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
      buttonGridClass: "button-grid two-col",
      choices: choices
    }, extra || {});
  }

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return "complex-2022.html?q=" + encodeURIComponent(id);
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
      browserTitle: "2022 Level 3 Complex Numbers Paper — " + questionLabel(id),
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
    const xMin = settings.xMin == null ? -6.5 : settings.xMin;
    const xMax = settings.xMax == null ? 6.5 : settings.xMax;
    const yMin = settings.yMin == null ? -6.5 : settings.yMin;
    const yMax = settings.yMax == null ? 6.5 : settings.yMax;
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

  function questionThreeDiagramHtml(options) {
    const settings = options || {};
    const points = [
      { x: 3, y: 2, label: "r", labelX: 3.22, labelY: 2.22 },
      { x: 2, y: -5, label: "s", labelX: 2.22, labelY: -5.18 }
    ];

    if (settings.includeV) {
      points.push({ x: 4, y: 9, label: "v", className: "graph-point-secondary", labelX: 4.22, labelY: 9.2 });
    }

    return argandPlotHtml({
      ariaLabel: settings.includeV
        ? "Argand diagram showing the points r, s, and v"
        : "Argand diagram showing the points r and s",
      xMin: -10.5,
      xMax: 10.5,
      yMin: -10.5,
      yMax: 10.5,
      points: points
    });
  }

  window.Complex2022Walkthroughs = {
    "1a": createConfig("1a", "2022 Paper — Rationalising a surd denominator", {
      focus: raw`multiplying by the conjugate, using the difference of squares, and finishing in the exact form \(ak+bk\sqrt{5}\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Write }\frac{12k}{1+\sqrt{5}}\text{ in the form }ak+bk\sqrt{5},\text{ where }a\text{ and }b\text{ are integers.}
          \]
        </div>
      `,
      hints: [
        raw`Multiply top and bottom by the conjugate of \(1+\sqrt{5}\).`,
        raw`The denominator becomes a difference of squares.`,
        raw`Once the denominator is a number, divide every term in the numerator by it.`
      ],
      answerHtml: raw`
        <p class="step-text">Use the conjugate \(1-\sqrt{5}\):</p>
        <div class="math-block">
          \[
          \frac{12k}{1+\sqrt{5}}\cdot\frac{1-\sqrt{5}}{1-\sqrt{5}}
          =\frac{12k(1-\sqrt{5})}{(1+\sqrt{5})(1-\sqrt{5})}
          \]
          \[
          =\frac{12k-12k\sqrt{5}}{1-5}
          =\frac{12k-12k\sqrt{5}}{-4}
          \]
          \[
          =-3k+3k\sqrt{5}
          \]
        </div>
        ${answerBox(raw`
          \[
          -3k+3k\sqrt{5}
          \]
        `)}
        ${tipBox(raw`The conjugate is doing two jobs at once here: it removes the surd from the denominator and keeps the value of the fraction unchanged.`)}
      `,
      steps: [
        choiceStep("Choose the conjugate", raw`What should we multiply by to rationalise the denominator?`, [
          correctChoice(raw`\(\,\frac{1-\sqrt{5}}{1-\sqrt{5}}\)`, raw`Yes. The conjugate of \(1+\sqrt{5}\) is \(1-\sqrt{5}\).`),
          wrongChoice(raw`\(\,\frac{1+\sqrt{5}}{1+\sqrt{5}}\)`, raw`That keeps the same surd structure in the denominator, so it does not rationalise it.`),
          wrongChoice(raw`\(\,\frac{\sqrt{5}-1}{1-\sqrt{5}}\)`, raw`The numerator and denominator need to match so the multiplier equals \(1\).`),
          wrongChoice(raw`\(\,\frac{5-\sqrt{5}}{5-\sqrt{5}}\)`, raw`That is not the conjugate pair of the denominator.`)
        ]),
        choiceStep("Expand the numerator", raw`After multiplying by the conjugate, what does the numerator become?`, [
          correctChoice(raw`\(\,12k-12k\sqrt{5}\)`, raw`Correct. Distribute \(12k\) across both terms in \(1-\sqrt{5}\).`),
          wrongChoice(raw`\(\,12k+12k\sqrt{5}\)`, raw`The second term should be negative because the conjugate is \(1-\sqrt{5}\).`),
          wrongChoice(raw`\(\,12k-5\sqrt{5}\)`, raw`Keep the factor \(12k\) attached to both terms.`),
          wrongChoice(raw`\(\,12k\sqrt{5}-12k\)`, raw`That is the same pair of terms but in the wrong sign order for the final simplification.`)
        ]),
        choiceStep("Use the difference of squares", raw`What does the denominator simplify to?`, [
          correctChoice(raw`\(\,-4\)`, raw`Exactly. \((1+\sqrt{5})(1-\sqrt{5})=1-5=-4\).`),
          wrongChoice(raw`\(\,4\)`, raw`Check the order carefully: \(1-5=-4\), not \(4\).`),
          wrongChoice(raw`\(\,1-\sqrt{5}\)`, raw`The surd disappears after multiplying by the conjugates.`),
          wrongChoice(raw`\(\,\sqrt{5}-1\)`, raw`A conjugate pair multiplies to a real number here.`)
        ]),
        {
          type: "typed",
          title: "Write the final exact form",
          text: raw`What is the fully simplified answer in the form \(ak+bk\sqrt{5}\)?`,
          ariaLabel: "Type the simplified surd expression",
          acceptedAnswers: ["-3k+3ksqrt(5)", "3k(sqrt(5)-1)"],
          samples: [{ k: 1 }, { k: 2 }, { k: -3 }],
          successMessage: raw`Perfect. That is the simplified expression in the required form.`,
          targetedFeedback: [
            {
              answers: ["3k-3ksqrt(5)"],
              message: raw`Check the sign change after dividing by \(-4\). Both terms are being divided by a negative number.`
            }
          ],
          genericMessage: raw`You should finish with one plain \(k\) term and one \(k\sqrt{5}\) term.`
        }
      ]
    }),
    "1b": createConfig("1b", "2022 Paper — Division in polar form", {
      focus: raw`dividing the moduli, subtracting the arguments, and writing the result cleanly in polar form.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{If }u=m^5\operatorname{cis}\left(\frac{\pi}{3}\right)\text{ and }v=m^2\operatorname{cis}\left(\frac{\pi}{5}\right),\text{ write }\frac{u}{v}\text{ in polar form.}
          \]
        </div>
      `,
      hints: [
        raw`When you divide complex numbers in polar form, divide the moduli and subtract the arguments.`,
        raw`The new modulus is \(m^{5-2}\).`,
        raw`For the argument, simplify \(\frac{\pi}{3}-\frac{\pi}{5}\).`
      ],
      answerHtml: raw`
        <p class="step-text">Divide the moduli and subtract the arguments:</p>
        <div class="math-block">
          \[
          \frac{u}{v}
          =m^{5-2}\operatorname{cis}\left(\frac{\pi}{3}-\frac{\pi}{5}\right)
          \]
          \[
          =m^3\operatorname{cis}\left(\frac{5\pi-3\pi}{15}\right)
          =m^3\operatorname{cis}\left(\frac{2\pi}{15}\right)
          \]
        </div>
        ${answerBox(raw`
          \[
          \frac{u}{v}=m^3\operatorname{cis}\left(\frac{2\pi}{15}\right)
          \]
        `)}
      `,
      steps: [
        choiceStep("Divide the moduli", raw`What happens to the modulus when we divide \(u\) by \(v\)?`, [
          correctChoice(raw`\(\,m^{5-2}=m^3\)`, raw`Right. Moduli divide, so the powers subtract.`),
          wrongChoice(raw`\(\,m^{5+2}=m^7\)`, raw`That would happen if we were multiplying, not dividing.`),
          wrongChoice(raw`\(\,m^{10}\)`, raw`There is no need to square or multiply the powers here.`),
          wrongChoice(raw`\(\,m\)`, raw`The exponents subtract: \(5-2=3\).`)
        ]),
        choiceStep("Subtract the arguments", raw`What happens to the arguments when we divide in polar form?`, [
          correctChoice(raw`\(\,\frac{\pi}{3}-\frac{\pi}{5}\)`, raw`Exactly. We subtract the second argument from the first.`),
          wrongChoice(raw`\(\,\frac{\pi}{3}+\frac{\pi}{5}\)`, raw`That would be the rule for multiplication, not division.`),
          wrongChoice(raw`\(\,\frac{\pi}{3}\times\frac{\pi}{5}\)`, raw`Arguments are added or subtracted in polar form, not multiplied.`),
          wrongChoice(raw`\(\,\frac{\pi}{5}-\frac{\pi}{3}\)`, raw`The order matters: it is the first argument minus the second.`)
        ]),
        choiceStep("Write the final polar form", raw`What is the simplified answer?`, [
          correctChoice(raw`\(\,m^3\operatorname{cis}\left(\frac{2\pi}{15}\right)\)`, raw`Yes. The modulus is \(m^3\) and the argument is \(\frac{2\pi}{15}\).`),
          wrongChoice(raw`\(\,m^3\operatorname{cis}\left(\frac{8\pi}{15}\right)\)`, raw`That comes from adding the arguments instead of subtracting them.`),
          wrongChoice(raw`\(\,m^7\operatorname{cis}\left(\frac{2\pi}{15}\right)\)`, raw`The argument is fine there, but the modulus should be \(m^3\).`),
          wrongChoice(raw`\(\,m^3\operatorname{cis}\left(-\frac{2\pi}{15}\right)\)`, raw`The larger angle is \(\frac{\pi}{3}\), so the subtraction stays positive.`)
        ])
      ]
    }),
    "1c": createConfig("1c", "2022 Paper — Argument condition after expansion", {
      focus: raw`expanding the product carefully and using \(\arg(uvw)=\frac{\pi}{4}\) to match the real and imaginary parts.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{If }u=3+2i,\ v=4+2i,\text{ and }w=2+ki,\text{ find the value of }k\text{ if }\arg(uvw)=\frac{\pi}{4}.
          \]
        </div>
      `,
      questionNotes: [
        raw`An argument of \(\frac{\pi}{4}\) means the complex number lies in the first quadrant on the line \(y=x\).`
      ],
      hints: [
        raw`Multiply \(u\) and \(v\) first so you do not lose track of the terms.`,
        raw`Then multiply that result by \(w\).`,
        raw`At angle \(\frac{\pi}{4}\), the real and imaginary parts are equal and positive.`
      ],
      answerHtml: raw`
        <p class="step-text">Start by combining \(u\) and \(v\):</p>
        <div class="math-block">
          \[
          uv=(3+2i)(4+2i)=12+6i+8i+4i^2=8+14i
          \]
        </div>
        <p class="step-text">Now multiply by \(w\):</p>
        <div class="math-block">
          \[
          uvw=(8+14i)(2+ki)
          \]
          \[
          =16+8ki+28i+14ki^2
          =16-14k+(28+8k)i
          \]
        </div>
        <p class="step-text">Because \(\arg(uvw)=\frac{\pi}{4}\), the real and imaginary parts must be equal:</p>
        <div class="math-block">
          \[
          16-14k=28+8k
          \]
          \[
          -22k=12
          \]
          \[
          k=-\frac{6}{11}
          \]
        </div>
        ${answerBox(raw`
          \[
          k=-\frac{6}{11}
          \]
        `)}
        ${tipBox(raw`For special arguments like \(\frac{\pi}{4}\), look for a geometry shortcut before you reach for trigonometry.`)}
      `,
      steps: [
        choiceStep("Multiply \(u\) and \(v\)", raw`What is \(uv\)?`, [
          correctChoice(raw`\(\,8+14i\)`, raw`Correct. The \(i^2\) term changes the real part from \(12\) down to \(8\).`),
          wrongChoice(raw`\(\,12+14i\)`, raw`You need to include the \(4i^2=-4\) term in the real part.`),
          wrongChoice(raw`\(\,8+10i\)`, raw`The imaginary terms are \(6i\) and \(8i\), which add to \(14i\).`),
          wrongChoice(raw`\(\,4+14i\)`, raw`The real part should be \(12-4=8\).`)
        ]),
        choiceStep("Multiply by \(w\)", raw`After multiplying by \(w=2+ki\), what is \(uvw\)?`, [
          correctChoice(raw`\(\,16-14k+(28+8k)i\)`, raw`Exactly. The \(14ki^2\) term becomes \(-14k\) in the real part.`),
          wrongChoice(raw`\(\,16+14k+(28+8k)i\)`, raw`Remember that \(i^2=-1\), so the \(14ki^2\) term is negative.`),
          wrongChoice(raw`\(\,16-14k+(28-8k)i\)`, raw`The \(8ki\) term stays positive in the imaginary part.`),
          wrongChoice(raw`\(\,24-14k+(14+8k)i\)`, raw`Both the real and imaginary combinations need a careful expansion.`)
        ]),
        choiceStep("Use the argument condition", raw`What condition does \(\arg(uvw)=\frac{\pi}{4}\) give us here?`, [
          correctChoice(raw`The real and imaginary parts are equal and positive.`, raw`Yes. A complex number with argument \(\frac{\pi}{4}\) lies on the line \(y=x\) in the first quadrant.`),
          wrongChoice(raw`The real part is zero.`, raw`That would put the number on the imaginary axis, not on the line at \(\frac{\pi}{4}\).`),
          wrongChoice(raw`The imaginary part is the negative of the real part.`, raw`That would correspond to an angle of \(-\frac{\pi}{4}\).`),
          wrongChoice(raw`The modulus must be \(1\).`, raw`Argument tells us the direction, not the size.`)
        ]),
        choiceStep("Solve for \(k\)", raw`What value of \(k\) satisfies the condition?`, [
          correctChoice(raw`\(\,-\frac{6}{11}\)`, raw`Correct. Equating the parts gives \(16-14k=28+8k\), so \(k=-\frac{6}{11}\).`),
          wrongChoice(raw`\(\,\frac{6}{11}\)`, raw`Check the sign after you move the \(k\)-terms to one side.`),
          wrongChoice(raw`\(\,-\frac{3}{11}\)`, raw`The coefficient of \(k\) is \(-22\), not \(-44\).`),
          wrongChoice(raw`\(\,\frac{11}{6}\)`, raw`That inverts the fraction at the final step.`)
        ])
      ]
    }),
    "1d": createConfig("1d", "2022 Paper — One real solution via the discriminant", {
      focus: raw`isolating the surd, squaring carefully, and using the discriminant to force exactly one real solution.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find the value(s) of }p\text{ for which the equation }x-2\sqrt{x+p}=-5\text{ has only one real solution.}
          \]
        </div>
      `,
      hints: [
        raw`Move the surd to one side first so you can square cleanly.`,
        raw`After squaring, collect the terms into a quadratic in \(x\).`,
        raw`For a quadratic to have one real solution, its discriminant must be \(0\).`
      ],
      answerHtml: raw`
        <p class="step-text">Isolate the surd first:</p>
        <div class="math-block">
          \[
          x+5=2\sqrt{x+p}
          \]
        </div>
        <p class="step-text">Now square both sides:</p>
        <div class="math-block">
          \[
          (x+5)^2=4(x+p)
          \]
          \[
          x^2+10x+25=4x+4p
          \]
          \[
          x^2+6x+(25-4p)=0
          \]
        </div>
        <p class="step-text">For exactly one real solution, the discriminant is \(0\):</p>
        <div class="math-block">
          \[
          b^2-4ac=0
          \]
          \[
          36-4(1)(25-4p)=0
          \]
          \[
          36-100+16p=0
          \]
          \[
          16p=64
          \]
          \[
          p=4
          \]
        </div>
        <p class="step-text">That gives the repeated root \(x=-3\), which does satisfy the original equation.</p>
        ${answerBox(raw`
          \[
          p=4
          \]
        `)}
      `,
      steps: [
        choiceStep("Isolate the surd", raw`What is the best first rearrangement?`, [
          correctChoice(raw`\(\,x+5=2\sqrt{x+p}\)`, raw`Exactly. Put the surd on one side before you square.`),
          wrongChoice(raw`\(\,x-5=2\sqrt{x+p}\)`, raw`Adding \(5\) to both sides gives \(x+5\), not \(x-5\).`),
          wrongChoice(raw`\(\,x+p=\left(\frac{x+5}{2}\right)^2\)`, raw`That comes later, after the clean isolation step.`),
          wrongChoice(raw`\(\,\sqrt{x+p}=x+5\)`, raw`The factor \(2\) should still be on the right-hand side.`)
        ]),
        choiceStep("Square carefully", raw`After squaring and collecting terms, what quadratic do we get?`, [
          correctChoice(raw`\(\,x^2+6x+(25-4p)=0\)`, raw`Correct. Squaring gives \((x+5)^2=4(x+p)\), then everything moves to one side.`),
          wrongChoice(raw`\(\,x^2+10x+(25-4p)=0\)`, raw`You still need to subtract the \(4x\) from the right-hand side.`),
          wrongChoice(raw`\(\,x^2+6x+(25+4p)=0\)`, raw`The \(4p\) term comes across as \(-4p\).`),
          wrongChoice(raw`\(\,x^2+4x+(25-4p)=0\)`, raw`The \(10x-4x\) simplifies to \(6x\), not \(4x\).`)
        ]),
        {
          type: "typed",
          title: "Set the discriminant to zero",
          text: raw`What equation in \(p\) do you get from \(b^2-4ac=0\)?`,
          ariaLabel: "Type the discriminant equation",
          mode: "equation",
          acceptedAnswers: ["36-4(25-4p)=0", "36-4*1*(25-4p)=0", "16p-64=0"],
          samples: [{ p: 0 }, { p: 1 }, { p: 4 }],
          successMessage: raw`Yes. That is the discriminant condition that forces one repeated real root.`,
          genericMessage: raw`Use \(a=1\), \(b=6\), and \(c=25-4p\), then set \(b^2-4ac\) equal to \(0\).`
        },
        choiceStep("Find \(p\)", raw`What value of \(p\) gives exactly one real solution?`, [
          correctChoice(raw`\(\,4\)`, raw`Correct. Solving the discriminant equation gives \(p=4\).`),
          wrongChoice(raw`\(\,-4\)`, raw`The sign changes the other way when you solve \(16p=64\).`),
          wrongChoice(raw`\(\,\frac{1}{4}\)`, raw`That would happen if you divided the wrong way around.`),
          wrongChoice(raw`\(\,16\)`, raw`You still need to divide \(64\) by \(16\).`)
        ])
      ]
    }),
    "1e": createConfig("1e", "2022 Paper — Moduli and real parts proof", {
      focus: raw`rewriting the complex numbers in \(a+bi\) form and simplifying both modulus-squared expressions side by side.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{For complex numbers }w\text{ and }z,\text{ prove that}
          \]
          \[
          |w+z|^2-|w-\overline{z}|^2=4\operatorname{Re}(w)\operatorname{Re}(z),
          \]
        </div>
        <p class="step-text">where \(\operatorname{Re}(w)\) is the real part of \(w\), and \(\operatorname{Re}(z)\) is the real part of \(z\).</p>
      `,
      hints: [
        raw`Let \(w=a+bi\) and \(z=c+di\).`,
        raw`Find \(|w+z|^2\) and \(|w-\overline{z}|^2\) separately.`,
        raw`Most of the terms cancel when you subtract the two results.`
      ],
      answerHtml: raw`
        <p class="step-text">Write each complex number in standard form:</p>
        <div class="math-block">
          \[
          w=a+bi,\qquad z=c+di,\qquad \overline{z}=c-di
          \]
        </div>
        <p class="step-text">Now simplify each modulus-squared expression:</p>
        <div class="math-block">
          \[
          w+z=(a+c)+(b+d)i
          \]
          \[
          |w+z|^2=(a+c)^2+(b+d)^2
          \]
          \[
          w-\overline{z}=(a-c)+(b+d)i
          \]
          \[
          |w-\overline{z}|^2=(a-c)^2+(b+d)^2
          \]
        </div>
        <p class="step-text">Subtract the second expression from the first:</p>
        <div class="math-block">
          \[
          |w+z|^2-|w-\overline{z}|^2
          =(a+c)^2-(a-c)^2
          \]
          \[
          =4ac
          \]
        </div>
        <p class="step-text">Since \(\operatorname{Re}(w)=a\) and \(\operatorname{Re}(z)=c\), we get</p>
        <div class="math-block">
          \[
          |w+z|^2-|w-\overline{z}|^2=4\operatorname{Re}(w)\operatorname{Re}(z).
          \]
        </div>
        ${answerBox(raw`
          \[
          |w+z|^2-|w-\overline{z}|^2=4\operatorname{Re}(w)\operatorname{Re}(z)
          \]
        `)}
      `,
      steps: [
        choiceStep("Set up the proof", raw`Which substitutions match the standard \(a+bi\) form?`, [
          correctChoice(raw`\(\,w=a+bi,\ z=c+di\)`, raw`Good. That makes the real parts easy to read as \(a\) and \(c\).`),
          wrongChoice(raw`\(\,w=a+b,\ z=c+d\)`, raw`We need the imaginary unit \(i\) in both complex numbers.`),
          wrongChoice(raw`\(\,w=ai+b,\ z=ci+d\)`, raw`That swaps the real and imaginary parts around.`),
          wrongChoice(raw`\(\,w=r\operatorname{cis}\theta,\ z=s\operatorname{cis}\phi\)`, raw`Polar form is possible, but standard form is much cleaner for this proof.`)
        ]),
        choiceStep("Handle the conjugate", raw`If \(z=c+di\), what is \(w-\overline{z}\)?`, [
          correctChoice(raw`\(\,(a-c)+(b+d)i\)`, raw`Exactly. Subtracting \(c-di\) flips the sign of the real part and adds the imaginary parts.`),
          wrongChoice(raw`\(\,(a-c)+(b-d)i\)`, raw`Subtracting \(\overline{z}=c-di\) turns the imaginary part into \(b+d\), not \(b-d\).`),
          wrongChoice(raw`\(\,(a+c)+(b-d)i\)`, raw`Both signs are off there.`),
          wrongChoice(raw`\(\,(a+c)+(b+d)i\)`, raw`That would be \(w+z\), not \(w-\overline{z}\).`)
        ]),
        choiceStep("Square the first modulus", raw`What is \(|w+z|^2\)?`, [
          correctChoice(raw`\(\,(a+c)^2+(b+d)^2\)`, raw`Right. The modulus squared is the sum of the squares of the real and imaginary parts.`),
          wrongChoice(raw`\(\,(a+c)^2-(b+d)^2\)`, raw`Modulus squared adds the squares; it does not subtract them.`),
          wrongChoice(raw`\(\,(a-c)^2+(b+d)^2\)`, raw`That corresponds to \(w-\overline{z}\), not \(w+z\).`),
          wrongChoice(raw`\(\,a^2+b^2+c^2+d^2\)`, raw`You lose the cross terms if you jump straight to that.`)
        ]),
        choiceStep("Square the second modulus", raw`What is \(|w-\overline{z}|^2\)?`, [
          correctChoice(raw`\(\,(a-c)^2+(b+d)^2\)`, raw`Yes. The real part is \(a-c\) and the imaginary part is \(b+d\).`),
          wrongChoice(raw`\(\,(a-c)^2+(b-d)^2\)`, raw`The imaginary part is still \(b+d\) because of the conjugate.`),
          wrongChoice(raw`\(\,(a+c)^2+(b+d)^2\)`, raw`That is the first modulus squared, not the second.`),
          wrongChoice(raw`\(\,(a-c)^2-(b+d)^2\)`, raw`Again, modulus squared adds the two squares.`)
        ]),
        choiceStep("Finish the proof", raw`What does the difference simplify to?`, [
          correctChoice(raw`\(\,4ac=4\operatorname{Re}(w)\operatorname{Re}(z)\)`, raw`Correct. The \((b+d)^2\) terms cancel, and the remaining difference of squares becomes \(4ac\).`),
          wrongChoice(raw`\(\,4bd=4\operatorname{Im}(w)\operatorname{Im}(z)\)`, raw`The imaginary terms cancel completely in this proof.`),
          wrongChoice(raw`\(\,0\)`, raw`Only the \((b+d)^2\) terms cancel. The real-part terms do not.`),
          wrongChoice(raw`\(\,2ac\)`, raw`The difference \((a+c)^2-(a-c)^2\) gives \(4ac\), not \(2ac\).`)
        ])
      ]
    }),
    "2a": createConfig("2a", "2022 Paper — Remainder theorem", {
      focus: raw`recognising the remainder theorem and substituting the value that makes the divisor zero.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Dividing }x^3-3x^2+bx+9\text{ by }(x+2)\text{ gives a remainder of }3.
          \]
          \[
          \text{Find the value of }b.
          \]
        </div>
      `,
      hints: [
        raw`If the divisor is \(x+2\), then the special input is \(x=-2\).`,
        raw`The remainder theorem tells us \(f(-2)=3\).`,
        raw`Substitute carefully into every term before solving for \(b\).`
      ],
      answerHtml: raw`
        <p class="step-text">Use the remainder theorem:</p>
        <div class="math-block">
          \[
          f(-2)=3
          \]
          \[
          (-2)^3-3(-2)^2+b(-2)+9=3
          \]
          \[
          -8-12-2b+9=3
          \]
          \[
          -11-2b=3
          \]
          \[
          -2b=14
          \]
          \[
          b=-7
          \]
        </div>
        ${answerBox(raw`
          \[
          b=-7
          \]
        `)}
      `,
      steps: [
        choiceStep("Recognise the theorem", raw`What is the quickest method to use here?`, [
          correctChoice(raw`The remainder theorem.`, raw`Exactly. A remainder with a linear divisor is a direct remainder-theorem question.`),
          wrongChoice(raw`Long division only.`, raw`You could do that, but the remainder theorem is much faster here.`),
          wrongChoice(raw`De Moivre's Theorem.`, raw`This is a polynomial question, not a polar-form complex-number question.`),
          wrongChoice(raw`Completing the square.`, raw`There is no quadratic expression to complete here.`)
        ]),
        choiceStep("Substitute the root of the divisor", raw`Which equation matches \(f(-2)=3\)?`, [
          correctChoice(raw`\(\,(-2)^3-3(-2)^2+b(-2)+9=3\)`, raw`Yes. The divisor \(x+2\) means we substitute \(x=-2\).`),
          wrongChoice(raw`\(\,(2)^3-3(2)^2+b(2)+9=3\)`, raw`Watch the sign: \(x+2=0\) gives \(x=-2\).`),
          wrongChoice(raw`\(\,(-2)^3-3(-2)^2+b+9=3\)`, raw`The \(bx\) term still needs the factor of \(-2\).`),
          wrongChoice(raw`\(\,(-2)^3-3(-2)^2+b(-2)+9=0\)`, raw`The remainder is \(3\), so the expression must equal \(3\), not \(0\).`)
        ]),
        choiceStep("Solve for \(b\)", raw`What is the value of \(b\)?`, [
          correctChoice(raw`\(\,-7\)`, raw`Correct. Simplifying the substitution gives \(-11-2b=3\), so \(b=-7\).`),
          wrongChoice(raw`\(\,7\)`, raw`The final sign is negative because \(-2b=14\).`),
          wrongChoice(raw`\(\,-14\)`, raw`You still need to divide by \(-2\).`),
          wrongChoice(raw`\(\,\frac{7}{2}\)`, raw`The coefficient of \(b\) is \(-2\), not \(4\).`)
        ])
      ]
    }),
    "2b": createConfig("2b", "2022 Paper — Solving with a conjugate", {
      focus: raw`writing \(z\) and \(\overline{z}\) in terms of \(a\) and \(b\), then equating real and imaginary parts.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find the complex number }z\text{ for which }z+4\overline{z}=15+12i.
          \]
        </div>
      `,
      hints: [
        raw`Let \(z=a+bi\), so \(\overline{z}=a-bi\).`,
        raw`Substitute both into the equation and collect the real and imaginary parts.`,
        raw`The right-hand side already tells you what the real and imaginary parts must be.`
      ],
      answerHtml: raw`
        <p class="step-text">Let \(z=a+bi\). Then \(\overline{z}=a-bi\).</p>
        <div class="math-block">
          \[
          z+4\overline{z}
          =a+bi+4(a-bi)
          \]
          \[
          =a+bi+4a-4bi
          =5a-3bi
          \]
        </div>
        <p class="step-text">Now match the real and imaginary parts with \(15+12i\):</p>
        <div class="math-block">
          \[
          5a=15\Rightarrow a=3
          \]
          \[
          -3b=12\Rightarrow b=-4
          \]
        </div>
        <div class="math-block">
          \[
          z=3-4i
          \]
        </div>
        ${answerBox(raw`
          \[
          z=3-4i
          \]
        `)}
      `,
      steps: [
        choiceStep("Write the conjugate", raw`If \(z=a+bi\), what is \(\overline{z}\)?`, [
          correctChoice(raw`\(\,a-bi\)`, raw`Correct. The conjugate keeps the real part and flips the sign of the imaginary part.`),
          wrongChoice(raw`\(\,-a+bi\)`, raw`The real part stays the same under conjugation.`),
          wrongChoice(raw`\(\,-a-bi\)`, raw`Only the imaginary part changes sign.`),
          wrongChoice(raw`\(\,a+bi\)`, raw`That would only be true if \(b=0\), but we cannot assume that.`)
        ]),
        choiceStep("Substitute into the equation", raw`What does \(z+4\overline{z}\) simplify to?`, [
          correctChoice(raw`\(\,5a-3bi\)`, raw`Exactly. Combine the real terms and then combine the imaginary terms.`),
          wrongChoice(raw`\(\,5a+5bi\)`, raw`The conjugate contributes \(-4bi\), not \(+4bi\).`),
          wrongChoice(raw`\(\,3a-5bi\)`, raw`The real terms add to \(5a\), not \(3a\).`),
          wrongChoice(raw`\(\,a-3bi\)`, raw`Do not forget the extra \(4a\) from \(4\overline{z}\).`)
        ]),
        choiceStep("Match the parts", raw`What equations come from equating real and imaginary parts?`, [
          correctChoice(raw`\(\,5a=15\text{ and }-3b=12\)`, raw`Yes. The real parts match the real parts, and the imaginary parts match the imaginary parts.`),
          wrongChoice(raw`\(\,5a=12\text{ and }-3b=15\)`, raw`Do not swap the real and imaginary parts of \(15+12i\).`),
          wrongChoice(raw`\(\,a=15\text{ and }b=12\)`, raw`You still need to account for the coefficients \(5\) and \(-3\).`),
          wrongChoice(raw`\(\,5a=-15\text{ and }-3b=-12\)`, raw`The right-hand side is \(15+12i\), so both parts are positive there.`)
        ]),
        choiceStep("Write \(z\)", raw`What is the complex number \(z\)?`, [
          correctChoice(raw`\(\,3-4i\)`, raw`Correct. That is the value of \(a+bi\).`),
          wrongChoice(raw`\(\,3+4i\)`, raw`The imaginary part is negative because \(b=-4\).`),
          wrongChoice(raw`\(\,-3-4i\)`, raw`The real part is \(3\), not \(-3\).`),
          wrongChoice(raw`\(\,-3+4i\)`, raw`Both signs are reversed there.`)
        ])
      ]
    }),
    "2c": createConfig("2c", "2022 Paper — Cubic factorisation with a known root", {
      focus: raw`using the known factor \(z+4\), setting the remainder to zero, and solving the reduced quadratic.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{One of the solutions of }z^3-2z^2+hz+180=0\text{ is }z=-4.\ (h\text{ is a real number}.)
          \]
        </div>
        <p class="step-text">Find the other solutions, in the form \(a\pm bi\), and the value of \(h\).</p>
      `,
      hints: [
        raw`A root of \(-4\) means \(z+4\) is a factor.`,
        raw`Write the cubic as \((z+4)(\text{quadratic})+\text{remainder}\).`,
        raw`The remainder must be \(0\), then the remaining quadratic gives the other two roots.`
      ],
      answerHtml: raw`
        <p class="step-text">Since \(z=-4\) is a root, \(z+4\) is a factor. Divide by \(z+4\):</p>
        <div class="math-block">
          \[
          z^3-2z^2+hz+180=(z+4)(z^2-6z+h+24)+(84-4h)
          \]
        </div>
        <p class="step-text">Because \(-4\) is a root, the remainder must be \(0\):</p>
        <div class="math-block">
          \[
          84-4h=0
          \]
          \[
          h=21
          \]
        </div>
        <p class="step-text">So the remaining quadratic is</p>
        <div class="math-block">
          \[
          z^2-6z+45=0
          \]
          \[
          z^2-6z=-45
          \]
          \[
          (z-3)^2=-36
          \]
          \[
          z=3\pm 6i
          \]
        </div>
        ${answerBox(raw`
          \[
          h=21
          \]
          \[
          z=3\pm 6i
          \]
        `)}
      `,
      steps: [
        choiceStep("Identify the factor", raw`If \(z=-4\) is a root, which factor must the cubic have?`, [
          correctChoice(raw`\(\,z+4\)`, raw`Exactly. A root of \(-4\) corresponds to the factor \(z+4\).`),
          wrongChoice(raw`\(\,z-4\)`, raw`That factor would correspond to a root of \(4\), not \(-4\).`),
          wrongChoice(raw`\(\,z^2+4\)`, raw`A single real root gives a linear factor here.`),
          wrongChoice(raw`\(\,4z+1\)`, raw`The standard factor attached to the root \(-4\) is \(z+4\).`)
        ]),
        choiceStep("Use the remainder", raw`When dividing by \(z+4\), what remainder expression must be zero?`, [
          correctChoice(raw`\(\,84-4h\)`, raw`Yes. Setting that remainder equal to \(0\) is how we find \(h\).`),
          wrongChoice(raw`\(\,84+4h\)`, raw`The sign on the \(h\)-term should be negative.`),
          wrongChoice(raw`\(\,180-4h\)`, raw`That misses the contribution from the other terms in the division.`),
          wrongChoice(raw`\(\,24-h\)`, raw`That is only part of the quadratic coefficient, not the full remainder.`)
        ]),
        choiceStep("Find \(h\)", raw`What value of \(h\) makes the remainder zero?`, [
          correctChoice(raw`\(\,21\)`, raw`Correct. Solving \(84-4h=0\) gives \(h=21\).`),
          wrongChoice(raw`\(\,-21\)`, raw`The remainder equation gives a positive value for \(h\).`),
          wrongChoice(raw`\(\,84\)`, raw`You still need to divide by \(4\).`),
          wrongChoice(raw`\(\,\frac{21}{4}\)`, raw`That would happen if the coefficient of \(h\) were \(16\), but it is \(4\).`)
        ]),
        choiceStep("Write the reduced quadratic", raw`After substituting \(h=21\), what quadratic remains?`, [
          correctChoice(raw`\(\,z^2-6z+45=0\)`, raw`Right. The constant term in the quotient becomes \(h+24=45\).`),
          wrongChoice(raw`\(\,z^2+6z+45=0\)`, raw`The middle term stays negative after the division.`),
          wrongChoice(raw`\(\,z^2-6z+21=0\)`, raw`Do not forget the extra \(24\) in the quotient.`),
          wrongChoice(raw`\(\,z^2-3z+45=0\)`, raw`The coefficient of \(z\) is \(-6\), not \(-3\).`)
        ]),
        choiceStep("Find the other roots", raw`What are the other two solutions?`, [
          correctChoice(raw`\(\,3+6i,\ 3-6i\)`, raw`Exactly. Completing the square gives \((z-3)^2=-36\), so \(z=3\pm 6i\).`),
          wrongChoice(raw`\(\,-3+6i,\ -3-6i\)`, raw`The centre from the quadratic is \(z=3\), not \(-3\).`),
          wrongChoice(raw`\(\,6+3i,\ 6-3i\)`, raw`That swaps the real and imaginary parts.`),
          wrongChoice(raw`\(\,3+3i,\ 3-3i\)`, raw`The square root of \(36\) is \(6\), not \(3\).`)
        ])
      ]
    }),
    "2d": createConfig("2d", "2022 Paper — Argument from \(a+bi\) form", {
      focus: raw`rationalising the denominator, rewriting \(w\) in standard form, and then choosing the correct quadrant for the argument.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{If }z=1-\sqrt{3}i\text{ and }w=\frac{4}{z}-2,\text{ find }\arg(w).
          \]
        </div>
      `,
      questionNotes: [
        raw`Give the principal argument of \(w\).`
      ],
      hints: [
        raw`Start by writing \(\frac{4}{z}\) in \(a+bi\) form using the conjugate of \(z\).`,
        raw`Once you have \(w=-1+\sqrt{3}i\), think about where that point lies on the Argand diagram.`,
        raw`The reference angle is \(\frac{\pi}{3}\), but the quadrant decides the actual argument.`
      ],
      answerHtml: raw`
        <p class="step-text">First rewrite \(w\) in standard form:</p>
        <div class="math-block">
          \[
          w=\frac{4}{1-\sqrt{3}i}-2
          =\frac{4(1+\sqrt{3}i)}{(1-\sqrt{3}i)(1+\sqrt{3}i)}-2
          \]
          \[
          =\frac{4+4\sqrt{3}i}{1+3}-2
          =1+\sqrt{3}i-2
          =-1+\sqrt{3}i
          \]
        </div>
        <p class="step-text">Now use the point \((-1,\sqrt{3})\): it lies in the second quadrant, with reference angle \(\frac{\pi}{3}\).</p>
        <div class="math-block">
          \[
          \arg(w)=\pi-\frac{\pi}{3}=\frac{2\pi}{3}
          \]
        </div>
        ${answerBox(raw`
          \[
          \arg(w)=\frac{2\pi}{3}
          \]
        `)}
        ${mistakeBox(raw`Using \(\tan^{-1}\left(\frac{\operatorname{Im}}{\operatorname{Re}}\right)\) only gives the reference angle here. Because the real part is negative and the imaginary part is positive, the point is in quadrant II, not quadrant IV.`)}
      `,
      steps: [
        choiceStep("Choose the conjugate", raw`Which conjugate should we use to rewrite \(\frac{4}{z}\)?`, [
          correctChoice(raw`\(\,1+\sqrt{3}i\)`, raw`Correct. The conjugate of \(1-\sqrt{3}i\) is \(1+\sqrt{3}i\).`),
          wrongChoice(raw`\(\,1-\sqrt{3}i\)`, raw`That is the original denominator, not its conjugate.`),
          wrongChoice(raw`\(\,-1+\sqrt{3}i\)`, raw`The real part should stay the same when you take the conjugate.`),
          wrongChoice(raw`\(\,-1-\sqrt{3}i\)`, raw`Both signs should not flip.`)
        ]),
        choiceStep("Rewrite \(w\) in \(a+bi\) form", raw`What is \(w\) after rationalising and simplifying?`, [
          correctChoice(raw`\(\,-1+\sqrt{3}i\)`, raw`Yes. \(\frac{4}{1-\sqrt{3}i}=1+\sqrt{3}i\), then subtracting \(2\) gives \(-1+\sqrt{3}i\).`),
          wrongChoice(raw`\(\,1+\sqrt{3}i\)`, raw`Do not forget the final \(-2\).`),
          wrongChoice(raw`\(\,-1-\sqrt{3}i\)`, raw`The imaginary part stays positive after the simplification.`),
          wrongChoice(raw`\(\,1-\sqrt{3}i\)`, raw`That is \(z\), not \(w\).`)
        ]),
        choiceStep("Choose the quadrant", raw`In which quadrant does \(w=-1+\sqrt{3}i\) lie?`, [
          correctChoice(raw`Quadrant II.`, raw`Exactly. The real part is negative and the imaginary part is positive.`),
          wrongChoice(raw`Quadrant I.`, raw`Quadrant I would need both the real and imaginary parts to be positive.`),
          wrongChoice(raw`Quadrant III.`, raw`Quadrant III would need both parts to be negative.`),
          wrongChoice(raw`Quadrant IV.`, raw`Quadrant IV would need a positive real part and a negative imaginary part.`)
        ]),
        choiceStep("Find the principal argument", raw`What is \(\arg(w)\)?`, [
          correctChoice(raw`\(\,\frac{2\pi}{3}\)`, raw`Correct. The reference angle is \(\frac{\pi}{3}\), but quadrant II makes the principal argument \(\frac{2\pi}{3}\).`),
          wrongChoice(raw`\(\,-\frac{\pi}{3}\)`, raw`That is the reference-angle output from \(\tan^{-1}\), but it points into quadrant IV, not where \(w\) actually lies.`),
          wrongChoice(raw`\(\,\frac{\pi}{3}\)`, raw`That angle lies in quadrant I, but \(w\) is in quadrant II.`),
          wrongChoice(raw`\(\,\frac{5\pi}{3}\)`, raw`That is coterminal with \(-\frac{\pi}{3}\), so it still points into quadrant IV.`)
        ])
      ]
    }),
    "2e": createConfig("2e", "2022 Paper — Locus to Cartesian circle form", {
      focus: raw`writing \(z=x+yi\), converting each modulus into a distance, and then completing the square to reveal the circle.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find the Cartesian equation of the locus described by }|z+i|=2|z-5i|
          \]
        </div>
        <p class="step-text">in the form \((x-a)^2+(y-b)^2=k^2\).</p>
      `,
      hints: [
        raw`Write \(z=x+yi\), then tidy the imaginary parts inside the modulus signs.`,
        raw`Turn each modulus into a square root using the distance formula.`,
        raw`Square once, collect the terms, and then complete the square in \(y\).`
      ],
      answerHtml: raw`
        <p class="step-text">Let \(z=x+yi\). Then:</p>
        <div class="math-block">
          \[
          |x+yi+i|=2|x+yi-5i|
          \]
          \[
          |x+(y+1)i|=2|x+(y-5)i|
          \]
          \[
          \sqrt{x^2+(y+1)^2}=2\sqrt{x^2+(y-5)^2}
          \]
        </div>
        <p class="step-text">Square both sides and simplify:</p>
        <div class="math-block">
          \[
          x^2+(y+1)^2=4\left(x^2+(y-5)^2\right)
          \]
          \[
          x^2+y^2+2y+1=4x^2+4y^2-40y+100
          \]
          \[
          3x^2+3y^2-42y+99=0
          \]
          \[
          x^2+y^2-14y+33=0
          \]
        </div>
        <p class="step-text">Now complete the square in \(y\):</p>
        <div class="math-block">
          \[
          x^2+y^2-14y=-33
          \]
          \[
          x^2+(y-7)^2=16
          \]
        </div>
        ${answerBox(raw`
          \[
          x^2+(y-7)^2=16
          \]
        `)}
      `,
      steps: [
        choiceStep("Write \(z\) in Cartesian form", raw`How should we start the locus question?`, [
          correctChoice(raw`\(\,z=x+yi\)`, raw`Exactly. Cartesian form is the natural start for a Cartesian locus.`),
          wrongChoice(raw`\(\,z=r\operatorname{cis}\theta\)`, raw`Polar form is less helpful when the answer needs to be in \(x\) and \(y\).`),
          wrongChoice(raw`\(\,z=x+y\)`, raw`A complex number in standard form needs the imaginary unit \(i\).`),
          wrongChoice(raw`\(\,z=yi+x\)`, raw`Keep the real part and imaginary part in the usual order.`)
        ]),
        choiceStep("Turn the moduli into distances", raw`What square-root equation does the locus become?`, [
          correctChoice(raw`\(\,\sqrt{x^2+(y+1)^2}=2\sqrt{x^2+(y-5)^2}\)`, raw`Yes. That is the correct distance form after writing \(z=x+yi\).`),
          wrongChoice(raw`\(\,\sqrt{x^2+(y-1)^2}=2\sqrt{x^2+(y+5)^2}\)`, raw`The shifts go the other way: \(+i\) makes \(y+1\), and \(-5i\) makes \(y-5\).`),
          wrongChoice(raw`\(\,x^2+(y+1)^2=2(x^2+(y-5)^2)\)`, raw`You still need square roots because modulus represents distance.`),
          wrongChoice(raw`\(\,\sqrt{x+(y+1)^2}=2\sqrt{x+(y-5)^2}\)`, raw`The real-part contribution is \(x^2\), not \(x\).`)
        ]),
        choiceStep("Square both sides", raw`What equation do we get after squaring the square-root form?`, [
          correctChoice(raw`\(\,x^2+(y+1)^2=4\left(x^2+(y-5)^2\right)\)`, raw`Correct. Squaring the factor \(2\) gives \(4\) on the right-hand side.`),
          wrongChoice(raw`\(\,x^2+(y+1)^2=2\left(x^2+(y-5)^2\right)\)`, raw`The \(2\) must be squared as well.`),
          wrongChoice(raw`\(\,x^2+(y+1)^2=4x^2+(y-5)^2\)`, raw`The \(4\) multiplies the whole bracket, not just \(x^2\).`),
          wrongChoice(raw`\(\,\left(x^2+y^2+1\right)^2=4\left(x^2+y^2-25\right)^2\)`, raw`There is no need to square the brackets again after converting from modulus form.`)
        ]),
        choiceStep("Collect the terms", raw`After expanding and simplifying, which equation appears before completing the square?`, [
          correctChoice(raw`\(\,x^2+y^2-14y+33=0\)`, raw`Yes. Divide the expanded equation by \(3\) after collecting the terms.`),
          wrongChoice(raw`\(\,x^2+y^2+14y+33=0\)`, raw`The linear \(y\)-term should be negative after rearranging.`),
          wrongChoice(raw`\(\,x^2+y^2-7y+33=0\)`, raw`The coefficient of \(y\) is \(-14\), not \(-7\).`),
          wrongChoice(raw`\(\,x^2+y^2-14y-33=0\)`, raw`The constant term is positive \(33\) at this stage.`)
        ]),
        {
          type: "typed",
          title: "Complete the square",
          text: raw`What is the final Cartesian equation of the locus in circle form?`,
          ariaLabel: "Type the circle equation",
          mode: "equation",
          acceptedAnswers: ["x^2+(y-7)^2=16"],
          samples: [{ x: 0, y: 0 }, { x: 2, y: 4 }, { x: -3, y: 9 }],
          successMessage: raw`Correct. That is the circle in the required Cartesian form.`,
          genericMessage: raw`Complete the square in \(y\) by adding \(49\) to both sides.`
        }
      ]
    }),
    "3a": createConfig("3a", "2022 Paper — Argand diagram vector combination", {
      focus: raw`reading coordinates from the Argand diagram, forming \(2r-s\), and plotting the new complex number.`,
      questionHtml: raw`
        <p class="step-text">The complex numbers \(r\) and \(s\) are represented on the Argand diagram below.</p>
        ${questionThreeDiagramHtml()}
        <div class="question-math">
          \[
          \text{If }v=2r-s,\text{ find }v\text{ and mark it on the Argand diagram above.}
          \]
        </div>
      `,
      questionNotes: [
        raw`Read each plotted point as \((\text{real part},\text{imaginary part})\).`
      ],
      hints: [
        raw`Read \(r\) and \(s\) from the grid first.`,
        raw`Double \(r\) before you subtract \(s\).`,
        raw`The final point \(v\) should land at \((4,9)\).`
      ],
      answerHtml: raw`
        <p class="step-text">Read the coordinates from the diagram:</p>
        <div class="math-block">
          \[
          r=3+2i
          \]
          \[
          s=2-5i
          \]
        </div>
        <p class="step-text">Now scale \(r\) and subtract \(s\):</p>
        <div class="math-block">
          \[
          2r=6+4i
          \]
          \[
          v=2r-s=(6+4i)-(2-5i)=4+9i
          \]
        </div>
        <p class="step-text">So \(v\) is the point \((4,9)\) on the Argand diagram.</p>
        ${questionThreeDiagramHtml({ includeV: true })}
        ${answerBox(raw`
          \[
          v=4+9i
          \]
        `)}
      `,
      steps: [
        choiceStep("Read \(r\)", raw`What complex number does the point \(r\) represent?`, [
          correctChoice(raw`\(\,3+2i\)`, raw`Correct. The point \(r\) is at \((3,2)\).`),
          wrongChoice(raw`\(\,2+3i\)`, raw`Keep the real part first and the imaginary part second.`),
          wrongChoice(raw`\(\,3-2i\)`, raw`The point is above the real axis, so the imaginary part is positive.`),
          wrongChoice(raw`\(\,-3+2i\)`, raw`The point is to the right of the imaginary axis, so the real part is positive.`)
        ]),
        choiceStep("Read \(s\)", raw`What complex number does the point \(s\) represent?`, [
          correctChoice(raw`\(\,2-5i\)`, raw`Yes. The point \(s\) is at \((2,-5)\).`),
          wrongChoice(raw`\(\,-2-5i\)`, raw`The point is to the right of the origin, so the real part is positive.`),
          wrongChoice(raw`\(\,2+5i\)`, raw`The point is below the real axis, so the imaginary part is negative.`),
          wrongChoice(raw`\(\,5-2i\)`, raw`That swaps the coordinates.`)
        ]),
        choiceStep("Double \(r\)", raw`What is \(2r\)?`, [
          correctChoice(raw`\(\,6+4i\)`, raw`Exactly. Double both parts of \(r=3+2i\).`),
          wrongChoice(raw`\(\,6+2i\)`, raw`The imaginary part should double too.`),
          wrongChoice(raw`\(\,3+4i\)`, raw`The real part must also be doubled.`),
          wrongChoice(raw`\(\,6-4i\)`, raw`The imaginary part stays positive.`)
        ]),
        choiceStep("Find \(v\)", raw`What is \(v=2r-s\)?`, [
          correctChoice(raw`\(\,4+9i\)`, raw`Correct. Subtracting \(2-5i\) means subtract \(2\) from the real part and add \(5\) to the imaginary part.`),
          wrongChoice(raw`\(\,8-1i\)`, raw`That treats the subtraction signs incorrectly.`),
          wrongChoice(raw`\(\,4-9i\)`, raw`The imaginary part becomes \(4-(-5)=9\), not \(-9\).`),
          wrongChoice(raw`\(\,8+9i\)`, raw`The real part should be \(6-2=4\).`)
        ]),
        {
          type: "plot",
          title: "Plot \(v\)",
          text: raw`Drag the point to where \(v=4+9i\) should be on the Argand diagram.`,
          plot: {
            ariaLabel: "Interactive Argand diagram showing r and s with a draggable point for v",
            xMin: -10.5,
            xMax: 10.5,
            yMin: -10.5,
            yMax: 10.5,
            targetX: 4,
            targetY: 9,
            draggableLabel: "v",
            points: [
              { x: 3, y: 2, label: "r", className: "graph-point", labelX: 3.22, labelY: 2.22 },
              { x: 2, y: -5, label: "s", className: "graph-point", labelX: 2.22, labelY: -5.18 }
            ]
          },
          successMessage: raw`Nice. The point \((4,9)\) matches \(v=4+9i\).`,
          genericMessage: raw`Check the real part first, then the imaginary part. \(4+9i\) means right \(4\) and up \(9\).`,
          emptyMessage: raw`Place the point on the diagram before checking.`
        }
      ]
    }),
    "3b": createConfig("3b", "2022 Paper — Completing the square with a complex root", {
      focus: raw`completing the square in \(z\) and then taking the square root of a negative real expression.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Solve the equation }z^2+6kz+15k^2=0\text{ in terms of real number }k.
          \]
        </div>
        <p class="step-text">Give your solution in the form \(ak\pm \sqrt{b}\,ki\), where \(a\) and \(b\) are rational numbers.</p>
      `,
      hints: [
        raw`Move the constant term first, then complete the square on \(z^2+6kz\).`,
        raw`Adding \(9k^2\) makes a perfect square.`,
        raw`A square root of \(-6k^2\) gives an \(i\) in the final answer.`
      ],
      answerHtml: raw`
        <p class="step-text">Move the constant and complete the square:</p>
        <div class="math-block">
          \[
          z^2+6kz=-15k^2
          \]
          \[
          z^2+6kz+9k^2=-6k^2
          \]
          \[
          (z+3k)^2=-6k^2
          \]
        </div>
        <p class="step-text">Now take square roots:</p>
        <div class="math-block">
          \[
          z+3k=\pm \sqrt{6}\,ki
          \]
          \[
          z=-3k\pm \sqrt{6}\,ki
          \]
        </div>
        ${answerBox(raw`
          \[
          z=-3k\pm \sqrt{6}\,ki
          \]
        `)}
      `,
      steps: [
        choiceStep("Complete the square setup", raw`What should we add to both sides to complete the square?`, [
          correctChoice(raw`\(\,9k^2\)`, raw`Correct. Half of \(6k\) is \(3k\), and \((3k)^2=9k^2\).`),
          wrongChoice(raw`\(\,6k^2\)`, raw`That is not the square of half the middle coefficient.`),
          wrongChoice(raw`\(\,3k^2\)`, raw`You need the square of \(3k\), not just \(3k^2\).`),
          wrongChoice(raw`\(\,15k^2\)`, raw`That is the constant already in the equation, not the completing-square term.`)
        ]),
        choiceStep("Form the perfect square", raw`What equation do we get after completing the square?`, [
          correctChoice(raw`\(\,(z+3k)^2=-6k^2\)`, raw`Exactly. The left side becomes a perfect square and the right side simplifies to \(-6k^2\).`),
          wrongChoice(raw`\(\,(z+6k)^2=-6k^2\)`, raw`Half of \(6k\) is \(3k\), not \(6k\).`),
          wrongChoice(raw`\(\,(z+3k)^2=6k^2\)`, raw`The right-hand side is still negative after you add \(9k^2\).`),
          wrongChoice(raw`\(\,(z-3k)^2=-6k^2\)`, raw`The sign inside the bracket matches the sign of the middle term.`)
        ]),
        choiceStep("Take the square root", raw`What comes next after taking square roots?`, [
          correctChoice(raw`\(\,z+3k=\pm \sqrt{6}\,ki\)`, raw`Yes. The square root of \(-6k^2\) is \(\pm \sqrt{6}\,ki\).`),
          wrongChoice(raw`\(\,z+3k=\pm 6ki\)`, raw`The square root of \(6\) is \(\sqrt{6}\), not \(6\).`),
          wrongChoice(raw`\(\,z+3k=\pm \sqrt{6}\,k\)`, raw`You need an \(i\) because the quantity under the square root is negative.`),
          wrongChoice(raw`\(\,z-3k=\pm \sqrt{6}\,ki\)`, raw`The bracket on the left is still \(z+3k\).`)
        ]),
        choiceStep("Write the final roots", raw`What is the solution in the required form?`, [
          correctChoice(raw`\(\,z=-3k\pm \sqrt{6}\,ki\)`, raw`Correct. That matches the required form \(ak\pm \sqrt{b}\,ki\).`),
          wrongChoice(raw`\(\,z=3k\pm \sqrt{6}\,ki\)`, raw`Subtract \(3k\) from both sides at the final step.`),
          wrongChoice(raw`\(\,z=-3k\pm 6ki\)`, raw`The coefficient of \(i\) should be \(\sqrt{6}\,k\), not \(6k\).`),
          wrongChoice(raw`\(\,z=-3k\pm \sqrt{6}\,i\)`, raw`The factor \(k\) is still part of the square root result.`)
        ])
      ]
    }),
    "3c": createConfig("3c", "2022 Paper — Cube roots in polar form", {
      focus: raw`isolating \(z^3\), rewriting the right-hand side in polar form, and then taking the three cube roots using De Moivre's Theorem.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Solve the equation }z^3+k^6i=0,\text{ where }k\text{ is a real constant.}
          \]
        </div>
        <p class="step-text">Give your solution(s) in polar form in terms of \(k\).</p>
      `,
      hints: [
        raw`Start by isolating \(z^3\).`,
        raw`The number \(-i\) points straight down the imaginary axis, so its principal argument is \(-\frac{\pi}{2}\).`,
        raw`Cube roots divide the argument by \(3\) and use the pattern \(\frac{2n\pi}{3}\) for \(n=0,1,2\).`
      ],
      answerHtml: raw`
        <p class="step-text">Isolate \(z^3\) and write the right-hand side in polar form:</p>
        <div class="math-block">
          \[
          z^3=-k^6i
          \]
          \[
          z^3=k^6\operatorname{cis}\left(-\frac{\pi}{2}+2n\pi\right)
          \]
        </div>
        <p class="step-text">Now take the cube roots:</p>
        <div class="math-block">
          \[
          z=k^2\operatorname{cis}\left(-\frac{\pi}{6}+\frac{2n\pi}{3}\right),\qquad n=0,1,2
          \]
        </div>
        <p class="step-text">So the three solutions are</p>
        <div class="math-block">
          \[
          z_1=k^2\operatorname{cis}\left(-\frac{\pi}{6}\right)
          \]
          \[
          z_2=k^2\operatorname{cis}\left(\frac{\pi}{2}\right)
          \]
          \[
          z_3=k^2\operatorname{cis}\left(\frac{7\pi}{6}\right)
          \]
        </div>
        ${answerBox(raw`
          \[
          z=k^2\operatorname{cis}\left(-\frac{\pi}{6}\right),\ 
          k^2\operatorname{cis}\left(\frac{\pi}{2}\right),\ 
          k^2\operatorname{cis}\left(\frac{7\pi}{6}\right)
          \]
        `)}
      `,
      steps: [
        choiceStep("Isolate the cubic", raw`What is the first rearrangement?`, [
          correctChoice(raw`\(\,z^3=-k^6i\)`, raw`Correct. Move \(k^6i\) to the other side first.`),
          wrongChoice(raw`\(\,z^3=k^6i\)`, raw`The sign should become negative when you move the term across.`),
          wrongChoice(raw`\(\,z=-k^2i\)`, raw`We have not taken the cube root yet.`),
          wrongChoice(raw`\(\,z^3=-ki\)`, raw`The power on \(k\) stays as \(6\) until the cube-root step.`)
        ]),
        choiceStep("Read the modulus", raw`What is the modulus of \(-k^6i\)?`, [
          correctChoice(raw`\(\,k^6\)`, raw`Right. The modulus is the size of the number, and \(k^6\) is non-negative.`),
          wrongChoice(raw`\(\,-k^6\)`, raw`A modulus is never negative.`),
          wrongChoice(raw`\(\,k^2\)`, raw`That is the cube-root modulus, not the modulus of \(z^3\).`),
          wrongChoice(raw`\(\,6k^5\)`, raw`Do not differentiate the expression. We only need its modulus.`)
        ]),
        choiceStep("Choose the argument", raw`What principal argument should we use for \(-i\)?`, [
          correctChoice(raw`\(\,-\frac{\pi}{2}\)`, raw`Exactly. \(-i\) points straight down the negative imaginary axis.`),
          wrongChoice(raw`\(\,\frac{\pi}{2}\)`, raw`That would be the argument of \(+i\).`),
          wrongChoice(raw`\(\,\pi\)`, raw`\(\pi\) points along the negative real axis, not the negative imaginary axis.`),
          wrongChoice(raw`\(\,0\)`, raw`An argument of \(0\) points along the positive real axis.`)
        ]),
        choiceStep("Take the cube roots", raw`What is the correct general cube-root form?`, [
          correctChoice(raw`\(\,z=k^2\operatorname{cis}\left(-\frac{\pi}{6}+\frac{2n\pi}{3}\right),\ n=0,1,2\)`, raw`Yes. The modulus becomes \(k^2\), and the angle is divided by \(3\) with the usual cube-root spacing.`),
          wrongChoice(raw`\(\,z=k^6\operatorname{cis}\left(-\frac{\pi}{6}+\frac{2n\pi}{3}\right)\)`, raw`The modulus also has to be cube-rooted.`),
          wrongChoice(raw`\(\,z=k^2\operatorname{cis}\left(-\frac{\pi}{2}+\frac{2n\pi}{3}\right)\)`, raw`The argument must be divided by \(3\) as well.`),
          wrongChoice(raw`\(\,z=k^2\operatorname{cis}\left(-\frac{\pi}{6}+2n\pi\right)\)`, raw`Successive cube roots are separated by \(\frac{2\pi}{3}\), not by \(2\pi\).`)
        ]),
        choiceStep("List the three roots", raw`Which set gives all three solutions?`, [
          correctChoice(raw`\(\,k^2\operatorname{cis}\left(-\frac{\pi}{6}\right),\ k^2\operatorname{cis}\left(\frac{\pi}{2}\right),\ k^2\operatorname{cis}\left(\frac{7\pi}{6}\right)\)`, raw`Correct. Those are the three cube roots when \(n=0,1,2\).`),
          wrongChoice(raw`\(\,k^2\operatorname{cis}\left(-\frac{\pi}{2}\right),\ k^2\operatorname{cis}(0),\ k^2\operatorname{cis}\left(\frac{\pi}{2}\right)\)`, raw`Those angles are not spaced by \(\frac{2\pi}{3}\).`),
          wrongChoice(raw`\(\,k^6\operatorname{cis}\left(-\frac{\pi}{6}\right),\ k^6\operatorname{cis}\left(\frac{\pi}{2}\right),\ k^6\operatorname{cis}\left(\frac{7\pi}{6}\right)\)`, raw`The argument list is fine, but the modulus should be \(k^2\), not \(k^6\).`),
          wrongChoice(raw`\(\,k^2\operatorname{cis}\left(\frac{\pi}{6}\right),\ k^2\operatorname{cis}\left(\frac{5\pi}{6}\right),\ k^2\operatorname{cis}\left(\frac{3\pi}{2}\right)\)`, raw`Those angles do not come from dividing \(-\frac{\pi}{2}+2n\pi\) by \(3\).`)
        ])
      ]
    }),
    "3d": createConfig("3d", "2022 Paper — Proving impossibility", {
      focus: raw`using the fact that \(|z|\) is real, equating real and imaginary parts, and deriving a contradiction.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Prove that there is no complex number }z\text{ such that }|z|-z=i.
          \]
        </div>
      `,
      hints: [
        raw`Rearrange first so the real quantity \(|z|\) sits by itself.`,
        raw`Let \(z=a+bi\). Because \(|z|\) is real, the imaginary part on the other side must be \(0\).`,
        raw`The resulting real equation forces an impossible statement when you square it.`
      ],
      answerHtml: raw`
        <p class="step-text">Suppose, for contradiction, that such a complex number exists. Rearrange the equation:</p>
        <div class="math-block">
          \[
          |z|=z+i
          \]
        </div>
        <p class="step-text">Now let \(z=a+bi\). Then:</p>
        <div class="math-block">
          \[
          |z|=a+(b+1)i
          \]
        </div>
        <p class="step-text">But \(|z|\) is real, so the imaginary part must be zero:</p>
        <div class="math-block">
          \[
          b+1=0
          \]
          \[
          b=-1
          \]
        </div>
        <p class="step-text">The real part then gives</p>
        <div class="math-block">
          \[
          |z|=a
          \]
          \[
          \sqrt{a^2+b^2}=a
          \]
          \[
          \sqrt{a^2+1}=a
          \]
        </div>
        <p class="step-text">Square both sides:</p>
        <div class="math-block">
          \[
          a^2+1=a^2
          \]
          \[
          1=0
          \]
        </div>
        <p class="step-text">This is impossible, so no complex number \(z\) satisfies \(|z|-z=i\).</p>
        ${answerBox(raw`
          \[
          \text{No complex number }z\text{ satisfies }|z|-z=i.
          \]
        `)}
      `,
      steps: [
        choiceStep("Rearrange the equation", raw`What is the cleanest first step?`, [
          correctChoice(raw`\(\,|z|=z+i\)`, raw`Correct. That puts the real quantity \(|z|\) on its own.`),
          wrongChoice(raw`\(\,|z|=z-i\)`, raw`Add \(z\) to both sides, not subtract \(i\).`),
          wrongChoice(raw`\(\,z=|z|+i\)`, raw`That moves the terms the wrong way around.`),
          wrongChoice(raw`\(\,|z|+z=i\)`, raw`We want to isolate \(|z|\), not add another \(z\) to it.`)
        ]),
        choiceStep("Use the fact that \(|z|\) is real", raw`If \(z=a+bi\), what must be true?`, [
          correctChoice(raw`\(\,b=-1\)`, raw`Yes. Since \(|z|=a+(b+1)i\) is real, the imaginary part must be zero.`),
          wrongChoice(raw`\(\,b=1\)`, raw`The imaginary part is \(b+1\), so it must equal \(0\), giving \(b=-1\).`),
          wrongChoice(raw`\(\,a=-1\)`, raw`The reality of \(|z|\) tells us about the imaginary part, not the real part.`),
          wrongChoice(raw`\(\,a=0\)`, raw`There is no reason to force the real part to be zero here.`)
        ]),
        choiceStep("Match the real parts", raw`After substituting \(b=-1\), what real equation do we get?`, [
          correctChoice(raw`\(\,\sqrt{a^2+1}=a\)`, raw`Exactly. Since \(b=-1\), \(|z|=\sqrt{a^2+1}\), and the real part on the right is \(a\).`),
          wrongChoice(raw`\(\,\sqrt{a^2-1}=a\)`, raw`Because \(b^2=1\), the modulus becomes \(\sqrt{a^2+1}\).`),
          wrongChoice(raw`\(\,\sqrt{a^2+1}=-a\)`, raw`The real part of \(z+i\) is \(a\), not \(-a\).`),
          wrongChoice(raw`\(\,a^2+1=a\)`, raw`The modulus itself is \(\sqrt{a^2+1}\), not \(a^2+1\).`)
        ]),
        choiceStep("Reach the contradiction", raw`What contradiction finishes the proof?`, [
          correctChoice(raw`\(\,1=0\)`, raw`Correct. Squaring \(\sqrt{a^2+1}=a\) gives \(a^2+1=a^2\), which is impossible.`),
          wrongChoice(raw`\(\,a=0\)`, raw`That is not the contradiction we get from the real equation.`),
          wrongChoice(raw`\(\,b=0\)`, raw`We already found \(b=-1\), and the contradiction comes later.`),
          wrongChoice(raw`\(\,\sqrt{1}=0\)`, raw`The contradiction should come from the full squared equation.`)
        ])
      ]
    }),
    "3e": createConfig("3e", "2022 Paper — Solving for \(a\) and \(b\) using \(z\) and \(\overline{z}\)", {
      focus: raw`clearing the denominators with \(z\overline{z}\), then equating real and imaginary parts in terms of \(a\) and \(b\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{If }z=a+bi\text{ is a non-zero complex number, and }\frac{i}{z}+\frac{3}{\overline{z}}=1,
          \]
        </div>
        <p class="step-text">find the values of \(a\) and \(b\).</p>
      `,
      hints: [
        raw`Multiply through by \(z\overline{z}\) to clear the denominators.`,
        raw`Remember that \(z\overline{z}=a^2+b^2\).`,
        raw`Once you equate the imaginary part to \(0\), you can substitute into the real equation.`
      ],
      answerHtml: raw`
        <p class="step-text">Multiply through by \(z\overline{z}\):</p>
        <div class="math-block">
          \[
          i\overline{z}+3z=z\overline{z}
          \]
        </div>
        <p class="step-text">Now let \(z=a+bi\), so \(\overline{z}=a-bi\):</p>
        <div class="math-block">
          \[
          i(a-bi)+3(a+bi)=a^2+b^2
          \]
          \[
          (b+ai)+(3a+3bi)=a^2+b^2
          \]
          \[
          (3a+b)+(a+3b)i=a^2+b^2
          \]
        </div>
        <p class="step-text">Equate real and imaginary parts:</p>
        <div class="math-block">
          \[
          a+3b=0
          \]
          \[
          3a+b=a^2+b^2
          \]
        </div>
        <p class="step-text">From \(a+3b=0\), we get \(a=-3b\). Substitute into the real equation:</p>
        <div class="math-block">
          \[
          -8b=10b^2
          \]
          \[
          2b(5b+4)=0
          \]
        </div>
        <p class="step-text">If \(b=0\), then \(a=0\), but \(z\) is non-zero. So</p>
        <div class="math-block">
          \[
          b=-\frac{4}{5}
          \]
          \[
          a=-3b=\frac{12}{5}
          \]
        </div>
        ${answerBox(raw`
          \[
          a=\frac{12}{5},\qquad b=-\frac{4}{5}
          \]
        `)}
        ${tipBox(raw`The identity \(z\overline{z}=a^2+b^2\) is the key simplification that turns this into an ordinary real-system problem.`)}
      `,
      steps: [
        choiceStep("Clear the denominators", raw`What do we get after multiplying both sides by \(z\overline{z}\)?`, [
          correctChoice(raw`\(\,i\overline{z}+3z=z\overline{z}\)`, raw`Correct. Multiplying \(\frac{i}{z}\) by \(z\overline{z}\) leaves \(i\overline{z}\), and multiplying \(\frac{3}{\overline{z}}\) leaves \(3z\).`),
          wrongChoice(raw`\(\,iz+3\overline{z}=z\overline{z}\)`, raw`The factors \(z\) and \(\overline{z}\) land the other way around on the left-hand side.`),
          wrongChoice(raw`\(\,i+3=z\overline{z}\)`, raw`You still need the extra \(z\) and \(\overline{z}\) factors from clearing the denominators.`),
          wrongChoice(raw`\(\,i\overline{z}+3z=1\)`, raw`The right-hand side also gets multiplied by \(z\overline{z}\).`)
        ]),
        choiceStep("Substitute \(a+bi\)", raw`After substituting \(z=a+bi\), what does the left-hand side simplify to?`, [
          correctChoice(raw`\(\,(3a+b)+(a+3b)i\)`, raw`Exactly. \(i(a-bi)=b+ai\), then adding \(3a+3bi\) gives that expression.`),
          wrongChoice(raw`\(\,(3a-b)+(a-3b)i\)`, raw`Both signs on the \(b\)-terms should be positive after the simplification.`),
          wrongChoice(raw`\(\,(a+3b)+(3a+b)i\)`, raw`That swaps the real and imaginary parts.`),
          wrongChoice(raw`\(\,(3a+b)+(3a+b)i\)`, raw`The coefficients of the real and imaginary parts are different here.`)
        ]),
        choiceStep("Use the imaginary part", raw`What equation comes from matching the imaginary parts?`, [
          correctChoice(raw`\(\,a+3b=0\)`, raw`Yes. The right-hand side \(a^2+b^2\) is real, so the imaginary part must be zero.`),
          wrongChoice(raw`\(\,3a+b=0\)`, raw`That is the real part of the left-hand side, not the imaginary part.`),
          wrongChoice(raw`\(\,a-3b=0\)`, raw`The sign on the \(3b\) term is positive.`),
          wrongChoice(raw`\(\,a+3b=1\)`, raw`The right-hand side has no imaginary part at all, so it equals \(0\).`)
        ]),
        choiceStep("Substitute into the real equation", raw`After using \(a=-3b\), what equation in \(b\) do we get?`, [
          correctChoice(raw`\(\,10b^2+8b=0\)`, raw`Correct. Substituting \(a=-3b\) into \(3a+b=a^2+b^2\) gives \(-8b=10b^2\).`),
          wrongChoice(raw`\(\,10b^2-8b=0\)`, raw`The linear term should be positive after moving everything to one side.`),
          wrongChoice(raw`\(\,5b^2+4b=0\)`, raw`That is the factorised version after dividing by \(2\), but the full substituted equation is \(10b^2+8b=0\).`),
          wrongChoice(raw`\(\,9b^2+8b=0\)`, raw`Remember that \(a^2+b^2=(-3b)^2+b^2=10b^2\).`)
        ]),
        choiceStep("Finish the values", raw`What are the values of \(a\) and \(b\)?`, [
          correctChoice(raw`\(\,a=\frac{12}{5},\ b=-\frac{4}{5}\)`, raw`Exactly. The non-zero condition rules out \(a=b=0\), leaving \(b=-\frac{4}{5}\) and \(a=\frac{12}{5}\).`),
          wrongChoice(raw`\(\,a=-\frac{12}{5},\ b=\frac{4}{5}\)`, raw`Those signs do not satisfy \(a=-3b\) with the non-zero solution.`),
          wrongChoice(raw`\(\,a=\frac{4}{5},\ b=-\frac{12}{5}\)`, raw`That swaps the values and breaks \(a=-3b\).`),
          wrongChoice(raw`\(\,a=0,\ b=0\)`, raw`That would make \(z=0\), but the question states that \(z\) is non-zero.`)
        ])
      ]
    })
  };
}());
