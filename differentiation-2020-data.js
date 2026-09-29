(function () {
  const raw = String.raw;
  const paperHref = "level-3-differentiation-2020.html";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const metadata = {
    topic: "Differentiation",
    year: 2020,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };
  const tags = [
    "Differentiation",
    "2020",
    "NCEA Level 3 Calculus",
    "mixed / Excellence-style"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return id + "2020.html";
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

  function createConfig(id, focus, details) {
    const next = nextId(id);

    return Object.assign({
      browserTitle: "2020 Differentiation Paper - " + questionLabel(id),
      eyebrow: "Level 3 Differentiation Walkthrough",
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
      tags: tags
    }, details);
  }

  function guidedStep(title, previewHtml, workingHtml) {
    return {
      title: title,
      previewHtml: previewHtml,
      workingHtml: workingHtml
    };
  }

  const accessibleQuestions = {
    "1a": raw`<p class="step-text">Differentiate \(y=(3x-x^2)^5\).</p><p class="step-text">You do not need to simplify your answer.</p>`,
    "1b": raw`<p class="step-text">Find the gradient of the tangent to \(y=3\sin2x+\cos2x\) at the point where \(x=\pi/4\).</p><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "1c": raw`<p class="step-text">Find the value of \(x\) for which the graph of \(y=\dfrac{x}{1+\ln x}\) has a stationary point.</p><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "1d": raw`<p class="step-text">A curve has equation \(y=x^2\cos x\). Show that its tangent at \((\pi,-\pi^2)\) has equation \(y+2\pi x=\pi^2\).</p><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "1e": raw`<p class="step-text">A cylinder of height \(h\) and radius \(r\) is inscribed inside a sphere of radius \(20\text{ cm}\), as shown. Find the maximum possible volume of the cylinder.</p><p class="step-text">You do not need to prove that the volume you have found is a maximum.</p><div class="graph-frame question-graph-frame"><svg class="graph-svg" viewBox="0 0 440 320" role="img" aria-label="A cylinder is centred inside a sphere of radius 20 cm. Its top and bottom circular rims touch the sphere. Cylinder height is h and base radius is r."><rect width="440" height="320" fill="white"/><circle cx="220" cy="156" r="135" fill="none" stroke="#244c76" stroke-width="2"/><rect x="112" y="75" width="216" height="162" fill="#dbeafe" stroke="#244c76"/><ellipse cx="220" cy="75" rx="108" ry="16" fill="#bfdbfe" stroke="#244c76"/><path d="M112 237Q220 267 328 237" fill="none" stroke="#244c76"/><text x="333" y="160" fill="#172d45" font-size="15">h</text><path d="M220 75L328 75" fill="none" stroke="#244c76" stroke-width="2"/><text x="269" y="67" fill="#172d45" font-size="15">r</text><text x="156" y="307" fill="#172d45" font-size="15">Sphere radius 20 cm</text></svg></div><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "2a": raw`<p class="step-text">Differentiate \(y=\dfrac{\tan x}{x^3}\).</p><p class="step-text">You do not need to simplify your answer.</p>`,
    "2b": raw`<p class="step-text">The value of a car is modelled by</p><div class="question-math">\[V=17000e^{-0.25t}+2000e^{-0.5t}+500,\qquad 0\le t\le20.\]</div><p class="step-text">Here \(V\) is the value in dollars and \(t\) is the age of the car in years. Calculate the rate at which its value is changing when it is 8 years old.</p><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "2c": raw`<p class="step-text">Find the \(x\)-coordinates of any stationary points of \(f(x)=(2x-3)e^{x^2+k}\).</p><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "2d": raw`<p class="step-text">A rocket is fired vertically upwards. Its height above the launch point is \(h(t)=4.8t^2\), where \(h\) is in metres and \(t\) is the time in seconds from firing.</p><p class="step-text">An observer at A watches the rocket from the same level as the launch point, \(500\text{ m}\) away. Find the rate at which the angle of elevation at A is increasing when the rocket is \(480\text{ m}\) above the launch point.</p><div class="graph-frame question-graph-frame"><svg class="graph-svg" viewBox="0 0 440 320" role="img" aria-label="Right triangle: horizontal ground from observer A to launch point is 500 m. Rocket is vertically above the launch point. The line of sight is the hypotenuse; the angle at A is the angle of elevation."><rect width="440" height="320" fill="white"/><path d="M40 268L378 268" fill="none" stroke="#244c76" stroke-width="2"/><path d="M378 268L378 45" fill="none" stroke="#244c76" stroke-width="2"/><path d="M40 268L378 45" fill="none" stroke="#244c76" stroke-width="2"/><text x="24" y="291" fill="#172d45" font-size="15">A</text><text x="173" y="291" fill="#172d45" font-size="15">500 m</text><text x="381" y="164" fill="#172d45" font-size="15">h(t)</text><text x="85" y="257" fill="#172d45" font-size="15">θ</text></svg></div><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "2e": raw`<p class="step-text">A curve is defined by \(x=\ln t\) and \(y=6t^3\), where \(t&gt;0\). At a point P on the curve, \(\dfrac{d^2y}{dx^2}=2\). Find the exact coordinates of P.</p><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "3a": raw`<p class="step-text">Differentiate \(y=3\ln(x^2-1)\).</p><p class="step-text">You do not need to simplify your answer.</p>`,
    "3b": raw`<p class="step-text">For what value(s) of \(x\) does the tangent to \(f(x)=2x-2\sqrt x\), \(x&gt;0\), have a gradient of 1?</p><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "3c": raw`<p class="step-text">The normal to \(y=\sqrt{2x+1}\) at \((4,3)\) intersects the \(x\)-axis at P. Find the \(x\)-coordinate of P.</p><div class="graph-frame question-graph-frame"><svg class="graph-svg" viewBox="0 0 440 320" role="img" aria-label="Curve y = √(2x + 1). The normal passes through (4,3) and slopes down to meet the positive x-axis at P."><rect width="440" height="320" fill="white"/><path d="M32.0 248.29L407.0 248.29" fill="none" stroke="#244c76" stroke-width="2"/><path d="M73.67 284.0L73.67 34.0" fill="none" stroke="#244c76" stroke-width="2"/><text x="408" y="240.29" fill="#172d45" font-size="15">x</text><text x="81.67" y="27" fill="#172d45" font-size="15">y</text><path d="M52.83 248.29 L54.6 237.87 L56.38 233.56 L58.15 230.25 L59.92 227.46 L61.69 225.0 L63.46 222.78 L65.23 220.74 L67.0 218.83 L68.77 217.05 L70.54 215.36 L72.31 213.75 L74.08 212.22 L75.85 210.74 L77.62 209.33 L79.4 207.96 L81.17 206.64 L82.94 205.35 L84.71 204.11 L86.48 202.9 L88.25 201.72 L90.02 200.57 L91.79 199.45 L93.56 198.35 L95.33 197.28 L97.1 196.22 L98.88 195.19 L100.65 194.18 L102.42 193.19 L104.19 192.21 L105.96 191.25 L107.73 190.31 L109.5 189.38 L111.27 188.47 L113.04 187.57 L114.81 186.69 L116.58 185.81 L118.35 184.95 L120.12 184.1 L121.9 183.26 L123.67 182.43 L125.44 181.61 L127.21 180.81 L128.98 180.01 L130.75 179.22 L132.52 178.44 L134.29 177.67 L136.06 176.9 L137.83 176.15 L139.6 175.4 L141.38 174.66 L143.15 173.93 L144.92 173.2 L146.69 172.48 L148.46 171.77 L150.23 171.07 L152.0 170.37 L153.77 169.67 L155.54 168.99 L157.31 168.31 L159.08 167.63 L160.85 166.96 L162.62 166.3 L164.4 165.64 L166.17 164.99 L167.94 164.34 L169.71 163.69 L171.48 163.06 L173.25 162.42 L175.02 161.79 L176.79 161.17 L178.56 160.55 L180.33 159.93 L182.1 159.32 L183.88 158.71 L185.65 158.11 L187.42 157.51 L189.19 156.92 L190.96 156.33 L192.73 155.74 L194.5 155.15 L196.27 154.57 L198.04 154.0 L199.81 153.42 L201.58 152.85 L203.35 152.29 L205.12 151.72 L206.9 151.17 L208.67 150.61 L210.44 150.06 L212.21 149.5 L213.98 148.96 L215.75 148.41 L217.52 147.87 L219.29 147.33 L221.06 146.8 L222.83 146.27 L224.6 145.74 L226.38 145.21 L228.15 144.68 L229.92 144.16 L231.69 143.64 L233.46 143.13 L235.23 142.61 L237.0 142.1 L238.77 141.59 L240.54 141.08 L242.31 140.58 L244.08 140.08 L245.85 139.58 L247.62 139.08 L249.4 138.58 L251.17 138.09 L252.94 137.6 L254.71 137.11 L256.48 136.63 L258.25 136.14 L260.02 135.66 L261.79 135.18 L263.56 134.7 L265.33 134.22 L267.1 133.75 L268.88 133.28 L270.65 132.81 L272.42 132.34 L274.19 131.87 L275.96 131.41 L277.73 130.94 L279.5 130.48 L281.27 130.02 L283.04 129.57 L284.81 129.11 L286.58 128.66 L288.35 128.2 L290.12 127.75 L291.9 127.3 L293.67 126.86 L295.44 126.41 L297.21 125.97 L298.98 125.53 L300.75 125.08 L302.52 124.65 L304.29 124.21 L306.06 123.77 L307.83 123.34 L309.6 122.9 L311.38 122.47 L313.15 122.04 L314.92 121.61 L316.69 121.19 L318.46 120.76 L320.23 120.34 L322.0 119.91 L323.77 119.49 L325.54 119.07 L327.31 118.65 L329.08 118.23 L330.85 117.82 L332.62 117.4 L334.4 116.99 L336.17 116.58 L337.94 116.17 L339.71 115.76 L341.48 115.35 L343.25 114.94 L345.02 114.54 L346.79 114.13 L348.56 113.73 L350.33 113.33 L352.1 112.92 L353.88 112.52 L355.65 112.13 L357.42 111.73 L359.19 111.33 L360.96 110.94 L362.73 110.54 L364.5 110.15 L366.27 109.76 L368.04 109.37 L369.81 108.98 L371.58 108.59 L373.35 108.2 L375.12 107.81 L376.9 107.43 L378.67 107.04 L380.44 106.66 L382.21 106.28 L383.98 105.9 L385.75 105.52 L387.52 105.14 L389.29 104.76 L391.06 104.38 L392.83 104.01 L394.6 103.63 L396.37 103.26 L398.15 102.88 L399.92 102.51 L401.69 102.14 L403.46 101.77 L405.23 101.4 L407.0 101.03" stroke="#2563aa" stroke-width="2.5" fill="none"/><path d="M207.0 55.43L294.5 280.43" fill="none" stroke="#244c76" stroke-width="2"/><text x="248.33" y="133.14" fill="#172d45" font-size="15">(4,3)</text><text x="290.0" y="240.29" fill="#172d45" font-size="15">P</text></svg></div><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "3d": raw`<p class="step-text">The graph of \(y=\dfrac1{x-3}+x\), \(x\ne3\), has two stationary points. Find their \(x\)-coordinates and determine whether each is a local maximum or a local minimum.</p><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "3e": raw`<p class="step-text">A curve has equation \(y=(3x+2)e^{-2x}\). Prove that</p><div class="question-math">\[\frac{d^2y}{dx^2}+4\frac{dy}{dx}+4y=0.\]</div>`
  };

  const scanDimensions = {"1e": [3125, 938], "1b": [3125, 594], "3a": [3125, 550], "2d": [3125, 2100], "2c": [3125, 563], "1c": [3125, 557], "1d": [3125, 788], "2b": [3125, 888], "2e": [3125, 863], "1a": [3125, 563], "3e": [3125, 763], "3b": [3125, 607], "3c": [3125, 2125], "3d": [3125, 763], "2a": [3125, 632]};

  function questionImage(id) {
    return accessibleQuestions[id] + `<details class="original-scan"><summary>Original question scan</summary><img class="question-screenshot" width="${scanDimensions[id][0]}" height="${scanDimensions[id][1]}" loading="lazy" src="assets/differentiation-2020/${id}-question.png" alt="Original scan of the question transcribed above" /></details>`;
  }

  window.Differentiation2020Walkthroughs = {
    "1a": createConfig("1a", raw`Chain rule differentiation of a fifth power.`, {
      questionHtml: questionImage("1a"),
      answerHtml: raw`
        <div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{\frac{dy}{dx}=5(3x-x^2)^4(3-2x)}
              \]
            </div>
          </div>
      `,
      guidedSteps: [
        guidedStep("Apply the chain rule", raw`
          <p class="step-text">The fifth power is applied to a function of \(x\), so the chain rule connects the outer and inner derivatives.</p>
        `, raw`
          <p class="step-text">Use the chain rule because the fifth power is applied to a function of \(x\).</p>
        `),
        guidedStep("Continue the working", raw`
          <p class="step-text">Set up the inner and outer functions.</p>
        `, raw`
          <div class="math-block">
              \[
              u=3x-x^2
              \]
              \[
              y=u^5
              \]
            </div>
        `),
        guidedStep("Continue the working", raw`
          <p class="step-text">Differentiate both parts.</p>
        `, raw`
          <div class="math-block">
              \[
              \frac{dy}{du}=5u^4
              \]
              \[
              \frac{du}{dx}=3-2x
              \]
            </div>
        `),
        guidedStep("Complete the solution", raw`
          <p class="step-text">Multiply using the chain rule and substitute \(u=3x-x^2\).</p>
        `, raw`
          <div class="math-block">
              \[
              \frac{dy}{dx}
              =
              \frac{dy}{du}\cdot\frac{du}{dx}
              =
              5u^4(3-2x)
              \]
              \[
              \frac{dy}{dx}=5(3x-x^2)^4(3-2x)
              \]
            </div>
<div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{\frac{dy}{dx}=5(3x-x^2)^4(3-2x)}
              \]
            </div>
          </div>
        `)
      ]
    }),
    "1b": createConfig("1b", raw`Trig derivatives and evaluating a tangent gradient.`, {
      questionHtml: questionImage("1b"),
      answerHtml: raw`
        <div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{\text{The gradient of the tangent is }-2.}
              \]
            </div>
          </div>
      `,
      guidedSteps: [
        guidedStep("Differentiate the trigonometric terms", raw`
          <p class="step-text">Differentiate the function using trig derivatives and the chain rule.</p>
        `, raw`
          <div class="math-block">
              \[
              y=3\sin(2x)+\cos(2x)
              \]
              \[
              \frac{dy}{dx}
              =
              3\cos(2x)\cdot 2-\sin(2x)\cdot 2
              \]
              \[
              \frac{dy}{dx}=6\cos(2x)-2\sin(2x)
              \]
            </div>
        `),
        guidedStep("Complete the solution", raw`
          <p class="step-text">Evaluate the derivative at \(x=\frac{\pi}{4}\).</p>
        `, raw`
          <div class="math-block">
              \[
              \left.\frac{dy}{dx}\right|_{x=\frac{\pi}{4}}
              =
              6\cos\left(\frac{2\pi}{4}\right)
              -
              2\sin\left(\frac{2\pi}{4}\right)
              \]
              \[
              =
              6\cos\left(\frac{\pi}{2}\right)
              -
              2\sin\left(\frac{\pi}{2}\right)
              =
              -2
              \]
            </div>
<div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{\text{The gradient of the tangent is }-2.}
              \]
            </div>
          </div>
        `)
      ]
    }),
    "1c": createConfig("1c", raw`Quotient rule and a stationary point on a logarithmic function.`, {
      questionHtml: questionImage("1c"),
      answerHtml: raw`
        <div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{x=1}
              \]
            </div>
          </div>
      `,
      guidedSteps: [
        guidedStep("Apply the quotient rule", raw`
          <p class="step-text">Differentiate using the quotient rule.</p>
        `, raw`
          <div class="math-block">
              \[
              y=\frac{u}{v},
              \qquad
              \frac{dy}{dx}=\frac{u'v-v'u}{v^2}
              \]
              \[
              \frac{dy}{dx}
              =
              \frac{1(1+\ln x)-\frac{1}{x}(x)}{(1+\ln x)^2}
              =
              \frac{1+\ln x-1}{(1+\ln x)^2}
              =
              \frac{\ln x}{(1+\ln x)^2}
              \]
            </div>
        `),
        guidedStep("Complete the solution", raw`
          <p class="step-text">At a stationary point, \(\frac{dy}{dx}=0\). The denominator cannot be zero, so the numerator must be zero.</p>
        `, raw`
          <div class="math-block">
              \[
              0=\frac{\ln x}{(1+\ln x)^2}
              \]
              \[
              0=\ln x
              \]
              \[
              x=e^0=1
              \]
            </div>
