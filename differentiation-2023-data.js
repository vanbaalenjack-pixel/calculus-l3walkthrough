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
              f(t)=t^2e^{2t}
              \]
              \[
              f'(t)=(t^2)'e^{2t}+t^2(e^{2t})'
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
        raw`At the point \(P(p,q)\), first handle \(q=0\) as a vertical tangent; otherwise replace \(x\) and \(y\) in the gradient by \(p\) and \(q\), then use point-gradient form.`
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
        <p class="step-text">For \(q\ne0\), at the point \(P(p,q)\), the gradient is \(-\frac{p}{q}\), so</p>
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
        <p class="step-text">For \(q\ne0\), at the point \(P(p,q)\), the gradient is \(-\frac{p}{q}\), so</p>
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
      ],
      examNoteHtml: raw`<p class="step-text">The gradient calculation above assumes \(q\ne0\). If \(q=0\), then \(p=\pm4\). The radius is horizontal, so the tangent is the vertical line \(x=p\). The required equation becomes \(px=p^2\), which also gives \(x=p\), since \(p\ne0\). This covers the omitted case.</p>`
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
        <p class="step-text">A right-angled triangle is constructed with one vertex at \((0,0)\) and another on the curve.</p><p class="step-text">As shown in the diagram, its base lies on the \(x\)-axis, with the right angle directly below the point on the curve, between \(x=0\) and \(x=2m\).</p><div class="graph-frame question-graph-frame"><svg class="graph-svg" viewBox="0 0 380 260" role="img" aria-label="Redrawn diagram: the pale region is the whole area between the curve y equals x times x minus 2m squared and the x-axis from 0 to 2m. The darker right triangle has a horizontal base from the origin to a point between 0 and 2m, and a vertical side to the curve. The curve touches the x-axis at 2m."><path d="M40.0,220.0 L41.3,214.1 L42.6,208.2 L43.9,202.5 L45.2,197.0 L46.5,191.5 L47.8,186.1 L49.1,180.9 L50.4,175.8 L51.7,170.8 L53.0,165.8 L54.3,161.1 L55.6,156.4 L56.9,151.8 L58.2,147.3 L59.5,143.0 L60.8,138.7 L62.1,134.6 L63.4,130.6 L64.7,126.6 L66.0,122.8 L67.3,119.1 L68.6,115.4 L69.9,111.9 L71.2,108.5 L72.5,105.2 L73.8,101.9 L75.1,98.8 L76.4,95.7 L77.7,92.8 L79.0,90.0 L80.3,87.2 L81.6,84.5 L82.9,81.9 L84.2,79.5 L85.5,77.1 L86.8,74.8 L88.1,72.5 L89.4,70.4 L90.7,68.4 L92.0,66.4 L93.3,64.5 L94.6,62.7 L95.9,61.0 L97.2,59.4 L98.5,57.8 L99.8,56.4 L101.1,55.0 L102.4,53.7 L103.7,52.4 L105.0,51.2 L106.3,50.2 L107.6,49.1 L108.9,48.2 L110.2,47.3 L111.5,46.5 L112.8,45.8 L114.1,45.2 L115.4,44.6 L116.7,44.1 L118.0,43.6 L119.3,43.2 L120.6,42.9 L121.9,42.6 L123.2,42.4 L124.5,42.3 L125.8,42.2 L127.1,42.2 L128.4,42.3 L129.7,42.4 L131.0,42.5 L132.3,42.8 L133.6,43.1 L134.9,43.4 L136.2,43.8 L137.5,44.2 L138.8,44.7 L140.1,45.3 L141.4,45.9 L142.7,46.5 L144.0,47.2 L145.3,47.9 L146.6,48.7 L147.9,49.6 L149.2,50.5 L150.5,51.4 L151.8,52.4 L153.1,53.4 L154.4,54.4 L155.7,55.5 L157.0,56.6 L158.3,57.8 L159.6,59.0 L160.9,60.3 L162.2,61.6 L163.5,62.9 L164.8,64.2 L166.1,65.6 L167.4,67.1 L168.7,68.5 L170.0,70.0 L171.3,71.5 L172.6,73.1 L173.9,74.6 L175.2,76.2 L176.5,77.9 L177.8,79.5 L179.1,81.2 L180.4,82.9 L181.7,84.6 L183.0,86.4 L184.3,88.1 L185.6,89.9 L186.9,91.7 L188.2,93.5 L189.5,95.4 L190.8,97.2 L192.1,99.1 L193.4,101.0 L194.7,102.9 L196.0,104.8 L197.3,106.7 L198.6,108.7 L199.9,110.6 L201.2,112.6 L202.5,114.5 L203.8,116.5 L205.1,118.5 L206.4,120.5 L207.7,122.5 L209.0,124.5 L210.3,126.4 L211.6,128.4 L212.9,130.4 L214.2,132.4 L215.5,134.4 L216.8,136.4 L218.1,138.4 L219.4,140.4 L220.7,142.4 L222.0,144.4 L223.3,146.4 L224.6,148.3 L225.9,150.3 L227.2,152.3 L228.5,154.2 L229.8,156.1 L231.1,158.1 L232.4,160.0 L233.7,161.9 L235.0,163.8 L236.3,165.6 L237.6,167.5 L238.9,169.3 L240.2,171.1 L241.5,172.9 L242.8,174.7 L244.1,176.5 L245.4,178.2 L246.7,179.9 L248.0,181.6 L249.3,183.3 L250.6,184.9 L251.9,186.5 L253.2,188.1 L254.5,189.7 L255.8,191.2 L257.1,192.7 L258.4,194.2 L259.7,195.6 L261.0,197.0 L262.3,198.4 L263.6,199.8 L264.9,201.1 L266.2,202.4 L267.5,203.6 L268.8,204.8 L270.1,206.0 L271.4,207.1 L272.7,208.2 L274.0,209.2 L275.3,210.2 L276.6,211.2 L277.9,212.1 L279.2,212.9 L280.5,213.8 L281.8,214.5 L283.1,215.3 L284.4,215.9 L285.7,216.6 L287.0,217.2 L288.3,217.7 L289.6,218.2 L290.9,218.6 L292.2,219.0 L293.5,219.3 L294.8,219.5 L296.1,219.7 L297.4,219.9 L298.7,220.0 L300.0,220.0 Z" fill="#eef2f7"/><path d="M20 220H355 M40 240V20" fill="none" stroke="#475569"/><path d="M40.0,220.0 L41.3,214.1 L42.6,208.2 L43.9,202.5 L45.2,197.0 L46.5,191.5 L47.8,186.1 L49.1,180.9 L50.4,175.8 L51.7,170.8 L53.0,165.8 L54.3,161.1 L55.6,156.4 L56.9,151.8 L58.2,147.3 L59.5,143.0 L60.8,138.7 L62.1,134.6 L63.4,130.6 L64.7,126.6 L66.0,122.8 L67.3,119.1 L68.6,115.4 L69.9,111.9 L71.2,108.5 L72.5,105.2 L73.8,101.9 L75.1,98.8 L76.4,95.7 L77.7,92.8 L79.0,90.0 L80.3,87.2 L81.6,84.5 L82.9,81.9 L84.2,79.5 L85.5,77.1 L86.8,74.8 L88.1,72.5 L89.4,70.4 L90.7,68.4 L92.0,66.4 L93.3,64.5 L94.6,62.7 L95.9,61.0 L97.2,59.4 L98.5,57.8 L99.8,56.4 L101.1,55.0 L102.4,53.7 L103.7,52.4 L105.0,51.2 L106.3,50.2 L107.6,49.1 L108.9,48.2 L110.2,47.3 L111.5,46.5 L112.8,45.8 L114.1,45.2 L115.4,44.6 L116.7,44.1 L118.0,43.6 L119.3,43.2 L120.6,42.9 L121.9,42.6 L123.2,42.4 L124.5,42.3 L125.8,42.2 L127.1,42.2 L128.4,42.3 L129.7,42.4 L131.0,42.5 L132.3,42.8 L133.6,43.1 L134.9,43.4 L136.2,43.8 L137.5,44.2 L138.8,44.7 L140.1,45.3 L141.4,45.9 L142.7,46.5 L144.0,47.2 L145.3,47.9 L146.6,48.7 L147.9,49.6 L149.2,50.5 L150.5,51.4 L151.8,52.4 L153.1,53.4 L154.4,54.4 L155.7,55.5 L157.0,56.6 L158.3,57.8 L159.6,59.0 L160.9,60.3 L162.2,61.6 L163.5,62.9 L164.8,64.2 L166.1,65.6 L167.4,67.1 L168.7,68.5 L170.0,70.0 L171.3,71.5 L172.6,73.1 L173.9,74.6 L175.2,76.2 L176.5,77.9 L177.8,79.5 L179.1,81.2 L180.4,82.9 L181.7,84.6 L183.0,86.4 L184.3,88.1 L185.6,89.9 L186.9,91.7 L188.2,93.5 L189.5,95.4 L190.8,97.2 L192.1,99.1 L193.4,101.0 L194.7,102.9 L196.0,104.8 L197.3,106.7 L198.6,108.7 L199.9,110.6 L201.2,112.6 L202.5,114.5 L203.8,116.5 L205.1,118.5 L206.4,120.5 L207.7,122.5 L209.0,124.5 L210.3,126.4 L211.6,128.4 L212.9,130.4 L214.2,132.4 L215.5,134.4 L216.8,136.4 L218.1,138.4 L219.4,140.4 L220.7,142.4 L222.0,144.4 L223.3,146.4 L224.6,148.3 L225.9,150.3 L227.2,152.3 L228.5,154.2 L229.8,156.1 L231.1,158.1 L232.4,160.0 L233.7,161.9 L235.0,163.8 L236.3,165.6 L237.6,167.5 L238.9,169.3 L240.2,171.1 L241.5,172.9 L242.8,174.7 L244.1,176.5 L245.4,178.2 L246.7,179.9 L248.0,181.6 L249.3,183.3 L250.6,184.9 L251.9,186.5 L253.2,188.1 L254.5,189.7 L255.8,191.2 L257.1,192.7 L258.4,194.2 L259.7,195.6 L261.0,197.0 L262.3,198.4 L263.6,199.8 L264.9,201.1 L266.2,202.4 L267.5,203.6 L268.8,204.8 L270.1,206.0 L271.4,207.1 L272.7,208.2 L274.0,209.2 L275.3,210.2 L276.6,211.2 L277.9,212.1 L279.2,212.9 L280.5,213.8 L281.8,214.5 L283.1,215.3 L284.4,215.9 L285.7,216.6 L287.0,217.2 L288.3,217.7 L289.6,218.2 L290.9,218.6 L292.2,219.0 L293.5,219.3 L294.8,219.5 L296.1,219.7 L297.4,219.9 L298.7,220.0 L300.0,220.0 L301.3,220.0 L302.6,219.9 L303.9,219.7 L305.2,219.5 L306.5,219.2 L307.8,218.9 L309.1,218.5 L310.4,218.0 L311.7,217.5 L313.0,216.8 L314.3,216.2 L315.6,215.4 L316.9,214.6 L318.2,213.7 L319.5,212.7 L320.8,211.7 L322.1,210.6 L323.4,209.4 L324.7,208.1 L326.0,206.8 L327.3,205.4 L328.6,203.9 L329.9,202.3 L331.2,200.6 L332.5,198.9" fill="none" stroke="#1d4ed8" stroke-width="2.5"/><path d="M40 220 L133.6 220 L133.6 43.1 Z" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="1.5"/><path d="M124 220V210.4H133.6" fill="none" stroke="#475569"/><text x="32" y="240">0</text><text x="292" y="240">2m</text><text x="357" y="225">x</text><text x="27" y="20">y</text></svg></div><p class="step-text question-note">Redrawn diagram: the pale region is the total area under the curve; the darker region is the triangle.</p>
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
        <ol class="step-text question-parts" type="i">
          <li>Find the value(s) of \(x\) where \(f(x)\) is continuous but not differentiable.</li>
          <li>Find the value(s) of \(x\) where \(f'(x)=0\) and \(f''(x)\lt 0\) are both true.</li>
          <li>What is the value of \(\lim_{x\to 6}f(x)\)?</li>
        </ol>
      `,
      hints: [
        raw`Continuous but not differentiable means the graph is joined up but has a sharp corner.`,
        raw`The conditions \(f'(x)=0\) and \(f''(x)\lt 0\) describe a local maximum.`,
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
        <p class="step-text">At \(x=8\) the graph is continuous but has a sharp corner, so it is not differentiable there. At \(x=-4\) there is a smooth local maximum, so \(f'(x)=0\) and \(f''(x)\lt 0\). The left- and right-hand values near \(x=6\) approach different numbers, so the limit does not exist.</p>
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
        <p class="step-text">At \(x=8\) the graph is continuous but has a sharp corner, so it is not differentiable there. At \(x=-4\) there is a smooth local maximum, so \(f'(x)=0\) and \(f''(x)\lt 0\). The left- and right-hand values near \(x=6\) approach different numbers, so the limit does not exist.</p>
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
          f''(\sqrt{6})\lt 0 \Rightarrow \text{local maximum}
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
              f''(\sqrt{6})\lt 0,\qquad f''(-\sqrt{6})&gt;0
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
          f''(\sqrt{6})\lt 0 \Rightarrow \text{local maximum}
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
    "3e": Object.assign({
  "browserTitle": "2023 Differentiation Paper — Question 3(e)",
  "eyebrow": "Level 3 Differentiation Walkthrough",
  "title": "Question 3(e)",
  "subtitle": "2023 Paper — Verify a catenary differential equation",
  "backHref": "level-3-differentiation-2023.html",
  "nextHref": "level-3-differentiation-2023.html",
  "nextLabel": "Back to paper",
  "finalNav": {
    "secondary": {
      "href": "3d2023.html",
      "label": "← Back to Question 3(d)"
    },
    "primary": {
      "href": "level-3-differentiation-2023.html",
      "label": "Back to paper"
    }
  }
}, window.CALC_NZ_AUDIT_WALKTHROUGHS["level-3-differentiation-2023:3e"])
  };
}());
