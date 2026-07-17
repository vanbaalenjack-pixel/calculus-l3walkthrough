(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-integration-2020";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const questionImageDimensions = {
    "1a": [2813, 657], "1b": [2844, 907], "1c": [2844, 513], "1d": [2875, 2157], "1e": [2844, 719],
    "2a": [2188, 782], "2b": [2844, 688], "2c": [2844, 488], "2d": [2844, 575], "2e": [2844, 1907],
    "3a": [2125, 500], "3b": [2844, 575], "3c": [2844, 1219], "3d": [2844, 1500], "3e": [2844, 1938]
  };
  const metadata = {
    topic: "Integration",
    year: 2020,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };
  const tags = [
    "Integration",
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
    return "int-" + id + "2020.html#question-" + id;
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
      browserTitle: "2020 Integration Paper - " + questionLabel(id),
      eyebrow: "Level 3 Integration Walkthrough",
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
        <img class="question-screenshot" src="assets/integration-2020/${id}-question.png" width="${imageDimensions[0]}" height="${imageDimensions[1]}" alt="${questionImageAlt(id, focus)}" />
      `,
      answerHtml: finalAnswer,
      guidedSteps: guidedSteps
    }, details || {});
  }

  window.Integration2020Walkthroughs = {
    "1a": createConfig("1a", raw`Rewrite the reciprocal term as \(3x^{-1}\), then integrate term by term.`, raw`
      <div class="math-block">
        \[
        \boxed{\frac{x^2}{2}+2x+3\ln|x|+C}
        \]
      </div>
    `, [
      guidedStep("Rewrite the integrand", raw`Put the third term in exponential form, while recognising that an \(x^{-1}\) term integrates logarithmically.`, raw`
        <div class="math-block">
          \[
          \int\left(x+2+\frac{3}{x}\right)\,dx
          =\int\left(x+2+3x^{-1}\right)\,dx
          \]
        </div>
      `),
      guidedStep("Integrate term by term", raw`Use the power rule on \(x\), integrate the constant \(2\), and use \(\int x^{-1}\,dx=\ln|x|\).`, raw`
        <div class="math-block">
          \[
          \int\left(x+2+3x^{-1}\right)\,dx
          =\frac{x^2}{2}+2x+3\ln|x|+C
          \]
        </div>
      `)
    ]),

    "1b": createConfig("1b", raw`Velocity is the derivative of displacement, so integrate \(v(t)\), use \(s(0)=5\), then evaluate \(s(16)\).`, raw`
      <div class="math-block">
        \[
        \boxed{s(16)=30.6\text{ cm}}
        \]
      </div>
    `, [
      guidedStep("Integrate the velocity", raw`Rewrite the square root in exponential form before applying the power rule.`, raw`
        <div class="math-block">
          \[
          v(t)=0.6\sqrt t=0.6t^{1/2}
          \]
          \[
          s(t)=\int 0.6t^{1/2}\,dt
          =\frac{0.6t^{3/2}}{3/2}+C
          =0.4t^{3/2}+C
          \]
        </div>
      `),
      guidedStep("Use the initial displacement", raw`Substitute \(t=0\) and \(s=5\) to find the constant of integration.`, raw`
        <div class="math-block">
          \[
          5=0.4(0)^{3/2}+C
          \]
          \[
          C=5,
          \qquad
          s(t)=0.4t^{3/2}+5
          \]
        </div>
      `),
      guidedStep("Evaluate after 16 seconds", raw`Substitute \(t=16\) into the displacement function and retain the given units.`, raw`
        <div class="math-block">
          \[
          s(16)=0.4(16)^{3/2}+5
          =0.4(64)+5
          =30.6\text{ cm}
          \]
        </div>
      `)
    ]),

    "1c": createConfig("1c", raw`Rewrite the numerator as a multiple of \(x-3\) plus a constant, then integrate the reciprocal term logarithmically.`, raw`
      <div class="math-block">
        \[
        \boxed{20+4\ln 5\approx 26.43775\text{ units}^2}
        \]
      </div>
    `, [
      guidedStep("Rewrite the rational function", raw`Write \(5x-11=5(x-3)+4\) so that \(x\) no longer appears in the numerator of the fraction.`, raw`
        <div class="math-block">
          \[
          \frac{5x-11}{x-3}
          =\frac{5(x-3)+4}{x-3}
          =5+\frac{4}{x-3}
          \]
          \[
          \int_4^8\frac{5x-11}{x-3}\,dx
          =\int_4^8\left(5+\frac{4}{x-3}\right)\,dx
          \]
        </div>
      `),
      guidedStep("Integrate and evaluate", raw`The reciprocal term gives \(\ln|x-3|\). Apply the upper limit and subtract the lower limit.`, raw`
        <div class="math-block">
          \[
          \int_4^8\left(5+\frac{4}{x-3}\right)\,dx
          =\left[5x+4\ln|x-3|\right]_4^8
          \]
          \[
          =\left(40+4\ln5\right)-\left(20+4\ln1\right)
          =20+4\ln5
          \]
          \[
          \approx 26.43775\text{ units}^2
          \]
        </div>
      `)
    ]),

    "1d": createConfig("1d", raw`Find the two intersections, then integrate top curve minus bottom curve between those limits.`, raw`
      <div class="math-block">
        \[
        \boxed{4-3\ln3\approx0.704\text{ units}^2}
        \]
      </div>
    `, [
      guidedStep("Find the limits", raw`The shaded region starts and ends where \(y=x+\frac3x\) meets \(y=4\).`, raw`
        <div class="math-block">
          \[
          x+\frac3x=4
          \]
          \[
          x^2-4x+3=0
          \]
          \[
          (x-1)(x-3)=0
          \]
          \[
          x=1,\ 3
          \]
        </div>
      `),
      guidedStep("Set up the shaded area", raw`The line \(y=4\) is above the curve on \(1\le x\le3\), so use top minus bottom.`, raw`
        <div class="math-block">
          \[
          A=\int_1^3\left(4-x-\frac3x\right)\,dx
          \]
        </div>
      `),
      guidedStep("Integrate and evaluate", raw`Integrate term by term, then substitute the limits.`, raw`
        <div class="math-block">
          \[
          A=\left[4x-\frac{x^2}{2}-3\ln|x|\right]_1^3
          \]
          \[
          =\left(\frac{15}{2}-3\ln3\right)-\frac72
          =4-3\ln3
          \]
          \[
          A\approx0.704\text{ units}^2
          \]
        </div>
      `)
    ]),

    "1e": createConfig("1e", raw`Separate \(x\) and \(y\), integrate \(\frac{\sec^2x}{\tan x}\) as \(\ln|\tan x|\), then use the initial condition.`, raw`
      <div class="math-block">
        \[
        \boxed{y=\pm\sqrt{4+\ln3}\approx\pm2.26}
        \]
      </div>
      <p class="step-text question-note">The PDF gives both algebraic roots. For the continuous solution through \(y=2\), the positive branch gives \(y\approx2.26\).</p>
    `, [
      guidedStep("Separate and integrate", raw`Move \(y\) to the left and divide by \(\tan x\) before integrating.`, raw`
        <div class="math-block">
          \[
          y\,dy=\frac{\sec^2x}{\tan x}\,dx
          \]
          \[
          \int y\,dy=\int\frac{\sec^2x}{\tan x}\,dx
          \]
          \[
          \frac{y^2}{2}=\ln|\tan x|+C
          \]
        </div>
      `),
      guidedStep("Use the initial condition", raw`At \(x=\frac\pi4\), \(\tan\frac\pi4=1\), and \(y=2\).`, raw`
        <div class="math-block">
          \[
          \frac{2^2}{2}=\ln\left|\tan\frac\pi4\right|+C
          \]
          \[
          2=0+C,
          \qquad C=2
          \]
          \[
          \frac{y^2}{2}=\ln|\tan x|+2
          \]
        </div>
      `),
      guidedStep("Evaluate at x equals pi over three", raw`Substitute \(\tan\frac\pi3=\sqrt3\), then solve the resulting equation for \(y\).`, raw`
        <div class="math-block">
          \[
          \frac{y^2}{2}=\ln\sqrt3+2
          =\frac12\ln3+2
          \]
          \[
          y^2=4+\ln3
          \]
          \[
          y=\pm\sqrt{4+\ln3}\approx\pm2.26
          \]
        </div>
        <p class="step-text question-note"><strong>Branch note:</strong> the source PDF reports \(\pm2.26\). Since the specified solution begins at \(y=2\), continuity selects the positive branch unless the question is interpreted as asking only for algebraic roots of the implicit relation.</p>
      `)
    ], { finalLabel: "PDF final answer and branch note" }),

    "2a": createConfig("2a", raw`Rewrite the reciprocal square as \(x^{-2}\), then apply the power rule.`, raw`
      <div class="math-block">
        \[
        \boxed{\pi x+\frac2x+C}
        \]
      </div>
    `, [
      guidedStep("Rewrite in exponential form", raw`The negative power makes the sign change in the antiderivative easy to track.`, raw`
        <div class="math-block">
          \[
          \int\left(\pi-\frac2{x^2}\right)\,dx
          =\int\left(\pi-2x^{-2}\right)\,dx
          \]
        </div>
      `),
      guidedStep("Integrate", raw`Integrating \(-2x^{-2}\) produces \(+2x^{-1}\). Include the constant of integration.`, raw`
        <div class="math-block">
          \[
          \int\left(\pi-2x^{-2}\right)\,dx
          =\pi x+2x^{-1}+C
          =\pi x+\frac2x+C
          \]
        </div>
      `)
    ]),

    "2b": createConfig("2b", raw`There are six equal strips of width \(h=0.5\), so Simpson’s Rule uses weights \(1,4,2,4,2,4,1\).`, raw`
      <div class="math-block">
        \[
        \boxed{\int_0^3 f(x)\,dx\approx6}
        \]
      </div>
    `, [
      guidedStep("Find the strip width", raw`Read the constant spacing between consecutive \(x\)-values in the table.`, raw`
        <div class="math-block">
          \[
          h=0.5,
          \qquad n=6
          \]
        </div>
      `),
      guidedStep("Apply Simpson’s Rule", raw`Use the endpoint values once, alternating weights \(4\) and \(2\) across the interior values.`, raw`
        <div class="math-block">
          \[
          \int_0^3 f(x)\,dx
          \approx\frac{0.5}{3}\Bigl[
          1.1+1.3+4(1.8+2.4+1.8)+2(2.1+2.7)
          \Bigr]
          \]
          \[
          =\frac16(2.4+24+9.6)
          =\frac{36}{6}
          =6
          \]
        </div>
      `)
    ]),

    "2c": createConfig("2c", raw`Integrate the linear square-root expression with the reverse chain rule, then solve the resulting power equation.`, raw`
      <div class="math-block">
        \[
        \boxed{k=6}
        \]
      </div>
    `, [
      guidedStep("Rewrite the square root", raw`Write the radical as a power so the reverse chain rule is visible.`, raw`
        <div class="math-block">
          \[
          \int_1^k9\sqrt{3x-2}\,dx
          =\int_1^k9(3x-2)^{1/2}\,dx
          \]
        </div>
      `),
      guidedStep("Integrate", raw`Increase the power by one, divide by the new power, and also divide by the inside derivative \(3\).`, raw`
        <div class="math-block">
          \[
          \int9(3x-2)^{1/2}\,dx
          =\frac{9(3x-2)^{3/2}}{(3/2)\cdot3}
          =2(3x-2)^{3/2}
          \]
        </div>
      `),
      guidedStep("Apply the limits and solve", raw`Set the evaluated integral equal to \(126\), then undo the \(\frac32\) power.`, raw`
        <div class="math-block">
          \[
          126=\left[2(3x-2)^{3/2}\right]_1^k
          =2(3k-2)^{3/2}-2
          \]
          \[
          64=(3k-2)^{3/2}
          \]
          \[
          3k-2=16,
          \qquad k=6
          \]
        </div>
      `)
    ]),

    "2d": createConfig("2d", raw`Separate the radical in \(y\), integrate both sides, and use the given point before evaluating the new \(x\)-value.`, raw`
      <div class="math-block">
        \[
        \boxed{y=\frac{49}{64}}
        \]
      </div>
    `, [
      guidedStep("Separate and integrate", raw`Move \(\sqrt y\) to the left, then integrate the cosine with its inside factor \(4\).`, raw`
        <div class="math-block">
          \[
          y^{-1/2}\,dy=\cos(4x)\,dx
          \]
          \[
          2y^{1/2}=\frac{\sin(4x)}4+C
          \]
        </div>
      `),
      guidedStep("Find the constant", raw`Use \(y=1\) when \(x=\frac\pi8\), noting that \(\sin\frac\pi2=1\).`, raw`
        <div class="math-block">
          \[
          2=\frac{\sin(4\pi/8)}4+C
          =\frac14+C
          \]
          \[
          C=\frac74
          \]
        </div>
      `),
      guidedStep("Evaluate at x equals pi over four", raw`At \(x=\frac\pi4\), \(\sin(4x)=\sin\pi=0\).`, raw`
        <div class="math-block">
          \[
          2\sqrt y=\frac{\sin(4\pi/4)}4+\frac74
          =\frac74
          \]
          \[
          \sqrt y=\frac78
          \]
          \[
          y=\left(\frac78\right)^2=\frac{49}{64}
          \]
        </div>
      `)
    ]),

    "2e": createConfig("2e", raw`Find where the curve crosses the axis, then add the magnitudes of the two signed integrals.`, raw`
      <div class="math-block">
        \[
        \boxed{9\text{ units}^2}
        \]
      </div>
    `, [
      guidedStep("Find the x-intercept", raw`Let \(u=\sqrt x\), solve the quadratic in \(u\), and retain \(u\ge0\).`, raw`
        <div class="math-block">
          \[
          x+2\sqrt x-3=0
          \]
          \[
          u=\sqrt x,
          \qquad u^2+2u-3=0
          \]
          \[
          (u+3)(u-1)=0
          \]
          \[
          u=1,
          \qquad x=1
          \]
        </div>
      `),
      guidedStep("Split the geometric area", raw`The curve is below the \(x\)-axis on \(0\le x\le1\), then above it on \(1\le x\le4\).`, raw`
        <div class="math-block">
          \[
          A=-\int_0^1\left(x+2\sqrt x-3\right)\,dx
          +\int_1^4\left(x+2\sqrt x-3\right)\,dx
          \]
        </div>
        <p class="step-text question-note"><strong>Source clarification:</strong> the PDF first displays these as two added signed integrals, but its next page takes the absolute value of the negative first integral. The explicit minus sign above states that geometric-area step directly.</p>
      `),
      guidedStep("Evaluate both pieces", raw`Use one antiderivative, then take the magnitude of the first signed value.`, raw`
        <div class="math-block">
          \[
          F(x)=\frac{x^2}{2}+\frac{4x^{3/2}}3-3x
          \]
          \[
          -\left[F(x)\right]_0^1
          =-\left(-\frac76\right)=\frac76
          \]
          \[
          \left[F(x)\right]_1^4
          =\frac{20}{3}-\left(-\frac76\right)
          =\frac{47}{6}
          \]
        </div>
      `),
      guidedStep("Add the two areas", raw`Both pieces are now positive geometric areas.`, raw`
        <div class="math-block">
          \[
          A=\frac76+\frac{47}{6}
          =\frac{54}{6}
          =9\text{ units}^2
          \]
        </div>
      `)
    ]),

    "3a": createConfig("3a", raw`Recognise the reverse chain-rule derivative of \(\sec(2x)\).`, raw`
      <div class="math-block">
        \[
        \boxed{\frac12\sec(2x)+C}
        \]
      </div>
    `, [
      guidedStep("Use the sec-tan derivative", raw`Because \(\frac{d}{dx}\sec(2x)=2\sec(2x)\tan(2x)\), compensate with a factor of \(\frac12\).`, raw`
        <div class="math-block">
          \[
          \int\sec(2x)\tan(2x)\,dx
          =\frac12\sec(2x)+C
          \]
        </div>
      `)
    ]),

    "3b": createConfig("3b", raw`Integrate the gradient, use the initial condition to find \(C\), then evaluate at \(x=\frac\pi4\).`, raw`
      <div class="math-block">
        \[
        \boxed{y=\frac54}
        \]
      </div>
    `, [
      guidedStep("Integrate the gradient", raw`Reverse the chain rule for \(\cos(2x)\).`, raw`
        <div class="math-block">
          \[
          y=\int\cos(2x)\,dx
          =\frac{\sin(2x)}2+C
          \]
        </div>
      `),
      guidedStep("Find the constant", raw`At \(x=\frac\pi{12}\), the angle \(2x\) is \(\frac\pi6\).`, raw`
        <div class="math-block">
          \[
          1=\frac{\sin(2\pi/12)}2+C
          =\frac{1/2}{2}+C
          \]
          \[
          C=\frac34
          \]
        </div>
      `),
      guidedStep("Evaluate at x equals pi over four", raw`Now \(2x=\frac\pi2\), so \(\sin(2x)=1\).`, raw`
        <div class="math-block">
          \[
          y=\frac{\sin(2\pi/4)}2+\frac34
          =\frac12+\frac34
          =\frac54
          \]
        </div>
      `)
    ]),

    "3c": createConfig("3c", raw`Acceleration is \(\frac{dv}{dt}\). Integrate it, use \(v(0)=8\), then evaluate \(v(10)\).`, raw`
      <div class="math-block">
        \[
        \boxed{v(10)=53+5e^2\approx89.945\text{ m s}^{-1}}
        \]
      </div>
    `, [
      guidedStep("Integrate the acceleration", raw`Integrate the polynomial and exponential terms separately, including the reverse-chain-rule factor for \(e^{0.2t}\).`, raw`
        <div class="math-block">
          \[
          v(t)=\int\left(t+e^{0.2t}\right)\,dt
          \]
          \[
          v(t)=\frac{t^2}{2}+5e^{0.2t}+C
          \]
        </div>
      `),
      guidedStep("Use the initial velocity", raw`Substitute \(t=0\) and \(v=8\).`, raw`
        <div class="math-block">
          \[
          8=\frac{0^2}{2}+5e^0+C
          =5+C
          \]
          \[
          C=3
          \]
        </div>
      `),
      guidedStep("Evaluate at 10 seconds", raw`Substitute \(t=10\) and keep velocity units.`, raw`
        <div class="math-block">
          \[
          v(10)=\frac{10^2}{2}+5e^{0.2(10)}+3
          \]
          \[
          =53+5e^2
          \approx89.945\text{ m s}^{-1}
          \]
        </div>
      `)
    ]),

    "3d": createConfig("3d", raw`Solve the separable decay equation, use the half-life to find \(k\), then set the remaining proportion to \(0.05\).`, raw`
      <div class="math-block">
        \[
        \boxed{t\approx24.2\text{ days}}
        \]
      </div>
    `, [
      guidedStep("Solve the differential equation", raw`Separate \(N\) and \(t\), then integrate.`, raw`
        <div class="math-block">
          \[
          \frac{1}{N}\,dN=k\,dt
          \]
          \[
          \ln|N|=kt+C
          \]
          \[
          N=N_0e^{kt}
          \]
        </div>
      `),
      guidedStep("Use the half-life", raw`After \(5.6\) days, the remaining proportion is \(\frac12\).`, raw`
        <div class="math-block">
          \[
          \frac{N}{N_0}=e^{5.6k}=\frac12
          \]
          \[
          k=\frac{\ln(1/2)}{5.6}
          \approx-0.1238
          \]
        </div>
      `),
      guidedStep("Translate 95 percent decayed", raw`If \(95\%\) has decayed, \(5\%\) remains, so \(\frac{N}{N_0}=0.05\).`, raw`
        <div class="math-block">
          \[
          0.05=e^{kt}
          \]
          \[
          t=\frac{\ln(0.05)}{k}
          =\frac{5.6\ln(0.05)}{\ln(0.5)}
          \]
        </div>
      `),
      guidedStep("Calculate the time", raw`Evaluate without rounding \(k\) too early.`, raw`
        <div class="math-block">
          \[
          t\approx24.2\text{ days}
          \]
        </div>
      `)
    ]),

    "3e": createConfig("3e", raw`Use top minus bottom, then rewrite \(\cos^3x\) with identities so every term can be integrated directly.`, raw`
      <div class="math-block">
        \[
        \boxed{\frac13\text{ units}^2}
        \]
      </div>
    `, [
      guidedStep("Rewrite the cube term", raw`Express \(\cos^3x\) as a sum of linear cosine terms using \(\sin^2x=\frac{1-\cos2x}{2}\) and product-to-sum.`, raw`
        <div class="math-block">
          \[
          \cos^3x=\cos x(1-\sin^2x)
          \]
          \[
          =\cos x\left(1-\left(\frac12-\frac{\cos2x}{2}\right)\right)
          \]
          \[
          =\frac{\cos x}{2}+\frac{\cos x\cos2x}{2}
          \]
          \[
          =\frac{\cos x}{2}+\frac14(\cos3x+\cos x)
          \]
          \[
          =\frac{3\cos x}{4}+\frac{\cos3x}{4}
          \]
        </div>
      `),
      guidedStep("Integrate the area between the curves", raw`On the given interval, \(\cos x\) is the top curve. Substitute the identity and integrate.`, raw`
        <div class="math-block">
          \[
          A=\int_0^{\pi/2}\left(\cos x-\cos^3x\right)\,dx
          \]
          \[
          =\int_0^{\pi/2}\left(\frac{\cos x}{4}-\frac{\cos3x}{4}\right)\,dx
          \]
          \[
          =\left[\frac{\sin x}{4}-\frac{\sin3x}{12}\right]_0^{\pi/2}
          \]
          \[
          =\frac14-\frac{-1}{12}
          =\frac13\text{ units}^2
          \]
        </div>
      `)
    ])
  };
}());
