(function () {
  const raw = String.raw;
  const paperHref = "level-3-complex-numbers-2024.html";
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
      guidedSteps: [
        {
          title: raw`Use the factor theorem`,
          previewHtml: raw`Since \(x+3=0\), the root is \(x=-3\).`,
          workingHtml: raw`<p class="step-text">Since \(x+3=0\), the root is \(x=-3\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                -3
              \]
</div>`
        },
        {
          title: raw`Simplify the substitution`,
          previewHtml: raw`Everything simplifies to \(9p-54=0\).`,
          workingHtml: raw`<p class="step-text">Everything simplifies to \(9p-54=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  9 p - 54 = 0
  \]
</div>
</div>`
        },
        {
          title: raw`Solve for p`,
          previewHtml: raw`Solving \(9p-54=0\) gives \(p=6\).`,
          workingHtml: raw`<p class="step-text">Solving \(9p-54=0\) gives \(p=6\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                6
              \]
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          p=6
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Exam Tip</p>
        <p class="step-text">If the factor is \(x-a\), the quick check is always \(f(a)=0\). Here \(x+3=x-(-3)\), so we use \(x=-3\).</p>
      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Raise the modulus`,
          previewHtml: raw`The modulus becomes \(m^{15}\).`,
          workingHtml: raw`<p class="step-text">The modulus becomes \(m^{15}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                m^{15}
              \]
</div>`
        },
        {
          title: raw`Multiply the argument`,
          previewHtml: raw`\(15\times \frac{n\pi}{5}=3n\pi\).`,
          workingHtml: raw`<p class="step-text">\(15\times \frac{n\pi}{5}=3n\pi\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                3n\pi
              \]
</div>`
        },
        {
          title: raw`Identify the safest final polar form`,
          previewHtml: raw`That is the direct De Moivre result, and it works for positive real \(n\).`,
          workingHtml: raw`<p class="step-text">That is the direct De Moivre result, and it works for positive real \(n\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                m^{15}\operatorname{cis}(3n\pi)
              \]
</div>

        <p class="step-text">Apply De Moivre’s Theorem directly:</p>
        <div class="math-block">
          \[
          z^{15}=m^{15}\operatorname{cis}\left(15\cdot\frac{n\pi}{5}\right)
          \]
          \[
          z^{15}=m^{15}\operatorname{cis}(3n\pi)
          \]
        </div>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          z^{15}=m^{15}\operatorname{cis}(3n\pi)
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Exam Tip</p>
        <p class="step-text">For polar powers, it helps to say out loud: modulus power first, angle multiplication second.</p>
      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Square once`,
          previewHtml: raw`The \(kx\) terms cancel, leaving \(12=8\sqrt{kx}\).`,
          workingHtml: raw`<p class="step-text">The \(kx\) terms cancel, leaving \(12=8\sqrt{kx}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  12 = 8 \sqrt{k x}
  \]
</div>
</div>`
        },
        {
          title: raw`Square again`,
          previewHtml: raw`Squaring \(12=8\sqrt{kx}\) gives \(144=64kx\).`,
          workingHtml: raw`<p class="step-text">Squaring \(12=8\sqrt{kx}\) gives \(144=64kx\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  144 = 64 k x
  \]
</div>
</div>`
        },
        {
          title: raw`Solve for x`,
          previewHtml: raw`Dividing by \(64k\) gives \(x=\frac{9}{4k}\).`,
          workingHtml: raw`<p class="step-text">Dividing by \(64k\) gives \(x=\frac{9}{4k}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{9}{4k}
              \]
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          x=\frac{9}{4k}
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Exam Tip</p>
        <p class="step-text">Any time you square to solve an equation, it is worth checking the final answer in the original line. This one does work.</p>
      </div>

      `
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
        raw`Let \(z=x+yi\), then rewrite each modulus in terms of \(x\) and \(y\).`,
        raw`Each modulus is a distance in the Argand diagram, using the fixed points \((0,1)\) and \((-1,0)\).`,
        raw`Square both sides, simplify to \(y=mx+c\), then read off the gradient.`
      ],
      answerHtml: raw`
        <p class="step-text">Let \(z=x+yi\). Then:</p>
        <div class="math-block">
          \[
          |z-i|=|x+yi-i|=|x+(y-1)i|=\sqrt{x^2+(y-1)^2}
          \]
          \[
          |z+1|=|x+yi+1|=|(x+1)+yi|=\sqrt{(x+1)^2+y^2}
          \]
        </div>
        <p class="step-text">These are distances from \((x,y)\) to the fixed points \((0,1)\) and \((-1,0)\), so the locus is the set of points equidistant from those two points.</p>
        <p class="step-text">Set the distances equal and simplify:</p>
        <div class="math-block">
          \[
          \sqrt{x^2+(y-1)^2}=\sqrt{(x+1)^2+y^2}
          \]
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
        <p class="step-text">In the form \(y=mx+c\), the gradient is the coefficient of \(x\), so the gradient is \(-1\).</p>
        ${answerBox(raw`
          \[
          \text{Gradient}=-1
          \]
        `)}
        ${tipBox(raw`Once the locus is in the form \(y=mx+c\), the gradient is just the coefficient of \(x\).`)}
      `,
      guidedSteps: [
        {
          title: raw`Write z in coordinates`,
          previewHtml: raw`We have just replaced each \(z\) with \(x+yi\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              |z-i|=|z+1|
              \]
            </div>

<p class="step-text">We have just replaced each \(z\) with \(x+yi\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(|x+yi-i|=|x+yi+1|\)
</div>`
        },
        {
          title: raw`Separate real and imaginary parts`,
          previewHtml: raw`The left side has real part \(x\) and imaginary part \(y-1\), while the right side has real part \(x+1\) and imaginary part \(y\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              |x+yi-i|=|x+yi+1|
              \]
            </div>

<p class="step-text">The left side has real part \(x\) and imaginary part \(y-1\), while the right side has real part \(x+1\) and imaginary part \(y\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(|x+(y-1)i|=|(x+1)+yi|\)
</div>`
        },
        {
          title: raw`Interpret the locus`,
          previewHtml: raw`This locus is made of points that are the same distance from two fixed points in the Argand diagram.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              |x+(y-1)i|=|(x+1)+yi|
              \]
            </div>

<p class="step-text">This locus is made of points that are the same distance from two fixed points in the Argand diagram.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  The points are equidistant from two fixed points
</div>`
        },
        {
          title: raw`Write the first distance`,
          previewHtml: raw`That is the distance from \((x,y)\) to \((0,1)\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              |x+(y-1)i|
              \]
            </div>

<p class="step-text">That is the distance from \((x,y)\) to \((0,1)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \sqrt{x^{2} + \left(y - 1\right)^{2}}
  \]
</div>
</div>`
        },
        {
          title: raw`Write both distances`,
          previewHtml: raw`Each side is now written as a distance formula.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              |x+(y-1)i|=|(x+1)+yi|
              \]
            </div>

<p class="step-text">Each side is now written as a distance formula.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \sqrt{x^{2} + \left(y - 1\right)^{2}} = \sqrt{\left(x + 1\right)^{2} + y^{2}}
  \]
</div>
</div>`
        },
        {
          title: raw`Remove the square roots`,
          previewHtml: raw`Squaring both sides removes the square roots cleanly here.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \sqrt{x^2+(y-1)^2}=\sqrt{(x+1)^2+y^2}
              \]
            </div>

<p class="step-text">Squaring both sides removes the square roots cleanly here.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Square both sides, so \(x^2+(y-1)^2=(x+1)^2+y^2\)
</div>`
        },
        {
          title: raw`Expand both sides`,
          previewHtml: raw`Expanding \((y-1)^2\) and \((x+1)^2\) gives that line of working.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              x^2+(y-1)^2=(x+1)^2+y^2
              \]
            </div>

<p class="step-text">Expanding \((y-1)^2\) and \((x+1)^2\) gives that line of working.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\displaystyle x^2+y^2-2y+1=x^2+2x+1+y^2\)
</div>`
        },
        {
          title: raw`Cancel matching terms`,
          previewHtml: raw`The \(x^2\), \(y^2\), and \(1\) terms cancel, leaving \(-2y=2x\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              x^2+y^2-2y+1=x^2+2x+1+y^2
              \]
            </div>

<p class="step-text">The \(x^2\), \(y^2\), and \(1\) terms cancel, leaving \(-2y=2x\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(-2y=2x\)
</div>`
        },
        {
          title: raw`Make y the subject`,
          previewHtml: raw`Dividing both sides by \(-2\) gives \(y=-x\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              -2y=2x
              \]
            </div>

<p class="step-text">Dividing both sides by \(-2\) gives \(y=-x\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\displaystyle y=-x\)
</div>`
        },
        {
          title: raw`State the gradient`,
          previewHtml: raw`In \(y=-x\), the coefficient of \(x\) is \(-1\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              y=-x
              \]
            </div>

<p class="step-text">In \(y=-x\), the coefficient of \(x\) is \(-1\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                -1
              \]
</div>

        <p class="step-text">Let \(z=x+yi\). Then:</p>
        <div class="math-block">
          \[
          |z-i|=|x+yi-i|=|x+(y-1)i|=\sqrt{x^2+(y-1)^2}
          \]
          \[
          |z+1|=|x+yi+1|=|(x+1)+yi|=\sqrt{(x+1)^2+y^2}
          \]
        </div>
        <p class="step-text">These are distances from \((x,y)\) to the fixed points \((0,1)\) and \((-1,0)\), so the locus is the set of points equidistant from those two points.</p>
        <p class="step-text">Set the distances equal and simplify:</p>
        <div class="math-block">
          \[
          \sqrt{x^2+(y-1)^2}=\sqrt{(x+1)^2+y^2}
          \]
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
        <p class="step-text">In the form \(y=mx+c\), the gradient is the coefficient of \(x\), so the gradient is \(-1\).</p>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          \text{Gradient}=-1
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Exam Tip</p>
        <p class="step-text">Once the locus is in the form \(y=mx+c\), the gradient is just the coefficient of \(x\).</p>
      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Split the numerator cleanly`,
          previewHtml: raw`The numerator is \(15k^2+8+2ki\), so the pair is \((15k^2+8,2k)\).`,
          workingHtml: raw`<p class="step-text">The numerator is \(15k^2+8+2ki\), so the pair is \((15k^2+8,2k)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \left(15 k^{2} + 8,\ 2 k\right)
  \]
</div>
</div>`
        },
        {
          title: raw`Use y = x`,
          previewHtml: raw`Matching the parts leads to \(15k^2+8=2k\), or \(15k^2-2k+8=0\).`,
          workingHtml: raw`<p class="step-text">Matching the parts leads to \(15k^2+8=2k\), or \(15k^2-2k+8=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  15 k^{2} + 8 = 2 k
  \]
</div>
</div>`
        },
        {
          title: raw`Check the discriminant`,
          previewHtml: raw`The discriminant is negative, so there are no real solutions for \(k\).`,
          workingHtml: raw`<p class="step-text">The discriminant is negative, so there are no real solutions for \(k\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                -476
              \]
</div>`
        },
        {
          title: raw`Finish the argument`,
          previewHtml: raw`No real \(k\) works, so \(w\) never lands on \(y=x\).`,
          workingHtml: raw`<p class="step-text">No real \(k\) works, so \(w\) never lands on \(y=x\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  No real value of \(k\) works.
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          \text{No real value of }k\text{ makes }w\text{ lie on }y=x.
          \]

      </div>


      <div class="callout-card mistake">
        <p class="callout-title">Common Mistake</p>
        <p class="step-text">Do not set the original numerator and denominator equal. You need the real part of the simplified quotient to match the imaginary part.</p>
      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Identify the conjugate`,
          previewHtml: raw`The conjugate is \(2k-i\), so the pair is \((2k,-1)\).`,
          workingHtml: raw`<p class="step-text">The conjugate is \(2k-i\), so the pair is \((2k,-1)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \((2k,-1)\)
</div>`
        },
        {
          title: raw`Simplify the numerator`,
          previewHtml: raw`Since \(i^2=-1\), the numerator becomes \(1+2ki\), so the pair is \((1,2k)\).`,
          workingHtml: raw`<p class="step-text">Since \(i^2=-1\), the numerator becomes \(1+2ki\), so the pair is \((1,2k)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \left(1,\ 2 k\right)
  \]
</div>
</div>`
        },
        {
          title: raw`Read off a and b`,
          previewHtml: raw`So \(a=\frac{1}{4k^2+1}\) and \(b=\frac{2k}{4k^2+1}\).`,
          workingHtml: raw`<p class="step-text">So \(a=\frac{1}{4k^2+1}\) and \(b=\frac{2k}{4k^2+1}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \left(\frac{1}{4k^2+1},\frac{2k}{4k^2+1}\right)
              \]
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          \frac{i}{2k+i}=\frac{1}{4k^2+1}+\frac{2k}{4k^2+1}i
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Exam Tip</p>
        <p class="step-text">A quick way to check yourself is this: after rationalising, there should be no \(i\) left in the denominator.</p>
      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Write the discriminant condition`,
          previewHtml: raw`That is the discriminant condition for equal roots.`,
          workingHtml: raw`<p class="step-text">That is the discriminant condition for equal roots.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \left(3 + 2 r\right)^{2} - 8 \left(3 - 2 r\right) = 0
  \]
</div>
</div>`
        },
        {
          title: raw`Simplify the quadratic in r`,
          previewHtml: raw`Expanding and collecting terms gives \(4r^2+28r-15=0\).`,
          workingHtml: raw`<p class="step-text">Expanding and collecting terms gives \(4r^2+28r-15=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  4 r^{2} + 28 r - 15 = 0
  \]
</div>
</div>`
        },
        {
          title: raw`Solve for r`,
          previewHtml: raw`The values are \(r=\frac{1}{2}\) and \(r=-\frac{15}{2}\).`,
          workingHtml: raw`<p class="step-text">The values are \(r=\frac{1}{2}\) and \(r=-\frac{15}{2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{1}{2},\ -\frac{15}{2}
              \]
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          r=\frac{1}{2},\,-\frac{15}{2}
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Exam Tip</p>
        <p class="step-text">This is a classic “equal roots” cue. The moment you see it, think \(b^2-4ac=0\).</p>
      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Clear the denominator`,
          previewHtml: raw`That is the clean starting point for solving for \(w\).`,
          workingHtml: raw`<p class="step-text">That is the clean starting point for solving for \(w\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                w=(2-i)(w+i)
              \]
</div>`
        },
        {
          title: raw`Find w`,
          previewHtml: raw`So \(w=\frac{1}{2}-\frac{3}{2}i\).`,
          workingHtml: raw`<p class="step-text">So \(w=\frac{1}{2}-\frac{3}{2}i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \left(\frac{1}{2},-\frac{3}{2}\right)
              \]
</div>`
        },
        {
          title: raw`Find the modulus`,
          previewHtml: raw`\(|w|=\frac{\sqrt{10}}{2}\).`,
          workingHtml: raw`<p class="step-text">\(|w|=\frac{\sqrt{10}}{2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{\sqrt{10}}{2}
              \]
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          |w|=\frac{\sqrt{10}}{2}
          \]

      </div>


      <div class="callout-card mistake">
        <p class="callout-title">Common Mistake</p>
        <p class="step-text">Do not take the modulus too early. You need the actual value of \(w\) first, then you can find \(|w|\).</p>
      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Use the conjugate root`,
          previewHtml: raw`The conjugate root is \(6+2i\).`,
          workingHtml: raw`<p class="step-text">The conjugate root is \(6+2i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                6+2i
              \]
</div>`
        },
        {
          title: raw`Build the quadratic factor`,
          previewHtml: raw`Multiplying the conjugate pair gives \(z^2-12z+40\).`,
          workingHtml: raw`<p class="step-text">Multiplying the conjugate pair gives \(z^2-12z+40\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  z^{2} - 12 z + 40
  \]
</div>
</div>`
        },
        {
          title: raw`Find the remaining root`,
          previewHtml: raw`The last factor is \(2z-5\), so the remaining roots are \(6+2i\) and \(\frac{5}{2}\).`,
          workingHtml: raw`<p class="step-text">The last factor is \(2z-5\), so the remaining roots are \(6+2i\) and \(\frac{5}{2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                6+2i,\ \frac{5}{2}
              \]
</div>`
        },
        {
          title: raw`Match the coefficient`,
          previewHtml: raw`Expanding gives \(2z^3-29z^2+140z-200\), so \(d=-29\).`,
          workingHtml: raw`<p class="step-text">Expanding gives \(2z^3-29z^2+140z-200\), so \(d=-29\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                -29
              \]
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          d=-29
          \]
          \[
          \text{Other two solutions: }6+2i,\ \frac{5}{2}
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Exam Tip</p>
        <p class="step-text">That little constant-term shortcut saves time: once you have the quadratic factor, use the product of constants to pin down the last factor quickly.</p>
      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Rewrite the locus`,
          previewHtml: raw`That is the clean Cartesian version of the locus.`,
          workingHtml: raw`<p class="step-text">That is the clean Cartesian version of the locus.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \sqrt{\left(x - 1\right)^{2} + \left(y - 7\right)^{2}} = 2 \sqrt{\left(x - 4\right)^{2} + \left(y - 4\right)^{2}}
  \]
</div>
</div>`
        },
        {
          title: raw`Complete the square`,
          previewHtml: raw`The locus is the circle \((x-5)^2+(y-3)^2=8\).`,
          workingHtml: raw`<p class="step-text">The locus is the circle \((x-5)^2+(y-3)^2=8\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \left(x - 5\right)^{2} + \left(y - 3\right)^{2} = 8
  \]
</div>
</div>`
        },
        {
          title: raw`Use x = 3`,
          previewHtml: raw`Substituting \(x=3\) leaves \((y-3)^2=4\).`,
          workingHtml: raw`<p class="step-text">Substituting \(x=3\) leaves \((y-3)^2=4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                (y-3)^2=4
              \]
</div>`
        },
        {
          title: raw`Find u`,
          previewHtml: raw`The two values are \(u=3+5i\) and \(u=3+i\).`,
          workingHtml: raw`<p class="step-text">The two values are \(u=3+5i\) and \(u=3+i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                3+5i,\ 3+i
              \]
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          (x-5)^2+(y-3)^2=8
          \]
          \[
          u=3+5i,\ 3+i
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Exam Tip</p>
        <p class="step-text">When the question gives you \(u=3+di\), it is basically handing you \(x=3\). Use that straight away after you find the circle.</p>
      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Identify the conjugate`,
          previewHtml: raw`That conjugate removes the surd from the denominator.`,
          workingHtml: raw`<p class="step-text">That conjugate removes the surd from the denominator.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \sqrt{2p}+\sqrt{p}
              \]
</div>`
        },
        {
          title: raw`Simplify the denominator`,
          previewHtml: raw`\((\sqrt{2p})^2-(\sqrt{p})^2=2p-p=p\).`,
          workingHtml: raw`<p class="step-text">\((\sqrt{2p})^2-(\sqrt{p})^2=2p-p=p\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                p
              \]
</div>`
        },
        {
          title: raw`Finish the simplification`,
          previewHtml: raw`The whole expression simplifies to \(2+\sqrt{2}\).`,
          workingHtml: raw`<p class="step-text">The whole expression simplifies to \(2+\sqrt{2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                2+\sqrt{2}
              \]
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          2+\sqrt{2}
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Exam Tip</p>
        <p class="step-text">This is one of those nice ones where the parameter disappears completely after rationalising.</p>
      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Read z from the diagram`,
          previewHtml: raw`So \(z=-2+3i\).`,
          workingHtml: raw`<p class="step-text">So \(z=-2+3i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                (-2,3)
              \]
</div>`
        },
        {
          title: raw`Find the plotted point`,
          previewHtml: raw`Squaring gives \(w=-5-12i\), so the point is \((-5,-12)\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              z=-2+3i
              \]
              \[
              z^2=(-2+3i)^2=4-12i+9i^2
              \]
              \[
              z^2=-5-12i
              \]
            </div>

<p class="step-text">Squaring gives \(w=-5-12i\), so the point is \((-5,-12)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                (-5,-12)
              \]
</div>

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

      <div class="graph-frame question-graph-frame">
        <svg class="graph-svg" viewBox="0 0 420 420" role="img" aria-label="Argand diagram showing z at negative 2 comma 3 and w at negative 5 comma negative 12">
          <rect class="graph-bg" x="0" y="0" width="420" height="420"></rect>
          <line class="graph-grid-line" x1="28" y1="392" x2="28" y2="28"></line><line class="graph-grid-line" x1="58.33" y1="392" x2="58.33" y2="28"></line><line class="graph-grid-line" x1="88.67" y1="392" x2="88.67" y2="28"></line><line class="graph-grid-line" x1="119" y1="392" x2="119" y2="28"></line><line class="graph-grid-line" x1="149.33" y1="392" x2="149.33" y2="28"></line><line class="graph-grid-line" x1="179.67" y1="392" x2="179.67" y2="28"></line><line class="graph-grid-line" x1="210" y1="392" x2="210" y2="28"></line><line class="graph-grid-line" x1="240.33" y1="392" x2="240.33" y2="28"></line><line class="graph-grid-line" x1="270.67" y1="392" x2="270.67" y2="28"></line><line class="graph-grid-line" x1="301" y1="392" x2="301" y2="28"></line><line class="graph-grid-line" x1="331.33" y1="392" x2="331.33" y2="28"></line><line class="graph-grid-line" x1="361.67" y1="392" x2="361.67" y2="28"></line><line class="graph-grid-line" x1="392" y1="392" x2="392" y2="28"></line><line class="graph-grid-line" x1="28" y1="392" x2="392" y2="392"></line><line class="graph-grid-line" x1="28" y1="373.8" x2="392" y2="373.8"></line><line class="graph-grid-line" x1="28" y1="355.6" x2="392" y2="355.6"></line><line class="graph-grid-line" x1="28" y1="337.4" x2="392" y2="337.4"></line><line class="graph-grid-line" x1="28" y1="319.2" x2="392" y2="319.2"></line><line class="graph-grid-line" x1="28" y1="301" x2="392" y2="301"></line><line class="graph-grid-line" x1="28" y1="282.8" x2="392" y2="282.8"></line><line class="graph-grid-line" x1="28" y1="264.6" x2="392" y2="264.6"></line><line class="graph-grid-line" x1="28" y1="246.4" x2="392" y2="246.4"></line><line class="graph-grid-line" x1="28" y1="228.2" x2="392" y2="228.2"></line><line class="graph-grid-line" x1="28" y1="210" x2="392" y2="210"></line><line class="graph-grid-line" x1="28" y1="191.8" x2="392" y2="191.8"></line><line class="graph-grid-line" x1="28" y1="173.6" x2="392" y2="173.6"></line><line class="graph-grid-line" x1="28" y1="155.4" x2="392" y2="155.4"></line><line class="graph-grid-line" x1="28" y1="137.2" x2="392" y2="137.2"></line><line class="graph-grid-line" x1="28" y1="119" x2="392" y2="119"></line><line class="graph-grid-line" x1="28" y1="100.8" x2="392" y2="100.8"></line><line class="graph-grid-line" x1="28" y1="82.6" x2="392" y2="82.6"></line><line class="graph-grid-line" x1="28" y1="64.4" x2="392" y2="64.4"></line><line class="graph-grid-line" x1="28" y1="46.2" x2="392" y2="46.2"></line><line class="graph-grid-line" x1="28" y1="28" x2="392" y2="28"></line>
          <line class="graph-axis" x1="28" y1="137.2" x2="392" y2="137.2"></line>
          <line class="graph-axis" x1="270.67" y1="392" x2="270.67" y2="28"></line>
          <circle class="question-origin" cx="270.67" cy="137.2" r="4.5"></circle>
          <text class="graph-label" x="381.38" y="144.48" text-anchor="end">Real</text>
          <text class="graph-label" x="270.67" y="31.64" text-anchor="middle">Imaginary</text>
          <circle class="graph-point" cx="210" cy="82.6" r="5"></circle><text class="graph-label" x="223.65" y="75.32">z</text><circle class="graph-point-secondary" cx="119" cy="355.6" r="5"></circle><text class="graph-label" x="132.65" y="347.41">w</text>
        </svg>
      </div>


      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          w=-5-12i
          \]
          \[
          \text{Plot the point }(-5,-12).
          \]

      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Clear the inverse`,
          previewHtml: raw`Follow the working to clear the inverse.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \overline{z}=3-di
              \]
              \[
              (3-di)(3+di)=10d
              \]
            </div>

<p class="step-text">Multiplying by \(z\) gives \(z\overline{z}=10d\), which becomes \(9+d^2=10d\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  9 + d^{2} = 10 d
  \]
</div>
</div>`
        },
        {
          title: raw`Solve for d`,
          previewHtml: raw`The solutions are \(d=9\) and \(d=1\).`,
          workingHtml: raw`
            <div class="math-block">
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

<p class="step-text">The solutions are \(d=9\) and \(d=1\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                9,\ 1
              \]
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          d=9,\ 1
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Exam Tip</p>
        <p class="step-text">As soon as you see \(\overline{z}\) and \(z^{-1}\) together, think about multiplying through by \(z\). It usually collapses nicely.</p>
      </div>

      `
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
          3k^2\operatorname{cis}\left(\frac{\pi}{4}\right),\;
          3k^2\operatorname{cis}\left(\frac{3\pi}{4}\right),\;
          3k^2\operatorname{cis}\left(-\frac{3\pi}{4}\right),\;
          3k^2\operatorname{cis}\left(-\frac{\pi}{4}\right)
          \]
        </div>
        ${answerBox(raw`
          \[
          z=3k^2\operatorname{cis}\left(\frac{\pi}{4}\right),\;
          3k^2\operatorname{cis}\left(\frac{3\pi}{4}\right),\;
          3k^2\operatorname{cis}\left(-\frac{3\pi}{4}\right),\;
          3k^2\operatorname{cis}\left(-\frac{\pi}{4}\right)
          \]
        `)}
        ${tipBox(raw`Make sure to use a different letter for your root counter so it does not get confused with the real constant \(k\).`)}
      `,
      guidedSteps: [
        {
          title: raw`Rewrite the right-hand side`,
          previewHtml: raw`The modulus is \(81k^8\).`,
          workingHtml: raw`<p class="step-text">The modulus is \(81k^8\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                81k^8
              \]
</div>`
        },
        {
          title: raw`General argument form`,
          previewHtml: raw`The arguments are \(\frac{\pi}{4}+n\frac{\pi}{2}\).`,
          workingHtml: raw`<p class="step-text">The arguments are \(\frac{\pi}{4}+n\frac{\pi}{2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{\pi}{4}+n\frac{\pi}{2}
              \]
</div>`
        },
        {
          title: raw`List the four arguments`,
          previewHtml: raw`Those give the four fourth roots in polar form.`,
          workingHtml: raw`<p class="step-text">Those give the four fourth roots in polar form.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{\pi}{4},\ \frac{3 \pi}{4},\ \frac{-3 \pi}{4},\ \frac{-\pi}{4}
  \]
</div>
</div>

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
          3k^2\operatorname{cis}\left(\frac{\pi}{4}\right),\;
          3k^2\operatorname{cis}\left(\frac{3\pi}{4}\right),\;
          3k^2\operatorname{cis}\left(-\frac{3\pi}{4}\right),\;
          3k^2\operatorname{cis}\left(-\frac{\pi}{4}\right)
          \]
        </div>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          z=3k^2\operatorname{cis}\left(\frac{\pi}{4}\right),\;
          3k^2\operatorname{cis}\left(\frac{3\pi}{4}\right),\;
          3k^2\operatorname{cis}\left(-\frac{3\pi}{4}\right),\;
          3k^2\operatorname{cis}\left(-\frac{\pi}{4}\right)
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Exam Tip</p>
        <p class="step-text">Make sure to use a different letter for your root counter so it does not get confused with the real constant \(k\).</p>
      </div>

      `
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
      guidedSteps: [
        {
          title: raw`Expand the cube`,
          previewHtml: raw`That is the expanded form of \(\left(x+\frac{1}{x}\right)^3\).`,
          workingHtml: raw`<p class="step-text">That is the expanded form of \(\left(x+\frac{1}{x}\right)^3\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  p^{3} = x^{3} + \frac{1}{x^{3}} + 3 x + \frac{3}{x}
  \]
</div>
</div>`
        },
        {
          title: raw`Substitute the given relation`,
          previewHtml: raw`Since \(x+\frac{1}{x}=p\), the whole bracket becomes \(3p\).`,
          workingHtml: raw`<p class="step-text">Since \(x+\frac{1}{x}=p\), the whole bracket becomes \(3p\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                3p
              \]
</div>`
        },
        {
          title: raw`Isolate the target expression`,
          previewHtml: raw`Rearranging gives \(x^3+\frac{1}{x^3}=p^3-3p\).`,
          workingHtml: raw`<p class="step-text">Rearranging gives \(x^3+\frac{1}{x^3}=p^3-3p\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                p^3-3p
              \]
</div>

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

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          x^3+\frac{1}{x^3}=p^3-3p
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Exam Tip</p>
        <p class="step-text">That last substitution matters. Once you see \(x+\frac{1}{x}\) appear again, replace it with \(p\) straight away.</p>
      </div>

      `
        }
      ]
    })
  };
}());
