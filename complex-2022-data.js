(function () {
  const raw = String.raw;
  const paperHref = "level-3-complex-numbers-2022.html";
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
      guidedSteps: [
        {
          title: raw`Identify the conjugate`,
          previewHtml: raw`The conjugate of \(1+\sqrt{5}\) is \(1-\sqrt{5}\).`,
          workingHtml: raw`<p class="step-text">The conjugate of \(1+\sqrt{5}\) is \(1-\sqrt{5}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,\frac{1-\sqrt{5}}{1-\sqrt{5}}\)
</div>`
        },
        {
          title: raw`Expand the numerator`,
          previewHtml: raw`Distribute \(12k\) across both terms in \(1-\sqrt{5}\).`,
          workingHtml: raw`<p class="step-text">Distribute \(12k\) across both terms in \(1-\sqrt{5}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,12k-12k\sqrt{5}\)
</div>`
        },
        {
          title: raw`Use the difference of squares`,
          previewHtml: raw`\((1+\sqrt{5})(1-\sqrt{5})=1-5=-4\).`,
          workingHtml: raw`<p class="step-text">\((1+\sqrt{5})(1-\sqrt{5})=1-5=-4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,-4\)
</div>`
        },
        {
          title: raw`Write the final exact form`,
          previewHtml: raw`That is the simplified expression in the required form.`,
          workingHtml: raw`<p class="step-text">That is the simplified expression in the required form.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  -3 k + 3 k \sqrt{5}
  \]
</div>
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          -3k+3k\sqrt{5}
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Exam Tip</p>
        <p class="step-text">The conjugate is doing two jobs at once here: it removes the surd from the denominator and keeps the value of the fraction unchanged.</p>
      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Divide the moduli`,
          previewHtml: raw`Moduli divide, so the powers subtract.`,
          workingHtml: raw`<p class="step-text">Moduli divide, so the powers subtract.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,m^{5-2}=m^3\)
</div>`
        },
        {
          title: raw`Subtract the arguments`,
          previewHtml: raw`We subtract the second argument from the first.`,
          workingHtml: raw`<p class="step-text">We subtract the second argument from the first.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,\frac{\pi}{3}-\frac{\pi}{5}\)
</div>`
        },
        {
          title: raw`Write the final polar form`,
          previewHtml: raw`The modulus is \(m^3\) and the argument is \(\frac{2\pi}{15}\).`,
          workingHtml: raw`<p class="step-text">The modulus is \(m^3\) and the argument is \(\frac{2\pi}{15}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,m^3\operatorname{cis}\left(\frac{2\pi}{15}\right)\)
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          \frac{u}{v}=m^3\operatorname{cis}\left(\frac{2\pi}{15}\right)
          \]

      </div>

      `
        }
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
      guidedSteps: [
        {
          title: raw`Multiply \(u\) and \(v\)`,
          previewHtml: raw`The \(i^2\) term changes the real part from \(12\) down to \(8\).`,
          workingHtml: raw`<p class="step-text">The \(i^2\) term changes the real part from \(12\) down to \(8\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,8+14i\)
</div>`
        },
        {
          title: raw`Multiply by \(w\)`,
          previewHtml: raw`The \(14ki^2\) term becomes \(-14k\) in the real part.`,
          workingHtml: raw`<p class="step-text">The \(14ki^2\) term becomes \(-14k\) in the real part.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,16-14k+(28+8k)i\)
</div>`
        },
        {
          title: raw`Use the argument condition`,
          previewHtml: raw`A complex number with argument \(\frac{\pi}{4}\) lies on the line \(y=x\) in the first quadrant.`,
          workingHtml: raw`<p class="step-text">A complex number with argument \(\frac{\pi}{4}\) lies on the line \(y=x\) in the first quadrant.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  The real and imaginary parts are equal and positive.
</div>`
        },
        {
          title: raw`Solve for \(k\)`,
          previewHtml: raw`Equating the parts gives \(16-14k=28+8k\), so \(k=-\frac{6}{11}\).`,
          workingHtml: raw`<p class="step-text">Equating the parts gives \(16-14k=28+8k\), so \(k=-\frac{6}{11}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,-\frac{6}{11}\)
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          k=-\frac{6}{11}
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Exam Tip</p>
        <p class="step-text">For special arguments like \(\frac{\pi}{4}\), look for a geometry shortcut before you reach for trigonometry.</p>
      </div>

      `
        }
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
      guidedSteps: [
        {
          title: raw`Isolate the surd`,
          previewHtml: raw`Put the surd on one side before you square.`,
          workingHtml: raw`<p class="step-text">Put the surd on one side before you square.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,x+5=2\sqrt{x+p}\)
</div>`
        },
        {
          title: raw`Square carefully`,
          previewHtml: raw`Squaring gives \((x+5)^2=4(x+p)\), then everything moves to one side.`,
          workingHtml: raw`<p class="step-text">Squaring gives \((x+5)^2=4(x+p)\), then everything moves to one side.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,x^2+6x+(25-4p)=0\)
</div>`
        },
        {
          title: raw`Set the discriminant to zero`,
          previewHtml: raw`That is the discriminant condition that forces one repeated real root.`,
          workingHtml: raw`<p class="step-text">That is the discriminant condition that forces one repeated real root.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  36 - 4 \left(25 - 4 p\right) = 0
  \]
</div>
</div>`
        },
        {
          title: raw`Find \(p\)`,
          previewHtml: raw`Solving the discriminant equation gives \(p=4\).`,
          workingHtml: raw`<p class="step-text">Solving the discriminant equation gives \(p=4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,4\)
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          p=4
          \]

      </div>

      `
        }
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
      guidedSteps: [
        {
          title: raw`Set up the proof`,
          previewHtml: raw`That makes the real parts easy to read as \(a\) and \(c\).`,
          workingHtml: raw`<p class="step-text">That makes the real parts easy to read as \(a\) and \(c\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,w=a+bi,\ z=c+di\)
</div>`
        },
        {
          title: raw`Handle the conjugate`,
          previewHtml: raw`Subtracting \(c-di\) flips the sign of the real part and adds the imaginary parts.`,
          workingHtml: raw`<p class="step-text">Subtracting \(c-di\) flips the sign of the real part and adds the imaginary parts.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,(a-c)+(b+d)i\)
</div>`
        },
        {
          title: raw`Square the first modulus`,
          previewHtml: raw`The modulus squared is the sum of the squares of the real and imaginary parts.`,
          workingHtml: raw`<p class="step-text">The modulus squared is the sum of the squares of the real and imaginary parts.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,(a+c)^2+(b+d)^2\)
</div>`
        },
        {
          title: raw`Square the second modulus`,
          previewHtml: raw`The real part is \(a-c\) and the imaginary part is \(b+d\).`,
          workingHtml: raw`<p class="step-text">The real part is \(a-c\) and the imaginary part is \(b+d\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,(a-c)^2+(b+d)^2\)
</div>`
        },
        {
          title: raw`Finish the proof`,
          previewHtml: raw`The \((b+d)^2\) terms cancel, and the remaining difference of squares becomes \(4ac\).`,
          workingHtml: raw`<p class="step-text">The \((b+d)^2\) terms cancel, and the remaining difference of squares becomes \(4ac\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,4ac=4\operatorname{Re}(w)\operatorname{Re}(z)\)
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          |w+z|^2-|w-\overline{z}|^2=4\operatorname{Re}(w)\operatorname{Re}(z)
          \]

      </div>

      `
        }
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
      guidedSteps: [
        {
          title: raw`Recognise the theorem`,
          previewHtml: raw`A remainder with a linear divisor is a direct remainder-theorem question.`,
          workingHtml: raw`<p class="step-text">A remainder with a linear divisor is a direct remainder-theorem question.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  The remainder theorem.
</div>`
        },
        {
          title: raw`Substitute the root of the divisor`,
          previewHtml: raw`The divisor \(x+2\) means we substitute \(x=-2\).`,
          workingHtml: raw`<p class="step-text">The divisor \(x+2\) means we substitute \(x=-2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,(-2)^3-3(-2)^2+b(-2)+9=3\)
</div>`
        },
        {
          title: raw`Solve for \(b\)`,
          previewHtml: raw`Simplifying the substitution gives \(-11-2b=3\), so \(b=-7\).`,
          workingHtml: raw`<p class="step-text">Simplifying the substitution gives \(-11-2b=3\), so \(b=-7\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,-7\)
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          b=-7
          \]

      </div>

      `
        }
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
      guidedSteps: [
        {
          title: raw`Write the conjugate`,
          previewHtml: raw`The conjugate keeps the real part and flips the sign of the imaginary part.`,
          workingHtml: raw`<p class="step-text">The conjugate keeps the real part and flips the sign of the imaginary part.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,a-bi\)
</div>`
        },
        {
          title: raw`Substitute into the equation`,
          previewHtml: raw`Combine the real terms and then combine the imaginary terms.`,
          workingHtml: raw`<p class="step-text">Combine the real terms and then combine the imaginary terms.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,5a-3bi\)
</div>`
        },
        {
          title: raw`Match the parts`,
          previewHtml: raw`The real parts match the real parts, and the imaginary parts match the imaginary parts.`,
          workingHtml: raw`<p class="step-text">The real parts match the real parts, and the imaginary parts match the imaginary parts.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,5a=15\text{ and }-3b=12\)
</div>`
        },
        {
          title: raw`Write \(z\)`,
          previewHtml: raw`That is the value of \(a+bi\).`,
          workingHtml: raw`<p class="step-text">That is the value of \(a+bi\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,3-4i\)
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          z=3-4i
          \]

      </div>

      `
        }
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
      guidedSteps: [
        {
          title: raw`Identify the factor`,
          previewHtml: raw`A root of \(-4\) corresponds to the factor \(z+4\).`,
          workingHtml: raw`<p class="step-text">A root of \(-4\) corresponds to the factor \(z+4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z+4\)
</div>`
        },
        {
          title: raw`Use the remainder`,
          previewHtml: raw`Setting that remainder equal to \(0\) is how we find \(h\).`,
          workingHtml: raw`<p class="step-text">Setting that remainder equal to \(0\) is how we find \(h\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,84-4h\)
</div>`
        },
        {
          title: raw`Find \(h\)`,
          previewHtml: raw`Solving \(84-4h=0\) gives \(h=21\).`,
          workingHtml: raw`<p class="step-text">Solving \(84-4h=0\) gives \(h=21\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,21\)
</div>`
        },
        {
          title: raw`Write the reduced quadratic`,
          previewHtml: raw`The constant term in the quotient becomes \(h+24=45\).`,
          workingHtml: raw`<p class="step-text">The constant term in the quotient becomes \(h+24=45\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z^2-6z+45=0\)
</div>`
        },
        {
          title: raw`Find the other roots`,
          previewHtml: raw`Completing the square gives \((z-3)^2=-36\), so \(z=3\pm 6i\).`,
          workingHtml: raw`<p class="step-text">Completing the square gives \((z-3)^2=-36\), so \(z=3\pm 6i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,3+6i,\ 3-6i\)
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          h=21
          \]
          \[
          z=3\pm 6i
          \]

      </div>

      `
        }
      ]
    }),
    "2d": createConfig("2d", raw`2022 Paper — Argument from \(a+bi\) form`, {
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
      guidedSteps: [
        {
          title: raw`Identify the conjugate`,
          previewHtml: raw`The conjugate of \(1-\sqrt{3}i\) is \(1+\sqrt{3}i\).`,
          workingHtml: raw`<p class="step-text">The conjugate of \(1-\sqrt{3}i\) is \(1+\sqrt{3}i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,1+\sqrt{3}i\)
</div>`
        },
        {
          title: raw`Rewrite \(w\) in \(a+bi\) form`,
          previewHtml: raw`\(\frac{4}{1-\sqrt{3}i}=1+\sqrt{3}i\), then subtracting \(2\) gives \(-1+\sqrt{3}i\).`,
          workingHtml: raw`<p class="step-text">\(\frac{4}{1-\sqrt{3}i}=1+\sqrt{3}i\), then subtracting \(2\) gives \(-1+\sqrt{3}i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,-1+\sqrt{3}i\)
</div>`
        },
        {
          title: raw`Identify the quadrant`,
          previewHtml: raw`The real part is negative and the imaginary part is positive.`,
          workingHtml: raw`<p class="step-text">The real part is negative and the imaginary part is positive.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Quadrant II.
</div>`
        },
        {
          title: raw`Find the principal argument`,
          previewHtml: raw`The reference angle is \(\frac{\pi}{3}\), but quadrant II makes the principal argument \(\frac{2\pi}{3}\).`,
          workingHtml: raw`<p class="step-text">The reference angle is \(\frac{\pi}{3}\), but quadrant II makes the principal argument \(\frac{2\pi}{3}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,\frac{2\pi}{3}\)
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          \arg(w)=\frac{2\pi}{3}
          \]

      </div>


      <div class="callout-card mistake">
        <p class="callout-title">Common Mistake</p>
        <p class="step-text">Using \(\tan^{-1}\left(\frac{\operatorname{Im}}{\operatorname{Re}}\right)\) only gives the reference angle here. Because the real part is negative and the imaginary part is positive, the point is in quadrant II, not quadrant IV.</p>
      </div>

      `
        }
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
      guidedSteps: [
        {
          title: raw`Write \(z\) in Cartesian form`,
          previewHtml: raw`Cartesian form is the natural start for a Cartesian locus.`,
          workingHtml: raw`<p class="step-text">Cartesian form is the natural start for a Cartesian locus.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z=x+yi\)
</div>`
        },
        {
          title: raw`Turn the moduli into distances`,
          previewHtml: raw`That is the correct distance form after writing \(z=x+yi\).`,
          workingHtml: raw`<p class="step-text">That is the correct distance form after writing \(z=x+yi\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,\sqrt{x^2+(y+1)^2}=2\sqrt{x^2+(y-5)^2}\)
</div>`
        },
        {
          title: raw`Square both sides`,
          previewHtml: raw`Squaring the factor \(2\) gives \(4\) on the right-hand side.`,
          workingHtml: raw`<p class="step-text">Squaring the factor \(2\) gives \(4\) on the right-hand side.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,x^2+(y+1)^2=4\left(x^2+(y-5)^2\right)\)
</div>`
        },
        {
          title: raw`Collect the terms`,
          previewHtml: raw`Divide the expanded equation by \(3\) after collecting the terms.`,
          workingHtml: raw`<p class="step-text">Divide the expanded equation by \(3\) after collecting the terms.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,x^2+y^2-14y+33=0\)
</div>`
        },
        {
          title: raw`Complete the square`,
          previewHtml: raw`That is the circle in the required Cartesian form.`,
          workingHtml: raw`<p class="step-text">That is the circle in the required Cartesian form.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  x^{2} + \left(y - 7\right)^{2} = 16
  \]
</div>
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          x^2+(y-7)^2=16
          \]

      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Read \(r\)`,
          previewHtml: raw`The point \(r\) is at \((3,2)\).`,
          workingHtml: raw`<p class="step-text">The point \(r\) is at \((3,2)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,3+2i\)
</div>`
        },
        {
          title: raw`Read \(s\)`,
          previewHtml: raw`The point \(s\) is at \((2,-5)\).`,
          workingHtml: raw`<p class="step-text">The point \(s\) is at \((2,-5)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,2-5i\)
</div>`
        },
        {
          title: raw`Double \(r\)`,
          previewHtml: raw`Double both parts of \(r=3+2i\).`,
          workingHtml: raw`<p class="step-text">Double both parts of \(r=3+2i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,6+4i\)
</div>`
        },
        {
          title: raw`Find \(v\)`,
          previewHtml: raw`Subtracting \(2-5i\) means subtract \(2\) from the real part and add \(5\) to the imaginary part.`,
          workingHtml: raw`<p class="step-text">Subtracting \(2-5i\) means subtract \(2\) from the real part and add \(5\) to the imaginary part.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,4+9i\)
</div>`
        },
        {
          title: raw`Plot \(v\)`,
          previewHtml: raw`The point \((4,9)\) matches \(v=4+9i\).`,
          workingHtml: raw`<p class="step-text">The point \((4,9)\) matches \(v=4+9i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Answer point</p>
  <div class="math-block">
  \[
  v=(4,9)
  \]
</div>
</div>

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

      <div class="graph-frame question-graph-frame">
        <svg class="graph-svg" viewBox="0 0 420 420" role="img" aria-label="Argand diagram showing the points r, s, and v">
          <rect class="graph-bg" x="0" y="0" width="420" height="420"></rect>
          <line class="graph-grid-line" x1="36.67" y1="392" x2="36.67" y2="28"></line><line class="graph-grid-line" x1="54" y1="392" x2="54" y2="28"></line><line class="graph-grid-line" x1="71.33" y1="392" x2="71.33" y2="28"></line><line class="graph-grid-line" x1="88.67" y1="392" x2="88.67" y2="28"></line><line class="graph-grid-line" x1="106" y1="392" x2="106" y2="28"></line><line class="graph-grid-line" x1="123.33" y1="392" x2="123.33" y2="28"></line><line class="graph-grid-line" x1="140.67" y1="392" x2="140.67" y2="28"></line><line class="graph-grid-line" x1="158" y1="392" x2="158" y2="28"></line><line class="graph-grid-line" x1="175.33" y1="392" x2="175.33" y2="28"></line><line class="graph-grid-line" x1="192.67" y1="392" x2="192.67" y2="28"></line><line class="graph-grid-line" x1="210" y1="392" x2="210" y2="28"></line><line class="graph-grid-line" x1="227.33" y1="392" x2="227.33" y2="28"></line><line class="graph-grid-line" x1="244.67" y1="392" x2="244.67" y2="28"></line><line class="graph-grid-line" x1="262" y1="392" x2="262" y2="28"></line><line class="graph-grid-line" x1="279.33" y1="392" x2="279.33" y2="28"></line><line class="graph-grid-line" x1="296.67" y1="392" x2="296.67" y2="28"></line><line class="graph-grid-line" x1="314" y1="392" x2="314" y2="28"></line><line class="graph-grid-line" x1="331.33" y1="392" x2="331.33" y2="28"></line><line class="graph-grid-line" x1="348.67" y1="392" x2="348.67" y2="28"></line><line class="graph-grid-line" x1="366" y1="392" x2="366" y2="28"></line><line class="graph-grid-line" x1="383.33" y1="392" x2="383.33" y2="28"></line><line class="graph-grid-line" x1="28" y1="383.33" x2="392" y2="383.33"></line><line class="graph-grid-line" x1="28" y1="366" x2="392" y2="366"></line><line class="graph-grid-line" x1="28" y1="348.67" x2="392" y2="348.67"></line><line class="graph-grid-line" x1="28" y1="331.33" x2="392" y2="331.33"></line><line class="graph-grid-line" x1="28" y1="314" x2="392" y2="314"></line><line class="graph-grid-line" x1="28" y1="296.67" x2="392" y2="296.67"></line><line class="graph-grid-line" x1="28" y1="279.33" x2="392" y2="279.33"></line><line class="graph-grid-line" x1="28" y1="262" x2="392" y2="262"></line><line class="graph-grid-line" x1="28" y1="244.67" x2="392" y2="244.67"></line><line class="graph-grid-line" x1="28" y1="227.33" x2="392" y2="227.33"></line><line class="graph-grid-line" x1="28" y1="210" x2="392" y2="210"></line><line class="graph-grid-line" x1="28" y1="192.67" x2="392" y2="192.67"></line><line class="graph-grid-line" x1="28" y1="175.33" x2="392" y2="175.33"></line><line class="graph-grid-line" x1="28" y1="158" x2="392" y2="158"></line><line class="graph-grid-line" x1="28" y1="140.67" x2="392" y2="140.67"></line><line class="graph-grid-line" x1="28" y1="123.33" x2="392" y2="123.33"></line><line class="graph-grid-line" x1="28" y1="106" x2="392" y2="106"></line><line class="graph-grid-line" x1="28" y1="88.67" x2="392" y2="88.67"></line><line class="graph-grid-line" x1="28" y1="71.33" x2="392" y2="71.33"></line><line class="graph-grid-line" x1="28" y1="54" x2="392" y2="54"></line><line class="graph-grid-line" x1="28" y1="36.67" x2="392" y2="36.67"></line>
          <line class="graph-axis" x1="28" y1="210" x2="392" y2="210"></line>
          <line class="graph-axis" x1="210" y1="392" x2="210" y2="28"></line>
          <circle class="question-origin" cx="210" cy="210" r="4.5"></circle>
          <text class="graph-label" x="385.93" y="216.93" text-anchor="end">Real</text>
          <text class="graph-label" x="210" y="31.47" text-anchor="middle">Imaginary</text>
          <circle class="graph-point" cx="262" cy="175.33" r="5"></circle><text class="graph-label" x="265.81" y="171.52">r</text><circle class="graph-point" cx="244.67" cy="296.67" r="5"></circle><text class="graph-label" x="248.48" y="299.79">s</text><circle class="graph-point-secondary" cx="279.33" cy="54" r="5"></circle><text class="graph-label" x="283.15" y="50.53">v</text>
        </svg>
      </div>


      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          v=4+9i
          \]

      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Complete the square setup`,
          previewHtml: raw`Half of \(6k\) is \(3k\), and \((3k)^2=9k^2\).`,
          workingHtml: raw`<p class="step-text">Half of \(6k\) is \(3k\), and \((3k)^2=9k^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,9k^2\)
</div>`
        },
        {
          title: raw`Form the perfect square`,
          previewHtml: raw`The left side becomes a perfect square and the right side simplifies to \(-6k^2\).`,
          workingHtml: raw`<p class="step-text">The left side becomes a perfect square and the right side simplifies to \(-6k^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,(z+3k)^2=-6k^2\)
</div>`
        },
        {
          title: raw`Take the square root`,
          previewHtml: raw`The square root of \(-6k^2\) is \(\pm \sqrt{6}\,ki\).`,
          workingHtml: raw`<p class="step-text">The square root of \(-6k^2\) is \(\pm \sqrt{6}\,ki\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z+3k=\pm \sqrt{6}\,ki\)
</div>`
        },
        {
          title: raw`Write the final roots`,
          previewHtml: raw`That matches the required form \(ak\pm \sqrt{b}\,ki\).`,
          workingHtml: raw`<p class="step-text">That matches the required form \(ak\pm \sqrt{b}\,ki\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z=-3k\pm \sqrt{6}\,ki\)
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          z=-3k\pm \sqrt{6}\,ki
          \]

      </div>

      `
        }
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
          z=k^2\operatorname{cis}\left(-\frac{\pi}{6}\right),\;
          k^2\operatorname{cis}\left(\frac{\pi}{2}\right),\;
          k^2\operatorname{cis}\left(\frac{7\pi}{6}\right)
          \]
        `)}
      `,
      guidedSteps: [
        {
          title: raw`Isolate the cubic`,
          previewHtml: raw`Move \(k^6i\) to the other side first.`,
          workingHtml: raw`<p class="step-text">Move \(k^6i\) to the other side first.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z^3=-k^6i\)
</div>`
        },
        {
          title: raw`Read the modulus`,
          previewHtml: raw`The modulus is the size of the number, and \(k^6\) is non-negative.`,
          workingHtml: raw`<p class="step-text">The modulus is the size of the number, and \(k^6\) is non-negative.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,k^6\)
</div>`
        },
        {
          title: raw`Identify the argument`,
          previewHtml: raw`\(-i\) points straight down the negative imaginary axis.`,
          workingHtml: raw`<p class="step-text">\(-i\) points straight down the negative imaginary axis.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,-\frac{\pi}{2}\)
</div>`
        },
        {
          title: raw`Take the cube roots`,
          previewHtml: raw`The modulus becomes \(k^2\), and the angle is divided by \(3\) with the usual cube-root spacing.`,
          workingHtml: raw`<p class="step-text">The modulus becomes \(k^2\), and the angle is divided by \(3\) with the usual cube-root spacing.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z=k^2\operatorname{cis}\left(-\frac{\pi}{6}+\frac{2n\pi}{3}\right),\ n=0,1,2\)
</div>`
        },
        {
          title: raw`List the three roots`,
          previewHtml: raw`Those are the three cube roots when \(n=0,1,2\).`,
          workingHtml: raw`<p class="step-text">Those are the three cube roots when \(n=0,1,2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,k^2\operatorname{cis}\left(-\frac{\pi}{6}\right),\ k^2\operatorname{cis}\left(\frac{\pi}{2}\right),\ k^2\operatorname{cis}\left(\frac{7\pi}{6}\right)\)
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          z=k^2\operatorname{cis}\left(-\frac{\pi}{6}\right),\;
          k^2\operatorname{cis}\left(\frac{\pi}{2}\right),\;
          k^2\operatorname{cis}\left(\frac{7\pi}{6}\right)
          \]

      </div>

      `
        }
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
      guidedSteps: [
        {
          title: raw`Rearrange the equation`,
          previewHtml: raw`That puts the real quantity \(|z|\) on its own.`,
          workingHtml: raw`<p class="step-text">That puts the real quantity \(|z|\) on its own.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,|z|=z+i\)
</div>`
        },
        {
          title: raw`Use the fact that \(|z|\) is real`,
          previewHtml: raw`Since \(|z|=a+(b+1)i\) is real, the imaginary part must be zero.`,
          workingHtml: raw`<p class="step-text">Since \(|z|=a+(b+1)i\) is real, the imaginary part must be zero.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,b=-1\)
</div>`
        },
        {
          title: raw`Match the real parts`,
          previewHtml: raw`Since \(b=-1\), \(|z|=\sqrt{a^2+1}\), and the real part on the right is \(a\).`,
          workingHtml: raw`<p class="step-text">Since \(b=-1\), \(|z|=\sqrt{a^2+1}\), and the real part on the right is \(a\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,\sqrt{a^2+1}=a\)
</div>`
        },
        {
          title: raw`Reach the contradiction`,
          previewHtml: raw`Follow the working to reach the contradiction.`,
          workingHtml: raw`<p class="step-text">Squaring \(\sqrt{a^2+1}=a\) gives \(a^2+1=a^2\), which is impossible.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,1=0\)
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          \text{No complex number }z\text{ satisfies }|z|-z=i.
          \]

      </div>

      `
        }
      ]
    }),
    "3e": createConfig("3e", raw`2022 Paper — Solving for \(a\) and \(b\) using \(z\) and \(\overline{z}\)`, {
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
      guidedSteps: [
        {
          title: raw`Clear the denominators`,
          previewHtml: raw`Multiplying \(\frac{i}{z}\) by \(z\overline{z}\) leaves \(i\overline{z}\), and multiplying \(\frac{3}{\overline{z}}\) leaves \(3z\).`,
          workingHtml: raw`<p class="step-text">Multiplying \(\frac{i}{z}\) by \(z\overline{z}\) leaves \(i\overline{z}\), and multiplying \(\frac{3}{\overline{z}}\) leaves \(3z\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,i\overline{z}+3z=z\overline{z}\)
</div>`
        },
        {
          title: raw`Substitute \(a+bi\)`,
          previewHtml: raw`\(i(a-bi)=b+ai\), then adding \(3a+3bi\) gives that expression.`,
          workingHtml: raw`<p class="step-text">\(i(a-bi)=b+ai\), then adding \(3a+3bi\) gives that expression.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,(3a+b)+(a+3b)i\)
</div>`
        },
        {
          title: raw`Use the imaginary part`,
          previewHtml: raw`The right-hand side \(a^2+b^2\) is real, so the imaginary part must be zero.`,
          workingHtml: raw`<p class="step-text">The right-hand side \(a^2+b^2\) is real, so the imaginary part must be zero.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,a+3b=0\)
</div>`
        },
        {
          title: raw`Substitute into the real equation`,
          previewHtml: raw`Substituting \(a=-3b\) into \(3a+b=a^2+b^2\) gives \(-8b=10b^2\).`,
          workingHtml: raw`<p class="step-text">Substituting \(a=-3b\) into \(3a+b=a^2+b^2\) gives \(-8b=10b^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,10b^2+8b=0\)
</div>`
        },
        {
          title: raw`Finish the values`,
          previewHtml: raw`The non-zero condition rules out \(a=b=0\), leaving \(b=-\frac{4}{5}\) and \(a=\frac{12}{5}\).`,
          workingHtml: raw`<p class="step-text">The non-zero condition rules out \(a=b=0\), leaving \(b=-\frac{4}{5}\) and \(a=\frac{12}{5}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,a=\frac{12}{5},\ b=-\frac{4}{5}\)
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          a=\frac{12}{5},\qquad b=-\frac{4}{5}
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Exam Tip</p>
        <p class="step-text">The identity \(z\overline{z}=a^2+b^2\) is the key simplification that turns this into an ordinary real-system problem.</p>
      </div>

      `
        }
      ]
    })
  };
}());