<div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{x=1}
              \]
            </div>
          </div>
        `)
      ]
    }),
    "1d": createConfig("1d", raw`Product rule and proving a tangent equation.`, {
      questionHtml: questionImage("1d"),
      answerHtml: raw`
        <div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{y+2\pi x=\pi^2}
              \]
            </div>
          </div>
      `,
      guidedSteps: [
        guidedStep("Apply the product rule", raw`
          <p class="step-text">Differentiate using the product rule.</p>
        `, raw`
          <div class="math-block">
              \[
              y=x^2\cos x
              \]
              \[
              \frac{dy}{dx}=2x\cos x-x^2\sin x
              \]
            </div>
        `),
        guidedStep("Continue the working", raw`
          <p class="step-text">Evaluate the derivative at \(x=\pi\) to get the tangent gradient.</p>
        `, raw`
          <div class="math-block">
              \[
              \left.\frac{dy}{dx}\right|_{x=\pi}
              =
              2\pi\cos(\pi)-\pi^2\sin(\pi)
              =
              -2\pi
              \]
            </div>
        `),
        guidedStep("Continue the working", raw`
          <p class="step-text">Use the point \((\pi,-\pi^2)\) and gradient \(-2\pi\).</p>
        `, raw`
          <div class="math-block">
              \[
              y-y_1=m(x-x_1)
              \]
              \[
              y+\pi^2=-2\pi(x-\pi)
              \]
              \[
              y+\pi^2=-2\pi x+2\pi^2
              \]
            </div>
        `),
        guidedStep("Complete the solution", raw`
          <p class="step-text">Rearrange into the required form.</p>
        `, raw`
          <div class="math-block">
              \[
              y+\pi^2=-2\pi x+2\pi^2
              \]
              \[
              y+2\pi x=\pi^2
              \]
            </div>
