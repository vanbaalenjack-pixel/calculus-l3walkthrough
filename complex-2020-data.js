(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-complex-2020";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const questionImageDimensions = {
    "1a": [2688, 469], "1b": [2750, 388], "1c": [2750, 575], "1d": [2750, 450], "1e": [2750, 475],
    "2a": [2750, 438], "2b": [2750, 513], "2c": [2750, 550], "2d": [2750, 563], "2e": [2750, 550],
    "3a": [2750, 594], "3b": [2750, 488], "3c": [2750, 625], "3d": [2750, 638], "3e": [2750, 532]
  };
  const metadata = {
    topic: "Complex Numbers",
    year: 2020,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };
  const tags = [
    "Complex Numbers",
    "2020",
    "NCEA Level 3 Calculus",
    "mixed / Excellence-style"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function questionImageAlt(id, focus) {
    const plainFocus = String(focus)
      .replace(/\\\([\s\S]*?\\\)/g, "the mathematical expression shown")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return questionLabel(id) + " scanned exam prompt. Walkthrough focus: " + plainFocus;
  }

  function pageHref(id) {
    return "complex-2020.html?q=" + encodeURIComponent(id);
  }

  function adjacentId(id, offset) {
    const index = questionOrder.indexOf(id);
    const target = index + offset;
    return index >= 0 && target >= 0 && target < questionOrder.length
      ? questionOrder[target]
      : null;
  }

  function buildFinalNav(id) {
    const previous = adjacentId(id, -1);
    const next = adjacentId(id, 1);

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

  function answerHighlight(html, label) {
    return raw`
      <div class="answer-highlight walkthrough-answer-highlight">
        <p class="question-label">${label || "Final answer"}</p>
        ${html}
      </div>
    `;
  }

  function guidedStep(title, previewHtml, workingHtml) {
    return {
      title: title,
      previewHtml: previewHtml,
      workingHtml: workingHtml
    };
  }

  function createConfig(id, focus, finalHtml, steps, details) {
    const next = adjacentId(id, 1);
    const imageDimensions = questionImageDimensions[id];
    const finalAnswer = answerHighlight(finalHtml, details && details.finalLabel);
    const guidedSteps = steps.map(function (step) {
      return Object.assign({}, step);
    });

    if (guidedSteps.length) {
      guidedSteps[guidedSteps.length - 1].workingHtml += finalAnswer;
    }

    return Object.assign({
      browserTitle: "2020 Complex Numbers Paper — " + questionLabel(id),
      eyebrow: "Level 3 Complex Numbers Walkthrough",
      title: questionLabel(id),
      subtitle: "2020 Paper",
      backHref: paperHref,
      nextHref: next ? pageHref(next) : paperHref,
      nextLabel: next ? "Next question →" : "Back to paper",
      finalNav: buildFinalNav(id),
      partNavigation: buildPartNavigation(id),
      partNavigationTitle: "2020 paper questions",
      focus: focus,
      metadata: metadata,
      tags: tags,
      questionHtml: raw`
        <img class="question-screenshot" src="assets/complex-2020/${id}-question.png" width="${imageDimensions[0]}" height="${imageDimensions[1]}" alt="${questionImageAlt(id, focus)}" />
      `,
      answerHtml: finalAnswer,
      guidedSteps: guidedSteps
    }, details || {});
  }

  window.Complex2020Walkthroughs = {
    "1a": createConfig("1a", raw`Expand \(st\), use \(i^2=-1\), then match either the real or imaginary parts.`, raw`
      <div class="math-block">
        \[
        \boxed{k=-5}
        \]
      </div>
    `, [
      guidedStep("Set up the multiplication", raw`Substitute the given expressions for \(s\) and \(t\) into \(st\).`, raw`
        <div class="math-block">
          \[
          st=(2+3i)(3+ki)
          \]
        </div>
      `),
      guidedStep("Expand and collect terms", raw`Use FOIL, replace \(i^2\) with \(-1\), and group the real and imaginary parts.`, raw`
        <div class="math-block">
          \[
          (2+3i)(3+ki)=6+2ki+9i+3ki^2
          \]
          \[
          =6-3k+(9+2k)i
          \]
        </div>
      `),
      guidedStep("Equate corresponding parts", raw`Since equal complex numbers have equal real and imaginary parts, either comparison gives \(k\).`, raw`
        <div class="math-block">
          \[
          6-3k=21
          \]
          \[
          -3k=15
          \]
          \[
          k=-5
          \]
          <p class="step-text">Equivalently, the imaginary parts give \(9+2k=-1\), so again \(k=-5\).</p>
        </div>
      `)
    ]),

    "1b": createConfig("1b", raw`A quadratic has exactly one real solution when its discriminant is zero.`, raw`
      <div class="math-block">
        \[
        \boxed{r=0\text{ or }r=\frac14}
        \]
      </div>
    `, [
      guidedStep("Set the discriminant to zero", raw`For \(x^2+4rx+r=0\), identify \(a=1\), \(b=4r\), and \(c=r\).`, raw`
        <div class="math-block">
          \[
          \Delta=b^2-4ac=0
          \]
          \[
          (4r)^2-4(1)(r)=0
          \]
          \[
          16r^2-4r=0
          \]
        </div>
      `),
      guidedStep("Factor and solve", raw`Take out the common factor, then use the zero-product property.`, raw`
        <div class="math-block">
          \[
          4r(4r-1)=0
          \]
          \[
          4r=0\quad\text{or}\quad4r-1=0
          \]
          \[
          r=0\quad\text{or}\quad r=\frac14
          \]
        </div>
      `)
    ]),

    "1c": createConfig("1c", raw`Square once, isolate the remaining \(\sqrt{x}\) term, then square again.`, raw`
      <div class="math-block">
        \[
        \boxed{x=\left(\frac{25+g}{20}\right)^2}
        \]
      </div>
    `, [
      guidedStep("Square both sides", raw`Expand the squared binomial carefully; its middle term is \(-20\sqrt{x}\).`, raw`
        <div class="math-block">
          \[
          (2\sqrt{x}-5)^2=4x-g
          \]
          \[
          4x-20\sqrt{x}+25=4x-g
          \]
        </div>
      `),
      guidedStep("Isolate the surd and solve", raw`Cancel \(4x\), rearrange for \(\sqrt{x}\), then square.`, raw`
        <div class="math-block">
          \[
          20\sqrt{x}=25+g
          \]
          \[
          \sqrt{x}=\frac{25+g}{20}
          \]
          \[
          x=\left(\frac{25+g}{20}\right)^2
          \]
        </div>
      `)
    ]),

    "1d": createConfig("1d", raw`Rationalise each denominator with its conjugate, then combine the results.`, raw`
      <div class="math-block">
        \[
        \boxed{k}
        \]
      </div>
    `, [
      guidedStep("Use the conjugate denominators", raw`Multiply the first fraction by \(\frac{1+i}{1+i}\) and the second by \(\frac{1-i}{1-i}\).`, raw`
        <div class="math-block">
          \[
          \frac{k+ki}{1-i}+\frac{2k}{1+i}
          =\frac{(k+ki)(1+i)}{(1-i)(1+i)}
          +\frac{2k(1-i)}{(1+i)(1-i)}
          \]
          \[
          =\frac{(k+ki)(1+i)}{2}+\frac{2k(1-i)}{2}
          \]
        </div>
      `),
      guidedStep("Expand and simplify", raw`Expand both numerators and collect the real and imaginary terms.`, raw`
        <div class="math-block">
          \[
          \frac{k+ki+ki-k}{2}+\frac{2k-2ki}{2}
          \]
          \[
          =\frac{2ki+2k-2ki}{2}
          =\frac{2k}{2}
          =k
          \]
        </div>
      `)
    ]),

    "1e": createConfig("1e", raw`Write \(1+T^2\) and \(2T\) using the same factors, then simplify their quotient.`, raw`
      <div class="math-block">
        \[
        \boxed{\frac{1+T^2}{2T}=\frac{a^2-b^2}{a^2+b^2}}
        \]
      </div>
    `, [
      guidedStep("Express the numerator and denominator", raw`Substitute \(T=\frac{a-bi}{a+bi}\) into \(1+T^2\) and \(2T\).`, raw`
        <div class="math-block">
          \[
          1+T^2
          =1+\frac{(a-bi)^2}{(a+bi)^2}
          =\frac{(a+bi)^2+(a-bi)^2}{(a+bi)^2}
          \]
          \[
          2T=\frac{2(a-bi)}{a+bi}
          \]
        </div>
      `),
      guidedStep("Form the quotient", raw`Divide by multiplying by the reciprocal, then cancel one factor of \(a+bi\).`, raw`
        <div class="math-block">
          \[
          \frac{1+T^2}{2T}
          =\frac{(a+bi)^2+(a-bi)^2}{(a+bi)^2}
          \cdot\frac{a+bi}{2(a-bi)}
          \]
          \[
          =\frac{(a+bi)^2+(a-bi)^2}{2(a-bi)(a+bi)}
          \]
        </div>
      `),
      guidedStep("Expand and finish the proof", raw`The imaginary middle terms cancel in the numerator, while the denominator is a product of conjugates.`, raw`
        <div class="math-block">
          \[
          (a+bi)^2+(a-bi)^2=2a^2-2b^2
          \]
          \[
          2(a-bi)(a+bi)=2(a^2+b^2)
          \]
          \[
          \therefore\quad
          \frac{1+T^2}{2T}
          =\frac{2(a^2-b^2)}{2(a^2+b^2)}
          =\frac{a^2-b^2}{a^2+b^2}
          \]
        </div>
      `)
    ]),

    "2a": createConfig("2a", raw`Use the factor theorem: if \(x-2\) is a factor, then the polynomial is zero at \(x=2\).`, raw`
      <div class="math-block">
        \[
        \boxed{q=7}
        \]
      </div>
    `, [
      guidedStep("Apply the factor theorem", raw`Substitute \(x=2\) into every term of the polynomial.`, raw`
        <div class="math-block">
          \[
          2(2)^3+q(2)^2-17(2)-10=0
          \]
          \[
          16+4q-34-10=0
          \]
        </div>
      `),
      guidedStep("Solve for the coefficient", raw`Collect the constants, then isolate \(q\).`, raw`
        <div class="math-block">
          \[
          4q-28=0
          \]
          \[
          4q=28
          \]
          \[
          q=7
          \]
        </div>
      `)
    ]),

    "2b": createConfig("2b", raw`Square the modulus so that \(|a+bi|^2=a^2+b^2\), then solve the resulting equation.`, raw`
      <div class="math-block">
        \[
        \boxed{k=\pm4}
        \]
      </div>
    `, [
      guidedStep("Translate the modulus", raw`Use the real part \(5\) and imaginary part \(3k\).`, raw`
        <div class="math-block">
          \[
          |5+3ki|=13
          \]
          \[
          5^2+(3k)^2=13^2
          \]
          \[
          25+9k^2=169
          \]
        </div>
      `),
      guidedStep("Solve for all values", raw`Isolate \(k^2\) and remember both square roots.`, raw`
        <div class="math-block">
          \[
          9k^2=144
          \]
          \[
          k^2=16
          \]
          \[
          k=\pm4
          \]
        </div>
      `)
    ]),

    "2c": createConfig("2c", raw`Use the conjugate-root theorem to form a real quadratic factor, then find the remaining linear factor.`, raw`
      <div class="math-block">
        \[
        \boxed{z=3-i,\quad z=\frac32,\quad b=38}
        \]
      </div>
    `, [
      guidedStep("Use the conjugate root", raw`A polynomial with real coefficients has non-real roots in conjugate pairs.`, raw`
        <div class="math-block">
          \[
          z=3+i\quad\Longrightarrow\quad z=3-i
          \]
          <p class="step-text">The two matching factors are \(z-(3+i)\) and \(z-(3-i)\).</p>
        </div>
      `),
      guidedStep("Form the quadratic factor", raw`Multiply the conjugate factors as a difference of squares.`, raw`
        <div class="math-block">
          \[
          (z-3-i)(z-3+i)
          =(z-3)^2-i^2
          \]
          \[
          =z^2-6z+10
          \]
        </div>
      `),
      guidedStep("Find the third factor and compare", raw`The leading coefficient and constant term determine the remaining factor \(2z-3\).`, raw`
        <div class="math-block">
          \[
          (2z-3)(z^2-6z+10)
          \]
          \[
          =2z^3-15z^2+38z-30
          \]
          <p class="step-text">Comparing this with \(2z^3-15z^2+bz-30\) gives \(b=38\), and \(2z-3=0\) gives the third root \(z=\frac32\).</p>
        </div>
      `)
    ]),

    "2d": createConfig("2d", raw`Find the quadrant-correct argument of each number, then subtract when dividing.`, raw`
      <div class="math-block">
        \[
        \boxed{\arg\left(\frac uv\right)=-\frac{\pi}{2}}
        \]
      </div>
    `, [
      guidedStep("Find the numerator argument", raw`Because \(p>0\), \(u=p+pi\) lies in the first quadrant on the line \(y=x\).`, raw`
        <div class="math-block">
          \[
          \arg(u)=\tan^{-1}\left(\frac{p}{p}\right)
          =\tan^{-1}(1)
          =\frac{\pi}{4}
          \]
        </div>
      `),
      guidedStep("Find the denominator argument", raw`Because \(q>0\), \(v=-q+qi\) lies in the second quadrant.`, raw`
        <div class="math-block">
          \[
          \arg(v)=\frac{3\pi}{4}
          \]
        </div>
      `),
      guidedStep("Subtract the arguments", raw`For a quotient, subtract the argument of the denominator from the argument of the numerator.`, raw`
        <div class="math-block">
          \[
          \arg\left(\frac uv\right)
          =\arg(u)-\arg(v)
          \]
          \[
          =\frac{\pi}{4}-\frac{3\pi}{4}
          =-\frac{\pi}{2}
          \]
        </div>
      `)
    ]),

    "2e": createConfig("2e", raw`Let \(z=x+yi\), convert each squared modulus to a Cartesian distance, and simplify.`, raw`
      <div class="math-block">
        \[
        \boxed{x^2+y^2=4}
        \]
      </div>
    `, [
      guidedStep("Write both moduli in Cartesian form", raw`Adding or subtracting \(i\) changes only the imaginary coordinate.`, raw`
        <div class="math-block">
          \[
          z=x+yi
          \]
          \[
          |z+i|^2=x^2+(y+1)^2
          \]
          \[
          |z-i|^2=x^2+(y-1)^2
          \]
        </div>
      `),
      guidedStep("Expand the locus equation", raw`Substitute these expressions into the given equation and combine like terms.`, raw`
        <div class="math-block">
          \[
          x^2+(y+1)^2+x^2+(y-1)^2=10
          \]
          \[
          2x^2+2y^2+2=10
          \]
        </div>
      `),
      guidedStep("Write the required form", raw`Subtract \(2\), then divide every term by \(2\).`, raw`
        <div class="math-block">
          \[
          2x^2+2y^2=8
          \]
          \[
          x^2+y^2=4
          \]
        </div>
      `)
    ]),

    "3a": createConfig("3a", raw`When dividing numbers in polar form, divide the moduli and subtract the arguments.`, raw`
      <div class="math-block">
        \[
        \boxed{\frac uv=6k^2\operatorname{cis}\left(\frac{2\pi}{3}\right)}
        \]
      </div>
    `, [
      guidedStep("Divide the moduli", raw`Simplify the numerical coefficient and the powers of \(k\).`, raw`
        <div class="math-block">
          \[
          \frac{12k^3}{2k}=6k^2
          \]
        </div>
      `),
      guidedStep("Subtract the arguments", raw`Use \(\arg\!\left(\frac uv\right)=\arg(u)-\arg(v)\).`, raw`
        <div class="math-block">
          \[
          \pi-\frac{\pi}{3}=\frac{2\pi}{3}
          \]
          \[
          \frac uv
          =6k^2\operatorname{cis}\left(\frac{2\pi}{3}\right)
          \]
        </div>
      `)
    ]),

    "3b": createConfig("3b", raw`Compute each squared modulus directly from its real and imaginary parts.`, raw`
      <div class="math-block">
        \[
        \boxed{|z|^2=26=2|w|^2}
        \]
      </div>
    `, [
      guidedStep("Find the squared modulus of z", raw`For \(z=a+bi\), the squared modulus is \(a^2+b^2\).`, raw`
        <div class="math-block">
          \[
          |z|^2=|5-i|^2=5^2+(-1)^2=26
          \]
        </div>
      `),
      guidedStep("Find the squared modulus of w and compare", raw`Repeat for \(w=-2+3i\), then multiply by \(2\).`, raw`
        <div class="math-block">
          \[
          |w|^2=|-2+3i|^2=(-2)^2+3^2=13
          \]
          \[
          2|w|^2=2(13)=26=|z|^2
          \]
        </div>
      `)
    ]),

    "3c": createConfig("3c", raw`Replace \(\overline z\) with \(a-bi\), then simplify the numerator and denominator separately.`, raw`
      <div class="math-block">
        \[
        \boxed{\frac{z\overline z}{z+\overline z}=\frac{a^2+b^2}{2a}\in\mathbb{R}}
        \]
      </div>
    `, [
      guidedStep("Substitute the conjugate", raw`Use \(z=a+bi\) and \(\overline z=a-bi\).`, raw`
        <div class="math-block">
          \[
          \frac{z\overline z}{z+\overline z}
          =\frac{(a+bi)(a-bi)}{(a+bi)+(a-bi)}
          \]
        </div>
      `),
      guidedStep("Simplify and identify the result", raw`The numerator is a product of conjugates and the imaginary parts cancel in the denominator.`, raw`
        <div class="math-block">
          \[
          \frac{(a+bi)(a-bi)}{(a+bi)+(a-bi)}
          =\frac{a^2+b^2}{2a}
          \]
          <p class="step-text">Since \(a\) and \(b\) are real and \(a\ne0\), this quotient is real.</p>
        </div>
      `)
    ]),

    "3d": createConfig("3d", raw`Write the negative real number in polar form, then take all four fourth roots.`, raw`
      <div class="math-block">
        \[
        \boxed{
          2k^2\operatorname{cis}\left(\frac{\pi}{4}\right),\ 
          2k^2\operatorname{cis}\left(\frac{3\pi}{4}\right),\ 
          2k^2\operatorname{cis}\left(-\frac{3\pi}{4}\right),\ 
          2k^2\operatorname{cis}\left(-\frac{\pi}{4}\right)
        }
        \]
      </div>
    `, [
      guidedStep("Write the right-hand side in polar form", raw`A negative real number has argument \(\pi+2n\pi\).`, raw`
        <div class="math-block">
          \[
          -16k^8=16k^8\operatorname{cis}(\pi+2n\pi)
          \]
          \[
          z^4=16k^8\operatorname{cis}(\pi+2n\pi)
          \]
        </div>
      `),
      guidedStep("Take the fourth roots", raw`Take the fourth root of the modulus and divide the general argument by \(4\).`, raw`
        <div class="math-block">
          \[
          z=2k^2\operatorname{cis}\left(\frac{\pi+2n\pi}{4}\right),
          \qquad n=0,1,2,3
          \]
        </div>
      `),
      guidedStep("List the four solutions", raw`Substitute the four consecutive values of \(n\) and use principal-angle equivalents where convenient.`, raw`
        <div class="math-block">
          \[
          z_1=2k^2\operatorname{cis}\left(\frac{\pi}{4}\right)
          \]
          \[
          z_2=2k^2\operatorname{cis}\left(\frac{3\pi}{4}\right)
          \]
          \[
          z_3=2k^2\operatorname{cis}\left(-\frac{3\pi}{4}\right)
          \]
          \[
          z_4=2k^2\operatorname{cis}\left(-\frac{\pi}{4}\right)
          \]
        </div>
      `)
    ]),

    "3e": createConfig("3e", raw`Write \(u\) and \(v\) in Cartesian form, use the equal moduli to eliminate the quotient’s real part, then rationalise.`, raw`
      <div class="math-block">
        \[
        \boxed{\frac uv=\frac{(bc-ad)i}{c^2+d^2},\text{ which is purely imaginary}}
        \]
      </div>
    `, [
      guidedStep("Translate the modulus condition", raw`Let \(u=a+bi\) and \(v=c+di\), then square both equal moduli.`, raw`
        <div class="math-block">
          \[
          |u+v|=|u-v|
          \]
          \[
          (a+c)^2+(b+d)^2=(a-c)^2+(b-d)^2
          \]
        </div>
      `),
      guidedStep("Simplify the condition", raw`Expand both sides and cancel the matching square terms.`, raw`
        <div class="math-block">
          \[
          a^2+2ac+c^2+b^2+2bd+d^2
          \]
          \[
          =a^2-2ac+c^2+b^2-2bd+d^2
          \]
          \[
          4ac+4bd=0
          \]
          \[
          ac+bd=0
          \]
        </div>
      `),
      guidedStep("Rationalise the quotient", raw`Multiply by the conjugate of \(v=c+di\) and separate the real and imaginary terms.`, raw`
        <div class="math-block">
          \[
          \frac uv=\frac{a+bi}{c+di}
          =\frac{(a+bi)(c-di)}{c^2+d^2}
          \]
          \[
          =\frac{ac+bd+(bc-ad)i}{c^2+d^2}
          \]
        </div>
      `),
      guidedStep("Use the zero real-part condition", raw`The real part vanishes, leaving only an imaginary multiple.`, raw`
        <div class="math-block">
          \[
          \frac uv
          =\frac{(bc-ad)i}{c^2+d^2}
          \]
          <p class="step-text">The coefficient \(\frac{bc-ad}{c^2+d^2}\) is real, so \(\frac uv\) is purely imaginary.</p>
        </div>
      `)
    ])
  };
}());
