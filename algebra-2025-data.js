(function () {
  const raw = String.raw;
  const paperHref = "index.html#level-2-algebra-2025";

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
      steps: [
        {
          type: "typed",
          title: "Simplify the square root",
          text: raw`What does \(\sqrt{\frac{y^6}{64}}\) simplify to?`,
          ariaLabel: "Type the simplified radical",
          acceptedAnswers: ["y^3/8"],
          samples: [
            { y: 2 },
            { y: 3 },
            { y: 5 }
          ],
          successMessage: raw`Correct. The square root halves the power on \(y^6\) and turns \(64\) into \(8\).`,
          targetedFeedback: [
            {
              answers: ["y^6/8"],
              message: raw`Close, but the square root halves the power: \(\sqrt{y^6}=y^3\), not \(y^6\).`
            },
            {
              answers: ["y^3/64"],
              message: raw`The denominator also goes under the square root, so \(\sqrt{64}=8\), not \(64\).`
            }
          ],
          genericMessage: raw`Try again. Divide the power on \(y\) by \(2\), and take the square root of \(64\).`
        },
        {
          type: "typed",
          title: "Multiply through",
          text: raw`Now multiply by \(5y\). What is the fully simplified answer?`,
          ariaLabel: "Type the final simplified expression",
          acceptedAnswers: ["5y^4/8"],
          samples: [
            { y: 2 },
            { y: 3 },
            { y: 5 }
          ],
          successMessage: raw`Correct. \(5y\times\frac{y^3}{8}=\frac{5y^4}{8}\).`,
          targetedFeedback: [
            {
              answers: ["5y^3/8"],
              message: raw`One factor of \(y\) is missing. \(y\times y^3=y^4\).`
            },
            {
              answers: ["5y^4"],
              message: raw`You still need to keep the denominator \(8\).`
            }
          ],
          genericMessage: raw`Multiply the coefficients and add the powers of \(y\) carefully.`
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
      steps: [
        {
          type: "choice",
          title: "Choose the first operation",
          text: raw`What should you do first to remove the cube root?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`Cube both sides`,
              correct: true,
              successMessage: raw`Correct. Cubing is the inverse of taking a cube root.`
            },
            {
              html: raw`Square both sides`,
              failureMessage: raw`Not quite. Squaring removes a square root, not a cube root.`
            },
            {
              html: raw`Divide both sides by \(2\)`,
              failureMessage: raw`That changes the left side, but it does not remove the cube root on the right.`
            },
            {
              html: raw`Subtract \(5\) first`,
              failureMessage: raw`The \(5\) is inside the cube root, so it is not the first thing to undo.`
            }
          ]
        },
        {
          type: "choice",
          title: "Write the equation after cubing",
          text: raw`After cubing both sides, which equation do you get?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                8y^3=7x-5
              \]`,
              correct: true,
              successMessage: raw`Correct. \((2y)^3=8y^3\), so the equation becomes \(8y^3=7x-5\).`
            },
            {
              html: raw`\[
                4y^3=7x-5
              \]`,
              failureMessage: raw`Close, but \((2y)^3=8y^3\), not \(4y^3\).`
            },
            {
              html: raw`\[
                8y^2=7x-5
              \]`,
              failureMessage: raw`The whole factor \(2y\) is cubed, so the power on \(y\) should be \(3\).`
            },
            {
              html: raw`\[
                8y^3=7x+5
              \]`,
              failureMessage: raw`Watch the sign. Cubing removes the cube root, but it does not change the \(-5\) inside it.`
            }
          ]
        },
        {
          type: "typed",
          title: "Make x the subject",
          text: raw`Now rearrange the equation and type \(x\) in terms of \(y\).`,
          ariaLabel: "Type x in terms of y",
          acceptedAnswers: ["(8y^3+5)/7"],
          samples: [
            { y: 1 },
            { y: -2 },
            { y: 3 }
          ],
          successMessage: raw`Correct. Adding \(5\) and dividing by \(7\) gives \(x=\frac{8y^3+5}{7}\).`,
          targetedFeedback: [
            {
              answers: ["(8y^3-5)/7"],
              message: raw`Watch the sign. When you move \(-5\) to the other side, it becomes \(+5\).`
            },
            {
              answers: ["8y^3+5"],
              message: raw`You still need to divide the whole expression by \(7\).`
            }
          ],
          genericMessage: raw`Add \(5\) to both sides first, then divide everything by \(7\).`
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
      steps: [
        {
          type: "choice",
          title: "Build the factorised form",
          text: raw`Which factorised form matches the leading coefficient \(2\) and the root \(x=1.5\)?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                (2x-c)(x-1.5)
              \]`,
              correct: true,
              successMessage: raw`Correct. That gives a factor of \((x-1.5)\) and still expands to a quadratic with leading term \(2x^2\).`
            },
            {
              html: raw`\[
                (x-c)(x-1.5)
              \]`,
              failureMessage: raw`That would give a leading coefficient of \(1\), not \(2\).`
            },
            {
              html: raw`\[
                (2x-c)(x+1.5)
              \]`,
              failureMessage: raw`The known root is \(x=1.5\), so the factor must be \((x-1.5)\).`
            },
            {
              html: raw`\[
                (x-c)(2x-1.5)
              \]`,
              failureMessage: raw`That does not use the root in the correct factor form.`
            }
          ]
        },
        {
          type: "typed",
          title: "Find c",
          text: raw`Substitute the point \((-1,-5)\). What value of \(c\) do you get?`,
          ariaLabel: "Type the value of c",
          acceptedAnswers: ["-4"],
          successMessage: raw`Correct. Using \((-1,-5)\) gives \((-2-c)(-2.5)=-5\), so \(c=-4\).`,
          genericMessage: raw`Substitute \(x=-1\) and \(y=-5\) into \((2x-c)(x-1.5)\), then solve the resulting equation.`
        },
        {
          type: "typed",
          title: "Expand the quadratic",
          text: raw`Substitute your value of \(c\) and expand. What is the quadratic?`,
          ariaLabel: "Type the expanded quadratic",
          acceptedAnswers: ["2x^2+x-6"],
          samples: [
            { x: -2 },
            { x: -1 },
            { x: 1 },
            { x: 3 }
          ],
          successMessage: raw`Correct. \((2x+4)(x-1.5)\) expands to \(2x^2+x-6\).`,
          targetedFeedback: [
            {
              answers: ["2x^2+x+6"],
              message: raw`Check the constant term. One factor is negative, so the constant should be \(-6\).`
            },
            {
              answers: ["2x^2- x-6"],
              message: raw`Recheck the middle terms when you expand.`
            }
          ],
          genericMessage: raw`Expand \((2x+4)(x-1.5)\) carefully and then collect like terms.`
        },
        {
          type: "choice",
          title: "Read off a and b",
          text: raw`Which pair of values matches \(a\) and \(b\)?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\(a=1,\ b=-6\)`,
              correct: true,
              successMessage: raw`Correct. Comparing \(2x^2+x-6\) with \(2x^2+ax+b\) gives \(a=1\) and \(b=-6\).`
            },
            {
              html: raw`\(a=-1,\ b=-6\)`,
              failureMessage: raw`The constant is right, but the coefficient of \(x\) is \(+1\), not \(-1\).`
            },
            {
              html: raw`\(a=1,\ b=6\)`,
              failureMessage: raw`Check the constant term. It should be \(-6\), not \(+6\).`
            },
            {
              html: raw`\(a=-1,\ b=6\)`,
              failureMessage: raw`Both signs are off compared with \(2x^2+x-6\).`
            }
          ]
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
          <svg class="graph-svg" viewBox="0 0 360 280" aria-label="Rectangle inscribed in a circle of radius r">
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
      steps: [
        {
          type: "typed",
          title: "Write the area in terms of x",
          text: raw`If the width is \(x\) and the length is \(2x\), what is the area \(A\)?`,
          ariaLabel: "Type the area in terms of x",
          acceptedAnswers: ["2x^2"],
          samples: [
            { x: 1 },
            { x: 4 },
            { x: -3 }
          ],
          successMessage: raw`Correct. Width times length gives \(A=x(2x)=2x^2\).`,
          genericMessage: raw`Multiply the width \(x\) by the length \(2x\).`
        },
        {
          type: "typed",
          title: "Use Pythagoras",
          text: raw`What equation does Pythagoras give for the radius triangle?`,
          ariaLabel: "Type the Pythagoras equation",
          mode: "equation",
          options: {
            equationLhs: "r^2",
            allowBareExpression: true
          },
          acceptedAnswers: ["r^2=x^2+(x/2)^2", "r^2=5x^2/4"],
          samples: [
            { r: 2, x: 1 },
            { r: 5, x: -3 },
            { r: 7, x: 4 }
          ],
          successMessage: raw`Correct. The triangle uses legs \(x\) and \(\frac{x}{2}\), with hypotenuse \(r\).`,
          genericMessage: raw`Use half the length \((x)\) and half the width \((\frac{x}{2})\) as the legs of the right triangle.`
        },
        {
          type: "typed",
          title: "Rearrange for x squared",
          text: raw`Rearrange your equation to make \(x^2\) the subject.`,
          ariaLabel: "Type x squared in terms of r squared",
          mode: "equation",
          options: {
            equationLhs: "x^2",
            allowBareExpression: true
          },
          acceptedAnswers: ["x^2=4r^2/5", "x^2=0.8r^2"],
          samples: [
            { r: 2, x: 1 },
            { r: 5, x: -3 },
            { r: 7, x: 4 }
          ],
          successMessage: raw`Correct. From \(r^2=\frac{5x^2}{4}\), multiplying by \(\frac{4}{5}\) gives \(x^2=\frac{4r^2}{5}\).`,
          genericMessage: raw`Start from \(r^2=\frac{5x^2}{4}\) and isolate \(x^2\).`
        },
        {
          type: "typed",
          title: "Write the final area",
          text: raw`Substitute into \(A=2x^2\). What is the area in terms of \(r\)?`,
          ariaLabel: "Type the final area in terms of r",
          acceptedAnswers: ["8r^2/5", "1.6r^2"],
          samples: [
            { r: 2 },
            { r: 5 },
            { r: 7 }
          ],
          successMessage: raw`Correct. The area simplifies to \(A=\frac{8r^2}{5}=1.6r^2\).`,
          targetedFeedback: [
            {
              answers: ["4r^2/5"],
              message: raw`You found \(x^2\). The area is \(2x^2\), so you still need to multiply by \(2\).`
            }
          ],
          genericMessage: raw`Substitute your expression for \(x^2\) into \(A=2x^2\).`
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
      steps: [
        {
          type: "choice",
          title: "Rewrite using 5 to the x",
          text: raw`Which rewrite is the most useful before substituting \(u=5^x\)?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                5(5^x)^2-120=25(5^x)
              \]`,
              correct: true,
              successMessage: raw`Correct. That makes the substitution \(u=5^x\) straightforward.`
            },
            {
              html: raw`\[
                25(5^x)-120=5(5^x)^2
              \]`,
              failureMessage: raw`The powers have been swapped around. Recheck \(5^{2x+1}\) and \(5^{x+2}\).`
            },
            {
              html: raw`\[
                5^{2x}-120=5^x+2
              \]`,
              failureMessage: raw`That does not rewrite the exponents correctly.`
            },
            {
              html: raw`\[
                5^{x+1}-120=5^{2x+2}
              \]`,
              failureMessage: raw`The exponents have changed incorrectly.`
            }
          ]
        },
        {
          type: "typed",
          title: "Form the quadratic",
          text: raw`After dividing by \(5\) and letting \(u=5^x\), what quadratic equation do you get?`,
          ariaLabel: "Type the quadratic in u",
          mode: "equation",
          options: {
            equationRhs: "0",
            allowBareExpression: true
          },
          acceptedAnswers: ["u^2-5u-24=0"],
          samples: [
            { u: -3 },
            { u: 1 },
            { u: 8 }
          ],
          successMessage: raw`Correct. The substitution gives \(u^2-5u-24=0\).`,
          genericMessage: raw`Rewrite everything in terms of \(u\) after dividing the equation by \(5\).`
        },
        {
          type: "choice",
          title: "Choose the valid value of u",
          text: raw`Solve the quadratic. Which value of \(u\) can you actually use?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                u=8
              \]`,
              correct: true,
              successMessage: raw`Correct. The quadratic roots are \(8\) and \(-3\), but \(u=5^x\) must be positive, so \(u=8\).`
            },
            {
              html: raw`\[
                u=-3
              \]`,
              failureMessage: raw`The quadratic has that root too, but \(u=5^x\) cannot be negative.`
            },
            {
              html: raw`\[
                u=3
              \]`,
              failureMessage: raw`Check the factorisation again. The roots are \(8\) and \(-3\), not \(3\).`
            },
            {
              html: raw`\[
                u=-8
              \]`,
              failureMessage: raw`That is not a root of the quadratic, and it would not be valid for \(u=5^x\) anyway.`
            }
          ]
        },
        {
          type: "typed",
          title: "Solve for x",
          text: raw`Now solve \(5^x=8\). Type the value of \(x\).`,
          ariaLabel: "Type the value of x",
          acceptedAnswers: ["ln(8)/ln(5)", "1.292029674220179"],
          tolerance: 0.001,
          successMessage: raw`Correct. \(x=\log_5 8\approx 1.292\).`,
          targetedFeedback: [
            {
              answers: ["8"],
              message: raw`That is the value of \(u\), not the value of \(x\). You still need to solve \(5^x=8\).`
            }
          ],
          genericMessage: raw`Use logarithms, or write the decimal approximation for \(\log_5 8\).`
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
      steps: [
        {
          type: "choice",
          title: "Identify the perfect square",
          text: raw`Which perfect square matches \(9x^2-30x+k\)?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                (3x-5)^2
              \]`,
              correct: true,
              successMessage: raw`Correct. Expanding gives the required middle term \(-30x\).`
            },
            {
              html: raw`\[
                (3x+5)^2
              \]`,
              failureMessage: raw`That would give a middle term of \(+30x\), not \(-30x\).`
            },
            {
              html: raw`\[
                (9x-5)^2
              \]`,
              failureMessage: raw`That would give a leading term of \(81x^2\), not \(9x^2\).`
            },
            {
              html: raw`\[
                (x-5)^2
              \]`,
              failureMessage: raw`That would give a leading term of \(x^2\), not \(9x^2\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Read off k",
          text: raw`What value of \(k\) is needed?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                25
              \]`,
              correct: true,
              successMessage: raw`Correct. Since \(9x^2-30x+k=(3x-5)^2\), the constant term must be \(25\).`
            },
            {
              html: raw`\[
                10
              \]`,
              failureMessage: raw`That comes from the numbers inside the bracket, but the constant term of \((3x-5)^2\) is \(5^2\).`
            },
            {
              html: raw`\[
                -25
              \]`,
              failureMessage: raw`Squaring makes the constant positive, so it should be \(+25\).`
            },
            {
              html: raw`\[
                30
              \]`,
              failureMessage: raw`That is related to the middle term, not the constant term.`
            }
          ]
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
      steps: [
        {
          type: "typed",
          title: "Factorise the numerator",
          text: raw`What is the fully factorised numerator?`,
          ariaLabel: "Type the factorised numerator",
          acceptedAnswers: ["2x(3x-2)(x+5)"],
          samples: [
            { x: -3 },
            { x: -1 },
            { x: 2 },
            { x: 4 }
          ],
          successMessage: raw`Correct. Taking out \(2x\) leaves a quadratic that factorises as \((3x-2)(x+5)\).`,
          genericMessage: raw`Factor out the common factor \(2x\) first, then factorise the remaining quadratic.`
        },
        {
          type: "typed",
          title: "Factorise the denominator",
          text: raw`What is the fully factorised denominator?`,
          ariaLabel: "Type the factorised denominator",
          acceptedAnswers: ["(5x-2)(x+5)"],
          samples: [
            { x: -3 },
            { x: -1 },
            { x: 2 },
            { x: 4 }
          ],
          successMessage: raw`Correct. The denominator factorises to \((5x-2)(x+5)\).`,
          genericMessage: raw`Find two numbers that multiply to \(-50\) and add to \(23\).`
        },
        {
          type: "typed",
          title: "Cancel the common factor",
          text: raw`After cancelling the common factor, what simplified fraction do you get?`,
          ariaLabel: "Type the simplified fraction",
          acceptedAnswers: ["2x(3x-2)/(5x-2)"],
          samples: [
            { x: -3 },
            { x: -1 },
            { x: 2 },
            { x: 4 }
          ],
          successMessage: raw`Correct. Cancelling the common factor \((x+5)\) leaves \(\frac{2x(3x-2)}{5x-2}\).`,
          genericMessage: raw`Cancel the common factor \((x+5)\) and leave the remaining factors unchanged.`
        },
        {
          type: "choice",
          title: "State the restriction",
          text: raw`Which extra restriction still needs to be stated after cancellation?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                x\neq -5
              \]`,
              correct: true,
              successMessage: raw`Correct. The cancelled factor \((x+5)\) means the original expression was undefined at \(x=-5\).`
            },
            {
              html: raw`\[
                x\neq \frac{2}{5}
              \]`,
              failureMessage: raw`That value is still excluded by the denominator you can already see. The extra restriction from the cancelled factor is \(x=-5\).`
            },
            {
              html: raw`\[
                x\neq 0
              \]`,
              failureMessage: raw`There is no zero denominator issue at \(x=0\) here.`
            },
            {
              html: raw`\[
                \text{No restriction is needed}
              \]`,
              failureMessage: raw`A cancelled factor can still create a hole in the original expression, so a restriction is needed.`
            }
          ]
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
      steps: [
        {
          type: "typed",
          title: "Form the quadratic equation",
          text: raw`After removing the denominator and rearranging, what quadratic equation do you get?`,
          ariaLabel: "Type the quadratic equation",
          mode: "equation",
          options: {
            equationRhs: "0",
            allowBareExpression: true
          },
          acceptedAnswers: ["9x^2-6x-4=0", "18x^2-12x-8=0"],
          samples: [
            { x: -2 },
            { x: -1 },
            { x: 1 },
            { x: 3 }
          ],
          successMessage: raw`Correct. Rearranging gives the quadratic \(9x^2-6x-4=0\).`,
          genericMessage: raw`Multiply both sides by \((3x-1)^2\), expand, and then move everything to one side.`
        },
        {
          type: "choice",
          title: "Solve for x",
          text: raw`Which pair of solutions is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                x=\frac{1+\sqrt{5}}{3}\quad\text{or}\quad x=\frac{1-\sqrt{5}}{3}
              \]`,
              correct: true,
              successMessage: raw`Correct. Those are the two solutions after simplifying the quadratic-formula result.`
            },
            {
              html: raw`\[
                x=\frac{1+\sqrt{5}}{6}\quad\text{or}\quad x=\frac{1-\sqrt{5}}{6}
              \]`,
              failureMessage: raw`The denominator has been halved too far. Simplifying \(\frac{6\pm6\sqrt{5}}{18}\) gives denominator \(3\), not \(6\).`
            },
            {
              html: raw`\[
                x=\frac{3+\sqrt{5}}{3}\quad\text{or}\quad x=\frac{3-\sqrt{5}}{3}
              \]`,
              failureMessage: raw`Check the numerator. The quadratic formula gives \(6\pm6\sqrt{5}\), which simplifies to \(1\pm\sqrt{5}\), not \(3\pm\sqrt{5}\).`
            },
            {
              html: raw`\[
                x=\frac{1+\sqrt{20}}{3}\quad\text{or}\quad x=\frac{1-\sqrt{20}}{3}
              \]`,
              failureMessage: raw`You still need to simplify the surd. \(\sqrt{20}=2\sqrt{5}\), so this is not in the correct final form.`
            }
          ]
        },
        {
          type: "choice",
          title: "Read off a and b",
          text: raw`Comparing with \(\frac{1\pm\sqrt{a}}{b}\), which values match \(a\) and \(b\)?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\(a=5,\ b=3\)`,
              correct: true,
              successMessage: raw`Correct. Comparing \(\frac{1\pm\sqrt{5}}{3}\) with \(\frac{1\pm\sqrt{a}}{b}\) gives \(a=5\) and \(b=3\).`
            },
            {
              html: raw`\(a=5,\ b=18\)`,
              failureMessage: raw`That denominator appears before simplifying. The final denominator is \(3\).`
            },
            {
              html: raw`\(a=20,\ b=18\)`,
              failureMessage: raw`Those come from the unsimplified discriminant step. We need the simplified final form.`
            },
            {
              html: raw`\(a=20,\ b=3\)`,
              failureMessage: raw`The denominator is right, but the surd simplifies to \(\sqrt{5}\), not \(\sqrt{20}\).`
            }
          ]
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
      steps: [
        {
          type: "choice",
          title: "Combine into one logarithm",
          text: raw`After combining the left side into a single logarithm, what should go inside the log?`,
          beforeHtml: raw`
            <div class="math-block">
              \[
              2\log_5(x+6)-\log_5 x=2
              \]
              \[
              \log_5(\square)=2
              \]
            </div>
          `,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                \frac{(x+6)^2}{x}
              \]`,
              correct: true,
              successMessage: raw`Correct. \(2\log_5(x+6)=\log_5((x+6)^2)\), so the argument becomes \(\frac{(x+6)^2}{x}\).`
            },
            {
              html: raw`\[
                \frac{x}{(x+6)^2}
              \]`,
              failureMessage: raw`The quotient is upside down. Subtracting \(\log_5 x\) puts \(x\) in the denominator.`
            },
            {
              html: raw`\[
                (x+6)^2-x
              \]`,
              failureMessage: raw`Logarithms combine by multiplying, dividing, and powers here, not by subtraction inside the bracket.`
            },
            {
              html: raw`\[
                \frac{x+6}{x^2}
              \]`,
              failureMessage: raw`The power rule applies to \(x+6\), so the whole bracket should be squared.`
            }
          ]
        },
        {
          type: "choice",
          title: "Take it out of log form",
          text: raw`What equation do you get after removing the logarithm?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                \frac{(x+6)^2}{x}=25
              \]`,
              correct: true,
              successMessage: raw`Correct. If \(\log_5(\text{expression})=2\), then the expression must equal \(5^2=25\).`
            },
            {
              html: raw`\[
                \frac{(x+6)^2}{x}=2
              \]`,
              failureMessage: raw`The right-hand side is the exponent, so the expression should equal \(5^2\), not \(2\).`
            },
            {
              html: raw`\[
                (x+6)^2=5x
              \]`,
              failureMessage: raw`Check the base power carefully. Removing the log gives \(25\), not \(5\).`
            },
            {
              html: raw`\[
                2(x+6)-x=25
              \]`,
              failureMessage: raw`That treats the logarithms like ordinary brackets. We first combined them into one log before removing it.`
            }
          ]
        },
        {
          type: "choice",
          title: "Solve the equation",
          text: raw`Which pair of solutions is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                x=4,\ 9
              \]`,
              correct: true,
              successMessage: raw`Correct. Solving the quadratic gives \(x=4\) and \(x=9\).`
            },
            {
              html: raw`\[
                x=-4,\ -9
              \]`,
              failureMessage: raw`Those signs do not match the factorisation \((x-4)(x-9)=0\).`
            },
            {
              html: raw`\[
                x=4,\ -9
              \]`,
              failureMessage: raw`One sign is still wrong. Both roots are positive here.`
            },
            {
              html: raw`\[
                x=9,\ 25
              \]`,
              failureMessage: raw`Check the quadratic again. \(25\) comes from the log step, not from the factorised solutions.`
            }
          ]
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
      steps: [
        {
          type: "typed",
          title: "Make y the subject",
          text: raw`Rearrange the first equation. What is \(y\) in terms of \(x\)?`,
          ariaLabel: "Type y in terms of x",
          mode: "equation",
          options: {
            equationLhs: "y",
            allowBareExpression: true
          },
          acceptedAnswers: ["y=2x+13"],
          samples: [
            { x: -2, y: 1 },
            { x: 3, y: -4 },
            { x: 5, y: 2 }
          ],
          successMessage: raw`Correct. Adding \(2x\) to both sides gives \(y=2x+13\).`,
          genericMessage: raw`Add \(2x\) to both sides to isolate \(y\).`
        },
        {
          type: "typed",
          title: "Substitute into the second equation",
          text: raw`After substituting for \(y\), what quadratic equation in \(x\) do you get?`,
          ariaLabel: "Type the quadratic in x",
          mode: "equation",
          options: {
            equationRhs: "0",
            allowBareExpression: true
          },
          acceptedAnswers: ["x^2+4kx+20k=0"],
          samples: [
            { x: -2, k: 1 },
            { x: 3, k: 5 },
            { x: 4, k: 2 }
          ],
          successMessage: raw`Correct. Substituting \(y=2x+13\) gives \(x^2+4kx+20k=0\).`,
          genericMessage: raw`Substitute \(y=2x+13\) into \(x^2+2ky=6k\), then collect all terms on one side.`
        },
        {
          type: "choice",
          title: "Use the repeated-root condition",
          text: raw`Because there is only one solution, what is the value of \(k\)?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                5
              \]`,
              correct: true,
              successMessage: raw`Correct. Setting the discriminant to \(0\) gives \(16k^2-80k=0\), so \(k=5\) because \(k\neq 0\).`
            },
            {
              html: raw`\[
                0
              \]`,
              failureMessage: raw`That comes out of the factorisation too, but the question says \(k\) is non-zero.`
            },
            {
              html: raw`\[
                -5
              \]`,
              failureMessage: raw`Check the factorisation carefully. The valid non-zero root is positive.`
            },
            {
              html: raw`\[
                20
              \]`,
              failureMessage: raw`That number appears during the discriminant setup, but it is not the solution for \(k\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Find the simultaneous solution",
          text: raw`Which ordered pair is the solution?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                (-10,-7)
              \]`,
              correct: true,
              successMessage: raw`Correct. With \(k=5\), the equations meet at \((-10,-7)\).`
            },
            {
              html: raw`\[
                (-10,7)
              \]`,
              failureMessage: raw`The \(x\)-value is right, but substituting into \(y=2x+13\) gives \(y=-7\), not \(7\).`
            },
            {
              html: raw`\[
                (10,-7)
              \]`,
              failureMessage: raw`Check the repeated root carefully. The \(x\)-value is \(-10\), not \(10\).`
            },
            {
              html: raw`\[
                (-7,-10)
              \]`,
              failureMessage: raw`Watch the order. The solution should be written as \((x,y)\).`
            }
          ]
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
      steps: [
        {
          type: "typed",
          title: "Remove the logarithm",
          text: raw`What equation do you get after taking it out of log form?`,
          ariaLabel: "Type the equation after removing the logarithm",
          mode: "equation",
          options: {
            equationRhs: "8",
            allowBareExpression: true
          },
          acceptedAnswers: ["(sqrt(x))^6=8", "x^3=8"],
          samples: [
            { x: 1 },
            { x: 2 },
            { x: 5 }
          ],
          successMessage: raw`Correct. The logarithm says \((\sqrt{x})^6=8\), which simplifies to \(x^3=8\).`,
          genericMessage: raw`If \(\log_b a=c\), then \(b^c=a\).`
        },
        {
          type: "typed",
          title: "Simplify the power",
          text: raw`Simplify \((\sqrt{x})^6\). What equation do you have now?`,
          ariaLabel: "Type the simplified equation",
          mode: "equation",
          options: {
            equationRhs: "8",
            allowBareExpression: true
          },
          acceptedAnswers: ["x^3=8"],
          samples: [
            { x: 1 },
            { x: 2 },
            { x: 5 }
          ],
          successMessage: raw`Correct. \((x^{1/2})^6=x^3\), so the equation is \(x^3=8\).`,
          genericMessage: raw`Rewrite \(\sqrt{x}\) as \(x^{1/2}\), then multiply the powers.`
        },
        {
          type: "typed",
          title: "Solve for x",
          text: raw`What is the value of \(x\)?`,
          ariaLabel: "Type the value of x",
          acceptedAnswers: ["2"],
          successMessage: raw`Correct. The solution is \(x=2\).`,
          genericMessage: raw`Find the cube root of \(8\).`
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
      steps: [
        {
          type: "typed",
          title: "Write the factorised equation",
          text: raw`What factorised equation has roots \(\frac{1}{5}\) and \(-\frac{2}{3}\)?`,
          ariaLabel: "Type the factorised equation",
          mode: "equation",
          options: {
            equationRhs: "0",
            allowBareExpression: true
          },
          acceptedAnswers: ["(5x-1)(3x+2)=0"],
          samples: [
            { x: -2 },
            { x: -1 },
            { x: 1 },
            { x: 3 }
          ],
          successMessage: raw`Correct. Those factors give roots \(x=\frac{1}{5}\) and \(x=-\frac{2}{3}\).`,
          genericMessage: raw`A root of \(\frac{1}{5}\) gives the factor \((5x-1)\), and a root of \(-\frac{2}{3}\) gives \((3x+2)\).`
        },
        {
          type: "typed",
          title: "Expand the equation",
          text: raw`Expand the brackets. What quadratic equation do you get?`,
          ariaLabel: "Type the expanded quadratic equation",
          mode: "equation",
          options: {
            equationRhs: "0",
            allowBareExpression: true
          },
          acceptedAnswers: ["15x^2+7x-2=0"],
          samples: [
            { x: -2 },
            { x: -1 },
            { x: 1 },
            { x: 3 }
          ],
          successMessage: raw`Correct. Expanding gives \(15x^2+7x-2=0\).`,
          genericMessage: raw`Multiply the brackets carefully and collect like terms.`
        },
        {
          type: "choice",
          title: "Read off a, b, and c",
          text: raw`Which set of coefficients matches \(ax^2+bx+c=0\)?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\(a=15,\ b=7,\ c=-2\)`,
              correct: true,
              successMessage: raw`Correct. Comparing with \(ax^2+bx+c=0\) gives \(a=15\), \(b=7\), and \(c=-2\).`
            },
            {
              html: raw`\(a=15,\ b=-7,\ c=-2\)`,
              failureMessage: raw`The leading and constant terms are right, but the coefficient of \(x\) is \(+7\), not \(-7\).`
            },
            {
              html: raw`\(a=15,\ b=7,\ c=2\)`,
              failureMessage: raw`The constant term should be negative because the expanded equation ends with \(-2\).`
            },
            {
              html: raw`\(a=5,\ b=3,\ c=2\)`,
              failureMessage: raw`Those look like pieces from the factors, not the coefficients of the expanded quadratic.`
            }
          ]
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
      steps: [
        {
          type: "choice",
          title: "Rewrite 75 in a useful way",
          text: raw`Which factorisation of \(75\) is the most useful for this logarithm question?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                75=3\times 5^2
              \]`,
              correct: true,
              successMessage: raw`Correct. That matches the given values \(p=\log_a 3\) and \(q=\log_a 5\).`
            },
            {
              html: raw`\[
                75=15\times 5
              \]`,
              failureMessage: raw`That is true, but it does not use the given logs as neatly as \(3\times 5^2\).`
            },
            {
              html: raw`\[
                75=25\times 3^2
              \]`,
              failureMessage: raw`That factorisation is not correct.`
            },
            {
              html: raw`\[
                75=5\times 7\times 3
              \]`,
              failureMessage: raw`That is not a correct factorisation of \(75\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Substitute p and q",
          text: raw`Now write \(\log_a 75\) in terms of \(p\) and \(q\).`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                p+2q
              \]`,
              correct: true,
              successMessage: raw`Correct. \(\log_a 75=\log_a 3+2\log_a 5=p+2q\).`
            },
            {
              html: raw`\[
                p+q
              \]`,
              failureMessage: raw`You are missing the extra factor of \(5\). Remember \(75=3\times 5^2\).`
            },
            {
              html: raw`\[
                2p+q
              \]`,
              failureMessage: raw`The square applies to \(5\), not to \(3\).`
            },
            {
              html: raw`\[
                pq
              \]`,
              failureMessage: raw`Logarithms of products add here; they do not multiply together.`
            }
          ]
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
      steps: [
        {
          type: "choice",
          title: "Use the root relationships",
          text: raw`If \(a\) and \(b\) are the roots of \(x^2-mx+n=0\), which statement is correct?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                a+b=m \quad\text{and}\quad ab=n
              \]`,
              correct: true,
              successMessage: raw`Correct. Those are the standard relationships between roots and coefficients for a monic quadratic.`
            },
            {
              html: raw`\[
                a+b=n \quad\text{and}\quad ab=m
              \]`,
              failureMessage: raw`Those relationships are swapped.`
            },
            {
              html: raw`\[
                a+b=-m \quad\text{and}\quad ab=n
              \]`,
              failureMessage: raw`The coefficient of \(x\) is \(-m\), so the sum of the roots is \(m\), not \(-m\).`
            },
            {
              html: raw`\[
                a+b=m \quad\text{and}\quad ab=-n
              \]`,
              failureMessage: raw`The constant term is \(+n\), so the product of the roots is \(n\).`
            }
          ]
        },
        {
          type: "choice",
          title: "Substitute into the identity",
          text: raw`What does the identity simplify to in terms of \(m\) and \(n\)?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`\[
                m^2-2n
              \]`,
              correct: true,
              successMessage: raw`Correct. Substituting \(a+b=m\) and \(ab=n\) gives \(a^2+b^2=m^2-2n\).`
            },
            {
              html: raw`\[
                m^2+2n
              \]`,
              failureMessage: raw`Watch the identity carefully: \(a^2+b^2=(a+b)^2-2ab\), so the \(2n\) term is subtracted.`
            },
            {
              html: raw`\[
                2m^2-n
              \]`,
              failureMessage: raw`That does not match the structure of the identity. Square the sum once, then subtract twice the product.`
            },
            {
              html: raw`\[
                m^2-n^2
              \]`,
              failureMessage: raw`The product enters linearly as \(ab=n\), not as \(n^2\).`
            }
          ]
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
      steps: [
        {
          type: "typed",
          title: "Write the quadratic in vertex form",
          text: raw`Using the maximum point, what equation in vertex form should you start with?`,
          ariaLabel: "Type the quadratic in vertex form",
          mode: "equation",
          options: {
            equationLhs: "y",
            allowBareExpression: true
          },
          acceptedAnswers: ["y=a(x-110)^2+20"],
          samples: [
            { x: 0, y: 2, a: -1 },
            { x: 110, y: 20, a: 2 },
            { x: 200, y: 8, a: 3 }
          ],
          successMessage: raw`Correct. The turning point is \((110,20)\), so vertex form is the best start.`,
          genericMessage: raw`A quadratic with vertex \((h,k)\) can be written as \(y=a(x-h)^2+k\).`
        },
        {
          type: "typed",
          title: "Find the scale factor",
          text: raw`Use the starting point \((0,2)\). What is the value of \(a\)?`,
          ariaLabel: "Type the value of a",
          acceptedAnswers: ["-18/12100", "-9/6050"],
          successMessage: raw`Correct. Substituting \((0,2)\) gives \(a=-\frac{18}{12100}\).`,
          genericMessage: raw`Substitute \(x=0\) and \(y=2\) into \(y=a(x-110)^2+20\), then solve for \(a\).`
        },
        {
          type: "typed",
          title: "Check the height at the tree",
          text: raw`What height does the model give when \(x=200\)?`,
          ariaLabel: "Type the height of the ball at x equals 200",
          acceptedAnswers: ["7.950413223140496"],
          tolerance: 0.001,
          successMessage: raw`Correct. The ball is about \(7.95\) m high when it reaches the tree.`,
          genericMessage: raw`Substitute \(x=200\) into your quadratic model and round sensibly.`
        },
        {
          type: "choice",
          title: "Interpret the result",
          text: raw`Will the ball clear the \(7.5\) m tree?`,
          buttonGridClass: "button-grid two-col",
          choices: [
            {
              html: raw`Yes, because \(7.95>7.5\).`,
              correct: true,
              successMessage: raw`Correct. The model gives a height of about \(7.95\) m, so the ball clears the tree by about \(0.45\) m.`
            },
            {
              html: raw`No, because \(7.95&lt;7.5\).`,
              failureMessage: raw`Check the comparison again. \(7.95\) is greater than \(7.5\).`
            },
            {
              html: raw`No, because the ball is only \(2\) m above the ground at the start.`,
              failureMessage: raw`The height that matters is the height at the tree, not the starting height.`
            },
            {
              html: raw`There is not enough information to decide.`,
              failureMessage: raw`There is enough information. The quadratic model lets you calculate the height at \(x=200\).`
            }
          ]
        }
      ]
    }
  };
}());
