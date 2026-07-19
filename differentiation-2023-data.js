(function () {
  const raw = String.raw;
  const paperHref = "level-3-differentiation-2023.html";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return id + "2023.html";
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
      browserTitle: "2023 Differentiation Paper — " + questionLabel(id),
      eyebrow: "Level 3 Differentiation Walkthrough",
      title: questionLabel(id),
      subtitle: subtitle,
      backHref: paperHref,
      nextHref: next ? pageHref(next) : paperHref,
      nextLabel: next ? "Next question →" : "Back to paper",
      finalNav: buildFinalNav(id)
    }, details);
  }

  window.Differentiation2023Walkthroughs = {
    "1a": createConfig("1a", "2023 Paper — Differentiate \\(\\sqrt{3x-2}\\)", {
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Differentiate } y=\sqrt{3x-2}.
          \]
        </div>
        <p class="step-text question-note">You do not need to simplify your answer.</p>
      `,
      hints: [
        raw`Rewrite the square root as a power of \(\frac{1}{2}\).`,
        raw`This is a chain-rule derivative, so multiply by the derivative of the inside.`,
        raw`If you want to simplify, move the negative power into a denominator and back into radical form.`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite first:</p>
        <div class="math-block">
          \[
          y=(3x-2)^{1/2}
          \]
        </div>
        <p class="step-text">Now differentiate with the chain rule:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=\frac{1}{2}(3x-2)^{-1/2}\cdot 3
          \]
          \[
          \frac{dy}{dx}=\frac{3}{2}(3x-2)^{-1/2}
          \]
          \[
          \frac{dy}{dx}=\frac{3}{2\sqrt{3x-2}}
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Rewrite the square root`,
          previewHtml: raw`Writing the square root as a power makes the chain rule much clearer.`,
          workingHtml: raw`<p class="step-text">Writing the square root as a power makes the chain rule much clearer.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                (3x-2)^{1/2}
              \]
</div>`
        },
        {
          title: raw`Differentiate with the chain rule`,
          previewHtml: raw`Differentiate the outside power, then multiply by the derivative of \(3x-2\).`,
          workingHtml: raw`<p class="step-text">Differentiate the outside power, then multiply by the derivative of \(3x-2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{dy}{dx}=\frac{1}{2}(3x-2)^{-1/2}\cdot 3
              \]
</div>`
        },
        {
          title: raw`Simplify if you want to`,
          previewHtml: raw`That is the fully simplified version, although the unsimplified chain-rule form was already acceptable.`,
          workingHtml: raw`<p class="step-text">That is the fully simplified version, although the unsimplified chain-rule form was already acceptable.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{3}{2\sqrt{3x-2}}
              \]
</div>

        <p class="step-text">Rewrite first:</p>
        <div class="math-block">
          \[
          y=(3x-2)^{1/2}
          \]
        </div>
        <p class="step-text">Now differentiate with the chain rule:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=\frac{1}{2}(3x-2)^{-1/2}\cdot 3
          \]
          \[
          \frac{dy}{dx}=\frac{3}{2}(3x-2)^{-1/2}
          \]
          \[
          \frac{dy}{dx}=\frac{3}{2\sqrt{3x-2}}
          \]
        </div>
      `
        }
      ]
    }),
    "1b": createConfig("1b", "2023 Paper — Rate of change of \\(t^2e^{2t}\\)", {
      questionHtml: raw`
        <div class="question-math">
          \[
          f(t)=t^2e^{2t}
          \]
        </div>
        <p class="step-text">Find the rate of change of the function when \(t=1.5\).</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`The function is a product of \(t^2\) and \(e^{2t}\), so start with the product rule.`,
        raw`The derivative of \(e^{2t}\) needs the chain-rule factor of \(2\).`,
        raw`After differentiating, factor the result before substituting \(t=1.5\).`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate first:</p>
        <div class="math-block">
          \[
          f'(t)=2te^{2t}+t^2e^{2t}\cdot 2
          \]
          \[
          f'(t)=2te^{2t}+2t^2e^{2t}
          \]
          \[
          f'(t)=2te^{2t}(1+t)
          \]
        </div>
        <p class="step-text">Now substitute \(t=1.5\):</p>
        <div class="math-block">
          \[
          f'(1.5)=2(1.5)e^{3}(1+1.5)
          \]
          \[
          f'(1.5)=3e^3(2.5)\approx 150.642
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Identify the main rule`,
          previewHtml: raw`The function is a product of \(t^2\) and \(e^{2t}\).`,
          workingHtml: raw`<p class="step-text">The function is a product of \(t^2\) and \(e^{2t}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Product rule
</div>`
        },
        {
          title: raw`Differentiate the product`,
          previewHtml: raw`Product rule on the outside, chain rule inside the exponential, and the factorised form is easiest to evaluate.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              f(x)=x^2\sec x
              \]
              \[
              \frac{df}{dx}=(x^2)'\sec x+x^2(\sec x)'
              \]
            </div>

<p class="step-text">Product rule on the outside, chain rule inside the exponential, and the factorised form is easiest to evaluate.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                f'(t)=2te^{2t}+2t^2e^{2t}=2te^{2t}(1+t)
              \]
</div>`
        },
        {
          title: raw`Evaluate at \(t=1.5\)`,
          previewHtml: raw`Follow the working to evaluate at \(t=1.5\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              f'(t)=2te^{2t}(1+t)
              \]
              \[
              f'(1.5)=2(1.5)e^{2(1.5)}(1+1.5)
              \]
              \[
              f'(1.5)=3e^3(2.5)
              \]
            </div>

<p class="step-text">After substituting \(t=1.5\), the derivative becomes \(3e^3(2.5)\), which evaluates to approximately \(150.642\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                150.642
              \]
</div>

        <p class="step-text">Differentiate first:</p>
        <div class="math-block">
          \[
          f'(t)=2te^{2t}+t^2e^{2t}\cdot 2
          \]
          \[
          f'(t)=2te^{2t}+2t^2e^{2t}
          \]
          \[
          f'(t)=2te^{2t}(1+t)
          \]
        </div>
        <p class="step-text">Now substitute \(t=1.5\):</p>
        <div class="math-block">
          \[
          f'(1.5)=2(1.5)e^{3}(1+1.5)
          \]
          \[
          f'(1.5)=3e^3(2.5)\approx 150.642
          \]
        </div>
      `
        }
      ]
    }),
    "1c": createConfig("1c", "2023 Paper — Parallel tangents on \\(y=\\frac{2}{(x+1)^3}\\)", {
      questionHtml: raw`
        <p class="step-text">The graph shows the curve \(y=\frac{2}{(x+1)^3}\), along with the tangent to the curve drawn at \(x=1\).</p>
        <div class="graph-frame question-graph-frame">
          <img class="graph-svg" src="assets/differentiation-2023/1c-graph.png" width="1100" height="780" alt="Graph of y equals 2 over open bracket x plus 1 close bracket cubed with a tangent at x equals 1" />
        </div>
        <p class="step-text">A second tangent to this curve is drawn which is parallel to the first tangent shown.</p>
        <p class="step-text">Find the \(x\)-coordinate of the point where this second tangent touches the curve.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Parallel tangents have the same gradient.`,
        raw`Differentiate \(y=\frac{2}{(x+1)^3}\) first, then find the gradient at \(x=1\).`,
        raw`Set the derivative equal to that same gradient and solve for the other \(x\)-value.`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate the curve:</p>
        <div class="math-block">
          \[
          y=2(x+1)^{-3}
          \]
          \[
          y'=-6(x+1)^{-4}=-\frac{6}{(x+1)^4}
          \]
        </div>
        <p class="step-text">Find the gradient at \(x=1\):</p>
        <div class="math-block">
          \[
          y'(1)=-\frac{6}{(1+1)^4}=-\frac{6}{16}=-\frac{3}{8}
          \]
        </div>
        <p class="step-text">Set the derivative equal to that gradient:</p>
        <div class="math-block">
          \[
          -\frac{6}{(x+1)^4}=-\frac{3}{8}
          \]
          \[
          (x+1)^4=16
          \]
          \[
          x+1=\pm 2
          \]
          \[
          x=1,-3
          \]
        </div>
        <p class="step-text">The second tangent touches the curve at \(x=-3\).</p>
      `,
      guidedSteps: [
        {
          title: raw`Differentiate the curve`,
          previewHtml: raw`You can get that from the chain rule or by using the quotient rule and simplifying.`,
          workingHtml: raw`<p class="step-text">You can get that from the chain rule or by using the quotient rule and simplifying.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                y'=-\frac{6}{(x+1)^4}
              \]
</div>`
        },
        {
          title: raw`Find the first tangent's gradient`,
          previewHtml: raw`Follow the working to find the first tangent's gradient.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              y'=-\frac{6}{(x+1)^4}
              \]
              \[
              y'(1)=-\frac{6}{(1+1)^4}=-\frac{6}{16}
              \]
            </div>

<p class="step-text">The substitution gives \(-\frac{6}{16}\), which simplifies to \(-\frac{3}{8}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                -\frac{3}{8}
              \]
</div>`
        },
        {
          title: raw`Find the second tangent point`,
          previewHtml: raw`The equation gives \(x=1\) and \(x=-3\); since \(x=1\) is the original tangent point, the second tangent touches at \(x=-3\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              -\frac{6}{(x+1)^4}=-\frac{3}{8}
              \]
              \[
              (x+1)^4=16
              \]
              \[
              x+1=\pm 2
              \]
            </div>

<p class="step-text">The equation gives \(x=1\) and \(x=-3\); since \(x=1\) is the original tangent point, the second tangent touches at \(x=-3\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                -3
              \]
</div>

        <p class="step-text">Differentiate the curve:</p>
        <div class="math-block">
          \[
          y=2(x+1)^{-3}
          \]
          \[
          y'=-6(x+1)^{-4}=-\frac{6}{(x+1)^4}
          \]
        </div>
        <p class="step-text">Find the gradient at \(x=1\):</p>
        <div class="math-block">
          \[
          y'(1)=-\frac{6}{(1+1)^4}=-\frac{6}{16}=-\frac{3}{8}
          \]
        </div>
        <p class="step-text">Set the derivative equal to that gradient:</p>
        <div class="math-block">
          \[
          -\frac{6}{(x+1)^4}=-\frac{3}{8}
          \]
          \[
          (x+1)^4=16
          \]
          \[
          x+1=\pm 2
          \]
          \[
          x=1,-3
          \]
        </div>
        <p class="step-text">The second tangent touches the curve at \(x=-3\).</p>
      `
        }
      ]
    }),
    "1d": createConfig("1d", "2023 Paper — Tangent to a parametric circle", {
      questionHtml: raw`
        <p class="step-text">The curve is given parametrically by</p>
        <div class="math-block">
          \[
          x=4\cos\theta
          \]
          \[
          y=4\sin\theta
          \]
        </div>
        <p class="step-text">A tangent passes through the point \(P(p,q)\) on the circle.</p>
        <p class="step-text">Show that the equation of the tangent line is</p>
        <div class="question-math">
          \[
          px+qy=p^2+q^2.
          \]
        </div>
      `,
      hints: [
        raw`Differentiate both parametric equations with respect to \(\theta\).`,
        raw`Use \(\frac{dy}{dx}=\frac{dy/d\theta}{dx/d\theta}\).`,
        raw`At the point \(P(p,q)\), replace \(x\) and \(y\) in the gradient by \(p\) and \(q\), then use point-gradient form.`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate with respect to \(\theta\):</p>
        <div class="math-block">
          \[
          \frac{dx}{d\theta}=-4\sin\theta
          \]
          \[
          \frac{dy}{d\theta}=4\cos\theta
          \]
          \[
          \frac{dy}{dx}=\frac{4\cos\theta}{-4\sin\theta}=-\frac{x}{y}
          \]
        </div>
        <p class="step-text">At the point \(P(p,q)\), the gradient is \(-\frac{p}{q}\), so</p>
        <div class="math-block">
          \[
          y-q=-\frac{p}{q}(x-p)
          \]
          \[
          qy-q^2=-px+p^2
          \]
          \[
          px+qy=p^2+q^2
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Find the parametric gradient`,
          previewHtml: raw`Since \(x=4\cos\theta\) and \(y=4\sin\theta\), the gradient simplifies neatly to \(-\frac{x}{y}\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \frac{dx}{d\theta}=-4\sin\theta
              \qquad
              \frac{dy}{d\theta}=4\cos\theta
              \]
            </div>

<p class="step-text">Since \(x=4\cos\theta\) and \(y=4\sin\theta\), the gradient simplifies neatly to \(-\frac{x}{y}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{dy}{dx}=-\frac{x}{y}
              \]
</div>`
        },
        {
          title: raw`Write the tangent in point-gradient form`,
          previewHtml: raw`The gradient at \(P(p,q)\) is \(-\frac{p}{q}\), so point-gradient form works immediately.`,
          workingHtml: raw`<p class="step-text">The gradient at \(P(p,q)\) is \(-\frac{p}{q}\), so point-gradient form works immediately.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                y-q=-\frac{p}{q}(x-p)
              \]
</div>`
        },
        {
          title: raw`Rearrange to the required form`,
          previewHtml: raw`Expanding and collecting terms gives exactly the required tangent equation.`,
          workingHtml: raw`<p class="step-text">Expanding and collecting terms gives exactly the required tangent equation.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                px+qy=p^2+q^2
              \]
</div>

        <p class="step-text">Differentiate with respect to \(\theta\):</p>
        <div class="math-block">
          \[
          \frac{dx}{d\theta}=-4\sin\theta
          \]
          \[
          \frac{dy}{d\theta}=4\cos\theta
          \]
          \[
          \frac{dy}{dx}=\frac{4\cos\theta}{-4\sin\theta}=-\frac{x}{y}
          \]
        </div>
        <p class="step-text">At the point \(P(p,q)\), the gradient is \(-\frac{p}{q}\), so</p>
        <div class="math-block">
          \[
          y-q=-\frac{p}{q}(x-p)
          \]
          \[
          qy-q^2=-px+p^2
          \]
          \[
          px+qy=p^2+q^2
          \]
        </div>
      `
        }
      ]
    }),
    "1e": createConfig("1e", "2023 Paper — Maximum triangle area on \\(y=x(x-2m)^2\\)", {
      questionHtml: raw`
        <p class="step-text">The graph of</p>
        <div class="question-math">
          \[
          y=x(x-2m)^2,\qquad m>0
          \]
        </div>
        <p class="step-text">is shown, and the total shaded area between the curve and the \(x\)-axis from \(x=0\) to \(x=2m\) is</p>
        <div class="question-math">
          \[
          A=\frac{4m^4}{3}.
          \]
        </div>
        <p class="step-text">A right-angled triangle is constructed with one vertex at \((0,0)\) and another on the curve.</p>
        <p class="step-text">Show that the maximum area of such a triangle is \(\frac{3}{8}\) of the total shaded area.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem. You do not have to prove that the area you found is a maximum.</p>
      `,
      hints: [
        raw`If the point on the curve is \((x,y)\), then the triangle area is \(\frac{1}{2}xy\).`,
        raw`Substitute \(y=x(x-2m)^2\) to make the area a function of \(x\) only.`,
        raw`Differentiate, solve \(A'(x)=0\), and compare the resulting maximum area with \(\frac{4m^4}{3}\).`
      ],
      answerHtml: raw`
        <p class="step-text">The triangle area is</p>
        <div class="math-block">
          \[
          A=\frac{1}{2}xy=\frac{1}{2}x\big(x(x-2m)^2\big)=\frac{x^2}{2}(x-2m)^2
          \]
        </div>
        <p class="step-text">Differentiate and factor:</p>
        <div class="math-block">
          \[
          A'=x(x-2m)^2+x^2(x-2m)
          \]
          \[
          A'=2x(x-m)(x-2m)
          \]
        </div>
        <p class="step-text">Inside the interval \(0\le x\le 2m\), the non-zero maximum occurs at \(x=m\), so</p>
        <div class="math-block">
          \[
          A_{\max}=\frac{m^2}{2}(m-2m)^2=\frac{m^4}{2}
          \]
        </div>
        <p class="step-text">Now compare with the total shaded area:</p>
        <div class="math-block">
          \[
          \frac{3}{8}\cdot \frac{4m^4}{3}=\frac{m^4}{2}=A_{\max}
          \]
        </div>
        <p class="step-text">So the maximum triangle area is \(\frac{3}{8}\) of the total shaded area.</p>
      `,
      guidedSteps: [
        {
          title: raw`Write the triangle area in terms of \(x\)`,
          previewHtml: raw`Start from \(\frac{1}{2}xy\), then substitute \(y=x(x-2m)^2\).`,
          workingHtml: raw`<p class="step-text">Start from \(\frac{1}{2}xy\), then substitute \(y=x(x-2m)^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                A=\frac{x^2}{2}(x-2m)^2
              \]
</div>`
        },
        {
          title: raw`Find the useful critical point`,
          previewHtml: raw`The endpoints \(x=0\) and \(x=2m\) give zero area, so the non-zero maximum occurs at \(x=m\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              A'=2x(x-m)(x-2m)
              \]
            </div>

<p class="step-text">The endpoints \(x=0\) and \(x=2m\) give zero area, so the non-zero maximum occurs at \(x=m\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x=m
              \]
</div>`
        },
        {
          title: raw`Compare with the total shaded area`,
          previewHtml: raw`Substituting \(x=m\) gives \(A_{\max}=\frac{m^4}{2}\), and that is exactly \(\frac{3}{8}\) of the total shaded area.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              A(x)=\frac{x^2}{2}(x-2m)^2
              \]
              \[
              A(m)=\frac{m^2}{2}(m-2m)^2=\frac{m^2}{2}(-m)^2=\frac{m^4}{2}
              \]
              \[
              \frac{3}{8}\left(\frac{4m^4}{3}\right)=\frac{m^4}{2}
              \]
            </div>

<p class="step-text">Substituting \(x=m\) gives \(A_{\max}=\frac{m^4}{2}\), and that is exactly \(\frac{3}{8}\) of the total shaded area.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                A_{\max}=\frac{m^4}{2}=\frac{3}{8}\left(\frac{4m^4}{3}\right)
              \]
</div>

        <p class="step-text">The triangle area is</p>
        <div class="math-block">
          \[
          A=\frac{1}{2}xy=\frac{1}{2}x\big(x(x-2m)^2\big)=\frac{x^2}{2}(x-2m)^2
          \]
        </div>
        <p class="step-text">Differentiate and factor:</p>
        <div class="math-block">
          \[
          A'=x(x-2m)^2+x^2(x-2m)
          \]
          \[
          A'=2x(x-m)(x-2m)
          \]
        </div>
        <p class="step-text">Inside the interval \(0\le x\le 2m\), the non-zero maximum occurs at \(x=m\), so</p>
        <div class="math-block">
          \[
          A_{\max}=\frac{m^2}{2}(m-2m)^2=\frac{m^4}{2}
          \]
        </div>
        <p class="step-text">Now compare with the total shaded area:</p>
        <div class="math-block">
          \[
          \frac{3}{8}\cdot \frac{4m^4}{3}=\frac{m^4}{2}=A_{\max}
          \]
        </div>
        <p class="step-text">So the maximum triangle area is \(\frac{3}{8}\) of the total shaded area.</p>
      `
        }
      ]
    }),
    "2a": createConfig("2a", "2023 Paper — Differentiate \\(\\frac{x^2}{\\cos x}\\)", {
      questionHtml: raw`
        <div class="question-math">
          \[
          f(x)=\frac{x^2}{\cos x}
          \]
        </div>
        <p class="step-text">Differentiate \(f(x)\).</p>
        <p class="step-text question-note">You do not need to simplify your answer.</p>
      `,
      hints: [
        raw`Rewrite \(\frac{1}{\cos x}\) as \(\sec x\).`,
        raw`After rewriting, the product rule becomes the easiest method.`,
        raw`The derivative of \(\sec x\) is \(\sec x\tan x\).`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite first:</p>
        <div class="math-block">
          \[
          f(x)=x^2\sec x
          \]
        </div>
        <p class="step-text">Now use the product rule:</p>
        <div class="math-block">
          \[
          \frac{df}{dx}=2x\sec x+x^2\sec x\tan x
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Rewrite the function`,
          previewHtml: raw`That rewrite makes the derivative a straightforward product-rule question.`,
          workingHtml: raw`<p class="step-text">That rewrite makes the derivative a straightforward product-rule question.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                f(x)=x^2\sec x
              \]
</div>`
        },
        {
          title: raw`Differentiate the product`,
          previewHtml: raw`Product rule on \(x^2\sec x\) gives exactly that.`,
          workingHtml: raw`<p class="step-text">Product rule on \(x^2\sec x\) gives exactly that.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{df}{dx}=2x\sec x+x^2\sec x\tan x
              \]
</div>

        <p class="step-text">Rewrite first:</p>
        <div class="math-block">
          \[
          f(x)=x^2\sec x
          \]
        </div>
        <p class="step-text">Now use the product rule:</p>
        <div class="math-block">
          \[
          \frac{df}{dx}=2x\sec x+x^2\sec x\tan x
          \]
        </div>
      `
        }
      ]
    }),
    "2b": createConfig("2b", "2023 Paper — Gradient of the tangent to \\(y=\\cot(2x)\\)", {
      questionHtml: raw`
        <p class="step-text">Find the gradient of the tangent to the curve \(y=\cot(2x)\) at the point where</p>
        <div class="question-math">
          \[
          x=\frac{\pi}{12}.
          \]
        </div>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`The derivative of \(\cot u\) is \(-\csc^2(u)\cdot u'\).`,
        raw`Here the inside function is \(u=2x\).`,
        raw`After differentiating, substitute \(x=\frac{\pi}{12}\), so \(2x=\frac{\pi}{6}\).`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate using the chain rule:</p>
        <div class="math-block">
          \[
          y'=-\csc^2(2x)\cdot 2=-2\csc^2(2x)
          \]
        </div>
        <p class="step-text">Now evaluate at \(x=\frac{\pi}{12}\):</p>
        <div class="math-block">
          \[
          y'\left(\frac{\pi}{12}\right)=-2\csc^2\left(\frac{\pi}{6}\right)
          \]
          \[
          y'\left(\frac{\pi}{12}\right)=-2(2^2)=-8
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Differentiate the curve`,
          previewHtml: raw`The chain rule adds the factor of \(2\) from differentiating \(2x\).`,
          workingHtml: raw`<p class="step-text">The chain rule adds the factor of \(2\) from differentiating \(2x\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                y'=-2\csc^2(2x)
              \]
</div>`
        },
        {
          title: raw`Evaluate the gradient`,
          previewHtml: raw`Since \(\csc\left(\frac{\pi}{6}\right)=2\), the substitution gives \(-2(2^2)=-8\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              y'=-2\csc^2(2x)
              \]
              \[
              y'\left(\frac{\pi}{12}\right)=-2\csc^2\left(2\cdot \frac{\pi}{12}\right)
              \]
              \[
              y'\left(\frac{\pi}{12}\right)=-2\csc^2\left(\frac{\pi}{6}\right)
              \]
            </div>

<p class="step-text">Since \(\csc\left(\frac{\pi}{6}\right)=2\), the substitution gives \(-2(2^2)=-8\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                -8
              \]
</div>

        <p class="step-text">Differentiate using the chain rule:</p>
        <div class="math-block">
          \[
          y'=-\csc^2(2x)\cdot 2=-2\csc^2(2x)
          \]
        </div>
        <p class="step-text">Now evaluate at \(x=\frac{\pi}{12}\):</p>
        <div class="math-block">
          \[
          y'\left(\frac{\pi}{12}\right)=-2\csc^2\left(\frac{\pi}{6}\right)
          \]
          \[
          y'\left(\frac{\pi}{12}\right)=-2(2^2)=-8
          \]
        </div>
      `
        }
      ]
    }),
    "2c": createConfig("2c", "2023 Paper — Horizontal tangents on \\(\\frac{e^x}{x^2+2x}\\)", {
      questionHtml: raw`
        <div class="question-math">
          \[
          f(x)=\frac{e^x}{x^2+2x}
          \]
        </div>
        <p class="step-text">Find the \(x\)-value(s) of any point(s) on the curve where the tangent to the curve is parallel to the \(x\)-axis.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`A tangent parallel to the \(x\)-axis means \(f'(x)=0\).`,
        raw`Use the quotient rule, then simplify the numerator as much as possible.`,
        raw`Because \(e^x\) is never zero, the important equation comes from the remaining factor in the numerator.`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate with the quotient rule:</p>
        <div class="math-block">
          \[
          f'(x)=\frac{e^x(x^2+2x)-(2x+2)e^x}{(x^2+2x)^2}
          \]
          \[
          f'(x)=\frac{e^x(x^2-2)}{(x^2+2x)^2}
          \]
        </div>
        <p class="step-text">For a horizontal tangent, set the derivative equal to zero:</p>
        <div class="math-block">
          \[
          e^x(x^2-2)=0
          \]
          \[
          x^2-2=0
          \]
          \[
          x=\pm \sqrt{2}
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Simplify the derivative`,
          previewHtml: raw`After using the quotient rule, the numerator simplifies to \(e^x(x^2-2)\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              f'(x)=\frac{(x^2+2x)e^x-(2x+2)e^x}{(x^2+2x)^2}
              \]
              \[
              f'(x)=\frac{e^x\big((x^2+2x)-(2x+2)\big)}{(x^2+2x)^2}
              \]
            </div>

<p class="step-text">After using the quotient rule, the numerator simplifies to \(e^x(x^2-2)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                f'(x)=\frac{e^x(x^2-2)}{(x^2+2x)^2}
              \]
</div>`
        },
        {
          title: raw`Solve for the horizontal tangents`,
          previewHtml: raw`Because \(e^x\) is never zero, the equation reduces to \(x^2-2=0\), so \(x=\pm\sqrt{2}\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              0=\frac{e^x(x^2-2)}{(x^2+2x)^2}
              \]
              \[
              e^x(x^2-2)=0
              \]
              \[
              x^2-2=0
              \]
            </div>

<p class="step-text">Because \(e^x\) is never zero, the equation reduces to \(x^2-2=0\), so \(x=\pm\sqrt{2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x=\pm \sqrt{2}
              \]
</div>

        <p class="step-text">Differentiate with the quotient rule:</p>
        <div class="math-block">
          \[
          f'(x)=\frac{e^x(x^2+2x)-(2x+2)e^x}{(x^2+2x)^2}
          \]
          \[
          f'(x)=\frac{e^x(x^2-2)}{(x^2+2x)^2}
          \]
        </div>
        <p class="step-text">For a horizontal tangent, set the derivative equal to zero:</p>
        <div class="math-block">
          \[
          e^x(x^2-2)=0
          \]
          \[
          x^2-2=0
          \]
          \[
          x=\pm \sqrt{2}
          \]
        </div>
      `
        }
      ]
    }),
    "2d": createConfig("2d", "2023 Paper — Point of inflection of \\(3x^2\\ln x\\)", {
      questionHtml: raw`
        <div class="question-math">
          \[
          f(x)=3x^2\ln x
          \]
        </div>
        <p class="step-text">Find the \(x\)-value(s) of any points of inflection on the graph of the function.</p>
        <p class="step-text question-note">You can assume that your point(s) found are actually point(s) of inflection. You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Differentiate once with the product rule before finding the second derivative.`,
        raw`The point(s) of inflection come from solving \(f''(x)=0\).`,
        raw`After simplifying, the equation becomes logarithmic.`
      ],
      answerHtml: raw`
        <p class="step-text">First derivative:</p>
        <div class="math-block">
          \[
          f'(x)=6x\ln x+3x=3x(1+2\ln x)
          \]
        </div>
        <p class="step-text">Second derivative:</p>
        <div class="math-block">
          \[
          f''(x)=3(1+2\ln x)+3x\left(\frac{2}{x}\right)
          \]
          \[
          f''(x)=9+6\ln x=6\left(\frac{3}{2}+\ln x\right)
          \]
        </div>
        <p class="step-text">Set the second derivative equal to zero:</p>
        <div class="math-block">
          \[
          9+6\ln x=0
          \]
          \[
          6\ln x=-9
          \]
          \[
          \frac{3}{2}+\ln x=0
          \]
          \[
          \ln x=-\frac{3}{2}
          \]
          \[
          x=e^{-3/2}
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Differentiate once`,
          previewHtml: raw`Product rule on \(3x^2\ln x\) gives a factorable first derivative.`,
          workingHtml: raw`<p class="step-text">Product rule on \(3x^2\ln x\) gives a factorable first derivative.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                f'(x)=6x\ln x+3x=3x(1+2\ln x)
              \]
</div>`
        },
        {
          title: raw`Find the second derivative`,
          previewHtml: raw`Follow the working to find the second derivative.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              f'(x)=3x(1+2\ln x)
              \]
              \[
              f''(x)=3(1+2\ln x)+3x\left(\frac{2}{x}\right)
              \]
              \[
              f''(x)=3+6\ln x+6=9+6\ln x
              \]
            </div>

<p class="step-text">Product rule gives \(3(1+2\ln x)+3x\left(\frac{2}{x}\right)\), which simplifies to \(9+6\ln x\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                f''(x)=9+6\ln x
              \]
</div>`
        },
        {
          title: raw`Solve for the inflection point`,
          previewHtml: raw`Once \(\ln x=-\frac{3}{2}\), exponentiating both sides gives \(x=e^{-3/2}\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              9+6\ln x=0
              \]
              \[
              6\ln x=-9
              \]
              \[
              \ln x=-\frac{3}{2}
              \]
            </div>

<p class="step-text">Once \(\ln x=-\frac{3}{2}\), exponentiating both sides gives \(x=e^{-3/2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                e^{-3/2}
              \]
</div>

        <p class="step-text">First derivative:</p>
        <div class="math-block">
          \[
          f'(x)=6x\ln x+3x=3x(1+2\ln x)
          \]
        </div>
        <p class="step-text">Second derivative:</p>
        <div class="math-block">
          \[
          f''(x)=3(1+2\ln x)+3x\left(\frac{2}{x}\right)
          \]
          \[
          f''(x)=9+6\ln x=6\left(\frac{3}{2}+\ln x\right)
          \]
        </div>
        <p class="step-text">Set the second derivative equal to zero:</p>
        <div class="math-block">
          \[
          9+6\ln x=0
          \]
          \[
          6\ln x=-9
          \]
          \[
          \frac{3}{2}+\ln x=0
          \]
          \[
          \ln x=-\frac{3}{2}
          \]
          \[
          x=e^{-3/2}
          \]
        </div>
      `
        }
      ]
    }),
    "2e": createConfig("2e", "2023 Paper — Helicopter related rates", {
      questionHtml: raw`
        <p class="step-text">A police helicopter is flying above a straight horizontal section of motorway chasing a speeding car.</p>
        <p class="step-text">The helicopter is flying at a constant speed of \(72\text{ m s}^{-1}\) and at a constant height of \(400\) metres above the ground.</p>
        <p class="step-text">When the direct distance from the helicopter to the car is \(2500\) metres, the angle of depression \(\theta\) between the horizontal and the line of sight from the helicopter to the car is increasing at a rate of \(0.002\text{ rad s}^{-1}\).</p>
        <p class="step-text">Calculate the speed of the car at this instant.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Let \(x\) be the horizontal distance from the helicopter to the car, so \(\tan\theta=\frac{400}{x}\).`,
        raw`Differentiate implicitly with respect to time.`,
        raw`The relative horizontal closing speed is not the car speed yet; compare it with the helicopter's speed of \(72\text{ m s}^{-1}\).`
      ],
      answerHtml: raw`
        <p class="step-text">Let \(x\) be the horizontal distance between the helicopter and the car. Then</p>
        <div class="math-block">
          \[
          \tan\theta=\frac{400}{x}
          \]
        </div>
        <p class="step-text">Differentiate with respect to time:</p>
        <div class="math-block">
          \[
          \sec^2\theta\frac{d\theta}{dt}=-\frac{400}{x^2}\frac{dx}{dt}
          \]
        </div>
        <p class="step-text">At the given instant, the direct distance is \(2500\), so</p>
        <div class="math-block">
          \[
          x^2=2500^2-400^2
          \]
          \[
          \theta=\sin^{-1}\left(\frac{400}{2500}\right)\approx 0.1607
          \]
        </div>
        <p class="step-text">Substitute into the related-rates equation:</p>
        <div class="math-block">
          \[
          \sec^2(0.1607)(0.002)=-\frac{400}{x^2}\frac{dx}{dt}
          \]
          \[
          \frac{dx}{dt}=-31.25\text{ m s}^{-1}
          \]
        </div>
        <p class="step-text">That is the horizontal closing rate, so the car's speed is</p>
        <div class="math-block">
          \[
          72-31.25=40.75\text{ m s}^{-1}.
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Link the angle and the horizontal distance`,
          previewHtml: raw`The opposite side is the constant height \(400\), and the adjacent side is the horizontal distance \(x\).`,
          workingHtml: raw`<p class="step-text">The opposite side is the constant height \(400\), and the adjacent side is the horizontal distance \(x\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \tan\theta=\frac{400}{x}
              \]
</div>`
        },
        {
          title: raw`Find the horizontal closing speed`,
          previewHtml: raw`Solving the substituted equation gives \(\frac{dx}{dt}=-31.25\text{ m s}^{-1}\), and the negative sign shows the horizontal distance is shrinking.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \sec^2\theta\frac{d\theta}{dt}=-\frac{400}{x^2}\frac{dx}{dt}
              \]
              \[
              x^2=2500^2-400^2,\qquad \theta=\sin^{-1}\left(\frac{400}{2500}\right)
              \]
              \[
              0.002\sec^2(0.1607)=-\frac{400}{2500^2-400^2}\frac{dx}{dt}
              \]
            </div>

<p class="step-text">Solving the substituted equation gives \(\frac{dx}{dt}=-31.25\text{ m s}^{-1}\), and the negative sign shows the horizontal distance is shrinking.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                -31.25\text{ m s}^{-1}
              \]
</div>`
        },
        {
          title: raw`Convert to the car's speed`,
          previewHtml: raw`The helicopter travels at \(72\text{ m s}^{-1}\), and the gap closes at \(31.25\text{ m s}^{-1}\), so the car must be travelling at \(40.75\text{ m s}^{-1}\).`,
          workingHtml: raw`<p class="step-text">The helicopter travels at \(72\text{ m s}^{-1}\), and the gap closes at \(31.25\text{ m s}^{-1}\), so the car must be travelling at \(40.75\text{ m s}^{-1}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                40.75\text{ m s}^{-1}
              \]
</div>

        <p class="step-text">Let \(x\) be the horizontal distance between the helicopter and the car. Then</p>
        <div class="math-block">
          \[
          \tan\theta=\frac{400}{x}
          \]
        </div>
        <p class="step-text">Differentiate with respect to time:</p>
        <div class="math-block">
          \[
          \sec^2\theta\frac{d\theta}{dt}=-\frac{400}{x^2}\frac{dx}{dt}
          \]
        </div>
        <p class="step-text">At the given instant, the direct distance is \(2500\), so</p>
        <div class="math-block">
          \[
          x^2=2500^2-400^2
          \]
          \[
          \theta=\sin^{-1}\left(\frac{400}{2500}\right)\approx 0.1607
          \]
        </div>
        <p class="step-text">Substitute into the related-rates equation:</p>
        <div class="math-block">
          \[
          \sec^2(0.1607)(0.002)=-\frac{400}{x^2}\frac{dx}{dt}
          \]
          \[
          \frac{dx}{dt}=-31.25\text{ m s}^{-1}
          \]
        </div>
        <p class="step-text">That is the horizontal closing rate, so the car's speed is</p>
        <div class="math-block">
          \[
          72-31.25=40.75\text{ m s}^{-1}.
          \]
        </div>
      `
        }
      ]
    }),
    "3a": createConfig("3a", "2023 Paper — Differentiate \\(\\ln(x^2-x^4+1)\\)", {
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Differentiate } y=\ln(x^2-x^4+1).
          \]
        </div>
        <p class="step-text question-note">You do not need to simplify your answer.</p>
      `,
      hints: [
        raw`For \(y=\ln(u)\), the derivative is \(\frac{u'}{u}\).`,
        raw`Differentiate the inside bracket \(x^2-x^4+1\) carefully.`,
        raw`Then place that derivative over the original inside expression.`
      ],
      answerHtml: raw`
        <p class="step-text">Use the chain rule for logarithms:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=\frac{1}{x^2-x^4+1}\cdot (2x-4x^3)
          \]
          \[
          \frac{dy}{dx}=\frac{2x-4x^3}{x^2-x^4+1}
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Differentiate the inside first`,
          previewHtml: raw`Differentiate term by term before using the logarithm rule.`,
          workingHtml: raw`<p class="step-text">Differentiate term by term before using the logarithm rule.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                2x-4x^3
              \]
</div>`
        },
        {
          title: raw`Build the logarithmic derivative`,
          previewHtml: raw`For \(\ln(u)\), the derivative is \(\frac{u'}{u}\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              u=x^2-x^4+1
              \]
              \[
              \frac{dy}{dx}=\frac{u'}{u}
              \]
            </div>

<p class="step-text">For \(\ln(u)\), the derivative is \(\frac{u'}{u}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{dy}{dx}=\frac{2x-4x^3}{x^2-x^4+1}
              \]
</div>

        <p class="step-text">Use the chain rule for logarithms:</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=\frac{1}{x^2-x^4+1}\cdot (2x-4x^3)
          \]
          \[
          \frac{dy}{dx}=\frac{2x-4x^3}{x^2-x^4+1}
          \]
        </div>
      `
        }
      ]
    }),
    "3b": createConfig("3b", "2023 Paper — Read continuity, derivatives, and a limit from a graph", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(y=f(x)\).</p>
        <div class="graph-frame question-graph-frame">
          <img class="graph-svg" src="assets/differentiation-2023/3b-graph.png" width="1060" height="620" alt="Graph of a piecewise function with open circles, turning points, and a V shape on the right" />
        </div>
        <div class="question-math">
          \[
          \text{(i) Find the value(s) of }x\text{ where }f(x)\text{ is continuous but not differentiable.}
          \]
          \[
          \text{(ii) Find the value(s) of }x\text{ where }f'(x)=0\text{ and }f''(x)&lt;0\text{ are both true.}
          \]
          \[
          \text{(iii) What is the value of }\lim_{x\to 6}f(x)\text{?}
          \]
        </div>
      `,
      hints: [
        raw`Continuous but not differentiable means the graph is joined up but has a sharp corner.`,
        raw`The conditions \(f'(x)=0\) and \(f''(x)&lt;0\) describe a local maximum.`,
        raw`For the limit at \(x=6\), compare the left-hand and right-hand behaviour from the graph.`
      ],
      answerHtml: raw`
        <p class="step-text">Reading directly from the graph:</p>
        <div class="math-block">
          \[
          \text{(i) }x=8
          \]
          \[
          \text{(ii) }x=-4
          \]
          \[
          \text{(iii) }\lim_{x\to 6}f(x)\text{ does not exist}
          \]
        </div>
        <p class="step-text">At \(x=8\) the graph is continuous but has a sharp corner, so it is not differentiable there. At \(x=-4\) there is a smooth local maximum, so \(f'(x)=0\) and \(f''(x)&lt;0\). The left- and right-hand values near \(x=6\) approach different numbers, so the limit does not exist.</p>
      `,
      guidedSteps: [
        {
          title: raw`Find the continuous corner`,
          previewHtml: raw`The graph meets at \(x=8\), but it does so with a sharp corner.`,
          workingHtml: raw`<p class="step-text">The graph meets at \(x=8\), but it does so with a sharp corner.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x=8
              \]
</div>`
        },
        {
          title: raw`Find the local maximum`,
          previewHtml: raw`The graph has a smooth turning point there, and it is a local maximum, so the second derivative is negative.`,
          workingHtml: raw`<p class="step-text">The graph has a smooth turning point there, and it is a local maximum, so the second derivative is negative.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x=-4
              \]
</div>`
        },
        {
          title: raw`Read the limit at \(x=6\)`,
          previewHtml: raw`The left-hand side approaches \(2\), while the right-hand side approaches \(5\), so the two-sided limit does not exist.`,
          workingHtml: raw`<p class="step-text">The left-hand side approaches \(2\), while the right-hand side approaches \(5\), so the two-sided limit does not exist.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \text{Does not exist}
              \]
</div>

        <p class="step-text">Reading directly from the graph:</p>
        <div class="math-block">
          \[
          \text{(i) }x=8
          \]
          \[
          \text{(ii) }x=-4
          \]
          \[
          \text{(iii) }\lim_{x\to 6}f(x)\text{ does not exist}
          \]
        </div>
        <p class="step-text">At \(x=8\) the graph is continuous but has a sharp corner, so it is not differentiable there. At \(x=-4\) there is a smooth local maximum, so \(f'(x)=0\) and \(f''(x)&lt;0\). The left- and right-hand values near \(x=6\) approach different numbers, so the limit does not exist.</p>
      `
        }
      ]
    }),
    "3c": createConfig("3c", "2023 Paper — Ferris wheel normal gradient", {
      questionHtml: raw`
        <p class="step-text">Char goes for a ride on a Ferris wheel. As she rotates around, her position can be described by the pair of parametric equations</p>
        <div class="question-math">
          \[
          x=5\sqrt{2}\sin\left(\frac{\pi t}{5}\right)
          \]
          \[
          y=10-5\sqrt{2}\cos\left(\frac{\pi t}{5}\right)
          \]
        </div>
        <p class="step-text">where \(t\) is time, in seconds, from the start of the ride.</p>
        <p class="step-text">Find the gradient of the normal to this curve at the point when \(t=6.25\) seconds.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Differentiate \(x\) and \(y\) with respect to \(t\) first.`,
        raw`Use \(\frac{dy}{dx}=\frac{dy/dt}{dx/dt}\).`,
        raw`Once you have the tangent gradient, take the negative reciprocal to get the normal gradient.`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate with respect to \(t\):</p>
        <div class="math-block">
          \[
          \frac{dx}{dt}=5\sqrt{2}\cos\left(\frac{\pi t}{5}\right)\cdot \frac{\pi}{5}=\pi\sqrt{2}\cos\left(\frac{\pi t}{5}\right)
          \]
          \[
          \frac{dy}{dt}=5\sqrt{2}\sin\left(\frac{\pi t}{5}\right)\cdot \frac{\pi}{5}=\pi\sqrt{2}\sin\left(\frac{\pi t}{5}\right)
          \]
        </div>
        <p class="step-text">So the tangent gradient is</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=\frac{\pi\sqrt{2}\sin\left(\frac{\pi t}{5}\right)}{\pi\sqrt{2}\cos\left(\frac{\pi t}{5}\right)}=\tan\left(\frac{\pi t}{5}\right)
          \]
        </div>
        <p class="step-text">At \(t=6.25\),</p>
        <div class="math-block">
          \[
          \tan\left(\frac{\pi(6.25)}{5}\right)=\tan\left(\frac{5\pi}{4}\right)=1
          \]
        </div>
        <p class="step-text">So the normal gradient is the negative reciprocal:</p>
        <div class="math-block">
          \[
          m_{\text{normal}}=-1
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Find the tangent gradient`,
          previewHtml: raw`The common factor of \(\pi\sqrt{2}\) cancels out.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \frac{dx}{dt}=\pi\sqrt{2}\cos\left(\frac{\pi t}{5}\right)
              \qquad
              \frac{dy}{dt}=\pi\sqrt{2}\sin\left(\frac{\pi t}{5}\right)
              \]
            </div>

<p class="step-text">The common factor of \(\pi\sqrt{2}\) cancels out.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{dy}{dx}=\tan\left(\frac{\pi t}{5}\right)
              \]
