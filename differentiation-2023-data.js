(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-3-differentiation-2023";
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
      steps: [
        {
          type: "choice",
          title: "Rewrite the square root",
          text: raw`Which index-form rewrite is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                (3x-2)^{1/2}
              \]`,
              correct: true,
              successMessage: raw`Correct. Writing the square root as a power makes the chain rule much clearer.`
            },
            {
              html: raw`\[
                3x-2^{1/2}
              \]`,
              failureMessage: raw`Keep the whole bracket under the square root.`
            },
            {
              html: raw`\[
                (3x-2)^2
              \]`,
              failureMessage: raw`A square root means a power of \(\frac{1}{2}\), not \(2\).`
            },
            {
              html: raw`\[
                \frac{1}{2}(3x-2)
              \]`,
              failureMessage: raw`The square root changes the power, not the coefficient.`
            }
          ]
        },
        {
          type: "choice",
          title: "Differentiate with the chain rule",
          text: raw`Which derivative line is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                \frac{dy}{dx}=\frac{1}{2}(3x-2)^{-1/2}\cdot 3
              \]`,
              correct: true,
              successMessage: raw`Yes. Differentiate the outside power, then multiply by the derivative of \(3x-2\).`
            },
            {
              html: raw`\[
                \frac{dy}{dx}=\frac{1}{2}(3x-2)^{-1/2}
              \]`,
              failureMessage: raw`You still need to multiply by the derivative of the inside bracket, which is \(3\).`
            },
            {
              html: raw`\[
                \frac{dy}{dx}=3(3x-2)^{1/2}
              \]`,
              failureMessage: raw`The power should drop by \(1\), so it becomes \(-\frac{1}{2}\), not \(\frac{1}{2}\).`
            },
            {
              html: raw`\[
                \frac{dy}{dx}=\frac{3}{2}(3x-2)^{1/2}
              \]`,
              failureMessage: raw`Close, but the exponent should be \(-\frac{1}{2}\) after differentiating.`
            }
          ]
        },
        {
          type: "choice",
          title: "Simplify if you want to",
          text: raw`Which fully simplified form matches the derivative?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                \frac{3}{2\sqrt{3x-2}}
              \]`,
              correct: true,
              successMessage: raw`Great. That is the fully simplified version, although the unsimplified chain-rule form was already acceptable.`
            },
            {
              html: raw`\[
                \frac{3}{\sqrt{3x-2}}
              \]`,
              failureMessage: raw`The factor of \(\frac{1}{2}\) is still needed.`
            },
            {
              html: raw`\[
                \frac{3}{2}\sqrt{3x-2}
              \]`,
              failureMessage: raw`The square root belongs in the denominator because the power is negative.`
            },
            {
              html: raw`\[
                \frac{1}{2\sqrt{3x-2}}
              \]`,
              failureMessage: raw`You have lost the inside derivative of \(3\).`
            }
          ]
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
      steps: [
        {
          type: "choice",
          title: "Choose the main rule",
          text: raw`Which rule do you need first?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`Product rule`,
              correct: true,
              successMessage: raw`Correct. The function is a product of \(t^2\) and \(e^{2t}\).`
            },
            {
              html: raw`Quotient rule`,
              failureMessage: raw`Nothing here is written as a quotient.`
            },
            {
              html: raw`Chain rule only`,
              failureMessage: raw`The chain rule appears inside \(e^{2t}\), but the overall structure is still a product.`
            },
            {
              html: raw`Implicit differentiation`,
              failureMessage: raw`No need. The function is already given explicitly.`
            }
          ]
        },
        {
          type: "choice",
          title: "Differentiate the product",
          text: raw`Which derivative is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                f'(t)=2te^{2t}+2t^2e^{2t}=2te^{2t}(1+t)
              \]`,
              correct: true,
              successMessage: raw`Yes. Product rule on the outside, chain rule inside the exponential, and the factorised form is easiest to evaluate.`
            },
            {
              html: raw`\[
                f'(t)=2te^{2t}+t^2e^{2t}
              \]`,
              failureMessage: raw`The derivative of \(e^{2t}\) is \(2e^{2t}\), not just \(e^{2t}\).`
            },
            {
              html: raw`\[
                f'(t)=2te^{2t}
              \]`,
              failureMessage: raw`That only differentiates the \(t^2\) part. You still need the second product-rule term.`
            },
            {
              html: raw`\[
                f'(t)=t^2e^{2t}(2+t)
              \]`,
              failureMessage: raw`Try writing out both product-rule terms first, then factor carefully.`
            }
          ]
        },
        {
          type: "choice",
          title: "Evaluate at \(t=1.5\)",
          text: raw`What is the rate of change when \(t=1.5\)?`,
          beforeHtml: raw`
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
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                150.642
              \]`,
              correct: true,
              successMessage: raw`Correct. After substituting \(t=1.5\), the derivative becomes \(3e^3(2.5)\), which evaluates to approximately \(150.642\).`
            },
            {
              html: raw`\[
                60.257
              \]`,
              failureMessage: raw`Check the substitution into the factorised derivative and make sure both factors of \(t\) are included.`
            },
            {
              html: raw`\[
                40.171
              \]`,
              failureMessage: raw`That is too small. Re-evaluate \(2(1.5)e^3(2.5)\).`
            },
            {
              html: raw`\[
                224.042
              \]`,
              failureMessage: raw`Close in scale, but not correct. Double-check the arithmetic once you substitute \(t=1.5\).`
            }
          ]
        }
      ]
    }),
    "1c": createConfig("1c", "2023 Paper — Parallel tangents on \\(y=\\frac{2}{(x+1)^3}\\)", {
      questionHtml: raw`
        <p class="step-text">The graph shows the curve \(y=\frac{2}{(x+1)^3}\), along with the tangent to the curve drawn at \(x=1\).</p>
        <div class="graph-frame question-graph-frame">
          <img class="graph-svg" src="assets/differentiation-2023/1c-graph.png" alt="Graph of y equals 2 over open bracket x plus 1 close bracket cubed with a tangent at x equals 1" />
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
      steps: [
        {
          type: "choice",
          title: "Differentiate the curve",
          text: raw`Which derivative is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                y'=-\frac{6}{(x+1)^4}
              \]`,
              correct: true,
              successMessage: raw`Correct. You can get that from the chain rule or by using the quotient rule and simplifying.`
            },
            {
              html: raw`\[
                y'=\frac{6}{(x+1)^4}
              \]`,
              failureMessage: raw`The derivative should be negative because differentiating \((x+1)^{-3}\) brings down a \(-3\).`
            },
            {
              html: raw`\[
                y'=-\frac{6}{(x+1)^3}
              \]`,
              failureMessage: raw`The power should increase in magnitude by \(1\) in the denominator, giving \(4\), not \(3\).`
            },
            {
              html: raw`\[
                y'=-\frac{2}{(x+1)^4}
              \]`,
              failureMessage: raw`You have missed the factor from differentiating the power \(-3\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Find the first tangent's gradient",
          text: raw`What is the gradient of the tangent when \(x=1\)?`,
          beforeHtml: raw`
            <div class="math-block">
              \[
              y'=-\frac{6}{(x+1)^4}
              \]
              \[
              y'(1)=-\frac{6}{(1+1)^4}=-\frac{6}{16}
              \]
            </div>
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                -\frac{3}{8}
              \]`,
              correct: true,
              successMessage: raw`Yes. The substitution gives \(-\frac{6}{16}\), which simplifies to \(-\frac{3}{8}\).`
            },
            {
              html: raw`\[
                -\frac{3}{4}
              \]`,
              failureMessage: raw`You need \((1+1)^4=16\), not \(8\).`
            },
            {
              html: raw`\[
                \frac{3}{8}
              \]`,
              failureMessage: raw`Keep the negative sign from the derivative.`
            },
            {
              html: raw`\[
                -\frac{1}{8}
              \]`,
              failureMessage: raw`Check the numerator after substituting \(x=1\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Find the second tangent point",
          text: raw`Which \(x\)-value gives the other point with the same gradient?`,
          beforeHtml: raw`
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
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                -3
              \]`,
              correct: true,
              successMessage: raw`Great. The equation gives \(x=1\) and \(x=-3\); since \(x=1\) is the original tangent point, the second tangent touches at \(x=-3\).`
            },
            {
              html: raw`\[
                -1
              \]`,
              failureMessage: raw`\((x+1)^4\) would be zero there, so the derivative is not even defined.`
            },
            {
              html: raw`\[
                3
              \]`,
              failureMessage: raw`That does not satisfy \((x+1)^4=16\).`
            },
            {
              html: raw`\[
                -2
              \]`,
              failureMessage: raw`Check the values of \(x+1\) that give \(\pm 2\).`
            }
          ]
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
      steps: [
        {
          type: "choice",
          title: "Find the parametric gradient",
          text: raw`Using \(\frac{dy}{dx}=\frac{dy/d\theta}{dx/d\theta}\), what does the gradient simplify to?`,
          beforeHtml: raw`
            <div class="math-block">
              \[
              \frac{dx}{d\theta}=-4\sin\theta
              \qquad
              \frac{dy}{d\theta}=4\cos\theta
              \]
            </div>
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                \frac{dy}{dx}=-\frac{x}{y}
              \]`,
              correct: true,
              successMessage: raw`Correct. Since \(x=4\cos\theta\) and \(y=4\sin\theta\), the gradient simplifies neatly to \(-\frac{x}{y}\).`
            },
            {
              html: raw`\[
                \frac{dy}{dx}=\frac{x}{y}
              \]`,
              failureMessage: raw`The negative sign comes from \(\frac{dx}{d\theta}=-4\sin\theta\).`
            },
            {
              html: raw`\[
                \frac{dy}{dx}=-\frac{y}{x}
              \]`,
              failureMessage: raw`That would be the negative reciprocal. Here we are finding the tangent gradient itself.`
            },
            {
              html: raw`\[
                \frac{dy}{dx}=\frac{p}{q}
              \]`,
              failureMessage: raw`That is not the general gradient. Only after substituting the point \(P(p,q)\) do we replace \(x\) and \(y\) by \(p\) and \(q\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Write the tangent in point-gradient form",
          text: raw`What is the tangent line through \(P(p,q)\) before rearranging?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                y-q=-\frac{p}{q}(x-p)
              \]`,
              correct: true,
              successMessage: raw`Yes. The gradient at \(P(p,q)\) is \(-\frac{p}{q}\), so point-gradient form works immediately.`
            },
            {
              html: raw`\[
                y-p=-\frac{p}{q}(x-q)
              \]`,
              failureMessage: raw`Use the point \((p,q)\) in the usual order: \(x-p\) and \(y-q\).`
            },
            {
              html: raw`\[
                y-q=\frac{p}{q}(x-p)
              \]`,
              failureMessage: raw`The tangent gradient is negative, not positive.`
            },
            {
              html: raw`\[
                y-q=-\frac{q}{p}(x-p)
              \]`,
              failureMessage: raw`That is the negative reciprocal, which would be the normal gradient instead.`
            }
          ]
        },
        {
          type: "choice",
          title: "Rearrange to the required form",
          text: raw`Which rearrangement gives the exact statement to be shown?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                px+qy=p^2+q^2
              \]`,
              correct: true,
              successMessage: raw`Great. Expanding and collecting terms gives exactly the required tangent equation.`
            },
            {
              html: raw`\[
                px-qy=p^2+q^2
              \]`,
              failureMessage: raw`The \(qy\) term should be positive after rearranging.`
            },
            {
              html: raw`\[
                px+qy=p+q
              \]`,
              failureMessage: raw`The right-hand side must come from squaring the point coordinates after rearranging, not just adding them.`
            },
            {
              html: raw`\[
                qx+py=p^2+q^2
              \]`,
              failureMessage: raw`The coefficients should stay matched with their original variables.`
            }
          ]
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
      steps: [
        {
          type: "choice",
          title: "Write the triangle area in terms of \(x\)",
          text: raw`Which area function is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                A=\frac{x^2}{2}(x-2m)^2
              \]`,
              correct: true,
              successMessage: raw`Correct. Start from \(\frac{1}{2}xy\), then substitute \(y=x(x-2m)^2\).`
            },
            {
              html: raw`\[
                A=\frac{x}{2}(x-2m)^2
              \]`,
              failureMessage: raw`You need the extra factor of \(x\) from the curve equation for \(y\).`
            },
            {
              html: raw`\[
                A=x^2(x-2m)^2
              \]`,
              failureMessage: raw`Do not forget the factor of \(\frac{1}{2}\) in the triangle area formula.`
            },
            {
              html: raw`\[
                A=\frac{x^2}{2}(x-2m)
              \]`,
              failureMessage: raw`The area function should still include the full square \((x-2m)^2\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Find the useful critical point",
          text: raw`After differentiating, which \(x\)-value gives the non-zero maximum area inside \(0\le x\le 2m\)?`,
          beforeHtml: raw`
            <div class="math-block">
              \[
              A'=2x(x-m)(x-2m)
              \]
            </div>
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                x=m
              \]`,
              correct: true,
              successMessage: raw`Yes. The endpoints \(x=0\) and \(x=2m\) give zero area, so the non-zero maximum occurs at \(x=m\).`
            },
            {
              html: raw`\[
                x=0
              \]`,
              failureMessage: raw`That gives zero area, so it cannot be the maximum.`
            },
            {
              html: raw`\[
                x=2m
              \]`,
              failureMessage: raw`That also gives zero area.`
            },
            {
              html: raw`\[
                x=\frac{m}{2}
              \]`,
              failureMessage: raw`Factor the derivative carefully: the critical values are \(0\), \(m\), and \(2m\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Compare with the total shaded area",
          text: raw`Which statement is correct for the maximum triangle area?`,
          beforeHtml: raw`
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
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                A_{\max}=\frac{m^4}{2}=\frac{3}{8}\left(\frac{4m^4}{3}\right)
              \]`,
              correct: true,
              successMessage: raw`Great. Substituting \(x=m\) gives \(A_{\max}=\frac{m^4}{2}\), and that is exactly \(\frac{3}{8}\) of the total shaded area.`
            },
            {
              html: raw`\[
                A_{\max}=\frac{m^4}{3}
              \]`,
              failureMessage: raw`Substitute \(x=m\) into \(\frac{x^2}{2}(x-2m)^2\) again.`
            },
            {
              html: raw`\[
                A_{\max}=\frac{4m^4}{3}
              \]`,
              failureMessage: raw`That is the total shaded area, not the triangle area.`
            },
            {
              html: raw`\[
                A_{\max}=\frac{3m^4}{8}
              \]`,
              failureMessage: raw`You are mixing the comparison ratio with the actual area value.`
            }
          ]
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
      steps: [
        {
          type: "choice",
          title: "Rewrite the function",
          text: raw`What is the most useful rewrite before differentiating?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                f(x)=x^2\sec x
              \]`,
              correct: true,
              successMessage: raw`Correct. That rewrite makes the derivative a straightforward product-rule question.`
            },
            {
              html: raw`\[
                f(x)=x^2\cos x
              \]`,
              failureMessage: raw`Dividing by \(\cos x\) is the same as multiplying by \(\sec x\), not by \(\cos x\).`
            },
            {
              html: raw`\[
                f(x)=x^2\tan x
              \]`,
              failureMessage: raw`\(\tan x\) is \(\frac{\sin x}{\cos x}\), which is not the same thing here.`
            },
            {
              html: raw`\[
                f(x)=\frac{x^2}{\sec x}
              \]`,
              failureMessage: raw`That rewrite just makes the expression less convenient.`
            }
          ]
        },
        {
          type: "choice",
          title: "Differentiate the product",
          text: raw`Which derivative is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                \frac{df}{dx}=2x\sec x+x^2\sec x\tan x
              \]`,
              correct: true,
              successMessage: raw`Yes. Product rule on \(x^2\sec x\) gives exactly that.`
            },
            {
              html: raw`\[
                \frac{df}{dx}=2x\sec x+x^2\tan x
              \]`,
              failureMessage: raw`The derivative of \(\sec x\) is \(\sec x\tan x\), not just \(\tan x\).`
            },
            {
              html: raw`\[
                \frac{df}{dx}=2x\sec x\tan x
              \]`,
              failureMessage: raw`That only uses one of the product-rule terms.`
            },
            {
              html: raw`\[
                \frac{df}{dx}=2x\cos x-x^2\sin x
              \]`,
              failureMessage: raw`That would come from differentiating \(x^2\cos x\), which is not the rewritten function.`
            }
          ]
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
      steps: [
        {
          type: "choice",
          title: "Differentiate the curve",
          text: raw`Which derivative is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                y'=-2\csc^2(2x)
              \]`,
              correct: true,
              successMessage: raw`Correct. The chain rule adds the factor of \(2\) from differentiating \(2x\).`
            },
            {
              html: raw`\[
                y'=-\csc^2(2x)
              \]`,
              failureMessage: raw`You still need the chain-rule factor from the inside angle \(2x\).`
            },
            {
              html: raw`\[
                y'=2\csc^2(2x)
              \]`,
              failureMessage: raw`The sign should stay negative because \(\frac{d}{dx}[\cot x]=-\csc^2 x\).`
            },
            {
              html: raw`\[
                y'=-2\cot(2x)
              \]`,
              failureMessage: raw`That is not the derivative formula for \(\cot\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Evaluate the gradient",
          text: raw`What is the gradient when \(x=\frac{\pi}{12}\)?`,
          beforeHtml: raw`
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
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                -8
              \]`,
              correct: true,
              successMessage: raw`Yes. Since \(\csc\left(\frac{\pi}{6}\right)=2\), the substitution gives \(-2(2^2)=-8\).`
            },
            {
              html: raw`\[
                -4
              \]`,
              failureMessage: raw`Remember that \(\csc\left(\frac{\pi}{6}\right)=2\), and then you need to square it.`
            },
            {
              html: raw`\[
                8
              \]`,
              failureMessage: raw`The sign should still be negative.`
            },
            {
              html: raw`\[
                -2
              \]`,
              failureMessage: raw`Check the value of \(\csc^2\left(\frac{\pi}{6}\right)\).`
            }
          ]
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
      steps: [
        {
          type: "choice",
          title: "Simplify the derivative",
          text: raw`Which simplified derivative is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                f'(x)=\frac{e^x(x^2-2)}{(x^2+2x)^2}
              \]`,
              correct: true,
              successMessage: raw`Correct. After using the quotient rule, the numerator simplifies to \(e^x(x^2-2)\).`
            },
            {
              html: raw`\[
                f'(x)=\frac{e^x(x^2+2)}{(x^2+2x)^2}
              \]`,
              failureMessage: raw`Check the sign when simplifying the numerator.`
            },
            {
              html: raw`\[
                f'(x)=\frac{x^2-2}{(x^2+2x)^2}
              \]`,
              failureMessage: raw`You have dropped the factor of \(e^x\).`
            },
            {
              html: raw`\[
                f'(x)=\frac{e^x(x^2-2)}{x^2+2x}
              \]`,
              failureMessage: raw`The whole denominator is squared in the quotient rule.`
            }
          ]
        },
        {
          type: "choice",
          title: "Solve for the horizontal tangents",
          text: raw`Which \(x\)-values make the tangent parallel to the \(x\)-axis?`,
          beforeHtml: raw`
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
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                x=\pm \sqrt{2}
              \]`,
              correct: true,
              successMessage: raw`Yes. Because \(e^x\) is never zero, the equation reduces to \(x^2-2=0\), so \(x=\pm\sqrt{2}\).`
            },
            {
              html: raw`\[
                x=\pm 2
              \]`,
              failureMessage: raw`Solve \(x^2=2\), not \(x^2=4\).`
            },
            {
              html: raw`\[
                x=0,-2
              \]`,
              failureMessage: raw`Those values make the original denominator zero, so the function is undefined there.`
            },
            {
              html: raw`\[
                x=\sqrt{2}
              \]`,
              failureMessage: raw`Do not forget that squaring gives two solutions here.`
            }
          ]
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
      steps: [
        {
          type: "choice",
          title: "Differentiate once",
          text: raw`Which first derivative is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                f'(x)=6x\ln x+3x=3x(1+2\ln x)
              \]`,
              correct: true,
              successMessage: raw`Correct. Product rule on \(3x^2\ln x\) gives a factorable first derivative.`
            },
            {
              html: raw`\[
                f'(x)=6x\ln x+\frac{3}{x}
              \]`,
              failureMessage: raw`Differentiating \(3x^2\) gives \(6x\), and the second term should still contain a factor of \(x\).`
            },
            {
              html: raw`\[
                f'(x)=3x(2+\ln x)
              \]`,
              failureMessage: raw`Check the product-rule expansion more carefully.`
            },
            {
              html: raw`\[
                f'(x)=6x\ln x+6x
              \]`,
              failureMessage: raw`The logarithm term contributes \(3x\), not \(6x\), in the second part.`
            }
          ]
        },
        {
          type: "choice",
          title: "Find the second derivative",
          text: raw`Which second derivative should you set equal to zero?`,
          beforeHtml: raw`
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
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                f''(x)=9+6\ln x
              \]`,
              correct: true,
              successMessage: raw`Yes. Product rule gives \(3(1+2\ln x)+3x\left(\frac{2}{x}\right)\), which simplifies to \(9+6\ln x\).`
            },
            {
              html: raw`\[
                f''(x)=6+6\ln x
              \]`,
              failureMessage: raw`There should be an extra \(3\) from differentiating the outside \(3x\) as well.`
            },
            {
              html: raw`\[
                f''(x)=3+2\ln x
              \]`,
              failureMessage: raw`The coefficients are too small after differentiating.`
            },
            {
              html: raw`\[
                f''(x)=\frac{6}{x}
              \]`,
              failureMessage: raw`That only differentiates the logarithm piece and misses the rest.`
            }
          ]
        },
        {
          type: "choice",
          title: "Solve for the inflection point",
          text: raw`What is the \(x\)-value of the point of inflection?`,
          beforeHtml: raw`
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
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                e^{-3/2}
              \]`,
              correct: true,
              successMessage: raw`Great. Once \(\ln x=-\frac{3}{2}\), exponentiating both sides gives \(x=e^{-3/2}\).`
            },
            {
              html: raw`\[
                e^{3/2}
              \]`,
              failureMessage: raw`The logarithm equation gives a negative exponent here.`
            },
            {
              html: raw`\[
                -\frac{3}{2}
              \]`,
              failureMessage: raw`That is the value of \(\ln x\), not \(x\) itself.`
            },
            {
              html: raw`\[
                \frac{3}{2}
              \]`,
              failureMessage: raw`You need to solve the logarithmic equation all the way to \(x\).`
            }
          ]
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
      steps: [
        {
          type: "choice",
          title: "Link the angle and the horizontal distance",
          text: raw`If \(x\) is the horizontal distance from the helicopter to the car, which relationship is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                \tan\theta=\frac{400}{x}
              \]`,
              correct: true,
              successMessage: raw`Correct. The opposite side is the constant height \(400\), and the adjacent side is the horizontal distance \(x\).`
            },
            {
              html: raw`\[
                \sin\theta=\frac{400}{x}
              \]`,
              failureMessage: raw`That would use \(x\) as the hypotenuse, but here \(x\) is the horizontal distance.`
            },
            {
              html: raw`\[
                \tan\theta=\frac{x}{400}
              \]`,
              failureMessage: raw`That inverts the ratio.`
            },
            {
              html: raw`\[
                \cos\theta=\frac{400}{x}
              \]`,
              failureMessage: raw`Cosine uses adjacent over hypotenuse, not opposite over adjacent.`
            }
          ]
        },
        {
          type: "choice",
          title: "Find the horizontal closing speed",
          text: raw`After differentiating and substituting the given instant, what is \(\frac{dx}{dt}\)?`,
          beforeHtml: raw`
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
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                -31.25\text{ m s}^{-1}
              \]`,
              correct: true,
              successMessage: raw`Yes. Solving the substituted equation gives \(\frac{dx}{dt}=-31.25\text{ m s}^{-1}\), and the negative sign shows the horizontal distance is shrinking.`
            },
            {
              html: raw`\[
                31.25\text{ m s}^{-1}
              \]`,
              failureMessage: raw`The sign should be negative because the helicopter is closing the gap.`
            },
            {
              html: raw`\[
                -72\text{ m s}^{-1}
              \]`,
              failureMessage: raw`That is the helicopter's speed, not the horizontal separation rate from the related-rates calculation.`
            },
            {
              html: raw`\[
                40.75\text{ m s}^{-1}
              \]`,
              failureMessage: raw`That is the car's speed after the final comparison, not \(\frac{dx}{dt}\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Convert to the car's speed",
          text: raw`What is the speed of the car?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                40.75\text{ m s}^{-1}
              \]`,
              correct: true,
              successMessage: raw`Great. The helicopter travels at \(72\text{ m s}^{-1}\), and the gap closes at \(31.25\text{ m s}^{-1}\), so the car must be travelling at \(40.75\text{ m s}^{-1}\).`
            },
            {
              html: raw`\[
                31.25\text{ m s}^{-1}
              \]`,
              failureMessage: raw`That is the closing rate in the horizontal distance, not the car's own speed.`
            },
            {
              html: raw`\[
                72\text{ m s}^{-1}
              \]`,
              failureMessage: raw`That is the helicopter's speed.`
            },
            {
              html: raw`\[
                103.25\text{ m s}^{-1}
              \]`,
              failureMessage: raw`The car is slower than the helicopter here, so the speeds should not be added.`
            }
          ]
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
      steps: [
        {
          type: "choice",
          title: "Differentiate the inside first",
          text: raw`What is the derivative of the bracket \(x^2-x^4+1\)?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                2x-4x^3
              \]`,
              correct: true,
              successMessage: raw`Correct. Differentiate term by term before using the logarithm rule.`
            },
            {
              html: raw`\[
                2x-3x^4
              \]`,
              failureMessage: raw`The derivative of \(-x^4\) is \(-4x^3\), not \(-3x^4\).`
            },
            {
              html: raw`\[
                2-4x^3
              \]`,
              failureMessage: raw`The derivative of \(x^2\) is \(2x\), not \(2\).`
            },
            {
              html: raw`\[
                2x+4x^3
              \]`,
              failureMessage: raw`Keep the negative sign from \(-x^4\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Build the logarithmic derivative",
          text: raw`Which final derivative is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                \frac{dy}{dx}=\frac{2x-4x^3}{x^2-x^4+1}
              \]`,
              correct: true,
              successMessage: raw`Yes. For \(\ln(u)\), the derivative is \(\frac{u'}{u}\).`
            },
            {
              html: raw`\[
                \frac{dy}{dx}=\ln(2x-4x^3)
              \]`,
              failureMessage: raw`The derivative of \(\ln(u)\) is not another logarithm.`
            },
            {
              html: raw`\[
                \frac{dy}{dx}=\frac{x^2-x^4+1}{2x-4x^3}
              \]`,
              failureMessage: raw`That has the fraction the wrong way around.`
            },
            {
              html: raw`\[
                \frac{dy}{dx}=(x^2-x^4+1)(2x-4x^3)
              \]`,
              failureMessage: raw`For a logarithm, you divide by the inside, not multiply by it.`
            }
          ]
        }
      ]
    }),
    "3b": createConfig("3b", "2023 Paper — Read continuity, derivatives, and a limit from a graph", {
      questionHtml: raw`
        <p class="step-text">The graph below shows the function \(y=f(x)\).</p>
        <div class="graph-frame question-graph-frame">
          <img class="graph-svg" src="assets/differentiation-2023/3b-graph.png" alt="Graph of a piecewise function with open circles, turning points, and a V shape on the right" />
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
      steps: [
        {
          type: "choice",
          title: "Find the continuous corner",
          text: raw`Where is \(f(x)\) continuous but not differentiable?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                x=8
              \]`,
              correct: true,
              successMessage: raw`Correct. The graph meets at \(x=8\), but it does so with a sharp corner.`
            },
            {
              html: raw`\[
                x=2
              \]`,
              failureMessage: raw`At \(x=2\), there is a break between open and closed points, so the function is not continuous there.`
            },
            {
              html: raw`\[
                x=6
              \]`,
              failureMessage: raw`At \(x=6\), the left and right pieces do not meet, so the function is not continuous there.`
            },
            {
              html: raw`\[
                x=-2
              \]`,
              failureMessage: raw`There is a hole there, so the function is not continuous.`
            }
          ]
        },
        {
          type: "choice",
          title: "Find the local maximum",
          text: raw`Which \(x\)-value makes both \(f'(x)=0\) and \(f''(x)&lt;0\) true?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                x=-4
              \]`,
              correct: true,
              successMessage: raw`Yes. The graph has a smooth turning point there, and it is a local maximum, so the second derivative is negative.`
            },
            {
              html: raw`\[
                x=4
              \]`,
              failureMessage: raw`That point is a local minimum, so \(f''(x)\) would be positive instead.`
            },
            {
              html: raw`\[
                x=8
              \]`,
              failureMessage: raw`The derivative does not exist at the sharp corner there.`
            },
            {
              html: raw`\[
                x=0
              \]`,
              failureMessage: raw`The graph is flat near \(x=0\), but there is no turning point with \(f''(x)&lt;0\) there.`
            }
          ]
        },
        {
          type: "choice",
          title: "Read the limit at \(x=6\)",
          text: raw`What is \(\lim_{x\to 6}f(x)\)?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                \text{Does not exist}
              \]`,
              correct: true,
              successMessage: raw`Correct. The left-hand side approaches \(2\), while the right-hand side approaches \(5\), so the two-sided limit does not exist.`
            },
            {
              html: raw`\[
                2
              \]`,
              failureMessage: raw`That is only the value approached from the left-hand side.`
            },
            {
              html: raw`\[
                5
              \]`,
              failureMessage: raw`That is only the value approached from the right-hand side.`
            },
            {
              html: raw`\[
                3
              \]`,
              failureMessage: raw`The graph does not approach \(3\) from either side of \(x=6\).`
            }
          ]
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
      steps: [
        {
          type: "choice",
          title: "Find the tangent gradient",
          text: raw`Which simplified expression for \(\frac{dy}{dx}\) is correct?`,
          beforeHtml: raw`
            <div class="math-block">
              \[
              \frac{dx}{dt}=\pi\sqrt{2}\cos\left(\frac{\pi t}{5}\right)
              \qquad
              \frac{dy}{dt}=\pi\sqrt{2}\sin\left(\frac{\pi t}{5}\right)
              \]
            </div>
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                \frac{dy}{dx}=\tan\left(\frac{\pi t}{5}\right)
              \]`,
              correct: true,
              successMessage: raw`Correct. The common factor of \(\pi\sqrt{2}\) cancels out.`
            },
            {
              html: raw`\[
                \frac{dy}{dx}=\cot\left(\frac{\pi t}{5}\right)
              \]`,
              failureMessage: raw`That would happen if the fraction were inverted.`
            },
            {
              html: raw`\[
                \frac{dy}{dx}=\sin\left(\frac{\pi t}{5}\right)
              \]`,
              failureMessage: raw`You still need to divide by \(\cos\left(\frac{\pi t}{5}\right)\).`
            },
            {
              html: raw`\[
                \frac{dy}{dx}=-\tan\left(\frac{\pi t}{5}\right)
              \]`,
              failureMessage: raw`Both derivatives are positive here, so no extra negative sign appears in \(\frac{dy}{dx}\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Evaluate the tangent gradient at \(t=6.25\)",
          text: raw`What is the tangent gradient at that instant?`,
          beforeHtml: raw`
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
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                1
              \]`,
              correct: true,
              successMessage: raw`Yes. Substituting \(t=6.25\) gives the angle \(\frac{5\pi}{4}\), and \(\tan\left(\frac{5\pi}{4}\right)=1\).`
            },
            {
              html: raw`\[
                -1
              \]`,
              failureMessage: raw`That will be the normal gradient, not the tangent gradient.`
            },
            {
              html: raw`\[
                0
              \]`,
              failureMessage: raw`The tangent is not horizontal at \(t=6.25\).`
            },
            {
              html: raw`\[
                \sqrt{2}
              \]`,
              failureMessage: raw`The \(\sqrt{2}\) factor cancels when you divide \(\frac{dy}{dt}\) by \(\frac{dx}{dt}\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Find the normal gradient",
          text: raw`What is the gradient of the normal?`,
          beforeHtml: raw`
            <div class="math-block">
              \[
              m_{\text{tangent}}=1
              \]
              \[
              m_{\text{normal}}=-\frac{1}{m_{\text{tangent}}}=-\frac{1}{1}
              \]
            </div>
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                -1
              \]`,
              correct: true,
              successMessage: raw`Great. The normal gradient is the negative reciprocal of the tangent gradient, so it is \(-1\).`
            },
            {
              html: raw`\[
                1
              \]`,
              failureMessage: raw`That is the tangent gradient, not the normal gradient.`
            },
            {
              html: raw`\[
                0
              \]`,
              failureMessage: raw`A zero gradient would make the normal horizontal, which is not the case here.`
            },
            {
              html: raw`\[
                \text{Undefined}
              \]`,
              failureMessage: raw`The tangent gradient is \(1\), so the normal slope is perfectly defined.`
            }
          ]
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
      steps: [
        {
          type: "choice",
          title: "Find the stationary \(x\)-values",
          text: raw`Which \(x\)-values make \(f'(x)=0\)?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                x=\pm\sqrt{6}
              \]`,
              correct: true,
              successMessage: raw`Correct. Solving \(1-\frac{6}{x^2}=0\) gives \(x^2=6\).`
            },
            {
              html: raw`\[
                x=\pm 6
              \]`,
              failureMessage: raw`You need \(x^2=6\), not \(x=6\).`
            },
            {
              html: raw`\[
                x=\pm\sqrt{3}
              \]`,
              failureMessage: raw`Check the equation after multiplying through by \(x^4\).`
            },
            {
              html: raw`\[
                x=0
              \]`,
              failureMessage: raw`The function is not even defined at \(x=0\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Classify the stationary points",
          text: raw`What does the second derivative test tell you?`,
          beforeHtml: raw`
            <div class="math-block">
              \[
              f''(x)=2x^{-3}-24x^{-5}
              \]
              \[
              f''(\sqrt{6})&lt;0,\qquad f''(-\sqrt{6})&gt;0
              \]
            </div>
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                x=\sqrt{6}\text{ is a local maximum, and }x=-\sqrt{6}\text{ is a local minimum}
              \]`,
              correct: true,
              successMessage: raw`Yes. A negative second derivative at \(x=\sqrt{6}\) means local maximum, while a positive second derivative at \(x=-\sqrt{6}\) means local minimum.`
            },
            {
              html: raw`\[
                x=\sqrt{6}\text{ is a local minimum, and }x=-\sqrt{6}\text{ is a local maximum}
              \]`,
              failureMessage: raw`That reverses the signs from the second derivative test.`
            },
            {
              html: raw`\[
                \text{Both are local maxima}
              \]`,
              failureMessage: raw`The second derivative has opposite signs at the two stationary points.`
            },
            {
              html: raw`\[
                \text{Both are local minima}
              \]`,
              failureMessage: raw`Again, the second derivative changes sign between the two points.`
            }
          ]
        },
        {
          type: "choice",
          title: "State the coordinates",
          text: raw`Which final answer is correct?`,
          beforeHtml: raw`
            <div class="math-block">
              \[
              f(\sqrt{6})=\frac{1}{\sqrt{6}}-\frac{2}{(\sqrt{6})^3}=\frac{\sqrt{6}}{9}
              \]
              \[
              f(-\sqrt{6})=\frac{1}{-\sqrt{6}}-\frac{2}{(-\sqrt{6})^3}=-\frac{\sqrt{6}}{9}
              \]
            </div>
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                \left(\sqrt{6},\frac{\sqrt{6}}{9}\right)\text{ max, and }\left(-\sqrt{6},-\frac{\sqrt{6}}{9}\right)\text{ min}
              \]`,
              correct: true,
              successMessage: raw`Great. The substitutions give the \(y\)-values \(\pm\frac{\sqrt{6}}{9}\), so those are the correct coordinates and classifications.`
            },
            {
              html: raw`\[
                \left(\sqrt{6},\frac{1}{\sqrt{6}}\right)\text{ max, and }\left(-\sqrt{6},-\frac{1}{\sqrt{6}}\right)\text{ min}
              \]`,
              failureMessage: raw`Check the substitution into \(f(x)=\frac{1}{x}-\frac{2}{x^3}\) more carefully.`
            },
            {
              html: raw`\[
                \left(\sqrt{6},-\frac{\sqrt{6}}{9}\right)\text{ max, and }\left(-\sqrt{6},\frac{\sqrt{6}}{9}\right)\text{ min}
              \]`,
              failureMessage: raw`The \(y\)-values should keep the same sign pattern as the \(x\)-values here.`
            },
            {
              html: raw`\[
                \left(\sqrt{6},\frac{\sqrt{6}}{9}\right)\text{ and }\left(-\sqrt{6},-\frac{\sqrt{6}}{9}\right)\text{ are both inflection points}
              \]`,
              failureMessage: raw`These are stationary points classified by the second derivative test, not inflection points.`
            }
          ]
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
      steps: [
        {
          type: "choice",
          title: "Differentiate once",
          text: raw`Which first derivative is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                y'=\frac{e^{x/a}}{2}-\frac{e^{-x/a}}{2}
              \]`,
              correct: true,
              successMessage: raw`Correct. The factors of \(a\) cancel when differentiating each exponential term.`
            },
            {
              html: raw`\[
                y'=\frac{ae^{x/a}}{2}-\frac{ae^{-x/a}}{2}
              \]`,
              failureMessage: raw`The chain-rule factors cancel the outside \(a\), so no \(a\) remains in front.`
            },
            {
              html: raw`\[
                y'=\frac{e^{x/a}}{2}+\frac{e^{-x/a}}{2}
              \]`,
              failureMessage: raw`The derivative of \(e^{-x/a}\) introduces a negative sign.`
            },
            {
              html: raw`\[
                y'=\frac{1}{2a}\left(e^{x/a}-e^{-x/a}\right)
              \]`,
              failureMessage: raw`The outside factor of \(a\) has already cancelled that denominator.`
            }
          ]
        },
        {
          type: "choice",
          title: "Differentiate a second time",
          text: raw`Which second derivative is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                y''=\frac{e^{x/a}}{2a}+\frac{e^{-x/a}}{2a}
              \]`,
              correct: true,
              successMessage: raw`Yes. Differentiating the negative exponential again makes the second term positive.`
            },
            {
              html: raw`\[
                y''=\frac{e^{x/a}}{2a}-\frac{e^{-x/a}}{2a}
              \]`,
              failureMessage: raw`The second derivative should make both terms positive.`
            },
            {
              html: raw`\[
                y''=\frac{e^{x/a}+e^{-x/a}}{2}
              \]`,
              failureMessage: raw`You still need the factor of \(\frac{1}{a}\) from differentiating the exponents.`
            },
            {
              html: raw`\[
                y''=\frac{e^{2x/a}+e^{-2x/a}}{2a}
              \]`,
              failureMessage: raw`Differentiating does not double the exponents in that way.`
            }
          ]
        },
        {
          type: "choice",
          title: "Substitute and expand both sides",
          text: raw`After substituting \(y'\) and \(ay''\), what do both squared sides simplify to?`,
          beforeHtml: raw`
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
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                \frac{e^{2x/a}}{4}+\frac{e^{-2x/a}}{4}+\frac{1}{2}
              \]`,
              correct: true,
              successMessage: raw`Correct. Expanding both squares and using \(e^{x/a}e^{-x/a}=1\) gives the same expression on both sides:
                \[
                \frac{e^{2x/a}}{4}+\frac{e^{-2x/a}}{4}+\frac{1}{2}.
                \]`
            },
            {
              html: raw`\[
                \frac{e^{2x/a}}{4}-\frac{e^{-2x/a}}{4}+\frac{1}{2}
              \]`,
              failureMessage: raw`The exponential terms should both be positive after expanding and simplifying.`
            },
            {
              html: raw`\[
                \frac{e^{2x/a}}{2}+\frac{e^{-2x/a}}{2}
              \]`,
              failureMessage: raw`Check the coefficients after squaring the fractions.`
            },
            {
              html: raw`\[
                \frac{e^{2x/a}}{4}+\frac{e^{-2x/a}}{4}-\frac{1}{2}
              \]`,
              failureMessage: raw`The middle term becomes \(+\frac{1}{2}\), not negative, once the full expressions are simplified.`
            }
          ]
        },
        {
          type: "choice",
          title: "Finish the verification",
          text: raw`What can you conclude once both sides simplify to the same expression?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                \text{The function satisfies the differential equation}
              \]`,
              correct: true,
              successMessage: raw`Great. Since the left-hand side and right-hand side simplify to the same expression, the function really does satisfy the given differential equation.`
            },
            {
              html: raw`\[
                \text{The function only works when }x=0
              \]`,
              failureMessage: raw`The matching expansions hold for general \(x\), not just at one point.`
            },
            {
              html: raw`\[
                \text{The derivatives are close, but not equal}
              \]`,
              failureMessage: raw`They are not just close; they simplify to exactly the same expression.`
            },
            {
              html: raw`\[
                \text{The equation fails because of the square root}
              \]`,
              failureMessage: raw`Squaring both sides is exactly what lets us compare the two expressions cleanly.`
            }
          ]
        }
      ]
    })
  };
}());
