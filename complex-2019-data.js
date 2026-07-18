(function () {
  const raw = String.raw;
  const paperHref = "level-3-complex-numbers-2019.html";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const questionImageDimensions = {
    "1a": [2130, 240], "1b": [2000, 300], "1c": [1800, 210], "1d": [2010, 235], "1e": [2110, 210],
    "2a": [2130, 200], "2b": [1960, 160], "2c": [1800, 250], "2d": [2090, 150], "2e": [1660, 140],
    "3a": [1750, 140], "3b": [2190, 215], "3c": [1700, 280], "3d": [1920, 260], "3e": [2150, 210]
  };
  const metadata = {
    topic: "Complex Numbers",
    year: 2019,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };
  const tags = [
    "Complex Numbers",
    "2019",
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
    return "complex-2019.html?q=" + encodeURIComponent(id);
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
      browserTitle: "2019 Level 3 Complex Numbers Paper — " + questionLabel(id),
      eyebrow: "Level 3 Complex Numbers Walkthrough",
      title: questionLabel(id),
      subtitle: "2019 Paper",
      backHref: paperHref,
      nextHref: next ? pageHref(next) : paperHref,
      nextLabel: next ? "Next question →" : "Back to paper",
      finalNav: buildFinalNav(id),
      partNavigation: buildPartNavigation(id),
      partNavigationTitle: "2019 paper questions",
      focus: focus,
      metadata: metadata,
      tags: tags,
      questionHtml: raw`
        <img class="question-screenshot" src="assets/complex-2019/${id}-question.png" width="${imageDimensions[0]}" height="${imageDimensions[1]}" alt="${questionImageAlt(id, focus)}" />
      `,
      answerHtml: finalAnswer,
      guidedSteps: guidedSteps
    }, details || {});
  }

  window.Complex2019Walkthroughs = {
    "1a": createConfig("1a", raw`Complete the square, then take the square root of a negative number using \(i^2=-1\).`, raw`
      <div class="math-block">
        \[
        \boxed{x=2\pm\sqrt{3}\,i}
        \]
      </div>
    `, [
      guidedStep("Complete the square", raw`Move the constant term first. Adding \(4\) to both sides turns the left side into \((x-2)^2\).`, raw`
        <div class="math-block">
          \[
          x^2-4x=-7
          \]
          \[
          (x-2)^2=-3
          \]
        </div>
      `),
      guidedStep("Take both square roots", raw`Since \(\sqrt{-3}=\sqrt{3}\,i\), include both the positive and negative square roots.`, raw`
        <div class="math-block">
          \[
          x=2\pm\sqrt{3}\,i
          \]
        </div>
      `)
    ]),

    "1b": createConfig("1b", raw`Use the Remainder Theorem: division by \(x-3\) leaves remainder \(f(3)\).`, raw`
      <div class="math-block">
        \[
        \boxed{p=5}
        \]
      </div>
    `, [
      guidedStep("Apply the Remainder Theorem", raw`Let \(f(x)=2x^3-x^2-4x+p\). The stated remainder gives \(f(3)=38\).`, raw`
        <div class="math-block">
          \[
          f(3)=38
          \]
          \[
          2(3)^3-3^2-4(3)+p=38
          \]
        </div>
      `),
      guidedStep("Solve for the constant", raw`Evaluate the numerical terms, then isolate \(p\).`, raw`
        <div class="math-block">
          \[
          33+p=38
          \]
          \[
          p=5
          \]
        </div>
      `)
    ]),

    "1c": createConfig("1c", raw`Rationalise the denominator, write the quotient in \(a+bi\) form, then apply \(|a+bi|=\sqrt{a^2+b^2}\).`, raw`
      <div class="math-block">
        \[
        \boxed{q=\pm29}
        \]
      </div>
    `, [
      guidedStep("Rationalise the quotient", raw`Multiply numerator and denominator by the conjugate \(1+2i\).`, raw`
        <div class="math-block">
          \[
          \left|\frac{u}{v}\right|
          =\left|\frac{q+2i}{1-2i}\right|
          \]
          \[
          =\left|\frac{(q+2i)(1+2i)}{5}\right|
          \]
          \[
          =\left|\frac{q+2qi+2i-4}{5}\right|=13
          \]
        </div>
      `),
      guidedStep("Apply the complex modulus", raw`The real part is \(\frac{q-4}{5}\) and the imaginary coefficient is \(\frac{2q+2}{5}\).`, raw`
        <div class="math-block">
          \[
          \sqrt{\frac{(q-4)^2}{25}+\frac{(2q+2)^2}{25}}=13
          \]
          \[
          (q-4)^2+(2q+2)^2=4225
          \]
        </div>
      `),
      guidedStep("Expand and solve", raw`Expand both squares. The linear terms cancel, leaving a quadratic in \(q\).`, raw`
        <div class="math-block">
          \[
          q^2-8q+16+4q^2+8q+4=4225
          \]
          \[
          5q^2=4205
          \]
          \[
          q^2=841
          \]
          \[
          q=\pm29
          \]
        </div>
      `)
    ]),

    "1d": createConfig("1d", raw`Because every coefficient is real, the conjugate \(1+2i\) is also a root. Multiply the conjugate factors, then identify the remaining linear factor.`, raw`
      <div class="math-block">
        \[
        \boxed{c=12,\quad z=1+2i,\quad z=\frac12}
        \]
      </div>
    `, [
      guidedStep("Use the conjugate root", raw`The roots \(1-2i\) and \(1+2i\) give a real quadratic factor.`, raw`
        <div class="math-block">
          \[
          (z-1+2i)(z-1-2i)
          \]
          \[
          =z^2-2z+1+4
          \]
          \[
          =z^2-2z+5
          \]
        </div>
      `),
      guidedStep("Find and expand the remaining factor", raw`The leading coefficient and constant term require the remaining factor to be \(2z-1\).`, raw`
        <div class="math-block">
          \[
          (2z-1)(z^2-2z+5)
          \]
          \[
          =2z^3-4z^2+10z-z^2+2z-5
          \]
          \[
          =2z^3-5z^2+12z-5
          \]
        </div>
      `),
      guidedStep("Read the coefficient and roots", raw`Compare the coefficient of \(z\), then set each factor equal to zero.`, raw`
        <div class="math-block">
          \[
          c=12
          \]
          \[
          z_2=1+2i
          \]
          \[
          z_3=\frac12
          \]
        </div>
      `)
    ]),

    "1e": createConfig("1e", raw`Clear both denominators, expand, then equate the real and imaginary parts.`, raw`
      <div class="math-block">
        \[
        \boxed{x=\frac3{17},\quad y=\frac5{17}}
        \]
      </div>
    `, [
      guidedStep("Clear the denominators", raw`Multiply through by \((1+i)(x+iy)\), then simplify \((1-2i)(1+i)\).`, raw`
        <div class="math-block">
          \[
          1+i-x-yi=(1-2i)(1+i)(x+yi)
          \]
          \[
          1+i-x-yi=(1+i-2i+2)(x+yi)
          \]
          \[
          1+i-x-yi=(3-i)(x+yi)
          \]
        </div>
      `),
      guidedStep("Separate real and imaginary parts", raw`Expand the right side and move every term to one side. Equal complex numbers have equal corresponding parts.`, raw`
        <div class="math-block">
          \[
          1+i-x-yi=3x+3yi-xi+y
          \]
          \[
          0=1-y-4x+(x-4y+1)i
          \]
          \[
          1-y-4x=0
          \]
          \[
          y=1-4x
          \]
          \[
          x-4y+1=0
          \]
        </div>
      `),
      guidedStep("Solve the simultaneous equations", raw`Substitute \(y=1-4x\) into the imaginary-part equation, then calculate \(y\).`, raw`
        <div class="math-block">
          \[
          x-4(1-4x)+1=0
          \]
          \[
          x-4+16x+1=0
          \]
          \[
          17x=3
          \]
          \[
          x=\frac3{17}
          \]
          \[
          y=\frac5{17}
          \]
        </div>
      `)
    ]),

    "2a": createConfig("2a", raw`Conjugating \(p\) changes the sign of its imaginary part. Then expand \(-3q\) and collect like terms.`, raw`
      <div class="math-block">
        \[
        \boxed{\overline p-3q=9-14i}
        \]
      </div>
    `, [
      guidedStep("Substitute the complex numbers", raw`Use \(\overline p=3+i\) and keep the subtraction outside \(3q\).`, raw`
        <div class="math-block">
          \[
          \overline p-3q=3+i-3(-2+5i)
          \]
          \[
          =3+i+6-15i
          \]
          \[
          =9-14i
          \]
        </div>
      `)
    ]),

    "2b": createConfig("2b", raw`Multiply by the conjugate \(4+\sqrt5\) so the denominator becomes a difference of two squares.`, raw`
      <div class="math-block">
        \[
        \boxed{\frac{12+3\sqrt5}{11}},\qquad
        \boxed{a=\frac{12}{11},\ b=\frac3{11}}
        \]
      </div>
    `, [
      guidedStep("Rationalise the denominator", raw`The product \((4-\sqrt5)(4+\sqrt5)=16-5=11\).`, raw`
        <div class="math-block">
          \[
          \frac3{4-\sqrt5}\times\frac{4+\sqrt5}{4+\sqrt5}
          \]
          \[
          =\frac{12+3\sqrt5}{11}
          \]
        </div>
      `),
      guidedStep("Identify the coefficients", raw`Match the result with \(a+b\sqrt5\).`, raw`
        <div class="math-block">
          \[
          a=\frac{12}{11},\qquad b=\frac3{11}
          \]
        </div>
      `)
    ]),

    "2c": createConfig("2c", raw`Write \(-i\) with argument \(\frac{3\pi}{2}\), then take fourth roots of the modulus and divide the general argument by four.`, raw`
      <div class="math-block">
        <p class="step-text">For \(p\ne0\), the four roots are</p>
        \[
        \boxed{z=2\sqrt{|p|}\,\operatorname{cis}\!\left(
          \frac{3\pi}{8}+\frac{k\pi}{2}
        \right),\quad k=0,1,2,3}
        \]
        <p class="step-text">For \(p=0\), \(z=0\) is the repeated solution.</p>
      </div>
    `, [
      guidedStep("Write the right side in polar form", raw`The source uses the argument \(\frac{3\pi}{2}+2k\pi\). The modulus is \(16p^2\).`, raw`
        <div class="math-block">
          \[
          z^4=-16p^2i
          \]
          \[
          z^4=16p^2\operatorname{cis}\!\left(\frac{3\pi}{2}+2k\pi\right)
          \]
        </div>
      `),
      guidedStep("Take the fourth roots", raw`When \(p>0\), the source's radius \(2\sqrt p\) is valid. Dividing the arguments by four gives four angles.`, raw`
        <div class="math-block">
          \[
          z=2\sqrt p\,\operatorname{cis}\!\left(\frac{3\pi}{8}+\frac{k\pi}{2}\right)
          \]
          \[
          z_1=2\sqrt p\,\operatorname{cis}\!\left(\frac{3\pi}{8}\right)
          \]
          \[
          z_2=2\sqrt p\,\operatorname{cis}\!\left(\frac{7\pi}{8}\right)
          \]
          \[
          z_3=2\sqrt p\,\operatorname{cis}\!\left(-\frac{5\pi}{8}\right)
          \]
          \[
          z_4=2\sqrt p\,\operatorname{cis}\!\left(-\frac{\pi}{8}\right)
          \]
        </div>
      `),
      guidedStep(raw`Qualify the answer for every real \(p\)`, raw`Because \(\sqrt[4]{16p^2}=2\sqrt{|p|}\), replace \(2\sqrt p\) by \(2\sqrt{|p|}\) when \(p\) may be negative. The angles do not change.`, raw`
        <div class="math-block">
          \[
          z=2\sqrt{|p|}\,\operatorname{cis}\!\left(\frac{3\pi}{8}+\frac{k\pi}{2}\right),
          \qquad k=0,1,2,3
          \]
          <p class="step-text">If \(p=0\), the original equation is \(z^4=0\), so the only value is \(z=0\), with multiplicity four.</p>
        </div>
      `)
    ], { finalLabel: "Mathematically correct answer for real p" }),

    "2d": createConfig("2d", raw`Rationalise with \(1-\sqrt3i\). A complex number is purely real exactly when its imaginary part is zero.`, raw`
      <div class="math-block">
        \[
        \boxed{m=3}
        \]
      </div>
    `, [
      guidedStep("Rationalise the denominator", raw`Multiply numerator and denominator by the conjugate \(1-\sqrt3i\).`, raw`
        <div class="math-block">
          \[
          \frac{\sqrt3+mi}{1+\sqrt3i}\times
          \frac{1-\sqrt3i}{1-\sqrt3i}
          \]
          \[
          =\frac{\sqrt3-3i+mi+\sqrt3m}{4}
          \]
        </div>
        <p class="step-text question-note">The PDF has a minus sign before \(\sqrt3m\); direct expansion gives the plus sign shown here.</p>
      `),
      guidedStep("Set the imaginary part to zero", raw`Only the imaginary coefficient determines whether the quotient is purely real.`, raw`
        <div class="math-block">
          \[
          (m-3)i=0
          \]
          \[
          m=3
          \]
        </div>
      `)
    ]),

    "2e": createConfig("2e", raw`Write \(z=x+yi\), rationalise the quotient, and use \(x^2+y^2=1\) to eliminate its real part.`, raw`
      <div class="math-block">
        \[
        \boxed{\frac{1+z}{1-z}=\frac{2yi}{(1-x)^2+y^2}}
        \]
        <p class="step-text">This has zero real part, so it is purely imaginary.</p>
      </div>
    `, [
      guidedStep("Translate the modulus condition", raw`Writing \(z=x+yi\) turns \(|z|=1\) into the unit-circle equation.`, raw`
        <div class="math-block">
          \[
          z=x+yi
          \]
          \[
          \sqrt{x^2+y^2}=1
          \]
          \[
          x^2+y^2=1
          \]
        </div>
      `),
      guidedStep("Rationalise the quotient", raw`Substitute \(z=x+yi\) and multiply numerator and denominator by \(1-x+yi\).`, raw`
        <div class="math-block">
          \[
          \frac{1+z}{1-z}=\frac{1+x+yi}{1-x-yi}
          \]
          \[
          \frac{1+x+yi}{1-x-yi}\times\frac{1-x+yi}{1-x+yi}
          \]
          \[
          =\frac{(1+x+yi)(1-x+yi)}{(1-x)^2+y^2}
          \]
        </div>
      `),
      guidedStep("Expand the entire numerator", raw`Keep every product visible so the cancelling terms and the real part can be checked.`, raw`
        <div class="math-block">
          \[
          \frac{1-x+yi+x-x^2+xyi+yi-xyi-y^2}{(1-x)^2+y^2}
          \]
          \[
          =\frac{1-x^2-y^2+2yi}{(1-x)^2+y^2}
          \]
        </div>
      `),
      guidedStep(raw`Use \(|z|=1\) and finish the proof`, raw`Since \(x^2+y^2=1\), the real numerator is zero. Also, \(z\ne1\) ensures \(1-z\ne0\), so the denominator is nonzero.`, raw`
        <div class="math-block">
          \[
          1-x^2-y^2=0
          \]
          \[
          =\frac{2yi}{(1-x)^2+y^2}
          \]
          <p class="step-text">The remaining numerator is purely imaginary and the denominator is real and nonzero. Therefore \(\frac{1+z}{1-z}\) is purely imaginary.</p>
        </div>
      `)
    ]),

    "3a": createConfig("3a", raw`When dividing polar forms, divide the moduli and subtract the arguments.`, raw`
      <div class="math-block">
        \[
        \boxed{\frac uv=\frac1q\operatorname{cis}\!\left(\frac{5\pi}{12}\right)}
        \]
      </div>
    `, [
      guidedStep("Divide the moduli and subtract arguments", raw`Use \(q^2/q^3=1/q\) and \(\frac{3\pi}{4}-\frac{\pi}{3}=\frac{5\pi}{12}\).`, raw`
        <div class="math-block">
          \[
          \frac uv=\frac{q^2\operatorname{cis}(3\pi/4)}{q^3\operatorname{cis}(\pi/3)}
          \]
          \[
          =\frac1q\operatorname{cis}\!\left(\frac{5\pi}{12}\right)
          \]
        </div>
        <p class="step-text question-note">The quotient requires \(q\ne0\). The displayed polar radius assumes the paper's intended \(q>0\).</p>
      `)
    ]),

    "3b": createConfig("3b", raw`Expand the product and equate its real and imaginary parts with \(3-i\).`, raw`
      <div class="math-block">
        \[
        \boxed{x=1,\quad y=-1}
        \]
      </div>
    `, [
      guidedStep("Expand and collect corresponding parts", raw`Group the real terms together and the imaginary terms together.`, raw`
        <div class="math-block">
          \[
          (x+yi)(2+i)=2x+xi+2yi-y
          \]
          \[
          2x-y+(x+2y)i=3-i
          \]
        </div>
      `),
      guidedStep("Form two real equations", raw`Match the real part with \(3\) and the imaginary coefficient with \(-1\).`, raw`
        <div class="math-block">
          \[
          2x-y=3
          \]
          \[
          y=2x-3
          \]
          \[
          x+2y=-1
          \]
        </div>
      `),
      guidedStep("Substitute and solve", raw`Substitute the expression for \(y\) into the second equation.`, raw`
        <div class="math-block">
          \[
          x+2(2x-3)=-1
          \]
          \[
          x+4x-6=-1
          \]
          \[
          5x=5
          \]
          \[
          x=1
          \]
          \[
          y=-1
          \]
        </div>
      `)
    ]),

    "3c": createConfig("3c", raw`Isolate the radical term and square both sides, then check the result in the original equation because squaring can introduce invalid solutions.`, raw`
      <div class="math-block">
        \[
        \boxed{x=\frac{12}{4-w^2}\quad\text{for }0\le w<2}
        \]
        <p class="step-text">For real \(x,w\), there is no real solution outside this range.</p>
      </div>
    `, [
      guidedStep("Isolate and square", raw`Both square roots are principal real square roots. Squaring is valid as an algebraic step, but the candidate must later be checked.`, raw`
        <div class="math-block">
          \[
          2\sqrt{x-3}=w\sqrt x
          \]
          \[
          4(x-3)=w^2x
          \]
        </div>
      `),
      guidedStep(raw`Rearrange for \(x\)`, raw`Collect the terms containing \(x\), then divide by \(4-w^2\).`, raw`
        <div class="math-block">
          \[
          4x-12=w^2x
          \]
          \[
          12=4x-w^2x
          \]
          \[
          12=x(4-w^2)
          \]
          \[
          x=\frac{12}{4-w^2}
          \]
        </div>
      `),
      guidedStep("Check the real-domain restrictions", raw`The original left side is nonnegative and \(\sqrt x>0\) for \(x\ge3\), so \(w\ge0\). The candidate is real with \(x\ge3\) only when \(|w|<2\).`, raw`
        <div class="math-block">
          \[
          0\le w<2
          \]
          <p class="step-text">Substituting the candidate into the original equation verifies it throughout this interval.</p>
          \[
          w=2:\quad 2\sqrt{x-3}=2\sqrt x
          \Longrightarrow x-3=x,
          \]
          \[
          w=-2:\quad 2\sqrt{x-3}=-2\sqrt x,
          \]
          <p class="step-text">The first is a contradiction, and the second equates a nonnegative quantity with a negative one (with no common zero). Thus \(w=\pm2\) gives no solution, not an infinite value.</p>
        </div>
      `)
    ], { finalLabel: "Real-variable answer" }),

    "3d": createConfig("3d", raw`Rationalise \(u/v\). An argument of \(\pi/4\) requires equal positive real and imaginary components.`, raw`
      <div class="math-block">
        \[
        \boxed{p=4}
        \]
      </div>
    `, [
      guidedStep("Write the quotient in Cartesian form", raw`Multiply by the conjugate \(5-3i\) and expand every numerator term.`, raw`
        <div class="math-block">
          \[
          \frac{1+pi}{5+3i}
          \]
          \[
          =\frac{(1+pi)(5-3i)}{34}
          \]
          \[
          =\frac{5-3i+5pi+3p}{34}
          \]
        </div>
      `),
      guidedStep("Use the argument condition", raw`At argument \(\pi/4\), the real and imaginary components are equal and positive.`, raw`
        <div class="math-block">
          \[
          \frac{5+3p}{34}=\frac{5p-3}{34}
          \]
          \[
          p=4
          \]
        </div>
      `),
      guidedStep("Verify the quadrant", raw`Substitute \(p=4\) into the quotient. Both components are positive, so equality really gives argument \(\pi/4\), not \(-3\pi/4\).`, raw`
        <div class="math-block">
          \[
          \frac{1+4i}{5+3i}=\frac{17+17i}{34}=\frac12+\frac12i
          \]
        </div>
      `)
    ]),

    "3e": createConfig("3e", raw`Rearrange into a quadratic in \(x\). It has two distinct real roots exactly when its discriminant is positive.`, raw`
      <div class="math-block">
        \[
        \boxed{\Delta=5(k-3)^2+4>0\quad\text{for every real }k}
        \]
      </div>
    `, [
      guidedStep("Put the equation in quadratic form", raw`Move every term to the left and collect the coefficient of \(x\).`, raw`
        <div class="math-block">
          \[
          x^2+(3k-7)x+(k^2-3k)=0
          \]
        </div>
      `),
      guidedStep("Calculate the discriminant", raw`Use \(a=1\), \(b=3k-7\), and \(c=k^2-3k\).`, raw`
        <div class="math-block">
          \[
          \Delta=(3k-7)^2-4(k^2-3k)(1)
          \]
          \[
          =9k^2-42k+49-4k^2+12k
          \]
          \[
          =5k^2-30k+49
          \]
        </div>
      `),
      guidedStep(raw`Complete the square in \(k\)`, raw`Write the discriminant as a nonnegative square plus a positive constant.`, raw`
        <div class="math-block">
          \[
          =5(k-3)^2+49-45
          \]
          \[
          =5(k-3)^2+4
          \]
          <p class="step-text">Since \(5(k-3)^2+4>0\) for every real \(k\), the quadratic has two distinct real roots.</p>
        </div>
      `)
    ], { finalLabel: "Proof complete" })
  };
}());
