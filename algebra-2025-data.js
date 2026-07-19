(function () {
  const raw = String.raw;
  const paperHref = "level-2-algebra-2025.html";

  function finalNav(nextHref, nextLabel) {
    return {
      secondary: {
        href: paperHref,
        label: "← Back to paper"
      },
      primary: {
        href: nextHref,
        label: nextLabel || "Next question →"
      }
    };
  }

  window.Algebra2025Walkthroughs = {
    "1a": {
      browserTitle: "2025 Level 2 Algebra Paper — Question 1(a)",
      eyebrow: "Level 2 Algebra Walkthrough",
      title: "Question 1(a)",
      subtitle: "2025 Paper — Simplify a radical expression",
      backHref: paperHref,
      nextHref: "alg-1b2025-l2.html",
      nextLabel: "Next question →",
      finalNav: finalNav("alg-1b2025-l2.html"),
      questionHtml: raw`
        <div class="question-math">
          \[
          \text{Simplify }5y\times\sqrt{\frac{y^6}{64}}.
          \]
        </div>
      `,
      hints: [
        raw`Simplify the square root first. Split it into \(\sqrt{y^6}\) and \(\sqrt{64}\).`,
        raw`\(\sqrt{y^6}=y^3\) and \(\sqrt{64}=8\), so the radical becomes \(\frac{y^3}{8}\).`,
        raw`Multiply \(5y\) by \(\frac{y^3}{8}\) and combine the powers of \(y\).`
      ],
      answerHtml: raw`
        <p class="step-text">Simplify the radical first:</p>
        <div class="math-block">
          \[
          \sqrt{\frac{y^6}{64}}=\frac{y^3}{8}
          \]
        </div>
        <p class="step-text">Then multiply by \(5y\):</p>
        <div class="math-block">
          \[
          5y\times\frac{y^3}{8}=\frac{5y^4}{8}
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Simplify the square root`,
          previewHtml: raw`The square root halves the power on \(y^6\) and turns \(64\) into \(8\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \sqrt{\frac{y^6}{64}}=\frac{\sqrt{y^6}}{\sqrt{64}}
              \]
            </div>

<p class="step-text">The square root halves the power on \(y^6\) and turns \(64\) into \(8\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{y^{3}}{8}
  \]
</div>
</div>`
        },
        {
          title: raw`Multiply through`,
          previewHtml: raw`\(5y\times\frac{y^3}{8}=\frac{5y^4}{8}\).`,
          workingHtml: raw`<p class="step-text">\(5y\times\frac{y^3}{8}=\frac{5y^4}{8}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{5 y^{4}}{8}
  \]
</div>
</div>

        <p class="step-text">Simplify the radical first:</p>
        <div class="math-block">
          \[
          \sqrt{\frac{y^6}{64}}=\frac{y^3}{8}
          \]
        </div>
        <p class="step-text">Then multiply by \(5y\):</p>
        <div class="math-block">
          \[
          5y\times\frac{y^3}{8}=\frac{5y^4}{8}
          \]
        </div>
      `
        }
      ]
    },
    "1b": {
      browserTitle: "2025 Level 2 Algebra Paper — Question 1(b)",
      eyebrow: "Level 2 Algebra Walkthrough",
      title: "Question 1(b)",
      subtitle: "2025 Paper — Rearrange to make x the subject",
      backHref: paperHref,
      nextHref: "alg-1c2025-l2.html",
      nextLabel: "Next question →",
      finalNav: finalNav("alg-1c2025-l2.html"),
      questionHtml: raw`
        <div class="question-math">
          \[
          2y=\sqrt[3]{7x-5}
          \]
        </div>
        <p class="step-text">Rearrange the expression to make \(x\) the subject.</p>
      `,
      hints: [
        raw`Undo the cube root first by cubing both sides.`,
        raw`After cubing, you should have \(8y^3=7x-5\).`,
        raw`Add \(5\), then divide by \(7\).`
      ],
      answerHtml: raw`
        <p class="step-text">Cube both sides:</p>
        <div class="math-block">
          \[
          (2y)^3=7x-5
          \]
          \[
          8y^3=7x-5
          \]
        </div>
        <p class="step-text">Rearrange for \(x\):</p>
        <div class="math-block">
          \[
          8y^3+5=7x
          \]
          \[
          x=\frac{8y^3+5}{7}
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Identify the first operation`,
          previewHtml: raw`Cubing is the inverse of taking a cube root.`,
          workingHtml: raw`<p class="step-text">Cubing is the inverse of taking a cube root.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Cube both sides
</div>`
        },
        {
          title: raw`Write the equation after cubing`,
          previewHtml: raw`\((2y)^3=8y^3\), so the equation becomes \(8y^3=7x-5\).`,
          workingHtml: raw`<p class="step-text">\((2y)^3=8y^3\), so the equation becomes \(8y^3=7x-5\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                8y^3=7x-5
              \]
</div>`
        },
        {
          title: raw`Make x the subject`,
          previewHtml: raw`Adding \(5\) and dividing by \(7\) gives \(x=\frac{8y^3+5}{7}\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              8y^3=7x-5
              \]
              \[
              8y^3+5=7x
              \]
            </div>

<p class="step-text">Adding \(5\) and dividing by \(7\) gives \(x=\frac{8y^3+5}{7}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{\left(8 y^{3} + 5\right)}{7}
  \]
</div>
</div>

        <p class="step-text">Cube both sides:</p>
        <div class="math-block">
          \[
          (2y)^3=7x-5
          \]
          \[
          8y^3=7x-5
          \]
        </div>
        <p class="step-text">Rearrange for \(x\):</p>
        <div class="math-block">
          \[
          8y^3+5=7x
          \]
          \[
          x=\frac{8y^3+5}{7}
          \]
        </div>
      `
        }
      ]
    },
    "1c": {
      browserTitle: "2025 Level 2 Algebra Paper — Question 1(c)",
      eyebrow: "Level 2 Algebra Walkthrough",
      title: "Question 1(c)",
      subtitle: "2025 Paper — Find a and b from a quadratic graph",
      backHref: paperHref,
      nextHref: "alg-1d2025-l2.html",
      nextLabel: "Next question →",
      finalNav: finalNav("alg-1d2025-l2.html"),
      questionHtml: raw`
        <div class="question-math">
          \[
          y=2x^2+ax+b
          \]
        </div>
        <p class="step-text">One of the x-intercepts is \((1.5,0)\), and the point \((-1,-5)\) lies on the graph.</p>
        <p class="step-text">Find the values of \(a\) and \(b\).</p>
      `,
      hints: [
        raw`Use the known root \(x=1.5\) to write the quadratic in factorised form.`,
        raw`A convenient form is \((2x-c)(x-1.5)\) so the leading coefficient stays \(2\).`,
        raw`Use the point \((-1,-5)\) to find \(c\), then expand and compare with \(2x^2+ax+b\).`
      ],
      answerHtml: raw`
        <p class="step-text">Start with a factorised form that uses the known root and leading coefficient:</p>
        <div class="math-block">
          \[
          y=(2x-c)(x-1.5)
          \]
        </div>
        <p class="step-text">Use \((-1,-5)\):</p>
        <div class="math-block">
          \[
          -5=(2(-1)-c)(-1-1.5)
          \]
          \[
          -5=(-2-c)(-2.5)
          \]
          \[
          c=-4
          \]
        </div>
        <p class="step-text">Substitute and expand:</p>
        <div class="math-block">
          \[
          y=(2x+4)(x-1.5)
          \]
          \[
          y=2x^2+x-6
          \]
        </div>
        <p class="step-text">So \(a=1\) and \(b=-6\).</p>
      `,
      guidedSteps: [
        {
          title: raw`Build the factorised form`,
          previewHtml: raw`That gives a factor of \((x-1.5)\) and still expands to a quadratic with leading term \(2x^2\).`,
          workingHtml: raw`<p class="step-text">That gives a factor of \((x-1.5)\) and still expands to a quadratic with leading term \(2x^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                (2x-c)(x-1.5)
              \]
</div>`
        },
        {
          title: raw`Find c`,
          previewHtml: raw`Using \((-1,-5)\) gives \((-2-c)(-2.5)=-5\), so \(c=-4\).`,
          workingHtml: raw`<p class="step-text">Using \((-1,-5)\) gives \((-2-c)(-2.5)=-5\), so \(c=-4\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  -4
  \]
</div>
</div>`
        },
        {
          title: raw`Expand the quadratic`,
          previewHtml: raw`\((2x+4)(x-1.5)\) expands to \(2x^2+x-6\).`,
          workingHtml: raw`<p class="step-text">\((2x+4)(x-1.5)\) expands to \(2x^2+x-6\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  2 x^{2} + x - 6
  \]
</div>
</div>`
        },
        {
          title: raw`Read off a and b`,
          previewHtml: raw`Comparing \(2x^2+x-6\) with \(2x^2+ax+b\) gives \(a=1\) and \(b=-6\).`,
          workingHtml: raw`<p class="step-text">Comparing \(2x^2+x-6\) with \(2x^2+ax+b\) gives \(a=1\) and \(b=-6\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(a=1,\ b=-6\)
</div>

        <p class="step-text">Start with a factorised form that uses the known root and leading coefficient:</p>
        <div class="math-block">
          \[
          y=(2x-c)(x-1.5)
          \]
        </div>
        <p class="step-text">Use \((-1,-5)\):</p>
        <div class="math-block">
          \[
          -5=(2(-1)-c)(-1-1.5)
          \]
          \[
          -5=(-2-c)(-2.5)
          \]
          \[
          c=-4
          \]
        </div>
        <p class="step-text">Substitute and expand:</p>
        <div class="math-block">
          \[
          y=(2x+4)(x-1.5)
          \]
          \[
          y=2x^2+x-6
          \]
        </div>
        <p class="step-text">So \(a=1\) and \(b=-6\).</p>
      `
        }
      ]
    },
    "1d": {
      browserTitle: "2025 Level 2 Algebra Paper — Question 1(d)",
      eyebrow: "Level 2 Algebra Walkthrough",
      title: "Question 1(d)",
      subtitle: "2025 Paper — Express the rectangle area in terms of r",
      backHref: paperHref,
      nextHref: "alg-1e2025-l2.html",
      nextLabel: "Next question →",
      finalNav: finalNav("alg-1e2025-l2.html"),
      questionHtml: raw`
        <p class="step-text">A rectangle is inscribed in a circle of radius \(r\), as shown below. The length of the rectangle is twice its width.</p>
        <div class="graph-frame question-graph-frame">
          <svg class="graph-svg" viewBox="0 0 360 280" aria-label="Rectangle inscribed in a circle of radius r" role="img">
            <circle cx="180" cy="140" r="108" class="question-curve" />

            <line x1="16" y1="140" x2="344" y2="140" class="graph-axis" />
            <polygon points="10,140 18,134 18,146" fill="#111827"></polygon>
            <polygon points="350,140 342,134 342,146" fill="#111827"></polygon>

            <line x1="180" y1="16" x2="180" y2="264" class="graph-axis" />
            <polygon points="180,10 174,18 186,18" fill="#111827"></polygon>
            <polygon points="180,270 174,262 186,262" fill="#111827"></polygon>

            <rect x="84" y="92" width="192" height="96" fill="#e5e7eb" stroke="#111827" stroke-width="2"></rect>

            <line x1="180" y1="140" x2="276" y2="92" stroke="#111827" stroke-width="2" stroke-dasharray="8 8"></line>
            <circle cx="276" cy="92" r="4.5" class="question-dot" />
            <text x="214" y="132" class="graph-label question-label-mark">r</text>
          </svg>
        </div>
        <p class="step-text">Find a fully simplified expression for the area of the rectangle in terms of \(r\).</p>
        <div class="question-math">
          \[
          \text{Pythagoras' Theorem: }a^2+b^2=c^2
          \]
        </div>
      `,
      questionNotes: [
        raw`If the width is \(x\), then the length is \(2x\), so the area is \(x\times 2x\).`
      ],
      hints: [
        raw`Let the width be \(x\), so the length is \(2x\) and the area is \(2x^2\).`,
        raw`Use half the width and half the length with the radius to form a right triangle.`,
        raw`From Pythagoras, find \(x^2\) in terms of \(r^2\), then substitute into \(A=2x^2\).`
      ],
      answerHtml: raw`
        <p class="step-text">Let the width be \(x\), so the length is \(2x\):</p>
        <div class="math-block">
          \[
          A=2x^2
          \]
        </div>
        <p class="step-text">Use half the rectangle to form a right triangle:</p>
        <div class="math-block">
          \[
          r^2=x^2+\left(\frac{x}{2}\right)^2
          \]
          \[
          r^2=\frac{5x^2}{4}
          \]
          \[
          x^2=\frac{4r^2}{5}
          \]
        </div>
        <p class="step-text">Substitute into the area:</p>
        <div class="math-block">
          \[
          A=2\left(\frac{4r^2}{5}\right)=\frac{8r^2}{5}=1.6r^2
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Write the area in terms of x`,
          previewHtml: raw`Width times length gives \(A=x(2x)=2x^2\).`,
          workingHtml: raw`<p class="step-text">Width times length gives \(A=x(2x)=2x^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  2 x^{2}
  \]
</div>
</div>`
        },
        {
          title: raw`Use Pythagoras`,
          previewHtml: raw`The triangle uses legs \(x\) and \(\frac{x}{2}\), with hypotenuse \(r\).`,
          workingHtml: raw`<p class="step-text">The triangle uses legs \(x\) and \(\frac{x}{2}\), with hypotenuse \(r\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  r^{2} = x^{2} + \left(\frac{x}{2}\right)^{2}
  \]
</div>
</div>`
        },
        {
          title: raw`Rearrange for x squared`,
          previewHtml: raw`From \(r^2=\frac{5x^2}{4}\), multiplying by \(\frac{4}{5}\) gives \(x^2=\frac{4r^2}{5}\).`,
          workingHtml: raw`<p class="step-text">From \(r^2=\frac{5x^2}{4}\), multiplying by \(\frac{4}{5}\) gives \(x^2=\frac{4r^2}{5}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  x^{2} = \frac{4 r^{2}}{5}
  \]
</div>
</div>`
        },
        {
          title: raw`Write the final area`,
          previewHtml: raw`The area simplifies to \(A=\frac{8r^2}{5}=1.6r^2\).`,
          workingHtml: raw`<p class="step-text">The area simplifies to \(A=\frac{8r^2}{5}=1.6r^2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{8 r^{2}}{5}
  \]
</div>
</div>

        <p class="step-text">Let the width be \(x\), so the length is \(2x\):</p>
        <div class="math-block">
          \[
          A=2x^2
          \]
        </div>
        <p class="step-text">Use half the rectangle to form a right triangle:</p>
        <div class="math-block">
          \[
          r^2=x^2+\left(\frac{x}{2}\right)^2
          \]
          \[
          r^2=\frac{5x^2}{4}
          \]
          \[
          x^2=\frac{4r^2}{5}
          \]
        </div>
        <p class="step-text">Substitute into the area:</p>
        <div class="math-block">
          \[
          A=2\left(\frac{4r^2}{5}\right)=\frac{8r^2}{5}=1.6r^2
          \]
        </div>
      `
        }
      ]
    },
    "1e": {
      browserTitle: "2025 Level 2 Algebra Paper — Question 1(e)",
      eyebrow: "Level 2 Algebra Walkthrough",
      title: "Question 1(e)",
      subtitle: "2025 Paper — Solve an exponential equation",
      backHref: paperHref,
      nextHref: "alg-2a2025-l2.html",
      nextLabel: "Next question →",
      finalNav: finalNav("alg-2a2025-l2.html"),
      questionHtml: raw`
        <div class="question-math">
          \[
          5^{2x+1}-120=5^{x+2}
          \]
        </div>
        <p class="step-text">Solve the equation.</p>
        <p class="step-text"><strong>Hint:</strong> Let \(u=5^x\).</p>
      `,
      hints: [
        raw`Rewrite \(5^{2x+1}\) as \(5(5^x)^2\) and \(5^{x+2}\) as \(25(5^x)\).`,
        raw`Let \(u=5^x\), divide through by \(5\), and solve the quadratic \(u^2-5u-24=0\).`,
        raw`Use the positive value of \(u\), then solve \(5^x=8\).`
      ],
      answerHtml: raw`
        <p class="step-text">Rewrite the powers of \(5\):</p>
        <div class="math-block">
          \[
          5(5^x)^2-120=25(5^x)
          \]
          \[
          (5^x)^2-5(5^x)-24=0
          \]
        </div>
        <p class="step-text">Let \(u=5^x\):</p>
        <div class="math-block">
          \[
          u^2-5u-24=0
          \]
          \[
          (u-8)(u+3)=0
          \]
          \[
          u=8
          \]
        </div>
        <p class="step-text">Now solve for \(x\):</p>
        <div class="math-block">
          \[
          5^x=8
          \]
          \[
          x=\log_5 8\approx 1.292
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Rewrite using 5 to the x`,
          previewHtml: raw`That makes the substitution \(u=5^x\) straightforward.`,
          workingHtml: raw`<p class="step-text">That makes the substitution \(u=5^x\) straightforward.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                5(5^x)^2-120=25(5^x)
              \]
</div>`
        },
        {
          title: raw`Form the quadratic`,
          previewHtml: raw`The substitution gives \(u^2-5u-24=0\).`,
          workingHtml: raw`<p class="step-text">The substitution gives \(u^2-5u-24=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  u^{2} - 5 u - 24 = 0
  \]
</div>
</div>`
        },
        {
          title: raw`Identify the valid value of u`,
          previewHtml: raw`The quadratic roots are \(8\) and \(-3\), but \(u=5^x\) must be positive, so \(u=8\).`,
          workingHtml: raw`<p class="step-text">The quadratic roots are \(8\) and \(-3\), but \(u=5^x\) must be positive, so \(u=8\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                u=8
              \]
</div>`
        },
        {
          title: raw`Solve for x`,
          previewHtml: raw`\(x=\log_5 8\approx 1.292\).`,
          workingHtml: raw`<p class="step-text">\(x=\log_5 8\approx 1.292\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{\ln\left(8\right)}{\ln\left(5\right)}
  \]
</div>
</div>

        <p class="step-text">Rewrite the powers of \(5\):</p>
        <div class="math-block">
          \[
          5(5^x)^2-120=25(5^x)
          \]
          \[
          (5^x)^2-5(5^x)-24=0
          \]
        </div>
        <p class="step-text">Let \(u=5^x\):</p>
        <div class="math-block">
          \[
          u^2-5u-24=0
          \]
          \[
          (u-8)(u+3)=0
          \]
          \[
          u=8
          \]
        </div>
        <p class="step-text">Now solve for \(x\):</p>
        <div class="math-block">
          \[
          5^x=8
          \]
          \[
          x=\log_5 8\approx 1.292
          \]
        </div>
      `
        }
      ]
    },
    "2a": {
      browserTitle: "2025 Level 2 Algebra Paper — Question 2(a)",
      eyebrow: "Level 2 Algebra Walkthrough",
      title: "Question 2(a)",
      subtitle: "2025 Paper — Complete the square",
      backHref: paperHref,
      nextHref: "alg-2b2025-l2.html",
      nextLabel: "Next question →",
      finalNav: finalNav("alg-2b2025-l2.html"),
      questionHtml: raw`
        <div class="question-math">
          \[
          9x^2-30x+k
          \]
        </div>
        <p class="step-text">What is the value of \(k\) needed to write the expression as a perfect square?</p>
      `,
      hints: [
        raw`A perfect square here should start with \((3x\pm\ ?)^2\) because \((3x)^2=9x^2\).`,
        raw`To get the middle term \(-30x\), the bracket must be \((3x-5)^2\).`,
        raw`Expand \((3x-5)^2\) and read off the constant term.`
      ],
      answerHtml: raw`
        <p class="step-text">The perfect square must be:</p>
        <div class="math-block">
          \[
          (3x-5)^2
          \]
          \[
          =9x^2-30x+25
          \]
        </div>
        <p class="step-text">So \(k=25\).</p>
      `,
      guidedSteps: [
        {
          title: raw`Identify the perfect square`,
          previewHtml: raw`Expanding gives the required middle term \(-30x\).`,
          workingHtml: raw`<p class="step-text">Expanding gives the required middle term \(-30x\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                (3x-5)^2
              \]
</div>`
        },
        {
          title: raw`Read off k`,
          previewHtml: raw`Since \(9x^2-30x+k=(3x-5)^2\), the constant term must be \(25\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              (3x-5)^2=9x^2-30x+25
              \]
            </div>

<p class="step-text">Since \(9x^2-30x+k=(3x-5)^2\), the constant term must be \(25\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                25
              \]
</div>

        <p class="step-text">The perfect square must be:</p>
        <div class="math-block">
          \[
          (3x-5)^2
          \]
          \[
          =9x^2-30x+25
          \]
        </div>
        <p class="step-text">So \(k=25\).</p>
      `
        }
      ]
    },
    "2b": {
      browserTitle: "2025 Level 2 Algebra Paper — Question 2(b)",
      eyebrow: "Level 2 Algebra Walkthrough",
      title: "Question 2(b)",
      subtitle: "2025 Paper — Simplify an algebraic fraction",
      backHref: paperHref,
      nextHref: "alg-2c2025-l2.html",
      nextLabel: "Next question →",
      finalNav: finalNav("alg-2c2025-l2.html"),
      questionHtml: raw`
        <div class="question-math">
          \[
          \frac{6x^3+26x^2-20x}{5x^2+23x-10}
          \]
        </div>
        <p class="step-text">Simplify fully.</p>
      `,
      hints: [
        raw`Factorise the numerator completely. There is a common factor of \(2x\).`,
        raw`Factorise the denominator and look for a common factor to cancel.`,
        raw`Keep the cancelled factor's restriction in mind after simplifying.`
      ],
      answerHtml: raw`
        <p class="step-text">Factorise the numerator and denominator:</p>
        <div class="math-block">
          \[
          6x^3+26x^2-20x=2x(3x-2)(x+5)
          \]
          \[
          5x^2+23x-10=(5x-2)(x+5)
          \]
        </div>
        <p class="step-text">Cancel the common factor:</p>
        <div class="math-block">
          \[
          \frac{6x^3+26x^2-20x}{5x^2+23x-10}
          =\frac{2x(3x-2)}{5x-2}
          \]
        </div>
        <p class="step-text">Because \((x+5)\) was cancelled, state \(x\neq -5\).</p>
      `,
      guidedSteps: [
        {
          title: raw`Factorise the numerator`,
          previewHtml: raw`Taking out \(2x\) leaves a quadratic that factorises as \((3x-2)(x+5)\).`,
          workingHtml: raw`<p class="step-text">Taking out \(2x\) leaves a quadratic that factorises as \((3x-2)(x+5)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  2 x \left(3 x - 2\right) \left(x + 5\right)
  \]
</div>
</div>`
        },
        {
          title: raw`Factorise the denominator`,
          previewHtml: raw`The denominator factorises to \((5x-2)(x+5)\).`,
          workingHtml: raw`<p class="step-text">The denominator factorises to \((5x-2)(x+5)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \left(5 x - 2\right) \left(x + 5\right)
  \]
</div>
</div>`
        },
        {
          title: raw`Cancel the common factor`,
          previewHtml: raw`Cancelling the common factor \((x+5)\) leaves \(\frac{2x(3x-2)}{5x-2}\).`,
          workingHtml: raw`<p class="step-text">Cancelling the common factor \((x+5)\) leaves \(\frac{2x(3x-2)}{5x-2}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{2 x \left(3 x - 2\right)}{\left(5 x - 2\right)}
  \]
</div>
</div>`
        },
        {
          title: raw`State the restriction`,
          previewHtml: raw`The cancelled factor \((x+5)\) means the original expression was undefined at \(x=-5\).`,
          workingHtml: raw`<p class="step-text">The cancelled factor \((x+5)\) means the original expression was undefined at \(x=-5\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x\neq -5
              \]
</div>

        <p class="step-text">Factorise the numerator and denominator:</p>
        <div class="math-block">
          \[
          6x^3+26x^2-20x=2x(3x-2)(x+5)
          \]
          \[
          5x^2+23x-10=(5x-2)(x+5)
          \]
        </div>
        <p class="step-text">Cancel the common factor:</p>
        <div class="math-block">
          \[
          \frac{6x^3+26x^2-20x}{5x^2+23x-10}
          =\frac{2x(3x-2)}{5x-2}
          \]
        </div>
        <p class="step-text">Because \((x+5)\) was cancelled, state \(x\neq -5\).</p>
      `
        }
      ]
    },
    "2c": {
      browserTitle: "2025 Level 2 Algebra Paper — Question 2(c)",
      eyebrow: "Level 2 Algebra Walkthrough",
      title: "Question 2(c)",
      subtitle: "2025 Paper — Solve and identify a and b",
      backHref: paperHref,
      nextHref: "alg-2d2025-l2.html",
      nextLabel: "Next question →",
      finalNav: finalNav("alg-2d2025-l2.html"),
      questionHtml: raw`
        <div class="question-math">
          \[
          \frac{10}{(3x-1)^2}=2
          \]
        </div>
        <p class="step-text">The solutions can be written in the form \(\frac{1+\sqrt{a}}{b}\) and \(\frac{1-\sqrt{a}}{b}\).</p>
        <p class="step-text">Find the values of \(a\) and \(b\).</p>
      `,
      hints: [
        raw`Clear the denominator first and rearrange into a quadratic equation.`,
        raw`A simplified quadratic is \(9x^2-6x-4=0\).`,
        raw`Solve for \(x\), then compare the solution form with \(\frac{1\pm\sqrt{a}}{b}\).`
      ],
      answerHtml: raw`
        <p class="step-text">Clear the denominator and rearrange:</p>
        <div class="math-block">
          \[
          10=2(3x-1)^2
          \]
          \[
          10=18x^2-12x+2
          \]
          \[
          18x^2-12x-8=0
          \]
          \[
          9x^2-6x-4=0
          \]
        </div>
        <p class="step-text">Solve the quadratic:</p>
        <div class="math-block">
          \[
          x=\frac{6\pm\sqrt{36+144}}{18}
          =\frac{6\pm 6\sqrt{5}}{18}
          =\frac{1\pm\sqrt{5}}{3}
          \]
        </div>
        <p class="step-text">So \(a=5\) and \(b=3\).</p>
      `,
      guidedSteps: [
        {
          title: raw`Form the quadratic equation`,
          previewHtml: raw`Rearranging gives the quadratic \(9x^2-6x-4=0\).`,
          workingHtml: raw`<p class="step-text">Rearranging gives the quadratic \(9x^2-6x-4=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  9 x^{2} - 6 x - 4 = 0
  \]
</div>
</div>`
        },
        {
          title: raw`Solve for x`,
          previewHtml: raw`Those are the two solutions after simplifying the quadratic-formula result.`,
          workingHtml: raw`
            <div class="math-block">
              \[
              9x^2-6x-4=0
              \]
              \[
              x=\frac{6\pm\sqrt{(-6)^2-4(9)(-4)}}{18}
              \]
            </div>

<p class="step-text">Those are the two solutions after simplifying the quadratic-formula result.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x=\frac{1+\sqrt{5}}{3}\quad\text{or}\quad x=\frac{1-\sqrt{5}}{3}
              \]
</div>`
        },
        {
          title: raw`Read off a and b`,
          previewHtml: raw`Comparing \(\frac{1\pm\sqrt{5}}{3}\) with \(\frac{1\pm\sqrt{a}}{b}\) gives \(a=5\) and \(b=3\).`,
          workingHtml: raw`<p class="step-text">Comparing \(\frac{1\pm\sqrt{5}}{3}\) with \(\frac{1\pm\sqrt{a}}{b}\) gives \(a=5\) and \(b=3\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(a=5,\ b=3\)
</div>

        <p class="step-text">Clear the denominator and rearrange:</p>
        <div class="math-block">
          \[
          10=2(3x-1)^2
          \]
          \[
          10=18x^2-12x+2
          \]
          \[
          18x^2-12x-8=0
          \]
          \[
          9x^2-6x-4=0
          \]
        </div>
        <p class="step-text">Solve the quadratic:</p>
        <div class="math-block">
          \[
          x=\frac{6\pm\sqrt{36+144}}{18}
          =\frac{6\pm 6\sqrt{5}}{18}
          =\frac{1\pm\sqrt{5}}{3}
          \]
        </div>
        <p class="step-text">So \(a=5\) and \(b=3\).</p>
      `
        }
      ]
    },
    "2d": {
      browserTitle: "2025 Level 2 Algebra Paper — Question 2(d)",
      eyebrow: "Level 2 Algebra Walkthrough",
      title: "Question 2(d)",
      subtitle: "2025 Paper — Solve a logarithmic equation",
      backHref: paperHref,
      nextHref: "alg-2e2025-l2.html",
      nextLabel: "Next question →",
      finalNav: finalNav("alg-2e2025-l2.html"),
      questionHtml: raw`
        <div class="question-math">
          \[
          2\log_5(x+6)-\log_5 x-2=0
          \]
        </div>
        <p class="step-text">Solve the equation.</p>
      `,
      hints: [
        raw`Move the \(2\) to the other side, then combine the logarithms on the left.`,
        raw`The single logarithm should have argument \(\frac{(x+6)^2}{x}\).`,
        raw`Take the equation out of logarithmic form, solve the quadratic, and keep valid values of \(x\).`
      ],
      answerHtml: raw`
        <p class="step-text">Combine the logs:</p>
        <div class="math-block">
          \[
          2\log_5(x+6)-\log_5 x=2
          \]
          \[
          \log_5\left(\frac{(x+6)^2}{x}\right)=2
          \]
        </div>
        <p class="step-text">Take the equation out of log form:</p>
        <div class="math-block">
          \[
          \frac{(x+6)^2}{x}=25
          \]
          \[
          x^2-13x+36=0
          \]
          \[
          (x-4)(x-9)=0
          \]
        </div>
        <p class="step-text">So the solutions are \(x=4\) and \(x=9\).</p>
      `,
      guidedSteps: [
        {
          title: raw`Combine into one logarithm`,
          previewHtml: raw`\(2\log_5(x+6)=\log_5((x+6)^2)\), so the argument becomes \(\frac{(x+6)^2}{x}\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              2\log_5(x+6)-\log_5 x=2
              \]
              \[
              \log_5(\square)=2
              \]
            </div>

<p class="step-text">\(2\log_5(x+6)=\log_5((x+6)^2)\), so the argument becomes \(\frac{(x+6)^2}{x}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{(x+6)^2}{x}
              \]
</div>`
        },
        {
          title: raw`Take it out of log form`,
          previewHtml: raw`If \(\log_5(\text{expression})=2\), then the expression must equal \(5^2=25\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \log_5\left(\frac{(x+6)^2}{x}\right)=2
              \]
            </div>

<p class="step-text">If \(\log_5(\text{expression})=2\), then the expression must equal \(5^2=25\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                \frac{(x+6)^2}{x}=25
              \]
</div>`
        },
        {
          title: raw`Solve the equation`,
          previewHtml: raw`Solving the quadratic gives \(x=4\) and \(x=9\).`,
          workingHtml: raw`<p class="step-text">Solving the quadratic gives \(x=4\) and \(x=9\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                x=4,\ 9
              \]
</div>

        <p class="step-text">Combine the logs:</p>
        <div class="math-block">
          \[
          2\log_5(x+6)-\log_5 x=2
          \]
          \[
          \log_5\left(\frac{(x+6)^2}{x}\right)=2
          \]
        </div>
        <p class="step-text">Take the equation out of log form:</p>
        <div class="math-block">
          \[
          \frac{(x+6)^2}{x}=25
          \]
          \[
          x^2-13x+36=0
          \]
          \[
          (x-4)(x-9)=0
          \]
        </div>
        <p class="step-text">So the solutions are \(x=4\) and \(x=9\).</p>
      `
        }
      ]
    },
    "2e": {
      browserTitle: "2025 Level 2 Algebra Paper — Question 2(e)",
      eyebrow: "Level 2 Algebra Walkthrough",
      title: "Question 2(e)",
      subtitle: "2025 Paper — Use a repeated solution to find k",
      backHref: paperHref,
      nextHref: "alg-3a2025-l2.html",
      nextLabel: "Next question →",
      finalNav: finalNav("alg-3a2025-l2.html"),
      questionHtml: raw`
        <div class="question-math">
          \[
          y-2x=13
          \]
          \[
          x^2+2ky=6k
          \]
        </div>
        <p class="step-text">Here \(k\) is a non-zero constant.</p>
        <p class="step-text">Given that there is only one solution to the simultaneous equations, find the value of \(k\), then find the solution.</p>
      `,
      hints: [
        raw`Start by making \(y\) the subject in the linear equation.`,
        raw`Substitute into the second equation to get a quadratic in \(x\).`,
        raw`Since there is only one solution, the discriminant of that quadratic must be \(0\).`
      ],
      answerHtml: raw`
        <p class="step-text">Rearrange the linear equation:</p>
        <div class="math-block">
          \[
          y=2x+13
          \]
        </div>
        <p class="step-text">Substitute into the second equation:</p>
        <div class="math-block">
          \[
          x^2+2k(2x+13)=6k
          \]
          \[
          x^2+4kx+20k=0
          \]
        </div>
        <p class="step-text">Use the discriminant:</p>
        <div class="math-block">
          \[
          (4k)^2-4(1)(20k)=0
          \]
          \[
          16k^2-80k=0
          \]
          \[
          16k(k-5)=0
          \]
          \[
          k=5
          \]
        </div>
        <p class="step-text">Now solve:</p>
        <div class="math-block">
          \[
          x^2+20x+100=0
          \]
          \[
          (x+10)^2=0
          \]
          \[
          x=-10,\qquad y=-7
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Make y the subject`,
          previewHtml: raw`Adding \(2x\) to both sides gives \(y=2x+13\).`,
          workingHtml: raw`<p class="step-text">Adding \(2x\) to both sides gives \(y=2x+13\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  y = 2 x + 13
  \]
</div>
</div>`
        },
        {
          title: raw`Substitute into the second equation`,
          previewHtml: raw`Substituting \(y=2x+13\) gives \(x^2+4kx+20k=0\).`,
          workingHtml: raw`<p class="step-text">Substituting \(y=2x+13\) gives \(x^2+4kx+20k=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  x^{2} + 4 k x + 20 k = 0
  \]
</div>
</div>`
        },
        {
          title: raw`Use the repeated-root condition`,
          previewHtml: raw`Setting the discriminant to \(0\) gives \(16k^2-80k=0\), so \(k=5\) because \(k\neq 0\).`,
          workingHtml: raw`<p class="step-text">Setting the discriminant to \(0\) gives \(16k^2-80k=0\), so \(k=5\) because \(k\neq 0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                5
              \]
</div>`
        },
        {
          title: raw`Find the simultaneous solution`,
          previewHtml: raw`With \(k=5\), the equations meet at \((-10,-7)\).`,
          workingHtml: raw`<p class="step-text">With \(k=5\), the equations meet at \((-10,-7)\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                (-10,-7)
              \]
</div>

        <p class="step-text">Rearrange the linear equation:</p>
        <div class="math-block">
          \[
          y=2x+13
          \]
        </div>
        <p class="step-text">Substitute into the second equation:</p>
        <div class="math-block">
          \[
          x^2+2k(2x+13)=6k
          \]
          \[
          x^2+4kx+20k=0
          \]
        </div>
        <p class="step-text">Use the discriminant:</p>
        <div class="math-block">
          \[
          (4k)^2-4(1)(20k)=0
          \]
          \[
          16k^2-80k=0
          \]
          \[
          16k(k-5)=0
          \]
          \[
          k=5
          \]
        </div>
        <p class="step-text">Now solve:</p>
        <div class="math-block">
          \[
          x^2+20x+100=0
          \]
          \[
          (x+10)^2=0
          \]
          \[
          x=-10,\qquad y=-7
          \]
        </div>
      `
        }
      ]
    },
    "3a": {
      browserTitle: "2025 Level 2 Algebra Paper — Question 3(a)",
      eyebrow: "Level 2 Algebra Walkthrough",
      title: "Question 3(a)",
      subtitle: "2025 Paper — Solve a logarithm with a variable base",
      backHref: paperHref,
      nextHref: "alg-3b2025-l2.html",
      nextLabel: "Next question →",
      finalNav: finalNav("alg-3b2025-l2.html"),
      questionHtml: raw`
        <div class="question-math">
          \[
          \log_{\sqrt{x}}8=6
          \]
        </div>
        <p class="step-text">Solve the equation.</p>
      `,
      hints: [
        raw`Take the logarithm out of log form first.`,
        raw`\((\sqrt{x})^6=(x^{1/2})^6=x^3\).`,
        raw`Solve the equation \(x^3=8\).`
      ],
      answerHtml: raw`
        <p class="step-text">Take the equation out of log form:</p>
        <div class="math-block">
          \[
          (\sqrt{x})^6=8
          \]
          \[
          (x^{1/2})^6=x^3
          \]
          \[
          x^3=8
          \]
        </div>
        <p class="step-text">So \(x=2\).</p>
      `,
      guidedSteps: [
        {
          title: raw`Remove the logarithm`,
          previewHtml: raw`Follow the working to remove the logarithm.`,
          workingHtml: raw`<p class="step-text">The logarithm says \((\sqrt{x})^6=8\), which simplifies to \(x^3=8\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \left(\sqrt{x}\right)^{6} = 8
  \]
</div>
</div>`
        },
        {
          title: raw`Simplify the power`,
          previewHtml: raw`\((x^{1/2})^6=x^3\), so the equation is \(x^3=8\).`,
          workingHtml: raw`<p class="step-text">\((x^{1/2})^6=x^3\), so the equation is \(x^3=8\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  x^{3} = 8
  \]
</div>
</div>`
        },
        {
          title: raw`Solve for x`,
          previewHtml: raw`The solution is \(x=2\).`,
          workingHtml: raw`<p class="step-text">The solution is \(x=2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  2
  \]
</div>
</div>

        <p class="step-text">Take the equation out of log form:</p>
        <div class="math-block">
          \[
          (\sqrt{x})^6=8
          \]
          \[
          (x^{1/2})^6=x^3
          \]
          \[
          x^3=8
          \]
        </div>
        <p class="step-text">So \(x=2\).</p>
      `
        }
      ]
    },
    "3b": {
      browserTitle: "2025 Level 2 Algebra Paper — Question 3(b)",
      eyebrow: "Level 2 Algebra Walkthrough",
      title: "Question 3(b)",
      subtitle: "2025 Paper — Build the quadratic from its roots",
      backHref: paperHref,
      nextHref: "alg-3c2025-l2.html",
      nextLabel: "Next question →",
      finalNav: finalNav("alg-3c2025-l2.html"),
      questionHtml: raw`
        <div class="question-math">
          \[
          ax^2+bx+c=0
          \]
        </div>
        <p class="step-text">The equation has solutions \(\frac{1}{5}\) and \(-\frac{2}{3}\).</p>
        <p class="step-text">Find the values of the integers \(a\), \(b\), and \(c\).</p>
      `,
      hints: [
        raw`If the roots are \(\frac{1}{5}\) and \(-\frac{2}{3}\), the factors are \((5x-1)\) and \((3x+2)\).`,
        raw`Expand the product to get the quadratic equation.`,
        raw`Then read off the coefficients of \(x^2\), \(x\), and the constant term.`
      ],
      answerHtml: raw`
        <p class="step-text">Write the factorised equation:</p>
        <div class="math-block">
          \[
          (5x-1)(3x+2)=0
          \]
        </div>
        <p class="step-text">Expand:</p>
        <div class="math-block">
          \[
          15x^2+7x-2=0
          \]
        </div>
        <p class="step-text">So \(a=15\), \(b=7\), and \(c=-2\).</p>
      `,
      guidedSteps: [
        {
          title: raw`Write the factorised equation`,
          previewHtml: raw`Those factors give roots \(x=\frac{1}{5}\) and \(x=-\frac{2}{3}\).`,
          workingHtml: raw`<p class="step-text">Those factors give roots \(x=\frac{1}{5}\) and \(x=-\frac{2}{3}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \left(5 x - 1\right) \left(3 x + 2\right) = 0
  \]
</div>
</div>`
        },
        {
          title: raw`Expand the equation`,
          previewHtml: raw`Expanding gives \(15x^2+7x-2=0\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              (5x-1)(3x+2)=0
              \]
            </div>

<p class="step-text">Expanding gives \(15x^2+7x-2=0\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  15 x^{2} + 7 x - 2 = 0
  \]
</div>
</div>`
        },
        {
          title: raw`Read off a, b, and c`,
          previewHtml: raw`Comparing with \(ax^2+bx+c=0\) gives \(a=15\), \(b=7\), and \(c=-2\).`,
          workingHtml: raw`<p class="step-text">Comparing with \(ax^2+bx+c=0\) gives \(a=15\), \(b=7\), and \(c=-2\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \(a=15,\ b=7,\ c=-2\)
</div>

        <p class="step-text">Write the factorised equation:</p>
        <div class="math-block">
          \[
          (5x-1)(3x+2)=0
          \]
        </div>
        <p class="step-text">Expand:</p>
        <div class="math-block">
          \[
          15x^2+7x-2=0
          \]
        </div>
        <p class="step-text">So \(a=15\), \(b=7\), and \(c=-2\).</p>
      `
        }
      ]
    },
    "3c": {
      browserTitle: "2025 Level 2 Algebra Paper — Question 3(c)",
      eyebrow: "Level 2 Algebra Walkthrough",
      title: "Question 3(c)",
      subtitle: "2025 Paper — Rewrite a logarithm in terms of p and q",
      backHref: paperHref,
      nextHref: "alg-3d2025-l2.html",
      nextLabel: "Next question →",
      finalNav: finalNav("alg-3d2025-l2.html"),
      questionHtml: raw`
        <p class="step-text">If \(p=\log_a 3\) and \(q=\log_a 5\), write \(\log_a 75\) in terms of \(p\) and \(q\).</p>
      `,
      hints: [
        raw`Factorise \(75\) into powers of \(3\) and \(5\).`,
        raw`Use the product rule for logarithms: \(\log_a(mn)=\log_a m+\log_a n\).`,
        raw`Then replace \(\log_a 3\) with \(p\) and \(\log_a 5\) with \(q\).`
      ],
      answerHtml: raw`
        <p class="step-text">Factorise \(75\):</p>
        <div class="math-block">
          \[
          75=3\times 5^2
          \]
        </div>
        <p class="step-text">Use log laws:</p>
        <div class="math-block">
          \[
          \log_a 75=\log_a 3+\log_a 5^2
          \]
          \[
          \log_a 75=\log_a 3+2\log_a 5
          \]
          \[
          \log_a 75=p+2q
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Rewrite 75 in a useful way`,
          previewHtml: raw`That matches the given values \(p=\log_a 3\) and \(q=\log_a 5\).`,
          workingHtml: raw`<p class="step-text">That matches the given values \(p=\log_a 3\) and \(q=\log_a 5\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                75=3\times 5^2
              \]
</div>`
        },
        {
          title: raw`Substitute p and q`,
          previewHtml: raw`\(\log_a 75=\log_a 3+2\log_a 5=p+2q\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              \log_a 75=\log_a(3\times 5^2)
              \]
              \[
              \log_a 75=\log_a 3+2\log_a 5
              \]
            </div>

<p class="step-text">\(\log_a 75=\log_a 3+2\log_a 5=p+2q\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                p+2q
              \]
</div>

        <p class="step-text">Factorise \(75\):</p>
        <div class="math-block">
          \[
          75=3\times 5^2
          \]
        </div>
        <p class="step-text">Use log laws:</p>
        <div class="math-block">
          \[
          \log_a 75=\log_a 3+\log_a 5^2
          \]
          \[
          \log_a 75=\log_a 3+2\log_a 5
          \]
          \[
          \log_a 75=p+2q
          \]
        </div>
      `
        }
      ]
    },
    "3d": {
      browserTitle: "2025 Level 2 Algebra Paper — Question 3(d)",
      eyebrow: "Level 2 Algebra Walkthrough",
      title: "Question 3(d)",
      subtitle: "2025 Paper — Express a squared plus b squared in terms of m and n",
      backHref: paperHref,
      nextHref: "alg-3e2025-l2.html",
      nextLabel: "Next question →",
      finalNav: finalNav("alg-3e2025-l2.html"),
      questionHtml: raw`
        <p class="step-text">An expression for the sum of two squares can be written as \(a^2+b^2=(a+b)^2-2ab\).</p>
        <p class="step-text">If \(a\) and \(b\) are solutions of \(x^2-mx+n=0\), find an expression for \(a^2+b^2\) in terms of \(m\) and \(n\).</p>
      `,
      hints: [
        raw`Use the given identity \(a^2+b^2=(a+b)^2-2ab\).`,
        raw`If \(a\) and \(b\) are roots of \(x^2-mx+n=0\), then \(a+b=m\) and \(ab=n\).`,
        raw`Substitute those results into the identity.`
      ],
      answerHtml: raw`
        <p class="step-text">For the quadratic \(x^2-mx+n=0\), the root relationships are:</p>
        <div class="math-block">
          \[
          a+b=m
          \]
          \[
          ab=n
          \]
        </div>
        <p class="step-text">Substitute into the identity:</p>
        <div class="math-block">
          \[
          a^2+b^2=(a+b)^2-2ab
          \]
          \[
          a^2+b^2=m^2-2n
          \]
        </div>
      `,
      guidedSteps: [
        {
          title: raw`Use the root relationships`,
          previewHtml: raw`Those are the standard relationships between roots and coefficients for a monic quadratic.`,
          workingHtml: raw`<p class="step-text">Those are the standard relationships between roots and coefficients for a monic quadratic.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                a+b=m \quad\text{and}\quad ab=n
              \]
</div>`
        },
        {
          title: raw`Substitute into the identity`,
          previewHtml: raw`Substituting \(a+b=m\) and \(ab=n\) gives \(a^2+b^2=m^2-2n\).`,
          workingHtml: raw`
            <div class="math-block">
              \[
              a^2+b^2=(a+b)^2-2ab
              \]
              \[
              a+b=m,\qquad ab=n
              \]
            </div>

<p class="step-text">Substituting \(a+b=m\) and \(ab=n\) gives \(a^2+b^2=m^2-2n\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  \[
                m^2-2n
              \]
</div>

        <p class="step-text">For the quadratic \(x^2-mx+n=0\), the root relationships are:</p>
        <div class="math-block">
          \[
          a+b=m
          \]
          \[
          ab=n
          \]
        </div>
        <p class="step-text">Substitute into the identity:</p>
        <div class="math-block">
          \[
          a^2+b^2=(a+b)^2-2ab
          \]
          \[
          a^2+b^2=m^2-2n
          \]
        </div>
      `
        }
      ]
    },
    "3e": {
      browserTitle: "2025 Level 2 Algebra Paper — Question 3(e)",
      eyebrow: "Level 2 Algebra Walkthrough",
      title: "Question 3(e)",
      subtitle: "2025 Paper — Model the golf shot with a quadratic",
      backHref: paperHref,
      nextHref: paperHref,
      nextLabel: "Back to paper",
      gateNextHref: paperHref,
      gateNextLabel: "Back to paper",
      finalNav: {
        secondary: {
          href: "alg-3d2025-l2.html",
          label: "← Back to Question 3(d)"
        },
        primary: {
          href: paperHref,
          label: "Back to paper"
        }
      },
      questionHtml: raw`
        <p class="step-text">Shiloh's golf ball starts \(2\) m above ground level.</p>
        <p class="step-text">The ball reaches a maximum height of \(20\) m when it is \(110\) m from the start.</p>
        <p class="step-text">The tree is \(7.5\) m high and is \(200\) m from the start.</p>
        <p class="step-text">Assume the flight of the ball can be modelled by a quadratic equation. Will the ball be high enough to clear the tree?</p>
      `,
      questionNotes: [
        raw`Let \(x\) be the horizontal distance from the tee in metres, and let \(y\) be the height above ground level in metres.`
      ],
      hints: [
        raw`Use vertex form, because the maximum point is given directly.`,
        raw`The vertex is \((110,20)\), so a good model is \(y=a(x-110)^2+20\).`,
        raw`Use the starting point \((0,2)\) to find \(a\), then calculate \(y(200)\) and compare it with \(7.5\).`
      ],
      answerHtml: raw`
        <p class="step-text">Use vertex form:</p>
        <div class="math-block">
          \[
          y=a(x-110)^2+20
          \]
        </div>
        <p class="step-text">Use the starting point \((0,2)\):</p>
        <div class="math-block">
          \[
          2=a(0-110)^2+20
          \]
          \[
          2=12100a+20
          \]
          \[
          a=-\frac{18}{12100}
          \]
        </div>
        <p class="step-text">Check the height at the tree:</p>
        <div class="math-block">
          \[
          y(200)=-\frac{18}{12100}(200-110)^2+20
          \]
          \[
          y(200)\approx 7.95
          \]
        </div>
        <p class="step-text">Since \(7.95>7.5\), the ball clears the tree.</p>
      `,
      guidedSteps: [
        {
          title: raw`Write the quadratic in vertex form`,
          previewHtml: raw`The turning point is \((110,20)\), so vertex form is the best start.`,
          workingHtml: raw`<p class="step-text">The turning point is \((110,20)\), so vertex form is the best start.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  y = a \left(x - 110\right)^{2} + 20
  \]
</div>
</div>`
        },
        {
          title: raw`Find the scale factor`,
          previewHtml: raw`Substituting \((0,2)\) gives \(a=-\frac{18}{12100}\).`,
          workingHtml: raw`<p class="step-text">Substituting \((0,2)\) gives \(a=-\frac{18}{12100}\).</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  \frac{-18}{12100}
  \]
</div>
</div>`
        },
        {
          title: raw`Check the height at the tree`,
          previewHtml: raw`The ball is about \(7.95\) m high when it reaches the tree.`,
          workingHtml: raw`<p class="step-text">The ball is about \(7.95\) m high when it reaches the tree.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  <div class="math-block">
  \[
  7.950413223140496
  \]
</div>
</div>`
        },
        {
          title: raw`Interpret the result`,
          previewHtml: raw`The model gives a height of about \(7.95\) m, so the ball clears the tree by about \(0.45\) m.`,
          workingHtml: raw`<p class="step-text">The model gives a height of about \(7.95\) m, so the ball clears the tree by about \(0.45\) m.</p>
<div class="answer-highlight walkthrough-answer-highlight">
  <p class="question-label">Key result</p>
  Yes, because \(7.95>7.5\).
</div>

        <p class="step-text">Use vertex form:</p>
        <div class="math-block">
          \[
          y=a(x-110)^2+20
          \]
        </div>
        <p class="step-text">Use the starting point \((0,2)\):</p>
        <div class="math-block">
          \[
          2=a(0-110)^2+20
          \]
          \[
          2=12100a+20
          \]
          \[
          a=-\frac{18}{12100}
          \]
        </div>
        <p class="step-text">Check the height at the tree:</p>
        <div class="math-block">
          \[
          y(200)=-\frac{18}{12100}(200-110)^2+20
          \]
          \[
          y(200)\approx 7.95
          \]
        </div>
        <p class="step-text">Since \(7.95>7.5\), the ball clears the tree.</p>
      `
        }
      ]
    }
  };
}());
