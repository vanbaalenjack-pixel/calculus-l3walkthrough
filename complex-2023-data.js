(function () {
  const raw = String.raw;
  const paperHref = "level-3-complex-numbers-2023.html";
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
    return calloutBox("tip", "Keep Thinking", text);
  }

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return "complex-2023.html?q=" + encodeURIComponent(id);
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
      browserTitle: "2023 Level 3 Complex Numbers Paper — " + questionLabel(id),
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

  function locusDiagramHtml() {
    const width = 420;
    const height = 420;
    const padding = 28;
    const xMin = -2;
    const xMax = 6;
    const yMin = -5;
    const yMax = 3;
    const scale = createScale(width, height, padding, xMin, xMax, yMin, yMax);
    const gridLines = [];
    const radius = Math.abs(scale.x(5) - scale.x(2));
    const m = Math.sqrt(3);

    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 1) {
      gridLines.push(lineMarkup(scale, x, yMin, x, yMax, "graph-grid-line"));
    }

    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += 1) {
      gridLines.push(lineMarkup(scale, xMin, y, xMax, y, "graph-grid-line"));
    }

    return `
      <div class="graph-frame question-graph-frame">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Argand diagram of the circle locus and tangent line">
          <rect class="graph-bg" x="0" y="0" width="${width}" height="${height}"></rect>
          ${gridLines.join("")}
          ${lineMarkup(scale, xMin, 0, xMax, 0, "graph-axis")}
          ${lineMarkup(scale, 0, yMin, 0, yMax, "graph-axis")}
          ${circleMarkup(scale, 0, 0, 4.5, "question-origin")}
          <circle class="graph-curve-secondary" cx="${scale.x(2)}" cy="${scale.y(-1)}" r="${radius}"></circle>
          ${lineMarkup(scale, -0.5, m * -0.5 - 1, 2.3, m * 2.3 - 1, "graph-curve")}
          ${circleMarkup(scale, 2, -1, 5, "graph-point")}
          ${textMarkup(scale, 2.24, -0.72, "C(2,-1)", "graph-label")}
          ${textMarkup(scale, 5.8, -0.22, "Real", "graph-label", ' text-anchor="end"')}
          ${textMarkup(scale, -0.18, 2.72, "Imaginary", "graph-label", ' text-anchor="middle"')}
        </svg>
      </div>
    `;
  }

  window.Complex2023Walkthroughs = {
    "1a": createConfig("1a", "2023 Paper — Expanding a surd binomial", {
      focus: raw`expanding a binomial square and collecting the constant, \(p\), and \(\sqrt{p}\) terms into the requested form.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Write }(5-2\sqrt{p})^2\text{ in the form }a+bp+c\sqrt{p}\text{ where }a,\ b,\ \text{and }c\text{ are integers.}
          \]
        </div>
      `,
      hints: [
        raw`Use the identity \((a-b)^2=a^2-2ab+b^2\).`,
        raw`Treat \(\sqrt{p}\) as one object while you expand.`,
        raw`Reorder the final expression into constant, \(p\), then \(\sqrt{p}\).`
      ],
      answerHtml: raw`
        <p class="step-text">Expand the square carefully and keep the surd term separate.</p>
        <div class="math-block">
          \[
          (5-2\sqrt{p})^2=(5-2\sqrt{p})(5-2\sqrt{p})
          \]
          \[
          =25-20\sqrt{p}+4p
          \]
          \[
          =25+4p-20\sqrt{p}
          \]
        </div>
        ${answerBox(raw`
          \[
          (5-2\sqrt{p})^2=25+4p-20\sqrt{p}
          \]
        `)}
        ${tipBox(raw`A surd like \(\sqrt{p}\) does not combine with the plain \(p\)-term, so keep those parts separate when you simplify.`)}
      `,
      guidedSteps: [
        {
          title: raw`Identify the expansion rule`,
          previewHtml: raw`We square the first term, subtract twice the product, then add the square of the second term.`,
          workingHtml: raw`<p class="step-text">We square the first term, subtract twice the product, then add the square of the second term.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \((a-b)^2=a^2-2ab+b^2\)
</div>`
        },
        {
          title: raw`Find the middle term`,
          previewHtml: raw`The middle term is \(-2(5)(2\sqrt{p})=-20\sqrt{p}\).`,
          workingHtml: raw`<p class="step-text">The middle term is \(-2(5)(2\sqrt{p})=-20\sqrt{p}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(-20\sqrt{p}\)
</div>`
        },
        {
          title: raw`Collect the terms`,
          previewHtml: raw`That matches the requested form \(a+bp+c\sqrt{p}\).`,
          workingHtml: raw`<p class="step-text">That matches the requested form \(a+bp+c\sqrt{p}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,25+4p-20\sqrt{p}\)
</div>

        <p class="step-text">Expand the square carefully and keep the surd term separate.</p>
        <div class="math-block">
          \[
          (5-2\sqrt{p})^2=(5-2\sqrt{p})(5-2\sqrt{p})
          \]
          \[
          =25-20\sqrt{p}+4p
          \]
          \[
          =25+4p-20\sqrt{p}
          \]
        </div>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          (5-2\sqrt{p})^2=25+4p-20\sqrt{p}
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Keep Thinking</p>
        <p class="step-text">A surd like \(\sqrt{p}\) does not combine with the plain \(p\)-term, so keep those parts separate when you simplify.</p>
      </div>

      `
        }
      ]
    }),

    "1b": createConfig("1b", "2023 Paper — No real roots and the discriminant", {
      focus: raw`using the discriminant condition \(b^2-4ac<0\) to decide when a quadratic has no real roots.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find the value(s) of }r\text{ so that the quadratic equation }4x^2-4x+3r-2=0\text{ has no real roots.}
          \]
        </div>
      `,
      hints: [
        raw`A quadratic has no real roots when its discriminant is negative.`,
        raw`Here \(a=4\), \(b=-4\), and \(c=3r-2\).`,
        raw`Solve the inequality you get after substitution.`
      ],
      answerHtml: raw`
        <p class="step-text">A quadratic has no real roots exactly when its discriminant is negative.</p>
        <div class="math-block">
          \[
          b^2-4ac<0
          \]
          \[
          (-4)^2-4(4)(3r-2)<0
          \]
          \[
          16-48r+32<0
          \]
          \[
          48-48r<0
          \]
          \[
          r>1
          \]
        </div>
        ${answerBox(raw`
          \[
          r>1
          \]
        `)}
        ${tipBox(raw`When the constant term involves a parameter, the discriminant is usually the cleanest way to describe when the roots change type.`)}
      `,
      guidedSteps: [
        {
          title: raw`Recognise the condition`,
          previewHtml: raw`A negative discriminant means the roots are complex, not real.`,
          workingHtml: raw`<p class="step-text">A negative discriminant means the roots are complex, not real.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,b^2-4ac<0\)
</div>`
        },
        {
          title: raw`Substitute the coefficients`,
          previewHtml: raw`Here \(a=4\), \(b=-4\), and \(c=3r-2\).`,
          workingHtml: raw`<p class="step-text">Here \(a=4\), \(b=-4\), and \(c=3r-2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,16-4(4)(3r-2)<0\)
</div>`
        },
        {
          title: raw`Solve the inequality`,
          previewHtml: raw`Dividing by \(-48\) flips the inequality sign.`,
          workingHtml: raw`<p class="step-text">Dividing by \(-48\) flips the inequality sign.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,r>1\)
</div>

        <p class="step-text">A quadratic has no real roots exactly when its discriminant is negative.</p>
        <div class="math-block">
          \[
          b^2-4ac<0
          \]
          \[
          (-4)^2-4(4)(3r-2)<0
          \]
          \[
          16-48r+32<0
          \]
          \[
          48-48r<0
          \]
          \[
          r>1
          \]
        </div>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          r>1
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Keep Thinking</p>
        <p class="step-text">When the constant term involves a parameter, the discriminant is usually the cleanest way to describe when the roots change type.</p>
      </div>

      `
        }
      ]
    }),

    "1c": createConfig("1c", "2023 Paper — Using the real part of a quotient", {
      focus: raw`rewriting \(\frac{z}{w}\) by multiplying by the conjugate of the denominator, then reading the real part to prove the required result.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{If }z=p+qi\text{ and }w=a+bi\text{ and }\operatorname{Re}\left(\frac{z}{w}\right)=0,\text{ then show that }ap=-bq.
          \]
        </div>
      `,
      hints: [
        raw`To find the real part of a fraction, make the denominator real first.`,
        raw`Multiply top and bottom by the conjugate \(a-bi\).`,
        raw`Once the denominator is real, the real part is just the non-\(i\) part of the numerator divided by that denominator.`
      ],
      answerHtml: raw`
        <p class="step-text">Start by rationalising the denominator.</p>
        <div class="math-block">
          \[
          \frac{z}{w}=\frac{p+qi}{a+bi}\cdot\frac{a-bi}{a-bi}
          =\frac{(p+qi)(a-bi)}{a^2+b^2}
          \]
          \[
          =\frac{ap-bpi+aqi-bqi^2}{a^2+b^2}
          =\frac{ap+bq+(aq-bp)i}{a^2+b^2}
          \]
        </div>
        <p class="step-text">So the real part is \(\frac{ap+bq}{a^2+b^2}\).</p>
        <div class="math-block">
          \[
          \operatorname{Re}\left(\frac{z}{w}\right)=0
          \Rightarrow \frac{ap+bq}{a^2+b^2}=0
          \Rightarrow ap+bq=0
          \Rightarrow ap=-bq
          \]
        </div>
        ${answerBox(raw`
          \[
          ap=-bq
          \]
        `)}
        ${tipBox(raw`Whenever a complex quotient asks about real or imaginary parts, multiplying by the conjugate of the denominator is usually the key first move.`)}
      `,
      guidedSteps: [
        {
          title: raw`Make the denominator real`,
          previewHtml: raw`The conjugate turns the denominator into \(a^2+b^2\).`,
          workingHtml: raw`<p class="step-text">The conjugate turns the denominator into \(a^2+b^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\frac{a-bi}{a-bi}\)
</div>`
        },
        {
          title: raw`Expand the numerator`,
          previewHtml: raw`Follow the working to expand the numerator.`,
          workingHtml: raw`<p class="step-text">The \(i^2\) term becomes \(-1\), which turns \(-bqi^2\) into \(+bq\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \((p+qi)(a-bi)=ap+bq+(aq-bp)i\)
</div>`
        },
        {
          title: raw`Read the real part`,
          previewHtml: raw`That is the non-\(i\) part of the quotient.`,
          workingHtml: raw`<p class="step-text">That is the non-\(i\) part of the quotient.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\frac{ap+bq}{a^2+b^2}\)
</div>`
        },
        {
          title: raw`Finish the proof`,
          previewHtml: raw`Multiply through by \(a^2+b^2\) and rearrange.`,
          workingHtml: raw`<p class="step-text">Multiply through by \(a^2+b^2\) and rearrange.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,ap=-bq\)
</div>

        <p class="step-text">Start by rationalising the denominator.</p>
        <div class="math-block">
          \[
          \frac{z}{w}=\frac{p+qi}{a+bi}\cdot\frac{a-bi}{a-bi}
          =\frac{(p+qi)(a-bi)}{a^2+b^2}
          \]
          \[
          =\frac{ap-bpi+aqi-bqi^2}{a^2+b^2}
          =\frac{ap+bq+(aq-bp)i}{a^2+b^2}
          \]
        </div>
        <p class="step-text">So the real part is \(\frac{ap+bq}{a^2+b^2}\).</p>
        <div class="math-block">
          \[
          \operatorname{Re}\left(\frac{z}{w}\right)=0
          \Rightarrow \frac{ap+bq}{a^2+b^2}=0
          \Rightarrow ap+bq=0
          \Rightarrow ap=-bq
          \]
        </div>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          ap=-bq
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Keep Thinking</p>
        <p class="step-text">Whenever a complex quotient asks about real or imaginary parts, multiplying by the conjugate of the denominator is usually the key first move.</p>
      </div>

      `
        }
      ]
    }),

    "1d": createConfig("1d", "2023 Paper — Conjugate roots in a cubic", {
      focus: raw`using the conjugate-root rule for real coefficients, then factorising the cubic to find the third root and the real constant \(d\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{One solution of the equation }z^3-8z^2+26z+d=0\text{ is }z=5-i.
          \]
          \[
          \text{If }d\text{ is real, find the value of }d\text{ and the other two solutions of the equation.}
          \]
        </div>
      `,
      hints: [
        raw`Real coefficients force non-real roots to occur in conjugate pairs.`,
        raw`If \(5-i\) is a root, then \(5+i\) is another root.`,
        raw`Use those two roots to make a quadratic factor, then compare with the original cubic.`
      ],
      answerHtml: raw`
        <p class="step-text">Because the coefficients are real, the conjugate root \(5+i\) must also be a solution.</p>
        <div class="math-block">
          \[
          (z-(5-i))(z-(5+i))=(z-5+i)(z-5-i)=(z-5)^2+1
          \]
          \[
          =z^2-10z+26
          \]
        </div>
        <p class="step-text">So the cubic must factor as \((z+2)(z^2-10z+26)\).</p>
        <div class="math-block">
          \[
          (z+2)(z^2-10z+26)=z^3-8z^2+6z+52
          \]
        </div>
        <p class="step-text">Matching this with \(z^3-8z^2+26z+d\) gives the third root and the constant.</p>
        ${answerBox(raw`
          \[
          d=52,\qquad z=5+i,\qquad z=-2
          \]
        `)}
        ${tipBox(raw`Once you know a conjugate pair, multiplying the two factors together first usually makes the remaining factor much easier to spot.`)}
      `,
      guidedSteps: [
        {
          title: raw`Use the real-coefficient rule`,
          previewHtml: raw`Non-real roots of real polynomials come in conjugate pairs.`,
          workingHtml: raw`<p class="step-text">Non-real roots of real polynomials come in conjugate pairs.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,5+i\)
</div>`
        },
        {
          title: raw`Build the quadratic factor`,
          previewHtml: raw`The product is \((z-5)^2+1=z^2-10z+26\).`,
          workingHtml: raw`<p class="step-text">The product is \((z-5)^2+1=z^2-10z+26\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z^2-10z+26\)
</div>`
        },
        {
          title: raw`Find the remaining factor`,
          previewHtml: raw`\((z+2)(z^2-10z+26)\) matches the leading terms of the cubic.`,
          workingHtml: raw`<p class="step-text">\((z+2)(z^2-10z+26)\) matches the leading terms of the cubic.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z+2\)
</div>`
        },
        {
          title: raw`State the remaining results`,
          previewHtml: raw`Those are the full remaining results.`,
          workingHtml: raw`<p class="step-text">Those are the full remaining results.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z=5+i,\ z=-2,\ d=52\)
</div>

        <p class="step-text">Because the coefficients are real, the conjugate root \(5+i\) must also be a solution.</p>
        <div class="math-block">
          \[
          (z-(5-i))(z-(5+i))=(z-5+i)(z-5-i)=(z-5)^2+1
          \]
          \[
          =z^2-10z+26
          \]
        </div>
        <p class="step-text">So the cubic must factor as \((z+2)(z^2-10z+26)\).</p>
        <div class="math-block">
          \[
          (z+2)(z^2-10z+26)=z^3-8z^2+6z+52
          \]
        </div>
        <p class="step-text">Matching this with \(z^3-8z^2+26z+d\) gives the third root and the constant.</p>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          d=52,\qquad z=5+i,\qquad z=-2
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Keep Thinking</p>
        <p class="step-text">Once you know a conjugate pair, multiplying the two factors together first usually makes the remaining factor much easier to spot.</p>
      </div>

      `
        }
      ]
    }),

    "1e": createConfig("1e", "2023 Paper — Modulus equation with a complex quotient", {
      focus: raw`simplifying \(\frac{u}{v}\), rewriting the modulus equation, then squaring to solve for the real parameter \(k\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{The complex numbers }u\text{ and }v\text{ are }u=3+i\text{ and }v=1+2i.
          \]
          \[
          \text{Determine the possible value(s) of the real constant }k\text{ if }\left|\frac{u}{v}+k\right|=\sqrt{k+2}.
          \]
        </div>
      `,
      hints: [
        raw`Start by simplifying \(\frac{u}{v}\).`,
        raw`Once you have \(\frac{u}{v}\) in \(a+bi\) form, combine the real part with \(k\).`,
        raw`Square the modulus equation to remove the square root.`
      ],
      answerHtml: raw`
        <p class="step-text">First simplify the quotient.</p>
        <div class="math-block">
          \[
          \frac{u}{v}=\frac{3+i}{1+2i}\cdot\frac{1-2i}{1-2i}
          =\frac{(3+i)(1-2i)}{(1+2i)(1-2i)}
          \]
          \[
          =\frac{5-5i}{5}=1-i
          \]
        </div>
        <p class="step-text">Now substitute into the equation.</p>
        <div class="math-block">
          \[
          |1-i+k|=\sqrt{k+2}
          \]
          \[
          |(1+k)-i|^2=k+2
          \]
          \[
          (1+k)^2+1=k+2
          \]
          \[
          k^2+k=0
          \]
          \[
          k(k+1)=0
          \]
        </div>
        ${answerBox(raw`
          \[
          k=0\quad\text{or}\quad k=-1
          \]
        `)}
        ${tipBox(raw`When a modulus equals a square root, squaring both sides is helpful once the complex number is already in the form \(a+bi\).`)}
      `,
      guidedSteps: [
        {
          title: raw`Simplify the quotient`,
          previewHtml: raw`Rationalising the denominator gives \(\frac{5-5i}{5}=1-i\).`,
          workingHtml: raw`<p class="step-text">Rationalising the denominator gives \(\frac{5-5i}{5}=1-i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,1-i\)
</div>`
        },
        {
          title: raw`Rewrite the modulus`,
          previewHtml: raw`Since \(k\) is real, it combines with the real part of \(1-i\).`,
          workingHtml: raw`<p class="step-text">Since \(k\) is real, it combines with the real part of \(1-i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,|1-i+k|=\sqrt{k+2}\)
</div>`
        },
        {
          title: raw`Square the equation`,
          previewHtml: raw`The modulus squared is the sum of the squares of the real and imaginary parts.`,
          workingHtml: raw`<p class="step-text">The modulus squared is the sum of the squares of the real and imaginary parts.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,(1+k)^2+1=k+2\)
</div>`
        },
        {
          title: raw`Solve for k`,
          previewHtml: raw`The equation factors as \(k(k+1)=0\).`,
          workingHtml: raw`<p class="step-text">The equation factors as \(k(k+1)=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,k=0\text{ or }k=-1\)
</div>

        <p class="step-text">First simplify the quotient.</p>
        <div class="math-block">
          \[
          \frac{u}{v}=\frac{3+i}{1+2i}\cdot\frac{1-2i}{1-2i}
          =\frac{(3+i)(1-2i)}{(1+2i)(1-2i)}
          \]
          \[
          =\frac{5-5i}{5}=1-i
          \]
        </div>
        <p class="step-text">Now substitute into the equation.</p>
        <div class="math-block">
          \[
          |1-i+k|=\sqrt{k+2}
          \]
          \[
          |(1+k)-i|^2=k+2
          \]
          \[
          (1+k)^2+1=k+2
          \]
          \[
          k^2+k=0
          \]
          \[
          k(k+1)=0
          \]
        </div>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          k=0\quad\text{or}\quad k=-1
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Keep Thinking</p>
        <p class="step-text">When a modulus equals a square root, squaring both sides is helpful once the complex number is already in the form \(a+bi\).</p>
      </div>

      `
        }
      ]
    }),

    "2a": createConfig("2a", "2023 Paper — Dividing in polar form", {
      focus: raw`dividing complex numbers written in polar form by dividing the moduli and subtracting the arguments.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{If }u=q^6\operatorname{cis}\frac{5\pi}{8}\text{ and }v=q^2\operatorname{cis}\frac{2\pi}{5},\text{ write }\frac{u}{v}\text{ in the form }r\operatorname{cis}\theta.
          \]
        </div>
      `,
      hints: [
        raw`For a quotient in polar form, divide the moduli and subtract the arguments.`,
        raw`\(\frac{q^6}{q^2}=q^4\).`,
        raw`Use a common denominator of \(40\) for the angles.`
      ],
      answerHtml: raw`
        <p class="step-text">Division in polar form means divide the moduli and subtract the arguments.</p>
        <div class="math-block">
          \[
          \frac{u}{v}=\frac{q^6\operatorname{cis}\frac{5\pi}{8}}{q^2\operatorname{cis}\frac{2\pi}{5}}
          =q^4\operatorname{cis}\left(\frac{5\pi}{8}-\frac{2\pi}{5}\right)
          \]
          \[
          =q^4\operatorname{cis}\left(\frac{25\pi}{40}-\frac{16\pi}{40}\right)
          =q^4\operatorname{cis}\frac{9\pi}{40}
          \]
        </div>
        ${answerBox(raw`
          \[
          \frac{u}{v}=q^4\operatorname{cis}\frac{9\pi}{40}
          \]
        `)}
        ${tipBox(raw`Multiplication in polar form adds arguments, while division subtracts them. That one distinction saves a lot of careless errors.`)}
      `,
      guidedSteps: [
        {
          title: raw`Identify the polar rule`,
          previewHtml: raw`That is the quotient rule for polar form.`,
          workingHtml: raw`<p class="step-text">That is the quotient rule for polar form.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Divide the moduli and subtract the arguments.
</div>`
        },
        {
          title: raw`Simplify the modulus`,
          previewHtml: raw`\(\frac{q^6}{q^2}=q^4\).`,
          workingHtml: raw`<p class="step-text">\(\frac{q^6}{q^2}=q^4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,q^4\)
</div>`
        },
        {
          title: raw`Find the argument`,
          previewHtml: raw`The angle simplifies neatly to \(\frac{9\pi}{40}\).`,
          workingHtml: raw`<p class="step-text">The angle simplifies neatly to \(\frac{9\pi}{40}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,\frac{9\pi}{40}\)
</div>

        <p class="step-text">Division in polar form means divide the moduli and subtract the arguments.</p>
        <div class="math-block">
          \[
          \frac{u}{v}=\frac{q^6\operatorname{cis}\frac{5\pi}{8}}{q^2\operatorname{cis}\frac{2\pi}{5}}
          =q^4\operatorname{cis}\left(\frac{5\pi}{8}-\frac{2\pi}{5}\right)
          \]
          \[
          =q^4\operatorname{cis}\left(\frac{25\pi}{40}-\frac{16\pi}{40}\right)
          =q^4\operatorname{cis}\frac{9\pi}{40}
          \]
        </div>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          \frac{u}{v}=q^4\operatorname{cis}\frac{9\pi}{40}
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Keep Thinking</p>
        <p class="step-text">Multiplication in polar form adds arguments, while division subtracts them. That one distinction saves a lot of careless errors.</p>
      </div>

      `
        }
      ]
    }),

    "2b": createConfig("2b", "2023 Paper — Modulus in terms of k", {
      focus: raw`subtracting two complex numbers and then using the modulus formula \(|a+bi|=\sqrt{a^2+b^2}\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{If }z=1+ki\text{ and }w=7-ki,\text{ then find }|z-w|,\text{ giving your answer in terms of }k.
          \]
        </div>
      `,
      hints: [
        raw`Find \(z-w\) first, not the two moduli separately.`,
        raw`Combine the real parts and imaginary parts carefully.`,
        raw`Then apply \(|a+bi|=\sqrt{a^2+b^2}\).`
      ],
      answerHtml: raw`
        <p class="step-text">Subtract first, then take the modulus.</p>
        <div class="math-block">
          \[
          z-w=(1+ki)-(7-ki)
          \]
          \[
          =-6+2ki
          \]
          \[
          |z-w|=\sqrt{(-6)^2+(2k)^2}
          =\sqrt{36+4k^2}
          =2\sqrt{9+k^2}
          \]
        </div>
        ${answerBox(raw`
          \[
          |z-w|=2\sqrt{9+k^2}
          \]
        `)}
        ${tipBox(raw`A modulus question often becomes much simpler once the complex number is written in standard \(a+bi\) form first.`)}
      `,
      guidedSteps: [
        {
          title: raw`Subtract the complex numbers`,
          previewHtml: raw`The imaginary parts add because subtracting \(-ki\) gives \(+ki\).`,
          workingHtml: raw`<p class="step-text">The imaginary parts add because subtracting \(-ki\) gives \(+ki\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,-6+2ki\)
</div>`
        },
        {
          title: raw`Use the modulus formula`,
          previewHtml: raw`Square the real part and the imaginary coefficient separately.`,
          workingHtml: raw`<p class="step-text">Square the real part and the imaginary coefficient separately.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,\sqrt{36+4k^2}\)
</div>`
        },
        {
          title: raw`Simplify the result`,
          previewHtml: raw`Factor \(4\) out from under the square root.`,
          workingHtml: raw`<p class="step-text">Factor \(4\) out from under the square root.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,2\sqrt{9+k^2}\)
</div>

        <p class="step-text">Subtract first, then take the modulus.</p>
        <div class="math-block">
          \[
          z-w=(1+ki)-(7-ki)
          \]
          \[
          =-6+2ki
          \]
          \[
          |z-w|=\sqrt{(-6)^2+(2k)^2}
          =\sqrt{36+4k^2}
          =2\sqrt{9+k^2}
          \]
        </div>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          |z-w|=2\sqrt{9+k^2}
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Keep Thinking</p>
        <p class="step-text">A modulus question often becomes much simpler once the complex number is written in standard \(a+bi\) form first.</p>
      </div>

      `
        }
      ]
    }),

    "2c": createConfig("2c", "2023 Paper — Finding an argument from an equation", {
      focus: raw`rearranging a complex equation to isolate \(z\), then using the quadrant and tangent ratio to find \(\operatorname{Arg}(z)\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find }\operatorname{Arg}(z)\text{ if }\frac{13z}{z+1}=11-3i.
          \]
        </div>
      `,
      hints: [
        raw`Clear the denominator first by multiplying both sides by \(z+1\).`,
        raw`Gather the \(z\)-terms on one side.`,
        raw`Once you have \(z\) in \(a+bi\) form, use its position on the Argand diagram to decide the argument.`
      ],
      answerHtml: raw`
        <p class="step-text">Solve for \(z\) before thinking about the argument.</p>
        <div class="math-block">
          \[
          13z=(11-3i)(z+1)
          \]
          \[
          13z=11z+11-3iz-3i
          \]
          \[
          2z+3iz=11-3i
          \]
          \[
          z(2+3i)=11-3i
          \]
          \[
          z=\frac{11-3i}{2+3i}=1-3i
          \]
        </div>
        <p class="step-text">The point \((1,-3)\) lies in the fourth quadrant, so the principal argument is negative.</p>
        ${answerBox(raw`
          \[
          \operatorname{Arg}(z)=\operatorname{Arg}(1-3i)=-\tan^{-1}(3)\approx -71.6^\circ
          \]
        `)}
        ${tipBox(raw`Always decide the quadrant before stating an argument. The tangent ratio gives the reference angle, not automatically the final angle.`)}
      `,
      guidedSteps: [
        {
          title: raw`Clear the denominator`,
          previewHtml: raw`That removes the denominator and gives an equation we can rearrange.`,
          workingHtml: raw`<p class="step-text">That removes the denominator and gives an equation we can rearrange.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Multiply both sides by \(z+1\).
</div>`
        },
        {
          title: raw`Collect the z-terms`,
          previewHtml: raw`Moving the \(11z\) and \(-3iz\) terms gives \(2z+3iz=11-3i\).`,
          workingHtml: raw`<p class="step-text">Moving the \(11z\) and \(-3iz\) terms gives \(2z+3iz=11-3i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z(2+3i)=11-3i\)
</div>`
        },
        {
          title: raw`Solve for z`,
          previewHtml: raw`Rationalising \(\frac{11-3i}{2+3i}\) gives \(1-3i\).`,
          workingHtml: raw`<p class="step-text">Rationalising \(\frac{11-3i}{2+3i}\) gives \(1-3i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,1-3i\)
</div>`
        },
        {
          title: raw`State the argument`,
          previewHtml: raw`Fourth quadrant means the principal argument is negative.`,
          workingHtml: raw`<p class="step-text">Fourth quadrant means the principal argument is negative.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,-\tan^{-1}(3)\approx -71.6^\circ\)
</div>

        <p class="step-text">Solve for \(z\) before thinking about the argument.</p>
        <div class="math-block">
          \[
          13z=(11-3i)(z+1)
          \]
          \[
          13z=11z+11-3iz-3i
          \]
          \[
          2z+3iz=11-3i
          \]
          \[
          z(2+3i)=11-3i
          \]
          \[
          z=\frac{11-3i}{2+3i}=1-3i
          \]
        </div>
        <p class="step-text">The point \((1,-3)\) lies in the fourth quadrant, so the principal argument is negative.</p>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          \operatorname{Arg}(z)=\operatorname{Arg}(1-3i)=-\tan^{-1}(3)\approx -71.6^\circ
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Keep Thinking</p>
        <p class="step-text">Always decide the quadrant before stating an argument. The tangent ratio gives the reference angle, not automatically the final angle.</p>
      </div>

      `
        }
      ]
    }),

    "2d": createConfig("2d", "2023 Paper — Cube roots in polar form", {
      focus: raw`rewriting a real negative number in polar form and then using the cube-root rule to list all solutions.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Solve the equation }z^3+64m^{12}=0,\text{ where }m\text{ is a real constant.}
          \]
          \[
          \text{Write your solution(s) in polar form, in terms of }m.
          \]
        </div>
      `,
      hints: [
        raw`Rearrange first so the right-hand side is one complex number.`,
        raw`\(-64m^{12}\) lies on the negative real axis.`,
        raw`For cube roots, take the cube root of the modulus and divide the arguments by \(3\).`
      ],
      answerHtml: raw`
        <p class="step-text">Rearrange first, then write the right-hand side in polar form.</p>
        <div class="math-block">
          \[
          z^3=-64m^{12}=64m^{12}\operatorname{cis}\pi
          \]
        </div>
        <p class="step-text">The cube roots have modulus \(\sqrt[3]{64m^{12}}=4m^4\) and arguments \(\frac{\pi+2k\pi}{3}\).</p>
        <div class="math-block">
          \[
          \theta_1=\frac{\pi}{3},\qquad \theta_2=\pi,\qquad \theta_3=\frac{5\pi}{3}
          \]
          \[
          z_1=4m^4\operatorname{cis}\frac{\pi}{3},\quad
          z_2=4m^4\operatorname{cis}\pi,\quad
          z_3=4m^4\operatorname{cis}\frac{5\pi}{3}
          \]
        </div>
        ${answerBox(raw`
          \[
          z=4m^4\operatorname{cis}\frac{\pi}{3},\quad
          4m^4\operatorname{cis}\pi,\quad
          4m^4\operatorname{cis}\frac{5\pi}{3}
          \]
        `)}
        ${tipBox(raw`A negative real number is often easiest to write as \(r\operatorname{cis}\pi\). Then the root arguments follow straight from \(\frac{\theta+2k\pi}{n}\).`)}
      `,
      guidedSteps: [
        {
          title: raw`Rearrange the equation`,
          previewHtml: raw`Now the right-hand side is a single complex number on the negative real axis.`,
          workingHtml: raw`<p class="step-text">Now the right-hand side is a single complex number on the negative real axis.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z^3=-64m^{12}\)
</div>`
        },
        {
          title: raw`Write the RHS in polar form`,
          previewHtml: raw`A negative real number has argument \(\pi\) (or an equivalent angle).`,
          workingHtml: raw`<p class="step-text">A negative real number has argument \(\pi\) (or an equivalent angle).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,64m^{12}\operatorname{cis}\pi\)
</div>`
        },
        {
          title: raw`Take the cube roots`,
          previewHtml: raw`\(\sqrt[3]{64m^{12}}=4m^4\).`,
          workingHtml: raw`<p class="step-text">\(\sqrt[3]{64m^{12}}=4m^4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,4m^4\)
</div>`
        },
        {
          title: raw`List the three arguments`,
          previewHtml: raw`These are \(\frac{\pi+2k\pi}{3}\) for \(k=0,1,2\).`,
          workingHtml: raw`<p class="step-text">These are \(\frac{\pi+2k\pi}{3}\) for \(k=0,1,2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,\frac{\pi}{3},\ \pi,\ \frac{5\pi}{3}\)
</div>

        <p class="step-text">Rearrange first, then write the right-hand side in polar form.</p>
        <div class="math-block">
          \[
          z^3=-64m^{12}=64m^{12}\operatorname{cis}\pi
          \]
        </div>
        <p class="step-text">The cube roots have modulus \(\sqrt[3]{64m^{12}}=4m^4\) and arguments \(\frac{\pi+2k\pi}{3}\).</p>
        <div class="math-block">
          \[
          \theta_1=\frac{\pi}{3},\qquad \theta_2=\pi,\qquad \theta_3=\frac{5\pi}{3}
          \]
          \[
          z_1=4m^4\operatorname{cis}\frac{\pi}{3},\quad
          z_2=4m^4\operatorname{cis}\pi,\quad
          z_3=4m^4\operatorname{cis}\frac{5\pi}{3}
          \]
        </div>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          z=4m^4\operatorname{cis}\frac{\pi}{3},\quad
          4m^4\operatorname{cis}\pi,\quad
          4m^4\operatorname{cis}\frac{5\pi}{3}
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Keep Thinking</p>
        <p class="step-text">A negative real number is often easiest to write as \(r\operatorname{cis}\pi\). Then the root arguments follow straight from \(\frac{\theta+2k\pi}{n}\).</p>
      </div>

      `
        }
      ]
    }),

    "2e": createConfig("2e", "2023 Paper — Circle locus and tangency", {
      focus: raw`converting a modulus locus into a Cartesian circle, substituting the line, and using the discriminant to enforce tangency.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{The straight line with equation }y=mx-1,\text{ where }m\text{ is a real constant and }m>0,
          \]
          \[
          \text{is a tangent to the locus described by }|z-2+i|=3.
          \]
          \[
          \text{Find the Cartesian equation of the locus AND the value of }m.
          \]
        </div>
        ${locusDiagramHtml()}
      `,
      hints: [
        raw`Write \(z=x+yi\).`,
        raw`The equation \(|z-(2-i)|=3\) is a circle with centre \((2,-1)\) and radius \(3\).`,
        raw`A tangent means the line and circle meet once, so the resulting quadratic has discriminant \(0\).`
      ],
      answerHtml: raw`
        <p class="step-text">Let \(z=x+yi\). Then the locus becomes</p>
        <div class="math-block">
          \[
          |x+yi-2+i|=3
          \]
          \[
          |(x-2)+(y+1)i|=3
          \]
          \[
          (x-2)^2+(y+1)^2=9
          \]
        </div>
        <p class="step-text">Now substitute the tangent line \(y=mx-1\).</p>
        <div class="math-block">
          \[
          (x-2)^2+(mx)^2=9
          \]
          \[
          (1+m^2)x^2-4x+1=0
          \]
        </div>
        <p class="step-text">Tangency means the discriminant is zero.</p>
        <div class="math-block">
          \[
          (-4)^2-4(1+m^2)(1)=0
          \]
          \[
          16-4-4m^2=0
          \]
          \[
          m^2=3
          \]
        </div>
        ${answerBox(raw`
          \[
          (x-2)^2+(y+1)^2=9,\qquad m=\sqrt{3}
          \]
        `)}
        ${tipBox(raw`A modulus equation of the form \(|z-a-bi|=r\) is a distance statement, so it almost always turns into a circle on the Argand diagram.`)}
      `,
      guidedSteps: [
        {
          title: raw`Translate the modulus locus`,
          previewHtml: raw`The centre is \((2,-1)\) and the radius is \(3\).`,
          workingHtml: raw`<p class="step-text">The centre is \((2,-1)\) and the radius is \(3\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,(x-2)^2+(y+1)^2=9\)
</div>`
        },
        {
          title: raw`Substitute the line`,
          previewHtml: raw`Substituting \(y=mx-1\) makes \(y+1=mx\).`,
          workingHtml: raw`<p class="step-text">Substituting \(y=mx-1\) makes \(y+1=mx\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,(1+m^2)x^2-4x+1=0\)
</div>`
        },
        {
          title: raw`Use the tangent condition`,
          previewHtml: raw`Tangency means one repeated solution for \(x\).`,
          workingHtml: raw`<p class="step-text">Tangency means one repeated solution for \(x\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,b^2-4ac=0\)
</div>`
        },
        {
          title: raw`Find m`,
          previewHtml: raw`Tangency gives \(m^2=3\), and the positive condition leaves \(m=\sqrt{3}\).`,
          workingHtml: raw`<p class="step-text">Tangency gives \(m^2=3\), and the positive condition leaves \(m=\sqrt{3}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,\sqrt{3}\)
</div>

        <p class="step-text">Let \(z=x+yi\). Then the locus becomes</p>
        <div class="math-block">
          \[
          |x+yi-2+i|=3
          \]
          \[
          |(x-2)+(y+1)i|=3
          \]
          \[
          (x-2)^2+(y+1)^2=9
          \]
        </div>
        <p class="step-text">Now substitute the tangent line \(y=mx-1\).</p>
        <div class="math-block">
          \[
          (x-2)^2+(mx)^2=9
          \]
          \[
          (1+m^2)x^2-4x+1=0
          \]
        </div>
        <p class="step-text">Tangency means the discriminant is zero.</p>
        <div class="math-block">
          \[
          (-4)^2-4(1+m^2)(1)=0
          \]
          \[
          16-4-4m^2=0
          \]
          \[
          m^2=3
          \]
        </div>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          (x-2)^2+(y+1)^2=9,\qquad m=\sqrt{3}
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Keep Thinking</p>
        <p class="step-text">A modulus equation of the form \(|z-a-bi|=r\) is a distance statement, so it almost always turns into a circle on the Argand diagram.</p>
      </div>

      `
        }
      ]
    }),

    "3a": createConfig("3a", "2023 Paper — Remainder theorem", {
      focus: raw`using the remainder theorem by substituting \(x=-3\) into the polynomial.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{When the polynomial }2x^3+px^2+7x-3\text{ is divided by }x+3,\text{ the remainder is }30.
          \]
          \[
          \text{Find the value of }p.
          \]
        </div>
      `,
      hints: [
        raw`If the divisor is \(x+3\), use \(x=-3\).`,
        raw`The remainder theorem says \(f(-3)=30\).`,
        raw`Substitute carefully into each term and solve the linear equation.`
      ],
      answerHtml: raw`
        <p class="step-text">Since the divisor is \(x+3\), we use \(x=-3\).</p>
        <div class="math-block">
          \[
          f(-3)=2(-3)^3+p(-3)^2+7(-3)-3
          \]
          \[
          -54+9p-21-3=30
          \]
          \[
          9p-78=30
          \]
          \[
          9p=108
          \]
          \[
          p=12
          \]
        </div>
        ${answerBox(raw`
          \[
          p=12
          \]
        `)}
        ${tipBox(raw`For a divisor \(x-a\), the remainder theorem always turns the long-division question into the single substitution \(f(a)\).`)}
      `,
      guidedSteps: [
        {
          title: raw`Use the divisor`,
          previewHtml: raw`That is the value that makes \(x+3=0\).`,
          workingHtml: raw`<p class="step-text">That is the value that makes \(x+3=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,-3\)
</div>`
        },
        {
          title: raw`Set up the equation`,
          previewHtml: raw`The remainder theorem tells us \(f(-3)=30\).`,
          workingHtml: raw`<p class="step-text">The remainder theorem tells us \(f(-3)=30\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,2(-3)^3+p(-3)^2+7(-3)-3=30\)
</div>`
        },
        {
          title: raw`Solve for p`,
          previewHtml: raw`The equation simplifies to \(9p=108\).`,
          workingHtml: raw`<p class="step-text">The equation simplifies to \(9p=108\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,12\)
</div>

        <p class="step-text">Since the divisor is \(x+3\), we use \(x=-3\).</p>
        <div class="math-block">
          \[
          f(-3)=2(-3)^3+p(-3)^2+7(-3)-3
          \]
          \[
          -54+9p-21-3=30
          \]
          \[
          9p-78=30
          \]
          \[
          9p=108
          \]
          \[
          p=12
          \]
        </div>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          p=12
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Keep Thinking</p>
        <p class="step-text">For a divisor \(x-a\), the remainder theorem always turns the long-division question into the single substitution \(f(a)\).</p>
      </div>

      `
        }
      ]
    }),

    "3b": createConfig("3b", "2023 Paper — Solving for n from a quotient", {
      focus: raw`rewriting a complex quotient as a multiplication problem and then expanding carefully to find the real parameter \(n\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{The complex numbers }u\text{ and }v\text{ are }u=n-i\text{ and }v=2-3i.
          \]
          \[
          \text{Given that }\frac{u}{v}=3+4i,\text{ find the value of }n.
          \]
        </div>
      `,
      hints: [
        raw`Multiply both sides by \(v\) to remove the denominator.`,
        raw`Then expand \((3+4i)(2-3i)\).`,
        raw`Compare the result with \(n-i\).`
      ],
      answerHtml: raw`
        <p class="step-text">Clear the denominator first.</p>
        <div class="math-block">
          \[
          \frac{n-i}{2-3i}=3+4i
          \]
          \[
          n-i=(3+4i)(2-3i)
          \]
          \[
          =6-9i+8i-12i^2
          \]
          \[
          =18-i
          \]
        </div>
        ${answerBox(raw`
          \[
          n=18
          \]
        `)}
        ${tipBox(raw`If a quotient equals a complex number in \(a+bi\) form, multiplying both sides by the denominator is usually cleaner than starting by rationalising.`)}
      `,
      guidedSteps: [
        {
          title: raw`Remove the denominator`,
          previewHtml: raw`That turns the quotient into the simpler equation \(n-i=(3+4i)(2-3i)\).`,
          workingHtml: raw`<p class="step-text">That turns the quotient into the simpler equation \(n-i=(3+4i)(2-3i)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Multiply both sides by \(2-3i\).
</div>`
        },
        {
          title: raw`Expand the product`,
          previewHtml: raw`Since \(i^2=-1\), the product simplifies to \(18-i\).`,
          workingHtml: raw`<p class="step-text">Since \(i^2=-1\), the product simplifies to \(18-i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,18-i\)
</div>`
        },
        {
          title: raw`Read the value of n`,
          previewHtml: raw`Matching real parts gives \(n=18\).`,
          workingHtml: raw`<p class="step-text">Matching real parts gives \(n=18\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,18\)
</div>

        <p class="step-text">Clear the denominator first.</p>
        <div class="math-block">
          \[
          \frac{n-i}{2-3i}=3+4i
          \]
          \[
          n-i=(3+4i)(2-3i)
          \]
          \[
          =6-9i+8i-12i^2
          \]
          \[
          =18-i
          \]
        </div>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          n=18
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Keep Thinking</p>
        <p class="step-text">If a quotient equals a complex number in \(a+bi\) form, multiplying both sides by the denominator is usually cleaner than starting by rationalising.</p>
      </div>

      `
        }
      ]
    }),

    "3c": createConfig("3c", "2023 Paper — Solving a surd equation in terms of w", {
      focus: raw`squaring a surd equation carefully, isolating \(\sqrt{x}\), and then squaring again to write \(x\) in terms of \(w\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Solve the following equation for }x,\text{ in terms of }w.
          \]
          \[
          4\sqrt{4x-w}=5-8\sqrt{x}
          \]
        </div>
      `,
      hints: [
        raw`Square both sides first to remove the outer square root.`,
        raw`The \(64x\) terms cancel after expansion.`,
        raw`That leaves a linear equation in \(\sqrt{x}\), which you can square one more time.`
      ],
      answerHtml: raw`
        <p class="step-text">Square both sides first.</p>
        <div class="math-block">
          \[
          16(4x-w)=(5-8\sqrt{x})^2
          \]
          \[
          64x-16w=25-80\sqrt{x}+64x
          \]
          \[
          80\sqrt{x}=25+16w
          \]
          \[
          \sqrt{x}=\frac{25+16w}{80}
          \]
        </div>
        <p class="step-text">Square once more to isolate \(x\).</p>
        ${answerBox(raw`
          \[
          x=\left(\frac{25+16w}{80}\right)^2
          \]
        `)}
        ${tipBox(raw`After squaring, pause and simplify before you square again. Here the \(64x\) terms cancelling is the key simplification.`)}
      `,
      guidedSteps: [
        {
          title: raw`Square the equation`,
          previewHtml: raw`That is the clean first step.`,
          workingHtml: raw`<p class="step-text">That is the clean first step.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,16(4x-w)=(5-8\sqrt{x})^2\)
</div>`
        },
        {
          title: raw`Simplify after expansion`,
          previewHtml: raw`Once the \(64x\) terms cancel, the equation becomes linear in \(\sqrt{x}\).`,
          workingHtml: raw`<p class="step-text">Once the \(64x\) terms cancel, the equation becomes linear in \(\sqrt{x}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,80\sqrt{x}=25+16w\)
</div>`
        },
        {
          title: raw`Isolate the surd`,
          previewHtml: raw`Divide both sides by \(80\).`,
          workingHtml: raw`<p class="step-text">Divide both sides by \(80\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,\frac{25+16w}{80}\)
</div>`
        },
        {
          title: raw`Solve for x`,
          previewHtml: raw`Square both sides to finish.`,
          workingHtml: raw`<p class="step-text">Square both sides to finish.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,\left(\frac{25+16w}{80}\right)^2\)
</div>

        <p class="step-text">Square both sides first.</p>
        <div class="math-block">
          \[
          16(4x-w)=(5-8\sqrt{x})^2
          \]
          \[
          64x-16w=25-80\sqrt{x}+64x
          \]
          \[
          80\sqrt{x}=25+16w
          \]
          \[
          \sqrt{x}=\frac{25+16w}{80}
          \]
        </div>
        <p class="step-text">Square once more to isolate \(x\).</p>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          x=\left(\frac{25+16w}{80}\right)^2
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Keep Thinking</p>
        <p class="step-text">After squaring, pause and simplify before you square again. Here the \(64x\) terms cancelling is the key simplification.</p>
      </div>

      `
        }
      ]
    }),

    "3d": createConfig("3d", "2023 Paper — Simplifying a reciprocal complex equation", {
      focus: raw`combining the right-hand side into one fraction, then inverting to recover \(x+yi\) and reading off \(x\) and \(y\).`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Find the values of }x\text{ and }y,\text{ given that }x\text{ and }y\text{ are real, and}
          \]
          \[
          \frac{1}{x+yi}=1-\frac{1}{1+pi}
          \]
          \[
          \text{giving your answers in terms of }p,\text{ where }p\text{ is a positive, real constant.}
          \]
        </div>
      `,
      hints: [
        raw`Simplify the right-hand side first.`,
        raw`Once you have \(\frac{1}{x+yi}\) as a single fraction, invert both sides.`,
        raw`Then simplify \(\frac{1+pi}{pi}\) into \(a+bi\) form.`
      ],
      answerHtml: raw`
        <p class="step-text">Combine the right-hand side into one fraction.</p>
        <div class="math-block">
          \[
          \frac{1}{x+yi}=1-\frac{1}{1+pi}
          =\frac{1+pi-1}{1+pi}
          =\frac{pi}{1+pi}
          \]
        </div>
        <p class="step-text">Now invert both sides.</p>
        <div class="math-block">
          \[
          x+yi=\frac{1+pi}{pi}
          \]
          \[
          =\frac{(1+pi)i}{pi\cdot i}
          =\frac{i-p}{-p}
          =1-\frac{1}{p}i
          \]
        </div>
        ${answerBox(raw`
          \[
          x=1,\qquad y=-\frac{1}{p}
          \]
        `)}
        ${tipBox(raw`When the unknown is in the denominator, turning the other side into one clean fraction often makes the next inversion almost automatic.`)}
      `,
      guidedSteps: [
        {
          title: raw`Combine the right-hand side`,
          previewHtml: raw`Write \(1\) as \(\frac{1+pi}{1+pi}\) first.`,
          workingHtml: raw`<p class="step-text">Write \(1\) as \(\frac{1+pi}{1+pi}\) first.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,\frac{pi}{1+pi}\)
