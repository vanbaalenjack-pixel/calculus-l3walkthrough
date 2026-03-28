(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-complex-2025";
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
  const wrappedListPreview = {
    wrapWithParens: true
  };

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return "complex-" + id + "2025.html";
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
      browserTitle: "2025 Level 3 Complex Numbers Paper — " + questionLabel(id),
      eyebrow: "Level 3 Complex Numbers Walkthrough",
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

  function lineMarkup(scale, x1, y1, x2, y2, className, extra) {
    return `<line class="${className}" x1="${scale.x(x1)}" y1="${scale.y(y1)}" x2="${scale.x(x2)}" y2="${scale.y(y2)}"${extra || ""}></line>`;
  }

  function circleMarkup(scale, x, y, radius, className, extra) {
    return `<circle class="${className}" cx="${scale.x(x)}" cy="${scale.y(y)}" r="${radius}"${extra || ""}></circle>`;
  }

  function textMarkup(scale, x, y, text, className, extra) {
    return `<text class="${className}" x="${scale.x(x)}" y="${scale.y(y)}"${extra || ""}>${text}</text>`;
  }

  function argandDiagramHtml(options) {
    const settings = options || {};
    const width = 420;
    const height = 420;
    const padding = 28;
    const scale = createScale(width, height, padding, -6.5, 6.5, -6.5, 6.5);
    const gridLines = [];

    for (let x = -6; x <= 6; x += 1) {
      gridLines.push(lineMarkup(scale, x, -6, x, 6, "graph-grid-line"));
    }

    for (let y = -6; y <= 6; y += 1) {
      gridLines.push(lineMarkup(scale, -6, y, 6, y, "graph-grid-line"));
    }

    const points = [
      { x: 4, y: 2, label: "u", className: "graph-point", labelX: 4.22, labelY: 2.18 },
      { x: -2, y: -3, label: "w", className: "graph-point", labelX: -2.62, labelY: -3.22 }
    ];

    if (settings.includeZ) {
      points.push({ x: 2, y: -5, label: "z", className: "graph-point-secondary", labelX: 2.22, labelY: -5.18 });
    }

    return `
      <div class="graph-frame question-graph-frame">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Argand diagram showing the points u and w${settings.includeZ ? ", and z" : ""}">
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${gridLines.join("")}
          ${lineMarkup(scale, -6, 0, 6, 0, "graph-axis")}
          ${lineMarkup(scale, 0, -6, 0, 6, "graph-axis")}
          ${circleMarkup(scale, 0, 0, 4.5, "question-origin")}
          ${textMarkup(scale, 5.95, -0.22, "Real", "graph-label")}
          ${textMarkup(scale, -0.18, 6.3, "Imaginary", "graph-label", ' text-anchor="middle"')}
          ${points.map(function (point) {
            return circleMarkup(scale, point.x, point.y, 5, point.className)
              + textMarkup(scale, point.labelX, point.labelY, point.label, "graph-label");
          }).join("")}
        </svg>
      </div>
    `;
  }

  window.Complex2025Walkthroughs = {
    "1a": createConfig("1a", "2025 Paper — Polynomial division and remainder", {
      focus: raw`dividing a polynomial by \(x-2\) and using the stated remainder to solve for \(p\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{When the polynomial }3x^4 + px^3 - 4x + 5\text{ is divided by }x-2,\text{ the remainder is }21.
          \]
          \[
          \text{Find the value of }p.
          \]
        </div>
      `,
      hints: [
        raw`Start the long division with the leading term: \(\frac{3x^4}{x}=3x^3\).`,
        raw`Each time you subtract, look at the new leading term before choosing the next quotient term.`,
        raw`At the end, the remainder must equal \(21\), so set your final remainder expression equal to \(21\).`
      ],
      answerHtml: raw`
        <p class="step-text">Divide by \(x-2\), keeping track of the remainder:</p>
        <div class="math-block">
          \[
          \begin{aligned}
          \frac{3x^4}{x} &= 3x^3 \\
          3x^4 + px^3 + 0x^2 - 4x + 5 - \left(3x^4 - 6x^3\right) &= (p+6)x^3 - 4x + 5 \\
          \frac{(p+6)x^3}{x} &= (p+6)x^2 \\
          (p+6)x^3 + 0x^2 - 4x + 5 - \left((p+6)x^3 - 2(p+6)x^2\right) &= 2(p+6)x^2 - 4x + 5 \\
          &= (2p+12)x^2 - 4x + 5 \\
          \frac{(2p+12)x^2}{x} &= (2p+12)x \\
          (2p+12)x^2 - 4x + 5 - \left((2p+12)x^2 - 2(2p+12)x\right) &= -4x + 5 + (4p+24)x \\
          &= (4p+20)x + 5 \\
          \frac{(4p+20)x}{x} &= 4p+20 \\
          (4p+20)x + 5 - \left((4p+20)x - 2(4p+20)\right) &= 5 + 2(4p+20)
          \end{aligned}
          \]
        </div>
        <p class="step-text">Now use the given remainder:</p>
        <div class="math-block">
          \[
          5 + 2(4p+20)=21
          \]
          \[
          8p+45=21
          \]
          \[
          8p=-24
          \]
          \[
          p=-3
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Start the division",
          text: raw`What is the first quotient term when you divide \(3x^4\) by \(x\)?`,
          ariaLabel: "Type the first quotient term",
          acceptedAnswers: ["3x^3"],
          samples: [{ x: 2 }, { x: -1 }, { x: 3 }],
          successMessage: raw`Correct. The division starts with \(\frac{3x^4}{x}=3x^3\).`,
          genericMessage: raw`Divide the leading term \(3x^4\) by the leading term \(x\).`
        },
        {
          type: "typed",
          title: "Subtract the first product",
          text: raw`After subtracting \(3x^4-6x^3\), what expression is left?`,
          ariaLabel: "Type the expression left after the first subtraction",
          acceptedAnswers: ["(p+6)x^3-4x+5"],
          samples: [{ p: -3, x: 2 }, { p: 1, x: -1 }, { p: 4, x: 3 }],
          successMessage: raw`Yes. The \(x^4\) terms cancel, leaving \((p+6)x^3-4x+5\).`,
          targetedFeedback: [
            {
              answers: ["(p-6)x^3-4x+5"],
              message: raw`Watch the signs. Subtracting \(-6x^3\) adds \(6x^3\), so the coefficient becomes \(p+6\).`
            }
          ],
          genericMessage: raw`Subtract the whole bracket carefully. The cubic term changes because you are subtracting a negative term.`
        },
        {
          type: "typed",
          title: "Find the next quotient term",
          text: raw`What quotient term comes next when you divide \((p+6)x^3\) by \(x\)?`,
          ariaLabel: "Type the next quotient term",
          acceptedAnswers: ["(p+6)x^2"],
          samples: [{ p: -3, x: 2 }, { p: 1, x: -1 }, { p: 4, x: 3 }],
          successMessage: raw`Correct. The next quotient term is \((p+6)x^2\).`,
          genericMessage: raw`Divide the new leading term \((p+6)x^3\) by \(x\).`
        },
        {
          type: "typed",
          title: "Keep the pattern going",
          text: raw`After the next subtraction, what is the next quotient term?`,
          ariaLabel: "Type the third quotient term",
          acceptedAnswers: ["(2p+12)x"],
          samples: [{ p: -3, x: 2 }, { p: 1, x: -1 }, { p: 4, x: 3 }],
          successMessage: raw`Right. The remaining leading term is \((2p+12)x^2\), so the next quotient term is \((2p+12)x\).`,
          targetedFeedback: [
            {
              answers: ["2p+12"],
              message: raw`You need one factor of \(x\) here because you are dividing an \(x^2\) term by \(x\).`
            }
          ],
          genericMessage: raw`After the second subtraction, divide the new leading term by \(x\) again.`
        },
        {
          type: "typed",
          title: "Use the remainder",
          text: raw`The final remainder works out to \(5+2(4p+20)\). What equation do you get when you use the given remainder?`,
          ariaLabel: "Type the equation for the remainder",
          mode: "equation",
          options: {
            equationRhs: "21",
            allowBareExpression: true
          },
          acceptedAnswers: ["8p+45=21"],
          samples: [{ p: -3 }, { p: 1 }, { p: 4 }],
          successMessage: raw`Correct. Since \(5+2(4p+20)=8p+45\), the remainder condition gives \(8p+45=21\).`,
          genericMessage: raw`Set the remainder expression equal to the stated remainder \(21\), then simplify.`
        },
        {
          type: "typed",
          title: "Solve for p",
          text: raw`What value of \(p\) does that give?`,
          ariaLabel: "Type the value of p",
          acceptedAnswers: ["-3"],
          successMessage: raw`Exactly. Solving \(8p+45=21\) gives \(p=-3\).`,
          genericMessage: raw`Rearrange \(8p+45=21\) and solve the linear equation.`
        }
      ]
    }),
    "1b": createConfig("1b", "2025 Paper — Completing the square", {
      focus: raw`rearranging a quadratic in \(x\), completing the square, and solving in terms of \(k\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          x^2 - 6kx = k^2
          \]
        </div>
        <p class="step-text">Solve the equation for \(x\).</p>
        <p class="step-text">Simplify your answer as far as possible, giving your answer in terms of \(k\).</p>
      `,
      hints: [
        raw`Move everything to one side first so you have a quadratic equal to \(0\).`,
        raw`To complete the square, add and subtract \(9k^2\).`,
        raw`Once you have \((x-3k)^2=10k^2\), take square roots carefully.`
      ],
      answerHtml: raw`
        <p class="step-text">Start by setting the equation equal to zero:</p>
        <div class="math-block">
          \[
          x^2 - 6kx - k^2 = 0
          \]
        </div>
        <p class="step-text">Now complete the square:</p>
        <div class="math-block">
          \[
          x^2 - 6kx + 9k^2 - k^2 - 9k^2 = 0
          \]
          \[
          x^2 - 6kx + 9k^2 = 10k^2
          \]
          \[
          (x-3k)^2 = 10k^2
          \]
        </div>
        <p class="step-text">Take square roots and solve:</p>
        <div class="math-block">
          \[
          x-3k = \pm k\sqrt{10}
          \]
          \[
          x = 3k \pm k\sqrt{10}
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Write the quadratic in standard form",
          text: raw`After moving everything to one side, what equation do you get?`,
          ariaLabel: "Type the quadratic equal to zero",
          mode: "equation",
          options: {
            equationRhs: "0",
            allowBareExpression: true
          },
          acceptedAnswers: ["x^2-6kx-k^2=0"],
          samples: [{ x: 2, k: 1 }, { x: -1, k: 3 }, { x: 4, k: -2 }],
          successMessage: raw`Correct. Moving \(k^2\) to the left gives \(x^2-6kx-k^2=0\).`,
          genericMessage: raw`Subtract \(k^2\) from both sides so the equation is equal to \(0\).`
        },
        {
          type: "typed",
          title: "Complete the square",
          text: raw`What perfect-square equation do you get after completing the square?`,
          ariaLabel: "Type the completed-square equation",
          mode: "equation",
          acceptedAnswers: ["(x-3k)^2=10k^2"],
          samples: [{ x: 2, k: 1 }, { x: -1, k: 3 }, { x: 4, k: -2 }],
          successMessage: raw`Yes. Adding and subtracting \(9k^2\) gives \((x-3k)^2=10k^2\).`,
          genericMessage: raw`Add and subtract \(9k^2\), then rewrite the left side as a perfect square.`
        },
        {
          type: "typed",
          title: "Solve for x",
          text: raw`Type both solutions for \(x\), separated by commas.`,
          ariaLabel: "Type both solutions for x",
          mode: "list",
          options: unorderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: [
            "3k+ksqrt(10),3k-ksqrt(10)",
            "k(3+sqrt(10)),k(3-sqrt(10))"
          ],
          samples: [{ k: 1 }, { k: 2 }, { k: 5 }],
          successMessage: raw`Correct. Taking square roots gives \(x=3k\pm k\sqrt{10}\).`,
          genericMessage: raw`Take square roots of both sides and remember the \(\pm\).`
        }
      ]
    }),
    "1c": createConfig("1c", "2025 Paper — Discriminant proof", {
      focus: raw`turning the equation into a quadratic in \(x\), finding its discriminant, and justifying why it is always positive.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          (kx)^2 = 3 - \frac{x}{k}
          \]
        </div>
        <p class="step-text">Prove that the equation has real roots for all real values of \(k\), where \(k \neq 0\).</p>
      `,
      hints: [
        raw`Expand \((kx)^2\) first, then multiply through by \(k\) to remove the denominator.`,
        raw`Once the equation is in the form \(ax^2+bx+c=0\), use \(b^2-4ac\).`,
        raw`Think about the sign of \(k^4\) when \(k\) is real.`
      ],
      answerHtml: raw`
        <p class="step-text">First remove the denominator and write the equation as a quadratic in \(x\):</p>
        <div class="math-block">
          \[
          k^2x^2 = 3 - \frac{x}{k}
          \]
          \[
          k^3x^2 = 3k - x
          \]
          \[
          k^3x^2 + x - 3k = 0
          \]
        </div>
        <p class="step-text">Now evaluate the discriminant:</p>
        <div class="math-block">
          \[
          b^2 - 4ac
          \]
          \[
          = 1^2 - 4(k^3)(-3k)
          \]
          \[
          = 1 + 12k^4
          \]
          \[
          = 1 + 12(k^2)^2
          \]
        </div>
        <p class="step-text">This is always positive for real \(k\), because \(k^4 \ge 0\). So the quadratic has real roots for all real \(k\).</p>
      `,
      steps: [
        {
          type: "typed",
          title: "Rewrite as a quadratic",
          text: raw`After multiplying by \(k\) and rearranging, what quadratic in \(x\) do you get?`,
          ariaLabel: "Type the quadratic in x",
          mode: "equation",
          options: {
            equationRhs: "0",
            allowBareExpression: true
          },
          acceptedAnswers: ["k^3x^2+x-3k=0"],
          samples: [{ x: 2, k: 1 }, { x: -1, k: 2 }, { x: 3, k: -2 }],
          successMessage: raw`Correct. Multiplying by \(k\) gives \(k^3x^2=3k-x\), so the quadratic is \(k^3x^2+x-3k=0\).`,
          genericMessage: raw`Multiply through by \(k\) to clear the fraction, then move everything to one side.`
        },
        {
          type: "typed",
          title: "Find the discriminant",
          text: raw`What is the discriminant of this quadratic?`,
          ariaLabel: "Type the discriminant",
          acceptedAnswers: ["1+12k^4"],
          samples: [{ k: 1 }, { k: 2 }, { k: -3 }],
          successMessage: raw`Yes. Here \(a=k^3\), \(b=1\), and \(c=-3k\), so \(b^2-4ac=1+12k^4\).`,
          genericMessage: raw`Use \(b^2-4ac\) with \(a=k^3\), \(b=1\), and \(c=-3k\).`
        },
        {
          type: "choice",
          title: "Finish the proof",
          text: raw`Why does that prove the roots are real for every real \(k\)?`,
          buttonGridClass: "button-grid",
          choices: [
            {
              html: raw`\(\,k^4 \ge 0\) for real \(k\), so \(1+12k^4>0\) and the quadratic has real roots.`,
              correct: true,
              successMessage: raw`Exactly. A positive discriminant guarantees real roots, and \(1+12k^4\) is always positive.`
            },
            {
              html: raw`Because \(k \neq 0\), the equation stops being a quadratic.`,
              failureMessage: raw`Not quite. The equation is still quadratic in \(x\); \(k \neq 0\) only makes the algebra valid.`
            },
            {
              html: raw`Because \(1+12k^4\) is always equal to \(1\).`,
              failureMessage: raw`That is not true. The key fact is that \(k^4\) is never negative, so the discriminant stays positive.`
            },
            {
              html: raw`Because a discriminant greater than zero means the roots are imaginary.`,
              failureMessage: raw`It is the other way around. A positive discriminant gives real roots.`
            }
          ]
        }
      ]
    }),
    "1d": createConfig("1d", "2025 Paper — Cube roots in polar form", {
      focus: raw`rewriting a complex number in polar form and finding all three cube roots using arguments.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          z^3 + 8m^{27}i = 0
          \]
        </div>
        <p class="step-text">Solve the equation, where \(m\) is a positive real constant.</p>
        <p class="step-text">Write your solution(s) in polar form, in terms of \(m\).</p>
      `,
      questionNotes: [
        raw`Use principal values for the final arguments.`
      ],
      hints: [
        raw`Rearrange first so the right side is a single complex number: \(z^3=-8m^{27}i\).`,
        raw`Write \(-i\) as \(\operatorname{cis}\left(-\frac{\pi}{2}\right)\).`,
        raw`Cube roots divide the argument by \(3\) and give three values using \(k=0,1,2\).`
      ],
      answerHtml: raw`
        <p class="step-text">Rearrange and convert to polar form:</p>
        <div class="math-block">
          \[
          z^3 = -8m^{27}i
          \]
          \[
          z^3 = 8m^{27}\operatorname{cis}\left(-\frac{\pi}{2}\right)
          \]
        </div>
        <p class="step-text">Now take cube roots:</p>
        <div class="math-block">
          \[
          z^3 = 8m^{27}\operatorname{cis}\left(2k\pi-\frac{\pi}{2}\right)
          \]
          \[
          z = 2m^9\operatorname{cis}\left(\frac{2k\pi}{3}-\frac{\pi}{6}\right)
          \]
        </div>
        <p class="step-text">Evaluate at \(k=0,1,2\):</p>
        <div class="math-block">
          \[
          z_1 = 2m^9\operatorname{cis}\left(-\frac{\pi}{6}\right)
          \]
          \[
          z_2 = 2m^9\operatorname{cis}\left(\frac{\pi}{2}\right)
          \]
          \[
          z_3 = 2m^9\operatorname{cis}\left(\frac{7\pi}{6}\right)
          = 2m^9\operatorname{cis}\left(-\frac{5\pi}{6}\right)
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Find the modulus",
          text: raw`Once you write \(z^3=-8m^{27}i\), what is the modulus of the right-hand side?`,
          ariaLabel: "Type the modulus",
          acceptedAnswers: ["8m^27"],
          samples: [{ m: 2 }, { m: 3 }, { m: 5 }],
          successMessage: raw`Correct. The modulus is \(8m^{27}\).`,
          genericMessage: raw`The modulus comes from the size of \(8m^{27}i\), not its direction.`
        },
        {
          type: "typed",
          title: "Find the principal argument",
          text: raw`What principal argument should you use for \(-i\)?`,
          ariaLabel: "Type the principal argument",
          acceptedAnswers: ["-pi/2", "3pi/2"],
          successMessage: raw`Yes. \(-i\) lies on the negative imaginary axis, so a principal argument is \(-\frac{\pi}{2}\).`,
          genericMessage: raw`Look at where \(-i\) sits on the Argand diagram.`
        },
        {
          type: "typed",
          title: "Take the cube root of the modulus",
          text: raw`What modulus will each root of \(z\) have?`,
          ariaLabel: "Type the modulus of each root",
          acceptedAnswers: ["2m^9"],
          samples: [{ m: 2 }, { m: 3 }, { m: 5 }],
          successMessage: raw`Correct. The cube root of \(8m^{27}\) is \(2m^9\).`,
          genericMessage: raw`Take the cube root of both the number \(8\) and the power \(m^{27}\).`
        },
        {
          type: "typed",
          title: "List the three raw arguments",
          text: raw`Using \(k=0,1,2\), what three arguments do you get before adjusting to a principal value?`,
          ariaLabel: "Type the three cube-root arguments",
          mode: "list",
          options: unorderedListOptions,
          acceptedAnswers: ["-pi/6,pi/2,7pi/6"],
          successMessage: raw`Exactly. The three arguments are \(-\frac{\pi}{6}\), \(\frac{\pi}{2}\), and \(\frac{7\pi}{6}\).`,
          genericMessage: raw`Use \(\frac{2k\pi}{3}-\frac{\pi}{6}\) with \(k=0,1,2\).`
        },
        {
          type: "typed",
          title: "Use the principal value",
          text: raw`Convert the angle \(\frac{7\pi}{6}\) to its principal-value equivalent.`,
          ariaLabel: "Type the principal-value angle",
          acceptedAnswers: ["-5pi/6"],
          successMessage: raw`Correct. So the three roots are \(2m^9\operatorname{cis}\left(-\frac{\pi}{6}\right)\), \(2m^9\operatorname{cis}\left(\frac{\pi}{2}\right)\), and \(2m^9\operatorname{cis}\left(-\frac{5\pi}{6}\right)\).`,
          genericMessage: raw`Subtract \(2\pi\) from \(\frac{7\pi}{6}\) to move it into the principal-value range.`
        }
      ]
    }),
    "1e": createConfig("1e", "2025 Paper — Locus to Cartesian form", {
      focus: raw`rewriting a modulus locus in terms of \(a+bi\), squaring carefully, and converting the result to Cartesian form.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \left|z-5i\right|-\left|z+5i\right|=4
          \]
        </div>
        <p class="step-text">Find the Cartesian equation of the locus of \(z\), giving your answer in the form \(ay^2-bx^2=k\), where \(a\), \(b\), and \(k\) are constants.</p>
      `,
      hints: [
        raw`Rearrange first so one modulus is by itself.`,
        raw`Let \(z=a+bi\), then rewrite each modulus as a square root.`,
        raw`You will need to square twice, but simplify after the first squaring before doing it again.`
      ],
      answerHtml: raw`
        <p class="step-text">Rearrange the locus and substitute \(z=a+bi\):</p>
        <div class="math-block">
          \[
          |z-5i| = 4 + |z+5i|
          \]
          \[
          |a+(b-5)i| = 4 + |a+(b+5)i|
          \]
          \[
          \sqrt{a^2+(b-5)^2} = 4 + \sqrt{a^2+(b+5)^2}
          \]
        </div>
        <p class="step-text">Square both sides and simplify:</p>
        <div class="math-block">
          \[
          a^2+(b-5)^2 = 16+a^2+(b+5)^2+8\sqrt{a^2+(b+5)^2}
          \]
          \[
          (b-5)^2 = 16+(b+5)^2+8\sqrt{a^2+(b+5)^2}
          \]
          \[
          b^2-10b+25 = 16+b^2+10b+25+8\sqrt{a^2+(b+5)^2}
          \]
          \[
          -20b = 16+8\sqrt{a^2+(b+5)^2}
          \]
        </div>
        <p class="step-text">Now square again:</p>
        <div class="math-block">
          \[
          -5b = 4 + 2\sqrt{a^2+(b+5)^2}
          \]
          \[
          2\sqrt{a^2+(b+5)^2} = -5b-4
          \]
          \[
          4\left(a^2+(b+5)^2\right)=16+25b^2+40b
          \]
          \[
          4a^2+4b^2+40b+100 = 16+25b^2+40b
          \]
          \[
          21b^2-4a^2=84
          \]
        </div>
        <p class="step-text">Since \(z=x+yi\), replace \(a\) with \(x\) and \(b\) with \(y\):</p>
        <div class="math-block">
          \[
          21y^2-4x^2=84
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Rewrite the moduli",
          text: raw`After letting \(z=a+bi\), what equation do you get in square-root form?`,
          ariaLabel: "Type the square-root equation",
          mode: "equation",
          acceptedAnswers: ["sqrt(a^2+(b-5)^2)=4+sqrt(a^2+(b+5)^2)"],
          samples: [{ a: 1, b: 3 }, { a: -2, b: 6 }, { a: 4, b: -1 }],
          successMessage: raw`Correct. Each modulus turns into a distance formula.`,
          genericMessage: raw`Replace \(z\) with \(a+bi\), then use \(|x+yi|=\sqrt{x^2+y^2}\).`
        },
        {
          type: "typed",
          title: "Simplify after the first squaring",
          text: raw`After squaring once and simplifying, what equation do you get?`,
          ariaLabel: "Type the equation after the first squaring",
          mode: "equation",
          acceptedAnswers: ["-20b=16+8sqrt(a^2+(b+5)^2)"],
          samples: [{ a: 1, b: 3 }, { a: -2, b: 6 }, { a: 4, b: -1 }],
          successMessage: raw`Yes. The \(a^2\) terms cancel, and the \(b\)-terms simplify to \(-20b=16+8\sqrt{a^2+(b+5)^2}\).`,
          genericMessage: raw`Square both sides, expand \((b-5)^2\) and \((b+5)^2\), then collect like terms.`
        },
        {
          type: "typed",
          title: "Square again",
          text: raw`What equation do you get after squaring a second time and simplifying fully?`,
          ariaLabel: "Type the simplified equation in a and b",
          mode: "equation",
          acceptedAnswers: ["21b^2-4a^2=84"],
          samples: [{ a: 1, b: 3 }, { a: -2, b: 6 }, { a: 4, b: -1 }],
          successMessage: raw`Correct. The second squaring gives \(21b^2-4a^2=84\).`,
          genericMessage: raw`First isolate the square root, then square again and collect like terms carefully.`
        },
        {
          type: "typed",
          title: "Switch to x and y",
          text: raw`Now write the final Cartesian equation using \(z=x+yi\).`,
          ariaLabel: "Type the Cartesian equation",
          mode: "equation",
          acceptedAnswers: ["21y^2-4x^2=84"],
          samples: [{ x: 1, y: 3 }, { x: -2, y: 6 }, { x: 4, y: -1 }],
          successMessage: raw`Exactly. Since \(a=x\) and \(b=y\), the Cartesian equation is \(21y^2-4x^2=84\).`,
          genericMessage: raw`Replace \(a\) with \(x\) and \(b\) with \(y\).`
        }
      ]
    }),
    "2a": createConfig("2a", "2025 Paper — Argand diagram combinations", {
      focus: raw`reading complex numbers from an Argand diagram, scaling them, and adding them to find a new point.`,
      questionHtml: raw`
        <p class="step-text">The complex numbers \(u\) and \(w\) are represented on the Argand diagram below.</p>
        ${argandDiagramHtml()}
        <div class="question-math">
          \[
          \text{If } z = 2u + 3w,\text{ find } z,\text{ and clearly show it on the Argand diagram above.}
          \]
        </div>
      `,
      questionNotes: [
        raw`Type coordinates as \((\text{real part},\text{imaginary part})\).`
      ],
      hints: [
        raw`Read \(u\) and \(w\) from the diagram first: each point gives a real coordinate and an imaginary coordinate.`,
        raw`Find \(2u\) and \(3w\) separately before you add them.`,
        raw`Once you have the coordinate of \(z\), you can rewrite it as a complex number.`
      ],
      answerHtml: raw`
        <p class="step-text">Read the points from the diagram:</p>
        <div class="math-block">
          \[
          u = 4 + 2i
          \]
          \[
          w = -2 - 3i
          \]
        </div>
        <p class="step-text">Scale each one:</p>
        <div class="math-block">
          \[
          2u = 2(4+2i)=8+4i
          \]
          \[
          3w = 3(-2-3i)=-6-9i
          \]
        </div>
        <p class="step-text">Now add:</p>
        <div class="math-block">
          \[
          z = 8+4i+(-6-9i)=2-5i
          \]
        </div>
        <p class="step-text">So \(z\) is the point \((2,-5)\) on the Argand diagram.</p>
        ${argandDiagramHtml({ includeZ: true })}
      `,
      steps: [
        {
          type: "typed",
          title: "Read u from the diagram",
          text: raw`Type the coordinates of \(u\) as an ordered pair.`,
          ariaLabel: "Type the coordinates of u",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["4,2"],
          successMessage: raw`Correct. The point \(u\) is \((4,2)\), so \(u=4+2i\).`,
          targetedFeedback: [
            {
              answers: ["2,4"],
              mode: "list",
              options: orderedListOptions,
              message: raw`Watch the order. Write \((\text{real},\text{imaginary})\), not the other way around.`
            }
          ],
          genericMessage: raw`Read the horizontal coordinate first, then the vertical coordinate.`
        },
        {
          type: "typed",
          title: "Read w from the diagram",
          text: raw`Type the coordinates of \(w\) as an ordered pair.`,
          ariaLabel: "Type the coordinates of w",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["-2,-3"],
          successMessage: raw`Correct. The point \(w\) is \((-2,-3)\), so \(w=-2-3i\).`,
          targetedFeedback: [
            {
              answers: ["-3,-2"],
              mode: "list",
              options: orderedListOptions,
              message: raw`Close, but the real part is \(-2\) and the imaginary part is \(-3\).`
            }
          ],
          genericMessage: raw`Read the point carefully from the grid.`
        },
        {
          type: "typed",
          title: "Scale u",
          text: raw`What are the coordinates of \(2u\)?`,
          ariaLabel: "Type the coordinates of 2u",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["8,4"],
          successMessage: raw`Yes. Doubling \((4,2)\) gives \((8,4)\).`,
          genericMessage: raw`Multiply both coordinates of \(u\) by \(2\).`
        },
        {
          type: "typed",
          title: "Scale w",
          text: raw`What are the coordinates of \(3w\)?`,
          ariaLabel: "Type the coordinates of 3w",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["-6,-9"],
          successMessage: raw`Correct. Multiplying \((-2,-3)\) by \(3\) gives \((-6,-9)\).`,
          genericMessage: raw`Multiply both coordinates of \(w\) by \(3\).`
        },
        {
          type: "typed",
          title: "Find z",
          text: raw`Now add \(2u\) and \(3w\). What are the coordinates of \(z\)?`,
          ariaLabel: "Type the coordinates of z",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["2,-5"],
          successMessage: raw`Correct. So \(z=(2,-5)\), which means \(z=2-5i\).`,
          targetedFeedback: [
            {
              answers: ["-2,5"],
              mode: "list",
              options: orderedListOptions,
              message: raw`Check the signs carefully when you add the coordinates.`
            }
          ],
          genericMessage: raw`Add the real parts together, and add the imaginary parts together.`
        }
      ]
    }),
    "2b": createConfig("2b", "2025 Paper — De Moivre to a + bi", {
      focus: raw`using De Moivre’s Theorem and then converting the result into \(a+bi\) form.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          u = m\operatorname{cis}\left(\frac{3\pi}{10}\right)
          \]
        </div>
        <p class="step-text">Write \(u^5\) in the form \(a+bi\), where \(a\) and \(b\) are both real numbers, giving your answer in terms of \(m\).</p>
      `,
      hints: [
        raw`Apply De Moivre first: raise the modulus to the power and multiply the argument by the power.`,
        raw`The new argument is \(5\times\frac{3\pi}{10}\).`,
        raw`Once you reach \(\operatorname{cis}\left(\frac{3\pi}{2}\right)\), use the exact trig values.`
      ],
      answerHtml: raw`
        <p class="step-text">Apply De Moivre’s Theorem:</p>
        <div class="math-block">
          \[
          u^5 = m^5\operatorname{cis}\left(5\cdot\frac{3\pi}{10}\right)
          \]
          \[
          u^5 = m^5\operatorname{cis}\left(\frac{3\pi}{2}\right)
          \]
        </div>
        <p class="step-text">Now convert to \(a+bi\) form:</p>
        <div class="math-block">
          \[
          a = m^5\cos\left(\frac{3\pi}{2}\right)=0
          \]
          \[
          b = m^5\sin\left(\frac{3\pi}{2}\right)=-m^5
          \]
          \[
          u^5 = -m^5i
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Multiply the argument",
          text: raw`After applying De Moivre’s Theorem, what is the new argument of \(u^5\)?`,
          ariaLabel: "Type the new argument",
          acceptedAnswers: ["3pi/2"],
          successMessage: raw`Correct. \(5\times\frac{3\pi}{10}=\frac{3\pi}{2}\).`,
          genericMessage: raw`Multiply the original argument by \(5\).`
        },
        {
          type: "typed",
          title: "Find a and b",
          text: raw`Type the values of \((a,b)\) in that order.`,
          ariaLabel: "Type the values of a and b",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["0,-m^5"],
          samples: [{ m: 2 }, { m: 3 }, { m: 5 }],
          successMessage: raw`Exactly. So \(u^5=0+(-m^5)i=-m^5i\).`,
          targetedFeedback: [
            {
              answers: ["0,m^5"],
              mode: "list",
              options: orderedListOptions,
              message: raw`The real part is correct, but \(\sin\left(\frac{3\pi}{2}\right)=-1\), so the imaginary coefficient is negative.`
            }
          ],
          genericMessage: raw`Use \(\cos\left(\frac{3\pi}{2}\right)=0\) and \(\sin\left(\frac{3\pi}{2}\right)=-1\).`
        }
      ]
    }),
    "2c": createConfig("2c", "2025 Paper — Modulus equation with a real parameter", {
      focus: raw`rewriting a modulus as a square root, squaring the equation, and solving for a real parameter.`,
      questionHtml: raw`
        <p class="step-text">Solve the following equation for \(m\), where \(m\) is a real number.</p>
        <div class="question-math">
          \[
          |5-mi|=\sqrt{5m^2}
          \]
        </div>
      `,
      hints: [
        raw`Write \(|5-mi|\) as \(\sqrt{5^2+m^2}\).`,
        raw`Then square both sides so the roots disappear.`,
        raw`The final equation in \(m\) is just a simple quadratic in \(m^2\).`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite the modulus as a square root:</p>
        <div class="math-block">
          \[
          \sqrt{5^2+m^2}=\sqrt{5m^2}
          \]
        </div>
        <p class="step-text">Square both sides and solve:</p>
        <div class="math-block">
          \[
          25+m^2=5m^2
          \]
          \[
          4m^2=25
          \]
          \[
          m=\pm\frac{5}{2}
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Rewrite the modulus",
          text: raw`What does \(|5-mi|\) become as a square root?`,
          ariaLabel: "Type the square-root form of the modulus",
          acceptedAnswers: ["sqrt(25+m^2)"],
          samples: [{ m: -3 }, { m: 2 }, { m: 5 }],
          successMessage: raw`Correct. The modulus is \(\sqrt{5^2+m^2}=\sqrt{25+m^2}\).`,
          genericMessage: raw`Use \(|a+bi|=\sqrt{a^2+b^2}\).`
        },
        {
          type: "typed",
          title: "Square the equation",
          text: raw`After squaring both sides, what equation do you get?`,
          ariaLabel: "Type the squared equation",
          mode: "equation",
          acceptedAnswers: ["4m^2=25"],
          samples: [{ m: -3 }, { m: 2 }, { m: 5 }],
          successMessage: raw`Yes. Squaring gives \(25+m^2=5m^2\), so \(4m^2=25\).`,
          genericMessage: raw`Square both sides, then collect the \(m^2\) terms together.`
        },
        {
          type: "typed",
          title: "Solve for m",
          text: raw`Type both values of \(m\), separated by commas.`,
          ariaLabel: "Type both values of m",
          mode: "list",
          options: unorderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["-5/2,5/2"],
          successMessage: raw`Correct. Solving \(4m^2=25\) gives \(m=\pm\frac{5}{2}\).`,
          genericMessage: raw`Divide by \(4\), then take square roots.`
        }
      ]
    }),
    "2d": createConfig("2d", "2025 Paper — Matching real and imaginary parts", {
      focus: raw`expanding both sides of a complex equation and matching the real and imaginary parts to solve for two real constants.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          (g+2i)(3+hi)=(10-4i)(3-i)
          \]
        </div>
        <p class="step-text">Find all possible values of \(g\) and \(h\).</p>
      `,
      hints: [
        raw`Expand the left side and right side separately first.`,
        raw`Once both sides are in \(a+bi\) form, match real parts and imaginary parts.`,
        raw`Use the real-part equation together with the value of \(gh\).`
      ],
      answerHtml: raw`
        <p class="step-text">Expand the left side:</p>
        <div class="math-block">
          \[
          (g+2i)(3+hi)=3g+6i+hgi+2hi^2
          \]
          \[
          =3g-2h+(6+gh)i
          \]
        </div>
        <p class="step-text">Expand the right side:</p>
        <div class="math-block">
          \[
          (10-4i)(3-i)=30-12i-10i+4i^2
          \]
          \[
          =26-22i
          \]
        </div>
        <p class="step-text">Now match real and imaginary parts:</p>
        <div class="math-block">
          \[
          3g-2h=26
          \]
          \[
          6+gh=-22
          \]
          \[
          gh=-28
          \]
        </div>
        <p class="step-text">Substitute \(h=\frac{3g-26}{2}\) into \(gh=-28\):</p>
        <div class="math-block">
          \[
          g\left(\frac{3g-26}{2}\right)=-28
          \]
          \[
          3g^2-26g+56=0
          \]
          \[
          g=4,\ \frac{14}{3}
          \]
          \[
          h=-7,\ -6
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Expand the right side",
          text: raw`Type the real part and imaginary coefficient of \((10-4i)(3-i)\) as an ordered pair.`,
          ariaLabel: "Type the real part and imaginary coefficient",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["26,-22"],
          successMessage: raw`Correct. The right side simplifies to \(26-22i\).`,
          genericMessage: raw`Expand carefully and remember that \(i^2=-1\).`
        },
        {
          type: "typed",
          title: "Match real parts",
          text: raw`What equation do the real parts give you?`,
          ariaLabel: "Type the real-parts equation",
          mode: "equation",
          acceptedAnswers: ["3g-2h=26"],
          samples: [{ g: 4, h: -7 }, { g: 14 / 3, h: -6 }, { g: 2, h: 1 }],
          successMessage: raw`Yes. The real part on the left is \(3g-2h\), so \(3g-2h=26\).`,
          genericMessage: raw`From the left side, the real part is \(3g-2h\). Match that with the right side.`
        },
        {
          type: "typed",
          title: "Match imaginary parts",
          text: raw`What value must \(gh\) have?`,
          ariaLabel: "Type the value of gh",
          acceptedAnswers: ["-28"],
          successMessage: raw`Correct. Since \(6+gh=-22\), it follows that \(gh=-28\).`,
          genericMessage: raw`Use the imaginary parts: \(6+gh=-22\).`
        },
        {
          type: "typed",
          title: "Find the values of g",
          text: raw`Type the two possible values of \(g\) in increasing order.`,
          ariaLabel: "Type the two values of g",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["4,14/3"],
          successMessage: raw`Correct. Solving \(3g^2-26g+56=0\) gives \(g=4\) and \(g=\frac{14}{3}\).`,
          targetedFeedback: [
            {
              answers: ["14/3,4"],
              mode: "list",
              options: orderedListOptions,
              message: raw`Those are the right values, but put them in increasing order.`
            }
          ],
          genericMessage: raw`Substitute \(h=\frac{3g-26}{2}\) into \(gh=-28\), then solve the quadratic in \(g\).`
        },
        {
          type: "typed",
          title: "Match each value of h",
          text: raw`Type the matching values of \(h\) in the same order.`,
          ariaLabel: "Type the matching values of h",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["-7,-6"],
          successMessage: raw`Exactly. The two solution pairs are \((4,-7)\) and \(\left(\frac{14}{3},-6\right)\).`,
          genericMessage: raw`Use \(h=\frac{3g-26}{2}\) for each value of \(g\).`
        }
      ]
    }),
    "2e": createConfig("2e", "2025 Paper — Argument condition", {
      focus: raw`using an argument condition to equate real and imaginary parts after rationalising a complex fraction.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \arg\left(\frac{d+6i}{1-di}\right)=\frac{\pi}{4}
          \]
        </div>
        <p class="step-text">Find the possible value(s) of \(d\), where \(d\) is a real constant.</p>
      `,
      hints: [
        raw`An argument of \(\frac{\pi}{4}\) means the real and imaginary parts are equal.`,
        raw`Multiply numerator and denominator by the conjugate of \(1-di\).`,
        raw`After rationalising, equate the real part and imaginary coefficient.`
      ],
      answerHtml: raw`
        <p class="step-text">Since \(\tan\left(\frac{\pi}{4}\right)=1\), the real and imaginary parts must be equal.</p>
        <p class="step-text">Multiply by the conjugate of the denominator:</p>
        <div class="math-block">
          \[
          \frac{(d+6i)(1+di)}{(1-di)(1+di)}
          \]
          \[
          =\frac{d+6i+d^2i+6di^2}{1+d^2}
          \]
          \[
          =\frac{-5d+(6+d^2)i}{1+d^2}
          \]
        </div>
        <p class="step-text">Match the real and imaginary parts:</p>
        <div class="math-block">
          \[
          -5d=6+d^2
          \]
          \[
          d^2+5d+6=0
          \]
          \[
          (d+2)(d+3)=0
          \]
          \[
          d=-2,\ -3
          \]
        </div>
      `,
      steps: [
        {
          type: "choice",
          title: "Use the argument",
          text: raw`What does \(\arg\left(\frac{d+6i}{1-di}\right)=\frac{\pi}{4}\) tell you after rationalising?`,
          buttonGridClass: "button-grid",
          choices: [
            {
              html: raw`The real part and imaginary part are equal.`,
              correct: true,
              successMessage: raw`Correct. Since \(\tan\left(\frac{\pi}{4}\right)=1\), the real part and imaginary part must match.`
            },
            {
              html: raw`The real part must be zero.`,
              failureMessage: raw`Not here. An argument of \(\frac{\pi}{4}\) does not put the number on the imaginary axis.`
            },
            {
              html: raw`The modulus must be \(1\).`,
              failureMessage: raw`That is a condition on size, not angle.`
            },
            {
              html: raw`The denominator must be purely real.`,
              failureMessage: raw`The denominator becomes real after rationalising, but that is not the angle condition itself.`
            }
          ]
        },
        {
          type: "typed",
          title: "Set up the equation",
          text: raw`After rationalising, what equation do you get by matching the real and imaginary parts?`,
          ariaLabel: "Type the equation in d",
          mode: "equation",
          acceptedAnswers: ["d^2+5d+6=0"],
          samples: [{ d: -2 }, { d: -3 }, { d: 1 }],
          successMessage: raw`Yes. Rationalising gives \(\frac{-5d+(6+d^2)i}{1+d^2}\), so matching real and imaginary parts gives \(d^2+5d+6=0\).`,
          genericMessage: raw`After rationalising, set the real part \(-5d\) equal to the imaginary coefficient \(6+d^2\).`
        },
        {
          type: "typed",
          title: "Solve for d",
          text: raw`Type the possible values of \(d\), separated by commas.`,
          ariaLabel: "Type the possible values of d",
          mode: "list",
          options: unorderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["-2,-3"],
          successMessage: raw`Correct. Solving \(d^2+5d+6=0\) gives \(d=-2\) or \(d=-3\).`,
          genericMessage: raw`Factor the quadratic \(d^2+5d+6=0\).`
        }
      ]
    }),
    "3a": createConfig("3a", "2025 Paper — Conjugate roots and a quadratic", {
      focus: raw`using the conjugate-root rule for real coefficients and building the quadratic equation from the two roots.`,
      questionHtml: raw`
        <p class="step-text">One solution of a quadratic equation, with real coefficients, is</p>
        <div class="question-math">
          \[
          x = 2 + \sqrt{p}\,i
          \]
        </div>
        <p class="step-text">Find the quadratic equation, in terms of \(p\), giving your answer in the form \(ax^2+bx+c=0\).</p>
      `,
      hints: [
        raw`If the coefficients are real, complex roots come in conjugate pairs.`,
        raw`So the other root is \(2-\sqrt{p}\,i\).`,
        raw`Multiply \((x-(2+\sqrt{p}\,i))(x-(2-\sqrt{p}\,i))\).`
      ],
      answerHtml: raw`
        <p class="step-text">Because the coefficients are real, the conjugate root must also be a solution:</p>
        <div class="math-block">
          \[
          x = 2 - \sqrt{p}\,i
          \]
        </div>
        <p class="step-text">Now form the quadratic and expand:</p>
        <div class="math-block">
          \[
          (x-2-\sqrt{p}\,i)(x-2+\sqrt{p}\,i)=0
          \]
          \[
          (x-2)^2-(\sqrt{p}\,i)^2=0
          \]
          \[
          x^2-4x+4-p(i^2)=0
          \]
          \[
          x^2-4x+4+p=0
          \]
        </div>
      `,
      steps: [
        {
          type: "choice",
          title: "Use the conjugate-root rule",
          text: raw`What other root must the quadratic have?`,
          buttonGridClass: "button-grid",
          choices: [
            {
              html: raw`\(2-\sqrt{p}\,i\)`,
              correct: true,
              successMessage: raw`Correct. Real-coefficient quadratics always have complex roots in conjugate pairs.`
            },
            {
              html: raw`\(-2+\sqrt{p}\,i\)`,
              failureMessage: raw`Not quite. Only the imaginary part changes sign for the conjugate root.`
            },
            {
              html: raw`\(-2-\sqrt{p}\,i\)`,
              failureMessage: raw`The real part stays \(2\); only the imaginary part changes sign.`
            },
            {
              html: raw`\(2+\sqrt{p}\,i\)`,
              failureMessage: raw`That is the original root, not the second one.`
            }
          ]
        },
        {
          type: "typed",
          title: "Build the quadratic",
          text: raw`After multiplying the conjugate factors, what quadratic equation do you get?`,
          ariaLabel: "Type the quadratic equation",
          mode: "equation",
          options: {
            equationRhs: "0",
            allowBareExpression: true
          },
          acceptedAnswers: ["x^2-4x+4+p=0"],
          samples: [{ x: 2, p: 1 }, { x: -1, p: 4 }, { x: 3, p: 9 }],
          successMessage: raw`Exactly. The quadratic is \(x^2-4x+4+p=0\).`,
          genericMessage: raw`Multiply the conjugate pair. The imaginary terms cancel, and \(i^2=-1\).`
        }
      ]
    }),
    "3b": createConfig("3b", "2025 Paper — Squaring a complex expression", {
      focus: raw`squaring a binomial with a complex term and keeping track of the effect of \(i^2=-1\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \left(\sqrt{3a}-\sqrt{12a}\,i\right)^2
          \]
        </div>
        <p class="step-text">Expand and simplify, giving your answer in terms of \(a\), where \(a\) is a real number.</p>
      `,
      hints: [
        raw`Use \((A-B)^2=A^2-2AB+B^2\).`,
        raw`The middle term simplifies to \(-12ai\).`,
        raw`The last term contains \(i^2\), so it changes sign.`
      ],
      answerHtml: raw`
        <p class="step-text">Expand using \((A-B)^2=A^2-2AB+B^2\):</p>
        <div class="math-block">
          \[
          \left(\sqrt{3a}-\sqrt{12a}\,i\right)^2
          =3a-2\sqrt{36a^2}\,i+12ai^2
          \]
          \[
          =3a-12ai-12a
          \]
          \[
          =-9a-12ai
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Find the real part",
          text: raw`After simplifying the square terms, what is the real part of the answer?`,
          ariaLabel: "Type the real part",
          acceptedAnswers: ["-9a"],
          samples: [{ a: 1 }, { a: 2 }, { a: 5 }],
          successMessage: raw`Correct. The real part is \(3a+12ai^2=3a-12a=-9a\).`,
          targetedFeedback: [
            {
              answers: ["15a"],
              message: raw`Check the \(i^2\) term. Since \(i^2=-1\), the last term is \(-12a\), not \(+12a\).`
            }
          ],
          genericMessage: raw`Combine the square terms and remember that \(i^2=-1\).`
        },
        {
          type: "typed",
          title: "Find the imaginary coefficient",
          text: raw`What is the coefficient of \(i\) in the final answer?`,
          ariaLabel: "Type the coefficient of i",
          acceptedAnswers: ["-12a"],
          samples: [{ a: 1 }, { a: 2 }, { a: 5 }],
          successMessage: raw`Yes. So the full answer is \(-9a-12ai\).`,
          targetedFeedback: [
            {
              answers: ["12a"],
              message: raw`The cross term is negative because the expression is \((A-B)^2\).`
            }
          ],
          genericMessage: raw`Look at the middle term \(-2AB\).`
        }
      ]
    }),
    "3c": createConfig("3c", "2025 Paper — Solving with \u221ax substitution", {
      focus: raw`expanding a radical equation, using a substitution, and checking the valid solution.`,
      questionHtml: raw`
        <p class="step-text">Solve the following equation for \(x\).</p>
        <div class="question-math">
          \[
          (1+2\sqrt{x})(3+2\sqrt{x})=5+6\sqrt{x}
          \]
        </div>
      `,
      hints: [
        raw`Expand the left-hand side first.`,
        raw`Then collect everything on one side.`,
        raw`Let \(u=\sqrt{x}\) to turn it into an ordinary quadratic.`
      ],
      answerHtml: raw`
        <p class="step-text">Expand the left-hand side:</p>
        <div class="math-block">
          \[
          (1+2\sqrt{x})(3+2\sqrt{x})=3+6\sqrt{x}+2\sqrt{x}+4x
          \]
          \[
          =4x+8\sqrt{x}+3
          \]
        </div>
        <p class="step-text">Set the two sides equal and simplify:</p>
        <div class="math-block">
          \[
          4x+8\sqrt{x}+3=5+6\sqrt{x}
          \]
          \[
          4x+2\sqrt{x}-2=0
          \]
        </div>
        <p class="step-text">Let \(u=\sqrt{x}\):</p>
        <div class="math-block">
          \[
          4u^2+2u-2=0
          \]
          \[
          u=-1,\ \frac{1}{2}
          \]
        </div>
        <p class="step-text">Since \(u=\sqrt{x}\ge 0\), only \(u=\frac{1}{2}\) is valid. So:</p>
        <div class="math-block">
          \[
          x=\left(\frac{1}{2}\right)^2=\frac{1}{4}
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Expand the left side",
          text: raw`What does the left-hand side simplify to after expanding?`,
          ariaLabel: "Type the expanded left-hand side",
          acceptedAnswers: ["4x+8sqrt(x)+3"],
          samples: [{ x: 1 }, { x: 4 }, { x: 9 }],
          successMessage: raw`Correct. The expanded left-hand side is \(4x+8\sqrt{x}+3\).`,
          genericMessage: raw`Multiply each term carefully, then collect the \(\sqrt{x}\) terms.`
        },
        {
          type: "typed",
          title: "Solve for u",
          text: raw`After letting \(u=\sqrt{x}\), what valid value of \(u\) do you keep?`,
          ariaLabel: "Type the valid value of u",
          acceptedAnswers: ["1/2", "0.5"],
          successMessage: raw`Yes. The quadratic gives \(u=-1\) or \(u=\frac{1}{2}\), but \(u=\sqrt{x}\) cannot be negative.`,
          targetedFeedback: [
            {
              answers: ["-1"],
              message: raw`That value solves the quadratic, but it is not valid because \(u=\sqrt{x}\ge 0\).`
            }
          ],
          genericMessage: raw`Solve \(4u^2+2u-2=0\), then keep only the value that works for \(\sqrt{x}\).`
        },
        {
          type: "typed",
          title: "Find x",
          text: raw`What is the value of \(x\)?`,
          ariaLabel: "Type the value of x",
          acceptedAnswers: ["1/4", "0.25"],
          successMessage: raw`Correct. Since \(u=\sqrt{x}=\frac{1}{2}\), we get \(x=\frac{1}{4}\).`,
          genericMessage: raw`Square the valid value of \(u\).`
        }
      ]
    }),
    "3d": createConfig("3d", "2025 Paper — Cubic with real coefficients", {
      focus: raw`using conjugate roots, factorising a cubic, and matching coefficients to find \(p\) and \(q\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          3z^3 + pz^2 + qz - 8 = 0
          \]
        </div>
        <p class="step-text">One solution is \(z=1+i\). If \(p\) and \(q\) are both real, find the other two solutions of the equation, and the value of both \(p\) and \(q\).</p>
      `,
      hints: [
        raw`Because the coefficients are real, \(1-i\) is also a root.`,
        raw`Multiply the two conjugate factors first.`,
        raw`The remaining factor must combine with that quadratic factor to rebuild the original cubic.`
      ],
      answerHtml: raw`
        <p class="step-text">Since the coefficients are real, the conjugate root \(1-i\) must also be a solution.</p>
        <p class="step-text">Multiply the conjugate factors:</p>
        <div class="math-block">
          \[
          (z-1-i)(z-1+i)=z^2-2z+2
          \]
        </div>
        <p class="step-text">The remaining factor must be \(3z-4\), because the constant term has to be \(-8\):</p>
        <div class="math-block">
          \[
          (z^2-2z+2)(3z-4)=3z^3-10z^2+14z-8
          \]
        </div>
        <p class="step-text">Match coefficients with \(3z^3+pz^2+qz-8\):</p>
        <div class="math-block">
          \[
          p=-10
          \]
          \[
          q=14
          \]
        </div>
        <p class="step-text">So the other two solutions are \(1-i\) and \(\frac{4}{3}\).</p>
      `,
      steps: [
        {
          type: "choice",
          title: "Find the conjugate root",
          text: raw`What other complex root must exist because the coefficients are real?`,
          buttonGridClass: "button-grid",
          choices: [
            {
              html: raw`\(1-i\)`,
              correct: true,
              successMessage: raw`Correct. Complex roots occur in conjugate pairs when the coefficients are real.`
            },
            {
              html: raw`\(-1+i\)`,
              failureMessage: raw`The real part stays the same. Only the sign of the imaginary part changes.`
            },
            {
              html: raw`\(-1-i\)`,
              failureMessage: raw`Not quite. The conjugate of \(1+i\) is \(1-i\).`
            },
            {
              html: raw`\(\frac{4}{3}\)`,
              failureMessage: raw`That is the remaining real root later on, but it is not the conjugate partner of \(1+i\).`
            }
          ]
        },
        {
          type: "typed",
          title: "Multiply the conjugate pair",
          text: raw`What quadratic factor comes from the roots \(1+i\) and \(1-i\)?`,
          ariaLabel: "Type the quadratic factor",
          acceptedAnswers: ["z^2-2z+2"],
          samples: [{ z: 0 }, { z: 2 }, { z: 4 }],
          successMessage: raw`Yes. The conjugate pair gives the factor \(z^2-2z+2\).`,
          genericMessage: raw`Multiply \((z-1-i)(z-1+i)\).`
        },
        {
          type: "typed",
          title: "Find the remaining factor",
          text: raw`What linear factor is left?`,
          ariaLabel: "Type the linear factor",
          acceptedAnswers: ["3z-4"],
          samples: [{ z: 0 }, { z: 2 }, { z: 4 }],
          successMessage: raw`Correct. The remaining factor is \(3z-4\).`,
          genericMessage: raw`Use the constant term \(-8\) and the leading coefficient \(3\) to identify the last factor.`
        },
        {
          type: "typed",
          title: "Find the remaining real root",
          text: raw`What real root comes from that linear factor?`,
          ariaLabel: "Type the remaining real root",
          acceptedAnswers: ["4/3", "1.3333333333333333"],
          successMessage: raw`Correct. So the other two roots are \(1-i\) and \(\frac{4}{3}\).`,
          genericMessage: raw`Set \(3z-4=0\) and solve for \(z\).`
        },
        {
          type: "typed",
          title: "Find p and q",
          text: raw`Type the values of \((p,q)\) in that order.`,
          ariaLabel: "Type the values of p and q",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["-10,14"],
          successMessage: raw`Exactly. Matching coefficients gives \(p=-10\) and \(q=14\).`,
          genericMessage: raw`Expand \((z^2-2z+2)(3z-4)\), then compare the coefficients with \(3z^3+pz^2+qz-8\).`
        }
      ]
    }),
    "3e": createConfig("3e", "2025 Paper — Simultaneous complex equations", {
      focus: raw`writing complex numbers in component form, separating real and imaginary parts, and solving the simultaneous equations.`,
      questionHtml: raw`
        <p class="step-text">Given that \(u\) and \(v\) are both complex numbers, solve the following pair of simultaneous equations, giving solutions in the form \(a+bi\).</p>
        <div class="question-math">
          \[
          ui + 2v = 3
          \]
          \[
          u + (1-i)v = 4
          \]
        </div>
      `,
      questionNotes: [
        raw`When you type coefficient pairs, use \((\text{real part},\text{coefficient of }i)\).`
      ],
      hints: [
        raw`Let \(u=a+bi\) and \(v=c+di\).`,
        raw`Use the first equation to write \(c\) and \(d\) in terms of \(a\) and \(b\).`,
        raw`Substitute those into the second equation, then match real and imaginary parts again.`
      ],
      answerHtml: raw`
        <p class="step-text">Let \(u=a+bi\) and \(v=c+di\). Then the first equation gives:</p>
        <div class="math-block">
          \[
          ai + bi^2 + 2c + 2di = 3
          \]
          \[
          2c + 2di = 3 - ai + b
          \]
          \[
          2c = 3+b,\qquad 2d = -a
          \]
        </div>
        <p class="step-text">So:</p>
        <div class="math-block">
          \[
          c=\frac{3+b}{2},\qquad d=-\frac{a}{2}
          \]
        </div>
        <p class="step-text">Substitute into the second equation and simplify:</p>
        <div class="math-block">
          \[
          4 = a+bi + (1-i)\left(\frac{3+b}{2}-\frac{a}{2}i\right)
          \]
          \[
          5 = a+b + (b-a-3)i
          \]
        </div>
        <p class="step-text">Match real and imaginary parts:</p>
        <div class="math-block">
          \[
          a+b=5
          \]
          \[
          b-a-3=0
          \]
          \[
          a=1,\qquad b=4
          \]
        </div>
        <p class="step-text">So:</p>
        <div class="math-block">
          \[
          u=1+4i
          \]
          \[
          v=\frac{3+4}{2}-\frac{1}{2}i=\frac{7}{2}-\frac{1}{2}i
          \]
        </div>
      `,
      steps: [
        {
          type: "typed",
          title: "Use the real parts from the first equation",
          text: raw`After letting \(u=a+bi\) and \(v=c+di\), what equation do the real parts give?`,
          ariaLabel: "Type the real-parts equation",
          mode: "equation",
          acceptedAnswers: ["2c=3+b"],
          samples: [{ a: 1, b: 4, c: 3.5, d: -0.5 }, { a: 2, b: 1, c: 2, d: -1 }, { a: -1, b: 3, c: 3, d: 0.5 }],
          successMessage: raw`Correct. The real parts from \(ui+2v=3\) give \(2c=3+b\).`,
          genericMessage: raw`Remember that \(bi^2=-b\), which affects the real part.`
        },
        {
          type: "typed",
          title: "Use the imaginary parts from the first equation",
          text: raw`What equation do the imaginary parts give?`,
          ariaLabel: "Type the imaginary-parts equation",
          mode: "equation",
          acceptedAnswers: ["2d=-a"],
          samples: [{ a: 1, b: 4, c: 3.5, d: -0.5 }, { a: 2, b: 1, c: 2, d: -1 }, { a: -1, b: 3, c: 3, d: 0.5 }],
          successMessage: raw`Yes. The imaginary coefficient is \(a+2d\), and that must be \(0\), so \(2d=-a\).`,
          genericMessage: raw`Match the coefficient of \(i\) with the right-hand side, which has no imaginary part.`
        },
        {
          type: "typed",
          title: "Find u",
          text: raw`After substituting into the second equation, what are the coefficients of \(u\)? Type \((a,b)\).`,
          ariaLabel: "Type the coefficients of u",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["1,4"],
          successMessage: raw`Correct. Solving \(a+b=5\) and \(b-a-3=0\) gives \(a=1\) and \(b=4\), so \(u=1+4i\).`,
          targetedFeedback: [
            {
              answers: ["4,1"],
              mode: "list",
              options: orderedListOptions,
              message: raw`Watch the order. Type \((a,b)\), not \((b,a)\).`
            }
          ],
          genericMessage: raw`Use the second equation to get \(a+b=5\) and \(b-a-3=0\), then solve the two linear equations.`
        },
        {
          type: "typed",
          title: "Find v",
          text: raw`Now type the coefficients of \(v\) as \((c,d)\).`,
          ariaLabel: "Type the coefficients of v",
          mode: "list",
          options: orderedListOptions,
          previewOptions: wrappedListPreview,
          acceptedAnswers: ["7/2,-1/2", "3.5,-0.5"],
          successMessage: raw`Exactly. Substituting \(a=1\) and \(b=4\) gives \(v=\frac{7}{2}-\frac{1}{2}i\).`,
          targetedFeedback: [
            {
              answers: ["-1/2,7/2"],
              mode: "list",
              options: orderedListOptions,
              message: raw`Those values belong to \(d\) and \(c\), but the order should be \((c,d)\).`
            }
          ],
          genericMessage: raw`Use \(c=\frac{3+b}{2}\) and \(d=-\frac{a}{2}\) with \(a=1\) and \(b=4\).`
        }
      ]
    })
  };
}());