<div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{y+2\pi x=\pi^2}
              \]
            </div>
          </div>
        `)
      ]
    }),
    "1e": createConfig("1e", raw`Maximising a cylinder volume inside a sphere.`, {
      questionHtml: questionImage("1e"),
      answerHtml: raw`
        <div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{V_{\max}=\frac{32000\pi\sqrt{3}}{9}\ \text{cm}^3\approx 19347\ \text{cm}^3}
              \]
            </div>
          </div>
      `,
      guidedSteps: [
        guidedStep("Relate the cylinder dimensions", raw`
          <p class="step-text">Relate the cylinder radius \(r\) and height \(h\) using the right triangle inside the sphere.</p>
        `, raw`
          <div class="math-block">
              \[
              r^2+\left(\frac{h}{2}\right)^2=20^2
              \]
              \[
              r^2+\frac{h^2}{4}=400
              \]
              \[
              r^2=400-\frac{h^2}{4}
              \]
            </div>
        `),
        guidedStep("Continue the working", raw`
          <p class="step-text">Write the cylinder volume in terms of \(h\) only.</p>
        `, raw`
          <div class="math-block">
              \[
              V=\pi h r^2
              \]
              \[
              V=\pi h\left(400-\frac{h^2}{4}\right)
              \]
              \[
              V=400\pi h-\frac{\pi h^3}{4}
              \]
            </div>
        `),
        guidedStep("Continue the working", raw`
          <p class="step-text">Differentiate and set the derivative equal to zero.</p>
        `, raw`
          <div class="math-block">
              \[
              \frac{dV}{dh}=400\pi-\frac{3\pi h^2}{4}
              \]
              \[
              400\pi-\frac{3\pi h^2}{4}=0
              \]
              \[
              400\pi=\frac{3\pi h^2}{4}
              \]
              \[
              h^2=\frac{1600}{3}
              \]
              \[
              h=\frac{40\sqrt{3}}{3}
              \]
            </div>
        `),
        guidedStep("Complete the solution", raw`
          <p class="step-text">Substitute the critical height into the volume equation.</p>
        `, raw`
          <div class="math-block">
              \[
              V
              =
              400\pi\left(\frac{40\sqrt{3}}{3}\right)
              -
              \frac{\pi\left(\frac{40\sqrt{3}}{3}\right)^3}{4}
              \]
              \[
              V=\frac{32000\pi\sqrt{3}}{9}
              \]
              \[
              V\approx 19347.19
              \]
            </div>