</div>`
        },
        {
          title: raw`Evaluate the tangent gradient at \(t=6.25\)`,
          previewHtml: raw`Substituting \(t=6.25\) gives the angle \(\frac{5\pi}{4}\), and \(\tan\left(\frac{5\pi}{4}\right)=1\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \frac{dy}{dx}=\tan\left(\frac{\pi t}{5}\right)
              \]
              \[
              \frac{dy}{dx}\Bigg|_{t=6.25}=\tan\left(\frac{\pi(6.25)}{5}\right)
              \]
              \[
              \frac{dy}{dx}\Bigg|_{t=6.25}=\tan\left(\frac{5\pi}{4}\right)
              \]
            </div>

<p class="step-text">Substituting \(t=6.25\) gives the angle \(\frac{5\pi}{4}\), and \(\tan\left(\frac{5\pi}{4}\right)=1\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                1
              \]
</div>`
        },
        {
          title: raw`Find the normal gradient`,
          previewHtml: raw`The normal gradient is the negative reciprocal of the tangent gradient, so it is \(-1\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              m_{\text{tangent}}=1
              \]
              \[
              m_{\text{normal}}=-\frac{1}{m_{\text{tangent}}}=-\frac{1}{1}
              \]
            </div>

<p class="step-text">The normal gradient is the negative reciprocal of the tangent gradient, so it is \(-1\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                -1
              \]
