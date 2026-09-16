(function () {
  "use strict";

  const REVIEW_STATUS = "awaiting-teacher-review";

  function looksLikeInlineMath(value) {
    const text = String(value || "").trim();
    if (!text || /\b(?:PDF|opens in a new tab)\b/i.test(text)) {
      return false;
    }
    return /\\[A-Za-z]+|[=^<>]|&(?:lt|gt);|\d|^[axyzkwpmgutBQ](?:')?$/.test(text);
  }

  function delimitInlineMath(value) {
    const segments = String(value || "").split(/(\\\[[\s\S]*?\\\])/g);
    return segments.map(function (segment, segmentIndex) {
      if (segmentIndex % 2 === 1) {
        return segment;
      }

      let result = "";
      let index = 0;
      while (index < segment.length) {
        if (segment[index] === "<") {
          const tagEnd = segment.indexOf(">", index);
          if (tagEnd !== -1) {
            result += segment.slice(index, tagEnd + 1);
            index = tagEnd + 1;
            continue;
          }
        }
        if (segment[index] !== "(" || (index > 0 && segment[index - 1] === "\\")) {
          result += segment[index];
          index += 1;
          continue;
        }

        let depth = 1;
        let cursor = index + 1;
        while (cursor < segment.length && depth > 0) {
          if (segment[cursor] === "(" && segment[cursor - 1] !== "\\") {
            depth += 1;
          } else if (segment[cursor] === ")" && segment[cursor - 1] !== "\\") {
            depth -= 1;
          }
          cursor += 1;
        }
        if (depth === 0) {
          const inner = segment.slice(index + 1, cursor - 1);
          result += looksLikeInlineMath(inner)
            ? "\\(" + inner + "\\)"
            : segment.slice(index, cursor);
          index = cursor;
          continue;
        }
        result += segment[index];
        index += 1;
      }
      return result;
    }).join("");
  }

  function raw(template) {
    const values = Array.prototype.slice.call(arguments, 1);
    return delimitInlineMath(String.raw.apply(String, [template].concat(values)));
  }

  function step(title, ideaHtml, workingHtml) {
    return {
      title: title,
      previewHtml: ideaHtml,
      workingHtml: workingHtml
    };
  }

  function audited(details) {
    return Object.assign({
      auditSchemaVersion: 1,
      reviewStatus: REVIEW_STATUS,
      reviewNotice: "This walkthrough has been corrected following an internal audit and is awaiting independent teacher review."
    }, details);
  }

  const walkthroughs = {
    "level-3-complex-2025:1e": audited({
      questionHtml: raw`
        <p class="step-text">Find the Cartesian equation of the locus of (z), giving the answer in the form (ay^2-bx^2=k).</p>
        <div class="question-math" aria-label="Modulus locus equation">
          \[
          |z-5i|-|z+5i|=4
          \]
        </div>
      `,
      hints: [
        raw`Let (z=x+yi) and interpret each modulus as a distance.`,
        raw`After the first squaring, isolate the remaining square root and record the sign it must have.`,
        raw`The Cartesian hyperbola has two branches; substitute each branch into the original modulus equation.`
      ],
      guidedSteps: [
        step(
          raw`Write the two distances`,
          raw`The modulus equation becomes a difference of distances in (x) and (y).`,
          raw`<div class="math-block">
            \[
            \sqrt{x^2+(y-5)^2}-\sqrt{x^2+(y+5)^2}=4.
            \]
          </div>`
        ),
        step(
          raw`Square without losing the sign`,
          raw`Isolate one non-negative square root before each squaring.`,
          raw`<p class="step-text">Let (B=\sqrt{x^2+(y+5)^2}\ge0). The equation gives</p>
          <div class="math-block">
            \[
            \sqrt{x^2+(y-5)^2}=B+4,
            \]
            \[
            -20y=16+8B,
            \qquad B=\frac{-5y-4}{2}.
            \]
          </div>
          <p class="step-text">Therefore the second squaring is allowed only when (-5y-4\ge0).</p>`
        ),
        step(
          raw`Obtain the Cartesian curve`,
          raw`The second squaring gives a hyperbola, but not yet the complete locus.`,
          raw`<div class="math-block">
            \[
            (-5y-4)^2=4\bigl(x^2+(y+5)^2\bigr)
            \]
            \[
            21y^2-4x^2=84.
            \]
          </div>`
        )
      ],
      checksHtml: raw`<p class="step-text">The hyperbola equation requires (|y|\ge2). Combining this with (-5y-4\ge0) retains only (y\le-2). The upper branch (y\ge2) was introduced by squaring.</p>`,
      markReasoningHtml: raw`<p class="step-text">Communicate the sign restriction from the isolated square root and state why one branch is rejected; the Cartesian equation alone describes too many points.</p>`,
      finalResultHtml: raw`<div class="answer-highlight walkthrough-answer-highlight"><p class="question-label">Final result</p>\[21y^2-4x^2=84,\qquad y\le-2.\]</div>`,
      verificationHtml: raw`<p class="step-text">On the retained branch, (y\le-2), the hyperbola gives</p><div class="math-block">\[|z-5i|=\frac{4-5y}{2},\qquad |z+5i|=\frac{-5y-4}{2},\]</div><p class="step-text">so their difference is (4). On (y\ge2), the difference is (-4), so the upper branch is extraneous.</p>`,
      commonMistakeHtml: raw`<p class="step-text">Keeping both branches after the second squaring. Squaring preserves the hyperbola equation but not the original sign of the distance difference.</p>`
    }),

    "level-3-integration-2024:2c": audited({
      questionHtml: raw`
        <p class="step-text">Consider the differential equation</p>
        <div class="question-math" aria-label="Differential equation">\[\frac{dy}{dx}=12y^2e^{3x}.\]</div>
        <p class="step-text">Given that (y=0.5) when (x=0), find the value of (y) when (x=\frac13). Use calculus and show the integration needed.</p>
      `,
      hints: [
        raw`Separate with (y^{-2}\,dy) on the left.`,
        raw`After using the initial condition, inspect where the denominator of the explicit formula is zero.`,
        raw`Decide whether (x=\frac13) lies in the maximal interval containing (x=0).`
      ],
      guidedSteps: [
        step(
          raw`Separate and integrate`,
          raw`The equation is separable on a branch where (y\ne0).`,
          raw`<div class="math-block">\[y^{-2}\,dy=12e^{3x}\,dx\]\[-\frac1y=4e^{3x}+C.\]</div>`
        ),
        step(
          raw`Use the initial value`,
          raw`The condition determines the algebraic expression for the local solution.`,
          raw`<div class="math-block">\[-2=4+C\Rightarrow C=-6,\qquad y=\frac{1}{6-4e^{3x}}.\]</div>`
        ),
        step(
          raw`Locate the singularity`,
          raw`An IVP solution cannot be continued through a point where this expression becomes unbounded.`,
          raw`<div class="math-block">\[6-4e^{3x}=0\iff e^{3x}=\frac32\iff x=\frac{\ln(3/2)}3\approx0.1352.\]</div>`
        )
      ],
      checksHtml: raw`<p class="step-text">The maximal solution interval containing the initial point is</p><div class="math-block">\[x<\frac{\ln(3/2)}3.\]</div><p class="step-text">Since (\frac13\) lies beyond the singularity, the maximal IVP solution has no value there.</p>`,
      markReasoningHtml: raw`<p class="step-text">The 2024 assessment schedule reports the formal evaluation (-0.2052). That is the schedule-expected calculation, but it does not address the interval break. Compare with the <a href="https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2024/91579-ass-2024.pdf" target="_blank" rel="noopener noreferrer">official 2024 AS91579 assessment schedule (PDF, opens in a new tab)</a>. This site’s interval caveat is an independent mathematical clarification, not an NZQA endorsement.</p>`,
      finalResultHtml: raw`<div class="answer-highlight walkthrough-answer-highlight"><p class="question-label">Mathematical IVP conclusion</p><p class="step-text">The maximal solution through ((0,0.5)) has no value at (x=\frac13).</p></div><div class="callout-card"><p class="callout-title">Schedule-expected formal evaluation</p>\[\frac{1}{6-4e}\approx-0.2052.\]<p class="step-text">This evaluates the same algebraic formula on a disconnected branch; it is not continuation of the maximal IVP solution through the singularity.</p></div>`,
      verificationHtml: raw`<p class="step-text">For every (x) in the stated interval, differentiating (y=(6-4e^{3x})^{-1}) gives (y'=12e^{3x}(6-4e^{3x})^{-2}=12y^2e^{3x}), and (y(0)=\frac12).</p>`,
      commonMistakeHtml: raw`<p class="step-text">Substituting into a formal expression without checking whether the target lies in the solution interval containing the initial point.</p>`
    }),

    "level-3-complex-2023:3c": audited({
      questionHtml: raw`
        <p class="step-text">Solve the equation for (x), in terms of the real parameter (w).</p>
        <div class="question-math" aria-label="Radical equation">\[4\sqrt{4x-w}=5-8\sqrt{x}.\]</div>
      `,
      hints: [
        raw`Before squaring, record (x\ge0), (4x-w\ge0), and (5-8\sqrt{x}\ge0).`,
        raw`After one squaring, the (64x) terms cancel and leave an equation in (\sqrt{x}).`,
        raw`Translate both (\sqrt{x}\ge0) and (\sqrt{x}\le\frac58) into restrictions on (w).`
      ],
      guidedSteps: [
        step(
          raw`Record the original restrictions`,
          raw`Both square roots and the sign of the right-hand side constrain a valid solution.`,
          raw`<div class="math-block">\[x\ge0,\qquad 4x-w\ge0,\qquad 5-8\sqrt{x}\ge0.\]</div>`
        ),
        step(
          raw`Square and solve for (\sqrt{x})`,
          raw`With the sign restriction recorded, square the equation and simplify before squaring again.`,
          raw`<div class="math-block">\[16(4x-w)=(5-8\sqrt{x})^2\]\[-16w=25-80\sqrt{x}\]\[\sqrt{x}=\frac{25+16w}{80}.\]</div>`
        )
      ],
      checksHtml: raw`<p class="step-text">Because (0\le\sqrt{x}\le\frac58),</p><div class="math-block">\[0\le\frac{25+16w}{80}\le\frac58\iff-\frac{25}{16}\le w\le\frac{25}{16}.\]</div><p class="step-text">Outside this interval there is no real solution.</p>`,
      markReasoningHtml: raw`<p class="step-text">Show the sign condition on (5-8\sqrt{x}) before squaring and restore it afterward. The parameter interval is part of the solution, not optional commentary.</p>`,
      finalResultHtml: raw`<div class="answer-highlight walkthrough-answer-highlight"><p class="question-label">Final result</p>\[x=\begin{cases}\left(\dfrac{25+16w}{80}\right)^2,&-\dfrac{25}{16}\le w\le\dfrac{25}{16},\\[4pt]\text{no real solution},&\text{otherwise.}\end{cases}\]</div>`,
      verificationHtml: raw`<p class="step-text">Let (t=(25+16w)/80). On the retained interval, (0\le t\le5/8) and</p><div class="math-block">\[4t^2-w=\left(\frac54-2t\right)^2.\]</div><p class="step-text">Hence (4\sqrt{4t^2-w}=5-8t), so the candidate satisfies the original equation.</p>`,
      commonMistakeHtml: raw`<p class="step-text">Giving the squared formula for every (w). Squaring cannot remove the original requirement that the right-hand side be non-negative.</p>`
    }),

    "level-3-complex-2022:1d": audited({
      questionHtml: raw`
        <p class="step-text">Find all real values of (p) for which the equation has exactly one real solution.</p>
        <div class="question-math" aria-label="Radical equation">\[x-2\sqrt{x+p}=-5.\]</div>
      `,
      hints: [
        raw`Use (u=\sqrt{x+p}), remembering that (u\ge0).`,
        raw`Substitute (x=u^2-p) and complete the square in (u).`,
        raw`Count only the roots (u=1\pm\sqrt{p-4}) that are non-negative.`
      ],
      guidedSteps: [
        step(
          raw`Use a constrained substitution`,
          raw`The square-root substitution turns the equation into a quadratic while preserving its domain.`,
          raw`<p class="step-text">Let (u=\sqrt{x+p}\ge0), so (x=u^2-p). Then</p><div class="math-block">\[u^2-p-2u=-5\iff(u-1)^2=p-4.\]</div>`
        ),
        step(
          raw`Classify the admissible roots`,
          raw`The algebraic roots must still satisfy (u\ge0).`,
          raw`<p class="step-text">For (p\ge4), write (a=\sqrt{p-4}\). The candidates are (u=1+a) and (u=1-a). The second is admissible exactly when (a\le1), or (p\le5).</p>`
        )
      ],
      checksHtml: raw`<ul class="step-text"><li>(p&lt;4): no real (u).</li><li>(p=4): the two algebraic roots coincide at (u=1), so one real (x).</li><li>(4&lt;p\le5): two distinct non-negative (u)-values, so two real (x)-values.</li><li>(p&gt;5): only (u=1+\sqrt{p-4}) is non-negative, so one real (x).</li></ul>`,
      markReasoningHtml: raw`<p class="step-text">A discriminant calculation alone counts roots of the squared quadratic but does not enforce the non-negativity of the square-root substitution. State (u\ge0) and use it in the count.</p>`,
      finalResultHtml: raw`<div class="answer-highlight walkthrough-answer-highlight"><p class="question-label">Full classification</p>\[\begin{array}{c|c}p&lt;4&0\text{ real solutions}\\p=4&1\\4&lt;p\le5&2\\p&gt;5&1\end{array}\]<p class="step-text">Therefore the requested values giving exactly one real solution are (p=4) or (p&gt;5).</p></div>`,
      verificationHtml: raw`<p class="step-text">The admissible (x)-values are (x=-3\pm2\sqrt{p-4}), with the minus sign present only for (p\le5). Since (x+p=u^2\ge0) and (x-2u=-5), each retained value satisfies the original equation.</p>`,
      commonMistakeHtml: raw`<p class="step-text">Setting a discriminant to zero and concluding (p=4), while overlooking that for (p&gt;5) one quadratic root corresponds to a negative (u) and must be rejected.</p>`
    }),

    "level-3-complex-2020:1c": audited({
      questionHtml: raw`
        <p class="step-text">Solve for (x) in terms of the real parameter (g).</p>
        <div class="question-math" aria-label="Radical equation">\[2\sqrt{x}-5=\sqrt{4x-g}.\]</div>
      `,
      hints: [
        raw`The right-hand side is non-negative, so record a sign condition on (2\sqrt{x}-5).`,
        raw`Square once; the (4x) terms cancel.`,
        raw`Check the resulting parameter restriction by substituting into the original equation.`
      ],
      guidedSteps: [
        step(
          raw`Record the sign before squaring`,
          raw`A square root cannot equal a negative expression.`,
          raw`<div class="math-block">\[2\sqrt{x}-5\ge0\iff\sqrt{x}\ge\frac52.\]</div>`
        ),
        step(
          raw`Square and isolate the root`,
          raw`Squaring is reversible only after retaining the sign condition.`,
          raw`<div class="math-block">\[(2\sqrt{x}-5)^2=4x-g\]\[20\sqrt{x}=25+g\]\[\sqrt{x}=\frac{25+g}{20}.\]</div>`
        )
      ],
      checksHtml: raw`<p class="step-text">The original sign condition requires ((25+g)/20\ge5/2), so (g\ge25). For (g&lt;25), there is no real solution.</p>`,
      markReasoningHtml: raw`<p class="step-text">State the sign forced by the original unsquared equation. The formula obtained after squaring is not valid for every parameter.</p>`,
      finalResultHtml: raw`<div class="answer-highlight walkthrough-answer-highlight"><p class="question-label">Final result</p>\[x=\begin{cases}\left(\dfrac{25+g}{20}\right)^2,&g\ge25,\\[4pt]\text{no real solution},&g&lt;25.\end{cases}\]</div>`,
      verificationHtml: raw`<p class="step-text">Let (t=(25+g)/20\ge5/2). Since (g=20t-25),</p><div class="math-block">\[4t^2-g=(2t-5)^2,\]</div><p class="step-text">and its principal square root is (2t-5). Thus the retained value satisfies the original equation.</p>`,
      commonMistakeHtml: raw`<p class="step-text">Using the squared formula when (g&lt;25), where the original left side has the wrong sign.</p>`
    }),

    "level-3-complex-2021:3d": audited({
      questionHtml: raw`
        <p class="step-text">Solve for (x) in terms of the real parameter (m).</p>
        <div class="question-math" aria-label="Radical equation">\[6\sqrt{2x}-5=6\sqrt{2x+m}.\]</div>
      `,
      hints: [
        raw`Because the right side is non-negative, first constrain (6\sqrt{2x}-5).`,
        raw`Square once and cancel the matching (72x) terms.`,
        raw`Translate the original sign condition into a restriction on (m), then substitute back.`
      ],
      guidedSteps: [
        step(
          raw`Record the sign restriction`,
          raw`The principal square root on the right forces the left side to be non-negative.`,
          raw`<div class="math-block">\[6\sqrt{2x}-5\ge0\iff\sqrt{2x}\ge\frac56.\]</div>`
        ),
        step(
          raw`Square and solve`,
          raw`The common (72x) terms cancel after expansion.`,
          raw`<div class="math-block">\[72x-60\sqrt{2x}+25=72x+36m\]\[\sqrt{2x}=\frac{25-36m}{60}\]\[x=\frac12\left(\frac{25-36m}{60}\right)^2.\]</div>`
        )
      ],
      checksHtml: raw`<p class="step-text">The original sign condition requires ((25-36m)/60\ge5/6), which is equivalent to (m\le-25/36). For larger (m), there is no real solution.</p>`,
      markReasoningHtml: raw`<p class="step-text">Preserve the principal-root sign before squaring and state the resulting parameter domain alongside the formula.</p>`,
      finalResultHtml: raw`<div class="answer-highlight walkthrough-answer-highlight"><p class="question-label">Final result</p>\[x=\begin{cases}\dfrac12\left(\dfrac{25-36m}{60}\right)^2,&m\le-\dfrac{25}{36},\\[5pt]\text{no real solution},&m&gt;-\dfrac{25}{36}.\end{cases}\]</div>`,
      verificationHtml: raw`<p class="step-text">Let (t=(25-36m)/60\ge5/6). Then (2x=t^2) and (2x+m=(t-5/6)^2). Both principal square roots therefore reproduce (6t-5=6(t-5/6)).</p>`,
      commonMistakeHtml: raw`<p class="step-text">Checking only that the formula for (x) is non-negative. The stronger restriction comes from the sign of the original left-hand side.</p>`
    }),

    "level-3-differentiation-2024:2e": audited({
      questionHtml: raw`
        <p class="step-text">The assessment question describes the graph as having a single “turning point” (Q), where (k\ne0).</p>
        <div class="question-math" aria-label="Function">\[y=\frac{xe^{3x}}{2x+k}.\]</div>
        <p class="step-text">Find the (x)-coordinate of (Q), showing the derivatives used.</p>
      `,
      hints: [
        raw`Differentiate and identify the quadratic factor in the numerator.`,
        raw`A single stationary value requires a repeated root of that quadratic.`,
        raw`After finding the repeated root, check the sign of (y') on both sides before calling the point a turning point.`
      ],
      guidedSteps: [
        step(
          raw`Differentiate`,
          raw`The exponential and squared denominator stay positive on the function’s domain, so stationary values come from the quadratic numerator.`,
          raw`<div class="math-block">\[y'=\frac{e^{3x}(6x^2+3kx+k)}{(2x+k)^2}.\]</div>`
        ),
        step(
          raw`Force one stationary value`,
          raw`The numerator quadratic needs one repeated root.`,
          raw`<div class="math-block">\[(3k)^2-4(6)(k)=0\iff k(9k-24)=0.\]</div><p class="step-text">Since (k\ne0), (k=8/3), and</p><div class="math-block">\[6x^2+8x+\frac83=6\left(x+\frac23\right)^2.\]</div>`
        )
      ],
      checksHtml: raw`<p class="step-text">For (k=8/3),</p><div class="math-block">\[y'=\frac{6e^{3x}(x+2/3)^2}{(2x+8/3)^2}\ge0.\]</div><p class="step-text">The derivative is positive on both sides of (x=-2/3), so there is no change from increasing to decreasing or vice versa. The point is a stationary point of inflection, not a genuine turning point.</p>`,
      markReasoningHtml: raw`<p class="step-text">The <a href="https://www.nzqa.govt.nz/nqfdocs/ncea-resource/schedules/2024/91578-ass-2024.pdf" target="_blank" rel="noopener noreferrer">official 2024 AS91578 assessment schedule (PDF, opens in a new tab)</a> uses “turning point” for the single stationary point. Preserve that exam wording when interpreting the question, but use a derivative sign check to classify the graph accurately.</p>`,
      finalResultHtml: raw`<div class="answer-highlight walkthrough-answer-highlight"><p class="question-label">Final result</p>\[x=-\frac23.\]<p class="step-text">This is the single stationary point and, more precisely, a stationary point of inflection.</p></div>`,
      verificationHtml: raw`<p class="step-text">The denominator is non-zero at (x=-2/3), and the factorised derivative is non-negative with equality only there. Numerical points immediately to the left and right both have (y'&gt;0), confirming no turn.</p>`,
      commonMistakeHtml: raw`<p class="step-text">Assuming a repeated root of (y'=0) automatically creates a maximum or minimum. Classification requires a sign check.</p>`
    }),

    "level-3-integration-2023:3e": audited({
      questionHtml: raw`
        <p class="step-text">Consider the implicit differential equation</p>
        <div class="question-math" aria-label="Implicit differential equation">\[(1-x^2)(1+y)y'+(1-x)(1-y^2)=0.\]</div>
        <p class="step-text">Given (y=0) when (x=2), find (y) when (x=6), showing the integration used.</p>
      `,
      hints: [
        raw`Factor (1-x^2) and (1-y^2), then list every factor you cancel.`,
        raw`Solve the reduced equation on an interval where the cancelled factors are non-zero.`,
        raw`Check where the resulting branch reaches a cancelled factor before claiming uniqueness at (x=6).`
      ],
      guidedSteps: [
        step(
          raw`Factor and record exclusions`,
          raw`Cancellation simplifies the equation but can discard singular states.`,
          raw`<div class="math-block">\[(1-x)(1+y)\bigl((1+x)y'+1-y\bigr)=0.\]</div><p class="step-text">Cancelling assumes (x\ne1) and (y\ne-1). On that regular branch, ((1+x)y'+1-y=0).</p>`
        ),
        step(
          raw`Integrate the regular branch`,
          raw`Separate (1-y) from (1+x) and use the initial condition.`,
          raw`<div class="math-block">\[\frac{dy}{1-y}=-\frac{dx}{1+x}\]\[-\ln|1-y|=-\ln|1+x|+C.\]</div><p class="step-text">Using ((2,0)) and the positive branch gives</p><div class="math-block">\[1-y=\frac{1+x}{3},\qquad y=\frac{2-x}{3}.\]</div>`
        )
      ],
      checksHtml: raw`<p class="step-text">The derived branch reaches the cancelled state (y=-1) at (x=5). At that state the original implicit equation becomes (0=0) and does not determine (y'). The formula (y=(2-x)/3) is a valid smooth continuation through (x=5), but that continuation is not uniquely forced by the original implicit equation without an additional continuation assumption.</p>`,
      markReasoningHtml: raw`<p class="step-text">Name the excluded factors when cancelling and distinguish the regular reduced equation from the original implicit equation at its singular state.</p>`,
      finalResultHtml: raw`<div class="answer-highlight walkthrough-answer-highlight"><p class="question-label">Smooth-continuation result</p>\[y(6)=-\frac43.\]<p class="step-text">This is the value on the derived smooth branch; it is not a uniquely forced value of the original implicit problem beyond (x=5) without the continuation assumption.</p></div>`,
      verificationHtml: raw`<p class="step-text">For (y=(2-x)/3), (y'=-1/3). Direct substitution gives two terms</p><div class="math-block">\[-\frac{(1-x)(1+x)(5-x)}9\quad\text{and}\quad\frac{(1-x)(1+x)(5-x)}9,\]</div><p class="step-text">which cancel for every (x), including the smooth continuation through (x=5).</p>`,
      commonMistakeHtml: raw`<p class="step-text">Cancelling (1-x) and (1+y) without stating (x\ne1), (y\ne-1), then treating the reduced equation as globally equivalent to the original one.</p>`
    }),

    "level-3-differentiation-2023:3e": audited({
      questionHtml: raw`
        <p class="step-text">For (a&gt;0), show that the catenary</p>
        <div class="question-math" aria-label="Catenary function">\[y=\frac a2\left(e^{x/a}+e^{-x/a}\right)\]</div>
        <p class="step-text">satisfies (ay''=\sqrt{1+(y')^2}).</p>
      `,
      hints: [
        raw`Differentiate the two exponential terms twice.`,
        raw`Expand ((ay'')^2) and (1+(y')^2) using (e^{x/a}e^{-x/a}=1).`,
        raw`A squared identity is not enough: determine the sign of (ay'').`
      ],
      guidedSteps: [
        step(
          raw`Find the derivatives`,
          raw`Differentiating the negative exponent twice makes the second-derivative terms add.`,
          raw`<div class="math-block">\[y'=\frac12\left(e^{x/a}-e^{-x/a}\right),\qquad ay''=\frac12\left(e^{x/a}+e^{-x/a}\right).\]</div>`
        ),
        step(
          raw`Establish the squared identity`,
          raw`Both sides have the same expansion after using (e^{x/a}e^{-x/a}=1).`,
          raw`<div class="math-block">\[(ay'')^2=\frac14\left(e^{2x/a}+2+e^{-2x/a}\right)=1+(y')^2.\]</div>`
        )
      ],
      checksHtml: raw`<p class="step-text">Because (a&gt;0) and both exponential terms are positive,</p><div class="math-block">\[ay''=\frac{e^{x/a}+e^{-x/a}}2&gt;0.\]</div><p class="step-text">The left side is therefore the positive square root of its square.</p>`,
      markReasoningHtml: raw`<p class="step-text">After matching the squares, explicitly justify the positive root. Without the sign line, the squared identity allows both signs.</p>`,
      finalResultHtml: raw`<div class="answer-highlight walkthrough-answer-highlight"><p class="question-label">Final result</p>\[ay''=\sqrt{1+(y')^2}.\]</div>`,
      verificationHtml: raw`<p class="step-text">Substituting the displayed (y') and (y'') gives equal squares, while (ay''&gt;0) and the principal square root is non-negative. This reconnects the algebra to the original unsquared differential equation.</p>`,
      commonMistakeHtml: raw`<p class="step-text">Concluding (ay''=\sqrt{1+(y')^2}) from equality of squares without ruling out the negative root.</p>`
    }),

    "level-3-integration-2025:1e": audited({
      questionHtml: raw`
        <p class="step-text">Consider the differential equation</p>
        <div class="question-math" aria-label="Differential equation">\[y-xy-(1+x)y'=0.\]</div>
        <p class="step-text">Given (y=3) when (x=0), find (y) when (x=2), showing the integration used.</p>
      `,
      hints: [
        raw`Rearrange to (y'/y=(1-x)/(1+x)), recording the values excluded by division.`,
        raw`Integrate to (\ln|y|), then exponentiate to an absolute-value equation before choosing a sign.`,
        raw`Use the initial condition and the interval containing (x=0) to select the branch.`
      ],
      guidedSteps: [
        step(
          raw`Separate on a regular interval`,
          raw`Division by (y(1+x)) requires (y\ne0) and (x\ne-1).`,
          raw`<div class="math-block">\[\frac{dy}{y}=\frac{1-x}{1+x}\,dx=\left(-1+\frac{2}{1+x}\right)dx.\]</div><p class="step-text">The zero solution excluded by division cannot satisfy (y(0)=3).</p>`
        ),
        step(
          raw`Integrate and restore the absolute value`,
          raw`The logarithm records magnitude, so exponentiation must initially keep both signs.`,
          raw`<div class="math-block">\[\ln|y|=-x+2\ln|1+x|+C\]\[|y|=Ae^{-x}(1+x)^2,\qquad A&gt;0.\]</div>`
        ),
        step(
          raw`Use the initial condition`,
          raw`The solution is positive at (x=0), selecting the positive branch on the interval containing that point.`,
          raw`<div class="math-block">\[A=3,\qquad y=3e^{-x}(1+x)^2.\]</div>`
        )
      ],
      checksHtml: raw`<p class="step-text">For the separated explicit equation, the relevant interval containing the initial point is (x&gt;-1). On this interval the chosen solution is positive, so it neither crosses (y=0) nor changes logarithmic branch.</p>`,
      markReasoningHtml: raw`<p class="step-text">Show (ln|y|), write the absolute-value equation after exponentiating, and explain how the initial condition selects the positive branch.</p>`,
      finalResultHtml: raw`<div class="answer-highlight walkthrough-answer-highlight"><p class="question-label">Final result</p>\[y(2)=3e^{-2}(3)^2=\frac{27}{e^2}\approx3.654.\]</div>`,
      verificationHtml: raw`<p class="step-text">Differentiating (y=3e^{-x}(1+x)^2) gives (y'=3e^{-x}(1+x)(1-x)). Therefore ((1+x)y'=y(1-x)), which is the original equation, and (y(0)=3).</p>`,
      commonMistakeHtml: raw`<p class="step-text">Replacing (ln|y|) immediately by (ln y) without explaining the sign, or forgetting that division by (y) excluded the zero solution.</p>`
    })
  };

  function polarAudit(options) {
    const parameter = options.parameter;
    return audited({
      questionHtml: options.questionHtml,
      hints: [
        raw`Check the case (${parameter}=0) before writing any polar argument.`,
        raw`For (${parameter}\ne0), put the non-zero right-hand side into polar form and use the full root-angle formula.`,
        raw`Power a representative root to verify it, and state whether the listed roots are distinct.`
      ],
      guidedSteps: [
        step(
          raw`Handle the zero parameter first`,
          raw`Polar arguments describe non-zero numbers; zero needs its own case.`,
          raw`<p class="step-text">When (${parameter}=0), the equation becomes (${options.zeroEquation}). Its only distinct root is (z=0), with multiplicity ${options.degree}. Zero has no unique polar argument, so an equally spaced polar-root list does not apply.</p>`
        ),
        step(
          raw`Solve the non-zero case`,
          raw`Now the right-hand side is non-zero, so De Moivre’s root rule produces distinct roots.`,
          options.nonzeroWorkingHtml
        )
      ],
      checksHtml: raw`<p class="step-text">The conclusion must be piecewise: one repeated zero root when (${parameter}=0), and ${options.degree} distinct non-zero roots only when (${parameter}\ne0).</p>`,
      markReasoningHtml: raw`<p class="step-text">State the zero case before assigning an argument, then show the complete root counter range in the non-zero case.</p>`,
      finalResultHtml: options.finalResultHtml,
      verificationHtml: options.verificationHtml,
      commonMistakeHtml: raw`<p class="step-text">Substituting (${parameter}=0) into a non-zero polar-root formula and calling the repeated value three or four distinct roots.</p>`
    });
  }

  walkthroughs["level-3-complex-2020:3d"] = polarAudit({
    parameter: "k",
    degree: 4,
    zeroEquation: raw`z^4=0`,
    questionHtml: raw`<p class="step-text">Solve the equation, where (k) is a real constant. Give the solution(s) in polar form when applicable.</p><div class="question-math" aria-label="Fourth-power equation">\[z^4=-16k^8.\]</div>`,
    nonzeroWorkingHtml: raw`<div class="math-block">\[-16k^8=16k^8\operatorname{cis}(\pi+2n\pi)\]\[z=2k^2\operatorname{cis}\left(\frac\pi4+\frac{n\pi}{2}\right),\quad n=0,1,2,3.\]</div>`,
    finalResultHtml: raw`<div class="answer-highlight walkthrough-answer-highlight"><p class="question-label">Final result</p>\[\begin{cases}z=0\text{ only (multiplicity 4)},&k=0,\\z=2k^2\operatorname{cis}\left(\frac\pi4+\frac{n\pi}{2}\right),\ n=0,1,2,3,&k\ne0.\end{cases}\]</div>`,
    verificationHtml: raw`<p class="step-text">For (k\ne0), raising any listed value to the fourth power gives (16k^8\operatorname{cis}(\pi+2n\pi)=-16k^8). The four arguments differ by (\pi/2), so the non-zero roots are distinct.</p>`
  });

  walkthroughs["level-3-complex-2021:2d"] = polarAudit({
    parameter: "k",
    degree: 3,
    zeroEquation: raw`z^3=0`,
    questionHtml: raw`<p class="step-text">Solve the equation, where (k) is a real constant. Give the solution(s) in polar form when applicable.</p><div class="question-math" aria-label="Cubic equation">\[z^3=k^6+k^6i.\]</div>`,
    nonzeroWorkingHtml: raw`<div class="math-block">\[k^6(1+i)=\sqrt2\,k^6\operatorname{cis}\frac\pi4\]\[z=2^{1/6}k^2\operatorname{cis}\left(\frac\pi{12}+\frac{2n\pi}{3}\right),\quad n=0,1,2.\]</div>`,
    finalResultHtml: raw`<div class="answer-highlight walkthrough-answer-highlight"><p class="question-label">Final result</p>\[\begin{cases}z=0\text{ only (multiplicity 3)},&k=0,\\z=2^{1/6}k^2\operatorname{cis}\left(\frac\pi{12}+\frac{2n\pi}{3}\right),\ n=0,1,2,&k\ne0.\end{cases}\]</div>`,
    verificationHtml: raw`<p class="step-text">Cubing a non-zero listed root gives (\sqrt2\,k^6\operatorname{cis}(\pi/4+2n\pi)=k^6(1+i)). The three arguments differ by (2\pi/3).</p>`
  });

  walkthroughs["level-3-complex-2022:3c"] = polarAudit({
    parameter: "k",
    degree: 3,
    zeroEquation: raw`z^3=0`,
    questionHtml: raw`<p class="step-text">Solve the equation, where (k) is a real constant. Give the solution(s) in polar form when applicable.</p><div class="question-math" aria-label="Cubic equation">\[z^3+k^6i=0.\]</div>`,
    nonzeroWorkingHtml: raw`<div class="math-block">\[z^3=k^6\operatorname{cis}\left(-\frac\pi2+2n\pi\right)\]\[z=k^2\operatorname{cis}\left(-\frac\pi6+\frac{2n\pi}{3}\right),\quad n=0,1,2.\]</div>`,
    finalResultHtml: raw`<div class="answer-highlight walkthrough-answer-highlight"><p class="question-label">Final result</p>\[\begin{cases}z=0\text{ only (multiplicity 3)},&k=0,\\z=k^2\operatorname{cis}\left(-\frac\pi6+\frac{2n\pi}{3}\right),\ n=0,1,2,&k\ne0.\end{cases}\]</div>`,
    verificationHtml: raw`<p class="step-text">Cubing a non-zero listed root gives (k^6\operatorname{cis}(-\pi/2+2n\pi)=-k^6i), so (z^3+k^6i=0). The three roots are distinct.</p>`
  });

  walkthroughs["level-3-complex-2023:2d"] = polarAudit({
    parameter: "m",
    degree: 3,
    zeroEquation: raw`z^3=0`,
    questionHtml: raw`<p class="step-text">Solve the equation, where (m) is a real constant. Give the solution(s) in polar form when applicable.</p><div class="question-math" aria-label="Cubic equation">\[z^3+64m^{12}=0.\]</div>`,
    nonzeroWorkingHtml: raw`<div class="math-block">\[z^3=64m^{12}\operatorname{cis}(\pi+2n\pi)\]\[z=4m^4\operatorname{cis}\left(\frac\pi3+\frac{2n\pi}{3}\right),\quad n=0,1,2.\]</div>`,
    finalResultHtml: raw`<div class="answer-highlight walkthrough-answer-highlight"><p class="question-label">Final result</p>\[\begin{cases}z=0\text{ only (multiplicity 3)},&m=0,\\z=4m^4\operatorname{cis}\left(\frac\pi3+\frac{2n\pi}{3}\right),\ n=0,1,2,&m\ne0.\end{cases}\]</div>`,
    verificationHtml: raw`<p class="step-text">Cubing a non-zero listed root gives (64m^{12}\operatorname{cis}(\pi+2n\pi)=-64m^{12}). The three roots are distinct.</p>`
  });

  walkthroughs["level-3-complex-2024:3d"] = polarAudit({
    parameter: "k",
    degree: 4,
    zeroEquation: raw`z^4=0`,
    questionHtml: raw`<p class="step-text">Solve the equation, where (k) is a real constant. Give the solution(s) in polar form when applicable.</p><div class="question-math" aria-label="Fourth-power equation">\[z^4+81k^8=0.\]</div>`,
    nonzeroWorkingHtml: raw`<div class="math-block">\[z^4=81k^8\operatorname{cis}(\pi+2n\pi)\]\[z=3k^2\operatorname{cis}\left(\frac\pi4+\frac{n\pi}{2}\right),\quad n=0,1,2,3.\]</div>`,
    finalResultHtml: raw`<div class="answer-highlight walkthrough-answer-highlight"><p class="question-label">Final result</p>\[\begin{cases}z=0\text{ only (multiplicity 4)},&k=0,\\z=3k^2\operatorname{cis}\left(\frac\pi4+\frac{n\pi}{2}\right),\ n=0,1,2,3,&k\ne0.\end{cases}\]</div>`,
    verificationHtml: raw`<p class="step-text">Raising a non-zero listed root to the fourth power gives (81k^8\operatorname{cis}(\pi+2n\pi)=-81k^8). The four roots are distinct.</p>`
  });

  window.CALC_NZ_AUDIT_WALKTHROUGHS = walkthroughs;
  window.CALC_NZ_AUDIT_REVIEW_STATUS = REVIEW_STATUS;
}());