<div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{V_{\max}=\frac{32000\pi\sqrt{3}}{9}\ \text{cm}^3\approx 19347\ \text{cm}^3}
              \]
            </div>
          </div>
        `)
      ]
    }),
    "2a": createConfig("2a", raw`Quotient rule differentiation of a trigonometric fraction.`, {
      questionHtml: questionImage("2a"),
      answerHtml: raw`
        <div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{\frac{dy}{dx}=\frac{x^3\sec^2(x)-3x^2\tan(x)}{x^6}}
              \]
            </div>
          </div>
      `,
      guidedSteps: [
        guidedStep("Apply the method", raw`
          <p class="step-text">Use the quotient rule with \(u=\tan x\) and \(v=x^3\).</p>
        `, raw`
          <div class="math-block">
              \[
              \frac{dy}{dx}
              =
              \frac{\sec^2(x)x^3-3x^2\tan(x)}{(x^3)^2}
              \]
              \[
              \frac{dy}{dx}
              =
              \frac{x^3\sec^2(x)-3x^2\tan(x)}{x^6}
              \]
            </div>
<div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{\frac{dy}{dx}=\frac{x^3\sec^2(x)-3x^2\tan(x)}{x^6}}
              \]
            </div>
          </div>
        `)
      ]
    }),
    "2b": createConfig("2b", raw`Differentiating an exponential depreciation model.`, {
      questionHtml: questionImage("2b"),
      answerHtml: raw`
        <div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{-593.5\ \text{dollars/year}}
              \]
            </div>
            <p class="step-text">The negative sign means the value of the car is decreasing.</p>
          </div>
      `,
      guidedSteps: [
        guidedStep("Differentiate the value function", raw`
          <p class="step-text">Differentiate the value function with respect to time.</p>
        `, raw`
          <div class="math-block">
              \[
              V=17000e^{-0.25t}+2000e^{-0.5t}+500
              \]
              \[
              \frac{dV}{dt}
              =
              -0.25(17000)e^{-0.25t}
              -
              0.5(2000)e^{-0.5t}
              \]
            </div>
        `),
        guidedStep("Complete the solution", raw`
          <p class="step-text">Evaluate at \(t=8\).</p>
        `, raw`
          <div class="math-block">
              \[
              \left.\frac{dV}{dt}\right|_{t=8}
              =
              -0.25(17000)e^{-0.25(8)}
              -
              0.5(2000)e^{-0.5(8)}
              \]
              \[
              \left.\frac{dV}{dt}\right|_{t=8}
              \approx
              -593.5\ \text{dollars/year}
              \]
            </div>
