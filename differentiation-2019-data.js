(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-differentiation-2019";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const questionImageDimensions = {
    "1a": [2438, 750], "1b": [2938, 563], "1c": [2938, 657], "1d": [2938, 563], "1e": [2938, 1094],
    "2a": [2625, 813], "2b": [2938, 688], "2c": [2938, 813], "2d": [2938, 2375], "2e": [2938, 750],
    "3a": [2625, 938], "3b": [2938, 2375], "3c": [2938, 2125], "3d": [2938, 938], "3e": [2938, 2375]
  };
  const questionImageDescriptions = {
    "1a": "Scanned exam prompt asking for the derivative of a square-root function using the chain rule.",
    "1b": "Scanned exam prompt asking for the rate of change of a logarithmic function when t equals 4.",
    "1c": "Scanned exam prompt asking for the tangent gradient of a quotient at x equals 2.",
    "1d": "Scanned exam prompt asking for the x-values where a polynomial-times-exponential function is decreasing.",
    "1e": "Scanned exam prompt asking for the rate of increase of a sphere's volume from its radius and surface-area rate.",
    "2a": "Scanned exam prompt asking for the derivative of a fourth power using the chain rule.",
    "2b": "Scanned exam prompt asking for the tangent gradient of y equals tan of 2x at a specified point.",
    "2c": "Scanned exam prompt asking for the tangent gradient of a parametric curve when t equals 2.",
    "2d": "Scanned exam prompt asking for the rising speed of a 22-metre bridge arm; includes a labelled bridge diagram.",
    "2e": "Scanned exam prompt asking for a second-derivative chain-rule identity where y equals e to the u and u equals sin of 2x.",
    "3a": "Scanned exam prompt asking for the derivative of 4 divided by sin x.",
    "3b": "Scanned exam prompt with a function graph asking about stationary points, non-differentiability, and a two-sided limit.",
    "3c": "Scanned exam prompt asking for the maximum area of a rectangle under y equals 4 minus the square root of x; includes a graph.",
    "3d": "Scanned exam prompt asking when acceleration is zero for an object with an exponential velocity model.",
    "3e": "Scanned exam prompt asking for point P on y equals 2 times the square root of 36 minus x squared; includes the curve and its tangent."
  };
  const metadata = {
    topic: "Differentiation",
    year: 2019,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };
  const tags = [
    "Differentiation",
    "2019",
    "NCEA Level 3 Calculus",
    "mixed / Excellence-style"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return id + "2019.html";
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
      browserTitle: "2019 Differentiation Paper - " + questionLabel(id),
      eyebrow: "Level 3 Differentiation Walkthrough",
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

  function questionImage(id) {
    const imageDimensions = questionImageDimensions[id];
    return raw`
      <img class="question-screenshot" src="assets/differentiation-2019/${id}-question.png" width="${imageDimensions[0]}" height="${imageDimensions[1]}" alt="${questionImageDescriptions[id]}" />
    `;
  }

  function finalAnswer(html) {
    return raw`
      <div class="answer-highlight walkthrough-answer-highlight">
        <p class="question-label">Final Answer</p>
        ${html}
      </div>
    `;
  }

  window.Differentiation2019Walkthroughs = {
    "1a": createConfig("1a", raw`Chain rule differentiation of a square root.`, {
      questionHtml: questionImage("1a"),
      guidedSteps: [
        guidedStep("Rewrite the root", raw`
          <p class="step-text">Write the square root as a power before differentiating.</p>
        `, raw`
          <div class="math-block">
            \[
            y=(3x^2-1)^{\frac{1}{2}}
            \]
          </div>
        `),
        guidedStep("Differentiate with the chain rule", raw`
          <p class="step-text">Differentiate the outside power, then multiply by the derivative of \(3x^2-1\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            \frac{1}{2}(3x^2-1)^{-\frac{1}{2}}\times 6x
            \]
          </div>
        `),
        guidedStep("State the derivative", raw`
          <p class="step-text">The simplified form is optional in the PDF.</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            \frac{3x}{\sqrt{3x^2-1}}
            \quad \text{(optional)}
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{\frac{dy}{dx}
              =
              \frac{1}{2}(3x^2-1)^{-\frac{1}{2}}\times 6x}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "1b": createConfig("1b", raw`Differentiate a logarithmic function and evaluate the rate at \(t=4\).`, {
      questionHtml: questionImage("1b"),
      guidedSteps: [
        guidedStep("Differentiate the logarithm", raw`
          <p class="step-text">Use \(\frac{d}{dt}\ln(u)=\frac{u'}{u}\).</p>
        `, raw`
          <div class="math-block">
            \[
            f'(t)=\frac{5}{3t-1}\times 3
            \]
            \[
            =\frac{15}{3t-1}
            \]
          </div>
        `),
        guidedStep("Evaluate at t = 4", raw`
          <p class="step-text">Substitute \(t=4\) into the derivative.</p>
        `, raw`
          <div class="math-block">
            \[
            f'(4)=\frac{15}{11}
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{f'(4)=\frac{15}{11}}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "1c": createConfig("1c", raw`Use the quotient rule, then evaluate the tangent gradient at \(x=2\).`, {
      questionHtml: questionImage("1c"),
      guidedSteps: [
        guidedStep("Set up the quotient rule", raw`
          <p class="step-text">Differentiate the numerator \(e^{2x}\) and the denominator \(1+x^2\).</p>
        `, raw`
          <div class="math-block">
            \[
            y=\frac{e^{2x}}{1+x^2}
            \]
            \[
            \frac{dy}{dx}
            =
            \frac{2e^{2x}(1+x^2)-2xe^{2x}}{(1+x^2)^2}
            \]
          </div>
        `),
        guidedStep("Factor the derivative", raw`
          <p class="step-text">Keep the common factor \(2e^{2x}\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            \frac{2e^{2x}(1+x^2-x)}{(1+x^2)^2}
            \]
          </div>
        `),
        guidedStep("Substitute x = 2", raw`
          <p class="step-text">The tangent gradient is the derivative at the point.</p>
        `, raw`
          <div class="math-block">
            \[
            \left.\frac{dy}{dx}\right|_{x=2}
            =
            \frac{2e^4(1+2^2-2)}{(1+2^2)^2}
            =
            13.1
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{13.1}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "1d": createConfig("1d", raw`Use the product rule and solve where the derivative is negative.`, {
      questionHtml: questionImage("1d"),
      guidedSteps: [
        guidedStep("Differentiate the product", raw`
          <p class="step-text">Apply the product rule to \(x^3e^x\).</p>
        `, raw`
          <div class="math-block">
            \[
            y=x^3e^x
            \]
            \[
            \frac{dy}{dx}=3x^2e^x+x^3e^x
            \]
          </div>
        `),
        guidedStep("Factor the derivative", raw`
          <p class="step-text">Factor out \(x^2e^x\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}=x^2e^x(3+x)
            \]
          </div>
        `),
        guidedStep("Make the derivative negative", raw`
          <p class="step-text">The PDF uses the sign of \(3+x\) because \(x^2e^x\) is not negative.</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}<0
            \]
            \[
            3+x<0
            \]
            \[
            x<-3
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{x<-3}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "1e": createConfig("1e", raw`Related rates connecting surface area, radius, and volume of a sphere.`, {
      questionHtml: questionImage("1e"),
      guidedSteps: [
        guidedStep("Connect the rates", raw`
          <p class="step-text">Use the chain rule to connect volume to surface area through the radius.</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dV}{dt}
            =
            \frac{dV}{dr}\times\frac{dr}{dS}\times\frac{dS}{dt}
            \]
          </div>
        `),
        guidedStep("Differentiate volume", raw`
          <p class="step-text">Write the sphere volume and differentiate it with respect to \(r\).</p>
        `, raw`
          <div class="math-block">
            \[
            V=\frac{4}{3}\pi r^3
            \]
            \[
            \frac{dV}{dr}=4\pi r^2
            \]
          </div>
        `),
        guidedStep("Differentiate surface area", raw`
          <p class="step-text">Write the surface area and differentiate it with respect to \(r\).</p>
        `, raw`
          <div class="math-block">
            \[
            S=4\pi r^2
            \]
            \[
            \frac{dS}{dr}=8\pi r
            \]
          </div>
        `),
        guidedStep("Substitute the rate of surface area", raw`
          <p class="step-text">Use \(\frac{dr}{dS}=\frac{1}{8\pi r}\) and \(\frac{dS}{dt}=0.4\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dV}{dt}
            =
            4\pi r^2\times\frac{1}{8\pi r}\times 0.4
            \]
            \[
            \left.\frac{dV}{dt}\right|_{r=0.5}
            =
            0.1\ \text{m}^3\ \text{s}^{-1}
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{0.1\ \text{m}^3\ \text{s}^{-1}}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "2a": createConfig("2a", raw`Chain rule differentiation of a fourth power.`, {
      questionHtml: questionImage("2a"),
      guidedSteps: [
        guidedStep("Differentiate the outside and inside", raw`
          <p class="step-text">Differentiate the fourth power, then multiply by the derivative of \(2x-5\).</p>
        `, raw`
          <div class="math-block">
            \[
            y=(2x-5)^4
            \]
            \[
            \frac{dy}{dx}=4(2x-5)^3\times 2
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{\frac{dy}{dx}=4(2x-5)^3\times 2}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "2b": createConfig("2b", raw`Differentiate \(y=\tan(2x)\) and evaluate the tangent gradient.`, {
      questionHtml: questionImage("2b"),
      guidedSteps: [
        guidedStep("Differentiate the tangent function", raw`
          <p class="step-text">Use \(\frac{d}{dx}\tan(u)=u'\sec^2(u)\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}=2\sec^2(2x)
            \]
            \[
            =\frac{2}{\cos^2(2x)}
            \]
          </div>
        `),
        guidedStep("Evaluate at x = pi over 6", raw`
          <p class="step-text">Substitute the given \(x\)-value.</p>
        `, raw`
          <div class="math-block">
            \[
            \left.\frac{dy}{dx}\right|_{x=\frac{\pi}{6}}=8
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{8}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "2c": createConfig("2c", raw`Parametric differentiation and evaluating the gradient when \(t=2\).`, {
      questionHtml: questionImage("2c"),
      guidedSteps: [
        guidedStep("Rewrite and differentiate x", raw`
          <p class="step-text">Write \(x\) as a power of \(5-t\), then differentiate with respect to \(t\).</p>
        `, raw`
          <div class="math-block">
            \[
            x=(5-t)^{-2}
            \]
            \[
            \frac{dx}{dt}=\frac{2}{(5-t)^3}
            \]
          </div>
        `),
        guidedStep("Differentiate y", raw`
          <p class="step-text">Differentiate \(y=5t-t^2\) with respect to \(t\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dt}=5-2t
            \]
          </div>
        `),
        guidedStep("Form dy/dx", raw`
          <p class="step-text">Divide \(\frac{dy}{dt}\) by \(\frac{dx}{dt}\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            \frac{(5-2t)(5-t)^3}{2}
            \]
          </div>
        `),
        guidedStep("Evaluate at t = 2", raw`
          <p class="step-text">Substitute \(t=2\).</p>
        `, raw`
          <div class="math-block">
            \[
            \left.\frac{dy}{dx}\right|_{t=2}=13.5
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{13.5}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "2d": createConfig("2d", raw`Related rates for the height of a rising bridge arm.`, {
      questionHtml: questionImage("2d"),
      guidedSteps: [
        guidedStep("Relate height and angle", raw`
          <p class="step-text">Use the right triangle formed by the bridge arm and the height.</p>
        `, raw`
          <div class="math-block">
            \[
            \sin\theta=\frac{H}{22}
            \]
          </div>
        `),
        guidedStep("Differentiate with respect to time", raw`
          <p class="step-text">Differentiate both sides with respect to \(t\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{d\theta}{dt}\cos\theta
            =
            \frac{1}{22}\frac{dh}{dt}
            \]
            \[
            \frac{dh}{dt}
            =
            22\times 0.01\cos\theta
            \]
          </div>
        `),
        guidedStep("Find the angle", raw`
          <p class="step-text">Use the instant when the height is \(15\) metres.</p>
        `, raw`
          <div class="math-block">
            \[
            \theta=\arcsin\left(\frac{15}{22}\right)=0.750\ \text{rad}
            \]
          </div>
        `),
        guidedStep("Evaluate the height rate", raw`
          <p class="step-text">Substitute the angle into the rate equation.</p>
        `, raw`
          <div class="math-block">
            \[
            \left.\frac{dh}{dt}\right|_{\theta=0.750}
            =
            0.1609\ \text{m}\ \text{s}^{-1}
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{0.1609\ \text{m}\ \text{s}^{-1}}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "2e": createConfig("2e", raw`Show the second-derivative chain rule identity for \(y=e^u\), \(u=\sin 2x\).`, {
      questionHtml: questionImage("2e"),
      guidedSteps: [
        guidedStep("Differentiate directly with respect to x", raw`
          <p class="step-text">First find the first and second derivatives of \(y=e^{\sin 2x}\).</p>
        `, raw`
          <div class="math-block">
            \[
            y=e^{\sin 2x}
            \]
            \[
            \frac{dy}{dx}
            =
            e^{\sin 2x}\times 2\cos 2x
            \]
            \[
            \frac{d^2y}{dx^2}
            =
            -4\sin(2x)e^{\sin 2x}
            +
            (2\cos 2x)^2e^{\sin 2x}
            \]
          </div>
        `),
        guidedStep("Find the pieces in the identity", raw`
          <p class="step-text">Now find each derivative that appears on the right-hand side.</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{du}=e^u
            \]
            \[
            \frac{d^2y}{du^2}=e^u
            \]
            \[
            \frac{du}{dx}=2\cos 2x
            \]
            \[
            \frac{d^2u}{dx^2}=-4\sin(2x)
            \]
          </div>
        `),
        guidedStep("Substitute into the right-hand side", raw`
          <p class="step-text">Put those pieces into the expression we need to show.</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{d^2y}{du^2}\left(\frac{du}{dx}\right)^2
            +
            \left(\frac{dy}{du}\right)\left(\frac{d^2u}{dx^2}\right)
            \]
            \[
            =
            e^u(2\cos 2x)^2
            +
            e^u(-4\sin 2x)
            \]
            \[
            =
            e^{\sin 2x}(2\cos 2x)^2
            +
            e^{\sin 2x}(-4\sin 2x)
            \]
          </div>
        `),
        guidedStep("Match the direct second derivative", raw`
          <p class="step-text">The substituted right-hand side is the same expression as the direct \(\frac{d^2y}{dx^2}\).</p>
        `, raw`
          <div class="math-block">
            \[
            =
            \frac{d^2y}{dx^2}
            \]
          </div>
          ${finalAnswer(raw`
            <p class="step-text">Therefore the required identity is shown.</p>
            <div class="math-block">
              \[
              \boxed{
              \frac{d^2y}{dx^2}
              =
              \frac{d^2y}{du^2}\left(\frac{du}{dx}\right)^2
              +
              \frac{dy}{du}\frac{d^2u}{dx^2}
              }
              \]
            </div>
          `)}
        `)
      ]
    }),

    "3a": createConfig("3a", raw`Rewrite the reciprocal as cosecant and differentiate.`, {
      questionHtml: questionImage("3a"),
      guidedSteps: [
        guidedStep("Rewrite using cosecant", raw`
          <p class="step-text">The PDF rewrites \(\frac{4}{\sin x}\) as \(4\csc x\).</p>
        `, raw`
          <div class="math-block">
            \[
            y=4\csc x
            \]
          </div>
        `),
        guidedStep("Differentiate", raw`
          <p class="step-text">Use \(\frac{d}{dx}\csc x=-\csc x\cot x\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            -4\csc x\cot x
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{\frac{dy}{dx}=-4\csc x\cot x}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "3b": createConfig("3b", raw`Read stationary points, non-differentiability, and a two-sided limit from a graph.`, {
      questionHtml: questionImage("3b"),
      guidedSteps: [
        guidedStep("Find where f prime is zero", raw`
          <p class="step-text">Look for horizontal tangents and horizontal pieces of the graph.</p>
        `, raw`
          <div class="math-block">
            \[
            f'(x)=0:
            \quad
            x=2,\ x>4
            \]
          </div>
        `),
        guidedStep("Find where the graph is not differentiable", raw`
          <p class="step-text">Corners, jumps, and endpoints where the gradient changes suddenly are not differentiable.</p>
        `, raw`
          <div class="math-block">
            \[
            f(x)\ \text{is not differentiable:}
            \quad
            x=-2,\ x=1,\ x=4
            \]
          </div>
        `),
        guidedStep("Read the limit at x = 1", raw`
          <p class="step-text">Compare the value approached from the left with the value approached from the right.</p>
        `, raw`
          <div class="math-block">
            \[
            \lim_{x\to 1} f(x)
            \quad
            \text{does not exist}
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{f'(x)=0:\ x=2,\ x>4}
              \]
              \[
              \boxed{f(x)\text{ is not differentiable at }x=-2,\ x=1,\ x=4}
              \]
              \[
              \boxed{\lim_{x\to 1}f(x)\text{ does not exist}}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "3c": createConfig("3c", raw`Optimise the area of a rectangle under \(y=4-\sqrt{x}\).`, {
      questionHtml: questionImage("3c"),
      guidedSteps: [
        guidedStep("Write the area function", raw`
          <p class="step-text">The rectangle has width \(x\) and height \(y\).</p>
        `, raw`
          <div class="math-block">
            \[
            A=xy
            \]
            \[
            =x(4-x^{\frac{1}{2}})
            \]
            \[
            =4x-x^{\frac{3}{2}}
            \]
          </div>
        `),
        guidedStep("Differentiate area", raw`
          <p class="step-text">Differentiate \(A\) with respect to \(x\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dA}{dx}
            =
            4-\frac{3}{2}x^{\frac{1}{2}}
            \]
          </div>
        `),
        guidedStep("Set the derivative to zero", raw`
          <p class="step-text">At the maximum from the PDF working, set \(\frac{dA}{dx}=0\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dA}{dx}=0
            \]
            \[
            \frac{4}{3/2}=x^{\frac{1}{2}}
            \]
            \[
            x=\frac{64}{9}
            \]
          </div>
        `),
        guidedStep("Find the maximum area", raw`
          <p class="step-text">Substitute \(x=\frac{64}{9}\) into the area function.</p>
        `, raw`
          <div class="math-block">
            \[
            A=\frac{256}{27}\ \text{units}^2
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{\frac{256}{27}\ \text{units}^2}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "3d": createConfig("3d", raw`Differentiate velocity to find when acceleration is zero.`, {
      questionHtml: questionImage("3d"),
      guidedSteps: [
        guidedStep("Set acceleration to zero", raw`
          <p class="step-text">Acceleration is the derivative of velocity.</p>
        `, raw`
          <div class="math-block">
            \[
            a(t)=2e^t-8e^{-t}=0
            \]
          </div>
        `),
        guidedStep("Solve the exponential equation", raw`
          <p class="step-text">Rearrange until there is a single exponential.</p>
        `, raw`
          <div class="math-block">
            \[
            2e^t=8e^{-t}
            \]
            \[
            4=e^{2t}
            \]
            \[
            t=\ln(2)
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{t=\ln(2)}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "3e": createConfig("3e", raw`Use the tangent gradient on \(y=2\sqrt{36-x^2}\) to find point \(P\).`, {
      questionHtml: questionImage("3e"),
      guidedSteps: [
        guidedStep("Differentiate the curve", raw`
          <p class="step-text">Use the chain rule on \(y=2(36-x^2)^{1/2}\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            \frac{2}{2}(36-x^2)^{-\frac{1}{2}}\times -2x
            \]
            \[
            =
            \frac{-2x}{\sqrt{36-x^2}}
            \]
          </div>
        `),
        guidedStep("Use the tangent slope", raw`
          <p class="step-text">The tangent passes through point \(P=(x,y)\) and \((8,0)\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{y-y_1}{x-x_1}=m
            \]
            \[
            \frac{y-0}{x-8}
            =
            \frac{-2x}{\sqrt{36-x^2}}
            \]
          </div>
        `),
        guidedStep("Substitute the curve value for y", raw`
          <p class="step-text">At point \(P\), \(y=2\sqrt{36-x^2}\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{2\sqrt{36-x^2}}{x-8}
            =
            \frac{-2x}{\sqrt{36-x^2}}
            \]
          </div>
        `),
        guidedStep("Solve for x", raw`
          <p class="step-text">Cross multiply and simplify.</p>
        `, raw`
          <div class="math-block">
            \[
            2(36-x^2)=-2x(x-8)
            \]
            \[
            72-2x^2=-2x^2+16x
            \]
            \[
            72=16x
            \]
            \[
            x=\frac{72}{16}=4.5
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{x=4.5}
              \]
            </div>
          `)}
        `)
      ]
    })
  };
}());