</div>

        <p class="step-text">Differentiate with respect to \(t\):</p>
        <div class="math-block">
          \[
          \frac{dx}{dt}=5\sqrt{2}\cos\left(\frac{\pi t}{5}\right)\cdot \frac{\pi}{5}=\pi\sqrt{2}\cos\left(\frac{\pi t}{5}\right)
          \]
          \[
          \frac{dy}{dt}=5\sqrt{2}\sin\left(\frac{\pi t}{5}\right)\cdot \frac{\pi}{5}=\pi\sqrt{2}\sin\left(\frac{\pi t}{5}\right)
          \]
        </div>
        <p class="step-text">So the tangent gradient is</p>
        <div class="math-block">
          \[
          \frac{dy}{dx}=\frac{\pi\sqrt{2}\sin\left(\frac{\pi t}{5}\right)}{\pi\sqrt{2}\cos\left(\frac{\pi t}{5}\right)}=\tan\left(\frac{\pi t}{5}\right)
          \]
        </div>
        <p class="step-text">At \(t=6.25\),</p>
        <div class="math-block">
          \[
          \tan\left(\frac{\pi(6.25)}{5}\right)=\tan\left(\frac{5\pi}{4}\right)=1
          \]
        </div>
        <p class="step-text">So the normal gradient is the negative reciprocal:</p>
        <div class="math-block">
          \[
          m_{\text{normal}}=-1
          \]
        </div>
      `
        }
      ]
    }),
    "3d": createConfig("3d", "2023 Paper — Stationary points of \\(\\frac{1}{x}-\\frac{2}{x^3}\\)", {
      questionHtml: raw`
        <div class="question-math">
          \[
          f(x)=\frac{1}{x}-\frac{2}{x^3}
          \]
        </div>
        <p class="step-text">Find the coordinates of any stationary points on the graph of the function, identifying their nature.</p>
        <p class="step-text question-note">You must use calculus and show any derivatives that you need to find when solving this problem.</p>
      `,
      hints: [
        raw`Write the function in negative powers if that makes differentiating easier.`,
        raw`Stationary points happen when \(f'(x)=0\).`,
        raw`Use the second derivative to classify the stationary points, then substitute the \(x\)-values back into the original function.`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate:</p>
        <div class="math-block">
          \[
          f(x)=x^{-1}-2x^{-3}
          \]
          \[
          f'(x)=-x^{-2}+6x^{-4}
          \]
        </div>
        <p class="step-text">Set the derivative equal to zero:</p>
        <div class="math-block">
          \[
          -x^{-2}+6x^{-4}=0
          \]
          \[
          1-\frac{6}{x^2}=0
          \]
          \[
          x=\pm\sqrt{6}
          \]
        </div>
        <p class="step-text">Use the second derivative:</p>
        <div class="math-block">
          \[
          f''(x)=2x^{-3}-24x^{-5}
          \]
          \[
          f''(\sqrt{6})&lt;0 \Rightarrow \text{local maximum}
          \]
          \[
          f''(-\sqrt{6})&gt;0 \Rightarrow \text{local minimum}
          \]
        </div>
        <p class="step-text">Find the coordinates:</p>
        <div class="math-block">
          \[
          f(\sqrt{6})=\frac{1}{\sqrt{6}}-\frac{2}{(\sqrt{6})^3}
          \]
          \[
          f(\sqrt{6})=\frac{1}{\sqrt{6}}-\frac{1}{3\sqrt{6}}=\frac{2}{3\sqrt{6}}=\frac{\sqrt{6}}{9}
          \]
          \[
          f(-\sqrt{6})=\frac{1}{-\sqrt{6}}-\frac{2}{(-\sqrt{6})^3}
          \]
          \[
          f(-\sqrt{6})=-\frac{1}{\sqrt{6}}+\frac{1}{3\sqrt{6}}=-\frac{2}{3\sqrt{6}}=-\frac{\sqrt{6}}{9}
          \]
        </div>
        <p class="step-text">So the graph has a local maximum at \(\left(\sqrt{6},\frac{\sqrt{6}}{9}\right)\) and a local minimum at \(\left(-\sqrt{6},-\frac{\sqrt{6}}{9}\right)\).</p>
      `,
      guidedSteps: [
        {
          title: raw`Find the stationary \(x\)-values`,
          previewHtml: raw`Solving \(1-\frac{6}{x^2}=0\) gives \(x^2=6\).`,
          workingHtml: raw`<p class="step-text">Solving \(1-\frac{6}{x^2}=0\) gives \(x^2=6\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x=\pm\sqrt{6}
              \]
</div>`
        },
        {
          title: raw`Classify the stationary points`,
          previewHtml: raw`A negative second derivative at \(x=\sqrt{6}\) means local maximum, while a positive second derivative at \(x=-\sqrt{6}\) means local minimum.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              f''(x)=2x^{-3}-24x^{-5}
              \]
              \[
              f''(\sqrt{6})&lt;0,\qquad f''(-\sqrt{6})&gt;0
              \]
            </div>