<div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{-593.5\ \text{dollars/year}}
              \]
            </div>
            <p class="step-text">The negative sign means the value of the car is decreasing.</p>
          </div>
        `)
      ]
    }),
    "2c": createConfig("2c", raw`Product and chain rules for stationary points.`, {
      questionHtml: questionImage("2c"),
      answerHtml: raw`
        <div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{x=1\ \text{ and }\ x=\frac{1}{2}}
              \]
            </div>
          </div>
      `,
      guidedSteps: [
        guidedStep("Apply the product rule", raw`
          <p class="step-text">Differentiate with the product rule.</p>
        `, raw`
          <div class="math-block">
              \[
              f(x)=(2x-3)e^{x^2+k}
              \]
              \[
              f'(x)
              =
              2e^{x^2+k}
              +
              (2x-3)e^{x^2+k}\cdot 2x
              \]
              \[
              f'(x)=e^{x^2+k}(4x^2-6x+2)
              \]
            </div>
        `),
        guidedStep("Complete the solution", raw`
          <p class="step-text">The exponential factor is never zero, so the stationary points occur when the quadratic factor is zero.</p>
        `, raw`
          <div class="math-block">
              \[
              4x^2-6x+2=0
              \]
              \[
              x=\frac{6\pm\sqrt{36-4(4)(2)}}{8}
              \]
              \[
              x=\frac{6\pm2}{8}
              \]
              \[
              x=1,\ \frac{1}{2}
              \]
            </div>
