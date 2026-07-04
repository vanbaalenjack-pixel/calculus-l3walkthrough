(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-differentiation-2020";
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
    return id + "2020.html#question-" + id;
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

  window.Differentiation2020Walkthroughs = {
    "1a": createConfig("1a", raw`Chain rule differentiation of a fifth power.`, {
      questionHtml: raw`
        <img class="question-screenshot" src="assets/differentiation-2020/1a-question.png" alt="Question One part a prompt from the 2020 Differentiation paper" />
      `,
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
        guidedStep("Choose the method", raw`
          
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
      questionHtml: raw`
        <img class="question-screenshot" src="assets/differentiation-2020/1b-question.png" alt="Question One part b prompt from the 2020 Differentiation paper" />
      `,
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
        guidedStep("Choose the method", raw`
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
      questionHtml: raw`
        <img class="question-screenshot" src="assets/differentiation-2020/1c-question.png" alt="Question One part c prompt from the 2020 Differentiation paper" />
      `,
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
        guidedStep("Choose the method", raw`
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
      questionHtml: raw`
        <img class="question-screenshot" src="assets/differentiation-2020/1d-question.png" alt="Question One part d prompt from the 2020 Differentiation paper" />
      `,
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
        guidedStep("Choose the method", raw`
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
      questionHtml: raw`
        <img class="question-screenshot" src="assets/differentiation-2020/1e-question.png" alt="Question One part e prompt and sphere diagram from the 2020 Differentiation paper" />
      `,
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
        guidedStep("Choose the method", raw`
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
      questionHtml: raw`
        <img class="question-screenshot" src="assets/differentiation-2020/2a-question.png" alt="Question Two part a prompt from the 2020 Differentiation paper" />
      `,
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
      questionHtml: raw`
        <img class="question-screenshot" src="assets/differentiation-2020/2b-question.png" alt="Question Two part b prompt from the 2020 Differentiation paper" />
      `,
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
        guidedStep("Choose the method", raw`
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
      questionHtml: raw`
        <img class="question-screenshot" src="assets/differentiation-2020/2c-question.png" alt="Question Two part c prompt from the 2020 Differentiation paper" />
      `,
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
        guidedStep("Choose the method", raw`
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
      questionHtml: raw`
        <img class="question-screenshot" src="assets/differentiation-2020/2d-question.png" alt="Question Two part d rocket prompt and angle diagram from the 2020 Differentiation paper" />
      `,
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
        guidedStep("Choose the method", raw`
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
      questionHtml: raw`
        <img class="question-screenshot" src="assets/differentiation-2020/2e-question.png" alt="Question Two part e prompt from the 2020 Differentiation paper" />
      `,
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
        guidedStep("Choose the method", raw`
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
      questionHtml: raw`
        <img class="question-screenshot" src="assets/differentiation-2020/3a-question.png" alt="Question Three part a prompt from the 2020 Differentiation paper" />
      `,
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
      questionHtml: raw`
        <img class="question-screenshot" src="assets/differentiation-2020/3b-question.png" alt="Question Three part b prompt from the 2020 Differentiation paper" />
      `,
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
        guidedStep("Choose the method", raw`
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
      questionHtml: raw`
        <img class="question-screenshot" src="assets/differentiation-2020/3c-question.png" alt="Question Three part c prompt and graph from the 2020 Differentiation paper" />
      `,
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
        guidedStep("Choose the method", raw`
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
      questionHtml: raw`
        <img class="question-screenshot" src="assets/differentiation-2020/3d-question.png" alt="Question Three part d prompt from the 2020 Differentiation paper" />
      `,
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
        guidedStep("Choose the method", raw`
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
      questionHtml: raw`
        <img class="question-screenshot" src="assets/differentiation-2020/3e-question.png" alt="Question Three part e prompt from the 2020 Differentiation paper" />
      `,
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
        guidedStep("Choose the method", raw`
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