<p class="step-text">A negative second derivative at \(x=\sqrt{6}\) means local maximum, while a positive second derivative at \(x=-\sqrt{6}\) means local minimum.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x=\sqrt{6}\text{ is a local maximum, and }x=-\sqrt{6}\text{ is a local minimum}
              \]
</div>`
        },
        {
          title: raw`State the coordinates`,
          previewHtml: raw`The substitutions give the \(y\)-values \(\pm\frac{\sqrt{6}}{9}\), so those are the correct coordinates and classifications.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              f(\sqrt{6})=\frac{1}{\sqrt{6}}-\frac{2}{(\sqrt{6})^3}=\frac{\sqrt{6}}{9}
              \]
              \[
              f(-\sqrt{6})=\frac{1}{-\sqrt{6}}-\frac{2}{(-\sqrt{6})^3}=-\frac{\sqrt{6}}{9}
              \]
            </div>

<p class="step-text">The substitutions give the \(y\)-values \(\pm\frac{\sqrt{6}}{9}\), so those are the correct coordinates and classifications.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \left(\sqrt{6},\frac{\sqrt{6}}{9}\right)\text{ max, and }\left(-\sqrt{6},-\frac{\sqrt{6}}{9}\right)\text{ min}
              \]
</div>

        <p class="step-text">Differentiate:</p>
        <div class="math-block">
          \[
          f(x)=x^{-1}-2x^{-3}
          \]
          \[
          f'(x)=-x^{-2}+6x^{-4}
          \]
        </div>
        <p class="step-text">Set the derivative equal to zero:</p>
        <div class="math-block">
          \[
          -x^{-2}+6x^{-4}=0
          \]
          \[
          1-\frac{6}{x^2}=0
          \]
          \[
          x=\pm\sqrt{6}
          \]
        </div>
        <p class="step-text">Use the second derivative:</p>
        <div class="math-block">
          \[
          f''(x)=2x^{-3}-24x^{-5}
          \]
          \[
          f''(\sqrt{6})&lt;0 \Rightarrow \text{local maximum}
          \]
          \[
          f''(-\sqrt{6})&gt;0 \Rightarrow \text{local minimum}
          \]
        </div>
        <p class="step-text">Find the coordinates:</p>
        <div class="math-block">
          \[
          f(\sqrt{6})=\frac{1}{\sqrt{6}}-\frac{2}{(\sqrt{6})^3}
          \]
          \[
          f(\sqrt{6})=\frac{1}{\sqrt{6}}-\frac{1}{3\sqrt{6}}=\frac{2}{3\sqrt{6}}=\frac{\sqrt{6}}{9}
          \]
          \[
          f(-\sqrt{6})=\frac{1}{-\sqrt{6}}-\frac{2}{(-\sqrt{6})^3}
          \]
          \[
          f(-\sqrt{6})=-\frac{1}{\sqrt{6}}+\frac{1}{3\sqrt{6}}=-\frac{2}{3\sqrt{6}}=-\frac{\sqrt{6}}{9}
          \]
        </div>
        <p class="step-text">So the graph has a local maximum at \(\left(\sqrt{6},\frac{\sqrt{6}}{9}\right)\) and a local minimum at \(\left(-\sqrt{6},-\frac{\sqrt{6}}{9}\right)\).</p>
      `
        }
      ]
    }),
    "3e": createConfig("3e", "2023 Paper — Verify a catenary differential equation", {
      questionHtml: raw`
        <p class="step-text">A power line hangs between two poles. The equation of the curve \(y=f(x)\) that models the shape of the power line can be found by solving the differential equation</p>
        <div class="question-math">
          \[
          a\frac{d^2y}{dx^2}=\sqrt{1+\left(\frac{dy}{dx}\right)^2}
          \]
        </div>
        <p class="step-text">Use differentiation to verify that the function</p>
        <div class="question-math">
          \[
          y=\frac{a}{2}\left(e^{x/a}+e^{-x/a}\right)
          \]
        </div>
        <p class="step-text">satisfies the above differential equation, where \(a\) is a positive constant.</p>
      `,
      hints: [
        raw`Differentiate once to find \(y'\), then again to find \(y''\).`,
        raw`Multiply the second derivative by \(a\) so it looks like the left-hand side of the equation.`,
        raw`To match the square root expression, square both sides after you substitute \(y'\) and \(y''\).`
      ],
      answerHtml: raw`
        <p class="step-text">Differentiate once:</p>
        <div class="math-block">
          \[
          y'=\frac{1}{2}e^{x/a}-\frac{1}{2}e^{-x/a}
          \]
        </div>
        <p class="step-text">Differentiate again:</p>
        <div class="math-block">
          \[
          y''=\frac{1}{2a}e^{x/a}+\frac{1}{2a}e^{-x/a}
          \]
          \[
          ay''=\frac{1}{2}\left(e^{x/a}+e^{-x/a}\right)
          \]
        </div>
        <p class="step-text">Now compare with the right-hand side by squaring:</p>
        <div class="math-block">
          \[
          (ay'')^2=\left(\frac{e^{x/a}+e^{-x/a}}{2}\right)^2
          \]
          \[
          (ay'')^2=\frac{e^{2x/a}}{4}+\frac{2e^{x/a}e^{-x/a}}{4}+\frac{e^{-2x/a}}{4}
          \]
          \[
          (ay'')^2=\frac{e^{2x/a}}{4}+\frac{1}{2}+\frac{e^{-2x/a}}{4}
          \]
          \[
          1+(y')^2=1+\left(\frac{e^{x/a}-e^{-x/a}}{2}\right)^2
          \]
          \[
          1+(y')^2=1+\frac{e^{2x/a}}{4}-\frac{2e^{x/a}e^{-x/a}}{4}+\frac{e^{-2x/a}}{4}
          \]
          \[
          1+(y')^2=\frac{e^{2x/a}}{4}+\frac{1}{2}+\frac{e^{-2x/a}}{4}
          \]
        </div>
        <p class="step-text">So \((ay'')^2=1+(y')^2\), which verifies the required differential equation.</p>
      `,
      guidedSteps: [
        {
          title: raw`Differentiate once`,
          previewHtml: raw`The factors of \(a\) cancel when differentiating each exponential term.`,
          workingHtml: raw`<p class="step-text">The factors of \(a\) cancel when differentiating each exponential term.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                y'=\frac{e^{x/a}}{2}-\frac{e^{-x/a}}{2}
              \]
</div>`
        },
        {
          title: raw`Differentiate a second time`,
          previewHtml: raw`Differentiating the negative exponential again makes the second term positive.`,
          workingHtml: raw`<p class="step-text">Differentiating the negative exponential again makes the second term positive.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                y''=\frac{e^{x/a}}{2a}+\frac{e^{-x/a}}{2a}
              \]
</div>`
        },
        {
          title: raw`Substitute and expand both sides`,
          previewHtml: raw`Expanding both squares and using \(e^{x/a}e^{-x/a}=1\) gives the same expression on both sides:
                \[
                \frac{e^{2x/a}}{4}+\frac{e^{-2x/a}}{4}+\frac{1}{2}.
                \]`,
          workingHtml: raw`
            <div class="math-block">
              \[
              ay''=\frac{e^{x/a}+e^{-x/a}}{2}
              \qquad
              y'=\frac{e^{x/a}-e^{-x/a}}{2}
              \]
              \[
              (ay'')^2=\left(\frac{e^{x/a}+e^{-x/a}}{2}\right)^2
              \qquad
              1+(y')^2=1+\left(\frac{e^{x/a}-e^{-x/a}}{2}\right)^2
              \]
            </div>

<p class="step-text">Expanding both squares and using \(e^{x/a}e^{-x/a}=1\) gives the same expression on both sides:
                \[
                \frac{e^{2x/a}}{4}+\frac{e^{-2x/a}}{4}+\frac{1}{2}.
                \]</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{e^{2x/a}}{4}+\frac{e^{-2x/a}}{4}+\frac{1}{2}
              \]
</div>`
        },
        {
          title: raw`Finish the verification`,
          previewHtml: raw`Since the left-hand side and right-hand side simplify to the same expression, the function really does satisfy the given differential equation.`,
          workingHtml: raw`<p class="step-text">Since the left-hand side and right-hand side simplify to the same expression, the function really does satisfy the given differential equation.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \text{The function satisfies the differential equation}
              \]
</div>

        <p class="step-text">Differentiate once:</p>
        <div class="math-block">
          \[
          y'=\frac{1}{2}e^{x/a}-\frac{1}{2}e^{-x/a}
          \]
        </div>
        <p class="step-text">Differentiate again:</p>
        <div class="math-block">
          \[
          y''=\frac{1}{2a}e^{x/a}+\frac{1}{2a}e^{-x/a}
          \]
          \[
          ay''=\frac{1}{2}\left(e^{x/a}+e^{-x/a}\right)
          \]
        </div>
        <p class="step-text">Now compare with the right-hand side by squaring:</p>
        <div class="math-block">
          \[
          (ay'')^2=\left(\frac{e^{x/a}+e^{-x/a}}{2}\right)^2
          \]
          \[
          (ay'')^2=\frac{e^{2x/a}}{4}+\frac{2e^{x/a}e^{-x/a}}{4}+\frac{e^{-2x/a}}{4}
          \]
          \[
          (ay'')^2=\frac{e^{2x/a}}{4}+\frac{1}{2}+\frac{e^{-2x/a}}{4}
          \]
          \[
          1+(y')^2=1+\left(\frac{e^{x/a}-e^{-x/a}}{2}\right)^2
          \]
          \[
          1+(y')^2=1+\frac{e^{2x/a}}{4}-\frac{2e^{x/a}e^{-x/a}}{4}+\frac{e^{-2x/a}}{4}
          \]
          \[
          1+(y')^2=\frac{e^{2x/a}}{4}+\frac{1}{2}+\frac{e^{-2x/a}}{4}
          \]
        </div>
        <p class="step-text">So \((ay'')^2=1+(y')^2\), which verifies the required differential equation.</p>
      `
        }
      ]
    })
  };
}());