<div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{x=1\ \text{ and }\ x=\frac{1}{2}}
              \]
            </div>
          </div>
        `)
      ]
    }),
    "2d": createConfig("2d", raw`Related rates for an angle of elevation.`, {
      questionHtml: questionImage("2d"),
      answerHtml: raw`
        <div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{\frac{dA}{dt}\approx0.0999\ \text{rad s}^{-1}}
              \]
            </div>
          </div>
      `,
      guidedSteps: [
        guidedStep("Relate height and elevation angle", raw`
          <p class="step-text">Relate the height \(h\) and angle of elevation \(A\).</p>
        `, raw`
          <div class="math-block">
              \[
              \tan(A)=\frac{h}{500}
              \]
              \[
              \sec^2(A)\frac{dA}{dt}
              =
              \frac{1}{500}\frac{dh}{dt}
              \]
            </div>
        `),
        guidedStep("Continue the working", raw`
          <p class="step-text">Use \(h=4.8t^2\) to find \(\frac{dh}{dt}\).</p>
        `, raw`
          <div class="math-block">
              \[
              h=4.8t^2
              \]
              \[
              \frac{dh}{dt}=9.6t
              \]
              \[
              \sec^2(A)\frac{dA}{dt}=\frac{9.6t}{500}
              \]
              \[
              \frac{dA}{dt}=\frac{9.6t\cos^2(A)}{500}
              \]
            </div>
        `),
        guidedStep("Continue the working", raw`
          <p class="step-text">When \(h=480\), find \(t\) and \(A\).</p>
        `, raw`
          <div class="math-block">
              \[
              480=4.8t^2
              \]
              \[
              t^2=100
              \]
              \[
              t=10
              \]
              \[
              A=\arctan\left(\frac{480}{500}\right)\approx0.7650\ \text{rad}
              \]
              \[
              \tan A=\frac{480}{500}=\frac{24}{25},
              \qquad
              \cos^2 A=\frac{625}{1201}
              \]
            </div>
        `),
        guidedStep("Complete the solution", raw`
          <p class="step-text">Substitute into the rate equation.</p>
        `, raw`
          <div class="math-block">
              \[
              \frac{dA}{dt}
              =
              \frac{9.6(10)}{500}\cdot\frac{625}{1201}
              \]
              \[
              \frac{dA}{dt}
              =
              \frac{120}{1201}
              \approx
              0.0999\ \text{rad s}^{-1}
              \]
            </div>
