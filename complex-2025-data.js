(function () {
  const raw = String.raw;
  const paperHref = "level-3-complex-numbers-2025.html";
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
      guidedSteps: [
        {
          title: raw`Identify the method`,
          previewHtml: raw`We are given a remainder, not a factor, so this is a remainder-theorem question.`,
          workingHtml: raw`<p class="step-text">We are given a remainder, not a factor, so this is a remainder-theorem question.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Use the Remainder Theorem.
</div>`
        },
        {
          title: raw`Interpret the remainder`,
          previewHtml: raw`Dividing by \(x-2\) means we test \(x=2\), so the output must be \(21\).`,
          workingHtml: raw`<p class="step-text">Dividing by \(x-2\) means we test \(x=2\), so the output must be \(21\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,f(2)=21\)
</div>`
        },
        {
          title: raw`Substitute carefully`,
          previewHtml: raw`Every \(x\) becomes \(2\), so that is the correct substitution.`,
          workingHtml: raw`<p class="step-text">Every \(x\) becomes \(2\), so that is the correct substitution.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,3(2)^4+p(2)^3-4(2)+5\)
</div>`
        },
        {
          title: raw`Evaluate the output`,
          previewHtml: raw`\(3(2)^4+p(2)^3-4(2)+5=48+8p-8+5=45+8p\).`,
          workingHtml: raw`<p class="step-text">\(3(2)^4+p(2)^3-4(2)+5=48+8p-8+5=45+8p\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,45+8p\)
</div>`
        },
        {
          title: raw`Use the remainder`,
          previewHtml: raw`The polynomial output must equal the stated remainder \(21\).`,
          workingHtml: raw`<p class="step-text">The polynomial output must equal the stated remainder \(21\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,45+8p=21\)
</div>`
        },
        {
          title: raw`Finish the solve`,
          previewHtml: raw`From \(45+8p=21\), we get \(8p=-24\), so \(p=-3\).`,
          workingHtml: raw`<p class="step-text">From \(45+8p=21\), we get \(8p=-24\), so \(p=-3\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,p=-3\)
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          p=-3
          \]

      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Identify the equation type`,
          previewHtml: raw`The highest power of \(x\) is \(2\), so we are solving a quadratic.`,
          workingHtml: raw`<p class="step-text">The highest power of \(x\) is \(2\), so we are solving a quadratic.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  A quadratic equation.
</div>`
        },
        {
          title: raw`Check the structure`,
          previewHtml: raw`We are missing the \(+9k^2\) needed to make a perfect square.`,
          workingHtml: raw`<p class="step-text">We are missing the \(+9k^2\) needed to make a perfect square.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  No, because \((x-3k)^2=x^2-6kx+9k^2\).
</div>`
        },
        {
          title: raw`Identify the clean method`,
          previewHtml: raw`The expression is almost a perfect square, so completing the square is the natural move.`,
          workingHtml: raw`<p class="step-text">The expression is almost a perfect square, so completing the square is the natural move.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Complete the square.
</div>`
        },
        {
          title: raw`Make the perfect square`,
          previewHtml: raw`Half the coefficient of \(x\) is \(-3k\), and squaring that gives \(9k^2\).`,
          workingHtml: raw`<p class="step-text">Half the coefficient of \(x\) is \(-3k\), and squaring that gives \(9k^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,9k^2\)
</div>`
        },
        {
          title: raw`Factorise the left side`,
          previewHtml: raw`Adding \(9k^2\) to both sides gives \((x-3k)^2=k^2+9k^2=10k^2\).`,
          workingHtml: raw`<p class="step-text">Adding \(9k^2\) to both sides gives \((x-3k)^2=k^2+9k^2=10k^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,(x-3k)^2=10k^2\)
</div>`
        },
        {
          title: raw`Solve for x`,
          previewHtml: raw`Take square roots, then add \(3k\) to both sides.`,
          workingHtml: raw`<p class="step-text">Take square roots, then add \(3k\) to both sides.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,x=3k\pm k\sqrt{10}\)
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Spot the proof idea`,
          previewHtml: raw`If the discriminant is positive, the quadratic has real roots.`,
          workingHtml: raw`<p class="step-text">If the discriminant is positive, the quadratic has real roots.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  A positive discriminant.
</div>`
        },
        {
          title: raw`Rewrite in standard form`,
          previewHtml: raw`Multiplying by \(k\) clears the denominator and gives \(k^3x^2+x-3k=0\).`,
          workingHtml: raw`<p class="step-text">Multiplying by \(k\) clears the denominator and gives \(k^3x^2+x-3k=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,k^3x^2+x-3k=0\)
</div>`
        },
        {
          title: raw`Identify \(a\), \(b\), and \(c\)`,
          previewHtml: raw`That is the correct match for \(k^3x^2+x-3k=0\).`,
          workingHtml: raw`<p class="step-text">That is the correct match for \(k^3x^2+x-3k=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,a=k^3,\ b=1,\ c=-3k\)
</div>`
        },
        {
          title: raw`Substitute into the discriminant`,
          previewHtml: raw`That is the discriminant with the correct values of \(a\), \(b\), and \(c\).`,
          workingHtml: raw`<p class="step-text">That is the discriminant with the correct values of \(a\), \(b\), and \(c\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,1^2-4(k^3)(-3k)\)
</div>`
        },
        {
          title: raw`Simplify the discriminant`,
          previewHtml: raw`The product \(-4(k^3)(-3k)\) simplifies to \(+12k^4\).`,
          workingHtml: raw`<p class="step-text">The product \(-4(k^3)(-3k)\) simplifies to \(+12k^4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,1+12k^4\)
</div>`
        },
        {
          title: raw`Finish the argument`,
          previewHtml: raw`The discriminant is always positive, so the equation has real roots for every real \(k\neq 0\).`,
          workingHtml: raw`<p class="step-text">The discriminant is always positive, so the equation has real roots for every real \(k\neq 0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,k^4\ge 0\) for real \(k\), so \(1+12k^4>0\).
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Start with the power`,
          previewHtml: raw`We want \(z^3\) on its own before we use polar form and cube roots.`,
          workingHtml: raw`<p class="step-text">We want \(z^3\) on its own before we use polar form and cube roots.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Isolate \(z^3\).
</div>`
        },
        {
          title: raw`Rearrange the equation`,
          previewHtml: raw`Now the right-hand side is one complex number we can rewrite in polar form.`,
          workingHtml: raw`<p class="step-text">Now the right-hand side is one complex number we can rewrite in polar form.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z^3=-8m^{27}i\)
</div>`
        },
        {
          title: raw`Read the direction`,
          previewHtml: raw`The number is a negative multiple of \(i\), so it lies in the \(-i\) direction.`,
          workingHtml: raw`<p class="step-text">The number is a negative multiple of \(i\), so it lies in the \(-i\) direction.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  It points straight down the negative imaginary axis.
</div>`
        },
        {
          title: raw`Identify the argument`,
          previewHtml: raw`The principal argument of \(-i\) is \(-\frac{\pi}{2}\).`,
          workingHtml: raw`<p class="step-text">The principal argument of \(-i\) is \(-\frac{\pi}{2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,-\frac{\pi}{2}\)
</div>`
        },
        {
          title: raw`Find the modulus`,
          previewHtml: raw`The modulus is the size of the number, so the negative sign only affects the argument.`,
          workingHtml: raw`<p class="step-text">The modulus is the size of the number, so the negative sign only affects the argument.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,8m^{27}\)
</div>`
        },
        {
          title: raw`Write \(z^3\) in polar form`,
          previewHtml: raw`We now have modulus and argument ready for De Moivre.`,
          workingHtml: raw`<p class="step-text">We now have modulus and argument ready for De Moivre.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z^3=8m^{27}\operatorname{cis}\left(-\frac{\pi}{2}\right)\)
</div>`
        },
        {
          title: raw`Take the cube roots`,
          previewHtml: raw`Cube roots divide the argument by \(3\) and use \(k=0,1,2\) for the three solutions.`,
          workingHtml: raw`<p class="step-text">Cube roots divide the argument by \(3\) and use \(k=0,1,2\) for the three solutions.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z=2m^9\operatorname{cis}\left(\frac{2k\pi}{3}-\frac{\pi}{6}\right)\)
</div>`
        },
        {
          title: raw`Finish with the three roots`,
          previewHtml: raw`Using \(k=0,1,2\) gives those three cube roots, with the third angle rewritten as a principal value.`,
          workingHtml: raw`<p class="step-text">Using \(k=0,1,2\) gives those three cube roots, with the third angle rewritten as a principal value.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,2m^9\operatorname{cis}\left(-\frac{\pi}{6}\right),\ 2m^9\operatorname{cis}\left(\frac{\pi}{2}\right),\ 2m^9\operatorname{cis}\left(-\frac{5\pi}{6}\right)\)
</div>

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
      `
        }
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
      guidedSteps: [
        {
          title: raw`Identify the question type`,
          previewHtml: raw`The modulus signs tell us this is a locus built from distances in the Argand plane.`,
          workingHtml: raw`<p class="step-text">The modulus signs tell us this is a locus built from distances in the Argand plane.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  A restricted-modulus locus.
</div>`
        },
        {
          title: raw`Rewrite \(z\)`,
          previewHtml: raw`Writing \(z=x+yi\) lets us turn each modulus into a distance formula.`,
          workingHtml: raw`<p class="step-text">Writing \(z=x+yi\) lets us turn each modulus into a distance formula.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z=x+yi\)
</div>`
        },
        {
          title: raw`Substitute into the locus`,
          previewHtml: raw`That is the direct substitution before we tidy the imaginary parts.`,
          workingHtml: raw`<p class="step-text">That is the direct substitution before we tidy the imaginary parts.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,|x+yi-5i|-|x+yi+5i|=4\)
</div>`
        },
        {
          title: raw`Separate real and imaginary parts`,
          previewHtml: raw`Now the real distance is \(x\) and the imaginary distances are \(y-5\) and \(y+5\).`,
          workingHtml: raw`<p class="step-text">Now the real distance is \(x\) and the imaginary distances are \(y-5\) and \(y+5\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,|x+(y-5)i|-|x+(y+5)i|=4\)
</div>`
        },
        {
          title: raw`Turn moduli into square roots`,
          previewHtml: raw`Each modulus becomes a distance from the origin in terms of \(x\) and \(y\).`,
          workingHtml: raw`<p class="step-text">Each modulus becomes a distance from the origin in terms of \(x\) and \(y\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,\sqrt{x^2+(y-5)^2}-\sqrt{x^2+(y+5)^2}=4\)
</div>`
        },
        {
          title: raw`Prepare for squaring`,
          previewHtml: raw`Isolating one surd keeps the next line much cleaner.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \sqrt{x^2+(y-5)^2}-\sqrt{x^2+(y+5)^2}=4
              \]
            </div>

<p class="step-text">Isolating one surd keeps the next line much cleaner.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Move one surd to the other side.
</div>`
        },
        {
          title: raw`Square whole sides`,
          previewHtml: raw`The whole right-hand side is a binomial, so it squares to \(4^2+2\cdot 4\cdot \sqrt{\cdots}+(\sqrt{\cdots})^2\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \sqrt{x^2+(y-5)^2}=4+\sqrt{x^2+(y+5)^2}
              \]
            </div>

<p class="step-text">The whole right-hand side is a binomial, so it squares to \(4^2+2\cdot 4\cdot \sqrt{\cdots}+(\sqrt{\cdots})^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,x^2+(y-5)^2=16+8\sqrt{x^2+(y+5)^2}+x^2+(y+5)^2\)
</div>`
        },
        {
          title: raw`Simplify before the second squaring`,
          previewHtml: raw`Subtracting \((y+5)^2\) is the smart move, because \((y-5)^2-(y+5)^2=-20y\).`,
          workingHtml: raw`<p class="step-text">Subtracting \((y+5)^2\) is the smart move, because \((y-5)^2-(y+5)^2=-20y\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,-20y=16+8\sqrt{x^2+(y+5)^2}\)
</div>`
        },
        {
          title: raw`Square a second time`,
          previewHtml: raw`Dividing by \(4\) and isolating the surd first keeps the second squaring tidy.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              -20y=16+8\sqrt{x^2+(y+5)^2}
              \]
              \[
              -5y-4=2\sqrt{x^2+(y+5)^2}
              \]
            </div>

<p class="step-text">Dividing by \(4\) and isolating the surd first keeps the second squaring tidy.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,16+25y^2+40y=4\left(x^2+(y+5)^2\right)\)
</div>`
        },
        {
          title: raw`Finish in Cartesian form`,
          previewHtml: raw`Expanding the final bracket and cancelling the common \(40y\) terms gives \(21y^2-4x^2=84\).`,
          workingHtml: raw`<p class="step-text">Expanding the final bracket and cancelling the common \(40y\) terms gives \(21y^2-4x^2=84\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,21y^2-4x^2=84\)
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          21y^2-4x^2=84
          \]

      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Read \(u\)`,
          previewHtml: raw`The point \(u\) is at \((4,2)\), so \(u=4+2i\).`,
          workingHtml: raw`<p class="step-text">The point \(u\) is at \((4,2)\), so \(u=4+2i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,u=4+2i\)
</div>`
        },
        {
          title: raw`Read \(w\)`,
          previewHtml: raw`The point \(w\) is left \(2\) and down \(3\), so \(w=-2-3i\).`,
          workingHtml: raw`<p class="step-text">The point \(w\) is left \(2\) and down \(3\), so \(w=-2-3i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,w=-2-3i\)
</div>`
        },
        {
          title: raw`Scale \(u\)`,
          previewHtml: raw`Multiply both the real and imaginary parts of \(u\) by \(2\).`,
          workingHtml: raw`<p class="step-text">Multiply both the real and imaginary parts of \(u\) by \(2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,2u=8+4i\)
</div>`
        },
        {
          title: raw`Scale \(w\)`,
          previewHtml: raw`Multiplying \(-2-3i\) by \(3\) gives \(-6-9i\).`,
          workingHtml: raw`<p class="step-text">Multiplying \(-2-3i\) by \(3\) gives \(-6-9i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,3w=-6-9i\)
</div>`
        },
        {
          title: raw`Add the two results`,
          previewHtml: raw`Adding the real parts gives \(2\), and adding the imaginary parts gives \(-5\).`,
          workingHtml: raw`<p class="step-text">Adding the real parts gives \(2\), and adding the imaginary parts gives \(-5\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z=2-5i\)
</div>`
        },
        {
          title: raw`Plot \(z\)`,
          previewHtml: raw`The point \((2,-5)\) matches \(z=2-5i\).`,
          workingHtml: raw`<p class="step-text">The point \((2,-5)\) matches \(z=2-5i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Answer point</p>
  <div class="math-block">
  \[
  z=(2,-5)
  \]
</div>
</div>

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

      <div class="graph-frame question-graph-frame">
        <svg class="graph-svg" viewBox="0 0 420 420" role="img" aria-label="Argand diagram showing the points u and w, and z">
          <rect class="graph-bg" x="0" y="0" width="420" height="420"></rect>
          <line class="graph-grid-line" x1="42" y1="378" x2="42" y2="42"></line><line class="graph-grid-line" x1="70" y1="378" x2="70" y2="42"></line><line class="graph-grid-line" x1="98" y1="378" x2="98" y2="42"></line><line class="graph-grid-line" x1="126" y1="378" x2="126" y2="42"></line><line class="graph-grid-line" x1="154" y1="378" x2="154" y2="42"></line><line class="graph-grid-line" x1="182" y1="378" x2="182" y2="42"></line><line class="graph-grid-line" x1="210" y1="378" x2="210" y2="42"></line><line class="graph-grid-line" x1="238" y1="378" x2="238" y2="42"></line><line class="graph-grid-line" x1="266" y1="378" x2="266" y2="42"></line><line class="graph-grid-line" x1="294" y1="378" x2="294" y2="42"></line><line class="graph-grid-line" x1="322" y1="378" x2="322" y2="42"></line><line class="graph-grid-line" x1="350" y1="378" x2="350" y2="42"></line><line class="graph-grid-line" x1="378" y1="378" x2="378" y2="42"></line><line class="graph-grid-line" x1="42" y1="378" x2="378" y2="378"></line><line class="graph-grid-line" x1="42" y1="350" x2="378" y2="350"></line><line class="graph-grid-line" x1="42" y1="322" x2="378" y2="322"></line><line class="graph-grid-line" x1="42" y1="294" x2="378" y2="294"></line><line class="graph-grid-line" x1="42" y1="266" x2="378" y2="266"></line><line class="graph-grid-line" x1="42" y1="238" x2="378" y2="238"></line><line class="graph-grid-line" x1="42" y1="210" x2="378" y2="210"></line><line class="graph-grid-line" x1="42" y1="182" x2="378" y2="182"></line><line class="graph-grid-line" x1="42" y1="154" x2="378" y2="154"></line><line class="graph-grid-line" x1="42" y1="126" x2="378" y2="126"></line><line class="graph-grid-line" x1="42" y1="98" x2="378" y2="98"></line><line class="graph-grid-line" x1="42" y1="70" x2="378" y2="70"></line><line class="graph-grid-line" x1="42" y1="42" x2="378" y2="42"></line>
          <line class="graph-axis" x1="42" y1="210" x2="378" y2="210"></line>
          <line class="graph-axis" x1="210" y1="378" x2="210" y2="42"></line>
          <circle class="question-origin" cx="210" cy="210" r="4.5"></circle>
          <text class="graph-label" x="376.6" y="216.16">Real</text>
          <text class="graph-label" x="204.96" y="33.6" text-anchor="middle">Imaginary</text>
          <circle class="graph-point" cx="322" cy="154" r="5"></circle><text class="graph-label" x="328.16" y="148.96">u</text><circle class="graph-point" cx="154" cy="294" r="5"></circle><text class="graph-label" x="136.64" y="300.16">w</text><circle class="graph-point-secondary" cx="266" cy="350" r="5"></circle><text class="graph-label" x="272.16" y="355.04">z</text>
        </svg>
      </div>


      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          z=2-5i
          \]

      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Identify the theorem`,
          previewHtml: raw`De Moivre tells us how the modulus and argument change when we raise a complex number to a power.`,
          workingHtml: raw`<p class="step-text">De Moivre tells us how the modulus and argument change when we raise a complex number to a power.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Use De Moivre’s Theorem.
</div>`
        },
        {
          title: raw`Apply the theorem generally`,
          previewHtml: raw`Raise the modulus to \(n\) and multiply the argument by \(n\).`,
          workingHtml: raw`<p class="step-text">Raise the modulus to \(n\) and multiply the argument by \(n\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,u^n=m^n\operatorname{cis}\left(\frac{3n\pi}{10}\right)\)
</div>`
        },
        {
          title: raw`Specialise to \(u^5\)`,
          previewHtml: raw`We are finding the fifth power, so \(n=5\).`,
          workingHtml: raw`<p class="step-text">We are finding the fifth power, so \(n=5\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,5\)
</div>`
        },
        {
          title: raw`Compute \(u^5\)`,
          previewHtml: raw`Multiplying the argument by \(5\) gives \(\frac{3\pi}{2}\).`,
          workingHtml: raw`<p class="step-text">Multiplying the argument by \(5\) gives \(\frac{3\pi}{2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,u^5=m^5\operatorname{cis}\left(\frac{3\pi}{2}\right)\)
</div>`
        },
        {
          title: raw`Convert to \(a+bi\)`,
          previewHtml: raw`\(\cos\left(\frac{3\pi}{2}\right)=0\) and \(\sin\left(\frac{3\pi}{2}\right)=-1\), so \(u^5=-m^5i\).`,
          workingHtml: raw`<p class="step-text">\(\cos\left(\frac{3\pi}{2}\right)=0\) and \(\sin\left(\frac{3\pi}{2}\right)=-1\), so \(u^5=-m^5i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,-m^5i\)
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Rewrite the modulus`,
          previewHtml: raw`\(|5-mi|\) becomes \(\sqrt{5^2+m^2}\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              |a+bi|=\sqrt{a^2+b^2}
              \]
            </div>

<p class="step-text">\(|5-mi|\) becomes \(\sqrt{5^2+m^2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,\sqrt{5^2+m^2}=\sqrt{5m^2}\)
</div>`
        },
        {
          title: raw`Square and solve`,
          previewHtml: raw`Squaring gives \(25+m^2=5m^2\), so \(25=4m^2\) and \(m=\pm \frac{5}{2}\).`,
          workingHtml: raw`
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

<p class="step-text">Squaring gives \(25+m^2=5m^2\), so \(25=4m^2\) and \(m=\pm \frac{5}{2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,m=\pm\frac{5}{2}\)
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Expand both sides`,
          previewHtml: raw`Expanding both products gives a real-part equation and an imaginary-part equation to compare.`,
          workingHtml: raw`<p class="step-text">Expanding both products gives a real-part equation and an imaginary-part equation to compare.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,3g-2h+(6+hg)i=26-22i\)
</div>`
        },
        {
          title: raw`Use the imaginary parts`,
          previewHtml: raw`From \(6+gh=-22\), we get \(gh=-28\), so \(h=-\frac{28}{g}\).`,
          workingHtml: raw`<p class="step-text">From \(6+gh=-22\), we get \(gh=-28\), so \(h=-\frac{28}{g}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,h=-\frac{28}{g}\)
</div>`
        },
        {
          title: raw`Substitute into the real part`,
          previewHtml: raw`Follow the working to substitute into the real part.`,
          workingHtml: raw`<p class="step-text">Substituting \(h=-\frac{28}{g}\) gives \(3g^2-26g+56=0\), which factors to \((3g-14)(g-4)=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,g=4,\ \frac{14}{3}\)
</div>`
        },
        {
          title: raw`Match the corresponding \(h\)-values`,
          previewHtml: raw`Substituting each \(g\)-value into \(h=-\frac{28}{g}\) gives those two pairs.`,
          workingHtml: raw`<p class="step-text">Substituting each \(g\)-value into \(h=-\frac{28}{g}\) gives those two pairs.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,(4,-7)\) and \(\left(\frac{14}{3},-6\right)\)
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Interpret the argument`,
          previewHtml: raw`The argument describes the direction of the complex number on the Argand diagram.`,
          workingHtml: raw`<p class="step-text">The argument describes the direction of the complex number on the Argand diagram.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  The angle the point makes with the positive real axis.
</div>`
        },
        {
          title: raw`Use \(\frac{\pi}{4}\)`,
          previewHtml: raw`\(\tan\left(\frac{\pi}{4}\right)=1\), so the real part and imaginary coefficient must match.`,
          workingHtml: raw`<p class="step-text">\(\tan\left(\frac{\pi}{4}\right)=1\), so the real part and imaginary coefficient must match.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  They are equal.
</div>`
        },
        {
          title: raw`Identify the next move`,
          previewHtml: raw`Rationalising removes the \(i\) from the denominator so the real and imaginary parts are easy to read.`,
          workingHtml: raw`<p class="step-text">Rationalising removes the \(i\) from the denominator so the real and imaginary parts are easy to read.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Multiply by the conjugate of the denominator.
</div>`
        },
        {
          title: raw`Rationalise the fraction`,
          previewHtml: raw`The real part is \(-5d\) and the imaginary coefficient is \(6+d^2\).`,
          workingHtml: raw`<p class="step-text">The real part is \(-5d\) and the imaginary coefficient is \(6+d^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,\frac{-5d+(6+d^2)i}{1+d^2}\)
</div>`
        },
        {
          title: raw`Solve for \(d\)`,
          previewHtml: raw`Equating \(-5d\) and \(6+d^2\) gives \(d^2+5d+6=0\), so \(d=-3\) or \(d=-2\).`,
          workingHtml: raw`
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

<p class="step-text">Equating \(-5d\) and \(6+d^2\) gives \(d^2+5d+6=0\), so \(d=-3\) or \(d=-2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,d=-3,\ -2\)
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Find the other root`,
          previewHtml: raw`Real-coefficient quadratics have complex roots in conjugate pairs.`,
          workingHtml: raw`<p class="step-text">Real-coefficient quadratics have complex roots in conjugate pairs.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,x=2-\sqrt{p}\,i\)
</div>`
        },
        {
          title: raw`Write the factored form`,
          previewHtml: raw`Each factor is \(x\) minus one of the roots.`,
          workingHtml: raw`<p class="step-text">Each factor is \(x\) minus one of the roots.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,(x-2-\sqrt{p}\,i)(x-2+\sqrt{p}\,i)=0\)
</div>`
        },
        {
          title: raw`Expand to the quadratic`,
          previewHtml: raw`The surd terms cancel, and \((\sqrt{p}\,i)^2=-p\), so subtracting it adds \(p\).`,
          workingHtml: raw`<p class="step-text">The surd terms cancel, and \((\sqrt{p}\,i)^2=-p\), so subtracting it adds \(p\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,x^2-4x+4+p=0\)
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Identify the expansion rule`,
          previewHtml: raw`Here the second term already contains the negative sign, so this rule still fits.`,
          workingHtml: raw`<p class="step-text">Here the second term already contains the negative sign, so this rule still fits.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,(A+B)^2=A^2+2AB+B^2\)
</div>`
        },
        {
          title: raw`Apply the rule`,
          previewHtml: raw`That is the full expansion before we simplify \(i^2\) and the square root.`,
          workingHtml: raw`<p class="step-text">That is the full expansion before we simplify \(i^2\) and the square root.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,3a+12ai^2-2\sqrt{36a^2}\,i\)
</div>`
        },
        {
          title: raw`Simplify fully`,
          previewHtml: raw`Since \(i^2=-1\) and \(\sqrt{36a^2}=6a\), the expression simplifies to \(-9a-12ai\).`,
          workingHtml: raw`<p class="step-text">Since \(i^2=-1\) and \(\sqrt{36a^2}=6a\), the expression simplifies to \(-9a-12ai\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,-9a-12ai\)
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Make the substitution`,
          previewHtml: raw`That turns the radicals into an ordinary quadratic in \(u\).`,
          workingHtml: raw`<p class="step-text">That turns the radicals into an ordinary quadratic in \(u\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,u=\sqrt{x}\)
</div>`
        },
        {
          title: raw`Rewrite the equation`,
          previewHtml: raw`Replacing \(\sqrt{x}\) with \(u\) gives exactly that.`,
          workingHtml: raw`<p class="step-text">Replacing \(\sqrt{x}\) with \(u\) gives exactly that.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,(1+2u)(3+2u)=5+6u\)
</div>`
        },
        {
          title: raw`Expand and solve for \(u\)`,
          previewHtml: raw`Expanding gives \(3+8u+4u^2=5+6u\), so \(4u^2+2u-2=0\), and the roots are \(u=-1\) and \(u=\frac{1}{2}\).`,
          workingHtml: raw`<p class="step-text">Expanding gives \(3+8u+4u^2=5+6u\), so \(4u^2+2u-2=0\), and the roots are \(u=-1\) and \(u=\frac{1}{2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,u=-1,\ \frac{1}{2}\)
</div>`
        },
        {
          title: raw`Check validity`,
          previewHtml: raw`Since \(u=\sqrt{x}\ge 0\), we keep \(u=\frac{1}{2}\), so \(x=\left(\frac{1}{2}\right)^2=\frac{1}{4}\).`,
          workingHtml: raw`<p class="step-text">Since \(u=\sqrt{x}\ge 0\), we keep \(u=\frac{1}{2}\), so \(x=\left(\frac{1}{2}\right)^2=\frac{1}{4}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,x=\frac{1}{4}\)
</div>

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
      `
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
      guidedSteps: [
        {
          title: raw`Use the conjugate-root rule`,
          previewHtml: raw`Real coefficients force non-real roots to come in conjugate pairs.`,
          workingHtml: raw`<p class="step-text">Real coefficients force non-real roots to come in conjugate pairs.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,1-i\)
</div>`
        },
        {
          title: raw`Multiply the conjugate pair`,
          previewHtml: raw`Multiplying \((z-1-i)(z-1+i)\) gives the quadratic factor \(z^2-2z+2\).`,
          workingHtml: raw`<p class="step-text">Multiplying \((z-1-i)(z-1+i)\) gives the quadratic factor \(z^2-2z+2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z^2-2z+2\)
</div>`
        },
        {
          title: raw`Find the third factor`,
          previewHtml: raw`The constants must multiply to \(-8\), and the leading coefficient must still be \(3\).`,
          workingHtml: raw`<p class="step-text">The constants must multiply to \(-8\), and the leading coefficient must still be \(3\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,3z-4\)
</div>`
        },
        {
          title: raw`Expand the full polynomial`,
          previewHtml: raw`That is the fully expanded polynomial to compare with \(3z^3+pz^2+qz-8\).`,
          workingHtml: raw`<p class="step-text">That is the fully expanded polynomial to compare with \(3z^3+pz^2+qz-8\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,3z^3-10z^2+14z-8\)
</div>`
        },
        {
          title: raw`State the conclusion`,
          previewHtml: raw`The other two roots are \(1-i\) and \(\frac{4}{3}\), and matching coefficients gives \(p=-10\) and \(q=14\).`,
          workingHtml: raw`<p class="step-text">The other two roots are \(1-i\) and \(\frac{4}{3}\), and matching coefficients gives \(p=-10\) and \(q=14\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,1-i,\ \frac{4}{3};\ p=-10,\ q=14\)
</div>

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
      `
        }
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
      guidedSteps: [
        {
          title: raw`Make the \(u\)-terms match`,
          previewHtml: raw`That gives \(ui+(1-i)vi=4i\), so the \(ui\)-terms are ready to eliminate.`,
          workingHtml: raw`<p class="step-text">That gives \(ui+(1-i)vi=4i\), so the \(ui\)-terms are ready to eliminate.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Multiply \(u+(1-i)v=4\) by \(i\).
</div>`
        },
        {
          title: raw`Eliminate \(u\)`,
          previewHtml: raw`The \(ui\)-terms cancel, leaving an equation just in \(v\).`,
          workingHtml: raw`<p class="step-text">The \(ui\)-terms cancel, leaving an equation just in \(v\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,2v-(1-i)vi=3-4i\)
</div>`
        },
        {
          title: raw`Solve for \(v\)`,
          previewHtml: raw`Simplifying \(2v-(1-i)vi=3-4i\) gives \(v(1-i)=3-4i\), and rationalising leads to \(v=\frac{7-i}{2}\).`,
          workingHtml: raw`
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

<p class="step-text">Simplifying \(2v-(1-i)vi=3-4i\) gives \(v(1-i)=3-4i\), and rationalising leads to \(v=\frac{7-i}{2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,v=\frac{7-i}{2}\)
</div>`
        },
        {
          title: raw`Back-substitute for \(u\)`,
          previewHtml: raw`Substituting \(v=\frac{7-i}{2}\) into \(u=4-(1-i)v\) gives \(u=1+4i\).`,
          workingHtml: raw`<p class="step-text">Substituting \(v=\frac{7-i}{2}\) into \(u=4-(1-i)v\) gives \(u=1+4i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,u=1+4i\)
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          u=1+4i,\qquad v=\frac{7}{2}-\frac{1}{2}i
          \]

      </div>

      `
        }
      ]
    })
  };
}());
