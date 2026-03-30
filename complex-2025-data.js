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
  const complexPairListOptions = Object.assign({}, orderedListOptions, {
    allowComplexInput: true
  });
  const unorderedListOptions = {
    ordered: false,
    stripOuterParens: true
  };
  const wrappedListPreview = {
    wrapWithParens: true
  };

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
    return calloutBox("tip", "Keep Thinking", text);
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
      focus: raw`recognising a remainder-theorem question, substituting \(x=2\), and solving the resulting linear equation in \(p\).`,
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
        raw`Because the divisor is \(x-2\), the remainder theorem tells us to look at \(f(2)\).`,
        raw`Substitute \(x=2\) everywhere in the polynomial.`,
        raw`The output must be \(21\), so solve the linear equation that appears.`
      ],
      answerHtml: raw`
        <p class="step-text">This is a remainder-theorem question, so we do not need long division here.</p>
        <div class="math-block">
          \[
          f(2)=21
          \]
        </div>
        <p class="step-text">Substitute \(x=2\) into the polynomial:</p>
        <div class="math-block">
          \[
          3(2)^4+p(2)^3-4(2)+5=21
          \]
          \[
          48+8p-8+5=21
          \]
          \[
          45+8p=21
          \]
          \[
          8p=-24
          \]
          \[
          p=-3
          \]
        </div>
        ${answerBox(raw`
          \[
          p=-3
          \]
        `)}
      `,
      steps: [
        choiceStep("Choose the method", raw`Should we use the remainder theorem or the factor theorem here?`, [
          correctChoice(raw`Use the Remainder Theorem.`, raw`Yes. We are given a remainder, not a factor, so this is a remainder-theorem question.`),
          wrongChoice(raw`Use the Factor Theorem.`, raw`Not here. The factor theorem is for a remainder of \(0\).`),
          wrongChoice(raw`Use long division straight away.`, raw`You could, but the remainder theorem is the cleaner idea the question is pointing you toward.`),
          wrongChoice(raw`Differentiate the polynomial first.`, raw`Differentiation does not help with a remainder question.`)
        ]),
        choiceStep("Interpret the remainder", raw`If the polynomial is divided by \(x-2\) and leaves a remainder of \(21\), what does that tell us?`, [
          correctChoice(raw`\(\,f(2)=21\)`, raw`Exactly. Dividing by \(x-2\) means we test \(x=2\), so the output must be \(21\).`),
          wrongChoice(raw`\(\,f(-2)=21\)`, raw`The divisor is \(x-2\), so the matching value is \(x=2\), not \(-2\).`),
          wrongChoice(raw`\(\,f(21)=2\)`, raw`That swaps the roles around. We substitute the divisor root, not the remainder.`),
          wrongChoice(raw`\(\,f(2)=0\)`, raw`That would only happen if \(x-2\) were a factor.`)
        ]),
        choiceStep("Substitute carefully", raw`What expression do we get when we substitute \(x=2\) into the polynomial?`, [
          correctChoice(raw`\(\,3(2)^4+p(2)^3-4(2)+5\)`, raw`Good. Every \(x\) becomes \(2\), so that is the correct substitution.`),
          wrongChoice(raw`\(\,3(2)^4+p(2)^4-4(2)+5\)`, raw`The power on the \(p\)-term stays \(3\), because the term is \(px^3\).`),
          wrongChoice(raw`\(\,3(2)^4+p(2)^3+4(2)+5\)`, raw`Watch the sign on the linear term. The polynomial has \(-4x\).`),
          wrongChoice(raw`\(\,3(2)^3+p(2)^3-4(2)+5\)`, raw`The first term is \(3x^4\), so it must become \(3(2)^4\).`)
        ]),
        choiceStep("Evaluate the output", raw`What does that simplify to?`, [
          correctChoice(raw`\(\,45+8p\)`, raw`Yes. \(3(2)^4+p(2)^3-4(2)+5=48+8p-8+5=45+8p\).`),
          wrongChoice(raw`\(\,53+8p\)`, raw`Check the constant part again: \(48-8+5=45\), not \(53\).`),
          wrongChoice(raw`\(\,45+2p\)`, raw`The \(px^3\) term gives \(8p\), because \(2^3=8\).`),
          wrongChoice(raw`\(\,21+8p\)`, raw`The remainder \(21\) is what we set the output equal to later. It is not the simplification itself.`)
        ]),
        choiceStep("Use the remainder", raw`What equation should we solve now?`, [
          correctChoice(raw`\(\,45+8p=21\)`, raw`Exactly. The polynomial output must equal the stated remainder \(21\).`),
          wrongChoice(raw`\(\,45+8p=0\)`, raw`A remainder question does not automatically give \(0\).`),
          wrongChoice(raw`\(\,45+8p=2\)`, raw`We substitute \(x=2\), but the output is the remainder \(21\).`),
          wrongChoice(raw`\(\,45+8p=45\)`, raw`That would ignore the remainder condition completely.`)
        ]),
        choiceStep("Finish the solve", raw`What value of \(p\) does that give?`, [
          correctChoice(raw`\(\,p=-3\)`, raw`Correct. From \(45+8p=21\), we get \(8p=-24\), so \(p=-3\).`),
          wrongChoice(raw`\(\,p=3\)`, raw`The sign should be negative because \(21-45=-24\).`),
          wrongChoice(raw`\(\,p=-24\)`, raw`That is \(8p\), not \(p\). We still need to divide by \(8\).`),
          wrongChoice(raw`\(\,p=-\frac{45}{8}\)`, raw`That would come from ignoring the \(21\) on the right-hand side.`)
        ])
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
        choiceStep("Identify the equation type", raw`What type of equation is this in \(x\)?`, [
          correctChoice(raw`A quadratic equation.`, raw`Yes. The highest power of \(x\) is \(2\), so we are solving a quadratic.`),
          wrongChoice(raw`A linear equation.`, raw`A linear equation would only have \(x\) to the first power.`),
          wrongChoice(raw`A cubic equation.`, raw`There is no \(x^3\) term here.`),
          wrongChoice(raw`A modulus equation.`, raw`There is no modulus sign in this question.`)
        ]),
        choiceStep("Check the structure", raw`Is the left-hand side already a perfect square?`, [
          correctChoice(raw`No, because \((x-3k)^2=x^2-6kx+9k^2\).`, raw`Exactly. We are missing the \(+9k^2\) needed to make a perfect square.`),
          wrongChoice(raw`Yes, it is already \((x-3k)^2\).`, raw`Close, but \((x-3k)^2\) would include \(+9k^2\) as well.`),
          wrongChoice(raw`Yes, it is already \((x+3k)^2\).`, raw`\((x+3k)^2\) would give a positive middle term, so that cannot match.`),
          wrongChoice(raw`It cannot be solved because \(k\) is in the equation.`, raw`We can still solve in terms of \(k\).`)
        ]),
        choiceStep("Choose the clean method", raw`So what is the most helpful method here?`, [
          correctChoice(raw`Complete the square.`, raw`Yes. The expression is almost a perfect square, so completing the square is the natural move.`),
          wrongChoice(raw`Use the factor theorem.`, raw`This is not a polynomial remainder/factor question.`),
          wrongChoice(raw`Differentiate both sides.`, raw`Differentiation is not part of solving this quadratic.`),
          wrongChoice(raw`Convert everything to polar form.`, raw`That belongs to complex-number questions, not this quadratic.`)
        ]),
        choiceStep("Make the perfect square", raw`What should we add to both sides to complete the square?`, [
          correctChoice(raw`\(\,9k^2\)`, raw`Right. Half the coefficient of \(x\) is \(-3k\), and squaring that gives \(9k^2\).`),
          wrongChoice(raw`\(\,6k\)`, raw`We square half the middle coefficient. We do not just reuse the coefficient.`),
          wrongChoice(raw`\(\,3k^2\)`, raw`Half the middle term is \(-3k\), and then we square it.`),
          wrongChoice(raw`\(\,k^2\)`, raw`That is not enough to make the left-hand side a perfect square.`)
        ]),
        choiceStep("Factorise the left side", raw`What does the equation become after completing the square?`, [
          correctChoice(raw`\(\,(x-3k)^2=10k^2\)`, raw`Exactly. Adding \(9k^2\) to both sides gives \((x-3k)^2=k^2+9k^2=10k^2\).`),
          wrongChoice(raw`\(\,(x+3k)^2=10k^2\)`, raw`The sign inside the bracket must match the middle term \(-6kx\).`),
          wrongChoice(raw`\(\,(x-3k)^2=8k^2\)`, raw`The right-hand side is \(k^2+9k^2=10k^2\).`),
          wrongChoice(raw`\(\,(x-9k)^2=10k^2\)`, raw`The bracket comes from halving the middle coefficient, not from the added term directly.`)
        ]),
        choiceStep("Solve for x", raw`What are the solutions for \(x\)?`, [
          correctChoice(raw`\(\,x=3k\pm k\sqrt{10}\)`, raw`Correct. Take square roots, then add \(3k\) to both sides.`),
          wrongChoice(raw`\(\,x=3k\pm 10k\)`, raw`We take the square root of \(10k^2\), so the surd stays as \(\sqrt{10}\).`),
          wrongChoice(raw`\(\,x=-3k\pm k\sqrt{10}\)`, raw`Once we take square roots, we add \(3k\) to both sides, so the base term is positive.`),
          wrongChoice(raw`\(\,x=\pm 10k\)`, raw`That skips the shift coming from \((x-3k)^2\).`)
        ])
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
        choiceStep("Spot the proof idea", raw`What condition on a quadratic guarantees real roots?`, [
          correctChoice(raw`A positive discriminant.`, raw`Yes. If the discriminant is positive, the quadratic has real roots.`),
          wrongChoice(raw`A negative discriminant.`, raw`A negative discriminant gives complex roots, not real ones.`),
          wrongChoice(raw`A zero coefficient of \(x\).`, raw`That changes the equation, but it is not the general test for real roots.`),
          wrongChoice(raw`A positive constant term.`, raw`The sign of the constant alone does not decide whether the roots are real.`)
        ]),
        choiceStep("Rewrite in standard form", raw`After multiplying through by \(k\) and rearranging, which quadratic do we get?`, [
          correctChoice(raw`\(\,k^3x^2+x-3k=0\)`, raw`Correct. Multiplying by \(k\) clears the denominator and gives \(k^3x^2+x-3k=0\).`),
          wrongChoice(raw`\(\,k^2x^2+x-3k=0\)`, raw`The left side becomes \(k(kx)^2=k^3x^2\), not \(k^2x^2\).`),
          wrongChoice(raw`\(\,k^3x^2-x+3k=0\)`, raw`Watch the signs when you move everything to one side.`),
          wrongChoice(raw`\(\,k^3x^2+3k-x=0\)`, raw`That is not fully rearranged into standard quadratic form.`)
        ]),
        choiceStep("Identify \(a\), \(b\), and \(c\)", raw`What are the coefficients in \(ax^2+bx+c=0\)?`, [
          correctChoice(raw`\(\,a=k^3,\ b=1,\ c=-3k\)`, raw`Exactly. That is the correct match for \(k^3x^2+x-3k=0\).`),
          wrongChoice(raw`\(\,a=k^2,\ b=1,\ c=-3k\)`, raw`The coefficient of \(x^2\) is \(k^3\), not \(k^2\).`),
          wrongChoice(raw`\(\,a=k^3,\ b=-1,\ c=3k\)`, raw`Those signs do not match the rearranged quadratic.`),
          wrongChoice(raw`\(\,a=1,\ b=k^3,\ c=-3k\)`, raw`\(a\) is the coefficient of \(x^2\), not the constant coefficient of the middle term.`)
        ]),
        choiceStep("Substitute into the discriminant", raw`Which expression correctly substitutes into \(b^2-4ac\)?`, [
          correctChoice(raw`\(\,1^2-4(k^3)(-3k)\)`, raw`Yes. That is the discriminant with the correct values of \(a\), \(b\), and \(c\).`),
          wrongChoice(raw`\(\,1^2+4(k^3)(-3k)\)`, raw`The formula is \(b^2-4ac\), so keep the minus and let the negative \(c\) handle the sign.`),
          wrongChoice(raw`\(\,k^6-12k\)`, raw`That is not what you get from \(b^2-4ac\).`),
          wrongChoice(raw`\(\,1^2-4(k^2)(-3k)\)`, raw`The \(a\)-value should still be \(k^3\).`)
        ]),
        choiceStep("Simplify the discriminant", raw`What does the discriminant simplify to?`, [
          correctChoice(raw`\(\,1+12k^4\)`, raw`Right. The product \(-4(k^3)(-3k)\) simplifies to \(+12k^4\).`),
          wrongChoice(raw`\(\,1-12k^4\)`, raw`Two negatives multiply to a positive here.`),
          wrongChoice(raw`\(\,1+12k^3\)`, raw`The powers multiply to \(k^4\), not \(k^3\).`),
          wrongChoice(raw`\(\,12k^4\)`, raw`Do not lose the \(1\) from \(b^2\).`)
        ]),
        choiceStep("Finish the argument", raw`Why is that enough to prove the roots are real for every real \(k\)?`, [
          correctChoice(raw`\(\,k^4\ge 0\) for real \(k\), so \(1+12k^4>0\).`, raw`Exactly. The discriminant is always positive, so the equation has real roots for every real \(k\neq 0\).`),
          wrongChoice(raw`\(\,k^4\le 0\) for real \(k\), so the discriminant is negative.`, raw`Real numbers raised to the fourth power are never negative.`),
          wrongChoice(raw`Because the discriminant is sometimes zero.`, raw`Here the point is stronger: \(1+12k^4\) is always positive.`),
          wrongChoice(raw`Because \(k\neq 0\) means \(x\) must be real.`, raw`The conclusion comes from the discriminant, not directly from \(k\neq 0\).`)
        ])
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
        choiceStep("Start with the power", raw`What should we do first?`, [
          correctChoice(raw`Isolate \(z^3\).`, raw`Yes. We want \(z^3\) on its own before we use polar form and cube roots.`),
          wrongChoice(raw`Cube both sides immediately.`, raw`We need a clean expression for \(z^3\) first.`),
          wrongChoice(raw`Differentiate the equation.`, raw`This is a complex-number root question, not a calculus step.`),
          wrongChoice(raw`Set the expression equal to zero again.`, raw`It is already equal to zero; the next move is to isolate \(z^3\).`)
        ]),
        choiceStep("Rearrange the equation", raw`What does that give us?`, [
          correctChoice(raw`\(\,z^3=-8m^{27}i\)`, raw`Correct. Now the right-hand side is one complex number we can rewrite in polar form.`),
          wrongChoice(raw`\(\,z^3=8m^{27}i\)`, raw`Moving \(8m^{27}i\) to the other side changes its sign.`),
          wrongChoice(raw`\(\,z=-8m^{27}i\)`, raw`Only the constant term moves. The power on \(z\) stays \(3\).`),
          wrongChoice(raw`\(\,z^3=8m^9i\)`, raw`Nothing has been cube-rooted yet.`)
        ]),
        choiceStep("Read the direction", raw`What does the argument of \(-8m^{27}i\) tell us about where this number lies?`, [
          correctChoice(raw`It points straight down the negative imaginary axis.`, raw`Exactly. The number is a negative multiple of \(i\), so it lies in the \(-i\) direction.`),
          wrongChoice(raw`It lies on the positive real axis.`, raw`There is no real part here.`),
          wrongChoice(raw`It lies on the positive imaginary axis.`, raw`The sign is negative, so it points down, not up.`),
          wrongChoice(raw`It lies in the first quadrant.`, raw`Pure imaginary numbers lie on an axis, not inside a quadrant.`)
        ]),
        choiceStep("Choose the argument", raw`Which principal argument should we use?`, [
          correctChoice(raw`\(\,-\frac{\pi}{2}\)`, raw`Yes. The principal argument of \(-i\) is \(-\frac{\pi}{2}\).`),
          wrongChoice(raw`\(\,\frac{\pi}{2}\)`, raw`That would be the argument of \(+i\).`),
          wrongChoice(raw`\(\,\pi\)`, raw`\(\pi\) points left along the negative real axis, not down.`),
          wrongChoice(raw`\(\,0\)`, raw`An argument of \(0\) points along the positive real axis.`)
        ]),
        choiceStep("Find the modulus", raw`What is the modulus of \(-8m^{27}i\)?`, [
          correctChoice(raw`\(\,8m^{27}\)`, raw`Right. The modulus is the size of the number, so the negative sign only affects the argument.`),
          wrongChoice(raw`\(\,-8m^{27}\)`, raw`Modulus is always non-negative.`),
          wrongChoice(raw`\(\,2m^9\)`, raw`That is the cube-root modulus, not the modulus of \(z^3\).`),
          wrongChoice(raw`\(\,27m^8\)`, raw`We do not differentiate or expand the power here.`)
        ]),
        choiceStep("Write \(z^3\) in polar form", raw`Which polar form is correct?`, [
          correctChoice(raw`\(\,z^3=8m^{27}\operatorname{cis}\left(-\frac{\pi}{2}\right)\)`, raw`Exactly. We now have modulus and argument ready for De Moivre.`),
          wrongChoice(raw`\(\,z^3=8m^{27}\operatorname{cis}\left(\frac{\pi}{2}\right)\)`, raw`The argument needs to point down the negative imaginary axis.`),
          wrongChoice(raw`\(\,z^3=2m^9\operatorname{cis}\left(-\frac{\pi}{6}\right)\)`, raw`That is already part of the cube-root step.`),
          wrongChoice(raw`\(\,z=8m^{27}\operatorname{cis}\left(-\frac{\pi}{2}\right)\)`, raw`That still describes \(z^3\), not \(z\).`)
        ]),
        choiceStep("Take the cube roots", raw`How do we write the cube roots of this number?`, [
          correctChoice(raw`\(\,z=2m^9\operatorname{cis}\left(\frac{2k\pi}{3}-\frac{\pi}{6}\right)\)`, raw`Yes. Cube roots divide the argument by \(3\) and use \(k=0,1,2\) for the three solutions.`),
          wrongChoice(raw`\(\,z=8m^{27}\operatorname{cis}\left(\frac{2k\pi}{3}-\frac{\pi}{6}\right)\)`, raw`The modulus also needs to be cube-rooted.`),
          wrongChoice(raw`\(\,z=2m^9\operatorname{cis}\left(2k\pi-\frac{\pi}{6}\right)\)`, raw`We divide the whole argument by \(3\), including the periodic part.`),
          wrongChoice(raw`\(\,z=2m^9\operatorname{cis}\left(\frac{2k\pi}{9}-\frac{\pi}{2}\right)\)`, raw`Only the angle is divided by \(3\), and the original angle is \(-\frac{\pi}{2}\).`)
        ]),
        choiceStep("Finish with the three roots", raw`Which list gives all three solutions in polar form?`, [
          correctChoice(
            raw`\(\,2m^9\operatorname{cis}\left(-\frac{\pi}{6}\right),\ 2m^9\operatorname{cis}\left(\frac{\pi}{2}\right),\ 2m^9\operatorname{cis}\left(-\frac{5\pi}{6}\right)\)`,
            raw`Correct. Using \(k=0,1,2\) gives those three cube roots, with the third angle rewritten as a principal value.`
          ),
          wrongChoice(raw`\(\,2m^9\operatorname{cis}\left(-\frac{\pi}{2}\right),\ 2m^9\operatorname{cis}(0),\ 2m^9\operatorname{cis}\left(\frac{\pi}{2}\right)\)`, raw`Those angles are spaced by \(\frac{\pi}{2}\), not by the \(\frac{2\pi}{3}\) pattern for cube roots.`),
          wrongChoice(raw`\(\,8m^{27}\operatorname{cis}\left(-\frac{\pi}{6}\right),\ 8m^{27}\operatorname{cis}\left(\frac{\pi}{2}\right),\ 8m^{27}\operatorname{cis}\left(\frac{7\pi}{6}\right)\)`, raw`The arguments are close, but the modulus should be \(2m^9\), not \(8m^{27}\).`),
          wrongChoice(raw`\(\,2m^9\operatorname{cis}\left(-\frac{\pi}{6}\right),\ 2m^9\operatorname{cis}\left(\frac{\pi}{6}\right),\ 2m^9\operatorname{cis}\left(\frac{5\pi}{6}\right)\)`, raw`The step size between cube-root arguments should be \(\frac{2\pi}{3}\).`)
        ])
      ]
    }),
    "1e": createConfig("1e", "2025 Paper — Locus to Cartesian form", {
      focus: raw`recognising a restricted-modulus locus, rewriting \(z=x+yi\), isolating surds carefully, and simplifying to the required Cartesian form.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \left|z-5i\right|-\left|z+5i\right|=4
          \]
        </div>
        <p class="step-text">Find the Cartesian equation of the locus of \(z\), giving your answer in the form \(ay^2-bx^2=k\), where \(a\), \(b\), and \(k\) are constants.</p>
      `,
      hints: [
        raw`Start by recognising the question type, then let \(z=x+yi\).`,
        raw`Turn each modulus into a square root using Pythagoras.`,
        raw`Before you square, isolate one surd. After the first squaring, simplify before doing the second one.`
      ],
      answerHtml: raw`
        <p class="step-text">Let \(z=x+yi\), then separate the real and imaginary parts inside each modulus:</p>
        <div class="math-block">
          \[
          |x+yi-5i|-|x+yi+5i|=4
          \]
          \[
          |x+(y-5)i|-|x+(y+5)i|=4
          \]
        </div>
        <p class="step-text">Now turn the moduli into distances:</p>
        <div class="math-block">
          \[
          \sqrt{x^2+(y-5)^2}-\sqrt{x^2+(y+5)^2}=4
          \]
          \[
          \sqrt{x^2+(y-5)^2}=4+\sqrt{x^2+(y+5)^2}
          \]
        </div>
        <p class="step-text">Square once, but square whole sides:</p>
        <div class="math-block">
          \[
          x^2+(y-5)^2 = 16+8\sqrt{x^2+(y+5)^2}+x^2+(y+5)^2
          \]
          \[
          (y-5)^2-(y+5)^2 = 16+8\sqrt{x^2+(y+5)^2}
          \]
          \[
          -20y = 16+8\sqrt{x^2+(y+5)^2}
          \]
          \[
          -5y-4=2\sqrt{x^2+(y+5)^2}
          \]
        </div>
        <p class="step-text">Square again and expand the remaining bracket carefully:</p>
        <div class="math-block">
          \[
          (-5y-4)^2=4\left(x^2+(y+5)^2\right)
          \]
          \[
          16+25y^2+40y=4x^2+4(y^2+10y+25)
          \]
          \[
          16+25y^2+40y=4x^2+4y^2+40y+100
          \]
          \[
          21y^2-4x^2=84
          \]
        </div>
        ${answerBox(raw`
          \[
          21y^2-4x^2=84
          \]
        `)}
      `,
      steps: [
        choiceStep("Identify the question type", raw`What kind of complex-number question is this?`, [
          correctChoice(raw`A restricted-modulus locus.`, raw`Yes. The modulus signs tell us this is a locus built from distances in the Argand plane.`),
          wrongChoice(raw`A remainder-theorem question.`, raw`There is no polynomial division or remainder here.`),
          wrongChoice(raw`A De Moivre question.`, raw`There is no power of a complex number to rewrite in polar form.`),
          wrongChoice(raw`A conjugate-roots question.`, raw`This is about a locus, not roots of an equation.`)
        ]),
        choiceStep("Rewrite \(z\)", raw`To separate the real and imaginary parts, how should we write \(z\)?`, [
          correctChoice(raw`\(\,z=x+yi\)`, raw`Exactly. Writing \(z=x+yi\) lets us turn each modulus into a distance formula.`),
          wrongChoice(raw`\(\,z=r\operatorname{cis}\theta\)`, raw`Polar form is not the most helpful start for a Cartesian locus.`),
          wrongChoice(raw`\(\,z=x+y\)`, raw`We need the imaginary unit \(i\) in the complex form.`),
          wrongChoice(raw`\(\,z=i(x+y)\)`, raw`That would not separate the real and imaginary parts correctly.`)
        ]),
        choiceStep("Substitute into the locus", raw`Which equation shows \(z=x+yi\) substituted correctly?`, [
          correctChoice(raw`\(\,|x+yi-5i|-|x+yi+5i|=4\)`, raw`Yes. That is the direct substitution before we tidy the imaginary parts.`),
          wrongChoice(raw`\(\,|x+y-5|-|x+y+5|=4\)`, raw`This loses the imaginary unit completely.`),
          wrongChoice(raw`\(\,|x+(y-5)|-|x+(y+5)|=4\)`, raw`The imaginary parts still need the \(i\).`),
          wrongChoice(raw`\(\,|x-5i|-|y+5i|=4\)`, raw`That splits one complex number into two unrelated pieces.`)
        ]),
        choiceStep("Separate real and imaginary parts", raw`What is the cleaner form of the two complex numbers inside the moduli?`, [
          correctChoice(raw`\(\,|x+(y-5)i|-|x+(y+5)i|=4\)`, raw`Good. Now the real distance is \(x\) and the imaginary distances are \(y-5\) and \(y+5\).`),
          wrongChoice(raw`\(\,|(x-5)+yi|-|(x+5)+yi|=4\)`, raw`The \(\pm 5\) changes the imaginary part, not the real part.`),
          wrongChoice(raw`\(\,|x+yi|-|x+yi|=4\)`, raw`That would ignore the shifts by \(5i\).`),
          wrongChoice(raw`\(\,|x-(y-5)i|-|x-(y+5)i|=4\)`, raw`The first complex number is \(x+(y-5)i\), not \(x-(y-5)i\).`)
        ]),
        choiceStep("Turn moduli into square roots", raw`What equation do we get using Pythagoras?`, [
          correctChoice(raw`\(\,\sqrt{x^2+(y-5)^2}-\sqrt{x^2+(y+5)^2}=4\)`, raw`Exactly. Each modulus becomes a distance from the origin in terms of \(x\) and \(y\).`),
          wrongChoice(raw`\(\,\sqrt{x^2+y^2-25}-\sqrt{x^2+y^2+25}=4\)`, raw`The vertical shifts stay inside the brackets as \(y-5\) and \(y+5\).`),
          wrongChoice(raw`\(\,x^2+(y-5)^2-x^2-(y+5)^2=4\)`, raw`We need square roots because modulus is a distance, not a squared distance.`),
          wrongChoice(raw`\(\,\sqrt{x+(y-5)^2}-\sqrt{x+(y+5)^2}=4\)`, raw`The real distance contributes \(x^2\), not \(x\).`)
        ]),
        choiceStep("Prepare for squaring", raw`What should we do before we square?`, [
          correctChoice(raw`Move one surd to the other side.`, raw`Yes. Isolating one surd keeps the next line much cleaner.`),
          wrongChoice(raw`Square each individual term.`, raw`Not yet, and not term-by-term. We square whole sides.`),
          wrongChoice(raw`Expand \((y-5)^2\) and \((y+5)^2\) immediately.`, raw`That comes after we isolate the surd and square the equation.`),
          wrongChoice(raw`Replace \(x\) with \(r\cos\theta\).`, raw`The question wants a Cartesian equation, so stay in \(x\) and \(y\).`)
        ], {
          beforeHtml: raw`
            <div class="math-block">
              \[
              \sqrt{x^2+(y-5)^2}-\sqrt{x^2+(y+5)^2}=4
              \]
            </div>
          `
        }),
        choiceStep("Square whole sides", raw`Which equation is correct after moving one surd and squaring once?`, [
          correctChoice(raw`\(\,x^2+(y-5)^2=16+8\sqrt{x^2+(y+5)^2}+x^2+(y+5)^2\)`, raw`Correct. The whole right-hand side is a binomial, so it squares to \(4^2+2\cdot 4\cdot \sqrt{\cdots}+(\sqrt{\cdots})^2\).`),
          wrongChoice(raw`\(\,x^2+(y-5)^2=16+x^2+(y+5)^2\)`, raw`That misses the middle term from squaring \((4+\sqrt{\cdots})^2\).`),
          wrongChoice(raw`\(\,x^2+(y-5)^2=4^2+x^2+(y+5)^2\)`, raw`We still need the \(2ab\) term when squaring the binomial.`),
          wrongChoice(raw`\(\,x^2+(y-5)^2=16+8x^2+8(y+5)^2\)`, raw`The middle term should involve the square root, not distribute across the inside.`)
        ], {
          beforeHtml: raw`
            <div class="math-block">
              \[
              \sqrt{x^2+(y-5)^2}=4+\sqrt{x^2+(y+5)^2}
              \]
            </div>
          `
        }),
        choiceStep("Simplify before the second squaring", raw`What does the equation reduce to after cancelling the common terms and simplifying the left side?`, [
          correctChoice(raw`\(\,-20y=16+8\sqrt{x^2+(y+5)^2}\)`, raw`Yes. Subtracting \((y+5)^2\) is the smart move, because \((y-5)^2-(y+5)^2=-20y\).`),
          wrongChoice(raw`\(\,20y=16+8\sqrt{x^2+(y+5)^2}\)`, raw`The left side simplifies to \(-20y\), not \(+20y\).`),
          wrongChoice(raw`\(\,-20y=8\sqrt{x^2+(y+5)^2}\)`, raw`Do not lose the constant \(16\).`),
          wrongChoice(raw`\(\,-10y=16+8\sqrt{x^2+(y+5)^2}\)`, raw`Check the expansion of \((y-5)^2-(y+5)^2\) again.`)
        ]),
        choiceStep("Square a second time", raw`After isolating the surd and squaring again, which line is the right one to expand?`, [
          correctChoice(raw`\(\,16+25y^2+40y=4\left(x^2+(y+5)^2\right)\)`, raw`Exactly. Dividing by \(4\) and isolating the surd first keeps the second squaring tidy.`),
          wrongChoice(raw`\(\,25y^2+16=4x^2+4(y+5)^2\)`, raw`The \(40y\) term from \((-5y-4)^2\) is missing.`),
          wrongChoice(raw`\(\,16+25y^2+40y=2\left(x^2+(y+5)^2\right)\)`, raw`The right side is \(2\sqrt{\cdots}\), so squaring gives a factor of \(4\).`),
          wrongChoice(raw`\(\,(-5y-4)^2=2\left(x^2+(y+5)^2\right)\)`, raw`Squaring \(2\sqrt{\cdots}\) gives \(4(\cdots)\), not \(2(\cdots)\).`)
        ], {
          beforeHtml: raw`
            <div class="math-block">
              \[
              -20y=16+8\sqrt{x^2+(y+5)^2}
              \]
              \[
              -5y-4=2\sqrt{x^2+(y+5)^2}
              \]
            </div>
          `
        }),
        choiceStep("Finish in Cartesian form", raw`What is the final Cartesian equation of the locus?`, [
          correctChoice(raw`\(\,21y^2-4x^2=84\)`, raw`Correct. Expanding the final bracket and cancelling the common \(40y\) terms gives \(21y^2-4x^2=84\).`),
          wrongChoice(raw`\(\,21x^2-4y^2=84\)`, raw`The question wants the locus in terms of \(y^2\) minus \(x^2\), and the working leads to that order.`),
          wrongChoice(raw`\(\,25y^2-4x^2=84\)`, raw`Four of the \(y^2\) terms cancel when you expand the right-hand side.`),
          wrongChoice(raw`\(\,21y^2+4x^2=84\)`, raw`The \(4x^2\) term moves across with a negative sign.`)
        ])
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
        raw`Read each plotted point as \((\text{real part},\text{imaginary part})\), then convert back to \(a+bi\) when needed.`
      ],
      hints: [
        raw`Read \(u\) and \(w\) from the diagram first: each point gives a real coordinate and an imaginary coordinate.`,
        raw`Find \(2u\) and \(3w\) separately before you add them.`,
        raw`Once you have \(z\), place it at \((2,-5)\) on the diagram.`
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
        ${answerBox(raw`
          \[
          z=2-5i
          \]
        `)}
      `,
      steps: [
        choiceStep("Read \(u\)", raw`What are the coordinates of \(u\)?`, [
          correctChoice(raw`\(\,u=4+2i\)`, raw`Correct. The point \(u\) is at \((4,2)\), so \(u=4+2i\).`),
          wrongChoice(raw`\(\,u=2+4i\)`, raw`Watch the order: real part first, imaginary part second.`),
          wrongChoice(raw`\(\,u=4-2i\)`, raw`The point is above the real axis, so the imaginary part is positive.`),
          wrongChoice(raw`\(\,u=-4+2i\)`, raw`The point is to the right of the origin, so the real part is positive.`)
        ]),
        choiceStep("Read \(w\)", raw`What are the coordinates of \(w\)?`, [
          correctChoice(raw`\(\,w=-2-3i\)`, raw`Yes. The point \(w\) is left \(2\) and down \(3\), so \(w=-2-3i\).`),
          wrongChoice(raw`\(\,w=-3-2i\)`, raw`The real part is \(-2\) and the imaginary part is \(-3\).`),
          wrongChoice(raw`\(\,w=2-3i\)`, raw`The point is to the left of the origin, so the real part is negative.`),
          wrongChoice(raw`\(\,w=-2+3i\)`, raw`The point is below the real axis, so the imaginary part is negative.`)
        ]),
        choiceStep("Scale \(u\)", raw`What is \(2u\)?`, [
          correctChoice(raw`\(\,2u=8+4i\)`, raw`Exactly. Multiply both the real and imaginary parts of \(u\) by \(2\).`),
          wrongChoice(raw`\(\,2u=6+2i\)`, raw`Both parts need to be doubled.`),
          wrongChoice(raw`\(\,2u=8+2i\)`, raw`The imaginary part should double as well.`),
          wrongChoice(raw`\(\,2u=4+4i\)`, raw`The real part should also double.`)
        ]),
        choiceStep("Scale \(w\)", raw`What is \(3w\)?`, [
          correctChoice(raw`\(\,3w=-6-9i\)`, raw`Right. Multiplying \(-2-3i\) by \(3\) gives \(-6-9i\).`),
          wrongChoice(raw`\(\,3w=-5-6i\)`, raw`Multiply both parts by \(3\), not just adjust them a little.`),
          wrongChoice(raw`\(\,3w=-6+9i\)`, raw`The imaginary part stays negative.`),
          wrongChoice(raw`\(\,3w=-3-9i\)`, raw`The real part should be \(-6\), because \(3\times -2=-6\).`)
        ]),
        choiceStep("Add the two results", raw`What do we get when we add \(2u\) and \(3w\)?`, [
          correctChoice(raw`\(\,z=2-5i\)`, raw`Yes. Adding the real parts gives \(2\), and adding the imaginary parts gives \(-5\).`),
          wrongChoice(raw`\(\,z=-2+5i\)`, raw`Check the signs carefully when you combine the coordinates.`),
          wrongChoice(raw`\(\,z=14+13i\)`, raw`That adds the sizes without accounting for the negative parts.`),
          wrongChoice(raw`\(\,z=2+5i\)`, raw`The imaginary part should be negative: \(4i-9i=-5i\).`)
        ]),
        {
          type: "plot",
          title: "Plot \(z\)",
          text: raw`Drag the point to where \(z=2-5i\) should be on the Argand diagram.`,
          plot: {
            ariaLabel: "Interactive Argand diagram showing u and w with a draggable point for z",
            targetX: 2,
            targetY: -5,
            draggableLabel: "z",
            points: [
              { x: 4, y: 2, label: "u", className: "graph-point", labelX: 4.22, labelY: 2.18 },
              { x: -2, y: -3, label: "w", className: "graph-point", labelX: -2.62, labelY: -3.22 }
            ]
          },
          successMessage: raw`Nice. The point \((2,-5)\) matches \(z=2-5i\).`,
          genericMessage: raw`Check the real part first, then the imaginary part. \(2-5i\) means right \(2\) and down \(5\).`,
          emptyMessage: raw`Place the point on the diagram before checking.`
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
        choiceStep("Identify the theorem", raw`How do we raise complex numbers in polar form to powers?`, [
          correctChoice(raw`Use De Moivre’s Theorem.`, raw`Exactly. De Moivre tells us how the modulus and argument change when we raise a complex number to a power.`),
          wrongChoice(raw`Use the remainder theorem.`, raw`That is for polynomial division, not powers of complex numbers.`),
          wrongChoice(raw`Use the quadratic formula.`, raw`This is not a quadratic equation.`),
          wrongChoice(raw`Use conjugates.`, raw`Conjugates help in other contexts, but not as the main theorem here.`)
        ]),
        choiceStep("Apply the theorem generally", raw`What does De Moivre give for \(u^n\)?`, [
          correctChoice(raw`\(\,u^n=m^n\operatorname{cis}\left(\frac{3n\pi}{10}\right)\)`, raw`Yes. Raise the modulus to \(n\) and multiply the argument by \(n\).`),
          wrongChoice(raw`\(\,u^n=m^n\operatorname{cis}\left(\frac{3\pi}{10n}\right)\)`, raw`For powers we multiply the argument by \(n\); we do not divide by \(n\).`),
          wrongChoice(raw`\(\,u^n=mn\operatorname{cis}\left(\frac{3n\pi}{10}\right)\)`, raw`The modulus becomes \(m^n\), not \(mn\).`),
          wrongChoice(raw`\(\,u^n=m^n+\operatorname{cis}\left(\frac{3n\pi}{10}\right)\)`, raw`Polar form multiplies the modulus and cis part; it does not add them.`)
        ]),
        choiceStep("Specialise to \(u^5\)", raw`If we want \(u^5\), what do we replace \(n\) with?`, [
          correctChoice(raw`\(\,5\)`, raw`Right. We are finding the fifth power, so \(n=5\).`),
          wrongChoice(raw`\(\,\frac{1}{5}\)`, raw`That would be for a fifth root, not a fifth power.`),
          wrongChoice(raw`\(\,\frac{3\pi}{10}\)`, raw`That is the argument, not the power.`),
          wrongChoice(raw`\(\,m\)`, raw`\(m\) is the modulus parameter, not the exponent.`)
        ]),
        choiceStep("Compute \(u^5\)", raw`What does \(u^5\) become in polar form?`, [
          correctChoice(raw`\(\,u^5=m^5\operatorname{cis}\left(\frac{3\pi}{2}\right)\)`, raw`Exactly. Multiplying the argument by \(5\) gives \(\frac{3\pi}{2}\).`),
          wrongChoice(raw`\(\,u^5=m^5\operatorname{cis}\left(\frac{3\pi}{10}\right)\)`, raw`The argument still needs to be multiplied by \(5\).`),
          wrongChoice(raw`\(\,u^5=5m\operatorname{cis}\left(\frac{3\pi}{2}\right)\)`, raw`The modulus becomes \(m^5\), not \(5m\).`),
          wrongChoice(raw`\(\,u^5=m^5\operatorname{cis}\left(\frac{\pi}{2}\right)\)`, raw`\(5\times \frac{3\pi}{10}=\frac{3\pi}{2}\), not \(\frac{\pi}{2}\).`)
        ]),
        choiceStep("Convert to \(a+bi\)", raw`What is \(u^5\) in the form \(a+bi\)?`, [
          correctChoice(raw`\(\,-m^5i\)`, raw`Correct. \(\cos\left(\frac{3\pi}{2}\right)=0\) and \(\sin\left(\frac{3\pi}{2}\right)=-1\), so \(u^5=-m^5i\).`),
          wrongChoice(raw`\(\,m^5i\)`, raw`The sine value is \(-1\), so the imaginary part is negative.`),
          wrongChoice(raw`\(\,m^5\)`, raw`The angle \(\frac{3\pi}{2}\) gives a purely imaginary result, not a real one.`),
          wrongChoice(raw`\(\,m^5(1-i)\)`, raw`That would need both cosine and sine to be non-zero.`)
        ])
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
        choiceStep("Rewrite the modulus", raw`How can we write the left-hand side as a square root?`, [
          correctChoice(raw`\(\,\sqrt{5^2+m^2}=\sqrt{5m^2}\)`, raw`Correct. \(|5-mi|\) becomes \(\sqrt{5^2+m^2}\).`),
          wrongChoice(raw`\(\,\sqrt{5+m}=\sqrt{5m^2}\)`, raw`A modulus uses squared parts, not just \(5+m\).`),
          wrongChoice(raw`\(\,5-m=\sqrt{5m^2}\)`, raw`The modulus is always non-negative and is written using a square root.`),
          wrongChoice(raw`\(\,\sqrt{25-m^2}=\sqrt{5m^2}\)`, raw`Both parts are squared and added inside the modulus formula.`)
        ]),
        choiceStep("Square and solve", raw`What values of \(m\) does the equation give?`, [
          correctChoice(raw`\(\,m=\pm\frac{5}{2}\)`, raw`Yes. Squaring gives \(25+m^2=5m^2\), so \(25=4m^2\) and \(m=\pm \frac{5}{2}\).`),
          wrongChoice(raw`\(\,m=\pm 5\)`, raw`We still need to divide by \(4\) before taking the square root.`),
          wrongChoice(raw`\(\,m=\frac{5}{4}\)`, raw`Do not forget the \(\pm\) when taking square roots.`),
          wrongChoice(raw`\(\,m=\pm\sqrt{5}\)`, raw`The equation simplifies to \(m^2=\frac{25}{4}\), not \(m^2=5\).`)
        ], {
          beforeHtml: raw`
            <div class="math-block">
              \[
              \sqrt{5^2+m^2}=\sqrt{5m^2}
              \]
              \[
              25+m^2=5m^2
              \]
              \[
              25=4m^2
              \]
            </div>
          `
        })
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
        <p class="step-text">Use the imaginary parts first, then substitute into the real-part equation:</p>
        <div class="math-block">
          \[
          h=-\frac{28}{g}
          \]
          \[
          3g-2\left(-\frac{28}{g}\right)=26
          \]
          \[
          3g^2+56=26g
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
        choiceStep("Expand both sides", raw`Which line shows the equation expanded correctly?`, [
          correctChoice(raw`\(\,3g-2h+(6+hg)i=26-22i\)`, raw`Correct. Expanding both products gives a real-part equation and an imaginary-part equation to compare.`),
          wrongChoice(raw`\(\,3g+2h+(6-hg)i=26-22i\)`, raw`Check the sign from \(2hi^2\) and the sign on the \(hg\) term.`),
          wrongChoice(raw`\(\,3g-2h+(6+hg)i=30-22i\)`, raw`The right side simplifies to \(26-22i\), because \(4i^2=-4\).`),
          wrongChoice(raw`\(\,3g+2h+(6+hg)i=26+22i\)`, raw`Both the real and imaginary signs are off.`)
        ]),
        choiceStep("Use the imaginary parts", raw`What does equating the imaginary parts tell us about \(h\)?`, [
          correctChoice(raw`\(\,h=-\frac{28}{g}\)`, raw`Yes. From \(6+gh=-22\), we get \(gh=-28\), so \(h=-\frac{28}{g}\).`),
          wrongChoice(raw`\(\,h=\frac{28}{g}\)`, raw`The sign should be negative because \(gh=-28\).`),
          wrongChoice(raw`\(\,h=\frac{g}{28}\)`, raw`Solve \(gh=-28\) for \(h\) by dividing by \(g\).`),
          wrongChoice(raw`\(\,h=-28g\)`, raw`We divide by \(g\); we do not multiply by \(g\).`)
        ]),
        choiceStep("Substitute into the real part", raw`What values of \(g\) do we get after substituting into \(3g-2h=26\)?`, [
          correctChoice(raw`\(\,g=4,\ \frac{14}{3}\)`, raw`Exactly. Substituting \(h=-\frac{28}{g}\) gives \(3g^2-26g+56=0\), which factors to \((3g-14)(g-4)=0\).`),
          wrongChoice(raw`\(\,g=4,\ -\frac{14}{3}\)`, raw`The second factor gives a positive \(\frac{14}{3}\), not a negative value.`),
          wrongChoice(raw`\(\,g=-4,\ \frac{14}{3}\)`, raw`The factor \(g-4=0\) gives \(g=4\).`),
          wrongChoice(raw`\(\,g=7,\ 8\)`, raw`Check the quadratic carefully after substitution.`)
        ]),
        choiceStep("Match the corresponding \(h\)-values", raw`What are the two solution pairs \((g,h)\)?`, [
          correctChoice(raw`\(\,(4,-7)\) and \(\left(\frac{14}{3},-6\right)\)`, raw`Correct. Substituting each \(g\)-value into \(h=-\frac{28}{g}\) gives those two pairs.`),
          wrongChoice(raw`\(\,(4,7)\) and \(\left(\frac{14}{3},6\right)\)`, raw`Both \(h\)-values should be negative.`),
          wrongChoice(raw`\(\,(4,-6)\) and \(\left(\frac{14}{3},-7\right)\)`, raw`The \(h\)-values are attached to the wrong \(g\)-values.`),
          wrongChoice(raw`\(\,(-4,-7)\) and \(\left(\frac{14}{3},-6\right)\)`, raw`The first \(g\)-value is \(4\), not \(-4\).`)
        ])
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
        choiceStep("Interpret the argument", raw`What does the argument of a complex number represent?`, [
          correctChoice(raw`The angle the point makes with the positive real axis.`, raw`Yes. The argument describes the direction of the complex number on the Argand diagram.`),
          wrongChoice(raw`The distance from the origin.`, raw`That is the modulus, not the argument.`),
          wrongChoice(raw`The conjugate of the number.`, raw`Conjugate is a different operation entirely.`),
          wrongChoice(raw`The denominator after rationalising.`, raw`That is not what the argument means.`)
        ]),
        choiceStep("Use \(\frac{\pi}{4}\)", raw`What does an argument of \(\frac{\pi}{4}\) tell us about the real and imaginary parts?`, [
          correctChoice(raw`They are equal.`, raw`Exactly. \(\tan\left(\frac{\pi}{4}\right)=1\), so the real part and imaginary coefficient must match.`),
          wrongChoice(raw`The real part must be zero.`, raw`That would put the number on the imaginary axis, not at an angle of \(\frac{\pi}{4}\).`),
          wrongChoice(raw`The imaginary part must be zero.`, raw`That would put the number on the real axis.`),
          wrongChoice(raw`The modulus must be \(1\).`, raw`This question gives an angle condition, not a size condition.`)
        ]),
        choiceStep("Choose the next move", raw`How do we make the real and imaginary parts easy to compare?`, [
          correctChoice(raw`Multiply by the conjugate of the denominator.`, raw`Yes. Rationalising removes the \(i\) from the denominator so the real and imaginary parts are easy to read.`),
          wrongChoice(raw`Multiply by the conjugate of the numerator.`, raw`That does not fix the denominator, which is the awkward part here.`),
          wrongChoice(raw`Square the whole fraction.`, raw`Squaring would change the argument and the value of the expression.`),
          wrongChoice(raw`Take the modulus of both sides.`, raw`The condition is about argument, not modulus.`)
        ]),
        choiceStep("Rationalise the fraction", raw`What do we get after multiplying top and bottom by \(1+di\)?`, [
          correctChoice(raw`\(\,\frac{-5d+(6+d^2)i}{1+d^2}\)`, raw`Correct. The real part is \(-5d\) and the imaginary coefficient is \(6+d^2\).`),
          wrongChoice(raw`\(\,\frac{5d+(6+d^2)i}{1+d^2}\)`, raw`The real part comes from \(d+6di^2=d-6d=-5d\).`),
          wrongChoice(raw`\(\,\frac{-5d+(6-d^2)i}{1+d^2}\)`, raw`The \(d^2i\) term adds to \(6i\), so the imaginary coefficient is \(6+d^2\).`),
          wrongChoice(raw`\(\,\frac{-5d+(6+d^2)i}{1-d^2}\)`, raw`The denominator is \((1-di)(1+di)=1+d^2\).`)
        ]),
        choiceStep("Solve for \(d\)", raw`What are the possible values of \(d\)?`, [
          correctChoice(raw`\(\,d=-3,\ -2\)`, raw`Exactly. Equating \(-5d\) and \(6+d^2\) gives \(d^2+5d+6=0\), so \(d=-3\) or \(d=-2\).`),
          wrongChoice(raw`\(\,d=3,\ 2\)`, raw`The factors are \((d+3)(d+2)=0\), so both values are negative.`),
          wrongChoice(raw`\(\,d=-6,\ 1\)`, raw`Those do not satisfy \(d^2+5d+6=0\).`),
          wrongChoice(raw`\(\,d=\pm\sqrt{6}\)`, raw`The quadratic factors nicely, so the solutions are simple integers.`)
        ], {
          beforeHtml: raw`
            <div class="math-block">
              \[
              \frac{d+6i}{1-di}\cdot\frac{1+di}{1+di}
              =
              \frac{-5d+(6+d^2)i}{1+d^2}
              \]
              \[
              -5d=6+d^2
              \]
            </div>
          `
        })
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
        choiceStep("Find the other root", raw`What will the other root be?`, [
          correctChoice(raw`\(\,x=2-\sqrt{p}\,i\)`, raw`Correct. Real-coefficient quadratics have complex roots in conjugate pairs.`),
          wrongChoice(raw`\(\,x=-2+\sqrt{p}\,i\)`, raw`Only the imaginary part changes sign in the conjugate.`),
          wrongChoice(raw`\(\,x=-2-\sqrt{p}\,i\)`, raw`The real part stays \(2\).`),
          wrongChoice(raw`\(\,x=2+\sqrt{p}\,i\)`, raw`That is just the root we were already given.`)
        ]),
        choiceStep("Write the factored form", raw`How do we write the quadratic in factored form?`, [
          correctChoice(raw`\(\,(x-2-\sqrt{p}\,i)(x-2+\sqrt{p}\,i)=0\)`, raw`Yes. Each factor is \(x\) minus one of the roots.`),
          wrongChoice(raw`\(\,(x+2-\sqrt{p}\,i)(x+2+\sqrt{p}\,i)=0\)`, raw`The factors should be \(x- \text{root}\), not \(x+\text{root}\).`),
          wrongChoice(raw`\(\,(x-2+\sqrt{p}\,i)^2=0\)`, raw`We need both conjugate factors, not the same factor twice.`),
          wrongChoice(raw`\(\,(x-\sqrt{p}\,i)(x+\sqrt{p}\,i)=0\)`, raw`That would ignore the real part \(2\).`)
        ]),
        choiceStep("Expand to the quadratic", raw`Which expanded equation is correct?`, [
          correctChoice(raw`\(\,x^2-4x+4+p=0\)`, raw`Exactly. The surd terms cancel, and \((\sqrt{p}\,i)^2=-p\), so subtracting it adds \(p\).`),
          wrongChoice(raw`\(\,x^2-4x+4-p=0\)`, raw`Remember that \(i^2=-1\), so subtracting \((\sqrt{p}\,i)^2\) gives \(+p\).`),
          wrongChoice(raw`\(\,x^2+4x+4+p=0\)`, raw`The middle term should be \(-4x\), coming from the pair of \((x-2)\) factors.`),
          wrongChoice(raw`\(\,x^2-2x+4+p=0\)`, raw`The combined middle term is \(-4x\), not \(-2x\).`)
        ])
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
        choiceStep("Choose the expansion rule", raw`What rule are we using here?`, [
          correctChoice(raw`\(\,(A+B)^2=A^2+2AB+B^2\)`, raw`Yes. Here the second term already contains the negative sign, so this rule still fits.`),
          wrongChoice(raw`\(\,(A+B)^2=A^2-B^2\)`, raw`That is not the square-of-a-binomial rule.`),
          wrongChoice(raw`\(\,(A-B)^2=A^2-B^2\)`, raw`The middle term is missing from that formula.`),
          wrongChoice(raw`\(\,(A+B)^2=A^2+B^2\)`, raw`We still need the \(2AB\) term.`)
        ]),
        choiceStep("Apply the rule", raw`What do we get after applying the rule to the expression?`, [
          correctChoice(raw`\(\,3a+12ai^2-2\sqrt{36a^2}\,i\)`, raw`Correct. That is the full expansion before we simplify \(i^2\) and the square root.`),
          wrongChoice(raw`\(\,3a+12a-2\sqrt{36a^2}\,i\)`, raw`The \(12a\) term still comes from \(12ai^2\) at this stage.`),
          wrongChoice(raw`\(\,3a+12ai^2+2\sqrt{36a^2}\,i\)`, raw`The middle term is negative because the complex term itself is negative.`),
          wrongChoice(raw`\(\,3a+6ai^2-2\sqrt{12a^2}\,i\)`, raw`Both the square term and the cross term simplify differently from that.`)
        ]),
        choiceStep("Simplify fully", raw`What is the final simplified answer?`, [
          correctChoice(raw`\(\,-9a-12ai\)`, raw`Exactly. Since \(i^2=-1\) and \(\sqrt{36a^2}=6a\), the expression simplifies to \(-9a-12ai\).`),
          wrongChoice(raw`\(\,15a-12ai\)`, raw`The \(12ai^2\) term becomes \(-12a\), not \(+12a\).`),
          wrongChoice(raw`\(\,-9a+12ai\)`, raw`The cross term is negative, so the imaginary part stays negative.`),
          wrongChoice(raw`\(\,9a-12ai\)`, raw`The real part is \(3a-12a=-9a\).`)
        ])
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
        choiceStep("Make the substitution", raw`What substitution will simplify the equation?`, [
          correctChoice(raw`\(\,u=\sqrt{x}\)`, raw`Exactly. That turns the radicals into an ordinary quadratic in \(u\).`),
          wrongChoice(raw`\(\,u=x^2\)`, raw`We want to replace the square root directly.`),
          wrongChoice(raw`\(\,u=2\sqrt{x}\)`, raw`That would still work eventually, but the PDF’s clean substitution is \(u=\sqrt{x}\).`),
          wrongChoice(raw`\(\,u=\frac{1}{\sqrt{x}}\)`, raw`That makes the algebra harder, not simpler.`)
        ]),
        choiceStep("Rewrite the equation", raw`What does the equation become after that substitution?`, [
          correctChoice(raw`\(\,(1+2u)(3+2u)=5+6u\)`, raw`Yes. Replacing \(\sqrt{x}\) with \(u\) gives exactly that.`),
          wrongChoice(raw`\(\,(1+u)(3+u)=5+6u\)`, raw`The coefficients of \(2\sqrt{x}\) should become \(2u\).`),
          wrongChoice(raw`\(\,(1+2u)(3+u)=5+6u\)`, raw`Both square-root terms should change to \(2u\).`),
          wrongChoice(raw`\(\,(1+2u)(3+2u)=5+6x\)`, raw`Once we substitute, the right-hand side should also use \(u\).`)
        ]),
        choiceStep("Expand and solve for \(u\)", raw`Which values of \(u\) do we get?`, [
          correctChoice(raw`\(\,u=-1,\ \frac{1}{2}\)`, raw`Correct. Expanding gives \(3+8u+4u^2=5+6u\), so \(4u^2+2u-2=0\), and the roots are \(u=-1\) and \(u=\frac{1}{2}\).`),
          wrongChoice(raw`\(\,u=1,\ \frac{1}{4}\)`, raw`Those are tempting, but the quadratic is in \(u\), not in \(x\).`),
          wrongChoice(raw`\(\,u=-\frac{1}{2},\ 1\)`, raw`Check the factorisation or quadratic solving again.`),
          wrongChoice(raw`\(\,u=\pm\frac{1}{2}\)`, raw`One root is \(-1\), not \(-\frac{1}{2}\).`)
        ]),
        choiceStep("Check validity", raw`Which value of \(x\) is valid?`, [
          correctChoice(raw`\(\,x=\frac{1}{4}\)`, raw`Exactly. Since \(u=\sqrt{x}\ge 0\), we keep \(u=\frac{1}{2}\), so \(x=\left(\frac{1}{2}\right)^2=\frac{1}{4}\).`),
          wrongChoice(raw`\(\,x=1\)`, raw`That comes from the invalid root \(u=-1\), which cannot equal \(\sqrt{x}\).`),
          wrongChoice(raw`\(\,x=-1\)`, raw`A square root substitution rules that out straight away.`),
          wrongChoice(raw`\(\,x=\frac{1}{2}\)`, raw`Once we find \(u=\frac{1}{2}\), we still need to square it to get \(x\).`)
        ])
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
        choiceStep("Use the conjugate-root rule", raw`What other complex root must exist because the coefficients are real?`, [
          correctChoice(raw`\(\,1-i\)`, raw`Correct. Real coefficients force non-real roots to come in conjugate pairs.`),
          wrongChoice(raw`\(\,-1+i\)`, raw`The real part stays the same when you take the conjugate.`),
          wrongChoice(raw`\(\,-1-i\)`, raw`The conjugate of \(1+i\) is \(1-i\).`),
          wrongChoice(raw`\(\,\frac{4}{3}\)`, raw`That is the remaining real root later on, not the conjugate partner.`)
        ]),
        choiceStep("Multiply the conjugate pair", raw`What factor do the roots \(1+i\) and \(1-i\) give together?`, [
          correctChoice(raw`\(\,z^2-2z+2\)`, raw`Yes. Multiplying \((z-1-i)(z-1+i)\) gives the quadratic factor \(z^2-2z+2\).`),
          wrongChoice(raw`\(\,z^2+2z+2\)`, raw`The middle term should be negative, because both factors start with \(z-1\).`),
          wrongChoice(raw`\(\,z^2-2z-2\)`, raw`The constant term is positive \(2\).`),
          wrongChoice(raw`\(\,z^2-z+2\)`, raw`The middle term comes from \(-(1+i)-(1-i)=-2\).`)
        ]),
        choiceStep("Find the third factor", raw`What must the remaining linear factor be?`, [
          correctChoice(raw`\(\,3z-4\)`, raw`Exactly. The constants must multiply to \(-8\), and the leading coefficient must still be \(3\).`),
          wrongChoice(raw`\(\,z-4\)`, raw`That would not give the leading coefficient \(3\).`),
          wrongChoice(raw`\(\,3z+4\)`, raw`The constant term would come out positive, not \(-8\).`),
          wrongChoice(raw`\(\,z+4\)`, raw`That gives the wrong leading coefficient and the wrong constant sign.`)
        ]),
        choiceStep("Expand the full polynomial", raw`What do we get when we multiply the factors out?`, [
          correctChoice(raw`\(\,3z^3-10z^2+14z-8\)`, raw`Correct. That is the fully expanded polynomial to compare with \(3z^3+pz^2+qz-8\).`),
          wrongChoice(raw`\(\,3z^3-10z^2+8z-8\)`, raw`Check the coefficient of \(z\) after combining like terms.`),
          wrongChoice(raw`\(\,3z^3-8z^2+14z-8\)`, raw`The \(z^2\)-coefficient should be \(-10\).`),
          wrongChoice(raw`\(\,3z^3+10z^2+14z-8\)`, raw`The quadratic factor has a negative middle term, so the expanded \(z^2\)-term is negative.`)
        ]),
        choiceStep("State the conclusion", raw`What are the other two roots, and what are \(p\) and \(q\)?`, [
          correctChoice(raw`\(\,1-i,\ \frac{4}{3};\ p=-10,\ q=14\)`, raw`Exactly. The other two roots are \(1-i\) and \(\frac{4}{3}\), and matching coefficients gives \(p=-10\) and \(q=14\).`),
          wrongChoice(raw`\(\,1-i,\ -\frac{4}{3};\ p=-10,\ q=14\)`, raw`Solve \(3z-4=0\): the real root is positive \(\frac{4}{3}\).`),
          wrongChoice(raw`\(\,1+i,\ \frac{4}{3};\ p=-10,\ q=14\)`, raw`We need the conjugate root \(1-i\), not the repeated original root.`),
          wrongChoice(raw`\(\,1-i,\ \frac{4}{3};\ p=10,\ q=14\)`, raw`The expanded coefficient of \(z^2\) is \(-10\), so \(p\) is negative.`)
        ])
      ]
    }),
    "3e": createConfig("3e", "2025 Paper — Simultaneous complex equations", {
      focus: raw`using elimination with a strategically chosen multiple, then simplifying the resulting complex fractions to solve for \(u\) and \(v\).`,
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
        raw`Follow the elimination route: make the \(u\)-terms match first, then solve for \(v\), then back-substitute for \(u\).`
      ],
      hints: [
        raw`Multiply the second equation by \(i\) so both equations contain \(ui\).`,
        raw`Subtract the new equation from the first one to eliminate \(u\).`,
        raw`Solve for \(v\) first, then substitute back into \(u+(1-i)v=4\).`
      ],
      answerHtml: raw`
        <p class="step-text">Multiply the second equation by \(i\) so the \(u\)-terms match:</p>
        <div class="math-block">
          \[
          ui+(1-i)vi=4i
          \]
        </div>
        <p class="step-text">Now subtract this from the first equation:</p>
        <div class="math-block">
          \[
          ui+2v-(ui+(1-i)vi)=3-4i
          \]
          \[
          2v-(1-i)vi=3-4i
          \]
          \[
          2v-vi+vi^2=3-4i
          \]
          \[
          v-vi=3-4i
          \]
          \[
          v(1-i)=3-4i
          \]
        </div>
        <p class="step-text">Solve for \(v\):</p>
        <div class="math-block">
          \[
          v=\frac{3-4i}{1-i}
          \]
          \[
          v=\frac{(3-4i)(1+i)}{(1-i)(1+i)}
          \]
          \[
          v=\frac{3-4i+3i-4i^2}{2}
          \]
          \[
          v=\frac{7-i}{2}
          \]
        </div>
        <p class="step-text">Substitute back to find \(u\):</p>
        <div class="math-block">
          \[
          u=4-(1-i)v
          \]
          \[
          u=4-\frac{7-i}{2}+\frac{7i-i^2}{2}
          \]
          \[
          2u=8-7+i+7i+1
          \]
          \[
          2u=2+8i
          \]
          \[
          u=1+4i
          \]
        </div>
        ${answerBox(raw`
          \[
          u=1+4i,\qquad v=\frac{7}{2}-\frac{1}{2}i
          \]
        `)}
      `,
      steps: [
        choiceStep("Make the \(u\)-terms match", raw`What should we do to make the \(u\)-terms the same in both equations?`, [
          correctChoice(raw`Multiply \(u+(1-i)v=4\) by \(i\).`, raw`Exactly. That gives \(ui+(1-i)vi=4i\), so the \(ui\)-terms are ready to eliminate.`),
          wrongChoice(raw`Multiply \(ui+2v=3\) by \(i\).`, raw`That would turn \(ui\) into \(-u\), which moves us away from matching terms.`),
          wrongChoice(raw`Multiply both equations by \(v\).`, raw`That introduces extra products instead of simplifying the system.`),
          wrongChoice(raw`Divide both equations by \(i\).`, raw`That would not make the \(u\)-terms match cleanly.`)
        ]),
        choiceStep("Eliminate \(u\)", raw`What do we get when we subtract the new equation from \(ui+2v=3\)?`, [
          correctChoice(raw`\(\,2v-(1-i)vi=3-4i\)`, raw`Yes. The \(ui\)-terms cancel, leaving an equation just in \(v\).`),
          wrongChoice(raw`\(\,2v+(1-i)vi=3-4i\)`, raw`Subtracting keeps the minus sign in front of \((1-i)vi\).`),
          wrongChoice(raw`\(\,2v-(1-i)vi=3+4i\)`, raw`The right side is \(3-4i\), because we subtract \(4i\).`),
          wrongChoice(raw`\(\,v-(1-i)vi=3-4i\)`, raw`The \(2v\) stays as \(2v\) at this stage.`)
        ]),
        choiceStep("Solve for \(v\)", raw`What is \(v\)?`, [
          correctChoice(raw`\(\,v=\frac{7-i}{2}\)`, raw`Correct. Simplifying \(2v-(1-i)vi=3-4i\) gives \(v(1-i)=3-4i\), and rationalising leads to \(v=\frac{7-i}{2}\).`),
          wrongChoice(raw`\(\,v=\frac{7+i}{2}\)`, raw`The imaginary part should be negative after the simplification.`),
          wrongChoice(raw`\(\,v=\frac{3-4i}{2}\)`, raw`We still need to divide by \(1-i\), not just by \(2\).`),
          wrongChoice(raw`\(\,v=7-i\)`, raw`The denominator \(2\) remains after rationalising.`)
        ], {
          beforeHtml: raw`
            <div class="math-block">
              \[
              2v-(1-i)vi=3-4i
              \]
              \[
              2v-vi+vi^2=3-4i
              \]
              \[
              v-vi=3-4i
              \]
              \[
              v(1-i)=3-4i
              \]
            </div>
          `
        }),
        choiceStep("Back-substitute for \(u\)", raw`What is \(u\)?`, [
          correctChoice(raw`\(\,u=1+4i\)`, raw`Exactly. Substituting \(v=\frac{7-i}{2}\) into \(u=4-(1-i)v\) gives \(u=1+4i\).`),
          wrongChoice(raw`\(\,u=4+i\)`, raw`The real part should simplify to \(1\), not \(4\).`),
          wrongChoice(raw`\(\,u=1-4i\)`, raw`The imaginary part is positive \(4i\).`),
          wrongChoice(raw`\(\,u=\frac{1+4i}{2}\)`, raw`There is no final factor of \(2\) left after simplifying.`)
        ])
      ]
    })
  };
}());