<div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{\frac{dA}{dt}\approx0.0999\ \text{rad s}^{-1}}
              \]
            </div>
          </div>
        `)
      ]
    }),
    "2e": createConfig("2e", raw`Parametric first and second derivatives.`, {
      questionHtml: questionImage("2e"),
      answerHtml: raw`
        <div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{P=\left(\ln\left(\frac{1}{3}\right),\frac{2}{9}\right)}
              \]
            </div>
          </div>
      `,
      guidedSteps: [
        guidedStep("Use parametric differentiation", raw`
          <p class="step-text">Find \(\frac{dy}{dx}\) using parametric differentiation.</p>
        `, raw`
          <div class="math-block">
              \[
              \frac{dx}{dt}=\frac{1}{t}
              \]
              \[
              \frac{dy}{dt}=18t^2
              \]
              \[
              \frac{dy}{dx}
              =
              \frac{\frac{dy}{dt}}{\frac{dx}{dt}}
              =
              \frac{18t^2}{1/t}
              =
              18t^3
              \]
            </div>
        `),
        guidedStep("Continue the working", raw`
          <p class="step-text">Differentiate \(\frac{dy}{dx}\) with respect to \(x\).</p>
        `, raw`
          <div class="math-block">
              \[
              \frac{d}{dt}\left(\frac{dy}{dx}\right)=54t^2
              \]
              \[
              \frac{d^2y}{dx^2}
              =
              \frac{\frac{d}{dt}\left(\frac{dy}{dx}\right)}{\frac{dx}{dt}}
              =
              \frac{54t^2}{1/t}
              =
              54t^3
              \]
            </div>
        `),
        guidedStep("Complete the solution", raw`
          <p class="step-text">Use the condition \(\frac{d^2y}{dx^2}=2\), then substitute into the parametric equations.</p>
        `, raw`
          <div class="math-block">
              \[
              54t^3=2
              \]
              \[
              t^3=\frac{1}{27}
              \]
              \[
              t=\frac{1}{3}
              \]
              \[
              x=\ln\left(\frac{1}{3}\right)
              \]
              \[
              y=6\left(\frac{1}{3}\right)^3=\frac{2}{9}
              \]
            </div>
<div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{P=\left(\ln\left(\frac{1}{3}\right),\frac{2}{9}\right)}
              \]
            </div>
          </div>
        `)
      ]
    }),
    "3a": createConfig("3a", raw`Chain rule differentiation of a logarithm.`, {
      questionHtml: questionImage("3a"),
      answerHtml: raw`
        <div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{\frac{dy}{dx}=\frac{6x}{x^2-1}}
              \]
            </div>
          </div>
      `,
      guidedSteps: [
        guidedStep("Apply the method", raw`
          <p class="step-text">Use the chain rule for the logarithm.</p>
        `, raw`
          <div class="math-block">
              \[
              y=3\ln(x^2-1)
              \]
              \[
              \frac{dy}{dx}
              =
              3\cdot\frac{1}{x^2-1}\cdot 2x
              \]
              \[
              \frac{dy}{dx}=\frac{6x}{x^2-1}
              \]
            </div>
<div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{\frac{dy}{dx}=\frac{6x}{x^2-1}}
              \]
            </div>
          </div>
        `)
      ]
    }),
    "3b": createConfig("3b", raw`Finding where a tangent has a given gradient.`, {
      questionHtml: questionImage("3b"),
      answerHtml: raw`
        <div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{x=1}
              \]
            </div>
          </div>
      `,
      guidedSteps: [
        guidedStep("Rewrite the square root as a power", raw`
          <p class="step-text">Rewrite the square root as a power and differentiate.</p>
        `, raw`
          <div class="math-block">
              \[
              f(x)=2x-2x^{1/2}
              \]
              \[
              f'(x)
              =
              2-2x^{-1/2}\cdot\frac{1}{2}
              =
              2-\frac{1}{\sqrt{x}}
              \]
            </div>
        `),
        guidedStep("Complete the solution", raw`
          <p class="step-text">Set the derivative equal to the required tangent gradient.</p>
        `, raw`
          <div class="math-block">
              \[
              1=2-\frac{1}{\sqrt{x}}
              \]
              \[
              \frac{1}{\sqrt{x}}=1
              \]
              \[
              \sqrt{x}=1
              \]
              \[
              x=1^2=1
              \]
            </div>
<div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{x=1}
              \]
            </div>
          </div>
        `)
      ]
    }),
    "3c": createConfig("3c", raw`Normal gradient and an x-intercept.`, {
      questionHtml: questionImage("3c"),
      answerHtml: raw`
        <div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{\text{The }x\text{-coordinate of }P\text{ is }5.}
              \]
            </div>
          </div>
      `,
      guidedSteps: [
        guidedStep("Find the tangent gradient", raw`
          <p class="step-text">Differentiate to find the tangent gradient at \((4,3)\).</p>
        `, raw`
          <div class="math-block">
              \[
              y=(2x+1)^{1/2}
              \]
              \[
              \frac{dy}{dx}
              =
              \frac{1}{2}(2x+1)^{-1/2}\cdot2
              =
              \frac{1}{\sqrt{2x+1}}
              \]
              \[
              \left.\frac{dy}{dx}\right|_{x=4}
              =
              \frac{1}{\sqrt{9}}
              =
              \frac{1}{3}
              \]
            </div>
        `),
        guidedStep("Continue the working", raw`
          <p class="step-text">The normal gradient is the negative reciprocal of the tangent gradient.</p>
        `, raw`
          <div class="math-block">
              \[
              m=-\left(\frac{1}{3}\right)^{-1}=-3
              \]
              \[
              y-3=-3(x-4)
              \]
              \[
              y=-3x+15
              \]
            </div>
        `),
        guidedStep("Complete the solution", raw`
          <p class="step-text">Set \(y=0\) to find the \(x\)-intercept.</p>
        `, raw`
          <div class="math-block">
              \[
              -3x+15=0
              \]
              \[
              3x=15
              \]
              \[
              x=5
              \]
            </div>
