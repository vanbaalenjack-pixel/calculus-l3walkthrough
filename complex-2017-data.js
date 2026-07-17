(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-complex-2017";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const metadata = {
    topic: "Complex Numbers",
    year: 2017,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };
  const tags = [
    "Complex Numbers",
    "2017",
    "NCEA Level 3 Calculus",
    "mixed / Excellence-style"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return "complex-2017.html?q=" + encodeURIComponent(id);
  }

  function previousId(id) {
    const index = questionOrder.indexOf(id);
    return index > 0 ? questionOrder[index - 1] : null;
  }

  function nextId(id) {
    const index = questionOrder.indexOf(id);
    return index >= 0 && index < questionOrder.length - 1
      ? questionOrder[index + 1]
      : null;
  }

  function buildFinalNav(id) {
    const previous = previousId(id);
    const next = nextId(id);

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

  function guidedStep(title, previewHtml, workingHtml) {
    return {
      title: title,
      previewHtml: previewHtml,
      workingHtml: workingHtml
    };
  }

  function answerBox(content) {
    return raw`
      <div class="answer-highlight walkthrough-answer-highlight">
        <p class="question-label">Final Answer</p>
        ${content}
      </div>
    `;
  }

  function createConfig(id, focus, questionHtml, answerHtml, guidedSteps) {
    const next = nextId(id);
    const steps = guidedSteps.map(function (step) {
      return Object.assign({}, step);
    });

    if (steps.length && answerHtml) {
      steps[steps.length - 1].workingHtml += answerHtml;
    }

    return {
      browserTitle: "2017 Level 3 Complex Numbers Paper - " + questionLabel(id),
      eyebrow: "Level 3 Complex Numbers Walkthrough",
      title: questionLabel(id),
      subtitle: "2017 Complex Numbers",
      backHref: paperHref,
      nextHref: next ? pageHref(next) : paperHref,
      nextLabel: next ? "Next question →" : "Back to paper",
      finalNav: buildFinalNav(id),
      partNavigation: buildPartNavigation(id),
      partNavigationTitle: "2017 paper questions",
      focus: focus,
      metadata: metadata,
      tags: tags,
      questionHtml: questionHtml,
      answerHtml: answerHtml,
      guidedSteps: steps
    };
  }

  window.Complex2017Walkthroughs = {
    "1a": createConfig(
      "1a",
      raw`Conjugate \(u\), distribute the factor \(-3\), then collect the real and imaginary parts separately.`,
      raw`
        <div class="question-math">
          <p class="step-text">If \(u=2+3i\) and \(v=1-4i\), find \(\overline{u}-3v\), giving your solution in the form \(a+bi\).</p>
        </div>
      `,
      answerBox(raw`
        <div class="math-block">
          \[
          \boxed{-1+9i}
          \]
        </div>
      `),
      [
        guidedStep("Form the conjugate of u", raw`Conjugation keeps the real part and reverses the sign of the imaginary part.`, raw`
          <p class="step-text">For \(u=2+3i\), reflect the imaginary coordinate across the real axis:</p>
          <div class="math-block">
            \[
            \overline{u}=2-3i.
            \]
          </div>
        `),
        guidedStep("Distribute the factor -3", raw`The factor \(-3\) multiplies both terms of \(v=1-4i\).`, raw`
          <div class="math-block">
            \[
            \overline{u}-3v=(2-3i)-3(1-4i)
            \]
            \[
            =2-3i-3+12i.
            \]
          </div>
          <p class="step-text">In particular, \((-3)(-4i)=+12i\).</p>
        `),
        guidedStep("Collect like parts", raw`Combine real terms with real terms and imaginary terms with imaginary terms.`, raw`
          <div class="math-block">
            \[
            (2-3)+(-3i+12i)=-1+9i.
            \]
          </div>
          <p class="step-text">This is already in the requested \(a+bi\) form.</p>
        `)
      ]
    ),

    "1b": createConfig(
      "1b",
      raw`Rationalise the denominator with its surd conjugate and use the difference of two squares.`,
      raw`
        <div class="question-math">
          <p class="step-text">Write</p>
          \[
          \frac{36}{5-\sqrt7}
          \]
          <p class="step-text">in the form \(a+b\sqrt7\), where \(a\) and \(b\) are integers.</p>
        </div>
      `,
      answerBox(raw`
        <div class="math-block">
          \[
          \boxed{10+2\sqrt7}
          \]
        </div>
      `),
      [
        guidedStep("Choose the surd conjugate", raw`Changing the sign between the two denominator terms creates a product with no surd term.`, raw`
          <p class="step-text">Multiply by \(1\) in the form \(\frac{5+\sqrt7}{5+\sqrt7}\):</p>
          <div class="math-block">
            \[
            \frac{36}{5-\sqrt7}\times\frac{5+\sqrt7}{5+\sqrt7}
            =\frac{36(5+\sqrt7)}{(5-\sqrt7)(5+\sqrt7)}.
            \]
          </div>
        `),
        guidedStep("Use the difference of two squares", raw`The identity \((a-b)(a+b)=a^2-b^2\) makes the denominator rational.`, raw`
          <div class="math-block">
            \[
            (5-\sqrt7)(5+\sqrt7)=5^2-(\sqrt7)^2=25-7=18.
            \]
            \[
            \frac{36(5+\sqrt7)}{18}
            =\frac{180+36\sqrt7}{18}.
            \]
          </div>
        `),
        guidedStep("Simplify both terms", raw`Divide each numerator term by \(18\).`, raw`
          <div class="math-block">
            \[
            \frac{180}{18}+\frac{36\sqrt7}{18}=10+2\sqrt7.
            \]
          </div>
          <p class="step-text">Both coefficients are integers, as requested.</p>
        `)
      ]
    ),

    "1c": createConfig(
      "1c",
      raw`Respect the real domain before squaring, solve the squared equation, then return to the original equation to determine the valid values of \(p\).`,
      raw`
        <div class="question-math">
          <p class="step-text">Solve the following equation for \(x\) in terms of \(p\):</p>
          \[
          p\sqrt{x-2}-5\sqrt{x}=0.
          \]
          <p class="step-text">Assume that the parameter \(p\) is real.</p>
        </div>
      `,
      answerBox(raw`
        <div class="math-block">
          \[
          \boxed{x=\frac{2p^2}{p^2-25}\quad\text{when }p>5}
          \]
          \[
          \boxed{\text{There is no real solution when }p\le 5.}
          \]
        </div>
      `),
      [
        guidedStep("Set the real domain and isolate the radicals", raw`Both square roots must be real. Then move one radical term to the other side before squaring.`, raw`
          <p class="step-text">The stricter radicand condition is</p>
          <div class="math-block">
            \[
            x-2\ge0\quad\Longrightarrow\quad x\ge2.
            \]
          </div>
          <p class="step-text">At \(x=2\), the original left side is \(-5\sqrt2\ne0\), so any solution actually has \(x>2\). Isolate the radical terms:</p>
          <div class="math-block">
            \[
            p\sqrt{x-2}=5\sqrt{x}.
            \]
          </div>
          <p class="step-text">The right side is positive for \(x>2\), so a solution also requires \(p>0\).</p>
        `),
        guidedStep("Square both sides carefully", raw`Squaring removes the radicals, but it can also create candidates that fail the unsquared equation.`, raw`
          <div class="math-block">
            \[
            \left(p\sqrt{x-2}\right)^2=\left(5\sqrt{x}\right)^2
            \]
            \[
            p^2(x-2)=25x.
            \]
          </div>
          <p class="step-text">We will therefore check both the domain and the sign information after solving.</p>
        `),
        guidedStep("Expand, collect, factor, and divide", raw`Make the \(x\)-terms appear together, factor out \(x\), and then isolate it.`, raw`
          <div class="math-block">
            \[
            p^2x-2p^2=25x
            \]
            \[
            p^2x-25x=2p^2
            \]
            \[
            x(p^2-25)=2p^2
            \]
            \[
            x=\frac{2p^2}{p^2-25}.
            \]
          </div>
          <p class="step-text">This division assumes \(p^2-25\ne0\). The cases \(p=\pm5\) must be considered through the original equation instead.</p>
        `),
        guidedStep("Determine the valid parameter range", raw`Use the original, unsquared equation to decide when the algebraic candidate is genuine.`, raw`
          <p class="step-text">Because \(x>2\), divide the isolated equation by \(\sqrt{x-2}>0\):</p>
          <div class="math-block">
            \[
            p=5\sqrt{\frac{x}{x-2}}.
            \]
          </div>
          <p class="step-text">Here \(\frac{x}{x-2}>1\), so every real solution must satisfy \(p>5\). This proves that \(p\le5\) gives no real solution. It also explains why squaring would produce false candidates when \(p<-5\).</p>
        `),
        guidedStep("Check the candidate for p > 5", raw`For \(p>5\), verify that the formula lies in the domain and satisfies the original signs.`, raw`
          <p class="step-text">If \(p>5\), then \(p^2-25>0\), and</p>
          <div class="math-block">
            \[
            x-2=\frac{2p^2}{p^2-25}-2=\frac{50}{p^2-25}>0.
            \]
            \[
            p\sqrt{x-2}
            =p\sqrt{\frac{50}{p^2-25}}
            =5p\sqrt{\frac{2}{p^2-25}},
            \]
            \[
            5\sqrt{x}
            =5\sqrt{\frac{2p^2}{p^2-25}}
            =5p\sqrt{\frac{2}{p^2-25}}.
            \]
          </div>
          <p class="step-text">The two sides match, so the candidate is valid exactly when \(p>5\).</p>
        `)
      ]
    ),

    "1d": createConfig(
      "1d",
      raw`Use the conjugate-root theorem, obtain the third root from Vieta's formula, then expand the three factors and compare coefficients.`,
      raw`
        <div class="question-math">
          <p class="step-text">One solution of the equation</p>
          \[
          z^3-2z^2+Bz-30=0
          \]
          <p class="step-text">is \(z=-2-i\). If \(B\) is a real number, find the value of \(B\) and the other two solutions of the equation.</p>
        </div>
      `,
      answerBox(raw`
        <div class="math-block">
          \[
          \boxed{B=-19,\qquad z=-2+i,\qquad z=6}
          \]
        </div>
      `),
      [
        guidedStep("Apply the conjugate-root theorem", raw`A polynomial with real coefficients has non-real roots in conjugate pairs.`, raw`
          <p class="step-text">All coefficients are real because \(B\) is real. Since \(-2-i\) is a root, its conjugate must also be a root:</p>
          <div class="math-block">
            \[
            z=-2+i.
            \]
          </div>
        `),
        guidedStep("Find the third root with Vieta's formula", raw`For a monic cubic, the sum of the roots is the negative of the \(z^2\)-coefficient.`, raw`
          <p class="step-text">Let the third root be \(r\). Since the \(z^2\)-coefficient is \(-2\),</p>
          <div class="math-block">
            \[
            (-2-i)+(-2+i)+r=2
            \]
            \[
            -4+r=2
            \]
            \[
            r=6.
            \]
          </div>
        `),
        guidedStep("Combine the conjugate factors", raw`Multiplying the conjugate linear factors first produces a quadratic with real coefficients.`, raw`
          <div class="math-block">
            \[
            (z-(-2-i))(z-(-2+i))
            =(z+2+i)(z+2-i)
            \]
            \[
            =((z+2)+i)((z+2)-i)
            =(z+2)^2-i^2
            \]
            \[
            =z^2+4z+5.
            \]
          </div>
        `),
        guidedStep("Expand and compare coefficients", raw`Include the factor from the third root, expand every product, and match the \(z\)-coefficient.`, raw`
          <div class="math-block">
            \[
            (z^2+4z+5)(z-6)
            \]
            \[
            =z^3+4z^2+5z-6z^2-24z-30
            \]
            \[
            =z^3-2z^2-19z-30.
            \]
          </div>
          <p class="step-text">Comparing this with \(z^3-2z^2+Bz-30\) gives \(B=-19\).</p>
        `)
      ]
    ),

    "1e": createConfig(
      "1e",
      raw`Translate each modulus into a coordinate distance, square the equation, then complete both squares.`,
      raw`
        <div class="question-math">
          <p class="step-text">Find the Cartesian equation of the locus described by</p>
          \[
          |z+2-7i|=2|z-10+2i|.
          \]
          <p class="step-text">Write your answer in the form \((x+A)^2+(y+B)^2=K\).</p>
        </div>
      `,
      answerBox(raw`
        <div class="math-block compact-answer-math">
          \[
          \boxed{(x-14)^2+(y+5)^2=100}
          \]
        </div>
        <p class="step-text">This is a circle with centre \((14,-5)\) and radius \(10\).</p>
      `),
      [
        guidedStep("Write the moduli as coordinate distances", raw`Let \(z=x+yi\), then identify the real and imaginary components inside each modulus.`, raw`
          <div class="math-block">
            \[
            z+2-7i=(x+2)+(y-7)i,
            \]
            \[
            z-10+2i=(x-10)+(y+2)i.
            \]
          </div>
          <p class="step-text">Using \(|a+bi|=\sqrt{a^2+b^2}\), the locus equation becomes</p>
          <div class="math-block">
            \[
            \sqrt{(x+2)^2+(y-7)^2}
            =2\sqrt{(x-10)^2+(y+2)^2}.
            \]
          </div>
        `),
        guidedStep("Square both sides", raw`Both sides are non-negative distances, so squaring preserves the equality.`, raw`
          <div class="math-block">
            \[
            (x+2)^2+(y-7)^2
            =4\bigl((x-10)^2+(y+2)^2\bigr).
            \]
          </div>
        `),
        guidedStep("Expand every square", raw`Keep every constant and linear term visible before collecting.`, raw`
          <div class="math-block">
            \[
            x^2+4x+4+y^2-14y+49
            \]
            \[
            =4(x^2-20x+100)+4(y^2+4y+4)
            \]
            \[
            =4x^2-80x+400+4y^2+16y+16.
            \]
          </div>
        `),
        guidedStep("Collect terms and divide by 3", raw`Move the left side to the right, then remove the common factor \(3\).`, raw`
          <div class="math-block">
            \[
            0=3x^2-84x+3y^2+30y+363
            \]
            \[
            0=x^2-28x+y^2+10y+121
            \]
            \[
            x^2-28x+y^2+10y=-121.
            \]
          </div>
        `),
        guidedStep("Complete both squares and interpret", raw`Add the square of half each linear coefficient, then read the centre and radius.`, raw`
          <div class="math-block">
            \[
            \begin{aligned}
            &(x^2-28x+14^2)\\
            &\quad +(y^2+10y+5^2)\\
            &=-121+14^2+5^2
            \end{aligned}
            \]
            \[
            (x-14)^2+(y+5)^2=100.
            \]
          </div>
          <p class="step-text">The standard circle form \((x-h)^2+(y-k)^2=r^2\) gives centre \((14,-5)\) and radius \(r=10\).</p>
        `)
      ]
    ),

    "2a": createConfig(
      "2a",
      raw`Use the Remainder Theorem explicitly: division by \(x-3\) leaves the value \(f(3)\).`,
      raw`
        <div class="question-math">
          <p class="step-text">Dividing \(x^3-2x^2+5x+d\) by \((x-3)\) gives a remainder of \(13\). Find the value of \(d\).</p>
        </div>
      `,
      answerBox(raw`
        <div class="math-block">
          \[
          \boxed{d=-11}
          \]
        </div>
      `),
      [
        guidedStep("Apply the Remainder Theorem", raw`For a divisor \(x-a\), the remainder is \(f(a)\).`, raw`
          <p class="step-text">Let</p>
          <div class="math-block">
            \[
            f(x)=x^3-2x^2+5x+d.
            \]
          </div>
          <p class="step-text">Because the divisor is \(x-3\) and the remainder is \(13\),</p>
          <div class="math-block">
            \[
            f(3)=13.
            \]
          </div>
        `),
        guidedStep("Substitute x = 3", raw`Replace every \(x\) with \(3\), while leaving \(d\) unknown.`, raw`
          <div class="math-block">
            \[
            3^3-2(3)^2+5(3)+d=13
            \]
            \[
            27-18+15+d=13
            \]
            \[
            24+d=13.
            \]
          </div>
        `),
        guidedStep("Solve and check the remainder", raw`Isolate \(d\), then substitute it back into \(f(3)\).`, raw`
          <div class="math-block">
            \[
            d=13-24=-11.
            \]
            \[
            f(3)=27-18+15-11=13.
            \]
          </div>
          <p class="step-text">The stated remainder is recovered.</p>
        `)
      ]
    ),

    "2b": createConfig(
      "2b",
      raw`Establish the real domain, multiply the radicals, and use \(\sqrt{k^2}=|k|\) correctly.`,
      raw`
        <div class="question-math">
          <p class="step-text">Simplify, as far as possible, the expression</p>
          \[
          \sqrt{2k}\left(\sqrt{18k}-\sqrt{8k}\right).
          \]
        </div>
      `,
      answerBox(raw`
        <div class="math-block">
          \[
          \boxed{2k}
          \]
        </div>
      `),
      [
        guidedStep("State the real domain", raw`Every radicand must be non-negative for this to be a real surd expression.`, raw`
          <div class="math-block">
            \[
            2k\ge0,\quad18k\ge0,\quad8k\ge0
            \quad\Longrightarrow\quad k\ge0.
            \]
          </div>
        `),
        guidedStep("Distribute the first radical", raw`For non-negative radicands, \(\sqrt a\sqrt b=\sqrt{ab}\).`, raw`
          <div class="math-block">
            \[
            \sqrt{2k}\sqrt{18k}-\sqrt{2k}\sqrt{8k}
            \]
            \[
            =\sqrt{36k^2}-\sqrt{16k^2}.
            \]
          </div>
        `),
        guidedStep("Simplify the squared parameter", raw`In general \(\sqrt{k^2}=|k|\); the domain \(k\ge0\) lets us replace \(|k|\) by \(k\).`, raw`
          <div class="math-block">
            \[
            \sqrt{36k^2}-\sqrt{16k^2}
            =6|k|-4|k|
            \]
            \[
            =6k-4k=2k.
            \]
          </div>
        `)
      ]
    ),

    "2c": createConfig(
      "2c",
      raw`Find \(w\) by exact complex division, then use its quadrant to choose the principal argument.`,
      raw`
        <div class="question-math">
          <p class="step-text">\(z\) and \(w\) are complex numbers such that \(z=-2+3i\) and \(zw=15-3i\). Find an exact value of \(\arg(w)\).</p>
        </div>
      `,
      answerBox(raw`
        <div class="math-block">
          \[
          \boxed{\arg(w)=-\frac{3\pi}{4}}
          \]
        </div>
      `),
      [
        guidedStep("Isolate w", raw`Divide the product \(zw\) by the known nonzero value of \(z\).`, raw`
          <div class="math-block">
            \[
            w=\frac{15-3i}{-2+3i}.
            \]
          </div>
        `),
        guidedStep("Make the denominator real", raw`Multiply numerator and denominator by the conjugate \(-2-3i\).`, raw`
          <div class="math-block">
            \[
            w=\frac{(15-3i)(-2-3i)}{(-2+3i)(-2-3i)}
            \]
            \[
            =\frac{-30-45i+6i+9i^2}{(-2)^2+3^2}
            \]
            \[
            =\frac{-39-39i}{13}=-3-3i.
            \]
          </div>
        `),
        guidedStep("Identify the quadrant and reference angle", raw`Both components are negative, so \(w\) lies in the third quadrant.`, raw`
          <p class="step-text">The real and imaginary parts have equal magnitude, so the reference angle is</p>
          <div class="math-block">
            \[
            \tan^{-1}\left(\left|\frac{-3}{-3}\right|\right)
            =\tan^{-1}(1)=\frac{\pi}{4}.
            \]
          </div>
          <p class="step-text">A positive third-quadrant angle is \(\frac{5\pi}{4}\).</p>
        `),
        guidedStep("Give the principal argument", raw`The principal argument is chosen in \((-\pi,\pi]\), so use the coterminal negative angle.`, raw`
          <div class="math-block">
            \[
            \frac{5\pi}{4}-2\pi=-\frac{3\pi}{4}.
            \]
          </div>
          <p class="step-text">Thus \(\frac{5\pi}{4}\) is equivalent, but the requested principal argument is \(-\frac{3\pi}{4}\).</p>
        `)
      ]
    ),

    "2d": createConfig(
      "2d",
      raw`Convert the right-hand side to polar form, apply the general fourth-root rule, and list four distinct arguments.`,
      raw`
        <div class="question-math">
          <p class="step-text">Solve the equation</p>
          \[
          z^4=\frac{m}{\sqrt2}+\frac{m}{\sqrt2}i,
          \]
          <p class="step-text">where \(m\) is real and positive. Write your solutions in polar form in terms of \(m\).</p>
        </div>
      `,
      answerBox(raw`
        <div class="math-block polar-root-list">
          <div class="polar-root-grid" role="list" aria-label="The four fourth roots">
            <div class="polar-root-item" role="listitem">\(m^{1/4}\operatorname{cis}\left(\frac{\pi}{16}\right)\)</div>
            <div class="polar-root-item" role="listitem">\(m^{1/4}\operatorname{cis}\left(\frac{9\pi}{16}\right)\)</div>
            <div class="polar-root-item" role="listitem">\(m^{1/4}\operatorname{cis}\left(-\frac{15\pi}{16}\right)\)</div>
            <div class="polar-root-item" role="listitem">\(m^{1/4}\operatorname{cis}\left(-\frac{7\pi}{16}\right)\)</div>
          </div>
        </div>
      `),
      [
        guidedStep("Write the right-hand side in polar form", raw`Use its equal positive components to find the modulus and argument.`, raw`
          <div class="math-block">
            \[
            r=\sqrt{\left(\frac{m}{\sqrt2}\right)^2+\left(\frac{m}{\sqrt2}\right)^2}
            =\sqrt{\frac{m^2}{2}+\frac{m^2}{2}}=m,
            \]
          </div>
          <p class="step-text">Because \(m>0\), the point lies in the first quadrant with equal real and imaginary components, so its argument is \(\frac{\pi}{4}\). Therefore</p>
          <div class="math-block">
            \[
            \frac{m}{\sqrt2}+\frac{m}{\sqrt2}i
            =m\operatorname{cis}\left(\frac{\pi}{4}\right).
            \]
          </div>
        `),
        guidedStep("Apply the fourth-root rule", raw`An \(n\)th-root problem divides every coterminal argument by \(n\).`, raw`
          <p class="step-text">The general fourth-root rule gives</p>
          <div class="math-block">
            \[
            z=m^{1/4}\operatorname{cis}\left(
            \frac{\frac{\pi}{4}+2k\pi}{4}
            \right)
            \]
            \[
            z=m^{1/4}\operatorname{cis}\left(
            \frac{\pi}{16}+\frac{k\pi}{2}
            \right),
            \qquad k=0,1,2,3.
            \]
          </div>
          <p class="step-text">Four consecutive integer values of \(k\) produce all four distinct fourth roots.</p>
        `),
        guidedStep("Generate the four arguments", raw`Substitute \(k=0,1,2,3\), then normalise angles larger than \(\pi\) by subtracting \(2\pi\).`, raw`
          <div class="math-block">
            \[
            \begin{array}{c|c|c}
            k & \frac{\pi}{16}+\frac{k\pi}{2} & \text{chosen equivalent angle}\\
            \hline
            0 & \frac{\pi}{16} & \frac{\pi}{16}\\[2pt]
            1 & \frac{9\pi}{16} & \frac{9\pi}{16}\\[2pt]
            2 & \frac{17\pi}{16} & -\frac{15\pi}{16}\\[2pt]
            3 & \frac{25\pi}{16} & -\frac{7\pi}{16}
            \end{array}
            \]
          </div>
        `),
        guidedStep("List the distinct roots", raw`Keep the common modulus \(m^{1/4}\) and attach each of the four arguments.`, raw`
          <div class="math-block polar-root-list">
            <div class="polar-root-grid" role="list" aria-label="The four labelled fourth roots">
              <div class="polar-root-item" role="listitem">\(z_1=m^{1/4}\operatorname{cis}\left(\frac{\pi}{16}\right)\)</div>
              <div class="polar-root-item" role="listitem">\(z_2=m^{1/4}\operatorname{cis}\left(\frac{9\pi}{16}\right)\)</div>
              <div class="polar-root-item" role="listitem">\(z_3=m^{1/4}\operatorname{cis}\left(-\frac{15\pi}{16}\right)\)</div>
              <div class="polar-root-item" role="listitem">\(z_4=m^{1/4}\operatorname{cis}\left(-\frac{7\pi}{16}\right)\)</div>
            </div>
          </div>
          <p class="step-text">Their arguments differ by \(\frac{\pi}{2}\), so the four roots are distinct and evenly spaced.</p>
        `)
      ]
    ),

    "2e": createConfig(
      "2e",
      raw`Rationalise with the denominator's conjugate, separate real and imaginary parts, then force the imaginary numerator to be zero.`,
      raw`
        <div class="question-math">
          <p class="step-text">Find all possible real values of \(k\) that make</p>
          \[
          u=\frac{k+4i}{1+ki}
          \]
          <p class="step-text">a purely real number.</p>
        </div>
      `,
      answerBox(raw`
        <div class="math-block">
          \[
          \boxed{k=\pm2}
          \]
        </div>
      `),
      [
        guidedStep("Multiply by the conjugate", raw`The conjugate \(1-ki\) turns the denominator into a positive real number.`, raw`
          <div class="math-block">
            \[
            u=\frac{k+4i}{1+ki}\cdot\frac{1-ki}{1-ki}
            =\frac{(k+4i)(1-ki)}{(1+ki)(1-ki)}.
            \]
            \[
            (1+ki)(1-ki)=1-(ki)^2=1+k^2.
            \]
          </div>
          <p class="step-text">For real \(k\), \(1+k^2>0\), so the original denominator is never zero.</p>
        `),
        guidedStep("Expand the numerator fully", raw`Multiply every term and use \(i^2=-1\).`, raw`
          <div class="math-block">
            \[
            (k+4i)(1-ki)
            =k-k^2i+4i-4ki^2
            \]
            \[
            =k-k^2i+4i+4k.
            \]
          </div>
        `),
        guidedStep("Group real and imaginary parts", raw`Collect the terms without \(i\), then collect the coefficient of \(i\).`, raw`
          <div class="math-block">
            \[
            u=\frac{5k+(4-k^2)i}{1+k^2}
            \]
            \[
            =\frac{5k}{1+k^2}
            +\frac{4-k^2}{1+k^2}i.
            \]
          </div>
        `),
        guidedStep("Set the imaginary part to zero", raw`A complex number is purely real exactly when its imaginary coefficient is zero.`, raw`
          <p class="step-text">Because \(1+k^2>0\), only the imaginary numerator needs to vanish:</p>
          <div class="math-block">
            \[
            4-k^2=0
            \]
            \[
            k^2=4
            \]
            \[
            k=\pm2.
            \]
          </div>
          <p class="step-text">Indeed, \(k=2\) gives \(u=2\), while \(k=-2\) gives \(u=-2\); both are purely real.</p>
        `)
      ]
    ),

    "3a": createConfig(
      "3a",
      raw`For division in polar form, divide the moduli and subtract the arguments.`,
      raw`
        <div class="question-math">
          <p class="step-text">If</p>
          \[
          u=p^3\operatorname{cis}\left(\frac{\pi}{3}\right)
          \quad\text{and}\quad
          v=p\operatorname{cis}\left(\frac{\pi}{8}\right),
          \]
          <p class="step-text">write \(\frac{u}{v}\) in polar form.</p>
        </div>
      `,
      answerBox(raw`
        <div class="math-block">
          \[
          \boxed{\frac{u}{v}=p^2\operatorname{cis}\left(\frac{5\pi}{24}\right)}
          \]
        </div>
      `),
      [
        guidedStep("Use the polar quotient rule", raw`A quotient divides the moduli and subtracts the denominator's argument from the numerator's argument.`, raw`
          <p class="step-text">Because the expressions are given as polar forms, \(p\) is the intended positive modulus; in particular, \(p\ne0\) so division by \(v\) is defined.</p>
          <div class="math-block">
            \[
            \frac{r_1\operatorname{cis}(\theta_1)}{r_2\operatorname{cis}(\theta_2)}
            =\frac{r_1}{r_2}\operatorname{cis}(\theta_1-\theta_2).
            \]
          </div>
        `),
        guidedStep("Divide the moduli", raw`Use the index law \(\frac{p^3}{p}=p^{3-1}\).`, raw`
          <div class="math-block">
            \[
            \frac{p^3}{p}=p^2.
            \]
          </div>
        `),
        guidedStep("Subtract the arguments", raw`Use a common denominator of \(24\).`, raw`
          <div class="math-block">
            \[
            \frac{u}{v}
            =p^2\operatorname{cis}\left(\frac{\pi}{3}-\frac{\pi}{8}\right)
            \]
            \[
            =p^2\operatorname{cis}\left(\frac{8\pi}{24}-\frac{3\pi}{24}\right)
            =p^2\operatorname{cis}\left(\frac{5\pi}{24}\right).
            \]
          </div>
        `)
      ]
    ),

    "3b": createConfig(
      "3b",
      raw`Complete the square, then express the square root of \(-5\) using \(i\).`,
      raw`
        <div class="question-math">
          <p class="step-text">Solve the equation</p>
          \[
          x^2-6x+14=0.
          \]
          <p class="step-text">Give your solution in the form \(a\pm\sqrt{b}\,i\), where \(a\) and \(b\) are rational numbers.</p>
        </div>
      `,
      answerBox(raw`
        <div class="math-block">
          \[
          \boxed{x=3\pm\sqrt5\,i}
          \]
        </div>
      `),
      [
        guidedStep("Move the constant term", raw`Keep the \(x^2\) and \(x\) terms together before completing the square.`, raw`
          <div class="math-block">
            \[
            x^2-6x+14=0
            \]
            \[
            x^2-6x=-14.
            \]
          </div>
        `),
        guidedStep("Complete the square", raw`Half of \(-6\) is \(-3\), so add \((-3)^2=9\) to both sides.`, raw`
          <div class="math-block">
            \[
            x^2-6x+9=-14+9
            \]
            \[
            (x-3)^2=-5.
            \]
          </div>
        `),
        guidedStep("Take both complex square roots", raw`Use \(\sqrt{-5}=\sqrt5\,i\) and include both signs.`, raw`
          <div class="math-block">
            \[
            x-3=\pm\sqrt{-5}=\pm\sqrt5\,i
            \]
            \[
            x=3\pm\sqrt5\,i.
            \]
          </div>
          <p class="step-text">Here \(a=3\) and \(b=5\), both rational, so the answer has the requested form.</p>
        `)
      ]
    ),

    "3c": createConfig(
      "3c",
      raw`Use the divide-multiply-subtract-bring-down cycle, keeping like powers aligned throughout the polynomial long division.`,
      raw`
        <div class="question-math">
          \[
          \frac{3x^3+8x^2-2x+11}{x+2}
          =3x^2+Ax+B+\frac{C}{x+2},
          \]
          <p class="step-text">where \(A\), \(B\), and \(C\) are integers. Find the values of \(A\), \(B\), and \(C\).</p>
        </div>
      `,
      answerBox(raw`
        <div class="math-block">
          \[
          \boxed{A=2,\qquad B=-6,\qquad C=23}
          \]
        </div>
      `),
      [
        guidedStep("Divide the leading terms", raw`Start the quotient with \(3x^3\div x\), then multiply back and subtract.`, raw`
          <div class="math-block">
            \[
            3x^3\div x=3x^2.
            \]
            \[
            3x^2(x+2)=3x^3+6x^2.
            \]
            \[
            (3x^3+8x^2)-(3x^3+6x^2)=2x^2.
            \]
          </div>
          <p class="step-text">Bring down the remaining terms, giving \(2x^2-2x+11\).</p>
        `),
        guidedStep("Repeat with the x-squared term", raw`Divide the new leading term by \(x\), multiply by the whole divisor, and subtract again.`, raw`
          <div class="math-block">
            \[
            2x^2\div x=2x.
            \]
            \[
            2x(x+2)=2x^2+4x.
            \]
            \[
            (2x^2-2x+11)-(2x^2+4x)=-6x+11.
            \]
          </div>
        `),
        guidedStep("Find the constant quotient term", raw`Run the same cycle once more using the new leading term \(-6x\).`, raw`
          <div class="math-block">
            \[
            -6x\div x=-6.
            \]
            \[
            -6(x+2)=-6x-12.
            \]
            \[
            (-6x+11)-(-6x-12)=23.
            \]
          </div>
          <p class="step-text">The remainder \(23\) has lower degree than the divisor \(x+2\), so the division is complete.</p>
        `),
        guidedStep("Read the completed long division", raw`The aligned layout records each divide-multiply-subtract-bring-down cycle and the final remainder.`, raw`
          <figure class="long-division-region">
            <figcaption class="step-text">Polynomial long division of \(3x^3+8x^2-2x+11\) by \(x+2\).</figcaption>
            <p id="long-division-scroll-hint" class="long-division-scroll-hint">On a narrow screen, scroll sideways to see every column.</p>
            <div class="long-division-scroll" role="region" aria-label="Scrollable polynomial long division" aria-describedby="long-division-scroll-hint" tabindex="0">
              <table class="polynomial-long-division-table">
                <caption class="visually-hidden">The quotient is 3 x squared plus 2 x minus 6. Multiplication and subtraction rows leave the final remainder 23.</caption>
                <tbody>
                  <tr class="long-division-quotient">
                    <td></td>
                    <td>\(3x^2\)</td>
                    <td>\(+2x\)</td>
                    <td>\(-6\)</td>
                    <td></td>
                  </tr>
                  <tr class="long-division-dividend">
                    <th scope="row">\(x+2\)</th>
                    <td class="long-division-bracket">\(3x^3\)</td>
                    <td>\(+8x^2\)</td>
                    <td>\(-2x\)</td>
                    <td>\(+11\)</td>
                  </tr>
                  <tr class="long-division-product">
                    <td aria-label="Subtract">\(-\)</td>
                    <td class="long-division-bracket long-division-rule">\(3x^3\)</td>
                    <td class="long-division-rule">\(+6x^2\)</td>
                    <td class="long-division-rule"></td>
                    <td class="long-division-rule"></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td class="long-division-bracket"></td>
                    <td>\(2x^2\)</td>
                    <td>\(-2x\)</td>
                    <td>\(+11\)</td>
                  </tr>
                  <tr class="long-division-product">
                    <td aria-label="Subtract">\(-\)</td>
                    <td class="long-division-bracket long-division-rule"></td>
                    <td class="long-division-rule">\(2x^2\)</td>
                    <td class="long-division-rule">\(+4x\)</td>
                    <td class="long-division-rule"></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td class="long-division-bracket"></td>
                    <td></td>
                    <td>\(-6x\)</td>
                    <td>\(+11\)</td>
                  </tr>
                  <tr class="long-division-product">
                    <td aria-label="Subtract">\(-\)</td>
                    <td class="long-division-bracket long-division-rule"></td>
                    <td class="long-division-rule"></td>
                    <td class="long-division-rule">\(-6x\)</td>
                    <td class="long-division-rule">\(-12\)</td>
                  </tr>
                  <tr class="long-division-remainder">
                    <td></td>
                    <td class="long-division-bracket"></td>
                    <td></td>
                    <td></td>
                    <td>\(23\)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </figure>
          <div class="math-block">
            \[
            \frac{3x^3+8x^2-2x+11}{x+2}
            =3x^2+2x-6+\frac{23}{x+2}.
            \]
          </div>
          <p class="step-text">Comparing term by term with \(3x^2+Ax+B+\frac{C}{x+2}\) gives \(A=2\), \(B=-6\), and \(C=23\).</p>
        `)
      ]
    ),

    "3d": createConfig(
      "3d",
      raw`Respect the denominator restriction, isolate \(x\), rationalise the surd denominator, and substitute back.`,
      raw`
        <div class="question-math">
          <p class="step-text">Solve the equation</p>
          \[
          \frac{8+x}{x}=\sqrt3,
          \]
          <p class="step-text">writing your solution in the form \(x=a+b\sqrt3\).</p>
        </div>
      `,
      answerBox(raw`
        <div class="math-block">
          \[
          \boxed{x=4+4\sqrt3}
          \]
        </div>
      `),
      [
        guidedStep("Record the restriction and clear the fraction", raw`The original denominator requires \(x\ne0\), so multiplying by \(x\) is valid only under that restriction.`, raw`
          <div class="math-block">
            \[
            x\ne0,
            \]
            \[
            \frac{8+x}{x}=\sqrt3
            \quad\Longrightarrow\quad
            8+x=x\sqrt3.
            \]
          </div>
        `),
        guidedStep("Collect the x-terms", raw`Move the plain \(x\) term and factor out \(x\).`, raw`
          <div class="math-block">
            \[
            8=x\sqrt3-x
            \]
            \[
            8=x(\sqrt3-1)
            \]
            \[
            x=\frac{8}{\sqrt3-1}.
            \]
          </div>
        `),
        guidedStep("Rationalise the denominator", raw`Multiply by the conjugate \(\sqrt3+1\) and use a difference of two squares.`, raw`
          <div class="math-block">
            \[
            x=\frac{8}{\sqrt3-1}\cdot\frac{\sqrt3+1}{\sqrt3+1}
            \]
            \[
            =\frac{8(\sqrt3+1)}{(\sqrt3-1)(\sqrt3+1)}
            \]
            \[
            =\frac{8(\sqrt3+1)}{3-1}
            =4(\sqrt3+1)
            =4+4\sqrt3.
            \]
          </div>
        `),
        guidedStep("Substitute back", raw`A brief check confirms both the equation and the nonzero restriction.`, raw`
          <p class="step-text">The candidate \(4+4\sqrt3\) is nonzero. From the rearranged form,</p>
          <div class="math-block">
            \[
            x(\sqrt3-1)
            =4(1+\sqrt3)(\sqrt3-1)
            =4(3-1)=8.
            \]
          </div>
          <p class="step-text">Therefore \(8+x=x\sqrt3\), so dividing by the nonzero \(x\) recovers the original equation.</p>
        `)
      ]
    ),

    "3e": createConfig(
      "3e",
      raw`Substitute into the numerator and denominator separately, divide by the resulting fraction, then expand the conjugate squares.`,
      raw`
        <div class="question-math">
          <p class="step-text">\(z\) is a complex number such that</p>
          \[
          z=\frac{a+bi}{a-bi},
          \]
          <p class="step-text">where \(a\) and \(b\) are real numbers. Prove that</p>
          \[
          \frac{z^2+1}{2z}=\frac{a^2-b^2}{a^2+b^2}.
          \]
        </div>
      `,
      answerBox(raw`
        <div class="math-block">
          \[
          \boxed{\frac{z^2+1}{2z}=\frac{a^2-b^2}{a^2+b^2}}
          \]
        </div>
      `),
      [
        guidedStep("State the nonzero-denominator condition", raw`The given fraction and the later expression both need to be defined.`, raw`
          <p class="step-text">We require \(a-bi\ne0\). Since \(a\) and \(b\) are real, this is equivalent to saying they are not both zero:</p>
          <div class="math-block">
            \[
            a^2+b^2>0.
            \]
          </div>
          <p class="step-text">Then \(a+bi\ne0\) as well, so \(z\ne0\) and the denominator \(2z\) is valid.</p>
        `),
        guidedStep("Substitute into z squared plus 1", raw`Square the whole fraction first; do not square only its numerator.`, raw`
          <div class="math-block">
            \[
            z^2+1
            =\left(\frac{a+bi}{a-bi}\right)^2+1
            \]
            \[
            =\frac{(a+bi)^2}{(a-bi)^2}+1.
            \]
          </div>
        `),
        guidedStep("Form a common denominator", raw`Rewrite \(1\) using the same denominator before combining the terms.`, raw`
          <div class="math-block">
            \[
            1=\frac{(a-bi)^2}{(a-bi)^2},
            \]
            \[
            z^2+1
            =\frac{(a+bi)^2+(a-bi)^2}{(a-bi)^2}.
            \]
          </div>
        `),
        guidedStep("Substitute into 2z", raw`Keep this denominator separate so the final division by a fraction is explicit.`, raw`
          <div class="math-block">
            \[
            2z=2\left(\frac{a+bi}{a-bi}\right)
            =\frac{2(a+bi)}{a-bi}.
            \]
          </div>
        `),
        guidedStep("Divide by the fraction and cancel", raw`Multiply by the reciprocal of \(2z\), then cancel one factor of \(a-bi\).`, raw`
          <div class="math-block">
            \[
            \frac{z^2+1}{2z}
            =\frac{(a+bi)^2+(a-bi)^2}{(a-bi)^2}
            \div\frac{2(a+bi)}{a-bi}
            \]
            \[
            =\frac{(a+bi)^2+(a-bi)^2}{(a-bi)^2}
            \times\frac{a-bi}{2(a+bi)}
            \]
            \[
            =\frac{(a+bi)^2+(a-bi)^2}
            {2(a-bi)(a+bi)}.
            \]
          </div>
          <p class="step-text">The earlier nonzero condition justifies each cancellation.</p>
        `),
        guidedStep("Expand the conjugate expressions", raw`The imaginary middle terms cancel in the numerator, while the denominator is a product of conjugates.`, raw`
          <div class="math-block proof-math-block">
            \[
            \begin{aligned}
            &(a+bi)^2+(a-bi)^2\\
            &=(a^2+2abi-b^2)\\
            &\quad +(a^2-2abi-b^2)\\
            &=2a^2-2b^2\\
            &=2(a^2-b^2)
            \end{aligned}
            \]
            \[
            2(a-bi)(a+bi)=2(a^2+b^2).
            \]
            \[
            \begin{aligned}
            \therefore\quad
            \frac{z^2+1}{2z}
            &=\frac{2(a^2-b^2)}{2(a^2+b^2)}\\
            &=\frac{a^2-b^2}{a^2+b^2}.
            \end{aligned}
            \]
          </div>
          <p class="step-text">This is the required result.</p>
        `)
      ]
    )
  };
}());
