(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-complex-2023";
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
      steps: [
        choiceStep("Choose the expansion rule", raw`Which identity matches \((5-2\sqrt{p})^2\)?`, [
          wrongChoice(raw`\((a-b)^2=a^2-b^2\)`, raw`That misses the middle term. A squared binomial needs three terms.`),
          correctChoice(raw`\((a-b)^2=a^2-2ab+b^2\)`, raw`Exactly. We square the first term, subtract twice the product, then add the square of the second term.`),
          wrongChoice(raw`\((a+b)^2=a^2+2ab+b^2\)`, raw`The structure is close, but this question has a subtraction.`)
        ]),
        choiceStep("Find the middle term", raw`What does the \(-2ab\) term become here?`, [
          wrongChoice(raw`\(-10\sqrt{p}\)`, raw`You still need the extra factor of \(2\) from the identity.`),
          wrongChoice(raw`\(-20p\)`, raw`The product \(5(2\sqrt{p})\) gives a surd term, not a \(p\)-term.`),
          correctChoice(raw`\(-20\sqrt{p}\)`, raw`Yes. The middle term is \(-2(5)(2\sqrt{p})=-20\sqrt{p}\).`)
        ]),
        choiceStep("Collect the terms", raw`Which final form is correct?`, [
          wrongChoice(raw`\(\,25-4p-20\sqrt{p}\)`, raw`The last term squares to \(+4p\), not \(-4p\).`),
          correctChoice(raw`\(\,25+4p-20\sqrt{p}\)`, raw`Correct. That matches the requested form \(a+bp+c\sqrt{p}\).`),
          wrongChoice(raw`\(\,29-20\sqrt{p}\)`, raw`The \(4p\) term cannot be combined with the constant.`)
        ])
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
      steps: [
        choiceStep("Recognise the condition", raw`What must be true for a quadratic to have no real roots?`, [
          correctChoice(raw`\(\,b^2-4ac<0\)`, raw`Right. A negative discriminant means the roots are complex, not real.`),
          wrongChoice(raw`\(\,b^2-4ac=0\)`, raw`That gives one repeated real root.`),
          wrongChoice(raw`\(\,b^2-4ac>0\)`, raw`That gives two distinct real roots.`)
        ]),
        choiceStep("Substitute the coefficients", raw`Which substitution is correct for \(4x^2-4x+3r-2=0\)?`, [
          wrongChoice(raw`\(\,16-4(4)(3r+2)<0\)`, raw`The constant term is \(3r-2\), not \(3r+2\).`),
          correctChoice(raw`\(\,16-4(4)(3r-2)<0\)`, raw`Yes. Here \(a=4\), \(b=-4\), and \(c=3r-2\).`),
          wrongChoice(raw`\(\,(-4)^2-4(3r-2)<0\)`, raw`The factor of \(a=4\) is missing from the \(4ac\) part.`)
        ]),
        choiceStep("Solve the inequality", raw`What does the inequality simplify to?`, [
          wrongChoice(raw`\(\,r<1\)`, raw`Be careful with the sign when you divide by \(-48\).`),
          correctChoice(raw`\(\,r>1\)`, raw`Correct. Dividing by \(-48\) flips the inequality sign.`),
          wrongChoice(raw`\(\,r>0\)`, raw`The boundary comes from the discriminant becoming \(0\) at \(r=1\).`)
        ])
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
      steps: [
        choiceStep("Make the denominator real", raw`What should we multiply \(\frac{p+qi}{a+bi}\) by?`, [
          wrongChoice(raw`\(\frac{a+bi}{a+bi}\)`, raw`That keeps the denominator complex.`),
          correctChoice(raw`\(\frac{a-bi}{a-bi}\)`, raw`Exactly. The conjugate turns the denominator into \(a^2+b^2\).`),
          wrongChoice(raw`\(\frac{p-qi}{p-qi}\)`, raw`We want to simplify the denominator, so we use the conjugate of \(w\).`)
        ]),
        choiceStep("Expand the numerator", raw`Which expansion is correct?`, [
          correctChoice(raw`\((p+qi)(a-bi)=ap+bq+(aq-bp)i\)`, raw`Correct. The \(i^2\) term becomes \(-1\), which turns \(-bqi^2\) into \(+bq\).`),
          wrongChoice(raw`\((p+qi)(a-bi)=ap-bq+(aq+bp)i\)`, raw`Both the real and imaginary signs have gone astray here.`),
          wrongChoice(raw`\((p+qi)(a-bi)=ap-bpi+aqi-bqi\)`, raw`The final term should be \(-bqi^2\), not \(-bqi\).`)
        ]),
        choiceStep("Read the real part", raw`What is \(\operatorname{Re}\left(\frac{z}{w}\right)\)?`, [
          wrongChoice(raw`\(\frac{aq-bp}{a^2+b^2}\)`, raw`That is the coefficient of \(i\), so it belongs to the imaginary part.`),
          wrongChoice(raw`\(\frac{ap-bq}{a^2+b^2}\)`, raw`The real part from the expansion is \(ap+bq\).`),
          correctChoice(raw`\(\frac{ap+bq}{a^2+b^2}\)`, raw`Yes. That is the non-\(i\) part of the quotient.`)
        ]),
        choiceStep("Finish the proof", raw`If that real part equals \(0\), what follows?`, [
          wrongChoice(raw`\(\,ap=bq\)`, raw`The equation is \(ap+bq=0\), so the sign matters.`),
          correctChoice(raw`\(\,ap=-bq\)`, raw`Exactly. Multiply through by \(a^2+b^2\) and rearrange.`),
          wrongChoice(raw`\(\,aq=bp\)`, raw`That would come from the imaginary part, not the real part.`)
        ])
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
      steps: [
        choiceStep("Use the real-coefficient rule", raw`If \(5-i\) is a root and the coefficients are real, what other root must exist?`, [
          wrongChoice(raw`\(\, -5+i\)`, raw`Real coefficients give the conjugate, not the negative.`),
          correctChoice(raw`\(\,5+i\)`, raw`Correct. Non-real roots of real polynomials come in conjugate pairs.`),
          wrongChoice(raw`\(\, -5-i\)`, raw`That changes both signs, which is not the conjugate.`)
        ]),
        choiceStep("Build the quadratic factor", raw`What factor do the roots \(5-i\) and \(5+i\) give together?`, [
          wrongChoice(raw`\(\,z^2-25\)`, raw`These roots are not \(\pm 5\); each has an imaginary part as well.`),
          correctChoice(raw`\(\,z^2-10z+26\)`, raw`Yes. The product is \((z-5)^2+1=z^2-10z+26\).`),
          wrongChoice(raw`\(\,z^2+10z+26\)`, raw`The sum of the roots is \(10\), so the middle term is \(-10z\).`)
        ]),
        choiceStep("Find the remaining factor", raw`Which linear factor completes the cubic?`, [
          wrongChoice(raw`\(\,z-2\)`, raw`That would make the \(z^2\)-coefficient \(-12\), not \(-8\).`),
          wrongChoice(raw`\(\,z+8\)`, raw`That would make the \(z^2\)-coefficient \(-2\), not \(-8\).`),
          correctChoice(raw`\(\,z+2\)`, raw`Exactly. \((z+2)(z^2-10z+26)\) matches the leading terms of the cubic.`)
        ]),
        choiceStep("State the remaining results", raw`So what are the other two roots and the value of \(d\)?`, [
          wrongChoice(raw`\(\,z=5+i,\ z=2,\ d=-52\)`, raw`The remaining factor is \(z+2\), so the third root is \(-2\), and the constant term is positive.`),
          correctChoice(raw`\(\,z=5+i,\ z=-2,\ d=52\)`, raw`Correct. Those are the full remaining results.`),
          wrongChoice(raw`\(\,z=5-i,\ z=-2,\ d=52\)`, raw`The question already gave \(5-i\); we still need the conjugate \(5+i\).`)
        ])
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
      steps: [
        choiceStep("Simplify the quotient", raw`What is \(\frac{u}{v}\) in \(a+bi\) form?`, [
          wrongChoice(raw`\(\,1+i\)`, raw`The sign of the imaginary part flips once the quotient is simplified.`),
          correctChoice(raw`\(\,1-i\)`, raw`Yes. Rationalising the denominator gives \(\frac{5-5i}{5}=1-i\).`),
          wrongChoice(raw`\(\,3-2i\)`, raw`That is not the result of dividing by \(1+2i\).`)
        ]),
        choiceStep("Rewrite the modulus", raw`After substituting \(\frac{u}{v}=1-i\), which equation do we get?`, [
          wrongChoice(raw`\(\,|1-i|+k=\sqrt{k+2}\)`, raw`The \(k\) is added inside the modulus, not outside it.`),
          correctChoice(raw`\(\,|1-i+k|=\sqrt{k+2}\)`, raw`Correct. Since \(k\) is real, it combines with the real part of \(1-i\).`),
          wrongChoice(raw`\(\,|1+k+i|=\sqrt{k+2}\)`, raw`The quotient is \(1-i\), so the imaginary part stays negative.`)
        ]),
        choiceStep("Square the equation", raw`What do we get after squaring both sides?`, [
          correctChoice(raw`\(\,(1+k)^2+1=k+2\)`, raw`Exactly. The modulus squared is the sum of the squares of the real and imaginary parts.`),
          wrongChoice(raw`\(\,(1+k)^2-1=k+2\)`, raw`The imaginary part contributes \(+1\), not \(-1\).`),
          wrongChoice(raw`\(\,(1+k)^2+(k+2)^2=1\)`, raw`Only the modulus gets squared on the left; the right side is already \(\sqrt{k+2}\).`)
        ]),
        choiceStep("Solve for k", raw`What values of \(k\) satisfy the equation?`, [
          wrongChoice(raw`\(\,k=1\text{ only}\)`, raw`That does not satisfy \(k^2+k=0\).`),
          wrongChoice(raw`\(\,k=-2\text{ or }0\)`, raw`\(-2\) would not satisfy the squared equation.`),
          correctChoice(raw`\(\,k=0\text{ or }k=-1\)`, raw`Correct. The equation factors as \(k(k+1)=0\).`)
        ])
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
      steps: [
        choiceStep("Choose the polar rule", raw`What happens to the modulus and argument when we divide in polar form?`, [
          wrongChoice(raw`Divide the moduli and add the arguments.`, raw`Division uses subtraction of arguments, not addition.`),
          correctChoice(raw`Divide the moduli and subtract the arguments.`, raw`Exactly. That is the quotient rule for polar form.`),
          wrongChoice(raw`Subtract the moduli and divide the arguments.`, raw`Neither part works that way in polar form.`)
        ]),
        choiceStep("Simplify the modulus", raw`What is the modulus of \(\frac{u}{v}\)?`, [
          wrongChoice(raw`\(\,q^8\)`, raw`That would happen if we multiplied the moduli.`),
          wrongChoice(raw`\(\,q^3\)`, raw`Subtracting exponents would give \(q^4\), not \(q^3\).`),
          correctChoice(raw`\(\,q^4\)`, raw`Yes. \(\frac{q^6}{q^2}=q^4\).`)
        ]),
        choiceStep("Find the argument", raw`What is \(\frac{5\pi}{8}-\frac{2\pi}{5}\)?`, [
          wrongChoice(raw`\(\,\frac{\pi}{40}\)`, raw`Use a common denominator of \(40\): \(25\pi-16\pi=9\pi\).`),
          correctChoice(raw`\(\,\frac{9\pi}{40}\)`, raw`Correct. The angle simplifies neatly to \(\frac{9\pi}{40}\).`),
          wrongChoice(raw`\(\,\frac{41\pi}{40}\)`, raw`That would be the result of adding the angles instead.`)
        ])
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
      steps: [
        choiceStep("Subtract the complex numbers", raw`What is \(z-w\)?`, [
          wrongChoice(raw`\(\,6+2ki\)`, raw`The real part is \(1-7=-6\), not \(6\).`),
          correctChoice(raw`\(\,-6+2ki\)`, raw`Correct. The imaginary parts add because subtracting \(-ki\) gives \(+ki\).`),
          wrongChoice(raw`\(\,-6\)`, raw`The imaginary part does not cancel; it becomes \(2ki\).`)
        ]),
        choiceStep("Use the modulus formula", raw`What is \(|-6+2ki|\)?`, [
          wrongChoice(raw`\(\,\sqrt{36+2k^2}\)`, raw`The imaginary part is \(2k\), so squaring it gives \(4k^2\).`),
          correctChoice(raw`\(\,\sqrt{36+4k^2}\)`, raw`Yes. Square the real part and the imaginary coefficient separately.`),
          wrongChoice(raw`\(\,6+2k\)`, raw`A modulus is not found by just adding the components.`)
        ]),
        choiceStep("Simplify the result", raw`What is the cleanest final form?`, [
          correctChoice(raw`\(\,2\sqrt{9+k^2}\)`, raw`Exactly. Factor \(4\) out from under the square root.`),
          wrongChoice(raw`\(\,\sqrt{9+k^2}\)`, raw`You still need the factor of \(2\) from the \(\sqrt{4}\).`),
          wrongChoice(raw`\(\,6\sqrt{1+\frac{k^2}{9}}\)`, raw`That is equivalent, but not the simplest standard form for this walkthrough.`)
        ])
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
      steps: [
        choiceStep("Clear the denominator", raw`What is the best first move?`, [
          wrongChoice(raw`Take the argument of both sides immediately.`, raw`We do not know \(z\) yet, so its argument is not easy to read.`),
          correctChoice(raw`Multiply both sides by \(z+1\).`, raw`Correct. That removes the denominator and gives an equation we can rearrange.`),
          wrongChoice(raw`Multiply both sides by \(13\).`, raw`That does not help isolate \(z\).`)
        ]),
        choiceStep("Collect the z-terms", raw`After expanding, what equation do we get?`, [
          wrongChoice(raw`\(\,13z=11z+11-3iz+3i\)`, raw`The constant term from \((-3i)(1)\) is \(-3i\), not \(+3i\).`),
          correctChoice(raw`\(\,z(2+3i)=11-3i\)`, raw`Yes. Moving the \(11z\) and \(-3iz\) terms gives \(2z+3iz=11-3i\).`),
          wrongChoice(raw`\(\,z(13-11+3i)=11+3i\)`, raw`The right-hand side should still be \(11-3i\).`)
        ]),
        choiceStep("Solve for z", raw`What is \(z\)?`, [
          wrongChoice(raw`\(\,1+3i\)`, raw`That would place the point in the first quadrant, but the fraction simplifies to a negative imaginary part.`),
          correctChoice(raw`\(\,1-3i\)`, raw`Correct. Rationalising \(\frac{11-3i}{2+3i}\) gives \(1-3i\).`),
          wrongChoice(raw`\(\,-1+3i\)`, raw`That would require both the real and imaginary parts to change sign.`)
        ]),
        choiceStep("State the argument", raw`What is the principal argument of \(1-3i\)?`, [
          wrongChoice(raw`\(\,\tan^{-1}(3)\)`, raw`That is the reference angle, but the point is in the fourth quadrant so the principal argument is negative.`),
          correctChoice(raw`\(\,-\tan^{-1}(3)\approx -71.6^\circ\)`, raw`Exactly. Fourth quadrant means the principal argument is negative.`),
          wrongChoice(raw`\(\,\pi-\tan^{-1}(3)\)`, raw`That would place the point in the second quadrant.`)
        ])
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
      steps: [
        choiceStep("Rearrange the equation", raw`What does the equation become first?`, [
          wrongChoice(raw`\(\,z^3=64m^{12}\)`, raw`The \(64m^{12}\) moves across the equals sign and becomes negative.`),
          correctChoice(raw`\(\,z^3=-64m^{12}\)`, raw`Correct. Now the right-hand side is a single complex number on the negative real axis.`),
          wrongChoice(raw`\(\,z=-64m^4\)`, raw`We are not taking cube roots yet.`)
        ]),
        choiceStep("Write the RHS in polar form", raw`Which polar form is correct for \(-64m^{12}\)?`, [
          wrongChoice(raw`\(\,64m^{12}\operatorname{cis}0\)`, raw`That would place it on the positive real axis.`),
          correctChoice(raw`\(\,64m^{12}\operatorname{cis}\pi\)`, raw`Yes. A negative real number has argument \(\pi\) (or an equivalent angle).`),
          wrongChoice(raw`\(\,64m^{12}\operatorname{cis}\frac{\pi}{2}\)`, raw`That would put it on the positive imaginary axis.`)
        ]),
        choiceStep("Take the cube roots", raw`What is the modulus of each cube root?`, [
          wrongChoice(raw`\(\,4m^3\)`, raw`The exponent \(12\) is divided by \(3\), so it becomes \(m^4\).`),
          wrongChoice(raw`\(\,8m^4\)`, raw`The cube root of \(64\) is \(4\), not \(8\).`),
          correctChoice(raw`\(\,4m^4\)`, raw`Exactly. \(\sqrt[3]{64m^{12}}=4m^4\).`)
        ]),
        choiceStep("List the three arguments", raw`Which list gives all the cube-root arguments?`, [
          wrongChoice(raw`\(\,0,\ \frac{2\pi}{3},\ \frac{4\pi}{3}\)`, raw`Those would come from starting with argument \(0\), not \(\pi\).`),
          correctChoice(raw`\(\,\frac{\pi}{3},\ \pi,\ \frac{5\pi}{3}\)`, raw`Correct. These are \(\frac{\pi+2k\pi}{3}\) for \(k=0,1,2\).`),
          wrongChoice(raw`\(\,\frac{\pi}{3},\ \frac{2\pi}{3},\ \pi\)`, raw`The spacing between roots should be \( \frac{2\pi}{3}\), so the third angle here is not right.`)
        ])
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
      steps: [
        choiceStep("Translate the modulus locus", raw`If \(z=x+yi\), what does \(|z-2+i|=3\) become?`, [
          wrongChoice(raw`\(\,(x+2)^2+(y-1)^2=9\)`, raw`The signs for the centre are reversed.`),
          correctChoice(raw`\(\,(x-2)^2+(y+1)^2=9\)`, raw`Correct. The centre is \((2,-1)\) and the radius is \(3\).`),
          wrongChoice(raw`\(\,(x-2)^2+(y-1)^2=3\)`, raw`The radius is \(3\), so the right-hand side is \(9\).`)
        ]),
        choiceStep("Substitute the line", raw`What quadratic do we get after using \(y=mx-1\)?`, [
          wrongChoice(raw`\(\,(1+m^2)x^2-4x-5=0\)`, raw`The constant term works out to \(+1\), not \(-5\).`),
          correctChoice(raw`\(\,(1+m^2)x^2-4x+1=0\)`, raw`Yes. Substituting \(y=mx-1\) makes \(y+1=mx\).`),
          wrongChoice(raw`\(\,x^2+m^2x^2-4x+4=9\Rightarrow (1+m^2)x^2-4x+4=0\)`, raw`You still need to move the \(9\) across, so the constant becomes \(+1\).`)
        ]),
        choiceStep("Use the tangent condition", raw`What condition should this quadratic satisfy?`, [
          wrongChoice(raw`\(\,b^2-4ac>0\)`, raw`That would mean two intersection points, not a tangent.`),
          correctChoice(raw`\(\,b^2-4ac=0\)`, raw`Exactly. Tangency means one repeated solution for \(x\).`),
          wrongChoice(raw`\(\,a+b+c=0\)`, raw`That is not a tangency test.`)
        ]),
        choiceStep("Find m", raw`Given \(m>0\), what is \(m\)?`, [
          wrongChoice(raw`\(\,-\sqrt{3}\)`, raw`That solves \(m^2=3\), but the question states \(m>0\).`),
          wrongChoice(raw`\(\,\frac{\sqrt{3}}{2}\)`, raw`That does not satisfy \(m^2=3\).`),
          correctChoice(raw`\(\,\sqrt{3}\)`, raw`Correct. Tangency gives \(m^2=3\), and the positive condition leaves \(m=\sqrt{3}\).`)
        ])
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
      steps: [
        choiceStep("Use the divisor", raw`What value of \(x\) should we substitute?`, [
          wrongChoice(raw`\(\,3\)`, raw`The divisor is \(x+3=x-(-3)\), so the matching value is \(-3\).`),
          correctChoice(raw`\(\,-3\)`, raw`Correct. That is the value that makes \(x+3=0\).`),
          wrongChoice(raw`\(\,30\)`, raw`The remainder is the output, not the \(x\)-value we substitute.`)
        ]),
        choiceStep("Set up the equation", raw`Which equation comes from the remainder theorem?`, [
          correctChoice(raw`\(\,2(-3)^3+p(-3)^2+7(-3)-3=30\)`, raw`Yes. The remainder theorem tells us \(f(-3)=30\).`),
          wrongChoice(raw`\(\,2(-3)^3+p(-3)^2+7(-3)-3=0\)`, raw`If \(x+3\) were a factor, then the output would be \(0\), but here the remainder is \(30\).`),
          wrongChoice(raw`\(\,2(3)^3+p(3)^2+7(3)-3=30\)`, raw`We need \(-3\), not \(3\).`)
        ]),
        choiceStep("Solve for p", raw`What value of \(p\) does that give?`, [
          wrongChoice(raw`\(\,10\)`, raw`Check the arithmetic after combining the constant terms.`),
          correctChoice(raw`\(\,12\)`, raw`Correct. The equation simplifies to \(9p=108\).`),
          wrongChoice(raw`\(\,18\)`, raw`That would make \(9p\) much too large.`)
        ])
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
      steps: [
        choiceStep("Remove the denominator", raw`How should we start?`, [
          wrongChoice(raw`Take moduli on both sides.`, raw`That would lose the information about the real and imaginary parts.`),
          correctChoice(raw`Multiply both sides by \(2-3i\).`, raw`Exactly. That turns the quotient into the simpler equation \(n-i=(3+4i)(2-3i)\).`),
          wrongChoice(raw`Add \(2-3i\) to both sides.`, raw`We need to undo division, so we multiply.`)
        ]),
        choiceStep("Expand the product", raw`What is \((3+4i)(2-3i)\)?`, [
          wrongChoice(raw`\(\,6-9i+8i-12i\)`, raw`The last term should be \(-12i^2\), not \(-12i\).`),
          correctChoice(raw`\(\,18-i\)`, raw`Yes. Since \(i^2=-1\), the product simplifies to \(18-i\).`),
          wrongChoice(raw`\(\,6-i\)`, raw`You have missed the \(+12\) that comes from \(-12i^2\).`)
        ]),
        choiceStep("Read the value of n", raw`If \(n-i=18-i\), what is \(n\)?`, [
          wrongChoice(raw`\(\,17\)`, raw`The imaginary parts already match as \(-i\), so the real parts must be equal.`),
          wrongChoice(raw`\(\,19\)`, raw`The real part on the right is \(18\).`),
          correctChoice(raw`\(\,18\)`, raw`Correct. Matching real parts gives \(n=18\).`)
        ])
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
      steps: [
        choiceStep("Square the equation", raw`What do we get after squaring both sides?`, [
          wrongChoice(raw`\(\,4(4x-w)=25-80\sqrt{x}+64x\)`, raw`Squaring the left side also squares the \(4\), giving \(16\).`),
          correctChoice(raw`\(\,16(4x-w)=(5-8\sqrt{x})^2\)`, raw`Correct. That is the clean first step.`),
          wrongChoice(raw`\(\,16(4x-w)=25+80\sqrt{x}+64x\)`, raw`The middle term is negative because the binomial is \(5-8\sqrt{x}\).`)
        ]),
        choiceStep("Simplify after expansion", raw`What remains after expanding and cancelling the \(64x\) terms?`, [
          wrongChoice(raw`\(\,16w=25+80\sqrt{x}\)`, raw`Be careful with the sign after moving \(-16w\).`),
          correctChoice(raw`\(\,80\sqrt{x}=25+16w\)`, raw`Yes. Once the \(64x\) terms cancel, the equation becomes linear in \(\sqrt{x}\).`),
          wrongChoice(raw`\(\,80x=25+16w\)`, raw`The variable left at this stage is \(\sqrt{x}\), not \(x\).`)
        ]),
        choiceStep("Isolate the surd", raw`What is \(\sqrt{x}\)?`, [
          wrongChoice(raw`\(\,\frac{25+16w}{16}\)`, raw`We still need to divide by \(80\), not \(16\).`),
          correctChoice(raw`\(\,\frac{25+16w}{80}\)`, raw`Correct. Divide both sides by \(80\).`),
          wrongChoice(raw`\(\,\frac{80}{25+16w}\)`, raw`That inverts the fraction incorrectly.`)
        ]),
        choiceStep("Solve for x", raw`So what is \(x\)?`, [
          wrongChoice(raw`\(\,\frac{25+16w}{80}\)`, raw`That is \(\sqrt{x}\), not \(x\).`),
          correctChoice(raw`\(\,\left(\frac{25+16w}{80}\right)^2\)`, raw`Exactly. Square both sides to finish.`),
          wrongChoice(raw`\(\,\frac{25+16w}{6400}\)`, raw`Only the denominator has been squared there.`)
        ])
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
      steps: [
        choiceStep("Combine the right-hand side", raw`What does \(1-\frac{1}{1+pi}\) simplify to?`, [
          wrongChoice(raw`\(\,\frac{1}{pi}\)`, raw`The denominator should stay \(1+pi\) at this stage.`),
          correctChoice(raw`\(\,\frac{pi}{1+pi}\)`, raw`Correct. Write \(1\) as \(\frac{1+pi}{1+pi}\) first.`),
          wrongChoice(raw`\(\,\frac{1-pi}{1+pi}\)`, raw`Only the \(1\) in the numerator cancels; the \(pi\) remains.`)
        ]),
        choiceStep("Invert the equation", raw`What does that tell us about \(x+yi\)?`, [
          correctChoice(raw`\(\,x+yi=\frac{1+pi}{pi}\)`, raw`Yes. Once the reciprocal equation is simplified, invert both sides.`),
          wrongChoice(raw`\(\,x+yi=\frac{pi}{1+pi}\)`, raw`That is still the reciprocal of \(x+yi\), not \(x+yi\) itself.`),
          wrongChoice(raw`\(\,x+yi=\frac{1}{1+pi-pi}\)`, raw`There is no need to recombine again after the inversion.`)
        ]),
        choiceStep("Simplify to a+bi", raw`Which form is correct for \(\frac{1+pi}{pi}\)?`, [
          wrongChoice(raw`\(\,1+\frac{1}{p}i\)`, raw`The imaginary part should be negative after simplifying.`),
          correctChoice(raw`\(\,1-\frac{1}{p}i\)`, raw`Exactly. This matches the schedule simplification.`),
          wrongChoice(raw`\(\,\frac{1}{p}+i\)`, raw`The real part is \(1\), not \(\frac{1}{p}\).`)
        ]),
        choiceStep("Read x and y", raw`So what are \(x\) and \(y\)?`, [
          wrongChoice(raw`\(\,x=1,\ y=\frac{1}{p}\)`, raw`The imaginary part is negative.`),
          correctChoice(raw`\(\,x=1,\ y=-\frac{1}{p}\)`, raw`Correct. Match the real and imaginary parts directly.`),
          wrongChoice(raw`\(\,x=\frac{1}{p},\ y=-1\)`, raw`Those values reverse the roles of the real and imaginary parts.`)
        ])
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
      steps: [
        choiceStep("Solve for z", raw`What do we get after rearranging \(z+2i=iz+k\)?`, [
          wrongChoice(raw`\(\,z(1+i)=k-2i\)`, raw`Moving \(iz\) to the left gives \(z-iz\), so the factor is \(1-i\).`),
          correctChoice(raw`\(\,z=\frac{k-2i}{1-i}\)`, raw`Correct. First factor out \(z\), then divide by \(1-i\).`),
          wrongChoice(raw`\(\,z=\frac{k+2i}{1-i}\)`, raw`The \(2i\) moves across the equals sign as \(-2i\).`)
        ]),
        choiceStep("Use the w relation", raw`Since \(\frac{w}{z}=2+2i\), how should we write \(w\)?`, [
          wrongChoice(raw`\(\,w=\frac{z}{2+2i}\)`, raw`The equation says \(w\) divided by \(z\), so multiply both sides by \(z\).`),
          correctChoice(raw`\(\,w=z(2+2i)\)`, raw`Exactly. That lets us substitute the expression we found for \(z\).`),
          wrongChoice(raw`\(\,w=2+2iz\)`, raw`The whole complex number \(2+2i\) multiplies \(z\).`)
        ]),
        choiceStep("Simplify w", raw`What does \(w\) simplify to?`, [
          wrongChoice(raw`\(\,w=2k+4i\)`, raw`The real and imaginary parts are not arranged that way after multiplication.`),
          correctChoice(raw`\(\,w=4+2ki\)`, raw`Correct. Using \(\frac{2+2i}{1-i}=2i\) makes the simplification quick.`),
          wrongChoice(raw`\(\,w=4-2ki\)`, raw`The imaginary part is positive because \(k\cdot 2i\) stays positive.`)
        ]),
        choiceStep("Use the imaginary part", raw`If \(\operatorname{Im}(w)=8\), what is \(k\)?`, [
          wrongChoice(raw`\(\,2\)`, raw`The imaginary coefficient is \(2k\), so solve \(2k=8\).`),
          correctChoice(raw`\(\,4\)`, raw`Exactly. The imaginary part of \(4+2ki\) is \(2k\).`),
          wrongChoice(raw`\(\,8\)`, raw`That would make the imaginary part \(16\), not \(8\).`)
        ])
      ]
    })
  };
}());