</div>`
        },
        {
          title: raw`Invert the equation`,
          previewHtml: raw`Once the reciprocal equation is simplified, invert both sides.`,
          workingHtml: raw`<p class="step-text">Once the reciprocal equation is simplified, invert both sides.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,x+yi=\frac{1+pi}{pi}\)
</div>`
        },
        {
          title: raw`Simplify to a+bi`,
          previewHtml: raw`This matches the schedule simplification.`,
          workingHtml: raw`<p class="step-text">This matches the schedule simplification.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,1-\frac{1}{p}i\)
</div>`
        },
        {
          title: raw`Read x and y`,
          previewHtml: raw`Match the real and imaginary parts directly.`,
          workingHtml: raw`<p class="step-text">Match the real and imaginary parts directly.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,x=1,\ y=-\frac{1}{p}\)
</div>

        <p class="step-text">Combine the right-hand side into one fraction.</p>
        <div class="math-block">
          \[
          \frac{1}{x+yi}=1-\frac{1}{1+pi}
          =\frac{1+pi-1}{1+pi}
          =\frac{pi}{1+pi}
          \]
        </div>
        <p class="step-text">Now invert both sides.</p>
        <div class="math-block">
          \[
          x+yi=\frac{1+pi}{pi}
          \]
          \[
          =\frac{(1+pi)i}{pi\cdot i}
          =\frac{i-p}{-p}
          =1-\frac{1}{p}i
          \]
        </div>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          x=1,\qquad y=-\frac{1}{p}
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Keep Thinking</p>
        <p class="step-text">When the unknown is in the denominator, turning the other side into one clean fraction often makes the next inversion almost automatic.</p>
      </div>

      `
        }
      ]
    }),

    "3e": createConfig("3e", "2023 Paper — Finding k from z and w", {
      focus: raw`solving for \(z\), using \(\frac{w}{z}=2+2i\) to build \(w\), and then applying the imaginary-part condition.`,
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{If }z+2i=iz+k,\text{ where }k\text{ is a real number, and }\frac{w}{z}=2+2i,
          \]
          \[
          \text{where }\operatorname{Im}(w)=8,\text{ find the value of }k.
          \]
        </div>
      `,
      hints: [
        raw`Rearrange the first equation to make \(z\) the subject.`,
        raw`Then use \(w=z(2+2i)\).`,
        raw`The shortcut simplification here is \(\frac{2+2i}{1-i}=2i\).`
      ],
      answerHtml: raw`
        <p class="step-text">Start by solving for \(z\).</p>
        <div class="math-block">
          \[
          z+2i=iz+k
          \]
          \[
          z-iz=k-2i
          \]
          \[
          z(1-i)=k-2i
          \]
          \[
          z=\frac{k-2i}{1-i}
          \]
        </div>
        <p class="step-text">Now use \(\frac{w}{z}=2+2i\), so \(w=z(2+2i)\).</p>
        <div class="math-block">
          \[
          w=\frac{k-2i}{1-i}(2+2i)
          =(k-2i)\frac{2+2i}{1-i}
          \]
          \[
          \frac{2+2i}{1-i}=2i
          \]
          \[
          w=(k-2i)(2i)=4+2ki
          \]
        </div>
        <p class="step-text">The imaginary part is \(2k\), and we are told \(\operatorname{Im}(w)=8\).</p>
        ${answerBox(raw`
          \[
          2k=8\Rightarrow k=4
          \]
        `)}
        ${tipBox(raw`This question looks longer than it is. Once \(w\) is written as \(4+2ki\), the imaginary-part condition finishes it immediately.`)}
      `,
      guidedSteps: [
        {
          title: raw`Solve for z`,
          previewHtml: raw`First factor out \(z\), then divide by \(1-i\).`,
          workingHtml: raw`<p class="step-text">First factor out \(z\), then divide by \(1-i\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,z=\frac{k-2i}{1-i}\)
</div>`
        },
        {
          title: raw`Use the w relation`,
          previewHtml: raw`That lets us substitute the expression we found for \(z\).`,
          workingHtml: raw`<p class="step-text">That lets us substitute the expression we found for \(z\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,w=z(2+2i)\)
</div>`
        },
        {
          title: raw`Simplify w`,
          previewHtml: raw`Using \(\frac{2+2i}{1-i}=2i\) makes the simplification quick.`,
          workingHtml: raw`<p class="step-text">Using \(\frac{2+2i}{1-i}=2i\) makes the simplification quick.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,w=4+2ki\)
</div>`
        },
        {
          title: raw`Use the imaginary part`,
          previewHtml: raw`The imaginary part of \(4+2ki\) is \(2k\).`,
          workingHtml: raw`<p class="step-text">The imaginary part of \(4+2ki\) is \(2k\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(\,4\)
</div>

        <p class="step-text">Start by solving for \(z\).</p>
        <div class="math-block">
          \[
          z+2i=iz+k
          \]
          \[
          z-iz=k-2i
          \]
          \[
          z(1-i)=k-2i
          \]
          \[
          z=\frac{k-2i}{1-i}
          \]
        </div>
        <p class="step-text">Now use \(\frac{w}{z}=2+2i\), so \(w=z(2+2i)\).</p>
        <div class="math-block">
          \[
          w=\frac{k-2i}{1-i}(2+2i)
          =(k-2i)\frac{2+2i}{1-i}
          \]
          \[
          \frac{2+2i}{1-i}=2i
          \]
          \[
          w=(k-2i)(2i)=4+2ki
          \]
        </div>
        <p class="step-text">The imaginary part is \(2k\), and we are told \(\operatorname{Im}(w)=8\).</p>

      <div class="answer-highlight">
        <p class="question-label">Final Answer</p>

          \[
          2k=8\Rightarrow k=4
          \]

      </div>


      <div class="callout-card tip">
        <p class="callout-title">Keep Thinking</p>
        <p class="step-text">This question looks longer than it is. Once \(w\) is written as \(4+2ki\), the imaginary-part condition finishes it immediately.</p>
      </div>

      `
        }
      ]
    })
  };
}());
