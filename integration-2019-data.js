(function () {
  const raw = String.raw;
  const paperHref = "level-3-integration-2019.html";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const questionImageDimensions = {
    "1a": [1563, 438], "1b": [2438, 594], "1c": [2375, 438], "1d": [2782, 1875], "1e": [2313, 844],
    "2a": [1625, 563], "2b": [2782, 2250], "2c": [2938, 388], "2d": [2188, 1344], "2e": [2844, 1969],
    "3a": [1750, 657], "3b": [2688, 438], "3c": [2438, 388], "3d": [2782, 538], "3e": [2907, 2344]
  };
  const metadata = {
    topic: "Integration",
    year: 2019,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };
  const tags = [
    "Integration",
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
    return "int-" + id + "2019.html";
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
      browserTitle: "2019 Integration Paper - " + questionLabel(id),
      eyebrow: "Level 3 Integration Walkthrough",
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
        <img class="question-screenshot" src="assets/integration-2019/${id}-question.png" width="${imageDimensions[0]}" height="${imageDimensions[1]}" alt="${questionImageAlt(id, focus)}" loading="eager" decoding="async" fetchpriority="high" />
      `,
      answerHtml: finalAnswer,
      guidedSteps: guidedSteps
    }, details || {});
  }

  window.Integration2019Walkthroughs = {
    "1a": createConfig("1a", raw`Rewrite the radical denominator as a power, then integrate the constant and power terms separately.`, raw`
      <div class="math-block">
        \[
        \boxed{2x+4\sqrt{x}+C}
        \]
      </div>
    `, [
      guidedStep("Rewrite the integrand", raw`Turn the square-root denominator into a negative half-power.`, raw`
        <div class="math-block">
          \[
          \int\left(2+\frac{2}{\sqrt{x}}\right)\,dx
          =
          \int\left(2+2x^{-\frac12}\right)\,dx
          \]
        </div>
      `),
      guidedStep("Integrate each term", raw`Use \(\int x^n\,dx=\frac{x^{n+1}}{n+1}\) when \(n\ne-1\).`, raw`
        <div class="math-block">
          \[
          \int 2\,dx=2x
          \]
          \[
          \int 2x^{-\frac12}\,dx
          =
          2\cdot\frac{x^{\frac12}}{\frac12}
          =
          4x^{\frac12}
          \]
        </div>
      `),
      guidedStep("Write the antiderivative", raw`Convert \(x^{1/2}\) back to a square root and include \(C\).`, raw`
        <div class="math-block">
          \[
          \int\left(2+\frac{2}{\sqrt{x}}\right)\,dx
          =
          2x+4x^{\frac12}+C
          =
          2x+4\sqrt{x}+C
          \]
        </div>
      `)
    ]),

    "1b": createConfig("1b", raw`The \(x\)-values are evenly spaced, so use the Trapezium Rule with width \(h=0.5\).`, raw`
      <div class="math-block">
        \[
        \boxed{6.8}
        \]
      </div>
    `, [
      guidedStep("Identify the width", raw`The spacing from \(2\) to \(2.5\), \(2.5\) to \(3\), and so on is \(0.5\).`, raw`
        <div class="math-block">
          \[
          h=0.5
          \]
        </div>
      `),
      guidedStep("Set up the Trapezium Rule", raw`Use the first and last ordinates once, and double all interior ordinates.`, raw`
        <div class="math-block">
          \[
          \int_2^5 f(x)\,dx
          \approx
          \frac{h}{2}
          \left[
          y_0+y_6+2(y_1+y_2+y_3+y_4+y_5)
          \right]
          \]
          \[
          =
          \frac{0.5}{2}
          \left[
          0.6+2.6+2(1.1+1.7+2.6+3.2+3.4)
          \right]
          \]
        </div>
      `),
      guidedStep("Evaluate the estimate", raw`Add the interior values before multiplying by the width factor.`, raw`
        <div class="math-block">
          \[
          1.1+1.7+2.6+3.2+3.4=12
          \]
          \[
          \frac{0.5}{2}\left[0.6+2.6+2(12)\right]
          =
          0.25(3.2+24)
          \]
          \[
          =
          0.25(27.2)
          =
          6.8
          \]
        </div>
      `)
    ]),

    "1c": createConfig("1c", raw`Use the product-to-sum identity so the product of cosines becomes two integrable cosine terms.`, raw`
      <div class="math-block">
        \[
        \boxed{\frac{5}{24}}
        \]
      </div>
    `, [
      guidedStep("Rewrite the product", raw`Apply \(\cos A\cos B=\frac12(\cos(A+B)+\cos(A-B))\).`, raw`
        <div class="math-block">
          \[
          \cos(4x)\cos(2x)
          =
          \frac12\left(\cos(4x+2x)+\cos(4x-2x)\right)
          \]
          \[
          =
          \frac12\cos(6x)+\frac12\cos(2x)
          \]
        </div>
      `),
      guidedStep("Integrate", raw`Each cosine needs a reverse-chain-rule divisor from the inside derivative.`, raw`
        <div class="math-block">
          \[
          \int_0^{\frac{\pi}{12}}\cos(4x)\cos(2x)\,dx
          =
          \int_0^{\frac{\pi}{12}}
          \left(
          \frac12\cos(6x)+\frac12\cos(2x)
          \right)\,dx
          \]
          \[
          =
          \left[
          \frac{\sin(6x)}{12}+\frac{\sin(2x)}{4}
          \right]_0^{\frac{\pi}{12}}
          \]
        </div>
      `),
      guidedStep("Evaluate the limits", raw`Substitute \(x=\frac{\pi}{12}\), then subtract the value at \(x=0\).`, raw`
        <div class="math-block">
          \[
          \frac{\sin(6\cdot\frac{\pi}{12})}{12}
          +
          \frac{\sin(2\cdot\frac{\pi}{12})}{4}
          =
          \frac{\sin(\frac{\pi}{2})}{12}
          +
          \frac{\sin(\frac{\pi}{6})}{4}
          \]
          \[
          =
          \frac{1}{12}+\frac{\frac12}{4}
          =
          \frac{1}{12}+\frac{1}{8}
          \]
          \[
          \frac{\sin 0}{12}+\frac{\sin 0}{4}=0
          \]
          \[
          \frac{1}{12}+\frac{1}{8}
          =
          \frac{2}{24}+\frac{3}{24}
          =
          \frac{5}{24}
          \]
        </div>
      `)
    ]),

    "1d": createConfig("1d", raw`Show the two areas are equal by evaluating \(\int_0^5 y\,dx\) and \(\int_5^{16}y\,dx\) with the same antiderivative.`, raw`
      <div class="math-block">
        \[
        \boxed{A=B=12}
        \]
      </div>
    `, [
      guidedStep("Write the function for integration", raw`Convert the square-root denominator to a negative half-power.`, raw`
        <div class="math-block">
          \[
          y=\frac{6}{\sqrt{3x+1}}
          =
          6(3x+1)^{-\frac12}
          \]
        </div>
      `),
      guidedStep("Find an antiderivative", raw`Increase the power to \(\frac12\), then divide by the inside derivative \(3\).`, raw`
        <div class="math-block">
          \[
          \int 6(3x+1)^{-\frac12}\,dx
          =
          \frac{6(3x+1)^{\frac12}}{3\cdot\frac12}
          \]
          \[
          =
          \frac{6(3x+1)^{\frac12}}{\frac32}
          =
          4(3x+1)^{\frac12}
          \]
        </div>
      `),
      guidedStep("Evaluate region A", raw`Region A runs from \(x=0\) to \(x=5\).`, raw`
        <div class="math-block">
          \[
          A=\int_0^5 y\,dx
          =
          \left[4(3x+1)^{\frac12}\right]_0^5
          \]
          \[
          =
          4\sqrt{16}-4\sqrt{1}
          =
          16-4
          =
          12
          \]
        </div>
      `),
      guidedStep("Evaluate region B", raw`Region B runs from \(x=5\) to \(x=16\).`, raw`
        <div class="math-block">
          \[
          B=\int_5^{16} y\,dx
          =
          \left[4(3x+1)^{\frac12}\right]_5^{16}
          \]
          \[
          =
          4\sqrt{49}-4\sqrt{16}
          =
          28-16
          =
          12
          \]
          \[
          \therefore A=B
          \]
        </div>
      `)
    ]),

    "1e": createConfig("1e", raw`Separate the differential equation, integrate logarithmically, then compare the two given positive values of \(N\).`, raw`
      <div class="math-block">
        \[
        \boxed{k=\frac{1}{t_1}\ln\left(\frac{N_2}{N_1}\right)}
        \]
      </div>
    `, [
      guidedStep("Separate and integrate", raw`Move \(N\) to the left and \(dt\) to the right.`, raw`
        <div class="math-block">
          \[
          \frac{dN}{dt}=kN
          \]
          \[
          \frac{1}{N}\,dN=k\,dt
          \]
          \[
          \int N^{-1}\,dN=\int k\,dt
          \]
          \[
          \ln|N|=kt+C
          \]
        </div>
      `),
      guidedStep("Use the first value", raw`At \(t=t_1\), \(N=N_1\).`, raw`
        <div class="math-block">
          \[
          \ln|N_1|=kt_1+C
          \]
          \[
          C=\ln|N_1|-kt_1
          \]
        </div>
      `),
      guidedStep("Use the second value", raw`At \(t=2t_1\), \(N=N_2\). Substitute the expression for \(C\).`, raw`
        <div class="math-block">
          \[
          \ln|N_2|=k(2t_1)+C
          \]
          \[
          \ln|N_2|
          =
          2kt_1+\ln|N_1|-kt_1
          \]
          \[
          \ln|N_2|-\ln|N_1|=kt_1
          \]
        </div>
      `),
      guidedStep("Finish the proof", raw`Use the logarithm quotient law, then divide by \(t_1\).`, raw`
        <div class="math-block">
          \[
          kt_1
          =
          \ln\left|\frac{N_2}{N_1}\right|
          \]
          \[
          k
          =
          \frac{1}{t_1}
          \ln\left|\frac{N_2}{N_1}\right|
          \]
          \[
          N_1>0,\ N_2>0
          \quad\Rightarrow\quad
          \left|\frac{N_2}{N_1}\right|
          =
          \frac{N_2}{N_1}
          \]
          \[
          k=\frac{1}{t_1}\ln\left(\frac{N_2}{N_1}\right)
          \]
        </div>
      `)
    ], { finalLabel: "Proof complete" }),

    "2a": createConfig("2a", raw`Integrate the constant term and reverse the derivative of \(e^{4x}\).`, raw`
      <div class="math-block">
        \[
        \boxed{x+\frac{e^{4x}}{2}+C}
        \]
      </div>
    `, [
      guidedStep("Split the integral", raw`Treat \(1\) and \(2e^{4x}\) as separate terms.`, raw`
        <div class="math-block">
          \[
          \int\left(1+2e^{4x}\right)\,dx
          =
          \int 1\,dx+\int 2e^{4x}\,dx
          \]
        </div>
      `),
      guidedStep("Integrate the exponential", raw`Since \(\frac{d}{dx}(4x)=4\), divide by \(4\) when reversing the chain rule.`, raw`
        <div class="math-block">
          \[
          \int 1\,dx=x
          \]
          \[
          \int 2e^{4x}\,dx
          =
          2\cdot\frac{e^{4x}}{4}
          =
          \frac{e^{4x}}{2}
          \]
          \[
          \int\left(1+2e^{4x}\right)\,dx
          =
          x+\frac{e^{4x}}{2}+C
          \]
        </div>
      `)
    ]),

    "2b": createConfig("2b", raw`Use signed area: the full integral includes two negative shaded regions, while \(\int_{-B}^{B}f(x)\,dx\) excludes them.`, raw`
      <div class="math-block">
        \[
        \boxed{8.2}
        \]
      </div>
    `, [
      guidedStep("Identify the signed pieces", raw`The two shaded side regions are below the \(x\)-axis, so each contributes \(-1.2\) to the signed integral.`, raw`
        <div class="math-block">
          \[
          \int_{-A}^{-B}f(x)\,dx=-1.2
          \]
          \[
          \int_B^A f(x)\,dx=-1.2
          \]
        </div>
      `),
      guidedStep("Connect the full integral to the middle integral", raw`Split \(\int_{-A}^{A}\) into left, middle, and right parts.`, raw`
        <div class="math-block">
          \[
          \int_{-A}^{A}f(x)\,dx
          =
          \int_{-A}^{-B}f(x)\,dx
          +
          \int_{-B}^{B}f(x)\,dx
          +
          \int_B^A f(x)\,dx
          \]
          \[
          5.8
          =
          (-1.2)
          +
          \int_{-B}^{B}f(x)\,dx
          +
          (-1.2)
          \]
        </div>
      `),
      guidedStep("Solve for the central integral", raw`Add \(2.4\) because the central integral removes the two negative signed contributions.`, raw`
        <div class="math-block">
          \[
          5.8
          =
          \int_{-B}^{B}f(x)\,dx-2.4
          \]
          \[
          \int_{-B}^{B}f(x)\,dx
          =
          5.8+2.4
          =
          8.2
          \]
        </div>
      `)
    ]),

    "2c": createConfig("2c", raw`The denominator is linear, so the antiderivative is logarithmic; then solve the resulting logarithmic equation for \(k\).`, raw`
      <div class="math-block">
        \[
        \boxed{k=\frac{e^{2.5}+5}{2}\approx8.591}
        \]
      </div>
    `, [
      guidedStep("Integrate the reciprocal", raw`Because \(\frac{d}{dx}(2x-5)=2\), the factor \(8\) becomes \(4\) in front of the logarithm.`, raw`
        <div class="math-block">
          \[
          \int\frac{8}{2x-5}\,dx
          =
          4\ln|2x-5|+C
          \]
          \[
          \int_3^k\frac{8}{2x-5}\,dx
          =
          \left[4\ln|2x-5|\right]_3^k
          \]
        </div>
      `),
      guidedStep("Apply the limits", raw`At \(x=3\), \(2x-5=1\), so \(\ln|1|=0\).`, raw`
        <div class="math-block">
          \[
          10
          =
          4\ln|2k-5|-4\ln|1|
          \]
          \[
          10=4\ln|2k-5|
          \]
          \[
          \frac{10}{4}=\ln|2k-5|
          \]
          \[
          2.5=\ln|2k-5|
          \]
        </div>
      `),
      guidedStep("Solve for k", raw`Since the integral from \(3\) to \(k\) is positive and the integrand is positive for \(x>2.5\), the required \(k\) is greater than \(3\).`, raw`
        <div class="math-block">
          \[
          e^{2.5}=|2k-5|
          \]
          \[
          k>3
          \quad\Rightarrow\quad
          2k-5>0
          \]
          \[
          e^{2.5}=2k-5
          \]
          \[
          2k=e^{2.5}+5
          \]
          \[
          k=\frac{e^{2.5}+5}{2}\approx8.591
          \]
        </div>
      `)
    ]),

    "2d": createConfig("2d", raw`Rewrite \(\cos^2x\) using the double-angle identity before integrating over \(0\le x\le\pi\).`, raw`
      <div class="math-block">
        \[
        \boxed{\frac{\pi}{2}\text{ units}^2}
        \]
      </div>
    `, [
      guidedStep("Use a trig identity", raw`The identity \(\cos^2x=\frac12\cos(2x)+\frac12\) turns the square into integrable terms.`, raw`
        <div class="math-block">
          \[
          \cos^2x=\frac{1+\cos(2x)}{2}
          =
          \frac12\cos(2x)+\frac12
          \]
        </div>
      `),
      guidedStep("Set up and integrate the area", raw`The curve is non-negative here, so the shaded area is the definite integral.`, raw`
        <div class="math-block">
          \[
          A=\int_0^\pi\cos^2x\,dx
          =
          \int_0^\pi
          \left(
          \frac{\cos(2x)}{2}+\frac12
          \right)\,dx
          \]
          \[
          A=
          \left[
          \frac{\sin(2x)}{4}+\frac{x}{2}
          \right]_0^\pi
          \]
        </div>
      `),
      guidedStep("Evaluate the limits", raw`Both sine terms are zero at \(0\) and \(\pi\).`, raw`
        <div class="math-block">
          \[
          A=
          \left(
          \frac{\sin(2\pi)}{4}+\frac{\pi}{2}
          \right)
          -
          \left(
          \frac{\sin 0}{4}+0
          \right)
          \]
          \[
          =
          \left(0+\frac{\pi}{2}\right)-0
          =
          \frac{\pi}{2}\text{ units}^2
          \]
        </div>
      `)
    ]),

    "2e": createConfig("2e", raw`Find the intersection of the two curves, then integrate upper curve minus lower curve from the \(y\)-axis to that point.`, raw`
      <div class="math-block">
        \[
        \boxed{10\ln(10)-9\approx14.025\text{ units}^2}
        \]
      </div>
    `, [
      guidedStep("Find the intersection", raw`The two curves meet where their \(y\)-values are equal.`, raw`
        <div class="math-block">
          \[
          (e^x)^2=20-(e^x)^2
          \]
          \[
          e^{2x}=20-e^{2x}
          \]
          \[
          2e^{2x}=20
          \]
          \[
          e^{2x}=10
          \]
          \[
          2x=\ln 10
          \]
          \[
          x=\frac12\ln 10=\ln\sqrt{10}
          \]
        </div>
      `),
      guidedStep("Set up top minus bottom", raw`On the shaded interval, \(20-e^{2x}\) is above \(e^{2x}\).`, raw`
        <div class="math-block">
          \[
          A=
          \int_0^{\ln\sqrt{10}}
          \left[
          \left(20-e^{2x}\right)-e^{2x}
          \right]\,dx
          \]
          \[
          =
          \int_0^{\ln\sqrt{10}}
          \left(20-2e^{2x}\right)\,dx
          \]
        </div>
      `),
      guidedStep("Integrate", raw`The antiderivative of \(2e^{2x}\) is \(e^{2x}\).`, raw`
        <div class="math-block">
          \[
          A=
          \left[
          20x-e^{2x}
          \right]_0^{\ln\sqrt{10}}
          \]
        </div>
      `),
      guidedStep("Evaluate and simplify", raw`Use \(e^{2\ln\sqrt{10}}=(\sqrt{10})^2=10\) and \(\ln\sqrt{10}=\frac12\ln10\).`, raw`
        <div class="math-block">
          \[
          A=
          \left(
          20\ln\sqrt{10}-e^{2\ln\sqrt{10}}
          \right)
          -
          \left(20(0)-e^0\right)
          \]
          \[
          =
          \left(20\cdot\frac12\ln10-10\right)
          -
          (0-1)
          \]
          \[
          =
          10\ln10-10+1
          =
          10\ln10-9
          \]
          \[
          \approx14.025\text{ units}^2
          \]
        </div>
      `)
    ]),

    "3a": createConfig("3a", raw`Use the reverse chain rule on \((2x-1)^3\); the inside derivative is \(2\).`, raw`
      <div class="math-block">
        \[
        \boxed{3(2x-1)^4+C}
        \]
      </div>
    `, [
      guidedStep("Set up the reverse chain rule", raw`Increase the power from \(3\) to \(4\), then divide by both the new power and the inside derivative.`, raw`
        <div class="math-block">
          \[
          \int24(2x-1)^3\,dx
          =
          \frac{24(2x-1)^4}{4\cdot2}+C
          \]
        </div>
      `),
      guidedStep("Simplify the coefficient", raw`The denominator \(4\cdot2\) is \(8\).`, raw`
        <div class="math-block">
          \[
          \frac{24(2x-1)^4}{8}+C
          =
          3(2x-1)^4+C
          \]
        </div>
      `)
    ]),

    "3b": createConfig("3b", raw`Integrate \(4\sec^2(2x)\), then use the given point to find the constant.`, raw`
      <div class="math-block">
        \[
        \boxed{y=2\tan(2x)+3}
        \]
      </div>
    `, [
      guidedStep("Integrate the derivative", raw`Since \(\frac{d}{dx}\tan(2x)=2\sec^2(2x)\), \(4\sec^2(2x)\) integrates to \(2\tan(2x)\).`, raw`
        <div class="math-block">
          \[
          y=\int4\sec^2(2x)\,dx
          \]
          \[
          y=4\cdot\frac{\tan(2x)}{2}+C
          =
          2\tan(2x)+C
          \]
        </div>
      `),
      guidedStep("Use the given point", raw`Substitute \(x=\frac{\pi}{8}\) and \(y=5\).`, raw`
        <div class="math-block">
          \[
          5=2\tan\left(2\cdot\frac{\pi}{8}\right)+C
          \]
          \[
          5=2\tan\left(\frac{\pi}{4}\right)+C
          \]
          \[
          5=2(1)+C
          \]
          \[
          C=3
          \]
        </div>
      `),
      guidedStep("State the solution", raw`Put the constant back into the general antiderivative.`, raw`
        <div class="math-block">
          \[
          y=2\tan(2x)+3
          \]
        </div>
      `)
    ]),

    "3c": createConfig("3c", raw`Rewrite \(\frac{x}{x+1}\) as \(1-\frac{1}{x+1}\), then integrate term by term.`, raw`
      <div class="math-block">
        \[
        \boxed{\frac{27}{2}-\ln\left(\frac52\right)\approx12.58}
        \]
      </div>
    `, [
      guidedStep("Rewrite the fraction", raw`Make the numerator look like the denominator minus \(1\).`, raw`
        <div class="math-block">
          \[
          \frac{x}{x+1}
          =
          \frac{x+1-1}{x+1}
          \]
          \[
          =
          \frac{x+1}{x+1}-\frac{1}{x+1}
          =
          1-\frac{1}{x+1}
          \]
        </div>
      `),
      guidedStep("Rewrite the integral", raw`Combine the extra \(1\) with the existing \(+1\).`, raw`
        <div class="math-block">
          \[
          x+1+\frac{x}{x+1}
          =
          x+1+1-\frac{1}{x+1}
          =
          x+2-\frac{1}{x+1}
          \]
          \[
          \int_1^4\left(x+1+\frac{x}{x+1}\right)\,dx
          =
          \int_1^4\left(x+2-\frac{1}{x+1}\right)\,dx
          \]
        </div>
      `),
      guidedStep("Integrate and apply the limits", raw`The reciprocal term gives \(-\ln|x+1|\).`, raw`
        <div class="math-block">
          \[
          \int_1^4\left(x+2-\frac{1}{x+1}\right)\,dx
          =
          \left[
          \frac{x^2}{2}+2x-\ln|x+1|
          \right]_1^4
          \]
          \[
          =
          \left(8+8-\ln5\right)
          -
          \left(\frac12+2-\ln2\right)
          \]
        </div>
      `),
      guidedStep("Simplify", raw`Group the number terms and use \(-\ln5+\ln2=-\ln\left(\frac52\right)\).`, raw`
        <div class="math-block">
          \[
          =
          16-\ln5-\frac52+\ln2
          \]
          \[
          =
          \frac{32}{2}-\frac52-\ln5+\ln2
          \]
          \[
          =
          \frac{27}{2}-\ln\left(\frac52\right)
          \]
          \[
          \approx12.58
          \]
        </div>
      `)
    ]),

    "3d": createConfig("3d", raw`Integrate the derivative to find \(y(x)\), use \(y(1)=2\) for \(C\), then substitute \(x=4\).`, raw`
      <div class="math-block">
        \[
        \boxed{y(4)=\frac12\ln61+\frac{20}{3}\approx8.722}
        \]
      </div>
    `, [
      guidedStep("Integrate both terms", raw`The rational term is logarithmic because the numerator is half the derivative of \(4x^2-3\).`, raw`
        <div class="math-block">
          \[
          y=\int\left(\frac{4x}{4x^2-3}+\sqrt{x}\right)\,dx
          \]
          \[
          \int\frac{4x}{4x^2-3}\,dx
          =
          \frac12\ln|4x^2-3|
          \]
          \[
          \int\sqrt{x}\,dx
          =
          \int x^{\frac12}\,dx
          =
          \frac{x^{\frac32}}{\frac32}
          \]
          \[
          y=\frac12\ln|4x^2-3|+\frac{x^{\frac32}}{\frac32}+C
          \]
        </div>
      `),
      guidedStep("Find the constant", raw`Substitute \(x=1\), \(y=2\).`, raw`
        <div class="math-block">
          \[
          2=
          \frac12\ln|4(1)^2-3|
          +
          \frac{1^{\frac32}}{\frac32}
          +C
          \]
          \[
          2=
          \frac12\ln1+\frac{1}{\frac32}+C
          \]
          \[
          2=0+\frac23+C
          \]
          \[
          C=\frac43
          \]
        </div>
      `),
      guidedStep("Evaluate y at 4", raw`Substitute \(x=4\) into the antiderivative with \(C=\frac43\).`, raw`
        <div class="math-block">
          \[
          y(4)=
          \frac12\ln|4(4)^2-3|
          +
          \frac{4^{\frac32}}{\frac32}
          +
          \frac43
          \]
          \[
          =
          \frac12\ln61
          +
          \frac{8}{\frac32}
          +
          \frac43
          \]
          \[
          =
          \frac12\ln61
          +
          \frac{16}{3}
          +
          \frac43
          \]
          \[
          =
          \frac12\ln61+\frac{20}{3}
          \approx8.722
          \]
        </div>
      `)
    ]),

    "3e": createConfig("3e", raw`Use similar triangles to express the water-surface area \(A(h)\), then substitute it into the supplied pumping-energy integral.`, raw`
      <div class="math-block">
        \[
        \boxed{1323\text{ J}}
        \]
      </div>
    `, [
      guidedStep("Set the limits in the given formula", raw`Here \(H=1.5\) m and the initial depth is \(d=1\) m, so \(H-d=0.5\).`, raw`
        <div class="math-block">
          \[
          E=9800\int_{H-d}^{H}(H-h)A(h)\,dh
          \]
          \[
          E=9800\int_{0.5}^{1.5}(1.5-h)A(h)\,dh
          \]
        </div>
      `),
      guidedStep("Find the side length of the water surface", raw`The square side length grows in the same ratio as the height from the point of the pyramid.`, raw`
        <div class="math-block">
          \[
          \frac{L}{h}=\frac{0.9}{1.5}
          \]
          \[
          L=\frac{0.9}{1.5}h
          \]
          \[
          \frac{0.9}{1.5}=0.6
          \]
          \[
          L=0.6h
          \]
        </div>
      `),
      guidedStep("Build A(h)", raw`The water surface is a square, so its area is side length squared.`, raw`
        <div class="math-block">
          \[
          A(h)=L^2
          \]
          \[
          A(h)=(0.6h)^2
          \]
          \[
          A(h)=0.36h^2
          \]
        </div>
      `),
      guidedStep("Substitute and expand", raw`Multiply the factors before integrating.`, raw`
        <div class="math-block">
          \[
          E=9800\int_{0.5}^{1.5}(1.5-h)(0.36h^2)\,dh
          \]
          \[
          (1.5-h)(0.36h^2)
          =
          1.5(0.36h^2)-h(0.36h^2)
          \]
          \[
          =
          0.54h^2-0.36h^3
          \]
          \[
          E=9800\int_{0.5}^{1.5}(0.54h^2-0.36h^3)\,dh
          \]
        </div>
      `),
      guidedStep("Integrate and evaluate", raw`Evaluate the antiderivative carefully at both limits before multiplying by \(9800\).`, raw`
        <div class="math-block">
          \[
          \int(0.54h^2-0.36h^3)\,dh
          =
          0.18h^3-0.09h^4
          \]
          \[
          E=
          9800\left[
          0.18h^3-0.09h^4
          \right]_{0.5}^{1.5}
          \]
          \[
          0.18(1.5)^3-0.09(1.5)^4
          =
          0.6075-0.455625
          =
          0.151875
          \]
          \[
          0.18(0.5)^3-0.09(0.5)^4
          =
          0.0225-0.005625
          =
          0.016875
          \]
          \[
          E=9800(0.151875-0.016875)
          =
          9800(0.135)
          =
          1323\text{ J}
          \]
        </div>
      `)
    ])
  };
}());