<div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{\text{The }x\text{-coordinate of }P\text{ is }5.}
              \]
            </div>
          </div>
        `)
      ]
    }),
    "3d": createConfig("3d", raw`Stationary points and second derivative classification.`, {
      questionHtml: questionImage("3d"),
      answerHtml: raw`
        <div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{x=2\text{ is a local maximum, and }x=4\text{ is a local minimum.}}
              \]
            </div>
          </div>
      `,
      guidedSteps: [
        guidedStep("Rewrite before differentiating", raw`
          <p class="step-text">Rewrite the first term and differentiate.</p>
        `, raw`
          <div class="math-block">
              \[
              y=(x-3)^{-1}+x
              \]
              \[
              \frac{dy}{dx}
              =
              -(x-3)^{-2}+1
              =
              -\frac{1}{(x-3)^2}+1
              \]
            </div>
        `),
        guidedStep("Continue the working", raw`
          <p class="step-text">At stationary points, the derivative is zero.</p>
        `, raw`
          <div class="math-block">
              \[
              0=-\frac{1}{(x-3)^2}+1
              \]
              \[
              \frac{1}{(x-3)^2}=1
              \]
              \[
              (x-3)^2=1
              \]
              \[
              x-3=\pm1
              \]
              \[
              x=4,\ 2
              \]
            </div>
        `),
        guidedStep("Complete the solution", raw`
          <p class="step-text">Use the second derivative to classify the stationary points.</p>
        `, raw`
          <div class="math-block">
              \[
              \frac{d^2y}{dx^2}
              =
              2(x-3)^{-3}
              =
              \frac{2}{(x-3)^3}
              \]
              \[
              \left.\frac{d^2y}{dx^2}\right|_{x=2}
              =
              -2
              \]
              \[
              \left.\frac{d^2y}{dx^2}\right|_{x=4}
              =
              2
              \]
            </div>
<div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{x=2\text{ is a local maximum, and }x=4\text{ is a local minimum.}}
              \]
            </div>
          </div>
        `)
      ]
    }),
    "3e": createConfig("3e", raw`Proving a differential equation using first and second derivatives.`, {
      questionHtml: questionImage("3e"),
      answerHtml: raw`
        <div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{\frac{d^2y}{dx^2}+4\frac{dy}{dx}+4y=0}
              \]
            </div>
            <p class="step-text">As required.</p>
          </div>
      `,
      guidedSteps: [
        guidedStep("Differentiate with the product rule", raw`
          <p class="step-text">Find the first derivative using the product rule.</p>
        `, raw`
          <div class="math-block">
              \[
              y=(3x+2)e^{-2x}
              \]
              \[
              \frac{dy}{dx}
              =
              3e^{-2x}
              +
              (3x+2)e^{-2x}(-2)
              \]
              \[
              \frac{dy}{dx}
              =
              e^{-2x}(3-6x-4)
              =
              e^{-2x}(-1-6x)
              \]
            </div>
        `),
        guidedStep("Continue the working", raw`
          <p class="step-text">Differentiate again using the product rule.</p>
        `, raw`
          <div class="math-block">
              \[
              \frac{d^2y}{dx^2}
              =
              -6e^{-2x}
              +
              e^{-2x}(-1-6x)(-2)
              \]
              \[
              \frac{d^2y}{dx^2}
              =
              e^{-2x}(-6+2+12x)
              =
              e^{-2x}(12x-4)
              \]
            </div>
        `),
        guidedStep("Complete the solution", raw`
          <p class="step-text">Substitute \(y\), \(\frac{dy}{dx}\), and \(\frac{d^2y}{dx^2}\) into the given expression.</p>
        `, raw`
          <div class="math-block">
              \[
              \frac{d^2y}{dx^2}+4\frac{dy}{dx}+4y
              \]
              \[
              =
              e^{-2x}(12x-4)
              +
              4e^{-2x}(-1-6x)
              +
              4(3x+2)e^{-2x}
              \]
              \[
              =
              e^{-2x}(12x-4-4-24x+12x+8)
              \]
              \[
              =
              e^{-2x}(0)
              =
              0
              \]
            </div>
<div class="answer-highlight">
            <p class="question-label">Final Answer</p>
            <div class="math-block">
              \[
              \boxed{\frac{d^2y}{dx^2}+4\frac{dy}{dx}+4y=0}
              \]
            </div>
            <p class="step-text">As required.</p>
          </div>
        `)
      ]
    })
  };
}());
